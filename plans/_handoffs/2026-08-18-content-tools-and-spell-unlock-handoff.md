# Handoff — content-approval tools + spell-unlock rewire (2026-08-18)

One-session note. Paca was unreachable this session, so the task breakdown lives
here to load into Paca when a connected session runs. Not a tracker.

Plan of record: `plans/2026-08-17-content-approval-and-screen-flow-plan.md`.

---

## Track board — for parallel sessions (2026-08-19)

Grouped so each track runs in its own session. Priority track (cast-on-a-thing)
has its own plan: `~/.claude/plans/we-will-want-b-serialized-whistle.md`. Kickoff
prompt for it lives in that plan's session notes.

| # | Track | Type | Depends on | Parallel-safe |
|---|---|---|---|---|
| **1** | **Cast-on-a-thing mechanic** — click a screen receiver, cast on it (Option B). Unblocks the Cave + F8. See its plan. | code | — | yes |
| 2a | Satchel screen → Phaser (`tools/screen-flow/mockups/satchel.html`) | mockup→code | visible dev server | yes |
| 2b | Save/Load → Phaser (replaces `ResumePromptScene`) | mockup→code | visible dev server | yes |
| 2c | Options → Phaser | mockup→code | visible dev server | yes |
| 2d | Spellbook → Phaser (VFX preview) | mockup→code | visible dev server | yes |
| 3 | Notebook + Hub theme adoption (filigree/parchment) | code | visible dev server | yes |
| 4 | Content: place cast targets on gated screens (Cave's glimmer target, others) | pipeline | Track 1 | after T1 |
| 5a | Confirm Ruling 1 done → un-skip `tests/StarterSpells.test.ts:54` | decision+test | Roc word | yes |
| 5b | Merge-plan open rulings #2/#3/#4: `no_effect` string mismatch (49/89), VFX no-effect brightness ceiling, narration alignment | decision+code | Roc word | yes |
| 5c | Ruling 3: confirm starters' components (river_stone; captured_sound+beeswax; feather+wool) forage early | decision | Roc word | yes |
| 6 | At-the-machine verification: playtest F8, `U`-button check, editor live VFX (`npm run editor`), screen-flow capture (`npm run screens`) | verify | running build | one session |
| 7 | Cosmetic: remove dangling `G-F4-still` rule; drop F4's vestigial `gates[]` | cleanup | — | yes |
| — | Icon export: gold icons from the `.ai` (`~/Desktop/assets/ui-icons`) → transparent PNGs; feeds 2a–2d polish | asset | Illustrator | yes |
| — | Confirm-and-close (likely already done): mode5-SRP steps 0–8, worktree merge, F8 human gate | verify | — | one session |

**Status notes:** the mode5-SRP merge plan (steps 0–8) reads as complete
(CollectScene 847 lines, gate met). The F8 chain content is built + headless-verified
(Round 7) — open only on Roc's gate + the playtest, which Track 1 unblocks. The two
tool worktrees were already merged to main. D5/D6 and F1/F3/F4/F5 all need a visible
local dev server the sandbox can't reach — batch them at the machine.

**Fastest parallelism:** Track 1, 2a–2d (disjoint files), 3, 7, and 5a–5c can all run
at once. Track 4 waits on Track 1.

---

## What shipped to the main tree this session (done, reviewable)

**Track 4 — spell-unlock rewire.** The Mage now starts knowing their own three
spells; every other approved spell is NPC-taught by role.
- `src/magic/starterSpells.ts` — NEW. `STARTER_SPELLS = ["glimmer","echo","fetch"]`,
  extracted to a Phaser-free module so a test can read it without booting a scene.
- `src/scenes/CollectScene.ts` — seed changed from `["ignite","breath"]` to import
  `STARTER_SPELLS`. NPC teaching already works by role (`NpcTalkSystem` filters
  `s.role === role`); no new wiring needed.
- `tests/StarterSpells.test.ts` — NEW wiring test. Asserts the starters are exactly
  the Mage's approved set and every non-starter has a teaching role. One `it.skip`
  documents the reachability ruling below.

**Track 2 — mode-5 debug unlock.** A DEV-only, mode5-only button + `U` key.
Learns every approved spell, grants all materials (casting reach), and
force-opens every screen gate. Three fixes after Roc's first playtest (2026-08-18):
- `src/scenes/CollectScene.ts` — button moved to a second row (`y 60`) so it
  stops crowding the main button row; now also force-opens gates.
- `src/world/gates/GateEngine.ts` — NEW `debugForceCleared(gateIds)`. Opens gates
  INCLUDING unsatisfiable ones (`restoreCleared` refuses those). Needed because
  the Cave/F7 requires `G-F5-cascade`, which no cast clears — see ruling 1.
- Playtest finding: glimmer clears `G-F7-light` but the Cave also needs
  `G-F5-cascade`. glimmer alone can NEVER open the Cave. Not a bug — ruling 1.

**Verification (main tree):** `npx tsc --noEmit` clean (bar 4 pre-existing
`tools/lantern/.../play.ts` errors, untouched) · `npx vitest run` 583 passed,
1 skipped · `npm run walk` clean, full 5-day week, 14 screens.

## Tools shipped (workflow `wsv6um5pw`, merged into main tree)

- **Track 1 — Content Approval Editor** — `phaser/tools/content-editor/`.
  Run `npm run editor` (Vite on :5177). Four tabs (Spells with real Phaser VFX
  preview, Screen unlocks, Items/Key-items, Receivers), notes + approve/reject to
  sidecar `review.json`, content JSON never written. Reuses the shipped audit
  (`src/world/audit/rules.ts`) so red rows match the commit gate.
  VERIFIED: editor tsc clean · workflow end-to-end curl (16 approved spells,
  20 screens, sidecar round-trip, content untouched). CAVEAT: the sandbox browser
  could not reach the dev server, so the live VFX canvas was proven structurally
  (real `src/render/vfx` import graph bundles), not screenshotted. Run locally to
  see it. OPEN Qs: (a) teacher-match for `learn_source` is free-text heuristic;
  (b) "unreachable" keys off the audit's unclearable rule, so 0 screens are red
  today — if the intent is "would strand if locks enforced," it's a one-line change.
- **Track 3 — Screen-flow review** — `phaser/tools/screen-flow/`.
  Run `npm run screens`, then open `tools/screen-flow/flow.html`. Live capture +
  ordered click-through with per-screen feedback + image-gen placeholder cards.
  VERIFIED: all three `.mjs` parse. CAVEAT: the sandbox could not launch a real
  browser capture, so screenshots must be produced by running it locally.

## Round 2 — playtest fixes (2026-08-18)

1. **Cave lock (ruled: cave-only).** F7's `status` dropped `G-F5-cascade`, keeps
   `G-F7-light` (glimmer clears it). Edited `lantern-projects/v01/graph.json` +
   the matching `f5.ink` tag, re-bundled. Other forest `G-F5-cascade` locks left
   as-is per the cave-only ruling. Six characterization tests that pinned the old
   two-gate cave were updated to the new state (Gates/GateEngine/CastBookkeeping).
2. **captured_sound (ruled: always-available).** Set `always_available: true` on
   the record. But mode 5 runs `includeAlwaysAvailable: false`, so that flag is
   inert there — echo needs it HELD. So `CollectScene` also seeds
   `item_captured_sound` at start, so echo casts from turn one.
3. **Screen-flow markers.** `build-flow.mjs` now drops auto-numbered pins where you
   click a captured shot, each with a matching numbered note field. Persists to
   localStorage; the JSON export includes markers. Export lands in
   `C:\Users\rocle\Downloads\screen-flow-feedback.json`, which I can read directly.
4. **Capture reliability — FIXED (verified 2026-08-18).** Root cause: mode 5
   autosaves on entering collect, and the shared browser context carried that save
   into later page loads, which then showed the "welcome back / Resume" gate
   instead of the game. Fix: a fresh browser context per screen (isolated storage)
   + the spellbook presses `U` so sticks is held. All 7 reachable screens now
   capture distinct real frames (mode-picker, location-select, collect-forage,
   spellbook, notebook, calendar, hub-decor). satchel / save-load / options stay
   placeholders — those screens don't exist yet (save/load is currently the resume
   screen; it's a redesign target).

**Verification:** tsc clean · 583 tests pass, 1 skipped · walk clean · both
screen-flow scripts parse · flow.html regenerates with markers.

## Round 3 — editor precision + screen mockups (2026-08-18)

**#8 — editor refinements (done, verified).**
- Teacher-match is now precise, not free-text. A spell is reachable iff a soul in
  the run holds its role (read off personas.json). This caught a latent bug: the
  editor read `role_tag` at top level, but it is nested at `soul.role.role_tag`,
  so it had been seeing NO roles at all. Fixed. Result: 3 Mage spells start-known,
  all 13 non-Mage spells flagged **at-risk** — one soul holds each role but roles
  own 2–3 spells and `pickNpcSpells` teaches one per soul. That is ruling 1, now
  surfaced per-spell in the Spells tab.
- Screen "unreachable" now keys off approved-spell coverage (`PROPOSED_SPELL_GATES`),
  matching Gates.test.ts. Six screens strand: F4, F5, F6, F8, T5, T6. F7 (Cave) is
  reachable again thanks to the cave-only ruling. Editor type-checks clean.

**#7 — screen mockups (done).** Three self-contained HTML mockups under
`phaser/tools/screen-flow/mockups/`, one shared design system (forest-dark + aged
canvas + gold; serif display + monospace data, matching the live HUD):
- `satchel.html` — diegetic pouch, cloth pockets, count badges, an index-card
  inspect showing which spells use each material. Real day-1 starter materials.
- `save-load.html` — replaces the bare "welcome back" screen with save slots
  carrying place / day / spells learned / souls met / last played.
- `options.html` — category rail + setting rows (sliders, toggles) + a parchment
  help panel that explains the focused setting.
  Built with the frontend-design and ui-ux-pro-max skills; layout maps cleanly to
  Phaser containers/text for a later port. Awaiting Roc's direction + marker notes.
- Asset kit at `C:\Users\rocle\Desktop\assets\ui-icons` (gold icon set, menu-frame
  filigree, dialogue border). It is gold-on-TEAL and the transparent PNG has no
  alpha, so it is the **Phaser port target**, not a drop-in for the warm mockups —
  export individual transparent PNGs from the `.ai` at implementation time. The
  mockups adopt the kit's LANGUAGE (gold corner filigree + gold icon-buttons on
  save-load and options) redrawn as SVG in the warm palette; the satchel stays a
  diegetic pouch (no rectangular frame to ornament).

