---
found: 2026-08-23
evidence: src/render/vfx/PhaserVfxBackend.ts — spriteFx()
---

# `Texture.frameTotal` counts an implicit `__BASE` frame Phaser adds to every texture

Building an animation from every frame in a loaded spritesheet by using `frameTotal` as the frame count is off by one. Phaser adds one extra `__BASE` frame — the whole, unsliced texture — to every loaded texture, on top of the real numbered grid frames a spritesheet load produces.

**Fix:** when generating a frame range from `frameTotal` (e.g. via `anims.generateFrameNumbers(key, { start: 0, end: frameTotal - 1 })`), use `frameTotal - 2`, not `frameTotal - 1`, as the last real frame index. Using `- 1` silently includes the `__BASE` frame as a final animation frame — a garbage frame (the whole sheet, squashed into one cell) that plays for one tick at the end of every loop.
