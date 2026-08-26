/**
 * satchel-drop-move.mjs — verification for the satchel drop/move track
 * (2026-08-22). Forages two REAL pool-backed items via `window.__collect`
 * (so both land in genuine `LanternPlayer.satchel` slots, not a DEV-unlock
 * grant, which would be Drop-only per `buildSatchelSlots`'s own rule), then
 * exercises: pocket select -> Move -> pick an empty pocket -> pocket select
 * -> Drop -> (confirm if warned) -> pocket goes empty.
 */
export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1400 },
  {
    name: "forage two real items into the satchel (pool-backed slots, not DEV unlock)",
    action: "expect",
    expect: {
      expression: `(() => {
        const offers = window.__collect.forage();
        const picked = [];
        for (const slot of offers.slice(0, 2)) {
          if (window.__collect.pickup(slot.slotId, slot.item)) picked.push(slot.item);
        }
        return picked.length;
      })()`,
      equals: 2,
    },
  },
  { name: "open the satchel", action: "press", key: "KeyS" },
  { name: "let SatchelScene render", action: "wait", ms: 500 },
  { name: "two real pockets, slots 0 and 1 occupied", action: "screenshot" },
  { name: "select pocket 0 (top-left)", action: "click", x: 434, y: 325 },
  { name: "let the inspect card redraw", action: "wait", ms: 200 },
  { name: "pocket 0 selected — Move + Drop It on the action row", action: "screenshot" },
  { name: "click Move", action: "click", x: 1233, y: 836 },
  { name: "let the move arm", action: "wait", ms: 200 },
  { name: "holding pill + armed pocket + Cancel Move", action: "screenshot" },
  { name: "place into an empty pocket (slot 3, bottom-left)", action: "click", x: 434, y: 557 },
  { name: "let the move commit and redraw", action: "wait", ms: 300 },
  { name: "moved — pocket 0 now empty, pocket 3 holds the item", action: "screenshot" },
  { name: "select the moved pocket (slot 3)", action: "click", x: 434, y: 557 },
  { name: "let the inspect card redraw", action: "wait", ms: 200 },
  { name: "click Drop It", action: "click", x: 1498, y: 836 },
  { name: "let confirm arm (or drop commit if no warning applies)", action: "wait", ms: 200 },
  { name: "drop — confirming or already-dropped state", action: "screenshot" },
  { name: "click Drop It / Confirm Drop again to guarantee commit", action: "click", x: 1498, y: 836 },
  { name: "let the drop commit and redraw", action: "wait", ms: 300 },
  { name: "dropped — pocket empty, item gone from the satchel", action: "screenshot" },
];
