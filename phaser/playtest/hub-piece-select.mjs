/**
 * hub-piece-select.mjs — build-verify scratch scenario for the Home Hub
 * piece-select actions + chrome regroup (wireframe §8's second/third .pair).
 * Places a piece via the `__hub` debug handle, selects it (so the flip/
 * remove buttons draw), and screenshots both the selected-piece state and
 * the regrouped chrome row. Not a committed regression scenario — a
 * temporary check for this build pass.
 */
export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1400 },
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 900 },
  {
    name: "place + select a test piece via __hub",
    action: "expect",
    expect: {
      expression: `(() => { const h = window.__hub; const p = h.place('test_river_stone', 0.42, 0.42); h.snapshot(); return !!p; })()`,
      equals: true,
    },
  },
  { name: "click the placed piece to select it", action: "click", x: 806, y: 454 },
  { name: "let the redraw settle", action: "wait", ms: 400 },
  { name: "hub-selected-piece", action: "screenshot" },
];
