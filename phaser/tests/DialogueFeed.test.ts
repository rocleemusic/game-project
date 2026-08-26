/**
 * `DialogueFeed` — the producer for `dialogue:line`.
 *
 * The system subscribed to this event and nothing in the build ever emitted
 * one, so the VN layer rendered an empty box while every test passed. That is
 * the class of bug this file exists to catch: a seam with two halves and no
 * test that they meet.
 *
 * The four ways it can be wrong and still look right:
 *   REPLAYING — `sync` runs on every view event, and the scene re-renders far
 *     more often than the story advances. A feed without a cursor re-emits the
 *     whole transcript each time.
 *   MARKERS — "jumped to ...", "restored to ..." are the tool's own
 *     annotations, not authored prose, and a box that shows them is lying.
 *   NARRATION — a line with no `#speaker:` tag is narration, which is a layout
 *     (left-aligned, no plate, no sprite), not a nameless speaker.
 *   RESTORE — `LanternPlayer.restore` truncates the transcript. A cursor that
 *     only moves forward would then replay a week's worth of lines.
 */

import { describe, expect, it } from "vitest";
import { DialogueFeed } from "../src/systems/DialogueFeed";
import { GameEventBus } from "../src/world/events/GameEvents";
import type { PlayView } from "@lantern/lib/play";

type Line = PlayView["lines"][number];

function line(text: string, speaker?: string, extra: Partial<Line> = {}): Line {
  return { text, tags: speaker ? { speaker } : {}, ...extra } as Line;
}

/** Only the fields the feed reads. The rest of `PlayView` is not its business. */
function view(lines: Line[], screen: string | null = "T1"): PlayView {
  return { lines, pos: { currentScreen: screen } } as unknown as PlayView;
}

function rig() {
  const bus = new GameEventBus({ now: () => 0 });
  return { bus, feed: new DialogueFeed(bus) };
}

describe("turning ink's transcript into events", () => {
  it("emits one event per authored line, in order", () => {
    const { bus, feed } = rig();
    expect(feed.sync(view([line("One."), line("Two.", "mara")]))).toBe(2);

    const log = bus.logOf("dialogue:line");
    expect(log.map((e) => e.text)).toEqual(["One.", "Two."]);
    expect(log.map((e) => e.seq)).toEqual([1, 2]);
    expect(log[1].screenId).toBe("T1");
  });

  it("calls a line with no speaker tag narration, not a nameless speaker", () => {
    const { bus, feed } = rig();
    feed.sync(view([line("The road is quiet."), line("Hello.", "mara")]));

    const log = bus.logOf("dialogue:line");
    expect(log[0].kind).toBe("narration");
    expect(log[0].speaker).toBeNull();
    expect(log[1].kind).toBe("dialogue");
    expect(log[1].speaker).toBe("mara");
  });

  it("skips the tool's own marker lines", () => {
    const { bus, feed } = rig();
    feed.sync(
      view([line("jumped to day2", undefined, { marker: true }), line("Real prose.")]),
    );
    expect(bus.logOf("dialogue:line").map((e) => e.text)).toEqual(["Real prose."]);
  });

  it("skips whitespace-only lines rather than flashing an empty box", () => {
    const { bus, feed } = rig();
    feed.sync(view([line("   "), line("Real prose.")]));
    expect(bus.logOf("dialogue:line")).toHaveLength(1);
  });

  it("still carries the player's own echoed choice", () => {
    // It is part of the transcript the player is reading back; dropping it
    // would make the backlog read as one side of a conversation.
    const { bus, feed } = rig();
    feed.sync(view([line("I'll go right.", undefined, { player: true })]));
    expect(bus.logOf("dialogue:line")).toHaveLength(1);
  });
});

describe("being called on every render", () => {
  it("emits nothing when nothing was added", () => {
    const { bus, feed } = rig();
    const v = view([line("One."), line("Two.")]);
    expect(feed.sync(v)).toBe(2);
    expect(feed.sync(v)).toBe(0);
    expect(feed.sync(v)).toBe(0);
    expect(bus.logOf("dialogue:line")).toHaveLength(2);
  });

  it("emits only what is new after the story advances", () => {
    const { bus, feed } = rig();
    feed.sync(view([line("One.")]));
    expect(feed.sync(view([line("One."), line("Two."), line("Three.")]))).toBe(2);
    expect(bus.logOf("dialogue:line").map((e) => e.text)).toEqual([
      "One.",
      "Two.",
      "Three.",
    ]);
  });

  it("rewinds when a restore truncates the transcript", () => {
    const { bus, feed } = rig();
    feed.sync(view([line("One."), line("Two."), line("Three.")]));
    expect(feed.position).toBe(3);

    // Restored to before "Two." — the story went backwards.
    expect(feed.sync(view([line("One.")]))).toBe(0);
    expect(feed.position).toBe(1);
    expect(feed.sync(view([line("One."), line("Other.")]))).toBe(1);
    expect(bus.logOf("dialogue:line").map((e) => e.text)).toEqual([
      "One.",
      "Two.",
      "Three.",
      "Other.",
    ]);
  });

  it("replays from the top only when asked to", () => {
    const { bus, feed } = rig();
    const v = view([line("One."), line("Two.")]);
    feed.sync(v);
    feed.reset();
    expect(feed.sync(v)).toBe(2);
    expect(bus.logOf("dialogue:line")).toHaveLength(4);
  });

  it("survives a view with no current screen", () => {
    const { bus, feed } = rig();
    feed.sync(view([line("Before any screen tag.")], null));
    expect(bus.logOf("dialogue:line")[0].screenId).toBeNull();
  });
});
