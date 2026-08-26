---
name: cue
type: code-system
status: live
record: phaser/src/render/vfx/cues.json
---

## What it is
A spell VFX entry: kind (none/filter/particles/tint/glow/sprite), spritesheet, frame
rate, anchor. Entries live in data (`cues.json`), not code, because VFX are tuned by
editing numbers — `PhaserVfxBackend.ts` plays what the data says, `CueTable.ts` holds
the types, params, and the shared `cueWeight`/`neutralFor` formulas.

## Doors
- `phaser/src/render/vfx/cues.json` — the entries
- `PAUSED.md` (territory root) — per-cue calibration rulings from the sprite migration
- `phaser/tools/vfx-prototypes/vortex-demo.html` — the unwired `breath` prototype

## Hits
Changing a cue's kind hits the no-effect-honesty parity check: `tint` and `sprite`
use different weight formulas, so neutrals can flip (`seal` and `preserve` did —
PAUSED.md, "expect the same check every time"). Trap from PAUSED.md: `leap`'s
`originY: 0.6667` is tied to a torch/ring offset baked into its composited texture —
do not recompute it from measurement; changing the offset means rebuilding the sheet.
`ignite`'s `originY: 0.371` is the opposite physics: measured, re-measure it.
`cues.json` lives inside `phaser/src`, so a cue change is a phaser-build change and
rides its verify rule — a real playtest, not just tsc/vitest (`CONTEXT.md` §Rules).
A new approved spell needs no cue entry to ship: an unmatched cast resolves to the
neutral fallback `cue.fallback.neutral`, kind `none` (`CueTable.ts`, NEUTRAL_FALLBACK
~line 238) — add an entry only when the spell should look like something.

## Does not hit
`phaser/src/magic/` — the obvious word ("it's a spell"), but that is casting
mechanics: costs, resolution, receivers. A cue change never touches spell logic.
And not `content/magic/*.json` — the spell record decides outcomes, the cue only
decides what the outcome looks like.
