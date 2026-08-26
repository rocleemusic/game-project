/**
 * Wave 2 Track B — the authored gate rulings of 2026-08-17.
 *
 * Two of the six rulings name content that does not exist. This suite asserts
 * the engine REFUSES them rather than loading a gate that can never clear, and
 * pins the exact content that is missing so the failure reads as a work-list
 * instead of a mystery.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { GameEventBus, type GameEvent } from "../src/world/events/GameEvents";
import {
  AUTHORED_GATE_RULES,
  AUTHORED_GATE_RULE_DEFECTS,
  GateEngine,
  authoredContentFrom,
  parseGateRuleTable,
  screensByGateFrom,
  validateRule,
} from "../src/world/gates/GateEngine";
import {
  evaluateRule,
  heldAt,
  matchChainRule,
  type GateContext,
  type GateWorldFacts,
} from "../src/world/gates/GateEvaluator";
import type { ChainGateRule, GateRule } from "../src/world/gates/GateRule";
import { Gates } from "../src/world/Gates";
import { MagicDB, resolveCast } from "../src/magic/CastResolver";
import type { ItemRecord, SpellRecord } from "../src/magic/types";
import type { Graph } from "../../tools/lantern/src/types";
import { approachScreens, castTargetsFor } from "../src/render/ReceiverHotspots";
import { Inventory } from "../src/world/Inventory";
import { CastPipeline, componentsFromHeld, type CastPolicy } from "../src/world/CastPipeline";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(here, "..", p), "utf8"));

const graph = read("public/story/graph.json") as Graph;
const spells = read("public/content/magic.json") as SpellRecord[];
const items = read("public/content/items.json") as ItemRecord[];

/** ink's own LIST — `tools/resolver/src/graph.ts` declares exactly these. */
const TIME_BLOCKS = ["morning", "afternoon", "evening", "night"] as const;

const content = authoredContentFrom(spells, {
  itemIds: items.map((i) => i.item_id),
  timeBlocks: [...TIME_BLOCKS],
});

const gatesFromGraph = new Gates(graph);
const knownGateIds = new Set<string>();
for (const req of gatesFromGraph.requirements.values()) {
  for (const g of req.gateIds) knownGateIds.add(g);
}
const screensByGate = screensByGateFrom(gatesFromGraph.requirements.values());

const NO_BONDS: GateWorldFacts = { timeBlock: "morning", bondBands: {} };

function engine(overrides: Partial<Parameters<typeof makeEngine>[0]> = {}) {
  return makeEngine(overrides);
}

function makeEngine(overrides: {
  rules?: Record<string, GateRule>;
  bus?: GameEventBus;
  strict?: boolean;
} = {}) {
  return new GateEngine({
    rules: overrides.rules,
    content,
    knownGateIds,
    screensByGate,
    bus: overrides.bus,
    strict: overrides.strict,
  });
}

/** A bus with a deterministic clock, so `seq`/`at` are reproducible. */
function bus(): GameEventBus {
  let t = 0;
  return new GameEventBus({ now: () => (t += 1) });
}

function cast(
  spellId: string,
  receiverId: string,
  extra: Partial<Extract<GameEvent, { type: "cast:resolved" }>> = {},
): Extract<GameEvent, { type: "cast:resolved" }> {
  return {
    type: "cast:resolved",
    spellId,
    receiverId,
    screenId: "F4",
    outcome: "effect",
    consumed: [],
    produced: [],
    narration: "authored prose",
    ...extra,
  };
}

const ctxOf = (b: GameEventBus, facts: GateWorldFacts = NO_BONDS): GateContext => ({
  log: b.log(),
  facts,
});

// ---------------------------------------------------------------------------
// The authored file
// ---------------------------------------------------------------------------

