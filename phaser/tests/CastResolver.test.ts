import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MagicDB, resolveCast } from "../src/magic/CastResolver";
import type { ItemRecord, SpellRecord } from "../src/magic/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const content = path.resolve(here, "..", "public", "content");
const read = <T>(f: string): T =>
  JSON.parse(fs.readFileSync(path.join(content, f), "utf8")) as T;

const spells = read<SpellRecord[]>("magic.json");
const items = read<ItemRecord[]>("items.json");
const db = new MagicDB(spells, items);

describe("the content the probe runs on", () => {
  it("loads only approved spells", () => {
    expect(db.spells.length).toBe(16);
    expect(db.spells.every((s) => s.status === "approved")).toBe(true);
  });

  it("carries the authored cast outcomes that are unplayable today", () => {
    const outcomes = db.spells.reduce((n, s) => n + s.receivers.length, 0);
    // 92 = 89 + the three F8 heated-stone receivers (ignite x river_stone,
    // temper x heated_stone, fetch x stone_wall), landed 2026-08-19.
    expect(outcomes).toBe(92);
  });
});

describe("a spell is a phrase PLUS components", () => {
  it("has component sets that more than one spell shares", () => {
    // If this ever returns nothing, the phrase stopped being load-bearing and
    // a component-only casting UI would become buildable. On the shipped
    // content it is river stone: glimmer, portion, weigh.
    const groups = db.ambiguousComponentSets();
    expect(groups.length).toBeGreaterThan(0);
    const riverStone = groups.find((g) =>
      g.every((s) => s.components.length === 1 && s.components[0] === "item_river_stone"),
    );
    expect(riverStone?.map((s) => s.spell_id).sort()).toEqual([
      "glimmer",
      "portion",
      "weigh",
    ]);
  });

  it("resolves the same components to different spells by phrase alone", () => {
    const comps = ["item_river_stone"];
    const a = resolveCast(db, "glimmer", comps, "stick");
    const b = resolveCast(db, "weigh", comps, "stick");
    expect(a.spellId).toBe("glimmer");
    expect(b.spellId).toBe("weigh");
  });
});

describe("ignite, against all seven authored receivers", () => {
  const cast = (receiver: string) =>
    resolveCast(db, "ignite", ["item_sticks"], receiver);

  it("catches on inert material", () => {
    const r = cast("stick");
    expect(r.outcome).toBe("effect");
    expect(r.narration).toMatch(/catches at the tip/i);
  });

  it("clears the hedge and opens the screen it gates", () => {
    const r = cast("dry_hedge");
    expect(r.outcome).toBe("effect");
    expect(r.unlockedScreen).toBe("Forest Unlock 1");
  });

  it("produces a flame — the first spell-to-spell chain link", () => {
    expect(cast("stick").produced).toEqual(["item_flame"]);
  });

  it("does nothing to a creature, and says so honestly", () => {
    const r = cast("cat");
    expect(r.outcome).toBe("no-effect");
    expect(r.narration).toMatch(/no physical effect/i);
    // The reaction is authored and real even though the outcome is nothing.
    expect(r.reaction).toMatch(/startle-flee/i);
  });

  it("does nothing to a soul, with silence where no reaction is authored", () => {
    const ilsa = cast("ilsa");
    expect(ilsa.outcome).toBe("no-effect");
    // null means render nothing at all — not "she does not react".
    expect(ilsa.reaction).toBeNull();

    const toby = cast("toby");
    expect(toby.outcome).toBe("no-effect");
    expect(toby.reaction).toMatch(/deflection/i);
  });

  it("still costs the components when it does nothing", () => {
    // You tried, and trying costs. This is what separates a cast that lands
    // and does nothing from a phrase that never took.
    expect(cast("ilsa").consumed).toEqual(["item_sticks"]);
  });

  it("mints nothing when nothing happened", () => {
    expect(cast("ilsa").produced).toEqual([]);
  });
});

