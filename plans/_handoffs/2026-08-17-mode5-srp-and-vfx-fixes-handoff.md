# Handoff — mode5 SRP extraction complete, VFX + edit-mode fixes, open items against the pivot plan

**2026-08-17, evening · capstone Tue 2026-08-25 · content freeze Fri 2026-08-21**

Follows on from [`2026-08-17-mode5-srp-merge-plan.md`](../2026-08-17-mode5-srp-merge-plan.md) (steps 0–3 landed earlier the same day) and its parent, [`2026-08-17-phaser-pivot-mode4-plan.md`](../2026-08-17-phaser-pivot-mode4-plan.md). This doc covers everything since: the mode5 plan's steps 4–8 (all of it, including the optional step), two real bugs found and fixed along the way, and a full audit of the parent plan against disk. **Read §5 first if you're picking this up** — that's the punch list.

---

## 1. Mode5 SRP extraction — steps 4 through 8, all landed

`CollectScene.ts` went from **1244 lines carrying eleven responsibilities down to 793**, orchestration plus sub-scene launching. Nine systems now live in `src/render/`, each with its own wiring test and a live-browser screenshot proving the mount (not just that the class compiles):

| Step | System(s) | File(s) |
|---|---|---|
| 4 | `ReceiverStateStore` mounted — the 18 stateful spell×receiver pairs (e.g. `temper` on a hot vs. cold billet) now actually resolve differently | `CastPipeline.ts` gained the select→resolve→advance ordering |
| 5 | Backdrop + pan, forage hotspots | `BackdropSystem.ts`, `HotspotSystem.ts` |
| 6 | Satchel strip, modal UI, walker probe | `SatchelStrip.ts`, `ModalFrame.ts`, `WalkerProbe.ts` |
| 7 | Hedge/gated cast prompt, the move-choice traversal row | `HedgeCastPrompt.ts`, `TraversalRow.ts` |
| 8 (optional) | Edit mode — **scoped to hotspot drawing only**, see §3 | `EditModeSystem.ts`, `RegionExport.ts` |

Every step: `npx tsc --noEmit` clean, full vitest suite green (579 tests, up from ~530 at session start), a wiring test asserting the scene actually constructs and delegates to the new class (not just that it exists), and a Playwright screenshot through a real browser proving the mounted behavior. Scratch verification scripts were deleted after each proof — none should remain in `tools/`.

---

## 2. Two real bugs found and fixed, not part of the plan's scope

### VFX was never wired to mode5
`MODE5`'s own `blurb` in `modes.ts` has always promised *"spell VFX"* — but `systems` never listed `"vfx"`. `CollectScene.startVfx()` gates on `mode.systems.includes("vfx")`, and that gate's own comment named `MODE4` (deleted in step 0). `MODE5` was built from `DISCOVER_HOME`, which never had it either, so the entry was simply never carried over. Every cast in mode5 has been silent since the descriptor was written.

