# GATE 2 — Review & Scope-Lock Worksheet

> **Status:** Phase 2 synthesis complete; holding at GATE 2. Answer inline, then hand back.
> **How to use:** each question has my **Rec** (advisory). Write your call on the **▶ Decision** line
> and anything else on **▶ Notes**. "Confirm" = accept the Rec; otherwise override.
> **Context:** draft due **2026-07-21**. "In-scope" mostly means *how deep* a section goes
> (full spec vs. framed-with-open-questions), not whether it appears.
> **Synthesis artifacts to read alongside:** `knowledge-base/synthesis/{voice-style-guide, pnc-grammar, myst-techniques, gdd-structure-model}.md` + `knowledge-base/_index.md` §2–3.

---

## Group A — Sign off the synthesis

**A1. Does the voice thesis match your intent?**
The guide is built on one spine: *quiet, flat register in service of retrospective significance* — the voice stays understated so a small thing detonates later.
- **Rec:** Confirm.
- ▶ **Decision:**
  - 
- ▶ **Notes:**
    - **current synthesis gives good tone overall for Frieren, but i worry having too many npcs that are similiar, so want to leave room for different personalities to emerge as we write.  but let's also see how the resynthesis lands with the new narrative info**

**A2. Anything to cut or redo before Phase 3?** (any of the 4 artifacts or the 75 KB notes)
- **Rec:** None — all four cleared the bar.
- ▶ **Decision:**
  - **will re-evaluate after resynthesis**
- ▶ **Notes:**

---

## Group B — Lock the 7/21 draft scope (18 holes, sorted into 4 calls)

**B1. Required rubric sections — confirm in at real depth?**
H10 (narrative pipeline), H11 (dev-crew roster), H12 (tech constraints/Pillar 2), H13 (token budget/Pillar 3). Effectively forced — they're graded.
- **Rec:** All in at depth. Flag: **H11 is the thinnest in the KB** — dev-crew roster designed largely from scratch in Phase 3.
- ▶ **Decision:**
- ▶ **Notes:**
  - **go all in but we will likely revise**

**B2. Mechanical holes H4/H5/H7/H8 — full spec tables in the draft, or grammar-referenced + framed?**
`pnc-grammar` gives the rules and the H8 matrix *axes*; the filled tables are Phase-3 work.
- **Rec:** Describe the interaction model at system altitude + reference the grammar; don't block the draft on filled matrices.
- ▶ **Decision:**
- ▶ **Notes:**

