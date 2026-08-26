# Session summary — Unreal Step 0 execution, 2026-08-12

**Track B.** Session executed `plans/_handoffs/2026-08-12-unreal-kickoff-prompt.md` against
`plans/2026-08-11-unreal-feature-complete-plan.md`. Work happened in the UE workspace
(`GAME_PROJECT`'s sibling project, resolved via the UE project's `.claude/local-paths.md`) with
the editor live and `unreal-mcp` connected.

**Status: Step 0 (§4) complete and verified. GP-37's ink-side half proven. Nothing submitted to
Perforce.** Two architecture reviews were commissioned and are compared in §6 below.

> **Board is authoritative for status.** This file holds reasoning. Cards touched: GP-36, GP-37,
> GP-152.

---

## 1. Step 0 — all four checks pass

Verified against saved assets on disk and the story actually running, not against tool return
values. That distinction mattered — see §3.

| Check | Result | Evidence |
|---|---|---|
| §4.1 injection round-trip | **PASS** | `story.json` (392,573 B) → asset holds 392,557 chars, `inkVersion 21`. On disk: `v01_story.uasset` 806,219 B |
| §4.2 the story runs | **PASS** | First line `Day 1 begins.` / `#id:SYS-DAY-BEGIN`, then six `Begin at …` choices + `End the day` — `screen_hub`, exactly as §4.2 predicted |
| §4.3 tags generate and register | **PASS** | `v01_story_TAGS.uasset`, **205 tags** — 139 `Ink.Path.*`, 42 `Ink.Origin.*`, 24 `Ink.Variable.*`. Spot-checks hit, including `Ink.Path.t2.ex_shelf` |
| §4.4 tag-drift check | **PASS** | Baseline written; diff proven by seeding a fake add + removal, then reset clean |

**Route A stands. Route B (`.ink` drag-drop import) is not needed and was never exercised.**

### Exit criteria

§4's exit criteria are met: the story plays from an injected asset, and the tag table exists and
is registered. Everything downstream of §4 is now unblocked.

---

## 2. Assumptions from §1 that resolved

| # | Assumption | Outcome |
|---|---|---|
| A3 | Injection produces a runtime-loadable asset | **TRUE.** The single most plan-changing assumption, tested day one as intended. |
| A4 | Inkpot's tag preferences are at usable defaults | **FALSE.** Both default to `false`. See §3. |
| A5 | Bundled inklecate compiles our ink | **Moot.** Route A skips inklecate entirely. |
| A7 | The resolver regen will emit `ex-shelf` into `t2.ink` | **ALREADY LANDED.** `t2.ink:61` has the `ex_shelf` stitch, and `t2.ink:12` gates Toby's SC-T2-09 on `KnownPhrases ? shelf_seen`. §10's only end-to-end proof case exists. |
| A6 | `unreal-mcp` reachable | **TRUE**, and better than assumed — see §3. |

`Content/Ink/v01/` in Perforce was the stale 2026-08-03 copy (§0.4). It has been refreshed from
`lantern-projects/v01/ink/` — 22 `.ink` files, plus `souls/mara.ink` which was new.

---

## 3. Findings that change how the work is done

Five things the plan had wrong, missing, or unknown. All verified in the live editor.

### 3.1 Two APIs return success while doing nothing

Both were caught only because Step 0 verified against disk rather than return values. The kickoff
prompt's warning — *"agents in this project have twice lost work by trusting their own reports"* —
was correct twice over in one session.

- **`save_loaded_asset()`.** `set_compiled_json()` does **not** mark the package dirty, so the
  default `only_if_is_dirty=True` save returns `True` having written nothing. The first injection
  "succeeded" while the 8/03 file sat untouched. Fix: `save_asset(pkg, only_if_is_dirty=False)`,
  then verify the file's **mtime** changed. Size is not a reliable signal — re-injecting identical
  content yields an identical size.
- **`GenerateTAGs`.** Early-returns *setting `bSuccess = true`* when
  `UInkpotPreferences::bAutogenerateGameplayTags` is false, which is its default
  (`InkpotImportPipelineLibrary.cpp`). It returned `True` three times while creating nothing.
  Fix: force the preference on before calling, then assert the `_TAGS` asset exists.

Both fixes are now in `Content/Python/inkpot_inject.py` in the UE workspace.

### 3.2 The gameplay-tag registration wart did not bite

§0.3 caution 2 predicted `Config/DefaultGameplayTags.ini` might need hand-editing because the
plugin's own comment says config saving *"does not seem to work."* It worked. With
`bAutoUpdateGameplayTagsList` on, the ini persisted `+GameplayTagTableList=/Game/Ink/v01/
v01_story_TAGS.v01_story_TAGS` unaided. **The regen procedure is simpler than planned.**

