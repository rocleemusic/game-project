---
kind: synthesis artifact — Round C compare pass
artifact: dev-crew-architecture COMPARE (three-lens side-by-side + recommended blend)
sources:
  - _resynthesis-staging/round-C/lens-1-kb-grounded.md
  - _resynthesis-staging/round-C/lens-2-external-archetype.md
  - _resynthesis-staging/round-C/lens-3-class-spec.md
  - _resynthesis-staging/round-C/recon.md
  - knowledge-base/synthesis/_resynthesis-staging/round-A/gdd-structure-model.md
  - knowledge-base/RESYNTHESIS-PLAN.md (§2 locked inputs; §5 guardrails; unattended-mode override)
  - knowledge-base/_index.md (§2–3 hole-coverage + honest findings)
  - GATE-2-review.md (Roc's locked/open calls)
  - knowledge-base/ai-workflow/building-ai-workers.md
  - knowledge-base/ai-workflow/godot-game-architecture.md
  - knowledge-base/narrative/narrative-designer-studio-role.md
  - knowledge-base/narrative/modular-characters-system-driven.md
  - knowledge-base/narrative/narrative-lego-ken-levine.md
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (class transcript)
built: "Phase 2.5 resynthesis (2026-07-17)"
serves:
  - H11 (dev-crew roster)
  - H10 (narrative pipeline, by adjacency)
status: "STAGED candidate for GATE 2"
---

# Round C COMPARE — Dev-Crew Architecture: Three Lenses Side-by-Side + Recommended Blend

**How to use this.** This is the adjudication document, not the deliverable. It sets the three
Round-C lenses (L1 KB-grounded, L2 external-archetype, L3 class-spec) next to each other on the
decisions that actually differ, names where they agree (agreement = high confidence, adopt), names
where they diverge (divergence = a real choice, resolve here), and states the recommended blend that
becomes `dev-crew-architecture.md`. The companion deliverable is the roster itself; this file is why
that roster looks the way it does. Every resolution traces to a source. Where the three lenses cannot
close a gap, it is flagged as a Phase-3 open question — not papered over. H11 is *"the thinnest
required section... design + name the dev-crew roster largely from scratch"* [`_index.md` §3.4], so a
disciplined compare matters more here than in the other Round-C artifacts.

---

## 1. The three lenses in one sentence each

- **L1 — KB-grounded.** Builds the crew from what the 157-note KB *says the pipeline must do*: derives
  a four-stage content pipeline (Schema → Greybox → Prose → Canon-check) and maps agents to stages;
  names a Persona Architect, State Tracker, Content Block Writer, Canon Checker, Echo Architect
  [`lens-1` §2–3]. Strongest on *why each agent is necessary given this game's mechanics*; weakest on
  keeping the crew inside the class's SRP-and-cap discipline (its Echo Architect spans four stages).
- **L2 — external-archetype.** Distills the three repos to five transferable patterns (session-state
  bus, mode-selector, accumulated-context chain, approval-before-write gate, consistency satellite),
  then proposes Orchestrator, Narrative Director, Content Agent, Audio Specialist, Consistency Checker,
  QA/Playtester [`lens-2` §1–3]. Strongest on *orchestration mechanics and the two-mode gate behavior*;
  weakest on JSON altitude (it stays at role-sketch level by design).
- **L3 — class-spec.** Applies the rubric strictly — ~5 agents + orchestrator, one-agent-per-feature,
  JSON-I/O throughout, realistic-capability check per agent: Narrative Architect, Dialogue/Content
  Agent, Canon Verifier, Audio-Tag Agent, Scope Guard [`lens-3` §4]. Strongest on *hitting the graded
  criteria (full JSON sketches, capability checks, human-gate map)*; weakest on the game-specific
  narrative mechanics L1 foregrounds (echo integrity, superposition rule) — it folds them into the
  Narrative Architect rather than giving them a dedicated home.

---

## 2. Where all three agree — adopt without further argument

These are the high-confidence spine of the roster. Three independent lenses converging is the strongest
signal available in a from-scratch section.

| Agreed point | L1 | L2 | L3 | Source anchor |
|---|:--:|:--:|:--:|---|
| **Exactly one orchestrator + ~5 workers = 6 total** | ✅ | ✅ | ✅ | `transcript` 21:53:38–21:54:11 (>5 = over-scope for class); `RESYNTHESIS-PLAN.md` §2 |
| **Orchestrator routes/sequences; holds no domain expertise** | ✅ | ✅ | ✅ | `godot-game-architecture` call-down/signal-up; `narrative-designer-studio-role` vision-holder |
| **A dedicated content/dialogue agent at JSON altitude** | ✅ (Content Block Writer) | ✅ (Content Agent) | ✅ (Dialogue/Content) | `transcript` 21:37:05–27 (the canonical example) |
| **A dedicated consistency/verification satellite** | ✅ (Canon Checker) | ✅ (Consistency Checker) | ✅ (Canon Verifier) | `RESYNTHESIS-PLAN.md` §5 watch-for; `recon.md` §3 `lore_master` |
| **A narrative/story-architecture agent above the line writer** | ✅ (Persona Architect) | ✅ (Narrative Director) | ✅ (Narrative Architect) | `narrative-designer-studio-role`; `writing-books-with-ai` outline-first |
| **Consistency agent FLAGS only, never auto-repairs / never generates** | ✅ | ✅ | ✅ | `recon.md` §3 (`lore_master` reads-and-checks); `building-ai-workers` watch-out |
| **Two-mode split (canned/live) changes gate behavior, not agent identity** | ✅ | ✅ | ✅ | `gdd-structure-model.md` §4 Build §5; `RESYNTHESIS-PLAN.md` §2 |
| **A session-state artifact is the inter-agent handoff bus** | implied | ✅ (`session-active.md`) | ✅ (`session-state.json`) | `recon.md` §4 Pattern A (bullish0x) |
| **Human gate lives at the output, not mid-chain (except explicit checkpoints)** | ✅ | ✅ | ✅ | `building-ai-workers` "final creative stamp"; `recon.md` §4 Pattern D |

**Read-out:** four of the five worker slots are effectively settled by convergence — an orchestrator, a
narrative/architecture agent, a content/dialogue agent, and a consistency satellite. The genuine
decisions are (a) what fills the fifth slot, (b) how the audio-first USP gets covered, and (c) how the
game's echo/retrospective-significance mechanic is guarded. Sections 3–5 resolve those.

---

## 3. Where the lenses diverge — the real decisions

### Decision A — the fifth worker slot: Echo Architect vs. Audio Specialist vs. QA/Scope Guard

This is the sharpest three-way split. Each lens spends its scarce fifth slot differently.

| | L1 | L2 | L3 |
|---|---|---|---|
| **Fifth slot** | **Echo Architect** — cross-stage seed-and-payoff ledger | **Audio Specialist** + **QA/Playtester** (L2 runs *six* workers, breaking the cap) | **Audio-Tag Agent** + **Scope Guard** (L3 also spends two, but keeps 5 workers by folding echoes into the Narrative Architect) |
| **What it protects** | The retrospective-significance engine — the game's design thesis [`lens-1` §3 Agent 5] | The audio-first USP (H15) [`lens-2` Role 4] and experiential QA [`lens-2` Role 6] | The audio-first USP (H15) [`lens-3` Agent 4] and scope/Van-Buren compliance [`lens-3` Agent 5] |
| **Cost** | Spans four pipeline stages → tension with SRP [`lens-1` §7 flag 1] | **Six workers exceeds the ~5 cap** [`transcript` 21:53:38] | Two of five workers are verification-side; only three generate |

**Resolution.** The audio-first pipeline is a **locked USP the crew must not violate** [`gdd-structure-model.md`
§4 Build §8; `_index.md` §2 H15 ○○○], and L2/L3 agree it needs a dedicated owner. The echo structure is
*"the game's singular design thesis"* [`lens-1` §3 Agent 5] and L3 concedes L1's point implicitly by
loading echo-templates into its Narrative Architect [`lens-3` Agent 1]. Both cannot each hold a full
slot without breaking the cap. The blend resolves it thus:

- **The Audio agent gets the fifth worker slot** — it owns a hole (H15) no other agent can absorb, its
  I/O is the cleanest in the crew (string-pattern generation + collision check — L3's capability check
  passes it trivially [`lens-3` Agent 4]), and it is a graded USP.
- **The echo/retrospective-significance concern is folded into the Narrative Architect's remit as a
  named sub-function**, not a separate agent — adopting L3's structural instinct [`lens-3` Agent 1
  echo-templates] over L1's separate Echo Architect. This honors SRP better: "story architecture,
  including which past-life seed pays off in which future scene" is *one* feature (narrative structure),
  not two. L1's cross-stage Echo Architect is explicitly flagged by L1 itself as an SRP tension
  [`lens-1` §7 flag 1]; the compare adjudicates in favor of the fold.
