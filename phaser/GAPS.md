# Gaps found while building the probe

A running register. Every entry was found by building or playing, not by
reading — that is the point of a probe, and it is why these were not caught by
review.

Each carries **evidence** (a file and a line you can check), **who owns it**,
and **pinned by** where a test stops it drifting silently. Nothing here is a
bug in the probe; these are gaps in the project the probe walked into.

Severity is about the capstone (Tue 2026-08-25), not tidiness:
**blocking** = a stated design goal cannot be met · **material** = costs real
work or reads wrong to a player · **note** = worth knowing, cheap to live with.

---

## G1 — `unlocks.screen` points at a screen that does not exist

**blocking · content · pinned by `tests/Gates.test.ts`**

`content/magic/ignite.json` has `"unlocks": { "screen": "Forest Unlock 1" }`.
No screen carries that id or that name. The forest screens are `F4` "The Still
Pool", `F5` "Old-Growth Hollow", `F7` "The Cave", `F8` "Heart of the Wood". It
is a `gdd/08-levels.md`-era label that was never minted.

It is the only `unlocks.screen` in the whole approved set, so *"magic unlocks
screens"* currently joins to nothing at all.

**Fix:** spell records gain `unlocks.gate_id` keyed to ids the graph already
uses (`G-F7-light`). Then `src/world/spellGates.ts` is deleted.

Third instance of **GP-106** (content vocabulary vs screen ids).

## G2 — nothing says which receivers are on which screen

**blocking · content/schema · not yet pinned**

You can ignite a dry hedge while standing in Town Square. `graph.json` gives
each screen `examinables` and `forage`, but nothing anywhere maps a *receiver*
(`dry_hedge`, `furnace`, `cold_lantern`, `bread`) to a screen. The 40-odd
receivers in `content/magic/*.json` exist in no place.

So the casting UI can only offer a global receiver list, which is what makes it
read as a menu rather than as acting on the world. **This is the single biggest
thing standing between the casting prototype and casting feeling grounded.**

**Fix:** either screens gain a `receivers` array, or receivers gain
`locations`, matching however GP-106 resolves the vocabulary.

Fourth instance of **GP-106**.

## G3 — screen locks are advertised but never enforced

**material · pipeline · pinned by `tests/Gates.test.ts`**

The emitted move is:

```ink
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Cave] #lock:locked(G-F5-cascade, G-F7-light)
```

The condition never mentions a gate — `#lock:` is advisory metadata that Lantern
renders as a badge. Every locked screen is walkable today.

This may be deliberate for now, but it means no gate in the game does anything,
and `gdd/04-magic-system.md`'s *"traversal is gated by what you know"* is
unimplemented rather than partly implemented.

**Fix:** the emitter extends gated conditions. See G4 for what it needs first.

## G4 — there is nowhere to mirror gate state into ink

**material · pipeline · not yet pinned**

Ink should own unlock state (it already owns lock status, traversal and the
clock). But mirroring in needs a variable, and `state.ink` is the single
generated declaration site — *"a LIST or VAR declared anywhere else is a
defect"* — with no gate variable. Ink LISTs cannot gain members at runtime, so
`KnownPhrases` cannot absorb it either.

**Fix:** the emitter declares `LIST GatesCleared = G_F4_still, G_F5_cascade,
...` and extends each gated move's condition with
`&& GatesCleared ? (G_F5_cascade, G_F7_light)`. The host then mirrors in after a
cast — the *mirror in, event out* pattern the Unreal plan already cites.

Until then the probe models gates host-side under `?locks=1`, as a
demonstration, explicitly not the shipping ownership.

## G5 — a gate is keyed to a spell that was rejected

**blocking · content · pinned by `tests/Gates.test.ts`**

`G-F4-still` is authored as *"Kadish phrase-lock: knowledge-key phrase 'still
the water'"*. `still` was **rejected** at Roc's 2026-08-05 gate. F4 "The Still
Pool" is therefore locked behind a spell that does not exist and cannot be
learned. The gate is unsatisfiable by construction.

**Fix:** re-key the gate, or reinstate the spell. A content ruling.

