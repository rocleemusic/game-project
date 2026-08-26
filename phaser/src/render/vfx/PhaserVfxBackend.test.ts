/**
 * The leak test, run against the REAL backend.
 *
 * WHY THIS FILE EXISTS. `VfxSystem.test.ts` cycles attach/detach 25 times and
 * asserts `fakeVfxLiveHandles() === 0` — but that counter is incremented and
 * decremented by `FakeVfxBackend` itself, so it proves the fake's own
 * bookkeeping is symmetric, which was never in doubt. The file that can
 * actually leak is `PhaserVfxBackend`, and it had no test at all: nothing
 * proved that `filters.internal.remove(controller)`, `emitter.destroy()` and
 * `timer.remove(false)` are registered per resource, which is exactly the code
 * the scrim-leak precedent says gets got wrong.
 *
 * HOW IT RUNS WITHOUT A CANVAS. `PhaserVfxBackend` imports Phaser for TYPES
 * ONLY, so nothing of Phaser executes at module load. That lets a ~90-line stub
 * scene stand in for the real one and COUNT: every `filters.internal.add*`
 * against every `remove`, every emitter against every `destroy`, every timer
 * against every `remove`. `net()` returning all zeros is the assertion the
 * whole disposal narrative was built to earn.
 *
 * IT ALSO PINS THE TWO THINGS PROSE GOT WRONG BEFORE. The dot texture is filled
 * with a THEME colour rather than white, and `tint` actually uses the cue's
 * resolved `colorKey` instead of discarding it for a brightness pump.
 *
 * AND THE CEILING, WHICH DISPOSAL ALONE DID NOT GIVE. Every cue released itself
 * and nothing bounded how many could be live at once, so the real limit was the
 * cast rate — a property of the player. `maxConcurrent` sheds the oldest before
 * adding a controller, and the test below fires 50 cues with the clock frozen so
 * nothing can self-expire: the cap is the only thing that can hold the line.
 */

import { describe, expect, it } from "vitest";
import type Phaser from "phaser";
import { COLOR } from "../../ui/theme";
import { cueColor } from "./CueTable";
import { PhaserVfxBackend } from "./PhaserVfxBackend";
import type { VfxCue } from "./VfxBackend";

// ---------------------------------------------------------------------------
// The stub scene — one layer below FakeVfxBackend, counting Phaser's own calls
// ---------------------------------------------------------------------------

interface FilterCall {
  readonly method: "glow" | "blur" | "colorMatrix";
  readonly color?: number;
  readonly args: readonly unknown[];
}

