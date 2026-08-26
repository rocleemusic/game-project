/**
 * The one place a save is assembled and the one place it is taken apart.
 *
 * Pure — no Phaser, no DOM, no globals. Every collaborator arrives as a port.
 *
 * ---------------------------------------------------------------------------
 * THE TWO-VOCABULARIES HAZARD IS CLOSED (Roc, 2026-08-23, Task 1 T19)
 * ---------------------------------------------------------------------------
 *
 *     ink.satchelPoolNames    now ITEM IDS  "item_river_stone"   Lantern owns it
 *     inventory.heldItemIds   ITEM IDS      "item_river_stone"   the host owns it
 *
 * They used to be two names for the same pickup, joined many-to-one and NOT
 * invertible (`foragePoolToItem.ts`). `screen-specs.json` now authors
 * `item_id` strings directly, so both fields carry the same vocabulary — the
 * join is an identity shim, kept only so call sites stay untouched. This
 * class still writes them to two separate fields and restores each to the
 * system that owns it, and that split still matters: the 1 -> 2 version bump
 * depends on it. A version-1 save's `satchelPoolNames` holds
 * pre-reconciliation strings ("river stones") that are neither an item id
 * Inventory recognises nor a pool the current join knows — the split is what
 * lets that be detected and refused as `version-mismatch` rather than
 * silently merged into the held set.
 *
 * THE RE-JOIN IS NOT RUN HERE. `SatchelLedger.reJoinInto` already runs on every
 * render, and both sides of the save are authoritative, so after a restore the
 * next render re-joins from exactly the state it would have re-joined from had
 * the page never reloaded — `give()` is a Set add, so it adds nothing new.
 * Running the join inside the restore as well would be a second writer to the
 * held set, arriving before the consumed ledger it depends on had been read.
 *
 * ---------------------------------------------------------------------------
 * INK OWNS THE CLOCK
 * ---------------------------------------------------------------------------
 *
 * There is no code path from a save file to `movesLeft`, `TimeOfDay`, `day` or
 * `year`.
 * `InkStatePort` has a reader and no writer; `InkSaveState` carries no block and
 * no move count; `SaveGame.clockDisplay` is written at capture for the slot list
 * and is never read by `restore`. `setVar` exists on `LanternPlayer`, is public,
 * and would appear to work — it is the trap, and `tests/SaveLoad.test.ts`
 * asserts the string does not appear anywhere under `src/world/save/**`, and
 * that a full save/load cycle against the real story leaves the player's own
 * `forced` flag false.
 *
 * ---------------------------------------------------------------------------
 * ORDER, and why it is this order
 * ---------------------------------------------------------------------------
 *
 * capture   ink -> inventory -> position -> slices
 * restore   ink -> inventory -> slices -> position
 *
 * Ink goes first on restore because it is the largest, most opaque write and the
 * one that can fail hardest; nothing else is worth restoring if it did not land.
 * Position goes LAST because `LanternPlayer.restore` deliberately does not put
 * `currentScreen` back — it is derived from a `#screen:` tag as play moves — so
 * the host's own record of where the player was standing has to be applied after
 * ink has finished, or ink's restore would overwrite the screen the scene is
 * about to draw.
 */

import type { GameEventBus, GameEventType } from "../events/GameEvents";
import type { CheckedSaveSlice } from "./CheckedSaveSlice";
import type { InkStatePort } from "./InkStatePort";
import type { InventoryStatePort, PositionPort } from "./ports";
import {
  SAVE_VERSION,
  type SaveGame,
  type SaveLoadDefect,
  type SaveSlotInfo,
} from "./SaveGame";
import type { JsonValue, SaveSlice, SliceRestoreDefect } from "./SaveSlice";
import type { SaveStore } from "./SaveStore";

/**
 * A slice the coordinator can hold. `CheckedSaveSlice` narrows to the ones that
 * can also reject a payload; a plain `SaveSlice` is accepted and simply gets no
 * validation, which is the honest description of what it offers.
 */
export type RegisteredSlice = SaveSlice<JsonValue> | CheckedSaveSlice<JsonValue>;

