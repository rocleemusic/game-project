# Reusable processes from the W1–L8 build — candidates for adoption

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the design rationale and the rulings behind it, not the current state of the work.

**Status: PROPOSAL. Nothing here is adopted.** Roc reviews and decides which to take and in what
form. Three of the eight would change an existing command, so adopting them is not a no-op.

Written 2026-07-31, straight after the W1–L8 build. Everything below is something that actually ran
during that build, with the defect it caught named. Nothing here is a good idea I did not use.

**How to read this.** Each entry says what the process is, the evidence it earned, where it would
live, what adopting it changes, and what it costs or risks. The last field matters most — several of
these are cheap to state and easy to over-apply.

---

## Tier 1 — the three I expect to be reached for again

### 1. The traversal proof

**What it is.** A way to prove a generated artifact is walkable end to end. Four rules, and the first
is the one people get wrong:

1. **An agent AUTHORS the verifier; the verifier is plain deterministic code with no model in it.**
   A model walking the graph at verification time makes the verdict non-deterministic, which is the
   opposite of the point. The agent is useful for *writing* the walker and for *explaining a failure*,
   never for performing the walk.
2. **Content-agnostic: assert on ids, topology and termination only, never on text.** A test that pins
   a string turns every prose edit into a red build and puts the writing pass in a fight with the
   harness.
3. **Report bounds honestly.** A bounded search must say when it hit a bound, so a truncated search
   can never be mistaken for a proof of unreachability. The suite should fail loudly if a bound trips.
4. **Pair a cheap static check with the walk.** Static catches what is decidable from the text alone
   (contradictory conditions, a gate past the end of the run). The walk catches what needs real state.
   Neither subsumes the other.

**Evidence.** Found four real defects nothing else would have:
- `connects_to` was read as directed by the emitter and undirected by the health readout, so six
  screens had exits and no entrances. Two authored scenes and both arc turns were unplayable.
- A guarantee floor that guaranteed nothing usable — a soul placed where they had nothing to say.
- Scene entry was once-only, so entering on the wrong day **destroyed the scene permanently**. A
  player would have seen a conversation that said nothing and never came back. This is the one no
  amount of reading would have found.
- My own bond thresholds, sized against a paper sum the game could not actually reach.

**Where the reusable code is.** `tools/resolver/src/walk.ts` (the walker — `walkWeek`,
`searchReachable`), `tools/resolver/src/conditions.ts` (the static half), and
`tools/resolver/test/walk.test.ts` (the assertion set). Roughly 80% of the walker's *structure* is
domain-independent: the state-key/memo pattern, the bounds accounting, the expected-vs-defect
distinction. The domain-specific part is what counts as a "state" and how presence is applied.

**Where it would live.** A skill (`traversal-proof`) if it should trigger on its own — "is this
reachable", "prove this is walkable", "write playtest scripts" — or a command if it should only run
when named. It needs the code skeleton bundled with it either way, which is why a bare command entry
would be thin.

**What adopting it changes.** Any generated artifact with reachability gets a proof instead of a
spot-check: state machines, onboarding flows, level layouts, form wizards, quest graphs.

**Cost and risk.** The walker took an agent ~25 minutes of wall-clock and two rounds. It is genuinely
expensive to write and cheap to run, so it pays off only where the artifact is regenerated often. The
real risk is a walker that **looks** exhaustive and is not — which is why the honest-bounds rule is
not optional. A search that quietly gives up is worse than no search, because it reads as a proof.

---

### 2. Reader-test runs AFTER the build, with a verify-against-disk pass

**What it is.** An amendment to `commands/reader-test.md`, not a new command. Two changes:

- **Timing.** Run it after the thing is built, not only before. Roc ruled this on 2026-07-31 for a
  different reason ("reader test is not meaningful until we can play a week through") and the ruling
  turned out to be right for a stronger reason than the one given.
- **A new output section: VERIFY AGAINST DISK.** Every load-bearing claim in the doc gets checked
  against the actual code, and the ones that are *wrong* get listed separately from the ones that are
  *unclear*.

**Evidence.** 21 gaps, 7 of them "will break the build". Nearly every one was the same shape: **the
doc recorded a decision that building then changed.** A fresh engineer following it would have pasted
pre-resize thresholds into the one tuning file, built a bridge route that shipped as a CLI command,
added lock-guards to exits that are deliberately unguarded, and hunted for a file that never existed.

It also caught a **real code bug** a pre-build read could not have: the app was running two clocks,
because a doc line said "advanceTime stops being a stub" and only half of that came true. The reader
noticed the doc and the code disagreed about which clock existed.

**Where it would live.** Amend `commands/reader-test.md`.

**What adopting it changes.** The existing command runs at the moment a doc is *least* likely to be
wrong and *most* likely to be re-read as gospel later. Moving it does not replace the pre-build read;
it adds the pass that catches drift.

**Cost and risk.** It is slower than the current reader-test because verifying against disk means
reading code. And it produces a long list — 21 items is a lot to triage, and the temptation is to fix
the easy ones and leave the build-breakers. Ranking by severity is what makes it usable, so the
existing ranking rule stays load-bearing.

---

### 3. Tests encode the RULING, not the number

**What it is.** When a decision is a judgement ("one life earns mid, two earn high"), the test derives
its numbers from real content at run time and asserts the *judgement* still holds. The number in the
config becomes an output of the ruling rather than the record of it.

