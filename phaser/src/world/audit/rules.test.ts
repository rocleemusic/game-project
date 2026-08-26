/**
 * Every rule is proven to FIRE, not only to stay quiet.
 *
 * An audit is the one kind of code where a green run is ambiguous: "nothing is
 * orphaned" and "the rule stopped working" produce identical output. So the
 * suite starts from a fixture where every join is sound, asserts it reports
 * NOTHING, and then breaks exactly one join per test and asserts exactly one
 * rule fires. A rule that quietly stopped matching fails here immediately.
 *
 * The fixture is tiny and synthetic on purpose. Testing against the real
 * content would mean the expectations change whenever Roc authors a spell, and
 * the audit's own behaviour would be untestable from the day the content is
 * clean. The real content is what `npm run orphans` reads; this is what proves
 * the rules mean what they say.
 */

import { describe, expect, it } from "vitest";
import { audit, lockedGateIds, type AuditInput, type AuditRuleId } from "./rules";
import { formatReport, REPORT_ORDER } from "./report";

/** Every join sound. Each test breaks one thing and only one thing. */
function clean(): AuditInput {
  return {
    spells: [
      {
        spell_id: "burn",
        status: "approved",
        components: ["item_twig"],
        produces: [],
        unlocks: { screen: "S2" },
        receivers: [{ receiver_class: "inert", receiver_id: "hedge" }],
      },
    ],
    items: [
      {
        item_id: "item_twig",
        category: "component",
        always_available: false,
        produced_by: [],
        source_locations: ["S1"],
      },
    ],
    keyItems: [{ key_item_id: "key_x", category: "memento" }],
    screens: [
      { screen_id: "S1", name: "The Yard", status: "start", forage: ["twigs"], examinables: [{ id: "hedge" }] },
      { screen_id: "S2", name: "The Cave", status: "locked(G-1)" },
    ],
    scenes: [{ scene_id: "SC-1", soul: "ann", screen_id: "S1" }],
    placements: [{ soul: "ann", screen_id: "S1" }],
    foragePoolToItem: { twigs: "item_twig" },
    extraForagePools: {},
    npcGiftItems: [],
    gateRules: { "G-1": { kind: "cast", spellId: "burn", receiverId: "hedge" } },
    decorationCategories: ["component", "memento"],
  };
}

/** The rule ids a mutated input reports, deduped. */
function fired(input: AuditInput): AuditRuleId[] {
  return [...new Set(audit(input).findings.map((f) => f.rule))].sort();
}

describe("content audit — the clean baseline", () => {
  it("reports nothing when every join is sound", () => {
    const result = audit(clean());
    expect(result.findings).toEqual([]);
    expect(result.unchecked).toEqual([]);
  });

  it("runs every rule the report knows how to print", () => {
    // Guards the other direction from `RULE_INFO`'s compile-time exhaustiveness:
    // a rule that runs but has no report entry would vanish from the output.
    expect([...audit(clean()).ran].sort()).toEqual([...REPORT_ORDER].sort());
  });

  it("reads gate ids only out of a `locked(...)` status", () => {
    expect(lockedGateIds("locked(G-F5-cascade, G-F7-light)")).toEqual([
      "G-F5-cascade",
      "G-F7-light",
    ]);
    // `reachable(G-T8-cipher)` is not a lock, and `start` is not a gate.
    expect(lockedGateIds("reachable(G-T8-cipher)")).toEqual([]);
    expect(lockedGateIds("start")).toEqual([]);
    expect(lockedGateIds(undefined)).toEqual([]);
  });
});

