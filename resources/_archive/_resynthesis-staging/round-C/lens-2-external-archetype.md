---
kind: synthesis artifact — Round C, Lens 2
lens: external-archetype
artifact: dev-crew architecture — external-archetype perspective
sources:
  - _resynthesis-staging/round-C/recon.md (all three repos — bullish0x, guangyuspace, colonel1223)
  - knowledge-base/ai-workflow/building-ai-workers.md
  - knowledge-base/narrative/narrative-lego-ken-levine.md
  - knowledge-base/narrative/narrative-designer-studio-role.md
  - knowledge-base/narrative/modular-characters-system-driven.md
  - knowledge-base/narrative/procedural-narrative-generation.md
  - knowledge-base/RESYNTHESIS-PLAN.md (§2 locked inputs; §5 guardrails; unattended-mode override)
  - knowledge-base/_index.md (§2–3 hole-coverage map + honest findings)
  - GATE-2-review.md (locked calls + open flags)
  - _resynthesis-staging/round-A/gdd-structure-model.md (two-doc structure; §5 agent-handoff shape)
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (class transcript)
built: "2026-07-17 overnight run (Round C, Sonnet)"
status: STAGED — Roc decides at GATE 2
serves-holes:
  - H11 (dev-crew roster)
  - H10 (narrative pipeline, by adjacency)
---

# Lens 2 — External Archetype: Dev-Crew Distilled from the Repos

**Lens stance.** This lens looks at what the three repos actually built, strips the
noise (code agents, shader specialists, live-service roles — all irrelevant to a cozy,
narrative, P&C, audio-first, 2D-ish deduction game per [`RESYNTHESIS-PLAN.md` §5 guardrails]),
and extracts the grammar that transfers: not headcount, not agent names, but the
structural patterns that make the crew *function* as a pipeline. The result is a proposed
dev-crew shaped by those patterns — a set of roles each earning its place, each described
with a role definition and I/O sketch, with the orchestration model it comes from named
explicitly.

The two-doc structure is the approved frame [`gdd-structure-model.md` §4–5; unattended-mode
override]. This crew populates Build GDD §5 (the agent-handoff section); the Pitch GDD
gets one line per agent at P5 altitude. The crew serves the dev-pipeline (H11) — not the
in-game runtime agents (H10). That distinction is a hard guardrail [`RESYNTHESIS-PLAN.md`
§5 "Two contexts, kept distinct"].

---

## 1. What the repos teach (the grammar, not the roster)

All three repos reached. No access gaps [`recon.md` §0]. The recon extracted five
transferable structural patterns across the 54 / 11 / 10 agent counts:

**Pattern A — Session-state file as the coordination bus** [`bullish0x/GameStudio`]. A
single `active.md` artifact that every agent reads at session start and writes after each
completed section. No central orchestrator binary; the file *is* the coordination layer.
For our pipeline: a session-state artifact lets any agent pick up where the last one
stopped, which matters for an async overnight run and for the two-mode setup (canned mode
writes the state; live mode reads it before generating).

**Pattern B — Explicit mode-selector before work begins** [`guangyuspace`
`codex-gamestudio-skill`]. The skill declares a phase (Design / QA / Asset) at the top of
every invocation, shifting the model's register without spawning a new agent. For our
pipeline: a canned-vs-live declaration at the start of any agent call is cleaner than
encoding the mode in a separate runtime. One declaration, one agent, one output contract.

**Pattern C — Accumulated-context chain** [`colonel1223/GameStudio` `studio.py`]. Each
agent receives the full output of all prior agents as context. GDD-altitude coherence is
maintained by passing the chain forward, not by asking each agent to re-read source docs.
For our pipeline: the content agent needs the narrative director's architecture output;
the consistency checker needs both. Accumulated context is the handoff mechanism.

**Pattern D — Approval-before-write gate** [`bullish0x`]. Every agent in the repo asks
"May I write this to [filepath]?" before touching any file. This is the human gate the
class transcript describes as "agent role clarity" grading [`transcript` 21:37:05–21:37:27].
For our pipeline: canned mode may write freely (unattended run per the overnight-mode
override); live mode requires explicit human approval before any content file is written.
The gate is declared in the I/O contract, not enforced implicitly.

