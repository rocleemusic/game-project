/**
 * Festival scoring — Roc's ruling of 2026-08-23, built as T9 on 2026-08-24.
 *
 * The tests that matter here are the ones that would catch the ruling being
 * quietly re-interpreted later:
 *
 *   - the tier reads GOALS ONLY, and bond cannot move it;
 *   - a talk counts ONCE A DAY however many times the panel is opened;
 *   - an unauthored role goal is a CONTENT gap, not an unfinished job;
 *   - the shipped `graph.json` really does carry three completable goals, so
 *     Grand is reachable in the build rather than only in a fixture.
 */
import { describe, expect, it } from "vitest";
import type { RoleWorkplace, Soul } from "@lantern/types";
import {
  BOND_CLOSE_MIN,
  DEFAULT_DAYS_PER_LIFE,
  FestivalLedger,
  bondDepthOf,
  festivalGoals,
  scoreFestival,
  tierFor,
} from "../src/world/FestivalScore";
import { FestivalSlice } from "../src/world/save/slices/FestivalSlice";
import shippedGraph from "../public/story/graph.json";

const SOULS: Soul[] = [
  { soul_id: "mara", name: "Mara", role_tag: "Herbalist", deep: true },
  { soul_id: "toby", name: "Toby", role_tag: "Baker", deep: true },
  { soul_id: "ilsa", name: "Ilsa", role_tag: "Blacksmith", deep: true },
  { soul_id: "nell", name: "Nell", deep: false },
];

const ROLES: RoleWorkplace[] = [
  {
    role_tag: "Herbalist",
    workplace_screens: [],
    time_blocks: [],
    goal: "Brews the festival tonic",
    goal_threads: ["mara-tonic-frost"],
  },
  {
    role_tag: "Baker",
    workplace_screens: [],
    time_blocks: [],
    goal: "Prepares the communal feast",
    goal_threads: ["toby-feast-short"],
  },
  {
    role_tag: "Blacksmith",
    workplace_screens: [],
    time_blocks: [],
    goal: "Forges the centerpiece",
    goal_threads: ["ilsa-forge-short"],
  },
  {
    // Mage's goal is personal, not civic — it ships no goal_threads and must
    // never count toward the tier (gdd/03-core-loop.md).
    role_tag: "Mage",
    workplace_screens: [],
    time_blocks: [],
    goal: "Personal, not civic: collect magic",
    goal_threads: [],
  },
];

const score = (threadMoves: Record<string, number>, ledger = new FestivalLedger()) =>
  scoreFestival({ souls: SOULS, roleWorkplace: ROLES, threadMoves, ledger });

describe("the tier reads completed goals and nothing else", () => {
  it("maps goals to the three ruled tiers", () => {
    expect(tierFor(1)).toBe("quiet");
    expect(tierFor(2)).toBe("warm");
    expect(tierFor(3)).toBe("grand");
  });

  it("shows the modest festival rather than no festival on an empty week", () => {
    // "A festival always ends with something" — there is no fourth tier below
    // Quiet and no game-over.
    expect(tierFor(0)).toBe("quiet");
    expect(score({}).tier).toBe("quiet");
  });

  it("climbs Quiet -> Warm -> Grand as goals land", () => {
    expect(score({ "toby-feast-short": 1 }).tier).toBe("quiet");
    expect(score({ "toby-feast-short": 1, "mara-tonic-frost": 2 }).tier).toBe("warm");
    expect(
      score({ "toby-feast-short": 1, "mara-tonic-frost": 2, "ilsa-forge-short": 1 }).tier,
    ).toBe("grand");
  });

  it("BONDS DO NOT FEED THE TIER — a week of nothing but talking is still Quiet", () => {
    const ledger = new FestivalLedger();
    for (const soul of SOULS) {
      for (let day = 1; day <= DEFAULT_DAYS_PER_LIFE; day++) ledger.recordTalk(soul.soul_id, day);
    }
    const result = score({}, ledger);
    expect(result.tier).toBe("quiet");
    expect(result.goalsCompleted).toBe(0);
    // ...and every soul still turns out, which is what bond DOES drive.
    expect(result.attending).toHaveLength(SOULS.length);
    expect(result.standings.every((s) => s.atMax)).toBe(true);
  });

  it("a non-goal thread moving does not complete anything", () => {
    // `toby-the-shelf` is one of Toby's OTHER threads — internal arc, which
    // moves nothing on the tier by the two-tracks rule.
    expect(score({ "toby-the-shelf": 4 }).goalsCompleted).toBe(0);
  });
});

describe("an unauthored role goal is a content gap, not an unfinished job", () => {
  it("reports goalAuthored false and never counts it", () => {
    const goals = festivalGoals(
      [{ soul_id: "pip", name: "Pip", role_tag: "Mage" }],
      ROLES,
      { "toby-feast-short": 9 },
    );
    expect(goals[0].goalAuthored).toBe(false);
    expect(goals[0].completed).toBe(false);
  });

  it("a soul with no dealt role contributes no goal at all", () => {
    expect(festivalGoals(SOULS, ROLES, {})).toHaveLength(3); // nell is dropped
  });
});

