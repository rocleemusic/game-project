// festival-night.test.ts — encodes the rulings from
// plans/2026-08-01-festival-night-transition-plan.md, section F:
//   - night is entered only from home_hub_final on day days_per_life, only
//     by choice
//   - no path from night back into any day-cycle knot (one-way final
//     sequence)
//   - the vignette is reachable both early (by choice) and by completing
//     all night scenes
//   - advance_time() still never produces night
//   - day 1-4 evenings still land on the normal home_hub/calendar
//     (regression guard)
//
// CONTENT-AGNOSTIC BY CONTRACT, same rule as walk.test.ts: every assertion
// is about ids, tags, and topology, never a line of placeholder prose.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { loadData, PACKAGE_ROOT } from "../src/data.ts";
import { loadTuning } from "../src/tuning.ts";
import { buildGraph, HOME_SCREEN_ID, FESTIVAL_SCREEN_ID, NIGHT_SCREEN_ID, FINAL_SCREEN_ID } from "../src/graph.ts";
import { emitInk } from "../src/ink.ts";
import { emitStoryJson } from "../src/story.ts";
import { resolveWeek, seedThreadsFromContent } from "../src/week.ts";
import { Walker, LABEL_END_DAY, LABEL_BEGIN_VIGNETTE, LABEL_GO_RESULTS, PREFIX_TALK, PREFIX_GO } from "../src/walk.ts";
import type { WalkInputs } from "../src/walk.ts";
import type { DayInput } from "../src/types.ts";

const DATA_DIR = join(PACKAGE_ROOT, "data");
const data = loadData(DATA_DIR, []);
const tuning = loadTuning(DATA_DIR, []);
const graph = buildGraph(data, tuning);
const files = emitInk(graph);
const mainInk = files.get("main.ink")!;
const storyJson = emitStoryJson(files);

const weekBase: Omit<DayInput, "day"> = {
  slot: 1,
  life: 1,
  picked_location: "town",
  threads: [],
  lead_pool: ["LEAD-01", "LEAD-02", "LEAD-03"],
  aliveness_band: "quiet",
};
const days = resolveWeek(data, weekBase, tuning, {
  seedThreads: seedThreadsFromContent(data),
});
const inputs: WalkInputs = { storyJson, graph, days };
const DAYS_PER_LIFE = graph.day_loop.days_per_life;

/** Drive one walker to end every day up to (not including) days_per_life, by
 * always taking "End the day" / the sticky fallback — mirrors
 * endEachDayStrategy but as a hand-crankable loop so a test can pause mid-day
 * 5. Caps the step count so a stuck walk fails loudly instead of hanging. */
function driveToHomeHubFinal(walker: Walker): void {
  let steps = 0;
  while (true) {
    const ctx = walker.context();
    if (ctx.screen === HOME_SCREEN_ID && ctx.choices.some((c) => c.text.startsWith(PREFIX_GO + "the Festival"))) {
      return; // standing at home_hub_final's hub_final stitch
    }
    const endDay = ctx.choices.findIndex((c) => c.text === LABEL_END_DAY);
    walker.choose(endDay >= 0 ? endDay : 0);
    steps += 1;
    if (steps > 200) throw new Error("never reached home_hub_final — walk stuck");
  }
}

// ---------------------------------------------------------------------------
// Night is entered only from home_hub_final, only by choice
// ---------------------------------------------------------------------------

test("TimeOfDay = night is written exactly once in the whole story, inside home_hub_final", () => {
  const writes = [...mainInk.matchAll(/TimeOfDay\s*=\s*night/g)];
  assert.equal(writes.length, 1, "night must be written exactly once");
  const homeHubFinalStart = mainInk.indexOf("=== home_hub_final ===");
  const nextKnot = mainInk.indexOf("\n=== ", homeHubFinalStart + 1);
  assert.ok(homeHubFinalStart >= 0, "home_hub_final must exist");
  assert.ok(
    writes[0].index! > homeHubFinalStart && writes[0].index! < nextKnot,
    "the single TimeOfDay = night write must sit inside home_hub_final",
  );
});

test("home_hub_final offers no calendar — its only forward option is the Festival", () => {
  const start = mainInk.indexOf("=== home_hub_final ===");
  const end = mainInk.indexOf("\n=== festival_vignette ===");
  const block = mainInk.slice(start, end);
  assert.doesNotMatch(block, /Pick tomorrow's destination/, "no calendar prompt inside the final sequence");
  assert.doesNotMatch(block, /pickedStartScreen\s*=/, "no calendar write inside the final sequence");
  const goChoices = [...block.matchAll(/^\+ \[Go to ([^\]]+)\]/gm)].map((m) => m[1]);
  assert.deepEqual(goChoices, ["the Festival night"], "the only Go-to choice is the Festival");
});