function stubScene() {
  const filterCalls: FilterCall[] = [];
  const controllers: object[] = [];
  const removedControllers: object[] = [];
  const matrices: { set: number[] | null; alpha: number; brightnessCalls: number }[] = [];

  const emitters: {
    x: number;
    y: number;
    key: string;
    config: Record<string, unknown>;
    depth: number;
    exploded: number;
    explodeArgs: number[];
    moves: number;
    destroyed: boolean;
  }[] = [];

  const timers: { ms: number; fire: () => void; removed: boolean }[] = [];
  const loopEvents: { delay: number; fire: () => void; removed: boolean }[] = [];
  const tweens: { config: Record<string, unknown>; stopped: boolean }[] = [];
  const graphicsFills: number[] = [];
  const textures = new Set<string>();
  const removedTextures: string[] = [];
  const animKeys = new Set<string>();
  const textureFrameTotals = new Map<string, number>();

  const drawnGraphics: {
    depth: number;
    blendMode: string;
    destroyed: boolean;
    lineColors: number[];
    fillColors: number[];
    clears: number;
    x: number;
    y: number;
    scale: number;
    angle: number;
    alpha: number;
  }[] = [];

  const sprites: {
    x: number;
    y: number;
    key: string;
    frame: number;
    depth: number;
    scale: number;
    angle: number;
    alpha: number;
    tint: number;
    tintMode: number;
    blendMode: string;
    playedAnim: string;
    destroyed: boolean;
  }[] = [];


  const track = <T extends object>(controller: T, call: FilterCall): T => {
    filterCalls.push(call);
    controllers.push(controller);
    return controller;
  };

  const scene = {
    cameras: {
      main: {
        filters: {
          internal: {
            addGlow: (color?: number, ...args: unknown[]) =>
              track({ kind: "glow" }, { method: "glow", color, args }),
            addBlur: (
              quality?: number,
              x?: number,
              y?: number,
              strength?: number,
              color?: number,
              steps?: number,
            ) =>
              track(
                { kind: "blur" },
                { method: "blur", color, args: [quality, x, y, strength, steps] },
              ),
            addColorMatrix: () => {
              const record = { set: null as number[] | null, alpha: 1, brightnessCalls: 0 };
              matrices.push(record);
              const colorMatrix = {
                set(value: number[]) {
                  record.set = value;
                  return this;
                },
                brightness() {
                  record.brightnessCalls++;
                  return this;
                },
                get alpha() {
                  return record.alpha;
                },
                set alpha(v: number) {
                  record.alpha = v;
                },
              };
              return track({ kind: "colorMatrix", colorMatrix }, { method: "colorMatrix", args: [] });
            },
            remove: (controller: object) => {
              removedControllers.push(controller);
            },
          },
        },
      },
    },
    time: {
      now: 0,
      delayedCall: (ms: number, fire: () => void) => {
        const timer = { ms, fire, removed: false, remove: () => void (timer.removed = true) };
        timers.push(timer as unknown as (typeof timers)[number]);
        return timer;
      },
      // `vortex`/`trail`'s per-frame redraw loop. Same resource shape as
      // `delayedCall` — a `.remove()`-able handle — so it is tracked in the
      // same `timers` bucket the disposal tests already assert on; a repeating
      // loop that never gets removed is exactly as much a leak as a one-shot
      // that doesn't.
      addEvent: (config: { delay: number; loop?: boolean; callback: () => void }) => {
        const timer = {
          ms: config.delay,
          fire: config.callback,
          removed: false,
          remove: () => void (timer.removed = true),
        };
        loopEvents.push(timer as unknown as (typeof loopEvents)[number]);
        timers.push(timer as unknown as (typeof timers)[number]);
        return timer;
      },
    },
    tweens: {
      // Runs synchronously to completion — no real tween clock in this stub.
      // `onUpdate` fires once so a test can assert something drew (`burst`'s
      // ring); every numeric config key (`x`, `y`, `scale`, `angle`, `alpha`,
      // ...) is applied straight onto `targets` so `portion`'s chained
      // onComplete callbacks (which build further tweens/resources) actually
      // run, the same way they would once a real tween finished. `stop()` is
      // the resource the disposal tests track.
      add: (config: Record<string, unknown> & { targets?: unknown; onUpdate?: () => void; onComplete?: () => void }) => {
        const record = { config, stopped: false };
        tweens.push(record);
        (config.onUpdate as (() => void) | undefined)?.();
        if (config.targets) {
          const targets = Array.isArray(config.targets) ? config.targets : [config.targets];
          const skip = new Set(["targets", "duration", "delay", "ease", "onUpdate", "onComplete", "repeat", "yoyo"]);
          for (const [key, value] of Object.entries(config)) {
            if (skip.has(key) || typeof value !== "number") continue;
            for (const t of targets) (t as Record<string, unknown>)[key] = value;
          }
        }
        (config.onComplete as (() => void) | undefined)?.();
        const tween = { stop: () => void (record.stopped = true), config };
        return tween;
      },
    },
    add: {
      graphics: () => {
        // One object for everything — tracked state AND the transform
        // properties a real Phaser tween writes into directly (`portion`'s
        // orbs are drawn once then TWEENED, not redrawn per frame). Used to be
        // two objects (a tracking `record` plus the returned `g`); split like
        // that, a tween writing `g.x` was invisible to anything reading
        // `stub.drawnGraphics[i].x`, since that array held `record`, not `g`.
        const g = {
          depth: 0,
          blendMode: "",
          destroyed: false,
          lineColors: [] as number[],
          fillColors: [] as number[],
          clears: 0,
          x: 0,
          y: 0,
          scale: 1,
          angle: 0,
          alpha: 1,
          setDepth(d: number) {
            g.depth = d;
            return g;
          },
          setPosition(nx: number, ny: number) {
            g.x = nx;
            g.y = ny;
            return g;
          },
          setScale(s: number) {
            g.scale = s;
            return g;
          },
          setBlendMode(m: string) {
            g.blendMode = m;
            return g;
          },
          clear() {
            g.clears++;
            return g;
          },
          lineStyle(_width: number, color: number) {
            g.lineColors.push(color);
            return g;
          },
          fillStyle(color: number) {
            g.fillColors.push(color);
            return g;
          },
          beginPath() {
            return g;
          },
          moveTo() {
            return g;
          },
          lineTo() {
            return g;
          },
          strokePath() {
            return g;
          },
          fillCircle() {
            return g;
          },
          fillEllipse() {
            return g;
          },
          fillRoundedRect() {
            return g;
          },
          strokeCircle() {
            return g;
          },
          strokeEllipse() {
            return g;
          },
          closePath() {
            return g;
          },
          fillPath() {
            return g;
          },
          destroy() {
            g.destroyed = true;
          },
        };
        drawnGraphics.push(g);
        return g;
      },
      particles: (x: number, y: number, key: string, config: Record<string, unknown>) => {
        const emitter = {
          x,
          y,
          key,
          config,
          depth: 0,
          exploded: 0,
          explodeArgs: [] as number[],
          moves: 0,
          destroyed: false,
          setDepth(d: number) {
            emitter.depth = d;
            return emitter;
          },
          // Captures the FULL arg list, not just quantity: `explode`'s optional
          // x/y are an emitter-LOCAL offset, and passing the anchor there (while
          // the emitter already sits at the anchor) double-adds it — the 2x-anchor
          // particle bug. Recording every arg lets a test assert no local offset.
          explode(quantity: number, ...rest: number[]) {
            emitter.exploded += quantity;
            emitter.explodeArgs = [quantity, ...rest];
            return emitter;
          },
          setPosition(nx: number, ny: number) {
            emitter.x = nx;
            emitter.y = ny;
            emitter.moves++;
            return emitter;
          },
          destroy() {
            emitter.destroyed = true;
          },
        };
        emitters.push(emitter);
        return emitter;
      },
      sprite: (x: number, y: number, key: string, frame: number) => {
        const sprite = {
          x, y, key, frame,
          depth: 0, scale: 1, angle: 0, alpha: 1, tint: 0xffffff, tintMode: 0, blendMode: "", originY: 0.5,
          playedAnim: "",
          destroyed: false,
          setDepth(d: number) { sprite.depth = d; return sprite; },
          setScale(s: number) { sprite.scale = s; return sprite; },
          setAlpha(a: number) { sprite.alpha = a; return sprite; },
          setTint(t: number) { sprite.tint = t; return sprite; },
          setTintMode(m: number) { sprite.tintMode = m; return sprite; },
          setBlendMode(m: string) { sprite.blendMode = m; return sprite; },
          setOrigin(_x: number, y: number) { sprite.originY = y; return sprite; },
          play(anim: string) { sprite.playedAnim = anim; return sprite; },
          setPosition(nx: number, ny: number) { sprite.x = nx; sprite.y = ny; return sprite; },
          destroy() { sprite.destroyed = true; },
        };
        sprites.push(sprite);
        return sprite;
      },
    },
    anims: {
      exists: (key: string) => animKeys.has(key),
      create: (config: { key: string }) => { animKeys.add(config.key); },
      generateFrameNumbers: (_key: string, range: { start: number; end: number }) => range,
    },
    textures: {
      exists: (key: string) => textures.has(key),
      remove: (key: string) => {
        textures.delete(key);
        removedTextures.push(key);
      },
      get: (key: string) => ({ frameTotal: textureFrameTotals.get(key) ?? 1 }),
    },
    make: {
      graphics: () => ({
        fillStyle(color: number) {
          graphicsFills.push(color);
          return this;
        },
        fillCircle() {
          return this;
        },
        fillRect() {
          return this;
        },
        beginPath() {
          return this;
        },
        moveTo() {
          return this;
        },
        lineTo() {
          return this;
        },
        closePath() {
          return this;
        },
        fillPath() {
          return this;
        },
        generateTexture(key: string) {
          textures.add(key);
          return this;
        },
        destroy() {},
      }),
    },
  };

  return {
    scene: scene as unknown as Phaser.Scene,
    filterCalls,
    matrices,
    emitters,
    sprites,
    animKeys,
    timers,
    loopEvents,
    tweens,
    drawnGraphics,
    graphicsFills,
    removedTextures,
    liveTextures: textures,
    textureFrameTotals,
    /** Test-only: seed a pre-loaded spritesheet, as a scene's preload() would. */
    seedTexture: (key: string, frameTotal: number) => {
      textures.add(key);
      textureFrameTotals.set(key, frameTotal);
    },
    /** Test-only: advance the stub's clock, read by `GraphicsFx` as `scene.time.now`. */
    setNow: (ms: number) => {
      scene.time.now = ms;
    },
    /** Every resource class, created minus released. All zeros is the only pass. */
    net: () => ({
      filters: controllers.length - removedControllers.length,
      emitters: emitters.length - emitters.filter((e) => e.destroyed).length,
      sprites: sprites.length - sprites.filter((s) => s.destroyed).length,
      graphics: drawnGraphics.length - drawnGraphics.filter((g) => g.destroyed).length,
      timers: timers.length - timers.filter((t) => t.removed).length,
      tweens: tweens.length - tweens.filter((t) => t.stopped).length,
    }),
    counts: () => ({
      filters: controllers.length,
      emitters: emitters.length,
      sprites: sprites.length,
      graphics: drawnGraphics.length,
      timers: timers.length,
      tweens: tweens.length,
    }),
  };
}

