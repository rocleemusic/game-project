// walk.ts — the deterministic playtest walker (W2).
//
// Plain code, no LLM. It drives the COMPILED story (inkjs) the way the host
// will: it binds the four EXTERNALs, keeps the one hidden bond count per soul,
// mirrors the resulting BAND back into bondLevel_<soul>, and re-applies
// present_<soul> from day-N.json every time the (day, TimeOfDay) pair moves.
//
// Two entry points:
//   walkWeek(...)        plays one 5-day week under a supplied strategy
//   searchReachable(...) a BOUNDED best-effort search for what a week can reach
//
// The core takes story JSON + graph + days as arguments and does no file I/O,
// so tests can build all three in memory.
//
// -------------------------------------------------------------------------
// Why the search is shaped the way it is
// -------------------------------------------------------------------------
// A blind BFS/DFS over whole-game states is hopeless here: a day offers ~6-8
// world choices, a week is 5 days x (1 start + 3 moves) plus every scene's
// options, so the raw tree is ~10^30 leaves. Memoising on a state key does not
// help either, because the interesting state (bond counts, KnownPhrases,
// once-only read counts) is nearly all distinct along every path.
//
// So the search factors the problem the way the GAME factors it:
//
//   Stage 1 (pure, no ink)  The world layer is small and finite. A day is
//       "pick a start screen, then <= moves_per_day exits", and moves_per_day
//       is a PER-BLOCK budget (RULED 2026-08-01): 3 moves fill morning, 3 more
//       fill afternoon, 3 more fill evening — night is never entered by
//       movement, it is festival night, day 5's terminal beat, not a walkable
//       block (see ink.ts's advance_time, which never cycles evening ->
//       night). connects_to is a path, so exits run both ways. Enumerating
//       every route is ~100 sequences. Crossed with each day's slot_fill that
//       yields the exact set of scene ENTRY OPPORTUNITIES (scene, day, screen,
//       block), each flagged LIVE or not — see below.
//
//   Stage 2 (exact assignment)  Collapse those routes to the distinct maximal
//       sets of scenes each day can open, drop dominated sets, and solve the
//       week with a memoised DFS over (day, covered). Exact, not greedy: two
//       scenes can share their only day, so a greedy "grab the easy one first"
//       strands the other for the whole week.
//
//   Stage 3 (real ink)  Bond and knowledge only move INSIDE scenes. Walk the
//       plan for real and at each scene run an EXHAUSTIVE snapshot/restore DFS
//       over that scene's option tree — tens to hundreds of leaves, complete.
//       Record every choice_id / option_id, then replay the biased branch.
//
//   Stage 4 (probe and repeat)  A scene entry is ONCE-ONLY for the whole week,
//       so entering on the wrong day does not waste a turn, it destroys the
//       scene. Two mechanisms keep that from silently costing coverage:
//       - the plan refuses any day on which a scene's day gates leave it shut,
//         and prefers the day that opens the MOST of it;
//       - any entry that came back incomplete gets its day recorded, and the
//         next week is planned to try a different one, until no untried day is
//         left. This backstop needs no predicate reading, so it also covers
//         gates the planner cannot see (knows(...), an item, a band).
//
//   Stage 5 (two biases)  bond_band(...) gates are mutually exclusive ACROSS
//       weeks: a bond-maximal week arrives at a band-gated beat in mid, so the
//       `= low` variant is never offered. Everything above is therefore run
//       twice — once earning as much bond as possible, once as little.
//
//   Stage 6 (bond, not coverage)  Coverage is the wrong objective for "how
//       much bond": two cheap scenes out-score one rich one. With every scene's
//       measured gain in hand, re-solve the assignment against BOND and walk
//       it. Each soul gets its own optimal week, because "max bond for Toby"
//       and "max bond for Ilsa" are different questions.
//
// Exact on the world layer, exhaustive inside each scene, and honest about the
// join: MaxBond.upperBound sums every reachable scene's gain, `exact` says
// whether one week could actually collect all of it, and `blockedBy` names the
// scenes it had to give up when it could not.
//
// Every bound is reported. A truncated search must never read as a proof of
// unreachability, so SearchResult.bounds.hit is the first thing to check, and
// UnreachableNote.expected separates "by design" from "somebody look at this".

import { Story } from "inkjs";
import { inkAddress } from "./ids.ts";
import { bondBandOf, bondDelta } from "./tuning.ts";
import { FESTIVAL_SCREEN_ID } from "./graph.ts";
import { TIME_BLOCKS } from "./types.ts";
import type { DayJson, Graph, TimeBlock } from "./types.ts";

// ---------------------------------------------------------------------------
// Generated navigation labels
// ---------------------------------------------------------------------------
// inkjs does not expose a Choice's tags, so the walker reads the world layer
// off the labels the EMITTER generates (ink.ts). These are machine-authored
// strings, never prose — authored dialogue never produces them. Scene identity
// is still confirmed from the #scene: tag on the lines that follow.

export const LABEL_END_DAY = "End the day";
export const PREFIX_TALK = "Talk to ";
export const PREFIX_BEGIN = "Begin at ";
export const PREFIX_GO = "Go to ";
/** home_hub_final's only forward option (ink.ts's emitMain) — starts with
 * PREFIX_GO, matching the existing "Go to <screen>" world-move convention. */
export const LABEL_GO_FESTIVAL = "Go to the Festival night";
/** The Festival Grounds' always-available night choice (ink.ts's emitScreen). */
export const LABEL_BEGIN_VIGNETTE = "Begin the festival vignette";
/** The night-version screen's only forward option (ink.ts's emitMain,
 * GP-51) — starts with PREFIX_GO, matching the world-move convention, so
 * inWorld and the first-choice fallbacks already handle it. */
export const LABEL_GO_RESULTS = "Go to the results";

/** ink.ts collapses whitespace in every label it emits; match that exactly. */
function cleanText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

/** Float bond counts (a 0.7 trait coefficient) need pinning or they drift. */
function round6(n: number): number {
  return Math.round(n * 1e6) / 1e6;
}

// ---------------------------------------------------------------------------
// Public shapes
// ---------------------------------------------------------------------------

export interface WalkInputs {
  /** inkjs Story.ToJson() output — out-calib/story.json, or built in memory. */
  storyJson: string;
  graph: Graph;
  /** day-1.json .. day-N.json, in day order. */
  days: DayJson[];
}

export interface ChoiceView {
  readonly index: number;
  readonly text: string;
}

/** Everything a strategy may look at. Enough state that a strategy can be pure. */
export interface WalkContext {
  readonly step: number;
  readonly day: number;
  readonly timeBlock: string;
  readonly movesLeft: number;
  /** screen_id from the last #screen: tag; null at the day's screen_hub. */
  readonly screen: string | null;
  /** scene_id when inside a scene, null in the world layer. */
  readonly scene: string | null;
  /** how many choice points this scene visit has already presented. */
  readonly sceneStep: number;
  /** true at screen_hub or a screen hub — i.e. not inside a scene. */
  readonly inWorld: boolean;
  readonly choices: readonly ChoiceView[];
  readonly visitedScenes: ReadonlySet<string>;
  readonly takenOptions: ReadonlySet<string>;
  readonly bond: Readonly<Record<string, number>>;
}

export type Strategy = (ctx: WalkContext) => number;

export interface WalkTraceEntry {
  step: number;
  day: number;
  timeBlock: string;
  screen: string | null;
  scene: string | null;
  index: number;
  text: string;
}

export interface WalkResult {
  /** the story reached -> END (day > days_per_life). */
  ended: boolean;
  finalDay: number;
  steps: number;
  scenesEntered: string[];
  choiceNodesEntered: string[];
  optionsTaken: string[];
  /** the one hidden count per soul. */
  bond: Record<string, number>;
  /** 0 low / 1 mid / 2 high, as mirrored into bondLevel_<soul>. */
  bands: Record<string, 0 | 1 | 2>;
  threadsMoved: string[];
  knowledge: string[];
  canonWrites: string[];
  /** anything story.onError reported — an unbound EXTERNAL, a bad divert. */
  errors: string[];
  /** true when the step cap stopped the walk before the story ended. */
  truncated: boolean;
  trace: WalkTraceEntry[];
}

export interface WalkOptions {
  /** hard cap on choices taken; a real 5-day week needs well under 200. */
  maxSteps?: number;
}

// ---------------------------------------------------------------------------
// The runner
// ---------------------------------------------------------------------------

type Bucket = "scenes" | "choiceNodes" | "options" | "threads" | "knowledge" | "canon";

interface Snapshot {
  state: string;
  bond: Record<string, number>;
  scenesEntered: string[];
  choiceNodesEntered: string[];
  optionsTaken: string[];
  threadsMoved: string[];
  knowledge: string[];
  canonWrites: string[];
  errors: string[];
  sceneEntryDay: [string, number][];
  screen: string | null;
  scene: string | null;
  sceneStep: number;
  presenceKey: string;
  step: number;
}

/**
 * One live playthrough. Exported because searchReachable drives it directly
 * (snapshot/restore around a scene's option tree), which no Strategy could do.
 */
export class Walker {
  readonly story: Story;
  readonly graph: Graph;
  readonly bond: Record<string, number> = {};

  private readonly soulIds: string[];
  private readonly presence = new Map<string, Map<string, string>>();
  private seen: Record<Bucket, Set<string>> = {
    scenes: new Set<string>(),
    choiceNodes: new Set<string>(),
    options: new Set<string>(),
    threads: new Set<string>(),
    knowledge: new Set<string>(),
    canon: new Set<string>(),
  };
  private order: Record<Bucket, string[]> = {
    scenes: [],
    choiceNodes: [],
    options: [],
    threads: [],
    knowledge: [],
    canon: [],
  };
  private sceneEntryDay = new Map<string, number>();
  private errors: string[] = [];
  private screen: string | null = null;
  private scene: string | null = null;
  private sceneStep = 0;
  private presenceKey = "";
  private step = 0;

  constructor(inputs: WalkInputs) {
    this.graph = inputs.graph;
    this.soulIds = inputs.graph.souls.map((s) => s.soul_id);
    for (const day of inputs.days) {
      for (const fill of day.slot_fill) {
        const key = `${day.day}|${fill.time_block}`;
        let m = this.presence.get(key);
        if (!m) {
          m = new Map();
          this.presence.set(key, m);
        }
        // First entry wins, matching the order day.json lists them in.
        if (!m.has(fill.soul)) m.set(fill.soul, fill.screen_id);
      }
    }

    this.story = new Story(inputs.storyJson);
    // The host binds these for real, so the walker must too. Fallbacks OFF is
    // the point of the exercise: an unbound EXTERNAL has to be an error.
    this.story.allowExternalFunctionFallbacks = false;
    this.story.onError = (message: string) => {
      this.errors.push(message);
    };

    this.story.BindExternalFunction("recordBond", (soul: string, category: string) => {
      // ONE hidden count per soul. Never a per-category sub-score — the
      // category is a WEIGHT on this single delta (guardrails check 2).
      const next = round6((this.bond[soul] ?? 0) + bondDelta(category, soul, this.graph.bond));
      this.bond[soul] = next;
      // Mirror the BAND (not the count) back for the compiled guard to read.
      this.story.variablesState[`bondLevel_${inkAddress(soul)}`] = bondBandOf(next, this.graph.bond);
      return 0;
    });
    this.story.BindExternalFunction("recordKnowledge", (phrase: string) => {
      this.note("knowledge", phrase);
      return 0;
    });
    this.story.BindExternalFunction("recordThreadMove", (threadId: string) => {
      this.note("threads", threadId);
      return 0;
    });
    this.story.BindExternalFunction("recordCanonWrite", (fact: string) => {
      this.note("canon", fact);
      return 0;
    });
  }

