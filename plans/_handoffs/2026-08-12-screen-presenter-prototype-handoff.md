# Handoff — screen presenter wired + prototyped, two open bugs, 2026-08-12 (evening)

**Continuation of** `plans/_handoffs/2026-08-12-unreal-data-spine-handoff.md` (Track B, overnight/morning) and
`plans/2026-08-11-unreal-feature-complete-plan.md` §8. This session picked up the morning
handoff's resume steps, then discovered Track A had independently built most of the screen
presenter/camera-rig/click-layer system already (undocumented in the morning handoff — the two
tracks' work landed close together without cross-reference). This session's job became: find what
Track A built, wire the missing connections, and get an actual playable prototype in front of Roc
— "get feature complete with a prototype and stuff to look at" (Roc's own scoping).

**Board is authoritative for status.** This file holds reasoning. Paca #157/#158/#159 are the
open items from this session. **Full blow-by-blow of every bug found and fixed tonight is in
`plans/2026-08-12-prototype-asset-swap-list.md`** — nine numbered passes, each with the symptom,
the log evidence, and the fix. Read that file before touching `RebirthScreenPresenter.cpp` again;
it will save you from re-discovering the same three gotchas below.

---

## 1. What's done and verified this session

- **Confirmed and re-verified** the morning handoff's Step 0 (inject/tag-drift) and the day-2
  milestone (`WBP_Story` renders `"Day 1 begins."` live) — both still clean.
- **Discovered Track A's prebuilt system**: `URebirthScreenPresenter`, `ARebirthScreenCameraRig`,
  `URebirthCameraPanComponent`, `URebirthClickLayer`, `URebirthInteractableComponent`,
  `ARebirthInteractableActor` (abstract, no subclasses exist yet), `ARebirthPointerController`,
  `URebirthSaveGame` (GP-37 already fully implemented), `URebirthInkLibrary`. All compiled, none
  wired up or tested end-to-end before tonight.
- **`/Game/Maps/L_Town`** (copied from `Stylized_Medieval_Town/Map/Demo_level`) and
  **`/Game/Maps/L_Forest`** (copied from `Stylized_Forest/Maps/Demonstration`) — placeholder
  levels, confirmed as Track A's own intended materials (their code comments name these packs).
- **`/Game/Data/DT_Screens_Art`** created and populated for all 20 screens, using Track A's
  existing `FRebirthScreenArtRow` C++ struct.
- **19 `ARebirthScreenCameraRig` actors** placed in both levels (11 town, 8 forest), tagged per
  screen, **respread late in the session** onto a wide circle around each level's real content
  centroid (see asset-swap-list "Eighth pass") — the first placement was an 8-meter cluster,
  invisible against levels spanning tens of thousands of units.
- **`GameDefaultMap`** → `/Game/Maps/L_Town` (was the engine's own template map).
- **`BP_RebirthGameMode`**: `PlayerControllerClass` → `ARebirthPointerController`,
  `DefaultPawnClass` → None (no pawn — ink owns movement).
- **`ARebirthPointerController::BeginPlay()`** now creates and adds `WBP_Story` to the viewport
  (hardcoded `LoadClass`, same fallback-path convention as elsewhere in this codebase), guarded on
  `RebirthGameFlow`'s `FlowState` so a second `BeginPlay` can't create a duplicate widget.
- **Presenter wiring**: `URebirthScreenPresenter::Initialize()` self-binds to
  `RebirthGameFlow::OnLineAdvanced` and hardcode-loads both DataTables.
- **`RebirthStoryWidget::AdvanceAndRefresh()`** rewritten to loop `ContinueStory()` line-by-line
  instead of `ContinueStoryMaximally()` — the latter fires `OnLineAdvanced` only once per player
  choice, so the presenter only ever saw the LAST line's tags and missed every `#screen:` tag on
  an earlier line (i.e. almost always).
- **Cross-map `OpenLevel` logic fixed** (was completely non-functional): `DT_Screens_Art`'s `map`
  field wasn't actually saving via the DataTable tool's `{"refPath": ...}` shape (silently dropped
  — use a bare string path instead, see asset-swap-list "fourth pass"), and separately
  `URebirthScreenPresenter`'s map-name comparison used an exact match against
  `World->GetOutermost()->GetName()` / `UWorld::GetMapName()`, neither of which strip PIE's
  `UEDPIE_0_` prefix in this engine build (5.8.1) — confirmed by direct log evidence, not assumed.
  Fixed with `CurrentMapName.ToString().EndsWith(TargetMap.ToString())`.
- **A genuine infinite-reload loop was caught and hard-capped** while chasing the above (see
  "Sixth/Seventh pass") — `HandlePostLoadMap`'s resume path could re-trigger `OpenLevel` forever
  if the map comparison still failed after landing. Restructured `PendingScreenTag`'s lifetime
  (left set through the resume instead of cleared before it) so the presenter can tell "first
  attempt" apart from "just loaded for this and still thinks it needs another load," and refuses
  to loop a second time. **This safety net is still in the code and should stay** — it's cheap
  insurance against a future map-comparison regression turning into another performance-tanking
  loop.

**End state, confirmed by Roc directly**: pressing Play now shows the story UI, clicking choices
moves between screens, cross-map choices actually load the other level, and camera changes are
visible (not just on level load) most of the time.

---

## 2. Real gotchas found tonight, worth carrying forward

1. **`unreal.EditorActorSubsystem()` must never be called as a constructor.** Use
   `unreal.get_editor_subsystem(unreal.EditorActorSubsystem)`. Calling it as a constructor
   triggered a fatal `World Memory Leaks` assertion that froze the editor's RPC bridge behind a
   native dialog — no MCP tool can see or dismiss that dialog; only a manual editor restart
   recovers. Same class of blocking-modal incident the morning handoff already warned about for a
   different cause.

2. **`DataTableTools.set_rows` silently drops a `TSoftObjectPtr` value written as
   `{"refPath": "..."}`** — the shape its own `get_schema` documents, and the shape that works
   fine for `GameplayTag` fields in the same call. The working shape is a bare string:
   `{"map": "/Game/Maps/L_Town.L_Town"}`. This cost most of a session to find because the write
   call reports success with no error — **always read a row back after writing it** if the field
   matters, don't trust the return value alone.

3. **`UWorld::GetMapName()` does not strip the PIE instance prefix in UE 5.8.1**, contrary to its
   documented behavior (confirmed by direct log evidence: `CurrentMapName` was genuinely
   `"UEDPIE_0_L_Town"`). Any code comparing a live world's map identity against an asset-path-
   derived name needs `EndsWith` (or equivalent), not exact match, inside PIE.

4. **Live Coding cannot safely add new class members**, reflected or not — the risk isn't UHT
   reflection specifically, it's that adding ANY member changes `sizeof(the class)`, and existing
   live instances were allocated with the old size. Every fix tonight that needed new "memory"
   (the loop-breaker, specifically) was implemented by repurposing an existing member's lifetime
   instead of adding one. If a future fix genuinely needs new persistent state, that's a signal to
   do a full rebuild (`Build.bat`, editor closed), not another Live Coding patch.

5. **Camera rig placement needs to respect the actual level's scale.** A grid spaced by a few
   hundred/thousand units looks like nothing when the vendor level spans tens of thousands of
   units. Measure the level's real content footprint (static mesh actor bounds, excluding
   oversized sky/backdrop actors) before placing placeholder cameras, or the blend will be
   technically-correct and visually invisible — which reads exactly like a bug and wastes a
   debugging pass (see "Eighth pass" — this is what actually happened here).

---

## 3. Next session — exact resume steps

1. **Confirm the module loaded and the fixes are live:**
   ```python
   import unreal
   print(hasattr(unreal, 'RebirthScreenPresenter'), hasattr(unreal, 'RebirthScreenCameraRig'))
   ```
2. **Re-verify Step 0** (inject + tag-drift check), same as every session — see the morning
   handoff §6 for the exact snippet, unchanged.
3. **Press Play, click through several screens**, both same-map and cross-map, watching for:
   - **Paca #158** — does the camera blend ever visibly fail to happen? Get the specific pair of
     screens and order, then grep `rebirth.log` for `ApplyScreen(` around that moment — the
     diagnostic logging added this session (`TargetMap`/`CurrentMapName`/`PendingScreenTag`, plus
     `No camera rig registered` warnings) should show exactly what happened without needing to
     re-derive it. If the log shows nothing wrong, the leading suspect is
     `SetViewTargetWithBlend` having no protection against two screen changes landing within one
     `BlendTime` (1.2s default) — worth a targeted test (click two choices fast) if the log's
     clean.
   - **Paca #159** — cross a real map boundary (e.g. Town → Forest) mid-playthrough, past Day 1,
     and confirm whether the story state (day, choices made) survives or resets. If it resets,
     instrument `ARebirthPointerController::BeginPlay()`'s `FlowState != Boot` early-return
     specifically (log whether it actually fires on this path) — that's the fastest way to
     confirm or rule out the leading suspect without guessing.
4. **Once both are resolved (or scoped)**, continue down the plan's own sequence
   (`plans/2026-08-11-unreal-feature-complete-plan.md` §16): hotspot content is the next real gap
   — `ARebirthInteractableActor` is abstract with zero subclasses placed anywhere, so nothing in
   the 3D view is clickable yet (all interaction currently goes through `WBP_Story`'s text choice
   list only). That's genuine content-authoring work (placing `BP_Hotspot_Examinable`/`_Forage`/
   `_Exit` actors per screen), not another wiring fix.
5. **Task #157** (NPC presence — `present_<soul>` never gets set) is still open and untouched this
   session — it's a resolver-side fix (`tools/resolver/src/ink.ts`), unrelated to anything done
   tonight.

## 4. Not done, not started

Hotspot content (examinables/forage/exits — the click layer has no actual clickable objects yet),
NPC placeholder actors (blocked on Task #157), the notebook, the debug overlay, any real level
art/dressing (both maps are still vendor demo scenes, tracked in the asset-swap list), Home Hub's
3D space (still text-only via `WBP_Story`). Perforce: everything from tonight is uncommitted,
sitting in the workspace on top of whatever changelist state existed before this session — no
`p4 submit` happened.

---

*Design flows from RL_MAP; implementation lives in `rebirth.uproject`, workspace
`roclee_CCI-MSiAegis-02_459`. Task state is in Paca, not here.*