**Evidence.** The bond thresholds were wrong **twice**. First sized against 4 authored bond events.
Then the content pass raised the authored total and I re-sized against the new sum — which was still
wrong, because a paper sum ignores what a real week can reach. At one point the sum said 24 while a
real playthrough could reach 11, so the ruling "one attentive life earns mid" was quietly false for
both deep souls and nothing said so.

The version that holds: `test/tuning.test.ts` computes the authored maximum from `scene-graph.json`
and asserts the band lands where Roc ruled; `test/walk.test.ts` measures the achievable maximum by
walking. Change content and one of them tells you the thresholds need moving.

**A second shape of the same idea, worth naming separately.** A guardrail test asserts the
**structure**, not a value. The bond one is `world.test.ts`: it checks that the only per-soul number
exposed is the single count, and its comment says outright that if this test ever has to be deleted,
the deleter is violating guardrails check 2. A test that names the rule it protects survives a
refactor by someone who never read the rule.

**Where it would live.** A short rule, probably in the project's test-strategy note rather than a
command — it is a habit, not a procedure.

**Cost and risk.** These tests are slower and more complex than asserting a constant, and a
badly-written one is circular (deriving the expectation from the same place as the value, so it can
never fail). The test must derive the *input* from content and compare against the *ruling*, not
recompute both sides.

---

## Tier 2 — real, narrower

### 4. Lane discipline for parallel agents

**What it is.** When two agents build in one codebase at once, each prompt carries an explicit
do-not-touch list naming the other's files, and new styles/config go in a **new file** rather than a
shared one.

**Evidence.** Two builders ran concurrently on the same React app — one rebuilding node cards, one
restyling the shell — with zero collisions. The card agent put its CSS in `blueprint.css` rather than
sharing `app.css`, and widened three shared selectors with `:is(...)` instead of restating them. The
shell agent left the card rule block byte-identical on purpose so the other agent's edits stayed
unambiguous.

**Where it would live.** Wherever agent fan-out is governed.

**Cost and risk.** It only works if the lanes are genuinely separable. Two agents on the same
component would still collide, and the list gives false confidence that they won't. It also costs a
little architecture — a separate CSS file is a real (small) fragmentation, justified here by the
concurrency and not in general.

### 5. Three prompt clauses that produced honest agent reports

**What it is.** Three lines added to a builder prompt:
- "Verify like a critic, not like a builder."
- "Time the real task in moves against the reference, and fail the piece if it takes more."
- "Report what you could **not** verify."

**Evidence.** Both Gauntlet agents volunteered their own biggest remaining gap unprompted. One
reported that it had deliberately left work undone and named it as the first thing a critic would
attack — which is the only reason that work (L5c) got found and finished. Both stated plainly that
they could not take a live screenshot rather than implying visual verification. One went further and
found a browser-level defect (Chromium force-darkening the whole frozen palette) that no test in the
project could have seen, because the contrast tests parse hex from a token file and never see what
the browser computes.

**Cost and risk.** The "time it in moves" clause needs a reference to time against; without one it
produces invented numbers. And an agent asked to self-criticise will sometimes manufacture a gap to
look diligent — the reports have to be read, not filed.

### 6. "Done when disk says so", with the commands written out

**What it is.** A phase-completion rule that names the exact commands, plus a note on which commands
**cannot fail as stated**.

**Evidence.** This project had already been burned: a status banner claimed "Phases 0–4 done and
green" when `git log --all` proved one phase had never been written on any branch, and later work was
built on the unfixed code. During this build the reader-test found the rule itself was unactionable —
"`resolver build` regenerating `out-calib` without throwing" names no runnable command (`npm run
build` writes somewhere else), and `build` reports a bad gate by **exit code**, not by throwing. So a
reader checking "did it throw" would green-light a failing build.

**Cost and risk.** Written-out commands rot. This is only worth it where the commands are stable, and
it wants a pointer to the source of truth rather than a copy where possible.

---

## Tier 3 — insights, not processes

### 7. Authored ≠ achievable

When a design number depends on what someone can *do*, measure it by doing rather than by summing.
Paper said 24; a real week reached 11. The gap came from three things a sum cannot see: a move budget,
who is present when, and once-only entries. Anywhere a number is derived from "add up all the
content", ask whether the content is all reachable in one sitting.

### 8. When a doc names a wrong filename, grep the code

The reader-test found the plan pointing at `src/reachability.ts`, which never existed. The same wrong
name was also in a **source comment** — so the doc had propagated its error into the code, where the
next reader would trust it more. A wrong identifier in prose is worth one grep.

---

## What is NOT here, deliberately

- **The Gauntlet itself** is already written up in the master plan and needs no re-codifying.
- **Anything I did once and cannot point at a defect for.** Several things felt tidy during this
  build — the compact spec → generator pattern for authoring scenes, for instance — but I have no
  evidence they prevented anything, so they are habits rather than processes and belong in a
  post-mortem if anywhere.
- **The scene-authoring generator** (`scripts/author-scenes.mjs`) is a genuinely useful local tool —
  it enforces the id rule, both required notes, the 2-or-3-option rule and every word ceiling at
  authoring time — but it is specific to this schema, so it is project tooling rather than a process.

## The decision to make

For each of the eight: **adopt / adopt in a different form / drop.** The three Tier 1 items are the
ones with real weight, and item 2 is the only one that changes something already in use.
