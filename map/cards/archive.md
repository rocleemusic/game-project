---
name: archive
type: run-artifact
status: leftover
record: resources/_archive/
---

## What it is
The territory's honest graveyard: the retired GDD compile lineage (v1–v10 drafts),
the frozen pre-Paca task backlog (`game-project-tasks.md`), retired process
artifacts, review boards, a frozen prior map run, and old templates. Everything here
says what it is and was superseded on purpose (`gdd/CONTEXT.md`: "kept for history,
not for reference").

## Doors
- `resources/parking-lot.md` — beside the archive, NOT in it: the live parked-decision list ("Parked, do not resolve" items in `CONTEXT.md` are stamped here)

## Hits
Nothing. Nothing reads from here at build or run time.

## Does not hit
`resources/` proper — the parent folder still holds live items (`parking-lot.md`,
`syllabus.md`, `prose-voice-rules.md`, the review-tool spec draft). Only the
`_archive/` subtree is retired; do not tar the parent with the child's status. And
a task found only in the archived backlog is not a task — Paca holds task state.