- **QA/Scope-Guard does NOT get a dedicated slot.** L2's QA/Playtester and L3's Scope Guard are real
  functions, but the class treats stress-testing as something *the orchestrator does with the crew*, not
  a standing agent: *"you can... help do this with agents by having agents look at your document,
  identify... what's going to be the heaviest lift"* [`transcript` 21:43:35–52], and *"synthetic
  audiences"* are a technique, not a roster role [`transcript` 21:48:10–29]. The blend moves scope-guard
  and multi-archetype playtest into an **orchestrator-invoked stress-test pass** (an on-demand mode of
  the Consistency agent + a prompt the orchestrator runs), keeping the standing crew at five workers.

**Net:** 5 workers = Orchestrator's four settled slots (Narrative Architect w/ echo sub-function,
Content/Dialogue Agent, Consistency Verifier, Audio-Tag Agent) + the Audio slot as the fifth. See §6 for
the roster. This keeps the cap [`transcript` 21:53:38], honors SRP [`transcript` 21:54:45–21:55:28], and
loses no locked concern (echo folds up; QA becomes a pass, not a body).

---

### Decision B — Persona/NPC generation: a standing agent (L1) or an input the Narrative agent consumes (L2/L3)?

| | Position |
|---|---|
| **L1** | Persona Architect is Agent 1 — a *standing* agent that generates and maintains NPC persona cards (orthogonal trait axes, essence-descriptor, suit tags) [`lens-1` §3 Agent 1] |
| **L2** | Narrative Director produces *NPC role briefs at essence-descriptor level* as part of story architecture; full personality is the content agent's input [`lens-2` Role 2 I/O] |
| **L3** | NPC list + essence descriptors are a *required input field* to the Narrative Architect and Content agent — the agent cannot invent NPCs [`lens-3` Agent 1 I/O; Agent 2 I/O] |

