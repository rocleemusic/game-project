/**
 * The real backend: native Phaser 4 filters and particle emitters.
 *
 * NATIVE ONLY. `enable3d` was rejected — it is Phaser 3 and would have pinned
 * the build to the engine this pivot is moving off. Everything below is
 * `camera.filters.internal.*` and `scene.add.particles`, both core Phaser 4.
 *
 * THE DISPOSAL RULE THIS FILE EXISTS TO OBEY. Phaser 4 filters are OPT-IN AND
 * ARE NOT AUTO-RELEASED ON SCENE SHUTDOWN. Nothing reclaims a filter controller
 * when the scene stops; it stays on the camera's list and composites forever.
 * The scrim leak already shipped once in exactly this shape — an accumulating
 * effect that faded the backdrop to black after ten moves — so every resource
 * this file creates is registered with a disposer at the moment it is created:
 *
 *   filter controller -> `filters.internal.remove(controller)`
 *   particle emitter  -> `emitter.destroy()`
 *   expiry timer      -> `timer.remove(false)`
 *   the dot texture   -> `textures.remove(key)` on detach
 *
 * `detach()` runs every disposer, drops the texture and marks the backend
 * inert. It is idempotent. `PhaserVfxBackend.test.ts` drives all of this
 * against a stub scene that counts `filters.internal.add*` against
 * `filters.internal.remove`, emitters created against `destroy()`, and timers
 * created against `remove()`, so the disposal claim is proven about THIS file
 * and not only about the fake.
 *
 * AND THE LIVE COUNT IS CAPPED, NOT MERELY BOUNDED BY THE CAST RATE. Self-expiry
 * plus `detach()` means nothing leaks, but nothing stopped a fast caster
 * compositing several blurs and colour matrices at once either: the ceiling was
 * how quickly a human can cast, which is not a guarantee. `maxConcurrent`
 * (default 3) sheds the OLDEST cue before adding a new controller, so the filter
 * list is bounded by this file. See `DEFAULT_MAX_CONCURRENT`.
 *
 * THE ARITHMETIC IS NOT IN HERE. `cueParam`, `channelScaleMatrix` and the
 * defaults live in `CueTable.ts`, next to `cueColor` and `cueWeight`. The one
 * piece of maths in this folder that ever shipped a player-visible bug was the
 * tint matrix, and it was reachable only through a stub scene; it is now a pure
 * function with its own unit tests, and the no-effect parity test measures the
 * magnitude it produces rather than the JSON that feeds it.
 *
 * IT IMPORTS PHASER FOR TYPES ONLY. Every `Phaser.*` below is in a type
 * position, so the import is `import type` and nothing here executes Phaser at
 * module load. That is what lets the disposal test run under plain node with a
 * stub scene — the leak-critical file gets covered instead of being the one
 * file no test can reach.
 *
 * COLOURS COME FROM THE THEME. `cueColor` resolves a cue's `colorKey` against
 * `ui/theme.ts`, which is contrast-checked. There is no hex literal in this
 * file, including the particle dot's own fill, which is drawn in the theme's
 * `ink` and then tinted per cue. A test greps this folder for hex literals
 * rather than trusting this paragraph.
 *
 * NO FAILURE VOCABULARY. There is no shake, no red flash and no camera punch in
 * here, for any cue, because a no-effect cast is an honest result. The effects
 * available are glow, blur, a colour-matrix tint toward the cue's own theme
 * colour, particles, a looping spritesheet, and a hand-rolled Graphics tail
 * (`vortex`/`trail`) — all of which read as "the world answered", none of
 * which read as "you got it wrong". `tint` deliberately does NOT pump
 * brightness: a full-screen brighten is the flash the cue table forbids anyone
 * from even naming.
 */

import type Phaser from "phaser";
import { COLOR, REDUCED_MOTION } from "../../ui/theme";
import { channelScaleMatrix, clamp01, cueColor, cueParam, cueStringParam } from "./CueTable";
import { isAnchoredKind, type VfxAnchor, type VfxBackend, type VfxCue, type VfxHandle } from "./VfxBackend";

/**
 * The colour every cue falls back to, and the fill the particle dot is drawn
 * in. `ink` is the theme's parchment body colour — the brightest value it
 * carries, so an untinted dot reads at full strength and every cue's own
 * `colorKey` multiplies down from there. Both sides of the `??` are theme
 * values, so no literal can leak in even if `ink` is renamed.
 */
const NEUTRAL: number = cueColor("ink") ?? COLOR.goldNum;

/** `suspend`'s object — a plain grey/tan, so it steps back behind the colour of its own halo. */
const MUTED: number = cueColor("muted") ?? COLOR.goldNum;

/**
 * `burst`'s two fixed spark families — see that section below for why they are
 * fixed rather than derived from a cue's own `colorKey`. Same `?? theme-value`
 * safety pattern as `NEUTRAL`, so neither can resolve to a literal.
 */
const WARM: number = cueColor("vfxEmber") ?? COLOR.emberNum;
const COOL: number = cueColor("success") ?? COLOR.goldNum;
/**
 * `rings`'s note-glyph and star-cloud tint — the prototype's own blue
 * (`0x5fc9ff`), not a substitute. `ui/theme.ts`'s `vfxWisp` was added
 * specifically for this (Roc, 2026-08-22: "why are we changing the colors
 * from the prototype? just use prototype colors") — earlier passes tried
 * `success` and `green`, this theme's closest existing colours, and both
 * still read as a compromise rather than the actual demo. The washed-out-white
 * problem those passes were chasing turned out to be separate — several
 * ADD-blended particles overlapping near the burst origin before they've had
 * room to spread — and is fixed below by giving them more travel room and a
 * touch less starting alpha, not by picking a different hue.
 */
const WISP: number = cueColor("vfxWisp") ?? COLOR.goldNum;
/**
 * `plume`'s two ground rings — a fixed golden accent regardless of the cue's
 * own `colorKey` (`dusk`/`muted`), same fixed-family precedent as `WARM`/
 * `COOL`/`WISP` above. `GOLD_PALE` is the first (higher) ring's brighter
 * "just-fired" moment, `GOLD` the second.
 */
const GOLD: number = cueColor("vfxGold") ?? COLOR.goldNum;
const GOLD_PALE: number = cueColor("vfxGoldPale") ?? COLOR.goldNum;
/** `beacon`'s glow core and ring highlight — the prototype's own pale peach (`0xffd9b3`), not a substitute. See `ui/theme.ts`'s `vfxEmberPale`. */
const EMBER_PALE: number = cueColor("vfxEmberPale") ?? COLOR.emberNum;

/**
 * How many cues may composite at once.
 *
 * Every non-particle cue is one more controller on the camera's filter list, and
 * nothing bounded that list: cues self-expire at 400-1400ms, so the only thing
 * stopping a fast caster from stacking several blurs and colour matrices was the
 * cast rate — a property of the player, not of the code. Three is enough for a
 * cue to overlap the tail of the one before it and not enough to composite into
 * mud. Over the cap the OLDEST cue is stopped, so the newest answer is always
 * the one on screen.
 */
const DEFAULT_MAX_CONCURRENT = 3;

export interface PhaserVfxBackendOptions {
  readonly scene: Phaser.Scene;
  /** Whose filter list screen-wide cues go on. Defaults to the main camera. */
  readonly camera?: Phaser.Cameras.Scene2D.Camera;
  /** Depth for particle emitters, so cues sit above the backdrop. */
  readonly depth?: number;
  /** Hard ceiling on simultaneous cues. Defaults to `DEFAULT_MAX_CONCURRENT`. */
  readonly maxConcurrent?: number;
}

/** Pixels. The particle dot is a 16x16 texture with an 8px circle in it. */
const DOT_RADIUS = 8;

// ---------------------------------------------------------------------------
// `vortex` and `trail` — a per-frame-redrawn Graphics tapered polyline, ported
// from `tools/vfx-prototypes/vortex-demo.html` and `fetch-demo.html`. Both
// prototypes were tuned live against Roc's own screenshots (see
// `plans/_handoffs/2026-08-22-vfx-prototype-batch-handoff.md`) at full-canvas
// scale (500x560); the timing constants below are ported as-authored, but the
// SPATIAL ones (radius, climb height, offsets, stroke widths) are scaled down
// to a per-cast anchored point effect — the game's existing anchored cues
// (`particles`) sit in the tens-of-pixels range, not hundreds. Unverified
// beyond that scaling; check a real playtest screenshot before treating the
// spatial numbers as final.
// ---------------------------------------------------------------------------

const VORTEX_STRANDS = 10;
const VORTEX_GROW_MS = 1400;
const VORTEX_HOLD_MS = 750;
const VORTEX_FADE_MS = 550;
const VORTEX_PER_STRAND_MS = VORTEX_GROW_MS + VORTEX_HOLD_MS + VORTEX_FADE_MS;
const VORTEX_STAGGER_MS = 150;
const VORTEX_TAIL_FRACTION = 0.5;
const VORTEX_PHASE_SPEED = 0.013;
const VORTEX_HEAD_GAP = 0.05;
const VORTEX_SHRINK_FROM = 0.7;
const VORTEX_TWISTS = 2.4;
const VORTEX_CLIMB = 120;
const VORTEX_MAX_RADIUS = 38;
const VORTEX_MIN_RADIUS = 10;
const VORTEX_WOBBLE = 2;
const VORTEX_HEAD_RADIUS = 3;
/**
 * The full choreography's length — strands launch in staggered CW/CCW pairs,
 * so the last pair starts `(ceil(STRANDS/2)-1)` stagger-steps in. `breath`'s
 * cue rows in cues.json must set `durationMs` to exactly this, or the cue's
 * own self-expiry timer (in `play()`, generic across every kind) cuts the
 * last strand off mid-fade.
 */
export const VORTEX_CYCLE_MS = (Math.ceil(VORTEX_STRANDS / 2) - 1) * VORTEX_STAGGER_MS + VORTEX_PER_STRAND_MS;

const TRAIL_TRAVEL_MS = 550;
const TRAIL_TAIL_MS = 200;
const TRAIL_HEAD_FRACTION = 0.2;
/** Where the pulled object starts, relative to the anchor (the hand it lands in). */
const TRAIL_FROM_OFFSET = { x: -90, y: -75 };
const TRAIL_ARRIVAL_MS = 400;
/** Travel plus the arrival flourish's fade. `fetch`'s rows must set `durationMs` to at least this. */
export const TRAIL_CYCLE_MS = TRAIL_TRAVEL_MS + TRAIL_ARRIVAL_MS;

function cubicIn(t: number): number {
  return t * t * t;
}

/**
 * One strand of the vortex, at time `elapsedMs` since the cue started.
 * `tick` is a per-frame counter (not a duration) driving the spin — the
 * prototype advances its `phase` accumulator once per redraw, not once per
 * elapsed millisecond, and this ports that exactly.
 */