describe("content audit — every rule fires when its join breaks", () => {
  it("gate-unclearable — a locked screen with no rule (GAPS G6)", () => {
    expect(fired({ ...clean(), gateRules: {} })).toEqual(["gate-unclearable"]);
  });

  it("gate-rule-unknown-spell — a rule naming a spell with no record", () => {
    const input = { ...clean(), gateRules: { "G-1": { kind: "cast", spellId: "nope" } } };
    expect(fired(input)).toEqual(["gate-rule-unknown-spell"]);
  });

  it("gate-rule-rejected-spell — a gate keyed to a rejected spell (GAPS G5)", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      spells: [...base.spells, { spell_id: "still", status: "rejected" }],
      gateRules: { "G-1": { kind: "cast", spellId: "still" } },
    };
    expect(fired(input)).toEqual(["gate-rule-rejected-spell"]);
  });

  it("gate-rule-unknown-receiver — a chain step naming an unauthored receiver", () => {
    // BOTH rules fire, and that is correct: a receiver nobody authors is also,
    // necessarily, a spell x receiver pair nobody authored. They are not
    // redundant — the pair rule catches cases this one cannot, where the
    // receiver DOES exist but not on the spell the step names.
    const input: AuditInput = {
      ...clean(),
      gateRules: {
        "G-1": { kind: "chain", steps: [{ spellId: "burn", receiverId: "stone_wall" }] },
      },
    };
    expect(fired(input).sort()).toEqual([
      "gate-rule-unauthored-pair",
      "gate-rule-unknown-receiver",
    ]);
  });

  it("gate-rule-unauthored-pair — receiver exists, but not on the spell the step names", () => {
    // THE CASE THE OTHER THREE GATE RULES ALL MISS, and the reason this rule
    // exists. Measured on real content 2026-08-17: G-F4-still needs
    // "ignite x river_stone". ignite is approved, river_stone is authored (by
    // waft), so unknown-spell, rejected-spell and unknown-receiver all report
    // ok — while the cast can never land, because that PAIR is not authored.
    const base = clean();
    const input: AuditInput = {
      ...base,
      // waft authors river_stone, so the receiver is NOT unknown. But the step
      // asks for it on `burn`, and burn x river_stone was never authored.
      spells: [
        ...base.spells,
        {
          spell_id: "waft",
          status: "approved",
          receivers: [{ receiver_class: "inert", receiver_id: "river_stone" }],
        },
      ],
      gateRules: {
        "G-1": { kind: "chain", steps: [{ spellId: "burn", receiverId: "river_stone" }] },
      },
    };
    // Asserted as "which GATE rules fired", not as the whole list: adding a
    // spell to the fixture also orphans it under the unrelated content rules,
    // and those are not what this test is about.
    const gateRulesFired = fired(input).filter((r) => r.startsWith("gate-"));
    expect(gateRulesFired).toEqual(["gate-rule-unauthored-pair"]);
  });

  it("spell-components-unco-located — two components, no screen carries both (T19 regression)", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      spells: [{ ...base.spells[0], components: ["item_twig", "item_pebble"] }],
      items: [
        ...base.items,
        { item_id: "item_pebble", category: "component", always_available: false, produced_by: [] },
      ],
      // item_pebble forages only from a SECOND screen — S1 alone never carries
      // both components, which is exactly the original defect (fetch/steep/
      // temper/waft each stranded across two single-item screens).
      screens: [
        base.screens[0],
        { screen_id: "S3", name: "The Quarry", status: "start", forage: ["pebbles"] },
        base.screens[1],
      ],
      foragePoolToItem: { ...base.foragePoolToItem, pebbles: "item_pebble" },
    };
    // item_pebble also has no other source, so item-unobtainable does NOT
    // fire — it forages fine, just never alongside item_twig.
    expect(fired(input)).toEqual(["spell-components-unco-located"]);
  });

  it("spell-components-unco-located — a free component never blocks co-location", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      // leap's real shape: one component, always_available, produced by
      // nothing this fixture authors. Trivial pass, same as production leap.
      spells: [{ ...base.spells[0], components: ["item_ember"] }],
      items: [
        ...base.items,
        { item_id: "item_ember", category: "component", always_available: true, produced_by: [] },
      ],
    };
    expect(fired(input)).not.toContain("spell-components-unco-located");
  });

  it("forage-pool-unjoined — a pool that is not an item_id (GAPS G13)", () => {
    const input = { ...clean(), foragePoolToItem: {} };
    // The item loses its only source at the same time, by construction — and
    // with the join broken, burn's sole (non-free) component can no longer be
    // found co-located on any screen either (T19's `spell-components-
    // unco-located` reads screen offerings through this same join), so all
    // three fire together. Not redundant: each answers a different question
    // about the same broken join.
    expect(fired(input)).toEqual([
      "forage-pool-unjoined",
      "item-unobtainable",
      "spell-components-unco-located",
    ]);
  });

  it("item-unobtainable — nothing in the world can hand it over", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      items: [...base.items, { item_id: "item_ghost", category: "component", produced_by: [] }],
    };
    expect(fired(input)).toEqual(["item-unobtainable", "item-unused"]);
  });

  it("item-behind-its-own-lock — forages only from a locked screen", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      screens: [{ ...base.screens[0], status: "locked(G-1)" }, base.screens[1]],
    };
    expect(fired(input)).toEqual(["item-behind-its-own-lock"]);
  });

  it("item-unused — no approved spell consumes it", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      spells: [{ ...base.spells[0], components: [] }],
    };
    expect(fired(input)).toEqual(["item-unused"]);
  });

  it("spell-no-placed-receiver — the spell can be known and cast on nothing (G2)", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      screens: [{ ...base.screens[0], examinables: [] }, base.screens[1]],
    };
    expect(fired(input)).toEqual(["receiver-unplaced", "spell-no-placed-receiver"]);
  });

  it("a soul receiver counts as placed, because the day files place souls", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      screens: [{ ...base.screens[0], examinables: [] }, base.screens[1]],
      spells: [
        {
          ...base.spells[0],
          receivers: [
            { receiver_class: "inert", receiver_id: "hedge" },
            { receiver_class: "soul", receiver_id: "ann" },
          ],
        },
      ],
    };
    // The hedge is still homeless; the spell is not, because Ann is somewhere.
    expect(fired(input)).toEqual(["receiver-unplaced"]);
  });

  it("spell-unlocks-nothing — unlocks.screen matches no screen (GAPS G1)", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      spells: [{ ...base.spells[0], unlocks: { screen: "Forest Unlock 1" } }],
    };
    expect(fired(input)).toEqual(["spell-unlocks-nothing"]);
  });

  it("key-item-uncategorised — a category no decoration surface knows (G10)", () => {
    const input: AuditInput = { ...clean(), keyItems: [{ key_item_id: "key_x", category: "material" }] };
    expect(fired(input)).toEqual(["key-item-uncategorised"]);
  });

  it("item-source-not-a-screen — a prose place name (GP-106)", () => {
    const base = clean();
    const input: AuditInput = {
      ...base,
      items: [{ ...base.items[0], source_locations: ["Forest Unlock 2"] }],
    };
    expect(fired(input)).toEqual(["item-source-not-a-screen"]);
  });

  it("scene-never-placed — a scene where its soul never stands (G15)", () => {
    const input: AuditInput = { ...clean(), placements: [{ soul: "ann", screen_id: "S2" }] };
    expect(fired(input)).toEqual(["scene-never-placed"]);
  });
});

