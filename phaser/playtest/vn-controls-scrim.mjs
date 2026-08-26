/**
 * vn-controls-scrim.mjs — T6b: the two dialogue/scrim render-path fixes.
 *
 * 1. VN CONTROL BAR, GATED. `DialogueSystem.drawControlBar` used to paint
 *    Auto / Skip / Log / Hide UI / Options unconditionally, so five live hit
 *    rects sat over the level the whole time the player was exploring. It now
 *    rides `dialogueActive` — the same `pages OR choices` test the box itself
 *    uses. Shot 1 (explore) must show NO bar; shot 2 (in conversation) must.
 *
 * 2. THE BACKDROP SCRIM. A fixed 0.45 black wash hid the art under it. It is
 *    now `PlayerSettings.scrimAlpha` — default 0.2, floor 0, Options · Display
 *    → Scene Dimming. Asserted as ONE rectangle at the default alpha: the
 *    thing this file guards against is the scrim compounding to black by
 *    stacking a fresh rectangle per screen, so the count matters as much as
 *    the value.
 *
 * Boots mode5 → LocationSelectScene → the lower day-1 thumbnail (Forager's
 * Clearing, F1), same entry the npc-talk scenario uses.
 */

/** Visible VN control-bar labels inside the dialogue port's root container. */
const CONTROL_LABELS = `(() => {
  const sc = game.scene.getScene("CollectScene");
  const root = sc.children.list.find((o) => o.type === "Container" && o.depth === 150);
  if (!root) return -1;
  const labels = ["Auto", "Skip", "Log", "Hide UI", "Options"];
  return root.list.filter((o) => o.type === "Text" && o.visible && labels.includes(o.text)).length;
})()`;

/** Full-bleed scrim rectangles over the backdrop, by count and by alpha. */
const SCRIMS = `(() => {
  const sc = game.scene.getScene("CollectScene");
  return sc.children.list
    .filter((o) => o.type === "Rectangle" && o.width >= 1900 && o.height >= 1000)
    .map((o) => ({ alpha: o.fillAlpha, visible: o.visible }));
})()`;

export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1200 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "let popIn entrances finish", action: "wait", ms: 600 },
  { name: "start at Forager's Clearing — the lower day-1 thumbnail", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  {
    name: "landed on Forager's Clearing (F1)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F1" },
  },

  // --- 1. explore mode: no bar ---------------------------------------------
  {
    name: "no VN control labels while exploring",
    action: "expect",
    expect: { expression: CONTROL_LABELS, equals: 0 },
  },
  { name: "vn-01-explore-no-control-bar", action: "screenshot" },

  // --- 2. the scrim ---------------------------------------------------------
  {
    name: "exactly ONE full-bleed scrim — never a stack",
    action: "expect",
    expect: { expression: `${SCRIMS}.length`, equals: 1 },
  },
  {
    name: "the scrim sits at the lightened default, not the old 0.45",
    action: "expect",
    expect: { expression: `Math.round(${SCRIMS}[0].alpha * 100)`, equals: 20 },
  },
  {
    // The hazard, driven directly: `refreshScrim` is the call the Options
    // close hook fires, and ten of them must leave one rectangle at one alpha.
    // A version that added instead of assigned would read 0.2 -> 0.89 here.
    name: "ten refreshes do not compound — still one rect, still 0.20",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        for (let i = 0; i < 10; i++) sc.backdropSys.refreshScrim();
        const found = ${SCRIMS};
        return found.length + ":" + Math.round(found[0].alpha * 100);
      })()`,
      equals: "1:20",
    },
  },

  // --- 3. in conversation: the bar comes back ------------------------------
  {
    // `CollectScene.render` hands the VN layer the day only when NO choice on
    // offer is a move — that is its definition of "in conversation," and the
    // flat traversal row owns the screen otherwise. Ending the day walks to
    // HOME, whose choices are all deeds, which is the shortest deterministic
    // route into that state on a fresh save. (Souls' own talk scenes depend on
    // the week resolve and are not reachable on a fixed step count.)
    name: "end the day into HOME, where every choice is a deed",
    action: "expect",
    expect: {
      expression: `(() => {
        for (let i = 0; i < 10; i++) {
          const s = window.__collect.snapshot();
          if (s.drawnScreen === "HOME" && !s.choices.some((c) => c.kind === "move")) return "HOME";
          const end = s.choices.find((c) => /End the day/.test(c.display));
          if (!end) return s.drawnScreen + ":stuck";
          window.__collect.choose(end.index);
        }
        return "gave up";
      })()`,
      equals: "HOME",
    },
  },
  { name: "let the VN layer draw the incoming line", action: "wait", ms: 1200 },
  {
    name: "all five VN control labels are back with the conversation",
    action: "expect",
    expect: { expression: CONTROL_LABELS, equals: 5 },
  },
  { name: "vn-02-conversation-control-bar", action: "screenshot" },
];