describe("data/gateRules.json — the six rulings, as data", () => {
  it("parses with no shape defects", () => {
    expect(AUTHORED_GATE_RULE_DEFECTS).toEqual([]);
  });

  it("carries exactly the six authored gate ids", () => {
    expect(Object.keys(AUTHORED_GATE_RULES).sort()).toEqual([
      "G-F4-still",
      "G-F5-cascade",
      "G-F7-light",
      "G-F8-combine",
      "G-T5-trust",
      "G-T6-evening",
    ]);
  });

  it("matches the plan's shapes verbatim", () => {
    expect(AUTHORED_GATE_RULES["G-F5-cascade"]).toEqual({
      kind: "cast",
      spellId: "ignite",
      requireEffect: true,
    });
    expect(AUTHORED_GATE_RULES["G-F7-light"]).toEqual({
      kind: "cast",
      spellId: "glimmer",
      requireEffect: true,
    });
    // RULING 2026-08-17 — bond bands are mid_min 6 / high_min 18. This rule
    // names the BAND and never the count, so re-tuning is not a code change.
    expect(AUTHORED_GATE_RULES["G-T5-trust"]).toEqual({ kind: "bond", minBand: 1 });
    expect(AUTHORED_GATE_RULES["G-T6-evening"]).toEqual({ kind: "time", blocks: ["evening"] });
    expect(AUTHORED_GATE_RULES["G-F4-still"]).toEqual({
      kind: "chain",
      steps: [
        { spellId: "ignite", receiverId: "river_stone" },
        { spellId: "temper", onProductOf: 0 },
      ],
    });
    // The F8 heated-stone chain (Roc, 2026-08-19), rewritten to its three real
    // authored pairs: ignite the stone -> temper what it heats -> fetch it into
    // the wall. The spec annotated steps 1-2 `onProductOf: 0/1`, but the engine
    // matches this chain by receiver id + ordered subsequence: `parseStep`
    // keeps `receiverId` and drops a co-present `onProductOf`, and the
    // item-id<->receiver-id gap (G13) means `onProductOf` could not bind the
    // `heated_stone`/`stone_wall` receivers to prior products anyway. So the
    // authored file and this parsed shape are pure receiver-id steps.
    expect(AUTHORED_GATE_RULES["G-F8-combine"]).toEqual({
      kind: "chain",
      steps: [
        { spellId: "ignite", receiverId: "river_stone" },
        { spellId: "temper", receiverId: "heated_stone" },
        { spellId: "fetch", receiverId: "stone_wall" },
      ],
    });
  });

  it("names only gate ids the graph actually locks — bar the cut F4 teaching rule", () => {
    // The F4 gate was cut (plan 2026-08-19): The Still Pool went `reachable`, so
    // G-F4-still now locks no screen. It stays in gateRules.json as the canonical
    // two-step teaching instance the gate layer documents (GateRule.ts,
    // GateEngine.ts, modes.ts, GameEvents.ts…), so it is the ONE authored rule
    // that names no locked gate. Every other rule still must — a NEW dangling
    // rule would fail here.
    for (const gateId of Object.keys(AUTHORED_GATE_RULES)) {
      if (gateId === "G-F4-still") {
        expect(knownGateIds.has(gateId)).toBe(false);
        continue;
      }
      expect(knownGateIds.has(gateId)).toBe(true);
    }
  });

  it("rejects a rule shape it does not recognise", () => {
    const { table, defects } = parseGateRuleTable({
      "G-X": { kind: "vibes", spellId: "ignite" },
    });
    expect(Object.keys(table)).toEqual([]);
    expect(defects[0].reason).toBe("malformed-rule");
  });
});

// ---------------------------------------------------------------------------
// THE REFUSAL — the feature
// ---------------------------------------------------------------------------

