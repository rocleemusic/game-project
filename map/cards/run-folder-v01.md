---
name: run-folder-v01
type: content-record
status: live
record: lantern-projects/v01/
---

## What it is
The current playable week — the home for actual game content (`CONTEXT.md` §Where
things live). Holds the compiled ink graph `story.json` (inkVersion 21, the seam both
Phaser and the future Unreal port read), `graph.json`, day/week JSONs, `manifest.json`,
`regions.json`, backdrop images, and the ink source. Minted by the resolver from
`tools/resolver/data/`, then hand-reviewed in lantern.

## Doors
- `lantern-projects/v01/story.json` — the compiled graph itself
- `tools/lantern/README.md` — how to play it, and the live-reload invariant
- `narrative-pipeline/build-loop.md` — the S4 file split, ink-address rule, tag contract

## Hits
Editing v01 content means regenerating: resolver `build --emit-story` then
`resolve-week` (`CONTEXT.md` §Running the current build). After a reroll, Phaser needs
`npm run prep:content` to re-sync its bundled copy (`phaser/README.md` "prep:content
is the re-sync point"). Casting is host-side by design — touching
`lantern-projects/v01/ink/` means an inklecate recompile (`phaser/README.md` §Not in
scope).

## Does not hit
`tools/resolver/out-calib/` — a disposable calibration build artifact with the same
interior shape. Content edited there vanishes on the next build. Also
`lantern-projects/scratch/` — a scratch copy, not the week. See collisions.md:
story.json is five files.
