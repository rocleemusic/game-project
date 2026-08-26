# Kickoff prompt — Unreal feature-complete execution session

**Paste this as the opening message of a fresh session working in the Unreal workspace.** Written 2026-08-12, to launch execution of `plans/2026-08-11-unreal-feature-complete-plan.md`.

---

You are executing the Unreal feature-complete build for the game-project. Read `H:\_CLAUDE\RL_MAP\ProjectOS\game-project\CONTEXT.md` first, then `H:\_CLAUDE\RL_MAP\ProjectOS\game-project\plans\2026-08-11-unreal-feature-complete-plan.md` in full — that plan is your spec. This message only states what has changed since it was written and where to start.

**Your workspace:** the UE project lives outside RL_MAP, at `D:\_elvtr\rebirth\roclee_CCI-MSiAegis-02_459` (`rebirth.uproject`, UE 5.8, Perforce workspace `roclee_CCI-MSiAegis-02_459`). Confirm that path yourself rather than trusting this note if anything looks off — the plan's own `.claude/local-paths.md` convention exists because this path is machine-specific and must never be written into a tracked file.

**Board:** Paca project `game-project`, prefix `GP`, id `5db8b37f-8976-49be-9d30-106c53c48303`. Paca holds status; markdown holds reasoning. Do not reconstruct status from any file's banner.

## Four rulings made since the plan was written (2026-08-12)

1. **Ruling 1 — satchel ownership: Option A, confirmed.** Unreal owns the satchel; ink holds a mirror via `SetListGT(Ink.Variable.Satchel, …)` after every change (the `HOST_MIRROR_WRITER` pattern already in `tools/resolver/src/graph.ts:34`). Build to plan §12 as written for Option A — no ruling ambiguity remains there.

2. **Ruling 2 — the notebook has a card now.** `GP-151` (notebook UI — knowledge/spells/relationships/collection tabs), `track:B-tool`, `tier:must`. Build to plan §13.

3. **Ruling 3 — the point-and-click toolkit is not available.** Confirmed: no Fab point-and-click toolkit is installed in this Unreal project. **Do not spend time evaluating one — go straight to the native click-layer implementation**, plan §14's "native implementation" path: clickable actors with collision (or `UWidgetComponent` hotspots), a cursor-visible player controller, hover highlight via a material parameter. Still build the interface boundary plan §14 describes ("give me the clickable regions for this screen; tell me when one is clicked") so examinables (§10), forage points (§12) and exits (§11) all sit behind it — that boundary is worth keeping even with a single native implementation. This closes Ruling 3; `GP-36` carries a comment recording it, tagged `ruled:2026-08-12`.

4. **New requirement — a toggleable visual debug overlay.** Not in the original plan. Anything backed by a variable that can change during play — screen/location moves, satchel contents, bond levels, knowledge flags, `movesLeft`/`TimeOfDay` — needs a debug overlay that can be toggled on/off at runtime and shows current values and (ideally) recent changes. Carded as `GP-152`, `track:B-tool`, `tier:should` (flagged to Roc as a possible `must` — his call, not yours). Reasonable approach: since §6 already gives you `Ink.Variable.*` / `Ink.Origin.*` / `Game.*` GameplayTags for everything worth watching, the overlay is likely a generic panel that walks the relevant tag namespaces and prints current values via the `…GT` story API (`GetValueGT`, `GetListGT`, etc.) rather than a bespoke widget per system. Build it once the data spine (§6) exists — it depends on the same tag tables everything else reads. Toggle it from a debug console command or key bind; it must not appear in a normal playthrough by default.

## Where to start

Follow plan §16's sequence: **Day 1 is §4, Step 0** — prove the injection pipeline (Route A: inject compiled `story.json` into a `UInkpotStoryAsset` via `SetCompiledJSON`) before building anything on top of it. Nothing else in the plan is safe to build until §4.1–4.4 pass.

Immediately after Step 0, **§15.2 (`GP-37`, persistence) is the priority** — it is tagged `tier:must`, it was already late against the plan's own "prove save/load before content depends on it" rule as of the 2026-08-12 readiness check, and content in the parallel narrative track already depends on it. Do not let the screen presenter or Home Hub work (§7–§9) get ahead of it.

**One dependency you don't control:** §10's proof case (`ex-shelf` on T2, the only examinable in `screen-specs.json` with a `knowledge_flag`) does not exist in any emitted `.ink` file yet — the resolver run that lands it is happening in a parallel RL_MAP session today, not here. Build §10 against the ~24 flavour-only examinables in the meantime; don't block on `ex-shelf`. If you need to check whether it's landed, `grep -n "shelf_seen" "H:\_CLAUDE\RL_MAP\ProjectOS\game-project\lantern-projects\v01\ink\world\t2.ink"` — a hit means it's in.

**Fence lifted:** an earlier kickoff prompt told a prior session to leave `tools/resolver` and `lantern-projects` alone. That is no longer necessary — the import that made it a concern has landed. It doesn't matter for you either way: this plan only ever reads from those paths (§0.4, §18), never writes to them.

## Working rules carried from the plan

- **Route A over Route B** for the ink seam (plan §3) — inject compiled JSON, don't rely on the `.ink` drag-drop importer. B stays documented as fallback if §4.1/4.2 fail together.
- **`Ink.*` tags are generated and read-only; `Game.*` tags are hand-authored and never regenerated** (§6.1). Never hand-edit a `_Data` DataTable — only `_Art` tables.
- **Ink owns movement, dialogue, and the move budget. UE never decrements a counter** (§11).
- Board writes (new tasks, status updates, comments) are ungated for you — write them as you go. **Scope cuts, due-date changes, and priority reshuffles are not yours to make** — surface them to Roc and wait.
- `unreal-mcp` at `127.0.0.1:9000/mcp` may be reachable if the editor is up; every step in the plan also has a manual/editor-Python equivalent, so don't block on MCP connectivity.

## First message back to Roc

Report Step 0's result (pass/fail on each of §4.1–4.4) before doing anything else — everything downstream depends on it, and per the handoff from the parallel track, agents in this project have twice lost work by trusting their own reports over what's actually on disk. Verify against saved assets and the story actually running, not against your own summary.
