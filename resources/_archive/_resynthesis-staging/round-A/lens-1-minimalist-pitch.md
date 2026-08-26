---
kind: resynthesis-staging artifact
round: A
lens: L1 — minimalist-pitch
artifact: two-doc structure model (Pitch GDD side)
built: 2026-07-17 overnight run
status: STAGED — not promoted; awaits GATE-2 morning review
governing-rule: "§2 locked inputs + §5 guardrails from RESYNTHESIS-PLAN.md. No re-litigation of locked decisions."
sources-read:
  - RESYNTHESIS-PLAN.md (§2, §4, §5)
  - GATE-2-review.md
  - knowledge-base/_index.md §2–3
  - knowledge-base/synthesis/gdd-structure-model.md
  - game-project-resources.md (descriptions only)
  - resources/GDD-template-draft.md
  - resources/concept-dig-notes.md (all sessions)
  - knowledge-base/myst-proposal/proposal-page1.md
  - knowledge-base/myst-proposal/proposal-page2.md
  - knowledge-base/synthesis/myst-techniques.md Group 4
  - P:/_DOWNLOADS/Multi Agent AI for Game Development.txt (transcript)
---

# L1 — Minimalist-Pitch Lens: The Pitch GDD

## Core stance

Josh Burdick's rule is a razor, not a style preference: **if a reader cannot tell you what the player does after reading your GDD, the GDD has failed.** [`transcript`] That litmus cuts before any section is written. The Pitch GDD is the graded 7/21 turn-in — one to three pages, Assignment 1 is explicitly a rough draft, and over-polish is waste. [`transcript`, `RESYNTHESIS-PLAN.md §2`] Detail belongs in the Build GDD and Assignment 2; the Pitch's only job is to make the player role and the core fun legible in one read.

The phrase Burdick uses — "more specific, not longer; cut wishes, keep specs" [`transcript`] — inverts the default instinct. Length signals effort; specificity signals clarity. The Pitch lives or dies on that distinction.

---

## The litmus, stated plainly

After reading the Pitch GDD, any person should be able to answer:

1. **What does the player do?** (the core verb, done hundreds of times)
2. **What does success feel like?** (the emotional payoff — the *why*)
3. **Why are AI agents central to this, not incidental?** (the class-graded differentiator)

If a sentence does not advance one of those three answers, it does not belong on the pitch page. This is not an aspiration; it is the cut criterion applied section by section below.

---

## The Pitch GDD skeleton (proposed)

Seven sections. Each must fit on one to three pages total. Most sections are one to four lines; the document earns every sentence or loses it.

---

### P1. Elevator Pitch (T1 — one sentence)

**What earns its place:** the player verb + the emotional payoff in one sentence. No genre tag, no world lore, no system names.

Our pitch card v2 delivers this: *"A soul searching for your partner across reincarnations in a Ghibli-warm magical world — you read lives, deduce who they've become, and the game remembers every life you've lived."* [`concept-dig-notes.md Session 3`]

**Litmus:** can a stranger state what the player does after reading this sentence? Yes. Cut anything added to "help."

**What MUST NOT bloat P1:** world backstory, tech stack mentions, genre tags ("roguelike," "point-and-click"), system names (ICM, two-mode architecture). Those are implementation; this is the feeling.

---

### P2. Design Pillars + Non-Goals (T1 — one phrase per pillar, one line per non-goal)

**What earns its place:** pillars settle future arguments; they are not explanatory prose. Non-Goals are scope insurance — each one names a specific thing the game is not. [`gdd-structure-model.md §1`]

Locked pillars (all present, no additions): non-violent core · strategy over dexterity · discovery is the reward · cozy rhythm · pull not push (world-as-quest-giver) · trust the player · agentic AI wow · callback legibility. [`GDD-template-draft.md`, `concept-dig-notes.md Session 2`]

Non-Goals at minimum: no co-op · no dexterity/timing mechanics · no real-time world simulation · no live-service loops. [`GATE-2-review.md C3`, `gdd-structure-model.md §4 G1/G2/G8`]

**Litmus:** can an agent read a single pillar phrase and use it to reject a design idea? If it requires a paragraph to apply, rewrite it as a phrase. The phrase "strategy over dexterity" rejects every timed input in one word. [`gdd-structure-model.md §2`]

**What MUST NOT bloat P2:** exposition on why each pillar matters, examples, history. Trust the reader. If a pillar needs explaining on the pitch page, it is not sharp enough.

---

### P3. Player Role + World Hook (T1 — two short paragraphs; Myst structural borrow)

