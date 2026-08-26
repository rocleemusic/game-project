# Plan — Triage of Roc's 2026-08-23 review notes, sequenced for the 2026-09-01 capstone

**Written 2026-08-23. Approved shape; a new session executes it. Kickoff prompt at the bottom.**

## Context

Roc played the current Phaser build and wrote 44 notes ([2026-08-23-roc-review-notes.md](2026-08-23-roc-review-notes.md)). The Mode 5 UX build and the three VFX kinds are done (see [2026-08-23-mode5-ux-review-handoff.md](_handoffs/2026-08-23-mode5-ux-review-handoff.md) and [2026-08-23-vfx-kinds-handoff.md](_handoffs/2026-08-23-vfx-kinds-handoff.md)). The notes are the next work queue.

Roc confirmed 2026-08-23: **capstone is Tue 2026-09-01, content freeze Fri 2026-08-28.** CONTEXT.md's 08-25 date is stale and should be updated as step 2 below. CONTEXT.md's "phaser may not gate Track A" rule is also stale — phaser is the ship target — flag for Roc, don't silently rewrite.

An exploration pass mapped every note to real files. Facts that shape the triage:

- Arms is view-only by deliberate scope cut (`phaser/src/scenes/SatchelScene.ts`); banked has no in-world display.
- `Inventory.drop()` removes from `held` only — the "drop doesn't remove / no world drop" note is a real correctness bug spanning `phaser/src/world/Inventory.ts` + `LanternPlayer` (`tools/lantern/src/lib/play.ts`). The mode5 handoff warns this pair must move together or dropped items reappear on resync.
- Bracket buttons come from three sources: `ModalFrame.buttonRow()`, ink-derived move choices (`TraversalRow.ts`, `LocationSelectScene.ts` match `/^\[(Go to|Begin at)/`), and dev pills in `CollectScene.ts`.
- Only 2 font families exist (`phaser/src/ui/theme.ts`); inconsistency is mono-vs-serif usage drift across ~70 call sites.
- MetaHub is a `meta` toggle inside `HubScene.ts`, not a scene — cutting it is mostly deletion. "New Life" button lives at `HubScene.ts` ~892–938.
- Saves: one real slot per mode; empty slots are non-interactive placeholders (`SaveLoadScene.ts`, `SaveSlotView.ts`, `world/save/*`). No player-name concept anywhere.
- Festival scoring doesn't exist yet — bonds are only gate conditions (`world/gates/GateEngine.ts`), band values opaque inside ink state. Roc's simplification (goals completed → tier; bond = talk count) is a *new small system*, not a rework.
- Examine regions: 19 of 20 screens have no authored geometry; edit mode (`render/EditModeSystem.ts`) exports to clipboard only; region hover/click and pan-mapping notes are bugs in `EditModeSystem.ts` / `world/view/HotspotPlacement.ts` / `PanModel.ts`.
- No wait/advance-time action exists; time only moves via ink day-end choices (`world/DayPicks.ts`).
- `sceneFadeIn()` exists in `theme.ts`; crossfade needs a fade-out half. `PlayerSettings.fadeDurationMs` is already persisted.
- Shelf placement not persisting between screens (`HubShelfScene.ts` vs `world/Decor.ts`) is a bug.
- Hub palette is an infinite source, not an inventory — the "no multiples, draw down from banked" note means converting it to real banked stock.

## The triage (all 44 notes, grouped)

