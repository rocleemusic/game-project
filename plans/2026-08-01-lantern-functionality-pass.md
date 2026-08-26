# Lantern — functionality pass (overnight gauntlet)

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the design rationale and the rulings behind it, not the current state of the work.

## Context

Lantern reached "mechanically finished" on 2026-07-31 and Roc reviewed it for the first
time as a user, recording ~20 defects in a screen-capture (`C:\Users\rocle\Desktop\lantern-notes`).
Read against the GDD, those defects share one root: **the tool does not simulate the game's
day.** Time only advances when you walk, the day file never swaps when `day` increments, and
there is no home, no calendar, and no move budget on screen. Everything downstream — NPCs who
appear at a time of day, the festival scenes gated on day 5, scenes that should be startable
on day 2–4 — is unreviewable as a consequence, not as a separate bug.

Four GDD systems also have no tool surface at all, and Roc put all four in scope.

The intended outcome: a Lantern in which a whole week can be played the way the GDD describes
it, and every finding recorded in one place.

**Roc's rulings for this run**
- Branch **before** any change. No verification gates — let it run, sort out fallout in the morning.
- Reference standard for critics: `gdd/*.md` + `narrative-pipeline/templates/*.md`.
- Max **3 loops** per dimension. **Functionality is the goal — visuals are already good enough.**
- **Clock:** `morning → afternoon → evening` are the playable blocks. `night` is **not** a normal
  block — it is festival night, the terminal beat of day 5 only.
- **Move budget: 3 moves per block**, not per day. Picking the start location spends move 1, so a
  block visits 3 locations. Three blocks, then return home.

---

## Step 0 — branch first

```
git checkout -b lantern-functionality-pass
```
Nothing else happens until this succeeds. The run rewrites game data and rebuilds `out-calib`.

---

## The eight dimensions

Each is a gauntlet fan-out unit. Files below are the entry points found by exploration, not an
exhaustive list.

### D1 · Clock and day model
`resolver/src/ink.ts` · `resolver/src/graph.ts` · `lantern/src/lib/play.ts` · `lantern/src/lib/stage.ts`

- `LIST TimeOfDay`: rename `midday` → `afternoon` (`graph.ts:103-111` emits it). Keep `night`,
  but it becomes reachable **only** as day 5's terminal.
- `movesLeft` resets **per block**, not per day. Today `day_start` sets it once (`ink.ts:426-478`,
  `emitMain`) and every exit does `~ movesLeft = movesLeft - 1; ~ advance_time()` (`ink.ts:220-223`).
  **Moves must stop advancing time.** A spent budget advances the block; a spent evening returns home.
- `stage.ts:227` `TIME_BLOCKS` is a 3-element cycle that returns to `morning` — it can never reach
  `night`. Align it to the new model.
- **Lantern never swaps day files.** `applyDay` is called only from the constructor (`play.ts:114`)
  and `reroll` (`App.tsx:362`); `run.days` is loaded (`bridge.ts:35`) and its only use in the entire
  app is a header label (`App.tsx:887`). Play into day 2 and presence is still day 1's. Re-apply the
  matching day file whenever ink's `day` changes, next to the existing `syncClock` (`play.ts:227-235`).
- Header shows **day · time block · moves left**. `movesLeft` is currently rendered nowhere.

### D2 · Home hub, calendar, and the closed loop
`resolver/data/screen-specs.json` · `resolver/src/ink.ts` · `lantern/src/App.tsx` · `PlayPane.tsx`

- Add the **Home Hub** as a real screen — GDD `08-levels.md:24-29`. Day's end returns there
  (`03-core-loop.md:14`, `06-world-and-progression.md:26`).
- Add the **calendar**: at home you pick tomorrow's location. This writes
  **`DayInput.picked_location`** — documented since the resolver was written as "the location the
  player picked the prior evening" (`resolver/src/types.ts:277-297`) and **written by nothing to
  date**. The NPC guarantee floor keys off it (`day.ts:143,175-178`), so it has never fired in the tool.
- **Festival Grounds is not a start location.** `main.ink:38` emits `[Begin at Festival Grounds]`;
  GDD `08-levels.md:20-22` calls it "the final screen".
- Close the other half: `reroll` ignores all three of its own arguments (`App.tsx:812` vs the
  `onReroll(slot, life, day)` signature at `PlayPane.tsx:39`) and just re-reads `day.json`. Feed it
  the real inputs plus `world.movedThreads()` so `DayOutcome.moved_threads` reaches `applyOutcome`
  (`resolver/src/week.ts:41-48`).

### D3 · Play surface fidelity
`lantern/src/components/PlayPane.tsx` · `lantern/src/lib/play.ts` · `lantern/src/lib/tags.ts`

- **Split location choices from dialogue choices.** Every choice is classified into just
  `spoken | deed` (`play.ts:358-380`), so `[Go to Market Row]`, `[End the day]` and
  `[take up the bellows]` render identically in one flat list (`PlayPane.tsx:16-26`). Movement and
  day-end belong in a horizontal row **above** Continue/Restart.