describe("the engine refuses rules that name unauthored content", () => {
  it("loads the five satisfiable gates and refuses only the cut F4 rule", () => {
    // The F8 heated-stone content landed (2026-08-19), so G-F8-combine now
    // validates clean and loads. The only refusal left is G-F4-still, and NOT
    // for missing content — its receivers exist — but because the F4 gate cut
    // made The Still Pool `reachable`, so no screen locks G-F4-still.
    const e = engine();
    expect(e.loadedGateIds()).toEqual([
      "G-F5-cascade",
      "G-F7-light",
      "G-F8-combine",
      "G-T5-trust",
      "G-T6-evening",
    ]);
    expect(e.refusedGateIds()).toEqual(["G-F4-still"]);
  });

  it("G-F4-still is refused now only for the cut lock, not for content", () => {
    const defects = validateRule(
      "G-F4-still",
      AUTHORED_GATE_RULES["G-F4-still"],
      content,
      knownGateIds,
    );
    // ONE defect, and it changed meaning with the F8 content landing. Its pair
    // `ignite x river_stone` is now authored, so there is no `unknown-receiver`
    // left — the sole refusal is `unknown-gate`: the F4 cut (plan 2026-08-19)
    // took The Still Pool to `reachable`, so no screen locks G-F4-still.
    expect(defects).toEqual([
      {
        gateId: "G-F4-still",
        reason: "unknown-gate",
        detail: expect.stringContaining("no screen"),
      },
    ]);
  });

  it("G-F8-combine loads clean now — the heated-stone content landed", () => {
    // The flip of the old "refused because fetch authors no stone_wall" pin.
    // All three chain pairs — ignite x river_stone, temper x heated_stone,
    // fetch x stone_wall — are authored on approved spells, and F8 is locked,
    // so the rule validates with no defects and the gate loads.
    const defects = validateRule(
      "G-F8-combine",
      AUTHORED_GATE_RULES["G-F8-combine"],
      content,
      knownGateIds,
    );
    expect(defects).toEqual([]);
  });

  it("the content landed — asserted against the shipped records", () => {
    // The flip of the old "content really is missing" pin: the three F8
    // receivers are now authored on their approved spells.
    const receiversOf = (id: string) =>
      spells.find((s) => s.spell_id === id)?.receivers.map((r) => r.receiver_id) ?? [];
    expect(receiversOf("ignite")).toContain("river_stone");
    expect(receiversOf("temper")).toContain("heated_stone");
    expect(receiversOf("fetch")).toContain("stone_wall");
  });

  it("a refused gate keeps blocking — a content gap must never open a screen", () => {
    const e = engine();
    expect(e.blocking(["G-F4-still"])).toEqual(["G-F4-still"]);
    expect(e.isCleared("G-F4-still")).toBe(false);
  });

  it("strict mode throws, and names the gates", () => {
    expect(() => engine({ strict: true })).toThrow(/G-F4-still/);
  });

  it("refuses an unknown spell, an unknown gate id and a backwards product ref", () => {
    const e = engine({
      rules: {
        "G-F5-cascade": { kind: "cast", spellId: "sparkle", requireEffect: true },
        "G-NOPE": { kind: "time", blocks: ["evening"] },
        "G-F7-light": {
          kind: "chain",
          steps: [{ spellId: "ignite", onProductOf: 0 }],
        },
      },
    });
    expect(e.loadedGateIds()).toEqual([]);
    const reasons = e.defects.map((d) => d.reason).sort();
    expect(reasons).toEqual(["bad-step-reference", "unknown-gate", "unknown-spell"]);
  });

  it("refuses an empty time rule and an empty chain — both can never clear", () => {
    const e = engine({
      // Both keys name gates the graph still locks, so the ONLY defect is the
      // shape one under test — G-F4-still no longer locks a screen (F4 cut), so
      // it would add an incidental `unknown-gate` and is not used here.
      rules: {
        "G-T6-evening": { kind: "time", blocks: [] },
        "G-F8-combine": { kind: "chain", steps: [] },
      },
    });
    expect(e.loadedGateIds()).toEqual([]);
    expect(e.defects.every((d) => d.reason === "malformed-rule")).toBe(true);
  });

  it("refuses a requiresHeld naming an item that does not exist", () => {
    const e = engine({
      // Keyed to a still-locked gate so `unknown-item` is the sole defect —
      // G-F4-still no longer locks a screen (F4 cut) and would add `unknown-gate`.
      rules: {
        "G-F8-combine": {
          kind: "chain",
          steps: [{ spellId: "ignite", receiverId: "stick", requiresHeld: "item_moonbeam" }],
        },
      },
    });
    expect(e.defects.map((d) => d.reason)).toEqual(["unknown-item"]);
  });
});

// ---------------------------------------------------------------------------
// The matchers
// ---------------------------------------------------------------------------