**What earns its place:** player agency before world lore. The Myst proposal opens on "acts as both detective and judge" before naming a single location; our GDD follows the same sequence because it earns reader buy-in faster than spec-first. [`myst-techniques.md 4.3`, `proposal-page1.md`]

Paragraph 1 — player role: who the player is and what they are doing (the mage starting life, the cover verb set, the search for an essence across reincarnations). This is the stated-goal / genre alibi made explicit: the surface is a cozy life-sim in a magical town. [`concept-dig-notes.md Session 4`]

Paragraph 2 — world hook, myth-form: a single short origin in character-action terms ("it began as X, someone did Y, the consequence was Z"). Density target: proposal-page2's "it began as simple greed" compression. [`proposal-page2.md`] No lore dump; no history flag. History is always "depth, not required knowledge." [`proposal-page1.md`]

**What to omit on the pitch:** age/location enumeration, time-architecture detail (festival week / year-loop), save-slot system, the superposition rule, NPC roster. These are Build GDD material. The world hook is motif-only, one-line area themes at most if areas are named at all. [`myst-techniques.md 4.6`, `proposal-page1.md`]

**Litmus:** does the world hook make the player role *more* legible, or does it replace it? Any world prose that doesn't sharpen "what the player does" gets cut or moved to the Build GDD.

**Watch-out — Myst over-promise:** do not echo "completely nonlinear" or "solve the crime." Our world is pull-open (no directed path, no external crime); precision here protects credibility. [`myst-techniques.md 5.5, 5.6`]

---

### P4. Core Loop (T2 — named loops, no undecided sub-verbs)

**What earns its place:** the four action families (Collect · Make · Show/Ask · Use) + the three loop tiers (moment / festival-week run / year-cycle meta). Each named, each a phrase. No parameters where decisions are open. [`GDD-template-draft.md §4`, `concept-dig-notes.md Session 8`]

The run-end: the festival week (diegetic, festive, non-violent). [`concept-dig-notes.md Session 5`]

Pack-triage as the pacing valve: what is worth carrying — the whole theme in miniature. [`concept-dig-notes.md Session 6`]

That is the full core loop. Any additional mechanic named here is a wish, not a spec.

**Litmus:** is every named element decided and buildable? Undecided sub-verbs (the full crafting recipe table, the specific spell list, the exact interaction matrix) stay in §12 Unresolved of the Build GDD and are referenced as open questions here at most.

**What MUST NOT bloat P4:** the H5 verb table, the H8 interaction matrix, the full crafting recipe spec, the exact magic-word system, the NPC dialogue mechanics. These are Build GDD T3 content. On the pitch, the four families and loop tiers are enough — a reviewer can state what the player does from that.

---

### P5. Agentic AI — "One Agent, One Wow" (T2 — named agents with a single-line I/O sketch each)

**What earns its place:** this section is graded on agent role clarity — every agent must be named and its output format described. The class example is concrete: "content agent generates NPC dialogue lines in JSON format: speaker_id, tone from a fixed list of 5, max 40 words." [`transcript`] That altitude is the target. At Pitch scale, one-line per agent + the wow beat.

The two-mode architecture (canned + live) is a locked decision and belongs here as context. [`GDD-template-draft.md §12 Resolved`, `concept-dig-notes.md Session 9`] The "wow" for the pitch: the game remembers every life you have lived — something you recorded runs ago returns, re-contextualized. [`concept-dig-notes.md Session 2`]

Agent role clarity at Pitch altitude means: name the agent, state the one thing it produces (its output), and state when it is called. ~5 agents + an orchestrator/manager is the class-calibrated scope. [`transcript`, `RESYNTHESIS-PLAN.md §2`] The pitch does not spec the full JSON schema or the token budget; those are Build GDD T3.

**Litmus:** can a reader state what each agent does after reading one line? If yes, the section earns its place. Token budget, API limits, and the full dev-crew roster spec go to the Build GDD.

**What MUST NOT bloat P5:** the H13 token budget table, H12 API limits and human gates, the full I/O contract schemas, the two-mode architecture deep spec, content-budget math. Those are Build GDD content. Named open questions (token budget, API limit caps) may appear as a single line pointing to the Build GDD.

---

### P6. Art Direction (T1 — reference-based; tone words + inspirations, no open calls)

**What earns its place:** tone words + two or three named concept references, the sonic identity line, and the 2D-vs-3D status (named open question, one line). At pitch altitude, the visual identity is stated as a feeling supported by references, not an asset list. [`gdd-structure-model.md §2`, `One-Page GDD description`]

