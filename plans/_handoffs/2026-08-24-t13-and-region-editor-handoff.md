# Handoff — T13 (year-loop saves) and the move-region editor: both built

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to review and in what order.

**Written 2026-08-24 · capstone Tue 2026-09-01, content freeze Fri 2026-08-28**

---

## State

Two things got built today, in sequence (region editor first, since both touch
`CollectScene.ts` and running them concurrently risked a real edit race):

- **Move-region editor** (Paca `GP-203`) — built, independently verified, **PASS**.
- **T13, year-loop saves** (Paca `GP-204`) — **timing pulled forward by Roc
  2026-08-24**, off the post-capstone staging in
  [`2026-08-23-year-loop-saves-ruling.md`](../2026-08-23-year-loop-saves-ruling.md).
  Built across 7 sequential phases via a background workflow. **In Review, not a
  clean PASS** — two real open items below need Roc's word before this is done.

Both build plans: [`2026-08-24-move-region-editor-plan.md`](../2026-08-24-move-region-editor-plan.md),
[`2026-08-24-year-loop-saves-build-plan.md`](../2026-08-24-year-loop-saves-build-plan.md).

---

## Move-region editor (GP-203) — done

Extended `phaser/src/render/EditModeSystem.ts` with a second palette so it now
authors move-region geometry (destination boxes for the click-to-walk HUD T14
shipped empty) alongside its existing examinable-region authoring. One editor,
two palettes, `[ examinables | moves ]` toggle chip, no new hotkey. Move-palette
ids come from the live hub-exit choices — same derivation the runtime renderer
uses — so the palette chip *is* the destination.

Verified independently: `tsc` clean, 788/788 phaser tests, new playtest scenario
20/20 (1 known frame-rate flake). The live-commit object-identity claim (does
the editor actually write into the same object the renderer reads?) was checked
by hand, not trusted — confirmed via a real drag, screenshotted. Scope fence
held: fallback layout, gate/label logic, and `GAPS.md` G14 (the separate
examinable-coverage gap) are all untouched.

**Still open, low priority:** no 20-screen authoring pass has been done —
`regions.json`'s `moves` key is still empty everywhere. The tool works; nobody's
used it yet. That's deliberately a separate content session, not carded here.

---

## T13, year-loop saves (GP-204) — built, two real items need your word

Seven phases, sequential, run as one background workflow: spike → resolver/ink
→ year-readable → `SAVE_VERSION` bump → slot board → rollover screen →
verification. Full detail is in each phase's own report (Paca `GP-204`
comment); this section is the digest.

**What shipped:** the story now has a `year` variable and a host-divert-only
`begin_new_year` knot (ink never offers it as a choice — `jumpToAddress` proven
safe post-`-> END` by a spike before anything else was built on top). Year
reads through the save-display layer, restore-proven, not assumed.
`SAVE_VERSION` bumped 2→3 exactly on the T19 precedent (refusal, no migration,
old saves left untouched in storage). The save board is a real 3-slot set with
in-scene player-name entry, replacing the two dead placeholder columns — this
*is* what replaces the New Life button (already removed under T7). The rollover
screen shows a discovery summary (spells/items/endings, each denominator traced
to a real source, not guessed) with Continue-next-year / main-menu buttons, and
the ruled "a save at the rollover restores back to the rollover" behavior is
proven against a genuine fresh boot from localStorage, not a re-entered scene.

**Verified:** `tsc` clean in phaser, `tools/lantern`, `tools/resolver`. Tests:
phaser 820/820, lantern 764/765 (1 pre-existing, unrelated —
`personasFixture.test.ts`), resolver 204/210 — exactly the 6 documented
pre-existing `walk.test.ts` failures. A genuine 7th failure surfaced mid-build
(below) and was fixed before closure. Playtest 33/34 (1 known frame-rate
flake), screenshots cross-checked byte-identical against the build's own
reference shots.

### Two real open items — need Roc's word

1. **Save/reload restore drift**, found by the adversary agent, not fixed.
   After a full-page-reload restore, `ink.view().pos.currentScreen` reads
   `null` for a moment even though the actually-rendered screen, satchel,
   spellbook, and cleared gates are all correct — reproduced twice, isolated to
   one field not populating synchronously post-restore. This is in the
   save/InkBridge restore path T13 touched; whether that field is supposed to
   populate synchronously is a real question, not something to guess at.

2. **Satchel/arms do not survive the year rollover, and the ruling says they
   should.** The ruling's carry-over clause: "everything persists across the
   year boundary... no host-side state is wiped." The pre-existing
   day-transition code (`LanternPlayer.applyDay`) wipes the satchel/arms on
   *any* day change by design ("item slots respawn"), including this one —
   confirmed from both directions, across two separate phases. Phaser's own
   `Inventory` (held item ids) is a different system and is untouched.
   Reconciling the two is real design work someone needs to scope, not a
   plumbing fix.

### GDD is now out of sync — diffs proposed, not written

