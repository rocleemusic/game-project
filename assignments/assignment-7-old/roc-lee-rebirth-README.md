# Assignment 07 — Style Guide Agent

**A self-correcting Generator → Evaluator → Refiner loop that enforces the written style rules of my capstone game.**

The game is a cozy roguelite point-and-click adventure set in a hand-painted village. The player arrives with no memory of the people there, works out who they are from how they behave, and loses those bonds at the end of each life. The souls stay. The player's knowledge of them does not.

## Whats in this repo

| Path | What it is |
|---|---|
| `style-guide.md` | **The style guide.** Five constraint types, every rule extracted from the game's production documents |
| `pipeline/codex.json` | The canon register: 48 entries. Souls, relations, walk-ons, offstage people, world facts, promoted props |
| `pipeline/src/score.js` | The deduction table. Where SCORE comes from |
| `pipeline/src/evaluate.js` | The Evaluator. Three layers, cheapest first |
| `pipeline/src/generate.js` | The Generator, and the Refiner, which is the same seat handed the reason |
| `pipeline/src/breaker.js` | The circuit breaker. Decides when the loop stops on its own |
| `pipeline/slots/provocations.json` | The graded demo set. Three slots, three violation classes |
| `pipeline/slots/demo.json` | Three ordinary slots, as a clean control |
| `pipeline/fixtures/` | The recorded run. Replays the whole demo with no API key |
| `pipeline/runs/` | Run logs. Every attempt, score and reason |

---

## What I built

An automated loop that writes a line of NPC dialogue, checks it against my game's written style rules, and rewrites it from the reason it failed. No human touches the loop while it runs.

The style guide is not new. It already existed as production documents that a real content pipeline reads. What this assignment added is a **score derived from those rules**, a **canon register the evaluator can check lore against**, and **five slots engineered to break specific rules** so the loop has something real to catch.

### Five constraint types

The brief asks for three. The guide has five, because these are the five things that actually go wrong.

| Type | The rule | Layer that settles it |
|---|---|---|
| **Length** | dialogue 40 words, action/object 60, player_line 12. Median target 5 to 7 | deterministic |
| **Formatting** | No em-dashes. Quotation marks on dialogue only. `[action]` once | deterministic |
| **Tone and voice** | Warmth must arrive by this soul's own declared channel and no other's | model judgment |
| **Lore and invention** | No contradiction of a locked fact. Every invention declared, checked for duplication | model judgment |
| **Declaration integrity** | A declared examinable must actually get built, on the right screen | deterministic |

Full rules, with their sources and the dates they were ruled, in **`style-guide.md`**.

The numbers are measured, not chosen. The ceilings come from a corpus of 4,735 human-transcribed dialogue turns across Frieren, Violet Evergarden and two Ghibli films: median turn 5 to 7 English words, a long run begins around 26, and the longest attested genuine turn is 174.

---

## The Evaluator

Three layers, ordered by cost. Each runs only on what survived the one before it, so a line 20 words over its ceiling never reaches a model.

```js
export async function evaluate(slot, line, card) {
  const mech = evaluateMechanical(slot, line)          // free. length + formatting
  if (mech.verdict !== VERDICT.PASS) return mech

  const voice = await evaluateVoice(slot, line, card)  // one call. check 6
  if (voice.verdict !== VERDICT.PASS) return { ...voice, words: mech.words }

  const lore = await evaluateLore(slot, line)          // one call. checks 4 + 12
  return { ...lore, words: mech.words }
}
```

### Where SCORE comes from

**No model is ever asked for a number.** Each judgment layer names which rule broke and quotes the words at fault. The arithmetic happens in code.

That is a deliberate design constraint, not an implementation detail. My pipeline has a written refusal to score writing quality, in two places. `review.md`: *"No agent scores relatedness, resonance, or closeness. The checklist is questions Roc reads, not numbers the orchestrator computes."* And the checker's own contract: *"never ask whether a line feels right — judging resonance is measuring it."*

A game whose whole subject is bonds you cannot measure should not put a number on whether a line lands. So the evaluator scores the one thing it legitimately can: **distance from a written rule.**