Caveat: `UInkpotPreferences` is `Config=EditorSettings` — per-user and untracked, and its
`SaveConfig` is not a `UFUNCTION`. A fresh machine defaults both flags back to false and tag
generation silently no-ops again. `inkpot_inject.py` therefore forces them on every run rather
than depending on an untracked ini. **On a new machine, this is the first thing to check if tags
go missing.**

### 3.3 `UInkpot` is an Engine subsystem — stories run without PIE

`GEngine->GetEngineSubsystem<UInkpot>()`. The whole story can be driven from editor Python:
`begin_story`, `continue_`, `choose_choice_index`, `to_json`. This is a materially faster test
loop than the plan assumed, and it is how §4.2 and the GP-37 round-trip were proven.

### 3.4 Three Inkpot APIs the plan relies on are not Blueprint-reachable

| API | Declared | Consequence |
|---|---|---|
| `ToJSON` / `LoadJSON` | `UFUNCTION(BlueprintCallable)`, `InkpotStory.h:839,849` | Plan is correct. Persistence is reachable. |
| `GetStorySeed` / `SetStorySeed` | plain C++, `InkpotStory.h:850-851` | §15.2 says these "must be part of the save record." **They need not be** — `storySeed` is serialised inside `ToJSON` (`StoryState.cpp:792` writes, `:175` reads) and survives the round-trip. Verified. |
| `ResetState` | plain C++, `InkpotStory.h:874` | §15.3's restart path cannot call it from Blueprint. Either wrap it in a `UFUNCTION`, or store a pristine `ToJSON` snapshot at first `BeginStory` (~3 KB) and reload that. |

### 3.5 `FInkpotList` does not marshal to Python

`InkpotList.h` declares **no `UPROPERTY` fields** — it wraps a `TSharedPtr<Ink::FValueType>`. So
Python's struct copy is always empty and `ToString` / `ToStringArray` / `ToGameplayTags` all
return nothing, even when the story state plainly holds the member.

**This is a Python-marshalling artifact, not a runtime bug.** Blueprint and C++ receive the struct
natively and are unaffected, so §13's notebook read path and §12's satchel mirror are sound.
**Headless tests must read LIST variables from `ToJSON()["variablesState"]`**, which works.

---

## 4. GP-37 persistence — ink-side half proven

Saved mid-day-1 after clicking the shelf, advanced two moves past the save point into day 2, then
restored via `LoadJSON`.

| | at save | after advancing | after `LoadJSON` |
|---|---|---|---|
| `KnownPhrases` | `shelf_seen` | `shelf_seen` | `shelf_seen` |
| `TimeOfDay` | `morning` | `morning` | `morning` |
| `movesLeft` | 2 | 1 | 2 |
| `day` | 1 | 2 | 1 |
| `storySeed` | 10 | 10 | 10 |
| choices | T2 hub (5) | Home Hub (2) | T2 hub (5) |

**State restored identically, including current position** — so a load restores the view rather
than replaying to it, which §15.2 asks for. A mid-day save is **3,122 chars**.

This also incidentally proves the ink half of §10: clicking the shelf set
`KnownPhrases.shelf_seen`, and the emitter's once-only guard held.

**Still to build:** the UE-side save record (satchel instances, notebook display state, meta-hub
collection, current screen id + map), the restart path, and the acceptance test — bond and
collection persisting across a **new life** with roles re-dealt.

---

## 5. Ruling 3 was made on a false premise

The kickoff prompt states: *"Confirmed: no Fab point-and-click toolkit is installed… go straight
to the native click-layer implementation."* **This is wrong.**

- **494 assets under `/Game/PNCTookit/`** — note the misspelled folder, which is likely why a
  filename search missed it. Migrated 2026-08-11 from `PointandClickAdventureToo`.
- `Config/DefaultEngine.ini` sets `GameInstanceClass=BP_PNCGameInstance_C` **project-wide**.
- `Config/DefaultGameplayTags.ini` registers the toolkit's `DT_GameplayTags`.
- It ships dialogue widgets, inventory slot/item widgets, an advanced software cursor, a developer
  menu, and demo maps.
- The UE workspace's own `Agent/knowledge/ue-project.md` documents the migration in full,
  including that its Project Settings are load-bearing — `BPFL_GameFramework::
  IsFrameworkLoadComplete` casts the Game Instance and every framework actor blocks on it, so PIE
  dies with `Load Complete Timed Out` if they are wrong.

§0.6 checked `Content/Fab/`, which holds character and prop packs only. The toolkit did not arrive
that way.

**Roc's call, 2026-08-12: full audit of the toolkit's systems, evaluating direct use for anything
in the project — not only the click layer. He specifically asked about its camera features and the
panning effect at the start of the ForestDemo map: how it is implemented, and whether it can be
adapted and edited.** Recorded as a comment on GP-36.

---

## 6. The two reviews

