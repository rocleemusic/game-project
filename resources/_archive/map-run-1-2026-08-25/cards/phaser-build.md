---
name: phaser-build
type: code-system
status: live
record: phaser/src/
---

## What it is
The ship target. Since the 2026-08-17 pivot (CONTEXT.md banner) the
capstone ships from this Phaser 4 build (Mode 4/5), not Unreal. It is a
presentation layer over LanternPlayer — imported through a Vite alias, never
forked — plus what exists nowhere else: casting (`src/magic/`,
`src/scenes/`), hub decoration (`src/world/`), inventory, and the render/UI
layer (`src/render/`, `src/ui/`).

## Doors
- `phaser/ARCHITECTURE.md` — how the pieces fit
- `phaser/README.md` §The seams — ink owns the clock; choose() only selects
- `phaser/dev-notes/` — engine gotchas that cost real time (`phaser/CONTEXT.md`)

## Hits
Changes to save, gates, inventory, cast, or the day loop trigger the
adversary run per CONTEXT.md's key-files table. Seam rules from
`phaser/README.md`: Phaser reads `movesLeft`/`TimeOfDay`/`day` and must
never write them; casting stays host-side because ink mentions no spell.
Verify UI work with `phaser/tools/playtest.mjs`, not just tsc (CONTEXT.md
rules).

## Does not hit
`phaser/README.md`'s own framing. Its header still says "a design probe,
not a build track" — the file flags itself as stale in three places
(2026-08-24 note) and defers to `CONTEXT.md` on ship-target status and
dates (capstone 2026-09-01, freeze 2026-08-28). `HANDOFF.md` is likewise
dated 2026-08-13 with the old dates. CONTEXT.md wins.
