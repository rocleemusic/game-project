# Extending Content — adding a conversation or a thread

The mechanical half of the pipeline, written so one person can take a new conversation from a blank line file to a compiled `story.json` without asking anyone. `pipeline.md` says how content is *decided* (steps 1–13, who owns which call). `guardrails.md` says what the Verifier checks. `build-loop.md` says how ink is structured. **This file says which commands to run, in which order, and what each one is supposed to print.** Nothing here is new policy; every rule is cited to the doc that owns it.

Everything below runs from two working directories, and mixing them is the first way this goes wrong:

| Working directory | What runs there |
|---|---|
| `../tools/resolver/` | the importer, `npm test`, the compile proof, `src/cli.ts build` |
| `../` (the `game-project` root) | the six content gates (`tools/*-lint.mjs`, `tools/content-check.mjs`) |

**Nothing under `../lantern-projects/v01/ink/` is ever hand-edited.** It is `emitInk` output; the next build clobbers it. A line changes in its line file, or through Lantern's `edits.json` patch flow (`build-loop.md`, the file split).

---

## 0. Which of the two jobs this is

**A new conversation in an existing thread** is the common case: the thread document already exists in `../lantern-projects/v01/threads/`, already has its examinables table and its conversation list, and you are adding C4 after C3. Steps 1–4 below are the whole job.

**A new thread** needs two things first, both of which belong to the Architect and neither of which this doc authorizes you to skip:

1. **A row in the soul's per-life thread registry** — `../cast/<soul>-<role>-threads.md`, schema in `templates/thread-registry-schema.md`, checked by `node tools/registry-lint.mjs`. Seven columns, a status from the vocabulary, and a stageable action per row.
2. **A thread document** in `../lantern-projects/v01/threads/<soul>-<slug>.md` — conversation list, examinables table (declared examinables are guardrail check 11 and are joined against `../tools/resolver/data/screen-specs.json`, so a declared pickup that is never built fails the build), and the entry-gate statement per conversation.

Then the new thread's conversations run steps 1–4 exactly like any other.

---

## 1. Author the line file

One file per conversation, in `../lantern-projects/v01/threads/lines/`, named `<soul>-<thread-slug>-C<n>.md`. The contract is `templates/line-file-schema.md` and it is not advisory — the importer parses these files, so a deviation is a build defect, not a style difference.

**The canonical column order, exact header spelling, every table in every file:**

```
| slot id | slot_type | tone | text | W | speaker_intent |
```

This order was chosen by corpus plurality (26 of 30 files already used it), not invented. `W` follows `text`; it never precedes it.

**`slot_type` is one of exactly four:** `dialogue` · `action` · `object` · `player_line`. Ceilings key off the type — 40 · 60 · 60 · 12 words, or 75 for the scene's single marked long run (`guardrails.md` check 8).

### The `W` counting convention (ruled 2026-08-11 — Roc)

`W` counts the words of that row's `text` cell and nothing else. Recount it every time the text changes; the recount that established this rule corrected 18 of 1,133 slots.

1. **The `**[action]**` render marker does not count.** It is a marker, not text that plays.
2. **Brackets do not count; the words inside them do.** `[Lean on the counter next to him and stay there.]` is **10**.
3. **A contraction is one word.** `you're` is 1. Counting it as 2 would silently inflate every band the corpus was measured against.

Everything else is whitespace tokens of the cell after the marker and brackets come out. Punctuation glued to a word does not make a second word. The authoritative implementation is `countWords` in `../tools/line-lint.mjs` — that function is the tie-breaker, and it is exported precisely so nothing keeps a second copy of the rule.

### When a `speaker` column is allowed

**Default: no `speaker` column.** One soul carries the `dialogue` slots and the front matter names them once. A column repeating the same word 40 times is not information.

**A second soul speaking occasional lines still needs no column** — the front matter names the exceptions once, and each exception row carries a `*(name)*` prefix in its `speaker_intent` cell. `mara-said-out-loud` is the worked example.

