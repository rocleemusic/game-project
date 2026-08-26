/**
 * The seam. One pure event bus that both halves of the build may touch.
 *
 * WHY NOT `Phaser.Events.EventEmitter`. Today's only bus is `InkBridge`, which
 * extends Phaser's emitter and is therefore render-coupled: anything that wants
 * to listen has to be inside a Phaser build. That is the exact coupling the
 * Wave-2 split is trying to remove — the VFX and VN-dialogue tracks are meant
 * to build against a fake bus on day 1, with no engine underneath them.
 *
 * So this file imports nothing from Phaser, nothing from the DOM, and does no
 * I/O. `src/world/**` may never `import Phaser` (enforced by
 * `tests/ArchitectureBoundary.test.ts`), and this is the file that makes that
 * rule survivable rather than merely aspirational.
 *
 * THE LOG IS PART OF THE CONTRACT, not a debug affordance. Chain gates
 * (`G-F4-still`, `G-F8-combine`) match an ordered subsequence of casts; the
 * headless walker reproduces a week from it; the content audit reads it to find
 * authored content that nothing ever reached. All three need the ORDER, so the
 * log is append-only and every entry carries a monotonic `seq`.
 *
 * TIME IS INJECTED. `now()` defaults to `Date.now`, but the walker and the
 * tests pass a counter so a replayed session produces a byte-identical log.
 */

import type { CastOutcome } from "../../magic/CastResolver";
import type { GateRuleKind } from "../gates/GateRule";
import type { ReceiverStateId } from "../receivers/ReceiverState";

/**
 * The two outcomes a cast can have and still be a cast that HAPPENED.
 *
 * RULING 2026-08-17: `applyCast` runs on "effect" and "no-effect", and on
 * nothing else. Splitting `CastOutcome` here rather than in the pipeline means
 * the compiler carries that ruling instead of a comment.
 */
export type CastLandedOutcome = Extract<CastOutcome, "effect" | "no-effect">;

/** The outcomes that mean the cast never took. No bookkeeping runs for these. */
export type CastRejectedOutcome = Exclude<CastOutcome, "effect" | "no-effect">;

/**
 * How an item came to be held. `"forage"` is the only source that also carries
 * a pool name — see `ItemAcquiredEvent.poolName` for why that matters.
 */
export type ItemSource = "forage" | "cast" | "npc" | "grant" | "restore";

/** Why a partially-walked chain stopped counting. */
export type CraftAbandonReason =
  | "wrong-step"
  | "product-lost"
  | "screen-changed"
  | "day-ended";

/** A spoken line has a speaker and a nameplate; narration has neither. */
export type DialogueLineKind = "dialogue" | "narration";

// ---------------------------------------------------------------------------
// The events
// ---------------------------------------------------------------------------

export interface CastResolvedEvent {
  readonly type: "cast:resolved";
  readonly spellId: string;
  readonly receiverId: string;
  /** `null` only where a mode has no notion of a current screen. */
  readonly screenId: string | null;
  readonly outcome: CastLandedOutcome;
  readonly consumed: readonly string[];
  readonly produced: readonly string[];
  /** Authored prose, verbatim. Never templated around, never regex-split. */
  readonly narration: string;
}

export interface CastRejectedEvent {
  readonly type: "cast:rejected";
  /** `null` when no phrase matched at all. */
  readonly spellId: string | null;
  readonly receiverId: string;
  readonly screenId: string | null;
  readonly outcome: CastRejectedOutcome;
  readonly missing: readonly string[];
  readonly extra: readonly string[];
}

export interface CraftStartedEvent {
  readonly type: "craft:started";
  /** The chain being walked — a gate id for the two authored chain gates. */
  readonly craftId: string;
  readonly gateId: string | null;
  readonly stepCount: number;
  readonly screenId: string | null;
}

export interface CraftCompletedEvent {
  readonly type: "craft:completed";
  readonly craftId: string;
  readonly gateId: string | null;
  /** The item the final step left behind, when the chain produces one. */
  readonly producedItemId: string | null;
  readonly screenId: string | null;
}

export interface CraftAbandonedEvent {
  readonly type: "craft:abandoned";
  readonly craftId: string;
  readonly gateId: string | null;
  /** 0-based index of the step the chain got to before it stopped. */
  readonly atStep: number;
  readonly reason: CraftAbandonReason;
}

