# Handoff — cast-on-a-thing landed, UI migration underway (2026-08-19)

One-session note, continuing from `2026-08-18-content-tools-and-spell-unlock-handoff.md`.
That handoff's track board is reproduced below with status updated — this file is now
the current one to read for track state; the 08-18 file is history.

---

## What shipped this session (done, verified, reviewable)

### Track 1 — cast-on-a-thing mechanic. DONE, played by Roc, works.

Mode 5 can now cast on a screen receiver, not just the hardcoded `dry_hedge`. Built per
`~/.claude/plans/we-will-want-b-serialized-whistle.md`.

- `tools/lantern/src/types.ts` — `Screen.receivers?: string[]`.
- `phaser/src/render/ReceiverHotspots.ts` — NEW. Draws a dusk-diamond marker (deliberately
  not the forage gold dot) per castable target. Targets = static `screen.receivers` ∪
  `Inventory.worldItemsOn(screen)`.
- **THE APPROACH fix (Roc playtest finding, real bug):** a screen's own gate blocks entry
  to itself, so a player can never stand ON a locked screen to see ITS receivers. Markers
  now also surface from any screen with a still-locked move choice toward the target,
  via `approachScreens()` (reuses `Gates`/`GateEngine`, same check `TraversalRow` already
  makes). Each marker remembers which screen it's actually scoped to, so a cast made from
  the approach still books production against the right screen.
- `phaser/src/render/HedgeCastPrompt.ts` — `openCastOn(receiverId, label, screenId)`,
  generalized from the hedge-only `open()`.
- `phaser/src/scenes/CollectScene.ts` — wired at the same three call sites as
  `HotspotSystem` (construct/sync/reposition).
- Tests: `tests/ReceiverHotspots.test.ts` (new), `tests/GateEngine.test.ts` (extended with
  real-content proof the F8 chain clears via the marker-derived target ids, from both F8
  itself and the F5 approach).
- **Verified live**: F1 → F3 → F5 (3 moves), `U` to unlock, markers on F5, cast the chain,
  F8 opens. Roc confirmed: "works for now."

### Track 2a — Satchel screen → Phaser. DONE, verified, visually checked.

First of the four UI-migration screens (`tools/screen-flow/mockups/satchel.html` → Phaser).

- `phaser/src/world/SatchelPockets.ts` — NEW, pure. `buildPockets()`: held items + ink's
  pool ledger → pocket data. `count: null` (never a fabricated number) for a `free` item
  or anything the mode5 DEV unlock granted without pool provenance.
- `phaser/src/scenes/SatchelScene.ts` — NEW. Paused-overlay scene, same discipline as
  `NotebookScene`/`CalendarScene`. Leather pouch (Graphics gradient), 3×2 pocket grid,
  parchment inspect card, Satchel/Arms tabs.
- **Icons are the mockup's own hand-drawn SVGs**, not Graphics approximations — pulled
  into standalone files (`phaser/public/art/ui/satchel/{stone,sound,wax,feather,wool,
  sticks}.svg`) and loaded via Phaser's real `load.svg()`. `leaf` (Graphics dot) is the
  fallback for anything outside those six.
- `phaser/src/ui/theme.ts` — leather/pocket tokens added (`leatherLightNum`, `leatherNum`,
  `leatherDarkNum`(+Hex), `pocketNum`, `pocketEmptyNum`).
- `CollectScene.ts` — `[ satchel — S ]` button, `openSatchel()`, same pattern as Notebook/
  Calendar/Home. `main.ts` — `SatchelScene` registered.