**Resolution.** L3 and the locked design win decisively on the no-invention rule: *"it does not invent NPC
rosters... those are Roc's to supply"* [`lens-3` stance; `GATE-2-review.md` B3; `_index.md` §2 H1 ○○○].
A standing Persona Architect that *generates* persona cards risks exactly the invention the guardrails
forbid — H1 (roster) and H2-content are Roc's calls. **But** L1's persona-*card structure* is the correct
schema for what the Narrative Architect emits: the `modular-characters-system-driven` orthogonal-trait
pipeline is the KB's best guard against Roc's homogenization worry [`GATE-2-review.md` A1;
`modular-characters-system-driven`]. The blend: **no standing Persona agent; the persona-card schema
(orthogonal axes + essence-descriptor + suit tag + authored exceptions) becomes the format the Narrative
Architect fills from Roc-supplied seeds, and the Content agent reads.** L1's schema survives; L1's
separate agent does not. This is the method-vs-content discipline the structure model names
[`gdd-structure-model.md` §5].

---

### Decision C — State Tracker as a runtime agent (L1) vs. left to the H10 in-game architecture

L1 proposes a **State Tracker** (Agent 2) as a dual-context dev-pipeline + runtime agent — the ICM
(Incarnation-Context Memory) engine, holding the cross-session log [`lens-1` §3 Agent 2]. L2 and L3 do
not include it: L2 explicitly scopes it out as *"in-game runtime agents (H10)... a separate architecture
this lens does not address"* [`lens-2` §6 §5a], and L3 treats runtime state as the session-state file the
orchestrator maintains [`lens-3` §7].