export interface ReceiverStateChangedEvent {
  readonly type: "receiver:state-changed";
  readonly receiverId: string;
  readonly screenId: string | null;
  readonly from: ReceiverStateId;
  readonly to: ReceiverStateId;
  /** The cast that moved it. `null` for a day-start or restore reset. */
  readonly causeSpellId: string | null;
}

export interface GateClearedEvent {
  readonly type: "gate:cleared";
  readonly gateId: string;
  /** Every screen this gate was guarding. `G-F5-cascade` guards more than one. */
  readonly screenIds: readonly string[];
  readonly ruleKind: GateRuleKind;
  /**
   * Which gate vocabulary cleared. Modes 1-3 stay on `"legacy-hedge"`, whose
   * flag is local to `collectGates.ts` and clears no real `G-*` id — reusing
   * the real ids would leave F7 permanently stuck, because `G-F5-cascade` has
   * no clearer in those modes.
   */
  readonly source: "authored" | "legacy-hedge";
}

export interface GateBlockedEvent {
  readonly type: "gate:blocked";
  readonly screenId: string;
  /** The gates still standing, in authored order. */
  readonly gateIds: readonly string[];
  /** The `[Go to X]` text the player chose, when the block came from a move. */
  readonly moveText: string | null;
}

export interface ItemAcquiredEvent {
  readonly type: "item:acquired";
  /** ITEM ID vocabulary — `item_river_stone`. */
  readonly itemId: string;
  readonly source: ItemSource;
  readonly screenId: string | null;
  /**
   * The two-vocabularies hazard is closed (Roc, 2026-08-23, Task 1 T19 —
   * GAPS G13). This now carries the SAME string as `itemId` — present only
   * for `"forage"`, because `screen-specs.json` authors `item_id`s directly
   * and there is no separate pool-name vocabulary left to distinguish. Kept
   * as its own field, not collapsed into `itemId`, so the save layer's
   * separate-fields shape (which a version-1 save still depends on to detect
   * `version-mismatch`) does not have to change in lockstep. Deprecate
   * post-capstone, once nothing reads it as anything but `itemId`'s twin.
   */
  readonly poolName: string | null;
}

export interface ItemConsumedEvent {
  readonly type: "item:consumed";
  readonly itemId: string;
  readonly screenId: string | null;
  /** The spell that spent it. */
  readonly bySpellId: string;
}

export interface ScreenChangedEvent {
  readonly type: "screen:changed";
  readonly from: string | null;
  readonly to: string;
  /**
   * Clock fields are a READ-ONLY MIRROR of ink's own VARs at the moment of the
   * move. Ink owns the clock. Nothing may write these back — `setVar` exists,
   * would appear to work, and is the trap.
   */
  readonly day: number;
  readonly timeBlock: string;
  readonly movesLeft: number;
}

export interface DialogueLineEvent {
  readonly type: "dialogue:line";
  /** soul_id, or `null` for narration — which renders with no nameplate. */
  readonly speaker: string | null;
  readonly text: string;
  readonly kind: DialogueLineKind;
  readonly screenId: string | null;
  /**
   * The player's own picked choice, echoed into ink's transcript by
   * `LanternPlayer.choose()` — not authored prose. STILL EMITTED, so the
   * backlog (which reads the bus log directly) stays a complete transcript;
   * a live consumer showing the CURRENT line (`DialogueSystem`) skips it —
   * displaying a choice's own raw display text back as if a soul said it
   * reads as a bug, not a conversation. Optional (falsy by default) so every
   * test-authored line before this field existed is unaffected.
   */
  readonly playerEcho?: boolean;
}

export interface SaveWrittenEvent {
  readonly type: "save:written";
  readonly slot: string;
  readonly version: number;
  readonly sliceIds: readonly string[];
}

export interface SaveLoadedEvent {
  readonly type: "save:loaded";
  readonly slot: string;
  readonly version: number;
  readonly sliceIds: readonly string[];
}