describe("bond is a talk calendar, capped at one a day", () => {
  it("counts a soul once however many times they are opened in a day", () => {
    const ledger = new FestivalLedger();
    expect(ledger.recordTalk("toby", 3)).toBe(true);
    expect(ledger.recordTalk("toby", 3)).toBe(false);
    expect(ledger.recordTalk("toby", 3)).toBe(false);
    expect(ledger.bondOf("toby")).toBe(1);
  });

  it("accumulates one per day, to the week's ceiling", () => {
    const ledger = new FestivalLedger();
    for (let day = 1; day <= 5; day++) ledger.recordTalk("mara", day);
    expect(ledger.bondOf("mara")).toBe(5);
    expect(score({}, ledger).standings.find((s) => s.soulId === "mara")?.atMax).toBe(true);
  });

  it("refuses a garbage day rather than storing a phantom entry", () => {
    const ledger = new FestivalLedger();
    expect(ledger.recordTalk("toby", Number.NaN)).toBe(false);
    expect(ledger.recordTalk("toby", 0)).toBe(false);
    expect(ledger.recordTalk("", 1)).toBe(false);
    expect(ledger.bondOf("toby")).toBe(0);
  });

  it("bands depth for dialogue depth and turnout", () => {
    expect(bondDepthOf(0)).toBe("absent");
    expect(bondDepthOf(BOND_CLOSE_MIN - 1)).toBe("present");
    expect(bondDepthOf(BOND_CLOSE_MIN)).toBe("close");
  });
});

describe("souls-of-the-world, the rare top state", () => {
  const allGoals = {
    "toby-feast-short": 1,
    "mara-tonic-frost": 1,
    "ilsa-forge-short": 1,
  };

  it("needs every goal AND every soul at the ceiling", () => {
    const ledger = new FestivalLedger();
    for (const soul of SOULS) {
      for (let day = 1; day <= DEFAULT_DAYS_PER_LIFE; day++) ledger.recordTalk(soul.soul_id, day);
    }
    const result = score(allGoals, ledger);
    expect(result.tier).toBe("grand");
    expect(result.soulsOfTheWorld).toBe(true);
  });

  it("one soul short of the ceiling is Grand without it", () => {
    const ledger = new FestivalLedger();
    for (const soul of SOULS) {
      for (let day = 1; day <= DEFAULT_DAYS_PER_LIFE; day++) ledger.recordTalk(soul.soul_id, day);
    }
    const thin = new FestivalLedger();
    thin.restore(ledger.capture());
    // Rebuild one soul with four days instead of five.
    const data = thin.capture();
    thin.restore({ talkDays: { ...data.talkDays, nell: [1, 2, 3, 4] } });
    const result = score(allGoals, thin);
    expect(result.tier).toBe("grand");
    expect(result.soulsOfTheWorld).toBe(false);
  });
});

describe("the save slice", () => {
  it("round-trips the calendar and REPLACES rather than merges", () => {
    const ledger = new FestivalLedger();
    ledger.recordTalk("toby", 1);
    ledger.recordTalk("toby", 2);
    ledger.recordTalk("mara", 2);
    const payload = new FestivalSlice(ledger).capture();

    const restored = new FestivalLedger();
    restored.recordTalk("ilsa", 5); // pre-existing state the restore must clear
    const slice = new FestivalSlice(restored);
    expect(slice.check(payload)).toBeNull();
    slice.restore(payload);

    expect(restored.bondOf("toby")).toBe(2);
    expect(restored.bondOf("mara")).toBe(1);
    expect(restored.bondOf("ilsa")).toBe(0);
  });

  it("refuses a malformed payload instead of coercing it", () => {
    const slice = new FestivalSlice(new FestivalLedger());
    expect(slice.check("nope" as never)?.reason).toBe("malformed");
    expect(slice.check({ talkDays: [] })?.reason).toBe("malformed");
    expect(slice.check({ talkDays: { toby: ["3"] } })?.reason).toBe("malformed");
  });

  it("survives a restore twice without doubling anything", () => {
    const ledger = new FestivalLedger();
    ledger.recordTalk("toby", 1);
    const payload = new FestivalSlice(ledger).capture();
    const slice = new FestivalSlice(ledger);
    slice.restore(payload);
    slice.restore(payload);
    expect(ledger.bondOf("toby")).toBe(1);
  });
});

describe("the shipped run data, not a fixture", () => {
  const graph = shippedGraph as {
    souls?: Soul[];
    role_workplace?: RoleWorkplace[];
    day_loop?: { days_per_life: number };
    screens?: { screen_id: string }[];
  };

  it("declares the Final Screen id CollectScene mirrors", () => {
    expect(graph.screens?.some((s) => s.screen_id === "FS")).toBe(true);
  });

  it("ships exactly three completable festival goals, so Grand is reachable", () => {
    const dealt = festivalGoals(graph.souls ?? [], graph.role_workplace ?? [], {});
    const authored = dealt.filter((g) => g.goalAuthored);
    expect(authored.map((g) => g.soulId).sort()).toEqual(["ilsa", "mara", "toby"]);

    const everyGoalThread = Object.fromEntries(
      (graph.role_workplace ?? []).flatMap((r) => (r.goal_threads ?? []).map((t) => [t, 1])),
    );
    const full = scoreFestival({
      souls: graph.souls ?? [],
      roleWorkplace: graph.role_workplace ?? [],
      threadMoves: everyGoalThread,
      ledger: new FestivalLedger(),
      daysPerLife: graph.day_loop?.days_per_life,
    });
    expect(full.goalsCompleted).toBe(3);
    expect(full.tier).toBe("grand");
  });

  it("names goal threads the authored ink actually moves", () => {
    // The three thread ids below are emitted by v01's ink as
    // `recordThreadMove(...)`. A role row naming a thread nothing moves is a
    // goal that can never complete — the exact gap this task closed.
    const named = (graph.role_workplace ?? []).flatMap((r) => r.goal_threads ?? []);
    expect(named.sort()).toEqual(["ilsa-forge-short", "mara-tonic-frost", "toby-feast-short"]);
  });
});
