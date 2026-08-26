/**
 * Satchel / consumed reconciliation. Pure — no Phaser, no DOM, no I/O.
 *
 * WHY THIS EXISTS AS A MODULE. It was a private method on `CollectScene`
 * (`effectiveSatchel`), which meant the one piece of arithmetic standing between
 * two vocabularies could not be tested without a canvas. The characterization
 * suite had to transcribe it by hand to pin it at all
 * (`tests/characterization/SatchelLedger.test.ts`). Extracted verbatim in Wave 1
 * so the transcription can be deleted and the real thing asserted instead.
 *
 * THE TWO-VOCABULARIES HAZARD IS CLOSED (Roc, 2026-08-23, Task 1 T19 —
 * GAPS.md G13). `screen-specs.json` now authors `item_id` strings directly,
 * so both sides below carry the same vocabulary and `itemForPool` is an
 * identity shim:
 *
 *     `PlayView.satchel`   now ITEM IDS  "item_river_stone"  ink/LanternPlayer owns it
 *     `Inventory`          ITEM IDS      "item_river_stone"  the host owns it
 *
 * The re-join below still runs, unchanged — it costs nothing now that it is
 * an identity, and removing it would mean trusting every call site to have
 * been updated in lockstep, which is exactly the kind of silent assumption
 * this file existed to replace with a real, testable function.
 *
 * `v.satchel` is ink's own list and only ever grows within a day — there is no
 * API to remove a single entry from it (Roc bug report, 2026-08-13: casting
 * `ignite` correctly consumed `item_sticks` from `Inventory`, but the visible
 * satchel strip reads `v.satchel` directly, so the spent stick just sat there
 * forever).
 *
 * `Inventory.consumedCountOf` is the real ledger of how many of an item have
 * actually been spent; `effectiveSatchel` hides that many *occurrences of the
 * pool name that produced it* from the display, without ever mutating ink's own
 * array. `clampConsumedCount` corrects the ledger back down when a day reset (or
 * a home-bank) wipes the real satchel out from under it — without that, a stale
 * high consumed count could wrongly hide a freshly-foraged item on a later day.
 *
 * The invariant, stated once: **hidden = min(spent, held)**.
 */

import { itemForPool } from "./foragePoolToItem";

/**
 * The slice of `Inventory` this module needs, and no more.
 *
 * Narrow on purpose: the ledger has no business reaching for `give`, `applyCast`
 * or anything screen-scoped, and a structural type says so in a way a comment
 * cannot. `Inventory` satisfies it without being told to.
 */
export interface ConsumedLedger {
  /** Never raises the count, only lowers it toward what is actually there. */
  clampConsumedCount(id: string, max: number): void;
  consumedCountOf(id: string): number;
}

/** The `give`-half of `Inventory`, for the re-join. */
export interface ItemSink {
  give(id: string): void;
}

/**
 * Ink's satchel, minus the entries the host has genuinely spent.
 *
 * Order-preserving, and a pool name that joins to no item id is passed through
 * rather than dropped: an unjoined pool name is still your stuff, it just cannot
 * be cast with. That is an honest failure mode, not a reason to hide the item.
 *
 * SIDE EFFECT, deliberately: this clamps the ledger down to what the satchel
 * still shows. It is the only place that observation is available, because it is
 * the only place both numbers are in hand at once.
 */
export function effectiveSatchel(ledger: ConsumedLedger, rawSatchel: readonly string[]): string[] {
  return effectiveSatchelSlots(ledger, rawSatchel).filter((pool): pool is string => pool !== null);
}

/**
 * The positional twin of `effectiveSatchel`, added for the satchel drop/move
 * track (2026-08-22): `LanternPlayer.satchel` is now a fixed-length,
 * gap-holding array (one entry per physical pocket, `null` for empty — see
 * that file's header), and `SatchelScene`'s pocket grid needs the hidden
 * (consumed-but-not-yet-cleared) slots to disappear IN PLACE, not compacted
 * away, or a pocket's on-screen position would shift out from under a
 * player mid-move.
 *
 * Same reconciliation, same invariant (hidden = min(spent, held)), same
 * left-to-right hide order — just returning the array at its original
 * length and positions instead of filtering survivors into a new one.
 * `effectiveSatchel` above is now this function with the nulls dropped, so
 * the two can never drift apart.
 */
export function effectiveSatchelSlots(
  ledger: ConsumedLedger,
  rawSatchel: readonly (string | null)[],
): (string | null)[] {
  const occurrences = new Map<string, number>();
  for (const pool of rawSatchel) {
    if (pool !== null) occurrences.set(pool, (occurrences.get(pool) ?? 0) + 1);
  }

  const hiddenRemaining = new Map<string, number>();
  for (const [pool, count] of occurrences) {
    const itemId = itemForPool(pool);
    if (!itemId) continue;
    ledger.clampConsumedCount(itemId, count);
    hiddenRemaining.set(pool, Math.min(ledger.consumedCountOf(itemId), count));
  }

  return rawSatchel.map((pool) => {
    if (pool === null) return null;
    const hidden = hiddenRemaining.get(pool) ?? 0;
    if (hidden > 0) {
      hiddenRemaining.set(pool, hidden - 1);
      return null;
    }
    return pool;
  });
}

/**
 * Pool names -> item ids, in order, dropping only the ones that join to
 * nothing.
 *
 * n pool names map to n item ids where the join exists; nothing is deduped on
 * the way through, because the caller's `give` is what decides held-ness and
 * `discoveredIds` is what the Home Hub decorates from.
 */
export function poolsToItemIds(pools: Iterable<string>): string[] {
  const out: string[] = [];
  for (const pool of pools) {
    const id = itemForPool(pool);
    if (id) out.push(id);
  }
  return out;
}

/**
 * The whole re-join, as one call: hand every joinable pool name to the sink.
 *
 * Idempotent, and run on every render — `give` is a Set add, so a second pass
 * adds nothing.
 */
export function reJoinInto(sink: ItemSink, pools: Iterable<string>): void {
  for (const id of poolsToItemIds(pools)) sink.give(id);
}