/** Every event the bus carries. Exhaustive — add here, nowhere else. */
export type GameEvent =
  | CastResolvedEvent
  | CastRejectedEvent
  | CraftStartedEvent
  | CraftCompletedEvent
  | CraftAbandonedEvent
  | ReceiverStateChangedEvent
  | GateClearedEvent
  | GateBlockedEvent
  | ItemAcquiredEvent
  | ItemConsumedEvent
  | ScreenChangedEvent
  | DialogueLineEvent
  | SaveWrittenEvent
  | SaveLoadedEvent;

export type GameEventType = GameEvent["type"];

/**
 * Distributed on purpose. `(A | B) & C` would still narrow on `.type`, but
 * writing the distribution out keeps the hover text readable and makes
 * `Extract<LoggedGameEvent, { type: "cast:resolved" }>` behave the obvious way.
 */
type WithLogFields<E> = E extends unknown
  ? E & { readonly seq: number; readonly at: number }
  : never;

/** An event as it sits in the log: the payload plus its order and timestamp. */
export type LoggedGameEvent = WithLogFields<GameEvent>;

/** The logged form of one specific event type. */
export type LoggedEventOf<T extends GameEventType> = Extract<LoggedGameEvent, { type: T }>;

export type GameEventHandler<T extends GameEventType> = (event: LoggedEventOf<T>) => void;

/** Internal storage shape. Handlers are re-narrowed on dispatch, never before. */
type StoredHandler = (event: LoggedGameEvent) => void;

export interface GameEventBusOptions {
  /** Injected so a replayed walk produces an identical log. */
  readonly now?: () => number;
}

/**
 * A pure, ordered, subscribable event log.
 *
 * Emission order: the event is appended to the log FIRST, then dispatched. A
 * handler that reads `log()` therefore sees the event that woke it — which is
 * what the chain-gate evaluator relies on when it re-matches on every cast.
 */
export class GameEventBus {
  private readonly handlers = new Map<GameEventType, Set<StoredHandler>>();
  private readonly entries: LoggedGameEvent[] = [];
  private readonly now: () => number;
  /** Never reset by `clearLog`, so a seq is unique for the bus's whole life. */
  private nextSeq = 1;

  constructor(options: GameEventBusOptions = {}) {
    this.now = options.now ?? (() => Date.now());
  }

  /** Subscribe. Returns an unsubscribe thunk — the disposable form. */
  on<T extends GameEventType>(type: T, handler: GameEventHandler<T>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set<StoredHandler>();
      this.handlers.set(type, set);
    }
    // The one cast in this file. `GameEventHandler<T>` accepts a narrower
    // event than `StoredHandler` declares; dispatch only ever hands it events
    // of type `T`, because the set is keyed by `T`.
    set.add(handler as unknown as StoredHandler);
    return () => this.off(type, handler);
  }

  off<T extends GameEventType>(type: T, handler: GameEventHandler<T>): void {
    this.handlers.get(type)?.delete(handler as unknown as StoredHandler);
  }

  /** Append to the log, then notify. Returns the logged form. */
  emit(event: GameEvent): LoggedGameEvent {
    const logged = {
      ...event,
      seq: this.nextSeq++,
      at: this.now(),
    } as LoggedGameEvent;
    this.entries.push(logged);
    const set = this.handlers.get(event.type);
    if (set) {
      // Copied before iteration: a handler is allowed to subscribe or
      // unsubscribe in response to the event it is handling.
      for (const handler of [...set]) handler(logged);
    }
    return logged;
  }

  /**
   * The ordered log, oldest first.
   *
   * This is a LIVE read-only view, not a copy — the walker reads it every move
   * and copying a week's worth each time is waste. Snapshot it with
   * `[...bus.log()]` if you need a value that will not grow underneath you.
   */
  log(): readonly LoggedGameEvent[] {
    return this.entries;
  }

  /** Only entries of one type, order preserved. */
  logOf<T extends GameEventType>(type: T): readonly LoggedEventOf<T>[] {
    return this.entries.filter((e): e is LoggedEventOf<T> => e.type === type);
  }

  /** Drop the history, keep the subscribers. `seq` does not restart. */
  clearLog(): void {
    this.entries.length = 0;
  }

  /** Drop the subscribers, keep the history. The teardown half of `on`. */
  removeAllListeners(): void {
    this.handlers.clear();
  }
}