**Pattern E — Dedicated consistency satellite** [`colonel1223` `lore_master.py`]. The
`lore_master` is the only agent in any of the three repos whose sole job is reading an
upstream content artifact and checking new additions against it for internal consistency —
flagging deviations, never generating new content. The recon identified this as the
strongest new signal not already in the KB [`recon.md` §6]. For our two-mode setup: in
canned mode, the satellite checks extracted content against the 157-note KB for
contradictions. In live mode, it checks AI-generated lines against the voice-style-guide
and established canon before the content is committed.

These five patterns are what transfers. The specific agent names, the headcounts, and all
code/shader/engine/netcode roles do not transfer [`RESYNTHESIS-PLAN.md` §5 relevance
filter; `recon.md` §4 "What does NOT transfer"].

---

## 2. The proposed dev-crew — six roles, five workers + one orchestrator

The class scope is approximately five agents plus an orchestrator/manager [`RESYNTHESIS-PLAN.md`
§2 locked inputs; `transcript` 21:37:05]. The external-archetype lens proposes exactly
that: five specialized workers and one coordinator. Each role below states:
- **Source archetype** (which repo it comes from + which Pattern it instantiates)
- **Role definition** (what it does; what it does NOT do)
- **I/O sketch** (input contract → output shape; human gate if applicable)
- **When called** (in the pipeline sequence)

This is a Build GDD §5 altitude sketch — the JSON-I/O schemas are Phase-3 work, as flagged
in the structure model [`gdd-structure-model.md` §9 thin spots; `_index.md` §3.4].

---

### Role 1 — Orchestrator / Producer

**Source archetype.** `producer` from `bullish0x`; `producer` role from `guangyuspace`;
`producer` from `colonel1223` step 6 [`recon.md` §1, §2, §3]. All three repos converge
on this role as the only one with cross-cutting authority. The KB's worker-decomposition
mindset reinforces it: "each worker handles one stage; the system grows by appending
specialized workers, not by expanding any single one" [`building-ai-workers`].

**Role.** The session coordinator. Frames scope before any other agent touches content.
Reads the current session-state artifact at session start, maps which pipeline stages are
complete, determines which stage runs next, and routes the call. After the pipeline
completes, updates the state artifact. Does NOT generate content, evaluate narrative
quality, or make creative decisions — those are the creative-director and narrative-director
roles. The orchestrator's authority is sequencing and gate-keeping, not vision.

Mapping to the KB's `narrative-designer-studio-role` framing: the orchestrator holds the
"systems architect" and "continuity keeper" thinking patterns but none of the "department
translator" craft [`narrative-designer-studio-role`]. It knows *which* agent to call in
what order; it does not interpret what that agent produces.

**I/O sketch.**
- Input: session-state artifact (`session-active.md`) + current task brief (what stage to run, what material is ready)
- Output: routed call to the appropriate worker agent + updated session-state artifact after each stage completes
- Human gate: in **canned mode**, the orchestrator routes without stopping; in **live mode**, it surfaces the proposed routing for human approval before each worker call (Pattern D)

**When called.** Always first in any pipeline run. Also called after each worker completes
to update the state and decide whether to continue or surface for human review.

---

### Role 2 — Narrative Director

**Source archetype.** `narrative-director` from `bullish0x`; `creative_director` + `narrative_designer`
from `colonel1223` pipeline steps 1–2 [`recon.md` §1, §3]. The KB reinforces the role
boundary: "narrative designers receive high-level vision from leadership, develop it into
world/lore/character systems, then distribute filtered knowledge to each department"
[`narrative-designer-studio-role`].

**Role.** Story architecture, NOT individual line writing. The narrative director holds the
creative vision for the dev pipeline: the emotional thesis, act structure, the canon of
what is true about the world, and the branching consequences for the slice. It gates all
downstream content agents — nothing the content agent writes is valid unless it fits the
architecture the narrative director has established. It does NOT produce player-facing text;
that is the content agent's job. It does NOT check that text for consistency; that is the
consistency checker's job. Its output is a structural document that subsequent agents use
as their mandatory context.

The split between architecture (this agent) and line production (Role 3) is the key
discipline borrowed from `bullish0x`'s explicit split between `narrative-director` and
`writer` [`recon.md` §1 kept-agents table], and confirmed by the studio-role KB note:
"writers fill a form; narrative designers advocate for the marriage of story and gameplay"
[`narrative-designer-studio-role`].

