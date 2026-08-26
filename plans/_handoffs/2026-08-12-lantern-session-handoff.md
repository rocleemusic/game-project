# Session handoff — 2026-08-12, Lantern review pass

**For the next session.** Written at the end of a short session that cleared the Lantern review queue, built GP-96's second half, and planned GP-125. Everything below is verified against files and test runs, not against agent reports. This is a separate document from `2026-08-12-session-handoff.md`, which covers the thread-import session that preceded it.

---

## The one-paragraph version

**The Lantern review queue is empty.** Roc approved GP-133, GP-120 and GP-82 — all three moved to Done. GP-96's outstanding half (scene rail short names) was ruled "derive", built, and verified against a fully green baseline. GP-25 was ruled to stay in Backlog and close as a side effect of GP-130 rather than get a synthetic fixture. That leaves **GP-125 as the only open Lantern build**, and it needs one ruling from Roc before it can start. One thing worth knowing: **the lantern suite is now completely green** — the 69 pre-existing jsdom failures cited in every recent session report do not exist any more.

---

## What landed

**GP-96 — scene rail short names (the "derive" ruling).** Rows in the left panel now read `SC-T2-11 · toby-the-shelf-C4` instead of a bare address, so a scene can be tracked back to its thread and conversation while playing.

The derivation source is not obvious and is worth recording: `scene-graph.json` scenes carry only `scene_id / soul / screen_id / lines / choice_nodes / entry_gate` — **no thread or conversation field exists anywhere in the graph.** The pairing is stated outright in every line file's H1:

```
# `mara-said-out-loud` — C1 line slots · `SC-T2-24`
```

so the H1 is the source, parsed at build. 30 line files map 30 scenes; the graph's other 4 (`SC-T2-04`, `SC-T7-toby`, `SC-T7-ilsa`, and the T4 remainder) have no line file and keep their bare address. **An unmapped scene is never given an invented name** — the same rule `threadProse` follows, for the same reason.

- `scripts/gen-scene-short-names.mjs` — new; mirrors `gen-thread-prose.mjs` and is the sole writer of the map. Throws three ways: an unparseable H1, an H1 that disagrees with its own filename, and two files claiming one scene id.
- `src/lib/sceneShortNames.json` + `.ts` — `sceneShortName()` returns null for unmapped (the caller decides how to show it); `sceneRailLabel()` composes the row label.
- `src/components/SceneRail.tsx` — label is now `sceneRailLabel(sid)`.
- `test/sceneShortNamesFixture.test.ts` — staleness gate against a fresh render, plus fallback and cross-screen cases.
- `package.json` — `npm run gen:scene-short-names`.

**Surfaced by the map:** `mara-tonic-frost` C2 sits on `SC-F1-03` while C1 and C3 are on T2. That thread crosses screens; the rail now shows it and a test pins it.

**Verified.** Baseline captured before any edit: 45 files / 742 tests, **all passing**. After: 46 files / 750 tests, all passing — the only delta is the 8 new tests. `tsc --noEmit` clean.

---

## Board changes

| Card | Was | Now | Why |
| ---- | --- | --- | ---- |
| GP-133 | In Review | **Done** | Roc approved |
| GP-120 | In Review | **Done** | Roc approved |
| GP-82 | In Review | **Done** | Roc approved |
| GP-96 | In Review | In Review | Both halves now built; neither has been read by Roc in the running tool |
| GP-25 | Backlog | Backlog | Ruled: no synthetic fixture, sequence behind GP-130 |

**Every open Lantern card, as of this session:** GP-96 (In Review, built), GP-125 (Backlog, planned below), GP-109 (Backlog, a watch item not work), GP-2 (the track epic, due 2026-08-21). Nothing else in `tools/lantern/` is open — cards that merely reference `lantern-projects/v01/` are content cards on Track A.

---

## Two things the next session should not re-derive

**1. The lantern test suite is green.** Session reports from 2026-08-11/12 repeatedly cite "69 pre-existing failures across 7 files, a jsdom/`localStorage.clear` environment issue." A full run this session: **45 files / 742 tests, zero failures.** Whatever caused those failures is resolved. Do not copy the 69-failure figure into a future baseline — capture a real one.

**2. GP-25 cannot be closed by writing a better test.** `play.ts:401` jumps to `FESTIVAL_SCREEN_ID = "T7"` on entering night. `tools/lantern/fixtures/graph.json` has screens `T1` and `T2` and one scene (`SC-T2-01`); `fixtures/out/` holds approvals/edits/reroll-state and **no compiled ink at all**. The existing 3 tests prove the wiring — night detected, `jumpTo("T7")` called, fails closed without throwing, literal pinned — and that is the ceiling the fixture supports. Proving the jump *lands* needs a compiled-ink T7 knot, which means authoring festival content that GP-130 will replace. **Ruled 2026-08-12: leave in Backlog, close as a side effect of GP-130.**