Two independent reviews were commissioned: a **full audit of PNCToolkit** (Roc's instruction —
evaluate direct use for anything in the project, with the camera features and the ForestDemo
panning effect called out specifically), and a **native-path plan** written blind to the audit, as
the counterfactual.

**They converge. Both say build native, and both say harvest a small number of specific pieces.**
Neither was told the other's conclusion.

### 6.1 Why PNCToolkit loses — the disqualifier

Not any single §14 criterion. **PNCToolkit is built around a walking pawn with a NavMesh, and this
game has neither.**

`BP_PNCPlayerController::PerformAction` switches on an 8-verb enum. `Pickup`, `Use`, `Give`,
`Talk to` and `Enter` all run `Move to` → `OnForceMoveComplete` → `LookAt` → *then* the interface
event. The character walks to the object and turns to face it before anything happens.
`BP_InteractionVolume` makes it structural: a hotspot is reachable only if the character can path
into its box. Our model is *click region → `ChoosePathGT` → ink continues*, with no pawn at all.

Only **`Inspect`** breaks the pattern — no movement, fires at any distance. That one verb, plus
`BPI_ObjectInteractions::OnInspection` and the cursor's hover trace, is roughly **40 nodes out of a
494-asset framework**.

The other three §14 questions also fail: it assumes it owns **dialogue** (8 structs, 5 widgets, a
function library — dead weight against Inkpot), it assumes it owns **world state**
(`SSceneState`'s per-GUID interactable records duplicate `KnownPhrases`, which §10 forbids
outright: *"Nothing UE-side tracks 'seen'"*), and its **hotspots are not data-driven** — they are
level-placed actors with hand-set properties, with no DataTable spawn path. That last one is the
load-bearing failure, because the whole §6 spine depends on it.

### 6.2 The camera answer — Roc's question

**The ForestDemo pan is two nodes.** Traced to `BP_ForestDemoSceneManager::IntroCutscene`:

```
SetViewTargetWithBlend( IntroCamera1,      BlendTime 0.0,  Linear, exp 0 )   ← snap to start pose
SetViewTargetWithBlend( &lt;current camera&gt;,  BlendTime 45.0, Cubic,  exp 5 )   ← THE PAN
```

No Timeline, no curve asset, no spline, no Sequencer — there is **no `LevelSequence` anywhere
under `/Game/PNCTookit/`**. The "path" is the engine's own view-target interpolation between two
transforms; the "easing" is stock `VTBlend_Cubic` with exponent 5.

**So the effect Roc liked is trivially reproducible and costs nothing to adopt.** The catch is that
in PNC it is not editable in any useful sense:

| Knob | Where it lives | Editable? |
|---|---|---|
| Start pose | a `CameraActor` in the level | ✅ per-instance |
| **End pose** | implicit — whatever camera is current | ❌ not even a named reference |
| **Duration (45 s)** | a pin default inside the graph | ❌ hardcoded |
| **Easing** | pin defaults on the same node | ❌ hardcoded |
| **Path** | none — straight view-target blend | ❌ not authorable |
| Beat timings | five `Delay` nodes, wall-clock, not synced to the blend | ❌ hardcoded open loop |

A second finding compounds this: **`SetPlayerCamera` hardcodes `BlendTime = 0.0`**, and its
function signature has no blend parameter. So PNC's ordinary screen-to-screen camera switching is a
**hard cut, not a blend** — while §5 and §8 both require *"a screen change within a map is a camera
blend."* `BP_AdvancedCamera` even has a `BlendTime` variable defaulting to 1.0 that is never wired
to it.

**The native plan's answer, which is the right one:** a `UCameraPanComponent` on a per-screen
camera rig, with every knob a `UPROPERTY` — duration, easing curve, start/end offset and rotation,
FOV delta, loop mode, start delay — plus an optional spline mode for the one screen that needs a
curved move. Authoring surface is the Details panel of a rig you select in the viewport. Per-screen
overrides live in `DT_Screens_Art`, so pan speed and easing are a spreadsheet cell, which is
exactly §6.2's promise.

**Sequencer was considered and rejected**, and the reason generalises: an authored Sequencer move
lives inside a binary `.uasset`, so it can *never* be driven from a DataTable row — only per-asset.
Same disqualifier for Blueprint Timelines. `UCameraShake` is wrong in kind (additive oscillation
that returns to origin), and `UCameraModifier` is wrong in ownership (global, post-view-target).
Keep Sequencer for a genuinely cinematic beat — the T9→TN festival vignette is the one candidate.

### 6.3 Where the two reviews disagree

Three places. All resolve in the native plan's favour, and the reason is the same each time: **the
audit was scoped to "what can we reuse", the native plan was scoped to "what does the design
need"** — and the pan requirement propagates further than reuse analysis sees.