function drawVortex(
  g: Phaser.GameObjects.Graphics,
  elapsedMs: number,
  anchor: VfxAnchor,
  color: number,
  tick: number,
): void {
  const phase = tick * VORTEX_PHASE_SPEED;
  for (let s = 0; s < VORTEX_STRANDS; s++) {
    const elapsed = elapsedMs - Math.floor(s / 2) * VORTEX_STAGGER_MS;
    if (elapsed < 0 || elapsed > VORTEX_PER_STRAND_MS) continue;

    let growT: number;
    let envelopeAlpha: number;
    if (elapsed <= VORTEX_GROW_MS) {
      growT = elapsed / VORTEX_GROW_MS;
      envelopeAlpha = 1;
    } else if (elapsed <= VORTEX_GROW_MS + VORTEX_HOLD_MS) {
      growT = 1;
      envelopeAlpha = 1;
    } else {
      growT = 1;
      envelopeAlpha = 1 - (elapsed - VORTEX_GROW_MS - VORTEX_HOLD_MS) / VORTEX_FADE_MS;
    }
    const growEase = 1 - Math.pow(1 - growT, 3);
    const strandOffset = (s / VORTEX_STRANDS) * Math.PI * 2;
    // Alternating strands spin the opposite way, so they cross through each
    // other's paths instead of being rotated copies of one curve.
    const dir = s % 2 === 0 ? 1 : -1;

    const pointAt = (t: number) => {
      const radius = VORTEX_MIN_RADIUS + (VORTEX_MAX_RADIUS - VORTEX_MIN_RADIUS) * Math.pow(t, 0.65);
      const angle = strandOffset + dir * (phase * (1 + t * 0.6) + t * VORTEX_TWISTS * Math.PI * 2);
      const wobble = Math.sin(t * 14 + phase * 3) * VORTEX_WOBBLE * (1 - t * 0.5);
      return { x: anchor.x + Math.cos(angle) * (radius + wobble), y: anchor.y - t * VORTEX_CLIMB, t };
    };

    // A constant-length tail with a real gap between its end and the leading
    // particle, and a whole-tail fade once the CLIMB (not the strand's whole
    // life) passes SHRINK_FROM, reaching invisible right as the particle
    // arrives at the top. Gated to `growT < 1`: `growEase` freezes at 1 the
    // instant GROW_MS elapses (both later branches above pin `growT` to 1), so
    // an ungated check here would hold `arrivalFade` at a permanent 0 for the
    // rest of the strand's life — silently cancelling `envelopeAlpha`'s own
    // (already-correct) hold/fade envelope and making the tail invisible for
    // HOLD_MS+FADE_MS. Confirmed on a real playtest screenshot: solid at
    // elapsed=1000ms, gone by elapsed=1400ms (exactly where GROW_MS ends) and
    // still gone at 2600ms. Ported as-authored from vortex-demo.html, where the
    // bug is real but never surfaces — ten strands loop forever there, so no
    // single cast is ever isolated the way one cue play is here.
    const tailEnd = Math.max(0, growEase - VORTEX_HEAD_GAP);
    const tailStart = Math.max(0, tailEnd - VORTEX_TAIL_FRACTION);
    const tailSpan = Math.max(0.0001, tailEnd - tailStart);
    let arrivalFade = 1;
    if (growT < 1 && growEase > VORTEX_SHRINK_FROM) {
      arrivalFade = 1 - (growEase - VORTEX_SHRINK_FROM) / (1 - VORTEX_SHRINK_FROM);
    }

    const SAMPLES = 32;
    const iStart = Math.max(0, Math.round(SAMPLES * tailStart));
    const iEnd = Math.max(iStart, Math.round(SAMPLES * tailEnd));
    for (let i = iStart + 1; i <= iEnd; i++) {
      const a = pointAt((i - 1) / SAMPLES);
      const b = pointAt(i / SAMPLES);
      const alongTail = Math.max(0, Math.min(1, (b.t - tailStart) / tailSpan));
      const localAlpha = alongTail * arrivalFade * envelopeAlpha;
      if (localAlpha <= 0) continue;
      const coreW = 3 - b.t * 3;
      const glowW = coreW + 3;
      g.lineStyle(glowW, color, 0.32 * localAlpha);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.strokePath();
      g.lineStyle(coreW, NEUTRAL, 0.9 * localAlpha);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.strokePath();
    }

    // The leading particle — a soft glow at the growing tip, only while still
    // growing, positioned at the true tip so the gap to the tail is real.
    if (growT < 1) {
      const tip = pointAt(growEase);
      const headAlpha = envelopeAlpha * (0.6 + 0.4 * Math.sin(phase * 6));
      const r = VORTEX_HEAD_RADIUS;
      g.fillStyle(color, headAlpha * 0.18);
      g.fillCircle(tip.x, tip.y, r);
      g.fillStyle(color, headAlpha * 0.3);
      g.fillCircle(tip.x, tip.y, r * 0.65);
      g.fillStyle(NEUTRAL, headAlpha * 0.45);
      g.fillCircle(tip.x, tip.y, r * 0.4);
      g.fillStyle(NEUTRAL, headAlpha * 0.9);
      g.fillCircle(tip.x, tip.y, r * 0.18);
    }
  }
}

/**
 * The pulled object's tail, at time `elapsedMs` since the cue started. Pure
 * function of time — no history buffer — so a `moveTo` re-anchor mid-flight
 * can never leave stale points sampled against the old anchor: the tail is
 * always resampled fresh from the CURRENT anchor and offset every frame.
 */
function drawTrail(g: Phaser.GameObjects.Graphics, elapsedMs: number, anchor: VfxAnchor, color: number): void {
  const to = anchor;
  const from = { x: anchor.x + TRAIL_FROM_OFFSET.x, y: anchor.y + TRAIL_FROM_OFFSET.y };
  const posAt = (ms: number) => {
    const t = cubicIn(Math.min(1, Math.max(0, ms / TRAIL_TRAVEL_MS)));
    return { x: from.x + (to.x - from.x) * t, y: from.y + (to.y - from.y) * t };
  };

  if (elapsedMs <= TRAIL_TRAVEL_MS + TRAIL_TAIL_MS) {
    // Sample backward across the tail window, entirely as a function of
    // elapsed time — the technique that replaced a real streak-particle trail
    // twice tried and rejected as "crossed rectangles" (see the handoff).
    const SAMPLES = 24;
    const pts: { x: number; y: number; ageFrac: number }[] = [];
    for (let i = 0; i <= SAMPLES; i++) {
      const sampleMs = elapsedMs - (TRAIL_TAIL_MS * i) / SAMPLES;
      if (sampleMs < 0 || sampleMs > TRAIL_TRAVEL_MS) continue;
      const ageFrac = Math.min(1, Math.max(0, (elapsedMs - sampleMs) / TRAIL_TAIL_MS));
      pts.push({ ...posAt(sampleMs), ageFrac });
    }
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      const alpha = 1 - b.ageFrac;
      if (alpha <= 0) continue;
      // White-hot only in the leading slice of the tail, the cue's own colour
      // for the rest — pulled off a real asset's colour-over-lifetime timing
      // (see the handoff); easing white across the whole tail read as "too
      // white" once several segments overlapped under additive blending.
      const headShade = b.ageFrac < TRAIL_HEAD_FRACTION;
      const coreW = 3 - b.ageFrac * 2.3;
      const glowW = coreW + 3;
      g.lineStyle(glowW, color, 0.28 * alpha);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.strokePath();
      g.lineStyle(coreW, headShade ? NEUTRAL : color, 0.9 * alpha);
      g.beginPath();
      g.moveTo(a.x, a.y);
      g.lineTo(b.x, b.y);
      g.strokePath();
    }
  }

  if (elapsedMs <= TRAIL_TRAVEL_MS) {
    const head = posAt(elapsedMs);
    g.fillStyle(color, 0.25);
    g.fillCircle(head.x, head.y, 6);
    g.fillStyle(color, 0.4);
    g.fillCircle(head.x, head.y, 4);
    g.fillStyle(NEUTRAL, 0.9);
    g.fillCircle(head.x, head.y, 2);
  }

  // The arrival flourish — an expanding, fading ring at the anchor once the
  // pull completes. Drawn with the same Graphics object rather than a second
  // particle emitter, so one cue stays exactly one disposable resource.
  if (elapsedMs > TRAIL_TRAVEL_MS && elapsedMs <= TRAIL_TRAVEL_MS + TRAIL_ARRIVAL_MS) {
    const burstT = (elapsedMs - TRAIL_TRAVEL_MS) / TRAIL_ARRIVAL_MS;
    const burstAlpha = 1 - burstT;
    g.lineStyle(2, color, 0.5 * burstAlpha);
    g.strokeCircle(to.x, to.y, 4 + burstT * 14);
    g.fillStyle(NEUTRAL, 0.9 * Math.max(0, 1 - burstT * 1.5));
    g.fillCircle(to.x, to.y, 3 * (1 - burstT));
  }
}

// ---------------------------------------------------------------------------
// `suspend` — a continuous rise/hold/lower STATE (weigh), ported from
// `tools/vfx-prototypes/weigh-demo.html`. Same per-frame Graphics technique as
// `vortex`/`trail`, and same spatial-scaling caveat: the prototype's numbers
// were tuned at full-canvas scale (400x360); spatial constants below are
// scaled to a per-cast anchored point effect and unverified beyond that until
// a real playtest screenshot confirms them — Roc's own handoff already flagged
// weigh as "worth a second look before committing exact numbers."
// ---------------------------------------------------------------------------

const SUSPEND_RISE_MS = 550;
const SUSPEND_HOLD_MS = 1500;
const SUSPEND_LOWER_MS = 480;
export const SUSPEND_CYCLE_MS = SUSPEND_RISE_MS + SUSPEND_HOLD_MS + SUSPEND_LOWER_MS;

const SUSPEND_RISE_HEIGHT = 42;
const SUSPEND_RING1 = { rx: 14, ry: 4.5 };
const SUSPEND_RING2 = { rx: 10, ry: 6 };
const SUSPEND_MOTE_COUNT = 4;
const SUSPEND_MOTE_ORBIT_BASE = 10;
const SUSPEND_MOTE_ORBIT_ALT = 4;
const SUSPEND_OBJECT_W = 16;
const SUSPEND_OBJECT_H = 11;
const SUSPEND_GROUND_GLOW = { w: 22, h: 5 };
const SUSPEND_HALO_SPEED = 0.02;

function easeBackOut(t: number, overshoot: number): number {
  const c = overshoot;
  const x = t - 1;
  return 1 + (c + 1) * x * x * x + c * x * x;
}

function easeCubicIn(t: number): number {
  return t * t * t;
}