**Resolution.** The runbook guardrail is unambiguous: *"the repos model our dev-pipeline crew (H11), not
the in-game runtime agents (H10 + the emergent-partner wow)"* and *"two contexts, kept distinct"*
[`RESYNTHESIS-PLAN.md` §5]. L1 itself flags the conflation risk [`lens-1` §0]. The deliverable is the
**H11 dev-crew**, so a runtime State Tracker is out of the standing dev-crew roster. **But** L1's insight
is not discarded: the ICM/state-persistence contract is real and the dev-crew must *produce the schema*
the runtime reads. The blend keeps state-tracking as a **canned-mode responsibility of the Content agent
+ a session-state schema the crew authors**, and names the live/runtime State agent as an **H10 item
belonging to Build GDD §5a, explicitly out of this roster** — a Phase-3 design task, flagged, not built
here. This respects the hard context split while preserving L1's traceability.

---

### Decision D — orchestration shape: bus (L2/L3) vs. call-down router (L1)

L1 frames the orchestrator via the Godot call-down/signal-up rule: *"the orchestrator calls agents
directly; agents return structured output without knowing who asked"* [`lens-1` §1]. L2/L3 frame it as a
**session-state bus** the bullish0x way: agents read/write a shared `active.md`/`session-state.json`; the
orchestrator reads the bus and decides what runs next [`lens-2` §3; `lens-3` §7; `recon.md` §4 Pattern A].

**Resolution.** These are compatible, not competing — and the blend uses both. The **call-down/signal-up
coupling rule** (L1) is the *architecture principle*: no agent reaches up or sideways to another; each
receives a prepared input and emits a typed output [`godot-game-architecture`]. The **session-state
artifact** (L2/L3) is the *mechanism* that realizes it: the bus is how the orchestrator hands each agent
its prepared input and collects its typed output, without agents calling each other [`recon.md` §4]. Adopt
L1's rule + L2/L3's bus together. This also gives the two-mode split a clean home: canned mode writes the
bus unattended; live mode reads it and gates before writing [`lens-2` §3; `RESYNTHESIS-PLAN.md` override].

---

### Decision E — JSON altitude: full sketches (L3) vs. role sketches (L2) vs. schema-per-agent (L1)

L3 supplies **full JSON input/output blocks per agent** [`lens-3` §4]. L1 supplies **inline schema lines**
(`{ npc_id, trait_axes: [...], ... }`) [`lens-1` §3]. L2 stays at **field-name role-sketch** altitude by
design, flagging JSON as Phase-3 [`lens-2` §2, §5].

**Resolution.** The class grades *"agent role clarity"* and rewards the JSON example altitude explicitly
[`transcript` 21:37:05–27, 21:51:21–40]. L3's altitude is the target — but L2 is right that the *exact
schema is Phase-3 work* [`lens-2` §5; `gdd-structure-model.md` §9]. The blend adopts **L3's JSON-sketch
altitude** (named fields, types, enums, bounds) for the deliverable, while carrying L2's honesty flag: the
sketch names the fields a schema would have; it is not a validated schema. This matches how the structure
model scopes Build §5 — *"JSON-I/O specs live here... each agent: name · role · input schema · output
schema · when-called · human-gate · realistic-capability check"* [`gdd-structure-model.md` §4 Build §5].

---

## 4. The consistency/verification-agent pattern — surfaced, as the recon predicted

The runbook explicitly asked to **watch for** this pattern [`RESYNTHESIS-PLAN.md` §5], and all three
lenses independently landed on it, each with a different source of confidence:

- **L1** derives it from the `building-ai-workers` watch-out (*"broken output mid-run can't be silently
  swallowed"*) + the finite, checkable invariants the game's rules create (superposition rule,
  role-boundary law, essence-vs-role discipline) — but flags its *agent shape* as thin-sourced
  [`lens-1` §3 Agent 4 thin-source flag].
- **L2** derives it from the recon's strongest new signal — `colonel1223`'s `lore_master`, *"the only agent
  in any of the three repos whose sole job is reading an upstream content artifact and checking new
  additions for internal consistency"* [`recon.md` §6; `lens-2` Pattern E] — and flags it as the
  *least KB-grounded, most repo-dependent* role [`lens-2` §5].
- **L3** derives it from both + the `bullish0x` typed-evidence discipline (Logic/Integration/Visual/UI/Config
  → our Narrative-Logic/Consistency/Register/Pacing), and passes it on the capability check *with a
  long-context caveat* — the session-state file must be kept bounded or recall degrades [`lens-3` Agent 3].

