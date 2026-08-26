/**
 * npc-talk-modal.mjs — visual check for the §14 migration of the NPC-talk modal
 * (NpcTalkSystem: openNpcSpells body prose → display serif + §14 choice pills;
 * drawCast portrait frames → COLOR tokens).
 *
 * Boots mode5 → LocationSelectScene, clicks the Forager's Clearing start
 * thumbnail (the LOWER of day 1's two map thumbnails) to enter CollectScene
 * (F1), where the soul portrait row renders — screenshot 1 shows the tokenized
 * portrait frames. Then opens the spell-clue modal for a present, roled soul
 * through the built-in `window.__collect.openNpcSpells(...)` probe (the exact
 * method under test; the F1 portrait is hard to hit by pixel headless, and the
 * probe drives the real code path). Confirm from the shots:
 *   1. portrait frames: night fill, gold stroke on roled souls (no raw hex).
 *   2. modal body: the clue / "nothing new" prose reads in the Georgia serif
 *      (display), and the take-gift / offerable-spell rows render as §14 choice
 *      pills (rounded panel fill, gold hairline border) — not bare mono text.
 */
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
  { name: "npc-talk-01-portrait-row", action: "screenshot" },
  {
    // Open the spell-clue modal through the built-in probe. `openNpcSpells(soul)`
    // no-ops for a roleless soul and F1's present soul (bex) has no role, so we
    // drive it with `toby` — a Baker. roleFor() reads the graph's role_tag, not
    // presence, so the modal (the exact code under test) builds from the Baker's
    // spell set regardless of who is standing on F1. Returns the soul id opened.
    name: "open the NPC-talk (Baker) modal via the probe",
    action: "expect",
    expect: {
      expression: `(() => { window.__collect.openNpcSpells("toby"); return "toby"; })()`,
      equals: "toby",
    },
  },
  { name: "let the modal popIn finish", action: "wait", ms: 500 },
  {
    // The modal panel/filigree/heading/prose/pills/close all sit at depth >= 200
    // on CollectScene's own display list. A healthy open modal is many objects;
    // this proves it actually rendered rather than silently no-opening.
    name: "the modal rendered (depth>=200 objects on CollectScene)",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        return sc.children.list.filter((o) => (o.depth ?? 0) >= 200).length;
      })()`,
      atLeast: 3,
    },
  },
  { name: "npc-talk-02-modal-body", action: "screenshot" },
];
