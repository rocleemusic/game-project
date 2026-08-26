// walk.test.ts — the playtest proof: a 5-day week is traversable.
//
// CONTENT-AGNOSTIC BY CONTRACT. Every assertion below is about ids, topology,
// or termination. Not one of them looks at a line of prose. The slice's text is
// placeholder and gets rewritten in the prose pass; a test pinning a string
// would fight that pass and lose. Where an expectation depends on the content,
// the test DERIVES it from graph.json / day-N.json rather than hard-coding it,
// so re-authoring the week changes what the test expects instead of breaking it.

import { test } from "node:test";
import assert from "node:assert/strict";
import { join } from "node:path";
import { loadData, PACKAGE_ROOT } from "../src/data.ts";
import { loadTuning } from "../src/tuning.ts";
import { buildGraph, FESTIVAL_SCREEN_ID } from "../src/graph.ts";
import { emitInk } from "../src/ink.ts";
import { emitStoryJson } from "../src/story.ts";
import { resolveWeek, seedThreadsFromContent } from "../src/week.ts";
import { bondBandOf } from "../src/tuning.ts";
import {
  dayGateAllows,
  enumerateRoutes,
  endEachDayStrategy,
  firstChoiceStrategy,
  plannedStrategy,
  searchReachable,
  walkWeek,
  LABEL_END_DAY,
  PREFIX_TALK,
} from "../src/walk.ts";
import type { SearchResult, WalkInputs, WalkResult } from "../src/walk.ts";
import type { DayInput } from "../src/types.ts";

// ---------------------------------------------------------------------------
// One build of the real slice, shared by every test in the file.
// ---------------------------------------------------------------------------

const DATA_DIR = join(PACKAGE_ROOT, "data");
const data = loadData(DATA_DIR, []);
const tuning = loadTuning(DATA_DIR, []);
const graph = buildGraph(data, tuning);
const storyJson = emitStoryJson(emitInk(graph));

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

const SCENE_IDS = graph.scenes.map((s) => s.scene_id);
const CHOICE_IDS = graph.scenes.flatMap((s) => s.choice_nodes.map((n) => n.choice_id));
const OPTION_IDS = graph.scenes.flatMap((s) =>
  s.choice_nodes.flatMap((n) => n.options.map((o) => o.option_id)),
);
const SOUL_IDS = graph.souls.map((s) => s.soul_id);
const DAYS_PER_LIFE = graph.day_loop.days_per_life;

// A single search drives most of the assertions; running it once keeps the
// suite quick and makes every "unreachable" claim come from the same evidence.
const search: SearchResult = searchReachable(inputs, {
  maxScenePaths: 20_000,
  maxSceneDepth: 60,
  maxWeeks: 10,
  maxSteps: 5_000,
  maxMillis: 120_000,
});

// ---------------------------------------------------------------------------
// The week runs at all
// ---------------------------------------------------------------------------

test("the bare day loop terminates: five End-the-day choices reach the final sequence and END", () => {
  const result = walkWeek(inputs, endEachDayStrategy);
  assert.equal(result.ended, true, "the story reached -> END");
  assert.equal(result.truncated, false, "no step cap was hit");
  // The final sequence (RULED 2026-08-01, festival-night-transition-plan.md):
  // day_end intercepts BEFORE the increment on the life's last day, so day
  // never rolls past days_per_life any more — the old SYS-CYCLE-END
  // "day > days_per_life" ending is retired, and the final screen is now the
  // only way a life ends.
  assert.equal(
    result.finalDay,
    DAYS_PER_LIFE,
    `day must stay at days_per_life (${DAYS_PER_LIFE}); got ${result.finalDay}`,
  );
  // One "End the day" per day, plus two picks between each pair of days (D2,
  // GDD 08-levels.md: day's end always returns to the Home Hub, whose
  // "Open the calendar" pick — the ONLY way the calendar opens, GP-52 — is
  // followed by the calendar's own "Go to <location>" pick), for days 1-4,
  // plus ONE extra step for the single evening the once-only "Look around"
  // is still offered (choice 0 there; it loops back to the hub, GP-52,
  // rather than auto-opening the calendar) — plus the final sequence's own
  // four-step tail on day 5:
  // home_hub_final's flavor pick, its "Go to the Festival night" choice,
  // the Festival Grounds' "Begin the festival vignette" (offered BEFORE
  // "End the day" there, so this trivial strategy reaches it first — see
  // endEachDayStrategy), and the night screen's "Go to the results" (GP-51).
  assert.equal(
    result.steps,
    DAYS_PER_LIFE + (DAYS_PER_LIFE - 1) * 2 + 1 + 4,
    "days 1-4 plus the one-time look-around step, plus the final sequence's four-step tail on day 5",
  );
});

