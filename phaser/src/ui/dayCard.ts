/**
 * The festival-week day card — the shared visual language behind both
 * `LocationSelectScene` (the day-start picker) and `CalendarScene` (the
 * read-only week overview). Both draw the same five gold-framed parchment
 * pages on the celestial-book backdrop; before this module they each owned a
 * copy of the frame math and drifted (the calendar was still drawing old dark
 * `COLOR.panel` boxes while the picker had moved to art-backed parchment). This
 * is the ONE place that look lives, so they can never drift again.
 *
 * What is shared here is the CARD, not the scene: the frame-height calc, the
 * art-backed framed panel, the TODAY emphasis (bloom + double rim + tab), the
 * static past-day thumbnail, the INTERACTIVE start button (`addThumbButton`) and
 * the canonical start list (`DAY_STARTS`). What is NOT shared is each scene's own
 * chrome — the picker's routing stays in `LocationSelectScene`, the calendar's
 * header/close chrome stays in `CalendarScene`. One card, two views.
 *
 * `addThumbButton` and `DAY_STARTS` moved here 2026-08-23 (calendar parity, Roc's
 * ruling: ONE calendar, active as a location picker only at the start of a new
 * day, read-only otherwise). Before that the button lived privately in
 * `LocationSelectScene` and the calendar had no way to offer a pick at all —
 * which is exactly the reported bug ("Home Hub calendar can't pick forest/town").
 *
 * Depths, not containers: these scenes are flat (no `layer` container), so every
 * draw sets an explicit `setDepth` and children order back-to-front by that
 * value. The bloom sits behind the frame (depth < 2), the frame at 2, and labels
 * / rim / tab / thumbnails above it — see each helper's chosen depths.
 */

import Phaser from "phaser";
import { COLOR, FONT, filigreeCorners } from "./theme";

const FRAME_KEY = "ui:card-frame";

/**
 * The two canonical day starts, in the order they read on the card (GDD
 * `08-levels.md`: the town "Square" and "Forager's Clearing", both *(start)*;
 * fixed to exactly two by `03-core-loop.md`'s 2026-08-19 ruling). `name` is
 * matched against an ink move-choice display so a thumbnail wires to the real
 * choice; `screenId` keys the `bg:<screenId>` backdrop `PreloadScene` loaded.
 *
 * ONE list, shared by the day-start picker and the calendar — they each kept a
 * copy before (`LocationSelectScene.STARTS` / `CalendarScene.LOCATION_NAMES`).
 */
export const DAY_STARTS: ReadonlyArray<{ screenId: string; name: string }> = [
  { screenId: "T1", name: "Town Square" },
  { screenId: "F1", name: "Forager's Clearing" },
];

/** Display name for a recorded pick's thumbnail label; falls back to the raw id
 * for any screen outside the two canonical starts (an older save, a cut start). */
export function locationName(screenId: string): string {
  return DAY_STARTS.find((s) => s.screenId.toLowerCase() === screenId.toLowerCase())?.name ?? screenId;
}

/**
 * `card-frame.jpg` is a parchment sheet on a green backdrop with an ornate gold
 * double-rule frame printed inside. These fractions trim the green + torn deckle
 * off each edge so only the framed parchment shows; the resulting sheet is ~0.64
 * aspect, which sets the day-card height from its width. Measured off the asset
 * (green flat edge ≈6.6% x / ≈4.4% y; kept a little margin so torn corners of
 * the paper do not leave a green fleck).
 */
export const FRAME_TRIM_X = 0.07;
export const FRAME_TRIM_Y = 0.05;
/** Inner opening of the printed frame, as a fraction of the CARD rect, so labels
 * and thumbnails land inside the scrollwork rather than over it. */
export const FRAME_PAD_X = 0.1;
export const FRAME_PAD_Y = 0.09;

/**
 * The day-card height for a given width, derived from `card-frame.jpg` so the
 * framed parchment keeps its aspect (no stretch) once the green backdrop is
 * trimmed off. Falls back to a sane portrait ratio if the art is missing (the
 * procedural fallback card uses it too).
 */
export function cardFrameHeight(scene: Phaser.Scene, w: number): number {
  if (scene.textures.exists(FRAME_KEY)) {
    const src = scene.textures.get(FRAME_KEY).getSourceImage() as { width: number; height: number };
    const usableW = src.width * (1 - 2 * FRAME_TRIM_X);
    const usableH = src.height * (1 - 2 * FRAME_TRIM_Y);
    return Math.round((usableH / usableW) * w);
  }
  return Math.round(w * 1.56);
}