## G6 — enforcing locks today would strand 8 of 20 screens

**blocking · content · pinned by `tests/Gates.test.ts`**

From `npm run gates`: `T4 T5 T6 F4 F5 F6 F7 F8` become unreachable. One of seven
gates (`G-F7-light`) has any approved spell behind it, and `F7` also needs
`G-F5-cascade`, which nothing clears.

The others are not spell-shaped at all: `G-F5-cascade` is an insight chokepoint,
`G-F8-combine` is item-based ("two fragments, neither sufficient alone"),
`G-T5-trust` is a bond signpost, `G-T6-evening` is time-of-day.

**Fix:** decide per gate what clears it. This is scope, not engineering, and it
decides whether the forest is traversable at all.

## G7 — hotspot geometry exists for one screen out of sixteen

**material · content · pinned by `tests/inkSeam.test.ts`**

`regions.json` carries rects for `T1` only (`r_arch`, `r_board`). Every other
screen's regions are declared with `shape: null`.

Not blocking — the probe renders unshaped regions as labelled pills along the
bottom, so everything is playable. But a point-and-click game with one authored
screen's worth of hotspots is not yet point-and-click.

**Fix:** an hour of drawing rectangles in Lantern's existing region editor,
which writes this exact format. **Do not build a second editor.** The output is
also what the Unreal click layer needs.

## G8 — rejected spells sit beside approved ones with no filename marker

**note · pipeline · pinned by `tests/CastResolver.test.ts`**

`content/magic/` holds 26 records: 16 approved, 10 rejected (`bind`, `cool`,
`knead`, `mist`, `rest`, `ripen`, `sift`, `still`, `toll`, `warm`), identical in
shape, distinguishable only by the `status` field.

Any loader that globs the directory ships rejected content. This probe filters
in two places; the Unreal loader will need the same guard.

**Fix:** none needed if every consumer filters on `status`. Worth stating in the
schema doc so it is a rule rather than a habit.

## G9 — `T5` is filed as `homeinterior.jpg` but is an NPC's home

**note · content · resolved 2026-08-12**

`manifest.json` maps `T5` to `images/homeinterior.jpg`, and `graph.json` names
it "A Neighbor's Home". `HOME` is the player's Home Hub and points at a
different image.

Ruled by Roc 2026-08-12: **T5 is an NPC home**; `HOME` is the player's. Recorded
because the filename actively misleads — the decoration sandbox mounts on
`HOME`, not `T5`.

## G10 — key items do not share the item schema, and fail silently

**material · schema · pinned by `tests/Decor.test.ts`**

`content/key-items/*.json` keys on **`key_item_id`**, not `item_id`, and carries
no `collectible`, `always_available`, `used_by` or `produced_by` field.

Nothing announces this. A consumer that filters `items.collectible` — the
obvious way to ask "what can go on a shelf" — drops **all 11 key items**, which
is exactly what happened when the decoration palette was first built: it showed
13 raw components and none of the mementos, gifts or tools. The failure is
silent because both files parse fine and both are called "items" in prose.

