# Codename: rebirth — Game Design Document

A cozy roguelite point-and-click adventure about belonging across lifetimes.

---

# Part I: Concept & Pillars

## 1. Concept

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Myst*, *Outer Wilds*, *Frieren*, and *Studio Ghibli*, where you **explore, collect, and discover**.

The game explores one question: what does it mean to belong, and does connection span lifetimes?

You are a mage in a Ghibli-warm world who has just arrived in a new town. You spend your days foraging, crafting, learning folk magic, and getting to know your neighbors. You arrive the week before the festival of souls, and by discovering spells and items and learning about people, you contribute to the festival's success. After the festival, time skips forward a year and you see the outcome of your decisions. For the vertical slice, a cycle is three years, and at the end a retrospective of your time in the town is presented. On a return to the game, you find the townsfolk have shuffled: the blacksmith may now be the postman, a friend may now be a brother. Each run is a different lifetime: the roles of the npcs reshuffle, but the essence and personality of each soul stays the same. As you spend more time with people, your bond grows across lifetimes.

---

## 2. The Hook

- Short play sessions that reward replays through knowledge and collection completeness.
- Player agency is honored; no two sessions are the same.
- The same souls return each life in shuffled roles, while personalities stay fixed.

- Built with Human-in-the-Loop AI development pipelines integrated.

---

## 3. Inspirations & Target Audience

Each reference is taken for one precise structural move, not a vibe. One split is worth holding explicitly: **Outer Wilds lends the *form* of a knowledge game — the notebook, the loop, knowledge-as-key; Obra Dinn lends its *subject* — a mystery made of people. What we pay off is belonging, not a cosmic reveal.**

| Game / work                                        | Mechanic / Inspiration                                  | How we adapt                                                                                                                                                                                                                                                                                                                                                                    |
| -------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Outer Wilds**                                    | Knowledge is the key; the log holds it                  | The notebook *is* the ship-log / rumor-graph: it auto-links what you've learned and marks "more to learn here". Knowledge travels free, never expires, and opens gates when *performed*. We take the loop that keeps your knowledge and the traversal engine — **not** the promise of a single terminal world-truth. Here, discovery is of people, and the reward is belonging. |
| **Return of the Obra Dinn**                        | Deduction you *prove*, not guess                        | Assert-then-confirm as a compound claim (identity × facet × role), evidence-gated so the small soul-list can't be scanned; correct answers lock in small batches with confirmation withheld. Our recognition gate is this, aimed at souls across lives.                                                                                                                         |
| **Myst (and its remakes)**                         | The living-diorama, the information-key                 | Static-camera scenes; the key is *information*, not an item. The five-field puzzle template (Problem / Circumstance / Clues / Solution / The Idea).                                                                                                                                                                                                                             |
| **Frieren: Beyond Journey's End**                  | Tone and voice-guide                                    | We borrow the tone and dialogue patterns and model for writing narrative. Collectible folk magic.                                                                                                                                                                                                                                                                       |
| **A Storied Life: Tabitha**                        | Objects are mundane until you learn what they witnessed | Curation-as-authorship: what you keep writes the memory that remains. Our mementos are the low, unflagged echo-carriers.                                                                                                                                                                                                                                                        |
| **Spiritfarer / Animal Crossing / Stardew Valley** | Cozy rhythm; social-forward, softly-limited days        | The neighborly moment-to-moment (talk, gift, tend); the day soft-limited by the world (shops close, light fades), never an energy bar.                                                                                                                                                                                                                                          |
| **Majora's Mask**                                  | A recurring deadline everybody remembers                | The festival week as the run boundary: urgency plus melancholy, no fail state, inverted here so *everyone remembers* prior years.                                                                                                                                                                                                                                               |

**Who it's for.** Players who enjoy cozy exploration and collection completionists, and players who enjoy character-driven narrative that explores emotional themes.

---

## 4. Design Pillars

Each pillar carries the thing a builder must never do that would violate it. The refusal is the contract; the phrase is the reason.

| Pillar                                               | What a builder must never do                                                                                                                                                       |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discovery is the reward**                          | Never hand the player the answer. Watching a neighbor cast gives clues, not the spell; the player still confirms by trying. Proof comes before definition.                         |
| **Cozy rhythm**                                      | Never hard-stop the player. No single-chain dead-ends, no forced sequence. A stuck player always has another live thing to do.                                                     |
| **Pull, not push**                                   | Never issue a directed command or a quest-arrow. The world *offers* leads (a door that names its own key-type); it never orders.                                                   |
| **Knowledge lives in the player's head, not a flag** | Never flag-block a gate the player has the knowledge to solve. Gates are *performed* (cast the phrase, assert the cipher's meaning), never checked against a "visited X?" boolean. |
| **Non-violent core**                                 | Never resolve a beat with a fight, a fail-punish, or a threat. Conflict is social and internal, never combat.                                                                      |
| **Strategy over dexterity**                          | Never gate anything on timing, aim, reflex, or precision input. Every gate is knowledge, recall, or a social state.                                                                |
| **Agentic AI accelerates, it never decides**         | Never ship a line no human approved. Agents generate volume and check consistency; a human reviews and approves every line before it ships.                                        |

**Non-Goals.** What the game deliberately won't be:

- **No multiplayer or co-op.** The slice is solo-first. If a mechanic needs a second player, cut it.
- **No tactical combat.** Strategy lives in route, deduction, recognition, and curation-under-consequence, not a battle grid.
- **No live-service or always-online systems.** The shipped game runs fully offline.
- **No hard-lose or game-over.** You always leave with something. A wrong action teaches; it never punishes.
- **No red-herring content.** Keeping clues from being trivially obvious is fine; budgeting a decoy layer is asset spend we don't have.

---

# Part II: Game Mechanics

## 5. Core Loop

**The moment-to-moment loop:**

- **Collect.** Pick up anything collectible: components, made things, mementos, spell-phrases (knowledge), and sounds (audio-objects). Listening is Collect applied to sound.
- **Make.** Combine components plus learned knowledge into an output: a spell, a dish, a craft, a piece of art. One structure for all three.
- **Use.** Apply a held thing (a spell or an item) to a target: ignite a lantern, still the water, offer a scritch to a cat. Presenting an item or a sound to a neighbor is also a Use, with the neighbor's reaction as the result.
- **Converse.** Talk to an NPC. Distinct from Use: no object changes hands, the exchange is dialogue.

**Starting a run.** On game start you get an intro screen and select a persona; for the slice the only choice is mage. You start randomly in the town or the forest. At each location a day is a budget of **3 to 5 screen-moves**. Each screen hosts solo interactions (foraging, casting: procedural, near-zero authoring) and social interactions with any souls present.

**The satchel, the notebook, the home.** You carry a satchel and a notebook. The notebook can be referenced at any time and holds the knowledge you have collected. At day's end you carry from the screen only what fits the satchel, and you return home. You can also end a day early to bank a full pack plus what you can carry in your arms (pack-triage). Your home is this life's hub: you decorate it and can carry items back out of it (they take satchel room). It starts empty at each new life; everything you've ever collected is recorded permanently in the meta-hub (§9.4). When ready to move on, you open the calendar and pick the next day's location.

**The run.** A run is the same festival week across three successive years. After each week, time jumps a year, with backstory filling the gap and neighbors remembering what you did. The week builds toward festival night, and the outcome depends on the choices you make.

**Ending a run.** After the final festival night, an ending vignette based on the player's decisions plays.

**A new beginning.** Each new run reshuffles the souls. Personalities stay fixed, but each soul's role in the town is re-dealt. Over time the player keeps notes on them, in the manner of *Return of the Obra Dinn*. Across runs, the bond level you build with a soul persists, leading to different outcomes.

### 5.1 Win / loss: soft terminal states

The outcome of the festival depends on player choices but there is **no hard-lose and no game-over**. A run always ends *with something*: the ending vignette is guaranteed. Success is measured as **depth of connection reached** (knowledge of people and collection progress). The game cannot be lost, only lived. 

---

## 6. Magic System

**Learned by watching, confirmed by doing.** Seeing a neighbor cast on a target gives a clue, not the spell; you confirm by trying it yourself. Proof comes before definition.

- **A spell is a phrase plus components.** A spellbook section in the notebook records the spells you have learned. You learn them by casting them.
- To cast, select components from your inventory and input the phrase.
- **Physical outcomes only.** Spells produce physical effects, never a mood or a dictated behavior; the outcome is receiver-determined (6.1), and "no effect" is an honest result.
- **Cost and tiers.** Anyone can cast, but archetypes carry different mana. Low mana means a lower-quality cast (a bigger or smaller fire), and some spells have a high mana floor a low-mana caster cannot meet.
- **Starter set:** `ignite` (sticks), `scratch` (wool), `breath` (grass + dirt).
- **Magic unlocks screens.** Casting is a knowledge-key: watch a neighbor burn a dry hedge to clear it, then do it yourself to open the way. Traversal is gated by what you know, not a flag.
- **Slice count:** 10 spells.

### 6.1 Receiver-Determined Outcomes

The target of any directed interaction holds the response logic. **The action verb encodes only what was done, never what happened.** Ignite-on-sticks catches; ignite-on-a-person does nothing, and the nothing is the honest, taught result. Spells produce physical outcomes only: they never set a mood or dictate a behavior; any emotional response (a cat purring at a scritch) is the receiver's own reaction to the physical effect. Maker-side quality × receiver-side disposition = the outcome.

---

## 7. Collectibles

Six item categories the player can **Collect**. Persistence follows the Save-State rules (8.1): sounds and knowledge travel free, everything physical is pack-triaged.

| Category                   | Role                                                                                    | Persistence          | Examples                            |
| -------------------------- | --------------------------------------------------------------------------------------- | -------------------- | ----------------------------------- |
| **Components**             | Foraged magic ingredients, consumable; feed Magic casting and Make                      | pack-triaged         | a berry · a river stone · a feather |
| **Made things**            | Outputs of Make (dishes, crafts, art); some consumable, some giftable                   | pack-triaged         | a warm loaf · a small carving       |
| **Mementos / keepsakes**   | Hub decoration and echo-bearing: the low, unflagged retrospective-significance seeds    | pack-triaged         | a worn ribbon · a pressed flower    |
| **Gifts**                  | The declaration system: a *use* of a memento or made-thing, not a separate object class | drawn from above     | a given keepsake                    |
| **Sounds** (audio-objects) | Travel free, no pack space; show / gift / spell-component                               | free, like knowledge | a festival bell · a hummed tune     |
| **Tools**                  | Non-consumable Use-family items                                                         | pack-triaged         | a lantern · a small knife           |

