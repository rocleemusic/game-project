/**
 * Where hotspots go. Pure arithmetic — no Phaser, no DOM.
 *
 * Two different kinds of hotspot live here, because they are the same question
 * asked twice and the two scenes answered it with two unrelated pieces of code:
 *
 *   FORAGE hotspots (`CollectScene`)  — a dot meaning "something is here",
 *     placed at a SEEDED position inside a safe box so it does not jump on every
 *     re-render and the headless walker sees the same layout twice.
 *
 *   REGION hotspots (`ScreenScene`)   — the examinables authored on a screen,
 *     drawn from `regions.json` as fractions of the backdrop.
 *
 * ---------------------------------------------------------------------------
 * THE UNSHAPED FALLBACK IS LOAD-BEARING. DO NOT "TIDY" IT.
 * ---------------------------------------------------------------------------
 *
 * 19 of the 20 screens have NO hotspot geometry: their regions are declared on
 * the screen spec but carry no shape, so `regions.json` has no rect for them.
 * Only T1 has authored geometry today. If the unshaped branch is dropped,
 * simplified, or made conditional on anything, 19 screens silently lose every
 * examinable they have and the game still compiles, still runs, and still passes
 * every other test. Edit mode is the tool that will eventually author the
 * geometry; until then this fallback IS the feature.
 *
 * The fallback is a labelled pill row along the bottom, laid out left to right.
 * Its x-advance depends on the RENDERED width of each label, which only the
 * engine can measure — so this module hands out the row's constants and the
 * advance rule, and the scene feeds the measured widths back in.
 */

import { seededFrac } from "../hash";

/** A normalized hotspot rect: fractions of the backdrop, not pixels. */
export interface HotspotRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ViewSize {
  readonly width: number;
  readonly height: number;
}

/** Where a forage hotspot is allowed to land, screen-absolute `[min, max]`. */
export interface SafeBox {
  readonly x: readonly [number, number];
  readonly y: readonly [number, number];
}

// ---------------------------------------------------------------------------
// Forage hotspots — seeded placement inside a safe box
// ---------------------------------------------------------------------------

export interface ForagePlacement {
  /** Screen-absolute position at rest (pan offset zero). */
  readonly screenX: number;
  readonly screenY: number;
  /** Scene-local offset from centre — what `PanModel.place` takes. */
  readonly baseX: number;
  readonly baseY: number;
}

/**
 * A stable position for one forage slot.
 *
 * Seeded on the SLOT ID, which is already scoped to screen + day + time block +
 * pool name, so the dot stays put while you stand there and genuinely moves on a
 * later visit. The `|x` / `|y` suffixes are what keep the two axes independent;
 * without them every dot would sit on the diagonal.
 */
export function placeForageHotspot(slotId: string, box: SafeBox, view: ViewSize): ForagePlacement {
  const [sx0, sx1] = box.x;
  const [sy0, sy1] = box.y;
  const screenX = sx0 + seededFrac(`${slotId}|x`) * (sx1 - sx0);
  const screenY = sy0 + seededFrac(`${slotId}|y`) * (sy1 - sy0);
  return {
    screenX,
    screenY,
    baseX: screenX - view.width / 2,
    baseY: screenY - view.height / 2,
  };
}

// ---------------------------------------------------------------------------
// Region hotspots — authored geometry, or the fallback row
// ---------------------------------------------------------------------------

/** A region with authored geometry: a box, in absolute pixels. */
export interface ShapedRegionHotspot {
  readonly id: string;
  readonly shaped: true;
  /** Centre AT REST (pan offset zero), because that is what a rectangle is
   * positioned by on a scene that never pans. */
  readonly centerX: number;
  readonly centerY: number;
  readonly width: number;
  readonly height: number;
  /** Scene-local offset from the picture's centre — what `PanModel.place`
   * takes, the same contract `ForagePlacement.baseX/baseY` already has. A
   * panning scene positions the box from THIS every frame; `centerX/centerY`
   * is only where it happens to sit while the pan is at rest. */
  readonly baseX: number;
  readonly baseY: number;
}

