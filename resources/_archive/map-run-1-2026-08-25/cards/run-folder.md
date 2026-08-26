---
name: run-folder
type: run-artifact
status: live
record: lantern-projects/v01/
---

## What it is
The current playable week: resolver output that is also the home of actual
game content — `graph.json`, `day-*.json`, `story.json`, `regions.json`,
`manifest.json`, `images/`, `ink/`. Versioned under `lantern-projects/`
because a run folder is the unit both lantern and the Phaser build load.

## Doors
- `lantern-projects/v01/manifest.json` — screens to backdrops
- `tools/lantern/README.md` — how the review tool plays it (live-reload invariant)
- `phaser/README.md` §The seams — backdrops served in place via `/run-images`

## Hits
Regenerating v01 hits reviewed lines, placements, and the Phaser build
(re-run `npm run prep:content`). Trap from `phaser/README.md` §Known state:
`manifest.json` points `T5` at `homeinterior.jpg`, but T5 is an NPC's home,
not the player's (Roc, 2026-08-12) — never read the manifest filename as the
authority on whose home a screen is.

## Does not hit
`tools/resolver/out-calib/` — same shape, but CONTEXT.md rules it "a
disposable calibration build, not where content lives". Also not
`lantern-projects/scratch/` (scratch copy). Grabbing either as the playable
week edits a folder nothing ships from.