test("a played week completes and reaches the final sequence", () => {
  const week = search.verifiedWeek;
  assert.equal(week.ended, true, "the played week reached -> END");
  assert.equal(week.truncated, false, "no step cap was hit");
  assert.equal(
    week.finalDay,
    DAYS_PER_LIFE,
    `day must stay at days_per_life (${DAYS_PER_LIFE}); got ${week.finalDay}`,
  );
  assert.ok(week.scenesEntered.length > 0, "the week actually entered scenes");
});

test("a greedy first-choice walk also terminates (no dead end at index 0)", () => {
  // Always taking choice 0 loops on the first examinable, so this needs a cap;
  // what matters is that it never errors and never wedges the story.
  const result = walkWeek(inputs, firstChoiceStrategy, { maxSteps: 300 });
  assert.deepEqual(result.errors, [], "no story errors while spamming choice 0");
});

// ---------------------------------------------------------------------------
// story.onError never fires
// ---------------------------------------------------------------------------

test("story.onError never fires: externals all bound, no bad diverts", () => {
  assert.deepEqual(search.errors, [], "the search saw no story errors");
  assert.deepEqual(search.verifiedWeek.errors, [], "the verified week saw no story errors");
  assert.deepEqual(
    walkWeek(inputs, endEachDayStrategy).errors,
    [],
    "the bare loop saw no story errors",
  );
});

test("the four EXTERNALs are bound (fallbacks off) and actually fire", () => {
  // With allowExternalFunctionFallbacks = false an unbound EXTERNAL is an
  // onError, which the test above would catch. This one proves the bindings do
  // real work rather than sitting unused: a week that moves threads and earns
  // bond has called recordThreadMove and recordBond.
  const week = search.verifiedWeek;
  const authoredThreads = new Set(
    graph.scenes.flatMap((s) =>
      s.choice_nodes.flatMap((n) =>
        n.options.flatMap((o) => (o.state_actions ?? []).filter((a) => a.type === "thread_move").map((a) => a.arg)),
      ),
    ),
  );
  const authoredBond = graph.scenes.some((s) =>
    s.choice_nodes.some((n) =>
      n.options.some((o) => (o.state_actions ?? []).some((a) => a.type === "bond_event")),
    ),
  );
  if (authoredThreads.size > 0) {
    assert.ok(week.threadsMoved.length > 0, "recordThreadMove fired at least once");
    for (const id of week.threadsMoved) {
      assert.ok(authoredThreads.has(id), `thread "${id}" is authored somewhere`);
    }
  }
  if (authoredBond) {
    assert.ok(
      Object.values(week.bond).some((v) => v > 0),
      "recordBond fired at least once in a real week",
    );
  }
});

// ---------------------------------------------------------------------------
// Every authored scene: entered, or listed unreachable with a reason
// ---------------------------------------------------------------------------

test("every authored scene is either entered or explicitly unreachable with a reason", () => {
  const reachable = new Set(search.reachableScenes);
  const unreachable = new Map(search.unreachableScenes.map((u) => [u.id, u.reason]));

  for (const sceneId of SCENE_IDS) {
    const entered = reachable.has(sceneId);
    const excused = unreachable.has(sceneId);
    assert.ok(
      entered !== excused,
      `scene ${sceneId} must be exactly one of entered / unreachable-with-reason ` +
        `(entered=${entered}, unreachable=${excused})`,
    );
    if (excused) {
      const reason = unreachable.get(sceneId)!;
      assert.ok(reason.length > 20, `scene ${sceneId} needs a real diagnosis, got "${reason}"`);
    }
  }
  // Nothing may be listed that is not an authored scene.
  for (const id of [...reachable, ...unreachable.keys()]) {
    assert.ok(SCENE_IDS.includes(id), `"${id}" is not an authored scene_id`);
  }
});

