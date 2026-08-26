/**
 * `DialogueSystem` — the half of the VN layer that is a state machine.
 *
 * WHY THIS FILE EXISTS. The geometry beside it had 28 tests and this class had
 * none, because it drew straight onto Phaser objects and could not be built
 * without a canvas. Everything that can actually go wrong in front of a player
 * lives here, not in the arithmetic:
 *
 *   THE NAMEPLATE SHOWS A NAME, not the raw `soul_id` the event carries.
 *   A PENDING CHOICE BLOCKS ADVANCE — the box stays visible under the pills by
 *     design, which makes it a live click target sitting on the choice.
 *   A LABEL STAYS INSIDE ITS OWN PILL when it wraps to two or three lines.
 *   A BURST OF LINES IS READABLE — `runToChoice()` hands over every line
 *     between two choices at once, and a box that took only the newest would
 *     eat the rest silently.
 *   NOTHING LEAKS — `npm run walk` watches display-object count, so the fake
 *     counts every object the system asks for and the tally has to reach zero.
 *
 * No Phaser here: the system talks to a `DialogueRenderPort`, and
 * `FakeDialogueRenderPort` is the same seam `FakeVfxBackend` gives the VFX
 * track next door.
 */

import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DialogueSystem, type DialogueChoice } from "../src/systems/DialogueSystem";
import {
  FakeDialogueRenderPort,
  fakeDialogueLiveObjects,
  resetFakeDialogueRegistry,
} from "../src/systems/FakeDialogueRenderPort";
import { GameEventBus } from "../src/world/events/GameEvents";
import { COLOR, FONT } from "../src/ui/theme";
import {
  backlogLayout,
  bodyTextLayout,
  dialogueBoxRect,
  rectBottom,
  VN_METRICS,
  type ViewSize,
} from "../src/world/view/DialogueLayout";

const VIEW: ViewSize = { width: 1920, height: 1080 };

interface Rig {
  port: FakeDialogueRenderPort;
  bus: GameEventBus;
  dialogue: DialogueSystem;
  advances: number[];
  controls: string[];
  picks: number[];
}

function rig(
  options: Partial<ConstructorParameters<typeof DialogueSystem>[2]> = {},
  textures: Record<string, { width: number; height: number }> = {},
): Rig {
  const port = new FakeDialogueRenderPort({ ...VIEW, textures });
  const bus = new GameEventBus({ now: () => 0 });
  const advances: number[] = [];
  const controls: string[] = [];
  const picks: number[] = [];
  const dialogue = new DialogueSystem(port, bus, {
    onAdvance: () => advances.push(1),
    onControl: (id) => controls.push(id),
    ...options,
  });
  return { port, bus, dialogue, advances, controls, picks };
}

function choices(...texts: string[]): DialogueChoice[] {
  return texts.map((text) => ({ text }));
}

/** Every colour the system drew, as raw values, for the no-new-colours check. */
function coloursUsed(port: FakeDialogueRenderPort): (string | number)[] {
  const out: (string | number)[] = [];
  for (const shapes of port.shapes.values()) {
    for (const s of shapes) out.push(s.style.fillColor, s.style.strokeColor);
  }
  for (const spec of port.texts.values()) if (spec) out.push(spec.color);
  return out;
}

beforeEach(() => resetFakeDialogueRegistry());

describe("narration vs dialogue", () => {
  it("gives a spoken line a nameplate and centres it", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "Hello there.", kind: "dialogue" });

    expect(port.textOf("name")).toBe("Mara");
    expect(port.shapesIn("nameplate")).toHaveLength(1);
    expect(port.specOf("body")?.align).toBe("center");
    expect(port.specOf("body")?.originX).toBe(0.5);
  });

  it("gives narration no plate, no sprite, and left alignment", () => {
    const { port, dialogue } = rig(
      { spriteKeyFor: () => "portrait:mara" },
      { "portrait:mara": { width: 800, height: 1400 } },
    );
    dialogue.showLine({ speaker: null, text: "The road is quiet.", kind: "narration" });

    expect(port.textOf("name")).toBeNull();
    expect(port.shapesIn("nameplate")).toEqual([]);
    expect(port.image).toBeNull();
    expect(port.specOf("body")?.align).toBe("left");
    expect(port.specOf("body")?.originX).toBe(0);
  });

  it("suppresses the plate for a line tagged narration even with a speaker", () => {
    // `kind` is the ruling, not `speaker != null` — a description attributed in
    // the source is still a description.
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "She looks away.", kind: "narration" });
    expect(port.textOf("name")).toBeNull();
  });
});