// ---------------------------------------------------------------------------
// Cues. Local, so this file names no spell — the table is the only place ids live.
// ---------------------------------------------------------------------------

const glow: VfxCue = { id: "cue.t.glow", kind: "glow", tone: "arcane", durationMs: 900, colorKey: "gold", params: { outer: 3 } };
const blur: VfxCue = { id: "cue.t.filter", kind: "filter", tone: "warm", durationMs: 900, colorKey: "ember", params: { strength: 0.6 } };
const tint: VfxCue = { id: "cue.t.tint", kind: "tint", tone: "cold", durationMs: 500, colorKey: "dusk", params: { amount: 0.35 } };
const dots: VfxCue = { id: "cue.t.particles", kind: "particles", tone: "warm", durationMs: 900, colorKey: "ember", params: { quantity: 12, speed: 80, spreadAngle: 180, scale: 0.5 } };
const sprite: VfxCue = { id: "cue.t.sprite", kind: "sprite", tone: "warm", durationMs: 900, colorKey: "ember", params: { textureKey: "vfx_test_sheet", frameRate: 14, scale: 1 } };
const vortex: VfxCue = { id: "cue.t.vortex", kind: "vortex", tone: "quiet", durationMs: 3300, colorKey: "dusk" };
const trail: VfxCue = { id: "cue.t.trail", kind: "trail", tone: "arcane", durationMs: 950, colorKey: "vfxGold" };
const suspend: VfxCue = { id: "cue.t.suspend", kind: "suspend", tone: "cold", durationMs: 2530, colorKey: "dusk" };
const burst: VfxCue = { id: "cue.t.burst", kind: "burst", tone: "quiet", durationMs: 700, colorKey: "vfxEmber" };
const pop: VfxCue = { id: "cue.t.pop", kind: "pop", tone: "cold", durationMs: 1300, colorKey: "dusk" };
const rings: VfxCue = { id: "cue.t.rings", kind: "rings", tone: "arcane", durationMs: 1850, colorKey: "dusk" };
const plume: VfxCue = { id: "cue.t.plume", kind: "plume", tone: "quiet", durationMs: 2625, colorKey: "dusk" };
const beacon: VfxCue = { id: "cue.t.beacon", kind: "beacon", tone: "warm", durationMs: 1800, colorKey: "vfxEmber" };
const eruption: VfxCue = { id: "cue.t.eruption", kind: "eruption", tone: "warm", durationMs: 500, colorKey: "vfxEmber" };
const nothing: VfxCue = { id: "cue.t.none", kind: "none", tone: "quiet", durationMs: 0 };

const HERE = { x: 100, y: 200 };

// ---------------------------------------------------------------------------

describe("PhaserVfxBackend releases every resource it creates", () => {
  it("registers a disposer per filter controller, and runs it on stop", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(glow, HERE);

    expect(stub.counts().filters).toBe(1);
    expect(stub.counts().timers).toBe(1);
    expect(stub.net().filters).toBe(1);

    handle.stop();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    expect(handle.active).toBe(false);

    // Idempotent: a second stop must not double-remove.
    handle.stop();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("destroys a particle emitter and removes its timer on stop", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    const handle = backend.play(dots, HERE);

    expect(stub.emitters).toHaveLength(1);
    expect(stub.emitters[0].depth).toBe(42);
    expect(stub.emitters[0].exploded).toBeGreaterThan(0);

    handle.stop();
    expect(stub.emitters[0].destroyed).toBe(true);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("releases a cue when its own timer fires, with no stop() call", () => {
    // The self-expiry path. Without it a cue lives until detach, which IS the leak.
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(blur, HERE);
    expect(stub.net().filters).toBe(1);

    stub.timers[0].fire();
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("releases everything on stopAll, and everything again on detach", () => {
    const stub = stubScene();
    // Above the concurrency ceiling on purpose, so this exercises the
    // four-resource release path rather than the shedding path below.
    const backend = new PhaserVfxBackend({ scene: stub.scene, maxConcurrent: 8 });
    for (const cue of [glow, blur, tint, dots]) backend.play(cue, HERE);
    expect(stub.counts().filters).toBe(3);
    expect(stub.counts().emitters).toBe(1);
    expect(backend.liveCount).toBe(4);

    backend.stopAll();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    expect(backend.liveCount).toBe(0);
    expect(backend.attached).toBe(true);

    backend.play(dots, HERE);
    backend.detach();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    expect(backend.attached).toBe(false);
  });

  it("drops the generated dot texture on detach, and survives a second detach", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(dots, HERE);
    expect(stub.liveTextures.size).toBe(1);

    backend.detach();
    expect(stub.liveTextures.size).toBe(0);
    expect(stub.removedTextures).toHaveLength(1);

    backend.detach();
    expect(stub.removedTextures).toHaveLength(1);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });

  it("creates nothing at all once detached, and nothing for kind:none", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });

    const inert = backend.play(nothing, HERE);
    expect(inert.active).toBe(false);
    expect(stub.counts()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });

    backend.detach();
    const afterDetach = backend.play(glow, HERE);
    expect(afterDetach.active).toBe(false);
    afterDetach.moveTo(HERE);
    afterDetach.stop();
    expect(stub.counts()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });

  it("never composites more cues at once than the cap allows", () => {
    // Disposal alone left the ceiling as "how fast can a human cast" — a
    // property of the player, not of the code. 50 cues back to back, no clock
    // advanced, so nothing self-expires: the only thing that can hold the line
    // is the shed-the-oldest path in `play`.
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, maxConcurrent: 3 });
    let peak = 0;
    for (let i = 0; i < 50; i++) {
      backend.play(i % 2 === 0 ? glow : blur, HERE);
      peak = Math.max(peak, backend.liveCount, stub.net().filters);
    }
    expect(peak).toBe(3);
    expect(backend.liveCount).toBe(3);
    expect(stub.counts().filters).toBe(50);
    // Shedding is a release, not a leak: 47 of the 50 are already gone.
    expect(stub.net().filters).toBe(3);
    expect(stub.net().timers).toBe(3);

    backend.detach();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });

  it("keeps the newest cue when it sheds, never the oldest", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, maxConcurrent: 1 });
    const first = backend.play(glow, HERE);
    const second = backend.play(blur, HERE);
    expect(first.active).toBe(false);
    expect(second.active).toBe(true);
    expect(backend.liveCount).toBe(1);
    backend.detach();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });

  it("leaves zero retained Phaser handles after 25 attach/detach cycles", () => {
    // The same 25 cycles VfxSystem.test.ts runs against the fake, run here
    // against real add/remove accounting. A missing disposer shows up as a
    // rising `net()`, which is what a playtest would otherwise report as
    // "the screen went dark after a while".
    const stub = stubScene();
    let started = 0;
    for (let cycle = 0; cycle < 25; cycle++) {
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      for (const cue of [glow, blur, tint, dots, glow]) {
        backend.play(cue, HERE);
        started++;
      }
      expect(stub.net().filters + stub.net().emitters).toBeGreaterThan(0);
      backend.detach();
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
    expect(started).toBe(125);
    expect(stub.counts().timers).toBe(125);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });
});