function strokeRotatedEllipse(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  angle: number,
): void {
  const SEG = 24;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  g.beginPath();
  for (let i = 0; i <= SEG; i++) {
    const t = (i / SEG) * Math.PI * 2;
    const ex = Math.cos(t) * rx;
    const ey = Math.sin(t) * ry;
    const x = cx + ex * cos - ey * sin;
    const y = cy + ex * sin + ey * cos;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.strokePath();
}

/** A four-point star — the "knot of light" shape shared by `suspend`'s motes. */
function fillStar(
  g: Phaser.GameObjects.Graphics,
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  rotation: number,
): void {
  const points = 4;
  g.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const ang = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2 + rotation;
    const r = i % 2 === 0 ? outerR : innerR;
    const x = cx + Math.cos(ang) * r;
    const y = cy + Math.sin(ang) * r;
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();
}

/**
 * The object's height and the halo's strength (`suspend`, 0..1) at time
 * `elapsedMs`. `suspend` drives every layer's alpha — 0 flat on the ground, 1
 * fully hanging — same role `this.suspend` plays in the prototype.
 */
function suspendStateAt(elapsedMs: number): { y: number; suspend: number } {
  if (elapsedMs <= SUSPEND_RISE_MS) {
    const t = Math.min(1, elapsedMs / SUSPEND_RISE_MS);
    const eased = easeBackOut(t, 1.4);
    return { y: -SUSPEND_RISE_HEIGHT * eased, suspend: t };
  }
  if (elapsedMs <= SUSPEND_RISE_MS + SUSPEND_HOLD_MS) {
    return { y: -SUSPEND_RISE_HEIGHT, suspend: 1 };
  }
  const t = Math.min(1, (elapsedMs - SUSPEND_RISE_MS - SUSPEND_HOLD_MS) / SUSPEND_LOWER_MS);
  return { y: -SUSPEND_RISE_HEIGHT * (1 - easeCubicIn(t)), suspend: 1 - t };
}

function drawSuspend(g: Phaser.GameObjects.Graphics, elapsedMs: number, anchor: VfxAnchor, color: number, tick: number): void {
  const { y: dy, suspend: s } = suspendStateAt(elapsedMs);
  const objY = anchor.y + dy;
  const haloAngle = tick * SUSPEND_HALO_SPEED;

  // The object itself — grey, at reduced opacity, so it steps back behind the
  // halo instead of competing with it for attention (Roc, 2026-08-22: the
  // object at full-strength NEUTRAL read as brighter than the rings and stole
  // focus from the actual magic). `ink`'s the theme's near-white; `muted` is
  // its plain grey/tan counterpart, which is the point here.
  g.fillStyle(MUTED, 0.7);
  g.fillRoundedRect(anchor.x - SUSPEND_OBJECT_W / 2, objY - SUSPEND_OBJECT_H / 2, SUSPEND_OBJECT_W, SUSPEND_OBJECT_H, 2);

  if (s <= 0.02) return;

  // Ground glow pool — marks the spot it left, not following it up.
  g.fillStyle(color, 0.18 * s);
  g.fillEllipse(anchor.x, anchor.y + 4, SUSPEND_GROUND_GLOW.w, SUSPEND_GROUND_GLOW.h);

  // Two crossed, counter-rotating rings, each a soft glow underlay plus a
  // brighter core stroke — both in the cue's own colour (not NEUTRAL for the
  // core, unlike vortex/trail's tails): the object above is ALSO drawn in
  // NEUTRAL, and a neutral ring core reads as the same colour as the object
  // right where the ring passes closest to it, the one place contrast matters
  // most. Kept the two-layer look (wide+dim vs narrow+bright) by varying width
  // and alpha instead of hue.
  g.lineStyle(3, color, 0.16 * s);
  strokeRotatedEllipse(g, anchor.x, objY, SUSPEND_RING1.rx, SUSPEND_RING1.ry, haloAngle);
  g.lineStyle(1, color, 0.75 * s);
  strokeRotatedEllipse(g, anchor.x, objY, SUSPEND_RING1.rx, SUSPEND_RING1.ry, haloAngle);

  g.lineStyle(2.5, color, 0.13 * s);
  strokeRotatedEllipse(g, anchor.x, objY, SUSPEND_RING2.rx, SUSPEND_RING2.ry, -haloAngle * 1.3 + 1.2);
  g.lineStyle(0.8, color, 0.65 * s);
  strokeRotatedEllipse(g, anchor.x, objY, SUSPEND_RING2.rx, SUSPEND_RING2.ry, -haloAngle * 1.3 + 1.2);

  // Orbiting motes — twinkling stars on a flattened-ellipse orbit (fakes
  // depth), each with its own shimmer phase so they don't pulse in lockstep.
  for (let i = 0; i < SUSPEND_MOTE_COUNT; i++) {
    const a = haloAngle * 1.6 + (i / SUSPEND_MOTE_COUNT) * Math.PI * 2;
    const orbitR = SUSPEND_MOTE_ORBIT_BASE + (i % 2) * SUSPEND_MOTE_ORBIT_ALT;
    const mx = anchor.x + Math.cos(a) * orbitR;
    const my = objY + Math.sin(a) * orbitR * 0.28;
    const shimmer = 0.55 + 0.45 * Math.sin(haloAngle * 3 + i * 1.7);
    const moteScale = (0.6 + (i % 3) * 0.15) * shimmer;
    g.fillStyle(NEUTRAL, 0.22 * s * shimmer);
    g.fillCircle(mx, my, 2 * moteScale);
    g.fillStyle(color, 0.9 * s * shimmer);
    fillStar(g, mx, my, 1.1 * moteScale, 0.4 * moteScale, haloAngle * 2 + i);
  }
}

/**
 * `vortex`, `trail` and `suspend`'s shared resource shape: one Graphics
 * object, one repeating timer, released together. Draw logic is a pure
 * function of elapsed time (plus a tick counter for spin), so there is no
 * per-instance history buffer to leak or to desync from a re-anchor.
 */
class GraphicsFx {
  private readonly graphics: Phaser.GameObjects.Graphics;
  private readonly timer: Phaser.Time.TimerEvent;
  private readonly startedAt: number;
  private anchor: VfxAnchor;
  private tick = 0;

  constructor(
    scene: Phaser.Scene,
    depth: number,
    anchor: VfxAnchor,
    private readonly color: number,
    private readonly draw: (g: Phaser.GameObjects.Graphics, elapsedMs: number, anchor: VfxAnchor, color: number, tick: number) => void,
  ) {
    this.anchor = anchor;
    this.graphics = scene.add.graphics();
    this.graphics.setBlendMode("ADD");
    this.graphics.setDepth(depth);
    this.startedAt = scene.time.now;
    this.timer = scene.time.addEvent({
      delay: 16,
      loop: true,
      callback: () => {
        this.tick++;
        const elapsed = scene.time.now - this.startedAt;
        this.graphics.clear();
        this.draw(this.graphics, elapsed, this.anchor, this.color, this.tick);
      },
    });
  }

  setPosition(x: number, y: number): void {
    this.anchor = { x, y };
  }

  destroy(): void {
    this.timer.remove(false);
    this.graphics.destroy();
  }
}

// ---------------------------------------------------------------------------
// `burst` — scratch's flash + ring + spark shower, ported from
// `tools/vfx-prototypes/scratch-demo.html`. Real particle emitters, not
// Graphics: the sparks need Phaser's own speed/scale/lifespan VARIANCE, which
// would be its own hand-rolled simulation to fake with a per-frame redraw.
//
// Roc call 2026-08-23: the prototype's second spark family — elongated
// "streak" sparks — is REMOVED, not fixed. Those needed the prototype's
// custom `StreakParticle` (rotates each streak to face its own velocity),
// which needed a runtime `Phaser.GameObjects.Particles.Particle` subclass —
// dropped when this was first ported, since this file imports Phaser for
// TYPES ONLY (see the file header) and a runtime subclass would break that.
// The result was elongated bars exploding in a full 0-360° spread but always
// rendered at a single fixed orientation, correct for none of them and
// visibly wrong for most — noticed here, on the shipped spell, once a
// near-identical bug was caught and fixed properly on `eruption` (see that
// section — Phaser evaluates a particle's `rotate` BEFORE its `angle` on
// spawn, so the two can be forced to agree without a subclass). Rather than
// carry that fix backward onto an already-approved spell, the simpler call:
// the round warm sparks alone already read as a real burst; drop the streak
// layer instead of re-deriving its geometry now.
//
// COLOUR. The prototype hardcodes a violet ring and warm amber/gold round
// sparks, not as the effect/no-effect signal (that requirement was relaxed
// 2026-08-22; see CueTable.ts's header). Every colour still has to come from
// `ui/theme.ts`: the ring takes the cue's own resolved colour (the closest
// analogue to what every other kind's `color` means), the round sparks use
// `vfxEmber` (`WARM`, the theme's own warm spell-VFX family — a close match
// for the prototype's amber/gold).
// ---------------------------------------------------------------------------

const BURST_FLASH_MS = 240;
const BURST_RING_MS = 480;
const BURST_ROUND_MS = 700;
/** The longest-lived layer — `cue.durationMs` for a `burst` row must be at least this. */
export const BURST_CYCLE_MS = BURST_ROUND_MS;
const BURST_RING_MAX_R = 26;

interface BurstFxHandle {
  destroy(): void;
  setPosition(x: number, y: number): void;
}

function buildBurstFx(
  scene: Phaser.Scene,
  depth: number,
  dotKey: string,
  anchor: VfxAnchor,
  color: number,
): BurstFxHandle {
  const disposers: (() => void)[] = [];
  const pos = { x: anchor.x, y: anchor.y };

  // Layer 1: a quick bright flash at the touch point.
  const flash = scene.add.particles(pos.x, pos.y, dotKey, {
    lifespan: 200,
    speed: 0,
    scale: { start: 2.4, end: 0 },
    alpha: { start: 0.9, end: 0 },
    tint: NEUTRAL,
    blendMode: "ADD",
    emitting: false,
  });
  flash.setDepth(depth);
  flash.explode(1);
  const flashTimer = scene.time.delayedCall(BURST_FLASH_MS, () => flash.destroy());
  disposers.push(() => {
    flash.destroy();
    flashTimer.remove(false);
  });

  // Layer 2: a small expanding, fading ring — a Graphics tween, not an emitter.
  const ringG = scene.add.graphics();
  ringG.setBlendMode("ADD");
  ringG.setDepth(depth);
  const ring = { r: 3, alpha: 0.65 };
  const ringTween = scene.tweens.add({
    targets: ring,
    r: BURST_RING_MAX_R,
    alpha: 0,
    duration: BURST_RING_MS,
    ease: "Cubic.easeOut",
    onUpdate: () => {
      ringG.clear();
      ringG.lineStyle(2.5, color, ring.alpha);
      ringG.strokeCircle(pos.x, pos.y, ring.r);
    },
    onComplete: () => ringG.clear(),
  });
  disposers.push(() => {
    ringTween.stop();
    ringG.destroy();
  });

  // Layer 3a: round sparks, warm family — varied size via Phaser's own range.
  const round = scene.add.particles(pos.x, pos.y, dotKey, {
    lifespan: { min: 360, max: 620 },
    speed: { min: 30, max: 85 },
    angle: { min: 0, max: 360 },
    // Nested {min,max} under scale.start silently fails — see
    // dev-notes/phaser4-nested-minmax-under-scale-start-silently-fails.md
    scale: { start: 0.85, end: 0, random: true },
    alpha: { start: 0.9, end: 0 },
    tint: WARM,
    blendMode: "ADD",
    emitting: false,
  });
  round.setDepth(depth);
  round.explode(12);
  const roundTimer = scene.time.delayedCall(BURST_ROUND_MS, () => round.destroy());
  disposers.push(() => {
    round.destroy();
    roundTimer.remove(false);
  });

  return {
    destroy() {
      for (const dispose of disposers.splice(0)) dispose();
    },
    setPosition(x: number, y: number) {
      pos.x = x;
      pos.y = y;
      flash.setPosition(x, y);
      round.setPosition(x, y);
    },
  };
}

// ---------------------------------------------------------------------------
// `pop` — portion's staggered identical measures, ported from
// `tools/vfx-prototypes/portion-demo.html`. Each orb is drawn into its own
// Graphics object ONCE, then its position/scale/angle/alpha are TWEENED —
// Phaser's own tween engine interpolates a GameObject's transform directly,
// so unlike `vortex`/`trail`/`suspend` this needs no per-frame redraw code.
//
// COLOUR follows the same core/glow split every other kind here uses: the
// star core and its satellites are NEUTRAL (ink), the soft glow behind them
// is the cue's own resolved colour.
// ---------------------------------------------------------------------------

const POP_MEASURE_COUNT = 4;
const POP_RISE = 45;
const POP_SPACING = 24;
const POP_STAGGER_MS = 70;
const POP_MS = 320;
const POP_HOLD_MS = 500;
const POP_FADE_MS = 260;
const POP_PULSE_MS = 260;
/** `cue.durationMs` for a `pop` row must be at least this. */
export const POP_CYCLE_MS = (POP_MEASURE_COUNT - 1) * POP_STAGGER_MS + POP_MS + POP_HOLD_MS + POP_FADE_MS;

const POP_ORB_OUTER_R = 6;
const POP_ORB_INNER_R = 4;
const POP_STAR_OUTER = 2.3;
const POP_STAR_INNER = 0.8;
const POP_SATELLITES: ReadonlyArray<{ a: number; r: number; outer: number }> = [
  { a: 0.3, r: 4, outer: 1.1 },
  { a: 2.5, r: 3, outer: 0.9 },
  { a: 4.4, r: 4, outer: 1.1 },
];

/** Draws one orb at its Graphics object's local origin — called once, never redrawn. */
function drawPopOrb(g: Phaser.GameObjects.Graphics, color: number): void {
  g.fillStyle(color, 0.2);
  g.fillCircle(0, 0, POP_ORB_OUTER_R);
  g.fillStyle(color, 0.38);
  g.fillCircle(0, 0, POP_ORB_INNER_R);
  g.fillStyle(NEUTRAL, 0.95);
  fillStar(g, 0, 0, POP_STAR_OUTER, POP_STAR_INNER, 0);
  for (const sat of POP_SATELLITES) {
    const sx = Math.cos(sat.a) * sat.r;
    const sy = Math.sin(sat.a) * sat.r;
    g.fillStyle(NEUTRAL, 0.85);
    fillStar(g, sx, sy, sat.outer, sat.outer * 0.35, 0);
  }
}

function buildPopFx(scene: Phaser.Scene, depth: number, anchor: VfxAnchor, color: number): BurstFxHandle {
  const disposers: (() => void)[] = [];

  // The pulse ring at the source — the moment of division. Same
  // Graphics-tween technique as `burst`'s ring.
  const ringG = scene.add.graphics();
  ringG.setBlendMode("ADD");
  ringG.setDepth(depth);
  const ring = { r: 2, alpha: 0.55 };
  const ringTween = scene.tweens.add({
    targets: ring,
    r: 8,
    alpha: 0,
    duration: POP_PULSE_MS,
    ease: "Cubic.easeOut",
    onUpdate: () => {
      ringG.clear();
      ringG.lineStyle(1.5, color, ring.alpha);
      ringG.strokeCircle(anchor.x, anchor.y, ring.r);
    },
    onComplete: () => ringG.clear(),
  });
  disposers.push(() => {
    ringTween.stop();
    ringG.destroy();
  });

  const orbs: Phaser.GameObjects.Graphics[] = [];
  for (let i = 0; i < POP_MEASURE_COUNT; i++) {
    const orb = scene.add.graphics();
    orb.setBlendMode("ADD");
    orb.setDepth(depth);
    drawPopOrb(orb, color);
    orb.setPosition(anchor.x, anchor.y);
    orb.setScale(0);
    orbs.push(orb);

    const tx = anchor.x + (i - (POP_MEASURE_COUNT - 1) / 2) * POP_SPACING;
    const ty = anchor.y - POP_RISE;
    const delay = i * POP_STAGGER_MS;

    // One orb's own resources, disposed in this order — tweens stopped before
    // the Graphics object they target is destroyed — regardless of how far
    // through its life the orb got before an early stop.
    const orbDisposers: (() => void)[] = [];
    const moveTween = scene.tweens.add({ targets: orb, x: tx, y: ty, duration: POP_MS, delay, ease: "Cubic.easeOut" });
    orbDisposers.push(() => moveTween.stop());
    const popTween = scene.tweens.add({
      targets: orb,
      scale: 1,
      duration: POP_MS * 0.7,
      delay,
      ease: "Back.easeOut",
      onComplete: () => {
        // A slow continuous spin plus a gentle breathing pulse while it
        // holds — the shimmer that sells "magic," not a static shape.
        const spinTween = scene.tweens.add({ targets: orb, angle: 360, duration: 2600, repeat: -1 });
        const breatheTween = scene.tweens.add({
          targets: orb,
          scale: 1.12,
          duration: 420,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });
        orbDisposers.push(() => {
          spinTween.stop();
          breatheTween.stop();
        });
      },
    });
    orbDisposers.push(() => popTween.stop());
    orbDisposers.push(() => orb.destroy());
    disposers.push(() => {
      for (const dispose of orbDisposers.splice(0)) dispose();
    });
  }

  // Every measure holds, then ALL fade together — simultaneous, not
  // staggered, because the measures are equal, not a sequence.
  const lastPopEnd = (POP_MEASURE_COUNT - 1) * POP_STAGGER_MS + POP_MS;
  const fadeTimer = scene.time.delayedCall(lastPopEnd + POP_HOLD_MS, () => {
    const fadeTween = scene.tweens.add({
      targets: orbs,
      alpha: 0,
      duration: POP_FADE_MS,
      ease: "Quad.easeIn",
      onComplete: () => orbs.forEach((o) => o.destroy()),
    });
    disposers.push(() => fadeTween.stop());
  });
  disposers.push(() => fadeTimer.remove(false));

  return {
    destroy() {
      for (const dispose of disposers.splice(0)) dispose();
    },
    setPosition() {
      // Best-effort: matches `burst`'s already-exploded particle layers —
      // orbs already mid-tween keep their own targets rather than snapping to
      // a new anchor, the same "re-anchor moves future emission, not what's
      // already in flight" rule `emit()` follows.
    },
  };
}

// ---------------------------------------------------------------------------
// `rings` — the ALTERNATE echo, ported from `tools/vfx-prototypes/echo-demo.html`.
// Named for the technique, not the spell (see VfxBackend.ts's header): "echo"
// is also the spell id this was built for, and this file names no spell. The
// shipped `echo` cue stays on `sprite`/`vfx_echo_ripple` (nothing here touches
// that row without Roc explicitly choosing this over it) — this kind exists so
// the alternate is real and playable, not just a prototype file.
//
// SHAPE. Three staggered, flattened-ellipse rings (an "echo" is the same event
// repeated, delayed, fainter, not a single ripple), each a Graphics
// grow-then-fade tween, plus a bright flash on the first ring only. Ring 0 is
// then followed by two secondary particle bursts on real particle emitters — a
// handful of procedural note glyphs, then a denser wispy star cloud — and every
// ring also launches a small burst of diamond motes, its own quieter "echo" of
// the ring event.
//
// COLOUR. The rings/diamonds resolve through two colours: ring 0 and the
// diamonds' pale half are NEUTRAL, everything else is the cue's own resolved
// colour. The note-glyph and star-cloud layers are hardcoded to a LITERAL
// blue in the prototype (`0x5fc9ff`, `0x5fd8ea`, `0x006680`) — no hex literal
// belongs in this file regardless, so they take `WISP` (`success`, the
// nearest cool key this theme has — same substitute `burst` uses for its cool
// spark family, for consistency). NEUTRAL was tried here first and reverted
// (Roc, 2026-08-22): tinting an entire single-texture particle NEUTRAL washes
// it to near-white — that pairing only works as a bright INNER layer next to
// a colour-carrying OUTER layer in the SAME primitive, which a note/star
// particle sprite does not have. Same colour on both layers, `WISP`, so they
// read as a distinct cool accent instead of losing their colour entirely.
//
// DROPPED FROM THE PROTOTYPE. `echoBurst.alive.forEach(p => p.velocityY *=
// RING_SQUASH)` — squashing each diamond's vertical velocity AFTER `explode()`
// to fake a ground-plane spread — reaches into a live particle's mutable
// physics state post-emission, a pattern nothing else in this file uses and
// which is awkward to prove disposal-safe. Diamonds explode in a full circle
// instead of a squashed one; a real, minor, deliberate simplification.
// ---------------------------------------------------------------------------

const RINGS_COUNT = 3;
const RINGS_STAGGER_MS = 140;
const RINGS_GROW_MS = 420;
const RINGS_MAX_R = 42;
/** Flattens the rings into ground-plane ellipses rather than camera-facing circles — a deliberate Roc call, kept. */
const RINGS_SQUASH = 0.4;
const RINGS_FLASH_MS = 220;
const RINGS_NOTE_DELAY_MS = 380;
const RINGS_NOTE_LIFE_MS = 800;
const RINGS_STAR_DELAY_MS = 380 + 150;
const RINGS_STAR_LIFE_MS = 1300;
const RINGS_DIAMOND_DELAY_MS = 160;
const RINGS_DIAMOND_LIFE_MS = 550;
/** The longest-lived layer (the star cloud, on the first ring) — `cue.durationMs` for an `echo` row must be at least this. */
export const RINGS_CYCLE_MS = (RINGS_COUNT - 1) * RINGS_STAGGER_MS + RINGS_STAR_DELAY_MS + RINGS_STAR_LIFE_MS;

function drawStarShape(g: Phaser.GameObjects.Graphics, cx: number, cy: number, outerR: number, innerR: number): void {
  fillStar(g, cx, cy, outerR, innerR, 0);
}

function drawDiamondShape(g: Phaser.GameObjects.Graphics, cx: number, cy: number, w: number, h: number): void {
  g.beginPath();
  g.moveTo(cx, cy - h / 2);
  g.lineTo(cx + w / 2, cy);
  g.lineTo(cx, cy + h / 2);
  g.lineTo(cx - w / 2, cy);
  g.closePath();
  g.fillPath();
}

/** A simple filled eighth-note — tilted oval notehead, stem, curved flag. */
function drawNoteShape(g: Phaser.GameObjects.Graphics, cx: number, cy: number, size: number): void {
  const headRx = size * 0.38;
  const headRy = size * 0.28;
  const tilt = -0.35;
  const headCx = cx - size * 0.1;
  const headCy = cy + size * 0.5;
  const SEG = 16;
  g.beginPath();
  for (let i = 0; i <= SEG; i++) {
    const t = (i / SEG) * Math.PI * 2;
    const ex = Math.cos(t) * headRx;
    const ey = Math.sin(t) * headRy;
    const x = headCx + ex * Math.cos(tilt) - ey * Math.sin(tilt);
    const y = headCy + ex * Math.sin(tilt) + ey * Math.cos(tilt);
    if (i === 0) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  g.closePath();
  g.fillPath();

  const stemX = headCx + headRx * 0.85;
  const stemTopY = cy - size * 0.55;
  g.fillRect(stemX - size * 0.05, stemTopY, size * 0.1, headCy - stemTopY);

  g.beginPath();
  g.moveTo(stemX, stemTopY);
  g.lineTo(stemX + size * 0.36, stemTopY + size * 0.2);
  g.lineTo(stemX + size * 0.22, stemTopY + size * 0.68);
  g.lineTo(stemX, stemTopY + size * 0.52);
  g.closePath();
  g.fillPath();
}

interface RingsTextureKeys {
  readonly dotKey: string;
  readonly starKey: string;
  readonly diamondKey: string;
  readonly noteKey: string;
}

function buildRingsFx(
  scene: Phaser.Scene,
  depth: number,
  textures: RingsTextureKeys,
  anchor: VfxAnchor,
  color: number,
): BurstFxHandle {
  const disposers: (() => void)[] = [];
  const { dotKey, starKey, diamondKey, noteKey } = textures;

  // The flash — only on the first ring, the "source" moment.
  const flash = scene.add.particles(anchor.x, anchor.y, dotKey, {
    lifespan: RINGS_FLASH_MS - 40,
    speed: 0,
    scale: { start: 1.1, end: 0 },
    alpha: { start: 0.85, end: 0 },
    tint: NEUTRAL,
    blendMode: "ADD",
    emitting: false,
  });
  flash.setDepth(depth);
  flash.explode(1);
  const flashTimer = scene.time.delayedCall(RINGS_FLASH_MS, () => flash.destroy());
  disposers.push(() => {
    flash.destroy();
    flashTimer.remove(false);
  });

  for (let i = 0; i < RINGS_COUNT; i++) {
    const ringDelay = i * RINGS_STAGGER_MS;
    const ringColor = i === 0 ? NEUTRAL : color;

    // The ring itself — a grow tween and an independently-timed fade tween,
    // both driving the same Graphics object, ported as-authored.
    const ringTrigger = scene.time.delayedCall(ringDelay, () => {
      const rg = scene.add.graphics();
      rg.setBlendMode("ADD");
      rg.setDepth(depth);
      const state = { r: 2, thickness: 12, alpha: 0.6 };
      const growTween = scene.tweens.add({
        targets: state,
        r: RINGS_MAX_R,
        thickness: 2,
        duration: RINGS_GROW_MS,
        ease: "Expo.easeOut",
        onUpdate: () => {
          rg.clear();
          rg.lineStyle(state.thickness, ringColor, state.alpha);
          rg.strokeEllipse(anchor.x, anchor.y, state.r * 2, state.r * 2 * RINGS_SQUASH);
        },
      });
      const fadeTween = scene.tweens.add({
        targets: state,
        alpha: 0,
        duration: RINGS_GROW_MS * 0.62,
        delay: RINGS_GROW_MS * 0.19,
        ease: "Quad.easeIn",
        onComplete: () => rg.clear(),
      });
      disposers.push(() => {
        growTween.stop();
        fadeTween.stop();
        rg.destroy();
      });
    });
    disposers.push(() => ringTrigger.remove(false));

    // Each ring also launches its own small diamond burst — a quieter repeat
    // of the ring event, not a return trip toward the source.
    const diamondTrigger = scene.time.delayedCall(ringDelay + RINGS_DIAMOND_DELAY_MS, () => {
      const diamonds = scene.add.particles(anchor.x, anchor.y, diamondKey, {
        lifespan: { min: 340, max: 480 },
        speed: { min: 80, max: 120 },
        angle: { min: 0, max: 360 },
        scale: { start: 0.25, end: 0 },
        alpha: { start: 0.45, end: 0 },
        rotate: { min: 0, max: 360 },
        tint: color,
        blendMode: "ADD",
        emitting: false,
      });
      diamonds.setDepth(depth);
      diamonds.explode(4);
      const diamondTimer = scene.time.delayedCall(RINGS_DIAMOND_LIFE_MS, () => diamonds.destroy());
      disposers.push(() => {
        diamonds.destroy();
        diamondTimer.remove(false);
      });
    });
    disposers.push(() => diamondTrigger.remove(false));

    if (i === 0) {
      // The note-glyph burst — a quieter beat of its own, not landing on the
      // same frame as the flash/ring/diamonds.
      const noteTrigger = scene.time.delayedCall(ringDelay + RINGS_NOTE_DELAY_MS, () => {
        const notes = scene.add.particles(anchor.x, anchor.y, noteKey, {
          lifespan: { min: 550, max: 750 },
          angle: { min: 245, max: 295 },
          // Faster and further apart than the first pass — 4 notes launched
          // from one point spend their first several frames overlapping
          // before they've had room to separate, and several ADD-blended
          // copies stacked on each other clip toward white regardless of
          // their own tint. More travel room is what actually fixes that,
          // not just a darker colour (see WISP's own comment).
          speed: { min: 60, max: 95 },
          scale: { start: 0.42, end: 0.52 },
          alpha: { start: 0.75, end: 0 },
          rotate: { min: -15, max: 15 },
          tint: WISP,
          blendMode: "ADD",
          emitting: false,
        });
        notes.setDepth(depth);
        notes.explode(4);
        const noteTimer = scene.time.delayedCall(RINGS_NOTE_LIFE_MS, () => notes.destroy());
        disposers.push(() => {
          notes.destroy();
          noteTimer.remove(false);
        });
      });
      disposers.push(() => noteTrigger.remove(false));

      // A dense, wispy cloud of small stars, wafting up with the notes.
      const starTrigger = scene.time.delayedCall(ringDelay + RINGS_STAR_DELAY_MS, () => {
        const stars = scene.add.particles(anchor.x, anchor.y, starKey, {
          lifespan: { min: 1050, max: 1250 },
          angle: { min: 220, max: 320 },
          // Same reasoning as the notes above — 40 particles from one point
          // need real travel room or they stack toward white before spreading.
          speed: { min: 45, max: 75 },
          scale: { start: 0.13, end: 0 },
          alpha: { start: 0.45, end: 0 },
          rotate: { min: 0, max: 360 },
          tint: WISP,
          blendMode: "ADD",
          emitting: false,
        });
        stars.setDepth(depth);
        stars.explode(40);
        const starTimer = scene.time.delayedCall(RINGS_STAR_LIFE_MS, () => stars.destroy());
        disposers.push(() => {
          stars.destroy();
          starTimer.remove(false);
        });
      });
      disposers.push(() => starTrigger.remove(false));
    }
  }

  return {
    destroy() {
      for (const dispose of disposers.splice(0)) dispose();
    },
    setPosition() {
      // Best-effort, same as `burst`/`pop`: layers already fired keep the
      // anchor they were born at.
    },
  };
}

// ---------------------------------------------------------------------------
// `plume` — waft's rising cone of puffs plus two staggered ground rings,
// ported from `tools/vfx-prototypes/waft-demo.html`. Puffs spawn from ONE
// shared point and each puff's lateral spread toward its lane is a function
// of how far THAT puff has individually risen, not of where it was spawned
// — that is what makes the shape read as a cone fanning out from a point
// rather than three parallel columns (an earlier pass's real bug, caught in
// a paused-frame screenshot: perfectly aligned rows of circles).
//
// SHAPE. A tracked pool of Sprite puffs, each with its own randomized rise
// duration, sway phase and lane target — no existing kind's resource shape
// fits (not a single redrawn Graphics like vortex/trail/suspend, not a
// build-once-then-tween shape like pop, not a fire-and-forget particle
// explosion like burst/rings), so this is its own small pool-management
// class, `PlumeFx`. The two ground rings reuse `rings`' flattened-ellipse
// Graphics+tween technique exactly, just fired once (not on a loop) with a
// stagger between them instead of three evenly-spaced copies.
//
// COLOUR. Puffs take the cue's own resolved `color`. The rings are a FIXED
// golden accent (`GOLD`/`GOLD_PALE`) regardless of the cue's colorKey, same
// fixed-family precedent as `burst`'s WARM/COOL sparks — Roc, 2026-08-23:
// "golden," not "whatever the cue's own colour is."
//
// Roc call 2026-08-23 (5th pass — "scale seems way off and colors don't
// quite match the prototype"): two real bugs, not one.
//
// SCALE. `waft-demo.html`'s numbers were tuned at full-canvas scale (the
// prototype's own 400x480 canvas), same as `vortex-demo.html`'s were — and
// `vortex`/`trail`/`suspend`'s own section header already documents that
// those needed scaling DOWN to a per-cast anchored point effect before
// porting (VORTEX_CLIMB=120 from a ~480px prototype climb, VORTEX_MAX_RADIUS
// =38 from a 150px prototype radius — roughly a 0.25x factor). This section
// skipped that step on the first port and carried the prototype's raw
// numbers over unscaled (PLUME_RING_MAX_R was literally 100, wider than
// `rings`' own RINGS_MAX_R=42). Rescaled below against that same ~0.25x
// factor and cross-checked against `rings`' already-shipped ring size.
//
// COLOUR. Puffs are tinted via `setTint`, which defaults to Phaser 4's
// MULTIPLY mode and desaturates `dusk` against the puff's ink-based fill —
// see dev-notes/phaser4-tint-fill-removed-and-multiply-default.md.
// `TINT_MODE_FILL` fixes it.
// ---------------------------------------------------------------------------

/** `Phaser.TintModes.FILL` — this file imports Phaser for TYPES ONLY (see the file header), so the runtime enum isn't available; its value (1) is stable across the Phaser 4 line. */
const TINT_MODE_FILL = 1;

const PLUME_RISE_MS = 1500;
const PLUME_RISE_HEIGHT = 90; // was 130 — the prototype's own climb (360px) scaled ~0.25x, matching vortex's own derivation
const PLUME_SPAWN_INTERVAL_MS = 45;
const PLUME_CAST_MS = 900;
const PLUME_CONE_LANES: readonly number[] = [-12, 0, 12]; // was [-34, 0, 34] — unscaled prototype spread
const PLUME_RING_SQUASH = 0.32;
const PLUME_RING_MAX_R = 42; // was 100 — matched to `rings`' own RINGS_MAX_R, the closest existing ground-ring precedent
const PLUME_RING_GROW_MS = 480;
const PLUME_RING_STAGGER_MS = 160; // top ring fires first, bottom follows
/** A puff's rise duration varies up to 15% slower — sets the ceiling for `PLUME_CYCLE_MS`. */
const PLUME_RISE_VARIANCE_MAX = 1.15;
/** `cue.durationMs` for a `plume` row must be at least this — the latest-spawned puff, at its slowest rise. */
export const PLUME_CYCLE_MS = PLUME_CAST_MS + PLUME_RISE_MS * PLUME_RISE_VARIANCE_MAX;

interface PlumePuff {
  readonly sprite: Phaser.GameObjects.Sprite;
  readonly born: number;
  readonly baseX: number;
  readonly baseY: number;
  readonly riseMs: number;
  readonly coneTarget: number;
  readonly baseScale: number;
  readonly swayPhase: number;
  readonly swayAmp: number;
}

/** One of `plume`'s two ground rings — its own Graphics object, its own tween, its own disposer. Returns the disposer. */
function buildPlumeGroundRing(
  scene: Phaser.Scene,
  depth: number,
  x: number,
  y: number,
  color: number,
  delayMs: number,
): () => void {
  const disposers: (() => void)[] = [];
  const trigger = scene.time.delayedCall(delayMs, () => {
    const rg = scene.add.graphics();
    rg.setBlendMode("ADD");
    rg.setDepth(depth);
    const state = { r: 4, thickness: 10, alpha: 0.6 };
    const growTween = scene.tweens.add({
      targets: state,
      r: PLUME_RING_MAX_R,
      thickness: 2,
      duration: PLUME_RING_GROW_MS,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        rg.clear();
        rg.lineStyle(state.thickness, color, state.alpha);
        rg.strokeEllipse(x, y, state.r * 2, state.r * 2 * PLUME_RING_SQUASH);
      },
    });
    const fadeTween = scene.tweens.add({
      targets: state,
      alpha: 0,
      duration: PLUME_RING_GROW_MS * 0.6,
      delay: PLUME_RING_GROW_MS * 0.4,
      ease: "Quad.easeIn",
      onComplete: () => rg.clear(),
    });
    disposers.push(() => {
      growTween.stop();
      fadeTween.stop();
      rg.destroy();
    });
  });
  disposers.push(() => trigger.remove(false));
  return () => {
    for (const dispose of disposers.splice(0)) dispose();
  };
}

class PlumeFx {
  private readonly puffs: PlumePuff[] = [];
  private readonly ringDisposers: (() => void)[] = [];
  private readonly timer: Phaser.Time.TimerEvent;
  private readonly startedAt: number;
  private readonly nextSpawnAt: number[];
  private pos: { x: number; y: number };

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly depth: number,
    private readonly puffKey: string,
    anchor: VfxAnchor,
    private readonly color: number,
  ) {
    this.pos = { x: anchor.x, y: anchor.y };
    this.startedAt = scene.time.now;
    this.nextSpawnAt = PLUME_CONE_LANES.map(() => Math.random() * PLUME_SPAWN_INTERVAL_MS);

    // Top ring (slightly higher) fires first, pale/bright as the "source"
    // moment — same convention `rings` uses for its first ring — the bottom
    // ring follows.
    this.ringDisposers.push(buildPlumeGroundRing(scene, depth, this.pos.x, this.pos.y - 7, GOLD_PALE, 0));
    this.ringDisposers.push(
      buildPlumeGroundRing(scene, depth, this.pos.x, this.pos.y + 2, GOLD, PLUME_RING_STAGGER_MS),
    );

    this.timer = scene.time.addEvent({ delay: 16, loop: true, callback: () => this.step() });
  }

  private spawnPuff(laneIndex: number): void {
    // Every puff spawns from the same point — a little jitter so they are
    // not pixel-identical, not a per-lane offset. Starts small (a point),
    // not already-large — see `step()`'s quick early ramp.
    const x = this.pos.x + (Math.random() - 0.5) * 4;
    const sprite = this.scene.add.sprite(x, this.pos.y, this.puffKey, 0);
    sprite.setBlendMode("ADD");
    sprite.setDepth(this.depth);
    sprite.setTint(this.color);
    sprite.setTintMode(TINT_MODE_FILL); // replaces, not multiplies — see the section header
    const baseScale = 0.15 + Math.random() * 0.08; // was 0.22-0.34 — see step()'s reduced growth target below
    sprite.setScale(baseScale);
    sprite.setAlpha(0);
    this.puffs.push({
      sprite,
      born: this.scene.time.now,
      baseX: x,
      baseY: this.pos.y,
      riseMs: PLUME_RISE_MS * (0.85 + Math.random() * 0.3),
      // The lane's spread only applies at full climb — see `step()`'s lerp
      // against `t`. Together at the base, fanned into a cone by the top.
      coneTarget: PLUME_CONE_LANES[laneIndex] + (Math.random() - 0.5) * 4,
      baseScale,
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 3 + Math.random() * 4,
    });
  }

  private step(): void {
    const now = this.scene.time.now;
    const elapsed = now - this.startedAt;

    if (elapsed >= 0 && elapsed < PLUME_CAST_MS) {
      for (let lane = 0; lane < PLUME_CONE_LANES.length; lane++) {
        if (now >= this.nextSpawnAt[lane]) {
          this.spawnPuff(lane);
          // Jittered, not fixed — a fixed interval across 3 lanes produced a
          // rigid grid of circles even with a random phase offset alone.
          this.nextSpawnAt[lane] = now + PLUME_SPAWN_INTERVAL_MS * (0.6 + Math.random() * 0.8);
        }
      }
    }

    for (let i = this.puffs.length - 1; i >= 0; i--) {
      const p = this.puffs[i];
      const age = now - p.born;
      const t = age / p.riseMs;
      if (t >= 1) {
        p.sprite.destroy();
        this.puffs.splice(i, 1);
        continue;
      }
      const eased = 1 - Math.pow(1 - t, 2); // eases upward, slows near the top
      p.sprite.y = p.baseY - eased * PLUME_RISE_HEIGHT;
      const coneX = p.baseX + p.coneTarget * eased;
      p.sprite.x = coneX + Math.sin(t * 3 + p.swayPhase) * p.swayAmp * t;
      // Quick ramp from the point-sized spawn to a full body within the
      // first ~12% of the climb, then continued growth for dispersal near
      // the top — fullness starts just above the vent, not at it. Roc call
      // 2026-08-23 (6th pass — "scale down the circles more, still reads
      // white"): the growth target (0.72 body, +0.75 by the top) was sized
      // for the ORIGINAL 360px prototype climb, not the 90px it's scaled to
      // now — individual puffs were reading as oversized blobs, not points
      // of smoke. Cut roughly in half.
      const bodyT = Math.min(1, t / 0.12);
      const bodyScale = p.baseScale + (0.35 - p.baseScale) * bodyT;
      p.sprite.setScale(bodyScale + t * 0.35);
      const fadeIn = Math.min(1, age / 140);
      const fadeOut = t > 0.6 ? 1 - (t - 0.6) / 0.4 : 1;
      // 0.3, not 0.5 — the scale-down above packs the same puff count into a
      // shorter column, so more of them overlap at once; under ADD blend
      // that stacks brighter, not just denser, and with the tint-mode fix
      // each puff is now the FULL-saturation `dusk` instead of a desaturated
      // one, so the same alpha that looked fine before now blows out to
      // white at the core. Lower base alpha compensates.
      p.sprite.setAlpha(0.3 * fadeIn * fadeOut);
    }
  }

  setPosition(x: number, y: number): void {
    // Future spawns only — puffs already in the air keep the point they
    // rose from, same "re-anchor moves future emission, not what's already
    // in flight" rule `emit()` and every composite kind here follows.
    this.pos = { x, y };
  }

  destroy(): void {
    this.timer.remove(false);
    for (const p of this.puffs.splice(0)) p.sprite.destroy();
    for (const dispose of this.ringDisposers.splice(0)) dispose();
  }
}