describe("the body block reaches the renderer where the layout put it", () => {
  const box = dialogueBoxRect(VIEW);

  it("draws a one-line message centred on the box's anchor, not at its top", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });

    const spec = port.specOf("body")!;
    const layout = bodyTextLayout(VIEW, box, "dialogue", 1);
    expect(spec.originY).toBe(0);
    expect(spec.y).toBeCloseTo(layout.y, 5);
    // The failure this pins: `box.y + padY`, which is the top of the panel.
    expect(spec.y).toBeGreaterThan(box.y + VIEW.height * 0.05);
    const centre = spec.y + layout.blockHeight / 2;
    expect((centre - box.y) / box.h).toBeCloseTo(0.38, 2);
  });

  it("re-anchors when a page holds more lines than the one before it", () => {
    // Paging changes the block height, so a y computed once for the line — or
    // for the box — leaves the second page hanging off the first page's anchor.
    const { port, dialogue } = rig();
    const long = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    dialogue.showLine({ speaker: null, text: long, kind: "narration" });
    const firstPage = port.specOf("body")!;

    while (dialogue.hasMorePages) dialogue.advance();
    const lastPage = port.specOf("body")!;
    const firstLines = firstPage.text.split("\n").length;
    const lastLines = lastPage.text.split("\n").length;

    expect(firstLines).toBeGreaterThan(lastLines);
    expect(firstPage.y).toBeLessThan(lastPage.y);
    expect(lastPage.y).toBeCloseTo(
      bodyTextLayout(VIEW, box, "narration", lastLines).y,
      5,
    );
  });
});

describe("the nameplate reads as a name", () => {
  it("title-cases a soul id rather than printing it raw", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "old_wren", text: "Mm.", kind: "dialogue" });
    expect(port.textOf("name")).toBe("Old Wren");
    expect(port.textOf("name")).not.toBe("old_wren");
  });

  it("defers to an injected cast index when one is given", () => {
    const { port, dialogue } = rig({ displayNameFor: () => "Eleanor" });
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    expect(port.textOf("name")).toBe("Eleanor");
  });

  it("shrinks an absurd name into its plate instead of overflowing it", () => {
    const { port, dialogue } = rig({
      displayNameFor: () => "Narrator Of The Long Forest Road And Everything Past It",
    });
    dialogue.showLine({ speaker: "x", text: "Hello.", kind: "dialogue" });
    const plate = port.shapesIn("nameplate")[0];
    const spec = port.specOf("name")!;
    expect(spec.scale!).toBeLessThan(1);
    expect(plate.rect.w).toBeLessThanOrEqual(dialogueBoxRect(VIEW).w);
  });
});

