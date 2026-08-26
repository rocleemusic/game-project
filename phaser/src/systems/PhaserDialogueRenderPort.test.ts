/**
 * The leak test, run against the REAL dialogue port.
 *
 * WHY THIS FILE EXISTS. `DialogueSystem.test.ts` cycles lines and choices and
 * asserts `fakeDialogueLiveObjects() === 0` after `destroy()`, and that the count
 * is flat across 200 lines — but that counter is maintained by
 * `FakeDialogueRenderPort`, a hand-written mirror. It proves the fake's own
 * bookkeeping is symmetric, which was never in doubt. The file that can actually
 * leak is `PhaserDialogueRenderPort`, and it had no test at all: nothing proved
 * that `root.destroy()` takes the graphics, texts and hit rectangles with it,
 * that the ruler — the one object deliberately kept OFF the display list, and so
 * the one object a container teardown cannot reach — is destroyed, or that
 * `setHits` pools rectangles instead of creating one per redraw. Phaser 4 does
 * not release any of this on scene shutdown; `detach()` is the whole guarantee.
 *
 * HOW IT RUNS WITHOUT A CANVAS. The port names Phaser in type positions only, so
 * `import type Phaser` keeps the engine out of the module graph at load. That
 * lets a stub scene stand in for the real one and COUNT: every object the scene
 * factories hand out, against every `destroy()`. `live()` returning 0 after
 * `detach()` is the assertion the disposal narrative was written to earn.
 *
 * The stub mirrors `PhaserVfxBackend.test.ts` next door, one layer below the
 * fake, and for the same reason.
 */

import { describe, expect, it } from "vitest";
import type Phaser from "phaser";
import { COLOR, FONT } from "../ui/theme";
import { PhaserDialogueRenderPort } from "./PhaserDialogueRenderPort";
import { DialogueSystem } from "./DialogueSystem";
import { GameEventBus } from "../world/events/GameEvents";
import type { RoundedRectShape, TextSpec } from "./DialogueRenderPort";

// ---------------------------------------------------------------------------
// The stub scene
// ---------------------------------------------------------------------------

interface StubObject {
  readonly kind: "container" | "graphics" | "text" | "rectangle" | "image";
  /** Set by `destroy()`. A container destroys its children, as Phaser does. */
  destroyed: boolean;
  /** True while the object is parented by the port's root container. */
  parented: boolean;
}

const RECT = { x: 0, y: 0, w: 10, h: 10 };
const STYLE = {
  fillColor: COLOR.panel,
  fillAlpha: 1,
  strokeColor: COLOR.border,
  strokeAlpha: 1,
  strokeWidth: 2,
};
const SHAPE: RoundedRectShape = { rect: RECT, radius: 3, style: STYLE };
const SPEC: TextSpec = {
  text: "Hello.",
  x: 10,
  y: 20,
  originX: 0.5,
  originY: 0,
  fontPx: 30,
  fontFamily: FONT.display,
  color: COLOR.ink,
  align: "center",
};