describe("content audit — what could not be checked is said out loud", () => {
  it("a missing gateRules.json is unchecked, never assumed clean", () => {
    const result = audit({ ...clean(), gateRules: null });
    expect(result.unchecked).toHaveLength(1);
    expect(result.unchecked[0]).toContain("gateRules.json");
    // The three reference rules still RAN — over an empty table — so the report
    // must not claim they passed on evidence it does not have.
    expect(result.findings.map((f) => f.rule)).toEqual(["gate-unclearable"]);
  });

  it("no day files means scene reachability is unchecked, not green", () => {
    const result = audit({ ...clean(), placements: [] });
    expect(result.unchecked.join(" ")).toContain("scene reachability");
    expect(result.findings.some((f) => f.rule === "scene-never-placed")).toBe(false);
  });
});

describe("content audit — the report", () => {
  it("prints clean rules as ok, so a silent rule cannot pass for a sound join", () => {
    const text = formatReport(audit(clean()));
    expect(text).toContain("forage-pool-unjoined");
    expect(text).toContain("ok");
    expect(text).toContain("0 orphaned records");
  });

  it("prints unchecked rules under their own heading, above the summary", () => {
    const text = formatReport(audit({ ...clean(), gateRules: null }));
    expect(text.indexOf("NOT CHECKED")).toBeGreaterThan(-1);
    expect(text.indexOf("NOT CHECKED")).toBeLessThan(text.indexOf("summary"));
  });

  it("is byte-identical across runs, so a diff means the content changed", () => {
    expect(formatReport(audit(clean()))).toEqual(formatReport(audit(clean())));
  });
});
