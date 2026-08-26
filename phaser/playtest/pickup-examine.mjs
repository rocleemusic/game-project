/**
 * pickup-examine.mjs — visual + functional check for the forage-hotspot
 * examine card (mode5 UX wireframe §1, "Pickup" — 2026-08-22 fix).
 *
 * Boots mode5 -> LocationSelectScene, clicks the Forager's Clearing start
 * thumbnail to enter CollectScene, then drives the guaranteed "sticks"
 * forage hotspot through hover -> take,
 * using `window.__collect.forage()` (slotId/item) plus each dot's own
 * `slotId` data tag (`HotspotSystem.sync()`) to find the exact GameObject,
 * so the hover is a real `pointerover` on the real interactive dot rather
 * than a guessed screen coordinate (the dot's screen position depends on
 * `PanModel`, not just a static layout).
 *
 * Confirms from the shots + expectations:
 *   1. hovering an undiscovered item's hotspot shows the mystery card —
 *      "???" name, "not sure what this is — pick it up to find out".
 *   2. once `Inventory.discoveredIds()` already has the item (seeded here
 *      via the scene's own `inventory.give`, same as a real prior pickup
 *      would), the SAME hotspot's card shows the real name/description.
 *   3. clicking through (pointerdown on the dot, which is only wired to
 *      commit once its card is already showing) actually books the pickup —
 *      the slot drops out of `window.__collect.forage()`.
 */
export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1200 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "let popIn entrances finish", action: "wait", ms: 600 },
  { name: "start at Forager's Clearing — the lower day-1 thumbnail", action: "click", x: 173, y: 458 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene is active, landed on F1",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F1" },
  },
  {
    name: "find the guaranteed 'sticks' dot and hover it (pointerover)",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("CollectScene");
        const slot = window.__collect.forage().find((s) => s.item === "item_sticks");
        if (!slot) return "no-sticks-slot";
        const dot = scene.children.list.find(
          (o) => o.type === "Arc" && o.getData && o.getData("slotId") === slot.slotId,
        );
        if (!dot) return "no-dot";
        window.__testSlotId = slot.slotId;
        window.__testDot = dot;
        dot.emit("pointerover");
        return "ok";
      })()`,
      equals: "ok",
    },
  },
  { name: "let the mystery card pop in", action: "wait", ms: 250 },
  { name: "pickup-examine-mystery", action: "screenshot" },
  {
    name: "leave the dot (schedules the card's hide)",
    action: "expect",
    expect: { expression: `(() => { window.__testDot.emit("pointerout"); return "ok"; })()`, equals: "ok" },
  },
  { name: "let the hide-delay grace window elapse", action: "wait", ms: 250 },
  {
    name: "card is gone after the grace window",
    action: "expect",
    expect: {
      // depth 15 is the examine card's own container — CollectScene has
      // other, unrelated Container objects live at all times (HUD chrome
      // etc.), so a bare "any Container exists" check would be a false
      // positive regardless of this card's state.
      expression: `game.scene.getScene("CollectScene").children.list.some((o) => o.type === "Container" && o.depth === 15)`,
      equals: false,
    },
  },
  {
    name: "seed discovery (simulating a real prior pickup) and re-hover",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("CollectScene");
        scene.inventory.give("item_sticks");
        window.__testDot.emit("pointerover");
        return "ok";
      })()`,
      equals: "ok",
    },
  },
  { name: "let the known card pop in", action: "wait", ms: 250 },
  { name: "pickup-examine-known", action: "screenshot" },
  {
    name: "click the dot again — card already showing, so this commits the take",
    action: "expect",
    expect: { expression: `(() => { window.__testDot.emit("pointerdown"); return "ok"; })()`, equals: "ok" },
  },
  { name: "let ink.refresh()'s re-render settle", action: "wait", ms: 400 },
  {
    name: "the slot is gone from the live forage offer — the pickup actually landed",
    action: "expect",
    expect: {
      expression: `window.__collect.forage().some((s) => s.slotId === window.__testSlotId)`,
      equals: false,
    },
  },
  { name: "pickup-examine-after-take", action: "screenshot" },
];
