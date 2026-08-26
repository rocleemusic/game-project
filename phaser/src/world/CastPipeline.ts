/**
 * THE cast path. One implementation, two callers, no second opinion.
 *
 * Pure — no Phaser, no DOM, no I/O.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS FILE EXISTS
 * ---------------------------------------------------------------------------
 *
 * Cast bookkeeping was written twice, in `CastScene.cast()` and in
 * `CollectScene.hedgeSpellPicker()`, and the two already DISAGREED:
 *
 *                        CastScene              CollectScene hedge
 *   applyCast            effect | no-effect     effect | no-effect
 *   knowledge on effect  learn                  nothing
 *   knowledge no-effect  see                    nothing
 *   gates                real `G-*` ids via     a local boolean, set on ANY
 *                        PROPOSED_SPELL_GATES   landed cast
 *
 * A single implementation would have had to pick a winner, and picking one in
 * code would have silently overruled a ruling. So the disagreement is preserved
 * and moved OUT of the code into a `CastPolicy` the mode descriptor supplies.
 * The pipeline has no branch on mode, on spell id, or on scene.
 *
 * ---------------------------------------------------------------------------
 * THE RULINGS THIS FILE CARRIES (Roc, 2026-08-17)
 * ---------------------------------------------------------------------------
 *
 *  1. `applyCast` runs on "effect" and "no-effect", and on NOTHING else.
 *     `CastLandedOutcome` is that ruling expressed as a type, so the compiler
 *     carries it rather than a comment. A cast that never took costs nothing:
 *     the player is not charged for a typo.
 *
 *  2. Collect-mode casting does NOT teach a spell. If a spell is not already
 *     known it is not offered. Learning happens in `CastScene`, or as a clue
 *     from an NPC. Hence `teachOn: []` on that mode's policy, not an `if`.
 *
 *  3. Collect mode's hedge gate stays LOCAL. It must never clear a real `G-*`
 *     id: F7 also requires `G-F5-cascade`, which nothing in modes 2-3 can clear,
 *     so reusing the real gates would make F7 permanently stuck. Hence
 *     `clearsTableGatesOn: []` for that mode — the local flag is reported back
 *     to the caller and written nowhere else.
 *
 *  4. No-effect is an HONEST RESULT, never a failure. Nothing here treats it as
 *     one, and nothing downstream may render it as one.
 *
 * ORDER IS PART OF THE CONTRACT, pinned by
 * `tests/characterization/CastBookkeeping.test.ts`: resolve, then inventory,
 * then knowledge, then gates, then emit.
 *
 * `consumed` and `produced` are handed to `applyCast` BY REFERENCE, unedited —
 * the characterization suite asserts identity, not just equality, because a
 * pipeline that "helpfully" copies or filters them is a pipeline that could
 * start editing them.
 */

import {
  resolveCast,
  type CastResult,
  type ManaBand,
  type MagicDB,
} from "../magic/CastResolver";
import type { SpellRecord } from "../magic/types";
import type {
  CastLandedOutcome,
  CastRejectedOutcome,
  GameEventBus,
} from "./events/GameEvents";
import type { ReceiverStateStore } from "./receivers/ReceiverStateStore";

// ---------------------------------------------------------------------------
// Ports — the narrow slice of each collaborator the pipeline actually needs
// ---------------------------------------------------------------------------

/**
 * Structural, not nominal, on purpose. `Inventory`, `Knowledge` and `Gates`
 * satisfy these without being told to, a test can pass a spy, and the pipeline
 * cannot quietly grow a dependency on the rest of those classes.
 */
export interface CastInventoryPort {
  applyCast(screen: string | null, consumed: string[], produced: string[]): void;
}

export interface CastKnowledgePort {
  learn(spellId: string): boolean;
  see(spellId: string): void;
}

export interface CastGatePort {
  isCleared(gateId: string): boolean;
  clear(gateId: string): void;
}

// ---------------------------------------------------------------------------
// The policy — where the two paths are allowed to differ
// ---------------------------------------------------------------------------

