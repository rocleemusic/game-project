/**
 * t11-region-t6.mjs — T11 region-authoring merge, verification shot for T6
 * (The Tavern / Inn). Proves `r_hearth` (T11b's proposal, regions.json)
 * renders as a real hoverable hotspot over the stone fireplace/mantel in the
 * backdrop art, not just editor-only geometry.
 *
 * T6 is gated `G-T6-evening`, connects only from T1 — the scenario presses
 * the mode5 DEV-only `U` unlock (`debugUnlock.ts`) to force every gate open
 * before choosing "Go to The Tavern / Inn", the same escape hatch the game's
 * own dev tooling exists for.
 *
 * VIEWPORT: 1280x720 (canvas internal resolution 1920x1080, S ≈ 0.667):
 *
 *   node tools/playtest.mjs --url <preview>/?mode=mode5 --viewport 1280x720
 *       --scenario playtest/t11-region-t6.mjs --out .playtest/t11-t6
 */
const S = 1280 / 1920;
const at = (x, y) => ({ x: Math.round(x * S), y: Math.round(y * S) });

// r_hearth's box centre at rest, canvas-space — captured live via
// hotspotSys.regionSpots[0].box.{x,y}.
const HEARTH_X = 339;
const HEARTH_Y = 603;

export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 2000 },
  { name: "start at Town Square — the UPPER day-1 thumbnail", action: "click", x: 172, y: 338 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 2500 },
  {
    name: "landed on T1",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "T1" },
  },
  { name: "dev-unlock every gate (G-T6-evening included)", action: "press", key: "u" },
  { name: "let the unlock settle", action: "wait", ms: 500 },
  {
    name: "take the Go to The Tavern / Inn move choice",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__collect.snapshot();
        const idx = s.choices.findIndex((c) => /tavern/i.test(c.display));
        if (idx < 0) return "no-choice";
        window.__collect.choose(idx);
        return "ok";
      })()`,
      equals: "ok",
    },
  },
  { name: "let the move + scene sync settle", action: "wait", ms: 1500 },
  {
    name: "landed on T6 (The Tavern / Inn)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "T6" },
  },
  {
    name: "two region boxes exist on T6 — r_hearth, r_ledger",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").hotspotSys.regionSpots.map((r) => r.id).sort().join(",")`,
      equals: "r_hearth,r_ledger",
    },
  },
  { name: "T6 landed — region box visible over the hearth, unhovered", action: "screenshot" },
  { name: "hover the hearth region", action: "hover", ...at(HEARTH_X, HEARTH_Y) },
  { name: "let the tooltip build", action: "wait", ms: 300 },
  { name: "hover tooltip on r_hearth", action: "screenshot" },
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
