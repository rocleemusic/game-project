# Festival of Souls — Game Design Summary

## The Concept

Festival of Souls is a cozy roguelite point-and-click adventure — think *Outer Wilds* meets *Spiritfarer* meets *Frieren* — where you explore, collect, and discover in a hand-painted magical world.

The game explores one question: **what does it mean to belong, and does connection span lifetimes?**

**The hook:** once a year, the Lantern Arch lights the way for souls to return so their loved ones can remember them. That's what the whole town spends the week building toward.

You play a mage who has just arrived in town before the Festival of Souls. You forage, craft, learn folk magic, and get to know your neighbors — and your choices shape how the festival turns out. One **life** unfolds across many festivals: your home fills, your bonds deepen, the town grows familiar. When you start a **new life**, the souls return with shuffled roles — the blacksmith may now be the postman — but each soul's core personality stays fixed, and the bonds you built carry forward.

## What Makes It Different

Most "cozy roguelites" are cozy paint over a tension engine — they keep death-as-punishment or push-your-luck mechanics and just make them *look* soft. This game inverts the mechanics themselves, keeping each roguelite pillar's structure but re-tuning it to produce warmth instead of tension:

- **No permadeath.** A life ends in a festival or a chosen new life — the harshest roguelite mechanic becomes an elective reincarnation. Nothing is lost, only lived.
- **No procedural danger.** Reshuffles re-deal *roles* (personality fixed), so novelty reads as reunion and rediscovery, never threat.
- **Meta-progression is knowledge, not power.** Like *Outer Wilds*, nothing mechanically unlocks — you carry forward *knowing more* (where to forage, how to cast, who each soul is), plus the bonds and collection you've built.
- **Escalating intimacy, not difficulty.** Bonds deepen, dialogue warms, and the festival grows grander with depth instead of harder.
- **Discovery over optimization.** You find spells and folk magic; the reward is discovery itself, without build-optimization stress.

## Core Loop

Four verbs drive everything: **Collect** (forage components, mementos, sounds), **Make** (combine components and knowledge into a spell, dish, or craft), **Use** (apply an item or spell to a target), and **Converse** (talk with an NPC).

A day runs morning → afternoon → evening on a move budget. You carry a satchel and a notebook; the notebook holds everything you've learned and never expires. At day's end you bank what fits in the satchel and return home — your hub for this life, which you decorate and which starts empty each new life.

A **festival cycle** is the week leading up to one festival night. Each NPC has a personal goal for the festival that you can help with, and the festival's outcome depends on how much you accomplished and who you bonded with.

## The Reshuffle: Essence vs. Role

This is the game's core narrative engine. Every soul is built on an **essence/role split**: the essence — a want plus a repeated behavior — never changes across lives. The role (their job in town) is re-dealt each new life from a shared pool (Mage, Blacksmith, Baker, Postman, Herbalist, Priest, Farmer).

That reshuffle is the payload, not a cosmetic reskin: the same fixed want, paired with a new civic role each life, produces a genuinely different story each time — a soul whose want is "to be needed" plays very differently as the town's Baker than as its Priest. Name, gender, and personality stay fixed so the player can recognize each soul across lives; only their position in the world changes.

The roster is 3 deep souls (hand-authored arcs) plus 5 texture souls (one salient signal each), each embodying a different theory of belonging — earned, given, chosen, tended, or found — so the town collectively argues the game's central question from every angle.

