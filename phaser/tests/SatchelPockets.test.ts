/**
 * `buildPockets` — the pure data behind `SatchelScene` (2a, the first UI
 * migration screen). Pins the count-provenance rule: a real pool tally when
 * one exists, `null` (never a fabricated number) when it doesn't.
 */
import { describe, expect, it } from "vitest";
import { buildPockets } from "../src/world/SatchelPockets";
import type { ItemRecord, SpellRecord } from "../src/magic/types";

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

const spell = (over: Partial<SpellRecord> & Pick<SpellRecord, "spell_id" | "components">): SpellRecord => ({
  phrase: over.spell_id,
  role: "Mage",
  status: "approved",
  produces: [],
  learn_source: "",
  confirm_action: "",
  mana_effect: "",
  unlocks: { screen: null, obstacle: null, witnessable_cast: null },
  receivers: [],
  ...over,
});

const items: ItemRecord[] = [
  item({ item_id: "item_river_stone", description: "a river stone", category: "component" }),
  item({
    item_id: "item_captured_sound",
    description: "a captured sound",
    category: "sound",
    persistence: "free",
    consumable: false,
  }),
];
const record = (id: string) => items.find((i) => i.item_id === id);

const spells: SpellRecord[] = [
  spell({ spell_id: "glimmer", phrase: "glimmer", components: ["item_river_stone"] }),
  spell({ spell_id: "temper", phrase: "temper", components: ["item_river_stone"] }),
  spell({ spell_id: "echo", phrase: "echo", components: ["item_captured_sound"] }),
];

describe("buildPockets", () => {
  it("counts a pool-provenanced item from ink's own satchel array", () => {
    const pockets = buildPockets(
      ["item_river_stone"],
      ["item_river_stone", "item_river_stone"],
      record,
      spells,
      () => false,
    );
    expect(pockets).toEqual([
      {
        id: "item_river_stone",
        label: "river stone",
        description: "a river stone",
        kind: "component",
        count: 2,
        free: false,
        carriedFor: [
          { phrase: "glimmer", known: false },
          { phrase: "temper", known: false },
        ],
      },
    ]);
  });

  it("a free item (never spent) never gets a fabricated count", () => {
    const pockets = buildPockets(["item_captured_sound"], [], record, spells, () => true);
    expect(pockets[0].count).toBeNull();
    expect(pockets[0].free).toBe(true);
    expect(pockets[0].carriedFor).toEqual([{ phrase: "echo", known: true }]);
  });

  it("a held item with no pool provenance (DEV-unlock grant) is still a pocket, count null, not free", () => {
    const pockets = buildPockets(["item_river_stone"], [], record, spells, () => false);
    expect(pockets[0].count).toBeNull();
    expect(pockets[0].free).toBe(false);
  });

  it("an unknown item id still renders — humanized id as the label, no crash on a missing record", () => {
    const pockets = buildPockets(["item_mystery_thing"], [], () => undefined, spells, () => false);
    expect(pockets).toEqual([
      {
        id: "item_mystery_thing",
        label: "mystery thing",
        description: "item_mystery_thing",
        kind: "",
        count: null,
        free: false,
        carriedFor: [],
      },
    ]);
  });

  it("held ids are taken as given — de-dup is the caller's job (Inventory.availableOn already dedupes)", () => {
    const pockets = buildPockets(["item_river_stone", "item_river_stone"], [], record, spells, () => false);
    expect(pockets).toHaveLength(2);
  });
});
