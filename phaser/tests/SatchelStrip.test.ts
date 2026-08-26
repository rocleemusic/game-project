/**
 * `SatchelStrip.syncInventory` — regression guard for Roc's 2026-08-24
 * ruling on note 18: banked items live at Home, not on the player, so they
 * must never join `Inventory.held`. Before this fix, `syncInventory` joined
 * `v.banked` in alongside `v.satchel`/`v.arms`, which leaked banked items
 * into `SatchelScene`'s "extra" unslotted pockets (`extraHeldIds`, built
 * from `Inventory.availableOn`) and made them falsely castable-with from
 * ANY screen via `Inventory.availableOn()`, not just at home.
 */
import { describe, expect, it } from "vitest";
import type { PlayView } from "@lantern/lib/play";
import { SatchelStrip, type SatchelStripDeps } from "../src/render/SatchelStrip";
import { Inventory } from "../src/world/Inventory";
import type { ItemRecord } from "../src/magic/types";

const item = (over: Partial<ItemRecord> & Pick<ItemRecord, "item_id">): ItemRecord => ({
  description: over.item_id,
  category: "component",
  persistence: "pack-triaged",
  collectible: true,
  consumable: true,
  source_locations: [],
  always_available: false,
  used_by: ["glimmer"],
  produced_by: [],
  use_family: null,
  ...over,
});

const items: ItemRecord[] = [
  item({ item_id: "item_river_stone" }),
  item({ item_id: "item_ash" }),
];

/** Only the fields `syncInventory` reads. */
function view(over: Partial<PlayView>): PlayView {
  return { satchel: [], arms: [], banked: [], ...over } as unknown as PlayView;
}

function rig() {
  const inventory = new Inventory(items);
  const strip = new SatchelStrip({
    scene: {} as SatchelStripDeps["scene"],
    ink: {} as SatchelStripDeps["ink"],
    inventory,
    viewHeight: 1080,
  });
  return { inventory, strip };
}

describe("SatchelStrip.syncInventory — banked items never join held", () => {
  it("does not add a banked-only item to Inventory.held", () => {
    const { inventory, strip } = rig();
    strip.syncInventory(view({ satchel: [], arms: [], banked: ["item_river_stone"] }));
    expect(inventory.availableOn(null)).not.toContain("item_river_stone");
  });

  it("keeps carried items (satchel + arms) in held, even alongside an unrelated banked item", () => {
    const { inventory, strip } = rig();
    strip.syncInventory(view({ satchel: ["item_river_stone"], arms: [], banked: ["item_ash"] }));
    const held = inventory.availableOn(null);
    expect(held).toContain("item_river_stone");
    expect(held).not.toContain("item_ash");
  });
});
