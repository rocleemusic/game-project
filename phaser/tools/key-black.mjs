// One-off: portrait PNGs were exported onto solid black with no alpha
// channel. Key pure/near-black out to real transparency (RGBA), with a short
// luminance ramp so the cutout edge stays anti-aliased instead of jagged.
import sharp from "sharp";
import { readdirSync } from "fs";

const DIR = process.argv[2];
const LOW = 10; // below this luminance -> fully transparent
const HIGH = 40; // above this luminance -> fully opaque

const files = readdirSync(DIR).filter((f) => f.endsWith(".png"));
for (const file of files) {
  const path = `${DIR}/${file}`;
  const img = sharp(path);
  const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  const out = Buffer.alloc(width * height * 4);
  for (let i = 0, p = 0; i < data.length; i += channels, p += 4) {
    const r = data[i], g = data[i + 1], b = data[i + 2];
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    let alpha;
    if (lum <= LOW) alpha = 0;
    else if (lum >= HIGH) alpha = 255;
    else alpha = Math.round(((lum - LOW) / (HIGH - LOW)) * 255);
    out[p] = r;
    out[p + 1] = g;
    out[p + 2] = b;
    out[p + 3] = alpha;
  }
  await sharp(out, { raw: { width, height, channels: 4 } }).png().toFile(path);
  console.log("keyed:", file);
}