  private note(bucket: Bucket, value: string): void {
    if (this.seen[bucket].has(value)) return;
    this.seen[bucket].add(value);
    this.order[bucket].push(value);
  }

  /** The day a scene was first entered on, or undefined if it never was. */
  dayOfSceneEntry(sceneId: string): number | undefined {
    return this.sceneEntryDay.get(sceneId);
  }

  /** Cheap read-only views, so the search never serialises state just to look. */
  get seenChoiceNodes(): ReadonlySet<string> {
    return this.seen.choiceNodes;
  }

  get seenOptions(): ReadonlySet<string> {
    return this.seen.options;
  }

  // ---- world state ----

  get currentDay(): number {
    return Number(this.story.variablesState["day"] ?? 0);
  }

  get currentBlock(): string {
    const raw: unknown = this.story.variablesState["TimeOfDay"];
    return raw === null || raw === undefined ? "" : String(raw);
  }

  get movesLeft(): number {
    return Number(this.story.variablesState["movesLeft"] ?? 0);
  }

  /**
   * present_<soul> = screen_id for every slot_fill entry matching the current
   * (day, time_block), "none" for everyone else. Re-applied whenever the pair
   * moves — including mid-Continue, because the day loop moves both.
   */
  private syncPresence(): void {
    const block = this.currentBlock;
    if (block === "") return; // TimeOfDay is unset until day_start runs
    const key = `${this.currentDay}|${block}`;
    if (key === this.presenceKey) return;
    this.presenceKey = key;
    const here = this.presence.get(key);
    for (const soul of this.soulIds) {
      this.story.variablesState[`present_${inkAddress(soul)}`] = here?.get(soul) ?? "none";
    }
  }

  private ingestTags(tags: readonly string[]): void {
    for (const tag of tags) {
      const i = tag.indexOf(":");
      if (i < 0) continue;
      const key = tag.slice(0, i);
      const value = tag.slice(i + 1);
      if (key === "screen") {
        this.screen = value;
      } else if (key === "scene") {
        // A self-divert re-enters the scene from the top; do not restart the
        // in-scene step counter, or a replayed option sequence desynchronises.
        if (this.scene !== value) {
          this.scene = value;
          this.sceneStep = 0;
        }
        if (!this.sceneEntryDay.has(value)) this.sceneEntryDay.set(value, this.currentDay);
        this.note("scenes", value);
      } else if (key === "choice") {
        this.note("choiceNodes", value);
      } else if (key === "opt") {
        this.note("options", value);
      } else if (key === "id" && value === "SYS-DAY-BEGIN") {
        // A new day starts at screen_hub, which is nowhere in particular.
        this.screen = null;
      }
    }
  }

  /**
   * Continue one line at a time (never ContinueMaximally) so presence can be
   * re-applied between the day loop moving the clock and the next screen hub
   * evaluating its {present_<soul> == "..."} guards.
   */
  pump(): void {
    while (this.story.canContinue) {
      this.story.Continue();
      this.ingestTags(this.story.currentTags ?? []);
      this.syncPresence();
    }
    this.syncPresence();
  }

  get choices(): ChoiceView[] {
    const offered = this.story.currentChoices as { text: string }[];
    return offered.map((c, index) => ({ index, text: c.text }));
  }

  /**
   * The world layer always offers "End the day", EXCEPT the Home Hub's
   * calendar (ink.ts's `calendar` stitch, D2) — there is no day left to end
   * between days, so it offers only "Go to <name>" picks — and the Festival
   * Grounds at night (ink.ts's emitScreen), which offers "End the day" too
   * but is otherwise recognized by its always-available
   * "Begin the festival vignette" (the final sequence's own reserved label,
   * same machine-authored contract). A scene's option list never produces
   * any of these (the file header comment: they are machine-authored, never
   * prose), so checking all three keeps the discriminator correct without
   * weakening it anywhere a scene could be mistaken for the world layer.
   */
  get inWorld(): boolean {
    const offered = this.story.currentChoices as { text: string }[];
    return offered.some(
      (c) => c.text === LABEL_END_DAY || c.text.startsWith(PREFIX_GO) || c.text === LABEL_BEGIN_VIGNETTE,
    );
  }

  context(): WalkContext {
    const inWorld = this.inWorld;
    if (inWorld && this.scene !== null) {
      this.scene = null;
      this.sceneStep = 0;
    }
    return {
      step: this.step,
      day: this.currentDay,
      timeBlock: this.currentBlock,
      movesLeft: this.movesLeft,
      screen: this.screen,
      scene: this.scene,
      sceneStep: this.sceneStep,
      inWorld,
      choices: this.choices,
      visitedScenes: this.seen.scenes,
      takenOptions: this.seen.options,
      bond: this.bond,
    };
  }

  /** Choose-then-continue: an option's `~` actions only run on the Continue. */
  choose(index: number): void {
    const inScene = !this.inWorld;
    this.story.ChooseChoiceIndex(index);
    this.step += 1;
    if (inScene) this.sceneStep += 1;
    this.pump();
  }

  // ---- snapshot / restore (the search's only way to branch) ----

  snapshot(): Snapshot {
    return {
      state: this.story.state.ToJson(),
      bond: { ...this.bond },
      scenesEntered: [...this.order.scenes],
      choiceNodesEntered: [...this.order.choiceNodes],
      optionsTaken: [...this.order.options],
      threadsMoved: [...this.order.threads],
      knowledge: [...this.order.knowledge],
      canonWrites: [...this.order.canon],
      errors: [...this.errors],
      sceneEntryDay: [...this.sceneEntryDay],
      screen: this.screen,
      scene: this.scene,
      sceneStep: this.sceneStep,
      presenceKey: this.presenceKey,
      step: this.step,
    };
  }

  restore(snap: Snapshot): void {
    this.story.state.LoadJson(snap.state);
    for (const k of Object.keys(this.bond)) delete this.bond[k];
    Object.assign(this.bond, snap.bond);
    this.order = {
      scenes: [...snap.scenesEntered],
      choiceNodes: [...snap.choiceNodesEntered],
      options: [...snap.optionsTaken],
      threads: [...snap.threadsMoved],
      knowledge: [...snap.knowledge],
      canon: [...snap.canonWrites],
    };
    this.seen.scenes = new Set(this.order.scenes);
    this.seen.choiceNodes = new Set(this.order.choiceNodes);
    this.seen.options = new Set(this.order.options);
    this.seen.threads = new Set(this.order.threads);
    this.seen.knowledge = new Set(this.order.knowledge);
    this.seen.canon = new Set(this.order.canon);
    this.errors = [...snap.errors];
    this.sceneEntryDay = new Map(snap.sceneEntryDay);
    this.screen = snap.screen;
    this.scene = snap.scene;
    this.sceneStep = snap.sceneStep;
    this.presenceKey = snap.presenceKey;
    this.step = snap.step;
  }

  result(truncated: boolean, trace: WalkTraceEntry[]): WalkResult {
    const bands: Record<string, 0 | 1 | 2> = {};
    for (const soul of this.soulIds) {
      bands[soul] = bondBandOf(this.bond[soul] ?? 0, this.graph.bond);
    }
    const bond: Record<string, number> = {};
    for (const soul of this.soulIds) bond[soul] = this.bond[soul] ?? 0;
    return {
      ended: !this.story.canContinue && this.story.currentChoices.length === 0,
      finalDay: this.currentDay,
      steps: this.step,
      scenesEntered: [...this.order.scenes],
      choiceNodesEntered: [...this.order.choiceNodes],
      optionsTaken: [...this.order.options],
      bond,
      bands,
      threadsMoved: [...this.order.threads],
      knowledge: [...this.order.knowledge],
      canonWrites: [...this.order.canon],
      errors: [...this.errors],
      truncated,
      trace,
    };
  }
}

// ---------------------------------------------------------------------------
// (a) walkWeek
// ---------------------------------------------------------------------------

/**
 * Play one week under `strategy`. Deterministic: the same inputs and the same
 * strategy produce a byte-identical WalkResult, because nothing here is seeded
 * by a clock or a PRNG.
 */
export function walkWeek(
  inputs: WalkInputs,
  strategy: Strategy,
  options: WalkOptions = {},
): WalkResult {
  const maxSteps = options.maxSteps ?? 2000;
  const walker = new Walker(inputs);
  const trace: WalkTraceEntry[] = [];
  let truncated = false;

  walker.pump();
  while (walker.choices.length > 0) {
    if (trace.length >= maxSteps) {
      truncated = true;
      break;
    }
    const ctx = walker.context();
    const index = strategy(ctx);
    if (!Number.isInteger(index) || index < 0 || index >= ctx.choices.length) {
      throw new Error(
        `strategy returned ${String(index)}, outside 0..${ctx.choices.length - 1} ` +
          `at step ${ctx.step} (day ${ctx.day} ${ctx.timeBlock}, screen ${String(ctx.screen)})`,
      );
    }
    trace.push({
      step: ctx.step,
      day: ctx.day,
      timeBlock: ctx.timeBlock,
      screen: ctx.screen,
      scene: ctx.scene,
      index,
      text: ctx.choices[index].text,
    });
    walker.choose(index);
  }
  return walker.result(truncated, trace);
}

// ---------------------------------------------------------------------------
// Stage 1 — the world layer, enumerated exactly (pure; no ink involved)
// ---------------------------------------------------------------------------

export interface Visit {
  screen: string;
  block: TimeBlock;
}

/** One day's movement: screens[0] is where the day begins, then each move. */
export interface Route {
  screens: string[];
  visits: Visit[];
}

/** The three ordinary daily blocks a route can walk through. Night is never
 * entered by movement — it is festival night, day 5's terminal beat, not a
 * normal block (ink.ts's advance_time never cycles evening -> night). */
const DAY_BLOCKS: TimeBlock[] = ["morning", "afternoon", "evening"];

