// One-off, sibling to `key-black.mjs`: the Home Hub diorama is painted as a
// floating cut-out on a flat cream ground (`home-hub-diorama.png`). In the
// Hub that ground reads as a white page behind the room — Roc, 2026-08-23:
// "we want to get the white background to be black."
//
// No crop fixes it. The room's footprint is a diamond, so every 16:9 window
// onto it clips a cream corner no matter how far in the view zooms; the
// default zoom (`ROOM_ZOOM_DEFAULT`) clears the edges and still leaves a
// wedge at the lower right. So the ground itself is repainted, once, offline.
//
// WHY A FLOOD FILL AND NOT A LUMINANCE THRESHOLD. `key-black.mjs` can key on
// luminance alone because its portraits sit on pure black and contain nothing
// that dark. This art does contain near-cream: the sunlit window panes, the
// lit floor tiles, the pale stone. A threshold punches holes through all of
// them. The ground is instead identified by what it actually is — the region
// CONNECTED to the image border — so an enclosed pale area is never reached.
//
// Usage: node tools/key-diorama-ground.mjs [in.png] [out.png]

import sharp from "sharp";

const IN = process.argv[2] ?? "../lantern-projects/v01/images/home-hub-diorama.png";
const OUT = process.argv[3] ?? "../lantern-projects/v01/images/home-hub-diorama-dark.png";

/** `COLOR.night` / `nightHex` from `src/ui/theme.ts` — the token every other
 * dark ground in this game is painted with, not a fresh black. */
const NIGHT = [0x14, 0x11, 0x0c];
/** Max per-channel distance from the sampled ground colour that still counts
 * as ground. Generous enough to swallow the paper grain in the flat area,
 * tight enough to stop at the room's inked outline. */
const TOL = 30;
/** Feather radius for the mask, in pixels — the cut-out edge is
 * anti-aliased, so a hard mask leaves a bright one-pixel halo tracing the
 * whole room. Blurring the MASK (not the image) is what softens it. */
const FEATHER = 1.2;

const { data, info } = await sharp(IN).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;
const at = (x, y) => (y * width + x) * channels;

// Ground reference: the mean of the four corners. Sampling rather than
// hard-coding keeps this usable if the art is ever re-exported with a
// slightly different paper tone.
const corners = [
  at(0, 0),
  at(width - 1, 0),
  at(0, height - 1),
  at(width - 1, height - 1),
];
const ref = [0, 1, 2].map((c) => Math.round(corners.reduce((s, i) => s + data[i + c], 0) / corners.length));

const isGround = (i) =>
  Math.abs(data[i] - ref[0]) <= TOL &&
  Math.abs(data[i + 1] - ref[1]) <= TOL &&
  Math.abs(data[i + 2] - ref[2]) <= TOL;

// Flood fill inward from every border pixel. An explicit stack, not
// recursion — this is a ~4M pixel image and a recursive fill blows the call
// stack long before it finishes.
const mask = new Uint8Array(width * height);
const stack = [];
const push = (x, y) => {
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  const p = y * width + x;
  if (mask[p]) return;
  if (!isGround(at(x, y))) return;
  mask[p] = 1;
  stack.push(x, y);
};
for (let x = 0; x < width; x++) {
  push(x, 0);
  push(x, height - 1);
}
for (let y = 0; y < height; y++) {
  push(0, y);
  push(width - 1, y);
}
while (stack.length) {
  const y = stack.pop();
  const x = stack.pop();
  push(x + 1, y);
  push(x - 1, y);
  push(x, y + 1);
  push(x, y - 1);
}

const filled = mask.reduce((s, v) => s + v, 0);

// Feather the mask, then blend the original toward night by it. Read the
// blur's OWN channel count back rather than assuming it stayed 1: sharp is
// free to hand back a 3-channel buffer here, and indexing a 3-channel buffer
// with a 1-channel stride samples a sliding offset — which shows up as
// horizontal banding across the whole repainted area, not as an error.
const { data: soft, info: softInfo } = await sharp(Buffer.from(mask.map((v) => v * 255)), {
  raw: { width, height, channels: 1 },
})
  .blur(FEATHER)
  .raw()
  .toBuffer({ resolveWithObject: true });
const softStride = softInfo.channels;

const out = Buffer.alloc(width * height * 4);
for (let p = 0, i = 0, o = 0; p < width * height; p++, i += channels, o += 4) {
  const m = soft[p * softStride] / 255;
  for (let c = 0; c < 3; c++) out[o + c] = Math.round(data[i + c] * (1 - m) + NIGHT[c] * m);
  out[o + 3] = channels === 4 ? data[i + 3] : 255;
}

// Opaque output, so drop the alpha channel and squeeze: at the default
// settings the derived file came out 40% LARGER than the 5.5MB source, and
// first-load time is already a known complaint (`PreloadScene` pulls every
// backdrop up front). Max compression on RGB lands it under the original.
await sharp(out, { raw: { width, height, channels: 4 } })
  .removeAlpha()
  .png({ compressionLevel: 9, effort: 10 })
  .toFile(OUT);
console.log(
  `keyed ${IN} -> ${OUT}  (${width}x${height}, ground ref rgb(${ref}), ${((filled / (width * height)) * 100).toFixed(1)}% repainted)`,
);