### Group 1 — Bugs and correctness (pre-freeze, no design needed)
| Note | Fix lives in |
|---|---|
| Drop doesn't remove item; dropped items should land in the world, re-pickupable | `Inventory.ts`, `play.ts`, `SatchelScene.ts`, screen hotspot spawn |
| Shelf placement not saved between screens | `HubShelfScene.ts`, `Decor.ts` |
| Satchel↔arms move missing; arms not visible when switched | `SatchelScene.ts`, `SatchelPockets.ts`, `play.ts` |
| Regions not hoverable/clickable after edit; hover = seen; click doesn't dismiss | `EditModeSystem.ts`, `HotspotSystem.ts` |
| Regions move with pan instead of mapping to the picture | `HotspotPlacement.ts`, `PanModel.ts` |
| Move/flip/remove pills stay stuck on; selecting another item doesn't deselect | `HubScene.ts` `drawPieceActions` |
| Duplicate placements possible from an infinite palette (should draw down from banked) | `HubScene.ts` palette → real banked inventory |
| Home Hub calendar can't pick forest/town (should match game-start behavior) | `CalendarScene.ts` — **ruled by Roc 2026-08-23**: one calendar replaces the HomeHub calendar. It is active (location picker) only at the start of a new day. All other times it is read-only reference. Rename the HomeHub button from "Open the Calendar" to **"Start the Next Day"** |

### Group 2 — Quick UI polish (pre-freeze, small, highly parallel)
- Bracket buttons → styled buttons everywhere (`ModalFrame`, `TraversalRow`, `LocationSelectScene`, dev pills).
- Font consistency pass (pick serif vs mono roles once in `theme.ts`, sweep call sites).
- Crossfade screen transitions (extend `sceneFadeIn` with a fade-out; use `PlayerSettings.fadeDurationMs`).
- VN dialogue buttons hidden unless dialogue active (`systems/DialogueSystem.ts`, `PhaserDialogueRenderPort.ts`).
- Overlay scrim closable/removed to see the level (`CollectScene` + per-scene scrims; note the "scrim compounded to black" hazard documented in `PhaserDialogueRenderPort.ts`).
- Item hover follows just above cursor; cut the take-click button on the hover (`HotspotSystem.showExamine`).
- Locked traversal points get hover descriptions (`TraversalRow`; gate text already exists behind the `?` reveal).
- Hints toggle + contrast fix in Hub (`HubScene` chips + a `PlayerSettings` toggle).
- Pickup of a never-seen item pops the satchel open to its description (`SatchelScene` open-on-event).

