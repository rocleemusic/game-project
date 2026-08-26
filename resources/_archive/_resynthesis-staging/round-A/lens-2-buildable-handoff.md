---
kind: resynthesis staging artifact
round: A
lens: L2 — buildable / agent-handoff
date: 2026-07-17
status: staged (not promoted; awaits GATE 2 morning review)
inputs:
  - knowledge-base/synthesis/gdd-structure-model.md
  - resources/GDD-template-draft.md
  - resources/concept-dig-notes.md
  - game-project-resources.md (descriptions only)
  - knowledge-base/myst-proposal/proposal-page1.md
  - knowledge-base/myst-proposal/proposal-page2.md
  - knowledge-base/synthesis/myst-techniques.md (Group 4)
  - knowledge-base/RESYNTHESIS-PLAN.md
  - GATE-2-review.md
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (transcript)
---

# Lens L2 — Buildable / Agent-Handoff
## A Proposed Build GDD Skeleton

**Lens stance.** The Build GDD is a handoff contract, not a design diary. Every sentence
in it either tells the dev-crew or an agent exactly what to do, or it names an open
question with enough precision that Phase-3 spec work can close it without a design
meeting. The test for any section: could you hand it to an agent with an orchestrator
and get deterministic output? If not, that sentence is a wish, not a spec — move it to
the Parking-Lot doc or to `§12 Open`.

The class transcript makes the distinction concrete:
> *"The AI will make the game more interesting by generating dynamic content."* — wish.
> *"The content agent generates NPC dialogue lines in JSON format. Each line includes
> `speaker_id`, `tone` from a fixed list of 5, max length of 40 words."* — spec.
> [transcript, 21:37:05–21:37:27]

That delta is the whole job of the Build doc. Everything below is organized around
maintaining that delta clearly.

---

## 1. The Two-Doc Architecture — What This Lens Proposes

The class explicitly validates a two-doc model for a narrative-heavy project. When a
student asked whether it was acceptable to weave narrative throughout a large GDD, the
answer was: keep a short pitch version (1–3 pp, maybe even one), and a more expansive
version with the full narrative woven in and all additional detail. The short version is
what you turn in and show off; the expansive version is what you hand to agents and the
dev-crew. [transcript, 21:55:50–21:56:26]

This is also ratified in the `RESYNTHESIS-PLAN.md` §2 locked inputs:
> *Two GDDs. A Pitch GDD (1–3 pp, even 1) — the graded turn-in... and an expansive Build
> GDD — narrative woven in, the doc handed to the dev-crew/agents. Plus a Parking-Lot doc
> for cut ideas.* [`RESYNTHESIS-PLAN.md` §2]

**The L2 position:** the Build doc is NOT a longer version of the Pitch — it is a
different document with a different primary reader (the dev-crew and the agent
orchestrator, not a class reviewer or collaborator). Its altitude is T2→T3 throughout.
T1 pitch prose from the Pitch doc is referenced or summarized in one sentence per
section, never re-expanded.

### Three documents, one pipeline

| Doc | Primary reader | Altitude | Pages (est.) | What it omits |
|-----|---------------|----------|-------------|---------------|
| **Pitch GDD** | Grader, collaborator, publisher stand-in | T1 throughout; 1–3 pp | 1–3 | All build detail, all agent I/O, all open questions except the one-line "named open question" |
| **Build GDD** | Dev-crew, agent orchestrator | T2→T3; narrative-woven | 10–18 | Pitch-sell language, redundant motivation prose, anything not yet at spec altitude |
| **Parking-Lot doc** | Roc's future self | Unformatted; append-only | Unbounded | Nothing — it is the never-delete home for every cut idea |

---

## 2. The Build GDD Skeleton — Section by Section

The 12-section spine from `resources/GDD-template-draft.md` and `gdd-structure-model.md`
is the authoritative backbone. The Build doc inherits that spine. This lens specifies
**altitude, agent-handoff shape, and JSON-I/O positions** for each section, and flags
what belongs in the Build doc but NOT in the Pitch.

### §1 — Elevator Pitch (Build-doc altitude: one paragraph, not one sentence)

