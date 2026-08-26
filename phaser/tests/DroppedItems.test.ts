/**
 * Satchel-cluster track (2026-08-23) — the host half of drop-to-world and
 * re-pickup: `Inventory.drop(id, screen)` landing the item on a screen,
 * `droppedOn`/`pickUpDropped` round-tripping it, the save capture carrying
 * it, and `poolForItem` (the reverse of `itemForPool`) joining the item-id
 * vocabulary back to the pool-name one at the `LanternPlayer` seam. The
 * pool-name half (`removeCarriedPool`/`stashPool`) is `LanternPlayer`'s and
 * is pinned in `tools/lantern/test/play.test.ts`.
 */
import { describe, expect, it } from "vitest";
import { Inventory } from "../src/world/Inventory";
import { itemForPool, poolForItem } from "../src/world/foragePoolToItem";
import type { ItemRecord } from "../src/magic/types";

const item = (over: Partial<ItemRecord> & Pick<ItemRecord, "item_id">): ItemRecord => ({
  description: over.item_id,
  category: "component",
  persistence: "pack-triaged",
  collectible: true,
  consumable: true,
  source_locations: [],
  always_available: false,
  used_by: [],
  produced_by: [],
  use_family: null,
  ...over,
});

const ITEMS = [
  item({ item_id: "item_river_stone" }),
  item({ item_id: "item_wool" }),
  item({ item_id: "item_flame", persistence: "world", collectible: false }),
];

function inv(): Inventory {
  return new Inventory(ITEMS, { includeAlwaysAvailable: false });
}

describe("poolForItem — the reverse join (identity post-reconciliation, GAPS G13 closed 2026-08-23)", () => {
  it("round-trips every item id through itemForPool and back", () => {
    for (const record of ITEMS) {
      const id = record.item_id;
      // Both directions are now the identity function — see
      // `foragePoolToItem.ts`'s header — so the round trip is trivially
      // stable for ANY id, not just ones a screen happens to forage.
      expect(itemForPool(id)).toBe(id);
      expect(itemForPool(poolForItem(id))).toBe(id);
    }
  });

  it("never returns null — the join no longer has an unjoined case", () => {
    // Pre-reconciliation this asked "does any pool produce this id"; post-
    // reconciliation there is no lookup table left to miss against, so an id
    // no screen forages round-trips through identity exactly like one that is.
    expect(poolForItem("item_never_foraged")).toBe("item_never_foraged");
  });
});

describe("Inventory.drop lands the item on a screen", () => {
  it("removes from held and records the drop on the given screen", () => {
    const i = inv();
    i.give("item_river_stone");
    expect(i.drop("item_river_stone", "F1")).toBe(true);
    expect(i.availableOn(null)).toEqual([]);
    expect(i.droppedOn("F1")).toEqual(["item_river_stone"]);
    expect(i.droppedOn("F2")).toEqual([]);
  });

  it("a drop with no screen discards without landing anywhere (pre-track behaviour)", () => {
    const i = inv();
    i.give("item_river_stone");
    expect(i.drop("item_river_stone")).toBe(true);
    expect(i.droppedOn("F1")).toEqual([]);
  });

  it("dropping something not held is a no-op that lands nothing", () => {
    const i = inv();
    expect(i.drop("item_river_stone", "F1")).toBe(false);
    expect(i.droppedOn("F1")).toEqual([]);
  });

  it("two dropped units are two things on the ground, not a set entry", () => {
    const i = inv();
    i.give("item_wool");
    i.drop("item_wool", "F1");
    i.give("item_wool"); // re-given (e.g. a second unit still slotted)
    i.drop("item_wool", "F1");
    expect(i.droppedOn("F1")).toEqual(["item_wool", "item_wool"]);
  });

  it("a drop never un-discovers — everHeld still remembers for the Home Hub", () => {
    const i = inv();
    i.give("item_river_stone");
    i.drop("item_river_stone", "F1");
    expect(i.discoveredIds()).toEqual(["item_river_stone"]);
  });
});

describe("Inventory.pickUpDropped — the host half of the take-back", () => {
  it("takes one unit off the ground and back into held", () => {
    const i = inv();
    i.give("item_wool");
    i.drop("item_wool", "F1");
    expect(i.pickUpDropped("F1", "item_wool")).toBe(true);
    expect(i.droppedOn("F1")).toEqual([]);
    expect(i.availableOn(null)).toEqual([]); // held, but wool is used_by no spell here
    expect(i.discoveredIds()).toContain("item_wool");
  });

  it("refuses when nothing of that id lies on that screen (stale click racing a resync)", () => {
    const i = inv();
    expect(i.pickUpDropped("F1", "item_wool")).toBe(false);
    i.give("item_wool");
    i.drop("item_wool", "F1");
    expect(i.pickUpDropped("F2", "item_wool")).toBe(false); // wrong screen
    expect(i.droppedOn("F1")).toEqual(["item_wool"]);
  });

  it("removes exactly one unit when two lie dropped", () => {
    const i = inv();
    i.give("item_wool");
    i.drop("item_wool", "F1");
    i.give("item_wool");
    i.drop("item_wool", "F1");
    expect(i.pickUpDropped("F1", "item_wool")).toBe(true);
    expect(i.droppedOn("F1")).toEqual(["item_wool"]);
  });
});

describe("dropped items ride the save", () => {
  it("captureState/restoreState round-trips droppedItemsByScreen", () => {
    const i = inv();
    i.give("item_river_stone");
    i.drop("item_river_stone", "F1");
    const state = i.captureState();
    expect(state.droppedItemsByScreen).toEqual({ F1: ["item_river_stone"] });

    const restored = inv();
    restored.restoreState(state);
    expect(restored.droppedOn("F1")).toEqual(["item_river_stone"]);
    expect(restored.pickUpDropped("F1", "item_river_stone")).toBe(true);
  });

  it("a legacy save without the field restores as nothing dropped anywhere", () => {
    const i = inv();
    i.give("item_river_stone");
    i.drop("item_river_stone", "F1");
    const state = i.captureState();
    // A version-1 save written before the satchel-cluster track.
    const legacy = { ...state };
    delete (legacy as { droppedItemsByScreen?: unknown }).droppedItemsByScreen;
    i.restoreState(legacy);
    expect(i.droppedOn("F1")).toEqual([]);
  });

  it("restoreState replaces dropped state WHOLESALE, same rule as the other fields", () => {
    const i = inv();
    i.give("item_wool");
    i.drop("item_wool", "F2");
    const other = inv();
    i.restoreState(other.captureState());
    expect(i.droppedOn("F2")).toEqual([]);
  });
});