This matters beyond the probe: mementos are *the* decoration category
(`gdd/05-collectibles.md`: "Mementos / keepsakes — Hub decoration and
achievement markers"), and all five live in `key-items/`.

**Fix:** either align the schemas, or state the divergence in the schema doc so
every consumer normalizes deliberately. The probe normalizes in
`src/ink/loadRun.ts:normalizeKeyItem`.

## G11 — there is no display name, only prose

**material · schema · pinned by `tests/Decor.test.ts`**

`description` carries two different kinds of string:

| | length | example |
|---|---|---|
| items | 3–17 chars | `sticks`, `a river stone` |
| key items | 18–66 chars | `a second work apron, folded and kept for hands that have not come` |

The key-item strings are lovely and clearly authored to be *read*. But they are
not labels, and any UI that puts one on a shelf, in a satchel slot, or on a chip
gets a caption wider than a third of the screen. The decoration palette shows
this plainly.

**Fix:** key items gain a short `display_name` beside the prose `description`,
which becomes the inspect text. This is a small schema addition with a real
payoff for every surface that lists items — satchel, notebook, hub, casting
tray.

## G12 — there is no empty room to decorate

**material · art · not pinned**

The Home Hub mounts on `manifest.json`'s `HOME`, which is a densely furnished
illustration — shelves dressed, surfaces covered, ornaments everywhere. So
placing your own keepsakes reads as putting labels on top of someone else's
room, and the one thing decoration has to convey — *this is mine, I arranged
it* — cannot land.

`homeinterior.jpg` (filed as `T5`) has the same problem.

**Fix:** the hub needs a deliberately sparse backdrop — bare shelves, empty
surfaces, a room waiting to be filled. This is an art requirement that follows
from the mechanic, and it is worth naming before art time is spent, because no
amount of UI work compensates for it.

## G13 — what you forage is not an item

**blocking · content/schema · pinned by `tests/Forage.test.ts` · CLOSED 2026-08-23**

Screen specs authorise foraging with coarse names — `T2` offers
`["herbs", "lantern-oil", "wool"]`. None of those is an `item_id`. The item
records key on `item_wool`, `item_berry`, `item_river_stone`.

So the thing you pick up is a bare string that joins to no record. It has no
category, no persistence class, no `used_by`. Verified in play: forage on Market
Row and the satchel holds `["herbs", "lantern-oil"]`, and the notebook's
collection tab lists them with no description because there is nothing to look
up.

The consequences are not cosmetic:

- A foraged thing **cannot be cast with**, because casting matches `item_id`.
  The whole forage → cast loop is severed at the join.
- Persistence class cannot be applied, so `pack-triaged` / `free` / `world`
  cannot be honoured for anything actually picked up.
- These names are also the `LIST Satchel` members in `state.ink`, so ink and the
  screen specs agree with each other and only the item records disagree.

**Fix:** a mapping from pool name to `item_id`. It is deliberately many-to-one —
`gdd`-side "herbs" is a category, `item_berry` is a thing — so it has to be
authored and reviewed, not inferred by name. The Unreal plan's §12 already flags
this as the "mapping caution" between `Ink.Origin.Satchel.*` (11 coarse members)
and `Game.Item.*` (15 specific records).

Fifth instance of **GP-106**, and the most load-bearing one.

**Closed 2026-08-23 (Roc, Task 1 of the forage-reconcile-and-spread handoff).**
Not the many-to-one mapping file this gap's own fix note proposed — Roc ruled
the other way: `screen-specs.json`'s `forage` arrays now author `item_id`
strings directly (`["item_wool", "item_feather"]`, not `["herbs", "lantern-
oil"]`), so the two vocabularies collapse into one instead of being joined.
`foragePoolToItem.ts` survives as an identity shim (`itemForPool(x) = x`) so
every call site built against the old join keeps working untouched; delete it
post-capstone once it is provably dead. `LIST Satchel` in `state.ink` now reads
item ids too, since `graph.ts`'s `inkAddress()` passes whatever `forage`
authors straight through. `SAVE_VERSION` bumped 1 -> 2 so a save captured
before this change is refused as `version-mismatch` rather than restoring a
satchel of now-dead pool-name strings.

## G14 — the hub has no surfaces

**material · content/art · not pinned · CLOSED 2026-08-22**

Decoration needs somewhere for things to go, and nothing in the project says
where. `graph.json` gives screens `examinables`, `forage` and `regions`, but no
anchors, shelves or surfaces. `regions.json` has geometry for `T1` only, and
none for `HOME` at all.

The probe hand-authored five surfaces in `src/world/Decor.ts` (`HOME_SURFACES`)
by eye against the art, purely so snap-slot placement could be compared with
free drag. They are a prop, not data.

**Fix:** if slot placement is chosen, surfaces belong in `regions.json` for
`HOME` — the same format, the same editor, and the same output the Unreal click
layer consumes. If free placement is chosen, this gap closes itself.

**Closed.** `lantern-projects/v01/decor-surfaces.json` (NEW file, own file —
see below) now carries real geometry for `sill`, `table` (new — the desk),
`chest`, `counter`, and `floor`, derived against `home-hub-diorama.png`.

Lantern's own region editor could not author them through its normal flow:
the run's compiled `story.json` has no `home` ink knot, so Play mode can never
enter HOME to reach the Stage pane's Place-markers UI, and separately,
sign-off #5 bars that UI from minting a region chip for anything `graph.json`
doesn't already declare (`tools/lantern/src/components/MarkerLayer.tsx`'s
header) — `HOME`'s `regions: []` there means zero chips either way. Written
by hand instead, coordinates read off a grid overlay on the backdrop, not
eyeballed.

