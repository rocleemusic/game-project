/**
 * Proves the seam the whole prototype rests on: Lantern's ink engine, driven
 * against the real compiled story, with no fork and no reimplementation.
 *
 * Runs in Node rather than a browser deliberately — the engine is DOM-free, so
 * the binding can be regression-tested without a headless Chrome in the loop.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { LanternPlayer } from "../../tools/lantern/src/lib/play";
import { buildGraphIndex } from "../../tools/lantern/src/lib/playMap";
import type { Day, Graph } from "../../tools/lantern/src/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const story = path.resolve(here, "..", "public", "story");
const read = (f: string) => fs.readFileSync(path.join(story, f), "utf8");

const storyJson = read("story.json");
const graph = JSON.parse(read("graph.json")) as Graph;
const days: Day[] = [1, 2, 3, 4, 5].map((d) => JSON.parse(read(`day-${d}.json`)) as Day);

function newPlayer() {
  return new LanternPlayer(storyJson, buildGraphIndex(graph), days[0], undefined, days);
}

describe("the ink seam", () => {
  it("constructs the real story with all four EXTERNALs bound", () => {
    // With allowExternalFunctionFallbacks off inside LanternPlayer, an unbound
    // external throws on construction rather than silently returning zero.
    // Reaching this assertion at all is the proof.
    const p = newPlayer();
    expect(p.view().errors).toEqual([]);
  });

  it("is the inklecate format the Unreal seam also consumes", () => {
    expect(JSON.parse(storyJson).inkVersion).toBe(21);
  });

  it("runs to a real choice point", () => {
    const p = newPlayer();
    let n = 0;
    while (p.view().canContinue && n++ < 200) p.continueOnce();
    const v = p.view();
    expect(v.lines.length).toBeGreaterThan(0);
    expect(v.choices.length).toBeGreaterThan(0);
    expect(v.errors).toEqual([]);
  });

  it("reports the clock that ink owns, and the host never writes", () => {
    const p = newPlayer();
    let n = 0;
    while (p.view().canContinue && n++ < 200) p.continueOnce();
    const v = p.view();
    expect(v.day).toBeGreaterThanOrEqual(1);
    expect(["morning", "afternoon", "evening", "night"]).toContain(v.timeBlock);
    // RULED 2026-08-01: 3 moves per BLOCK, not per day.
    expect(v.movesLeft).toBeGreaterThan(0);
    expect(v.satchelCapacity).toBe(6);
    expect(v.armsCapacity).toBe(2);
  });

  it("opens on the day-1 start pick, before any screen", () => {
    const p = newPlayer();
    let n = 0;
    while (p.view().canContinue && n++ < 200) p.continueOnce();
    const v = p.view();
    // Day 1 offers "[Begin at X]" rather than dropping the player onto a
    // screen, so there is deliberately no #screen tag yet. ScreenScene renders
    // no backdrop here, which is correct rather than a missing asset.
    expect(v.pos.currentScreen).toBeNull();
    expect(v.choices.every((c) => c.kind === "move")).toBe(true);
    expect(v.choices.some((c) => c.display.includes("Begin at"))).toBe(true);
  });

  it("tags lines with the screen the backdrop is keyed on, once play enters one", () => {
    const p = newPlayer();
    let n = 0;
    while (p.view().canContinue && n++ < 200) p.continueOnce();

    const begin = p.view().choices.find((c) => c.display.includes("Begin at"));
    expect(begin).toBeDefined();
    p.choose(begin!.index);
    n = 0;
    while (p.view().canContinue && n++ < 200) p.continueOnce();

    const screen = p.view().pos.currentScreen;
    expect(screen).toBeTruthy();
    // Every screen ink can report must have a backdrop, or the scene renders
    // black. This is the check that catches a manifest/ink drift.
    const manifest = JSON.parse(read("manifest.json")) as Record<string, string>;
    expect(Object.keys(manifest)).toContain(screen!);
    expect(p.view().errors).toEqual([]);
  });

  it("advances through a choice without losing the story", () => {
    const p = newPlayer();
    let n = 0;
    while (p.view().canContinue && n++ < 200) p.continueOnce();
    const before = p.view().lines.length;

    p.choose(0);
    // Contract: choose only SELECTS. The option body — including any
    // ~ recordBond(...) — runs on the next continue.
    if (p.view().canContinue) p.continueOnce();

    expect(p.view().lines.length).toBeGreaterThan(before);
    expect(p.view().errors).toEqual([]);
  });
});

describe("the screen data the point-and-click layer needs", () => {
  const manifest = JSON.parse(read("manifest.json")) as Record<string, string>;
  const regions = (JSON.parse(read("regions.json")) as { screens?: Record<string, unknown> })
    .screens ?? {};

  it("maps every graph screen to a backdrop", () => {
    const missing = (graph.screens ?? [])
      .map((s) => s.screen_id)
      .filter((id) => !manifest[id]);
    expect(missing).toEqual([]);
  });

  it("carries authored hotspot geometry for every screen that declares regions (T11, 2026-08-24)", () => {
    // Was T1 only, with the other 19 screens riding the unshaped fallback
    // pill row — see ScreenScene / HotspotPlacement's header. The T11
    // region-authoring pass (2026-08-24) filled in T2-T8 and F1-F8, so this
    // now asserts full coverage instead of the old single-screen baseline.
    // If a NEW screen gains declared regions without matching geometry,
    // this is the assertion that should catch it going stale again.
    const declaredScreens = (graph.screens ?? [])
      .filter((s) => (s.regions ?? []).length > 0)
      .map((s) => s.screen_id)
      .sort();
    expect(Object.keys(regions).sort()).toEqual(declaredScreens);
    // Normalized fractions, which is what makes a fixed 1920x1080 canvas work
    // across backdrops that range from 447x447 to 2000x1333.
    for (const screenId of declaredScreens) {
      const shapes = regions[screenId] as Record<string, { x: number; y: number; w: number; h: number }>;
      for (const r of Object.values(shapes)) {
        for (const v of [r.x, r.y, r.w, r.h]) {
          expect(v).toBeGreaterThan(0);
          expect(v).toBeLessThanOrEqual(1);
        }
      }
    }
  });

  it("has no declared region left without authored geometry", () => {
    const declared = (graph.screens ?? []).flatMap((s) =>
      (s.regions ?? []).map((r) => ({ screen: s.screen_id, id: r.region_id })),
    );
    const unshaped = declared.filter(
      (d) => !(regions as Record<string, Record<string, unknown>>)[d.screen]?.[d.id],
    );
    expect(unshaped).toEqual([]);
  });
});