function stubScene(options: { textures?: Record<string, { width: number; height: number }> } = {}) {
  const objects: StubObject[] = [];
  const textures = options.textures ?? {};

  const keyHandlers: { event: string; handler: () => void }[] = [];
  const keyRemovals: { event: string; handler: () => void }[] = [];
  const timers: { delay: number; loop: boolean; callback: () => void; removed: boolean }[] = [];
  const graphicsCalls: { clears: number; fills: number; strokes: number } = {
    clears: 0,
    fills: 0,
    strokes: 0,
  };
  /** Every `setText` the ruler ever saw, so reuse is visible rather than assumed. */
  const rulerTexts: string[] = [];
  const rectangleFills: number[] = [];

  const track = <T extends object>(kind: StubObject["kind"], obj: T): T & StubObject => {
    const entry = Object.assign(obj, { kind, destroyed: false, parented: false });
    objects.push(entry as unknown as StubObject);
    return entry as T & StubObject;
  };

  const makeTextObject = (onDestroy?: () => void) => {
    const t = {
      style: {} as Record<string, unknown>,
      content: "",
      wrapWidth: 0,
      visible: false,
      origin: { x: 0, y: 0 },
      scale: 1,
      position: { x: 0, y: 0 },
      lineSpacing: 0,
      setStyle(style: Record<string, unknown>) {
        t.style = { ...t.style, ...style };
        const wrap = style.wordWrap as { width?: number } | undefined;
        if (wrap) t.wrapWidth = wrap.width ?? 0;
        return t;
      },
      setLineSpacing(v: number) {
        t.lineSpacing = v;
        return t;
      },
      setText(text: string) {
        t.content = text;
        return t;
      },
      setOrigin(x: number, y: number) {
        t.origin = { x, y };
        return t;
      },
      setScale(s: number) {
        t.scale = s;
        return t;
      },
      setPosition(x: number, y: number) {
        t.position = { x, y };
        return t;
      },
      setVisible(v: boolean) {
        t.visible = v;
        return t;
      },
      /** Nominal metrics: deterministic, so a wrap assertion is not a guess. */
      get width() {
        const px = Number(String(t.style.fontSize ?? "10px").replace("px", ""));
        return t.content.length * px * 0.5;
      },
      getWrappedText(text: string): string[] {
        const px = Number(String(t.style.fontSize ?? "10px").replace("px", ""));
        const budget = Math.max(1, Math.floor(Math.max(1, t.wrapWidth) / (px * 0.5)));
        const out: string[] = [];
        let line = "";
        for (const word of text.split(/\s+/).filter(Boolean)) {
          const candidate = line ? `${line} ${word}` : word;
          if (candidate.length <= budget || !line) line = candidate;
          else {
            out.push(line);
            line = word;
          }
        }
        out.push(line);
        return out;
      },
      destroy() {
        entry.destroyed = true;
        onDestroy?.();
      },
    };
    const entry = track("text", t);
    return entry;
  };

  const scene = {
    scale: { width: 1920, height: 1080 },
    add: {
      container: () => {
        const children: StubObject[] = [];
        const c = {
          depth: 0,
          children,
          setDepth(d: number) {
            c.depth = d;
            return c;
          },
          add(child: StubObject) {
            child.parented = true;
            children.push(child);
            return c;
          },
          addAt(child: StubObject, index: number) {
            child.parented = true;
            children.splice(index, 0, child);
            return c;
          },
          destroy() {
            entry.destroyed = true;
            // Phaser destroys a container's children with it. Anything NOT in
            // here has to be released by name, which is the ruler's whole risk.
            for (const child of children) child.destroyed = true;
            children.length = 0;
          },
        };
        const entry = track("container", c);
        return entry;
      },
      graphics: () => {
        const g = {
          clear() {
            graphicsCalls.clears++;
            return g;
          },
          fillStyle() {
            return g;
          },
          fillRoundedRect() {
            graphicsCalls.fills++;
            return g;
          },
          lineStyle() {
            return g;
          },
          strokeRoundedRect() {
            graphicsCalls.strokes++;
            return g;
          },
          destroy() {
            entry.destroyed = true;
          },
        };
        const entry = track("graphics", g);
        return entry;
      },
      text: () => makeTextObject(),
      rectangle: (_x: number, _y: number, _w: number, _h: number, fill: number) => {
        rectangleFills.push(fill);
        const listeners: string[] = [];
        const r = {
          listeners,
          interactive: false,
          visible: false,
          cursor: false,
          size: { w: 0, h: 0 },
          position: { x: 0, y: 0 },
          input: { hitArea: { setTo: () => {} } },
          removeAllListeners() {
            listeners.length = 0;
            return r;
          },
          setPosition(x: number, y: number) {
            r.position = { x, y };
            return r;
          },
          setSize(w: number, h: number) {
            r.size = { w, h };
            return r;
          },
          setVisible(v: boolean) {
            r.visible = v;
            return r;
          },
          setInteractive(config: { useHandCursor?: boolean } = {}) {
            r.interactive = true;
            r.cursor = config.useHandCursor === true;
            return r;
          },
          disableInteractive() {
            r.interactive = false;
            return r;
          },
          on(event: string) {
            listeners.push(event);
            return r;
          },
          destroy() {
            entry.destroyed = true;
          },
        };
        const entry = track("rectangle", r);
        return entry;
      },
      image: (_x: number, _y: number, key: string) => {
        const img = {
          key,
          visible: false,
          scale: 1,
          setTexture(k: string) {
            img.key = k;
            return img;
          },
          setOrigin() {
            return img;
          },
          setPosition() {
            return img;
          },
          setScale(s: number) {
            img.scale = s;
            return img;
          },
          setVisible(v: boolean) {
            img.visible = v;
            return img;
          },
          destroy() {
            entry.destroyed = true;
          },
        };
        const entry = track("image", img);
        return entry;
      },
    },
    make: {
      text: () => {
        const ruler = makeTextObject();
        const original = ruler.setText;
        ruler.setText = (text: string) => {
          rulerTexts.push(text);
          return original(text);
        };
        return ruler;
      },
    },
    textures: {
      exists: (key: string) => key in textures,
      get: (key: string) => ({ getSourceImage: () => textures[key] }),
    },
    time: {
      addEvent: (config: { delay: number; loop: boolean; callback: () => void }) => {
        const timer = {
          ...config,
          removed: false,
          remove: () => void (timer.removed = true),
        };
        timers.push(timer);
        return timer;
      },
    },
    input: {
      keyboard: {
        on: (event: string, handler: () => void) => keyHandlers.push({ event, handler }),
        off: (event: string, handler: () => void) => keyRemovals.push({ event, handler }),
      },
    },
  };

  return {
    scene: scene as unknown as Phaser.Scene,
    objects,
    keyHandlers,
    keyRemovals,
    timers,
    graphicsCalls,
    rulerTexts,
    rectangleFills,
    created: (kind?: StubObject["kind"]) =>
      kind ? objects.filter((o) => o.kind === kind).length : objects.length,
    /** Objects the scene handed out that nobody has destroyed. Zero is the pass. */
    live: () => objects.filter((o) => !o.destroyed).length,
    /**
     * Live objects inside no container — the ones a container teardown cannot
     * reach and `detach()` has to name. The root itself is excluded: it is the
     * container, not something a container should be holding.
     */
    liveOrphans: () =>
      objects.filter((o) => !o.destroyed && !o.parented && o.kind !== "container").length,
    liveTimers: () => timers.filter((t) => !t.removed).length,
    press: (event: string) => {
      for (const { event: name, handler } of [...keyHandlers]) {
        if (name === event) handler();
      }
    },
  };
}