describe("choice pills", () => {
  it("shows one pill above the box", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "Which way?", kind: "narration" });
    dialogue.showChoices(choices("Go right"), () => {});

    expect(port.shapesIn("choices")).toHaveLength(1);
    expect(port.textOf("choice:0")).toBe("Go right");
    expect(rectBottom(port.shapesIn("choices")[0].rect)).toBeLessThanOrEqual(
      dialogueBoxRect(VIEW).y,
    );
  });

  it("keeps the box and its line visible underneath five pills", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "Well?", kind: "dialogue" });
    dialogue.showChoices(choices("a", "b", "c", "d", "e"), () => {});

    expect(port.shapesIn("choices")).toHaveLength(5);
    expect(port.shapesIn("box")).toHaveLength(1);
    expect(port.textOf("body")).toBe("Well?");
  });

  it("keeps every label inside its own pill, however long the text", () => {
    // The exact failure the fixed-height pill produced: authored move text
    // wraps to two or three lines and spills through the rounded top and bottom.
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "Where to?", kind: "narration" });
    dialogue.showChoices(
      choices(
        "Go right",
        "Go to the long forest road and look for the rare bird everyone keeps talking about, even though it is late",
      ),
      () => {},
    );

    const pills = port.shapesIn("choices");
    expect(pills).toHaveLength(2);
    pills.forEach((pill, i) => {
      const spec = port.specOf(`choice:${i}`)!;
      const lines = port.wrapText(
        spec.text,
        spec.fontPx,
        FONT.display,
        spec.wrapWidth ?? pill.rect.w,
      );
      expect(lines.length * spec.fontPx).toBeLessThanOrEqual(pill.rect.h);
    });
    // The long one earned a taller pill rather than being clipped by a fixed one.
    expect(pills[1].rect.h).toBeGreaterThan(pills[0].rect.h);
  });

  it("shows a blocked move dimmed, never as an error", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices([{ text: "Go north", enabled: false }], () => {});

    expect(port.specOf("choice:0")?.color).toBe(COLOR.muted);
    expect(port.specOf("choice:0")?.color).not.toBe(COLOR.danger);
    expect(port.hitsIn("choices")[0].cursor).toBe(false);
  });

  it("does not fire onPick for a blocked move", () => {
    const picked: number[] = [];
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices([{ text: "Go north", enabled: false }], (i) => picked.push(i));
    port.clickHit("choices", 0);
    expect(picked).toEqual([]);
    expect(dialogue.pick(0)).toBe(false);
  });

  it("lifts the hovered pill and puts it back on pointer-out", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices(choices("a", "b"), () => {});

    expect(port.shapesIn("choices")[1].style.fillColor).toBe(COLOR.panel);
    port.hoverHit("choices", 1);
    expect(port.shapesIn("choices")[1].style.fillColor).toBe(COLOR.panelHover);
    expect(port.shapesIn("choices")[1].style.strokeColor).toBe(COLOR.emberNum);
    port.unhoverHit("choices", 1);
    expect(port.shapesIn("choices")[1].style.fillColor).toBe(COLOR.panel);
  });

  it("keeps a panel under the pills even when no line was ever shown", () => {
    // The reference's whole point is that the prompting line reads UNDER the
    // choices. Pills floating over the backdrop with nothing beneath them is an
    // arrangement none of the four captures shows, and it is what an empty box
    // produced: `drawBox` hid the panel whenever there were no pages.
    const { port, dialogue } = rig();
    expect(port.shapesIn("box")).toEqual([]);

    dialogue.showChoices(choices("Go right", "Go left"), () => {});
    expect(port.shapesIn("choices")).toHaveLength(2);
    expect(port.shapesIn("box")).toHaveLength(1);

    dialogue.clearChoices();
    expect(port.shapesIn("box")).toEqual([]);
  });

  it("drops stale labels when a shorter set replaces a longer one", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices(choices("a", "b", "c", "d"), () => {});
    dialogue.showChoices(choices("only"), () => {});

    expect(port.textOf("choice:0")).toBe("only");
    for (const id of ["choice:1", "choice:2", "choice:3"]) {
      expect(port.textOf(id)).toBeNull();
    }
    expect(port.shapesIn("choices")).toHaveLength(1);
  });
});

describe("advancing", () => {
  it("does not walk past a pending choice when the box is clicked", () => {
    // The box stays visible under the pills on purpose, which puts a live
    // advance target directly under the player's eye.
    const { port, dialogue, advances } = rig();
    dialogue.showLine({ speaker: "mara", text: "Well?", kind: "dialogue" });
    dialogue.showChoices(choices("a", "b"), () => {});

    port.clickHit("box", 0);
    expect(advances).toEqual([]);
    expect(dialogue.advance()).toBe(false);
    expect(advances).toEqual([]);
  });

  it("advances when nothing is pending", () => {
    const { port, dialogue, advances } = rig();
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    port.clickHit("box", 0);
    expect(advances).toHaveLength(1);
  });

  it("pages a long line instead of truncating it, then reports it is done", () => {
    const { dialogue, advances } = rig();
    const long = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    dialogue.showLine({ speaker: null, text: long, kind: "narration" });

    expect(dialogue.hasMorePages).toBe(true);
    let steps = 0;
    while (dialogue.hasMorePages && steps < 50) {
      expect(dialogue.advance()).toBe(true);
      steps++;
    }
    expect(steps).toBeGreaterThan(0);
    expect(advances).toEqual([]);
    expect(dialogue.advance()).toBe(false);
    expect(advances).toHaveLength(1);
  });

  it("shows a caret only while there is more to read", () => {
    const { port, dialogue } = rig();
    const long = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    dialogue.showLine({ speaker: null, text: long, kind: "narration" });
    expect(port.textOf("caret")).not.toBeNull();
    expect(port.specOf("caret")?.color).toBe(COLOR.gold);

    while (dialogue.hasMore) dialogue.advance();
    expect(port.textOf("caret")).toBeNull();
  });

  it("hides the caret once choices are up", () => {
    const { port, dialogue } = rig();
    const long = Array.from({ length: 60 }, (_, i) => `word${i}`).join(" ");
    dialogue.showLine({ speaker: null, text: long, kind: "narration" });
    while (dialogue.hasMore) dialogue.advance();
    dialogue.showChoices(choices("a"), () => {});
    expect(port.textOf("caret")).toBeNull();
  });
});

