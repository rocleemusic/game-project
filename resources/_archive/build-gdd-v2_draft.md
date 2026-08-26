# Codename: rebirth Build GDD (v2 draft)

> **What this is.** The expansive, dev-crew handoff version of the Game Design Document: the one the agent pipeline and any collaborator builds from. Its companion is the Pitch GDD (1–3 pages, the graded turn-in); this doc is the same spine written at build altitude, with the narrative woven in. It answers, for every section, *what an agent or a builder does next*, or it names an open question precisely and sends it to §20. Nothing here is meant to sell; it's meant to be built.
>
> **Structure:** four Parts, 21 sections (`gdd-template-2026-07-21.md`). **Source of truth for decisions:** `phase-3-decisions_draft.md` (all 18 holes; where it and the knowledge base disagree, Phase 3 wins). **Prose voice:** `../prose-voice-rules.md`. **Rebuilt:** 2026-07-21 (v2) from v1 + Roc's review pass.

**A note on vocabulary.** A **run** is a **life**; the terms are interchangeable. A run is one or three festival-years (scope decides), and each year is one festival week. The emergent quantity a player builds with a soul is a **bond level**, tracked per soul. The **deepest bond** (what earlier drafts called the "partner") is an *emergent possibility*, never a prescribed goal and never a "winning" worldview. The deepest bond is **one possible ending among several** (community, diffuse, solitary/release); the old *search-for-a-lost-partner* framing is **retired** (2026-07-20).

---
---

# Part I: Concept & Pillars

## 1. Concept

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Myst*, *Outer Wilds*, *Frieren*, and *Studio Ghibli* where you **explore, collect, discover**.

The game explores the question: What does it mean to belong? And does connection span lifetimes?

You are a mage in a Ghibli-warm magical world who has just arrived in a new town. You spend your days foraging, crafting, learning folk magic, and getting to know your neighbors. You arrive in town the week before the festival of souls. By discovering magic spells, items, and learning about people you contribute to the success of the festival. After the festival time skips forward to the next year and you see the outcome of your decisions. For the vertical slice, a cycle consists of three years. At the end of three years a retrospective of your time in the town is presented. On a return to the game, you arrive but find that all the npcs have shuffled, for example: the npc who was the blacksmith may now be the postman, a friend may now be a brother. Each run is another life, another timeline, but the essence and personality of the npcs stays the same. As you spend more time with people your bond grows across lifetimes and you learn more about the underlying truth of the world.

> **Dev-crew note.** The design engine is *retrospective significance*: a plain detail that only becomes meaningful once something is later true. We author for it; we never claim to produce or measure what a player feels. The feature gate every proposed feature has to pass, or it goes to the Parking-Lot: **does this plant a detail a later moment can make significant, or connect to one already planted?** A feature that is merely fun but connects to nothing later is scope we don't have. The narrative process (§8.5) owns how this is written; resonance is invited, never scripted.

---

## 2. The Hook

- Short play sessions that reward replays through knowledge and collection completeness.
- Honors player agency and no play session is the same 
- The same NPCs return each life in shuffled roles; personalities stay fixed.
> **Retrospective significance.** A plain detail planted early becomes meaningful once something later is true. The game plants; it never tells you what mattered.
> **Built by an agent crew, approved by a human.** A small crew of AI agents generates and checks the content; a human approves every line. The shipped game makes zero model calls.
> 
---

## 3. Inspirations & Target Audience

> **Dev-crew note.** One line each, plus the *spec-borrow*: the precise structural move we take, not the vibe.

| Game / work | What we take (the line) | The spec-borrow (the exact move) |
| --- | --- | --- |
| **Outer Wilds** | Knowledge is the progression; discovery is the reward | Knowledge travels free and never expires: the ship-log / rumor-graph that auto-links learned connections and marks "more to learn here" without spoiling *what*. Our notebook is this graph. |
| **Return of the Obra Dinn** | Deduction you *prove*, not guess | Assert-then-confirm as a *compound* claim (identity × facet × role), evidence-gated so the small soul-list can't be scanned; correct answers lock in small batches with confirmation withheld, so a lone guess can't be binary-searched or cycled. Our recognition gate is this, aimed at souls-across-lives. |
| **Myst (and its remakes)** | The living-diorama, the information-key | Static-camera scenes; the key is *information*, not an item; puzzle-randomization as precedent for a roguelike-ified structure. The five-field puzzle template (Problem / Circumstance / Clues / Solution / **The Idea**). |
| **Frieren: Beyond Journey's End** | Significance that arrives after the moment is gone | The flat-register voice contract: the words stay plain and preloaded; the swell is visual or in the silence, never a verbal one. Collectible folk magic. |
| **A Storied Life: Tabitha** | Objects are mundane until you learn what they witnessed | Curation-as-authorship: what you keep writes the memory that remains. Our mementos are the low, unflagged echo-carriers. |
| **Spiritfarer / Animal Crossing / Stardew Valley** | Cozy rhythm; social-forward, softly-limited days | The neighborly moment-to-moment (talk, gift, tend); the day soft-limited by the *world* (shops close, light fades), never an energy bar. |
| **Majora's Mask** | A recurring deadline that everybody remembers | The festival week as the run boundary: urgency plus melancholy, no fail state; here inverted so *everyone remembers* prior years. |

**Who it's for.** Players who enjoy cozy exploration, and collection completionists. Players who enjoy character-driven narrative exploring emotional themes.

---

## 4. Design Pillars (+ Non-Goals)

> **Dev-crew note.** The pillars settle arguments as phrases. For the build, each one carries a second line: the thing an agent (or a builder) must *never do* that would violate it. That refusal is the contract; the phrase is the reason.

| Pillar | The build implication: what a builder/agent must never do |
| --- | --- |
| **Non-violent core** | Never resolve a beat with a fight, a fail-punish, or a threat. Conflict is social and internal, never combat. |
| **Strategy over dexterity** | Never gate anything on timing, aim, reflex, or precision input. Every gate is knowledge, recall, or a social state. Replace any twitchy input with a recall/pairing/pattern gate. |
| **Discovery is the reward** | Never hand the player the answer. Watching an NPC cast gives clues, not the spell; the player still confirms by trying. Proof comes before definition. |
| **Cozy rhythm** | Never hard-stop the player. No single-chain dead-ends, no forced sequence, no broken output silently swallowed. A stuck player always has another live thing to do. |
| **Pull, not push** | Never issue a directed command or a quest-arrow. The world *offers* leads (a door that names its own key-type); it never orders. Dead-ends become world-issued live leads, not walls. |
| **Knowledge lives in the player's head, not a flag** | Never flag-block a gate the player has the knowledge to solve. Gates are *performed* (cast the phrase, assert the cipher's meaning), never checked against a "visited X?" boolean. The game may *notice* you knew something early (a reincarnation beat), but it never hand-holds and never blocks. |
| **Receiver decides the outcome** | Never let an action encode its own result. The target holds the response logic: the same spell lands differently on a chicken, a door, and a neighbor, and *no effect* is a valid, honest result. |
| **Agentic AI is central, and it accelerates: it never decides** | Never ship a line no human approved. Agents generate volume and check consistency; Roc reviews and approves every line before it ships. |

**Non-Goals:** What the game deliberately won't be:

- **No multiplayer or co-op.** The slice is solo-first. If a mechanic *needs* a second player, cut it.
- **No tactical / FFT-style combat.** Strategy lives in route, deduction, recognition, and curation-under-consequence, not a battle grid. (Parked, not deleted.)
- **No live-service / always-online systems.** The shipped game runs fully offline. (An optional player-supplied live pipeline is parked in §21.)
- **No hard-lose / game-over.** You always leave with something. A wrong action teaches; it never punishes.
- **No red-herring content population.** "Don't make clues trivially obvious" is fine; budgeting a decoy-artifact layer is asset spend we don't have.

> **Dev-crew note.** The pillar table's second column is the refusal contract: the thing an agent or builder must never do. The Non-Goals are enforced as agent refusals: no two-player-required puzzle, no server-dependency-during-play feature, no fail-state screen, no filler-to-hide-the-real.

---
---

# Part II: Game Mechanics

## 5. Core Loop

