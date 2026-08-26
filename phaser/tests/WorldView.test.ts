/**
 * The two pure view modules extracted in Wave 1: `PanModel` and
 * `HotspotPlacement`.
 *
 * `SatchelLedger` and `CastPipeline` are covered by the characterization suite,
 * which now runs the real implementations. These two had no coverage at all —
 * they were private methods inside `CollectScene` and `ScreenScene` — so this is
 * their first.
 *
 * The load-bearing test in this file is the LAST describe block. 19 of the 20
 * shipped screens have no authored hotspot geometry, so the unshaped fallback is
 * the only thing making their examinables exist. It is asserted against the real
 * `regions.json` and `graph.json` rather than a fixture, because a fixture would
 * let the shipped content drift out from under the guarantee.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  PanModel,
  panFit,
  easeToward,
  PAN_ZOOM,
  PAN_SMOOTH_TAU,
} from "../src/world/view/PanModel";
import {
  planRegionHotspots,
  regionRectToBase,
  baseToPicturePixels,
  placeForageHotspot,
  nextUnshapedX,
  unshapedRowY,
  UNSHAPED_START_X,
  UNSHAPED_GAP,
  type HotspotRect,
} from "../src/world/view/HotspotPlacement";
import type { Graph } from "@lantern/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(here, "..", "public");
const read = <T>(...p: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(pub, ...p), "utf8")) as T;

const W = 1920;
const H = 1080;
const VIEW = { width: W, height: H };

// `CollectScene`'s HUD bands, which is what the pointer gate is sized from.
const TOP_BAR_HEIGHT = 76;
const CHOICES_ROW_TOP = H - 230 - 150;

const model = () =>
  new PanModel({
    viewWidth: W,
    viewHeight: H,
    pointerBand: [TOP_BAR_HEIGHT, CHOICES_ROW_TOP],
  });

// ---------------------------------------------------------------------------
// PanModel — the fit
// ---------------------------------------------------------------------------

describe("PanModel — cover-fit plus zoom, and the slack it leaves", () => {
  it("covers the canvas on the tighter axis, then multiplies by the zoom", () => {
    const { scale, maxX, maxY } = panFit(1000, 1000, W, H, PAN_ZOOM);
    expect(scale).toBeCloseTo(Math.max(W / 1000, H / 1000) * PAN_ZOOM, 10);
    // The slack is half the overhang on each axis.
    expect(maxX).toBeCloseTo((1000 * scale - W) / 2, 10);
    expect(maxY).toBeCloseTo((1000 * scale - H) / 2, 10);
  });

  it("leaves no slack at all with no zoom — 1.0 means no pan room", () => {
    const { maxX, maxY } = panFit(1920, 1080, W, H, 1);
    expect(maxX).toBe(0);
    expect(maxY).toBe(0);
  });

  it("never reports negative slack for an image smaller than the canvas", () => {
    const { maxX, maxY } = panFit(64, 64, W, H, PAN_ZOOM);
    expect(maxX).toBeGreaterThanOrEqual(0);
    expect(maxY).toBeGreaterThanOrEqual(0);
  });

  it("is unpannable until it has been fitted, and pannable after", () => {
    const p = model();
    expect(p.pannable).toBe(false);
    p.fit(1000, 1000);
    expect(p.pannable).toBe(true);
    p.reset();
    expect(p.pannable).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PanModel — taking aim
// ---------------------------------------------------------------------------

describe("PanModel — the pointer sets a target, never a position", () => {
  it("refuses to aim with no slack, so an unfitted model cannot drift", () => {
    const p = model();
    expect(p.aimAt(0, H / 2)).toBe(false);
    expect(p.targetX).toBe(0);
    expect(p.targetY).toBe(0);
  });

  it("inverts the pointer: mouse right means the image shifts left", () => {
    const p = model();
    p.fit(1000, 1000);
    p.aimAt(W, H / 2);
    expect(p.targetX).toBeCloseTo(-p.maxX, 10);
    p.aimAt(0, H / 2);
    expect(p.targetX).toBeCloseTo(p.maxX, 10);
  });

  it("clamps at the edges rather than running past them", () => {
    const p = model();
    p.fit(1000, 1000);
    p.aimAt(W * 4, H / 2);
    expect(p.targetX).toBeCloseTo(-p.maxX, 10);
    expect(Math.abs(p.targetX)).toBeLessThanOrEqual(p.maxX);
  });

  it("HOLDS the last target over HUD chrome instead of resetting it", () => {
    // Roc, 2026-08-13: reaching for a button must not drag the scene out from
    // under it. Holding, not centring — a reset would yank the view.
    const p = model();
    p.fit(1000, 1000);
    p.aimAt(0, H / 2);
    const held = { x: p.targetX, y: p.targetY };

    expect(p.aimAt(W, TOP_BAR_HEIGHT - 1)).toBe(false);
    expect(p.aimAt(W, CHOICES_ROW_TOP + 1)).toBe(false);
    expect({ x: p.targetX, y: p.targetY }).toEqual(held);

    // The band's own edges are inside it.
    expect(p.aimAt(W, TOP_BAR_HEIGHT)).toBe(true);
    expect(p.aimAt(W, CHOICES_ROW_TOP)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// PanModel — the easing
// ---------------------------------------------------------------------------

describe("PanModel — easing is frame-rate independent", () => {
  it("two half-steps land where one whole step does", () => {
    // `1 - e^(-dt/tau)` composes, which is the whole reason it was chosen: the
    // pan looks the same at 30fps and 144fps.
    const one = easeToward(0, 100, 16, PAN_SMOOTH_TAU);
    let two = easeToward(0, 100, 8, PAN_SMOOTH_TAU);
    two = easeToward(two, 100, 8, PAN_SMOOTH_TAU);
    expect(two).toBeCloseTo(one, 10);
  });

  it("approaches the target without overshooting it", () => {
    let v = 0;
    for (let i = 0; i < 500; i++) {
      v = easeToward(v, 100, 16, PAN_SMOOTH_TAU);
      expect(v).toBeLessThanOrEqual(100);
    }
    expect(v).toBeCloseTo(100, 6);
  });

  it("snaps under reduced motion — the pan still works, it just does not animate", () => {
    const p = model();
    p.fit(1000, 1000);
    p.aimAt(0, H / 2);
    p.step(16, true);
    expect(p.offsetX).toBe(p.targetX);
    expect(p.offsetY).toBe(p.targetY);
  });

  it("places a scene-local point at centre plus its base plus the offset", () => {
    const p = model();
    p.fit(1000, 1000);
    expect(p.place(0, 0)).toEqual({ x: W / 2, y: H / 2 });
    expect(p.place(-100, 40)).toEqual({ x: W / 2 - 100, y: H / 2 + 40 });
    p.aimAt(0, H / 2);
    p.step(16, true);
    expect(p.place(0, 0).x).toBeCloseTo(W / 2 + p.maxX, 10);
  });
});

// ---------------------------------------------------------------------------
// Forage hotspot placement
// ---------------------------------------------------------------------------

const SAFE = { x: [90, 1830] as const, y: [116, 700] as const };

describe("forage hotspots — seeded, stable, and inside the safe box", () => {
  it("gives the same slot the same position every time", () => {
    const a = placeForageHotspot("F2_1_morning_river stones", SAFE, VIEW);
    const b = placeForageHotspot("F2_1_morning_river stones", SAFE, VIEW);
    expect(a).toEqual(b);
  });

  it("moves a slot on a later day, because the slot id carries the day", () => {
    const day1 = placeForageHotspot("F2_1_morning_river stones", SAFE, VIEW);
    const day2 = placeForageHotspot("F2_2_morning_river stones", SAFE, VIEW);
    expect(day2).not.toEqual(day1);
  });

  it("keeps every placement clear of the HUD, and off the diagonal", () => {
    // Independent axes: seeding both from the bare slot id would put every dot
    // on the same diagonal line.
    const xs = new Set<number>();
    const ys = new Set<number>();
    for (const pool of ["herbs", "sticks", "river stones", "grass", "ore", "ash"]) {
      for (const day of [1, 2, 3, 4, 5]) {
        const p = placeForageHotspot(`F2_${day}_morning_${pool}`, SAFE, VIEW);
        expect(p.screenX).toBeGreaterThanOrEqual(SAFE.x[0]);
        expect(p.screenX).toBeLessThanOrEqual(SAFE.x[1]);
        expect(p.screenY).toBeGreaterThanOrEqual(SAFE.y[0]);
        expect(p.screenY).toBeLessThanOrEqual(SAFE.y[1]);
        expect(p.baseX).toBeCloseTo(p.screenX - W / 2, 10);
        expect(p.baseY).toBeCloseTo(p.screenY - H / 2, 10);
        xs.add(p.screenX);
        ys.add(p.screenY);
      }
    }
    expect(xs.size).toBe(30);
    expect(ys.size).toBe(30);
  });
});

// ---------------------------------------------------------------------------
// Region hotspots — and the fallback 19 of 20 screens depend on
// ---------------------------------------------------------------------------

describe("region hotspots — authored geometry becomes a box", () => {
  it("converts a fractional rect to an absolute centred box", () => {
    const rects: Record<string, HotspotRect> = { r: { x: 0.25, y: 0.5, w: 0.5, h: 0.25 } };
    const [hs] = planRegionHotspots(rects, ["r"], VIEW);
    expect(hs.shaped).toBe(true);
    if (!hs.shaped) throw new Error("unreachable");
    expect(hs.centerX).toBeCloseTo(0.5 * W, 10);
    expect(hs.centerY).toBeCloseTo(0.625 * H, 10);
    expect(hs.width).toBeCloseTo(0.5 * W, 10);
    expect(hs.height).toBeCloseTo(0.25 * H, 10);
  });

  it("takes shaped ids first, then declared-only ones, and never duplicates", () => {
    // The order is the order the fallback pills appear in, so it is behaviour.
    const rects: Record<string, HotspotRect> = { b: { x: 0, y: 0, w: 0.1, h: 0.1 } };
    const plan = planRegionHotspots(rects, ["a", "b", "c"], VIEW);
    expect(plan.map((p) => p.id)).toEqual(["b", "a", "c"]);
    expect(plan.map((p) => p.shaped)).toEqual([true, false, false]);
  });

  it("advances the fallback row by the MEASURED width plus the gap", () => {
    expect(nextUnshapedX(UNSHAPED_START_X, 100)).toBe(UNSHAPED_START_X + 100 + UNSHAPED_GAP);
    expect(unshapedRowY(H)).toBe(H - 128);
  });
});

describe("region hotspots — every declared region now has authored geometry (T11, 2026-08-24)", () => {
  const regions = read<{ screens?: Record<string, Record<string, HotspotRect>> }>(
    "story",
    "regions.json",
  ).screens ?? {};
  const graph = read<Graph>("story", "graph.json");
  const screens = graph.screens ?? [];

  const planFor = (screenId: string, declared: string[]) =>
    planRegionHotspots(regions[screenId] ?? {}, declared, VIEW);

  it("has authored geometry for every screen that declares regions", () => {
    // Was T1 only, with 19 screens riding the unshaped fallback. The T11
    // region-authoring pass (2026-08-24) filled in T2-T8 and F1-F8.
    expect(screens.length).toBe(20);
    const declaredScreens = screens
      .filter((s) => (s.regions ?? []).length > 0)
      .map((s) => s.screen_id)
      .sort();
    const shaped = Object.keys(regions).sort();
    expect(shaped).toEqual(declaredScreens);
  });

  it("plans a hotspot for EVERY declared region on every screen, all of them shaped", () => {
    // The failure this guards: drop a screen's geometry and it loses every
    // examinable while everything still compiles and every other test stays
    // green.
    let declaredTotal = 0;
    let unshapedTotal = 0;
    for (const s of screens) {
      const declared = (s.regions ?? []).map((r) => r.region_id);
      declaredTotal += declared.length;
      const plan = planFor(s.screen_id, declared);
      expect(plan.map((p) => p.id).sort(), s.screen_id).toEqual([...declared].sort());
      unshapedTotal += plan.filter((p) => !p.shaped).length;
    }
    expect(declaredTotal).toBe(22);
    // Every declared region across every screen is now authored.
    expect(unshapedTotal).toBe(0);
  });

  it("puts T1's two on their authored geometry and nothing in the fallback row", () => {
    const plan = planFor("T1", ["r_arch", "r_board"]);
    expect(plan.every((p) => p.shaped)).toBe(true);
  });

  it("keeps every fallback pill on one baseline, clear of the bottom edge", () => {
    // No real screen has an unshaped declared region anymore (T11 authored
    // all 22), so drive the fallback path directly instead of piggybacking
    // on story data the way this used to (F7's r_cave_walls, before it was
    // authored this session).
    const plan = planRegionHotspots({}, ["r_unauthored"], VIEW);
    expect(plan).toEqual([{ id: "r_unauthored", shaped: false, y: H - 128 }]);
  });

  it("plans nothing for a screen that declares no regions", () => {
    expect(planFor("HOME", [])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Regions map to the PICTURE, not the canvas (Roc, 2026-08-23, review note 43)
// ---------------------------------------------------------------------------

describe("regions are pinned to the picture, not the canvas", () => {
  // A 16:9 backdrop bigger than the canvas, at PAN_ZOOM — the shipped case.
  const fitted = () => {
    const m = model();
    m.fit(1920, 1080);
    return m;
  };

  it("reports the picture as the view plus the slack on both sides", () => {
    const m = fitted();
    expect(m.pictureWidth).toBeCloseTo(W * PAN_ZOOM, 6);
    expect(m.pictureHeight).toBeCloseTo(H * PAN_ZOOM, 6);
    // Before any fit, the picture IS the view — the honest answer for a scene
    // that has not drawn a backdrop yet.
    expect(model().pictureWidth).toBe(W);
  });

  it("unplace is the exact inverse of place, at any pan offset", () => {
    const m = fitted();
    m.aimAt(0, H / 2); // hard left, so the offset is non-zero
    m.step(16, true);
    expect(m.offsetX).not.toBe(0);
    const at = m.place(120, -80);
    const back = m.unplace(at.x, at.y);
    expect(back.baseX).toBeCloseTo(120, 8);
    expect(back.baseY).toBeCloseTo(-80, 8);
  });

  it("a region at the picture centre sits at the canvas centre only while the pan is at rest", () => {
    const m = fitted();
    const g = regionRectToBase({ x: 0.45, y: 0.45, w: 0.1, h: 0.1 }, {
      width: m.pictureWidth,
      height: m.pictureHeight,
    });
    expect(g.baseX).toBeCloseTo(0, 8);
    expect(g.baseY).toBeCloseTo(0, 8);
    expect(m.place(g.baseX, g.baseY)).toEqual({ x: W / 2, y: H / 2 });
    // Pan, and the region travels with the painting by exactly the pan offset
    // — which is the bug being fixed: it used to stay nailed to the canvas.
    m.aimAt(W, H / 2);
    m.step(16, true);
    expect(m.place(g.baseX, g.baseY).x).toBeCloseTo(W / 2 + m.offsetX, 8);
    expect(m.offsetX).toBeCloseTo(-m.maxX, 8);
  });

  it("scales a region by the PICTURE, so a zoomed backdrop gets a bigger box", () => {
    const m = fitted();
    const picture = { width: m.pictureWidth, height: m.pictureHeight };
    const g = regionRectToBase({ x: 0, y: 0, w: 0.5, h: 0.5 }, picture);
    expect(g.width).toBeCloseTo(W * PAN_ZOOM * 0.5, 6);
    expect(g.height).toBeCloseTo(H * PAN_ZOOM * 0.5, 6);
  });

  it("baseToPicturePixels round-trips a region rect back to the fractions it came from", () => {
    const picture = { width: 2342.4, height: 1317.6 };
    const rect: HotspotRect = { x: 0.25, y: 0.4, w: 0.2, h: 0.1 };
    const g = regionRectToBase(rect, picture);
    const topLeft = baseToPicturePixels(g.baseX - g.width / 2, g.baseY - g.height / 2, picture);
    expect(topLeft.x / picture.width).toBeCloseTo(rect.x, 8);
    expect(topLeft.y / picture.height).toBeCloseTo(rect.y, 8);
    expect(g.width / picture.width).toBeCloseTo(rect.w, 8);
  });

  it("planRegionHotspots defaults to the view, so a non-panning scene is unchanged", () => {
    const rects: Record<string, HotspotRect> = { r: { x: 0.25, y: 0.5, w: 0.5, h: 0.25 } };
    const [flat] = planRegionHotspots(rects, ["r"], VIEW);
    if (!flat.shaped) throw new Error("unreachable");
    expect(flat.centerX).toBeCloseTo(0.5 * W, 10);
    expect(flat.baseX).toBeCloseTo(0.5 * W - W / 2, 10);
    // Handed a picture, the same rect gets picture-sized geometry instead.
    const [pinned] = planRegionHotspots(rects, ["r"], VIEW, { width: W * PAN_ZOOM, height: H * PAN_ZOOM });
    if (!pinned.shaped) throw new Error("unreachable");
    expect(pinned.width).toBeCloseTo(0.5 * W * PAN_ZOOM, 6);
    expect(pinned.baseX).toBeCloseTo((0.5 - 0.5) * W * PAN_ZOOM, 6);
  });
});