**I/O sketch.**
- Input: pillar doc + session-state artifact + any locked decisions from GATE-2 (concept, tone, C1 knowledge-travels rule, C3 authored time-of-day states)
- Output: story-architecture document — act structure; canon rules; NPC role briefs (essence-descriptor level, not full personality); branching consequence map for the slice; a voice-contract summary (pointer to `voice-style-guide`) for the content agent
- Human gate: in **live mode**, this output requires Roc's review before the content agent is called; in **canned mode**, the output is staged for async review

**When called.** Once per pipeline run (or once per major slice iteration). Always before
any content agent call. If the slice Age or the act structure changes, the narrative director
runs again and all downstream agents re-read its output.

---

### Role 3 — Content Agent (Writer)

**Source archetype.** `writer` from `bullish0x`; the in-conversation "Mid Game Designer"
from `guangyuspace` [`recon.md` §1, §2]. KB grounding: the modular-characters work supplies
the orthogonal-trait pipeline this agent must follow when writing NPC lines
[`modular-characters-system-driven`]; the voice-style-guide is its primary style contract.

**Role.** Produces actual player-facing text: NPC dialogue lines, lore entries, environmental
text for the slice, and any textual content the player reads. Reads the voice-contract
summary from the narrative director's output and the voice-style-guide. Does NOT decide
what content to generate — the narrative director's architecture document is the spec.
Does NOT check its own output for consistency — the consistency checker does that in the
next stage.

The class transcript example is the I/O altitude target for this agent: "the content agent
generates NPC dialogue lines in JSON format; each line includes the speaker ID, tone from a
fixed list of 5, max length of 40 words" [`transcript` 21:37:05–21:37:27]. The exact schema
is Phase-3 work; the shape is locked here.

Roc's homogenization concern is the primary watch-out for this agent [`GATE-2-review.md` A1].
The five-tone set from the voice-style-guide is a floor, not a ceiling. The content agent
must surface distinct personality signals, not smooth them to a single register. The
`modular-characters-system-driven` technique — orthogonal trait axes, higher-order suit
tags, authored exceptions at ~5–10% frequency — is the structural guard against
homogenization.

**I/O sketch.**
- Input: narrative director's story-architecture document + voice-style-guide + NPC trait card (essence-descriptor + tone axis values) + scene-context brief (what location, what time-of-day state, what the player has previously learned per C1)
- Output: JSON batch — `speaker_id`, `tone` (from fixed set), `line_text` (40-word cap), `scene_trigger` (when this line surfaces), `canon_flags` (any claim about world-state that must be checked for consistency)
- Human gate: in **live mode**, output is staged and the consistency checker runs before any line is committed; in **canned mode**, output queues for the consistency checker automatically

**When called.** After the narrative director has produced the story-architecture document.
Called per NPC, per scene, or per content batch as specified by the orchestrator.

---

### Role 4 — Audio Specialist

**Source archetype.** `audio-director` from `bullish0x`; `sound_designer` from `colonel1223`
pipeline step 4 [`recon.md` §1, §3]. The `colonel1223` `sound_designer` is the most
specific: "adaptive 4-layer audio system — instrumentation, BPM, dynamic layers, crossfade
triggers" with Godot implementation notes as output [`recon.md` §3 kept-agents table]. For
our pipeline, the implementation notes target Unreal MetaSounds rather than Godot, but the
architectural pattern — adaptive layers, state-machine triggers, a named palette — is the
same.

**Role.** Defines the audio-tag contract and adaptive-audio state machine that powers the
USP (H15 [`_index.md` §2]). The audio-first pipeline is the game's differentiator; sounds
are pack-free collectibles, showable, giftable, and spell-component candidates
[`gdd-structure-model.md` §4 Build §8]. This agent's output is the spec that §8 and §9 of
the Build GDD are written from — the event/tag naming string pattern, the audio state
transitions, the partner leitmotif architecture. It does NOT produce audio files. It does NOT
write narrative content. Its output is a structural contract that the Build GDD §8 encodes
and that the project conventions in §9 enforce.

**I/O sketch.**
- Input: pillar doc (especially the audio-first pillar + sonic-identity goals) + narrative director's emotional arc (to align audio state transitions with narrative beats) + the slice Age's location list (to map ambient audio layers per scene)
- Output: audio-tag contract spec — naming pattern (`<Entity>_<AnimVerb>_<State>` or equivalent string), state-machine table (states × transition triggers), adaptive-layer architecture (how many layers, crossfade logic), partner leitmotif brief (emergence shape — what it starts as, how it evolves as the player progresses)
- Human gate: in **live mode**, Roc reviews the state-machine table before implementation; the naming pattern is structural and may run unattended

