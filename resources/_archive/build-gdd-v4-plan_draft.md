# Build GDD v4 — Revision Plan

**Deliverable:** a revision of the GDD (v4) — next class assignment, **due Thursday 2026-07-23 midnight**.
**Base:** [`build-gdd-v3_draft.md`](build-gdd-v3_draft.md) (preserve v3; v4 = new file `build-gdd-v4_draft.md`).
**Inputs:** the two review-kit syntheses (below) + human classmate feedback (below), the latter taken more seriously than the AI reviews.

---

## Source inputs

### Review-kit outputs (take with a grain of salt)
- **Craft board** — `P:\GitHub\gdd-review-kit\reviews\SYNTHESIS.md` (7 lenses: Systems · Narrative · Player-Psych · Feasibility · Adversarial-QA · Business · Audience-Advocate). 7 findings at BLOCKING.
- **Audience panel** — `P:\GitHub\gdd-review-kit\reviews-audience\SYNTHESIS.md` (3 synthetic players: Maya Cozy-Regular · Theo Puzzle-Sleuth · Robin Story-Seeker).

Both converge on one headline: **"declare the success metric + name the primary audience"**, and their sharpest claim is *cozy and deduction cancel — pick one.*

### Human feedback (warmer — and it contradicts the AI's headline)
- **Ken B** — likes it *because* it's a calm/chill roguelike; wants a **name**.
- **Jon C** — likes the "reward is last life's knowledge" theme; asks: what if a player invests only in **one NPC** across runs — does that still work?
  - **Roc's answer (bank this into v4):** NPCs are also randomized. 1–3 fully-fleshed + 2–5 simple; every run caps NPCs at **5–7**, so the soul you want **may not be present**. → kills "deep-farm one soul" and "scan the small list" for free.
- **Nick Rouke** — clear picture; wants to know **how time flows day-to-day** and **what drives character change, technically**.
- **Roc's own stated direction:** *"reduce scope even more to get 1 core loop done to see how it feels."*

**Reconciliation:** discount the AI's "pick one audience or die" positioning claim (real players wanted the blend). Keep every *mechanical* gap underneath it — those are true regardless of taste.

---

## The key finding: the narrative pipeline already answers 3 panel concerns

Read of the `narrative-pipeline/` mini-KB (pipeline · steering-layer · guardrails · build-loop · NEQ prior-art · worked Mara example):

