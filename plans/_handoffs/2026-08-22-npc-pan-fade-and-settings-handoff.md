# Handoff — NPC portrait redesign, pan/fade motion, real Options settings

**Date:** 2026-08-22
**Session scope:** iterative pass on the mode5 NPC portrait row (art, size, ground level, hover), the backdrop pan system (dead zone, smoothing), a first pair of REAL Options controls, fade-in motion across every scene/modal/backdrop-swap/NPC arrival, a stale playtest scenario, a §14 citation fix, and a Paca board reconciliation with two date rulings applied.

**Baseline is green.** `tsc` clean in `phaser/`. `vitest` **641 passed / 1 skipped**. `CollectScene` at **898 lines** (SRP gate is `< 900` — tight; the next change here should extract before adding). Everything below is committed and pushed to RL_MAP `main`. Stale-by-design: don't cite this file in a contract.

---

## 1. NPC portrait row — full redesign, several rounds

Started from last session's newly-added portraits (real transparent art swapped in for bex/ilsa/juno/mara/pip/toby), then iterated live against Roc's screenshots across ~5 rounds:

- **Ground level.** Portraits floated mid-air over the backdrop at first. Now bottom-anchored (`setOrigin(0.5, 1)`) to a fixed floor near the bottom HUD bar, growing UPWARD as they scale — `CAST_FEET_Y = 430`, `CAST_PORTRAIT_H = 680` in `NpcTalkSystem.ts`.
- **No card, no frame, no scrim.** The rectangular card + dark fill is gone for any soul with portrait art — the cutout itself is the only visual and the only interactive hit target (`pixelPerfect: true` so hover/click honor the actual silhouette, not the transparent PNG's full canvas). A soul with no art (`nell`, `linnet`) still gets a small frame+label fallback pill — the only case that still needs one.
- **Hover glow — three iterations.** v1: two offset silhouette copies → read as a ghosted double-outline. v2: one oversized copy → read as a hard-edged second silhouette, not a glow. v3 (current): `HALO_STEPS`, five tightly-packed tinted/additive copies with falling alpha — reads as a soft feather hugging the silhouette. Ember tint when the soul has an active "Talk to" choice, gold otherwise.
- **Tooltip, not a nameplate.** The permanent gold name-plate under the portrait is gone. Name shows in a cursor-following tooltip only on hover (`moveTooltip` on `pointermove`) — deliberately shaped this way since Roc wants to reuse it for region/item hover later (not built as a shared component yet — that's still just this one call site).
- **Talk pills.** The old bare-mono "talk with X" rows in the spell-clue modal are now real §14 choice pills (`choicePill()`), placed first in the modal (ahead of gift/spell rows) since that's what the hover glow was signaling in the first place.
- **Title Case everywhere** a soul name renders — portrait tooltip, modal title/prose, talk pill labels — via `soulDisplayName()` (already existed, used elsewhere for VN nameplates).
- **Fade-in on genuine arrival only.** `drawCast()` fully rebuilds every `render()` call (which fires on every ink `view` change, not just screen moves), so a naive fade would replay on every unrelated action. Added `shownSouls: Set<string>` tracking so only a soul actually NEW to the screen fades in; one already present redraws at full alpha. `clear()` resets the set, so leaving and returning counts as arriving again.

## 2. Backdrop pan — dead zone, smoothing, a real slider

- **Inverted to a dead zone.** `PanModel` gained a `deadZone` option (default false, preserves the old tested "pan while inside the band" contract for any future caller) — CollectScene sets it `true`: pan now holds still while the pointer is in the middle box, and only takes aim once it crosses outside. Added `pointerXBand` too — `PanModel` only ever gated vertically before.
- **Smoothed the crossing.** The dead-zone boundary used to compute the pan target from screen-center-relative position, which meant the target could jump to a large value the instant the pointer crossed out. Replaced with `rampFromEdge()` — a signed 0→1 ramp anchored at the box edge (exactly 0 there), growing to ±1 at the screen edge. Verified numerically: 0 at the edge, a small fraction just past it, not a jump.
- **Pan Speed — the first REAL Options control.** `PlayerSettings.ts` (new, `localStorage`-backed) holds `panTauMs` (range 40–700ms) and exposes `panSpeedPercent`/`setPanSpeedPercent` for a 0–100 slider (100 = fastest). Wired into Options → Display as a live, undimmed slider — every other row on that screen is still the deliberately INERT preview (`OptionsScene.ts`'s own header explains why that's the pattern, not this).

## 3. Fade-in, made universal

Roc: "the modal popup has a nice fade in, can other modals and screen transitions also do that?" → then, after checking: "the npcs pop on, all elements should honor the fade."

- **`sceneFadeIn(scene, ms?)`** (new, `theme.ts`) — a scene's own camera fading in from near-black on `create()`. Wired into every scene that didn't already have an equivalent entrance treatment: `CollectScene`, `HubScene`, `ScreenScene`, `CastScene`, `SatchelScene`, `SaveLoadScene`, `OptionsScene`, `NotebookScene`, `LocationSelectScene`, `CalendarScene`, `ModePickerScene`. Skipped `SpellTrialScene` (its own backing-rect `popIn` is already equivalent).
- **`imageFadeIn(scene, obj, ms?)`** (new, `theme.ts`) — the single-object version, no scale-pop (so a full-bleed backdrop doesn't visibly zoom). Two call sites: `BackdropSystem.sync()` (the actual bug report — F1→F2 and town-to-town screen moves are a same-scene backdrop *swap*, which never runs `create()` and so could never see `sceneFadeIn` no matter how it was tuned) and the NPC portrait/fallback-pill arrival fade in §1.
- **Transition Fade — the second real Options control**, same row family as Pan Speed. `PlayerSettings.fadeDurationMs` (range 200ms–5000ms, bumped from an initial 2s cap at Roc's ask), `fadeSpeedPercent` inverted the same direction as Pan Speed (right = fast) so the two sliders read consistently. Both `sceneFadeIn` and `imageFadeIn` default to this value when no explicit `ms` is passed.

**A real bug found along the way:** the dev server's `/run-images` route (`vite.config.ts`) only set `Content-Type` for `.webp`/`.avif`, defaulting everything else — including the `.jpg` backdrops it always served before — to `image/jpeg`. Roc's first `.png` backdrops exposed this; fixed to actually check the extension.

**Also found along the way, not a code bug:** editing `lantern-projects/v01/manifest.json` does nothing by itself. The game fetches `/story/manifest.json`, a gitignored COPY synced by `npm run prep:content` (`tools/bundle-content.mjs`). Forgot to re-run it after the manifest edit — cost real back-and-forth with Roc before finding it. **Say this out loud next time art/content changes and nothing shows up in-game: run `npm run prep:content`, then hard-reload.**

## 4. Other fixes

- **`mode5-vfx.mjs`** (playtest scenario) was doubly stale, not just the click coordinates the last handoff flagged. It cast `fetch` (a day-1 starter spell) against the hedge obstacle — but NONE of the three starter spells (echo/fetch/glimmer) has an authored `dry_hedge` outcome in `content/magic/*.json`; only `ignite` does, and `ignite` stopped being starter-known back on 2026-08-18 (moved to Blacksmith-taught). Scenario now `knowledge.learn("ignite")` + gives its one component (`item_sticks`, guaranteed forageable at F1) directly off the scene, not via Dev Unlock (which also learns all 16 spells and silently moves every spellbook-grid click target). Verified: `cast:resolved` fires, VFX dispatches.
  - **Real gameplay gap surfaced, not fixed:** a fresh day-1 player who reaches the hedge before ever meeting the Blacksmith has no spell that does anything to it. Needs a content-authoring decision (author `dry_hedge` branches for echo/fetch/glimmer, or restore `ignite` as starter-known, or something else) — not mine to call.
- **§14 citation numbering** — `assignments/assignment-7/style-guide.md` and `loop/score.mjs`'s `RULES` table both cited section numbers that don't match `gdd/14-visual-style-guide.md`'s real headings (§2→§1 palette, §3→§2 typography, §5.1/5.2/5.3→§5 as a plain numbered list, §7 VFX→doesn't exist there at all — closest is §10 empty-state hatch, §9 art→a separate file `09-art-direction.md`, not a section of this doc). Fixed both files; `score.mjs --replay all` still reproduces the same scores with corrected citations.

## 5. Paca board — reconciled, two rulings applied

Ran `/pm` twice this session: once to reconcile the board against everything above (it had zero representation until then — this session's own work wasn't on Paca at all), once more after Roc ruled on two open items.

- **First pass** created 9 cards (`GP-190`–`GP-198`, 4 In Review for the four big features above, 5 Done for the smaller fixes) and surfaced `GP-196` (the day-1 hedge gameplay gap from §4) as a new ruling item. Also caught: review queue at a new high of 20 (oldest `GP-40`, 21 days), and burn against the then-current 2026-08-25 capstone date came out **UNREACHABLE** — 30 open `tier:must` cards over 3 days is 10/day against a proven ceiling of 4.29/day.
- **Roc ruled twice, applied in the second pass:** Assignment #7 is submitted (`GP-40`/`GP-163` closed Done), and the capstone date moves **2026-08-25 → 2026-09-01**, with the content freeze rescheduled **2026-08-21 → 2026-08-28** (`GP-16`, was overdue and unfired). Burn recalculated against the new date: 28 open musts / 10 days = 2.8/day — capstone flips from UNREACHABLE back to **ON_TRACK**.
- **Found, not fixed:** the S4/S5 sprint windows weren't moved when the card due dates were — `GP-16` and `GP-43/44/45` now fall due after their own sprint ends. Flagged for Roc, not changed (a date/scope call, not board maintenance).
- **Still open, unruled, carried forward from before this session:** `tier:must` confirmation on `GP-179`/`GP-181`/`GP-187`/`GP-188`, the `GP-182` starter-component-forageability ruling, and (new) `GP-196`, the hedge gap. Scope cuts #3 (texture souls) and #4 (upper festival tiers) are on offer but no longer needed now that burn is healthy.
- Full numbers in the Paca doc `Readiness — 2026-08-22` (project `game-project`) — this file is the narrative, that doc is the source of truth for anything that changes again before the next `/pm` run.

---

## Open items / for Roc

- **The gameplay gap from §4 / `GP-196`** — day-1 hedge cast has no valid spell. Needs a ruling.
- **Board rulings still open** (§5) — `tier:must` confirmation on `GP-179`/`GP-181`/`GP-187`/`GP-188`, and `GP-182` (starter-component forageability). Also: the S4/S5 sprint windows don't match the new 8/28 and 9/1 due dates — extend them or leave it, Roc's call.
- **Idle-state discoverability** — the frameless NPC portraits have zero affordance until hovered (no border, no cursor cue from a distance). Flagged by the UI Verifier during this session's redesign pass; still true. If a player never mouses over a portrait, nothing tells them it's clickable.
- **Tooltip is still a single call site**, not a shared component — reuse for region/item hover means building that generalization when the need is actually concrete, not before.
- **`casing-before/after.png`** — confirmed OK to ignore (Roc, this session).
- **Carried over, untouched this session:** `ScreenScene.ts` raw hex colors (left alone deliberately — "nearest token" would shift the rendered color), §14 map-thumbnail button, Track 3 notebook/hub theme adoption, the rest of Options (Sound/Text & Speed/Accessibility/Saves are still inert previews — Pan Speed and Transition Fade are the only two real controls that exist), Assignment Scout, the save-slots GDD-vs-code gap.
- **Town-square art** — Roc confirmed handled this session, separately from the T1–T4/T6/T9/TN/FS/HOME manifest swap logged in the prior handoff's open items.

---

## Key files touched this session

| Area | Files |
|---|---|
| NPC portraits | `phaser/src/render/NpcTalkSystem.ts` |
| Pan model | `phaser/src/world/view/PanModel.ts`, `phaser/src/render/BackdropSystem.ts`, `phaser/src/scenes/CollectScene.ts` |
| Settings (new) | `phaser/src/world/PlayerSettings.ts` |
| Fade helpers (new) | `phaser/src/ui/theme.ts` (`sceneFadeIn`, `imageFadeIn`) |
| Options UI | `phaser/src/scenes/OptionsScene.ts` (`DISPLAY_LIVE_ROWS`, `drawLiveSlider`) |
| Scene fade wiring | `CollectScene`, `HubScene`, `ScreenScene`, `CastScene`, `SatchelScene`, `SaveLoadScene`, `OptionsScene`, `NotebookScene`, `LocationSelectScene`, `CalendarScene`, `ModePickerScene` |
| Dev server bug | `phaser/vite.config.ts` (PNG content-type) |
| Content sync | `lantern-projects/v01/manifest.json` + new art files, resynced via `npm run prep:content` |
| Playtest scenario | `phaser/playtest/mode5-vfx.mjs` |
| §14 citations | `assignments/assignment-7/style-guide.md`, `assignments/assignment-7/loop/score.mjs` |
