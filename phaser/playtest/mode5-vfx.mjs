/**
 * mode5-vfx.mjs — regression guard for two bugs: VFX-never-wired
 * (2026-08-17) and sprite-kind cues never loading their texture
 * (2026-08-23).
 *
 * `MODE5.systems` was missing `"vfx"` despite the descriptor's own blurb
 * promising "spell VFX" — `CollectScene.startVfx()` never constructed a
 * `VfxSystem`, so every cast in mode5 was silent. Fixed same session; this
 * pins it. Run via `npm run playtest -- --scenario playtest/mode5-vfx.mjs`.
 *
 * Entry is via `ModePickerScene` (the real boot flow — a scene this file
 * previously skipped past, which had gone stale) then "Begin at Forager's
 * Clearing" on `LocationSelectScene`, landing on F1. Every click coordinate
 * below is CSS pixels relative to the canvas's own bounding box
 * (`tools/playtest.mjs`'s `click` case), NOT 1920x1080 game coordinates —
 * verified live via this scenario's own screenshots at the harness's
 * default 1280x720 viewport.
 *
 * THE SCREENSHOTS BETWEEN SCENE TRANSITIONS AREN'T JUST DIAGNOSTIC. This
 * environment's headless rAF pacing is unreliable across a scene handoff
 * (`2026-08-23-vfx-kinds-handoff.md` §3 documents the same clock-vs-wall-
 * time gap for cue timing) — `wait`-only transitions between ModePickerScene
 * -> LocationSelectScene -> CollectScene flaked repeatedly in this session
 * even at 1500ms, while adding a `canvas.screenshot()` (which forces
 * Playwright to actually composite a frame) between each transition made it
 * reliable again. Removing them is a regression in this file, not a cleanup.
 *
 * SPELL: `ignite`, not one of the three day-1 STARTER_SPELLS
 * (`starterSpells.ts`: echo/fetch/glimmer). NONE of echo, fetch, or glimmer
 * has an authored `dry_hedge` receiver outcome in `content/magic/*.json` —
 * every content author gets `unknown-receiver` against this hedge, so
 * `HedgeCastPrompt` shows "does nothing" and never reaches `cast:resolved`,
 * whatever the caster is carrying. `ignite` is the ONLY spell with a
 * `dry_hedge` branch, and its cue is `kind: "sprite"` (cues.json) — the
 * kind this scenario now also guards. It is also a genuine, separate
 * content gap (Roc, 2026-08-22): as of `starterSpells.ts`'s 2026-08-18
 * change, `ignite` moved from starter-known to NPC-taught by the
 * Blacksmith, which means a fresh player who reaches this hedge on day 1 —
 * before ever meeting the Blacksmith — has no spell that does anything to
 * it via any of their three starting spells. Not this scenario's fix;
 * flagged for a content pass. `knowledge.learn("ignite")` and
 * `inventory.give("item_sticks")` (ignite's one component, guaranteed
 * forageable at F1) reach the scene directly rather than through
 * `window.__collect`, which exposes neither.
 *
 * WHY THE SPRITE CHECK RUNS WITH NO WAIT BEFOREHAND. `GameEventBus.emit` is
 * synchronous, so by the time the click's own handler returns, the whole
 * cast:resolved chain (CastPipeline -> bus -> VfxSystem.handle ->
 * backend.play -> spriteFx) has already run. Checking immediately, inside
 * ignite's 1200ms cue duration, avoids the flakiness a later check would
 * have from screenshot/eval overhead eating into that window.
 *
 * `VfxSystem.played` (checked further down) is necessary but NOT sufficient
 * on its own: it counts every cue reaching `backend.play()` with an active
 * handle, sprite cues included, even when `spriteFx` silently returned null
 * (a missing texture is a content/wiring defect there, never a throw — see
 * `PhaserVfxBackend.ts`) and nothing ever rendered. That gap is exactly how
 * ignite's sprite went unnoticed: `played` looked fine while the flame
 * never showed. The dedicated sprite check above looks for the actual live
 * GameObject instead.
 */
