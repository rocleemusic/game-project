import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SpellRecord } from "../src/magic/types";
import { STARTER_SPELLS } from "../src/magic/starterSpells";
import shippedGraph from "../public/story/graph.json";

// The seed the scene learns at start. Every OTHER approved spell must be
// reachable from the NPC dealt its role (NpcTalkSystem filters `s.role === role`).
// Ruled 2026-08-18 (Roc): the Mage starts knowing their own three spells.

const here = path.dirname(fileURLToPath(import.meta.url));
const content = path.resolve(here, "..", "public", "content");
const spells = JSON.parse(
  fs.readFileSync(path.join(content, "magic.json"), "utf8"),
) as SpellRecord[];
const approved = spells.filter((s) => s.status === "approved");
const byRole = (role: string) => approved.filter((s) => s.role === role);

describe("starter spells are the Mage's own approved set", () => {
  it("every starter is an approved spell", () => {
    const ids = new Set(approved.map((s) => s.spell_id));
    expect(STARTER_SPELLS.every((id) => ids.has(id))).toBe(true);
  });

  it("every starter is a Mage-role spell", () => {
    const mage = new Set(byRole("Mage").map((s) => s.spell_id));
    expect(STARTER_SPELLS.every((id) => mage.has(id))).toBe(true);
  });

  it("the Mage starts knowing all their own spells and nothing else's", () => {
    expect([...STARTER_SPELLS].sort()).toEqual(
      byRole("Mage").map((s) => s.spell_id).sort(),
    );
  });
});

describe("every non-starter approved spell has an NPC teacher", () => {
  const starters = new Set(STARTER_SPELLS);

  it("carries a non-empty role, so a teaching NPC exists", () => {
    const orphanRole = approved
      .filter((s) => !starters.has(s.spell_id))
      .filter((s) => !s.role || s.role.trim() === "");
    expect(orphanRole.map((s) => s.spell_id)).toEqual([]);
  });

  // RULING LANDED (Roc, 2026-08-09; wired 2026-08-24 — Task 5, T19).
  // `NpcTalkSystem.pickNpcSpells` offers one spell per soul per day, chosen by
  // `rotatingClueIndex(soul, day, roleSpells.length)` — it STEPS BY DAY, so a
  // role's whole set surfaces within any `count` consecutive days rather than
  // being stuck on one pick forever. The one-per-soul-per-day limiter was
  // never the gap; the real gap was three ratified role_tags (Farmer, Priest,
  // Postman) never reaching `scene-graph.json`, so those roles had no soul to
  // rotate through at all. Now every non-Mage role among the approved spells
  // is dealt to a soul: bex/Farmer, juno/Priest, pip/Postman join
  // mara/Herbalist, toby/Baker, ilsa/Blacksmith.
  it("every approved spell is start-known or reachable from an NPC dealt its role", () => {
    const dealtRoles = new Set(
      (shippedGraph.souls ?? [])
        .map((s: { role_tag?: string }) => s.role_tag)
        .filter((r: string | undefined): r is string => Boolean(r)),
    );
    const untaught = approved
      .filter((s) => !starters.has(s.spell_id))
      .filter((s) => !dealtRoles.has(s.role));
    expect(untaught.map((s) => s.spell_id)).toEqual([]);
  });
});
