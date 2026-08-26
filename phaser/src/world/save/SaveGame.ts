/**
 * The on-disk save schema.
 *
 * THE TWO-VOCABULARIES HAZARD IS CLOSED (Roc, 2026-08-23 — Task 1, T19).
 *
 *     Lantern's satchel   used to hold POOL NAMES   "river stones"
 *     Inventory           holds ITEM IDS            "item_river_stone"
 *
 * `screen-specs.json` now authors `item_id` strings directly in every `forage`
 * array — GAPS G13 is closed, not worked around. `foragePoolToItem.ts` is an
 * identity shim kept only so existing call sites stay untouched; it does no
 * real join any more.
 *
 * The fields below still keep the two names SEPARATE, because that split is
 * what made the 1 -> 2 bump mean something: a version-1 save's
 * `ink.satchelPoolNames` holds pre-reconciliation strings ("river stones")
 * that join to nothing today, and `version-mismatch` is what stops that from
 * silently restoring a satchel full of dead strings. Do not collapse the
 * fields for tidiness — the version bump depends on the shape staying legible
 * even though the vocabularies underneath it are now the same one.
 *
 *     ink.satchelPoolNames   ->  restored to Lantern, now item ids too
 *     inventory.heldItemIds  ->  restored to Inventory, as item ids
 *
 * THE CLOCK IS NOT A FIELD OF THIS FILE. `day`, `year`, `TimeOfDay` and
 * `movesLeft` live inside `ink.storyStateJson`, opaque, and come back only by
 * restoring ink itself. Nothing in this schema gives a restorer a clock value to assign, on
 * purpose — see `InkStatePort` and `SaveSlice`.
 *
 * Types only. `SaveCoordinator` and `SaveStore` are Wave 2, Track C.
 */

import type { InkSaveState } from "./InkStatePort";
import type { JsonValue, SaveSliceId } from "./SaveSlice";

/**
 * Schema version. Bump whenever a field changes meaning, never silently.
 *
 * A save whose `version` does not match is REPORTED, not coerced: a partially
 * understood save restored anyway is how a reload quietly loses a week.
 *
 * BUMPED 1 -> 2 (Roc, 2026-08-23, Task 1 T19): pool names were reconciled to
 * item ids. A version-1 save's `satchelPoolNames` holds strings like "river
 * stones" that join to nothing post-reconciliation — refusing it cleanly as
 * `version-mismatch` is correct; coercing it would restore a satchel of dead
 * strings.
 *
 * BUMPED 2 -> 3 (2026-08-24, T13 year-loop saves, Phase 3 — the slot set and
 * the player name). Same shape as the 1 -> 2 bump, deliberately: refusal, never
 * migration. Two things changed meaning at once, and ONE bump covers both plus
 * Phase 4's UI, so the number moves exactly once for this build window:
 *
 *   1. `ModeDescriptor.save.slot` (one string, `"mode5"`) became `save.slots`
 *      (three: `"mode5-1"`/`-2`/`-3`). A version-2 save sits under the old
 *      single `"mode5"` key, which is no longer a slot any descriptor names.
 *   2. `SaveGame` gained `playerName` and `clockDisplay` gained `year`
 *      (Phase 2). A version-2 save has neither, and a slot card whose whole job
 *      is to read "«name» — Year N, Day D" cannot honestly render a save that
 *      carries no name and no year.
 *
 * What happens to the old bytes: NOTHING. `SAVE_KEY_PREFIX` stays `v1`, so the
 * version-2 save under `phaser-probe/save/v1/mode5` is left exactly where it
 * is — unread, unwritten, un-deleted. `SaveStore.read` reports it as
 * `version-mismatch` and the caller decides. There is no migration path and
 * there is deliberately no back-fill: inventing a `playerName` for a life that
 * was never named, or a `year` for a save written before the year existed,
 * would be the coercion this whole file exists to refuse.
 */
export const SAVE_VERSION = 3;

/** The host's item-id side of the world. Never pool names. */
export interface InventorySave {
  /** ITEM IDS — `item_river_stone`. Pocketable, currently held. */
  readonly heldItemIds: readonly string[];
  /** ITEM IDS ever held, including spent ones. Mode 3's hub reads this. */
  readonly everHeldItemIds: readonly string[];
  /** screen_id -> ITEM IDS existing in the world on that screen. */
  readonly worldItemsByScreen: Readonly<Record<string, readonly string[]>>;
  /**
   * screen_id -> ITEM IDS the player dropped there, re-pickupable
   * (satchel-cluster track, 2026-08-23). OPTIONAL — additive, so version-1
   * saves written before the field existed still load; a missing field reads
   * as "nothing dropped anywhere," which is exactly true of those saves.
   * Duplicates allowed: two dropped units are two entries.
   */
  readonly droppedItemsByScreen?: Readonly<Record<string, readonly string[]>>;
  /** item_id -> times genuinely spent, so the satchel strip stays honest. */
  readonly consumedCounts: Readonly<Record<string, number>>;
}

