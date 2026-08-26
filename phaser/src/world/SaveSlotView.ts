/**
 * `buildSaveSlot` — the pure data behind `SaveLoadScene` (Track 2b, the
 * save/load migration screen). Same VIEW discipline as `SatchelPockets`: it
 * turns a `SaveGame` that was already read off disk into the handful of
 * display strings a slot card shows, and it invents nothing.
 *
 * WHAT IS BACKED, AND WHAT IS NOT.
 *   Name           <- playerName, VERBATIM (T13 Phase 4). `""` is a real value
 *                     meaning "this life was never named" and is passed through
 *                     as `""`; `formatLifeHeading` below decides how that reads
 *                     on a card. Nothing here substitutes a stand-in name.
 *   Year           <- clockDisplay.year (T13 Phase 4), same frozen display read
 *                     as `day` — written at capture, never restored.
 *   Place          <- position.screenId (raw id; no screenId->name source is
 *                     wired in this repo for slot context, so the raw id shows
 *                     rather than a fabricated pretty name).
 *   Day / block    <- clockDisplay.day / clockDisplay.timeBlock (the frozen
 *                     display read — never parsed back out of ink).
 *   Spells learned <- slices.knowledge.learned.length of `spellsTotal`.
 *   Last played    <- savedAt, formatted relative to `now`.
 *
 * "Souls met" from the mockup is DELIBERATELY ABSENT: no slice persists a
 * souls-met count (bond bands live inside opaque `ink.storyStateJson`), and
 * SatchelScene's rule is to omit a count rather than fabricate one. Adding it
 * would mean a new `BondsSlice` first — a separate build.
 */

import type { SaveGame } from "./save/SaveGame";

export interface SaveSlotView {
  readonly slot: string;
  /** `SaveGame.playerName` verbatim. `""` = never named — see the header. */
  readonly playerName: string;
  /** `clockDisplay.year` verbatim. Display only, exactly like `day`. */
  readonly year: number;
  /** `position.screenId` verbatim, or a placeholder when the save had none. */
  readonly place: string;
  readonly day: number;
  readonly timeBlock: string;
  readonly spellsLearned: number;
  readonly spellsTotal: number;
  /** A relative phrase — "just now", "5 min ago", or a date for old saves. */
  readonly lastPlayed: string;
}

/**
 * The one line a slot card leads with: `"Wren — Year 2, Day 3 · evening"`.
 *
 * Composition lives here, beside the fields it composes, so the string a player
 * reads is pinned by a unit test rather than by a screenshot. It is a FORMATTING
 * rule, not a source of new facts — every part of it comes off the save.
 *
 * AN UNNAMED LIFE DROPS THE NAME AND THE DASH, it does not gain a placeholder.
 * `playerName` is `""` for a save written before name entry existed (see
 * `SaveGame.playerName`), and "Unnamed — Year 1, ..." would put a name on a card
 * that no player ever typed. The clock half alone is true; a stand-in is not.
 */
export function formatLifeHeading(view: SaveSlotView): string {
  const clock = `Year ${view.year}, Day ${view.day} · ${view.timeBlock}`;
  return view.playerName ? `${view.playerName} — ${clock}` : clock;
}

/**
 * How many spells the save confirms as learned.
 *
 * `slices.knowledge` is typed `JsonValue` (a slice owns its own payload shape),
 * so this reads it structurally and defensively: a missing, malformed, or
 * empty knowledge slice reports 0 rather than throwing. The shape it looks for
 * is `KnowledgeSaveData` (`{ learned: string[] }`).
 */
function learnedCount(slices: SaveGame["slices"]): number {
  const k: unknown = slices.knowledge;
  if (typeof k === "object" && k !== null && !Array.isArray(k)) {
    const learned = (k as Record<string, unknown>).learned;
    if (Array.isArray(learned)) return learned.length;
  }
  return 0;
}

/**
 * `savedAt` (ISO 8601) as a human relative phrase.
 *
 * `now` is injectable so the buckets are testable without mocking the clock —
 * the same seam `SatchelPockets` uses by taking its inputs as arguments.
 */
export function formatLastPlayed(savedAt: string, now: Date = new Date()): string {
  const then = new Date(savedAt);
  const ms = now.getTime() - then.getTime();
  if (Number.isNaN(ms)) return "unknown";
  if (ms < 60_000) return "just now";
  const min = Math.floor(ms / 60_000);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} hr ago`;
  const days = Math.floor(hr / 24);
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return then.toLocaleDateString();
}

export function buildSaveSlot(save: SaveGame, spellsTotal: number, now: Date = new Date()): SaveSlotView {
  return {
    slot: save.slot,
    playerName: save.playerName,
    year: save.clockDisplay.year,
    place: save.position.screenId ?? "unknown place",
    day: save.clockDisplay.day,
    timeBlock: save.clockDisplay.timeBlock,
    spellsLearned: learnedCount(save.slices),
    spellsTotal,
    lastPlayed: formatLastPlayed(save.savedAt, now),
  };
}
