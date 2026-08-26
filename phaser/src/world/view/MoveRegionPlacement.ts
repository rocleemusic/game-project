/**
 * Where a MOVE region goes. Pure arithmetic — no Phaser, no DOM.
 *
 * T14 §1 (`plans/2026-08-23-hud-relayout-ruling.md`, wireframe
 * `tools/screen-flow/mockups/hud-relayout-wireframe.html#explore`): "Movement
 * is not a bar concern at all: you walk by clicking the screen." The `[Go to
 * X]` / `[Begin at X]` pills retire; each exit becomes a dashed, clickable
 * box drawn on the painting.
 *
 * A MOVE REGION IS NOT AN EXAMINE REGION. `HotspotPlacement.planRegionHotspots`
 * already plans the authored examinables (`regions.json`'s `screens` map) —
 * gold boxes that show a tooltip and touch no game state. A move region is a
 * different verb (click-to-walk, spends a move, can be gated) drawn in a
 * different color (`dusk`, per the wireframe's `.move-region`), so it reads
 * from its OWN authored map (`regions.json`'s `moves`) and never shares an id
 * space with the examinables. Conflating the two lists would make "click the
 * barn door" ambiguous between "look at it" and "walk through it."
 *
 * ---------------------------------------------------------------------------
 * THE FALLBACK IS LOAD-BEARING — SAME WARNING AS `HotspotPlacement`.
 * ---------------------------------------------------------------------------
 *
 * ZERO screens have authored move geometry today (`regions.json`'s `moves` map
 * is empty; even the examinables only cover a handful of screens — GAPS.md
 * G14). Retiring the traversal pills without a fallback would leave the game
 * with no way to walk anywhere at all. So an unauthored exit still gets a real
 * dashed box: `planMoveRegions` lays the unauthored ones out along the left and
 * right margins, alternating sides and stacking down a band that clears the
 * header plaque, the HUD bar and the remaining choice-pill row. The layout is a
 * pure function of the exit COUNT and its index, so it is stable across
 * re-renders and identical for the headless walker.
 *
 * PINNED VS PAINTED. An authored rect is a fraction OF THE PICTURE (the same
 * contract `regionRectToBase` documents — the picture is bigger than the canvas
 * by `PAN_ZOOM` and slides under it), so an authored move region pans with the
 * art it was drawn on. A FALLBACK box is not a place in the painting at all, so
 * it is placed in CANVAS space and marked `pinned` — it must never pan out of
 * reach, because it is the only way off the screen.
 */

import type { PlayChoice } from "@lantern/lib/play";
import type { HotspotRect, ViewSize } from "./HotspotPlacement";
import { regionRectToBase } from "./HotspotPlacement";

/** One exit to place. `key` is the region id the authored map is keyed by —
 * the DESTINATION screen id, so `regions.json`'s `moves` reads as "from this
 * screen, the way to T2 is this box." */
export interface MoveRegionInput {
  readonly key: string;
  /** The destination's display name, as the label reads it. */
  readonly label: string;
}

export type MoveRegionSide = "left" | "right";

/** The destination's display name out of an ink move's `[bracketed]` text. */
export function moveTargetName(display: string): string {
  const m = /(?:Go to|Begin at)\s+(.+?)\]?$/.exec(display.replace(/^\[|\]$/g, ""));
  return m ? m[1].trim() : "";
}

/**
 * Every exit a hub view currently offers, as move-region inputs.
 *
 * ONE DERIVATION, TWO READERS. `render/MoveRegions.ts` draws these boxes and
 * `render/EditModeSystem.ts` authors their geometry; if each re-derived "which
 * exits does this screen have, and what key does the authored map file them
 * under", the editor could hand a rect to a key the renderer never looks up and
 * the box would silently stay on its fallback. So the filter (`hubAction ===
 * "exit"`, NOT `kind === "move"` — see `MoveRegions.draw`'s header on why day-end
 * is not a place on the screen) and the name→screen-id lookup live here, once.
 *
 * Order is the choice order, unchanged, so a caller may zip the result back
 * against its own filtered choice list by index.
 */
export function exitMoveInputs(
  choices: readonly PlayChoice[],
  screenIdForName: (name: string) => string | undefined,
): MoveRegionInput[] {
  return choices
    .filter((c) => c.hubAction === "exit")
    .map((c) => {
      const label = moveTargetName(c.display);
      return { key: screenIdForName(label) ?? label, label };
    });
}

export interface MoveRegionPlan {
  readonly key: string;
  readonly label: string;
  /** True when a rect for `key` was authored; false for a fallback box. */
  readonly authored: boolean;
  /** Fallback boxes are canvas-space and must not pan — see the header. */
  readonly pinned: boolean;
  /** Which margin a fallback box sits against; drives the label's arrow.
   * `null` for an authored box, which is wherever the author put it. */
  readonly side: MoveRegionSide | null;
  /** Scene-local offset from the picture's centre — what `PanModel.place`
   * takes, identical to `ShapedRegionHotspot.baseX/baseY`. For a pinned box
   * this is the offset from the CANVAS centre and is used directly. */
  readonly baseX: number;
  readonly baseY: number;
  readonly width: number;
  readonly height: number;
}

