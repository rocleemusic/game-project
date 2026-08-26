# PAUSED

## Task: VFX asset pipeline + procedural vortex/firework exploration for spell casts

**Goal:** move spell VFX off the original hand-rolled particle-dot system and onto real art — either recolored stock sprite sheets or pure-procedural (no image asset) techniques — matching the game's Ghibli-warm, desaturated palette (`gdd/09-art-direction.md`).

### What's done (shipped, tested, live-verified — not part of the open work)

**New `sprite` cue kind**, added to the VFX system alongside the original none/filter/particles/tint/glow:
- [`VfxBackend.ts`](phaser/src/render/vfx/VfxBackend.ts) — `VfxKind` union, `isAnchoredKind`
- [`CueTable.ts`](phaser/src/render/vfx/CueTable.ts) — `KINDS`, new params (`frameRate`, `originY`), `cueWeight` shares the particles formula
- [`PhaserVfxBackend.ts`](phaser/src/render/vfx/PhaserVfxBackend.ts) — `spriteFx()`: plays a looping spritesheet anim at an anchor, `originY` (0..1) controls whether it centers or base-anchors on the anchor point
- Tests: `PhaserVfxBackend.test.ts` (22 tests, 6 sprite-specific), `VfxSystem.test.ts` (63 tests) — both green

**9 of 16 spells re-authored** in [`cues.json`](phaser/src/render/vfx/cues.json), each recolored via a Blender/numpy gradient-map pipeline (source asset's own luminance or alpha remapped onto `leatherDark → [theme accent] → ink/vfxGold`, never the source's native color):
| Spell | Asset source | Kind | Notes |
|---|---|---|---|
| ignite | itch.io "Bonfire" pack | sprite | `originY: 0.371` (re-measured base-anchor, was wrong twice before landing) |
| glimmer | "FireFlies" pack | sprite | needed alpha-preserving downscale (sparse dots die under a plain mean-downscale) |
| echo | "Dizzy/2" pack | sprite | |
| furrow | "Leaves Falling" pack | sprite | source is only 69%/38% alpha/luminance ceiling — renormalized both to fix a "too transparent" complaint |
| temper | "Smoke" pack | sprite | `originY: 0.692` |
| leap | "Torch" + "Sword Slash" composited into one texture | sprite | `originY: 0.6667` — **do not recompute this from measurement, it's tied to a specific torch/ring vertical offset baked into the texture; changing the offset means rebuilding the sheet, not just recomputing originY** |
| seal | "Shield Aura" pack | sprite | marked `-TEMP` in the filename — explicitly a placeholder, Roc's own call |
| waft | (no new asset) | particles | pure param tune: `gravityY`, `speedVariance`, `scaleVariance` turned an omnidirectional burst into a rising column |
| steep | (no new asset) | particles | was a full-screen filter flash for a localized action (brewing tonic) — converted to anchored particles |
| dry | "portal" pack | sprite | |
| preserve | "Heal" pack | sprite | same sparse-dot alpha issue as glimmer, worse — rebuilt at 256px with an alpha gamma-boost |

**Content-editor fixes** (`phaser/tools/content-editor/`):
- Preview pane moved from a floating corner box to a docked top pane; `.panel` is now the only scrolling region ([`main.ts`](phaser/tools/content-editor/src/main.ts), [`styles.css`](phaser/tools/content-editor/src/styles.css))
- `vite.config.ts`'s `publicDir` now points at the real `phaser/public/` — it used to serve its own empty one, which silently 404'd into the SPA fallback (a real bug two earlier tests tripped on)

Every `tint`→`sprite` or `glow/filter`→`sprite` kind change was checked against the no-effect-honesty parity test (`neutralFor`/`cueWeight` in `CueTable.ts`) — two neutrals flipped (`seal`, `preserve`: `muted`→`ink`) because `tint` and `sprite` use different weight formulas. If more spells move to `sprite`, expect the same check every time.

### What's open — the actual handoff

**1. Two working prototypes, not yet wired to any real spell:**
- [`phaser/tools/vfx-prototypes/firework-demo.html`](phaser/tools/vfx-prototypes/firework-demo.html) — proves Phaser's particle system can do color-over-lifetime bursts, rotated streak particles (custom `Particle` subclass), and lingering glitter clusters, all from generated textures. General capability demo, not tied to a spell.
- [`phaser/tools/vfx-prototypes/vortex-demo.html`](phaser/tools/vfx-prototypes/vortex-demo.html) — a swirling tornado built from pure `Graphics` + parametric helix curves (no sprites at all), proposed for **`breath`**. Both load Phaser via `../../node_modules/phaser/dist/phaser.js` (relative to their folder) — **run a static server from the `phaser/` package root, not from inside `vfx-prototypes/`**, e.g. `python -m http.server 8932` from `phaser/`, then open `http://localhost:8932/tools/vfx-prototypes/vortex-demo.html`. A server rooted inside `vfx-prototypes/` can't reach `node_modules/` two levels up.

**2. The vortex demo's current tuned state** (all inline constants at the top of the file, this is the up-to-date agreed-on look):
- 4 strands, staggered 320ms apart, each with its own 750ms arc (300 grow + 250 hold + 200 fade) — total cycle 1710ms, which is the proposed `durationMs` if/when this becomes a real cue
- Tail is a constant-length trailing window (not the full climbed height), with a real gap (`HEAD_GAP: 0.05`) between the tail and the leading particle
- Tail fades along its own length (soft at the back/bottom, solid near the particle) AND dims as a whole once the climb passes 70% (`SHRINK_FROM`), reaching fully invisible right at arrival — this replaced an earlier version that just hard-cut the tail's length, which Roc correctly called out as the wrong mechanism
- Colors are pulled back from literal white/neon-cyan to `0xeaf4f2` (near-white) / `0x6fb8c4` (desaturated teal) per the no-neon/no-pure-white rule, while keeping the white/cyan identity Roc explicitly wants for `breath`
- Taper is thick at the ground (anchored end), thin at the tip — flipped once already from the opposite

**3. Not yet started:**
- Wiring the vortex as a real cue kind (this is the same scope of work as `sprite` was — a new render path in `PhaserVfxBackend`, per-frame redraw + disposal, its own params) and pointing `breath` at it
- Building the color-over-lifetime / streak-particle techniques from the firework demo into the actual `particles` kind (needs a `color`/`colorEase` param addition, and either a second generated streak texture or a `textureKey` override on `emit()` — right now `emit()` always uses the one generated dot, ignoring `textureKey` even though `spriteFx()` already supports it) — proposed for **fetch, portion, weigh** as "magical tail" effects, not yet built at all

### First move when we resume

Open `vortex-demo.html` per the run instructions above, confirm the current tuned look still reads right, then decide: wire it as a real cue kind now, or keep iterating the look first. If wiring it, mirror the `sprite`-kind build exactly (new `VfxKind`, new `PhaserVfxBackend` render method, disposal, tests, then `cues.json` for `breath`) — that sequence is proven out three times over in this session's git history.
