/**
 * A thin Phaser adapter over Lantern's `LanternPlayer`.
 *
 * It adds exactly two things and nothing else:
 *   1. Events, so scenes react to a view change instead of polling.
 *   2. One funnel (`commit`) so there is a single place that diffs the view.
 *
 * Three contracts, all documented inside play.ts and all easy to break:
 *   - `choose()` only SELECTS. Ink runs the option body — including every
 *     `~ recordBond(...)` — on the next `continueOnce()`. So choose always
 *     does both, and a bare choose is never exposed.
 *   - Never write `movesLeft`, `TimeOfDay` or `day`. Ink's `= hub` weave owns
 *     the clock (world/t1.ink decrements moves itself). The host reads them.
 *   - `allowExternalFunctionFallbacks` stays false inside LanternPlayer, so an
 *     unbound external is a loud error. `errors` is surfaced, never swallowed.
 */

import Phaser from "phaser";
import { LanternPlayer, type PlayView } from "@lantern/lib/play";
import type { Run } from "./loadRun";

export type InkEvent = "view" | "screen" | "time" | "moves" | "error";

/**
 * The knot `beginNewYear()` diverts into — the resolver emits it under exactly
 * this name (`tools/resolver/src/ink.ts`, `=== begin_new_year ===`). Named here
 * so the one string the host knows about ink's addresses is greppable from both
 * sides.
 */
const BEGIN_NEW_YEAR_ADDRESS = "begin_new_year";

export class InkBridge extends Phaser.Events.EventEmitter {
  readonly player: LanternPlayer;
  private last: PlayView;

  constructor(run: Run) {
    super();
    this.player = new LanternPlayer(
      run.storyJson,
      run.index,
      run.days[0] ?? null,
      undefined,
      run.days,
    );
    this.last = this.player.view();
  }

  /**
   * Always read live from the player.
   *
   * This used to return the snapshot cached at the last `commit()`, which
   * silently went stale the moment anything mutated the player outside this
   * bridge — `pickup()` put an item in the satchel and the UI kept rendering an
   * empty one. `last` is now only the diff baseline for events, never a source
   * of truth for callers.
   */
  view(): PlayView {
    return this.player.view();
  }

  /** Current `#screen:` value, or null before the first tagged line. */
  screen(): string | null {
    return this.view().pos.currentScreen;
  }

  /**
   * Re-diff after something mutated the player directly (a pickup, a
   * pack-triage). Emits the same events a choice would.
   */
  refresh(): void {
    this.commit();
  }

  advance(): void {
    if (this.player.view().canContinue) this.player.continueOnce();
    this.commit();
  }

  /** Select an option AND run its body. See contract 1. */
  choose(index: number): void {
    this.player.choose(index);
    if (this.player.view().canContinue) this.player.continueOnce();
    this.commit();
  }

  /** Run until the story needs the player — a choice, or the end. */
  runToChoice(limit = 200): void {
    let n = 0;
    while (this.player.view().canContinue && n++ < limit) {
      this.player.continueOnce();
    }
    this.commit();
  }

  /**
   * Roll the life into its next year — T13's one host divert.
   *
   * `begin_new_year` (`tools/resolver/src/ink.ts`, `emitMain`) is authored
   * HOST-DIVERT-ONLY: nothing in the story diverts to it and no choice ever
   * offers it, which is what keeps it invisible to `walk.ts` and the whole
   * week-walk suite. `final_screen` reaches `-> END`, and `ChoosePathString`
   * resets the callstack, so jumping in from a parked story is legal — Phase 0
   * of the build plan spiked exactly this before anything was built on it.
   *
   * THE HOST ONLY DIVERTS. It does not set `year`, `day`, `TimeOfDay` or
   * `movesLeft` here or anywhere — the knot does `~ year = year + 1` and
   * `~ day = 1` itself and falls through to `day_start`, which already owns the
   * block and the move budget. That is contract 2 in this file's header, and
   * this method is the place it would be easiest to break.
   *
   * Returns false when the address is not in the story (an out-of-date
   * `story.json`), having pushed the reason onto `view().errors` — the caller
   * gets a live view either way, because `runToChoice`/`commit` still run.
   *
   * NO SAVE IS WRITTEN HERE. The year boundary reaches disk through the mode's
   * ordinary autosave, on the first `screen:changed` of the new year — see
   * `CollectScene`'s `onContinue` wiring.
   */
  beginNewYear(): boolean {
    const jumped = this.player.jumpToAddress(BEGIN_NEW_YEAR_ADDRESS);
    // Runs even on a failed jump: the error has to reach the view, and the
    // story is still wherever it was, so a redraw is correct rather than stale.
    this.runToChoice();
    return jumped;
  }

  /** Take the "move" choice leading to `screenName`, if one is offered. */
  goTo(screenName: string): boolean {
    const choice = this.player
      .view()
      .choices.find((c) => c.kind === "move" && c.text.includes(screenName));
    if (!choice) return false;
    this.choose(choice.index);
    return true;
  }

  private commit(): void {
    const next = this.player.view();
    const prev = this.last;
    this.last = next;

    if (next.pos.currentScreen !== prev.pos.currentScreen) {
      this.emit("screen", next.pos.currentScreen);
    }
    if (next.timeBlock !== prev.timeBlock) this.emit("time", next.timeBlock);
    if (next.movesLeft !== prev.movesLeft) this.emit("moves", next.movesLeft);
    if (next.errors.length > prev.errors.length) {
      this.emit("error", next.errors[next.errors.length - 1]);
    }
    this.emit("view", next);
  }
}
