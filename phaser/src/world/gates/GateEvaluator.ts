/**
 * Does an authored gate rule hold, given the world so far?
 *
 * PURE. No Phaser, no DOM, no I/O, no state. Every function here takes the
 * ordered event log plus a read-only mirror of ink's facts and returns an
 * answer. Nothing in this file clears a gate, emits an event or remembers
 * anything between calls — that is `GateEngine`'s job, and keeping the two
 * apart is what makes the matcher testable against a hand-written log.
 *
 * ---------------------------------------------------------------------------
 * THE FOUR SHAPES, AND WHERE EACH ANSWER COMES FROM
 * ---------------------------------------------------------------------------
 *
 *   cast   -> the ordered cast log
 *   chain  -> the ordered cast log, with product binding
 *   bond   -> `GateWorldFacts.bondBands`, which is `WorldState`'s BAND, never a
 *             raw count. The thresholds (mid_min 6 / high_min 18, ruled
 *             2026-08-17) are resolver tuning; nothing here reads or duplicates
 *             them, so re-tuning is not a code change in this folder.
 *   time   -> `GateWorldFacts.timeBlock`, a READ-ONLY MIRROR of ink's own
 *             `TimeOfDay`. INK OWNS THE CLOCK. There is no writer anywhere in
 *             this folder and none may be added: `setVar` exists on the player,
 *             would appear to work, and is the trap.
 *
 * ---------------------------------------------------------------------------
 * ORDERED SUBSEQUENCE, NOT CONSECUTIVE RUN
 * ---------------------------------------------------------------------------
 *
 * A chain matches an ordered SUBSEQUENCE of the cast log. Unrelated casts in
 * between do not break it — a player who ignites the stone, wanders off to
 * scratch the dog, and comes back to temper it has still walked the chain. Only
 * the relative order of the matching casts matters.
 *
 * The search BACKTRACKS rather than matching greedily left-to-right. Greedy is
 * correct for a plain subsequence, but product binding makes step N depend on
 * WHICH cast satisfied step K: the earliest `ignite` may have hit a receiver
 * that the later `temper` never touches, while a second `ignite` further down
 * the log would complete the chain. Greedy would report the gate unclear and
 * the player would have done everything right. So candidates are tried in order
 * and abandoned on failure, under a visit budget so a long session cannot turn
 * a gate refresh into a hang.
 *
 * ---------------------------------------------------------------------------
 * WHAT "PRODUCT" MEANS — and what is deliberately NOT inferred
 * ---------------------------------------------------------------------------
 *
 * `onProductOf: 0` is documented on `ChainStepOnProduct` as "the thing step 0
 * made ... how `temper` finds the stone `ignite` heated rather than any cold
 * stone lying around." Two different things can be "the thing step 0 made":
 *
 *   a) the SAME receiver, now in a changed state — the heated river stone is
 *      still `river_stone`; and
 *   b) an item step 0 MINTED — `ignite` produces `item_flame`.
 *
 * Receiver ids (`river_stone`) and item ids (`item_river_stone`) are two
 * different vocabularies that do not join by themselves (GAPS G13). Rather than
 * invent that join, a step's binding set is simply `{receiverId} ∪ produced`,
 * and a later `onProductOf` step matches if it aimed at ANY member. Both
 * readings are covered, nothing is guessed, and if the content later authors a
 * real item->receiver join it slots in here as data without changing callers.
 *
 * ---------------------------------------------------------------------------
 * ONE READING THAT IS NOT YET A RULING — flagged, not buried
 * ---------------------------------------------------------------------------
 *
 * `CastGateRule` carries an explicit `requireEffect`. `ChainStep` carries no
 * such field, so the behaviour has to be a stated default rather than data.
 * This file requires `outcome === "effect"` for a chain step, because a chain
 * describes a physical sequence: an `ignite` that landed and authored "nothing
 * happened" did not heat the stone, so the `temper` that follows has no heat to
 * find. No-effect is still an HONEST RESULT and must never render as a failure
 * — it simply is not the answer "yes, something changed", which is the only
 * question a chain step asks.
 *
 * If Roc rules otherwise, the fix is a `requireEffect` field on `ChainStep` and
 * one line here — not a branch on a spell id.
 */

