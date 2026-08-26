# Handoff — sprite VFX fixed everywhere, and a new home for engine gotchas

**2026-08-23 · capstone Tue 2026-08-25 — 2 days out**

Follows [`2026-08-23-vfx-kinds-handoff.md`](2026-08-23-vfx-kinds-handoff.md) (plume/beacon/eruption shipped). Roc's report: particle-kind VFX played fine and showed up in mode5; sprite-kind VFX played nowhere. This session found the real cause, fixed it, verified it live, then built `phaser/dev-notes/` — a new folder for exactly this kind of engine/tooling trap — and seeded it with today's finds plus a sweep of `PhaserVfxBackend.ts`'s own comments and the rest of this `_handoffs/` folder.

## 1. The sprite VFX bug — real cause, not a guess

Seven spell cues (`dry`, `furrow`, `glimmer`, `ignite`, `leap`, `preserve`, `seal`) use `kind: "sprite"` in `cues.json`. `PhaserVfxBackend.spriteFx()` needs its `textureKey` already loaded on the scene — if it's missing, `spriteFx()` returns `null` silently, by design (a content-wiring gap isn't a throw). Nothing in the real game's boot path ever loaded the nine PNGs those cues name from `public/art/vfx/`. Only the content-editor's preview scene (`tools/content-editor/src/preview.ts`) loaded them, which is the entire reason sprites worked there and nowhere else. The art was on disk the whole session before this one — nothing ever told the game to load it.

**Fix:** [`PreloadScene.ts`](../../phaser/src/boot/PreloadScene.ts) now loads the same nine spritesheets `preview.ts` already used successfully, in the one preload path shared by every game mode (`daylife`/`collect`/`discover-home`/`mode5`).

**Why `VfxSystem.played` didn't catch this.** It counts a cue as played whenever `backend.play()` returns an active handle — true even when `spriteFx` silently returned `null`. Any check that stops at `played` will pass while the sprite never rendered. The only real proof is finding the actual live `Sprite` GameObject in the scene's `children.list`.

**Verified live**, not just by test: `tools/playtest.mjs` driven through the real UI (mode picker → Forager's Clearing → cast `ignite`) confirms a live `vfx_ignite_flame` sprite exists in `CollectScene` right after the cast. `tsc` clean, 706 tests pass.

## 2. `playtest/mode5-vfx.mjs` was stale in three ways, unrelated to the fix above

Found while trying to verify #1 live. All three cost real time to diagnose:

- It skipped `ModePickerScene` entirely and started scenario clicks assuming the game was already past it. The real boot always starts there.
- Every click coordinate in the file was written in 1920x1080 game space. The harness's `click` action adds x/y straight to the canvas's CSS bounding box (1280x720 by default under `Scale.FIT`) — a game-space coordinate below CSS y≈720 silently misses the canvas.
- The "click Cast, then click a spellbook row" two-step flow this scenario drove no longer exists — the hedge modal's "WHAT YOU KNOW" row is the spell picker now, one click.

All three fixed in the scenario file itself. It also flaked on `wait`-only scene transitions even at 1500ms — fixed by putting a `screenshot` step between each transition, which turned out to be load-bearing for reliability, not just diagnostic (see `dev-notes/headless-raf-pacing-needs-screenshot-flush.md`).

## 3. New: `phaser/dev-notes/` and `phaser/CONTEXT.md`

Roc's call, mid-session: these traps kept costing real time and had nowhere durable to live — not `GAPS.md` (content/design gaps), not `FINDINGS.md` (Unreal-port recommendations), not a handoff (stale by design). `phaser/CONTEXT.md` is the new process doc: what the folder is for, when a trap earns a note, the file format, and the rule that a code comment explaining a past gotcha should be short and point at its `dev-notes/` file — never repeat the full explanation inline, or the two copies drift.

**15 notes, seeded three ways:**
- This session's 3 finds (the sprite-texture bug, the click-coordinate system, the rAF-pacing fix).
- 8 pulled out of `PhaserVfxBackend.ts`'s own comment blocks — particle `explode`/`moveTo` taking emitter-local coordinates, the `rotate`-before-`angle` particle-facing trick, Phaser 4's tint defaulting to MULTIPLY (`setTintFill()` is also gone in v4), the nested-`{min,max}` scale trap, `frameTotal`'s hidden `__BASE` frame, two tweens sharing one `Graphics` object clobbering each other's draw, `setMask()` no-op under WebGL, and Container children ignoring `.setDepth()`. Every one of those eight comments shrank to a line or two plus a pointer — `PhaserVfxBackend.ts` lost 92 net lines with zero behavior change (`tsc` clean, same 706 tests pass).
- 4 mined from the rest of this `_handoffs/` folder — Claude-in-Chrome can't reach `localhost`/`file://`, a shared Playwright context leaking save state across screenshots, a Vite dev-route content-type whitelist trap, and the `scene.time.now`-polling technique for screenshotting a running VFX cue at an exact moment (from `2026-08-23-vfx-kinds-handoff.md` §3 — promoted out of a handoff into a durable note, per this folder's own promotion rule).

Roc explicitly asked to leave the existing short cross-references to `setMask`/Container-depth in the other 7 files that already mention them (`SatchelScene.ts`, `HubScene.ts`, etc.) — those are already a line or two each, not duplicated paragraphs, so they weren't rewritten to point at the new notes. Full index: [`../../phaser/CONTEXT.md`](../../phaser/CONTEXT.md).

## 4. A discrepancy worth Roc's eyes, not silently fixed

Root `CONTEXT.md` and the `mode5-ux-*` handoff lineage both say **capstone Tue 2026-08-25**. The `vfx-*` handoff lineage (`2026-08-22-vfx-prototype-batch-handoff.md`, `2026-08-22-vfx-wiring-handoff.md`, `2026-08-23-vfx-kinds-handoff.md`) all say **Tue 2026-09-01**, copied forward across three handoffs without anyone catching it. This handoff uses 2026-08-25, matching root `CONTEXT.md`'s "the one date that does not move." Not corrected in the older files — flagging it rather than guessing which is the typo.

## 5. Not done / open

- `dev-notes/` sweep covered `PhaserVfxBackend.ts` and this `_handoffs/` folder. Other files flagged in the earlier scan (`SatchelScene.ts` etc.) were left as-is per Roc's call in §3.
- Nothing in this session touched game content, the Paca board, or any spell record.

---

## Key files

| Area | Files |
|---|---|
| The fix | [`phaser/src/boot/PreloadScene.ts`](../../phaser/src/boot/PreloadScene.ts) |
| The backend this fix unblocked | [`phaser/src/render/vfx/PhaserVfxBackend.ts`](../../phaser/src/render/vfx/PhaserVfxBackend.ts) — `spriteFx()` |
| Regression scenario, rewritten | [`phaser/playtest/mode5-vfx.mjs`](../../phaser/playtest/mode5-vfx.mjs) |
| The dev-notes system | [`phaser/CONTEXT.md`](../../phaser/CONTEXT.md), [`phaser/dev-notes/`](../../phaser/dev-notes/) |
| Where sprite art already lived, unloaded | `phaser/public/art/vfx/*.png` |
| The already-working loader this fix copied | `phaser/tools/content-editor/src/preview.ts` |
