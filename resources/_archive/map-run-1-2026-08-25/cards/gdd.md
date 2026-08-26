---
name: gdd
type: design-doc
status: live
record: gdd/
---

## What it is
The design doc: 16 numbered sections (`00-world-bible.md` through
`15-dialogue-inventory.md`) plus its own `gdd/CONTEXT.md` index. Numbered
files so a citation like "§13" always resolves to one path. It governs
scope tiers, the milestone calendar, risks, the ordered cut list, and the
agent crew's I/O contracts.

## Doors
- `gdd/13-scope-and-risks.md` — milestones, scope tiers, the cut list
- `gdd/11-ai-agents-and-pipeline.md` — the crew roster; single source of truth for each agent's I/O
- `gdd/12-technical-overview.md` — engine authority, incl. the 2026-08-17 pivot

## Hits
Section 11 is load-bearing beyond the GDD: `narrative-pipeline/CONTEXT.md`
rules that the pipeline spec "references those agents; it does not redefine
them." The PM seat's split authority (ruled 2026-08-01) amends the Gate row
at `gdd/11-ai-agents-and-pipeline.md:26`. Sections 12-13 are the cited
authority for the Phaser pivot (CONTEXT.md banner). Session rulings flow
back in via the `gdd-sync` command (root CLAUDE.md).

## Does not hit
`gdd/14-visual-style-guide.md`'s rendered counterpart
`phaser/tools/screen-flow/mockups/design-system.html` is a live pair, not a
copy to ignore — but prose-voice questions never go to the GDD at all; they
go to `narrative-pipeline/register.md`. And the GDD carries zero task
status: state lives on the Paca board.