describe("PhaserVfxBackend anchors exactly what it says it anchors", () => {
  it("moves a particle cue and, by contract, not a camera-filter one", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });

    const particles = backend.play(dots, HERE);
    particles.moveTo({ x: 500, y: 600 });
    expect(stub.emitters[0].moves).toBe(1);
    expect([stub.emitters[0].x, stub.emitters[0].y]).toEqual([500, 600]);

    // A camera filter composites the finished frame; there is no position to
    // give it. `isAnchoredKind` says so and this is the proof the API is not
    // quietly swallowing the call.
    const screenWide = backend.play(glow, HERE);
    screenWide.moveTo({ x: 5, y: 5 });
    expect(stub.emitters).toHaveLength(1);
    expect(screenWide.active).toBe(true);

    backend.detach();
  });

  it("explodes from the emitter origin, passing NO local x/y offset (the 2x-anchor bug)", () => {
    // REGRESSION GUARD (2026-08-19). emit() constructs the emitter AT the anchor,
    // so the burst must explode from the emitter's own origin — `explode(quantity)`
    // with no x/y. The bug was `explode(quantity, anchor.x, anchor.y)`: `explode`'s
    // x/y are an emitter-LOCAL offset the worldMatrix re-applies, so a cast at
    // (100,200) landed at (200,400). This asserts the offset is gone. (The old stub
    // typed `explode(quantity)` and silently dropped the extra args, which is why
    // the suite never caught the bug the first time.)
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });

    backend.play(dots, HERE);
    expect([stub.emitters[0].x, stub.emitters[0].y]).toEqual([HERE.x, HERE.y]);
    // Exactly one arg — the quantity. Any local x/y here is the 2x-anchor bug.
    expect(stub.emitters[0].explodeArgs).toHaveLength(1);

    backend.detach();
  });
});

describe("PhaserVfxBackend takes every colour from ui/theme.ts", () => {
  it("hands the cue's resolved theme colour to glow and to blur", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(glow, HERE);
    backend.play(blur, HERE);

    expect(stub.filterCalls[0]).toMatchObject({ method: "glow", color: cueColor("gold") });
    expect(stub.filterCalls[1]).toMatchObject({ method: "blur", color: cueColor("ember") });
    expect(stub.filterCalls[0].color).toBe(COLOR.goldNum);
    backend.detach();
  });

  it("tints toward the cue's colorKey instead of discarding it", () => {
    // The bug this pins: the first pass called `brightness(1 + amount)` and
    // never touched the colour it had just resolved, so a blocked gate and a
    // receiver state change rendered identically — and both rendered as a
    // full-screen brighten, which is the flash the cue table forbids.
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(tint, HERE);

    const matrix = stub.matrices[0];
    expect(matrix.brightnessCalls).toBe(0);
    expect(matrix.set).not.toBeNull();
    expect(matrix.alpha).toBeCloseTo(0.35, 5);

    const dusk = cueColor("dusk")!;
    const [r, g, b] = [(dusk >> 16) & 255, (dusk >> 8) & 255, dusk & 255].map((c) => c / 255);
    expect(matrix.set![0]).toBeCloseTo(r, 5);
    expect(matrix.set![6]).toBeCloseTo(g, 5);
    expect(matrix.set![12]).toBeCloseTo(b, 5);
    expect(matrix.set![18]).toBe(1);
    backend.detach();
  });

  it("gives two different colorKeys two different tints", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(tint, HERE);
    backend.play({ ...tint, id: "cue.t.tint2", colorKey: "success" }, HERE);
    expect(stub.matrices[0].set).not.toEqual(stub.matrices[1].set);
    backend.detach();
  });

  it("draws the particle dot in a theme colour, never in white", () => {
    // HARD CONSTRAINT: the theme carries no white. `0xffffff` here was a colour
    // value introduced outside the contrast-checked palette.
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(dots, HERE);

    expect(stub.graphicsFills).toEqual([cueColor("ink")]);
    expect(stub.graphicsFills[0]).not.toBe(0xffffff);
    expect(Object.values(COLOR)).toContain(COLOR.ink);
    backend.detach();
  });

  it("falls back to a theme colour when a cue names none", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play({ id: "cue.t.bare", kind: "glow", tone: "quiet", durationMs: 300 }, HERE);
    expect(stub.filterCalls[0].color).toBe(cueColor("ink"));
    backend.detach();
  });
});