| Question | Audit | Native plan | Resolution |
|---|---|---|---|
| **Hotspots** | didn't consider screen-space | **world colliders**, because a camera pan invalidates every screen-space coordinate | **Native plan.** This is decisive and it is the argument that should be remembered: *Roc's camera pan requirement is what rules out screen-space hotspots.* A toolkit choice would have locked this in silently. |
| **Cursor** | harvest `WBP_AdvancedCursor` + `DT_CursorProfiles` — "best value-per-hour in the kit" | drop `SoftwareCursors` entirely, use `EMouseCursor::Hand` | **Split it.** Ship `EMouseCursor::Hand` first (minutes, zero coupling); revisit the PNC cursor only if hover tooltips are wanted. The audit is right that it is good; the native plan is right that it is not needed for the click-through. |
| **Camera actor** | duplicate `BP_FixedCamera`, strip the load gate | build `AScreenCameraRig` fresh | **Native plan**, narrowly. The duplicate saves perhaps two hours and inherits a shape built for a follow camera. But it is worth *reading* `BP_FixedCamera`'s rotation-clamp knobs before writing the rig. |

### 6.4 What to harvest — the merged list

Everything here is **by copy, inheriting nothing from a PNC base class**:

1. **The `SetViewTargetWithBlend` pan mechanic** — the 45 s / Cubic / exp 5 recipe, reimplemented
   with the parameters as data. This is the thing Roc liked, and it is two nodes.
2. **Menu and transition widget layouts** — `WBP_MainMenu`, `WBP_LoadGameMenu`,
   `WBP_PlayerSaveTile`, `WBP_SettingsMenu`, `WBP_Transition_FadeInOut`. §17 lists "the shell" as a
   gap with no card; these are ready-made layouts with no ink coupling. Rewrite what they call.
3. **Inventory grid widgets** — `WBP_InventoryManager`, `WBP_InventorySlot`, `WBP_Item` for §12's
   satchel UI. Take the layouts, write the component: PNC's `Inventory Max` is a *per-item* cap,
   not a shared capacity budget, so §12's pack-triage and the three persistence classes have no
   representation in it.
4. **The save-slot plumbing pattern** (not the payload) — `GetUnusedSaveGameName`,
   `SetGameSlot`/`GetGameSlot`/`DeleteGameSlot`, and the load-menu UI. Payload becomes `ToJSON()`;
   `SSceneState` is dropped entirely.
5. **The input-profile idea** — `DT_InputProfile`, nine named modes × five booleans. Reimplement,
   don't inherit; ~1 hour. §13's notebook rule ("opening it must not advance the story") wants
   exactly this.

**Explicitly left behind:** the dialogue system, `BPFL_SaveGame`'s `SSceneState` model,
`BP_DoorBase`, the interaction/volume/manager trio, the verb system, all character and AI classes,
gameplay conditions, hints, puzzles, 2D/parallax, the music component.

### 6.5 The `OpenLevel("ForestDemo")` hazard — verified independently

Both reviews flagged the project-wide Game Instance. I verified the two values that make it bite:

- `DefaultEngine.ini:7` — `GameInstanceClass=/Game/PNCTookit/Blueprints/BP_PNCGameInstance.BP_PNCGameInstance_C`, project-wide, **no per-map override exists for Game Instance**.
- That class's CDO: **`bIsDevelopmentModeEnabled = True`**, **`MainMenuScene = Name("ForestDemo")`**.
- `GlobalDefaultGameMode` is absent, consistent with PNC's deliberate per-map GameMode design.
- `SoftwareCursors` is also wired project-wide (`DefaultEngine.ini:249`).

`ReceiveInit` → if not on `MainMenuScene`, `LoadMainMenu()` → `OpenLevel(MainMenuScene,
bAbsolute=true)`. **Launching `L_Town` in a packaged build absolute-loads the toolkit's demo
forest.**

Three things make it nasty: it **cannot reproduce in PIE today** (dev mode + in-editor takes the
safe branch), so it surfaces only in a packaged build — i.e. **GP-45, the capstone submission**;
turning off dev mode makes it fire in the editor too, and turning it off is the natural move the
moment a real start screen exists; and `bAbsolute=true` is a hard travel.

The audit also traced `ReceiveShutdown` deleting the `Autosave` slot on **every** exit from **every**
map, and `LoadGamePreferences` applying PNC's scalability and sound-mix settings globally. Those
two come from the audit's graph trace and were **not** independently verified here.

**Fix, if native wins:** revert `GameInstanceClass` to the engine default or a rebirth one — one
line. None of the five harvested items above need PNC's Game Instance. **Caveat:** this breaks the
PNC demo maps, so if `ForestDemo` should stay playable as a camera reference, reparent a
`BP_RebirthGameInstance` from `GameInstance` and delete the `LoadMainMenu` branch instead
(~half a day). **Not done — awaiting Roc's call.** `DefaultEngine.ini` is Perforce-tracked and
already open in the default changelist.

