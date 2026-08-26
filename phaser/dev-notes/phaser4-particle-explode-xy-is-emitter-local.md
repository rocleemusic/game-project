---
found: 2026-08-19
evidence: src/render/vfx/PhaserVfxBackend.ts — emit()
---

# Phaser 4 particle emitters: several APIs take LOCAL coordinates where a world point looks like the obvious argument

**`explode(quantity, x, y)`.** Passing the anchor's world position as `explode`'s x/y doubled it. A cast at (960, 540) spawned particles at (1920, 1080) — the far corner of the screen.

**Root cause:** the emitter is already created at the anchor (`scene.add.particles(anchor.x, anchor.y, ...)`), so its `worldMatrix` already applies that position to every particle. `explode`'s own `x`/`y` are an *additional* emitter-local offset, not a world point to move the burst to. The API shape (`explode(quantity, x, y)`) invites passing world coordinates; nothing about the signature warns you they're local.

**Fix:** omit x/y from `explode()` and let it fire from the emitter's own origin, which is already the anchor.

**Same family, found the same pass:**
- `moveToX`/`moveToY` on an emitter config are also local, not world-space — an emitter at `(px, py)` with `moveToX: px, moveToY: py` sends particles to world `(2px, 2py)`. Use `0, 0` to mean "back to the emitter's own origin."
- A live emitter's spawned-particle list is `.alive`, not `.particles` — the property you'd guess from the name doesn't exist.
