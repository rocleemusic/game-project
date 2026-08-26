# Prototype asset-swap list — 2026-08-12

Roc's call: copy vendor levels and adjust as needed to get a feature-complete
**prototype** (screen presenter working end to end, something to look at) fast.
Everything on this list is a placeholder standing in for real art/level-design
work and needs to be swapped before ship. Nothing here is final.

**Mid-build discovery:** Track A had already built the full screen-presenter C++
system (`URebirthScreenPresenter`, `ARebirthScreenCameraRig`, `URebirthClickLayer`,
`FRebirthScreenArtRow` and friends) overnight, unknown to the Track B handoff this
session resumed from. So the C++ layer below is Track A's, not new this pass — what
this pass added is the missing wiring (DataTable asset, camera rig placement,
`Initialize()` hookup) to make it actually run.

## Levels

| Placeholder | Copied from | Stands in for | Notes |
|---|---|---|---|
| `/Game/Maps/L_Town` | `/Game/Stylized_Medieval_Town/Map/Demo_level` | Town (T1-T9, T8, TN, FS — 11 screens) | Vendor demo scene, not laid out to match screen-specs.json's town graph. Confirmed as Track A's own intended material — `RebirthInteractableComponent.h`'s custom-depth-outline comment names this pack and Stylized_Forest by name. Camera positions inside it are placeholder grid spacing (4-col grid, 800-unit spacing), not real geography. |
| `/Game/Maps/L_Forest` | `/Game/Stylized_Forest/Maps/Demonstration` | Forest (F1-F8 — 8 screens) | Same caveat — vendor demo scene, not the real forest layout (Forager's Clearing -> Stream -> Grove -> Still Pool -> Old-Growth Hollow -> Shrine/Cave/Heart). Same placeholder grid placement. |
| Festival Grounds staging | none yet | T7's night-only exclusive-screen mode, T9 Festival Vignette, TN Festival Night, FS Final Screen | No vendor asset matched. `DT_Screens_Art` rows for T7/T9/TN/FS point at `L_Town` like any other town screen; the final-sequence exclusivity (no move budget, no exits) is not represented visually yet. |
| Home Hub | none yet | HOME screen (`gdd/08-levels.md`: "Two spaces sharing one asset set") | Not built this pass. `DT_Screens_Art`'s HOME row has a `cameraRigTag` but no `Map` and no rig placed — the presenter's own missing-rig fallback (log a warning, keep the current view) covers it, so it doesn't break, it just shows nothing new. |

## Data / code

| Item | State |
|---|---|
| `FRebirthScreenArtRow` (C++ struct) | Already existed (Track A). Not rebuilt — used as-is via `DataTableTools.create`. |
| `/Game/Data/DT_Screens_Art` | Created and populated this pass: all 20 screens have a row; 19 (all but HOME) have `map` + `cameraRigTag` set; `blendTime`/`blendExp`/pan/look-around all left at struct defaults (1.2s, ease exp 2.0, no overrides) — untuned. |
| Camera rig positions | Placed by script at spread-out grid positions inside the vendor levels, not authored to match each screen's real vibe/vantage point. Every rig needs real placement (and a real pose/FOV) once the level-art pass happens. |
| `URebirthScreenPresenter::Initialize()` (RebirthCore.cpp) | Modified this pass: now self-wires to `URebirthGameFlow::OnLineAdvanced` via `Collection.InitializeDependency<URebirthGameFlow>()`, and hardcode-loads `DT_Screens_Data`/`DT_Screens_Art` by path (mirrors `RebirthStoryWidget`'s own `StoryAsset` fallback pattern). Compiled via Live Coding, not a full rebuild. This hardcoded load is itself a placeholder — the class's own `SetScreenTables` is `BlueprintCallable`, suggesting a designer-facing wiring point was originally intended; worth revisiting once there's an actual GameMode/GameInstance Blueprint doing setup work. |
| Verification | Confirmed via PIE: `GameFlow initialised`, `Story begun from 'v01_story'`, no `DT_Screens_Data has N rows, expected 20` error (would fire on a row-count mismatch). Did **not** confirm an actual camera transition — the story was only walked to the first choice point (`screen_hub`), before any `#screen:` tag fires. Needs a real click-through in Play mode to see a camera blend/level load happen. |

## NPC placeholders (relates to Task #157)

Not built this pass — Task #157 (present_<soul> wiring) is a separate, prerequisite gap. Once that lands, placeholder actors per soul-presence slot are still owed per Roc's design note in the 08-12 handoff §7.

## Play-mode gap, closed 2026-08-12 (second pass)

A scan of the actually-committed project state (not just the C++ headers) found four things
that meant pressing Play showed nothing playable, even with the presenter wired:

1. **No hotspot content existed.** `ARebirthInteractableActor` (the click-layer's world-collider
   base) is `Abstract` by design — a designer subclasses it per kind. Zero subclasses exist yet
   (no `BP_Hotspot_Examinable`/`_Forage`/`_Exit`). Still true — out of scope for this pass, needs
   real content authoring, not a prototype wire.
2. **`BP_RebirthGameMode` still used the default engine `PlayerController`/`DefaultPawn`.**
   Fixed: `PlayerControllerClass` -> `ARebirthPointerController`, `DefaultPawnClass` -> None (no
   pawn — ink owns movement per the controller's own doc comment; a floating DefaultPawn would
   have undermined that).
3. **`GameDefaultMap` was still `/Engine/Maps/Templates/OpenWorld`.** Fixed in
   `Config/DefaultEngine.ini` -> `/Game/Maps/L_Town`. Placeholder value — L_Town is the copied
   vendor level, not the real town map.
4. **Nothing spawned `WBP_Story` into the viewport on a real Play** — every PIE check before this,
   including Track A's own, used an explicit Python `spawn_widget_in_pie` call. Fixed by adding
   widget creation to `ARebirthPointerController::BeginPlay()` (hardcoded `LoadClass` on
   `/Game/Blueprints/WBP_Story.WBP_Story_C`, same fallback-path convention as the other two C++
   changes this session). **This is itself a placeholder** — putting UI-spawn responsibility on
   the pointer controller is a stopgap until the project has a real front-end/menu flow; whatever
   owns that flow later should take this back over.

Verified in PIE after all four fixes: `Story begun from 'v01_story'` fired with no manual Python
intervention — the full chain (Play -> PointerController::BeginPlay -> WBP_Story -> GameFlow)
now runs on its own.

## Two real bugs found by Roc actually clicking through, fixed 2026-08-12 (third pass)

Roc pressed Play and reported: town camera changes on some choices, but a forest choice never
loads the map. Two separate, real bugs, not placeholder gaps:

1. **`RebirthStoryWidget::AdvanceAndRefresh()` called `Flow->ContinueStoryMaximally()`.** That
   runs the whole walk to the next choice point inside Inkpot's own C++ and fires
   `OnLineAdvanced` exactly once, at the end — so `RebirthScreenPresenter::HandleLineAdvanced`
   only ever saw the LAST line's tags. Any `#screen:` tag on an earlier line (the actual
   screen-entry line, always followed by more flavour text before the next choice) was silently
   dropped. The presenter's own header comment says "on each Continue" — line-by-line advancing
   was always the intended contract. Fixed: `AdvanceAndRefresh` now loops `Flow->ContinueStory()`
   line-by-line, same accumulated display text, `OnLineAdvanced` now fires once per line.
2. **`URebirthScreenPresenter::CurrentMapName` was only ever set from `HandlePostLoadMap`**,
   bound to `PostLoadMapWithWorld` — which fires on a *subsequent* `OpenLevel`, not for the very
   first PIE world. So on a fresh session `CurrentMapName` stayed `NAME_None`, the cross-map
   branch's `CurrentMapName != NAME_None` guard was false, and every screen — even a genuine
   cross-map one — fell through to the same-map camera-blend path, found no rig (the other map's
   rigs were never registered), logged a warning, and did nothing. `OpenLevel` never fired. Fixed:
   `ApplyScreen` now lazily initialises `CurrentMapName` from the current world if it's still
   unset, before the cross-map check runs.

Both compiled clean via Live Coding. Not yet re-verified by Roc clicking through again — that's
the next step.

## The actual root cause, fixed 2026-08-12 (fourth pass)

Retest still failed: forest still didn't load, and now leftover buttons too. Checked the data
directly instead of guessing further — `DT_Screens_Art`'s `map` field was `"None"` on **every**
row, including T1, despite the earlier `set_rows` call that appeared to succeed. This is the real
root cause of the whole "map does not load" symptom from the start of this pass, and it explains
why town screens looked like they worked: their rigs already existed in whichever map happened to
be loaded, so the same-map camera-blend fallback path found them anyway — camera *movement*
was never proof the presenter's cross-map logic was firing.

**Tool quirk, worth remembering:** `DataTableTools.set_rows` silently drops a `TSoftObjectPtr`
value passed as `{"refPath": "..."}` (the shape `get_schema` documents and the shape used
successfully for `GameplayTag` fields elsewhere in the same call). The working shape is a bare
string: `{"map": "/Game/Maps/L_Town.L_Town"}`. Confirmed by writing, reading back, seeing `"None"`,
retrying with the string form, reading back again and seeing the real path. Re-set and saved all
19 rows this way.

Also added a defensive guard in `ARebirthPointerController::BeginPlay()`: skip creating `WBP_Story`
if `RebirthGameFlow`'s `FlowState` is already past `Boot` (i.e. a story is already running). The
log showed `Story begun from 'v01_story'` firing twice, milliseconds apart, on every PIE session
after the first — two `WBP_Story` instances, two stacked button lists. Root mechanism for *why*
`BeginPlay` fires twice wasn't isolated (candidates: something PIE/Live-Coding-session-specific,
several patches deep by this point in the session — worth a plain editor restart before trusting
this guard is masking rather than fixing it). The guard makes duplication impossible regardless of
cause, which is the practical fix either way.

