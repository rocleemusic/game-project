/**
 * CHARACTERIZATION TESTS — CAST BOOKKEEPING.
 *
 * These pin what the code does TODAY, right or wrong. They are a safety net for
 * an extraction that has NOT happened yet: the plan's `world/CastPipeline.ts`
 * pulls the bookkeeping out of two Phaser scenes that already disagree with
 * each other (`plans/2026-08-17-phaser-pivot-mode4-plan.md`, "Mode 4 —
 * dismantling the flag chain"). If the extracted pipeline changes any behaviour
 * recorded here, these fail loudly instead of the change landing silently.
 *
 * WHY THE SCENES ARE NOT IMPORTED. `CastScene` and `CollectScene` extend
 * `Phaser.Scene`, and there is no Phaser runtime under vitest. So each test
 * replicates the scene method's EXACT call sequence against the real
 * `MagicDB` / `Inventory` / `Knowledge` / `Gates`, and names the file and line
 * it mirrors. That keeps the test runnable now and makes it the contract the
 * extracted `CastPipeline` must meet.
 *
 * Content is the real shipped content — `public/content/*.json` and
 * `public/story/graph.json`. No fixtures, because a fixture would let the
 * content drift out from under the pin.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MagicDB, resolveCast, type CastResult, type ManaBand } from "../../src/magic/CastResolver";
import { Inventory } from "../../src/world/Inventory";
import { Knowledge } from "../../src/world/Knowledge";
import { Gates } from "../../src/world/Gates";
import { PROPOSED_SPELL_GATES } from "../../src/world/spellGates";
import { HEDGE_RECEIVER_ID, HEDGE_CLEARING_SPELL } from "../../src/world/collectGates";
import { CastPipeline, componentsFromHeld } from "../../src/world/CastPipeline";
import { TEACHING_CAST, HEDGE_CAST } from "../../src/mode/castPolicy";
import type { Graph } from "../../../tools/lantern/src/types";
import type { ItemRecord, SpellRecord } from "../../src/magic/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(here, "..", "..", p), "utf8"));

const graph = read("public/story/graph.json") as Graph;
const spells = read("public/content/magic.json") as SpellRecord[];
const items = read("public/content/items.json") as ItemRecord[];
const rawKeyItems = read("public/content/key-items.json") as Record<string, unknown>[];

/**
 * Mirrors `src/ink/loadRun.ts:normalizeKeyItem` (line 90). Key items key on
 * `key_item_id`, not `item_id`, and carry no `used_by` — GAPS.md G10. Both
 * scenes build their Inventory from `[...run.items, ...run.keyItems]`
 * (`CollectScene.ts:163`, `ScreenScene.ts:66`), so the tests do too.
 */
const keyItems: ItemRecord[] = rawKeyItems.map((raw) => ({
  item_id: String(raw.key_item_id ?? raw.item_id ?? ""),
  description: String(raw.description ?? ""),
  category: raw.category as ItemRecord["category"],
  persistence: (raw.persistence as ItemRecord["persistence"]) ?? "pack-triaged",
  collectible: true,
  consumable: Boolean(raw.consumable),
  source_locations: (raw.source_locations as string[]) ?? [],
  always_available: false,
  used_by: [],
  produced_by: [],
  use_family: (raw.use_family as string | null) ?? null,
}));

const ALL_ITEMS = [...items, ...keyItems];

/** `CollectScene.ts:42`. */
const STARTER_SPELLS = ["ignite", "breath"];

// ---------------------------------------------------------------------------
// The two paths under characterization.
// ---------------------------------------------------------------------------

interface Deps {
  magic: MagicDB;
  inventory: Inventory;
  knowledge: Knowledge;
  gates: Gates;
  /** `CastScene.screen` / `CollectScene.currentScreen`. */
  screen: string | null;
}

/**
 * WAVE 1 UPDATE — both paths below now run the REAL `world/CastPipeline.ts`.
 *
 * They used to be hand-transcriptions of `CastScene.cast()` and
 * `CollectScene.hedgeSpellPicker()`, because a method inside a Phaser scene
 * cannot be imported into vitest. That made them a description of the old code
 * rather than a test of the new. Now each path builds the pipeline with the
 * CastPolicy its mode descriptor actually supplies, and the scenes call the same
 * pipeline with the same policy — so the net guards the extraction instead of
 * shadowing it.
 *
 * NOT ONE ASSERTION IN THIS FILE CHANGED. What is left in each function below is
 * only the part that is genuinely the scene's: which components it offers, and
 * what text it puts on screen.
 */