/** Where the player is. The clock is NOT here — see the header. */
export interface PositionSave {
  readonly screenId: string | null;
}

/**
 * A FROZEN READ of ink's clock at the moment of capture. DISPLAY ONLY.
 *
 * It exists because `SaveSlotInfo` has to say "Day 3 · evening" in a slot list
 * without loading a save, and the only other way to get those two values would
 * be to parse `ink.storyStateJson` — which the host must never start doing.
 *
 * IT IS NEVER READ BY THE RESTORE PATH. Not as a hint, not as a fallback, not
 * "just to check". The clock comes back inside `ink.storyStateJson` or it does
 * not come back, and `InkStatePort` deliberately has no writer for it.
 * `tests/SaveLoad.test.ts` asserts nothing under `src/world/save/**` so much as
 * mentions `setVar`.
 */
export interface SaveClockDisplay {
  readonly day: number;
  /**
   * T13's year, on exactly the same terms as `day` (2026-08-24 build plan,
   * Phase 2). Written at capture so a slot card can read "Year 2, Day 3 ·
   * evening" without loading the save; NEVER restored, never used to drive
   * logic. The live year lives inside `ink.storyStateJson` and comes back with
   * ink's own state or not at all — the host does not own this number and has
   * no writer for it, in this file or anywhere else.
   *
   * A save written before this field existed has no `year` at all. That is
   * fine and deliberate: the `SAVE_VERSION` 2 -> 3 bump that covers phases
   * 2-4 lands with Phase 3 (slot set + player name) in the same build window,
   * per the plan, so no PLAYER-facing save ever sits in the gap. Nothing reads
   * this field on the restore path, so a pre-Phase-2 dev save at worst renders
   * a missing year in a slot list it is about to be refused from anyway.
   */
  readonly year: number;
  readonly timeBlock: string;
}

/**
 * One save file.
 *
 * Fields that are load-bearing enough to have a rule about them are named
 * explicitly. Everything else rides in `slices`, keyed by the owning system, so
 * a new system adds a slice rather than a schema field.
 */
export interface SaveGame {
  readonly version: typeof SAVE_VERSION;
  /** ISO 8601, for the slot list. Never used as a key. */
  readonly savedAt: string;
  /**
   * WHICH slot this is, as one entry of `ModeDescriptor.save.slots` — not the
   * mode id. From `SAVE_VERSION = 3` on there are three of them per mode
   * (`"mode5-1"`/`-2`/`-3`), each an independent life; the coordinator that
   * wrote this one still owned exactly one of them, which is why this stays a
   * single string rather than becoming a set.
   */
  readonly slot: string;
  /**
   * The name the player gave this life (T13 Phase 3, 2026-08-24). The slot
   * board reads it as "«name» — Year 2, Day 3 · evening".
   *
   * HOST-OWNED, and deliberately not an ink variable. The ruling defers
   * pushing the name INTO the story to T15, and the no-`setVar` rule applies
   * there too, so nothing in this file may ever become the source of an ink
   * write.
   *
   * Empty string means "written before name entry existed" — Phase 4 builds the
   * name field, and a dev save captured between the two phases has nothing to
   * put here. It is left empty rather than back-filled with a made-up name; the
   * slot card decides how to render an unnamed life, and inventing one here
   * would put a fabricated fact on disk.
   */
  readonly playerName: string;
  /** Which `ModeDescriptor` wrote this. A save is not portable across modes. */
  readonly modeId: string;
  /**
   * Ink + world state, opaque, INCLUDING the satchel in POOL-NAME vocabulary.
   */
  readonly ink: InkSaveState;
  /**
   * Host inventory in ITEM-ID vocabulary. Separate from `ink.satchelPoolNames`
   * by rule, re-joined on load through `foragePoolToItem.ts`.
   */
  readonly inventory: InventorySave;
  readonly position: PositionSave;
  /** Display only, never restored. See `SaveClockDisplay`. */
  readonly clockDisplay: SaveClockDisplay;
  /** Per-system payloads, keyed by `SaveSlice.id`. */
  readonly slices: Partial<Readonly<Record<SaveSliceId, JsonValue>>>;
}

/** Slot metadata for a save-list UI, without reading the whole file. */
export interface SaveSlotInfo {
  readonly slot: string;
  readonly version: number;
  readonly savedAt: string;
  /** Straight off `SaveGame.playerName`. `""` for a life that was never named. */
  readonly playerName: string;
  readonly modeId: string;
  /** Read off `ink`, display only — never assigned back into ink. */
  readonly day: number;
  /** Same, for T13's year. Straight off `clockDisplay.year`. */
  readonly year: number;
  readonly timeBlock: string;
}

/** Why a save could not be loaded. Reported to the player, never swallowed. */
export interface SaveLoadDefect {
  readonly slot: string;
  readonly reason: "missing" | "unreadable" | "version-mismatch" | "mode-mismatch";
  readonly detail: string;
}
