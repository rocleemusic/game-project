---
name: soul
type: content-record
status: live
record: cast/
---

## What it is
A character in the game. One markdown card per soul in `cast/` (`mara.md`, `toby.md`,
`ilsa.md`, ...), each the canonical persona: voice, threads, relationships. Deep souls
also carry a `-threads.md` file beside the card (`cast/mara-herbalist-threads.md`) —
a companion, not a second card. Flat small files because a pipeline run reads a few
souls, never the folder.

## Doors
- `cast/mara.md` — a representative card
- `narrative-pipeline/templates/persona-card-schema.md` — the shape a card must hold
- `narrative-pipeline/npc-codex.md` — how souls enter pipeline runs

## Hits
Changing a soul card hits future narrative-pipeline output and dialogue generated
against it (see `pipeline-runs/2026-08-25-full-content-generation/RESULTS.md` — every
generation call rides the card in). Rulings about a soul made mid-session must flow
back to `cast/` or the next run works from a stale persona (`CONTEXT.md` §Where
things live: "This is the card of record — the pipeline-runs copies are frozen run
artifacts and diverge. Edit here"). Souls also ride in run-folder-v01: v01 carries
soul-derived copies — `lantern-projects/v01/personas.json` and per-soul ink at
`lantern-projects/v01/ink/souls/*.ink` — so a card change reaches the playable week
only through regeneration and an inklecate recompile (run-folder-v01's Hits), then
phaser-build's `prep:content` re-sync. Open question: phaser-build's adversary
trigger "cast" means spell-cast pairs, not the character cast (`agents/qa-adversary.md`,
"89 authored cast pairs"); whether a soul change should trigger it is unstated.

## Does not hit
`pipeline-runs/*/` copies of soul cards — frozen run inputs, knowingly divergent.
Also `gdd/07-cast.md`: it holds the roster design (8 souls, age bands, essence/role
split), not any one soul's persona. Roster-shape changes go there; persona changes
go to `cast/`.
