# Handoff — Assignment #7 (Style Guide Agent) built, run and staged

**2026-08-16 · #7 due Thu 2026-08-20 · capstone Tue 2026-08-25**

Assignment #6 is submitted. #7 is built, run live, and copied to the course repo as `assignment-07/`.
It is **not committed or pushed** — see §6.

Prior context: `plans/_handoffs/2026-08-16-assignment-6-handoff.md` is the #6 record and the pickup brief this
session worked from. Its §4 predicted three changes #7 would need. Two were right, one was wrong,
and the wrong one turned out to be the interesting part — §2.

---

## 1. The question that shaped the build

The brief says, twice and in bold: **the Evaluator must output a SCORE, and must not use binary
pass/fail grading.**

Roc's first move was to check that against what the pipeline actually does. It does not score, and
the refusal is written down in three places:

- `narrative-pipeline/review.md:12` — *"No agent scores relatedness, resonance, or closeness. No
  pipeline field proxies for one... The checklist is questions Roc reads, not numbers the
  orchestrator computes."*
- `agents/consistency-verifier.md:50` — *"never ask whether a line feels right (judging resonance is
  measuring it)."*
- `consistency-verifier.md:28` — a `speaker_intent` value *"reading as a score is flagged on sight."*

So the assignment asks for the one thing this project wrote down that it will not do.

**The line that resolved it** is already in the repo. `prior-art-neq.md:40`: the bond *"is fed by a
scoring function; it is never split into stored sub-scores."* A computed, transient number weighted
by named categories is sanctioned. A persisted number standing in for a feeling is not.

| Legal | Banned |
|---|---|
| Score derived from named, enumerated violations | Score as an overall impression |
| Transient routing signal, discarded after the loop | Score persisted as state |
| "How far is this line from the written rules" | "How good is this line" |

**Roc's framing decision:** ship flags as the mechanism, emit a derived score as a report, and argue
the design choice in the README. Flags-only was considered and rejected: our flags already clear the
"not binary" ban (three verdicts, and the live Verifier has 18 `flag_type` values), but the brief
requires the literal word SCORE in two separate places, and #4 and #6 were both built to hit 10.

The implemented rule: **no model is ever asked for a number.** Each judgment layer names which rule
broke and quotes the words at fault. `score.js` does the arithmetic.

---

## 2. What the plan got wrong, and what fixed it

The #6 handoff proposed three constraint types: length, formatting, tone. That was thin, and Roc
caught the gap in one question — *"does it also capture the checking for existing props section?"*

It did not. **Guardrails check 12, the invention register, is the strongest material in the project
for this assignment**, and the plan had missed it entirely. It carries four flags:

| Flag | What it catches |
|---|---|
| Undeclared | An invention reaches the prose with no declaration |
| **Duplicate** | An existing codex entry could have carried it. Reuse was available and not taken |
| Contradiction | The declaration fights a locked fact |
| Mistyped | Declared `prop` but really geography or an offstage person |

And it carries **`PROPOSE`** — a third disposition where a legal new invention is not a defect but a
canon candidate. Six props entered the game that way on 2026-08-09.

That is a better anti-binary proof than the score. Pass / flag / propose is not a scale, but it is
three outcomes where a grader expects two, and the third one *adds to the game*.

Final count: **five constraint types against a brief asking for three.** Length · formatting ·
tone/voice · lore and invention · declaration integrity.

---

## 3. Design decisions

**Fork, not evolve.** Roc ruled coursework is progressive and #7 is treated in isolation, so
`assignments/assignment-7/` holds its own `pipeline/` copied from #6. #6 is frozen and submitted.

**Deduction weights are recovery cost, not severity by feel.** Roc flagged that plausible weights
are not defensible weights. The axis chosen is the same one the breaker already routes on:

| Cost | Meaning |
|---|---|
| 6 | Re-wording cannot fix it. The loop exits to a human |
| 4 | The fix is a bookkeeping decision, not a rewrite. Reuse an entry, retype a declaration |
| 3 | Re-wording can fix it, and finding the fix needs judgment |
| 2 | Re-wording can fix it mechanically. A regex found it |
| 1/word, cap 4 | Length is the one rule with a real distance, so it is the one deduction that scales |

The scaling is what makes the grade continuous. A line 3 words over scores 7 and a line 7 words over
scores 6, from a measurement, not an opinion.

**The breaker routes on the verdict, never on the score.** A threshold like "refine below 7" would
collapse four dispositions into one number. A 6 from a length overrun is fixable by the generator; a
6 from a lore contradiction is not.

**Real content beats synthetic provocation, where real content exists.** Roc asked whether repo
before/afters could be used. Finding: **committed content has no length or formatting violations
left** — `line-lint` is clean on 1138 slots, and every em-dash in the threads is an empty table-cell
marker. That is not a gap, it is the argument: deterministic checks already removed every
deterministic defect, so the only defects surviving in real content are the judgment ones.

The `sample-run/` README carries its own warning, and it was obeyed: *"Do not present this as the
harness catching something."* Roc's hand-pass rewrites are never shown as the loop's output. Where a
real Before is used, **every After in the submission is the loop's own.**

---

## 4. Two real defects found in the repo

Both were live on disk, in files the pipeline reads, and neither was caught by any existing check.

