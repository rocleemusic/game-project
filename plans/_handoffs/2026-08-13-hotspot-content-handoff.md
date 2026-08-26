# Handoff — Paca #158/#159 fixed, hotspot content built, UI-blocking bug found, 2026-08-13

**Continuation of** `plans/_handoffs/2026-08-12-screen-presenter-prototype-handoff.md`. This session picked up
its exact resume plan (confirm module, re-verify Step 0, click through), root-caused and fixed both
open bugs, then moved to the plan's next real gap — hotspot content — and built substantially more
than placement: click routing, a satchel, and a UI layout bug found live by Roc mid-session.

**Board is authoritative for status.** GP-158 and GP-159 are closed Done on the board (confirmed via
a `/pm` pass this session). GP-162 ("Hotspot content authoring") was created this session, parented
under GP-36, `tier:must`, sprint S3 — **its `tier:must` was a PM placeholder, not a ruling; worth
Roc's confirmation, it isn't separately named in `gdd/13`'s MUST/SHOULD/STRETCH table.**

**Nothing from tonight is committed to Perforce except changelist 35** (see §5). Everything else —
the satchel, click routing, hotspot placement, the greybox material, the UI layout fix — is sitting
uncommitted in the workspace.

---

## 1. Paca #158 and #159 — root-caused, fixed, verified, committed (change 35)