## Round 4 — Ruling 1 wired + UI language audit (2026-08-18)

**Ruling 1 = rotate by day (Roc). Wired + verified.**
- `src/world/hash.ts` — NEW `rotatingClueIndex(soul, day, count)`: the offered
  spell rotates by day, so one soul teaches its whole role across the week.
- `NpcTalkSystem.pickNpcSpells` uses it. `tests/ClueRotation.test.ts` (5 tests)
  pins the coverage property (a 3-spell role is fully offered within 5 days).
- Editor updated: the one-per-soul "at-risk" flag is resolved by rotation — now
  reads "taught by <soul> — its N <role> spells rotate daily across the week".
  0 at-risk. Verified: tsc clean, 588 tests, clean walk.

**UI language audit — the "new language" is already `theme.ts`.** The mockups'
palette (night #14110c, panel #241c14, gold, ink #f4ead6, Georgia + monospace)
is the shipped theme. So incorporating it is not a restyle — it is extending the
shared theme, then elements adopt it. Three things the theme lacked, now added:
- `theme.ts` — parchment token family (`canvas`, `canvas2Num`, `canvasEdgeNum`,
  `inkOnCanvas`, `inkSoftOnCanvas`), contrast-verified. The light surface for
  inspect cards / help panels / save slots.
- `theme.ts` — `filigreeCorners()` helper: gold corner brackets at Phaser
  fidelity (the asset-kit menu-frame language).
- `ModalFrame.modalFrame()` now calls it, so EVERY existing modal gains the
  filigree from one place. First concrete adoption.

Still to adopt (incremental, not yet built): icon-buttons (needs the real gold
icons exported from the `.ai` as transparent PNGs), parchment detail panels for a
real satchel/inspect and save/load screen. The mockups are the target.

## Round 5 — overnight build (2026-08-18 → 19, while Roc slept)

1. **Ruling 2 decision doc** — `plans/2026-08-19-ruling-2-forest-reachability-decision.md`.
   Corrects the picture: "6 stranded" was wrong. Reading the ENGINE rules
   (`gateRules.json`), F5/F6 clear on casting ignite, T5 clears by bond, T6 by
   time. Only **F4 and F8** truly strand — their chain gates name cast pairs no
   spell authors (ignite×river_stone, fetch×stone_wall, temper×product; all
   confirmed absent). Doc gives 3 options per screen with a recommendation. Roc's
   call — nothing wired.
2. **Editor Screen-unlocks tab corrected.** It read the provisional `spellGates.ts`
   and over-reported. Now it reads `gateRules.json` (bond/time/knowledge never
   strand; cast/chain checked against the authored receiver matrix). Verified:
   flags exactly F4, F8; editor tsc clean.
3. **Spellbook mockup** — `tools/screen-flow/mockups/spellbook.html`. Open book,
   known spells left, to-learn grouped by teacher role. Right page: the selected
   spell's phrase, components, what-it-does, and a live VFX PREVIEW pane (dancing
   lights for glimmer, ripple for echo, tug for fetch) — an HTML stand-in for the
   shipped Phaser cue. Real content. Verified in the browser pane.

