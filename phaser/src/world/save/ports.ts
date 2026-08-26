/**
 * The narrow slices of each collaborator the save path needs.
 *
 * Structural, not nominal, exactly like `CastPipeline`'s ports: a test passes a
 * plain object, the coordinator cannot quietly grow a dependency on the rest of
 * a class, and `src/world/save/**` never has to import the systems it saves.
 *
 * WHY INVENTORY IS A PORT AND NOT A DIRECT READ OF `Inventory`.
 *
 * `Inventory` today exposes `give`, `applyCast`, `discoveredIds`,
 * `consumedCountOf` and `clampConsumedCount`, and keeps `held`, `world`,
 * `everHeld` and `consumedCounts` private with no bulk reader and no bulk
 * writer. Every one of the four is genuinely different state:
 *
 *   held      shrinks when an item is spent
 *   everHeld  never shrinks — the Home Hub decorates from it
 *   world     per-screen, and never pocketable
 *   consumed  a count, and `clampConsumedCount` can only lower it
 *
 * So a save cannot be rebuilt by replaying `give()`: giving back everything ever
 * held would re-hold every spent item, and there is no public way to raise a
 * consumed count at all. Faking it would produce a save that looks fine and
 * hands the player back items they had already spent.
 *
 * The port is therefore declared here and left for the wiring layer to satisfy.
 * `Inventory.ts` is outside this track's ownership; what it needs is a small
 * additive pair — a `captureState(): InventorySave` and a `restoreState(...)` —
 * and until it has them `MemoryInventoryState` below is the only implementation.
 * That is a reported gap, not a silently degraded save.
 */

import type { InventorySave } from "./SaveGame";

/** The inventory's item-ID world, captured and restored whole. */
export interface InventoryStatePort {
  /** Pure read. Never mutates the inventory it is reading. */
  captureInventory(): InventorySave;
  /**
   * Replace the inventory's state wholesale.
   *
   * WHOLESALE, not additive: a restore that merged into whatever the fresh
   * session had already granted would double-count a starting kit.
   */
  restoreInventory(state: InventorySave): void;
}

/**
 * Where the player is standing.
 *
 * Separate from ink because `LanternPlayer.restore` deliberately does not put
 * `currentScreen` back — it is derived from a `#screen:` tag as play moves, and
 * a restored state has not printed one yet. So the host remembers it, which is
 * why `SaveGame.position` is an explicit field.
 */
export interface PositionPort {
  currentScreenId(): string | null;
  /** `null` means "no screen yet" — day 1's start pick, before any `Begin at`. */
  applyScreenId(screenId: string | null): void;
}

/** A plain implementation, for tests and for a mode with no scene attached. */
export class MemoryInventoryState implements InventoryStatePort {
  private state: InventorySave = {
    heldItemIds: [],
    everHeldItemIds: [],
    worldItemsByScreen: {},
    consumedCounts: {},
  };

  captureInventory(): InventorySave {
    return {
      heldItemIds: [...this.state.heldItemIds],
      everHeldItemIds: [...this.state.everHeldItemIds],
      worldItemsByScreen: Object.fromEntries(
        Object.entries(this.state.worldItemsByScreen).map(([k, v]) => [k, [...v]]),
      ),
      consumedCounts: { ...this.state.consumedCounts },
    };
  }

  restoreInventory(state: InventorySave): void {
    this.state = state;
  }

  /** Test affordance: seed a state without going through a real `Inventory`. */
  set(state: InventorySave): void {
    this.state = state;
  }
}

/** A plain implementation of `PositionPort`. */
export class MemoryPosition implements PositionPort {
  constructor(private screenId: string | null = null) {}

  currentScreenId(): string | null {
    return this.screenId;
  }

  applyScreenId(screenId: string | null): void {
    this.screenId = screenId;
  }
}

/** An empty inventory, for a mode that saves before anything has been picked up. */
export const EMPTY_INVENTORY_SAVE: InventorySave = {
  heldItemIds: [],
  everHeldItemIds: [],
  worldItemsByScreen: {},
  consumedCounts: {},
};
