/**
 * Pure math behind `EditModeSystem`'s export (mode5 plan step 8, scoped to
 * hotspot drawing). No Phaser, no DOM — see that file's header for the
 * feature this supports.
 */

import type { RegionMap, RegionRect } from "../../ink/loadRun";

/** Round to 4 decimal places — matches `regions.json`'s own authored
 * precision (`public/story/regions.json`'s T1 entries). */
export function roundFraction(n: number): number {
  return Math.round(n * 10000) / 10000;
}

/**
 * A pointer-drag rectangle, in canvas pixels, to a normalized `RegionRect` —
 * fractions of the backdrop, matching `regions.json`'s own shape.
 */
export function pixelDragToRegionRect(
  x0: number,
  y0: number,
  width: number,
  height: number,
  viewWidth: number,
  viewHeight: number,
): RegionRect {
  return {
    x: roundFraction(x0 / viewWidth),
    y: roundFraction(y0 / viewHeight),
    w: roundFraction(width / viewWidth),
    h: roundFraction(height / viewHeight),
  };
}

/**
 * Merge session edits onto the regions a run loaded at boot.
 *
 * Only screens/ids actually touched this session overwrite the base — every
 * OTHER screen's (and every other id's) untouched geometry passes through
 * unchanged. An export must never freeze a screen's current values into the
 * file just because a DIFFERENT screen was edited in the same session — that
 * would read as "reviewed" when nobody looked at it.
 */
export function mergeRegions(base: RegionMap, edits: RegionMap): RegionMap {
  const merged: RegionMap = {};
  for (const [screen, rects] of Object.entries(base)) merged[screen] = { ...rects };
  for (const [screen, rects] of Object.entries(edits)) merged[screen] = { ...merged[screen], ...rects };
  return merged;
}

/** The exact shape `loadRun` parses back out of `regions.json` — two maps, both
 * optional there but always written here. */
export interface RegionsFile {
  readonly screens: RegionMap;
  readonly moves: RegionMap;
}

/**
 * The WHOLE file an export writes — both maps, each merged independently.
 *
 * A shape-level function rather than the two `mergeRegions` calls inlined at
 * the call site, because the failure mode here is a SHAPE bug, not an
 * arithmetic one: an export that emits `{ screens }` alone reads as valid JSON
 * and silently deletes every authored move region the moment it is pasted
 * back (`EditModeSystemDeps.moveRegions`'s own header describes that trap).
 * `mergeRegions`'s "never freeze unreviewed geometry" rule now applies to both
 * maps — an untouched screen's move rect passes through byte-identical.
 */
export function regionsFilePayload(
  screens: RegionMap,
  screenEdits: RegionMap,
  moves: RegionMap,
  moveEdits: RegionMap,
): RegionsFile {
  return {
    screens: mergeRegions(screens, screenEdits),
    moves: mergeRegions(moves, moveEdits),
  };
}
