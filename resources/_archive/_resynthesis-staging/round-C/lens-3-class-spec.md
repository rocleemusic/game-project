---
kind: staged lens artifact
lens: L3 class-spec
round: C
artifact: dev-crew-architecture (lens input)
sources:
  - knowledge-base/_index.md §2–3 (H10/H11 hole-coverage + honest findings)
  - knowledge-base/RESYNTHESIS-PLAN.md §2–5 (locked inputs + method + guardrails)
  - GATE-2-review.md (Roc's locked/open calls)
  - knowledge-base/synthesis/_resynthesis-staging/round-A/gdd-structure-model.md (§5, Build §5 altitude + what-lives-where)
  - knowledge-base/synthesis/_resynthesis-staging/round-C/recon.md (three-repo pattern grammar)
  - knowledge-base/ai-workflow/building-ai-workers.md (H10/H11 mindset seeds)
  - knowledge-base/ai-workflow/godot-game-architecture.md (H11 injection pattern)
  - knowledge-base/narrative/modular-characters-system-driven.md (H2/H10 pipeline layer)
  - knowledge-base/narrative/narrative-designer-studio-role.md (H11 role seeds)
  - knowledge-base/narrative/narrative-lego-ken-levine.md (H10/H11 stars-vs-drones)
  - knowledge-base/narrative/procedural-narrative-generation.md (H10 beats-as-states)
  - knowledge-base/narrative/writing-books-with-ai.md (H10 pipeline workflow)
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (class transcript — JSON-I/O altitude, ~5-agent cap, SRP, realistic-capability check, agent role clarity rubric)
built: "Phase 2.5 resynthesis Round C (2026-07-17)"
status: STAGED — input to Round C compare/merge; not promoted to live synthesis
---

# Dev-Crew Architecture — Lens 3: Class-Spec

**Lens stance.** This lens applies the class rubric *strictly*: approximately five agents
plus an orchestrator; one-agent-per-feature; JSON-I/O altitude throughout; the
realistic-capability check applied to each agent before it earns a slot. "Agent role
clarity is graded" [`transcript` 21:51:40]. Any agent that cannot be described as a clean
input/output contract at JSON altitude is replaced or absorbed. The result is the minimal
crew that earns its place in a 6-week slice of a cozy, narrative, P&C, audio-first,
2D-ish deduction game — not the fullest possible roster.

**What this lens does NOT do.** It does not invent NPC rosters, items, magic words, or
scene content. Those are Roc's to supply in Phase 3 [`GATE-2-review.md` B3]. It does not
port a repo roster verbatim — the grammar transfers, not the headcount or the code-heavy
agent types [`recon.md` §4; `RESYNTHESIS-PLAN.md` §5 relevance filter]. It does not
over-specify implementation details that belong in Phase 3 (Van Buren guardrail G10
[`gdd-structure-model.md` §7]).

---

## 1. The design constraint set

Three constraints govern every agent slot decision in this lens.

**C1 — ~5 agents + orchestrator for class scope.** The class transcript establishes the
cap: for a 6-week slice, more than roughly 5 agents suggests over-scoping [`transcript`
21:53:38–21:53:52]. This is a *discipline threshold*, not a hard architectural rule — the
Q&A clarifies that larger games scale the count, but scope appropriateness is the test
[`transcript` 21:53:53–21:54:30]. Applied here: every proposed agent must justify its slot
against the cap. Absorption is preferred to proliferation.

**C2 — One agent per feature (SRP).** The class confirms the one-feature-per-agent
pattern: an agent for the inventory system knows the inventory; an agent for the
dialogue system knows dialogue [`transcript` 21:55:01–21:55:21]. Each agent in this roster
owns exactly one output domain. No agent straddles two features. Cross-cutting concerns
(canon consistency, session state) go to the orchestrator or a dedicated satellite — not
into a content agent's remit.

**C3 — JSON-I/O altitude throughout.** The class example is precise: instead of "AI will
make the game more interesting," the Build GDD says "the content agent generates NPC
dialogue lines in JSON format. Each line includes the speaker ID, tone from a fixed list
of 5, max length of 40 words" [`transcript` 21:37:05–21:37:27]. Every agent in this
roster carries an I/O contract at this altitude. The contract is not the full schema (that
is Phase-3 work) but it names the fields, types, and bounds that would appear in the
schema.

**C4 — Realistic-capability check.** "Can an agent actually build this?" is a mandatory
question [`transcript` 21:39:34–21:40:16]. An agent promised to "generate dynamic
narrative" fails the check. An agent that "receives an NPC context block and returns a
dialogue line under 40 words with a named tone field" passes it. The check is applied
to each agent below in a dedicated row.

---

## 2. The two-mode constraint (locked context)

The game's AI architecture operates in two modes, a locked decision carried from the
concept notes [`gdd-structure-model.md` Build §5; `RESYNTHESIS-PLAN.md` §2]:

- **Canned mode** — pre-generated content, authored offline, surfaced at runtime from
  a library. No live LLM call during play. Agent pipeline runs in this mode during
  development.
- **Live mode** — optional runtime LLM call for a named "wow" beat (the emergent-partner
  moment); requires explicit human approval gate before any content write
  [`recon.md` §4, approval-before-write pattern].

Every agent in this roster must specify which mode(s) it serves. The canned-vs-live
distinction governs token budget, latency tolerance, and the human-gate requirement. The
class's realistic-capability check cannot be passed without distinguishing which mode the
agent operates in [`gdd-structure-model.md` §4, Build §5 note].

---

## 3. The audio-first pipeline constraint (locked USP)

The game's audio-first pipeline is a differentiator: sounds are collectible objects,
the auto-link rule ties each audio file to a game entity via the naming convention
`<Entity>_<AnimVerb>_<State>`, and the audio-tag contract is the mechanism that makes
this work [`gdd-structure-model.md` Build §8–9]. One agent slot is reserved for this
constraint — it is the H15 hole that earns its place precisely because it is the
non-standard pipeline feature the dev-crew must not violate [`_index.md` §2 H15 ○○○].

---

## 4. The roster — ~5 agents + orchestrator

### Agent 0: Orchestrator (the "+1")

**Role.** Session-state coordinator; the only agent with cross-cutting authority. Sets
scope before any agent is called. Maintains the session-state file that every other
agent reads at start and writes to at end. Resolves conflicts between agents when their
outputs contradict. Does not generate content.

**Derived from:** the `producer` / `creative-director` split in `bullish0x` collapses
here to a single role because the 6-week scope cannot afford two meta-agents
[`recon.md` §5]. The orchestrator inherits the vision-holder function from
`narrative-designer-studio-role` — receiving creative direction, guarding pillars,
distributing filtered context to each agent [`narrative-designer-studio-role`].

**Input contract (JSON sketch):**
```json
{
  "session_goal": "string — one-sentence task for this run",
  "mode": "canned | live",
  "agents_to_call": ["agent_id", "..."],
  "context_files": ["path", "..."],
  "human_gate_required": true
}
```

**Output contract (JSON sketch):**
```json
{
  "session_id": "string",
  "dispatch_queue": [
    { "agent_id": "string", "input_bundle": "object", "gate_before_write": "bool" }
  ],
  "session_state_update": "path to active session-state file"
}
```

**Modes served:** both canned and live (meta-agent; always active).

**Realistic-capability check (PASS).** Orchestration — reading a state file, dispatching
named agents with typed input bundles, requiring approval before file writes — is
well-within demonstrated LLM agent capability. The orchestrator does not generate
creative content, which keeps its reliability high [`transcript` 21:39:59–21:40:16;
`building-ai-workers` "Human gate = style and fine-tuning only"].

---

### Agent 1: Narrative Architect

**Feature owned:** story architecture — the structural layer that tells every downstream
agent *what* the narrative system commits to, not individual line writing.

**Role.** Receives the GDD's Build §6 world-and-progression spec and the voice-style-guide
as context. Produces the seed-and-payoff map: for each NPC in the slice, a named
echo-template that defines what past-life event seeds which future-scene payoff. Also
produces the delta-storytelling contract: the rule that governs how each scene adds new
information rather than repeating prior information. Does NOT write individual dialogue
lines (that is Agent 2). Does NOT generate NPC rosters (Roc supplies those in Phase 3).

**Derived from:** the narrative-director archetype in `bullish0x` and `colonel1223`
[`recon.md` §5]; the vision-holder function in `narrative-designer-studio-role`; the
outline-first principle in `writing-books-with-ai` ("author writes a beat outline → dev-crew
story agent drafts prose"); the beats-as-world-states model from `procedural-narrative-generation`
(story-critical outcomes the game must reach while leaving path to player discovery).

**Input contract (JSON sketch):**
```json
{
  "slice_npcs": [
    { "npc_id": "string", "essence_descriptor": "string" }
  ],
  "locked_decisions": {
    "knowledge_travels_across_scenes": true,
    "soft_in_world_reminder": true,
    "no_pushed_mystery": true
  },
  "voice_guide_ref": "path",
  "scene_list": ["scene_id", "..."]
}
```

**Output contract (JSON sketch):**
```json
{
  "echo_templates": [
    {
      "npc_id": "string",
      "seed_scene": "scene_id",
      "seed_event": "string — past-life detail planted (≤25 words)",
      "payoff_scene": "scene_id",
      "payoff_condition": "string — what the player must have deduced first"
    }
  ],
  "delta_rule": "string — one-sentence governing principle for each scene's information add",
  "canon_flags": ["string — any locked decision that downstream agents must not violate"]
}
```

**Modes served:** canned (offline pipeline run; human reviews echo-template map before
Agent 2 is called).

**Realistic-capability check (PASS).** Producing a structured seed-and-payoff map from an
NPC list and a set of locked constraints is a templated generation task with named fields
and bounded scope. The output is a small JSON document, not open-ended prose — the agent
cannot hallucinate a "cool NPC" because the NPC list is a required input field. The delta
rule is a single sentence, not a generative system. Both are within demonstrated LLM
structured-output capability [`transcript` 21:37:05–21:37:47].

**Single-source flag.** The seed-and-payoff contract is grounded primarily in the
`writing-books-with-ai` outline-first principle and the KB's retrospective-significance
notes, which are numerous. The delta-storytelling rule has thinner formal sourcing
(derived from Frieren craft notes and the H9 narrative-pipeline framing). Flagged: the
delta rule's specific field format is a Phase-3 design task, not a KB-derived spec.

---

### Agent 2: Dialogue and Content Agent

**Feature owned:** all player-facing text — dialogue lines, lore entries, environmental
text, item descriptions — within the voice-style-guide's register.

**Role.** Receives an echo-template (from Agent 1) and a per-NPC essence descriptor.
Produces individual dialogue lines in JSON format. Each line carries a speaker ID, a
tone field drawn from a fixed enumeration, a maximum word count, and a canon-consistency
flag if any line appears to contradict a locked decision. Does NOT make structural
narrative decisions (that is Agent 1). Does NOT assign its own tones — the tone enum is
pre-specified in the voice-style-guide, not generated.

**Derived from:** the class transcript's direct example — "the content agent generates
NPC dialogue lines in JSON format. Each line includes the speaker ID, tone from a fixed
list of 5, max length of 40 words" [`transcript` 21:37:05–21:37:27]; the `writer` archetype
in `bullish0x` which "reads voice-profile; flags canon deviations to the director"
[`recon.md` §1]; the modular-characters pipeline's tier-2 surfacing priority (the single
most distinctive trait surfaced first) [`modular-characters-system-driven`]; the Tchaikovsky
and writing-books-with-ai voice-preservation principle that specificity at prompt-time
prevents AI tells [`writing-books-with-ai`].

**Input contract (JSON sketch):**
```json
{
  "npc_id": "string",
  "essence_descriptor": "string — single most surface-able trait",
  "echo_template": {
    "seed_event": "string",
    "payoff_condition": "string"
  },
  "scene_context": "scene_id",
  "tone_enum": ["quiet", "wistful", "matter_of_fact", "warm", "distant"],
  "max_words": 40,
  "voice_guide_ref": "path"
}
```

**Output contract (JSON sketch):**
```json
{
  "dialogue_lines": [
    {
      "speaker_id": "string",
      "tone": "quiet | wistful | matter_of_fact | warm | distant",
      "text": "string — ≤40 words",
      "scene_id": "string",
      "canon_flag": "null | string — describe deviation if detected"
    }
  ],
  "human_review_required": "bool — true if any canon_flag is non-null"
}
```

**Modes served:** canned primarily (offline content generation); live for the emergent-
partner wow beat (single runtime call, requires human-gate approval before write
[`recon.md` §4; `gdd-structure-model.md` Build §5]).

**Realistic-capability check (PASS).** Generating short, tonally-constrained prose from a
bounded template is the most robustly demonstrated LLM capability. The tone enum is fixed
(not generated). The word ceiling is enforced at the field level. The canon_flag is a
self-consistency check on a small context window — well within LLM capability
[`transcript` 21:37:05–21:37:47]. The hard limit (40 words) prevents the agent from
"going long" on a scene, which is the most common failure mode for dialogue generation.

---

### Agent 3: Canon Verifier (Consistency Satellite)

**Feature owned:** consistency — checking accumulated content output against the voice-
style-guide, the echo-template map, and the locked decisions (C1 knowledge-travels,
C3 no-pushed-mystery) before any content is committed to a file.

**Role.** Receives a batch of dialogue lines (Agent 2 output) and the current session-
state file (which accumulates all prior committed content). Checks each new line against
(a) the tone register defined in the voice-style-guide, (b) the echo-template map (does
this line plant or pay off in the correct scene), and (c) the locked decisions. Produces
a verification report: each item is PASS / FLAG with a specific reason. Does NOT generate
new lines. Does NOT make creative decisions. Flags only — human acts on flags.

**Derived from:** the `lore_master` pattern in `colonel1223` — the clearest dedicated
consistency agent in the three repos, whose sole job is to "read the prior narrative-
designer output and check new additions for internal consistency" [`recon.md` §3, §4];
the `bullish0x` typed-evidence-per-story QA discipline (Logic / Integration / Visual /
UI / Config story-types, each requiring typed evidence before Done) [`recon.md` §1];
the class Q&A on the consistency-verification agent pattern that "surfaced in the class
Q&A; a natural fit for our two-mode setup" [`RESYNTHESIS-PLAN.md` §5].

**Input contract (JSON sketch):**
```json
{
  "new_lines": [
    {
      "speaker_id": "string",
      "tone": "string",
      "text": "string",
      "scene_id": "string"
    }
  ],
  "session_state_ref": "path — accumulated committed content so far",
  "echo_template_ref": "path — Agent 1 output",
  "locked_decisions": {
    "knowledge_travels_across_scenes": true,
    "no_pushed_mystery": true,
    "tone_register": "quiet | flat | retrospective"
  }
}
```

**Output contract (JSON sketch):**
```json
{
  "verification_report": [
    {
      "speaker_id": "string",
      "scene_id": "string",
      "status": "PASS | FLAG",
      "flag_reason": "null | string — specific violation (≤30 words)",
      "flag_type": "null | tone_violation | canon_contradiction | echo_mismatch | register_drift"
    }
  ],
  "human_action_required": "bool — true if any FLAG is present",
  "summary": "string — one-sentence overall state of the batch"
}
```

**Modes served:** canned (runs after every Agent 2 batch; a required gate before
content is committed to the session-state file); live (same role — verifies the runtime
dialogue line before it is displayed, required human-gate before write).

**Realistic-capability check (PASS with caveat).** Checking a short text against a named
constraint set (tone enum, a list of locked decisions, a small echo-template) is a
bounded classification task — well within LLM capability. The caveat: this agent's
reliability degrades if the session-state file grows very large (long-context recall).
Mitigation: the session-state file should be summarized by the orchestrator after every
N committed lines, so the verifier always operates on a bounded context window. This is
a known architectural constraint, not a capability blocker [`godot-game-architecture`
"inject AI-generated content as a service that the context root binds — keeps it
swappable and testable"].

---

### Agent 4: Audio-Tag Agent

**Feature owned:** the audio-tag contract — the naming convention and auto-link rule that
makes the audio-first pipeline work as a differentiator.

**Role.** Receives a list of new game entities (NPCs, objects, scenes) and the current
audio-tag manifest. Produces a compliant tag set for each new entity: a string in the
pattern `<Entity>_<AnimVerb>_<State>` for each required audio trigger. Also checks
proposed tag strings against the manifest for collisions and naming-convention violations.
Does NOT generate audio content. Does NOT assign audio style or emotion — those live in
the going-big brief and the voice-style-guide. Assigns names and verifies format only.

**Derived from:** the audio-first USP spec in Build GDD §8 (`<Entity>_<AnimVerb>_<State>`
string pattern, auto-link rule, mirrored-tree convention) [`gdd-structure-model.md`
Build §8–9; `RESYNTHESIS-PLAN.md` §2 H15]; the `audio-director` and `sound-designer`
archetypes in `bullish0x` and `colonel1223` (distilled to the naming-contract function
only — the style and architecture work belongs to Roc in Phase 3) [`recon.md` §1, §3].

**Input contract (JSON sketch):**
```json
{
  "new_entities": [
    { "entity_id": "string", "entity_type": "npc | object | scene | spell" }
  ],
  "required_anim_verbs": ["string — from the locked four-family verb grammar"],
  "states": ["idle", "active", "triggered", "depleted"],
  "existing_manifest": "path — current audio tag manifest"
}
```

**Output contract (JSON sketch):**
```json
{
  "new_tags": [
    {
      "entity_id": "string",
      "tag_string": "string — <Entity>_<AnimVerb>_<State>",
      "audio_path": "string — Game/Audio/<Entity>/<AnimVerb>/",
      "animation_path": "string — Game/Animation/<Entity>/<AnimVerb>/",
      "collision_flag": "bool — true if tag string already exists in manifest"
    }
  ],
  "manifest_delta": "path — updated manifest with new tags appended",
  "violations": ["string — any tag string that fails the naming pattern"]
}
```

**Modes served:** canned only (naming is a pre-production design task; no runtime audio
generation in scope for a 6-week slice). Live audio generation is explicitly out of scope
[`GATE-2-review.md` C3; `gdd-structure-model.md` Build §10 slice contract].

**Realistic-capability check (PASS).** String generation against a fixed pattern is
trivially within LLM capability. Collision detection against a manifest is a lookup task.
Pattern-compliance checking is classification. None of these require creative judgment;
all have verifiable correct/incorrect outputs. The agent's scope is deliberately narrow —
it names and verifies, it does not design the audio system.

---

### Agent 5: Scope Guard (QA / Playtest Satellite)

**Feature owned:** scope protection and quality gating — the meta-level check that runs
after a content batch and verifies that nothing violates the design pillars or the
Van Buren over-specification guardrails.

**Role.** Receives a completed section of the Build GDD (or a batch of NPC content) and
the pillar list. Flags any content that (a) violates a Non-Goal (co-op, dexterity/timing,
simulated world systems), (b) exceeds the slice contract (too many locations, too deep a
puzzle chain), or (c) fails the cozy-rhythm test (any action that hard-stalls the player,
any failure state that lacks informational feedback). Produces a scope report. Also
simulates the three player archetypes from the colonel1223 `playtester` pattern
(discovery-driven / emotionally-engaged / puzzle-solver) and flags moments where one
archetype would disengage. Does NOT generate new content. Does NOT make design decisions.
Flags only — human acts on flags.

**Derived from:** the `playtester` and `qa-lead` archetypes in `colonel1223` and
`bullish0x` [`recon.md` §3, §5]; the class transcript's instruction to "have agents look
at your document, identify what is going to be the heaviest lift" [`transcript`
21:43:35–21:43:52]; the Van Buren over-specification guardrail set (G1–G10) built into
the GDD structure model, which governs the Build section the scope guard checks against
[`gdd-structure-model.md` §7]; the "realistic-capability check" framing that is itself
graded — agents must flag scope before it is built, not after [`transcript` 21:39:42–
21:40:16].

**Input contract (JSON sketch):**
```json
{
  "content_batch": "object — a GDD section or NPC content block",
  "design_pillars": ["string — each pillar as a phrase"],
  "non_goals": ["co-op", "dexterity_timing", "simulated_world_systems"],
  "slice_contract": {
    "max_locations": "int",
    "max_puzzle_chain_depth": "int",
    "failure_state_rule": "soft only — wrong action teaches why"
  },
  "van_buren_guardrails": ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"]
}
```

**Output contract (JSON sketch):**
```json
{
  "scope_report": [
    {
      "item": "string — content or mechanic being assessed",
      "status": "PASS | FLAG",
      "flag_type": "null | non_goal_violation | slice_overflow | van_buren | cozy_rhythm_break",
      "flag_detail": "null | string — specific problem (≤40 words)",
      "archetype_flag": "null | discovery | emotional | puzzle — which archetype disengages"
    }
  ],
  "human_action_required": "bool",
  "summary": "string — one-sentence scope health for this batch"
}
```

**Modes served:** canned (runs as a gate before any content batch moves to committed
status). Not needed in live mode (live mode is a single bounded wow-beat call, not a
content batch).

**Realistic-capability check (PASS with caveat).** Checklist-style compliance against
a named pillar list and a slice contract is a classification task within LLM capability.
The multi-archetype simulation is a framing technique (instruct the model to consider
three named perspectives) — demonstrated in the `playtester` pattern without complex
machinery [`recon.md` §3]. The caveat: pillar violations that are *subtle* (a mechanic
that technically avoids dexterity but creates anxiety under time pressure) may be
missed. Mitigation: the pillar list includes the negative test ("if a mechanic needs a
second player, cut it" — G1; "recall/pairing/pattern gate replaces twitchy input" — G8)
so the agent can classify against stated behavioral consequences, not just labels
[`gdd-structure-model.md` §7 G8].

---

## 5. Roster summary table

| # | Agent | Feature | Mode | Key I/O |
|---|---|---|---|---|
| 0 | **Orchestrator** | Session state, dispatch, human gate | Both | In: session goal + agent queue; Out: dispatch bundle + session-state update |
| 1 | **Narrative Architect** | Story structure — echo-templates, delta rule | Canned | In: NPC list + locked decisions; Out: echo-template map + canon flags |
| 2 | **Dialogue and Content Agent** | Player-facing text — dialogue lines, lore, env text | Canned / Live* | In: essence descriptor + echo template + tone enum; Out: JSON dialogue lines with tone field |
| 3 | **Canon Verifier** | Consistency — checks batches against voice-guide + locked decisions | Both | In: new lines + session state; Out: verification report (PASS / FLAG per line) |
| 4 | **Audio-Tag Agent** | Audio-tag contract — naming convention + auto-link manifest | Canned | In: new entities + verb grammar; Out: compliant tag strings + manifest delta |
| 5 | **Scope Guard** | QA / scope — pillar compliance + slice-contract + Van Buren guardrails | Canned | In: content batch + pillar list + slice contract; Out: scope report (PASS / FLAG per item) |

*Agent 2 serves live mode for a single bounded wow-beat call only; all other live-mode
calls require human-gate approval before any file write.

**Total: 5 agents + 1 orchestrator. Cap met [`transcript` 21:53:38].**

---

## 6. The human-gate map (approval-before-write discipline)

The bullish0x approval-before-write pattern maps cleanly to our two-mode architecture
[`recon.md` §4]. The orchestrator enforces it:

| Trigger | Gate type | Who acts |
|---|---|---|
| Any FLAG from Agent 3 (Canon Verifier) | Hard gate — content not committed until Roc reviews and clears | Roc |
| Any FLAG from Agent 5 (Scope Guard) | Hard gate — content batch held; pillar violation cannot ship | Roc |
| Agent 2 called in live mode (wow beat) | Hard gate — generated line shown; Roc approves before display | Roc |
| Agent 4 manifest delta (new tags) | Soft gate — Roc reviews manifest diff; auto-commit after N minutes if no response | Roc (optional) |
| Clean batch (no flags) | No gate — orchestrator commits to session state automatically | — |

This map answers the class's "agent role clarity" criterion: each agent's scope ends
precisely where a human gate begins [`transcript` 21:51:40–21:51:55].

---

## 7. The session-state bus (inter-agent handoff protocol)

The coordination artifact that makes this crew function without a complex orchestration
framework is a single session-state file — the bullish0x `active.md` pattern adapted to
our content pipeline [`recon.md` §4 grammar point 1]:

```
session-state.json
  session_id
  mode: canned | live
  committed_content: [ dialogue_line | echo_template | audio_tag ]
  open_flags: [ canon_flag | scope_flag ]
  agents_completed: [ agent_id ]
  human_review_queue: [ item_needing_review ]
```

Every agent reads the file at start. Every agent writes its output to it on completion
(pending gate). The orchestrator resolves open flags before dispatching the next agent.
This keeps inter-agent context coherent without a complex message-passing system, and
keeps the human's review surface in one place — not distributed across five separate
output files [`building-ai-workers` "the worker holds the memory, not the human"].

---

## 8. What this crew cannot build (realistic-capability boundaries)

This section applies the "can an agent actually build this?" check to features that might
be requested and must be refused [`transcript` 21:39:42–21:40:30]:

| Requested feature | Why it fails the check | Where it belongs |
|---|---|---|
| "Generate the full NPC roster" | H1 (NPC roster) is ○○○ in the KB — Roc supplies it; there is no grounded content for an agent to generate from [`_index.md` §2 H1] | Roc, Phase-3 interview |
| "Produce the magic-word system" | H6 is ●●○ (rules-limits-costs discipline present; actual spell list is Roc's call) [`_index.md` §2 H6] | Roc, Phase-3 |
| "Auto-generate scene composition for 'going big' moments" | The going-big pole is intentionally left open to experiment (D1b); no committed style spec exists yet [`GATE-2-review.md` D1b] | Round-B going-big-brief; Roc |
| "Spec the token budget" | H13 is ○○○ — context windows and API cost per call are Phase-3 math [`_index.md` §2 H13] | Phase-3 estimation |
| "Build the interaction matrix" | H8 is ●○○ — informational-feedback law validated; the full families × target-types matrix is Phase-3 spec work [`_index.md` §2 H8] | pnc-grammar + Phase-3 |
| "Generate red-herring content" | Van Buren G4: red-herring content volume = asset budget we don't have [`gdd-structure-model.md` §7 G4] | Parking-Lot |

---

## 9. Thin spots and open flags (honest accounting)

**Flag 1 — Agent 1 delta rule is under-sourced.** The seed-and-payoff structure is
grounded across multiple KB notes (retrospective significance, ambient-detail→payoff,
H9 narrative-pipeline framing). The *specific JSON field contract* for the delta
rule is Phase-3 design, not KB-derived. Named as an open question for Phase 3, not
a resolved spec [`_index.md` §3.4 H11].

**Flag 2 — Agent 3 (Canon Verifier) long-context degradation.** The realistic-capability
check passes with the constraint that the session-state file must be kept bounded.
The orchestrator's summarization step is implied here but not yet specified — it is a
Phase-3 orchestration detail. Named as a dependency: the orchestrator spec must include
a summarization cadence before the Canon Verifier can be considered fully designed
[`godot-game-architecture` watch-out: injection depth beyond 2 levels signals an
architecture problem].

**Flag 3 — Audio-Tag Agent depends on the Phase-3 verb grammar.** The `required_anim_verbs`
field in Agent 4's input contract inherits from the four-family verb grammar (Collect /
Make / Show-Ask / Use) [`gdd-structure-model.md` Build §4]. The sub-verb list within
each family is not yet decided (flagged as "park undecided sub-verbs" in Build §4). The
tag agent can only produce compliant strings once the sub-verb list is specced. Named
as a dependency: Agent 4 is blocked on the Phase-3 pnc-grammar + verb-table work
[`_index.md` §2 H5 ●●○].

**Flag 4 — The Pitch GDD's P5 ("one agent, one wow") depends on a single confident anchor.**
The class transcript's emergent-partner wow beat is the canonical anchor for Agent 2's
live-mode call [`gdd-structure-model.md` Build §5 thin-spots note]. All other agents are
named open questions in P5. This lens supplies the Build §5 detail, but the Pitch's P5
remains rightly thin until the Build §5 schema is confirmed [`gdd-structure-model.md`
§9 honest-spots P5].

**Flag 5 — Scope Guard's multi-archetype simulation is an analogy, not a validated tech.**
The colonel1223 `playtester` pattern is a framing technique, not a tested playtest
framework for this game type. It provides useful design vocabulary (Explorer / Achiever
/ Storyteller maps to discovery / emotional / puzzle archetypes for a P&C deduction game)
but its reliability as a QA gate is anecdotal. Human playtesting and peer review
[`transcript` 21:35:11–21:35:28] remain the primary quality signals; the Scope Guard is
a pre-human-QA filter, not a replacement.
