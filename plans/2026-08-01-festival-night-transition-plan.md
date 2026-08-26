# Festival night transition — plan (2026-08-01)

> **⚠ This document is a DESIGN RECORD. Status is tracked in Paca (`GP-10`), not here.**
> The banner below said "Nothing built" for a full day *after* the work shipped — the exact
> failure that moved status out of markdown on 2026-08-01. **Built the same day it was
> planned;** what follows is the design and the rulings behind it, which remain accurate.

~~**Status: PLAN DRAFTED, PENDING ROC'S APPROVAL. Nothing built.**~~ The planning pass ran
inline in the same session (all rulings collected directly from Roc); the hand-off prompt at
the bottom is kept for the record but is superseded — the plan itself is in "The plan" section
below.

---

## Why this task exists

The overnight gauntlet on branch `lantern-functionality-pass` (2026-08-01) converged on all 8
dimensions, but final verification caught a resolver calibration regression: `bounds.hit`
false → true, whole-search paths 3146 → 994, Ilsa's walked bond 34.3 → 23.1 (historical
figures as recorded then; re-baselined 2026-08-02 per Roc's ruling — prior figures not
reproducible, producing script deleted; current baseline is paths 1434, Ilsa 28.7). Two scenes went
unreachable. One of them — the `SC-T7-toby` / `SC-T7-ilsa` pair on Festival Grounds — turned
out to be **a missing feature, not a bug**: the game has no mechanic that ever transitions
`TimeOfDay` into `night`, so the day-5 festival-night scenes cannot be reached by any play,
walked or human.

(The other unreachable scene, `SC-T6-01`, is a week-planner scarcity/optimization question in
`walk.ts` — different in kind, **explicitly out of scope for this plan**. It is tracked in
`PAUSED.md` Task 5.)

## The evidence, verified by direct code reads (2026-08-01)

All paths relative to `ProjectOS/game-project/tools/resolver` unless noted.

- **Placement:** Toby and Ilsa are only placed on screen T7 (Festival Grounds) during day 5's
  `night` block — `data/screen-specs.json:260-263`. T7's `npc_slots` and `time_states`
  already include `night` (260-265), so the data model is ready; only the trigger is missing.
- **`src/ink.ts` `emitMoveTo` (124-142):** when evening's move budget exhausts, it diverts
  straight to `day_end` **unconditionally** — no `day == 5` branch anywhere.
- **`day_end` (578-584):** increments `day`, ends the cycle if `day > days_per_life`,
  otherwise returns to `home_hub`. Never sets `TimeOfDay = night`.
- **`advance_time()` (624-636):** only cycles `morning → afternoon → evening`; per its own
  comment (618-623) it is dead code for the night transition — evening never reaches it.
- **`src/graph.ts:129-134`:** `LIST TimeOfDay` already includes `night`, with a comment
  confirming "ink.ts's day loop no longer cycles evening → night on its own."
- **Lantern's client** (`tools/lantern/src/lib/stage.ts:225-249`) has a **dev-only manual
  stub** that can force `TimeOfDay` to `night` on day ≥ 5, explicitly commented as separate
  from the real move-budget clock — not connected to the actual ink story path at all.

## The GDD gap (a spec gap before a code gap)

A full-text sweep of `gdd/` and `narrative-pipeline/` confirms the mechanic is unspecified:

