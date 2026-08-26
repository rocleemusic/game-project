# Pitch GDD Reconciliation — paste-ready prompt

**Purpose:** fold the Phase-3 decisions finalized 2026-07-18 into the 7/21 Pitch GDD, surgically. Run in a **fresh chat**
(keeps the Pitch work clean and un-bloated by the Build-depth context). Paste the block below.

---

go to projectos game-project. Reconcile the **Pitch GDD** with the Phase-3 decisions finalized 2026-07-18.

**Files:**
- Pitch (the graded 7/21 turn-in, 1–3pp): `resources/pitch-gdd_draft.md`
- Phase-3 decisions (source of truth for what changed): `resources/phase-3-decisions_draft.md`
- Altitude discipline: `knowledge-base/synthesis/gdd-structure-model.md` §3 (the Pitch stays T1 / a sharp edge; the Build carries the depth)

**Task:** a **surgical** update of the Pitch — fold in *only* what genuinely changes the Pitch's **claims** or
**open-question lines**. **Do NOT bloat it.** The Pitch is 1–3 pages; nearly all Phase-3 depth is Build-GDD material, not
Pitch. When in doubt, leave it in the Build doc. Keep the 7-section shape and the 3-page ceiling.

**Known changes to reconcile** (verify each against `phase-3-decisions_draft.md` — don't take these blind):
1. **P6 Art — 2D-vs-3D is RESOLVED → 3D** (it was a *named open question*). Update the line with a one-clause rationale
   (depth for free + level angle-reuse as a scope multiplier). **Going-big** is now a **domain-mapped blend** (social =
   Frieren restraint · world/magic = OW/Ghibli revelation+awe · philosophy = all three) — state it lightly; the lead pole
   stays experiment-tunable.
2. **P7 Open Questions — several now CLOSED:** slice math (H14: 5 days/run · 2 canned paths · 10 spells · 3 items/cat) ·
   2D-vs-3D (→ 3D) · spell count (→ 10). Remove these from the *open* ledger; list them under *Resolved (detail in Build)*.
3. **P7 — keep genuinely OPEN / PARKED (do NOT resolve):** the **letting-go ending** (release vs. hold) and the
   **going-big lead pole** — both deliberately parked. Keep **"which 1–2 endings ship"** open.

**Optional light touches** (only if they sharpen *without* adding length):
- **P3 world-hook / theme:** the theme sharpened to *"what does belonging mean — and does connection outlive a lifetime?"*
  (a truth the player uncovers, not folklore). One phrase max; depth stays in Build.
- **P5 Agentic AI:** the dev-crew is now fully spec'd (5 workers + orchestrator; `synthesis/dev-crew-architecture.md`), and
  a strong pitch point emerged — **the shipped game runs with no runtime LLM** (canned mode); the agents' real job is the
  content *pipeline*. One crisp line if P5 doesn't already carry it.
- **P4 Core Loop:** magic is collected largely by **observing and learning from people** (magic-as-connection) — a phrase, if it fits.

**Rules:** follow CLAUDE.md. This is editing an existing draft in the working file — write changes **directly** into
`resources/pitch-gdd_draft.md` (don't present a draft in chat and ask). If any edit is more than a line-swap or touches
structure, propose the change-list and check in first.

**Deliverable:** the updated `pitch-gdd_draft.md` — still 1–3 pp, 7 sections; closed questions removed from the open
ledger; 3D locked in P6; the parked items kept open in P7.
