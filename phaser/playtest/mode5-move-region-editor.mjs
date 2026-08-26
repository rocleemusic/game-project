/**
 * mode5-move-region-editor.mjs — GP-203's second palette
 * (`plans/2026-08-24-move-region-editor-plan.md`).
 *
 * T14 shipped clickable move regions and `regions.json`'s `moves` key, but
 * nothing could author that geometry, so every screen ran on
 * `MoveRegionPlacement`'s margin fallback. This proves the authoring side is
 * reachable: the `[ examinables | moves ]` kind chip is on screen, clicking it
 * flips the palette, and the move palette lists THIS SCREEN'S EXITS BY
 * DESTINATION SCREEN ID (F1 offers F2 / F3 / T1), each marked "(unshaped)"
 * because nothing has been authored yet.
 *
 * KNOWN LIMITATION, unchanged from `mode5-editmode.mjs`: this harness has no
 * drag/mouse-hold action (wait|key|press|click|hover|screenshot|expect — read
 * `tools/playtest.mjs`'s `runScenario` switch), and drawing a rect IS a drag.
 * The drag half of GP-203 was verified with a bespoke Playwright driver against
 * the same dev server — the box left its fallback margin for the drawn rect on
 * the same render, tracked the pan, and the export carried BOTH `screens` and a
 * populated `moves`. Covering it here needs a new harness action first.
 *
 * THE MODE PICKER STEP IS NOT OPTIONAL. `main.ts` boots into
 * `ModePickerScene`; every older mode5 scenario in this folder starts at the
 * day-start calendar and therefore never reaches `CollectScene` today (they
 * fail on a null scene). Run at the harness default viewport (1280x720) — the
 * clicks are CSS pixels against a FIT-scaled canvas.
 */

/** Every Text on CollectScene, as one string — how the chips are asserted. */
const TEXTS = `game.scene.getScene("CollectScene").children.list.filter(o => o.type === "Text").map(o => o.text).join("|")`;

export default [
  { name: "mode picker up", action: "wait", ms: 3500 },
  { name: "choose Mode 5", action: "click", x: 640, y: 587 },
  { name: "day-start calendar up", action: "wait", ms: 3500 },
  { name: "begin at Forager's Clearing (F1) — the SECOND card on Day 1", action: "click", x: 172, y: 458 },
  { name: "CollectScene ready", action: "wait", ms: 3000 },
  { name: "press Shift+E to enter edit mode", action: "press", key: "Shift+KeyE" },
  { name: "let the palette render", action: "wait", ms: 400 },
  {
    name: "edit mode is active",
    action: "expect",
    expect: { expression: `game.scene.getScene("CollectScene").editMode.isActive`, equals: true },
  },
  {
    name: "opens on the EXAMINABLES palette — the kind chip says so, and F1's declared region is listed",
    action: "expect",
    expect: { expression: `${TEXTS}.includes("[ examinables ]") && ${TEXTS}.includes("r_trail_signs")` },
  },
  {
    name: "the moves palette is NOT showing yet — no exit id on the palette row",
    action: "expect",
    expect: { expression: `${TEXTS}.includes("F2 (unshaped)")`, equals: false },
  },
  { name: "examinables palette", action: "screenshot" },
  { name: "click the `moves` kind chip", action: "click", x: 181, y: 58 },
  { name: "let the palette repaint", action: "wait", ms: 400 },
  {
    name: "the chip flipped — moves is the armed-kind now",
    action: "expect",
    expect: { expression: `${TEXTS}.includes("[ moves ]") && ${TEXTS}.includes("  examinables  ")` },
  },
  {
    name: "the palette is F1's THREE EXITS, keyed by destination screen id, all unshaped",
    action: "expect",
    expect: {
      expression: `["F2 (unshaped)","F3 (unshaped)","T1 (unshaped)"].every(t => ${TEXTS}.includes(t))`,
    },
  },
  {
    name: "and the examine ids are gone from the palette — one palette at a time",
    action: "expect",
    expect: { expression: `${TEXTS}.includes("r_trail_signs")`, equals: false },
  },
  { name: "moves palette", action: "screenshot" },
  { name: "arm the way to F2", action: "click", x: 76, y: 83 },
  { name: "let the palette repaint", action: "wait", ms: 400 },
  {
    name: "armed — the chip drops its `(unshaped)` suffix marker only after a rect exists, so it still reads F2",
    action: "expect",
    expect: { expression: `${TEXTS}.includes("F2 (unshaped)")` },
  },
  {
    name: "the status line names the armed exit, not a region",
    action: "expect",
    expect: { expression: `${TEXTS}.includes('editing the way to "F2"')` },
  },
  { name: "armed, awaiting a drag", action: "screenshot" },
  {
    name: "nothing was authored by arming alone — no geometry appears without a drag",
    action: "expect",
    expect: { expression: `JSON.stringify(game.scene.getScene("CollectScene").run.moveRegions)`, equals: "{}" },
  },
  { name: "press Shift+E to leave edit mode", action: "press", key: "Shift+KeyE" },
  {
    name: "edit mode is inactive again",
    action: "expect",
    expect: { expression: `game.scene.getScene("CollectScene").editMode.isActive`, equals: false },
  },
];
