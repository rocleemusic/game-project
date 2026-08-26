/**
 * The year-rollover screen's three counters and its one sentence — T13 Phase 5.
 *
 * TWO THINGS ARE PINNED HERE THAT A SCREENSHOT CANNOT PIN.
 *
 * 1. THE ITEMS DENOMINATOR. "X of N items" needed an N, and the ruled answer is
 *    the RUN's obtainable set rather than the `content/` library — a number the
 *    player can actually finish. That is a derivation over four content
 *    sources with two narrowings (`world/DiscoverySummary.ts`'s header), every
 *    one of which is a silent-wrong-number risk, so each gets its own case
 *    below. The last case runs the derivation against the SHIPPED files, so a
 *    regenerated run or a re-authored `forage` array moves the count here
 *    rather than only on a card nobody re-reads.
 * 2. THE SENTENCE. It is the build plan's own wording, and it is the whole
 *    screen; pinning it means a copy edit is a deliberate act.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDiscoverySummary,
  formatDiscoveryLine,
  obtainableItemIds,
  type ObtainableItemsInput,
} from "../src/world/DiscoverySummary";
import { NPC_GIFT_ITEM } from "../src/world/npcItems";
import type { Graph } from "@lantern/types";
import type { ItemRecord, SpellRecord } from "../src/magic/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const readJson = <T>(...parts: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(here, "..", ...parts), "utf8")) as T;

/** Only the fields the derivation reads; the rest of `ItemRecord` is noise here. */
const item = (item_id: string, over: Partial<ItemRecord> = {}): ItemRecord =>
  ({
    item_id,
    description: "",
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
  }) as ItemRecord;

const spell = (spell_id: string, over: Partial<SpellRecord> = {}): SpellRecord =>
  ({
    spell_id,
    phrase: "",
    role: "",
    status: "approved",
    components: [],
    produces: [],
    learn_source: "",
    confirm_action: "",
    mana_effect: "",
    unlocks: { screen: null, obstacle: null, witnessable_cast: null },
    receivers: [],
    ...over,
  }) as SpellRecord;

const graphWith = (forage: string[][]): Graph =>
  ({
    screens: forage.map((f, i) => ({ screen_id: `S${i + 1}`, forage: f })),
  }) as unknown as Graph;

const input = (over: Partial<ObtainableItemsInput> = {}): ObtainableItemsInput => ({
  graph: graphWith([["item_twig"]]),
  itemRecords: [item("item_twig")],
  approvedSpells: [],
  npcGiftItemIds: [],
  ...over,
});

