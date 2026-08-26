import { describe, expect, it } from "vitest";
import { rotatingClueIndex } from "../src/world/hash";

// Ruling (Roc, 2026-08-18): an NPC's offered spell ROTATES BY DAY, so a role
// held by a single soul teaches its whole set across the week rather than
// fixing on one. These pin the coverage property the ruling depends on.

const WEEK = [1, 2, 3, 4, 5];

describe("clue rotation covers a role's whole set across the week", () => {
  it("a 3-spell role offers every spell within the 5-day week", () => {
    const offered = new Set(WEEK.map((d) => rotatingClueIndex("ilsa", d, 3)));
    expect(offered.size).toBe(3);
  });

  it("a 2-spell role offers both spells", () => {
    const offered = new Set(WEEK.map((d) => rotatingClueIndex("toby", d, 2)));
    expect(offered.size).toBe(2);
  });

  it("consecutive days advance the pick, so no run of `count` days repeats", () => {
    for (const soul of ["ilsa", "toby", "pip", "juno", "bex", "mara"]) {
      for (const count of [2, 3]) {
        const window = [1, 2, 3].slice(0, count).map((d) => rotatingClueIndex(soul, d, count));
        expect(new Set(window).size).toBe(count);
      }
    }
  });

  it("is deterministic — same soul, day and count give the same pick (walker stays reproducible)", () => {
    expect(rotatingClueIndex("pip", 2, 3)).toBe(rotatingClueIndex("pip", 2, 3));
  });

  it("a single-spell role is always index 0", () => {
    expect(rotatingClueIndex("mara", 4, 1)).toBe(0);
  });
});
