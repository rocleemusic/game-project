/**
 * Which festival endings this life has reached, cumulative across its years.
 *
 * WHY IT HAS TO PERSIST. The year-rollover screen (T13 Phase 5) tells the
 * player "…and reached X of N endings", and the whole point of that number is
 * that it grows ACROSS years: a life that ended Quiet in year 1 and Warm in
 * year 2 has reached two of the three. Nothing else in the build remembers a
 * tier — `world/FestivalScore.ts` recomputes the CURRENT week's tier from live
 * state every time it is asked, on purpose (its header: "there is deliberately
 * no compute-the-score-once-and-freeze-it step"), and that answer is gone the
 * moment `begin_new_year` resets the week it was computed from. So the only
 * cumulative record is this one, and a record that cannot survive a reload
 * would make the counter silently wrong on every resumed life.
 *
 * IT RIDES `slices`, NOT A NEW TOP-LEVEL `SaveGame` FIELD — the schema's own
 * rule (`SaveGame`'s header: "a new system adds a slice rather than a schema
 * field"), and the ruling restates it for this exact counter.
 *
 * ---------------------------------------------------------------------------
 * WHY THIS SLICE OWNS ITS DATA, WHEN THE OTHERS DO NOT
 * ---------------------------------------------------------------------------
 *
 * Every other slice here wraps a system that already existed and already owned
 * the fact: `KnowledgeSlice` wraps `Knowledge`, `FestivalSlice` wraps
 * `FestivalLedger`, `DecorSlice` takes over a key `Decor` was already writing.
 * There is no such system for "tiers reached" — nothing but the rollover reads
 * it, and nothing but the rollover writes it. A `world/DiscoveryLog.ts` holding
 * one `Set<string>` and two delegating methods would be a wrapper around a Set,
 * added only so this file could wrap the wrapper. So the Set lives here, and if
 * a second reader ever appears the extraction is mechanical.
 *
 * WHAT IT DOES NOT TOUCH. Not the clock, not ink — `record()` is called by the
 * host when the story is already parked at `final_screen`; it reads a tier that
 * `FestivalScore` computed and writes nothing back into the story. The
 * no-`setVar` sweep over `src/world/save/**` (`tests/SaveLoad.test.ts`) holds
 * trivially.
 *
 * RESTORING REPLACES rather than merges — the same rule, for the same reason,
 * as `FestivalSlice`: this slice is constructed fresh per life in
 * `CollectScene.init()`, and a merging restore would let one life's endings
 * leak into the next one resumed in the same page load.
 */

import { isRecord, isStringArray, type CheckedSaveSlice } from "../CheckedSaveSlice";
import type { JsonValue, SliceRestoreDefect } from "../SaveSlice";
import { FESTIVAL_TIERS, type FestivalTier } from "../../FestivalScore";

/**
 * A type alias, not an interface — aliases get implicit index signatures and so
 * satisfy `JsonValue`; interfaces do not. Same form as every other slice here.
 */
export type DiscoverySaveData = {
  /** A subset of `FESTIVAL_TIERS`, sorted, never duplicated. */
  readonly tiersReached: readonly string[];
};

export class DiscoverySlice implements CheckedSaveSlice<DiscoverySaveData> {
  readonly id = "discovery" as const;

  /**
   * A Set, so recording the same tier twice is structurally free rather than a
   * guard someone can forget — the host records on EVERY render of the final
   * screen (see `CollectScene.render`), which is many times per visit.
   */
  private readonly reached = new Set<string>();

  /**
   * The player reached `tier` on a festival night. Returns true only the first
   * time that tier is ever reached in this life, so a caller can fire a
   * one-shot beat without keeping a second copy of the same fact.
   *
   * A tier the vocabulary does not know is REFUSED rather than stored: it could
   * only come from a caller passing something that is not a `FestivalTier`, and
   * a phantom entry would inflate the endings counter permanently.
   */
  record(tier: FestivalTier | string): boolean {
    if (!(FESTIVAL_TIERS as readonly string[]).includes(tier)) return false;
    if (this.reached.has(tier)) return false;
    this.reached.add(tier);
    return true;
  }

  /** Every ending reached so far, sorted. The rollover's numerator. */
  tiersReached(): string[] {
    return [...this.reached].sort();
  }

  capture(): DiscoverySaveData {
    return { tiersReached: this.tiersReached() };
  }

  check(data: JsonValue): SliceRestoreDefect | null {
    if (!isRecord(data)) {
      return { sliceId: this.id, reason: "malformed", detail: "payload is not an object" };
    }
    if (!isStringArray(data.tiersReached)) {
      return {
        sliceId: this.id,
        reason: "malformed",
        detail: "tiersReached must be an array of festival tier names",
      };
    }
    // An UNKNOWN TIER IS NOT MALFORMED. A save written by a build with a fourth
    // tier is still a readable save; `restore` drops what it does not know
    // (below) rather than refusing the whole payload and losing the tiers it
    // does understand.
    return null;
  }

  restore(data: DiscoverySaveData): void {
    this.reached.clear();
    for (const tier of data.tiersReached) this.record(tier);
  }
}
