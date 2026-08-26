---
name: paca-board
type: external-state
status: live
record: CONTEXT.md
---

## What it is
The external Paca board is the authority for task state; the in-territory pointer is
`CONTEXT.md` §Start here — project `game-project`, prefix `GP`, id
`5db8b37f-8976-49be-9d30-106c53c48303`. The boundary: **Paca holds state; markdown
holds reasoning.** Status banners in files went stale repeatedly and cost a session,
which is why the tracker files were retired on 2026-08-01.

## Doors
- `CONTEXT.md` §▶ Start here — the pointer and the "run /pm first" rule
- `agents/production-pm.md` — the PM seat that reads the board
- `resources/_archive/game-project-tasks.md` — the frozen pre-Paca backlog (history only)

## Hits
Any question of what is open, late, blocked or unreviewed goes to the board via
`/pm` — never reconstructed from markdown. The PM seat has split authority: task
creation/status/readiness docs are ungated; scope cuts, date changes and priority
reshuffles need Roc's explicit word every time (`CONTEXT.md` §Rules, ruled
2026-08-01). Never report a bare task ID — always `GP-N (short name)`.

## Does not hit
`plans/` and `plans/_handoffs/` — those hold why and where-we-stopped, not state.
A task found only in `resources/_archive/game-project-tasks.md` is not a task
(see collisions.md: tasks live in two worlds).