### 6.6 The native architecture, in brief

One new **`Runtime` plugin, `RebirthCore`** — not the game module, because a plugin's rollback is
`Enabled: false` rather than a revert, which is what a bake-off wants. Roughly 12 files.

**C++ for data shapes, lifetimes, and unexposed APIs. Blueprint for layouts, tweens, and looks.**

C++: `URebirthGameFlow` and `UScreenPresenter` (both `UGameInstanceSubsystem`, so they survive
`OpenLevel` — the presenter's `PendingScreenTag` has to), `UClickLayer` (`UWorldSubsystem`),
`ARebirthPointerController`, `UInteractableComponent`, `AScreenCameraRig` + `UCameraPanComponent`,
`USatchelComponent`, `URebirthSaveGame`, `URebirthInkLibrary` (the `UFUNCTION` wrappers), and all
the DataTable **row structs**.

Blueprint: every widget, the hotspot leaf blueprints, the camera rig subclasses, the game mode.

**Row structs in C++ is the clearest-cut call in the design**, and the reason is the project's own
documented constraint: *"The MCP server cannot create User-Defined Structs or Enums"*
(`Agent/knowledge/ue-project.md`). That makes BP structs the least automatable asset type here —
hand-clicked per field, unscriptable, un-reviewable — and these are the assets most likely to churn
as the resolver's output changes. A C++ header is one diffable file.

**All C++ lands in one planned day-1 rebuild** (~30 min, editor fully closed). Live Coding cannot
add reflected members, so the discipline is: write the full header set first with stubbed bodies,
build once, then fill bodies under Live Coding. Budget one contingency rebuild around day 5.

**First PIE-reviewable milestone: end of day 2** — a full start→END click-through on a blank map,
no cameras, no maps, no data spine. That is **a day earlier than the plan's §16** (days 3–5),
because the story surface depends only on the already-injected story asset plus the day-1 C++.
Everything visual is downstream of something reviewable.

**Total estimate ≈ 13 days against 13 available** — zero slack, absorbed by the plan's existing cut
order. The native plan does not change that cut list, except to place the camera pan at cut #2.5:
most visible flourish per hour, so not first out, but its absence changes nothing functional.

### 6.7 Corrections to the plan from the native review

Two verified from Inkpot source, one verified at runtime by me:

- **Restart needs no `ResetState()`.** `UInkpot::BeginStory` on the same asset calls
  `StoryFactory->CreateStory(...)` unconditionally (`InkpotStories.cpp:57-63`). **Confirmed at
  runtime:** ran a story to day 2 with `shelf_seen` set, called `begin_story` again — got a
  *different object*, `day` back to default, `KnownPhrases` empty, choices back to `screen_hub`.
  So §15.3's restart is `EndStory` + `BeginStory`, and the day-6 bug it warns about is avoided by
  construction. **The consequence to watch:** the old `UInkpotStory*` is now dangling, so
  **only `URebirthGameFlow` may hold a story pointer; everything else calls `GetStory()` each
  time.** That is the single highest-value invariant in the design.
- **`LoadJSON` does not fire per-variable change events.** `SetJsonToken` replaces the variable map
  wholesale (`StoryState.cpp:78`, `VariableState.h:41`), so anything driven by
  `SetOnVariableChangeGT` goes stale after a load. Bind `EventOnStoryLoadJSON`
  (`BlueprintAssignable`, `InkpotStory.h:984`) and full-re-read. **The plan does not name this
  bug** — it would have shown up as a notebook and debug overlay that lie after every load.
- **`SetListGT` silently no-ops on an origin mismatch** — the GT variant discards
  `ValidateOrigin`'s result (`InkpotStory.cpp:1138-1141`). A typo'd satchel category tag produces a
  mirror that never updates, with no error. Wrap the mirror write and assert. There is already a
  live near-miss in this family: the ink LIST member is `lantern_oil` (underscore) while the screen
  spec says `"lantern-oil"` (hyphen) — the same vocabulary-split hazard as GP-106.

Also worth carrying forward: **`UInkpotLibrary::MapCurrentTagsWithDelimiter(Story, ":")` is
`BlueprintPure`** and parses `#screen:T1` into a `TMap` in one node — the presenter needs zero C++
for tag parsing. And `#screen:` appears exactly **22 times** in the whole ink tree, so the presenter
fires ~22 times a playthrough, not per line.

### 6.8 Recommendation

**Go native. Build `RebirthCore`. Harvest the five items in §6.4 by copy. Decommission PNC's
project-wide config.**

Both reviews reached this independently, from different starting points. The margin is not close:
adopting the framework was estimated at 3–5 days of integration against ~2.5 days for the native
click layer and camera, and it would buy a walking-pawn model the design does not want, a dialogue
system competing with Inkpot, a save model that double-books `KnownPhrases`, four hand-placed
framework actors per map behind an eight-condition load gate, and a live `OpenLevel("ForestDemo")`
on the packaged-build path.

### 6.9 RULED 2026-08-12 — Roc: go native

**"go native, forest demo does not need to work."** So the Game Instance fix is the one-line revert,
not the reparent.

**Done immediately:** `Config/DefaultEngine.ini` now reads
`GameInstanceClass=/Script/Engine.GameInstance`, with the full reasoning written into the file as a
comment block so it is not "fixed" back by a later session. **Note it sits in the *default*
changelist, not CL 33** — that file was already open for edit from prior work and could not be
cleanly separated.

**Not yet done, and each is its own small cleanup:** the `SoftwareCursors` entry still points at
`WBP_AdvancedCursor_C`; `DefaultInput.ini`'s legacy `ActionMappings`/`AxisMappings` are still
present; `DT_GameplayTags` is still registered in `Config/DefaultGameplayTags.ini`. None of them
break anything now. **The ink tag-table registration in that same file must survive any cleanup.**

### 6.10 Two additions from Roc, same ruling

**1. Scene transitions — adopt.** PNC's `PlayTransition(Fade)` → lock input → `Delay` → `OpenLevel`
shape, plus `WBP_Transition_FadeInOut`. §8 needs `OpenLevel` for map changes anyway and a fade is
what hides the load hitch. `BP_DoorBase` around it is still left behind.

**2. Player-driven look-around — NEW REQUIREMENT, not in the plan.** *"camera panning to look
around current area with a limit."*

This is a **different feature** from the authored entry pan and the two must not be conflated:

| | Authored pan | Look-around |
|---|---|---|
| Driver | plays itself on screen entry | player input, continuous |
| Shape | A→B over a duration, with easing | clamped offset from the placed rotation |
| Precedent | ForestDemo's 45 s blend | `BP_FixedCamera`'s `bClampRotation` / `Min`/`MaxRotationLocation` |

Both are per-screen data on the same rig, captured as `FRebirthCameraPan` and
`FRebirthCameraLookAround` in `RebirthCameraTypes.h`. Look-around is **rotation only** — the camera
position never moves — with yaw/pitch limits, an asymmetric limit centre, speed, interp smoothing,
a screen-edge margin to drive it (the cursor is also the click device and must stay usable), and a
`bDisabledDuringPan` flag so the two never fight.

**It also strengthens the world-collider decision.** A look-around camera moves *constantly*, so
screen-space hotspots would be wrong on every frame, not merely during an entry pan.

**3. Clickable areas as placed actors — confirmed as the recommended approach.** Roc's instinct
("placing actors for clickable areas so we could tie them to assets") is exactly the native plan's
design. Refinements: hit detection uses the engine's built-in click path (`bEnableClickEvents` + a
dedicated trace channel + `NotifyActorOnClicked`, ~20 lines) rather than a per-tick trace; all
screens' hotspots coexist in one map and a screen change only toggles
`SetActorHiddenInGame` + collision, so nothing spawns at runtime; and hover highlight uses custom
depth stencil + one post-process outline material, which works on the marketplace meshes without
touching their materials.

