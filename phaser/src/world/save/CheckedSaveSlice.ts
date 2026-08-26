/**
 * A `SaveSlice` that can say NO to a payload.
 *
 * `SaveSlice.restore(data: T)` is typed, but a payload read off disk is only
 * `JsonValue` — the file could have been written by an older build, hand-edited,
 * or truncated. Something has to stand between the two, and the choice is
 * either every slice quietly coercing whatever it is handed, or every slice
 * declaring what it accepts.
 *
 * Quiet coercion is the failure this track exists to prevent, so slices declare.
 * `check()` returns the Wave-0 `SliceRestoreDefect` — the type was already there
 * for this, with no interface hanging it off anything — and `SaveCoordinator`
 * collects the defects, skips those slices, and restores the rest. A malformed
 * decor payload must not cost the player their bond.
 */

import type { JsonValue, SaveSlice, SliceRestoreDefect } from "./SaveSlice";

export interface CheckedSaveSlice<T extends JsonValue = JsonValue> extends SaveSlice<T> {
  /**
   * Validate a payload read off disk.
   *
   * Returns `null` when the payload is safe to hand to `restore`, or the defect
   * describing why it is not. A type guard rather than a boolean, so a slice
   * that passes its own check does not then have to cast.
   */
  check(data: JsonValue): SliceRestoreDefect | null;
}

/** Narrow to a plain object without asserting anything about its fields. */
export function isRecord(data: JsonValue): data is { readonly [key: string]: JsonValue } {
  return typeof data === "object" && data !== null && !Array.isArray(data);
}

/** True when `value` is an array of strings, which is most slice payloads. */
export function isStringArray(value: JsonValue | undefined): value is readonly string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}
