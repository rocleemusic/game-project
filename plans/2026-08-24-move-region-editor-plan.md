# Build plan — Move-region authoring in the edit-mode editor

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the build plan and its proposed design calls, not the current state of the work.

**Written 2026-08-24. No prior ruling exists for this** — the gap was flagged the same day in
[_handoffs/2026-08-24-hud-relayout-build-handoff.md](_handoffs/2026-08-24-hud-relayout-build-handoff.md)
("Open — not this task's scope"): T14 shipped clickable move regions
(`phaser/src/render/MoveRegions.ts`) and the `"moves"` key in `regions.json`, but nothing can
author that geometry, so **every screen runs on the fallback layout**. Design calls below are
proposals with a recommendation each; the ones that need Roc are collected under
"Needs Roc's ruling before build".

---

## The gap, precisely

- `phaser/public/story/regions.json` and `lantern-projects/v01/regions.json` both carry
  `"moves": {}` — empty. The shape (established by
  `phaser/src/world/view/MoveRegionPlacement.ts`) is
  `{ fromScreenId: { destScreenId: {x,y,w,h} } }`, fractions of the picture, keyed by
  **destination screen id** — "from this screen, the way to T2 is this box."
- `phaser/src/render/MoveRegions.ts` consumes it at runtime and falls back to margin-stacked
  boxes when a screen has no authored rect. The fallback is load-bearing and stays — this plan
  adds authoring, it does not touch the fallback branch.
- The existing editor, `phaser/src/render/EditModeSystem.ts` (mode5, Shift+E — bare `E` went to
  the End-day pill on 2026-08-24), authors **examinable** regions only: palette of ids, arm one,
  drag a pan-corrected rect, live-commit into the run's region map, clipboard export of the whole
  `regions.json`. Its export already passes `moves` through untouched (fixed 2026-08-24), so the
  round-trip is safe — it just can't produce a move rect.

## Proposed shape: extend `EditModeSystem`, don't build a sibling

**Recommendation: one editor, two palettes.** Reasons, all read off the file itself:

- ~90% of the job is identical: the pan-corrected drag (`PanModel.unplace/place` — the
  correction Roc had to make once already, 2026-08-23 notes 42/43; a sibling tool would risk
  re-shipping that bug), `pixelDragToRegionRect` + `mergeRegions`
  (`phaser/src/world/view/RegionExport.ts`), the live-commit seam, the clipboard export.
- The two region kinds already live in one file (`regions.json`) with separate maps and separate
  id spaces (`r_*` region ids vs screen ids), so one export writing both is the natural shape —
  and is what the export already does.
- What differs is small: which map a committed rect lands in, which ids populate the palette,
  and the box colour (gold = examinable, dusk = move, matching runtime).

### Palette and mode toggle

- A kind-toggle chip at the left of the existing palette row: `[ examinables | moves ]`.
  Clicking flips which id set the palette shows. **No new keyboard shortcut** — the HUD bar owns
  `S N H L O W E` plus Shift+E already, and a dev overlay doesn't need to spend another key;
  clicking the chip is enough. (Open to Roc if he wants one anyway.)
- Arming is exclusive across both kinds: `armedId: string | null` becomes
  `armed: { kind: "examine" | "move"; id: string } | null`. One armed thing, one drag gesture,
  no collision — the drag path itself doesn't change at all.

### Where the move palette's ids come from

**Recommendation: the live hub choices, exactly as `MoveRegions.draw` reads them** — filter
`hubAction === "exit"`, map display text through `Gates.screenIdForName` to a destination id.
That is the same derivation the runtime consumer uses (`MoveRegions.ts` ~line 210), so the
editor and the renderer can never disagree about a screen's exit set, the same
"handed in rather than re-derived" argument `EditModeSystem.draw()`'s own header already makes
for examinable ids. This also answers the destination-assignment question for free: **the
palette chip IS the destination** — arm "T2", drag the box, done. Nothing is typed in, nothing
is name-matched.

What the editor does **not** author, on purpose: the label (runtime derives it from the choice
display), the gate logic (runtime derives it from `Gates`/`GateEngine` — a move region picks all
of that up in `MoveRegions.buildRegion` regardless of whether its rect was authored). The
authored artifact is geometry only, which is exactly all the `moves` map holds.

