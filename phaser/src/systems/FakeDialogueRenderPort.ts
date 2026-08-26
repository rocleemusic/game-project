/**
 * The test renderer. No Phaser, no canvas, no timers, no DOM.
 *
 * WHY IT EXISTS BEYOND CONVENIENCE. `DialogueSystem` is mostly a state machine
 * — paging, hover, hidden UI, auto/skip, keyboard selection, backlog open and
 * closed — and none of it was reachable from vitest while it drew straight onto
 * Phaser objects. This is the same seam `FakeVfxBackend` gave the VFX track,
 * for the same reason: a mistake shows up here rather than on a canvas.
 *
 * IT ALSO COUNTS. `fakeDialogueLiveObjects()` is a module-level tally of every
 * object any fake port is currently holding, so a leak shows up as a rising
 * integer in a test instead of as a dark screen after a long walk. A
 * per-instance counter could not see it, because `detach()` is permanent and a
 * disposal test has to build a fresh port each cycle.
 *
 * MEASUREMENT IS DETERMINISTIC, NOT REALISTIC. Text is `fontPx * WIDTH_RATIO`
 * per character and wrapping is greedy on spaces. Real glyph metrics would make
 * every assertion a guess; what the tests need is that the SAME input always
 * produces the same number of lines.
 */

import type {
  DialogueRenderPort,
  HitSpec,
  RoundedRectShape,
  TextSpec,
} from "./DialogueRenderPort";
import type { SpritePlacement } from "../world/view/DialogueLayout";

/** Nominal glyph width as a share of the font size. */
const WIDTH_RATIO = 0.5;

let liveObjects = 0;

/** Objects every fake port is still holding. Zero is the only good value. */
export function fakeDialogueLiveObjects(): number {
  return liveObjects;
}

/** Only for tests that want a clean slate. Never called by the system. */
export function resetFakeDialogueRegistry(): void {
  liveObjects = 0;
}

export interface FakeImage {
  readonly key: string;
  readonly placement: SpritePlacement;
}

export interface FakeDialogueRenderPortOptions {
  readonly width?: number;
  readonly height?: number;
  /** Texture keys that "exist", with their source size. */
  readonly textures?: Readonly<Record<string, { width: number; height: number }>>;
}

export class FakeDialogueRenderPort implements DialogueRenderPort {
  private readonly width: number;
  private readonly height: number;
  private readonly textures: Record<string, { width: number; height: number }>;
  private detached = false;
  /** Counts toward `liveObjects`, so a double detach cannot double-decrement. */
  private held = 0;

  /** The last shapes drawn into each layer. */
  readonly shapes = new Map<string, readonly RoundedRectShape[]>();
  /** The last spec for each text id. `null` means hidden. */
  readonly texts = new Map<string, TextSpec | null>();
  /** The current pointer targets in each group. */
  readonly hits = new Map<string, readonly HitSpec[]>();
  readonly keys = new Map<string, (() => void)[]>();
  readonly timers = new Map<string, { intervalMs: number; tick: () => void; elapsed: number }>();
  image: FakeImage | null = null;
  detachCalls = 0;

  constructor(options: FakeDialogueRenderPortOptions = {}) {
    this.width = options.width ?? 1920;
    this.height = options.height ?? 1080;
    this.textures = { ...(options.textures ?? {}) };
  }

  get attached(): boolean {
    return !this.detached;
  }

  viewSize(): { width: number; height: number } {
    return { width: this.width, height: this.height };
  }

  // -- measurement ----------------------------------------------------------

  measureTextWidth(text: string, fontPx: number, _fontFamily: string): number {
    return text.length * fontPx * WIDTH_RATIO;
  }

  wrapText(
    text: string,
    fontPx: number,
    _fontFamily: string,
    wrapWidth: number,
  ): readonly string[] {
    const perChar = fontPx * WIDTH_RATIO;
    const budget = Math.max(1, Math.floor(Math.max(1, wrapWidth) / perChar));
    const out: string[] = [];
    for (const paragraph of text.split("\n")) {
      let line = "";
      for (const word of paragraph.split(/\s+/).filter(Boolean)) {
        const candidate = line ? `${line} ${word}` : word;
        if (candidate.length <= budget || !line) line = candidate;
        else {
          out.push(line);
          line = word;
        }
      }
      out.push(line);
    }
    return out.length ? out : [""];
  }

