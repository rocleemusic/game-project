/**
 * What the VN dialogue layer needs from a renderer. Imports no Phaser.
 *
 * WHY THIS EXISTS. `DialogueSystem` is a state machine — paging, hover, hidden
 * UI, auto/skip timers, keyboard selection, backlog open/closed — wearing a
 * renderer as a coat. All of that logic used to sit directly on Phaser objects,
 * so none of it could be exercised without a canvas, and the whole class went
 * untested while the pure geometry beside it had 28 tests. The VFX track next
 * door had already solved this with `VfxBackend` + `FakeVfxBackend`; this is
 * the same seam for the same reason.
 *
 * DECLARATIVE, NOT IMPERATIVE. Every call says what a named thing should look
 * like NOW — `drawText("body", spec)` or `drawText("body", null)` to hide it.
 * The port owns the objects and reuses them; the system never holds one. That
 * is what keeps display-object count flat across a long walk (`npm run walk`
 * watches exactly this), because a system that cannot create an object cannot
 * leak one.
 *
 * DISPOSAL IS MANDATORY. `detach()` releases every object, key handler and
 * timer, and must be safe to call twice — Phaser will not do it for you.
 */

import type { Rect, SpritePlacement } from "../world/view/DialogueLayout";

/** Fill and stroke for one drawn shape. Colours come from `ui/theme.ts` only. */
export interface ShapeStyle {
  readonly fillColor: number;
  readonly fillAlpha: number;
  readonly strokeColor: number;
  readonly strokeAlpha: number;
  readonly strokeWidth: number;
}

export interface RoundedRectShape {
  readonly rect: Rect;
  readonly radius: number;
  readonly style: ShapeStyle;
}

/** One text element, positioned and styled in full. */
export interface TextSpec {
  readonly text: string;
  readonly x: number;
  readonly y: number;
  readonly originX: number;
  readonly originY: number;
  readonly fontPx: number;
  readonly fontFamily: string;
  /** A `COLOR` member. Never a raw hex — `theme.ts` is audited as a set. */
  readonly color: string;
  readonly align: "left" | "center";
  readonly wrapWidth?: number;
  /** Extra leading, in px, on top of the font size. */
  readonly lineSpacing?: number;
  /** `<= 1` to shrink an over-long name into its plate rather than clip it. */
  readonly scale?: number;
}

/** A pointer target. Handlers are plain thunks — the port adds no semantics. */
export interface HitSpec {
  readonly rect: Rect;
  readonly cursor: boolean;
  readonly onDown?: () => void;
  readonly onOver?: () => void;
  readonly onOut?: () => void;
}

/**
 * The renderer contract.
 *
 * Implementations are `PhaserDialogueRenderPort` (real) and
 * `FakeDialogueRenderPort` (tests). Neither is named in this file.
 */
export interface DialogueRenderPort {
  /** False after `detach()`. Every draw call on a detached port is a no-op. */
  readonly attached: boolean;

  /** The size the layout should be computed against, in scene pixels. */
  viewSize(): { width: number; height: number };

  // -- measurement (only the engine knows how wide "Eleanor" renders) --------

  measureTextWidth(text: string, fontPx: number, fontFamily: string): number;

  /**
   * Wrap `text` to `wrapWidth` and return the resulting lines.
   *
   * Wrapping is a measurement, so it lives here rather than in the pure layout
   * module, which only decides where the PAGE breaks fall in already-wrapped
   * lines.
   */
  wrapText(
    text: string,
    fontPx: number,
    fontFamily: string,
    wrapWidth: number,
  ): readonly string[];

  /** `null` when the texture is not loaded. A missing sprite is not an error. */
  imageSize(key: string): { width: number; height: number } | null;

  // -- drawing --------------------------------------------------------------

  /** Replace everything drawn in `layer`. An empty array clears it. */
  drawShapes(layer: string, shapes: readonly RoundedRectShape[]): void;

  /** Set or hide (`null`) one named text element. */
  drawText(id: string, spec: TextSpec | null): void;

  /** Replace the pointer targets in `group`. An empty array clears them. */
  setHits(group: string, hits: readonly HitSpec[]): void;

  /** Show one sprite, or none. Passing `null` clears whatever was shown. */
  setImage(key: string | null, placement: SpritePlacement | null): void;

  // -- input and time -------------------------------------------------------

  /**
   * Bind a key for the port's lifetime. `key` is a Phaser key name
   * (`"SPACE"`, `"ENTER"`, `"UP"`, `"ONE"`), matched case-insensitively.
   */
  onKey(key: string, handler: () => void): void;

  /** Start or restart a named repeating timer. Auto-advance and skip use it. */
  startTimer(id: string, intervalMs: number, tick: () => void): void;

  /** Stop a named timer. Safe when it is not running. */
  stopTimer(id: string): void;

  /**
   * Release every object, handler and timer. Safe to call twice; after it the
   * port is inert rather than broken.
   */
  detach(): void;
}