| Soul | Belonging-stance | Recognition hook / signal |
|---|---|---|
| **The Keeper** (Mara) — *deep* | Belonging is tended; keeps the anchor from slipping into the past | Always finds the beauty in what's passing |
| **Toby**, the Giver — *deep* | Belonging is earned by being needed | Always the one who sees how people connect |
| **Ilsa**, the Kinbound — *deep* | Belonging is given — blood, family above all | Always gathers people to a table |
| **Nell**, the Content Server — *texture* | Needed, and at peace with it (counters the Giver) | Hums while working; never keeps score |
| **Juno**, the Found-Family Keeper — *texture* | Belonging is who you choose (counters the Kinbound; the game's thesis) | Her "family" is a patchwork of people who found each other |
| **Linnet**, Half of a Pair — *texture* | The one bond out of reach — soulmates split by timing | Keeps a small habit for someone now married to another |
| **Pip**, the Wonder-Seeker — *texture* | Belonging is in shared wonder | Drags people to see small marvels |
| **Bex**, the Rule-Breaker — *texture* | Says "you belong" plainly, where everyone else deflects | Names the feeling out loud |

## Magic System

Spells are learned by watching a neighbor cast (which gives a clue, not the spell) and confirmed by doing. A spell is a phrase plus components, cast by selecting inventory items and entering the phrase. Anyone can cast, but mana affects only quality (a bigger or cleaner effect) — never whether you can cast at all.

Critically, **outcomes are receiver-determined, not verb-determined**: the same spell produces different results depending on its target. The verb encodes only what was attempted, never what happens. This was proven end-to-end by running `ignite` against seven receivers through the actual narrative pipeline:

| Receiver | Outcome | Reaction |
|---|---|---|
| Stick | Catches | The stick catches at the tip and holds a small, steady flame. |
| Hedge | Catches, clears the obstacle | The hedge catches along its dry inner branches; smoke rises, then the flame opens the blocked path. |
| Furnace | State-dependent | Unlit and stocked: the banked fuel catches. Already lit: nothing changes. |
| Bread | Scorches, doesn't catch | The crust blackens and curls; the loaf is ruined, no flame catches. |
| Cat | No physical effect | The light washes over its fur and fades. The cat flattens, bolts, then grooms itself. |
| Toby (direct cast) | No physical effect | "Save that for the oven." |
| Ilsa (direct cast) | No physical effect | *(null — no reaction)* |

## Festival Outcome

Festival night isn't a win/lose branch — it's a spectrum, rendered through lighting, turnout, and who shows up: **Quiet** → **Warm** → **Grand**, with a rare top tier (a "souls-of-the-world" display) reserved for exceptional depth.

The tier is driven by pairing each soul's fixed want against their re-dealt role's civic goal — tension or alignment between the two is what makes the same soul's story land differently life to life. Two tracks run in parallel and never collide: the **festival goal** (external, moves the tier) and the **soul's arc** (internal, moves nothing on the tier). A player who ignores every soul's inner life can still reach a Grand festival by finishing the town's collective work; a player who goes deep on one soul and nothing else gets a Quiet festival and a different story. Neither is the "right" way to play. There is no hard-lose — every festival ends with something, because the game can't be lost, only lived.

## AI Pipeline & Token Budget

Content is produced by a crew of specialized agents under human review at every gate — agents generate volume and check consistency, but a human approves every line before it ships.

| Agent | Input | Output / Responsibility | Token Budget |
|---|---|---|---|
| **Orchestrator** | Session goal, pipeline stage, arc-doc + NPC-codex refs, human intent | Sequences the crew, collects typed output, surfaces human gates, resolves conflicts | 200K |
| **Narrative Director** | Corpus lore, roster seeds, human steering intent | Surfaces lore, proposes arc-doc fields, drafts the arc doc for ratification | not yet budgeted |
| **Narrative Architect** | NPC descriptions, scene list, voice guide | Persona cards, seed→payoff echo map, NPC codex of locked facts | 300K |
| **Content / Dialogue** | Persona card, scene context, tone enum, Architect output | All player-facing text — NPC lines, lore, descriptions | 700K |
| **Consistency Verifier** | New lines, active canon, 8 locked invariants | Flags each batch against invariants + voice register (flags only, never rewrites) | 300K |
| **QA / Playtest** | Scene graph, gates, interaction specs | Verifies the slice is traversable — no soft-locks, dead-ends, unreachable wins (flags only) | 250K |
| **Style / Art-Direction** | New assets, palette bands, silhouette vocabulary | Checks art against color grammar + silhouette rules; flags drift | 100K |
| **Production / PM** | Milestone calendar, task status, review-queue depth | Tracks backlog, flags scheduling risk, produces weekly readiness summary — no design decisions | 50K |

**Budget assumption:** one chat's context window is ~1M tokens; the project assumes a 3M total budget, split 2M for the narrative/content crew and 1M reserved for the technical track (Unreal integration).

**Measured, not estimated.** On 2026-07-25 the crew was run for real — a 5-arm model benchmark plus a full generation of one soul through the stage-2 sequence (27 agents across two phases). The result: cost doesn't scale by soul, it scales by how many times a soul speaks.

| Unit | Measured cost | Scales with |
|---|---|---|
| Architect — one soul's persona card + echoes | ~51K tokens | Souls (paid once each) |
| Content + Verifier — one soul in one scene | ~107K tokens | Soul-appearances |

At 8 souls, persona cards cost ~411K tokens, leaving ~1.59M for appearances — roughly **15 soul-appearances** at ~107K each. The slice runs 5 days × 3 time-blocks = 15 scene-slots, meaning the 2M crew budget affords roughly **one soul-appearance per time-block across the whole festival week, with zero revisions.** That number is the real scope constraint on how populated any given scene can feel — not a design choice, a measured limit.

## Scope

The vertical slice targets: one playable week reaching festival night, one complete hand-authored deep-soul arc (seed to payoff), one hand-scripted on-camera reshuffle, and persistence of bond levels and collection across a new life. Built on Ink (narrative engine, prototyped in browser, carried into Unreal via ink-to-UE integration) with a Point-and-Click toolkit, Wwise audio, and static-camera 3D scenes — split into a narrative track and a visual/asset track so review never blocks asset work.

| Tier | Narrative | World / Levels | AI Pipeline |
|---|---|---|---|
| **MUST** | 1 deep soul's arc complete end-to-end; one seed→payoff echo lands | Forest (1 screen + 2 unlocks) + Town (Square + 1 scene) + Festival; one week playable to festival night | Persistence save + reshuffle works; Content + Consistency agents produce & check one soul's lines |
| **SHOULD** | 3 deep souls' key lines authored & distinct side-by-side; dialogue warms across lives | 3 festival tiers rendered; bond-driven dialogue change on a repeat reshuffle | Full crew runs; a second hand-authored reshuffle instance demonstrated on camera |
| **STRETCH** | All 5 texture souls fully written; the souls-of-the-world display top tier | Extra forest screens; richer effects | Style/Art-Direction agent automated; Production/PM agent live; ink→UE integration spike |
