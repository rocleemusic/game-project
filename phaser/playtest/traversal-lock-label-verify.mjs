/**
 * traversal-lock-label-verify.mjs — UI Verifier check for the
 * "traversal-lock-label" fix (wireframe §5): fiction-first label +
 * tap-to-reveal "?" for the raw gate hint.
 *
 * TWO THINGS MOVED UNDER THIS SCENARIO, NEITHER OF THEM ITS SUBJECT:
 *
 *   1. T14 (2026-08-24) turned the traversal PILL into a dashed move REGION on
 *      the painting (`render/MoveRegions.ts`; the pill row retired). The
 *      label, the hidden `[needs: ...]` line and the "?" pin came across
 *      whole, so every assertion below still holds — only the "?" Graphics'
 *      depth changed (101 on the old pill row, 11 on the region's label
 *      plate, which sits on the painting rather than over the HUD).
 *   2. Nothing else. RUN THIS AT THE HARNESS DEFAULT VIEWPORT (1280x720) — the
 *      click below is in CSS pixels against a FIT-scaled canvas, so at
 *      1920x1080 it lands on Town Square instead of Forager's Clearing and the
 *      whole walk starts from the wrong screen.
 *
 * Walks F1 -> The Grove (F3) -> Old-Growth Hollow (F5), the same 3-move path
 * the 2026-08-19 handoff verified for Track 1 ("F1 -> F3 -> F5"), where F5
 * offers moves toward F6/F7/F8, all still behind `G-F5-cascade`.
 *
 * The rendered pill/hint/qm objects are Phaser `Text`/`Graphics` drawn
 * straight onto the scene (not exposed via `window.__collect`, which only
 * carries ink's own choice data), so this scenario reads them directly off
 * `CollectScene.children.list` and drives the "?" control the same way the
 * project's own regression scenario drives moves: through the real object,
 * not hand-measured pixel coordinates (`mode5-traversal-regression.mjs`'s
 * header explains why that convention exists here).
 */
export default [
  { name: "enter LocationSelectScene", action: "wait", ms: 2000 },
  { name: "begin at Forager's Clearing (F1)", action: "click", x: 172, y: 460 },
  { name: "CollectScene ready", action: "wait", ms: 1800 },
  {
    name: "landed on F1",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F1" },
  },
  {
    name: "move to The Grove (F3)",
    action: "expect",
    expect: {
      expression: `(() => {
        const move = window.__collect.snapshot().choices.find((c) => c.kind === "move" && /Grove/.test(c.display));
        if (!move) return false;
        window.__collect.choose(move.index);
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let render() run", action: "wait", ms: 900 },
  {
    name: "landed on F3",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F3" },
  },
  {
    name: "move to Old-Growth Hollow (F5)",
    action: "expect",
    expect: {
      expression: `(() => {
        const move = window.__collect.snapshot().choices.find((c) => c.kind === "move" && /Hollow/.test(c.display));
        if (!move) return false;
        window.__collect.choose(move.index);
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let render() run", action: "wait", ms: 900 },
  {
    name: "landed on F5",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F5" },
  },
  {
    name: "F5 has a fiction-first locked-region label, a hidden [needs:...] hint, and a \"?\" control — stash refs on window",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("CollectScene");
        // The "?" is the one interactive Graphics with a CIRCLE hit area on
        // a move region's label plate (depth 11) — the region boxes' own
        // outlines are non-interactive Graphics at depth 10.
        window.__qm = scene.children.list.find(
          (o) => o.type === "Graphics" && o.depth === 11 && o.input
            && o.input.hitArea && typeof o.input.hitArea.radius === "number"
        );
        window.__hint = scene.children.list.find(
          (o) => o.type === "Text" && typeof o.text === "string" && o.text.startsWith("[needs:")
        );
        window.__label = scene.children.list.find(
          (o) => o.type === "Text" && typeof o.text === "string" && / — the way is blocked$/.test(o.text)
        );
        return !!(window.__qm && window.__hint && window.__label);
      })()`,
      equals: true,
    },
  },
  {
    name: "hint is hidden by default (raw gate rule not shown unasked)",
    action: "expect",
    expect: { expression: `window.__hint.visible`, equals: false },
  },
  { name: "F5 locked move regions, hint not yet revealed", action: "screenshot" },
  {
    name: "tap the \"?\" control (real pointerdown on the qm Graphics object, stopPropagation included) — hint reveals, no fallthrough to the locked-cast prompt",
    action: "expect",
    expect: {
      expression: `(() => {
        window.__qm.emit("pointerdown", {}, 0, 0, { stopPropagation: () => {} });
        const scene = game.scene.getScene("CollectScene");
        return { hintVisible: window.__hint.visible, modalOpen: scene.modalSys.isOpen };
      })()`,
      equals: { hintVisible: true, modalOpen: false },
    },
  },
  { name: "F5 locked move regions, hint revealed", action: "screenshot" },
  {
    name: "tap \"?\" again — hint hides (toggles both ways)",
    action: "expect",
    expect: {
      expression: `(() => {
        window.__qm.emit("pointerdown", {}, 0, 0, { stopPropagation: () => {} });
        return window.__hint.visible;
      })()`,
      equals: false,
    },
  },
];
