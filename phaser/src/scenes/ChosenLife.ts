/**
 * WHICH LIFE a play session is playing — the boot-time scene-data contract
 * (T13 Phase 3, 2026-08-24).
 *
 * Its own module rather than a block inside `CollectScene` for two reasons.
 * `CollectScene` is under a documented line-count gate
 * (`tests/HedgeCastPromptTraversalRow.test.ts`) precisely so it does not
 * re-accumulate responsibilities, and this type is not one of its
 * responsibilities — it is a contract BETWEEN scenes. And keeping it here means
 * `LocationSelectScene`, which only forwards the fields, does not have to import
 * from the scene it is routing to.
 *
 * WHY IT EXISTS AT ALL. A mode now offers a SET of save slots
 * (`ModeDescriptor.save.slots` — three for mode5), and a `SaveCoordinator`
 * still owns exactly one at a time. The choice therefore has to arrive from
 * outside the play scene, and the only thing outside that knows it is the boot
 * gate. So it rides the scene-data chain:
 *
 *     SaveLoadScene -> CollectScene                            (Resume)
 *     SaveLoadScene -> LocationSelectScene -> CollectScene     (new game)
 *
 * BOTH FIELDS ARE STILL OPTIONAL, BUT NOTHING GUESSES THEM ANY MORE (Phase 4,
 * 2026-08-24). `SaveLoadScene` now fills both on every route out of the board —
 * Resume reads them off the save it is resuming, and a new life gets the picked
 * column plus the typed name — so `CollectScene` no longer falls back to
 * `mode.save.slots[0]`: a session that arrived without a slot does not save, and
 * warns, rather than quietly autosaving over life 1.
 *
 * They stay OPTIONAL because the modes with `save: null` (`collect`,
 * `discover-home`) route through here too and have no slot to name — for them
 * "absent" is the truth, not a missing answer.
 */

import type { InkBridge } from "../ink/InkBridge";
import type { Run } from "../ink/loadRun";
import type { MagicDB } from "../magic/CastResolver";
import type { ModeDescriptor } from "../mode/ModeDescriptor";

export interface ChosenLife {
  /** One entry of `mode.save.slots`. Absent = this mode has no slots at all. */
  readonly saveSlot?: string;
  /**
   * The name on that life. Absent, or `""`, means "never named" — see
   * `SaveGame.playerName`. Never fabricated, at any layer: the board offers to
   * begin an unnamed life and passes `""` through when the player takes it.
   */
  readonly playerName?: string;
}

/** Everything `CollectScene.init` is handed. */
export interface CollectSceneData extends ChosenLife {
  run: Run;
  ink: InkBridge;
  magic: MagicDB;
  mode: ModeDescriptor;
}