Known edge: at night or with zero moves the hub offers no exits, so the move palette would be
empty at those moments. Acceptable for a dev tool (walk to the screen in daytime to author it);
the alternative — union in the static `connects_to` neighbours from `run.graph.screens` — is
listed as an open call below rather than built speculatively.

### Concrete changes

| File | Change |
|---|---|
| `phaser/src/render/EditModeSystem.ts` | Second session map `editedMoves: RegionMap`; `armed` gains a kind; kind-toggle chip; move boxes drawn dusk; commit writes to the map matching the armed kind; export becomes `{ screens: mergeRegions(initialRegions, edited), moves: mergeRegions(moveRegions, editedMoves) }`. Roughly +80–120 lines on a 320-line file. |
| `phaser/src/scenes/CollectScene.ts` | Hand the editor the current exit inputs (same derivation as `MoveRegions.draw`); live-commit callback for a move rect writes into `run.moveRegions[screen]` (the same object `MoveRegions` reads via its `moveRects` dep) and calls `render()`, so the dashed box goes live immediately — the exact fix pattern the examinable side already shipped ("regions drawn in edit mode were dead the moment edit mode closed", Roc 2026-08-23). ~15 lines. |
| `phaser/src/world/view/RegionExport.ts` | Nothing — `mergeRegions` is already map-agnostic. |
| `phaser/tests/EditModeSystem.test.ts`, `phaser/tests/RegionExport.test.ts` | Cover: move commit lands in `editedMoves` not `edited`; export writes both maps; an untouched screen's move geometry passes through unchanged (the "never freeze unreviewed geometry" rule, now on both maps). |

Workflow stays what it is: clipboard export → human pastes into
`phaser/public/story/regions.json` **and** `lantern-projects/v01/regions.json` → rebuild.
No live write path to disk is added.

### Build order

1. `EditModeSystem` internals (kind-aware arming, `editedMoves`, export) — pure, testable first.
2. `CollectScene` wiring (exit inputs in, live-commit out).
3. Verify: `tsc` + tests, then a real playtest — enter mode5, Shift+E, flip to moves, draw a
   rect for one exit, confirm the dashed dusk box relocates off its fallback margin position
   immediately and pans with the painting, export, paste, rebuild, confirm it survives.
4. First authoring pass over the 20 screens (a content session, not a code session — separate).

## Size and priority — said plainly

**This is small.** `EditModeSystem.ts` is 320 well-factored lines and every hard problem in it
(pan-space drag, live commit, merge-on-export) is already solved and already corrected once by
review; the extension is a second map and a palette toggle. It touches no save, gate, ink or
schema surface. **Freeze-week-sized: yes** — a day of build+verify, versus T13 which is a
multi-phase schema-and-ink build staged post-capstone by size alone.

It is also the opposite of parkable: the just-shipped click-to-walk HUD runs on fallback
geometry on **every screen**, and the authored geometry it needs is arguably content that wants
to exist before the 2026-08-28 content freeze, not after. Whether that makes it this week's work
is Roc's call (below), but the cost/benefit is lopsided in a way T13's isn't.

---

## Needs Roc's ruling before build

1. **Extend vs sibling.** Recommendation above: extend `EditModeSystem` with a second palette.
   Rule on it — a sibling tool is defensible only if move authoring is expected to grow its own
   UI (e.g. drawing walk *paths*, not boxes), which nothing currently suggests.
2. **Move palette source.** Recommendation: live hub exits (`hubAction === "exit"`), accepting
   the empty-at-night edge. Alternative: union with static `connects_to` neighbours from
   `run.graph`. Pick one — building both is speculative.
3. **Toggle input.** Recommendation: clickable chip only, no new hotkey. If Roc wants a key,
   he should name it against the bar's existing `S N H L O W E` + Shift+E claims.
4. **Staging.** Is this freeze-week work? The tool is dev-only, but the geometry it produces is
   authored content — authoring the 20 screens after the content freeze would mean the capstone
   ships on fallback layouts. Recommendation: build the tool now, run the authoring pass before
   2026-08-28. Roc's word either way; nothing moves without it.
5. **Scope fence, stated to be confirmed:** this plan does not touch the fallback layout, the
   gate/label logic in `MoveRegions.ts`, or the examinable-coverage gap (`GAPS.md` G14 — 19 of
   20 screens also lack examinable geometry; the same authoring session could close both, but
   that's a content-pass decision, not this tool's scope).
