/**
 * crossfade-transition.mjs — verifies T6e: `sceneTransition` fades the
 * outgoing scene's camera to night before starting the next scene, instead
 * of hard-cutting into the incoming scene's own `sceneFadeIn`.
 *
 * Boots to ModePickerScene and clicks "The Festival Week" (now wired
 * through `sceneTransition` in `ModePickerScene.pick()`).
 *
 * REAL-TIME POLLING, not a fixed-ms wait (2026-08-24 rewrite). A prior
 * version screenshotted once at a fixed 90ms after the click, on the
 * assumption that real time and Phaser's simulated time track together.
 * They don't, reliably, in this headless environment: this box regularly
 * runs many concurrent dev servers/playtest agents, and Phaser clamps or
 * stretches its delta-time per frame under load — the same fade can play
 * out over ~200ms OR ~1200ms of real wall-clock time depending on current
 * machine load, with no code change involved (confirmed by hand: an
 * isolated single-purpose dev server showed a smooth 0->1 progress ramp
 * over ~1.2s real time for a 220ms configured duration, same code, same
 * click). A fixed-delay screenshot can land before the fade visibly starts
 * OR after it's already finished, and either looks like "no crossfade" —
 * a false failure, not a real one. Polling `cam.fadeEffect.progress`
 * directly over real time, however long that takes, is measuring the
 * actual fade curve instead of guessing when to look at it. Same pattern
 * documented in `plans/_handoffs/2026-08-22-vfx-wiring-handoff.md` §3 for
 * VFX timing under this same environment quirk.
 */
export default [
  { name: "let ModePickerScene settle", action: "wait", ms: 800 },
  {
    name: "ModePickerScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("ModePickerScene")`, equals: true },
  },
  { name: "before click — mode picker at full brightness", action: "screenshot" },
  { name: "click 'The Festival Week' button", action: "click", x: 960, y: 460 },
  {
    name: "poll the real fade curve over real time until the scene hands off (or a 5s real-time budget runs out) — must see a genuine ramp through the middle, not an instant jump",
    action: "expect",
    expect: {
      expression: `(async () => {
        const samples = [];
        const t0 = Date.now();
        while (Date.now() - t0 < 5000) {
          const s = game.scene.getScene("ModePickerScene");
          const cam = s && s.cameras && s.cameras.main;
          const active = game.scene.isActive("ModePickerScene");
          samples.push({ t: Date.now() - t0, active, progress: cam ? cam.fadeEffect.progress : null });
          if (!active) break;
          await new Promise((r) => setTimeout(r, 15));
        }
        const midRamp = samples.some((s) => s.active && s.progress > 0.1 && s.progress < 0.9);
        const handedOff = samples.length > 0 && samples[samples.length - 1].active === false;
        window.__t6eSamples = samples;
        return midRamp && handedOff;
      })()`,
      equals: true,
    },
  },
  { name: "after crossfade — next scene settled", action: "screenshot" },
];
