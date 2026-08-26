# Handoff — Forage reconcile, pool spread, and role wiring

**Written 2026-08-23. Ruled by Roc the same day. A build session executes this.**

Capstone Tue 2026-09-01. Content freeze Fri 2026-08-28. This is a pre-freeze change.

---

## What this is

Three rulings, one build pass:

1. **Reconcile forage pool names to item ids.** The two vocabularies become one. Closes `GAPS.md` G13.
2. **Spread the forage pools** so every approved spell can be gathered on a single screen. Rarity is dropped — no `Forage` mechanic change.
3. **Wire three ratified `role_tag`s** that never made it into the data.

All three are data plus small mechanical source edits. No new mechanics. No content record rewrites. No authored ink changes.

---

## Why — the finding behind it

An audit on 2026-08-23 measured the real forage draw and the real move graph. Three things came out.

**Move budget is not tight.** `movesLeft` resets to 3 on every time-block boundary ([`main.ink:359`](../../lantern-projects/v01/ink/main.ink)), and there are three playable blocks. That is about nine screen touches a day, 45 across the week. A single day can walk every forageable screen in the game.

**Scarcity is an accident of pool size.** `Forage.offer()` has no rarity weighting. It rotates a screen's pool by a seed and takes `1 + (seed % poolSize)`. So a one-pool screen always offers its item and a five-pool screen starves. Measured across the real 15 visit-slots per screen:

| Item | Screen | Pool size | Offered |
|---|---|---|---|
| grass | F1 | 5 | 5/15 |
| dirt | F1 | 5 | 5/15 |
| feather | F1 | 5 | 6/15 |
| beeswax | T2 | 3 | 8/15 |
| spring water | F4 | 1 | **15/15** |

The fiction is backwards. `"rare component"` on F4 is the most reliable item in the game. The ordinary market goods vanish. Nothing in code reads `"rare"` — it is a pool name.

**Four spells have no single-screen home today.** `fetch`, `steep`, `temper`, `waft`. That is 12 of 16.

Naive spreading makes this worse, not better — it drops to 10 of 16 because it scatters components that share a recipe. Pairing by recipe gets 16 of 16 while capping pools at three.

---

## Task 1 — Reconcile pool names to item ids

Make `screen-specs.json`'s `forage` entries hold `item_id` strings directly. The pool-name vocabulary stops existing.

### Why this is safe

Four facts, all verified on disk 2026-08-23:

- **No authored ink reads the `Satchel` LIST.** `grep -rn "Satchel" lantern-projects/v01/ink` returns the `state.ink` declaration and nothing else. Independently confirmed at [`plans/2026-08-11-unreal-feature-complete-plan.md:116`](../2026-08-11-unreal-feature-complete-plan.md). The resolver's `item_held` predicate exists and no content uses it.
- **The resolver needs no change.** [`graph.ts:137`](../../tools/resolver/src/graph.ts) already runs `inkAddress(f)` on every forage name. `inkAddress("item_river_stone")` returns `item_river_stone` unchanged. The LIST regenerates correctly on its own.
- **`LanternPlayer.pickup()` does not validate against the LIST.** It stores the string it is handed ([`play.ts:506`](../../tools/lantern/src/lib/play.ts)).
- **Saves already fail loudly on a schema change.** `SAVE_VERSION = 1` and a mismatch is reported as `version-mismatch`, never coerced.

### Source edits — four literals, that is all

| File | Line | From | To |
|---|---|---|---|
| `phaser/src/mode/modes.ts` | 61 | `guaranteedPools: ["herbs"]` | `guaranteedPools: ["item_berry"]` |
| `phaser/src/mode/modes.ts` | 108 | `guaranteedPools: ["sticks"]` | `guaranteedPools: ["item_sticks"]` |
| `phaser/src/render/HotspotSystem.ts` | 198 | `new Forage(this.withExtraForage(deps.graph), ["sticks"])` | see Task 3 |
| `phaser/src/scenes/ScreenScene.ts` | 82 | `new Forage(data.run.graph, ["herbs"])` | `new Forage(data.run.graph, ["item_berry"])` |

Everything else that mentions a pool name is a comment or a pass-through that never inspects the string. Confirmed by grep. In particular `glyphKindFor()` at [`SatchelScene.ts:106`](../../phaser/src/scenes/SatchelScene.ts) does substring matching (`id.includes("wool")`) and already works on item ids — leave it alone.

### Keep the join module as an identity shim

Do **not** delete `phaser/src/world/foragePoolToItem.ts` in this pass. Replace its body with:

```ts
/**
 * IDENTITY SHIM. Pool names and item ids were reconciled 2026-08-23 (Roc) —
 * `screen-specs.json` now authors `item_id` strings directly, so this join is
 * a no-op. Kept so every call site (`SatchelLedger`, `DroppedItemHotspots`,
 * the save layer) stays untouched during freeze week. Delete post-capstone,
 * once it is provably dead.
 */
export function itemForPool(pool: string): string {
  return pool;
}
export function poolForItem(itemId: string): string {
  return itemId;
}
```

`FORAGE_POOL_TO_ITEM` has one remaining consumer — see Task 4's audit note. Remove the export only after that is handled.

Same restraint for `GameEvents`' `poolName` field. It now carries the same string as `itemId`. Leave the field, update its doc comment, deprecate post-capstone.

### Save schema

Bump `SAVE_VERSION` from `1` to `2` in `phaser/src/world/save/SaveGame.ts`. Old saves hold `"river stones"` in `satchelPoolNames`, which no longer joins to anything. Version 2 makes them refuse cleanly with `version-mismatch` instead of restoring a satchel full of dead strings.

Do not rename `satchelPoolNames` this pass. The field name is now inaccurate and that is a comment fix, not a schema fix. Renaming it touches four files for zero behaviour change.

Update the two-vocabularies headers in `SaveCoordinator.ts`, `SaveGame.ts`, `InkStatePort.ts`, `LanternInkStatePort.ts` and `SatchelLedger.ts` to say the hazard is closed and why. These headers are load-bearing documentation — a future reader who believes them will reintroduce the bug.

---

## Task 2 — The 16/16 layout

Rewrite the `forage` arrays in `tools/resolver/data/screen-specs.json`. Screens not listed keep no forage array.

| Screen | Name | `forage` |
|---|---|---|
| T1 | Town Square | `["item_ash", "item_feather"]` |
| T2 | Market Row | `["item_wool", "item_feather"]` |
| T3 | The Commons / Well | `["item_spring_water", "item_berry"]` |
| T4 | The Workshop | `["item_ash", "item_wool"]` |
| T7 | Festival Grounds | `["item_beeswax", "item_grass"]` |
| F1 | Forager's Clearing | `["item_sticks", "item_dirt", "item_grass"]` |
| F2 | The Stream | `["item_river_stone", "item_spring_water"]` |
| F3 | The Grove | `["item_grass", "item_tree_sap"]` |
| F4 | The Still Pool | `["item_spring_water", "item_berry"]` |
| F7 | The Cave | `["item_captured_sound", "key_raw_ore"]` |
| F8 | Heart of the Wood | `["key_raw_ore"]` |

T8 The Old Shrine stays empty. A shrine with a forage pile reads wrong.

**Duplicates are intended.** Ash on T1 and T4, spring water on T3, F2 and F4. That is what lets a two-pool screen still cover a two-component recipe. Roc's call, 2026-08-23.

### What this buys

Every one of the 16 approved spells now has at least one screen carrying all its components:

| Spell | Needs | Home screen(s) |
|---|---|---|
| breath | grass + dirt | F1 |
| dry | ash | T1, T4 |
| echo | beeswax (+ captured sound, seeded) | T7 |
| fetch | feather + wool | T2 |
| furrow | sticks + dirt | F1 |
| glimmer | river stone | F2 |
| ignite | sticks | F1 |
| leap | flame (produced by ignite) | any |
| portion | river stone | F2 |
| preserve | salt (Toby hands it over) | T2 |
| scratch | wool | T2, T4 |
| seal | beeswax | T7 |
| steep | berry + spring water | T3, F4 |
| temper | river stone + spring water | F2 |
| waft | grass + tree sap | F3 |
| weigh | river stone | F2 |

Reliability floor rises from 5/15 to 9/15 visit-slots. Restoring the `item_sticks` guarantee on F1 lifts its other two pools to about 11/15.

---

## Task 3 — Delete the dead config

**Delete `phaser/src/world/collectExtraForage.ts`.** Its whole job was patching `"ash"` onto T4 and `"ore"` onto F7/F8 client-side, because `screen-specs.json` had no such pools. Task 2 puts them in the real arrays. Remove `withExtraForage` from `HotspotSystem` and the `EXTRA_FORAGE_POOLS` import from `tools/content-audit.mjs` (pass `extraForagePools: {}`).

