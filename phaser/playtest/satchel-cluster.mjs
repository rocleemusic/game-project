/**
 * satchel-cluster.mjs — verification for the satchel-cluster track
 * (2026-08-23, Roc's review notes 1/35/36):
 *
 *   1. Pickup of a never-seen item pops the satchel open on its description
 *      (driven through the REAL `HotspotSystem.commitPickup` path, so the
 *      `onFirstPickup` wire is what opens the scene).
 *   2. Drop actually removes the item — including the banked-derived case
 *      the render-time re-join used to undo — and the dropped item lands on
 *      the current screen as a re-pickupable dot (`DroppedItemHotspots`).
 *   3. Satchel<->arms moves both ways, with the Arms tab carrying a live
 *      count.
 *
 * Coordinates are 1920x1080 game space (run with --viewport 1920x1080), same
 * as satchel-drop-move.mjs. Inspect-card action row: 3 buttons (Move /
 * To Arms / Drop It) split 520px from x=1106 -> centers 1189 / 1366 / 1542;
 * 2 buttons -> 1233 / 1498; all at y=836.
 */
export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 2500 },
  { name: "start at Forager's Clearing", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 4000 },

  // ---- 1. first pickup pops the satchel ---------------------------------
  {
    name: "commit a real pickup of a never-seen item through HotspotSystem",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        const offers = window.__collect.forage();
        if (!offers.length) return "no-offer";
        window.__satchelClusterPool = offers[0].item;
        sc.hotspotSys.commitPickup(offers[0], window.__collect.snapshot().screen);
        return "committed";
      })()`,
      equals: "committed",
    },
  },
  { name: "let SatchelScene launch and render", action: "wait", ms: 1500 },
  {
    name: "satchel popped open by the pickup",
    action: "expect",
    expect: { expression: `game.scene.isActive("SatchelScene")`, equals: true },
  },
  { name: "satchel open on the new item's description", action: "screenshot" },
  { name: "close the satchel", action: "press", key: "Escape" },
  { name: "let CollectScene resume", action: "wait", ms: 800 },

  // ---- 2. drop-to-world -------------------------------------------------
  { name: "reopen the satchel", action: "press", key: "KeyS" },
  { name: "let it render", action: "wait", ms: 1000 },
  { name: "select pocket 0", action: "click", x: 434, y: 325 },
  { name: "let the inspect card redraw", action: "wait", ms: 300 },
  { name: "three-button action row (Move / To Arms / Drop It)", action: "screenshot" },
  { name: "click Drop It", action: "click", x: 1542, y: 836 },
  { name: "confirm may arm", action: "wait", ms: 300 },
  { name: "click Confirm Drop (or no-op if already committed)", action: "click", x: 1542, y: 836 },
  { name: "let the drop commit", action: "wait", ms: 500 },
  {
    name: "drop stuck: not held, pocket cleared, landed on this screen",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        const screen = window.__collect.snapshot().screen;
        const held = sc.inventory.captureState().heldItemIds;
        const dropped = sc.inventory.droppedOn(screen);
        const slots = sc.ink.view().satchelSlots;
        return JSON.stringify({ heldCount: held.length, dropped: dropped.length, slot0: slots[0] });
      })()`,
      equals: '{"heldCount":1,"dropped":1,"slot0":null}',
    },
  },
  { name: "close the satchel", action: "press", key: "Escape" },
  { name: "let the screen redraw", action: "wait", ms: 1000 },
  { name: "dropped item lies in the world as a dusk dot", action: "screenshot" },

  // ---- 2b. re-pickup off the ground ------------------------------------
  {
    name: "take the dropped item back through DroppedItemHotspots' commit",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        const screen = window.__collect.snapshot().screen;
        const itemId = sc.inventory.droppedOn(screen)[0];
        sc.droppedHotspots.commitTakeBack(itemId, screen);
        const after = {
          dropped: sc.inventory.droppedOn(screen).length,
          heldAgain: sc.inventory.captureState().heldItemIds.length,
          slot0ok: sc.ink.view().satchelSlots[0] === window.__satchelClusterPool,
        };
        return JSON.stringify(after);
      })()`,
      equals: '{"dropped":0,"heldAgain":2,"slot0ok":true}',
    },
  },
  { name: "let the dot clear", action: "wait", ms: 600 },
  { name: "dropped dot gone after take-back", action: "screenshot" },

  // ---- 3. satchel<->arms ------------------------------------------------
  { name: "open the satchel again", action: "press", key: "KeyS" },
  { name: "let it render", action: "wait", ms: 1000 },
  { name: "select pocket 0", action: "click", x: 434, y: 325 },
  { name: "let the inspect card redraw", action: "wait", ms: 300 },
  { name: "click To Arms (middle button)", action: "click", x: 1366, y: 836 },
  { name: "let the move commit", action: "wait", ms: 400 },
  {
    name: "item moved to arms",
    action: "expect",
    expect: {
      expression: `(() => {
        const v = game.scene.getScene("CollectScene").ink.view();
        return JSON.stringify({ arms: v.arms.length, slot0: v.satchelSlots[0] });
      })()`,
      equals: '{"arms":1,"slot0":null}',
    },
  },
  { name: "Arms tab shows a live 1/2 count", action: "screenshot" },
  { name: "switch to the Arms tab", action: "click", x: 410, y: 940 },
  { name: "let the tab redraw", action: "wait", ms: 400 },
  { name: "arms item visible on the Arms tab", action: "screenshot" },
  { name: "select the arms pocket", action: "click", x: 434, y: 325 },
  { name: "let the inspect card redraw", action: "wait", ms: 300 },
  { name: "click To Satchel", action: "click", x: 1233, y: 836 },
  { name: "let the move commit", action: "wait", ms: 400 },
  {
    name: "item moved back to the satchel",
    action: "expect",
    expect: {
      expression: `(() => {
        const v = game.scene.getScene("CollectScene").ink.view();
        return JSON.stringify({ arms: v.arms.length, slot0ok: v.satchelSlots[0] === window.__satchelClusterPool });
      })()`,
      equals: '{"arms":0,"slot0ok":true}',
    },
  },
  { name: "back in the satchel", action: "screenshot" },
  { name: "close the satchel", action: "press", key: "Escape" },
  { name: "let CollectScene resume", action: "wait", ms: 600 },

  // ---- 2c. the banked-derived drop (the original reappear bug) ----------
  {
    name: "force a bank, then drop the banked-derived extra two-sidedly",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        sc.ink.player.bankSatchel();
        sc.ink.refresh(); // re-join re-gives the banked pool as a held extra
        const beforeHeld = sc.inventory.captureState().heldItemIds;
        return JSON.stringify({ banked: sc.ink.view().banked.length, held: beforeHeld.length });
      })()`,
      equals: '{"banked":1,"held":2}',
    },
  },
  { name: "open the satchel", action: "press", key: "KeyS" },
  { name: "let it render", action: "wait", ms: 1000 },
  {
    name: "find and select the banked-derived extra's pocket",
    action: "expect",
    expect: {
      expression: `(() => {
        const sat = game.scene.getScene("SatchelScene");
        // select whichever pocket is NOT the free captured sound
        const list = sat.pockets().list;
        const idx = list.findIndex((e) => e && e.pocket.id !== "item_captured_sound");
        if (idx === -1) return "not-found";
        sat.selected = idx;
        sat.redraw();
        return "selected";
      })()`,
      equals: "selected",
    },
  },
  { name: "let the inspect card redraw", action: "wait", ms: 300 },
  { name: "click Drop It (unslotted extra -> full-width row)", action: "click", x: 1366, y: 836 },
  { name: "confirm may arm", action: "wait", ms: 300 },
  { name: "click Confirm Drop", action: "click", x: 1366, y: 836 },
  { name: "let the drop commit and the re-join run", action: "wait", ms: 500 },
  {
    name: "the banked-derived drop STICKS now (the 2026-08-23 bug)",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        const screen = window.__collect.snapshot().screen;
        return JSON.stringify({
          held: sc.inventory.captureState().heldItemIds,
          banked: sc.ink.view().banked.length,
          dropped: sc.inventory.droppedOn(screen).length,
        });
      })()`,
      equals: '{"held":["item_captured_sound"],"banked":0,"dropped":1}',
    },
  },
  { name: "dropped for good — satchel shows only the free item", action: "screenshot" },
];
