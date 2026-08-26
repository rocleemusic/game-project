/**
 * The Home Hub's placements — and the resolution of the two-writers problem.
 *
 * THE PROBLEM, stated by the plan as Risk 5. `Decor.ts` already owns a
 * localStorage key, `phaser-probe/decor/v1`: it reads it in its constructor and
 * rewrites it on every place / move / flip / resize / remove. If the save file
 * ALSO carried the placements as its own parsed structure, one fact would have
 * two writers, and the loser would be whichever ran last — a load restoring
 * placements into memory while the key on disk still held the pre-load set, or a
 * `Decor` constructed after a load reading the key back over the restored state.
 *
 * THE RESOLUTION: this slice owns THE KEY, not a second copy of the data.
 *
 *   capture   read the key's raw string
 *   restore   write the key's raw string back
 *
 * The string is opaque here. This file does not parse it, does not know what a
 * `Placement` is, and does not know the shape has a `seq` counter in it. `Decor`
 * remains the only code that understands its own format, which is what keeps it
 * the single writer — the save layer moves the bytes and nothing else.
 *
 * ORDERING, which is what makes this correct on a browser reload: restore writes
 * the key BEFORE the hub is constructed, and `new Decor()` then loads it in its
 * constructor exactly as it does on any other launch. There is never a moment
 * when both are writing.
 *
 * `null` is a real value here and means "no decor key at all", which is what a
 * save taken before anything was placed should restore to. Storing it as `null`
 * rather than as `""` is what lets restore REMOVE the key rather than write an
 * empty string that `Decor.load` would then fail to parse.
 */

import { isRecord, type CheckedSaveSlice } from "../CheckedSaveSlice";
import type { SaveStorage } from "../SaveStore";
import type { JsonValue, SliceRestoreDefect } from "../SaveSlice";

/**
 * `Decor.ts`'s own key, restated.
 *
 * A literal rather than an import because `Decor` keeps it private, and
 * `tests/SaveLoad.test.ts` reads `Decor.ts` off disk and asserts this string
 * still appears in it. A drift in that key is then a failing test rather than a
 * save that silently persists nothing.
 */
export const DECOR_STORAGE_KEY = "phaser-probe/decor/v1";

export type DecorSaveData = { readonly raw: string | null };

export class DecorSlice implements CheckedSaveSlice<DecorSaveData> {
  readonly id = "decor" as const;

  constructor(
    private readonly storage: SaveStorage,
    private readonly key: string = DECOR_STORAGE_KEY,
  ) {}

  capture(): DecorSaveData {
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
        detail: "raw must be the decor key's string contents, or null",
      };
    }
    return null;
  }

  restore(data: DecorSaveData): void {
    if (data.raw === null) this.storage.removeItem(this.key);
    else this.storage.setItem(this.key, data.raw);
  }
}