**Pitch altitude:** one sentence. The Build doc earns one paragraph — the sentence plus
the player's full experiential arc in plain language, so every agent reading §5 onward
already knows what emotion the build is serving.

**Build-doc addition:** append a single "dev-crew note" line below the paragraph:
> *Dev-crew note: every feature added must answer yes to "does this help a player feel
> retrospective significance?" If no, it belongs in the Parking Lot.*

This is the Build doc's equivalent of the Pitch's elevator hook — not a creative move,
a triage filter for agents.

**Not in Pitch:** the dev-crew note. Pitch stays one sentence.

---

### §2 — Design Pillars + Non-Goals (Build-doc altitude: T1 + build implications)

**Pitch altitude:** pillar phrases as a flat list. Non-Goals as a flat list.

**Build-doc addition:** after each pillar, one sentence stating the build implication —
what an agent must never do that would violate it. Example pattern (grounded in locked
decisions, not invented content):

- *Strategy over dexterity* → no timed input, no precision-placement gate, no action
  that punishes hand speed; replace with knowledge-gate or pattern-match equivalent.
  [`concept-dig-notes.md` Session 2; `myst-techniques.md` 5.2 Skip-for-scope]
- *Informational-feedback law* → a wrong action by the player must produce a
  context-local observable consequence that teaches the mechanism; silent or generic
  fail is a build error. [`myst-techniques.md` 1.5; `pnc-grammar.md`]
- *Pull, not push* → no agent may generate NPC dialogue that issues a quest, a
  directive, or a numbered task; world state and social attention are the only valid
  pulls. [`concept-dig-notes.md` Session 4; `proposal-page1.md` Watch-out]

Non-Goals column gains one "agent consequence" column: what the agent must refuse to
generate if asked. This is the single most valuable addition for an agentic pipeline —
agents need the Non-Goals stated as refusal rules, not just design philosophy.

**JSON-I/O position:** the Non-Goals refusal list is the first place in the Build doc
where agent behavior is constrained by spec. It is not a schema yet — the schema lives
in §5 — but it sets up the refusal contract the orchestrator enforces.

**Not in Pitch:** the per-pillar build implications and the agent-refusal column.

---

### §3 — Inspirations (Build-doc altitude: T1 + the specific grammar borrowed)

**Pitch altitude:** game + one-line take.

**Build-doc addition:** for each inspiration whose grammar is adopted, add a "what we
spec-borrow" row — the precise structural move, not the vibes. Examples grounded in KB:

| Game | Pitch take | Build-doc spec-borrow |
|------|-----------|----------------------|
| Outer Wilds | knowledge-as-progression | Knowledge travels across scene/year boundaries free of charge; items require pack-triage; wrong inference teaches, never hard-blocks. [`GATE-2-review.md` C1; `myst-techniques.md` 1.4] |
| Myst (Ages) | puzzle grammar | Five-field puzzle template (Problem / Circumstance / Clues / Solution / The Idea) mandatory for every authored gate; "The Idea" line is non-negotiable. [`myst-techniques.md` 4.1; `gdd-structure-model.md` §1] |
| Frieren | flat register, retrospective significance | Voice contract: agent-generated NPC dialogue must stay in the flat-register spec from `voice-style-guide.md`; significance is preloaded, not performed at output time. [`voice-style-guide.md`; `concept-dig-notes.md` Session 3] |

This is the build implications of the inspiration list — it turns the Pitch's aesthetic
references into agent-facing contracts that the orchestrator can point at.

**Not in Pitch:** the spec-borrow column.

---

### §4 — Core Loop & Mechanic (Build-doc altitude: T2; verb families spec'd; undecided sub-verbs parked)

**Pitch altitude:** core verb + loop tiers in bullet form.

**Build-doc version:** each loop tier gets its own subsection with the decision surface
spelled out.

**The four action families** (locked, from `concept-dig-notes.md` Session 8; `GDD-template-draft.md` §12 Resolved):
- **Collect** — all collectibles: items, components, audio recordings, spells/recipes, mementos.
- **Make** — recipe pattern generalized: spells, dishes, art all share one structure (components + learned knowledge = output).
- **Show/Ask** — non-committal probe: present an item, sound, or topic to an NPC; read the reaction. Distinct from gift.
- **Use** — apply any held thing (spell or item) to a target.

