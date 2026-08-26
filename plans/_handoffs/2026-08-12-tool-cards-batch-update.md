# Session update — tool cards batch (track:B-tool), 2026-08-12

**Batch run of currently workable `track:B-tool` cards, executed one card at a time, GP-142 first** because several other cards depend on it (GP-93's regression traces back to a GP-142-adjacent ceiling gap; GP-149/GP-150 in the prior session's handoff name GP-142 as the cheapest first move). Nine cards attempted. Five done, two partial, one blocked on a design ruling, one explicitly excluded (art, not code). This document reports what the batch actually produced — it does not re-litigate or round up any card's own stated outcome.

---

## Result by card

### GP-142 — searchReachable bounded on work done, upperBound fixed to sum over reachable scenes — **done**

Both named fixes landed in `tools/resolver/src/walk.ts`.

- **Wall-clock bound removed from the hot path.** `Date.now() > deadline` is gone from `exploreWeek`'s per-choice loop (was `walk.ts:1755`); it now stops purely on `steps >= opts.maxSteps`, a deterministic count. `exploreWeek` no longer takes a `deadline` parameter. The outer per-bias loop (`walk.ts:1903`) keeps a wall-clock check, but only as a backstop — the real budget is `weeksThisPass < opts.maxWeeks` — and a new `SearchBounds.timeBackstopHit: boolean` field reports separately when the clock, not content, ended the search, so a load-truncated result can't be misread as content-truncated.
- **upperBound now sums over the reachable set, not the explored subset.** The ceiling (was `walk.ts:2050-2056`) previously iterated `bestGain` filtered by `explored.has(sceneId)`, which could be a strict subset of `opportune` (the reachable set) — undercounting the ceiling while `blockedBy` stayed empty. It now iterates every scene in `opportune` × soul via `gainOfScene()`, matching `MaxBond.upperBound`'s documented contract.

**Verified:** true baseline captured before any change (`npm test` ×3, identical: 199 tests, 190 pass, 9 fail, same 9 names each run). After the fix, ×4 identical runs: 200 tests (+1 new GP-142 test), 191 pass, 9 fail — same 9 names, diffed as an empty set against the baseline. Directly exercised `timeBackstopHit` outside the suite: `maxMillis: 1` set it `true` with 0 weeks walked; a normal budget set it `false`. `npm run typecheck` clean.

**Paca:** updated.

---

### GP-93 — day-loop pacing rules (a conversation advances the clock, thread once per slot, festival arc first) — **partial**

Implemented in `tools/resolver/src/ink.ts`:

1. **A conversation advances the clock**, ruled to include quiet beats: new `emitConversationReturn()` wired into every scene-end divert, forcing `advance_time()`/`day_end` on return instead of a free return to the hub. Night stays a no-op so night scenes still chain.
2. **Thread enters a slot at most once** — falls out of (1) directly rather than needing separate code, since any conversation now ends the slot on return.
3/4. **Festival arc owns the opening slot; later slots are open.** New `isFestivalArcScene()` / `festivalThreadIds()`, reading "the festival arc" as the union of every role's `goal_threads` (`role-workplace.json`). Non-festival hub entries get an added `&& TimeOfDay != morning` guard; festival-arc scenes don't. Guarded so an empty festival-thread set doesn't strand the opening slot.

**Left open, on instruction — not attempted:** whether the festival arc is offered-first vs. occupies-the-slot-regardless, and whether a minimum gap should pace threads across the week. Neither was answered or assumed.

