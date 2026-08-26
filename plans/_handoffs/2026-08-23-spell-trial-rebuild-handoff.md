# Handoff — SpellTrialScene real build pass (parallel track)

**Written 2026-08-23 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

Run this alongside the [Group 1–3 triage work](../2026-08-23-roc-notes-triage-plan.md) — it touches
`SpellTrialScene.ts` only, no other session's hot files (`HubScene.ts`, `play.ts`,
`SatchelScene.ts`), so it is safe to build in parallel, not serial after those land.

## Why this exists

The 2026-08-23 Mode 5 UX review scored learning-a-spell (`SpellTrialScene.ts`) 0/10 and flagged it
as needing a real build pass, not a token swap: no framed board, no shipped button family, the
paused `NotebookScene` visibly shows through behind it. Full review context:
[`2026-08-23-mode5-ux-review-handoff.md`](2026-08-23-mode5-ux-review-handoff.md) §"What still needs
your call."

## State of the file

[`phaser/src/scenes/SpellTrialScene.ts`](../../phaser/src/scenes/SpellTrialScene.ts) — standalone
cast trial (no receiver, no world target), by deliberate scope cut, per the file's own header
comment. Two modes: CLUE (guess components against the spell's real `components` list; a match
learns it) and KNOWN (cast whenever you hold what's needed). Already imports the real theme
(`COLOR`, `FONT`, `popIn` from `ui/theme.ts`), so token wiring exists — the gap is layout chrome,
not color.

## The open question, needs a call before or during the build

Roc's mockup shows the trial as either a centered 78%-width modal or something closer to
full-bleed. Decide by checking `phaser/tools/screen-flow/mockups/design-system.html` (the live
design-system reference named in `CONTEXT.md`) and the original wireframe this screen came from,
then build to match — don't guess blind. If genuinely ambiguous, screenshot both and ask Roc rather
than picking silently.

## What "real build pass" means here

- Framed board: wrap the scene content in `render/ModalFrame.ts`'s frame chrome (see
  `CollectScene.ts` or `NavRow.ts` for how other scenes call `ModalFrame.buttonRow()` and its
  frame), matching the panel treatment other Tier 1–3 screens already shipped.
- Shipped button family: replace whatever ad-hoc buttons exist now with the same styled-button
  component the Group 2 polish pass is standardizing everywhere else (bracket buttons →
  `ModalFrame` buttons). Don't invent a second button style — if Group 2 lands first, reuse its
  output; if this session runs first, use the existing `ModalFrame` button as the source of truth
  and Group 2 will match this instead.
- Occlusion fix: the paused `NotebookScene` must not show through behind the trial. Check how other
  overlay scenes (e.g. `CollectScene`'s scrim) block the scene beneath and apply the same pattern —
  don't add a second, different scrim technique. The mode5 handoff flags a "scrim compounded to
  black" hazard already documented in `PhaserDialogueRenderPort.ts` — read that before adding a new
  scrim layer.

## Verification

Same standard as the rest of the triage plan: `npm test` + `npx tsc --noEmit` in `tools/lantern`,
then `phaser/tools/playtest.mjs` with a real screenshot of both CLUE and KNOWN modes — a UI change
isn't done until the screenshot looks right, not just green tests.

## Model / effort

**Opus, high** — this is real feature/bug work (new panel chrome), not a mechanical sweep, per the
triage plan's standing rule.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-23-spell-trial-rebuild-handoff.md) in full, plus the
mode5 UX review handoff it references for why this screen scored 0/10.

Goal: rebuild SpellTrialScene.ts (phaser/src/scenes/SpellTrialScene.ts) with a
real framed panel (render/ModalFrame.ts), the shipped button family, and a fix
so the paused NotebookScene doesn't show through behind it.

First resolve the open layout question (centered 78%-width modal vs
full-bleed) against phaser/tools/screen-flow/mockups/design-system.html and
the original wireframe — screenshot both if ambiguous and ask before building
blind.

This can run fully in parallel with any other session working Groups 1-3 of
plans/2026-08-23-roc-notes-triage-plan.md — SpellTrialScene.ts is not a hot
file for that work. Verify with npm test + tsc --noEmit in tools/lantern, then
phaser/tools/playtest.mjs screenshots of both CLUE and KNOWN modes before
calling it done.
```