**Not `regions.json`'s `HOME` key — a genuine collision, hit and reverted
while building this.** The first pass wrote the five surfaces into
`regions.json` under `screens.HOME`, matching T1's shape exactly as the
originating task described. That broke a real invariant:
`ScreenScene`/`CollectScene` union every `regions.json` per-screen id with
`graph.json`'s DECLARED `screen.regions` and render the union as clickable
examine hotspots, and `HOME` deliberately declares none (hand-authored
screen, not ScreenSpec-driven) — `tests/WorldView.test.ts`'s "still has only
ONE screen with authored geometry" pins `regions.json`'s shaped screens to
exactly `["T1"]`, and failed the moment `HOME` gained entries. A decoration
surface is not an examinable, and the two ideas turned out to share a file
and a name ("regions") without sharing a meaning. Fix: a sibling file,
`decor-surfaces.json`, same `{ screens: { [id]: RegionRect } }` shape for
tooling consistency, read only by `Decor.ts`'s `buildHomeSurfaces()` — never
by the hotspot union.

`src/world/Decor.ts`'s `buildHomeSurfaces()` reads the four (plus `table`)
from `run.decorSurfaces.HOME` at Hub launch (`loadRun.ts` fetches
`decor-surfaces.json` alongside `regions.json`, same shape, separate field);
`shelf` stays the one hardcoded entry, deliberately untouched — it becomes 16
cubbies in a later Home Hub stage. `tools/bundle-content.mjs` now copies
`decor-surfaces.json` too; ran `npm run prep:content` to sync
`public/story/`. `floor`'s "by the door" label no longer matches where the
rug actually sits in the real backdrop (near the desk, not the archway) —
left as-is; a copy fix, not a geometry one, flagged here for whoever touches
Home Hub labels next.

## G15 — the `v01` run folder predates its own fix

**blocking · pipeline (regeneration, not code) · pinned by `tests/Cast.test.ts` · `npm run presence`**

Reported as *"Ilsa and Mara's conversations don't open"*.

**Corrected 2026-08-13.** This entry first claimed the day resolver ignores
`role_workplace`. That was wrong, and the wrong conclusion came from measuring
generated output without checking when it was generated.

### What is actually true

The resolver implements the placement rule in two places:

- `soulWeight()` adds a `role_anchor` bonus when a soul's role works that screen
  in that time block.
- The **guarantee floor** holds each deep soul with a live thread on a screen
  where they have an authored scene (`prefer_scene_screens: true` in the shipped
  `data/tuning.json`), **rotating** across a life so a soul with several scene
  screens reaches all of them, with a special case so festival-night scenes land
  on `night` rather than `evening`.

It demonstrably works. In `v01`, Ilsa is at `T4` on days 2 and 4 and `T7` on day
5 — her own scene screens.

### Why the symptom is real anyway

| | |
|---|---|
| `tools/resolver/src/day.ts` placement logic last changed | **2026-08-11** |
| `lantern-projects/v01/day-*.json` generated | **2026-08-01** |

**The run folder is ten days older than the fix.** Every measurement in this
register that was taken against `v01` describes code that no longer exists.

`day.ts`'s own comment on the 2026-08-11 change describes the reported symptom
almost exactly — *"every Ilsa scene sits on T4, which is locked, so the narrow
pass found nothing and the draw fell through to an unlocked screen where she has
nothing to say"*. Someone had already found it and fixed it.

**Fix: regenerate `v01`. No resolver change is called for.**