/**
 * moves_per_day is a PER-BLOCK budget (RULED 2026-08-01), not a whole-day
 * total — see emitMoveTo in ink.ts. A block's Nth (budget-exhausting) move
 * both advances the clock AND makes the move in the same step, so that
 * arrival lands already inside the NEXT block; only evening has no next
 * block to hand off to, so its Nth move sends the player home instead of
 * arriving anywhere. That makes each block's own arrival count N-1, N, N for
 * morning/afternoon/evening respectively (3N-1 total, not 3N).
 */
function blockAt(moveIndex: number, movesPerBlock: number): TimeBlock {
  const morningEnd = movesPerBlock - 1; // morning keeps N-1 arrivals
  const afternoonEnd = morningEnd + movesPerBlock; // afternoon keeps N
  if (moveIndex < morningEnd) return DAY_BLOCKS[0];
  if (moveIndex < afternoonEnd) return DAY_BLOCKS[1];
  return DAY_BLOCKS[2];
}

/**
 * Every maximal route a single day can take: a start screen, then exits until
 * the day's whole 3-block budget (3*moves_per_day - 1 arrivals — see blockAt)
 * is spent or the screen has nowhere to go. Prefixes are not listed
 * separately — a prefix visits a subset of the same places, so it can never
 * reach more.
 */
export function enumerateRoutes(graph: Graph): Route[] {
  const byId = new Map(graph.screens.map((s) => [s.screen_id, s]));
  // Connections are UNDIRECTED, matching what emitScreen emits and what
  // computeHealth has always assumed: connects_to models a path between two
  // places, not a one-way door. Reading it as directed made T6, T7, T8, F6, F7
  // and F8 look unreachable — each declares an exit and nothing declares one
  // back — which stranded SC-T6-01 and both festival-night arc turns.
  const exits = new Map<string, Set<string>>();
  const link = (from: string, to: string) => {
    if (!byId.has(from) || !byId.has(to)) return;
    if (!exits.has(from)) exits.set(from, new Set());
    exits.get(from)!.add(to);
  };
  for (const screen of graph.screens) {
    exits.set(screen.screen_id, exits.get(screen.screen_id) ?? new Set());
    for (const c of screen.connects_to ?? []) {
      const id = typeof c === "string" ? c : c.screen_id;
      link(screen.screen_id, id);
      link(id, screen.screen_id);
    }
  }
  const movesPerBlock = graph.day_loop?.moves_per_day ?? 3;
  const maxScreens = Math.max(1, movesPerBlock * DAY_BLOCKS.length - 1);
  const routes: Route[] = [];

  const walk = (screens: string[]): void => {
    const here = screens[screens.length - 1];
    // STRICT bound: maxScreens is the number of screens a day can truly STAND
    // ON (3N-1 arrivals — see blockAt). Allowing one more screen fabricated a
    // phantom 9th visit: evening's Nth (budget-exhausting) move sends the
    // player home instead of arriving (emitMoveTo in ink.ts), so a route whose
    // last screen sat at that index promised a visit the real walk never makes.
    // That is exactly how SC-T6-01 went "never entered" — the planner kept
    // scheduling T6 as the day's phantom final screen.
    const next = screens.length < maxScreens ? [...(exits.get(here) ?? [])].sort() : [];
    if (next.length === 0) {
      routes.push({
        screens: [...screens],
        visits: screens.map((screen, i) => ({ screen, block: blockAt(i, movesPerBlock) })),
      });
      return;
    }
    for (const target of next) walk([...screens, target]);
  };

  for (const screen of graph.screens) {
    if (screen.status.startsWith("start")) walk([screen.screen_id]);
  }
  return routes;
}

export interface SceneOpportunity {
  scene_id: string;
  day: number;
  screen: string;
  block: TimeBlock;
  /**
   * false when the soul is standing there but the scene cannot actually be
   * played that day: its entry gate is false (the hub offers no "Talk to" at
   * all), or every choice node is shut by a day gate. Entering then plays
   * nothing AND spends the once-only hub entry, so it is worse than not going:
   * the planner treats a dead opportunity as no opportunity, and the strategy
   * refuses to take it.
   */
  live: boolean;
}

/**
 * Evaluate the `day <op> N` predicates on a condition list. This is the
 * predicate VOCABULARY from predicates.ts, not prose — the same grammar the
 * emitter compiles into `{day >= 5}`. Non-day conditions are ignored here;
 * they are runtime state the planner cannot know, and the search's inert-entry
 * backstop covers them instead.
 */
export function dayGateAllows(conditions: string[] | undefined, day: number): boolean {
  for (const cond of conditions ?? []) {
    const m = cond.trim().match(/^day\s*(>=|<=|==|=|>|<)\s*(\d+)$/);
    if (!m) continue;
    const n = Number(m[2]);
    const ok =
      m[1] === ">=" ? day >= n
      : m[1] === "<=" ? day <= n
      : m[1] === ">" ? day > n
      : m[1] === "<" ? day < n
      : day === n;
    if (!ok) return false;
  }
  return true;
}

/** How many of a scene's choice nodes survive the day gates on `day`. */
function openNodeCount(scene: Graph["scenes"][number], day: number): number {
  return scene.choice_nodes.filter((n) => dayGateAllows(n.availability_conditions, day)).length;
}

// ---------------------------------------------------------------------------
// Entry gates
// ---------------------------------------------------------------------------
// `Scene.entry_gate` guards the hub's "Talk to ..." choice itself, so a scene
// whose gate is false is not merely quiet — it is not offered at all. The
// planner has to know that: it plans which scene to enter on which day, and an
// entry it plans for a day the gate shuts is an entry the walk never takes,
// which then reads as unreachable content rather than as a mis-planned week.
//
// Only the forms an entry gate actually uses are modelled: `day <op> N`,
// played(scene) and knows(phrase). Anything else stays opaque and falls to the
// inert-entry backstop, same as an unreadable node gate.

/**
 * A scene's own entry day, matching ink.sceneEntryDay: the MAX `day >= N` floor
 * across its nodes, not the min. The hub guards the entry on the day every one
 * of a scene's beats is open, because the entry is once-only and a partial
 * entry strands the rest. So when this scene is somebody else's played()
 * prerequisite, THIS is the day the prerequisite actually lands, and nothing
 * waiting on it can open earlier.
 */
function sceneEntryDay(scene: Graph["scenes"][number]): number {
  if (scene.choice_nodes.length === 0) return 1;
  return Math.max(
    ...scene.choice_nodes.map((node) => {
      let floor = 1;
      for (const cond of node.availability_conditions ?? []) {
        const m = /^day\s*(>=|==|=|>)\s*(\d+)$/.exec(cond.trim());
        if (!m) continue;
        floor = Math.max(floor, m[1] === ">" ? Number(m[2]) + 1 : Number(m[2]));
      }
      return floor;
    }),
  );
}

interface EntryGateTerms {
  /** earliest day the gate's own `day >= N` terms allow. */
  dayFloor: number;
  /** scene_ids from played(...) — conversations that must come first. */
  played: string[];
  /** phrases from knows(...) — set by a state action or an examinable. */
  knows: string[];
  /** terms the planner cannot evaluate (an item, a band); backstop covers them. */
  opaque: string[];
}

function entryGateTerms(scene: Graph["scenes"][number]): EntryGateTerms {
  const terms: EntryGateTerms = { dayFloor: 1, played: [], knows: [], opaque: [] };
  for (const cond of scene.entry_gate ?? []) {
    const c = cond.trim();
    let m: RegExpExecArray | null;
    if ((m = /^day\s*(>=|==|=|>)\s*(\d+)$/.exec(c))) {
      terms.dayFloor = Math.max(terms.dayFloor, m[1] === ">" ? Number(m[2]) + 1 : Number(m[2]));
      continue;
    }
    // A ceiling is not a floor; dayGateAllows still enforces it per day.
    if (/^day\s*(<=|<)\s*\d+$/.test(c)) continue;
    if ((m = /^played\(([^)]+)\)$/.exec(c))) {
      terms.played.push(m[1].trim());
      continue;
    }
    if ((m = /^knows\(([^)]+)\)$/.exec(c))) {
      terms.knows.push(m[1].trim());
      continue;
    }
    terms.opaque.push(c);
  }
  return terms;
}

interface EntryGateFacts {
  /** scene_id -> earliest day its entry_gate can possibly be true. */
  gateFloor: Map<string, number>;
  /** scene_id -> why the gate can NEVER be true, for the scenes where it cannot. */
  blocked: Map<string, string>;
}

const entryGateCache = new WeakMap<Graph, EntryGateFacts>();

/**
 * Resolve every scene's entry gate to a day floor, or to a reason it can never
 * open. Cached per graph: the answer is a property of the content, and the
 * planner asks for it once per (scene, day) pair.
 */
function entryGateFacts(graph: Graph): EntryGateFacts {
  const hit = entryGateCache.get(graph);
  if (hit) return hit;

  const byId = new Map(graph.scenes.map((s) => [s.scene_id, s]));
  const gateFloor = new Map<string, number>();
  const blocked = new Map<string, string>();

  // Who can set a knows() phrase. A choice option's knowledge_flag action makes
  // the setting scene a prerequisite; an examinable is world furniture the
  // player can poke on any day, so it satisfies the phrase without ordering.
  const bySceneAction = new Map<string, string[]>();
  const byExaminable = new Set<string>();
  for (const screen of graph.screens) {
    for (const ex of screen.examinables ?? []) {
      if (ex.knowledge_flag) byExaminable.add(inkAddress(ex.knowledge_flag));
    }
  }
  for (const scene of graph.scenes) {
    for (const node of scene.choice_nodes) {
      for (const opt of node.options) {
        for (const act of opt.state_actions ?? []) {
          if (act.type !== "knowledge_flag") continue;
          const key = inkAddress(act.arg);
          bySceneAction.set(key, [...(bySceneAction.get(key) ?? []), scene.scene_id]);
        }
      }
    }
  }

  const visiting = new Set<string>();

  /** The day a scene can actually be ENTERED: its own beats AND its gate. */
  const openFloor = (sceneId: string): number => {
    const scene = byId.get(sceneId)!;
    return Math.max(sceneEntryDay(scene), resolveGate(sceneId));
  };

  function resolveGate(sceneId: string): number {
    const memo = gateFloor.get(sceneId);
    if (memo !== undefined) return memo;
    const scene = byId.get(sceneId);
    if (scene === undefined) return 1;
    if (visiting.has(sceneId)) {
      // A ring of gates waiting on each other: nothing in it can go first, so
      // nothing in it opens. conditions.ts reports the ring as a finding; here
      // it only has to stop the recursion and mark the scene shut.
      const ring = [...visiting, sceneId].join(" -> ");
      blocked.set(sceneId, `its played() prerequisites form a cycle (${ring})`);
      gateFloor.set(sceneId, Infinity);
      return Infinity;
    }
    visiting.add(sceneId);
    const terms = entryGateTerms(scene);
    let floor = terms.dayFloor;
    const why: string[] = [];

    for (const prereq of terms.played) {
      if (!byId.has(prereq)) {
        why.push(`played(${prereq}) names no scene in this graph`);
        continue;
      }
      floor = Math.max(floor, openFloor(prereq));
      const prereqShut = blocked.get(prereq);
      if (prereqShut !== undefined) {
        why.push(`played(${prereq}) can never be true, because ${prereq} cannot open: ${prereqShut}`);
      }
    }

    for (const phrase of terms.knows) {
      const key = inkAddress(phrase);
      if (byExaminable.has(key)) continue;
      const from = bySceneAction.get(key) ?? [];
      if (from.length === 0) {
        why.push(`knows(${phrase}) is set by no choice option and no examinable`);
        continue;
      }
      const others = [...new Set(from)].filter((id) => id !== sceneId);
      if (others.length === 0) {
        why.push(`knows(${phrase}) is only ever set inside ${sceneId} itself, which this gate shuts`);
        continue;
      }
      // ANY setter is enough, so the floor is the EARLIEST of them, and the
      // gate is only shut when every setter is shut.
      const live = others.filter((id) => !blocked.has(id)).map((id) => openFloor(id));
      if (live.length === 0) {
        why.push(`knows(${phrase}) is only set inside ${others.join(", ")}, none of which can open`);
        continue;
      }
      floor = Math.max(floor, Math.min(...live));
    }

    visiting.delete(sceneId);
    if (why.length > 0) {
      blocked.set(sceneId, why.join("; "));
      floor = Infinity;
    }
    gateFloor.set(sceneId, floor);
    return floor;
  }

  for (const scene of graph.scenes) resolveGate(scene.scene_id);
  const facts: EntryGateFacts = { gateFloor, blocked };
  entryGateCache.set(graph, facts);
  return facts;
}

