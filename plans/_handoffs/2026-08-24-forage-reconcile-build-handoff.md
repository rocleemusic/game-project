# Handoff — Forage reconcile, pool spread, and role wiring: build done

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to review and in what order.

**Written 2026-08-24 · capstone Tue 2026-09-01, content freeze Fri 2026-08-28**

---

## State

The full build ruled in
[`2026-08-23-forage-reconcile-and-spread-handoff.md`](2026-08-23-forage-reconcile-and-spread-handoff.md)
is done: forage pool names reconciled to item ids (closes `GAPS.md` G13), the
16/16 spell-coverage pool spread, and the three ratified `role_tag`s wired.
A build session executed it, a separate verify pass checked the builder's
report against disk, and both agree: PASS, nothing contradicted. Everything
below reflects what's confirmed on disk, not what either report claimed.

## The correction this session made to the ruling handoff's plan

The ruling handoff's Order of Operations (step 2) says to rewrite
`screen-specs.json`'s forage arrays directly from its table. Before touching
anything, this session diffed `lantern-projects/v01/graph.json` against
`tools/resolver/data/screen-specs.json` and found the two had already drifted —
earlier same-day hand-edits to `v01/graph.json` (confirmed via `git show` on
the commits that made them) had never been ported back to `data/`:

- **F4** status `locked(G-F4-still)` → `reachable`
- **F7** status `locked(G-F5-cascade, G-F7-light)` → `locked(G-F7-light)`
- **F8** note + `receivers: ["river_stone","heated_stone","stone_wall"]` (the
  heated-stone chain)

Rebuilding straight from the ruling handoff's table, as written, would have
silently reverted these three — a real hand-tuned-content loss, not a
forage-pool change. So the session inserted a reconcile-first step ahead of
Task 2: port the real divergences into `data/` first, confirm a dry-run build
reproduces `v01/graph.json` exactly (mod the separate, intentional
`regions.json` region-shape overlay), *then* apply Task 2's forage rewrite and
Task 5's role tags on top, and rebuild for real.

