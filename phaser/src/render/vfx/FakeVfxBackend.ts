/**
 * The test backend. No Phaser, no canvas, no timers.
 *
 * WHY IT EXISTS BEYOND CONVENIENCE. The leak this whole track is guarding
 * against is invisible in a unit test unless something COUNTS. Phaser will not
 * tell you a filter was never released; it just composites one more every cast
 * until the screen goes dark. So the fake keeps a module-level registry of
 * every handle that is currently holding a resource, across every instance, and
 * `fakeVfxLiveHandles()` is the number the disposal test asserts is zero after
 * each attach/detach cycle. A backend that forgot to release would show up as a
 * rising integer instead of as a bug report from a playtest.
 *
 * It also enforces the two contract clauses the real backend has to honour, so
 * a mistake shows up here rather than on a canvas:
 *   - `play` on a detached backend returns an inert handle and starts nothing;
 *   - `kind: "none"` returns an already-inert handle, so callers never have to
 *     ask whether a cue was authored.
 *
 * `advance(ms)` is the injected clock. Cues expire by their own `durationMs`,
 * exactly as the real one will, without waiting in real time.
 */

import { isAnchoredKind, type VfxAnchor, type VfxBackend, type VfxCue, type VfxHandle } from "./VfxBackend";

/**
 * Every handle currently holding a resource, across every fake instance.
 *
 * Module-level on purpose: the disposal test builds a NEW backend each cycle
 * (because `detach()` is permanent, per the interface), so a per-instance
 * counter could not see accumulation across cycles — which is the failure mode
 * being tested.
 */
let liveHandles = 0;

/** How many fake cues are still holding a resource. Zero is the only good value. */
export function fakeVfxLiveHandles(): number {
  return liveHandles;
}

/** Only for tests that want a clean slate. Never called by the system. */
export function resetFakeVfxRegistry(): void {
  liveHandles = 0;
}

/** One record of a `play()` call, in order. */
export interface FakePlay {
  readonly cue: VfxCue;
  readonly anchor: VfxAnchor;
  /** False for `kind: "none"` and for plays on a detached backend. */
  readonly started: boolean;
}

class FakeHandle implements VfxHandle {
  readonly cueId: string;
  /** Remaining lifetime, in ms. Driven by `advance`. */
  remaining: number;
  anchor: VfxAnchor;
  moves = 0;
  /** Mirrors `isAnchoredKind` so the fake cannot accept a move the real one drops. */
  readonly anchored: boolean;
  private live: boolean;

  constructor(cue: VfxCue, anchor: VfxAnchor, start: boolean) {
    this.cueId = cue.id;
    this.remaining = cue.durationMs;
    this.anchor = anchor;
    this.anchored = isAnchoredKind(cue.kind);
    this.live = start;
    if (start) liveHandles++;
  }

  get active(): boolean {
    return this.live;
  }

  /**
   * A no-op for a camera-filter cue, exactly as in `PhaserVfxBackend`. The fake
   * used to accept every move, which hid the fact that the real backend re-anchors
   * particles only.
   */
  moveTo(anchor: VfxAnchor): void {
    if (!this.live || !this.anchored) return;
    this.anchor = anchor;
    this.moves++;
  }

  stop(): void {
    if (!this.live) return;
    this.live = false;
    this.remaining = 0;
    liveHandles--;
  }
}

export class FakeVfxBackend implements VfxBackend {
  private handles: FakeHandle[] = [];
  private isAttached = true;

  /** Every `play()` call, in order, including the inert ones. */
  readonly plays: FakePlay[] = [];
  /**
   * Every handle this backend ever started, never cleared. `handles` is emptied
   * by `stopAll`, so a test asking "did the re-anchor reach this cue?" needs a
   * record that survives the stop.
   */
  readonly startedHandles: { cueId: string; anchored: boolean; moves: number; anchor: VfxAnchor }[] =
    [];
  /** How many times `detach()` was called. Must stay safe above 1. */
  detachCalls = 0;
  stopAllCalls = 0;

  get attached(): boolean {
    return this.isAttached;
  }

  /** Handles this instance is still holding. */
  get liveCount(): number {
    return this.handles.filter((h) => h.active).length;
  }

  /** The cue ids currently playing, in start order. */
  get playingCueIds(): readonly string[] {
    return this.handles.filter((h) => h.active).map((h) => h.cueId);
  }

  play(cue: VfxCue, anchor: VfxAnchor): VfxHandle {
    const start = this.isAttached && cue.kind !== "none" && cue.durationMs > 0;
    const handle = new FakeHandle(cue, anchor, start);
    this.plays.push({ cue, anchor, started: start });
    if (start) {
      this.handles.push(handle);
      this.startedHandles.push(handle);
    }
    return handle;
  }

  stopAll(): void {
    this.stopAllCalls++;
    for (const handle of this.handles) handle.stop();
    this.handles = [];
  }

  detach(): void {
    this.detachCalls++;
    this.stopAll();
    this.isAttached = false;
  }

  /** Advance the clock. Handles past their `durationMs` release themselves. */
  advance(ms: number): void {
    for (const handle of this.handles) {
      handle.remaining -= ms;
      if (handle.remaining <= 0) handle.stop();
    }
    this.handles = this.handles.filter((h) => h.active);
  }
}
