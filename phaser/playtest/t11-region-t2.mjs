/**
 * t11-region-t2.mjs — T11 region-authoring merge, verification shot for T2
 * (Market Row). Proves `r_stall_goods` (T11a's proposal, regions.json)
 * renders as a real hoverable hotspot over the market stall goods in the
 * backdrop art, not just editor-only geometry.
 *
 * VIEWPORT: authored against a 1280x720 render (Phaser's internal canvas is
 * 1920x1080, CSS-scaled down — S = 1280/1920 ≈ 0.667). Run it at 1280x720:
 *
 *   node tools/playtest.mjs --url <preview>/?mode=mode5 --viewport 1280x720
 *       --scenario playtest/t11-region-t2.mjs --out .playtest/t11-t2
 */
const S = 1280 / 1920;
const at = (x, y) => ({ x: Math.round(x * S), y: Math.round(y * S) });

// r_stall_goods's box centre at rest (pan offset 0), canvas-space —
// captured live via hotspotSys.regionSpots[0].box.{x,y}.
const STALL_X = 843;
const STALL_Y = 861;

export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 2000 },
  { name: "start at Town Square — the UPPER day-1 thumbnail", action: "click", x: 172, y: 338 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 2500 },
  {
    name: "landed on T1",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "T1" },
  },
  {
    name: "take the Go to Market Row move choice",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__collect.snapshot();
        const idx = s.choices.findIndex((c) => /market row/i.test(c.display));
        if (idx < 0) return "no-choice";
        window.__collect.choose(idx);
        return "ok";
      })()`,
      equals: "ok",
    },
  },
  { name: "let the move + scene sync settle", action: "wait", ms: 1500 },
  {
    name: "landed on T2 (Market Row)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "T2" },
  },
  {
    name: "two region boxes exist on T2 — r_stall_goods, r_ex_shelf",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").hotspotSys.regionSpots.map((r) => r.id).sort().join(",")`,
      equals: "r_ex_shelf,r_stall_goods",
    },
  },
  { name: "T2 landed — region box visible over the stall goods, unhovered", action: "screenshot" },
  { name: "hover the stall-goods region", action: "hover", ...at(STALL_X, STALL_Y) },
  { name: "let the tooltip build", action: "wait", ms: 300 },
  { name: "hover tooltip on r_stall_goods", action: "screenshot" },
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
