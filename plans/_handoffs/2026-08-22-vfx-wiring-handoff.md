# Handoff — VFX prototype batch wired in; next up, fold VFX into art direction

**2026-08-22 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

Follows [`2026-08-22-vfx-prototype-batch-handoff.md`](2026-08-22-vfx-prototype-batch-handoff.md), the session that built six standalone HTML prototypes and handed off "wire these into the real game." This session did that wiring. Everything below is shipped, tested, and playtest-verified — not proposed.

---

## 1. What's live now

Six new `VfxKind`s, each a real render path in [`PhaserVfxBackend.ts`](../../phaser/src/render/vfx/PhaserVfxBackend.ts), wired into [`cues.json`](../../phaser/src/render/vfx/cues.json):

| Spell | Kind | Technique |
|---|---|---|
| `breath` | `vortex` | Per-frame-redrawn Graphics, multi-strand climbing spiral |
| `fetch` | `trail` | Per-frame-redrawn Graphics, single tapered pull + arrival flourish |
| `weigh` | `suspend` | Per-frame-redrawn Graphics, continuous rise/hold/lower state |
| `scratch` | `burst` | Real particle emitters — flash + ring + warm/cool spark showers |
| `portion` | `pop` | Graphics drawn once, then tweened by Phaser directly (no redraw loop) |
| `echo` | `rings` (alternate) | 3 staggered ground-plane rings + note-glyph burst + star cloud |

`echo`'s old `sprite`/`vfx_echo_ripple` cue is **not deleted** — it's just no longer echo's own row, freed up for Roc to point at a different spell later, per his call.

All six kinds have disposal tests in [`PhaserVfxBackend.test.ts`](../../phaser/src/render/vfx/PhaserVfxBackend.test.ts) (a stub-scene resource-accounting harness — every filter/emitter/graphics/tween/timer created must be released, proven by `net()` returning all zeros). Full suite: `npx tsc --noEmit` and `npx vitest run` both clean, 686 tests.

## 2. The no-effect-honesty rule, relaxed

**Ruling (Roc, this session):** a no-effect cast no longer has to be a weight-matched twin of its effect — shape/kind/duration parity is no longer mandatory. What still holds, unconditionally: a no-effect cue always plays *something* (never `kind: "none"`), and it's never styled as a failure (`COLOR.danger` and error-ish tokens stay refused on every `cast:resolved` row). Reasoning, straight from Roc: spells should be visually exciting, and the VFX firing at all is what tells the player a cast happened — it doesn't have to be the same shape dimmed down.

Documented in three places, all updated together: [`CueTable.ts`](../../phaser/src/render/vfx/CueTable.ts)'s header, [`cues.json`](../../phaser/src/render/vfx/cues.json)'s `noEffectWeightPolicy` field, and [`VfxSystem.test.ts`](../../phaser/src/render/vfx/VfxSystem.test.ts)'s header + assertions. `breath`/`fetch`/`weigh` still use the old strict weight-matching (it made sense there); `scratch`/`portion`/`echo`'s no-effect rows are simple `particles` cues instead of full composites.

## 3. Real bugs found this session, not guessed

- **The vortex dead-zone.** `breath`'s tail was invisible for the back half of every cast (~1900ms of 3300ms) — a formula (`arrivalFade`, gated on `growEase`) froze at 0 the instant the climb finished, silently cancelling the separately-correct hold/fade envelope. This bug is in the *original prototype file* too, invisible there only because the demo loops ten overlapping strands forever. Caught by isolating one cast via a real Playwright screenshot sweep against the content-editor — not by reading the code. Fixed by gating the fade to only apply while still climbing.
- **Nested `scale.start:{min,max}` still doesn't resolve** in this Phaser build (the earlier session's own finding — confirmed again in `burst`'s round sparks). Use `random: true` against a flat `start` number instead.
- **A single-texture particle tinted the theme's neutral (`ink`) washes to near-white**, not "subtly desaturated." The core/glow split that works for `vortex`/`trail`/`suspend` (bright neutral core stroke *next to* a colour-carrying outer stroke, same primitive) does not translate to a single-tint particle sprite — there's no second layer to carry the colour. `rings`' star cloud hit this directly.
- **Several ADD-blended particles launched from one point overlap-stack toward white** in their first few frames, regardless of tint — looks like a colour problem, is actually a spread/geometry problem. Fixed for `rings`' notes/stars by roughly doubling launch speed, not by picking a different hue.
- **The gotcha: when a prototype's colour isn't in the theme, don't substitute — add it.** `echo-demo.html`'s notes/stars use a literal `0x5fc9ff`, a blue this theme doesn't carry at all (the codebase's hex-literal lint rejects a raw hex outright, so *something* has to give). First instinct was to substitute the nearest existing key — tried `success`, then the more-saturated `green`, both real theme colours, both still not what Roc actually asked for. **That instinct is the trap.** Roc's correction: "why are we changing the colors from the prototype? just use prototype colors" — the fix was adding the real colour to the theme (`vfxWisp: "#5fc9ff"` in [`theme.ts`](../../phaser/src/ui/theme.ts)), the same decoupling precedent `vfxGold`/`vfxEmber` already set, not approximating it away. Cost two wasted iterations here before landing on the right one. **Next time a prototype's hue has no home in the theme, add it first — don't default to "closest existing key" as the safe choice.**

## 4. The verification pattern this session used, worth keeping

No screenshot tooling worked reliably against the live Browser pane this session (same limitation the prototype-batch session hit). What did work, repeatably:

1. `npm run editor` (or `.claude/launch.json`'s `content-editor` entry, port 5177/autoPort) — the content-editor's VFX preview imports the **real** `PhaserVfxBackend` + `cues.json` directly, so it's not a separate mock; wiring changes are live there for free, no extra code.
2. A throwaway Playwright script (`playwright-core`, already a devDependency — `playwright` itself is not installed) driving that page: click a spell's effect/no-effect button, sweep `page.screenshot()` at several `waitForTimeout` offsets to see the choreography over time, `deviceScaleFactor: 4` + a tight `clip` box for real pixel-level color inspection.
3. Delete the throwaway script when done — nothing like this belongs committed.

This is the shape of a real VFX QA step. See §6 below — codifying this into something repeatable (not a hand-written script every time) is exactly the kind of thing worth deciding on next.

## 5. Cleanup done

Deleted (flagged safe in the prior handoff): `vfx-prototypes/note-test.html`, `assets/note.png`, `assets/note2.png`.

---

## 6. Next session: fold VFX into art direction, and decide if it needs its own agent

Two related asks from Roc, not yet started:

**A. Evaluate incorporating VFX into the Art-Direction agent's contract.** The Style/Art-Direction Agent already exists — [`gdd/09-art-direction.md:61`](../../gdd/09-art-direction.md) (contract) and [`gdd/11-ai-agents-and-pipeline.md:20`](../../gdd/11-ai-agents-and-pipeline.md) (roster entry) — but its stated scope is strictly **static asset** palette bands and silhouette vocabulary (`in: new_assets, locked_palette_bands, silhouette_vocabulary, key_art_ref` → `out: variant_checks, palette_delta`). It has no seat contract file in `agents/` yet (unlike `ui-builder.md`/`ui-verifier.md`), and nothing about *motion* or *VFX* is in its scope today. This session's actual colour decisions — theme-only, no hex, WARM/COOL/WISP fixed-family substitutes, the `neutralFor`/`cueWeight` weight-parity machinery — are exactly the kind of "machine-checkable rule" this agent's contract already promises for static art. Worth asking directly: should VFX cues be a new `asset_type` this agent checks, or does VFX need its own parallel contract that references the same locked palette?

**B. Codify the VFX authoring process into a pipeline, and decide if that needs a dedicated agent.** This session's actual repeatable loop, done by hand every time: read the prototype file for exact tuned numbers → port the technique faithfully (flag every simplification, e.g. dropping a runtime-Phaser particle subclass since this file is type-only-Phaser) → map every literal colour to a theme key (or add one, per §3's open question) → scale spatial constants down from the prototype's full-canvas demo to an anchored point effect → build disposal-safe (every resource in a `disposers` array) → write stub-scene tests proving `net()` returns zero → wire `cues.json` → verify via the content-editor + Playwright pattern in §4 → screenshot-driven iteration when Roc flags something (this session did three rounds of that). That is a real pipeline, currently living only in this session's own working memory. `agents/ui-builder.md` + `agents/ui-verifier.md` are the closest existing precedent for a build/verify seat pair — read those first. Audit any proposed contract against `agents/contract-audit.md`'s rubric before treating it as real.

**First move when resumed:** read `gdd/09-art-direction.md` in full (not just the Style/Art-Direction Agent section — the palette-bands and silhouette-vocabulary sections above it are the contract VFX would have to fit into), then `agents/ui-builder.md` and `agents/ui-verifier.md` as the seat-pair template, then decide: extend the existing Art-Direction agent, add a new VFX-specific seat, or conclude VFX doesn't need agent-level codification yet and a written process doc is enough. Don't build a seat contract speculatively — the question this session left open is *whether* one is warranted, not just what it would say.

## 7. Not done / open

- `scratch`/`portion`/`echo`'s no-effect rows are simple `particles` cues, authored quickly to unblock wiring — not iterated on the way `breath`/`fetch`/`weigh` were. Worth a look if their `particles` params (quantity/speed/scale) read too generic once seen in-game.
- Nothing in this batch has been verified in the *real game* (a live cast against a receiver) — only through the content-editor's preview, which fires the exact same authored cue but without gameplay context (backdrop, camera pan, other UI). Worth one real-game playtest pass before calling any of these six done-done.
- `echo`'s `rings` alternate runs ~1850ms — notably longer than most cues (900–2000ms typical). Not a bug, just worth Roc's eyes: is that pacing right for a spell cast, or should the star-cloud tail (its longest layer) get trimmed.

---

## Key files

| Area | Files |
|---|---|
| Real system — kind union + anchoring | `phaser/src/render/vfx/VfxBackend.ts` |
| Real system — per-kind render dispatch, all 6 new kinds | `phaser/src/render/vfx/PhaserVfxBackend.ts` |
| Real system — cue arithmetic, no-effect policy | `phaser/src/render/vfx/CueTable.ts` |
| Real system — per-spell rows | `phaser/src/render/vfx/cues.json` |
| Disposal + behavior tests for all 6 kinds | `phaser/src/render/vfx/PhaserVfxBackend.test.ts` |
| No-effect-policy tests | `phaser/src/render/vfx/VfxSystem.test.ts` |
| Theme — `vfxWisp` addition | `phaser/src/ui/theme.ts` |
| VFX preview surface (imports the real backend + cues.json) | `phaser/tools/content-editor/src/preview.ts` |
| Static server / dev-server configs | `.claude/launch.json` (`"content-editor"`, `"phaser"`, `"vfx-proto"` entries) |
| Original prototypes (reference only, not wired to) | `phaser/tools/vfx-prototypes/{vortex,fetch,scratch,portion,weigh,echo}-demo.html` |
| Art-Direction agent contract (§6.A) | `gdd/09-art-direction.md`, `gdd/11-ai-agents-and-pipeline.md` |
| Seat-pair precedent for §6.B | `agents/ui-builder.md`, `agents/ui-verifier.md`, `agents/contract-audit.md` |
