# Handoff — thread-driven scene generation, review pass next

Paste the block at the bottom into a new session if picking this up cold.
Everything above it is context for a human deciding what to review and in
what order.

**Written 2026-08-25 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

**Supersedes** [`2026-08-25-mara-exemplar-pipeline-run-handoff.md`](2026-08-25-mara-exemplar-pipeline-run-handoff.md)
in one specific way: that handoff's overnight run (95 units, single-line
dialogue output) shipped and Roc reviewed it. **The dialogue portion of that
output is now retired** — Roc's read after seeing it: real scenes were
needed, not single lines, and encounters needed to let the player help with
an item or a spell. **The T17 item/key-item/magic descriptions from that
run are unaffected and still stand as approved** — nothing in this handoff
touches them.

---

## What happened today, in order

1. **Overnight run** (`pipeline-runs/2026-08-25-full-content-generation/`) —
   95 single-line dialogue/description units, all 95 succeeded technically.
   Roc's review found the *shape* wrong: encounters and festival-night need
   to be real scenes with player choices, not one narrator-beat-plus-line
   each.
2. **First rebuild attempt** — same run folder, `dialogue/encounters|
   spell-beats|festival-night/`, single-call-per-scene generation with an
   inline choice point. Better, but still local-model-authored structure
   with a real copy-guard violation (Mara's card sample line reproduced
   verbatim in two files).
3. **Roc's redirect**: look at `narrative-pipeline/` and follow the GDD's
   real pipeline shape, adapted for local models. Start a fresh
   `pipeline-runs/` folder, generate threads first, align on a plan before
   running anything.
4. **Two trials** (`pipeline-runs/2026-08-25-thread-driven-scenes/
   trial-thread-authoring/`) settled the one open architecture question —
   can a local model do structural authoring (threads, choice graphs), or
   only line-level prose? Both a simple thread-registry row and a full
   choice-graph (Toby's `toby-feast-short` C1) came back from the 26B
   internally self-contradictory: duplicated options across nodes, an
   invented number that broke canon, mermaid that doesn't parse. Claude's
   blind attempts at both held together. **Ruling: Claude authors
   structure, local models write lines.**
5. **Roc's scope correction**: the old `lantern-projects/v01/threads/`
   4-conversation format (6-9 choice nodes per conversation) is retired —
   too overwhelming for a player. Fresh pass, compact scenes: 6-8 beats,
   one choice point, 2-3 options, one gather. Encounters are now a
   **pass/fail mechanic** — completing all 3 of a soul's `ENC-<soul>-N`
   scenes successfully is what finishes that soul's festival goal, which
   reverses the old threads' premise ("nothing the player does moves the
   outcome").
6. **The full build** (`pipeline-runs/2026-08-25-thread-driven-scenes/`) —
   see [`PLAN.md`](../../pipeline-runs/2026-08-25-thread-driven-scenes/PLAN.md)
   for the agreed scope, [`RESULTS.md`](../../pipeline-runs/2026-08-25-thread-driven-scenes/RESULTS.md)
   for the full report. Phase 1: Claude authored all 25 scene structures
   directly (9 encounters, 3 festival-night, 13 spell-beats). Phase 2: five
   local models (Muse-12B, Violet-Lotus, StyleTune Q5, Crimson-Constellation,
   gemma4-26b-fiction) wrote lines into that fixed structure, one model call
   per slot. A real bug (structural scaffolding leaking into generated
   prose, plus one model drifting into second-person narration) was found
   mid-run by spot-checking raw output, fixed, verified, and the
   contaminated output was discarded and regenerated. **469 of 477
   generation slots shipped clean; 8 were correctly skipped rather than
   shipped contaminated.**

---

## State — what exists now, unreviewed

Everything below is raw material for a human pick, per Roc's ruling
mid-session: side-by-side comparison files, no automated judge.

- **25 approved scene structures**: `pipeline-runs/2026-08-25-thread-driven-scenes/structure/`
  — `ENC-toby/ilsa/mara-1/2/3` (9), `NGT-toby/ilsa/mara` (3), `SPB-<spell>`
  for all 13 approved role spells. Each is a mini Architect brief +
  Choice-designer content block + mermaid graph, self-verified against
  mermaid validity, id consistency, and each soul's card-specific rules
  (Ilsa's bond-band bar, Toby's payoff-proximity long-run bar, Mara's
  grief-fragment/Ovin-bare-line rule).
- **26 comparison files**: `pipeline-runs/2026-08-25-thread-driven-scenes/lines/*-comparison.md`
  — every generated slot, one column per model, word counts, for Roc to
  read and pick from directly. Raw per-model JSON sits underneath in
  `lines/_raw/<model>/`.
- **5 new greeting rows**: `GRT-<texture-soul>-generic` — texture souls now
  get a first-meeting line (already existed) plus a generic/already-met
  line (new this run), per Roc's ruling. `gdd/15-dialogue-inventory.md`'s
  texture-greeting section was edited to reflect this (1→2 rows/soul).
- **Nothing here is copied into `content/`, `cast/`, `gdd/15-dialogue-inventory.md`'s
  status column, or the ink build.** That copy step is the next human
  session's job, after picking winners.

---

## Facts worth not re-deriving

- **Local models are trustworthy for line-level prose, not for structural
  authoring.** Confirmed twice this session (a thread-registry row, a full
  choice-graph) and consistent with the standing finding in
  `gdd/11-ai-agents-and-pipeline.md` ("the structure slot needs the
  stronger model"). Don't re-run this trial; the ruling is settled — Claude
  authors structure, local models write lines.
- **The old `lantern-projects/v01/threads/*.md` format (4 conversations,
  6-9 choice nodes each) is retired for future generation, not deleted.**
  It's still real, ratified, gated content for whatever it already shipped
  against — don't touch it — but don't imitate its scale for new work
  either.
- **Two prompt-leakage bugs were found and fixed in two different
  generator scripts this session**, both by direct spot-checking of raw
  output rather than trusting log success counts. If a third generator
  script gets written, spot-check its first real output before trusting a
  long unattended run — this has now bitten twice.
- **The delegating agent stalled between every model-switch phase this
  session** (finished a model's pass, then stopped and waited for a
  "monitor" that never actually resumed it) — required a manual nudge via
  SendMessage after every single phase. If running another long
  multi-model pass unattended, expect to check in and resume actively
  rather than trust a background completion claim at face value.
- **Ilsa's C4/`ENC-ilsa-3` carries a real branch** (whether the true ore
  was sourced), per her existing ratified thread's canon — not a
  simplification introduced this run.

---

## The morning-after pass — not blocking, but real

Per `RESULTS.md`'s worst-first list:

1. **8 skipped slots** — search any `lines/*-comparison.md` for "not
   generated" or "FAILED". Muse-12B lost `NGT-ilsa::option_a` outright (all
   3 attempts drifted second-person or invented Ovin); Violet-Lotus lost
   two slots across its passes.