**Receiver-determined outcomes** (pillar-grade implementation rule, `concept-dig-notes.md` Session 8):
The target of a directed interaction holds the response logic. The same spell lands
differently on a chicken, a door, or a neighbor. This is the multi-agent showcase at
the interaction level — every NPC is an agent owning its own response. Build spec: the
action verb encodes only *what* was done, never *what happened*; outcome resolution is
the receiver's domain.

**Loop tiers in the Build doc:**

| Tier | Duration | Shape | Decision state |
|------|----------|-------|----------------|
| Moment | Seconds | Single action-receiver-outcome cycle; notebook writes itself on significant beats | Locked |
| Run | 1 festival week (~3 years of festival attendance, each a session) | Daily attention allocation → festival night → ending vignette | Locked [`concept-dig-notes.md` Session 7] |
| Meta | Full incarnation arc | Partner solidification → phase-change → true ending → wipe option | Locked [`concept-dig-notes.md` Session 9] |
| Run-end | Pack-triage | Player chooses what carries forward; knowledge always free | Locked [`concept-dig-notes.md` Session 6] |

**Agent-relevant call-out:** the moment loop is the highest-frequency agent I/O surface.
Every NPC interaction, every Show/Ask probe, every Use action produces a receiver
response. The content agent's output format for this surface is specified in §5.

**Parked sub-verbs** (go to Parking Lot, not the Build doc body): mid-year festival
events, group endings, non-attachment vignette variants, the full archetype system
beyond the slice persona. [`concept-dig-notes.md` Sessions 7–8; `gdd-structure-model.md` §3]

---

### §5 — Agentic AI Showcase (Build-doc altitude: T2 in-game mode → T3 dev-crew roster; JSON-I/O specs live here)

This is the most important section in the Build doc from an agent-handoff perspective,
and the thinnest in the KB. [`_index.md` §3.4; `gdd-structure-model.md` Honest thin spots]
The KB provides framing (`ai-workflow/` notes, the `narrative-lego` tiering, the class
spec); the actual roster must be designed largely from scratch in Phase 3.

#### 5a — Two-mode architecture (locked)

**Canned mode:** at least one fully pre-generated path, a few total, playable with no
agent connected. Deterministic, QA-able, shippable to anyone.
**Live mode:** connect an ICM (In-Context Model) → unique experience every time.
[`GDD-template-draft.md` §12 Resolved; `concept-dig-notes.md` Session 9]

The dev-crew pipeline serves both modes — canned paths are generated by the same
pipeline that powers live mode; Roc curates. The agentic showcase exists at two layers:
runtime agents (optional), pipeline agents (always present).

#### 5b — In-game runtime agents

**What the Build doc must specify (not invent — Phase 3 fills content):**

For each in-game runtime agent:
- Name and single sentence: what it does, one feature.
- Input schema (what the agent receives at call time).
- Output schema (what it returns; format must be parseable by the game runtime).
- When it is called (trigger event).
- Realistic-capability check: can a current-generation LLM actually do this in one
  call, or does it require multi-step orchestration? [transcript, 21:40:16–21:40:48]

**The class's canonical example — applied to this game's content agent:**

> Content agent generates NPC receiver-response lines. Input: `{ npc_id: string,
> action_type: "collect" | "make" | "show_ask" | "use" | "gift" | "talk",
> item_id: string | null, player_year: int, relationship_score: float }`.
> Output: `{ npc_id: string, tone: "warm" | "wary" | "surprised" | "deflective" |
> "moved", response_text: string (max 40 words), teaches_clue: bool }`.
> [transcript, 21:37:05–21:37:27; `concept-dig-notes.md` Session 8 receiver-determined outcomes]

That shape is the template. Every in-game agent in §5b follows this pattern in the
Build doc. Agents whose I/O cannot be written to this level of specificity belong in
`§12 Open` with a named question, not in the body.

**Realistic-capability check (flag for Phase 3 spec):**
- Tone classification from a fixed 5-set: achievable in a single call. Adopt.
- Receiver-response generation at ≤40 words with a `teaches_clue` flag: achievable.
  The constraint (40 words) is also the quality lever — forces compression.
