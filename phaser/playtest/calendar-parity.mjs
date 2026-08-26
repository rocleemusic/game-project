/**
 * calendar-parity.mjs — verification for T4, Roc's 2026-08-23 calendar ruling.
 *
 * THE RULING: one calendar. It is ACTIVE (a location picker — forest/town) only
 * at the start of a new day; every other time it is read-only reference. The
 * Home Hub's move-on button reads "Start the Next Day", not "Open the Calendar".
 *
 * THE BUG IT FIXES (Roc's note): "Home Hub calendar can't pick forest/town
 * (should match game-start behavior)". Before this, the hub calendar was
 * hard-read-only and the only live picks were the `TraversalRow` pills hidden
 * UNDERNEATH the overlay — nothing like the game-start picker.
 *
 * Reaches hub_night the same fast way `hub-open-calendar-fix.mjs` does: day 1
 * offers "[End the day]" at no move cost, taken through the probe as SETUP (not
 * the path under test). The hub pill itself is taken through the real VN
 * keypress (`DialogueSystem` binds 1-9 to `pick(index)`), and the calendar's
 * thumbnail is taken by a REAL CLICK at canvas coordinates — so both halves of
 * the fix run through actual input, not a scripted `choose()`.
 *
 * Coordinates are game-space because the runner is driven at `--viewport
 * 1920x1080` (package.json's `playtest` script), where the canvas is 1:1.
 * Today's card for day 2 sits at x = 610 (cardW 320, gap 30, five days centered
 * on 1920); `CalendarScene`'s picker slots are y = 512 / 686, mirroring
 * `LocationSelectScene` exactly — that mirroring is the parity being checked.
 */

/** Recursive text scan — VN pills live inside containers, not on the root list. */
const TEXTS_IN = (sceneKey) => `(() => {
  const s = game.scene.getScene(${JSON.stringify(sceneKey)});
  if (!s) return [];
  const out = [];
  const walk = (list) => list.forEach((o) => {
    if (typeof o.text === "string") out.push(o.text);
    if (o.list) walk(o.list);
  });
  walk(s.children.list);
  return out;
})()`;

export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1200 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "game-start-picker-day-1", action: "screenshot" },
  { name: "start at Forager's Clearing — the lower day-1 thumbnail (shared addThumbButton)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene is active — the shared thumbnail button still works in the game-start picker",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  {
    name: "SETUP (not the path under test): take day 1's free [End the day] via the probe",
    action: "expect",
    expect: {
      expression: `(() => {
        const c = window.__collect.snapshot().choices.find((c) => c.kind === "move" && c.display === "[End the day]");
        if (!c) return false;
        window.__collect.choose(c.index);
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let render() land on Home Hub", action: "wait", ms: 600 },
  {
    name: "landed on HOME",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().screen`, equals: "HOME" },
  },
  { name: "advance past hub_night's narration line (Space) — reveals the choice pills", action: "key", key: "Space" },
  { name: "let the pills draw", action: "wait", ms: 500 },
  { name: "hub-night-pills-renamed", action: "screenshot" },
  {
    name: 'RENAME: the hub pill READS "[Start the Next Day]"',
    action: "expect",
    expect: {
      expression: `${TEXTS_IN("CollectScene")}.some((t) => t.includes("Start the Next Day"))`,
      equals: true,
    },
  },
  {
    name: 'RENAME: "Open the Calendar" is gone from the hub UI',
    action: "expect",
    expect: {
      expression: `${TEXTS_IN("CollectScene")}.some((t) => /open the calendar/i.test(t))`,
      equals: false,
    },
  },
  {
    name: "the ink choice itself now reads hub_night's renamed [Start the Next Day] (2026-08-24: renamed at the source, no display-layer indirection)",
    action: "expect",
    expect: {
      expression: `window.__collect.snapshot().choices.filter((c) => c.kind !== "move")[1]?.display`,
      equals: "[Start the Next Day]",
    },
  },
  { name: "take the second pill via a real VN keypress (DialogueSystem DIGITS)", action: "key", key: "2" },
  { name: "let CalendarScene launch in its ACTIVE state", action: "wait", ms: 900 },
  {
    name: "CalendarScene launched",
    action: "expect",
    expect: { expression: `game.scene.isActive("CalendarScene")`, equals: true },
  },
  {
    name: "ACTIVE: the calendar is a picker — header reads 'pick where the day begins', as the game-start screen does",
    action: "expect",
    expect: {
      expression: `${TEXTS_IN("CalendarScene")}.some((t) => /pick where the day begins/.test(t))`,
      equals: true,
    },
  },
  {
    name: "ACTIVE: forest AND town are both on offer, on TODAY's card",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${TEXTS_IN("CalendarScene")};
        return t.includes("Town Square") && t.includes("Forager's Clearing");
      })()`,
      equals: true,
    },
  },
  {
    name: "ACTIVE: two live (interactive) thumbnail buttons exist — this is the bug's fix",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CalendarScene").children.list.filter((o) => o.input && o.input.enabled && o.type === "Rectangle" && o.width > 200).length`,
      equals: 2,
    },
  },
  { name: "calendar-ACTIVE-day-start-picker", action: "screenshot" },
  { name: "hover the forest thumbnail — ember hover, same as the game-start picker", action: "hover", x: 610, y: 686 },
  { name: "let the hover state paint", action: "wait", ms: 250 },
  { name: "calendar-ACTIVE-hover-forest", action: "screenshot" },
  { name: "REAL CLICK on Forager's Clearing inside the calendar", action: "click", x: 610, y: 686 },
  { name: "let the pick advance ink and resume CollectScene", action: "wait", ms: 1200 },
  {
    name: "the calendar closed itself on the pick",
    action: "expect",
    expect: { expression: `game.scene.isActive("CalendarScene")`, equals: false },
  },
  {
    name: "THE FIX: picking forest INSIDE the calendar started day 2 at F1 — no TraversalRow pill needed",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().screen`, equals: "F1" },
  },
  { name: "day-2-started-at-forest-from-the-calendar", action: "screenshot" },
  { name: "reopen the calendar mid-day with L", action: "key", key: "L" },
  { name: "let the read-only calendar draw", action: "wait", ms: 900 },
  {
    name: "CalendarScene reopened",
    action: "expect",
    expect: { expression: `game.scene.isActive("CalendarScene")`, equals: true },
  },
  {
    name: "READ-ONLY: mid-day it is reference again — the picker header is gone",
    action: "expect",
    expect: {
      expression: `${TEXTS_IN("CalendarScene")}.some((t) => /read-only look at where you are/.test(t))`,
      equals: true,
    },
  },
  {
    name: "READ-ONLY: no interactive thumbnail buttons at all",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CalendarScene").children.list.filter((o) => o.input && o.input.enabled && o.type === "Rectangle" && o.width > 200).length`,
      equals: 0,
    },
  },
  { name: "calendar-READ-ONLY-mid-day", action: "screenshot" },
];
