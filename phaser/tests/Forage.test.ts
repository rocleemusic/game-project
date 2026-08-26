import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Forage } from "../src/world/Forage";
import { Knowledge } from "../src/world/Knowledge";
import type { Graph } from "../../tools/lantern/src/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const graph = JSON.parse(
  fs.readFileSync(path.join(here, "..", "public", "story", "graph.json"), "utf8"),
) as Graph;

describe("what is out on a screen", () => {
  it("only offers from the pool the screen spec authored", () => {
    const f = new Forage(graph);
    const pool = f.poolFor("T2");
    expect(pool).toEqual(["item_wool", "item_feather"]);
    for (const slot of f.offer("T2", 1, "morning")) {
      expect(pool).toContain(slot.item);
    }
  });

  it("offers nothing on a screen with no forage pool", () => {
    // The Home Hub is not a forage point (ruled 2026-08-04).
    expect(new Forage(graph).offer("HOME", 1, "morning")).toEqual([]);
  });

  it("varies the spread across visits", () => {
    // "no two visits offer the same spread" — gdd/05-collectibles.md
    const f = new Forage(graph);
    const seen = new Set<string>();
    for (const day of [1, 2, 3, 4, 5]) {
      for (const block of ["morning", "afternoon", "evening"]) {
        seen.add(
          f
            .offer("T2", day, block)
            .map((s) => s.item)
            .sort()
            .join("+"),
        );
      }
    }
    expect(seen.size).toBeGreaterThan(1);
  });

  it("is stable within one visit, so a re-render does not reshuffle", () => {
    const f = new Forage(graph);
    const a = f.offer("T2", 2, "afternoon").map((s) => s.slotId);
    const b = f.offer("T2", 2, "afternoon").map((s) => s.slotId);
    expect(a).toEqual(b);
  });

  it("never randomizes out a guaranteed item", () => {
    // The guardrail that matters more than the randomness: "Randomness sets
    // the day's path, not whether the goal is reachable."
    const f = new Forage(graph, ["item_wool"]);
    for (const day of [1, 2, 3, 4, 5]) {
      for (const block of ["morning", "afternoon", "evening"]) {
        const items = f.offer("T2", day, block).map((s) => s.item);
        expect(items).toContain("item_wool");
      }
    }
  });

  it("always offers something where a pool exists", () => {
    const f = new Forage(graph);
    for (const screen of ["T2", "F1"]) {
      if (!f.poolFor(screen).length) continue;
      for (const day of [1, 2, 3, 4, 5]) {
        expect(f.offer(screen, day, "morning").length).toBeGreaterThan(0);
      }
    }
  });

  it("gives each visit its own slot ids, so a later visit re-offers", () => {
    const f = new Forage(graph);
    const d1 = f.offer("T2", 1, "morning").map((s) => s.slotId);
    const d2 = f.offer("T2", 2, "morning").map((s) => s.slotId);
    expect(d1.some((id) => d2.includes(id))).toBe(false);
  });
});

describe("learning a spell", () => {
  it("separates a confirmed spell from a mere clue", () => {
    // "You learn them by successfully casting them once" — and seeing a cast
    // "gives a clue, not the spell".
    const k = new Knowledge();
    k.see("breath");
    expect(k.knows("breath")).toBe(false);
    expect(k.clues()).toEqual(["breath"]);
    expect(k.spellbook()).toEqual([]);

    k.learn("ignite");
    expect(k.knows("ignite")).toBe(true);
    expect(k.spellbook()).toEqual(["ignite"]);
    // A learned spell stops being a clue.
    expect(k.clues()).toEqual(["breath"]);
  });

  it("promotes a clue once the cast is confirmed", () => {
    const k = new Knowledge();
    k.see("ignite");
    expect(k.clues()).toEqual(["ignite"]);
    k.learn("ignite");
    expect(k.clues()).toEqual([]);
    expect(k.spellbook()).toEqual(["ignite"]);
  });

  it("reports a first learn once", () => {
    const k = new Knowledge();
    expect(k.learn("ignite")).toBe(true);
    expect(k.learn("ignite")).toBe(false);
  });
});