**Scope:** roughly 3 per category, about 15 distinct items (gifts overlap mementos and made-things); final counts from the content budget (14).

---

## 8. World & Progression

### 8.1 Save-State: what the save file records

Knowledge is held by the player, but the game tracks certain things in the save-state. The file records six kinds of thing, each with its own lifetime across two in-game boundaries: a **run** (day to day, year to year within one life) and a **reshuffle** (the start of a new run). A third boundary, a **wipe**, deletes the save file outright — every row below resets to zero, and the only thing that carries across is what you, the player, have learned, which the game never stored. There are 3 save slots; the meta-hub collection is shared across all of them, while each life's in-game home starts empty.

| Data                                                          | Within a run (day → day, year → year)                      | Across a reshuffle (new run) |
| ------------------------------------------------------------- | ---------------------------------------------------------- | ---------------------------- |
| **Spells**                                                    | Yes, in the notebook                                       | Yes, in the notebook         |
| **Sounds** (audio-objects)                                    | Yes                                                        | Yes                          |
| **Physical items** (components, made things, mementos, tools) | Only what fits the satchel; the rest stays in this life's home | **No** — the in-game home resets empty |
| **Bond level** (per soul, met → claimed)                      | Yes, grows                                                 | Yes, derived over time       |
| **Roles / relationships**                                     | Fixed                                                      | Re-dealt (repermuted)        |
| **In-game home** (this life's décor)                          | Yes, you arrange it                                        | **No** — resets each run |
| **Meta-hub collection** (items *held* · sounds *heard*)       | Grows as you discover                                      | **Yes** — permanent; new finds unlock as display pieces, never for use in a run |

### 8.2 Game Clock

Time in the game follows this structure:

- **Day.** A budget of 3 to 5 screen-moves at one location. Time of day advances when you move to another location (map). At day's end you return home and pick the next day's location.
- **Week.** The week builds to festival night. A week is currently 5 days but can expand or contract with scope.
- **Year-jump.** After the festival, time skips a year; backstory fills the gap; neighbors remember last year.
- **Run (a life).** One or three years (scope decides), then an ending vignette. Full: `year-1 week → year-2 week → year-3 week → vignette`. Cut: `year-1 week → vignette`.
- **Postrun (a new timeline).** A new run reshuffles / re-deals roles (personalities fixed); bond levels carry across. 

Route choice is attention allocation: you cannot be everywhere before the festival, so the calendar is the strategy layer.

### 8.3 The Narrative Process

The narrative is generated by a repeatable build-time process, not written by one person holding the whole world in their head. A small crew of agents produces the game's content during development, steered by a per-arc document. A human approves every line at the output.

#### The process, step by step

1. **Steer.** Write the per-arc doc: a note per soul for where they are heading, the threads to keep alive, and what the arc is not. Everything downstream reads from it.
2. **Intake.** Hand the crew the arc doc, the soul roster, a backstory guideline per soul, and the player's chosen background. Each scene request carries the character arc, and a request with no steering tag bounces back.
3. **Cards.** Fill a persona card per soul: essence fixed across every life, role re-dealt each reshuffle, traits kept orthogonal so no two souls read as the same archetype in different hats.
4. **Echoes.** Write the seed-and-payoff templates. A plain detail is planted early beside ordinary business, and it pays off later only once the player has made the deduction its condition names. It is a recognition mechanic, never a promise about feeling.
5. **Graph.** Lay the scene graph as preconditioned encounters, not quests. The world offers two or three live leads, each scene resolves from any entry point, and each adds one new fact under cover of an ordinary job, in the richer form a world fact and a personal fact together.
6. **Gates.** Spec each winnable deduction (Problem, Circumstance, Clues, Solution, the Idea). The proof is a diegetic action only someone who understood would take, never an "I figured it out" button.
7. **Lines.** The Content Agent writes one slot at a time using the style guide.
8. **Check.** A Consistency Verifier flags each batch against a locked invariant set, an automated pass strips the AI tells, and QA confirms the graph is traversable. All three flag only; none rewrite.
9. **Approve.** A human approves every line at the output, using the SDT checklist (autonomy, competence, relatedness) for what the machine cannot judge. Nothing ships unread.

#### The crew (which agent owns each step)

| Process step                                                               | Agent (see section 11)                                |
| -------------------------------------------------------------------------- | ----------------------------------------------------- |
| Steering, Intake, Cards, Echoes, Delta and canon, Graph, Recognition gates | Narrative Architect (Agent 1)                         |
| Lines                                                                      | Content / Dialogue Agent (Agent 2)                    |
| Verify                                                                     | Consistency Verifier (Agent 3)                        |
| Purge the tells                                                            | The Content Agent's automated tell pre-pass (Agent 2) |
| QA                                                                         | QA / Playtest Agent (Agent 5)                         |
| Sequencing, escalation                                                     | Orchestrator (Agent 0)                                |
| The human gate, SDT review                                                 | Human                                                 |

The Orchestrator sequences the whole chain: it hands each worker its prepared input, collects the typed output, and surfaces the gates. Workers never call each other, and every worker's output is human-gated before it commits.

**The constraint.** We write stories; we do not script payoff. The mechanical recognition is scripted (the player asserts a soul's essence, the game confirms at a threshold, wrong guesses teach) and the text is authored, but the resonance is invited, never produced or measured. No agent, field, or metric claims to know what the player feels. Procedural technique is primary; cohesion and story serve it.

The full construction spec, the ordered procedure, the guardrail checklist, the register rules, the arc-doc and card and echo templates, the build-time ink authoring loop, and a worked example, is maintained as a separate working specification.

---

## 9. Levels

Two locations ship first: **Town** and **Forest**. Each is roughly 7 to 8 screens, progressively unlocked (3 reachable at start, the rest opened by knowledge-key gates the player *performs*). To unlock further screens the player learns to cast spells through interactions with neighbors, for example seeing someone cast fire on a dry hedge to clear it. A third location (**Farm**) is a reserved slot if time permits. Each location is a mini-metroidbrainia: the map itself is the knowledge-key system, so "knowledge is the key" shows up at the level of traversal, not just puzzles.

**9.1 Town.** The festival's home; you arrive on the Square.

- **Square** *(start)* — under the Lantern Arch, which ages across the years.
- **Market Row** *(start)* — stalls and vendors.
	- **Blacksmith Workshop** — where one of the main NPCs works.
- **Commons & well** *(start)* — daily life.
	- **NPC Homes** — requires a certain level of relationship to visit.
- **Tavern** — only opens in the evening (if you don't start in the town, or choose to stay in the town after the move budget).
- **Festival Grounds** — the run's build-up pays off here.
- **Old Shrine** — at the town's quiet edge; read its carvings *if* you understand the cipher.

**9.2 Forest.** The foraging woods and the older, stranger things in them.

- **Forager's Clearing** *(start)* — Collect; a first main NPC.
- **Stream** *(start)* — Use: ignite gathered kindling; doesn't work on water.
- **Grove** *(start)* — Make, as field-craft.
- **Trail** — clear a hedge with ignite.
- **Old-Growth Hollow** — one insight opens two screens at once.
- **Forest Ruin** — ritual marks are written here (readable only by moonlight).
- **Cave** — a reward-space destination.
- **Heart of the Wood** *(stretch)* — opened by combining two fragments.

**9.3 The Path.** A path off the Square connects Town and Forest.

**9.4 Home Hub.** Two spaces sharing one asset set:

- **In-game home.** Your home during a life — return at day's end, bank what fits the satchel, and decorate it. It resets empty at the start of each new run.
- **Meta-hub (main menu).** The role-select screen doubles as your permanent collection: every item *held* and sound *heard* is recorded, completion tracked across all lives, and each run's new finds unlock as display pieces you arrange. It shares the home's decoration assets, but its pieces are display-only — never withdrawable into a run.

**9.5 Farm (stretch slot).** Same shape if added: a start trio (Yard · Field · Barn) plus progressive unlocks, one featured archetype not used elsewhere.

---

## 10. Art & Audio Direction

**Tone words:** Ghibli-warm, painterly, quietly melancholic, lived-in. Concept references set the rules, not the assets: the desaturation discipline and flat emotional register of *Frieren*, the palette warmth and environmental wonder of Studio Ghibli, the static-camera living-diorama of *Myst*. No imagery is reproduced.

**Built in 3D.** The planned engine is Unreal, using the Point-and-Click toolkit from the Fab marketplace. The goal is 3D levels for visual depth, with one built environment reused from many angles: one 3D location yields many static-camera scenes. The replayed festival week across years then renders cheaply: the same level at a different angle, time-of-day, or seasonal state gives the "time moved, we returned" read with no intertitle.

3D can read sterile and un-Ghibli, so warmth is held by a system rather than by hand-finishing every asset: a hard-constrained palette (bands, not a free wheel), a locked silhouette vocabulary every generated variant reads as a variant *of*, and one key-art board plus one review eye. Cohesion comes from rules plus a single reviewer.

**Sonic identity.** Music inspired by Joe Hisaishi and the Studio Ghibli films. Ambience and items grounded in foley libraries and field recordings. Magic follows an anime style. UI is tactile, with fantasy flourishes where appropriate. Sound is the strongest retrospective trigger a person has, which is why the audible essence-signature is the deepest recognition clue: the deepest bond's leitmotif surfaces from the festival mix as data accrues, so you can recognize someone by their sound before you can name them.

**Going big.** There is no single global "epic" register. Each domain of a big moment gets the register that fits it, and the words stay plain in all of them: social payoffs stay narrative dialogue driven, while world-opening and magic carry the Outer Wilds revelation and Ghibli awe. The swell is visual, scale, or revelation.

---

# Part III: AI Architecture



## 11. Agents

The crew obeys three rules: **one agent per feature, each seat with a clear why** (five workers plus an orchestrator is scope guidance, not a hard cap); **call down, signal up** (the orchestrator hands each agent a prepared input and collects a typed output; workers never call each other, which keeps every agent testable in isolation); and **the human gate lives at the output, never mid-chain** (a human reviews and approves; a broken output is never silently swallowed). Every agent does bounded structured output, classification, or string-pattern work; nothing rests on open-ended generation. Schemas are given at document altitude; the field-level implementation schema is a build task.

**Agent 0: Orchestrator (the manager).** Owns sequencing and gate-keeping, not vision or content. Frames scope, reads the bus, decides which stage runs next, hands each worker its input bundle (the per-arc arc doc and NPC codex ride in every bundle), collects the typed output, and surfaces the human-gate checkpoints. Resolves conflicts when two outputs disagree.

- *In:* `{ session_goal, pipeline_stage: "schema|greybox|prose|canon_check", agents_to_call:[…], arc_doc_ref, npc_codex_ref, session_state_ref, human_gate_required }`
- *Out:* `{ session_id, dispatch_queue:[{ agent_id, input_bundle, gate_before_write }], session_state_update, surfaced_gates:[…] }`
- *When:* always first, and again after each worker completes. *Gate:* routes freely; every worker's output is human-gated before it commits.

**Agent 1: Narrative Architect (schema stage).** Owns story architecture: the structural layer that tells every downstream agent *what* the narrative commits to, without writing a player-facing line. It folds three sub-functions: the seed-and-payoff echo map, the persona-card schema, and the delta rule plus canon flags. It also maintains the human-note Soul Arc Spines, threads to keep, and what the arc is not, and emits the NPC codex, the canonical per-arc registry of which souls exist and their locked facts. It does not write dialogue, does not check consistency, and cannot invent NPCs: the roster is a required input, and the codex enforces it.

- *In:* `{ arc_doc:{ soul_arc_spines:[…human notes…], threads_to_keep, not_this_arc }, slice_npcs:[{ npc_id, essence_hints:[…seed…], backstory_guideline, suit_tag }], player_background, scene_list:[…], locked_decisions:{ knowledge_travels, superposition_rule, soft_reminder }, voice_guide_ref }`
- *Out:* `{ persona_cards:[{ npc_id, trait_axes:[{axis,value}] (also serve as bond-weight coefficients, 13), backstory_guideline, essence_descriptor, suit_tag, authored_exceptions:[…] }], echo_templates:[{ npc_id, seed_scene, seed_event(≤25w), payoff_scene, payoff_condition, payoff_voice, reveal_npc_id, prerequisite_theme }], npc_codex:{ souls:[{ npc_id, locked_facts:[…], places_threads:[…] }] }, delta_rule, canon_flags:[…] }`
- *When:* schema stage, once per run, always before any Content call. *Gate:* hard: cards and echo map reviewed before they propagate.

**Agent 2: Content / Dialogue Agent (prose stage).** Owns all player-facing text (NPC lines, lore, environmental text, object descriptions, echo fragments) inside the voice register. Takes a persona card, an echo template, and scene context and emits finished content, **one slot per call**. Makes no structural decisions and does not assign its own tones (the tone enum is fixed, not generated). It emits the same `speaker_id / tone / text` shape the engine reads at runtime, with no translation layer.

- *In:* `{ npc_id, persona_card, echo_template:{ seed_event, payoff_condition }, scene_context:{ scene_id, time_of_day, world_state_excerpt }, tone_enum:["quiet","wistful","matter_of_fact","warm","distant"], voice_register:"flat|warmth-swell|retrospective", max_words:40, voice_guide_ref }`
- *Out:* `{ content_lines:[{ content_id, speaker_id, tone, text(≤40w dialogue / ≤60 description), scene_id, echo_flag, canon_flag }], human_review_required }`
- *When:* prose stage, after the scaffold locks and cards are approved; per slot, one call one block. *Gate:* an automated tell / voice-drift pre-pass flags markers, then a human reviews only flagged, echo, or retrospective lines; clean lines advance.

**Agent 3: Consistency Verifier (canon-check satellite).** Owns consistency: reads each new content batch and checks it against a **finite, concrete invariant set** plus the voice register, before anything commits. It **flags only**: never generates, rewrites, or auto-repairs. The check-set is the game's own locked rules (seven invariants): superposition (including the bond scoring-function bright line: one hidden count, never stored per-category sub-scores), essence-vs-role discipline, delta, knowledge-travels, informational-feedback, voice register, and fact-tier-vs-bias-tier.

- *In:* `{ new_lines:[{ content_id, speaker_id, tone, text, scene_id }], active_canon:{ persona_cards, echo_templates, npc_codex, bond_levels, locked_roles }, session_state_ref, invariant_set:[…7…] }`
- *Out:* `{ verification_report:[{ content_id, scene_id, status:"PASS|FLAG", flag_type, flag_reason(≤30w) }], human_action_required, summary }`
- *When:* after every Content batch, before commit, and at the session-boundary snapshot. *Gate:* always human-gated: no flagged content commits without sign-off; PASS routes silently.

**Agent 4: Audio-Tag Agent.** Owns the audio-tag contract that makes the audio pipeline (17) work. Takes new entities plus the current tag-to-asset library and produces a compliant Unreal GameplayTag per required audio trigger, mapped to a Wwise event, checking each proposed tag for collisions and orphan or missing mappings. Generates no audio and assigns no style or emotion: it names and verifies format only.

- *In:* `{ new_entities:[{ entity_id, entity_type:"npc|object|scene|spell" }], required_interactions:[…from the four families…], existing_tag_library }`
- *Out:* `{ new_tags:[{ entity_id, gameplay_tag:"NPC.Chef.Show.React", wwise_event, collision_flag, orphan_flag }], library_delta, violations:[…] }`
- *When:* schema / pre-production, whenever new entities enter the slice. *Gate:* soft: the library delta is reviewed and auto-commits on no objection.

**Agent 5: QA / Playtest Agent (traversal & functionality).** Owns structural QA: verifies the assembled slice is **traversable and works as specced** before ship. Enumerates choice permutations, checks every branch and state is reachable and leads somewhere valid (no soft-locks, dead-ends, or orphaned content), confirms win-states are reachable by an intended path, and confirms each interaction produces its specified effect and its wrong-action teach. Flags only. Distinct from Agent 3: the Verifier checks *is it consistent?*; QA checks *does it work and can you get through?*

- *In:* `{ scene_graph, gates:[{ gate_id, key_type, unlocks:[…] }], win_lose_conditions, interaction_specs:[{ interaction_id, expected_effect, wrong_action_teach }], archetypes:["discovery","emotional","puzzle"] }`
- *Out:* `{ reachability:[{ node_id, reachable, via:[…] }], flags:[{ flag_type:"soft_lock|dead_end|unreachable_content|unreachable_win|broken_interaction|missing_wrong_action_teach", location, detail(≤30w), severity }], archetype_notes:[…], human_action_required }`
- *When:* after a batch assembles into a playable scene graph, and again pre-ship. *Gate:* hard on any soft-lock or unreachable-win; soft otherwise.

The runtime persistence system is mechanics, not an agent. Two expansion candidates are named but unstaffed until the build surfaces the need: a project-manager / task-board agent and an audio implementer that wires each tag to a real asset.

**Roster + human-gate summary**

| #   | Agent                    | Feature owned (one)                                                                | Stage       | Human gate                                                               |
| --- | ------------------------ | ---------------------------------------------------------------------------------- | ----------- | ------------------------------------------------------------------------ |
| 0   | Orchestrator             | Sequencing · session-state bus · gate-surfacing                                    | all         | Routes freely; each worker's output is gated                             |
| 1   | Narrative Architect      | Story structure: arc doc + echo map + persona-card schema + delta rule + NPC codex | schema      | Hard: cards + echo map reviewed before propagation                       |
| 2   | Content / Dialogue Agent | All player-facing text                                                             | prose       | Tell-pre-pass, then a human reviews flagged / echo / retrospective lines |
| 3   | Consistency Verifier     | Consistency vs. finite canon invariants; flags only                                | canon-check | Always gated: no flagged content commits unreviewed                      |
| 4   | Audio-Tag Agent          | Audio-tag contract (GameplayTags + tag-to-asset library)                           | schema      | Soft: library delta auto-commits on no objection                         |
| 5   | QA / Playtest Agent      | Traversal & functionality; flags only                                              | QA          | Hard on soft-lock / unreachable-win; soft otherwise                      |

---

## 12. The Narrative Content Pipeline

The pipeline is **build-time only**. We run the crew (11) during development to generate the game's content, and the shipped game plays it back from a static library. **A run makes zero model calls.** This is the shippable-to-anyone mode: fully offline, fully QA-able, needing no server, key, or network.

The mechanism that realizes "call down, signal up" is a shared **session-state artifact** (the bus): every agent reads it at start and writes its finished output back, and the orchestrator reads the bus to decide what runs next. The pipeline stages are `schema → greybox → prose → canon_check`, gated at each worker's output. Two per-arc artifacts live on the bus and are handed to every worker: the **arc doc** (the steering layer) and the **NPC codex** (the canonical soul registry the Verifier checks against).

The shipped game's memory is ordinary game code. A persistence engine remembers your incarnations, tracks the met-to-claimed bond level per soul (one hidden count, accreted from weighted interactions across four action-categories, trust · intimacy · recognition · respect, with per-soul card-trait coefficients; never split into stored per-category sub-scores, and never shown), gates the calendar, applies role and relationship repermutation at run boundaries, and surfaces the soft in-world reminders. Runtime LLM calls, cloud-token usage, and AI cost are all zero. The dev-crew's only obligation toward it is to author the schema the runtime reads.

---

## 13. Build-Time Agent Plan

Which agent builds each component, and when, aligned to the milestone calendar (18).

| Component                                   | Build agent(s)                      | Human role                                            |
| ------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| Orchestration + session-state bus           | Orchestrator (0)                    | Frames scope, reads surfaced gates                    |
| Persona cards + echo map                    | Narrative Architect (1)             | Hard gate: reviews cards + echo map                   |
| Player-facing text (dialogue, lore, echoes) | Content / Dialogue Agent (2)        | Reviews flagged / echo / retrospective lines          |
| Consistency check vs. canon                 | Consistency Verifier (3)            | Signs off every flag                                  |
| Audio + asset tags (GameplayTags → Wwise)   | Audio-Tag Agent (4)                 | Soft gate: library delta auto-commits on no objection |
| Level / gate layout → scene graph           | Human → QA Agent (5)                | Human authors layout; QA validates traversal          |
| Traversal / reachability QA                 | QA / Playtest Agent (5)             | Triages flags; human playtest is the fun signal       |
| **Track A: narrative proof (ink/html)**     | Content pipeline + engineering      | Line review gates content                             |
| **Track B: visual/asset build (Unreal)**    | Engineering + style discipline (10) | Assets approved independent of review                 |

Two tracks run in parallel on purpose (15): the line-review on Track A never bottlenecks Track B's visual asset build.

---

## 14. Token Budget

The content-budget formula sizes the content component (Agent 2's output volume):

```
interaction-beats = souls-present × years × days × beats/day
                  + echo-strands × bond-deepening candidates
                  + descriptor-reaction lines × NPCs
                  + spells + items + locations
```

The locked inputs are real: 8 souls (3 deep + 5 texture), availability deals 1 to 2 "past" per run (about 6 present); candidate cap 3; years 3; locations 2 (+1 stretch); days per run 5; screen-moves per day 3 to 5; canned paths 2; slice spells 10; seed items about 3 per category (about 15). A first-pass estimate falls out (about 130 social beats + 2 echo-strands + about 30 essence-reaction templates across 2 paths, heavy template overlap pulling the real number well below 2×).

From content-beats to whole-crew tokens:

```
dev-tokens ≈ interaction-beats × tokens/beat × crew-overhead
```

Only Agent 2 (Content) is output-heavy; the rest are overhead or input-heavy-but-cache-mitigated. The crew-overhead factor (about 1.5 to 2×) is what agents 0/1/3/4/5 add on the content baseline.

| Agent                      | Runs when                           | Token shape                                    | Load                       |
| -------------------------- | ----------------------------------- | ---------------------------------------------- | -------------------------- |
| **0 Orchestrator**         | every stage + after each worker     | small routing I/O; reads the summarized bus    | overhead, many small calls |
| **1 Narrative Architect**  | once per schema stage               | a few large structured outputs                 | one-time, moderate         |
| **2 Content / Dialogue**   | about 200 to 300 calls              | small output (≤40–60w), cacheable input        | the baseline (dominant)    |
| **3 Consistency Verifier** | after every content batch           | input-heavy re-read of canon; flag-only output | moderate, cache-mitigated  |
| **4 Audio-Tag**            | per new-entity batch                | small string-gen + collision lookup            | low                        |
| **5 QA / Playtest**        | per scene-graph assembly + pre-ship | input-heavy graph read; flag-only output       | moderate, few calls        |

The load-bearing assumption is that prompt caching collapses the two input-heavy agents' canon and graph re-reads to about 0.1× (a stable prefix). Projections (first-pass, blended about $10 to $12 per Mtok across a mid tier and a Haiku-class tier, build-time only; runtime is $0):

| Scenario     | Assumptions                                                                     | Dev tokens (one-time) | Cost (est.) |
| ------------ | ------------------------------------------------------------------------------- | --------------------- | ----------- |
| **Lean**     | 1 generation pass · tight caching · verify/QA on Haiku                          | about 2M              | about $20   |
| **Expected** | 1 pass + targeted revise loops · about 1.5 to 2× crew-overhead · normal caching | about 3.5M            | about $40   |
| **Heavy**    | weak caching · mid-tier verify · one extra full-crew revise pass                | about 5M              | about $60   |

Each additional full-crew revise pass adds about $20 to $40. All three are one-time dev costs: runtime stays $0. The binding cost is not dollars but human review time (about one week), because every shipped line is personally approved (about 200 to 300 items); this, not tokens, governs the capstone deadline.

---

# Part IV: Technical Strategy & Scope

## 15. Technical Overview

**Full vertical slice.** Unreal (UE5), the Point-and-Click toolkit (Fab marketplace), Wwise audio middleware, 3D static-camera scenes.

**This-week proof-of-concept.** ink + html: the fastest way to prove the narrative pipeline in a browser. Ink is not throwaway; it is the production narrative engine, carried into Unreal via ink-to-UE integration (inkcpp / Inkpot). The ink content graph built this week is the same graph the slice ships on.

**Two build tracks (so review never blocks assets).**

- **Track A: narrative pipeline proof (ink/html), this week.** Proves the seed-to-payoff-to-recognition loop and the content pipeline (12). Gated by line review.
- **Track B: visual/asset build (Unreal).** Environments, static-camera scenes, audio tags. Runs independently, so review time never stalls visual work.

**The slice contract: polish the run, prove the loop.** Fun lives in the run; everything past it is demonstration.

1. **One run is complete**, up to the festival. This is where the polish budget goes.
2. **The short cycle is the wow: one full run then a reshuffle plays end to end.** The memory payoff lands inside the slice, demonstrated for real, not scripted.
3. **The story pipeline holds for a few runs:** year-over-year neighbor memory, backstory fill between years, echo accumulation across festivals.
4. **NPCs have different-role content:** the reshuffle is demonstrable, not promised (the on-camera "she was the chef, now she's the blacksmith" moment comes free).
5. **1 to 2 authored endings ship.** Endings are points on the belonging-spectrum (bond depth · community · diffuse · solitary-release); no prescribed "true" win.

---

## 16. Project Conventions

One idea runs the whole game: a single, department-agnostic tag names each gameplay event, and a lookup table turns that tag into sound, text, and art at once. A strict file-system hierarchy and folder map provide self-documenting asset connections and help an LLM derive where assets live.

```
<Entity>.<Interaction>[.<Phase>]   →   Wwise event · dialogue key · animation/VFX   (per department, via the tag-to-asset library)
```

- **Naming rule:** tags are hierarchical, department-agnostic (no `Audio.` / `Text.` / `Art.` prefix), and extensible: new content adds new tags, never a new scheme or an enum edit.
- **Resolution rule:** every department reads the *same* tag through its own resolver column in the library. Adding a department means adding a column.
- **CI note:** a validation pass (WAAPI-backed) flags orphan tags (a tag with no mapping) and missing mappings, the same collision and orphan check the Audio-Tag Agent runs, promoted to a build check so the library cannot silently drift.

---

## 17. Audio & Asset Implementation

Sounds are collectible objects that travel free like knowledge: you can show one to a neighbor (the leitmotif probe), gift a recorded melody as a declaration, or use one as a spell component. You record deliberately, never knowing which sound will matter, and its significance lands later. The deepest bond's leitmotif surfaces from the festival mix as you gather enough of a soul, so you can recognize someone by their sound before you can name them.

Triggers are department-agnostic Unreal GameplayTags, resolved to Wwise events through a data-driven tag-to-asset library.

- **One tag is a game-wide gameplay-event key, with no department prefix.** Each event is a hierarchical, extensible GameplayTag: `<Entity>.<Interaction>[.<Phase>]`, for example `NPC.Chef.Show.React` and `NPC.Chef.Ask.React`. One tag names one event, game-wide. The hierarchy grows by adding tags as content grows: no fixed enum, no schema change.
- **A tag-to-asset library resolves each tag per department.** The same tag maps to a Wwise event (audio), a dialogue line or key (text), and an animation or VFX asset (art): one tag, N department resolutions, so a single gameplay event drives sound and text and art together. The library (an Unreal DataAsset / DataTable) is the single source of truth, unaffected by assets being moved or renamed.
- **Direct event targeting.** Gameplay fires the event by tag lookup; each department reads its own resolution. Wwise Switches, States, and RTPCs are reserved for genuine runtime variation only (material-based footsteps, intensity or time-of-day ramps).

The Show and Ask interactions carry distinct interaction names because an NPC reacting to a shown sound resolves to different audio and dialogue than a spoken probe.

**Middleware is Wwise** (locked): familiar, scriptable, and WAAPI is the natural home for library tooling and validation.

**Ownership.** The tag namespace is shared and game-wide. The Audio-Tag Agent (11) owns the audio resolution: it proposes compliant tags and maps and verifies each tag's Wwise-event entry, flagging collisions and orphan or missing audio mappings. It generates no audio and assigns no style or emotion. Text and art resolutions are owned by their own department passes, keyed off the same tags.

---

## 18. Milestones

Anchored to the course assignment dates. Each milestone carries what must be spec'd before it closes and who or what verifies it.

| Date         | Milestone / deliverable                                                                 | Blocking sub-rows                                                               | Verified by                                       |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| Tue 7/14     | **GDD first draft** (Assignment #1)                                                     | Concept + pillars locked                                                        | Submitted                                         |
| Thu 7/16     | **Final GDD draft** (Assignment #2)                                                     | Hole-filling substantially closed                                               | Phase-3 decisions                                 |
| **Tue 7/21** | **Agent crew** (Assignment #3: 3+ agents, shared output, dev artifact)                  | Dev-crew roster + JSON I/O (11); session-state bus field schema                 | This GDD, then the review panel                   |
| Thu 7/23     | **Dynamic content pipeline** (Assignment #4: RAG, 3+ content types, consistency checks) | Content Agent + Consistency Verifier contracts (11); voice register + tone enum | QA / Consistency agents + review of sample output |
| Tue 8/4      | **GER pipeline** (Assignment #6)                                                        | Level layout → gate/verb table; content-budget inputs                           | QA Agent traversal pass on the generated layout   |
| Thu 8/6      | **Style-guide agent** (Assignment #7)                                                   | Color grammar + silhouette vocabulary as machine-checkable rules                | Style agent + single review eye                   |
| Tue 8/18     | **Complete AI dev pipeline** (Assignment #10)                                           | Token budget calibrated (14); end-to-end prompt-to-engine documented            | Cost analysis against real generation             |
| **Tue 8/25** | **Capstone: final playable game**                                                       | Slice contract (15) met; 1 to 2 endings shipped                                 | Human playtest (primary) + QA Agent pre-ship pass |

---

## 19. Risks & Scope

**Top risks (with fallback).**

- **NPC perceptual distinctness (the differentiator's soft spot).** Whether the essence-signature card pipeline yields perceptibly distinct neighbors needs real writing samples against the voice guide; the structure guards homogenization but cannot prove it on paper. *Validate:* generate the 3 deep souls' key lines and read them side by side. *Fallback:* hand-author the 3 deep souls; agents handle texture NPCs only.
- **The reshuffle / persistence engine coherence.** The on-camera role-swap must read as the same soul in a new role. *Validate:* the ink prototype demonstrates one reshuffle end to end. *Fallback:* hand-script the single on-camera swap for the slice; generalize later.
- **Ink-to-Unreal integration.** The narrative engine must carry from ink into UE. *Validate:* an early integration spike. *Fallback:* ship the slice as the ink/html build if UE integration slips.
- **Human-review bottleneck (about one week of review time).** *Fallback:* cut to a 1-year run + 1 ending to shrink the approved-line count.

**Planned scoping cuts.** Ordered by what goes first if time runs short; the top of the list is cut before the bottom.

1. **Year 2 and Year 3.** Cut the run from three years to one. The single biggest lever on the review line count.
2. **The Farm (third location).** A reserved slot; adds without reworking Town or Forest, so it drops cleanly.
3. **The second ending.** Ship 1 authored ending instead of 2.
4. **Screens beyond the 3 start screens per location.** Progressive-unlock screens trim to the start trio if needed.