---
kind: synthesis artifact
artifact: morning-review-index (Phase 2.5 resynthesis — GATE 2 landing)
run-id: wf_dfbed084-df0
built: "Phase 2.5 resynthesis (2026-07-17, overnight unattended)"
holds-at: "GATE 2 — Phase 3 does NOT start unattended"
status: "STAGED — nothing promoted to live until Roc approves"
---

# Morning Review — Phase 2.5 Resynthesis

**Good morning. Start here, then read the three compare write-ups, then promote.**
This is the index for the overnight resynthesis run. Every artifact below is **staged**;
the live Phase-2 synthesis artifacts are **untouched**. Your job at GATE 2: skim this page,
read the three COMPARE files (in the order given), spot-check the deliverables, then run the
promotion checklist to move staged → live. **Do not start Phase 3 until you lock the 7/21
scope** (see the STOP note at the bottom).

---

## 1. What happened

The Phase-2.5 resynthesis ran **unattended overnight** (run `wf_dfbed084-df0`), executing
**Rounds A → B → C straight through**. Per the runbook's unattended-mode override, the
per-round gates (A, B, C) were **collapsed into a single GATE-2 morning review** — instead of
stopping mid-run to ratify Round A before B could build on it, each round auto-selected its
recommended output so the next round had a spine to work from. Model routing held: divergent
**lenses ran on Sonnet**, every **compare/merge and the two straight refreshes ran on Opus**.
Round A rewrote the GDD structure model into a **three-doc model** (Pitch GDD + expansive Build
GDD + Parking-Lot). Round B refreshed `voice-style-guide` and `pnc-grammar` and produced a new
`going-big-brief` (3 lenses → compare). Round C recon'd three external game-studio agent repos,
ran 3 lenses, and produced a new `dev-crew-architecture`. The run **held at GATE 2 by design** —
Phase 3 does not begin unattended, and **nothing was promoted to the live synthesis folder.**

---

## 2. Recommended review order

Read the **three compare write-ups first** — they carry the reasoning, the divergences, and the
open decisions. The deliverables are the *result* of that reasoning; the compares tell you what
you're ratifying and where the judgment calls were made.

1. **`round-A/COMPARE.md`** — the two-doc (three-doc) GDD structure decision. Read this first; it
   sets the spine that B and C build on. Auto-selected, needs your ratification (§4).
2. **`round-B/going-big-brief.COMPARE.md`** — the OW / Ghibli / Frieren pole reconciliation. Left
   **open-to-experiment** per D1b; read the layer-split call (§2 of that file).
3. **`round-C/COMPARE.md`** — the dev-crew roster (5 workers + orchestrator). Read the fifth-slot
   call and the recon-disposition recommendation.

**Then the deliverables**, in the same round order:
- `round-A/gdd-structure-model.md`
- `round-B/voice-style-guide.md`, `round-B/pnc-grammar.md`, `round-B/going-big-brief.md`
- `round-C/dev-crew-architecture.md`
- Supporting (optional deeper read): the lens files in each round, and `round-C/recon.md`.

---

## 3. Every staged deliverable — what changed, where it is, where it promotes to

Live artifacts live in `…/knowledge-base/synthesis/`. Staged candidates live in
`…/knowledge-base/synthesis/_resynthesis-staging/round-*/`. Promote-to paths are all under
`…/knowledge-base/synthesis/`.