export interface SaveCoordinatorDeps {
  /**
   * Which slot this coordinator reads and writes — ONE of
   * `ModeDescriptor.save.slots`, chosen at boot and handed in.
   *
   * UNCHANGED IN SHAPE by T13 Phase 3 (2026-08-24), on purpose. The mode now
   * offers three slots, but a coordinator still owns exactly one at a time: a
   * coordinator that could switch slots mid-session would need a second answer
   * to "which file does this autosave go to", and the autosave binding below
   * has no way to ask.
   */
  readonly slot: string;
  /**
   * The name on this life, stamped into every save `capture()` writes (T13
   * Phase 3). Arrives as a dep for the same reason `slot` does — the
   * coordinator is not allowed to go looking for it, and there is no source
   * for it inside the save layer.
   *
   * `""` is legal and means "this life was never named" — see
   * `SaveGame.playerName`. The coordinator does not substitute anything.
   */
  readonly playerName: string;
  /** `ModeDescriptor.id`. A save is not portable across modes. */
  readonly modeId: string;
  readonly store: SaveStore;
  readonly ink: InkStatePort;
  readonly inventory: InventoryStatePort;
  readonly position: PositionPort;
  /** Registered by the systems that own them. Order-independent. */
  readonly slices?: readonly RegisteredSlice[];
  /** Optional so the coordinator is testable with no bus at all. */
  readonly bus?: GameEventBus;
  /** Injected so a replayed session writes a byte-identical save. */
  readonly now?: () => string;
}

/** What a load did, including the parts of it that did not work. */
export interface SaveLoadReport {
  readonly loaded: boolean;
  /** Set when the save itself could not be used at all. */
  readonly defect: SaveLoadDefect | null;
  /** Slices that refused their payload. The rest still restored. */
  readonly sliceDefects: readonly SliceRestoreDefect[];
}

function hasCheck(slice: RegisteredSlice): slice is CheckedSaveSlice<JsonValue> {
  return typeof (slice as CheckedSaveSlice<JsonValue>).check === "function";
}

export class SaveCoordinator {
  private readonly slices: readonly RegisteredSlice[];
  private readonly now: () => string;
  /**
   * Set while a restore is in flight.
   *
   * A restore emits `screen:changed` and `item:acquired` as systems come back,
   * and those are exactly the events Mode 4 autosaves on — so without this, a
   * load would immediately write a save built from a half-restored world. The
   * flag is the guard, and it is on the coordinator rather than on the bus
   * because the bus is a shared seam and must not learn about saving.
   */
  private restoring = false;

  constructor(private readonly deps: SaveCoordinatorDeps) {
    this.slices = deps.slices ?? [];
    this.now = deps.now ?? (() => new Date().toISOString());
  }

  /** Every registered slice id, in registration order. The drift check reads it. */
  sliceIds(): string[] {
    return this.slices.map((s) => s.id);
  }

  /**
   * Build the save. Pure read: nothing here may mutate the systems it reads,
   * because an autosave fires mid-play and a capture with a side effect turns
   * saving into a game action.
   */
  capture(): SaveGame {
    const clock = this.deps.ink.clock();
    const slices: Record<string, JsonValue> = {};
    for (const slice of this.slices) slices[slice.id] = slice.capture();
    return {
      version: SAVE_VERSION,
      savedAt: this.now(),
      slot: this.deps.slot,
      // Host-owned, stamped at capture. Never pushed into ink — the name going
      // INTO the story is T15's problem and the no-`setVar` rule holds there too.
      playerName: this.deps.playerName,
      modeId: this.deps.modeId,
      ink: this.deps.ink.capture(),
      inventory: this.deps.inventory.captureInventory(),
      position: { screenId: this.deps.position.currentScreenId() },
      // Display only. Never read back. See `SaveClockDisplay`. `year` joins
      // `day` here on identical terms (T13, 2026-08-24) — captured for the
      // slot list, and there is no route from this field back into ink.
      clockDisplay: { day: clock.day, year: clock.year, timeBlock: clock.timeBlock },
      slices: slices as SaveGame["slices"],
    };
  }