**Blend verdict:** the Consistency Verifier is **adopted as a full worker slot** (high three-lens
convergence), with **L3's long-context caveat carried forward as a named orchestrator dependency** (a
summarization cadence keeps the verifier's context bounded [`lens-3` §9 flag 2]), and **L1's finite
invariant list as its check-set** (the game's own rules give it concrete, checkable targets rather than
open-ended "quality" review [`lens-1` §3 Agent 4]). This is the pattern the runbook anticipated; it is
the crew's second-most-confident slot after the content agent. **Thin-source flag preserved:** its
*agent shape* rests on one repo (`lore_master`) + a runbook Q&A mention, not a dedicated KB note
[`lens-2` §5; `lens-1` §3 Agent 4] — flag for Roc at GATE 2.

---

## 5. Where no lens closes the gap — Phase-3 open questions (do not fake these)

These survive the compare unresolved. All three lenses name them; none can close them from the KB.

1. **Token budget / call frequency (H13).** Untouched by the KB [`_index.md` §2 H13 ○○○]. No lens
   estimates cost-per-call; L1 and L3 both defer it [`lens-1` §5; `lens-3` §8]. Phase-3 math against real
   API costs. **Required rubric section** [`GATE-2-review.md` B1] but not derivable here.
2. **Live-mode I/O + the session-log format.** The canned-mode schemas are grounded; the live-mode content
   agent's mid-session input (a current-state excerpt only) is a design gap [`lens-1` §5; `lens-2` §5].
   The `ink-narrative-scripting-language` watch-out names the failure: without a persistent session log,
   the agent loses retrospective-significance behavior [`lens-1` §5]. Blocking spec for live mode.
3. **Multi-agent retry / escalation protocol.** What the orchestrator does when the Verifier returns
   `pass: false` and the Content agent cannot self-correct [`lens-1` §5]. `building-ai-workers` admits its
   own gap here [`lens-1` §5]. Phase-3 orchestration spec.
4. **Audio-tag contract format (H15).** ○○○ in the hole map [`_index.md` §2 H15]. The Audio agent slot is
   grounded in the repo archetypes + the USP, but the actual string-pattern + state-machine table is
   Phase-3 net-new [`lens-2` §5; `lens-3` §9 flag 3] — and blocked on the Phase-3 verb-grammar sub-verb
   list [`lens-3` §9 flag 3; `gdd-structure-model.md` §4].
5. **Whether the orthogonal-trait pipeline actually produces perceptually distinct NPCs.** Roc's
   homogenization worry (A1) cannot be validated in a structural sketch — it needs real Phase-3 writing
   samples against the voice-style-guide NPC-variance section [`lens-2` §5; `GATE-2-review.md` A1].
6. **Unreal-specific integration.** The call-down/injection patterns are engine-agnostic; MetaSounds +
   Unreal asset-pipeline specifics need a separate source [`lens-1` §5].

---

## 6. The recommended blend — roster at a glance

The full spec (I/O sketches, when-called, human-gate, capability check) is the deliverable
`dev-crew-architecture.md`. This is the summary the compare recommends.

| # | Agent | One-feature owned | Fifth-slot decision | Primary lens source |
|---|---|---|---|---|
| **0** | **Orchestrator** | Sequencing, routing, session-state bus, gate-surfacing — no domain expertise | — | L1 rule + L2/L3 bus (Decision D) |
| **1** | **Narrative Architect** | Story structure: seed-and-payoff / echo map (folded), persona-card schema (folded), delta-storytelling rule, canon flags | Absorbs echo (Decision A) + persona schema (Decision B) | L3 shape + L1 schema |
| **2** | **Content / Dialogue Agent** | All player-facing text; fills the locked scaffold to the voice contract; canonical JSON example | — | L1/L2/L3 converge; L3 altitude (Decision E) |
| **3** | **Consistency Verifier** | Reads accumulated content, checks against finite canon invariants + voice register; FLAGS only | Adopted (§4) | L2/recon `lore_master` + L1 invariants |
| **4** | **Audio-Tag Agent** | The audio-first USP contract: `<Entity>_<AnimVerb>_<State>` naming + collision/format check (H15) | **Wins fifth slot** (Decision A) | L2/L3 |
| — | *(Scope-guard / multi-archetype playtest)* | *Orchestrator-invoked stress-test pass, not a standing agent* | Demoted (Decision A) | L2 Role 6 / L3 Agent 5, as a pass |
| — | *(State Tracker / runtime ICM)* | *H10 Build §5a — explicitly out of this H11 roster* | Scoped out (Decision C) | L1 Agent 2, deferred |

