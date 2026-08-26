<!-- Canonical cast card. THIS FILE IS CANON for the soul `toby`. Originated as a verbatim copy of pipeline-runs/2026-07-25-giver/giver-persona-card.md (GP-63, 2026-08-02); that file is now a frozen run artifact and diverges from here on. Edit this file, never that one. -->

# The Giver — Toby. Approved persona_card + echo

Originally the stage-2 output of the Phase 2 demo run, 2026-07-25 — produced by the Narrative Architect (Opus 5), verified by the Consistency Verifier (Sonnet 5), **approved by Roc at the human gate**. The run trail is [`run-log.md`](../pipeline-runs/2026-07-25-giver/run-log.md); Phase 1's benchmark is [`RESULTS.md`](../pipeline-runs/2026-07-25-giver/RESULTS.md).

This closes the **§6.3 Giver stub** and feeds Task 2.

Schemas: [`persona-card-schema.md`](../narrative-pipeline/templates/persona-card-schema.md), [`echo-template-schema.md`](../narrative-pipeline/templates/echo-template-schema.md). Steering layer: [`arc-festival-slice.md`](../narrative-pipeline/arc-festival-slice.md).

> **Status.** The card and the echo_template are **approved and final**. Four of the scene's dialogue lines are approved. Two items remain open and are recorded at the foot of this file — they do not block the card.
>
> **Prose amendment, 2026-08-02 (Roc).** The generated essence fields were rewritten into the card-prose register now specced in [`persona-card-schema.md`](../narrative-pipeline/templates/persona-card-schema.md). **No content changed** — same want, same behavior, same axes, same conviction. What changed is that the fields had drifted into a clinical write-up voice (label-plus-dash-gloss, colon-into-triple, aphorism) while `primal_seed` and the Roc-authored fields stayed plain, and the card rides into every Content Agent call as the ambient style for generated lines. The exemplars used were `primal_seed` and Ilsa's Roc-authored-verbatim `backstory_guideline`.
>
> Two things the rewrite fixed rather than restyled. The `essence_descriptor` no longer closes on *"Against a player who …, [he] cannot …"* — the schema flags that closer by name as its own template surfacing, and both authored cards were carrying it. And the **warmth-invariant amendment now lives inside the `voice_register` field itself** rather than only in the commentary below it, so it travels with the field into every call instead of being commentary a machine reader drops.

---

## persona_card — toby

### Essence fields (invariant across reshuffles)

| Field                 | Value                                                                                                                                                                                                                                                                                                                                            |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `npc_id`              | `toby`                                                                                                                                                                                                                                                                                                                                           |
| `name`                | Toby                                                                                                                                                                                                                                                                                                                                             |
| `primal_seed`         | The world is safe while it needs me. I have value when I am needed.                                                                                                                                                                                                                                                                              |
| `essence_descriptor`  | He wants to belong but thinks worth requires proving. So he makes himself necessary. He sees how everyone in a room fits together, and he supplies what each one is short of before they ask, which means nobody ever gets to offer him anything first. When something is given to him anyway, he believes it is a debt that needs to be repaid. |
| `conviction`          | He refuses care with no strings attached.                                                                                                                                                                                                                                                                                                        |
| `backstory_guideline` | He grew up in a large family where attention was always short. Being useful was what got him noticed, so he believes his worth is tied to what he does for others.                                                                                                                                                                               |
| `notice_and_want`     | He is hyperaware of people's needs and relationships. He wants to be the one they could not do without.                                                                                                                                                                                                                                          |
| `authored_exceptions` | `null` — not a sanctioned rule-break                                                                                                                                                                                                                                                                                                             |

**Player contrast: none, on purpose (recorded 2026-08-03 — Roc).** The schema asks a card to record this rather than invent one. Toby has no collision that the player's *presence* creates: his belief that worth must be proven is not contradicted by the player existing, only by a specific act — being given something with nothing owed on it, and having the shelf named back to him. That act is the echo's `payoff_condition` and the Soul Arc Spine, both of which live outside the card. The run's original clause (*"a player who moves through lives taking nothing with him"*) was worse than absent: it contradicted the ratified World Truth that a bond carries across lives at the level it was tended, and Toby demonstrably *can* repay the player — he does it in the approved lines below.

**On the overlap.** This field restates `primal_seed`, `notice_and_want` and `conviction` by design. It is the compressed summary re-pinned into every Content call, and a summary that shares nothing with what it summarizes is broken.

### `trait_axes` — orthogonal

