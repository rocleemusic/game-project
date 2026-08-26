# phaser — dev-notes

`dev-notes/` is the record of engine and tooling gotchas found by building or testing this Phaser 4 codebase — traps that cost real time and will bite the next person too, unless caught here first.

**Not the same as `GAPS.md` or `FINDINGS.md`.** `GAPS.md` is content/design gaps in the game itself. `FINDINGS.md` is recommendations for the Unreal port. `dev-notes/` is neither — it's "this API/tool/environment did something non-obvious, here's why."

## When to add a note

You lost real time to something that wasn't obvious from reading the code or the docs — a silent failure, an API that behaves differently than its signature suggests, an environment quirk. If the next person hitting this would want to search for it, it belongs here.

Do not add a note for an ordinary bug with an ordinary cause. This folder is for traps, not a changelog.

## Format

One file per gotcha, kebab-case, named for the trap itself (`sprite-vfx-texture-never-loaded.md`), not for the fix or the date.

```markdown
---
found: YYYY-MM-DD
evidence: path/to/file.ts:123
---

# What broke, as a headline

What happened, plain language, 2-4 sentences.

**Root cause:** the non-obvious part — why it wasn't caught earlier, why the failure was silent or misleading.

**Fix:** what changed, or the rule of thumb going forward.
```

## Code comments point here — they don't repeat here

A comment in the source that explains a past gotcha should be short and link to its `dev-notes/` file, not carry the full explanation inline. The full explanation lives in exactly one place. A comment that duplicates it drifts the moment one copy gets updated and the other doesn't.

```ts
// Phaser 4 tints MULTIPLY by default, not FILL — see dev-notes/phaser4-tint-fill-removed-and-multiply-default.md
sprite.setTintMode(TINT_MODE_FILL);
```

not

```ts
// Phaser 4 tints MULTIPLY by default. Since every generated texture in this
// file is filled in the theme's `ink`... [eight more lines]
```

If you find a long explanatory comment like the second example while working nearby, that's a sign it belongs in `dev-notes/` instead — pull it out, leave a pointer.

## Index

**Phaser API gotchas** — the engine did something surprising.

| Note | What it's about |
|---|---|
| [phaser4-particle-explode-xy-is-emitter-local.md](dev-notes/phaser4-particle-explode-xy-is-emitter-local.md) | `explode`/`moveToX`/`moveToY` take emitter-local coordinates, not world points |
| [phaser4-particle-rotate-evaluates-before-angle.md](dev-notes/phaser4-particle-rotate-evaluates-before-angle.md) | Exploit `rotate`-before-`angle` spawn order to face particles without a subclass |
| [phaser4-tint-fill-removed-and-multiply-default.md](dev-notes/phaser4-tint-fill-removed-and-multiply-default.md) | `setTintFill()` is gone; every tint defaults to MULTIPLY, not FILL |
| [phaser4-nested-minmax-under-scale-start-silently-fails.md](dev-notes/phaser4-nested-minmax-under-scale-start-silently-fails.md) | `scale.start: {min,max}` silently doesn't resolve — use `random: true` |
| [phaser4-frametotal-includes-implicit-base-frame.md](dev-notes/phaser4-frametotal-includes-implicit-base-frame.md) | `Texture.frameTotal` counts an implicit `__BASE` frame — off-by-one trap |
| [phaser4-setmask-noop-in-webgl.md](dev-notes/phaser4-setmask-noop-in-webgl.md) | `setMask()` silently doesn't clip under WebGL — bake a texture instead |
| [phaser-container-children-ignore-setdepth.md](dev-notes/phaser-container-children-ignore-setdepth.md) | Container children draw in add-order; `.setDepth()` on a child is ignored |
| [shared-graphics-object-across-tweens-clobbers-draw.md](dev-notes/shared-graphics-object-across-tweens-clobbers-draw.md) | Two tweens sharing one `Graphics` object leave only the last-updated one visible |

**Tooling & environment** — this project's build/test setup, not Phaser itself.

| Note | What it's about |
|---|---|
| [sprite-vfx-texture-never-loaded.md](dev-notes/sprite-vfx-texture-never-loaded.md) | Sprite-kind VFX cues loaded nowhere but the content-editor preview — silent everywhere else |
| [playtest-click-coords-are-css-pixels.md](dev-notes/playtest-click-coords-are-css-pixels.md) | `playtest.mjs` click steps are CSS-pixel canvas coordinates, not 1920x1080 game coordinates |
| [headless-raf-pacing-needs-screenshot-flush.md](dev-notes/headless-raf-pacing-needs-screenshot-flush.md) | Headless scene-transition clicks flake without a `screenshot` step between them |
| [headless-cue-screenshots-need-scene-time-polling.md](dev-notes/headless-cue-screenshots-need-scene-time-polling.md) | A wall-clock wait before a cue screenshot lands on a random moment — poll `scene.time.now` instead |
| [claude-in-chrome-cannot-reach-localhost.md](dev-notes/claude-in-chrome-cannot-reach-localhost.md) | The Claude-in-Chrome extension can't load `localhost`/`file://` — use `playtest.mjs` or the Browser pane |
| [playwright-shared-context-leaks-save-state.md](dev-notes/playwright-shared-context-leaks-save-state.md) | One browser context across screenshots leaks autosave state between them |
| [vite-custom-route-content-type-whitelist.md](dev-notes/vite-custom-route-content-type-whitelist.md) | A hand-written extension→MIME-type switch silently misclassifies any extension you forget to add |