describe("cast rules", () => {
  it("G-F5-cascade clears on a landed ignite", () => {
    const b = bus();
    const e = engine({ bus: b });
    b.emit(cast("ignite", "dry_hedge"));
    expect(e.refresh(ctxOf(b)).cleared).toEqual(["G-F5-cascade"]);
    expect(e.isCleared("G-F5-cascade")).toBe(true);
  });

  it("requireEffect means a no-effect cast does not clear it", () => {
    const b = bus();
    const e = engine({ bus: b });
    // No-effect is an HONEST RESULT, not a failure. It is simply not the
    // answer "something physically changed", which is what the gate asks.
    b.emit(cast("ignite", "cat", { outcome: "no-effect" }));
    expect(e.refresh(ctxOf(b)).cleared).toEqual([]);
  });

  it("clearing is reported as a delta — a re-cast reports nothing new", () => {
    const b = bus();
    const e = engine({ bus: b });
    b.emit(cast("ignite", "dry_hedge"));
    e.refresh(ctxOf(b));
    b.emit(cast("ignite", "stick"));
    expect(e.refresh(ctxOf(b)).cleared).toEqual([]);
    expect(e.isCleared("G-F5-cascade")).toBe(true);
  });

  it("emits gate:cleared with source authored and every screen the gate guards", () => {
    const b = bus();
    const e = engine({ bus: b });
    b.emit(cast("ignite", "dry_hedge"));
    e.refresh(ctxOf(b));
    const emitted = b.logOf("gate:cleared");
    expect(emitted).toHaveLength(1);
    expect(emitted[0].gateId).toBe("G-F5-cascade");
    expect(emitted[0].source).toBe("authored");
    expect(emitted[0].ruleKind).toBe("cast");
    // G-F5-cascade locks F5 and F6. The Cave/F7 dropped it (Roc, 2026-08-18) and
    // now needs only G-F7-light.
    expect([...emitted[0].screenIds].sort()).toEqual(["F5", "F6"]);
  });
});

describe("bond rules", () => {
  it("G-T5-trust clears when ANY soul reaches band 1", () => {
    const b = bus();
    const e = engine({ bus: b });
    expect(e.refresh(ctxOf(b, { timeBlock: "morning", bondBands: { toby: 0 } })).cleared).toEqual(
      [],
    );
    expect(
      e.refresh(ctxOf(b, { timeBlock: "morning", bondBands: { toby: 0, mara: 1 } })).cleared,
    ).toEqual(["G-T5-trust"]);
  });

  it("reads the BAND and never a raw count — no threshold lives in this folder", () => {
    const src = fs.readFileSync(
      path.join(here, "..", "src/world/gates/GateEvaluator.ts"),
      "utf8",
    );
    // Guards against someone re-introducing mid_min 6 / high_min 18 here.
    expect(/\bcount\s*>=\s*\d/.test(src)).toBe(false);
  });
});