| Axis                | Value                                                                                                                                                                                   |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `deflection_target` | The unfinished task in the room. When attention turns on him, he finds something that still needs doing and rushes off to do it, so the talk moves to the job and off him.              |
| `precision_profile` | He knows exactly what everyone else needs, and how much, and by when. Ask him what he needs and he has not worked it out.                                                               |
| `warmth_channel`    | Anticipation. He works out what you will need and it is already there when you reach for it. He never says that he did it, or why, because saying so would make it a thing you owe him. |

**Orthogonality, as argued by the Architect and passed by the Verifier on the first attempt:** deflecting to tasks does not require exactness, since a sloppy soul can deflect the same way; exactness about others' quantities does not imply warmth, since it can serve a ledger-keeper; and anticipatory warmth can exist without either. No axis value predicts another.

*This is the check that disqualified the cheaper Architect config in Phase 1, where two axes both encoded "he goes blank on his own needs."*

### `voice_register`

> He speaks the world dialect: one thought per turn, plain, deflect rather than name. The world's ordinary ceiling is 75 words (loosened 2026-08-23) — he does not use it. What marks him is speed, not length, and that stays true regardless of how much room the world gives him.
>
> **He holds the floor only about things that are not him.** He can run long — up to 75 words — on logistics, arithmetic or instruction: what is short, by how much, by when, who needs what. That is `deflection_target` and `precision_profile` made verbal, and it is the move the source's own long turns make. Information, never feeling. The moment he is the subject — thanked, noticed, given to — he goes flat and short, and shorter as the beat gets heavier.
>
> He answers first, he offers first, and he aims his questions at whoever else is in the room. The speed runs hardest when he owes somebody. Even a long stretch of arithmetic stays fast — he does not slow down to be understood.
>
> The flat end is about pace, not temperature. He stays warm toward the person offering even while he ducks what they offered, and that is what makes the line hard to write. Deflecting care is not the same as being cold.
>
> He sounds like: "Pass me the starter." · "Rolls on top so they don't press. Your fold is neater than mine." · "It's not much." · "Lamp at the lane end is lit." · "Two more after hers."

### `voice_enforcement`

Verifier-only. Never pinned into a generation call (`../narrative-pipeline/templates/persona-card-schema.md`, pinned-context hygiene). Everything here was moved out of `voice_register` on 2026-08-08 with its wording intact; on 2026-08-09 it was re-framed into the house form (named failure modes — `../cast/bex.md`, card-prose rule 8) so a checker reads each rule as the slip that produces the defect. Same rulings, nothing added or dropped.

**Length and spread — the numbers.** **Re-measured 2026-08-25 against the loosened `register.md`** (the world ceiling moved 40→75 on 2026-08-23; full detail `../pipeline-runs/2026-08-17-register-loosening/2026-08-24-local-model-findings.md`). Toby does not move with it: his engine is speed, not room, so a scene handing him the new headroom on an ordinary line is the same defect as before, just against a bigger number — tightest at payoffs; a long line is a defect regardless of what the world ceiling allows. His logistics-only long run was already licensed to 75 words, so the old exception ceiling and the new ordinary ceiling have converged; what still makes it his is not the number but the two conditions — information, never feeling, and barred absolutely wherever he is receiving, being thanked, or being seen, and barred at a payoff. The spread is `monotone ↔ animated`, Toby resting at roughly 70% animated, and it governs tempo and uptake only — never word count, never warmth.

#### How writers get Toby wrong — the five failure modes

A soul whose warmth arrives as speed sits one authorial slip from reading busy, and one more from reading cold. Each failure below is the slip a writer actually makes, with what Toby does instead.

**1. The writer keeps him animated while receiving.** The tempting version: the scene warms up, Toby is thanked or given to, and his brightness carries through the beat because brightness is "his voice." It is not — the animation is a trained skill rather than a temperament, and it points one way only. Animated when attention points outward; flat and short the moment it turns back on him, and shorter as the beat gets heavier. A Toby line that stays animated while *receiving* care is a defect. The inverse slip is barred too: the animation is not a mood the scene may turn down for atmosphere.

**2. The writer hands the long run to the heavy beat.** Toby can run to 75 words, so when the scene's weightiest moment arrives, the words get given to him there — exactly where the licence does not reach. The sanctioned run exists for logistics, arithmetic or instruction only: what is short, by how much, by when, who needs what. Any long run where he is receiving, being thanked, or being seen is barred absolutely, and so is any long run at a payoff. Where the weight lands, he gets shorter, never longer.

