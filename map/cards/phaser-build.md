---
name: phaser-build
type: code-system
status: live
record: phaser/
---

## What it is
The ship target. Since the 2026-08-17 pivot the capstone ships from `phaser/` (Mode
4/5), not Unreal (`CONTEXT.md`, pivot block). It is a presentation layer over
`tools/lantern`'s `LanternPlayer` — imported through a Vite alias, never forked, so
the tested original cannot drift. What it adds is what exists nowhere else: casting,
hub decoration, point-and-click screens, inventory. Deploys to itch.io via
`npm run deploy:itch`.

## Doors
- `phaser/ARCHITECTURE.md` — how the code is laid out
- `phaser/README.md` — contract, seams, content rules (stale in three flagged places — see collisions.md)
- `phaser/GAPS.md` — every gap the probe walked into, with the pinning test

## Hits
UI changes must be verified with a real playtest (`phaser/tools/playtest.mjs`,
headless Chromium), not just tsc/vitest (`CONTEXT.md` §Rules). Ink owns the clock —
Phaser reads `movesLeft`/`TimeOfDay`/`day` and must never write them; `choose()` must
always pair with `continueOnce()` (`phaser/README.md` §The seams). After a resolver
reroll, run `npm run prep:content`. Changes to save, gates, inventory, cast or the
day loop trigger an adversary run (`phaser/tools/adversary/`, seat
`agents/qa-adversary.md`). A change under `src/render/vfx/` moves cue entries —
that data is its own noun (cue), and the playtest rule covers it too.

## Does not hit
`tools/lantern/` — Phaser imports its player; fixing game-loop logic there fixes it
for both hosts, fixing it "in Phaser" by copying would mint the drift the alias
exists to prevent. `phaser/dist/`, `.playtest/`, `.adversary/`, `.tmp-verifier-shots/`
are build/run debris, not source.
