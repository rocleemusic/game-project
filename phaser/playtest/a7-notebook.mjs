/**
 * a7-notebook.mjs — current-state render of the notebook (leather-book
 * spellbook) for Assignment 7 evidence. Enters CollectScene (F1), presses N.
 */
export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  { name: "open Notebook (N)", action: "key", key: "N" },
  { name: "let the book render", action: "wait", ms: 900 },
  { name: "notebook-after", action: "screenshot" },
];
