---
name: soul
type: content-record
status: live
record: cast/
---

## What it is
A character in the game. One markdown card per soul in `cast/` (`mara.md`,
`ilsa.md`, `toby.md`, ...) — the canonical persona: voice, threads, bonds.
Flat folder of small files because each pipeline run reads a few souls,
never the folder. `*-threads.md` files (`mara-herbalist-threads.md`) are
thread notes beside a card, not second cards. `appearance.md` covers looks
across the cast.

## Doors
- `cast/mara.md` — a representative card
- `narrative-pipeline/npc-codex.md` — how souls enter pipeline runs
- `gdd/07-cast.md` — the GDD-altitude cast summary

## Hits
Changing a soul card hits future narrative-pipeline output and any ink
content written against it (`lantern-projects/v01/`). CONTEXT.md's "Where
things live" table rules that `cast/` is the card of record and rulings
made mid-session must flow back here, or the next run works from a stale
persona.

## Does not hit
`pipeline-runs/*/` and `lantern-projects/v01/personas.json` hold same-named
or derived copies. The pipeline-runs copies are frozen run inputs that
knowingly diverge (CONTEXT.md, `cast/` row); editing one changes nothing
live. The card in `cast/` is the soul; everything else is a photograph.
