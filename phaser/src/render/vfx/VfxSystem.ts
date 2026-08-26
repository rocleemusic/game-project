/**
 * GameEvent -> cue -> backend. The whole spell-VFX system.
 *
 * WHAT IT IS ALLOWED TO KNOW. The bus and the theme, through `CueTable`. Not
 * `Inventory`, not `Gates`, not `InkBridge`, not a scene. That is the render /
 * logic split the Wave-2 plan exists to make real: the world emits what
 * happened, this turns what happened into light, and neither can reach into the
 * other. It is also why this file can be tested with no canvas at all — swap
 * `FakeVfxBackend` for `PhaserVfxBackend` and every assertion below still runs.
 *
 * NO BRANCH ON CONTENT. There is no spell id, receiver id or gate id in this
 * file. Which cue plays is a lookup in `cues.json`; a new spell is a new row.
 * An event with no row gets the table's neutral fallback and a `"unmatched"`
 * diagnostic — a count, not a warning. Nothing here calls `console`, because a
 * missing cue is an authoring gap, not a fault, and a red line in the console
 * teaches everyone to ignore red lines in the console.
 *
 * DETACH IS THE POINT. Phaser 4 filters are OPT-IN AND ARE NOT AUTO-RELEASED ON
 * SCENE SHUTDOWN. A cue that attaches a filter and is never released
 * accumulates one filter per cast; a long walk composites dozens and the screen
 * fades — the exact shape of the scrim leak that already shipped once. So:
 *
 *   - every handle this system starts is held until it reports itself inactive,
 *   - `detach()` drops every subscription, stops every live handle, then
 *     detaches the backend — and calls `backend.stopAll()` exactly zero times on
 *     the way, because `backend.detach()` releases everything by contract and a
 *     second release would hide a real double-free in a backend whose `stopAll`
 *     is not idempotent,
 *   - `detach()` is idempotent and a detached system ignores further events,
 *   - `VfxSystem.test.ts` cycles attach/detach 25 times and asserts the fake
 *     backend's live-handle registry is back to zero every time, and
 *     `PhaserVfxBackend.test.ts` does the same against a stub scene that counts
 *     real `filters.internal.add*`/`remove` and `emitter.destroy()` calls — the
 *     fake proves the system's bookkeeping, the stub proves the renderer's.
 *
 * WHAT ACTUALLY BOUNDS ACCUMULATION, HONESTLY. Three things, in this order: each
 * cue's own expiry timer in the backend, the backend's `maxConcurrent` ceiling,
 * and `detach()` on scene shutdown. `stopOnScreenChange` is a fourth, and it is
 * the WEAKEST of them — it only fires if something emits `screen:changed` onto
 * this system's bus, and the one scene mounting VFX today is a modal with no
 * screen of its own. It is kept because it is correct for the walking scenes
 * whenever they mount VFX, not because it is currently doing any work. An
 * earlier version of this header sold it as "the cheapest possible guard against
 * accumulation over a long walk"; it cannot fire on a long walk yet.
 *
 * ANCHORS ARE INJECTED, AND ONLY BIND PARTICLE CUES. Events carry a
 * `receiverId`, never a position — geometry lives in the render layer, which
 * owns hotspot placement. So the caller passes an `AnchorResolver`; with none,
 * cues play at `defaultAnchor`. Mid-play re-anchoring lives on the handle
 * (`VfxHandle.moveTo`), for a panning scene to drive; this class carried a
 * `reanchor()` wrapper for it that nothing in the game ever called, and two
 * tests covered that wrapper rather than the contract, so the wrapper is gone
 * and the contract — `isAnchoredKind`, particles move, camera filters do not —
 * is tested where it lives, on both backends.
 */

import type { GameEventBus, LoggedGameEvent } from "../../world/events/GameEvents";
import {
  ALL_EVENT_TYPES,
  AUTHORED_CUES,
  cueFor,
  type CueTable,
} from "./CueTable";
import type { VfxAnchor, VfxBackend, VfxCue, VfxHandle } from "./VfxBackend";

/**
 * Where an event's cue should play. `null` means "no better idea" and the
 * system falls back to `defaultAnchor` rather than skipping the cue — a cue
 * with an unknown anchor still deserves to be seen.
 */
export type AnchorResolver = (event: LoggedGameEvent) => VfxAnchor | null;

/**
 * What happened to one event, for the audit and for tests.
 *
 * Deliberately neutral vocabulary. There is no `"warning"` and no `"error"`
 * member: nothing this system observes is a fault, and a diagnostic channel
 * with a scary member gets one eventually.
 */
export interface VfxDiagnostic {
  readonly kind: "played" | "inert" | "unmatched";
  readonly eventType: string;
  readonly seq: number;
  readonly cueId: string;
}

export interface VfxSystemOptions {
  readonly bus: GameEventBus;
  readonly backend: VfxBackend;
  /** Defaults to the authored `cues.json`. */
  readonly table?: CueTable;
  readonly anchorFor?: AnchorResolver;
  /** Where a cue plays when the resolver has no answer. */
  readonly defaultAnchor?: VfxAnchor;
  /**
   * Stop everything playing when the screen changes. Default `true`.
   *
   * Correct, and currently inert: no scene that mounts a VfxSystem emits
   * `screen:changed` onto its bus. It is not what bounds accumulation — see the
   * header.
   */
  readonly stopOnScreenChange?: boolean;
  /** Observation only. Never called with anything alarming. */
  readonly onDiagnostic?: (diagnostic: VfxDiagnostic) => void;
}