describe("the ignite -> item_flame -> leap chain", () => {
  it("runs entirely through the item layer, with no spell special-casing", () => {
    const ignited = resolveCast(db, "ignite", ["item_sticks"], "stick");
    expect(ignited.produced).toContain("item_flame");

    // leap's components come from the record, not from code that knows about
    // ignite. The chain exists because produces/produced_by agree.
    const leap = db.spell("leap")!;
    expect(leap.components).toEqual(["item_flame"]);

    const flame = db.items.get("item_flame")!;
    expect(flame.persistence).toBe("world");
    expect(flame.collectible).toBe(false);
    expect(flame.produced_by).toContain("ignite");
    expect(flame.used_by).toContain("leap");

    const leapt = resolveCast(db, "leap", ignited.produced, leap.receivers[0].receiver_id);
    expect(leapt.spellId).toBe("leap");
    expect(leapt.outcome).not.toBe("wrong-components");
  });
});

describe("mana shapes quality, never possibility", () => {
  it("returns an identical outcome at both bands for every authored pair", () => {
    let pairs = 0;
    for (const spell of db.spells) {
      for (const receiver of spell.receivers) {
        const low = resolveCast(db, spell.phrase, spell.components, receiver.receiver_id, {
          mana: "baseline",
        });
        const high = resolveCast(db, spell.phrase, spell.components, receiver.receiver_id, {
          mana: "high",
        });
        expect(high.outcome).toBe(low.outcome);
        expect(high.narration).toBe(low.narration);
        expect(high.produced).toEqual(low.produced);
        pairs++;
      }
    }
    // +3 F8 heated-stone receivers (2026-08-19).
    expect(pairs).toBe(92);
  });

  it("adds quality prose at high mana and nothing at baseline", () => {
    const high = resolveCast(db, "ignite", ["item_sticks"], "stick", { mana: "high" });
    const low = resolveCast(db, "ignite", ["item_sticks"], "stick", { mana: "baseline" });
    expect(high.manaNote).toMatch(/bigger, cleaner/i);
    expect(low.manaNote).toBeNull();
  });
});

describe("the honest failures", () => {
  it("rejects an unknown phrase", () => {
    expect(resolveCast(db, "abracadabra", ["item_sticks"], "stick").outcome).toBe(
      "unknown-spell",
    );
  });

  it("rejects a rejected spell's phrase", () => {
    // `bind` is in content/magic but never passed the gate.
    expect(resolveCast(db, "bind", ["item_tree_sap", "item_wool"], "stick").outcome).toBe(
      "unknown-spell",
    );
  });

  it("takes components exactly, not as a subset", () => {
    const r = resolveCast(db, "breath", ["item_grass"], "stick");
    expect(r.outcome).toBe("wrong-components");
    expect(r.missing).toEqual(["item_dirt"]);
  });

  it("spends nothing when the phrase never took", () => {
    const r = resolveCast(db, "breath", ["item_grass"], "stick");
    expect(r.consumed).toEqual([]);
    expect(r.produced).toEqual([]);
  });

  it("names an unauthored receiver as a content gap rather than inventing prose", () => {
    const r = resolveCast(db, "ignite", ["item_sticks"], "a_receiver_nobody_authored");
    expect(r.outcome).toBe("unknown-receiver");
    expect(r.narration).toBe("");
  });
});

describe("the coverage report the narrative crew can act on", () => {
  it("lists which receivers each spell has no authored outcome for", () => {
    const receivers = [...new Set(db.spells.flatMap((s) => s.receivers.map((r) => r.receiver_id)))];
    const gaps = db.receiverCoverageGaps(receivers);
    // Every spell authors ~5-7 of the ~40 distinct receivers, so gaps are the
    // norm, not a defect. The point is that they are enumerable.
    expect(gaps.length).toBeGreaterThan(0);
    expect(receivers.length).toBeGreaterThan(20);
  });
});
