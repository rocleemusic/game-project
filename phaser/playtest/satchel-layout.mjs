/**
 * satchel-layout.mjs — visual check for `SatchelScene` (mode5 Track 2a)
 * against `tools/screen-flow/mockups/satchel.html`. Diagnostic, not a
 * regression pin — screenshots only, for eyeballing the port against the
 * approved mockup.
 */
export default [
  { name: "enter LocationSelectScene", action: "wait", ms: 800 },
  { name: "begin at Forager's Clearing (F1)", action: "click", x: 960, y: 490 },
  { name: "CollectScene ready", action: "wait", ms: 800 },
  { name: "grant every material (DEV unlock) so the satchel has plenty to show", action: "press", key: "KeyU" },
  { name: "let the unlock resolve", action: "wait", ms: 300 },
  { name: "open the satchel", action: "press", key: "KeyS" },
  { name: "let SatchelScene render (SVG icons load)", action: "wait", ms: 600 },
  {
    name: "SatchelScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("SatchelScene")`, equals: true },
  },
  { name: "satchel open", action: "screenshot" },
];
