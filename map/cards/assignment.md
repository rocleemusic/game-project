---
name: assignment
type: run-artifact
status: live
record: assignments/
---

## What it is
Coursework deliverables, one self-contained folder per assignment (#5–#9), each with
its own README and runnable pipeline. They read *from* the game's documents and
derive copies — "nothing here is a source of truth, and nothing here feeds the game
build" (`CONTEXT.md` §Where things live). Live because assignments are still being
built: `assignment-8-icm/` shows heavy recent churn.

## Doors
- `assignments/assignment-8-icm/CONTEXT.md` — the current active one (Mara as a folder-agent, standalone)
- `assignments/assignment-7/style-guide.md` — the canonical example of a derived copy

## Hits
Grades, not the game. An assignment change never propagates back; the flow is
one-way, game → assignment. The only coupling worth carrying: derived copies
(assignment-7's style-guide restates `narrative-pipeline/register.md`) go stale
silently when the source moves, and that is accepted.

## Does not hit
Anything in `phaser/`, `content/`, `cast/`, or `lantern-projects/`. Also
`assignments/assignment-7-old/` — 624 superseded files with the same interior names
as `assignment-7/`; search results mix them freely, check the path segment before
trusting any hit (see collisions.md).
