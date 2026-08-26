# Mode 5 — merge mode 3 and mode 4, one extraction at a time

## Why this plan exists

Mode 4 is a regression. It was meant to be mode 3 plus UI improvements. It is
mode 1 plus a dialogue box.

Its descriptor claims eighteen systems. **Eleven are real.** `save`, `gates`,
`receiver-states`, `npc-talk`, `pan`, `calendar` and `edit-mode` are declared and
wired to nothing. `gates.enforce: true` is inert. The `save` block names a slot
and autosave triggers that no code reads.

That is the whole failure in one sentence: **a descriptor that describes a mode,
and a scene that ignores it.** Both files existed, the suite was green, and it
was reported as delivered.

Three of the four Wave 2 logic tracks have the same shape — built, tested,
constructed nowhere:

| System | Built | Mounted |
|---|---|---|
| `GateEngine` | yes | **no** |
| `ReceiverStateStore` | yes | **no** |
| `SaveCoordinator` / `SaveStore` | yes | **no** |
| `VfxSystem` | yes | yes |
| `DialogueSystem` | yes | yes (mode 4) |
| `world/audit` | yes | yes (script) |
| `EditModeSystem` | **no** | — |

Wave 1 is also half done. `SatchelLedger`, `PanModel`, `HotspotPlacement` and
`CastPipeline` landed. **Two of the seven render systems** landed. `CollectScene`
went 1021 → 1022 lines across the whole effort. It grew.

## What caused it, stated once

Tests measure whether code is correct. They do not measure whether anything
reaches it. Every miss — VFX, gates, receiver state, save, the VN layer on the
wrong scene — is that one gap. Parallel agents each owned a directory and were
told not to touch a scene, which is exactly what made them safe to run in
parallel and exactly what guaranteed nothing got wired.

**So this plan's acceptance bar is not "tests pass". It is "something constructs
it and you can see it in the running game."**

---

## Two rulings that shape the work

**SRP is a capstone grading requirement** (Roc, 2026-08-17). So the extraction is
not a cost paid to enable features. It is a deliverable in its own right, and
`CollectScene`'s line count is the evidence.

**The VN layer sits ALONGSIDE mode 3's spell-clue modal** (Roc, 2026-08-17), and
applies to NPC conversation only. The screen layout before you click an NPC stays
exactly as mode 3 draws it.

### The VN scope seam already exists

`PlayChoice.kind` is `"spoken" | "deed" | "move"`, and Lantern's own comment says
a `move` is *"a location or day-end choice off a screen hub… these spend the
block's move budget rather than advance a conversation, so the UI puts them in
their own row instead of the dialogue choice list."*

That is the rule, already authored:

- `kind === "move"` → the screen layout. Backdrop, hotspots, satchel, portraits.
- `kind === "spoken" | "deed"` → the VN layer.

Mode 4 ignored it and pushed every line through the box, which is why the
dialogue panel reads "Day 1 begins." and offers "[Begin at Town Square]" as a
conversation choice. `DialogueFeed` emits every transcript line; it must emit only
lines inside a conversation.

---

## The shape: mode 5 starts thin and grows by extraction

Mode 5's scene begins nearly empty. Each step extracts one responsibility out of
`CollectScene` into a system, then composes that system into mode 5.
**`CollectScene` keeps using the extracted system too**, so mode 3 stays working
and the de-duplication is real rather than a copy.

Both modes get thinner together. That is the plan's original intent — *"every
mode, including the three that already exist, becomes a thin composition over
those systems"* — done incrementally instead of in one pass that did not land.

`CollectScene` carries **eleven** responsibilities today:

```
1  backdrop + pan       syncBackdrop, updatePan
2  hotspots             drawHotspots, withExtraForage
3  satchel              drawSatchel, effectiveSatchel, syncInventory
4  npc                  drawCast, openNpcSpells, pickNpcSpells,
                        shareClueOnFirstTalk, roleFor
5  modal UI             modalFrame, clearModal, closeButton, button, componentHint
6  hedge cast           hedgePrompt, hedgeSpellPicker
7  sub-scenes           openHub, openNotebook, openCalendar
8  walker probe         exposeForWalker
9  vfx                  startVfx
10 traversal            moveTarget, the move-choice half of render
11 orchestration        init, create, render, update
```

7, 9 and 11 are legitimately scene-level. **1–6, 8 and 10 come out.**

---

## Steps

Every step has the same acceptance gate, and no step is done without all four:

1. `npx tsc --noEmit` clean
2. `npx vitest run` green, including a **wiring test** asserting something
   constructs the system
3. A **screenshot** of mode 5 showing the change
4. `CollectScene`'s line count **went down** (steps 2–7)

### Step 0 — mode 5 exists and plays a week

`MODE5` descriptor. Mode 5's scene composes mode 3's existing behaviour by
delegating to `CollectScene`'s systems as they are extracted; until then it runs
mode 3's pipeline unchanged. Add to the picker and `?mode=mode5`.

*Gate:* mode 5 plays a full week identically to mode 3. `npm run walk` clean.

**Delete `PlayScene` and `MODE4`.** Nothing in it is worth carrying but the VN
wiring, which step 2 reuses. Shipping a known-broken mode is a liability.

### Step 1 — mount save (the last DoD item)

`SaveCoordinator`, `SaveStore` and the slices are built and unmounted. Mount them
against mode 5's bus, with `MODE5.save.autosaveOn` actually driving autosave.

