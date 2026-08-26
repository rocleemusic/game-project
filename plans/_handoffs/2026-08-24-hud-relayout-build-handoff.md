# Handoff — T14 HUD relayout: Explore tenant built and verified

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to review and in what order.

**Written 2026-08-24 · capstone Tue 2026-09-01, content freeze Fri 2026-08-28**

---

## State

T14 — the HUD relayout ruled in
[`2026-08-23-hud-relayout-ruling.md`](../2026-08-23-hud-relayout-ruling.md) and
extended today with §1b (Wait/End-the-day placement, ruled 2026-08-24) — is
built for its carded scope: the **Explore tenant only** (§1 + §1b). A build
session executed it, a separate verify pass checked the build's own report
against disk, tsc, tests, and a real pointer-driven playtest run compared
frame-by-frame to the wireframe. **PASS, nothing the build claimed was
contradicted.** Paca `GP-202`, status **In Review** — Roc hasn't looked at it
yet.

## What's built

- `phaser/src/render/HudBar.ts` (new) — the bar owner. Mounts one tenant
  (explore, today), owns every hotkey on the bar (`S N H L O W E`) and the
  End-day confirm modal.
- `phaser/src/render/MoveRegions.ts` + `phaser/src/world/view/MoveRegionPlacement.ts`
  (new) — dashed clickable regions on the screen art, replacing `[Go to X]`
  text-button choices. The gate-checking machinery (locked-label text, the
  `?` hint pin, the refused-gate crash guard) moved here wholesale from
  `TraversalRow.ts` — a region has to make the same three decisions a pill did.
- `phaser/src/render/NavRow.ts` — anchor moved bottom-center, tooltips now
  open above (no room below anymore), Decorate caption cut (§4), gained a
  fourth cluster past a divider: Wait tile (hotkey **W**) and an ember
  `End day · E` pill, both carrying visible in-tile hotkey letters.
- `phaser/src/render/TraversalRow.ts` — now draws only non-hub choices (looks,
  scene entries, `continue`). No gate-engine imports left in this file.
- `tools/lantern/src/lib/play.ts` — gained an **additive** `hubAction?:
  "exit" | "wait" | "endday"` field on `PlayChoice`. `kind` itself
  (`"spoken"|"deed"|"move"`) was deliberately left untouched — `kind: "move"`
  has folded "Go to X" and "End the day" together since 2026-08-01, and
  `CollectScene`'s VN-scope boolean depends on exactly that grouping at
  night, when `[End the day]` is the only hub choice ink still offers.
  Splitting it would have silently handed the night hub to the VN dialogue
  box. Confirmed via `git log -S` that `kind`'s assignment predates this
  build and is unmodified.
- `regions.json` (`phaser/public/story/` and `lantern-projects/v01/`) — new
  `"moves": {}` key, sibling to `"screens"`, currently empty. `EditModeSystem.ts`'s
  clipboard export was fixed to pass `moves` through — before, exporting and
  pasting authored regions would have silently dropped any move geometry,
  moot today only because there isn't any yet.
- Dev-workflow change: mode5 edit-mode's hotkey moved bare `E` → **Shift+E**,
  since the wireframe claims bare `E` for the player-facing End-day pill. A
  shipped control outranks a dev overlay. Two separate `keydown-E` listeners,
  opposite `shiftKey` guards — can't double-fire. Dev pill relabelled
  `[ Edit — Shift+E ]`.

## Verified independently

`npx tsc --noEmit` clean in `phaser`, `tools/lantern`, `tools/resolver`.
`phaser` 767/767 tests. `tools/lantern` 754/755 (1 pre-existing, unrelated —
`personasFixture.test.ts`, chokes on `cast/appearance.md` having no `npc_id`
row, untouched since 2026-08-22). New playtest `phaser/playtest/t14-hud-bar.mjs`:
19/19, the only failure anywhere being the harness's frame-rate probe
(~25fps), reproduced identically on a scenario-less baseline — pre-existing,
environmental, not this build.