test("every authored scene is reachable: some week really enters each one", () => {
  // Stronger than the partition test above: on THIS slice no scene may be
  // excused at all. Every scene the graph authors has to be entered by some
  // planned week — derived from graph.json, so authoring a new scene extends
  // the expectation instead of breaking it. This is the regression guard for
  // the phantom-final-screen bug: enumerateRoutes used to emit routes one
  // screen longer than a day can actually walk (evening's budget-exhausting
  // move goes home, it never arrives), and the planner kept scheduling
  // SC-T6-01 on that phantom visit, so it was never entered.
  assert.deepEqual(
    [...search.reachableScenes].sort(),
    [...SCENE_IDS].sort(),
    "every authored scene must be entered by some searched week",
  );
});

test("no route promises more screens than a day can actually stand on", () => {
  // A day truly arrives on 3*moves_per_day - 1 screens (the start plus every
  // move EXCEPT evening's last, which sends the player home — emitMoveTo in
  // ink.ts). A longer route promises a visit the walk never makes.
  const maxArrivals = 3 * graph.day_loop.moves_per_day - 1;
  for (const route of enumerateRoutes(graph)) {
    assert.ok(
      route.screens.length <= maxArrivals,
      `route ${route.screens.join(">")} has ${route.screens.length} screens; ` +
        `a day only ever stands on ${maxArrivals}`,
    );
    assert.equal(route.visits.length, route.screens.length, "one visit per screen");
  }
});

test("a truncated search can never be read as a proof of unreachability", () => {
  // This is the guardrail on the test above. If a bound trips, the
  // unreachable list means "not found within budget" — so the suite says so
  // loudly rather than letting a budget miss masquerade as a content defect.
  assert.equal(
    search.bounds.hit,
    false,
    "search bound hit, so the unreachable lists are INCONCLUSIVE: " +
      JSON.stringify(search.bounds.reasons),
  );
  assert.deepEqual(
    search.bounds.unexploredScenes,
    [],
    "a scene the world layer can open must actually get opened by some week",
  );
});

test("GP-142: the wall-clock backstop never fires — the search is bounded by work done", () => {
  // bounds.hit can still legitimately be true above for a CONTENT reason (a
  // scene a planner bug never schedules, tracked separately) without this
  // ever being true. timeBackstopHit means specifically that maxMillis, not
  // maxWeeks/maxSteps/maxScenePaths, is what cut the search short — that is
  // a machine-load artifact, not a fact about the story, and it should never
  // fire against this content at the budgets above.
  assert.equal(
    search.bounds.timeBackstopHit,
    false,
    "the wall-clock backstop fired, so everything above is load-truncated, not content-truncated: " +
      JSON.stringify(search.bounds.reasons),
  );
});

test("reported ids are authored ids, and reachable/unreachable partition them", () => {
  const seenChoices = new Set(search.reachableChoiceNodes);
  const missChoices = new Set(search.unreachableChoiceNodes.map((u) => u.id));
  assert.equal(seenChoices.size + missChoices.size, CHOICE_IDS.length);
  for (const id of CHOICE_IDS) {
    assert.ok(seenChoices.has(id) !== missChoices.has(id), `choice ${id} counted exactly once`);
  }

  const seenOptions = new Set(search.reachableOptions);
  const missOptions = new Set(search.unreachableOptions.map((u) => u.id));
  assert.equal(seenOptions.size + missOptions.size, OPTION_IDS.length);
  for (const id of OPTION_IDS) {
    assert.ok(seenOptions.has(id) !== missOptions.has(id), `option ${id} counted exactly once`);
  }
  for (const u of [...search.unreachableChoiceNodes, ...search.unreachableOptions]) {
    assert.ok(u.reason.length > 10, `${u.id} needs a real diagnosis, got "${u.reason}"`);
  }
});

