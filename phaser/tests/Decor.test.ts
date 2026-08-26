import { beforeEach, describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Decor } from "../src/world/Decor";
import type { ItemRecord } from "../src/magic/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(here, "..", p), "utf8"));

// Decor persists through localStorage; vitest runs in node, so stub it.
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

beforeEach(() => store.clear());

describe("placement", () => {
  it("snaps to the grid and keeps positions as fractions", () => {
    const d = new Decor("home");
    const p = d.place("item_river_stone", 0.3337, 0.4441)!;
    expect(p.x).toBeCloseTo(Decor.snap(0.3337), 6);
    // Fractions, not pixels — so a placement survives any canvas size.
    expect(p.x).toBeGreaterThan(0);
    expect(p.x).toBeLessThan(1);
  });

  it("lets the same item be placed more than once", () => {
    const d = new Decor("home");
    const a = d.place("item_feather", 0.2, 0.2)!;
    const b = d.place("item_feather", 0.6, 0.5)!;
    expect(a.uid).not.toBe(b.uid);
    expect(d.all()).toHaveLength(2);
  });

  it("survives a reload", () => {
    const d = new Decor("home");
    d.place("item_berry", 0.4, 0.4);
    expect(new Decor("home").all()).toHaveLength(1);
  });
});

describe("the two hub spaces", () => {
  it("empties the in-game home on a new life", () => {
    // gdd/08-levels.md — "It resets empty at the start of each new life."
    const d = new Decor("home");
    d.place("item_berry", 0.4, 0.4);
    d.resetForNewLife();
    expect(d.all()).toHaveLength(0);
  });

  it("makes meta-hub pieces display-only", () => {
    // gdd/08-levels.md — "display-only — never withdrawable into play."
    const d = new Decor("home");
    const p = d.place("item_berry", 0.4, 0.4)!;
    d.setMode("meta");
    expect(d.editable).toBe(false);

    d.place("item_feather", 0.7, 0.7);
    expect(d.all()).toHaveLength(1);

    d.moveTo(p.uid, 0.9, 0.9);
    expect(d.all()[0].x).not.toBeCloseTo(0.9, 3);

    d.remove(p.uid);
    expect(d.all()).toHaveLength(1);
  });
});

describe("what there is to decorate with", () => {
  const items = read("public/content/items.json") as ItemRecord[];
  const rawKeys = read("public/content/key-items.json") as Record<string, unknown>[];

  it("keeps every decoration category in key-items, not items", () => {
    // Not a defect — gdd/05-collectibles.md says the empty categories are
    // "filled top-down by key items instead". Asserted so the split is
    // explicit rather than a surprise to the next consumer.
    const itemCats = new Set(items.map((i) => i.category));
    expect(itemCats).toEqual(new Set(["component", "sound"]));
    const keyCats = new Set(rawKeys.map((k) => k.category));
    // "material" added 2026-08-13 (Roc's gate, key_raw_ore) — a seventh
    // category, raw crafting material distinct from `component` (spell
    // ingredient) and `made` (Make output). See content/key-items/_index.md.
    expect(keyCats).toEqual(new Set(["memento", "gift", "tool", "material"]));
  });

  it("G10 — key items key on key_item_id and carry no collectible flag", () => {
    // The silent-drop trap. When the schemas align this test should fail, and
    // that is the signal to delete normalizeKeyItem in loadRun.ts.
    for (const k of rawKeys) {
      expect(k.key_item_id).toBeTypeOf("string");
      expect(k.item_id).toBeUndefined();
      expect(k.collectible).toBeUndefined();
    }
  });

  it("G11 — key-item descriptions are prose, not labels", () => {
    // Items read as labels; key items read as sentences. Anything rendering a
    // key item on a chip needs a short display name that does not exist yet.
    const itemMax = Math.max(...items.map((i) => i.description.length));
    const keyMax = Math.max(...rawKeys.map((k) => String(k.description).length));
    expect(itemMax).toBeLessThanOrEqual(20);
    expect(keyMax).toBeGreaterThan(60);
    expect(rawKeys.some((k) => String(k.description).includes(","))).toBe(true);
  });
});

describe("banked stock", () => {
  it("has no stock model at all when no banked list is given — the old sandbox", () => {
    const d = new Decor("home");
    expect(d.stockLimited).toBe(false);
    expect(d.remaining("item_feather")).toBe(Infinity);
  });

  it("counts duplicates in the banked list as separate copies", () => {
    const d = new Decor("home", undefined, ["item_feather", "item_feather", "item_river_stone"]);
    expect(d.stockLimited).toBe(true);
    expect(d.bankedTotal("item_feather")).toBe(2);
    expect(d.bankedTotal("item_river_stone")).toBe(1);
    expect(d.bankedTotal("item_never_banked")).toBe(0);
  });

  it("draws down as pieces are placed and hands the copy back when one is removed", () => {
    const d = new Decor("home", undefined, ["item_feather", "item_feather"]);
    expect(d.remaining("item_feather")).toBe(2);
    const a = d.place("item_feather", 0.2, 0.2)!;
    expect(d.remaining("item_feather")).toBe(1);
    d.place("item_feather", 0.6, 0.5);
    expect(d.remaining("item_feather")).toBe(0);
    // Derived, not stored: removing returns the copy with no second counter
    // to keep in step.
    d.remove(a.uid);
    expect(d.remaining("item_feather")).toBe(1);
  });

  it("never reports negative stock when placements outrun the bank", () => {
    // The `__hub` debug handle and the unit tests place straight through
    // `place()`, which stays permissive on purpose — the palette is what
    // gates. So over-placing is reachable and must clamp, not go negative.
    const d = new Decor("home", undefined, ["item_feather"]);
    d.place("item_feather", 0.2, 0.2);
    d.place("item_feather", 0.4, 0.2);
    expect(d.placedCount("item_feather")).toBe(2);
    expect(d.remaining("item_feather")).toBe(0);
  });

  it("keeps place() permissive so the debug handle and tests are unaffected", () => {
    const d = new Decor("home", undefined, []);
    expect(d.place("item_feather", 0.2, 0.2)).not.toBeNull();
  });
});
