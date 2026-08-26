# Handoff — VFX prototype batch (vortex, fetch, scratch, portion, weigh, echo-alt), ready to wire

**2026-08-22 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

Follows the earlier VFX asset-pipeline session that built the `sprite` cue kind (see `PAUSED.md` at the time, since folded back into this session). That session shipped 9 of 16 spells on `sprite`. This one is different in kind: **nothing here is wired into the real game.** Every spell below lives in a standalone HTML prototype under `phaser/tools/vfx-prototypes/`, run against a bare static server, with no connection to `VfxBackend.ts`, `PhaserVfxBackend.ts`, `CueTable.ts`, or `cues.json`. The wiring itself — the actual next session's work — hasn't started. This doc is what it needs to start from.

---

## 1. What's built — six prototypes, all iterated live against Roc's own screenshots

### breath → `vortex-demo.html`
Fully algorithmic — a hand-rolled Graphics tail (tapered dual-stroke, no particle sprites), 10 strands launching as 5 CW/CCW pairs, 150ms apart. Final envelope: `GROW_MS=1400, HOLD_MS=750, FADE_MS=550` (2700ms per strand), `PHASE_SPEED=0.013` (spin rate around the pole), `TAIL_FRACTION=0.5`. This is the most-iterated file this session (9 numbered passes) and the most complete — start here.

### fetch → `fetch-demo.html`
Also a hand-rolled Graphics tail, not particles — same tapered-polyline technique as vortex, tracking recent carrier positions as the object flies from `OBJECT` to `HAND` over `TRAVEL_MS=550`. White only in the first 20% of the tail (`HEAD_FRACTION=0.2`), saturating to `GOLD (#ffd479)` → `TAIL_GOLD (#ffb347)` for the rest — timing pulled from a real asset (see §2). **Do not reintroduce a particle-sprite streak for this** — that was tried twice, read as "crossed rectangles" both times; the continuous-redraw technique is what actually worked.

### scratch → `scratch-demo.html`
Three-layer composite, not one emitter: a quick white flash, an expanding/fading ring (`RING_COLOR=0xd97bd9`), and two spark layers — warm gold/ember round motes (`SPARK_COLORS_WARM`) plus teal streak sparks (`SPARK_COLORS_COOL = [0xd9fff5, 0x7de8d0, 0x3bb8a8]`). Deliberately the smallest-footprint cue of the batch — short travel, no big burst, matching the spell's "minor relief" identity.

### portion → `portion-demo.html`
A quick pulse at `SOURCE`, then `MEASURE_COUNT=4` identical star-glow orbs pop outward on a staggered `Back.easeOut` tween (`POP_STAGGER_MS=70`), hold, then fade **together** (not staggered) — the simultaneity is the point, reinforcing "divided equally." Color is `DUSK (#a893c9)` / `DUSK_CORE (#e9def0)`, portion's authored `colorKey`.

### weigh → `weigh-demo.html`
The odd one out — a continuous suspended *state*, not a burst. Object rises off `GROUND_Y` to `REST_Y` with a spring/bounce, then hangs under two slowly-rotating crossed rings + orbiting stars (`MOTE_COUNT=4`) for `HOLD_MS=1500`, then lowers back down. Structure borrowed from a real asset (§2), not built from scratch.

### echo (ALTERNATE — the shipped cue is `sprite`/`vfx_echo_ripple`; this does not replace it without Roc's word) → `echo-demo.html`
The deepest iteration after vortex (16 numbered passes). Three staggered rings (kapowfx `shockwave.gd` timing — `Expo.easeOut` radius, `Quad.easeOut` thickness), flattened to ellipses (`RING_SQUASH=0.4`) for a ground-plane read. A procedural note glyph (drawn with Graphics, not an external asset — see §2) fires once per cast, `#5fc9ff` blue, narrow upward cone. A dense, wispy cluster of small teal-blue star particles (`color: [0x5fd8ea, 0x006680]`, `scale: 0.13`, 40 particles) wafts up alongside the notes. The original "diamonds converge inward" idea was replaced — it read as a reflection, not an echo — with a second, delayed, fainter *outward* burst (the actual echo of the first).

---

## 2. Real bugs found this session — will bite again if not known

- **Particle `scale: { start: { min, max }, end }` (nested range under `start`) does not resolve in this Phaser build.** The particle's `scaleX`/`scaleY` stays the raw config object instead of a number — confirmed by direct instance inspection, not inferred. A GameObject can't render at a non-numeric scale, so this reads as "invisible," not as an error. Every prototype in this batch uses a **plain number** for `scale.start` — do not reintroduce the nested form when porting to `PhaserVfxBackend.ts`.
- **`GameObject.setTintFill()` was removed in Phaser 4.** Use `.setTint(color).setTintMode(Phaser.TintModes.FILL)` instead. Verified: `FILL` mode correctly respects the source texture's alpha (checked against Phaser's own shader source, `applyTint()` — alpha output is `texture.a * tint.a` in every tint mode) — an earlier "the asset must be broken" diagnosis in this session was wrong; the actual bug was the removed API call throwing silently.
- **A particle emitter's live spawned-particle list is `.alive`, not `.particles`.** Confirmed via direct property inspection.
- **`moveToX`/`moveToY` are LOCAL to the emitter, not world-space.** An emitter positioned at `(px, py)` with `moveToX: px, moveToY: py` sends particles toward world `(2px, 2py)`, not back to `(px, py)` — use `moveToX: 0, moveToY: 0` to mean "back to where the emitter already is." This produced a very visible bug (particles flying to a canvas corner instead of converging) before being caught from a screenshot.
- **No reliable screenshot capability this session.** The Browser pane reported as hidden to automation for the entire session (confirmed: `renderer.snapshot()` calls hung waiting on a render frame that never fired; `canvas.toDataURL()` returned stale/cached buffers on repeat calls). Every visual judgment call this session came from Roc's own screenshots and descriptions, not from a render this agent could see. QA instead leaned on: console-error checks, network 200s, texture-existence checks, and direct live-object property inspection (`.scaleX`, `.tint`, `.velocityX/Y`, etc.) — which is how the two bugs above were actually found and proven, not guessed. Whoever wires this next should verify visually in a real browser tab, not assume a clean console means correct-looking.

