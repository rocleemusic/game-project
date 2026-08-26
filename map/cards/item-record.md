---
name: item-record
type: content-record
status: live
record: content/items/
---

## What it is
The generated record library for physical stuff: one JSON per common item in
`content/items/` (17 files) and per key item in `content/key-items/` (12 files). Each
folder's `_index.md` carries its own schema rulings. Items exist to satisfy spell
components and forage; key items serve soul storylines.

## Doors
- `content/items/_index.md` — schema rulings for common items
- `content/key-items/_index.md` — schema rulings for key items
- `tools/content-check.mjs` — the verifier that joins items to spells

## Hits
An item id change hits every spell whose `components` or `produces` names it —
the join is by `item_id`, never by prose (ruled 2026-08-04,
`content/magic/_index.md`), and `content-check` derives `produced_by` from
spell-level and per-receiver `produces`. World items (`item_flame`,
`item_heated_stone`) are `collectible: false` and must stay so — "cast on and
cast from, never pocketed" (`phaser/README.md` §The seams / content rules).

## Does not hit
`gdd/05-collectibles.md` — category design, not records. Also not
`content/magic/_component-requirements.json` directly: that roll-up is derived
from spell records for the item-designer seat; regenerate it, don't hand-edit.
Note `content/key-items/appearance.md` is a key-item art doc — see collisions.md,
three files are named appearance.md.
