import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { loadData, PACKAGE_ROOT } from "../src/data.ts";
import { bondBandOf, bondDelta, DEFAULT_TUNING, loadTuning } from "../src/tuning.ts";
import type { Tuning } from "../src/tuning.ts";
import { resolveDay } from "../src/day.ts";
import { buildGraph } from "../src/graph.ts";
import type { DayInput } from "../src/types.ts";

const DATA_DIR = join(PACKAGE_ROOT, "data");

const baseInput: DayInput = {
  slot: 1,
  life: 2,
  day: 3,
  picked_location: "town",
  threads: [
    { thread_id: "giver-receive", soul: "toby", status: "live" },
    { thread_id: "keeper-loss", soul: "mara", status: "unstarted" },
  ],
  lead_pool: ["LEAD-01", "LEAD-02", "LEAD-03", "LEAD-04"],
  aliveness_band: "quiet",
};

const withTuning = (patch: Partial<{ [K in keyof Tuning]: Partial<Tuning[K]> }>): Tuning => {
  const t = structuredClone(DEFAULT_TUNING);
  for (const [k, v] of Object.entries(patch)) Object.assign((t as any)[k], v);
  return t;
};

const hash = (v: unknown) => createHash("sha256").update(JSON.stringify(v)).digest("hex");

// ---------- loader ----------

test("loadTuning: no tuning.json (fixtures, or any bare dir) -> the built-in defaults, no warnings", () => {
  const warnings: string[] = [];
  assert.deepEqual(loadTuning(undefined, warnings), DEFAULT_TUNING);
  const bare = mkdtempSync(join(tmpdir(), "resolver-tuning-"));
  assert.deepEqual(loadTuning(bare, warnings), DEFAULT_TUNING);
  assert.deepEqual(warnings, [], "a missing tuning file is not an accommodation");
});

test("loadTuning: data/tuning.json reads clean — floor is ruled on, the playtest nulls still hold", () => {
  const warnings: string[] = [];
  const t = loadTuning(DATA_DIR, warnings);
  // The shipped file no longer mirrors the pre-tuning constants. THREE intended
  // departures, and nothing else may drift:
  //   1. B1 is ruled (Roc, 2026-07-30) and the floor knob is deliberately ON.
  //   2. bond.trait_coefficients carries per-soul entries. DEFAULT_TUNING cannot
  //      hold these — souls are data, not tuning — so the default is "_default"
  //      alone and the shipped file names the souls it has coefficients for.
  //   3. bond.band_thresholds: RE-SIZED 2026-08-17 for the retired bond ruling
  //      (Roc: "one attentive life MAY reach HIGH"), from 12/82 to 6/18, per
  //      tuning.json's bond._note. DEFAULT_TUNING keeps the slice-era values as
  //      the no-tuning-file fallback; only the shipped file needed to move.
  //      Sized against the WALKED ceiling (walk.test.ts), not maxBondPerLife —
  //      see "the theoretical ceiling is NOT the sizing basis" below.
  assert.equal(t.floor.prefer_unlocked_screens, true, "B1 ruled: guaranteed souls land where you can go");
  assert.equal(t.floor.prefer_scene_screens, true, "W1: and land where they have something to say");
  assert.deepEqual(
    t.bond.trait_coefficients,
    { _default: 1.0, toby: 1.0, ilsa: 0.7 },
    "ilsa < 1.0: the Kinbound is guarded, and a guarded soul's bond moves slower",
  );
  assert.deepEqual(
    t.bond.band_thresholds,
    { mid_min: 6, high_min: 18 },
    "re-sized 2026-08-17 for the retired bond ruling; high_min sits under mara's walked 20",
  );
  assert.deepEqual(
    {
      ...t,
      floor: DEFAULT_TUNING.floor,
      bond: {
        ...t.bond,
        trait_coefficients: DEFAULT_TUNING.bond.trait_coefficients,
        band_thresholds: DEFAULT_TUNING.bond.band_thresholds,
      },
    },
    DEFAULT_TUNING,
    "the floor knobs, the per-soul bond coefficients, and bond.band_thresholds are the ONLY departures",
  );
  assert.equal(t.aliveness_bands.quiet_max_days, null, "band thresholds await playtest");
  assert.ok(
    warnings.some((w) => w.includes("provisional envelope")),
    "provisional envelope is warned, like data.ts",
  );
  assert.ok(!warnings.some((w) => w.includes("unknown key")), "no unknown-key noise from the real file");
});

