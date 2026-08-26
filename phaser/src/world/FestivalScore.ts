/**
 * Festival scoring — Roc's ruling of 2026-08-23, built 2026-08-24 (T9).
 *
 * PURE. No Phaser, no DOM, no I/O. `src/world/**` may never import Phaser
 * (`tests/ArchitectureBoundary.test.ts`), and the arithmetic here is the whole
 * point of the file — it has to be testable without an engine underneath it.
 *
 * ---------------------------------------------------------------------------
 * THE RULING, IN ONE PARAGRAPH
 * ---------------------------------------------------------------------------
 *
 *   TIER comes from COMPLETED FESTIVAL GOALS ONLY.  1 goal = Quiet,
 *   2 = Warm, 3 = Grand.
 *
 *   BOND is the number of times the player TALKED to that soul, capped at ONE
 *   count per soul per day — so five, across the five-day week, is the ceiling
 *   for any one soul.
 *
 *   BONDS DO NOT FEED THE TIER. They drive per-soul things only: how deep that
 *   soul's dialogue goes, and who turns out on festival night.
 *
 *   The rare top state (souls-of-the-world) is all three goals AND every soul
 *   at max bond. It is a boolean on top of Grand, not a fourth tier.
 *
 * WHY THE TWO ARE KEPT APART, and it is not a preference. `gdd/03-core-loop.md`
 * ("Two tracks, running in parallel and never colliding") makes the festival
 * goal the soul's EXTERNAL objective — the only thing that moves the tier — and
 * the soul's inner arc INTERNAL, moving nothing on it. Feed bond into the tier
 * and the spectrum collapses into the niceness meter the 2026-07-29 no-choice-
 * scoring ruling exists to forbid. `bondsCount` is deliberately absent from
 * every tier function below; there is nowhere to wire it in without editing
 * `tierFor`, which is one line and reads as the ruling.
 *
 * NEVER A SCORE SHOWN. Nothing here formats anything for display and nothing
 * here returns a percentage, a total or a rating. The render layer
 * (`render/FestivalResults.ts`) turns this into the festival's own look, the
 * names of who came, and the town work that got finished — no numbers reach
 * the screen. The counts below exist so the arithmetic is testable and
 * verifiable, not so it can be printed.
 *
 * ---------------------------------------------------------------------------
 * THIS IS NOT A SECOND BOND SCORE
 * ---------------------------------------------------------------------------
 *
 * `tools/lantern/src/lib/world.ts` already holds ONE hidden weighted count per
 * soul (`recordBond`, category weights x trait coefficient), mirrored to ink as
 * the coarse 0/1/2 band that `GateEngine`'s bond rules read. That number is the
 * NARRATIVE bond and it stays exactly as it is — this file neither reads nor
 * writes it, and `GateEngine` never sees anything from here.
 *
 * What `FestivalLedger` holds is a different fact with a different name in the
 * ruling: HOW MANY DAYS the player went and talked to someone. It is host-side,
 * it lives in the Phaser save, and it is capped at one per day so a player who
 * re-opens the same portrait six times in one afternoon has done one day's
 * talking. Splitting it out here rather than adding a field to `WorldState` is
 * what keeps `guardrails.md` check 2 ("a second stored bond number per soul")
 * honest: the weighted bond is still one number, in one place, owned by ink's
 * host; this is a talk calendar.
 */

import type { Graph, RoleWorkplace, Soul } from "@lantern/types";
import type { PlayView } from "@lantern/lib/play";

// ---------------------------------------------------------------------------
// Tuning — the three numbers the ruling turns on, named so they are greppable
// ---------------------------------------------------------------------------

/**
 * Thread moves needed before a role's festival goal counts as COMPLETED.
 *
 * One, today, and stated as a constant rather than buried in a `> 0`. No data
 * anywhere records how many moves a thread has left in it — the thread docs
 * carry three or four authored conversations each, but the ink emits a
 * `recordThreadMove` per option taken, not per state reached, so "all of it"
 * is not a number this build can read. One move is therefore the cheapest
 * HONEST reading of "the player helped with this goal", and raising the bar
 * later is this constant, not a rewrite.
 */
export const GOAL_COMPLETE_MIN_MOVES = 1;

/**
 * Talk-days at which a soul reads as CLOSE rather than merely present.
 *
 * Bond drives "dialogue depth and who shows up" (the ruling) — that is two
 * bands plus absent, and this is the line between them. Not a score: nothing
 * renders this number, and no gate reads it.
 */
export const BOND_CLOSE_MIN = 3;

/** Fallback week length when `graph.day_loop` is absent (older graph.json). */
export const DEFAULT_DAYS_PER_LIFE = 5;

// ---------------------------------------------------------------------------
// The ledger — per-soul talk DAYS, capped at one a day
// ---------------------------------------------------------------------------

/** What `FestivalLedger` writes down. `soul_id -> the day numbers talked on`. */
export type FestivalLedgerData = { readonly talkDays: Readonly<Record<string, readonly number[]>> };

/**
 * Per-soul talk calendar. A Set of DAY NUMBERS, not a counter, which is what
 * makes the one-per-day cap structural instead of a guard someone can forget:
 * recording the same soul twice on day 3 adds nothing, because 3 is already in
 * the set.
 */