### What the earlier numbers were worth

The 84%-silent figure was misleading, not just stale. The ordinary weighted draw
is *meant* to place souls broadly — that is ambient population, and a village
filled only to its 19 conversational slots would read as empty. The defect was
never "too many silent placements"; it was "the deep souls are not reliably on
their own screens", which is what the guarantee floor exists to prevent.

Still true and worth keeping: **five of eight souls have no scenes anywhere** —
`bex`, `juno`, `linnet`, `nell`, `pip`. Expected, since they are the
STRETCH-tier texture souls, but it means the placement rule cannot cover them
until they hold roles.

### Two things regeneration will not fix

- **`T4` carries a single afternoon NPC slot**, and Ilsa's whole eleven-scene arc
  sits there. Her arc is rate-limited to one scene per day, afternoons only,
  however well the scheduler behaves. That is a screen-spec question.
- **The texture souls still hold no `role_tag`**, so nothing can place them
  deliberately.

### Before regenerating

`tools/resolver`'s own test suite has a **pre-existing failure** unrelated to any
work here: `seedThreadsFromContent` returns 10 thread ids where the test expects
3 (`giver-receive`, `kinbound-absence`, `toby-the-shelf`). Regeneration runs
through that code, so it is worth resolving first — either the expectation is
stale or the seeding is over-broad.

Regeneration is a content operation: new seeds, changed placements, possibly
invalidating reviewed lines, eight days before content freeze. Roc's call.

## G17 — the GDD never says where a soul works

**material · GDD · not pinned**

`gdd/07-cast.md` has a role pool table with **Role** and **Goal** columns and no
workplace. `gdd/08-levels.md` describes every screen and never mentions a soul.
Grepping either file for the other's vocabulary returns nothing.

The soul→place binding exists only in generated data (`graph.json`'s
`role_workplace`, itself sourced from `role-workplace.json`). Because the GDD
never asserts the rule, nothing noticed that the day resolver ignores it (G15).