test("loadTuning: unknown keys and wrong types warn; defaults kept", () => {
  const dir = mkdtempSync(join(tmpdir(), "resolver-tuning-"));
  writeFileSync(
    join(dir, "tuning.json"),
    JSON.stringify({
      availability_weights: { role_anchor: 9, home_evening: "four", mystery: 1 },
      live_leads: { min: 1, max: 5 },
      gravity: { g: 9.8 },
    }),
  );
  const warnings: string[] = [];
  const t = loadTuning(dir, warnings);
  assert.equal(t.availability_weights.role_anchor, 9, "valid override read");
  assert.equal(t.availability_weights.home_evening, 4, "wrong type falls back to default");
  assert.deepEqual(t.live_leads, { min: 1, max: 5 });
  assert.deepEqual(t.arch_promote, DEFAULT_TUNING.arch_promote, "absent sections default");
  assert.ok(warnings.some((w) => w.includes('unknown key "gravity"')));
  assert.ok(warnings.some((w) => w.includes('unknown key "availability_weights.mystery"')));
  assert.ok(warnings.some((w) => w.includes('"availability_weights.home_evening" has the wrong type')));
});

// ---------- regression: no behavior change at defaults ----------

// Pinned pre-tuning outputs (SHA-256 of the day.json), captured before the
// tuning loader existed. Same seeds -> same day.json, file or no file.
// Re-pinned 2026-08-02 alongside enumerateRoutes' strict screen bound
// (walk.ts: the phantom-final-screen fix — routes used to promise one more
// screen than a day can stand on) and the fixture set gaining its minimal T7
// stand-in (emitMain now requires FESTIVAL_SCREEN_ID in every graph). The
// floor-off pairing below was re-verified at the same time: floor off still
// reproduces exactly these hashes against today's data.
//
// `data.*` re-pinned again 2026-08-12. Two independent causes shifted the
// whole day.json stream, both verified, neither a defect (session handoff
// finding #6, GP-148):
//   1. Adding Mara's role_tag changed her weight in the weighted NPC-fill
//      pick, which perturbs which soul lands where from day 1 onward — the
//      draw is deterministic but the pool composition changed.
//   2. GP-145: day-5 Festival Grounds placement is now restricted to the
//      "night" time_block (day.ts's collectOpenings), so a soul who used to
//      seat at T7 in the evening now seats at T7 at night instead — the fix
//      for present_toby/present_ilsa never being true at night on day 5.
// `fixtures` is untouched — the fixtures dir has no Mara role_tag entry and
// carries no day-5 Festival Grounds npc_slots, so neither cause reaches it.
//
// `data.*` re-pinned again 2026-08-24 (T19, Task 5), same cause as the
// 2026-08-12 Mara re-pin above: three more role_tags landed in
// scene-graph.json (bex/Farmer, juno/Priest, pip/Postman — ratified 2026-08-09,
// wired 2026-08-24), which changes their weight in the same weighted NPC-fill
// pick. Verified this is the whole cause and not a defect the same way the
// 2026-08-12 note did: with `data/scene-graph.json` reverted to its
// pre-Task-5 content (the three souls back to no `role_tag`), both regression
// tests below pass unchanged against the OLD pinned hashes. Day 1 still
// coincides between floor-on and floor-off, same invariant as before.
const PRE_TUNING_HASHES: Record<string, string[]> = {
  fixtures: [
    "26bdf67cacf6ee4ef0d146f0b6fcf554dd4a34a94013711a2b84c9ce35b8025f",
    "eac1e12deffa12edd998bdc068e1affc1eb730881d1ce95fc4321cc229f90065",
    "a8f748d52caea594614f29bc2c7a4dbebabf543f2b6e7529941486279b2e9f7e",
    "4ba2de0684f2879a9090e84e21eb34b1bfa3b0e10b2d411da609e8d702d40351",
    "987f90e68ed55f84d7beb7ab278dc15a625ea3096b3288b7d8fcc9763cf82981",
  ],
  data: [
    "76f82bb97cb98cc7f3d4b003824825cf4bde9eddffec1065c89b50c527f0db81",
    "45771f5b61324f4ef0948806a800f4ff46bc0cc169df668509cda80a11acfcd8",
    "b49d09bee14d74ebdbbec46ccb84c7cf8e55a84f3cee5adc3a8adf587246ca6c",
    "144c3f4ddf82f52fadac4970785f741f03dcf56100dd0edc594fdd383300fee9",
    "ba8d47347fba6c266b94d23c82d40b63298e1842114d5112d7ffab8174d23320",
  ],
};

