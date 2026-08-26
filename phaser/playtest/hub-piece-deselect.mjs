/**
 * hub-piece-deselect.mjs — T5 regression: selecting a second piece must
 * deselect the first, and the flip/remove pill row must never linger over a
 * piece that is no longer selected.
 *
 * Two pieces are placed far apart via the `__hub` debug handle, then clicked
 * in turn with real pointer events (not the handle) so the actual chip
 * hit-test and the pill row's own draw order are what gets exercised.
 *
 * AMENDED BY T7 (Roc, 2026-08-23). The "move" pill this used to click is
 * gone — "we should just be able to click and drag specific items, don't
 * need a move button" — so the move hold is now armed with `M`, its
 * surviving non-drag entry point. Coordinates moved too: the Hub opens at
 * `ROOM_ZOOM_DEFAULT` with `ROOM_ZOOM_DEFAULT_OFFSET_Y`, so a `Decor`
 * fraction f maps to `960*(1-1.2) + f*1920*1.2` across and
 * `540*(1-1.2) + f*1080*1.2 + 90` down.
 */
export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1400 },
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 900 },
  {
    name: "place two test pieces via __hub",
    action: "expect",
    expect: {
      expression: `(() => {
        const h = window.__hub;
        h.newLife();
        const a = h.place('test_river_stone', 0.30, 0.55);
        const b = h.place('test_river_stone', 0.62, 0.55);
        return !!(a && b);
      })()`,
      equals: true,
    },
  },
  // 0.30,0.55 -> (499, 695);  0.62,0.55 -> (1237, 695).
  { name: "click piece A", action: "click", x: 499, y: 695 },
  { name: "let the redraw settle", action: "wait", ms: 350 },
  { name: "01-piece-a-selected", action: "screenshot" },
  {
    name: "piece A is the selection",
    action: "expect",
    expect: {
      expression: `(() => { const s = window.__hub.snapshot(); return s.selected === s.placements[0].uid; })()`,
      equals: true,
    },
  },
  { name: "click piece B", action: "click", x: 1237, y: 695 },
  { name: "let the redraw settle", action: "wait", ms: 350 },
  { name: "02-piece-b-selected", action: "screenshot" },
  {
    name: "selection moved to piece B (A deselected)",
    action: "expect",
    expect: {
      expression: `(() => { const s = window.__hub.snapshot(); return s.selected === s.placements[1].uid; })()`,
      equals: true,
    },
  },
  // The other half of the bug: with a move hold armed on B, clicking A used
  // to be swallowed ("finish or cancel the hold first"), so B kept the
  // selection and its pill row while A refused to take it. B is still the
  // selection here, so `M` arms the hold on it.
  { name: "press M to arm a move hold on B", action: "key", key: "m" },
  { name: "let the redraw settle", action: "wait", ms: 350 },
  {
    name: "a move hold is armed on B",
    action: "expect",
    expect: {
      expression: `(() => { const s = window.__hub.snapshot(); return s.clickHold && s.clickHold.kind === 'move' && s.clickHold.uid === s.placements[1].uid; })()`,
      equals: true,
    },
  },
  { name: "click piece A while B's move hold is armed", action: "click", x: 499, y: 695 },
  { name: "let the redraw settle", action: "wait", ms: 350 },
  { name: "04-armed-hold-preempted", action: "screenshot" },
  {
    name: "clicking a piece pre-empts the hold and takes the selection",
    action: "expect",
    expect: {
      expression: `(() => { const s = window.__hub.snapshot(); return s.clickHold === null && s.selected === s.placements[0].uid; })()`,
      equals: true,
    },
  },

  // Empty room, clear of both pieces and of the high-shelf hotspot strip
  // (x 766-1153, y 160-207 at the default view).
  { name: "click empty room to deselect entirely", action: "click", x: 300, y: 400 },
  { name: "let the redraw settle", action: "wait", ms: 350 },
  { name: "03-nothing-selected", action: "screenshot" },
  {
    name: "clicking empty room clears the selection and the pill row",
    action: "expect",
    expect: {
      expression: `window.__hub.snapshot().selected`,
      equals: null,
    },
  },
];
