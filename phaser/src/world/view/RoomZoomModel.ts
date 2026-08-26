/**
 * The pure math behind a DELIBERATE room zoom — player-set (scroll wheel,
 * cursor-centered), with drag-to-pan that only moves while dragging and only
 * once zoomed in. No Phaser, no DOM — same discipline as `PanModel.ts`,
 * whose `panFit()` this reuses directly for the scale/slack math (mode5 UX
 * wireframe §8, "Zoom and pan the room," decided revision 4: "same
 * underlying shape (scale, offset, slack) ... driven by different input").
 *
 * NOT `PanModel`. That class holds a FIXED blow-up (`PAN_ZOOM`) and eases
 * toward wherever the pointer drifts — ambient atmosphere for
 * `CollectScene`'s dialogue reads, driven by an always-on pointermove
 * listener. This is the opposite interaction: the player sets the zoom level
 * explicitly (scroll) and nothing pans until they drag for it — no easing,
 * direct 1:1 tracking. Sharing `panFit()` keeps the scale/offset/slack
 * triangle identical between the two without sharing the ambient-drift
 * wiring that would be wrong here.
 *
 * HOW A CALLER USES THIS. The backdrop image gets `scale` (the absolute
 * image-pixel-to-screen scale — cover-fit blown up by `zoom`) and
 * `place()`'s position, the same call shape `BackdropSystem` already drives
 * its own image with. Everything else that must stay visually pinned to the
 * room — decor pieces, surface hint boxes, positioned as a fraction of the
 * view (`p.x * viewWidth`, unaware of any zoom) — belongs in ONE Phaser
 * Container transformed by `roomLayerTransform`: scaled by the raw `zoom`
 * (their coordinates are already in that view-space unit, not image pixels,
 * so they don't need the cover-fit factor baked in) and positioned so the
 * view's own centre is the zoom's anchor before the pan offset is added.
 * That one container transform is what makes every child zoom and pan
 * together as one image, without any of them being individually
 * repositioned by hand every frame.
 */

import { panFit } from "./PanModel";

/** 100% — the whole room, cover-fit, no pan room at all. The floor a scroll
 * can zoom out to; what `reset()` returns to only for a caller that opened
 * at Fit (see `initialZoom` / `reset()`). */
export const ROOM_ZOOM_MIN = 1;
/** 300% — enough to read cubby-scale detail without the room dissolving
 * into an unrecognisable crop. A judgment call, not derived from anything;
 * revisit if a real playtest says otherwise. */
export const ROOM_ZOOM_MAX = 3;
/** Zoom change per wheel notch — same sign convention `HubScene`'s existing
 * piece-resize wheel handler already uses (`dy > 0` shrinks). */
export const ROOM_ZOOM_STEP = 0.15;
/**
 * Where the Home Hub OPENS — not `ROOM_ZOOM_MIN` (Roc, 2026-08-23: "by
 * default the home hub should be zoomed in a little bit more so that the
 * drag actually has functionality"). At Fit the furniture is small enough
 * that a piece has almost nowhere to be dragged TO; this gives the gesture
 * real distance to cover, and gives the pan something to pan.
 *
 * 1.2 is the value a real playtest landed on. 1.45 was tried first and ate
 * the top row of the shelf — the one surface the close-up hangs off — so the
 * room stopped reading as a whole room on entry.
 */
export const ROOM_ZOOM_DEFAULT = 1.2;
/**
 * The pan the Home Hub also OPENS with — the room nudged down the screen.
 *
 * Not cosmetic. The sixteen shelf cubbies are authored at the very top of
 * the room (`Decor`'s `SHELF_BOUNDS`, y 0.09–0.16), and their merged hotspot
 * is the only door into `HubShelfScene`. Zooming about the view centre lifts
 * that band clean above the Hub's header chrome, where the room camera clips
 * it and it stops being hoverable at all — the close-up would simply be
 * unreachable on entry. 90px puts the lower half of the hotspot, and all of
 * its label, back inside the room band; the room's own zoom slack absorbs it
 * (`maxY` is ~248 at this zoom), and what falls off the bottom is the far
 * floor edge.
 */
