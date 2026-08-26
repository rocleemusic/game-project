/**
 * notebook-vfx-pane.mjs — T10 (Group 4). Guards the notebook's VFX preview
 * pane after the 2026-08-24 rework:
 *
 *  1. NO AUTOPLAY. Selecting a spell builds the pane but must not fire a cue,
 *     and there is no replay loop — `preview().live` stays 0 until the player
 *     acts.
 *  2. THE PANE IS THE CAST AFFORDANCE. Clicking the pane fires the cue in
 *     place; the separate "▶ Play" text button is gone.
 *  3. The pane is larger than the old 664x200.
 *
 * Runs at the harness's 1920x1080 viewport, so CSS pixels == game coordinates
 * 1:1 and the pane centre can be clicked by its known layout rect.
 *
 * Entry mirrors `mode5-vfx.mjs`: ModePickerScene -> mode5 -> "Begin at
 * Forager's Clearing" -> CollectScene, with a forced screenshot between the
 * scene handoffs (this environment's headless rAF pacing needs a composited
 * frame between transitions — see that file's header).
 *
 * `glimmer` is one of the day-1 STARTER_SPELLS (`starterSpells.ts`), so it is
 * always in the spellbook on a fresh boot and `__notebook.select()` can reach
 * it with no setup.
 */
export default [
  { name: "ModePickerScene ready", action: "wait", ms: 1200 },
  { name: "pick mode5", action: "click", x: 960, y: 900 },
  { name: "picker gone", action: "screenshot" },
  { name: "enter LocationSelectScene", action: "wait", ms: 2500 },
  { name: "begin at Forager's Clearing (F1)", action: "click", x: 259, y: 687 },
  { name: "CollectScene ready", action: "wait", ms: 1400 },
  {
    name: "CollectScene active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  { name: "open Notebook (N)", action: "key", key: "N" },
  { name: "let the book render", action: "wait", ms: 900 },
  {
    name: "select glimmer on the spells tab (deterministic, no pixel-hunting)",
    action: "expect",
    expect: {
      expression: `(() => { window.__notebook.select("glimmer"); return window.__notebook.preview().selected; })()`,
      equals: "glimmer",
    },
  },
  // Long enough that the OLD 1600ms replay loop would have fired at least once.
  { name: "wait past the old replay-loop interval", action: "wait", ms: 2200 },
  { name: "pane-idle", action: "screenshot" },
  {
    name: "NO AUTOPLAY — nothing is live in the pane until the player acts",
    action: "expect",
    expect: { expression: `window.__notebook.preview().live`, equals: 0 },
  },
  {
    name: "the ▶ Play button is gone",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("NotebookScene");
        return sc.children.list.concat(...sc.children.list.map(o => o.list || []))
          .some(o => typeof o.text === "string" && o.text.indexOf("Play") !== -1);
      })()`,
      equals: false,
    },
  },
  {
    name: "the pane is bigger than the old 664x200 window",
    action: "expect",
    expect: {
      expression: `(() => {
        const p = window.__notebook.preview().pane;
        return p.w * p.h;
      })()`,
      atLeast: 664 * 200 + 1,
    },
  },
  {
    // Sanity-check the hard-coded click below against the scene's own layout,
    // so a future layout change fails loudly here instead of silently clicking
    // parchment.
    name: "the pane's centre is where the next step clicks",
    action: "expect",
    expect: {
      expression: `(() => {
        const p = window.__notebook.preview().pane;
        return Math.round(p.x) + "," + Math.round(p.y);
      })()`,
      equals: "1328,522",
    },
  },
  // A REAL click on the pane, not a probe call — this is also what proves the
  // preview camera parked over the pane does not swallow the pointer.
  { name: "cast by clicking the pane itself", action: "click", x: 1328, y: 522 },
  {
    name: "the click fired a cue in the pane",
    action: "expect",
    expect: { expression: `window.__notebook.preview().live`, atLeast: 1 },
  },
  // HOLDING THE CUE OPEN FOR THE CAMERA. Same environment quirk the crossfade
  // scenario had to work around (Phase 2 note, 2026-08-24): with several dev
  // servers running, this machine drops to ~12-25 fps and a Playwright
  // `screenshot` (which waits on fonts, stability and a composited frame) can
  // easily outlast glimmer's 1400ms cue — the capture then lands after the cue
  // ended and shows a black pane that looks exactly like "nothing fired". So
  // the pane's OWN pointerdown handler is re-fired on an interval across the
  // capture. This drives the real affordance, not a probe shortcut; the single
  // real click above is what proves the affordance works.
  {
    name: "re-fire the pane's own handler across the capture",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("NotebookScene");
        const p = window.__notebook.preview().pane;
        const layer = sc.children.list.find(o => o.type === "Container");
        const pane = layer.list.find(o => o.type === "Rectangle" && o.width === p.w && o.height === p.h);
        if (!pane) return "NO PANE";
        window.__t10hold = setInterval(() => pane.emit("pointerdown"), 250);
        return "ok";
      })()`,
      equals: "ok",
    },
  },
  { name: "pane-casting", action: "screenshot" },
  {
    name: "release the hold",
    action: "expect",
    expect: { expression: `(() => { clearInterval(window.__t10hold); return "ok"; })()`, equals: "ok" },
  },
];