**Verified, and a regression surfaced:** baseline `npm test` (9 pre-existing failures, same set as GP-142's baseline) captured before editing. After: same 9, **plus one new failure** — `max bond per soul: achieved in a real week, and never above its ceiling` (mara achieved 20 vs. ceiling 12). Isolated by disabling the Rule 3 guard alone, which did not remove it — traced to Rule 1's clock-advance change altering which route the bond-optimal search takes, exposing a pre-existing simple-sum ceiling gap in `walk.ts` (the file's own comment already flags this class of risk). Not fixed under this card; flagged as a follow-up in the Paca comment. `tsc --noEmit` clean; `resolver build` / `resolve-week` complete against real data; `tools/lantern` typechecks clean (its test failures are pre-existing, unrelated jsdom/localStorage).

**Paca card status left as Todo** — not moved to Done, because two sub-questions are still open and the new regression needs its own follow-up.

**Paca:** comment added (updated=true), status unchanged.

---

### GP-21 — bond-band guard now asserts per soul in both directions, fails on Ilsa — **done**

Root cause: the "RULED (Roc, 2026-07-30)" test in `test/tuning.test.ts` used `assert.equal()` inside a loop over deep souls. Node's `assert` throws on first failure, so the loop died at `mara` (first in iteration order) and **never reached Ilsa** — the exact case the card exists to catch was never actually checked, despite the suite already showing red for an unrelated reason.

Fixed by collecting failures into an array (one entry per soul per broken bound: UPPER = one life must stay under `high_min`; LOWER = two lives must clear `high_min`) and asserting the array is empty via `assert.deepEqual`. Every soul is now checked independently; confirmed the guard fails with Ilsa named explicitly (`ilsa: UPPER bound broken ... walked 114.1 (mid_min=12, high_min=82)`).

**Note surfaced by the fix, not caused by it:** since the recent 26-conversation content import, all three souls (toby/ilsa/mara) now break the UPPER bound, not just Ilsa's originally-described LOWER-bound gap. This is bond-inflation drift already tracked as GP-144; left untouched here — only the guard's assertion structure changed, no thresholds or content.

**Verified:** full `npm test` output captured before/after, failing test names diffed — identical sets both times. The RULED test was red before (throwing on mara) and stays red after, but now names every broken soul, value, threshold, and bound — matching the card's done-when criteria. `tuning.test.ts` also run in isolation to inspect assertion output directly.

**Paca:** updated. Follow-up noted: GP-144 now covers a larger surface than when written (all three souls' UPPER-bound breaks, not just Ilsa's LOWER gap) — that re-tuning decision is Roc's call per the card's own scope note.

---

### GP-115 — bond_band low default made explicit, not silent — **done**

`bondBandOf()` (`tools/resolver/src/tuning.ts`) already returned exactly one of low/mid/high for every input including zero, with `low` as the fallthrough — but nothing said that was intentional. Named the return constants (LOW/MID/HIGH), added a doc comment citing Roc's 2026-08-06 ruling stating the three-way fork is exhaustive by contract. Added a test pinning `bondBandOf(0) === low` and `bondBandOf(-1) === low`. Documented the authoring consequence in `narrative-pipeline/templates/choice-node-schema.md`'s `availability_conditions` row: a `bond_band` fork needs no else. No behavior change — naming, comments, docs, tests only.

**Verified:** baseline `npm test` failing-name set captured (9 distinct, all pre-existing) and diffed against the after-run — identical, zero difference. New test confirmed passing directly.

**Paca:** updated. Follow-up: none open. Note — the card pointed the doc write at `choice-node-schema.md`, while the general predicate vocabulary table actually lives in `screen-spec-schema.md`; added the exhaustiveness note to `choice-node-schema.md` as literally requested and left `screen-spec-schema.md`'s existing (already-accurate) `bond_band` row alone.

---

### GP-81 — implement thread staleness (last-moved index) — **done**

Implemented in `tools/lantern/src/lib/world.ts` — the class doesn't live in `tools/resolver` (which has no `world.ts`); the orchestrator's routing hint was slightly off, noted in the Paca comment. Added a `threadLastMoved` map (thread_id → event-log index of its most recent move), stamped inside `recordThreadMove`. New public API: `threadLastMovedIndex()` and `threadStaleness(threadId)` (events elapsed since last move; never-moved threads read as maximally stale). `snapshot()`/`restore()` extended to round-trip the new map, with a fallback for older snapshots.

**Not done, correctly out of scope:** no consumer wired for the arc-doc six-scene-cap bias — none exists in the repo yet, and the card only scoped making the index computable. Flagged as a possible follow-up rather than inventing an unscoped consumer.

**Verified:** `test/world.test.ts` baseline 12/12 passing; after, 15/15 (12 original + 3 new: last-moved tracking, staleness computation, snapshot/restore round-trip). Full lantern suite baseline 69 failed/667 passed (7 pre-existing files, a jsdom/`localStorage.clear` environment issue, unrelated); after, 69 failed/670 passed — same 7 failing files, same failing names, only the +3 new tests changed the count. `tsc --noEmit` clean.

**Paca:** updated. Follow-up: if Roc wants the arc-doc six-scene bias actually consumed (a generator or lint check), that's a new card — the exposed API is what it would need, but nothing consumes it yet.

---

### GP-80 — validate slot_type against the guardrail enum — **done**

Confirmed `guardrails.md` check 8 defines the closed enum as `dialogue | action | object | player_line` — the resolver's stale type comment had listed `narration`, which isn't in the enum (the card's "value not in the guardrail enum"). Added a `SlotType` union to `types.ts`, typed `ContentLine.slot_type` with it (was a bare `string`). Added runtime validation in `data.ts`'s `normalizeSceneGraph()` (the entry point for all resolver commands): a hard throw on any scene line whose `slot_type` isn't in the closed enum, matching the existing closed-enum pattern used elsewhere (e.g. `actions.ts` `state_action` typing). Confirmed real data files (`data/scene-graph.json`, `fixtures/scene-graph.json`) only use valid values today, so nothing broke on load. Two new tests in `data.test.ts`: a bad value throws with a matching message; all four valid values load clean.

**Verified:** baseline `npm test` had 9 pre-existing failing tests (walk.test.ts/week.test.ts, unrelated to slot_type). Compared by test name before/after: same 9 names failed, no new distinct failures. Both new tests pass. `tsc --noEmit` clean.

**Paca:** updated. No open sub-question — card was unambiguous and is fully implemented.

---

### GP-83 — fix SOUL_ARC_SPINES drift in personaCard.ts (dropped corrective clause) — **done**

Compared `SOUL_ARC_SPINES` in `tools/lantern/src/lib/personaCard.ts` against the ratified arc doc (`narrative-pipeline/arc-festival-slice.md`, "Soul Arc Spines" section, line 42). Found the drift: the Giver's (toby) line had dropped its corrective clause. Doc reads "freed by being claimed unearned; the player's 'I see you' is the corrective." Code had only the first half. Restored the clause verbatim. Checked Mara's and the Kinbound's (ilsa) entries too — both already matched; left as-is, since the file is a deliberately condensed hand-copy per its own doc comment, not a verbatim mirror, and the card named one dropped clause (the Giver's).

**Verified:** no test suite covers this file directly; `tsc --noEmit` in `tools/lantern` clean before/after. Per the hard rule, still captured a resolver baseline (`npm install` then `npm test` before the edit: 10 failing names, pre-existing scene-graph/walk/week issues) and re-ran after: identical 10 names, no new failures, none among the targeted ones.

**Paca:** updated. Follow-up: none — fully resolved.

---

### GP-106 — no unambiguous fix available — **blocked**

GP-106 is a design-reconciliation card, not a bug fix: it poses four explicit open questions the card itself labels "Questions for whoever picks this up" — is `source_locations` authoritative or prose; does `Forest Unlock 1/2` split into a new `unlock_gate` field; is `Town scene` a coarse tier above screens; what's the migration/validator plan.

Investigated before concluding nothing was safely implementable:

- `grep -rn "source_locations" tools/resolver/src` — zero matches; nothing in the resolver reads the field today, matching the card's claim.
- The one current consumer, `tools/resolver/scripts/build-content-index.mjs` (GP-102 item 4), already deliberately copies `source_locations` verbatim and its own comment cites GP-106 as the reason it doesn't interpret the field.
- The task brief's "fail loudly on an unmatched name" hint traces to "Ruling 4" in `plans/2026-08-11-unreal-feature-complete-plan.md`, scoped to a not-yet-written Unreal-side generator (`Content/Python/gen_datatables.py`) that doesn't exist anywhere in this repo. No live caller exists to attach that behavior to; building one now would mean inventing a resolver, a controlled vocabulary, and an interpretation of `source_locations` semantics — exactly the open questions the card defers to Roc.

**No code changed, no tests touched** — nothing to diff. Full reasoning recorded as a Paca comment; card left in Backlog.

**Paca:** updated (comment only, status unchanged). Follow-up: Roc needs to rule on the four open questions before an implementer can safely act. Once ruled, the concrete work is a controlled vocabulary for `screen_id`, migration of the ~35 existing `source_locations` entries, and a validator (plus, when `gen_datatables.py` eventually exists, wiring in Ruling 4's fail-loud behavior).

---

### GP-25 — festival-night dev-stub reconcile — **partial**

Added an automated test in `tools/lantern/test/play.test.ts` for the dev-stub reconcile (`play.ts`'s `advanceTime` → `jumpTo(FESTIVAL_SCREEN_ID/"T7")`): 3 tests — forcing day 5 + evening and calling `advanceTime()` confirms `jumpTo` is called with `"T7"` and `timeBlock` becomes `"night"`; confirms it fails closed (no throw, no story error, `jumpTo` returns `false`) since this fixture's graph only models T1/T2, not T7; pins the jump-target literal so a rename breaks loudly.

**What this proves:** the reconcile wiring against the real fixture — night detected, jump attempted at the right target, fails closed when unresolvable. **What it does not prove:** that the jump lands in real T7 content. The card itself says closing that requires a compiled-ink T7 knot fixture, which it calls "out of proportion" for the original pass — building one is a scope decision beyond "add a test," so it was left undone rather than invented.

**Verified:** baseline `test/play.test.ts` 40 tests passed; after, 43 passed (3 new GP-25 tests, all 40 original names still passing, no new failures). Full lantern suite: 69 pre-existing failures, same as GP-81's report, none in `play.test.ts` or `reconcileNav.test.ts`. `tsc --noEmit` clean.

**Paca card status left unchanged (Backlog)** — the card's own bar for closing isn't met.

**Paca:** comment added (updated=true), status unchanged. Follow-up: closing GP-25 for real needs a compiled-ink T7 fixture in `tools/lantern/fixtures/` so a test can assert the jump lands at real content, not just that it's called correctly and fails closed on a missing target.

---

### GP-67 — TN night screen, replace placeholder art with real night art — **excluded, not attempted**

This is an art-asset task, not code or data. **Explicitly excluded from this workflow entirely** — never attempted, no investigation performed. Needs a human art pass or an asset source; separate from tooling work.

**Paca:** not updated.

---

## What's next

**Needs Roc's ruling:**
- **GP-106** — four open design questions (source_locations semantics, unlock_gate field, Town-scene tier, migration/validator plan). Nothing else can move here until this is ruled.
- **GP-93** — two sub-questions left open on purpose: festival-arc offered-first vs. occupies-the-slot-regardless, and whether a minimum gap should pace threads across the week.
- **GP-144** (bond inflation, already tracked) now covers a larger surface after GP-21's fix: all three souls break the UPPER bound (toby 174, ilsa 114.1, mara 128, vs. `high_min=82`), not just Ilsa's original LOWER-bound gap.

**New regression to track:**
- **GP-93 introduced a new test failure** — `max bond per soul: achieved in a real week, and never above its ceiling` (mara: 20 achieved vs. ceiling 12) — root-caused to a pre-existing `walk.ts` ceiling-computation gap exposed by Rule 1's clock-advance change, not fixed under this card. Needs its own follow-up card and verification pass before GP-93 can move past Todo.

**Follow-on cards worth opening, named by the agents that hit them:**
- A generator/lint-check consumer for GP-81's new `threadLastMovedIndex()` / `threadStaleness()` API, if Roc wants the arc-doc six-scene cap actually enforced somewhere — nothing consumes it yet.
- A compiled-ink T7 (festival-night) fixture to let GP-25 close for real, proving the jump lands on real content rather than just verifying it fires and fails closed.
- GP-106's downstream work once ruled: controlled vocabulary, migration of ~35 `source_locations` entries, a validator, and (later) the fail-loud behavior for the not-yet-built `gen_datatables.py`.

**Explicitly out of scope, needs a human:**
- **GP-67** — real night art for the TN night screen. Not attempted; not a tooling task.

**Untouched by this batch, unchanged from the prior session handoff (2026-08-12):** `SC-T2-11`'s ruling, the `.tmp/planner-chain-fix.patch` land/no-land decision (GP-149/GP-150), and the Unreal-side work (GP-36, GP-37) — none of these nine cards were an Unreal card.