describe("a burst of lines from one runToChoice", () => {
  const burst = [
    { speaker: "mara", text: "One.", kind: "dialogue" as const },
    { speaker: null, text: "Two.", kind: "narration" as const },
    { speaker: "toby", text: "Three.", kind: "dialogue" as const },
  ];

  it("shows them one at a time rather than only the last", () => {
    const { port, bus, dialogue } = rig();
    for (const line of burst) bus.emit({ type: "dialogue:line", screenId: "T1", ...line });

    expect(port.textOf("body")).toBe("One.");
    expect(dialogue.queuedLines).toBe(2);
    dialogue.advance();
    expect(port.textOf("body")).toBe("Two.");
    expect(port.textOf("name")).toBeNull();
    dialogue.advance();
    expect(port.textOf("body")).toBe("Three.");
    expect(port.textOf("name")).toBe("Toby");
    expect(dialogue.queuedLines).toBe(0);
  });

  it("holds the choices back until the last line is on screen", () => {
    const { port, bus, dialogue } = rig();
    for (const line of burst) bus.emit({ type: "dialogue:line", screenId: "T1", ...line });
    dialogue.showChoices(choices("a", "b"), () => {});

    expect(port.shapesIn("choices")).toEqual([]);
    dialogue.advance();
    expect(port.shapesIn("choices")).toEqual([]);
    dialogue.advance();
    expect(port.shapesIn("choices")).toHaveLength(2);
  });
});

describe("the keyboard", () => {
  it("advances on Space and on Enter", () => {
    const { port, dialogue, advances } = rig();
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });
    port.pressKey("SPACE");
    port.pressKey("ENTER");
    expect(advances).toHaveLength(2);
  });

  it("takes a choice by number key", () => {
    const picked: number[] = [];
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices(choices("a", "b", "c"), (i) => picked.push(i));
    port.pressKey("TWO");
    expect(picked).toEqual([1]);
  });

  it("walks the stack with Up/Down and confirms with Enter", () => {
    const picked: number[] = [];
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices(choices("a", "b", "c"), (i) => picked.push(i));

    port.pressKey("DOWN");
    expect(dialogue.highlightedChoice).toBe(0);
    port.pressKey("DOWN");
    expect(dialogue.highlightedChoice).toBe(1);
    port.pressKey("UP");
    expect(dialogue.highlightedChoice).toBe(0);
    port.pressKey("ENTER");
    expect(picked).toEqual([0]);
  });

  it("skips blocked moves while walking the stack", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices(
      [{ text: "a" }, { text: "b", enabled: false }, { text: "c" }],
      () => {},
    );
    port.pressKey("DOWN");
    port.pressKey("DOWN");
    expect(dialogue.highlightedChoice).toBe(2);
  });

  it("never advances on Enter while choices are up", () => {
    const { port, dialogue, advances } = rig();
    dialogue.showLine({ speaker: null, text: "?", kind: "narration" });
    dialogue.showChoices([{ text: "a", enabled: false }], () => {});
    port.pressKey("ENTER");
    expect(advances).toEqual([]);
  });
});