/**
 * One event lands in exactly one of these. They are mutually exclusive and sum
 * to the number of events seen — an unmatched event is NOT also counted inert
 * just because the fallback happens to be `kind: "none"`. They use the same
 * precedence as `VfxDiagnostic.kind`, so the counters and the diagnostics can
 * never disagree about the same event.
 */
export interface VfxStats {
  /** Cues that started something the backend is holding. */
  readonly played: number;
  /** Matched a row, and that row resolved to `kind: "none"` — authored as nothing. */
  readonly inert: number;
  /** Events with no row, which played the table's fallback. */
  readonly unmatched: number;
}

const ORIGIN: VfxAnchor = { x: 0, y: 0 };

export class VfxSystem {
  private readonly bus: GameEventBus;
  private readonly backend: VfxBackend;
  private readonly table: CueTable;
  private readonly anchorFor: AnchorResolver;
  private readonly defaultAnchor: VfxAnchor;
  private readonly stopOnScreenChange: boolean;
  private readonly onDiagnostic?: (diagnostic: VfxDiagnostic) => void;

  /** Unsubscribe thunks, one per event type. Empty when not attached. */
  private readonly subscriptions: (() => void)[] = [];
  /** Every handle still playing. */
  private readonly live: VfxHandle[] = [];

  private played = 0;
  private inert = 0;
  private unmatched = 0;
  private detached = false;

  constructor(options: VfxSystemOptions) {
    this.bus = options.bus;
    this.backend = options.backend;
    this.table = options.table ?? AUTHORED_CUES;
    this.anchorFor = options.anchorFor ?? (() => null);
    this.defaultAnchor = options.defaultAnchor ?? ORIGIN;
    this.stopOnScreenChange = options.stopOnScreenChange ?? true;
    this.onDiagnostic = options.onDiagnostic;
  }

  /** True between `attach()` and `detach()`. */
  get attached(): boolean {
    return this.subscriptions.length > 0;
  }

  /** How many cues are playing right now. Zero after `detach()`, always. */
  get activeCount(): number {
    this.sweep();
    return this.live.length;
  }

  get stats(): VfxStats {
    return { played: this.played, inert: this.inert, unmatched: this.unmatched };
  }

  /** The table's defects, so a boot check or the audit can print them. */
  get defects() {
    return this.table.defects;
  }

  /**
   * Subscribe to the bus. Idempotent, and a no-op once detached — a system
   * whose backend has been released must not come back to life.
   */
  attach(): this {
    if (this.detached || this.attached) return this;
    for (const type of ALL_EVENT_TYPES) {
      this.subscriptions.push(this.bus.on(type, (event) => this.handle(event)));
    }
    return this;
  }

  /**
   * Release everything: live cues, the backend, the subscriptions.
   *
   * MANDATORY — see the header. Safe to call twice, safe to call without a
   * preceding `attach()`, and permanent.
   */
  detach(): void {
    if (this.detached) return;
    this.detached = true;
    for (const off of this.subscriptions.splice(0)) off();
    // Deliberately NOT `stopAllCues()`, which would add a `backend.stopAll()`
    // that `backend.detach()` then repeats. Releasing twice is harmless in both
    // backends shipped here and would silently hide a double-free in one that
    // is not idempotent, so this drops only the handles THIS class holds and
    // lets the backend do its own release exactly once.
    for (const handle of this.live.splice(0)) handle.stop();
    this.backend.detach();
  }

  /** Stop every playing cue without detaching. A screen change does this. */
  stopAllCues(): void {
    for (const handle of this.live.splice(0)) handle.stop();
    this.backend.stopAll();
  }

  // -------------------------------------------------------------------------

  private handle(event: LoggedGameEvent): void {
    if (this.detached) return;
    // A cue is anchored to a place on a screen. When the screen goes, so does
    // the anchor. (Only the walking scenes will ever emit this; see the header.)
    if (event.type === "screen:changed" && this.stopOnScreenChange) this.stopAllCues();

    const cue = cueFor(this.table, event);
    const matched = cue !== this.table.fallback;

    const handle = this.backend.play(cue, this.anchorOf(event));
    if (handle.active) this.live.push(handle);

    // One event, one counter. The fallback is `kind: "none"`, so an unmatched
    // event also yields an inactive handle — counting both would overshoot the
    // event count and disagree with the diagnostic below, which picks one label.
    const kind = !matched ? "unmatched" : handle.active ? "played" : "inert";
    if (kind === "unmatched") this.unmatched++;
    else if (kind === "played") this.played++;
    else this.inert++;

    this.sweep();
    this.onDiagnostic?.({ kind, eventType: event.type, seq: event.seq, cueId: cue.id });
  }

  private anchorOf(event: LoggedGameEvent): VfxAnchor {
    return this.anchorFor(event) ?? this.defaultAnchor;
  }

  /** Drop handles that have finished on their own. Cheap, and runs every cue. */
  private sweep(): void {
    for (let i = this.live.length - 1; i >= 0; i--) {
      if (!this.live[i].active) this.live.splice(i, 1);
    }
  }
}

/** Re-exported so a caller needs one import to wire the system up. */
export type { CueTable, VfxAnchor, VfxBackend, VfxCue, VfxHandle };
