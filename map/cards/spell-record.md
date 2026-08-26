---
name: spell-record
type: content-record
status: live
record: content/magic/
---

## What it is
One JSON per spell in `content/magic/`, in the `narrative-pipeline/agents/spell-schema.md`
shape. 26 records: 16 approved, 10 rejected — rejected records stay on disk beside the
approved ones, same shape, no filename marker, because nothing is deleted (ruling
2026-08-04, `content/magic/_index.md`). The folder's `_index.md` carries the schema
rulings and the human-readable roll-up table.

## Doors
- `content/magic/_index.md` — the rulings: status, produces, receiver overrides, id keying
- `content/magic/ignite.json` — a representative record (produces `item_flame`)
- `content/magic/_component-requirements.json` — the component roll-up for the item seat

## Hits
Runtime selection filters on `status === "approved"` in both `phaser/tools/bundle-content.mjs`
and MagicDB — selecting by filename would ship rejected content (`phaser/README.md`
§Content rules). Chains run through the item layer: `produces`/`produced_by` must agree
with `content/items/`, verified by `node tools/content-check.mjs`. A receiver-level
`produces` overrides the spell-level default (ruled 2026-08-19, `_index.md` — the F8
heated-stone chain). Components are keyed by `item_id`, never prose.

## Does not hit
`gdd/04-magic-system.md` — the design-altitude spec, not the record. Its slice count
follows the records (raised 10 → 16 to match), not the other way. And not
`phaser/src/render/vfx/cues.json` — the spell's visuals are a separate noun (see
`cards/cue.md`).
