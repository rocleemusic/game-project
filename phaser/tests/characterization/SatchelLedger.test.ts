/**
 * CHARACTERIZATION — the satchel ledger, as it behaves on 2026-08-24.
 *
 * Nothing here is an aspiration. Every assertion was read off disk and then
 * measured, so the Wave 1 extraction of `world/SatchelLedger.ts` out of
 * `CollectScene.effectiveSatchel()` has something that fails loudly if the
 * behaviour moves.
 *
 * The ledger is three collaborating parts today:
 *
 *   `Forage`               offers whatever string `screen-specs.json` authors
 *   `foragePoolToItem`     an IDENTITY SHIM — see its own header
 *   `Inventory`            holds item ids, and counts what has been spent
 *
 * plus a private reconciliation step in `CollectScene` that hides spent items
 * from ink's own satchel array without ever mutating it. That private method is
 * transcribed here (see `effectiveSatchelToday`) because it lives inside a
 * Phaser scene and cannot be imported into vitest. When `SatchelLedger.ts`
 * exists, delete the transcription and import the real thing — the assertions
 * below should pass unchanged.
 *
 * GAPS.md G13 IS CLOSED (Roc, 2026-08-23 — Task 1, T19). This file used to
 * exist because the pool vocabulary and the item vocabulary were two
 * different sets of strings, and the whole forage -> cast loop was severed if
 * anything ever conflated them. `screen-specs.json` now authors `item_id`
 * strings directly, so section 10 below characterizes the CLOSED state — full
 * overlap, identity join — rather than the split. Section 13's "lossless
 * re-join" tests stay: the re-join still runs on every render (identity or
 * not), and still must not drop or double-count anything.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Forage } from "../../src/world/Forage";
import { Inventory } from "../../src/world/Inventory";
import { itemForPool, poolForItem } from "../../src/world/foragePoolToItem";
import { effectiveSatchel } from "../../src/world/SatchelLedger";
import type { ItemRecord } from "../../src/magic/types";
import type { Graph } from "@lantern/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const pub = path.resolve(here, "..", "..", "public");
const read = <T>(...p: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(pub, ...p), "utf8")) as T;

const graph = read<Graph>("story", "graph.json");
const items = read<ItemRecord[]>("content", "items.json");
const itemIds = new Set(items.map((i) => i.item_id));

/**
 * Every pool name any screen spec authorises. No mode-2 additions layered on
 * top any more — `collectExtraForage.ts` is deleted (Task 3, T19,
 * 2026-08-24): T4's "ash" and F7/F8's "ore" are real, authored `forage`
 * entries now (as `item_ash` and `key_raw_ore`), so `graph.screens[].forage`
 * is the whole, complete list on its own.
 */
const authoredPools = [...new Set((graph.screens ?? []).flatMap((s) => s.forage ?? []))].sort();

// ---------------------------------------------------------------------------
// 10. Pool names and item ids are ONE vocabulary now (GAPS.md G13 CLOSED,
//     Roc 2026-08-23 — Task 1, T19). `screen-specs.json` authors `item_id`
//     strings directly in every `forage` array; `foragePoolToItem.ts` is an
//     identity shim kept only so call sites stay untouched during freeze
//     week. This section used to characterize the SPLIT; it now
//     characterizes the CLOSURE, so a future accidental re-split shows up
//     here first.
// ---------------------------------------------------------------------------

