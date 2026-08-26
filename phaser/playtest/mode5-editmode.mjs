/**
 * mode5-editmode.mjs — Shift+E toggle + palette mount for `EditModeSystem`.
 *
 * THE KEY MOVED, 2026-08-24. T14 §1b put a player-facing "End day · E" pill on
 * the HUD bar, so the bare letter belongs to the player and the authoring
 * overlay took `Shift+E` (`CollectScene`/`render/HudBar.ts` split one
 * `keydown-E` listener each on `shiftKey`). The start-pick click below was
 * also stale — (960, 490) missed every day-1 card and the 800ms wait was far
 * short of the calendar's own build, so `CollectScene` never started and every
 * assertion here failed on a null scene. Both fixed in T14's playtest sweep.
 * Run at the harness default viewport (1280x720): the click is CSS pixels
 * against a FIT-scaled canvas.
 *
 * KNOWN LIMITATION: this harness has no drag/mouse-hold action (only
 * wait|key|press|click|screenshot|expect — confirmed by reading
 * `tools/playtest.mjs`'s `runScenario` switch in full). Drag-to-draw a
 * region rect is therefore NOT covered here and can't be without a new
 * action added to the harness itself. This scenario only proves what's
 * actually reachable: the system mounts on `CollectScene` (not `ScreenScene`
 * — see handoff §3 for why that distinction matters), starts inactive so
 * default play is unaffected, and `Shift+E` toggles it both ways.
 */
export default [
  { name: "enter the day-start calendar", action: "wait", ms: 4000 },
  { name: "begin at Forager's Clearing (F1) — the SECOND card on Day 1", action: "click", x: 172, y: 458 },
  { name: "CollectScene ready", action: "wait", ms: 3000 },
  {
    name: "edit mode constructed — mode5 declares \"edit-mode\" in its systems array",
    action: "expect",
    expect: { expression: `game.scene.getScene("CollectScene").editMode !== null`, equals: true },
  },
  {
    name: "starts inactive — default play is unaffected",
    action: "expect",
    expect: { expression: `game.scene.getScene("CollectScene").editMode.isActive`, equals: false },
  },
  { name: "press Shift+E to enter edit mode", action: "press", key: "Shift+KeyE" },
  { name: "let the palette render", action: "wait", ms: 200 },
  {
    name: "edit mode is now active",
    action: "expect",
    expect: { expression: `game.scene.getScene("CollectScene").editMode.isActive`, equals: true },
  },
  { name: "palette open", action: "screenshot" },
  { name: "press Shift+E to leave edit mode", action: "press", key: "Shift+KeyE" },
  {
    name: "edit mode is inactive again",
    action: "expect",
    expect: { expression: `game.scene.getScene("CollectScene").editMode.isActive`, equals: false },
  },
];
