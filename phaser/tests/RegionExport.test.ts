/**
 * `RegionExport.ts` — pure math behind `EditModeSystem`'s export (mode5 plan
 * step 8, scoped to hotspot drawing). A bug here would silently corrupt real
 * `regions.json` data an author trusts, so it gets its own test file rather
 * than only the Phaser-coupled class's source-text mount check.
 */
import { describe, expect, it } from "vitest";
import {
  mergeRegions,
  pixelDragToRegionRect,
  regionsFilePayload,
  roundFraction,
} from "../src/world/view/RegionExport";
import type { RegionMap } from "../src/ink/loadRun";

describe("roundFraction", () => {
  it("rounds to 4 decimal places, matching regions.json's own precision", () => {
    expect(roundFraction(0.42523456)).toBe(0.4252);
    expect(roundFraction(1 / 3)).toBe(0.3333);
    expect(roundFraction(0)).toBe(0);
    expect(roundFraction(1)).toBe(1);
  });
});

describe("pixelDragToRegionRect", () => {
  it("converts a pixel drag to normalized fractions of the view", () => {
    const rect = pixelDragToRegionRect(192, 108, 384, 216, 1920, 1080);
    expect(rect).toEqual({ x: 0.1, y: 0.1, w: 0.2, h: 0.2 });
  });

  it("a drag from the origin covering the whole view is the unit rect", () => {
    expect(pixelDragToRegionRect(0, 0, 1920, 1080, 1920, 1080)).toEqual({ x: 0, y: 0, w: 1, h: 1 });
  });

  it("rounds each axis independently to 4 decimals", () => {
    const rect = pixelDragToRegionRect(1, 1, 1, 1, 3, 7);
    expect(rect.x).toBe(roundFraction(1 / 3));
    expect(rect.y).toBe(roundFraction(1 / 7));
  });
});

describe("mergeRegions", () => {
  const base: RegionMap = {
    T1: { r_arch: { x: 0.1, y: 0.1, w: 0.1, h: 0.1 }, r_board: { x: 0.5, y: 0.5, w: 0.1, h: 0.1 } },
    T2: { r_shelf: { x: 0.2, y: 0.2, w: 0.2, h: 0.2 } },
  };

  it("passes every untouched screen through unchanged, by value not reference", () => {
    const merged = mergeRegions(base, {});
    expect(merged).toEqual(base);
    expect(merged).not.toBe(base);
    expect(merged.T1).not.toBe(base.T1);
  });

  it("overwrites only the ids a session actually edited, leaving siblings on the same screen alone", () => {
    const merged = mergeRegions(base, { T1: { r_arch: { x: 0.9, y: 0.9, w: 0.05, h: 0.05 } } });
    expect(merged.T1.r_arch).toEqual({ x: 0.9, y: 0.9, w: 0.05, h: 0.05 });
    // r_board on the SAME screen, never touched — must survive unchanged.
    expect(merged.T1.r_board).toEqual(base.T1.r_board);
    // T2 wasn't edited at all — must survive unchanged.
    expect(merged.T2).toEqual(base.T2);
  });

  it("adds a brand new screen the base never had", () => {
    const merged = mergeRegions(base, { F1: { r_new: { x: 0, y: 0, w: 0.3, h: 0.3 } } });
    expect(merged.F1).toEqual({ r_new: { x: 0, y: 0, w: 0.3, h: 0.3 } });
    expect(merged.T1).toEqual(base.T1);
  });

  it("adds a brand new id to a screen the base already partially authored", () => {
    const merged = mergeRegions(base, { T1: { r_new: { x: 0.3, y: 0.3, w: 0.1, h: 0.1 } } });
    expect(merged.T1.r_arch).toEqual(base.T1.r_arch);
    expect(merged.T1.r_board).toEqual(base.T1.r_board);
    expect(merged.T1.r_new).toEqual({ x: 0.3, y: 0.3, w: 0.1, h: 0.1 });
  });

  it("an empty base plus edits produces exactly the edits", () => {
    const edits: RegionMap = { F2: { r_x: { x: 0, y: 0, w: 1, h: 1 } } };
    expect(mergeRegions({}, edits)).toEqual(edits);
  });
});

/**
 * GP-203 — the editor authors BOTH of `regions.json`'s maps now, so the export's
 * failure mode is a shape bug rather than an arithmetic one: emit `{ screens }`
 * alone and pasting the result silently deletes every authored move region.
 */
describe("regionsFilePayload — the whole regions.json, both maps", () => {
  const screens: RegionMap = { T1: { r_arch: { x: 0.1, y: 0.1, w: 0.1, h: 0.1 } } };
  const moves: RegionMap = {
    T1: { T2: { x: 0.6, y: 0.4, w: 0.15, h: 0.3 } },
    F1: { F2: { x: 0.2, y: 0.2, w: 0.2, h: 0.2 } },
  };

  it("always writes both keys, even with nothing edited at all", () => {
    const out = regionsFilePayload({}, {}, {}, {});
    expect(Object.keys(out).sort()).toEqual(["moves", "screens"]);
    expect(out.screens).toEqual({});
    expect(out.moves).toEqual({});
  });

  it("an examine-only session leaves the moves map byte-identical", () => {
    const out = regionsFilePayload(screens, { T1: { r_arch: { x: 0.9, y: 0.9, w: 0.05, h: 0.05 } } }, moves, {});
    expect(out.screens.T1.r_arch).toEqual({ x: 0.9, y: 0.9, w: 0.05, h: 0.05 });
    expect(out.moves).toEqual(moves);
  });

  it("a move-only session leaves the examine map byte-identical", () => {
    const out = regionsFilePayload(screens, {}, moves, { T1: { T2: { x: 0, y: 0, w: 0.5, h: 0.5 } } });
    expect(out.moves.T1.T2).toEqual({ x: 0, y: 0, w: 0.5, h: 0.5 });
    expect(out.screens).toEqual(screens);
  });

  it("never freezes an untouched screen's move geometry — the same rule the examine map follows", () => {
    const out = regionsFilePayload(screens, {}, moves, { T1: { T3: { x: 0.1, y: 0.1, w: 0.1, h: 0.1 } } });
    // F1 was never visited this session.
    expect(out.moves.F1).toEqual(moves.F1);
    // T2 on the SAME screen was never re-drawn.
    expect(out.moves.T1.T2).toEqual(moves.T1.T2);
    expect(out.moves.T1.T3).toEqual({ x: 0.1, y: 0.1, w: 0.1, h: 0.1 });
  });

  it("a move edit never leaks into the screens map, and vice versa", () => {
    const out = regionsFilePayload({}, { T1: { r_new: { x: 0, y: 0, w: 1, h: 1 } } }, {}, {
      T1: { T2: { x: 0.5, y: 0.5, w: 0.1, h: 0.1 } },
    });
    expect(out.screens.T1).toEqual({ r_new: { x: 0, y: 0, w: 1, h: 1 } });
    expect(out.moves.T1).toEqual({ T2: { x: 0.5, y: 0.5, w: 0.1, h: 0.1 } });
  });

  it("round-trips through JSON into exactly the shape loadRun parses", () => {
    const parsed = JSON.parse(JSON.stringify(regionsFilePayload(screens, {}, moves, {}))) as {
      screens?: RegionMap;
      moves?: RegionMap;
    };
    expect(parsed.screens).toEqual(screens);
    expect(parsed.moves).toEqual(moves);
  });
});
