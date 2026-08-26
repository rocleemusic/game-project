# Handoff — Assignment #6 (GER pipeline) submitted, and the pickup for Assignment #7

**2026-08-16 · #6 due Tue 2026-08-18 · #7 due Thu 2026-08-20 · capstone Tue 2026-08-25**

Assignment #6 is built, staged and copied to the course repo. It is **not committed or pushed** — see §3.

The harness built for #6 is the direct starting point for #7. Read §4 before writing any #7 code.
The two assignments overlap enough that #6 was deliberately kept narrow to leave #7 its evidence.

Prior context: `assignments/assignment-6/STAGING.md` is the design pass and still carries the
open-decision log.

---

## 1. What shipped for #6

The harness existed already (built 2026-08-11). This session made it submittable.

### It runs standalone now

It used to reach four levels up into `tools/` and `cast/`, so it broke the moment it was copied out
of RL_MAP. Three files fixed that. Each names its source in its own header, so the copies are
declared rather than silent.

| New file | What it is |
|---|---|
| `pipeline/src/ceilings.js` | `CEILING` + `countWords`, copied from `tools/line-lint.mjs` |
| `pipeline/src/cardlint.js` | the two rules from `tools/card-lint.mjs`, running in-process |
| `pipeline/cards/{ilsa,toby,mara}.json` | the six fields each, extracted with the live parser |

The cards were dumped by calling the existing `loadCard()` against `cast/*.md`, so the field text is
byte-identical to what the live parser produces. That matters: fixture keys hash the prompt, so a
reworded card field would silently break `--offline` replay later.

Rewired: `evaluate.js` imports `./ceilings.js`, `breaker.js:preflight()` calls `cardLint()` instead
of `execFileSync`, `card.js` reads JSON, `config.js` lost `PROJECT_ROOT` and four path entries.

**`tools/line-lint.mjs` was left as it is.** Its main-block guard and the `countWords`/`CEILING`
exports are still there and still correct. CLI behaviour unchanged.

### The README was rewritten

Assignment-04 scored 10/10 with one note: *"Show your code examples in the actual README. Just as box
text so people can see the example without digging through other files."* The #6 draft had zero code
in it. It now has five boxes, and they carry the argument rather than decorate it:

`ENFORCED_CHECK` · the pinning split from `card.js` · real `evaluateMechanical` output · the refine
prompt from `generate.js` · all of `breaker.js:decide()`.

The layer-1 output box is **real output**, not written by hand. Running `evaluateMechanical` directly
produces all four verdicts with no API call, which is how #6 shows working evidence without spending
#7's demo. Reproduce it with the snippet in §6.

Shape follows assignment-05: title block, `# Whats in this repo` table, the declaration, then the
`What I built` / `What the Agent Does` / `Were you able to run this in your game?` triad, then
`## Appendix`.

### The declaration was merged

Roc's plainer framing, with the 2026-08-10 measurement and the interchangeable stool pair kept as the
concrete failure. 104 words, under the 150 cap. The 144-word draft stays in `STAGING.md`, marked
superseded.

### Copied out

`game-design-course/assignment-06/` — flat and zero-padded, matching the other top-level folders and
avoiding the accidental `assignment-05/assignment-5/` double nesting. `node_modules/` excluded.

The root `README.md` contents table gained rows for **-05 and -06**. -05 had never been added.

### Verified

- Runs standalone from the course repo: `card-lint clean (3 cards checked) — dispatch permitted`,
  then fails on the missing API key. `--offline` reports the missing fixture. Both are the intended
  failures and both prove no path escapes the folder.
- `grep` for `../../`, `RL_MAP` and absolute paths across `assignment-06/` returns nothing.
- The one cross-folder link (`../assignment-04/2026-07-25-kinbound/run-log.md`) resolves.
- Back in RL_MAP: `line-lint.mjs` clean on 1138 slots, `card-lint.mjs` clean on 8 cards, both exit 0.

**Not verified:** the loop has never completed a live generate → evaluate → refine cycle. See §2.

---

## 2. What was cut on purpose

Every one of these was cut because it belongs to #7, not because it was hard.

1. **No live run, no fixtures.** `--offline` errors until the harness runs online once, and the
   README says so. A recorded generate → flag → refine → trip demonstration is literally #7's
   Before/After deliverable, worth 2.0 points. Spending it on #6 would hand #7's evidence away.
2. **No provocation slots.** The three demo slots are well-specified and would most likely all pass
   first try. Slots engineered to trip the refiner belong in #7's demo set. See §4.
3. **No scoring evaluator.** #7 requires SCORE + REASON. `evaluate.js` returns a verdict enum. Leave
   it alone for #6 — changing it breaks #6's own framing and does #7's work early.
4. **"Did it catch something you would have missed?"** is answered from the Kinbound run, which is
   already on record and already shipped inside Assignment #4. No new run needed.

---

## 3. Still open on #6

1. **Not committed, not pushed.** `game-design-course` is on `master`, **ahead 1, behind 5**, and
   `assignment-06/` is untracked. The root README row was already auto-committed by that repo's hook,
   which is where the "ahead 1" comes from. **Needs a pull before any push.** This is the only thing
   between here and submitted.
2. **README prose is 802 words, not the ~700 asked for.** Two trim passes took it from 1009. What
   remains: 104 words of required declaration, ~140 in the two tables, ~560 explaining five code
   boxes. Further cuts mean dropping a box or leaving one unexplained. The file manifest table is the
   most cuttable thing left, since `pipeline/README.md` already carries a fuller file tree.
3. **The batch reconciler.** `STAGING.md` open decision 6, still open. It is a second refiner with
   rewrite authority and real before/after counts. It operates on a finished batch rather than inside
   the per-slot loop. **This is now more interesting for #7 than for #6** — see §4.