**When called.** Once per major design pass, after the narrative director has established
the emotional arc (because audio states must align with narrative beats). Called again if
the act structure changes substantially. The output is a Phase-3 prerequisite for writing
Build GDD §8.

---

### Role 5 — Consistency Checker

**Source archetype.** `lore_master` from `colonel1223` — the strongest signal in the recon
and the pattern the runbook specifically flagged as a natural fit [`RESYNTHESIS-PLAN.md` §5
"Watch for the consistency/verification-agent pattern"; `recon.md` §3, §4, §6].
`qa-lead` from `bullish0x` provides the typed-evidence discipline. The KB's
`procedural-narrative-generation` note identifies the "discourse-centric flip" — design for
what will be narrated to the player, not for what happens under the hood — as a relevant
framing; the consistency checker is the agent that enforces this flip after the fact
[`procedural-narrative-generation`].

**Role.** A dedicated verification satellite — reads accumulated content output and checks
new additions for internal consistency against the established canon. Does NOT generate new
content. Does NOT rewrite lines. Flags only. Its output is a deviation report that a human
reviews before content is committed.

The two-mode split is explicit for this agent:
- **Canned mode:** runs after each KB-extraction batch; checks new notes against the 157-note KB for contradictions, circular dependencies, or under-sourced claims. Flags to Roc.
- **Live mode:** runs after each AI-generated NPC dialogue batch; checks lines against the voice-style-guide register, the narrative director's canon rules, the C1 lock (knowledge travels across scenes/years with a soft in-world reminder [`GATE-2-review.md` C1]), and any previously committed content in the same scene or involving the same NPC. Flags for human review before any content is committed to file.

The `lore_master`'s system prompt in `colonel1223` is the direct model: "you maintain the
internal mythology, symbolism system, and hidden narrative layers... you ensure narrative
consistency" — read the upstream artifact first, then check the new addition against it
[`recon.md` §3 consistency signal section]. The KB's `narrative-designer-studio-role`
names this "know your reasons; defend every decision in writing" as a continuity function
[`narrative-designer-studio-role`]. These two sources converge on the same role from
different angles.

**I/O sketch.**
- Input: the content agent's output batch (JSON lines with `canon_flags`) + the accumulated canon document (session-state artifact + all prior committed content in scope) + the voice-style-guide + the narrative director's story-architecture document
- Output: deviation report — per flagged line: the claim made, the canon source it conflicts with, the severity (contradiction / thin-sourced / register-drift), and a recommended action (human review / soft-flag / pass). Does NOT include suggested rewrites.
- Human gate: **always human-gated** — the consistency checker produces a report; no content is committed without human sign-off on the report. This is non-negotiable in both modes.

**When called.** After every content agent batch, before any content is committed to file.
In canned mode, runs after each KB-extraction stage as an async check. In live mode, runs
synchronously after each content generation call.

---

### Role 6 — QA / Playtester (Narrative QA)

**Source archetype.** `qa-lead` from `bullish0x` (typed evidence per story type); `playtester`
from `colonel1223` (multi-archetype virtual playtest — Explorer / Achiever / Storyteller
archetypes, flags rage/quit/zero-feeling moments) [`recon.md` §1, §3]. The class transcript
names "synthetic audiences" as the mechanism that makes iteration faster without QA crews
[`transcript` 21:48:10–21:48:29]. The KB's `procedural-narrative-generation` "turn-taking"
model (the system gets a turn to correct drift after every player move) offers a structural
frame for what this agent evaluates [`procedural-narrative-generation`].

