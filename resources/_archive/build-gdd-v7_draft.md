# Festival of Souls — Game Design Document

# Part I: Concept & Pillars

## 1. Concept

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Outer Wilds*, *Spiritfarer*, and *Frieren*, where you **explore, collect, and discover**.

The game explores one question: what does it mean to belong, and does connection span lifetimes?

**The Hook.** *The Lantern Arch lights the way for souls to return, one night a year, so their loved ones can remember them.* That is what the whole town spends the week building toward, and it is why the festival matters to everyone in it.

You are a mage in a warm, hand-painted world who has arrived in a new town in the days before the **Festival of Souls**. You spend your time foraging, crafting, learning folk magic, and getting to know your neighbors, and by discovering spells and items and learning about people you contribute to the festival's success. The choices that you make determine the outcome on Festival night and closes on an ending vignette. One **life** unfolds across many festivals: the town grows familiar, your home fills, and your bonds deepen year over year. When you begin a **new life**, the souls return in shuffled roles — the blacksmith may now be the postman, a friend may now be a brother — while the essence and personality of each soul stays fixed. The bonds you built carry across lifetimes.

### 1.1 Inspirations

- ***Outer Wilds*** — knowledge is the key; a notebook tracks items and spells you've collected and tracks relationships between npcs you've uncovered. Knowledge travels free and never expires; the timed run becomes a move budget. 
- ***Spiritfarer*** — cozy, social-forward rhythm: the neighborly moment-to-moment of talk, gift, and tend, with the day soft-limited by the world (light fades, shops close), never an energy bar.
- ***Frieren*** — tone and voice-guide: restraint, dialogue patterns, and collectible folk magic.

### 1.2 A Truly Cozy Roguelite

Most "cozy roguelites" are cozy paint on a tension engine — they keep combat and death-as-punishment, or push-your-luck and just make it *look* cozy. We invert the mechanics themselves: each roguelite pillar is kept for its *structure* and re-tuned so it produces warmth where it would normally produce tension.

| Roguelite pillar        | Its usual tension                          | Our cozy inversion                                                                                                                              |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **The run / permadeath**| Death ends the run; you lose progress      | *Cannot be lost, only lived.* A life ends in a festival, or in a chosen new life — the harshest mechanic becomes a warm, elective reincarnation. |
| **Procedural variation**| Unfamiliar layout; threat assessment       | The reshuffle re-deals *roles* (essence fixed), and each screen re-draws its foraging from a local pool. Novelty is reunion, rediscovery, and a fresh spread each visit — never danger.                       |
| **Meta-progression**    | Unlock power to survive harder fights      | The player's own **knowledge** is the meta-progression — as in *Outer Wilds*, nothing mechanical unlocks; you carry forward *knowing more* (where to forage, how to cast, who each soul is), even onto a fresh save. Collection and bonds carry across lives alongside it — accrual of understanding and relationship, not power. |
| **Escalating challenge**| Enemies ramp up; the run tests you         | Escalating *intimacy* — bonds deepen, dialogue warms, the festival grows grander with depth.                                                   |
| **Build discovery**     | Assemble a synergy build under pressure    | Discover spells and folk magic; discovery is the reward, without the optimization stress.                                                      |

**The engine: a limited timeline and competing goals.** What drives a roguelite is push-your-luck risk — and that is the one pillar we replace outright rather than soften. Here the pressure is *time, not loss*. There is only so much time before the festival, and more worth doing than the days allow: deepen a bond, forage for a spell, help a soul's arc, gather for the festival itself. You cannot do it all, so each day you choose which goals to advance. The drive is strategic prioritization under a known, gentle deadline — decisions that matter and never sting.

## 2. Design Pillars

The 7 design pillars, each carrying the thing a builder must never do that would violate it. The refusal is the contract; the phrase is the reason.

| Pillar                                               | What a builder must never do                                                                                                                                                              |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discovery is the reward**                          | Never hand the player the answer. Watching a neighbor cast gives clues, not the spell; the player still confirms by trying.                                                               |
| **Cozy rhythm**                                      | Never hard-stop the player. No single-chain dead-ends, no forced sequence. A stuck player always has another live thing to do.                                                            |
| **Pull, not push**                                   | Never issue a directed command or a quest-arrow. The world *offers* leads; it never orders.                                                                                               |
| **Knowledge lives in the player's head, not a flag** | Never flag-block a gate the player has the knowledge to solve. Gates are *performed* (cast the correct spell, know where to find the item), never checked against a "visited X?" boolean. |
| **Non-violent core**                                 | Never resolve a beat with a fight, a fail-punish, or a threat. Conflict is social and internal, never combat.                                                                             |
| **Strategy over dexterity**                          | Never gate anything on timing, aim, reflex, or precision input. Every gate is knowledge, recall, or a social state.                                                                       |
| **Agentic AI accelerates, it never decides**         | Never ship a line no human approved. Agents generate volume and check consistency; a human reviews and approves every line before it ships.                                               |

**Note on scope.** An earlier draft (v4) also carried a Non-Goals list (no multiplayer/co-op, no tactical combat, no live-service, no hard-lose, no red-herring content). That list was dropped in the v5 revision and is not being restored — confirmed intentional, not an oversight.

# Part II: Game Mechanics

## 3. Core Loop

- **Collect.** Pick up anything collectible: components, made things, mementos, spell-phrases (knowledge), and sounds (audio-objects). Listening is Collect applied to sound.
- **Make.** Combine components plus learned knowledge into an output: a spell, a dish, a craft, a piece of art. One structure for all three.
- **Use.** Apply a held thing (a spell or an item) to a target: ignite a lantern, still the water, offer a scritch to a cat. Presenting an item or a sound to a neighbor is also a Use, with the neighbor's reaction as the result.
- **Converse.** Talk to an NPC. Distinct from Use: no object changes hands, the exchange is dialogue.

