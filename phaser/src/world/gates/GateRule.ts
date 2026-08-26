/**
 * What clears a gate — as DATA.
 *
 * The six rulings of 2026-08-17 are six JSON records, not six code branches.
 * The moment one of them becomes `if (spellId === "ignite")` the next gate
 * costs an engineering change instead of a content edit, and the whole point of
 * the authored-content pipeline is lost. Adding a seventh gate must mean adding
 * a seventh object to `world/data/gateRules.json`.
 *
 * The authored table these types describe, verbatim from the plan:
 *
 * ```jsonc
 * { "G-F5-cascade": { "kind":"cast", "spellId":"ignite",  "requireEffect":true },
 *   "G-F7-light":   { "kind":"cast", "spellId":"glimmer", "requireEffect":true },
 *   "G-T5-trust":   { "kind":"bond", "minBand":1 },
 *   "G-T6-evening": { "kind":"time", "blocks":["evening"] },
 *   "G-F4-still":   { "kind":"chain", "steps":[
 *       {"spellId":"ignite","receiverId":"river_stone"},
 *       {"spellId":"temper","onProductOf":0}] },
 *   "G-F8-combine": { "kind":"chain", "steps":[
 *       {"spellId":"ignite","receiverId":"river_stone"},
 *       {"spellId":"fetch","receiverId":"stone_wall","requiresHeld":"item_river_stone"},
 *       {"spellId":"temper","onProductOf":0}] } }
 * ```
 *
 * Types only. The evaluator is Wave 2, Track B. Two things it will owe, stated
 * here so they are not lost: it must refuse to load a rule naming an unauthored
 * spell or receiver (a silently-never-clearing gate is worse than a loud one),
 * and a `chain` matches an ORDERED SUBSEQUENCE over the cast log — unrelated
 * casts in between do not break it.
 */

/** The four authored rule shapes. No fifth kind without a ruling. */
export type GateRuleKind = "cast" | "bond" | "time" | "chain";

/**
 * Which gate vocabulary a mode runs on.
 *
 * `legacy-hedge` is the LOCAL flag in `collectGates.ts`. It clears no real
 * `G-*` id on purpose: F7 also needs `G-F5-cascade`, which nothing in modes 2-3
 * can clear, so wiring those modes to the real gate graph makes F7 permanently
 * stuck. Only Mode 4 uses `authored`.
 */
export type GateSource = "authored" | "legacy-hedge" | "off";

/**
 * Bond bands, coarse only. `WorldState` surfaces the band and never the raw
 * count — see `play.ts`'s `bondBands` guardrail. 0 low · 1 medium · 2 high.
 * The thresholds behind them are resolver tuning (mid_min 6 / high_min 18,
 * ruled 2026-08-17); nothing in this folder reads or duplicates the numbers.
 */
export type BondBand = 0 | 1 | 2;

/**
 * One landed cast clears it. `G-F5-cascade` (ignite) and `G-F7-light` (glimmer).
 */
export interface CastGateRule {
  readonly kind: "cast";
  readonly spellId: string;
  /** Omitted where any authored receiver satisfies it. */
  readonly receiverId?: string;
  /**
   * `true` means a "no-effect" outcome does NOT clear the gate.
   *
   * This is not a judgement about no-effect being a failure — it is not, and it
   * must never render as one. It is that a gate asks whether something
   * physically changed, and an authored "nothing happened" is the answer "no".
   */
  readonly requireEffect: boolean;
}

/** A soul's bond has reached a band. `G-T5-trust` — medium. */
export interface BondGateRule {
  readonly kind: "bond";
  /** Omitted where any soul reaching the band satisfies it. */
  readonly soulId?: string;
  readonly minBand: BondBand;
}

/** The clock reads one of these blocks. `G-T6-evening`. */
export interface TimeGateRule {
  readonly kind: "time";
  /**
   * Time blocks that SATISFY the gate, in ink's own vocabulary.
   *
   * Read from ink and never written back. The field is named `blocks` because
   * that is what the authored table calls a time-of-day slot, not because it
   * blocks anything.
   */
  readonly blocks: readonly string[];
}

/** A chain step cast on a named receiver already in the world. */
export interface ChainStepOnReceiver {
  readonly spellId: string;
  readonly receiverId: string;
  /** An item_id that must be held when this step is cast. */
  readonly requiresHeld?: string;
}

/**
 * A chain step cast on whatever an earlier step PRODUCED — product binding.
 * `onProductOf: 0` means "the thing step 0 made", which is how `temper` finds
 * the stone `ignite` heated rather than any cold stone lying around.
 */
export interface ChainStepOnProduct {
  readonly spellId: string;
  readonly onProductOf: number;
  readonly requiresHeld?: string;
}

export type ChainStep = ChainStepOnReceiver | ChainStepOnProduct;

/**
 * An ordered sequence of casts clears it.
 *
 * `G-F4-still` is the two-step teaching instance; `G-F8-combine` is the
 * three-step test instance. They share verbs on purpose: teach, then test.
 */
export interface ChainGateRule {
  readonly kind: "chain";
  readonly steps: readonly ChainStep[];
}

export type GateRule = CastGateRule | BondGateRule | TimeGateRule | ChainGateRule;

/** `gateRules.json` — gate_id -> rule. */
export type GateRuleTable = Readonly<Record<string, GateRule>>;

/**
 * Why a rule could not be loaded. Reported, never swallowed.
 *
 * `unknown-item` and `malformed-rule` were added in Wave 2 Track B. Both are
 * ADDITIVE — no consumer switches exhaustively on this union — and both cover
 * refusals the loader actually has to make: `requiresHeld` names an item id,
 * and a structurally broken rule (empty `blocks`, empty `steps`, a `minBand`
 * outside 0-2) is a gate that can never clear, which is the exact failure this
 * whole mechanism exists to make loud.
 */
export interface GateRuleDefect {
  readonly gateId: string;
  readonly reason:
    | "unknown-spell"
    | "unknown-receiver"
    | "unknown-gate"
    | "unknown-item"
    | "bad-step-reference"
    | "malformed-rule";
  readonly detail: string;
}
