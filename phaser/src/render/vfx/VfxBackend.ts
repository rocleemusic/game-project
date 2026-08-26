/**
 * What a VFX backend has to implement.
 *
 * WHY THIS INTERFACE EXISTS. The VFX track is meant to start on day 1, against
 * a fake, before any of the engine extraction lands. That only works if the
 * thing it builds against names no Phaser type — so this file imports nothing.
 * The real backend (`PhaserVfxBackend`) imports Phaser; the cue tables, the
 * event mapping and the tests do not.
 *
 * DISPOSAL IS MANDATORY, NOT HYGIENE. Phaser 4 filters are opt-in and are NOT
 * auto-released on scene shutdown. A cue that attaches a filter and never
 * detaches it accumulates one filter per cast, and a long walk ends up
 * compositing dozens — the same class of bug as the scrim leak, which
 * compounded alpha across screen changes and faded backdrops to black after ten
 * moves. `npm run walk` watches display-object count for exactly this. So
 * `detach()` is on the interface and every handle is stoppable.
 *
 * NO-EFFECT IS AN HONEST RESULT, NEVER A FAILURE. `VfxTone` below has no
 * "error" or "failure" member on purpose: there is no tone a backend could pick
 * that renders a no-effect cast red, as a shake, or as an error, because the
 * vocabulary does not contain one.
 *
 * ONLY `particles` IS ANCHORED. See `isAnchoredKind` — the other three kinds are
 * camera filters, which are screen-wide by construction, so `moveTo` on their
 * handles is a documented no-op rather than something a backend forgot. Anything
 * that wants a local cue at a receiver authors `particles`.
 */

/**
 * The register a cue plays in. Deliberately has no failure member — see the
 * header. A no-effect outcome plays a `"quiet"` cue or no cue at all.
 */
export type VfxTone = "quiet" | "warm" | "cold" | "arcane";

/**
 * What a cue is made of. `"none"` is a real, authorable answer.
 *
 * `vortex` and `trail` are both a per-frame-redrawn `Graphics` tapered
 * polyline — the technique proven out in `tools/vfx-prototypes/{vortex,fetch}-demo.html`
 * — rather than a particle cloud or a spritesheet. `vortex` is several strands
 * climbing and spinning around the anchor (breath); `trail` is a single strand
 * pulling into the anchor with an arrival flourish (fetch). They are two kinds,
 * not one with a mode switch, because their geometry is structurally different
 * (multi-strand spiral vs. single point-to-point pull) and a `kind` in this
 * table is a rendering technique, never a spell.
 *
 * `suspend` (`tools/vfx-prototypes/weigh-demo.html`) is a different shape again:
 * a continuous STATE, not a burst — an object rises off the anchor and hangs,
 * held by two slowly counter-rotating rings and orbiting motes, for as long as
 * the cue plays, then lowers back down. Same per-frame-redrawn Graphics
 * technique as `vortex`/`trail`, but there is no "fires once and is done" — the
 * whole shape is driven by where in [rise, hold, lower] `cue.durationMs` puts
 * it, so it is its own kind rather than a third mode of the other two.
 *
 * `burst` (`tools/vfx-prototypes/scratch-demo.html`) is a small multi-layer
 * composite fired once — a flash, an expanding ring, and a shower of real
 * Phaser particles (not Graphics) in the theme's warm family, plus the cue's
 * own colour on the ring. Reaches for real particle emitters (several at
 * once, unlike `particles`' one) rather than the per-frame Graphics
 * technique the three kinds above use, because the sparks need Phaser's own
 * physics variance (speed/scale/lifespan ranges) that would be its own
 * hand-rolled simulation to fake in Graphics. The prototype's second,
 * elongated "streak" spark family was removed rather than fixed (Roc,
 * 2026-08-23) — it needed each particle rotated to face its own direction of
 * travel, which this file's shipped version couldn't do (no runtime Particle
 * subclass; see `PhaserVfxBackend.ts`'s file header), so it rendered at a
 * fixed, mostly-wrong orientation.
 *
 * `pop` (`tools/vfx-prototypes/portion-demo.html`) is N identical shapes
 * popping in on a staggered tween, holding with a slow spin/breathe, then
 * fading together. Unlike every kind above, each shape is drawn into its
 * Graphics object ONCE and then TWEENED — Phaser's own tween engine
 * interpolates a GameObject's transform directly, so this needs no per-frame
 * redraw code at all, closer in spirit to `sprite` than to `vortex`/`trail`.
 *
 * `rings` (`tools/vfx-prototypes/echo-demo.html`) is the biggest composite:
 * several staggered, flattened-ellipse rings (each a Graphics grow/fade
 * tween), a flash, and — on the first ring only — a note-glyph particle burst
 * and a wispy star cloud, plus a small diamond burst on every ring. Named for
 * the technique, not the spell it was built for (see this file's own header)
 * — it happens to be an ALTERNATE for the `echo` spell, whose shipped cue
 * stays on `sprite` unless explicitly repointed.
 *
 * `plume` (`tools/vfx-prototypes/waft-demo.html`) is a rising CONE: many
 * soft puffs spawn from one shared point and fan outward only as they climb
 * (the lateral spread is a function of how far risen, not of spawn
 * position), plus two staggered, flattened-ellipse ground rings — same
 * squash-and-stroke technique as `rings`, reused rather than reinvented,
 * with the first (higher) ring firing before the second. A per-frame-redrawn
 * Graphics + tracked Image pool, not a `particles` emitter, because the
 * cone's spread and the puffs' own size both have to be a function of each
 * puff's individual age, which Phaser's particle config can't express.
 *
 * `beacon` (`tools/vfx-prototypes/steep-demo.html`) borrows its shape from
 * loot-pickup VFX, not from any other kind here: a flattened-ellipse ground
 * ring (again `rings`' technique) under a soft vertical glow pillar, with
 * small star motes launched on real closed-form projectile arcs (angle +
 * speed + gravity, position a pure function of age) that rise and curve back
 * down like a fountain rather than drifting straight up. Reads as "something
 * is gathering here," which is why it replaced `plume`'s rising-column shape
 * for a spell about drawing virtue into something, not sending it upward.
 *
 * `eruption` (`tools/vfx-prototypes/temper-demo.html`) is a sudden, dense
 * composite: a flash, two staggered splash rings, a firework-style radial
 * streak burst in two colour families (ported from
 * `tools/vfx-prototypes/firework-demo.html`'s `StreakParticle`, which
 * auto-rotates each streak to face its own velocity), then — deliberately
 * delayed a beat behind the streaks so the streaks read before being visually
 * buried — a fast outward puff of soft-Image "steam" and a scatter of bright
 * sparks. Everything fires once and dissipates fast; nothing loops or holds,
 * unlike `plume`/`beacon`.
 */
