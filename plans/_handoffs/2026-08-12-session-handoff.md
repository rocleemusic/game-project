# Session handoff — 2026-08-11 / 12

**For the next session.** Written at the end of the session that imported all nine authored threads into the engine. Everything below is verified against files and against test runs, not against agent reports — two agents died mid-task tonight with their work already committed, and two agents reached **opposite conclusions** about whether the test suite is flaky. Where they disagree, this document says so rather than picking.

---

## The one-paragraph version

**All 30 authored conversations are in the engine and gated in sequence.** `scene-graph.json` went from 8 scenes to 34; 1,430 slots imported; the hub now offers a thread's conversations in order instead of eleven at once. Getting there needed a new schema field (`entry_gate`), a new predicate (`played()`), per-path divert prose, and a reusable importer. Two workflow agents died of API 529 with their work already on disk, and one orchestration bug of mine cost a full pass. **Twelve tests fail: 4 that must stay red (GP-21), 5 pre-existing consequences of the import, and 3 reachability tests that are red for a real and now well-understood reason.** Four scenes are genuinely never entered, and the cause is two deterministic planner bugs plus one content decision that is yours to make.

---

## What landed

**GP-133 — placeholder scenes archived.** Five whole scenes removed (SC-T2-07, SC-T1-01, SC-T4-01, SC-T4-02, SC-F1-02) to `tools/resolver/data/archive/2026-08-11-placeholder-scenes.json`, with a restore note, so it is retrievable rather than deleted. 32 authored lines went with them — a cost Roc was told and accepted. Three scenes **kept** on his ruling: `SC-T6-01` (GP-39's demo is built on reporting its unreachability), `SC-T7-toby` and `SC-T7-ilsa` (the only two T7 scenes; archiving both silently removes the RULED 2026-08-01 auto-vignette transition, because the gate is only emitted when T7 has scenes).

**Scene-level entry gates — a new capability, retroactively carded as GP-141.**

- `Scene.entry_gate?: string[]`, same predicate grammar as a node's `availability_conditions`.
- `played(scene_id)` added to the vocabulary, compiling to `<soul>.<scene> > 0` (a knot name is its own read count in ink). It **is** a lock — `seen()` was deliberately left alone as "dialogue colour only", so the two never blur.
- The hub guard now appends the compiled gate. No fallback divert is needed there, unlike a gated node: a hub entry is one `*` choice among several, so a false guard simply is not offered.
- `findUnsatisfiable` learned scene gates, plus two new failure modes: a scene gated on having played **itself**, and **rings** of entry gates waiting on each other, where neither scene looks wrong alone.
- 14 new tests across `test/entry-gate.test.ts` and `test/path-variants.test.ts`.

**Per-path divert prose now plays.** Authored `-div` variants were sitting in the data unrendered because the schema had no per-path node set-up. There is now a `path_variants` map on `ChoiceNode` and an emitter-owned `enteredByDivert` flag in `state.ink` — a weave point has one address in ink, so the entry path has to ride in a value rather than a label.

**GP-137 — the import itself.** All 30 line files parsed. 30 scenes constructed (26 new, 4 stale re-imported), 188 choice nodes, 401 options, **1,430 slots** — reconciled against the ~1,426 expected, the difference being one non-slot row correctly skipped. Entry gates on 22 of 34 scenes, the 8 thread openers correctly ungated. Mara has 9 scenes and `role_tag: "Herbalist"`. Build exits 0.

- Importer: `tools/resolver/scripts/import-lines.mjs`. **Dry-run by default**, `--write` writes, `--entry-gates` applies the 30-row table. **Idempotent** — two consecutive runs produce a byte-identical file.
- Report: `tools/resolver/reports/import-lines-report.md`.
- 41 node gates were inferred, every one read from a node heading or the prose directly under it and stamped in-data as `gate_source`. Cross-checked against the front matter's positional "nodes 2 and 5" prose: **16 checks, 0 mismatches.**

**GP-138 — the stale shelf import.** Re-imported, not patched. 39 slot texts corrected. The defect that mattered, `L-CH-T2-09-2-a-1-b-r1`, went from the stage direction `"Toby pretends he didn't hear."` to the line the file actually authors, `"Parcel's for the Hallam order."` SC-T2-10 gained the six slots from the 2026-08-11 amendment.

**The acceptance evidence.** T4 previously offered eleven simultaneous ungated "Talk to Ilsa" entries. It now reads:

```ink
* {present_ilsa == "T4"}                                           [Talk to Ilsa (SC-T4-07)]
* {present_ilsa == "T4" && ilsa.sc_t4_07 > 0}                      [Talk to Ilsa (SC-T4-08)]
* {present_ilsa == "T4" && ilsa.sc_t4_03 > 0}                      [Talk to Ilsa (SC-T4-04)]
* {present_ilsa == "T4" && ilsa.sc_t4_03 > 0}                      [Talk to Ilsa (SC-T4-05)]
* {present_ilsa == "T4" && ilsa.sc_t4_04 > 0 && ilsa.sc_t4_05 > 0} [Talk to Ilsa (SC-T4-06)]
```

The `ilsa-kin-no-show` diamond survived the round trip — C2 and C3 wait on C1 alone, C4 waits on both. Cross-soul gates resolve to the right counter: `{present_mara == "T2" && toby.sc_t2_19 > 0}` guards a Mara scene on Toby's count.

---

## The flakiness question — two agents, opposite answers

**`searchReachable` is bounded by wall clock** — `Date.now() > deadline` at `src/walk.ts:1755` and `:1903`. That much is certain. Whether it actually makes the suite flaky is **disputed**, and the disagreement matters enough not to paper over.

**Agent A (diagnosis) measured variation:** `walk.test.ts` alone failing 6 tests, and a *different* 6 inside the full suite. It also showed `max bond per soul` passing at the shipped 120s budget and reproducing the reported failure exactly at 4s.

**Agent B (planner) could not reproduce it.** Six full-suite runs gave **byte-identical failure sets** — baseline ×3 at 33s/32s/32s, patched ×3 at 111s/112s/113s, same 12 names every time. `walk.test.ts` alone: 6 failures, with `max bond per soul` **passing**.

**What is settled, and it is the important part:** the three reachability failures are **not** a clock artifact. Agent B ran the search with a 900s budget; it used only **14s**, converged in 4 weeks, reported `TIME-TRUNCATED: false` — and still missed exactly `SC-F1-03`, `SC-T2-11`, `SC-T2-21`, `SC-T2-23`. Those four are genuinely never entered. `a truncated search can never be read as a proof of unreachability` is firing on the *never entered* reason, not on a deadline.

So GP-142 is **not** a prerequisite for reading the other failures, which is a correction to what I believed mid-session. It is still worth doing for two reasons both agents agree on:

1. Bound the search on **work done** (weeks / scene paths / steps) with `maxMillis` only as a backstop, so the result is a pure function of content. Agent B's patch pushed the suite from 32s to 112s against `walk.test.ts`'s own **120s internal budget** — proof of how easily this becomes load-sensitive even if it is not today.
2. **`upperBound` sums over *explored* scenes rather than *reachable* ones** (`walk.ts:2050-2056`), so a truncated search can push the ceiling below `achieved` while `blockedBy` stays empty. Both agents call this a latent bug regardless of whether it fires at the shipped budget.

**Still true regardless:** take three runs before believing a green/red claim, and treat any single-run comparison in this session's history — including mine — as provisional.

---

## The four bond-band tests no longer mean what they meant

They are still red, which is what GP-21 requires. But the reason has changed underneath them.

**Toby's one-life max bond went 49 → 133** (bond events 51 → 143) against `high_min: 82`. So `bond_band(toby) = low` is now **unsatisfiable**, because the predicate compiles to strict equality (`bondLevel_toby == 0`). Ilsa's ruled failure and Toby's brand-new one are indistinguishable from the failure count. *"Four still failing, as required"* is a true sentence that stopped meaning what it meant yesterday morning. GP-144 carries the decision.

---

## The four unreached scenes — two planner bugs and one content decision

**Cards: GP-149** (land the patch or not) and **GP-150** (`SC-T2-11`).

A patch exists but is **not applied**: `tools/resolver/.tmp/planner-chain-fix.patch` (13 KB, `src/walk.ts` only, `tsc` clean). It takes the misses from **4 down to 1**. It was deliberately not landed — see below.

**Likely cheapest order is GP-142 → GP-149 → GP-150**, because GP-142's work-based bound removes the only objection to landing the patch (its 80 seconds of added runtime). That is reasoning, not a sequencing decision.

**Two deterministic bugs it fixes**, both verified by measurement:

1. **Every entry-gate day floor computes as 1.** `resolveGate` does `max(floor, openFloor(prereq))` — the day the prerequisite can *open* — never `prereqDay + 1` and never a block-order requirement. `SC-T2-11` sits at chain depth 4 and reports `gateFloor = 1`, so the solver believed it was enterable on day 1.
2. **The planner contradicted itself.** `chooseBestWeek` scored a scene as covered on any day presence allowed; `buildPlan` then re-derived `scheduledDay` from the chosen routes and banned each gated scene from every day before its prerequisite's scheduled day — **including the day it had itself scheduled it on**. Verified: baseline banned `SC-T2-11` on days 1-4 while scheduling it on day 1. Entered nowhere, then read as unreachable content.

There is also a structural reason coverage bias alone could never fix this: a soul with 4 presence slots opens exactly 4 scenes whether they are four unrelated openers or one 4-deep chain, so the two **tie on coverage** and the winner came down to a route tie-break. That is why `SC-T2-15..18` (also depth 4) was walked every run while its sibling `SC-T2-08..11` never was — luck, not logic.

**Why it was not landed:** the trio of tests stays red anyway, because they require *all* scenes, and the patch takes the suite 32s → 112s, leaving `walk.test.ts` **8 seconds** under its own 120s budget. A correctness fix that turns nothing green and manufactures load-sensitivity is your call, not an agent's.

**`SC-T2-11` needs your ruling — it is not a planner problem.** With the patch the chain schedules perfectly (`08@d1, 09@d3, 10@d4, 11@d5`, all four Toby-T2 slots, exactly as the presence-budget analysis predicted). The walk still cannot enter it because:

- `shelf_named` is set by exactly **one option**, `CH-T2-09-3-a`.
- `exploreScene` commits **one** branch per visit, chosen by bond extremum. The max pass takes option (b) — option (a) is worth more locally (Recognition 3 vs Intimacy 2) but costs more downstream, so max-bond *correctly* rejects it.
- The min pass never enters `SC-T2-09` at all, because min's committed branch of `SC-T2-08` does not set `shelf_seen`.

Neither bias is "satisfy a downstream entry gate", and a tie-break cannot help — 3 vs 2 is not a tie. Three options, cheapest last:

1. Add a **third exploration pass** with a gate-satisfying commit rule. Correct, and safe for the bond numbers by construction (`bestGain` only updates when `bias === "max"`), but a full extra pass of runtime.
2. **Author `shelf_named` onto a beat the bond-max path actually commits.** Free, no code — and arguably where a "the shelf gets named" flag belongs anyway.
3. Accept `SC-T2-11` as expected-unreachable with a stated reason.

## Findings that need a ruling

| # | Finding | Card |
|---|---|---|
| 1 | **The presence budget cannot fit the corpus.** Toby has 11 authored scenes at T2 against **4** weekly visits; Ilsa 11 at T4 against 4. One scene per visit, once-only per week, so no week can enter more than 4 of 11 — and `SC-T2-11` at chain depth 4 needs all four. `SC-T2-11` and `SC-T2-21` can never be reached in the same week, only separate ones. Not a bug; a scheduling decision. | GP-143 |
| 2 | **Bond inflation** — see above. | GP-144 |
| 3 | **Day-5 festival placement is not pinned to night.** Toby drew T7/*evening*, so `present_toby == "T7"` was never true at night and the vignette never auto-started. T7's night block had room — the pre-import pass was luck. Fix: restrict day-5 `FESTIVAL_SCREEN_ID` openings to `time_block === "night"`. | GP-145 |
| 4 | **`mara-set-for-two` seeds no thread.** No scene in SC-T2-12/13/14 carries a `thread_move` for it, so content moves 10 threads, not 11. The thread doc exists. Authoring gap, not tooling. | GP-146 |
| 5 | **166 of 188 nodes carry `IMPORTED PLACEHOLDER`** for `equal_weight_note` / `no_accrual_note`. Sized: **61** liftable mechanically from thread-doc bullets, **105** with no source at all, and **158 of 166** have no "No accrual" text anywhere. Rule whether the note is required per node or only where a counter exists *before* authoring 158 of them. | GP-147 |
| 6 | **Two stale pinned fixtures** (`test/tuning.test.ts:170`, `:179`). Cause verified: adding Mara's `role_tag` changed her draw weight in the weighted pick and shifted the day.json stream. The invariants the tests protect still hold. Needs re-pinning, with the cause recorded alongside. | GP-148 |

**Carried from earlier and still unruled:** S2 `active` / S3 `planned`; the empty Sprint 6; whether GP-14 and GP-15 merge.

---

## Things that are *not* defects, recorded so nobody re-reports them

- **The 67-word and 63-word slots** (`L-CH-T2-13-3-a-1-s`, `L-CH-T2-15-2-s`) are **declared sanctioned long runs** (≤75) naming those exact slot ids in their own front matter and thread docs.
- **The two "16-word" `player_line` slots** (`L-CH-T2-08-3-a-p`, `L-CH-T2-09-3-a-p`) are really **8 words of speech plus 8 of un-prefixed narration in one cell**. Not ceiling breaches. The fix is to split the cell, not raise the ceiling.
- **Mara's 9th scene is correct.** `SC-T2-20` from `toby-kept-and-returned-C2`, whose front matter reads *"Mara only on screen — sanctioned by Roc, 2026-08-09."* Bond routes to Mara, presence gates on Mara. One wrinkle: thread *ownership* has no field, so a Mara-only conversation inside a Toby thread is only recoverable from its `thread_move`.

**One live data bug, one character:** `L-CH-T2-11-1-c-r1` imported with a stray trailing `"` — the `Marta: ` prefix was stripped along with the opening quote but not the closing one. It sits inside a broader issue: **`toby-the-shelf` C1/C2/C4 diverge from the other 27 files** in four ways (blank `W` with inline `(N w)`, narration merged into dialogue cells, path markers as `*(normal path)*` prose, an optional 7th speaker column). 14 slots affected. Normalising those three files and re-importing fixes the lot.

---

## How this session went wrong, twice

**Two agents died of API 529 "Overloaded" with their work already committed.** The variants agent and the walker agent both finished substantively and lost only the report. I verified both by inspection and by test rather than accepting the workflow's `null`. This is lesson 7 on GP-121 earning its place a third time: **check artifacts, not agent reports.** The auto-commit hook is what made it recoverable.

**My own bug cost a whole pass.** I asked an agent for "STRICT JSON" but did not pass the `schema` option, so `agent()` returned its text as a **string**. `table?.entry_gates` read `undefined` on a string, silently became `[]`, and the importer faithfully reported an empty table — so 30 conversations imported with **no entry gates**, the one thing the work existed to produce. The table survived in the workflow journal and was recovered intact. **If you want structured output from an agent, pass `schema`; a prompt asking for JSON returns a string.**

---

## First move

**Rule on `SC-T2-11`** — option 2 above (author `shelf_named` onto a beat the bond-max path commits) is free and needs no code. Then decide whether to land `.tmp/planner-chain-fix.patch`, which is a real correctness fix that costs 80 seconds of suite runtime and turns no test green on its own. Those two together are what close the three red reachability tests.

**Run `npm test` three times before you believe any green/red claim** — the clock bound is real even though flakiness was not reproducible.

The 12 failures break down as **4 must-stay-red (GP-21) + 5 pre-existing import consequences + 3 reachability**. That arithmetic is worth keeping in your head, because "twelve failing" sounds much worse than it is.

The other high-value item is unchanged from yesterday and now unblocked and playable against real text: **GP-120 — play a thread in Lantern.** Confirm C2 does not open before C1, and that no stage direction is spoken aloud. That is the acceptance no test can give you.

**`SC-T2-11` does not block Roc's read of C4.** GP-120's *walk-based* acceptance depends on GP-150, but a human playing it can simply take option (a). The read can happen before any of this is resolved.

**Not started: the Unreal work, and it is the thinnest part of the board.** `GP-36` and `GP-37` are both still Backlog, `tier:must`, `energy:high` — and **GP-37 (persistence — save/load across a reshuffle) is the week-1 gate that content now depends on**, with 14 days to the capstone. Nothing in tonight's session touched either.

A kickoff prompt for a fresh Unreal planning session exists in the previous conversation — feature-complete build, start screen to end screen, Home Hub, clickable examinables, level changes, greybox test levels. Note the fence in it: it tells that session to leave `tools/resolver` and `lantern-projects` alone, which is **no longer necessary** now the import has landed.

**Capstone is Tue 2026-08-25.** The board's must/day rate rose twice today, to 1.73 board-wide and 2.63 in S3 — the highest it has held. That growth came from findings, not from new scope.
