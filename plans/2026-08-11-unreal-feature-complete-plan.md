# Unreal feature-complete plan — start screen to end screen

**Written 2026-08-11. Track B (visual/asset build).** Capstone Tue 2026-08-25, content freeze Fri 2026-08-21.

This plan takes the Unreal build from where it is today — a landed ink spike — to a **feature-complete click-through**: a player launches the game, presses New Game, plays five days through the Home Hub and the calendar, clicks examinables that open gated content, moves between screens on a real move budget, carries a satchel, reads a notebook, reaches festival night, sees the final screen, and returns to the start. Placeholder assets throughout — greybox cubes are fine, and packs already in the workspace are better.

**Feature-complete here means no dead ends and no missing verbs, not finished art.** Art is a separate axis and is explicitly out of scope.

**Scope boundary.** This is Track B. Track A (narrative content, ink/html) runs in parallel and this plan must never gate it — [`../gdd/13-scope-and-risks.md`](../gdd/13-scope-and-risks.md) sequencing gates. Everything below reads from the resolver's output and writes nothing back into it.

---

## 0. Verified ground

Everything in this section was read off disk on 2026-08-11 and carries the file it came from. Contrast with §1, which is what I could not verify.

### 0.1 The pre-compiled JSON question is answered

This was named the load-bearing unknown. It resolves from Inkpot's own source, already present in the workspace at `Plugins/Inkpot/` (v1.40.21).

| Finding | Evidence |
|---|---|
| The drag-drop importer accepts **`.ink` only** | `Source/InkpotEditor/Private/Asset/InkpotStoryAssetFactory.cpp` — `Formats.Add(TEXT("ink;"))`, and `FactoryCanImport` returns `Filename.EndsWith("ink")` |
| Import **always** recompiles with the bundled inklecate | Same file, `LoadAndCompileStory` → `UInkpotImportPipelineLibrary::CompileInkFile`. Binary at `Plugins/Inkpot/ThirdParty/InkCommandLine/windows/inklecate.exe` |
| But pre-compiled JSON **can** be injected | `Source/Inkpot/Public/Asset/InkpotStoryAsset.h` — `SetCompiledJSON(const FString&)` is `UFUNCTION(BlueprintCallable)`. The header's own comment: *"This is required for the story to be loadable by the Ink runtime."* |
| A supported custom-importer hook also exists | `UInkpotSettings::CustomImportClass` → `UInkpotImportPipeline`, dispatched by `ExecuteCustomImportPipeline` in the factory |
| The runtime's ink format version **matches ours exactly** | `Source/InkPlusPlus/Public/Ink/Story.h:175` — `inkVersionCurrent = 21`; line 190 — `inkVersionMinimumCompatible = 18`. The resolver emits `inkVersion 21` |

**Conclusion:** the seam is not blocked. There are three routes, and the choice is an engineering preference, not a discovery. §3 picks one.

### 0.2 The spike already landed and the GO already fired

The board (Paca `game-project`, prefix `GP`) shows the whole Track C probe sequence closed:

| Card | State |
|---|---|
| GP-32 (Perforce workspace sanity check) | **Done** |
| GP-33 (choose the ink runtime — inkcpp vs Inkpot) | **Done**, `ruled:2026-08-02` |
| GP-34 (SPIKE — one ink scene playable in Unreal) | **Done**, `ruled:2026-08-03` |
| GP-35 (GO / NO-GO — Unreal or the ink/html fallback) | **Done**, `ruled:2026-08-03` |
| GP-58 … GP-62 (Inkpot build prerequisites, standalone build, `.ink` import canary, sample maps, save/load round-trip) | all **Done** |
| **GP-36 (scenes into engine — static-camera setup + point-and-click toolkit)** | **Backlog** |
| **GP-37 (persistence — save/load carries state across a reshuffle)** | **Backlog** |
| **GP-38 (Wwise — GameplayTag to asset library)** | Backlog, `tier:should` |

GP-35's hard date was Mon 2026-08-10 with NO-GO firing by default. It closed on 8/03 — **seven days early, GO**. Everything in this plan sits downstream of that ruling.

Physical evidence in the workspace, consistent with the spike:

```
Content/Ink/BP_InkSpikeSpawner.uasset
Content/Ink/WBP_InkSpike.uasset
Content/Ink/v01/v01_story.uasset          (UInkpotStoryAsset, 260 KB)
Content/Ink/v01/main.ink, state.ink, system/, world/, souls/
```

`rebirth.uproject` has `{"Name": "Inkpot", "Enabled": true}` and `"EngineAssociation": "5.8"`.

### 0.3 Inkpot generates real Unreal GameplayTags from the story

Verified in `Source/InkpotEditor/Private/GameplayTags/InkpotTagUtility.cpp`:

- `CopyTagsFromStoryToTable` sets `TagTable->RowStruct = FGameplayTagTableRow::StaticStruct()` — a native gameplay tag table, not a parallel system.
- `AddTableAssetToGameplayTagTableList` adds the asset to `UGameplayTagsSettings::GameplayTagTableList` and calls `UGameplayTagsManager::EditorRefreshGameplayTagTree()`.
- Prefixes, from `Source/Inkpot/Public/Inkpot/InkpotGameplayTagLibrary.h:9-11`: `Ink.Origin.`, `Ink.Path.`, `Ink.Variable.`

So three namespaces are generated from the story, free, on every rebuild:

| Namespace | Source | What our content yields |
|---|---|---|
| `Ink.Origin.<List>.<Item>` | every LIST member (`CopyOriginTagsToTable`) | `Ink.Origin.KnownPhrases.shelf_seen`, `Ink.Origin.Satchel.herbs`, `Ink.Origin.TimeOfDay.evening` |
| `Ink.Path.<container path>` | every knot and stitch, recursively (`CopyPathTagsToTable`) | `Ink.Path.t2`, `Ink.Path.t2.stall_goods`, `Ink.Path.home_hub.hub_night`, `Ink.Path.calendar` |
| `Ink.Variable.<var>` | every VAR (`CopyVariableTagsToTable`) | `Ink.Variable.day`, `Ink.Variable.movesLeft`, `Ink.Variable.bondLevel_toby`, `Ink.Variable.pickedStartScreen` |

Every Inkpot story API has a `…GT` variant taking `FGameplayTag` — `ChoosePathGT`, `ContinueMaximallyAtPathGT`, `SetListGT`, `GetValueGT`, `SetOnVariableChangeGT`, `VisitCountAtPathStringGT`. So the tags are the intended addressing mode, not a convenience.

**Three cautions, all load-bearing:**

1. **No `_TAGS` asset exists in the project today.** `find Content -iname "*_TAGS*"` returns nothing, and `Config/DefaultGameplayTags.ini` is empty. So tag generation has never actually run here — consistent with `v01_story.uasset` having been created outside the import factory, or with `bAutogenerateGameplayTags` off in Inkpot preferences. **Unproven; §4 tests it first.**
2. **The plugin's own source flags a registration wart.** `AddTableAssetToGameplayTagTableList` carries the comment *"save confif \*should\* save back to the ini file, but does not seem to work"* [sic]. Registration may need writing into `Config/DefaultGameplayTags.ini` by hand and committing to Perforce.
3. **`Ink.Path.*` tags derive from container names the resolver generates.** Rename a knot and the tag changes; any DataTable row keyed on the old tag breaks silently. §4.4 adds a validation pass.