**A `speaker` column is added only when speaking alternates table-wide**, so that a front-matter exception list would have to name most of the rows. Two of thirty files meet that bar: `toby-kept-and-returned-C3` and `toby-the-shelf-C4`. When present it sits after `tone`:

```
| slot id | slot_type | tone | speaker | text | W | speaker_intent |
```

A walk-on gets a `speaker` value where the column exists and keeps `—` in `speaker_intent`, because there is no card to check the line against.

The front-matter block above the first table carries the conversation identity and `SC-…` scene id, the structure source, the soul(s) and ceilings, the default-speaker declaration, the render convention, the incoming states, and the staging vocabulary. The importer **errors** if the front matter names no soul, if the H1 carries no `SC-…` id, or if there is no incoming-states line.

---

## 2. Declare the entry gate

This is the distinction people get wrong, so it gets its own step. Two different jobs, two different fields:

- **`Scene.entry_gate`** gates *entering the conversation*. It carries **sequence**: normally one `played(<previous scene id>)` term.
- **A node's `availability_conditions`** gate *content inside* the conversation. They carry **knowledge**: `knows(<flag>)`.

The thread documents state the rule and it is quoted verbatim in `../tools/resolver/src/types.ts` on the field itself:

> **Entry gate is the previous conversation in this thread completing. Nothing else. Completion gates the sequence; knowledge gates the content.**

The default is not a preference. A knowledge entry gate can close a conversation permanently, and choosing that is a reveal-reachability decision belonging to the Architect (`../agents/choice-designer.md`, R3 as amended by Roc 2026-08-06) — a Choice designer never adds one on its own initiative. Where the brief does specify one, `toby-the-shelf-C4`'s `**ENTRY GATE — `knows(shelf_named)`.**` is the shape.

Why the field exists at all: without it every conversation of a thread was offered simultaneously and in any order — four shelf entries on T2, eleven "Talk to Ilsa" entries once T4 was authored.

**Declare it in the line file's front matter as a bolded `**ENTRY GATE — …**` line with each predicate in backticks.** The importer reads backticked terms off that line and accepts only terms starting `played`, `knows`, `item_held`, `bond_band`, or `day`.

**The predicate vocabulary is closed** (`templates/screen-spec-schema.md`; compiled in `../tools/resolver/src/predicates.ts`): `current_screen` · `time_of_day` · `day` · `npc_present()` · `item_held()` · `item_in_slot()` · `knows()` · `played()` · `seen()` · `bond_band()`. Anything else throws `Not a predicate` at build time.

Two of those are locks and two are colour, and confusing them is a design defect the compiler cannot see:

- **`played(scene_id)` is a lock.** It compiles to `<soul>.<scene> > 0` — a knot name evaluates to its own read count in ink, so it needs no extra state. It throws if the scene id does not name a scene in the graph, because a renamed or archived scene otherwise leaves a gate that can never be true.
- **`seen()` and `bond_band()` are dialogue colour, never a lock.** Do not gate reachable content on either.

Build-time checks that already cover this: `findUnsatisfiable` in `../tools/resolver/src/conditions.ts` fails the build on a scene gated on `played(itself)` and on a ring of entry gates waiting on each other; `entry-gate.test.ts` covers the compiled output.

---

## 3. Run the importer

```
cd ../tools/resolver
node scripts/import-lines.mjs
```

**Dry run is the default.** There is no `--dry-run` flag — the flag is `--write`, and without it the importer parses everything, verifies it, and writes only its report. Add `--entry-gates` to apply the front-matter `**ENTRY GATE**` declarations rather than only reporting them.

**What it prints, and how to read it:**

```
report: …/tools/resolver/reports/import-lines-report.md
files=… scenes=… nodes=… options=… slots=…
  by slot_type: {"dialogue":…,"action":…,"object":…,"player_line":…}
errors=… warnings=… inferred=…
```