export const ROOM_ZOOM_DEFAULT_OFFSET_Y = 90;

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export class RoomZoomModel {
  private readonly viewWidth: number;
  private readonly viewHeight: number;
  /** The zoom the view OPENS at and that `reset()` returns to. Defaults to
   * `ROOM_ZOOM_MIN` so a caller that wants plain Fit-on-entry gets exactly
   * the old behaviour; `HubScene` passes `ROOM_ZOOM_DEFAULT`. */
  private readonly homeZoom: number;
  /** The pan the view opens at and that `reset()` returns to — 0 unless a
   * caller asks otherwise. Clamped to the real slack the first time `fit()`
   * measures the image, so an over-large request degrades to "as far as it
   * goes" rather than snapping back to centre. */
  private homeOffsetY: number;
  private imageWidth = 0;
  private imageHeight = 0;

  private _zoom: number;
  private _scale = 1;
  private _maxX = 0;
  private _maxY = 0;
  private _offsetX = 0;
  private _offsetY = 0;

  constructor(
    viewWidth: number,
    viewHeight: number,
    initialZoom: number = ROOM_ZOOM_MIN,
    initialOffsetY = 0,
  ) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.homeZoom = clamp(initialZoom, ROOM_ZOOM_MIN, ROOM_ZOOM_MAX);
    this.homeOffsetY = initialOffsetY;
    this._zoom = this.homeZoom;
    this._offsetY = initialOffsetY;
  }

  /** The player-set zoom multiplier — 1 is Fit. Also the scale a
   * room-content Container should be given; see the class header. */
  get zoom(): number {
    return this._zoom;
  }
  /** The absolute image-pixel-to-screen scale (cover-fit × `zoom`) —
   * `panFit()`'s own `scale`, for the backdrop Image directly, the same
   * call shape `BackdropSystem` already uses. */
  get scale(): number {
    return this._scale;
  }
  get offsetX(): number {
    return this._offsetX;
  }
  get offsetY(): number {
    return this._offsetY;
  }
  /** Only true once zoomed past Fit — the decided gate on when a drag pans
   * the room at all ("only pans while zoomed in," wireframe §8). */
  get pannable(): boolean {
    return this._zoom > ROOM_ZOOM_MIN + 1e-6;
  }
  get atFit(): boolean {
    return !this.pannable;
  }
  /** The zoom this view opens at — what `reset()` goes back to. */
  get defaultZoom(): number {
    return this.homeZoom;
  }
  /** True when the view is exactly where it opened: default zoom, default
   * pan. The gate on whether a "reset the view" control has anything to do,
   * and on whether Esc should reset the view or leave the screen. */
  get atDefault(): boolean {
    return (
      Math.abs(this._zoom - this.homeZoom) < 1e-6 &&
      Math.abs(this._offsetX) < 1e-6 &&
      Math.abs(this._offsetY - this.homeOffsetY) < 1e-6
    );
  }
  /** The mockup's own "165%" readout. */
  get percentLabel(): string {
    return `${Math.round(this._zoom * 100)}%`;
  }

  /**
   * Size the model to the room image and return the scale to draw the
   * backdrop at — same call shape as `PanModel.fit`. Does not reset zoom or
   * pan; a caller re-measuring mid-zoom should not jump.
   */
  fit(imageWidth: number, imageHeight: number): number {
    this.imageWidth = imageWidth;
    this.imageHeight = imageHeight;
    this.recompute();
    // The requested opening pan is only knowable as legal once the image has
    // been measured, so it is clamped here rather than in the constructor —
    // otherwise `atDefault` could name an offset the model itself refuses to
    // hold, and the "Reset view" pill would never go away.
    this.homeOffsetY = clamp(this.homeOffsetY, -this._maxY, this._maxY);
    this._offsetY = clamp(this._offsetY, -this._maxY, this._maxY);
    return this._scale;
  }

  /** Back to where the view opened — the visible "Reset view — Esc"
   * control. That is Fit for a caller that took the default `initialZoom`,
   * and `ROOM_ZOOM_DEFAULT` for the Home Hub. Deliberately NOT a hard
   * `ROOM_ZOOM_MIN`: resetting into a state the screen never opens in would
   * put the cream-white edge of the diorama art back on screen. Zooming out
   * to true 100% by scroll is still available. */
  reset(): void {
    this._zoom = this.homeZoom;
    this._offsetX = 0;
    this._offsetY = this.homeOffsetY;
    this.recompute();
  }

  private recompute(): void {
    if (!this.imageWidth || !this.imageHeight) return;
    const { scale, maxX, maxY } = panFit(
      this.imageWidth,
      this.imageHeight,
      this.viewWidth,
      this.viewHeight,
      this._zoom,
    );
    this._scale = scale;
    this._maxX = maxX;
    this._maxY = maxY;
    this._offsetX = clamp(this._offsetX, -maxX, maxX);
    this._offsetY = clamp(this._offsetY, -maxY, maxY);
  }

  /**
   * Change zoom by `deltaZoom` (positive = in, negative = out), anchored so
   * the room point currently under `(pointerX, pointerY)` stays under the
   * pointer after the scale changes — cursor-centered zoom, the mockup's
   * "scroll to zoom" step. Returns false (no-op) at a zoom bound already
   * reached, or before `fit()` has ever run.
   */
  zoomAt(pointerX: number, pointerY: number, deltaZoom: number): boolean {
    if (!this.imageWidth || !this.imageHeight) return false;
    const nextZoom = clamp(this._zoom + deltaZoom, ROOM_ZOOM_MIN, ROOM_ZOOM_MAX);
    if (nextZoom === this._zoom) return false;

    // The room-space point (the same coordinate system decor pieces are
    // authored in — `p.x * viewWidth`) currently sitting under the
    // pointer. This is the point that must not move.
    const roomX = (pointerX - this.viewWidth / 2 - this._offsetX) / this._zoom + this.viewWidth / 2;
    const roomY = (pointerY - this.viewHeight / 2 - this._offsetY) / this._zoom + this.viewHeight / 2;

    this._zoom = nextZoom;
    const { scale, maxX, maxY } = panFit(
      this.imageWidth,
      this.imageHeight,
      this.viewWidth,
      this.viewHeight,
      nextZoom,
    );
    this._scale = scale;
    this._maxX = maxX;
    this._maxY = maxY;
    this._offsetX = clamp(
      pointerX - this.viewWidth / 2 - (roomX - this.viewWidth / 2) * nextZoom,
      -maxX,
      maxX,
    );
    this._offsetY = clamp(
      pointerY - this.viewHeight / 2 - (roomY - this.viewHeight / 2) * nextZoom,
      -maxY,
      maxY,
    );
    return true;
  }

  /**
   * Set the pan offset directly (clamped to the current slack) — the drag
   * path. Absolute rather than incremental so a caller drives it from one
   * drag-start anchor (`pointer.x - dragStartX`, plus the offset the drag
   * began at) without rounding creep across many `pointermove` events. A
   * no-op at Fit — "only pans while zoomed in," the same gate `pannable`
   * reports.
   */
  panTo(offsetX: number, offsetY: number): void {
    if (!this.pannable) return;
    this._offsetX = clamp(offsetX, -this._maxX, this._maxX);
    this._offsetY = clamp(offsetY, -this._maxY, this._maxY);
  }

  /** Where the backdrop Image (origin at its own centre) belongs on screen
   * right now — same formula as `PanModel.place(0, 0)`. */
  place(): { x: number; y: number } {
    return { x: this.viewWidth / 2 + this._offsetX, y: this.viewHeight / 2 + this._offsetY };
  }

  /**
   * The transform for a Container holding everything else that must stay
   * pinned to the room (decor pieces, surface hints) — see the class
   * header for the derivation. Children keep their existing absolute
   * `viewWidth`/`viewHeight`-fraction coordinates unchanged; only this one
   * container transform needs to move for the whole layer to zoom and pan
   * as one image, together with the backdrop.
   */
  get roomLayerTransform(): { scale: number; x: number; y: number } {
    return {
      scale: this._zoom,
      x: (this.viewWidth / 2) * (1 - this._zoom) + this._offsetX,
      y: (this.viewHeight / 2) * (1 - this._zoom) + this._offsetY,
    };
  }
}
