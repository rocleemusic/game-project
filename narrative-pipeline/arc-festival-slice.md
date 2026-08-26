# Arc Doc — The Festival Slice (lives 1–2)

The steering layer for the vertical-slice arc. Written before any scene generates; the Orchestrator hands this to every worker as prepared context. Field concepts are in [`steering-layer.md`](steering-layer.md). Everything here steers content or documents direction; nothing here names or targets a player feeling.

> **Status: Ratified for the proof run (2026-07-25, Roc).** Assembled from locked material: the roster and belonging stances in [`../gdd/07-cast.md`](../gdd/07-cast.md), the concept and core loop in [`../gdd/01-concept.md`](../gdd/01-concept.md) / [`../gdd/03-core-loop.md`](../gdd/03-core-loop.md), and the belonging briefs. The slice centers the **Giver**, dealt the **Baker** role this life (want × role-goal in tension). Stage 2 (NPC generation) runs against this doc; see [`content-stages.md`](content-stages.md).
>
> **Amendment — the Kinbound now has an arc (2026-07-25, Roc).** The "unshiftable by design" spine is **withdrawn**. Reason: an unshiftable soul generates nothing inside a single life — the irony only existed after a reshuffle, so in a one-life slice the Kinbound was inert. Replaced with a *different arc shape* (below): the belief **qualifies rather than flips**. Touches the spine, the anti-goal, the thread table, and adds a family-pressure pool. **v5 §6.3 still reads "never changes, and not the player's to resolve" and must be updated in Task 2.** The Giver benchmark arms ran before this amendment and are unaffected by it — nothing here touches Giver material.

---

## Lore / canon grounding

**The world's canon now lives in the World Bible ([`../gdd/00-world-bible.md`](../gdd/00-world-bible.md)).** The Festival of Souls, the town (Hearthlight), the cosmology, and the surfaceable-lore vs. World-Truth split are authored there. This arc steers against them and no longer restates them — the Festival-of-Souls and the outcome-spectrum bullets that used to sit here moved into the bible (A2, B). The bible's hidden cosmological truth (*remembering is the engine*) sits **beneath** this arc's relational World Truths below; the two layers do not duplicate each other.

Two things stay here, because they are this arc's *engine*, not world lore:

- **Essence and role.** Each soul's **essence** — a want plus a repeated behavior — is fixed across lives. The **role** (blacksmith, baker, postman) is re-dealt each new life. The personality never changes; the job does. (Full account: [`../gdd/07-cast.md`](../gdd/07-cast.md).)
- **Soul-want × role-goal (the story engine).** Each occupation carries its own **festival goal** (the blacksmith forges a new Lantern Arch centerpiece; the baker prepares the communal feast). Each life, the pairing of a soul's **want** with its dealt role's **goal** lands somewhere on **tension ↔ alignment**, and that permutation is what makes the same soul's story different life to life. The festival goal is the soul's *external* objective (it moves the tier); the arc/belief-shift is its *internal* journey. The two run in parallel and never collide. The player's own picked role reuses this same engine: a civic role's goal becomes the player's personal contribution to the tier. Mage is the exception — its goal (collect magic from around the world) is personal, not civic, so a mage-holding player doesn't feed the tier this way.

---

## World Truths

Five hidden facts the arc steers toward. No scene states one; every scene serves one. The player assembles each from the biased, partly-contradictory accounts different souls give, and from how they spend their days.