import type { LoggedEventOf, LoggedGameEvent } from "../events/GameEvents";
import type {
  BondGateRule,
  CastGateRule,
  ChainGateRule,
  ChainStep,
  GateRule,
  GateRuleKind,
  TimeGateRule,
} from "./GateRule";
import type { BondBand } from "./GateRule";

/** One entry of the cast log, as the bus stores it. */
export type CastLogEntry = LoggedEventOf<"cast:resolved">;

/**
 * See the header. A chain step counts only when the cast physically changed
 * something. Stated once, as a named constant, so the reading is greppable.
 */
const CHAIN_STEP_REQUIRES_EFFECT = true;

/**
 * Upper bound on candidate casts visited while matching ONE chain.
 *
 * The authored chains are two and three steps over a log of tens of casts, so
 * this is never approached in play. It exists because backtracking is
 * exponential in the worst case and a gate refresh runs on every cast — an
 * unbounded search would turn a long session into a stall, and a stall in the
 * gate layer looks exactly like a gate that will not clear.
 */
const CHAIN_SEARCH_BUDGET = 20_000;

/**
 * The ink-side facts a gate can ask about. A READ-ONLY MIRROR, captured at the
 * moment of evaluation. Nothing in this folder writes any of it.
 */
export interface GateWorldFacts {
  /** ink's own `TimeOfDay` — "morning" | "afternoon" | "evening" | "night". */
  readonly timeBlock: string;
  /** soul_id -> band. `WorldState` surfaces the band and never the raw count. */
  readonly bondBands: Readonly<Record<string, BondBand>>;
}

/** Everything an evaluation reads. */
export interface GateContext {
  /** The bus's ordered log, oldest first. Read, never mutated. */
  readonly log: readonly LoggedGameEvent[];
  readonly facts: GateWorldFacts;
}

/**
 * The answer, plus enough detail to drive a progress readout.
 *
 * `progress` and `stepCount` exist so a chain can be shown as partially walked
 * — the `craft:started` / `craft:abandoned` events on the bus want exactly this
 * — without a second matcher being written to produce it.
 */
export interface GateEvaluation {
  readonly gateId: string;
  readonly ruleKind: GateRuleKind;
  readonly satisfied: boolean;
  /** Steps matched. For non-chain rules: 0 or 1. */
  readonly progress: number;
  /** Total steps. For non-chain rules: 1. */
  readonly stepCount: number;
  /** `seq` of each matching cast, in order. Empty for bond and time rules. */
  readonly matchedSeqs: readonly number[];
}

// ---------------------------------------------------------------------------
// Log readers
// ---------------------------------------------------------------------------

function isCast(e: LoggedGameEvent): e is CastLogEntry {
  return e.type === "cast:resolved";
}

/** The ordered cast log. Order is the whole contract — never sort this. */
export function castsFrom(log: readonly LoggedGameEvent[]): readonly CastLogEntry[] {
  return log.filter(isCast);
}

/**
 * Was `itemId` in the caster's hands at the moment the event at `seq` fired?
 *
 * Reconstructed from the log rather than from a live inventory, because a chain
 * is a HISTORICAL question: "did you have the stone when you cast fetch", asked
 * possibly days later, when the stone is long gone. Asking the current
 * inventory would answer a different question and answer it wrongly.
 *
 * Two sources of truth are summed: the explicit `item:acquired`/`item:consumed`
 * events, and the `produced`/`consumed` arrays a landed cast carries. Today
 * `CastPipeline` emits exactly one of those per pickup — it emits
 * `cast:resolved` with the arrays and does NOT also emit per-item events for
 * the same cast — so nothing double-counts. If that ever changes, this is the
 * function that has to learn about it, and the test below it is the alarm.
 *
 * The cast being asked about is a special case: if it CONSUMED the item, the
 * item was self-evidently held, and that holds even if the acquisition never
 * made it onto the log (a granted starting inventory, say).
 */
