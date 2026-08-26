# GER harness — NPC dialogue slots

Generator · Evaluator · Refiner · Circuit Breaker, closing one loop over one slot of
NPC dialogue for the capstone game.

**The argument for the design is one level up, in [`../roc-lee-rebirth-README.md`](../roc-lee-rebirth-README.md), and the rules it
enforces are in [`../style-guide.md`](../style-guide.md).** This file is the operating manual.

```bash
npm install

# Replay the graded run. No API key needed — this is the one to run.
node src/index.js --set provocations --slot all --offline

# The same three slots, live. Generates fresh lines, so results will differ.
export ANTHROPIC_API_KEY=...
node src/index.js --set provocations --slot all

node src/index.js --set demo --slot all      # three ordinary slots, a clean control
node src/index.js --slot <slot_id>           # one named slot
```

Exit codes: `0` everything shipped · `1` error or pre-flight trip · `2` at least one slot parked.

A parked slot is not a crash, but it is not a success either, which is why it has its own code.

## Files

```
pipeline/
├─ src/
│  ├─ index.js       the loop — generate → evaluate → refine → break
│  ├─ generate.js    GENERATOR, and the REFINER, which is the same seat handed the reason
│  ├─ evaluate.js    EVALUATOR — three layers, cheapest first
│  ├─ score.js       the deduction table. Where SCORE comes from
│  ├─ codex.js       reads the canon register for the lore layer
│  ├─ breaker.js     CIRCUIT BREAKER — four dispositions, including PROPOSE
│  ├─ card.js        the pinning split, enforced in code
│  ├─ ceilings.js    word ceilings + the counting convention
│  ├─ cardlint.js    pinned-context hygiene — the pre-flight gate
│  ├─ llm.js         Claude wrapper + fixture record/replay
│  ├─ config.js      paths, the revision cap, the enforced check
│  └─ log.js         run log — the human gate's artifact
├─ cards/            ilsa · toby · mara · bex, six fields each
├─ codex.json        the canon register, 48 ratified entries
├─ slots/
│  ├─ provocations.json  the graded demo — three slots, three violation classes
│  └─ demo.json          three ordinary slots, as a clean control
├─ fixtures/         the recorded run, replayed by --offline
└─ runs/             run logs, one JSON per run
```

## The three evaluator layers

| Layer | Cost | Enforces |
|---|---|---|
| 1 · mechanical | free | word ceilings, the em-dash ban |
| 2 · voice | one call | guardrails check 6 — warmth on the soul's own channel |
| 3 · lore | one call | guardrails checks 4 and 12 — contradiction and the invention register |

Each runs only on what survived the one before it, so a line 20 words over its ceiling never
reaches a model.

**No model is ever asked for a number.** Each judgment layer names which rule broke and quotes
the words at fault. `score.js` does the arithmetic. The reason for that constraint is in
`../roc-lee-rebirth-README.md` and in the header of `score.js`.

## Where this runs

**Step 6 of the storyline authoring process (Lines)** — steps 8 → 10 → 11 → 13 of
`narrative-pipeline/pipeline.md`.

It runs *after* the Choice Designer's graphs clear Roc's gate, so it never writes prose
against a structure that might still be rejected. Its input is a slot that already knows
its `slot_type`, tone, word ceiling and beat.

```
step 5  Choice Designer → graphs → ROC'S GATE
step 6  ─────────── THIS HARNESS ───────────
step 7  Seam pass → scene-graph.json → ink → the game
```

Output feeds `scene-graph.json` → the resolver → `.ink` → `story.json` → lantern and Unreal
via Inkpot.

## Offline mode

`--offline` replays `fixtures/*.json`, keyed by a hash of model + system + prompt. Fixtures
are **recordings of live runs**, not hand-written answers — an online run saves what it
received. Changing a prompt changes the key, so a stale fixture can never silently stand in
for a call that was never made.

The fixtures here record the run of **2026-08-16**, which is the run written up in
`../roc-lee-rebirth-README.md` and logged in `runs/run-1786929722166.json`. Replaying it reproduces that run
exactly, with no API key.

**A live run generates fresh lines and will not match.** That is the loop working, not a
defect: two of the three demo slots generate their Before, and generation is not
deterministic. The recorded run is the evidence; a live run is a fresh sample.

## Transport retries are not revisions

`llm.js` retries an empty or malformed response up to twice, and `askJson` re-asks once on a
body that will not parse. That is deliberately separate from the circuit breaker's revision
count. The breaker counts attempts at writing an acceptable **line**; this counts attempts at
getting a **response** at all. Charging a content budget for a network event would park slots
that never failed the style guide.

Observed live on 2026-08-16: the API returned an empty body twice across a fifteen-call run,
and the same input parsed cleanly on the next attempt. A fixture is only written once a real
response arrives, so a truncated body can never be cached as if it were the model's answer.

## Three things here are copies

`src/ceilings.js` carries the word ceilings and `countWords` from `tools/line-lint.mjs`.
`cards/*.json` carries six fields each from `cast/*.md`. `codex.json` carries the ratified
entries from `narrative-pipeline/npc-codex.md`. All three are inlined so this folder runs
standalone, and each names its source and date in its own header. If the live files change,
these change with them.

`tools/line-lint.mjs` was changed once for this work: it used to run its whole lint at import
time and could call `process.exit(1)`. Its main block is now guarded so it runs only when
invoked as a script, and `countWords` and `CEILING` are exported. Behaviour as a CLI is
unchanged — still 1138 slots checked, still clean, still exit 1 on defects.
