/**
 * The pure math behind the backdrop's "look around" pan. No Phaser, no DOM.
 *
 * WHAT IT MODELS. The backdrop is blown up past a plain cover-fit (`PAN_ZOOM`),
 * which leaves slack between the image's edges and the canvas. The mouse
 * position chooses a point inside that slack; the rendered offset eases toward
 * it every frame. Hotspots and NPC portraits are repositioned by the SAME
 * offset, which is what makes them read as fixed points in the scene rather than
 * floating HUD.
 *
 * WHY IT IS A SEPARATE MODULE. It was five mutable fields and two methods on
 * `CollectScene`, tangled with Phaser objects it does not actually need: the
 * arithmetic only ever wanted an image size, a pointer position and a delta.
 * Extracted in Wave 1 so `PlayScene` and any later mode can pan without
 * re-deriving it, and so the easing can be tested without a canvas.
 *
 * WHAT STAYS IN THE SCENE. Whether there IS a backdrop, whether a modal is open,
 * and whether the OS asked for reduced motion. Those are engine and environment
 * facts; this file takes their consequences as arguments.
 */

/**
 * How far past a plain cover-fit the backdrop is blown up, to leave room for the
 * mouse-pan motion. 1.0 would mean no pan room at all.
 */
export const PAN_ZOOM = 1.22;

/**
 * Exponential-smoothing time constant (ms) for chasing the pan target — larger
 * is slower and more languid. Frame-rate independent (`1 - e^(-dt/tau)`), so it
 * looks the same at 30fps and 144fps. Roc, 2026-08-13: the previous direct-snap
 * pan read as jarring, especially re-entering the pannable zone at an edge.
 */
export const PAN_SMOOTH_TAU = 140;

export interface PanModelOptions {
  /** Canvas size the offsets are computed against. */
  readonly viewWidth: number;
  readonly viewHeight: number;
  readonly zoom?: number;
  readonly tau?: number;
  /**
   * The vertical band the pointer must be inside for the pan to take aim,
   * `[top, bottom]` inclusive.
   *
   * Outside it the LAST target is held rather than reset — reaching for a
   * button in the top bar, or reading the choices row, must not also drag the
   * scene out from under it (Roc, 2026-08-13).
   */
  readonly pointerBand: readonly [number, number];
  /**
   * The horizontal band, same rule as `pointerBand` — `[left, right]`
   * inclusive. Optional: a caller with no horizontal HUD to protect can omit
   * it and get the full view width (Roc, 2026-08-21 — panning was firing off
   * hovers anywhere on screen; it should only take aim inside the scene's own
   * live area, not the margins either).
   */
  readonly pointerXBand?: readonly [number, number];
  /**
   * Flip the band from "pan while inside" to "pan while outside" — a dead
   * zone in the middle instead of a hot zone (Roc, 2026-08-21: reaching
   * toward the NPC row itself dragged the whole scene under it; panning
   * should only kick in once the pointer is genuinely heading for an edge).
   * Default false, so every existing band keeps meaning "pannable area."
   */
  readonly deadZone?: boolean;
}

/** Local, so `src/world/**` need not reach for `Phaser.Math.Clamp`. */
function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

/**
 * Signed 0-to-1 ramp OUT of a dead zone: exactly 0 right at `edgeMin`/`edgeMax`,
 * growing to ±1 at `screenMin`/`screenMax`. Continuous at the boundary —
 * unlike measuring from screen centre, crossing out of the box starts the
 * target at 0 and grows it, instead of snapping straight to whatever value a
 * centre-relative reading already has out there (Roc, 2026-08-21: the jump
 * felt on entering the pan zone was exactly this discontinuity).
 */
function rampFromEdge(value: number, edgeMin: number, edgeMax: number, screenMin: number, screenMax: number): number {
  if (value < edgeMin) return -clamp((edgeMin - value) / (edgeMin - screenMin), 0, 1);
  if (value > edgeMax) return clamp((value - edgeMax) / (screenMax - edgeMax), 0, 1);
  return 0;
}

