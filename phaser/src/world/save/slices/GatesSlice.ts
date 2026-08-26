/**
 * Which gates are open.
 *
 * WHAT IS SAVED IS THE ANSWER, NOT THE WORKING. A cleared gate is stored as its
 * id, and restore re-clears those ids. The save does not store the cast log, the
 * chain progress or the bond that opened them, and it must not: re-deriving gate
 * state on load would mean re-running `GateEngine` against a restored world and
 * hoping it reached the same conclusion. Where it did not — a chain whose
 * product has since been spent, a `time` gate whose block has passed — the
 * player would lose a gate they had already opened. The fact is host-owned and
 * the save owns it directly.
 *
 * `clear()` is idempotent (`Gates.cleared` is a Set), so restoring onto a
 * session that already cleared something is a no-op rather than a double-count.
 *
 * WHAT THIS SLICE DOES NOT DO: it never clears a real `G-*` id on behalf of a
 * mode running `legacy-hedge`. It writes back exactly what the mode's own gate
 * state held at capture, and modes 2-3 hold their hedge flag in
 * `collectGates.ts`, locally, where the save layer cannot reach it and does not
 * try to. Reusing the authored ids there would leave F7 permanently stuck,
 * because nothing in those modes can clear `G-F5-cascade`.
 */

import { isRecord, isStringArray, type CheckedSaveSlice } from "../CheckedSaveSlice";
import type { JsonValue, SliceRestoreDefect } from "../SaveSlice";

/** The slice of `Gates` this needs. `Gates` satisfies it structurally. */
export interface GatesPort {
  clearedGates(): string[];
  clear(gateId: string): void;
}

export type GatesSaveData = { readonly cleared: readonly string[] };

export class GatesSlice implements CheckedSaveSlice<GatesSaveData> {
  readonly id = "gates" as const;

  constructor(private readonly gates: GatesPort) {}

  capture(): GatesSaveData {
    return { cleared: this.gates.clearedGates() };
  }

  check(data: JsonValue): SliceRestoreDefect | null {
    if (!isRecord(data)) {
      return { sliceId: this.id, reason: "malformed", detail: "payload is not an object" };
    }
    if (!isStringArray(data.cleared)) {
      return {
        sliceId: this.id,
        reason: "malformed",
        detail: "cleared must be an array of gate ids",
      };
    }
    return null;
  }

  restore(data: GatesSaveData): void {
    for (const gateId of data.cleared) this.gates.clear(gateId);
  }
}