Fixed: `"vfx"` added to `MODE5.systems`. Verified live — `this.vfx` went from always-null to constructed, a real `ignite` cast fired `cast:resolved`, and a depth-900 particle object (the VFX backend's own signature depth) appeared in the scene at the instant of the cast. New regression test in `VfxSystem.test.ts` pins `MODE5.systems` containing `"vfx"` going forward.

### A crash in the newly-extracted `TraversalRow`
Found while screenshot-verifying step 7: clicking `[Go to The Stream]` from the very first screen (F1 → F2) crashed `render()` outright. Root cause, **pre-existing since step 3, not introduced today**: `describeGateRule(gateEngine.rules.get(id)!)` asserts a rule exists for every blocking gate id, but a *refused* gate (`G-F4-still`, `G-F8-combine` — see §5 below) intentionally has no entry in `rules` while still correctly blocking. Any screen offering a move toward F4 or F8 crashed the whole render pass.

Fixed with a filter (`TraversalRow.hintFor()`): a refused gate still blocks, it just contributes nothing to the `[needs: ...]` debug hint instead of throwing. Regression test pins the fix and the absence of the old unguarded pattern.

---

## 3. Edit mode — built on the wrong scene first, corrected same day

First mount attempt was `ScreenScene` (mode 1), behind a `?edit=1` URL flag. **Wrong call** — this is *the mode5 plan*, and mode 1 is explicitly supposed to stay untouched throughout it. Caught by Roc, corrected same session: `ScreenScene.ts` is back to byte-for-byte what it was before (diffed against the pre-step-8 commit to confirm), and `EditModeSystem` is now mounted on `CollectScene` instead, gated on `"edit-mode"` in `MODE5.systems` — the same activation shape as `save`/`receiver-states`/`vfx`. `EditModeSystem.ts` itself needed no changes; it was already scene-agnostic.

**Scoped to hotspot drawing only.** The parent plan named three things for edit mode — *"hotspot drawing, lock toggle, story-beat insertion"* — but only hotspot drawing has ever had a real target (19 of 20 screens have no authored region geometry; `HotspotPlacement.ts`'s own header already called out edit mode as the eventual fix). Lock toggle has never been defined beyond those two words anywhere in the repo. Story-beat insertion would need a write path into `scene-graph.json`/`threads/` that doesn't exist — the parent plan itself calls that "the most likely thing to slip."

What it does: `E` key or `[ edit — E ]` HUD button toggles a palette of every declared region id for the current screen; click one to arm it, drag on the backdrop to draw/redraw its rect, `[ export — X ]` copies the merged `regions.json` shape to clipboard + console. **No live write** — there's no backend, so a human pastes the export into `public/story/regions.json` and rebuilds. Verified live on mode5's own F1 screen: armed `r_trail_signs`, drew a rect, exported, confirmed T1's existing authored data passed through unchanged in the same export.

---

## 4. Verification note

Every step this session was verified four ways, no exceptions: `npx tsc --noEmit`, full vitest suite, a wiring test proving construction (not just presence), and a **real screenshot through Playwright launched via Bash** — the `mcp__claude-in-chrome__*` extension tools cannot reach `localhost` in this environment (confirmed cross-namespace issue). This is a stronger bar than several earlier sessions in this project's history had available (compare [`2026-08-13-mode3-and-followups-handoff.md`](2026-08-13-mode3-and-followups-handoff.md) §4, which had no screenshot capability at all) — and it's exactly what caught the `TraversalRow` crash in §2, which no unit test would have seen.

Dev server: `http://localhost:5188` (confirm with `curl -s -o /dev/null -w "%{http_code}" http://localhost:5188` before driving it). Synthetic `page.mouse.click()` coordinates don't reliably hit Phaser's own hit-test math for small/precise targets — where that mattered, a temporary `window.__collectScene = this` hook plus `.emit("pointerdown")` on the found game object was used instead (same handler code path, skips Phaser's hit-test), then removed before moving on.

---

## 5. Still open — the punch list

Checked against disk, not against this or any other status note, per the parent plan's own rule (*"Every phase verifies against disk, never against a status note"*).

1. **`item_hot_stone` + ~4 receiver entries were never authored.** This is why `G-F4-still` and `G-F8-combine` are still refused at load — two of six gates are permanently locked right now, not because of a bug but because the content behind them doesn't exist. `GateEngine.ts`'s own header has the full accounting. This is content work, not code — the engine already correctly refuses rather than silently never-clearing.
2. **Edit mode is one-third built** (§3). Lock toggle and story-beat insertion need their own spec before anyone can build them — there's nothing to extend today.
3. **Asset tracker** — nothing on disk with that name. Named in the parent plan's schedule for the Sat 8/22–Tue 8/25 "Tools & ship" window; not due yet, but also not started.
4. **Approval table app** — found `tools/lantern/fixtures/out/approvals.json` with real-looking per-line approval status data, but no runnable app was found behind it. Worth a closer look before relying on it — may be fixture-only.
5. **Two agent contracts** (Systems Documentarian, Assignment Scout) — not written. `agents/contract-audit.md` has nothing to audit yet as a result.
6. **Docs + mermaid regeneration** — not touched this session.
7. **Manual playtest pass** — has to be a person. Not done.
8. **Assignment #10** — not addressed this session.

**Not gaps, just not due yet:** content freeze is Fri 8/21; everything under "Tools & ship" (asset tracker, docs, agent contracts, playtest, Assignment #10, submission) is scheduled Sat 8/22–Tue 8/25.

**Confirmed already done, in case it's not obvious from disk alone:** `gdd-sync`'s full seven-item queue from the parent plan's "After the build" section is already reflected in the GDD with 2026-08-17 dates — reshuffle dropped from the DoD, ink→UE pushed post-capstone, all six gate rulings recorded in `04-magic-system.md`'s "Gate keys" section, the Assignment #7 due-date correction, the 3D-lock amendment, gates-enforced language, and the bond-ruling narrowing. No `gdd-sync` run needed for this session's work.

**Still explicitly unruled, carried forward from the parent plan, not blocking anything:** whether `G-T8-cipher` is a real gate or narrative-only; `GP-162`'s `tier:must` placeholder; the S3→S4 sprint reshuffle.

The two items that actually threaten Friday's freeze: the F4/F8 content gap (#1 — locks two gates permanently until authored) and edit mode's undefined two-thirds (#2 — can't even be scoped until someone writes down what "lock toggle" and "story-beat insertion" mean).

---

## 6. Phaser skills now installed

28 official Phaser 4 skills, installed globally from [`phaserjs/phaser`](https://github.com/phaserjs/phaser/tree/master/skills) (the engine's own repo — sourced against the real engine code, not a third-party guess). One per subsystem: `scenes`, `physics-arcade`, `physics-matter`, `tweens`, `particles`, `tilemaps`, `input-keyboard-mouse-touch`, `cameras`, `filters-and-postfx`, `v3-to-v4-migration`, `v4-new-features`, and 17 more. No agents, no hooks — reference material only, loaded on demand when a prompt matches a skill's trigger terms.

Installed to `~/.claude/skills/` (global, not project-scoped), so they're available in any Claude Code session on this machine, not just this repo. They load automatically starting next session — a session already in progress when they were installed won't see them until restarted.

A third-party plugin ([`Yakoub-ai/phaser4-gamedev`](https://github.com/Yakoub-ai/phaser4-gamedev)) was also evaluated for its hooks and headless-Playwright playtest harness. Both hooks (`check-v3-api.sh`, `detect-phaser.sh`) were read in full — read-only, no network, fail-open, safe. Full plugin registration means editing `~/.claude/settings.json`'s `extraKnownMarketplaces`/`enabledPlugins` keys, which the auto-mode permission classifier correctly blocks a script from doing directly — that's a `/plugin marketplace add` + `/plugin install` step for Roc to run interactively if the agents/commands/hooks are ever wanted. The harness itself has no such dependency (a standalone Node/Playwright script, no `CLAUDE_PLUGIN_ROOT` reference), so it's now vendored directly into this project instead — see §6b.

---

## 6b. Playtest harness — vendored and wired to this project's own probes

`tools/playtest.mjs` — vendored verbatim from the third-party repo's `phaser-playtest` skill, with a provenance header. Boots the game in real headless Chromium (`playwright-core`, already a devDependency; `npx playwright install chromium` has been run once on this machine) and checks page load, canvas, the Phaser instance, FPS, pixel content, console errors, and asset 404s — the class of failure `tsc`/`vitest` structurally cannot see, same gap the screenshot step filled by hand all session.

Wiring: `src/main.ts` exposes `window.__PHASER_GAME__` under `import.meta.env.DEV` (the harness's own requirement) — dev/preview only, no production cost. Scenario scripts drive the page through `wait|key|press|click|screenshot|expect` steps; `expect.expression` runs via `page.evaluate` with full `window` access, which is what makes it possible to reach this project's own debug probes (`window.__collect`, mode5's `WalkerProbe`) from inside a scenario rather than only generic page checks.

`npm run playtest -- --scenario playtest/<file>.mjs` runs one. Three scenarios exist, one per thing verified by hand this session:

| Scenario | Guards | Notes |
|---|---|---|
| `playtest/mode5-vfx.mjs` | The VFX-never-wired bug (§2) | Forages via the probe (setup only, already covered elsewhere), then drives the actual `[ Cast ]` → `ignite` flow with real clicks. Asserts `cast:resolved` fired as an effect and `VfxSystem.played >= 1`. **Not** asserted on the particle emitter's presence on `children.list` — that's racy against the emitter's own lifecycle/scene redraw timing (confirmed via a throwaway diagnostic: `played` was consistent at 2 across runs where the emitter itself was and wasn't still in the display list at check time). `played`, a plain counter bumped synchronously when `VfxSystem.handle()` dispatches to the backend, is the actual thing worth asserting. |
| `playtest/mode5-traversal-regression.mjs` | The `TraversalRow` render crash (§2) | Navigates F1 → F2 via `window.__collect.choose(index)` rather than a pixel click — deliberate: `choose()` drives ink's own `runToChoice()` → `render()`, the exact path a real click takes, and sidesteps hand-measuring `TraversalRow`'s text-width pixel offsets. The harness's own "no uncaught exceptions" check is the real guard; this crash would fail that outright. |
| `playtest/mode5-editmode.mjs` | Edit mode's mount + `E`-key toggle (§3) | **Known limitation, stated in the file's own header:** this harness has no drag/mouse-hold action (confirmed by reading `runScenario`'s full switch statement — only `wait\|key\|press\|click\|screenshot\|expect` exist), so drag-to-draw a region rect is not covered and can't be without a new action added to the harness itself. Only the toggle and mount are asserted. |

All three run clean: 16/17, 14/15, 14/15 respectively — the one failure in each is the same headless-software-rendering FPS noise (~21–24fps median) every boot check hits in this environment, not a real failure.

`npm run playtest` alone (no `--scenario`) runs just the generic boot checks against mode5's URL — useful as a fast smoke test without picking a scenario.

---

## 7. Running it

```bash
cd ProjectOS/game-project/phaser
npm install
npm run dev              # mode picker -> pick any mode, or ?mode=mode5 directly
npx tsc --noEmit         # typecheck — clean
npm test                 # vitest — 579 tests, all green
npm run walk             # headless week, real pixels
npm run sweep            # all 89 authored cast pairs
npm run gates            # which locked screens an approved spell can open
npm run playtest -- --scenario playtest/mode5-vfx.mjs                   # needs `npm run dev` running first
npm run playtest -- --scenario playtest/mode5-traversal-regression.mjs
npm run playtest -- --scenario playtest/mode5-editmode.mjs
```

`?mode=mode5` skips the picker. `E` toggles edit mode in mode5 (hotspot drawing only — see §3). To see VFX: forage `item_sticks`, click a locked move to open the gated cast prompt, `[ Cast ]` → `ignite` — watch for a brief warm/ember particle burst right at the click.
