---
kind: resynthesis-staging
round: A
lens: L3 — narrative-first
artifact: gdd-structure-model (two-doc split, what-lives-where)
status: staged — awaiting GATE 2 morning review; do NOT promote to live until Roc reviews
grounded-in: 157-note KB + class transcript (Josh Burdick, session 02) + GATE-2-review.md
sources-cited-inline: yes
no-invention: all claimed material traces to a named KB note or locked decision; no NPCs, items, story, or spells invented
---

# Lens L3 — Narrative-First: Where Narrative Lives, and How the Two-Doc Split Protects It

## Core stance

This game's design engine is retrospective significance — the small ordinary detail that detonates
into meaning only when something else is later true [the-secret-to-frierens-worldbuilding,
e01, e02, e14, when-great-foreshadowing-goes-unnoticed]. That engine requires that the narrative
layer be **deep enough to pre-load weight before a payoff exists**. A Pitch GDD of one to three
pages cannot carry that depth without bloating the one thing the Pitch must do instantly: answer
"what does the player do?" [`class transcript` line 332–335: Josh Burdick, directly to a student
with a narrative-heavy game: "I would suggest having maybe two copies... your pitch version... and
then maybe you've got the more expansive version that has the full narrative woven in."]

The two-doc split is therefore not a concession to length limits. It is the correct architectural
move for a narrative-heavy game: **the Pitch stays a sharp edge; the Build doc carries the
weight** the narrative engine actually needs.

---

## 1. The Pitch GDD — what narrative MUST NOT do here

The Pitch GDD's job is to answer "what does the player do?" in the first two paragraphs — and
hold to one to three pages total. It should be transmissible to a reader who picks it up cold
[`proposal-page1`: "acts as both detective and judge" — player role before lore; `class transcript`
line 104: "it should be very direct... like, this is what the game is"].

Narrative in the Pitch exists in exactly one form: **the emotional premise in a single sentence.**
"A soul searching for its partner across reincarnations" is narrative. It is not a character
sketch, a scene description, an echo mechanic, or a delivery system [concept-dig-notes
Session 3 pitch card: "a cosmic hide-and-seek — you're a soul searching for your partner across
reincarnations, in a Ghibli-warm magical world"]. That sentence is load-bearing because it
orients everything that follows: the reader now knows *why* the player does what they do.

Everything else that narrative-first thinking wants — seed moments, NPC-characterization-by-behavior,
subtext, environmental echoes, the silhouette vignette, reincarnation layers — is not the Pitch's
problem. It belongs downstream.

**What narrative contributes to the Pitch (and only this):**

| Element | Pitch altitude | Why it survives the cut |
|---------|---------------|-------------------------|
| One-sentence emotional premise | T1 (one claim) | Player role demands it; without a *why*, "read scenes, deduce NPCs" is a dry mechanic |
| Tone words (two to three) | T1 (pitch-line) | Sets register; orients the collaborator; costs zero length |
| One inspiration line per reference | T1 (one line each) | Specificity: "Outer Wilds — knowledge-as-key, not items" is more useful than a paragraph [GDD-template-draft §3 Inspirations format] |

**What the Pitch explicitly does NOT carry:**

- Retrospective-significance technique descriptions [e01, e02, e14 — these inform the Build doc's narrative pipeline, not the Pitch]
- NPC-variance or characterization rules [GATE-2-review.md A1: Roc's concern about homogenization; this is a Build-doc and Phase-3 interview concern]
- Echo/reincarnation delivery mechanics [concept-dig-notes Session 7: emergent partner, silhouette vignette — slice design, not pitch]
- Environmental-storytelling technique (delta-storytelling, moved-object-as-power-dynamic) [myst-techniques Group 2 — scene-design altitude, not pitch altitude]
- Subtext and dialogue-voice rules [voice-style-guide §2–§9 — these are a Build-doc reference and runtime-agent contract]
- Parking-Lot material that almost made it [see §4 below]

---

## 2. The Build GDD — where narrative actually lives

The Build GDD is the document handed to the dev-crew and agents. It is expansive, honest about
its depth, and narrative-woven throughout — not as a separate "narrative section" but as the
register in which specifications are written and the rules that govern every section that
touches story.

Narrative lives in the Build GDD at three levels:

### Level 1 — The emotional spine, stated once and early (§6 World & Progression)

The origin myth for the world is written in myth-form [proposal-page2: "it began as simple greed"
density target — every backstory beat is a *character action*, not a floating historical fact].
This is short prose, T1 altitude, placed before the map structure. The myth encodes the game's
emotional *why* without requiring the reader to learn the mechanics first — the same move the
Myst proposal makes with its sons-and-betrayal paragraph, stripped of its directed-mystery
push-framing [myst-techniques 4.3, 5.5].

This is the **only place** in the Build GDD where narrative is foregrounded as narrative. Every
other section integrates it or it does not appear.

### Level 2 — Narrative woven into system descriptions

Every section that carries player-facing content is written in the voice the game uses.
Specifications are not written in a neutral third-person ("the NPC responds") but in the flat,
understated register the voice-style-guide mandates [voice-style-guide §1: "flat, plain, and
short... Characters speak in the wrong register for what they feel"].

Concretely:

- **§4 Core Loop:** describes the four families (Collect, Make, Show/Ask, Use) through the lens
  of *what the player is experiencing*, not just what they are doing. The life-verb framing
  ("forage, gather, gift, talk") is already narrative altitude — the Build doc names it and locks
  it [concept-dig-notes Session 8: "the four action families"].
- **§5 Agentic AI / Narrative Pipeline (H10):** the Build doc carries the actual spec of what the
  narrative agent generates, at what altitude, and under what voice contract. The voice-style-guide
  §9 checklist (the DO/DON'T list) is the agent's operating brief — it belongs here, linked or
  inlined. The playtest-retell test [integrating-narrative-portal: run a session, ask the player to
  narrate the story back, treat failure as a cut signal] is the pipeline gate, named here.
- **§6a Slice World:** written as one functional paragraph (motif-only, per proposal-page1's
  "age theming is one-line") but that paragraph is *authored in voice*, not in spec-prose. The
  difference: "a festival town at the edge of a healing world" vs. "the main map area contains
  a festival venue and surrounding areas." The first tells the reader what it feels like; the
  second tells them nothing [myst-techniques 4.6: gestural area descriptions, stated
  simplification as a deliberate choice].
- **§7 Art & Audio Direction:** tone words here are narrative-grounded — they point toward the
  emotional state the world induces, not surface aesthetics. "Warmth without sentimentality; a
  world that would go on living whether or not the player pursues it" [voice-style-guide §1] is
  richer direction than a palette reference alone.

### Level 3 — H9-specific narrative depth: the retrospective-significance engine

The Build GDD carries a dedicated H9 treatment because H9 is the strongest-covered hole in the
KB [_index.md §2: H9 "Best-covered hole — retrospective-significance, ambient-detail→payoff,
environmental storytelling, off-frame life, echoes-as-motif"] and because our core mechanic
*requires* this depth to function.

This treatment lives in §6 (World & Progression) or as a linked sub-section. It specifies:

**The seed-and-payoff contract** [the-secret-to-frierens-worldbuilding, e01, e02, e14]:
Deliberately break Chekhov's gun. Every seeded detail must function as honest world-texture even
if the payoff is never caught. The Build doc names the *method* without pre-filling the content
(Roc supplies content at Phase 3 via the interview pass).

**Delta-storytelling as the default environmental mode** [myst-techniques 2.1: Kadish/Ahnonay
cabin — same place, later year, readable as elapsed time without text]: the festival week
recurring across years *is* the delta engine. The Build doc declares this locked. Every
scene-design spec can then inherit it without re-explaining it.

**The moved-object-as-power-dynamic method** [myst-techniques 2.3: "a single repositioned or
absent object conveys a whole social/power relationship"]: highest story-per-asset ratio in the
KB. The Build doc names this as a scene-design instruction; individual object placement is Roc's
content call at Phase 3.

**Encounter structure over quest structure** [coherent-storytelling-open-world: self-contained
scenes that resolve against any arrival state]: every interactive location in the Build doc is
specified as an *encounter* that reads correctly whether the player arrives in year 1 or year 3.
The Build doc names the defensive-logic requirement ("every scene writes for any world-state at
arrival") and links to pnc-grammar for the implementation contract.

**The emotional context box** [generating-emotions-in-narrative: intro-middle-payoff, tell/show/do]:
partner-echo moments are structured as context boxes in the Build doc, not as free-form prose.
The Build doc templates the shape; Roc fills the content.

**Environmental narrative in spaces** [environmental-narrative-in-spaces: carry narrative through
space and affordance, not speech or signage]: the Build doc adopts this as a design constraint.
Text panels are the fallback, not the default. Object arrangement is the primary delivery channel.

**What the unsaid does** [writing-nothing-unsaid-words: omission increases emotional density;
tonal breaks expose hidden dialogue]: the voice-style-guide's DO/DON'T list (§9) formalizes this
as a checklist. The Build doc links to it and names it as the runtime-agent operating brief.

---

## 3. The cross-doc split: what lives where (master map)

This table is the single-sentence version of the above, formatted for the compare pass.

| Narrative element | Pitch GDD | Build GDD | Parking Lot |
|-------------------|-----------|-----------|-------------|
| One-sentence emotional premise | YES — §1 | Referenced | — |
| Tone words (2–3) | YES — §2 / §7 | Expanded in §7 | — |
| Inspiration table (one line each) | YES — §3 | — | — |
| Emotional premise as pillar language | YES — §2 | — | — |
| Origin myth (myth-form, T1 prose) | — | YES — §6 lead | — |
| Voice-style-guide (full DO/DON'T) | — | YES — §5/H10 | — |
| NPC-characterization rules | — | YES — §5/H2 | — |
| Delta-storytelling as default mode | — | YES — §6 | — |
| Seed-and-payoff contract | — | YES — §6 | — |
| Encounter-structure contract | — | YES — §6/H9 | — |
| Environmental storytelling techniques | — | YES — §6a scene-design rules | — |
| Emotional context-box template | — | YES — §6/H9 | — |
| Retrospective-significance payoff spec | — | YES — §6/H9 | — |
| NPC-variance / personality differentiation | — | YES — §5/H2 | — |
| Silhouette vignette delivery spec | — | YES — §6a | — |
| Per-NPC voice attribution | — | — | Phase 3 interview |
| Authored past-life story content | — | — | Phase 3 interview (H9) |
| Multi-life NPC storylines beyond the slice | — | — | Parking Lot |
| Full Reunion cutscene (UP-style) | — | — | Parking Lot |
| Narrative branching beyond canned paths | — | — | Parking Lot |
| Red-herring / decoy content layer | — | — | Parking Lot (myst-techniques 5.9) |
| Creature-as-partner option | — | — | Parking Lot (concept-dig-notes S7: roadmap-at-best) |
| Alone-path vignette variants | — | — | Parking Lot (concept-dig-notes S7: deferred) |
| Mid-year festival variants | — | — | Parking Lot (concept-dig-notes S7: deferred) |
| Full multi-strata historical layering per Age | — | — | Parking Lot (myst-techniques 2.2: slice = two-state only) |

---

## 4. The Parking-Lot doc: the role of the cut-ideas home

The class transcript names it directly and unambiguously [`class transcript` lines 167–170:
"I wouldn't delete it. I wouldn't get rid of the ideas. You want to at least keep them somewhere.
I would go put them at some place other than the GDD. That would be a separate document I would
hold on to. It'd be something I would review later."]. The RESYNTHESIS-PLAN.md §2 formalizes
it: "Parking-Lot doc for cut ideas (never delete — move and review later)."

For a narrative-heavy game, the Parking Lot is not a dumping ground. It is a discipline device.

**Why the Parking Lot is load-bearing for narrative:**

Narrative-first thinking generates ideas that are *correct in feel* but *out of scope for the
six-week slice*. A full reunion cutscene (UP-first-ten-minutes scale) is emotionally right for
the game [concept-dig-notes Session 3: "out of scope for the vertical slice"]. Three full strata
of historical layering per Age is excellent craft [myst-techniques 2.2: "powerful but
content-dense — skip full three-strata depth for the slice"]. Alone-path vignette variants
honor the game's non-attachment theme [concept-dig-notes Session 7: "non-attachment as its own
quiet path — slot-in later"]. These ideas belong somewhere; they do not belong in the Pitch or
the Build.

Without the Parking Lot, the pressure to "not lose the idea" bleeds narrative wishes back into
the Build GDD — which then bloats, and eventually collapses back into the Pitch for "balance."
The two-doc split fails the moment ideas have no safe home.

**The Parking Lot's operating rules (this lens's recommendation):**

1. **Narrative-Lot entries are dated and tagged.** Every entry carries the date it was cut and
   the reason (scope, Phase-3-interview-dependent, roadmap-candidate, out-of-voice-register).
   Reason is the review trigger — when the reason expires (scope lifts, Phase 3 begins,
   voice-guide is updated), the entry is reconsidered, not re-invented.
2. **The Parking Lot is not a trash bin.** Each entry is a full idea sentence, not a label.
   "Mid-year festival variants" without a sentence of what they would feel like is unrecoverable
   at review time. Keep enough to *rebuild the feeling* from the note.
3. **The Parking Lot has a review cadence.** At every gate (GATE 2, GATE B, the 7/21 review,
   the 8/25 capstone) the Lot is skimmed for anything that the current phase makes newly
   buildable. The `cut.list discipline` the transcript names [line 239: "cut the wishes, keep
   specs"] is the complement: everything cut goes here, and here is where it waits, not the void.
4. **Narrative wishes vs. narrative specs: the distinction.** A wish is "I want the game to feel
   like a Studio Ghibli film with a subtext of Daoist philosophy." A spec is "the origin myth is
   written in myth-form (who, what act, what consequence) at T1 prose altitude, placed before the
   map structure in §6" [RESYNTHESIS-PLAN.md §2: specificity > length; `class transcript` line
   239: "cut the wishes, keep specs"]. Wishes park; specs ship.

**Champion for the H9 material in the Parking Lot:**

The H9-adjacent ideas most likely to accumulate in the Lot:

- **Full reincarnation cycle stories** (authored past-life content per NPC beyond the slice
  candidate pool): the Build doc names the *method* (essence-signature, state-tree distribution
  [coherent-storytelling-open-world]); the actual content parks until Phase 3 interview.
- **Multi-life NPC storylines** (the NPCs who appear across more than one life with distinct
  authored arcs): the slice proves the reshuffle mechanic; the authored depth parks.
- **Full audible-leitmotif system** for the partner (Session 3's audible-essence proposal): the
  Build doc names the *shape* (leitmotif emerges from festival-mix as data accumulates,
  concept-dig-notes Session 7); the implementation parks until audio pipeline is specced (H15).
- **Alternative ending variants** beyond the slice contract's 1–2 endings: the Build doc carries
  the true-ending description (locked) and the slice's endings (1–2, decided at Phase 3); all
  other variants park [GDD-template-draft §12 Resolved: "1–2 endings ship; true ending deferred"].

---

## 5. The H9 champion case: why the Build doc needs the full depth

[_index.md §2, H9: "Best-covered hole. Retrospective-significance, ambient-detail→payoff,
environmental storytelling, off-frame life, echoes-as-motif — across all narrative + all 6 voice
notes + Myst-ages env-storytelling + Age images. Further deepened by dedicated env-storytelling /
subtext / emotion refs."]

H9 has more grounded craft material in the KB than any other hole. The Build GDD is the place to
deploy it. The argument for depth is not that the document should be long; it is that a narrative
pipeline that doesn't know what to generate toward will generate in the wrong direction — or
generate nothing distinguishable from a generic cozy fantasy game.

The voice-style-guide's emotional engine paragraph [§4, "weight is preloaded, not performed"] is
the Build doc's most critical reference. It explains *why* the voice is quiet and *what happens
if an agent violates it*. Without this in the Build doc, the narrative pipeline has no anchor
against the most natural failure mode of AI-generated text: amplifying emotional beats rather than
pre-loading them.

This is the specific depth the L3 lens is championing: the Build GDD must name the engine
explicitly, locate it in the game's mechanics (the festival week replaying across years is a
retrospective-significance machine by construction [voice-style-guide §4: "for our roguelike this
is a feature — the same festival week replayed across years and runs is the built-in reexperience
the technique needs"]), and name the failure modes the agent must avoid. That is narrative woven
into the Build doc: not world-building prose, but engine specification.

---

## 6. What this lens recommends for the compare pass

This lens's single strongest recommendation for the compare:

**The H9 section of the Build GDD is a narrative-pipeline spec, not a lore section.** It should
read like a contract the dev-crew and agents operate against — not a description of what the game
feels like. The Pitch handles feel in one sentence. The Build handles *how the system generates
the feel at the moment-by-moment and payoff levels*. Those are different documents with different
jobs, and the split makes both better.

The Parking Lot earns its place as a third doc precisely because it is what makes both the Pitch
and the Build clean: every "but what about..." that would otherwise creep into the Build as a wish
has a named home, with a review date, in a doc that is explicitly not shipped until Roc promotes
an entry.

---

## 7. Open tensions (named, not resolved — for the compare pass)

- **Pitch altitude for the emotional premise:** One sentence of emotional premise may feel
  insufficient to a reader who doesn't already know the concept. The Myst proposal's "acts as both
  detective and judge" is supported by the world description that immediately follows [proposal-page1].
  Our Pitch needs to earn the same buy-in with its equivalent. This is a writing task, not a
  structural one, but the risk is real: too sparse and the pitch reads as abstract; too rich and it
  grows past three pages.
  [Single-source caution: this tension is inferred from the proposal-page1 watch-outs and the
  class transcript's "anybody who picks it up can understand what type of game you're building"
  [line 101] — not from a single thin source, but worth naming for the compare.]
- **NPC-variance in the Build doc:** GATE-2-review.md (A1) records Roc's concern about NPC
  homogenization. The voice-style-guide §11 explicitly names "per-NPC voice attribution" as a
  Phase-3 gap (by design — un-diarized frieren-primary notes). The Build doc should name the
  NPC-variance requirement and leave the implementation for the Phase-3 interview ("probe me" —
  GATE-2-review.md B3), not attempt to spec it now. How much NPC-variance architecture to put in
  the Build doc without faking readiness is the genuine tension.
- **Interactive sequencing vs. seed-and-payoff:** The voice-style-guide §11 flags that every
  seeding technique assumes an order the player may break. The Build doc must address this — the
  pnc-grammar synthesis is the primary instrument [_index.md §5: "how to make each seed and each
  proof-then-definition beat order-independent, so significance still lands whichever year/room
  the player hits first"]. How explicitly the Build GDD states this constraint (vs. delegating it
  to pnc-grammar entirely) is unresolved here and flagged for the compare pass.
