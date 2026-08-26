/**
 * The per-system save contract.
 *
 * One system owns one slice. A slice knows how to write itself down and how to
 * read itself back, and knows nothing about the file, the storage key, the
 * other slices, or the order. The coordinator (Wave 2, Track C) owns those.
 *
 * THE RULE THAT MATTERS MOST: `restore()` MUST NEVER WRITE THE CLOCK.
 *
 * Ink owns `movesLeft`, `TimeOfDay` and `day`. `setVar` exists on the player,
 * would appear to work, and is the trap — a slice that "restores" the clock
 * puts a second writer on a fact ink already owns, and the two disagree from
 * that moment on. The clock comes back only through
 * `InkStatePort.restore()`, which goes through Lantern's own snapshot path.
 * There is deliberately no clock field anywhere in this folder that a slice can
 * reach.
 */

/** JSON, spelled out, so no slice payload has to be `any`. */
export type JsonValue =
  | string
  | number
  | boolean
  | null
  | readonly JsonValue[]
  | { readonly [key: string]: JsonValue };

/**
 * Known slice owners.
 *
 * A union rather than a bare string so a typo in a save file is a compile
 * error rather than a silently-dropped system. Add here when a system gains a
 * slice — that list is also the drift check for "every stateful system is
 * actually saved".
 *
 * `decor` is called out: `Decor.ts` ALREADY writes its own localStorage key
 * (`phaser-probe/decor/v1`). `DecorSlice` must take ownership of that key, not
 * add a second writer to the same fact.
 */
export type SaveSliceId =
  | "inventory"
  | "knowledge"
  | "gates"
  | "receivers"
  | "decor"
  | "dayPicks"
  | "screen"
  | "npc"
  | "craft"
  /** Festival scoring's per-soul talk calendar — `slices/FestivalSlice.ts`. */
  | "festival"
  /**
   * Endings reached, cumulative across a life's years — the year-rollover
   * screen's third counter (T13 Phase 5, `slices/DiscoverySlice.ts`). The other
   * two counters on that screen need no slice: spells learned already rides
   * `knowledge`, and items collected already rides `SaveGame.inventory`'s
   * `everHeldItemIds`.
   */
  | "discovery";

/**
 * One system's save contract.
 *
 * `capture()` must be a pure read — it may not mutate the system it is reading,
 * because the autosave fires mid-play and a capture with a side effect turns
 * saving into a game action.
 */
export interface SaveSlice<T extends JsonValue = JsonValue> {
  readonly id: SaveSliceId;
  /** Write this system down. Pure read; no side effects. */
  capture(): T;
  /**
   * Read this system back.
   *
   * NEVER writes `movesLeft`, `TimeOfDay` or `day` — directly or through any
   * port that can. See this file's header.
   */
  restore(data: T): void;
}

/** What a slice reports when a payload it is handed does not fit. */
export interface SliceRestoreDefect {
  readonly sliceId: SaveSliceId;
  readonly reason: "version-mismatch" | "malformed" | "unknown-id" | "missing";
  readonly detail: string;
}
