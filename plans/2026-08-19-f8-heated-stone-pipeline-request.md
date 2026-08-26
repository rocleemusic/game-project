# F8 heated-stone chain — content pipeline request

Roc's ruling (2026-08-19): F4 gate cut (done). F8 becomes a two-step chain built
on a new item. **New content is generated through the pipeline, not hand-authored**
(Roc). This is the request for the spell seat (stage 3, `agents/spell-schema.md`)
and the item seat (stage 4/5, `agents/item-schema.md`), gated by Roc at the end.

## The mechanic (Roc, confirmed 2026-08-19)

You reach the Heart of the Wood (F8) by working a river stone into the wall:

1. **ignite × river stone** → heats it into a **heated stone**. Too hot to touch.
2. **temper × heated stone** → sets and cools it into a **tempered stone** you can
   now handle. (temper already means "hardens a hot-worked piece as it cools.")
3. **fetch × stone wall** → tugs the tempered stone across and seats it in the wall.
   That cast clears the way into F8.

So the F8 gate is a 3-step chain: `ignite → (heated) → temper → (tempered) → fetch
onto the wall`. Two intermediate items capture the two state changes.

## What the pipeline needs to generate

### 1 — New derived item (stage 4): `item_heated_stone`
- **Descriptor:** a river stone heated through — glowing, holds its heat, too hot
  to touch.
- **persistence:** `world` (same class as `item_flame`: on a screen, **cannot be
  pocketed**). `collectible: false`.
- **produced_by:** `ignite` (on a river stone — per-receiver `produces`, option A).
- **used_by:** `temper` (which cools it into the tempered stone).

### 2 — New derived item (stage 4): `item_tempered_stone`
- **Descriptor:** the same stone, set and cooled by tempering — hard, holds its
  shape, cool enough to move.
- **persistence:** `world` (still a screen object fetch moves; not pocketed).
  `collectible: false`.
- **produced_by:** `temper` (on a heated stone).
- **used_by:** `fetch` (which seats it in the wall). Spent when seated.

### 3 — New receiver on `ignite` (stage 3): `river_stone`
- **receiver_class:** `inert`.
- **physical_outcome (seat authors):** the stone takes the heat and glows — too
  hot to lift. Mints `item_heated_stone` (per-receiver produces).
- **reaction_kind:** `null`.

### 4 — New receiver on `temper` (stage 3): `heated_stone`
- **receiver_class:** `inert` (the product of step 0).
- **physical_outcome (seat authors):** the heat sets and evens as it cools — the
  stone hardens into a piece you can handle. Mints `item_tempered_stone`.
- **reaction_kind:** `null`.

### 5 — New receiver on `fetch` (stage 3): `stone_wall`
- **receiver_class:** `inert` (a **fixed feature** on F8, confirmed — cast fetch
  *at* it, like ignite at the dry hedge; not a carryable item).
- **physical_outcome (seat authors):** tugs the tempered stone across and seats it
  into the wall's socket; the way into the Heart of the Wood opens.
- **reaction_kind:** `null`.
- **Requires:** the tempered stone to exist first (the chain binds it).

### 6 — Cross-pass (stage 7)
Run the three new receivers back through the arc + NPCs and enumerate any
soul/creature reactions. All three receiver ids are inert, so expect none — but
the pass is the contract.

## Schema decision (Roc: option A, confirmed 2026-08-19)

**Per-receiver `produces`.** A receiver entry may carry its own `produces` array;
the spell-level array is the default and the receiver override wins. So:
- `ignite × river_stone` produces `item_heated_stone`; `ignite × everything-else`
  keeps producing `item_flame` from the spell-level default.
- `temper × heated_stone` produces `item_tempered_stone`.

This is a real schema change the pipeline must carry through:
- `spell-schema.md` — a receiver may declare `produces`.
- The resolver / bundler — pass the receiver `produces` through to the runtime.
- `CastPipeline` — on a landed cast, prefer the matched receiver's `produces` over
  the spell-level array when applying `applyCast`'s `produced` list.
- `GateEvaluator` — `onProductOf: k` must bind to what step k's *receiver* minted,
  not the spell's default. Verify the chain evaluator reads the receiver product.

## Engine change — staged, NOT applied (depends on the generated content)

`src/world/gates/data/gateRules.json`, `G-F8-combine`, becomes a 3-step chain:

```json
{ "kind": "chain", "steps": [
  { "spellId": "ignite", "receiverId": "river_stone" },
  { "spellId": "temper", "receiverId": "heated_stone", "onProductOf": 0 },
  { "spellId": "fetch",  "receiverId": "stone_wall",   "onProductOf": 1 }
]}
```

Step 1 binds to what step 0 minted (`item_heated_stone`); step 2 binds to what
step 1 minted (`item_tempered_stone`). **Not applied yet** — until the receivers
and items exist the gate would name unauthored pairs and fail `npm run gates` /
`orphans`. Apply it in the same commit as the approved content.

**Note on receiver ids vs product ids.** Steps name a `receiverId` (`heated_stone`,
`stone_wall`) AND an `onProductOf`. The evaluator must accept a step whose target
is a prior step's product — confirm `temper`'s `heated_stone` receiver and the
`onProductOf` binding resolve to the same object, or the chain will never match.

## Order of operations

1. **Schema change first** (option A): extend `spell-schema.md`, the resolver/bundler,
   `CastPipeline`, and `GateEvaluator` to carry per-receiver `produces`. Verify the
   chain evaluator binds `onProductOf` to the receiver's product.
2. Spell seat authors the three receivers; item seat mints `item_heated_stone` and
   `item_tempered_stone`.
3. Consistency Verifier + `node tools/content-check.mjs`.
4. **Roc's human gate.**
5. Apply the `gateRules.json` 3-step chain, re-bundle, `npm run gates` + `orphans`
   clean, `npm run walk` (and confirm the chain is castable end to end).

## Status

- **F4 gate: cut and verified** (graph + f2.ink, re-bundled). Editor shows only F8
  stranded.
- **F8: fully specified, all decisions confirmed (Roc, 2026-08-19).** Ready for a
  pipeline run. Nothing authored or approved yet — the only remaining human
  touchpoint is Roc's gate on the generated content.