describe("the control bar", () => {
  it("stays away until there is a conversation, and leaves with it", () => {
    // Roc, 2026-08-23: the VN buttons should not be visible all the time.
    // Outside a conversation the layer has nothing to auto-advance, skip or
    // log, and five live hit rects over the level are five ways to misclick.
    const { port, dialogue } = rig();
    expect(port.shapesIn("controls")).toEqual([]);
    expect(port.textOf("control:3")).toBeNull();

    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });
    expect(port.shapesIn("controls")).toHaveLength(5);
    expect(port.textOf("control:3")).toBe("Hide UI");

    dialogue.clear();
    expect(port.shapesIn("controls")).toEqual([]);
    expect(port.visibleTextIds()).toEqual([]);
  });

  it("comes up for choices with no line under them, and hides no hit rects", () => {
    // The box's own gate is `pages OR choices`; the bar has to match it or a
    // dead `Log` button outlives the conversation that owned it.
    const { port, dialogue } = rig();
    dialogue.showChoices(choices("a"), () => {});
    expect(port.shapesIn("controls")).toHaveLength(5);
    dialogue.clearChoices();
    expect(port.shapesIn("controls")).toEqual([]);
    expect(port.hitsIn("controls")).toEqual([]);
  });

  it("repaints its own pill on hover, like a choice pill does", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });
    expect(port.shapesIn("controls")[0].style.fillColor).toBe(COLOR.night);
    port.hoverHit("controls", 0);
    expect(port.shapesIn("controls")[0].style.fillColor).toBe(COLOR.panelHover);
    expect(port.specOf("control:0")?.color).toBe(COLOR.ember);
    port.unhoverHit("controls", 0);
    expect(port.shapesIn("controls")[0].style.fillColor).toBe(COLOR.night);
  });

  it("Hide UI clears everything but the bar, and Esc brings it back", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    dialogue.showChoices(choices("a"), () => {});

    port.clickHit("controls", 3);
    expect(dialogue.uiIsHidden).toBe(true);
    expect(port.shapesIn("box")).toEqual([]);
    expect(port.shapesIn("nameplate")).toEqual([]);
    expect(port.shapesIn("choices")).toEqual([]);
    expect(port.shapesIn("controls")).toHaveLength(5);
    expect(port.visibleTextIds().every((id) => id.startsWith("control:"))).toBe(true);

    port.pressKey("ESC");
    expect(dialogue.uiIsHidden).toBe(false);
    // Restored from state, so narration would not have got a plate back.
    expect(port.textOf("body")).toBe("Hello.");
    expect(port.textOf("name")).toBe("Mara");
    expect(port.shapesIn("choices")).toHaveLength(1);
  });

  it("Log opens the bus's own ordered backlog", () => {
    const { port, bus, dialogue } = rig();
    bus.emit({ type: "dialogue:line", speaker: "mara", text: "One.", kind: "dialogue", screenId: null });
    bus.emit({ type: "dialogue:line", speaker: null, text: "Two.", kind: "narration", screenId: null });

    port.clickHit("controls", 2);
    expect(dialogue.backlogIsOpen).toBe(true);
    const text = port.textOf("backlog") ?? "";
    expect(text).toContain("Mara: One.");
    expect(text).toContain("Two.");

    port.clickHit("controls", 2);
    expect(dialogue.backlogIsOpen).toBe(false);
    expect(port.textOf("backlog")).toBeNull();
  });

  it("the backlog covers the box instead of drawing through it", () => {
    // It is a modal panel. With the box still drawn underneath, the current
    // line rendered on top of the transcript and both were unreadable.
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    dialogue.showChoices(choices("a"), () => {});

    dialogue.setBacklogOpen(true);
    expect(port.shapesIn("box")).toEqual([]);
    expect(port.shapesIn("nameplate")).toEqual([]);
    expect(port.shapesIn("choices")).toEqual([]);
    expect(port.textOf("body")).toBeNull();
    // The bar stays, because the same button has to close what it opened.
    expect(port.shapesIn("controls")).toHaveLength(5);

    dialogue.setBacklogOpen(false);
    expect(port.textOf("body")).toBe("Hello.");
    expect(port.textOf("name")).toBe("Mara");
    expect(port.shapesIn("choices")).toHaveLength(1);
  });

  it("keeps the backlog inside its own panel", () => {
    const { port, bus, dialogue } = rig();
    for (let i = 0; i < 200; i++) {
      bus.emit({ type: "dialogue:line", speaker: null, text: `Line ${i}.`, kind: "narration", screenId: null });
    }
    dialogue.setBacklogOpen(true);
    const panel = port.shapesIn("backlog")[0].rect;
    const spec = port.specOf("backlog")!;
    const lines = spec.text.split("\n").length;
    // The same line box the layout budgets with — see `VN_METRICS.lineBoxOfFont`.
    const height = lines * spec.fontPx * 1.18 + (lines - 1) * (spec.lineSpacing ?? 0);
    expect(spec.y + height).toBeLessThanOrEqual(panel.y + panel.h);
  });

  it("reads only the tail of the transcript, not the whole session", () => {
    // `GameEventBus` is append-only and uncapped. Wrapping every entry to show
    // twenty lines made `Log`, `Hide UI` and `relayout` each cost a pass over
    // the entire walk — the one cost in this track that grows with play time.
    class CountingPort extends FakeDialogueRenderPort {
      wraps = 0;
      override wrapText(
        text: string,
        fontPx: number,
        fontFamily: string,
        wrapWidth: number,
      ): readonly string[] {
        this.wraps++;
        return super.wrapText(text, fontPx, fontFamily, wrapWidth);
      }
    }
    const port = new CountingPort(VIEW);
    const bus = new GameEventBus({ now: () => 0 });
    const dialogue = new DialogueSystem(port, bus, { listen: false });
    for (let i = 0; i < 800; i++) {
      bus.emit({ type: "dialogue:line", speaker: null, text: `Line ${i}.`, kind: "narration", screenId: null });
    }

    port.wraps = 0;
    dialogue.setBacklogOpen(true);
    const budget = backlogLayout(VIEW).maxLines;
    expect(port.wraps).toBeLessThanOrEqual(budget + 1);
    expect(port.wraps).toBeLessThan(800);

    // And it is still the NEWEST lines that survive.
    const shown = port.textOf("backlog") ?? "";
    expect(shown).toContain("Line 799.");
    expect(shown).not.toContain("Line 0.");
    expect(shown.split("\n").length).toBeLessThanOrEqual(budget);
    dialogue.destroy();
  });

  it("does not advance the story while the backlog is open", () => {
    const { port, dialogue, advances } = rig();
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });
    port.clickHit("controls", 2);
    port.clickHit("box", 0);
    port.pressKey("SPACE");
    expect(advances).toEqual([]);
    expect(dialogue.backlogIsOpen).toBe(false);
  });

  it("Auto advances on its own clock, and Skip runs faster", () => {
    const { port, dialogue, advances } = rig({ autoIntervalMs: 1000, skipIntervalMs: 100 });
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });

    port.clickHit("controls", 0);
    expect(dialogue.autoIsOn).toBe(true);
    port.advance(3000);
    expect(advances).toHaveLength(3);

    port.clickHit("controls", 1);
    expect(dialogue.autoIsOn).toBe(false);
    expect(dialogue.skipIsOn).toBe(true);
    port.advance(1000);
    expect(advances).toHaveLength(13);
  });

  it("auto stops dead at a choice rather than answering it", () => {
    const { port, dialogue, advances } = rig({ autoIntervalMs: 100 });
    dialogue.showLine({ speaker: null, text: "Well?", kind: "narration" });
    dialogue.showChoices(choices("a", "b"), () => {});
    port.clickHit("controls", 0);
    port.advance(5000);
    expect(advances).toEqual([]);
    expect(port.shapesIn("choices")).toHaveLength(2);
  });

  it("reports every press, including the ones it handles itself", () => {
    const { port, dialogue, controls } = rig();
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });
    for (let i = 0; i < 5; i++) port.clickHit("controls", i);
    expect(controls).toEqual(["auto", "skip", "log", "hide-ui", "options"]);
  });
});