1. **Overloaded bond count (both panels' #1).** Panels: "one hidden number is forced to be deduction-reward + memory + friendship-meter." The pipeline **already splits these**: `guardrails.md` check 2 (Superposition) + `pipeline.md` step 9 — **essence side = fact** (assertable/confirmable/revisable) vs **bond side = emergent** (hidden/accreted/one of several endings); neither feeds the other. **But §10/§17 of the GDD violate this** by tying the recognition leitmotif to "as data accrues." → **Highest-leverage fix: move the leitmotif trigger off the accrual counter onto "a detail the player noticed and matched last life."** This is simultaneously the panels' one unifying cheap fix and what step 9 already requires. It's a correction, not a new system.
2. **No distinct person on the page (audience BLOCKING).** Panel cheap-fix: "put the deep souls' real key lines in the doc." The `worked-example-mara.md` *is* that (Mara vs Odo — "not swappable by changing a noun"). Folds into v4 thread #2.
3. **Reshuffle erases every perceptible anchor (audience #3).** Step 9 already gives a **diegetic almanac the player fills** + **soul-bound objects that travel** (Mara's drawer). §8.1 just fails to surface them. → v4 elevates the almanac + soul-bound keepsakes as *the* perceptible carry.

**What the pipeline does NOT decide → Roc must:** belonging *reciprocity* (see D2).

---

## primals — Option B (LOCKED, fold into v4)

**Decision:** bring the Primal World Beliefs lens (`knowledge-base/narrative/primal-world-beliefs-npc-lens.md`) into the design as an **upstream generative seed** on the persona_card.

**Why it earns its place — hits 3 concerns + Nick's question from one lens:**
- Distinctness becomes *derived, not asserted* (answers §19's top unproven risk — "can't prove NPC distinctness on paper").
- Souls with different worldviews **attend to different things** → observable, collectible in-world evidence → strengthens the recognition gate (feeds the evidence-gating / noticed-detail fix).
- A primal is a *belief* a discovery can shift → gives **character-change-across-runs a real engine** (Nick's technical question) and the Arc Spine (X→Y) a backbone.

**Where it folds in:**
- **GDD:** §8.3 (Cards step — one line) · §11 Agent 1 (add `primal_profile` to essence fields; deflection/precision/warmth become its *derived* surface expression) · §19 (reframe distinctness risk as derived-and-checkable; keep the "generate deep souls' lines" validation).
- **Pipeline KB (secondary, can follow):** `persona-card-schema.md` (top essence field) · `pipeline.md` step 3 (fill primal first, derive axes) · `steering-layer.md` (Spine as belief-shift).
- **Guard:** primals are "the world is ___" *sentences* seeding hand-written specifics — **never a stored numeric profile** (rhymes with the Superposition "flatten into numbers" refusal; essence-side worldview, orthogonal to the bond guard). Mind the **Alive/"needs-me"** primal — our world literally *is* authored/quest-giver, so it's in-fiction partly true; mine for uncanny effect, keep it from reading 4th-wall.

---

## Consolidated v4 plan

| # | Thread | What v4 does | Status |
|---|--------|--------------|--------|
| 1 | **Scope** | Town-only · ~5 souls (2 deep + 3 texture) · one festival week · one year-jump · **one reshuffle** (keeps the recognition beat) · 1 ending on a light spectrum. Cut Farm + the 3-year cycle. | ⏳ confirm (D1) |
| 2 | **v1 story arc** | New/expanded section: one deep soul's arc doc (World Truths · Arc Question · Spine · Threads · What-it's-NOT) + one seed→payoff echo with **real sample lines**. The "distinct person on the page" proof. | ✅ agreed |
| 3 | **Festival night** | Declare a success function reading the run (bonds · recognitions · contributions) → a **spectrum** in the vignette/lighting/who-shows-up layer (not branched scenes) → top tier = the **"souls-of-the-world display."** Fixes the "no crescendo" finding + the reviewers' festival-outcome disagreement. | ⏳ tiers (D3) |
| 4 | **Crew expansion** | +Agent 6 Style/Art-Direction (= the 8/6 milestone, missing from roster; fills Feasibility F1) · +Agent 7 Production/PM (fills the unscheduled review-week / back-loaded schedule finding) · an **Engineering track** (ink↔UE · persistence engine · tag-to-asset library · week-1 save/load smoke test). | ⏳ eng ownership (D4) |
| 5 | **Onboarding** | Diegetic first-screen flow: persona select → world offers safe obvious affordances that teach the 4 verbs by doing → notebook as a found object. | ✅ agreed |
| 6 | **Bond-count fix** | Surface the essence/bond split; **move the leitmotif trigger off the accrual counter onto a noticed-and-matched detail.** Highest-leverage edit. | ✅ agreed |
| B | **primals** | Folded per the section above. | ✅ locked |

---

## Open decisions to lock before drafting

- **D1 — Scope:** confirm the row-1 narrowing, or adjust (narrower / keep more)? *Rec: as written.*
- **D2 — Belonging reciprocity:** oblique (soul's act witnessed by a third party — the pipeline's current stance), one direct "the soul knows you back" beat, or leave open? *Rec: oblique — most buildable, most Frieren.*
- **D3 — Festival tiers:** 3 tiers (quiet → warm → grand) + the souls-display as a rare top? *Rec: yes.*
- **D4 — Engineering:** human track with AI assist, or an autonomous agent? *Rec: human track — the persistence save is load-bearing; the pillar says AI never decides.*
- **(nice-to-have) Name:** Ken asked. "Codename: rebirth" is the placeholder.

---

## First move when we resume
Lock **D1–D4** (or "recs are fine"), then draft `build-gdd-v4_draft.md` — copy v3, apply the 6 threads + primals-B, surface content-only stubs as inline **▶ Roc** calls. Optionally draft the skeleton + the D6 bond-count fix first while D1–D4 settle.