- **Surface `#lock:`.** 12 locked exits exist in the ink (`t1.ink:26`, `f5.ink:19`, …). `tags.ts:18`
  omits `lock` from `KEYS`, so `parseTags` discards it and `stripTags` deletes it from display.
  Note `ink.ts:185-190` claims `computeHealth` warns about unenforced locks — **it does not; that
  comment is stale.** Show the lock and its key.
- Scenes must be startable on day 2/3/4 — falls out of D1 once day files swap.
- **Exit play mode.** There is no play-mode state: `mode` is derived from whether a Stage or Play
  tab is visible (`views.ts:76-88`), the chip is a non-interactive `<span>` (`App.tsx:880-882`), and
  the session is torn down only by `load()` (`App.tsx:211-213`). Give it an explicit exit.

### D4 · Review surface
`lantern/src/components/NotesPanel.tsx` · `SceneView.tsx` · `WeekView.tsx` · `src/App.tsx`

- **Notes on anything, plus general notes.** The target is hardcoded to the global
  `sceneId ?? screenId` (`App.tsx:844-851`), so a line/choice/option/gather can never be a target,
  a level card needs a *double*-click with no visible selected state (`LevelView.tsx:375,379`), and
  once a scene is selected the screen can never be the target again. A no-target note is blocked in
  three places — the panel (`NotesPanel.tsx:52-53`), the `Note` type (`bridge.ts:16-24`), and server
  validation (`vite.config.ts:168-169`).
- **All flags in one place.** Nothing lists flags. The closest is `SweepPanel`, which mixes them
  with every pending node and never shows the flag note (`store.ts:85-90`). The data is already in
  memory as `run.approvals`. List every flag with its note, clearable and editable from the list.
  Note `resolved` exists on `Note` and **nothing in the UI ever sets it** (`bridge.ts:16-24`).
- **Jump to a whole scene.** The scene picker card already carries `onJump` but `hideActions`
  suppresses the button (`SceneView.tsx:594-596`) — keyboard `j` only. `WeekView` never receives
  `api` at all (`WeekView.tsx:16-20`). Give both a visible jump.
- **Active threads pane.** `WorldState.threadMoves()` / `movedThreads()` / `eventLog()` have **zero
  call sites outside `world.ts`** (`world.ts:119-138`), and `PlayView` does not expose `world`
  (`play.ts:63-77`). Today's only thread UI is static scraping of authored `state_actions`
  (`week.ts:83-94`) — which scenes *can* move a thread, never which *have*.
  Gap to fill: thread ids (`kinbound-absence`) exist only in scene data; the human table in
  `arc-festival-slice.md:60-66` has **no id column**, so there is no id↔description map.

### D5 · Character cards tab
`lantern/src/lib/views.ts` · `src/App.tsx` · `narrative-pipeline/templates/persona-card-schema.md`

New tab. Adding one is mechanical: `ViewId` union (`views.ts:15-24`), a `VIEWS` entry
(`views.ts:55-65`, order = tab order), a `case` in `renderView` (`App.tsx:741-863`), and update
`test/views.test.ts:13`, which asserts the exact id array.

Show all four layers Roc asked for: graph data (`souls` carries only `soul_id`/`name`/`depth`/`deep`
— **there is no `home_screen` field anywhere**), the authored persona card, live play state, and arc
progress.

> **Hard constraint.** `persona-card-schema.md:31-35` and `world.ts:15-25`: the bond score
> "accretes host-side, never on the card, **never surfaced**." Only the coarse band 0/1/2 is
> mirrored. A card may not show a bond number.

> **Blocker to solve first.** No filled persona card exists on disk — only the template. The cards
> need a data source and a path into the run folder.

### D6 · Carry model — notebook and satchel
GDD `03-core-loop.md:14,47`

- **Satchel capacity.** `LIST Satchel` exists and the strip renders "empty"; there is no capacity
  and no day's-end triage ("you carry from the screen only what fits").
- **Pack-triage** — end a day early to bank a full pack plus what you can carry in your arms.
- **The notebook does not exist.** GDD: referenced at any time, holds collected knowledge,
  introduced as a found object in onboarding. `KnownPhrases` is the data; there is no surface.

### D7 · Festival tier and role goals
GDD `03-core-loop.md:31-41` · `resolver/data/tuning.json`

The tier is what a whole week resolves to and the tool shows nothing.
**Do the blocker first:** PAUSED records that `role_goals_advanced` does not compile, so there is
currently nothing to read. Build the data, then the readout.

> Guardrail, from `03-core-loop.md:37,41`: the tier is moved by the soul's **external** role goal.
> The inner arc moves nothing on it, and no stored scalar records which options the player picked.
> A tier readout that sums dialogue picks is the niceness-meter failure the schema forbids.

### D8 · Visual and chrome (bounded — do not gold-plate)
Roc: *"we are good visually, the goal is functionality."* These are the named defects only.

- **Card head coloured by kind, saturated.** Today the hue lives almost entirely in a 3px
  `border-top` (`blueprint.css:43`); the head is only an 8% wash (`--node-wash`, `tokens.css:202`).
  Aliases already exist per kind (`blueprint.css:71-88`).
  **`test/blueprintContrast.test.ts` pins this** — it asserts body-darker-than-head for every kind
  alias, so raising the wash fails it. Re-derive the ramp; do not edit the test to pass.