/** The pipeline as `CastScene` builds it: the teaching policy. */
function castPipelineFor(d: Deps, policy = TEACHING_CAST): CastPipeline {
  return new CastPipeline({
    magic: d.magic,
    inventory: d.inventory,
    knowledge: d.knowledge,
    gates: d.gates,
    gateTable: PROPOSED_SPELL_GATES,
    policy,
  });
}

/**
 * PATH 1 — `src/scenes/CastScene.ts` `cast()`, now `pipeline.run(...)` plus the
 * two fields the result panel reads.
 *
 * Order matters and is pinned: resolve, then inventory, then knowledge, then
 * gates. `clearedNow` is the delta, not the running total.
 */
function castScenePath(
  d: Deps,
  phrase: string,
  slots: string[],
  receiverId: string,
  mana: ManaBand = "baseline",
): { result: CastResult; clearedNow: string[] } {
  const report = castPipelineFor(d).run({
    phrase,
    offered: slots,
    receiverId,
    screenId: d.screen,
    mana,
  });
  return { result: report.result, clearedNow: report.clearedNow };
}

/**
 * PATH 2 — `src/scenes/CollectScene.ts` `hedgeSpellPicker()`, now the same
 * pipeline under `HEDGE_CAST` plus the picker's three messages.
 *
 * `receiverId` is a parameter only so the no-effect branch can be reached; the
 * scene hardcodes `HEDGE_RECEIVER_ID`.
 *
 * NOTE what is absent, deliberately: no `knowledge.learn`, no `knowledge.see`,
 * no `gates.clear`. That absence is now `HEDGE_CAST`'s empty `teachOn`,
 * `hintOn` and `clearsTableGatesOn` — a ruling stated as data, rather than code
 * that happens not to call something.
 */
function collectHedgePath(
  d: Deps,
  spellId: string,
  receiverId: string = HEDGE_RECEIVER_ID,
): { result: CastResult; hedgeCleared: boolean; message: string } {
  const s = d.magic.spell(spellId)!;
  const report = castPipelineFor(d, HEDGE_CAST).run({
    phrase: s.phrase,
    offered: componentsFromHeld(s, d.inventory.availableOn(null)),
    receiverId,
    screenId: d.screen,
  });
  const res = report.result;
  if (res.outcome === "wrong-components") {
    return {
      result: res,
      hedgeCleared: false,
      message: `You know ${s.phrase}, but you're not carrying what it needs.`,
    };
  }
  if (res.outcome === "unknown-receiver") {
    return { result: res, hedgeCleared: false, message: `${s.phrase} does nothing to a dry hedge.` };
  }
  return {
    result: res,
    hedgeCleared: report.localGateCleared,
    message: `${s.phrase}: ${res.narration}`,
  };
}

/** `CollectScene.ts:874` — the picker's option list is the spellbook, nothing else. */
function collectPickerOptions(knowledge: Knowledge): string[] {
  return knowledge.spellbook();
}

// ---------------------------------------------------------------------------
// Fixtures — a fresh world per test, built the way each scene builds it.
// ---------------------------------------------------------------------------

/** `ScreenScene.ts:66` — Inventory with `includeAlwaysAvailable` at its default. */
function castSceneWorld(screen: string | null = "F1"): Deps {
  return {
    magic: new MagicDB(spells, ALL_ITEMS),
    inventory: new Inventory(ALL_ITEMS),
    knowledge: new Knowledge(),
    gates: new Gates(graph),
    screen,
  };
}

/** `CollectScene.ts:163-177` — possession matters, and two spells start learned. */
function collectWorld(screen: string | null = "F7"): Deps {
  const magic = new MagicDB(spells, ALL_ITEMS);
  const knowledge = new Knowledge();
  for (const id of STARTER_SPELLS) if (magic.spell(id)) knowledge.learn(id);
  return {
    magic,
    inventory: new Inventory(ALL_ITEMS, { includeAlwaysAvailable: false }),
    knowledge,
    gates: new Gates(graph),
    screen,
  };
}