**3. The writer explains the offer.** The offer lands and the writer, feeling it needs a reason, appends one — which converts the gift into a bid and breaks the engine, because saying why would make it a thing you owe him. He never explains an offer — with one stated exception (ruled 2026-08-08 — Roc, `../narrative-pipeline/register.md` move 6): he may say what his hands did when the doing is already visible in the room and he is speaking to a named person — *"your eggs are down the side, I made sure they wouldn't get crushed."* What stays barred is the *reason the offer was worth making*. Naming the act is not justifying it.

**4. The writer reads "flat and short" as licence to be cold.** The receiving-flat line satisfies every structural check — seven words, deflected, tempo down — and still reads brusque, clipped, dismissive, transactional or irritated. That line is a **defect**. Warmth is invariant across the spread: the spread governs tempo and uptake only, warmth is not on that scale — it is a constant, and its channel is fixed as anticipation. He stays warm toward the person offering even while he ducks what they offered.

*Provenance of the warmth rule.* It was not specified in Phase 2's seed, the Architect encoded the spread correctly without it, the Verifier passed all four spread sub-checks, and the resulting line was still cold. Only the human gate caught it. See the proposed guardrail in [`run-log.md`](../pipeline-runs/2026-07-25-giver/run-log.md).

**5. The writer writes him at peace.** Both Toby and the Content Server hum along supplying people, so a helpful, easy line feels like either man's — and that interchangeability is exactly the flag. The Content Server hums while working and is genuinely at peace being needed; Toby's warmth is debt-driven. Same warmth on the surface, opposite engine underneath. A line Toby could speak that an at-peace soul could speak unchanged is a Verifier flag, and this test caught two defects during the run.

### Role fields (re-dealt each life)

| Field | Value |
|---|---|
| `role_tag` | Baker. Role-goal this life: the communal feast. |
| `age_band` | `young` (late teens – late 20s). Re-dealt each life like the role. Three bands — `young` / `middle` / `older` — all deliberately role-capable, so the re-deal can never hand a soul an age that makes its role implausible (v5 §6.3). |

Per the arc doc, every Baker mishap tilts toward the Giver having to receive — the role-goal manufactures the tension the arc pays off. The essence must read true when he is dealt the postman next life.

---

## Arc — this life

> **Mirror, not source.** Authored in [`arc-festival-slice.md`](../narrative-pipeline/arc-festival-slice.md) and reproduced here so a soul reads in one place (Roc, 2026-08-03). The arc doc wins on any disagreement. **The Soul Arc Spine is deliberately not a card field** — it is a human note with no scripting guard, and nothing generates against it or gates content on reaching Y. A third copy already exists as a display string in `tools/lantern/src/lib/personaCard.ts`, and it has drifted; if this section drifts too, the fix is to move the spine's home here and have the arc doc point at it, not to keep three copies in sync.

