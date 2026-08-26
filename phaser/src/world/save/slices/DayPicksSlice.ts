/**
 * The per-day pick history, moved into and out of a save file.
 *
 * Same posture as `DecorSlice`: this slice owns THE KEY, not a second copy of
 * the data. `DayPicks.ts` already writes `phaser-probe/day-picks/v1` and is the
 * only code that understands its format; if the save carried the picks as its
 * own parsed structure, one fact would have two writers and the loser would be
 * whichever ran last. So capture reads the key's raw string and restore writes
 * it back — the bytes move, nothing is parsed here.
 *
 * ORDERING mirrors `DecorSlice`: restore writes the key, and the next
 * `new DayPicks()` (built by `LocationSelectScene` on entry) reads it in its
 * constructor exactly as on any launch. There is never a moment when both write.
 *
 * `null` is a real value and means "no picks yet" — a save taken before any day
 * was started. Restoring it REMOVES the key rather than writing `""`, which
 * `DayPicks.load` would treat as empty (harmless here, but the same discipline
 * `DecorSlice` keeps, so an empty save cleans up rather than leaving a stale key).
 */

import { isRecord, type CheckedSaveSlice } from "../CheckedSaveSlice";
import type { SaveStorage } from "../SaveStore";
import type { JsonValue, SliceRestoreDefect } from "../SaveSlice";
import { DAY_PICKS_STORAGE_KEY } from "../../DayPicks";

export type DayPicksSaveData = { readonly raw: string | null };

export class DayPicksSlice implements CheckedSaveSlice<DayPicksSaveData> {
  readonly id = "dayPicks" as const;

  constructor(
    private readonly storage: SaveStorage,
    private readonly key: string = DAY_PICKS_STORAGE_KEY,
  ) {}

  capture(): DayPicksSaveData {
    return { raw: this.storage.getItem(this.key) };
  }

  check(data: JsonValue): SliceRestoreDefect | null {
    if (!isRecord(data)) {
      return { sliceId: this.id, reason: "malformed", detail: "payload is not an object" };
    }
    if (!(data.raw === null || typeof data.raw === "string")) {
      return {
        sliceId: this.id,
        reason: "malformed",
        detail: "raw must be the day-picks key's string contents, or null",
      };
    }
    return null;
  }

  restore(data: DayPicksSaveData): void {
    if (data.raw === null) this.storage.removeItem(this.key);
    else this.storage.setItem(this.key, data.raw);
  }
}