export default [
  { name: "ModePickerScene ready", action: "wait", ms: 1200 },
  // Mode5 button, 4th of ModePickerScene's four (game (960, 900) -> CSS
  // (640, 600) at the harness's default 1280x720 / 1920x1080 = 2/3 scale).
  { name: "pick mode5", action: "click", x: 640, y: 600 },
  // A screenshot here isn't just diagnostic — see this file's header on why
  // headless rAF pacing needs a forced paint between scene transitions.
  { name: "picker gone", action: "screenshot" },
  { name: "enter LocationSelectScene", action: "wait", ms: 2500 },
  // LocationSelectScene: the two starts are map-thumbnail buttons inside TODAY's
  // card (leftmost). Forager's Clearing is the lower slot, Town Square the upper.
  // This click flaked repeatedly at 1200-1500ms even with a preceding
  // screenshot — the card likely isn't interactive until its own entrance
  // animation settles, and that settle time is not fixed under load. 2500ms
  // is deliberately generous, not tuned to a minimum.
  { name: "begin at Forager's Clearing (F1)", action: "click", x: 173, y: 458 },
  { name: "CollectScene ready", action: "wait", ms: 1200 },
  { name: "on F1", action: "screenshot" },
  {
    name: "probe exists",
    action: "expect",
    expect: { expression: `Boolean(window.__collect)`, equals: true },
  },
  {
    name: "VfxSystem is actually constructed — the bug this scenario guards against",
    action: "expect",
    expect: { expression: `game.scene.getScene("CollectScene").vfx !== null`, equals: true },
  },
  {
    // `knowledge`/`inventory` reached straight off the scene — see the class
    // header on why `ignite`, and why not Dev Unlock (it also learns every
    // other approved spell, which changes the spellbook grid's row/column
    // count and moves every row's click target, `ignite`'s included).
    name: "learn ignite, grant its one component (setup)",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        sc.knowledge.learn("ignite");
        sc.inventory.give("item_sticks");
        return window.__collect.inventoryHeld().includes("item_sticks");
      })()`,
      equals: true,
    },
  },
  {
    name: "open the gated cast prompt (setup, via the probe)",
    action: "expect",
    expect: { expression: `(() => { window.__collect.openHedgePrompt(); return true; })()`, equals: true },
  },
  { name: "let the modal render", action: "wait", ms: 200 },
  { name: "modal open", action: "screenshot" },
  // The hedge modal's "WHAT YOU KNOW" row IS the spell picker now — no
  // separate [Cast] button/spellbook-grid step (that two-step flow this
  // scenario used to drive is gone). Chips are echo/fetch/glimmer
  // (STARTER_SPELLS) + ignite (learned above), alphabetical, ignite last at
  // roughly (566, 255). Verified live via the "modal open" screenshot.
  { name: "click ignite — real click on the actual spell chip (a sprite cue)", action: "click", x: 566, y: 255 },
  {
    // The regression this whole scenario exists for now: ignite's cue is
    // `kind: "sprite"` (cues.json), which needs `vfx_ignite_flame` already
    // loaded as a texture (`PhaserVfxBackend.spriteFx` returns null — a
    // silent no-op, never a throw — when the texture is missing). Checking
    // `vfx.played` alone (further down) is NOT enough: that counts every cue
    // reaching `backend.play()` with an active handle, sprite cues included,
    // EVEN when `spriteFx` returned null and nothing ever rendered. This
    // step checks the actual live GameObject, with no wait beforehand —
    // `GameEventBus.emit` is synchronous, so the cast:resolved handler chain
    // (CastPipeline -> bus -> VfxSystem.handle -> backend.play -> spriteFx)
    // has already run by the time this click's own handler returns, well
    // inside ignite's 1200ms cue duration.
    name: "the ignite flame sprite is actually on screen, not a silent no-op",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        const found = sc.children.list.some(
          (o) => o.texture && o.texture.key === "vfx_ignite_flame"
        );
        return found;
      })()`,
      equals: true,
    },
  },
  { name: "let the cast resolve and the VFX cue start", action: "wait", ms: 150 },
  { name: "mid-cast", action: "screenshot" },
  {
    name: "cast:resolved fired for ignite",
    action: "expect",
    expect: {
      expression: `(() => {
        const log = game.scene.getScene("CollectScene").bus.logOf("cast:resolved");
        const last = log[log.length - 1];
        return Boolean(last && last.spellId === "ignite");
      })()`,
      equals: true,
    },
  },
  {
    name: "VfxSystem actually dispatched a cue to the backend for this cast — `played` is the count of cues that reached backend.play() with an active handle",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").vfx.played`,
      atLeast: 1,
    },
  },
];
