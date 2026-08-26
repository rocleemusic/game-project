# Handoff — build the generator, run everything overnight (T15 + T16 + T17)

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to review and in what order.

**Written 2026-08-25 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

**Supersedes the earlier same-day handoff of this name**, which scoped this to
Mara's 9 rows only, hand-gated. **Roc widened scope the same day:** generate
everything — all of T15's dialogue inventory including Mara, plus T16's intro
scene, plus T17's item descriptions — in one unattended overnight run. Human
review happens after, as a polish pass, not a per-line gate blocking the run.

---

## State

The register-loosening groundwork is done, from earlier today:

- `narrative-pipeline/register.md` rewritten — NPC dialogue ceiling 40→75
  words, 20–50 median. Full detail:
  [`pipeline-runs/2026-08-17-register-loosening/2026-08-24-local-model-findings.md`](../../pipeline-runs/2026-08-17-register-loosening/2026-08-24-local-model-findings.md),
  [`assignments/assignment-8-icm/_kobold-tests/round2-findings.md`](../../assignments/assignment-8-icm/_kobold-tests/round2-findings.md).
- `narrative-pipeline/templates/persona-card-schema.md`, `guardrails.md`,
  `pipeline.md` carry the generalized safety findings: anti-copy instruction
  on sample lines, the anti-invented-backstory guard for named-but-unexplained
  figures, the banned "remember/memory/forget" vocabulary near any magic
  explanation, and the validated hybrid call shape (narrator beat + quoted
  line, system+user API split, never a chat UI).
- All 8 cast cards (`cast/*.md`) are re-measured against the loosened
  register. Mara's Voice register and Deflection sections are ported from the
  retuned `assignments/assignment-8-icm/characters/mara/brief.md` — the drawer
  is now precisely three objects, the Ovin hard-stop and Adren full-provenance
  exception are both carded.
- `assignments/assignment-8-icm/_kobold-tests/README.md` (new today) documents
  the actual run mechanics on the 4070 box: launch commands, the `--moecpu
  999` flag the 26B MoE model needs, the poll-before-testing pattern.

**Roc's read on quality:** the ICM test outputs (`round2-findings.md`'s sample
generations against the retuned Mara card) are good enough to trust — Mara
does not need special hand-authored treatment anymore. Generate her rows the
same way as everyone else's.

---

## What this run covers

**Everything gated post-capstone by the 2026-08-23 rulings, generated now, in
one overnight pass:**

| Source | Content | Count | Where it lands |
|---|---|---|---|
| T15 ruling | Greetings, encounters, spell beats, festival-night — all 8 souls, Mara included | 40 rows | Raw output to `pipeline-runs/2026-08-25-full-content-generation/dialogue/` (below); `gdd/15-dialogue-inventory.md`'s status column tracks each row as it lands |
| T16 ruling | Intro VN scene — why the mage came, festival stakes, name entry as a story beat | 1 scene, several beats | Raw output to `pipeline-runs/2026-08-25-full-content-generation/intro/` |
| T17 ruling | Every `description` field in `content/items/`, `content/key-items/`, `content/magic/`, rewritten into the mage's-field-notes voice | 54 records (16 items + 12 key-items + 26 magic) | Raw output to `pipeline-runs/2026-08-25-full-content-generation/{items,key-items,magic}/`, **not written into the live `content/*.json` files tonight** — see Output location below |

**Total: 95 generation units in one run.**

**Where this run's output actually lands — Roc's call.** Everything goes under one dated parent folder, matching the existing `pipeline-runs/YYYY-MM-DD-topic/` convention (see `2026-08-17-register-loosening/`, `2026-07-25-giver/`):

```
pipeline-runs/2026-08-25-full-content-generation/
  dialogue/
    greetings/       — 14 rows (GRT-*)
    encounters/       — 9 rows (ENC-*)
    spell-beats/      — 13 rows (SPB-*)
    festival-night/   — 3 rows (NGT-*)
  intro/              — 1 file (INT-1)
  items/              — 16 records
  key-items/          — 12 records
  magic/              — 26 records
  run-log.md          — the generator's own log: per-call success/failure, retries, timing
  RESULTS.md          — the summary read for the morning pass, same shape as prior runs' RESULTS.md
```

One file per generated unit inside its category folder, named after the row/record ID (`GRT-toby-1.md`, `item_salt.md`, etc.) so the morning diff against `gdd/15-dialogue-inventory.md` and `content/**/*.json` is a 1:1 lookup. **This run writes here only — it does not touch the live `content/*.json` files or the ink build directly.** Copying T17's approved descriptions into the actual JSON records, and T15/T16's approved lines into wherever the ink-authoring step consumes them, is the morning pass's job, after review — not tonight's.

---

## Model

**Everything through `gemma4-26b-fiction-bf16.Q4_K_M.gguf` with `--moecpu
999`** — Roc's explicit call, including item descriptions (T17), which is a
change from the earlier draft of this handoff (that one split dialogue to the
26B and left items unassigned). This is also the model round 2 testing found
clean on every canon/hard-limit axis across both rounds — see the shortlist
in `round2-findings.md`.

**Real risk worth flagging, not overriding:** this is a single model, single
instance, unattended, overnight, across 95 calls. If koboldcpp crashes or
hangs partway through, nothing restarts it. The generator script should:

- Log every call's result (success/failure/timeout) to a file as it goes, not
  just print to stdout — there's nobody watching this run live.
- Retry a failed call a bounded number of times (2–3) before moving on and
  logging it as skipped, rather than the whole run dying on one bad response.
- Write a final summary — how many of the 95 succeeded, what failed and why —
  so the morning review starts from a clear picture, not a scrollback dive.

None of that is in scope to build inside this handoff; it's a requirement for
whoever builds the generator.

---

## What doesn't exist yet — the actual generator

`_kobold-tests/scripts/round2_run_icm.py` and its siblings are fixed
3-scenario **model-comparison** tests, not a per-row content generator.
**Building the real generator is this session's first job.** It needs to:

1. Read each of the 95 units from its source (`gdd/15-dialogue-inventory.md`'s
   rows for T15/T16; each `content/**/*.json`'s current record for T17) and
   turn it into a scene_context/slot description the way the existing test
   scripts already model.
2. Call the model with the **card's pinned fields as the system prompt** —
   `essence_descriptor` + `voice_register` from the relevant `cast/<soul>.md`
   for T15/T16 dialogue, and the register's player-voice entry
   (`narrative-pipeline/register.md`, "The player voice" section) for T17's
   field-notes voice. **Generate against the canon cards, not
   `mara-card-icm.txt`** — that file is the sandbox test card and has already
   diverged from canon in small ways documented in `round2-findings.md`.
3. Use the hybrid output shape for dialogue (narrator beat + quoted line) and
   a plain single-paragraph shape for item descriptions (no narrator beat —
   T17 wants a notebook entry, not a staged scene).
4. Write every result into `pipeline-runs/2026-08-25-full-content-generation/`,
   in the categorized subfolders above — one file per row/record, named by ID.
   **Do not write into `cast/*-threads.md` or `content/*.json` tonight** —
   those are live canon/schema files, and this run's output needs a review
   pass before it becomes either.
5. For T17 specifically: each output file should still make clear which
   record it's for and what the *old* description was, so the morning pass
   can diff old-vs-new before copying the new text into the live JSON's
   `description` field — the only field T17 touches. `node tools/content-check.mjs`
   verifies the schema is still intact after that copy happens, not tonight.

---

## The morning-after pass — not blocking tonight's run, but real

Every generated line still needs a human read against each card's hard
limits — the point of generating overnight is to have material to polish
against, not to skip the check permanently. Specifically watch for what
round 2 testing found actually slips through even on this model on rare
occasion: an invented detail near a named-but-unexplained figure, "remember/
memory" language near a magic explanation, a line that states a World Truth.
`characters/mara/CONTEXT.md`'s human-check list is the template for what to
scan.

---

## Facts worth not re-deriving

- The koboldcpp server runs **on the same machine this session's Bash
  commands run on** — confirmed in `_kobold-tests/README.md` (`curl
  http://localhost:5001` worked directly). No separate remote box to reach
  over the network.
- One model at a time — koboldcpp only serves whichever `.gguf` it was
  launched with; `taskkill //F //IM koboldcpp.exe` before switching, though
  for this run nothing should need switching once the 26B is up.
- T17's `description` field is currently a bare label ("salt", not a
  sentence) on every record checked — confirmed on `item_salt.json`. This is
  a real rewrite, not a light edit.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-25-mara-exemplar-pipeline-run-handoff.md) in full,
then assignments/assignment-8-icm/_kobold-tests/README.md for run mechanics.

Goal: generate everything gated post-capstone by the three 2026-08-23
rulings (T15, T16, T17), in one unattended overnight run — 40 dialogue rows
(gdd/15-dialogue-inventory.md, all 8 souls including Mara), the T16 intro
scene, and T17's 54 content/ record descriptions (items, key-items, magic).
Roc has decided the local model's output quality is good enough to trust
without a human gate blocking generation — review happens as a morning
polish pass, not tonight.

No generator script exists yet. round2_run_icm.py and its siblings are
fixed-scenario model comparison tests, not a per-row generator — build a
real one first. Generate against the canon cards (cast/*.md's pinned
essence_descriptor + voice_register fields, and register.md's player-voice
entry for item descriptions), not the assignment-8-icm sandbox test card,
which has already diverged from canon in places.

Model: gemma4-26b-fiction-bf16.Q4_K_M.gguf with --moecpu 999, for
everything, including T17's item descriptions — Roc's explicit call. This is
a single unattended instance across ~95 calls overnight: build in logging,
bounded retries, and a final success/failure summary, since nobody is
watching the run live.

Output location: everything goes under
pipeline-runs/2026-08-25-full-content-generation/, in categorized
subfolders (dialogue/greetings, dialogue/encounters, dialogue/spell-beats,
dialogue/festival-night, intro, items, key-items, magic), one file per
row/record named by its ID, plus a run-log.md and a RESULTS.md summary.
This run does NOT write into cast/*-threads.md, content/*.json, or the ink
build directly — copying approved output into those live files is the
morning pass's job, after review, not tonight's.

T17 constraint: only the `description` field ultimately changes in each
content/ record — verify with node tools/content-check.mjs once that copy
happens. T15/T16 output shape is the validated hybrid (narrator beat +
quoted spoken line); T17 is a plain notebook-entry paragraph, no narrator
beat.
```