/** Can this scene's entry gate be satisfied on `day`, at the earliest? */
function entryGateAllows(graph: Graph, scene: Graph["scenes"][number], day: number): boolean {
  const facts = entryGateFacts(graph);
  if (facts.blocked.has(scene.scene_id)) return false;
  return day >= (facts.gateFloor.get(scene.scene_id) ?? 1) && dayGateAllows(scene.entry_gate, day);
}

/**
 * Close a wanted set under played() prerequisites.
 *
 * Every planned week is a FRESH Story, so read counts do not carry over: a
 * gated scene needs its prerequisite played again in the same week, even when
 * an earlier week already explored that prerequisite to exhaustion. Without
 * this the plan quietly stops routing the prerequisite and the gated scene can
 * never be entered again.
 */
function withEntryPrereqs(graph: Graph, want: ReadonlySet<string>): Set<string> {
  const byId = new Map(graph.scenes.map((s) => [s.scene_id, s]));
  const out = new Set(want);
  const queue = [...want];
  while (queue.length > 0) {
    const scene = byId.get(queue.pop()!);
    if (scene === undefined) continue;
    for (const prereq of entryGateTerms(scene).played) {
      if (!byId.has(prereq) || out.has(prereq)) continue;
      out.add(prereq);
      queue.push(prereq);
    }
  }
  return out;
}

/**
 * A scene is LIVE on a day when its entry gate can be satisfied AND at least
 * one of its nodes survives the day gates. Both halves are needed: a shut gate
 * means the hub never offers the entry, a shut node gate means the entry plays
 * nothing.
 */
function sceneLiveOn(graph: Graph, scene: Graph["scenes"][number], day: number): boolean {
  if (!entryGateAllows(graph, scene, day)) return false;
  if (scene.choice_nodes.length === 0) return true;
  return openNodeCount(scene, day) > 0;
}

/**
 * The days on which a scene opens the MOST of itself.
 *
 * "Live" is not enough. SC-T6-01 is live from day 1 — most of its nodes are
 * ungated — but its first beat needs `day >= 4`, and the knowledge flag that
 * beat sets is what unlocks a later one. Entering on day 2 therefore plays the
 * scene, spends the once-only entry, and permanently strands two of its nodes.
 * So the planner is told which day plays the most of a scene, not merely which
 * days play any of it.
 */
function bestDaysFor(scene: Graph["scenes"][number], days: DayJson[]): Set<number> {
  let best = 0;
  for (const day of days) best = Math.max(best, openNodeCount(scene, day.day));
  const out = new Set<number>();
  for (const day of days) {
    if (openNodeCount(scene, day.day) === best) out.add(day.day);
  }
  return out;
}

interface WorldFacts {
  routes: Route[];
  /** "<screen>|<block>" the player can actually occupy. */
  visitable: Set<string>;
  /** screens any route touches at all. */
  visitableScreens: Set<string>;
  /** day -> block -> soul -> screen */
  presence: Map<number, Map<string, Map<string, string>>>;
  opportunities: SceneOpportunity[];
}

function worldFacts(graph: Graph, days: DayJson[]): WorldFacts {
  const routes = enumerateRoutes(graph);
  const visitable = new Set<string>();
  const visitableScreens = new Set<string>();
  for (const route of routes) {
    for (const v of route.visits) {
      visitable.add(`${v.screen}|${v.block}`);
      visitableScreens.add(v.screen);
    }
  }
  // The final sequence (festival-night-transition-plan.md): night is never
  // entered by movement — home_hub_final diverts straight to
  // FESTIVAL_SCREEN_ID, unconditionally, once evening's route (whatever it
  // was) is spent on the life's last day. So it is visitable independent of
  // routes, day.ts's `input.day >= 5` gate is what actually confines any
  // night presence to that one day (day.ts:55), not this set.
  visitable.add(`${FESTIVAL_SCREEN_ID}|night`);
  visitableScreens.add(FESTIVAL_SCREEN_ID);

  const presence = new Map<number, Map<string, Map<string, string>>>();
  for (const day of days) {
    const byBlock = new Map<string, Map<string, string>>();
    for (const fill of day.slot_fill) {
      let m = byBlock.get(fill.time_block);
      if (!m) {
        m = new Map();
        byBlock.set(fill.time_block, m);
      }
      if (!m.has(fill.soul)) m.set(fill.soul, fill.screen_id);
    }
    presence.set(day.day, byBlock);
  }

  const opportunities: SceneOpportunity[] = [];
  for (const day of days) {
    const byBlock = presence.get(day.day)!;
    for (const block of TIME_BLOCKS) {
      if (byBlock.get(block) === undefined) continue;
      for (const scene of graph.scenes) {
        if (byBlock.get(block)!.get(scene.soul) !== scene.screen_id) continue;
        if (!visitable.has(`${scene.screen_id}|${block}`)) continue;
        opportunities.push({
          scene_id: scene.scene_id,
          day: day.day,
          screen: scene.screen_id,
          block,
          live: sceneLiveOn(graph, scene, day.day),
        });
      }
    }
  }
  return { routes, visitable, visitableScreens, presence, opportunities };
}

/** Why a scene has no entry opportunity anywhere in this week. */
function diagnoseScene(graph: Graph, days: DayJson[], facts: WorldFacts, sceneId: string): string {
  const scene = graph.scenes.find((s) => s.scene_id === sceneId)!;
  const moves = graph.day_loop?.moves_per_day ?? 3;

  const status = graph.screens.find((s) => s.screen_id === scene.screen_id)?.status ?? "?";
  if (!facts.visitableScreens.has(scene.screen_id)) {
    const neighbours = new Set<string>();
    for (const s of graph.screens) {
      for (const c of s.connects_to ?? []) {
        const to = typeof c === "string" ? c : c.screen_id;
        if (to === scene.screen_id) neighbours.add(s.screen_id);
        if (s.screen_id === scene.screen_id) neighbours.add(to);
      }
    }
    return (
      `screen ${scene.screen_id} is unreachable: its status is "${status}" (not a start screen)` +
      ` and it links to no reachable screen (neighbours: ${neighbours.size ? [...neighbours].sort().join(", ") : "none"})`
    );
  }

  const blocksHere = TIME_BLOCKS.filter((b) => facts.visitable.has(`${scene.screen_id}|${b}`));
  const soulAt: string[] = [];
  for (const day of days) {
    for (const fill of day.slot_fill) {
      if (fill.soul === scene.soul) soulAt.push(`d${day.day} ${fill.time_block} ${fill.screen_id}`);
    }
  }
  const onScreen = soulAt.filter((s) => s.endsWith(` ${scene.screen_id}`));
  if (onScreen.length === 0) {
    return (
      `soul "${scene.soul}" is never placed on ${scene.screen_id} by this week's slot_fill` +
      ` (placed instead at: ${soulAt.join("; ") || "nowhere"})`
    );
  }

  // An entry gate nothing can ever satisfy has to name the prerequisite that
  // is stuck. "never offered" would send the reader hunting for a day gate that
  // is not there — the scene is fine, the conversation it waits on is not.
  const gates = entryGateFacts(graph);
  const shut = gates.blocked.get(sceneId);
  if (shut !== undefined) {
    return `entry gate ${JSON.stringify(scene.entry_gate)} can never be satisfied: ${shut}`;
  }
  const gateFloor = gates.gateFloor.get(sceneId) ?? 1;

  // The soul IS reachable there — so if there is still no opportunity, every
  // day it could happen on is one where the scene's own day gates shut it.
  const dead = facts.opportunities.filter((o) => o.scene_id === sceneId);
  if (dead.length > 0) {
    // Gate first: entryGateAllows is half of `live`, and blaming the node day
    // gates for a shut gate points at the wrong line of the spec.
    if ((scene.entry_gate ?? []).length > 0 && dead.every((o) => !entryGateAllows(graph, scene, o.day))) {
      const prereqs = entryGateTerms(scene)
        .played.map((id) => {
          const p = graph.scenes.find((s) => s.scene_id === id);
          return p ? `${id} (its own entry day is ${sceneEntryDay(p)})` : `${id} (no such scene)`;
        })
        .join(", ");
      return (
        `soul "${scene.soul}" reaches ${scene.screen_id} on ${dead.map((o) => `d${o.day}/${o.block}`).join(", ")},` +
        ` but the entry gate ${JSON.stringify(scene.entry_gate)} is false on every one of those days` +
        ` (earliest day it can be true: d${gateFloor}` +
        (prereqs ? `; waits on ${prereqs}` : "") +
        `)`
      );
    }
    const gates = [
      ...new Set(
        scene.choice_nodes.flatMap((n) =>
          (n.availability_conditions ?? []).filter((c) => /^day\s*(>=|<=|==|=|>|<)\s*\d+$/.test(c.trim())),
        ),
      ),
    ];
    return (
      `soul "${scene.soul}" reaches ${scene.screen_id} on ${dead.map((o) => `d${o.day}/${o.block}`).join(", ")},` +
      ` but every choice node is shut by a day gate on those days (gates: ${gates.join(", ") || "none found"})`
    );
  }
  return (
    `soul "${scene.soul}" stands on ${scene.screen_id} only at ${onScreen.join("; ")},` +
    ` but the player can only occupy ${scene.screen_id} at [${blocksHere.join(", ")}]` +
    ` within ${moves} moves/day (screen status "${status}")`
  );
}

