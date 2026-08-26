# RESULTS — Full content generation run, 2026-08-25

Overnight, unattended run covering everything gated post-capstone by the three 2026-08-23
rulings (T15, T16, T17), per
[`plans/_handoffs/2026-08-25-mara-exemplar-pipeline-run-handoff.md`](../../plans/_handoffs/2026-08-25-mara-exemplar-pipeline-run-handoff.md).
Roc's widened-scope ruling applied: Mara's rows generated through the model exactly like
every other soul's — no hand-authored exception tonight.

Generator: [`scripts/generate_all.py`](scripts/generate_all.py), built this session (no
per-row generator existed before — `round2_run_icm.py` and siblings are fixed 3-scenario
model-comparison tests, not this). Full call log: [`run-log.md`](run-log.md).

---

## Verdict

**95 of 95 generation units succeeded. Zero failures, zero skips, zero retries needed** —
every call landed on its first attempt. One real voice slip found on review (below), plus
the T17-magic deviation the handoff itself flagged as worth double-checking. Nothing is
copied into live canon tonight; this is all raw material for the morning polish pass.

| Category | Units | Result |
|---|---|---|
| T16 Intro (2 bounded calls → 1 file) | 2 | 2/2 |
| T15 Greetings — deep three (×3 bond levels) | 9 | 9/9 |
| T15 Greetings — texture five (×1 each) | 5 | 5/5 |
| T15 Encounters — deep three (×3 each) | 9 | 9/9 |
| T15 Spell-intro beats (13 role spells) | 13 | 13/13 |
| T15 Festival-night — deep three | 3 | 3/3 |
| T17 Items | 16 | 16/16 |
| T17 Key-items | 12 | 12/12 |
| T17 Magic (new `description` field) | 26 | 26/26 |
| **Total** | **95** | **95/95** |

Model: `gemma4-26b-fiction-bf16.Q4_K_M.gguf`, `--moecpu 999`, koboldcpp, everything through it
including T17 — Roc's explicit call. Server log: [`koboldcpp-server.log`](koboldcpp-server.log).
Per-call timing was 3–8s for dialogue, 4–7s for T17 — the whole 95-call run took under 10
minutes of pure model time.

---

## Where everything landed

```
pipeline-runs/2026-08-25-full-content-generation/
  dialogue/greetings/       14 files (GRT-*)
  dialogue/encounters/       9 files (ENC-*)
  dialogue/spell-beats/     13 files (SPB-*)
  dialogue/festival-night/   3 files (NGT-*)
  intro/INT-1.md              1 file, both bounded calls shown
  items/                    16 files (item_*.md)
  key-items/                12 files (key_*.md)
  magic/                    26 files (spell_id.md)
  run-log.md
  RESULTS.md  (this file)
```

Each dialogue/intro file shows the row ID, soul, the exact scene_context handed to the
model, the generated narrator-beat-plus-line, and a word count. Each T17 file shows the
record ID, the OLD description (or "none — new field" for magic), and the NEW generated
description, for a 1:1 old-vs-new diff before anything is copied into `content/*.json`.

**Confirmed: this run wrote nothing outside this folder.** `git status` after the run shows
only new files under `pipeline-runs/2026-08-25-full-content-generation/` — `cast/*-threads.md`,
every file under `content/`, `gdd/15-dialogue-inventory.md`'s status column, and the ink build
are all untouched, as the handoff requires.

---

## Deviation #1 — T17 magic, flagged as required by the task brief

The handoff's literal wording says T17 rewrites "the `description` field" on every record.
That's true for items and key-items — each already carries a bare-label `description`
(`item_salt.json`: `"description": "salt"`). **It is not true for magic/spell records.**
Inspecting several `content/magic/*.json` files (`ignite.json`, `bind.json`, etc.) confirms
they carry `phrase`, `role`, `components`, `produces`, `learn_source`, `confirm_action`,
`mana_effect`, `receivers` — **no `description` field at all.**