test("regression: no tuning file -> day.json identical to pre-tuning output (pinned hashes, days 1-5)", () => {
  const data = loadData();
  const tuning = loadTuning(); // fixtures dir has no tuning.json -> defaults
  for (let day = 1; day <= 5; day++) {
    const out = resolveDay(data, { ...baseInput, day }, tuning);
    assert.equal(hash(out), PRE_TUNING_HASHES.fixtures[day - 1], `fixtures day ${day} drifted`);
    assert.deepEqual(out, resolveDay(data, { ...baseInput, day }), "omitting tuning = same defaults");
  }
});

// The shipped day.json after B1 (floor ON). Re-pinned 2026-07-30 alongside the
// ruling — never re-pin these without the floor-off test below still passing.
// The shipped day.json after B1 (floor ON) and W1 (scene-screen floor ON).
// Re-pinned 2026-07-31 alongside prefer_scene_screens — never re-pin these
// without the floor-off test above still passing, which is what proves the
// drift comes from the ruled knobs and from nothing else.
// Re-pinned 2026-08-02 alongside the enumerateRoutes strict bound (see the
// PRE_TUNING_HASHES note above). Day 1's floor-on output now coincides with
// floor-off — with the phantom final screen gone, day 1's placement no longer
// has a locked-screen pick for the floor to move — so the "floor changes
// placement" proof below asserts over the whole week, not per day.
// Re-pinned 2026-08-12 for the same two causes as PRE_TUNING_HASHES.data
// above (Mara's role_tag weight, GP-145's day-5 night restriction) — see that
// comment for detail. Day 1 still coincides with floor-off, unaffected by
// either cause.
// Re-pinned again 2026-08-24 (T19, Task 5) — same cause as PRE_TUNING_HASHES
// .data's 2026-08-24 note (bex/juno/pip role_tags). Day 1 still coincides
// with floor-off.
const RULED_FLOOR_HASHES = [
  "76f82bb97cb98cc7f3d4b003824825cf4bde9eddffec1065c89b50c527f0db81",
  "fc675e02f2bcd75804c70408c827f477f27ddfafebd156f93362c92539cd0978",
  "fbe7acbac757a91f59153b28a923711326e41967dbea22ea6f8c38aba19df39b",
  "e0f297b0933cebf5fd95c2ca999d4315388a93416e56e4e8d74be22b7a28140d",
  "ee775ed6dafc2dfc32edfe70bafdaa7ad8efb5c7c1a548b8d872af87a3e4db53",
];

// This pair is the point: the floor-off run must still reproduce the ORIGINAL
// pre-tuning hashes against today's data. That is what proves the drift in the
// shipped output comes from the ruled floor knob and from nothing else — not
// from the T7 status edit, the Demo archetypes, or the T5/F7 schema additions.
test("regression: data/ with the floor forced off -> still byte-identical to pre-tuning output", () => {
  const data = loadData(DATA_DIR, []);
  const floorOff = withTuning({ floor: { prefer_unlocked_screens: null } });
  for (let day = 1; day <= 5; day++) {
    const out = resolveDay(data, { ...baseInput, day }, floorOff);
    assert.equal(hash(out), PRE_TUNING_HASHES.data[day - 1], `data day ${day} drifted with the floor off`);
  }
});

test("regression: data/tuning.json as shipped (floor ON, B1 ruled) -> the re-pinned output", () => {
  const data = loadData(DATA_DIR, []);
  const tuning = loadTuning(DATA_DIR, []);
  assert.equal(tuning.floor.prefer_unlocked_screens, true, "the shipped file is the floor-on case");
  let daysChanged = 0;
  for (let day = 1; day <= 5; day++) {
    const out = resolveDay(data, { ...baseInput, day }, tuning);
    assert.equal(hash(out), RULED_FLOOR_HASHES[day - 1], `data day ${day} drifted`);
    if (hash(out) !== PRE_TUNING_HASHES.data[day - 1]) daysChanged++;
  }
  // Over the week, not per day: since the strict route bound (2026-08-02),
  // day 1 has no locked-screen pick for the floor to move, so its floor-on
  // and floor-off outputs coincide. The knob must still visibly act somewhere.
  assert.ok(daysChanged >= 1, "the floor should change placement on at least one day");
});

// ---------- knobs actually turn ----------

