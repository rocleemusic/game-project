/**
 * `InkStatePort`, implemented over Lantern's own snapshot pair.
 *
 * THE ONLY APPROVED CHANGE TO `tools/lantern` IS THE PAIR THIS FILE CALLS.
 * `saveSnapshot()` / `loadSnapshot()` were added additively to
 * `tools/lantern/src/lib/play.ts` (Roc, 2026-08-17) because ink save/load was
 * not reachable from outside `LanternPlayer` at all: `story` is private,
 * `view().timeline` returns a copy, and `restore(i)` only indexes snapshots the
 * running session itself made. Lantern is not forked and not restructured;
 * `saveSnapshot` returns the object `choose()` was already building and
 * `loadSnapshot` routes straight through the existing `restore`.
 *
 * WHY THIS LIVES IN `src/world/save` AND NOT IN `src/ink`.
 *
 * The import is TYPE-ONLY (`PlaySnapshot`), so nothing here pulls inkjs, a DOM
 * or Phaser into a pure folder — the same move `Gates.ts` already makes with
 * `@lantern/types`. The host is taken as a structural `LanternSaveHost`, which
 * `LanternPlayer` satisfies without being told to, so the wiring layer hands in
 * the real player and a test hands in four lines of object literal.
 *
 * THE TWO-VOCABULARIES HAZARD IS CLOSED (Roc, 2026-08-23, Task 1 T19).
 * `capture()`/`restore()` still move the satchel/arms/bank through their own
 * pool-name-shaped fields rather than merging them with the host's item ids
 * below — that separation stays, because it is what lets a pre-reconciliation
 * save (`SAVE_VERSION = 1`) be told apart from a current one. What changed is
 * the CONTENT of the strings: `screen-specs.json` authors `item_id`s directly
 * now, so a fresh capture's "pool name" fields hold item ids too. See
 * `SaveGame.ts`'s header for the full statement.
 *
 * INK OWNS THE CLOCK, AND THIS FILE IS WHERE THAT IS EASIEST TO BREAK.
 *
 * `LanternPlayer.setVar` exists, is public, and would appear to work: setting
 * `movesLeft`, `TimeOfDay`, `day` or `year` after a load would make the header read
 * correctly and would put a second writer on a fact ink already owns. It also
 * flips the player's `forced` flag, which is how the test catches it. So:
 *
 *   - `clock()` is a READ and there is no write half on the interface.
 *   - `restore()` hands ink its own serialised state and stops. The clock comes
 *     back inside `storyStateJson`, or it does not come back.
 *   - `InkSaveState` carries NO time block and NO move count, so a restorer has
 *     nothing to assign even if it wanted to. `dayFile` is a FILE SELECTOR —
 *     which day's presence and item rolls to swap in — and Lantern's `restore`
 *     uses it exactly that way.
 */

import type { PlaySnapshot } from "@lantern/lib/play";
import type { InkClock, InkSaveState, InkStatePort } from "./InkStatePort";

/**
 * The three methods this port needs of `LanternPlayer`, and no more.
 *
 * `view()` is declared returning only the clock fields it reads. `PlayView` is a
 * supertype of that, so the real player still fits, and this port cannot start
 * reading the satchel through a back door — the satchel arrives through the
 * snapshot, in pool-name vocabulary, where the save layer can keep it apart from
 * the host's item ids.
 */
export interface LanternSaveHost {
  saveSnapshot(): PlaySnapshot;
  loadSnapshot(snap: PlaySnapshot): void;
  view(): {
    readonly day: number;
    /** T13's year loop. A read of ink's `year` VAR, same as `day` beside it. */
    readonly year: number;
    readonly timeBlock: string;
    readonly movesLeft: number;
  };
}

/**
 * `snap.timeBlock` is ignored by `loadSnapshot`, which re-reads the block out of
 * the ink state it just loaded. Passing the empty string is the honest way to
 * say "this value is not carried by the save" — the alternative, passing a
 * plausible-looking block, would be a clock value travelling in a save file.
 */
const CLOCK_NOT_CARRIED = "";

/**
 * The transcript belongs to the session, not the file. `loadSnapshot` overrides
 * this with the live line count, so the value here is never used; zero states
 * plainly that no transcript was saved.
 */
const TRANSCRIPT_NOT_CARRIED = 0;

export class LanternInkStatePort implements InkStatePort {
  constructor(private readonly host: LanternSaveHost) {}

  /** Read-only, by construction. There is no write half and none may be added. */
  clock(): InkClock {
    const v = this.host.view();
    return { day: v.day, year: v.year, timeBlock: v.timeBlock, movesLeft: v.movesLeft };
  }

  /**
   * Pure read — `saveSnapshot()` builds a value and mutates nothing, so this is
   * safe on an autosave firing mid-play.
   *
   * The satchel, arms and bank come out of Lantern's snapshot and are written
   * to the pool-name-shaped fields untranslated, same as always — they are
   * `item_id`s now that the reconciliation has landed (2026-08-23), so there
   * is no join left to apply here. The fields stay separate from the host's
   * `heldItemIds` regardless, so a version-1 save's pre-reconciliation
   * strings are never silently mixed with post-reconciliation ones.
   */
  capture(): InkSaveState {
    const snap = this.host.saveSnapshot();
    return {
      storyStateJson: snap.stateJson,
      worldJson: snap.world,
      dayFile: snap.day,
      satchelPoolNames: [...snap.satchel],
      armsPoolNames: [...snap.arms],
      bankedPoolNames: [...snap.banked],
      pickedSlots: [...snap.pickedSlots],
      visitedNodeIds: [...snap.visited],
    };
  }

  /** Restore through Lantern's own path. No `setVar`, before, during or after. */
  restore(state: InkSaveState): void {
    this.host.loadSnapshot({
      label: "loaded save",
      stateJson: state.storyStateJson,
      world: state.worldJson,
      day: state.dayFile,
      satchel: [...state.satchelPoolNames],
      arms: [...state.armsPoolNames],
      banked: [...state.bankedPoolNames],
      pickedSlots: [...state.pickedSlots],
      visited: [...state.visitedNodeIds],
      timeBlock: CLOCK_NOT_CARRIED,
      lineCount: TRANSCRIPT_NOT_CARRIED,
    });
  }
}
