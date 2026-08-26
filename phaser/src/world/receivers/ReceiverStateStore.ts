/**
 * Which state each receiver is in, and which authored clause that selects.
 *
 * Pure — no Phaser, no DOM, no I/O. The only thing it reads is authored JSON
 * that ships beside it.
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS CLOSES
 * ---------------------------------------------------------------------------
 *
 * 18 spell x receiver pairs carry `receiver_class: "stateful"` with BOTH
 * branches authored, and until now nothing anywhere tracked receiver state. The
 * mechanic was already written — `temper x forge_billet` is authored verbatim
 * as "State-dependent: glowing hot, it hardens evenly with a hiss and holds its
 * shape; already cold, no_effect — there is no heat to set" — it just had no
 * reader. This is the reader.
 *
 * ---------------------------------------------------------------------------
 * THERE IS NO PARSER IN THIS FOLDER AND THERE MUST NOT BE ONE
 * ---------------------------------------------------------------------------
 *
 * All 18 stateful outcomes share the shape "State-dependent: A; B", so a regex
 * split looks trivial. It is not: several branches carry their own semicolons
 * and em-dashes, and `glimmer x festival_grounds` opens "State-dependent on
 * place and night:" rather than the common prefix. A pattern split would render
 * the wrong half of the prose to the player, silently, for the subset where the
 * shape is not literal — the exact "inferred, not authored" failure the forage
 * join was called out for (GAPS G13).
 *
 * So every clause in `data/receiverStates.json` was copied by hand out of the
 * matching `physical_outcome`, and `tests/ReceiverState.test.ts` asserts each
 * one is a verbatim SUBSTRING of that record. Content drift fails a test
 * instead of reaching a player. `validateAgainstOutcomes()` below is the same
 * check, callable from the audit, so the guard is not test-only.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS AUTHORED HERE AND WHAT IS NOT
 * ---------------------------------------------------------------------------
 *
 * The PROSE is content and is copied. The state ids, labels, `initial` and
 * `becomes` are DESIGN DATA authored in the JSON, under three rules:
 *
 *  1. A receiver's states are exactly the states its authored clauses describe.
 *     No state exists that no clause covers, so "every state has a branch" is
 *     satisfiable rather than aspirational.
 *  2. `initial` is the state named by the FIRST authored clause, so all 18
 *     already-paid-for interactions are reachable on a fresh world. Two
 *     documented exceptions: `furnace` starts `cold` (an unlit furnace is the
 *     world's resting state, and it is the state `ignite` acts on), and
 *     `festival_grounds` starts `ordinary_day` — festival night is a CLOCK
 *     fact, ink owns the clock, and nothing here may write it.
 *  3. `becomes` is set only where the prose describes the receiver entering
 *     another AUTHORED state of that same receiver. Three do: `ignite` lights a
 *     cold furnace into `magic_lit` (which is what makes `glimmer`'s
 *     "recently magic-lit" branch reachable), `temper` takes the heat out of a
 *     hot billet into `cold`, and `waft` rights a smoky chimney into
 *     `drawing_fine`. Everything else is `null` rather than invent a state.
 *
 * ---------------------------------------------------------------------------
 * THE LIVE BUG THIS FIXES
 * ---------------------------------------------------------------------------
 *
 * `readsAsNoEffect` in `magic/CastResolver.ts` is anchored `/^no (physical
 * )?effect\b/i`, so a mid-string marker is invisible and `temper x forge_billet`
 * resolved as an EFFECT regardless of state — minting its `produces`, teaching
 * the spell and clearing gates off a cast the content says did nothing.
 *
 * The fix is ORDERING, not a looser regex: BRANCH SELECTION RUNS FIRST, and the
 * selected branch's AUTHORED `noEffect` answers the question. Loosening the
 * regex instead would drag the hot branch of the same string into no-effect
 * with it. `statefulCast.ts` is that ordering, composed.
 *
 * ---------------------------------------------------------------------------
 * NO-EFFECT IS AN HONEST RESULT
 * ---------------------------------------------------------------------------
 *
 * Six of the 39 branches are authored nothings. They are results, never
 * failures: nothing here marks them, scores them or flags them, and nothing
 * downstream may render one red, shaken or errored.
 */

import type { GameEventBus } from "../events/GameEvents";
import type {
  AuthoredBranch,
  BranchSelection,
  ReceiverBranchTable,
  ReceiverDefect,
  ReceiverKey,
  ReceiverRecord,
  ReceiverStateId,
  ReceiverStateSnapshot,
  ReceiverStatesFile,
} from "./ReceiverState";
import authored from "./data/receiverStates.json";

/** The authored file, typed. The store defaults to it; tests may pass another. */
export const RECEIVER_STATES: ReceiverStatesFile = authored;

/**
 * Where a receiver's state lives.
 *
 * Receivers are per-screen instances — the furnace at the Workshop is not the
 * furnace anywhere else — so state is keyed by screen AND receiver. A mode with
 * no notion of a current screen collapses to `"*"`, which is a real key and not
 * a wildcard: it is that mode's single shared instance.
 */
