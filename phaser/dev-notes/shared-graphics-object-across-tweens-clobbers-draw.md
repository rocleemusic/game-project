---
found: 2026-08-23
evidence: src/render/vfx/PhaserVfxBackend.ts — eruption's splash rings
---

# Two tweens sharing one Graphics object leave only the last-updated one ever visible

A composite effect with two staggered rings, each redrawn per-frame via its own tween `onUpdate` callback (the standard technique this file uses throughout: `clear()` then redraw at the tween's current progress). Sharing a single `Graphics` object between the two rings — instead of one object per ring — leaves only one ring ever visible on screen, even though both tweens are running.

**Root cause:** Phaser runs all active tweens' `onUpdate` callbacks within the same tick. Each ring's `onUpdate` starts with `Graphics.clear()`. Whichever tween's `onUpdate` happens to run second wipes out whatever the first tween just drew that frame, every single frame — so only the last-updated ring's draw call ever survives to be rendered.

**Fix:** one `Graphics` object per independently-tweened visual layer, never shared. This file's established pattern (`burst`'s rings, `eruption`'s splash rings) follows this deliberately; it isn't obvious from the API that sharing would fail this way, since a single untweened `Graphics.clear()`-then-redraw works fine.
