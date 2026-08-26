/**
 * t11-region-f1.mjs — T11 region-authoring merge, verification shot for F1
 * (Forager's Clearing). Proves `r_trail_signs` (T11c's proposal,
 * regions.json) renders as a real hoverable hotspot near the foreground
 * path edge in the backdrop art, not just editor-only geometry.
 *
 * VIEWPORT: 1280x720 (canvas internal resolution 1920x1080, S ≈ 0.667):
 *
 *   node tools/playtest.mjs --url <preview>/?mode=mode5 --viewport 1280x720
 *       --scenario playtest/t11-region-f1.mjs --out .playtest/t11-f1
 */
const S = 1280 / 1920;
const at = (x, y) => ({ x: Math.round(x * S), y: Math.round(y * S) });

// r_trail_signs's box centre at rest, canvas-space — captured live via
// hotspotSys.regionSpots[0].box.{x,y}.
const SIGNS_X = 749;
const SIGNS_Y = 659;

export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 2000 },
  { name: "start at Forager's Clearing — the LOWER day-1 thumbnail", action: "click", x: 172, y: 458 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 2500 },
  {
    name: "landed on F1 (Forager's Clearing)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F1" },
  },
  {
    name: "one region box exists on F1 — r_trail_signs",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").hotspotSys.regionSpots.map((r) => r.id).join(",")`,
      equals: "r_trail_signs",
    },
  },
  { name: "F1 landed — region box visible on the path edge, unhovered", action: "screenshot" },
  { name: "hover the trail-signs region", action: "hover", ...at(SIGNS_X, SIGNS_Y) },
  { name: "let the tooltip build", action: "wait", ms: 300 },
  { name: "hover tooltip on r_trail_signs", action: "screenshot" },
  {
    name: "the hover actually registered as seen (real interactivity, not editor-only)",
    action: "expect",
    expect: {
      expression: `(() => {
        const h = game.scene.getScene("CollectScene").hotspotSys;
        return h.regionTip !== undefined;
      })()`,
      equals: true,
    },
  },
];