/** A region with no geometry authored. Renders as a pill in the fallback row. */
export interface UnshapedRegionHotspot {
  readonly id: string;
  readonly shaped: false;
  /** The row's baseline. The x depends on measured label widths — see below. */
  readonly y: number;
}

export type RegionHotspotPlan = ShapedRegionHotspot | UnshapedRegionHotspot;

/** Left edge of the unshaped fallback row. */
export const UNSHAPED_START_X = 40;
/** Gap between two fallback pills. */
export const UNSHAPED_GAP = 14;
/** How far above the bottom edge the fallback row sits. */
export const UNSHAPED_BOTTOM_OFFSET = 128;

export function unshapedRowY(viewHeight: number): number {
  return viewHeight - UNSHAPED_BOTTOM_OFFSET;
}

/**
 * The x for the NEXT fallback pill, given where this one started and how wide it
 * actually rendered. The engine owns the measurement; the rule lives here.
 */
export function nextUnshapedX(x: number, measuredWidth: number): number {
  return x + measuredWidth + UNSHAPED_GAP;
}

/**
 * A region rect (fractions of the PICTURE) to scene-local geometry.
 *
 * `picture` is the size the backdrop actually occupies on screen —
 * `PanModel.pictureWidth/pictureHeight`, NOT the canvas. See that getter's
 * header: measuring a region fraction against the canvas is the bug behind
 * "regions move with the pan instead of mapping to the picture," because the
 * picture is bigger than the canvas by `PAN_ZOOM` and slides under it.
 */
export function regionRectToBase(
  rect: HotspotRect,
  picture: ViewSize,
): { baseX: number; baseY: number; width: number; height: number } {
  return {
    baseX: (rect.x + rect.w / 2 - 0.5) * picture.width,
    baseY: (rect.y + rect.h / 2 - 0.5) * picture.height,
    width: rect.w * picture.width,
    height: rect.h * picture.height,
  };
}

/**
 * A scene-local point back into PICTURE pixels, measured from the picture's
 * top-left corner.
 *
 * This is the hand-off edit mode needs: `PanModel.unplace` turns a pointer
 * into scene-local coordinates, this turns those into the frame
 * `RegionExport.pixelDragToRegionRect` already normalizes against — so a
 * drag is stored as a fraction of the picture it was drawn on, at whatever
 * pan offset the author happened to be holding.
 */
export function baseToPicturePixels(
  baseX: number,
  baseY: number,
  picture: ViewSize,
): { x: number; y: number } {
  return { x: baseX + picture.width / 2, y: baseY + picture.height / 2 };
}

/**
 * Plan every hotspot on a screen, in order.
 *
 * `rects` are the authored shapes for this screen (`regions.json`); `declaredIds`
 * are the region ids the screen spec declares. The union is taken with a Set in
 * that order — shaped ids first, then declared-only ones — and the order is part
 * of the behaviour, because it is the order the fallback pills appear in.
 *
 * A declared region with no rect does NOT disappear. See this file's header.
 *
 * `picture` is the size the backdrop occupies on screen. It defaults to the
 * view, which is the honest answer for a scene that draws its backdrop at
 * exactly canvas size and never pans (`ScreenScene`); a panning scene passes
 * `PanModel.pictureWidth/pictureHeight` and gets boxes pinned to the painting.
 */
export function planRegionHotspots(
  rects: Record<string, HotspotRect>,
  declaredIds: readonly string[],
  view: ViewSize,
  picture: ViewSize = view,
): RegionHotspotPlan[] {
  const ids = new Set([...Object.keys(rects), ...declaredIds]);
  const fallbackY = unshapedRowY(view.height);
  const plan: RegionHotspotPlan[] = [];
  for (const id of ids) {
    const r = rects[id];
    if (r) {
      const { baseX, baseY, width, height } = regionRectToBase(r, picture);
      plan.push({
        id,
        shaped: true,
        centerX: view.width / 2 + baseX,
        centerY: view.height / 2 + baseY,
        width,
        height,
        baseX,
        baseY,
      });
    } else {
      plan.push({ id, shaped: false, y: fallbackY });
    }
  }
  return plan;
}
