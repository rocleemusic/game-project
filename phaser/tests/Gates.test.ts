import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Gates, parseLock } from "../src/world/Gates";
import { PROPOSED_SPELL_GATES } from "../src/world/spellGates";
import type { Graph } from "../../tools/lantern/src/types";
import type { SpellRecord } from "../src/magic/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(here, "..", p), "utf8"));

const graph = read("public/story/graph.json") as Graph;
const spells = read("public/content/magic.json") as SpellRecord[];
const gates = () => new Gates(graph);

describe("reading locks off the graph", () => {
  it("parses a single- and multi-gate lock", () => {
    expect(parseLock("locked(G-F4-still)")).toEqual(["G-F4-still"]);
    expect(parseLock("locked(G-F5-cascade, G-F7-light)")).toEqual([
      "G-F5-cascade",
      "G-F7-light",
    ]);
    expect(parseLock("start")).toEqual([]);
    expect(parseLock(undefined)).toEqual([]);
  });

  it("finds every locked screen", () => {
    // T4 dropped 2026-08-13 (Roc): the Workshop's recipe-lock was rescinded.
    // F4 dropped: the F4 gate was cut (plan 2026-08-19) — The Still Pool's
    // status went `reachable`, so G-F4-still no longer locks a screen.
    const g = gates();
    expect([...g.requirements.keys()].sort()).toEqual([
      "F5",
      "F6",
      "F7",
      "F8",
      "T5",
      "T6",
    ]);
  });

  it("resolves a `[Go to <name>]` choice to the gates blocking it", () => {
    const g = gates();
    // Ink writes the display NAME; the graph keys on id. This join is the one
    // GP-106 is about, and it works for names that were actually minted.
    // Cave-only ruling (Roc, 2026-08-18): F7 dropped G-F5-cascade and now needs
    // just G-F7-light, which glimmer clears.
    expect(g.blockingForMoveText("[Go to The Cave]")).toEqual({
      screenId: "F7",
      gates: ["G-F7-light"],
    });
    // An unlocked destination blocks nothing.
    expect(g.blockingForMoveText("[Go to Forager's Clearing]")).toBeNull();
  });

  it("stops blocking once every gate is cleared", () => {
    const g = gates();
    expect(g.blocking("F7")).toEqual(["G-F7-light"]);
    g.clear("G-F7-light");
    expect(g.blocking("F7")).toEqual([]);
    expect(g.blockingForMoveText("[Go to The Cave]")).toBeNull();
  });
});

describe("what casting can actually open", () => {
  it("only proposes gates that exist in the graph", () => {
    const g = gates();
    const real = new Set([...g.requirements.values()].flatMap((r) => r.gateIds));
    for (const proposed of Object.values(PROPOSED_SPELL_GATES).flat()) {
      expect(real.has(proposed)).toBe(true);
    }
  });

  it("only proposes spells that were approved", () => {
    const approved = new Set(spells.map((s) => s.spell_id));
    for (const id of Object.keys(PROPOSED_SPELL_GATES)) {
      expect(approved.has(id)).toBe(true);
    }
  });

  /**
   * The scope finding, pinned as a test so it cannot drift unnoticed.
   *
   * If the locks ink advertises were enforced today, 5 of 20 screens would be
   * unreachable. This asserts the CURRENT state so that fixing it fails the test
   * loudly and someone updates the number.
   * (Was 8 before 2026-08-13 — T4's recipe-lock was rescinded, Roc. Was 7 before
   * 2026-08-18 — the Cave/F7 dropped G-F5-cascade and now needs only G-F7-light,
   * which glimmer clears, so F7 is no longer stranded. Was 6 before the F4 gate
   * cut, plan 2026-08-19 — F4/The Still Pool went `reachable`.)
   */
  it("records that enforcing locks today would strand 5 screens", () => {
    const g = gates();
    const clearable = new Set(Object.values(PROPOSED_SPELL_GATES).flat());
    const stranded = [...g.requirements.values()]
      .filter((r) => r.gateIds.some((id) => !clearable.has(id)))
      .map((r) => r.screenId)
      .sort();
    // Was 6 before the F4 gate cut (plan 2026-08-19) — F4 went `reachable`.
    expect(stranded).toEqual(["F5", "F6", "F8", "T5", "T6"]);
  });

  it("still has a dangling unlock target on ignite", () => {
    // `unlocks.screen` is "Forest Unlock 1", a GDD-era label that was never
    // minted as a screen. When the schema gains `unlocks.gate_id` this test
    // should start failing — that is the signal to delete spellGates.ts.
    const names = new Set((graph.screens ?? []).map((s) => s.name));
    const ids = new Set((graph.screens ?? []).map((s) => s.screen_id));
    const ignite = spells.find((s) => s.spell_id === "ignite")!;
    const target = ignite.unlocks.screen!;
    expect(names.has(target) || ids.has(target)).toBe(false);
  });
});