  imageSize(key: string): { width: number; height: number } | null {
    return this.textures[key] ?? null;
  }

  // -- drawing --------------------------------------------------------------

  drawShapes(layer: string, shapes: readonly RoundedRectShape[]): void {
    if (this.detached) return;
    this.shapes.set(layer, [...shapes]);
    this.recount();
  }

  drawText(id: string, spec: TextSpec | null): void {
    if (this.detached) return;
    this.texts.set(id, spec);
    this.recount();
  }

  setHits(group: string, hits: readonly HitSpec[]): void {
    if (this.detached) return;
    this.hits.set(group, [...hits]);
    this.recount();
  }

  setImage(key: string | null, placement: SpritePlacement | null): void {
    if (this.detached) return;
    this.image = key && placement && this.textures[key] ? { key, placement } : null;
    this.recount();
  }

  // -- input and time -------------------------------------------------------

  onKey(key: string, handler: () => void): void {
    if (this.detached) return;
    const name = key.toUpperCase();
    const list = this.keys.get(name) ?? [];
    list.push(handler);
    this.keys.set(name, list);
    this.recount();
  }

  startTimer(id: string, intervalMs: number, tick: () => void): void {
    if (this.detached) return;
    this.timers.set(id, { intervalMs: Math.max(1, intervalMs), tick, elapsed: 0 });
    this.recount();
  }

  stopTimer(id: string): void {
    this.timers.delete(id);
    this.recount();
  }

  detach(): void {
    this.detachCalls++;
    if (this.detached) return;
    this.detached = true;
    this.shapes.clear();
    this.texts.clear();
    this.hits.clear();
    this.keys.clear();
    this.timers.clear();
    this.image = null;
    liveObjects -= this.held;
    this.held = 0;
  }

  // -- test driving ---------------------------------------------------------

  /** Fire every handler bound to `key`. */
  pressKey(key: string): void {
    for (const handler of [...(this.keys.get(key.toUpperCase()) ?? [])]) handler();
  }

  /** Advance the injected clock. Timers fire as often as they would have. */
  advance(ms: number): void {
    for (const timer of [...this.timers.values()]) {
      timer.elapsed += ms;
      while (timer.elapsed >= timer.intervalMs) {
        timer.elapsed -= timer.intervalMs;
        timer.tick();
      }
    }
  }

  /** Click the nth pointer target in a group, as a player would. */
  clickHit(group: string, index: number): void {
    this.hits.get(group)?.[index]?.onDown?.();
  }

  hoverHit(group: string, index: number): void {
    this.hits.get(group)?.[index]?.onOver?.();
  }

  unhoverHit(group: string, index: number): void {
    this.hits.get(group)?.[index]?.onOut?.();
  }

  /** The visible text of one id, or `null` when it is hidden or absent. */
  textOf(id: string): string | null {
    return this.texts.get(id)?.text ?? null;
  }

  specOf(id: string): TextSpec | null {
    return this.texts.get(id) ?? null;
  }

  shapesIn(layer: string): readonly RoundedRectShape[] {
    return this.shapes.get(layer) ?? [];
  }

  hitsIn(group: string): readonly HitSpec[] {
    return this.hits.get(group) ?? [];
  }

  /** Every text id currently visible. */
  visibleTextIds(): string[] {
    return [...this.texts.entries()]
      .filter(([, spec]) => spec !== null)
      .map(([id]) => id)
      .sort();
  }

  private recount(): void {
    let held = 0;
    for (const shapes of this.shapes.values()) held += shapes.length;
    for (const spec of this.texts.values()) if (spec) held++;
    for (const hits of this.hits.values()) held += hits.length;
    for (const handlers of this.keys.values()) held += handlers.length;
    held += this.timers.size;
    if (this.image) held++;
    liveObjects += held - this.held;
    this.held = held;
  }
}