---

## GP-125 — the plan

**Surface a declared-but-unbuilt examinable as an inspectable region in Lantern.** GP-112's second half: half 1 (a thread declares its examinables) and the reconciliation check shipped 2026-08-07 as guardrails check 11. The Lantern surface was scoped, deliberately not built, and left uncarded until GP-125.

### Why it stopped last time, and what changed

The previous implementer declined to guess where an unbuilt examinable's rectangle sits on the screen image — **the right call, and the reason this card still needs a ruling before code.** Nothing about that has changed. What this plan adds is a concrete proposal for the honest shape, so the ruling is a yes/no rather than an open design question.

### What already exists to build on

- **The check's findings carry everything Lantern needs** — id, screen, declared flag, status, source file. No new extraction. `tools/resolver/src/examinables.ts`, `check-examinables` on the CLI, 9 tests.
- `tools/lantern/src/types.ts:28` already carries `knowledge_flag` through.
- Built examinables already carry a region (`stall_goods` → `region: r_stall_goods`), so both the region concept and Lantern's ability to mark one exist.
- Region geometry has a settled home: `<run-dir>/regions.json`, keyed on the **(screen_id, region_id) pair** — region ids are only unique within a screen. `overlayRegions()` in `src/lib/regionMap.ts` patches geometry onto the graph and **already ignores regions it has no geometry for**, which is exactly the state an unbuilt examinable is in.
- The live instance to test against: `ex-shelf`, declared PROPOSED on T2 by `toby-the-shelf.md`, built nowhere. `check-examinables` reports exactly one declaration and one problem across v01.

### The one open ruling — needed before any code

**Where does an unbuilt region sit on the screen image?**

- **Option A — a gutter marker, no location claim (recommended).** The unbuilt examinable appears in a list beside the stage, not as a rectangle on the image. It is visible, it names its id / screen / declared flag / source file, and it makes **no claim about where it is**, because nobody has authored that. `regionMap` already tolerates a region with no geometry, so this needs no placeholder rectangle and no fake data in `regions.json`.
- **Option B — a fixed placeholder rectangle** (e.g. always top-left, in an unmistakably provisional style). Puts it on the image where the eye already is, but it is a location claim that is not true, and it will be read as one.
- **Option C — an authored rectangle per declaration.** Honest and precise, but it makes every declaration wait on an art/content pass, which is the thing that stalled this card originally.

**Recommendation: A.** The card's own note says "a placeholder that does not pretend to be a location is probably the honest shape," and the region map's tolerance for missing geometry means A is also the smallest build. B and C can both be added later on top of A without rework — A is the list, B/C are geometry the list would then point at.

Second, smaller ruling, only if B or C is chosen: **how an unbuilt region reads against built ones.** It must be unmistakably not-yet-real — not merely a different colour.

### Proposed build, once ruled (assuming A)

1. **Get the findings into Lantern.** `check-examinables` output is a resolver artifact; Lantern reads JSON from the run folder. Emit the findings at build the same way `threadProse.json` and `sceneShortNames.json` are emitted — one generated fixture, one generator, one staleness test. Reusing that pattern a third time is deliberate: it is now the house shape for "resolver knows something Lantern must show."
2. **A panel, not a new pane.** The unbuilt list belongs in the left navigator beside `ThreadsPanel`, collapsing with the same twisty/aria wiring the scene rail groups use — the panel grammar is already established and a new pane would be the wrong altitude for one list.
3. **Row content.** id · screen · declared knowledge flag · source file, with the problem kind from the check (`not-built`, wrong screen, wrong/missing flag) as the trailing status tag, matching `ListRow`'s existing `[kind] label [status]` grammar.
4. **Tests.** Staleness gate on the generated findings; a row renders for `ex-shelf`; an empty state when the check reports no problems (the state v01 should eventually be in); no crash when a declaration names a screen the graph does not have.
5. **Verification, per the standing rule.** Capture a real baseline before editing — do not assume this document's numbers still hold — then diff failing test names before and after, and run `tsc --noEmit`.

### What this card does not do

It does not build `ex-shelf` — that is GP-111, and it is the immediate instance this panel is meant to make visible. It does not author geometry. It does not change the check.

---

## Open for Roc

- **GP-125's ruling** (option A / B / C above). Nothing can start until this is answered.
- **GP-96** is built and waiting to be read in the running tool — both the ThreadsPanel prose map and the new rail short names.
- Unchanged from the prior handoff and untouched here: `SC-T2-11`'s ruling, the `.tmp/planner-chain-fix.patch` land/no-land decision (GP-149/GP-150), GP-106's four design questions, GP-93's two sub-questions, and the GP-144 re-tuning call.