- Cross-life NPC essence consistency (the same soul in a different role): requires
  an essence-signature lookup or a RAG call against the KB. Multi-step. Flag as
  "orchestrated, not single-call" in Phase 3. [`concept-dig-notes.md` Session 8
  personality cards; `_index.md` H11]
- Partner solidification scoring: accumulative state, requires persistent memory.
  Flag as "session-state lookup + scoring call, not generative." Phase 3 spec.

#### 5c — Dev-crew pipeline agents (the H11 roster)

The class spec is ~5 agents + an orchestrator. One-agent-per-feature. "Agent role
clarity" is graded. [`RESYNTHESIS-PLAN.md` §2; transcript, 21:51:40–21:54:45]

**What the Build doc needs per dev-crew agent (Phase 3 fills the names and I/O):**

| Field | Description |
|-------|-------------|
| **Name** | Single-word or short compound; one agent, one feature |
| **Role** | One sentence: what feature this agent owns |
| **Input** | What the orchestrator passes it; format |
| **Output** | What it returns; must be parseable by the pipeline |
| **When called** | Trigger: manually, on schedule, or on content-request |
| **Human gate** | Does a human (Roc) curate before it writes to the canned path? |
| **Realistic check** | Can current LLMs do this in one call? Multi-step? Known limitations? |

**Starter seed from KB** (frames only — Phase 3 designs the I/O):
- **Narrative / Content agent** — generates NPC receiver responses, echo strands,
  vignette variants to the JSON-altitude spec above. Highest call frequency.
  [`ai-workflow/ai-workers.md`; transcript, 21:37:05]
- **Consistency / Canon agent** — reads the canned path KB and flags any NPC behavior,
  relationship score, or item reference that contradicts a locked decision or the
  voice-style-guide flat-register contract. Low call frequency; high stakes.
  [transcript Q&A — the consistency/verification-agent pattern; `RESYNTHESIS-PLAN.md` §5]
- **Orchestrator / Manager** — routes calls to sub-agents, assembles multi-agent
  outputs into a canned path draft, surfaces human-gate checkpoints. Pattern from
  [`ai-workflow/ai-workers.md`; `ai-workflow/godot-architecture.md`]

**Parked to Phase 3 (named open questions, not body content):**
- Full I/O schemas for each dev-crew agent.
- Token budget estimate (H13 — currently ○○○ in KB; Phase-3 math task).
  [`_index.md` §2 H13]
- API limits / context-window spec per agent (H12 detail). [`_index.md` §2 H12]
- Human-gate cadence — how often does Roc curate before content enters the canned path?

**The Build doc's §5 honestly says:** here is the architecture and the I/O shape; here
are the named open questions; the full roster is Phase-3 work.

---

### §6 — World & Progression (Build-doc altitude: T2; myth-form prose + persistence spec)

**Pitch altitude:** one-paragraph myth-form origin + flat persistence list.

**Build-doc version:** same myth paragraph (this is not expanded in the Build doc —
it is already at pitch-density for the world origin) followed by a structured
persistence table and a world-state decision tree the agents use.

**Persistence spec** (all locked, `GDD-template-draft.md` §12 Resolved):

| Layer | Survives run end | Survives wipe | Agent consequence |
|-------|-----------------|---------------|-------------------|
| Knowledge (spells, recipes, deductions) | Yes | Yes | Content agent may assume prior-knowledge state; no re-explanation needed |
| Items | Via pack-triage only | No | Pack-triage resolver must query carried items before generating Year N content |
| Hub | Yes (shared across timelines) | Yes | Hub content is stable; agents do not re-generate hub state |
| NPC roles | Fixed within a life | Reshuffled at new life | Consistency agent validates role against current life's role table before generating |
| Partner solidification score | Yes | No (wipe resets) | Scoring agent reads session-state; does not re-derive from scratch |

**Superposition rule** (locked, `concept-dig-notes.md` Session 9):
Before partner solidification, no NPC is the partner — all are potential. The content
agent must not generate partner-grade echo content for an NPC until that NPC's
solidification score passes the threshold. Build doc states the threshold as a named
open question until Phase-3 math derives it.

