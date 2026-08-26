---
name: playtest-harness
type: code-system
status: live
record: phaser/tools/playtest.mjs
---

## What it is
The headless verification layer for the Phaser build: real Chromium via
Playwright, scripted play, screenshots. Scenarios live in
`phaser/playtest/*.mjs`; wrappers are `npm run walk` (full week, samples
real canvas pixels), `sweep` (all 89 cast pairs through the real UI),
`gates`, `presence`, and `adversary` (`phaser/tools/adversary/` — the only
tool that sends deliberately invalid input, 250 steps).

## Doors
- `phaser/README.md` §The walker — why pixel sampling exists (the compounding-scrim leak)
- `phaser/tools/adversary/README.md` — the adversarial run contract
- `agents/qa-adversary.md` — the seat that runs it

## Hits
CONTEXT.md rules UI work is not done until a real playtest screenshot is
looked at — tsc/vitest "prove the code runs, not that it looks right."
Adversary runs are mandated at build-phase boundaries and after changes to
save, gates, inventory, cast or the day loop — never during a narrative
content run. Trap from README: `?walk=1` enables `preserveDrawingBuffer`;
without it every pixel reads black and every check false-alarms.

## Does not hit
The screenshot debris: `phaser/.playtest/`, `phaser/.adversary/`,
and `phaser/.tmp-verifier-shots/` are run outputs — evidence of past runs, wired to nothing, safe to ignore. A clean
walk is also not a coverage guarantee: README notes F5-F8/T9 go unvisited
because of the walker's heuristic, not because locks work.
