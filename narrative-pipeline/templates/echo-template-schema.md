# echo_template Schema

One template per seed-and-payoff pair, written by the Narrative Architect (§11 Agent 1) in step 4 of `../pipeline.md`. An echo is a mechanical deduction device: a plain detail planted early with a named condition the player must have deduced first. It is a recognition mechanic, never a promise about feeling. There is no emotion field on the template.

**Echo is a technique, not a structure** *(RULED, Roc, 2026-08-03; codified 2026-08-12, GP-86)*. This template records how a seed-and-payoff pair is placed inside scenes that already exist for other reasons — it does not license a new structural unit (a dedicated "echo scene," an echo-only node, an echo field on the scene graph). A seed rides inside `seed_scene`'s ordinary business; a payoff rides inside `payoff_scene`'s. If a seed or payoff ever needs a scene built solely to hold it, that is a sign the technique is being reached for as a structure, which this ruling forbids.

| Field | What it holds |
|---|---|
| `seed_scene` | Where the seed is planted. Sits beside plot-inert business (a chore, a price, a pest), surrounded by non-seed detail so it cannot be told from noise. |
| `seed_event` | The seed itself, under 25 words. Names a thing the player can picture (a worn path, a drafty seat); a vague seed cannot be recognized later. |
| `payoff_scene` | Where the payoff lands. |
| `payoff_condition` | A named deduction the player must already hold. A knowledge flag set by the player's diegetic prove act, never a visit count, never mere exposure. |
| `payoff_voice` / `reveal_npc_id` | The soul who voices the payoff, which may differ from the soul who planted the seed (weight assigned from someone else's attachment). The single `npc_id` in the original §11 shape cannot express this; this field is the §11 edit that makes the someone-else-voices-it shape sayable. |
| `prerequisite_theme` | The theme that must already be load-bearing before this payoff can fire (a mirror-NPC beat needs its theme seeded in an earlier scene the player has seen). An authored precondition, never inferred from an affect signal. |
| `The Idea` | One plain sentence of design intent that survives from Architect to Content Agent to Verifier to Roc. The why. |
| `shape` | One of: deferred-gap (a gesture cut off, paid later), logistics-first (the mundane statement first, the heavy truth after), motif-rhyme (a phrase seeded light, reused near-verbatim in a heavier register). From the Frieren turn templates (frieren-dialogue-jp.md). |
| `tier` | surface / mid / hidden, by inference load. Placement carries the tier; no difficulty label is shown. |

## Slot typing — which slot may carry a seed

The Architect specifies the **slot type** the seed is planted in, not only its content.

- **A seed whose content is an act the soul performs and does not mention must be planted as `action` (scene business).** It has no legal spoken rendering: put in a `dialogue` slot it becomes either stage direction or the soul narrating itself, and both are banned — the second also breaks the rule that no soul states its own trait.
- **A seed that is genuinely spoken** — an overheard price, a remark that lands oddly — may be `dialogue`.
- The `action` slot must make its actor unambiguous, either named in the text or carried by `speaker_id`.
- Wherever content is shown for review, an `action` slot is prefaced **`[action]`**. Rendered bare it reads as spoken text; that misread happened at a human gate on 2026-07-25.

`examples/worked-example-mara.md` already plants its seed correctly this way — Mara oils the gate hinge, and nobody says so. The rule was simply never written down, and the 2026-07-25 run spent four Content passes discovering it: the constraint set was unsatisfiable in the slot the seed had been given, and no amount of rewriting could have fixed it.

## Bounds the Architect holds

- The seed-to-payoff ratio is tracked at arc level: seeds that never land train the player to stop looking.
- Every seed_scene must work on its own for a player who never returns.
- A payoff that reaches into a soul's past must recontextualize something present, or it is a dump.
- The template is conditioned on history, so the same template pays off differently by the soul's card, the accrued bond, and the role they held last life.