**Arc Question** *(the arc's one question — Toby is the focus soul this slice)*

> Across these festival-years, does the Giver stay someone who must earn a place, or become someone who can simply be claimed?

**Soul Arc Spine** *(verbatim, including the corrective clause the TS copy dropped)*

> From *can't receive* to *can* — freed by being claimed unearned; the player's "I see you" is the corrective.

**World Truth this arc serves** *(hidden — no scene ever states it)*

> Belonging is not only earned — a person can be claimed unearned, and being claimed is not a debt.

**Where the pressure comes from.** The dealt role, not other people: the feast cannot be finished alone, so the job itself manufactures receive-beats. Every Baker row in the arc doc's per-occupation mishap pool tilts that way. This is structurally opposite to Ilsa, whose pressure comes from other people's behavior and needs its own pool.

**Movement shape: the belief flips.** Can't receive → can. Ilsa's belief only *qualifies*. The difference is load-bearing and is the reason the two souls need different generators.

**Anti-goal.** The Giver is **not "fixed" by a quest step.** Being claimed is a beat that lands, never a reward for niceness — and `guardrails.md` check 2 backs this: repeated helping must not accumulate into an unlock.

---

## Thread registry — moved

**Toby's threads live in [`toby-baker-threads.md`](toby-baker-threads.md)** (moved 2026-08-09). They are dealt with the role and do not survive the reshuffle, so they cannot sit in this file — a registry inside a reshuffle-invariant card reads as canon and outlives its life (ruled 2026-08-06, GP-92; [`../gdd/07-cast.md`](../gdd/07-cast.md)). Dealt Postman next life, he gets a different set, re-authored from scratch.


**Why `giver-receive` is retired.** It is the arc wearing a thread's clothes. Nineteen moves across five scenes all feed one counter, so "he deflected a tray" and "he kept a gift" record identically — the tally cannot distinguish them and therefore says nothing. Its beats redistribute across the ratified threads. The id is still wired into `role-workplace.json`'s Baker row and present in `story.json`, `graph.json` and the Lantern fixtures; rewiring those to `toby-feast-short` is a separate change and has not been made.

**Threads are a pool, not a checklist (Roc, 2026-08-04).** No run plays all eight. `toby-feast-short` surfaces every run because the festival arc needs it; the seven cast threads surface as the week deals them. That is why eight ratified threads do not have to divide into eight shallow lines — a given run carries the main thread plus whichever cast threads come up, at the depth that run affords.

**The two-cast-facts-per-scene ceiling holds, and a re-touch spends against it (Roc, 2026-08-04).** A scene may spend its two facts on facts already used. **Continuity outranks novelty**: keeping a thread legible across the week matters more than every move carrying something new. This supersedes the reading that treated re-touches as waste — see R11 in [`../plans/2026-08-03-storyline-authoring-process.md`](../plans/2026-08-03-storyline-authoring-process.md).

**The taxonomy matches the delta ruling.** `toby-feast-short` is situation-typed and moves on `delta_situation`, which is uncapped so the shortfall can change as often as the week needs. The seven cast threads move on `delta_cast`, capped at two per scene. One distinction governs both facts and threads instead of two that can disagree.

---

## echo_template — `toby-unopened-jam`

> **Echo is a technique, not the structure (Roc, 2026-08-03).** The threads carry continuity; an echo is an occasional deferred payoff taken into consideration, never something to build a soul around or reach for by default. One echo across a five-day run is the right density. The not-the-job test below keeps them rare on its own — most candidate seeds fail it, which is what happened to the stool.

| Field | Value |
|---|---|
| `echo_id` | `toby-unopened-jam` |
| `seed_scene` | Toby's bakery kitchen, morning, festival week — planted between a wasp at the window and the price of a sack of flour. |
| `seed_event` | A neighbor leaves jam on the step as thanks. Toby shelves it unopened and slips two extra rolls into her next order. |
| `payoff_scene` | Festival night, the communal feast, once the tables are already served. |
| `payoff_condition` | Knowledge flag `toby_repays_every_gift` — set only when the player has given Toby something with nothing owed on it and then named the unopened shelf back to him. |
| `payoff_voice` / `reveal_npc_id` | `toby` |
| `prerequisite_theme` | Belonging as something earned versus something given. |
| `The Idea` | Show that Toby cannot let a gift stay a gift, so that later, when he keeps one, the change is visible without anyone saying it. |
| `shape` | `deferred-gap` |
| `tier` | `mid` |

**The not-the-job test — the reason this seed replaced the stool.**

> An ordinary baker eats the jam or puts it on the counter; nobody trades a free jar into unbilled goods to cancel the thanks.

Phase 1's seed had Toby drag a stool to the flour table, then put it back and work standing. Two independent Verifier passes flagged it: refusing a seat reads as ordinary baker practicality, so **the role explained away the essence it was meant to seed.** The replacement passed the test on first generation and on every subsequent pass, including one where the Verifier was explicitly instructed not to pass it merely because it was a fix.

**Slot typing — a rule this run discovered.** The seed is planted as **scene business, not dialogue.** A seed whose content is an act the soul performs *and does not mention* cannot be carried by a spoken line: it becomes stage direction or self-narration, both banned. Four Content passes failed on exactly this before the slot type was corrected. The Mara worked example already plants its seed this way; the schema does not yet say so.

**As planted** (`toby-dough-seed`, scene_business, 25 words, `echo_flag: true`):

> **[action]** A wasp at the window; flour up two coppers a sack. Toby shelves a neighbor's jam unopened, adds two rolls to her order, mentions neither.

**Rendering convention (Roc, 2026-07-25):** every non-dialogue slot is prefaced **`[action]`** wherever content is shown for review. Without it a scene-business line reads as spoken text — which it is not, and which caused a misread at the gate. The prefix is a *review-render* convention: the data carries `slot_type`, and `[action]` is how a non-dialogue slot is displayed in run-logs, cards, and review docs. Whether it also appears in-game is a UI decision, not a content one.

Passed 6 of 7 checks — actor unambiguous, unopened intact, cover independent of the seed, recognisable at payoff, matches the approved template, still legible as a gift rather than stock. One open flag, below.

---

## delta_rule and canon_flags

**`delta_rule`** — restated 2026-08-03 against the corrected count in [`guardrails.md`](../narrative-pipeline/guardrails.md) check 3. The run's three-fact ceiling and its open governance flag are both resolved by that ruling, not by an exception on this card.

> Every delta scene adds at least one new thing, either a `delta_cast` fact or a `delta_situation`. A cast fact is a possession, a habit, or a line Toby does not cross; it travels with the soul across lives, never with the bakery. It is never a feeling — "the player feels closer" fills no slot. **At most two cast facts per scene.** Situation is what the scene is dealing with, it is public and true whoever walked in, and it is not counted or capped: it is the cover the cast facts arrive under. Reference is free: the shelf, the flask and the shortfall may be spoken about, acted on or built on in any later scene, as often as the story needs, and none of that is a delta — it is how Toby's threads stay connected. What is flagged is a delta slot holding something already delivered and unchanged, which is a structural flag back to the Architect to be re-specced, never a prose flag to Content to be re-worded. Situation is stateful, so the shortfall closing by degrees across the week is a new `delta_situation` each time, not one restated. Whether a change is real or cosmetic is a human-gate call. The quiet beat carries no slots at all and is exempt from the floor, never from the ceiling; it is authored on purpose as the breathing room later recognition needs, never a gap to fill.

**`canon_flags`**

1. Toby's essence, conviction, and recognition hook are locked and never drift, whatever role he is dealt.
2. Essence is fixed, role is re-dealt: no Toby trait may be phrased or justified in baker terms.
3. Facts bound to `toby`'s ID travel with the soul across lives; they never attach to the bakery or to whoever holds the role next.
4. Toby's warmth is anticipatory and debt-driven — it must never be writable as the Content Server's at-peace warmth.
5. Toby's animation is outward-facing only; he goes flat and short while receiving. *(Warmth stays constant — see the amendment above.)*
6. No World Truth is ever stated in-scene; no scene grants Toby a "fix" as a quest reward.
7. No new facts may be attributed to Mara, the Content Server, the Kinbound, or any other soul beyond their locked store.
8. The 40-word ceiling holds by default and is tightest at payoffs; amplification is visual or sonic, never verbal. **Amended 2026-08-06 (Roc):** one sanctioned long run of up to 75 words is permitted per scene, and **only for logistics, arithmetic or instruction** — see `voice_register`. It is barred wherever he is receiving, thanked or seen, and barred at a payoff. This replaced "binds absolutely", which had the card overriding the world rule and made a beat the corpus says should exist unwritable. *(Previously: "The 40-word ceiling and one-clause preference bind absolutely, tightest at payoffs." "One clause" is also superseded — the register now reads one thought per turn.)*
9. Bond state lives host-side, never on a card, never surfaced.

---

## Scene — `bakery-feast-dough`

Location: Toby's bakery kitchen. Morning, festival week. Tone `matter_of_fact`, fixed. `max_words: 40`.

**World Truth served (never stated):** *Belonging is not only earned — a person can be claimed unearned, and being claimed is not a debt.*

**Mishap in play** (arc doc, per-occupation pool): the feast dough went flat, not enough for the turnout. The arc doc marks this row as the **receive-beat** — verb hook Collect/Converse, and Toby must accept help.

**Declared facts**

| Slot | Fact |
|---|---|
| `delta_situation` | The feast dough went flat; forty loaves short if the square turns out, and festival night is fixed. *(Uncounted — this is the scene's situation and the cover the two cast facts arrive under.)* |
| `delta_cast_1` | Toby keeps a shelf of thank-you gifts he has never opened, and repays each one in goods. |
| `delta_cast_2` | Toby refilled the player's water flask and set it by the door before the player woke; a standing habit, done for whoever is in his kitchen. |

**Two cast facts, exactly at the ceiling.** Under the old count this scene read as three-over-two and forced the mid-run ceiling bend; the situation was occupying a cast slot it never belonged in. Nothing is cut.

### Approved lines

| # | Speaker | Line | W | Position |
|---|---|---|---|---|
| 01 | toby | Dough went flat overnight. Forty loaves short if the whole square turns out. Pass me the starter. | 17 | outward-animated |
| 02 | toby | Smith's out of salt; tuck a measure in with his loaves and call it bakery weight. | 16 | outward-animated |
| 05 | toby | You haven't eaten. Roll's on the board. | 7 | receiving-flat |
| 06 | juno | That boy has never once let me carry my own basket. | 11 | third-party |

**`speaker_intent`**

- **01** — Shortfall converted to arithmetic and a next step; distress rerouted into logistics before it can register.
- **02** — Supplies a shortfall nobody named and mislabels the gift as routine measure so no thanks can ever attach.
- **05** — Reverses the direction of the gift; help offered to him comes back as him supplying the helper.
- **06** — Mild observation of a pattern; no idea what it costs him.

**The asymmetry is visible in word count alone:** outward lines 16–17, receiving lines 7. Line 05 is the clearest instance — the player offers again and he answers by feeding them, so the offer is reversed before it can land.

Line 02 carries the recognition hook (*always the one who sees how people connect*) as behavior, and forecloses the debt in the same clause — "call it bakery weight" is the move that makes a gift unrepayable. Line 06 is third-party notice, which is how the register confirms character without any soul stating its own trait.

**Dropped:** line 03. Its only job was carrying the echo seed; the seed moved to scene business, so the slot had no remaining job. Orchestrator call, reversible.

---

## Open — does not block the card

1. **Line 04, the receive-beat — not approved.** Four versions, all flagged. The bind is structural: foreclosing an offer requires already having done the thing offered; the thing offered is feast help; anything pre-empting feast help reduces the deficit; the deficit must stay open. Routes under consideration are recorded in [`run-log.md`](../pipeline-runs/2026-07-25-giver/run-log.md). This is the beat the Giver arc turns on, so it is the highest-priority open item.
2. **The seed's sentence skeleton.** Flagged `register_drift` — `[Name] [act 1], [act 2], [withholding clause]` is structurally the Mara worked example's shape with different nouns. Whether that is the shared world dialect (fine) or this soul's signature colliding with another's (invariant 6) is unruled. Ruling on it sets the pattern for the remaining seven seeds.
3. **`delta_rule`'s raised ceiling — RESOLVED (Roc, 2026-08-03).** The ceiling went from two facts to three in the same pass that needed one more slot, and the Verifier correctly flagged the rule bending to fit content. The real defect was upstream in what the rule counted: `delta_world` held the *situation*, not a World Truth, so the rule rationed what should flow freely and squeezed what it meant to meter. The count is now two **cast** facts, with situation uncapped ([`guardrails.md`](../narrative-pipeline/guardrails.md) check 3). This scene sits exactly at the ceiling and nothing was cut.
4. **QA's non-blocking flag — RESOLVED (Roc, 2026-07-25).** Proper nouns without an in-scene referent on a first visit are **left to the player to infer.** Not blocking, no change. Consistent with the register: withhold significance, never orientation.
5. **"That boy" (line 06) — RESOLVED (Roc, 2026-07-25), and it earned a schema change.** The phrase is licensed **if the speaker is older than Toby**. Line 06 stands, with its speaker fixed as **Juno** — the Found-Family Keeper, `age_band: older` — rather than an anonymous villager. Juno earns the line twice over: she is already in the cast, so it costs no walk-on, and a woman who collects strays noticing a young man who will not be looked after is the observation landing on exactly the right person. Toby's `age_band` this life is **`young`**.

   **The real finding: NPCs have no age in the spec at all.** That is why the Content Agent reached for "that boy" unlicensed and why no Verifier check caught it. Age is now a required field — and it sits on the **role side, re-dealt each life**, exactly like the job. A soul is a pattern, not a station; it is also not an age. Nothing on the essence side may depend on it, so a "youthful" or "world-weary" trait would be an essence-vs-role defect.

   Age is load-bearing for **inter-relationships**: who defers to whom, who is addressed as "boy" or "sir", who mentors, and which pairings the reshuffle makes newly strange when a soul who was elder last life is dealt a child this one. Spec change 10.

## Downstream

**Task 2 — v5 §6.3.** This card is the Giver's canonical entry. Note that §6.3 is also stale on the **Kinbound**, which still reads "never changes, and not the player's to resolve" against the ratified amendment in [`arc-festival-slice.md`](../narrative-pipeline/arc-festival-slice.md). Both corrections land in the same pass.

**Cross-life canon store.** Fields 1–9 of `canon_flags` are what persists across reshuffles. The essence, the conviction, the recognition hook, the shelf of unopened gifts and the flask habit travel with `toby`, never with the bakery.
