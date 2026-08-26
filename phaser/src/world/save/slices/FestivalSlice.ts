/**
 * The per-soul talk calendar, moved into and out of a save file.
 *
 * WHY IT HAS TO PERSIST. Bond is "how many days you went and talked to them"
 * (Roc, 2026-08-23) and it is read exactly once, at festival night on day 5.
 * A week that cannot survive a reload therefore cannot be scored at all — the
 * Definition of Done's "save and restore" and its "one week playable to
 * festival night" are the same requirement for this system. The counters live
 * in a slice rather than in `localStorage` beside `PlayerSettings` for the same
 * reason: they are GAME STATE belonging to one life, not a device preference
 * that should outlive it.
 *
 * WHAT IT DOES NOT TOUCH. Not the clock — the day numbers written here are read
 * off ink at the moment of each talk and are never assigned back (`SaveSlice`'s
 * header rule). Not the narrative bond either: `WorldState`'s single weighted
 * count per soul rides inside `ink.storyStateJson`, opaque, and nothing in this
 * file can reach it. See `world/FestivalScore.ts`'s header on why the two are
 * separate facts rather than a second score.
 *
 * Restoring REPLACES rather than merges. An additive restore would double every
 * talk day on a reload-after-autosave, which is exactly the silent kind of
 * failure the save track exists to prevent.
 */

import { isRecord, type CheckedSaveSlice } from "../CheckedSaveSlice";
import type { JsonValue, SliceRestoreDefect } from "../SaveSlice";
import type { FestivalLedger, FestivalLedgerData } from "../../FestivalScore";

/** The part of `FestivalLedger` this needs; the class satisfies it structurally. */
export type FestivalLedgerPort = Pick<FestivalLedger, "capture" | "restore">;

/**
 * A type alias, not an interface — aliases get implicit index signatures and so
 * satisfy `JsonValue`; interfaces do not. Same form as every other slice here.
 */
export type FestivalSaveData = {
  readonly talkDays: { readonly [soulId: string]: readonly number[] };
};

export class FestivalSlice implements CheckedSaveSlice<FestivalSaveData> {
  readonly id = "festival" as const;

  constructor(private readonly ledger: FestivalLedgerPort) {}

  capture(): FestivalSaveData {
    return this.ledger.capture() as FestivalSaveData;
  }

  check(data: JsonValue): SliceRestoreDefect | null {
    if (!isRecord(data)) {
      return { sliceId: this.id, reason: "malformed", detail: "payload is not an object" };
    }
    const talkDays = data.talkDays;
    if (!isRecord(talkDays)) {
      return {
        sliceId: this.id,
        reason: "malformed",
        detail: "talkDays must be an object of soul_id -> day numbers",
      };
    }
    for (const [soulId, days] of Object.entries(talkDays)) {
      if (!Array.isArray(days) || !days.every((d) => typeof d === "number" && Number.isFinite(d))) {
        return {
          sliceId: this.id,
          reason: "malformed",
          detail: `talkDays["${soulId}"] must be an array of day numbers`,
        };
      }
    }
    return null;
  }

  restore(data: FestivalSaveData): void {
    this.ledger.restore(data as FestivalLedgerData);
  }
}