So for all 26 magic records, this run **added a new `description` field** (mage's
field-notes voice, same register as items/key-items) rather than rewriting an existing one.
Every `magic/*.md` output file says so explicitly in its "OLD description" line: `"none —
new field"`. This is a deliberate, flagged deviation from the handoff's literal wording, not
a silent reinterpretation — the morning reviewer should treat every magic description as a
genuinely new addition to the schema, not an edit, and confirm with `node
tools/content-check.mjs` after copying that the schema still validates with the new field
present.

---

## Deviation #2 — row enumeration read from the inventory table, not hand-transcribed

The generator parses `gdd/15-dialogue-inventory.md`'s markdown tables programmatically at
run time (`load_dialogue_inventory_units()`), and reads each soul's `essence_descriptor` and
`voice_register` live from `cast/<soul>.md` on every run (`load_cast()`) — never hand-copied
or cached across a session — so a future re-run always generates against whatever canon says
right now. Role→soul resolution for the texture-role spell beats (Postman/Priest/Farmer,
which the inventory table doesn't name a soul for) was derived from each cast card's own
`role_tag` field, live: Postman → Pip, Priest → Juno, Farmer → Bex. Confirmed correct in the
output (`SPB-scratch.md` → Pip, `SPB-leap.md` → Juno, `SPB-breath.md` → Bex).

---

## Operational note — the run restarted mid-way

`run-log.md` shows two `## Run started` timestamps (05:11:51 and 08:52:33) but only one
`## Run finished` (09:00:59). The first invocation completed 25 of 95 units (through
`ENC-mara-3`) and then stopped without an error being logged — no exception, no timeout, no
"Run finished" line, just silence, consistent with the background process being interrupted
rather than the script failing. A second invocation started clean at 08:52:33 and ran all 95
units through to completion with zero failures. Because every unit is written to a
file named by its own ID, the second run's outputs simply overwrote the first run's partial
files — there's no duplication or inconsistency on disk, and the final `run-log.md` tail
("Total: 95 succeeded, 0 failed/skipped") reflects one clean, complete pass. Flagging this so
it isn't mistaken for two different generation attempts with diverging content — there's only
one final version of everything, and it's the complete one.

---

## Real finding on review — one banned-vocabulary slip

Swept every output file for `remember` / `memory` / `remembers` / `forget`
(`guardrails.md` check 7, and named explicitly in every system prompt this run used).
**One hit, in `key-items/key_arch_filing.md`:**

> "A single filing from the Lantern Arch centerpiece. It has a sharp edge. I carried it in my
> sleeve for three days **before remembering it**. It feels heavier than it looks..."

This is the exact failure mode round 2 testing warned about — the model reaching for
memory-language unprompted, this time on an object description rather than a magic
explanation, despite the guard being in its system prompt for every T17 call. It's the only
hit across all 95 outputs (dialogue included), so the guard mostly held, but "mostly" is why
this needs the morning pass, not a claim that it's clean. **Reject or hand-edit this one
description before it goes anywhere near `content/key-items/key_arch_filing.json`.**

No `Ovin` mentions anywhere in the dialogue output — the model never reached for him
unprompted in any Mara-adjacent or general scene, which is the anti-invention guard working
as intended (nothing to check there because nothing was said).

---

## What the morning pass should check first

Per the handoff, this is a polish pass on trusted-quality output, not a blocking gate that
should have happened tonight. Priority order, worst-first:

1. **`key_arch_filing.md`'s "remembering it" line** — the one confirmed guard slip above.
   Fix or drop before copying.
2. **`NGT-toby.md` (56 words)** — Toby's card bars any long run wherever he's receiving,
   thanked, or seen, and bars them absolutely at a payoff; festival night is exactly that
   kind of beat for him. Worth a specific read against `cast/toby.md`'s failure-mode #2
   before this is treated as clean, even though it's under the world's 75-word ceiling.
3. **Invented detail near named-but-unexplained figures** — the specific failure mode round 2
   local-model testing found repeatedly (three models once invented three different,
   mutually incompatible Ovin backstories). No Ovin references turned up this run, but any
   other named-and-unexplained figure across the 8 cards deserves the same scan.
4. **World Truth statements** — a line that states outright what a scene is supposed to only
   serve without saying (guardrails check 7's bias-tier rule). Spot-check the festival-night
   and encounter files first; they carry the most emotional weight and are where a model is
   likeliest to over-state.
5. **Word bands per card, not just the world ceiling** — several outputs sit comfortably under
   75 words but still land above a soul's own declared band (e.g. Ilsa's 5–7, Bex's 3–8,
   Pip's 3–8). The 75-word ceiling is a world-level wall, not a per-soul target; check each
   line against its own card's `voice_enforcement` numbers, not just the universal cap.
6. **`characters/mara/CONTEXT.md`'s human-check list** — the handoff names this as the
   template for what to scan generally; run it against Mara's nine generated rows
   specifically, since those are the ones that would previously have been hand-written and
   are the widened-scope's real test case.
7. **Component-table fidelity on spell beats** — half of round 2's canon failures traced to a
   missing component table, not a model problem. Every `SPB-*.md` file in this run shows the
   component list it was given in its scene_context; spot-check two or three against
   `content/magic/<spell>.json` directly to confirm the table matched.

Once approved: T17 descriptions copy into each record's `description` field (a **new** field
for the 26 magic records, an edit for the 40 items/key-items), verified afterward with `node
tools/content-check.mjs`; T15/T16 lines feed wherever the ink-authoring step consumes them;
and `gdd/15-dialogue-inventory.md`'s status column updates row by row — none of which this
run touched, by design.

---

## Pass 2 — 2026-08-25 (evening) — encounters/spell-beats/festival-night rebuilt as scenes

Roc reviewed pass 1 and rejected the three heaviest T15 categories: **encounters,
spell-intro beats, and festival-night** all came out as single narrator-beat-plus-line
outputs when they were supposed to be actual scenes — 6-8 beats with a player choice
point that gathers back together, in the vein of the richer multi-turn material in
`assignments/assignment-8-icm/sessions/`. **T17 (items/key-items/magic), greetings, and
intro are untouched and were not regenerated tonight** — Roc confirmed those are fine.

New generator: [`scripts/generate_scenes_pass2.py`](scripts/generate_scenes_pass2.py). It
imports `generate_all.py` as a module and reuses its infrastructure verbatim (`load_cast`,
the four guards, `call_model`/`generate_with_retry`, `load_dialogue_inventory_units`,
`role_to_soul_map`, `WHAT_IT_DOES`, `load_item_descriptions`, `safe_write`) rather than
duplicating it — only the prompt-building and output-writing are new.

### The new scene format

One model call per unit (same fast-batch tradeoff pass 1 used), `max_tokens=1000`, asking
for a strict but loosely-parsed output contract:

```
BEAT 1 / BEAT 2 [/ BEAT 3 / BEAT 4]: [narrator beat] "spoken line"
CHOICE SETUP: [narrator beat] "spoken line that opens the choice"
OPTION A (<verb_family> — <detail>): "player line" -- or -- [surface action]
RESPONSE A: [narrator beat] "spoken line"  (repeat for B, optionally C)
GATHER: [narrator beat] "spoken line"  (plays regardless of the pick)
```

- **Encounters (`ENC-*`):** the choice point always includes a "help using an item"
  option (`verb_family: Use`, a real item from `content/items/_index.md`) and, where it
  fit the soul's voice, a "help using a spell" option (`verb_family: Use`, one of that
  role's real approved spells from `content/magic/_index.md`) or a plain `Converse`
  witness/sit-with option. Item/spell pairing per soul: Toby (Baker) → `item_spring_water`
  + `weigh`/`portion`; Ilsa (Blacksmith) → `item_river_stone` + `temper`/`ignite`; Mara
  (Herbalist) → `item_berry` + `steep`/`preserve`.
- **Spell-beats (`SPB-*`):** component table loaded live from `content/magic/<spell>.json`
  into every prompt (the round-2 canon-failure lesson the brief named), with the choice
  point's shape left to the model's judgement — watch-and-ask (Converse) vs. try-it (Use)
  by default, adapted per spell.
- **Festival-night (`NGT-*`):** choice point restricted to `player_verb` witness / ease /
  sit-with (`fix` explicitly barred in the prompt), plus a soul-specific extra guard
  block quoting each card's own heavy-beat rule — Toby's receiving-flat/payoff bar,
  Mara's grief-fragment/Ovin-bare-line rule, Ilsa's grammar-failure (sentence-doesn't-
  finish) rule — appended to that soul's system prompt only for this category.

### Totals — 25/25 succeeded

| Category | Units | Result |
|---|---|---|
| Encounters (`ENC-*`) | 9 | 9/9 |
| Spell-beats (`SPB-*`) | 13 | 13/13 |
| Festival-night (`NGT-*`) | 3 | 3/3 |
| **Total** | **25** | **25/25** |

Every call succeeded, no retries burned. Scene lengths run 137–468 words (vs. pass 1's
single lines), all comfortably inside the world's per-line 75-word ceiling since the
length is spread across 6-8 beats, not concentrated in one. A loose structural parser
(`detect_malformed()` in the generator) ran against every one of the 25 final files
looking for a missing `CHOICE SETUP`, fewer than 2 or more than 3 `OPTION` lines, a
`RESPONSE` count short of the `OPTION` count, a missing `GATHER`, or a last line that
doesn't end on closing punctuation (a truncation heuristic) — **zero files flagged.**

**Confirmed with `git status`:** only `dialogue/encounters/`, `dialogue/spell-beats/`,
and `dialogue/festival-night/` changed. `content/`, `cast/`, `gdd/`, and
`narrative-pipeline/` are all clean; `dialogue/greetings/`, `intro/`, `items/`,
`key-items/`, and `magic/` are untouched from pass 1.

### Operational note — a bug found and fixed mid-run

The encounters table uses a ditto mark (`"`) in the Goal column for rows 2 and 3 of each
soul ("same goal as row 1"). The first version of the generator resolved the ditto mark
**after** already running a `"` → `'` quote-character replace on the raw cell, so the
ditto check never matched and 6 of 9 encounter files (`ENC-toby-2/3`, `ENC-ilsa-2/3`,
`ENC-mara-2/3`) went out with a broken `scene_context` reading "the festival goal (')"
instead of the real goal text. Caught on review, fixed (goal now resolves against a
per-soul cache populated the first time each soul's real goal value is seen, before any
character replace runs), and all 9 encounters were regenerated clean — the whole
category was re-run rather than patching just the 6, so goal text is verified consistent
across all three of each soul's encounters. `run-log.md` carries three additional
`## Pass 2` timestamped sections from this (the original 25-unit run, a 6-file targeted
attempt that hit the same caching order problem, and the final clean 9-file rerun); the
files on disk reflect only the last, correct version.

### Flag for the morning reviewer — anti-copy guard slips, worth fixing before anything ships

**This is the priority item from this pass.** Despite `ANTI_COPY_GUARD` sitting in every
system prompt exactly as it did in pass 1, the model repeatedly reached for cards'
"sounds like" sample lines almost verbatim when it needed a closing or transitional line
and didn't have fresh material to hand — a stronger pull than pass 1's shorter, single-
line calls ever surfaced. Five instances found on a targeted sweep (not exhaustive —
worth a fuller read):

1. **`encounters/ENC-mara-2.md`, GATHER line** — reproduces Mara's card sample
   *"The lanterns used to hang right there — mind your step, they'll be up again by
   evening, same as every year"* **word-for-word**. Also nonsensical in context (this is
   a mid-week herb-preserving scene, not festival night — the line describes lanterns
   that aren't part of this beat at all).
2. **`spell-beats/SPB-preserve.md`** — the exact same Mara sample line reproduced
   verbatim as its GATHER line, same non-sequitur problem (a spell-intro scene about
   salt-preserving herbs, closing on an unrelated lantern line). Its BEAT 3 also closely
   paraphrases a second Mara sample ("It keeps — that's the whole trick to a good root
   cellar...") with the structure intact and only the nouns swapped ("It keeps — that is
   the trick to a good harvest...").
3. **`encounters/ENC-ilsa-1.md`, RESPONSE C** — *"The bench is yours. There is room by
   the door."* combines two Ilsa sample lines ("That's yours." / "There's room by the
   door.") into one near-verbatim line.
4. **`festival-night/NGT-ilsa.md`, GATHER** — *"There is room by the door."* — near-
   verbatim reuse of the same Ilsa sample (this one may be more defensible as her
   established motif reused in-voice, but it's close enough to flag).
5. **`festival-night/NGT-toby.md`, BEAT 2** — *"Two more after hers, and then the last
   of the wick."* — opens with the exact four words of Toby's sample line "Two more
   after hers." before extending it.

Swept the full 25-file set for the banned-vocabulary guard too (`remember` / `memory` /
`remembers` / `forget`) and for `Ovin` — **zero hits on both**, so those two guards held
completely this pass, unlike the one T17 slip pass 1 found.

### Card-specific limits — quick read against each soul's own rules

- **`NGT-toby.md`** — all three RESPONSE lines are short (6-9 words) while the player is
  easing/witnessing/sitting with him, consistent with the receiving-flat rule; no long
  run appears anywhere in the scene. Reads compliant on a first pass, but re-check
  against failure mode 4 (flat-but-still-warm, not flat-and-cold) by ear, not just by
  word count.
- **`NGT-mara.md`** — no statement of the loss itself anywhere, no Ovin mention, past-
  tense drift stays on ordinary objects/routine ("the lanterns used to hang," "the
  festival used to end at the well") rather than the grief itself, which is exactly what
  her card licenses. Reads compliant.
- **`NGT-ilsa.md`** — short throughout (176 words total, all lines in her 5-7-word
  native band), no long run, nothing bossy-reading in the settled-certainty lines. It
  does **not** reference Bram or the family-absence pressure at all, so it under-uses
  the "fragment → action slot → shorter fragment" heavy-beat shape her card specifically
  calls for at a payoff moment — not a violation of anything stated, but a missed
  opportunity worth a hand pass if festival night is meant to carry her arc's weight.
- **Encounters and spell-beats** generally keep the item/spell-help options
  non-decorated (neither option reads as "the right answer," per the choice-node
  schema's two guards) and none of the sampled files show one option's response
  scolding the other pick.

### Priority order for the morning pass (this category only)

1. **The five anti-copy-guard instances above** — highest priority; `ENC-mara-2.md` and
   `SPB-preserve.md` in particular ship a sentence lifted whole from the card into a
   scene where it doesn't even make sense.
2. **`NGT-ilsa.md`'s missing Bram/absence beat** — not a defect, but worth a hand pass
   if this scene is meant to be her arc's festival-night payoff.
3. **Word-band check per card** (same note as pass 1) — several scenes' individual
   lines sit under the 75-word world ceiling but should still be checked against each
   soul's own declared band (Ilsa 5-7, Toby similarly terse) rather than the world
   ceiling alone; the choice-point RESPONSE lines are the likeliest place for a model to
   drift long since they're answering a fresh player action rather than continuing an
   established rhythm.
4. **Choice-point balance, read aloud** — the structural parser confirms the shape
   (2-3 options, response counts, a gather) but cannot judge whether either option
   quietly reads as the "better" pick; that's a human-ear check per the choice-node
   schema's guard 1.
5. **Component-table fidelity on spell-beats** — same check pass 1 flagged; each
   `SPB-*.md` shows the exact component list handed to the model in its scene_context,
   worth spot-checking two or three against `content/magic/<spell>.json` directly.

Nothing from this pass is copied into `gdd/15-dialogue-inventory.md` or anywhere else
live — same as pass 1, this is raw scene material for the morning review pass.