export function receiverKey(screenId: string | null, receiverId: string): ReceiverKey {
  return `${screenId ?? "*"}/${receiverId}`;
}

/** `${spellId}/${receiverId}` — the branch-table key. */
function pairKey(spellId: string, receiverId: string): string {
  return `${spellId}/${receiverId}`;
}

export interface ReceiverStateStoreOptions {
  /** Optional so the store is testable with no bus at all. */
  readonly bus?: GameEventBus;
}

/** What a spell x receiver lookup can be, before any state is consulted. */
export type PairKind =
  /** Authored stateful: a branch applies and must be selected. */
  | "stateful"
  /** Not in this table at all: the record's `physical_outcome` stands as-is. */
  | "plain";

export class ReceiverStateStore {
  private readonly records = new Map<string, ReceiverRecord>();
  private readonly tables = new Map<string, ReceiverBranchTable>();
  private readonly live = new Map<ReceiverKey, ReceiverStateId>();
  private readonly bus?: GameEventBus;
  /** Structural problems found when the file was loaded. Never swallowed. */
  private readonly loadDefects: ReceiverDefect[] = [];

  constructor(
    file: ReceiverStatesFile = RECEIVER_STATES,
    options: ReceiverStateStoreOptions = {},
  ) {
    this.bus = options.bus;
    for (const record of file.receivers) this.records.set(record.receiverId, record);
    for (const table of file.branches) {
      this.tables.set(pairKey(table.spellId, table.receiverId), table);
    }
    this.loadDefects.push(...this.validateStructure(file));
  }

  // -------------------------------------------------------------------------
  // Validation — reported, never swallowed
  // -------------------------------------------------------------------------

  /**
   * Everything wrong with the authored file that can be seen without the
   * content records. Computed once at construction.
   *
   * A defect is NOT thrown. A store that refuses to construct takes the whole
   * game down over one bad row; a store that reports lets the audit name the
   * row and the rest of the table keep working.
   */
  defects(): readonly ReceiverDefect[] {
    return this.loadDefects;
  }

  private validateStructure(file: ReceiverStatesFile): ReceiverDefect[] {
    const found: ReceiverDefect[] = [];

    for (const record of file.receivers) {
      const ids = new Set(record.states.map((s) => s.id));
      if (!ids.has(record.initial)) {
        found.push({
          receiverId: record.receiverId,
          spellId: null,
          reason: "unknown-state",
          detail: `initial "${record.initial}" is not one of its authored states`,
        });
      }
      if (ids.size !== record.states.length) {
        found.push({
          receiverId: record.receiverId,
          spellId: null,
          reason: "unknown-state",
          detail: "duplicate state id",
        });
      }
    }

    for (const table of file.branches) {
      const record = this.records.get(table.receiverId);
      if (!record) {
        found.push({
          receiverId: table.receiverId,
          spellId: table.spellId,
          reason: "unknown-receiver",
          detail: "a branch table names a receiver with no record",
        });
        continue;
      }
      const ids = new Set(record.states.map((s) => s.id));
      const covered = new Set<ReceiverStateId>();
      for (const branch of table.branches) {
        if (!ids.has(branch.whenState)) {
          found.push({
            receiverId: table.receiverId,
            spellId: table.spellId,
            reason: "unknown-state",
            detail: `branch for unknown state "${branch.whenState}"`,
          });
          continue;
        }
        if (covered.has(branch.whenState)) {
          found.push({
            receiverId: table.receiverId,
            spellId: table.spellId,
            reason: "missing-branch",
            detail: `state "${branch.whenState}" has more than one branch`,
          });
        }
        covered.add(branch.whenState);
        // A transition may only name a state that already exists, or it creates
        // a state the player can stand in with nothing authored for it.
        if (branch.becomes !== null && !ids.has(branch.becomes)) {
          found.push({
            receiverId: table.receiverId,
            spellId: table.spellId,
            reason: "unknown-state",
            detail: `branch "${branch.whenState}" becomes unauthored state "${branch.becomes}"`,
          });
        }
      }
      for (const id of ids) {
        if (!covered.has(id)) {
          found.push({
            receiverId: table.receiverId,
            spellId: table.spellId,
            reason: "missing-branch",
            detail: `state "${id}" has no authored branch`,
          });
        }
      }
    }

    return found;
  }

  /**
   * The substring guard, as a method rather than only a test.
   *
   * `lookup` hands back the `physical_outcome` for a pair — the caller owns
   * loading content, so this stays pure. Every clause must appear verbatim in
   * its record; anything else means the prose moved and the branch table is now
   * quoting text that no longer exists.
   */
  validateAgainstOutcomes(
    lookup: (spellId: string, receiverId: string) => string | undefined,
  ): ReceiverDefect[] {
    const found: ReceiverDefect[] = [];
    for (const table of this.tables.values()) {
      const outcome = lookup(table.spellId, table.receiverId);
      if (outcome === undefined) {
        found.push({
          receiverId: table.receiverId,
          spellId: table.spellId,
          reason: "unknown-receiver",
          detail: "no authored physical_outcome for this pair",
        });
        continue;
      }
      for (const branch of table.branches) {
        if (!outcome.includes(branch.clause)) {
          found.push({
            receiverId: table.receiverId,
            spellId: table.spellId,
            reason: "clause-not-in-outcome",
            detail: `state "${branch.whenState}": clause is not a substring of physical_outcome`,
          });
        }
      }
    }
    return found;
  }