describe("PhaserVfxBackend plays sprite-kind cues against an already-loaded texture", () => {
  it("creates a sprite, tints it, plays a looping anim, and destroys it on stop", () => {
    const stub = stubScene();
    stub.seedTexture("vfx_test_sheet", 17); // 16 real frames + Phaser's implicit __BASE
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    const handle = backend.play(sprite, HERE);

    expect(stub.sprites).toHaveLength(1);
    const s = stub.sprites[0];
    expect(s.depth).toBe(42);
    expect(s.tint).toBe(cueColor("ember"));
    expect(s.blendMode).toBe("ADD");
    expect(s.playedAnim).toBe("vfx_test_sheet__vfx_loop");
    expect(stub.animKeys.has("vfx_test_sheet__vfx_loop")).toBe(true);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 1, graphics: 0, tweens: 0, timers: 1 });

    handle.stop();
    expect(s.destroyed).toBe(true);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("derives the anim's frame range from frameTotal, excluding Phaser's __BASE frame", () => {
    const stub = stubScene();
    stub.seedTexture("vfx_test_sheet", 17);
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(sprite, HERE);
    // 17 total minus __BASE is 16 real frames, indices 0..15.
    expect(stub.sprites[0].frame).toBe(0);
    backend.detach();
  });

  it("reuses one shared anim across repeat casts instead of redefining it", () => {
    const stub = stubScene();
    stub.seedTexture("vfx_test_sheet", 17);
    const backend = new PhaserVfxBackend({ scene: stub.scene, maxConcurrent: 8 });
    backend.play(sprite, HERE);
    backend.play({ ...sprite, id: "cue.t.sprite2" }, HERE);
    expect(stub.animKeys.size).toBe(1);
    expect(stub.sprites).toHaveLength(2);
    backend.detach();
  });

  it("moves the sprite on moveTo, since sprite is an anchored kind", () => {
    const stub = stubScene();
    stub.seedTexture("vfx_test_sheet", 17);
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(sprite, HERE);
    handle.moveTo({ x: 500, y: 600 });
    expect([stub.sprites[0].x, stub.sprites[0].y]).toEqual([500, 600]);
    backend.detach();
  });

  it("plays inert and creates nothing when the named texture was never loaded", () => {
    // A content/wiring defect (typo'd or not-yet-loaded textureKey) must not
    // crash the cast — same leniency as `kind: "none"`.
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(sprite, HERE); // texture was never seeded this time
    expect(stub.sprites).toHaveLength(0);
    expect(handle.active).toBe(true); // the handle itself is still real, just inert
    handle.stop();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("leaves zero retained sprites after repeated attach/detach cycles", () => {
    const stub = stubScene();
    stub.seedTexture("vfx_test_sheet", 17);
    for (let cycle = 0; cycle < 10; cycle++) {
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(sprite, HERE);
      backend.detach();
    }
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });
});

describe("PhaserVfxBackend plays vortex/trail-kind cues as a redrawn Graphics tail", () => {
  it("creates one Graphics object and one repeating timer, additive-blended, at the cue's depth", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    const handle = backend.play(vortex, HERE);

    expect(stub.drawnGraphics).toHaveLength(1);
    expect(stub.drawnGraphics[0].depth).toBe(42);
    expect(stub.drawnGraphics[0].blendMode).toBe("ADD");
    // Two timers: the per-frame redraw loop (`addEvent`) plus the self-expiry
    // `delayedCall` every kind gets in `play()`.
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 1, tweens: 0, timers: 2 });

    handle.stop();
    expect(stub.drawnGraphics[0].destroyed).toBe(true);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("redraws every tick: clears the graphics and draws only in the cue's own colour and the theme's ink, never white", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(vortex, HERE);
    stub.setNow(700); // partway through the grow envelope
    stub.loopEvents[0].fire();
    stub.setNow(716);
    stub.loopEvents[0].fire();

    const g = stub.drawnGraphics[0];
    expect(g.clears).toBe(2);
    const used = new Set([...g.lineColors, ...g.fillColors]);
    expect(used.size).toBeGreaterThan(0);
    for (const c of used) expect([cueColor("dusk"), cueColor("ink")]).toContain(c);
    backend.detach();
  });

  it("draws trail's arrival flourish only after the travel window elapses", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(trail, HERE);

    stub.setNow(300); // mid-travel — no arrival ring yet
    stub.loopEvents[0].fire();
    expect(stub.drawnGraphics[0].fillColors.length + stub.drawnGraphics[0].lineColors.length).toBeGreaterThan(0);
    const midTravelStrokes = stub.drawnGraphics[0].lineColors.length;

    stub.setNow(700); // past the 550ms travel window, inside the arrival flourish
    stub.loopEvents[0].fire();
    expect(stub.drawnGraphics[0].lineColors.length).toBeGreaterThan(midTravelStrokes);
    backend.detach();
  });

  it("moves the anchor on moveTo, since both kinds are anchored", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(vortex, HERE);
    // No position setter on the Graphics mock itself — GraphicsFx keeps the
    // anchor internally and the next redraw uses it. Proven indirectly: the
    // move must not throw and the handle must still be live and anchored.
    handle.moveTo({ x: 500, y: 600 });
    expect(handle.active).toBe(true);
    backend.detach();
  });

  it("releases the repeating timer and the graphics object on its own self-expiry, with no stop() call", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(trail, HERE);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 1, tweens: 0, timers: 2 });

    // The self-expiry timer is `delayedCall`, registered separately from the
    // per-frame `addEvent` loop — both land in `timers`, so this is index 1.
    stub.timers[1].fire();
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("leaves zero retained graphics/timers after repeated attach/detach cycles", () => {
    const stub = stubScene();
    for (let cycle = 0; cycle < 10; cycle++) {
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(vortex, HERE);
      backend.play(trail, HERE);
      backend.play(suspend, HERE);
      backend.detach();
    }
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });

  it("draws suspend's object even before it lifts off (elapsed 0), and the halo once suspended", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(suspend, HERE);

    stub.setNow(0);
    stub.loopEvents[0].fire();
    const atGround = stub.drawnGraphics[0].fillColors.length;
    expect(atGround).toBeGreaterThan(0); // the object itself always draws

    stub.setNow(1200); // mid-hold — fully suspended
    stub.loopEvents[0].fire();
    expect(stub.drawnGraphics[0].fillColors.length).toBeGreaterThan(atGround); // halo + motes now drawing too
    expect(stub.drawnGraphics[0].lineColors.length).toBeGreaterThan(0); // the two rings
    backend.detach();
  });
});

describe("PhaserVfxBackend plays burst-kind cues as flash + ring + spark shower", () => {
  it("creates two particle emitters and one ring graphics+tween, additive-blended, at the cue's depth", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    const handle = backend.play(burst, HERE);

    expect(stub.emitters).toHaveLength(2);
    for (const e of stub.emitters) expect(e.depth).toBe(42);
    expect(stub.drawnGraphics).toHaveLength(1);
    expect(stub.drawnGraphics[0].depth).toBe(42);
    expect(stub.drawnGraphics[0].blendMode).toBe("ADD");
    expect(stub.tweens).toHaveLength(1);
    // 2 layer-destroy timers (flash/round) plus play()'s own self-expiry.
    expect(stub.net()).toEqual({ filters: 0, emitters: 2, sprites: 0, graphics: 1, tweens: 1, timers: 3 });

    handle.stop();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("tints each layer from the theme: flash in ink, round sparks warm, ring in the cue's own colour", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(burst, HERE);

    const [flash, round] = stub.emitters;
    expect(flash.config.tint).toBe(cueColor("ink"));
    expect(round.config.tint).toBe(cueColor("vfxEmber"));
    // The stub's tween mock runs `onUpdate` once synchronously, so the ring's
    // first drawn line is already the cue's own resolved colour.
    expect(stub.drawnGraphics[0].lineColors).toContain(cueColor("vfxEmber"));
    backend.detach();
  });

  it("explodes each emitter exactly once, with no local x/y offset (the 2x-anchor bug)", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(burst, HERE);
    for (const e of stub.emitters) {
      expect(e.exploded).toBeGreaterThan(0);
      expect(e.explodeArgs).toHaveLength(1);
      expect([e.x, e.y]).toEqual([HERE.x, HERE.y]);
    }
    backend.detach();
  });

  it("releases every layer on its own self-expiry, with no stop() call", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(burst, HERE);
    expect(stub.net()).toEqual({ filters: 0, emitters: 2, sprites: 0, graphics: 1, tweens: 1, timers: 3 });

    // Creation order inside buildBurstFx: flashTimer, roundTimer, then
    // play()'s own self-expiry delayedCall last — index 2.
    stub.timers[2].fire();
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("moves every emitter's position on moveTo, since burst is an anchored kind", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(burst, HERE);
    handle.moveTo({ x: 500, y: 600 });
    for (const e of stub.emitters) expect([e.x, e.y]).toEqual([500, 600]);
    backend.detach();
  });

  it("leaves zero retained resources after repeated attach/detach cycles", () => {
    const stub = stubScene();
    for (let cycle = 0; cycle < 10; cycle++) {
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(burst, HERE);
      backend.detach();
    }
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });
});