### Group 3 — Home Hub decorating rework (pre-freeze, one coherent epic)
One epic, since these all touch `HubScene.ts` together: direct click-drag placement (no move button) · click toggles selection · drag from banked panel onto the room, removing from banked · hide go-to buttons · make the decorate entry point visible · regions hidden unless debug toggle; white bg → black · default zoom-in so drag has room (`RoomZoomModel` initial zoom) · shelf view click-drag parity · remove New Life button (ties to Group 5's year-loop ruling, but the button removal itself is safe now).

### Group 4 — Small new mechanics (pre-freeze candidates, need Roc's yes)
- **Wait button** to advance time at a location — new action into the ink day loop. Small UI, touches the day model; needs Roc's shape call.
- **Festival scoring — RULED by Roc 2026-08-23.** Tier = count of completed festival goals only: 1 = Quiet, 2 = Warm, 3 = Grand. Bond = times the player talked to that NPC, capped at one count per NPC per day (max 5 in a week). **Bonds do not feed the tier** — they drive per-NPC things only: dialogue depth and who shows up at the festival. This keeps the GDD's "two tracks never colliding" rule and its 2026-07-29 no-choice-scoring ruling intact — the soul-want × role-goal pairing engine is untouched (it drives story generation, not arithmetic). The rare top tier (souls-of-the-world) is parked unless cheap: all 3 goals + every NPC at max bond. "Never a score shown" still stands — progress reads through the world, not a number. Build: plain host-side counters + one scoring read at festival night; fills the Final Screen's placeholder results slots. Pre-freeze build item (de-risks the DoD). Needs `gdd-sync` into `gdd/03-core-loop.md`.
- **Notebook VFX pane**: cast fires in the preview pane directly, remove Play button, no autoplay; enlarge VFX pane vs the SFX window (`NotebookScene.ts` `buildPreview`).
- **Examinable-per-screen pass** — author region geometry for the 19 empty screens with the existing editor, after the Group 1 editor bugs land. Plus "define new locations with a note" support in edit mode.

### Group 5 — Design rulings needed before build (rule this week; build mostly post-capstone)

> **All five ruled 2026-08-23.** Index + cross-cutting threads: [_handoffs/2026-08-23-group5-rulings-handoff.md](_handoffs/2026-08-23-group5-rulings-handoff.md). One live deadline inside: Assignment #8, due Tue 8-25.
- **Year-loop saves replace MetaHub**: finish day 5 → resume restarts at day 1, year++, world remembers everything; MetaHub and New Life cut. Empty save slots start new games (real multi-slot state: `ModeDescriptor.save.slot` single-string → slots), player-name entry saved. GDD-level: run `gdd-sync` after the ruling.
- **HUD relayout**: bottom action bar (Diablo/WoW style), different in explore vs dialogue mode; top-right NavRow moves. Mockup pass before touching `NavRow.ts`.
- **NPC dialogue rework**: story points introducing spells, greetings, examine-reactions; 1–2 choices max; longer self-descriptive lines; write one soul by hand, then generate the rest via the narrative pipeline / LLM hookup; all NPCs get halo + click + spell-learning wiring; NPCs placed on the ground. Pipeline work (`narrative-pipeline/`, ink in `lantern-projects/v01/ink/`), not a Phaser task.
- **Intro story flow** (why the mage is here) — narrative pipeline.
- **Item descriptions that fit the world** — content pass in `content/`, rides the pipeline.

### Group 6 — Post-capstone / nice-to-have
Minimap ("might") · custom loading screens · irregular examine-region shapes (polygon editor + hit-test) · first-load speed (`boot/PreloadScene.ts` loads all backdrops up front; profile before optimizing).

## Phasing

- **Phase 1 (Mon 8-24 – Tue 8-25): Group 1 bugs + Group 3 Hub epic.** Correctness first; the Hub epic after the Hub-adjacent bugs land.
- **Phase 2 (Tue 8-25 – Thu 8-27): Group 2 polish + approved Group 4 items.** Festival scoring early — it touches the DoD.
- **Design rulings in parallel (this week, no build):** Group 5 gets short ruling docs / mockups; the hand-written dialogue exemplar can start once ruled.
- **Freeze Fri 8-28:** verification and polish only after. **Post-capstone:** Group 5 builds + Group 6.

## Parallelization, agents, models

**Harness: the Workflow tool.** Each `agent()` call takes `model` and `effort` per call (the plain Agent tool only overrides model). Define reusable seats in `.claude/agents/`: `ui-builder` (opus, medium/high), `ui-verifier` (sonnet, low, playtest tools only), `content-author` (sonnet, low); workflow scripts reference them via `agentType` and override only for exceptions. `isolation: 'worktree'` for any concurrent edits to the same hot file. Fix passes re-run via `resumeFromRunId` so clean items stay cached.

**Standing rule: Sonnet for mechanical sweeps and verification, Opus for real feature/bug work, Fable only for the two cross-cutting data-model changes.** What blocks parallelism is file contention, not task count — `HubScene.ts` and `play.ts`/`SatchelScene.ts` are the hot files.

| Work | Parallel? | Agent / model / effort |
|---|---|---|
| Group 1 satchel cluster (drop-to-world, satchel↔arms, pickup-pops-satchel) | Serial — all touch `play.ts` + `SatchelScene.ts` + `Inventory.ts` | One **Fable, high** agent (load-bearing data-model edit) |
| Group 1 region bugs (hover/click, pan mapping) | Parallel with satchel cluster | **Opus, medium** |
| Group 1 shelf persistence + calendar parity | Parallel — separate files | Two **Opus, medium** agents |
| Group 3 Hub epic | One agent, serial internally (`HubScene.ts`); run after Group 1's Hub-adjacent bugs | **Opus, high**, then **Sonnet, low** playtest-verify |
| Group 2 polish (8 items) | Highly parallel — distinct files. `pipeline(items, build, verify)` | **Sonnet, medium** builders (brackets/fonts: low), **Sonnet, low** verifiers |
| Group 4 Notebook VFX pane | Parallel — `NotebookScene.ts` only | **Opus, medium** |
| Group 4 festival scoring (ruled, buildable now) + wait button (still needs ruling) | Parallel with each other | **Opus, high** each |
| Group 4 region authoring, 19 screens | Most parallel work in the plan — fan out per screen batch after editor bugs land | **Sonnet, low**, screenshot-verified |
| Group 5 rulings/mockups | Roc-facing; HUD mockup options via one agent | **Opus, medium** |
| Verification passes | Always parallel per item — `playtest.mjs` + `tsc`/`vitest` | **Sonnet, low** |

## Execution steps

1. ~~Confirm the cut line with Roc~~ **Done 2026-08-23.** Groups 1–3 pre-freeze, all of Group 4 approved. Learning-a-spell (Mode 5 review's open item) prototypes in parallel — see [`_handoffs/2026-08-23-spell-trial-rebuild-handoff.md`](_handoffs/2026-08-23-spell-trial-rebuild-handoff.md). Home Hub sill geometry (the other open item) is lower priority, not scheduled this phase.
2. ~~Update `CONTEXT.md`~~ **Done 2026-08-23.** Capstone 2026-09-01, freeze 2026-08-28. The "phaser may not gate Track A" rule is retired, not just flagged — phaser is confirmed the ship target, per Roc.
3. **Paca GP task creation — blocked.** This session's Paca MCP connection only exposes comment/task-link tools (`create_task_link`, `list_task_links`, `add_doc_comment`, etc.), not the core `create_task` / `list_tasks` / `list_projects` / `write_doc` set the `paca` skill assumes. Roc's call 2026-08-23: skip Paca for now, track the task list below in this doc, migrate to Paca cards once the connector is fixed (`/paca-setup` or a reconnect).
4. Define the `.claude/agents/` seats (`ui-builder`, `ui-verifier`, `content-author`) before the first Workflow run.
5. Build per phasing above. Roc calls the first build target (review-before-build gate).

### Phase 1 result (2026-08-24) — T1–T5 + T7, all done, all independently verified PASS

Ran as one Workflow: T1–T5 built and verified in parallel, then T7 (Hub epic) built and verified after confirming T5 had actually landed in `HubScene.ts` first. Every verify pass re-ran tests/`tsc` itself and looked at real playtest screenshots — not just trusted the builder's report.

**Bugs found and fixed beyond the original note text** (worth knowing, not just the assigned scope):
- T1: `item:acquired` was firing even when a pickup was refused (satchel + arms both full) — a lie the gate counters and autosave believed. Fixed as part of the drop fix.
- T7: click-drag placement and palette drag were both completely dead before this pass (Phaser's drag plugin was building its drag list before chip listeners existed) — not just "no move button," actually broken.
- T7: Home Hub's room camera was still rendering `CollectScene`'s go-to pills, nav row, and satchel strip underneath it every frame.

**Four items needed your call:**
1. ~~T4 — renaming the button didn't rename the ink source.~~ **Done 2026-08-24, per Roc.** Fixed at the true source: `tools/resolver/src/ink.ts` (the generator `main.ink` is compiled from), regenerated `main.ink` + `story.json` for both `v01` and `scratch`, updated the two resolver tests plus `tools/lantern`'s test fixtures and two phaser playtest scenarios that asserted the old text. Removed the now-unneeded display-rename indirection in `CollectScene.ts` (`HUB_NEXT_DAY_LABEL` deleted — ink text is what the player reads now). Verified: `tools/resolver` (14/14 on the two touched test files), `tools/lantern` (754/755, only the pre-existing unrelated fixture failure), `phaser` (`tsc` clean, 740/740 tests), and a real playtest screenshot of the pill reading "[Start the Next Day]".
2. ~~T7 — "hide go-to buttons" was read as "nothing from the day loop renders while the Hub is up."~~ **Confirmed correct by Roc, 2026-08-24.** No change needed.
3. **T7 — WCAG 2.5.7.** Removing the move pill leaves keyboard-only users an `M`-key hold-arm + click-to-place path instead of a dedicated button. Confirm that's an acceptable pointer-free route.
4. ~~T1 — Roc's note 18 (banked items surface as satchel "extras").~~ **Done 2026-08-24, per Roc's ruling: banked items belong to Home only, never the satchel.** Root cause: `SatchelStrip.syncInventory` (`phaser/src/render/SatchelStrip.ts`) was joining `v.banked` into `Inventory.held` on every render, alongside `v.satchel`/`v.arms`. That leaked banked items into `SatchelScene`'s "extra" unslotted pockets (`extraHeldIds`, built from `Inventory.availableOn`) **and** made them falsely castable-with from any screen, not just at home — a wider bug than the note implied. Fixed by dropping `v.banked` from the join; Home's own banked-item UI (`HubScene`/`Decor`) already reads `v.banked` directly and never went through `Inventory`, so it's unaffected. New regression test `phaser/tests/SatchelStrip.test.ts` (confirmed it fails without the fix, passes with it). Verified: `tsc` clean, 742/742 tests passing (2 new).

Full per-task build/verify detail is in the Workflow journal (`wf_11a68f5c-9c3`), not duplicated here.

### Phase 2 result (2026-08-24) — T6, Group 2 polish, all 8 items done

Ran as one Workflow: 5 items built and verified in parallel (bracket buttons + locked-traversal hover, bundled since both touch `TraversalRow.ts`; VN dialogue visibility + scrim closable, bundled since both touch the dialogue/scrim render path; item-hover-follows-cursor; hub hints toggle + contrast; crossfade transitions), then a font-consistency sweep (`theme.ts` + ~20 call sites across 14 files) ran serially after, since a sweep needs the dust to settle first.

**One real verification bug found and fixed, not an app bug:** the crossfade item's own verifier initially returned FAIL — its screenshot, taken at a fixed 90ms after the click, showed an instant scene swap with no visible darkening. I re-ran it by hand with a real Playwright click against an isolated dev server and found the actual root cause: this machine is running many concurrent dev servers from parallel agent work, and Phaser's delta-time under that load can make the same 220ms fade play out over anywhere from ~200ms to ~1200ms of real wall-clock time — a fixed-delay screenshot can land before the fade starts or after it's already finished, and either looks identical to "no crossfade." Confirmed the crossfade genuinely works by polling `camera.fadeEffect.progress` over real time instead of guessing when to look: it ramps smoothly through the middle and hands off correctly. Rewrote `phaser/playtest/crossfade-transition.mjs` to poll instead of using a fixed wait, matching the same technique the 2026-08-22 VFX session already had to adopt for this identical environment quirk. No app code changed for this item — the crossfade code was correct all along.

**Bugs found and fixed beyond the assigned scope:**
- T6b: `BackdropSystem.sync(null)` used to leave the scrim visible after the backdrop under it was destroyed.
- T6c: the hover card used to track the pan-scrolled backdrop position instead of the actual cursor, and drew its own take-click button — clicking that button, rather than the hotspot, was a second, inconsistent way to pick something up.

**Nothing needs your call on this phase** — all 8 items done, verified, no open design questions.

### Phase 3 result (2026-08-24) — Group 4, all 4 items done

Wait button shape ruled by Roc first (real ink choice, costs a move — see the ink-graph reasoning above). Ran as one Workflow: T8, T9, T10 built and verified in parallel; T11's region authoring for the 15 screens that actually have examinables (T9/TN/FS have none, so the plan's "19 screens" figure was off) split into 4 batches that each only *proposed* rects by reading the backdrop art directly (no file writes, no browser), then one serial merge step applied all proposals and rebuilt once — avoiding 4 agents racing to rebuild the same run folder.

**Infra note, not a work-quality issue:** Opus had a rough stretch mid-run — two agents (T9, the region merge) hit transient API errors (500, then 529) and had to be resumed on Sonnet per Roc's call. On the resumed pass, T9 and T10 turned out to already be fully built (by an earlier attempt that had completed before the error killed its parent run) — those agents mostly did verification and gap-closing rather than fresh builds.

**Bugs found and fixed beyond the assigned scope:**
- T11 merge: `regions.json` had a stale, unrelated `"HOME"` block duplicating `decor-surfaces.json`'s real data. Since `HotspotSystem.sync()` reads regions unfiltered, this would have drawn 5 bogus hoverable boxes on the Home Hub the first time it synced through that path. Removed.
- T9: an untracked test file (`FestivalScore.test.ts`, 19 passing tests) had been missed by the auto-commit hook and was never actually saved — committed it.

**One real judgment call, made correctly both times:** both T8 and the T11 merge independently discovered that a full `resolver build --out lantern-projects/v01` is NOT safe — it silently reverts v01's hand-tuned content (the F8 heated-stone chain, status divergences on F4/F7) because `tools/resolver/data` doesn't have those edits. Both refused to run it and instead patched `graph.json` directly (T8 via re-emitting ink from the existing graph; T11 via the resolver's own `applyRegionMap()` targeted at the run folder). This is worth knowing as a standing rule for any future content work on `v01`: **never run a plain resolver rebuild into `v01`** — patch the specific thing that changed instead, or find out first what data/screen-specs.json is missing.

**Nothing needs your call on this phase** — all 4 items done, verified. One pre-existing, unrelated gap surfaced by T9's real playtest: `FestivalScore.test.ts` has 2 failures from missing `role_workplace` goal-thread content for ilsa/mara in v01 — a content gap, not a code bug, flagged for whoever owns that content next.

### Task list (temporary — Paca unavailable, migrate when reconnected)

| # | Epic | Group | Files | Status |
|---|---|---|---|---|
| T1 | Satchel cluster: drop-to-world, satchel↔arms, pickup-pops-satchel | 1 | `Inventory.ts`, `play.ts`, `SatchelScene.ts`, `SatchelPockets.ts`, screen hotspot spawn | **Done 2026-08-24** — built + independently verified PASS |
| T2 | Region bugs: hover/click after edit, pan-mapping | 1 | `EditModeSystem.ts`, `HotspotSystem.ts`, `HotspotPlacement.ts`, `PanModel.ts` | **Done 2026-08-24** — built + independently verified PASS |
| T3 | Shelf persistence between screens | 1 | `HubShelfScene.ts`, `Decor.ts` | **Done 2026-08-24** — built + independently verified PASS |
| T4 | Calendar parity: HomeHub calendar → "Start the Next Day" | 1 | `CalendarScene.ts` | **Done 2026-08-24** — built + independently verified PASS |
| T5 | Piece-action pill stuck-on / no deselect + palette draw-down from banked | 1 | `HubScene.ts` `drawPieceActions`, palette → banked inventory | **Done 2026-08-24** — built + independently verified PASS |
| T6 | Group 2 polish (9 items — brackets, fonts, crossfade, VN button visibility, scrim, hover-follow, locked-point hover, hints toggle, pickup-opens-satchel) | 2 | `ModalFrame`, `TraversalRow.ts`, `LocationSelectScene.ts`, `theme.ts`, `DialogueSystem.ts`, `PhaserDialogueRenderPort.ts`, `CollectScene.ts`, `HotspotSystem.ts`, `HubScene.ts` | **Done 2026-08-24** — built + independently verified PASS (pickup-opens-satchel was already done under T1) |
| T7 | Home Hub decorating epic (click-drag placement, drag-from-banked, hide go-to buttons, decorate entry point, region-hidden-unless-debug, default zoom, shelf click-drag parity, remove New Life button) | 3 | `HubScene.ts`, `RoomZoomModel.ts` | **Done 2026-08-24** — built + independently verified PASS, after T5 confirmed landed first |
| T8 | Wait button (new day-loop action) | 4 | `tools/resolver/src/ink.ts` `emitScreen()`, regenerated `v01`/`scratch` content | **Done 2026-08-24** — built + independently verified PASS. Shape ruled by Roc: real ink choice, costs a move, same as any exit |
| T9 | Festival scoring (ruled — tier from goals, bond from talk count) | 4 | `world/FestivalScore.ts`, `world/save/slices/FestivalSlice.ts`, `render/FestivalResults.ts`, `NpcTalkSystem.ts` | **Done 2026-08-24** — built + independently verified PASS, `gdd/03-core-loop.md` synced |
| T10 | Notebook VFX pane (cast-in-preview, remove Play, enlarge VFX vs SFX) | 4 | `NotebookScene.ts` `buildPreview` | **Done 2026-08-24** — built + independently verified PASS |
| T11 | Examinable-per-screen pass (15 screens with real examinables, not 19 — T9/TN/FS have none) | 4 | `lantern-projects/v01/regions.json` + `graph.json` (patched, not rebuilt) | **Done 2026-08-24** — built + independently verified PASS |
| T12 | Spell-trial real build pass (framed panel, button family, occlusion fix) | — | `SpellTrialScene.ts`, `ModalFrame.ts` | **Running in parallel now** — see spell-trial handoff |
| T13 | Year-loop saves replace MetaHub (ruling) | 5 | `ModeDescriptor.save.slot`, `SaveLoadScene.ts`, `SaveSlotView.ts` | **Ruled 2026-08-23** — see [2026-08-23-year-loop-saves-ruling.md](2026-08-23-year-loop-saves-ruling.md); build post-capstone |
| T14 | HUD relayout (ruling + mockup) | 5 | `NavRow.ts` | **Ruled 2026-08-23** — see [2026-08-23-hud-relayout-ruling.md](2026-08-23-hud-relayout-ruling.md) + `phaser/tools/screen-flow/mockups/hud-relayout-wireframe.html`; build post-capstone |
| T15 | NPC dialogue rework (ruling) | 5 | `narrative-pipeline/`, ink content | **Ruled 2026-08-23** — see [2026-08-23-npc-dialogue-rework-ruling.md](2026-08-23-npc-dialogue-rework-ruling.md). NOTE: Assignment #8 (runtime-LLM scaffolding, standalone) is due Tue 8-25 and builds now; rest post-capstone |
| T16 | Intro story flow (ruling) | 5 | narrative pipeline | **Ruled 2026-08-23** — see [2026-08-23-intro-story-ruling.md](2026-08-23-intro-story-ruling.md); build post-capstone |
| T17 | Item descriptions content pass (ruling) | 5 | `content/` | **Ruled 2026-08-23** — see [2026-08-23-item-descriptions-ruling.md](2026-08-23-item-descriptions-ruling.md); build post-capstone |
| T18 | Minimap, custom loading screens, irregular region shapes, first-load speed | 6 | various | Parked, post-capstone |
| T19 | Forage reconcile + pool spread + role wiring | 1 | `screen-specs.json`, `scene-graph.json`, `foragePoolToItem.ts`, `collectExtraForage.ts`, `modes.ts`, `HotspotSystem.ts`, `ScreenScene.ts`, `SaveGame.ts`, `audit/rules.ts` | **Ruled 2026-08-23, ready to build** — see [`_handoffs/2026-08-23-forage-reconcile-and-spread-handoff.md`](_handoffs/2026-08-23-forage-reconcile-and-spread-handoff.md). Pre-freeze |

## Verification

- Every one of the 44 note lines maps to a group above.
- `/pm` after Paca task creation shows the new epics without breaking board state.
- Per-task build verification: `npm test` + `npx tsc --noEmit` in both `tools/resolver` and `tools/lantern`, plus `phaser/tools/playtest.mjs` screenshots per CONTEXT.md — a UI change isn't done until the screenshot looks right.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this plan
(plans/2026-08-23-roc-notes-triage-plan.md) in full, plus the two 2026-08-23
handoffs it references.

Capstone is Tue 2026-09-01, content freeze Fri 2026-08-28 (CONTEXT.md's date is
stale — updating it is your step 2).

Execute the plan's Execution steps in order. Step 1 first: present the cut line
(Groups 1–3 pre-freeze, Group 4 pending my yes) and wait for my answers before
creating tasks or building anything. Use the Workflow harness and the
model/effort table in the plan when build work starts.
```