/**
 * The framed-panel background for one day card. ART-BACKED: `card-frame.jpg`
 * (an ornate gold double-rule frame printed on parchment) is fit behind the
 * card so its scrollwork becomes the panel border and its parchment becomes the
 * surface. The asset sits on a green backdrop with a torn deckle edge, so the
 * visible region is the centered `FRAME_TRIM_*` inset — cropped in texture
 * space with `Image.setCrop` (WebGL-safe; Phaser 4 no-ops `Graphics.setMask`).
 * Returns the procedural fallback (and never null in practice) if the art is
 * absent.
 */
export function addCardFrame(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
): Phaser.GameObjects.Image {
  if (!scene.textures.exists(FRAME_KEY)) return addProceduralCard(scene, cx, cy, w, h);
  const img = scene.add.image(cx, cy, FRAME_KEY).setDepth(2);
  const sw = img.width * (1 - 2 * FRAME_TRIM_X);
  const sh = img.height * (1 - 2 * FRAME_TRIM_Y);
  // Fill the card width with the trimmed sheet; height follows from its aspect
  // (the caller sized the card to match, so nothing stretches).
  img.setScale(w / sw);
  img.setCrop(img.width * FRAME_TRIM_X, img.height * FRAME_TRIM_Y, sw, sh);
  return img;
}

/**
 * Fallback framed card when `card-frame.jpg` is missing: a procedural parchment
 * panel — `canvas`→`canvas2` vertical gradient, a thin `canvasEdge` gold rule,
 * and `filigreeCorners()` gold brackets (§5.2 Parchment card + §6). Drawn to a
 * one-off texture so the gradient is a single image rather than per-frame fills.
 */
function addProceduralCard(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
): Phaser.GameObjects.Image {
  const texKey = `card-parchment:${w}x${h}`;
  if (!scene.textures.exists(texKey)) {
    const g = scene.make.graphics({ x: 0, y: 0 }, false);
    const steps = Math.max(2, Math.floor(h / 4));
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const col = Phaser.Display.Color.Interpolate.ColorWithColor(
        Phaser.Display.Color.ValueToColor(COLOR.canvas),
        Phaser.Display.Color.ValueToColor(COLOR.canvas2Num),
        steps - 1,
        i,
      );
      g.fillStyle(Phaser.Display.Color.GetColor(col.r, col.g, col.b), 1);
      g.fillRect(0, Math.floor(t * h), w, Math.ceil(h / steps) + 1);
    }
    g.lineStyle(2, COLOR.canvasEdgeNum, 1);
    g.strokeRect(1, 1, w - 2, h - 2);
    g.generateTexture(texKey, w, h);
    g.destroy();
  }
  const panel = scene.add.image(cx, cy, texKey).setDepth(2);
  filigreeCorners(scene, cx, cy, w, h, 2.5); // already added to the scene
  return panel;
}

/**
 * The TODAY emphasis on a day card — the "act here / you are here" marker that
 * lifts today's page off the recessed rest of the week. Three layers, drawn at
 * their own depths so ordering holds regardless of call site:
 *   - a warm ember bloom BEHIND the frame (depths 1.4/1.5) — two soft wide rects
 *     that read as a glow, not a second border;
 *   - a gold outer + brighter ember inner rim (depths 2.8/3) ABOVE the frame — a
 *     distinctly heavier border than the faded other days;
 *   - a gold "TODAY" tab clipped to the card's top edge (depths 3.4/3.5), dark
 *     text on §14 gold (7.7:1), the unambiguous marker.
 * Call once per today card; the frame itself is drawn separately at depth 2.
 */
export function addTodayEmphasis(scene: Phaser.Scene, cx: number, cy: number, w: number, h: number): void {
  scene.add.rectangle(cx, cy, w + 64, h + 64, COLOR.emberNum, 0.12).setDepth(1.4);
  scene.add.rectangle(cx, cy, w + 34, h + 34, COLOR.emberNum, 0.2).setDepth(1.5);

  scene.add.rectangle(cx, cy, w + 12, h + 12).setStrokeStyle(3, COLOR.goldNum, 0.9).setDepth(2.8);
  scene.add.rectangle(cx, cy, w + 3, h + 3).setStrokeStyle(5, COLOR.emberNum, 1).setDepth(3);

  const tabW = 132;
  const tabH = 42;
  const tabY = cy - h / 2 - 12;
  scene.add
    .rectangle(cx, tabY, tabW, tabH, COLOR.goldNum, 1)
    .setStrokeStyle(2, COLOR.emberNum, 1)
    .setDepth(3.4);
  scene.add
    // A tab label, not a title — mono, like every other tab (§14 §7).
    .text(cx, tabY, "TODAY", { fontFamily: FONT.mono, fontSize: "22px", color: COLOR.onAccent })
    .setOrigin(0.5)
    .setDepth(3.5);
}

