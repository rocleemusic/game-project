---
name: session-handoff
type: run-artifact
status: live
record: plans/_handoffs/
---

## What it is
Where the last session stopped — one dated file per session, split out of `plans/` on
2026-08-16 because progress reports kept polluting design records (`plans/CONTEXT.md`).
Stale by design: a handoff's lifespan is one session, then it is history. New ones
are still written constantly (38 files and counting), which is why the noun is live
even though every individual file goes stale immediately.

## Doors
- `plans/_handoffs/CONTEXT.md` — the folder's own contract
- `plans/_handoffs/2026-08-25-mara-exemplar-pipeline-run-handoff.md` — the newest, driving the pending pipeline run

## Hits
Only the next session, and only as a starting pointer. Anything durable gets folded
into `CONTEXT.md`, a design record, or Paca — never left here as the record.

## Does not hit
Contracts and rulings. "Never cite one in a contract" (`CONTEXT.md` §Where things
live). Also note `PAUSED.md` at the territory root is the same species — a
one-session handoff note per `CONTEXT.md` §Session resume — but the current one
carries live VFX calibration rulings; see collisions.md before discarding it.
