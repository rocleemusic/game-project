/** satchel-empty.mjs — visual check for empty-pocket hatch + Arms tab. Diagnostic only. */
export default [
  { name: "enter LocationSelectScene", action: "wait", ms: 800 },
  { name: "begin at Forager's Clearing (F1)", action: "click", x: 960, y: 490 },
  { name: "CollectScene ready", action: "wait", ms: 800 },
  { name: "open the satchel (no DEV unlock — day-one starting state)", action: "press", key: "KeyS" },
  { name: "let SatchelScene render", action: "wait", ms: 500 },
  { name: "satchel — mostly empty, day one", action: "screenshot" },
  { name: "click Arms tab", action: "click", x: 397, y: 940 },
  { name: "let tab redraw", action: "wait", ms: 200 },
  { name: "arms tab — empty", action: "screenshot" },
];