test("walking day 5's evening to its end reaches home_hub_final, and choosing the Festival writes night and lands on T7", () => {
  const walker = new Walker(inputs);
  walker.pump();
  driveToHomeHubFinal(walker);

  // Standing in home_hub_final now (RULED: no calendar left on the last day).
  assert.equal(walker.context().screen, HOME_SCREEN_ID, "still tagged HOME (D2 precedent)");
  assert.equal(walker.context().day, DAYS_PER_LIFE, "arrived at the life's last day, day untouched by home_hub_final");
  let ctx = walker.context();
  assert.ok(
    !ctx.choices.some((c) => c.text === "Start the Next Day"),
    "home_hub_final must not offer the ordinary calendar",
  );
  const goFestival = ctx.choices.findIndex((c) => c.text === "Go to the Festival night");
  assert.ok(goFestival >= 0, "home_hub_final offers Go to the Festival night");

  walker.choose(goFestival);
  ctx = walker.context();
  assert.equal(ctx.timeBlock, "night", "choosing the Festival writes TimeOfDay = night");
  assert.equal(ctx.screen, FESTIVAL_SCREEN_ID, "the Festival choice lands on the Festival Grounds");
  assert.equal(ctx.day, DAYS_PER_LIFE, "day is untouched by the final sequence's own hub");
});

// ---------------------------------------------------------------------------
// One-way: no path from night back into the ordinary day cycle
// ---------------------------------------------------------------------------

test("festival_vignette and final_screen contain no divert back into the day cycle", () => {
  const vignetteStart = mainInk.indexOf("=== festival_vignette ===");
  // begin_new_year (T13, 2026-08-23 ruling) is HOST-DIVERT-ONLY: no choice
  // anywhere above ever diverts into it, and the host only jumps there from
  // final_screen's parked END on an explicit player "continue". It legitimately
  // contains "-> day_start" to reset the clock, so the one-way scan below stops
  // before it rather than reading that knot as a reachable path back.
  const beginNewYearStart = mainInk.indexOf("\n=== begin_new_year ===");
  const tail = mainInk.slice(vignetteStart, beginNewYearStart === -1 ? undefined : beginNewYearStart);
  for (const forbidden of ["-> home_hub\n", "-> calendar", "-> day_start", "-> screen_hub"]) {
    assert.doesNotMatch(
      tail,
      new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")),
      `${forbidden.trim()} must not appear from festival_vignette onward`,
    );
  }
  assert.match(tail, /-> END/, "final_screen must still end the story");
});

test("day_end's old day-overrun ending is retired: day can never exceed days_per_life", () => {
  assert.doesNotMatch(mainInk, /day\s*>\s*\d+/, "no day-overrun check remains in main.ink");
  assert.doesNotMatch(mainInk, /SYS-CYCLE-END/, "the retired ending's id must not appear");
});

// ---------------------------------------------------------------------------
// The vignette: reachable early by choice, and by completing every night scene
// ---------------------------------------------------------------------------

function nightScenesOnFestivalScreen(): string[] {
  return graph.scenes.filter((s) => s.screen_id === FESTIVAL_SCREEN_ID).map((s) => s.scene_id);
}

test("the vignette is reachable early, before any night scene is played", () => {
  const walker = new Walker(inputs);
  walker.pump();
  driveToHomeHubFinal(walker);
  const goFestival = walker.context().choices.findIndex((c) => c.text === "Go to the Festival night");
  walker.choose(goFestival);
  assert.equal(walker.context().screen, FESTIVAL_SCREEN_ID);

  const vignette = walker.context().choices.findIndex((c) => c.text === LABEL_BEGIN_VIGNETTE);
  assert.ok(vignette >= 0, "the vignette choice is offered immediately at night");
  walker.choose(vignette);
  // festival_vignette is placeholder-only and falls straight through to
  // night_screen (GP-51) — so by the time pump() settles the tracked screen
  // is already TN. What proves "reached the vignette before playing any
  // scene" is that no scene was ever entered on the way there.
  const result = walker.result(false, []);
  assert.equal(result.scenesEntered.length, 0, "no night scene was played before the vignette");
  assert.equal(walker.context().screen, NIGHT_SCREEN_ID, "the vignette falls straight through to the night screen");
});

