# Game-Project Knowledge Base — Ingestion Plan (Runbook)

> **Read this first.** This is the clean-context brief for the ingestion session. Goal: turn a pile of reference material into a distilled knowledge base that fills the GDD's open holes, so the GDD body (§1–10) can be written for the **Assignment-1 draft due 2026-07-21**.
>
> **Execution is gated.** Do the phases in order; stop at each **GATE** for Roc. Do not fan out beyond a phase's gate.

---

## Operating rules (from the "11 Rules", compressed)

1. **One job per agent** — each extractor reads ONE ref (or one tight group) and emits ONE note. Never "read everything and write the GDD."
2. **Structured context, not raw dumps** — this KB *is* the point. Never feed raw transcripts/PDFs into a GDD-writing session; work from the distilled notes.
3. **Right-size the model** — bulk transcript extraction on Haiku; design-dense refs (P&C, AI-workflow, Myst) on Sonnet; synthesis on the strong model.
4. **Human sets the bar / decides content** — agents extract *grammar and craft*; Roc supplies the *creative content* (NPCs, items, story) and decides what to borrow. Turn the brain on, not off.
5. **Ground everything; do not invent** — every extracted claim traces to the ref. No speaker-guessing on un-diarized transcripts.

---

## The GDD hole map (the target)

Decided already (needs writing-up, not deciding): concept & story spine · pillars · inspirations · core loop & nested clocks · the four interaction families · emergent-partner metaphysics · two-mode architecture · slice contract · engine (Unreal) · slice persona (mage) · map = calendar · magic = memory-based metroidbrainia. *(Source: `resources/GDD-template-draft.md` §12; `resources/concept-dig-notes.md` Sessions 1–9.)*

| Hole | What's missing | Work type |
|------|----------------|-----------|
| H1 | Initial NPC roster (slice count + who) | Roc's call (interview) |
| H2 | NPC personalities — descriptor sets + essence signatures | Roc + Frieren craft |
| H3 | Seed item list (concrete) | Roc's call |
| H4 | Point-and-click mechanics — actual scene-interaction grammar | Refs (P&C, Myst) + spec |
| H5 | Item verb table — what each item does | Spec |
| H6 | Magic/spell list — effects, the "magic word" system | Spec + Roc |
| H7 | Crafting (Make) — recipe format, discovery rules | Spec |
| H8 | Interaction permutation matrix — families × target types | Spec |
| H9 | Baseline narrative — slice Age, NPC past-life echoes, promise vignette | Roc + Frieren + Myst |
| H10 | Narrative pipeline — the dev-crew story agent(s) = class Pillar 1 | Agent design |
| H11 | AI architecture / dev-crew roster — named agents, I/O, engine integration (**required**) | Agent design |
| H12 | Technical constraints — API limits, context windows, human gates (**Pillar 2**) | Spec |
| H13 | Token budget (**Pillar 3, required**) | Estimate |
| H14 | Scope math / content-budget table | Math |
| H15 | Audio-first tag / auto-link contract (§8 USP) | Spec |
| H16 | Notebook / rumor-graph UI | Spec + UI refs |
| H17 | Art direction — 2D vs 3D for slice, per-Age look | Roc + art refs |
| H18 | Win/lose framing + submission format (HTML/PDF) | Trivial decision |

**Draft-scope decision (H-in-scope for 7/21) is deferred** until Roc sees the full gap map after ingestion — see GATE 2.

---

## Sources → tracks → holes

| Track | Source | Files | Method | Serves | Model |
|-------|--------|-------|--------|--------|-------|
| **narrative** | `RL_MAP/AI_Learning/inbox/game-project-refs/` (essays) | 41 Frieren essays (`P:\frieren`) + Tchaikovsky + Writing-with-AI | text extractor | H2, H9, H10, style-guide | Haiku bulk |
| **frieren-primary** | subslikescript.com S1 | 28 episode transcripts (scrape) | firecrawl → shortlist → deep voice-extract | H9, style-guide | Haiku/Sonnet |
| **point-and-click** | game-project-refs | 5 P&C refs | text extractor | H4, H5, H7, H8 | Sonnet |
| **ai-workflow** | game-project-refs | AI Workers, Godot Architecture | text extractor | H10, H11 | Sonnet |
| **ui-juice** | game-project-refs | Lexispell UI, Procedural Anim, UX Psychology | text extractor | H16 | Sonnet |
| **art** | game-project-refs | Blender, 3D Modeling, Moodboards | text extractor | H17 | Sonnet |
| **build-feasibility** | game-project-refs | 5 Unreal refs → **1 thin merged note** | text extractor | H12 | Sonnet |
| **myst-proposal** | `P:\_game-project-refs\myst\proposal` | 6 PNGs (Page1/2 + 4 Age images) | **vision-Read** → note per image | H9, H4, H16, gdd-structure | Sonnet |
| **myst-ages** | `P:\_game-project-refs\myst` | 5 PDFs (Kadish Tolesa, Teledahn, Laki, Garrison, Ahnonay) | **markitdown → technique-mining extractor** | H9, world/progression, gdd-structure, scope | Sonnet |

