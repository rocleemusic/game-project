---
name: assignments
type: run-artifact
status: leftover
record: assignments/
---

## What it is
Coursework deliverables, one self-contained folder per assignment (#5-#9),
each with its own README and runnable pipeline. They read *from* the game's
documents and derive copies — CONTEXT.md rules "nothing here is a source of
truth, and nothing here feeds the game build." `assignment-8-icm/` is the
recently active one: a folder-as-agent prototype of assignment-8's Mara,
standalone by its own CONTEXT.md ("nothing here wires into phaser/").

## Doors
- `assignments/assignment-8-icm/CONTEXT.md` — the live-ish prototype's turn contract
- `assignments/assignment-7/style-guide.md` — the known derived copy of `narrative-pipeline/register.md`

## Hits
Nothing in the game. Changes here move only the coursework artifact and its
grade. The reverse edge is the one to remember: register or persona changes
silently stale the assignment copies, and that is accepted.

## Does not hit
The game build, ever. And note `assignments/assignment-7-old/` — hundreds of
superseded files with the same interior names as `assignment-7/`. Search
hits mix them freely; check the path segment before trusting anything under
`assignments/`.