describe("PhaserVfxBackend plays pop-kind cues as N staggered orbs, drawn once and tweened", () => {
  it("draws a ring plus one orb per measure, all additive-blended at the cue's depth, and releases everything on stop", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    const handle = backend.play(pop, HERE);

    // 1 ring + 4 orbs. The stub's tween mock runs to completion synchronously,
    // including onComplete-chained tweens, so the orbs' spin/breathe tweens
    // exist too by the time `play()` returns — a real session just reaches the
    // same state a few frames later, not on the same tick.
    expect(stub.drawnGraphics).toHaveLength(5);
    for (const g of stub.drawnGraphics) {
      expect(g.depth).toBe(42);
      expect(g.blendMode).toBe("ADD");
    }
    expect(stub.tweens.length).toBeGreaterThan(4);
    expect(stub.net().graphics).toBe(5);
    expect(stub.net().tweens).toBe(stub.tweens.length);

    handle.stop();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("tints the orb glow in the cue's own colour, and the star core/satellites in the theme's ink", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(pop, HERE);

    const orb = stub.drawnGraphics[1]; // index 0 is the pulse ring
    expect(orb.fillColors).toContain(cueColor("dusk"));
    expect(orb.fillColors).toContain(cueColor("ink"));
    backend.detach();
  });

  it("pops each orb to its own spread target — four distinct x positions, none left at the anchor", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(pop, HERE);

    // drawnGraphics[0] is the ring; orbs are indices 1..4. The graphics mock
    // exposes plain x/y/scale properties the tween mock writes into, and the
    // stub runs every tween to completion, so each orb should now sit at its
    // own popped x, not still bunched at the shared anchor.
    const orbXs = stub.drawnGraphics.slice(1).map((o) => o.x);
    expect(new Set(orbXs).size).toBe(4);
    expect(orbXs.every((x) => x !== HERE.x)).toBe(true);
    backend.detach();
  });

  it("plays inert-safe on moveTo — orbs already mid-tween keep their own targets", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(pop, HERE);
    expect(() => handle.moveTo({ x: 500, y: 600 })).not.toThrow();
    expect(handle.active).toBe(true);
    backend.detach();
  });

  it("releases everything on its own self-expiry, with no stop() call", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(pop, HERE);
    expect(stub.net().graphics).toBe(5);

    // Creation order: `pop`'s own fade-trigger `delayedCall` first, then
    // `play()`'s generic self-expiry `delayedCall` last — index 1.
    stub.timers[1].fire();
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("leaves zero retained resources after repeated attach/detach cycles", () => {
    const stub = stubScene();
    for (let cycle = 0; cycle < 10; cycle++) {
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(pop, HERE);
      backend.detach();
    }
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
  });
});

describe("PhaserVfxBackend plays rings-kind cues as staggered rings, notes and a star cloud", () => {
  // Timer creation order inside buildRingsFx, before any trigger fires:
  //   [0] flashTimer
  //   [1] ring0 trigger  [2] diamond0 trigger  [3] note trigger  [4] star trigger
  //   [5] ring1 trigger  [6] diamond1 trigger
  //   [7] ring2 trigger  [8] diamond2 trigger
  //   [9] play()'s own self-expiry
  const RING0 = 1;
  const DIAMOND0 = 2;
  const NOTE = 3;
  const STAR = 4;

  it("creates the flash and every trigger timer immediately, but no rings/diamonds/notes/stars until their triggers fire", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    backend.play(rings, HERE);

    expect(stub.emitters).toHaveLength(1); // the flash only
    expect(stub.emitters[0].depth).toBe(42);
    expect(stub.drawnGraphics).toHaveLength(0); // no ring has fired yet
    expect(stub.timers).toHaveLength(10);
    backend.detach();
  });

  it("draws ring 0 in the theme's ink and rings 1/2 in the cue's own colour, once each trigger fires", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(rings, HERE);

    stub.timers[RING0].fire();
    expect(stub.drawnGraphics).toHaveLength(1);
    expect(stub.drawnGraphics[0].lineColors).toContain(cueColor("ink"));

    stub.timers[5].fire(); // ring 1
    expect(stub.drawnGraphics[1].lineColors).toContain(cueColor("dusk"));
    backend.detach();
  });

  it("fires the diamond burst, the note burst and the star cloud from their own triggers, tinted from the theme", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(rings, HERE);

    stub.timers[DIAMOND0].fire();
    expect(stub.emitters).toHaveLength(2); // flash + diamonds
    expect(stub.emitters[1].config.tint).toBe(cueColor("dusk"));
    expect(stub.emitters[1].exploded).toBeGreaterThan(0);

    stub.timers[NOTE].fire();
    expect(stub.emitters).toHaveLength(3);
    // WISP (`vfxWisp`) — the prototype's own blue, added to the theme for
    // this rather than substituting an existing key. Not the cue's own
    // colour and not NEUTRAL — see the section header: a single-texture
    // particle tinted NEUTRAL washes to near-white.
    expect(stub.emitters[2].config.tint).toBe(cueColor("vfxWisp"));

    stub.timers[STAR].fire();
    expect(stub.emitters).toHaveLength(4);
    expect(stub.emitters[3].config.tint).toBe(cueColor("vfxWisp"));
    backend.detach();
  });

  it("releases everything cleanly when stopped partway through — some triggers fired, some still pending", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(rings, HERE);

    stub.timers[RING0].fire();
    stub.timers[DIAMOND0].fire();
    stub.timers[NOTE].fire();
    // ring 1, ring 2, diamond 1, diamond 2 and the star cloud never fire —
    // their trigger timers are still pending when stop() runs.
    expect(stub.net().graphics).toBeGreaterThan(0);
    expect(stub.net().emitters).toBeGreaterThan(0);

    handle.stop();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("releases everything on its own self-expiry, with every layer already fired", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(rings, HERE);

    // Fire every layer, in creation order, before the cue expires.
    for (const i of [RING0, DIAMOND0, NOTE, STAR, 5, 6, 7, 8]) stub.timers[i].fire();
    expect(stub.net().graphics).toBeGreaterThan(0);
    expect(stub.net().emitters).toBeGreaterThan(0);
    expect(stub.net().tweens).toBeGreaterThan(0);

    stub.timers[9].fire(); // play()'s self-expiry
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("leaves zero retained resources after repeated attach/detach cycles, whether or not any trigger fired", () => {
    // A fresh stub per cycle, so each one's `timers` array starts clean at
    // the documented [0..9] indices instead of accumulating across cycles.
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(rings, HERE);
      backend.detach(); // nothing fired yet
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(rings, HERE);
      for (const i of [RING0, DIAMOND0, NOTE, STAR]) stub.timers[i].fire();
      backend.detach(); // partway through
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
  });
});

