---
name: cue
type: code-system
status: live
record: phaser/src/render/vfx/cues.json
---

## What it is
A spell's VFX entry: kind (none/filter/particles/tint/glow/sprite), asset,
frame rate, anchor. Data-tuned, not code-tuned — calibration happens by
editing `cues.json`; `CueTable.ts` defines the schema and weight formulas,
and `PhaserVfxBackend.ts` just plays what the table says.

## Doors
- `phaser/src/render/vfx/CueTable.ts` — schema, `cueWeight`, `neutralFor` parity
- `PAUSED.md` — per-cue calibration rulings from the 2026-08-22 VFX session
- `phaser/tools/vfx-prototypes/` — the unwired vortex/firework demos

## Hits
From `PAUSED.md`: `leap`'s `originY: 0.6667` is tied to a torch/ring offset
baked into its composited texture — do not recompute it from measurement;
changing the offset means rebuilding the sheet. `ignite`'s `0.371` is
measured, not baked — the opposite rule. Any kind change to `sprite` must
re-run the no-effect-honesty parity check (`neutralFor`/`cueWeight`) —
`seal` and `preserve` already flipped neutrals for this reason.

## Does not hit
`phaser/src/magic/` — the obvious word to reach for ("it's a spell"), but
that is casting mechanics: resolver, costs, outcomes. A cue change never
touches spell logic. Also not the vfx-prototypes: `vortex-demo.html` and
`firework-demo.html` are proven demos, wired to nothing (PAUSED.md §What's
open).