**Wire `guaranteedPools` for real.** `ModeDescriptor.forage.guaranteedPools` and `.extraPools` are declared at [`ModeDescriptor.ts:66`](../../phaser/src/mode/ModeDescriptor.ts), set in `modes.ts`, and **read by nothing**. `HotspotSystem.ts:198` hardcodes `["sticks"]` instead. Make `HotspotSystem` take the mode's `guaranteedPools` and drop the hardcode. Then delete `extraPools` from `ModeDescriptor` and all four mode objects — with `collectExtraForage.ts` gone it has nothing to switch on.

Mode inheritance for reference: `DAYLIFE` and `COLLECT` each declare their own `forage`. `DISCOVER_HOME` spreads `COLLECT`. `MODE5` spreads `DISCOVER_HOME`. So mode5's guarantee comes from `COLLECT` at line 108.

---

## Task 4 — The regression test

Add a test asserting **every approved spell has at least one screen carrying all its components**. This is the rule that would have caught the original defect, and it guards the layout against a future edit quietly stranding a spell.

Put it beside the existing content audit rather than in a scene test — it is a data question with one right answer. Add it as a rule in `phaser/src/world/audit/rules.ts` (`spell-components-unco-located`) with its report entry in `report.ts`, plus a unit test in `rules.test.ts`. Adding a rule id without a `RULE_INFO` entry is a compile error by design, so both files move together.

Inputs the rule needs: approved spells with `components`, screens with `forage`, the NPC gift table, and the set of items the host seeds or produces (`item_captured_sound` seeded at [`CollectScene.ts:347`](../../phaser/src/scenes/CollectScene.ts), `item_flame` produced by casting ignite). A spell whose only components are seeded or produced passes trivially — that is `leap`, and it is correct.

**Also fix the audit's forage join.** `tools/content-audit.mjs:130` passes `FORAGE_POOL_TO_ITEM`. After reconciliation that table is an identity shim and passing it is meaningless. Build the map from the graph instead:

```js
const poolNames = new Set((graph.screens ?? []).flatMap((s) => s.forage ?? []));
// ...
foragePoolToItem: Object.fromEntries([...poolNames].map((p) => [p, p])),
```

This keeps `forage-pool-unjoined` meaningful — it now asks whether every forage entry names a real item or key-item record, which is exactly the right check.

---

## Task 5 — Wire the ratified role tags

Independent of Tasks 1–4. Touches different files.

Roc ratified four `role_tag`s on 2026-08-09. None reached the data. `NpcTalkSystem.roleFor()` reads `graph.souls[].role_tag`, so a soul with no tag gets no portrait click handler at all — no spell clue, no gift, no talk row.

**Wire three of the four.** Add to `tools/resolver/data/scene-graph.json`:

| Soul | `role_tag` | Source |
|---|---|---|
| bex | `Farmer` | [`cast/bex.md:126`](../../cast/bex.md) |
| juno | `Priest` | [`cast/juno.md:61`](../../cast/juno.md) |
| pip | `Postman` | [`cast/pip.md:86`](../../cast/pip.md) |

Carry a `role_tag_note` on each citing the 2026-08-09 ratification and the card, matching the shape the three existing souls already use.

**Linnet stays out. Ruled by Roc 2026-08-23.** Her ratified role is Village Chief, which teaches no spells, and she is dealt out of this slice. Wiring her tag would buy nothing. Do **not** add `role_tag: "Village Chief"` to `scene-graph.json` and do **not** add a `Village Chief` row to `role-workplace.json`.

Nell stays undealt. [`cast/nell.md:94`](../../cast/nell.md) says so explicitly and calls it her open item 1. Do not invent one.

Leaving both out is consistent with the rest of the data. `lantern-projects/v01/personas.json` authors six souls — bex, ilsa, juno, mara, pip, toby. Linnet and Nell have no persona card and no authored scenes. They stand in the world as background figures, which is what a role-less soul renders as.

**This changes day placements.** `role_tag` feeds `soulWeight`'s `role_anchor` bonus at [`day.ts:83`](../../tools/resolver/src/day.ts). Giving three souls a role will move where they stand. It is a weight, not a pin, and the guarantee floor only covers deep souls — so re-verify placements after the rebuild, do not assume.

**Un-skip `phaser/tests/StarterSpells.test.ts:54`.** `it.skip("every approved spell is start-known or reachable from an NPC")` is marked PENDING RULING. The ruling is these three tags. Once they land, every approved spell has a teacher: Farmer teaches breath and furrow, Priest teaches leap and waft, Postman teaches dry, scratch and seal. That closes the last seven.

The one-spell-per-soul-per-day limiter is not a problem. `rotatingClueIndex` steps by day, so a role's whole set surfaces within any `count` consecutive days, and the largest role owns three.