  /** Capture, write, announce. Returns what was written. */
  save(): SaveGame {
    const save = this.capture();
    this.deps.store.write(save);
    this.deps.bus?.emit({
      type: "save:written",
      slot: save.slot,
      version: save.version,
      sliceIds: this.sliceIds(),
    });
    return save;
  }

  /**
   * Read this coordinator's slot and restore it.
   *
   * A save written by a different mode is REPORTED, not loaded. Modes differ in
   * whether items are granted, whether `always_available` bypasses possession,
   * and which gate vocabulary is in play — a `daylife` save restored into
   * `collect` would hand the player a sandbox inventory in the mode where
   * foraging is the mechanic.
   */
  load(): SaveLoadReport {
    const read = this.deps.store.read(this.deps.slot);
    if (!read.ok) return { loaded: false, defect: read.defect, sliceDefects: [] };
    if (read.save.modeId !== this.deps.modeId) {
      return {
        loaded: false,
        sliceDefects: [],
        defect: {
          slot: this.deps.slot,
          reason: "mode-mismatch",
          detail: `save was written by mode "${read.save.modeId}", this session is "${this.deps.modeId}"`,
        },
      };
    }
    return this.restore(read.save);
  }

  /**
   * Apply a save that has already been read and accepted.
   *
   * Public so a slot-picker can restore a save it loaded itself, and so the
   * round-trip is testable without going through storage.
   */
  restore(save: SaveGame): SaveLoadReport {
    const sliceDefects: SliceRestoreDefect[] = [];
    this.restoring = true;
    try {
      // 1. Ink and world state, through Lantern's own snapshot path. The clock
      //    arrives inside this and by no other route.
      this.deps.ink.restore(save.ink);

      // 2. The host's ITEM-ID world. Wholesale, never merged: merging into a
      //    fresh session's starting grant would double-count it.
      this.deps.inventory.restoreInventory(save.inventory);

      // 3. Per-system slices. A slice that refuses its payload is skipped and
      //    reported; the others still restore. A bad decor blob must not cost
      //    the player their spellbook.
      for (const slice of this.slices) {
        const payload = save.slices[slice.id];
        if (payload === undefined) {
          sliceDefects.push({
            sliceId: slice.id,
            reason: "missing",
            detail: `no payload for "${slice.id}" in this save`,
          });
          continue;
        }
        if (hasCheck(slice)) {
          const defect = slice.check(payload);
          if (defect) {
            sliceDefects.push(defect);
            continue;
          }
        }
        slice.restore(payload);
      }

      // 4. Where the player is standing. Last, because ink's own restore does
      //    not put `currentScreen` back and would otherwise clear it.
      this.deps.position.applyScreenId(save.position.screenId);
    } finally {
      this.restoring = false;
    }

    this.deps.bus?.emit({
      type: "save:loaded",
      slot: save.slot,
      version: save.version,
      sliceIds: this.sliceIds(),
    });
    return { loaded: true, defect: null, sliceDefects };
  }

  hasSave(): boolean {
    return this.deps.store.has(this.deps.slot);
  }

  /** Drop this slot. The slot list is the caller's; this touches one key. */
  clear(): void {
    this.deps.store.remove(this.deps.slot);
  }

  slots(): SaveSlotInfo[] {
    return this.deps.store.list();
  }

  /**
   * Autosave on the events a mode names, and on no others.
   *
   * The list is `ModeDescriptor.save.autosaveOn` — for Mode 4, a screen change,
   * a gate clearing and a pickup: the three moments a player would be sorry to
   * lose. `cast:resolved` is deliberately NOT among them, because a cast sweep
   * would then write 89 saves.
   *
   * Returns the unsubscribe thunk. A scene that does not call it on shutdown
   * leaks a listener that outlives the mode, which is the same class of bug the
   * VFX filters have.
   */
  bindAutosave(bus: GameEventBus, types: readonly GameEventType[]): () => void {
    const offs = types.map((type) =>
      bus.on(type, () => {
        // A restore replays the very events this listens for. Saving from
        // inside a half-restored world would overwrite the save being loaded.
        if (this.restoring) return;
        this.save();
      }),
    );
    return () => {
      for (const off of offs) off();
    };
  }
}