2. **Setup-slot overlength/anti-copy drift** — `ENC-mara-3`'s setup slot is
   the confirmed instance: **both Violet-Lotus and Crimson-Constellation**
   independently reproduce Mara's card sample line ("The lanterns used to
   hang right there...") verbatim as filler, in a scene about herb-stall
   tonic brewing with no lanterns in it — worse than `RESULTS.md` describes
   (it names only Violet-Lotus; Crimson does it too, confirmed by direct
   read). Check every setup slot before treating it as finished prose, not
   just this one.
3. **Pick per slot** — every comparison file has all applicable model
   columns side by side. StyleTune and gemma4-26b shipped zero leakage
   retries across the whole run (a formatting-discipline signal, not a
   voice-quality one — read the actual text).
4. **Component-table fidelity spot-check** on 2-3 `SPB-*` files against
   `content/magic/<spell>.json` directly — the structures were authored
   against the real tables, the generated prose is a separate pass.
5. **Encounter pass/fail flags are structural only, not wired** — nothing
   in this run touches `tools/resolver/data/scene-graph.json` or
   `state.ink`. That's a downstream build step once lines are picked.
6. Once picked: T15/T16 lines feed wherever the ink-authoring step consumes
   them, `gdd/15-dialogue-inventory.md`'s status column updates row by row.
   Neither happened this run, by design.

---

## Prompt for a new session, if picking up cold

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-25-thread-driven-scenes-run-handoff.md) in full,
then pipeline-runs/2026-08-25-thread-driven-scenes/RESULTS.md for the full
generation report.

Goal: review and pick winners from pipeline-runs/2026-08-25-thread-driven-
scenes/lines/*-comparison.md (26 files — 9 encounters, 3 festival-night,
13 spell-beats, plus 5 new texture-soul greeting rows already picked
single-variant). No automated judge — read each comparison file and choose
the best model's line per slot, or hand-edit where none is quite right.

Known issues to weigh while picking (both from RESULTS.md and verified
independently): 8 slots have no output for at least one model (search
comparison files for "not generated"/"FAILED" — every other model/slot
combination still has a usable option). Several setup slots ran long and
at least one (ENC-mara-3) has two different models reproducing Mara's card
sample line verbatim as filler — read setup slots with extra scrutiny
before accepting them as-is.

Once winners are picked: copy the chosen lines into wherever the
ink-authoring step consumes T15/T16 content, update gdd/15-dialogue-
inventory.md's status column row by row, and wire the encounter pass/fail
flags (knowledge_flag/thread_move per pipeline-runs/2026-08-25-thread-
driven-scenes/structure/ENC-*.md) into tools/resolver/data/scene-graph.json
and state.ink — none of that happened in the generation run, by design.

Two standing findings from this session, don't re-derive: local models
are reliable for line-level prose but not for structural/graph authoring
(tested twice); the old lantern-projects/v01/threads/ 4-conversation
format is retired for new work (too large for a player) though still real
canon for whatever it already shipped.
```
