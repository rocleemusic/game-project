---
name: design-record
type: design-doc
status: live
record: plans/
---

## What it is
Why a thing was built the way it was, and what was ruled along the way — one file per
decision, named for the decision, never for the session (`plans/CONTEXT.md`). The
2026-08-23 ruling cluster (npc-dialogue-rework, intro-story, item-descriptions,
year-loop-saves, hud-relayout) currently governs the content-freeze push. Superseded
in place with a banner, never deleted.

## Doors
- `plans/CONTEXT.md` — the plans/ vs _handoffs/ split and the rules
- `plans/2026-08-17-phaser-pivot-mode4-plan.md` — the pivot's design record
- `plans/2026-08-03-storyline-authoring-process.md` — the most-cited record

## Hits
Rulings here are scope authority for downstream trackers and content:
`gdd/15-dialogue-inventory.md` explicitly defers to the 2026-08-23 rulings, and
gdd-sync (`cards/gdd-sync.md`) reconciles session rulings into `gdd/` files. Superseding a record means
a banner in place (pattern: `plans/2026-08-02-gp55-primal-seed-candidates.md`), plus
checking who cites it.

## Does not hit
Status. "Not status. Status is the Paca board — run /pm" (`plans/CONTEXT.md`). And
not `plans/_handoffs/` — same folder tree, opposite lifespan; a handoff is safe to
read and never safe to cite (see `cards/session-handoff.md`).