- `gdd/03-core-loop.md:16-18` describes festival night only narratively ("closes on an ending
  vignette shaped by the player's decisions"). No trigger condition.
- `gdd/08-levels.md:20-22` — the entire Festival Grounds entry is the single line "The final
  screen."
- The phrase "terminal beat" appears nowhere in the GDD; it is language from this session's
  PAUSED.md ruling (2026-08-01: *night is not a normal block — it is festival night, the
  terminal beat of day 5 only*), not a ratified GDD term.

Three questions had no answer on paper. **Roc ruled on all three, 2026-08-01 (this session):**

1. **Trigger:** on day 5, when the evening move budget exhausts, the player returns to the
   home hub as normal. From there, **when ready, the player chooses to go to night** — it is
   a deliberate step from the home hub, not an automatic flip.
2. **Content:** any NPC with a festival-night scene is playable at night. Once all such
   scenes are complete, the festival vignette plays — **or** the player can choose to start
   the vignette early, before exhausting the scene options.
3. **End:** the night vignette plays, then a final screen gives summary and results and
   prompts the player to restart a new game.

**"Final sequence" (RATIFIED by Roc, 2026-08-01 — replaces the informal "terminal beat"):**
night is a one-way ending sequence, not a fourth time block. It starts when the player
chooses to go to Festival night (from the day-5 home hub), and leads to the **final screen**
— the summary/results and the prompt to restart. **You cannot go back to the day cycle after
this without starting a new game.** Flow: night scenes → festival vignette → final screen →
new game.

Relevant background reading for the planning session: `gdd/03-core-loop.md`,
`gdd/08-levels.md`, `narrative-pipeline/arc-festival-slice.md`, and `PAUSED.md` Task 6.

---

## Edge-case rulings (Roc, 2026-08-01, this session)

| Question | Ruling |
|---|---|
| Can the player refuse night? | **No — night is the only exit on day 5.** The home hub's only forward option is going to the Festival; the player can linger, but the game only continues through night. No alternate ending. |
| Does the move budget apply at night? | **No budget at night** — but **the only screen is the Festival Grounds (T7)**. The player freely plays NPC night scenes in any order. |
| Where do the vignette + final screen live? | **New real screens** in `screen-specs.json`, so Lantern can review them like anything else (same reasoning as the home-hub ruling). |
| Lantern's dev night stub? | **Keep it** as a clearly-labeled dev shortcut for reviewers, same spirit as the variables override. |

---

## The plan

### A. GDD addendum (write first, before any code)

1. **`gdd/03-core-loop.md`** — add the day-5 exception after the normal day loop: on day 5,
   when evening's budget exhausts, the player returns home as always — but the home hub
   offers no calendar (there is no day 6 to plan). Its only forward option is **Go to the
   Festival night**, which starts the **final sequence**. Add the ratified definition:
   > **Final sequence:** a one-way ending sequence, not a fourth time block. It starts when
   > the player chooses to go to Festival night from the day-5 home hub and leads to the
   > final screen (summary, results, and the prompt to restart). There is no return to the
   > day cycle without starting a new game.
   Night rules: no move budget; the Festival Grounds is the only screen; every NPC with a
   festival-night scene is playable there; once all are complete the festival vignette plays,
   or the player may start it early at any time.
2. **`gdd/08-levels.md`** — expand the Festival Grounds entry from "The final screen" to
   describe its two roles (a reachable low-weight screen during the week; the stage of the
   final sequence on night 5), and add the two new screens below to the level list.

### B. Data: two new screens (`data/screen-specs.json`)

- **`T9` — Festival Vignette.** `location: "town"`, `time_states: ["night"]`, no NPC slots,
  no forage, no exits back into the world. `connects_to`: none (it is entered from T7's
  night hub only, and leaves only to FS). Status: like T7's, never a day-opening pick —
  plus a note that it is final-sequence-only.
- **`FS` — Final Screen.** The summary/results screen. `time_states: ["night"]`, no slots,
  no exits. The restart prompt is its content.
- Both get notes citing this plan and the 2026-08-01 rulings. Precedent: the home hub is
  already a real screen whose ink flow is hand-authored in `emitMain` rather than generated
  by `emitScreen` — these two follow the same pattern (see D).

### C. Ink emitter changes (`src/ink.ts`)

The pivot: **`day_end` increments `day` before checking end-of-cycle** (lines 578-584), so
by the time the player is home on day 5's evening, `day` is already 6 and the story hits
`-> END`. The final sequence must intercept **before** that increment.

1. **`day_end`**: becomes
   - `{ day == days_per_life: -> home_hub_final }` — day 5's evening goes home, but to the
     final-sequence variant, with `day` NOT incremented (the SYS-CYCLE-END line and its
     `-> END` are retired; the final screen replaces them as the cycle's ending).
   - else: `~ day = day + 1`, `-> home_hub` (unchanged normal path).
2. **New knot `home_hub_final`** (hand-authored in `emitMain`, beside `home_hub`): the
   "you're home; the festival is tonight" beat. Options: the same once-only *Look around
   your home* flavor, and **`* [Go to the Festival night]`** — no calendar. That choice:
   `~ TimeOfDay = night`, then diverts to T7's knot. Entering night this way is the ONLY
   writer of `TimeOfDay = night` in the whole story (the comment on `advance_time()` at
   618-623 stays true: it still never reaches night).
3. **Night on T7**: T7's existing generated knot already routes `TimeOfDay == night` to its
   `ts_night` state and offers its scenes (`emitScreen`, 168-174). Two adjustments:
   - **No budget at night**: `emitMoveTo` is never invoked at night because T7's night hub
     offers no exits — suppress exit choices when `TimeOfDay == night` (T7 connects only to
     T1, and leaving the grounds mid-festival contradicts the ruling). Scene choices don't
     spend moves today, so no other change is needed.
   - **The vignette choice**: T7's hub gains `+ {TimeOfDay == night} [Begin the festival
     vignette] -> festival_vignette`, always available at night. Additionally, when every
     festival-night scene on the screen has been played, auto-divert to the vignette
     (ink's sticky-choice loop already tracks scene completion via its existing seen-state;
     the emitter adds the "all seen → divert" check in the night state only).
4. **New knots `festival_vignette` and `final_screen`** (hand-authored in `emitMain`, like
   `home_hub`): the vignette knot carries placeholder beats tagged `#screen:T9` (real prose
   is the prose pass's job, per "graph before prose"), then `-> final_screen`. The final
   screen prints placeholder summary/results tagged `#screen:FS` — the design slots for
   results (festival tier, bonds, threads) are named as placeholders now and wired when
   `role_goals_advanced` compiles — then a "start a new game" line and `-> END`. `-> END`
   plus the host's restart is the "new game" mechanic; no in-ink state reset.

### D. Walker + calibration (`walk.ts`, `out-calib`)

- The walker's model of a week must learn the final sequence: day 5's evening ends at
  `home_hub_final` → night on T7 → scenes → vignette → final screen. No walker change should
  be speculative — extend it only as far as the emitted ink requires.
- **Expected calibration outcome, checked after the build:** `SC-T7-toby` and `SC-T7-ilsa`
  reachable again; `bounds.hit` back to false; whole-search paths recover (current
  canonical baseline: 1434 — re-baselined 2026-08-02 per Roc's ruling; prior ~3146 figure
  not reproducible, producing script deleted);
  Ilsa's walked bond recovers (current canonical baseline: 28.7; prior 34.3 figure not
  reproducible — same re-baseline note) (watch the 36 high-band ceiling — the standing
  watch item in PAUSED.md). `SC-T6-01` will still be unreachable — that is the separate
  walk.ts scarcity issue, expected and out of scope.

