---
name: dialogue-inventory
type: design-doc
status: live
record: gdd/15-dialogue-inventory.md
---

## What it is
The tracking table for the T15/T16 dialogue rework — one row per authored entry (43
core rows: intro, greetings, encounters, spell beats, festival night), with fill
status by design. Its own header states the boundary: "This table tracks; the
rulings rule." Scope comes from the 2026-08-23 rulings, steering from
`gdd/00-world-bible.md`.

## Doors
- `plans/2026-08-23-npc-dialogue-rework-ruling.md` — the scope authority (T15)
- `plans/2026-08-23-intro-story-ruling.md` — the intro scope (T16)
- `pipeline-runs/2026-08-25-full-content-generation/RESULTS.md` — the run that generated raw material for these rows

## Hits
Row statuses (`—`/`drafted`/`gated`/`built`) are the visible burn-down toward the
2026-08-28 content freeze. The 2026-08-25 amendment (Roc) removed Mara's
hand-written-exemplar exception — all souls generate through the model. Marking a
row `gated` asserts Roc approved it; marking `built` asserts the text is in ink —
meaning run-folder-v01's `lantern-projects/v01/ink/`, where touching source means
an inklecate recompile (run-folder-v01's Hits).

## Does not hit
The rulings themselves. Editing this table never changes scope — deep-three-only
greetings ×3, one greeting per texture NPC, approved-spells-only beats all come from
the ruling files, and a table row contradicting a ruling is a table bug. Also not
the Paca board: this tracks content fill, not task state.