**Time architecture** (locked, `concept-dig-notes.md` Session 5–7):
Nested clocks — day (soft limit via world state, no energy bar) → week/run (festival
deadline) → cycle (incarnation). The dev-crew calendar agent uses the day-layer to
determine which content is available (shops closed, NPCs sleeping, welcomes expired).
This is authored state, not a simulation. [`GATE-2-review.md` C3 carve-out]

---

### §6a — Slice World / "the Age" (Build-doc altitude: T2, gestural; one functional paragraph per location)

**Pitch altitude:** motif-only (one line per area). [`proposal-page1.md`; `gdd-structure-model.md` §1 §6a]

**Build-doc version:** one functional paragraph per location following the map-annotation
format [`myst-techniques.md` 4.7]:
> *[Location name] — [what this space was for originally / functional backstory one
> sentence] — [what the player does here] — [what knowledge or item it gates] —
> [dominant object class that gives it visual identity per `myst-techniques.md` 3.11]*

This format is the minimum location spec for a dev-crew agent to generate scene content
without designing the scene itself. It answers "what does the player do here and what
changes" without becoming a room sheet (Van Buren guardrail G6).

**Thin by license:** as `proposal-page1.md` establishes, age theming is one-line,
motif-only. Environmental storytelling lives in the world, not in the doc. The Build
doc licenses this thinness explicitly so Phase-4 writers don't over-spec locations.

**Parked:** full NPC roster (H1 — Roc's call, Phase 3), seed item list (H3 — Roc's
call, Phase 3). The §6a paragraphs reference these as named open questions.

---

### §7 — Art & Audio Direction (Build-doc altitude: T1→T2; 2D-vs-3D stays a named open question)

**Pitch altitude:** tone words + concept refs (T1). Reference-based.

**Build-doc addition:**

1. **Dominant object class per location** (one line each) — the visual identity lever
   that does not require a full art spec. [`myst-techniques.md` 3.11]
2. **Color grammar** — grounded in the KB's art-direction batch. The restraint model
   from Frieren's color design (desaturation = emotional weight, hue-count-as-hierarchy)
   and Ghibli's palette discipline (specific warm/cool balances that read as cozy, not
   garish) are named without reproducing copyrighted reference imagery.
   [`_index.md` §3.11; art-direction notes]
3. **"Going big" register** — per Roc's D1 decisions (`GATE-2-review.md`): permitted
   swell at narrative/reward payoffs + sprinkled mid-moments of wonder/beauty; can be
   large-scale or intimate zoom. The Build doc names the two modes (payoff swell /
   sprinkled wonder) and states which sections of a run each applies to, so art and
   audio direction agents have a trigger model, not just aesthetic guidance.
4. **Sonic identity** — one paragraph. The partner leitmotif that surfaces from festival
   ambience as data accumulates [`concept-dig-notes.md` Session 7 audio sibling] is an
   agent-relevant spec: the audio agent needs to know the leitmotif exists as a gradual
   emergence, not a one-time reveal.

**Named open question (stays in §12):** 2D vs. 3D art call (H17) — refs ground both
poles; Roc's decision at Phase 3. The Build doc does not falsely resolve this.

**Not in Pitch:** color grammar detail, "going big" trigger model, sonic identity paragraph.

---

### §8 — Audio-First Pipeline / USP (Build-doc altitude: T3; the contract lives here)

This is the Build doc's highest-value section from a dev-crew-handoff standpoint. It is
also the thinnest in the KB (H15 = ○○○). [`_index.md` §2 H15; `gdd-structure-model.md` Honest thin spots]

**What the Build doc must specify:**

1. **Event/tag naming contract** — the convention that allows an audio agent to attach
   sound to animation events without a human intermediate. Concretely: the naming rule
   must be stated as a string pattern, not described in prose. Pattern shape:
   `<Entity>_<AnimationVerb>_<State>` — e.g. `NPC_Speak_Warm`, `Player_Collect_Item`.
   The exact strings are Phase-3 finalize-in-place. The pattern is the spec.
2. **Auto-linking rule** — how the mirrored directory tree
   (`Game/Animation/<Entity>/<anim>` ↔ `Game/Audio/<Entity>/<anim>`) causes automatic
   audio attachment. Stated as a directory rule, not prose.