Mockup set is now complete: satchel, save-load, options, spellbook. Notebook and
hub already exist in the live build, so they need theme adoption (filigree /
parchment), not a mockup — deferred to a session where the in-game render is
visible (the sandbox browser can't reach the dev server).

## Round 6 — Ruling 2 landed (2026-08-19)

Roc ruled: **F4 cut, F8 = heated-stone chain.**
- **F4 gate cut + verified.** `graph.json` status `reachable`, `f2.ink` lock tag
  removed, re-bundled. Editor now shows **only F8** stranded. Walk clean. (The dead
  `G-F4-still` rule in gateRules.json is left in place — harmless, no audit flags
  it; clean it up when F8 lands.)
- **F8 routed to the pipeline, NOT hand-authored** (Roc's method call). Request:
  `plans/2026-08-19-f8-heated-stone-pipeline-request.md`. It specifies the new
  `item_heated_stone` (world item, produced by ignite×river_stone, used by fetch),
  the two new receivers, the cross-pass, and the staged `G-F8-combine` chain
  rewire. It flags the one real blocker: `produces` is spell-level today, so
  ignite×river_stone minting a heated stone (not a flame) needs a schema call from
  the item seat. Nothing authored, nothing approved — awaiting a pipeline run +
  Roc's gate.

## Round 7 — F8 heated-stone chain built (2026-08-19, workflow `wbmueu0u9`)

The whole F8 chain is wired and headless-verified. **Ready to playtest.**

**Engine — per-receiver `produces` (option A).** A receiver may carry its own
`produces`, overriding the spell-level default. `types.ts` (Receiver.produces),
`CastResolver` (`receiver.produces ?? spell.produces`), `GateEvaluator` (already
receiver-aware — binds `onProductOf` to the logged product). `tests/ReceiverProduces.test.ts`
(5) pins it, including the chain closing only on the receiver override.

**Content — via the seat contracts.** New world items `item_heated_stone`
(ignite→) and `item_tempered_stone` (temper→), plus receivers ignite×river_stone,
temper×heated_stone, fetch×stone_wall. `_index.md` tables updated. content-check clean.

**Gate + placement.** `G-F8-combine` → 3-step chain
(ignite×river_stone → temper×heated_stone → fetch×stone_wall). F8's graph screen
gained a `receivers` array so the targets are castable in play. Re-bundled.

**Audit fix.** The orphans audit read item usage from spell-level `components`
only, so it wrongly flagged the two new items. Now receiver-aware (receiver
targets + the item's `used_by`). orphans 63→61 (61 is the standing baseline).

**Verified:** tsc clean · **597 passed / 1 skipped / 0 failed** (32 files, incl. the
F8 chain-clears tests) · content-check clean · walk clean · editor shows **0
stranded screens** (F8 reachable).

**The one thing headless can't prove — playtest confirms it.** The walk doesn't
cast, so it can't demonstrate a player performing the chain. The logic is proven
by test and the targets are placed, but whether the new `screen.receivers` array
renders castable targets in the Phaser scene needs a human playtest. That is the
gate: **play F8 — forage/leave a river stone, ignite it, temper the heated stone,
fetch it onto the wall, confirm the way opens.** Use the mode-5 `U` unlock to skip
prerequisites.

**Loose ends (minor):** `G-F4-still` stays in gateRules.json as the canonical
two-step teaching example even though F4 is now `reachable` (tests expect this).
F4's graph entry still carries a cosmetic `gates[]` array for the cut gate — no
parser reads it. Clean both up whenever the forest gets another pass.

## Open rulings for Roc (do not resolve silently)

1. **Multi-spell roles vs one-per-soul teaching.** `NpcTalkSystem.pickNpcSpells`
   offers ONE spell per soul, hashed on soul id. Every non-Mage role owns 2–3
   approved spells. A role dealt to a single soul can only ever teach one of them,
   so the rest are unreachable via NPC. Options: rotate per day, offer all unseen,
   or guarantee enough souls per role. The skipped test in `StarterSpells.test.ts`
   encodes the invariant to un-skip once chosen.
2. **Forest reachability got tighter.** With `ignite` no longer a starter, the
   dry-hedge chain (Forest Unlock 1 → F4–F8) now needs a Blacksmith-learn step
   first. The clean walk reached 14 screens; `F4–F8, T9` unreached. This is the
   merge plan's Open Ruling #5 (day economy vs chain length), now sharper. A
   content/economy call.
3. **Starter castability.** The three starters are KNOWN at start, not castable at
   start — their components (river_stone; captured_sound+beeswax; feather+wool)
   must be forageable early or the player holds three spells they can't yet cast.
   Confirm the early forage pools cover them.

## Paca task breakdown (to create when connected)

- GP — "Track 4: starter spells = Mage set, NPC-taught rest" · DONE, needs review.
- GP — "Track 2: mode-5 DEV unlock button" · DONE, needs review + manual click-check.
- GP — "Track 1: Content Approval Editor (standalone)" · in progress (workflow).
- GP — "Track 3: Screen-flow review tool" · in progress (workflow).
- GP — "RULING: multi-spell role teaching (one-per-soul)" · needs Roc.
- GP — "RULING: forest reachability with ignite NPC-gated" · needs Roc.
- GP — "Verify starter components forageable early" · needs Roc/check.

## Suggested next moves

- Merge the two tool worktrees into main once reviewed (they are additive, disjoint
  directories — `tools/content-editor/`, `tools/screen-flow/`).
- Manual click-check of the `U` unlock button in a browser (`?mode=mode5`).
- Rule on the two reachability items, then un-skip the reachability test.
