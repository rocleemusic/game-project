# Items — Derived Item Records

One `.json` file per item, in the [`item-schema.md`](../../narrative-pipeline/agents/item-schema.md) shape. Every item here is **derived from a spell's component requirement in [`_component-requirements.json`](../magic/_component-requirements.json) — never authored top-down.** An item that no spell needs is an orphan and a defect; this pass produced none. A requirement shared across roles resolves to one item (the merge working, not a conflict).

**The name is the slug** (ruled 2026-08-04 — Roc). A record has no `name` field: **the text after the `item_` prefix is the name** — `item_river_stone` is *river stone*. The same rule runs in [`../key-items/`](../key-items/_index.md), where `key_rite_chime` is *rite chime*.

**`item_id` is the join; `description` is for you** (ruled 2026-08-04 — Roc). Every requirement in `_component-requirements.json` carries the `item_id` it resolves to, so a spell reaches its item through the id and never through the prose. The field previously called `material` is now `description`, and it is free to be a descriptor rather than a bare label — it identifies nothing, so it cannot drift into a broken lookup. It is still not player-facing text; the lines a player reads belong to the Content Agent.

Source locations are drawn only from the real screen list in [`08-levels.md`](../../gdd/08-levels.md), two minimum per component (the Cozy rhythm pillar — a randomized day must never dead-end on a single source).

## Items

| item_id | description | category | persistence | collectible | where it is found | always_available | used_by | produced_by |
|---|---|---|---|---|---|---|---|---|
| `item_sticks` | sticks | component | pack-triaged | yes | Forager's Clearing · Forest Unlock 1 | **true** (gate-bearing: `ignite` clears Forest Unlock 1) | furrow, ignite | — |
| `item_wool` | wool | component | pack-triaged | yes | Town scene · Festival Grounds | false | fetch, scratch | — |
| `item_grass` | grass | component | pack-triaged | yes | Forager's Clearing · Festival Grounds | false | breath, waft | — |
| `item_dirt` | dirt | component | pack-triaged | yes | Forager's Clearing · Forest Unlock 1 | false | breath, furrow | — |
| `item_river_stone` | a river stone | component | pack-triaged | yes | Forager's Clearing · Forest Unlock 2 | false | glimmer, portion, temper, weigh | — |
| `item_feather` | a feather | component | pack-triaged | yes | Forager's Clearing · Square · Forest Unlock 2 | false | fetch | — |
| `item_berry` | a berry | component | pack-triaged | yes | Forager's Clearing · Forest Unlock 2 | false | steep | — |
| `item_spring_water` | spring water | component | pack-triaged | yes | Town scene · Forest Unlock 2 | false | steep, temper | — |
| `item_ash` | ash | component | pack-triaged | yes | The Workshop · Square | false | dry | — |
| `item_tree_sap` | tree sap | component | pack-triaged | yes | Forager's Clearing · Forest Unlock 1 | false | waft | — |
| `item_beeswax` | beeswax | component | pack-triaged | yes | Town scene · Festival Grounds | false | echo, seal | — |
| `item_salt` | salt | component | pack-triaged | yes | Town scene · Festival Grounds | false | preserve | — |
| `item_flame` | an existing flame | component | **world** | **no** | Town scene · Square · Festival Grounds | n/a — not foraged | leap | ignite |
| `item_heated_stone` | a hot river stone | component | **world** | **no** | Heart of the Wood | n/a — not foraged | temper | ignite |
| `item_tempered_stone` | a cooled river stone | component | **world** | **no** | Heart of the Wood | n/a — not foraged | fetch | temper |
| `item_captured_sound` | a captured sound | sound | **free** | yes | Square · Town scene · Festival Grounds | false | echo | — |