test("nothing is unreachable for a reason that is not by design", () => {
  // The search is exhaustive inside every scene it enters, so anything left
  // classified "defect" is a real authoring problem: a gate no playable week
  // can satisfy. "scene-unexplored" is a search shortfall and equally not OK.
  const bad = [...search.unreachableChoiceNodes, ...search.unreachableOptions].filter(
    (u) => !u.expected,
  );
  assert.deepEqual(
    bad.map((u) => `${u.id} [${u.kind}] ${u.reason}`),
    [],
    "unreachable for a reason that is not by design",
  );
  assert.deepEqual(
    search.unreachableScenes.filter((u) => !u.expected).map((u) => `${u.id}: ${u.reason}`),
    [],
    "every authored scene should be playable in some week",
  );
});

test("a band-gated beat one life cannot reach is EXPECTED, not a defect", () => {
  // The ruling is "one attentive life earns mid, a second life earns high", so
  // a `bond_band(soul) = high` beat being out of reach inside one life is the
  // design working. Anything else unreachable is a defect. This test derives
  // the distinction rather than naming beats: it re-checks each note the
  // search excused against that soul's own achieved max and the tuned
  // threshold, so re-tuning or re-authoring moves the expectation with it.
  const excused = [...search.unreachableChoiceNodes, ...search.unreachableOptions].filter(
    (u) => u.kind === "band-needs-another-life",
  );
  for (const note of excused) {
    assert.equal(note.expected, true, `${note.id} is excused, so it must be marked expected`);
  }
  // And the excuse must be true: for every band-gated node that stayed
  // unreached, the band it asks for really is beyond one life.
  const seenChoices = new Set(search.reachableChoiceNodes);
  const { mid_min, high_min } = graph.bond.band_thresholds;
  for (const scene of graph.scenes) {
    for (const node of scene.choice_nodes) {
      if (seenChoices.has(node.choice_id)) continue;
      for (const cond of node.availability_conditions) {
        const m = cond.trim().match(/^bond_band\(([^)]+)\)\s*=\s*(low|mid|high)$/);
        if (!m) continue;
        const need = m[2] === "high" ? high_min : m[2] === "mid" ? mid_min : 0;
        assert.ok(
          (search.maxBond[m[1]]?.achieved ?? 0) < need,
          `${node.choice_id} asks for ${m[2]} (needs ${need}) and ${m[1]} reaches ` +
            `${search.maxBond[m[1]]?.achieved}, so it should have been offered`,
        );
      }
    }
  }
});

test("a day-gated scene is entered on a day its gate allows", () => {
  // Derived, not hard-coded: for every scene carrying a `day <op> N` gate, the
  // week that played it must have entered it on a day satisfying that gate.
  // Entering earlier plays nothing AND spends the once-only entry.
  const seenChoices = new Set(search.reachableChoiceNodes);
  for (const scene of graph.scenes) {
    const gated = scene.choice_nodes.filter((n) =>
      n.availability_conditions.some((c) => /^day\s*(>=|<=|==|=|>|<)\s*\d+$/.test(c.trim())),
    );
    if (gated.length === 0) continue;
    if (!search.reachableScenes.includes(scene.scene_id)) continue;
    const { mid_min, high_min } = graph.bond.band_thresholds;
    for (const node of gated) {
      // A node that ALSO needs a bond_band this one life cannot reach is
      // already excused by "a band-gated beat one life cannot reach is
      // EXPECTED, not a defect" above — this test is about the day gate, not
      // the band gate, so it does not re-litigate that exemption.
      const needsUnreachableBand = node.availability_conditions.some((c) => {
        const m = c.trim().match(/^bond_band\(([^)]+)\)\s*=\s*(low|mid|high)$/);
        if (!m) return false;
        const need = m[2] === "high" ? high_min : m[2] === "mid" ? mid_min : 0;
        return (search.maxBond[m[1]]?.achieved ?? 0) < need;
      });
      if (needsUnreachableBand) continue;
      assert.ok(
        seenChoices.has(node.choice_id),
        `${node.choice_id} is day-gated ${JSON.stringify(node.availability_conditions)} and ` +
          `${scene.scene_id} is reachable, so some week must enter it on a day the gate allows`,
      );
    }
  }
});

// ---------------------------------------------------------------------------
// Determinism
// ---------------------------------------------------------------------------

