/**
 * mode5-traversal-regression.mjs — regression guard for the F1->F2 render
 * crash found while verifying step 7 (2026-08-17).
 *
 * `TraversalRow` asserted `describeGateRule(gateEngine.rules.get(id)!)` for
 * every blocking gate id. A *refused* gate (`G-F4-still`, `G-F8-combine` —
 * see §5 of the handoff) intentionally has no entry in `rules` while still
 * correctly blocking, so any screen offering a move toward F4 or F8 crashed
 * `render()` outright. Fixed via a filter in `TraversalRow.hintFor()`.
 *
 * Navigation uses `window.__collect.choose(index)` rather than a pixel
 * click. This is deliberate, not a shortcut: `choose()` drives ink's own
 * `runToChoice()`, which emits "view" -> `render()` — the exact same code
 * path a real click on the choice text takes. The crash was a render-time
 * bug, not an input-handling bug, so it reproduces identically either way,
 * and choosing by ink's own choice index avoids hand-measuring text-width
 * pixel offsets in `TraversalRow.draw()`, which is fragile by construction.
 *
 * The harness's own "no uncaught exceptions" / "no console errors" checks
 * are the real regression guard here — this crash would fail those outright
 * before any of this scenario's own assertions even run.
 */
export default [
  { name: "enter LocationSelectScene", action: "wait", ms: 800 },
  { name: "begin at Forager's Clearing (F1)", action: "click", x: 960, y: 490 },
  { name: "CollectScene ready", action: "wait", ms: 800 },
  {
    name: "F1 really does offer a move toward F2 (so this test exercises real navigation, not a no-op)",
    action: "expect",
    expect: {
      expression: `window.__collect.snapshot().choices.some((c) => c.kind === "move" && /Go to The Stream/.test(c.display))`,
      equals: true,
    },
  },
  {
    name: "take the move to F2 via the probe (same render() path a real click takes)",
    action: "expect",
    expect: {
      expression: `(() => {
        const move = window.__collect.snapshot().choices.find((c) => c.kind === "move" && /Go to The Stream/.test(c.display));
        window.__collect.choose(move.index);
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let render() run", action: "wait", ms: 300 },
  { name: "F2, no crash — this is the regression this scenario guards", action: "screenshot" },
  {
    name: "landed on F2 without crashing",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "F2" },
  },
  {
    name: "F2 really does offer a locked move toward the refused gate (so this test is actually exercising the bug, not a no-op)",
    action: "expect",
    expect: {
      expression: `window.__collect.snapshot().choices.some((c) => /Go to The Still Pool/.test(c.display))`,
      equals: true,
    },
  },
];
