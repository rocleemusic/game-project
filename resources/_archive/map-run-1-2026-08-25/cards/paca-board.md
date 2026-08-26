---
name: paca-board
type: external-state
status: live
record: CONTEXT.md
---

## What it is
The task board. External to the repo: Paca project `game-project`, prefix
`GP`, id `5db8b37f-8976-49be-9d30-106c53c48303` (pointer in `CONTEXT.md`
§Start here). It exists because status banners in markdown went stale
repeatedly and cost at least one session — the tracker files were retired
2026-08-01.

## Doors
- `CONTEXT.md` §Start here — the boundary ruling and the /pm entry point
- `agents/production-pm.md` — the seat that reads the board
- `resources/_archive/game-project-tasks.md` — the frozen pre-Paca backlog

## Hits
The boundary: **Paca holds state; markdown holds reasoning.** Current
status, sprints and dependencies live on the board and win every "what is
open?" question. Why-it-was-built questions go to `plans/` and lose on the
board. Reporting rule from CONTEXT.md: never a bare id — always
`GP-37 (persistence — save/load across reshuffle)`.

## Does not hit
Any markdown file claiming status. `resources/_archive/game-project-tasks.md`
is retired — a task found only there is not a task. `plans/_handoffs/` says
where a session stopped, not what is open. Reconstructing board state from
this repo is the exact failure the 2026-08-01 ruling exists to prevent.
