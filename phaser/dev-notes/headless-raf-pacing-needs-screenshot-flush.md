---
found: 2026-08-23
evidence: playtest/mode5-vfx.mjs
---

# Headless scene transitions flake on `wait` alone — a screenshot in between fixes it

Driving `playtest.mjs` through several scene transitions (ModePickerScene → LocationSelectScene → CollectScene) using only `{ action: "wait", ms }` between clicks flaked roughly half the time, even at 1500ms waits — a click that should land on a rendered, interactive card sometimes just did nothing, and the scenario stayed on the prior scene. Inserting a `canvas.screenshot()` step between each transition made the same sequence reliable across repeated runs.

**Status: empirical, not root-caused.** This has not been traced to a specific Phaser/Chromium mechanism. The working theory, consistent with `2026-08-23-vfx-kinds-handoff.md`'s §3 finding that this environment's headless rAF clock runs decoupled from wall-clock time: a `canvas.screenshot()` forces Playwright to actually composite a frame, which may be pacing something `waitForTimeout` alone does not. Treat the fix as reliable, not the explanation.

**Rule of thumb:** in any multi-scene-transition scenario, put a `screenshot` step after each transition wait, before the next click — not just for the debugging artifact, but because it appears to be load-bearing for reliability. Do not strip them out as "just diagnostic" cleanup.

**Distinct from** `headless-cue-screenshots-need-scene-time-polling.md` — that note is about hitting an exact moment inside a running VFX cue for a screenshot (needs `scene.time.now` polling); this one is about scene-transition click reliability (needs a screenshot, no polling). Different problem, same root cause.
