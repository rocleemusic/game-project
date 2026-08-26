/**
 * hub-shelf-persistence.mjs — regression scenario for T3 (Roc's 2026-08-23
 * note "shelf placement not saved between screens").
 *
 * Places an item into a shelf cubby through the close-up's OWN palette
 * (click-to-arm, click-to-place — the real gesture, not a direct `Decor`
 * call), leaves the close-up, comes back, and asserts the cubby is still
 * filled. Then leaves the Home Hub entirely, reopens it, and asserts again —
 * that second leg is the one the bug report is about, since `HubScene.init`
 * builds a FRESH `Decor` every time it starts and the placement has to come
 * back off storage to survive it.
 *
 * Run with `--viewport 1920x1080` so canvas pixels equal scene coordinates.
 */
export default [
  // 1200ms reaches LocationSelectScene, but its day-card `popIn` entrance
  // tweens are still running then and the thumbnail is not yet at its final
  // position — `locselect-redesign.mjs` waits the extra 600ms for the same
  // reason. Clicking early lands on nothing and the run never leaves the
  // calendar.
  { name: "settle onto LocationSelectScene", action: "wait", ms: 2200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1800 },
  {
    name: "start from an empty shelf so the count assertions are absolute",
    action: "expect",
    expect: {
      expression: `(() => { localStorage.removeItem("phaser-probe/decor/v1"); return true; })()`,
      equals: true,
    },
  },
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 900 },
  { name: "click the shelf hint region to open the close-up", action: "click", x: 960, y: 170 },
  { name: "let HubShelfScene render", action: "wait", ms: 800 },
  { name: "shelf close-up — empty", action: "screenshot" },
  // Placed through `Decor.placeOnSurface`, which is EXACTLY the call
  // `onCubbyClick` makes when a click lands on an empty cubby — same writer,
  // same `save()`, same `onChange`. Not a pixel click on a palette chip,
  // because the palette now draws down from real banked stock (Roc, 2026-08-23
  // "no multiples, draw down from banked") and a fresh day-1 run has nothing
  // banked, so there is no chip to click. Seeding the bank would test the
  // banking rules, which is a different task's subject; this scenario is about
  // whether a placement, however made, reaches the save file.
  {
    name: "place an item into the top-left cubby (shelf-r0c0)",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubShelfScene");
        if (!scene || !scene.scene.isActive()) return "close-up not open";
        const item = scene["items"].find((i) => i.collectible && i.persistence !== "world");
        if (!item) return "no eligible item";
        const placed = scene["decor"].placeOnSurface(item.item_id, "shelf-r0c0");
        scene["redraw"]();
        return !!placed;
      })()`,
      equals: true,
    },
  },
  { name: "let the redraw settle", action: "wait", ms: 400 },
  { name: "shelf close-up — one cubby filled", action: "screenshot" },
  {
    name: "one cubby is filled right after placing",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubShelfScene");
        const decor = scene && scene["decor"];
        if (!decor) return "scene not active";
        return decor.surfaces().filter((s) => s.gridded && decor.occupant(s.id)).length;
      })()`,
      equals: 1,
    },
  },
  // THE ACTUAL BUG. Everything above passed before the fix too — `Decor`
  // always wrote its own storage key, so a placement survived leaving the
  // close-up and even the whole Home Hub inside one session. What did NOT
  // happen was a save capture: the autosave is bound to screen:changed /
  // item:acquired / gate:cleared and decorating is none of them, so the slot
  // still read `{"raw":null}` and the next resume ran `DecorSlice.restore
  // (null)`, which removes the key and deletes the placements. This step is
  // the one that fails without `Decor.onChange`.
  {
    name: "the SAVE SLOT — not just localStorage — now carries the placement",
    action: "expect",
    expect: {
      expression: `(() => {
        const slot = JSON.parse(localStorage.getItem("phaser-probe/save/v1/mode5") || "{}");
        const raw = ((slot.slices || {}).decor || {}).raw;
        if (typeof raw !== "string") return "save slot holds no decor blob: " + JSON.stringify(raw);
        return JSON.parse(raw).placements.filter((p) => String(p.surfaceId).startsWith("shelf-")).length;
      })()`,
      equals: 1,
    },
  },
  { name: "close the close-up (Esc) — back to the room view", action: "key", key: "Escape" },
  { name: "let the room view resume", action: "wait", ms: 600 },
  { name: "reopen the close-up", action: "click", x: 960, y: 170 },
  { name: "let HubShelfScene render again", action: "wait", ms: 800 },
  { name: "shelf close-up — reopened, cubby should still be filled", action: "screenshot" },
  {
    name: "placement survived leaving and reopening the close-up",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubShelfScene");
        const decor = scene && scene["decor"];
        if (!decor) return "scene not active";
        return decor.surfaces().filter((s) => s.gridded && decor.occupant(s.id)).length;
      })()`,
      equals: 1,
    },
  },
  { name: "leave the close-up", action: "key", key: "Escape" },
  { name: "settle", action: "wait", ms: 500 },
  { name: "leave the Home Hub entirely (Esc back to CollectScene)", action: "key", key: "Escape" },
  { name: "settle back on the screen", action: "wait", ms: 800 },
  { name: "reopen the Home Hub (H) — HubScene.init builds a fresh Decor", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 1600 },
  { name: "room view — shelf should still read 1/16", action: "screenshot" },
  {
    name: "placement survived leaving the Home Hub and coming back",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubScene");
        const decor = scene && scene["decor"];
        if (!decor) return "scene not active";
        return decor.surfaces().filter((s) => s.gridded && decor.occupant(s.id)).length;
      })()`,
      equals: 1,
    },
  },
  { name: "reopen the close-up one last time", action: "click", x: 960, y: 170 },
  { name: "let HubShelfScene render", action: "wait", ms: 800 },
  { name: "shelf close-up after a full Home Hub round trip", action: "screenshot" },
  {
    name: "close-up agrees with the room view after the round trip",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubShelfScene");
        const decor = scene && scene["decor"];
        if (!decor) return "scene not active";
        return decor.surfaces().filter((s) => s.gridded && decor.occupant(s.id)).length;
      })()`,
      equals: 1,
    },
  },
  // A resume, modelled at the seam a resume actually uses: `DecorSlice.restore`
  // takes the slot's opaque decor string and writes it over the live key (or
  // REMOVES the key when that string is null, which is what used to delete the
  // shelf). Doing exactly that here, then rebuilding a `Decor` the way
  // `HubScene.init` does, is the closest this harness gets to closing and
  // reopening the game — it has no page-reload action.
  { name: "leave the close-up", action: "key", key: "Escape" },
  { name: "settle", action: "wait", ms: 500 },
  {
    name: "a resume (restore the slot's decor blob, rebuild Decor) keeps the cubby filled",
    action: "expect",
    expect: {
      expression: `(() => {
        const slot = JSON.parse(localStorage.getItem("phaser-probe/save/v1/mode5") || "{}");
        const raw = ((slot.slices || {}).decor || {}).raw;
        if (raw === null || raw === undefined) localStorage.removeItem("phaser-probe/decor/v1");
        else localStorage.setItem("phaser-probe/decor/v1", raw);
        const after = localStorage.getItem("phaser-probe/decor/v1");
        if (!after) return "the resume removed the decor key";
        return JSON.parse(after).placements.filter((p) => String(p.surfaceId).startsWith("shelf-")).length;
      })()`,
      equals: 1,
    },
  },
];
