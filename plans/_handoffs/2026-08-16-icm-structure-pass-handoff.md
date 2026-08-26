# Handoff — ICM structure pass, items 1–3

**2026-08-16 · capstone Tue 2026-08-25 · content freeze Fri 2026-08-21**

Audited game-project against the ICM method (`P:\GitHub\icm-architect`) and fixed the three
findings that were actively misleading a reader. Committed and pushed as `a62428fc`. No game
content, tool code, or Paca card was touched. Seven findings remain open — §4.

---

## 1. What game-project is, structurally

It is an **umbrella** composing three other ICM forms, and it already composes them well:

| Layer | Form | Where |
|---|---|---|
| Root map | Umbrella | `CONTEXT.md` |
| Research corpus | Knowledge bundle | `knowledge-base/` |
| Content production | Pipeline | `narrative-pipeline/` → `tools/` → `lantern-projects/` |
| Souls, items, spells | Record library | `cast/`, `content/` |

Four things already score above what the method asks for. The factory/product split is clean at
the top level. One-home-per-fact is enforced by machinery rather than willpower — the `cast/`
card-of-record rule, supersession banners, `gdd-sync`, and the Gate Recorder → Ruling Promoter →
Stale Rule Auditor trio. Every output is an edit surface. And `content-check.mjs` is correctly a
script rather than a seat.

**One deliberate departure worth knowing.** ICM says the filesystem is the state machine. This
project puts state in Paca instead, because status banners went stale and cost a session
(`CONTEXT.md:15`). That is a defensible trade with real scar tissue behind it. The cost is that an
agent cold-reading this folder cannot answer "what state is this in" without an MCP call. Not a
bug. Just know it before you go looking for a status file.

---

## 2. What changed

### Item 1 — the knowledge-base index was a shelf wearing the catalog's clothes

`knowledge-base/_index.md` was ~230 lines and roughly 4k tokens. It held routing, an 18-hole
coverage map, 16 findings, and an ingestion decisions log. Its frontmatter claimed
`status: GATE 2 — awaiting Roc's draft-scope lock before Phase 3`, dated 2026-07-17. Phase 3
plainly shipped. Any agent entering the KB burned its whole budget on the catalog and got a
month-old answer.

Split in two:

- **`knowledge-base/CONTEXT.md`** — new. The router. Where to go, the track table with live note
  counts, and the rule that you read `synthesis/` before you read a track.
- **`knowledge-base/coverage-map.md`** — the old `_index.md`, renamed via `git mv` so history
  survives. Carries a staleness banner at the top: the coverage dots and §3 findings still hold,
  §2's "still needed" column and §5's gate language do not, until Roc re-rates them. §1 is now
  labelled as a frozen provenance record, not a live count. `status:` became `last-reconciled:`.

Every live inbound link was repointed — routing references to `CONTEXT.md`, hole-map citations to
`coverage-map.md`. That included the inline `` `_index.md §N` `` citations scattered through
`synthesis/`. References inside `resources/_archive/` were left dead on purpose. That folder is
history.

The intake machinery was updated to match, or it would have rebuilt the merged file on the next
run: `_intake/SKILL.md` step 5 now writes coverage to `coverage-map.md` and counts to `CONTEXT.md`,
and `_intake/references/index-format.md` states the split as a rule.

### Item 2 — three folders were invisible from the root map

`phaser/` (81 files), `content/` (58), and `assignments/` (97) never appeared in the root
"Where things live" table. An agent walking in could not tell whether `phaser/` was live, a spike,
or dead. Added all three, plus a row for `plans/_handoffs/`.

The `phaser/` description is taken from its own README, not guessed: a design probe, not a build
track, which may not gate Track A or compete with Track B for review time.

The `assignments/` row says out loud that nothing there is a source of truth — `assignment-7/style-guide.md`
restates `narrative-pipeline/register.md`, and the pipeline file is the one that wins.

### Item 3 — `plans/` was doing two jobs

`CONTEXT.md` said plans are "Design records for past builds. **Not status**." Fourteen of the 26
files were session handoffs, and the newest opened with "*#7 is built, run live, and staged. It is
not committed or pushed.*" That is status. The rule kept being false.