/**
 * What a landed cast is allowed to write, per mode.
 *
 * Every field is a LIST OF OUTCOMES rather than a boolean, because the two paths
 * differ on *which* landed outcome triggers a write, not merely on whether it
 * happens at all. `clearsLocalGateOn` is the clearest case: the hedge flag is
 * set on any landed cast, effect or no-effect, while the gate table answers only
 * to an effect.
 */
export interface CastPolicy {
  /** Outcomes that put the spell in the spellbook. `["effect"]`, or none. */
  readonly teachOn: readonly CastLandedOutcome[];
  /** Outcomes that record the spell as a clue. `["no-effect"]`, or none. */
  readonly hintOn: readonly CastLandedOutcome[];
  /** Outcomes that may clear real `G-*` gates through the spell->gate table. */
  readonly clearsTableGatesOn: readonly CastLandedOutcome[];
  /** Outcomes that set a mode's LOCAL gate flag. Never a real `G-*` id. */
  readonly clearsLocalGateOn: readonly CastLandedOutcome[];
}

// ---------------------------------------------------------------------------
// Request and report
// ---------------------------------------------------------------------------

export interface CastRequest {
  readonly phrase: string;
  /** item_ids the caster put into the cast. */
  readonly offered: readonly string[];
  readonly receiverId: string;
  /** `null` where a mode has no notion of a current screen. */
  readonly screenId: string | null;
  readonly mana?: ManaBand;
}

export interface CastReport {
  readonly result: CastResult;
  /** "effect" or "no-effect" — the cast HAPPENED. */
  readonly landed: boolean;
  /** Gates this very cast opened. The DELTA, not the running total. */
  readonly clearedNow: string[];
  /** Whether this cast satisfied the mode's local gate flag. */
  readonly localGateCleared: boolean;
  /**
   * The state a stateful receiver moved to, or `null` if nothing moved —
   * no `receiverStateStore` in play, a non-stateful pair, a cast that never
   * landed, or a branch with no authored `becomes`. Mirrors
   * `statefulCast.ts`'s `StatefulCastResult.movedTo`, the reference this
   * pipeline's own state-advance step follows.
   */
  readonly movedTo: string | null;
}

export interface CastPipelineDeps {
  readonly magic: MagicDB;
  readonly inventory: CastInventoryPort;
  readonly knowledge: CastKnowledgePort;
  readonly gates: CastGatePort;
  /**
   * spell_id -> gate ids a landed cast clears. DATA, never `if (spellId ===
   * "ignite")`. `world/spellGates.ts` today; the authored `gateRules.json`
   * table in Wave 2.
   */
  readonly gateTable: Readonly<Record<string, readonly string[]>>;
  readonly policy: CastPolicy;
  /**
   * Optional — a mode with `receiverStates: false` passes none, and this
   * pipeline behaves exactly as it did before that store existed. When
   * present, branch selection runs BEFORE resolution and the selected
   * branch's authored `noEffect` answers the outcome question instead of
   * `readsAsNoEffect`'s anchored regex — see `receivers/statefulCast.ts`'s
   * header for why loosening that regex is not the fix.
   */
  readonly receiverStateStore?: ReceiverStateStore;
  /** Optional so the pipeline is testable with no bus at all. */
  readonly bus?: GameEventBus;
}

/** Narrowing helper, so `outcome` is a `CastLandedOutcome` after the check. */
function landedOutcome(result: CastResult): CastLandedOutcome | null {
  return result.outcome === "effect" || result.outcome === "no-effect" ? result.outcome : null;
}

/**
 * The components a spell would take out of what is currently reachable.
 *
 * `CollectScene`'s hedge picker auto-fills the cast from what you are carrying
 * rather than asking you to restate it. Intersection, not subset-matching: the
 * resolver still demands the set exactly, so an incomplete pocket resolves
 * `wrong-components` — which is the answer, and it costs nothing.
 */
export function componentsFromHeld(spell: SpellRecord, held: readonly string[]): string[] {
  return held.filter((h) => spell.components.includes(h));
}

export class CastPipeline {
  constructor(private readonly deps: CastPipelineDeps) {}