test("determinism: the same strategy twice gives byte-identical results", () => {
  const a = walkWeek(inputs, plannedStrategy(search.verifiedPlan));
  const b = walkWeek(inputs, plannedStrategy(search.verifiedPlan));
  assert.equal(JSON.stringify(a), JSON.stringify(b));

  const c = walkWeek(inputs, endEachDayStrategy);
  const d = walkWeek(inputs, endEachDayStrategy);
  assert.equal(JSON.stringify(c), JSON.stringify(d));
});

test("determinism: a fresh Walker is independent of any earlier walk", () => {
  // Once-only ink choices are per-Story; a leaked Story would show up as a
  // second walk entering fewer scenes than the first.
  const first = walkWeek(inputs, plannedStrategy(search.verifiedPlan));
  walkWeek(inputs, firstChoiceStrategy, { maxSteps: 120 });
  const again = walkWeek(inputs, plannedStrategy(search.verifiedPlan));
  assert.deepEqual(again.scenesEntered, first.scenesEntered);
  assert.deepEqual(again.bond, first.bond);
});

test("determinism: searchReachable repeats itself (timings aside)", () => {
  const second = searchReachable(inputs, {
    maxScenePaths: 20_000,
    maxSceneDepth: 60,
    maxWeeks: 10,
    maxSteps: 5_000,
    maxMillis: 120_000,
  });
  const strip = (r: SearchResult): string =>
    JSON.stringify({ ...r, bounds: { ...r.bounds, millis: 0 } });
  assert.equal(strip(second), strip(search));
});

// ---------------------------------------------------------------------------
// Bond: one hidden count per soul, band mirrored from it
// ---------------------------------------------------------------------------

test("bond is ONE number per soul — never a per-category score", () => {
  const week = search.verifiedWeek;
  assert.deepEqual(Object.keys(week.bond).sort(), [...SOUL_IDS].sort());
  for (const soul of SOUL_IDS) {
    assert.equal(typeof week.bond[soul], "number", `${soul} carries a single count`);
  }
  // A per-category leak would show up as a key like "toby.Trust".
  for (const key of Object.keys(week.bond)) {
    assert.ok(!key.includes("."), `bond key "${key}" looks like a per-category sub-score`);
  }
});

test("the band reported for each soul is derived from that soul's count", () => {
  const week = search.verifiedWeek;
  for (const soul of SOUL_IDS) {
    assert.equal(week.bands[soul], bondBandOf(week.bond[soul], graph.bond), `band for ${soul}`);
  }
});

test("max bond per soul: achieved in a real week, and never above its ceiling", () => {
  for (const soul of SOUL_IDS) {
    const m = search.maxBond[soul];
    assert.ok(m, `${soul} has a max-bond entry`);
    assert.ok(m.achieved >= 0, `${soul} bond is non-negative`);
    assert.ok(
      m.achieved <= m.upperBound + 1e-9,
      `${soul} achieved ${m.achieved} above its ceiling ${m.upperBound}`,
    );
    assert.equal(m.band, bondBandOf(m.achieved, graph.bond), `${soul} band matches its count`);
    // A shortfall against the ceiling has to be explained, not shrugged at.
    assert.equal(
      m.exact,
      m.blockedBy.length === 0,
      `${soul}: exact=${m.exact} but blockedBy=${JSON.stringify(m.blockedBy)}`,
    );
    for (const id of [...m.scenesUsed, ...m.blockedBy]) {
      assert.ok(SCENE_IDS.includes(id), `${soul} cites ${id}, which is not an authored scene`);
    }
    assert.deepEqual(
      m.scenesUsed.filter((id) => m.blockedBy.includes(id)),
      [],
      `${soul}: a scene cannot be both used and blocked`,
    );
  }
});

test("a soul's max-bond figure is backed by a week that really ran", () => {
  // Each soul's number comes from ITS optimal week, so it is >= what the
  // all-souls verified week scored — never less, or the search reported a
  // figure no walk actually produced.
  for (const soul of SOUL_IDS) {
    assert.ok(
      search.maxBond[soul].achieved >= (search.verifiedWeek.bond[soul] ?? 0) - 1e-9,
      `${soul}: reported max ${search.maxBond[soul].achieved} is below the ` +
        `${search.verifiedWeek.bond[soul]} the verified week already scored`,
    );
  }
});