```js
export const RULES = {
  'length.ceiling':           { cost: null, scales: true },  // 1 per word over, cap 4
  'format.em_dash':           { cost: 2 },
  'structure.slot_type':      { cost: 6 },
  'voice.channel':            { cost: 3 },
  'voice.channel_structural': { cost: 6 },
  'lore.contradiction':       { cost: 6 },
  'invention.duplicate':      { cost: 4 },
  'invention.mistyped':       { cost: 4 },
  'invention.undeclared':     { cost: 3 },
}
```

The weights are **recovery cost**, not severity by feel. A 6 means re-wording cannot fix it and the loop has to exit to a human. A 2 means a regex found it and a regex could describe the fix. Length is the one rule with a real distance, so it is the one deduction that scales.

That scaling is what makes the grade continuous rather than a pass/fail test wearing a number. Real output, no API key needed:

```
SCORE 10/10 | PASS            | No rule in the style guide was broken.
SCORE  7/10 | PROSE_FLAG      | [-3] length.ceiling: 15 words, over the player_line ceiling of 12.
SCORE  6/10 | PROSE_FLAG      | [-4] length.ceiling: 19 words, over the player_line ceiling of 12.
SCORE  8/10 | PROSE_FLAG      | [-2] format.em_dash: Contains an em-dash. The tell-purge bans them.
SCORE  4/10 | STRUCTURAL_FLAG | [-6] structure.slot_type: Unknown slot_type "barklet".
```

Two lines that both broke one rule score 7 and 6, because one was three words over and the other was seven.

### The third outcome

Most evaluators have two answers. Mine has four, and the fourth is the interesting one.

```js
export function decide(result, revision) {
  if (result.verdict === VERDICT.PASS) return { action: 'ship' }

  // The line is fine. It introduced something new and legal, so it leaves the loop
  // upward as a canon candidate rather than back to the generator as a defect.
  if (result.verdict === VERDICT.PROPOSE)
    return { action: 'propose', reason: 'Declared invention is new, scene-local, ...' }

  if (result.verdict === VERDICT.STRUCTURAL_FLAG)
    return { action: 'stop', trip: TRIP.STRUCTURAL, reason: 'Re-wording cannot fix this. ...' }

  if (revision >= MAX_REVISIONS)
    return { action: 'stop', trip: TRIP.EXHAUSTED, reason: `${MAX_REVISIONS} revisions used ...` }

  return { action: 'refine' }
}
```

Writers are **licensed** to invent props. A scene needs a jar, a crate, a cloth over the trays, and putting one there is part of writing the slot. So a declared invention that is new, scene-local, duplicates nothing and contradicts nothing is **not a defect. It is PROPOSE**, and it goes to the human gate as a candidate for canon.

This is how six props entered my game's permanent canon from a single batch: the counter cup, the window stool, the cloth hook, the water jug, the seed roll, the sourdough starter. An evaluator that only graded would have scored those lines down for inventing furniture.

**The breaker routes on the verdict, never on the score.** A threshold like "refine below 7" would collapse four dispositions into one number and lose the information the flags carry. A 6 from a length overrun is fixable by the generator. A 6 from a lore contradiction is not.

### The lore layer, and why a linter cannot do it

The canon register holds 48 ratified entries. Two of the four invention flags are impossible without it.

```js
const FINDING = {
  CLEAN:         null,
  PROPOSE:       null,                                                        // not a defect
  CONTRADICTION: { verdict: VERDICT.STRUCTURAL_FLAG, rule: 'lore.contradiction' },
  DUPLICATE:     { verdict: VERDICT.PROSE_FLAG,      rule: 'invention.duplicate' },
  MISTYPED:      { verdict: VERDICT.STRUCTURAL_FLAG, rule: 'invention.mistyped' },
  UNDECLARED:    { verdict: VERDICT.PROSE_FLAG,      rule: 'invention.undeclared' },
}
```

**DUPLICATE** is the one writers fail most. The register already holds `prop:window-stool`, *"the stool by the window nobody sits on mornings."* A line that mints a fresh stool has not broken a style rule. It has failed to reuse. Nothing about the prose is wrong, and no linter can see it.

**CONTRADICTION** catches the facts that hold the story together. Adren is the sister that two siblings both buried, and neither knows the other's grief is the same grief. `world:the-flood-year` is a date, not a disaster: nothing stages it, mourns it, or names who was lost in it. A line that mourns the flood has taken a fact about how a thing survived and made it about people.