// ---------------------------------------------------------------------------

describe("PhaserDialogueRenderPort creates its objects once", () => {
  it("builds one container and one graphics layer per depth band, and nothing else", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene, { depth: 250 });

    expect(stub.created("container")).toBe(1);
    // Declared up front so insertion order is depth order — see LAYER_ORDER.
    expect(stub.created("graphics")).toBe(6);
    expect(stub.created("text")).toBe(0);
    expect(stub.created("rectangle")).toBe(0);
    expect(port.attached).toBe(true);
    port.detach();
  });

  it("pools one Text per id however many times it is redrawn", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);

    for (let i = 0; i < 100; i++) port.drawText("body", { ...SPEC, text: `Line ${i}` });
    port.drawText("name", { ...SPEC, text: "Mara" });
    expect(stub.created("text")).toBe(2);

    // Hiding is `setVisible(false)`, never `destroy()` — a destroyed-and-remade
    // Text per line is exactly the growth `npm run walk` watches for.
    port.drawText("body", null);
    expect(stub.live()).toBe(stub.created());
    port.drawText("body", { ...SPEC, text: "back" });
    expect(stub.created("text")).toBe(2);
    port.detach();
  });

  it("reuses one graphics layer per name, clearing rather than recreating", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    const before = stub.created("graphics");

    for (let i = 0; i < 50; i++) port.drawShapes("box", [SHAPE]);
    expect(stub.created("graphics")).toBe(before);
    expect(stub.graphicsCalls.clears).toBe(50);
    expect(stub.graphicsCalls.fills).toBe(50);
    expect(stub.graphicsCalls.strokes).toBe(50);

    // An empty array clears the layer without drawing anything into it.
    port.drawShapes("box", []);
    expect(stub.graphicsCalls.fills).toBe(50);
    port.detach();
  });

  it("pools hit rectangles to the high-water mark, never per redraw", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    const hit = (n: number) =>
      Array.from({ length: n }, () => ({ rect: RECT, cursor: true, onDown: () => {} }));

    port.setHits("choices", hit(3));
    expect(stub.created("rectangle")).toBe(3);
    port.setHits("choices", hit(5));
    expect(stub.created("rectangle")).toBe(5);
    for (let i = 0; i < 40; i++) port.setHits("choices", hit(2));
    expect(stub.created("rectangle")).toBe(5);

    // The three above the current set are parked, not left live on the screen.
    const rects = stub.objects.filter((o) => o.kind === "rectangle") as unknown as {
      visible: boolean;
      interactive: boolean;
      listeners: string[];
    }[];
    expect(rects.filter((r) => r.visible)).toHaveLength(2);
    expect(rects.filter((r) => r.interactive)).toHaveLength(2);
    // And stale closures went with them, or a click fires the wrong choice.
    for (const parked of rects.slice(2)) expect(parked.listeners).toEqual([]);
    port.detach();
  });

  it("takes even an invisible hit target's fill from the theme", () => {
    // The fill is a required argument at alpha 0. "It cannot be seen" is how the
    // next raw hex gets in, and `theme.ts` is audited as a set.
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    port.setHits("box", [{ rect: RECT, cursor: false }]);
    expect(stub.rectangleFills).toEqual([COLOR.night]);
    expect(new Set(Object.values(COLOR))).toContain(stub.rectangleFills[0]);
    port.detach();
  });

  it("keeps one Image and swaps its texture rather than adding another", () => {
    const stub = stubScene({
      textures: { mara: { width: 800, height: 1400 }, toby: { width: 700, height: 1300 } },
    });
    const port = new PhaserDialogueRenderPort(stub.scene);
    const place = { x: 0, y: 0, originX: 0.5 as const, originY: 1 as const, scale: 1 };

    port.setImage("mara", place);
    port.setImage("toby", place);
    port.setImage("mara", place);
    expect(stub.created("image")).toBe(1);

    // A missing texture is a screen with no sprite, not a broken-image frame.
    port.setImage("nobody", place);
    expect(stub.created("image")).toBe(1);
    port.setImage(null, null);
    expect(stub.created("image")).toBe(1);
    port.detach();
  });

  it("measures with one ruler, kept off the display list", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);

    expect(port.measureTextWidth("Eleanor", 40, FONT.display)).toBeGreaterThan(0);
    port.measureTextWidth("Mara", 40, FONT.display);
    port.wrapText("one two three four five", 40, FONT.display, 200);
    expect(stub.created("text")).toBe(1);
    expect(stub.liveOrphans()).toBe(1);
    expect(stub.rulerTexts.length).toBeGreaterThan(1);
    port.detach();
  });

  it("does not leave the ruler wrapped after a wrap call", () => {
    // The ruler is shared. A width left set by one caller silently wraps the
    // next measurement, and a nameplate sized off a wrapped width is too narrow.
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    const long = "a very long speaker name indeed";
    port.wrapText(long, 40, FONT.display, 100);
    expect(port.measureTextWidth(long, 40, FONT.display)).toBeCloseTo(
      long.length * 40 * 0.5,
      5,
    );
    port.detach();
  });
});

