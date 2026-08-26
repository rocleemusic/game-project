/**
 * The producer for `dialogue:line`.
 *
 * WHY IT EXISTS. `DialogueSystem` listens for `dialogue:line` and nothing in
 * the build ever emitted one, so the whole VN layer rendered an empty box. This
 * is the other half of that seam: it reads `LanternPlayer`'s transcript and
 * emits the lines that are new since the last look.
 *
 * IT ONLY READS. Ink owns the story, the clock and the transcript. This never
 * calls `choose`, `continueOnce` or `setVar` — it is a view of `PlayView.lines`
 * turned into events, which is what keeps the render half unable to move the
 * story by accident.
 *
 * SPEAKER COMES FROM THE `#speaker:` TAG, and a line without one is NARRATION,
 * not a nameless speaker: narration is left-aligned with no plate and no
 * sprite, which is a layout, not a degraded dialogue line.
 *
 * A `player: true` LINE (the picked choice's own text, echoed into the
 * transcript by `LanternPlayer.choose()`) STILL EMITS, carrying
 * `playerEcho: true`. Dropping it would make the backlog read as one side of
 * a conversation — see `tests/DialogueFeed.test.ts`, "still carries the
 * player's own echoed choice". Whether to show it as the CURRENT line is a
 * consumer's call, not this feed's — see `DialogueLineEvent.playerEcho`.
 *
 * IDEMPOTENT BY POSITION. `sync` is safe to call on every view event, including
 * ones where nothing was added — the scene re-renders far more often than the
 * story advances. It tracks how far into `lines` it has read, and a restore
 * (which truncates the transcript) rewinds it rather than replaying a week.
 *
 * SCOPED TO CONVERSATION, as of the mode5 merge (step 2). This used to emit
 * EVERY line unconditionally — which is why Mode 4's VN panel once read "Day
 * 1 begins." and offered "[Begin at Town Square]" as a conversation choice:
 * narration and `move`-adjacent lines are not a conversation, and pushing them
 * through the box was the exact defect the plan's VN scope seam exists to
 * prevent. `emit` is the caller's per-render answer to "am I inside a
 * conversation right now" (`CollectScene.render()`'s `inConversation`); the
 * cursor still advances either way, so a line seen while `emit` is false is
 * consumed, never replayed once a later conversation starts.
 */

import type { PlayView } from "@lantern/lib/play";
import type { DialogueLineEvent, GameEventBus } from "../world/events/GameEvents";

export class DialogueFeed {
  private readonly bus: GameEventBus;
  /** How many transcript lines have already been turned into events. */
  private read = 0;

  constructor(bus: GameEventBus) {
    this.bus = bus;
  }

  /**
   * Walk every line that appeared since the last call, EMITTING only when
   * `emit` is true. Returns how many were actually put on the bus.
   *
   * `emit` defaults to true so every existing caller/test (before conversation
   * scoping existed) is unaffected.
   */
  sync(view: PlayView, emit = true): number {
    // A restore rewinds `lines` (`LanternPlayer.restore` slices it), so a
    // cursor past the end means the story went backwards, not that lines
    // vanished. Replaying from 0 would re-emit the whole week into the log.
    if (view.lines.length < this.read) this.read = view.lines.length;

    const screenId = view.pos.currentScreen ?? null;
    let emitted = 0;
    for (let i = this.read; i < view.lines.length; i++) {
      const line = view.lines[i];
      // Markers are the tool's own annotations ("jumped to ...", "restored to
      // ..."), never authored prose. They belong in a debug log, not a box.
      if (line.marker) continue;
      const text = line.text.trim();
      if (!text) continue;
      if (!emit) continue;
      const speaker = line.tags.speaker ?? null;
      const event: DialogueLineEvent = {
        type: "dialogue:line",
        speaker,
        text,
        kind: speaker ? "dialogue" : "narration",
        screenId,
        playerEcho: Boolean(line.player),
      };
      this.bus.emit(event);
      emitted++;
    }
    this.read = view.lines.length;
    return emitted;
  }

  /** Forget the cursor. The next `sync` re-emits the whole transcript. */
  reset(): void {
    this.read = 0;
  }

  /** How far into the transcript this feed has read. */
  get position(): number {
    return this.read;
  }
}