// ---------------------------------------------------------------------------
// Week plans and the strategy that plays them
// ---------------------------------------------------------------------------

export interface WeekPlan {
  /** day -> screens[] (screens[0] is "Begin at ..."). */
  routes: Record<number, string[]>;
  /** scene_id -> in-scene choice indices, in order. */
  sceneOptions: Record<string, number[]>;
  movesPerDay: number;
  /** screen_id -> the label ink.ts emits for it. */
  screenNames: Record<string, string>;
  /** "<screen_id>|<Talk to ...>" -> scene_id, mirroring emitScreen's labelling. */
  talkLabels: Record<string, string>;
  /**
   * "<scene_id>|<day>" the strategy must NOT enter. A scene entry is once-only
   * for the life of the Story, so walking into one on a day its content cannot
   * play burns it for the whole week. Holds day-gated dead days plus anything
   * a previous week proved inert.
   */
  doNotEnter: string[];
}

/**
 * scene_id for every "Talk to ..." label the world can offer, keyed by screen.
 * Mirrors emitScreen: the soul's authored NAME, suffixed with the scene_id only
 * when that soul has more than one scene on that screen. That suffix rule is
 * what makes the un-suffixed form unique per (screen, soul), so the mapping is
 * exact rather than a guess.
 */
function talkLabelIndex(graph: Graph): Record<string, string> {
  const out: Record<string, string> = {};
  for (const screen of graph.screens) {
    const here = graph.scenes.filter((s) => s.screen_id === screen.screen_id);
    for (const scene of here) {
      const ambiguous = here.filter((s) => s.soul === scene.soul).length > 1;
      const name = cleanText(graph.souls.find((s) => s.soul_id === scene.soul)?.name ?? scene.soul);
      const label = PREFIX_TALK + name + (ambiguous ? ` (${scene.scene_id})` : "");
      out[`${screen.screen_id}|${label}`] = scene.scene_id;
    }
  }
  return out;
}

interface DayCandidate {
  day: number;
  route: string[];
  /** scene_ids this route can enter that day, already filtered to live ones. */
  scenes: string[];
}

/** "<scene_id>|<day>" entries a previous week proved wasted, in two strengths. */
export interface PlanBlocks {
  /** the entry played nothing at all — never plan it. */
  dead: ReadonlySet<string>;
  /** the entry played only part of the scene — prefer another day if one exists. */
  partial: ReadonlySet<string>;
}

const NO_BLOCKS: PlanBlocks = { dead: new Set(), partial: new Set() };

/**
 * Per day, the distinct MAXIMAL sets of wanted scenes a single route can open.
 *
 * Collapsing 116 routes to their scene sets, then dropping any set that is a
 * subset of another, leaves a handful of genuinely different days. That is
 * what makes an exact week assignment affordable: the choice is not "which of
 * 116 routes" but "which of ~5 outcomes".
 */
function dayCandidates(
  graph: Graph,
  facts: WorldFacts,
  want: ReadonlySet<string>,
  days: DayJson[],
  blocked: PlanBlocks,
): DayCandidate[][] {
  // Per scene, the days worth entering it on.
  //
  //   dead    an entry there played NOTHING. Hard exclusion: it can only ever
  //           destroy the once-only entry.
  //   partial an entry there played only part of the scene. Soft: try another
  //           day first, but if the scene has no other day, go anyway — a
  //           partly-played scene beats a scene nobody ever sees. Making this
  //           a hard exclusion is what silently dropped the festival scenes
  //           from the bond plans: their band variants are MUTUALLY exclusive,
  //           so they can never be "complete", so their only day got banned.
  const preferred = new Map<string, Set<number>>();
  for (const scene of graph.scenes) {
    const live = days.map((d) => d.day).filter((d) => sceneLiveOn(graph, scene, d));
    const usable = live.filter((d) => !blocked.dead.has(`${scene.scene_id}|${d}`));
    const fresh = usable.filter((d) => !blocked.partial.has(`${scene.scene_id}|${d}`));
    const pool = fresh.length > 0 ? fresh : usable;
    const best = [...bestDaysFor(scene, days)].filter((d) => pool.includes(d));
    preferred.set(scene.scene_id, new Set(best.length > 0 ? best : pool));
  }

  const out: DayCandidate[][] = [];
  for (const day of days) {
    const byBlock = facts.presence.get(day.day)!;
    const scenesAt = new Map<string, string[]>();
    for (const scene of graph.scenes) {
      if (!want.has(scene.scene_id)) continue;
      if (!preferred.get(scene.scene_id)!.has(day.day)) continue;
      for (const block of TIME_BLOCKS) {
        if (byBlock.get(block)?.get(scene.soul) !== scene.screen_id) continue;
        const key = `${scene.screen_id}|${block}`;
        scenesAt.set(key, [...(scenesAt.get(key) ?? []), scene.scene_id]);
      }
    }
    // The final sequence (RULED 2026-08-01): on the life's last day, night
    // always follows evening once its route is spent, regardless of WHICH
    // route got there — home_hub_final diverts straight to FESTIVAL_SCREEN_ID,
    // so a night scene is never one of a route's own visits (see worldFacts).
    // Every route this day therefore gains it identically.
    const nightBonus = scenesAt.get(`${FESTIVAL_SCREEN_ID}|night`) ?? [];

    // One candidate per distinct scene set, keeping the smallest route for it.
    const byKey = new Map<string, DayCandidate>();
    for (const route of facts.routes) {
      const gain = new Set<string>();
      for (const v of route.visits) {
        for (const id of scenesAt.get(`${v.screen}|${v.block}`) ?? []) gain.add(id);
      }
      for (const id of nightBonus) gain.add(id);
      const scenes = [...gain].sort();
      const key = scenes.join(",");
      const prior = byKey.get(key);
      if (prior === undefined || route.screens.join(">") < prior.route.join(">")) {
        byKey.set(key, { day: day.day, route: [...route.screens], scenes });
      }
    }
    // Drop dominated sets. Every value function here is monotone in the set
    // (bond gains and scene counts are both non-negative), so a superset day
    // is never worse than the subset day it contains.
    const all = [...byKey.values()];
    const kept = all.filter(
      (c) =>
        !all.some(
          (other) =>
            other !== c &&
            other.scenes.length > c.scenes.length &&
            c.scenes.every((id) => other.scenes.includes(id)),
        ),
    );
    kept.sort((a, b) => a.route.join(">").localeCompare(b.route.join(">")));
    out.push(kept.length > 0 ? kept : all);
  }
  return out;
}

interface WeekAssignment {
  routes: Record<number, string[]>;
  scenes: string[];
  capped: boolean;
}

/**
 * The EXACT best week over those candidates, maximising `value(union)`.
 *
 * This replaced a day-by-day greedy that scored only "how many new scenes does
 * today open". Greedy is myopic in a way that matters here: two scenes may be
 * available on the same single day, so taking the easy one early can strand
 * the other for the whole week. Memoised DFS over (day index, covered set) is
 * small — the candidate sets per day are few — and it is exact.
 *
 * Bounded: `cap` limits memo states, and `capped` says whether the answer is
 * the true optimum or the best found before the cap.
 */
function chooseBestWeek(
  candidates: DayCandidate[][],
  value: (scenes: ReadonlySet<string>) => number,
  cap: number,
): WeekAssignment {
  let states = 0;
  let capped = false;
  const memo = new Map<string, { value: number; routeKey: string; picks: DayCandidate[] }>();

  const solve = (i: number, covered: Set<string>): { value: number; routeKey: string; picks: DayCandidate[] } => {
    if (i === candidates.length) return { value: value(covered), routeKey: "", picks: [] };
    const key = `${i}|${[...covered].sort().join(",")}`;
    const hit = memo.get(key);
    if (hit) return hit;
    if (states >= cap) {
      capped = true;
      return { value: value(covered), routeKey: "", picks: [] };
    }
    states += 1;

    let best: { value: number; routeKey: string; picks: DayCandidate[] } | null = null;
    for (const candidate of candidates[i]) {
      const next = new Set(covered);
      for (const id of candidate.scenes) next.add(id);
      const sub = solve(i + 1, next);
      const routeKey = `${candidate.route.join(">")}|${sub.routeKey}`;
      // Ties break on the lexicographically smallest route string, so the
      // whole plan is deterministic.
      if (best === null || sub.value > best.value || (sub.value === best.value && routeKey < best.routeKey)) {
        best = { value: sub.value, routeKey, picks: [candidate, ...sub.picks] };
      }
    }
    const answer = best ?? { value: value(covered), routeKey: "", picks: [] };
    memo.set(key, answer);
    return answer;
  };

  const solved = solve(0, new Set());
  const routes: Record<number, string[]> = {};
  const scenes = new Set<string>();
  for (const pick of solved.picks) {
    routes[pick.day] = pick.route;
    for (const id of pick.scenes) scenes.add(id);
  }
  return { routes, scenes: [...scenes].sort(), capped };
}

/**
 * Day-by-day scheduling that opens as many still-wanted LIVE scenes as it can.
 *
 * Counting only live opportunities is the fix for the festival-night bug: a
 * `day >= 5` scene sitting on a screen the day-1 route happens to pass through
 * used to score as coverage, get entered, play nothing (every node's gate
 * false, every fallback fires), and spend its once-only entry — after which no
 * later week could ever reach it, and the search spent its whole budget
 * re-planning the same dead week.
 *
 * Counting only live opportunities is the fix for the festival-night bug: a
 * `day >= 5` scene sitting on a screen the day-1 route happens to pass through
 * used to score as coverage, get entered, play nothing (every node's gate
 * false, every fallback fires), and spend its once-only entry — after which no
 * later week could ever reach it, and the search span its whole budget
 * re-planning the same dead week.
 */