### 6.11 Magic casting — a gap, now GP-155

Roc asked whether the plan accounts for casting. **It does not.** Verified three ways:

- The plan mentions magic four times, all readouts or asides — the notebook Spells tab (§13) and
  §12's `world` persistence class. No cast UI, no component selection, no phrase input, no receiver
  targeting, no outcome resolution, no ink seam.
- **The emitted ink has zero casting machinery** — `cast|spell|ignite|mana` returns **0 matches**
  across all 22 `.ink` files.
- `gdd/13`'s MUST row does not name magic.

But `gdd/04` specifies a full system (16 shipping spells, components + phrase, receiver-determined
outcomes, the `ignite` → `item_flame` → `leap` chain) and states **"Magic unlocks screens…
Traversal is gated by what you know, not a flag."** The MUST world scope includes *"Forest
(1 screen + 2 unlocks)"* and gate ids like `G-F7-light` read like magic gates — yet §11 makes
`#lock:` presentational only, so the gates are currently decorative.

**Carded as GP-155 with no tier set** — tier and scope are Roc's. Recommendation recorded there:
out of slice for the capstone, carded as a stated cut, because casting has no ink representation at
all and building it would put a Track A dependency on the critical path 13 days out.

---

*Original recommendation, before the ruling: go native. Roc ruled the same on 2026-08-12.*

---

## 6.12 RebirthCore — built, compiling, not yet run

Roc closed the editor and said build as far as possible. **The C++ spine is written and the module
compiles and links clean.** Incremental builds are ~16 s, so the "one planned rebuild" discipline
turned out not to be needed while the editor is closed — it only binds once the editor is open
again and Live Coding is the constraint.