test("availability_weights override changes the draw", () => {
  const data = loadData();
  const flat = withTuning({ availability_weights: { role_anchor: 0, home_evening: 0, base: 1 } });
  const a = resolveDay(data, baseInput);
  const b = resolveDay(data, structuredClone(baseInput), flat);
  assert.notDeepEqual(a.slot_fill, b.slot_fill, "uniform weights should reshuffle the fill");
  assert.deepEqual(b, resolveDay(data, structuredClone(baseInput), flat), "still deterministic");
});

test("per_block_multiplier scales declared capacity: round half-up, floor at 0", () => {
  const data = loadData();
  const countBy = (fill: { screen_id: string; time_block: string }[]) => {
    const m = new Map<string, number>();
    for (const f of fill) m.set(`${f.screen_id}|${f.time_block}`, (m.get(`${f.screen_id}|${f.time_block}`) ?? 0) + 1);
    return m;
  };

  // 0.5: T1 {2,2,2} -> {1,1,1}; T2 {2,1,1} -> {1,1,1} (0.5 rounds UP to 1).
  const half = resolveDay(data, baseInput, withTuning({ npc_slot_defaults: { per_block_multiplier: 0.5 } }));
  const halfCounts = countBy(half.slot_fill);
  for (const k of ["T1|morning", "T1|afternoon", "T1|evening", "T2|morning", "T2|afternoon", "T2|evening"]) {
    assert.equal(halfCounts.get(k) ?? 0, 1, `${k} at x0.5`);
  }

  // 0.25: count 2 -> round(0.5) = 1 (half-up); count 1 -> round(0.25) = 0.
  const quarter = resolveDay(data, baseInput, withTuning({ npc_slot_defaults: { per_block_multiplier: 0.25 } }));
  const quarterCounts = countBy(quarter.slot_fill);
  assert.equal(quarterCounts.get("T1|morning"), 1);
  assert.equal(quarterCounts.get("T2|morning"), 1);
  assert.equal(quarterCounts.get("T2|afternoon") ?? 0, 0, "count 1 x 0.25 rounds to 0");
  assert.equal(quarterCounts.get("T2|evening") ?? 0, 0);

  // 0: every capacity floors at 0 -> nobody stands anywhere (no live threads,
  // so the guarantee floor has nothing to demand).
  const noThreads: DayInput = {
    ...baseInput,
    threads: [{ thread_id: "giver-receive", soul: "toby", status: "done" }],
  };
  const zero = resolveDay(data, noThreads, withTuning({ npc_slot_defaults: { per_block_multiplier: 0 } }));
  assert.deepEqual(zero.slot_fill, []);
});

test("floor.prefer_unlocked_screens=true: guaranteed souls stand on start/reachable screens, days 1-5, both locations", () => {
  const data = loadData(DATA_DIR, []);
  const prefer = withTuning({ floor: { prefer_unlocked_screens: true } });
  const deepLive: DayInput = {
    ...baseInput,
    threads: [
      { thread_id: "giver-receive", soul: "toby", status: "live" },
      { thread_id: "keeper-loss", soul: "mara", status: "live" },
      { thread_id: "rite-doubt", soul: "ilsa", status: "live" },
    ],
  };
  const unlocked = new Set(
    data.screens
      .filter((s) => s.status === "start" || s.status.startsWith("reachable"))
      .map((s) => s.screen_id),
  );
  for (const picked_location of ["town", "forest"]) {
    const locationScreens = new Set(
      data.screens.filter((s) => s.location === picked_location).map((s) => s.screen_id),
    );
    for (let day = 1; day <= 5; day++) {
      const out = resolveDay(data, { ...deepLive, day, picked_location }, prefer);
      for (const soul of ["toby", "mara", "ilsa"]) {
        const placements = out.slot_fill.filter(
          (f) => f.soul === soul && locationScreens.has(f.screen_id),
        );
        assert.ok(placements.length >= 1, `${picked_location} day ${day}: ${soul} missing (floor broken)`);
        assert.ok(
          placements.some((f) => unlocked.has(f.screen_id)),
          `${picked_location} day ${day}: ${soul} guaranteed only on locked screens: ` +
            placements.map((f) => f.screen_id).join(","),
        );
      }
    }
  }
});

test("floor.prefer_unlocked_screens null/false: byte-identical to current behavior", () => {
  const data = loadData(DATA_DIR, []);
  const nullT = withTuning({ floor: { prefer_unlocked_screens: null } });
  const falseT = withTuning({ floor: { prefer_unlocked_screens: false } });
  for (let day = 1; day <= 5; day++) {
    const plain = resolveDay(data, { ...baseInput, day });
    assert.deepEqual(resolveDay(data, { ...baseInput, day }, nullT), plain);
    assert.deepEqual(resolveDay(data, { ...baseInput, day }, falseT), plain);
  }
});