### E. Lantern (`tools/lantern`)

- **Keep the dev stub** (`src/lib/stage.ts:225-249`) as a labeled dev shortcut. Reconcile it
  with the real mechanic: forcing night should put the story in the same state the real
  transition produces (day 5, at T7, budget irrelevant), not just flip the variable.
- The two new screens arrive through the normal build; Lantern reviews them like any screen.
  No new visual language.

### F. Tests — encode the rulings, not the numbers

- Night is entered only from `home_hub_final` on day `days_per_life`, only by choice.
- No path from night back into any day-cycle knot (one-way final sequence).
- The vignette is reachable both early (by choice) and by completing all night scenes.
- `advance_time()` still never produces night.
- Day 1–4 evenings still land on the normal `home_hub`/calendar (regression guard).
- Walker calibration assertions per section D.

### Out of scope

`SC-T6-01` / walk.ts scarcity · prose for the vignette and final screen (prose pass) ·
wiring real results into the final screen (blocked on `role_goals_advanced` compiling) ·
any visual/UI change in Lantern beyond the two screens appearing.

### Build order

A (GDD addendum) → B (data) → C (emitter) → D (walker + rebuild `out-calib`) → F (tests) →
E (Lantern reconcile). Verify per PAUSED.md's standing rule: `npm test` + `npx tsc --noEmit`
in both `tools/resolver` and `tools/lantern`, plus `resolver build` + `resolve-week`
regenerating `out-calib` without throwing.

---

## Build prompt (APPROVED plan — paste into a fresh session)

