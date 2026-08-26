/**
 * options-accessibility.mjs — visual check for the new Hint Strength
 * (segmented control) and Always Warn Before Dropping (toggle) rows on
 * `OptionsScene`'s Accessibility category. Diagnostic, not a regression pin.
 */
export default [
  { name: "enter LocationSelectScene", action: "wait", ms: 800 },
  { name: "begin at Forager's Clearing (F1)", action: "click", x: 260, y: 690 },
  { name: "CollectScene ready", action: "wait", ms: 800 },
  { name: "open Options", action: "press", key: "KeyO" },
  { name: "let OptionsScene render", action: "wait", ms: 300 },
  {
    name: "OptionsScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("OptionsScene")`, equals: true },
  },
  { name: "switch to Accessibility category (4th rail item)", action: "click", x: 416, y: 382 },
  { name: "let redraw settle", action: "wait", ms: 150 },
  { name: "Accessibility, default state (Subtle / off)", action: "screenshot" },
  { name: "click Generous segment", action: "click", x: 1255, y: 263 },
  { name: "let redraw settle", action: "wait", ms: 150 },
  {
    name: "hintStrength persisted as generous",
    action: "expect",
    expect: { expression: `localStorage.getItem("lantern:settings:hintStrength")`, equals: "generous" },
  },
  { name: "click Always Warn toggle", action: "click", x: 1244, y: 329 },
  { name: "let redraw settle", action: "wait", ms: 150 },
  {
    name: "dropConfirmAlways persisted as true",
    action: "expect",
    expect: { expression: `localStorage.getItem("lantern:settings:dropConfirmAlways")`, equals: "true" },
  },
  { name: "Accessibility, after clicking Generous + toggle on", action: "screenshot" },
];