test("souls with an authored, reachable bond_event end the week above zero", () => {
  const reached = new Set(search.reachableScenes);
  const shouldMove = new Set<string>();
  for (const scene of graph.scenes) {
    if (!reached.has(scene.scene_id)) continue;
    for (const node of scene.choice_nodes) {
      for (const opt of node.options) {
        if ((opt.state_actions ?? []).some((a) => a.type === "bond_event")) shouldMove.add(scene.soul);
      }
    }
  }
  for (const soul of shouldMove) {
    assert.ok(
      search.maxBond[soul].achieved > 0,
      `${soul} has reachable bond_events but the best week scored ${search.maxBond[soul].achieved}`,
    );
  }
});

// ---------------------------------------------------------------------------
// Topology of what the walk recorded
// ---------------------------------------------------------------------------

test("a walk only ever reports authored ids", () => {
  const week = search.verifiedWeek;
  for (const id of week.scenesEntered) assert.ok(SCENE_IDS.includes(id), `scene ${id} is authored`);
  for (const id of week.choiceNodesEntered) assert.ok(CHOICE_IDS.includes(id), `choice ${id} is authored`);
  for (const id of week.optionsTaken) assert.ok(OPTION_IDS.includes(id), `option ${id} is authored`);
  assert.equal(new Set(week.scenesEntered).size, week.scenesEntered.length, "no scene entered twice");
});

test("a scene entry is once-only across the whole week", () => {
  // Every "Talk to" the walk took corresponds to a distinct scene; ink's `*`
  // makes the entry once-only for the life of the Story, and the trace must
  // show that rather than re-offering a spent scene.
  const talks = search.verifiedWeek.trace.filter((t) => t.text.startsWith(PREFIX_TALK));
  assert.equal(
    talks.length,
    search.verifiedWeek.scenesEntered.length,
    "one Talk-to per scene entered",
  );
});

test("scene opportunities are consistent with the day files and the map", () => {
  const routes = enumerateRoutes(graph);
  assert.ok(routes.length > 0, "the map yields at least one day route");
  const visitable = new Set<string>();
  for (const r of routes) for (const v of r.visits) visitable.add(`${v.screen}|${v.block}`);
  // The final sequence (RULED 2026-08-01): night is entered by choice from
  // home_hub_final, not by movement, so it is never one of enumerateRoutes'
  // own visits — mirror walk.ts's own worldFacts exception here.
  visitable.add(`${FESTIVAL_SCREEN_ID}|night`);

  for (const o of search.opportunities) {
    const scene = graph.scenes.find((s) => s.scene_id === o.scene_id)!;
    // `live` must agree with the scene's own day gates on that day.
    const anyOpen = scene.choice_nodes.length === 0 ||
      scene.choice_nodes.some((n) => dayGateAllows(n.availability_conditions, o.day));
    assert.equal(o.live, anyOpen, `${o.scene_id} liveness on day ${o.day}`);
    assert.equal(o.screen, scene.screen_id, `${o.scene_id} opportunity is on its own screen`);
    assert.ok(visitable.has(`${o.screen}|${o.block}`), `${o.screen} is enterable at ${o.block}`);
    const day = days.find((d) => d.day === o.day)!;
    assert.ok(
      day.slot_fill.some((f) => f.soul === scene.soul && f.screen_id === o.screen && f.time_block === o.block),
      `day ${o.day} places ${scene.soul} at ${o.screen}/${o.block}`,
    );
  }
  // Every scene the search entered had to have a LIVE opportunity first.
  const withLive = new Set(search.opportunities.filter((o) => o.live).map((o) => o.scene_id));
  for (const id of search.reachableScenes) {
    assert.ok(withLive.has(id), `${id} was entered, so it must have a live opportunity`);
  }
});