The going-big stance earns one sentence: permitted swells at narrative/reward payoffs plus sprinkled wonder moments; can be large-scale or intimate zoom. [`GATE-2-review.md D1a`] Poles (OW revelation / Ghibli awe / Frieren restraint) left open to experiment. [`GATE-2-review.md D1b`]

**What MUST NOT bloat P6:** the full art-direction brief, cohesion-from-a-system detail (H17 depth), the going-big pole experiments (those are a Round B deliverable, not pitch content), color grammar, the visual style-sheet. All of that lives in the Build GDD.

**Litmus:** can a collaborator start building a moodboard from this section alone? If yes, it has done its job. If it requires more prose to be actionable, the prose is actually for the Build GDD.

---

### P7. Milestones + Open Questions Ledger (T1 + ledger format — one line each)

**What earns its place:** anchor dates (7/21 draft · 8/25 capstone) from the syllabus, one line each. [`GDD-template-draft.md §11`] Then a short ledger: Open questions named precisely (not gestured at), Resolved decisions listed with pointers. The ledger *is* the "don't document the undecided" rule made physical — honest about what is known and what is not. [`gdd-structure-model.md §3`, `Detailed GDD template description`]

On the Pitch GDD, the Open ledger is brief — three to five named gaps at most (slice math, token budget, 2D vs 3D, which endings ship). The Resolved section lists the concept lock, the pillar set, the slice contract, the two-mode architecture, the festival run-end, the persistence spectrum. [`GDD-template-draft.md §12 Resolved`]

**Litmus:** is every "open" entry phrased as a question with a specific shape? "Slice math: how many NPCs × years × day-slots fit in six weeks?" Yes. "More details TBD." Never.

---

## What gets cut from the current 12-section model on the Pitch page

The current `gdd-structure-model.md` is a sound Build GDD skeleton. The Pitch GDD is a different document at a different altitude. The following sections do not appear on the Pitch page, or appear only as named pointers:

| Removed / Parked | Why | Where it goes |
|---|---|---|
| §6a Slice World / "the Age" (functional paragraph) | Motif-only area theming is enough on the pitch; the full paragraph is Build altitude | Build GDD §6a |
| §8 Audio-First Pipeline (USP, T3) | The USP concept earns one sentence in P2 (Non-Goals inverse) or P5; the full contract spec is T3 and belongs in the Build GDD | Build GDD §8 |
| §9 Project Conventions (mirrored-tree rule) | An implementation convention — never pitch content | Build GDD §9 |
| §10 Platform/Engine/Scope (slice math) | Engine = one line (Unreal, locked), slice contract = one line, slice math = named open question; the rest is Build GDD | Build GDD §10, §12 |
| §12 Unresolved Questions (full ledger) | Compressed to three to five entries on the Pitch; the full ledger with all 18 holes lives in the Build GDD | Build GDD §12 |
| H10 narrative pipeline / H11 dev-crew schemas | P5 covers agent role clarity at pitch altitude; full I/O contracts, roster schemas, and the story-agent spec are Build GDD T3 | Build GDD §5 |
| H13 token budget / H14 scope math table | Named open questions at most; no numbers until estimated in Phase 3 | Build GDD §10/§12 |
| H15 audio-tag contract | The USP exists; the contract itself is T3 and belongs in the Build GDD | Build GDD §8 |
| H16 notebook/rumor-graph UI spec | Mentioned by name in P4 (the log, the personality cards); the UI spec lives in the Build GDD | Build GDD §4/§5 |
| H17 full art-direction brief | P6 covers tone + references at pitch altitude; the brief is Build altitude | Build GDD §7 |
| The five-field puzzle template | A per-puzzle spec format; belongs in pnc-grammar and Build GDD §4 | Build GDD + pnc-grammar |
| The discovery-arc player-experience walkthrough | A scene-design artifact; one short paragraph at most in P3 or P4 if it sharpens player role legibility; the full walkthrough is out of Pitch scope | Build GDD §4/§6a |

---

## The Parking-Lot doc (named here for completeness)

The Parking-Lot doc is the third document in the two-doc model: a living scratchpad for every idea that does not make the slice. The rule is **never delete, move and review later.** [`transcript`, `RESYNTHESIS-PLAN.md §2`] It is not a GDD section; it does not appear in either document's section list. It is the pressure valve that makes cut discipline possible without destroying creative material. The `§12 Unresolved Questions` ledger in the Build GDD feeds it; anything cut from the Pitch that is not yet Build altitude goes here.

