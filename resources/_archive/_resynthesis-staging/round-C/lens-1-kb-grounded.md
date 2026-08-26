---
kind: round-C lens artifact
lens: L1 — KB-grounded
artifact: dev-crew architecture
built: "Phase 2.5 resynthesis (2026-07-17)"
sources:
  - knowledge-base/ai-workflow/building-ai-workers.md
  - knowledge-base/ai-workflow/godot-game-architecture.md
  - knowledge-base/narrative/narrative-designer-studio-role.md
  - knowledge-base/narrative/modular-characters-system-driven.md
  - knowledge-base/narrative/procedural-narrative-generation.md
  - knowledge-base/narrative/narrative-lego-ken-levine.md
  - knowledge-base/narrative/writing-books-with-ai.md
  - knowledge-base/narrative/efficiently-branching-narrative.md
  - knowledge-base/narrative/greyboxing-narrative-story-languages.md
  - knowledge-base/narrative/emergent-storytelling-the-sims.md
  - knowledge-base/narrative/procedural-history-caves-of-qud.md
  - knowledge-base/narrative/player-driven-stories.md
  - knowledge-base/narrative/ink-narrative-scripting-language.md
  - knowledge-base/narrative/heavens-vault-detective-story.md
  - knowledge-base/narrative/narrative-deduction-mechanics.md
  - knowledge-base/narrative/old-world-postmortem.md
  - knowledge-base/_index.md §2 H10/H11
  - knowledge-base/synthesis/_resynthesis-staging/round-A/gdd-structure-model.md §4–5 (§5 agent roster)
  - resources/concept-dig-notes.md (Sessions 2–8 — locked design)
  - knowledge-base/RESYNTHESIS-PLAN.md §4 Round C + §5 guardrails
  - GATE-2-review.md locked calls
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (transcript 21:37:05–21:55:28)
status: STAGED candidate — compare pass + Roc review at GATE C/GATE 2
---

# Dev-Crew Architecture — Lens 1: KB-Grounded