Compiled clean via Live Coding. Not yet re-verified.

## Fifth pass, after Roc restarted the editor

Restart confirmed the leftover-buttons guard actually fixed it (not masking a Live-Coding
artifact) — clean on a fresh session. But now: town cameras stopped moving entirely, right after
`DT_Screens_Art`'s `map` field started holding real values for the first time. That ordering is
the tell.

**Root cause:** `CurrentMapName` was built from `World->GetOutermost()->GetName()`, which in PIE
returns `"UEDPIE_0_L_Town"` (PIE's package-rename prefix), never equal to `TargetMap`'s plain
`"L_Town"` (built from `Art->Map`'s asset path, which carries no PIE prefix). While `map` was
empty this never mattered — the cross-map branch never ran at all. The moment `map` held real
values, EVERY screen change looked like a map change under this broken comparison, so the
presenter kept calling `OpenLevel` on itself instead of blending — explains "cameras don't work"
precisely (a same-map screen change now reloads the whole level instead of moving the camera).

Fixed both `HandlePostLoadMap` and the lazy `CurrentMapName` init in `ApplyScreen` to use
`UWorld::GetMapName()` instead of parsing the outermost package name by hand — `GetMapName()`
strips the PIE prefix by design, which is exactly the mismatch here. Compiled clean via Live
Coding. Not yet re-verified.

## Sixth pass — a real infinite reload loop, caught and hard-capped

The `GetMapName()` fix alone didn't hold. Retest: only two buttons (Tavern/Inn, The Cave)
triggered a load at all, and performance went to the floor afterward. The log made it undeniable:
`LogLoad: Game class is 'BP_RebirthGameMode_C'` — printed once per level load — fired every
~235ms continuously for **minutes**, hundreds of times, with only one `GameFlow initialised` at
the very start (confirming `GameInstance`/`GameFlow` correctly persisted — this was not a
GameInstance-recreation bug). That's a genuine self-sustaining `OpenLevel` loop: `HandlePostLoadMap`
resumes `ApplyScreen` for the screen that was just loaded, and something about that resume still
decided the map didn't match, calling `OpenLevel` again, forever — with no further clicks
involved.

**Root cause not yet isolated** (the `GetMapName()` fix should have been sufficient — whether it
genuinely isn't, or something else is at play, is still open). Rather than keep guessing blind,
added two things:

1. **Diagnostic logging** — `ApplyScreen` now logs `TargetMap`/`CurrentMapName`/`PendingScreenTag`
   on every decision, so the next test's log shows the actual values being compared instead of
   requiring more speculation.
2. **A hard loop-breaker.** `PendingScreenTag` used to get cleared in `HandlePostLoadMap` *before*
   the resume call, which meant nothing could ever tell "first attempt" apart from "just loaded
   for this exact screen and it still wants another load." Restructured: `HandlePostLoadMap` now
   leaves `PendingScreenTag` set through the resume; `ApplyScreen` clears it once it confirms it
   actually landed on the right map, or — if the resume immediately wants to reload the *same*
   tag again — logs a loud error and gives up instead of looping. Deliberately implemented without
   adding any new class member (would need a full rebuild, not just Live Coding, and risk
   corrupting already-live object instances mid-session) — reuses `PendingScreenTag`'s own
   lifetime as the signal instead.

Compiled clean via Live Coding. **If the loop is still root-cause-unfixed, this update should at
minimum cap it to one failed load and one error log instead of a runaway performance hit** — worth
checking the log afterward either way (search for `ApplyScreen(` to see the diagnostic lines, or
`refusing to loop` to see if the hard-stop fired).

## Seventh pass — the actual root cause, confirmed by log evidence

The diagnostic logging paid off immediately. Roc's retest log showed, verbatim:

```
ApplyScreen('Game.Screen.T6'): TargetMap='L_Town' CurrentMapName='UEDPIE_0_L_Town' PendingScreenTag='Game.Screen.T6'
Error: ApplyScreen('Game.Screen.T6'): still mismatched (target 'L_Town' != current 'UEDPIE_0_L_Town') after resuming from its own OpenLevel - refusing to loop.
```

**`UWorld::GetMapName()` does not strip the PIE instance prefix in this engine build** (5.8.1) —
contrary to its documented behavior, which the sixth pass's fix assumed without verifying against
real output. `CurrentMapName` was genuinely `"UEDPIE_0_L_Town"`; `TargetMap` was `"L_Town"`; an
exact `FName` match can never succeed inside PIE, full stop. The hard loop-breaker from the sixth
pass did its job — capped every subsequent screen entry to one failed load and one error line
instead of a runaway reload — which is exactly why the maps DID load this time (through the
one-shot `OpenLevel` before the guard kicked in) but camera blending still silently failed on the
resume: the guard was correctly refusing to CONTINUE looping, not fixing the underlying compare.

**Actual fix:** compare with `CurrentMapName.ToString().EndsWith(TargetMap.ToString())` instead of
exact `FName` equality. Robust to any PIE instance number, and still correct outside PIE
(packaged/standalone), where `CurrentMapName` already equals `TargetMap` exactly and `EndsWith`
degrades to that same check. Compiled clean via Live Coding.

**Open question, not yet confirmed:** Roc's log also showed `Story begun from 'v01_story'` /
`"Day 1 begins."` firing again right after the F4 cross-map load completed inside what looked like
one continuous playthrough — if the story is genuinely resetting to Day 1 on every real map
crossing (not just a fresh Play press), that's a separate bug (state lost across `OpenLevel`,
likely the `ARebirthPointerController::BeginPlay()` `FlowState` guard from pass four not actually
holding across a real level load the way it does within one map). Worth confirming on the next
test — if it recurs, that's the next thing to trace.

## Eighth pass — rig placement was too tight to see, not a code bug

Roc reported: camera changes visibly on a map load, but not on a same-map move afterward.
Checked the log directly rather than guess: every same-map `ApplyScreen` call (e.g.
`ApplyScreen('Game.Screen.F2'): TargetMap='L_Forest' CurrentMapName='UEDPIE_0_L_Forest'
PendingScreenTag='None'`) had NO following `"No camera rig registered"` warning — meaning a valid
rig was found and `PC->SetViewTargetWithBlend(...)` genuinely fired every time. Not a logic bug.

Checked rig placement against the level's actual content instead: `L_Forest`'s real dressed area
spans roughly 29,000 × 35,000 units, but the 8 forest rigs were confined to an 800×2400-unit grid
clustered near the origin — adjacent rigs only 800 units (8m) apart. `L_Town` was worse in
absolute terms (level spans ~86,000 × 165,000 units, rigs still on the same tiny 800-unit grid).
The very first blend after a level load looks dramatic only because it's coming from the level's
default spawn point, not because the rig-to-rig blend itself is doing anything perceptible —
every SAME-map blend afterward was a near-invisible 8m nudge.

**Fixed by respreading, not by touching any code:** placed each map's rigs on a circle (radius
12,000 for `L_Forest`, 18,000 for `L_Town`) around that map's actual static-mesh centroid
(computed from `StaticMeshActor` bounds, excluding oversized sky/backdrop actors), each rig facing
inward toward the centroid. Still placeholder positions — arbitrary points on a circle, not
authored to match each screen's real vibe — but now spread across the level's real scale instead
of an 8-meter smear, so a blend should actually read as camera movement. Both levels re-saved.

## Ninth pass — two open issues, session paused here

Retest: camera changes are noticeably more visible now (the respread fixed the "on load only"
symptom's dominant cause), but two things remain open, neither root-caused yet:

1. **Camera blend "sometimes still doesn't happen."** No specific repro captured — Roc's exact
   words. Given the log evidence from the eighth pass (every same-map `ApplyScreen` call found a
   valid rig and issued a blend), the leading candidates are: (a) a genuine intermittent rig-lookup
   miss not yet caught in a log sample, (b) a specific screen whose rig placement or rotation
   happens to look similar to its neighbor from certain angles (a placement issue, not a bug), or
   (c) something about rapid back-to-back screen changes interrupting an in-flight blend (see
   `StartPanAfterBlend`'s own stale-timer guard — `SetViewTargetWithBlend` itself has no such
   guard, so two changes within `BlendTime` could visually cancel each other). Needs a repro.

2. **Story resets to Day 1 on "restart map."** Roc's exact words, meaning is not fully
   disambiguated: could mean (a) pressing Play again after Stop (expected, normal), or (b) a
   same-session `OpenLevel` cross-map trip resetting progress (a real bug — see the seventh pass's
   "open question," which flagged the exact same symptom from a log read, never confirmed).
   Reading (b) is more consistent with Roc's phrasing ("on restart MAP", not "on restart PLAY") and
   would point at `ARebirthPointerController::BeginPlay()`'s `FlowState` guard (added pass four)
   not actually surviving a real level load the way it does within one already-loaded map -
   worth instrumenting with a log line on that guard's early-return path specifically, next
   session, to settle it one way or the other rather than guess again.

Session paused here at Roc's request. See
`plans/_handoffs/2026-08-12-screen-presenter-prototype-handoff.md` for the full resume plan; Paca #158/#159
track these two open items.

## Incident

Mid-session, a Python call (`unreal.EditorActorSubsystem()` used as a constructor instead of `unreal.get_editor_subsystem(unreal.EditorActorSubsystem)`) triggered a fatal `World Memory Leaks` assertion and froze the editor's RPC bridge behind a native dialog. Roc restarted the editor manually; no work was lost (everything up to that point was already saved). Noted here so the same mistake isn't repeated.
