---
found: 2026-08-22
evidence: src/render/vfx/PhaserVfxBackend.ts — burst's round sparks, eruption's steam
---

# A nested `{min, max}` under a particle's `scale.start` does not resolve — and fails silently

`scale: { start: { min: 0.6, max: 0.9 }, end: 0 }` looks like a reasonable way to ask Phaser for a random starting scale per particle, matching how `lifespan`, `speed`, and `angle` all accept `{min, max}`. It does not resolve in this Phaser build. A GameObject can't render at a non-numeric scale, so the result reads as "the particles are invisible" — no console warning, no exception, nothing pointing at `scale` as the cause.

**Fix:** `scale: { start: N, end: 0, random: true }` — a flat starting number, with `random: true` telling Phaser to randomize each particle's actual birth scale between `0` and that `start` value itself. This is the established substitute throughout this file, the same technique `emit()` uses for its own `scaleVariance` knob.