### 0.4 The emitted ink in the repo is stale, and the Perforce copy is staler

`tools/resolver/data/screen-specs.json` declares an examinable on T2 with a knowledge flag:

```json
{ "id": "ex-shelf", "clue_tier": "soft-signpost", "region": "r_ex_shelf",
  "knowledge_flag": "shelf_seen" }
```

`tools/resolver/src/ink.ts:349-357` emits exactly the machinery for it:

```ink
{ not (KnownPhrases ? shelf_seen):
    ~ KnownPhrases += shelf_seen
    ~ recordKnowledge("shelf_seen")
}
```

But `lantern-projects/v01/ink/world/t2.ink` contains only the `stall_goods` stitch. **`ex-shelf` is absent from the emitted output.** The emitter supports it; the run folder predates the data.

`Content/Ink/v01/` in Perforce is a copy of that already-stale tree, dated 2026-08-03 — staler still.

**Consequence:** the examinable step (§8) has exactly one end-to-end proof case, `ex-shelf`, and it does not exist in any emitted artifact yet. A resolver rebuild is a prerequisite. **That rebuild belongs to the parallel resolver session — this plan reads `tools/resolver` and `lantern-projects` and changes nothing in either.**

### 0.5 The satchel is declared and never written

`lantern-projects/v01/ink/state.ink:10`:

```ink
LIST Satchel = deep_component, dirt, feathers, grass, herbs, lantern_oil,
               mushrooms, rare_component, river_stones, sticks, wool
```

`grep -rn "Satchel" lantern-projects/v01/ink` returns that declaration and **nothing else**. No `Satchel +=` anywhere. And `tools/resolver/src/ink.ts` never reads the `forage` or `item_slots` fields off a screen spec — T2 declares `"forage": ["herbs", "lantern-oil", "wool"]` and `t2.ink` emits no forage stitch.

**Collect is in exactly the state examinables were in when GP-111 was found:** authored data on one side, no machinery on the other. This is a fork requiring a ruling — §2, Ruling 1.

### 0.6 The point-and-click toolkit is not installed

`Content/Fab/` holds character and prop packs only:

```
Female_-_Style_3__Pose_4__Running_
Low_Poly_Stylized_Rustic_Chest_–_Hand-Painted_Game-Ready_3D_Asset
Megascans
Stylized_Medieval_China_Characters_–_Free_Set
Stylized_Paladin
```

`gdd/12-technical-overview.md:7` names "the Point-and-Click toolkit (Fab marketplace)" and GP-36 names it in its title. It is not present. **Roc evaluates after this plan is written** (his call, 2026-08-11) — §14 sets out the boundary that keeps the decision cheap either way.

### 0.7 The shell does not exist in ink, and should not

`main.ink` line 24 is `-> day_start`. There is no start screen, no New Game, no restart. `final_screen` ends:

```ink
Start a new game to live it again. #id:SYS-FINAL-RESTART
-> END
```

So **the outer shell is entirely Unreal's job** — main menu, New Game, the loop back after END. Nothing to add to ink, nothing to ask of Track A. That is a good boundary and this plan keeps it.

### 0.8 Greybox assets already in the workspace

No purchases needed for a placeholder pass:

| Pack | Use |
|---|---|
| `Content/Stylized_Medieval_Town` | Town screens T1–T6, T8. Ships `Map/Demo_level.umap` + `Map/Overview.umap` |
| `Content/Fantastic_Village_Pack` | **Ships paired `map_village_day.umap` and `map_village_night.umap`** — directly useful for the TN night screen |
| `Content/Stylized_Forest` | Forest screens F1–F8. `Maps/Demonstration.umap`, `Maps/Overview.umap` |
| `Content/Polytope_Studio/Nature_Free` | Forest set dressing |
| `Content/Stylized_Rocks` | Forest, the cave (F7), the shrines (T8/F6) |
| `Content/StylizedProvencal` | Interiors — T5 (A Neighbor's Home), HOME |
| `Content/StylizedWeather` | Evening/night atmosphere passes |
| `Content/Synty/SidekickCharacters` | NPC placeholders for soul slots |
| `Content/Food_Pack_01`, `Fab/…Rustic_Chest` | Item and examinable placeholders |
| `Content/Fab/Megascans` | Ground and prop detail if needed |

**Optional external suggestions, none required:** a Fab point-and-click template (see §14 for how to judge one), and a UI icon set if the notebook and satchel need more than text. Both are polish, both are after 8/21 territory.

---

## 1. Assumptions and what I could not verify

Stated plainly rather than smoothed over. Each is a thing this plan depends on that I read from disk but could not *run*.

| # | Assumption | Why unverified | If wrong |
|---|---|---|---|
| A1 | `WBP_InkSpike` / `BP_InkSpikeSpawner` actually play a scene end-to-end | `.uasset` binaries; I cannot open the editor | Redo the spike's plumbing as part of §5. Low cost — the API surface is confirmed. |
| A2 | `v01_story.uasset` was produced by `.ink` import rather than JSON injection | The `.uasset` string table shows only `AssetImportData` and class paths; source and JSON are compressed in export data | Only affects which route §3 calls "already proven." Both routes remain open. |
| A3 | `SetCompiledJSON` from editor Python produces an asset the runtime loads identically to an imported one | Requires running it | Fall back to `.ink` import (§3, Route B). This is the reason §4 tests injection on day one. |
| A4 | Inkpot's `bAutogenerateGameplayTags` and `bAutoUpdateGameplayTagsList` preferences are at their defaults | Preferences are editor config, not in tracked files I read | §4.3 checks and sets them explicitly. |
| A5 | The bundled inklecate compiles our emitted ink without error | Never run against `main.ink` here; the spike's success is A2-dependent | Fall back to injection, which skips inklecate entirely. The two routes fail independently — that is why both stay documented. |
| A6 | `unreal-mcp` at `127.0.0.1:9000/mcp` is reachable this session | Depends on the editor being up | Every step below has a manual equivalent. Nothing here requires MCP. |
| A7 | The parallel resolver session's rebuild will emit `ex-shelf` into `t2.ink` | The emitter's code path is confirmed; the run has not happened | §8's proof case slips; the rest of §8 still builds against the other 19 examinables, which have no knowledge flag. |
| A8 | The 20 screens in `screen-specs.json` are final for the slice | `data/screen-specs.json` is marked `"provisional": true` in `seams.json`'s sibling note | The Screens registry (§6) is generated, so a change is a regen, not a rebuild. This is the main reason to generate it. |

---

## 2. Rulings needed from Roc

Blocking status is stated for each. Nothing below is decided by this plan.

### Ruling 1 — who owns the satchel *(blocking §12 only; everything else proceeds)*

Per §0.5, `LIST Satchel` is declared and unwritten, and the resolver emits no forage.

- **Option A — Unreal owns it, ink holds a mirror.** UE runs pickup, capacity and pack-triage. On change, UE pushes `SetListGT(Ink.Variable.Satchel, …)` into the story so ink conditions can read the satchel. **This is an existing precedent, not a new pattern:** `tools/resolver/src/graph.ts:34` declares `HOST_MIRROR_WRITER` for exactly this shape and its comment names it *"mirror in, event out."* Requires zero resolver change, so it cannot collide with the parallel session.
- **Option B — the resolver grows forage emission.** Architecturally cleaner: the world file would emit forage stitches the way it emits examinable stitches. But it is work in `tools/resolver`, which is off-limits this week, and it puts a Track A/B dependency on the critical path 14 days out.

**Recommendation: A.** It matches a precedent already in the code and keeps Track B self-contained. B is the right long-term shape and belongs in a post-capstone card.

### Ruling 2 — the notebook has no card *(non-blocking; flagging a gap)*

The notebook is canonical in four GDD places:

- `gdd/01-concept.md:17` — the *Outer Wilds* reference: "a notebook tracks items and spells you've collected and tracks relationships between npcs you've uncovered"
- `gdd/03-core-loop.md:14` — "You carry a satchel and a notebook. The notebook can be referenced at any time and holds the knowledge you have collected"
- `gdd/03-core-loop.md:70` — "The **notebook is introduced as a found object** — you pick it up, and it is already yours"
- `gdd/04-magic-system.md:7` — "A spellbook section in the notebook records the spells you have learned"

I found no Paca card for it. §13 plans it, because a feature-complete click-through without the notebook is not feature-complete against the GDD. But it should exist on the board. **Card creation is not gated** under the PM seat's split authority (`CONTEXT.md`) — I have simply not created one, because this is a planning turn.

### Ruling 3 — point-and-click toolkit *(deferred by Roc to after this plan)*

Covered in §14 with evaluation criteria and the interface boundary that makes either answer cheap.

### Ruling 4 — GP-106, screen names vs screen ids *(non-blocking; affects §6)*

GP-106 (*Content `source_locations` and screen ids are different vocabularies*, Backlog) is live and this plan runs into it. `content/items/item_berry.json` reads:

```json
"source_locations": ["Forager's Clearing", "Forest Unlock 2"]
```

Those are screen **names** (and one is not even a current name — no screen in `screen-specs.json` is called "Forest Unlock 2"; F5 is "Old-Growth Hollow"). The Screens registry keys on **ids** (F1, F5).

The generator in §6 can resolve by name lookup and will **fail loudly on any unmatched name** rather than dropping the row. That is a mitigation, not a fix — the vocabulary split stays and GP-106 still owns it.

---

## 3. The seam — how `story.json` becomes a playable asset

Three routes exist (§0.1). Roc's constraint: *"reproducible and easy to run by you or manually."*

| Route | How | Reproducible? | Compilers in the pipeline |
|---|---|---|---|
| **A — inject compiled JSON** | Editor Python creates/updates a `UInkpotStoryAsset` and calls `SetCompiledJSON` with the resolver's `story.json` | One script, runnable by Claude via `unreal-mcp` or by Roc from the editor Python console | **One** (the resolver's) |
| **B — import `.ink`** | Copy the emitted `.ink` tree into `Content/Ink/v01/`, drag `main.ink` into the Content Browser | Manual drag-drop; scriptable but the factory still shells out to inklecate | **Two** (resolver's + Inkpot's bundled) |
| C — custom import pipeline | Subclass `UInkpotImportPipeline`, point `UInkpotSettings::CustomImportClass` at it, teach it `.json` | Most "correct", needs C++ and a rebuild | One |