describe("the sprite", () => {
  it("stands the speaking soul behind the box, capped short of full view height", () => {
    // Roc, 2026-08-17: `spriteTopPadOfView` leaves headroom above the figure
    // so the backdrop still reads at the top of the screen — see
    // `DialogueLayout.test.ts`'s own version of this assertion.
    const { port, dialogue } = rig(
      { spriteKeyFor: () => "portrait:mara" },
      { "portrait:mara": { width: 800, height: 1400 } },
    );
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    expect(port.image?.key).toBe("portrait:mara");
    expect(1400 * port.image!.placement.scale).toBeCloseTo(
      VIEW.height * (1 - VN_METRICS.spriteTopPadOfView),
      5,
    );
  });

  it("clamps a landscape source by width instead of letting it span the screen", () => {
    const { port, dialogue } = rig(
      { spriteKeyFor: () => "wide" },
      { wide: { width: 2000, height: 1333 } },
    );
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    expect(2000 * port.image!.placement.scale).toBeLessThanOrEqual(VIEW.width);
  });

  it("shows no sprite at all when the texture is missing", () => {
    // 102 of 121 placements have no authored art. That is a screen with no
    // sprite, not a broken-image frame.
    const { port, dialogue } = rig({ spriteKeyFor: () => "portrait:nobody" });
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    expect(port.image).toBeNull();
    expect(port.textOf("body")).toBe("Hello.");
  });
});