// ---------------------------------------------------------------------------
// `beacon` — steep's ground ring + rising glow pillar + fountain motes,
// ported from `tools/vfx-prototypes/steep-demo.html`. Shape borrowed from
// loot-pickup VFX (Desktop/assets/GodotLootVFX's `ground_loot_vfx_*.tscn`),
// not from any other kind in this file — Roc, 2026-08-23: "try something
// like godot loot" for a spell about drawing virtue INTO something, which
// reads as "a glowing thing is gathering here" rather than a rising column.
//
// SHAPE. The ring/pillar/core-glow layer is one `GraphicsFx` draw function,
// same technique as vortex/trail/suspend, reused directly rather than
// reinvented. The motes are separate: real closed-form projectile motion
// (launch angle + speed + gravity, position a PURE function of a mote's own
// age) rather than an eased lerp toward a target, so they genuinely arc up
// and out and curve back down like a fountain instead of drifting straight
// up — ported from `waft`'s own 2nd redo, `steep-demo.html`'s 2nd pass.
//
// COLOUR. Ring/pillar take the cue's own resolved `color` for the outer
// layers and `EMBER_PALE` for the bright inner highlights — the same
// core/glow split every other composite kind here uses. Motes are tinted
// `EMBER_PALE` too, matching the prototype.
// ---------------------------------------------------------------------------

