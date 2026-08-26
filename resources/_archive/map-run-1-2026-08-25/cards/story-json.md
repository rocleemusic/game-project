---
name: story-json
type: content-record
status: live
record: lantern-projects/v01/story.json
---

## What it is
The compiled ink graph (`inkVersion 21`, inklecate output) that every host
reads — LanternPlayer via inkjs, the Phaser build, and eventually Inkpot in
Unreal. It is compiled output: you never edit it, you regenerate it with the
resolver (`tools/resolver`, commands in `CONTEXT.md` §Running the current
build).

## Doors
- `lantern-projects/v01/ink/` — the ink source it was compiled from
- `tools/resolver/README.md` — the builder that emits it
- `phaser/README.md` §The seams — what the Phaser host reads vs writes

## Hits
Regenerating it hits everything that plays: lantern review, the Phaser
build (`npm run prep:content` in `phaser/` is the re-sync point — its
README calls it out), and reviewed lines. `HANDOFF.md` in `phaser/` warns
regeneration is a content operation near freeze — Roc's call, not a task to
pick up unprompted.

## Does not hit
The other story.json copies. `lantern-projects/scratch/story.json` is
scratch; `phaser/public/story/` and `phaser/dist/story/` are deployed/build
copies overwritten by `prep:content` and the build; `tools/lantern/fixtures/`
holds test fixtures. Editing any of them either vanishes on the next build
or breaks an honest test. `v01/story.json` is the record.