3. **Audio as object spec** — sounds are collectibles without pack space; they travel
   free like knowledge; they are show-able (play to an NPC), gift-able (a recorded
   melody as the declaration gift), candidate spell components.
   [`concept-dig-notes.md` Session 8 audio as objects]
   This is the sound-designer mechanic that makes this game distinctive — the Build doc
   calls it out explicitly so the audio agent understands that audio objects are
   first-class game objects with verb coverage, not just atmosphere.
4. **Deliberate recording, never auto-save** — the player must choose to record; the
   notebook writes itself only for text moments. This is a build constraint (no
   auto-capture system needed), not a design opinion.

**Named open question (§12):** the full H15 audio-tag contract (the actual
event/tag string library) — Phase-3 spec work.

---

### §9 — Project Conventions (Build-doc altitude: T3; concrete strings, not prose)

Same content as the Pitch doc but stated at higher precision. The Build doc's §9 is
a two-tree specification that enables §8's auto-linking. If §9's convention is not
followed, §8's auto-link contract breaks. Call this dependency out explicitly.

**The one rule stated as a rule:**
> The path is the metadata. Directory structure must be interpretable without opening
> any file. Mirrored trees are the mechanism: `Game/Animation/<Entity>/<AnimVerb>/`
> and `Game/Audio/<Entity>/<AnimVerb>/` must stay structurally identical at all times.
> An audio agent may assume the mirror is valid; a CI check enforces it.

**Not in Pitch:** the CI check, the mirror-validity assumption, the dependency arrow to §8.

---

### §10 — Platform, Engine & Scope (Build-doc altitude: T2 engine → T3 slice math)

**Pitch altitude:** engine one line; slice contract as a short list.

**Build-doc version:**

1. **Engine** — Unreal (locked). One sentence. MetaSounds named as the audio-pipeline
   justification. [`concept-dig-notes.md` Session 2; `GDD-template-draft.md` §12 Resolved]
2. **Slice contract** (all five items locked, `concept-dig-notes.md` Session 9):
   - One run is fun (up to the festival) — quality bar; polish budget lives here.
   - The full cycle loop is playable end to end.
   - The story pipeline holds for a few runs.
   - NPCs have different-role content (reshuffle demonstrable, not promised).
   - 1–2 endings ship; the true ending does not.
3. **Content-budget table** — the Build doc must state this as a named open question
   with its derivation formula:
   > *Content budget = viable_NPC_candidates × years × day_slots × interactions_per_slot
   > + echo_strands × candidates + descriptor_reaction_lines × NPC_count.*
   > [`concept-dig-notes.md` Session 9 content-budget levers]
   > This table is Phase-3 math, but the formula belongs in the Build doc now so
   > the Phase-3 spec work has a target.
4. **Van Buren scope guardrails** referenced (not repeated) — the Build doc points to
   `gdd-structure-model.md §4` guardrail table for the full list.

**Named open questions (§12):** slice math derivation (locations × days × NPCs ×
years), content-budget table with real numbers, 2D-vs-3D call, token budget.

**Not in Pitch:** the content-budget formula, the Van Buren reference, the derivation
formula.

---

### §11 — Milestones (Build-doc altitude: T1; dates + deliverable, one line each)

Identical content in Build and Pitch. The Build doc may add a "Phase-3 blocking items"
sub-row per milestone — what must be Phase-3 spec'd before that milestone can close.
This is an agent-orchestrator input, not Pitch content.

---

### §12 — Unresolved Questions (Build-doc altitude: ledger)

**The Build doc's §12 is more populated than the Pitch's** — the Pitch shows the Pitch's
open questions only (a reader does not need the full Phase-3 todo list). The Build doc
maintains the full ledger.

**Currently Open** (all require Phase-3 work):
- Slice math: locations × days × NPCs × years — re-derive at Phase-3 merge.
- Content-budget table with real numbers — derivation formula above; fill at Phase 3.
- Which 1–2 endings ship in the slice — "not this life" + one warmer variant are
  natural candidates, but the decision is Roc's.
