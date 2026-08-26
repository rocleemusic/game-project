---
name: narrative-pipeline
type: contract
status: live
record: narrative-pipeline/
---

## What it is
The content-production subsystem as a folder of contracts and process docs:
`build-loop.md`, `guardrails.md`, `pipeline.md`, `steering-layer.md`,
`npc-codex.md`, `content-stages.md`, the agent seats in `agents/`, and the
schemas in `templates/`. It is a contract, not code — the deterministic half
lives in resolver; this folder governs what the generating agents may produce
and how a run is staged.

## Doors
- `narrative-pipeline/CONTEXT.md` — the index and the tooling split
- `narrative-pipeline/guardrails.md` — every check the Verifier runs
- `narrative-pipeline/templates/persona-card-schema.md` — the shape a soul card must hold

## Hits
`guardrails.md` item 6 is where the Content Agent and Verifier enforce register —
a guardrail change changes what generated text passes voice review. Soul cards
ride into every run through `templates/persona-card-schema.md` (soul's Hits: the
card's prose is the ambient style for everything generated against it). Changing
a template or seat here changes the next pipeline-run, whose output the polish
pass folds toward dialogue-inventory rows and run-folder-v01's ink.

## Does not hit
`pipeline-runs/*/` — run folders carry same-named copies of these docs and
templates, frozen at run time and knowingly divergent (pipeline-run's card).
Editing a copy there changes nothing.