test("live_leads: min/max range respected, capped by the pool", () => {
  const data = loadData();
  const wide = withTuning({ live_leads: { min: 1, max: 4 } });
  const seen = new Set<number>();
  for (let life = 1; life <= 20; life++) {
    for (let day = 1; day <= 5; day++) {
      const out = resolveDay(data, { ...baseInput, life, day }, wide);
      assert.ok(out.live_leads.length >= 1 && out.live_leads.length <= 4, `got ${out.live_leads.length}`);
      seen.add(out.live_leads.length);
    }
  }
  assert.ok(seen.size > 1, "a 1..4 range should produce more than one count across 100 seeds");

  const pinned = withTuning({ live_leads: { min: 3, max: 3 } });
  for (let day = 1; day <= 5; day++) {
    assert.equal(resolveDay(data, { ...baseInput, day }, pinned).live_leads.length, 3);
  }
});

// ---------- arch promote stamped into the graph ----------

test("buildGraph stamps tuning arch_promote numbers into the Arch's promotes_to condition", () => {
  const data = loadData(DATA_DIR, []);
  const archOf = (g: ReturnType<typeof buildGraph>) =>
    g.screens.find((s) => s.screen_id === "T1")!.examinables!.find((e) => e.id === "arch")!;

  const stamped = archOf(buildGraph(data, loadTuning(DATA_DIR, [])));
  assert.ok(stamped.promotes_to!.condition.includes("threads_moved(3 of 5)"), stamped.promotes_to!.condition);
  assert.ok(stamped.promotes_to!.condition.includes("role_goals_advanced(2)"));
  assert.equal(stamped.promotes_to!.tier, "hard-key", "tier untouched");

  const custom = archOf(
    buildGraph(data, withTuning({ arch_promote: { threads_moved_min: 4, of_threads: 6, role_goals_advanced_min: 1 } })),
  );
  assert.ok(custom.promotes_to!.condition.includes("threads_moved(4 of 6)"));
  assert.ok(custom.promotes_to!.condition.includes("role_goals_advanced(1)"));

  // Source data is never mutated — the proposal pointer text survives in data/.
  const sourceArch = data.screens.find((s) => s.screen_id === "T1")!.examinables!.find((e) => e.id === "arch")!;
  assert.ok(sourceArch.promotes_to!.condition.includes("arch-promote-proposal.json"), "input data untouched");

  // The unruled forest promotes_to (old_carvings, condition null) is not stamped.
  const carvings = buildGraph(data, loadTuning(DATA_DIR, []))
    .screens.find((s) => s.screen_id === "F3")!
    .examinables!.find((e) => e.id === "old_carvings")!;
  assert.equal(carvings.promotes_to!.condition, null, "null condition stays null — pending the gate");
});

// ---------- bond scoring (W1a) ----------
// The bond is ONE hidden count per soul (guardrails.md check 2). These tests
// pin the SHAPE of that rule as much as the numbers: a delta is a function of
// category and soul, and nothing here stores a per-category score.

test("bondBandOf: thresholds are inclusive minimums, and match predicates.ts BAND_VALUE", () => {
  const b = DEFAULT_TUNING.bond;
  const { mid_min, high_min } = b.band_thresholds;
  assert.equal(bondBandOf(0, b), 0, "an untouched soul is low");
  assert.equal(bondBandOf(mid_min - 1, b), 0, "just under mid is still low");
  assert.equal(bondBandOf(mid_min, b), 1, "mid_min is inclusive");
  assert.equal(bondBandOf(high_min - 1, b), 1);
  assert.equal(bondBandOf(high_min, b), 2, "high_min is inclusive");
  // 0/1/2 is not arbitrary — predicates.ts compiles bond_band(x)=mid to
  // `bondLevel_x == 1`, so these ARE the values the ink guard reads.
});

