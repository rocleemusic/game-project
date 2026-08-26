/**
 * The calendar's memory: which start each past day began at.
 *
 * `gdd/03-core-loop.md` rules that "The calendar records each past day's chosen
 * location". Nothing carried that fact — `PositionSave.screenId` is the CURRENT
 * screen only, and ink's clock owns the day but not the choice made on it — so
 * `LocationSelectScene` rendered every past cell empty (flagged in its header /
 * `deviations`). This is that record.
 *
 * It is the sibling of `Decor.ts`: a small model that owns ONE localStorage key
 * and is the single writer/parser of its own format. `LocationSelectScene`
 * writes a pick when the player chooses a start, and reads the map back to draw
 * each past day's thumbnail. `DayPicksSlice` (save layer) moves this key's bytes
 * into and out of a save file — it never parses the shape, exactly as
 * `DecorSlice` moves `Decor`'s key. One fact, one writer.
 *
 * The map is keyed by DAY NUMBER (1-5), the value is a start's `screenId`
 * (`"T1"`, `"F1"`). The last pick on a day wins — re-entering a day and choosing
 * again overwrites, rather than appending, because a day has one start.
 */

/**
 * This model's own key. Versioned like `Decor`'s so a later schema change can
 * leave old picks where they sit rather than overwrite them. `DayPicksSlice`
 * imports THIS constant so the two can never drift onto different keys.
 */
export const DAY_PICKS_STORAGE_KEY = "phaser-probe/day-picks/v1";

export class DayPicks {
  private picks: Record<number, string> = {};

  constructor() {
    this.load();
  }

  /** The start chosen on `day`, or undefined if that day has no pick yet. */
  pickFor(day: number): string | undefined {
    return this.picks[day];
  }

  /** Record the start chosen on `day`. Last pick wins — a day has one start. */
  record(day: number, screenId: string): void {
    this.picks[day] = screenId;
    this.save();
  }

  /** The whole map, read-only. */
  all(): Readonly<Record<number, string>> {
    return this.picks;
  }

  private save(): void {
    try {
      localStorage.setItem(DAY_PICKS_STORAGE_KEY, JSON.stringify(this.picks));
    } catch {
      /* private-mode or quota — a lost thumbnail is not worth failing over */
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(DAY_PICKS_STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as Record<string, unknown>;
      const out: Record<number, string> = {};
      // Keep only well-formed entries — a hand-edited or older blob must not
      // put a non-string into a `bg:<screenId>` lookup.
      for (const [key, value] of Object.entries(data)) {
        const day = Number(key);
        if (Number.isInteger(day) && typeof value === "string") out[day] = value;
      }
      this.picks = out;
    } catch {
      this.picks = {};
    }
  }
}