- 2D vs. 3D art call (H17) — Roc's decision.
- Token budget (H13) — math task; ○○○ in KB.
- H15 audio-tag string library — finalize-in-place at Phase 3.
- Full H11 dev-crew I/O schemas — Phase-3 design.
- Partner solidification threshold — Phase-3 math.
- Human-gate cadence for dev-crew pipeline — Phase-3 spec.
- API limits / context-window constraints per agent (H12 detail) — Phase-3.
- Map shape (modular vs. one-big-map) — `GATE-2-review.md` C2 open; Phase-3 spec.

**Resolved** (graduated with pointers — never deleted):
All items from `GDD-template-draft.md` §12 Resolved carry forward verbatim.

---

## 3. Where the JSON-I/O Specs Live

The class example makes the landing zone explicit: JSON-altitude I/O specs belong in
`§5 Agentic AI Showcase`. [transcript, 21:37:05–21:37:47] But the Build doc also needs
I/O-shape pointers at the sections that generate the content — so the reader of §4 or
§6 can follow the arrow to the spec that governs output.

**Spec home** (Build doc §5) — the full I/O schema lives here:
- In-game content agent I/O (NPC receiver responses).
- Dev-crew pipeline agent I/O (per the Phase-3 roster spec).
- Orchestrator routing contract.

**Pointer-only locations** (not the spec itself — just the arrow):
- §4 Core Loop — "receiver-response format: see §5 content agent I/O."
- §6a Slice World — "NPC content generation: see §5 content agent I/O."
- §8 Audio-First Pipeline — "audio object tagging: see §5 audio agent I/O [Phase-3]."

This discipline keeps the I/O spec in exactly one place (§5) while making every
section that touches agent output aware of where the contract lives.

---

## 4. What Belongs in the Build Doc but NOT in the Pitch

The table below is the practical what-lives-where guide for the two-doc split.

| Content | Build doc | Pitch doc | Why the split |
|---------|-----------|-----------|---------------|
| Per-pillar agent-refusal rules | Yes | No | Pitch reader needs to understand the design; dev-crew needs a refusal contract |
| Spec-borrow column for inspirations | Yes | No | Build context; not pitch sell |
| Receiver-determined outcomes implementation rule | Yes | No (gesture only) | Dev-crew / agent build constraint |
| Persistence table with agent consequences | Yes | No | Orchestrator input; not pitch content |
| JSON I/O schemas for all agents | Yes (§5) | No | Build handoff artifact; grader needs the concept, not the schema |
| Content-budget formula and named open question | Yes | No | Phase-3 math; Pitch stays a clean promise |
| Van Buren guardrail table reference | Yes (pointer) | No | Build scope-protection |
| Audio-first pipeline T3 contract | Yes (§8) | No (gesture at "audio-first" pillar) | Differentiator in full detail belongs in Build |
| Project conventions as string rules with CI note | Yes (§9) | No (shape only) | Dev-crew dependency |
| §12 full open-question ledger | Yes | No (one-line "named open questions" only) | Pitch shows clean state; Build shows honest state |
| Myth-form origin paragraph | Yes AND Pitch | Both | This is pitch-sell AND world context; short enough to carry both |
| Pillar list | Yes AND Pitch | Both | Settle-the-argument function applies in both contexts |
| Inspirations table (without spec-borrow column) | Yes AND Pitch | Both | Short enough; remove spec-borrow column for Pitch |
| Milestones | Yes AND Pitch | Both | Dates are factual; same in both |
| Core loop tier table (names only) | Yes AND Pitch | Both | Pitch gets tier names; Build gets the full per-tier spec |

---

## 5. Handoff to Agents — Structural Protocol

The Build doc alone is not enough for an agent orchestrator. Three additional artifacts
must exist before agents can run against it:

1. **The voice-style-guide** (`synthesis/voice-style-guide.md`) — the content agent's
   voice contract. The Build doc's §5 points to this by reference; it is not inlined.
2. **The pnc-grammar** (`synthesis/pnc-grammar.md`) — the puzzle/interaction grammar.
   The content agent uses the five-field puzzle template and the gate archetypes from
   this doc; §4 and §6a point to it by reference.
3. **A versioned knowledge-base pointer** — the consistency agent needs a stable
   snapshot of the canonical KB state to run canon checks against. The Build doc's
   §5c dev-crew spec must name this pointer.