test("GP-115: bondBandOf's low default is explicit, not a silent fallthrough", () => {
  // Ruled by Roc 2026-08-06: low is the floor and covers the zero/unbonded
  // case. This pins that the code actually does that, for zero AND for the
  // uninitialised/negative case a fresh soul or a bad delta could produce —
  // both must land on the SAME explicit low, never throw, never null. A
  // three-way bond_band fork in content is exhaustive only as long as this
  // holds; see the predicate vocabulary note in
  // narrative-pipeline/templates/choice-node-schema.md.
  const b = DEFAULT_TUNING.bond;
  assert.equal(bondBandOf(0, b), 0, "an unbonded soul resolves to low, the explicit floor");
  assert.equal(bondBandOf(-1, b), 0, "a count that should never be negative still lands on low, not an error");
});

test("bondDelta: category weights it, the soul's trait coefficient scales it", () => {
  const b = loadTuning(DATA_DIR).bond;
  assert.equal(bondDelta("Intimacy", "toby", b), 2, "Intimacy 2 x toby 1.0");
  assert.equal(bondDelta("Recognition", "toby", b), 3, "Recognition is weighted highest");
  assert.ok(
    Math.abs(bondDelta("Intimacy", "ilsa", b) - 1.4) < 1e-9,
    "the Kinbound is guarded: 2 x 0.7",
  );
  assert.equal(bondDelta("Intimacy", "mara", b), 2, "an uncarded soul falls back to _default");
  assert.equal(bondDelta("Flattery", "toby", b), 0, "outside the closed enum scores nothing");
});

/**
 * Max bond one life can earn for a soul: the best option at every beat.
 * bond_band-gated beats are mutually exclusive variants of one moment, so the
 * best single variant counts once rather than all three.
 */
function maxBondPerLife(data: ReturnType<typeof loadData>, soulId: string, b: Tuning["bond"]): number {
  const delta = (cat: string) =>
    (b.category_weights[cat] ?? 0) *
    (b.trait_coefficients[soulId] ?? b.trait_coefficients._default ?? 1) *
    b.demo_multiplier;
  let total = 0;
  for (const scene of data.sceneGraph.scenes.filter((s) => s.soul === soulId)) {
    let ungated = 0;
    const variants = new Map<string, number>();
    for (const node of scene.choice_nodes) {
      const bandGate = node.availability_conditions.find((c) => c.startsWith("bond_band"));
      let best = 0;
      for (const o of node.options) {
        const d = (o.state_actions ?? [])
          .filter((a) => a.type === "bond_event")
          .reduce((t, a) => t + delta(a.arg), 0);
        if (d > best) best = d;
      }
      if (bandGate) variants.set(bandGate, Math.max(variants.get(bandGate) ?? 0, best));
      else ungated += best;
    }
    total += ungated + Math.max(0, ...variants.values());
  }
  return total;
}

test("maxBondPerLife is an UPPER BOUND, not the sizing basis (corrected 2026-08-17)", () => {
  // WHAT THIS TEST USED TO DO, AND WHY IT CHANGED.
  //
  // It used to enforce Roc's 2026-07-30 ruling ("one attentive life earns MID,
  // HIGH needs a second") against maxBondPerLife. That drove three re-sizes —
  // 36 on 2026-07-31, 82 on 2026-08-07, and a third was queued — and every one
  // of them sized a threshold against a number no player can reach.
  //
  // maxBondPerLife sums the best option at every beat across EVERY authored
  // scene for a soul. It applies no day economy and no reachability. A life
  // holds days_per_life * moves_per_day move slots, and there are far more
  // authored scenes than that, so the figure is unreachable BY CONSTRUCTION.
  // Measured 2026-08-17: toby 174 / mara 128 / ilsa 114.1 theoretical, against
  // toby 35 / mara 20 / ilsa 56.7 actually walked.
  //
  // The ruling now lives in walk.test.ts, which measures a real replayed week.
  // This test keeps maxBondPerLife honest about what it is: a ceiling nothing
  // reaches, useful for spotting content that carries no bond at all, and
  // explicitly NOT the number thresholds are sized against.
  const data = loadData(DATA_DIR, []);
  const b = loadTuning(DATA_DIR, []).bond;
  const deep = data.sceneGraph.souls.filter((s) => s.deep).map((s) => s.soul_id);
  assert.ok(deep.length > 0, "the cast declares deep souls");

  // The bound really is a bound: it can only be met by playing every authored
  // scene for that soul, which the move budget forbids. Derived, not hard-coded.
  const dayLoop = loadTuning(DATA_DIR, []).day_loop;
  const slots = dayLoop.days_per_life * dayLoop.moves_per_day;
  assert.ok(
    data.sceneGraph.scenes.length > slots,
    `${data.sceneGraph.scenes.length} authored scenes vs ${slots} move slots — if this ever ` +
      "inverts, maxBondPerLife becomes attainable and this test's premise needs revisiting",
  );

  // A deep soul carrying an arc must carry enough authored bond to clear MID at
  // all. This is the content check the old test was genuinely useful for, kept.
  const failures: string[] = [];
  for (const soul of deep) {
    const perLife = maxBondPerLife(data, soul, b);
    if (perLife === 0) continue; // no authored scenes — its own test reports that
    if (perLife < b.band_thresholds.high_min) {
      failures.push(
        `${soul}: authored bond ceiling ${perLife} is below high_min=${b.band_thresholds.high_min}, ` +
          "so no amount of play could ever reach HIGH — a content gap, not a tuning one",
      );
    }
  }
  assert.deepEqual(failures, [], "a deep soul's authored content must at least make HIGH possible");
});