- Tests: `tests/SatchelPockets.test.ts` (new).
- **Two real bugs found and fixed by actually driving the browser** (see "Technical
  lessons" below): the WebGL `setMask` failure (empty-pocket hatch), and a Container
  add-order bug (an "empty" label rendering under its own background).
- **Layout corrected against the mockup** (Roc's callout): close button moved from
  top-right (crowding the HUD row) into the footer next to the tabs; header title+meta
  combined onto one row; added the flap clasp and drop shadow for closer fidelity.

### GDD §14 — Visual Style Guide. DONE.

- `gdd/14-visual-style-guide.md` — NEW. Palette, type scale, shape language, and every
  reusable component, reconciled from the four mockups against the shipped `theme.ts`
  and the live VN dialogue system.
- **The one ruling made:** mockup gold (`#c9a15a`/`#e6c583`) is canonical color; button
  shape/behavior is a recolor of the shipped dialogue pills (`DialogueSystem.ts`'s
  `drawChoices()`/`drawControlBar()`, geometry in `DialogueLayout.ts`'s `VN_METRICS`) —
  not reinvented per screen. Two families (Primary/Choice-style, Utility/Control-style)
  plus a new on-canvas variant for parchment surfaces, which the dialogue system never
  needed.
- `phaser/tools/screen-flow/mockups/design-system.html` — NEW. Every token/component
  live, verified by driving Playwright directly against the file (screenshotted, one
  contrast bug found and fixed: chips need a parchment card under them, illegible
  directly on the dark page).
- `gdd/CONTEXT.md`, `gdd/compile.ps1` — updated for the new file (index row, `01–14`,
  Part V).
- `ProjectOS/game-project/CONTEXT.md` — added a pointer to `phaser/tools/playtest.mjs` +
  a rule to use the Phaser skills / `frontend-design` / `ui-ux-pro-max` for this kind of
  work and verify with a real playtest screenshot, not just `tsc`/`vitest`.

**Verification baseline, all green:** `tsc --noEmit` clean · `vitest run` 617 passed / 1
skipped · `vite build` clean · walk clean (unreached F4-F8/T9, unchanged, expected) ·
`CollectScene.ts` at 880/900 lines (gate bumped twice this session — F5-approach wiring,
then the satchel button — both noted inline in the test).

### CONTEXT.md wiring for §14 + design-system.html. DONE.

`ProjectOS/game-project/CONTEXT.md`'s "Key files worth knowing by name" table now points at
`gdd/14-visual-style-guide.md` and `design-system.html` directly, alongside the
`playtest.mjs` row added earlier this session. `gdd/CONTEXT.md`'s own index already carried
the §14 row from when the doc was written.

### Agent seats — Systems Documentarian + Assignment Scout. Contracts written, NOT yet audited or run.

Read `plans/2026-08-17-phaser-pivot-mode4-plan.md`'s "Agents — what icm-architect actually
implies" section (the governing source: `P:\GitHub\icm-architect` + this project's own
`agents/README.md`). It proposes three tiers, not four agents:

- **Tier 1 — folder-level `CONTEXT.md` contracts** for save state, receiver state, VFX.
  **NOT built this session** — genuinely separate, smaller work (one `CONTEXT.md` per
  folder in icm-architect's stage-contract shape), left open below.
- **Tier 2 — two real seats.** Built this session: `agents/systems-documentarian.md` and
  `agents/assignment-scout.md`, added to `agents/README.md`'s roster table. Written directly
  in-session rather than via a fan-out workflow — the spec was fully contained in the pivot
  plan's own section, so parallelizing authorship would have bought nothing. **Neither has
  been run through `agents/contract-audit.md` yet** — that rubric requires a pass "after any
  contract is edited, and at a gate or sprint boundary," and this is the first edit.
- **Tier 3 — `npm run orphans`.** Already existed (`tools/content-audit.mjs`) before this
  session — nothing to build. Confirmed working (Round 7 of the 08-18 handoff already used
  it: "orphans 63→61").

**What's actually still open, in order:**
1. Run `agents/contract-audit.md`'s rubric against both new contracts (Band 1/2/3 criteria +
   the five set-wide checks). Fix any Band-1 finding before either seat runs for real.
2. Once clean (or fixed), **actually invoke the Systems Documentarian** against the live
   `phaser/src/` tree as it stands after Tracks 1/2a and any UI-migration work landed since —
   its first real output, `phaser/ARCHITECTURE.md`, doesn't exist yet.
3. Tier 1's folder contracts, whenever there's a session with room for them — not blocking.

This track is independent of the UI migration (2b/2c/2d/3) — no shared files — so it can run
as its own thread whenever picked up, same as Track 4 and 5a-5c below.

---

## Open decision — NOT resolved, needs Roc's word before Track 2b/2c/2d touch color

`SatchelScene.ts` was built and shipped **before** GDD §14 ruled the gold color, so it
used the OLD `theme.ts` gold (`#ffd479`/`#ff9d5c`), not the mockup gold now ruled
canonical. Two open questions, genuinely Roc's call:

1. **Recolor Satchel to match §14**, or leave it as first-built and only apply the new
   gold going forward?
2. **`theme.ts`'s `gold`/`goldNum`/`ember`/`emberNum`/`border` tokens** still hold the old
   values, used everywhere (HUD buttons, hotspot markers, notebook tabs, the dialogue
   system itself). Repaint in place (ships a visual change to everything already live),
   or add the new palette as a second token family alongside? Not implied by §14 —
   flagged there too, not resolved.

**Recommendation if asked:** repaint `theme.ts` in place once, then Satchel needs no
separate fix — it already reads the tokens, not hardcoded hex, so the recolor is one
file. Building 2b/2c/2d against un-repainted tokens means a second pass across four
screens instead of one pass across one file.

---

## Technical lessons this session paid for — read before touching Phaser UI again

1. **Phaser 4's WebGL renderer does not support the classic `Graphics.setMask()`.** It
   warns (`Mask.setMask: This method is not supported in WebGL`) and silently no-ops —
   a masked pattern bleeds unclipped across the whole canvas instead of erroring loudly.
   The fix: generate a small tile via `Graphics.generateTexture()` once, then draw it as
   a `TileSprite`, which repeats and clips to its own bounds natively. Working reference:
   `SatchelScene.ts`'s `ensureHatchTexture()`.
2. **A Phaser `Container`'s children render in ADD ORDER, not by `.setDepth()`.**
   `.setDepth()` only affects the Scene's own top-level display list. Inside
   `this.layer.add(...)`, whichever child was added first draws first (furthest back) —
   confirmed by a real bug (an "empty" pocket's label rendered under its own hatch
   background because a helper method auto-added it before the background existed).
   Order every `draw*` method's `add()` calls back-to-front; don't reach for `setDepth()`
   inside a container and expect it to do anything.
3. **The Claude-in-Chrome browser extension cannot reach `localhost`** (confirmed
   repeatedly, both for the Vite dev server and a static `file://` page) — same sandbox
   network limitation noted in the 08-18 handoff, still true. **`tools/playtest.mjs`
   (Playwright, real headless Chromium, already a devDependency) can** — it's spawned
   from the same process as the Bash tool, not the extension's isolated context. Use it
   for anything needing a real render: `node tools/playtest.mjs --url
   http://localhost:PORT/?mode=mode5 --viewport 1920x1080 --scenario playtest/NAME.mjs
   --out .playtest/NAME`. For a plain static HTML file (no dev server needed), a short
   one-off Node script using `playwright-core` directly (resolved from
   `phaser/node_modules`) works the same way — see this session's transcript for the
   pattern, no scenario file needed for a single-page screenshot check.
4. **`CollectScene.ts`'s SRP line-count gate** (`tests/HedgeCastPromptTraversalRow.test.ts`)
   will need bumping again for 2b/2c/2d/3 if any of them add a HUD button the way Satchel
   did. Currently `<900`, actual 880. Bump with a one-line comment noting why, same as
   the last two bumps — don't fight the gate, don't silently raise it either.
5. **The dev server used this session ran on port 5173** (`npm run dev`, started once,
   left running via `run_in_background` — background processes survive between tool
   calls in this environment as long as the parent Bash invocation that started them
   doesn't itself exit). It is almost certainly NOT still running next session — start a
   fresh one before reaching for `playtest.mjs`.

---

## Track board (carried forward from 2026-08-18, status updated)

| # | Track | Type | Depends on | Status |
|---|---|---|---|---|
| **1** | **Cast-on-a-thing mechanic** | code | — | **DONE — played, works** |
| **2a** | **Satchel screen → Phaser** | mockup→code | visible dev server | **DONE — verified, playtested** |
| 2b | Save/Load → Phaser (replaces `ResumePromptScene`) | mockup→code | visible dev server | **not started — next up** |
| 2c | Options → Phaser | mockup→code | visible dev server | not started |
| 2d | Spellbook → Phaser (VFX preview) | mockup→code | visible dev server | not started — most complex of the four (real VFX preview pane) |
| 3 | Notebook + Hub theme adoption (filigree/parchment) | code | visible dev server | not started |
| 4 | Content: place cast targets on gated screens (Cave's glimmer target, others) | pipeline | Track 1 | **unblocked**, not started |
| 5a | Confirm Ruling 1 done → un-skip `StarterSpells.test.ts:54` | decision+test | Roc word | still open |
| 5b | Merge-plan open rulings #2/#3/#4: `no_effect` string mismatch (49/89), VFX no-effect brightness ceiling, narration alignment | decision+code | Roc word | still open |
| 5c | Ruling 3: confirm starters' components forage early | decision | Roc word | still open |
| 6 | At-the-machine verification batch | verify | running build | **F8 playtest DONE (Track 1's own verify)**; `U`-button click-check, editor live VFX, screen-flow real capture — still open |
| 7 | Cosmetic: remove dangling `G-F4-still` rule; drop F4's vestigial `gates[]` | cleanup | — | not started |
| **NEW** | **theme.ts gold repaint** (see "Open decision" above) | decision+code | Roc word | **new this session, blocks 2b/2c/2d/3 color fidelity** |
| **NEW** | **Agent seats: Systems Documentarian + Assignment Scout** | code+process | — | **contracts written this session**; contract-audit pass + first real Documentarian run against live `phaser/src/` still open. Independent of UI migration — no shared files |
| — | Agent Tier 1: folder-`CONTEXT.md` contracts for save/receiver-state/VFX | docs | — | not started, small, not blocking |
| — | Icon export: gold icons from `.ai` → transparent PNGs | asset | Illustrator | Still open for the OTHER screens' icon needs (sliders/toggles/segmented control glyphs, etc.) — Satchel sidestepped this entirely by using the mockup's own hand-drawn SVGs instead, which turned out cleaner; consider the same move before touching the `.ai` kit for 2b–2d |
| — | Confirm-and-close: mode5-SRP steps 0–8, worktree merge, F8 human gate | verify | — | unchanged, presumed done |

**Fastest parallelism unchanged from 08-18:** 2b/2c/2d/3 are disjoint files and can run in
parallel sessions. Track 4 waits on nothing now (Track 1 shipped). 5a–5c are pure
decisions, cost nothing to resolve whenever Roc has a moment.

**Paca note:** not checked this session — Roc's own instruction at kickoff was "skip pm."
Whoever runs `/pm` next should reconcile board state against this file, not the 08-18 one.

---

## Suggested next move

Read `gdd/14-visual-style-guide.md` and open `design-system.html` before starting 2b —
it's the spec now, not the raw mockup CSS. Get Roc's word on the `theme.ts` gold repaint
first if color fidelity matters for the next screen; otherwise proceed and note the same
"built before the repaint" caveat Satchel now carries.

**Two independent threads to pick up, in either order — they touch no shared files:**

1. **UI migration** — 2b (Save/Load) next, then 2c, 2d, Track 3.
2. **Agent seats** — run `agents/contract-audit.md`'s rubric against
   `agents/systems-documentarian.md` and `agents/assignment-scout.md`; fix any Band-1
   finding. Once clean, **the session orchestrator invokes the Systems Documentarian for
   real** against `phaser/src/` as it stands (which will include whatever UI migration
   landed by then) and reviews its output before `phaser/ARCHITECTURE.md` is treated as
   current. That review-and-apply step is the actual point of building the seat — a
   contract nobody has run is still just a plan.
