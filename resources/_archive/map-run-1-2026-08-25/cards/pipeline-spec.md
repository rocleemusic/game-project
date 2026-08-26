---
name: pipeline-spec
type: design-doc
status: live
record: narrative-pipeline/
---

## What it is
The working spec for how story content gets made: `pipeline.md` (the 13
steps), `steering-layer.md` (the arc doc), `guardrails.md`,
`build-loop.md`, `templates/` (fillable schemas incl. persona_card,
choice_node, screen_spec). Its own `narrative-pipeline/CONTEXT.md` is the
index. Shaped as a folder of small specs because each seat loads only its
own step.

## Doors
- `narrative-pipeline/CONTEXT.md` — the index and the north-star constraint
- `narrative-pipeline/templates/choice-node-schema.md` — nesting cost + `MAX_NESTING` policy
- `narrative-pipeline/content-stages.md` — stage vs step: two independent numberings

## Hits
Template changes hit every future run and the seats that fill them.
Couplings from CONTEXT.md's key-files table: `choice-node-schema.md`
carries the `MAX_NESTING` policy, `persona-card-schema.md` carries the
Soul-3 asymmetry-axis watch. Agent I/O is NOT defined here —
`gdd/11-ai-agents-and-pipeline.md` stays the single source of truth for
that (`narrative-pipeline/CONTEXT.md` §The map to the §11 agents).

## Does not hit
`pipeline-runs/` — frozen snapshots do not update when the spec moves.
Terms trap: a **stage** is a content class (1-7), a **step** is a move of
the procedure (1-13); the numberings are independent, and conflating them
misreads the whole spec.
