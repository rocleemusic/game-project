---
kind: staged reference note — Round C recon
status: STAGED — Roc decides at GATE 2 whether to promote as committed reference set or discard
built: 2026-07-17 overnight run (Sonnet, per §3 model routing)
sources: bullish0x/GameStudio (.agents/agents); guangyuspace/codex-gamestudio-skill (SKILL.md); colonel1223/GameStudio (agents/); RESYNTHESIS-PLAN.md §5 guardrails; _index.md §3 H11 findings
---

# Round C — Dev-Crew / Agent Architecture Recon

## 0. Access log

| Repo | Status | Method |
|---|---|---|
| `bullish0x/GameStudio` | Reached | `gh api` — full `.agents/agents` directory (54 agents) + `adapter-manifest.json` |
| `guangyuspace/codex-gamestudio-skill` | Reached | `gh api` — `SKILL.md` decoded from base64 |
| `colonel1223/GameStudio` | Reached | `gh api` — `agents/studio.py` (orchestrator), agent .py files, `README.md` |

All three repos reached. No gaps to record.

---

## 1. Repo 1 — `bullish0x/GameStudio`

### Architecture shape

This is the most architecturally sophisticated of the three repos. It defines a **provider-neutral canonical agent layer** (`.agents/agents/`) that is then mirrored to harness-specific adapters: `.claude/` (Claude Code), `.codex/` (Codex), `.cursor/` (Cursor rules). The `adapter-manifest.json` makes this explicit: canonical agents live in `.agents/agents`; Claude Code reads a path-transformed mirror in `.claude/agents`. This is a **multi-harness orchestration pattern** — the same 54-agent roster can be driven by any LLM coding harness without rewriting agent specs.

Orchestration shape: **no single master orchestrator script**. Instead, a shared `production/session-state/active.md` file acts as the coordination bus — each agent reads it at session start and writes its completed sections back, so any agent can pick up where the last left off. The `producer` agent is the de facto project manager, with the `creative-director` as the creative authority. Human-in-the-loop approval is required before any agent writes files ("May I write this to [filepath]?" pattern appears in every agent spec).

### Full agent list (all 54)

Relevance filter applied below. The full list:

`accessibility-specialist` · `ai-programmer` · `analytics-engineer` · `art-director` · `audio-director` · `community-manager` · `creative-director` · `devops-engineer` · `economy-designer` · `engine-programmer` · `game-designer` · `gameplay-programmer` · `godot-csharp-specialist` · `godot-gdextension-specialist` · `godot-gdscript-specialist` · `godot-shader-specialist` · `godot-specialist` · `lead-programmer` · `level-designer` · `live-ops-designer` · `localization-lead` · `narrative-director` · `network-programmer` · `performance-analyst` · `phaser-specialist` · `pixijs-specialist` · `producer` · `prototyper` · `qa-lead` · `qa-tester` · `release-manager` · `security-engineer` · `sound-designer` · `systems-designer` · `technical-artist` · `technical-director` · `threejs-specialist` · `tools-programmer` · `ue-blueprint-specialist` · `ue-gas-specialist` · `ue-replication-specialist` · `ue-umg-specialist` · `ui-programmer` · `unity-addressables-specialist` · `unity-dots-specialist` · `unity-shader-specialist` · `unity-specialist` · `unity-ui-specialist` · `unreal-specialist` · `ux-designer` · `web2d-asset-pipeline` · `web3d-asset-pipeline` · `webgl-shader-specialist` · `world-builder` · `writer`

### Relevance filter applied (per §5 guardrails)

**KEEP — narrative / content / QA / consistency archetypes:**

