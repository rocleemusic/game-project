---
name: pipeline-run
type: run-artifact
status: live
record: pipeline-runs/
---

## What it is
A dated snapshot of one narrative-pipeline run (`2026-07-25-kinbound/`,
`2026-08-17-register-loosening/`, ...). Older runs are frozen evidence — never
updated when canon moves, so a cold reader treats their contents as photographs.
Status is live for one reason: `2026-08-25-thread-driven-scenes/` is the newest run
and its scene lines are still pending pick-and-polish (GP-205). It superseded the
earlier same-day `2026-08-25-full-content-generation/` dialogue output ("single lines,
no real structure") and the retired `lantern-projects/v01/threads/` format. The
architecture it settled: Claude authors scene structure, local models write lines.

## Doors
- `pipeline-runs/2026-08-25-thread-driven-scenes/RESULTS.md` — the pending run: 25/25 structures, 469/477 line slots shipped, `lines/*-comparison.md` awaiting a pick
- `pipeline-runs/2026-08-25-full-content-generation/RESULTS.md` — the earlier same-day run; its item/key-item descriptions were ingested (GP-207), its dialogue output retired
- `pipeline-runs/benchmark-plan.md` — per-slot model effort (cited from `CONTEXT.md`)

## Hits
Only the newest run hits anything, and only via the polish pass that folds approved
text into `gdd/15-dialogue-inventory.md` rows (dialogue-inventory) and into
run-folder-v01's `lantern-projects/v01/ink/` — which means an inklecate recompile
(run-folder-v01's Hits). Once folded, that folder joins
the frozen ones and hits nothing. One fold already happened: the
full-content-generation run's item and key-item descriptions were copied into
item-record's live JSON (GP-207); its `content/magic/` descriptions are still pending.

## Does not hit
`cast/` and `narrative-pipeline/` — the live originals. Run folders contain soul
cards, prompts and outputs with live-looking names; none of it is wired, and editing
a copy changes nothing (`CONTEXT.md` §Where things live: "the pipeline-runs copies
are frozen run artifacts and diverge").
