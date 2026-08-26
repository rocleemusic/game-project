/**
 * Branch selection, wired to resolution, in the one order that is correct.
 *
 * Pure — no Phaser, no DOM, no I/O.
 *
 *     select the branch  ->  resolve the cast  ->  advance the state
 *
 * That order IS the fix. `readsAsNoEffect` is anchored `/^no (physical
 * )?effect\b/i`, and the marker in a stateful outcome lives mid-string
 * ("...already cold, no_effect — there is no heat to set"), so testing the
 * combined string can never see it: `temper x forge_billet` resolved as an
 * EFFECT whatever state the billet was in, minting `produces`, teaching the
 * spell and standing eligible to clear a gate off a cast the content says did
 * nothing. Loosening the regex would not fix it either — it would pull the hot
 * branch of the same string into no-effect alongside the cold one.
 *
 * So the branch is chosen from receiver state BEFORE resolution and handed in
 * as `CastContext.branch`, whose `noEffect` is authored data. The resolver then
 * reads the branch and never the combined string.
 *
 * WHY THE TRANSITION RUNS LAST. The player is told what the receiver did in the
 * state it was IN, not the state it ended in — and a cast that never took
 * (wrong components, unknown phrase) moves nothing, because you are not charged
 * for a typo.
 *
 * This file is deliberately a free function and not a method on the pipeline.
 * `CastPipeline` belongs to the extraction and is another track's file; when it
 * adopts receiver state the change there is to pass `ctx.branch`, and this is
 * the reference for what to pass.
 */

import {
  resolveCast,
  type CastContext,
  type CastResult,
  type MagicDB,
} from "../../magic/CastResolver";
import type { BranchSelection } from "./ReceiverState";
import type { ReceiverStateStore } from "./ReceiverStateStore";

export interface StatefulCastRequest {
  readonly phrase: string;
  /** item_ids the caster put into the cast. */
  readonly offered: readonly string[];
  readonly receiverId: string;
  /** `null` where a mode has no notion of a current screen. */
  readonly screenId?: string | null;
  readonly mana?: CastContext["mana"];
  readonly present?: readonly string[];
}

export interface StatefulCastResult {
  readonly result: CastResult;
  /**
   * The branch that was rendered, or `null` for a pair with no branch table —
   * which is the normal case for 71 of the 89 authored pairs.
   */
  readonly selection: BranchSelection | null;
  /** The state the receiver moved to, or `null` if it did not move. */
  readonly movedTo: string | null;
}

/**
 * Resolve one cast against the receiver's current state.
 *
 * Behaves exactly like `resolveCast` for every pair that is not stateful, so it
 * is a safe substitution rather than a second cast path.
 */
export function castWithReceiverState(
  db: MagicDB,
  store: ReceiverStateStore,
  request: StatefulCastRequest,
): StatefulCastResult {
  const screenId = request.screenId ?? null;
  const spell = db.byPhraseText(request.phrase);

  // 1. SELECT. Needs the spell id, which is why the phrase is resolved first;
  //    an unknown phrase selects nothing and changes nothing.
  const selection = spell ? store.select(spell.spell_id, request.receiverId, screenId) : null;

  // 2. RESOLVE, reading the selected branch instead of the combined string.
  const result = resolveCast(db, request.phrase, [...request.offered], request.receiverId, {
    mana: request.mana ?? "baseline",
    present: request.present ? [...request.present] : undefined,
    branch: selection ? selection.branch : null,
  });

  // 3. ADVANCE — and only for a cast that HAPPENED. "effect" and "no-effect",
  //    and nothing else (Roc, 2026-08-17).
  const landed = result.outcome === "effect" || result.outcome === "no-effect";
  let movedTo: string | null = null;
  if (landed && selection && spell && selection.branch.becomes !== null) {
    const moved = store.setState(
      request.receiverId,
      screenId,
      selection.branch.becomes,
      spell.spell_id,
    );
    if (moved) movedTo = selection.branch.becomes;
  }

  return { result, selection, movedTo };
}