1. **`cast/bex.md:151`** read *"Brother, named Adren, buried before the story opens. Canon."* Adren
   was ruled one person, sister to both Bex and Mara, on 2026-08-09. This open-items entry was
   written 2026-08-08 and never updated. It still ended with the word *Canon*.
2. **`npc-codex.md:43`**, the `soul:bex` index row, also said *brother*. **This is the worse one.**
   The codex is the register every other check reads against, so the canon store was carrying the
   exact defect it exists to catch. Its own `offstage:adren` entry ten lines below had the ruling
   right the whole time.

Both corrected 2026-08-16, with the old reading and the reason recorded in place. `card-lint` clean
on 8 cards, `line-lint` clean on 1138 slots after.

**The gap this exposes: nothing compares the codex's index rows to its own entries.** `codex-lint.mjs`
verifies transcription at write time. It does not re-check internal agreement afterwards, so the two
halves of the codex disagreed for a week. Worth a check, not built this session.

---

## 5. The run — 2026-08-16, three slots, six generations

Recorded in `pipeline/runs/run-1786929722166.json`. `--offline` reproduces it exactly, no API key.

```
DEMO-1-lore-contradiction    4/10                 → STRUCTURAL, parked
DEMO-2-lore-duplicate        7/10 → 10/10         → refiner fixed it, shipped
DEMO-3-voice-channel         7/10 →  7/10 → 10/10 → PROPOSE, sent to the gate
```

**DEMO-1** fed `cast/bex.md:151` verbatim. The evaluator flagged `lore.contradiction`, quoted the
words at fault, cited the register entry, and the breaker refused to rewrite it. The refusal is the
right output: two source documents disagreed and no line can fix that.

**DEMO-2** generated an invented lane household, was flagged `invention.undeclared`, and **the
refiner's fix was to reuse `offstage:nella`** rather than invent again. That is the behaviour the
register exists to produce, reached without being told to reuse.

**DEMO-3** was flagged twice on `voice.channel` — the evaluator named Toby by id as the rival
channel without being asked to look for one. The model fallback fired on the last revision, and
Opus produced a line that introduced bread under a cloth at the far bench: new, scene-local,
duplicating nothing. `PROPOSE`.

### Honest notes, all carried in the submission README

- **DEMO-2 fired `invention.undeclared`, not `invention.duplicate`.** The slot was built expecting a
  duplicate. The id was left unchanged rather than renamed to match an unpredicted result.
- **The voice layer varies between runs.** One Ilsa line containing "apron's yours" was flagged and a
  near-identical one passed. That is the cost of the only check that cannot be a regex, and it is why
  the layer runs last.
- **A live run will not match the recorded one.** Two of three slots generate their Before.

---

## 6. Still open

1. **Not committed, not pushed.** `game-design-course` is on `master`, clean, in sync with origin.
   `assignment-07/` is untracked. This is the only thing between here and submitted.
2. **The codex self-agreement check** from §4 is unbuilt.
3. **`llm.js` gained transport retries** (empty or unparseable body, up to twice). Deliberately
   separate from the breaker's revision count: the breaker counts attempts at an acceptable *line*,
   this counts attempts at a *response*. Observed live — the API returned an empty body twice across
   fifteen calls. **This fix is in #7's copy only. #6's harness still has the original `llm.js`** and
   is submitted, so it stays as it is.
4. **`ANTHROPIC_API_KEY` is not in this machine's environment.** The run used the key in
   `P:\GitHub\rl-router\.env`, which bills that account. Roughly fifteen Sonnet calls and one Opus.
   The rl-router gateway itself was not used: it has no Anthropic backend configured, only Kimi.

---

## 7. Repo housekeeping done along the way

- The root README's `assignment-06/` link was broken — it pointed at `roc-lee-rebirth-README.md` at
  the repo root, which does not exist. Fixed to `assignment-06/roc-lee-rebirth-README.md`.
- `assignment-07/` row added to the root README contents table.
- The submission README is named `roc-lee-rebirth-README.md` to match #6's convention. Renamed in the
  RL_MAP source too, so the two stay in sync on a re-copy.
- `pipeline/README.md` was inherited from #6 unchanged and described two evaluator layers, three
  cards, and a `fixtures/` that "ships empty". Rewritten.
- `runs/` was removed from `pipeline/.gitignore` so the graded run log actually ships as evidence.

---

## 8. Running it

```bash
# the staged copy
cd P:/GitHub/game-design-course/assignment-07/pipeline
npm install
node src/index.js --set provocations --slot all --offline   # replays the graded run, no key

# the working copy
cd P:/GitHub/RL_MAP/RL_MAP/ProjectOS/game-project/assignments/assignment-7/pipeline

# the live tools, still clean after the two card corrections
cd P:/GitHub/RL_MAP/RL_MAP/ProjectOS/game-project
node tools/line-lint.mjs         # 1138 slots, clean
node tools/card-lint.mjs         # 8 cards, clean
```

Exit codes: `0` all shipped · `1` error or pre-flight trip · `2` at least one slot parked.
**The graded replay exits 2**, because DEMO-1 is parked by design. That is the correct result.

Reproducing the score table in the README, no API key:

```bash
cd assignments/assignment-7/pipeline
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