export type VfxKind =
  | "none"
  | "filter"
  | "particles"
  | "tint"
  | "glow"
  | "sprite"
  | "vortex"
  | "trail"
  | "suspend"
  | "burst"
  | "pop"
  | "rings"
  | "plume"
  | "beacon"
  | "eruption";

/**
 * Whether a cue of this kind plays AT its anchor, or across the whole screen.
 *
 * `filter`, `tint` and `glow` are camera filters. A camera filter composites the
 * finished frame; there is no position to give it, so an anchor means nothing
 * and `VfxHandle.moveTo` on one is a no-op BY CONTRACT, not by oversight.
 * `particles`, `sprite`, `vortex` and `trail` all play at a point and are
 * therefore re-anchorable. Stated here so the API stops implying every cue
 * tracks its receiver — a test asserts the real backend and the fake agree
 * with this function.
 */
export function isAnchoredKind(kind: VfxKind): boolean {
  return (
    kind === "particles" ||
    kind === "sprite" ||
    kind === "vortex" ||
    kind === "trail" ||
    kind === "suspend" ||
    kind === "burst" ||
    kind === "pop" ||
    kind === "rings" ||
    kind === "plume" ||
    kind === "beacon" ||
    kind === "eruption"
  );
}

/**
 * Where a cue plays, in SCENE coordinates.
 *
 * Backdrops pan, so a cue anchored to a receiver has to move with it. The
 * backend is handed the position at play time and re-anchors through
 * `VfxHandle.moveTo` rather than reading any scene state itself.
 */
export interface VfxAnchor {
  readonly x: number;
  readonly y: number;
  /** Optional radius hint, for cues that scale to their target. */
  readonly radius?: number;
}

/**
 * One authored cue. Data — lives in `render/vfx/cues.json`, never in a switch.
 */
export interface VfxCue {
  readonly id: string;
  readonly kind: VfxKind;
  readonly tone: VfxTone;
  /** Milliseconds. A cue that does not end on its own is a leak. */
  readonly durationMs: number;
  /** Colour key into `ui/theme.ts`. No new colour values may be introduced. */
  readonly colorKey?: string;
  /** Backend-specific knobs, kept opaque so the fake can ignore them. */
  readonly params?: Readonly<Record<string, number | string | boolean>>;
}

/**
 * A playing cue. Always stoppable, always idempotent to stop.
 */
export interface VfxHandle {
  readonly cueId: string;
  /** False once the cue has finished or been stopped. */
  readonly active: boolean;
  /**
   * Re-anchor while playing — the backdrop pans under a running cue.
   *
   * A no-op unless `isAnchoredKind(cue.kind)`, which is the honest answer for a
   * camera filter rather than a silently ignored call.
   */
  moveTo(anchor: VfxAnchor): void;
  /** Stop and release. Safe to call twice; safe to call after it ended. */
  stop(): void;
}

/**
 * The backend contract.
 *
 * Implementations are `PhaserVfxBackend` (real) and `FakeVfxBackend` (tests and
 * the day-1 track). Neither is named in this file.
 */
export interface VfxBackend {
  /** False after `detach()`. `play` on a detached backend is a no-op. */
  readonly attached: boolean;

  /**
   * Start a cue. Returns a handle even for `kind: "none"` — an already-inert
   * handle — so callers never branch on whether a cue was authored.
   */
  play(cue: VfxCue, anchor: VfxAnchor): VfxHandle;

  /** Stop every cue this backend started. Does not detach. */
  stopAll(): void;

  /**
   * Release everything: cues, filters, particle emitters, textures.
   *
   * MANDATORY, and must be safe to call twice. Phaser 4 will not do it for you
   * on scene shutdown — see the header. After this the backend is inert.
   */
  detach(): void;
}
