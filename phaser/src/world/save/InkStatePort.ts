/**
 * The seam to ink state. The ONLY way saved play reaches or leaves the story.
 *
 * WHY A PORT AND NOT A DIRECT CALL. `LanternPlayer.story` is private,
 * `view().timeline` returns a copy, and `restore(i)` only indexes the
 * in-session timeline — so ink save/load is not reachable from outside the
 * player today. The approved fix is an ADDITIVE `saveSnapshot`/`loadSnapshot`
 * pair on `tools/lantern/src/lib/play.ts` (~15 lines). `tools/lantern` is never
 * forked and never restructured; that pair is the only change approved there.
 *
 * This interface is what the rest of the build codes against, so the decision
 * about how those ~15 lines land stays behind one file.
 *
 * `player.world` is already public with `snapshot()`/`restore()`, so bond and
 * thread state are savable today either way.
 *
 * INK OWNS THE CLOCK. This port exposes a READER for day / year / block / moves
 * and deliberately exposes NO WRITER. `setVar` exists on the player, would
 * appear to work, and is the trap: writing the clock back puts a second writer
 * on a fact ink already owns. The clock is restored as a consequence of
 * restoring ink's own state, never as a separate assignment.
 */

/**
 * Ink's clock, read-only by construction.
 *
 * There is no setter here and none may be added. If restoring a save appears
 * to need one, the ink state was not restored properly — fix that instead.
 */
export interface InkClock {
  readonly day: number;
  /**
   * T13's year loop (2026-08-24 build plan, Phase 2). Read-only like every
   * other field here, and more strictly so: the ONLY thing that ever moves it
   * is ink's own `begin_new_year` knot doing `~ year = year + 1`. The host
   * diverts into that knot; it never assigns the number. A `setVar("year")`
   * anywhere under `src/world/save/**` is the same defect as a `setVar("day")`
   * and the same grep in `tests/SaveLoad.test.ts` catches it.
   */
  readonly year: number;
  readonly timeBlock: string;
  readonly movesLeft: number;
}

/**
 * Everything ink-side that a save has to carry, as opaque strings.
 *
 * They are opaque ON PURPOSE. The host does not parse ink's serialised state
 * and must never start: the moment it reads a field out of `storyStateJson` to
 * "fix up" a value on load, the host is a second writer again.
 */
export interface InkSaveState {
  /** `story.state.ToJson()`, straight through. Never parsed host-side. */
  readonly storyStateJson: string;
  /** `WorldState.snapshot()` — bond bands and thread moves. Also opaque. */
  readonly worldJson: string;
  /**
   * Which day file was loaded when this was captured.
   *
   * Needed because restoring across a day boundary must swap back to the
   * snapshot's own day file rather than re-applying presence from whichever day
   * happens to be current — the same reason `PlaySnapshot` carries `day`. This
   * is a FILE SELECTOR, not a clock write.
   */
  readonly dayFile: number;
  /**
   * Lantern's satchel vocabulary, in pickup order. Named `PoolNames` from
   * before the 2026-08-23 reconciliation (Task 1, T19) — the strings it now
   * carries ARE `item_id`s, `screen-specs.json` authors them directly, and
   * the two-vocabularies hazard `SaveGame`'s header used to describe is
   * closed. The field is not renamed this pass (comment fix, not a schema
   * change — see `SaveGame`'s header), but nothing merges it with the host's
   * `heldItemIds`: they are still separate fields, restored separately,
   * because that is what makes `SAVE_VERSION = 2` mean something for a save
   * written before the reconciliation.
   */
  readonly satchelPoolNames: readonly string[];
  /** Pack-triage arms buffer. Same field, same 2026-08-23 note above. */
  readonly armsPoolNames: readonly string[];
  /** The permanent home bank. Same field, same 2026-08-23 note above. */
  readonly bankedPoolNames: readonly string[];
  /** Slot ids already emptied this day. */
  readonly pickedSlots: readonly string[];
  /**
   * Content ids the session has been through — `PlayPos.visited`.
   *
   * NOT the clock and not a second copy of it: it is "what has been seen",
   * which is the one piece of Lantern's host-side state that neither ink's
   * serialised state nor `WorldState` carries. Without it a reload silently
   * un-visits the week, and `played(X)` style checks read the wrong answer.
   */
  readonly visitedNodeIds: readonly string[];
}

/**
 * The adapter `SaveCoordinator` talks to. Implemented in `src/ink`, because
 * that is where `LanternPlayer` is reachable; declared here, because `world`
 * may not depend on the adapter.
 */
export interface InkStatePort {
  /** Read the clock. There is no write half. */
  clock(): InkClock;
  /** Serialise ink + world state. Pure read. */
  capture(): InkSaveState;
  /**
   * Restore ink + world state through Lantern's own snapshot path.
   *
   * Implementations MUST NOT call `setVar("movesLeft" | "TimeOfDay" | "day")`,
   * before, during or after. The clock arrives with the state or not at all.
   */
  restore(state: InkSaveState): void;
}