- **`errors` > 0 → nothing is written and the process exits 1.** It prints the first 25. A partial import that looks successful is the failure this script is designed against, so a non-zero exit means `data/scene-graph.json` is untouched — fix the line file, never the importer's output.
- **`warnings`** are reported and do not block. Read them anyway: an unapplied entry gate arrives here.
- **`inferred`** is the audit trail. Anything the parse had to infer — a gate, a speaker, a note the line file does not carry — is recorded on the node under `importer_inferred` *and* listed in the report, on Roc's ruling: infer, but make it auditable. Every inference is something a later pass audits rather than trusts.
- The report at `reports/import-lines-report.md` carries per-file totals — scene, soul, tables, slots, nodes, options, gated nodes, entry_gate. That per-file table is where you confirm your new conversation landed with the slot count you wrote, not the count a parse guessed.

When the dry run is clean it says so explicitly (`Dry run clean. Re-run with --write to update data/scene-graph.json.`). Then:

```
node scripts/import-lines.mjs --write        # add --entry-gates to apply them
```

---

## 4. Re-emit and verify

Four proofs, in this order. All four must be run; each catches something the others cannot.

**a. The tests.**

```
cd ../tools/resolver
npm test
```

Expected: every failure is one of the four named in §5. See §5 before you touch anything red.

**b. The ink compile proof — zero errors *and* zero warnings.**

```
node scripts/compile-check.ts data
```

It runs `loadData → buildGraph → emitInk → inkjs Compiler` and prints the graph shape, the emitted file list, then `COMPILE OK — first line: Day 1 begins.` Anything printed as `ink warning:` or `ink ERROR:` fails the proof — **the warnings matter as much as the errors**, because inklecate warns on loose ends and ran-out-of-content flow, which is how a dead end or an unfinished branch is caught before a playtest (`build-loop.md`). Data warnings prefixed `data warning:` are a separate, currently-expected set (provisional envelopes, texture-depth souls); they are not the compile proof.

**c. The build.**

```
node src/cli.ts build --data data --out out-calib --emit-story
node src/cli.ts resolve-week --data data --out out-calib
```

Expected: `graph.json + ink/ + story.json written to …/out-calib`. Bare `node src/cli.ts build` defaults to `out/`; the run folder Lantern loads is the one you pass to `--out`. `--emit-story` compiles the emitted ink, so it doubles as a second compile gate. The build itself fails (exit 1) on an unsatisfiable gate, and on a declared examinable the build does not satisfy when `--threads` is passed:

```
node src/cli.ts build --data data --out out-calib --emit-story --threads ../../lantern-projects/v01/threads
```

`--warn-only` reports examinable problems without failing, which is the legitimate mid-authoring state before a thread is marked ready for prose.

**d. The six content gates**, all from the `game-project` root, each exit 0 clean and exit 1 with one line per defect:

```
cd ../..            # game-project root
node tools/line-lint.mjs
node tools/card-lint.mjs
node tools/codex-lint.mjs
node tools/content-check.mjs
node tools/ref-lint.mjs
node tools/registry-lint.mjs
```

`line-lint.mjs` is the one that reads what you just wrote: it checks `W` against its own text, the ceilings, `slot_type` membership, and an option heading's promised response count against its table. It flags **shortfalls only** on that last check, deliberately — the corpus counts response slots two ways, so a surplus is ambiguous and a shortfall is not, and a check that fires on the ambiguous direction becomes noise. All six were clean on 2026-08-11 and are expected to stay that way; a red gate is yours.

---

## 5. The known-red tests — do not fix these

**Four test failures are expected and must stay red.** They are GP-21's acceptance criterion: the bond-band guard is supposed to fail on Ilsa. A green test here would certify a known break, so making one pass is a regression, not a fix.

```
✖ RULED (Roc, 2026-07-30): one attentive life earns mid; high needs a second
✖ demo_multiplier reaches high inside ONE life, which is what it is for
✖ nothing is unreachable for a reason that is not by design
✖ a band-gated beat one life cannot reach is EXPECTED, not a defect
```

