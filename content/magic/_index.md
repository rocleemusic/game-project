# Magic — Spell Records

One `.json` file per spell, in the [`spell-schema.md`](../../narrative-pipeline/agents/spell-schema.md) shape. Each record carries the phrase, components as `item_id`s, learn source, confirm action, mana quality note, any knowledge-key unlock, and the receiver matrix.

**Spells attach to the role, never to a soul.** Any soul dealt Baker next life knows the baker's spells; "Toby's spell" is the check-1 defect and does not exist here.

**Every record carries a `status`. Nothing is deleted** (ruled 2026-08-04 — Roc): a rejected design stays on record so the reasoning behind it is not lost and the same idea is not re-proposed blind.

| Status | Means | Count |
|---|---|---|
| **approved** | Ruled in by Roc (gates of 2026-08-04 and 2026-08-05) — all ship | 16 |
| ~~rejected~~ | Ruled out. Kept on record, excluded from every roll-up | 10 |

**Amended at the 2026-08-05 gate.** `scratch` was ruled in with a **new effect — it soothes itches in unreachable places**; the GDD fixes its component (wool) but never stated its effect, so this adds to canon rather than contradicting it. `breath` was ruled in as written. `leap` was approved with its component changed to **an existing flame** (`item_flame`, newly minted), because the cast moves a flame that already exists and therefore spends it. `portion` was approved, and `weigh` was added to the Baker on Roc's word.

**`scratch` is the first spell whose intended receiver is alive**, which makes the physical-outcome rule load-bearing rather than incidental. Relief of an itch is a **bodily** event and is legal; contentment, gratitude or ease of mind are not, and whatever the receiver does about the relief belongs in `reaction_kind`. Note also that "living receivers never catch" is a rule about **fire**, not a general immunity.

**Spells can produce items, not only consume them** (ruled 2026-08-05 — Roc). Every record carries a `produces` array, empty for all but one: **`ignite` produces `item_flame`, because anything burning is mechanically a flame item**, and `leap` then consumes one. That makes `ignite` → `item_flame` → `leap` the first spell-to-spell chain in the set, and it runs through the item layer rather than through prose — the data states the chain instead of leaving a reader to infer it. `item_flame` is a **`world` item: it cannot be picked up.**

**A receiver may carry its own `produces`, overriding the spell-level default** (option A, ruled 2026-08-19 — Roc, for the F8 heated-stone chain). The spell-level array is the default; a receiver override wins on a landed cast. So `ignite × river_stone` mints `item_heated_stone` while `ignite × everything-else` keeps minting `item_flame`, and `temper × heated_stone` mints `item_tempered_stone`. This yields a three-step chain — `ignite` → `item_heated_stone` → `temper` → `item_tempered_stone` → `fetch × stone_wall` — that seats the tempered stone and opens the Heart of the Wood (F8). Both stone items are `world` items (`collectible: false`); the runtime carries the receiver `produces` (`types.ts` `Receiver.produces`, `CastResolver` `receiver.produces ?? spell.produces`), and `content-check` derives `produced_by` from spell-level **and** per-receiver `produces`. The gate chain itself is not wired yet — that is a separate, later step.

**Every approved spell ships — 16 of them** (ruled 2026-08-05 — Roc, closing GP-101; `weigh` approved the same day). The slice count in [`04-magic-system.md`](../../gdd/04-magic-system.md) was raised from 10 to 16 to match, rather than the set being cut down to 10 — the seven-role pass produced a set worth keeping whole, so the number followed the content. **Nothing is pending.** The ten rejected records stay on disk with their reasons.

The starter spells (`ignite`, `scratch`, `breath`) are placed with the role whose daily work justifies them. `ignite`'s receiver matrix reproduces the ruled worked run (`04-magic-system.md` §Worked run) faithfully. Component requirements roll up in [`_component-requirements.json`](_component-requirements.json) for the item-designer seat — **rejected spells are excluded from that roll-up**, so a rejected design cannot keep an item alive. Every item still has at least one live user; the rejections orphaned nothing.

**Components and requirements are both keyed by `item_id`** (ruled 2026-08-04 — Roc). A spell reaches the item that satisfies it through `item_river_stone`, never through the words "river stone" — so a spell's `components` array and every entry in `_component-requirements.json` hold ids, and `description` is a human-readable descriptor for the gate that joins nothing. A spell seat writes these ids before any item exists, so each one is a **proposal** the item designer either mints or flags back.

## Mage — personal goal: collect magic from around the world