describe("relayout", () => {
  it("recomputes the box for a new view rather than keeping the first one", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    const before = port.shapesIn("box")[0].rect;

    dialogue.relayout({ width: 1280, height: 720 });
    const after = port.shapesIn("box")[0].rect;
    expect(after.w).toBeCloseTo(dialogueBoxRect({ width: 1280, height: 720 }).w, 5);
    expect(after.w).not.toBeCloseTo(before.w, 1);
    expect(port.textOf("body")).toBe("Hello.");
    expect(port.textOf("name")).toBe("Mara");
  });
});

describe("teardown", () => {
  it("releases everything, and says so in the object count", () => {
    const { port, bus, dialogue } = rig();
    dialogue.showLine({ speaker: "mara", text: "Hello.", kind: "dialogue" });
    dialogue.showChoices(choices("a", "b", "c"), () => {});
    expect(fakeDialogueLiveObjects()).toBeGreaterThan(0);

    dialogue.destroy();
    expect(fakeDialogueLiveObjects()).toBe(0);
    expect(port.attached).toBe(false);
    // The bus subscription went with it — a live one would draw into a dead
    // canvas after the scene shut down.
    bus.emit({ type: "dialogue:line", speaker: "toby", text: "Still here?", kind: "dialogue", screenId: null });
    expect(port.textOf("body")).toBeNull();
  });

  it("is safe to destroy twice", () => {
    const { port, dialogue } = rig();
    dialogue.destroy();
    dialogue.destroy();
    expect(port.detachCalls).toBe(1);
    expect(fakeDialogueLiveObjects()).toBe(0);
  });

  it("does not grow its object count across a long run of lines", () => {
    const { bus, dialogue } = rig();
    bus.emit({ type: "dialogue:line", speaker: "mara", text: "One.", kind: "dialogue", screenId: null });
    dialogue.showChoices(choices("a", "b"), () => {});
    const settled = fakeDialogueLiveObjects();

    for (let i = 0; i < 200; i++) {
      dialogue.showLine({ speaker: "mara", text: `Line ${i}.`, kind: "dialogue" });
      dialogue.showChoices(choices("a", "b"), () => {});
    }
    expect(fakeDialogueLiveObjects()).toBe(settled);
    dialogue.destroy();
  });

  it("stops its timers on destroy", () => {
    const { port, dialogue, advances } = rig({ autoIntervalMs: 100 });
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });
    dialogue.setAuto(true);
    dialogue.destroy();
    port.advance(10_000);
    expect(advances).toEqual([]);
  });
});

describe("the theme", () => {
  it("draws with COLOR members only", () => {
    // `theme.ts` is contrast-checked as a SET. A raw hex here would read fine
    // and silently break that audit, so the palette is asserted, not reviewed.
    const { port, bus, dialogue } = rig();
    bus.emit({ type: "dialogue:line", speaker: "mara", text: "Hello.", kind: "dialogue", screenId: null });
    dialogue.showChoices([{ text: "a" }, { text: "b", enabled: false }], () => {});
    port.hoverHit("choices", 0);
    port.hoverHit("controls", 1);
    dialogue.setBacklogOpen(true);

    const allowed = new Set<string | number>(Object.values(COLOR));
    for (const value of coloursUsed(port)) expect(allowed).toContain(value);
  });

  it("never paints a blocked or quiet outcome in the danger colour", () => {
    const { port, dialogue } = rig();
    dialogue.showLine({ speaker: null, text: "Nothing happens.", kind: "narration" });
    dialogue.showChoices([{ text: "a", enabled: false }], () => {});
    expect(coloursUsed(port)).not.toContain(COLOR.danger);
  });
});


