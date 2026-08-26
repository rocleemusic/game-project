# Handoff — Mode 5 UX build, review pass

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to review and in what order.

**Written 2026-08-23 · capstone Tue 2026-08-25 — 2 days out**

---

## State

The full Tier 1+2+3 Mode 5 UX build from
[`2026-08-22-mode5-ux-build-handoff.md`](2026-08-22-mode5-ux-build-handoff.md) is
built. Roc approved full scope (including §3, hint strength) on 2026-08-22, ran
through the `ui-builder`/`ui-verifier` loop via two parallel Workflow runs
(63 agents, then a 35-agent fix pass), and both runs are done. Everything is
committed and pushed through the repo's auto-commit hook. This handoff is for a
**review pass**, not more building — read it, look at the screens, and rule on
the two items still waiting on a decision below.

Two things worth knowing about how this got built, since they shape how much to
trust any single verifier "clean" verdict in isolation: agent self-reports were
spot-checked directly against disk (running `tsc`/tests myself, grepping source)
rather than trusted wholesale — twice, an agent misread a fix instruction as an
empty fix-pass and did nothing, and once, four separate Home Hub build stages
each re-found the same `HubScene.ts` hex-literal defects without any of them
actually closing the loop. Everything below reflects what's confirmed on disk,
not what a builder claimed.

## What's actually done (independently confirmed)

**Tier 1** — HUD nav row (three icon clusters, gold/ember line-art icons, not
emoji; keyboard/Tab-reachable tooltip) · traversal lock label (fiction-first,
raw gate text behind a `?` reveal).

**Tier 2** — hint-strength + drop-confirmation Options settings (the first live
segmented control and live toggle in `OptionsScene.ts`) · cast picker as a
single parchment book page, dead "Use" button cut, hint pill gated by the new
setting · Notebook `???` masking for unseen spells · trial-cast reading both
satchel and banked-at-home pools at once.

**Tier 3** — satchel drop + move (`Inventory.drop()`, satchel now a fixed
6-slot array with holes, two-sided against `LanternPlayer`) · Home Hub palette
icons + found-counter · piece-select actions + chrome regroup · Home Hub
region geometry authored through Lantern's real editor · the 16-cubby shelf
close-up (`HubShelfScene.ts`, built against the real cropped art from
`C:\Users\rocle\Desktop\grok\shelves.jpg`, not a placeholder) · room zoom/pan
(`RoomZoomModel.ts`, reusing `PanModel.panFit()`'s math, deliberate not
ambient) · Home Hub hex-literal/contrast sweep, now zero raw hex in
`HubScene.ts` · Home Hub non-drag placement/move (closes a real WCAG 2.5.7 gap).

**Found and fixed along the way, not in the original wireframe scope:**
- The `tools/lantern` regression the drop/move feature caused (`StagePane.test.tsx`
  never got `satchelSlots`) — confirmed fixed, `tsc` clean, 21/21 passing.
- The mid-screen "Open the calendar" button doing nothing but advancing an ink
  text knot instead of opening the real `CalendarScene` — fixed. Turned out not
  to be an open product question: `CalendarScene.ts`'s own header already
  documents Roc's rule that it's read-only, not a picker, so the ink knot's
  own destination choices staying separate is correct as built.
- §1 "Pickup — the forage hotspot" (the hover/examine card before a pickup,
  `"???"` for a never-seen item vs. the real name once discovered) — this was
  the one wireframe section with **zero** build work in the original pass,
  confirmed by git history. Built now.
- The shelf-hint label's contrast (`"high shelf — N/16 filled"`, ~1.76:1
  against the room photo) — its sibling labels already had a background chip,
  this one didn't. Fixed directly, not through another agent pass
  (`HubScene.ts:513`).

## What still needs your call