/**
 * The location's `bg:<screenId>` backdrop, cover-fit into a `w`x`h` cell.
 * Cropped in texture space with `Image.setCrop` (WebGL-safe) rather than
 * `Graphics.setMask`, which Phaser 4 silently no-ops. No-op if the texture is
 * absent, so a missing manifest backdrop leaves the framed panel showing
 * rather than throwing.
 */
export function addCoverImage(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  key: string,
  depth: number,
): void {
  if (!scene.textures.exists(key)) return;
  const img = scene.add.image(cx, cy, key).setDepth(depth);
  const scale = Math.max(w / img.width, h / img.height);
  img.setScale(scale);
  const cropW = w / scale;
  const cropH = h / scale;
  img.setCrop((img.width - cropW) / 2, (img.height - cropH) / 2, cropW, cropH);
}

/**
 * A PAST day's record: the location it was begun at, drawn as one static,
 * non-interactive thumbnail. The same cover-crop and framing language a picker
 * uses for a live start, but dimmed (dusk frame, muted label) to read as history
 * rather than a choice, and with no pointer — a past day cannot be re-picked.
 * Children added back-to-front by depth (panel → image → scrim → label → border).
 * Returns the base panel so a caller can `popIn` it.
 */
export function addThumbImage(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  screenId: string,
  name: string,
): Phaser.GameObjects.Rectangle {
  const panel = scene.add.rectangle(cx, cy, w, h, COLOR.panel, 1).setDepth(4);
  addCoverImage(scene, cx, cy, w, h, `bg:${screenId}`, 5);
  scene.add.rectangle(cx, cy + h / 2 - 22, w, 44, COLOR.night, 0.72).setDepth(6);
  scene.add
    .text(cx, cy + h / 2 - 22, name, {
      fontFamily: FONT.display,
      fontSize: "20px",
      color: COLOR.muted,
      align: "center",
      wordWrap: { width: w - 20 },
    })
    .setOrigin(0.5)
    .setDepth(7);
  scene.add.rectangle(cx, cy, w, h).setStrokeStyle(2, COLOR.duskNum, 0.7).setDepth(8);
  return panel;
}

/**
 * A LIVE start: the location's `bg:<screenId>` backdrop, cover-fit into a
 * gold-framed cell, clickable to begin the day there. The interactive twin of
 * `addThumbImage` — same framing language, but lit (gold rule, gold label,
 * ember hover) rather than dimmed, because this one is a choice.
 *
 * The backdrop is cover-cropped in texture space (`addCoverImage` → `setCrop`)
 * rather than `Graphics.setMask`, which Phaser 4 silently no-ops in WebGL. The
 * filled panel underneath both frames the crop and carries the pointer: ONLY it
 * is interactive, so the image / scrim / label / border stacked over it are
 * plain visuals that never intercept the click. Children are added back-to-front
 * by depth (panel 4 → image 5 → scrim 6 → label 7 → border 8) — matching
 * `addThumbImage` exactly, so a live and a past card never sit at odd depths.
 *
 * Returns the interactive panel so the caller can `popIn` it.
 */
export function addThumbButton(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  screenId: string,
  name: string,
  onPick: () => void,
): Phaser.GameObjects.Rectangle {
  const hit = scene.add
    .rectangle(cx, cy, w, h, COLOR.panel, 1)
    .setDepth(4)
    .setInteractive({ useHandCursor: true });

  addCoverImage(scene, cx, cy, w, h, `bg:${screenId}`, 5);

  scene.add.rectangle(cx, cy + h / 2 - 22, w, 44, COLOR.night, 0.72).setDepth(6);
  const label = scene.add
    .text(cx, cy + h / 2 - 22, name, {
      fontFamily: FONT.display,
      fontSize: "21px",
      color: COLOR.gold,
      align: "center",
      wordWrap: { width: w - 20 },
    })
    .setOrigin(0.5)
    .setDepth(7);

  const frame = scene.add.rectangle(cx, cy, w, h).setStrokeStyle(2, COLOR.goldNum, 0.9).setDepth(8);

  hit.on("pointerover", () => {
    frame.setStrokeStyle(3, COLOR.emberNum, 1);
    label.setColor(COLOR.ember);
  });
  hit.on("pointerout", () => {
    frame.setStrokeStyle(2, COLOR.goldNum, 0.9);
    label.setColor(COLOR.gold);
  });
  hit.on("pointerdown", onPick);

  return hit;
}