const BEACON_GROW_MS = 380;
const BEACON_HOLD_MS = 340;
const BEACON_FADE_MS = 300;
const BEACON_PILLAR_HEIGHT = 170;
const BEACON_RING_SQUASH = 0.34;
const BEACON_PILLAR_SEGMENTS = 14;

const BEACON_MOTE_SPAWN_WINDOW_MS = BEACON_GROW_MS + BEACON_HOLD_MS;
const BEACON_MOTE_INTERVAL_MS = 60;
const BEACON_MOTE_ANGLE_MIN_DEG = 248;
const BEACON_MOTE_ANGLE_MAX_DEG = 292;
const BEACON_MOTE_SPEED_MIN = 0.13;
const BEACON_MOTE_SPEED_MAX = 0.19;
const BEACON_MOTE_GRAVITY = 0.00038;
/** Longest a fountain-launched mote can live — the ceiling used by `BEACON_CYCLE_MS` below. */
const BEACON_MOTE_LIFE_MAX_MS = (BEACON_MOTE_SPEED_MAX / BEACON_MOTE_GRAVITY) * 1.9 + 120;
/** `cue.durationMs` for a `beacon` row must be at least this — a mote spawned right at the end of the hold window outlives the ring/pillar's own fade. */
export const BEACON_CYCLE_MS = BEACON_MOTE_SPAWN_WINDOW_MS + BEACON_MOTE_LIFE_MAX_MS;