**Pick: Route A, with Route B kept as the documented fallback.**

Reasons: one compiler means the bytes that ship are the bytes the resolver's own tests ran against, which is what `gdd/12-technical-overview.md:11`'s "the seam is compiled ink JSON" actually asserts; it is a single command with no step to forget; and it is runnable both ways as required. Route C is right after the capstone, not before it.

**This is my pick, not a ruling.** If Roc prefers B, §4 still runs — only the script changes, and B is already the route the spike is assumed to have taken (A2).

### The script

Checked in at `Content/Python/inkpot_inject.py` in the UE workspace (**not** in RL_MAP). Sketch — real API names, exact call sequence to be confirmed on first run:

```python
# Content/Python/inkpot_inject.py
# Injects a resolver-emitted story.json into a UInkpotStoryAsset.
#   json_path : absolute path to lantern-projects/vNN/story.json
#   pkg_path  : e.g. "/Game/Ink/v01/v01_story"
import unreal, json, os

def inject(json_path, pkg_path="/Game/Ink/v01/v01_story"):
    with open(json_path, "r", encoding="utf-8") as f:
        payload = f.read()
    json.loads(payload)                       # fail fast on malformed JSON
    asset = unreal.load_asset(pkg_path)
    if asset is None:
        tools = unreal.AssetToolsHelpers.get_asset_tools()
        asset = tools.create_asset(
            os.path.basename(pkg_path), os.path.dirname(pkg_path),
            unreal.InkpotStoryAsset, None)
    asset.set_compiled_json(payload)
    unreal.EditorAssetLibrary.save_loaded_asset(asset)
    return asset
```

Run by Claude:

```
unreal-mcp → execute_python_code
  exec(open(r"<project>/Content/Python/inkpot_inject.py").read());
  inject(r"<rlmap>/ProjectOS/game-project/lantern-projects/v01/story.json")
```

Run by Roc, from the editor's Output Log → Cmd → Python:

```
exec(open("Content/Python/inkpot_inject.py").read()); inject("<path to story.json>")
```

**Expected result:** `Content/Ink/v01/v01_story.uasset` saves, and opening it in the editor shows a populated `JSON` field on the Data Asset. `Source` stays blank — the header explicitly permits that: *"this is not used by the runtime and can be left blank."*

**Tag generation does not happen on this path.** `GenerateTAGs` is called from the *import factory* only (`InkpotStoryAssetFactory.cpp`), so injection must call it explicitly. `UInkpotImportPipelineLibrary::GenerateTAGs(asset, success)` is the entry point; §4.3 verifies whether it is reachable from Python and, if not, adds a one-line `UFUNCTION` wrapper or falls back to a one-off `.ink` import purely to mint the tag table.

### Getting fresh ink into Perforce

The `.ink` tree still gets copied into `Content/Ink/v01/` even on Route A — it is the human-readable reference next to the asset, and it is what Route B needs if the fallback fires.

Source of truth: `RL_MAP/ProjectOS/game-project/lantern-projects/v01/ink/`. **Never hand-edit it** — it is generated by `emitInk`.

The regen itself is the parallel session's, run from `tools/resolver`:

```
node src/cli.ts build --data data --out ../../lantern-projects/v01 --emit-story
```

Then, in the UE workspace, from the project root:

```
P4CONFIG=p4config.txt p4 edit Content/Ink/v01/...
# copy the regenerated tree over Content/Ink/v01/
P4CONFIG=p4config.txt p4 reconcile Content/Ink/v01/...
P4CONFIG=p4config.txt p4 opened
```