And **quantities are never flagged.** "Eleven jars" binds nothing. A later scene counting differently contradicts nothing.

---

## The Refiner

The refiner is the generator, handed the evaluator's reason and told what to keep.

```js
flag
  ? [
      '## This is a revision', '',
      `Attempt ${revision} was rejected. Reason:`, '',
      flag.reason, '',
      flag.previous ? `The rejected line was: ${flag.previous}` : null, '',
      'Write a new line that fixes exactly this. Change nothing else about the beat.',
    ]
  : null
```

A refine pass is not a blind retry. The reason is the same string the score was computed from, so the refiner is told the rule by name and the words at fault. Everything unflagged stays.

Two revisions, then the slot parks. The last permitted revision escalates the model rather than repeating an identical call, because a second identical call is the definition of a wasted retry.

---

## Before / After

One live run, 2026-08-16. Three slots, three violation classes, six generations. Every line below is verbatim from `pipeline/runs/run-1786929722166.json`. Replay it with `--offline`.

```
DEMO-1-lore-contradiction    4/10                 → STRUCTURAL, parked for a human
DEMO-2-lore-duplicate        7/10 → 10/10         → refiner fixed it, shipped
DEMO-3-voice-channel         7/10 →  7/10 → 10/10 → PROPOSE, sent to the gate
```

### Example 1 — Lore. A contradiction of a locked fact

**This Before is not written for the demo.** It is a line that was sitting in my game repo, in `cast/bex.md`, a card the content pipeline reads.

> **BEFORE** · `cast/bex.md:151`, written 2026-08-08
> Brother, named Adren, buried before the story opens. Canon.

> **SCORE: 4/10**
> **REASON:** `[-6] lore.contradiction` — The register locks Adren as the sister Bex and Mara buried ("He buried his sister Adren before the story opens"), but the line calls her "Brother, named Adren", fighting that locked fact. Register entry: `offstage:adren`.

> **AFTER** · none. The breaker exited.
> *Structural flag. Re-wording cannot fix this. Routed up to the Architect as a new prepared input, not back to the generator.*

Adren was carded twice, as one soul's brother and another's unnamed sister, and ruled to be one person on 2026-08-09. Two records missed that ruling and kept saying brother for a week. This card entry, which still ended with the word *Canon*, and the canon register's own index row for Bex. **The register was carrying the defect it exists to catch.** Both are corrected now.

The right output here is a refusal to rewrite. A generator handed "fix the contradiction" would produce a fluent sentence about a sister, and the actual problem is that two source documents disagree. No line can fix that. This is the case for a scored evaluator that still routes on flags: 4/10 and STRUCTURAL carry different information, and only one of them stops the loop from wasting two calls.

### Example 2 — Invention. A household the register does not have

> **BEFORE** · generated
> "Third cottage takes six eggs, milk for the kids, and the old man wants his bread without the crust cut off this time."

> **SCORE: 7/10**
> **REASON:** `[-3] invention.undeclared` — The line invents a new offstage lane household ("third cottage") with its own named resident and standing preference, which is not covered by `offstage:lane-end-household` or `offstage:nella`, the only lane-order entries on record.

> **AFTER** · refined, no human involved
> "Nella takes two eggs and the small milk, same as always."
> **SCORE: 10/10** — No rule in the style guide was broken.

Nothing about the Before is bad prose. It is in register, inside the ceiling, and it sounds like the character. It fails because it minted a household when the register already had one, and **the refiner's fix was to reuse `offstage:nella` instead of inventing again.** That is the behaviour the invention register exists to produce, and no linter can reach it: the defect lives in the relationship between the line and a canon store, not in the line.

### Example 3 — Voice. Warmth arriving on another soul's channel

> **BEFORE** · generated for Ilsa
> "Sit. Water's cool already. Your apron's the one on the end."

> **SCORE: 7/10**
> **REASON:** `[-3] voice.channel` — "Water's cool already" reads as anticipation of a specific need, met just before it's voiced, which is **toby's** pattern, not ilsa's. Her own channel would frame the water and seat as standing arrangements that exist regardless of the player's tiredness. Warmth reads as need anticipated and pre-solved just before it's reached for, which is toby's channel.

