---
name: gdd
type: design-doc
status: live
record: gdd/
---

## What it is
The design doc as 17 numbered domain files (`00-world-bible.md` through
`15-dialogue-inventory.md`), read in number order — not a single compiled document.
Compiled review drafts are minted by `gdd/compile.ps1` into `resources/` and retired
to `resources/_archive/` after Roc's edit pass (`gdd/CONTEXT.md` §Workflow). `00`
reads first: the world's canon that concept, cast and arcs stand on.

## Doors
- `gdd/CONTEXT.md` — the index, the compile workflow, what superseded what
- `gdd/13-scope-and-risks.md` — milestones, scope tiers, the ordered cut list
- `gdd/12-technical-overview.md` — engine authority since the pivot

## Hits
Operational rulings land first in `CONTEXT.md` and are reconciled into these files
via gdd-sync (`cards/gdd-sync.md`; `gdd/CONTEXT.md`: "If the two disagree between syncs, the newer
ruling wins; flag the gap rather than trusting either silently"). When a ruling
reverses a knowledge-base recommendation, that doc gets a supersession banner the
same session (the banner rule). `11-ai-agents-and-pipeline.md` is the single source
of truth for each agent's I/O — seat contracts and narrative-pipeline reference
it, never redefine it. A mechanic change in `gdd/04-magic-system.md` reaches the
build only by hand: a ruling applied to spell-record's `content/magic/` JSONs, then
re-bundled into phaser-build by `phaser/tools/bundle-content.mjs` (`prep:content`).
There is no automatic sync — the bundle reads `content/`, never `gdd/`
(`bundle-content.mjs` line 56).

## Does not hit
`resources/_archive/build-gdd-v*_draft.md` — the retired compile lineage, history
only. A cold reader who finds "Build GDD section N" in an old note should map it to
the numbered file, not open a draft.