function buildPlan(
  graph: Graph,
  facts: WorldFacts,
  want: Set<string>,
  days: DayJson[],
  blocked: PlanBlocks = NO_BLOCKS,
  /** score a week by the scenes it opens; default is "as many as possible". */
  value: (scenes: ReadonlySet<string>) => number = (scenes) => scenes.size,
  cap = 200_000,
): WeekPlan & { capped: boolean } {
  const screenNames: Record<string, string> = {};
  for (const s of graph.screens) screenNames[s.screen_id] = cleanText(s.name);

  const candidates = dayCandidates(graph, facts, withEntryPrereqs(graph, want), days, blocked);

  const assignment = chooseBestWeek(candidates, value, cap);

  // What the strategy must refuse. A scene entry is once-only for the whole
  // week, so a wrong day does not just waste a turn — it destroys the scene.
  //   - any day the scene plays nothing (day-gated shut, or proven inert)
  //   - any day other than the one the plan scheduled it on
  // A scene the plan did not schedule anywhere is left alone: if a route
  // happens past it on a day it can play, taking it is free.
  const scheduledDay = new Map<string, number>();
  for (const [dayStr, route] of Object.entries(assignment.routes)) {
    const day = Number(dayStr);
    const index = days.findIndex((d) => d.day === day);
    const chosen = candidates[index]?.find((c) => c.route.join(">") === route.join(">"));
    for (const id of chosen?.scenes ?? []) scheduledDay.set(id, day);
  }
  const doNotEnter = new Set<string>();
  for (const day of days) {
    for (const scene of graph.scenes) {
      const key = `${scene.scene_id}|${day.day}`;
      const wrongDay = scheduledDay.has(scene.scene_id) && scheduledDay.get(scene.scene_id) !== day.day;
      if (!sceneLiveOn(graph, scene, day.day) || blocked.dead.has(key) || wrongDay) doNotEnter.add(key);
    }
  }
  // Entry-gate ORDER inside the week. A gated scene walked into before its
  // played() prerequisite is simply not offered, so the entry buys nothing and
  // the plan has spent a day for it. Only constrain against prerequisites this
  // plan actually scheduled: an unscheduled one may still be picked up free by
  // a route that happens past it, and banning every day would cost coverage.
  for (const scene of graph.scenes) {
    const prereqs = entryGateTerms(scene).played.filter((id) => scheduledDay.has(id));
    if (prereqs.length === 0) continue;
    const earliest = Math.max(...prereqs.map((id) => scheduledDay.get(id)!));
    for (const day of days) {
      if (day.day < earliest) doNotEnter.add(`${scene.scene_id}|${day.day}`);
    }
  }
  return {
    routes: assignment.routes,
    sceneOptions: {},
    movesPerDay: graph.day_loop?.moves_per_day ?? 3,
    screenNames,
    talkLabels: talkLabelIndex(graph),
    doNotEnter: [...doNotEnter].sort(),
    capped: assignment.capped,
  };
}

/**
 * Play a WeekPlan: begin where the plan says, take every "Talk to" the hub
 * offers, spend the remaining moves along the route, end the day. Inside a
 * scene, follow the plan's recorded option indices (falling back to 0).
 *
 * Pure: every decision comes off the WalkContext, so two calls with the same
 * plan produce identical walks.
 */
export function plannedStrategy(plan: WeekPlan): Strategy {
  const indexOfText = (ctx: WalkContext, text: string): number =>
    ctx.choices.findIndex((c) => c.text === text);
  const doNotEnter = new Set(plan.doNotEnter);

  // moves_per_day is a PER-BLOCK budget (RULED 2026-08-01) — ctx.movesLeft
  // resets every block, so it cannot tell us how far along TODAY's route we
  // are once the day has crossed a block boundary. Track absolute progress
  // through `route` ourselves instead: it only advances on a step this
  // strategy itself recognizes as a world move (the screen_hub pick or a "Go
  // to" pick), so it stays in lock-step with the walker even though the
  // walker calls this closure sequentially rather than the caller threading
  // state through WalkContext.
  let trackedDay = -1;
  let movesToday = 0;

  return (ctx: WalkContext): number => {
    if (!ctx.inWorld) {
      const seq = plan.sceneOptions[ctx.scene ?? ""] ?? [];
      const pick = seq[ctx.sceneStep];
      return pick !== undefined && pick < ctx.choices.length ? pick : 0;
    }
    if (ctx.day !== trackedDay) {
      trackedDay = ctx.day;
      movesToday = 0;
    }
    const route = plan.routes[ctx.day] ?? [];
    const endDay = indexOfText(ctx, LABEL_END_DAY);

    if (ctx.screen === null) {
      // screen_hub — pick where the day begins. Spends move 1 of morning's
      // budget (RULED 2026-08-01), same as any other move.
      const first = route[0];
      const i = first === undefined ? -1 : indexOfText(ctx, PREFIX_BEGIN + plan.screenNames[first]);
      if (i >= 0) {
        movesToday = 1;
        return i;
      }
      return Math.max(endDay, 0);
    }
    // A scene entry is once-only and costs no move, so take it — UNLESS the
    // plan has ruled this scene off limits today. Spending the entry on a day
    // the content cannot play destroys it for the rest of the week.
    const talk = ctx.choices.findIndex((c) => {
      if (!c.text.startsWith(PREFIX_TALK)) return false;
      const sceneId = plan.talkLabels[`${ctx.screen}|${c.text}`];
      // An unresolvable label is taken rather than skipped: coverage is the
      // safer failure, and the label index is built from the same rule the
      // emitter uses, so a miss means the emitter changed and should show up.
      return sceneId === undefined || !doNotEnter.has(`${sceneId}|${ctx.day}`);
    });
    if (talk >= 0) return talk;

    const next = route[movesToday];
    if (next !== undefined) {
      const i = indexOfText(ctx, PREFIX_GO + plan.screenNames[next]);
      if (i >= 0) {
        movesToday += 1;
        return i;
      }
    }
    // The final sequence (RULED 2026-08-01): once every wanted night scene on
    // the Festival Grounds is spent, start the vignette rather than falling
    // through to `Math.max(endDay, 0)` — "End the day" is offered there too
    // (ink.ts's emitScreen makes no other change at night), and its index is
    // always the largest in the list, so the untouched fallback would pick it
    // over the vignette every time and loop the walk back through
    // home_hub_final forever instead of ever finishing the life.
    const vignette = indexOfText(ctx, LABEL_BEGIN_VIGNETTE);
    if (vignette >= 0) return vignette;
    return Math.max(endDay, 0);
  };
}

/** The trivial control walk: always take the first offered choice. */
export const firstChoiceStrategy: Strategy = () => 0;

/**
 * A week that only ever ends its days. Proves the loop terminates with no
 * content at all — the floor under "a 5-day week is traversable".
 *
 * On the life's last night, the Festival Grounds offers no "End the day"
 * that actually ends anything permanent — RULED 2026-08-01, night is the
 * only exit on day 5 — so this also recognizes the vignette's own reserved
 * label; without it, a trivial strategy that always prefers "End the day"
 * would ricochet between home_hub_final and the Festival Grounds forever,
 * because "End the day" there only loops back home instead of finishing the
 * life. Since the vignette choice is offered BEFORE "End the day" in the
 * hub's choice list (ink.ts's emitScreen), findIndex naturally prefers it.
 */
export const endEachDayStrategy: Strategy = (ctx) => {
  const i = ctx.choices.findIndex((c) => c.text === LABEL_END_DAY || c.text === LABEL_BEGIN_VIGNETTE);
  return i >= 0 ? i : 0;
};

// ---------------------------------------------------------------------------
// (b) searchReachable
// ---------------------------------------------------------------------------

export interface SearchOptions {
  /** exhaustive in-scene DFS leaf cap, per scene visit. */
  maxScenePaths?: number;
  /** in-scene choice-point depth cap (self-diverts can loop). */
  maxSceneDepth?: number;
  /** how many planned weeks to walk before giving up on the leftovers. */
  maxWeeks?: number;
  /** per-walk choice cap. */
  maxSteps?: number;
  /** wall-clock budget for the whole search. */
  maxMillis?: number;
}

/**
 * Why something was never reached — and crucially, whether that is a finding
 * or a defect.
 *
 *   scene-unreachable        the scene itself cannot be entered this week
 *   scene-unexplored         the budget ran out before the scene was explored
 *   band-needs-another-life  gated on a bond band one life cannot reach; this
 *                            is the RULING working, not a bug
 *   defect                   reached, explored exhaustively, still never
 *                            offered — an unsatisfiable gate
 */
export type UnreachableKind =
  | "scene-unreachable"
  | "scene-unexplored"
  | "band-needs-another-life"
  | "defect";

export interface UnreachableNote {
  id: string;
  kind: UnreachableKind;
  /** true when this is by design; false means somebody has to look at it. */
  expected: boolean;
  reason: string;
}

export interface MaxBond {
  /** the count a real, fully walked week actually reached. */
  achieved: number;
  /** 0 low / 1 mid / 2 high at `achieved`. */
  band: 0 | 1 | 2;
  /** sum of every reachable scene's best in-scene gain — see `exact`. */
  upperBound: number;
  /** true when achieved == upperBound: nothing was given up, so this is the max. */
  exact: boolean;
  /** the scenes the walked week actually earned this soul's bond in. */
  scenesUsed: string[];
  /**
   * Reachable scenes that carry bond for this soul but that the best week
   * could not also fit — this is why `exact` is false when it is false.
   */
  blockedBy: string[];
}

export interface SearchBounds {
  hit: boolean;
  reasons: string[];
  weeksWalked: number;
  scenePathsExplored: number;
  millis: number;
  /**
   * Scenes the world layer says are enterable but that no week managed to
   * explore. Non-empty means the reachability answer is INCOMPLETE.
   */
  unexploredScenes: string[];
}

export interface SearchResult {
  reachableScenes: string[];
  unreachableScenes: UnreachableNote[];
  reachableChoiceNodes: string[];
  unreachableChoiceNodes: UnreachableNote[];
  reachableOptions: string[];
  unreachableOptions: UnreachableNote[];
  /** soul_id -> max bond in a real week. */
  maxBond: Record<string, MaxBond>;
  /** every (scene, day, screen, block) the world layer allows. */
  opportunities: SceneOpportunity[];
  /** the week that produced maxBond.achieved, replayed through walkWeek. */
  verifiedWeek: WalkResult;
  /** the plan verifiedWeek played, so a caller can reproduce it. */
  verifiedPlan: WeekPlan;
  bounds: SearchBounds;
  errors: string[];
}

interface SceneExploration {
  bestSequence: number[];
  bestGain: Record<string, number>;
  paths: number;
  capped: boolean;
}

/**
 * Which branch a pass commits to once a scene has been explored exhaustively.
 *
 * "max" answers the max-bond question. "min" exists because bond_band(...)
 * gates are MUTUALLY EXCLUSIVE across weeks: a week that maximises Toby's bond
 * arrives at the festival with band mid, so the `= low` variant of that beat is
 * never offered and would be reported unreachable although a quieter week
 * reaches it easily. The min pass plays the same plan while earning as little
 * bond as possible, which opens the low variants. Only the max pass feeds
 * maxBond; the min pass only ever adds to the reachable sets.
 */
export type BondBias = "max" | "min";

/**
 * Exhaustive DFS of ONE scene visit's option tree, from the live state.
 * The walker must be sitting on the scene's first in-scene choice point.
 * Leaves the walker on the chosen branch, back in the world layer.
 */
