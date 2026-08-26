---
kind: synthesis artifact
artifact: round-A-compare (three-lens side-by-side + recommended blend)
sources:
  - _resynthesis-staging/round-A/lens-1-minimalist-pitch.md
  - _resynthesis-staging/round-A/lens-2-buildable-handoff.md
  - _resynthesis-staging/round-A/lens-3-narrative-first.md
  - knowledge-base/synthesis/gdd-structure-model.md
  - knowledge-base/RESYNTHESIS-PLAN.md (§2 locked inputs, §3–5 method/guardrails, unattended-mode override)
  - GATE-2-review.md
  - knowledge-base/_index.md (§2 hole-coverage, §3 honest findings)
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (class transcript)
built: "Phase 2.5 resynthesis (2026-07-17)"
serves:
  - gdd-structure
  - Phase-4-assembly-de-risk
status: "STAGED candidate for GATE 2"
---

# Round A — Compare & Recommended Blend: The Two-Doc (+ Parking-Lot) GDD Model

**How to use this.** This is the merge pass for Round A. It reads the three divergent
lenses side by side, names where they agree, where they diverge, and the sharpest
trade-offs — then states the **auto-selected structure** for the unattended run. The
companion file `gdd-structure-model.md` (this same folder) is the rewritten structure
model that replaces the live artifact on approval; this file is the reasoning that
justifies it. **Nothing here is locked.** Per the runbook's unattended-mode override
[`RESYNTHESIS-PLAN.md` override callout], Round A auto-selects the recommended two-doc
structure so Rounds B and C can build on it without a mid-run stop; the A/B/C gates
collapse into a single GATE-2 morning review. The auto-selection below is **Roc's to
ratify or remix at GATE 2** — the open flags for that decision are listed in §6.

---

## 1. The three lenses in one line each

- **L1 — Minimalist-Pitch** [`lens-1-minimalist-pitch.md`]: treats Burdick's litmus —
  *"if a reader cannot tell you what the player does after reading your GDD, the GDD has
  failed"* — as a razor that cuts before any section is written. Owns the **Pitch GDD**
  (1–3 pp, the graded 7/21 turn-in). Its contribution is a 7-section pitch skeleton with
  a per-section "what must NOT bloat this" cut rule [`transcript`; `RESYNTHESIS-PLAN.md` §2].
- **L2 — Buildable / Agent-Handoff** [`lens-2-buildable-handoff.md`]: treats the Build
  GDD as a **handoff contract, not a design diary** — every sentence either tells an
  agent/dev-crew exactly what to do or names an open question precisely enough to close
  in Phase 3. Owns the **Build GDD**, and locates the JSON-I/O specs in §5. Its
  contribution is the section-by-section altitude map + the agent-refusal-rule discipline
  [`transcript` 21:37:05–21:37:27; `_index.md` §3.4].
- **L3 — Narrative-First** [`lens-3-narrative-first.md`]: treats **retrospective
  significance as the design engine** — the ordinary detail that detonates only when
  something is later true — and argues the two-doc split is the *correct* architecture
  for a narrative-heavy game, not a length concession. Owns the narrative weave in the
  Build GDD and the discipline of the **Parking-Lot doc**
  [`the-secret-to-frierens-worldbuilding`; `voice-style-guide` §4; `transcript` 21:55:50–21:56:26].

Each lens was assigned a document face; together they cover the full three-doc model
without overlap by design. That is why the blend is largely additive, not a tie-break.

---

## 2. Where the three lenses agree (the load-bearing consensus)

These are unanimous across all three lenses and independently traceable to the locked
inputs. They are the parts of the blend that carry the least risk.