---

## 3. Wiring architecture — what "wiring" means, with real anchors

- `VfxBackend.ts:36` — `VfxKind` union, currently `"none" | "filter" | "particles" | "tint" | "glow" | "sprite"`. Needs new members for whichever of the above get promoted — at minimum something for vortex's and fetch's continuous-Graphics-redraw technique (they're structurally identical: a per-frame-redrawn tapered polyline), and decide whether echo's ring/note/star composite is one new kind or three.
- `VfxBackend.ts:48` — `isAnchoredKind()`. New kinds almost certainly belong here (they all anchor to a caster/receiver point, same as `particles`/`sprite` today).
- `PhaserVfxBackend.ts:153` (class body) and the kind switch around `:184–257`, with `spriteFx()` at `:322` as the pattern to mirror — a private render method per new kind, one new `if (cue.kind === "...")` branch added to the dispatch.
- `CueTable.ts` — the `KINDS` list and per-kind param typing. Vortex and fetch need no new params beyond what every cue already carries (`durationMs`, `colorKey`); confirm before adding anything.
- `cues.json` — the actual per-spell rows, still all on their old kinds: `breath` on `particles` (confirmed via this session's own `/pm` readiness check — not guessed), `fetch`/`scratch`/`portion`/`weigh` likewise. `echo` stays on `sprite`/`vfx_echo_ripple` — nothing here should touch that row without Roc explicitly choosing the alternate over the shipped version.

## 4. Recommended order

1. **Vortex → `breath`.** Most iterated, most complete, clearest win.
2. **Fetch's trail technique → `fetch`.** Second-most proven; same underlying technique as vortex, so the new `VfxKind`/render-method work is shared between the two.
3. **Scratch's 3-layer composite → `scratch`.**
4. **Portion, weigh.** Complete but less iterated than the above three — worth a second look from Roc before committing exact numbers.
5. **Echo alternate.** Present as an option, not a swap. It doesn't replace the shipped `sprite` cue unless Roc says so.

## 5. Not done / open

- No TypeScript, no unit tests, no wiring tests, no `npx tsc --noEmit` — every file here is plain HTML/JS, structurally unrelated to the real build until someone ports the numbers over.
- No mockup/asset review happened — this is Roc's own hands-on tuning against a bare canvas, the same kind of live iteration the `sprite` kind went through, not a separate design pass.
- Runtime cost of per-frame `Graphics.clear()`+redraw (vortex/fetch's technique) vs. the GPU-batched particle emitters (everything else) hasn't been profiled — likely fine given `sprite` already does comparable per-frame work, but worth confirming once several of these are live simultaneously.
- `phaser/tools/vfx-prototypes/assets/note.png` and `note2.png` (copied in mid-session from two candidate real assets) ended up unused — the procedural note glyph replaced both. Safe to delete before wiring, or leave as historical reference for why the procedural approach was chosen (see §2's `setTintFill` bug and the "square, not a note" legibility problem — both real findings, not just taste).
- `note-test.html` in the same folder is a scratch isolation-test file, not a prototype — safe to delete.

## 6. Running the prototypes

Static server, not the game's dev server — `.claude/launch.json`'s `"vfx-proto"` config (python `http.server`, rooted at `phaser/`, port 8932):

```
localhost:8932/tools/vfx-prototypes/vortex-demo.html
localhost:8932/tools/vfx-prototypes/fetch-demo.html
localhost:8932/tools/vfx-prototypes/scratch-demo.html
localhost:8932/tools/vfx-prototypes/portion-demo.html
localhost:8932/tools/vfx-prototypes/weigh-demo.html
localhost:8932/tools/vfx-prototypes/echo-demo.html
```

---

## Key files

| Area | Files |
|---|---|
| Prototypes (this session's work) | `phaser/tools/vfx-prototypes/{vortex,fetch,scratch,portion,weigh,echo}-demo.html` |
| Scratch/unused, safe to delete | `phaser/tools/vfx-prototypes/note-test.html`, `phaser/tools/vfx-prototypes/assets/note.png`, `note2.png` |
| Real system — kind union + anchoring | `phaser/src/render/vfx/VfxBackend.ts` |
| Real system — per-kind render dispatch | `phaser/src/render/vfx/PhaserVfxBackend.ts` |
| Real system — param table | `phaser/src/render/vfx/CueTable.ts` |
| Real system — per-spell rows | `phaser/src/render/vfx/cues.json` |
| Static server config | `.claude/launch.json` (`"vfx-proto"` entry) |