function exploreScene(
  walker: Walker,
  seenChoices: Set<string>,
  seenOptions: Set<string>,
  maxPaths: number,
  maxDepth: number,
  bias: BondBias,
): SceneExploration {
  const base = walker.snapshot();
  const baseBond = { ...walker.bond };
  let paths = 0;
  let capped = false;
  let bestScore = bias === "max" ? -Infinity : Infinity;
  let bestSequence: number[] = [];
  const better = (score: number): boolean => (bias === "max" ? score > bestScore : score < bestScore);

  const gainOf = (): number => {
    let total = 0;
    for (const soul of Object.keys(walker.bond)) {
      total += walker.bond[soul] - (baseBond[soul] ?? 0);
    }
    return round6(total);
  };

  const harvest = (): void => {
    for (const id of walker.seenChoiceNodes) seenChoices.add(id);
    for (const id of walker.seenOptions) seenOptions.add(id);
  };

  const dfs = (prefix: number[], depth: number): void => {
    if (capped) return;
    if (depth >= maxDepth) {
      capped = true;
      return;
    }
    const here = walker.snapshot();
    const count = walker.choices.length;
    for (let i = 0; i < count; i++) {
      if (capped) break;
      if (i > 0) walker.restore(here);
      walker.choose(i);
      harvest();
      const sequence = [...prefix, i];
      if (walker.inWorld || walker.choices.length === 0) {
        paths += 1;
        const score = gainOf();
        // Strict comparison: ties keep the lexicographically earliest branch.
        if (better(score)) {
          bestScore = score;
          bestSequence = sequence;
        }
        if (paths >= maxPaths) {
          capped = true;
          break;
        }
      } else {
        dfs(sequence, depth + 1);
      }
    }
    walker.restore(here);
  };

  dfs([], 0);

  // Replay the winner for real.
  walker.restore(base);
  for (const index of bestSequence) {
    if (index >= walker.choices.length) break;
    walker.choose(index);
  }
  const bestGain: Record<string, number> = {};
  for (const soul of Object.keys(walker.bond)) {
    const delta = round6(walker.bond[soul] - (baseBond[soul] ?? 0));
    if (delta !== 0) bestGain[soul] = delta;
  }
  return { bestSequence, bestGain, paths, capped };
}

interface WeekRun {
  sceneOptions: Record<string, number[]>;
  sceneGain: Record<string, Record<string, number>>;
  /** scenes whose option tree was walked (they presented a choice point). */
  scenesExplored: string[];
  /** every scene the walk entered, taken from the #scene: tags. */
  scenesEntered: string[];
  /** scene_id -> the day it was entered on. */
  entryDays: Record<string, number>;
  /**
   * "<scene_id>|<day>" for entries that presented NO choice point at all —
   * the once-only entry was spent and nothing played. Fed back into the next
   * week's plan so the search stops repeating a wasted day. This is the
   * backstop for gates the day-predicate reader cannot see (knows(...), a
   * band, an item), where only running it can tell you the scene is inert.
   */
  inertEntries: string[];
  paths: number;
  capped: boolean;
  steps: number;
  errors: string[];
}

/**
 * Walk one planned week for real, pausing at every scene to explore it
 * exhaustively before committing to the biased branch.
 */
function exploreWeek(
  inputs: WalkInputs,
  plan: WeekPlan,
  seenChoices: Set<string>,
  seenOptions: Set<string>,
  opts: Required<SearchOptions>,
  deadline: number,
  bias: BondBias,
): WeekRun {
  const walker = new Walker(inputs);
  const strategy = plannedStrategy(plan);
  const sceneOptions: Record<string, number[]> = {};
  const sceneGain: Record<string, Record<string, number>> = {};
  const scenesExplored: string[] = [];
  let paths = 0;
  let capped = false;
  let steps = 0;

  walker.pump();
  while (walker.choices.length > 0) {
    if (steps >= opts.maxSteps || Date.now() > deadline) {
      capped = true;
      break;
    }
    const ctx = walker.context();
    if (!ctx.inWorld && ctx.scene !== null && ctx.sceneStep === 0) {
      // First choice point of this scene visit — explore the whole subtree.
      const found = exploreScene(
        walker, seenChoices, seenOptions, opts.maxScenePaths, opts.maxSceneDepth, bias,
      );
      paths += found.paths;
      capped = capped || found.capped;
      sceneOptions[ctx.scene] = found.bestSequence;
      sceneGain[ctx.scene] = found.bestGain;
      scenesExplored.push(ctx.scene);
      steps += found.bestSequence.length;
      continue;
    }
    const index = strategy(ctx);
    walker.choose(index);
    steps += 1;
  }

  // scenesEntered comes off the walker's own #scene: record, NOT off the
  // explore hook above: a scene whose every node is gated shut runs from its
  // entry straight to the hub with no choice point, so the hook never fires
  // even though the entry was spent. Conflating the two is what let a dead
  // festival-night entry look like "not entered" forever.
  const finished = walker.result(false, []);
  const explored = new Set(scenesExplored);
  const noNodes = new Set(
    inputs.graph.scenes.filter((s) => s.choice_nodes.length === 0).map((s) => s.scene_id),
  );
  const inertEntries: string[] = [];
  const entryDays: Record<string, number> = {};
  for (const sceneId of finished.scenesEntered) {
    entryDays[sceneId] = walker.dayOfSceneEntry(sceneId) ?? 0;
    if (explored.has(sceneId) || noNodes.has(sceneId)) continue;
    inertEntries.push(`${sceneId}|${entryDays[sceneId]}`);
  }

  return {
    sceneOptions,
    sceneGain,
    scenesExplored,
    scenesEntered: finished.scenesEntered,
    entryDays,
    inertEntries,
    paths,
    capped,
    steps,
    errors: finished.errors,
  };
}

/**
 * A BOUNDED best-effort search for what a playable week can reach.
 *
 * See the file header for why it is factored this way. Read `bounds.hit`
 * first: when it is true, an "unreachable" entry means "not found within the
 * budget", NOT "proven unreachable".
 */
