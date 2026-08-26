# Build plan — Year-loop saves (T13)

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the build plan and its reasoning, not the current state of the work.

**Written 2026-08-24.** The design authority is
[2026-08-23-year-loop-saves-ruling.md](2026-08-23-year-loop-saves-ruling.md) — everything ruled
there is taken as fact here and not restated. This doc only turns the ruling into ordered,
file-level work. Where something needed a call the ruling doesn't make, it's under
"Needs Roc's word" at the bottom, not decided silently.

---

## ⚠ Timing — first question, before anything builds

The ruling stages T13 **post-capstone** (content freeze Fri 2026-08-28, capstone Tue
2026-09-01), except the New Life removal, which already shipped with T7. **This plan preserves
that staging — it does not move the date.** But a build plan being asked for now may mean the
timeline is being pulled forward. That is Roc's call, not this doc's:

- **If post-capstone stands:** this plan just sits ready. Nothing here is urgent.
- **If pulled forward:** Phase 1 (resolver/ink) and Phase 2 (year read) are safe pre-freeze —
  they add an unreachable-except-by-host-divert knot and a read-only field. Phases 3–5 carry a
  `SAVE_VERSION` bump and a boot-flow change, which is exactly the kind of churn a freeze week
  exists to keep out. Splitting it that way would need Roc's explicit word.

---

## What's on disk today (grounding, verified 2026-08-24)

- **The clock lives in ink.** `tools/resolver/src/ink.ts` `emitMain` owns the day loop:
  `day_start` sets `TimeOfDay = morning` and refills `movesLeft`; `day_end` increments `day`;
  `final_screen` prints the results frame and hits `-> END`. `VAR day = 1` is declared in
  `tools/resolver/src/graph.ts` (~line 175). There is no `year` variable anywhere yet.
- **The host can divert.** `tools/lantern/src/lib/play.ts` has `jumpToAddress(address)`
  (ChoosePathString, ~line 1113). `phaser/src/ink/InkBridge.ts` wraps the player but exposes no
  jump today.
- **Save layer.** `phaser/src/world/save/SaveGame.ts` — `SAVE_VERSION = 2` (bumped 1→2 in T19,
  2026-08-23, the precedent this plan copies), `SaveGame.slot` is one string, `SaveClockDisplay`
  / `SaveSlotInfo` carry `day` + `timeBlock` (display-only, never restored). `InkClock`
  (`InkStatePort.ts`) reads `day`/`timeBlock`/`movesLeft` off `LanternPlayer.view()` and has no
  writer — `tests/SaveLoad.test.ts` enforces no `setVar` under `src/world/save/**`.
- **Slots.** `phaser/src/mode/ModeDescriptor.ts` — `save: { slot: string, autosaveOn }`;
  `modes.ts` gives mode5 `slot: "mode5"`. `phaser/src/scenes/SaveLoadScene.ts` renders 1 real
  slot + 2 non-interactive hatched placeholders (its own header calls this "honest, not a
  stub"); `phaser/src/world/SaveSlotView.ts` is the pure view behind it. `SaveStore.ts` already
  keys by slot string (`phaser-probe/save/v1/<slot>`) and `list()` already walks every key — the
  store needs almost nothing for multi-slot.
- **Discovery counters.** Spells learned already rides in the `knowledge` slice (SaveSlotView
  reads it). Items collected is readable from `inventory.everHeldItemIds` (already a top-level
  save field — no new field needed). Festival tiers reached is persisted **nowhere** —
  `FestivalScore.ts` computes the tier at festival night and no slice keeps a cumulative record.

---

## Phase 0 — one spike before committing to the shape

**Verify `ChoosePathString` into a knot works after `-> END` on the real story** — via
`LanternPlayer.jumpToAddress` against a play-through that reached `final_screen`. inkjs is
expected to allow this (ChoosePathString resets the callstack), but the whole rollover hangs on
it, and it costs one throwaway test to know.

- If it works: the ruling's shape stands exactly as written — host diverts, ink never offers
  "begin new year" as a choice, so `tools/resolver/src/walk.ts` and the whole week-walk test
  suite never see it and stay untouched. That invisibility is a feature; keep it.
- If it doesn't: the fallback is `final_screen` not reaching `-> END` (parking on a sticky
  choice or `-> DONE` instead). That changes emitted ink semantics and goes to Roc before
  building — see "Needs Roc's word".

**Done when:** a `tools/lantern` test proves jump-after-END lands in a knot and play continues.

## Phase 1 — resolver/ink: the `begin_new_year` entry point

The load-bearing ruled decision: the story resets its own clock. Files:

- `tools/resolver/src/graph.ts` — `declare("year", "VAR year = 1")` beside the existing
  `declare("day", ...)`. It rides `graph.variables` into `state.ink` like every other VAR.