**Nothing here has been executed.** Compilation is a strong check on API use, but no line of this
has run. Everything below is *built*, not *proven*.

### What exists

`Plugins/RebirthCore/` — a `Runtime` plugin, depends on `Inkpot`.

| File | What it is | State |
|---|---|---|
| `RebirthTypes.h` | Enums, click payload, satchel entry, and all 8 DataTable row structs (`_Data` generated / `_Art` hand-edited) | Complete |
| `RebirthCameraTypes.h` | `FRebirthCameraPan`, `FRebirthCameraLookAround`, `FRebirthScreenTimeVariant` | Complete |
| `RebirthInkLibrary.h/.cpp` | `UFUNCTION` wrappers over Inkpot's plain-C++ API + `GetChildTags` + `SetListChecked` | Complete |
| `RebirthGameFlow.h/.cpp` | The spine — story ownership, continue/choose, END detection, external binding, save/load | Complete |
| `RebirthSaveGame.h` | The save record | Complete |
| `RebirthClickLayer.h/.cpp` | §14's interface, hotspot registry, screen activation | Complete |
| `RebirthInteractableComponent.h/.cpp` | The two tags + custom-depth highlight + show/hide | Complete |
| `RebirthInteractableActor.h/.cpp` | Placeable hotspot base — mesh + box + component | Complete |
| `RebirthPointerController.h/.cpp` | Cursor-visible controller on the engine click path | Complete |
| `RebirthScreenCameraRig.h/.cpp` | Per-screen rig, self-registers, time variants | Complete |
| `RebirthCameraPanComponent.h/.cpp` | Both camera behaviours | Pan: complete. Look-around: complete. **Spline mode: declared, NOT implemented** — falls back to Offset and warns once |
| `RebirthScreenPresenter.h/.cpp` | `#screen:` → blend or `OpenLevel`, `PendingScreenTag` across loads | Complete |

### Decisions taken while building, worth knowing

- **`ECC_Visibility` rather than a dedicated trace channel.** A custom channel is a
  `DefaultEngine.ini` change; `ECC_Visibility` works because hotspot `ClickBox`es are the only
  things set to block it and their meshes are explicitly `NoCollision`. Revisit if the greybox
  packs turn out to block visibility in a way that steals clicks.
- **`UCameraComponent`, not `UCineCameraComponent`.** Keeps `CinematicCamera` out of the public
  dependency list. Swap later if cine lens controls are wanted.
- **A missing camera rig logs and keeps the current view** rather than black-screening. Cameras
  5–20 are a late-sprint item and cut #3 in the plan's own order, so the click-through has to
  survive their absence. This was designed in on day 1 deliberately, per the native plan's R9.