1. **Three documents, one pipeline.** All three adopt the class's two-copy answer plus
   the never-delete Parking-Lot: a Pitch GDD (1–3 pp, even 1), an expansive Build GDD
   with narrative woven in, and a Parking-Lot doc for cut ideas. All three cite the same
   transcript moment [`transcript` 21:55:50–21:56:26 (two copies); 21:44:10–21:44:31
   ("I wouldn't delete it... a separate document... review later")] and the runbook's
   ratification [`RESYNTHESIS-PLAN.md` §2].

2. **The Pitch and the Build are different documents, not long/short versions of one.**
   L1, L2, and L3 all reject "the Build is just a longer Pitch." The Pitch's reader is a
   grader/collaborator; the Build's reader is the dev-crew and the agent orchestrator; the
   Parking-Lot's reader is Roc's future self [`lens-1` core stance; `lens-2` §1; `lens-3` §1].

3. **The Pitch's single job is the litmus.** "What does the player do?" answered in the
   first read, one to three pages, no over-polish (7/21 is a rough draft)
   [`transcript` 21:38:38–21:39:09; `RESYNTHESIS-PLAN.md` §2]. L1 makes it the cut
   criterion; L3 makes it the reason narrative stays out; L2 makes it the reason the I/O
   schemas stay in the Build.

4. **Emotional premise = the one narrative element the Pitch carries.** All three land on
   the same sentence-level carrier: *a soul searching for its partner across
   reincarnations, in a Ghibli-warm world* [`concept-dig-notes` Session 3 pitch card].
   L1 calls it P1; L3 calls it the "only form narrative takes in the Pitch."

5. **The JSON-I/O altitude is Build-only, and it lives in §5.** The class's canonical
   example (content agent → NPC dialogue as JSON: `speaker_id`, `tone ∈ {5}`, `≤40 words`)
   is the Build's §5 altitude, never the Pitch's [`transcript` 21:37:05–21:37:27]. L2
   specs it in full; L1 explicitly bars it from the pitch page; L3 routes the narrative
   pipeline spec to the same §5.

6. **The Van Buren over-specification guardrail survives and governs the Build.** All
   three defer to the current artifact's guardrail table — solo-first (no co-op),
   knowledge-gate over dexterity, one functional paragraph per location not a Cyan room
   sheet, doc-length-as-warning [`gdd-structure-model.md` §4]. None re-litigates it; L2
   points to it by reference in §10; L3 inherits it as scene-design constraint.

7. **§5 (agentic AI) and §8 (audio-first pipeline) are the thinnest, highest-stakes
   sections.** All three flag §5/H11 as under-sourced (roster designed from scratch in
   Phase 3) and §8/H15 as the differentiator with no string-level contract yet
   [`_index.md` §3.4, §2 H15]. Consensus: name the architecture and the I/O *shape*, name
   the open questions precisely, do not fake readiness.

8. **The `§12 Open/Resolved` ledger is the pressure valve.** All three keep the current
   artifact's living-doc discipline: a decision lives in exactly one place — Open (a named
   question) or Resolved-with-pointer — never both, never deleted [`gdd-structure-model.md`
   §3]. The Pitch shows a short ledger; the Build shows the full one; the Parking-Lot is
   its creative-material sibling.

---

## 3. Where the lenses diverge (and how the blend resolves each)