**Role.** End-of-pipeline quality gate. Runs after the content agent and consistency checker
have produced a batch of content, and evaluates that batch against player-experience goals —
not technical correctness (that is the consistency checker's job) but *experiential* quality:
does a given scene or NPC interaction produce a zero-feeling moment? Does the pacing violate
the cozy-rhythm pillar? Does a dialogue exchange answer questions it should leave open?

The `colonel1223` `playtester`'s multi-archetype frame transfers directly: three reader
positions (equivalent to Explorer / Achiever / Storyteller) each evaluate the same content
batch from a different motivation. A moment that stalls all three archetypes is a
hard-block. A moment that stalls only one may be a valid design decision — or a signal to
review that archetype's journey specifically.

This agent does NOT rewrite content. It produces a QA report with severity-classified
findings. It is the gate the orchestrator checks before marking a content batch as Done.

The `bullish0x` qa-lead's typed-evidence discipline maps to our content type: instead of
Logic / Integration / Visual / UI / Config story types, our types are Narrative-Logic
(does the deduction chain hold?) / Consistency (does the content checker pass?) / Register
(does the voice match the flat-register contract?) / Pacing (does the cozy-rhythm hold?).
Each content batch must produce evidence for all four types before it is marked Done.

**I/O sketch.**
- Input: a completed content batch (post-consistency-check) + the narrative director's story-architecture document + the session-state artifact (what has the player already learned at this point in the slice — C1 knowledge state)
- Output: QA report — per story type (Narrative-Logic / Consistency / Register / Pacing): PASS / FLAG / BLOCK + one-line evidence statement per item. BLOCK items must be resolved before the batch advances. FLAG items surface to Roc for judgment. PASS items are recorded in the session-state artifact.
- Human gate: in **live mode**, BLOCK and FLAG items surface immediately for human review; PASS items advance automatically. In **canned mode**, the full report surfaces in the morning session-state summary.

**When called.** After the consistency checker; before any content batch is marked Done or
committed to the Build GDD or to the game's content files. Called once per content batch,
not per individual line.

---

## 3. The orchestration pattern borrowed — and why

The three repos offer three distinct shapes [`recon.md` §4 cross-repo synthesis]:
- `bullish0x`: Human-gated consultancy bus (session-state file + approval-before-write)
- `guangyuspace`: Single-model role-switching (mode-selector + handoff files)
- `colonel1223`: Automated sequential pipeline (accumulated-context chain + on-demand satellites)

This lens proposes a **hybrid** — the "manager/satellite" pattern — drawn from all three:

**The bus is from `bullish0x`** (Pattern A). A `session-active.md` artifact is the single
coordination surface. Every agent reads it at start; every agent writes its completed output
summary back. No agent calls another directly — the orchestrator (Role 1) reads the bus and
decides what runs next. This is low-friction and traceable; the state of the pipeline at any
moment is readable from one file.

**The mode-selector is from `guangyuspace`** (Pattern B). Every pipeline invocation begins
with an explicit canned-vs-live declaration. This is cleaner than encoding the mode in
agent identity or separate runtimes. One flag, consistently applied, shifts the gate
behavior of all six roles simultaneously.

**The accumulated-context chain is from `colonel1223`** (Pattern C). Each agent receives
the output of all prior stages as part of its input. The content agent reads the narrative
director's architecture document. The consistency checker reads the content agent's batch
*and* the narrative director's document. The QA agent reads everything. This is how
inter-agent coherence is maintained in a pipeline that runs across sessions or overnight.
No agent is "surprised" by upstream decisions because those decisions are always in context.

**The satellites are from `colonel1223`** (the on-demand `lore_master`, `playtester`, `qa_tester`).
The consistency checker (Role 5) and QA agent (Role 6) are satellites — called after each
content batch, not part of the primary generation chain. They receive the chain's accumulated
output; they do not contribute to it. This keeps the generation flow clean (Roles 1–4) and
the verification layer distinct (Roles 5–6).

**The approval gate is from `bullish0x`** (Pattern D), applied asymmetrically: always-on in
live mode; bypassed in canned mode per the unattended-run override [`RESYNTHESIS-PLAN.md`
override callout]. The gate is declared in the I/O contract of each role, not enforced by
the orchestrator at runtime — so the same orchestrator script runs both modes; only the
gate behavior changes.

The result is a pipeline with a clear generation spine (orchestrator → narrative director →
content agent → audio specialist, in sequence, accumulating context) and a distinct
verification layer (consistency checker + QA, called after each content batch as satellites).
The human sits above both layers in live mode; below neither in canned mode except for the
morning review.

---

## 4. What does NOT carry over from the repos

The following is documented here to prevent scope drift during Phase-3 roster
design. All drops are per [`RESYNTHESIS-PLAN.md` §5 relevance filter].

**All code-generation specialists.** The 54-agent count in `bullish0x` is dominated by
Godot, Unity, Unreal, shader, network, and engine specialists. None transfer.
`colonel1223`'s `lead_programmer`, `codegen`, and `shader_artist` drop for the same reason.

**Art-direction and visual-pipeline roles.** The `art-director`, `technical-artist`,
`godot-specialist` (and all engine variants), `web2d-asset-pipeline`, `web3d-asset-pipeline`
all drop. Art direction is Roc's domain and is captured in Build GDD §7 as a document
section, not an agent.

**Live-service, analytics, and community roles.** `community-manager`, `analytics-engineer`,
`economy-designer`, `live-ops-designer` all drop. These are live-game maintainence roles;
the slice is a 6-week self-contained build.

**The `ux-designer` archetype — conditional drop.** `bullish0x`'s `ux-designer` could
serve Build GDD §16 (notebook/rumor-graph UI) but at Phase-3 the UI spec is framed-with-
open-questions, not a fully specced agent task. If the rumor-graph UI spec becomes a
Phase-3 agent call, this archetype is the one to un-drop. Noted here, not in the roster.

**The `game-designer` / `systems-designer` archetype — deferred.** `bullish0x`'s
`game-designer` and `systems-designer` handle core-loop and interaction-matrix spec. At
Phase-3, that work is done by Roc directly (the B3/B4 interview approach, ["probe me"
`GATE-2-review.md`]) and encoded in Build GDD §4 and §8. An agent that helps stress-test
the interaction matrix (H7/H8) could be useful, but it is not part of the narrative-content
pipeline and exceeds the ~5-agent cap. Parked.

---

## 5. Thin spots and flags for GATE 2 and Phase 3

- **The I/O schemas are sketches, not specs.** The class transcript is explicit: "the content
  agent generates NPC dialogue lines in JSON format — `speaker_id`, `tone ∈ {5}`, max 40 words"
  [`transcript` 21:37:05–21:37:27]. That specific JSON shape is Phase-3 work. This lens supplies
  the altitude and the field names; the exact schema must be designed and validated in Phase 3.
  **Single source flag:** the class example is the only JSON-altitude precedent for our exact
  content type. Do not treat it as a complete spec.

- **The consistency checker has no precedent in the KB narrative notes.** The `lore_master`
  pattern is entirely from `colonel1223` — a single repo, one agent file. The KB's 157 notes
  do not contain a consistency-agent I/O spec. This role is the least grounded in the KB;
  its design is the most repo-dependent. Flag for human validation at GATE C.

- **The session-state bus format is unspecified.** The `bullish0x` `active.md` pattern is
  named in the recon but no field schema was captured. Phase 3 must design `session-active.md`
  fields from scratch — what it records, at what granularity, and how agents update it.

- **The audio specialist's output format has no KB precedent.** H15 (audio-tag contract) is
  ○○○ in the hole-coverage map [`_index.md` §2]. The audio specialist role is grounded in the
  repo archetypes and the game's audio-first USP, but the actual contract format (string
  patterns, state-machine table structure) is Phase-3 net-new. The role is named here; the
  spec is a Phase-3 first-principles design task.

