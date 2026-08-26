# The Register

All player-facing text is Frieren-flat, and this is a production rule, not a mood board. The in-fiction voice authority is `../knowledge-base/synthesis/voice-style-guide.md`; the rules below are the production contract the Content Agent's lines obey and the Verifier's voice check (`guardrails.md`, item 6) enforces.

**Scope: player-facing text only.** How the *cards themselves* are written is a separate contract — the card-prose register in [`templates/persona-card-schema.md`](templates/persona-card-schema.md). It matters because the card rides into every Content Agent call, so the card's own prose is the ambient style for everything generated against it.

> **Provenance (audited 2026-08-06; full audit narrative in [`register-audit.md`](register-audit.md)).** What still binds: the `eNN.md` episode files are authoritative for **technique and structure, never for line length or turn count**; [`../knowledge-base/frieren-primary/frieren-dialogue-jp.md`](../knowledge-base/frieren-primary/frieren-dialogue-jp.md) is the cadence authority and is itself unreliable in places — the audit file lists which of its claims are verified and which are wrong, and the caption artifacts in `e07.md` that must not be re-imported.

**Numbers, measured.** Superseded the same day by a better corpus: [`../knowledge-base/dialogue-corpus/`](../knowledge-base/dialogue-corpus/README.md) — 4,735 turns across Frieren (2 eps), Violet Evergarden (14 eps) and two Ghibli films, human-transcribed with named speakers and aligned JP/English. The earlier figures came from un-diarized ASR and undercounted long turns by about 6×, because its segment caps could not represent one.

| | value | source |
|---|---|---|
| Median turn | **5–7 English words** | 3 works agree (7 / 6 / 5) |
| Most turns | under ~15 words; p90 ≈ 14–25 | corpus |
| A "long run" begins at | **~26 words** | corpus |
| Long runs >40 words | **~6 per part** (3.4–3.7% of turns; Ghibli 0.5%) | corpus |
| Long runs >75 words | **~1 per part** (0.6%) | corpus |
| Longest attested genuine turn | **174 words** | corpus |
| **Action note : dialogue turn** | **1 : 2.6 (Ghibli) — 1 : 4.3 (VE) — 1 : 5.5 (Frieren)** | corpus |
| Typical gap between turns | 0.83–0.98s — fast, near-latching | diarized ASR (only source) |
| Turn boundaries that overlap | 7–10% | diarized ASR (only source) |
| Conversion | **1 English word ≈ 2.0 JP characters** | measured, 1.94 / 2.00 / 2.11 |

**Short dialogue and dense description are one position, not two.** Ghibli is the tersest of the three — median 5 words, only 2% of turns over 26 — and carries **one visual beat for every 2.6 lines of dialogue**, against 1:4.3 and 1:5.5 in the two series. It does not write shorter scenes; it moves the load onto the picture.

**Target roughly one `action` or `object` slot per three to five dialogue slots.** v01 sits far below that — nearly all its non-player slots are `dialogue` — which is Ghibli-length lines with nowhere for the silence to live. That is a slot-typing problem, not a prose problem, and no amount of rewriting lines will fix it.

### Presentation conventions — small, and they drift every single time

These are review-render rules, not content rules. They keep a batch legible and they are the first thing to diverge when several writers work in parallel.

- **A `dialogue` or `player_line` slot's text is written in quotation marks.** A non-dialogue slot is not, and carries its `[action]` prefix instead. (One file of four broke this at the 2026-08-07 gate — Roc named it the biggest mechanical flag of the pass.)
- **`[action]` appears once**, not stacked with a bracketed label.
- **A word count never goes inside the text cell** — a parenthetical inside `text` ships with the content. A separate count column is **optional** (relaxed 2026-08-09 — Roc): useful while drafting to a ceiling, not required, and its absence is not drift. `toby-the-shelf-C1.md` predates this and keeps its inline counts; it is not being rewritten.
- **Variant suffixes follow the thread doc's own scheme.** Do not invent one (`GP-114`).

Every one of these has drifted at least once, and none is a judgement call — cheap to fix, easy to miss.

### The offer stands alone (Roc, at the C1–C4 gate, 2026-08-07)