- `tools/resolver/src/ink.ts` (`emitMain`) — a new hand-authored knot, sibling to
  `home_hub_final` / `final_screen`:

      === begin_new_year ===
      ~ year = year + 1
      ~ day = 1
      ~ pickedStartScreen = "none"
      -> day_start

  `day_start` already resets `TimeOfDay` and `movesLeft`, so the knot resets only what
  `day_start` doesn't. Nothing diverts to it and no choice offers it — host-divert only.
- Rebuild `tools/resolver/out-calib` and `lantern-projects/v01` (`build --emit-story` +
  `resolve-week`), per the standing regeneration commands in `CONTEXT.md`.

**Done when:** emitted `main.ink` carries the knot; a lantern-level test drives a week to
`final_screen`, calls `jumpToAddress("begin_new_year")`, and reads back day 1 / morning / full
moves / year 2 with `KnownPhrases`, bonds and satchel intact; resolver `npm test` is no worse
than its 6 pre-existing `walk.test.ts` failures (documented in the 2026-08-24 forage handoff —
do not conflate them with this change).

## Phase 2 — the year becomes readable (never writable)

- `tools/lantern/src/lib/play.ts` — `view()` exposes `year` the same way it exposes `day`
  (a variable **read**; the no-write rule is untouched). Also confirm `syncDay`'s day-file swap
  behaves when day drops 5→1 across the boundary (it selects by day number, so year-2 day-1
  should re-apply day-1 presence — verify, don't assume).
- `phaser/src/world/save/InkStatePort.ts` — `InkClock` gains `readonly year: number`.
- `phaser/src/world/save/LanternInkStatePort.ts` — `clock()` passes it through.
- `phaser/src/world/save/SaveGame.ts` — `SaveClockDisplay` and `SaveSlotInfo` gain `year`,
  same frozen-display-read rule as `day`/`timeBlock` today (written at capture, never restored —
  the ruling states this explicitly). `SaveStore.list()` passes it through.

Because `year` lives inside `ink.storyStateJson`, save → close → resume restores it for free —
no restore-path work exists in this phase at all.

## Phase 3 — slot set + player name (the schema change)

**One `SAVE_VERSION` bump covers phases 2–4 together: 2 → 3**, dated comment naming this ruling,
matching the T19 precedent exactly (bump + refusal, never coercion). These phases land in one
build window so the version only moves once.

- `phaser/src/mode/ModeDescriptor.ts` — `save.slot: string` becomes
  `save.slots: readonly string[]`; `phaser/src/mode/modes.ts` gives mode5
  `["mode5-1", "mode5-2", "mode5-3"]` (see "Needs Roc's word" for the shape confirmation).
- `phaser/src/world/save/SaveCoordinator.ts` — **unchanged in shape.** A coordinator still owns
  exactly one slot; which slot is now chosen at boot and passed in. The chosen slot rides the
  scene-data chain (`SaveLoadScene` → `CollectScene.init`), and
  `CollectScene.startSave()` (~line 881) reads it from scene data instead of `mode.save.slot`.
- `phaser/src/world/save/SaveGame.ts` — `SaveGame` gains `readonly playerName: string`;
  `SaveSlotInfo` gains it too (the slot list shows "Roc — Year 2, Day 3 · evening").
  `SaveCoordinatorDeps` gains `playerName` so `capture()` can stamp it.
- Old saves: the existing single-slot `"mode5"` key keeps sitting in localStorage untouched —
  version-2 saves are refused as `version-mismatch`, and `SAVE_KEY_PREFIX` stays `v1` (the
  store's own header says old saves are left where they are, not overwritten). No migration.
- Tests, per the T19 precedent list: `phaser/tests/SaveLoad.test.ts` gains a
  version-2-save-refused regression (mirror of the existing version-1 test);
  `phaser/tests/SaveSlotView.test.ts` updates for name/year; the no-`setVar` sweep needs zero
  changes (nothing in this plan writes an ink variable). `phaser/ARCHITECTURE.md` and `GAPS.md`
  updated in the same pass, as T19 did.

## Phase 4 — the slot board becomes real (UI)

- `phaser/src/scenes/SaveLoadScene.ts` — the 3-column grid stops being 1 real + 2 dead: each
  column binds to one entry of `mode.save.slots`. Filled slot: name, year, day/block, spells,
  Resume / Start over (existing two-step confirm survives). Empty slot: interactive "Begin a new
  life here" — **this is what replaces New Life**, per the ruling. Picking an empty slot asks
  for the player name, then routes to `LocationSelectScene` with the chosen slot in scene data.
- Boot flow changes: today the scene passes straight through when nothing is saved. With a slot
  set + name entry, the board has to show even on first boot (there is no save to resume, but
  there is a slot to pick and a name to type). Flagged below — it changes the documented
  pass-through behaviour (b) in the scene's own header.
- `phaser/src/world/SaveSlotView.ts` — gains `name` and `year`; `buildSaveSlot` reads them off
  the save. Pure, testable, no invention (its standing rule).
- Name entry: smallest thing that works — a keyboard-captured text field on the board itself
  (Phaser text + keydown capture, same scene). No new scene unless it fights the board layout.

**Done when:** a real playtest creates three independent lives with three names, resumes each,
and the slot cards read "«name» — Year N, Day D · block".

## Phase 5 — rollover screen + discovery summary

- Trigger: `final_screen` (host already draws `phaser/src/render/FestivalResults.ts` there).
  After the results panel, the discovery summary: "You found X of N spells, collected X of N
  items, and reached X of N endings. There is still more to discover!" with **Continue your
  exploration in the next year** and **Return to main menu**. New file:
  `phaser/src/render/YearRollover.ts`, same owns-one-container draw discipline as
  `FestivalResults`.
- Counters:
  - Spells — `knowledge` slice count vs `magic.spells.length` (both already exist).
  - Items — `inventory.everHeldItemIds.length` vs a total-items denominator (source of N is an
    open question below).
  - Endings — festival tiers reached, cumulative across years: **new slice**,
    `phaser/src/world/save/slices/DiscoverySlice.ts` holding `tiersReached: string[]`
    (subset of quiet/warm/grand), written when `final_screen` is reached, registered in
    `CollectScene.startSave()` beside the others. Rides `slices` — no new top-level field, per
    the ruling's own schema note.
- Continue → new `InkBridge.beginNewYear()` (wraps `player.jumpToAddress("begin_new_year")` +
  `runToChoice` + commit). The host only diverts; it writes nothing. Autosave fires on the
  resulting screen change, so the year boundary is saved the moment it happens.
- Main menu → `ModePickerScene`, no save writes.
- Explicit rollover (ruled): a save captured at `final_screen` restores back to the rollover,
  because ink state is parked there and the host redraws results + summary whenever the current
  screen is FS. Verify in the playtest rather than assuming.

**Done when:** a scripted playtest plays to festival night, sees the summary, saves + reloads
back onto the rollover screen, presses Continue, and lands on Year 2 Day 1 morning with
inventory, knowledge, decor and bonds intact and the moves budget full.

## Phase 6 — verification and closure

- `npx tsc --noEmit` + `npm test` in `phaser`, `tools/lantern`, `tools/resolver` (the standing
  three, per `CONTEXT.md`).
- New playtest scenario under `phaser/playtest/` (t13-year-rollover) driven by
  `phaser/tools/playtest.mjs` — screenshots checked by eye, per the standing UI rule.
- **Run the adversarial QA agent** (`npm run adversary`) — this touches save and the day loop,
  which is its named trigger list.
- Run `gdd-sync` — the ruling itself says the year loop is a core-loop change and names this
  step.

---

## Needs Roc's word

1. **Timing** (top of doc): does asking for this plan now pull T13 forward, or does
   post-capstone staging stand? If forward: are Phases 1–2 allowed pre-freeze while 3–5 wait?
2. **Slot-set shape:** recommendation is explicit `save.slots: ["mode5-1","mode5-2","mode5-3"]`
   in `modes.ts` (data, not derivation — matches how descriptors hold everything else). Confirm,
   or name a different shape.
3. **Boot flow:** the slot board must now show on first boot (slot pick + name entry replace the
   old silent pass-through to day 1). Recommendation: always show the board for slot-set modes.
   Confirm — it changes a documented behaviour of `SaveLoadScene`.
4. **Items denominator:** "X of N items" needs an N. Candidates: the run's forageable item set,
   or the full `content/` item library. Recommendation: the run's own obtainable set (a
   denominator the player can actually finish), but this is a design fact, not a plumbing one.
5. **`final_screen`'s closing line** — "Start a new game to live it again." (`ink.ts`, emitMain)
   contradicts the rollover once it exists. It's resolver-emitted placeholder prose;
   recommendation is to change it in Phase 1, but prose near a freeze is Roc's call.
6. **Only if Phase 0 fails:** if inkjs refuses ChoosePathString after `-> END`, `final_screen`
   must stop reaching END, which is an emitted-ink semantics change the ruling didn't
   anticipate. Comes back to Roc before any workaround builds.
7. **Player name into ink** is deferred to T15 by the ruling — noting here so T15 inherits it
   eyes-open: the no-`setVar` rule applies there too, so the name will need an ink-side
   mechanism (e.g. an EXTERNAL the story pulls, not a host push). Not this build's problem;
   should not be forgotten either.
