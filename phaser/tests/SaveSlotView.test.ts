/**
 * `buildSaveSlot` / `formatLifeHeading` / `formatLastPlayed` — the pure data
 * behind `SaveLoadScene` (Track 2b; the card grew a name and a year with T13
 * Phase 4). Pins the VIEW rules: every slot field read straight off a
 * `SaveGame`, a defensive spells-learned count, a relative "last played"
 * phrase, the exact heading string a slot card leads with, and NO fabricated
 * "souls met" (there is no field for it, so the view has no property for it —
 * SatchelScene's never-fabricate rule).
 */
import { describe, expect, it } from "vitest";
import { buildSaveSlot, formatLastPlayed, formatLifeHeading } from "../src/world/SaveSlotView";
import { SAVE_VERSION, type SaveGame } from "../src/world/save/SaveGame";

const save = (over: Partial<SaveGame> = {}): SaveGame => ({
  // Read off the constant, not pinned to a literal: a version bump is a
  // schema change this fixture should follow, not a test it should break.
  version: SAVE_VERSION,
  savedAt: "2026-08-18T12:00:00.000Z",
  slot: "mode5-1",
  // Captured from `SAVE_VERSION = 3` on (T13 Phase 3), surfaced on the card
  // from Phase 4 on — the heading reads "Wren — Year 1, Day 1 · morning".
  playerName: "Wren",
  modeId: "mode5",
  ink: { storyStateJson: "{}", satchelPoolNames: [] } as unknown as SaveGame["ink"],
  inventory: {
    heldItemIds: [],
    everHeldItemIds: [],
    worldItemsByScreen: {},
    consumedCounts: {},
  },
  position: { screenId: "F3" },
  // `year` is captured on the save from T13 Phase 2 on, and read by the card
  // from Phase 4 on — same frozen display read as `day`, never restored.
  clockDisplay: { day: 1, year: 1, timeBlock: "morning" },
  slices: { knowledge: { learned: ["glimmer", "temper", "echo"], seen: ["glimmer", "temper", "echo", "hush"] } },
  ...over,
});

describe("buildSaveSlot", () => {
  it("maps every backed field off the SaveGame, spells learned of total", () => {
    const now = new Date("2026-08-18T12:00:30.000Z"); // 30s later
    const view = buildSaveSlot(save(), 16, now);
    expect(view).toEqual({
      slot: "mode5-1",
      playerName: "Wren",
      year: 1,
      place: "F3",
      day: 1,
      timeBlock: "morning",
      spellsLearned: 3,
      spellsTotal: 16,
      lastPlayed: "just now",
    });
  });

  it("surfaces name and year now that the card reads them (T13 Phase 4)", () => {
    // `toEqual` above already pins the exact key set; this states the change
    // out loud. Through Phase 3 both fields were on the save and deliberately
    // NOT on the view — this is the assertion that flipped.
    const keys = Object.keys(buildSaveSlot(save(), 16));
    expect(keys).toContain("playerName");
    expect(keys).toContain("year");
  });

  it("carries an unnamed life through as an empty string, not a stand-in name", () => {
    expect(buildSaveSlot(save({ playerName: "" }), 16).playerName).toBe("");
  });

  it("shows the raw screenId — no fabricated pretty name — and a placeholder when there is none", () => {
    expect(buildSaveSlot(save({ position: { screenId: "old_growth_hollow" } }), 16).place).toBe("old_growth_hollow");
    expect(buildSaveSlot(save({ position: { screenId: null } }), 16).place).toBe("unknown place");
  });

  it("counts learned spells from the knowledge slice, and reports 0 when the slice is missing or malformed", () => {
    expect(buildSaveSlot(save({ slices: {} }), 16).spellsLearned).toBe(0);
    expect(buildSaveSlot(save({ slices: { knowledge: { seen: ["x"] } as never } }), 16).spellsLearned).toBe(0);
    expect(buildSaveSlot(save({ slices: { knowledge: "nonsense" as never } }), 16).spellsLearned).toBe(0);
  });

  it("has no 'souls met' property — the mockup field is dropped, not fabricated", () => {
    expect(Object.keys(buildSaveSlot(save(), 16))).not.toContain("soulsMet");
  });
});

describe("formatLifeHeading", () => {
  it("is the exact line a slot card leads with", () => {
    expect(formatLifeHeading(buildSaveSlot(save(), 16))).toBe("Wren — Year 1, Day 1 · morning");
    const later = save({ playerName: "Bram", clockDisplay: { day: 3, year: 2, timeBlock: "evening" } });
    expect(formatLifeHeading(buildSaveSlot(later, 16))).toBe("Bram — Year 2, Day 3 · evening");
  });

  it("drops the name and the dash for an unnamed life rather than inventing one", () => {
    const view = buildSaveSlot(save({ playerName: "" }), 16);
    expect(formatLifeHeading(view)).toBe("Year 1, Day 1 · morning");
    expect(formatLifeHeading(view)).not.toMatch(/unnamed|unknown|player/i);
  });
});

describe("formatLastPlayed", () => {
  const base = new Date("2026-08-18T12:00:00.000Z");
  const at = (ms: number) => new Date(base.getTime() - ms).toISOString();

  it("buckets from 'just now' up to a calendar date", () => {
    expect(formatLastPlayed(at(30_000), base)).toBe("just now");
    expect(formatLastPlayed(at(5 * 60_000), base)).toBe("5 min ago");
    expect(formatLastPlayed(at(2 * 3_600_000), base)).toBe("2 hr ago");
    expect(formatLastPlayed(at(1 * 86_400_000), base)).toBe("1 day ago");
    expect(formatLastPlayed(at(3 * 86_400_000), base)).toBe("3 days ago");
    // A week or more falls back to a locale date rather than "N days ago".
    expect(formatLastPlayed(at(30 * 86_400_000), base)).not.toContain("ago");
  });

  it("reports 'unknown' for an unparseable timestamp rather than NaN", () => {
    expect(formatLastPlayed("not-a-date", base)).toBe("unknown");
  });
});