One candidate fourth divergence — T1's `arch` examinable condition text —
turned out not to be drift at all. It's build-stamped by
`archPromoteCondition()` in `graph.ts`/`tuning.ts`, not authored; the source is
supposed to keep a placeholder pointing at `arch-promote-proposal.json`. The
build session caught this itself when `tuning.test.ts` failed after porting
it, and reverted that one edit before rebuilding. `lantern-projects/scratch`
was checked too (per the ruling handoff's own step 6) — its only divergence
was the same T1 non-issue, plus one unrelated case of scratch being *behind*
data (T4), which a rebuild fixes rather than preserves.

Net effect: the reconciled `data/` now carries F4/F7/F8's real state, and the
rebuilt `graph.json` still carries it after Task 2 and Task 5 landed on top.
Nothing got silently reverted.

## What's done (independently confirmed)

**Task 1 — pool names to item ids.** The four source literals in
`modes.ts`/`ScreenScene.ts` are item ids. `foragePoolToItem.ts` is the identity
shim exactly as specified. `SAVE_VERSION` is `2`. The two-vocabularies headers
in `SaveGame.ts`, `SaveCoordinator.ts`, `InkStatePort.ts`,
`LanternInkStatePort.ts`, `SatchelLedger.ts`, `GameEvents.ts` are rewritten.

**Task 2 — 16/16 layout.** All 11 forage arrays in the rebuilt
`screen-specs.json`/`graph.json` match the ruling handoff's table exactly
(verified via diff), on top of the reconciled F4/F7/F8 state above.

**Task 3 — dead config removed.** `collectExtraForage.ts` doesn't exist on
disk. `HotspotSystem` takes `guaranteedPools` from the mode descriptor; no
hardcode remains. `content-audit.mjs` fixed per the ruling handoff's snippet —
plus an unlisted second consumer of the same deleted imports,
`phaser/tools/content-editor/server/content-data.mjs`, found and fixed the same
way; it would otherwise have broken silently.

**Task 4 — regression rule.** `spell-components-unco-located` is live in
`rules.ts`/`report.ts`/`rules.test.ts`. `npm run orphans` reports it clean
(16/16 spells), `forage-pool-unjoined` clean alongside it.

**Task 5 — role tags.** `bex`/`juno`/`pip` carry `role_tag` + dated
ratification notes in `scene-graph.json`. Linnet and Nell correctly carry
none (grep confirms zero hits near their souls). `StarterSpells.test.ts`'s
prior `it.skip` is now a live, passing test, rewritten to check
role-reachability rather than the moot design question the old assertion
tested.

**Test sweep, beyond the ruling handoff's own list.** All 9 files the ruling
handoff named that needed literal/assertion changes are fixed. Plus, found and
fixed in this session: a `SAVE_VERSION`-bump compile error in
`SaveSlotView.test.ts`; two pinned-hash tests each in `Cast.test.ts` and
`tuning.test.ts` that legitimately moved because Task 5's role tags shift the
weighted NPC-fill draw (same category as the project's 2026-08-12 "Mara's
role_tag weight" precedent — causation verified by toggling `scene-graph.json`
back and confirming the old pins pass, then re-pinning with dated comments);
stale `"sticks"` literals in `playtest/pickup-examine.mjs` and
`tools/screen-flow/screens.mjs`; a line-count budget test in
`SatchelModalWalkerProbe.test.ts` tipped over by the session's own edits
(trimmed a comment rather than raising the budget); a new, more concrete
`SaveLoad.test.ts` regression proving a real-shaped pre-reconciliation
(`version: 1`) mode5 save is refused as `version-mismatch`, not just a
synthetic version bump. `phaser/ARCHITECTURE.md` and `GAPS.md` (G13 closed,
matching G14's own convention) were updated as the stated direct consequence
of Task 1 — not separately requested, but the loop Task 1 itself says to
close.

**Confirmed pre-existing and untouched, left alone:**
- `tools/resolver/test/walk.test.ts` — 6 failures (dialogue-search-budget/
  reachability). Verified pre-existing by reverting `scene-graph.json` to
  pre-Task-5 and re-running: identical failures.
- `tools/lantern/test/personasFixture.test.ts` — 1 failure,
  `cast/appearance.md: no npc_id row found`, unrelated file never touched.

## Verified (both build and independent verify pass agree)

- `tools/resolver`: `npm test` 204/210 (6 pre-existing) · `tsc --noEmit` clean
- `tools/lantern`: `npm test` 754/755 (1 pre-existing) · `tsc --noEmit` clean
- `phaser`: `npm test` 766/766 · `tsc --noEmit` clean · `npm run orphans` —
  `forage-pool-unjoined` ok, `spell-components-unco-located` ok,
  `receiver-unplaced` still 55 (expected, out of scope per the ruling handoff)
- `npm run presence` — deep souls (mara/toby/ilsa) still land on every
  authored scene across all 5 days; bex/juno/pip land at their new workplaces
  with no scenes (expected — texture souls)
- Real playtest (`playtest/pickup-examine.mjs`, F1 forage → hover → take):
  18/19 pass (1 known frame-rate flake, unrelated). Screenshot confirms the
  satchel strip reads `Satchel 1/6 · item_sticks` — a real item id reaching
  the UI, not a pool name. Screenshots at
  `phaser/.playtest/t19-pickup-examine/` and
  `phaser/.playtest/19-pickup-examine-after-take.png`
- Version-1 save regression test (`SaveLoad.test.ts`) passes in the full
  suite: a pre-reconciliation save is refused with `version-mismatch`, not
  restored as a dead satchel
- `npm run prep:content` run twice (before and after the T1 revert)
- Git history cross-check: F4/F7/F8's reconcile commits and the T1
  revert-in-rebuild are separate, ordered commits in this session's own
  history, not folded into one undifferentiated change

## What still needs a call

Nothing is flagged as broken or undone. One thing worth a second look, not
because it's wrong but because it's a judgment call:

- **G13's closure and the `ARCHITECTURE.md` fix weren't explicitly itemized
  in the ruling handoff** — they were the stated direct consequence of Task 1
  ("Closes `GAPS.md` G13"), and the build session closed that loop rather than
  leave the docs lying. Worth a glance to confirm the closure note reads the
  way you'd want it to, same convention as G14.

Everything the ruling handoff scoped as out-of-scope (receiver placement,
rarity mechanic, `satchelPoolNames` rename, deleting the identity shim,
Nell's and Linnet's roles, the flame/heated-stone/tempered-stone chain) is
still out of scope and untouched, as intended.

## Group 5 / Group 6 status — for whoever picks up next

Not part of T19. Recorded here because this session evaluated the whole
triage plan's remaining work before wrapping, and a parallel session is
working the same plan — this is the alignment point for both.

All five rulings are indexed at
[`2026-08-23-group5-rulings-handoff.md`](2026-08-23-group5-rulings-handoff.md)
(cross-cutting threads — player name flow, the ink-clock rule, register
gating order — live there, read it first). Direct links to each ruling doc,
so a pickup session doesn't have to go through the index every time:

**Group 5 (T13–T17), all ruled 2026-08-23. One real blocker, shared by three
of the five: `narrative-pipeline/register.md` hasn't been rewritten** —
confirmed via git history, untouched since 2026-08-09, no change since the
ruling. That gates:
- **T15 NPC dialogue rework** — blocked, register gate. Spec:
  [`2026-08-23-npc-dialogue-rework-ruling.md`](../2026-08-23-npc-dialogue-rework-ruling.md).
- **T16 Intro story** — blocked, same register gate. Spec:
  [`2026-08-23-intro-story-ruling.md`](../2026-08-23-intro-story-ruling.md).
- **T17 Item descriptions** — blocked, same register gate. Spec:
  [`2026-08-23-item-descriptions-ruling.md`](../2026-08-23-item-descriptions-ruling.md).

Two are not blocked, just not picked:
- **T13 Year-loop saves** — no dependency, genuinely large (new ink
  begin-new-year entry point, save-schema bump, slot-set model change). Size
  is the only reason it's staged post-capstone. Spec:
  [`2026-08-23-year-loop-saves-ruling.md`](../2026-08-23-year-loop-saves-ruling.md).
- **T14 HUD relayout — buildable now, no coordination needed.** Spec:
  [`2026-08-23-hud-relayout-ruling.md`](../2026-08-23-hud-relayout-ruling.md)
  (wireframe fully specced, nothing left to design). The Group 5 rulings
  handoff flagged a soft dependency on
  [`2026-08-23-cast-flow-redesign-build-handoff.md`](2026-08-23-cast-flow-redesign-build-handoff.md)
  (shared satchel-picker surface, "whoever builds second inherits the
  other's render"). Checked 2026-08-24 and it doesn't hold: the cast-flow
  handoff's own "three technical notes" section rules out a shared render —
  `SpellTrialScene` sits three scenes deep on the stack and can't reach the
  real `SatchelStrip` instance, so it draws its own icon-strip styled to
  match, reading the same `Inventory` data. Two renders of one state, not one
  shared component. File lists confirm zero overlap too: T14 touches
  `NavRow.ts` + a new tenant-swap owner; cast-flow touches
  `SpellTrialScene.ts`, `ReceiverHotspots.ts`, `HedgeCastPrompt.ts`,
  `SatchelStrip.ts`, `VfxSystem.ts`. Corrected in
  [`2026-08-23-group5-rulings-handoff.md`](2026-08-23-group5-rulings-handoff.md)'s
  cross-cutting-threads section. **T14 is fair game for a new session** —
  wireframe's fully specced (`phaser/tools/screen-flow/mockups/hud-relayout-wireframe.html`),
  nothing left to design.

**Group 6** (minimap, custom loading screens, irregular examine-region
shapes, first-load speed profiling) — parked, post-capstone by the original
triage plan, untouched, no new information changes that.

## Facts worth not re-deriving

- The reconcile-first correction is not a change to what Task 2 does — the
  16/16 table lands exactly as specified. It only changes *when* the rewrite
  happens relative to catching drift, so hand-authored content edits from
  earlier the same day don't get silently reverted by a rebuild that only
  knew about the ruling handoff's table.
- Region-shape diffs between `v01/graph.json` and `data/` are present on
  every screen and are a separate, intentional `regions.json` overlay
  mechanism — not drift, not touched, not part of this reconciliation.
- The Cast.test.ts / tuning.test.ts pinned-value moves are expected mechanical
  fallout of Task 5, same category as prior role_tag-weight precedent, not a
  design regression.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-24-forage-reconcile-build-handoff.md) in full.

Goal: the forage reconcile / pool spread / role wiring build (ruled in
2026-08-23-forage-reconcile-and-spread-handoff.md) is built and independently
verified — PASS, nothing contradicted. This is a review/pickup session, not a
build session.

1. Glance at the G13 closure note in GAPS.md and the ARCHITECTURE.md fix — the
   one judgment call this session flagged — and confirm it reads the way you'd
   want.
2. Everything else in the ruling handoff's scope is done and verified; no
   open items block moving on.

Separately, this session also evaluated Group 5 (T13-T17) and Group 6 —
see "Group 5 / Group 6 status" above. Short version: T14 (HUD relayout) is
buildable now, no coordination blocker despite the original framing; T15-T17
are hard-blocked on the register.md rewrite (untouched since 08-09); T13 and
Group 6 are staged post-capstone by size/scope, not blocked. A parallel
session is working the same plan — check in before picking up Group 5/6 work
so you don't duplicate it.

Wait for my answers before building anything.
```