**What this lens does and doesn't do.** This proposal draws exclusively on the 157-note KB,
the class transcript, and the locked design decisions already in the repo. It does not mine
the three external repos (that is L2's job) and does not optimize first for class-rubric
compliance (that is L3's job). Its constraint is: every agent must be necessary given what
the KB actually says about this game's pipeline, and every claim must trace to a source.
Invented roles not grounded in the KB are excluded; thin sourcing is flagged inline.

**Two contexts, kept distinct (mandatory per [`RESYNTHESIS-PLAN.md` §5]).** The KB serves
two different H-holes:
- **H10 — in-game runtime agents:** agents that run *during play*, responding to the player
  in real-time or near-real-time (the ICM pipeline, dialogue responses, the silhouette
  vignette engine). These are the "agentic AI showcase" agents.
- **H11 — dev-pipeline crew:** agents that run *during development*, generating and quality-
  checking content before it ships. These are the agents the Build GDD hands off to.

The class transcript conflates these in its worked example [`transcript` 21:37:05]:
*"the content agent generates NPC dialogue as JSON."* That agent could live in either
context; the design must be explicit about which. This lens keeps them separate and
proposes two named sub-groups within the ~5-agent cap.

---

## 1. Design philosophy grounded in the KB

Three principles from the KB govern every agent in this roster.

**Worker decomposition, not monolith.** The `building-ai-workers` note is direct: *"every
time the same multi-step sequence recurs, that sequence is a candidate to be encapsulated
as a named worker with a stable input contract."* [`building-ai-workers`] The pipeline
for this game has at least four recurrent multi-step sequences that qualify: persona
generation, clue-state update, content block retrieval, and canon-check. Each becomes a
named worker, not a subroutine of a single agent.

**Stars vs. drones — scope discipline.** The `narrative-lego-ken-levine` note extracts the
tiering pattern explicitly: *"limit 'deep' characters to the number a player can actually
track (5 per zone). Everyone else is a drone whose macro-bar is just an average of nearby
stars."* [`narrative-lego-ken-levine`] Applied to the dev-crew: a small number of "star"
agents hold full context and rich output budgets; lightweight "drone" agents propagate
summary state. For a 6-week slice, the crew is nearly all stars — but the *pattern* is
architecturally encoded so the crew can grow without rewriting the orchestrator.

**Call down, signal up — the coupling rule.** The `godot-game-architecture` note names the
dependency direction: *"a node calls methods directly on its children (down the
hierarchy); it never needs to know about its parent. Events bubble up via signals."*
[`godot-game-architecture`] In agent terms: the orchestrator calls agents directly; agents
return structured output without knowing who asked. Agents must never reach up to query
each other — they receive a prepared input and emit a typed output. This is what makes
each agent testable in isolation.

**Human gate at the output, not inside the chain.** The `building-ai-workers` note states
this as the exit condition: *"the human's role collapses to final creative stamp — not
execution of steps."* [`building-ai-workers`] For our pipeline, this is modified by the
watch-out in the same note: *"cozy rhythm means broken output mid-run can't be silently
swallowed."* The gate architecture must include an early human checkpoint for the NPC
persona generation pass (a low-cost review before personas propagate into every downstream
agent) and a final canon-check gate before content ships to the game. Mid-chain human
interruptions are explicit, not accidental.

---

## 2. The four-stage pipeline (KB-derived)

The `efficiently-branching-narrative` note names the production sequencing discipline:
*"story first, branches second, choices last"* — and maps that to a four-stage gate
model [`efficiently-branching-narrative`]. The `writing-books-with-ai` note mirrors it:
outline → AI draft → multi-pass editing [`writing-books-with-ai`]. The `greyboxing-
narrative-story-languages` note adds the greybox-first discipline: *"the story agent
emits structurally-valid placeholder dialogue that populates the game at feature-complete
quality before final prose is written."* [`greyboxing-narrative-story-languages`]

These three refs converge on the same four-stage content pipeline:

1. **Schema stage** — define NPC persona cards (orthogonal trait axes, essence-descriptor,
   suit tags) and the world-state skeleton. No prose yet. Human reviews the cards.
   [`modular-characters-system-driven`]
2. **Greybox stage** — generate structurally-valid placeholder content: branch logic, state
   flags, reaction stubs. Locked scaffold; not yet prose. [`greyboxing-narrative-story-
   languages`; `ink-narrative-scripting-language`]
3. **Prose stage** — fill the locked scaffold with final voice-compliant lines.
   [`writing-books-with-ai`; `voice-style-guide`]
4. **Canon-check stage** — verify cross-scene consistency (superposition rule, role-boundary
   law, essence-vs-role discipline) before shipping. [`narrative-designer-studio-role`
   "know your reasons"; `building-ai-workers` watch-out on broken output]

Each stage is a named worker; the output of one is the input of the next. **This is the H10
pipeline architecture.** The H11 dev-crew roster maps one or more agents to each stage.

---

## 3. The proposed roster — six agents

The class transcript specifies *~5 agents + an orchestrator/manager* for class scope, with
one-agent-per-feature and a realistic-capability check [`transcript` 21:37:05–21:54:11].
This roster proposes five content/pipeline agents plus one orchestrator, for six total. All
five content agents are **dev-pipeline agents (H11)**; two also have a runtime variant
(H10); those dual-context agents are flagged.

---

### Agent 0 — Orchestrator (the manager)

**Role:** Receives the content spec (which NPC, which stage, which scene context), routes
to the correct sub-agent, assembles the output package, and surfaces the human-gate
checkpoints. Holds no domain knowledge itself — it is the wiring, not the expertise.
This is the *vision-holder* function from `narrative-designer-studio-role`: *"receives
high-level vision from leadership, distributes filtered knowledge to each department."*
[`narrative-designer-studio-role`] The Orchestrator distributes *what each agent needs,
not everything*.

**Why it earns its place:** the `godot-game-architecture` note identifies cyclical
dependencies between feature groups as the failure mode [`godot-game-architecture`]. An
orchestrator that routes rather than reasons keeps agents from calling each other directly —
eliminating the circular-reference risk.

**Input:** `{ scene_id, npc_id_list, pipeline_stage, world_state_snapshot }`
**Output:** routed sub-agent call + assembled package per stage
**Human gate:** yes — surfaces gate prompts for Schema review and Canon-check; does not
swallow broken output silently [`building-ai-workers` watch-out]

---

### Agent 1 — Persona Architect (dev-pipeline, Schema stage)

**Role:** Generates and maintains NPC persona cards. Each card contains orthogonal trait
axes (independently set, never correlated by default), a single essence-descriptor (the
most surface-able differentiating signal), a suit tag (maps to the world's thematic
pillars — not reproduced here, Roc's to assign [`modular-characters-system-driven`]), and
authored exceptions (~5–10% handwritten lines that break the generator's rules).

**KB grounding:** The `modular-characters-system-driven` note is the primary source. Its
pipeline is drop-in: *(a) define orthogonal axes; (b) tag to suits; (c) compose traits;
(d) surface via priority tiers + parallel channels; (e) seed authored exceptions.*
[`modular-characters-system-driven`] The tier-1 surfacing (what has changed since last
encounter) matches the ICM callback-legibility requirement from `concept-dig-notes`
Session 2: *"ICM callbacks must be legible/traceable to the player's actual past actions
or they read as noise."* [`concept-dig-notes` Session 2]

**Why it earns its place (one-feature test):** Persona generation is the foundational
feature of the entire game — every downstream agent (Dialogue Writer, State Tracker,
Canon-Checker) reads from the persona card. It is inherently a separable, stable-I/O
worker. [`building-ai-workers`]

**Input:** `{ npc_id, essence_hints: string[], suit_tag: enum, authored_exceptions: string[] }`
**Output:** `{ npc_id, trait_axes: { axis: string, value: string }[], essence_descriptor: string, priority_tier_1: string, authored_exceptions: string[] }`
**When called:** Schema stage, before any prose; re-called when a role shuffle crosses a
life boundary (the persona card persists; the role does not) [`concept-dig-notes` Session 7]
**Human gate:** yes — Roc reviews persona cards before they propagate downstream. The
persona card is the canon document for an NPC; errors here propagate to every interaction.
**Realistic-capability check:** generating structured trait cards from seed text is a
well-scoped LLM task. The risk is correlated traits (the `modular-characters-system-driven`
watch-out); the output schema enforces orthogonality by construction — axes are named and
independently valued, not free-form text.

**Dual-context note:** The priority-tier surfacing logic (tier 1: what changed; tier 2:
most distinctive trait) is also the H10 runtime display contract — what the game surfaces
to the player on first encounter. The dev-pipeline card *is* the runtime display spec.

---

### Agent 2 — State Tracker (dev-pipeline + runtime, Greybox stage)

**Role:** Maintains the world-state knowledge graph across scenes and sessions: which
knowledge flags are set, which NPC solidification scores have changed, which echoes have
fired, what the player carries. This is the entity-event model from `procedural-history-
caves-of-qud`: *"entities (property buckets) and event templates (events read and write
entity state; that state is the through-line)."* [`procedural-history-caves-of-qud`]

**KB grounding:** Two refs converge on this agent's design. The `player-driven-stories`
note names its three sub-functions explicitly: *(1) listener/event classifier — intercepts
player actions, assigns polarity + amplitude; (2) relationship tracker — accumulates per-
NPC scores; (3) moment injector — monitors thresholds and fires the appropriate reaction
suite.* [`player-driven-stories`] The `ink-narrative-scripting-language` note adds the
session-log requirement: *"the agent never has to cross-reference a separate state table;
it queries its own output history."* [`ink-narrative-scripting-language`] Combined: the
State Tracker is the output-history log and the relationship accumulator in one.

**Why it earns its place:** The ICM (Incarnation-Context Memory) is the game's "wow" beat
— *"the world remembers you back"* [`concept-dig-notes` Session 2 pitch-card]. Without a
dedicated State Tracker holding the cross-session log, the ICM callback has no source to
draw from, and the informational-feedback law (wrong action always teaches) has no
mechanism. This is the critical-path agent for the agentic showcase.

**Input:** `{ action: { verb: enum, target_id, npc_id? }, session_log: EventList, world_state: StateSnapshot }`
**Output:** `{ updated_state: StateSnapshot, triggered_echoes: EchoList, solidification_delta: { npc_id, delta: float }[] }`
**When called:** runtime — on every player action (lightweight event classification) and at
scene-exit (full state write). Also called at session-start to hydrate the session log from
persistent storage.
**Human gate:** no mid-run gate (would break cozy rhythm); gates live at the
session-boundary snapshot review and the Canon-Checker's cross-session pass.
**Realistic-capability check:** state-flag tracking and threshold monitoring are
deterministic tasks well-suited to an agent with a structured output contract. The watch-out
from `player-driven-stories` applies: the polarity axis must be translated to our verb
set (attentive / dismissive / generous / intrusive, not good/evil) — the axis enum is the
spec, not the implementation.

---

### Agent 3 — Content Block Writer (dev-pipeline, Prose stage)

**Role:** Fills the locked greybox scaffold with final voice-compliant prose. Takes a
persona card + a scene context + a scaffold stub, and emits a finished content block: one
NPC dialogue line, one object description, one echo fragment, or one reaction set. It does
not make structural decisions (no new branches, no state assignments); it fills in exactly
one slot per call. This is the *department translator* function from `narrative-designer-
studio-role`: *"renders decisions as dialogue specs, each with its own syntax."*
[`narrative-designer-studio-role`]

**KB grounding:** The `writing-books-with-ai` note names the gate precisely: *"outline-first
+ AI-draft + multi-pass editing loop mirrors our narrative-generation pipeline gate: author
writes a beat outline → dev-crew story agent drafts prose → human editor removes AI tells
and reinforces voice."* [`writing-books-with-ai`] The `procedural-history-caves-of-qud`
entity-event-grammar model gives the I/O shape: *"text templates contain symbol slots that
are expanded by rules which consult entity state."* [`procedural-history-caves-of-qud`] The
grammar template IS the scaffold stub; the Content Block Writer fills the slots.

**The class transcript worked example maps exactly here:** *"the content agent generates NPC
dialogue lines in JSON format. Each line includes the speaker_id, tone from a fixed list of
5, max length of 40 words."* [`transcript` 21:37:05–21:37:27] This lens uses that JSON
altitude as the floor — every output must reach at least this specificity.

**Input:** `{ scaffold_stub: string, persona_card: PersonaCard, scene_context: { location_id, time_of_day: enum, world_state_excerpt: StateExcerpt }, voice_register: "flat" | "warmth-swell" | "retrospective" }`
**Output:** `{ content_id: string, speaker_id: string, tone: enum[5], text: string (≤40 words for dialogue, ≤60 for object descriptions), echo_flag: bool }`
**When called:** Prose stage, after scaffold is locked and persona cards are approved. Called
per content slot — one call, one block. Batching is the Orchestrator's job, not this agent's.
**Human gate:** output reviewed via automated tell-detection pass first (flag AI markers),
then Roc reviews flagged lines. Not all lines require Roc's eye — only those with
`echo_flag: true` or `voice_register: "retrospective"` get mandatory human review.
[`writing-books-with-ai`]
**Realistic-capability check:** single-slot prose generation to a voice spec is the most
reliable LLM task in this crew. The risk is voice drift over many calls (the "AI tells"
problem); the automated tell-detection pre-pass addresses this before it reaches human review.

**Dual-context note:** The same output format serves runtime dialogue delivery — the game
engine reads `speaker_id`, `tone`, `text` directly. No translation layer needed.

---

### Agent 4 — Canon Checker (dev-pipeline, Canon-check stage)

**Role:** Cross-references all generated content blocks against the locked canon: the
superposition rule (before solidification there is no fact, only leanings; once collapsed,
a fact is permanent and sacred [`concept-dig-notes` Session 7]), the role-boundary law
(roles are fixed within a life; the re-roll surface opens only at life boundaries
[`concept-dig-notes` Session 7]), the essence-vs-role discipline (personality cards persist
across role shuffles — the cross-life recognition tool [`concept-dig-notes` Session 8]),
and the informational-feedback law (a wrong action always teaches — never a blank
acknowledgment [`concept-dig-notes` Session 2]). This is the *continuity keeper* function
from `narrative-designer-studio-role`: *"knows reasons; defends coherence under
stress-tests."* [`narrative-designer-studio-role`]

**KB grounding:** The `building-ai-workers` watch-out names the need: *"our narrative
pipeline will need explicit failure branches and human-check gates earlier than this author
implies — cozy rhythm means broken output mid-run can't be silently swallowed."*
[`building-ai-workers`] The `RESYNTHESIS-PLAN.md` §5 naming of the *consistency/
verification-agent pattern* surfaced in the class Q&A as *"canon-check across a knowledge
base, flag for a human"* [`RESYNTHESIS-PLAN.md` §5] confirms this is the right shape. The
`procedural-history-caves-of-qud` coherence watch-out adds the specific failure mode to
check: *"NPC dialogue or lore fragment generated by a story-agent must at minimum be
self-consistent within a session."* [`procedural-history-caves-of-qud`]

**Why it earns its place:** The superposition rule + essence-vs-role discipline create
specific, checkable invariants. A Canon Checker that runs a finite rule-list against each
content batch is a more reliable guard than hoping the Content Block Writer never
contradicts the persona card from three sessions ago.

**Input:** `{ content_batch: ContentBlock[], active_canon: { superposition_flags: dict, locked_roles: RoleMap, persona_cards: PersonaCard[], solidification_scores: dict }, session_log: EventList }`
**Output:** `{ pass: bool, violations: [{ content_id, rule_violated, description, suggested_fix }] }`
**When called:** Canon-check stage, on every content batch before it is handed to the
Orchestrator for assembly. Also called at session-boundary when the State Tracker writes its
snapshot — catch cross-session contradictions before they persist.
**Human gate:** yes — violations route directly to Roc. Pass results route to the
Orchestrator silently. The Canon Checker never auto-repairs; it flags and waits.
**Realistic-capability check:** rule-checking against a finite invariant set is the most
deterministic task in the crew. The risk is false negatives on subtle voice violations
(the Canon Checker checks structural rules, not prose quality — prose quality lives in the
tell-detection pre-pass on Agent 3). Scope is explicitly bounded: five checkable rules,
not open-ended quality review.

**Thin-source flag:** The canon-check pattern is mentioned once in the runbook Q&A extract
[`RESYNTHESIS-PLAN.md` §5] and implied by the `building-ai-workers` watch-out. It is not
developed as a named architectural pattern in any dedicated KB note. The five invariants it
checks (superposition rule, role-boundary law, essence-vs-role discipline, informational-
feedback law, callback-legibility requirement) are all sourced from `concept-dig-notes` and
the locked design — but the *agent shape* rests on thin sourcing. Flag for the compare pass.

---

### Agent 5 — Echo Architect (dev-pipeline, cross-stage)

**Role:** Designs and maintains the seed-and-payoff structure: which objects, sounds, and
interactions carry latent significance, and which later encounters unlock their retroactive
weight. This is the pipeline-level implementation of the retrospective-significance engine
— *"the ordinary detail that detonates only when something is later true"* [`the-secret-to-
frierens-worldbuilding`; `voice-style-guide` §4]. The Echo Architect is the one agent that
works across all four pipeline stages: it sets echo seeds at Schema stage, confirms echo
hooks at Greybox stage, validates echo payoffs at Prose stage, and cross-references echo
integrity at Canon-check stage.

**KB grounding:** Three refs supply the architecture. The `procedural-narrative-generation`
note names the rules-with-variables approach: *"author rules once with a character
placeholder so a small rule set generates a wide event space."* [`procedural-narrative-
generation`] The significance-rule pattern translates directly: *"if player examines object
and partner-echo matches, flag connection"* — a generalized rule that instantiates across
many scene objects. [`procedural-narrative-generation` H11 steal] The `emergent-storytelling-
the-sims` note adds the temporal scoring decay requirement: *"desire relevance fades with
game-time elapsed; decay rate must match player memory, not real-world or simulated time."*
[`emergent-storytelling-the-sims`] Echo payoffs must not surface so late the player has
forgotten the seed. The `outer-wilds` note gives the three-tier placement discipline:
surface / mid-level / hidden — *"not by lock-and-key gating but by physical placement
difficulty and inference load required."* [`curiosity-driven-exploration-outer-wilds`]

**Why it earns its place:** The echo structure is the game's singular design thesis — the
mechanic that makes retrospective significance feel authored rather than accidental.
Without a dedicated agent holding the seed-payoff ledger and cross-referencing it across
all pipeline stages, echo integrity degrades to coincidence. No other agent in the crew
holds this cross-stage view. [`narrative-designer-studio-role` "systems architect — translates
narrative into game-design dependencies"]

**Input (Schema stage):** `{ object_id, npc_id?, location_id, echo_seed_text: string, payoff_trigger: { condition: string, timing: "early_life | mid_life | festival_night | cross_life" } }`
**Output (Schema stage):** `{ echo_id, seed_placement: { object_id, tier: enum[surface|mid|hidden] }, payoff_schema: { trigger_type: string, decay_window: int_sessions } }`
**Input (Canon-check stage):** `{ echo_batch: EchoRecord[], session_log: EventList }`
**Output (Canon-check stage):** `{ echo_integrity: bool, orphaned_seeds: EchoId[], expired_payoffs: EchoId[], mismatched_tiers: [{ echo_id, expected_tier, found_tier }] }`
**When called:** Schema stage (set seeds) and Canon-check stage (verify integrity). Consulted
by the Orchestrator at Greybox and Prose stages when a content slot carries `echo_flag: true`.
**Human gate:** yes — Roc reviews the echo ledger at each Schema stage pass. The echo
structure is core creative content; the agent proposes, Roc decides.
**Realistic-capability check:** seed-and-payoff ledger maintenance is a structured
record-keeping task; the generation of echo seed text from scene context is a moderate LLM
task. The risk is the agent inventing NPC-specific content it has no authorization to invent
(the no-invention rule). Guard: the Echo Architect generates *placement specs and trigger
conditions*, not the prose that carries the echo. Prose is Agent 3's job; echo integrity is
Agent 5's. The boundary is explicit.

**Thin-source flag:** The Echo Architect's cross-stage role is synthesized from multiple
refs rather than named in any single source. Its legitimacy rests on the convergence of
`procedural-narrative-generation`, `emergent-storytelling-the-sims`, and
`curiosity-driven-exploration-outer-wilds` on the same three-tier seed-payoff structure,
plus the locked design thesis from `concept-dig-notes`. Treat as a high-confidence
synthesis, but flag for the compare pass.

---

## 4. Two-mode architecture mapped to the roster

The Build GDD §5 specifies a **two-mode architecture: canned + live** [`gdd-structure-model`
§5]. Both modes must be architecturally supported by the roster above. Grounded in the
`godot-game-architecture` context-hierarchy pattern: *"AI content must be passable as a
bound dependency at context-init time, not fetched mid-frame via a global."*
[`godot-game-architecture` H12 steal]

| Mode | Description | Agents involved | When content is generated |
|------|-------------|-----------------|--------------------------|
| **Canned** | Pre-generated content loaded at scene-init; the engine reads static JSON. | Agents 0–5 run the full pipeline **before play**; output is stored as JSON content files. | Dev-pipeline phase — all five agents |
| **Live** | Lightweight runtime calls that respond to player state during play. | Agent 2 (State Tracker — always live), Agent 3 (Content Block Writer — fills empty-state slots on demand), Orchestrator (thin routing call only). Agents 1, 4, 5 do not run live. | Session runtime — Agents 2 + 3 only |

**The canned/live split enforces the content boundary:** anything that requires cross-
session reasoning (persona card generation, echo seed placement, canon verification) is
canned. Anything that requires only the current session's state (NPC reaction to this exact
verb on this exact target) can be live. This is the `godot-game-architecture` dependency
injection rule at pipeline altitude: the context root (scene-init) binds the canned
content as a dependency; the live layer queries only what it needs in the moment.

---

## 5. What the KB cannot supply — honest gaps

The `_index.md` §3.4 is direct: *"H11 is the thinnest required section. Refs supply mindset,
not schemas. Expect to design + name the dev-crew roster largely from scratch in Phase 3."*
[`_index.md` §3.4] This lens has used the KB to the limit of its evidence, but the following
gaps are real and must be named rather than papered over.

**No token budget.** H13 is untouched by the KB [`_index.md` §2 H13]. None of the KB
notes discuss context-window sizing, call frequency, or cost-per-call estimates. The five-
agent roster is scoped conservatively (one-slot-per-call for Agent 3; state-snapshot rather
than full-session replay for Agent 2), but the numbers require Phase-3 estimation against
actual API costs. Named open question, not a guess.

**No I/O-contract schemas for the live mode.** The canned-mode schemas above are grounded
in the KB's entity-event models and the class transcript's JSON-altitude example. The live-
mode I/O — specifically, what the Content Block Writer receives when called mid-session with
only a current-state excerpt — is a design gap. The `ink-narrative-scripting-language`
watch-out names the failure: *"an AI narrative agent working over long sessions will need a
persistent log — a session transcript that doubles as the state store. If that log is absent
or truncated, the agent loses the retrospective-significance behavior entirely."*
[`ink-narrative-scripting-language`] The session-log format is the blocking spec for live-
mode Agent 3.

**No multi-agent coordination protocol.** The `building-ai-workers` note acknowledges its
own gap: *"the ref has no discussion of error handling, token budgets, or what happens when
the worker produces bad output mid-pipeline."* [`building-ai-workers`] This lens proposes the
Canon Checker as the error surface, but the retry and escalation protocol — what the
Orchestrator does when Agent 4 returns `pass: false` and Agent 3 cannot self-correct — is
a Phase-3 spec task.

**No Unreal-specific integration pattern.** The `godot-game-architecture` note is explicit:
*"the seven tips are Godot-specific in their mechanics; the patterns transfer but no Unreal-
equivalent tooling is discussed."* [`godot-game-architecture`] The call-down/signal-up rule
and the dependency-injection pattern apply at the architecture level; the *implementation*
requires a separate Unreal-specific source (MetaSounds integration, Unreal asset pipeline).

---

## 6. How this roster maps to the Build GDD §5

Per the `gdd-structure-model` §4 Build GDD mapping:

> §5 Agentic AI Showcase — **T2 → T3.** JSON-I/O specs live here. Two-mode architecture
> (canned + live); dev-crew pipeline roster (~5 + orchestrator); each agent: name · role ·
> input schema · output schema · when-called · human-gate · realistic-capability check.
> [`gdd-structure-model` §4]

This lens supplies the content for Build GDD §5 at T2 altitude. The four-stage pipeline
(§2 above) is the T2 system named and shaped. The five agent I/O sketches (§3 above) are
the T3 starts — they reach schema altitude for the canned mode and name the open questions
for the live mode. The two-mode table (§4 above) is the architecture summary. The gap
section (§5 above) feeds Build GDD §12 (the open ledger) directly — three named open
questions, not vague gestures.

The one item this lens does not supply: the **P5 Pitch-face version** — *"Name each agent +
one-line output + when called; the wow = 'the game remembers every life you've lived.'"*
[`gdd-structure-model` §3 P5] That is a compression of this roster to one sentence per
agent, which the compare/merge pass is better placed to finalize once all three lenses
are in.

---

## 7. Tensions and open flags for the compare pass

1. **Echo Architect's cross-stage role vs. SRP (Single Responsibility Principle).** The
   `godot-game-architecture` note endorses feature encapsulation: one feature, one agent.
   The Echo Architect spans all four pipeline stages. Its justification — no other agent
   holds the cross-stage view — is KB-grounded, but L3 (class-spec lens) may prefer to
   split it into an Echo Seeder (Schema) and an Echo Verifier (Canon-check) to honor SRP.
   The compare pass should adjudicate.

2. **Canon Checker's thin sourcing.** The agent shape is implied by two sources rather than
   named in one dedicated reference. The compare pass should check whether L2 or L3 supplies
   a stronger source for this pattern.

3. **Live-mode Agent 3 is a design gap, not a thin source.** The canned-mode I/O is
   specified; the live-mode I/O awaits the session-log format spec. This is a Phase-3 task,
   but the compare pass should confirm that L2 and L3 lenses have no KB or external source
   that closes this gap earlier.

4. **Audio-first pipeline and the State Tracker.** Audio objects inherit the full object-
   verb set (show-able, gift-able, spell-component candidate) [`concept-dig-notes` Session 8].
   The State Tracker's polarity axis must handle audio interactions (playing a leitmotif to
   an NPC is an `attentive` action; the NPC's reaction carries solidification weight). The
   verb enum in Agent 2's input schema must include `play_sound` as a named action. Not
   blocking — but a specificity gap to close at Phase-3 spec time.