**Never weaken an assertion to make a test pass.** That applies to every test in the suite, not only these four.

The rest of the red set moves as content lands, so read the *names*, never the totals — the counts drifted within a single day as the 30 authored conversations were imported. The check is: **the four above are red, and every other failure is either a documented import-in-progress failure or something you just broke.** Measured on 2026-08-11 after the content import, `npm test` gave 199 tests / 189 pass / 10 fail: the four above, plus six that track the imported scene graph rather than the fixtures (the night-scene vignette, two pre-tuning byte-identical regression snapshots, a day-gated scene entry, the per-soul max-bond walk, and `seedThreadsFromContent`). If you add a conversation and a *seventh* non-bond test goes red, that one is yours.

---

## 6. The trap list — what has actually bitten this project

Not hypotheticals. Each of these cost a run.

- **Positional column parsing fails silently.** Reading column 4 as `text` returned **46 slots against a true 85**, because the column index is not stable across the corpus: 2 of 30 files carry a `speaker` column after `tone`, and 3 carry an extra trailing column. It did not crash; it returned a number that simply was not the right one. Address cells by header name, always. Same for nodes: ownership of a slot is derived from the slot id (`templates/id-label-convention.md`), never from which table or heading it happens to sit under — `A-CH-T4-04-4-a-r` prints inside a nested child's table and belongs to option `-4-a`.
- **A stale `W`.** The count is the enforcement surface for the slot ceilings and for the per-soul word bands that keep three souls distinguishable, so an unverifiable count means unverifiable bands. Recount on every text edit; `line-lint.mjs` now catches it, and it rejected two of the five rows written the day it was added.
- **`surface_action` used as a `slot_type`.** It is a `choice-node-schema.md` field on an *option* — the diegetic phrasing of an unspoken deed, `[Pick up the trays]`. It is not a slot type, it has never been one, and it leaked into a worked example once and had to be corrected. `ink.ts` throws if an option is neither `player_line` nor `surface_action`; the line file's `slot_type` column has four legal values and this is not one of them.
- **Negated predicates.** There is no negation in the vocabulary. Writing one **does not error** — the term fails to match, and what you get is a branch that is silently unreachable. Same shape as the positional-parse bug: wrong answer, no complaint. If a beat needs "hasn't learned X yet", that is a structural question for the Architect, not a `!knows(x)` you invent. The 2026-08-11 import audit confirmed zero negated predicates in live gates; every mention in the corpus is a prose warning. Keep it that way.
- **Trusting an agent's report over the files on disk.** Three session limits were hit on 2026-08-11: agents wrote files, then died before reporting. One workflow reported 1 thread written when 29 of 30 files existed on disk. A schema migration claiming 30 files in 2 tool calls is a claim, not a result. **Check artifacts, not claims** — count the files, read the importer's per-file table, run the gates.

---

## The whole thing, as commands

```
# 1–2. author the line file and its **ENTRY GATE** line, to
#      templates/line-file-schema.md

# 3. import — dry run first, non-zero exit means nothing was written
cd tools/resolver
node scripts/import-lines.mjs
node scripts/import-lines.mjs --write --entry-gates

# 4. verify
npm test                                       # only the four §5 failures
node scripts/compile-check.ts data             # zero ink errors AND zero warnings
node src/cli.ts build --data data --out out-calib --emit-story \
     --threads ../../lantern-projects/v01/threads
node src/cli.ts resolve-week --data data --out out-calib
cd ../..
node tools/line-lint.mjs && node tools/card-lint.mjs && node tools/codex-lint.mjs \
  && node tools/content-check.mjs && node tools/ref-lint.mjs && node tools/registry-lint.mjs
```

Then the content goes to review — Lantern graph review and greybox playtest, per-node approve/flag/edit into `approvals.json` + `edits.json`, rebuilt with `build --edits` (`CONTEXT.md`, the full loop). Roc approves every line at the gate (`review.md`). The gate does not move mid-chain.