---

## What MUST NOT bloat the pitch — the cut principles

These apply across every section; flagged here because they are the most common over-specification temptations for this particular game.

**1. World systems at simulation depth.** The nested-clock time architecture (day / festival-week run / year-cycle / timeline), the superposition rule, the phase-change ruling — these are system explanations. The Pitch states the emotional shape in one line ("runs end; the festival is the deadline; you always leave with something") and points to the Build GDD for the mechanics. [`concept-dig-notes.md Sessions 5–7`, `gdd-structure-model.md §4 G2/G3`]

**2. NPC roster and personality specs.** H1 and H2 are Roc-supplied content holes — they are not synthesized and cannot be pitched until Roc fills them in Phase 3. The Pitch notes that the game features NPCs with distinct personalities and essence-signatures; it does not name them. [`_index.md §2 H1/H2`, `GATE-2-review.md`]

**3. Magic / spell system detail.** H6 is "concept level" at best for the 7/21 draft. One sentence: "Folk spells are collectibles learned through world interaction; the spell recipe (components + magic word) is knowledge-based and wipe-surviving." The spell list, the word system, the crafting grammar — Build GDD. [`concept-dig-notes.md Session 6`]

**4. Agent I/O schemas at JSON depth.** The pitch names agents and their outputs in one line each. The full JSON schema, field constraints, and token budgets are T3 content for the Build GDD. The Burdick example ("speaker_id, tone from a fixed list of 5, max 40 words") is the Build GDD altitude for §5; on the Pitch it compresses to "NPC dialogue agent: outputs dialogue lines per scene, JSON format, tone-constrained." [`transcript`]

**5. Anything that requires Phase-3 hole-filling to write accurately.** H1/H3/H13/H14/H15/H18 are all Phase-3 work. On the Pitch, they appear only as named open questions in the ledger — never as stubs that pretend to be specs. [`_index.md §2`, `gdd-structure-model.md §3`]

**6. Doc-length as signal of effort.** The 7/21 assignment is a rough first draft. A 1-page pitch that passes the "what does the player do?" litmus outperforms a 3-page pitch that requires three readings to answer it. [`transcript §2 locked inputs`] The Pitch is not the place to prove depth; the Build GDD and Assignment 2 are.

---

## Altitude summary — Pitch GDD

| Section | Pitch tier | Length target | Litmus |
|---|---|---|---|
| P1 Elevator Pitch | T1 | 1 sentence | Reader states player verb + payoff from this sentence alone |
| P2 Pillars + Non-Goals | T1 | ~8 pillar phrases + ~4 non-goals | Each pillar rejects a design idea without explanation |
| P3 Player Role + World Hook | T1 | 2 paragraphs | Player role is clearer after reading; world is motif-only |
| P4 Core Loop | T2 | ~5 named elements | Reader can state what the player does at each loop tier |
| P5 Agentic AI — One Agent, One Wow | T2 | 1 line per agent + wow beat | Each agent named with a one-line output description |
| P6 Art Direction | T1 | 2–3 tone words + refs + 1 open question | Moodboard-buildable from this section alone |
| P7 Milestones + Open Ledger | T1 + ledger | Dates + 3–5 open questions + resolved list | Every open question is a precise question; no gestured gaps |

**Total page target: 1 page (ideal) · 2 pages (acceptable) · 3 pages (hard ceiling).** [`transcript`, `RESYNTHESIS-PLAN.md §2`] If the document exceeds 3 pages, the overage is Build GDD content that leaked in — apply the cut list above.

---

## Thin-source flags

- **P5 agent roster:** H11 is the thinnest required section in the KB. [`_index.md §3 signal 4`] The class grading requires agent role clarity, but the actual roster must be designed largely from scratch in Phase 3. On the Pitch, name the agents you are confident exist (the orchestrator/manager, at least one content agent); leave the full roster as a named open question pointing to the Build GDD. Do not fake specificity.
- **P7 open ledger — slice math:** the rooms-based Session 2 math is obsolete under the calendar model; the correct derivation (locations × days × NPCs × years) is a Phase-3 task. Name it precisely as open; never guess a number. [`concept-dig-notes.md Session 9`, `GDD-template-draft.md §12 Open`]
- **P6 2D vs 3D:** H17 is strong on craft but the dimensionality call is Roc's, still open. [`_index.md §2 H17`] One line: "2D vs 3D: open — decision at Phase 3; both poles grounded in KB." Do not imply a decision.
