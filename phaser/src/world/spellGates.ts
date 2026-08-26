/**
 * The join from a cast to the gate it clears.
 *
 * THIS IS PROBE-LOCAL AND PROVISIONAL. It does not live in `content/magic/`
 * and no content record is edited to create it, because the schema change that
 * would make it real is Roc's call during content-freeze week.
 *
 * It exists because the join is currently broken. `ignite.json` says:
 *
 *     "unlocks": { "screen": "Forest Unlock 1", ... }
 *
 * and no screen has that id or that name — the forest screens are F4 "The Still
 * Pool", F5 "Old-Growth Hollow", F7 "The Cave", F8 "Heart of the Wood". It is a
 * GDD-era label (`gdd/08-levels.md`'s "Unlock 1 — a path cleared by a spell")
 * that was never minted as a screen. This is a third instance of **GP-106**
 * (content `source_locations` vs screen ids are different vocabularies), which
 * the 2026-08-11 Unreal plan already flags as live.
 *
 * THE REAL FIX: spell records gain `unlocks.gate_id` keyed to the ids the graph
 * already uses (`G-F7-light`), replacing the prose screen label. Then this file
 * is deleted and the join is read straight off the content, where it belongs.
 *
 * Every entry below is a PROPOSAL to be reviewed, not a ruling. Each cites the
 * gate's own authored description as the reason.
 */

/** spell_id -> gate ids that a successful cast on the right receiver clears. */
export const PROPOSED_SPELL_GATES: Record<string, string[]> = {
  // G-F7-light: "light-source knowledge-key". ignite is the game's light
  // source and the only spell that produces item_flame.
  ignite: ["G-F7-light"],
  // G-F7-light again: glimmer is the other light-bearing spell (river stone).
  // Listed so the probe can show a gate with more than one satisfying cast.
  glimmer: ["G-F7-light"],
};

/**
 * Gates that NO approved spell can currently clear, with why.
 *
 * Surfaced rather than silently ignored: this is the work-list that decides
 * whether the forest is traversable at all once locks are enforced.
 */
export const UNSATISFIABLE_NOTES: Record<string, string> = {
  "G-F4-still":
    "Keyed to the phrase 'still the water', but `still` was REJECTED at the " +
    "2026-08-05 gate. No approved spell satisfies it.",
  "G-F5-cascade":
    "A Teledahn-style chokepoint — 'one insight lights up F6 + F7 at once'. " +
    "Authored as an insight, not as a spell; needs a decision on what clears it.",
  "G-F8-combine":
    "A Laki combine — 'two fragments, neither sufficient alone'. Item-based, " +
    "not spell-based.",
  "G-F6-cipher": "Traveler archetype (G2). Not spell-bearing.",
  "G-F6-night": "Knowledge archetype (G4) — time-of-day, not a cast.",
};