| Deliverable | What changed vs. the live artifact | Staged at | Promote-to |
|---|---|---|---|
| **gdd-structure-model.md** | **Rewritten.** Live is a single 12-section spine. New version = **three-doc model**: Pitch GDD (1–3 pp, the graded 7/21 turn-in) + expansive Build GDD + Parking-Lot doc. Adds a 1:1 shared-spine section map, per-section altitude/tier for both docs, a what-lives-where cross-doc content table, and the cut-list discipline. **Ports the 10-item Van Buren over-specification guardrail intact.** | `round-A/gdd-structure-model.md` | `synthesis/gdd-structure-model.md` |
| **voice-style-guide.md** | **Refreshed** (integrated, not concatenated; 18 notes folded in). Kept 11-section spine + DO/DON'T checklist. **ADDED §5A "NPC variance within the flat register"** (a method answering the A1 homogenization worry — register = shared world-dialect, variance = per-NPC content; explicitly a *floor* for emergence, not a ceiling) and **§7A "Visual lens — how the voice looks"** (color/composition rules, scope-capped to the slice's 2–3 characters). | `round-B/voice-style-guide.md` | `synthesis/voice-style-guide.md` |
| **pnc-grammar.md** | **Refreshed** (14 notes; 29 `[NEW]` markers). Kept the 9-section spine. **ADDED §2.6 deduction-loop** as a sixth gate archetype (find/think/prove), **§2.4 time-of-day-as-authored-state** (C3 carve-out, grounded on Kadish/Garrison fixed-lighting precedents), **§2.0 the C1 lock** (knowledge travels across scenes/years) as its own rule, and **§2.2 order-independent-significance constraint** (satisfies the structure-model's stated §4/§6a dependency). Note: this candidate is a prior good run + targeted strengthening edits, not a from-scratch rewrite. | `round-B/pnc-grammar.md` | `synthesis/pnc-grammar.md` |
| **going-big-brief.md** | **New artifact** (no live equivalent). Presents all three poles as **live experiments, not a lock** (D1b): A = OW Revelation / mechanism, B = Ghibli Awe / visual amplitude, C = Frieren Restraint / register. Recommends a distribution (C default; A earns the payoff; B the rare budgeted breath — "OW mechanism in a Ghibli register") but does not lock it. Two-tier trigger taxonomy + a §7 routing table + 5 open Phase-3 dials. | `round-B/going-big-brief.md` | `synthesis/going-big-brief.md` |
| **dev-crew-architecture.md** | **New artifact** (no live equivalent; fills H11). **5 workers + 1 orchestrator**: Orchestrator, Narrative Architect, Content/Dialogue Agent, Consistency Verifier, Audio-Tag Agent. Each with a role def, JSON-altitude I/O sketch, when-called, human gate, and realistic-capability check, cross-checked against the two-mode (canned + live) architecture. H11 marked honestly as largely from-scratch — 10 named thin spots, 3 genuine Phase-3 blockers. | `round-C/dev-crew-architecture.md` | `synthesis/dev-crew-architecture.md` |
| **myst-techniques.md** | **Unchanged.** Not touched by this run — no staged candidate, no promotion needed. It stays as the live artifact. | (live, untouched) | (no change) |

Supporting/reference files (not deliverables, but staged for your read): all `lens-*` files in each
round, `round-A/COMPARE.md`, `round-B/going-big-brief.COMPARE.md`, `round-C/COMPARE.md`,
`round-C/recon.md`. See §5 (recon disposition) for what to do with the recon output.

---

## 4. AUTO-SELECTED — needs your ratification

**The three-doc GDD structure was auto-selected, not chosen by you.** Per the unattended-mode
override, Round A had to pick a structure so Rounds B and C had a spine to build on. It picked the
**three-document model**:

> **Pitch GDD (1–3 pp, the graded 7/21 turn-in) + expansive Build GDD + Parking-Lot doc.**

The blend was largely **additive, not a tie-break**: the three lenses were each assigned a
different document face (L1 = Pitch, L2 = Build, L3 = narrative-weave + Parking-Lot), so there were
no genuine conflicts — only decisions about which document a piece of content lands in, resolved by
the what-lives-where map. **This is the load-bearing decision of the whole run** — Rounds B and C
already assume it (voice-style-guide points its §5A NPC-variance floor at Build §5/§6a;
dev-crew-architecture is written as Build §5b; going-big-brief routes to Build §7/§8). **Ratify it,
or remix it, before promoting anything else.** Open sub-decisions from Round A:

- Keep the **7-section Pitch skeleton**, or collapse P6/P7 for a strict one-page Pitch?
- **Myth:** one-line hook in the Pitch + full paragraph in the Build (D5), vs. a full paragraph on
  the Pitch page for buy-in?
- **NPC-variance altitude** in Build §5/§6a — state the requirement, leave architecture open
  (floor-not-ceiling). Confirm this matches intent (ties to A1).
- Confirm the **ported Phase-4 assembly order** split across the two docs.
- Confirm the structure-model added **no scope beyond the runbook's plan**.

---

## 5. Consolidated OPEN FLAGS FOR ROC

These need a decision from you before or at promotion. Grouped by round; the four you called out
are marked **★**.

**Round A — structure**
- ★ **Ratify the three-doc model** (auto-selected; §4 above) — or remix at GATE 2.
- Pitch skeleton: 7 sections vs. collapse P6/P7 for one page.
- Myth altitude: one-line hook in Pitch + full paragraph in Build, vs. full paragraph on the Pitch.
- NPC-variance altitude in Build §5/§6a (floor-not-ceiling) — confirm matches intent.
- Confirm ported Phase-4 assembly order and that no scope crept in beyond the runbook plan.

**Round B — voice, pnc, going-big**
- ★ **A1 — voice re-eval re: NPC homogenization worry.** GATE-2 A1 said *"good tone overall for
  Frieren, but I worry about too many NPCs that are similar — leave room for different personalities
  to emerge, and see how the resynthesis lands with the new narrative info."* The refresh's answer is
  **§5A**: register = shared world-dialect; variance = per-NPC content (what each NPC deflects
  toward, is precise/vague about, refuses to cross). **It is a METHOD, not a filled roster** — the
  trait axes and uncrossable lines are yours to set in Phase-3 writing. **Confirm the framing lands.**
- ★ **Going-big left open-to-experiment** (D1b) — the §4 routing table is a *recommended
  distribution, not a lock*. Load-bearing call to confirm: the §2 layer-split reads voice-style-guide
  §4 as a **text rule** (visual swell + flat/silent text = permitted; text swell = failure). If you
  read §4 as a total-register prohibition, the brief falls back to the fully-specified
  Experiment-C "understated-but-vast" (compositional opening only, no saturation lift).
- Thin-source flags in voice: the Kraft brief-mirror-NPC template (§5/§5A) rests on one un-diarized
  episode (e11); §7A's *process* claims come from admiration-level essays (the color/background
  *craft* rules are solid).
