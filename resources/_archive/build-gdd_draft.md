# Codename: rebirth Build GDD (draft)

> **What this is.** The expansive, dev-crew handoff version of the Game Design Document: the one the agent pipeline and any collaborator builds from. Its companion is the Pitch GDD (1–3 pages, the graded turn-in); this doc is the same 12-section spine written at build altitude, with the narrative woven in. It answers, for every section, *what an agent or a builder does next*, or it names an open question precisely and sends it to §12. Nothing here is meant to sell; it's meant to be built.
>
> **Blueprint:** `../knowledge-base/synthesis/gdd-structure-model.md` (the three-doc model: §4 section map, §7 Van Buren guardrail, §8 assembly order). **Source of truth for decisions:** `phase-3-decisions_draft.md` (all 18 holes; where it and the knowledge base disagree, Phase 3 wins). **Prose voice:** `../prose-voice-rules.md` (all document prose: show don't tell, specificity, no em-dashes). **Assembled:** 2026-07-19 (game-26), from the settled Phase-3 decisions.

**Writing rules** (carried from the template)
- Present tense, no waffling: "the game does," not "the game might."
- Real numbers, or a named open question. Never a vague quantity, never a number we haven't prototyped. An un-prototyped number is a §12 open question, not a guess (the Van Buren guardrail; see §7 of the blueprint).
- Experience-forward, value-backed: state the felt experience first ("the lantern catches, the corner of the square warms"), then footnote the parameter. The number serves the feeling; it never leads.
- Don't document what isn't decided. Park it in §12 and prototype it.
- Living doc. Git history is the changelog.

**A note on vocabulary.** The emergent quantity a player builds with a soul is a **bond level**, tracked per soul. The **deepest bond** (what earlier drafts called the "partner") is an *emergent possibility*, never a prescribed romantic goal and never a "winning" worldview. Pairing is one belonging-stance among several: the deepest bond is **one possible ending among several** (community, diffuse, solitary/release), and the old *search-for-a-lost-partner* framing is **retired** (2026-07-20). Wherever an older note says "emergent partner" or "solidify a bond," read *bond level*.

---

## 1. Elevator Pitch

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Myst*, *Outer Wilds*, *Frieren*, and *Studio Ghibli* where you **explore, collect, discover**.

The game explores the question: What does it mean to belong? And does connection span lifetimes?

You are a mage in a Ghibli-warm magical world who has just arrived in a new  town. You spend your days foraging, crafting, learning folk magic, and getting to know your neighbors.  You arrive in town the week before the festival of souls.  By discovering magic spells, items, and learning about people you contribute to the success of the festival.  After the festival time skips forward to the next year and you see the outcome of your decisions.  For the vertical slice, a cycle consists of three years.  At the end of three years a retrospective of your time in the town is presented.  On a return to the game, you arrive but find that all the npcs have shuffled, for example: the npc who was the blacksmith may now be the postman, a friend may now be a brother.  Each run is another life, another timeline, but the essence and personality of the npcs stays the same.  As you spend more time with people your bond grows across lifetimes and you learn more about the underlying truth of the world.

**Who it's for.** Players who enjoy cozy exploration and collection completionists. Players who enjoy character driven narrative exploring emotional themes.

> **Dev-crew note.** The whole design engine is *retrospective significance*: the plain detail that only detonates once something is later true. So there's one question every proposed feature has to answer yes to, or it goes to the Parking-Lot: **does this help a player feel that a moment mattered more than they knew at the time?** Cozy verbs, magic, the festival, the notebook. They all earn their place by pre-loading weight that a later payoff collects. A feature that's merely fun but carries no weight forward is scope we don't have.

---

## 2. Design Pillars (+ Non-Goals)

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

**Non-Goals: the scope insurance.** What the game deliberately won't be:

- **No multiplayer or co-op.** The slice is solo-first. If a mechanic *needs* a second player, cut it.
- **No tactical / FFT-style combat.** Strategy lives in route, deduction, recognition, and curation-under-consequence, not a battle grid. (Parked, not deleted.)
- **No live-service / always-online systems.** The shipped game runs fully offline; live mode is optional and player-supplied.
- **No hard-lose / game-over.** You always leave with something. A wrong action teaches; it never punishes.
- **No red-herring content population.** "Don't make clues trivially obvious" is fine; budgeting a decoy-artifact layer is asset spend we don't have.

> **Dev-crew note.** The pillar table's second column is the refusal contract: the thing an agent or builder must never do. The Non-Goals are enforced as agent refusals: no two-player-required puzzle, no server-dependency-during-play feature, no fail-state screen, no filler-to-hide-the-real.

---

## 3. Inspirations

> **Dev-crew note.**  One line each, plus the *spec-borrow*: the precise structural move we take, not the vibe.

| Game / work | What we take (the line) | The spec-borrow (the exact move) |
| --- | --- | --- |
| **Outer Wilds** | Knowledge is the progression; discovery is the reward | Knowledge travels free and never expires: the ship-log / rumor-graph that auto-links learned connections and marks "more to learn here" without spoiling *what*. Our notebook is this graph. |
| **Return of the Obra Dinn** | Deduction you *prove*, not guess | Assert-then-confirm as a *compound* claim (identity × facet × role), evidence-gated so the small soul-list can't be scanned; correct answers lock in small batches with confirmation withheld, so a lone guess can't be binary-searched or cycled. Our recognition gate is this, aimed at souls-across-lives. |
| **Myst (and its remakes)** | The living-diorama, the information-key | Static-camera scenes; the key is *information*, not an item; puzzle-randomization as precedent for a roguelike-ified structure. The five-field puzzle template (Problem / Circumstance / Clues / Solution / **The Idea**). |
| **Frieren: Beyond Journey's End** | Significance that arrives after the moment is gone | The flat-register voice contract: the words stay plain and preloaded; the swell is visual or in the silence, never a verbal one. Collectible folk magic. |
| **A Storied Life: Tabitha** | Objects are mundane until you learn what they witnessed | Curation-as-authorship: what you keep writes the memory that remains. Our mementos are the low, unflagged echo-carriers. |
| **Spiritfarer / Animal Crossing / Stardew Valley** | Cozy rhythm; social-forward, softly-limited days | The neighborly moment-to-moment (talk, gift, tend); the day soft-limited by the *world* (shops close, light fades), never an energy bar. |
| **Majora's Mask** | A recurring deadline that everybody remembers | The festival week as the run boundary: urgency plus melancholy, no fail state; here inverted so *everyone remembers* prior years. |

---

## 4. Core Loop & Mechanic

**Moment-to-Moment loop**. You're on a screen (the square, the clearing) and you act through **four action families**.:

- **Collect.** Pick up anything collectible: components, made things, mementos, spell-phrases (knowledge), and *sounds* (audio-objects). Listening is Collect applied to sound.
- **Make.** Combine components plus learned knowledge into an output: a spell, a dish, a craft, a piece of art. One structure for all three.
- **Use.** Apply a held thing (a spell or an item) to a target: ignite a lantern, still the water, offer a scritch to a cat. Present an item or a sound to a neighbor.
- **Converse.** Talk to an npc.

On game start you get an intro screen and select a persona, for vertical slice you have the choice of mage. You will randomly start in the town or forest. At each location there is a day budget of **3–5 screen-moves**: Each screen hosts solo interactions (foraging, casting: procedural, near-zero authoring) and social interactions with any npcs present.

You carry a satchel and a notebook.  The notebook can be referenced at any time and contains knowledge that you have collected. At the end of a day you can only carry from the screen the amount of items that fit into your satchel and you return home.  You can also end a day early to bank a full pack and what you can carry in your arms (pack-triage). Your home is a hub that you can decorate with items that you collect and you can choose items from your home to bring with you but they take up room in your satchel. When you are ready to move on you open the calendar and pick a location to travel to for the next day.

**Run loop.** A run is the same festival week across three successive years.  After each week time jumps forward a year, with backstory filling in between years and neighbors remembering what you did last year. The week builds toward the festival night with the outcome depending on choices that you make during the week..

**Ending A Run.** After the final festival night an ending vignette based on the player's decisions plays.

**A new beginning?**  Each new run reshuffles the npcs.  NPCs will have fixed personalities but in exploring the idea of past-lives and multiple lives/timelines, each npc's role in the town is random.  Over time the player can choose to keep notes on the NPCs similar to Return of the Obra Dinn.  Across runs (or lives), the bond level you build with a soul persists, leading to different outcomes.

### 4.2 Receiver-determined outcomes (the pillar-grade rule)

The target of any directed interaction holds the response logic. **The action verb encodes only *what was done*, never *what happened*.** Ex: Ignite-on-sticks catches; ignite-on-a-person does nothing. Spells produce **physical outcomes only**: they never set a mood or dictate a behavior; any emotional response (a cat purring at a scritch) is the receiver's *own* reaction to the physical effect.

magic system?

### 4.3 Win / loss = soft terminal states

There is **no hard-lose and no game-over.** A run always ends *with something*: the ending vignette is guaranteed. A life ends on an *ending*, and success is measured as **depth of connection reached** (which ending you land), never survival. The game cannot be lost, only lived. The slice ships **1–2 fully authored endings**.

> Dev-crew note. 4.4 Gate archetypes (referenced, not inlined)
> Gates are performed, never flag-blocked. The slice features four of the six archetypes the puzzle grammar defines. The full per-gate specs live in the level layout (`level-layout_draft.md`) and the puzzle grammar synthesis, referenced here so this section doesn't over-specify (guardrail against long linear chains and doc-bloat):
> **Garrison-preview.** The gate names its own key-type up front ("they'll open when they trust you"). Turns a dead-end into a world-issued live lead.
> **Laki travelling-knowledge.** Learn here, apply there. A cipher learned at one shrine reads the other; bidirectional, and *not a lock*: knowledge in the player's head, which the game notices but never blocks.
> **Deduction-loop recognition.** Find → think → **prove**: a *compound* Obra-Dinn assertion (Soul × essence-facet × role), evidence-gated (Heaven's Vault: it surfaces only once you hold the essence-evidence) and batch-locked with confirmation withheld, at the festival reshuffle doorway. The emotional core, made a mechanic: a *performed* gate, not a menu pick.
> **Kadish time-of-day.** The key is knowing *when* to look (the marks need moonlight); an authored state, never a timing/dexterity test.
> **Dev-crew note.** The receiver-outcome interaction (§4.2) is authored as a matrix: `verb(family) × target(type) → precondition → scene-state change → why-specific feedback`. The agent I/O for it lives in §5. Full per-gate specs live in `level-layout_draft.md` and the puzzle-grammar synthesis, not here. Co-design flag: the recognition/proof gate opens only if an action family can express the demonstrating move, so the four families' sub-verbs must be designed *with* the recognition gate, never after. The sub-verb list is a §12 open item, pending the verb-table pass.

---

## 5. Agentic AI Showcase

> **Dev-crew note.** AI shows up in two clearly separated places. **At runtime, while you play, there is no AI at all**: the game's memory of your past lives is ordinary save-state and rules, so a run makes zero model calls, needs no server or key, and runs fully offline. **During development, a small crew of AI agents** generates and quality-checks the content (story structure, dialogue, consistency, audio tags, and playtest coverage) but **a human approves every line before it ships.** AI accelerates the build; it never decides, and it never runs the shipped game.

> **Dev-crew note.** §5.0, §5a, and §5b below are the build architecture: the two content modes, the runtime persistence engine, and the five-agent dev crew with JSON I/O. This is the Assignment-#3 deliverable.
> 
> 5.0 The two-mode architecture (the frame)
> 
> The game runs in two locked content modes, and the difference is only *where the content came from*, never *what the game does at runtime*:
> 
> **Canned mode.** Content is pre-generated during development and played back from a static library. **A run makes zero model calls.** This is the shippable-to-anyone mode, fully offline, fully QA-able. It's also the mode the dev-crew itself runs in to *build* those paths.
> **Live mode (optional, player-BYOK).** A player who supplies their own API key can have the dev-crew pipeline **re-run between runs (at boot or at run-end), never during a run**, to generate fresh narrative. The deepest-bond "wow" beat is one of that pipeline's outputs, not a separate one-off call. Output is played back canned, so *a run still makes zero model calls* even in live mode. Latency, cost, and API availability are therefore never a during-play dependency.
> 
> Mode is a single declared flag on the orchestrator's input; it shifts the gate behavior of the whole crew at once.
> 
> 5a. Runtime narrative system: deterministic mechanics, not an agent
> 
> The shipped game's memory is **ordinary game code, not a model call.** The persistence engine remembers your incarnations, tracks the met→claimed **bond level** per soul, gates the calendar, applies role and relationship **repermutation** at life boundaries, and surfaces the soft in-world reminders. All of it is save-state and rules: no LLM at play time, in either mode. This is the central de-risk: the game that ships never needs a server, a key, or a network. *(The dev-crew's only obligation toward this system is to author the session-state / persistence **schema** the runtime reads; that schema's field format is a §12 open item.)*
> 
> 5b. The dev-crew: five workers + an orchestrator
> 
> The crew obeys three rules: **one agent per feature, and each seat needs a clear why** (five workers plus an orchestrator is class-scope guidance, not a hard cap); **call down, signal up** (the orchestrator hands each agent a prepared input and collects a typed output; workers never call each other, which keeps every agent testable in isolation); and **the human gate lives at the output, never mid-chain** (Roc reviews and approves; a broken output is never silently swallowed: the cozy-rhythm rule applied to the pipeline). The mechanism that realizes "call down, signal up" is a shared **session-state artifact** (the bus): every agent reads it at start and writes its finished output back, and the orchestrator reads the bus to decide what runs next.
> 
> Every agent below passed a realistic-capability check: each does bounded structured output, classification, or string-pattern work; nothing rests on open-ended generation. Schemas are given at GDD altitude (the field-level implementation schema is the crew's own Phase-3 build task, deliberately not over-specified here).

**Agent 0: Orchestrator (the manager).** Owns sequencing and gate-keeping, not vision, not content. Frames scope, reads the bus, decides which stage runs next, hands each worker its input bundle, collects the typed output, and surfaces the human-gate checkpoints. Resolves conflicts when two outputs disagree.
- *In:* `{ session_goal, mode: "canned|live", pipeline_stage: "schema|greybox|prose|canon_check", agents_to_call:[…], session_state_ref, human_gate_required }`
- *Out:* `{ session_id, dispatch_queue:[{ agent_id, input_bundle, gate_before_write }], session_state_update, surfaced_gates:[…] }`
- *When:* always first, and again after each worker completes. *Gate:* routes freely in canned mode (unattended); surfaces each routing decision for approval in live mode. *Capability:* PASS: routing and dispatch, no creative content.

**Agent 1: Narrative Architect (schema stage).** Owns story architecture: the structural layer that tells every downstream agent *what* the narrative commits to, without writing a player-facing line. Three folded sub-functions kept deliberately as one feature: the **seed-and-payoff / echo map** (which past-life detail seeds which future payoff, and the condition the player must have deduced first), the **persona-card schema** (fills each Roc-supplied NPC seed into an essence-signature card, the anti-homogenization structure), and the **delta rule + canon flags** (the one-sentence "each scene adds new information" rule, plus the locked invariants downstream agents must not break). It does not write dialogue, does not check consistency, and *cannot invent NPCs*: the roster is a required input field.
- *In:* `{ slice_npcs:[{ npc_id, essence_hints:[…Roc seed…], suit_tag }], scene_list:[…], locked_decisions:{ knowledge_travels, superposition_rule, soft_reminder }, voice_guide_ref }`
- *Out:* `{ persona_cards:[{ npc_id, trait_axes:[{axis,value}], essence_descriptor, suit_tag, authored_exceptions:[…] }], echo_templates:[{ npc_id, seed_scene, seed_event(≤25w), payoff_scene, payoff_condition }], delta_rule, canon_flags:[…] }`
- *When:* schema stage, once per run, always before any Content call. *Gate:* hard: Roc reviews cards + echo map before they propagate (an error here reaches every interaction). *Capability:* PASS: bounded structured output from a supplied roster; trait orthogonality is enforced by the schema shape.

**Agent 2: Content / Dialogue Agent (prose stage).** Owns all player-facing text (NPC lines, lore, environmental text, object descriptions, echo fragments) inside the voice register. Takes a persona card + an echo template + scene context and emits finished content, **one slot per call**. Makes no structural decisions and does not assign its own tones (the tone enum is fixed, not generated). This is the class's canonical worked example, and it's also the *same* `speaker_id / tone / text` shape the engine reads at runtime, with no translation layer, which is why live mode reuses this agent rather than spawning a new one.
- *In:* `{ npc_id, persona_card, echo_template:{ seed_event, payoff_condition }, scene_context:{ scene_id, time_of_day, world_state_excerpt }, tone_enum:["quiet","wistful","matter_of_fact","warm","distant"], voice_register:"flat|warmth-swell|retrospective", max_words:40, voice_guide_ref }`
- *Out:* `{ content_lines:[{ content_id, speaker_id, tone, text(≤40w dialogue / ≤60 description), scene_id, echo_flag, canon_flag }], human_review_required }`
- *When:* prose stage, after the scaffold locks and cards are approved; per slot, one call one block. Canned primarily; live (player-BYOK) for the deepest-bond beat, generated between runs. *Gate:* an automated AI-tell / voice-drift pre-pass flags markers, then Roc reviews only flagged, echo, or retrospective lines; clean lines advance. *Capability:* PASS: short, tonally-constrained prose from a bounded template; the 40-word ceiling and fixed tone enum guard the "going long" and drift failure modes.

**Agent 3: Consistency Verifier (canon-check satellite).** Owns consistency: reads each new content batch and checks it against a **finite, concrete invariant set** plus the voice register, before anything commits. It **flags only**: never generates, rewrites, or auto-repairs. The check-set is the game's own locked rules, which is what makes it reliable rather than an open-ended "quality" judge: superposition rule, role-boundary law, essence-vs-role discipline, informational-feedback law, knowledge-travels (C1), and voice register.
- *In:* `{ new_lines:[{ content_id, speaker_id, tone, text, scene_id }], active_canon:{ persona_cards, echo_templates, bond_levels, locked_roles }, session_state_ref, invariant_set:[…6…] }`
- *Out:* `{ verification_report:[{ content_id, scene_id, status:"PASS|FLAG", flag_type, flag_reason(≤30w) }], human_action_required, summary }`
- *When:* after every Content batch, before commit, and at the session-boundary snapshot. Async in canned mode; synchronous before commit in live mode. *Gate:* always human-gated: no flagged content commits without sign-off; PASS routes silently. *Capability:* PASS, with one architectural dependency: the orchestrator must summarize the bus every N committed lines so the Verifier's context stays bounded (long-context recall degrades otherwise).

**Agent 4: Audio-Tag Agent (the audio-first USP contract).** Owns the audio-tag contract that makes §8 work. Takes new entities plus the current tag→asset library and produces a compliant **Unreal GameplayTag** per required audio trigger, mapped to a **Wwise event** in the library, checking each proposed tag for collisions and orphan/missing mappings. Generates no audio and assigns no style or emotion: it names and verifies format only. (Full contract in §8; the naming convention in §9.)
- *In:* `{ new_entities:[{ entity_id, entity_type:"npc|object|scene|spell" }], required_interactions:[…from the four families; sub-verbs slot in from the verb-table pass…], existing_tag_library }`
- *Out:* `{ new_tags:[{ entity_id, gameplay_tag:"NPC.Chef.ShowAsk.React", wwise_event, collision_flag, orphan_flag }], library_delta, violations:[…] }`
- *When:* schema/pre-production, whenever new entities enter the slice. Canned only. *Gate:* soft: the library delta is reviewed and auto-commits on no objection. *Capability:* PASS: string generation against a fixed pattern, collision detection is a lookup, compliance is classification. *Dependency:* it can only emit tags once the four-family sub-verb list is specced (a §12 open item).

**Agent 5: QA / Playtest Agent (traversal & functionality).** Owns structural QA: verifies the assembled slice is **traversable and works as specced** before ship. Enumerates choice permutations, checks every branch/state is reachable and leads somewhere valid (no soft-locks, no dead-ends, no orphaned content), confirms win-states are reachable by an intended path, and confirms each interaction produces its specified effect *and* its wrong-action teach. Flags only. Distinct from Agent 3: the Verifier checks *is it consistent?*; QA checks *does it work and can you get through?*
- *In:* `{ scene_graph, gates:[{ gate_id, key_type, unlocks:[…] }], win_lose_conditions, interaction_specs:[{ interaction_id, expected_effect, wrong_action_teach }], archetypes:["discovery","emotional","puzzle"] }`
- *Out:* `{ reachability:[{ node_id, reachable, via:[…] }], flags:[{ flag_type:"soft_lock|dead_end|unreachable_content|unreachable_win|broken_interaction|missing_wrong_action_teach", location, detail(≤30w), severity }], archetype_notes:[…], human_action_required }`
- *When:* after a batch assembles into a playable scene graph, and again pre-ship. *Gate:* hard on any soft-lock or unreachable-win (a slice you can't finish can't ship); soft otherwise. *Capability:* PASS: graph reachability and rule-checking over a bounded scene graph are deterministic. It validates traversability, never *fun*; human playtest stays the experiential signal, and it needs the machine-readable scene graph to exist first (a Phase-3 artifact).

> **What is deliberately *not* a standing agent.** The runtime persistence system is mechanics, not an agent (§5a). The document-level scope-guard / Van-Buren pillar check is an *on-demand orchestrator pass* (the Verifier run in stress-test mode), not a staffed seat. Two expansion candidates are named but unstaffed until the build surfaces the need: a **Project-Manager / task-board agent** (decomposes this doc into a tracked build plan) and an **Audio Implementer** (consumes the tag manifest, wires each tag to a real asset, inventories what's missing), each would need a clear, distinct why and a passing capability check, never a guess that "an agent could help."

**Roster + human-gate summary**

| # | Agent | Feature owned (one) | Stage | Human gate |
| --- | --- | --- | --- | --- |
| 0 | Orchestrator | Sequencing · session-state bus · gate-surfacing | all | Routes freely (canned) / approves each call (live) |
| 1 | Narrative Architect | Story structure: echo map + persona-card schema + delta rule | schema | Hard: cards + echo map reviewed before propagation |
| 2 | Content / Dialogue Agent | All player-facing text | prose | Tell-pre-pass → Roc reviews flagged / echo / retrospective lines |
| 3 | Consistency Verifier | Consistency vs. finite canon invariants; flags only | canon-check | Always gated: no flagged content commits unreviewed |
| 4 | Audio-Tag Agent | Audio-tag contract (GameplayTags + tag→asset library) | schema | Soft: library delta auto-commits on no objection |
| 5 | QA / Playtest Agent | Traversal & functionality; flags only | QA | Hard on soft-lock / unreachable-win; soft otherwise |

---

## 6. World & Progression
> 
> 6.1 The world, in myth-form
> 
> It began with a turning. The same handful of souls, bound to one town and one festival, die and are dealt a new hand: kin one life, strangers the next, married to other people and missing each other by a season. The world remembers the turning even after they forget it: the festival returns each year, the town rebuilds itself around them, and they keep orbiting one another in new arrangements. Nobody in the town knows this. They live, they belong or fail to, they die, and the wheel deals again. You are one of them, awake enough to notice the pattern and free to decide what, this time, you belong to.
> 
> **Dev-crew note.** The specific place, the central 15-second memory vignette, and how it seeds across the three festival-years are **H9 baseline-narrative content, deferred to game-35** and tracked in §12.
> 
> 6.2 Persistence spectrum: what survives what
> 
| > Thing | > Survives a run? | > Survives a life / wipe? | > Where it lives |
| --- | --- | --- | --- |
| > **Knowledge** (spell-phrases, ciphers, deductions) | > Yes: travels free, no pack cost | > Yes: the one save that survives is the player's own head | > The notebook / rumor-graph |
| > **Sounds** (audio-objects) | > Yes: travel free like knowledge | > Yes | > Log entries; playable on view |
| > **Physical items** (components, made things, mementos, tools) | > Only what fits the pack (pack-triage) | > No: reset each life | > The pack; hub decoration |
| > **Bond level** (met → claimed, per soul) | > Yes | > Yes: carries a mark across lives; **derived over time, never automatic** | > The persistence engine (§5a) |
| > **Roles / relationships** | > Fixed within a life | > Re-dealt (repermuted) at every life boundary | > The persistence engine |
| > **Hub state** (mementos you arrange) | > Yes | > Shared across timelines | > The hub, outside the cycle |
> 
> **Dev-crew note.** Because bond level and knowledge persist but roles repermute, the Consistency Verifier's role-boundary and essence-vs-role invariants (§5b) keep a re-dealt world coherent: a soul's essence-descriptors carry across the shuffle, its role does not.
> 
> 6.3 The superposition rule (the metaphysics, never surfaced)
> 
> **Dev-crew note.** The metaphysics below is never surfaced to the player.
> 
> Two data regimes, and the game phase-changes between them:
> **Essence is fact.** A soul's descriptors and signature are confirmable truth: you assert, the game confirms at a match threshold, wrong guesses are revisable and teach. This is the deduction you can *win*.
> **The deepest bond is emergent**: constituted, not deduced, and it is **one possible ending among several** (community, diffuse, solitary/release), never a prescribed target. A per-soul bond score accretes from time spent, helps given, and festival choices (met → claimed). There is no prior fact before it collapses, and that is coherent because the retrospective-significance *floor* lives on the essence side above (a real, deducible fact), not here. The bond is what you *build*, not who you were supposed to find; once it solidifies it is fixed until a save-wipe. **Never surfaced**: the philosophy backend (Daoist reincarnation, breaking the cycle into release) stays entirely under the cozy life-sim.
> 
> The wipe returns the world to superposition: letting go releases the bond back into possibility. *(Whether the wipe/release is the game's terminal ending is the letting-go question, parked; see §12.)*
> 
> 6.4 The nested clocks
> 
> Day (soft-limited by the world) → **week = the run** (the festival) → **life = \~3 festival-years** (reaches an ending) → **cycle = the incarnation** (repermutation) → **timelines = save slots** (a locked cap of 3, each a parallel life; the hub is shared). Route choice is *attention allocation*: you can't be everywhere before the festival, so the calendar is the strategy layer and the emotional thesis at once.
> 
> 6.5 The narrative pipeline (the H9 *method*, which ships; the content parks)
> 
> **Dev-crew note.** How narrative is generated and paid off, the method; the story content itself is game-35.
> 
> This is a spec for *how* narrative is generated and paid off, not a lore section. The method is ready and ships in this doc; the actual story content is game-35.
> 
> **Seed-and-payoff contract.** Every echo is a plain detail planted early (a kept seat, a hummed tune, a corner kept set for two) with a named payoff condition the player must have deduced first. The Narrative Architect (§5b) owns this as the `echo_templates` structure.
> **Delta-storytelling as default.** Each scene adds new information rather than restating; the Content Agent works under the one-sentence delta rule.
> **Encounter over quest.** The world offers encounters (pull), not directed quests (push). Errands are small community favors, generatable from world state.
> **Emotional context-box template.** The retrospective beat is assembled from data the player already gathered: people helped resurface as echoes of things once done for the deepest bond; places and activities resurface as shared moments. The register stays flat (Frieren): the words are plain, the swell is visual and sonic.
> 
---

## 6a. Slice World:

Two locations ship first: **Town** and **Forest**. The first-pass level layout sets each at roughly 7–8 screens, progressively unlocked (3 reachable at start, the rest opened by knowledge-key gates the player *performs*); 
> those per-location counts stay first-pass, owned by `level-layout_draft.md`, until the layout is prototyped. 
To "unlock" further screens the player learns how to cast spells through interactions with npcs, for example seeing someone cast fire on a dry hedge to clear it.
A third location (**Farm**) is a reserved structural slot (§6a.4) if time permits.
> One functional paragraph per location follows: what it's for, what the player does there, what it gates, kept gestural by license (the full per-screen table lives in `level-layout_draft.md`; the physical-place identity is placeholder, Roc's to flavor in place).

**6a.1 Town.** The festival's home. You arrive on the Square under the Lantern Arch, the landmark that ages across the years, so returning reads the calendar for free. From the Square you reach Market Row (stalls, small folk-magic, where Make gets its first stall-combine) and the Commons and its well (daily life, where Use gets its first honest lesson: ignite a brazier; try it on a person and nothing happens, which is the teach). Deeper in, behind performed gates: a Workshop where Make gets serious (the door opens to a *known recipe*, not a flag), a Neighbor's Home that opens on *trust* (a door that names its own key-type), the Tavern that only opens in the evening, the Festival Grounds where the run's build-up pays off and the **recognition gate** lives, and, at the town's quiet edge, an Old Shrine whose carvings you can read *if* you understand the cipher.

**6a.2 Forest.** The foraging woods and the older, stranger things in them. You start at the Forager's Clearing (Collect and a first neighbor), the Stream (Use: ignite gathered kindling; the water shrugs it off), and the Grove (Make, as field-craft). Performed gates open the rest: the Still Pool behind the phrase *"still the water,"* an Old-Growth Hollow where one insight lights up two screens at once, the Forest Ruin whose ritual marks are the travelling cipher (readable only by moonlight), the Cave as a reward-space-as-destination, and, as a stretch, the Heart of the Wood, opened by combining two fragments neither of which is sufficient alone.

**6a.3 The cross-location seam (the headline move).** A path off the Square connects Town and Forest, and the **cipher** marks *both* the Forest Ruin and the Town's Old Shrine. Reading either site is a knowledge-demonstration: understand the symbols (learned at either site, or carried in your head from a past life) and assert the reading. It is **bidirectional and not a lock**: nothing gates walking up to a shrine. If you read one *without* having seen the cipher this run, because you knew it already, the game fires a quiet **reincarnation-awareness beat** (a neighbor or a memory-motif marks the uncanny familiarity). It notices; it never blocks and never hand-holds. This is knowledge-travels-free, proven at the level of the map.

**6a.4 Farm (stretch slot).** Same shape if added: a start trio (Yard · Field · Barn) plus progressive unlocks, one featured archetype not used elsewhere (read the field/season state), and a third cross-location seam. Reserved so it adds without reworking Town or Forest.

---

## 7. Art & Audio Direction

**Tone words:** Ghibli-warm, painterly, quietly melancholic, lived-in. 
> **Concept refs (structural, not reproduced):** the desaturation discipline and flat emotional register of *Frieren*; the palette warmth and environmental wonder of Studio Ghibli; the static-camera living-diorama of *Myst*. No reproduced imagery: refs set the rules, not the assets.
Prototype will be built in html and ink script for fastest proof of concept and iteration.  

**Built in 3D**. Planned engine is Unreal using the Point and Click toolkit from the Fab marketplace.  Goal is to use 3d levels to get visual depth and one built environment can be *reused from many angles*: one 3D location yields many static-camera "scenes". The replayed festival week across years then renders cheaply: same level, different angle / time-of-day / seasonal state gives the "time moved, we returned" read with no intertitle.

> **The risk, and the mitigation.** 3D can read sterile and un-Ghibli. Warmth is held not by hand-finishing every asset but by a *system*: a hard-constrained palette (bands, not a free wheel), a locked silhouette vocabulary every generated variant reads as a variant *of*, and one key-art board plus one review eye. Cohesion comes from rules plus a single reviewer, not per-asset polish, the same discipline that lets the dev-crew generate volume without the world falling apart.

> **Going big: the domain-mapped trigger model.** There's no single global "epic" register; each *domain* of a big moment gets the register that fits it, and the words stay plain in all of them (the swell is visual, scale, or revelation, never a verbal one):

| > Domain of the "big" moment | > Register | > What it feels like |
| --- | --- | --- |
| > Social / relationship payoff | > Frieren restraint | > Lands quiet: weight preloaded, a small word carries it, the gap holds the charge |
| > World opening up | > Outer Wilds revelation + Ghibli awe | > An understanding recontextualizes the place, and it's visually warm/wondrous |
| > Magic (learning or casting) | > Outer Wilds revelation + Ghibli awe | > The discovery-aha of a knowledge-key plus the wonder of the effect |
| > The deepest world/belonging revelations | > All three | > Restraint, revelation, and awe together |
> 
> So the deep-NPC payoffs stay Frieren-quiet (they're social); learning a spell or reading the reincarnation truth is where the swell lives (world/magic).

**Sonic identity.** Music inspired by Joe Hisaishi and the Studio Ghibli films.  Ambience and items grounded in foley libraries and field recordings. Magic will follow an anime style.  UI will be tactile with fantasy flourishes where appropriate.
> Audio is a first-class design material here, not a coat of paint: the game's clearest signature. The deepest bond's **leitmotif surfaces from the festival mix** as data accrues: early visions carry only ambience, and the motif emerges as you gather enough of a soul. Sound is the strongest retrospective trigger a person has (re-hearing a melody does the Frieren thing involuntarily), which is why the audible essence-signature is the deepest recognition clue and why the audio pipeline (§8) is the USP.
> 
---

## 8. Audio and Asset Implementation

> Audio is the differentiator: a first-class design material, not a coat of paint. **Sounds are collectible objects** that travel free like knowledge: you can **show** one to a neighbor (the leitmotif probe), **gift** a recorded melody as a declaration (the sound-designer's love letter), or use one as a **spell component**. You record deliberately, never knowing which sound will matter, and its significance lands later. The clearest signature: the deepest bond's **leitmotif surfaces from the festival mix** as you gather enough of a soul, so you can recognize someone by their sound before you can name them.

**Triggers are department-agnostic Unreal GameplayTags, resolved to Wwise events through a data-driven tag→asset library.** 
> (Supersedes the earlier `<Entity>_<AnimVerb>_<State>` string, the fixed enum, and the mirrored-directory auto-link, all retired 2026-07-19.)

**One tag is a game-wide gameplay-event key, with no department prefix.** Each event is a hierarchical, extensible GameplayTag: `<Entity>.<Interaction>[.<Phase>]`, e.g. `NPC.Chef.ShowAsk.React` (*not* `Audio.NPC…`). One tag names one event, game-wide. The hierarchy grows by *adding tags as content grows*: no fixed enum, no schema change; a phase is just another optional segment 
> (which dissolves the old `<State>`-enum question).
- **A tag → asset library resolves each tag per department.** The same tag maps to a Wwise event (audio), a dialogue line/key (text), and an animation/VFX asset (art): one tag, N department resolutions, so a single gameplay event drives sound *and* text *and* art together. Adding a department means adding a resolver column, not a new tagging scheme. The library (an Unreal DataAsset / DataTable) is the single source of truth, and it's unaffected by assets being moved or renamed: no path-mirroring.
- **Direct event targeting.** Gameplay fires the event by tag lookup; each department reads its own resolution (audio posts its Wwise event). No Switch routing by default. Wwise Switches / States / RTPCs are reserved for genuine runtime variation only ("if we get there"): material-based footstep switching, or intensity/proximity/time-of-day ramps. The exception, not the rule.

**Middleware = Wwise** (locked): familiar, scriptable, and WAAPI is the natural home for library tooling and validation.

**Ownership.** The tag namespace is shared and game-wide. The **Audio-Tag Agent (§5b)** owns the *audio* resolution: it proposes compliant tags and maps/verifies each tag's Wwise-event entry, flagging collisions and orphan/missing audio mappings. It generates no audio and assigns no style or emotion. Soft gate. Text and art resolutions are owned by their own department passes, keyed off the same tags.

> *(The tag-hierarchy segment scheme (Entity → interaction → phase/descriptor) fills with the verb-table pass and is a §12 open item, but it's extensible by design, so it's non-blocking.)*

---

## 9. Project Conventions

One idea runs the whole game: a single, department-agnostic tag names each gameplay event, and a lookup table turns that tag into sound, text, and art at once. Strict file system hierarchy and folder map will provide self-docmenting asset connections, and assist an LLM in deriving where assets are located and in maintaining file system integrity.

> **Dev-crew note.** Naming, resolution, and CI conventions follow.

**The tag *is* the metadata.** Each gameplay event is a department-agnostic hierarchical Unreal GameplayTag; the data-driven tag→asset library resolves it per department. 
> This replaces path-mirroring, and the library is the single source of truth. This convention is the mechanism §8 depends on: §8 is the contract, §9 is the rule that makes it enforceable.

```
<Entity>.<Interaction>[.<Phase>]   →   Wwise event · dialogue key · animation/VFX   (per department, via the tag→asset library)
```

- **Naming rule:** tags are hierarchical, department-*agnostic* (no `Audio.` / `Text.` / `Art.` prefix), and extensible: new content adds new tags, never a new scheme or an enum edit.
- **Resolution rule:** every department reads the *same* tag through its own resolver column in the library. Adding a department = adding a column.
- **CI note:** a validation pass (WAAPI-backed) flags orphan tags (a tag with no mapping) and missing mappings (a required department resolution absent), the same collision/orphan check the Audio-Tag Agent runs, promoted to a build check so the library can't silently drift.

---

## 10. Platform, Engine & Scope

**Engine:** Unreal (UE5). **Audio middleware:** Wwise. **Rendering:** 3D, static-camera scenes. (The later ink prototype uses inkcpp / Inkpot: deferred, game-36, and *not* built from this doc.)

**The slice contract: polish the run, prove the loop**:
1. **One run is complete**, up to the festival. This is where the polish budget goes.
> **Prototype short cycle: one full run → reshuffle npcs plays end to end.** 
> The memory payoff lands *inside* the slice, demonstrated for real (not scripted); the cycle is scoped short enough to reach the first rebirth quickly. *(How short: a prototype/§12 item, no number committed.)*
1. **The story pipeline holds for a few runs**: year-over-year neighbor memory, backstory fill between years, echo accumulation across festivals.
2. **NPCs have different-role content**: the reshuffle is demonstrable, not promised (the on-camera "she was the chef, now she's the blacksmith" moment comes free).
3. **1–2 authored endings ship**

> **the deepest-bond ending may ship last but never ranks above the others**: endings are points on the belonging-spectrum (deepest-bond · community · diffuse · solitary-release); no prescribed "true" win (kept-promise retired, 2026-07-20).

> **Dev-crew note.** Content-budget formula, token-budget block, and the Van Buren guardrail follow.

## 10a. Token Budget
**Content-budget formula (a named open question, not a guessed number).** The data model is:

```
interaction-beats = souls-present × years × days × beats/day
                  + echo-strands × bond-deepening candidates
                  + descriptor-reaction lines × NPCs
                  + spells + items + locations
```

The *locked inputs* are real: 8 souls (3 deep + 5 texture), availability deals 1–2 "past" per life → ~6 present; candidate cap = 3; years = 3; locations = 2 (+1 stretch); days/run = 5; screen-moves/day = 3–5; canned paths = 2; slice spells = 10; seed items ≈ 3/category (~15). A first-pass estimate falls out (~130 social beats + 2 echo-strands + ~30 essence-reaction templates across 2 paths, heavy template/overlap pulling the real number well below 2×), but the estimate itself stays a §12 open question until it's calibrated against real generation. No un-prototyped number is stated as fact (the Van Buren guardrail governs this whole section).

**Token-budget block (skeleton: a named open question in draft; real numbers at final).**

| Line | Value |
| --- | --- |
| Model tier | divergent/creative on a mid tier; verify/classify/format on a cheap (Haiku-class) tier: build-time only |
| Runtime tokens (during a run) | **0**: a run makes no model calls in either mode |
| Dev-time generation (one-off, whole slice) | ~200–300 bounded Content calls + schema/verify/QA passes → **order \~1–3M tokens, one-time** *(first-pass estimate: §12 open until calibrated)* |
| > Live mode (player-BYOK) | > spends on the *player's own* key, between runs, not the shipped budget |
| Overrun plan | one-slot-per-call ceiling (40 words) + bounded-context summarization keep it conservative; the dev cost is bounded and iteration-multiplied, never a runtime risk |
| **Human review: the real bottleneck** | **\~1 week** of Roc's time, budgeted: every shipped line is personally approved (~200–300 items); this, not tokens, is what governs the 8/25 capstone (board finding #4) |

> **The headline:** the two-mode architecture makes the *shipped game \~free to run*: the token cost lives entirely in development, is bounded, and is dominated by the Content Agent (kept conservative by one-slot-per-call).

> **Van Buren guardrail (referenced, not repeated).** Depth is per-tier and earned; no numbers we haven't prototyped, no simulation detail, no multi-state high-count systems, no dexterity inputs, no phased-release "add it later" design, no doc-length for its own sake. The full guardrail table lives in the blueprint (`gdd-structure-model.md` §7); when a section starts reading like an over-specified engineering sheet, that content belongs in §12, not the body.

---

## 11. Milestones

> Anchored to the course assignment dates (`syllabus.md`). Each milestone carries what must be spec'd before it closes, and *who or what verifies* it's closed: the "Verified by" column pairs with the human gates in §5b.

| Date | Milestone / deliverable | Phase-3 blocking sub-rows (must be spec'd before close) | Verified by |
| --- | --- | --- | --- |
| Tue 7/14 | **GDD first draft** (Assignment #1) | Concept + pillars locked | ✅ Submitted |
| Thu 7/16 | **Final GDD draft** (Assignment #2) | 18-hole hole-filling substantially closed | ✅ Phase-3 decisions doc |
| **Tue 7/21** | **Agent crew** (Assignment #3: 3+ agents, shared output, dev artifact) | Dev-crew roster + JSON I/O (this §5b); session-state bus field schema | This Build GDD → then the 6-agent review panel (game-28) |
| Thu 7/23 | **Dynamic content pipeline** (Assignment #4: RAG, 3+ content types, consistency checks) | Content Agent + Consistency Verifier contracts (§5b); voice register + tone enum | QA/Consistency agents + Roc review of sample output |
| Tue 8/4 | **GER pipeline** (Assignment #6) | Level layout → gate/verb table; content-budget formula inputs | QA Agent traversal pass on the generated layout |
| Thu 8/6 | **Style-guide agent** (Assignment #7) | §7 color grammar + silhouette vocabulary as machine-checkable rules | Style agent + single review eye |
| Tue 8/18 | **Complete AI dev pipeline** (Assignment #10) | Token budget calibrated (§10); end-to-end prompt→engine documented | Cost analysis against real generation |
| **Tue 8/25** | **Capstone: final playable game** | Slice contract (§10) met; 1–2 endings shipped | Human playtest (primary) + QA Agent pre-ship pass |

---

## 12. Unresolved Questions

> **Dev-crew note.** Open, parked, and resolved questions are tracked below.
> 
> A decision lives in exactly one place: Open (a named question), Resolved-with-pointer (graduated into the body), or Parked (in the Parking-Lot). Never two, never deleted.
> 
> Open
> 
> **Which 1–2 endings ship in the slice?** Candidates that fall out of the vision-versioning already designed: the "not this life" melancholy version + one warmer, deepest-bond-enough variant. (§4.3, §10)
> **The letting-go ending (PARKED: do not resolve):** does the terminal choice release the bond or hold it? A deliberate open question: A (the Keeper) is designed as its *counterweight*, not its dependent, so the frame works whichever way it lands. (§6.3)
> **The going-big lead pole (PARKED: do not resolve):** which register leads when domains blend. The domain-map (§7) sets each domain's register; which one leads a mixed moment is left open by design.
> **Content-budget calibration:** the formula and its inputs are locked (§10); the beat/template counts stay a named estimate until calibrated against real generation. No un-prototyped number ships as fact.
> **Token-budget real numbers:** the skeleton is in §10; the ~1–3M dev-time figure is a first-pass estimate pending the H13 calibration at final.
> **Four-family sub-verb list:** blocks the Audio-Tag Agent's tag emission and the recognition-gate proof-step co-design; fills with the verb-table pass. (§4.4, §5b, §8)
> **Session-state bus field schema** (what it records, at what granularity, the Verifier's summarization cadence): Phase-3 orchestration design. (§5a, §5b)
> **Live-mode I/O + session-log format:** what the Content Agent receives when called between runs with only a current-state excerpt; without a persistent session log it loses retrospective-significance behavior. (§5.0, §5b)
> **Multi-agent retry / escalation protocol:** what the orchestrator does when the Verifier FLAGs and the Content Agent can't self-correct. (§5b)
> **Runtime persistence / session-state schema** the deterministic engine reads and writes: the dev-crew's one authoring obligation toward §5a.
> **Delta-storytelling rule field format**: grounded in Frieren craft, no formal I/O precedent yet. (§5b)
> **NPC perceptual distinctness**: whether the essence-signature card pipeline yields perceptibly distinct neighbors needs real Phase-3 writing samples against the voice guide; the structure guards homogenization but can't prove it on paper. (§5b)
> **Tag-hierarchy segment scheme** (Entity → interaction → phase/descriptor?): fills with the verb-table pass; extensible, so non-blocking. (§8)
> **Map shape (routing dependency):** §6a is writable at gestural altitude either way, but the orchestrator's routing depends on it, flagged so it isn't silently assumed. (§6a, §5b)
> **Recognition notebook UI**: deliberately deferred; the data model is the contract (Soul/Role/Place/Item/Sound/Moment/Descriptor + typed edges), the presentation iterates later on the Obra-Dinn / Outer-Wilds inspirations. (§5a, §6.3)
> **Detailed data schema** (field types, cardinalities, keys) for the notebook/rumor-graph, deferred to build; a full ERD now would over-spec (Van Buren).
> **H9 baseline-narrative content (deferred to game-35):** the slice's specific place, the central 15-second memory vignette (the polish target), and the seed-and-payoff spine across the three festival-years. The *method* ships (§6.5); the *content* is written into this settled frame, not before it.
> 
> Resolved (decision + pointer, kept for the record)
> 
> **Concept** → cosmic hide-and-seek: reincarnation-deduction cozy roguelike (concept-dig, Sessions 1–9; §1).
> **Terminology** → **bond level**, not "partner"; the deepest bond is emergent, never a prescribed goal (§ vocabulary note, §6.3).
> **Audio (H15)** → department-agnostic GameplayTags + tag→asset library + Wwise; the old string/enum/mirrored-tree retired (§8, §9).
> **Live mode (H10)** → player-BYOK; pipeline runs between runs, never during; canned = 0 model calls (§5.0, §5a).
> **Runtime persistence** → deterministic mechanics, not an LLM (§5a).
> **Spells (H6)** → physical outcomes only, receiver-determined (incl. no effect); starter `ignite` (sticks), + `scratch` (wool), `breath` (grass+dirt) (§4.2).
> **Recognition (H16)** → Obra-Dinn dropdown-pick + batch-lock; Soul vs. Role; essence-FACT vs. bond-level-EMERGENT; notebook is a data model, UI deferred (§4.4, §6.3).
> **Design law** → knowledge lives in the player's head, not a flag; gates performed, never flag-blocked; per-run "learned-here" tracking is narrative-only (§2, §6a.3).
> **Endings (H18)** → no hard-lose; soft terminal states; slice ships 1–2 endings (§4.3).
> **Art (H17)** → 3D; going-big is a domain-mapped blend; Wwise; UE5 (§7).
> **Roster (H1/H2)** → 3 deep (Keeper / Giver / Kinbound: tended / manufactured / given) + 5 texture; availability deals 1–2 "past" per life (§5b input; feeds §6.5 content).
> **Scope math inputs (H14)** → 8 souls, cap 3, 3 years, 2(+1) locations, 5 days, 3–5 moves/day, 2 canned paths, 10 spells, ~15 items (§10).
> **Slice contract** → polish the run, prove the loop (§10).
> **Engine** → Unreal (§10).
> **Six-beat room grammar** → retired; superseded by the four action families (§4.1).

---

*Assembled 2026-07-19 (game-26). Next: submission HTML (game-27), then the 6-agent review panel on the full doc (game-28) → revision (game-29). The ink prototype (game-36) and H9 baseline-narrative content (game-35) are deferred to this settled frame.*