Fourteen files moved to **`plans/_handoffs/`** via `git mv`. Twelve design records stayed in
`plans/`. Both folders got a `CONTEXT.md` naming the split and when each kind applies. The test:
a design record answers *why is it built this way*, a handoff answers *where did last session stop*.
If you can only name a file by its date, it is a handoff.

Every inbound link to a moved file was rewritten across the whole folder. Two pre-existing dead
links surfaced and one was fixed — `2026-08-12-screen-presenter-prototype-handoff.md` cited
`plans/2026-08-01-unreal-feature-complete-plan.md`, which is actually dated `2026-08-11`. The other
dead link lives in `resources/_archive/` and was left alone.

`plans/_handoffs/CONTEXT.md` carries the rule that matters most: **never cite a handoff in a
contract, a schema, or the GDD.** If something in a handoff turns out durable, promote it into the
design record, the GDD via `gdd-sync`, or root `CONTEXT.md`, and leave a pointer. That is the same
move the Ruling Promoter seat makes for contracts.

---

## 3. Verification

- All relative links in the six touched contract files resolve. Checked mechanically.
- No `_index.md` references remain outside `resources/_archive/`.
- No dead `plans/` references remain outside `resources/_archive/`.
- Renames used `git mv`, so `git log --follow` still works on both moved sets.
- No tool code, game content, or Paca card was touched. Nothing needs a rebuild or a test run.

---

## 4. Still open, ranked

Roc scoped this session to items 1–3. These were found in the same audit and not acted on.

1. **Contracts are missing where the work happens.** Five `CONTEXT.md` files now cover ~45 working
   folders. The costly gaps: `lantern-projects/` (called "the home for actual game content", has
   nothing), `tools/` (the deterministic half of the pipeline), `content/` (its per-sub `_index.md`
   files are excellent, the folder above them is bare), `cast/`.
2. **Root `CONTEXT.md` carries payload.** Now 102 lines against ICM's ~60-line target. Item 2 added
   four routing rows, which is correct payload for an entry file. The bloat is elsewhere: build
   commands belong in a `tools/CONTEXT.md`, the Inkpot ruling in `gdd/12`, and the parked list is a
   duplicate of `resources/parking-lot.md` that should be a link.
3. **Nothing is numbered.** `content-stages.md` defines a 7-stage order and `pipeline.md` a 13-step
   procedure, but `narrative-pipeline/` is 14 flat files. Sequence lives only in prose, so renaming
   a file cannot reorder anything. Low urgency — the prose is good.
4. **`cast/` holds two node types in one namespace.** `toby.md` and `toby-baker-threads.md` sit
   side by side with no schema saying which is which.
5. **Cruft.** `bash.exe.stackdump` at the folder root. An untracked
   `assignments/assignment-6/pipeline/node_modules/` on disk. An `_abandoned/` subtree under
   assignment-5. None are tracked by git. All make the tree harder to read.
6. **`assignments/` is an unindexed record library.** 97 files, three records, no index and no
   template. The method would want `_templates/` and a one-line-per-record log.
7. **The full restructure was not run.** ICM restructure mode wants every file classified
   catalog / contract / factory / product / dead with a migration map for approval. That is a
   session, not an hour. The payoff sits in `assignments/`, `plans/`, and `resources/_archive/` —
   the three piles nobody reads. Roc's call was to park it until after the capstone.

---

## Pickup block

> Run `/pm` first — the board is state, this document is not.
>
> The ICM structure pass did items 1–3 of 10 on 2026-08-16 (`a62428fc`): split
> `knowledge-base/_index.md` into `CONTEXT.md` + `coverage-map.md`, split `plans/` into design
> records and `plans/_handoffs/`, and added `content/`, `phaser/`, `assignments/` to the root map.
> Open items are §4 of `plans/_handoffs/2026-08-16-icm-structure-pass-handoff.md`, ranked. The
> method lives at `P:\GitHub\icm-architect`. Nothing here blocks the capstone. Do not start the
> full restructure (§4.7) before 2026-08-25.