**The moment-to-moment.** You're on a screen (the square, the clearing) and you act through **four action families**. Every interaction in the game is one of these four:

- **Collect.** Pick up anything collectible: components, made things, mementos, spell-phrases (knowledge), and *sounds* (audio-objects). Listening is Collect applied to sound.
- **Make.** Combine components plus learned knowledge into an output: a spell, a dish, a craft, a piece of art. One structure for all three.
- **Use.** Apply a held thing (a spell or an item) to a target: ignite a lantern, still the water, offer a scritch to a cat. Presenting an item or a sound to a neighbor is also a Use, with an NPC as the target; the neighbor's reaction is the result.
- **Converse.** Talk to an NPC. Distinct from Use: no object changes hands, the exchange is dialogue.

> **Dev-crew note.** At the tag layer, two Use-and-Converse interactions carry their own names for content resolution: **Show** (present a held item or sound to a neighbor, a Use) and **Ask** (pose a topic to read a reaction, a Converse). They resolve to different audio and dialogue than igniting a lantern, so they are named tags even though the family layer stays at four. See §18.

**Starting a run.** On game start you get an intro screen and select a persona; for the vertical slice the only choice is mage. You start randomly in the town or the forest. At each location a day is a budget of **3–5 screen-moves**. Each screen hosts solo interactions (foraging, casting: procedural, near-zero authoring) and social interactions with any NPCs present.

**The satchel, the notebook, the home.** You carry a satchel and a notebook. The notebook can be referenced at any time and holds the knowledge you have collected. At the end of a day you carry from the screen only the number of items that fit into your satchel, and you return home. You can also end a day early to bank a full pack plus what you can carry in your arms (pack-triage). Your home is a hub you decorate with items you collect; you can choose items from home to bring with you, but they take up satchel room. When you are ready to move on, you open the calendar and pick a location to travel to for the next day.

**The run.** A run is the same festival week across three successive years. After each week, time jumps forward a year, with backstory filling the gap and neighbors remembering what you did last year. The week builds toward the festival night, and the outcome depends on the choices you make during the week.

**Ending a run.** After the final festival night, an ending vignette based on the player's decisions plays.

**A new beginning.** Each new run reshuffles the NPCs. Personalities stay fixed, but exploring the idea of past lives and multiple timelines, each NPC's role in the town is re-dealt. Over time the player keeps notes on the NPCs, in the manner of *Return of the Obra Dinn*. Across runs, the bond level you build with a soul persists, leading to different outcomes.

### 5.1 Win / loss: soft terminal states

There is **no hard-lose and no game-over.** A run always ends *with something*: the ending vignette is guaranteed. Success is measured as **depth of connection reached** (which ending you land), never survival. The game cannot be lost, only lived. The slice ships **1–2 fully authored endings**.

