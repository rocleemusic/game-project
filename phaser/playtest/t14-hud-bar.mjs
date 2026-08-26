/**
 * t14-hud-bar.mjs — the HUD relayout, verified against the wireframe's AFTER
 * frame (`tools/screen-flow/mockups/hud-relayout-wireframe.html` §1 / §1b;
 * ruling `plans/2026-08-23-hud-relayout-ruling.md`).
 *
 * What this proves, in order:
 *   1. The nav clusters are on ONE CENTRED BOTTOM BAR, not top-right — checked
 *      as real geometry (every tile's y is in the bottom band, the run is
 *      centred on the canvas), not as "a NavRow object exists".
 *   2. §1b's fourth cluster is really there: a Wait tile and an "End day · E"
 *      pill, always visible.
 *   3. The traversal PILLS are gone — no "Go to X" / "Wait" / "End the day"
 *      text button on screen at all — and DASHED MOVE REGIONS took their
 *      place, one per exit ink offers.
 *   4. Clicking a move region actually walks. The click is a REAL pointer
 *      click, and the coordinate is asserted to be inside the region's own hit
 *      area first, so a moved region fails loudly rather than silently
 *      clicking the backdrop — same convention as `wait-button.mjs` and
 *      `mode5-traversal-regression.mjs`.
 *   5. End the Day asks first (§1b: "End the Day should open a one-step
 *      confirm before it commits. Wait needs no confirm").
 *
 * Screenshots are the point, not a side effect: `tsc`/`vitest` prove the code
 * runs, not that the bar looks like the mockup.
 */
export default [
  { name: "day-start calendar up", action: "wait", ms: 4000 },
  { name: "pick the day's first start location", action: "click", x: 172, y: 460 },
  { name: "CollectScene ready", action: "wait", ms: 3000 },

  {
    name: "AFTER — explore tenant: centred bottom bar, dashed move regions, clear sky",
    action: "screenshot",
  },

  {
    name: "the nav tiles sit in ONE centred run along the bottom edge (§1 anchor change)",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        // Nav tiles are the depth-99 interactive Graphics whose hit area is a
        // 44px square — the one shape only NavRow draws.
        const tiles = s.children.list.filter((o) =>
          o.type === "Graphics" && o.depth === 99 && o.input &&
          o.input.hitArea && o.input.hitArea.width === 44 && o.input.hitArea.height === 44);
        const xs = tiles.map((t) => t.x);
        const runMid = (Math.min(...xs) + Math.max(...xs) + 44) / 2;
        return {
          count: tiles.length,
          allInBottomBand: tiles.every((t) => t.y > 940 && t.y < 1040),
          centred: Math.abs(runMid - 960) < 80,
        };
      })()`,
      equals: { count: 6, allInBottomBand: true, centred: true },
    },
  },

  {
    name: "§1b — the End-day PILL is on the bar, reading 'End day · E'",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const t = s.children.list.find((o) => o.type === "Text" && o.text === "End day · E");
        if (!t) return "no End-day pill";
        return { onBar: t.y > 940 && t.y < 1040, pastCentre: t.x > 960 };
      })()`,
      equals: { onBar: true, pastCentre: true },
    },
  },

  {
    name: "the traversal PILL ROW is retired — no Go to / Begin at / Wait / End the day text button",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        return s.children.list
          .filter((o) => o.type === "Text" && typeof o.text === "string")
          .map((o) => o.text)
          .filter((t) => /^(Go to |Begin at |Wait$|End the day$)/.test(t));
      })()`,
      equals: [],
    },
  },

  {
    name: "one dashed MOVE REGION per exit ink offers, each with its own label",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const exits = s.ink.view().choices.filter((c) => c.hubAction === "exit").length;
        // Move regions are the depth-10 interactive Rectangles MoveRegions draws.
        const boxes = s.children.list.filter((o) =>
          o.type === "Rectangle" && o.depth === 10 && o.input).length;
        const labels = s.children.list.filter((o) => o.type === "Text" && o.depth === 11).length;
        return exits > 0 && exits === boxes && exits === labels;
      })()`,
      equals: true,
    },
  },

  {
    name: "the in-tile hotkey letters are drawn (§1: the tooltip is confirmation, not the only teacher)",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        return s.children.list
          .filter((o) => o.type === "Text" && o.y > 940 && /^[A-Z]$/.test(o.text))
          .map((o) => o.text).sort().join("");
      })()`,
      equals: "HLNSW",
    },
  },

  // §1: "Tooltips flip to open ABOVE the tile (there is no room below anymore)."
  { name: "hover the Satchel tile", action: "hover", x: 716, y: 1020 },
  { name: "let the tooltip paint", action: "wait", ms: 400 },
  {
    name: "the tooltip opens ABOVE the tile it belongs to",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const tip = s.children.list.find((o) => o.type === "Text" && o.depth === 151 && o.visible);
        if (!tip) return "no tooltip";
        return { text: tip.text, above: tip.y < 998 };
      })()`,
      equals: { text: "Satchel · S", above: true },
    },
  },
  { name: "tooltip above the bar", action: "screenshot" },

  {
    name: "the click coordinate below is inside the FIRST move region's hit area",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const box = s.children.list.find((o) => o.type === "Rectangle" && o.depth === 10 && o.input);
        if (!box) return "no move region";
        window.__t14from = window.__collect.snapshot().drawnScreen;
        const px = 1720, py = 225;
        return Math.abs(px - box.x) < box.width / 2 && Math.abs(py - box.y) < box.height / 2
          ? true
          : "region is at " + Math.round(box.x) + "," + Math.round(box.y)
              + " size " + Math.round(box.width) + "x" + Math.round(box.height);
      })()`,
      equals: true,
    },
  },
  { name: "walk through the first move region (real pointer click)", action: "click", x: 1720, y: 225 },
  { name: "let ink run and render()", action: "wait", ms: 1500 },
  {
    name: "the screen actually changed — a region click really walks",
    action: "expect",
    expect: {
      expression: `window.__collect.snapshot().drawnScreen !== window.__t14from`,
      equals: true,
    },
  },
  { name: "after walking — regions re-drawn for the new screen", action: "screenshot" },

  {
    name: "End the Day asks first — the confirm is up and the day has NOT ended",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const before = s.ink.view().day;
        const pill = s.children.list.find((o) => o.type === "Text" && o.text === "End day · E");
        if (!pill) return "no End-day pill";
        const bg = s.children.list.find((o) =>
          o.type === "Graphics" && o.depth === 99 && o.input && o.input.hitArea &&
          Math.abs(o.y + o.input.hitArea.height / 2 - pill.y) < 3 &&
          o.x < pill.x && o.x + o.input.hitArea.width > pill.x);
        if (!bg) return "no pill background behind the label";
        bg.emit("pointerdown");
        return {
          confirming: s.children.list.some((o) => o.type === "Text" && o.text === "End the day?"),
          dayUnchanged: s.ink.view().day === before,
        };
      })()`,
      equals: { confirming: true, dayUnchanged: true },
    },
  },
  { name: "the End-day confirm", action: "screenshot" },
];