`gdd-sync` ran its own protocol and correctly refused to write without
approval (that's the command's design, not a build gap). Three lines now
contradict what's shipped:

- `gdd/03-core-loop.md:12` — "Continuing an existing life past its first
  festival cycle is a full-game target feature, grayed out for the slice."
- `gdd/03-core-loop.md:24` — "There is no return to the day cycle without
  starting a new game."
- `gdd/06-world-and-progression.md:30` — same drift, same claim.

All three need rewriting to say the slice now supports this. Run `/gdd-sync`
or approve a direct rewrite of those three lines.

### Smaller items, lower priority

- `CollectScene.ts`'s SRP line-count gate was raised three times as phases
  landed (1120→1140→1150→1195), each with a documented reason written into the
  test's own name, matching the repo's existing discipline for this gate.
  Worth a glance — raising a guard threshold is technically a ruling, even
  when well-justified.
- `GAPS.md` G19 (new): pressing Continue leaves a stale "Final Screen" header
  for one click before the first move, because `begin_new_year -> day_start ->
  screen_hub` prints no `#screen:` tag until a location is picked. Cosmetic,
  self-corrects on the first click. The natural fix — have Continue open the
  day-start calendar the way Home Hub's "Start the Next Day" already does —
  was identified but not applied; it's a scope call (Continue was specified to
  divert and do nothing else).
- The adversary agent's own tooling had two real bugs caused by this build,
  both found and fixed so the adversary could run at all: a template-literal
  escaping bug in `phaser/tools/adversary/lib/agentApi.mjs` (two comment blocks
  added for the schema-bump phase used raw backticks instead of the file's
  existing escaping convention), and the new name-entry boot gate blocking the
  adversary's click-only entry loop (fixed with a one-shot guarded auto-name,
  specifically guarded so it can't misfire during the adversary's own
  save/reload round-trip check).
- `phaser/playtest/festival-night-t9.mjs` has been unrunnable since the slot
  board became the boot gate (Phase 4) — it asserts a boot path that no longer
  exists. `t13-year-rollover.mjs` is its natural T13-era replacement. Retire or
  repair — low priority, your call.
- Adversary also surfaced two things unrelated to T13, flagged for
  completeness only: a pre-existing cast-economy gap (a spell casts free a
  second time after its components were already consumed), and a real bug
  where mashing satchel-open/close plus assorted keys made the play scene
  vanish entirely with no recovery via Escape. Neither is save/day-loop
  specific.

---

## Group 5 / Group 6 status — unchanged, still the alignment point

Carried forward from
[`2026-08-24-hud-relayout-build-handoff.md`](2026-08-24-hud-relayout-build-handoff.md),
confirmed still current. All five Group 5 rulings are indexed at
[`2026-08-23-group5-rulings-handoff.md`](2026-08-23-group5-rulings-handoff.md).

**T15–T17** stay blocked on `narrative-pipeline/register.md`, unrewritten since
2026-08-09. **T14 (HUD relayout)** is built (Explore tenant) and in review, per
yesterday's handoff — unaffected by today's work. **T13** is this handoff — no
longer "staged post-capstone," pulled forward and built today. **Group 6**
(minimap, custom loading screens, irregular examine shapes, load-speed
profiling) stays parked, untouched.

---

## Facts worth not re-deriving

- The Phase 0 spike used the real compiled `lantern-projects/v01` run, not the
  tiny T1/T2-only test fixture other `tools/lantern` tests use — that fixture
  has no festival/final sequence and can never reach `-> END`, so it couldn't
  have proven anything about this specific risk.
- `begin_new_year`'s placement (sibling to `final_screen`, host-divert-only)
  was flagged once as a real regression risk against a 2026-08-01 ruling-test's
  text scan, and was fixed (scan window narrowed, not the ruling reinterpreted)
  before this build's own closure — not left as a surprise for whoever reads
  the resolver test suite next.
- Three lives can exist independently on one page load only because they share
  one ink bridge in that test session — a real player only ever makes one life
  per session, so the differing time-blocks seen in the Phase 4 screenshot are
  a test artifact, not a bug.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-24-t13-and-region-editor-handoff.md) in full.

Goal: the move-region editor (GP-203) is done, PASS, nothing open beyond a
deliberately-deferred content-authoring pass. T13 (GP-204) is built and
verified but NOT a clean pass — two real open items need Roc's word before
it's done: a save/reload restore-drift finding from the adversary agent, and
a ruling-vs-behavior gap where the satchel doesn't survive the year rollover
even though the ruling says nothing host-side should wipe. The GDD is also
now out of sync in 3 specific lines across two files, diffs proposed but not
written, needs Roc's approval to land.

This is a review/pickup session, not a build session unless Roc says
otherwise. Get his ruling on the two open items and the GDD diffs before
touching anything else in this scope.

Group 5 (T15-T17) stays blocked on register.md, untouched since 08-09.
Group 6 is parked. Nothing there changed today.

Wait for my answers before building anything.
```