export function searchReachable(inputs: WalkInputs, options: SearchOptions = {}): SearchResult {
  const started = Date.now();
  const opts: Required<SearchOptions> = {
    maxScenePaths: options.maxScenePaths ?? 4000,
    maxSceneDepth: options.maxSceneDepth ?? 40,
    // 12, not 8: a week is now also spent PROBING — re-entering an
    // incompletely-played scene on a different day. The loop still stops the
    // moment a week teaches it nothing, so extra headroom costs nothing when
    // the search converges early (the current slice converges in 3).
    maxWeeks: options.maxWeeks ?? 12,
    maxSteps: options.maxSteps ?? 2000,
    maxMillis: options.maxMillis ?? 120_000,
  };
  const deadline = started + opts.maxMillis;
  const { graph, days } = inputs;
  const facts = worldFacts(graph, days);

  // ---- stage 1: which scenes the world layer can even open, on a LIVE day ----
  // A dead-day opportunity (soul present, but every node shut by a day gate)
  // is not an opportunity — entering then plays nothing and spends the
  // once-only hub entry for the whole week.
  const opportune = new Set(facts.opportunities.filter((o) => o.live).map((o) => o.scene_id));
  const unreachableScenes: UnreachableNote[] = [];
  for (const scene of graph.scenes) {
    if (!opportune.has(scene.scene_id)) {
      unreachableScenes.push({
        id: scene.scene_id,
        kind: "scene-unreachable",
        expected: false,
        reason: diagnoseScene(graph, days, facts, scene.scene_id),
      });
    }
  }

  // ---- stage 2/3: walk planned weeks, exploring every scene exhaustively ----
  const seenChoices = new Set<string>();
  const seenOptions = new Set<string>();
  const explored = new Set<string>();
  const bestGain: Record<string, Record<string, number>> = {};
  const reasons: string[] = [];
  const errors: string[] = [];
  const dead = new Set<string>(); // (scene, day) entries that played nothing
  const partial = new Set<string>(); // (scene, day) entries that played only part
  const blocked: PlanBlocks = { dead, partial };
  let paths = 0;
  let weeks = 0;
  let unexplored = new Set(opportune);

  // Two passes. "max" answers the max-bond question and is the one the
  // verified week replays; "min" replays the same plans while earning as
  // little bond as possible, which is the only way the low variant of a
  // bond_band-gated beat ever gets offered. See BondBias.
  //
  // A scene stays WANTED until every one of its choice nodes and options has
  // been seen, not merely until it has been entered once. Entering SC-T6-01 on
  // day 2 explores it exhaustively AS PLAYED THAT DAY, but its `day >= 4` beat
  // and everything that beat unlocks stay invisible. So an incomplete scene
  // gets its entry day blocked and the next week is planned to try another.
  const nodesOf = new Map<string, string[]>();
  const optionsOf = new Map<string, string[]>();
  for (const scene of graph.scenes) {
    nodesOf.set(scene.scene_id, scene.choice_nodes.map((n) => n.choice_id));
    optionsOf.set(scene.scene_id, scene.choice_nodes.flatMap((n) => n.options.map((o) => o.option_id)));
  }
  const sceneComplete = (sceneId: string): boolean =>
    (nodesOf.get(sceneId) ?? []).every((id) => seenChoices.has(id)) &&
    (optionsOf.get(sceneId) ?? []).every((id) => seenOptions.has(id));

  // A scene is only worth re-planning while it still has a day nobody has
  // tried. Without this the search never terminates usefully: the festival
  // scenes can NEVER be complete (their low / mid / high variants are mutually
  // exclusive by construction), so they would compete for their one day
  // forever and starve every scene that shares it.
  const tried = new Set<string>();
  const hasUntriedDay = (sceneId: string): boolean => {
    const scene = graph.scenes.find((s) => s.scene_id === sceneId)!;
    return days.some((d) => {
      const key = `${sceneId}|${d.day}`;
      return sceneLiveOn(graph, scene, d.day) && !dead.has(key) && !tried.has(key);
    });
  };

  for (const bias of ["max", "min"] as BondBias[]) {
    let want = new Set(opportune);
    let weeksThisPass = 0;
    while (weeksThisPass < opts.maxWeeks) {
      if (Date.now() > deadline) {
        reasons.push(`time budget ${opts.maxMillis}ms exhausted during the "${bias}" pass`);
        break;
      }
      const plan = buildPlan(graph, facts, want, days, blocked);
      const run = exploreWeek(inputs, plan, seenChoices, seenOptions, opts, deadline, bias);
      weeks += 1;
      weeksThisPass += 1;
      paths += run.paths;
      if (run.capped) reasons.push(`"${bias}" week ${weeksThisPass}: in-scene search hit a cap`);
      for (const e of run.errors) if (!errors.includes(e)) errors.push(e);
      const before = seenChoices.size + seenOptions.size;
      for (const sceneId of run.scenesExplored) {
        explored.add(sceneId);
        if (bias !== "max") continue;
        const prior = bestGain[sceneId];
        const gain = run.sceneGain[sceneId] ?? {};
        const priorTotal = prior ? Object.values(prior).reduce((a, b) => a + b, 0) : -Infinity;
        const total = Object.values(gain).reduce((a, b) => a + b, 0);
        if (total > priorTotal) bestGain[sceneId] = gain;
      }
      const progressed = seenChoices.size + seenOptions.size > before;

      // Block the day of any entry that left the scene incomplete — an inert
      // entry (no choice point at all), or one that played only part of the
      // scene because a later day would open more of it. The next plan routes
      // around that exact (scene, day) instead of repeating itself.
      let learned = false;
      const block = (into: Set<string>, key: string): void => {
        if (!into.has(key)) {
          into.add(key);
          learned = true;
        }
      };
      for (const key of run.inertEntries) block(dead, key);
      for (const sceneId of run.scenesEntered) {
        const key = `${sceneId}|${run.entryDays[sceneId] ?? 0}`;
        if (!tried.has(key)) {
          tried.add(key);
          learned = true;
        }
        if (!sceneComplete(sceneId)) block(partial, key);
      }

      want = new Set([...opportune].filter((id) => !sceneComplete(id) && hasUntriedDay(id)));
      unexplored = new Set([...opportune].filter((id) => !explored.has(id)));
      if (want.size === 0) break;
      // Stop only when a week taught us nothing at all — no new id, and no new
      // dead day to avoid. Otherwise the next plan is genuinely different.
      if (!progressed && !learned) break;
      if (weeksThisPass >= opts.maxWeeks) {
        reasons.push(
          `"${bias}" pass hit maxWeeks=${opts.maxWeeks} with ${want.size} scene(s) not fully explored`,
        );
      }
    }
  }
  if (unexplored.size > 0) {
    // Name the entry gate where there is one. The world layer said the gate can
    // open, so a scene that still never got entered is usually a gate the
    // WALK cannot satisfy even though the content can — knows(phrase) whose only
    // setter is an examinable, say, which no strategy here ever pokes. Without
    // the gate text that reads as a plain budget miss.
    const withGate = [...unexplored].sort().map((id) => {
      const gate = graph.scenes.find((s) => s.scene_id === id)?.entry_gate ?? [];
      return gate.length > 0 ? `${id} (entry gate ${JSON.stringify(gate)})` : id;
    });
    reasons.push(`never entered: ${withGate.join(", ")}`);
  }

  // ---- max bond: plan for BOND, not for scene count ----
  //
  // The exploration passes plan for coverage, which is the right objective for
  // "what can be reached" and the wrong one for "how much bond". Two cheap
  // scenes can out-score one rich one. Now that every reachable scene's best
  // in-scene gain is known, re-plan against that number and walk the result.
  // A soul gets its OWN optimal week — "the max bond for Toby" and "the max
  // bond for Ilsa" are different questions and may want different weeks.
  const soulIds = graph.souls.map((s) => s.soul_id);
  const gainOfScene = (sceneId: string, soul: string): number => bestGain[sceneId]?.[soul] ?? 0;
  const valueFor =
    (souls: readonly string[]) =>
    (scenes: ReadonlySet<string>): number => {
      let total = 0;
      for (const id of scenes) for (const soul of souls) total += gainOfScene(id, soul);
      return round6(total);
    };

  // Distinct plans only: souls usually share an optimum, and each plan costs a
  // full explore + verify walk.
  const walkedPlans = new Map<string, { plan: WeekPlan; week: WalkResult }>();
  const planKeyForSoul = new Map<string, string>();
  const runPlan = (built: WeekPlan & { capped: boolean }, label: string): string => {
    const key = JSON.stringify(built.routes);
    if (built.capped) reasons.push(`${label}: week assignment hit the state cap`);
    if (!walkedPlans.has(key)) {
      const run = exploreWeek(inputs, built, seenChoices, seenOptions, opts, deadline, "max");
      paths += run.paths;
      if (run.capped) reasons.push(`${label}: in-scene search hit a cap`);
      const plan: WeekPlan = { ...built, sceneOptions: run.sceneOptions };
      const week = walkWeek(inputs, plannedStrategy(plan), { maxSteps: opts.maxSteps });
      if (week.truncated) reasons.push(`${label}: verification walk hit the step cap`);
      for (const e of week.errors) if (!errors.includes(e)) errors.push(e);
      // The exploring walk and the plain replay must agree; if not, the
      // recorded option indices did not reproduce and the figure is suspect.
      const missed = run.scenesEntered.filter((s) => !week.scenesEntered.includes(s));
      if (missed.length > 0) {
        reasons.push(`${label}: replay diverged — explored ${missed.join(", ")}, replay did not`);
      }
      for (const sceneId of run.scenesExplored) explored.add(sceneId);
      walkedPlans.set(key, { plan, week });
    }
    return key;
  };

  const totalKey = runPlan(
    // The bond plans get only the HARD blocks. A "partial" day is a coverage
    // preference; for bond it must not stop a rich scene being scheduled at
    // all — the festival scenes can never be "complete" (their band variants
    // are mutually exclusive), and treating that as a ban dropped them.
    buildPlan(graph, facts, new Set(explored), days, { dead, partial: new Set() }, valueFor(soulIds)),
    "bond-optimal week (all souls)",
  );
  for (const soul of soulIds) {
    const potential = [...explored].reduce((t, id) => t + gainOfScene(id, soul), 0);
    if (potential <= 0) {
      planKeyForSoul.set(soul, totalKey);
      continue;
    }
    planKeyForSoul.set(
      soul,
      runPlan(
        buildPlan(graph, facts, new Set(explored), days, { dead, partial: new Set() }, valueFor([soul])),
        `bond-optimal week (${soul})`,
      ),
    );
  }

  const verifiedPlan = walkedPlans.get(totalKey)!.plan;
  const verifiedWeek = walkedPlans.get(totalKey)!.week;

  // Ceiling: every reachable scene's best in-scene gain, summed. It is only
  // ATTAINABLE if all of those scenes fit in one week — two scenes that only
  // ever appear on the same day at incompatible time blocks cannot. When the
  // walked week falls short, `blockedBy` names exactly which scenes it had to
  // give up, so `exact: false` is a fact about the content, not a shrug.
  const upper: Record<string, number> = {};
  for (const [sceneId, gain] of Object.entries(bestGain)) {
    if (!explored.has(sceneId)) continue;
    for (const [soul, delta] of Object.entries(gain)) {
      upper[soul] = round6((upper[soul] ?? 0) + delta);
    }
  }
  const maxBond: Record<string, MaxBond> = {};
  for (const soul of soulIds) {
    const week = walkedPlans.get(planKeyForSoul.get(soul)!)!.week;
    const achieved = round6(week.bond[soul] ?? 0);
    const upperBound = round6(upper[soul] ?? 0);
    const used = week.scenesEntered.filter((id) => gainOfScene(id, soul) > 0).sort();
    const blockedBy = [...explored]
      .filter((id) => gainOfScene(id, soul) > 0 && !week.scenesEntered.includes(id))
      .sort();
    maxBond[soul] = {
      achieved,
      band: bondBandOf(achieved, graph.bond),
      upperBound,
      exact: achieved === upperBound,
      scenesUsed: used,
      blockedBy,
    };
  }

  // ---- what never turned up, and whether that is a defect or by design ----
  //
  // A beat gated on `bond_band(soul) = high` when one life cannot reach high is
  // EXPECTED unreachable — that is the ruling ("one life earns mid, two lives
  // earn high"), not a bug. The test suite must not read it as one. The check
  // is derived, never hard-coded: the band's own threshold from
  // graph.bond.band_thresholds against the max bond a real week actually
  // achieved for that soul.
  const bandOutOfReach = (conditions: string[] | undefined): string | null => {
    for (const cond of conditions ?? []) {
      const m = cond.trim().match(/^bond_band\(([^)]+)\)\s*=\s*(low|mid|high)$/);
      if (!m) continue;
      const soul = m[1];
      const wanted = m[2] === "high" ? 2 : m[2] === "mid" ? 1 : 0;
      const best = maxBond[soul]?.achieved ?? 0;
      if (bondBandOf(best, graph.bond) < wanted) {
        const need =
          wanted === 2 ? graph.bond.band_thresholds.high_min : graph.bond.band_thresholds.mid_min;
        return (
          `gated on bond_band(${soul}) = ${m[2]}, which needs ${need}; the best a single life` +
          ` reaches for ${soul} is ${best}. Expected: the ruling is one life earns mid,` +
          ` a second life earns high`
        );
      }
    }
    return null;
  };

  const unreachableChoiceNodes: UnreachableNote[] = [];
  const unreachableOptions: UnreachableNote[] = [];
  const unreachableSceneIds = new Set(unreachableScenes.map((u) => u.id));
  const classify = (scene: Graph["scenes"][number], node: Graph["scenes"][number]["choice_nodes"][number]) => {
    if (unreachableSceneIds.has(scene.scene_id)) {
      return {
        kind: "scene-unreachable" as const,
        expected: false,
        reason: `scene ${scene.scene_id} is unreachable`,
      };
    }
    if (!explored.has(scene.scene_id)) {
      return {
        kind: "scene-unexplored" as const,
        expected: false,
        reason: `scene ${scene.scene_id} was never explored inside the search budget`,
      };
    }
    const bandReason = bandOutOfReach(node.availability_conditions);
    if (bandReason !== null) {
      return { kind: "band-needs-another-life" as const, expected: true, reason: bandReason };
    }
    return {
      kind: "defect" as const,
      expected: false,
      reason:
        `never offered inside ${scene.scene_id}, which the search explored exhaustively;` +
        ` gate: ${JSON.stringify(node.availability_conditions)}`,
    };
  };

  for (const scene of graph.scenes) {
    for (const node of scene.choice_nodes) {
      const verdict = classify(scene, node);
      if (!seenChoices.has(node.choice_id)) {
        unreachableChoiceNodes.push({ id: node.choice_id, ...verdict });
      }
      for (const opt of node.options) {
        if (seenOptions.has(opt.option_id)) continue;
        unreachableOptions.push({
          id: opt.option_id,
          ...verdict,
          reason: `${node.choice_id}: ${verdict.reason}`,
        });
      }
    }
  }

  const millis = Date.now() - started;
  if (millis > opts.maxMillis) reasons.push(`search ran ${millis}ms, past the ${opts.maxMillis}ms budget`);

  return {
    reachableScenes: [...explored].sort(),
    unreachableScenes,
    reachableChoiceNodes: [...seenChoices].sort(),
    unreachableChoiceNodes,
    reachableOptions: [...seenOptions].sort(),
    unreachableOptions,
    maxBond,
    opportunities: facts.opportunities,
    verifiedWeek,
    verifiedPlan,
    bounds: {
      hit: reasons.length > 0,
      reasons,
      weeksWalked: weeks,
      scenePathsExplored: paths,
      millis,
      unexploredScenes: [...unexplored].sort(),
    },
    errors,
  };
}
