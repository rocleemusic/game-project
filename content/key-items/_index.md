# Key Items — Stage-6 Records

One `.json` file per key item, across three of the six collectible categories ([`05-collectibles.md`](../../gdd/05-collectibles.md)): six role-tied and five soul-tied. **Every record carries a `status`** — after the 2026-08-05 gate, **10 approved and 1 out of slice**.

**Soul-tied key items are capped at two per soul for the slice** (ruled 2026-08-05 — Roc). Toby's are `key_unopened_jar` and `key_dawn_bundle`; Ilsa's are `key_spare_apron` and `key_knotted_cord`. `key_handed_plate` is **out of slice, not rejected** — it lost to the cap rather than on merit, so it stays on record as the first candidate if the cap lifts. That is a third status, distinct from both approved and deleted, and it exists because "cut for scope" and "wrong" are different facts about a record.

**A place is not an item (ruled 2026-08-05 — Roc).** Six soul-tied records were rejected and deleted for this across two passes; the survivors below are their replacements. A laid setting, a kept seat, a held-open door, a cleared spot — these are **arrangements of space**, not objects. They cannot be picked up, carried, given, or shelved, so they are not items however well they express a soul. **The test: could a player pick it up, put it in a satchel, and set it on a shelf in the hub?**

This bites hardest on Ilsa, whose card expresses her almost entirely through placement. Three moves got her three replacements past the test: take the one real object already inside a carded arrangement (the folded apron, not the laying-out of it); give a body to a behaviour that had no object at all (the knotted cord, for the arrivals she counts and never names); and separate a thing from its staging (the plate as a carved vessel handed over, not the plate as laid). **Rewording an arrangement to sound like an object does not pass** — the transfer or the carrying has to be real.

*(Unlike spells, rejected key items are **deleted** rather than kept on record — ruled 2026-08-05. Recoverable from git at `f2f748da` if that ruling is ever revisited.)*

**Role-tied or soul-tied (ruled by Roc 2026-08-04, extended same day).** The first ruling made the six items below role-tied — each links to a **role** from the pool in [`07-cast.md`](../../gdd/07-cast.md), traceable to that role's festival goal or daily work. The stage-6 amendment in [`content-stages.md`](../../narrative-pipeline/content-stages.md) then extended stage 6 (it did not reverse the ruling): a key item may be tied to a soul **or** a role, and the difference is what happens at the reshuffle. A role-tied item stays with the job — whoever is dealt Baker gets the baker's key items. A **soul-tied** item travels with the soul across lives, because it belongs to the person, not the seat; these are the echo-carriers. A record carries `role` or `soul`, never both. The earlier "role, never soul" statement is superseded by this extension.

**Composition (0–3, ruled by Roc 2026-08-04).** A key item is either **made** from 1–3 existing items in [`content/items/`](../items/_index.md) (`made_from` lists their `item_id`s; no forage sources needed) or **found** whole with 0 ingredients (then it carries at least two real `source_locations` from [`08-levels.md`](../../gdd/08-levels.md)). The spread across the six is deliberately varied: 0, 1, 2, and 3 all occur.

**Boundary note.** Ingredients come **only** from the 14 derived items in `content/items/` — no invented base items, and **never `item_flame`**, which is a `world` item that cannot be picked up and so cannot go into something made. Found sources come only from the real screen list; **the Home Hub is not a forage point (ruled by Roc 2026-08-04)** and never appears as a source. Tools are non-consumable Use-family items; mementos and gifts are pack-triaged.

**A gift goes player → NPC, full stop (ruled 2026-08-07 — Roc).** The `gift` category names one direction and only one: the player gives it to a soul. There is no NPC→player gift key item, and a record that describes one is wrong regardless of how well it fits the soul.

This needs saying because the cast contradicts it on the surface. Toby converts anything given to him into a debt he repays in goods, so he hands the player things constantly — and Ilsa's warmth arrives as a plate already set. **Those are narrative, not mechanical.** A soul handing something over is prose the Lines seat writes; it produces no key item, no record here, and nothing enters the player's pack. The giving that the item system models is the player's alone.

**The name is the slug (ruled 2026-08-04 — Roc).** A record has no `name` field. **The text after the `key_` prefix is the name** — `key_rite_chime` is *rite chime* — exactly as `item_river_stone` is *river stone* on the item side. `description` is the human-readable descriptor beside it and joins nothing, so it is free to describe rather than to identify. The field was called `name` until this ruling, which made it read like an identifier while the id was already doing that job.

## Role-tied key items

| key_item_id         | description                                | category | role       | composition                                      | status       |
| ------------------- | ------------------------------------------ | -------- | ---------- | ------------------------------------------------ | ------------ |
| `key_arch_filing`   | a filing from the Lantern Arch centerpiece | memento  | Blacksmith | found (Square · Town scene)                      | **approved** |
| `key_tonic_drop`    | a stoppered drop of the first-frost tonic  | memento  | Herbalist  | `item_berry` + `item_spring_water`               | **approved** |
| `key_sealed_letter` | a wax-sealed festival letter               | gift     | Postman    | `item_beeswax`                                   | **approved** |
| `key_berry_loaf`    | a preserved-berry loaf                     | gift     | Baker      | `item_berry` + `item_salt` + `item_spring_water` | **approved** |
| `key_stone_sickle`  | a stone-edged sickle                       | tool     | Farmer     | `item_sticks` + `item_river_stone`               | **approved** |
| `key_rite_chime`    | a small rite chime                         | tool     | Priest     | found (Festival Grounds · Forest Unlock 2)       | **approved** |
| `key_raw_ore`       | a rough vein of ore, pried out of the cave wall | material | Blacksmith | found (The Cave · Heart of the Wood)         | **approved** |

Six distinct roles, one (Blacksmith) now carrying two role-tied items — `key_arch_filing` (the finished centerpiece's filing) and `key_raw_ore` (the raw material that feeds the work). Mage is unassigned — its goal is personal, not civic.

**`key_raw_ore` (added 2026-08-13 — Roc's gate) introduces a seventh category, `material`**, alongside the six in [`05-collectibles.md`](../../gdd/05-collectibles.md) — raw crafting material distinct from `component` (spell ingredient) and `made` (Make output). Tied to role, not soul, matching `key_arch_filing`'s precedent and Ilsa's own card ("deliberately plot-inert" — the arc is role-side, not soul-side), which also keeps it clear of the soul-tied cap below.

## Soul-tied key items

**Capped at two per soul for the slice** (ruled 2026-08-05 — Roc).

| key_item_id | description | category | soul | composition | status |
|---|---|---|---|---|---|
| `key_unopened_jar` | a wax-sealed jar of preserves, never opened | memento | toby | `item_berry` + `item_beeswax` | **approved** |
| `key_dawn_bundle` | a small wool-wrapped bundle of provisions, tied the night before | gift | toby | `item_berry` + `item_grass` + `item_wool` | **approved** |
| `key_spare_apron` | a second work apron, folded and kept for hands that have not come | memento | ilsa | `item_wool` | **approved** |
| `key_knotted_cord` | a twisted wool cord, one knot per person of hers, never explained | memento | ilsa | `item_wool` | **approved** |
| `key_handed_plate` | a plain carved plate, wax-polished, from the deep end of her stack | gift | ilsa | `item_sticks` + `item_beeswax` | *out of slice* |
