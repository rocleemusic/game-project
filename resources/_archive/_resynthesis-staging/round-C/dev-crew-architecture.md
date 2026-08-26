---
kind: synthesis artifact
artifact: dev-crew-architecture
sources:
  - _resynthesis-staging/round-C/lens-1-kb-grounded.md
  - _resynthesis-staging/round-C/lens-2-external-archetype.md
  - _resynthesis-staging/round-C/lens-3-class-spec.md
  - _resynthesis-staging/round-C/recon.md
  - _resynthesis-staging/round-C/COMPARE.md
  - knowledge-base/synthesis/_resynthesis-staging/round-A/gdd-structure-model.md
  - knowledge-base/ai-workflow/building-ai-workers.md
  - knowledge-base/ai-workflow/godot-game-architecture.md
  - knowledge-base/narrative/narrative-designer-studio-role.md
  - knowledge-base/narrative/modular-characters-system-driven.md
  - knowledge-base/narrative/narrative-lego-ken-levine.md
  - knowledge-base/narrative/writing-books-with-ai.md
  - knowledge-base/narrative/procedural-history-caves-of-qud.md
  - knowledge-base/narrative/procedural-narrative-generation.md
  - knowledge-base/narrative/player-driven-stories.md
  - knowledge-base/narrative/ink-narrative-scripting-language.md
  - knowledge-base/narrative/greyboxing-narrative-story-languages.md
  - knowledge-base/narrative/efficiently-branching-narrative.md
  - resources/concept-dig-notes.md
  - knowledge-base/RESYNTHESIS-PLAN.md
  - knowledge-base/_index.md
  - GATE-2-review.md
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt
built: "Phase 2.5 resynthesis (2026-07-17)"
serves:
  - H11
  - H10
status: "STAGED candidate for GATE 2"
---

# Dev-Crew Architecture — the Five-Worker Pipeline + Orchestrator

**How to use this.** This is the content for **Build GDD §5b** — the dev-crew pipeline roster the
Build doc hands off to agents [`gdd-structure-model.md` §4 Build §5]. It names five worker agents plus
one orchestrator, and for each gives a role definition, an I/O sketch at JSON altitude where it fits,
when it is called, its human gate, and a realistic-capability check — the exact fields the class rubric
grades [`transcript` 21:37:05–27; 21:51:21–40]. It is the blend the Round-C compare recommends across the
three lenses; the adjudication reasoning lives in the companion `COMPARE.md`. **It does not invent
content** — no NPCs, items, spells, story, or mechanics; those are Roc's to supply in Phase 3
[`GATE-2-review.md` B3; `RESYNTHESIS-PLAN.md` §5]. It covers **H11, the thinnest required section**
[`_index.md` §3.4]; where a claim rests on a single thin source it is flagged inline and re-listed in
§8. Read `COMPARE.md` first if you want to know *why* the roster looks like this; read this if you want
to know *what it is*.

**Scope boundary, stated once.** This is the **dev-pipeline crew (H11)** — agents that run *during
development* to generate and quality-check content before it ships. It is **not** the in-game runtime
agents (H10 + the emergent-partner "wow"), which are a separate architecture for **Build §5a** — a hard
guardrail [`RESYNTHESIS-PLAN.md` §5 "two contexts, kept distinct"]. Where an H11 agent must *produce a
schema the runtime later reads*, that is noted as a handoff, not built here.