| spell_id  | Phrase  | What it does                                                                                                                               | Components                             | Produces | Status       |
| --------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------- | ------------ |
| `glimmer` | glimmer | Raises small dancing lights in an area; on the Festival Grounds on festival night, many years of past casts show at once                   | `item_river_stone`                     | —        | **approved** |
| `echo`    | echo    | Replays a captured sound out of a resonant surface                                                                                         | `item_captured_sound` + `item_beeswax` | —        | **approved** |
| `fetch`   | fetch   | Tugs a small loose object a short way toward the caster; seats a tempered stone in the stone wall to open the Heart of the Wood (F8 chain) | `item_feather` + `item_wool`           | —        | **approved** |

## Blacksmith — forges the new Lantern Arch centerpiece

| spell_id | Phrase | What it does | Components | Produces | Status |
|---|---|---|---|---|---|
| `ignite` | ignite | Sets inert dry material alight; clears the dry hedge (Forest Unlock 1); heats a river stone (F8 chain) | `item_sticks` | `item_flame` · `item_heated_stone` (× `river_stone`) | **approved** · canon |
| `temper` | temper | Hardens a hot-worked piece evenly as it cools; sets and cools a heated stone (F8 chain) | `item_river_stone` + `item_spring_water` | `item_tempered_stone` (× `heated_stone`) | **approved** |
| `bind` | bind | Closes the seam of a broken hard thing whose halves are fitted together | `item_tree_sap` + `item_wool` | — | ~~rejected~~ |

## Baker — prepares the communal feast

| spell_id | Phrase | What it does | Components | Produces | Status |
|---|---|---|---|---|---|
| `portion` | portion | Parts a divisible mass into equal measures — a whole town served alike, with no scale big enough | `item_river_stone` | — | **approved** |
| `weigh` | weigh | Bears a thing up a hand's breadth and holds it at a height set by its heft — tells you how much, changes nothing | `item_river_stone` | — | **approved** |
| `knead` | knead | Works a mass through as if by many hands — the feast asks for more hands than one baker has | `item_spring_water` + `item_wool` | — | ~~rejected~~ |
| `rest` | rest | Pauses a change in progress: a rise holds where it stands, a pot holds at serving-hot, until it is next uncovered | `item_salt` + `item_wool` | — | ~~rejected~~ |
| `warm` | warm | Spreads low, even heat through the target | `item_ash` + `item_grass` | — | ~~rejected~~ |
| `sift` | sift | Separates fine from coarse in a mixture | `item_feather` | — | ~~rejected~~ |
| `cool` | cool | Draws heat out of the target without collapsing it | `item_spring_water` + `item_grass` | — | ~~rejected~~ |

## Postman — delivers the festival letters

| spell_id  | Phrase  | What it does                                     | Components     | Produces | Status               |
| --------- | ------- | ------------------------------------------------ | -------------- | -------- | -------------------- |
| `scratch` | scratch | Soothes an itch in a place the body cannot reach | `item_wool`    | —        | **approved** · canon |
| `seal`    | seal    | Closes a letter, parcel, or jar weather-tight    | `item_beeswax` | —        | **approved**         |
| `dry`     | dry     | Takes the water out of a soaked thing            | `item_ash`     | —        | **approved**         |
|           |         |                                                  |                |          |                      |

## Herbalist — brews the festival tonic that wards off the first frost

| spell_id | Phrase | What it does | Components | Produces | Status |
|---|---|---|---|---|---|
| `steep` | steep | Draws the virtue of what's in a vessel of water into the water, fast | `item_berry` + `item_spring_water` | — | **approved** |
| `preserve` | preserve | Holds a freshly cut or picked thing at fresh | `item_salt` | — | **approved** |
| `mist` | mist | Settles a fine cool mist over the target | `item_spring_water` + `item_feather` | — | ~~rejected~~ |

## Priest — leads the rite that lights the Lantern Arch and calls the souls home

| spell_id | Phrase | What it does | Components | Produces | Status |
|---|---|---|---|---|---|
| `leap` | leap | Sends a flame you spend across to a prepared wick; runs the whole Arch lantern-to-lantern when the wicks are dressed for the rite | `item_flame` | — | **approved** |
| `waft` | waft | Sends smoke, scent, or dust rising in a straight column | `item_grass` + `item_tree_sap` | — | **approved** |
| `toll` | toll | Sounds a single true tone from resonant material | `item_river_stone` | — | ~~rejected~~ |
| `still` | still | Calms moving air or water around the target for a short while | `item_dirt` + `item_wool` | — | ~~rejected~~ |

## Farmer — brings in the harvest that feeds the festival week

| spell_id | Phrase | What it does | Components | Produces | Status |
|---|---|---|---|---|---|
| `breath` | breath | A directed puff of air — winnows, scatters, feeds embers | `item_grass` + `item_dirt` | — | **approved** · canon |
| `furrow` | furrow | Parts worked ground in a seed-row along the cast | `item_sticks` + `item_dirt` | — | **approved** |
| `ripen` | ripen | Pushes near-ripe growth the last step to ripe | `item_berry` + `item_spring_water` | — | ~~rejected~~ |
