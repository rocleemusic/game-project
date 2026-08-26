/**
 * Which state a receiver is in, and the authored prose for each branch.
 *
 * THE GAP THIS CLOSES. 18 spell x receiver pairs already carry
 * `receiver_class: "stateful"` with BOTH branches authored, and nothing
 * anywhere tracks receiver state. `temper x forge_billet` is authored as:
 *
 *   "State-dependent: glowing hot, it hardens evenly with a hiss and holds its
 *    shape; already cold, no_effect — there is no heat to set."
 *
 * That is the mechanic, already written and already paid for. It just has
 * nothing reading it.
 *
 * WHY THE CLAUSE IS AUTHORED DATA AND NEVER PARSED.
 *
 * All 29 stateful outcomes share the shape `"State-dependent: A; B"`, so a
 * regex split looks trivial and is not. Several branches contain their OWN
 * semicolons and em-dashes — the example above has an em-dash inside the second
 * branch, and others carry a semicolon inside the first. Splitting by pattern
 * would render the wrong half of the prose to the player, silently, for the
 * subset where the shape is not literal. That is precisely the *inferred, not
 * authored* failure the forage join was called out for (GAPS G13), and it is
 * not being repeated here.
 *
 * So: a human COPIES each branch clause verbatim into `receiverStates.json`,
 * and a vitest guard asserts every `clause` is a substring of that record's
 * `physical_outcome`. Content drift then fails a test instead of rendering the
 * wrong branch. There is no parser in this folder and there must not be one.
 *
 * A LIVE BUG THESE TYPES EXIST TO FIX. `readsAsNoEffect` in
 * `magic/CastResolver.ts` is anchored with `/^no (physical )?effect\b/i`, but a
 * stateful branch embeds the marker MID-STRING ("...already cold, no_effect —
 * there is no heat to set"). So `temper x forge_billet` resolves as an *effect*
 * today and mints its `produces` regardless of state. Branch selection must run
 * BEFORE the no-effect test, and `AuthoredBranch.noEffect` below is the
 * authored answer that replaces the regex for stateful pairs.
 *
 * Types only. The store (`ReceiverStateStore.ts`), the authored data
 * (`data/receiverStates.json`), the cast composition (`statefulCast.ts`) and
 * the guard (`tests/ReceiverState.test.ts`) landed 2026-08-17, Wave 2 Track A.
 */

/**
 * An authored state name — `"cold"`, `"hot"`, `"lit"`. Deliberately a string
 * and not a closed union: states are content, and a new receiver bringing a new
 * state must not require a TypeScript edit.
 */
export type ReceiverStateId = string;

/**
 * Where a receiver's state lives. Receivers are per-screen instances — the
 * river stone at F2 is not the river stone at F4 — so state is keyed by both.
 * Format: `` `${screenId}/${receiverId}` ``. Screen-less contexts use `"*"`.
 */
export type ReceiverKey = string;

/** One authored state a receiver can be in. */
export interface ReceiverStateDef {
  readonly id: ReceiverStateId;
  /** Shown to nobody by default; for the audit report and edit mode. */
  readonly label: string;
}

/** A receiver and the states it moves between. */
export interface ReceiverRecord {
  readonly receiverId: string;
  /** The state it starts every life in, and returns to on a day-start reset. */
  readonly initial: ReceiverStateId;
  readonly states: readonly ReceiverStateDef[];
}

/**
 * One branch of a stateful outcome.
 *
 * `clause` is AUTHORED DATA, copied character-for-character out of the record's
 * `physical_outcome` by a human. Nothing derives it, nothing normalises it,
 * nothing trims it to taste. It is rendered verbatim.
 */
export interface AuthoredBranch {
  /** The state this branch applies in. */
  readonly whenState: ReceiverStateId;
  /** Verbatim substring of `physical_outcome`. Never regex-derived. */
  readonly clause: string;
  /**
   * Whether this branch is an authored "nothing happened".
   *
   * AUTHORED, not inferred — see the header note on `readsAsNoEffect`. And
   * no-effect is an honest result, never a failure: it renders neutral. Never
   * red, never a shake, never an error.
   */
  readonly noEffect: boolean;
  /**
   * State the receiver moves to after this branch fires. `null` = unchanged.
   *
   * A transition may only name a state that ALREADY EXISTS on the receiver, and
   * the store's validation refuses the file otherwise. Inventing a destination
   * state would create a state the player can stand in with no authored branch
   * for it — the same defect as a missing branch, arrived at from the other
   * side.
   */
  readonly becomes: ReceiverStateId | null;
  /**
   * Review provenance for THIS branch — why a borderline call went the way it
   * did. Optional, never rendered, never read by logic. Present so the
   * judgement calls in `receiverStates.json` are reviewable in the file that
   * carries them rather than in a commit message.
   */
  readonly note?: string;
}

/** The authored branch set for one spell x receiver pair. */
export interface ReceiverBranchTable {
  readonly spellId: string;
  readonly receiverId: string;
  /**
   * Every state in `ReceiverRecord.states` must have exactly one branch, or the
   * pair is a content defect. The guard test asserts that too — a missing
   * branch is a state the player can reach with nothing authored for it.
   */
  readonly branches: readonly AuthoredBranch[];
}

/** `world/receivers/data/receiverStates.json`. */
export interface ReceiverStatesFile {
  readonly receivers: readonly ReceiverRecord[];
  readonly branches: readonly ReceiverBranchTable[];
  /** How the clauses were obtained, stated in the file that carries them. */
  readonly provenance?: string;
}

/** Live state, for the save slice and the audit. */
export type ReceiverStateSnapshot = Readonly<Record<ReceiverKey, ReceiverStateId>>;

/** The result of selecting a branch — what the render layer is handed. */
export interface BranchSelection {
  readonly receiverId: string;
  readonly screenId: string | null;
  readonly state: ReceiverStateId;
  readonly branch: AuthoredBranch;
}

/** Why a branch could not be selected. Reported, never swallowed. */
export interface ReceiverDefect {
  readonly receiverId: string;
  readonly spellId: string | null;
  readonly reason:
    | "unknown-receiver"
    | "unknown-state"
    | "missing-branch"
    | "clause-not-in-outcome";
  readonly detail: string;
}
