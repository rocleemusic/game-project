# Ruling — Year-loop saves replace MetaHub (T13)

**Ruled by Roc 2026-08-23.** Design record only — build is mostly post-capstone, per
[2026-08-23-roc-notes-triage-plan.md](2026-08-23-roc-notes-triage-plan.md) Group 5.
Needs `gdd-sync` into the GDD when built.

## The ruling

MetaHub and the New Life button are cut. In their place: the game loops in years.

1. **Rollover screen.** Festival night (day 5) ends with the results screen, then a
   discovery summary: "You found X of N spells, collected X of N items, and reached
   X of N endings. There is still more to discover!" Two buttons: **Continue your
   exploration in the next year** and **Return to main menu**. Rollover is explicit —
   resuming before the button press returns to this screen. "Endings" = festival
   tiers reached (Quiet / Warm / Grand), cumulative across years.

2. **Carry-over.** Ink state persists across the year boundary — everything the
   story itself tracks (spells, sounds, bonds, world-aliveness) carries forward.
   Only the time allotment resets (day back to 1, moves refilled) and the year
   counter goes up. **Amended 2026-08-25 (Roc):** host-side satchel/arms contents
   do not need to survive the rollover — they wipe the same as any ordinary
   day transition (`LanternPlayer.applyDay`'s existing "item slots respawn"
   rule), confirmed correct as shipped.

3. **Slots.** 3 save slots, one independent game each, per-mode as today.
   `ModeDescriptor.save.slot` (single string) becomes a slot set. An empty slot
   starts a new game — this is what replaces New Life. Empty slots stop being dead
   placeholders in `SaveLoadScene.ts` / `SaveSlotView.ts`.

4. **Player name.** Entered when starting an empty slot. Shown in the slot list
   ("Roc — Year 2, Day 3 · evening"). Usable in dialogue — the ink gets a name
   variable it can read. That last part is a dependency into T15 (NPC dialogue
   rework), not part of this build.

## How the year reset works (the load-bearing decision)

The clock (day, time block, moves) lives inside the opaque ink state, and the save
layer's standing rule forbids the host from writing ink variables
(`InkStatePort` has no clock writer; `tests/SaveLoad.test.ts` enforces no `setVar`
under `src/world/save/**`). "Keep ink, reset time" therefore cannot be a host-side
write.

**Ruled: the story resets its own clock.** The ink / resolver-emitted week graph
exposes a *begin-new-year* entry point that resets day, time and moves and
increments a `year` variable — all inside ink. The host only diverts to it when the
player presses Continue. The no-setVar rule stays intact.

Consequences:

- T13 is partly a **resolver/ink task** (`tools/resolver`, emitted week graph), not
  just a Phaser save task.
- Because `year` lives inside `ink.storyStateJson`, save → close → resume restores
  the correct year for free — the same way day and time already come back.
- The slot list shows the year via the frozen display read (`SaveClockDisplay` /
  `SaveSlotInfo` gain a `year` field, display-only, never restored — same rule as
  `day` and `timeBlock` today).

## Save-schema impact (when built)

- `SAVE_VERSION` bumps (slot-set + name + year display fields change meaning).
- `SaveGame` gains the player name; `SaveClockDisplay` / `SaveSlotInfo` gain `year`.
- Discovery-summary counters (spells found, items collected, tiers reached) ride in
  `slices`, per the schema's own rule — no new top-level fields for them.

## Build-order notes

- The **New Life button removal** ships pre-freeze with the T7 Hub decorating epic
  (safe independently of the rest of this ruling).
- Everything else here is post-capstone unless capacity opens up.
- Run `gdd-sync` when this builds — the year loop is a core-loop change.
