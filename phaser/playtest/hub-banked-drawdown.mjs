/**
 * hub-banked-drawdown.mjs — T5 regression: the Home Hub palette is a real
 * inventory, not an infinite source.
 *
 * Banks two copies of one item and one of another (via `__hub.bank`, the
 * debug seam — see `Decor.setBankedForDebug`; a `banked` palette is empty
 * until a day actually ends at home, and playing a week to photograph this
 * would be the whole scenario). Then places both copies of the first item
 * and checks that a third is not on offer, and that removing one hands the
 * copy straight back.
 *
 * AMENDED BY T7 (Roc, 2026-08-23). A fully-placed item used to stay on the
 * banked row as a greyed "×0" chip; Roc's later note — "they should be
 * removed from the banked area when you move them onto the screen" —
 * supersedes that, so the assertions below now read `paletteIds` for
 * "on the row" and `remaining` for "in the stock model," which are no longer
 * the same question. The click coordinates also moved: the Hub opens at
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
    name: "bank two of the first collectible and one of the second",
    action: "expect",
    expect: {
      expression: `(() => {
        const h = window.__hub;
        h.newLife();
        const ids = h.collectibleIds();
        window.__t5 = { a: ids[0], b: ids[1] };
        h.bank([ids[0], ids[0], ids[1]]);
        const s = h.snapshot();
        return s.stockLimited && s.remaining[ids[0]] === 2 && s.remaining[ids[1]] === 1;
      })()`,
      equals: true,
    },
  },
  { name: "01-palette-stocked", action: "screenshot" },
  {
    name: "placing one copy draws the count down",
    action: "expect",
    expect: {
      expression: `(() => {
        const h = window.__hub;
        h.place(window.__t5.a, 0.30, 0.55);
        return h.snapshot().remaining[window.__t5.a];
      })()`,
      equals: 1,
    },
  },
  {
    name: "the second copy empties the stock and the item is spent, not gone",
    action: "expect",
    expect: {
      expression: `(() => {
        const h = window.__hub;
        h.place(window.__t5.a, 0.62, 0.55);
        const s = h.snapshot();
        // Off the row entirely (T7), but still accounted for at zero in the
        // stock model — which is what lets a removal hand the copy back.
        return s.remaining[window.__t5.a] === 0 && !s.paletteIds.includes(window.__t5.a);
      })()`,
      equals: true,
    },
  },
  { name: "02-palette-drawn-down", action: "screenshot" },
  // Removal through the real UI, not a handle call — select the piece, then
  // Del. That also re-proves the piece chips still take a click with the
  // stock gate in place.
  // 0.30,0.55 -> x = 0.30*1920*1.2 - 192 = 499, y = 0.55*1080*1.2 - 108 + 90 = 695.
  { name: "click the placed piece", action: "click", x: 499, y: 695 },
  { name: "let the redraw settle", action: "wait", ms: 350 },
  { name: "press Del", action: "key", key: "Delete" },
  { name: "let the redraw settle", action: "wait", ms: 350 },
  {
    name: "removing a placed piece hands its copy back, and its chip returns to the row",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__hub.snapshot();
        return s.remaining[window.__t5.a] === 1 && s.paletteIds.includes(window.__t5.a);
      })()`,
      equals: true,
    },
  },
  { name: "03-copy-returned", action: "screenshot" },
];