test("every deep soul with an arc can move its band — the arc turns are reachable", () => {
  // Roc, 2026-07-31: every deep npc arc needs enough bond nodes. Ilsa's two
  // authored scenes carried ZERO bond_events before W1, so her band was pinned
  // at low and two thirds of SC-T7-ilsa was dead content no threshold could
  // reach. This is the test that keeps that from coming back.
  const data = loadData(DATA_DIR, []);
  const b = loadTuning(DATA_DIR, []).bond;
  const withArcs = data.sceneGraph.souls
    .filter((s) => s.deep)
    .filter((s) => data.sceneGraph.scenes.some((sc) => sc.soul === s.soul_id));
  assert.ok(withArcs.length >= 2, "toby and ilsa both carry arcs");
  for (const soul of withArcs) {
    assert.ok(
      maxBondPerLife(data, soul.soul_id, b) >= b.band_thresholds.mid_min,
      `${soul.soul_id}: a deep arc must carry enough bond nodes to leave the low band`,
    );
  }
});

test("a bond_band-gated beat exists for every band, so no variant is dead content", () => {
  const data = loadData(DATA_DIR, []);
  for (const scene of data.sceneGraph.scenes) {
    const bands = new Set(
      scene.choice_nodes
        .flatMap((n) => n.availability_conditions)
        .map((c) => /^bond_band\([^)]+\)\s*=\s*(low|mid|high)$/.exec(c)?.[1])
        .filter(Boolean) as string[],
    );
    if (bands.size === 0) continue;
    assert.deepEqual(
      [...bands].sort(),
      ["high", "low", "mid"],
      `${scene.scene_id}: a band-gated scene must cover all three, or a run falls through it`,
    );
  }
});

test("demo_multiplier is REDUNDANT under the 2026-08-17 ruling, and still scales only the delta", () => {
  // Its stated job was "reach high inside one life for demonstration". Roc's
  // 2026-08-17 ruling makes that the real bar, so the knob no longer buys
  // anything. Flagged for cleanup in tuning.json's bond._note, deliberately not
  // deleted — removing a tuning key is a schema change and wants its own pass.
  //
  // What still has to hold: the multiplier scales the DELTA, never the
  // thresholds. That is the "one knob, honest file" property, and it is the
  // only reason this test is still worth running.
  const data = loadData(DATA_DIR, []);
  const shipped = loadTuning(DATA_DIR, []).bond;
  const demo = { ...shipped, demo_multiplier: 2.0 };
  assert.equal(shipped.demo_multiplier, 1.0, "the shipped file leaves the knob off");
  for (const soul of ["toby", "ilsa"]) {
    assert.equal(
      maxBondPerLife(data, soul, demo),
      maxBondPerLife(data, soul, shipped) * 2,
      `${soul}: the multiplier scales the earned delta, linearly`,
    );
  }
  assert.deepEqual(
    demo.band_thresholds,
    shipped.band_thresholds,
    "the multiplier scales the DELTA, never the thresholds — one knob, honest file",
  );
});

test("bond: inverted thresholds warn and fall back; unknown keys warn", () => {
  const dir = mkdtempSync(join(tmpdir(), "resolver-tuning-"));
  writeFileSync(
    join(dir, "tuning.json"),
    JSON.stringify({
      bond: {
        band_thresholds: { mid_min: 20, high_min: 5 },
        category_weights: { Trust: 4, Charisma: 9 },
        demo_multiplier: "loud",
      },
    }),
  );
  const warnings: string[] = [];
  const t = loadTuning(dir, warnings);
  assert.deepEqual(
    t.bond.band_thresholds,
    DEFAULT_TUNING.bond.band_thresholds,
    "mid above high would read as a band that skips, not as a config error",
  );
  assert.equal(t.bond.category_weights.Trust, 4, "a legal category still tunes");
  assert.equal(t.bond.category_weights.Charisma, undefined, "outside the closed enum is dropped");
  assert.equal(t.bond.demo_multiplier, 1.0, "wrong type keeps the default");
  assert.ok(warnings.some((w) => w.includes("mid_min")));
  assert.ok(warnings.some((w) => w.includes("Charisma")));
  assert.ok(warnings.some((w) => w.includes("demo_multiplier")));
});

