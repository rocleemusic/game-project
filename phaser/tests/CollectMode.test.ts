import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { itemForPool } from "../src/world/foragePoolToItem";
import { HEDGE_SCREEN_ID, HEDGE_RECEIVER_ID, HEDGE_CLEARING_SPELL } from "../src/world/collectGates";
import { NPC_GIFT_ITEM } from "../src/world/npcItems";
import { Forage } from "../src/world/Forage";
import { Inventory } from "../src/world/Inventory";
import type { Graph } from "../../tools/lantern/src/types";
import type { ItemRecord, SpellRecord } from "../src/magic/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const graph = JSON.parse(
  fs.readFileSync(path.join(here, "..", "public", "story", "graph.json"), "utf8"),
) as Graph;
const items = JSON.parse(
  fs.readFileSync(path.join(here, "..", "public", "content", "items.json"), "utf8"),
) as ItemRecord[];
const spells = JSON.parse(
  fs.readFileSync(path.join(here, "..", "public", "content", "magic.json"), "utf8"),
) as SpellRecord[];
const keyItems = JSON.parse(
  fs.readFileSync(path.join(here, "..", "public", "content", "key-items.json"), "utf8"),
) as Record<string, unknown>[];

describe("forage pool -> item join (identity post-reconciliation, GAPS G13 closed 2026-08-23)", () => {
  it("every pool name authored anywhere in the graph IS a real item_id or key_item_id", () => {
    const itemIds = new Set(items.map((i) => i.item_id));
    const keyItemIds = new Set(keyItems.map((k) => k.key_item_id as string));
    for (const screen of graph.screens ?? []) {
      for (const pool of screen.forage ?? []) {
        const id = itemForPool(pool);
        expect(id, `${screen.screen_id}'s "${pool}" pool has no join entry`).not.toBeNull();
        expect(
          itemIds.has(id!) || keyItemIds.has(id!),
          `${id} from "${pool}" is not a real item_id or key_item_id`,
        ).toBe(true);
      }
    }
  });

  it("a translated pickup becomes castable through Inventory", () => {
    const inv = new Inventory(items);
    const pool = "item_sticks";
    const id = itemForPool(pool)!;
    inv.give(id);
    expect(inv.availableOn(null)).toContain(id);
  });

  it("item_ash is forageable, item_salt is an NPC gift instead (Roc ruling 2026-08-13)", () => {
    const foraged = new Set((graph.screens ?? []).flatMap((s) => s.forage ?? []));
    expect(foraged.has("item_ash")).toBe(true);
    expect(foraged.has("item_salt")).toBe(false);
    expect(Object.values(NPC_GIFT_ITEM)).toContain("item_salt");
  });

  it("key_raw_ore is approved, role-tied (not soul-tied, avoids Ilsa's two-item cap), and forage-authored", () => {
    const ore = keyItems.find((k) => k.key_item_id === "key_raw_ore");
    expect(ore?.status).toBe("approved");
    expect(ore?.role).toBe("Blacksmith");
    expect(ore?.soul).toBeUndefined();
    const foraged = new Set((graph.screens ?? []).flatMap((s) => s.forage ?? []));
    expect(foraged.has("key_raw_ore")).toBe(true);
  });

  it("offers only pool names that are real item_ids or key_item_ids", () => {
    const itemIds = new Set(items.map((i) => i.item_id));
    const keyItemIds = new Set(keyItems.map((k) => k.key_item_id as string));
    const f = new Forage(graph);
    for (const screen of graph.screens ?? []) {
      if (!f.poolFor(screen.screen_id).length) continue;
      for (const slot of f.offer(screen.screen_id, 1, "morning")) {
        expect(itemIds.has(slot.item) || keyItemIds.has(slot.item)).toBe(true);
      }
    }
  });
});