export class FestivalLedger {
  private readonly talkDays = new Map<string, Set<number>>();

  /**
   * The player talked to `soulId` on `day`.
   *
   * Returns true only when this was that soul's FIRST talk of the day — the
   * caller can use it to fire a one-a-day beat without keeping a second copy
   * of the same fact. A non-finite or non-positive day is refused rather than
   * stored: ink owns the clock, and a garbage day number here would be a
   * permanent phantom entry in the ledger.
   */
  recordTalk(soulId: string, day: number): boolean {
    if (!soulId || !Number.isFinite(day) || day < 1) return false;
    const days = this.talkDays.get(soulId) ?? new Set<number>();
    if (days.has(day)) return false;
    days.add(day);
    this.talkDays.set(soulId, days);
    return true;
  }

  /** How many distinct days the player talked to this soul. 0 if never. */
  bondOf(soulId: string): number {
    return this.talkDays.get(soulId)?.size ?? 0;
  }

  /** Every soul the player has talked to at least once, in id order. */
  talkedTo(): string[] {
    return [...this.talkDays.keys()].sort();
  }

  capture(): FestivalLedgerData {
    const talkDays: Record<string, number[]> = {};
    for (const [soulId, days] of this.talkDays) talkDays[soulId] = [...days].sort((a, b) => a - b);
    return { talkDays };
  }

  /** Replace the whole ledger from a save. Additive restores are a lie. */
  restore(data: FestivalLedgerData): void {
    this.talkDays.clear();
    for (const [soulId, days] of Object.entries(data.talkDays)) {
      this.talkDays.set(soulId, new Set(days.filter((d) => Number.isFinite(d) && d >= 1)));
    }
  }
}

// ---------------------------------------------------------------------------
// Goals — the tier's only input
// ---------------------------------------------------------------------------

/** One dealt role's festival goal, and whether this life finished it. */
export interface FestivalGoalStatus {
  readonly soulId: string;
  readonly soulName: string;
  readonly roleTag: string | null;
  /** The role's authored goal prose, e.g. "Prepares the communal feast". */
  readonly goal: string | null;
  /**
   * False when the dealt role ships no `goal_threads` — a CONTENT gap, and a
   * different thing from "the player has not done it yet". Reported rather
   * than folded into `completed` so the two never read the same.
   */
  readonly goalAuthored: boolean;
  /** Which of the role's goal threads actually moved. */
  readonly movedVia: readonly string[];
  readonly completed: boolean;
}

/**
 * Every dealt role's goal status, in roster order.
 *
 * Mirrors `tools/resolver/src/roleGoals.ts` deliberately — same inputs, same
 * "an unauthored role goal can never have advanced" rule — because the resolver
 * is not importable from this package (`tsconfig.json` aliases `@lantern/*`
 * only). The two are kept honest by `tests/FestivalScore.test.ts` running the
 * same worked example the resolver's own suite does.
 *
 * `threadMoves` is `PlayView.threadMoves` verbatim: thread_id -> how many times
 * `recordThreadMove` fired for it this life. That is the ONE external signal —
 * no dialogue option is tallied anywhere, which is the 2026-07-29 ruling.
 */
export function festivalGoals(
  souls: readonly Soul[],
  roleWorkplace: readonly RoleWorkplace[],
  threadMoves: Readonly<Record<string, number>>,
): FestivalGoalStatus[] {
  const byRole = new Map(roleWorkplace.map((r) => [r.role_tag, r]));
  return souls
    .filter((s) => Boolean(s.role_tag))
    .map((s) => {
      const role = s.role_tag ? byRole.get(s.role_tag) : undefined;
      const goalThreads = role?.goal_threads ?? [];
      const movedVia = goalThreads.filter((t) => (threadMoves[t] ?? 0) >= GOAL_COMPLETE_MIN_MOVES);
      return {
        soulId: s.soul_id,
        soulName: s.name ?? s.soul_id,
        roleTag: s.role_tag ?? null,
        goal: role?.goal ?? null,
        goalAuthored: goalThreads.length > 0,
        movedVia,
        completed: movedVia.length > 0,
      };
    });
}

// ---------------------------------------------------------------------------
// Bond standings — per-soul only, never summed into the tier
// ---------------------------------------------------------------------------

export type BondDepth = "absent" | "present" | "close";

/** One soul's standing on festival night. */
export interface FestivalSoulStanding {
  readonly soulId: string;
  readonly name: string;
  /** Distinct days talked to. Never rendered — see the file header. */
  readonly talkDays: number;
  readonly depth: BondDepth;
  /** True at the week's ceiling — one of the two souls-of-the-world tests. */
  readonly atMax: boolean;
}

export function bondDepthOf(talkDays: number): BondDepth {
  if (talkDays <= 0) return "absent";
  return talkDays >= BOND_CLOSE_MIN ? "close" : "present";
}

// ---------------------------------------------------------------------------
// The tier
// ---------------------------------------------------------------------------