describe("PhaserDialogueRenderPort releases everything it created", () => {
  it("takes the container, the ruler, the timers and the keys on detach", () => {
    const stub = stubScene({ textures: { mara: { width: 800, height: 1400 } } });
    const port = new PhaserDialogueRenderPort(stub.scene);

    port.drawShapes("box", [SHAPE]);
    port.drawText("body", SPEC);
    port.drawText("name", { ...SPEC, text: "Mara" });
    port.setHits("choices", [{ rect: RECT, cursor: true, onDown: () => {} }]);
    port.setImage("mara", { x: 0, y: 0, originX: 0.5, originY: 1, scale: 1 });
    port.measureTextWidth("Mara", 40, FONT.display);
    port.onKey("SPACE", () => {});
    port.onKey("ENTER", () => {});
    port.startTimer("auto", 1000, () => {});
    expect(stub.live()).toBeGreaterThan(0);
    expect(stub.liveTimers()).toBe(1);

    port.detach();
    expect(stub.live()).toBe(0);
    expect(stub.liveTimers()).toBe(0);
    expect(stub.keyRemovals).toHaveLength(2);
    expect(stub.keyRemovals.map((k) => k.event)).toEqual(["keydown-SPACE", "keydown-ENTER"]);
    // Removed with the SAME function reference, or the listener stays bound.
    expect(stub.keyRemovals[0].handler).toBe(stub.keyHandlers[0].handler);
    expect(port.attached).toBe(false);
  });

  it("is idempotent, and inert rather than broken afterwards", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    port.drawText("body", SPEC);
    port.detach();
    const after = stub.created();

    port.detach();
    expect(stub.keyRemovals).toHaveLength(0);
    // Every draw call on a detached port is a no-op, not a crash and not a
    // resurrection: a scene shutting down calls into this after teardown.
    port.drawShapes("box", [SHAPE]);
    port.drawText("body", SPEC);
    port.setHits("choices", [{ rect: RECT, cursor: true }]);
    port.setImage("mara", { x: 0, y: 0, originX: 0.5, originY: 1, scale: 1 });
    port.onKey("SPACE", () => {});
    port.startTimer("auto", 10, () => {});
    port.measureTextWidth("Mara", 40, FONT.display);
    expect(stub.created()).toBe(after);
    expect(stub.live()).toBe(0);
    expect(stub.liveTimers()).toBe(0);
    expect(port.wrapText("hello", 40, FONT.display, 100)).toEqual(["hello"]);
  });

  it("runs a registered cleanup exactly once, and immediately if already gone", () => {
    // `addCleanup` is how the mounting code hangs a scene-lifecycle listener off
    // the ONE release path. A cleanup that never runs is the scrim leak again.
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    let ran = 0;
    port.addCleanup(() => ran++);
    port.detach();
    expect(ran).toBe(1);
    port.detach();
    expect(ran).toBe(1);

    port.addCleanup(() => ran++);
    expect(ran).toBe(2);
  });

  it("restarts a named timer instead of stacking a second one", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    port.startTimer("auto", 1000, () => {});
    port.startTimer("auto", 200, () => {});
    expect(stub.timers).toHaveLength(2);
    expect(stub.liveTimers()).toBe(1);

    port.stopTimer("auto");
    expect(stub.liveTimers()).toBe(0);
    // Stopping one that is not running is not an error.
    port.stopTimer("auto");
    port.stopTimer("never-started");
    expect(stub.liveTimers()).toBe(0);
    port.detach();
  });

  it("leaves zero live objects after 25 build/detach cycles", () => {
    const stub = stubScene({ textures: { mara: { width: 800, height: 1400 } } });
    for (let cycle = 0; cycle < 25; cycle++) {
      const port = new PhaserDialogueRenderPort(stub.scene);
      port.drawShapes("box", [SHAPE]);
      port.drawText("body", SPEC);
      port.setHits("choices", [{ rect: RECT, cursor: true, onDown: () => {} }]);
      port.setImage("mara", { x: 0, y: 0, originX: 0.5, originY: 1, scale: 1 });
      port.measureTextWidth("Mara", 40, FONT.display);
      port.onKey("SPACE", () => {});
      port.startTimer("auto", 100, () => {});
      expect(stub.live()).toBeGreaterThan(0);
      port.detach();
      expect(stub.live()).toBe(0);
      expect(stub.liveTimers()).toBe(0);
    }
    expect(stub.created("container")).toBe(25);
    expect(stub.live()).toBe(0);
  });
});