/**
 * The cover-fit-plus-zoom scale for an image, and the slack it leaves.
 *
 * `max` is how far the image may shift from centre before its own edge would
 * show, so it is half the overhang on each axis, never negative.
 */
export function panFit(
  imageWidth: number,
  imageHeight: number,
  viewWidth: number,
  viewHeight: number,
  zoom: number = PAN_ZOOM,
): { scale: number; maxX: number; maxY: number } {
  const scale = Math.max(viewWidth / imageWidth, viewHeight / imageHeight) * zoom;
  return {
    scale,
    maxX: Math.max(0, (imageWidth * scale - viewWidth) / 2),
    maxY: Math.max(0, (imageHeight * scale - viewHeight) / 2),
  };
}

/**
 * Frame-rate-independent exponential smoothing.
 *
 * `tau <= 0` snaps, which is also what reduced motion asks for.
 */
export function easeToward(current: number, target: number, deltaMs: number, tau: number): number {
  if (tau <= 0) return target;
  return current + (target - current) * (1 - Math.exp(-deltaMs / tau));
}

export class PanModel {
  private readonly viewWidth: number;
  private readonly viewHeight: number;
  private readonly zoom: number;
  private tau: number;
  private readonly bandTop: number;
  private readonly bandBottom: number;
  private readonly bandLeft: number;
  private readonly bandRight: number;
  private readonly deadZone: boolean;

  /** How far the zoomed backdrop can pan before its edge would show. */
  private _maxX = 0;
  private _maxY = 0;
  /** Current, smoothed position — what is actually rendered. */
  private _offsetX = 0;
  private _offsetY = 0;
  /** Where the pointer wants the pan to be — `step()` eases toward this. */
  private _targetX = 0;
  private _targetY = 0;

  constructor(options: PanModelOptions) {
    this.viewWidth = options.viewWidth;
    this.viewHeight = options.viewHeight;
    this.zoom = options.zoom ?? PAN_ZOOM;
    this.tau = options.tau ?? PAN_SMOOTH_TAU;
    [this.bandTop, this.bandBottom] = options.pointerBand;
    // No horizontal band supplied -> no horizontal gating, matching every
    // caller's behavior before `pointerXBand` existed (only Y was ever
    // gated). `Infinity` here, not `[0, viewWidth]` — the latter would
    // reject an off-canvas pointer this class otherwise clamps via `nx`.
    [this.bandLeft, this.bandRight] = options.pointerXBand ?? [-Infinity, Infinity];
    this.deadZone = options.deadZone ?? false;
  }

  /** Live-adjustable, unlike every other option — the Options "Pan Speed"
   * slider calls this every frame it's changed, not just at construction. */
  setTau(tau: number): void {
    this.tau = tau;
  }

  get maxX(): number {
    return this._maxX;
  }
  get maxY(): number {
    return this._maxY;
  }
  get offsetX(): number {
    return this._offsetX;
  }
  get offsetY(): number {
    return this._offsetY;
  }
  get targetX(): number {
    return this._targetX;
  }
  get targetY(): number {
    return this._targetY;
  }

  /** True when there is any slack to pan into at all. */
  get pannable(): boolean {
    return Boolean(this._maxX || this._maxY);
  }

  /**
   * The size the PICTURE actually occupies on screen, in canvas pixels — the
   * view plus the slack that hangs off both edges (`fit()` defines `maxX/maxY`
   * as half the overhang per axis, so the whole picture is `view + 2 * max`).
   *
   * WHY THIS EXISTS (Roc, 2026-08-23: "the regions should be mapped to the
   * picture location, so it should not move with the pan"). A region rect in
   * `regions.json` is a fraction OF THE BACKDROP, and the backdrop is not the
   * canvas — it is blown up past a cover fit by `PAN_ZOOM` and slides under
   * the canvas as the pan moves. Anything that multiplies a region fraction by
   * the VIEW size is measuring against the wrong rectangle, so the box lands
   * off its painted feature and drifts further with every pan. Multiplying by
   * this and placing through `place()` pins it to the picture instead.
   *
   * Falls back to the view size before `fit()` has run (or when the image
   * exactly covers), which is the correct answer for those cases too.
   */
  get pictureWidth(): number {
    return this.viewWidth + this._maxX * 2;
  }
  get pictureHeight(): number {
    return this.viewHeight + this._maxY * 2;
  }