- **A bond re-forms across lives as a thing tended, not a memory stored.**
- **A bond carries across lives at the level you tended it to — it re-forms at that depth, not as remembered events.** *(the bond-level truth)*
- **Essence is fixed; role is re-dealt — a soul is a pattern, not a station in life.**
- **What you spend your time on is who you belong to.**
- **Belonging is not only earned — a person can be claimed unearned, and being claimed is not a debt.** *(the Giver's truth)*

## The Arc Question

One question, answered by play. Never resolved in dialogue, never tested for comprehension.

> **Across these festival-years, does the Giver stay someone who must earn a place, or become someone who can simply be claimed?**

## Soul Arc Spines

A human note, one line per deep soul, from X to Y across this arc. Guides which facets to surface early versus late. Not a card field, not a target; the bond still ends where the player takes it. The texture souls counter-voice the deep trio so the whole village argues *what is belonging?* from every corner.

- **The Giver:** from *can't receive* to *can* — freed by being claimed unearned; the player's "I see you" is the corrective. *(arc focus this slice)*
- **The Keeper (Mara):** from *clutch* to *transform* — the bond re-forms; loss isn't final.
- **The Kinbound:** from *blood is given* to *blood is tended* — stays blood-first; learns only that a bond you were handed does not hold itself up. Someone who shares your blood and never shows up has less of you than they think, and that lands as a wound, not a conversion. The world still re-deals blood each life, and the Kinbound still never learns *that*.

**The Kinbound's arc is a different shape from the Giver's, and the difference is structural:**

| | The Giver | The Kinbound |
|---|---|---|
| **Movement** | The belief **flips** — can't receive → can | The belief **qualifies** — given → tended. The conviction survives; only its automatic-ness dies |
| **Pressure generated by** | The **dealt role** — the feast can't be finished alone, so the job manufactures receive-beats | **Other people's behavior** — family who don't show up. Needs its own pool (below), not a row in the per-occupation table |
| **Endpoint guard** | — | Must **never** land on chosen-family. That is the Found-Family Keeper's stance and the game's own thesis; if the Kinbound converts to it, two of eight souls collapse into one and the village stops arguing |

The arc plugs into the first World Truth — *a bond re-forms as a thing tended, not a memory stored*. The Kinbound is the soul who learns that truth the hard way while still refusing what it implies.

## Threads to Not Drop

Open threads and their last-moved counter. "Move" means new information, not resolution. Any thread untouched past the cap (default six scenes) biases the next scene toward moving it.

**The `id` column is the join to the runtime.** The resolver, `role-workplace.json`'s `goal_threads` and Lantern's ThreadsPanel all work in ids; this table works in prose. Without the column there is no way to say which row a firing thread is moving, or to catch a thread the runtime fires that no arc row authorises. Every thread the runtime moves must appear here by id.

**Id format: `<soul>-<thread>`.** The soul slug comes first so a thread's owner is legible without a lookup, and so one soul's threads sort together. The slug is the **soul**, not the role — roles reshuffle each life and the thread travels with the soul.

| id | Thread | Last moved (scene) |
|---|---|---|
| `toby-feast-short` | The Baker's feast can't be finished alone (the Giver's want × role-goal tension) | — |
| `mara-set-for-two` | The corner "set for two" and the drawer's unclaimed objects (the Keeper) | — |
| `world-dealt-past` | A soul dealt "past" this life — the felt absence every life carries | — |
| `world-arch-centerpiece` | The Lantern Arch ages year over year; its centerpiece | — |
| `ilsa-kin-no-show` | Someone the Kinbound counts as family keeps not turning up (the given → tended pressure) | — |

**Two rows have no soul, and take `world-` instead.** `world-dealt-past` is carried by every soul rather than owned by one — the felt absence is a property of the deal, not of a character. `world-arch-centerpiece` belongs to the festival and passes to whoever is dealt Blacksmith. Inventing an owner for either would be a design decision; `world-` records that they have none.

**A third prefix: `pair-`, for a thread owned by exactly two souls (ruled 2026-08-09 — Roc).** `<soul>-` says one soul owns it; `world-` says none does. Neither fits a thread that exists *only because these two are in the room* — Toby's earned belonging against Ilsa's given one is not Toby's thread with Ilsa in it, nor a property of the village. It takes `pair-`, and it follows `delta_relational`'s rule one level up: **bound to the pairing, not to either soul, and re-keyed at every reshuffle**, because the reshuffle re-deals who is standing next to whom. A `pair-` thread is **declared in both souls' registries** and names one **owner for the runtime join**, since the resolver and `role-workplace.json` need a single id holder. The owner is the soul whose arc the thread moves; where it moves neither, the thread is `world-`, not `pair-`.

**Texture souls' role-goals are visible in scenes and absent from this table (ruled 2026-08-09 — Roc).** Six civic goals exist; three belong to deep souls and take thread rows — the feast, the centerpiece, the tonic. Three belong to texture souls and take **none**: the Priest's rite that lights the Arch and calls the souls home, the Postman's festival letters, the Farmer's harvest that feeds the week. They are `delta_situation` material — uncapped, stateful, and free to reference under `guardrails.md` check 3 — so a deep soul's scene may mention the harvest coming in or the letters going out at no delta cost, and the festival stays a village rather than three arcs in a row.

**The consequence, stated so nobody is surprised by it.** A thread untouched past the cap biases the next scene toward it; a situation has no such pull. The rite, the letters and the harvest therefore surface **only when a writer chooses to bring them in** — nothing nudges them. That is the trade this ruling accepts: texture souls carry no thread machinery, and their goals are colour the deep arcs move through, not pressure the system tracks.


**On `giver-receive`.** It is the id currently wired into `role-workplace.json`'s Baker row and present in `story.json`, `graph.json` and the Lantern fixtures, and it maps to row 1 — the Baker's feast. It is not listed above because it is the id being retired: it carries no open question of its own and its nineteen v01 moves all feed one counter that cannot distinguish them. `toby-feast-short` is row 1's id going forward. Rewiring the data files is a separate change and has not been made.

Ids for rows 2 to 5 are minted here for the first time and are open to renaming; nothing generates against them yet.

## What This Arc Is NOT

Explicit anti-goals, including verbs deliberately left out. A scene brief that drifts into one of these is rerouted at Intake before it reaches prose.

- **Not a deduction/puzzle game.** The reshuffle is thematic, not a permutation puzzle (the Obra-Dinn recognition engine is parked).
- **The Giver is not "fixed" by a quest step.** Being claimed is a beat that lands, never a reward for niceness.
- **The Kinbound is not converted.** They get an arc, but it qualifies blood-first belief and never arrives at chosen-family. The player's part stays **witness** — they do not fix the family, and no quest step repairs it. *(Supersedes the withdrawn "not the player's to resolve" — see the amendment note above.)*
- **No prescribed search for a lost partner / kept-promise "true ending."**
- **No letting-go ending locked.** The Keeper's healthy pole is *transform*, never *release* — release stays the player's meta-choice.
- **No verbal amplification.** Swells are visual/spatial/scale; the words stay plain and Frieren-flat, most of all at a payoff.
- **Omitted verbs:** no combat, no fail-punish, no timing/aim/reflex gates.

---

## Generative Tables

Small, hand-curated seed pools the Graph step (step 6) triangulates against — place-need × arc-need × novelty — to spin up encounters. Two rules hold for this game: every row produces a **hook, not a fail-state** (a small thing gone slightly wrong that invites a verb, never a punishment — cozy rhythm, pull-not-push), and the pools stay small on purpose (an overgrown table generates junk). Keep them append-ready as new roles enter the slice.

### Mishap table (layered)

**General pool** — works anywhere; the cheap, always-available fallback.

| Mishap | Verb hook |
|---|---|
| A cloudburst catches someone's market goods out | Use (shelter/dry) · Converse (offer) |
| A dropped basket scatters; something rolls out of reach | Collect · Use |
| A path lantern won't stay lit in the wind | Make/Use (a steadier flame) · learn a spell |
| A festival animal is loose where it shouldn't be | Converse (coax) · Collect |
| A shortcut is blocked — a fallen branch, a stuck gate | Use (ignite/clear) · learn from an NPC |

**Per-occupation pool** — keyed to the dealt role; characterizes the job *and* feeds the soul-want × role-goal tension.

| Role (goal)                                     | Mishap                                                                                                   | Verb hook / arc pull                                               |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| **Baker** *(the communal feast)*                | The feast dough went flat — not enough for the turnout                                                   | Collect/Converse — **must accept help** *(Giver's receive-beat)*   |
| **Baker**                                       | A key ingredient spoiled or ran short before festival night                                              | Collect (source in forest/market) — **must let others contribute** |
| **Baker**                                       | Too many orders for one pair of hands                                                                    | Converse — **let the town in** *(the arc, generated)*              |
| **Baker**                                       | The oven fire burns uneven; a batch risks scorching                                                      | Use/Make (steady the flame)                                        |
| **Blacksmith** *(the Lantern Arch centerpiece)* | The forge won't reach heat; a part is missing                                                            | Collect (source) · Converse (ask)                                  |
| **Blacksmith**                                  | The special ore can't be sourced in town                                                                 | Collect (forest-screen unlock)                                     |
| **Postman** *(deliver the festival letters)*    | The letters got soaked and mixed up                                                                      | Collect/Converse (sort, re-route)                                  |
| **Postman**                                     | One letter has no address the postman can place                                                          | Converse (ask around)                                              |
| **Herbalist** *(the festival tonic)*            | An early frost threatens the last herbs still out in the forest                                          | Collect (forest-screen, race the weather)                          |
| **Priest** *(the rite that lights the Arch)*    | The rite's words are only half-remembered — the elder who taught them is one of this life's "past" souls | Converse (piece it together)                                       |
| **Priest**                                      | The ceremonial oil for the Arch's lighting ran short                                                     | Collect/Converse (source, ask)                                     |
| **Farmer** *(the harvest)*                      | An early frost threatens the last of the harvest before festival week                                    | Use/Collect (race the weather)                                     |
| **Farmer**                                      | Not enough hands to bring in the grain before the rains                                                  | Converse (ask around)                                              |

*Every Baker mishap tilts toward the Giver having to receive — the role-goal manufactures the tension the arc pays off.*

### Family-pressure pool (the Kinbound)

A **third pool**, needed because the Kinbound's pressure has a different generator: it comes from other people's behavior, not from a dealt role, so it cannot live in the per-occupation table. Same two rules hold — every row is a hook, not a fail-state, and the pool stays small. Each row tests the same thing from a different side: **a bond you were given, behaving as though it were not automatic.**

| Pressure | The test | Player's part |
|---|---|---|
| Someone the Kinbound counts as family doesn't turn up for a festival task they promised | Is a given bond still a bond when it isn't tended? | Witness — never repair it for them |
| A non-relative quietly does the thing family didn't | The comparison lands on its own; nobody names it | Witness · ease — never point it out |
| Family shows up, but for the occasion rather than for the person | Presence without tending — the harder version | Sit with |
| The Kinbound covers for a relative's absence so no one else notices | The tending is theirs, and one-directional | Witness — the cover is the tell |
| A relative asks for something on the strength of blood alone, having given nothing | Blood as a claim rather than a bond | Witness · ease |

**Two guards on this pool.** No row may resolve into *chosen family is real family* — the Kinbound stays blood-first, and the counter-position belongs to the Found-Family Keeper. And no row is a betrayal set-piece: the pressure is **accumulated small absence**, not a single dramatic wound, because the belief qualifies rather than breaks.

**Sanctioned exception — the bond gate.** The Kinbound's turn lands at a bond level rather than on a named deduction. This is a **deliberate break** from the echo rule that a payoff fires on a deduction and never on accumulation ([`templates/echo-template-schema.md`](templates/echo-template-schema.md)). Recorded here so the Verifier reads it as sanctioned and does not flag it every pass; it is marked `authored_exceptions` on the Kinbound's card when that card is generated. The break is limited to this soul's arc turn — echoes elsewhere still obey the deduction rule.

### Social conflict table (keyed to belonging-stance pairs)

Conflicts generate from stance × stance friction across the locked cast, so they stay thematic and re-key themselves as roles reshuffle. The player's part is always **witness · ease · sit-with** — never "resolve or lose."

| Stance pair | The friction | Player's part |
|---|---|---|
| **Giver** (needed) × **Content Server** (at peace being needed) | The Giver keeps "helping" someone who doesn't want rescuing | Ease — or let it sit; the help isn't wanted |
| **Kinbound** (blood-first) × **Found-Family Keeper** (chosen family) | A quiet clash over who counts as family | Witness — neither is wrong; the world argues |
| **Half of a Pair** (bond out of reach) × **Keeper** (tends what's passing) | Both tend something they can't hold; a mirrored ache | Sit with — no fix, shared quiet |
| **Rule-Breaker** (names it) × the deflectors (everyone else) | Says the quiet part aloud, discomfiting the table | Ease/witness — the discomfort is the point |
| **Giver** (earns a place) × **Kinbound** (a place is given by blood) | Two theories of belonging, head to head | Witness — left unresolved on purpose |
