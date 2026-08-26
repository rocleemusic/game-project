/**
 * Which stateful receivers have moved off their authored initial.
 *
 * Same posture as `GatesSlice`: WHAT IS SAVED IS THE ANSWER, NOT THE WORKING.
 * `ReceiverStateStore.snapshot()` already writes only the instances that moved
 * — a save that wrote every default would freeze today's initials into old
 * saves, so re-authoring one later would silently not reach a returning
 * player. This slice adds no logic of its own; it is a thin `SaveSlice` around
 * a store method built for exactly this (mode5 plan step 4).
 *
 * `restore()` drops the store's own `ReceiverDefect[]` return on the floor —
 * `GatesSlice.restore` does the same with `Gates.clear`'s return. A saved
 * state naming a receiver or state this build no longer authors is reported
 * inside the store, once, at load; a live game has no channel to surface it
 * through and must not crash over it.
 */

import { isRecord, type CheckedSaveSlice } from "../CheckedSaveSlice";
import type { JsonValue, SliceRestoreDefect } from "../SaveSlice";

/** The slice of `ReceiverStateStore` this needs. The store satisfies it structurally. */
export interface ReceiverStatesPort {
  snapshot(): Readonly<Record<string, string>>;
  restore(snapshot: Readonly<Record<string, string>>): unknown;
}

export type ReceiverStatesSaveData = Readonly<Record<string, string>>;

export class ReceiverStatesSlice implements CheckedSaveSlice<ReceiverStatesSaveData> {
  readonly id = "receivers" as const;

  constructor(private readonly receiverStates: ReceiverStatesPort) {}

  capture(): ReceiverStatesSaveData {
    return this.receiverStates.snapshot();
  }

  check(data: JsonValue): SliceRestoreDefect | null {
    if (!isRecord(data)) {
      return { sliceId: this.id, reason: "malformed", detail: "payload is not an object" };
    }
    for (const value of Object.values(data)) {
      if (typeof value !== "string") {
        return {
          sliceId: this.id,
          reason: "malformed",
          detail: "every receiver key must map to a state id string",
        };
      }
    }
    return null;
  }

  restore(data: ReceiverStatesSaveData): void {
    this.receiverStates.restore(data);
  }
}
