---
found: 2026-08-23
evidence: src/render/vfx/PhaserVfxBackend.ts — facingAngleConfig()
---

# Phaser evaluates a particle's `rotate` config BEFORE its `angle` config, every spawn — exploit it to face particles without a subclass

An elongated "streak" particle (a bar texture, not a dot) exploding across a full 0-360° spread always rendered at one fixed orientation, because nothing was rotating each particle to face its own launch direction. The obvious fix — a custom `Particle` subclass that re-aims every frame — wasn't available in this codebase, since this file imports Phaser for types only and never runs it at module load (see `PhaserVfxBackend.ts`'s file header on why).

**Root cause / the exploit:** reading Phaser's own `Particle.fire()` source shows it evaluates a particle's `rotate` property before its `angle` (launch direction) property, on every spawn. A `WeakMap` keyed on the particle lets `rotate`'s callback roll the random launch angle first and stash it; `angle`'s callback then reads the same stashed value back out, forcing the two to agree instead of rolling independently. For a burst that doesn't curve or accelerate, the launch direction *is* the travel direction for the particle's whole life, so a one-time rotation set at spawn is exact — not an approximation.

**Fix:** `facingAngleConfig(angleMin, angleMax)` returns a `{angle, rotate}` pair implementing this trick — drop it into any `ParticleEmitterConfig` in place of a plain `angle: {min, max}` for a burst whose particles should visibly face their own direction of travel.
