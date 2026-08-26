/**
 * t6f-font-consistency-hub.mjs — the Home Hub half of the T6f font pass.
 *
 * The Hub carried the widest drift: full explanatory sentences (the palette
 * hint, the "nothing banked yet" empty state) rendered in mono right beside
 * item names in serif, and the shelf close-up labelled its cubby items in mono
 * while the room labelled the same items in serif. Both now follow
 * `ui/theme.ts`'s rule — sentences and names display, counts and pills mono.
 */

const AUDIT = `(() => {
  window.__fonts = (key) => {
    const scene = game.scene.getScene(key);
    const out = [];
    const walk = (n) => {
      if (n.type === "Text" && typeof n.text === "string" && n.text.trim()) {
        out.push({ text: n.text, font: n.style.fontFamily });
      }
      if (n.type === "Container") n.each(walk);
    };
    scene.children.each(walk);
    return out;
  };
  window.__fontOf = (key, needle) => {
    const hit = window.__fonts(key).find((t) => t.text.includes(needle));
    return hit ? hit.font : null;
  };
  window.__others = (key) =>
    window.__fonts(key).filter((t) => t.font !== "Georgia, serif" && t.font !== "monospace").map((t) => t.font);
  return true;
})()`;

export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1600 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1800 },
  { name: "open Home Hub (H)", action: "key", key: "H" },
  { name: "let the hub render", action: "wait", ms: 1200 },
  { name: "install the display-list font audit", action: "expect", expect: { expression: AUDIT, equals: true } },
  {
    name: "hub: the palette hint / empty-state sentences read as prose; counts and pills stay mono",
    action: "expect",
    expect: {
      expression: `(() => {
        const sentence =
          window.__fontOf("HubScene", "drag one into the room") ??
          window.__fontOf("HubScene", "Nothing banked at home yet") ??
          window.__fontOf("HubScene", "Everything banked is placed") ??
          window.__fontOf("HubScene", "Nothing found yet");
        return {
          sentence,
          zoomReadout: window.__fontOf("HubScene", "%"),
          surfaceLabel: window.__fontOf("HubScene", "high shelf"),
          strays: window.__others("HubScene"),
        };
      })()`,
      equals: {
        sentence: "Georgia, serif",
        zoomReadout: "monospace",
        surfaceLabel: "monospace",
        strays: [],
      },
    },
  },
  { name: "home hub — hint prose serif, readouts and pills mono", action: "screenshot" },

  // y=170 — `drawShelfHint`'s box starts higher, but `roomCamera`'s viewport
  // begins at ROOM_AREA_TOP (160) and clips anything above it. Same
  // coordinate `hub-shelf-closeup.mjs` uses.
  { name: "click the shelf hint region to open the close-up", action: "click", x: 960, y: 170 },
  { name: "let the shelf render", action: "wait", ms: 1200 },
  {
    name: "place one item so a cubby carries a real item name",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("HubShelfScene");
        if (!scene || !scene.scene.isActive()) return false;
        const eligible = scene["items"].find((i) => i.collectible && i.persistence !== "world");
        if (!eligible) return false;
        const placed = scene["decor"].placeOnSurface(eligible.item_id, "shelf-r0c0");
        scene["redraw"]();
        return !!placed;
      })()`,
      equals: true,
    },
  },
  { name: "let the redraw settle", action: "wait", ms: 400 },
  {
    name: "shelf: title and hint prose serif, the filled-count and remove pill mono",
    action: "expect",
    expect: {
      expression: `({
        title: window.__fontOf("HubShelfScene", "Home Hub · Shelf"),
        hint: window.__fontOf("HubShelfScene", "onto an empty cubby"),
        count: window.__fontOf("HubShelfScene", "cubbies filled"),
        closePill: window.__fontOf("HubShelfScene", "Close"),
        strays: window.__others("HubShelfScene"),
      })`,
      equals: {
        title: "Georgia, serif",
        hint: "Georgia, serif",
        count: "monospace",
        closePill: "monospace",
        strays: [],
      },
    },
  },
  { name: "hub shelf — item names and hints serif, chrome mono", action: "screenshot" },
];