```
Read ProjectOS/game-project/PAUSED.md (Task 6, and the standing verification rules in
"START HERE"), then ProjectOS/game-project/plans/2026-08-01-festival-night-transition-plan.md
in full. That plan is APPROVED by Roc (2026-08-01) — build it. Do not re-open the rulings or
redesign; if the code contradicts the plan somewhere material, stop and ask Roc rather than
improvising.

Work on the existing branch lantern-functionality-pass.

Build in the plan's stated order:
  A. GDD addendum (gdd/03-core-loop.md day-5 exception + ratified "final sequence"
     definition; gdd/08-levels.md Festival Grounds + the two new screens).
  B. Two new screens in tools/resolver/data/screen-specs.json — T9 Festival Vignette and
     FS Final Screen — per the plan's section B.
  C. tools/resolver/src/ink.ts per section C: day_end intercepts BEFORE the day increment
     on day == days_per_life and diverts to a new hand-authored home_hub_final knot (no
     calendar; only option "Go to the Festival night", the story's sole writer of
     TimeOfDay = night); T7 suppresses exits at night and gains the always-available
     vignette choice plus the all-scenes-complete auto-divert; new hand-authored
     festival_vignette and final_screen knots (placeholder prose only — tagged #screen:T9 /
     #screen:FS; real prose is the prose pass's job); the old SYS-CYCLE-END "-> END" is
     retired — the final screen is now the only way a life ends.
  D. Extend tools/resolver/src/walk.ts only as far as the emitted ink requires, then
     rebuild out-calib (build --emit-story + resolve-week).
  F. Tests that encode the rulings per section F (night only from home_hub_final by choice;
     one-way final sequence; vignette reachable early and by completion; advance_time never
     yields night; days 1-4 regression-guarded).
  E. Reconcile Lantern's dev stub (tools/lantern/src/lib/stage.ts:225-249): keep it, but
     forcing night must produce the same state as the real transition.

Acceptance (section D): SC-T7-toby and SC-T7-ilsa reachable; bounds.hit false; whole-search
paths at the current canonical baseline of 1434; Ilsa's walked bond at 28.7 and NOT >= 36
(high-band watch, PAUSED.md). [Re-baselined 2026-08-02 per Roc's ruling; prior figures
(~3146 paths / 34.3 bond) not reproducible, producing script deleted.] SC-T6-01 remains
unreachable — expected, out of scope, leave it.

Verify: npm test + npx tsc --noEmit in BOTH tools/resolver and tools/lantern (resolver is
node --test — use npm test, not vitest), and resolver build + resolve-week regenerate
out-calib without throwing.

When done: update PAUSED.md Task 6 (built state, results, what's open) per the pause
protocol, and report the calibration numbers against the acceptance targets.
```

---

## Prompt for the planning session (superseded — kept for the record)

```
Read ProjectOS/game-project/PAUSED.md (Task 6) and
ProjectOS/game-project/plans/2026-08-01-festival-night-transition-plan.md first — they contain
verified code citations and full context; do not re-derive them.

This is a PLANNING task, not a build task. Do not write code or edit game data.

Goal: produce an approved plan for the day-5 evening → night transition in the resolver's ink
emitter, so the festival-night scenes (SC-T7-toby, SC-T7-ilsa) become reachable in real play.

Roc has already ruled on the three core questions (recorded in the plan file above, "The GDD
gap" section): night is entered by player choice from the day-5 home hub after evening's
budget exhausts; NPC festival-night scenes are playable and the vignette plays when all are
done or when the player starts it early; the vignette ends in a summary/results screen that
prompts a new game. Do not re-ask these.

Also ratified (2026-08-01): the "final sequence" definition in the plan file above — night is
a one-way ending sequence started by the player's choice from the day-5 home hub, leading to
the final screen (summary/results + restart prompt); no return to the day cycle without a new
game. Use "final sequence" as the GDD term; do not use "terminal beat".

Step 1 — surface the edge cases the rulings leave open and get Roc's calls, e.g.: can the
player refuse to start the final sequence entirely (and what happens then — does
day_end/end-of-cycle still fire)? Does the go-to-night choice consume anything? Where do the
vignette and final screen live in the data model (T7 nodes? new screens?)?

Step 2 — propose the GDD addendum (gdd/03-core-loop.md day-5 exception, gdd/08-levels.md
Festival Grounds entry, the ratified rulings and the "final sequence" definition) and get it
approved before the code plan.

Step 3 — only then design the change plan for tools/resolver/src/ink.ts (emitMoveTo, day_end,
advance_time) and anything downstream, including how Lantern's dev stub
(tools/lantern/src/lib/stage.ts:225-249) reconciles with the real mechanic, and how the
walker/calibration regression (bounds.hit, path counts, Ilsa's bond) is expected to resolve.

Out of scope: SC-T6-01's week-planner scarcity issue (tracked separately in PAUSED.md Task 5).
Do not build anything in this session — the deliverable is an approved plan document in
ProjectOS/game-project/plans/.
```