> **Dev-crew note: gate archetypes (referenced, not inlined).** Gates are performed, never flag-blocked. The slice features four of the six archetypes the puzzle grammar defines. The full per-gate specs live in the level layout (`level-layout_draft.md`) and the puzzle-grammar synthesis, referenced here so this section doesn't over-specify:
> - **Garrison-preview.** The gate names its own key-type up front ("they'll open when they trust you"). Turns a dead-end into a world-issued live lead.
> - **Laki travelling-knowledge.** Learn here, apply there. A cipher learned at one shrine reads the other; bidirectional, and *not a lock*: knowledge in the player's head, which the game notices but never blocks.
> - **Deduction-loop recognition.** Find → think → **prove**: a *compound* Obra-Dinn assertion (Soul × essence-facet × role), evidence-gated (Heaven's Vault: it surfaces only once you hold the essence-evidence) and batch-locked with confirmation withheld, at the festival reshuffle doorway. The recognition core, made a mechanic: a *performed* gate, not a menu pick.
> - **Kadish time-of-day.** The key is knowing *when* to look (the marks need moonlight); an authored state, never a timing/dexterity test.
>
> The receiver-outcome interaction (§6.1) is authored as a matrix: `verb(family) × target(type) → precondition → scene-state change → why-specific feedback`. The agent I/O for it lives in §11. Co-design flag: the recognition/proof gate opens only if an action family can express the demonstrating move, so the four families' sub-verbs must be designed *with* the recognition gate, never after. The sub-verb list is a §20 open item, pending the verb-table pass.

---

## 6. Magic System

> **Dev-crew note.** Stub for Roc to fill in place. The locked bits (H6) are pre-filled; the bracketed lines are open.

**Learned by watching, confirmed by doing.** Seeing a neighbor cast on a target gives a clue, not the spell; you confirm by trying it yourself. Proof comes before definition (the Discovery pillar).

- **A spell is a phrase plus components.** A spellbook section in the notebook records spells you've learned. You learn them by casting them.
- To cast a spell: select the components from your inventory and input the phrase. 
- **Physical outcomes only.** Spells produce physical effects, never a mood or a dictated behavior; the outcome is receiver-determined (§6.1), and "no effect" is an honest result.
- **Cost / tiers.** Anyone can cast a spell but different archetypes have different levels of mana.  Low mana means a lower quality cast (a bigger or smaller fire).  And some spells have a high mana requirement so a person with low mana can't cast it.
- **Starter set:** `ignite` (sticks), `scratch` (wool), `breath` (grass + dirt).
- **How magic unlocks screens.** Casting is a knowledge-key: watch a neighbor burn a dry hedge to clear it, then do it yourself to open the way. Traversal is gated by what you know, not a flag.
- **Slice count:** 10 spells 
> > (H14). [ your fill: the remaining ~7. ]

### 6.1 Receiver-Determined Outcomes

The target of any directed interaction holds the response logic. **The action verb encodes only *what was done*, never *what happened*.** Ignite-on-sticks catches; ignite-on-a-person does nothing, and the nothing is the honest, taught result. Spells produce **physical outcomes only**: they never set a mood or dictate a behavior; any emotional response (a cat purring at a scritch) is the receiver's *own* reaction to the physical effect. Maker-side quality × receiver-side disposition = the outcome.

---

## 7. Collectibles

> **Dev-crew note.** The six item categories the player can **Collect** (§5). Locked at H3; persistence follows the §8.2 Save-State rules (sounds and knowledge travel free, everything physical is pack-triaged). Specific seed items are Roc's content, tied to the setting (§20).

| Category | Role | Persistence | Examples *(placeholder)* |
| --- | --- | --- | --- |
| **Components** | Foraged magic ingredients, **consumable**; feed Magic (§6) casting and Make | pack-triaged | a berry · a river stone · a feather |
| **Made things** | Outputs of **Make** (dishes, crafts, art); some consumable, some giftable | pack-triaged | a warm loaf · a small carving |
| **Mementos / keepsakes** | Hub decoration and **echo-bearing** — the low, unflagged retrospective-significance seeds | pack-triaged | a worn ribbon · a pressed flower |
| **Gifts** | The declaration system: a **use** of a memento or made-thing, *not* a separate object class | — *(drawn from above)* | *(a given keepsake)* |
| **Sounds** (audio-objects) | **Travel free**, no pack space; show / gift / spell-component (§18) | free, like knowledge | a festival bell · a hummed tune |
| **Tools** | Non-consumable **Use**-family items (magic covers much "using") | pack-triaged | a lantern · a small knife |

**Scope:** ~3 per category → ~15 distinct items (gifts overlap mementos/made-things), final counts from §15. Small seed set by design (Van Buren guardrail: flag the feeling, don't itemize).

## 8. World & Progression

> 8.1 The world, in myth-form

> **Dev-crew note.** The myth below is never surfaced to the player.
>
> It began with a turning. The same handful of souls, bound to one town and one festival, die and are dealt a new hand: kin one life, strangers the next, married to other people and missing each other by a season. The world remembers the turning even after they forget it: the festival returns each year, the town rebuilds itself around them, and they keep orbiting one another in new arrangements. Nobody in the town knows this. They live, they belong or fail to, they die, and the wheel deals again. You are one of them, awake enough to notice the pattern and free to decide what, this time, you belong to.
>
> The specific place, the central 15-second memory vignette, and how it seeds across the three festival-years are **H9 baseline-narrative content, deferred to game-35** and tracked in §20.

### 8.2 Save-State: what the save file records

> The save file records six kinds of thing, each with its own lifetime. The three boundaries that matter: a **run** (day to day, year to year within one life), a **reshuffle** (the start of a new run), and a **wipe** (deleting the timeline).
Knowledge is held by the player but the game tracks certain things in the save-state.  A player can choose to completely wipe a save record to initialize the game:
| Data | Within a run (day→day, year→year) | Across a reshuffle (new run) | Survives a wipe |
| --- | --- | --- | --- |
| **Spells** | Yes, in the notebook | Yes, in the notebook | No |
| **Sounds** (audio-objects) | Yes | Yes | Yes |
| **Physical items** (components, made things, mementos, tools) | Only what fits the satchel; the rest stays in the home hub | Yes, in the hub | No |
| **Bond level** (per soul, met → claimed) | Yes, grows | Yes, derived over time | No |
| **Roles / relationships** | Fixed | Re-dealt (repermuted) | No |
| **Hub state** (mementos you arrange) | Yes | Shared across timelines | Yes |

> **Dev-crew note.** Because bond level and knowledge persist but roles repermute, the Consistency Verifier's role-boundary and essence-vs-role invariants (§11) keep a re-dealt world coherent: a soul's essence-descriptors carry across the shuffle, its role does not. The wipe returns the world to superposition (§8.3).

> 8.3 The superposition rule (the metaphysics, never surfaced)

> **Dev-crew note.** The metaphysics below is never surfaced to the player.
>
> Two data regimes, and the game phase-changes between them:
> - **Essence is fact.** A soul's descriptors and signature are confirmable truth: you assert, the game confirms at a match threshold, wrong guesses are revisable and teach. This is the deduction you can *win*.
> - **The deepest bond is emergent:** constituted, not deduced, and it is **one possible ending among several** (community, diffuse, solitary/release), never a prescribed target. A per-soul bond score accretes from time spent, helps given, and festival choices (met → claimed). There is no prior fact before it collapses, and that is coherent because the deducible floor lives on the essence side above, not here. The bond is what you *build*, not who you were supposed to find; once it solidifies it is fixed until a save-wipe. The philosophy backend (Daoist reincarnation, breaking the cycle into release) stays entirely under the cozy life-sim.
>
> The wipe returns the world to superposition: letting go releases the bond back into possibility. *(Whether the wipe/release is the game's terminal ending is the letting-go question, parked; see §20.)*

### 8.4 Game Clock

> The play structure nests, now that a run is a life:

- **Day.** Soft-limited by the world (light fades, shops close); a budget of 3–5 screen-moves at one location. At day's end you return home and pick the next day's location on the calendar.
- **Week.** The week builds to festival night of each year. A week is currently 5 days but can expand or contract depending on scope.
- **Year-jump.** After the festival, time skips forward a year; backstory fills the gap; neighbors remember last year.
- **Run (= a life).** One or three years (scope decides), then an ending vignette. Full: `year-1 week → year-2 week → year-3 week → vignette`. Cut: `year-1 week → vignette`.
- **Reshuffle.** A new run re-deals roles (personalities fixed); bond levels carry across.
- **Timelines.** Save slots (a locked cap of 3), each a parallel life; the home hub is shared.

Route choice is *attention allocation*: you can't be everywhere before the festival, so the calendar is the strategy layer

### 8.5 The narrative process


The narrative is generated by a repeatable build-time process, not written by one person holding the whole world in their head. A small crew of agents (§11) produces the game's content during development, steered by a per-arc document; the shipped game replays it with zero model calls (§12, §13). Roc approves every line at the output.

#### 8.5a The process, step by step

1. **Steer.** Write the per-arc doc: the hidden World Truths the arc moves toward, the one Arc Question it answers, a one-line note per soul for where they are heading, the threads to keep alive, and what the arc is not. Everything downstream reads from it.
2. **Intake.** Hand the crew the arc doc, Roc's soul roster, a backstory guideline per soul, and the player's chosen background. Each scene request carries the World Truth it serves, and a request with no steering tag bounces back.
3. **Cards.** Fill a persona card per soul: essence fixed across every life, role re-dealt each reshuffle, traits kept orthogonal so no two souls read as the same archetype in different hats.
4. **Echoes.** Write the seed-and-payoff templates. A plain detail is planted early beside ordinary business, and it pays off later only once the player has made the deduction its condition names. It is a recognition mechanic, never a promise about feeling.
5. **Graph.** Lay the scene graph as preconditioned encounters, not quests. The world offers two or three live leads, each scene resolves from any entry point, and each adds one new fact under cover of an ordinary job, in the richer form a world fact and a personal fact together.
6. **Gates.** Spec each winnable deduction (Problem, Circumstance, Clues, Solution, the Idea). The proof is a diegetic action only someone who understood would take, never an "I figured it out" button.
7. **Lines.** The Content Agent writes one slot at a time, in the Frieren-flat register, from a card and scene it never invents beyond. The bond it is building never appears on screen.
8. **Check.** A Consistency Verifier flags each batch against a locked invariant set, an automated pass strips the AI tells, and QA confirms the graph is traversable. All three flag only; none rewrite.
9. **Approve.** Roc approves every line at the output, using the SDT checklist (autonomy, competence, relatedness) for what the machine cannot judge. Nothing ships unread.

#### 8.5b The crew (which agent owns each step)

The pipeline feeds the crew defined in §11; the mapping below shows who owns each step above.

| Pipeline step | §11 agent |
|---|---|
| Steering, Intake, Cards, Echoes, Delta and canon, Graph, Recognition gates | Narrative Architect (Agent 1) |
| Lines | Content / Dialogue Agent (Agent 2) |
| Verify | Consistency Verifier (Agent 3) |
| Purge the tells | The Content Agent's automated tell pre-pass (Agent 2) |
| QA | QA / Playtest Agent (Agent 5) |
| Sequencing, escalation | Orchestrator (Agent 0) |
| The human gate, SDT review | Roc |


The Orchestrator (Agent 0) sequences the whole chain: it hands each worker its prepared input, collects the typed output, and surfaces the gates. Workers never call each other, and every worker's output is human-gated before it commits.

**The constraint.** We write stories; we do not script payoff. The mechanical recognition is scripted (the player asserts a soul's essence, the game confirms at a threshold, wrong guesses teach) and the text is authored, but the resonance is invited, never produced or measured. No agent, field, or metric claims to know what the player feels. Procedural technique is primary; cohesion and story serve it.

The full construction spec, the ordered procedure, the guardrail checklist, the register rules, the arc-doc and card and echo templates, the build-time ink authoring loop, a worked example, and the source provenance, lives in `narrative-pipeline/`. The baseline story content itself is game-35.

> **Dev-crew note.** 

> We write stories; we do not script payoff. We author content that invites reaction, and we never claim to produce or measure what a player feels. The mechanical recognition is scripted (the essence-side deduction, §6.1 and §8.3); the emotional resonance is invited, never scripted or measured.
> 
> What carries into the synthesis as structural scaffolding:
> 
> **Encounter over quest.** The world offers encounters (pull), not directed quests (push). Errands are small community favors, generatable from world state.
> **Delta.** Each scene adds new information rather than restating; the Content Agent works under the one-sentence delta rule.
> **The seed / echo structure** remains a *mechanical deduction* device owned by the Narrative Architect's `echo_templates` (§11): a plain detail planted early with a named condition the player must have deduced first. It is a recognition mechanic, not a promise about feeling.
> 
> The full process is written in the synthesis pass.

---

## 9. Levels

Two locations ship first: **Town** and **Forest**. The first-pass level layout sets each at roughly 7–8 screens, progressively unlocked (3 reachable at start, the rest opened by knowledge-key gates the player *performs*). To unlock further screens the player learns to cast spells through interactions with NPCs, for example seeing someone cast fire on a dry hedge to clear it. A third location (**Farm**) is a reserved structural slot (§9.5) if time permits.

> **Dev-crew note.** Per-location screen counts stay first-pass, owned by `level-layout_draft.md`, until the layout is prototyped. One functional paragraph per location follows: what it's for, what the player does there, what it gates; kept gestural by license (the full per-screen table lives in `level-layout_draft.md`; the physical-place identity is placeholder, Roc's to flavor in place). Each location is a mini-metroidbrainia: the map itself is the knowledge-key system, so "knowledge is the key" shows up at the level of *traversal*, not just puzzles.

**9.1 Town.** The festival's home. You arrive on the Square under the Lantern Arch, the landmark that ages across the years, so returning reads the calendar for free. From the Square you reach Market Row (stalls, small folk-magic, where Make gets its first stall-combine) and the Commons and its well (daily life, where Use gets its first honest lesson: ignite a brazier; try it on a person and nothing happens, which is the teach). Deeper in, behind performed gates: a Workshop where Make gets serious (the door opens to a *known recipe*, not a flag), a Neighbor's Home that opens on *trust* (a door that names its own key-type), the Tavern that only opens in the evening, the Festival Grounds where the run's build-up pays off and the **recognition gate** lives, and, at the town's quiet edge, an Old Shrine whose carvings you can read *if* you understand the cipher.

**9.2 Forest.** The foraging woods and the older, stranger things in them. You start at the Forager's Clearing (Collect and a first neighbor), the Stream (Use: ignite gathered kindling; the water shrugs it off), and the Grove (Make, as field-craft). Performed gates open the rest: the Still Pool behind the phrase *"still the water,"* an Old-Growth Hollow where one insight lights up two screens at once, the Forest Ruin whose ritual marks are the travelling cipher (readable only by moonlight), the Cave as a reward-space-as-destination, and, as a stretch, the Heart of the Wood, opened by combining two fragments neither of which is sufficient alone.

**9.3 The cross-location seam (the headline move).** A path off the Square connects Town and Forest, and the **cipher** marks *both* the Forest Ruin and the Town's Old Shrine. Reading either site is a knowledge-demonstration: understand the symbols (learned at either site, or carried in your head from a past life) and assert the reading. It is **bidirectional and not a lock**: nothing gates walking up to a shrine. If you read one *without* having seen the cipher this run, because you knew it already, the game fires a quiet **reincarnation-awareness beat** (a neighbor or a memory-motif marks the uncanny familiarity). It notices; it never blocks and never hand-holds. This is knowledge-travels-free, proven at the level of the map.

**9.4 Home Hub.** Your home, which also serves as the meta-progression hub. You can store and arrange your home however you see fit.

**9.5 Farm (stretch slot).** Same shape if added: a start trio (Yard · Field · Barn) plus progressive unlocks, one featured archetype not used elsewhere (read the field/season state), and a third cross-location seam. Reserved so it adds without reworking Town or Forest.

---

## 10. Art & Audio Direction

**Tone words:** Ghibli-warm, painterly, quietly melancholic, lived-in.

> **Dev-crew note.** Concept refs (structural, not reproduced): the desaturation discipline and flat emotional register of *Frieren*; the palette warmth and environmental wonder of Studio Ghibli; the static-camera living-diorama of *Myst*. No reproduced imagery: refs set the rules, not the assets.

**Built in 3D.** Planned engine is Unreal, using the Point-and-Click toolkit from the Fab marketplace. The goal is to use 3D levels for visual depth, and one built environment reused from many angles: one 3D location yields many static-camera "scenes." The replayed festival week across years then renders cheaply: same level, different angle / time-of-day / seasonal state gives the "time moved, we returned" read with no intertitle.

> **Dev-crew note: the risk, and the mitigation.** 3D can read sterile and un-Ghibli. Warmth is held not by hand-finishing every asset but by a *system*: a hard-constrained palette (bands, not a free wheel), a locked silhouette vocabulary every generated variant reads as a variant *of*, and one key-art board plus one review eye. Cohesion comes from rules plus a single reviewer, not per-asset polish, the same discipline that lets the dev-crew generate volume without the world falling apart.

**Sonic identity.** Music inspired by Joe Hisaishi and the Studio Ghibli films. Ambience and items grounded in foley libraries and field recordings. Magic follows an anime style. UI is tactile, with fantasy flourishes where appropriate.

> **Dev-crew note.** Audio is a first-class design material here, the game's clearest signature. The deepest bond's leitmotif surfaces from the festival mix as data accrues: early visions carry only ambience, and the motif emerges as you gather enough of a soul. Sound is the strongest retrospective trigger a person has, which is why the audible essence-signature is the deepest recognition clue and why the audio pipeline (§18) matters.

> **Dev-crew note: going big: the domain-mapped trigger model.** There's no single global "epic" register; each *domain* of a big moment gets the register that fits it, and the words stay plain in all of them (the swell is visual, scale, or revelation, never verbal):
>
> | Domain of the "big" moment | Register | What it feels like |
> | --- | --- | --- |
> | Social / relationship payoff | Frieren restraint | Lands quiet: a small word carries it, the gap holds the charge |
> | World opening up | Outer Wilds revelation + Ghibli awe | An understanding recontextualizes the place, and it's visually warm/wondrous |
> | Magic (learning or casting) | Outer Wilds revelation + Ghibli awe | The discovery-aha of a knowledge-key plus the wonder of the effect |
> | The deepest world/belonging revelations | All three | Restraint, revelation, and awe together |
>
> So the deep-NPC payoffs stay Frieren-quiet (they're social); learning a spell or reading the reincarnation truth is where the swell lives (world/magic). Which register leads a mixed moment is a §20 parked item.

---
---

# Part III: AI Architecture

> **Dev-crew note.** AI shows up in two clearly separated places. **At runtime, while you play, there is no AI at all**: the game's memory of your past lives is ordinary save-state and rules, so a run makes zero model calls, needs no server or key, and runs fully offline (§13). **During development, a crew of AI agents** generates and quality-checks the content (§11–§12), but **a human approves every line before it ships.** AI accelerates the build; it never decides, and it never runs the shipped game. §11–§15 are the Assignment-#3 build architecture.

## 11. Agents

The crew obeys three rules: **one agent per feature, and each seat needs a clear why** (five workers plus an orchestrator is class-scope guidance, not a hard cap); **call down, signal up** (the orchestrator hands each agent a prepared input and collects a typed output; workers never call each other, which keeps every agent testable in isolation); and **the human gate lives at the output, never mid-chain** (Roc reviews and approves; a broken output is never silently swallowed, the cozy-rhythm rule applied to the pipeline). 
> The mechanism that realizes "call down, signal up" is the session-state bus (§12).

> Every agent below passed a realistic-capability check: each does bounded structured output, classification, or string-pattern work; nothing rests on open-ended generation. Schemas are given at GDD altitude; the field-level implementation schema is the crew's own Phase-3 build task.

**Agent 0: Orchestrator (the manager).** Owns sequencing and gate-keeping, not vision, not content. Frames scope, reads the bus, decides which stage runs next, hands each worker its input bundle (the per-arc arc doc and NPC codex ride in every bundle), collects the typed output, and surfaces the human-gate checkpoints. Resolves conflicts when two outputs disagree.
- *In:* `{ session_goal, pipeline_stage: "schema|greybox|prose|canon_check", agents_to_call:[…], arc_doc_ref, npc_codex_ref, session_state_ref, human_gate_required }`
- *Out:* `{ session_id, dispatch_queue:[{ agent_id, input_bundle, gate_before_write }], session_state_update, surfaced_gates:[…] }`
- *When:* always first, and again after each worker completes. *Gate:* routes freely; every worker's output is human-gated before it commits. *Capability:* PASS: routing and dispatch, no creative content.

**Agent 1: Narrative Architect (schema stage).** Owns story architecture: the structural layer that tells every downstream agent *what* the narrative commits to, without writing a player-facing line. 
> Three folded sub-functions kept deliberately as one feature: the **seed-and-payoff / echo map** (which past-life detail seeds which future payoff, and the condition the player must have deduced first), the **persona-card schema** (fills each Roc-supplied NPC seed into an essence-signature card, the anti-homogenization structure), and the **delta rule + canon flags** (the one-sentence "each scene adds new information" rule, plus the locked invariants downstream agents must not break). It also **maintains the per-arc arc doc** (World Truths, the Arc Question, the human-note Soul Arc Spines, threads to keep, and what the arc is not, which the Orchestrator hands to every worker) and **emits the NPC codex**, the canonical per-arc registry of which souls exist and their locked facts. It does not write dialogue, does not check consistency, and *cannot invent NPCs*: the roster is a required input, and the codex is the registry that enforces it.
- *In:* `{ arc_doc:{ world_truths:[…], arc_question, soul_arc_spines:[…human notes…], threads_to_keep, not_this_arc }, slice_npcs:[{ npc_id, essence_hints:[…Roc seed…], backstory_guideline, suit_tag }], player_background, scene_list:[…], locked_decisions:{ knowledge_travels, superposition_rule, soft_reminder }, voice_guide_ref }`
- *Out:* `{ persona_cards:[{ npc_id, trait_axes:[{axis,value}] (also serve as bond-weight coefficients, §13), backstory_guideline, essence_descriptor, suit_tag, authored_exceptions:[…] }], echo_templates:[{ npc_id, seed_scene, seed_event(≤25w), payoff_scene, payoff_condition, payoff_voice, reveal_npc_id, prerequisite_theme }], npc_codex:{ souls:[{ npc_id, locked_facts:[…], places_threads:[…] }] }, delta_rule, canon_flags:[…] }`
- *When:* schema stage, once per run, always before any Content call. *Gate:* hard: Roc reviews cards + echo map before they propagate (an error here reaches every interaction). *Capability:* PASS: bounded structured output from a supplied roster; trait orthogonality is enforced by the schema shape.

**Agent 2: Content / Dialogue Agent (prose stage).** Owns all player-facing text (NPC lines, lore, environmental text, object descriptions, echo fragments) inside the voice register. Takes a persona card + an echo template + scene context and emits finished content, **one slot per call**. Makes no structural decisions and does not assign its own tones (the tone enum is fixed, not generated). This is the class's canonical worked example, and it's also the *same* `speaker_id / tone / text` shape the engine reads at runtime, with no translation layer.
- *In:* `{ npc_id, persona_card, echo_template:{ seed_event, payoff_condition }, scene_context:{ scene_id, time_of_day, world_state_excerpt }, tone_enum:["quiet","wistful","matter_of_fact","warm","distant"], voice_register:"flat|warmth-swell|retrospective", max_words:40, voice_guide_ref }`
- *Out:* `{ content_lines:[{ content_id, speaker_id, tone, text(≤40w dialogue / ≤60 description), scene_id, echo_flag, canon_flag }], human_review_required }`
- *When:* prose stage, after the scaffold locks and cards are approved; per slot, one call one block. *Gate:* an automated AI-tell / voice-drift pre-pass flags markers, then Roc reviews only flagged, echo, or retrospective lines; clean lines advance. *Capability:* PASS: short, tonally-constrained prose from a bounded template; the 40-word ceiling and fixed tone enum guard the "going long" and drift failure modes.

**Agent 3: Consistency Verifier (canon-check satellite).** Owns consistency: reads each new content batch and checks it against a **finite, concrete invariant set** plus the voice register, before anything commits. It **flags only**: never generates, rewrites, or auto-repairs. The check-set is the game's own locked rules (the seven `guardrails.md` invariants): superposition (including the bond scoring-function bright line: one hidden count, never stored per-category sub-scores), essence-vs-role discipline, delta, knowledge-travels (C1, checked against the NPC codex), informational-feedback, voice register, and fact-tier-vs-bias-tier.
- *In:* `{ new_lines:[{ content_id, speaker_id, tone, text, scene_id }], active_canon:{ persona_cards, echo_templates, npc_codex, bond_levels, locked_roles }, session_state_ref, invariant_set:[…7…] }`
- *Out:* `{ verification_report:[{ content_id, scene_id, status:"PASS|FLAG", flag_type, flag_reason(≤30w) }], human_action_required, summary }`
- *When:* after every Content batch, before commit, and at the session-boundary snapshot. *Gate:* always human-gated: no flagged content commits without sign-off; PASS routes silently. *Capability:* PASS, with one architectural dependency: the orchestrator must summarize the bus every N committed lines so the Verifier's context stays bounded.

**Agent 4: Audio-Tag Agent.** Owns the audio-tag contract that makes §18 work. Takes new entities plus the current tag→asset library and produces a compliant **Unreal GameplayTag** per required audio trigger, mapped to a **Wwise event** in the library, checking each proposed tag for collisions and orphan/missing mappings. Generates no audio and assigns no style or emotion: it names and verifies format only.
- *In:* `{ new_entities:[{ entity_id, entity_type:"npc|object|scene|spell" }], required_interactions:[…from the four families; sub-verbs slot in from the verb-table pass…], existing_tag_library }`
- *Out:* `{ new_tags:[{ entity_id, gameplay_tag:"NPC.Chef.Show.React", wwise_event, collision_flag, orphan_flag }], library_delta, violations:[…] }`
- *When:* schema/pre-production, whenever new entities enter the slice. *Gate:* soft: the library delta is reviewed and auto-commits on no objection. *Capability:* PASS: string generation against a fixed pattern, collision detection is a lookup, compliance is classification. *Dependency:* it can only emit tags once the four-family sub-verb list is specced (a §20 open item).

**Agent 5: QA / Playtest Agent (traversal & functionality).** Owns structural QA: verifies the assembled slice is **traversable and works as specced** before ship. Enumerates choice permutations, checks every branch/state is reachable and leads somewhere valid (no soft-locks, no dead-ends, no orphaned content), confirms win-states are reachable by an intended path, and confirms each interaction produces its specified effect *and* its wrong-action teach. Flags only. Distinct from Agent 3: the Verifier checks *is it consistent?*; QA checks *does it work and can you get through?*
- *In:* `{ scene_graph, gates:[{ gate_id, key_type, unlocks:[…] }], win_lose_conditions, interaction_specs:[{ interaction_id, expected_effect, wrong_action_teach }], archetypes:["discovery","emotional","puzzle"] }`
- *Out:* `{ reachability:[{ node_id, reachable, via:[…] }], flags:[{ flag_type:"soft_lock|dead_end|unreachable_content|unreachable_win|broken_interaction|missing_wrong_action_teach", location, detail(≤30w), severity }], archetype_notes:[…], human_action_required }`
- *When:* after a batch assembles into a playable scene graph, and again pre-ship. *Gate:* hard on any soft-lock or unreachable-win; soft otherwise. *Capability:* PASS: graph reachability and rule-checking over a bounded scene graph are deterministic. It validates traversability, never *fun*; human playtest stays the experiential signal.

> **Dev-crew note: what is deliberately *not* a standing agent.** The runtime persistence system is mechanics, not an agent (§13). The document-level scope-guard / Van-Buren pillar check is an *on-demand orchestrator pass* (the Verifier run in stress-test mode), not a staffed seat. Two expansion candidates are named but unstaffed until the build surfaces the need: a **Project-Manager / task-board agent** and an **Audio Implementer** (consumes the tag manifest, wires each tag to a real asset, inventories what's missing), each of which would need a clear, distinct why and a passing capability check.

**Roster + human-gate summary**

| # | Agent | Feature owned (one) | Stage | Human gate |
| --- | --- | --- | --- | --- |
| 0 | Orchestrator | Sequencing · session-state bus · gate-surfacing | all | Routes freely; each worker's output is gated |
| 1 | Narrative Architect | Story structure: arc doc + echo map + persona-card schema + delta rule + NPC codex | schema | Hard: cards + echo map reviewed before propagation |
| 2 | Content / Dialogue Agent | All player-facing text | prose | Tell-pre-pass → Roc reviews flagged / echo / retrospective lines |
| 3 | Consistency Verifier | Consistency vs. finite canon invariants; flags only | canon-check | Always gated: no flagged content commits unreviewed |
| 4 | Audio-Tag Agent | Audio-tag contract (GameplayTags + tag→asset library) | schema | Soft: library delta auto-commits on no objection |
| 5 | QA / Playtest Agent | Traversal & functionality; flags only | QA | Hard on soft-lock / unreachable-win; soft otherwise |

---

## 12. The Narrative Content Pipeline

The pipeline is **build-time only**. We run the crew (§11) during development to generate the game's content, and the shipped game plays it back from a static library. **A run makes zero model calls.** This is the shippable-to-anyone mode: fully offline, fully QA-able.

The mechanism that realizes "call down, signal up" is a shared **session-state artifact** (the bus): every agent reads it at start and writes its finished output back, and the orchestrator reads the bus to decide what runs next. The pipeline stages are `schema → greybox → prose → canon_check`, gated at each worker's output. Two per-arc artifacts live on the bus and are handed to every worker: the **arc doc** (the steering layer) and the **NPC codex** (the canonical soul registry the Verifier checks against).

> **Dev-crew note.** An optional player-supplied live pipeline (BYOK, re-run between runs to generate fresh narrative) is **dropped from this build** and parked in §21. It never changes the runtime claim: output is always played back canned, so a run makes zero model calls regardless.

---

> 13. Runtime Persistence
> 
> The shipped game's memory is **ordinary game code, not a model call.** The persistence engine remembers your incarnations, tracks the met→claimed **bond level** per soul (one hidden count, accreted from weighted interactions across four action-categories, trust · intimacy · recognition · respect, with per-soul card-trait coefficients; never split into stored per-category sub-scores, and never shown), gates the calendar, applies role and relationship **repermutation** at run boundaries, and surfaces the soft in-world reminders. All of it is save-state and rules.
> 
> Stated bluntly:
> 
> **Runtime LLM calls: zero.**
> **Runtime cloud-token usage: zero.**
> **Runtime AI cost: $0.**
> 
> This is the central de-risk: the game that ships never needs a server, a key, or a network. The dev-crew's only obligation toward this system is to author the session-state / persistence **schema** the runtime reads; that schema's field format is a §20 open item.

---

## 14. Build-Time Agent Plan

Which agent builds each component, and when. First-pass mapping, aligned to the milestone calendar (§19); the weeks refine as the layout and token calibration land.

| Component | Build agent(s) | When (milestone) | Human role |
| --- | --- | --- | --- |
| Orchestration + session-state bus | Orchestrator (0) | all stages | Roc frames scope, reads surfaced gates |
| Persona cards + echo map | Narrative Architect (1) | schema · 7/21–7/23 | Hard gate: Roc reviews cards + echo map |
| Player-facing text (dialogue, lore, echoes) | Content / Dialogue Agent (2) | prose · 7/23 → | Roc reviews flagged / echo / retrospective lines |
| Consistency check vs. canon | Consistency Verifier (3) | after each batch · 7/23 → | Roc signs off every flag |
| Audio + asset tags (GameplayTags → Wwise) | Audio-Tag Agent (4) | schema/pre-prod · 8/4 | Soft gate: library delta auto-commits on no objection |
| Level / gate layout → scene graph | Human (`level-layout_draft.md`) → QA Agent (5) | 8/4 | Roc authors layout; QA validates traversal |
| Traversal / reachability QA | QA / Playtest Agent (5) | pre-ship · 8/18–8/25 | Roc triages flags; human playtest is the fun signal |
| **Track A: narrative proof (ink/html)** | Content pipeline + engineering | **this week · 7/21–7/23** | Roc's line review gates content |
| **Track B: visual/asset build (Unreal)** | Engineering + style discipline (§10) | parallel, all weeks | Roc/artist approve assets; runs independent of review |

> **Dev-crew note.** Two tracks run in parallel on purpose (§16): Roc's line-review on Track A never bottlenecks Track B's visual asset build.

---

## 15. Token Budget

**Content-budget formula — the content component (Agent 2's output volume; a named open question, not a guessed number).** The data model is:

```
interaction-beats = souls-present × years × days × beats/day
                  + echo-strands × bond-deepening candidates
                  + descriptor-reaction lines × NPCs
                  + spells + items + locations
```

The *locked inputs* are real: 8 souls (3 deep + 5 texture), availability deals 1–2 "past" per run → ~6 present; candidate cap = 3; years = 3; locations = 2 (+1 stretch); days/run = 5; screen-moves/day = 3–5; canned paths = 2; slice spells = 10; seed items ≈ 3/category (~15). A first-pass estimate falls out (~130 social beats + 2 echo-strands + ~30 essence-reaction templates across 2 paths, heavy template/overlap pulling the real number well below 2×), but the estimate stays a §20 open question until it's calibrated against real generation.

**From content-beats to whole-crew tokens.** The formula above sizes the *content component* only (Agent 2). The full dev-time cost layers the other five agents on top:

```
dev-tokens ≈ interaction-beats × tokens/beat × crew-overhead
```

Only Agent 2 (Content) is output-heavy; the rest are overhead or input-heavy-but-cache-mitigated. The **crew-overhead factor (~1.5–2×)** is what agents 0/1/3/4/5 add on the content baseline:

| Agent | Runs when | Token shape | Load |
| --- | --- | --- | --- |
| **0 Orchestrator** | every stage + after each worker | small routing I/O; reads the summarized bus | overhead — many small calls |
| **1 Narrative Architect** | once per schema stage | a few *large* structured outputs (persona cards + echo map) | one-time, moderate |
| **2 Content / Dialogue** | ~200–300 calls | small output (≤40–60w), cacheable input | **the baseline (dominant)** |
| **3 Consistency Verifier** | after every content batch | input-heavy re-read of canon; flag-only output | moderate — **cache-mitigated** |
| **4 Audio-Tag** | per new-entity batch | small string-gen + collision lookup | low |
| **5 QA / Playtest** | per scene-graph assembly + pre-ship | input-heavy graph read; flag-only output | moderate, few calls |

> **Dev-crew note.** The load-bearing assumption: the two input-heavy agents (3, 5) re-read canon/graph each pass, which would balloon tokens **except prompt caching** collapses those re-reads to ~0.1× (canon/graph is a stable prefix). If caching doesn't hold, the overhead climbs and the Verifier/QA become the second-biggest line after Content. §20 calibration open.

**Token-budget block (skeleton: a named open question in draft; real numbers at final).**

| Line | Value | Cost (est.) |
| --- | --- | --- |
| Model tier | divergent/creative on a mid tier; verify/classify/format on a cheap (Haiku-class) tier: build-time only | Sonnet-4.6 mid tier **$3 / $15** per Mtok (in/out); Haiku-4.5 **$1 / $5** per Mtok |
| Runtime tokens (during a run) | **0**: a run makes no model calls | **$0** |
| Dev-time generation (one-off, whole 6-agent crew) | ~200–300 Content calls (baseline) × crew-overhead (~1.5–2×, agents 0/1/3/4/5) → **order \~2–5M tokens, one-time** *(first-pass estimate: §20 open until calibrated)* | **\~$20–60, one-time** *(est.; blended in/out across the two tiers)* |
| Overrun plan | one-slot-per-call ceiling (40 words) + bounded-context summarization keep it conservative; the dev cost is bounded and iteration-multiplied, never a runtime risk | bounded by design; worst case a small multiple of the above |
| **Human review: the real bottleneck** | **\~1 week** of Roc's time, budgeted: every shipped line is personally approved (~200–300 items); this, not tokens, is what governs the 8/25 capstone | **Roc's time** — the binding cost, not dollars |

**Projections (first-pass; blended ~$10–12 / Mtok across mid + Haiku, input-heavy but cache-leaning conservative).**

| Scenario | Assumptions | Dev tokens (one-time) | Cost (est.) |
| --- | --- | --- | --- |
| **Lean** | 1 generation pass · tight caching · verify/QA on Haiku | ~2M | **~$20** |
| **Expected** | 1 pass + targeted revise loops · ~1.5–2× crew-overhead · normal caching | ~3.5M | **~$40** |
| **Heavy** | weak caching · mid-tier verify · one extra full-crew revise pass | ~5M | **~$60** |

Each additional full-crew revise pass adds ≈ **+$20–40**; strong caching on the input-heavy agents (3 Verifier, 5 QA) could pull Lean under $20. All three are one-time dev costs: runtime stays **$0**, and Roc's ~1-week review is the true ceiling regardless of which scenario lands.

> **Dev-crew note.** The headline: the build-time-only pipeline makes the *shipped game \~free to run*. The token cost lives entirely in development, is bounded, and is dominated by the Content Agent; the other five agents add a bounded, cache-mitigated overhead (kept conservative by one-slot-per-call and summarized context).

---
---

# Part IV: Technical Strategy & Scope

## 16. Technical Overview

**Full Vertical Slice.** Unreal (UE5), the Point-and-Click toolkit (Fab marketplace), Wwise audio middleware, 3D static-camera scenes.

**This-week proof-of-concept.** ink + html: the fastest way to prove the narrative pipeline in a browser. Ink is not throwaway: it is the production narrative engine, carried into Unreal via ink↔UE integration (inkcpp / Inkpot). The ink content graph built this week is the same graph the slice ships on.

**Two build tracks (so review never blocks assets).**

- **Track A: narrative pipeline proof (ink/html), this week.** Proves the seed → payoff → recognition loop and the content pipeline (§12). Gated by Roc's line review.
- **Track B: visual/asset build (Unreal).** Environments, static-camera scenes, audio tags. Runs independently, so Roc's review time never stalls visual work.

**The slice contract: polish the run, prove the loop.** Fun lives in the run; everything past it is demonstration.

1. **One run is complete**, up to the festival. This is where the polish budget goes.
2. **The short cycle is the wow: one full run → reshuffle plays end to end.** The memory payoff lands *inside* the slice, demonstrated for real (not scripted); the cycle is scoped short enough to reach the first rebirth quickly. *(How short: a prototype/§20 item, no number committed.)*
3. **The story pipeline holds for a few runs:** year-over-year neighbor memory, backstory fill between years, echo accumulation across festivals.
4. **NPCs have different-role content:** the reshuffle is demonstrable, not promised (the on-camera "she was the chef, now she's the blacksmith" moment comes free).
5. **1–2 authored endings ship.** The deepest-bond ending may ship last but never ranks above the others: endings are points on the belonging-spectrum (deepest-bond · community · diffuse · solitary-release); no prescribed "true" win.

> **Dev-crew note: Van Buren guardrail.** Depth is per-tier and earned; no numbers we haven't prototyped, no simulation detail, no multi-state high-count systems, no dexterity inputs, no phased-release "add it later" design, no doc-length for its own sake. The full guardrail table lives in the blueprint (`../knowledge-base/synthesis/gdd-structure-model.md` §7); when a section starts reading like an over-specified engineering sheet, that content belongs in §20, not the body.

---

## 17. Project Conventions

One idea runs the whole game: a single, department-agnostic tag names each gameplay event, and a lookup table turns that tag into sound, text, and art at once. A strict file-system hierarchy and folder map provide self-documenting asset connections, and help an LLM derive where assets live and maintain file-system integrity.

> **Dev-crew note.** Naming, resolution, and CI conventions follow. The tag *is* the metadata: each gameplay event is a department-agnostic hierarchical Unreal GameplayTag; the data-driven tag→asset library resolves it per department. This replaces path-mirroring, and the library is the single source of truth. §18 is the contract, §17 is the rule that makes it enforceable.

```
<Entity>.<Interaction>[.<Phase>]   →   Wwise event · dialogue key · animation/VFX   (per department, via the tag→asset library)
```

- **Naming rule:** tags are hierarchical, department-*agnostic* (no `Audio.` / `Text.` / `Art.` prefix), and extensible: new content adds new tags, never a new scheme or an enum edit.
- **Resolution rule:** every department reads the *same* tag through its own resolver column in the library. Adding a department = adding a column.
- **CI note:** a validation pass (WAAPI-backed) flags orphan tags (a tag with no mapping) and missing mappings (a required department resolution absent), the same collision/orphan check the Audio-Tag Agent runs, promoted to a build check so the library can't silently drift.

---

## 18. Audio & Asset Implementation

> **Dev-crew note.** Sounds are collectible objects that travel free like knowledge: you can **show** one to a neighbor (the leitmotif probe), **gift** a recorded melody as a declaration, or use one as a **spell component**. You record deliberately, never knowing which sound will matter, and its significance lands later. The deepest bond's leitmotif surfaces from the festival mix as you gather enough of a soul, so you can recognize someone by their sound before you can name them.

**Triggers are department-agnostic Unreal GameplayTags, resolved to Wwise events through a data-driven tag→asset library.** (Supersedes the earlier `<Entity>_<AnimVerb>_<State>` string, the fixed enum, and the mirrored-directory auto-link, all retired 2026-07-19.)

- **One tag is a game-wide gameplay-event key, with no department prefix.** Each event is a hierarchical, extensible GameplayTag: `<Entity>.<Interaction>[.<Phase>]`, e.g. `NPC.Chef.Show.React` and `NPC.Chef.Ask.React` (*not* `Audio.NPC…`). One tag names one event, game-wide. The hierarchy grows by *adding tags as content grows*: no fixed enum, no schema change; a phase is just another optional segment.
- **A tag → asset library resolves each tag per department.** The same tag maps to a Wwise event (audio), a dialogue line/key (text), and an animation/VFX asset (art): one tag, N department resolutions, so a single gameplay event drives sound *and* text *and* art together. Adding a department means adding a resolver column, not a new tagging scheme. The library (an Unreal DataAsset / DataTable) is the single source of truth, and it's unaffected by assets being moved or renamed: no path-mirroring.
- **Direct event targeting.** Gameplay fires the event by tag lookup; each department reads its own resolution (audio posts its Wwise event). No Switch routing by default. Wwise Switches / States / RTPCs are reserved for genuine runtime variation only: material-based footstep switching, or intensity/proximity/time-of-day ramps. The exception, not the rule.

> **Dev-crew note.** The Show / Ask split at the tag layer (§5) is why the two carry distinct interaction names: an NPC reacting to a shown sound resolves to different audio and dialogue than a spoken probe.

**Middleware = Wwise** (locked): familiar, scriptable, and WAAPI is the natural home for library tooling and validation.

**Ownership.** The tag namespace is shared and game-wide. The **Audio-Tag Agent (§11)** owns the *audio* resolution: it proposes compliant tags and maps/verifies each tag's Wwise-event entry, flagging collisions and orphan/missing audio mappings. It generates no audio and assigns no style or emotion. Soft gate. Text and art resolutions are owned by their own department passes, keyed off the same tags.

> **Dev-crew note.** The tag-hierarchy segment scheme (Entity → interaction → phase/descriptor) fills with the verb-table pass and is a §20 open item, but it's extensible by design, so it's non-blocking.

---

## 19. Milestones

> **Dev-crew note.** Anchored to the course assignment dates (`syllabus.md`). Each milestone carries what must be spec'd before it closes, and *who or what verifies* it's closed: the "Verified by" column pairs with the human gates in §11.

| Date | Milestone / deliverable | Blocking sub-rows (must be spec'd before close) | Verified by |
| --- | --- | --- | --- |
| Tue 7/14 | **GDD first draft** (Assignment #1) | Concept + pillars locked | ✅ Submitted |
| Thu 7/16 | **Final GDD draft** (Assignment #2) | 18-hole hole-filling substantially closed | ✅ Phase-3 decisions doc |
| **Tue 7/21** | **Agent crew** (Assignment #3: 3+ agents, shared output, dev artifact) | Dev-crew roster + JSON I/O (§11); session-state bus field schema | This Build GDD → then the 6-agent review panel (game-28) |
| Thu 7/23 | **Dynamic content pipeline** (Assignment #4: RAG, 3+ content types, consistency checks) | Content Agent + Consistency Verifier contracts (§11); voice register + tone enum | QA/Consistency agents + Roc review of sample output |
| Tue 8/4 | **GER pipeline** (Assignment #6) | Level layout → gate/verb table; content-budget formula inputs | QA Agent traversal pass on the generated layout |
| Thu 8/6 | **Style-guide agent** (Assignment #7) | §10 color grammar + silhouette vocabulary as machine-checkable rules | Style agent + single review eye |
| Tue 8/18 | **Complete AI dev pipeline** (Assignment #10) | Token budget calibrated (§15); end-to-end prompt→engine documented | Cost analysis against real generation |
| **Tue 8/25** | **Capstone: final playable game** | Slice contract (§16) met; 1–2 endings shipped | Human playtest (primary) + QA Agent pre-ship pass |

---

## 20. Risks & Open Questions

> A decision lives in exactly one place: Open (a named question), Resolved-with-pointer (graduated into the body), or Parked. Never two, never deleted.

### Top risks (with fallback)

- **NPC perceptual distinctness (the differentiator's soft spot).** Whether the essence-signature card pipeline yields perceptibly distinct neighbors needs real Phase-3 writing samples against the voice guide; the structure guards homogenization but can't prove it on paper. *Validate:* by 7/23, generate the 3 deep souls' key lines and read them side by side. *Fallback:* hand-author the 3 deep souls; agents handle texture NPCs only.
- **The reshuffle / persistence engine coherence.** The on-camera role-swap must read as the same soul in a new role. *Validate:* the Track-A ink prototype demonstrates one reshuffle end to end. *Fallback:* hand-script the single on-camera swap for the slice; generalize post-capstone.
- **Ink ↔ Unreal integration.** The narrative engine must carry from ink into UE. *Validate:* an early integration spike. *Fallback:* ship the slice as the ink/html build if UE integration slips; the narrative proof still lands.
- **Human-review bottleneck (\~1 week of Roc).** *Fallback:* cut to a 1-year run + 1 ending to shrink the approved-line count (see §21).

### Open

- **Which 1–2 endings ship in the slice?** Candidates: the "not this life" melancholy version + one warmer, deepest-bond-enough variant. (§5.1, §16)
- **Content-budget calibration:** the formula and inputs are locked (§15); the beat/template counts stay a named estimate until calibrated against real generation.
- **Token-budget real numbers:** the ~2–5M whole-crew dev-time figure (content baseline × ~1.5–2× crew-overhead) is a first-pass estimate pending H13 calibration; the crew-overhead factor and the caching assumption for the input-heavy agents (3 Verifier, 5 QA) are the specific unknowns.
- **Four-family sub-verb list:** blocks the Audio-Tag Agent's tag emission and the recognition-gate proof-step co-design; fills with the verb-table pass. (§5, §11, §18)
- **Session-state bus field schema** (what it records, at what granularity, the Verifier's summarization cadence). (§12, §13)
- **Runtime persistence / session-state schema** the deterministic engine reads and writes: the dev-crew's one authoring obligation toward §13. Includes the **bond-scoring field format** (the four action-category weights, trust · intimacy · recognition · respect, and the per-soul card-trait coefficients feeding the single hidden count) and the **NPC-codex schema** (souls × locked_facts × places_threads) the Verifier reads.
- **Delta-storytelling rule field format:** grounded in Frieren craft, no formal I/O precedent yet. (§11)
- **Tag-hierarchy segment scheme** (Entity → interaction → phase/descriptor?): fills with the verb-table pass; extensible, so non-blocking. (§18)
- **Map shape (routing dependency):** §9 is writable at gestural altitude either way, but the orchestrator's routing depends on it. (§9, §11)
- **Recognition notebook UI:** deliberately deferred; the data model is the contract (Soul/Role/Place/Item/Sound/Moment/Descriptor + typed edges), the presentation iterates later. (§13, §8.3)
- **Detailed data schema** (field types, cardinalities, keys) for the notebook/rumor-graph, deferred to build.
- **H9 baseline-narrative content (deferred to game-35):** the slice's specific place, the central 15-second memory vignette, and the seed-and-payoff spine across the three festival-years.

### Parked (do not resolve)

- **The letting-go ending:** does the terminal choice release the bond or hold it? A is designed as its *counterweight*, not its dependent, so the frame works whichever way it lands. (§8.3)
- **The going-big lead pole:** which register leads when domains blend. The domain-map (§10) sets each domain's register; which one leads a mixed moment is open by design.

### Resolved (decision + pointer, kept for the record)

- **Concept** → cosmic hide-and-seek: reincarnation-deduction cozy roguelike (§1).
- **Terminology** → **bond level**, not "partner"; run = life; the deepest bond is emergent (vocabulary note, §8.3).
- **Audio (H15)** → department-agnostic GameplayTags + tag→asset library + Wwise; Show / Ask split at the tag layer (§17, §18).
- **Live mode (H10)** → dropped from this build; parked in §21.
- **Runtime persistence** → deterministic mechanics, not an LLM (§13).
- **Spells (H6)** → physical outcomes only, receiver-determined (incl. no effect); starter `ignite` (sticks), `scratch` (wool), `breath` (grass+dirt) (§6).
- **Recognition (H16)** → Obra-Dinn dropdown-pick + batch-lock; Soul vs. Role; essence-FACT vs. bond-level-EMERGENT; notebook is a data model, UI deferred (§5.1, §8.3).
- **Design law** → knowledge lives in the player's head, not a flag; gates performed, never flag-blocked (§4, §9.3).
- **Endings (H18)** → no hard-lose; soft terminal states; slice ships 1–2 endings (§5.1).
- **Art (H17)** → 3D; going-big is a domain-mapped blend; Wwise; UE5 (§10).
- **Action families** → four (Collect · Make · Use · Converse); Show/Ask are tag-layer names, not families (§5).
- **Roster (H1/H2)** → 3 deep (Keeper / Giver / Kinbound: tended / manufactured / given) + 5 texture; availability deals 1–2 "past" per run (§11 input).
- **Scope math inputs (H14)** → 8 souls, cap 3, 3 years, 2(+1) locations, 5 days, 3–5 moves/day, 2 canned paths, 10 spells, ~15 items (§15).
- **Slice contract** → polish the run, prove the loop (§16).
- **Engine** → Unreal; ink for the narrative engine and the this-week POC (§16).
- **Six-beat room grammar** → retired; superseded by the four action families (§5).
- **Narrative process (§8.5)** → synthesized into the [`narrative-pipeline/`](../narrative-pipeline/) mini-KB (12 files) + a user-facing §8.5 summary in the body; §11/§12/§13 schema edits applied (arc doc, NPC codex, `backstory_guideline`, echo `payoff_voice`/`reveal_npc_id`/`prerequisite_theme`, player background, bond-scoring). Prior-art read folded from NeverEndingQuest → `narrative-pipeline/prior-art-neq.md`. (game-38; §8.5, §11–§13)
- **Multi-agent retry / escalation** → up to 2 Content revisions on a prose flag, then ride-to-gate with the flag attached; structural flags escalate through the Orchestrator to the Architect; model fallback on repeated failure. (`narrative-pipeline/pipeline.md` step 13; §8.5, §11)

---

## 21. Planned Scoping Cuts

Ordered by what goes to the Parking-Lot first if time runs short. The top of this list is cut before the bottom.

1. **Year 2 and Year 3.** Cut the run from three years to one (`year-1 week → vignette`). The single biggest lever on the human-review line count.
2. **Live / BYOK pipeline.** Already out of this build; stays parked.
3. **The Farm (third location).** A reserved slot (§9.4); adds without reworking Town or Forest, so it drops cleanly.
4. **The second ending.** Ship 1 authored ending instead of 2.
5. **The deepest-bond ending.** May ship last; the belonging-spectrum still reads with the other endings.
6. **Screens beyond the 3 start screens per location.** Progressive-unlock screens trim to the start trio if needed.
7. **The leitmotif-from-mix audio system.** The recognition clue can lean on visual/text signatures if the audio pipeline slips.

> **Dev-crew note.** A cut here is a move to the Parking-Lot, not a deletion. Anything cut keeps its §20 pointer so it can come back without a re-decision.

---

*Rebuilt to v2 on 2026-07-21 from v1 + Roc's review pass. Changes: 4-Part / 21-section spine; run = life vocabulary swept; §8.2 persistence renamed Save-State with a three-boundary table; four action families with Show/Ask split to the tag layer; two-mode pipeline reduced to one build-time pipeline (live parked); two build tracks (Unreal slice · ink/html POC this week); magic-system stub added (§6); scoping-cuts section added (§21); §1 and pillar language stripped of feeling/weight claims; §8.5 narrative process reframed and left pending KB synthesis; headers restored (4.4/5/6); list numbering fixed. Next: the §8.5 narrative-process synthesis from the narrative KB.*
