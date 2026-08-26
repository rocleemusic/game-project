---
name: resolver
type: code-system
status: live
record: tools/resolver/
---

## What it is
The deterministic half of the narrative pipeline: mints IDs, builds `graph.json`,
emits the compiling ink scaffold, resolves seeded days, and applies lantern's review
edit patches (`narrative-pipeline/CONTEXT.md` §The tooling). Its input is the
Architect's human-gated layout data in `tools/resolver/data/`; `data/tuning.json` is
the single home for tunable game settings.

## Doors
- `tools/resolver/README.md` — commands and layout
- `tools/resolver/data/` — the layout-pass input the builds are minted from
- `narrative-pipeline/build-loop.md` — the ink emission rules (single declaration site, tag contract)

## Hits
A resolver change hits every regenerated run folder — rebuild with `build --emit-story`
then `resolve-week` (`CONTEXT.md` §Running the current build), then re-sync Phaser
with `prep:content`. Changing `data/tuning.json` rides the same chain: regenerated
run folders (run-folder-v01) and the phaser-build re-sync. The host-state contract
minted here — `present_<soul>` declared with writer `DAY_START_WRITER`
(`tools/resolver/src/graph.ts` ~line 199) — is fulfilled by lantern-player's
`applyPresence` (`tools/lantern/src/lib/play.ts:437`); changing a writer declaration
changes what the host must write. The test suite is `node --test` via `npm test`;
`npx vitest run` collects 0 tests here and looks like a wall of failures
(`CONTEXT.md` §Rules; see collisions.md).

## Does not hit
`tools/resolver/out-calib/` and `tools/resolver/out/` — disposable build outputs, not
content homes; content lives in `lantern-projects/`. The stray file
`tools/resolver/P:tmpresolver_test_out.txt` is escaped-redirect debris from a Windows
shell, wired to nothing.
