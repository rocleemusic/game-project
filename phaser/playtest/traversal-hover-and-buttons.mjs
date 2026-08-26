/**
 * traversal-hover-and-buttons.mjs — T6a verification (Roc's Group 2 notes):
 *
 *   1. Bracket buttons -> styled buttons. Nothing on a live screen renders a
 *      raw `[ ... ]` button label any more; the dev row, the HUD and every
 *      close control draw the §14 Utility pill from `ui/buttons.ts`.
 *   2. Locked traversal points get HOVER descriptions. Pointing at a locked
 *      pill shows its gate line; leaving hides it; the "?" still pins it.
 *
 * Starts the day at the first offered location and works on whatever locked
 * exit that screen carries — Town Square's Tavern/Inn is gated on `be evening`
 * from the first morning, so no multi-hop walk is needed to reach a locked
 * pill (`traversal-lock-label-verify.mjs` walks to F5 for the same shape).
 * Objects are driven through the real Phaser display list rather than pixel
 * coordinates, same convention as the other scenarios here.
 */
export default [
  { name: "day-start calendar up", action: "wait", ms: 4000 },
  { name: "day-start calendar — no bracket labels", action: "screenshot" },
  { name: "pick the day's first start location", action: "click", x: 172, y: 460 },
  { name: "CollectScene ready", action: "wait", ms: 3000 },
  {
    name: "a screen is drawn",
    action: "expect",
    expect: { expression: `typeof window.__collect.snapshot().drawnScreen === "string"`, equals: true },
  },
  {
    name: "NO scene text renders a raw bracket button label",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("CollectScene");
        return scene.children.list
          .filter((o) => o.type === "Text" && typeof o.text === "string")
          .map((o) => o.text)
          .filter((s) => /^\\s*\\[[^\\]]*\\]\\s*$/.test(s) && !s.startsWith("[needs:"));
      })()`,
      equals: [],
    },
  },
  {
    name: 'grab the locked pill, its "?" and its hover tooltip',
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("CollectScene");
        window.__qm = scene.children.list.find((o) => o.type === "Graphics" && o.depth === 101);
        window.__hint = scene.children.list.find(
          (o) => o.type === "Text" && typeof o.text === "string" && o.text.startsWith("[needs:")
        );
        window.__plate = scene.children.list.find((o) => o.type === "Graphics" && o.depth === 103);
        // The "?" sits just right of its own pill, vertically centred on it, so
        // the pill is the nearest depth-99 pill Graphics left of it ON THAT ROW.
        window.__pill = scene.children.list
          .filter(
            (o) =>
              o.type === "Graphics" &&
              o.depth === 99 &&
              o.input &&
              o.x < window.__qm.x &&
              Math.abs(o.y - window.__qm.y) < 40
          )
          .sort((a, b) => a.x - b.x)
          .pop();
        return !!(window.__qm && window.__hint && window.__plate && window.__pill);
      })()`,
      equals: true,
    },
  },
  {
    name: "at rest nothing is revealed (wireframe §5 still holds)",
    action: "expect",
    expect: {
      expression: `({ text: window.__hint.visible, plate: window.__plate.visible })`,
      equals: { text: false, plate: false },
    },
  },
  {
    name: "the hover coordinate below really is inside the locked pill",
    action: "expect",
    expect: {
      expression: `(() => {
        const b = window.__pill.input.hitArea;
        const px = 1540, py = 812;
        return px > window.__pill.x && px < window.__pill.x + b.width
          && py > window.__pill.y && py < window.__pill.y + b.height;
      })()`,
      equals: true,
    },
  },
  // A REAL pointer move, not a synthetic `emit("pointerover")` — Phaser's input
  // manager re-derives hover state every frame, so a synthetic event is undone
  // on the next tick and never survives to a screenshot.
  { name: "hover the locked pill", action: "hover", x: 1540, y: 812 },
  { name: "let the hover settle", action: "wait", ms: 400 },
  {
    name: "HOVER alone shows the gate description — no click needed",
    action: "expect",
    expect: {
      expression: `({ text: window.__hint.visible, plate: window.__plate.visible })`,
      equals: { text: true, plate: true },
    },
  },
  { name: "locked pill hovered — tooltip up", action: "screenshot" },
  { name: "move the pointer off the pill", action: "hover", x: 960, y: 300 },
  { name: "let the pointerout settle", action: "wait", ms: 400 },
  {
    name: "leaving hides it again",
    action: "expect",
    expect: {
      expression: `({ text: window.__hint.visible, plate: window.__plate.visible })`,
      equals: { text: false, plate: false },
    },
  },
  {
    name: 'hovering the "?" itself also shows it',
    action: "expect",
    expect: {
      expression: `(() => {
        window.__qm.emit("pointerover");
        const shown = window.__hint.visible;
        window.__qm.emit("pointerout");
        return { shown, afterLeave: window.__hint.visible };
      })()`,
      equals: { shown: true, afterLeave: false },
    },
  },
  {
    name: '"?" still PINS the tooltip open across a pointerout, with no fallthrough to the blocked-cast prompt',
    action: "expect",
    expect: {
      expression: `(() => {
        window.__qm.emit("pointerdown", {}, 0, 0, { stopPropagation: () => {} });
        window.__qm.emit("pointerout");
        const scene = game.scene.getScene("CollectScene");
        return { text: window.__hint.visible, modalOpen: scene.modalSys.isOpen };
      })()`,
      equals: { text: true, modalOpen: false },
    },
  },
  { name: "tooltip pinned via ?", action: "screenshot" },
  {
    name: '"?" again unpins',
    action: "expect",
    expect: {
      expression: `(() => {
        window.__qm.emit("pointerdown", {}, 0, 0, { stopPropagation: () => {} });
        return window.__hint.visible;
      })()`,
      equals: false,
    },
  },
  {
    name: "open the satchel — its close control is a styled pill, not [ Close — Esc ]",
    action: "expect",
    expect: {
      expression: `(() => {
        game.scene.getScene("CollectScene").openSatchel();
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "satchel open", action: "wait", ms: 1200 },
  {
    name: "no bracket-label text anywhere in the satchel",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("SatchelScene");
        const out = [];
        scene.children.each((o) => {
          const walk = (n) => {
            if (n.type === "Text" && typeof n.text === "string" && /^\\s*\\[[^\\]]*\\]\\s*$/.test(n.text)) out.push(n.text);
            if (n.type === "Container") n.each(walk);
          };
          walk(o);
        });
        return out;
      })()`,
      equals: [],
    },
  },
  { name: "satchel — styled close pill", action: "screenshot" },
];