---

## Order of operations

1. Task 5's `scene-graph.json` edit. `role-workplace.json` is untouched — the Farmer, Postman and Priest rows it already carries are exactly what the three new tags need.
2. Task 2's `screen-specs.json` rewrite.
3. Rebuild the run folder:

```bash
cd tools/resolver && node src/cli.ts build --data data --out ../../lantern-projects/v01 --emit-story && node src/cli.ts resolve-week --data data --out ../../lantern-projects/v01
```

4. Confirm `lantern-projects/v01/ink/state.ink`'s `LIST Satchel` now reads item ids, and `graph.json`'s forage arrays match Task 2's table.
5. Task 1's four source literals, the identity shim, the `SAVE_VERSION` bump, the header rewrites.
6. Task 3's deletions.
7. Copy the run into the phaser build:

```bash
cd phaser && npm run prep:content
```

8. Task 4's audit rule and test.
9. Test sweep — the mechanical part.

### The test sweep

These files hold pool-name string literals that will now be wrong. Counts are matches per file, so this is the size of the job, not a list of every edit:

| File | Literals |
|---|---|
| `tests/characterization/SatchelLedger.test.ts` | 11 |
| `tests/CollectMode.test.ts` | 4 |
| `tests/SaveLoad.test.ts` | 4 |
| `tests/Forage.test.ts` | 3 |
| `tests/GateEngine.test.ts` | 2 |
| `tests/SatchelStrip.test.ts` | 2 |
| `tests/SatchelPockets.test.ts` | 1 |
| `tests/WorldView.test.ts` | 1 |
| `tests/DroppedItems.test.ts` | uses `poolForItem` |

Also `tools/resolver/test/day.test.ts`, `tools/resolver/test/graph.test.ts`, `tools/resolver/fixtures/screen-specs.json`, and the lantern fixtures under `tools/lantern/fixtures/` and `tools/lantern/test/`.

Rewriting a literal is fine. **Rewriting an assertion to match new behaviour is not** — if a test fails on something other than a string, that is a real finding. Stop and report it.

---

## Verification

Per `CONTEXT.md`'s standing rule — verify against disk, never against a banner.

```bash
cd tools/resolver && npm test && npx tsc --noEmit
```

```bash
cd tools/lantern && npm test && npx tsc --noEmit
```

```bash
cd phaser && npm test && npx tsc --noEmit && npm run orphans
```

Then the things a type checker cannot see:

- `npm run orphans` — `forage-pool-unjoined` must stay clean, and the new `spell-components-unco-located` rule must report zero.
- **A real playtest.** `npm run playtest` with a scenario that begins at F1, forages, and confirms the offered items now read as `item_*` ids in the satchel strip. A UI change is not done until the screenshot looks right.
- **Re-verify day placements** after Task 5. Deep souls must still land where their scenes are authored. `npm run presence` covers presence.
- **Load a mode5 save from before this change.** It must refuse with `version-mismatch`, not restore a dead satchel.

---

## Not in scope

- **Receiver placement.** 55 authored receivers sit on no screen, so nothing in the world is castable. Roc held this ruling on 2026-08-23 — 55 is too many to handle this week. Learning is unblocked by `SpellTrialScene`, which calls `knowledge.learn()` at line 341, so a player can learn a spell from the notebook without ever touching a world receiver. The `receiver-unplaced` audit rule will keep reporting 55. That is correct and expected.
- **A rarity mechanic.** Dropped. `Forage.offer()` is untouched.
- **Renaming `satchelPoolNames`.** Post-capstone cleanup.
- **Deleting `foragePoolToItem.ts` / `GameEvents.poolName`.** Post-capstone, once provably dead.
- **Nell's role.** Undealt by design.
- **Linnet's role.** Ruled out 2026-08-23. Village Chief teaches nothing and she is dealt out of this slice.
- **The `item_flame` / `item_heated_stone` / `item_tempered_stone` chain.** Those are cast products, not forage. They stay as they are.

---

## Rulings that close the old guesses

Two joins in `foragePoolToItem.ts` were flagged in its own header as guesses by name similarity, never rulings. Roc ruled both on 2026-08-23, so reconciliation is not silently adopting a guess:

- **`"herbs"` is `item_berry`.** Ruled.
- **`"lantern-oil"` is `item_beeswax`.** Ruled.

After Task 1 the pool names disappear and the item ids are what `screen-specs.json` authors. Nothing is left to guess.

No open items. Every ruling this handoff depends on is recorded above.