**Total: 5 workers + 1 orchestrator. Cap met** [`transcript` 21:53:38]. Every worker owns exactly one
feature [`transcript` 21:54:45–21:55:28]. Two-mode gate behavior is a per-agent flag, not a separate
runtime [`lens-3` §2; `RESYNTHESIS-PLAN.md` override].

---

## 7. Recon disposition recommendation (per runbook §4 Round C step 0 / override callout 4)

The runbook defers the *"committed reference note set vs. ephemeral compare input vs. discard"* call to
Roc at GATE 2, defaulting to staged [`RESYNTHESIS-PLAN.md` override 4; `recon.md` §6].

**Recommendation: promote a thin slice, discard the bulk.** The recon's *durable* value is two items the
KB does not otherwise hold: (a) the **`lore_master` consistency-agent pattern** (the strongest new signal,
now load-bearing in the deliverable [`recon.md` §6]) and (b) the **bullish0x session-state-bus +
approval-gate architecture** (Patterns A + D, also load-bearing). Everything else in the recon either
confirms patterns already in the KB's H11 notes or is a relevance-filtered agent list with no transfer
value [`recon.md` §4 "what does NOT transfer"]. Concretely:

- **Promote:** extract **one** short committed reference note to `ai-workflow/` — *"dev-crew orchestration
  patterns (external archetypes)"* — capturing only the five transferable patterns (§1 of `lens-2`) + the
  `lore_master` shape, cited in the H11 slot of the hole-coverage map. This makes the two load-bearing
  patterns traceable to a committed note rather than to an ephemeral staging file the deliverable depends
  on.
- **Discard/archive the rest:** the 54/11/10 agent inventories and the relevance-filter drop-lists have
  served their purpose (they produced the patterns) and add index weight without future value.

Rationale: the deliverable cites the recon patterns as load-bearing; a synthesis artifact should not
depend on an ephemeral staging file. Promoting the thin slice closes that dependency; discarding the bulk
honors the "only distilled notes committed" discipline [`_index.md` §Phase-1 note] and the cut-list
discipline [`gdd-structure-model.md` §6]. **This is a recommendation, not a decision — Roc's call at
GATE 2.**

---

## 8. Thin spots / KB gaps (honest accounting for GATE 2)

- **The whole section is from-scratch.** *"H11 is the thinnest required section... Refs supply mindset,
  not schemas"* [`_index.md` §3.4]. The compare's confidence comes from *three-lens convergence*, not from
  KB depth. Where the lenses agree, treat it as sound; where a single lens carries a claim, it is flagged.
- **The Consistency Verifier's agent shape is single-repo-sourced** (`lore_master`) plus a runbook Q&A
  mention — no dedicated KB note [`lens-2` §5; `lens-1` §3 Agent 4]. Highest-value slot with the thinnest
  grounding for its *shape* (its *check-set*, by contrast, is well-grounded in the locked design rules).
- **The Audio-Tag Agent's output format has no KB precedent** (H15 ○○○) and is blocked on the Phase-3
  verb-grammar [`lens-3` §9 flag 3]. The slot is justified; the schema is Phase-3.
- **Six of the compare's decisions fold or demote a lens proposal** (echo → Narrative Architect; persona
  agent → schema; State Tracker → H10; QA → orchestrator pass). Each fold is defended, but each is also a
  *judgment* the compare made under the cap — Roc may prefer to spend the fifth slot differently (e.g., a
  standing QA agent instead of the Audio agent if audio is deferred). Named as a GATE-2 remix point.
- **No token budget, no live-mode I/O, no retry protocol** — the three genuine gaps (§5) that no lens
  closes. These are Phase-3, not compare, work — and two of them (H13 token budget, live-mode session-log)
  are on the critical path for a "complete" Build §5.