| Agent | Role (one line) | I/O sketch | When called |
|---|---|---|---|
| `narrative-director` | Story architecture, world-building, character design, branching structure | In: pillar doc + user brief; Out: story-arc doc, character sheets, world rules | When designing act structure, NPC roles, or branching logic |
| `writer` | All player-facing text — dialogue, lore entries, item descriptions, environmental text | In: voice-profile + narrative-director output + brief; Out: dialogue files, lore entries | When producing actual written content for any game text |
| `game-designer` | Core loop, progression, mechanics, player-facing rules | In: pillars + constraints + reference games; Out: mechanic specs with formulas | When specifying how the game works at system level |
| `systems-designer` | Mathematical rule-sets for specific subsystems — interaction matrices, crafting recipes, status effects | In: high-level design goal; Out: precise rule spec with formulas and edge cases | When a mechanic needs exact interaction matrix or balance spec |
| `audio-director` | Sonic identity — music direction, SFX philosophy, adaptive audio architecture | In: emotional target + pillar doc; Out: audio palette spec, adaptive-music layer plan | When defining audio identity or music-state architecture |
| `qa-lead` | Test strategy, bug triage, release quality gates, regression test plans | In: story/spec doc + code; Out: test evidence classified by story type (Logic/Integration/Visual/UI/Config) | Per-sprint; gates every story before Done |
| `ux-designer` | User flows, interaction patterns, information architecture, accessibility | In: mechanic spec + player experience goal; Out: flow diagrams, interaction pattern doc | When designing menus, HUD, or any player-facing navigation |
| `producer` | Sprint planning, milestone tracking, risk management, cross-agent coordination | In: full project context; Out: sprint plans, risk registers, milestone checklists | Cross-cutting — the coordination authority across all other agents |
| `creative-director` | Final creative authority — resolves conflicts between design/art/narrative/audio pillars | In: conflict or vision question + all relevant docs; Out: binding decision + ADR doc | When departments cannot reach consensus or a decision affects game identity |

**DROP — noise for a cozy, narrative, P&C, audio-first, 2D-ish deduction game:**

`ai-programmer` · `analytics-engineer` · `community-manager` · `devops-engineer` · `economy-designer` · `engine-programmer` · `gameplay-programmer` · `godot-csharp-specialist` · `godot-gdextension-specialist` · `godot-gdscript-specialist` · `godot-shader-specialist` · `godot-specialist` · `lead-programmer` · `live-ops-designer` · `localization-lead` · `network-programmer` · `performance-analyst` · `phaser-specialist` · `pixijs-specialist` · `release-manager` · `security-engineer` · `technical-artist` · `technical-director` · `threejs-specialist` · `tools-programmer` · `ue-*` (4 agents) · `ui-programmer` · `unity-*` (4 agents) · `unreal-specialist` · `web2d-asset-pipeline` · `web3d-asset-pipeline` · `webgl-shader-specialist` · `world-builder` · `level-designer` · `prototyper` · `qa-tester` · `accessibility-specialist`

### Orchestration pattern

**Human-gated, session-state-bused consultancy.** No autonomous pipeline. Each agent:
1. Reads `production/session-state/active.md` and the relevant design files.
2. Asks clarifying questions before proposing anything.
3. Presents 2–4 options with reasoning; defers the final call to the human.
4. Requests explicit approval before writing any file.
5. Updates `production/session-state/active.md` after each section.

The `producer` coordinates across agents; the `creative-director` resolves cross-pillar conflicts. This is a **manager/consultant pattern** — the human is always the decision-maker; the agents are expert advisors.

### Consistency / verification signal

The `qa-lead` spec defines a **story-type-gated verification layer**: every story is classified (Logic / Integration / Visual / UI / Config) and must produce typed evidence before it is marked Done. The `narrative-director` and `writer` agents both include an explicit canon-consistency check: writer must "flag deviations from voice profiles or canon explicitly — the narrative-director should know." This is the closest thing to a **dedicated consistency agent** in this repo — it is distributed across the qa-lead and writer, not centralized. The pattern matters for our two-mode setup (see §4 below).

---

## 2. Repo 2 — `guangyuspace/codex-gamestudio-skill`

### Architecture shape

This is a **single-file Codex skill** (`SKILL.md`) that adapts the `pamirtuna/gamestudio-subagents` concept into a Codex-native workflow. It is not a multi-agent runtime — it is one skill that *role-plays* multiple studio disciplines within a single conversation context, invoking whichever "role" is relevant to the current task.

Upstream lineage declared: `pamirtuna/gamestudio-subagents` (primary); `DietrichGebert/ponytail` and `0x0funky/agent-sprite-forge` (workflow concepts).

### Roles defined (all in-conversation, not separate agents)