Watch the three risks the plan already names: ink owns the clock, so restore must
never `setVar` `movesLeft`/`TimeOfDay`/`day`. Pool names and item ids stay
separate fields and re-join on load. `Decor` already owns a localStorage key, so
`DecorSlice` must take it over.

*Gate:* play, bank an item, build bond, **reload the browser**, state survives.
This closes the Definition of Done.

### Step 2 — extract `NpcTalkSystem`, add VN alongside

Responsibility 4 out of `CollectScene`. `drawCast`, `openNpcSpells`,
`pickNpcSpells`, `shareClueOnFirstTalk`, `roleFor`.

The spell-clue modal stays exactly as it is. The VN layer is added beside it, and
`DialogueFeed` is scoped to conversation lines only per the `kind` seam above.

*Gate:* the screen before clicking an NPC looks like mode 3. Clicking one still
opens the spell modal. A conversation renders in the VN layout. Narration and
`move` choices never appear in the box.

### Step 3 — mount `GateEngine`

`MODE5.gates.source: "authored"`, `enforce: true`, and now something reads it.

The engine already refuses to load a rule naming an unauthored spell or receiver.
It will refuse `G-F4-still` and `G-F8-combine` — see Open Rulings.

*Gate:* a locked screen is genuinely unreachable until its gate clears. Casting
`ignite` opens F5. Modes 1–3 keep `legacy-hedge` and are unaffected.

### Step 4 — mount `ReceiverStateStore`

Unlocks the 18 already-authored stateful interactions.

*Gate:* `temper` on a cold billet returns no-effect; on a hot one it sets. Same
cast, different state, both rendered neutrally.

### Step 5 — extract `BackdropSystem` and `HotspotSystem`

Responsibilities 1 and 2. `PanModel` and `HotspotPlacement` already hold the pure
math; this is the Phaser half. Preserve the unshaped-label fallback verbatim —
19 of 20 screens have no hotspot geometry and lose their examinables without it.

### Step 6 — extract `SatchelStrip`, `WalkerProbe`, `ModalFrame`

Responsibilities 3, 5 and 8. `WalkerProbe` gets the frozen-keys test: `walk.mjs`
and `cast-sweep.mjs` call `__probe.forage/pickup/choose/advance/snapshot/openCast`
and `__cast.run/available` with no type-system protection today.

### Step 7 — extract `HedgeCastPrompt` and the traversal row

Responsibilities 6 and 10. After this `CollectScene` is orchestration plus
sub-scene launching, and the SRP claim is measurable rather than asserted.

### Step 8 — `EditModeSystem`, only if time remains

Never built. Hotspot drawing, lock toggle, story-beat insertion. Story-beat
insertion writes into the authoring layer and is the most likely thing to slip.

---

## Order and what slipping costs

Steps 0–1 close the Definition of Done. Steps 2–4 are the demo. Steps 5–7 are the
SRP deliverable. Step 8 is optional.

SRP is graded, so 5–7 are not droppable — but they are ordered last on purpose
among the non-optional work, because each one is invisible to a player and
visible to a marker. If the week runs short, step 8 goes first, then step 4.

**The honest risk:** steps 5–7 are the ones that already failed to land once.
They produce no visible feature, which is exactly why. The per-step line-count
gate exists to make that failure impossible to report as success.

---

## Verification

Per step, as above. Before the capstone:

```bash
cd ProjectOS/game-project/phaser
npx tsc --noEmit
npx vitest run
npm run walk        # headless week: 5 days, 4 blocks, real pixels
npm run sweep       # all 89 authored cast pairs
npm run gates
npm run presence
npm run orphans
```

**And a person plays it.** Every miss this session survived a green suite. The
first four were caught by Roc opening the game or by an agent told to refute.

### The wiring test, as a standing rule

For every system in a descriptor's `systems` array, a test asserts something
constructs it. The mirror assertion that caught the VFX gap is the template:

```ts
const unmounted = files
  .filter((f) => /new CastPipeline\s*\(/.test(read(f)))
  .filter((f) => !read(f).includes("new VfxSystem("));
expect(unmounted).toEqual([]);
```

Coverage questions have two directions. Asking one reads as covered.

---

## Open rulings, none blocking

1. **Both chain gates are unsatisfiable.** `G-F4-still` and `G-F8-combine` need
   `ignite × river_stone`, `temper × river_stone`, `fetch × stone_wall`,
   `temper × stone_wall`. **None is authored.** `river_stone` is authored on five
   spells, four rejected — only `waft` survives. `stone_wall` exists only on the
   rejected `warm`. `npm run orphans` reports this.
2. **`no_effect` vs `no effect`.** `readsAsNoEffect` is anchored AND expects a
   space; authors wrote an underscore. **18 pairs mis-resolve as effects**, so
   they teach their own spell and are gate-clearing-eligible when the author
   wrote "nothing happens." True count is 49 of 89, not 31.
3. **VFX no-effect is up to 1.80× brighter than its effect twin** on 9 of 16
   spells. Nobody said "don't render no-effect as a celebration." The test
   asserts a floor with no ceiling.
4. **Narration alignment.** This plan's predecessor says left-aligned; a critic
   measured the reference images and found centred. Look at the pictures.
5. **Reachability.** 22 of 34 authored scenes cannot be entered in a 15-move
   week. Not a search budget — raising every bound 10× changed nothing. Day
   economy against chain length. Content-scope call.

---

*Supersedes the Mode 4 sections of `2026-08-17-phaser-pivot-mode4-plan.md`.
Wave −1 and Wave 0 from that plan stand as delivered. Task state is in Paca.*