/**
 * THE LAYER IS ACTUALLY ON SCREEN.
 *
 * A previous pass built all of this correctly and mounted none of it: nothing
 * in src/ constructed a `DialogueSystem`, nothing emitted `dialogue:line`, and
 * no scene drew the layout. Every test passed. So the wiring is asserted here,
 * from the source text — the same technique `ProbeContract.test.ts` uses, and
 * for the same reason: a Phaser scene cannot be imported into vitest.
 *
 * RETARGETED 2026-08-17. These first asserted the mount on `ScreenScene`, which
 * IS mode 1 — so they certified a second bug while catching the first: the VN
 * layout had destructively REPLACED mode 1's own layout, and Mode 4 existed
 * only as a record in `modes.ts` that nothing read. A test that pins the wiring
 * to the wrong scene is worse than no test, because it reads as proof. The
 * mount then moved to `PlayScene`, with a pair of assertions saying mode 4 HAS
 * the layer and mode 1 is UNTOUCHED by it.
 *
 * RETARGETED AGAIN 2026-08-17. `PlayScene`/`MODE4` are deleted
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 0) — mode 5 starts as an
 * exact copy of mode 3's behaviour and grows by extraction. Between steps 0
 * and 2 the VN layer was mounted on NO scene, a declared gap this file said
 * so; step 2 closes it by mounting `DialogueSystem`/`DialogueFeed` onto
 * `CollectScene`, ALONGSIDE `NpcTalkSystem`'s spell-clue modal, not replacing
 * it — `startDialogue()`, gated on `mode.dialogue === "vn"` (only `mode5`).
 */
describe("the VN layer is mounted, not shelved", () => {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const screen = fs.readFileSync(path.join(root, "src", "scenes", "ScreenScene.ts"), "utf8");
  const collect = fs.readFileSync(path.join(root, "src", "scenes", "CollectScene.ts"), "utf8");

  it("CollectScene mounts the dialogue system and feeds it, gated on the descriptor", () => {
    expect(collect).toContain("mountDialogue(");
    expect(collect).toContain("new DialogueFeed(");
    expect(collect).toContain('this.mode.dialogue !== "vn"');
    expect(collect).toContain(".sync(");
    expect(collect).toContain(".showChoices(");
  });

  it("the box never offers a move choice or shows narration outside a conversation", () => {
    // The scope seam itself: `kind === "move"` stays the screen layout,
    // `kind === "spoken" | "deed"` is the only thing that reaches the box.
    // `dialogueFeed.sync`'s second argument is what gates emission at all.
    expect(collect).toContain('c.kind !== "move"');
    expect(collect).toMatch(/dialogueFeed\?\.sync\(v,\s*inConversation\)/);
  });

  it("mode 1 keeps its own layout — the VN layer never mounted onto ScreenScene", () => {
    // THE MIRROR, and the assertion whose absence let the mistake through.
    //
    // Mode 4 is "not a fourth flag on an existing scene" (the plan, Wave 1). It
    // is a separate composition, and the proof is that mode 1 still draws what
    // it always drew. A first pass mounted the VN layer here and deleted mode 1's
    // transcript, choice column and portrait baseline outright. Both halves are
    // checked, because either alone reads as success.
    expect(screen).not.toContain("mountDialogue(");
    expect(screen).not.toContain("new DialogueFeed(");
    for (const alive of ["W - 500", "this.transcript", "drawCast("]) {
      expect(screen).toContain(alive);
    }
  });

  it("the dialogue layer introduces no colour of its own", () => {
    // `theme.ts` is contrast-checked as a set; a raw hex anywhere in this track
    // passes review and silently breaks that audit.
    const files = [
      ["src", "systems", "DialogueSystem.ts"],
      ["src", "systems", "PhaserDialogueRenderPort.ts"],
      ["src", "systems", "PhaserDialogueRenderPort.test.ts"],
      ["src", "systems", "FakeDialogueRenderPort.ts"],
      ["src", "systems", "DialogueRenderPort.ts"],
      ["src", "systems", "mountDialogue.ts"],
      ["src", "world", "view", "DialogueLayout.ts"],
    ];
    for (const parts of files) {
      const code = fs.readFileSync(path.join(root, ...parts), "utf8");
      expect({ file: parts.join("/"), hits: code.match(/#[0-9a-fA-F]{6}|0x[0-9a-fA-F]{6}/g) })
        .toEqual({ file: parts.join("/"), hits: null });
    }
  });
});