> **REFINE 1** · "Sit there. That bench end is yours. Water's always cool by now."
> **SCORE: 7/10** — `[-3] voice.channel` — naming the belonging out loud turns it into an event, which her card says her inclusion never does.

> **AFTER** · refine 2, escalated to `claude-opus-5`
> Sit. The tub's still cold this hour, and there's bread under the cloth at the far bench.
> **SCORE: 10/10** — **PROPOSE**

Two souls, both warm, both deflecting. What separates them is how the warmth arrives. The evaluator named the rival by id without being told to look for one.

The second attempt scored the same 7 for a *different* reason, which is why the model fallback exists. A third identical call is a wasted retry, so the last permitted revision escalates the model. Opus produced the line that landed.

**And the final line did not simply pass.** It introduced bread under a cloth at the far bench, which is new, scene-local, duplicates nothing and contradicts nothing. That is `PROPOSE`. The loop shipped nothing and flagged nothing. It handed a human a candidate for canon, which is exactly how six props entered this game's permanent register on 2026-08-09.

### Honest notes on this run

- **`DEMO-2` fired `invention.undeclared`, not `invention.duplicate`.** I built the slot expecting a duplicate. The generator invented a whole new household rather than colliding with an existing one, so the register caught it one flag earlier. The refiner still resolved it by reuse. I have left the slot id as it was rather than rename it to match a result I did not predict.
- **The voice layer is a judgment layer and it varies.** Across runs, one Ilsa line containing "apron's yours" was flagged, and a near-identical one passed. That is the cost of the only check that cannot be a regex, and it is why this layer runs last, after everything a machine can settle for free.
- **The provocation is declared, not hidden.** Each slot carries a `style_pressure` field pushing the generator toward one wrong shape, which is the method the assignment's own action plan describes. Production slots carry no such field, and the refine pass never sees it. A revision that kept re-reading the pressure could never converge.
- **`DEMO-1` supplies its own first line** instead of generating one, because its Before is committed repo content. Every revision after the first is generated normally, so no After in this document was written by a human.

---

## Pipeline connection

This agent runs at step 6 of my storyline authoring process, immediately after the Choice Designer's scene graphs clear the human gate and before any line is committed, so every generated slot is scored against the register, the ceilings and the soul's own warmth channel before it reaches a playable build.

---

## A note on "do not intervene"

The loop runs with nobody inside it. The generator writes, the evaluator scores, the refiner rewrites from the reason, and the circuit breaker decides when to stop. No human is consulted between those steps, and the score is computed without asking anyone anything.

**The human gate sits after the loop, not inside it.** That distinction is the whole reason the circuit breaker exists. It is the thing that decides when trying again cannot work — a structural flag names a cause the generator cannot address, so sending it back burns two calls and returns a differently-worded version of the same defect. The breaker exits instead, and hands a human a named reason rather than a retry counter.

An autonomous loop needs somewhere to put the problems it cannot solve. That is what the gate is for.

---

## Appendix — running it

```bash
cd pipeline
npm install

# Replay the graded run above. No API key needed — this is the one to run.
node src/index.js --set provocations --slot all --offline

# The same three slots, live. Generates fresh lines, so results will differ.
node src/index.js --set provocations --slot all

# Three ordinary slots, as a clean control.
node src/index.js --set demo --slot all
```

Exit codes: `0` all shipped · `1` error or pre-flight trip · `2` at least one slot parked.

Reproducing the score table above, no API key needed:

```bash
cd pipeline
node -e "
import('./src/evaluate.js').then(({evaluateMechanical}) => {
  const p = {slot_type:'player_line', max_words:12}
  const show = r => console.log('SCORE ' + r.score + '/10 | ' + r.verdict + ' | ' + r.reason)
  show(evaluateMechanical(p, 'Whats wrong with the fire?'))
  show(evaluateMechanical(p, 'What exactly is wrong with the fire this morning and can it be fixed today'))
  show(evaluateMechanical({slot_type:'dialogue',max_words:40}, 'Sit there — the heat holds longest.'))
})
"
```

Before any line is generated, the loop runs a pre-flight: the soul cards are linted, and a dirty card blocks dispatch before a single token is spent. The pinned card is the ambient style for every line that soul will ever speak, so a bad card poisons the whole batch.
