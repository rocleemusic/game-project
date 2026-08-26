/**
 * A mode is a DESCRIPTOR, not a flag.
 *
 * Mode 3 was cheap because it added one boolean (`hubEnabled`) threaded through
 * `ModePickerScene -> PreloadScene -> LocationSelectScene -> CollectScene`.
 * Mode 4 adds gate enforcement, receiver state, save/load, VFX, the VN dialogue
 * layout and edit mode. Six more booleans down the same chain turns
 * `CollectScene` — already 1021 lines carrying eleven responsibilities — into a
 * god object, which is exactly what the SRP requirement forbids.
 *
 * So a mode becomes a record of WHAT IT COMPOSES, and the scene reads the
 * record. `discover-home` then differs from `collect` by one array entry: as
 * cheap as the boolean was, without the thread.
 *
 * Pure. No Phaser, no DOM. `modeFromUrl` takes the query string as an argument
 * rather than reaching for `location`, because `src/mode/**` may not touch the
 * DOM any more than it may touch Phaser.
 */

import type { GameEventType } from "../world/events/GameEvents";
import type { CastPolicy } from "../world/CastPipeline";

/**
 * The composable systems a mode can turn on.
 *
 * This list is the extraction target: every id here is a responsibility that
 * lives inside `CollectScene` or `ScreenScene` today and comes out in Wave 1.
 */
export type SystemId =
  | "backdrop"
  | "pan"
  | "forage-hotspots"
  | "region-hotspots"
  | "npc-presence"
  | "npc-talk"
  | "dialogue"
  | "cast"
  | "satchel"
  | "notebook"
  | "calendar"
  | "hub-decor"
  | "gates"
  | "receiver-states"
  | "vfx"
  | "edit-mode"
  | "save"
  | "walker-probe";

/**
 * As specified in the plan. Do not widen without a ruling.
 *
 * WIDENED ONCE, in Wave 1, by exactly one field: `cast`.
 *
 * The reason is the plan's own: `CastScene.cast()` and
 * `CollectScene.hedgeSpellPicker()` disagree about what a landed cast writes,
 * and the extraction was told not to pick a winner in code. Somewhere has to
 * hold the answer, and a descriptor field is the only place that keeps it as
 * DATA. The alternative — a branch inside `CastPipeline` — is what the SRP
 * requirement and the "no `if (spellId === ...)`" rule both forbid.
 */
export interface ModeDescriptor {
  readonly id: string; readonly title: string; readonly blurb: string;
  readonly entry: "ScreenFlow" | "LocationSelect";
  readonly systems: readonly SystemId[];
  readonly inventory: { grantAllMaterials: boolean; includeAlwaysAvailable: boolean };
  readonly forage: { guaranteedPools: readonly string[] };
  readonly gates: { source: "authored" | "legacy-hedge" | "off"; enforce: boolean };
  /** What a landed cast is allowed to write in this mode. See `castPolicy.ts`. */
  readonly cast: CastPolicy;
  readonly receiverStates: boolean;
  /**
   * `slots` is the SET of save slots this mode offers — one key per
   * independent life, listed as DATA rather than derived from the mode id
   * (T13 Phase 3, 2026-08-24). It was a single `slot: string` through
   * `SAVE_VERSION = 2`; deriving `["mode5-1", "mode5-2", "mode5-3"]` from
   * `id` at read time would put a naming rule in code, and everything else in
   * this interface is data the descriptor states outright.
   *
   * A `SaveCoordinator` still owns exactly ONE of these at a time. Which one
   * is chosen at boot by the slot board and rides the scene-data chain into
   * `CollectScene`; the descriptor only says which keys exist.
   */
  readonly save: { slots: readonly string[]; autosaveOn: readonly GameEventType[] } | null;
  readonly dialogue: "vn" | "row";
  readonly probeGlobal: "__probe" | "__collect" | null;
}