describe("time rules", () => {
  it("G-T6-evening clears in the evening and shuts again in the morning", () => {
    const b = bus();
    const e = engine({ bus: b });
    expect(e.refresh(ctxOf(b, { timeBlock: "evening", bondBands: {} })).cleared).toEqual([
      "G-T6-evening",
    ]);
    const back = e.refresh(ctxOf(b, { timeBlock: "morning", bondBands: {} }));
    expect(back.closed).toEqual(["G-T6-evening"]);
    expect(e.isCleared("G-T6-evening")).toBe(false);
  });

  it("reads ink's clock and never writes it", () => {
    const gateSrc = ["GateEvaluator.ts", "GateEngine.ts", "GateRule.ts"]
      .map((f) => fs.readFileSync(path.join(here, "..", "src/world/gates", f), "utf8"))
      .join("\n");
    expect(/setVar\s*\(/.test(gateSrc)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Chains — ordered subsequence with product binding
// ---------------------------------------------------------------------------

/**
 * The authored chains cannot be exercised (their content is missing), so the
 * MATCHER is tested against a chain of the same shape built from pairs the
 * content really authors: `ignite x stick` then `temper x stick`. Both exist.
 */
const TEACHING_SHAPE: ChainGateRule = {
  kind: "chain",
  steps: [
    { spellId: "ignite", receiverId: "stick" },
    { spellId: "temper", onProductOf: 0 },
  ],
};

describe("chain matching", () => {
  it("matches an ORDERED SUBSEQUENCE — unrelated casts in between do not break it", () => {
    const b = bus();
    b.emit(cast("ignite", "stick"));
    b.emit(cast("scratch", "dog"));
    b.emit(cast("echo", "well_mouth"));
    b.emit(cast("temper", "stick"));
    const r = evaluateRule("G-F4-still", TEACHING_SHAPE, ctxOf(b));
    expect(r.satisfied).toBe(true);
    expect(r.progress).toBe(2);
    expect(r.matchedSeqs).toEqual([1, 4]);
  });

  it("order is load-bearing — temper before ignite does not match", () => {
    const b = bus();
    b.emit(cast("temper", "stick"));
    b.emit(cast("ignite", "stick"));
    expect(evaluateRule("G-F4-still", TEACHING_SHAPE, ctxOf(b)).satisfied).toBe(false);
  });

  it("product binding — temper on a DIFFERENT receiver does not close the chain", () => {
    const b = bus();
    b.emit(cast("ignite", "stick"));
    b.emit(cast("temper", "hot_loaf"));
    const r = evaluateRule("G-F4-still", TEACHING_SHAPE, ctxOf(b));
    expect(r.satisfied).toBe(false);
    expect(r.progress).toBe(1);
  });

  it("product binding also accepts an item the earlier step MINTED", () => {
    const b = bus();
    // ignite produces item_flame; a later step aimed at that product binds.
    b.emit(cast("ignite", "stick", { produced: ["item_flame"] }));
    b.emit(cast("temper", "item_flame"));
    expect(evaluateRule("G-F4-still", TEACHING_SHAPE, ctxOf(b)).satisfied).toBe(true);
  });

  it("BACKTRACKS — a later ignite completes the chain a greedy match would miss", () => {
    const b = bus();
    b.emit(cast("ignite", "bread")); // greedy would bind here and then fail
    b.emit(cast("ignite", "stick"));
    b.emit(cast("temper", "stick"));
    expect(evaluateRule("G-F4-still", TEACHING_SHAPE, ctxOf(b)).matchedSeqs).toEqual([2, 3]);
  });

  it("matchChainRule over an empty cast list matches nothing", () => {
    expect(matchChainRule(TEACHING_SHAPE, [], []).complete).toBe(false);
  });

  it("a no-effect step does not count — nothing was physically changed", () => {
    const b = bus();
    b.emit(cast("ignite", "stick", { outcome: "no-effect" }));
    b.emit(cast("temper", "stick"));
    expect(evaluateRule("G-F4-still", TEACHING_SHAPE, ctxOf(b)).satisfied).toBe(false);
  });

  it("requiresHeld is answered from the log, historically", () => {
    const withHeld: ChainGateRule = {
      kind: "chain",
      steps: [
        { spellId: "ignite", receiverId: "stick" },
        { spellId: "temper", onProductOf: 0, requiresHeld: "item_river_stone" },
      ],
    };
    const without = bus();
    without.emit(cast("ignite", "stick"));
    without.emit(cast("temper", "stick"));
    expect(evaluateRule("G-F4-still", withHeld, ctxOf(without)).satisfied).toBe(false);

    const withIt = bus();
    withIt.emit(cast("ignite", "stick"));
    withIt.emit({
      type: "item:acquired",
      itemId: "item_river_stone",
      source: "forage",
      screenId: "F2",
      poolName: "river stones",
    });
    withIt.emit(cast("temper", "stick"));
    expect(evaluateRule("G-F4-still", withHeld, ctxOf(withIt)).satisfied).toBe(true);
  });

  it("heldAt: an item spent by the cast itself counts as held", () => {
    const b = bus();
    b.emit(cast("temper", "stick", { consumed: ["item_river_stone"] }));
    expect(heldAt(b.log(), 1, "item_river_stone")).toBe(true);
  });

  it("heldAt: consumed then not re-acquired reads as not held", () => {
    const b = bus();
    b.emit({
      type: "item:acquired",
      itemId: "item_sticks",
      source: "forage",
      screenId: "F1",
      poolName: "sticks",
    });
    b.emit({ type: "item:consumed", itemId: "item_sticks", screenId: "F1", bySpellId: "ignite" });
    b.emit(cast("ignite", "stick"));
    expect(heldAt(b.log(), 3, "item_sticks")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// THE F8 CHAIN CLEARS — ready-to-playtest evidence, end to end
// ---------------------------------------------------------------------------

/**
 * The whole point of the F8 work: the three-step heated-stone chain, played on
 * the REAL shipped records, actually clears G-F8-combine.
 *
 * Nothing here is synthetic. The casts are resolved by `CastResolver` against
 * the shipped `content/magic` + `content/items` (via public/), so the
 * receiver ids and the `produced` lists are exactly what the running game would
 * emit; the gate is the real `AUTHORED_GATE_RULES["G-F8-combine"]` loaded into a
 * real `GateEngine`. If the resolver, the per-receiver `produces`, the gate
 * rule or the evaluator drift apart, this goes red.
 */
describe("the F8 heated-stone chain clears G-F8-combine", () => {
  const db = new MagicDB(spells, items);

  /** Resolve one cast on the real content and turn it into a `cast:resolved`. */
  const play = (phrase: string, receiverId: string) => {
    const spell = db.byPhraseText(phrase)!;
    const r = resolveCast(db, phrase, [...spell.components], receiverId, { mana: "baseline" });
    return { result: r, event: cast(r.spellId ?? "", r.receiverId, {
      screenId: "F8",
      outcome: r.outcome as "effect" | "no-effect",
      consumed: r.consumed,
      produced: r.produced,
      narration: r.narration,
    }) };
  };

  it("mints the two intermediates the chain binds on", () => {
    // The per-receiver `produces` (option A) is load-bearing: ignite x
    // river_stone must mint the heated stone, temper x heated_stone the tempered.
    const heat = play("ignite", "river_stone");
    expect(heat.result.outcome).toBe("effect");
    expect(heat.result.produced).toEqual(["item_heated_stone"]);

    const set = play("temper", "heated_stone");
    expect(set.result.outcome).toBe("effect");
    expect(set.result.produced).toEqual(["item_tempered_stone"]);

    const seat = play("fetch", "stone_wall");
    expect(seat.result.outcome).toBe("effect");
  });

  it("clears the gate when ignite -> temper -> fetch is played in order", () => {
    const b = bus();
    const e = engine({ bus: b });
    // The gate loaded — a refused gate could never clear, and that would hide
    // a real regression behind a green-looking test.
    expect(e.loadedGateIds()).toContain("G-F8-combine");
    expect(e.isCleared("G-F8-combine")).toBe(false);

    b.emit(play("ignite", "river_stone").event);
    b.emit(play("temper", "heated_stone").event);
    b.emit(play("fetch", "stone_wall").event);

    const cleared = e.refresh(ctxOf(b)).cleared;
    expect(cleared).toContain("G-F8-combine");
    expect(e.isCleared("G-F8-combine")).toBe(true);
  });

  it("does NOT clear out of order — temper before ignite, fetch before temper", () => {
    const b = bus();
    const e = engine({ bus: b });
    b.emit(play("fetch", "stone_wall").event);
    b.emit(play("temper", "heated_stone").event);
    b.emit(play("ignite", "river_stone").event);
    e.refresh(ctxOf(b));
    expect(e.isCleared("G-F8-combine")).toBe(false);
  });

  it("does NOT clear on a partial walk — ignite then temper, no fetch", () => {
    const b = bus();
    const e = engine({ bus: b });
    b.emit(play("ignite", "river_stone").event);
    b.emit(play("temper", "heated_stone").event);
    e.refresh(ctxOf(b));
    expect(e.isCleared("G-F8-combine")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// THE MARKER TARGET SET — mode5 Track 1 (`ReceiverHotspots`), the player's
// only way to actually cast the chain above in play
// ---------------------------------------------------------------------------

/**
 * `castTargetsFor` is what decides which markers `ReceiverHotspots` draws.
 * Proves it on F8's real screen spec + a real `Inventory`: the static set is
 * there from turn one, and casting through it — via `CastPipeline`, the same
 * path a marker click uses — clears `G-F8-combine` exactly like the section
 * above, plus proves the union half (minted world items) actually fires.
 *
 * THE APPROACH (Roc, playtest 2026-08-18): F8's own gate blocks entry to F8
 * ITSELF, so the player can never stand there before the chain is already
 * done — the receivers must be castable from F5, the one screen with the
 * still-locked "[Go to Heart of the Wood]" choice. Proved here against the
 * REAL graph, `Gates`, and `GateEngine` — not a synthetic screen — so a
 * rename or a re-authoring of the F5/F8 pair would catch this going stale.
 */
describe("cast-on-a-thing marker targets match what the chain needs (mode5 Track 1)", () => {
  const db = new MagicDB(spells, items);
  const screens = graph.screens ?? [];
  const gatePort = { isCleared: () => false, clear: () => {} };
  const knowledgePort = { learn: () => false, see: () => {} };
  const policy: CastPolicy = { teachOn: [], hintOn: [], clearsTableGatesOn: [], clearsLocalGateOn: [] };
  const F8_MOVE_CHOICE = "[Go to Heart of the Wood]";

  const castOn = (
    pipeline: CastPipeline,
    inv: Inventory,
    spellId: string,
    receiverId: string,
    screenId: string,
  ) => {
    const spell = spells.find((s) => s.spell_id === spellId)!;
    return pipeline.run({
      phrase: spell.phrase,
      offered: componentsFromHeld(spell, inv.availableOn(screenId)),
      receiverId,
      screenId,
    });
  };

  it("F8's static screen.receivers already offers all three chain targets, standing right on F8", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    const targets = castTargetsFor(screens, ["F8"], (s) => inv.worldItemsOn(s));
    expect(targets.map((t) => t.id).sort()).toEqual(["heated_stone", "river_stone", "stone_wall"]);
  });

  it("THE APPROACH: standing on F5, F8's receivers still surface — each tagged with F8, not F5", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    const e = engine();
    const g = new Gates(graph);
    const approach = approachScreens(
      [F8_MOVE_CHOICE],
      (name) => g.screenIdForName(name),
      (screenId) => e.blocking(g.requirements.get(screenId)?.gateIds ?? []),
    );
    expect(approach).toEqual(["F8"]);
    const targets = castTargetsFor(screens, ["F5", ...approach], (s) => inv.worldItemsOn(s));
    expect(targets.map((t) => t.id).sort()).toEqual(["heated_stone", "river_stone", "stone_wall"]);
    expect(targets.every((t) => t.screenId === "F8")).toBe(true);
  });

  it("the union half fires too: ignite's minted world item joins the target set alongside the static receiver", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    inv.give("item_sticks");
    const b = bus();
    const pipeline = new CastPipeline({
      magic: db, inventory: inv, knowledge: knowledgePort, gates: gatePort,
      gateTable: {}, policy, bus: b,
    });
    castOn(pipeline, inv, "ignite", "river_stone", "F8");
    const targets = castTargetsFor(screens, ["F8"], (s) => inv.worldItemsOn(s)).map((t) => t.id);
    // Both present: the always-there static id AND the freshly minted world item.
    expect(targets).toContain("heated_stone");
    expect(targets).toContain("item_heated_stone");
  });

  it("casting the chain FROM F5 — the marker's own screenId, not wherever the player stands — clears G-F8-combine", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    inv.give("item_sticks");
    inv.give("item_river_stone");
    inv.give("item_spring_water");
    inv.give("item_feather");
    inv.give("item_wool");
    const b = bus();
    const e = engine({ bus: b });
    const g = new Gates(graph);
    const pipeline = new CastPipeline({
      magic: db, inventory: inv, knowledge: knowledgePort, gates: gatePort,
      gateTable: {}, policy, bus: b,
    });

    const targetsFromF5 = () => {
      const approach = approachScreens(
        [F8_MOVE_CHOICE],
        (name) => g.screenIdForName(name),
        (screenId) => e.blocking(g.requirements.get(screenId)?.gateIds ?? []),
      );
      return castTargetsFor(screens, ["F5", ...approach], (s) => inv.worldItemsOn(s));
    };

    // Every step is played while `castTargetsFor` was asked about F5, never F8.
    let targets = targetsFromF5();
    const riverStone = targets.find((t) => t.id === "river_stone")!;
    expect(riverStone.screenId).toBe("F8");
    expect(castOn(pipeline, inv, "ignite", riverStone.id, riverStone.screenId).landed).toBe(true);

    targets = targetsFromF5();
    const heatedStone = targets.find((t) => t.id === "heated_stone")!;
    expect(castOn(pipeline, inv, "temper", heatedStone.id, heatedStone.screenId).landed).toBe(true);

    targets = targetsFromF5();
    const stoneWall = targets.find((t) => t.id === "stone_wall")!;
    expect(castOn(pipeline, inv, "fetch", stoneWall.id, stoneWall.screenId).landed).toBe(true);

    expect(e.refresh(ctxOf(b)).cleared).toContain("G-F8-combine");
  });
});

// ---------------------------------------------------------------------------
// Wiring
// ---------------------------------------------------------------------------

describe("engine wiring", () => {
  it("attach() refreshes on cast:resolved and returns an unsubscribe", () => {
    const b = bus();
    const e = engine({ bus: b });
    const off = e.attach(b, () => NO_BONDS);
    b.emit(cast("ignite", "dry_hedge"));
    expect(e.isCleared("G-F5-cascade")).toBe(true);
    off();
    b.emit(cast("glimmer", "lantern_arch_stone"));
    expect(e.isCleared("G-F7-light")).toBe(false);
  });

  it("restoreCleared seeds from a save and emits nothing", () => {
    const b = bus();
    const e = engine({ bus: b });
    e.restoreCleared(["G-F7-light", "G-F4-still", "G-NOT-A-GATE"]);
    // A refused or unknown gate is not restorable — it never loaded.
    expect(e.clearedGates()).toEqual(["G-F7-light"]);
    expect(b.logOf("gate:cleared")).toEqual([]);
  });

  it("reportBlocked emits the gates still standing", () => {
    const b = bus();
    const e = engine({ bus: b });
    e.reportBlocked("F7", ["G-F5-cascade", "G-F7-light"], "[Go to The Cave]");
    const blocked = b.logOf("gate:blocked");
    expect(blocked[0].gateIds).toEqual(["G-F5-cascade", "G-F7-light"]);
    expect(blocked[0].moveText).toBe("[Go to The Cave]");
  });

  it("screensByGateFrom inverts screen->gates", () => {
    expect([...(screensByGate.get("G-F5-cascade") ?? [])].sort()).toEqual(["F5", "F6"]);
    expect(screensByGate.get("G-T5-trust")).toEqual(["T5"]);
  });
});

describe("the authored gate layer is mounted, not shelved", () => {
  const readText = (p: string) => fs.readFileSync(path.join(here, "..", p), "utf8");
  const collectScene = readText("src/scenes/CollectScene.ts");
  const modesSource = readText("src/mode/modes.ts");

  it("CollectScene constructs a GateEngine and attaches it to the bus", () => {
    expect(collectScene).toContain("new GateEngine(");
    expect(collectScene).toContain(".attach(");
  });

  it("mode5 is the only descriptor with authored gates enforced", () => {
    // Same "read the source text" posture as the save wiring test above —
    // exact enough to catch the two failure modes that matter: `gates`
    // landing back on `legacy-hedge`, or `enforce` going false while the
    // descriptor still claims authored — either one is Mode 4's original
    // defect (a field nothing reads, or read and ignored) in new clothes.
    const mode5Block = /export const MODE5[\s\S]*?\n};/.exec(modesSource)?.[0] ?? "";
    expect(mode5Block).toMatch(/gates:\s*{\s*source:\s*"authored",\s*enforce:\s*true\s*}/);

    for (const id of ["DAYLIFE", "COLLECT", "DISCOVER_HOME"]) {
      const block = new RegExp(`export const ${id}[\\s\\S]*?\\n};`).exec(modesSource)?.[0] ?? "";
      expect(block).not.toMatch(/gates:\s*{\s*source:\s*"authored"/);
    }
  });

  it("GatesSlice is registered so cleared gates round-trip through save", () => {
    expect(collectScene).toContain("new GatesSlice(");
  });
});