Screenshots (`phaser/.playtest/t14-hud-bar*/`) checked by eye against the
wireframe's §1/§1b AFTER frames: bottom-center capsule bar, tooltip opening
above and reading "Satchel · S", in-tile hotkey letters visible, gated region
reading "The Tavern / Inn — the way is blocked" in muted (never red, per the
project's own `NoEffectHonesty` rule) with the `?` hint pin, a real pointer
click walking the screen and regions redrawing for the new one, the End-day
pill opening a confirm ("Whatever is still undone stays undone") without
advancing the day, top-right holding only dev pills, zero leftover
Go-to/Wait/End-the-day text anywhere.

Two real visual bugs the screenshot caught that `tsc`/`vitest` could not:
fallback move-regions were covered by a HUD scrim (fixed with new band-bottom
and row-gap constants), and a 2px dash was unreadable against a light
backdrop on T1 (fixed with a dark underlay stroke, verified legible on both
T1 and the dark F5 backdrop).

**One thing the build session's own report never mentioned, caught only by
the verify pass:** `tools/resolver`'s `npm test` has 6 pre-existing failures
in `test/walk.test.ts` (content/day-gate reachability — `CH-T7-toby-2`,
`CH-T2-11-2`, etc.). No file overlap with anything T14 touched, no
uncommitted resolver diff — same-day commits to `scene-graph.json` /
`screen-specs.json` / `role-workplace.json` (unrelated narrative-content
work) are the likelier cause. Looks pre-existing and out of scope, but a
build report staying silent on a whole suite's failures rather than
disclosing-and-dismissing them is itself worth naming, so a future session
doesn't have to rediscover it cold. Nobody has yet confirmed *why* those 6
fail or whether they predate today.

## What still needs a call

Nothing is flagged as broken. Two things worth Roc's eyes because they're
judgment calls, not defects:

- **The Shift+E hotkey move.** Bare `E` now belongs to the shipped End-day
  control; mode5's edit-mode overlay moved to Shift+E. Reasonable call, but
  it's a dev-workflow change nobody explicitly ruled — worth a glance.
- **`kind` vs `hubAction`.** The build deliberately left `PlayChoice.kind`
  alone and added a parallel field rather than touching the host layer's
  existing move/end-day grouping. Verified safe (zero lantern test changes,
  `CollectScene`'s night-hub behavior unaffected) but it does mean two
  overlapping classifications of the same choice now exist side by side in
  `play.ts`. Fine as shipped; worth knowing it's there if `kind` ever needs
  touching again.

## Open — not this task's scope, but don't lose these

- **Move-region authoring has no editor.** `regions.json`'s new `moves` key
  is empty everywhere; every screen runs on the fallback layout. T11's region
  editor (`EditModeSystem`) only draws examinables — it doesn't know how to
  author a move region yet, even though the export/import round-trip is now
  safe for one. This is the natural next task the ruling doc itself pointed
  at ("the region editor is the shared tool").
- **§2 (casting) and §3 (dialogue) are not mounted into `HudBar`.** The
  parallel cast-flow session (see below) built `HedgeCastPrompt` (a modal)
  and left `SatchelStrip` as a passive readout, not a picker — neither is a
  bar tenant. `HudBar` has a documented mount seam for both, sized for one
  tenant today. Plainly: **"One bar, three tenants" is currently one bar, one
  tenant.** The other two tenants exist as separate UI surfaces, not as
  swapped bar contents.
- **`SatchelStrip`'s left-aligned readout (x=40)** has no measured collision
  with the bar (centered ~690) today, but nobody's checked it against a full
  or long carried-item list.
- **`tools/resolver`'s 6 pre-existing `walk.test.ts` failures** (see above) —
  nobody has confirmed cause or age.

## Group 5 / Group 6 status — unchanged since yesterday, still the alignment point

Carried forward from
[`2026-08-24-forage-reconcile-build-handoff.md`](2026-08-24-forage-reconcile-build-handoff.md),
confirmed still current today. All five Group 5 rulings are indexed at
[`2026-08-23-group5-rulings-handoff.md`](2026-08-23-group5-rulings-handoff.md).

**Group 5 (T13–T17), all ruled 2026-08-23.** One real blocker, shared by
three of the five: `narrative-pipeline/register.md` hasn't been rewritten —
last touched 2026-08-09, no change since. That gates:
- **T15 NPC dialogue rework** — blocked. Spec:
  [`2026-08-23-npc-dialogue-rework-ruling.md`](../2026-08-23-npc-dialogue-rework-ruling.md).
- **T16 Intro story** — blocked, same gate. Spec:
  [`2026-08-23-intro-story-ruling.md`](../2026-08-23-intro-story-ruling.md).
- **T17 Item descriptions** — blocked, same gate. Spec:
  [`2026-08-23-item-descriptions-ruling.md`](../2026-08-23-item-descriptions-ruling.md).

Not blocked, just not picked:
- **T13 Year-loop saves** — no dependency, genuinely large (new ink
  begin-new-year entry point, save-schema bump, slot-set model change).
  Staged post-capstone by size alone. Spec:
  [`2026-08-23-year-loop-saves-ruling.md`](../2026-08-23-year-loop-saves-ruling.md).
- **T14 HUD relayout — this handoff.** Built (Explore tenant), in review.

**Group 6** (minimap, custom loading screens, irregular examine-region
shapes, first-load speed profiling) — parked post-capstone, untouched, no new
information changes that.

**Per Roc (2026-08-24, this session):** the other parallel session working
this plan has completed — Group 5 work was rulings-only (no build), and the
cast-flow spell trial (`HedgeCastPrompt`, the `SpellTrialScene` picker
surface) was built separately. No other session is currently active on this
plan.

## Facts worth not re-deriving

- The move/end-day choice-kind wrinkle (`play.ts` line ~925: `"End the day"`
  has been folded into `kind: "move"` since 2026-08-01) is not new — it
  predates this build by three weeks. It only became load-bearing today
  because the HUD needed to tell "go somewhere" apart from "end the day" for
  the first time. `hubAction` is the fix; `kind` is untouched and still means
  what it always meant.
- The frame-rate probe (~25fps) is a standing environmental characteristic of
  the playtest harness at boot, not a per-build regression signal — it fails
  the same way with no scenario at all.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-24-hud-relayout-build-handoff.md) in full.

Goal: T14 (HUD relayout, Explore tenant — GP-202) is built and independently
verified — PASS, nothing contradicted. This is a review/pickup session, not
a build session unless Roc says otherwise.

1. Glance at the two judgment calls under "What still needs a call" — the
   Shift+E hotkey move and the kind/hubAction split — and confirm they read
   the way you'd want.
2. The "Open — not this task's scope" list has four real loose ends: no
   move-region authoring editor yet, §2/§3 HUD tenants not actually mounted
   (cast/dialogue are separate surfaces, not bar contents), an unmeasured
   SatchelStrip collision risk, and 6 unexplained pre-existing resolver test
   failures. None block anything, all are worth someone eventually owning.
3. Group 5 (T15-T17) stays blocked on register.md, untouched since 08-09.
   T13 is staged post-capstone by size. Group 6 is parked. Nothing here
   changed since yesterday's forage-reconcile handoff.

Wait for my answers before building anything.
```
