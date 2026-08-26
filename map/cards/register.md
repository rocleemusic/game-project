---
name: register
type: design-doc
status: live
record: narrative-pipeline/register.md
---

## What it is
The output voice contract for all player-facing text — Frieren-flat, a production
rule with measured numbers (median turn 5–7 words, long run begins ~26). Scoped to
player-facing text only; how persona cards themselves are written is a separate
contract in `narrative-pipeline/templates/persona-card-schema.md`, which matters
because the card's prose is the ambient style for everything generated against it.

## Doors
- `narrative-pipeline/register.md` — the contract and the corpus numbers
- `narrative-pipeline/register-audit.md` — which provenance claims are verified vs wrong
- `knowledge-base/dialogue-corpus/` — the 4,735-turn corpus the numbers come from

## Hits
Every Content Agent line and the Verifier's voice check enforce this file —
narrative-pipeline's `guardrails.md` item 6. The 2026-08-25 generation run's outputs
were reviewed against it (`pipeline-runs/2026-08-25-full-content-generation/RESULTS.md`,
"one real voice slip"). A register change means re-reviewing pending generated text
before the polish pass copies anything into canon. Its player voice also governs the
content descriptions phaser-build ships via `phaser/tools/bundle-content.mjs` — the
T17 pass writes every `content/` description in it (`plans/2026-08-23-item-descriptions-ruling.md`).
Honest dead end: a register change cannot reach already-shipped text — nothing
re-passes the register over `lantern-projects/v01/ink/`, `story.json`, or the
bundled copies; the voice check runs at generation time only.

## Does not hit
`assignments/assignment-7/style-guide.md` — a derived restatement for coursework,
never the source (`CONTEXT.md` §Where things live: assignments derive copies).
And not `gdd/14-visual-style-guide.md` — "style guide" there means the visual/UI
system. See collisions.md: "style guide" is three documents.