export function heldAt(
  log: readonly LoggedGameEvent[],
  seq: number,
  itemId: string,
): boolean {
  let count = 0;
  for (const e of log) {
    if (e.seq > seq) break;
    if (e.seq === seq) {
      if (isCast(e) && e.consumed.includes(itemId)) return true;
      continue;
    }
    if (e.type === "item:acquired") {
      if (e.itemId === itemId) count += 1;
    } else if (e.type === "item:consumed") {
      if (e.itemId === itemId) count -= 1;
    } else if (isCast(e)) {
      for (const p of e.produced) if (p === itemId) count += 1;
      for (const c of e.consumed) if (c === itemId) count -= 1;
    }
  }
  return count > 0;
}

// ---------------------------------------------------------------------------
// The four matchers
// ---------------------------------------------------------------------------

/**
 * `requireEffect: true` means an authored "nothing happened" does NOT clear it.
 *
 * That is not a judgement about no-effect being a failure. It is not one, and
 * it must never render as one. It is that a gate asks whether something
 * physically changed, and an authored "nothing happened" is the answer "no".
 */
function castSatisfies(rule: CastGateRule, cast: CastLogEntry): boolean {
  if (cast.spellId !== rule.spellId) return false;
  if (rule.receiverId !== undefined && cast.receiverId !== rule.receiverId) return false;
  if (rule.requireEffect && cast.outcome !== "effect") return false;
  return true;
}

/** The FIRST cast that satisfies the rule, or `null`. Order preserved. */
export function matchCastRule(
  rule: CastGateRule,
  casts: readonly CastLogEntry[],
): CastLogEntry | null {
  for (const cast of casts) if (castSatisfies(rule, cast)) return cast;
  return null;
}

/**
 * `soulId` omitted means ANY soul reaching the band satisfies it — which is
 * what `G-T5-trust` ("a neighbour trusts you enough to let you in") authors.
 */
export function matchBondRule(rule: BondGateRule, facts: GateWorldFacts): boolean {
  if (rule.soulId !== undefined) {
    const band = facts.bondBands[rule.soulId];
    return band !== undefined && band >= rule.minBand;
  }
  return Object.values(facts.bondBands).some((band) => band >= rule.minBand);
}

/**
 * `blocks` lists the time-of-day slots that SATISFY the gate. The field is
 * named for what the authored table calls a slot, not because it blocks
 * anything — see the note on `TimeGateRule`.
 *
 * This is the one gate kind whose answer can go from true back to FALSE: the
 * tavern is open in the evening and shut in the morning. `GateEngine` is the
 * place that decides whether a gate, once cleared, stays cleared.
 */
export function matchTimeRule(rule: TimeGateRule, facts: GateWorldFacts): boolean {
  return rule.blocks.includes(facts.timeBlock);
}

/**
 * `{receiverId} ∪ produced` — see the header on what "product" means.
 *
 * `cast.produced` is the RECEIVER-AWARE product, not the spell default: it is
 * the `result.produced` the pipeline logged, which `CastResolver.resolveCast`
 * computes as `receiver.produces ?? spell.produces` (option A, Roc 2026-08-19).
 * So a later `onProductOf` step binds to what THIS receiver minted — `ignite ×
 * river_stone` binds `item_heated_stone`, not the spell's default `item_flame`.
 * Nothing here re-derives the product from the spell record, which is exactly
 * why the chain matches; deriving it from `spell.produces[0]` would bind the
 * default and the heated-stone chain would never close.
 */
function bindingOf(cast: CastLogEntry): ReadonlySet<string> {
  return new Set<string>([cast.receiverId, ...cast.produced]);
}

