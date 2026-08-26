---
found: 2026-08-22
evidence: src/render/vfx/PhaserVfxBackend.ts — TINT_MODE_FILL
---

# Phaser 4 dropped `setTintFill()`, and every tint defaults to MULTIPLY, not FILL

Two related v3→v4 changes that both surface as the same symptom: a tinted GameObject looks desaturated or muddy instead of the flat color you set.

**`setTintFill()` is gone.** Phaser 3 code that called it needs `.setTint(color)` plus `.setTintMode(Phaser.TintModes.FILL)` (or the numeric value `1`, if the file can't import the runtime enum — see below) instead.

**MULTIPLY is the default tint mode**, and it is a real multiply against the texture's own fill color, not against white. A texture drawn in a warm cream base (`ink`, this project's theme rule — never a white/`0xffffff` literal) tinted with a cool color under MULTIPLY desaturates hard, because multiplying two non-white colors is not the identity operation multiplying against white would be. Prototypes that tint a literal white base never hit this — white multiplies as identity, so the bug is invisible until the same code ports onto a non-white texture.

**Fix:** `setTintMode(Phaser.TintModes.FILL)` replaces the texture's color outright (respecting only its alpha) instead of multiplying it. A file that imports Phaser for types only (no runtime import) can't reach the `Phaser.TintModes` enum — its `FILL` value (`1`) is stable across the Phaser 4 line and safe to hardcode with a comment explaining why.