describe("obtainableItemIds — the run's own obtainable set", () => {
  it("counts what a screen's forage array offers", () => {
    expect(obtainableItemIds(input())).toEqual(["item_twig"]);
  });

  it("counts what an approved spell produces, and what one of its receivers produces instead", () => {
    // Per-receiver `produces` OVERRIDES the spell's own on that pairing (Roc,
    // 2026-08-19) — both are ways the player ends up holding something.
    const got = obtainableItemIds(
      input({
        itemRecords: [item("item_twig"), item("item_ash"), item("item_ingot")],
        approvedSpells: [
          spell("burn", {
            produces: ["item_ash"],
            receivers: [{ receiver_class: "inert", receiver_id: "ore", physical_outcome: "", reaction_kind: null, produces: ["item_ingot"] }],
          }),
        ],
      }),
    );
    expect(got).toEqual(["item_ash", "item_ingot", "item_twig"]);
  });

  it("counts an always_available item and an NPC hand-off", () => {
    // The NPC hand-off is the source that would have made the number wrong if
    // it were forgotten: `item_salt` forages from nowhere and no spell makes
    // it, and the Baker gives it away (Roc, 2026-08-13).
    const got = obtainableItemIds(
      input({
        itemRecords: [item("item_twig"), item("item_free", { always_available: true }), item("item_salt")],
        npcGiftItemIds: ["item_salt"],
      }),
    );
    expect(got).toEqual(["item_free", "item_salt", "item_twig"]);
  });

  it("does NOT count a world item — it can never be pocketed, so it can never be collected", () => {
    // `Inventory.give` refuses `persistence: "world"` outright and `applyCast`
    // routes it to the screen instead of `everHeld`, so counting one would put
    // a ceiling on the card that no play can reach.
    const got = obtainableItemIds(
      input({
        graph: graphWith([["item_twig"]]),
        itemRecords: [item("item_twig"), item("item_flame", { persistence: "world", always_available: true })],
        approvedSpells: [spell("ignite", { produces: ["item_flame"] })],
      }),
    );
    expect(got).toEqual(["item_twig"]);
  });

  it("does NOT count an item whose only maker is `produced_by`, the back-reference", () => {
    // The audit accepts `produced_by` as a source; this deliberately does not.
    // It can name a REJECTED spell, and an item only a rejected spell makes is
    // not obtainable by playing. The forward `produces` on the approved list is
    // the authoritative half of the same join.
    const got = obtainableItemIds(
      input({
        itemRecords: [item("item_twig"), item("item_ghost", { produced_by: ["a_rejected_spell"] })],
      }),
    );
    expect(got).toEqual(["item_twig"]);
  });

  it("does NOT count a forage entry that joins to no item record", () => {
    const got = obtainableItemIds(input({ graph: graphWith([["item_twig", "not_an_item"]]) }));
    expect(got).toEqual(["item_twig"]);
  });

  it("resolves to 14 against the SHIPPED run — 12 forageables, key_raw_ore and the Baker's salt", () => {
    const graph = readJson<Graph>("public", "story", "graph.json");
    const items = readJson<ItemRecord[]>("public", "content", "items.json");
    const keyItems = readJson<Record<string, unknown>[]>("public", "content", "key-items.json");
    const magic = readJson<SpellRecord[]>("public", "content", "magic.json");
    const got = obtainableItemIds({
      graph,
      // `loadRun.normalizeKeyItem`'s shape, in the two fields this reads.
      itemRecords: [
        ...items,
        ...keyItems.map((k) =>
          item(String(k.key_item_id), { persistence: (k.persistence as ItemRecord["persistence"]) ?? "pack-triaged" }),
        ),
      ],
      // `MagicDB` filters rejected spells out; mirror that, do not skip it.
      approvedSpells: magic.filter((s) => s.status === "approved"),
      npcGiftItemIds: Object.values(NPC_GIFT_ITEM),
    });
    expect(got).toEqual([
      "item_ash",
      "item_beeswax",
      "item_berry",
      "item_captured_sound",
      "item_dirt",
      "item_feather",
      "item_grass",
      "item_river_stone",
      "item_salt",
      "item_spring_water",
      "item_sticks",
      "item_tree_sap",
      "item_wool",
      "key_raw_ore",
    ]);
    // The library is bigger than the run's own set, which is the whole reason
    // the ruled denominator is not `items.length`.
    expect(items.length + keyItems.length).toBeGreaterThan(got.length);
  });
});

describe("buildDiscoverySummary", () => {
  const counts = {
    spellIdsLearned: ["glimmer", "echo"],
    spellIdsTotal: ["glimmer", "echo", "temper"],
    itemIdsEverHeld: ["item_twig"],
    itemIdsObtainable: ["item_twig", "item_ash"],
    tiersReached: ["quiet"],
  };

  it("counts each pair, with the three ruled tiers as the endings denominator", () => {
    expect(buildDiscoverySummary(counts)).toEqual({
      spellsLearned: 2,
      spellsTotal: 3,
      itemsCollected: 1,
      itemsTotal: 2,
      endingsReached: 1,
      endingsTotal: 3,
    });
  });

  it("intersects rather than counting raw lengths, so a numerator can never exceed its denominator", () => {
    // A restored save or a regenerated run can leave the player holding an id
    // the run no longer offers. "collected 3 of 2 items" is the failure this
    // prevents by construction.
    const summary = buildDiscoverySummary({
      ...counts,
      itemIdsEverHeld: ["item_twig", "item_retired", "item_gone"],
      spellIdsLearned: ["glimmer", "echo", "a_rejected_spell"],
      tiersReached: ["quiet", "warm", "radiant"],
    });
    expect(summary.itemsCollected).toBe(1);
    expect(summary.spellsLearned).toBe(2);
    expect(summary.endingsReached).toBe(2);
  });

  it("reads zero on a life that has found nothing", () => {
    const summary = buildDiscoverySummary({
      ...counts,
      spellIdsLearned: [],
      itemIdsEverHeld: [],
      tiersReached: [],
    });
    expect([summary.spellsLearned, summary.itemsCollected, summary.endingsReached]).toEqual([0, 0, 0]);
  });
});

describe("formatDiscoveryLine", () => {
  it("is the build plan's sentence, verbatim, ending on the invitation", () => {
    expect(
      formatDiscoveryLine({
        spellsLearned: 3,
        spellsTotal: 16,
        itemsCollected: 5,
        itemsTotal: 14,
        endingsReached: 1,
        endingsTotal: 3,
      }),
    ).toBe(
      "You found 3 of 16 spells, collected 5 of 14 items, and reached 1 of 3 endings. There is still more to discover!",
    );
  });
});