**`item_flame` is a `world` item — a third persistence class, ruled 2026-08-05 (Roc).** It **cannot be picked up**: `collectible: false`, no pack space, no forage. A flame is a thing you cast on and cast from, never a thing you pocket, so the two-source forage rule does not apply to it and its locations say **where fire occurs**, not where it is gathered. It is also the first item with a `produced_by`: **anything burning is mechanically an `item_flame`**, so `ignite` creates one wherever it catches.

That makes `ignite` → `item_flame` → `leap` the first **spell-to-spell chain**, and it runs through the item layer rather than through prose — the data states it, a reader does not have to infer it. Every item now carries `collectible` and `produced_by` so the shape is uniform; everything except the flame and the two stone-chain items is `collectible: true` with an empty `produced_by`.

**`item_heated_stone` and `item_tempered_stone` extend the pattern to a three-step chain** (F8, ruled 2026-08-19 — Roc). Both are `world` items — cast on and cast from, never pocketed (`collectible: false`). Their `produced_by` comes from a **per-receiver `produces`** (option A): `ignite × river_stone` mints `item_heated_stone` while `ignite × everything-else` still mints `item_flame`; `temper × heated_stone` mints `item_tempered_stone`. So `ignite` → `item_heated_stone` → `temper` → `item_tempered_stone` → `fetch` is the chain the data states, and `fetch × stone_wall` seats the tempered stone to open the Heart of the Wood. The `fetch` consumer is bound by the gate chain's `onProductOf`, not a `receiver_id`, so it is authored in `used_by` and validated as a live spell rather than derived from the content set.

Source logic in brief: forageables (sticks, grass, dirt, sap, berries, stones, feathers) come from the Forest screens plus outdoor town spaces; worked or traded goods (wool, beeswax, salt) from the Town scene's market stalls and the Festival Grounds' stalls; spring water from the well (Town scene) and the forest spring (Forest Unlock 2); ash from the Workshop's forge and the Square's braziers (RULED, Roc, 2026-08-13: the Workshop is no longer recipe-gated — `G-T4-recipe` rescinded, see `screen-specs.json`'s T4 entry — so this is a real, reachable source, not aspirational); sounds from wherever the town is making noise. No source outside the `08-levels.md` list.

**Two rulings applied 2026-08-04 (Roc).** The **Home Hub is not a forage point** — ash's second source moved from the home hearth to the Square's braziers. And **replaying a captured sound does not consume it**: `item_captured_sound` is `consumable: false`, so `echo` spends the capture the way knowledge is spent, which is to say not at all. It remains the one `free` item, costing no pack space.

## Scope arithmetic

**16 items against the ~15-item / roughly-3-per-category target** — just over the total, and lopsided: 15 components and 1 sound against a target of ~3 per category across six. That is expected rather than a defect, since every item here derives from a spell and the spells all consume or mint raw materials; the two additions are the F8 stone-chain intermediates, not new foraged goods. **Trimming, if any, is Roc's call at the spell gate, never this seat's** — the item list shrinks only when spells do.

Per category: component 15 · sound 1 · made 0 · memento 0 · gift 0 · tool 0.

**Ten rejected spells orphaned nothing.** Every one of the 16 items still has at least one live user or producer, because the roll-ups count only approved, canon and pending spells. `item_salt` came closest — it lost `rest` and keeps only `preserve`.

## Empty categories — a finding, not a hole

**made, memento, gift, and tool are empty.** No spell in the gated batch names a made thing, a memento, a gift, or a tool as a component, so the derived pass produced none — this is information about the spells (they all consume raw foraged or traded materials), not a gap in the item set. Those categories are fed by other pipelines (Make outputs, key items, Use-family tools) and inventing items here to populate them would be the top-down authoring this folder exists to prevent.

**Three of the four are now filled from elsewhere, as designed.** Roc ruled on 2026-08-04 that memento, gift and tool be authored top-down as **key items**, linked to a role and composed from 0–3 of the items above — they live in [`../key-items/`](../key-items/), not here, because they are authored rather than derived. `made` stays empty and is still a finding: nothing in the batch consumes a Make output.