- **Roc's homogenization concern (A1) is unresolved at this lens level.** The content agent
  uses the orthogonal-trait pipeline from `modular-characters-system-driven` as its guard
  [`GATE-2-review.md` A1]. But whether that pipeline produces perceptually distinct NPCs at
  the voice register this game demands is a question that requires actual Phase-3 writing
  samples — it cannot be validated in a structural sketch. The NPC-variance section of the
  voice-style-guide (added in Round B) is the reference; the content agent must be tested
  against it, not trusted to comply by design.

---

## 6. How this crew maps to Build GDD §5

Per the two-doc structure model, Build GDD §5 is the one place where all agent JSON-I/O
schemas live [`gdd-structure-model.md` §4 Build §5; §5 what-lives-where]. This lens
supplies the altitude frame for §5's two subsections:

**§5a — In-game runtime agents (H10).** Not this crew. The in-game agents (the "wow" /
emergent-partner showcase, canned-vs-live runtime modes) are a separate architecture that
this lens explicitly does not address, per the runbook's hard context separation
[`RESYNTHESIS-PLAN.md` §5 "Two contexts, kept distinct"].

**§5b — Dev-crew pipeline roster (H11).** This crew — the six roles above — populates
this subsection. At Phase-4 writing time, each role becomes one row in a roster table:
name · role · input fields · output fields · when-called · human-gate · realistic-capability
check. The capability check is per the class instruction: "can an agent actually build
this?" [`transcript` 21:39:34–21:40:16]. The QA agent's multi-archetype playtest is the
most capability-sensitive role; flagged for the realistic-capability check specifically.

---

*Access note: all three repos reached; no gaps. Sources cited inline. Claims that rest on
a single thin source are flagged with "Single source flag" in §5.*