| # | Divergence | L1 stance | L2 stance | L3 stance | Blend resolution |
|---|-----------|-----------|-----------|-----------|------------------|
| D1 | **Section numbering** | Renumbers to a 7-section pitch skeleton (P1–P7) | Keeps the 12-section spine, adds altitude columns | Keeps the 12-section spine, maps narrative onto it | **Keep the 12-section spine for the Build; give the Pitch its own compressed 7-section face that maps 1:1 onto the spine.** The spine is the shared backbone (per current artifact); the Pitch is a projection of it, not a competing outline. See structure-model §2–3. |
| D2 | **Where narrative depth lives** | Barely — Pitch is motif-only; depth is "Build GDD material" | In §5/§6 as pipeline spec + persistence tables | A dedicated H9 treatment in §6 as a *narrative-pipeline spec, not a lore section* | **Adopt L3's framing verbatim:** the Build's §6/H9 block is a contract the agents operate against (seed-and-payoff, delta-storytelling, encounter-over-quest), not descriptive lore. L2's persistence tables sit under it. [`lens-3` §5–6; `lens-2` §6] |
| D3 | **How much agent detail on the Pitch** | One line per agent + the "wow" beat; no schema | (Pitch is not L2's doc) — but implicitly: concept only | (Not L3's concern) | **L1 wins for the Pitch:** name the agents you're confident exist (orchestrator + ≥1 content agent), one-line output each, plus the "the game remembers every life you've lived" wow. Full roster + JSON = Build §5. [`lens-1` P5; `transcript`] |
| D4 | **Parking-Lot as structure vs. as discipline** | Names it for completeness; not a GDD section | Names it in the three-doc table; append-only, unbounded | Gives it operating rules (dated, tagged, reason-as-review-trigger, review cadence, wish-vs-spec test) | **Adopt L3's operating rules** — they are the most developed and make the never-delete rule enforceable. L2's "append-only, unbounded, nothing omitted" is the one-line summary. [`lens-3` §4; `lens-2` §1] |
| D5 | **Myth-form origin: which doc?** | Pitch carries a *motif-only* world hook; full myth → Build | Myth paragraph is "not expanded in the Build — already at pitch-density" and sits in §6 | Myth is the *one* place narrative is foregrounded in the Build, at §6 lead | **The myth paragraph lives in the Build §6 as the lead; the Pitch carries only a compressed one-line world hook.** All three agree the myth is short (proposal-page2 "it began as simple greed" density); they differ only on whether the Pitch gets the paragraph or the line. Pitch = line (L1); Build = paragraph (L2/L3). [`proposal-page2`; `lens-1` P3; `lens-3` §2] |
| D6 | **Non-Goals: philosophy vs. refusal rules** | Flat list of what the game is not | Adds an "agent consequence" column — what an agent must *refuse* to generate | (Inherits from L2) | **Both, split by doc:** Pitch shows the flat Non-Goals list; Build adds L2's agent-refusal column. This is L2's single most valuable agent-pipeline addition and belongs only in the Build. [`lens-2` §2; `GATE-2-review.md` C3] |
| D7 | **Altitude of §6a (Slice World)** | Motif-only even in the Build for the Pitch; full paragraph is Build | One *functional* paragraph per location (map-annotation format) | One functional paragraph *authored in voice*, not spec-prose | **Merge L2 + L3:** the Build's §6a is one functional paragraph per location (L2's format) written in the game's flat register (L3's voice), thin by license (proposal-page1). The Pitch references areas by motif only. [`lens-2` §6a; `lens-3` §2; `myst-techniques` 4.6–4.7] |

**None of these divergences is a genuine conflict.** Because each lens was assigned a
different document face, the disagreements are almost entirely about *which doc a piece
of content lands in* — which the what-lives-where map resolves cleanly. The one place a
real editorial judgment was made is D5 (myth line vs. paragraph), and even there both
readings are compatible: a one-line hook in the Pitch that expands to the paragraph in
the Build is exactly the two-doc relationship.

---

## 4. The sharpest trade-offs (the things Roc should actually weigh)

These are the tensions that survive the blend — where the "right" call depends on Roc's
judgment, not on the sources.

1. **Pitch sparseness vs. buy-in.** L1 wants a one-sentence emotional premise; L3 flags
   [`lens-3` §7] that one sentence may read as abstract to a cold reader who doesn't
   already know the concept. The Myst proposal earns buy-in by following "acts as both
   detective and judge" *immediately* with a world description [`proposal-page1`]. **Trade-off:**
   too sparse and the pitch reads abstract; too rich and it grows past three pages. This
   is a writing task, not a structural one, but the structure must leave room for the
   Pitch's P3 (Player Role + World Hook) to earn the buy-in in two short paragraphs. The
   blend keeps L1's P3 as the pressure-relief valve for exactly this.

