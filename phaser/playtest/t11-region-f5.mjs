/**
 * t11-region-f5.mjs — T11 region-authoring merge, verification shot for F5
 * (Old-Growth Hollow). Proves `r_great_trunk` (T11d's proposal,
 * regions.json) renders as a real hoverable hotspot over the tall
 * foregrounded trunk cluster in the backdrop art, not just editor-only
 * geometry.
 *
 * F5 is gated `G-F5-cascade` (no clearing spell exists yet — GateEngine's
 * own comment), reachable only via F3. The scenario presses the mode5
 * DEV-only `U` unlock (`debugUnlock.ts`) to force every gate open, then
 * walks F1 -> Go to The Grove (F3) -> Go to Old-Growth Hollow (F5).
 *
 * VIEWPORT: 1280x720 (canvas internal resolution 1920x1080, S ≈ 0.667):
 *
 *   node tools/playtest.mjs --url <preview>/?mode=mode5 --viewport 1280x720
 *       --scenario playtest/t11-region-f5.mjs --out .playtest/t11-f5
 */
const S = 1280 / 1920;
const at = (x, y) => ({ x: Math.round(x * S), y: Math.round(y * S) });

// r_great_trunk's box centre at rest, canvas-space — captured live via
// hotspotSys.regionSpots[0].box.{x,y}.
const TRUNK_X = 70;
const TRUNK_Y = 496;

export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 2000 },
  { name: "start at Forager's Clearing — the LOWER day-1 thumbnail", action: "click", x: 172, y: 458 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 2500 },
  {
    name: "landed on F1",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F1" },
  },
  { name: "dev-unlock every gate (G-F5-cascade included)", action: "press", key: "u" },
  { name: "let the unlock settle", action: "wait", ms: 500 },
  {
    name: "take the Go to The Grove move choice",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__collect.snapshot();
        const idx = s.choices.findIndex((c) => /grove/i.test(c.display));
        if (idx < 0) return "no-choice";
        window.__collect.choose(idx);
        return "ok";
      })()`,
      equals: "ok",
    },
  },
  { name: "let the move + scene sync settle", action: "wait", ms: 1500 },
  {
    name: "landed on F3 (The Grove)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F3" },
  },
  {
    name: "take the Go to Old-Growth Hollow move choice",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = window.__collect.snapshot();
        const idx = s.choices.findIndex((c) => /hollow/i.test(c.display));
        if (idx < 0) return "no-choice";
        window.__collect.choose(idx);
        return "ok";
      })()`,
      equals: "ok",
    },
  },
  { name: "let the move + scene sync settle", action: "wait", ms: 1500 },
  {
    name: "landed on F5 (Old-Growth Hollow)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F5" },
  },
  {
    name: "one region box exists on F5 — r_great_trunk",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").hotspotSys.regionSpots.map((r) => r.id).join(",")`,
      equals: "r_great_trunk",
    },
  },
  { name: "F5 landed — region box visible over the foreground trunk, unhovered", action: "screenshot" },
  { name: "hover the great-trunk region", action: "hover", ...at(TRUNK_X, TRUNK_Y) },
  { name: "let the tooltip build", action: "wait", ms: 300 },
  { name: "hover tooltip on r_great_trunk", action: "screenshot" },
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