| Role | Function (one line) |
|---|---|
| Producer | Scope, phase plan, risks, acceptance criteria, milestone readiness |
| Sr Game Designer | Vision, pillars, systems, player journey, success metrics |
| Mid Game Designer | Feature specs, content, tuning values, user stories |
| Mechanics Engineer | Architecture, gameplay systems, data/state, engine integration |
| Game Feel Engineer | Responsiveness, effects, timing, feedback, polish, performance |
| Sr Game Artist | Art direction, visual language, asset needs, consistency |
| Technical Artist | Shaders, particles, lighting, optimization, asset pipeline |
| UI/UX Designer | HUD, menus, mobile ergonomics, accessibility, responsive layout |
| QA | Test plan, regression risks, edge cases, smoke tests, quality gates |
| Market Analyst | Genre expectations, competitors, audience fit, platform norms |
| Data Scientist | Metrics, telemetry, balancing signals, A/B or retention thinking |

**Relevance filter applied:** roles relevant to our pipeline — Producer, Sr Game Designer, Mid Game Designer, Mechanics Engineer, Sr Game Artist, UI/UX Designer, QA. Drop: Technical Artist (shaders), Market Analyst, Data Scientist, Game Feel Engineer (low priority for P&C).

### Operating modes

The skill defines explicit **execution phases** used as a mode-selector: Design · Prototype · Development · Polish · QA · Asset. This maps cleanly to a pipeline: the same model shifts register by mode rather than spawning a new agent.

### Orchestration pattern

**Single-model role-switching, not a multi-agent fan-out.** The skill instructs the model to "choose only the roles that matter" for each task, run them in a defined order (Producer → Designer → Engineer → specialized roles → QA), then verify before closing. Continuity across sessions is maintained via `CODEX_HANDOFF.md` (project state file) and `DEBUG_HANDOFF.md` (debug state file). This is a **sequential role-chain pattern** within one context window, not parallel workers.

Minimum implementation discipline is explicit: "use the smallest working change that actually solves the problem" — a direct structural echo of our Van Buren guardrail and the class transcript's "specificity over length" instruction.

### Consistency / verification signal

The `DEBUG_HANDOFF.md` protocol is a lightweight consistency gate: if the same error resists multiple fixes, stop code changes and document a root-cause hypothesis before continuing. The QA role defines quality gates per phase. No dedicated canon-consistency agent — this repo's scope is code-level QA, not narrative/content consistency.

---

## 3. Repo 3 — `colonel1223/GameStudio`

### Architecture shape

This is a **sequential pipeline script** (`studio.py`) that calls six agents in fixed order, passing accumulated context forward as a string. No branching, no human-in-the-loop per step — it is a **fully automated fan-out-then-chain** pattern. The six pipeline agents run in this order:

1. `creative_director` → game concept, pillars, emotional thesis
2. `narrative_designer` → 3-act structure, actual dialogue scenes
3. `art_director` → visual identity, hex palette, lighting
4. `sound_designer` → adaptive audio architecture
5. `lead_programmer` → Godot 4 architecture and GDScript
6. `producer` → sprint plan, MVP, risk register

Each agent's output is appended to a shared context string; the next agent receives all prior output. Final outputs are written to `agents/output/*.md` and a merged `FULL_DESIGN_DOC.md`.

Additional standalone agents (not in the pipeline): `lore_master.py` · `playtester.py` · `qa_tester.py` · `art_bible.py` · `chat.py` (interactive agent selector) · `codegen.py` · `shader_artist.py` · `ux_researcher.py`.

### Relevant agents (relevance filter applied)

**KEEP:**

| Agent | Role (one line) | I/O sketch | When called |
|---|---|---|---|
| `creative_director` | Concept, mechanical innovation, emotional thesis, 3 pillar mechanics | In: game idea string; Out: title/pitch/core mechanic/emotional thesis/progression loop | Step 1 of pipeline, always |
| `narrative_designer` | 3-act structure, actual dialogue, environmental storytelling, branching consequences | In: creative-director output; Out: story premise, protagonist, 3 key dialogue scenes, ending | Step 2 of pipeline |
| `lore_master` | Internal mythology, symbolism, hidden narrative layers, narrative consistency; reads existing `narrative_designer.md` output | In: lore query + narrative-designer output as context; Out: encoded environmental detail | On demand — called separately when a lore/consistency check is needed |
| `sound_designer` | Adaptive 4-layer audio system — instrumentation, BPM, dynamic layers, crossfade triggers | In: creative + narrative context; Out: audio palette spec with Godot implementation notes | Step 4 of pipeline |
| `producer` | Sprint breakdown (2-week sprints, 6-month horizon), MVP, risk register, task list by priority/dependency | In: all prior output; Out: sprint plan, risk register, milestone checklist | Step 6 of pipeline |
| `playtester` | Virtual playtesting — three player archetypes (Explorer/Achiever/Storyteller), flags rage/quit/zero-feeling moments | In: level description or mechanic + design doc context; Out: playtest report | On demand, standalone |
| `qa_tester` | GDScript code review — bugs, performance, Godot 4 violations, memory leaks, signal errors; CRITICAL/WARNING/INFO severity | In: path to script file; Out: QA report with severity levels and specific fixes | On demand, standalone |
| `ux_researcher` | Player psychology, flow state | In: not captured (simple script); Out: not captured | On demand |