2. **NPC-variance: how much to spec in the Build without faking readiness.** Roc's
   GATE-2 note [`GATE-2-review.md` A1] flags homogenization worry — too many similar NPCs
   under a flat-register voice contract. L2 uses a 5-tone set as the differentiation lever
   in the §5 I/O spec [`lens-2` §7-honest-spots]; L3 says name the requirement and leave
   implementation to the Phase-3 interview [`lens-3` §7]. **Trade-off:** the tone set is a
   *floor, not a ceiling* — the actual personality range emerges during writing. The blend
   states the requirement in the Build (§5 + §6a) and explicitly leaves the variance
   architecture open, so the Build doesn't pretend the roster is designed.

3. **Interactive sequencing vs. seed-and-payoff order-independence.** L3 [`lens-3` §7]
   surfaces the voice-guide's flag that every seeding technique assumes an order the
   player may break; the pnc-grammar synthesis is the primary instrument for order-
   independent significance [`_index.md` §5]. **Trade-off:** how explicitly the Build's
   §6/H9 states this constraint vs. delegating it entirely to pnc-grammar. The blend
   names the constraint in the Build (encounter-structure: "every scene writes for any
   world-state at arrival") and points to pnc-grammar for the implementation — a Round-B
   dependency, flagged.

4. **Map shape is deferred, but the orchestrator's routing depends on it.** [`GATE-2-review.md`
   C2] leaves modular-vs-one-big-map open for Phase 3. L2 notes [`lens-2` §7-honest-spots]
   that §6a location paragraphs are the same either way, but the orchestrator's routing
   logic differs. **Trade-off:** the Build can be written at gestural altitude regardless,
   but §5c and §12 must flag the routing dependency so it isn't silently assumed.

---

## 5. The recommended blend (auto-selected for the unattended run)

**Structure selected: a three-document model** — a **Pitch GDD** (1–3 pp, the graded
7/21 turn-in), an **expansive Build GDD** (the dev-crew / agent handoff, 12-section
spine), and a **Parking-Lot doc** (cut ideas, never deleted). This matches the runbook's
§2 locked inputs and the class's two-copy-plus-never-delete answer exactly
[`RESYNTHESIS-PLAN.md` §2; `transcript` 21:55:50–21:56:26, 21:44:10–21:44:31]. **This is
auto-selected per the unattended-mode override so Rounds B and C can build on it; it is
Roc's to ratify or remix at GATE 2.**

**The blend, by document:**

- **Pitch GDD** — L1's 7-section skeleton (Elevator Pitch → Pillars+Non-Goals → Player
  Role+World Hook → Core Loop → Agentic AI "one agent, one wow" → Art Direction →
  Milestones+Open Ledger), each section carrying L1's per-section cut rule. Narrative
  appears as the one-sentence emotional premise (L3) and nowhere else. Agents appear as
  one-line-each + the wow beat (L1/D3). 1 page ideal, 3 pages hard ceiling.

- **Build GDD** — the current 12-section spine kept intact (per the current artifact and
  L2), with L2's altitude/agent-handoff shape per section, L3's narrative weave (myth at
  §6 lead, H9 treatment as pipeline spec, voice register throughout), and the JSON-I/O
  specs concentrated in §5. Non-Goals gains L2's agent-refusal column. §6a is one
  functional paragraph per location, authored in voice, thin by license. §8 (audio-first)
  and §5 (agentic AI) carry the honest thin-spot flags.

- **Parking-Lot doc** — L3's operating rules (dated + reason-tagged entries, full-sentence
  ideas not labels, review-at-every-gate cadence, the wish-vs-spec test) applied to L2's
  never-delete/append-only container. It is fed by §12 Open and by every Pitch cut that
  isn't yet Build altitude.

