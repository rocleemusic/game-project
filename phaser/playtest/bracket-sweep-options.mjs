/**
 * bracket-sweep-options.mjs — T6a follow-up: the Options board's footer
 * controls carried literal `[ Reset Category ]` / `[ Done · Esc ]` labels
 * inside their own pill chrome (brackets on top of a button). Confirms the
 * labels are bracket-free now and the board still draws and closes.
 */
export default [
  { name: "day-start calendar up", action: "wait", ms: 4000 },
  { name: "pick the day's first start location", action: "click", x: 172, y: 460 },
  { name: "CollectScene ready", action: "wait", ms: 3000 },
  {
    name: "open Options",
    action: "expect",
    expect: {
      expression: `(() => { game.scene.getScene("CollectScene").openOptions(); return true; })()`,
      equals: true,
    },
  },
  { name: "options board up", action: "wait", ms: 1200 },
  {
    name: "no bracket-label text anywhere on the Options board",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("OptionsScene");
        const out = [];
        const walk = (n) => {
          if (n.type === "Text" && typeof n.text === "string" && /^\\s*\\[[^\\]]*\\]\\s*$/.test(n.text)) out.push(n.text);
          if (n.type === "Container") n.each(walk);
        };
        scene.children.each(walk);
        return out;
      })()`,
      equals: [],
    },
  },
  { name: "options footer — bracket-free labels", action: "screenshot" },
];
