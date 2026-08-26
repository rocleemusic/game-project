/**
 * region-hover.mjs — the two 2026-08-23 region bugs, proved on screen.
 *
 * Note 42: authored regions were drawn only by edit mode, so outside it they
 * were invisible and dead. Here they render on Town Square (T1 — the one
 * screen with authored geometry), hover shows a cursor-following tooltip,
 * a one-second dwell marks the region seen, and a click hides the tooltip
 * WITHOUT removing the region.
 *
 * Note 43: the boxes are fractions of the PICTURE, so they travel with the
 * backdrop as it pans instead of staying nailed to the canvas. The last two
 * shots are the same region before and after a pan — compare where the box
 * sits relative to the painted arch, not relative to the frame.
 */
/**
 * VIEWPORT. Authored in the game's own 1920x1080 design space and scaled to
 * the run's viewport, because a 1920x1080 headless run crashes the renderer
 * on a loaded machine (the harness reports "Element is not attached to the
 * DOM" after the context is lost). Run it at 1280x720:
 *
 *   node tools/playtest.mjs --url <preview>/?mode=mode5 --viewport 1280x720
 *       --scenario playtest/region-hover.mjs --out .playtest/t2-regions
 */
const S = 1280 / 1920;
const at = (x, y) => ({ x: Math.round(x * S), y: Math.round(y * S) });

const ARCH_X = 977; // r_arch's centre at rest — regions.json T1, picture-space
const ARCH_Y = 534;

export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1400 },
  { name: "start at Town Square — the UPPER day-1 thumbnail", action: "click", ...at(258, 512) },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1600 },
  {
    name: "landed on Town Square (T1) — the only screen with authored regions",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "T1" },
  },
  { name: "regions drawn outside edit mode", action: "screenshot" },
  {
    name: "two region boxes exist, not zero",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").hotspotSys.regionSpots.length`,
      equals: 2,
    },
  },
  { name: "hover the arch region", action: "hover", ...at(ARCH_X, ARCH_Y) },
  { name: "let the tooltip build", action: "wait", ms: 250 },
  { name: "hover tooltip on the region", action: "screenshot" },
  { name: "rest on it past the one-second dwell", action: "wait", ms: 1100 },
  {
    name: "the dwell marked it seen",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").hotspotSys.seenRegionKeys().join(",")`,
      equals: "T1:r_arch",
    },
  },
  { name: "tooltip after the dwell — seen", action: "screenshot" },
  { name: "click it", action: "click", ...at(ARCH_X, ARCH_Y) },
  { name: "let the click settle", action: "wait", ms: 250 },
  {
    name: "the click dismissed the tooltip and kept the region",
    action: "expect",
    expect: {
      expression: `(() => { const h = game.scene.getScene("CollectScene").hotspotSys; return \`\${h.regionTip === undefined}|\${h.regionSpots.length}\`; })()`,
      equals: "true|2",
    },
  },
  { name: "after the click — no tooltip, region still there", action: "screenshot" },
  { name: "reach for the left edge so the picture pans", action: "hover", ...at(140, 540) },
  { name: "let the pan ease all the way over", action: "wait", ms: 1200 },
  {
    name: "the pan actually moved",
    action: "expect",
    expect: {
      expression: `Math.abs(game.scene.getScene("CollectScene").backdropSys.pan.offsetX) > 40`,
      equals: true,
    },
  },
  {
    name: "the region moved WITH the picture, by the pan offset",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const spot = s.hotspotSys.regionSpots[0];
        const p = s.backdropSys.pan.place(spot.baseX, spot.baseY);
        return Math.abs(spot.box.x - p.x) < 1.5 && Math.abs(spot.box.x - (960 + spot.baseX)) > 40;
      })()`,
      equals: true,
    },
  },
  { name: "panned — the box rides the painting", action: "screenshot" },
];
