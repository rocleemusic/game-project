/**
 * hub.mjs — visual check for the Home Hub after the font pass: the "HOME HUB"
 * title should read in the serif DISPLAY face (role-corrected from mono), its
 * buttons/status in mono. Boots mode5 → LocationSelect → CollectScene, then
 * presses H to open the Home Hub and screenshots it.
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
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 900 },
  { name: "home-hub", action: "screenshot" },
];
