---
found: 2026-08-19
evidence: 2026-08-19-ui-migration-handoff.md
---

# Phaser 4's WebGL renderer silently no-ops `GameObject.setMask()`

Classic geometry masking (`setMask()` with a `Graphics`-based mask shape) doesn't clip anything under Phaser 4's WebGL renderer. It warns in the console, but the masked object still renders unclipped — a pattern meant to be cropped to a shape bleeds past it, full-size, with only a console warning as the tell (easy to miss among normal dev-server noise).

**Fix:** bake the clip shape into a real texture with `Graphics.generateTexture()`, then use a `TileSprite` (or a plain `Sprite` on that texture) instead of masking a live GameObject. There is no drop-in masking replacement — the fix is to stop needing a runtime mask.

This is exactly the kind of thing the project's own `graphics-and-shapes` / `sprites-and-images` Phaser skills exist to catch before it ships — see root `CONTEXT.md`'s rule on loading engine skills before hand-rolling something Phaser already has a documented way to do.