The concrete section map, altitude-per-section-per-doc, cut-list discipline, and the
ported Van Buren guardrail are all in the companion `gdd-structure-model.md`.

---

## 6. Open flags for Roc (the GATE-2 morning-review checklist)

The blend above is auto-selected, not decided. These are the ratify-or-remix points:

1. **Ratify the three-doc model?** (Pitch 1–3 pp + Build 12-section + Parking-Lot.) The
   runbook locks it and Roc's GATE-2 note confirms "we will want 2 vers, a 1-3 page pitch
   and a longer more detailed one" [`GATE-2-review.md` "What you do NOT need to answer"].
   Auto-selected as ratified; confirm.

2. **Pitch skeleton: 7 sections or fewer?** L1 proposes 7 pitch sections. If Roc wants a
   strict one-page Pitch, Art Direction (P6) and Milestones (P7) can collapse to one line
   each or move entirely to the Build. Flagged, not decided.

3. **Myth: line in the Pitch, paragraph in the Build (D5)?** Auto-selected yes. If Roc
   wants the full myth paragraph on the Pitch page for buy-in (the §4.1 trade-off), that
   pushes the Pitch toward its 3-page ceiling — a scope call.

4. **NPC-variance altitude in the Build (§4.2 trade-off).** How much variance architecture
   to state before the Phase-3 interview. Auto-selected: state the requirement, leave the
   architecture open. Confirm the floor-not-ceiling framing matches intent
   [`GATE-2-review.md` A1].

5. **Which of the current artifact's Wave-A/B/C assembly order survives** under the two-doc
   split. The current artifact's Phase-4 assembly order [`gdd-structure-model.md` §5] was
   written for one doc; the structure-model ports it split across the two docs. Confirm.

6. **Round-B/C dependencies this blend creates.** The blend routes: voice register + NPC-
   variance → Round B `voice-style-guide` refresh; order-independent significance →
   `pnc-grammar` refresh; the §5 roster → Round C `dev-crew-architecture`. These are
   already the runbook's Round-B/C scope [`RESYNTHESIS-PLAN.md` §4]; flagged so GATE 2 can
   confirm the structure-model didn't add scope.

---

## 7. Thin spots / KB gaps (honest accounting for GATE 2)

- **§5 (agentic AI / dev-crew, H11) is the critical-path under-sourced section**, and all
  three lenses agree. The KB gives mindset and role-seeds, no I/O schemas [`_index.md`
  §3.4]. The blend sketches the I/O *shape* from the class example; the actual roster is
  Round-C + Phase-3 work. Do not let the sketch imply readiness.
- **§8 (audio-first pipeline, H15) is the highest-value, least-supported Build section**
  (○○○ in KB) [`_index.md` §2 H15]. The blend states the naming-contract as a *string
  pattern shape*, not the string library; the library is Phase-3 finalize-in-place.
- **The Pitch's agent roster (D3) rests on a single confident anchor** — the class example
  plus the two-mode architecture lock [`concept-dig-notes` Session 9; `transcript`]. Name
  only the agents you're confident exist; the rest is a named open question. Single thin
  source flagged.
- **Slice math is obsolete under the calendar model.** The rooms-based Session-2 math is
  dead; the correct derivation (locations × days × NPCs × years) is a Phase-3 task
  [`concept-dig-notes` Session 9; `GDD-template-draft.md` §12 Open]. The blend names it as
  a precise open question in both docs' ledgers — never a guessed number.
- **2D-vs-3D (H17) is Roc's open call.** Refs ground both poles; the blend states it as a
  named open question in the Build §7 and the Pitch P6, and does not imply a decision
  [`_index.md` §2 H17; `GATE-2-review.md` D1].
- **The Pitch-sparseness-vs-buy-in tension (§4.1) is a writing risk the structure can only
  make room for, not solve.** Flagged so the Phase-4 writer treats P3 as load-bearing.