---

## 4. Assignment #7 pickup — Style Guide Agent

**GP-40** on the Paca board. Flagged as due 2026-08-13 and untouched in the 2026-08-13 handoff.
Now due **2026-08-20**. No board check was run this session.

### The brief, in short

Build an automated self-correcting Generator → Evaluator → Refiner loop enforcing the aesthetic and
narrative rules of the existing capstone game.

| Deliverable | Points | Requirement |
|---|---|---|
| Capstone-anchored style guide | 4.5 | Tied to real lore/characters/tone, from the GDD. **At least 3 distinct constraint types** |
| Evaluator & Refiner loop | 3.0 | Evaluator returns **SCORE + REASON**. Refiner rewrites from the reason, automatically |
| Before/After demonstration | 2.0 | **Three examples, three different violation classes** |
| Pipeline connection | 0.5 | Exactly one sentence |

Hard constraints: no new universe, nothing generic, **no binary pass/fail**, **no intervening in the
loop**.

### What #6 hands over ready

- The whole G → E → R skeleton, running, with a real API wrapper and fixture record/replay.
- A style guide that is already capstone-anchored and already has more than three constraint types:
  `narrative-pipeline/register.md` (measured ceilings, cadence, the walk-on band, the player voice),
  `guardrails.md` (12 locked checks), and the per-soul cards. Nothing needs inventing for the 4.5.
- The pinning split, which is a genuinely unusual design point and reads well.
- Fixture replay, so the graded before/after can be re-run without an API key.

### Three real changes #7 needs

**1. The evaluator must score, not verdict.** `evaluate.js` returns `PASS | PROSE_FLAG |
STRUCTURAL_FLAG`. The brief bans binary pass/fail and requires SCORE + REASON. The `reason` field
already exists and is already concrete. The score is new. The verdict enum should probably stay
underneath as the routing signal, with a score layered on top, because `breaker.js:decide()` depends
on it.

**2. Three violation classes, and #6's evaluator already has exactly three.** They map onto the
brief's own examples cleanly:

| Class | Enforced by | Layer |
|---|---|---|
| **Length** | word ceilings — `dialogue` 40, `player_line` 12 | deterministic |
| **Formatting** | the em-dash ban / tell-purge | deterministic |
| **Tone / voice** | guardrails check 6, warmth on the declared channel | judgment |

That is the before/after demo set. It needs provocation slots plus one live run.

**3. Provocation slots.** Designed but not built this session. The shape:
- an Ilsa beat written to invite Toby's *anticipation* channel, which should draw a voice flag and
  exercise the refiner
- a slot over its word ceiling
- a slot carrying an em-dash

The first is the interesting one. It is the defect measured on 2026-08-10 and the one that survives
every mechanical check.

### The framing tension — catch this before writing

**#7 says "DO NOT intervene in the loop." #6's whole argument is that nothing ships unread and the
human gate holds.** Those read as opposites and a grader may see it that way.

They are reconcilable, but only if the framing is deliberate. The loop runs autonomously to a scored,
refined result. Roc's gate sits *after* the loop, not inside it. The circuit breaker is what makes
that safe: it is the thing that decides when the loop stops on its own, which is precisely why the
human is not needed mid-loop.

Do not carry #6's "nothing ships unread" sentence into #7 unchanged.

### The batch reconciler is a better fit here

`agents/batch-reconciler.md` is the one seat with rewrite authority and it reports construction
counts before and after. #7 asks for a **Refiner that rewrites automatically** and a **before/after
demonstration**. That is what the reconciler already is. It was set aside for #6 because it works on
a finished batch rather than inside the per-slot loop. For #7 that is no longer a problem.

---

## 5. Decision for next session

**Fork the harness for #7, or evolve it in place?**

- **Evolve in place.** One codebase. `assignment-06/` in the course repo is already a frozen snapshot
  of the submitted state, so #6 cannot be broken by later edits. The RL_MAP staging copy becomes #7's
  working tree.
- **Fork.** `assignment-7/pipeline/` copied from #6. Keeps the two submissions visibly distinct, at
  the cost of duplicate code that will drift.

Not decided. The scoring change in §4 is the thing that forces the question, because it touches
`evaluate.js` and `breaker.js` together.

---

## 6. Running it

```bash
# the submitted copy
cd P:/GitHub/game-design-course/assignment-06/pipeline
npm install
node src/index.js --slot all     # card-lint passes, then errors on the missing key
node src/index.js --offline      # errors: no fixture recorded

# the working copy
cd P:/GitHub/RL_MAP/RL_MAP/ProjectOS/game-project/assignments/assignment-6/pipeline

# the live tools, still clean
cd P:/GitHub/RL_MAP/RL_MAP/ProjectOS/game-project
node tools/line-lint.mjs         # 1138 slots, clean
node tools/card-lint.mjs         # 8 cards, clean
```

Reproducing the README's layer-1 output box, no API key needed:

```bash
cd assignments/assignment-6/pipeline
node -e "
import('./src/evaluate.js').then(({evaluateMechanical}) => {
  const p = {slot_type:'player_line', max_words:12};
  console.log(evaluateMechanical(p, 'Whats wrong with the fire?'));
  console.log(evaluateMechanical(p, 'What exactly is wrong with the fire this morning and can it be fixed today'));
  console.log(evaluateMechanical({slot_type:'dialogue',max_words:40}, 'Sit there — the heat holds longest.'));
  console.log(evaluateMechanical({slot_type:'barklet',max_words:9}, 'anything'));
});
"
```

Exit codes: `0` all shipped · `1` error or pre-flight trip · `2` at least one slot parked.