**Proposed fix — bind the ROLE, not the soul.** A soul→screen row would be
wrong: roles are re-dealt every life (`07-cast.md` — *"The personality never
changes; the job does"*), so "Ilsa is at the Workshop" is only true while Ilsa
holds Blacksmith. Next life she may be the Baker and belong on Market Row.

Concretely, `07-cast.md`'s role table gains a **Workplace** column:

| Role | Goal | Workplace |
|---|---|---|
| Mage *(the newcomer)* | collect magic from around the world | *roams — no fixed workplace* |
| Blacksmith | Forges the new Lantern Arch centerpiece | The Workshop (T4), afternoons |
| Baker | Prepares the communal feast | Market Row (T2), mornings |
| Postman | Delivers the festival letters | Square (T1) + Commons (T3), morning/afternoon |
| Herbalist | Brews the festival tonic | Market Row (T2) + Forager's Clearing (F1), morning/afternoon |
| Priest | Leads the rite | Square (T1) + Old Shrine (T8), evening/night |
| Farmer | Brings in the harvest | Market Row (T2), afternoons |

plus one sentence stating the rule: **a soul is placed at their role's
workplace, in that role's time blocks.** Every value above is already in
`role_workplace` with an authored `rationale`; this only moves the decision into
the document that owns it.

**WRITTEN 2026-08-13**, on Roc's instruction. `gdd/07-cast.md`'s role table
gained the Workplace column, the rule, this slice's ratified deal
(Mara → Herbalist, Toby → Baker, Ilsa → Blacksmith) and the `uncertain: true`
flags carried over from the source. `gdd/08-levels.md` gained the reciprocal
pointer, and still names no soul — deliberately, since the Workshop is where the
Blacksmith is, whoever holds it this life.

**Still open:** the resolver change. G15 is the code half of this and remains
unfixed — stating the rule does not make `slot_fill` honour it.

## G16 — nothing says where a soul stands on a screen

**material · content · not pinned**

`graph.json` gives screens `examinables`, `forage`, `regions` and `npc_slots`
(a *count* per time block), but no anchor for where a soul is positioned.

The probe spreads portraits along a baseline. That is a layout, not a placement
— nobody is standing behind the market stall or at the forge.

**Fix:** if it matters for the slice, soul anchors belong in `regions.json`
alongside hotspot geometry — same format, same editor. Cheap next to G15, and
pointless before it.

## G18 — three save slots exist in the schema, one is reachable — CLOSED

**closed 2026-08-24 by T13 Phase 4 · pinned by `tests/SaveLoad.test.ts`
("CollectScene takes its slot from scene data and guesses nothing") and
`playtest/t13-slot-board.mjs`**

Opened deliberately by Phase 3 earlier the same day, recorded rather than left
implicit because a descriptor field that nothing can reach is exactly the defect
Mode 4 shipped with once already.

WHAT IT WAS. `ModeDescriptor.save.slots` listed `["mode5-1", "mode5-2",
"mode5-3"]` and the save layer honoured all three, but nothing CHOSE:
`SaveLoadScene` rendered 1 real column + 2 hatched placeholders and read
`slots[0]`, and `CollectScene.startSave()` fell back to `slots[0]` when scene
data carried no choice. `SaveGame.playerName` had the same shape of gap — the
field was captured on every save but nothing asked for a name, so it was always
`""`.

WHAT CLOSED IT. Each column binds to its own entry of `slots`; an empty one is
interactive ("Begin a new life here") and picking it opens a name field on the
board itself; both routes out hand the chosen slot and typed name down the
`ChosenLife` chain. `CollectScene`'s `slots[0]` fallback is GONE rather than
kept as a safety net — with three lives on disk, guessing the first slot when a
caller forgot to say would autosave over life 1. A playtest creates three named
lives, resumes each, and reads the three cards.

STILL TRUE, AND NOT A GAP: `playerName` may be `""`. Confirming an empty field
begins an unnamed life on purpose (a documented schema state), and the card
drops the name and the dash rather than printing a stand-in.

**Not a gap, for the record:** the version-2 save under the retired single
`phaser-probe/save/v1/mode5` key. `SAVE_VERSION` bumped 2 → 3 with this change,
so that save is refused as `version-mismatch` and left exactly where it is —
same posture as the 1 → 2 bump that closed G13. Refusal, never migration.

## G19 — the first screen of a new year still reads as the Final Screen

**found 2026-08-24 by T13 Phase 5's own playtest ·
`playtest/t13-year-rollover.mjs`, screenshot
`39-YEAR-2-DAY-1-MORNING-after-Continue.png` · OPEN, and deliberately not fixed
in Phase 5**

WHAT IT IS. Pressing "Continue your exploration in the next year" diverts into
`begin_new_year`, which falls through `day_start` to `screen_hub`. Neither knot
prints a `#screen:` tag — `screen_hub` is a menu of "Begin at …" exits, not a
place — so `LanternPlayer.currentScreen` keeps reporting `FS` until the player
takes the first move of the new year. The clock is right and the exits are
right, but for exactly one click the header reads "Day 1 · Morning · Final
Screen" over the festival-night backdrop.

WHAT IS ALREADY HANDLED. The two Final Screen PANELS do not linger: they key on
`FS` **and** a parked story (`v.ended`), and the divert un-ends it, so the
results and the rollover band clear on the same frame the year turns. This gap
is the header and the backdrop only.

**Fix (needs Roc's word — it is a UI decision, not plumbing):** the natural
candidate is to have Continue open the day-start calendar the way the Home Hub's
"Start the Next Day" already does (`CollectScene.openDayStartCalendar`), so a
new year begins the way a new day does. Phase 5's brief says Continue diverts and
does nothing else, so it does exactly that; adding a second behaviour is a
design call rather than a bug fix.

---

---

## Related, already tracked elsewhere

- **GP-106** — content `source_locations` vs screen ids are different
  vocabularies. G1 and G2 are further instances; the 2026-08-11 Unreal plan
  flags it as live.
- **GP-111** — examinables cannot set knowledge flags. Found 2026-08-07, not by
  this probe, but it lands on the same seam: a click that should open gated
  content has nothing to write to.
