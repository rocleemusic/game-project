---
name: register
type: design-doc
status: live
record: narrative-pipeline/register.md
---

## What it is
The output voice contract for all player-facing text — Frieren-flat, the
Roc+Frieren player-voice blend (ratified 2026-07-28), and the per-card
warmth/length loosening (2026-07-29). It lives in the pipeline folder
because every generation step and the Consistency Verifier are audited
against it, not against taste.

## Doors
- `narrative-pipeline/register-audit.md` — how compliance is checked
- `pipeline-runs/2026-08-17-register-loosening/` — the frozen run that tested loosening
- `narrative-pipeline/guardrails.md` — the wider invariant checklist it sits inside

## Hits
Changing the register changes what the Content Agent may write and what the
Verifier flags — every future pipeline run, and re-review of existing lines
if the change is retroactive. `assignments/assignment-7/style-guide.md` is a
derived restatement of this file (CONTEXT.md, assignments row) and will go
stale the moment this moves.

## Does not hit
`assignments/assignment-7/style-guide.md` in the other direction — editing
the assignment copy changes nothing in the game; nothing under
`assignments/` is a source of truth. Visual style questions go to
`gdd/14-visual-style-guide.md`, a different document entirely.
