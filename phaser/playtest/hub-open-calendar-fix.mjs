/**
 * hub-open-calendar-fix.mjs — regression guard for the "[Open the calendar]"
 * fix (Roc playtest finding, 2026-08-22).
 *
 * BEFORE: picking "[Open the calendar]" at Home Hub / hub_night only advanced
 * ink into === calendar === (a text-narrated destination pick) — CalendarScene
 * never launched. AFTER: `revealConversationChoices()` in `CollectScene.ts`
 * opens the real (read-only) `CalendarScene` ALONGSIDE the ink advance, so the
 * screen actually appears; the picker knot's own "Go to X" moves are already
 * rendered underneath (via `TraversalRow`, as always) the moment the player
 * closes it — one real picker, now with the real screen shown first.
 *
 * Reaches hub_night the fast way: day 1 offers "[End the day]" with no move
 * cost (screen_hub's own choice list), so one `__collect.choose()` call on
 * that MOVE choice — same code path a click takes, per
 * `mode5-traversal-regression.mjs`'s own reasoning — lands straight on
 * Home Hub. The "[Open the calendar]" pick itself, unlike that setup step, IS
 * driven through the real VN pill: a keypress on the dialogue box (Space) to
 * advance past the hub's narration line, then a digit key (Phaser's
 * `DialogueSystem` binds 1-9 to `pick(index)`) to take the SECOND pill —
 * exactly what a real click on "[Open the calendar]" would do, since
 * `__collect.choose()` bypasses `DialogueSystem` entirely and would not
 * exercise the fixed code path.
 */
export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1200 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "start at Forager's Clearing — the lower day-1 thumbnail", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  {
    name: "day 1 offers [End the day] at screen_hub with no move cost — take it via the probe (setup, not the code path under test)",
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
  { name: "let render() land on Home Hub", action: "wait", ms: 500 },
  {
    name: "landed on HOME (hub_night's narration line queued in the VN box)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().screen`, equals: "HOME" },
  },
  { name: "hub-night-narration", action: "screenshot" },
  { name: "advance past the narration line (Space) — reveals the two choice pills", action: "key", key: "Space" },
  { name: "let the pills draw", action: "wait", ms: 400 },
  { name: "hub-night-choice-pills", action: "screenshot" },
  {
    name: "second pill is [Start the Next Day] (pendingConvChoices order matches hub_night's own choice order; ink choice renamed 2026-08-24, was [Open the calendar] when this scenario was authored)",
    action: "expect",
    expect: {
      expression: `window.__collect.snapshot().choices.filter((c) => c.kind !== "move")[1]?.display`,
      equals: "[Start the Next Day]",
    },
  },
  {
    name: "take the SECOND pill via a real VN keypress — DialogueSystem's own DIGITS binding, the same input path a click takes",
    action: "key",
    key: "2",
  },
  { name: "let CalendarScene launch", action: "wait", ms: 700 },
  {
    name: "THE FIX: CalendarScene actually launched, not just an ink text knot",
    action: "expect",
    expect: { expression: `game.scene.isActive("CalendarScene")`, equals: true },
  },
  { name: "calendar-opened-from-hub-night", action: "screenshot" },
  { name: "close the calendar (Esc)", action: "key", key: "Escape" },
  { name: "let CollectScene resume", action: "wait", ms: 500 },
  {
    name: "CalendarScene closed, CollectScene resumed",
    action: "expect",
    expect: { expression: `game.scene.isActive("CalendarScene")`, equals: false },
  },
  {
    name: "the ink advance ALONGSIDE the calendar view already landed in the picker knot — its real 'Go to X' moves are there, rendered by TraversalRow",
    action: "expect",
    expect: {
      expression: `window.__collect.snapshot().choices.some((c) => c.kind === "move" && /Go to /.test(c.display))`,
      equals: true,
    },
  },
  { name: "destination-picker-after-calendar-close", action: "screenshot" },
];
