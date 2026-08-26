---
found: 2026-08-23
evidence: src/boot/PreloadScene.ts:66, src/render/vfx/PhaserVfxBackend.ts:2144
---

# Sprite-kind VFX rendered nothing, in every real game mode

Seven spell cues (`dry`, `furrow`, `glimmer`, `ignite`, `leap`, `preserve`, `seal`) use `kind: "sprite"` in `cues.json`. Particle-kind cues played fine and showed up in mode5. Sprite-kind cues played nothing, anywhere.

**Root cause:** `spriteFx()` needs its `textureKey` already loaded on the scene (`this.scene.textures.exists(textureKey)`). If it's missing, `spriteFx()` returns `null` — by design, a content-wiring gap is not a throw. Nothing in the real game's boot path (`PreloadScene.ts`) ever loaded those nine PNGs from `public/art/vfx/`. Only the content-editor's preview scene (`tools/content-editor/src/preview.ts`) loaded them, which is why the sprites worked there and nowhere else. The art was on disk the whole time — nothing ever told the game to load it.

**Why it went unnoticed:** `VfxSystem.played` (the usual "did VFX fire" check) counts a cue as played whenever `backend.play()` returns an active handle — true even when `spriteFx` silently returned `null`. A test or a playtest scenario that only checks `played` will pass while the sprite never rendered. Checking for the actual live `Sprite` GameObject in the scene's `children.list` is the only test that catches this.

**Fix:** `PreloadScene.ts` now loads the same nine spritesheets `preview.ts` already used successfully, in the one preload path shared by every game mode.
