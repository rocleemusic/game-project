/**
 * collect-hud.mjs — visual check for the two mode5 CollectScene HUD changes
 * (Roc's 2026-08-19 screen-flow feedback, "collect-forage" markers).
 *
 * Boots mode5 → LocationSelectScene, clicks the Forager's Clearing start
 * thumbnail (the LOWER of day 1's two map thumbnails) to enter CollectScene,
 * then screenshots the HUD. Confirm from the shot:
 *   1. the top status header reads `day 1 · morning · Forager's Clearing`
 *      — the screen NAME, with no `moves …` / `satchel …` segments.
 *   2. the top-row nav buttons render as §14 gold Utility pills, not the old
 *      bracket text (`[ satchel — S ]` …).
 */
export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1200 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "let popIn entrances finish", action: "wait", ms: 600 },
  { name: "location-select (start layout)", action: "screenshot" },
  { name: "start at Forager's Clearing — the lower day-1 thumbnail", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  {
    name: "landed on Forager's Clearing (F1)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F1" },
  },
  { name: "collect-hud", action: "screenshot" },
];