**DROP:** `shader_artist` · `lead_programmer` · `codegen` · `art_bible` (art direction scope for shader/3D pipeline).

### Orchestration pattern

**Automated sequential pipeline with no human gate.** `studio.py` runs all 6 agents in fixed order; each receives the accumulated output of all prior agents. No approval step; no branching. This is a **conveyor-belt / waterfall pattern** — useful for rapid GDD generation from a single prompt, not for iterative human-in-the-loop refinement.

The standalone agents (`lore_master`, `playtester`, `qa_tester`) operate as **on-demand satellites** with no orchestration layer — they are invoked individually when needed, reading output files from the pipeline run as their input context.

### Consistency / verification signal (strongest of the three repos)

The `lore_master` agent is the clearest example of the **canon-check / consistency-verification pattern** the runbook asked to watch for. Its system prompt is explicitly: "You maintain the internal mythology, symbolism system, and hidden narrative layers... You ensure narrative consistency and plant details that reward attentive players with deeper understanding." It reads the prior `narrative_designer.md` output as context before responding to any lore query. This is a dedicated consistency agent feeding off an upstream content artifact — exactly the pattern that fits our two-mode setup (canned mode: verify content against KB; live mode: verify generated lines against voice spec and established canon).

The `playtester` agent implements a **multi-archetype QA pass** — simulating Explorer / Achiever / Storyteller simultaneously and flagging any moment where an archetype would quit. This is a lightweight playtest-consistency check on narrative/mechanical beats, not just code.

---

## 4. Cross-repo synthesis (what the pattern teaches us)

### The grammar, not the headcount

Three repos, three distinct orchestration shapes:
- **bullish0x:** Human-gated consultancy bus — many specialists, always-ask, session-state file as the coordination artifact.
- **guangyuspace:** Single-model role-switching — one context, modes as the selector, handoff files as continuity.
- **colonel1223:** Automated sequential pipeline — fixed order, accumulated context string, standalone satellites for QA and consistency.

For our pipeline (H11), the relevant distillate is not the headcount (54 / 11 / 10) but the **grammar each shape encodes**:

1. **Session-state file as the coordination bus** (bullish0x) — a single `active.md` that every agent reads at start and writes at end is a low-friction way to maintain continuity across separate agent calls without a complex orchestrator. Maps to our two-mode architecture: canned-mode agents can write to a session-state artifact; live-mode agents read it.

2. **Explicit mode-selector** (guangyuspace) — declaring the current phase (Design / QA / Asset) before invoking a role is a clean way to shift a single model's register without spawning separate agents. Relevant for our canned-vs-live gate: the mode is declared in the input, not baked into separate runtimes.

3. **Accumulated-context chain** (colonel1223) — passing the full output of each upstream agent as context to the next is how GDD-altitude coherence is maintained across a pipeline run. Relevant for our content pipeline: a narrative-consistency agent at the end of the chain receives the accumulated output of the content agents and checks it.

4. **Approval-before-write gate** (bullish0x) — every agent asks "May I write this to [filepath]?" before touching files. This is the Human Gate from the class transcript's "realistic capability check" — graded as "agent role clarity." Maps directly to our two-mode setup: canned mode may run unattended; live mode requires explicit human approval before any content write.

5. **Typed evidence per story** (bullish0x qa-lead) — classifying stories (Logic / Integration / Visual / UI / Config) and requiring typed evidence before Done is a QA discipline that maps to our audio-tag contract check (H15): the audio-tag link is a Logic story requiring an automated smoke check, not a Visual story requiring screenshot sign-off.

### The consistency / verification archetype

