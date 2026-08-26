/**
 * hub-decorate-rework.mjs — T7 regression for the Home Hub decorating epic
 * (Roc's 2026-08-23 notes, Group 3 of the triage plan).
 *
 * What it holds down, in order:
 *   1. the room opens zoomed (`ROOM_ZOOM_DEFAULT`) with the surface regions
 *      hidden, and `D` toggles them back on;
 *   2. the launching scene stops rendering, so the day loop's go-to buttons
 *      are not merely covered — "just the home hub screen";
 *   3. a banked chip DRAGS into the room and leaves the banked row;
 *   4. clicking a placed piece toggles its selection, and the action row is
 *      flip/remove only — no move button;
 *   5. dragging a placed piece moves it;
 *   6. removing it hands the copy back to the banked row;
 *   7. the shelf close-up takes the same drag.
 *
 * WHY THE DRAGS ARE SYNTHETIC MOUSE EVENTS. `tools/playtest.mjs` is vendored
 * unmodified and offers click/hover but no drag, and every bug this epic
 * fixed was a DRAG bug — verifying the fix with clicks would prove nothing.
 * So the drag is dispatched straight at the canvas, with a wait between each
 * event so a frame actually passes and Phaser's drag state machine advances
 * (down -> move = dragstart, move = drag, up = dragend).
 *
 * `MouseEvent`, not `PointerEvent`: Phaser's `MouseManager` binds
 * `mousedown`/`mousemove`/`mouseup`, so a synthetic `PointerEvent` dispatched
 * at the same canvas is simply never seen — verified by probe, the active
 * pointer did not move at all. Real Playwright input works either way because
 * the browser emits both families.
 *
 * Screen/room coordinates: the room layer is scaled by `zoom` about the view
 * centre and then shifted by the pan, so a `Decor` fraction f maps to
 * `960*(1-zoom) + f*1920*zoom + offsetX` across and
 * `540*(1-zoom) + f*1080*zoom + offsetY` down. Every fixed pixel below is
 * derived that way at the opening view (`ROOM_ZOOM_DEFAULT` 1.2,
 * `ROOM_ZOOM_DEFAULT_OFFSET_Y` 90), and the assertions re-derive it from the
 * live snapshot rather than trusting the arithmetic.
 */

const INSTALL_DRAG = `(() => {
  const c = document.querySelector('canvas');
  const send = (type, x, y, buttons) => {
    const r = c.getBoundingClientRect();
    c.dispatchEvent(new MouseEvent(type, {
      button: 0, buttons,
      clientX: r.left + (x / 1920) * r.width,
      clientY: r.top + (y / 1080) * r.height,
      bubbles: true, cancelable: true,
    }));
  };
  window.__t7 = {
    down: (x, y) => send('mousedown', x, y, 1),
    move: (x, y) => send('mousemove', x, y, 1),
    up: (x, y) => send('mouseup', x, y, 0),
  };
  return true;
})()`;

/** One drag, as the four steps Phaser needs frames between. */
const drag = (what, x0, y0, x1, y1) => [
  { name: `${what} — press`, action: "expect", expect: { expression: `(window.__t7.down(${x0}, ${y0}), true)`, equals: true } },
  { name: "frame", action: "wait", ms: 120 },
  { name: `${what} — move off`, action: "expect", expect: { expression: `(window.__t7.move(${(x0 + x1) / 2}, ${(y0 + y1) / 2}), true)`, equals: true } },
  { name: "frame", action: "wait", ms: 120 },
  { name: `${what} — move to target`, action: "expect", expect: { expression: `(window.__t7.move(${x1}, ${y1}), true)`, equals: true } },
  { name: "frame", action: "wait", ms: 120 },
  { name: `${what} — release`, action: "expect", expect: { expression: `(window.__t7.up(${x1}, ${y1}), true)`, equals: true } },
  { name: "let the redraw settle", action: "wait", ms: 300 },
];

