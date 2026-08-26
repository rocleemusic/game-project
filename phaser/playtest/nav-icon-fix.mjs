/**
 * nav-icon-fix.mjs — one-off verification for the two NavRow fixes
 * (2026-08-22 fix pass): emoji glyphs replaced with gold/ember Graphics
 * glyphs, and the hover tooltip repositioned clear of CollectScene's
 * dev-only Edit/Dev-Unlock pill row underneath it.
 *
 * Boots mode5 -> LocationSelectScene, clicks the Forager's Clearing start
 * thumbnail to enter CollectScene, screenshots the idle HUD, then hovers
 * the Satchel nav icon (leftmost, gear cluster) and screenshots again to
 * confirm the tooltip clears the dev row.
 */
export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1200 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "let popIn entrances finish", action: "wait", ms: 600 },
  { name: "click Forager's Clearing thumbnail", action: "click", x: 173, y: 460 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  { name: "idle nav row", action: "screenshot" },
  // Icon tile centers are `rightX(=W-24) - total_cluster_width + …` per
  // `NavRow.build()` — at 1920 canvas width the Satchel tile (leftmost,
  // gear cluster) centers at ~x:1610,y:42. The prior x:1073,y:27 landed
  // nowhere near the row (fix-pass finding, 2026-08-23: the two "idle" and
  // "hovered" shots this scenario produced were pixel-identical because no
  // icon was ever actually hovered — see `.playtest/nav-icon-verify3` for
  // the corrected re-run that confirms the tooltip/lit-state really render).
  { name: "hover the Satchel icon (leftmost, gear cluster)", action: "hover", x: 1610, y: 42 },
  { name: "let hover paint + tooltip settle", action: "wait", ms: 300 },
  { name: "hovered — tooltip vs dev row", action: "screenshot" },
];
