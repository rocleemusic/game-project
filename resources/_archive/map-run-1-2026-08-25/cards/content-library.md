---
name: content-library
type: content-record
status: live
record: content/
---

## What it is
The generated record library: one JSON per record under `content/items/`,
`content/key-items/`, `content/magic/`. Each folder's `_index.md` carries
its schema rulings — the folder is self-governing on purpose, so schema law
travels with the records. Verified by `node tools/content-check.mjs`
(CONTEXT.md table).

## Doors
- `content/items/_index.md` — item rulings: the name IS the slug; `item_id` is the join, `description` is prose
- `content/magic/` — 16 approved spells beside 10 rejected ones, same shape, no filename marker
- `narrative-pipeline/content-stages.md` — which content class gets generated when

## Hits
Two rulings from `content/items/_index.md` (2026-08-04, Roc): records have
no `name` field — the text after `item_` is the name — and spells reach
items only through `item_id`, never prose. From `phaser/README.md`: both
`bundle-content.mjs` and `MagicDB` filter on
`status === "approved"` — selecting spells by filename ships content that
never passed Roc's gate. Chains run through `produces`/`produced_by`
agreeing in the data; `if (spellId === "ignite")` anywhere is a design
break. Known open defect: `ignite.unlocks.screen` names "Forest Unlock 1",
which is no minted screen id (`phaser/README.md`, GP-106).

## Does not hit
`phaser/public/content/` — the bundled copy `npm run prep:content` writes.
Edit the record here and re-bundle; editing the bundle is overwritten. Item
generation beyond this set is parked by design to stages 4-6 (CONTEXT.md
§Parked).