export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1600 },
  { name: "01-day-screen-with-go-to-buttons", action: "screenshot" },
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 900 },
  { name: "install the synthetic drag helper", action: "expect", expect: { expression: INSTALL_DRAG, equals: true } },

  // --- 1 + 2: opens zoomed, regions hidden, nothing rendering behind it ---
  {
    name: "opens at the default zoom, regions hidden, and reports itself at rest",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__hub.snapshot();
        return s.zoom > 1.01 && s.debugRegions === false && s.atDefault === true;
      })()`,
      equals: true,
    },
  },
  {
    name: "the launching scene is no longer being drawn — the go-to buttons are gone, not covered",
    action: "expect",
    expect: {
      expression: `window.__PHASER_GAME__.scene.getScene('CollectScene').sys.settings.visible`,
      equals: false,
    },
  },
  { name: "02-hub-opened-regions-hidden", action: "screenshot" },
  { name: "press D for the debug region overlay", action: "key", key: "d" },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  {
    name: "D turns the surface regions on",
    action: "expect",
    expect: { expression: `window.__hub.snapshot().debugRegions`, equals: true },
  },
  { name: "03-hub-regions-debug-on", action: "screenshot" },
  { name: "press D again to hide them", action: "key", key: "d" },
  { name: "let the redraw settle", action: "wait", ms: 300 },

  // --- 3: drag a banked chip into the room ---
  {
    name: "bank two of the first collectible and one of the second",
    action: "expect",
    expect: {
      expression: `(() => {
        const h = window.__hub;
        h.newLife();
        const ids = h.collectibleIds();
        window.__t7ids = { a: ids[0], b: ids[1] };
        h.bank([ids[0], ids[0], ids[1]]);
        const s = h.snapshot();
        return s.stockLimited && s.remaining[ids[0]] === 2 && s.paletteIds.length === 2;
      })()`,
      equals: true,
    },
  },
  { name: "04-banked-row-stocked", action: "screenshot" },
  // The first chip sits at x:40, on the row at y≈952 (see `drawPalette`);
  // 110,975 is inside its pill, away from both edges.
  ...drag("drag a banked chip into the room", 110, 975, 700, 500),
  {
    name: "the drag placed a piece at the drop point, in room space not screen space",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__hub.snapshot();
        const t = { s: s.zoom, x: 960 * (1 - s.zoom) + s.offsetX, y: 540 * (1 - s.zoom) + s.offsetY };
        // Map the placement FORWARD to a screen point and compare against the
        // drop: that is what proves the zoom inverse was applied, and it is
        // read in the units the assertion is written in. 40px covers the
        // 16px placement grid plus half a chip of grab offset.
        return s.placements.some((p) => {
          const sx = t.x + p.x * 1920 * t.s;
          const sy = t.y + p.y * 1080 * t.s;
          return Math.abs(sx - 700) < 40 && Math.abs(sy - 500) < 40;
        });
      })()`,
      equals: true,
    },
  },
  {
    name: "and the copy came off the banked stock",
    action: "expect",
    expect: { expression: `window.__hub.snapshot().remaining[window.__t7ids.a]`, equals: 1 },
  },
  { name: "05-dragged-from-banked", action: "screenshot" },
  {
    name: "spending the LAST copy takes the chip off the banked row entirely",
    action: "expect",
    expect: {
      expression: `(() => {
        const h = window.__hub;
        h.place(window.__t7ids.a, 0.24, 0.40);
        const s = h.snapshot();
        // Gone from the row, still accounted for in the stock model at 0.
        return !s.paletteIds.includes(window.__t7ids.a) && s.remaining[window.__t7ids.a] === 0;
      })()`,
      equals: true,
    },
  },
  { name: "06-banked-row-drawn-down", action: "screenshot" },

  // --- 4: click toggles selection, and there is no move button ---
  // 0.24,0.40 in room space at zoom 1.2 with the default +90 pan:
  //   x = 0.24*1920*1.2 + 960*(1-1.2)      = 552.9 - 192 = 361
  //   y = 0.40*1080*1.2 + 540*(1-1.2) + 90 = 518.4 - 108 + 90 = 500
  { name: "click the placed piece", action: "click", x: 361, y: 500 },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  {
    name: "clicking a piece selects it",
    action: "expect",
    expect: { expression: `window.__hub.snapshot().selected !== null`, equals: true },
  },
  { name: "07-piece-selected-flip-remove-only", action: "screenshot" },
  { name: "click the same piece again", action: "click", x: 361, y: 500 },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  {
    name: "clicking it again TOGGLES the selection off",
    action: "expect",
    expect: { expression: `window.__hub.snapshot().selected`, equals: null },
  },

  // --- 5: drag a placed piece ---
  ...drag("drag the placed piece across the room", 361, 500, 900, 620),
  {
    name: "the piece moved to where it was dropped",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__hub.snapshot();
        const t = { s: s.zoom, x: 960 * (1 - s.zoom) + s.offsetX, y: 540 * (1 - s.zoom) + s.offsetY };
        return s.placements.some((p) => {
          const sx = t.x + p.x * 1920 * t.s;
          const sy = t.y + p.y * 1080 * t.s;
          return Math.abs(sx - 900) < 40 && Math.abs(sy - 620) < 40;
        });
      })()`,
      equals: true,
    },
  },
  {
    name: "dragging a piece also leaves it selected — no second click to reach its actions",
    action: "expect",
    expect: { expression: `window.__hub.snapshot().selected !== null`, equals: true },
  },
  { name: "08-piece-dragged", action: "screenshot" },

  // --- 6: remove hands the copy back to the banked row ---
  // No click first: the drag above already selected it, and clicking it now
  // would TOGGLE the selection back off.
  { name: "press Del", action: "key", key: "Delete" },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  {
    name: "removing a placed piece puts its chip back on the banked row",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__hub.snapshot();
        return s.paletteIds.includes(window.__t7ids.a) && s.remaining[window.__t7ids.a] === 1;
      })()`,
      equals: true,
    },
  },
  { name: "09-copy-returned-to-banked", action: "screenshot" },

  // --- click-to-place: the non-drag route to the same result (WCAG 2.5.7),
  // which lost its own scratch scenario when the "move" pill was cut ---
  { name: "click the returned banked chip to arm a place-hold", action: "click", x: 110, y: 975 },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  {
    name: "clicking a banked chip arms a place-hold rather than dragging",
    action: "expect",
    expect: { expression: `window.__hub.snapshot().clickHold?.kind`, equals: "place" },
  },
  { name: "click a spot in the room to complete the placement", action: "click", x: 520, y: 600 },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  {
    name: "the hold cleared and the piece landed under the click, zoom and pan included",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__hub.snapshot();
        if (s.clickHold !== null) return false;
        const t = { s: s.zoom, x: 960 * (1 - s.zoom) + s.offsetX, y: 540 * (1 - s.zoom) + s.offsetY };
        return s.placements.some((p) => {
          const sx = t.x + p.x * 1920 * t.s;
          const sy = t.y + p.y * 1080 * t.s;
          return Math.abs(sx - 520) < 30 && Math.abs(sy - 600) < 30;
        });
      })()`,
      equals: true,
    },
  },
  { name: "09b-placed-by-click-not-drag", action: "screenshot" },

  // --- 7: the shelf hotspot is still reachable, and takes the same drag ---
  // The merged shelf region is authored at the top of the room (`Decor`'s
  // SHELF_BOUNDS, y 0.09-0.16, padded 20% by `drawShelfHint`), which at the
  // default zoom lands at screen y 80-207 — only the strip below the header
  // chrome is inside the room camera. This hover/click at (960, 185) is
  // inside that strip, and is what holds `ROOM_ZOOM_DEFAULT_OFFSET_Y` in
  // place: without the opening pan the whole hotspot sits above the clip and
  // the close-up has no door at all.
  { name: "hover the high-shelf hotspot", action: "hover", x: 960, y: 185 },
  { name: "let the hover paint", action: "wait", ms: 300 },
  { name: "10a-shelf-hotspot-revealed-on-hover", action: "screenshot" },
  { name: "click it to open the close-up", action: "click", x: 960, y: 185 },
  { name: "let the close-up render", action: "wait", ms: 700 },
  {
    name: "the shelf close-up opened from a real click on the in-room hotspot",
    action: "expect",
    expect: {
      expression: `window.__PHASER_GAME__.scene.isActive('HubShelfScene')`,
      equals: true,
    },
  },
  { name: "10-shelf-closeup", action: "screenshot" },
  // Shelf palette row sits at y≈960 (PANEL_BOTTOM + 28 + 32); the top-left
  // cubby's centre is ≈(567, 265) through `imageBox()` × `SHELF_CUBBY_RECTS`.
  ...drag("drag a chip onto a shelf cubby", 110, 976, 567, 265),
  {
    name: "the drag filled a cubby",
    action: "expect",
    expect: {
      expression: `window.__hub.snapshot().placements.some((p) => (p.surfaceId ?? '').startsWith('shelf-'))`,
      equals: true,
    },
  },
  { name: "11-shelf-drag-placed", action: "screenshot" },
];
