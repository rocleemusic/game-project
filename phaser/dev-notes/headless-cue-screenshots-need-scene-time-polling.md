---
found: 2026-08-23
evidence: 2026-08-23-vfx-kinds-handoff.md §3
---

# A wall-clock `waitForTimeout` before a screenshot lands on an effectively random moment of a VFX cue

This headless environment runs Phaser's own clock (`scene.time.now`) faster than real wall-clock time, with a further ~400-500ms lag before the very first frame actually renders. A fixed `waitForTimeout(150)` meant to catch "150ms into the cue" can land anywhere — for a short effect, often already expired.

**Fix:** poll `scene.time.now` from inside the page via `requestAnimationFrame` (no CDP round-trip per check), call `game.pause()` the instant it crosses the target scene-time, then screenshot. This gives an exact, reproducible scene-time frame regardless of how fast or slow the real clock ran to get there.

For a surface that doesn't already expose a game handle (the content-editor's `preview.ts`, at the time this was found): add one line exposing `window.__debugGame = game` in the mount function, use it, then delete it and confirm with `git diff --stat` that the file is clean again. Never leave a debug handle shipped.

**Distinct from** `headless-raf-pacing-needs-screenshot-flush.md` — that note is about *scene-transition click reliability* (a screenshot between transitions, no polling); this one is about *hitting an exact moment inside a running cue's timeline* for a screenshot. Different problem, same root cause (headless rAF pacing is unreliable to reason about with wall-clock waits alone).