  // -------------------------------------------------------------------------
  // Reading
  // -------------------------------------------------------------------------

  /** Every receiver this table knows, in authored order. */
  receivers(): readonly ReceiverRecord[] {
    return [...this.records.values()];
  }

  record(receiverId: string): ReceiverRecord | null {
    return this.records.get(receiverId) ?? null;
  }

  /** Whether this pair has an authored branch table. */
  kindOf(spellId: string, receiverId: string): PairKind {
    return this.tables.has(pairKey(spellId, receiverId)) ? "stateful" : "plain";
  }

  /**
   * The state this instance is in.
   *
   * Untracked instances answer with the receiver's `initial` rather than
   * `null` — a furnace nobody has touched is a cold furnace, not an unknown
   * one. `null` means the receiver is not in the table at all.
   */
  stateOf(receiverId: string, screenId: string | null = null): ReceiverStateId | null {
    const record = this.records.get(receiverId);
    if (!record) return null;
    return this.live.get(receiverKey(screenId, receiverId)) ?? record.initial;
  }

  /**
   * The authored branch that applies right now.
   *
   * `null` for a pair with no branch table — the caller then renders the
   * record's `physical_outcome`, which is what the other 71 authored pairs do.
   */
  select(
    spellId: string,
    receiverId: string,
    screenId: string | null = null,
  ): BranchSelection | null {
    const table = this.tables.get(pairKey(spellId, receiverId));
    if (!table) return null;
    const state = this.stateOf(receiverId, screenId);
    if (state === null) return null;
    const branch = table.branches.find((b) => b.whenState === state);
    if (!branch) return null;
    return { receiverId, screenId, state, branch };
  }

  // -------------------------------------------------------------------------
  // Writing
  // -------------------------------------------------------------------------

  /**
   * Move one instance to a state. Returns whether anything moved.
   *
   * Refuses a state the receiver does not author, rather than storing a value
   * no branch can match — that would silently strand the instance with nothing
   * to render.
   */
  setState(
    receiverId: string,
    screenId: string | null,
    next: ReceiverStateId,
    causeSpellId: string | null = null,
  ): boolean {
    const record = this.records.get(receiverId);
    if (!record) return false;
    if (!record.states.some((s) => s.id === next)) return false;

    const key = receiverKey(screenId, receiverId);
    const from = this.live.get(key) ?? record.initial;
    if (from === next) return false;

    this.live.set(key, next);
    this.bus?.emit({
      type: "receiver:state-changed",
      receiverId,
      screenId,
      from,
      to: next,
      causeSpellId,
    });
    return true;
  }

  /**
   * Back to authored initials.
   *
   * Every instance drops out of the map rather than being rewritten, so a
   * receiver added to the JSON later resets correctly too. Emits nothing: a
   * day-start reset is not 39 state-change events.
   */
  reset(): void {
    this.live.clear();
  }

  // -------------------------------------------------------------------------
  // Save
  // -------------------------------------------------------------------------

  /**
   * Only instances that have MOVED off their initial. A save that wrote every
   * default would freeze today's initials into old saves, so re-authoring an
   * initial would silently not reach a returning player.
   */
  snapshot(): ReceiverStateSnapshot {
    const out: Record<ReceiverKey, ReceiverStateId> = {};
    for (const [key, state] of this.live) out[key] = state;
    return out;
  }

  /**
   * Replace live state wholesale. Unknown receivers and unknown states are
   * DROPPED and reported, never stored: a save written against content that has
   * since been re-authored must not resurrect a state no branch matches.
   */
  restore(snapshot: ReceiverStateSnapshot): ReceiverDefect[] {
    const found: ReceiverDefect[] = [];
    this.live.clear();
    for (const [key, state] of Object.entries(snapshot)) {
      const slash = key.indexOf("/");
      const receiverId = slash < 0 ? key : key.slice(slash + 1);
      const record = this.records.get(receiverId);
      if (!record) {
        found.push({
          receiverId,
          spellId: null,
          reason: "unknown-receiver",
          detail: `saved state for a receiver this build does not author (key "${key}")`,
        });
        continue;
      }
      if (!record.states.some((s) => s.id === state)) {
        found.push({
          receiverId,
          spellId: null,
          reason: "unknown-state",
          detail: `saved state "${state}" is not authored (key "${key}")`,
        });
        continue;
      }
      this.live.set(key, state);
    }
    return found;
  }
}

/** Convenience for the audit: every authored branch, flattened. */
export function everyAuthoredBranch(
  file: ReceiverStatesFile = RECEIVER_STATES,
): { spellId: string; receiverId: string; branch: AuthoredBranch }[] {
  return file.branches.flatMap((t) =>
    t.branches.map((branch) => ({ spellId: t.spellId, receiverId: t.receiverId, branch })),
  );
}