**B3. Creative holes — which will you supply content for by 7/21?** (your calls, via interview — Rule #4)
Candidates: **H1** NPC roster · **H2** personalities · **H3** seed items · **H6** magic / magic-word system · **H9** baseline narrative · **H17** 2D vs 3D.
- **Rec (5-day draft):** prioritize **H9** (emotional spine) + a small **H1** roster + 2–3 **H2** personalities + the **H6** concept; leave **H3** and **H17** lighter/open. *(New input: `frieren-primary/e11.md` gives the "Kraft template" for a brief mirror-NPC — a concrete model if H2 is in.)*
- ▶ **Decision (which you'll fill vs. leave framed):**
  - **lets walk through them and i'll fill in as much as i can when we get to filling in the GDD**
- ▶ **Notes:**

**B4. Remaining specs — which are in?**
**H14** scope math / content-budget · **H15** audio-tag contract (the USP) · **H16** notebook/rumor-graph UI · **H18** win-lose + submission format.
- **Rec:** H14 in (scope credibility) · H15 in at contract-shape (differentiator) · H18 decide now (trivial) · H16 frame-only.
- ▶ **Decision:**
- ▶ **Notes:**
  - **we will walk through, again one by one when we get to it and probe me**

---

## Group C — Borrow-calls that actually change scope

*(The other \~10 items in `myst-techniques.md` feed Phase-3 spec work — I'll resurface them in context. Only these three shift what we build.)*

**C1. Core metroidbrainia (items 1.4 / 1.8).** Adopt "knowledge travels across scenes/years" as the mechanical spine, *and* commit to a soft in-world reminder so it doesn't read as arbitrary?
- **Rec:** Yes — it's your locked core; the reminder is the only real design add.
- ▶ **Decision:**
  - **yes**
- ▶ **Notes:**

**C2. Spatial scale (items 3.1 / 3.7).** One compact, dense scene for the slice, or a fragmented multi-node map?
- **Rec:** One compact dense scene (the Stoneship "small ≠ thin" proof) — safest for 6 weeks.
- ▶ **Decision:**
- ▶ **Notes:**
  - **when we get to that place lets discuss what shape the map can take and how we might build it to be modular, or make the most out of one big map**

**C3. Ratify the Skip-for-scope list (items 5.1–5.8).** Co-op, dexterity/timing, simulated world systems, over-specified geometry, phased-release, hard-fail states — all cut.
- **Rec:** Ratify all 8 as *decided* (not merely un-adopted).
- ▶ **Decision:**
- **no co-op, no dexterity timing, no world systems but scenes in different times of day, and agree on the rest**
- ▶ **Notes:**

---

## What you do NOT need to answer now
- The other ~9 borrow decisions in `myst-techniques.md` (delta-storytelling as default, ritual re-enactment, evidence-placement tone, the doc-move borrows) — Phase-3 spec inputs; I'll resurface them.
- One-page-vs-detailed altitude — the tier system already resolves it unless you specifically want a strict one-page GDD (say so and Waves B/C collapse to stubs + linked files).
  - we will want to 2 vers, a 1-3 page pitch and a longer more detailed one to use for building

---

## Open design threads (raised at GATE 2 — not decisions, just capturing your thinking)

**D1. "Going big" — the non-violent equivalent of the mage tournament.**
Your read: the tournament/combat episodes aren't about violence — they give Frieren **contrast** (quiet default → rare spectacle) and an **outlet to go big**. We keep that *function*, drop the violence. The question is what "big" means for us.

My framing of the two poles you named:
- **Outer Wilds pole = the *mechanism*.** "Big" is a mind-expanding **revelation** — a season of small, ordinary observations detonates into one vast understanding. This is structurally what we already are (knowledge-key metroidbrainia + retrospective significance + discovery-is-the-reward). `pnc-grammar` already has the engine: Teledahn's "one insight lights up the whole week."
- **Ghibli pole = the *register*.** "Big" is **awe / sublime swell** — scale, wonder, a breathtaking tableau, warmth rather than OW's cosmic dread. On-genre and buildable per `myst-techniques` 2.9 (materialize the thesis in a final tableau) + 3.10 (reward-space as destination). Fits the cozy pillar better than OW's coldness.
- **My lean:** an **Outer-Wilds mechanism rendered in a Ghibli register** — the *big* is a knowledge/emotional revelation, delivered as awe, not spectacle-for-its-own-sake.

The sharp tension to resolve (this is the real question): the voice guide says *"weight is preloaded, not performed — amplification at the payoff destroys it"* (§4). Ghibli-awe bigness is amplification. So:
- ▶ **D1a — Is "going big" a permitted *rare exception* to the understated-climax rule (a real swell), or must it stay *understated-but-vast* (big in scale, quiet in delivery)?**
  - **permitted to payoff narrative and player reward, and sprinkled in mid moments that show wonder and beauty, can be registered as both scene composition large or small (zoomed in)**
- ▶ **D1b — Which pole leads — OW revelation, Ghibli awe, or my OW-mechanism-in-Ghibli-register lean?**
  - **we can experiment**
- ▶ **D1c — Mine the tournament/combat episodes later for *escalation / spectacle-staging grammar* (a non-combat lens — how they build & pace a big moment)? Connects to the still-deferred mage-exam arc stretch item.**
- ▶ **Your feedback:**
  - **don't need to see the tournament combat stuff.**

---

*(Housekeeping, tracked separately from decisions: source-file archive/cleanup has NOT run — 21 refs still in inbox, no `P:\game-project-kb-raw\` archive root. Run the kb-intake migration on your go.)*