---

## KB structure

```
game-project/knowledge-base/
  INGESTION-PLAN.md              # this file
  _index.md                      # built during ingestion: what's in, hole coverage
  _agents/ref-extractor.md       # the extractor agent def + variants
  narrative/<ref>.md             # one note per ref  (2 pilot notes already exist)
  frieren-primary/<episode>.md   # distilled voice notes (NOT raw transcripts)
  point-and-click/<ref>.md
  ai-workflow/<ref>.md
  ui-juice/<ref>.md
  art/<ref>.md
  build-feasibility/unreal-production.md
  myst-proposal/<image>.md
  myst-ages/<age>.md
  synthesis/
    voice-style-guide.md         # essays + frieren-primary  (Rule #5 artifact)
    pnc-grammar.md               # reverse-outlined interaction grammar
    myst-techniques.md           # borrow-menu, cross-referenced to holes
    gdd-structure-model.md       # how OUR gdd is structured & at what altitude
```

Every note uses the schema in `_agents/ref-extractor.md`. **The two pilot notes** (`narrative/the-secret-to-frierens-worldbuilding.md`, `point-and-click/point-and-click-puzzle-design.md`) are the approved quality bar and the extractor's few-shot exemplars.

---

## Constraints (bake in)

- **PDF rendering is broken in this env** (`pdftoppm` not installed). Do NOT `Read` the Age PDFs directly. Convert first: `markitdown "<file>.pdf" -o <out>.md` (markitdown 0.1.5 confirmed installed; clean text, no OCR needed). Test output at `scratchpad/kadish.md`.
- **Copyright + repo hygiene.** This repo auto-commits and pushes on every save. **Raw Frieren transcripts and any raw scrape stay OUT of the repo** — stage at `P:\frieren-primary\` (sibling to `P:\frieren`, outside RL_MAP). Only **distilled** notes (patterns + short exemplars) get committed. The game's own writing must be original (Rule #10: steal the grammar, not the words). No note reproduces long copyrighted passages.
- **No speaker-guessing.** Frieren transcripts are un-diarized. Extract voice/cadence/structure, not per-character line attribution; where character contrast matters, lean on the essays and mark any inference explicitly.
- **Model routing** per the Sources table.

---

## Phased sequence & gates

**Phase 0 — Setup** ✅ *(this session)*
- Schema pilot (2 golden notes) · extractor def · this runbook · task backlog. **GATE 0 passed.**

**Phase 1 — Ingestion**
1. Narrative essay pass (41 + 2) → notes; **emit `frieren-primary` episode-priority shortlist** as a side output.
2. Firecrawl scrape Frieren S1 (28 eps) → `P:\frieren-primary\` (raw, outside repo).
3. Deep voice-extraction on the shortlisted episodes only → `frieren-primary/` notes.
4. point-and-click, ai-workflow, ui-juice, art tracks → notes (Sonnet).
5. build-feasibility: 5 Unreal refs → one thin note.
6. myst-proposal: vision-Read 6 images → notes.
7. myst-ages: `markitdown` 5 PDFs → technique-mining extraction (5 lenses) → notes.
8. Build `_index.md` (hole coverage map).
> **GATE 1** — Roc reviews the KB before synthesis.

**Phase 2 — Synthesis**
- `voice-style-guide.md` · `pnc-grammar.md` · `myst-techniques.md` · `gdd-structure-model.md`.
> **GATE 2** — Roc reviews synthesis + the full gap map, then **locks which holes are in-scope for the 7/21 draft**.

**Phase 3 — Hole-filling** *(interview-driven; Roc decides content — Rule #4)*
- Interview Roc to close creative holes (H1–3, H6, H9, H17).
- Spec mechanical holes (H4, H5, H7, H8) and AI/tech holes (H10–H14) from the KB.
- Remaining specs: H15 audio tag contract · H16 notebook UI · H18 win-lose + format.
> **GATE 3** — Roc reviews closed holes before assembly.

**Phase 4 — GDD assembly**
- Write GDD body §1–10 from decisions + KB. Produce submission format (HTML per rubric).

**Phase 5 — Review**
- Run the **gdd-review-kit 6-agent panel** on the draft (satisfies the class "find one logic gap" requirement) → revise → final 7/21 draft.

---

## Pointers
- **Reusable intake:** for new refs *after* this initial pass, run the **kb-intake** skill → `knowledge-base/_intake/SKILL.md` (this runbook was the one-time manual version).
- Decisions & concept: `resources/GDD-template-draft.md`, `resources/concept-dig-notes.md`
- Class bar & rubric: `resources/syllabus.md`, `AI_Learning/multi-agent-class-transcripts/processed/Multi-Agent-Class-02-summary.md`
- Review panel: https://github.com/GixGosu/gdd-review-kit (6-agent synthetic audience + HTML report)