test("enumerateRoutes reads connects_to as a path, not a one-way door", () => {
  // Derived: for every authored connection, a day route must be able to cross
  // it in BOTH directions. Reading it as directed is what made T6/T7/T8/F6/F7/F8
  // declare exits and have no entrances.
  const routes = enumerateRoutes(graph);
  const crossed = new Set<string>();
  for (const r of routes) {
    for (let i = 1; i < r.screens.length; i++) crossed.add(`${r.screens[i - 1]}>${r.screens[i]}`);
  }
  const ids = new Set(graph.screens.map((s) => s.screen_id));
  const reachable = new Set<string>();
  for (const r of routes) for (const s of r.screens) reachable.add(s);
  for (const screen of graph.screens) {
    for (const c of screen.connects_to ?? []) {
      const other = typeof c === "string" ? c : c.screen_id;
      if (!ids.has(other)) continue;
      // Only assert on links both of whose ends a week can actually stand on.
      if (!reachable.has(screen.screen_id) || !reachable.has(other)) continue;
      assert.ok(
        crossed.has(`${screen.screen_id}>${other}`) && crossed.has(`${other}>${screen.screen_id}`),
        `${screen.screen_id} <-> ${other} must be walkable both ways`,
      );
    }
  }
});

test("presence is re-applied mid-day, not just at day start", () => {
  // Derived, not hard-coded: if the week offers a scene at a block later than
  // morning, a walk must actually take one — which only works if present_<soul>
  // is refreshed after advance_time() and before the hub evaluates its guards.
  const laterThanMorning = search.opportunities.filter((o) => o.block !== "morning");
  if (laterThanMorning.length === 0) return;
  const reachableLater = laterThanMorning.filter((o) => search.reachableScenes.includes(o.scene_id));
  if (reachableLater.length === 0) return;
  const taken = search.verifiedWeek.trace.filter(
    (t) => t.text.startsWith(PREFIX_TALK) && t.timeBlock !== "morning",
  );
  assert.ok(
    taken.length > 0,
    "no scene was entered after morning, so presence is not being re-applied mid-day",
  );
});

test("the day loop spends moves and advances the clock", () => {
  const week = search.verifiedWeek;
  const perDay = new Map<number, Set<string>>();
  for (const t of week.trace) {
    const set = perDay.get(t.day) ?? new Set<string>();
    set.add(t.timeBlock);
    perDay.set(t.day, set);
  }
  const anyDayMoved = [...perDay.values()].some((blocks) => blocks.size > 1);
  assert.ok(anyDayMoved, "at least one day advanced past its opening time block");
  for (const [day, blocks] of perDay) {
    assert.ok(
      blocks.size <= graph.day_loop.moves_per_day + 1,
      `day ${day} touched ${blocks.size} blocks, more than moves_per_day + 1`,
    );
  }
});

// ---------------------------------------------------------------------------
// The walker's own contract
// ---------------------------------------------------------------------------

test("walkWeek rejects a strategy that returns an out-of-range index", () => {
  assert.throws(() => walkWeek(inputs, () => 99), /outside 0\.\./);
  assert.throws(() => walkWeek(inputs, () => -1), /outside 0\.\./);
});

test("the step cap truncates rather than hanging, and says so", () => {
  const capped: WalkResult = walkWeek(inputs, firstChoiceStrategy, { maxSteps: 5 });
  assert.equal(capped.truncated, true);
  assert.equal(capped.ended, false);
  assert.equal(capped.steps, 5);
});

test("the world layer always offers a way to end the day", () => {
  // The generated navigation label the walker keys on must exist at every
  // world choice point, or the walker's scene/world discriminator is wrong.
  // A day that spends its full 3-moves-per-block budget (RULED 2026-08-01:
  // morning -> afternoon -> evening) ends automatically once evening's
  // budget runs out, with no explicit End-the-day pick needed; a day whose
  // planned route stops touring early falls back to picking it. Either way
  // every day must actually conclude one of the two ways.
  const week = search.verifiedWeek;
  const worldSteps = week.trace.filter((t) => t.scene === null);
  assert.ok(worldSteps.length >= DAYS_PER_LIFE, "the week made world-layer choices");
  const blocksByDay = new Map<number, Set<string>>();
  for (const t of worldSteps) {
    const blocks = blocksByDay.get(t.day) ?? new Set<string>();
    blocks.add(t.timeBlock);
    blocksByDay.set(t.day, blocks);
  }
  for (const [day, blocks] of blocksByDay) {
    const ranOutInEvening = blocks.has("evening");
    const explicitlyEnded = week.trace.some((t) => t.day === day && t.text === LABEL_END_DAY);
    assert.ok(
      ranOutInEvening || explicitlyEnded,
      `day ${day} neither reached evening's move-out nor explicitly ended the day`,
    );
  }
});