**An anticipation names the thing and stops. Do not append the reason.** Roc cut the justifying clause on sight at the gate, three times, keeping the offer every time:

| Written | Kept |
|---|---|
| "Come on by before noon if you can make it! Your name reads better on the cart list in your own hand." | **"Come on by before noon if you can make it!"** |
| "Sunday, maybe. The ovens are down Sunday." | **"Sunday, maybe."** |
| "Her boy eats like a horse now. She'll run out again by Thursday." | *(cut entirely)* |

The second clause is **the writer explaining, not the soul speaking.** A soul who supplies people without mentioning it does not then justify the supply — it hands the player a reading they should have made themselves.

**Test:** cut the clause after the comma or full stop. If the line still lands, it was explanation.

**A quiet scene goes further toward description than the average.** At the same gate Roc replaced two dialogue slots in the quiet beat with a single action beat — *"Toby stands at the counter and looks at the door"* — pushing that scene past the 1:2.2 ratio its designer set. The corpus averages are floors for ordinary scenes; where the scene's job **is** the silence, more of it belongs in the picture.

### Five moves, harvested from Roc's hand pass on **Toby** (2026-08-08)

Roc rewrote 26 generated lines by hand across `toby-the-shelf-C2.md` and `-C4.md`. Every pair below is generated-line → Roc's replacement, and they group into five repeatable moves. They are here because a positive instance steers where a prohibition does not: this pipeline measured that banning six constructions by name produced fourteen (`pipeline.md`, step 8).

> **Take the move. Do not take the words.** *(Added 2026-08-08, the same day, after a Mara test run came back sounding like Toby.)*
>
> Every pair below is **one soul's mouth** — a fast, outward-pointing baker who supplies people. They are in this world-level file because the five *moves* are world-level. The vocabulary is not. A Mara generation borrowed "Let's see" straight from Toby's column and the whole scene tilted toward him; that is voice collapse, and it is the failure this pipeline is most exposed to.
>
> **So: read the left column as the shape you will produce by default, and the right column as proof that a better line exists — then find your soul's version of it in the card you were given, not here.** Ask what *this* soul does at this moment, given their want and their tell. Mara does not say "Let's see"; she goes quiet and touches the object. Bex does not soften; he names the thing and returns to work. If your line could be moved to another soul unchanged, it came from this page instead of from the card, and it is wrong.
>
> Each card carries its own "sounds like" line for exactly this reason. That is your exemplar. This is the grammar.

**1. Cut the second clause.** Seven of the 26. The generator states the thing, then explains why it matters. Roc kept the statement every time.

| Generated | Roc's (Toby) |
|---|---|
| "They do. The cellar's cool and the seals hold." | **"They do."** |
| "Read me the top one. It'll be down before you've finished the name." | **"Read me the top one."** |
| "Take two. You'll be out past the drum band and there's nothing open after." | **"Take two. You'll be out past the drum band."** |
| "Stand in under the canvas if you're stopping. The crowd cuts that corner close." | **"Stand in under the canvas if you're stopping."** |
| "Cheap after dark, that sort. The dents won't show under the festival lamps." | **"Cheap after dark, that sort."** |
| "You're quicker at it. Leave me the bottom row. The big tins sink." | **"You're quicker at it. Leave me the bottom row."** |

This is the offer-stands-alone rule above, and these lines predate it — but the rate says the shape is the generator's default, not an accident. The trailing clause is always *the writer making sure the reader got it*.

**2. Say the plain word.** Check 9 exists and did not catch these.

| Generated | Roc's (Toby) |
|---|---|
| "Flats first." | **"Flat breads first."** |
| "Those two weren't on the paper." | **"Those two weren't on the order."** |

**3. Let people sound like people.** The generated lines carry no discourse markers at all — every one is a clean declarative. Roc put the uptake back. **This is the missing rule**, and it is what the "conversational rhythm is not only line length" note above is pointing at.

| Generated | Roc's (Toby) |
|---|---|
| "Paper says four." | **"Yup, order says four."** |
| "Rolls on top so they don't press. Your fold is neater than mine." | **"Rolls on top so they don't press. Look at that! Your fold is neater than mine."** |
| "She left a jar on my step in spring. It's on the shelf still." | **"She's got a new baby. Plus, she left a jar on my step in spring. It's on the shelf still."** |
| "Come by before noon. Your name reads better on the cart list in your own hand." | **"Come on by before noon if you can make it!"** |