/** Counts every `applyCast` while still doing the real work. */
function spyOnApplyCast(inv: Inventory): { consumed: string[]; produced: string[] }[] {
  const calls: { consumed: string[]; produced: string[] }[] = [];
  const orig = inv.applyCast.bind(inv);
  inv.applyCast = (screen: string | null, consumed: string[], produced: string[]) => {
    calls.push({ consumed, produced });
    orig(screen, consumed, produced);
  };
  return calls;
}

// Content anchors, asserted once so a content edit fails HERE with a clear
// message rather than making an unrelated bookkeeping test look broken.
describe("content anchors these tests stand on", () => {
  it("ignite lands on dry_hedge, does nothing to a cat, and is the only spell with a hedge", () => {
    const ignite = spells.find((s) => s.spell_id === "ignite")!;
    expect(ignite.status).toBe("approved");
    expect(ignite.components).toEqual(["item_sticks"]);
    expect(ignite.receivers.some((r) => r.receiver_id === "dry_hedge")).toBe(true);
    expect(ignite.receivers.some((r) => r.receiver_id === "cat")).toBe(true);
    expect(spells.filter((s) => s.receivers.some((r) => r.receiver_id === "dry_hedge"))).toHaveLength(1);
    expect(HEDGE_CLEARING_SPELL).toBe("ignite");
  });
});

// ---------------------------------------------------------------------------
// 1. CastScene: effect LEARNS, no-effect only SEES.
// ---------------------------------------------------------------------------

