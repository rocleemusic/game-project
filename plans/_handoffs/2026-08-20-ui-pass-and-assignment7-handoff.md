# Handoff — VFX merge, full §14 UI pass, and Assignment 7 (UI)

**Date:** 2026-08-20
**Session scope:** merged the stranded VFX fix, drove the whole in-game/menu UI onto the §14 design system through the two-seat UI team, and built Assignment 7 as a UI Style-Guide Agent (staged into the course repo).

**Baseline is green.** `tsc` clean in `phaser/`. `vitest` **641 passed / 1 skipped**. `CollectScene` at **898 lines** (SRP gate is `< 900`). Everything below is committed and pushed to RL_MAP `main`. Stale-by-design: don't cite this file in a contract.

---

## 1. VFX 2× anchor fix — merged

The `explode()` particle-position fix was stranded on branch `worktree-agent-a31c24caebf801c2c`. That branch was an **old divergence** — merging it whole would have reverted this session's UI-team work. So it was **cherry-picked one file**, not merged.

- `phaser/src/render/vfx/PhaserVfxBackend.ts` → `emitter.explode(quantity)` (was `explode(quantity, anchor.x, anchor.y)`, which double-added the anchor and put a 960,540 cast at 1920,1080).
- Removed the compensating **half-anchor workaround** in `NotebookScene.ts` (it would have double-corrected once the real bug was fixed).
- Added a **regression guard** in `PhaserVfxBackend.test.ts`. The old stub typed `explode(quantity)` and silently dropped extra args, which is why the suite never caught this. The new test records the full arg list and asserts no local offset. Validated: it **fails** on the buggy call (`[12,100,200]`, length 3) and passes on the fix.

