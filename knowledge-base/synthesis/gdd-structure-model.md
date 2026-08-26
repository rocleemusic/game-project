---
kind: synthesis artifact
artifact: gdd-structure-model
serves:
  - gdd-structure
  - Phase-4-assembly-de-risk
sources:
  - _resynthesis-staging/round-A/lens-1-minimalist-pitch.md
  - _resynthesis-staging/round-A/lens-2-buildable-handoff.md
  - _resynthesis-staging/round-A/lens-3-narrative-first.md
  - _resynthesis-staging/round-A/COMPARE.md
  - knowledge-base/synthesis/gdd-structure-model.md (prior single-doc model — Van Buren guardrail ported forward)
  - resources/GDD-template-draft.md (12-section spine + writing rules + locked §12 decisions)
  - game-project-resources.md (One-Page / three-tier / Detailed / Course / modern-GDD template descriptions)
  - knowledge-base/myst-proposal/proposal-page1.md + proposal-page2.md (doc-structure sequence + myth-form density)
  - knowledge-base/myst-ages/*.md (Van Buren over-specification lens)
  - knowledge-base/RESYNTHESIS-PLAN.md (§2 locked inputs; unattended-mode override)
  - GATE-2-review.md (Roc's locked/open calls)
  - knowledge-base/coverage-map.md (§2 hole-coverage, §3 honest findings)
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (class transcript)
built: "Phase 2.5 resynthesis (2026-07-17)"
serves-holes:
  - gdd-structure
  - Phase-4-assembly-de-risk
status: "STAGED candidate for GATE 2"
---

# GDD Structure Model — the Two-Doc (+ Parking-Lot) Model

> **Superseded (post-restructure, 2026-07-26).** This file's own proposal — a Pitch GDD + Build GDD + Parking-Lot three-document split — was never adopted as the shipped structure. The actual GDD now lives as one folder of linked domain files, [`../../gdd/`](../../gdd/CONTEXT.md), with the old `resources/build-gdd*_draft.md` lineage archived. Kept here for its section-mapping ideas and the Van Buren guardrail (§7), which both remain useful reference — but every "Build GDD section N" citation below is pre-v5 numbering and does not match the current structure.

**How to use this.** This is **not the GDD.** It is the blueprint for writing three
documents: a **Pitch GDD** (1–3 pp, the graded 7/21 turn-in), an **expansive Build GDD**
(the dev-crew / agent handoff), and a **Parking-Lot doc** (cut ideas, never deleted). It
tells the Phase-4 writer, for each document: which sections exist, at what altitude each
section sits, what content lives where across the two docs, how the cut-list discipline
moves ideas between them, and where the Van Buren over-specification trap lives. It
replaces the prior single-doc structure model on approval. It is the spine Rounds B and C
build on — so the section maps below are concrete. **The three-doc structure is
auto-selected for the unattended run per the runbook override [`RESYNTHESIS-PLAN.md`
override callout]; it is Roc's to ratify or remix at GATE 2** (open flags in the
companion `COMPARE.md` §6).

---

## 0. Why three documents, not one

The class lecture answers a narrative-heavy student directly: keep **two copies** — a
pitch version "two to three pages long at most, maybe even just one page," the version
you show off; and "the more expansive version that has the full narrative woven in... all
of the additional details" [`transcript` 21:55:50–21:56:24]. And it names the third: cut
ideas are **never deleted** — "I wouldn't get rid of the ideas... a separate document I
would hold on to... something I would review later" [`transcript` 21:44:10–21:44:31]. The
runbook ratifies all three [`RESYNTHESIS-PLAN.md` §2].

The prior model resolved a five-template altitude disagreement by assigning each *section*
a tier (T1/T2/T3) [prior `gdd-structure-model.md` §1–2]. **This model keeps that tier
system and adds the document axis on top of it:** the same 12-section spine is written
*twice* — once compressed to pitch altitude (the Pitch GDD), once at full build altitude
(the Build GDD) — with a third append-only container (the Parking-Lot) catching everything
cut. A section's tier now depends on *which document it appears in*. That is the whole move.

**Why this is the correct architecture for THIS game, not a length hack** [`lens-3` §1]:
the design engine is retrospective significance — the ordinary detail that detonates only
when something is later true [`the-secret-to-frierens-worldbuilding`, `voice-style-guide`
§4]. That engine needs the narrative layer deep enough to pre-load weight *before* a
payoff exists. A 1–3 pp Pitch cannot carry that depth without bloating the one thing it
must do instantly — answer "what does the player do?" So the Pitch stays a sharp edge and
the Build carries the weight. The split makes both documents better.

---

## 1. The three documents at a glance

| Doc | Primary reader | Altitude | Length | Job | What it omits |
|-----|---------------|----------|--------|-----|---------------|
| **Pitch GDD** | Grader, collaborator, publisher stand-in | **T1 throughout** | 1 p ideal · 3 p ceiling | Answer "what does the player do?" in one read [`transcript` 21:38:38] | All build detail, all agent I/O schemas, the full open-question ledger (one-line "named open questions" only) |
| **Build GDD** | Dev-crew, agent orchestrator | **T2 → T3**, narrative-woven | ~10–18 pp | Hand off a buildable contract; every sentence tells an agent what to do or names an open question precisely [`lens-2` stance] | Pitch-sell language, redundant motivation prose, anything not yet at spec altitude (that goes to the Parking-Lot or §12) |
| **Parking-Lot doc** | Roc's future self | Unformatted; append-only | Unbounded | Hold every cut idea so cut discipline is possible without losing material [`transcript` 21:44:10] | Nothing — it is the never-delete home |

**The relationship between them:** the Build GDD is **not a longer Pitch** — it is a
different document with a different reader [`lens-1` core stance; `lens-2` §1; `lens-3`
§1]. The Pitch is a *projection* of the shared 12-section spine at T1; the Build is the
same spine at T2/T3. Content flows one direction under pressure: Pitch → cut → (Build if
build-altitude, else Parking-Lot). §12 Open feeds the Parking-Lot; the Parking-Lot feeds
nothing automatically — entries return only when Roc promotes them at a gate.

Tier legend (unchanged from the prior model): **T1** = one-page pitch altitude (a claim,
a sentence) · **T2** = product-design altitude (a system named, its shape stated, no
parameters) · **T3** = detailed-systems altitude (real numbers or a named open question).

---

## 2. The shared spine — the 12-section backbone both docs project from

Both docs inherit the 12-section spine from `resources/_archive/GDD-template-draft.md`, kept intact
per the prior model and L2 [prior `gdd-structure-model.md` §1; `lens-2` §2]. The Pitch
compresses it to 7 pitch-faces; the Build writes all 12 at build altitude. The mapping is
1:1 — every Pitch section maps to one or more spine sections, so nothing is orphaned.

| Spine # | Section | Pitch face | Build altitude |
|---|---|---|---|
| 1 | Elevator Pitch | **P1** | §1 (one paragraph + dev-crew triage note) |
| 2 | Design Pillars (+ Non-Goals) | **P2** | §2 (pillars + per-pillar agent-refusal column) |
| 3 | Inspirations | folded into **P2/P3** | §3 (+ spec-borrow column) |
| 4 | Core Loop & Mechanic | **P4** | §4 (verb families spec'd; loop-tier table) |
| 5 | Agentic AI Showcase | **P5** ("one agent, one wow") | §5 (JSON-I/O schemas; dev-crew roster) |
| 6 | World & Progression | **P3** (world hook = motif line) | §6 (myth-form lead + persistence spec + H9 pipeline block) |
| 6a | Slice World / "the Age" | referenced by motif only in **P3** | §6a (one functional paragraph per location, in voice) |
| 7 | Art & Audio Direction | **P6** | §7 (tone/refs + color grammar + going-big triggers + sonic identity) |
| 8 | Audio-First Pipeline (USP) | one line in **P2/P5** | §8 (GameplayTag + tag→asset-library contract, Wwise) |
| 9 | Project Conventions | — (never Pitch) | §9 (GameplayTag namespace + tag→asset library + CI note) |
| 10 | Platform, Engine & Scope | engine = one line in **P4/P6**; slice contract = short list | §10 (engine + slice contract + content-budget formula) |
| 11 | Milestones | **P7** (dates) | §11 (dates + Phase-3-blocking sub-rows) |
| 12 | Unresolved Questions | **P7** ledger (3–5 named gaps) | §12 (full Open/Resolved ledger) |

**Two Cyan/Myst devices stay optional-inside-§6a, never top-level sections** (carried
from the prior model, guardrail G7 below): the **five-field puzzle template** (Problem /
Circumstance / Clues / Solution / **The Idea**) — the GDD *references* the format, per-
puzzle specs live in `pnc-grammar` + Phase-3; and the **discovery-arc player-experience
walkthrough** — at most one short paragraph in §4 or §6a as a readability check, the full
walkthrough is out of GDD scope [prior `gdd-structure-model.md` §1].

---

## 3. The Pitch GDD — section map + altitude

Seven sections, 1–3 pp total, **T1 throughout.** Each section carries a cut rule: if a
sentence does not advance "what does the player do / why is it fun / why are AI agents
central," it does not belong on the pitch page [`lens-1` litmus]. Adopted from L1.

| # | Pitch section | Tier | Length target | What earns its place | What must NOT bloat it |
|---|---|---|---|---|---|
| **P1** | Elevator Pitch | T1 | 1 sentence | Player verb + emotional payoff in one line — *"a soul who wakes life after life in a Ghibli-warm town that remembers, reading the souls who return with you; you read lives, deduce who they've become, and the game remembers every life you've lived"* [`concept-dig-notes` Session 3] | World backstory, tech stack, genre tags, system names (ICM, two-mode architecture) |
| **P2** | Design Pillars + Non-Goals | T1 | ~8 pillar phrases + ~4 non-goals | Pillars settle future arguments as *phrases* (each rejects a design idea without explanation); Non-Goals are scope insurance [prior model §2] | Exposition on why each pillar matters, examples, history |
| **P3** | Player Role + World Hook | T1 | 2 short paragraphs | Player agency *before* world lore (Myst sequence: "acts as both detective and judge" before any location [`proposal-page1`]); ¶1 = player role, ¶2 = one-line myth-form world hook | Age enumeration, time-architecture detail, save-slot system, superposition rule, NPC roster — all Build [`lens-1` P3] |
| **P4** | Core Loop | T2 | ~5 named elements | Four action families (Collect · Make · Show/Ask · Use) + three loop tiers (moment / festival-week run / year-cycle meta) + festival run-end + pack-triage, each a phrase [`concept-dig-notes` Sessions 5–8] | The verb table, interaction matrix, crafting recipe spec, magic-word system, NPC dialogue mechanics — all Build |
| **P5** | Agentic AI — "One Agent, One Wow" | T2 | 1 line per agent + wow beat | Name each agent + one-line output + when called; the wow = "the game remembers every life you've lived" [`transcript`; `concept-dig-notes` Session 2] | JSON schema, token budget table, API limits, two-mode deep spec, full dev-crew roster — all Build §5 |
| **P6** | Art Direction | T1 | 2–3 tone words + refs + 1 open Q | Tone words + 2–3 concept refs + sonic-identity line + 2D-vs-3D as a named open question [`GATE-2-review.md` D1] | Full art brief, cohesion-from-system depth, going-big pole experiments (Round B), color grammar, style-sheet |
| **P7** | Milestones + Open Ledger | T1 + ledger | dates + 3–5 open Qs + resolved list | Anchor dates (7/21 draft · 8/25 capstone); 3–5 precisely-named gaps; resolved decisions with pointers | The full 18-hole ledger (Build §12); vague "TBD" gestures |

**Pitch total: 1 page ideal · 2 pages acceptable · 3 pages hard ceiling.** If it exceeds
3 pages, the overage is Build content that leaked in — apply the cut list [`transcript`;
`RESYNTHESIS-PLAN.md` §2].

---

## 4. The Build GDD — section map + altitude

The full 12-section spine at T2→T3, narrative-woven. Per-section altitude, the agent-
handoff shape, and which hole(s)/locked decisions each houses. Adopted from L2 (altitude +
agent shape) and L3 (narrative weave); the JSON-I/O specs are concentrated in §5.

| # | Build section | Tier | Governing writing rule / agent shape | Houses (holes / locked decisions) |
|---|---|---|---|---|
| **§1** | Elevator Pitch | T1 | One paragraph (the sentence + the player's experiential arc), plus a one-line **dev-crew triage note**: "every feature must answer yes to 'does this help a player feel retrospective significance?' or it goes to the Parking-Lot" [`lens-2` §1] | Concept (locked) |
| **§2** | Pillars + Non-Goals | T1 + build implications | Each pillar gains one line: the build implication (what an agent must never do that violates it). Non-Goals gain an **agent-refusal column** — what the agent refuses to generate if asked [`lens-2` §2] | 8 locked pillars; co-op/FFT/live-service Non-Goals [`GATE-2-review.md` C3] |
| **§3** | Inspirations | T1 + spec-borrow | Game + one-line take + a **spec-borrow column** (the precise structural move, not vibes): OW = knowledge-travels-free; Myst = five-field puzzle template; Frieren = flat-register voice contract [`lens-2` §3] | Frames H4/H9 borrows |
| **§4** | Core Loop & Mechanic | T2 | Each loop tier its own subsection; **receiver-determined outcomes** rule (the target holds the response logic — the action verb encodes *what was done*, never *what happened*) [`concept-dig-notes` Session 8]; **win/loss = soft terminal states** (a run always ends *with something* · a life ends on an ending — H18: **no hard-lose**, never a fail-punish); **experience-forward, value-backed** writing (state the felt experience — "the lasso reaches half a screen" — then footnote the number; §6a inherits) [alt-template graft 2026-07-19]; park undecided sub-verbs | H4 (families), **H18** (win/loss); locked: four families, life-verbs, festival run-end |
| **§5** | Agentic AI Showcase | **T2 → T3** | **JSON-I/O specs live here.** Two-mode architecture (canned + live); in-game runtime agents + dev-crew pipeline roster (~5 + orchestrator); each agent: name · role · input schema · output schema · when-called · human-gate · realistic-capability check [`transcript` 21:37:05–21:37:27; `lens-2` §5] | **H10, H11** (thinnest required section); locked: two-mode architecture |
| **§6** | World & Progression | T2 (myth = T1 prose) | **Myth-form origin as the lead** (character action, not lore — proposal-page2 "it began as simple greed" density); then persistence table (with agent consequences) + superposition rule + nested-clock time architecture. **The H9 block is a narrative-pipeline spec, not a lore section** — seed-and-payoff contract, delta-storytelling as default, encounter-over-quest, emotional context-box template [`lens-3` §2, §5–6; `lens-2` §6] | **H9-baseline**; locked: persistence spectrum, endings-spectrum, emergent bond (no prescribed partner), superposition |
| **§6a** | Slice World / "the Age" | T2, gestural | **One functional paragraph per location, authored in voice** (not spec-prose): what it was for · what the player does · what it gates · dominant object class [`myst-techniques` 4.7, 3.11; `lens-2` §6a; `lens-3` §2]. Thin **by license** (proposal-page1) | H9 slice content (Roc, P3); H1/H3 rosters referenced as open |
| **§7** | Art & Audio Direction | T1 → T2 | Tone words + refs (T1); dominant-object-class + color grammar (Frieren desaturation / Ghibli palette discipline, no reproduced imagery) + **going-big trigger model** (payoff swell / sprinkled wonder; large or intimate) + sonic identity (deepest-bond leitmotif emerging from festival mix) [`GATE-2-review.md` D1; `concept-dig-notes` Session 7; `coverage-map.md` §3.11] | **H17**; open: 2D vs 3D (Roc, P3) |
| **§8** | Audio-First Pipeline (USP) | **T3** | **The differentiator.** Audio triggers as **Unreal GameplayTags** mapped to **Wwise events** via a data-driven **tag→asset library** (supersedes the old `<Entity>_<AnimVerb>_<State>` string + mirrored-tree, 2026-07-19); audio-as-object spec (sounds are pack-free collectibles, show-able, gift-able, spell-component candidates); deliberate-recording constraint [`concept-dig-notes` Session 8; `lens-2` §8] | **H15** (audio-tag contract — ○○○, Phase-3) |
| **§9** | Project Conventions | **T3** | The **tag** *is* the metadata — a **department-agnostic GameplayTag namespace** (e.g. `<Entity>.<Interaction>`, no dept prefix) whose **tag→asset library** resolves each tag *per department* (Wwise event / dialogue / art) + a CI-check note (flag orphan tags / missing mappings); state the dependency arrow to §8 [`lens-2` §9] | Enables §8 (convention, not a hole) |
| **§10** | Platform, Engine & Scope | T2 (engine) → T3 (slice math) | Engine = Unreal, one line (Wwise is the audio middleware); **slice contract** (5 locked items); **content-budget formula** as a named open question (`candidates × years × slots × interactions + echoes + descriptor-lines`); **token-budget block** (model/tier · tokens/session · ×sessions · ×weeks · total · overrun plan — a **named open question in draft; real numbers at final** via the H13 calibration) [alt-template graft 2026-07-19]; Van Buren guardrail referenced not repeated [`concept-dig-notes` Session 9; `lens-2` §10] | **H12, H13, H14, H18**; locked: Unreal, slice contract; open: slice math, token budget |
| **§11** | Milestones | T1 | Dates + deliverable, one line each; **Phase-3-blocking sub-row** per milestone (what must be spec'd before it closes); add a **"Verified by" column** (who/what confirms each phase closed — pairs with the human-gates) [`lens-2` §11; alt-template graft 2026-07-19] | 7/21 draft · 8/25 capstone |
| **§12** | Unresolved Questions | N/A (ledger) | **The full ledger** (more populated than the Pitch's). Open = named question; Resolved = decision + pointer, never deleted [prior model §3] | Every not-yet-decided hole parks here |

**Build altitude split:** **T1:** §1, §2, §3, §11 (+ §6 myth prose). **T2 (working
middle):** §4, §5-in-game, §6, §6a, §7. **T3 (real numbers / named open question):**
§5-crew, §8, §9, §10-slice. **§12 is the pressure valve** that keeps T2/T3 honest.

**Where the JSON-I/O specs live:** exactly one place — **§5.** Sections that generate
content carry a *pointer only*, not the spec: §4 → "receiver-response format: see §5";
§6a → "NPC content generation: see §5"; §8 → "audio object tagging: see §5 [Phase-3]"
[`lens-2` §3; `transcript` 21:37:05–21:37:47]. This keeps the contract in one place while
every section that touches agent output knows where it lives.

---

## 5. What-lives-where — the cross-doc content map

The single practical guide for the two-doc split. Each row states which doc(s) a piece of
content lands in and why. Merged from L2 §4 and L3 §3.

| Content | Pitch | Build | Parking-Lot | Why the split |
|---|:---:|:---:|:---:|---|
| One-sentence emotional premise | ✅ P1 | referenced | — | Player role needs the *why*; costs one sentence [`lens-3`] |
| Pillar list (phrases) | ✅ P2 | ✅ §2 | — | Settle-the-argument function applies in both |
| Per-pillar build implications + agent-refusal column | — | ✅ §2 | — | Dev-crew needs a refusal contract, not design philosophy [`lens-2`] |
| Inspirations (one line) | ✅ folded | ✅ §3 | — | Short; Build adds the spec-borrow column |
| Spec-borrow column | — | ✅ §3 | — | Build context, not pitch sell |
| Core-loop tier names | ✅ P4 | ✅ §4 | — | Pitch gets names; Build gets the full per-tier spec |
| Receiver-determined-outcomes rule | — | ✅ §4 | — | Agent build constraint |
| One-sentence world hook (motif) | ✅ P3 | — | — | Pitch buy-in without lore dump |
| Myth-form origin paragraph | — | ✅ §6 lead | — | The one place narrative is foregrounded in the Build [`lens-3` §2] |
| Persistence table (with agent consequences) | — | ✅ §6 | — | Orchestrator input [`lens-2` §6] |
| H9 seed-and-payoff / delta-storytelling / encounter-structure contract | — | ✅ §6 | — | Narrative *pipeline spec*, not lore [`lens-3` §5–6] |
| Agent names + one-line output + wow | ✅ P5 | ✅ §5 (full) | — | Pitch = concept; Build = schema |
| JSON I/O schemas (all agents) | — | ✅ §5 | — | Grader needs the concept, not the schema [`transcript`] |
| Two-mode architecture | one line P5 | ✅ §5 (spec) | — | Locked context; deep spec is Build |
| Tone words + refs | ✅ P6 | ✅ §7 | — | Pitch = feeling; Build = color grammar + triggers |
| Going-big trigger model | — | ✅ §7 | — | Build direction, not pitch [`GATE-2-review.md` D1] |
| Audio-first pipeline T3 contract | one line P2/P5 | ✅ §8 | — | Differentiator in full detail is Build |
| Project conventions (string rules + CI) | — | ✅ §9 | — | Dev-crew dependency |
| Slice contract (short list) | ✅ P4/P6 | ✅ §10 | — | Dates/shape factual; math is Build |
| Content-budget formula + slice math | — | ✅ §10/§12 (open) | — | Phase-3 math; Pitch stays a clean promise |
| Van Buren guardrail table | — | ✅ §10 (pointer) | — | Build scope-protection |
| Milestone dates | ✅ P7 | ✅ §11 | — | Factual; same in both |
| Open-question ledger | 3–5 named, P7 | full, §12 | — | Pitch shows clean state; Build shows honest state |
| Per-NPC voice attribution · authored past-life content | — | method named, §5/§6 | ✅ content (Phase-3 interview) | Roc supplies; method vs. content split [`lens-3` §3] |
| Multi-life NPC storylines beyond the slice | — | — | ✅ | Slice proves reshuffle; authored depth parks |
| Full Reunion cutscene (UP-scale) · alone-path vignettes · mid-year festival variants | — | — | ✅ | Emotionally right, out of slice scope [`concept-dig-notes` S3, S7] |
| Red-herring / decoy content layer | — | — | ✅ | Asset budget we don't have [`myst-techniques` 5.9] |
| Creature-as-partner option | — | — | ✅ | roadmap-at-best [`concept-dig-notes` S7] |
| Full three-strata historical layering per Age | — | — | ✅ | Content-dense; slice = two-state [`myst-techniques` 2.2] |

**The method-vs-content split is the key discipline for a narrative game** [`lens-3` §3]:
the Build names the *method* (essence-signature, seed-and-payoff contract, leitmotif
emergence shape); the actual *content* (which NPC, which memory, which melody) is Roc's to
supply in Phase 3 and parks until then. Method ships in the Build; content parks.

---

## 6. The Parking-Lot doc — cut-list discipline

The Parking-Lot is not a dumping ground; it is the discipline device that makes cut
discipline possible without losing material [`lens-3` §4]. The class rule: cut the wishes,
keep the specs — everything cut goes *here*, and here is where it waits, not the void
[`transcript` 21:50:14–21:50:21, 21:44:10–21:44:31].

**Operating rules** (adopted from L3, the most developed treatment):

1. **Entries are dated and reason-tagged.** Every entry carries the date it was cut and
   the reason (scope · Phase-3-interview-dependent · roadmap-candidate · out-of-voice-
   register). The reason is the review trigger — when the reason expires, the entry is
   *reconsidered, not re-invented*.
2. **Not a trash bin — full-sentence ideas, not labels.** "Mid-year festival variants"
   without a sentence of what they'd feel like is unrecoverable at review. Keep enough to
   *rebuild the feeling* from the note.
3. **Review at every gate.** GATE 2, GATE B, the 7/21 review, the 8/25 capstone — skim the
   Lot for anything the current phase makes newly buildable.
4. **The wish-vs-spec test decides Parking-Lot vs. Build.** A wish — "I want it to feel
   like Ghibli with Daoist subtext" — parks. A spec — "the origin myth is written in
   myth-form (who / what act / what consequence) at T1 prose in §6" — ships to the Build
   [`transcript` 21:50:14; `RESYNTHESIS-PLAN.md` §2 specificity > length].

**How content flows** (the cut-list discipline made mechanical):

- A **Pitch cut** that is build-altitude → moves to the **Build**. A Pitch cut that is
  *not yet* build-altitude → moves to the **Parking-Lot**.
- A **Build cut** (a wish that failed the spec test, or a feature outside the slice) →
  moves to the **Parking-Lot**, never deleted.
- **§12 Open** feeds the Parking-Lot: anything cut from a doc that isn't yet at any
  section's tier lands there with a named review trigger.
- The Parking-Lot returns nothing automatically — an entry re-enters a doc only when Roc
  promotes it at a gate. This is what keeps both docs clean: every "but what about..." has
  a named home with a review date, in a doc explicitly not shipped [`lens-3` §4, §6].

**A decision lives in exactly one place at a time** — Open (a named question),
Resolved-with-pointer (graduated to a doc body), or Parked (in the Lot). Never two of
these, never deleted [prior model §3]. The metroidbrainia irony to honor: the doc, like
the game, is a knowledge-key system — the history of what we learned is itself content, so
we preserve it rather than overwrite.

---

## 7. The Van Buren guardrail — do NOT over-specify these for a 6-week slice

**Ported intact from the prior model** [prior `gdd-structure-model.md` §4], because it is
the cut-list discipline's structural complement and the class explicitly validated it
[`RESYNTHESIS-PLAN.md` §2 "Cut-list discipline — validates our existing Van Buren
guardrail"]. Harvested from the five myst-ages "What NOT to borrow" sections. Each Cyan doc
was a *multi-year AAA* production doc; borrowing its *altitude* would sink a 6-week slice.
**This guardrail governs the Build GDD** — the Pitch is too shallow to over-specify; the
danger lives entirely in the Build. Mapped to Build sections.

| # | Guardrail — do NOT over-specify… | Source | Guards which Build section |
|---|---|---|---|
| **G1** | **Multiplayer / co-op anything.** Every Age had ≥1 two-player-required puzzle. Our slice is solo-first; co-op is a Non-Goal. If a mechanic *needs* a second player, cut it. | all five | §2 Non-Goals, §4 |
| **G2** | **Engineering / simulation detail** — displacement physics, pressure-plate sensitivity in pounds, lever geometry, overfill-valve logic. A slice needs *implied* world logic, not simulated. Extract puzzle *intent*, not implementation. | Ahnonay, Laki | §4, §6a, §10 |
| **G3** | **Elaborate multi-state / high-count systems** — 25-plate clock-maps, 8-counterweight math, 4-state buckets. The *principle* (one central object reflects world state) scales; the *count* does not. Compress to 1–3 states. | Ahnonay, Kadish, Teledahn | §4, §6a, §7 |
| **G4** | **Red-herring / decoy content volume.** Enough non-clue artifacts to hide the real ones = asset budget we don't have. Borrow "don't make clues trivially obvious"; do not budget a red-herring population. | Kadish | §6a, §8 (asset budget) |
| **G5** | **Long linear puzzle chains.** 5-puzzle vault gates, dozen-area chains. For a slice, 1–2 puzzles of the same depth beat a chain. Single-chain sequential gating hard-stalls players — violates cozy-rhythm. | Kadish, Laki | §4, §6a |
| **G6** | **Room furniture / asset inventories at design-doc altitude.** "Couches, chairs, drawing boards" is set-dressing busywork. **Flag the feeling, don't itemize the props.** | Garrison | §6a, §7, §9 |
| **G7** | **Phased-release / "add it later" design.** We have one ship window. Design nothing on the assumption it can be added post-slice. (This is why §6a is one paragraph, not a full Age spec.) | Laki, Garrison | §6, §6a, §10, §12 |
| **G8** | **Dexterity / timing / precision inputs** — dish-aiming, timed games, speed-docking, shimmies. All violate strategy-over-dexterity. Keep the knowledge-gate; replace the twitchy input with a recall/pairing/pattern gate. | Selenitic, Laki, Ahnonay, Teledahn | §2, §4 |
| **G9** | **Failure states that need a safety-valve you don't have.** Trap → forced link-out assumes a teleport mechanic. Our failures must be *soft* (return to last state, visible block) per the informational-feedback law — a wrong action teaches *why*, never hard-punishes. | Laki | §4, §8 |
| **G10** | **Doc-length itself.** Ahnonay ran ~1400 lines; its engineering sections dwarf the features they describe — "the ratio of doc to playable game is a warning." Depth is per-tier and earned, never default. | Ahnonay, Kadish | whole Build doc |

**The meta-guardrail:** Cyan docs are *reference for technique, never for altitude.* When
a Build section starts to read like a Cyan room sheet, it has over-specified. The inverted
fairness test: if the Phase-4 writer thinks "am I speccing something I haven't even
prototyped?", that content belongs in **§12 or the Parking-Lot**, not the Build body. This
is the same discipline the transcript names — cut the wishes, keep the specs
[`transcript` 21:50:14].

**One Myst-proposal trap the guardrail-adjacent note preserves:** do NOT import the
proposal's "completely nonlinear" or "solve the crime" framings — our world is *pull-open*
(no directed path, no external crime); the pull-not-push pillar overrides the proposal's
directed-mystery premise [prior model honest-spots; `myst-techniques` 5.5–5.6]. This
protects §1/§6 in both docs from inheriting a false promise.

---

## 8. Phase-4 assembly order (ported + split across the two docs)

Write cheapest-and-decided first to lock the spine; leave blocked-on-Phase-3 sections
last with a §12 pointer so no doc is ever falsely "complete." Ordering is by *readiness*,
carried from the prior model [prior `gdd-structure-model.md` §5] and split across the
Pitch/Build.

**Write the Pitch GDD first (it is the 7/21 priority and mostly graduates locked
decisions):** P1 → P2 → P3 → P4 → P5 → P6 → P7. All T1/T2, all from locked material; the
only open items are named-question one-liners in P6 (2D-vs-3D) and P7 (slice math, token
budget, endings). The Pitch should be draftable in a single sitting once the concept and
pillars are confirmed — it is a rough first draft, not the be-all document [`transcript`
21:50:21–21:50:54].

**Then the Build GDD, by readiness:**

- **Wave A — cheap & decided:** §1, §2, §3, §11, §4, §6 (myth + persistence). Graduate
  §12 Resolved into the body with pointers.
- **Wave B — decided shape, needs authoring:** §8 (finalize the tag/auto-link contract
  in place — highest-value, do not shortchange), §9 (GameplayTag / tag→asset-library rule — write
  immediately before/with §8; they are coupled), §10 (engine one line; slice contract;
  slice-math stays a named open question), §6a (one functional paragraph — writes fast
  once Roc picks the slice Age).
- **Wave C — blocked on Phase-3 hole-filling (frame + §12 pointer, fill last):** §5 (the
  hard one — H11 roster designed from scratch in Round C / Phase 3; frame now, fill after
  the dev-crew spec exists), §7 (write tone/refs now; 2D-vs-3D is a named open question),
  §12 (maintained throughout, finalized last).

**Dependency notes for the orchestrator:**

- §8 and §9 are coupled — §9's GameplayTag/library convention is the mechanism §8's tag→event
  contract depends on.
- §5 depends on the **Round-C dev-crew spec** + the pnc-grammar / token-budget work — it
  is the critical-path blocker for a "complete" Build draft.
- §6a depends on **Roc picking the slice Age + supplying echo content** (H1/H3/H9-slice) —
  a Roc-call, not a synthesis task.
- §4/§6a *reference* the `pnc-grammar` synthesis for the puzzle-spec format but must not
  inline full puzzle specs (guardrails G5/G10).
- **Round-B feeds this model:** the `voice-style-guide` refresh supplies §6's voice
  register + the §5 NPC-variance floor; the `pnc-grammar` refresh supplies §4/§6a's
  order-independent-significance constraint; the `going-big-brief` supplies §7's trigger
  model. The structure-model adds no scope beyond the runbook's Round-B/C plan
  [`RESYNTHESIS-PLAN.md` §4].

---

## 9. Thin spots / KB gaps (honest accounting for GATE 2)

- **§5 (agentic AI / dev-crew, H11) is genuinely under-sourced** — the KB supplies mindset
  and role-seeds, no I/O-contract schemas [`coverage-map.md` §3.4]. This model tells you *where*
  §5 sits and at what altitude; the *content* is Round-C + Phase-3 work. Do not let §5's
  frame imply it's ready.
- **§8 (USP / audio-first, H15) is the highest-value, thinnest-in-KB Build section** (○○○)
  [`coverage-map.md` §2 H15]. The template descriptions gave shape; the actual string-level
  contract is Phase-3 net-new. Write the *pattern*, name the library as open.
- **The Pitch's agent roster (P5) rests on a single confident anchor** — the class example
  + the two-mode architecture lock [`concept-dig-notes` Session 9; `transcript`]. Name
  only the agents you're confident exist (orchestrator + ≥1 content agent); the rest is a
  named open question. Single thin source flagged.
- **Slice math is obsolete under the calendar model** — the rooms-based Session-2 math is
  dead; the correct derivation (locations × days × NPCs × years) is Phase-3 [`concept-dig-notes`
  Session 9; `GDD-template-draft.md` §12 Open]. Named as a precise open question in both
  ledgers — never a guessed number.
- **The one-page-vs-detailed tension is resolved by the document axis, not by fiat.** If
  Roc wants a *strict one-page* Pitch, the Pitch's P6/P7 collapse to one line each and the
  full content lives only in the Build — a clean fallback, but a scope decision for GATE 2,
  not one this model should make [prior model honest-spots; `GATE-2-review.md` "What you do
  NOT need to answer" — Roc confirmed he wants both versions].
- **NPC-variance in the Build (§5/§6a) must be named, not faked.** Roc's homogenization
  worry [`GATE-2-review.md` A1] is real; the 5-tone set is a floor, not a ceiling, and the
  personality range emerges during Phase-3 writing. The Build states the requirement and
  leaves the architecture open [`lens-2` §7; `lens-3` §7].
- **Map shape (C2) is deferred but the orchestrator's routing depends on it** [`GATE-2-review.md`
  C2; `lens-2` §7]. §6a is writable at gestural altitude either way; flag the routing
  dependency in §5c and §12 so it isn't silently assumed.