describe("possession gating in Collection & Discovery mode (Roc bug report 2026-08-13)", () => {
  it("item_sticks (always_available) is excluded from availableOn until actually held", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    expect(inv.availableOn(null)).not.toContain("item_sticks");
    inv.give("item_sticks");
    expect(inv.availableOn(null)).toContain("item_sticks");
  });

  it("stays available by default, unchanged for ScreenScene", () => {
    const inv = new Inventory(items);
    expect(inv.availableOn(null)).toContain("item_sticks");
  });

  it("an always_available item is actually spent on cast once possession is required", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    inv.give("item_sticks");
    inv.applyCast(null, ["item_sticks"], []);
    expect(inv.availableOn(null)).not.toContain("item_sticks");
  });

  it("consumedCountOf ledgers a genuine spend, for a display that can't remove itself from ink's satchel array (Roc bug report, round 2, 2026-08-13)", () => {
    // The follow-up bug: Inventory's own held-set deletion was correct, but
    // the visible satchel strip reads ink's `v.satchel` array directly —
    // there is no API to remove one entry from it — so a consumed stick
    // kept showing up forever. `consumedCountOf` is the ledger a display
    // reads to hide the right number of occurrences itself.
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    inv.give("item_sticks");
    expect(inv.consumedCountOf("item_sticks")).toBe(0);
    inv.applyCast(null, ["item_sticks"], []);
    expect(inv.consumedCountOf("item_sticks")).toBe(1);
  });

  it("clampConsumedCount corrects the ledger down when the real satchel resets (new day / home-bank), never up", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    inv.give("item_sticks");
    inv.applyCast(null, ["item_sticks"], []);
    expect(inv.consumedCountOf("item_sticks")).toBe(1);
    // A day reset wipes ink's satchel to []: 0 real occurrences remain.
    inv.clampConsumedCount("item_sticks", 0);
    expect(inv.consumedCountOf("item_sticks")).toBe(0);
    // Never raises it back up from a lower reading.
    inv.clampConsumedCount("item_sticks", 5);
    expect(inv.consumedCountOf("item_sticks")).toBe(0);
  });

  it("discoveredIds tracks lifetime finds for mode 3's gated Home Hub, and does not shrink on consumption", () => {
    // The gated palette (HubScene.discoveredOnly) reads this — a cast spell
    // consuming item_sticks must not also make it un-decoratable, or the
    // hub would punish the player for using what they found.
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    expect(inv.discoveredIds()).not.toContain("item_sticks");
    inv.give("item_sticks");
    expect(inv.discoveredIds()).toContain("item_sticks");
    inv.applyCast(null, ["item_sticks"], []);
    expect(inv.discoveredIds()).toContain("item_sticks");
  });

  it("discoveredIds also records items produced by a cast, not just given ones", () => {
    const inv = new Inventory(items, { includeAlwaysAvailable: false });
    expect(inv.discoveredIds()).not.toContain("item_dirt");
    inv.applyCast(null, [], ["item_dirt"]);
    expect(inv.discoveredIds()).toContain("item_dirt");
  });

  it("the forage draw guarantees a sticks offer, matching item_sticks's real always_available intent", () => {
    const f = new Forage(graph, ["item_sticks"]);
    for (let day = 1; day <= 5; day++) {
      for (const block of ["morning", "afternoon", "evening"]) {
        const offer = f.offer("F1", day, block);
        if (f.poolFor("F1").includes("item_sticks")) {
          expect(offer.some((s) => s.item === "item_sticks")).toBe(true);
        }
      }
    }
  });
});

describe("the hedge gate", () => {
  it("targets a screen that actually exists in the graph", () => {
    expect((graph.screens ?? []).some((s) => s.screen_id === HEDGE_SCREEN_ID)).toBe(true);
  });

  it("the clearing spell is approved and really has this receiver authored", () => {
    const spell = spells.find((s) => s.spell_id === HEDGE_CLEARING_SPELL);
    expect(spell?.status).toBe("approved");
    expect(spell?.receivers.some((r) => r.receiver_id === HEDGE_RECEIVER_ID)).toBe(true);
  });
});