**Loose end:** the `mode5-vfx.mjs` playtest scenario is separately stale — the LocationSelect redesign moved its entry click, and a spell-roster change dropped `ignite` from day-1 known spells. A partial repair was reverted to keep the merge focused. It needs its own pass (fix entry click → the Forager's Clearing thumbnail at ~260,630; retarget the cast to an available particle spell like `fetch`).

---

## 2. The §14 UI pass — every in-game and menu surface

All of this ran through the **two-seat UI team** (`agents/ui-builder.md` builds, `agents/ui-verifier.md` grades from a real screenshot). The verifier caught real things a screenshot-blind check misses.

**Screens restyled onto §14:**
- **Location-select day cards** → light gold-framed parchment panels, art-backed by `phaser/public/art/ui/card-frame.jpg` (Roc's `column.jpg`). Frame trimmed of its green backdrop via texture-space `setCrop`.
- **Shared `phaser/src/ui/dayCard.ts`** extracted so **LocationSelect and Calendar can't drift again** (the calendar had drifted back to dark boxes). Both import the frame-height calc, `addCardFrame`, the today-emphasis, and the thumbnail helpers.
- **Calendar** rebuilt to match: past days show the chosen-location thumbnail from `DayPicks`, today is read-only-emphasized, **time-of-day blocks dropped**, day 5 gets a "Festival Night" subheader.
- **Day-1 "today" emphasis strengthened**: a gold **TODAY** tab on the card edge, a layered warm ember bloom, a gold/ember double rim, and a darker label. Non-today cards fade toward the book (past 0.82, future 0.64 alpha).
- **Collect HUD header** cut to `Day 1 · Morning · <Screen Name>` — screen **name** via a new `Gates.nameOf(id)`, `moves`/`satchel` dropped (moves lives on the calendar, satchel on the bottom strip). A **night plaque** now sits behind the header so gold stays legible over bright backdrops.
- **HUD nav buttons** packed into one right-aligned, evenly-gapped row via a new `ModalFrame.buttonRow()` — variable-width §14 pills no longer collide at hand-tuned x anchors, and the DEV-unlock button joins the same row instead of wrapping.
- **Move/action choices** (`TraversalRow.ts`) → §14 pills matching the dialogue choices; brackets stripped; **gated color aligned from `danger` red to `muted`** ("a blocked move is a fact, not an error").
- **Home Hub buttons** → §14 utility pills (New Life, Close) and tabs (Free Drag/Snap Slots, In-Game Home/Meta-Hub), active states preserved.
- **NPC-talk modal** → serif display body prose, choice rows as §14 pills, portrait frames off raw hex onto tokens.

**Casing:** Title Case across all UI labels/buttons — the core chrome plus nine menu screens (Satchel, Notebook, Save/Load, Options, Cast, Spell Trial, Hub, Screen, the satchel strip). Sentences and §14 UPPERCASE kickers left alone; no story/data names touched.

**Fonts:** 33 raw `fontFamily` strings across 8 files moved onto the `FONT` tokens; the Hub's "HOME HUB" title role-corrected from mono to the display serif. A few directed raw color hexes fixed (`#ffe9b0`→gold, `#1a1208`→onAccent).

**Contract change:** `agents/ui-verifier.md` now emits a **SCORE + REASON** (a §14 deduction table), so the game's real grader and Assignment 7's Evaluator are the same tool.

---

## 3. Assignment 7 — Style Guide Agent (UI)

Rebuilt Assignment 7 as a **UI** loop instead of the narrative one, on Roc's call (narrative is already used in two assignments; UI gives stronger, visible before/after).

**In RL_MAP** — `ProjectOS/game-project/assignments/`:
- `assignment-7-old/` — the narrative version (`git mv`, history preserved).
- `assignment-7/` — the new one: `roc-lee-rebirth-README.md` (writeup), `style-guide.md` (§14 distilled, game-anchored, 6 constraints), `loop/score.mjs` (runnable deduction table) + `loop/fixtures/` (real before/after findings) + the two contracts, `evidence/` (7 rendered PNGs).
- The loop maps Generator→Evaluator→Refiner onto UI Builder → UI Verifier → Builder fix-pass. SCORE is computed in code, never picked by a model. Verdict routes on the *kind* of finding (structural stops the loop for a human).
- Three graded before/after examples, all scores from `score.mjs`: **legibility 1→10** (the self-correcting-grader story), **palette 6→10** (dark boxes → light panels), **component 4→10** (bracket text → §14 pills). Run: `node loop/score.mjs --replay all`.

**In the course repo** — `P:\GitHub\game-design-course` (separate git repo, branch `master`):
- `assignment-07-old/` (narrative) + `assignment-07/` (new UI) — **75 files STAGED, not committed.** Roc commits/pushes the submission.
- The old `assignment-07/` there was **untracked** (never committed), so the rename only keeps it beside the new one — no prior GitHub history existed.
- Before/after image links pulled out of blockquotes into standalone `![](evidence/…png)` relative links so GitHub renders them.

---

## Open items / for Roc

- **Commit + push the course submission** — `game-design-course` is staged, not committed.
- **`style-guide.md` §-numbering caveat:** it cites the `score.mjs` scheme (§2 palette, §3 type, §5.2 card, §7 VFX), which does not match `14-visual-style-guide.md`'s own internal numbering. Reconcile if you want the citations to line up with the GDD file.
- **`bex` NPC sprite renders as a black box** — a missing character texture, visible in the collect HUD. Separate art item, not chrome.
- **`mode5-vfx.mjs` playtest scenario is stale** — needs the entry-click + spell-roster repair (see §1).
- **NPC modal "talk with X" rows** (~`NpcTalkSystem.ts:386-406`) are still bare gold mono text — the builder left them outside the enumerated scope. Pill them with the same `choicePill()` helper for full consistency if wanted.
- **Non-exact raw hex colors remain** in `ScreenScene.ts` (the mode-1 walking skeleton) and a few render helpers — the font pass declined to remap them because "nearest token" would shift the rendered color. A separate §14 color-cleanup pass.
- **`casing-before/after.png`** are now unreferenced leftovers in `assignment-7/evidence/` — harmless, prune if tidying.
- **Still open from prior handoffs:** town-square painted art, a §14 map-thumbnail button entry, Track 3 notebook/hub theme adoption, Options feature wiring, Assignment Scout, the save-slots GDD-vs-code gap.

---

## Key files touched this session

| Area | Files |
|---|---|
| VFX fix | `phaser/src/render/vfx/PhaserVfxBackend.ts` (+ `.test.ts`), `phaser/src/scenes/NotebookScene.ts` |
| Shared card | `phaser/src/ui/dayCard.ts` (new), `LocationSelectScene.ts`, `CalendarScene.ts` |
| HUD | `phaser/src/scenes/CollectScene.ts`, `phaser/src/render/ModalFrame.ts` (`buttonRow`), `phaser/src/world/Gates.ts` (`nameOf`), `phaser/src/scenes/debugUnlock.ts` |
| Choices / modal / hub | `phaser/src/render/TraversalRow.ts`, `phaser/src/render/NpcTalkSystem.ts`, `phaser/src/scenes/HubScene.ts` |
| Fonts (8 files) | `PreloadScene`, `EditModeSystem`, `HotspotSystem`, `NpcTalkSystem`, `SatchelStrip`, `TraversalRow`, `HubScene`, `ScreenScene` |
| Contract | `agents/ui-verifier.md` (SCORE+REASON) |
| Assignment | `assignments/assignment-7/**`, `assignments/assignment-7-old/` (renamed) |
| New playtest scenarios | `phaser/playtest/hub.mjs`, `phaser/playtest/collect-hud.mjs`, `phaser/playtest/calendar.mjs` |
