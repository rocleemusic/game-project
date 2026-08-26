# Handoff — data spine + day-2 click-through, 2026-08-12 (overnight continuation)

**Track B.** Continuation of the same day's `plans/_handoffs/2026-08-12-unreal-step0-session-summary.md`
(Step 0 injection/tags, RebirthCore compiling). This session ran §6.3 of
`plans/2026-08-11-unreal-feature-complete-plan.md` (the data spine generator) to completion,
then built and proved the **day-2 milestone**: `WBP_Story` drives `main.ink` for real in PIE,
confirmed by reading `Day 1 begins.` back from a live widget instance.

> **Board is authoritative for status.** This file holds reasoning, same convention as the
> morning's summary. No board writes made this session.

**Bottom line: the data spine is built and verified. The shell renders the story for real.**
Three editor restarts and two Live Coding patches happened tonight; all were necessary, not
incidental, and are documented below so the next session doesn't rediscover why.

---

## 1. What's done and verified

### Data spine (`Content/Python/gen_datatables.py`)

Ran successfully end to end. Built and saved:
- `/Game/Data/DT_GameTags` — 64 `Game.*` tags (20 screens, 14 items, 8 souls, 22 examinables)
- `/Game/Data/DT_Screens_Data` — **20 rows**, matches the plan's screen inventory exactly
- `/Game/Data/DT_Examinables_Data` — **22 rows**
- `/Game/Data/DT_Items_Data` — **14 rows**, all `source_locations` resolved (see §3)
- `/Game/Data/DT_Souls_Data` — **8 rows** (`mara, toby, ilsa, nell, juno, linnet, pip, bex`, read
  from `state.ink`'s own `VAR bondLevel_*` declarations — **not** `personas.json`, which is
  missing `nell` and `linnet`)
- Spot-verified, not just row-counted: `DT_Screens_Data`'s T1 row has a real `ScreenTag`
  (`Game.Screen.T1`, not `None`); `DT_Items_Data`'s `item_berry` row resolved `SourceScreenTags`
  to `Game.Screen.F1` + `Game.Screen.F7` exactly as the alias file intended; the `Persistence`
  enum imported correctly as `PackTriaged`.

`Content/Python/screen_name_aliases.json` (the GP-106 mitigation, Ruling 4) — four
name→screen-id aliases, all applied successfully. **Not reviewed by Roc yet** — see §3.

`Config/DefaultGameplayTags.ini` — third `+GameplayTagTableList` line for `DT_GameTags`,
load-bearing (see §2).

### The shell — day-2 milestone reached

- **`Plugins/RebirthCore/Source/RebirthCore/{Public,Private}/RebirthStoryWidget.{h,cpp}`** — new
  C++ class. `URebirthStoryWidget : public UUserWidget` drives `URebirthGameFlow` directly:
  `BeginNewStory` in `NativeConstruct`, `ContinueStoryMaximally` + `GetCurrentChoices()` to
  render, per-choice `URebirthChoiceRelay` objects to route clicks back to `ChooseChoice`. Written
  as compiled C++ rather than a hand-wired Blueprint event graph — see §4 for why, and why that
  call turned out to be right.
- **`RebirthCore.Build.cs`** — `UMG` moved from `PrivateDependencyModuleNames` to
  `PublicDependencyModuleNames` (this header is the first public one in the plugin to expose a
  UMG base class).