All three repos express a version of this pattern, but only colonel1223's `lore_master` is a **dedicated consistency agent**. The pattern: an agent whose sole job is to read an upstream content artifact and check new additions for internal consistency — flagging deviations, not generating new content. For our two-mode setup, this agent would:
- In **canned mode**: run after each KB-extraction batch, check new notes against the 157-note KB for contradictions, flag to Roc.
- In **live mode**: run after each AI-generated NPC line or scene text, check against the voice-style-guide and established canon (C1 — knowledge travels across scenes/years), flag for human review before the content is committed.

This is the natural fit the runbook anticipated. None of the three repos provides a ready-made template that matches our content type (narrative/audio/deduction, not code/shader/3D), but the **structural pattern** is transferable.

### What does NOT transfer (relevance filter confirmation)

All three repos are built around engines that generate or modify code (Godot, Unity, Unreal, Phaser) or 3D/shader pipelines. The large agent counts (54, 11, 10) are dominated by:
- Code-generation specialists (GDScript, shader, network, physics)
- 3D/visual-pipeline roles (technical artist, shader artist, 3D asset pipeline)
- Live-service / analytics roles (economy designer, analytics engineer, community manager)

None of these transfer to a cozy, narrative, P&C, audio-first, 2D-ish deduction game. The KB's H11 gap finding holds: "Refs supply mindset, not schemas. Expect to design + name the dev-crew roster largely from scratch in Phase 3" [`_index.md` §3.4]. The repos confirm that the schema design is always game-specific; the grammar (session-state bus, mode selector, approval gate, consistency satellite) is what transfers.

---

## 5. Recommended distillation for Round C lens work

From these three repos, the archetypes worth adopting into the H11 roster sketch are:

| Archetype | Source(s) | Maps to H11 role |
|---|---|---|
| **Narrative Director** — story architecture, NOT individual line writing; gates all downstream content agents | bullish0x · colonel1223 | Content orchestrator / story-architecture agent |
| **Writer / Content Agent** — produces actual player-facing text; reads voice-profile; flags canon deviations to the director | bullish0x | Dialogue/text generation agent |
| **Consistency Checker / Lore Master** — reads accumulated content output, checks against KB and established canon, flags; does NOT generate new content | colonel1223 (`lore_master`) | Canon-verification satellite (our two-mode fit) |
| **Audio Specialist** — defines adaptive-audio architecture, states, and layer triggers; not just SFX but the state-machine that drives the USP | bullish0x · colonel1223 | Audio-tag contract agent (H15) |
| **QA / Playtester** — verifies output against typed-evidence requirements; the playtester archetype simulates multiple player archetypes and flags zero-feeling moments | bullish0x (`qa-lead`) · colonel1223 (`playtester`) | QA gate agent |
| **Producer / Orchestrator** — session-state coordinator; frames scope before any work; the only agent with cross-cutting authority | bullish0x · guangyuspace · colonel1223 | Orchestrator (the ~5-agent cap's "+1") |

The **session-state file** (bullish0x pattern) + **accumulated-context chain** (colonel1223 pattern) together form the inter-agent handoff protocol. The **approval-before-write gate** (bullish0x) maps to the human gate in our canned-mode-unattended vs. live-mode-gated distinction.

---

## 6. Disposition note (per runbook §4 Round C step 0)

This file is **staged as `round-C/recon.md`**. Roc decides at GATE 2 whether to:
- **Promote as committed reference note set** — one or more notes extracted from this recon to the KB's `ai-workflow/` track, cited in the H11 slot of the hole-coverage map.
- **Keep as ephemeral compare input** — used as L2 (external-archetype lens) for the Round C three-lens compare that produces `dev-crew-architecture.md`, then archived.
- **Discard** — if the pattern grammar is sufficiently covered by existing KB material (`ai-workflow-notes`, `narrative-lego`, `modular-characters-system-driven`) and the class transcript.

The strongest new signal not already in the KB is the **`lore_master` consistency-agent pattern** and the **bullish0x approval-gate + session-state-bus architecture**. The rest confirms patterns already seeded in the KB's H11 notes but provides richer structural detail.

---

*Sources: `bullish0x/GameStudio` `.agents/agents/` (54 agents, all fetched via `gh api`); `guangyuspace/codex-gamestudio-skill` `SKILL.md`; `colonel1223/GameStudio` `agents/studio.py`, `lore_master.py`, `playtester.py`, `qa_tester.py`, `art_bible.py`, `README.md`; `RESYNTHESIS-PLAN.md` §5; `_index.md` §2–3; `GATE-2-review.md`.*
