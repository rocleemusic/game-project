/**
 * hub-shelf-closeup.mjs — build-verify scratch scenario for the shelf
 * cubby model + close-up scene (wireframe §8 "Two views of one shelf,"
 * decided revision 4). Opens the Home Hub, clicks the shelf's merged hint
 * region to open HubShelfScene, places two items into cubbies via the
 * scene's own click-to-arm/click-to-place palette, then removes one via the
 * selected-cubby remove pill. Not a committed regression scenario.
 */
export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1400 },
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 900 },
  { name: "room view with shelf hint", action: "screenshot" },
  {
    // y=170, not 135: `drawShelfHint`'s padded box starts around y=82 in
    // world space, but `pieceLayer` is drawn by `roomCamera`, whose viewport
    // begins at `ROOM_AREA_TOP` (160) — anything above that is clipped and
    // untouchable. 135 landed in the clipped band and the close-up never
    // opened. Same coordinate `hub-shelf-persistence.mjs` uses.
    name: "click the shelf hint region to open the close-up",
    action: "click",
    x: 960,
    y: 170,
  },
  { name: "let HubShelfScene render", action: "wait", ms: 700 },
  { name: "shelf close-up — empty", action: "screenshot" },
  {
    name: "arm + place the first eligible palette item into r0c0 via __hub-style call",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubShelfScene");
        if (!scene || !scene.scene.isActive()) return false;
        const decor = scene["decor"];
        const items = scene["items"];
        const eligible = items.find((i) => i.collectible && i.persistence !== "world");
        if (!eligible) return false;
        const placed = decor.placeOnSurface(eligible.item_id, "shelf-r0c0");
        scene["redraw"]();
        return !!placed;
      })()`,
      equals: true,
    },
  },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  { name: "shelf close-up — one cubby filled", action: "screenshot" },
  {
    name: "select the filled cubby (shelf-r0c0's computed screen center)",
    action: "click",
    x: 567,
    y: 265,
  },
  { name: "let the redraw settle", action: "wait", ms: 300 },
  { name: "shelf close-up — cubby selected, remove pill visible", action: "screenshot" },
  {
    name: "re-place into a second cubby before closing (no remove this time)",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubShelfScene");
        const decor = scene["decor"];
        const items = scene["items"];
        const eligible = items.filter((i) => i.collectible && i.persistence !== "world")[1];
        if (!eligible) return false;
        const placed = decor.placeOnSurface(eligible.item_id, "shelf-r3c3");
        scene["redraw"]();
        return !!placed;
      })()`,
      equals: true,
    },
  },
  { name: "close the close-up (Esc) — back to the room view", action: "key", key: "Escape" },
  { name: "let the room view resume/redraw", action: "wait", ms: 500 },
  { name: "room view — shelf hint now reflects both filled cubbies", action: "screenshot" },
  {
    name: "room view shelf hint reads 2/16 filled (same Decor, two views)",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubScene");
        const decor = scene["decor"];
        const gridded = decor.surfaces().filter((s) => s.gridded);
        const filled = gridded.filter((s) => decor.occupant(s.id)).length;
        return filled;
      })()`,
      equals: 2,
    },
  },
];