function drawBeacon(g: Phaser.GameObjects.Graphics, elapsedMs: number, anchor: VfxAnchor, color: number): void {
  const totalMs = BEACON_GROW_MS + BEACON_HOLD_MS + BEACON_FADE_MS;
  if (elapsedMs < 0 || elapsedMs > totalMs) return;

  const envelopeAlpha =
    elapsedMs > BEACON_GROW_MS + BEACON_HOLD_MS
      ? 1 - (elapsedMs - BEACON_GROW_MS - BEACON_HOLD_MS) / BEACON_FADE_MS
      : 1;
  const growT = Math.min(1, elapsedMs / BEACON_GROW_MS);
  const growEase = 1 - Math.pow(1 - growT, 3);
  const breathe = 0.9 + 0.1 * Math.sin(elapsedMs / 180);

  // The glow pillar — brightest at the base, fading upward, stacked fading
  // ellipses rather than a gradient sprite so it stays a plain Graphics
  // resource.
  const pillarH = growEase * BEACON_PILLAR_HEIGHT;
  for (let i = 0; i < BEACON_PILLAR_SEGMENTS; i++) {
    const segT = i / BEACON_PILLAR_SEGMENTS;
    const y = anchor.y - segT * pillarH;
    const w = (10 - segT * 6) * breathe;
    const a = (1 - segT) * 0.22 * envelopeAlpha * breathe;
    g.fillStyle(color, a);
    g.fillEllipse(anchor.x, y, w * 2, 14);
  }

  // The ground ring — same flattened-ellipse technique as `rings`.
  const ringR = 8 + growEase * 46;
  g.lineStyle(10, color, 0.14 * envelopeAlpha * breathe);
  g.strokeEllipse(anchor.x, anchor.y, ringR * 2, ringR * 2 * BEACON_RING_SQUASH);
  g.lineStyle(2.5, EMBER_PALE, 0.85 * envelopeAlpha * breathe);
  g.strokeEllipse(anchor.x, anchor.y, ringR * 2, ringR * 2 * BEACON_RING_SQUASH);

  // The core glow — a small bright pulse at the ring's centre.
  g.fillStyle(EMBER_PALE, 0.5 * envelopeAlpha * breathe);
  g.fillCircle(anchor.x, anchor.y, 10 * growEase);
  g.fillStyle(NEUTRAL, 0.7 * envelopeAlpha * breathe);
  g.fillCircle(anchor.x, anchor.y, 4 * growEase);
}

interface BeaconMote {
  readonly image: Phaser.GameObjects.Sprite;
  readonly born: number;
  readonly originX: number;
  readonly originY: number;
  readonly vx0: number;
  readonly vy0: number;
  readonly life: number;
  readonly baseScale: number;
  readonly spin: number;
}

function buildBeaconFx(
  scene: Phaser.Scene,
  depth: number,
  starKey: string,
  anchor: VfxAnchor,
  color: number,
): BurstFxHandle {
  const disposers: (() => void)[] = [];
  const pos = { x: anchor.x, y: anchor.y };

  const graphicsFx = new GraphicsFx(scene, depth, anchor, color, drawBeacon);
  disposers.push(() => graphicsFx.destroy());

  const motes: BeaconMote[] = [];
  const startedAt = scene.time.now;
  let lastMoteAt = -Infinity;

  const timer = scene.time.addEvent({
    delay: 16,
    loop: true,
    callback: () => {
      const now = scene.time.now;
      const elapsed = now - startedAt;
      if (elapsed >= 0 && elapsed < BEACON_MOTE_SPAWN_WINDOW_MS && now - lastMoteAt >= BEACON_MOTE_INTERVAL_MS) {
        lastMoteAt = now;
        const angleDeg = BEACON_MOTE_ANGLE_MIN_DEG + Math.random() * (BEACON_MOTE_ANGLE_MAX_DEG - BEACON_MOTE_ANGLE_MIN_DEG);
        const speed = BEACON_MOTE_SPEED_MIN + Math.random() * (BEACON_MOTE_SPEED_MAX - BEACON_MOTE_SPEED_MIN);
        const angleRad = (angleDeg * Math.PI) / 180;
        const vx0 = speed * Math.cos(angleRad);
        const vy0 = speed * Math.sin(angleRad);
        const image = scene.add.sprite(pos.x, pos.y, starKey, 0);
        image.setBlendMode("ADD");
        image.setDepth(depth);
        image.setTint(EMBER_PALE);
        const baseScale = 0.22 + Math.random() * 0.16;
        image.setScale(baseScale);
        image.setAlpha(0);
        motes.push({
          image,
          born: now,
          originX: pos.x,
          originY: pos.y,
          vx0,
          vy0,
          // Life roughly matches one full up-and-back arc for this launch
          // speed, so it fades out around where it would land rather than
          // being cut off mid-flight or visibly diving through the ground.
          life: (Math.abs(vy0) / BEACON_MOTE_GRAVITY) * 1.9 + 120,
          baseScale,
          spin: (Math.random() - 0.5) * 3,
        });
      }

      for (let i = motes.length - 1; i >= 0; i--) {
        const m = motes[i];
        const age = now - m.born;
        const t = age / m.life;
        if (t >= 1) {
          m.image.destroy();
          motes.splice(i, 1);
          continue;
        }
        // Closed-form projectile motion — position is a pure function of
        // age, exact regardless of frame timing.
        m.image.x = m.originX + m.vx0 * age;
        m.image.y = m.originY + m.vy0 * age + 0.5 * BEACON_MOTE_GRAVITY * age * age;
        m.image.angle += m.spin;
        m.image.setScale(m.baseScale * (1 - t * 0.4));
        const fadeIn = Math.min(1, age / 100);
        m.image.setAlpha(0.85 * fadeIn * (1 - t));
      }
    },
  });
  disposers.push(() => timer.remove(false));
  disposers.push(() => {
    for (const m of motes.splice(0)) m.image.destroy();
  });

  return {
    destroy() {
      for (const dispose of disposers.splice(0)) dispose();
    },
    setPosition(x: number, y: number) {
      pos.x = x;
      pos.y = y;
      graphicsFx.setPosition(x, y);
    },
  };
}

// ---------------------------------------------------------------------------
// `eruption` — temper's sudden flash + splash rings + two-colour firework
// streak burst + delayed steam + sparks, ported from
// `tools/vfx-prototypes/temper-demo.html`. Everything fires once and
// dissipates fast; nothing loops or holds, unlike `plume`/`beacon`.
//
// SHAPE. Flash and splash rings follow `burst`'s pattern: one Graphics
// object PER ring, never shared — see
// dev-notes/shared-graphics-object-across-tweens-clobbers-draw.md for why
// sharing one leaves only the last-updated ring visible. Steam reuses
// `plume`'s soft-puff texture, delayed a beat behind the streaks.
//
// COLOUR. Flash is NEUTRAL. Splash rings and hiss sparks take the cue's own
// resolved `color`. Steam is NEUTRAL (the prototype's own "warm-white, not
// cold blue" call). The firework streaks are a FIXED two-colour accent —
// `COOL` (green) and `WISP` (blue) — regardless of the cue's `colorKey`,
// same fixed-family precedent as `burst`'s own WARM/COOL sparks: Roc,
// 2026-08-23 asked for streaks that "streak green and blue," not streaks in
// whatever colour the cue itself resolves to.
//
// Roc call 2026-08-23 (2nd pass — "scale seems way off and colors don't
// quite match the prototype"): two real bugs, not one.
//
// SCALE. `temper-demo.html`'s canvas (400x320) matches `scratch-demo.html`'s
// exactly, and `burst` already scaled scratch's numbers down when it was
// ported (its ring: prototype r:42 -> BURST_RING_MAX_R=26, a ~0.6x factor).
// This section instead carried the prototype's own ring/streak/steam/spark
// numbers over UNSCALED — the ring alone was literally r:46, wider than
// burst's already-shipped ring. Rescaled below against that same ~0.6x
// factor, cross-checked against burst's own final numbers per layer.
//
// COLOUR (cont.). Streaks, steam and sparks tint via the emitter's `tint`
// config, same MULTIPLY-default bug as `plume` (see
// dev-notes/phaser4-tint-fill-removed-and-multiply-default.md).
// `tintMode: TINT_MODE_FILL` on every non-NEUTRAL-tinted layer fixes it.
//
// Roc call 2026-08-23 (2nd pass): "the burst is not reading as a ring and
// burst, the geometry or physics is causing erratic directions... the
// flash isn't happening or is so off it reads like generic particle
// movement... the white circles are also huge." Two real, separate causes.
//
// SIZE. The flash (dot texture, scale 2.4 — matched to `burst`'s own) and
// the steam puffs (growing to scale 1.8, 12 of them) were each individually
// large enough to rival the whole ring (max diameter 52px), so the flash
// swallowed the ring's own "moment" and the steam cloud read as one huge
// blob rather than distinct wisps. Both cut down below.
//
// "ERRATIC DIRECTIONS," 3rd pass — the real fix, not the 2nd pass's
// workaround (swapping the elongated `sparkKey` bar for the round `dotKey`
// texture, which sidesteps a full-circle streak burst always rendering at
// one fixed orientation rather than fixing it — `burst`'s own streaks had
// the identical bug). `facingAngleConfig` below is the real fix: see
// dev-notes/phaser4-particle-rotate-evaluates-before-angle.md
// ---------------------------------------------------------------------------

/**
 * A `{angle, rotate}` pair that locks a particle's sprite rotation to its
 * own launch direction, no Particle subclass required — see
 * dev-notes/phaser4-particle-rotate-evaluates-before-angle.md for how.
 * Spread the result into a `ParticleEmitterConfig` in place of a plain
 * `angle: {min, max}`.
 */
function facingAngleConfig(
  angleMin: number,
  angleMax: number,
): Pick<Phaser.Types.GameObjects.Particles.ParticleEmitterConfig, "angle" | "rotate"> {
  const launchAngle = new WeakMap<Phaser.GameObjects.Particles.Particle, number>();
  return {
    // Evaluated first — rolls the shared random angle and stashes it.
    rotate: {
      onEmit: (particle) => {
        const a = angleMin + Math.random() * (angleMax - angleMin);
        if (particle) launchAngle.set(particle, a);
        return a;
      },
    },
    // Evaluated second — reuses the exact value `rotate` just rolled, so
    // the particle's own travel direction can never disagree with its
    // sprite rotation.
    angle: {
      onEmit: (particle) => (particle ? (launchAngle.get(particle) ?? angleMin) : angleMin),
    },
  };
}

