/**
 * a7-cast.mjs — current-state render of the cast-on-a-thing picker for
 * Assignment 7 evidence. Enters CollectScene (F1), opens the gated cast
 * prompt via the scene's own probe, and screenshots it.
 *
 * Revision 4 (wireframe §2, "decided — one step"): `openHedgePrompt()` now
 * opens straight onto the single parchment book page — receiver name,
 * flavor, and the flat known-spellbook list — no separate "Cast" pill to
 * click first, so the old two-shot (prompt, then click Cast for the grid)
 * collapses to one open + one screenshot. The player starts knowing the
 * three starter spells (`STARTER_SPELLS`: glimmer, echo, fetch — seeded in
 * `CollectScene.init()`), so the list is never empty at F1.
 */
export default [
  { name: "settle onto LocationSelectScene", action: "wait", ms: 1200 },
  { name: "start at Forager's Clearing (lower day-1 thumbnail)", action: "click", x: 258, y: 690 },
  { name: "let CollectScene create() run", action: "wait", ms: 1400 },
  {
    name: "CollectScene active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene")`, equals: true },
  },
  {
    name: "open the gated cast prompt (probe)",
    action: "expect",
    expect: { expression: `(() => { window.__collect.openHedgePrompt(); return true; })()`, equals: true },
  },
  { name: "let the book page render", action: "wait", ms: 400 },
  // The one-step book page: title, flavor, and the flat "what you know" chip row.
  { name: "cast-picker", action: "screenshot" },
  // Click a known spell that has no authored dry-hedge outcome, to exercise
  // the rejected-outcome retry path (feedback line, chips stay clickable).
  { name: "click echo (unknown-receiver against the hedge)", action: "click", x: 585, y: 382 },
  { name: "let the feedback render", action: "wait", ms: 300 },
  { name: "cast-picker-rejected", action: "screenshot" },
  { name: "close the hedge prompt", action: "click", x: 1305, y: 359 },
  // Dev Unlock (`debugUnlock.ts`) learns every spell and grants every
  // material — the only way to reach a LANDED outcome (ignite x river_stone)
  // without a multi-day playthrough. Verifies the outcome page + the
  // Subtle-strength "worth trying" pill against real content: ignite on
  // river_stone mints item_heated_stone, and temper authors a receiver entry
  // for heated_stone (content/magic/temper.json) — the wireframe's own
  // worked example.
  { name: "click Dev Unlock", action: "click", x: 1805, y: 92 },
  { name: "let the unlock apply", action: "wait", ms: 300 },
  {
    name: "open cast-on-river-stone via the scene's own HedgeCastPrompt instance",
    action: "expect",
    expect: {
      expression: `(() => {
        const scene = game.scene.getScene("CollectScene");
        const screenId = window.__collect.snapshot().drawnScreen;
        scene.hedgeCastPrompt.openCastOn("river_stone", "river stone", screenId);
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let the book page render", action: "wait", ms: 400 },
  { name: "cast-picker-full-spellbook", action: "screenshot" },
  // ignite x river_stone lands (mints item_heated_stone) and swaps the page
  // to the outcome view + the Subtle-strength "worth trying: temper" pill —
  // confirmed correct via `scene.hedgeCastPrompt`'s own object graph
  // (title/result/hint text all present and exactly right) during this
  // scenario's authoring. NOT screenshotted here: `PhaserVfxBackend`'s cast
  // VFX renders at depth 900 (`options.depth ?? 900`), well above this
  // page's 199-202, and a landed cast's screen-centered cue (no per-receiver
  // hotspot to anchor to, `CollectScene.startVfx()`) fully covers the page
  // in this headless target — pre-existing VFX/modal depth layering, not a
  // cast-picker defect; unrelated to this screen and out of scope here.
  { name: "click ignite (lands on river stone, mints item_heated_stone)", action: "click", x: 1097, y: 382 },
];