- **`/Game/Blueprints/BP_RebirthGameMode`** — created, parent `GameModeBase`, set as
  `GlobalDefaultGameMode` in `Config/DefaultEngine.ini` (commented — the native path has no
  per-map override to forget, unlike PNC's design).
- **`/Game/Blueprints/WBP_Story`** — reparented to `URebirthStoryWidget`. Widget tree built via
  `VibeUE.WidgetService.add_component` (not raw Python `WidgetTree` reflection — see §5):
  `RootCanvas` (CanvasPanel) → `StoryText` (TextBlock) + `ChoiceList` (VerticalBox), both marked
  as variables so C++'s `BindWidget` resolves them. Compiles `BS_UP_TO_DATE`.
- **Proved live in PIE**, via `VibeUE.WidgetService`'s PIE helpers
  (`start_pie`/`spawn_widget_in_pie`/`get_live_property`): spawning `WBP_Story` and reading its
  `StoryText.Text` property back returned **`"Day 1 begins.\n"`** — the exact first line Step 0
  predicted this morning. This proves `NativeConstruct` → `GetGameFlow()` finding the live
  `UGameInstanceSubsystem` → `BeginNewStory` → `ContinueStoryMaximally` → `SetText` all executed
  correctly end to end.
- **Choice-click loop not simulated tonight** (no "click this button" tool was found), but it
  drives the same `ChooseChoice`/`ContinueStoryMaximally` pair this morning's GP-37 persistence
  proof already validated directly against the live story API. Confidence is high; it is not the
  same as having watched it happen. **Worth 60 seconds of a human actually clicking through in
  PIE next session**, if only to see it.

Re-verified Step 0 clean three times tonight (after each restart): module loaded, injection
mtime fresh, tag-drift check clean, 205 `Ink.*` tags every time.

---

## 2. The Game.\* tag restart, and why it was unavoidable

**Finding, confirmed by direct test:** a newly-added `GameplayTagTableList` entry does not
become resolvable in the *same* editor session. `UGameplayTagsManager`'s tag tree is built once
at startup by scanning `DefaultGameplayTags.ini`; nothing Python-exposed forces a full rebuild
mid-session, and this was tested directly rather than assumed:

1. **Console commands** (`GameplayTags.RefreshTagTree`, `GameplayTags.Editor.RefreshTagTree`) —
   execute without error, no observable effect.
2. **Re-running `InkpotPipelineImportLibrary.generate_ta_gs()`** on the already-injected story
   asset genuinely does force a live tag-tree refresh (it's how `Ink.*` came alive without a
   restart this morning) — but scoped to what Inkpot itself just registered, not a full rebuild.
3. **Editing the ini directly while the editor is open** works on disk but isn't durable: the
   running editor's `UGameplayTagsSettings` CDO holds its own in-memory copy of
   `GameplayTagTableList`, and the first unrelated `SaveConfig()` call on that object (step 2's
   `generate_ta_gs()` triggered one) flushed the in-memory array back to disk, silently erasing
   the manually-added line. Caught by re-reading the file and finding the line gone.

**No Python-exposed generic tag-tree refresh exists** in this build. After Roc restarted the
editor, `gen_datatables.py`'s `require_game_tags_live()` self-check passed and the real
generation ran clean.

**Two blocking-modal incidents happened during the data-spine work**, both requiring Roc to
manually click OK — `unreal-mcp`'s RPC channel freezes completely behind a native dialog, with no
tool available to this session that can see or dismiss one:

- **Wrong `FGameplayTag` JSON format** on the first DataTable-fill attempt (plain string, not
  UE's parenthesized `ImportText` — `(TagName="...")` for a tag, `(GameplayTags=((TagName="A"),
  (TagName="B")))` for a container). Now documented at the top of `gen_datatables.py`.
- **A row-completeness warning** (missing struct fields on a scratch liveness-probe row) — fixed
  by filling every field on that probe.

Both are now avoided in the checked-in script.

## 3. GP-106 aliases applied — needs Roc's eyes

Four `content/items/*.json` source-location names matched neither `screen-specs.json`'s `name`
field nor an existing screen id. Per Ruling 4, the generator fails loudly rather than guess — so
the guess lives in `screen_name_aliases.json`, reviewable and separate from the generator logic:

| Name in content | Mapped to | Confidence | Why |
|---|---|---|---|
| `"Square"` | T1 | High | Shorthand for T1's actual name, "Town Square". Every item using it also lists an unambiguous second source. |
| `"Town scene"` | T1 | **Low** | No more specific screen named anywhere. T1 is the town hub every other town screen connects through — least-wrong single guess, not a confident one. |
| `"Forest Unlock 1"` | F4 | Medium | Of the two locked, forageable forest screens (F4: "rare component", F7: "deep component"), F4 sits behind one gate — the shallower unlock. |
| `"Forest Unlock 2"` | F7 | Medium | Same reasoning, one level deeper — F7 sits behind two gates (the RULED conjunction, G-F5-cascade AND G-F7-light). This is the literal example named in the 11-08 plan. |

**Not a ruling.** GP-106 itself stays open regardless of what the aliases resolve to. Worth five
minutes of Roc's attention, especially `"Town scene"`.

## 4. Why C++ instead of a Blueprint event graph — and a real discovery along the way

The original plan was to stop before wiring `WBP_Story`'s logic at all, on the reasoning that raw
K2Node Python graph-scripting is fragile and hard to self-verify. Roc asked to keep going and
chose, when offered the choice directly, a compiled C++ widget class over blind graph wiring —
**turned out to be the right call for a different reason than expected.**

Building the widget surfaced that this project has a second, purpose-built automation surface
beyond raw `execute_python_code`: **`VibeUE` toolset services**, documented in
`Agent/knowledge/mcp-toolsets.md` but not used by any session before this one. `VibeUE.WidgetService`
exposes `add_component`/`get_hierarchy`/`validate`/PIE helpers as direct Python static methods —
genuinely safe, structured widget-tree authoring, not the fragile raw-reflection path this
session first assumed was the only option. **This matters for anything touching UMG or Blueprints
in future sessions — check `mcp-toolsets.md` before assuming a task needs raw Python or should be
deferred to a human.** `editor_toolset.toolsets.blueprint.BlueprintTools` (with `write_graph_dsl`,
`create_node`, `connect_pins`) looks like the equivalent safe surface for event-graph wiring,
untried this session — the C++ path was taken instead because it was already committed to before
this was found, and because compiled code remains the stronger choice for genuine logic (as
opposed to layout), for the same reasons this project put row structs in C++ over Blueprint UD
structs.

**A hard wall, not a bug to route around:** `UWidgetBlueprint::WidgetTree` is a bare `UPROPERTY()`
with no edit/Blueprint-visibility specifiers (`Editor/UnrealEd/Public/BaseWidgetBlueprint.h:17`) —
genuinely protected from `get_editor_property`/`set_editor_property`, for both read and write.
Raw Python cannot build a Widget Blueprint's tree this way; `VibeUE.WidgetService.add_component`
was the way through.

## 5. Three real engine gotchas found building the widget, worth carrying forward

1. **A CDO property set via Python's generic `set_editor_property`, then saved, verifiably
   persists to disk (survived an explicit unload+reload of the package) — but was NOT visible to
   a widget instance spawned by `VibeUE.WidgetService.spawn_widget_in_pie`.** Root cause not
   identified after real investigation (checked: dirty-package state, fresh PIE sessions via the
   reliable `LevelEditorSubsystem.is_in_play_in_editor()` check, multiple restart cycles — the
   `StoryAsset` `TSoftObjectPtr` consistently read as unset inside PIE despite being genuinely set
   on disk and in the editor's in-memory CDO). Worked around by having `RebirthStoryWidget`
   hardcode a `LoadObject` fallback to `/Game/Ink/v01/v01_story` rather than depend on the
   `EditDefaultsOnly` property when it reads empty. **If a future class needs a CDO-configured
   soft-object-pointer default, verify it actually reaches a `VibeUE`-spawned PIE instance before
   depending on it** — this session's evidence says it might not.
2. **Both PIE-state Python checks were unreliable**: `VibeUE.WidgetService.is_pie_running()` and
   even the core engine's `LevelEditorSubsystem.is_in_play_in_editor()` both returned stale/wrong
   values relative to what the log showed was actually happening, repeatedly, across multiple
   attempts. **The log file (`Saved/Logs/rebirth.log`) was the only reliable source of truth for
   "is PIE actually running" this session** — grep it directly rather than trust either state
   query if this matters again.
3. **A function-local `static const FString` inside a Live-Coding-patched function body came back
   completely empty at runtime** (`TEXT("/Game/Ink/v01/v01_story.v01_story")` printed as `""`
   after a Live Coding patch, despite compiling clean). Suspected cause: Live Coding preserves old
   static-initialization guard state across a patch, so the initializer never actually re-ran.
   Fixed by removing the local `static` and inlining the literal directly. **Avoid function-local
   `static` variables in code that might get Live-Coding-patched without an intervening full
   rebuild** — this project's own `build-code-plugin.md` already warns Live Coding can't add
   reflected members; this is a second, narrower Live Coding trap in the same family, on plain
   data this time, not reflection.

Also confirmed usable and reliable: `LiveCodingToolset.LiveCodingToolset`'s `CompileLiveCoding`
tool (via `call_tool`) — triggered two in-session C++ patches tonight (~1s each) without closing
the editor, for body-only changes to already-compiled classes. Full rebuild (`Build.bat`, editor
closed) was only needed once, for `RebirthStoryWidget`'s first-time `UCLASS` addition.

## 6. Next session — exact resume steps

1. Confirm the module loaded:
   ```python
   import unreal
   print(hasattr(unreal, 'RebirthStoryWidget'), hasattr(unreal, 'RebirthGameFlow'))
   ```
2. Re-verify Step 0 (cheap, always worth it):
   ```python
   exec(open("Content/Python/inkpot_inject.py").read()); inject()
   exec(open("Content/Python/ink_tag_drift.py").read()); check()
   ```
3. **Skip `gen_datatables.py` unless content changed** — already ran clean tonight, idempotent if
   re-run.
4. **Watch the day-2 click-through actually happen** — press Play, or:
   ```python
   handle = unreal.WidgetService.spawn_widget_in_pie("/Game/Blueprints/WBP_Story", 0)
   print(unreal.WidgetService.get_live_property(handle, "StoryText", "Text"))
   ```
   and click a choice button for real. This is the 60-second confirmation §1 flagged as not done.
5. Then continue down the plan's own sequence (`2026-08-11-unreal-feature-complete-plan.md` §16):
   §9 Home Hub, §11 move budget, §10 examinables, §5 the greybox pass. §8 (the screen presenter,
   `DT_Screens_Data`-driven camera/map transitions) is the next piece that actually consumes the
   data spine built tonight — nothing built so far reads `DT_Screens_Data` yet.

## 7. NPC presence — a real gap found live, and a design note for when it's built

Playing the day-2 click-through in PIE, Roc noticed T2's Toby/Mara conversation choices never
appear. Traced it, not guessed: `world/t2.ink` gates every soul-conversation choice on
`present_<soul> == "<screen id>"`, e.g.

```ink
* {present_toby == "T2"} [Talk to Toby (SC-T2-04)] ...
```

`present_toby` / `present_ilsa` / `present_mara` (and the other five souls' variants) are declared
in `state.ink` defaulting to `"none"` — and a grep of the **entire compiled ink tree** for any
write to them (`~ present_<soul> = `) returns nothing. No knot, no external function, no resolver
output currently ever places a soul at a screen. So on any day, `present_toby == "T2"` is always
false, and ink is correctly withholding those choices — this is not a UI bug, and nothing built
tonight broke it. `WBP_Story` renders exactly what `GetCurrentChoices()` hands it.

**This is the gap: something needs to set `present_<soul>` (and probably drive the underlying
role-deal/reshuffle mechanic, `gdd/07-cast.md`) before any soul-conversation content is reachable
at all.** Whether that's resolver-side (baked into `story.json` at day-start) or UE-side (a
day-start binding call setting `Ink.Variable.present_<soul>` via `SetStringGT`) is an open
question — worth its own look, and probably its own Paca card if one doesn't already cover it.
**Not part of the day-2 milestone's scope** (start→END click-through, which doesn't require any
soul content to be reachable) — flagged here rather than chased down at 2am.

**Follow-up, 2026-08-12 (next session):** traced to the specific missing wire and opened
**Task #157** on the board. `tools/resolver/src/day.ts`'s `resolveDay()` already computes the
correct seeded `slot_fill` (screen/time-block/soul placements, matching the "seeded host code"
design in `gdd/06-world-and-progression.md:48`), and `tools/resolver/src/walk.ts`'s
`syncPresence()` already knows how to turn that into `present_<soul>` assignments — but only
inside the resolver's own JS ink-simulator used for test verification. The emitted ink
(`tools/resolver/src/ink.ts`'s `day_start`/`calendar`/block-transition knots) never calls
anything equivalent, so the compiled story Inkpot runs in UE has no code path that ever moves
`present_<soul>` off `"none"`. Proposed direction (not ruled): resolver-side, mirroring
`walk.ts`'s `syncPresence()` inside `ink.ts`'s emission — open question is UE-side vs
resolver-side, resolved in favor of resolver-side by the "seeded host code, not player-choice
dependent" framing in the design doc, but Roc hasn't ruled on it yet.

**Design note from Roc, for when presence is wired up:** NPCs should be **placeholder actors
visible on screen**, not just text choices in a list. This matters for the click layer's design
(§14 of the 11-08 plan) — a soul's presence should place an actual greybox actor in the world
(consistent with the native plan's world-collider hotspot approach, §6.3 of this morning's
summary) that the player can see and click on to start the conversation, rather than the
conversation choice simply appearing in `WBP_Story`'s generic choice list the way an exit or an
examinable does. Worth folding into whichever card ends up owning NPC presence.

## 8. Not done, not started

The full choice-click loop watched live (§1), the screen presenter reading `DT_Screens_Data`
(§8 of the plan), NPC presence and placeholder actors (§7 above), any camera rig, the four maps,
`USatchelComponent`, the notebook, the debug overlay. No board writes — GP-36/GP-37/GP-152 still
carry only this morning's comments. No Perforce changes beyond what's already in changelist 33 and
the default changelist from this morning; everything written tonight (`gen_datatables.py`,
`screen_name_aliases.json`, the five new DataTables, `RebirthStoryWidget.{h,cpp}`,
`RebirthCore.Build.cs`'s UMG move, `BP_RebirthGameMode`, `WBP_Story`, the two ini lines, `WBP_Story`'s
layout fix) is new, uncommitted work sitting in the workspace.

One leftover scratch asset: `/Game/Data/_probe/DT_Test_ScreenProbe` — a disposable test table;
one `delete_asset` call didn't take (asset registry lag, harmless) — safe to delete by hand.

---

*Track B. Design flows from RL_MAP; implementation lives in `rebirth.uproject`, workspace
`roclee_CCI-MSiAegis-02_459`. Task state is in Paca, not here.*