/**
 * The tier vocabulary, as DATA as well as a type (T13 Phase 5, 2026-08-24).
 *
 * The union alone could not answer "how many endings are there" at runtime, and
 * the rollover's discovery summary has to say "reached X of N endings". A
 * literal `3` at the call site would be a second place the tier count lives, so
 * the list moved here — beside `tierFor`, which is the only thing that produces
 * one — and `FestivalTier` is derived FROM it rather than restated. Adding a
 * tier is one edit, and the denominator follows.
 *
 * These three words are still never printed to the player: `FestivalResults`'s
 * header rule ("the tier WORDS quiet/warm/grand are not printed either") holds,
 * and the rollover counts them without naming them.
 */
export const FESTIVAL_TIERS = ["quiet", "warm", "grand"] as const;

export type FestivalTier = (typeof FESTIVAL_TIERS)[number];

/**
 * Goals completed -> tier. The whole ruling, one line each.
 *
 * ZERO GOALS IS STILL QUIET. The ruling names 1 = Quiet and there is no fourth
 * tier under it; `03-core-loop.md` is explicit that "a festival always ends
 * WITH something" and that there is no hard-lose. So a week with nothing
 * finished shows the modest festival, not an absence of one.
 */
export function tierFor(goalsCompleted: number): FestivalTier {
  if (goalsCompleted >= 3) return "grand";
  if (goalsCompleted === 2) return "warm";
  return "quiet";
}

/** The one read taken at festival night. */
export interface FestivalScore {
  readonly goals: readonly FestivalGoalStatus[];
  readonly goalsCompleted: number;
  readonly tier: FestivalTier;
  /**
   * The rare top state: every goal finished AND every soul at the week's talk
   * ceiling. A boolean riding on Grand, never a fourth tier — parked as "unless
   * cheap" in the ruling, and this is the cheap version.
   */
  readonly soulsOfTheWorld: boolean;
  /** Every soul in the cast, in roster order. */
  readonly standings: readonly FestivalSoulStanding[];
  /** The ones who turn out — `depth !== "absent"`, roster order. */
  readonly attending: readonly FestivalSoulStanding[];
}

export interface FestivalScoreInput {
  readonly souls: readonly Soul[];
  readonly roleWorkplace: readonly RoleWorkplace[];
  readonly threadMoves: Readonly<Record<string, number>>;
  readonly ledger: Pick<FestivalLedger, "bondOf">;
  /** `graph.day_loop.days_per_life`. The per-soul talk ceiling. */
  readonly daysPerLife?: number;
}

/**
 * Score the life. ONE read, taken at festival night — nothing here mutates,
 * caches or emits, so calling it twice is free and calling it early is honest.
 */
export function scoreFestival(input: FestivalScoreInput): FestivalScore {
  const daysPerLife =
    Number.isFinite(input.daysPerLife) && (input.daysPerLife ?? 0) > 0
      ? (input.daysPerLife as number)
      : DEFAULT_DAYS_PER_LIFE;

  const goals = festivalGoals(input.souls, input.roleWorkplace, input.threadMoves);
  const goalsCompleted = goals.filter((g) => g.completed).length;

  const standings: FestivalSoulStanding[] = input.souls.map((s) => {
    const talkDays = input.ledger.bondOf(s.soul_id);
    return {
      soulId: s.soul_id,
      name: s.name ?? s.soul_id,
      talkDays,
      depth: bondDepthOf(talkDays),
      atMax: talkDays >= daysPerLife,
    };
  });

  return {
    goals,
    goalsCompleted,
    tier: tierFor(goalsCompleted),
    soulsOfTheWorld:
      goalsCompleted >= 3 && standings.length > 0 && standings.every((s) => s.atMax),
    standings,
    attending: standings.filter((s) => s.depth !== "absent"),
  };
}

/**
 * THE ONE SCORING READ, in the shape a running game has the parts in.
 *
 * Lives here rather than on `CollectScene` so the scene stays orchestration:
 * the scene owns the ledger and calls this, and every rule about WHAT is read
 * sits in one file with the arithmetic it feeds.
 *
 * Side-effect-free, so calling it on every render of the Final Screen is
 * honest and cheap, and calling it early (the walker probe does, for
 * verification) cannot change the answer later. There is deliberately no
 * "compute the score once and freeze it" step: a frozen score is a second copy
 * of counters that are already saved.
 *
 * `v.threadMoves` is ink's own live tally — the goals half needs no host
 * storage at all, because a completed festival goal IS a thread move inside
 * ink's state, and a second copy would be a second writer. Only the talk
 * calendar is host-side, and only it is in the save.
 *
 * An older `graph.json` with no `souls` / `role_workplace` / `day_loop` scores
 * as an empty, Quiet week rather than throwing — a missing block is a run
 * folder built before D7, not a broken game.
 */
export function scoreFestivalForRun(
  graph: Graph,
  v: PlayView,
  ledger: Pick<FestivalLedger, "bondOf">,
): FestivalScore {
  return scoreFestival({
    souls: graph.souls ?? [],
    roleWorkplace: graph.role_workplace ?? [],
    threadMoves: v.threadMoves,
    ledger,
    daysPerLife: graph.day_loop?.days_per_life,
  });
}