function stepMatches(
  step: ChainStep,
  cast: CastLogEntry,
  bindings: readonly ReadonlySet<string>[],
  log: readonly LoggedGameEvent[],
): boolean {
  if (CHAIN_STEP_REQUIRES_EFFECT && cast.outcome !== "effect") return false;
  if (cast.spellId !== step.spellId) return false;
  if ("receiverId" in step) {
    if (cast.receiverId !== step.receiverId) return false;
  } else {
    const bound = bindings[step.onProductOf];
    if (!bound || !bound.has(cast.receiverId)) return false;
  }
  if (step.requiresHeld !== undefined && !heldAt(log, cast.seq, step.requiresHeld)) {
    return false;
  }
  return true;
}

/** How far a chain got, and the casts that got it there. */
export interface ChainMatch {
  readonly complete: boolean;
  /** Furthest step index reached across the whole search, 0-based count. */
  readonly progress: number;
  /** `seq` of each matched cast when `complete`; the best partial otherwise. */
  readonly matchedSeqs: readonly number[];
}

/**
 * Ordered-subsequence match with product binding and backtracking.
 *
 * Returns the FIRST complete match found, which is the earliest by candidate
 * order — so a chain clears at the moment it was actually completed, not at
 * whichever later re-walk the search happened to find first.
 */
export function matchChainRule(
  rule: ChainGateRule,
  casts: readonly CastLogEntry[],
  log: readonly LoggedGameEvent[],
): ChainMatch {
  const steps = rule.steps;
  if (steps.length === 0) return { complete: false, progress: 0, matchedSeqs: [] };

  const bindings: ReadonlySet<string>[] = [];
  const chosen: number[] = [];
  let best: number[] = [];
  let deepest = 0;
  let visited = 0;

  const walk = (stepIdx: number, from: number): boolean => {
    if (stepIdx >= steps.length) return true;
    const step = steps[stepIdx];
    for (let i = from; i < casts.length; i += 1) {
      if (visited >= CHAIN_SEARCH_BUDGET) return false;
      visited += 1;
      const cast = casts[i];
      if (!stepMatches(step, cast, bindings, log)) continue;
      bindings[stepIdx] = bindingOf(cast);
      chosen[stepIdx] = cast.seq;
      if (stepIdx + 1 > deepest) {
        deepest = stepIdx + 1;
        best = chosen.slice(0, stepIdx + 1);
      }
      if (walk(stepIdx + 1, i + 1)) return true;
      bindings.length = stepIdx;
      chosen.length = stepIdx;
    }
    return false;
  };

  const complete = walk(0, 0);
  return {
    complete,
    progress: complete ? steps.length : deepest,
    matchedSeqs: complete ? chosen.slice() : best,
  };
}

// ---------------------------------------------------------------------------
// The one entry point
// ---------------------------------------------------------------------------

/**
 * Evaluate one rule. Exhaustive over `GateRuleKind` by switch, so a fifth kind
 * added to the union fails to compile here rather than silently never clearing.
 */
export function evaluateRule(
  gateId: string,
  rule: GateRule,
  ctx: GateContext,
): GateEvaluation {
  switch (rule.kind) {
    case "cast": {
      const hit = matchCastRule(rule, castsFrom(ctx.log));
      return {
        gateId,
        ruleKind: "cast",
        satisfied: hit !== null,
        progress: hit ? 1 : 0,
        stepCount: 1,
        matchedSeqs: hit ? [hit.seq] : [],
      };
    }
    case "bond": {
      const ok = matchBondRule(rule, ctx.facts);
      return {
        gateId,
        ruleKind: "bond",
        satisfied: ok,
        progress: ok ? 1 : 0,
        stepCount: 1,
        matchedSeqs: [],
      };
    }
    case "time": {
      const ok = matchTimeRule(rule, ctx.facts);
      return {
        gateId,
        ruleKind: "time",
        satisfied: ok,
        progress: ok ? 1 : 0,
        stepCount: 1,
        matchedSeqs: [],
      };
    }
    case "chain": {
      const match = matchChainRule(rule, castsFrom(ctx.log), ctx.log);
      return {
        gateId,
        ruleKind: "chain",
        satisfied: match.complete,
        progress: match.progress,
        stepCount: rule.steps.length,
        matchedSeqs: match.matchedSeqs,
      };
    }
  }
}