describe("PhaserVfxBackend plays plume-kind cues as a cone of puffs plus two staggered ground rings", () => {
  // Timer creation order inside PlumeFx's constructor, before anything fires:
  //   [0] top ring trigger  [1] bottom ring trigger  [2] the puff-spawn step loop
  //   [3] play()'s own self-expiry
  const RING_TOP = 0;
  const RING_BOTTOM = 1;

  it("creates both ring triggers and the step loop immediately, but no ring graphics or puffs until something fires", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    backend.play(plume, HERE);

    expect(stub.timers).toHaveLength(4);
    expect(stub.drawnGraphics).toHaveLength(0); // neither ring has fired yet
    expect(stub.sprites).toHaveLength(0); // the step loop hasn't run yet
    backend.detach();
  });

  it("fires the top ring pale-gold, the bottom ring gold, both flattened-ellipse and additive-blended", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    backend.play(plume, HERE);

    stub.timers[RING_TOP].fire();
    expect(stub.drawnGraphics).toHaveLength(1);
    expect(stub.drawnGraphics[0].depth).toBe(42);
    expect(stub.drawnGraphics[0].blendMode).toBe("ADD");
    expect(stub.drawnGraphics[0].lineColors).toContain(cueColor("vfxGoldPale"));

    stub.timers[RING_BOTTOM].fire();
    expect(stub.drawnGraphics).toHaveLength(2);
    expect(stub.drawnGraphics[1].lineColors).toContain(cueColor("vfxGold"));
    backend.detach();
  });

  it("spawns puffs in the cue's own colour once the step loop fires, and they rise over subsequent ticks", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(plume, HERE);

    stub.setNow(100); // past every lane's random initial spawn phase (max 45ms)
    stub.loopEvents[0].fire();
    expect(stub.sprites.length).toBeGreaterThan(0);
    for (const s of stub.sprites) {
      expect(s.tint).toBe(cueColor("dusk"));
      expect(s.blendMode).toBe("ADD");
      // FILL, not the Phaser default MULTIPLY — multiplying `dusk` against
      // the puff texture's ink-based fill desaturates it away from the
      // prototype's pure colour (which tinted a literal white base). See
      // the `plume` section header.
      expect(s.tintMode).toBe(1);
    }
    const firstPuffY = stub.sprites[0].y;

    stub.setNow(400);
    stub.loopEvents[0].fire();
    expect(stub.sprites[0].y).toBeLessThan(firstPuffY); // risen — smaller y is higher on screen
    backend.detach();
  });

  it("releases every ring and every puff on its own self-expiry, with no stop() call", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(plume, HERE);

    stub.timers[RING_TOP].fire();
    stub.timers[RING_BOTTOM].fire();
    stub.setNow(100);
    stub.loopEvents[0].fire();
    expect(stub.net().graphics).toBeGreaterThan(0);
    expect(stub.net().sprites).toBeGreaterThan(0);

    stub.timers[3].fire(); // play()'s self-expiry
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("moves future puff spawns to the new anchor, without moving puffs already in the air", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(plume, HERE);

    stub.setNow(100);
    stub.loopEvents[0].fire();
    const inFlightX = stub.sprites[0].x;

    handle.moveTo({ x: 500, y: 600 });
    expect(stub.sprites[0].x).toBe(inFlightX); // unchanged — already in the air

    stub.setNow(200);
    stub.loopEvents[0].fire();
    const newest = stub.sprites[stub.sprites.length - 1];
    expect(Math.abs(newest.x - 500)).toBeLessThan(10); // spawned near the new anchor
    backend.detach();
  });

  it("leaves zero retained resources after repeated attach/detach cycles, whether or not anything fired", () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(plume, HERE);
      backend.detach();
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(plume, HERE);
      stub.timers[RING_TOP].fire();
      stub.setNow(100);
      stub.loopEvents[0].fire();
      backend.detach();
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
  });
});

describe("PhaserVfxBackend plays beacon-kind cues as a ground ring, a rising glow pillar, and fountain motes", () => {
  // Creation order: [0] GraphicsFx's own draw loop, [1] the mote-spawn loop, [2] play()'s self-expiry.
  const DRAW_LOOP = 0;
  const MOTE_LOOP = 1;

  it("creates one Graphics (ring/pillar) immediately and two repeating timers, additive-blended, at the cue's depth", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    backend.play(beacon, HERE);

    expect(stub.drawnGraphics).toHaveLength(1);
    expect(stub.drawnGraphics[0].depth).toBe(42);
    expect(stub.drawnGraphics[0].blendMode).toBe("ADD");
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 1, tweens: 0, timers: 3 });
    backend.detach();
  });

  it("redraws the ring/pillar/core every tick in the cue's own colour and the pale ember highlight", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(beacon, HERE);

    stub.setNow(200);
    stub.loopEvents[DRAW_LOOP].fire();
    const g = stub.drawnGraphics[0];
    const used = new Set([...g.lineColors, ...g.fillColors]);
    expect(used).toContain(cueColor("vfxEmber"));
    expect(used).toContain(cueColor("vfxEmberPale"));
    backend.detach();
  });

  it("spawns fountain motes tinted the pale ember highlight once the mote loop fires", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(beacon, HERE);

    stub.setNow(100);
    stub.loopEvents[MOTE_LOOP].fire();
    expect(stub.sprites.length).toBeGreaterThan(0);
    for (const s of stub.sprites) {
      expect(s.tint).toBe(cueColor("vfxEmberPale"));
      expect(s.blendMode).toBe("ADD");
    }
    backend.detach();
  });

  it("releases the graphics, both loops, and every mote on its own self-expiry, with no stop() call", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(beacon, HERE);

    stub.setNow(100);
    stub.loopEvents[DRAW_LOOP].fire();
    stub.loopEvents[MOTE_LOOP].fire();
    expect(stub.net().graphics).toBeGreaterThan(0);
    expect(stub.net().sprites).toBeGreaterThan(0);

    stub.timers[2].fire(); // play()'s self-expiry
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("moves future mote spawns to the new anchor, without throwing", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(beacon, HERE);

    expect(() => handle.moveTo({ x: 500, y: 600 })).not.toThrow();
    stub.setNow(100);
    stub.loopEvents[MOTE_LOOP].fire();
    expect(Math.abs(stub.sprites[0].x - 500)).toBeLessThan(1);
    backend.detach();
  });

  it("leaves zero retained resources after repeated attach/detach cycles, whether or not anything fired", () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(beacon, HERE);
      backend.detach();
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(beacon, HERE);
      stub.setNow(100);
      stub.loopEvents[DRAW_LOOP].fire();
      stub.loopEvents[MOTE_LOOP].fire();
      backend.detach();
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
  });
});