test("the vignette starts automatically once every night scene has been played", () => {
  const nightScenes = nightScenesOnFestivalScreen();
  assert.ok(nightScenes.length > 0, "the Festival Grounds must carry at least one night scene to test this");

  const walker = new Walker(inputs);
  walker.pump();
  driveToHomeHubFinal(walker);
  const goFestival = walker.context().choices.findIndex((c) => c.text === "Go to the Festival night");
  walker.choose(goFestival);

  // At the world layer (the T7 hub), always take the next unplayed night
  // scene; inside a scene (ctx.inWorld false), take whatever is offered —
  // content-agnostic, same as firstChoiceStrategy elsewhere in walk.test.ts —
  // to play it through to its own gather and back to the hub.
  let steps = 0;
  while (walker.context().screen === FESTIVAL_SCREEN_ID) {
    const ctx = walker.context();
    if (!ctx.inWorld) {
      walker.choose(0);
    } else {
      const talk = ctx.choices.findIndex((c) => c.text.startsWith(PREFIX_TALK));
      if (talk < 0) break; // no scene left to play — the hub should auto-divert on its own
      walker.choose(talk);
    }
    steps += 1;
    if (steps > 300) throw new Error("never left the Festival Grounds — auto-divert missing");
  }
  assert.equal(
    walker.context().screen,
    NIGHT_SCREEN_ID,
    "once every night scene is spent, the hub auto-diverts to the vignette, which falls straight through to the night screen",
  );
  for (const id of nightScenes) {
    assert.ok(walker.dayOfSceneEntry(id) !== undefined, `${id} must have been entered on the way`);
  }
});

test("the night screen sits between the vignette and the final screen, then the story ends", () => {
  const walker = new Walker(inputs);
  walker.pump();
  driveToHomeHubFinal(walker);
  walker.choose(walker.context().choices.findIndex((c) => c.text === "Go to the Festival night"));
  walker.choose(walker.context().choices.findIndex((c) => c.text === LABEL_BEGIN_VIGNETTE));
  // GP-51: the night-version screen holds the play here — it does not fall
  // straight through to the results.
  assert.equal(walker.context().screen, NIGHT_SCREEN_ID, "the vignette lands on the night screen, not the final screen");
  assert.equal(walker.context().timeBlock, "night", "still night on the night screen");
  const goResults = walker.context().choices.findIndex((c) => c.text === LABEL_GO_RESULTS);
  assert.ok(goResults >= 0, "the night screen offers its single forward option");
  walker.choose(goResults);
  assert.equal(walker.context().screen, FINAL_SCREEN_ID, "the results choice lands on the final screen");
  const result = walker.result(false, []);
  assert.equal(result.ended, true, "the story reaches -> END from final_screen");
  assert.deepEqual(result.errors, [], "no story errors along the way");
});

// ---------------------------------------------------------------------------
// advance_time() never produces night
// ---------------------------------------------------------------------------

test("advance_time() only ever cycles morning -> afternoon -> evening", () => {
  const start = mainInk.indexOf("=== function advance_time() ===");
  const end = mainInk.indexOf("\n\n", start);
  const block = mainInk.slice(start, end < 0 ? undefined : end);
  assert.doesNotMatch(block, /TimeOfDay\s*=\s*night/, "advance_time must never write night");
  assert.match(block, /TimeOfDay\s*=\s*afternoon/);
  assert.match(block, /TimeOfDay\s*=\s*evening/);
});

// ---------------------------------------------------------------------------
// Regression guard: days 1..(DAYS_PER_LIFE - 1) are unchanged
// ---------------------------------------------------------------------------

test("evenings before the life's last day still land on the ordinary home_hub/calendar", () => {
  const walker = new Walker(inputs);
  walker.pump();
  for (let d = 1; d < DAYS_PER_LIFE; d++) {
    let steps = 0;
    while (walker.context().day === d) {
      const ctx = walker.context();
      const endDay = ctx.choices.findIndex((c) => c.text === LABEL_END_DAY);
      walker.choose(endDay >= 0 ? endDay : 0);
      steps += 1;
      if (steps > 200) throw new Error(`day ${d} never ended`);
    }
    const ctx = walker.context();
    assert.equal(ctx.screen, HOME_SCREEN_ID, `day ${d} ends at the Home Hub`);
    assert.equal(ctx.timeBlock, "morning", `day ${d + 1} has already begun by the time the hub renders`);
    assert.notEqual(ctx.day, d, "the calendar path increments day, unlike home_hub_final");
  }
});