- **Learning-a-spell (`SpellTrialScene.ts`) scored 0/10 and is still 0/10.**
  No framed board, no shipped button family, the paused `NotebookScene`
  visibly shows through behind it. This reads as a screen needing a real build
  pass — new panel chrome, not a token swap — and there's a real open question
  on whether it should be the mockup's centered 78%-width modal or something
  closer to full-bleed. Worth deciding priority before it's queued again.
- **Home Hub `sill` surface geometry is wrong.** The authored region lands on
  the window glass, not the ledge with the three plants. This needs someone to
  re-eyeball `home-hub-diorama.png` against the region editor, not a code fix —
  `decor-surfaces.json` and its runtime copy both need the corrected rect.

## Architecture

[`phaser/ARCHITECTURE.md`](../../phaser/ARCHITECTURE.md) was regenerated from a
fresh walk of `src/` (Systems Documentarian, 2026-08-23), diffed against the
2026-08-19 version. Four modules are genuinely new: `PlayerSettings.ts` (the
first real persisted player-preference store), `RoomZoomModel.ts`,
`HubShelfScene.ts`, `NavRow.ts`. Nothing removed, nothing changed tier. Worth
flagging even though it's out of the governed tiers: `ui/theme.ts` now depends
on `PlayerSettings` for its default fade duration — the old assumption that
theme imports are always incidental now has one real exception.

## GDD

Ran `gdd-sync`. This session's real decisions (full Tier 3 approved, §3
confirmed, the shelf-art source) don't map to any `gdd/` file — they're either
already self-documented in the wireframe (the right home for UX-flow rulings)
or pure execution/process choices. No scope tier, gate, risk, or milestone
changed. Nothing written to `gdd/`.

## Loose ends, not urgent

A handful of scratch/probe files agents created during verification
(`.tmp-verifier-probe*.mjs`, a couple of `playtest/*debug*.mjs` files) are
deleted in the working tree but not yet committed — the auto-commit hook
doesn't seem to catch deletions the way it catches saves. Harmless, but worth
a `git add -A` and a commit next time someone's in there. There's also a stray
`bash.exe.stackdump` at the repo root from a crashed shell somewhere in this
session — safe to delete.

## Facts worth not re-deriving

- Both build runs: original `wf_e906d8d2-745` (63 agents, ~7.5h, full Tier
  1-3), fix pass `wf_d8ccf5ce-5d6` (35 agents, ~2.9h, the regression + four
  needs-fix items + the calendar bug + §1). Journals under each run's
  transcript dir if you need to re-check any single agent's actual output
  rather than its summary.
- The satchel is now a fixed 6-slot array that can hold gaps (`null` entries),
  not a dense append-only array — this is a real, load-bearing data-model
  change in `LanternPlayer`, not just a UI change. `effectiveSatchel()` still
  reconciles both sides; both `Inventory.drop()` and `LanternPlayer`'s
  slot-level methods have to move together or a dropped item reappears on
  resync.
- Home Hub placement is stored per surface/cubby ID everywhere now, never a
  raw x/y — that's what lets the isometric room view and the front-on shelf
  close-up render the same fact correctly without sharing a coordinate space.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-23-mode5-ux-review-handoff.md) in full.

Goal: review the Mode 5 UX build (both original build and fix pass are done,
everything committed). This is a review session, not a build session.

1. Start the dev server (tools/lantern && npm run dev) and click through the
   built screens yourself: HUD nav row, cast picker, notebook, satchel
   drop/move, Home Hub (palette, piece actions, shelf close-up, room zoom/pan),
   the calendar fix, the pickup examine card. Confirm they look and feel right,
   not just that a verifier scored them clean.
2. Rule on the two open items: learning-a-spell's real build pass (scope and
   priority), and the Home Hub sill surface geometry fix (small, but needs a
   human eye on the reference art, not another agent guess).
3. Decide whether either open item is worth doing before capstone (Tue
   2026-08-25, 2 days out as of this handoff) or should stage for after —
   phaser/ still may not gate Track A or compete with Track B for review time,
   per CONTEXT.md's standing rule.

Wait for my answers before building anything.
```
