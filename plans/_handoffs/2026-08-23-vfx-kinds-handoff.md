# Handoff — three VFX kinds shipped (plume, beacon, eruption); five real bugs found and fixed, not guessed

**2026-08-23 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

Follows [`2026-08-22-vfx-wiring-handoff.md`](2026-08-22-vfx-wiring-handoff.md), which wired six spells and left waft, steep, and temper as prototypes still to port. This session ported all three into the real render backend, then spent most of its length on rounds of live review in the content editor — Roc catching a real problem, the session finding the actual cause (not a guess), fixing it, re-verifying. Everything below is shipped and tested.

## 1. What's live now

Three new `VfxKind`s in [`PhaserVfxBackend.ts`](../../phaser/src/render/vfx/PhaserVfxBackend.ts), wired into [`cues.json`](../../phaser/src/render/vfx/cues.json) in place of the generic `particles`/`sprite` placeholders waft/steep/temper shipped with:

| Spell | Kind | Shape |
|---|---|---|
| `waft` | `plume` | A cone of puffs spawned from one shared point, fanning out only as each puff individually rises — not three parallel columns. Two staggered golden ground rings (`echo`'s flattened-ellipse technique, reused not reinvented). |
| `steep` | `beacon` | A ground ring + rising glow pillar (one `GraphicsFx` draw function) + star motes launched on real closed-form projectile arcs (angle + speed + gravity) — a fountain, not a drift. Shape borrowed from the Godot loot-pickup VFX pack Roc pointed at (Desktop/assets/GodotLootVFX), not from any sibling kind here. |
| `temper` | `eruption` | Flash held alone for 100ms (`ERUPTION_HOLD_MS`), then a splash ring + green/blue firework streaks + hiss sparks join together, with steam trailing a further beat behind. Everything fires once and dissipates; nothing loops. |

Two new theme tokens, same "the theme grows to fit the VFX, not the other way round" rule `vfxWisp` set last session: `vfxGoldPale` (`#fff0c9`, plume's rings) and `vfxEmberPale` (`#ffd9b3`, beacon's glow core). 19 new disposal-safe tests, same six-shape pattern (`burst`) established for composite kinds. Full suite: 706 passing, `tsc` clean.

## 2. Five real bugs this session found, not five rounds of guessing

- **Scale, unscaled.** `plume` and `eruption`'s spatial numbers were ported straight from the full-canvas prototypes without the ~0.25x (`vortex`/`trail`/`suspend`) or ~0.6x (`burst`) scale-down every sibling kind already needed when it was ported. Concrete tell: `eruption`'s ring was literally radius 46 — wider than `burst`'s own already-shipped ring (26) for the same kind of splash. Rescaled against those siblings' own established ratios, not fresh guesses.
- **Colour, MULTIPLY vs FILL.** Phaser 4 defaults every tint to `MULTIPLY`, and every generated texture in this file is filled in the theme's `ink` (a warm cream), never white, per the file's own "no hex literal" rule. Multiplying a cool colour — `dusk`, `vfxWisp`, `success` — against a warm base desaturates it hard; the prototypes never hit this because they tinted a literal white base, where multiply is a no-op. Fixed with `Phaser.TintModes.FILL` (the numeric value `1` — this file imports Phaser for types only, so the runtime enum isn't available) on every texture-tinted, non-neutral layer. `beacon`'s primary visual (ring/pillar/core) never had this bug — it's drawn with exact `Graphics.fillStyle`, not a tinted texture; only its minor star-mote layer was affected.
- **"Erratic directions," the real fix, not a workaround.** The elongated streak bar always rendered at a fixed orientation regardless of its actual 0-360° launch angle — the prototype's fix (a custom `StreakParticle` that re-aims every frame) needs a runtime Phaser subclass this file can't have (imports Phaser for TYPES ONLY, so its disposal tests run without a real browser). The real fix, found by reading Phaser's own `Particle.fire()` source: it evaluates a particle's `rotate` property BEFORE its `angle` (launch direction) on every spawn. `facingAngleConfig()` (in `PhaserVfxBackend.ts`, right before the `eruption` section) exploits that ordering — `rotate`'s callback rolls the random launch angle first and stashes it per-particle in a `WeakMap`, `angle`'s callback reads the same value back out. No subclass, exact rotation, for any burst that doesn't curve or accelerate.
- **`burst`'s own streak layer had the identical bug**, just less visible with 5 narrow-angled particles instead of `eruption`'s 14 full-circle ones. Roc's call: remove it from `burst` rather than retrofit the fix onto an already-approved, shipped spell (`scratch`) outside this session's scope. `burst` is flash + ring + round warm sparks now, nothing else.
- **Steam mistaken for a missing flash.** `eruption`'s steam puffs (present in the prototype too, just easy to miss there) and its flash are both NEUTRAL/ink-toned, so a wall-clock screenshot easily catches the wrong one. Resolved with the verification technique below, not by re-guessing which layer was which.

## 3. The verification pattern this session actually needed, worth keeping

`waitForTimeout`-based screenshots are unreliable here for a reason now understood, not just observed: this headless environment runs Phaser's own clock much faster than wall-clock time, with a further ~400-500ms lag before the very first real rendered frame. A fixed wall-clock delay lands on an effectively random — and for short effects, often already-expired — moment.

The fix: poll `scene.time.now` from inside the page via `requestAnimationFrame` (no CDP round-trip per check) and call `game.pause()` the instant it crosses the target, THEN screenshot. That gives an exact, reproducible scene-time frame regardless of how fast or slow the real clock ran to get there.

The standalone prototypes (`phaser/tools/vfx-prototypes/*.html`) already expose `window.__game`, so this works directly. The content editor's `preview.ts` does not — for that surface, the pattern was: add one line exposing `window.__debugGame = game` in `mountPreview()`, verify, then delete it and confirm with `git diff --stat` that the file is clean again. Used repeatedly this session; never left in.

## 4. Not done / open

- The 2x-duration / 0.5x-speed "make it last longer" pass (§5 below) was done for `temper` only, at Roc's explicit call ("just temper"). `waft` and `beacon` are still at their single-pass timing.
- The art-direction fold question from the prior handoff (§6.A/6.B there) is still open — Roc held it explicitly ("hold off, revisit after vfx work") until this session's work landed. Read that handoff's §6 before starting; don't build a seat contract speculatively.
- `eruption`'s no-effect row is a plain `particles` splash, authored quickly, not iterated the way the effect row was — same relaxed-parity shape `echo`/`scratch`/`portion`'s no-effect rows already use, but worth a look once seen in-game.
- Nothing in this batch has been verified in a live cast against a real receiver — only through the content editor's preview, which fires the exact same authored cue but without gameplay context (backdrop, camera pan, other UI).

## 5. Timing note, if `waft`/`steep` get the same "last longer" pass later

`eruption`'s 2x-duration/0.5x-speed move: distance is speed × time, so halving every particle speed while doubling every duration reaches the exact same radius/travel each layer already had, just twice as slowly. Tween-driven layers (the rings) only need the duration doubled — a tween's target radius isn't a speed, so a longer duration alone gets it there more slowly with no separate adjustment. If the same ask comes up for `plume`/`beacon`, this is the reusable recipe, not something to re-derive.

---

## Key files

| Area | Files |
|---|---|
| The three new kinds — full implementation, all in one file | `phaser/src/render/vfx/PhaserVfxBackend.ts`, `plume`/`beacon`/`eruption` sections |
| The rotation fix, reusable for any future full-circle burst | `PhaserVfxBackend.ts`'s `facingAngleConfig()`, just above the `eruption` section |
| Kind union + anchoring | `phaser/src/render/vfx/VfxBackend.ts` |
| Cue arithmetic, kind whitelist (`KNOWN_KINDS`-equivalent, separate from the TS union) | `phaser/src/render/vfx/CueTable.ts` |
| Per-spell rows | `phaser/src/render/vfx/cues.json` |
| Disposal + colour + rotation-lock tests for all three kinds | `phaser/src/render/vfx/PhaserVfxBackend.test.ts` |
| Two new theme tokens | `phaser/src/ui/theme.ts` — `vfxGoldPale`, `vfxEmberPale` |
| Prototypes (reference, iterated live against Roc's screenshots across ~5 rounds each for waft/temper) | `phaser/tools/vfx-prototypes/{waft,steep,temper}-demo.html` |
| VFX preview surface (imports the real backend + cues.json directly) | `phaser/tools/content-editor/src/preview.ts` |
| Art-direction fold question, still open | `2026-08-22-vfx-wiring-handoff.md` §6 |