Both bugs were diagnosed by driving the live `RebirthGameFlow`/`RebirthScreenPresenter` subsystems
directly through Python (no in-editor "click a button" tool exists), then verified again after each
fix through the *real* click path (`ChooseChoice`, the same call `WBP_Story`'s buttons make) — not a
shortcut.

**#158 (camera blend intermittently doesn't fire) had two independent causes:**

1. **A real source bug**, now fixed: `URebirthGameFlow::ChooseChoice()` called
   `ContinueStoryMaximally()` internally — the exact bug the "third pass" fix
   (`plans/2026-08-12-prototype-asset-swap-list.md`) was supposed to kill, just one call earlier
   than where that fix landed. `ChooseChoice` exhausted the story and fired `OnLineAdvanced` once
   with only the last line's tags, *before* the caller's own line-by-line `AdvanceAndRefresh()` loop
   ever ran — dropping the `#screen:` tag on nearly every screen-entry line. Fixed: `ChooseChoice`
   now only selects the choice (`Story->ChooseChoiceIndex()`); the caller continues line-by-line, as
   it already did.
2. **A stale Live Coding binary**, not a real bug: `DT_Screens_Data`/`DT_Screens_Art` were failing to
   load at `Initialize()` time, and the `OnLineAdvanced` delegate wasn't reaching
   `HandleLineAdvanced` at all — on a completely fresh PIE session, reproducibly. A full clean
   rebuild (`Build.bat`, editor closed — **not** Live Coding) fixed both with no source change. This
   confirms the project's own documented gotcha (`Agent/knowledge/workflows/build-code-plugin.md`):
   after enough Live Coding patches in one editor session, don't trust further diagnosis until a real
   rebuild rules out stale state. **Do this early in a debugging session, not after an hour of
   confused evidence.**

**#159 (story resets to Day 1 on cross-map OpenLevel):** `URebirthStoryWidget::NativeConstruct()`
called `Flow->BeginNewStory(Asset)` unconditionally. If a second `WBP_Story` instance is ever
constructed — confirmed happening on a real cross-map `OpenLevel` — it silently wiped all progress.
`ARebirthPointerController::BeginPlay()` already guarded *widget creation* on `FlowState`, but that
guard doesn't stop this function from re-running `BeginNewStory` if a widget gets constructed by some
other path. Fixed by moving the guard to the actual reset call: `NativeConstruct` now only calls
`BeginNewStory` if `FlowState == Boot`, and logs a warning instead of resetting otherwise.

**Verified**, both fixes together, across two real cross-map transitions (T1→L_Town, F1→L_Forest) in
one PIE session, through the real click path: `"Story begun from 'v01_story'"` fired exactly once at
PIE start; the presenter's `CurrentScreenTag` tracked correctly through both loads.

**Committed as Perforce change 35** — scoped narrowly to `RebirthGameFlow.cpp` and
`RebirthStoryWidget.cpp` only, the two files with actual source edits. Deliberately did **not** sweep
in the large pre-existing default changelist (34, ~100+ files from earlier sessions) or
`RebirthPointerController.cpp`/`RebirthScreenPresenter.cpp` (recompiled by the rebuilds, no source
diff of mine) — those are still sitting in changelist 34 for Roc's own review.

---

## 2. Hotspot content — built, not just placed

Scoped per Roc's explicit choice: examinables + click routing + exits + forage (not "examinables
only"), with `DT_Items_Data`/`SourceScreenTags` ruled authoritative over `screen-specs.json`'s
`forage[]` strings for *where* an item is forageable (the two sources disagree on T2/F2/F3 — see
§2.4).

### 2.1 The real gap found before placing anything

Research (`Explore` agent, full report in this session's transcript, not re-copied here) found that
**nothing in the codebase consumed `URebirthClickLayer::OnRegionClicked`** — the click layer's own
delegate had zero listeners anywhere. Placing hotspots alone would have made them visually present
and clickable-feeling but functionally inert. Built the missing piece:
`ARebirthPointerController::HandleRegionClicked`, bound in `BeginPlay` alongside the existing hover
binding, dispatching by `ERebirthInteractKind`:

- **Examinable** → `Flow->ChooseInkPath(Payload.InkPathTag)`. Ink content already exists for all 22
  examinables (the 2026-08-11 plan's claim that `ex-shelf` was missing is stale — a resolver rebuild
  landed since).
- **Exit** → no per-exit ink tag exists (exits are plain sticky choices with no `#id:`, only a label
  like "Go to Town Square"). Added `DestinationScreenTag` to
  `URebirthInteractableComponent`/`FRebirthClickPayload`; `ChooseExit` (new, in
  `RebirthPointerController.cpp`) resolves the destination's display name from `DT_Screens_Data` and
  matches it against `Story->GetCurrentChoices()`'s text, then calls `ChooseChoice` on the match. Logs
  a warning (not an error) on no match — an exit can be legitimately unavailable (moves spent, wrong
  time-of-day, still locked).
- **Forage** → `URebirthSatchel::AddItem` (new `UGameInstanceSubsystem`, survives `OpenLevel` like
  Flow/Presenter). Wired into `URebirthGameFlow::SaveToSlot`/`LoadFromSlot` — `URebirthSaveGame`'s
  `Satchel` field already existed with `SaveGame` specifiers and its own doc comment ("the ink mirror
  is NOT authoritative"), just had no live component to populate it. `AddItem` also best-effort
  mirrors the pickup into ink's `LIST Satchel` via a new `ITEM_SATCHEL_CATEGORY` mapping in
  `gen_datatables.py` (documented confidence levels, same convention as `screen_name_aliases.json`;
  6 of 14 items unmapped on purpose, no clean signal — see the script's own comment for exactly
  which and why).
- **Custom** → logs, no-op. Nothing consumes it yet (shell affordances, not built).

**Known incomplete piece:** the ink `LIST Satchel` mirror logs success (`SetListGT` after
`TryAddItem`) but `story.get_list("Satchel")` reads back empty immediately after — likely an
`Ink::FInkList` origin-binding subtlety with `TryAddItem` on a bare list fetched via `GetListGT`.
**Did not chase this further** — the UE-side satchel (the actually-authoritative source, confirmed
working via direct `AddItem`/`GetItemCount` tests and via the real click path) is unaffected. Worth a
look if ink-side conditionals on satchel contents are ever needed.

### 2.2 Placement — script-driven, not hand-authored

Created three Blueprint subclasses of `ARebirthInteractableActor` — `BP_Hotspot_Examinable`,
`BP_Hotspot_Exit`, `BP_Hotspot_Forage` (`/Game/Blueprints/`) — with `Kind` defaulted on the CDO for
Exit/Forage. Placed via a Python script keyed off the already-registered `ARebirthScreenCameraRig`
actors, one run per level (`L_Town`, `L_Forest`):

- **22 examinable hotspots** — every row in `DT_Examinables_Data`.
- **24 exit hotspots** — every directional edge in `DT_Screens_Data.ConnectsTo` (confirmed
  bidirectional at the data level; a screen only gets hotspots for its own outbound edges, no manual
  flooding needed).
- **26 forage hotspots** — every collectible item's resolved `SourceScreenTags`, deduplicated per
  item per screen. `item_flame` (World persistence, `bCollectible=false`) correctly gets no hotspot.

**A real placement bug, found and fixed mid-session:** the first placement pass anchored hotspots to
each camera rig's *own location* — but `ARebirthScreenCameraRig`'s `UCameraComponent` sits at
relative offset `(0,0,0)`, i.e. the rig's location **is** the camera's eye position. Hotspots were
spawning right at the lens, half of them behind it. Roc reported "couldn't find anything" in Town —
this is why. **Fixed:** hotspots now spawn 900 units in front of each rig along its forward vector,
spread laterally (180-unit spacing) and vertically banded by kind so multiple kinds on one screen
don't stack. Verified mathematically (all placed hotspots sit 3–32° off camera-forward at the
target's FOV of 90°) and visually (see §2.3).

**Re-placement is a delete-all-then-respawn script**, not incremental — the exact placement/spawn
code is in this session's transcript, not saved to a file in the repo. If re-placement is needed
again (e.g. after art changes the camera rigs' positions), it needs to be rewritten or recovered from
session history; it was never checked into `Content/Python/` as a reusable script. **Worth doing
that** if hotspot placement is going to be regenerated more than once more.

### 2.3 Visibility — greybox + hover glow, and a Blueprint-CDO gotcha worth remembering

Hotspots had no mesh at all originally (`ARebirthInteractableActor::Mesh` is optional by design,
"a hotspot may be an invisible volume over existing set dressing") — genuinely impossible to find by
eye, which is what Roc hit. Added:

- **`M_HotspotGreybox`** (`/Game/Materials/`) — a plain Material with a `Constant3Vector` base color
  and a `GlowColor` `VectorParameter` (default black) wired to Emissive. Base color bumped from grey
  to saturated magenta after the first greybox pass was *still* invisible against this level's real
  scale (trees/rocks dwarf a 100-unit cube; grey blends into foliage regardless of scale) — confirmed
  visible via screenshot after the fix (a real `HighResShot` capture, not a hand-wave).
- All three hotspot Blueprints' `Mesh` CDO set to `/Engine/BasicShapes/Cube`, this material, 4x scale.
- **`URebirthInteractableComponent::SetHighlighted()`** now also drives a
  `UMaterialInstanceDynamic`'s `GlowColor` parameter on hover (bright yellow on, black off), in
  addition to the existing custom-depth-stencil toggle. `ARebirthPointerController::HandleRegionHovered`
  now actually calls `SetHighlighted` — previously nothing did, despite the function existing. The
  custom-depth path is still there but currently renders nothing: **no post-process outline material
  exists in the project** (the class's own header comment documents custom depth as the intended
  long-term approach, for marketplace-mesh compatibility without touching their materials — the MID
  approach is a placeholder that only works because `M_HotspotGreybox` is a material we control; it
  won't generalise to real hotspot art without that PP material eventually getting built).

**The gotcha, worth remembering for any future Python-driven Blueprint edits in this project:**
setting a Blueprint's CDO component properties via raw Python reflection
(`get_default_object(bp.generated_class()).mesh.set_static_mesh(...)`) *looked* like it persisted —
survived `save_asset` and a same-session re-check — but **silently reverted after the next editor
restart**, because the edit was never run through `unreal.BlueprintEditorLibrary.compile_blueprint(bp)`.
The `Kind` CDO defaults set earlier the same way *did* survive a restart, so this isn't a blanket
rule — the mesh loss most likely correlates with a native class layout change elsewhere in the same
rebuild cycle (`URebirthInteractableComponent` gained a new property, `DestinationScreenTag`,
triggering Blueprint component-template reconstruction) discarding an uncompiled sibling-component
override. Regardless of the exact mechanism: **always call `compile_blueprint()` after a Python CDO
edit, before trusting it to survive a restart.**

### 2.4 Forage data — flagged, not resolved

`screen-specs.json`'s per-screen `forage: [...]` strings and `DT_Items_Data.SourceScreenTags`
(resolved via `screen_name_aliases.json`) disagree on T2, F2, and F3 — pre-existing, not something
this session caused or fixed. Per Roc's ruling this session, placement used `SourceScreenTags` as
authoritative. Two real content gaps, unresolved:

- **F3 ("mushrooms")** has no backing item record in `content/items/` at all — no `BP_Hotspot_Forage`
  exists for F3 as a result.
- **T2 ("herbs, lantern-oil, wool")** and **F2 ("river stones")** have declared forage categories
  with zero items actually resolving their `SourceScreenTags` there — same result, no hotspot.

This is a content decision (write the missing item record, or fix the alias/source-location data),
not an engineering one — flagging again since it's still open.

### 2.5 UI-blocking bug, found live by Roc, fixed

Roc's own testing found the real reason hotspots "couldn't be found" in some views even after the
placement and visibility fixes: `WBP_Story`'s `ChoiceList` anchored across nearly the full screen
`(0,0)-(1,1)`, and its dynamically-created buttons (in `RefreshChoices()`) defaulted to full-width —
with several choices stacked, the choice list covered a large swath of the 3D view, blocking clicks
to any hotspot underneath. **Not** `ChoiceList`'s own panel (confirmed `SelfHitTestInvisible`, so its
empty space doesn't intercept clicks) — the individual **Button** widgets, which correctly need to be
clickable, were simply too large and numerous.

**Fixed** in `RebirthStoryWidget::NativeConstruct`/`RefreshChoices`: `ChoiceList`'s `CanvasPanelSlot`
is now resized to a fixed 420×320 box pinned to the bottom-left corner (point-anchored, not
stretched), and each choice button's `VerticalBoxSlot` is set to `HAlign_Left` (auto-width) instead
of the default fill.

**Not independently visually verified.** `HighResShot`'s console command captures the 3D world only,
not the UMG overlay — every screenshot taken this session to check hotspot visibility genuinely
excluded the choice-list UI, which is also *why* the earlier screenshots never showed the blocking
problem themselves; Roc's own play session is what surfaced it. The C++ change is a small, standard
UMG Canvas Slot resize — confident in it, but it has not been seen rendered by anyone yet. **This is
the first thing to check next session.**

---

## 3. Real gotchas found tonight, worth carrying forward

1. **A stale Live Coding session can fully explain "intermittent" bugs that look like real logic
   errors.** Two whole bugs' worth of investigation (§1) turned out to be a stale binary, not source
   bugs — confirmed only by doing a real `Build.bat` rebuild and re-testing. If a PIE session has
   survived many Live Coding patches and behavior looks inconsistent with the code as read, rebuild
   before debugging further, not after.
2. **`Ink::FInkList::TryAddItem` requires linking `InkPlusPlus` separately from `Inkpot`** —
   `RebirthCore.Build.cs` only had `Inkpot` in its dependencies; the underlying list type lives in a
   different module. Missing this produced an `LNK2019` unresolved-external, not a compile error —
   easy to misdiagnose as a syntax problem.
3. **Blueprint CDO edits via Python need an explicit `compile_blueprint()` call to survive an editor
   restart** — see §2.3. Not obviously documented anywhere in this project before now.
4. **A camera rig actor's own transform is the camera's eye position, not what it's looking at.**
   Anchoring placed content to a rig's location directly (rather than along its forward vector) puts
   that content at the lens, not in the scene. Cost a full placement pass to catch.
5. **`HighResShot` (and `unreal.AutomationLibrary.take_high_res_screenshot`) do not capture the UMG
   overlay by default** — only the 3D scene. Don't trust a "no UI visible" reading from either as
   evidence the UI isn't there; it means the capture method excluded it, not that the game did.
6. **The P4 workspace visible to this session's shell doesn't cover
   `D:\_elvtr\rebirth\roclee_CCI-MSiAegis-02_459`** — `p4 edit` fails with "not under client's root"
   using ambient shell config. The project's own `p4config.txt` (P4PORT/P4USER/P4CLIENT) has to be
   passed explicitly per-command (`P4CONFIG=p4config.txt p4 <cmd>`, or `-p`/`-u`/`-c` flags) to reach
   the correct workspace.

---

## 4. Next session — exact resume steps

1. **Confirm the module loaded and Step 0 clean**, same snippets as every session (morning handoff
   §6, unchanged):
   ```python
   import unreal
   print(hasattr(unreal, 'RebirthSatchel'), hasattr(unreal, 'RebirthScreenPresenter'))
   exec(open("Content/Python/inkpot_inject.py").read()); inject()
   exec(open("Content/Python/ink_tag_drift.py").read()); check()
   ```
2. **Press Play in either level and actually look at the choice list.** Confirm it's a small
   bottom-left box, not covering the screen, and that hotspots are reachable underneath/around it —
   this is the one change tonight nobody has seen rendered yet.
3. **Click through a few hotspots of each kind** (Examinable/Exit/Forage) — the underlying routing
   was verified via direct API calls, not by clicking with a mouse. A real playthrough is still owed.
4. **If forage matters this session:** F3 has no hotspot at all (no item record), T2/F2 have declared
   categories with nothing sourcing there — decide whether to write the missing item content or leave
   those screens forage-empty for now.
5. **The ink `LIST Satchel` mirror doesn't actually take** (§2.1) — low priority unless something
   ink-side needs to read satchel contents.
6. **Nothing is committed except change 35.** The satchel subsystem, click routing, hotspot content,
   the greybox material, and the UI layout fix are all uncommitted C++/Blueprint/level work sitting in
   the workspace — scope a P4 changelist for review before submitting (same narrow-scoping approach as
   change 35, not a sweep of everything in changelist 34).

## 5. Not done, not started

Real hotspot art/geometry (still magenta greyboxes everywhere, by design — a later art pass swaps
these). The custom-depth post-process outline material (§2.3) — the hover glow works today only via
a placeholder MID trick specific to `M_HotspotGreybox`. `ERebirthInteractKind::Custom` has no consumer
(notebook pickup and similar shell affordances). Task #157 (NPC presence,
`tools/resolver/src/ink.ts`) untouched, unrelated to tonight. The placement script itself was never
saved as a reusable `Content/Python/` file (§2.2) — worth doing if hotspots get regenerated again.

---

*Design flows from RL_MAP; implementation lives in `rebirth.uproject`, workspace
`roclee_CCI-MSiAegis-02_459`. Task state is in Paca, not here.*