Mechanics from `Agent/knowledge/ue-project.md` in the UE workspace. Two documented traps from that file: the shell's default `p4` points at an unrelated **Dante** client, hence the `P4CONFIG` prefix on every command; and expired tickets need an interactive `p4 login` that cannot be scripted.

---

## 4. Step 0 — prove the pipeline before building on it

Four checks, roughly half a day. Nothing in §5 onward is safe until these pass.

**4.1 — Injection round-trip.** Run `inkpot_inject.py` against `lantern-projects/v01/story.json`. *Expected:* asset saves; `JSON` field populated; no editor errors.

**4.2 — The story runs.** Point `WBP_InkSpike` (or a fresh minimal widget) at the injected asset, `BeginStory`, `ContinueMaximally`. *Expected:* the first line is `Day 1 begins.` with tag `#id:SYS-DAY-BEGIN`, followed by six `Begin at …` choices plus `End the day` — that is `screen_hub` in `main.ink:124-197`, reached because `pickedStartScreen` is `"none"` on day 1. If a *different* first line appears, the asset is not our story and everything stops here.

**4.3 — Tags generate and register.** Check Inkpot preferences for `bAutogenerateGameplayTags` and `bAutoUpdateGameplayTagsList`. Call `GenerateTAGs`. *Expected:* `Content/Ink/v01/v01_story_TAGS.uasset` appears (naming from `CreateTagTableAsset`, which appends `_TAGS`), and Project Settings → GameplayTags lists it. Spot-check for `Ink.Path.t2.stall_goods`, `Ink.Origin.KnownPhrases.shelf_seen`, `Ink.Variable.movesLeft`.