// Roc call 2026-08-23 (4th pass — "want the vfx to last longer"): every
// duration below is 2x its previous value, every particle speed range is
// 0.5x — distance is speed × time, so halving speed while doubling time
// reaches the exact same radius/travel each layer already had, just twice
// as slowly. `ERUPTION_RING_MAX_R` is untouched — it's a tween TARGET, not
// a speed, so a longer `ERUPTION_RING_LIFE_MS` alone already gets the ring
// to the same size more slowly with no separate adjustment.
const ERUPTION_FLASH_MS = 400;
/** How long the flash plays alone before the ring/streaks/steam/sparks join — Roc, 2026-08-23 (5th pass). */
const ERUPTION_HOLD_MS = 100;
const ERUPTION_RING_LIFE_MS = 760;
const ERUPTION_RING_STAGGER_MS = 180;
const ERUPTION_RING_MAX_R = 26; // was 46 — matched to `burst`'s own already-shipped BURST_RING_MAX_R
const ERUPTION_STREAK_LIFE_MS = 840;
const ERUPTION_STEAM_DELAY_MS = 300;
const ERUPTION_STEAM_LIFE_MAX_MS = 840;
const ERUPTION_SPARK_LIFE_MS = 680;
/** `cue.durationMs` for an `eruption` row must be at least this — the delayed steam layer is the longest-lived. */
export const ERUPTION_CYCLE_MS = ERUPTION_HOLD_MS + ERUPTION_STEAM_DELAY_MS + ERUPTION_STEAM_LIFE_MAX_MS;

interface EruptionTextureKeys {
  readonly dotKey: string;
  readonly sparkKey: string;
  readonly puffKey: string;
}

function buildEruptionFx(
  scene: Phaser.Scene,
  depth: number,
  textures: EruptionTextureKeys,
  anchor: VfxAnchor,
  color: number,
): BurstFxHandle {
  const disposers: (() => void)[] = [];
  const { dotKey, sparkKey, puffKey } = textures;

  // Layer 1: the flash — the instant the hot metal hits the water. Roc call
  // 2026-08-23 (3rd pass — "in the prototype it's as big or bigger than the
  // rings fully expanded"): the prototype's own flash (14px-radius dot,
  // scale 2.8) reaches ~39px radius against a 46px fully-grown ring — about
  // 85% of it, not a small accent. The two earlier cuts here (2.4, then
  // 1.3, chasing "huge white circles") were solving the wrong layer — that
  // bug was steam (now fixed separately) — and left the flash at ~40% of
  // this ring's 26px radius, far under the prototype's own proportion.
  // 2.8 on this file's 8px-radius dot lands at ~22px, ~85% of this ring,
  // matching the prototype's ratio exactly.
  const flash = scene.add.particles(anchor.x, anchor.y, dotKey, {
    lifespan: ERUPTION_FLASH_MS - 80,
    speed: 0,
    scale: { start: 2.8, end: 0 },
    alpha: { start: 1, end: 0 },
    tint: NEUTRAL,
    tintMode: TINT_MODE_FILL,
    blendMode: "ADD",
    emitting: false,
  });
  flash.setDepth(depth);
  flash.explode(1);
  const flashTimer = scene.time.delayedCall(ERUPTION_FLASH_MS, () => flash.destroy());
  disposers.push(() => {
    flash.destroy();
    flashTimer.remove(false);
  });

  // Layer 2: two staggered splash rings — one Graphics object EACH (see the
  // section header for why sharing one broke). Roc call 2026-08-23 (5th
  // pass — "separate the flash from everything else... flash, hold 100ms
  // then everything else"): every layer below now waits `ERUPTION_HOLD_MS`
  // behind the flash, all starting on the SAME beat, so there's a real
  // moment where the flash plays alone before the rest joins in — instead
  // of everything landing on one frame, which is what made the flash
  // impossible to perceive as its own event even though it was rendering.
  for (const delay of [ERUPTION_HOLD_MS, ERUPTION_HOLD_MS + ERUPTION_RING_STAGGER_MS]) {
    const rg = scene.add.graphics();
    rg.setBlendMode("ADD");
    rg.setDepth(depth);
    const state = { r: 3, alpha: 0.6 };
    const ringTween = scene.tweens.add({
      targets: state,
      r: ERUPTION_RING_MAX_R,
      alpha: 0,
      duration: ERUPTION_RING_LIFE_MS,
      delay,
      ease: "Cubic.easeOut",
      onUpdate: () => {
        rg.clear();
        rg.lineStyle(2.5, color, state.alpha);
        rg.strokeCircle(anchor.x, anchor.y, state.r);
      },
      onComplete: () => rg.clear(),
    });
    disposers.push(() => {
      ringTween.stop();
      rg.destroy();
    });
  }

  // Layer 3: firework-style streaks radiating from the centre, green and
  // blue — two separate emitters so each colour reads as its own family
  // rather than a gradient between them. Elongated `sparkKey` bar, each one
  // rotated to face its own launch direction via `facingAngleConfig` — see
  // the section header ("ERRATIC DIRECTIONS," 3rd pass) for how that works
  // without a Particle subclass. Delayed `ERUPTION_HOLD_MS`, same beat as
  // the rings — a real trigger now, not fired at construction, since it has
  // to wait for the hold like everything else.
  const streakTrigger = scene.time.delayedCall(ERUPTION_HOLD_MS, () => {
    for (const streakColor of [COOL, WISP]) {
      const streaks = scene.add.particles(anchor.x, anchor.y, sparkKey, {
        lifespan: { min: 480, max: ERUPTION_STREAK_LIFE_MS },
        speed: { min: 45, max: 78 }, // half of 90-156 — 2x duration, 0.5x speed keeps the same reach, see the section header
        ...facingAngleConfig(0, 360),
        scaleX: { start: 1.5, end: 0.3 },
        scaleY: { start: 1.3, end: 0.25 },
        alpha: { start: 1, end: 0 },
        tint: streakColor,
        tintMode: TINT_MODE_FILL,
        blendMode: "ADD",
        emitting: false,
      });
      streaks.setDepth(depth);
      streaks.explode(7);
      const streakTimer = scene.time.delayedCall(ERUPTION_STREAK_LIFE_MS, () => streaks.destroy());
      disposers.push(() => {
        streaks.destroy();
        streakTimer.remove(false);
      });
    }
  });
  disposers.push(() => streakTrigger.remove(false));

  // Layer 4: steam — delayed a beat behind the streaks so it doesn't
  // visually bury them the instant both appear (a real bug, a real fix —
  // see the section header), on top of the shared `ERUPTION_HOLD_MS` every
  // other layer now waits too. Roc call 2026-08-23 (3rd pass — "in the
  // prototype they are basically invisible"): halved again from the 2nd
  // pass's already-reduced size/opacity (end scale 0.8 -> 0.4, start alpha
  // 0.55 -> 0.28) — the prototype's own steam reads as barely-there, and
  // the shipped version was still more prominent than that.
  const steamTrigger = scene.time.delayedCall(ERUPTION_HOLD_MS + ERUPTION_STEAM_DELAY_MS, () => {
    // Same nested-{min,max} trap as `burst` — see
    // dev-notes/phaser4-nested-minmax-under-scale-start-silently-fails.md
    const steam = scene.add.particles(anchor.x, anchor.y, puffKey, {
      lifespan: { min: 520, max: ERUPTION_STEAM_LIFE_MAX_MS },
      speed: { min: 27, max: 51 }, // half of 54-102 — 2x duration, 0.5x speed keeps the same reach, see the section header
      angle: { min: 230, max: 310 },
      scale: { start: 0.15, end: 0.4, random: true },
      alpha: { start: 0.28, end: 0 },
      tint: NEUTRAL,
      tintMode: TINT_MODE_FILL,
      blendMode: "ADD",
      emitting: false,
    });
    steam.setDepth(depth);
    steam.explode(7);
    const steamTimer = scene.time.delayedCall(ERUPTION_STEAM_LIFE_MAX_MS, () => steam.destroy());
    disposers.push(() => {
      steam.destroy();
      steamTimer.remove(false);
    });
  });
  disposers.push(() => steamTrigger.remove(false));

  // Layer 5: a few bright hiss sparks — droplets flung by the reaction.
  // Delayed `ERUPTION_HOLD_MS`, same beat as the rings and streaks.
  const sparkTrigger = scene.time.delayedCall(ERUPTION_HOLD_MS, () => {
    const sparks = scene.add.particles(anchor.x, anchor.y, dotKey, {
      lifespan: { min: 400, max: ERUPTION_SPARK_LIFE_MS },
      speed: { min: 18, max: 42 }, // half of 36-84 — 2x duration, 0.5x speed keeps the same reach, see the section header
      angle: { min: 200, max: 340 },
      scale: { start: 0.6, end: 0, random: true },
      alpha: { start: 0.9, end: 0 },
      tint: color,
      tintMode: TINT_MODE_FILL,
      blendMode: "ADD",
      emitting: false,
    });
    sparks.setDepth(depth);
    sparks.explode(8);
    const sparkTimer = scene.time.delayedCall(ERUPTION_SPARK_LIFE_MS, () => sparks.destroy());
    disposers.push(() => {
      sparks.destroy();
      sparkTimer.remove(false);
    });
  });
  disposers.push(() => sparkTrigger.remove(false));

  return {
    destroy() {
      for (const dispose of disposers.splice(0)) dispose();
    },
    setPosition() {
      // Best-effort, same as `burst`/`pop`/`rings`: everything here fires
      // once at construction; layers already in flight keep the anchor they
      // were born at.
    },
  };
}

/**
 * A base value, or a `{min, max}` spread around it when `variance` is above
 * zero — variance 0.3 on speed 60 gives 42..78. Every existing row omits
 * `speedVariance`/`scaleVariance`, so `variance` defaults to 0 and this
 * returns the flat number exactly as before; nothing already authored moves.
 */
function varied(base: number, variance: number): number | { min: number; max: number } {
  if (variance <= 0) return base;
  return { min: base * (1 - variance), max: base * (1 + variance) };
}

class PhaserHandle implements VfxHandle {
  readonly cueId: string;
  private live = true;

  constructor(
    cue: VfxCue,
    /** Everything this cue holds. Run once, on stop. */
    private readonly dispose: () => void,
    /** Re-anchor while playing. No-op for camera-wide cues. */
    private readonly onMove: (anchor: VfxAnchor) => void,
    private readonly onStopped: (handle: PhaserHandle) => void,
  ) {
    this.cueId = cue.id;
  }

  get active(): boolean {
    return this.live;
  }

  moveTo(anchor: VfxAnchor): void {
    if (!this.live) return;
    this.onMove(anchor);
  }

  stop(): void {
    if (!this.live) return;
    this.live = false;
    this.dispose();
    this.onStopped(this);
  }
}

/** An inert handle. Returned for `kind: "none"` and once detached. */
class InertHandle implements VfxHandle {
  readonly active = false;
  constructor(readonly cueId: string) {}
  moveTo(): void {}
  stop(): void {}
}

export class PhaserVfxBackend implements VfxBackend {
  private readonly scene: Phaser.Scene;
  private readonly camera: Phaser.Cameras.Scene2D.Camera;
  private readonly depth: number;
  private readonly maxConcurrent: number;
  /** Unique per instance, so two scenes never fight over one texture. */
  private readonly dotKey: string;
  /** `burst`'s elongated streak texture. Same one-per-instance reasoning as `dotKey`. */
  private readonly sparkKey: string;
  /** `echo`'s three generated shapes. Same one-per-instance reasoning as `dotKey`. */
  private readonly starKey: string;
  private readonly diamondKey: string;
  private readonly noteKey: string;
  /** `plume`'s and `eruption`'s soft puff texture. Same one-per-instance reasoning as `dotKey`. */
  private readonly puffKey: string;

  private readonly handles = new Set<PhaserHandle>();
  private isAttached = true;

  private static instances = 0;

  constructor(options: PhaserVfxBackendOptions) {
    this.scene = options.scene;
    this.camera = options.camera ?? options.scene.cameras.main;
    this.depth = options.depth ?? 900;
    this.maxConcurrent = Math.max(1, options.maxConcurrent ?? DEFAULT_MAX_CONCURRENT);
    const instance = ++PhaserVfxBackend.instances;
    this.dotKey = `__vfx_dot_${instance}`;
    this.sparkKey = `__vfx_spark_${instance}`;
    this.starKey = `__vfx_star_${instance}`;
    this.diamondKey = `__vfx_diamond_${instance}`;
    this.noteKey = `__vfx_note_${instance}`;
    this.puffKey = `__vfx_puff_${instance}`;
  }

  get attached(): boolean {
    return this.isAttached;
  }

  /** Live cues. `npm run walk` watches this stay flat over a long session. */
  get liveCount(): number {
    return this.handles.size;
  }

