/**
 * wait-button.mjs — T8 verification (Roc's Group 4 note, ruled 2026-08-24).
 *
 * "Wait" is a REAL INK CHOICE, not a host-side clock poke: `emitScreen`
 * (tools/resolver/src/ink.ts) emits it on every explorable screen as an exit
 * that leads back to the same screen, guarded exactly like a "Go to X"
 * (`movesLeft > 0 && TimeOfDay != night`) and running the same `emitMoveTo`
 * body. So a Wait must behave like every other time-consuming action:
 *
 *   1. it is offered on the hub, and reachable from the HUD;
 *   2. with moves left in the block, one Wait spends ONE move and the clock
 *      does not budge;
 *   3. the move that empties the block's budget rolls the clock to the next
 *      block and refills the budget — same as walking somewhere would.
 *
 * WHERE WAIT LIVES CHANGED, WHAT IT DOES DID NOT — T14, 2026-08-24. §1b of
 * `plans/2026-08-23-hud-relayout-ruling.md` moved Wait off the traversal pill
 * row (which retired with the rest of it) onto the HUD bar's fourth cluster as
 * a 44px tile with hotkey `W`. So the two clicks below now land on the TILE.
 * Every behavioural assertion — one move spent, clock unmoved, the second Wait
 * rolling the block — is byte-identical to before; only the thing being
 * clicked moved.
 *
 * Clicks are REAL pointer clicks on the control's own hit area (the coordinate
 * is asserted to be inside it first, so a moved control fails loudly rather
 * than silently clicking the backdrop), not `emit("pointerdown")` — the point
 * is to prove the thing a player touches does this.
 *
 * Day 1 starts at Town Square with a 3-move morning budget, one of which the
 * start pick itself already spent (`movesLeft` reads 2 on arrival), so two
 * Waits is exactly enough to reach the block boundary.
 */
export default [
  { name: "day-start calendar up", action: "wait", ms: 4000 },
  { name: "pick the day's first start location", action: "click", x: 172, y: 460 },
  { name: "CollectScene ready", action: "wait", ms: 3000 },

  {
    name: "the hub offers Wait, and the day has not moved yet",
    action: "expect",
    expect: {
      expression: `(() => {
        const v = game.scene.getScene("CollectScene").ink.view();
        return {
          offered: v.choices.some((c) => c.display === "[Wait]"),
          block: v.timeBlock,
          movesLeft: v.movesLeft,
        };
      })()`,
      equals: { offered: true, block: "morning", movesLeft: 2 },
    },
  },
  {
    name: "a Wait TILE is really drawn in the HUD bar's day-action cluster (T14 §1b)",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("CollectScene");
        // The tile is found by its in-tile hotkey letter, the one "W" on the
        // bar — then the 44px tile Graphics that letter sits inside.
        const hk = scene.children.list.find((o) => o.type === "Text" && o.text === "W" && o.y > 940);
        if (!hk) return "no W hotkey letter on the bar";
        window.__waitTile = scene.children.list.find(
          (o) => o.type === "Graphics" && o.depth === 99 && o.input && o.input.hitArea
            && o.input.hitArea.width === 44 && o.input.hitArea.height === 44
            && hk.x > o.x && hk.x <= o.x + 44 && hk.y > o.y && hk.y <= o.y + 44
        );
        return window.__waitTile ? "tile" : "hotkey letter with no tile behind it";
      })()`,
      equals: "tile",
    },
  },
  { name: "wait tile offered — day 1 morning, 2 moves left", action: "screenshot" },

  {
    name: "the click coordinate below is inside the Wait tile's hit area",
    action: "expect",
    expect: {
      expression: `(() => {
        const p = window.__waitTile, px = 1055, py = 1020;
        return px > p.x && px < p.x + p.input.hitArea.width
            && py > p.y && py < p.y + p.input.hitArea.height
          ? true
          : "tile is at " + Math.round(p.x) + "," + Math.round(p.y);
      })()`,
      equals: true,
    },
  },
  { name: "click Wait (real pointer)", action: "click", x: 1055, y: 1020 },
  { name: "let ink run", action: "wait", ms: 1200 },
  {
    name: "one Wait SPENT A MOVE and left the clock alone",
    action: "expect",
    expect: {
      expression: `(() => {
        const v = game.scene.getScene("CollectScene").ink.view();
        return { block: v.timeBlock, movesLeft: v.movesLeft, screen: v.pos.currentScreen };
      })()`,
      equals: { block: "morning", movesLeft: 1, screen: "T1" },
    },
  },
  { name: "after one Wait — still morning, 1 move left", action: "screenshot" },

  {
    name: "the Wait tile has NOT moved — a docked bar keeps its geometry across renders",
    action: "expect",
    expect: {
      expression: `(() => {
        const p = window.__waitTile, px = 1055, py = 1020;
        if (!p.scene) return "tile was destroyed between renders";
        return px > p.x && px < p.x + p.input.hitArea.width
            && py > p.y && py < p.y + p.input.hitArea.height ? "on the tile" : "tile moved";
      })()`,
      equals: "on the tile",
    },
  },
  { name: "click Wait again — the move that empties morning", action: "click", x: 1055, y: 1020 },
  { name: "let ink run", action: "wait", ms: 1200 },
  {
    name: "the budget-emptying Wait ADVANCED THE TIME OF DAY and refilled the budget",
    action: "expect",
    expect: {
      expression: `(() => {
        const v = game.scene.getScene("CollectScene").ink.view();
        return { block: v.timeBlock, movesLeft: v.movesLeft, screen: v.pos.currentScreen };
      })()`,
      equals: { block: "afternoon", movesLeft: 3, screen: "T1" },
    },
  },
  {
    name: "the HEADER the player reads says Afternoon — the clock moved on screen, not just in state",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").header.text`,
      equals: "Day 1 · Afternoon · Town Square",
    },
  },
  { name: "after the second Wait — the clock rolled to Afternoon", action: "screenshot" },
];
