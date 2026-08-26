---
found: 2026-08-23
evidence: tools/playtest.mjs:319-323
---

# `playtest.mjs` click coordinates are CSS pixels, not game coordinates

A scenario's `{ action: "click", x, y }` step does `page.mouse.click(box.x + x, box.y + y)`, where `box` is the canvas's CSS bounding box. At the harness's default 1280x720 viewport, that box is smaller than the game's 1920x1080 design resolution — roughly 2/3 scale under `Scale.FIT`.

**Root cause:** it is easy to read a button's position off the game's own 1920x1080 layout code (e.g. `ModePickerScene`'s `this.button(W / 2, 900, ...)`) and click that literal value. That value is in game space. The harness wants CSS space. A game-space click on a button below CSS y≈720 silently misses — no error, the click just lands past the canvas or on the wrong element.

**Fix:** read the target's position off an actual `canvas.screenshot()` from the harness (1280x720 by default), not off game-layout source code. `playtest/mode5-vfx.mjs` has worked examples of both a converted game-space button (mode picker) and a screenshot-read one (LocationSelectScene's map thumbnail).