> **Revised at GATE 2 (Roc's calls).** Two changes fold Roc's GATE-2 decisions into the auto-run's
> recommendation (which the companion `COMPARE.md` still records as first drafted): **(1)** QA is
> **promoted from an orchestrator-invoked pass to a standing worker** (Agent 5, §7A) — it owns a
> distinct feature (structure & function) the Consistency Verifier does not cover — and the **~5-agent
> cap is treated as soft guidance, not a hard rule**, governed by *"each role needs a clear why"*
> (§1); a short **expansion-candidates** tier (§8A) captures further roles Roc named. **(2)** The
> runtime state system is clarified as **deterministic mechanics, not an LLM agent** (§8), because the
> shipped game must run without an LLM. Where this file and `COMPARE.md` differ, this file governs.

---

## 1. The three design principles the crew obeys

Every agent slot below earns its place against three principles drawn straight from the KB and the class.

**One agent per feature; each role needs a clear why. ~5 + orchestrator is class-scope guidance, not a
hard ceiling.** The class names ~5 agents + orchestrator as the *class-scope* target — more than that
*for a class slice* suggests over-scoping [`transcript` 21:53:38–21:54:11] — and pairs it with the real
rule: *"one game feature should be handled by an agent... having an agent that already has all of the
context for that feature"* [`transcript` 21:54:45–21:55:28]. The governing principle here is that rule,
not the count: **every slot must justify itself with a clear why (SRP + a passing realistic-capability
check); the crew stays lean by default and grows only when a genuine, distinct feature earns a seat.**
Applied: absorption beats proliferation — where two concerns are really one feature (story structure and
its echo/seed logic), they share an agent; where a concern is a genuinely separate feature owning a
distinct hole (the audio-tag contract, H15; structural/functional QA), it gets its own slot. Roles that
are real but not yet needed for the class slice are parked as **expansion candidates** (§8A), not forced
into the core. This is the KB's worker-decomposition mindset: *"the system grows by appending specialized
workers, not by expanding any single one"* [`building-ai-workers`].

**Call down, signal up — agents never reach sideways.** The dependency direction comes from the Godot
architecture note: *"a node calls methods directly on its children; it never needs to know about its
parent. Events bubble up via signals"* [`godot-game-architecture`]. In crew terms: the orchestrator hands
each agent a prepared input and collects a typed output; no worker calls another worker directly. This is
what makes each agent testable in isolation and keeps the pipeline free of the cyclical-dependency failure
mode the same note names [`godot-game-architecture`]. The mechanism that realizes this rule is a shared
**session-state artifact** (below).

**Human gate at the output, not inside the chain.** The exit condition from the AI-workers note: *"the
human's role collapses to final creative stamp — not execution of steps"* [`building-ai-workers`],
modified by its own watch-out for a cozy narrative game: *"cozy rhythm means broken output mid-run can't
be silently swallowed"* [`building-ai-workers`]. So the gate lives at the Verifier's output and at two
explicit checkpoints (persona/echo review before content propagates; canon-check before ship), never as an
accidental mid-chain stall. The two-mode split governs *when* the gate fires (below).

---

## 2. The two-mode architecture, mapped to the crew

The game's AI runs in two locked modes [`gdd-structure-model.md` §4 Build §5; `RESYNTHESIS-PLAN.md` §2]:

- **Canned mode** — content is pre-generated during development and surfaced at runtime from a static
  library; no live LLM call during play. **This is the mode the dev-crew runs in.** For the overnight /
  unattended pipeline, canned mode may run without stopping at each gate [`RESYNTHESIS-PLAN.md` override].
- **Live mode** — an optional runtime LLM call for a named "wow" beat (the emergent-partner moment).
  Live mode requires an explicit human-approval gate before any content is written
  [`recon.md` §4 Pattern D].

The crew supports both **without spawning separate runtimes**: the mode is a declared flag on the
orchestrator's input, and each agent's I/O contract states how its gate behaves per mode
[`lens-2` §3 mode-selector, from `guangyuspace`; `lens-3` §2]. One flag shifts the gate behavior of the
whole crew simultaneously. The generation spine (Orchestrator → Narrative Architect → Content Agent →
Audio-Tag Agent) accumulates context forward [`recon.md` §4 Pattern C, from `colonel1223`]; the Consistency
Verifier is a **satellite** called after each content batch — it reads the chain's output, it does not
contribute to it [`recon.md` §5]. The audio-first pipeline (H15) is a locked USP the whole crew must not
violate; the Audio-Tag Agent owns its contract [`gdd-structure-model.md` §4 Build §8].

**The session-state artifact is the bus.** Every agent reads it at start and writes its completed output
back; the orchestrator reads the bus and decides what runs next [`recon.md` §4 Pattern A, from
`bullish0x`]. This realizes the call-down/signal-up rule (§1) as a concrete mechanism and keeps the human's
review surface in one place. Its field schema is a Phase-3 design task (§8).

---

## 3. Agent 0 — Orchestrator (the manager)

**Feature owned:** sequencing and gate-keeping — *not* vision, *not* content. The orchestrator frames
scope before any worker is called, reads the session-state artifact, determines which pipeline stage runs
next, hands the chosen worker its prepared input bundle, collects the typed output, updates the bus, and
surfaces the human-gate checkpoints. It resolves conflicts when two agents' outputs disagree, and it runs
the on-demand stress-test pass (§9). It holds the *vision-holder* wiring function from
`narrative-designer-studio-role` — *"receives high-level vision from leadership, distributes filtered
knowledge to each department"* [`narrative-designer-studio-role`] — distributing *what each agent needs,
not everything*. It does not generate content or make creative decisions.

**Why it earns its place.** All three repos converge on this role as the only one with cross-cutting
authority [`recon.md` §1–3]; the `godot-game-architecture` note names cyclical inter-feature dependencies
as the failure mode an orchestrator-that-routes-rather-than-reasons eliminates [`godot-game-architecture`].

**Input (JSON sketch):**
```json
{
  "session_goal": "string — one-sentence task for this run",
  "mode": "canned | live",
  "pipeline_stage": "schema | greybox | prose | canon_check",
  "agents_to_call": ["agent_id", "..."],
  "session_state_ref": "path — the shared bus artifact",
  "human_gate_required": "bool"
}
```
**Output (JSON sketch):**
```json
{
  "session_id": "string",
  "dispatch_queue": [
    { "agent_id": "string", "input_bundle": "object", "gate_before_write": "bool" }
  ],
  "session_state_update": "path — updated bus artifact",
  "surfaced_gates": ["string — checkpoint prompts awaiting human sign-off"]
}
```
**When called:** always first in a run; and again after each worker completes, to update the bus and
decide continue-or-surface.
**Human gate:** in **canned** mode it routes without stopping (unattended per the override); in **live**
mode it surfaces the proposed routing for approval before each worker call [`recon.md` §4 Pattern D;
`RESYNTHESIS-PLAN.md` override]. It never silently swallows a broken worker output [`building-ai-workers`].
**Realistic-capability check — PASS.** Reading a state file, dispatching named agents with typed bundles,
and requiring approval before writes is well within demonstrated agent capability; because it generates no
creative content its reliability stays high [`transcript` 21:39:59–21:40:16; `building-ai-workers`].

---

## 4. Agent 1 — Narrative Architect (Schema stage)

**Feature owned:** story architecture — the structural layer that tells every downstream agent *what* the
narrative commits to, without writing a single player-facing line. This one agent holds three folded
sub-functions the compare deliberately kept together as *one feature* (COMPARE Decisions A and B):
1. **Seed-and-payoff / echo map** — which past-life detail seeds which future-scene payoff, and the
   condition the player must have deduced first. This is the retrospective-significance engine at pipeline
   altitude — *"the ordinary detail that detonates only when something is later true"*
   [`concept-dig-notes`; folded here rather than given a separate agent, per COMPARE Decision A].
2. **Persona-card schema** — for each Roc-supplied NPC seed, the agent fills the orthogonal-trait card
   (independently-set trait axes, a single essence-descriptor, a suit tag, ~5–10% authored exceptions).
   The card *structure* is the KB's guard against homogenization; the card *content* comes from Roc's
   seeds [`modular-characters-system-driven`; `GATE-2-review.md` A1; COMPARE Decision B].
3. **Delta-storytelling rule + canon flags** — the one-sentence governing rule that each scene adds new
   information rather than repeating prior information, plus the locked decisions downstream agents must
   not violate (C1 knowledge-travels, superposition rule).

It does **not** write dialogue (Agent 2), does **not** check consistency (Agent 3), and does **not**
invent NPCs — the NPC list is a *required input field*, so the agent cannot hallucinate a roster
[`lens-3` Agent 1; `GATE-2-review.md` B3; `_index.md` §2 H1 ○○○].

**KB grounding.** The role boundary (architecture, not line-writing) is the studio-role note: *"narrative
designers receive high-level vision... then distribute filtered knowledge to each department"*
[`narrative-designer-studio-role`]. The outline-first sequence is `writing-books-with-ai` (*"author writes
a beat outline → dev-crew story agent drafts prose"*) [`writing-books-with-ai`]. The production sequencing
(*"story first, branches second, choices last"*) and the greybox-first discipline (*"structurally-valid
placeholder before final prose"*) come from `efficiently-branching-narrative` and
`greyboxing-narrative-story-languages` [`efficiently-branching-narrative`;
`greyboxing-narrative-story-languages`]. The persona-card pipeline is `modular-characters-system-driven`
[`modular-characters-system-driven`].

**Input (JSON sketch):**
```json
{
  "slice_npcs": [
    { "npc_id": "string", "essence_hints": ["string — Roc-supplied seed"], "suit_tag": "enum — Roc-assigned" }
  ],
  "scene_list": ["scene_id", "..."],
  "locked_decisions": {
    "knowledge_travels_across_scenes": true,
    "soft_in_world_reminder": true,
    "superposition_rule": true
  },
  "voice_guide_ref": "path"
}
```
**Output (JSON sketch):**
```json
{
  "persona_cards": [
    {
      "npc_id": "string",
      "trait_axes": [ { "axis": "string", "value": "string" } ],
      "essence_descriptor": "string — single most surface-able trait",
      "suit_tag": "enum",
      "authored_exceptions": ["string — handwritten lines that break the generator's rules"]
    }
  ],
  "echo_templates": [
    {
      "npc_id": "string",
      "seed_scene": "scene_id",
      "seed_event": "string — past-life detail planted (≤25 words)",
      "payoff_scene": "scene_id",
      "payoff_condition": "string — what the player must have deduced first"
    }
  ],
  "delta_rule": "string — one-sentence per-scene information-add principle",
  "canon_flags": ["string — locked decision downstream agents must not violate"]
}
```
**When called:** Schema stage, once per pipeline run (or per major slice iteration), always before any
Content Agent call; re-run if the slice Age or act structure changes.
**Human gate:** yes — Roc reviews the persona cards and echo map before they propagate downstream. The
persona card is the canon document for an NPC; an error here propagates to every interaction. Low-cost
early checkpoint by design [`building-ai-workers` watch-out].
**Realistic-capability check — PASS.** Producing a structured seed-and-payoff map and orthogonal-trait
cards from a *supplied* NPC list plus locked constraints is bounded structured-output generation, not
open-ended prose [`transcript` 21:37:05–47]. The output schema enforces trait orthogonality by
construction — axes are named and independently valued, so the `modular-characters-system-driven`
correlated-trait watch-out is guarded at the field level [`modular-characters-system-driven`].
**Single-source flag.** The **delta-storytelling rule's specific field format** is Phase-3 design, not
KB-derived — it is grounded in the Frieren retrospective-significance craft (numerous notes) but has no
formal I/O precedent [`lens-3` §9 flag 1; `_index.md` §3.4].

---

## 5. Agent 2 — Content / Dialogue Agent (Prose stage)

**Feature owned:** all player-facing text — NPC dialogue lines, lore entries, environmental text, object
descriptions, echo fragments — within the voice-style-guide's register. It takes a persona card + an echo
template + a scene context and emits finished content, one slot per call. It makes **no** structural
decisions (no new branches, no state assignments — that is Agent 1) and does **not** assign its own tones
(the tone enum is fixed in the voice-style-guide, not generated). This is the *department translator*
function — *"renders decisions as dialogue specs"* [`narrative-designer-studio-role`].

**KB grounding.** This is the class's canonical worked example, and it maps here exactly: *"the content
agent generates NPC dialogue lines in JSON format. Each line includes the speaker ID, tone from a fixed
list of 5, max length of 40 words"* [`transcript` 21:37:05–27]. The multi-pass editing gate is
`writing-books-with-ai` (*"dev-crew story agent drafts prose → human editor removes AI tells and reinforces
voice"*) [`writing-books-with-ai`]. The grammar-template-with-slots I/O shape is the entity-event model
from `procedural-history-caves-of-qud` (*"text templates contain symbol slots expanded by rules that
consult entity state"*) — the template *is* the scaffold; the Content Agent fills the slots
[`procedural-history-caves-of-qud`].

**Input (JSON sketch):**
```json
{
  "npc_id": "string",
  "persona_card": "object — from Agent 1 (essence_descriptor + trait axes)",
  "echo_template": { "seed_event": "string", "payoff_condition": "string" },
  "scene_context": { "scene_id": "string", "time_of_day": "enum", "world_state_excerpt": "object" },
  "tone_enum": ["quiet", "wistful", "matter_of_fact", "warm", "distant"],
  "voice_register": "flat | warmth-swell | retrospective",
  "max_words": 40,
  "voice_guide_ref": "path"
}
```
**Output (JSON sketch):**
```json
{
  "content_lines": [
    {
      "content_id": "string",
      "speaker_id": "string",
      "tone": "quiet | wistful | matter_of_fact | warm | distant",
      "text": "string — ≤40 words (dialogue) / ≤60 (object description)",
      "scene_id": "string",
      "echo_flag": "bool",
      "canon_flag": "null | string — describe deviation if the agent detects one"
    }
  ],
  "human_review_required": "bool — true if any canon_flag non-null or any echo_flag / retrospective line"
}
```
**When called:** Prose stage, after the scaffold is locked and persona cards are approved; per content
slot — one call, one block. Batching is the orchestrator's job.
**Modes:** canned primarily; **live** for the single bounded emergent-partner wow beat only (a runtime
call requiring the human gate before write) [`recon.md` §4; `gdd-structure-model.md` Build §5;
`lens-3` Agent 2].
**Human gate:** an automated AI-tell / voice-drift pre-pass flags markers first; then Roc reviews only the
flagged lines — mandatory human review for any line with `echo_flag: true` or a `retrospective` register
[`writing-books-with-ai`]. Clean lines advance automatically.
**Realistic-capability check — PASS.** Short, tonally-constrained prose from a bounded template is the most
robustly demonstrated LLM capability; the tone enum is fixed, the 40-word ceiling is enforced at the field
level (preventing the "going long" failure mode), and the `canon_flag` is a self-consistency check on a
small window [`transcript` 21:37:05–47]. The residual risk is voice drift over many calls, addressed by
the tell-detection pre-pass before human review [`writing-books-with-ai`].
**Dual-context note (handoff, not scope-creep):** the same `speaker_id / tone / text` shape the game engine
reads at runtime — no translation layer — which is why the live-mode wow beat reuses this agent rather than
a new one [`lens-1` §3 Agent 3 dual-context note].

---

## 6. Agent 3 — Consistency Verifier (Canon-check satellite)

**Feature owned:** consistency — reads accumulated content and checks each new addition against a **finite
canon-invariant set** and the voice register, before anything is committed. It **flags only**: it does not
generate, does not rewrite, does not auto-repair. Its output is a deviation report a human clears. This is
the *continuity keeper* — *"knows reasons; defends coherence under stress-tests"*
[`narrative-designer-studio-role`] — and it is the **consistency/verification-agent pattern the runbook
told us to watch for** [`RESYNTHESIS-PLAN.md` §5].

**The check-set is the game's own locked rules** (this is what makes the verifier reliable rather than an
open-ended "quality" judge — the invariants are concrete and checkable [`lens-1` §3 Agent 4]):
- **superposition rule** — before solidification there is no fact, only leanings; once collapsed, a fact
  is permanent [`concept-dig-notes` Session 7];
- **role-boundary law** — roles are fixed within a life; the re-roll surface opens only at life
  boundaries [`concept-dig-notes` Session 7];
- **essence-vs-role discipline** — personality cards persist across role shuffles (the cross-life
  recognition tool) [`concept-dig-notes` Session 8];
- **informational-feedback law** — a wrong action always teaches, never a blank acknowledgment
  [`concept-dig-notes` Session 2];
- **C1 knowledge-travels** — knowledge carries across scenes/years with a soft in-world reminder
  [`GATE-2-review.md` C1];
- **voice register** — lines match the flat-register contract [`voice-style-guide`].

**KB + repo grounding.** The pattern's clearest template is `colonel1223`'s `lore_master` — *the only agent
in the three repos whose sole job is reading an upstream content artifact and checking new additions for
internal consistency* [`recon.md` §3, §6]. The `bullish0x` `qa-lead` supplies the typed-evidence discipline
(Logic/Integration/Visual/UI/Config → our Narrative-Logic/Consistency/Register/Pacing) [`recon.md` §1].
The need itself is the `building-ai-workers` watch-out: *"broken output mid-run can't be silently
swallowed"* [`building-ai-workers`], and the specific failure mode to catch is the
`procedural-history-caves-of-qud` coherence rule: *"generated dialogue must at minimum be self-consistent
within a session"* [`procedural-history-caves-of-qud`].

**Input (JSON sketch):**
```json
{
  "new_lines": [ { "content_id": "string", "speaker_id": "string", "tone": "string", "text": "string", "scene_id": "string" } ],
  "active_canon": {
    "persona_cards": ["object"],
    "echo_templates": ["object"],
    "solidification_scores": "object",
    "locked_roles": "object"
  },
  "session_state_ref": "path — accumulated committed content (bounded; see caveat)",
  "invariant_set": ["superposition", "role_boundary", "essence_vs_role", "informational_feedback", "knowledge_travels", "voice_register"]
}
```
**Output (JSON sketch):**
```json
{
  "verification_report": [
    {
      "content_id": "string",
      "scene_id": "string",
      "status": "PASS | FLAG",
      "flag_type": "null | superposition | role_boundary | essence_vs_role | feedback_law | canon_contradiction | register_drift | echo_mismatch",
      "flag_reason": "null | string — specific violation (≤30 words)"
    }
  ],
  "human_action_required": "bool — true if any FLAG present",
  "summary": "string — one-sentence batch state"
}
```
**When called:** Canon-check stage, after every Content Agent batch, before any content is committed. Also
at the session-boundary snapshot to catch cross-session contradictions before they persist. In canned mode
runs async after each batch; in live mode runs synchronously before the generated line is committed.
**Human gate:** **always human-gated** — the Verifier produces a report; no flagged content is committed
without human sign-off. Non-negotiable in both modes. PASS results route to the orchestrator silently; the
Verifier never auto-repairs [`recon.md` §3].
**Realistic-capability check — PASS with caveat.** Checking short text against a named constraint set is a
bounded classification task, well within capability [`transcript` 21:37:05–47]. **Caveat:** reliability
degrades if the session-state file grows large (long-context recall) — so the orchestrator must summarize
the bus after every N committed lines, keeping the Verifier's context bounded. This is a named
architectural dependency, not a blocker [`lens-3` Agent 3; `godot-game-architecture` injection-depth
watch-out].
**Thin-source flag.** The verifier's *agent shape* rests on a single repo (`lore_master`) plus one runbook
Q&A mention — no dedicated KB note develops it [`lens-2` §5; `lens-1` §3 Agent 4]. Its *check-set*, by
contrast, is well-grounded in the locked design. Flag the shape for Roc at GATE 2.

---

## 7. Agent 4 — Audio-Tag Agent (audio-first USP contract)

**Feature owned:** the audio-tag contract — the naming convention and auto-link rule that makes the
audio-first pipeline (H15) work as the game's differentiator. It takes a list of new game entities plus the
current audio-tag manifest and produces a compliant tag string per required audio trigger in the pattern
`<Entity>_<AnimVerb>_<State>`, checking each proposed string against the manifest for collisions and
naming-convention violations. It generates **no audio content** and assigns **no** audio style or emotion
(those live in the going-big brief and Roc's Phase-3 work) — it names and verifies format only
[`gdd-structure-model.md` Build §8–9; `lens-3` Agent 4].

**Why it earns the fifth slot** (COMPARE Decision A): it owns a hole no other agent can absorb (H15, ○○○
[`_index.md` §2 H15]); its I/O is the cleanest in the crew (string generation against a fixed pattern +
manifest lookup — verifiable correct/incorrect outputs, no creative judgment); and it is a graded USP. The
audio-as-object rule inherits the full object-verb set — sounds are pack-free collectibles, show-able,
gift-able, spell-component candidates [`concept-dig-notes` Session 8; `gdd-structure-model.md` Build §8].

**KB grounding.** The USP spec (the `<Entity>_<AnimVerb>_<State>` string pattern, the auto-link directory
rule, the mirrored-tree convention) is Build §8–9 [`gdd-structure-model.md` Build §8–9]. The role is
distilled from the `bullish0x` `audio-director` and `colonel1223` `sound_designer` archetypes — narrowed
to the naming-contract function only, since the style and architecture work is Roc's [`recon.md` §1, §3].

**Input (JSON sketch):**
```json
{
  "new_entities": [ { "entity_id": "string", "entity_type": "npc | object | scene | spell" } ],
  "required_anim_verbs": ["string — from the locked four-family verb grammar (Collect/Make/Show-Ask/Use)"],
  "states": ["idle", "active", "triggered", "depleted"],
  "existing_manifest": "path — current audio-tag manifest"
}
```
**Output (JSON sketch):**
```json
{
  "new_tags": [
    {
      "entity_id": "string",
      "tag_string": "string — <Entity>_<AnimVerb>_<State>",
      "audio_path": "string — Game/Audio/<Entity>/<AnimVerb>/",
      "animation_path": "string — Game/Animation/<Entity>/<AnimVerb>/",
      "collision_flag": "bool — true if the tag string already exists in the manifest"
    }
  ],
  "manifest_delta": "path — updated manifest with new tags appended",
  "violations": ["string — any proposed tag that fails the naming pattern"]
}
```
**When called:** Schema/pre-production stage, whenever new entities enter the slice. Canned only — live
audio generation is explicitly out of scope for a 6-week slice [`GATE-2-review.md` C3;
`gdd-structure-model.md` Build §10].
**Human gate:** soft — the naming pattern is structural and may run unattended; the orchestrator surfaces
the manifest delta for review and auto-commits after a set window if no objection [`lens-3` §6].
**Realistic-capability check — PASS.** String generation against a fixed pattern is trivially within
capability; collision detection is a manifest lookup; pattern-compliance is classification — all have
verifiable correct/incorrect outputs and need no creative judgment [`transcript` 21:39:42–21:40:16].
**Dependency flag.** The `required_anim_verbs` field inherits from the four-family verb grammar
(Collect / Make / Show-Ask / Use), but the **sub-verb list within each family is not yet decided** (parked
in Build §4). The Audio-Tag Agent can only emit compliant strings once the sub-verb list is specced — a
named Phase-3 dependency on the pnc-grammar / verb-table work [`gdd-structure-model.md` Build §4;
`_index.md` §2 H5 ●●○; `lens-3` §9 flag 3].

---

## 7A. Agent 5 — QA / Playtest Agent (traversal & functionality check)

*(Promoted to a standing worker at GATE 2 per Roc — see the revision note above. The auto-run's
`COMPARE.md` Decision A had this as an orchestrator pass; Roc's call makes it a full slot with a distinct
feature.)*

**Feature owned:** structural & functional QA — verifies the assembled slice is **traversable and works
as specced**, before ship. It enumerates **choice permutations** and checks that every branch/state is
reachable and leads somewhere valid (no soft-locks, no dead-ends, no orphaned content), that **win/lose
states are reachable** by an intended path, and that each interaction **produces its specified effect and
its wrong-action teach** (the informational-feedback law). It **flags/reports only** — it does not
generate content, does not rewrite, does not repair; its output is a playtest report a human acts on.

**Why it earns a slot (distinct from Agent 3).** The Consistency Verifier checks *canon & voice* — does
new content contradict locked lore, rules, or register. The QA Agent checks *structure & function* — can
the player actually get through, and does the machine do what the spec says. These are different features
(*is it consistent?* vs. *does it work and can you traverse it?*), so under the one-feature-per-agent rule
each earns its own seat [`transcript` 21:54:45–21:55:28]. Its check-set is grounded in the locked pillars:
the pilot's **fairness test** and **multi-goal availability** (a stuck player always has a live goal; no
single-chain dead-ends) [`pnc-grammar` §1], the **informational-feedback law** (every wrong action
teaches) [`pnc-grammar` §4], and reward-space reachability [`pnc-grammar` §7]. The class's
**synthetic-audience** framing supplies the multi-archetype pass — discovery / emotional / puzzle player
[`transcript` 21:48:10–29].

**Input (JSON sketch):**
```json
{
  "scene_graph": "path — machine-readable nodes (scenes), edges (gates/choices), and state transitions",
  "gates": [ { "gate_id": "string", "key_type": "string", "unlocks": ["node_id"] } ],
  "win_lose_conditions": { "win": ["string"], "lose": ["string"] },
  "interaction_specs": [ { "interaction_id": "string", "expected_effect": "string", "wrong_action_teach": "string" } ],
  "archetypes": ["discovery", "emotional", "puzzle"]
}
```
**Output (JSON sketch):**
```json
{
  "reachability": [ { "node_id": "string", "reachable": "bool", "via": ["gate_id"] } ],
  "flags": [
    {
      "flag_type": "soft_lock | dead_end | unreachable_content | unreachable_win | broken_interaction | missing_wrong_action_teach",
      "location": "string — node_id / interaction_id",
      "detail": "string — the specific failure (≤30 words)",
      "severity": "hard | soft"
    }
  ],
  "archetype_notes": [ { "archetype": "string", "friction_points": ["string"] } ],
  "human_action_required": "bool — true if any hard-severity flag present"
}
```
**When called:** QA stage — after a content batch is assembled into a playable scene graph, and again as a
pre-ship pass. Runs async in canned mode.
**Human gate:** **hard** on any `soft_lock` / `unreachable_win` (a slice you cannot complete cannot ship);
**soft** otherwise — the report is reviewed, non-blocking flags triaged. Human playtest and peer review
remain the primary *experiential* quality signal; this agent owns *traversal and functionality*, not
"is it fun."
**Realistic-capability check — PASS with caveat.** Graph reachability, permutation enumeration, and
rule-checking over a **bounded** scene graph are deterministic, verifiable tasks well within capability
[`transcript` 21:39:42–21:40:16]. **Caveat:** it depends on a machine-readable scene/choice graph existing
(a Phase-3 artifact); until the slice is represented as a traversable graph, this agent has nothing to
walk. And it validates *traversability/functionality*, never *fun* — that stays human [`transcript` 21:35–].
**Thin-source flag.** Like the Consistency Verifier, the QA Agent's *shape as a standing agent* is a
Roc-directed GATE-2 slot, not a KB-derived one — the class frames QA as a technique (synthetic audiences),
not a roster role. Its *check-set* is well-grounded in the locked pillars; its *agent shape* is a Roc call.

---

## 8. What sits outside the standing crew (deliberate demotions and deferrals)

Two functions the lenses proposed as standing agents are **intentionally not** standing slots — each with
a defended reason (full reasoning in `COMPARE.md` Decisions A and C). Naming them here prevents Phase-3
scope drift.

**Content/functional QA is now Agent 5 (§7A); scope-guard *document* review stays an orchestrator pass.**
The traversal-and-functionality check — choice-permutation reachability, soft-lock/dead-end detection, the
three-archetype (discovery / emotional / puzzle) playtest — is a standing worker (§7A) per Roc's GATE-2
call. What remains a *technique, not a body* is the **scope-guard / Van-Buren pillar-compliance review of
the GDD itself** — *"have agents look at your document, identify... what's going to be the heaviest lift"*
[`transcript` 21:43:35–52]; *"synthetic audiences"* is a framing for faster iteration, not a separate
roster role [`transcript` 21:48:10–29]. So the orchestrator runs the document-level over-specification /
pillar check as an **on-demand pass** (invoking the Verifier in a stress-test mode), rather than staffing a
standing Scope-Guard agent. Across both, **human playtesting and peer review remain the primary
*experiential* quality signal** — the agents check traversal, functionality, and consistency, never "is it
fun" [`transcript` 21:35–; `lens-3` §9 flag 5].

**Runtime State Tracker / ICM — Build §5a (H10), and it is *mechanics, not an agent*.** L1 proposed a
State Tracker as the Incarnation-Context Memory engine — *"the world remembers you back"*
[`concept-dig-notes` Session 2; `lens-1` §3 Agent 2]. That is a genuine and central system, but two things
keep it out of this H11 crew. First, it is a **runtime (H10)** concern, and the runbook keeps the two
contexts hard-separate [`RESYNTHESIS-PLAN.md` §5]. Second — **Roc's GATE-2 clarification** — the runtime
persistence is **deterministic game code, not an LLM agent**: the shipped game (and canned mode) **must
run without an LLM at play time**, so remembering incarnations, tracking solidification, and gating the
calendar are ordinary save-state mechanics, not a model call. Only the *dev-time* crew above uses LLMs.
The dev-crew's job toward it is bounded: **author the session-state / persistence *schema*** the runtime
mechanics read and write; the runtime system itself is a Build §5a design task, flagged, not built in this
H11 roster [COMPARE Decision C]. The event/state model to draw from when that schema is written is the
entity-event through-line from `procedural-history-caves-of-qud` and the listener/tracker/injector
decomposition from `player-driven-stories` [`procedural-history-caves-of-qud`; `player-driven-stories`].

---

## 8A. Expansion candidates (beyond the class-scope core)

Per Roc's GATE-2 call, the ~5 + orchestrator core is **not a hard cap** — more roles are welcome **when the
need is real and the why is clear** (§1). These are *named but not staffed*: each owns a distinct feature,
is kept out of the class-scope core to stay lean, and would be added only if the build surfaces the need.
Roc named the first two.

- **Project Manager (task-board agent).** *Feature:* decomposes the Build GDD into a task board, tracks
  built-vs-pending, surfaces the heaviest lifts. *Why:* turns the Build doc into an execution plan for a
  multi-agent build — the class explicitly frames *"identify... what's going to be the heaviest lift"* as
  real work [`transcript` 21:43:35–52]. *Capability:* high — structured extraction + status tracking, no
  creative judgment. *Watch:* it overlaps the orchestrator's sequencing; keep it a separate seat only if
  task *tracking/reporting* is a distinct load from run-time routing.

- **Audio Implementer (sound-hookup agent).** *Feature:* consumes the Audio-Tag manifest, wires each tag to
  an actual sound asset / event trigger, and emits the **asset list** (what exists, what's missing). *Why:*
  distinct from the Audio-Tag Agent, which only *defines and verifies the naming contract* — this one
  *implements* against it and inventories the assets. *Capability:* medium — engine integration
  (MetaSounds / Unreal) is partly deterministic wiring, so this is likely a **mechanics + agent hybrid**
  (the hookup is mechanics; the agent generates the asset list and flags gaps), echoing §8's
  mechanics-not-agent point.

Others may surface in Phase 3 (e.g., a localization pass, or an art-asset-list agent parallel to the audio
one). The rule is constant: **a new seat needs a clear, distinct why and a passing capability check** — not
a guess that "an agent could help."

---

## 9. Roster summary + human-gate map

| # | Agent | Feature owned (one) | Stage | Mode | Human gate |
|---|---|---|---|---|---|
| 0 | **Orchestrator** | Sequencing · session-state bus · gate-surfacing | all | both | Routes freely (canned) / approves each call (live) |
| 1 | **Narrative Architect** | Story structure: echo map + persona-card schema + delta rule + canon flags | Schema | canned | Roc reviews cards + echo map before propagation |
| 2 | **Content / Dialogue Agent** | All player-facing text (canonical JSON example) | Prose | canned / live\* | Tell-pre-pass → Roc reviews flagged/echo/retrospective lines |
| 3 | **Consistency Verifier** | Consistency — checks batches vs. finite canon invariants; flags only | Canon-check | both | Always gated — no flagged content commits without sign-off |
| 4 | **Audio-Tag Agent** | Audio-tag contract `<Entity>_<AnimVerb>_<State>` (H15 USP) | Schema | canned | Soft — manifest delta reviewed, auto-commits on no-objection |
| 5 | **QA / Playtest Agent** | Traversal & functionality: choice-permutation reachability, soft-lock/dead-end, win-lose reachable, interaction works | QA | canned | Hard on soft-lock/unreachable-win; soft otherwise |

\*Agent 2 serves live mode for the single bounded emergent-partner wow beat only; that call requires the
human gate before any write. **Total: 5 workers + 1 orchestrator — at the class-scope target**
[`transcript` 21:53:38], which is *guidance, not a hard cap* (§1): each slot earns its seat with a clear
why, and further roles are parked as expansion candidates (§8A). One feature per agent
[`transcript` 21:54:45–21:55:28].

**Approval-before-write map** (the orchestrator enforces it; each agent's scope ends where a gate begins —
this is the graded *"agent role clarity"* criterion [`transcript` 21:51:21–40]):

| Trigger | Gate | Who acts |
|---|---|---|
| Any FLAG from the Consistency Verifier | Hard — content held until cleared | Roc |
| Content Agent called in live mode (wow beat) | Hard — line shown; approve before display | Roc |
| Narrative Architect persona/echo output | Hard — reviewed before it propagates downstream | Roc |
| Audio-Tag manifest delta | Soft — review diff; auto-commit on no-objection | Roc (optional) |
| QA Agent flags a soft-lock / unreachable-win | Hard — slice held; an incompletable slice cannot ship | Roc |
| QA Agent flags a non-blocking friction point | Soft — triaged in the report | Roc (optional) |
| Orchestrator stress-test pass surfaces a scope/pillar flag | Hard — batch held; pillar violation cannot ship | Roc |
| Clean batch (no flags) | None — orchestrator commits to the bus | — |

---

## 10. How this maps to Build GDD §5

Per the structure model, Build §5 is the one place all agent JSON-I/O schemas live
[`gdd-structure-model.md` §4 Build §5]. This artifact supplies **§5b (dev-crew pipeline roster, H11)**:
each agent above becomes one roster row — name · role · input schema · output schema · when-called ·
human-gate · realistic-capability check [`gdd-structure-model.md` §4]. **§5a (in-game runtime agents,
H10)** is a separate architecture this artifact scopes out (§8) [`RESYNTHESIS-PLAN.md` §5]. The **Pitch
GDD's P5** ("one agent, one wow") is the one-line-per-agent compression of this roster — best finalized
once Roc ratifies the Build §5b shape, since the Pitch names only the agents Roc is confident exist
[`gdd-structure-model.md` §3 P5, §9 honest-spots]. The gaps in §11 feed **Build §12** (the open ledger)
directly.

---

## 11. Thin spots / KB gaps (honest accounting for GATE 2)

The whole section is built from-scratch — *"H11 is the thinnest required section... Refs supply mindset,
not schemas"* [`_index.md` §3.4]. The confidence here comes from **three-lens convergence**, not KB depth
(the four settled slots — orchestrator, narrative architecture, content, consistency — are the ones all
three lenses independently reached; see `COMPARE.md` §2). The following are named, not papered over:

- **Token budget / call frequency (H13) — not derivable here.** Untouched by the KB [`_index.md` §2 H13
  ○○○]; the one-slot-per-call scoping (Agent 2) and bounded-context discipline (Agent 3) keep costs
  conservative, but the numbers are Phase-3 math against real API costs. A required rubric section
  [`GATE-2-review.md` B1] that this artifact cannot close.
- **Live-mode I/O + the session-log format — the blocking live-mode spec.** The canned schemas above are
  grounded; what the Content Agent receives when called mid-session with only a current-state excerpt is a
  design gap. `ink-narrative-scripting-language` names the failure: without a persistent session log, the
  agent loses retrospective-significance behavior entirely [`ink-narrative-scripting-language`;
  `lens-1` §5].
- **Multi-agent retry / escalation protocol — Phase-3 orchestration.** What the orchestrator does when the
  Verifier returns a FLAG and the Content Agent cannot self-correct is unspecified; `building-ai-workers`
  admits the same gap [`building-ai-workers`; `lens-1` §5].
- **The session-state bus field schema is unspecified.** The `bullish0x` `active.md` pattern is named but
  no field schema was captured [`recon.md` §4; `lens-2` §5]. Phase-3 designs what it records, at what
  granularity, and how agents update it — including the Verifier's summarization cadence (Agent 3 caveat).
- **The Consistency Verifier's agent *shape* is single-repo-sourced** (`lore_master`) plus a runbook Q&A
  mention — the crew's highest-value slot with the thinnest grounding *for its shape* (its check-set is
  well-grounded) [`lens-2` §5; `lens-1` §3 Agent 4]. **Thin-source flag.**
- **The Audio-Tag Agent's contract format has no KB precedent** (H15 ○○○) and is blocked on the Phase-3
  verb-grammar sub-verb list [`_index.md` §2 H15; `gdd-structure-model.md` Build §4]. The slot is justified;
  the schema is Phase-3 net-new.
- **The delta-storytelling rule's field format is Phase-3, not KB-derived** [`lens-3` §9 flag 1] — grounded
  in Frieren craft, no I/O precedent. **Thin-source flag.**
- **Whether the orthogonal-trait pipeline yields perceptually distinct NPCs is unvalidated in a sketch.**
  Roc's homogenization worry (A1) needs real Phase-3 writing samples against the voice-style-guide
  NPC-variance section — the structure guards against it but cannot prove it here [`GATE-2-review.md` A1;
  `modular-characters-system-driven`].
- **No Unreal-specific integration.** The call-down/injection patterns are engine-agnostic; MetaSounds +
  the Unreal asset pipeline need a separate source [`godot-game-architecture`; `lens-1` §5].
- **The fifth-slot spend was resolved at GATE 2 (not left as a trade-off).** The auto-run's compare gave
  the fifth slot to Audio and demoted QA to an orchestrator pass under a hard cap; Roc's GATE-2 call keeps
  **Audio *and* promotes QA to a standing Agent 5** (§7A) by treating the ~5 count as soft guidance (§1).
  So the crew is 5 workers + orchestrator with QA and Audio both seated; further roles are parked as
  expansion candidates (§8A). The remaining judgment is Phase-3: whether any expansion candidate gets
  staffed [COMPARE §3 Decision A, superseded here by the GATE-2 revision note].