- **The "jumped to" box — a CSS class-name collision, and a one-line fix.** `MarkerLayer`'s
  region rule is the bare selector `.marker { position:absolute; border:1.5px dashed … }`
  (`app.css:2708-2716`), which also matches the transcript's `<p class="play-line marker">`
  (`PlayPane.tsx:83-95`). With no positioned ancestor anywhere up the tree it resolves against the
  initial containing block — hence floating, not scrolling, and unselectable. Scope it to
  `.marker-layer .marker`, or rename one of the two classes.
- **Stage image too big.** `width:100%; height:auto` with no `max-height` (`app.css:2242-2255`).
  A 55% cap was deliberately removed (`app.css:2224-2229`); restore a cap. Note anything with a
  rect exists **only** as an overlay on the image (`StagePane.tsx:277-278`).
- **Marker placement does nothing** — two silent gates. Toggling "Place markers" resets the region
  to `null` (`StagePane.tsx:296`) and `onPointerDown` returns early when nothing is selected
  (`MarkerLayer.tsx:79-84`); and a click without drag is rejected as under `MIN_SIDE`
  (`markers.ts:15-16,56`). Both need visible feedback. **Do not add a create-region control** —
  sign-off #5 (`MarkerLayer.tsx:14-19`) says geometry only, never minting a region.
- **Header collapses to a dropdown when narrow.** The only layout media query in the app hides
  three text items at 1100px (`app.css:2860-2868`); there is no JS responsiveness anywhere.
  Collapse zone C (`App.tsx:949-997`) and the zone-B toggles. Keep the stale-reload banner visible —
  it is `role="status"`.
- **+/- steppers on numeric variables.** `v.declaration` is a complete type discriminator with no
  new plumbing — `VAR day = 1` numeric, `VAR present_toby = "none"` string, `LIST TimeOfDay = …`
  enumerable. `onSet` already coerces to Number (`App.tsx:331-333`), so no API change.
  Careful: `bondLevel_*` is redirected to a host band (`play.ts:290-298`) — ±1 steps the *band*.
- **Token colour legend.** None exists anywhere (zero hits for "legend"). Natural host is the
  existing `Panel position="top-right"` toolbar (`SceneView.tsx:434`).

---

## Two live bugs to fix in passing

1. **`divert_to` resolves to the wrong address.** `ink.ts:291-298` finds the *scene* containing the
   target node and emits the scene's address, so `CH-T4-02-5-a` emits `-> ilsa.sc_t4_02` — the top of
   the scene, a replay loop. **These are the two errors already in your health panel**
   (`dangling divert: CH-T4-02-5-a → (none)`, `CH-T6-01-4-b → (none)`).
2. **A gated node's set-up line prints ungated** — only options carry the guard (`ink.ts:261`), so
   `CH-T4-02-3`'s "with the second set named…" reads to a player who never named it.

---

## Verification

No gates block the run, but it must **report** these at the end so the morning review is cheap:

```
cd tools/resolver && npm test && npx tsc --noEmit     # node --test, NOT vitest
cd tools/lantern  && npm test && npm run build
cd tools/resolver && node src/cli.ts build --data data --out out-calib --emit-story
                  && node src/cli.ts resolve-week --data data --out out-calib
```
Plus, from `searchReachable`: `bounds.hit`, `scenePathsExplored` (per-scene cap 4000), Ilsa's
achieved bond against the 36 high threshold, and the error/warning counts before vs after.

Baseline to diff against: resolver 130 pass · lantern 516 / 37 files · tsc clean both ·
`bounds.hit false` · `paths 1434/4000` · Ilsa 28.7 · 0 errors.

> Re-baselined 2026-08-02 per Roc's ruling; prior figures (paths 3146, Ilsa 34.3) not
> reproducible, producing script deleted. New figures verified on two consecutive runs of
> `searchReachable` against the current data state (seeded threads, default options).

**The end state is human-verified, not agent-verified:** Roc walks a traversable week. No agent
can screenshot this build — three headless approaches failed and there is no Playwright here.

---

## The gauntlet prompt

```
Build the Lantern functionality pass on branch lantern-functionality-pass, targeting
quality across these eight dimensions: clock and day model; home hub and calendar;
play surface fidelity; review surface; character cards tab; carry model (notebook and
satchel); festival tier and role goals; and bounded visual chrome.

Work with ultracode: fan out one sub-agent per dimension, and run each on /loop. Pair
each with a separate critic sub-agent that judges the result against the GDD
(gdd/*.md) and the schema docs (narrative-pipeline/templates/*.md), using a blind
read where the critic names the specific line of the design doc the implementation
fails. Make the critic strict. Functionality is the bar, not appearance — a dimension
does not pass because it looks finished.

Stop when a dimension's critic finds no remaining GDD or schema contradiction. In all
cases, stop at 3 loops per dimension, then report what remains unfinished rather than
continuing.
```

Review it, then run it yourself when you're ready. I won't.