describe("1 — CastScene teaches on effect, hints on no-effect", () => {
  /**
   * WHY THIS EXISTS: `gdd/04-magic-system.md` — "you learn them by successfully
   * casting them once", and a cast that lands and does nothing "is a clue, not
   * a confirmation". Two knowledge states, not one.
   *
   * BREAKING IT MEANS: either no-effect silently teaches (destroying the
   * knowledge reward mechanic — 31 of 89 authored outcomes are no-effect, so
   * the spellbook would fill itself), or effect stops teaching and the
   * spellbook can never be filled at all.
   */
  it("outcome 'effect' puts the spell in the spellbook", () => {
    const d = castSceneWorld();
    const { result } = castScenePath(d, "ignite", ["item_sticks"], "dry_hedge");
    expect(result.outcome).toBe("effect");
    expect(d.knowledge.knows("ignite")).toBe(true);
    expect(d.knowledge.spellbook()).toEqual(["ignite"]);
    expect(d.knowledge.clues()).toEqual([]);
  });

  it("outcome 'no-effect' marks the spell SEEN and leaves the spellbook empty", () => {
    const d = castSceneWorld();
    const { result } = castScenePath(d, "ignite", ["item_sticks"], "cat");
    expect(result.outcome).toBe("no-effect");
    expect(d.knowledge.knows("ignite")).toBe(false);
    expect(d.knowledge.hasSeen("ignite")).toBe(true);
    expect(d.knowledge.spellbook()).toEqual([]);
    expect(d.knowledge.clues()).toEqual(["ignite"]);
  });

  it("a later effect promotes a seen spell to learned, and it stops being a clue", () => {
    const d = castSceneWorld();
    castScenePath(d, "ignite", ["item_sticks"], "cat");
    castScenePath(d, "ignite", ["item_sticks"], "dry_hedge");
    expect(d.knowledge.spellbook()).toEqual(["ignite"]);
    expect(d.knowledge.clues()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 2. Collect path never touches Knowledge.
// ---------------------------------------------------------------------------

describe("2 — the collect path writes no knowledge at all", () => {
  /**
   * WHY THIS EXISTS: Roc ruled 2026-08-17 — collect-mode casting does NOT teach
   * a spell. Learning happens only via `CastScene`, or as a clue from an NPC
   * (`CollectScene.ts:809`). This is the concrete disagreement between the two
   * cast paths that the extraction has to preserve rather than "unify".
   *
   * BREAKING IT MEANS: the extracted CastPipeline has folded knowledge writes
   * into the shared path, and collect mode has started teaching spells behind
   * the ruling's back.
   */
  it("a landing cast in collect mode adds nothing to learned or seen", () => {
    const d = collectWorld();
    d.inventory.give("item_sticks");
    const before = { book: d.knowledge.spellbook(), clues: d.knowledge.clues() };

    const { result, hedgeCleared } = collectHedgePath(d, "ignite");

    expect(result.outcome).toBe("effect");
    expect(hedgeCleared).toBe(true);
    expect(d.knowledge.spellbook()).toEqual(before.book);
    expect(d.knowledge.clues()).toEqual(before.clues);
    // Specifically: the starter spells and nothing more.
    expect(d.knowledge.spellbook()).toEqual([...STARTER_SPELLS].sort());
  });

  it("a no-effect cast in collect mode also adds nothing to seen", () => {
    // Receiver parameterised only to reach a branch the hedge cannot produce.
    const d = collectWorld();
    d.inventory.give("item_sticks");
    const { result } = collectHedgePath(d, "ignite", "cat");
    expect(result.outcome).toBe("no-effect");
    expect(d.knowledge.spellbook()).toEqual([...STARTER_SPELLS].sort());
    expect(d.knowledge.clues()).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. The collect picker offers exactly the spellbook.
// ---------------------------------------------------------------------------

describe("3 — the collect picker offers exactly knowledge.spellbook()", () => {
  /**
   * WHY THIS EXISTS: Roc ruled 2026-08-17 — if a spell is not already known it
   * is not offered. `CollectScene.hedgeSpellPicker()` (line 874) reads
   * `spellbook()`, which is LEARNED only; `seen` (an NPC clue) is deliberately
   * not an option.
   *
   * BREAKING IT MEANS: the picker has started offering clues or the whole
   * approved spell list, which hands the player spells they never earned and
   * makes the knowledge gate decorative.
   */
  it("offers the learned spells, in spellbook order", () => {
    const d = collectWorld();
    expect(collectPickerOptions(d.knowledge)).toEqual([...STARTER_SPELLS].sort());
  });

  it("a spell only SEEN — an NPC clue — is never an option", () => {
    const d = collectWorld();
    // Mirrors `CollectScene.ts:809`, the NPC spell list handing out a clue.
    d.knowledge.see("glimmer");
    expect(d.knowledge.hasSeen("glimmer")).toBe(true);
    expect(d.knowledge.clues()).toContain("glimmer");
    expect(collectPickerOptions(d.knowledge)).not.toContain("glimmer");
    expect(collectPickerOptions(d.knowledge)).toEqual(d.knowledge.spellbook());
  });

  it("never offers a spell that is not an approved, resolvable record", () => {
    const d = collectWorld();
    d.knowledge.learn("glimmer");
    for (const id of collectPickerOptions(d.knowledge)) {
      expect(d.magic.spell(id), `${id} is offered but has no MagicDB record`).toBeDefined();
      expect(d.magic.spell(id)!.status).toBe("approved");
    }
  });

  it("with an empty spellbook there is nothing to offer at all", () => {
    const d = collectWorld();
    const empty = new Knowledge();
    expect(collectPickerOptions(empty)).toEqual([]);
    expect(collectPickerOptions(d.knowledge).length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 4. Gate clearing is effect-only, and driven by the PROPOSED_SPELL_GATES table.
// ---------------------------------------------------------------------------

describe("4 — CastScene clears gates on effect only", () => {
  /**
   * WHY THIS EXISTS: `CastScene.ts:164` — "only a cast that physically DID
   * something can clear a gate. A cast that lands and does nothing is an honest
   * result, but it opens no path." The mapping is DATA
   * (`world/spellGates.ts`), never `if (spellId === 'ignite')`.
   *
   * BREAKING IT MEANS: either no-effect started opening paths (the forest
   * unlocks itself by casting at a cat), or the gate join moved back into a
   * code branch, which the standing constraint forbids.
   */
  it("an effect clears exactly the gates the table maps for that spell", () => {
    const d = castSceneWorld();
    const { clearedNow } = castScenePath(d, "ignite", ["item_sticks"], "dry_hedge");
    expect(PROPOSED_SPELL_GATES.ignite).toEqual(["G-F7-light"]);
    expect(clearedNow).toEqual(["G-F7-light"]);
    expect(d.gates.clearedGates()).toEqual(["G-F7-light"]);
  });

  it("a no-effect clears none, and leaves the gate set untouched", () => {
    const d = castSceneWorld();
    const { result, clearedNow } = castScenePath(d, "ignite", ["item_sticks"], "cat");
    expect(result.outcome).toBe("no-effect");
    expect(clearedNow).toEqual([]);
    expect(d.gates.clearedGates()).toEqual([]);
  });

  it("a spell with no table entry clears nothing even on a full effect", () => {
    const d = castSceneWorld();
    expect(PROPOSED_SPELL_GATES.breath).toBeUndefined();
    const { result, clearedNow } = castScenePath(
      d,
      "breath",
      ["item_grass", "item_dirt"],
      "fallen_leaves",
    );
    expect(result.outcome).toBe("effect");
    expect(clearedNow).toEqual([]);
    expect(d.gates.clearedGates()).toEqual([]);
  });

  it("re-casting reports no NEW gates but does not un-clear the old one", () => {
    // `clearedNow` is what the result panel prints, so it must be the delta,
    // not the running total (CastScene.ts:166-169).
    const d = castSceneWorld();
    castScenePath(d, "ignite", ["item_sticks"], "dry_hedge");
    const second = castScenePath(d, "ignite", ["item_sticks"], "dry_hedge");
    expect(second.clearedNow).toEqual([]);
    expect(d.gates.clearedGates()).toEqual(["G-F7-light"]);
  });
});

// ---------------------------------------------------------------------------
// 5. Only ignite on the dry hedge sets the hedge flag.
// ---------------------------------------------------------------------------

describe("5 — the hedge flag answers to ignite on dry_hedge and nothing else", () => {
  /**
   * WHY THIS EXISTS: `collectGates.ts` states the hedge is this mode's only
   * gate, and `ignite` is the only spell with `dry_hedge` authored. Every other
   * spell resolves `unknown-receiver` there and must leave the path blocked.
   *
   * BREAKING IT MEANS: either the hedge opened to a spell that has no authored
   * outcome on it (an invented result, which the content rules forbid), or
   * ignite stopped opening it and mode 2/3 became unwinnable.
   */
  it("ignite with sticks held sets the flag and reports the authored prose", () => {
    const d = collectWorld();
    d.inventory.give("item_sticks");
    const out = collectHedgePath(d, "ignite");
    expect(out.result.outcome).toBe("effect");
    expect(out.hedgeCleared).toBe(true);
    expect(out.message).toBe(`ignite: ${out.result.narration}`);
  });

  it("every other approved spell leaves the hedge standing", () => {
    const refusals = new Map<string, string>();
    for (const spell of spells.filter((s) => s.status === "approved" && s.spell_id !== "ignite")) {
      const d = collectWorld();
      // Give the spell everything it needs, so the usual reason it can fail is
      // the receiver — otherwise this would prove nothing but empty pockets.
      for (const c of spell.components) d.inventory.give(c);
      const out = collectHedgePath(d, spell.spell_id);
      expect(out.hedgeCleared, `${spell.spell_id} cleared the hedge`).toBe(false);
      expect(
        ["unknown-receiver", "wrong-components"],
        `${spell.spell_id} on dry_hedge`,
      ).toContain(out.result.outcome);
      refusals.set(spell.spell_id, out.result.outcome);
    }
    // RECORDED QUIRK, and the reason this is not a flat "unknown-receiver" for
    // all fifteen: `leap` takes `item_flame`, which is `persistence: "world"`.
    // `Inventory.give()` refuses to pocket a world item (Inventory.ts:89) and
    // the collect path calls `availableOn(null)` with no screen
    // (CollectScene.ts:899), so the flame is unreachable and `leap` refuses one
    // step earlier, on components. Every other spell gets as far as the
    // receiver and is turned away there.
    expect(refusals.get("leap")).toBe("wrong-components");
    const byReceiver = [...refusals].filter(([, o]) => o === "unknown-receiver").map(([id]) => id);
    expect(byReceiver.sort()).toEqual(
      spells
        .filter((s) => s.status === "approved" && s.spell_id !== "ignite" && s.spell_id !== "leap")
        .map((s) => s.spell_id)
        .sort(),
    );
  });

  it("ignite without sticks held does NOT set the flag — possession is the gate", () => {
    // Mode 2/3 run `includeAlwaysAvailable: false` (CollectScene.ts:163), so
    // item_sticks must genuinely be foraged first. This is the 2026-08-13 bug,
    // pinned from the cast side.
    const d = collectWorld();
    const out = collectHedgePath(d, "ignite");
    expect(out.result.outcome).toBe("wrong-components");
    expect(out.hedgeCleared).toBe(false);
    expect(out.message).toBe("You know ignite, but you're not carrying what it needs.");
  });

  it("RECORDED QUIRK: the flag is set on ANY landed cast, not only on 'effect'", () => {
    // `hedgeSpellPicker` guards on `wrong-components` and `unknown-receiver`
    // only (CollectScene.ts:902-909), so a no-effect landing also sets it.
    // Unreachable on the real hedge (ignite's dry_hedge branch is an effect),
    // but it is what the code says, and the extraction must not "fix" it
    // silently. If CastPipeline makes the flag effect-only, this test is the
    // one that should be updated, deliberately, with a ruling.
    const d = collectWorld();
    d.inventory.give("item_sticks");
    const out = collectHedgePath(d, "ignite", "cat");
    expect(out.result.outcome).toBe("no-effect");
    expect(out.hedgeCleared).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. The hedge flag is local. Real G-* gates are untouched.
// ---------------------------------------------------------------------------

describe("6 — the hedge flag never touches the real gate graph", () => {
  /**
   * WHY THIS EXISTS: Roc ruled 2026-08-17 — collect mode's hedge gate stays
   * LOCAL. `collectGates.ts`'s header gives the reason: F7 also needs
   * `G-F5-cascade`, which no approved spell can clear, so reusing the real
   * gates would make F7 permanently stuck.
   *
   * BREAKING IT MEANS: the extraction routed the hedge through `Gates`/
   * `GateEngine`, and mode 2/3's only gated screen became unreachable forever.
   */
  it("clearing the hedge leaves Gates.clearedGates() empty", () => {
    const d = collectWorld();
    d.inventory.give("item_sticks");
    const out = collectHedgePath(d, "ignite");
    expect(out.hedgeCleared).toBe(true);
    expect(d.gates.clearedGates()).toEqual([]);
    expect(d.gates.isCleared("G-F7-light")).toBe(false);
    expect(d.gates.isCleared("G-F5-cascade")).toBe(false);
  });

  it("F7 still reports its authored gate as blocking after the hedge falls", () => {
    const d = collectWorld();
    d.inventory.give("item_sticks");
    collectHedgePath(d, "ignite");
    // Read straight off graph.json. F7 dropped G-F5-cascade (Roc, 2026-08-18)
    // and now needs only G-F7-light — the local hedge still clears neither.
    expect(d.gates.blocking("F7")).toEqual(["G-F7-light"]);
  });
});

// ---------------------------------------------------------------------------
// 7. applyCast fires on exactly two outcomes.
// ---------------------------------------------------------------------------

describe("7 — applyCast runs on 'effect' and 'no-effect', and on nothing else", () => {
  /**
   * WHY THIS EXISTS: a standing ruling (2026-08-17), and the resolver's own
   * reason at `CastResolver.ts:199` — "consumed on any landed cast, including
   * one that does nothing: you tried, and trying costs." The two never-happened
   * outcomes must cost nothing.
   *
   * BREAKING IT MEANS: either a rejected cast now spends components (the player
   * is charged for a typo), or a no-effect stopped costing anything and
   * "trying costs" quietly became false.
   */
  it("CastScene path: exactly one applyCast for effect and for no-effect, zero otherwise", () => {
    const cases: { label: string; phrase: string; slots: string[]; receiver: string; outcome: string; calls: number }[] = [
      { label: "effect", phrase: "ignite", slots: ["item_sticks"], receiver: "dry_hedge", outcome: "effect", calls: 1 },
      { label: "no-effect", phrase: "ignite", slots: ["item_sticks"], receiver: "cat", outcome: "no-effect", calls: 1 },
      { label: "wrong-components", phrase: "ignite", slots: [], receiver: "dry_hedge", outcome: "wrong-components", calls: 0 },
      { label: "unknown-receiver", phrase: "ignite", slots: ["item_sticks"], receiver: "fresh_cut_plank", outcome: "unknown-receiver", calls: 0 },
      { label: "unknown-spell", phrase: "abracadabra", slots: [], receiver: "dry_hedge", outcome: "unknown-spell", calls: 0 },
    ];
    for (const c of cases) {
      const d = castSceneWorld();
      const calls = spyOnApplyCast(d.inventory);
      const { result } = castScenePath(d, c.phrase, c.slots, c.receiver);
      expect(result.outcome, c.label).toBe(c.outcome);
      expect(calls.length, `${c.label} made ${calls.length} applyCast call(s)`).toBe(c.calls);
    }
  });

  it("collect path: same rule, reached through hedgeSpellPicker's own guards", () => {
    const effect = collectWorld();
    effect.inventory.give("item_sticks");
    const effectCalls = spyOnApplyCast(effect.inventory);
    expect(collectHedgePath(effect, "ignite").result.outcome).toBe("effect");
    expect(effectCalls.length).toBe(1);

    const noEffect = collectWorld();
    noEffect.inventory.give("item_sticks");
    const noEffectCalls = spyOnApplyCast(noEffect.inventory);
    expect(collectHedgePath(noEffect, "ignite", "cat").result.outcome).toBe("no-effect");
    expect(noEffectCalls.length).toBe(1);

    const wrong = collectWorld();
    const wrongCalls = spyOnApplyCast(wrong.inventory);
    expect(collectHedgePath(wrong, "ignite").result.outcome).toBe("wrong-components");
    expect(wrongCalls.length).toBe(0);

    const unknown = collectWorld();
    unknown.inventory.give("item_river_stone");
    unknown.knowledge.learn("glimmer");
    const unknownCalls = spyOnApplyCast(unknown.inventory);
    expect(collectHedgePath(unknown, "glimmer").result.outcome).toBe("unknown-receiver");
    expect(unknownCalls.length).toBe(0);
  });

  it("the applyCast it does make is passed the resolver's consumed and produced, unedited", () => {
    const d = castSceneWorld();
    const calls = spyOnApplyCast(d.inventory);
    const { result } = castScenePath(d, "ignite", ["item_sticks"], "dry_hedge");
    expect(calls).toHaveLength(1);
    expect(calls[0].consumed).toBe(result.consumed);
    expect(calls[0].produced).toBe(result.produced);
    expect(result.consumed).toEqual(["item_sticks"]);
    expect(result.produced).toEqual(["item_flame"]);
  });
});

// ---------------------------------------------------------------------------
// 8. The two never-happened outcomes change nothing at all.
// ---------------------------------------------------------------------------

describe("8 — 'wrong-components' and 'unknown-receiver' change no state", () => {
  /**
   * WHY THIS EXISTS: `CastResolver.ts:188` — "the phrase simply doesn't take.
   * Nothing is spent — distinct from a cast that lands and does nothing, which
   * does cost you your components." And `unknown-receiver` is a CONTENT GAP
   * being reported, not a play outcome; it must not move the world.
   *
   * BREAKING IT MEANS: casting at an unauthored receiver — which the UI invites,
   * because `CastScene.receiverOptions()` deliberately offers unauthored ones to
   * surface gaps — now costs the player materials or teaches them something.
   */
  const snapshot = (d: Deps) => ({
    available: d.inventory.availableOn(d.screen),
    availableNull: d.inventory.availableOn(null),
    discovered: [...d.inventory.discoveredIds()].sort(),
    consumedSticks: d.inventory.consumedCountOf("item_sticks"),
    consumedStone: d.inventory.consumedCountOf("item_river_stone"),
    world: d.inventory.worldItemsOn(d.screen ?? ""),
    book: d.knowledge.spellbook(),
    clues: d.knowledge.clues(),
    gates: d.gates.clearedGates(),
  });

  it("wrong-components moves nothing — inventory, knowledge or gates", () => {
    const d = castSceneWorld();
    const before = snapshot(d);
    const { result, clearedNow } = castScenePath(d, "ignite", [], "dry_hedge");
    expect(result.outcome).toBe("wrong-components");
    expect(result.missing).toEqual(["item_sticks"]);
    expect(clearedNow).toEqual([]);
    expect(snapshot(d)).toEqual(before);
  });

  it("extra components are also a refusal, and equally free", () => {
    const d = castSceneWorld();
    const before = snapshot(d);
    const { result } = castScenePath(d, "ignite", ["item_sticks", "item_river_stone"], "dry_hedge");
    expect(result.outcome).toBe("wrong-components");
    expect(result.extra).toEqual(["item_river_stone"]);
    expect(snapshot(d)).toEqual(before);
  });

  it("unknown-receiver moves nothing, even though the spell and components were right", () => {
    const d = castSceneWorld();
    const before = snapshot(d);
    const { result, clearedNow } = castScenePath(d, "ignite", ["item_sticks"], "fresh_cut_plank");
    expect(result.outcome).toBe("unknown-receiver");
    expect(result.spellId).toBe("ignite");
    expect(result.narration).toBe("");
    expect(clearedNow).toEqual([]);
    expect(snapshot(d)).toEqual(before);
  });

  it("unknown-spell moves nothing and names no spell", () => {
    const d = castSceneWorld();
    const before = snapshot(d);
    const { result } = castScenePath(d, "abracadabra", ["item_sticks"], "dry_hedge");
    expect(result.outcome).toBe("unknown-spell");
    expect(result.spellId).toBeNull();
    expect(snapshot(d)).toEqual(before);
  });

  it("collect path: both refusals leave the possession-gated inventory alone", () => {
    const d = collectWorld();
    d.inventory.give("item_sticks");
    d.inventory.give("item_river_stone");
    d.knowledge.learn("glimmer");
    const before = snapshot(d);

    expect(collectHedgePath(d, "glimmer").result.outcome).toBe("unknown-receiver");
    expect(snapshot(d)).toEqual(before);

    // `breath` is a starter spell whose components are not held: wrong-components.
    expect(collectHedgePath(d, "breath").result.outcome).toBe("wrong-components");
    expect(snapshot(d)).toEqual(before);
  });
});

// ---------------------------------------------------------------------------
// 9. Mana is quality only.
// ---------------------------------------------------------------------------

describe("9 — mana changes manaNote and nothing else", () => {
  /**
   * WHY THIS EXISTS: `gdd/04-magic-system.md` via `CastResolver.ts:16` — "mana
   * shapes a cast's quality, never whether it is possible." `CastScene`'s mana
   * toggle re-runs the same cast (line 393), so if mana touched `outcome`,
   * `consumed` or `produced`, toggling it would silently rewrite the world.
   *
   * BREAKING IT MEANS: mana has become a gate or an economy — a different game
   * from the one authored — and the mana toggle in the cast UI is now a
   * destructive control.
   */
  it("across every authored spell x receiver pair, only manaNote differs", () => {
    const db = new MagicDB(spells, ALL_ITEMS);
    let pairs = 0;
    for (const spell of db.spells) {
      for (const r of spell.receivers) {
        pairs++;
        const base = resolveCast(db, spell.phrase, [...spell.components], r.receiver_id, {
          mana: "baseline",
        });
        const high = resolveCast(db, spell.phrase, [...spell.components], r.receiver_id, {
          mana: "high",
        });
        const label = `${spell.spell_id} x ${r.receiver_id}`;
        expect(base.manaNote, label).toBeNull();
        expect(high.manaNote, label).toBe(spell.mana_effect);
        expect({ ...high, manaNote: null }, label).toEqual({ ...base, manaNote: null });
      }
    }
    // The sweep is only meaningful if it actually swept the authored set.
    // 92 = 89 + the three F8 heated-stone receivers (2026-08-19).
    expect(pairs).toBe(92);
  });

  it("mana never changes what the CastScene path writes to the world", () => {
    const run = (mana: ManaBand) => {
      const d = castSceneWorld();
      const { result, clearedNow } = castScenePath(d, "ignite", ["item_sticks"], "dry_hedge", mana);
      return {
        outcome: result.outcome,
        consumed: result.consumed,
        produced: result.produced,
        available: d.inventory.availableOn(d.screen),
        world: d.inventory.worldItemsOn(d.screen ?? ""),
        book: d.knowledge.spellbook(),
        gates: d.gates.clearedGates(),
        clearedNow,
      };
    };
    expect(run("high")).toEqual(run("baseline"));
  });

  it("a no-effect at high mana is still a no-effect, and still mints nothing", () => {
    const d = castSceneWorld();
    const { result } = castScenePath(d, "ignite", ["item_sticks"], "cat", "high");
    expect(result.outcome).toBe("no-effect");
    expect(result.produced).toEqual([]);
    expect(result.manaNote).not.toBeNull();
    expect(d.knowledge.spellbook()).toEqual([]);
  });
});