describe("PhaserVfxBackend plays eruption-kind cues as a solo flash, then ring + streaks + steam + sparks together", () => {
  // Creation order inside buildEruptionFx, before any trigger fires:
  //   [0] flash timer  [1] streak trigger (delayed ERUPTION_HOLD_MS)
  //   [2] steam trigger (delayed HOLD_MS + STEAM_DELAY_MS)
  //   [3] spark trigger (delayed ERUPTION_HOLD_MS)  [4] play()'s own self-expiry
  // Firing streakTrigger[1] appends [5] streak(green) timer, [6] streak(blue) timer.
  // Firing sparkTrigger[3] appends [7] spark timer. Firing steamTrigger[2] appends [8] steam timer.
  const STREAK_TRIGGER = 1;
  const STEAM_TRIGGER = 2;
  const SPARK_TRIGGER = 3;
  const SELF_EXPIRY = 4;

  it("creates only the flash and both splash rings immediately — streaks/steam/sparks all wait for the hold", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene, depth: 42 });
    backend.play(eruption, HERE);

    expect(stub.emitters).toHaveLength(1); // the flash only
    expect(stub.emitters[0].depth).toBe(42);
    expect(stub.drawnGraphics).toHaveLength(2); // the two splash rings, one Graphics each
    for (const g of stub.drawnGraphics) {
      expect(g.depth).toBe(42);
      expect(g.blendMode).toBe("ADD");
    }
    expect(stub.tweens).toHaveLength(2);
    expect(stub.timers).toHaveLength(5);
    backend.detach();
  });

  it("holds the flash alone for ERUPTION_HOLD_MS — streaks, steam and sparks are still pending triggers, not emitters", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(eruption, HERE);

    // Only the flash exists during the hold — this is the actual fix for
    // "separate the flash from everything else": nothing else lands on the
    // same frame, so the flash gets a real beat alone.
    expect(stub.emitters).toHaveLength(1);
    expect(stub.emitters[0].config.tint).toBe(cueColor("ink"));
    backend.detach();
  });

  it("brings in the ring, streaks and sparks together once the hold elapses; steam follows its own further delay", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(eruption, HERE);

    stub.timers[STREAK_TRIGGER].fire();
    stub.timers[SPARK_TRIGGER].fire();
    expect(stub.emitters).toHaveLength(4); // flash + 2 streaks + sparks
    const [, streakA, streakB, sparks] = stub.emitters;
    expect(streakA.config.tint).toBe(cueColor("success")); // COOL — green
    expect(streakB.config.tint).toBe(cueColor("vfxWisp")); // WISP — blue
    expect(sparks.config.tint).toBe(cueColor("vfxEmber"));
    for (const e of stub.emitters) expect(e.config.tintMode).toBe(1);
    for (const g of stub.drawnGraphics) expect(g.lineColors).toContain(cueColor("vfxEmber"));

    // Steam still hasn't fired — it has its own additional delay behind this beat.
    expect(stub.emitters).toHaveLength(4);
    stub.timers[STEAM_TRIGGER].fire();
    expect(stub.emitters).toHaveLength(5);
    expect(stub.emitters[4].config.tint).toBe(cueColor("ink"));
    backend.detach();
  });

  it("locks each streak's sprite rotation to its own launch angle, so it never points the wrong way", () => {
    // Regression guard for the "erratic directions" bug: a fixed-orientation
    // bar exploding across a full 360° spread read as wrong for most
    // particles. `facingAngleConfig` fixes it by having `rotate`'s onEmit
    // (which Phaser evaluates first) roll the shared random angle and
    // `angle`'s onEmit (evaluated second) read the same value back out —
    // this proves the two agree for a given particle, not just that
    // neither throws.
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    backend.play(eruption, HERE);
    stub.timers[STREAK_TRIGGER].fire();

    const [, streakA] = stub.emitters;
    const rotate = streakA.config.rotate as { onEmit: (p?: object) => number };
    const angle = streakA.config.angle as { onEmit: (p?: object) => number };
    expect(typeof rotate.onEmit).toBe("function");
    expect(typeof angle.onEmit).toBe("function");

    const particleA = {};
    const rolledAngle = rotate.onEmit(particleA); // must run first, matching Phaser's own evaluation order
    expect(angle.onEmit(particleA)).toBe(rolledAngle);

    // A second particle gets its own independent roll, not a shared global.
    const particleB = {};
    const rolledAngleB = rotate.onEmit(particleB);
    expect(angle.onEmit(particleB)).toBe(rolledAngleB);

    backend.detach();
  });

  it("releases everything on its own self-expiry, with every trigger already fired", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(eruption, HERE);

    stub.timers[STREAK_TRIGGER].fire();
    stub.timers[SPARK_TRIGGER].fire();
    stub.timers[STEAM_TRIGGER].fire();
    expect(stub.net().emitters).toBe(5);

    stub.timers[SELF_EXPIRY].fire();
    expect(handle.active).toBe(false);
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("releases everything cleanly when stopped BEFORE any trigger fires", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(eruption, HERE);

    expect(stub.net().timers).toBeGreaterThan(0); // the three pending triggers among them
    handle.stop();
    expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    backend.detach();
  });

  it("is a documented no-op on moveTo — everything here fires once, on its own trigger", () => {
    const stub = stubScene();
    const backend = new PhaserVfxBackend({ scene: stub.scene });
    const handle = backend.play(eruption, HERE);
    expect(() => handle.moveTo({ x: 500, y: 600 })).not.toThrow();
    expect(handle.active).toBe(true);
    backend.detach();
  });

  it("leaves zero retained resources after repeated attach/detach cycles, whatever triggers fired", () => {
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(eruption, HERE);
      backend.detach();
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
    for (let cycle = 0; cycle < 5; cycle++) {
      const stub = stubScene();
      const backend = new PhaserVfxBackend({ scene: stub.scene });
      backend.play(eruption, HERE);
      stub.timers[STREAK_TRIGGER].fire();
      stub.timers[SPARK_TRIGGER].fire();
      stub.timers[STEAM_TRIGGER].fire();
      backend.detach();
      expect(stub.net()).toEqual({ filters: 0, emitters: 0, sprites: 0, graphics: 0, tweens: 0, timers: 0 });
    }
  });
});