*If the ini does not persist* (the plugin's own known wart, §0.3 caution 2), write the entry into `Config/DefaultGameplayTags.ini` by hand and `p4 add` it. Record which happened — it changes the regen procedure permanently.

**4.4 — Tag drift check.** A small script comparing the tag table's `Ink.Path.*` rows against knot/stitch names derivable from the emitted ink, reporting rows that appeared or vanished. Run after every regen. *Expected on first run:* a clean baseline. This is the guard against §0.3 caution 3 — a renamed knot silently orphaning a DataTable row.

**Exit criteria for Step 0:** the story plays from an injected asset, and the tag table exists and is registered. If 4.1 and 4.2 fail together, switch to Route B and re-run 4.2–4.4; the rest of the plan is unchanged.

---

## 5. The screen inventory

The full set from `tools/resolver/data/screen-specs.json` — 20 screens. `connects_to` is bidirectional in effect but declared per-screen; T1↔F1 carries the one named seam, `forest_path`, from `data/seams.json`.

| id | Location | Name | Status | Time states | Connects to | Examinables |
|---|---|---|---|---|---|---|
| HOME | home | Home | hub | — | — | — |
| T1 | town | Town Square | start | morning/afternoon/evening | T2, T3, F1 *(seam `forest_path`)* | arch, notice_board |
| T2 | town | Market Row | start | morning/afternoon | T1, T4 | stall_goods, **ex-shelf → `shelf_seen`** |
| T3 | town | The Commons / Well | start | morning/afternoon/evening | T1, T5 | well, doorsteps |
| T4 | town | The Workshop | locked(G-T4-recipe) | afternoon | T2 | tools, recipe_board |
| T5 | town | A Neighbor's Home | locked(G-T5-trust) | evening | T3 | mementos |
| T6 | town | The Tavern / Inn | locked(G-T6-evening) | evening/night | T1 | hearth, ledger |
| T7 | town | Festival Grounds | reachable | evening/night | T1 | stage, lanterns |
| T8 | town | The Old Shrine (Town) | reachable(G-T8-cipher) | evening/night | T3 | shrine_carvings |
| T9 | town | Festival Vignette | hub | night | — | — |
| TN | town | Festival Night | hub | night | — | — |
| FS | town | Final Screen | hub | night | — | — |
| F1 | forest | Forager's Clearing | start | morning/afternoon/evening | T1 *(seam)*, F2, F3 | trail_signs |
| F2 | forest | The Stream | start | morning/afternoon | F1, F4 | ford |
| F3 | forest | The Grove | start | afternoon/evening | F1, F5 | old_carvings |
| F4 | forest | The Still Pool | locked(G-F4-still) | afternoon | F2 | pool_bed |
| F5 | forest | Old-Growth Hollow | locked(G-F5-cascade) | afternoon/evening | F3 | great_trunk |
| F6 | forest | The Old Shrine (Forest) / Ruin | locked(G-F5-cascade) | evening/night | F5 | ritual_marks |
| F7 | forest | The Cave | locked(G-F5-cascade, G-F7-light) | night | F5 | cave_walls |
| F8 | forest | Heart of the Wood | locked(G-F8-combine) | evening/night | F5 | heart_tree |

Six screens are **start screens** and appear in both `screen_hub` and `calendar`: T1, T2, T3, F1, F2, F3. `HOME`, `T9`, `TN`, `FS` are `status: hub` — they are hand-authored in `main.ink` and `ink.ts` excludes them from the generic per-screen loop, so **they mint no `world/*.ink` file**. The presenter (§7) must treat them identically to the other 16 anyway, because they all carry `#screen:` tags.

### Map layout — four maps, cameras per screen

Roc's ruling, 2026-08-11: maps with different camera angles, not one map per screen.

| Map | Screens | Cameras | Base pack |
|---|---|---|---|
| `L_Town` | T1, T2, T3, T4, T5, T6, T8 | 7 | `Stylized_Medieval_Town`, `StylizedProvencal` (T5 interior) |
| `L_Forest` | F1–F8 | 8 | `Stylized_Forest`, `Polytope_Studio/Nature_Free`, `Stylized_Rocks` |
| `L_Festival` | T7, T9, TN, FS | 4 | `Fantastic_Village_Pack` (its paired day/night maps carry TN) |
| `L_Home` | HOME | 1 | `StylizedProvencal` |

20 screens, 4 maps, 20 cameras. T7 lives in `L_Festival` rather than `L_Town` despite its `location: "town"` — the final sequence never leaves T7/T9/TN/FS once night falls (`graph.ts:63` and the `TimeOfDay != night` exit guard in every generated hub), so keeping the four together means the whole ending is one map load.

**A map change is a `OpenLevel`; a screen change within a map is a camera blend.** The presenter (§7) hides the difference from ink entirely — ink only ever emits `#screen:<id>`.

---

## 6. Step 1 — the data spine

The requirement: *"a clear system, DataTables linked to GameplayTags, an easy way to update assets visual or otherwise."*

### 6.1 Two tag namespaces, one ownership rule

| Namespace | Owner | Regenerated? |
|---|---|---|
| `Ink.*` | Inkpot, from the story (§0.3) | **Yes, every rebuild.** Read-only to us |
| `Game.*` | Us, hand-authored | No |

`Ink.*` already covers screens (`Ink.Path.t1`), examinables (`Ink.Path.t2.stall_goods`), knowledge flags (`Ink.Origin.KnownPhrases.shelf_seen`), satchel members (`Ink.Origin.Satchel.herbs`) and every variable. That is most of the spine, for free.

`Game.*` covers what ink has no concept of:

```
Game.Item.<item_id>          — item_berry, item_wool, …           (15 records)
Game.KeyItem.<key_item_id>   — key_spare_apron, key_berry_loaf, … (11 records)
Game.Soul.<soul>             — toby, ilsa, mara, nell, …          (8 present_/bondLevel_ pairs)
Game.Screen.<id>             — T1, F1, HOME, …    (parallel to Ink.Path, for art rows)
Game.UI.<surface>            — Notebook, Satchel, Calendar, Start, Final
```

`Game.Item.*` is needed because ink's `Satchel` LIST holds coarse categories (`herbs`, `wool`, `river_stones`) while `content/items/` holds 15 specific records (`item_berry`, `item_beeswax`, `item_flame`). They are different granularities and conflating them would lose the item records.

### 6.2 Generated tables and art tables — never the same table

Each registry is **two** DataTables joined by tag:

| Registry | `DT_*_Data` (generated — never hand-edit) | `DT_*_Art` (hand-edited — never regenerated) |
|---|---|---|
| Screens | id, location, name, status, time_states, connects_to, seam, ink path tag | map, camera actor, lighting preset, ambience, time-of-day variants |
| Examinables | id, owning screen, clue_tier, region, knowledge_flag, ink path tag | hotspot transform/shape, cursor, highlight material, click SFX |
| Items | item_id, category, persistence, collectible, consumable, source_locations, used_by, produced_by | mesh, icon, display name, pickup VFX/SFX |
| Key items | key_item_id, category, soul, origin, made_from, persistence | mesh, icon, display name |
| Souls | soul id, `present_*` / `bondLevel_*` variable tags | portrait, mesh, voice bank |

**Why split.** A single mixed table gets clobbered the first time content changes and the generator runs — a week of asset binding gone. Splitting means a regen touches only `_Data`, and every asset choice survives untouched. The join is a tag lookup at load.

Swapping an asset is then: open one `_Art` DataTable, change one row. Adding a screen: regen `_Data`, fill one new `_Art` row. The `_Art` tables are also the natural place for a designer to work without touching Blueprints at all.

### 6.3 The generator

`Content/Python/gen_datatables.py` in the UE workspace, reading from RL_MAP (path resolved via `.claude/local-paths.md`, per the workspace's cross-machine rule — **never write an absolute path into a tracked file**).

| Output | Source |
|---|---|
| `DT_Screens_Data` | `tools/resolver/data/screen-specs.json` + `data/seams.json` |
| `DT_Examinables_Data` | the `examinables[]` arrays in `screen-specs.json` |
| `DT_Items_Data` | `content/items/*.json` (15) |
| `DT_KeyItems_Data` | `content/key-items/*.json` (11) |
| `DT_Souls_Data` | `lantern-projects/v01/personas.json` |
| `Game.*` tag list | derived from the above, written to a tag table asset |

Emits CSV, imported to DataTable — CSV is diffable in Perforce, which a `.uasset` is not.

**It must fail loudly, not silently drop rows.** Specifically the GP-106 case (Ruling 4): an item's `source_locations` entry that matches no screen name — `"Forest Unlock 2"` in `item_berry.json` is a live example — must be reported as an error listing the unmatched names, not dropped.

*Expected result:* a run prints per-table row counts (20 screens, ~25 examinables, 15 items, 11 key items, 8 souls) and any unmatched-name errors. Re-running is idempotent.

---

## 7. Step 2 — the shell, start screen to end screen

The click-through, in order. Everything before `day_start` and after `END` is Unreal's; everything between is ink's.

| # | Surface | Owner | Driven by | Forward | Back |
|---|---|---|---|---|---|
| 1 | Start screen | UE | `L_Home` or a dedicated menu map | New Game → 2. Continue → load (§15) | Quit |
| 2 | New Game | UE | `BeginStory` on the injected asset | → 3 | — |
| 3 | `day_start` | ink | `main.ink:26` — sets `TimeOfDay = morning`, `movesLeft = 3`, prints `Day {day} begins.` | `pickedStartScreen != "none"` → `start_from_calendar`, else → `screen_hub` | — |
| 4 | `screen_hub` | ink | `main.ink:124` — six `Begin at …` choices + `End the day` | any pick spends move 1 → that screen | — |
| 4′ | `start_from_calendar` | ink | `main.ink:41` — routes the prior evening's pick, spends move 1 | → that screen | — |
| 5 | A world screen | ink | `world/<id>.ink` | scenes, examinables, exits, `End the day` | exits back |
| 6 | `day_end` | ink | `main.ink:206` — `day == 5` intercepts to `home_hub_final`; else `day += 1` → `home_hub` | → 7 or 9 | — |
| 7 | `home_hub` / `hub_night` | ink | `main.ink:226` — `#screen:HOME` | Look around *(once, sticky)* · **Open the calendar** → 8 | — |
| 8 | `calendar` | ink | `main.ink:241` — `#screen:HOME` | six destinations, each setting `pickedStartScreen` + `pickedLocation` → `day_start` | — |
| 9 | `home_hub_final` / `hub_final` | ink | `main.ink:274` — day 5 only, no calendar | Look around · **Go to the Festival night** → sets `TimeOfDay = night` → `t7` | — |
| 10 | T7 at night | ink | `world/t7.ink` | Toby/Ilsa scenes, examinables, **Begin the festival vignette** — also auto-diverts once both scenes are spent | no exits (night suppresses them) |
| 11 | `festival_vignette` | ink | `main.ink:292` — `#screen:T9` | falls through → 12 | — |
| 12 | `night_screen` | ink | `main.ink:301` — `#screen:TN` | **Go to the results** → 13 | — |
| 13 | `final_screen` | ink | `main.ink:305` — `#screen:FS`, then `-> END` | UE detects END → 14 | — |
| 14 | End screen | UE | reads final state for the summary | New Game → 2 (fresh `BeginStory`) · Quit | — |

### No-dead-ends checklist

Each line is a testable assertion, not a note.

- [ ] Every ink knot reached has at least one choice or an unconditional divert. *(The emitter guarantees it; the walker proves it. This checks the UE layer does not swallow a choice list.)*
- [ ] `screen_hub`'s six options are all live on day 1, when `movesLeft == 3`.
- [ ] Every world screen offers `End the day` unconditionally — confirmed present in every `world/*.ink` (`ink.ts:333`).
- [ ] `hub_night` cannot auto-advance: **the calendar only opens on an explicit pick.** GP-52 (`HOME should not auto-open the calendar`, Done, playtest 2026-08-02) and the comment at `main.ink:213-225`.
- [ ] `Look around your home` is a sticky-once `*` choice — available exactly once per hub visit sequence, and returning to `hub_night` does not dead-end.
- [ ] Day 5 evening reaches `home_hub_final`, never `calendar`. `main.ink:207-209`.
- [ ] At night, every world screen's exits are suppressed (`TimeOfDay != night` guard) and T7 is the only reachable screen. `graph.ts:57-62`.
- [ ] `final_screen` reaching `-> END` is detected by UE and routes to the end screen — **not** to a frozen widget.
- [ ] End screen → New Game produces a clean day 1, not day 6 (§15).
- [ ] The notebook opens and closes from every screen including HOME, T7 at night, and the final sequence.
- [ ] No modal can trap the player with no input — every UE surface has an exit.

---

## 8. Step 3 — the screen presenter

One system, driven by tags. It is the thing that makes "level changes" work without ink knowing what a level is.

**Contract.** Every line ink emits may carry a `#screen:<id>` tag. `UInkpotLine::GetTags()` and `UInkpotStory::GetCurrentTags()` return them. On each `Continue`, the presenter scans for `screen:` and, when the id differs from the current one, performs a transition.

**Transition logic:**

1. Look up the id in `DT_Screens_Data` → owning map; and in `DT_Screens_Art` → camera actor, lighting preset, ambience.
2. Different map → `OpenLevel`, then set the camera. Same map → blend the view target.
3. Apply the time-of-day variant from `Ink.Variable.TimeOfDay`.
4. Rebuild the examinable hotspot set for the new screen (§9).

**Why the tag is the right hook, and the pitfall it avoids.** `graph.ts:37-52` documents this precisely: `HOME` exists as a real ScreenSpec entry *only* so `home_hub` and `calendar` have something for their `#screen:` tag to name — *"without an entry here, play.ts's currentScreen tracking has nothing to resolve the tag against, and the stage pane is left showing whatever real screen the player stood on last, all through the Home Hub."* Lantern hit exactly that bug. The presenter must resolve `HOME`, `T9`, `TN` and `FS` the same as any other screen, even though they mint no world file.

**Time-state stitches.** Each generated screen diverts into `ts_morning` / `ts_afternoon` / `ts_evening` on entry (`t7.ink` lines 5-6 are the pattern). These carry no `#screen:` tag — they are flavour text on the screen already entered. The presenter must not treat a missing tag as "no screen."

*Expected result:* walking T1 → T2 → T4 blends cameras within `L_Town` with no load; T1 → F1 across the `forest_path` seam loads `L_Forest`; the day-5 evening pick loads `L_Festival` once and stays there through FS.

---

## 9. Step 4 — the Home Hub

Built exactly as `main.ink:226-266` emits it. No UE-side embellishment — the hub's flow is hand-authored ink, and second-guessing it is how the two diverge.

**`home_hub` → `hub_night`:**

```ink
=== home_hub ===
You're home for the night. #screen:HOME #id:SYS-HOME-HUB
-> hub_night

= hub_night
* [Look around your home]
    Bank what fits the satchel, and decorate it — placeholder for D6's carry model. #id:SYS-HOME-LOOK
    -> hub_night
+ [Open the calendar] -> calendar
```

Two rules that are rulings, not style:

- **The calendar never opens on its own** (GP-52, playtest 2026-08-02: *"let player open the calendar"*). Look-around returns to the hub; only the explicit pick moves on.
- **`Look around` is `*` (once-only), `Open the calendar` is `+` (sticky).** A UE hub screen that renders both as permanent buttons breaks the once-only.

**`calendar`** sets **two** variables from one choice — both are required:

```ink
+ [Go to Town Square]
    ~ pickedStartScreen = "t1"
    ~ pickedLocation = "town"
    -> day_start
```

`pickedStartScreen` is the exact screen's ink address, consumed inside the story by `start_from_calendar`. `pickedLocation` is the *region* (`town`/`forest`/`farm`), read back by the day-start resolver as `DayInput.picked_location`. `graph.ts:21-32` spells out the contract and warns it is never a screen id. **If UE ever writes these itself, it must write both.**

**`home_hub_final`** (day 5) offers no calendar — there is no day 6. Its only forward choice sets `TimeOfDay = night` and diverts to `t7`. That choice is the *only* place `night` ever enters the clock: `advance_time()` (`main.ink:317-326`) goes morning → afternoon → evening and stops.

**Bank / decorate / satchel-triage are placeholders in ink today** — `SYS-HOME-LOOK` is one line of text. §12 gives them real UE behaviour behind that same choice. That is additive and does not require an ink change.

---

## 10. Step 5 — clickable examinables

The requirement: a click sets the examinable's `knowledge_flag` so gated content opens, the record fires once, the object stays clickable.

**The ink already does the hard part.** `ink.ts:335-358` emits, for each examinable:

```ink
= ex_shelf
Placeholder examinable: ex-shelf (soft-signpost). #id:GB-T2-EX-ex-shelf
{ not (KnownPhrases ? shelf_seen):
    ~ KnownPhrases += shelf_seen
    ~ recordKnowledge("shelf_seen")
}
-> hub
```

The emitter's own comment states the design: the hub entry is sticky (`+`) so *"the look is repeatable forever — a thing on a shelf does not vanish once seen — but recordKnowledge fires on the first look only, so no host-side counter can key off re-looking."*

**So UE must not implement any of that.** UE's whole job is: a click routes to the stitch.

**Flow:**

1. On screen entry, the presenter spawns hotspots from `DT_Examinables_Data` (which examinables belong to this screen) joined with `DT_Examinables_Art` (where they sit, how they highlight).
2. A click calls `ChoosePathGT` with that examinable's `Ink.Path.<screen>.<ex_id>` tag, then `ContinueMaximally`.
3. The stitch prints, the guard fires or does not, and it diverts back to `hub` — the player is where they were, on the same screen, with the hotspot still live.
4. Nothing UE-side tracks "seen." `KnownPhrases` is the record and the story owns it.

**The proof case is `ex-shelf` on T2, and it does not exist in any emitted artifact yet** (§0.4). It is the *only* examinable in `screen-specs.json` carrying a `knowledge_flag`. The other ~24 print flavour text and set nothing.

**Acceptance test — this is GP-111's validation, restated for UE.** From `gdd/13-scope-and-risks.md:39`: *"a walk that skips the opening option, clicks the examinable, and still reaches the last conversation."* Concretely: start a life, take Toby's T2 conversation **without** asking about the jars, then click the shelf, then confirm the payoff conversation is reachable. The thread record is `lantern-projects/v01/threads/toby-the-shelf.md`.

**Dependency, stated plainly:** this test cannot run until the resolver regen lands `ex-shelf` in `t2.ink`. That regen is the parallel session's. Until then, §10 builds and is verified against the flavour-only examinables, and the flag path is unproven.

---

## 11. Step 6 — screen changes and the move budget

Movement is ink's, and UE must not duplicate it. The generated pattern (`ink.ts`'s `emitMoveTo`, visible in every `world/*.ink`):

```ink
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Workshop] #lock:locked(G-T4-recipe)
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t4
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t4
        }
    }
```

Rules encoded there, all previously ruled:

- **3 moves per block** (`advance_time()` resets `movesLeft = 3`; ruled 2026-08-01).
- **Picking the opening position costs move 1**, whether via `screen_hub` or `start_from_calendar` (`main.ink:38-40`, ruled 2026-08-01).
- **Exhausting evening's budget goes to `day_end`, not a fourth block.** `advance_time()` never reaches `night`.
- **Night suppresses every ordinary exit** and T7 is the only screen the final sequence reaches.
- **A `#lock:` tag rides on the choice** for locked destinations. Ink still offers the move — the lock is presentational. UE reads `#lock:` and styles accordingly; it must not remove the option.

**UE's job:** render the choices with their `#lock:` styling, show `movesLeft` and `TimeOfDay` (both readable via `Ink.Variable.movesLeft` / `Ink.Variable.TimeOfDay`), and let the presenter handle the resulting `#screen:` change. **UE never decrements a counter.**

*Expected result:* from T1 at morning with 3 moves, three exits spend the budget and the third lands in afternoon on the destination screen. From any screen at evening with 1 move left, taking an exit goes to `day_end` — and the player sees the Home Hub, not the destination.

---

## 12. Step 7 — inventory and the satchel

**Gated on Ruling 1.** Written for Option A (Unreal owns it, ink mirrors). If Roc rules B, this section becomes a resolver card and UE consumes forage stitches instead.

**What exists:** 15 item records in `content/items/`, 11 key items in `content/key-items/`, six categories and three persistence classes in `gdd/05-collectibles.md`, and `forage` arrays on the screen specs (T2 carries `herbs`, `lantern-oil`, `wool`). **What does not exist:** any machinery joining them (§0.5).

**Build:**

1. **Item registry** — `DT_Items_Data` + `DT_Items_Art`, `DT_KeyItems_Data` + `DT_KeyItems_Art` (§6), keyed `Game.Item.*` / `Game.KeyItem.*`.
2. **Satchel component** — holds instances, enforces capacity, handles the three persistence classes from `gdd/05-collectibles.md:20-24`:
   - `pack-triaged` — competes for space (the default)
   - `free` — costs no space (captured sounds; *"replaying one does not consume it"*, ruled 2026-08-04)
   - `world` — **cannot be picked up at all**, `collectible: false`; exists on a screen to be cast on and from
3. **Forage points** — hotspots like examinables, spawned per screen from the spec's `forage` array, drawing from the location pool. Randomised per visit per `gdd/05-collectibles.md:28`, **with the guardrail that gate- and arc-critical items are exempt and always obtainable.** Randomness sets the day's path, never whether a goal is reachable.
4. **The mirror** — after any satchel change, push `SetListGT(Ink.Variable.Satchel, …)` so ink conditions can read it. This is `graph.ts:34`'s `HOST_MIRROR_WRITER` pattern: mirror in, event out.
5. **Pack-triage at day's end** — `gdd/03-core-loop.md:14`: carry only what fits, plus what you can carry in your arms when ending a day early. UE surface behind the existing `Look around your home` choice; the hub is where you bank.
6. **The Home Hub is not a forage point** (ruled 2026-08-04). No item draws a source from HOME.

**Mapping caution.** `Ink.Origin.Satchel.*` has 11 coarse members (`herbs`, `wool`, `river_stones`); `Game.Item.*` has 15 specific records (`item_berry`, `item_beeswax`). They are different granularities and the mirror must map many-to-one deliberately, not by name coincidence. The mapping table is generated and reviewed, not inferred.

*Expected result:* forage on F1, the item appears in the satchel UI, an ink condition reading `Satchel ? herbs` sees it, and it survives to the Home Hub for banking.

---

## 13. Step 8 — the notebook

**No Paca card exists** (Ruling 2). Planned here because the GDD makes it core.

**It is a view, not new state.** Everything it shows already exists in the story or in content:

| Tab | Source | Read via |
|---|---|---|
| Knowledge | `KnownPhrases` LIST | `GetListGT(Ink.Variable.KnownPhrases)` → `Ink.Origin.KnownPhrases.*` |
| Spells | `content/magic/*.json` + learned-state | spellbook section, `gdd/04-magic-system.md:7` |
| Relationships | `bondLevel_<soul>` and `present_<soul>` | `GetIntGT(Ink.Variable.bondLevel_toby)` etc., 8 souls |
| Collection | satchel + meta-hub record | §12's registry |

**Behaviour:**

- Toggle from **any** screen, including HOME, T7 at night, and the final sequence — *"can be referenced at any time"* (`gdd/03-core-loop.md:14`).
- Opening it must not advance the story. No `Continue` while it is up.
- Knowledge entries display from the `Ink.Origin.KnownPhrases.*` tag set, with display strings from a `Game.*` art table — so a knowledge flag's player-facing wording is editable without touching ink.

**Out of scope here:** the found-object pickup on the first screen (`gdd/03-core-loop.md:70`) is tutorial *content*, not shell. Planned as available from the start; the pickup is a later content hook.

*Expected result:* clicking the T2 shelf adds a knowledge entry that is visible in the notebook on the same visit, and it survives a save/load round-trip (§15).

---

## 14. The click layer, and the toolkit decision

**Roc evaluates the point-and-click toolkit after this plan.** The plan's job is to make either answer cheap.

**Boundary:** define an interface — "give me the clickable regions for this screen; tell me when one is clicked" — and put every consumer behind it. §10's examinables, §12's forage points, and §11's exits all go through it. A Fab toolkit then slots in as an implementation, or a native one does, without touching a consumer.

**Native implementation, if that is the ruling:** for a 3D static-camera game this is small — clickable actors with collision (or `UWidgetComponent` hotspots), a cursor-visible player controller, hover highlight via a material parameter. Maybe a day.

**Criteria for judging a Fab toolkit:**

| Question | Why it matters |
|---|---|
| Does it list **UE 5.8**? | This is exactly what killed inkcpp (`gdd/12:11`). A 5.7 ceiling is disqualifying. |
| Does it assume it owns movement? | Ink owns movement and the move budget (§11). A toolkit with its own navigation model fights the day loop. |
| Does it assume it owns dialogue? | Inkpot owns dialogue. A bundled dialogue system is dead weight at best. |
| Does it assume it owns inventory? | Possibly useful for §12 — but only if it can be driven from a DataTable and mirrored into ink. |
| Can hotspots be data-driven? | The whole §6 spine depends on it. |
| Integration cost vs. a day of native work? | 14 days to capstone. A toolkit that takes two days to integrate is a net loss. |

**My read:** the interface boundary is worth building regardless, and native is likely cheaper than integration at this date. But the evaluation is Roc's and this plan does not pre-empt it.

---

## 15. Step 9 — externals, persistence, and restart

### 15.1 External functions

`lantern-projects/v01/ink/system/externals.ink` declares four, each with a no-op fallback *"to make the canned web build run"*:

| Function | Signature | UE binding |
|---|---|---|
| `recordBond` | `(soul, category)` | update `bondLevel_<soul>` in the host persistence layer |
| `recordKnowledge` | `(phrase)` | record the knowledge event — **note the flag itself is already set in ink**; this is the outward event |
| `recordThreadMove` | `(thread_id)` | thread-progress ladder, feeding the arch promote formula |
| `recordCanonWrite` | `(fact)` | canon record |

Bound with `UInkpotStory::BindExternalFunction(name, delegate, bLookAheadSafe)`. **`bLookAheadSafe` matters:** ink evaluates ahead when gathering choices, so a function with side effects must be marked unsafe or it fires spuriously. `recordBond`, `recordThreadMove` and `recordCanonWrite` all have side effects. `recordKnowledge` fires inside a `not (KnownPhrases ? …)` guard, which is itself the protection — but it should still be flagged unsafe.

*Expected result:* clicking the T2 shelf logs one `recordKnowledge("shelf_seen")`, not two, and not one per choice-gather.

### 15.2 Persistence — GP-37

**MUST tier, part of the Definition of Done** (`gdd/13:11`), and `gdd/13:23` states the sequencing rule: *"Week-1: prove save/load carries state across a reshuffle before content depends on it."* **That rule is already late** — GP-37 is still Backlog and content already depends on it. It is the highest-priority item in this plan after Step 0.

Inkpot gives the story half directly:

```
UInkpotStory::ToJSON()   -> FString   (serialises the ink VM state)
UInkpotStory::LoadJSON(const FString&) (restores it)
```

Both `BlueprintCallable`. A save record is therefore:

1. `ToJSON()` — the whole ink VM: `day`, `movesLeft`, `TimeOfDay`, `KnownPhrases`, `Satchel`, every `bondLevel_*` and `present_*`, and the current position.
2. UE-side state not mirrored into ink: satchel object instances, notebook display state, meta-hub collection.
3. Current screen id and map, so a load restores the view rather than replaying to it.

**Acceptance (GP-37, restated for UE):** play a life, bank an item, build a bond, save, quit to desktop, relaunch, load — and confirm bond and collection persist across a **new life** with the souls' roles re-dealt. The minimum bar in `gdd/12`'s table: *"Bond + collection persist across one new life."*

`GetStorySeed()` / `SetStorySeed()` exist on `UInkpotStory` and must be part of the save record, or a reload re-rolls anything seeded.

### 15.3 Restart

`final_screen` ends `-> END`. UE detects the story can no longer continue and routes to the end screen. New Game from there must produce a **clean day 1**: a fresh `BeginStory` (or `ResetState()`, both available), plus resetting the UE-side satchel and screen. Carrying over is the meta-hub's job, not the story's — the in-game home *"starts empty at each new life"* (`gdd/03-core-loop.md:14`).

**Watch:** `day` is `VAR day = 1` and `day_end` increments it. A restart that reuses a story without resetting state begins at day 6 and the day-5 intercept has already fired — the life ends immediately. This is the single most likely restart bug and it is worth an explicit test.

---

## 16. Sequence and cut order

14 days to capstone, 10 to content freeze. Ordered by dependency, not preference.

| When | Work | Gate |
|---|---|---|
| **Day 1** | §4 Step 0 — injection, story plays, tags generate and register | Nothing proceeds until the story plays from an injected asset |
| **Day 1–2** | §15.2 **GP-37 persistence** — `ToJSON`/`LoadJSON` round-trip | The Week-1 gate, already late. Ahead of everything except Step 0 |
| **Day 2–3** | §6 the data spine — generator, `_Data` + `_Art` tables, `Game.*` tags | Everything downstream reads these |
| **Day 3–5** | §7 the shell + §8 the presenter — full click-through with grey cameras | **First playable click-through.** The milestone that de-risks the rest |
| **Day 5–6** | §9 Home Hub, §11 screen changes and move budget | |
| **Day 6–7** | §10 examinables + the click layer boundary (§14) | GP-111 test blocked on the resolver regen |
| **Day 7–9** | §12 inventory (pending Ruling 1), §13 notebook | |
| **Day 9–10** | §5 greybox pass — 20 cameras across 4 maps, art rows filled | |
| **Day 10** | **Fri 2026-08-21 — content freeze** | Only review, fixes and ship work after this |
| **Day 11–14** | GP-44 human playtest, fixes, GP-45 submission package | |

### Cut order if it slips

Top of the list goes first. Deliberately: the click-through survives longest, because a game that reaches its end screen with placeholder everything beats a beautiful game that dead-ends.

1. **Wwise / audio (GP-38).** Already `tier:should`. First out.
2. **Forage randomisation.** Ship fixed spawns per screen; randomisation is `gdd/05`'s flourish, not the loop.
3. **The greybox pass beyond one representative screen per map.** Four cameras instead of twenty; the presenter does not care.
4. **The notebook's Spells and Relationships tabs.** Knowledge is the one that gates content; the other two are readouts.
5. **Locked screens T4/T5/T6/T8 and F4–F8.** Nine of twenty screens are behind gates. The click-through is provable on the six start screens plus the final sequence.
6. **Inventory beyond a display-only satchel.** Pack-triage is the expensive half.

**Never cut:** the start→end click-through, the Home Hub and calendar, persistence (GP-37 is MUST), and the final sequence. Those four are the Definition of Done.

---

## 17. Proposed board deltas

**Proposals only — nothing has been created or moved.** Under the PM seat's split authority (`CONTEXT.md`), card creation is ungated but this is a planning turn, so nothing was written.

**Existing cards this plan advances:**

| Card | Note |
|---|---|
| GP-36 (scenes into engine — static-camera setup + point-and-click toolkit) | Backlog → this is §5, §7, §8, §14. Probably wants splitting; the toolkit half is Ruling 3 |
| GP-37 (persistence — save/load across a reshuffle) | Backlog, MUST, **late against the Week-1 rule** → §15.2, day 1–2 |
| GP-38 (Wwise — GameplayTag to asset library) | Backlog, `tier:should` → first cut |
| GP-111 (examinables cannot set knowledge flags) | Done in the resolver; §10 is its UE half, blocked on the regen |
| GP-106 (source_locations vs screen ids) | Backlog → §6.3's generator hits it; Ruling 4 |
| GP-44 (human playtest), GP-45 (capstone submission) | Backlog, both AT_RISK → §16's last block |

**Gaps with no card:**

1. **The notebook** — a MUST-adjacent GDD system with no board presence (Ruling 2).
2. **The data spine** — §6's registries and generator are a distinct piece of work, not obviously inside GP-36.
3. **The shell** — start screen, New Game, END detection, restart. Not in any Track C card; it is the only part of the click-through that lives entirely outside ink.
4. **Tag-drift validation** — §4.4, small but it is the thing that stops a rename silently orphaning rows.

---

## 18. What this plan depends on and does not control

Stated so nothing here reads as more certain than it is.

- **The resolver regen** (§0.4). `ex-shelf` is absent from the emitted ink, so §10's proof case cannot run yet. The regen belongs to the parallel session. **This plan changed nothing under `tools/resolver` or `lantern-projects`.**
- **Ruling 1** (satchel ownership) gates §12 and nothing else.
- **Ruling 3** (toolkit) is deferred by Roc; §14's boundary makes either answer cheap.
- **The eight assumptions in §1**, of which A3 (injection produces a runtime-loadable asset) is the one that would most change the plan — and it is tested on day one, deliberately.
- **`Content/Ink/v01/` in Perforce is stale** (dated 2026-08-03) and is downstream of the regen.

---

*Track B. Design flows from RL_MAP; implementation lives in `rebirth.uproject`, workspace `roclee_CCI-MSiAegis-02_459`. Task state is in Paca, not here — `plans/` holds reasoning.*