describe("DialogueSystem on the real port", () => {
  it("does not grow the scene's object count across 200 lines and choice sets", () => {
    // The claim `DialogueSystem.test.ts` makes against the fake, made here
    // against real scene-factory accounting. If `setHits` ever started creating
    // instead of pooling, or `drawText` destroyed and remade its Text, the fake
    // would still report a flat count and this would not.
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    const bus = new GameEventBus({ now: () => 0 });
    const dialogue = new DialogueSystem(port, bus);

    dialogue.showLine({ speaker: "mara", text: "One.", kind: "dialogue" });
    dialogue.showChoices([{ text: "a" }, { text: "b" }], () => {});
    const settled = stub.created();

    for (let i = 0; i < 200; i++) {
      dialogue.showLine({ speaker: "mara", text: `Line ${i}.`, kind: "dialogue" });
      dialogue.showChoices([{ text: "a" }, { text: "b" }], () => {});
      dialogue.advance();
    }
    expect(stub.created()).toBe(settled);

    dialogue.destroy();
    expect(stub.live()).toBe(0);
    expect(stub.liveTimers()).toBe(0);
  });

  it("routes a real key press through to the system, then unbinds it", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    const bus = new GameEventBus({ now: () => 0 });
    let advances = 0;
    const dialogue = new DialogueSystem(port, bus, { onAdvance: () => advances++ });
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });

    stub.press("keydown-SPACE");
    expect(advances).toBe(1);

    dialogue.destroy();
    // The handler list is what `press` walks, so a failed `off()` shows up as a
    // call into a system whose port is already gone.
    expect(stub.keyRemovals.length).toBe(stub.keyHandlers.length);
    expect(stub.live()).toBe(0);
  });

  it("drives its auto-advance off the scene clock and stops it on destroy", () => {
    const stub = stubScene();
    const port = new PhaserDialogueRenderPort(stub.scene);
    const bus = new GameEventBus({ now: () => 0 });
    let advances = 0;
    const dialogue = new DialogueSystem(port, bus, {
      autoIntervalMs: 500,
      onAdvance: () => advances++,
    });
    dialogue.showLine({ speaker: null, text: "Hello.", kind: "narration" });

    dialogue.setAuto(true);
    expect(stub.liveTimers()).toBe(1);
    expect(stub.timers.at(-1)).toMatchObject({ delay: 500, loop: true });
    stub.timers.at(-1)!.callback();
    expect(advances).toBe(1);

    dialogue.destroy();
    expect(stub.liveTimers()).toBe(0);
    expect(stub.live()).toBe(0);
  });
});
