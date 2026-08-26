/**
 * The spell-preview cue selector.
 *
 * The spellbook's VFX preview must play a spell's REAL authored effect cue, not
 * a hand-drawn approximation. That means going through the exact same path a
 * live cast does — `cueFor(table, event)` — so the pane shows what the game
 * shows and a new spell needs no code here. This module builds the ONE synthetic
 * event that path expects (`cast:resolved`, always the `effect` outcome, aimed
 * at a sentinel `__preview` receiver) and hands back whatever the authored table
 * resolves.
 *
 * WHY IT REUSES THE CUE UNMODIFIED. The cue's `colorKey` is validated against
 * the contrast-checked theme palette, and its weight is paired with a no-effect
 * twin by `cueWeight`/`neutralFor`. Inventing a cue or a colour here would sit
 * outside both of those guarantees. So this never constructs a `VfxCue`; it only
 * selects one.
 *
 * PURE. No Phaser, no scene — it takes the loaded table and returns data, so it
 * is unit-testable in node exactly like the rest of the VFX arithmetic.
 */

import { cueFor, type CueTable } from "../render/vfx/CueTable";
import type { VfxCue } from "../render/vfx/VfxBackend";
import type { LoggedEventOf } from "../world/events/GameEvents";

/**
 * The authored EFFECT cue for `spellId`, or `null` when the table resolves to
 * nothing playable (an empty or broken table falls back to `kind: "none"`).
 *
 * Always the `effect` outcome — a preview shows a spell answering, never the
 * no-effect register.
 */
export function spellPreviewCue(spellId: string, cues: CueTable): VfxCue | null {
  // A real `cast:resolved` payload, minus nothing the matcher reads. `cueFor`
  // only tests the `match` fields (here: spellId + outcome), but the event is
  // built whole so it is a genuine `LoggedEventOf<"cast:resolved">` and not a
  // cast-through-`any`.
  const event: LoggedEventOf<"cast:resolved"> = {
    type: "cast:resolved",
    spellId,
    receiverId: "__preview",
    screenId: null,
    outcome: "effect",
    consumed: [],
    produced: [],
    narration: "",
    seq: 0,
    at: 0,
  };
  const cue = cueFor(cues, event);
  return cue.kind === "none" ? null : cue;
}