Toby's markers are *yup · look at that · plus · let's see · anyways*. **Do not reuse that list.** They fit a fast, outward-pointing man who answers before you finish; they are his, and lifting them is how a scene starts sounding like him.

The move is: **a person acknowledges before they answer, and the acknowledgement costs almost nothing.** What it sounds like comes from the soul. A slower soul might hum, or repeat the last word back, or simply act before speaking. A guarded one might start with the object rather than the question. A batch of clean declaratives reads as a transcript — but a batch where every soul acknowledges the same way reads as one writer, which is worse.

**4. Arranged prose is not speech.** The same finding the player-voice entry records ("the originals scan as arranged prose, the replacements scan as a person"), applied to souls.

| Generated | Roc's (Toby) |
|---|---|
| "Her boy does the fetching. Soft rolls ride on top for him." | **"Her boy likes the soft rolls. The ones on top are for him."** |
| "Papers to sort before the light goes." | **"Let's see, what's next…"** |
| "That's her done." | **"That's done."** |
| "Counter's clear. Anything you're short of, while you're standing here?" | **"All done. Anything I can get you, while you're still here?"** |
| "Whose order is that?" | **"Whose order is this?"** |
| "They were there all day." | **"Somebody's got to."** |
| "Oven was on anyway." | **"I had a few left over."** |

Inverted syntax ("soft rolls ride on top for him"), poetic time ("before the light goes"), and dialect affectation ("that's her done") all read as *written*. The test is whether you would say it out loud standing at a counter.

**5. A line that should be a look.** One edit replaced a spoken slot with an act, which is the ratio problem this document already names.

| Generated | Roc's (Toby) |
|---|---|
| "Nothing that's written down." | **`[action]` Toby pretends he didn't hear** |

**Walk-on confirmation.** C4's walk-on line went the other way — longer and warmer, exactly as the walk-on band predicts: *"I found a loaf on my step Tuesday morning, still warm, and I never ordered it. Lovely surprise…"* became *"…still warm, such lovely surprise! You're always so thoughtful, what would we do without you?"* The band is working; the generator was writing walk-ons at soul temperature.

**6. Say the care out loud when the care is already visible** *(ruled 2026-08-08 — Roc)*.

| Generated | Roc's (Toby) |
|---|---|
| "Marta, your eggs are down the side, away from the loaf's weight." | **"Marta, your eggs are down the side, I made sure they wouldn't get crushed."** |

This looks like it breaks the offer-stands-alone rule, and it does not. The rule bars the *justifying* clause — the reason the offer was worth making, which hands the player a reading they should have made themselves. It does not bar Toby saying what he did with his hands when the eggs are visibly down the side and the doing is already in the room. "I made sure" is not a justification; it is the same fact the player can see, said plainly, to a named person. **The test stays the one above: cut the clause and see whether the line still lands.** Here it does not — without it the line is a shelf position, not a person speaking to Marta.

*(Harvested from an uncommitted working-tree diff, 2026-08-08. Two typos in the source edits — "stilll", "Toby really know" — are normalized in the quotes above.)*

### How to write an action slot (measured, 1,384 notes)

- **About the same length as a line — median 9–11 words.** It is a beat, not a margin note. p90 is 21–24; past 40 it is doing too much.
- **Name the actor and the thing.** *"Frieren touches the chest." · "Hodgins places a box in Violet's hands." · "Sophie turns the door handle."* Concrete and physical, every time.
- **No interiority, ever.** The closest the corpus comes is *"Violet perks up at the mention of the word 'love'"* — an observable change, never a stated feeling. The same rule the souls obey: effect before definition, and no one narrates their own state.
- **Prefer hands to locomotion.** Ghibli's verbs are motion (`runs`, `walks`, `flies`); Violet Evergarden's are handling (`takes`, `holds`, `opens`, `places`). **Ours are handling** — a screen has no camera to follow a runner, and the verb families are `Collect`, `Make`, `Use`, `Converse`. Take Ghibli's density and Violet Evergarden's vocabulary.

### The grief shape, verified end to end