/** Left/right margin the fallback column sits against, in canvas pixels. */
export const FALLBACK_MARGIN_X = 60;
/** Fallback box width. Wide enough for a two-word destination label under it
 * without the label overhanging the box on either side. */
export const FALLBACK_WIDTH = 280;
/**
 * The vertical band a fallback column may use, canvas-absolute.
 *
 * Top clears `CollectScene`'s header plaque. Bottom clears `CHOICES_ROW_TOP`
 * (700) — AND the region's own label, which hangs under the box. That margin
 * is not cosmetic: the HUD scrims are drawn at depth 19 and a move region is
 * on the painting at depth 10/11, so a box that reaches into the choices row
 * is literally covered by the scrim and its label greys out. Found in the T14
 * playtest screenshot, where the bottom-right fallback region read as a ghost.
 * NPC portraits sit at x-centre and the columns hug the margins, so those two
 * never fight for the same pixels.
 */
export const FALLBACK_BAND: readonly [number, number] = [160, 640];
/** Vertical gap between two stacked fallback boxes — wide enough for the upper
 * box's LABEL, which hangs below it, to clear the lower box's top edge. At 26
 * the T14 playtest screenshot had "The Stream →" sitting on the next region's
 * border; the label is part of the region's footprint, not decoration. */
export const FALLBACK_ROW_GAP = 46;
/** Tallest a fallback box grows to when there is room to spare — a lone exit
 * should read as a doorway, not as half the screen. */
export const FALLBACK_MAX_HEIGHT = 200;

/**
 * Plan every exit on a screen, in the order given.
 *
 * `rects` are the authored move shapes for THIS screen (`regions.json`'s
 * `moves[screenId]`), keyed by destination screen id. `picture` is the size
 * the backdrop occupies on screen (`PanModel.pictureWidth/pictureHeight`);
 * `view` is the canvas. An input whose `key` has no authored rect falls back —
 * see the header, and do not make that branch conditional on anything.
 */
export function planMoveRegions(
  inputs: readonly MoveRegionInput[],
  rects: Record<string, HotspotRect>,
  view: ViewSize,
  picture: ViewSize = view,
): MoveRegionPlan[] {
  const fallbackIndexes: number[] = [];
  inputs.forEach((m, i) => {
    if (!rects[m.key]) fallbackIndexes.push(i);
  });
  const rows = Math.max(1, Math.ceil(fallbackIndexes.length / 2));
  const [bandTop, bandBottom] = FALLBACK_BAND;
  const bandHeight = bandBottom - bandTop;
  const height = Math.min(FALLBACK_MAX_HEIGHT, (bandHeight - FALLBACK_ROW_GAP * (rows - 1)) / rows);
  // Centre the stack in the band rather than top-aligning it, so one or two
  // exits sit at eye level instead of clinging to the top edge.
  const stackHeight = height * rows + FALLBACK_ROW_GAP * (rows - 1);
  const stackTop = bandTop + (bandHeight - stackHeight) / 2;

  return inputs.map((m, i) => {
    const rect = rects[m.key];
    if (rect) {
      const { baseX, baseY, width, height: h } = regionRectToBase(rect, picture);
      return {
        key: m.key,
        label: m.label,
        authored: true,
        pinned: false,
        side: null,
        baseX,
        baseY,
        width,
        height: h,
      };
    }
    // Alternate sides so a two-exit screen reads as "one way out each way"
    // (the wireframe's own Mill-right / Hollow-left frame), then stack.
    const slot = fallbackIndexes.indexOf(i);
    const side: MoveRegionSide = slot % 2 === 0 ? "right" : "left";
    const row = Math.floor(slot / 2);
    const top = stackTop + row * (height + FALLBACK_ROW_GAP);
    const left =
      side === "left" ? FALLBACK_MARGIN_X : view.width - FALLBACK_MARGIN_X - FALLBACK_WIDTH;
    return {
      key: m.key,
      label: m.label,
      authored: false,
      pinned: true,
      side,
      baseX: left + FALLBACK_WIDTH / 2 - view.width / 2,
      baseY: top + height / 2 - view.height / 2,
      width: FALLBACK_WIDTH,
      height,
    };
  });
}

/** The label a region carries, with a direction arrow when the box's side is
 * the only thing telling the player which way they are about to walk. */
export function moveRegionLabel(plan: MoveRegionPlan): string {
  if (plan.side === "left") return `← ${plan.label}`;
  if (plan.side === "right") return `${plan.label} →`;
  return plan.label;
}