  /**
   * Resolve one cast and apply exactly the bookkeeping the policy allows.
   *
   * resolve -> inventory -> knowledge -> gates -> emit.
   */
  run(request: CastRequest): CastReport {
    const { magic, inventory, knowledge, gates, gateTable, policy, bus, receiverStateStore } =
      this.deps;

    // 1. Select, then resolve. `statefulCast.ts`'s order: the branch a
    //    stateful receiver is in must be chosen BEFORE resolution, because the
    //    combined two-branch string can never be read correctly after the
    //    fact — a mid-string `no_effect` marker is invisible to
    //    `readsAsNoEffect`'s anchored regex. A pair with no branch table (or
    //    no store at all) selects nothing, and resolution falls back to
    //    `physical_outcome` exactly as before.
    const spell = magic.byPhraseText(request.phrase);
    const selection =
      receiverStateStore && spell
        ? receiverStateStore.select(spell.spell_id, request.receiverId, request.screenId)
        : null;
    const result = resolveCast(
      magic,
      request.phrase,
      [...request.offered],
      request.receiverId,
      { mana: request.mana ?? "baseline", branch: selection ? selection.branch : null },
    );
    const landed = landedOutcome(result);

    // 1b. Advance. Only a cast that HAPPENED moves the receiver, and only into
    //     a state the selected branch actually authors a transition to — see
    //     `AuthoredBranch.becomes`. Independent of inventory/knowledge/gates
    //     below, so it does not disturb their pinned order.
    let movedTo: string | null = null;
    if (landed && selection && spell && selection.branch.becomes !== null) {
      const moved = receiverStateStore!.setState(
        request.receiverId,
        request.screenId,
        selection.branch.becomes,
        spell.spell_id,
      );
      if (moved) movedTo = selection.branch.becomes;
    }

    // 2. Inventory. Only a cast that HAPPENED costs anything — and one that
    //    happened and did nothing still costs, because you tried.
    if (landed) {
      inventory.applyCast(request.screenId, result.consumed, result.produced);
    }

    // 3. Knowledge. "You learn them by successfully casting them once" — a cast
    //    that lands and does nothing is a clue, not a confirmation. Which of
    //    those a mode does at all is the policy's call, not this file's.
    if (landed && result.spellId) {
      if (policy.teachOn.includes(landed)) knowledge.learn(result.spellId);
      else if (policy.hintOn.includes(landed)) knowledge.see(result.spellId);
    }

    // 4. Gates. `clearedNow` is the delta the result panel prints, so a re-cast
    //    reports nothing new without un-clearing what is already open.
    let clearedNow: string[] = [];
    if (landed && result.spellId && policy.clearsTableGatesOn.includes(landed)) {
      clearedNow = [...(gateTable[result.spellId] ?? [])].filter((g) => !gates.isCleared(g));
      for (const g of clearedNow) gates.clear(g);
    }
    const localGateCleared = Boolean(landed && policy.clearsLocalGateOn.includes(landed));

    // 5. Emit. One-way: the bus carries facts outward to VFX, dialogue and the
    //    audit. Nothing on the bus feeds back into this method.
    //
    //    `gate:cleared` is deliberately NOT emitted here. That event carries a
    //    `ruleKind` and a `source`, and neither has an honest value while gates
    //    still come from the provisional `spellGates.ts` table. It belongs to
    //    the `GateEngine` in Wave 2 Track B, which owns that vocabulary.
    if (bus) {
      if (landed) {
        bus.emit({
          type: "cast:resolved",
          spellId: result.spellId ?? "",
          receiverId: result.receiverId,
          screenId: request.screenId,
          outcome: landed,
          consumed: result.consumed,
          produced: result.produced,
          narration: result.narration,
        });
      } else {
        bus.emit({
          type: "cast:rejected",
          spellId: result.spellId,
          receiverId: result.receiverId,
          screenId: request.screenId,
          outcome: result.outcome as CastRejectedOutcome,
          missing: result.missing,
          extra: result.extra,
        });
      }
    }

    return { result, landed: Boolean(landed), clearedNow, localGateCleared, movedTo };
  }
}