The heaviest beat in Frieren — Himmel's funeral — reads like this in the human transcript:

> **Frieren:** It's not like I knew anything about him. We only travelled together for a mere ten years.
> ***[Action: Frieren cries.]***
> **Frieren:** I knew human lives were short, but… why didn't I try to get to know him better?
> ***[Action: Heiter pats Frieren's head. Eisen pats her back.]***
> **Frieren:** Don't pat my head…

Three turns of **19 / 15 / 4 words**, divided by action beats. Her longest line in the scene is 19 words. The 24.5-second silence the ASR recorded between the first two turns **is** *"Frieren cries."*

**So: dialogue fragment → action slot → shorter fragment → action slot → shortest fragment.** The action slots *are* the pauses. This is the pattern for any beat carrying weight, and it is unwritable in a scene whose slots are all `dialogue`.

**Per-soul line-length bands are unevidenced either way.** The transcripts' speaker labels are unusable (24–33 clusters for a six-person cast), so the audit is *silent* on whether souls differ in natural length — it neither supports nor refutes the card-declared band below. Treat the band as a design choice, not a corpus finding.

**Conversational rhythm is not only line length.** Sub-second uptake, occasional overlap, and a few turns per episode where one voice holds while everyone else waits. A scene of uniformly short, uniformly spaced turns is not this source's rhythm even when every individual line is the right length — which is the defect in v01's dialogue that line-length rules alone will not fix.

**The transcripts are missing the picture, and that is where the silence goes (Roc, 2026-08-06).** A transcript records speech and nothing else, so the 24-second silence at the heaviest beat in EP.1 reads as an empty gap. On screen it is not empty — it is held on faces, on hands, on the room. **In this game that time is filled by `action` and `object` slots**, which is what those slot types are for and why the seed rule insists an act the soul performs and does not mention cannot be carried by a spoken line.

So the practical rule: **where the source's answer to a heavy beat is silence, ours is description.** A grief beat is short fragments plus an `action` slot doing the work the camera would do — never a run-on, and never an empty gap either. A scene whose slots are all `dialogue` has no way to be quiet (the v01 slot-typing problem named above).

- **One thought per turn.** A turn may run two clauses when the second is the payload. The 40-word dialogue ceiling is a cap, not a quota; most lines run far under it. Weight lands on a short trailing clause, one beat after the line looked finished (`frieren-dialogue-jp.md` A2/A3; e01.md). *(Amended 2026-08-06: this read "one clause per line where possible." One clause was the caption box; one thought, with the weight on the trailing clause, is the voice — confirmed against the diarized source.)*
- **At most one long run per scene, and it carries information, not grief.** Ceiling **75 words / 6 clauses**, against the one-thought-per-turn default — a wall above the longest attested genuine run, not a target. *(Corrected 2026-08-08: this read ~60 while `guardrails.md` check 8 passed to 75; 75 is the live number.)* Observed rate in the source is 0.4–0.7 per scene, clustered rather than spread: exposition scenes get one, banter scenes get none. **What licenses it, in observed order of frequency:**
  1. **Exposition an explainer with standing is delivering** — history, mechanics, a briefing. ~55–60% of all long turns.
  2. **Instruction** — teaching a skill to someone in the scene. ~15%.
  3. **Confession** — a soul catching up to a feeling. ~20%, and in the source it arrives as an **answer to a question**, never spontaneously.
  4. **A card declaring run-on as its standing register.** A design licence, not a corpus finding.

  **A long run is fenced by a pause on entry — 2–3× the ambient gap — and runs *tight* inside.** It does not slow down; its internal gaps are shorter than the conversational median.

- **Grief takes the opposite shape: fragments separated by long silence.** The source's heaviest beat is short pieces divided by pauses 8–30× the ambient gap. **Never write a grief beat as a run-on.** The short-cadence rule below is exactly right for it, and the gap is what carries it.

> **Corrected 2026-08-06** — the earlier rupture-beat licence rested on an ASR artifact; full record in [`register-audit.md`](register-audit.md). What binds: the verified long-run exemplar is **EP.14 09:35–10:01, Heiter's confession — an answer to a question. Cite this, not EP.1.** Also recorded there: the demons'-run-ons-as-faction-device claim (`frieren-dialogue-jp.md` A5) is unsupported on length.
- Deflect, do not name. Grief, love, and awe arrive as logistics, a joke, or mild curiosity. A line may confirm a fact plainly. It never confirms a feeling (e02.md).
- Weight is preloaded, not performed. A payoff that was planted properly needs almost nothing; one word can carry it, and amplification destroys it (e14.md). Payoff lines get the tightest word ceiling in the game.
- Register locks per scene. One tone from the enum per scene, switching only at scene boundaries. The heaviest line uses the same short cadence as the jokes around it; the gap carries the weight (e04.md; e11.md). A verbose line tagged quiet is a defect (e14.md). A sanctioned long run carries information, is tagged accordingly, and is never tagged quiet. *(Briefly weakened 2026-08-06 on the EP.1 exemplar; withdrawn the same day — [`register-audit.md`](register-audit.md).)*
- Character shows as repeated behavior and third-party notice. No soul ever states its own trait (e04.md). Effect shows before definition: the player witnesses the behavior before anyone explains it, and the explainer has standing to explain (e07.md).
- Cut before adding. "I will try" beats the longer version; what a soul is exact about, and vague about, does the characterization for free (writing-nothing-unsaid-words.md).
- Words are scarce on purpose. The gaps the player's imagination fills are chosen, and the same scene carries different weight depending on the bond the player brings to it: one authored scene, several meanings across timelines (harvesting-interactive-fiction.md). Withhold significance, never orientation: the player always knows why they are here, just not yet what it weighs (harvesting-interactive-fiction.md).

- **Warmth and length vary per soul, by the card (loosened 2026-07-29 — Roc).** Within them, each card may set its soul's natural line-length band and its **warmth temperature**, so the cast varies in how much it says and how warm it runs — variety among souls, not sameness. Two guards survive the loosening — a soul's warmth never drifts from its card, and cold by accident is still a defect — and both are the Verifier's: they are stated once, as the warmth-fidelity item of [`guardrails.md`](guardrails.md) check 6. The declared band and temperature live in the card's `voice_enforcement` field, not `voice_register` (since 2026-08-08 — `templates/persona-card-schema.md`). What belongs here is the craft behind them: deflection is not coldness. A soul deflecting care is still warm toward the person offering it, and that is the whole difficulty of the line.

**The world default ceiling loosens (ruled 2026-08-23 — Roc; validated 2026-08-25 against local-model output). Supersedes the 2026-07-29 line above — not stacked on it.** NPC `dialogue` ceiling: was a flat 40 words, now **median 20–50 words, 75-word ceiling** on an ordinary line — long enough to actually describe something, short enough to still be one breath. `action`/`object` (60) and `player_line` (12) are unchanged; this retune only tested NPC dialogue. **One thought per turn** stays the baseline *(was "one-clause"; amended 2026-08-06)*. A card may still license a longer uncapped run for a specific behavior — Mara's provenance license (`cast/mara.md`) is the first instance, and fits the existing long-run licensing above rather than needing a new mechanism. Validated across six local models on the retuned Mara card — full detail in `pipeline-runs/2026-08-17-register-loosening/2026-08-24-local-model-findings.md` and `assignments/assignment-8-icm/_kobold-tests/round2-findings.md`.

## The walk-on band (added 2026-08-06)

A walk-on has **no card** — `pipeline.md` step 2: no essence, no arc, no bond, existing to carry the business of one scene. So nothing sets its length or its warmth, and it falls through to the world dialect, which is the tightest register in the game. That is how a villager ends up sounding like the guarded protagonist. Found by Roc 2026-08-06, on a line that read *"Loaf on my step Tuesday morning. I never ordered it."* where it should have read *"I found a loaf on my step Tuesday morning. Was such a pleasant surprise!"*

**Walk-ons run longer, warmer and less guarded than the deep souls.** Specifically:

- **Deflect-not-name does not apply to them.** A walk-on may say plainly that they were pleased, worried or grateful. The rule exists because a deep soul's unsaid feeling is the thing the player is meant to work out — a walk-on has nothing to work out, so withholding reads as evasiveness they have no reason for.
- **They may explain themselves,** and often should. A soul deflects to the task; a walk-on tells you why they came.
- **Length runs to the upper band** — comfortably 15–30 words where a deep soul sits at 5–7. They are not economical, because economy is characterisation and they have no character to serve.
- **They still obey the ceilings, the plain-language rule and the no-jargon rule.** Looser is not licence.

**This is characterisation working for free.** Toby's terseness only reads *as* terseness when the people around him are not terse. A village where everyone is clipped and deflecting has no protagonist — it has a house style.

Where a walk-on's own manner matters to a scene, it is recorded in the codex `walk_on` entry (`pipeline.md` step 2), which may narrow the band for that one functionary. Absent an entry, the band above is the default.

## The player voice (ratified 2026-07-28; rewritten plain 2026-07-29)

The player speaks. Every spoken choice option is a `player_line`: the words themselves, picked the way The Intercept does it (inkle's The Intercept, in the branching-dialogue resource set, is the model). An unspoken option shows a bracketed deed instead. `templates/choice-node-schema.md` holds that split.

The voice blends Roc's with Frieren's, inside the shared world dialect. **This entry is the written definition of the blend.** There is no separate Roc-voice document. Roc's half is the economy and plainness below. Frieren's half is the corpus: `../knowledge-base/frieren-primary/e01.md`, `e14.md`, `frieren-dialogue-jp.md`.

> World dialect holds: one thought per turn, plain, deflect not name. The player's signature is curiosity, and it comes out **as someone actually speaking** — not as a composed line. Exact about what-is: names, counts, durations ("For about a week"). Vague about what-it-means: significance and attachment go unsaid, or land one beat late, behind something small.

> **Amended 2026-08-07 (Roc, at the C1–C4 gate).** This read "economy plus curiosity — the shortest exact words," and it was producing **writerly** player lines: parallel clauses, telegraphic, arranged. Roc replaced two of them at the gate and both replacements are longer and better:
>
> | Written | Roc's |
> |---|---|
> | "Same jars. Not one of them opened yet." | **"Your jar collection is growing."** |
> | "I didn't come for bread. I just came." | **"Just came by to see how you're doing."** |
>
> The originals scan as arranged prose. The replacements scan as a person. **Shortest is not the target — natural is**, inside the ceiling. Note the second one also *does* explain why the player came, which the old "never explains its own feeling" clause forbade; it is warmer and less guarded than the rule allowed, and it is right. The player is not a soul with something to hide. **Wryness is licensed** — "your jar collection is growing" is a joke about a thing, which is curiosity with a person behind it.

- **Ceiling: 12 words.** Count whitespace-separated tokens; a hyphenated compound is one word. An option must scan at a glance.
- **Precision asymmetry: fact versus meaning.** Exact about what-is, vague about what-it-means. Deliberately distinct from the two soul asymmetries in use — Toby's self-versus-other, Ilsa's long-span-versus-recent. The house-style ruling in `templates/persona-card-schema.md` (`trait_axes`) stands.
- **Warmth is invariant here too.** Flat is not cold. A clipped, dismissive, or sarcastic player_line is a defect even at 5 words.
- **Primal seed:** *the world is worth exploring* ([`../knowledge-base/narrative/primal-world-beliefs-npc-lens.md`](../knowledge-base/narrative/primal-world-beliefs-npc-lens.md) — the Safe / Enticing / Alive axes). Enticing runs high. Safe carries the *not-Regenerative* shade: loss is permanent — impermanence, not threat. **Alive starts low and moves:** each life adds evidence, and the belief shifts while the voice stays flat. The moving belief lives in world-state (`world_aliveness`, [`../gdd/06-world-and-progression.md`](../gdd/06-world-and-progression.md)), never in a line. No player_line announces the shift.
- The player carries the most complex palette, and no soul's palette exceeds it (voice-style-guide.md §7A.2 — "palette" is that guide's word for expressive range). The human enforces this at the card gate, where §7A.2 has always been enforced.

## The reconciliation rule (makes the constraint checkable at every payoff)

When a moment has earned amplification, the swell is visual or sonic, frame, light, sound, scale, and the text and voice layer stays flat or silent at that exact beat (voice-style-guide.md). The review question is concrete: did the swell land in the picture, or did the words just get bigger?