  /**
   * Size the model to an image and return the scale to draw it at.
   *
   * Does not reset the offsets — `reset()` is the explicit act, so a caller
   * re-measuring the same image mid-pan does not jump.
   */
  fit(imageWidth: number, imageHeight: number): number {
    const { scale, maxX, maxY } = panFit(
      imageWidth,
      imageHeight,
      this.viewWidth,
      this.viewHeight,
      this.zoom,
    );
    this._maxX = maxX;
    this._maxY = maxY;
    return scale;
  }

  /** Back to a centred, unpannable rest state. Used on every screen change. */
  reset(): void {
    this._maxX = 0;
    this._maxY = 0;
    this._offsetX = 0;
    this._offsetY = 0;
    this._targetX = 0;
    this._targetY = 0;
  }

  /**
   * Take aim from a pointer position. Only ever sets the TARGET — `step()` is
   * what actually moves anything.
   *
   * Returns false, holding the previous target, when there is no slack or the
   * pointer is outside the pannable band.
   */
  aimAt(pointerX: number, pointerY: number): boolean {
    if (!this.pannable) return false;
    const inBand =
      pointerY >= this.bandTop &&
      pointerY <= this.bandBottom &&
      pointerX >= this.bandLeft &&
      pointerX <= this.bandRight;
    if (this.deadZone ? inBand : !inBand) return false;
    // Dead-zone mode ramps from the BOX edge (continuous at the crossing);
    // the original mode ramps from screen centre (its own tested contract).
    const nx = this.deadZone
      ? rampFromEdge(pointerX, this.bandLeft, this.bandRight, 0, this.viewWidth)
      : clamp((pointerX - this.viewWidth / 2) / (this.viewWidth / 2), -1, 1);
    const ny = this.deadZone
      ? rampFromEdge(pointerY, this.bandTop, this.bandBottom, 0, this.viewHeight)
      : clamp((pointerY - this.viewHeight / 2) / (this.viewHeight / 2), -1, 1);
    // Pointer right -> the view looks right -> the image shifts left to reveal
    // more of its right side.
    this._targetX = -nx * this._maxX;
    this._targetY = -ny * this._maxY;
    return true;
  }

  /**
   * Advance the eased offset by one frame.
   *
   * `instant` is the reduced-motion path: the offset snaps to the target, so the
   * pan still works and simply does not animate.
   */
  step(deltaMs: number, instant = false): void {
    if (instant) {
      this._offsetX = this._targetX;
      this._offsetY = this._targetY;
      return;
    }
    this._offsetX = easeToward(this._offsetX, this._targetX, deltaMs, this.tau);
    this._offsetY = easeToward(this._offsetY, this._targetY, deltaMs, this.tau);
  }

  /**
   * Where a thing pinned at scene-local `(baseX, baseY)` sits on screen right
   * now. The one formula every panning object shares.
   */
  place(baseX: number, baseY: number): { x: number; y: number } {
    return {
      x: this.viewWidth / 2 + baseX + this._offsetX,
      y: this.viewHeight / 2 + baseY + this._offsetY,
    };
  }

  /**
   * The exact inverse of `place()`: a point the pointer is over right now, back
   * into the scene-local frame that pans with the picture.
   *
   * Authoring needs this. Edit mode reads a drag in CANVAS pixels, but the
   * rect it writes is a fraction of the picture — and the picture has moved
   * under the canvas by `offset` since the pan last eased. Without this
   * inverse, a rect drawn while panned right is stored shifted left, and the
   * "regions are not where I drew them" bug is baked into the data file rather
   * than only the renderer.
   */
  unplace(screenX: number, screenY: number): { baseX: number; baseY: number } {
    return {
      baseX: screenX - this.viewWidth / 2 - this._offsetX,
      baseY: screenY - this.viewHeight / 2 - this._offsetY,
    };
  }
}