test("trait_coefficients is open-keyed: souls are data, not tuning", () => {
  const dir = mkdtempSync(join(tmpdir(), "resolver-tuning-"));
  writeFileSync(
    join(dir, "tuning.json"),
    JSON.stringify({ bond: { trait_coefficients: { nell: 0.5 } } }),
  );
  const warnings: string[] = [];
  const t = loadTuning(dir, warnings);
  assert.equal(t.bond.trait_coefficients.nell, 0.5, "a soul the defaults never heard of still tunes");
  assert.equal(t.bond.trait_coefficients._default, 1.0, "and the fallback survives");
  assert.ok(!warnings.some((w) => w.includes("nell")), "an open map must not warn on new souls");
});

test("graph.json carries the bond block, so the host needs no second reader on tuning.json", () => {
  const data = loadData(DATA_DIR, []);
  const tuning = loadTuning(DATA_DIR, []);
  const graph = buildGraph(data, tuning);
  assert.deepEqual(graph.bond, tuning.bond, "stamped at build, like the Arch's promote condition");
  assert.equal(graph.bond.trait_coefficients.ilsa, 0.7);
});

test("day_loop.moves_per_day is tunable and defaults to the old hard-coded 3", () => {
  assert.equal(DEFAULT_TUNING.day_loop.moves_per_day, 3, "same value the day loop shipped with");
  const dir = mkdtempSync(join(tmpdir(), "resolver-tuning-"));
  writeFileSync(join(dir, "tuning.json"), JSON.stringify({ day_loop: { moves_per_day: 5 } }));
  assert.equal(loadTuning(dir, []).day_loop.moves_per_day, 5);
});

// ---------- W1: the guarantee floor must guarantee something usable ----------

test("floor.prefer_scene_screens: a guaranteed soul lands where they have a scene", () => {
  const data = loadData(DATA_DIR, []);
  // Toby's authored scenes sit on T2, T6 and F1. Before this flag the floor
  // could put him on any town screen, so the arc was unreachable in play.
  const sceneScreens = new Set(
    data.sceneGraph.scenes.filter((s) => s.soul === "toby").map((s) => s.screen_id),
  );
  const on = withTuning({ floor: { prefer_unlocked_screens: true, prefer_scene_screens: true } });
  for (let day = 1; day <= 5; day++) {
    const out = resolveDay(data, { ...baseInput, day }, on);
    const toby = out.slot_fill.filter((f) => f.soul === "toby");
    assert.ok(
      toby.some((f) => sceneScreens.has(f.screen_id)),
      `day ${day}: toby is guaranteed somewhere he has something to say`,
    );
  }
});

test("floor.prefer_scene_screens off -> byte-identical to the flag never existing", () => {
  const data = loadData(DATA_DIR, []);
  const off = withTuning({ floor: { prefer_unlocked_screens: true, prefer_scene_screens: null } });
  const asFalse = withTuning({ floor: { prefer_unlocked_screens: true, prefer_scene_screens: false } });
  for (let day = 1; day <= 5; day++) {
    assert.deepEqual(
      resolveDay(data, { ...baseInput, day }, off),
      resolveDay(data, { ...baseInput, day }, asFalse),
      `day ${day}: null and false are the same off`,
    );
  }
});

test("a soul with no authored scenes is unaffected by the scene floor", () => {
  const data = loadData(DATA_DIR, []);
  // mara is deep but carries no authored scene, so narrowing to scene screens
  // would find nothing; the draw must widen rather than throw or drop her.
  const threads = [{ thread_id: "keeper-corner", soul: "mara", status: "live" as const }];
  const on = withTuning({ floor: { prefer_unlocked_screens: true, prefer_scene_screens: true } });
  const out = resolveDay(data, { ...baseInput, threads }, on);
  assert.ok(
    out.slot_fill.some((f) => f.soul === "mara"),
    "the guarantee still holds for a soul the narrowing cannot help",
  );
});