**Starting a life.** On game start you get an intro screen and select an archetype; for the slice there are two, and each life plays one week (one festival cycle) — playing both archetypes across two lives gives two festival cycles total. You start in the town or the forest. A day runs **morning → afternoon → evening** on a move budget (see #6.2). Each screen hosts solo interactions and social interactions with any souls present. The first screen teaches the four verbs by doing.

**The satchel, the notebook, the home.** You carry a satchel and a notebook. The notebook can be referenced at any time and holds the knowledge you have collected. At day's end you carry from the screen only what fits the satchel, and you return home. You can also end a day early to bank a full pack plus what you can carry in your arms (pack-triage). Your home is this life's hub: you decorate it and can carry items back out of it (they take satchel room). It starts empty at each new life; everything you've ever collected is recorded permanently in the meta-hub. When ready to move on, you open the calendar and pick the next day's location.

**The festival cycle.** A cycle is the lead-up to one festival night — one week in the slice, up to three in the full game. The lead-up builds toward festival night; the outcome depends on the choices you make. On a new run with the same save slot, the calendar turns toward next year's festival — time passes and neighbors remember what you did — and you learn what happened in the past year through dialogue. Cycles repeat within one continuous life: the roles stay fixed, and your home, bonds, and collection carry from one festival to the next.

**Ending a festival.** Each festival night closes on an ending vignette shaped by the player's decisions, then time advances to the next festival.  Each NPC has a goal for the festival that the player can assist with.  The grandness of the festival depends on how many goals are completed.

**A new life.** Beginning a new life — a fresh save slot — reshuffles the souls. Personalities stay fixed, but each soul's role in the town is re-dealt — the baker may return a healer. The bond level you build with a soul persists across lives, leading to different outcomes. As your bond deepens across lives, its dialogue **warms**: more familiar, more shorthand. Your care also shows up **obliquely** in the world — a neighbor you once helped find her voice now speaks up for a stranger, never thanking you.

### 3.1 Festival Outcome & Soft Terminal States

Festival night reads the cycle — the **bonds** you deepened and the **contributions** you made — through a single success function, and renders the result as a **spectrum, not a branch**. There are no separate festival scenes: it is one festival, dressed differently in its lighting, its vignette, and who shows up, across three tiers plus a rare top:

- **Quiet** — a modest festival; a few souls present, low warm light.
- **Warm** — the town turns out; the square fills, the lanterns are lit.
- **Grand** — a radiant festival, the fullest turnout, the Lantern Arch at its brightest.
- **(rare top) Souls-of-the-world display** — reached only at exceptional depth: the festival briefly shows the souls of the world, a once-in-many-lives tableau. This is the "going big" moment for the slice (see #9).

**What drives the tier: soul-want × role-goal.** The success function is not a points total. **Every occupation carries its own festival goal** — the blacksmith forges a new centerpiece for the Lantern Arch, the baker prepares the communal feast, the postman delivers the festival letters. Those goals are what the town is collectively trying to finish before festival night, and how far they get is what dresses the festival.

The engine is the **pairing**. Each soul has a fixed **want** (its essence — see #7); each life deals it a **role** carrying that role's goal. The pairing lands somewhere on **tension ↔ alignment**, and *that permutation is what makes the same soul's story different from one life to the next* — it is the reshuffle's narrative payload, not just a cosmetic re-skin.

Worked example, the one the pipeline generated against: **the Giver dealt the Baker.** His want is to be needed and never to receive; the baker's goal is a feast one pair of hands cannot finish. The pairing is in **tension**, so the role itself manufactures the situations his arc turns on — every baker mishap tilts toward him having to accept help. Deal the same soul a role whose goal he can discharge alone and the tension drops to **alignment**: the same essence, a different life, a different story.

**Two tracks, running in parallel and never colliding.** The festival goal is the soul's **external** objective and it moves the tier. The soul's arc — its belief shifting across the cycle — is **internal** and moves nothing on the tier. A player who never touches a soul's inner life can still drive a Grand festival by helping the town finish its work; a player who goes deep on one soul and ignores the rest gets a Quiet festival and a different story. **Neither is the correct way to play**, which is what keeps the spectrum from collapsing into a score.

The generative tables that turn this into playable content — the per-occupation mishap pool keyed to each role's goal — live in the arc doc ([`../narrative-pipeline/arc-festival-slice.md`](../narrative-pipeline/arc-festival-slice.md)), so the crew can generate encounters against it rather than having each one hand-authored.

There is **no hard-lose and no game-over**. A festival always ends *with something*: the ending vignette is guaranteed. Success is measured as **depth of connection reached** (knowledge of people and collection progress), never a score shown. The game cannot be lost, only lived.

### 3.2 Onboarding

The first screen teaches by doing. On a new save you pick a persona and open in the world with a small set of **safe, obvious hints** that teach the four verbs one at a time: something to **Collect** lying in reach, something to **Make** from it, something to **Use** it on, and a neighbor to **Converse** with. The **notebook is introduced as a found object** — you pick it up, and it is already yours. By the end of the first screen the player has done all four verbs.

## 4. Magic System

**Learned by exploring the world or conversing, confirmed by doing.** Seeing a neighbor cast on a target gives a clue, not the spell; you confirm by trying it yourself or talking to them.

- **A spell is a phrase plus components.** A spellbook section in the notebook records the spells you have learned. You learn them by successfully casting them once.
- To cast, select components from your inventory and input the phrase.
- **Physical outcomes only.** Spells produce physical effects, never a mood or a dictated behavior; the outcome is receiver-determined, and "no effect" is an honest result.
- **Cost and quality.** Anyone can cast; archetypes carry different mana, which shapes a cast's *quality* (a bigger or smaller fire), never whether you can cast at all. *(Mana floors that a low-mana caster can't meet are parked for post-slice — no slice spell gates on mana; see [`../parking-lot.md`](../parking-lot.md).)*
- **Starter set:** `ignite` (sticks), `scratch` (wool), `breath` (grass + dirt).
- **Magic unlocks screens.** Casting is a knowledge-key: watch a neighbor burn a dry hedge to clear it, then do it yourself to open the way. Traversal is gated by what you know, not a flag.
- **Slice count:** 10 spells.

### 4.1 Receiver-Determined Outcomes

The target of any directed interaction determines the outcome. **The action verb encodes only what was done, never what happened.** Ignite-on-sticks catches; ignite-on-a-person does nothing. Spells produce physical outcomes only: they never set a mood or dictate a behavior.

## 5. Collectibles

| Category                   | Role                                                                  | Persistence          | Examples                            |
| --------------------------- | ---------------------------------------------------------------------- | --------------------- | ------------------------------------ |
| **Components**             | Foraged magic ingredients, consumable; feed Magic casting and Make    | pack-triaged         | a berry · a river stone · a feather |
| **Made things**            | Outputs of Make (dishes, crafts, art); some consumable, some giftable | pack-triaged         | a warm loaf · a small carving       |
| **Mementos / keepsakes**   | Hub decoration and achievement markers                                | pack-triaged         | a worn ribbon · a pressed flower    |
| **Gifts**                  | Key Items to give to NPCs to advance story                            | drawn from above     | a given keepsake                    |
| **Sounds** (audio-objects) | Travel free, no pack space; show / gift / spell-component             | free, like knowledge | a festival bell · a hummed tune     |
| **Tools**                  | Non-consumable Use-family items                                       | pack-triaged         | a lantern · a small knife           |

**Scope:** roughly 3 per category, about 15 distinct items (gifts overlap mementos and made-things); final counts from the content budget.

**Availability is randomized per screen.** What you can forage or find on a screen is drawn from that location's pool, so no two visits offer the same spread — the forest may hold river stones today and feathers tomorrow. This feeds the limited-timeline engine (#1): you adapt the day's goals to what's actually out. **Guardrail:** the *items* a knowledge-gate or a soul's arc depends on are exempt — always obtainable, never randomized out. The *components* you forage to cast the spells that acquire them may be random, but they come from the location pools with more than one source, so a missing component means foraging elsewhere or coming back, never a dead-end (the **Cozy rhythm** pillar — see #2). Randomness sets the day's *path*, not whether the goal is reachable.

## 6. World & Progression

### 6.1 Save-State: What the Save File Records

The game tracks save-state across two boundaries: **within a life** (festival to festival, as the calendar turns) and **across a new life** (starting a fresh save slot, which reshuffles). A player can delete a single save slot to wipe just that life — the meta-hub and other slots are untouched. A hard wipe of the save data from disk erases everything, including the meta-hub; nothing survives it (a distinction carried over from v4, dropped in the v5 consolidation, restored here since it holds for all data, not per-slot). There are 3 save slots — three parallel lives on separate timelines; the meta-hub collection is shared across all of them, while each life's in-game home starts empty.

| Data                                                          | Within a life (festival → festival)                                        | Across a new life (new slot)                                                                        |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **Spells**                                                    | Yes, in the notebook                                                       | Yes, in the notebook                                                                               |
| **Sounds** (audio-objects)                                    | Yes                                                                        | Yes                                                                                               |
| **Physical items** (components, made things, mementos, tools) | Kept in your home across festivals; the satchel carries between locations  | **No** — the new life's home starts empty                                                         |
| **Bond level** (per soul)                                     | Yes, grows                                                                 | Yes, carries across lives                                                                          |
| **Roles / relationships**                                     | Fixed                                                                      | Re-dealt                                                                                           |
| **In-game home** (this life's décor)                          | Yes, accrues across festivals                                              | **No** — a new life starts empty                                                                   |
| **Meta-hub collection** (items *held* · sounds *heard*)       | Grows as you discover                                                      | **Yes** — permanent; shared across lives; new finds unlock as display pieces, never for use in play |

### 6.2 The Game Clock

Time in the game follows this structure:

- **Day.** A day runs **morning → afternoon → evening**. You open in the morning with a move budget (about 3–5 screen-moves); the time then turns to afternoon, where you may move to a new location or stay for a few more moves (about 3). The day ends in the **evening**, at whatever screen you're on — when evening-only spots like the Tavern are open — then you return home and pick the next day's location.
- **Festival cycle.** The lead-up to a festival night — one week (currently 5 days, expandable) in the slice, up to three weeks in the full game — then festival night and its ending vignette.
- **The turn of the year.** After each festival the calendar advances toward next year's festival; time passes, neighbors remember, and the next cycle begins in the same life.
- **A life (a save slot).** Many festival cycles, continuous: `cycle → festival → turn of the year → cycle …`. Roles stay fixed; home, bonds, and collection accrue across festivals.
- **A new life (a new timeline).** Starting a fresh save slot reshuffles / re-deals roles (essence and personality fixed); bonds carry across.

### 6.3 Essence vs. Bond — Two Things Tracked, Never Feeding Each Other

**The essence side is fact** — assertable, confirmable, and revisable: what you have learned and can prove about who a soul is. It is what any future recognition gate would check. **The bond side is emergent** — a single hidden count that accretes from how you treat a soul, never shown and never split into stored sub-scores. It is what warms a soul's dialogue across lives (#3) and produces the oblique reciprocity described below. Essence is deduction; bond is relationship — neither feeds the other. This split is load-bearing for the narrative pipeline: [`../narrative-pipeline/guardrails.md`](../narrative-pipeline/guardrails.md) check 2 (Superposition) enforces it directly.

### 6.4 The Persistence Engine (Runtime)

The shipped game's memory is ordinary game code, not a model call. A persistence engine remembers your incarnations, tracks the bond level per soul (the single hidden count above, accreted from weighted interactions across four action-categories — trust · intimacy · recognition · respect — with per-soul card-trait coefficients; the full weighting mechanism is specced in [`../narrative-pipeline/pipeline.md`](../narrative-pipeline/pipeline.md) step 9), gates the calendar, re-deals roles and relationships at life boundaries, and surfaces soft in-world reminders.

**That same hidden count drives the oblique reciprocity** (#3): as it rises, the runtime selects warmer dialogue variants for that soul — a bond-driven text *selection*, not a new system. Runtime LLM calls, cloud-token usage, and AI cost are all zero at play time; the dev-crew's only obligation toward this system is to author the schema the runtime reads (see #11).

## 7. Cast (Souls)

Every soul is built on the essence/role split (the `narrative-pipeline` persona-card schema): the **essence** — a want plus a repeated behavior — is invariant across lives; the **role** (blacksmith, postman) is re-dealt each new life. The personality never changes; the job does. The full village is **3 deep + 5 texture (~8 souls)**; each life instantiates most of them — fate deals 1–2 as "past" (away or already gone), so every life carries a felt absence. Names below are working placeholders.

### 7.1 Deep Souls (3) — Bond-Viable, Hand-Authored Arcs

Each embodies a different *theory of belonging* the player weighs.

| Soul | Essence — want + behavior | Conviction | Recognition hook | Arc |
|------|---------------------------|-----------|------------------|-----|
| **The Keeper** *(working name: Mara)* | Belonging is *tended*: keep the festival — and the connection it anchors — from slipping into the past. Tends the anchor-spot compulsively, keeps a drawer of unclaimed objects and a corner "set for two," mends small broken things unasked, speaks of the place in the past tense. | Won't leave, won't let the tradition lapse or the anchor be moved — leaving = admitting the loss is final. *(The child's whistle in the drawer is not for sale.)* | Always finds the beauty in things — most in what's passing. | Clutch → transform: the bond *re-forms*; loss isn't permanent. |
| **Toby** — the Giver *(m)* | Belonging is *earned by being needed*. **Behavior cluster:** wants to be kept and believes keeping must be earned; reads the room for who is short of what and supplies it before being asked; converts anything given to him into a debt he repays in goods. Deflects to the unfinished task in the room. Exact about other people's quantities and timings, vague about his own. Warmth arrives as anticipation — the thing handed over a beat before it's reached for, and never explained. *Generated and gated through the crew, 2026-07-25; full card in [`../pipeline-runs/2026-07-25-giver/giver-persona-card.md`](../pipeline-runs/2026-07-25-giver/giver-persona-card.md).* | He will not accept care he has not paid for. | Always the one who sees how people connect. | Can't receive → can: being *claimed* unearned frees him; the player's "I see you" is the corrective. |
| **Ilsa** — the Kinbound *(f)* | Belonging is *given*: blood, family above all. **Behavior cluster:** wants her people gathered where she can see them, and holds that being hers is a fact rather than an achievement. Sets places before anyone answers, counts arrivals against a number she never says, and quietly covers a gap so nobody has to remark on it. Deflects attention onto *placement* — a chair pulled out, a spot cleared. Exact across long spans (lineage, years, whose table this is), loose across recent ones (what was promised, when, by whom) — which is precisely what lets an absence go unexamined. Warmth arrives as **inclusion**: the plate is down before anyone said you were coming, and nobody is told it was set for them. *Generated and gated through the crew, 2026-07-25; full card in [`../pipeline-runs/2026-07-25-kinbound/ilsa-persona-card.md`](../pipeline-runs/2026-07-25-kinbound/ilsa-persona-card.md).* | Family above all — loyal to blood, and slow to accept that loyalty runs both ways. | Always gathers people to a table. | *Blood is given → blood is tended.* Stays blood-first; learns only that a bond you were handed does not hold itself up. **Never arrives at chosen-family** — that stays the Found-Family Keeper's stance, and the village keeps arguing. The world still re-deals blood each life, and the Kinbound still never learns *that*. |

### 7.2 Texture Souls (5) — Social-Only, One Salient Signal Each

They counter-voice the deep trio so the whole village argues *"what is belonging?"* from every corner.

| Soul                                     | Belonging-stance                                                                     | One salient signal                                                                                     |
| ----------------------------------------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Nell** — the Content Server *(m)*      | Needed — and at peace with it (a counter-voice to the Giver)                         | Hums while working; never keeps score.                                                                 |
| **Juno** — the Found-Family Keeper *(f)* | Belonging is who you *choose* (counter-voice to the Kinbound; the game's own thesis) | Her "family" is a patchwork of unrelated people who all found each other. Advocate for "found family". |
| **Linnet** — Half of a Pair *(f)*        | The one bond, out of reach — soulmates split by timing (the pairing-mirror)          | Keeps a small habit for someone now married to another — a saved seat, a route past their window.      |
| **Pip** — the Wonder-Seeker *(m)*        | Belonging is in shared wonder, out there to find                                     | Drags people to see small marvels; always mid-discovery.                                               |
| **Bex** — the Rule-Breaker *(m)*         | Says "you belong" plainly — the authored exception                                   | Names the feeling out loud where everyone else deflects.                                               |

*Stances and salient signals are locked from the H1 roster decisions ([`phase-3-decisions_draft.md`](phase-3-decisions_draft.md)). Names and genders are settled, and both deep-soul behavior clusters are closed (2026-07-25) — Toby and Ilsa were each generated and human-gated through the crew.*

**Name and gender are fixed; role and age are re-dealt.** A soul returns each life under the same name and the same gender, so the player can recognize them — the reshuffle changes their *position* in the world, not their identity. Making name and gender re-deal too would leave behavior as the only handle, which is the Obra-Dinn-style recognition puzzle this game deliberately parked ([`../parking-lot.md`](../parking-lot.md)). The promise in #1 — *a friend may now be a brother* — needs a recognizable person on the other side of it.

**The cast is 4 men and 4 women.** Nell is male on purpose: the Giver is a man who cannot stop giving, which inverts the usual coding of caretaking, and his direct counter-voice being a woman serene in service would have quietly re-installed the trope the Giver exists to break. The contrast between them is *earning versus ease* — it was never gender.

### 7.3 Age Is a Role Field

Each soul carries an `age_band` alongside its `role_tag`, and it is **re-dealt every life exactly like the job** — a soul is a pattern, not a station, and not an age either. Nothing on the essence side may depend on it, so a "youthful" or "world-weary" trait is a defect. Age is what makes the reshuffle bite in a channel the roles alone don't reach: a soul who was `older` last life can be dealt `young` this one, so every deference relationship inverts while the essence holds. It is also load-bearing for ordinary dialogue — who defers to whom, who is addressed as "boy", who mentors. Without it the crew invents age terms unlicensed and no consistency check catches them.

**Three bands, all role-capable.** The range is deliberately bounded: **every band must be able to hold every role**, or the reshuffle breaks — a soul dealt "child" could not run the bakery, and the role-deal would have to route around them, which contradicts the whole premise. Village life does the rest of the work; older people here still work.

| `age_band` | Rough years | Reads as |
|---|---|---|
| `young` | late teens – late 20s | Addressed as "boy"/"girl" by elders; still proving themselves |
| `middle` | 30s – 50s | The default; peer to most of the town |
| `older` | 60s+ | Deferred to; addresses the young familiarly |

Three bands drive every address term and deference relationship without adding a band that breaks role-dealing. **Life-one assignment:** `young` — Toby, Pip · `middle` — Mara, Nell, Linnet, Bex · `older` — Ilsa, Juno.

## 8. Levels

### 8.1 Town

The festival's home — one scene plus the Square.

- **Square** *(start)* — under the Lantern Arch, which ages across the years; where you arrive.
- **Town scene** — the lived-in heart: market stalls, the commons and well, and the main NPCs at their work (a blacksmith's bench, a baker's counter). NPC homes open here at a certain bond level (a running social state, which the **Strategy over dexterity** pillar allows as a gate — see #2). The Tavern corner opens in the evening.

### 8.2 Forest

One screen plus two knowledge-gated unlocks.

- **Forager's Clearing** *(start)* — Onboarding the first time; a normal screen thereafter.
- **Unlock 1** — a path cleared by a spell (e.g. ignite a dry hedge).
- **Unlock 2** — a secret path learned from an NPC.

### 8.3 Festival Grounds

The final screen.

### 8.4 Home Hub

Two spaces sharing one asset set:

- **In-game home.** Your home during a life — return at day's end, bank what fits the satchel, and decorate it. It resets empty at the start of each new life.
- **Meta-hub (main menu).** The role-select screen doubles as your permanent collection: every item *held* and sound *heard* is recorded, completion tracked across all lives, and each life's new finds unlock as display pieces you arrange. It shares the home's decoration assets, but its pieces are display-only — never withdrawable into play.

# Part III: Art, Audio & AI Architecture

## 9. Art Direction

### 9.1 Tone

**Tone words:** Ghibli-warm, painterly, quietly melancholic, lived-in, with dialogue modeled on *Frieren*.

Concept references set the rules, not the assets: the desaturation discipline and flat emotional register of *Frieren*, the palette warmth and environmental wonder of Studio Ghibli, the static-camera living-diorama of *Myst*. No imagery is reproduced.

### 9.2 Built in 3D

The planned engine is Unreal, using the Point-and-Click toolkit from the Fab marketplace. The goal is 3D levels for visual depth, with one built environment reused from many angles: one 3D location yields many static-camera scenes.

The replayed festival week across the turn of the year then renders cheaply: the same level at a different angle, time-of-day, or seasonal state gives the "time moved, we returned" read with no intertitle.

**Locked 2026-07-18** ([`phase-3-decisions_draft.md`](phase-3-decisions_draft.md) H17): 3D wins on depth-for-free (parallax without hand-painting it) plus reusing levels across angles/time-of-day/season states — roughly 3 builds plus state variants, not 9 separate builds.

**The risk + its mitigation.** 3D can read sterile and un-Ghibli, so warmth is held by a system rather than by hand-finishing every asset — the **No Man's Sky model**: a hard-constrained palette (bands, not a free wheel), a locked silhouette vocabulary every generated variant reads as a variant *of*, and one key-art board plus one review eye. Cohesion comes from *rules + one review eye*, not per-asset hand-finishing. This is exactly the contract the Style/Art-Direction Agent below checks against.

### 9.3 Going Big

There is no single global "epic" register. Each domain of a big moment gets the register that fits it, and the words stay plain in all of them: social payoffs stay narrative-dialogue driven, while world-opening and magic carry the Outer Wilds revelation and Ghibli awe.

The swell is visual, scale, or revelation — the festival's souls-of-the-world display (see #3.1) is the slice's one authored example. Wonder is also sprinkled in mid-run moments, framed either large (a wide tableau) or small (a zoomed-in detail).

### 9.4 The Style / Art-Direction Agent

Owns the visual cohesion contract: the color grammar (bands, not a free wheel) and the silhouette vocabulary, expressed as **machine-checkable rules**. Checks each generated art variant reads as a variant *of* the locked vocabulary, flagging palette drift and silhouette breaks. Generates no final art and sets no story; it names and checks the rules a variant must satisfy.

- *In:* `{ new_assets:[{ asset_id, asset_type }], locked_palette_bands, silhouette_vocabulary, key_art_ref }`
- *Out:* `{ variant_checks:[{ asset_id, status:"PASS|FLAG", rule_violated }], palette_delta }`
- *When:* whenever new visual assets enter the slice. *Gate:* soft: the single review eye signs off flags.

See #11 for this agent's place in the full roster and token budget.

## 10. Audio

### 10.1 Sonic Identity

Music inspired by Joe Hisaishi and the Studio Ghibli films. Ambience and items grounded in foley libraries and field recordings. Magic follows an anime style. UI is tactile, with fantasy flourishes where appropriate.

Sound is the strongest retrospective trigger a person has, which is why the audible essence-signature is the deepest recognition clue: **the deepest soul's leitmotif surfaces from the festival mix once you have noticed and matched a detail about them across lives** — the leitmotif is triggered by a detail the player *caught and connected*, never by an accrual counter ticking over — so you can recognize someone by their sound before you can name them.

**Guardrail:** don't wire the leitmotif to any counter. It triggers on a noticed-and-matched detail only — this is what keeps it a recognition mechanic instead of a progress bar.

Sounds are collectible objects that travel free like knowledge (see #5): you can show one to a neighbor (the leitmotif probe), gift a recorded melody as a declaration, or use one as a spell component. You record deliberately, never knowing which sound will matter, and its significance lands later.

### 10.2 The GameplayTag → Wwise System

One idea runs the whole game: a single, department-agnostic tag names each gameplay event, and a lookup table turns that tag into sound, text, and art at once. A strict file-system hierarchy and folder map provide self-documenting asset connections and help an LLM derive where assets live.

```
<Entity>.<Interaction>[.<Phase>]   →   Wwise event · dialogue key · animation/VFX   (per department, via the tag-to-asset library)
```

- **Naming rule:** tags are hierarchical, department-agnostic (no `Audio.` / `Text.` / `Art.` prefix), and extensible: new content adds new tags, never a new scheme or an enum edit.
- **Resolution rule:** every department reads the *same* tag through its own resolver column in the library. Adding a department means adding a column.
- **CI note:** a validation pass (WAAPI-backed) flags orphan tags (a tag with no mapping) and missing mappings — the same collision and orphan check the Audio-Tag Agent runs, promoted to a build check so the library cannot silently drift.

**Implementation detail.** Triggers are department-agnostic Unreal GameplayTags, resolved to Wwise events through a data-driven tag-to-asset library.

- **One tag is a game-wide gameplay-event key, with no department prefix.** Each event is a hierarchical, extensible GameplayTag: `<Entity>.<Interaction>[.<Phase>]`, for example `NPC.Chef.Show.React` and `NPC.Chef.Ask.React`. One tag names one event, game-wide. The hierarchy grows by adding tags as content grows: no fixed enum, no schema change.
- **A tag-to-asset library resolves each tag per department.** The same tag maps to a Wwise event (audio), a dialogue line or key (text), and an animation or VFX asset (art): one tag, N department resolutions, so a single gameplay event drives sound and text and art together. The library (an Unreal DataAsset / DataTable) is the single source of truth, unaffected by assets being moved or renamed.
- **Direct event targeting.** Gameplay fires the event by tag lookup; each department reads its own resolution. Wwise Switches, States, and RTPCs are reserved for genuine runtime variation only (material-based footsteps, intensity or time-of-day ramps).

The Show and Ask interactions carry distinct interaction names because an NPC reacting to a shown sound resolves to different audio and dialogue than a spoken probe.

**Middleware is Wwise** (locked): familiar, scriptable, and WAAPI is the natural home for library tooling and validation.

**Ownership.** The tag namespace is shared and game-wide. The Audio-Tag Agent (below) owns the audio resolution: it proposes compliant tags and maps and verifies each tag's Wwise-event entry, flagging collisions and orphan or missing audio mappings. It generates no audio and assigns no style or emotion. Text and art resolutions are owned by their own department passes, keyed off the same tags.

### 10.3 The Audio-Tag Agent

Owns the audio-tag contract that makes the system above work. Takes new entities plus the current tag-to-asset library and produces a compliant Unreal GameplayTag per required audio trigger, mapped to a Wwise event, checking each proposed tag for collisions and orphan or missing mappings. Generates no audio and assigns no style or emotion: it names and verifies format only.

- *In:* `{ new_entities:[{ entity_id, entity_type:"npc|object|scene|spell" }], required_interactions:[…from the four verb families, see #3…], existing_tag_library }`
- *Out:* `{ new_tags:[{ entity_id, gameplay_tag:"NPC.Chef.Show.React", wwise_event, collision_flag, orphan_flag }], library_delta, violations:[…] }`
- *When:* schema / pre-production, whenever new entities enter the slice. *Gate:* soft: the library delta is reviewed and auto-commits on no objection.

See #11 for this agent's place in the full roster and token budget.

## 11. AI Agents and Pipeline

A small, human-gated crew turns approved GDD decisions into game content and validates it — one agent per feature, each doing bounded, structured work.

**The roster.**

| Agent                     | Input                                                                         | Output / Responsibility                                                                                                                                                                                      | Token Budget |
| ------------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ |
| **Orchestrator**          | Session goal, pipeline stage, arc-doc + NPC-codex refs, human authored intent | Sequences the crew: hands each worker its input, collects the typed output, and surfaces the human gates. Resolves conflicts when outputs disagree.                                                          | 200K         |
| **Narrative Director**    | Corpus lore, roster seeds, human steering intent                              | Steering — surfaces corpus lore, proposes the arc-doc fields + generative tables, drafts the arc doc for Roc's ratification. Distinct from the Architect: Director sets *direction*, Architect builds *structure* from the ratified arc doc. | not yet budgeted |
| **Narrative Architect**   | NPC descriptions, scene list, voice guide                                     | Story structure: persona cards, the seed→payoff echo map, and the NPC codex of locked facts. Writes no player-facing lines. | 300K         |
| **Content / Dialogue**    | Persona card, scene context, tone enum, output from Narrative Architect       | All player-facing text — NPC lines, lore, descriptions.                                                                                                                                                      | 700K         |
| **Consistency Verifier**  | New lines, active canon, the 8 locked invariants                              | Flags each batch against the invariant set + voice register. Flags only — never rewrites.                                                                                                                    | 300K         |
| **QA / Playtest**         | Scene graph, gates, interaction specs                                         | Verifies the assembled slice is traversable and works as specced: no soft-locks, dead-ends, or unreachable wins. Flags only.                                                                                 | 250K         |
| **Style / Art-Direction** | New assets, palette bands, silhouette vocabulary                              | Checks each art variant against the color grammar + silhouette rules; flags palette drift and silhouette breaks. Full system + schema: #9. | 100K         |
| **Production / PM**       | Milestone calendar, task status, review-queue depth, remaining time           | Maintains the backlog, tracks the human-review queue, flags the unscheduled review-week and back-loaded work, and produces a weekly readiness summary. Makes no design or content decisions; surfaces risk and sequencing to the human. | 50K          |

**Note on the Narrative Director.** This agent runs in `narrative-pipeline/agents/` and owns Stage 1 (Arc), but earlier GDD drafts (v4, v5) never listed it in the roster table above — an accuracy gap fixed by the 2026-07-26 restructure.

**Production / PM Agent, in detail.** Owns the schedule, not the content: maintains the milestone-aligned backlog, tracks the human-review queue (the load-bearing bottleneck — see #11.0), flags the unscheduled review-week and back-loaded work, and produces a weekly readiness summary. Makes no design or content decisions.
- *In:* `{ milestone_calendar, task_status, review_queue_depth, remaining_time }`
- *Out:* `{ prioritized_backlog, scope_cut_recommendations, review_week_flags, readiness_summary }`
- *When:* weekly, and at each milestone boundary. *Gate:* advisory only; the human decides.

**Budget.** One chat's context window is ~1M tokens. We assume a **3M total budget**: the crew above shares **2M**, and **1M is reserved for the technical track** (programming, Unreal MCP integration).

### 11.0 Measured Cost — What the Crew Actually Costs

The per-agent allocations above were estimates. On 2026-07-25 the crew was **run**, not modelled: a 5-arm model benchmark plus a full generation of one soul through the stage-2 sequence, 27 agents across two phases. Evidence: [`../pipeline-runs/2026-07-25-giver/RESULTS.md`](../pipeline-runs/2026-07-25-giver/RESULTS.md).

**Cost does not scale by soul. It scales by how many times a soul speaks.**

| Unit | Measured | Scales with |
|---|---|---|
| Architect — one soul's persona card + echoes | ~51K tokens | **Souls** — paid once each |
| Content + Verifier — one soul appearing in one scene | ~107K tokens | **Soul-appearances** |

```
cards        8 souls × 51K   =  411K
remaining    2M − 411K       = 1.59M
appearances  1.59M ÷ 107K    =  ~15
```

The slice runs five days × three time-blocks = **15 scene-slots**. So the 2M crew budget affords roughly **one soul-appearance per time-block across the whole festival week, with zero revisions.** That is the real scope constraint on the roster in #7 and on how populated any given scene can feel.

**Three findings that change how the budget should be read:**

1. **Revisions, not generation, are the cost.** The demo run spent **79% of its tokens on revisions** — 3.8× the generation they corrected. The 2M is therefore **a revision-discipline budget, not a generation budget.** Two levers hold it: a hard cap of two revisions per item for any worker (which does not reset at a human gate), and — the one that actually makes revisions *rare* — briefing every revision with the **full constraint set** rather than just the defect. Given a single-axis instruction, the Content Agent reliably fixes that axis and silently spends another constraint; it did so four times out of four.
2. **Depth is not the cost driver.** A texture soul costs nearly the same per call as a deep soul, because the cost is the spec context each worker carries, not the soul's complexity. Adding texture souls is cheap only if they rarely appear.
3. **Handing workers their material instead of making them fetch it cut billed volume 6.9×.** This is a harness decision, not a model decision, and it was the single largest efficiency lever found.

**In money, the same slice is ~$26** at run cost (~$100 with revisions at the observed rate). **The token budget binds long before spend does** — so model-tier choices are made on **quality, with cost as the tiebreak**.

### 11.1 Operating Rules

- **Call down, signal up.** The Orchestrator hands each worker its input and collects a typed output; workers never call each other, so each stays testable in isolation.
- **The human gate lives at the output.** A human reviews and approves; nothing ships unread, and a broken output is never silently swallowed.
- **Bounded work only.** Every agent does structured output, classification, or string-pattern work.
- **Scope the model to the task.** Use stronger reasoning models for orchestration, lower-tiered models for individual tasks. **Benchmarked, not assumed** (2026-07-25): the structure slot needs the stronger model — the cheaper one produced a card whose personality axes were not independent, the defect that makes a whole cast read as one character in different hats. The prose slot went the *other* way than expected: a prose-tuned model beat the general ones on a deliberately flat register, because holding that register is a cadence skill rather than a restraint problem. Both choices cost more than the alternative; quality decides, cost breaks ties.
- **Two revisions per item, then a human looks.** Any worker, any flag type, and the count **does not reset at a human gate**.
- **Every revision brief restates the full constraint set**, never only the defect. A brief that names one problem is an instruction to trade something else for it.
- **When handing down an axis that varies, state what stays constant.** A spread given without its invariant is an underspecification, and the crew will resolve it in whichever direction the words lean.

### 11.2 Recommended Workflow

The content pipeline runs in stages, each gated at its output:

1. **Steer.** Human directs the Narrative Director on intent and story arc — the per-arc doc: where each soul is heading, the threads to keep alive, and what the arc is *not*.
2. **Schema.** The Narrative Architect fills the persona cards, the echo map, and the NPC codex. *[human gate]*
3. **Graph.** Orchestrator lays the scene graph as preconditioned encounters, and specs each gate.
4. **Prose.** The Content Agent writes one slot at a time in the voice register.
5. **Check.** The Consistency Verifier flags the batch against the invariant set; an automated pass strips the AI tells and checks against [`../narrative-pipeline/register.md`](../narrative-pipeline/register.md).
6. **QA.** The Playtest Agent confirms the slice is traversable and every interaction works.
7. **Approve.** A human approves every line at the output. Nothing ships unread.

### 11.3 Worked Example: One Decision Through the Crew

To show *call down, signal up* end-to-end, follow a single player action — the player casts **ignite** on a **person** instead of on a **stick** (a receiver-determined outcome, #4.1). Nothing here is authored line-by-line in advance; the crew resolves it in sequence, and no worker ever calls another.

1. **Orchestrator — calls down.** Registers the cast: verb `ignite`, target = a soul (not a prop). Because the receiver is an NPC, this is a social/canon touch, not just a physics result, so it hands the beat to the Narrative Architect first.
2. **Narrative Architect.** Pulls the target soul's persona card — essence, voice register, conviction. Confirms `ignite`-on-a-person has no physical effect (people don't catch), and sets the *reaction* in-character per the soul's essence: startled, amused, or unbothered. Returns a beat spec (who · register · intent); writes no player-facing line.
3. **Content / Dialogue.** Writes the reaction in that soul's voice register — a physical, in-world response, never a mood-dump. For Mara, matter-of-fact: *"Save it for the kindling."* Returns the line.
4. **Consistency Verifier — flags up.** Checks the line against the locked invariants: physical-outcome-only (no spell set a mood), receiver-determined (ignite did nothing *to* the person), and voice register (matches Mara's clause economy). Flags mismatches; never rewrites.
5. **QA / Playtest.** Confirms the beat leaves the scene traversable — no soft-lock, the player can still act, nothing needed for a later screen was consumed.
6. **Orchestrator — signals up.** Collects the typed outputs and raises the human gate. A human approves the line; nothing ships unread.

Every worker took its input from the Orchestrator and returned a typed output; the Orchestrator sequenced them and surfaced the gate — *call down, signal up*, with no worker-to-worker calls.

### 11.4 Build-Time Agent-to-Component Plan

Which agent builds each component, and the human role at each gate.

| Component                                                               | Build agent(s)                      | Human role                                            |
| ------------------------------------------------------------------------- | -------------------------------------- | -------------------------------------------------------- |
| Orchestration + session-state bus                                       | Orchestrator                         | Frames scope, reads surfaced gates                     |
| Steering / arc doc                                                      | Narrative Director                   | Ratifies the arc doc before it propagates              |
| Persona cards + echo map                                                | Narrative Architect                  | Hard gate: reviews cards + echo map                    |
| Player-facing text (dialogue, lore, echoes)                             | Content / Dialogue Agent             | Reviews flagged / echo / retrospective lines            |
| Consistency check vs. canon                                             | Consistency Verifier                 | Signs off every flag                                   |
| Level / gate layout → scene graph                                       | Human → QA Agent                     | Human authors layout; QA validates traversal            |
| Traversal / reachability QA                                             | QA / Playtest Agent                  | Triages flags; human playtest is the fun signal         |
| Style guide (color grammar + silhouette vocab)                          | Style / Art-Direction Agent          | Single review eye signs off flags                      |
| Audio tag contract (GameplayTags → Wwise)                               | Audio-Tag Agent — see #10 | Soft gate: library delta auto-commits on no objection |
| Schedule + review-queue tracking                                        | Production / PM Agent                | Human decides on flags and scope-cut recommendations    |
| **Engineering track (persistence · ink↔UE · tag-to-asset · save/load)** | **Human, AI-assisted**               | Human owns architecture; AI assists, never decides       |

**The Engineering track** is human-owned with AI assist. The persistence save is load-bearing (see #6), and the pillar says AI never decides architecture, so a human owns it and AI assists. A **week-1 save/load smoke test** proves the reshuffle carries state before any content depends on it. The two parallel build tracks (Track A: narrative proof, Track B: visual/asset build) are described in #12.

# Part IV: Technical Strategy & Scope

## 12. Technical Overview

**Engine & prototype.**

**Full vertical slice.** Ink Script backend integration to Unreal (UE5), the Point-and-Click toolkit (Fab marketplace), Wwise audio middleware (see #10), 3D static-camera scenes.

**Fast prototype.** ink + html: the fastest way to prove the narrative pipeline in a browser. Ink is **not throwaway** — it is the production narrative engine, carried into Unreal via ink-to-UE integration (`inkcpp` / `Inkpot`; see [`ink-unreal-integration.md`](ink-unreal-integration.md) for the engineering evaluation). The ink content graph built in prototype is the same graph the slice ships on.

**Two build tracks (so review never blocks assets).**

- **Track A: narrative pipeline proof (ink/html).** Proves the seed-to-payoff loop and the content pipeline. Gated by line review.
- **Track B: visual/asset build (Unreal).** Environments, static-camera scenes, audio tags. Runs independently, so review time never stalls visual work.

See #11 for which agent builds which component across these two tracks.

### 12.1 Minimum / Target Acceptance

Each risky feature gets a floor bar and a reach bar:

| Area              | Minimum acceptance                                             | Target acceptance                                                 |
| ------------------ | ------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| **Core loop**     | One week loads and reaches festival night.                     | Plus the turn of the year + a decision-based ending vignette.      |
| **Reshuffle**     | One hand-scripted role-swap plays on camera.                   | A second hand-authored reshuffle instance is built to prove the concept out. *(This is a build/proof-scope target — how many reshuffle instances get hand-authored for the demo — not a cap on the live mechanic, which is #7's per-soul re-deal, unbounded in the shipped game.)* |
| **Save-state**    | Bond + collection persist across one new life.                 | 3 save slots; meta-hub shared; in-game home resets empty.         |
| **Deep-soul arc** | 1 soul's arc hand-authored, reads distinct, seed→payoff lands. | Agent-generated lines pass the side-by-side distinctness read. **Met 2026-07-25** — a blind, model-labels-stripped read of five arms; the winning arm returned 6 of 6 shippable lines. |
| **Festival**      | One festival scene renders at day's-end.                       | 3 tiers (quiet/warm/grand) + the rare souls-of-the-world display. |
| **Reciprocity**   | Bond persists across lives.                                    | Dialogue visibly warms over repeated lives.                       |

### 12.2 Definition of Done

- **You can play one week through to the festival** — the full core loop, start to festival night.
- **The game reshuffles** — a new life re-deals the souls' roles.
- **The game saves and restores state** — bond levels and collection persist across a new life.
- **One soul's storyline is complete** — the single deep-soul arc plays end-to-end, seed to payoff.

## 13. Scope & Risks

### 13.1 MUST / SHOULD / STRETCH

The floor stated directly (not inferred from a cut-list). MUST is the true MVP — it is exactly #12's Definition of Done. SHOULD is the intended slice. STRETCH is reach.

| Tier        | Narrative                                                                                      | World / Levels                                                                                          | AI-Pipeline                                                                                       |
| ----------- | -------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **MUST**    | 1 deep soul's arc complete end-to-end (#7); one seed→payoff echo lands                        | Forest (1 screen + 2 unlocks) + Town (Square + 1 scene) + Festival; one week playable to festival night | Persistence save + reshuffle works; Content + Consistency agents produce & check one soul's lines |
| **SHOULD**  | 3 deep souls' key lines authored & distinct side-by-side; oblique reciprocity (dialogue warms) | 3 festival tiers rendered; bond-driven dialogue change on a repeat reshuffle                          | Full crew runs; a second hand-authored reshuffle instance demonstrated on camera |
| **STRETCH** | All 5 texture souls fully written; the souls-of-the-world display top tier                     | Extra forest screens; richer effects                             | Style/Art-Direction agent automated; Production/PM agent live; ink→UE integration spike |

### 13.2 Sequencing Gates (Do-Not-Until Rules)

- **Don't author a second hand-authored reshuffle instance until one plays end-to-end.**
- **Don't build out texture souls until the 3 deep souls read as distinct** side by side.
- **Don't gate Track B (visual build) on content** — keep Tracks A/B parallel so review never blocks assets (#12).
- **Don't wire the leitmotif to any counter** — it triggers on a noticed-and-matched detail (see #10).
- **Week-1: prove save/load carries state across a reshuffle** before content depends on it.

### 13.3 Top Risks (With Fallback)

- **NPC perceptual distinctness (the differentiator's soft spot).** Whether the essence-signature card pipeline yields perceptibly distinct neighbors needs real writing samples against the voice guide. Because each soul is derived from a different primal ([`../narrative-pipeline/templates/persona-card-schema.md`](../narrative-pipeline/templates/persona-card-schema.md)), the distinctness is generated and **checkable on paper**, not merely asserted. *Validate:* generate the 3 deep souls' key lines and read them side by side (see #11.3). *Fallback:* hand-author the 3 deep souls; agents handle texture NPCs only.
- **The reshuffle / persistence engine coherence.** The on-camera role-swap must read as the same soul in a new role. *Validate:* the ink prototype demonstrates one reshuffle end to end. *Fallback:* hand-script the single on-camera swap for the slice; generalize later.
- **Ink-to-Unreal integration.** The narrative engine must carry from ink into UE. *Validate:* an early integration spike. *Fallback:* ship the slice as the ink/html build if UE integration slips.
- **Human-review bottleneck (about half a week of review time).** *Fallback:* cut to the MUST column only — 1 soul, 1 reshuffle instance, 1 ending.

### 13.4 Planned Scoping Cuts

Ordered by what goes first if time runs short; the top of the list is cut before the bottom.

1. **The second hand-authored reshuffle instance.** Ship one on-camera reshuffle hand-scripted; a second is the first cut.
2. **The Farm (third location).** Already cut from the slice; a reserved slot that adds without reworking Town or Forest.
3. **The texture souls beyond what the deep arcs need.** Trim toward the minimum that populates a life.
4. **The upper festival tiers.** Ship the quiet/warm read; grand + the souls-of-the-world display are the last polish.

### 13.5 Milestone Calendar

Anchored to the course assignment dates. Each milestone carries what must be spec'd before it closes and who or what verifies it.

| Date         | Milestone / deliverable                                                                 | Blocking sub-rows                                                               | Verified by                                       |
| ------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Tue 7/14     | **GDD first draft** (Assignment #1)                                                     | Concept + pillars locked                                                        | Submitted                                         |
| Thu 7/16     | **Final GDD draft** (Assignment #2)                                                     | Hole-filling substantially closed                                               | Phase-3 decisions                                 |
| Tue 7/21     | **Agent crew** (Assignment #3: 3+ agents, shared output, dev artifact)                  | Dev-crew roster + JSON I/O (#11); session-state bus field schema | This GDD, then the review panel                   |
| Thu 7/23     | **Dynamic content pipeline** (Assignment #4: RAG, 3+ content types, consistency checks) | Content Agent + Consistency Verifier contracts; voice register + tone enum | QA / Consistency agents + review of sample output |
| Tue 8/4      | **GER pipeline** (Assignment #6)                                                        | Level layout → gate/verb table; content-budget inputs                           | QA Agent traversal pass on the generated layout   |
| Thu 8/6      | **Style-guide agent** (Assignment #7) → Style/Art-Direction Agent                       | Color grammar + silhouette vocabulary as machine-checkable rules (#9) | Style agent + single review eye               |
| **Tue 8/18** | **Complete AI dev pipeline** (Assignment #10)                                           | Token budget calibrated (#11); end-to-end prompt-to-engine documented | Cost analysis against real generation             |
| **Tue 8/25** | **Capstone: final playable game**                                                       | Slice contract + Definition of Done met (#12); 1 ending shipped | Human playtest (primary) + QA Agent pre-ship pass |

The Production/PM Agent (see #11) owns tracking against these dates and explicitly schedules the human-review week — the back-loaded review is the top delivery risk (above).