- pnc: the C1 "soft in-world reminder" is a **synthesized** mechanic (no single source) — trigger
  and phrasing are Phase-3 work. Time-of-day carve-out is grounded for **fixed** states only; a scene
  that *cycles* between authored states has no KB source — confirm whether one fixed state per scene
  is enough for the slice.
- going-big: swell-frequency budget (one swell per gate, 2–3 wonders per run) is an **untested
  hypothesis**; no sourced audio grammar for any pole (H15 thin).

**Round C — dev-crew + recon**
- ★ **Recon disposition** — promote a thin slice, discard the bulk. **Recommendation:** extract **one
  committed reference note** to `ai-workflow/` capturing only the five transferable orchestration
  patterns (session-state bus, mode-selector, accumulated-context chain, approval-before-write gate,
  lore_master consistency satellite) — because the deliverable depends on them and a synthesis
  artifact shouldn't lean on an ephemeral staging file. **Discard/archive** the 54/11/10 agent
  inventories (served their purpose). *Not commit-whole, not discard-whole.* Your call.
- Consistency/verification agent (Agent 3) is adopted as a full slot with high three-lens
  convergence, but its **agent-shape is thin-sourced** (one repo's `lore_master` + one runbook Q&A).
  Its check-set is well-grounded; the *shape* needs your eye.
- **Fifth-slot spend** is a judgment call: the compare gave slot 5 to the **Audio-Tag Agent** (owns
  the H15 audio USP, cleanest I/O) and demoted QA to an orchestrator stress-test pass. If you defer
  the audio USP or prioritize experiential QA, a standing QA agent could take the slot. Named remix
  point.
- Echo/retrospective-significance was **folded into the Narrative Architect** (not L1's separate Echo
  Architect) to honor SRP — confirm the fold vs. splitting into Echo-Seeder + Echo-Verifier.
- Runtime State Tracker / ICM scoped **out** of the H11 crew to Build §5a (H10) per the hard
  context-separation guardrail — confirm this boundary.
- Genuine Phase-3 gaps no lens closes: **token budget** (H13, required rubric section), **live-mode
  I/O + session-log format**, multi-agent retry/escalation protocol, session-state-bus field schema,
  Audio-Tag contract (blocked on the verb-grammar sub-verb list), and whether the orthogonal-trait
  pipeline yields *perceptually distinct* NPCs (the A1 worry — needs real writing samples).

**Cross-round**
- ★ **A2 — cut/redo re-eval of the four artifacts.** GATE-2 A2 asked "anything to cut or redo before
  Phase 3?" and you answered **"will re-evaluate after resynthesis."** This is that moment. The four
  artifacts to re-judge: **gdd-structure-model, voice-style-guide, pnc-grammar** (refreshed) plus the
  two new ones (**going-big-brief, dev-crew-architecture**). Confirm each clears the bar, or name what
  to cut/redo before promotion.

---

## 6. PROMOTION CHECKLIST (staged → live) — run when you approve

Do this **only after** ratifying the three-doc model (§4) and clearing A2 (§5). Copy each staged
file over its live destination. **The auto-commit hook will commit each promotion automatically**
after each save — you don't need to `git add`/`commit` by hand, and each file lands as its own
commit.

- [ ] **Ratify the three-doc structure** (§4) — gate for everything below.
- [ ] `round-A/gdd-structure-model.md` → `synthesis/gdd-structure-model.md` *(overwrites live)*
- [ ] `round-B/voice-style-guide.md` → `synthesis/voice-style-guide.md` *(overwrites live)*
- [ ] `round-B/pnc-grammar.md` → `synthesis/pnc-grammar.md` *(overwrites live)*
- [ ] `round-B/going-big-brief.md` → `synthesis/going-big-brief.md` *(new file)*
- [ ] `round-C/dev-crew-architecture.md` → `synthesis/dev-crew-architecture.md` *(new file)*
- [ ] **myst-techniques.md** — no action (unchanged; stays live as-is).
- [ ] **Recon disposition** (§5): if adopting the recommendation, extract the one reference note to
  `ai-workflow/` and archive/discard the raw inventories in `round-C/recon.md`.
- [ ] After promoting, the `_resynthesis-staging/` folder can be archived — the live artifacts are now
  the source of truth. (Keep the COMPARE files if you want the reasoning trail.)
- [ ] Confirm the auto-commit hook fired for each promotion (check `git log`).

---

## 7. STOP — do not start Phase 3 until Roc locks the 7/21 scope at GATE 2

**Phase 3 does not begin until you lock the 7/21 draft scope at GATE 2.** The run held here by
design. Promoting the staged artifacts is *not* the same as starting Phase 3 — promotion just makes
the refreshed synthesis live. Phase 3 (filling the 18 holes, writing the actual Pitch + Build GDD
content, designing the dev-crew roster, per-NPC voice work) waits on your explicit GATE-2 scope lock
— including the still-open GATE-2 calls (B1 "go all in but we will likely revise", the H10–H13
required rubric sections, and the mechanical holes). **Do not have any agent start Phase-3 content
work until you say the scope is locked.**