describe("10 — pool names ARE item ids (the two-vocabularies hazard is closed)", () => {
  it("every authored pool name IS a real item_id or key_item_id", () => {
    // The inverted fact, on purpose: G13 open meant zero overlap was correct;
    // G13 closed means FULL overlap is correct. `key_raw_ore` keys on
    // `key_item_id` (G10) and so is not in items.json — read both records.
    const keyItems = read<{ key_item_id: string }[]>("content", "key-items.json");
    const keyItemIds = new Set(keyItems.map((k) => k.key_item_id));
    const unrecognised = authoredPools.filter((p) => !itemIds.has(p) && !keyItemIds.has(p));
    expect(unrecognised).toEqual([]);
  });

  it("the join is the identity function in both directions", () => {
    for (const id of itemIds) {
      expect(itemForPool(id)).toBe(id);
      expect(poolForItem(id)).toBe(id);
    }
  });

  it("keeps the pool name in `ForageSlot.item`, and it is now the item id", () => {
    // `Forage` is still the producer of whatever string `screen-specs.json`
    // authors — it has no idea items exist, same as before (`Forage.ts`'s own
    // comment). What changed is what that string IS, not what `Forage` does
    // with it.
    const f = new Forage(graph);
    for (const screen of (graph.screens ?? []).map((s) => s.screen_id)) {
      for (const slot of f.offer(screen, 1, "morning")) {
        expect(f.poolFor(screen)).toContain(slot.item);
        expect(itemIds.has(slot.item) || slot.item === "key_raw_ore").toBe(true);
        // The slot id is scoped to screen+day+block+pool name — still holds,
        // regardless of what vocabulary the pool name is in.
        expect(slot.slotId.endsWith(slot.item)).toBe(true);
      }
    }
  });

  it("resolves every authored pool name to itself, nothing left unjoined", () => {
    const unjoined = authoredPools.filter((p) => itemForPool(p) !== p);
    expect(unjoined).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 11. A consumed count never exceeds what is held
// ---------------------------------------------------------------------------

/**
 * WAS a verbatim transcription of `CollectScene.effectiveSatchel()`, because a
 * private method inside a Phaser scene cannot be imported into vitest.
 *
 * Wave 1 extracted it to `src/world/SatchelLedger.ts`, so per this file's own
 * header the transcription is deleted and the REAL implementation is what the
 * assertions below run against. `CollectScene.effectiveSatchel` now delegates to
 * the same function, so the two cannot drift apart again.
 *
 * Not one assertion below changed.
 */
function effectiveSatchelToday(inventory: Inventory, rawSatchel: string[]): string[] {
  return effectiveSatchel(inventory, rawSatchel);
}

/** Mode 2's posture: possession matters, so nothing is free. */
const collectInventory = () => new Inventory(items, { includeAlwaysAvailable: false });

describe("11 — a consumed count never exceeds what is held", () => {
  it("counts one spend per landed cast that actually took the item", () => {
    const inv = collectInventory();
    inv.give("item_river_stone");
    expect(inv.consumedCountOf("item_river_stone")).toBe(0);
    inv.applyCast("F2", ["item_river_stone"], []);
    expect(inv.consumedCountOf("item_river_stone")).toBe(1);
    expect(inv.availableOn("F2")).not.toContain("item_river_stone");
  });

  it("clamps down to what the real satchel still shows, and never up", () => {
    const inv = collectInventory();
    inv.give("item_river_stone");
    inv.applyCast("F2", ["item_river_stone"], []);
    expect(inv.consumedCountOf("item_river_stone")).toBe(1);

    // A ledger that outran the display is corrected down.
    inv.clampConsumedCount("item_river_stone", 0);
    expect(inv.consumedCountOf("item_river_stone")).toBe(0);

    // ...but a generous clamp never invents spends. This is the guard that
    // stops a stale count hiding a freshly-foraged item on a later day.
    inv.applyCast("F2", ["item_river_stone"], []);
    inv.clampConsumedCount("item_river_stone", 99);
    expect(inv.consumedCountOf("item_river_stone")).toBe(1);
  });

  it("never hides more satchel entries than are there", () => {
    // The invariant stated as the ledger's whole job: hidden = min(spent, held).
    const inv = collectInventory();
    inv.give("item_river_stone");
    inv.applyCast("F2", ["item_river_stone"], []);
    inv.give("item_river_stone");
    inv.applyCast("F2", ["item_river_stone"], []);
    expect(inv.consumedCountOf("item_river_stone")).toBe(2);

    // Ink's satchel only ever shows one. Two spends cannot hide two entries.
    expect(effectiveSatchelToday(inv, ["item_river_stone"])).toEqual([]);
    // ...and the ledger has been corrected down by the clamp inside it.
    expect(inv.consumedCountOf("item_river_stone")).toBe(1);
  });

  it("leaves unspent duplicates visible", () => {
    const inv = collectInventory();
    inv.give("item_river_stone");
    inv.applyCast("F2", ["item_river_stone"], []);
    expect(
      effectiveSatchelToday(inv, ["item_river_stone", "item_river_stone", "item_berry"]),
    ).toEqual(["item_river_stone", "item_berry"]);
  });

  it("passes through a string with no consumed-count entry rather than dropping it", () => {
    // Honest failure mode, restated post-reconciliation: `itemForPool` is now
    // an identity, so nothing ever fails to "join" — but an id the ledger has
    // never seen a cast for still has `consumedCountOf === 0`, so it is never
    // hidden. The branch that used to catch an unjoined pool name now catches
    // this instead; the pass-through behaviour is unchanged.
    const inv = collectInventory();
    expect(effectiveSatchelToday(inv, ["item_nobody_has_cast_with"])).toEqual([
      "item_nobody_has_cast_with",
    ]);
  });
});

// ---------------------------------------------------------------------------
// 12. A produced item lands in the correct screen bucket
// ---------------------------------------------------------------------------

describe("12 — a produced item lands in the right bucket", () => {
  it("puts a `world` item on the screen it was cast on, and nowhere else", () => {
    const inv = collectInventory();
    inv.applyCast("F2", [], ["item_flame"]);
    expect(inv.worldItemsOn("F2")).toEqual(["item_flame"]);
    expect(inv.worldItemsOn("F1")).toEqual([]);
    // A world item is castable-from where it is...
    expect(inv.availableOn("F2")).toContain("item_flame");
    // ...and reaches nothing anywhere else.
    expect(inv.availableOn("F1")).not.toContain("item_flame");
    // It was never pocketed, so it is not "discovered" either.
    expect(inv.discoveredIds()).not.toContain("item_flame");
  });

  it("puts a pocketable produced item in the pack, on no screen", () => {
    const inv = collectInventory();
    inv.applyCast("F2", [], ["item_river_stone"]);
    expect(inv.worldItemsOn("F2")).toEqual([]);
    expect(inv.availableOn(null)).toContain("item_river_stone");
    expect(inv.discoveredIds()).toContain("item_river_stone");
  });

  it("drops a world item with nowhere to land rather than pocketing it", () => {
    // Cast with no current screen. `item_flame` is `persistence: "world"`, so
    // the one thing that must never happen is it ending up in the pack.
    const inv = collectInventory();
    inv.applyCast(null, [], ["item_flame"]);
    expect(inv.availableOn(null)).not.toContain("item_flame");
    expect(inv.discoveredIds()).not.toContain("item_flame");
  });

  it("spends a world item off the screen, not out of the pack", () => {
    const inv = collectInventory();
    inv.applyCast("F2", [], ["item_flame"]);
    inv.applyCast("F2", ["item_flame"], []);
    expect(inv.worldItemsOn("F2")).toEqual([]);
    // World spends are not part of the satchel ledger — they were never in it.
    expect(inv.consumedCountOf("item_flame")).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 13. Re-joining pool names to item ids neither double-counts nor drops
// ---------------------------------------------------------------------------

describe("13 — the re-join is lossless in both directions", () => {
  it("maps n pool names to exactly n item ids (identity, post-reconciliation)", () => {
    const satchel = ["item_river_stone", "item_berry", "item_river_stone", "item_sticks"];
    const joined = satchel.map(itemForPool);
    expect(joined).toEqual(satchel);
    expect(joined.filter(Boolean).length).toBe(satchel.length);
  });

  it("does not double-count a re-join run twice — `give` is idempotent", () => {
    // `syncInventory` re-runs on every render, so the join is applied many
    // times per second. Held-ness is a Set, so a second pass adds nothing.
    const inv = collectInventory();
    const satchel = ["item_river_stone", "item_river_stone", "item_berry"];
    for (let pass = 0; pass < 3; pass++) {
      for (const pool of satchel) {
        const id = itemForPool(pool);
        if (id) inv.give(id);
      }
    }
    expect(inv.availableOn(null).filter((i) => i === "item_river_stone").length).toBe(1);
    expect(inv.discoveredIds().sort()).toEqual(["item_berry", "item_river_stone"]);
  });

  it("drops nothing when the satchel, arms and bank are joined together", () => {
    // `syncInventory` feeds effectiveSatchel + arms + banked through the join.
    // Every joinable name must arrive; nothing may be swallowed by dedupe on
    // the way in, because `discoveredIds` is what the Home Hub decorates from.
    const inv = collectInventory();
    const sources = {
      satchel: ["item_river_stone", "item_berry"],
      arms: ["item_wool"],
      banked: ["item_feather", "item_grass"],
    };
    for (const pool of [...sources.satchel, ...sources.arms, ...sources.banked]) {
      const id = itemForPool(pool);
      if (id) inv.give(id);
    }
    expect(inv.discoveredIds().sort()).toEqual([
      "item_berry",
      "item_feather",
      "item_grass",
      "item_river_stone",
      "item_wool",
    ]);
  });

  it("is one-to-one BY CONSTRUCTION now, not contingently — the join is `f(x) = x`", () => {
    // Before the reconciliation, `FORAGE_POOL_TO_ITEM` was an authored,
    // many-to-one-capable table that HAPPENED to be one-to-one — a fact that
    // could break on the next authored entry, which is why this test existed.
    // `itemForPool`/`poolForItem` are now the identity function, so
    // one-to-one is no longer contingent: nothing can ever collide with an
    // identity map short of two different inputs being the same string.
    for (const id of authoredPools) expect(itemForPool(id)).toBe(id);
    expect(new Set(authoredPools.map(itemForPool)).size).toBe(authoredPools.length);
  });
});
