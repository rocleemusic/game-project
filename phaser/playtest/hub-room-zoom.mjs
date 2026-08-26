/**
 * hub-room-zoom.mjs — build-verify scenario for room zoom/pan (wireframe §8,
 * "Zoom and pan the room," decided revision 4). The harness's own step
 * vocabulary has no wheel/drag actions, so each interaction is a synthetic
 * DOM event dispatched on the canvas inside an `expect` expression — same
 * technique, just driving native events instead of `__hub`'s debug calls.
 *
 * Covers, and asserts numerically: scroll-to-zoom changes `RoomZoomModel.
 * zoom`; Esc returns to the view the Hub opened in — `atDefault` — without
 * closing the Hub. (That used to be Fit; since T7 the Hub opens zoomed.)
 *
 * Drag-to-pan is exercised here but NOT asserted numerically — a synthetic
 * `canvas.dispatchEvent(new PointerEvent(...))` sequence is `isTrusted:
 * false` and never actually moves `RoomZoomModel`'s offset through Phaser's
 * InputManager, confirmed by direct comparison against a real
 * `page.mouse.down()/move()/up()` sequence (outside this harness's step
 * vocabulary, which has no drag primitive), which DOES move the offset and
 * matches `RoomZoomModel`'s own math to the decimal. That is a synthetic-
 * event limitation of this specific harness, not a defect in the built
 * feature — the drag math itself (clamping, anchor-based `panTo`) is
 * asserted directly in `tests/RoomZoomModel.test.ts`. The screenshot here
 * (`hub-panned`) still shows whatever the dispatch produced, for a human
 * to glance at.
 */

const dispatchWheel = (times, deltaY) => `(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const canvas = document.querySelector('canvas');
  const rect = canvas.getBoundingClientRect();
  const cx = rect.left + rect.width * 0.5;
  const cy = rect.top + rect.height * 0.32;
  for (let i = 0; i < ${times}; i++) {
    canvas.dispatchEvent(new WheelEvent('wheel', {
      deltaY: ${deltaY}, clientX: cx, clientY: cy, bubbles: true, cancelable: true,
    }));
    await wait(50);
  }
  return window.__hub.snapshot().zoom;
})()`;

// Async and paced with real waits between events (not fired back-to-back in
// one synchronous tick) — Phaser's InputManager processes queued native
// events once per game step, so three events dispatched in the same tick
// can collapse in a way three real mouse events (with a frame between each)
// never would. Confirmed against a real `page.mouse` sequence outside this
// harness's step vocabulary; this mirrors that timing instead of a same-tick
// dispatch.
const dispatchDrag = `(async () => {
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const canvas = document.querySelector('canvas');
  const rect = canvas.getBoundingClientRect();
  const x0 = rect.left + rect.width * 0.5;
  const y0 = rect.top + rect.height * 0.32;
  const x1 = x0 - 100;
  const y1 = y0 - 60;
  const evt = (type, x, y) => new PointerEvent(type, {
    clientX: x, clientY: y, bubbles: true, cancelable: true,
    pointerId: 1, isPrimary: true, button: 0, buttons: 1,
  });
  canvas.dispatchEvent(evt('pointerdown', x0, y0));
  await wait(80);
  canvas.dispatchEvent(evt('pointermove', x1, y1));
  await wait(80);
  canvas.dispatchEvent(evt('pointerup', x1, y1));
  await wait(80);
  return window.__hub.snapshot();
})()`;

export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 173, y: 459 },
  { name: "let CollectScene create() run", action: "wait", ms: 1400 },
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 900 },
  { name: "hub-fit", action: "screenshot" },
  {
    name: "scroll to zoom in over empty room (6 notches, deltaY -120) — zoom actually increased past Fit",
    action: "expect",
    expect: { expression: dispatchWheel(6, -120), atLeast: 1.5 },
  },
  { name: "let the zoom settle", action: "wait", ms: 200 },
  { name: "hub-zoomed", action: "screenshot" },
  {
    // Not a numeric assertion — see the file header on why a synthetic
    // dispatchEvent drag can't be asserted through this harness. Still
    // exercises the listeners (no exception/console-error checks below
    // still apply) and the follow-up screenshot shows what happened.
    name: "drag pans while zoomed in (exercised, not asserted — see header)",
    action: "expect",
    expect: { expression: `${dispatchDrag}.then(() => true)`, equals: true },
  },
  { name: "let the pan settle", action: "wait", ms: 200 },
  { name: "hub-panned", action: "screenshot" },
  { name: "Esc returns to the opening view, not the Hub itself", action: "key", key: "Escape" },
  { name: "let the reset settle", action: "wait", ms: 300 },
  { name: "hub-fit-again", action: "screenshot" },
  {
    // T7 (Roc, 2026-08-23): the Hub no longer opens at Fit, so Esc no longer
    // resets TO Fit — it returns to the view the screen opened in
    // (`ROOM_ZOOM_DEFAULT` + `ROOM_ZOOM_DEFAULT_OFFSET_Y`). `atDefault` is
    // the model's own name for that state, so this asserts the contract
    // rather than re-hardcoding the two constants here.
    name: "back at the opening view",
    action: "expect",
    expect: {
      expression: "(() => { const s = window.__hub.snapshot(); return s.atDefault === true && s.offsetX === 0; })()",
      equals: true,
    },
  },
  {
    name: "Hub still open (Esc only reset zoom, did not close it)",
    action: "expect",
    expect: { expression: `game.scene.isActive("HubScene")`, equals: true },
  },
];