  play(cue: VfxCue, anchor: VfxAnchor): VfxHandle {
    if (!this.isAttached || cue.kind === "none" || cue.durationMs <= 0) {
      return new InertHandle(cue.id);
    }
    // The ceiling is enforced BEFORE the new controller is added, so the number
    // of live filters is bounded by the code and not by how fast the player
    // casts. `handles` is insertion-ordered, so this sheds the oldest. The
    // explicit `delete` is not redundant with `stop()`'s own removal: `stop()`
    // returns early on an already-inactive handle without calling back, and this
    // loop would then spin forever on it.
    while (this.handles.size >= this.maxConcurrent) {
      const oldest = this.handles.values().next().value;
      if (!oldest) break;
      oldest.stop();
      this.handles.delete(oldest);
    }
    const color = cueColor(cue.colorKey) ?? NEUTRAL;

    const disposers: (() => void)[] = [];
    // A camera filter composites the whole frame and has no position, so this
    // stays a no-op for every non-particle kind — the contract stated by
    // `isAnchoredKind`, not an omission. See VfxBackend.ts.
    let move: (anchor: VfxAnchor) => void = () => {};

    if (cue.kind === "sprite") {
      const sprite = this.spriteFx(cue, anchor, color);
      if (sprite) {
        disposers.push(() => sprite.destroy());
        move = (next) => sprite.setPosition(next.x, next.y);
      }
    } else if (cue.kind === "vortex" || cue.kind === "trail" || cue.kind === "suspend") {
      const draw = cue.kind === "vortex" ? drawVortex : cue.kind === "trail" ? drawTrail : drawSuspend;
      const fx = new GraphicsFx(this.scene, this.depth, anchor, color, draw);
      disposers.push(() => fx.destroy());
      move = (next) => fx.setPosition(next.x, next.y);
    } else if (cue.kind === "burst") {
      this.ensureDot();
      const fx = buildBurstFx(this.scene, this.depth, this.dotKey, anchor, color);
      disposers.push(() => fx.destroy());
      move = (next) => fx.setPosition(next.x, next.y);
    } else if (cue.kind === "pop") {
      const fx = buildPopFx(this.scene, this.depth, anchor, color);
      disposers.push(() => fx.destroy());
      move = (next) => fx.setPosition(next.x, next.y);
    } else if (cue.kind === "rings") {
      this.ensureDot();
      this.ensureStar();
      this.ensureDiamond();
      this.ensureNote();
      const fx = buildRingsFx(
        this.scene,
        this.depth,
        { dotKey: this.dotKey, starKey: this.starKey, diamondKey: this.diamondKey, noteKey: this.noteKey },
        anchor,
        color,
      );
      disposers.push(() => fx.destroy());
      move = (next) => fx.setPosition(next.x, next.y);
    } else if (cue.kind === "plume") {
      this.ensurePuff();
      const fx = new PlumeFx(this.scene, this.depth, this.puffKey, anchor, color);
      disposers.push(() => fx.destroy());
      move = (next) => fx.setPosition(next.x, next.y);
    } else if (cue.kind === "beacon") {
      this.ensureStar();
      const fx = buildBeaconFx(this.scene, this.depth, this.starKey, anchor, color);
      disposers.push(() => fx.destroy());
      move = (next) => fx.setPosition(next.x, next.y);
    } else if (cue.kind === "eruption") {
      this.ensureDot();
      this.ensureSpark();
      this.ensurePuff();
      const fx = buildEruptionFx(
        this.scene,
        this.depth,
        { dotKey: this.dotKey, sparkKey: this.sparkKey, puffKey: this.puffKey },
        anchor,
        color,
      );
      disposers.push(() => fx.destroy());
      move = (next) => fx.setPosition(next.x, next.y);
    } else if (isAnchoredKind(cue.kind)) {
      const emitter = this.emit(cue, anchor, color);
      disposers.push(() => emitter.destroy());
      move = (next) => emitter.setPosition(next.x, next.y);
    } else {
      const controller = this.filter(cue, color);
      disposers.push(() => this.camera.filters.internal.remove(controller));
    }

    const handle = new PhaserHandle(
      cue,
      () => {
        for (const dispose of disposers.splice(0)) dispose();
      },
      move,
      (h) => this.handles.delete(h),
    );

    // Self-expiry. Without this a cue lives until detach, which is the leak.
    const timer = this.scene.time.delayedCall(cue.durationMs, () => handle.stop());
    disposers.unshift(() => timer.remove(false));

    this.handles.add(handle);
    return handle;
  }

  stopAll(): void {
    for (const handle of [...this.handles]) handle.stop();
    this.handles.clear();
  }

  detach(): void {
    this.stopAll();
    for (const key of [this.dotKey, this.sparkKey, this.starKey, this.diamondKey, this.noteKey, this.puffKey]) {
      if (this.scene.textures.exists(key)) this.scene.textures.remove(key);
    }
    this.isAttached = false;
  }

  // -------------------------------------------------------------------------

  private filter(cue: VfxCue, color: number): Phaser.Filters.Controller {
    const list = this.camera.filters.internal;
    if (cue.kind === "glow") {
      return list.addGlow(color, cueParam(cue, "outer"), cueParam(cue, "inner"));
    }
    if (cue.kind === "tint") {
      const matrix = list.addColorMatrix();
      matrix.colorMatrix.set(channelScaleMatrix(color));
      // `alpha` is ColorMatrix's own mix between the original frame (0) and the
      // transformed one (1), so the authored `amount` is how far the screen
      // leans toward the cue's colour. What the player SEES is that times
      // `1 - min channel` — see `cueWeight`, which is why the no-effect tints
      // carry both a different neutral and a compensated `amount`.
      matrix.colorMatrix.alpha = clamp01(cueParam(cue, "amount"));
      return matrix;
    }
    // "filter" — a soft bloom-ish blur in the cue's colour.
    return list.addBlur(1, 2, 2, cueParam(cue, "strength"), color, 4);
  }

  private emit(
    cue: VfxCue,
    anchor: VfxAnchor,
    color: number,
  ): Phaser.GameObjects.Particles.ParticleEmitter {
    this.ensureDot();
    const spread = cueParam(cue, "spreadAngle");
    // Reduced motion keeps the cue — it just stops it travelling. The player
    // still gets the answer; it simply does not fly across the screen.
    const speed = REDUCED_MOTION ? 0 : varied(cueParam(cue, "speed"), cueParam(cue, "speedVariance"));
    const quantity = REDUCED_MOTION
      ? Math.max(1, Math.floor(cueParam(cue, "quantity") / 2))
      : cueParam(cue, "quantity");

    const config: Phaser.Types.GameObjects.Particles.ParticleEmitterConfig = {
      lifespan: cue.durationMs,
      speed,
      angle: { min: -spread / 2, max: spread / 2 },
      scale: { start: cueParam(cue, "scale"), end: 0, random: cueParam(cue, "scaleVariance") > 0 },
      alpha: { start: 1, end: 0 },
      gravityY: cueParam(cue, "gravityY"),
      tint: color,
      blendMode: "ADD",
      emitting: false,
    };
    const emitter = this.scene.add.particles(anchor.x, anchor.y, this.dotKey, config);
    emitter.setDepth(this.depth);
    // `explode`'s x/y are emitter-LOCAL, not a world point — passing the
    // anchor here doubled it. See dev-notes/phaser4-particle-explode-xy-is-emitter-local.md
    emitter.explode(quantity);
    return emitter;
  }

  /**
   * A looping animated sprite, for a cue whose asset is a real spritesheet
   * rather than the generated dot.
   *
   * `textureKey` names a texture the SCENE has already loaded — this class
   * still owns no loader, exactly like `colorKey` names a theme entry it never
   * invents. A missing or not-yet-loaded key is a content/wiring defect, not a
   * throw: the cue plays inert (an already-stopped handle upstream) rather than
   * crashing the cast, the same leniency `play()` already gives `kind: "none"`.
   *
   * No REDUCED_MOTION handling here, unlike `emit()` — this plays in place at
   * the anchor and never travels, so there is nothing to dampen.
   */
  private spriteFx(cue: VfxCue, anchor: VfxAnchor, color: number): Phaser.GameObjects.Sprite | null {
    const textureKey = cueStringParam(cue, "textureKey");
    if (!textureKey || !this.scene.textures.exists(textureKey)) return null;

    // One shared anim per texture, not per cast — repeat casts reuse it.
    const animKey = `${textureKey}__vfx_loop`;
    if (!this.scene.anims.exists(animKey)) {
      // frameTotal counts an implicit "__BASE" frame — see
      // dev-notes/phaser4-frametotal-includes-implicit-base-frame.md
      const frameTotal = this.scene.textures.get(textureKey).frameTotal;
      const frames = this.scene.anims.generateFrameNumbers(textureKey, {
        start: 0,
        end: Math.max(0, frameTotal - 2),
      });
      this.scene.anims.create({ key: animKey, frames, frameRate: cueParam(cue, "frameRate"), repeat: -1 });
    }

    const sprite = this.scene.add.sprite(anchor.x, anchor.y, textureKey, 0);
    sprite.setOrigin(0.5, cueParam(cue, "originY"));
    sprite.setDepth(this.depth);
    sprite.setScale(cueParam(cue, "scale"));
    sprite.setTint(color);
    sprite.setBlendMode("ADD");
    sprite.play(animKey);
    return sprite;
  }

  /**
   * One small dot, tinted per cue. Created once, dropped on detach.
   *
   * The fill is the theme's `ink`, NOT white. The theme has no white, so a
   * `0xffffff` here was a colour value introduced outside the contrast-checked
   * palette — the exact thing `colorKey` validation exists to prevent, smuggled
   * in one layer below it. `ink` is parchment, so a tinted dot lands a touch
   * warmer than a pure multiply would; that is the theme's own bias and it is
   * the point.
   */
  private ensureDot(): void {
    if (this.scene.textures.exists(this.dotKey)) return;
    const graphics = this.scene.make.graphics({}, false);
    graphics.fillStyle(NEUTRAL, 1);
    graphics.fillCircle(DOT_RADIUS, DOT_RADIUS, DOT_RADIUS);
    graphics.generateTexture(this.dotKey, DOT_RADIUS * 2, DOT_RADIUS * 2);
    graphics.destroy();
  }

  /** `burst`'s streak texture — a thin bar, tinted per-particle same as the dot. */
  private ensureSpark(): void {
    if (this.scene.textures.exists(this.sparkKey)) return;
    const graphics = this.scene.make.graphics({}, false);
    graphics.fillStyle(NEUTRAL, 1);
    graphics.fillRect(0, 6, 16, 2);
    graphics.generateTexture(this.sparkKey, 16, 12);
    graphics.destroy();
  }

  /** `rings`'s wisp texture — a 4-point star, white so per-particle tint works cleanly. */
  private ensureStar(): void {
    if (this.scene.textures.exists(this.starKey)) return;
    const graphics = this.scene.make.graphics({}, false);
    graphics.fillStyle(NEUTRAL, 1);
    drawStarShape(graphics, 14, 14, 14, 9);
    graphics.generateTexture(this.starKey, 28, 28);
    graphics.destroy();
  }

  /** `rings`'s echo-burst texture — a diamond, deliberately not the star/dot shape. */
  private ensureDiamond(): void {
    if (this.scene.textures.exists(this.diamondKey)) return;
    const graphics = this.scene.make.graphics({}, false);
    graphics.fillStyle(NEUTRAL, 1);
    drawDiamondShape(graphics, 16, 16, 24, 32);
    graphics.generateTexture(this.diamondKey, 32, 32);
    graphics.destroy();
  }

  /** `rings`'s note-glyph texture — procedural, not an external asset (see the section header). */
  private ensureNote(): void {
    if (this.scene.textures.exists(this.noteKey)) return;
    const graphics = this.scene.make.graphics({}, false);
    graphics.fillStyle(NEUTRAL, 1);
    drawNoteShape(graphics, 24, 24, 30);
    graphics.generateTexture(this.noteKey, 48, 48);
    graphics.destroy();
  }

  /** `plume`'s and `eruption`'s soft puff — three concentric ink-alpha layers for a feathered edge, same "ink not white" rule as `ensureDot`. */
  private ensurePuff(): void {
    if (this.scene.textures.exists(this.puffKey)) return;
    const graphics = this.scene.make.graphics({}, false);
    graphics.fillStyle(NEUTRAL, 0.5);
    graphics.fillCircle(16, 16, 16);
    graphics.fillStyle(NEUTRAL, 0.8);
    graphics.fillCircle(16, 16, 9);
    graphics.fillStyle(NEUTRAL, 1);
    graphics.fillCircle(16, 16, 4);
    graphics.generateTexture(this.puffKey, 32, 32);
    graphics.destroy();
  }
}
