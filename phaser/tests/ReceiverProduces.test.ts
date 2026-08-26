/**
 * Per-receiver `produces` (option A, Roc 2026-08-19) — the F8 heated-stone chain.
 *
 * A spell RECEIVER may carry its own `produces`, overriding the spell-level
 * default when a cast lands on that receiver. This suite pins the two halves of
 * the mechanic and, crucially, that they JOIN:
 *
 *   1. `CastResolver` mints the receiver's product, not the spell default, and
 *      falls back to the spell default on a receiver that declares none.
 *   2. `GateEvaluator`'s chain binding is receiver-aware — a later
 *      `onProductOf` step binds to what the earlier step's RECEIVER minted. The
 *      product the resolver emits is fed verbatim into the cast log, so the
 *      chain closes on `item_heated_stone` and would NOT close on the spell's
 *      default `item_flame`. That join is the load-bearing part: without it the
 *      heated-stone chain never matches.
 *
 * Synthetic records on purpose — the real content is authored in a later phase.
 * The shapes are the real `SpellRecord` / `ChainGateRule`, so the mechanism is
 * exercised exactly as the shipped pipeline will exercise it.
 */

import { describe, expect, it } from "vitest";
import { MagicDB, resolveCast } from "../src/magic/CastResolver";
import type { ItemRecord, Receiver, SpellRecord } from "../src/magic/types";
import { GameEventBus, type GameEvent } from "../src/world/events/GameEvents";
import { evaluateRule, type GateContext } from "../src/world/gates/GateEvaluator";
import type { ChainGateRule } from "../src/world/gates/GateRule";

const receiver = (over: Partial<Receiver> & Pick<Receiver, "receiver_id">): Receiver => ({
  receiver_class: "inert",
  physical_outcome: "authored prose",
  reaction_kind: null,
  ...over,
});

/** `ignite`, with a per-receiver override on `river_stone` and a plain receiver. */
const ignite: SpellRecord = {
  spell_id: "ignite",
  phrase: "ignite",
  role: "Blacksmith",
  status: "approved",
  components: ["item_sticks"],
  produces: ["item_flame"], // spell-level default
  learn_source: "",
  confirm_action: "",
  mana_effect: "",
  unlocks: { screen: null, obstacle: null, witnessable_cast: null },
  receivers: [
    // The override: this pairing mints the heated stone, not a flame.
    receiver({ receiver_id: "river_stone", produces: ["item_heated_stone"] }),
    // No override: falls back to the spell default.
    receiver({ receiver_id: "stick" }),
  ],
};

const items: ItemRecord[] = [
  {
    item_id: "item_sticks",
    description: "",
    category: "component",
    persistence: "pack-triaged",
    collectible: true,
    consumable: true,
    source_locations: [],
    always_available: false,
    used_by: ["ignite"],
    produced_by: [],
    use_family: null,
  },
];

const db = new MagicDB([ignite], items);

/** A bus with a deterministic clock, mirroring GateEngine.test.ts. */
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
    screenId: "F8",
    outcome: "effect",
    consumed: [],
    produced: [],
    narration: "authored prose",
    ...extra,
  };
}

const ctxOf = (b: GameEventBus): GateContext => ({
  log: b.log(),
  facts: { timeBlock: "morning", bondBands: {} },
});

/** The two-step teaching shape: ignite the stone, then temper what it made. */
const CHAIN: ChainGateRule = {
  kind: "chain",
  steps: [
    { spellId: "ignite", receiverId: "river_stone" },
    { spellId: "temper", onProductOf: 0 },
  ],
};

describe("a receiver's own `produces` overrides the spell default", () => {
  it("mints the receiver product on the pairing that declares one", () => {
    const r = resolveCast(db, "ignite", ["item_sticks"], "river_stone");
    expect(r.outcome).toBe("effect");
    expect(r.produced).toEqual(["item_heated_stone"]);
  });

  it("falls back to the spell default on a receiver that declares none", () => {
    const r = resolveCast(db, "ignite", ["item_sticks"], "stick");
    expect(r.produced).toEqual(["item_flame"]);
  });

  it("mints nothing when the cast lands but does nothing, override or not", () => {
    // Same rule as the spell default: a no-effect cast produces nothing. Proven
    // by an authored no-effect outcome on the overriding receiver.
    const noEffect: SpellRecord = {
      ...ignite,
      receivers: [
        receiver({
          receiver_id: "river_stone",
          physical_outcome: "No physical effect — the stone stays cold.",
          produces: ["item_heated_stone"],
        }),
      ],
    };
    const only = new MagicDB([noEffect], items);
    const r = resolveCast(only, "ignite", ["item_sticks"], "river_stone");
    expect(r.outcome).toBe("no-effect");
    expect(r.produced).toEqual([]);
  });
});

describe("the chain binds to the RECEIVER'S product, not the spell default", () => {
  it("closes when step 1 is aimed at what step 0's receiver minted", () => {
    // The product the RESOLVER emits is exactly what the cast log carries, so
    // resolve first and feed that list through — the two halves must join.
    const minted = resolveCast(db, "ignite", ["item_sticks"], "river_stone").produced;
    expect(minted).toEqual(["item_heated_stone"]);

    const b = bus();
    b.emit(cast("ignite", "river_stone", { produced: minted }));
    b.emit(cast("temper", "item_heated_stone"));

    const r = evaluateRule("G-F8-combine", CHAIN, ctxOf(b));
    expect(r.satisfied).toBe(true);
    expect(r.progress).toBe(2);
    expect(r.matchedSeqs).toEqual([1, 2]);
  });

  it("does NOT close when step 0 minted only the spell default", () => {
    // Without the receiver override, ignite mints `item_flame`; a temper aimed
    // at the heated stone finds nothing to bind to. This is the exact failure
    // the override exists to prevent.
    const b = bus();
    b.emit(cast("ignite", "river_stone", { produced: ["item_flame"] }));
    b.emit(cast("temper", "item_heated_stone"));

    const r = evaluateRule("G-F8-combine", CHAIN, ctxOf(b));
    expect(r.satisfied).toBe(false);
    expect(r.progress).toBe(1);
  });
});