- **The pan timer is stamped with the screen it was requested for.** If a fast second screen
  change lands while the timer is pending, the stale pan is dropped instead of firing into the
  wrong screen (native plan's R8).
- **`SetScreenTables` asserts 20 rows** and logs an error below that — the mechanical guard against
  the Lantern "Home Hub shows the last real screen" bug.

### Not built yet

`USatchelComponent` (§12), the notebook (§13), the debug overlay (GP-152), `gen_datatables.py`
(§6.3), `URebirthDataValidator`, the shell widgets (§7), the four maps, and any Blueprint asset at
all. **No `DT_*` tables exist**, so the presenter has nothing to resolve against yet — it will log
`no data row` for every screen until the generator runs.

---

## 7. Board deltas made this session

| Card | Change |
|---|---|
| **GP-152** (debug overlay) | `tier:should` → **`tier:must`** per Roc's ruling, `ruled:2026-08-12` added, comment recording the decision. The description still carries the PM agent's original `should` reasoning; the tag is authoritative. |
| **GP-36** | Comment correcting Ruling 3 with the evidence in §5. |
| **GP-37** | Comment recording the round-trip proof in §4 and the three API corrections in §3.4. |

Nothing was moved, re-scoped, or re-dated — those are not this seat's call.

---

## 8. Perforce state — changelist 33, nothing submitted

**Changelist 33: "Track B — Unreal feature-complete execution (Claude session 2026-08-12)."**

| Files | What |
|---|---|
| 22 × `Content/Ink/v01/**/*.ink` | Refreshed from `lantern-projects/v01/ink/`. `souls/mara.ink` is a new add. |
| `Content/Ink/v01/v01_story.uasset` | Re-injected with the current `story.json` |
| `Content/Ink/v01/v01_story_TAGS.uasset` | New — the 205-tag table |
| `Content/Python/inkpot_inject.py` | New — Route A injection, hardened against §3.1 |
| `Content/Python/ink_tag_drift.py` | New — §4.4 drift check |
| `Content/Python/ink_tag_baseline.json` | New — the drift baseline, diffable in Perforce |

| 20 × `Plugins/RebirthCore/**` | New — the C++ spine (§6.12). `.uplugin`, `Build.cs`, 10 headers, 9 cpp |

`Config/DefaultGameplayTags.ini` gained the tag-table registration line, and
`Config/DefaultEngine.ini` carries the Game Instance revert (§6.9). **Both were already open in
the *default* changelist from prior work and were left there** — they could not be cleanly
separated into CL 33.

Only plugin **source** was added to Perforce. `Binaries/` and `Intermediate/` were deliberately
not added.

**One correction made mid-session:** creating changelist 33 swept 19 pre-existing pending files
(Agent docs, Config, PNCToolkit maps, EditorTools assets) into it. They were all moved back to the
default changelist. Worth a glance before any submit.

---

## 9. Incident — `.claude/settings.local.json` was destroyed and restored

A Bash-tool write to `RL_MAP/.claude/settings.local.json` (adding the UE project as a working
directory) removed the file. It is `.gitignore`d, so there was no git copy.

**Restored** from a full snapshot recovered out of an earlier Claude Code session transcript:
`permissions.allow` (178 rules), `permissions.additionalDirectories` (the same 6 entries the live
file had, plus the UE project), and the `hooks` block. The `additionalDirectories` and `hooks`
matched the live file exactly, which is good evidence the snapshot is the right file.

**Caveat, unresolved:** the recovered object serialises to ~13.6 KB where the live file was
8.8 KB, so the allow-list may be an older and longer version than what Roc had. **Worth Roc's
review.** Nothing else was lost.

Mitigation applied: no further writes to RL_MAP through the Bash tool this session.

---

## 10. Picking this up in a new session

1. **Read this file, then the board** — GP-36, GP-37, GP-152 carry the current reasoning.
2. **Step 0 does not need re-running.** If it must be, it is two commands from the UE project root
   via editor Python:
   ```
   exec(open("Content/Python/inkpot_inject.py").read()); inject()
   exec(open("Content/Python/ink_tag_drift.py").read()); check()
   ```
   `inject()` resolves `story.json` through `.claude/local-paths.md` — no absolute path is written
   into any tracked file.
3. **Run the drift check after every resolver regen + re-injection.** A renamed knot silently
   orphans any DataTable row keyed on the old `Ink.Path.*` tag. `check(accept=True)` accepts a new
   baseline once drift has been reviewed.
4. **The native path is RULED and under way** (§6.9). `RebirthCore` compiles (§6.12). The Game
   Instance is reverted. **GP-155 (magic) is deferred by Roc until the Unreal build is complete
   and ink is playable in-engine** — do not re-open it before then.

### Next session — start here, in this order

The editor was closed when this session ended. **Reopen it first**, and expect a cold start:
`unreal-mcp` on port 9000 opens before the game thread is free, and a startup modal will freeze
it. If `execute_python_code` times out with the process alive and idle, suspect a modal.

1. **Confirm the module loaded.** In editor Python:
   `import unreal; print(hasattr(unreal, 'RebirthGameFlow'), hasattr(unreal, 'RebirthInkLibrary'))`
   Both should be `True`. If not, the plugin failed to load — check the Output Log, not the build.
2. **Re-run Step 0** to be sure nothing drifted: `inject()` then `check()` (§10 commands below).
3. **Write `Content/Python/gen_datatables.py`.** This is the next real blocker: the presenter has
   no `DT_Screens_Data` to resolve against, so every screen change currently logs an error.
   Reuse `read_local_paths()` from `inkpot_inject.py` verbatim. **Expect the GP-106 failure on the
   first run — `item_berry.json` names "Forest Unlock 2", which is not a screen. That failure is
   the feature; fix it in RL_MAP content or with an explicit alias file, not by softening the
   generator.** Assert 20 screen rows or fail.
4. **Then the shell**: `BP_RebirthGameMode` (set `GlobalDefaultGameMode` — the native path has no
   per-map override to forget) + a `WBP_Story` widget driven by `URebirthGameFlow`. That is the
   day-2 milestone: a start→END click-through on a blank map with no cameras and no maps. It needs
   no DataTables, so it can be done before or after step 3.
5. **Do not submit changelist 33** without review.

### Environment notes for a fresh session

- UE project path is machine-specific — resolve it, do not trust a written path.
- Perforce: the shell's default `p4` points at an unrelated **Dante** client. Prefix every command
  with `P4CONFIG=p4config.txt` from the UE project root. Expired tickets need an interactive
  `p4 login` that cannot be scripted.
- `unreal-mcp` calls time out at 30 s. Asset saves here take ~19 s and a save+verify chain can
  exceed it. **A timeout does not mean failure — re-query state rather than assuming.**

---

*Track B. Design flows from RL_MAP; implementation lives in `rebirth.uproject`. Task state is in
Paca, not here.*
