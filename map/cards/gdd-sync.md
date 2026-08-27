---
name: gdd-sync
type: contract
status: live
record: commands/gdd-sync.md
---

## What it is
The ruling-reconciliation process — how session rulings reach `gdd/` files. The spec
now sits in-territory at `commands/gdd-sync.md`, a copy of the RL_MAP session command.
It proposes diffs mapping each dated ruling to the one gdd file that owns the topic;
Roc gates every diff. It also owns the supersession-banner rule for reversed reference
docs. Trap: the copy's own paths read `ProjectOS/game-project/gdd/` — the source
layout, not this repo. In this territory those are the root-level `gdd/` (see
collisions.md).

## Doors
- `commands/gdd-sync.md` — the spec: trigger, scope, protocol, banner rule
- `gdd/CONTEXT.md` — the index the mapping step reads ("How the pieces fit")

## Hits
A run writes approved diffs into gdd files and supersession banners into
knowledge-base docs (the banner rule; knowledge-base's card). Rulings sourced
from design-record files and session chat land in gdd this way — gdd's Hits:
"Operational rulings land first in `CONTEXT.md` and are reconciled into these
files via gdd-sync." Task status, handoffs, and working-style notes are
explicitly out of its scope (spec §Scope).

## Does not hit
The rulings themselves — it moves rulings into gdd, it never mints or edits
one; a design-record file stays the scope authority it was. And not the Paca
board: "Task status — that is Paca" (spec §Scope).