**Agent-orchestration shape** (grounded in KB seeds, Phase-3 designs the actual roster):

The class spec: ~5 agents + an orchestrator. One-agent-per-feature. The orchestrator
receives the Build doc as its primary context document. When the orchestrator calls a
sub-agent, it passes:
- The relevant Build doc section (not the whole doc).
- The relevant voice-style-guide section.
- The relevant pnc-grammar section (if content-related).
- The NPC / location / item context for that call.

This is the "context-slicing" discipline from the class Q&A: an agent with all the
context for one feature can be called precisely when that feature needs modification,
without reloading the entire project. [transcript, 21:55:01–21:55:21]

**Two-mode context split** (locked, `concept-dig-notes.md` Session 9):
- Dev-crew agents always run (they build the canned paths in the pipeline).
- Runtime agents run only in live mode; the same pipeline can gate on `mode = "live"`.
- The orchestrator's routing contract names which agents are always-on vs. live-only.

---

## 6. Realistic-Capability Check — What Can an Agent Actually Build?

This is the Build doc's honest accounting. Every section above is grounded in what
current-generation LLMs can do reliably. The flags below are Phase-3 decisions, not
deferrals of the question.

| Feature | Agent-buildable? | Constraint / risk |
|---------|-----------------|-------------------|
| NPC receiver response (≤40 words, 5-tone set) | Yes — single call | Quality depends on voice-style-guide contract specificity |
| Personality card descriptor fill | Yes — structured output | 5–10 descriptors per NPC is tractable |
| Vignette variant generation (15-sec audio-led fragment) | Yes — with template | Template must constrain structure; free-form vignettes drift |
| Echo strand generation (cross-life callback) | Yes — with RAG context | Requires NPC essence-signature KB lookup; multi-step orchestration |
| Partner leitmotif emergence (gradual from ambience) | Partially — authored states, not simulation | Per `GATE-2-review.md` C3: authored states OK, simulation is not |
| Cross-life NPC essence consistency | Yes — with canon check | Consistency agent validates; human gate before canned-path commit |
| Solidification scoring | Yes — algorithmic, not generative | Scoring logic is deterministic; agent reads state, does not generate it |
| Full slice world from scratch | No | Content is Roc's to supply; agents generate within spec, not instead of spec |
| Magic system spell content | No | H6 = ●●○ in KB; Roc supplies the spell list; agents generate receiver responses to spell use |
| Authored past-life stories | No (for core canon) | "Re-roll texture, never truth" — authored canon is human-written; agents generate within it |

---

## 7. Honest Thin Spots (for the GATE 2 morning review)

1. **§5 remains the critical-path under-sourced section.** The KB supplies framing and
   mindset (H10/H11 ●●○ and ●●●) but no I/O-contract schemas. This lens has sketched
   the I/O shape using the class example and the KB's interaction model; the actual
   Phase-3 spec must design and name the full roster. Do not let the sketch imply
   readiness. [`_index.md` §3.4]

2. **§8 audio-first pipeline is the Build doc's highest-value, least-supported section.**
   The USP lives here; the KB gives shape but no string-level contract (H15 = ○○○).
   Phase-3 must finalize the event/tag library in-place. Do not ship the Build doc
   with prose descriptions where string patterns are needed. [`_index.md` §2 H15]

3. **The NPC-variance tension is not resolved at this altitude.** `GATE-2-review.md`
   flags the risk of homogenizing NPCs through a flat-register voice contract. The
   Build doc's §5 I/O spec uses a 5-tone set as the differentiation lever; but the
   actual personality range emerges during writing (Phase 3). The Build doc must leave
   this explicitly open — the tone set is a floor, not a ceiling. [`GATE-2-review.md` A1]

4. **The content-budget table is a named open question, not a resolved spec.** The
   formula is given; the numbers come from Phase-3 math. The Build doc should not
   present the formula as a substitute for the table. [`_index.md` §2 H14]

5. **Map shape (C2) is deferred.** The Build doc's §6a can be written at gestural
   altitude regardless of whether the map is modular or one-big-map; the location
   paragraphs are the same either way. But the orchestrator's routing logic differs
   between the two shapes. Flag this in §5c and §12. [`GATE-2-review.md` C2]
