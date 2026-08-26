# Assignment #5 — Build Plan

> **NOT BUILT — scrapped 2026-08-11.** This plan was never approved and the agent it
> specifies was never finished; five of its modules landed, the entrypoint never did.
> It is kept as a design record of the approach that was rejected.
>
> The teacher withdrew the written brief in class on 2026-07-30, replacing it with
> "create a goal-oriented agent, run it on your repository, write a README." The
> submitted agent is the **Choice Designer** seat
> ([`../agents/choice-designer.md`](../agents/choice-designer.md)) —
> see [`../assignments/assignment-5/README.md`](../assignments/assignment-5/README.md).
> The partial build is at `../assignments/assignment-5/_abandoned/gap-auditor/`.

**Date:** 2026-08-04
**Status:** Scrapped 2026-08-11 — superseded, see banner above
**Due:** Thu 2026-08-13
**Source:** `../assignments/assignment-5-findings.md` (findings, recorded gap-audit run, recommendations)

## Goal

Submit a runnable goal-oriented coding agent — **feature-gap-auditor** — plus a
README, satisfying the course's five requirements: read/parse the GDD, scan
the codebase, detect gaps, prioritize, generate code for at least one missing
feature.

## Scope — what gets built

Everything lives under `../assignments/assignment-5/`. Nothing outside that
folder is touched; no writes into live `tools/resolver` or `tools/lantern`
source.

- **`agent/`** — runnable Node.js agent.
  - **Perceive:** parse `../../gdd/*.md` via Claude API (model
    `claude-sonnet-5`) into a feature inventory (feature, tier, source
    file:line).
  - **Scan:** deterministic walk of `../../tools/resolver/src`,
    `../../tools/lantern/src`, `../../lantern-projects/v01/` — no LLM call
    needed.
  - **Detect gaps:** LLM diff of inventory vs. scan → IMPLEMENTED / PARTIAL /
    MISSING table with evidence.
  - **Prioritize:** deterministic — tier first (MUST > SHOULD > STRETCH), then
    hard-dated risk, then dependency fan-out. Same rule the production-pm seat
    uses for scope cuts, applied here to features instead of board items.
  - **Generate:** LLM writes code for the picked feature into
    `out/generated/`, never into live tools.
  - **`--offline` flag:** replays the recorded 2026-08-03 audit as fixture
    data — no API key required, so the grader can run it cold.
  - `package.json` + run instructions (online and offline).

- **`out/generated/persistence.ts`** (+ test) — sandboxed save/load and
  bond-carry module for a reshuffle, typed against
  `tools/resolver/src/types.ts`. This is the "generate code for one missing
  feature" deliverable, targeting **GP-37 (persistence — save/load across
  reshuffle)**, the corrected #1 priority pick.

- **`README.md`** — answers the three required questions:
  - *What did the agent build?* The sandboxed persistence module — explicitly
    labeled as not yet integrated.
  - *Why did it select that feature?* The perception→correction story: the
    agent's raw #1 pick was the Inkpot spike (GP-34) — the only MUST-tier
    feature starting from zero, with the project's only hard-dated GO/NO-GO
    (2026-08-10). The delivery board then corrected that perception: Roc ruled
    GP-34 proven in a separate session, which promotes the #2 pick — GP-37
    persistence — to the live #1. MUST tier, and the week-1 sequencing gate
    requires proving it before content depends on it; every cross-life feature
    (reciprocity, meta-hub, second reshuffle) sits behind it.
  - *Did it run in the game?* Honest partial answer — the repo-side
    `story.json` seam and review tooling run today; the generated persistence
    module is standalone/sandboxed and not yet wired into the resolver; the
    ink→UE spike itself was proven separately in the Perforce/Unreal
    workspace, outside this repo's scan.
  - Doctrine note: the GDD's build-time table currently reserves code
    generation for humans ("Human, AI-assisted — human owns architecture; AI
    assists, never decides"). This assignment introduces agent-side code
    generation deliberately, sandboxed under `out/generated/` to respect that
    boundary rather than override it.

- **`report/gap-audit-2026-08-03.md`** — the recorded run, copied from the
  findings doc appendix, doubling as the sample-run artifact and the offline
  fixture source.

## Build steps (sequenced, ~1 day)

1. Load the `claude-api` skill for current model id / SDK usage before
   writing any API-call code.
2. Read `tools/resolver/src/types.ts` to match types for the generated
   persistence module.
3. Write the deterministic scan + offline-replay path first (no API key
   needed) — independently verifiable before any LLM wiring exists.
4. Write the LLM-calling steps (perceive, gap-detect, generate) as thin
   wrappers the offline mode bypasses entirely.
5. Author `out/generated/persistence.ts` + test as static sandbox output —
   the agent's generate step should be able to reproduce it, but it doesn't
   require a live LLM call to exist in the repo.
6. Write the README.
7. Verify: `node --check` (or `tsc`) on every file; run `--offline` end to
   end; confirm `out/generated/` output exists and the report reads cleanly.

## Non-goals / guardrails

- No writes into `tools/resolver` or `tools/lantern` live source — the
  generated module stays sandboxed.
- No claim that the generated module is integrated or tested against the
  real game.
- No change to Paca task dates, scope, or priority without Roc's word in the
  transcript — the board status correction for Assignment #5 is a separate,
  already-in-flight PM action, not part of this build.

## Open items carried from the findings doc

- Board status correction: Assignment #5's "submit-only" claim is false and
  needs correcting on whichever task carries it.
- A Paca task for this build should exist — `track:D-course` — sprint
  placement is Roc's call.

## Verification

`node --check` (or `tsc`) across `agent/` and `out/generated/`; run the agent
in `--offline` mode end to end and confirm it reproduces the gap table and
priority pick from the recorded run; confirm `out/generated/persistence.ts`
and its test exist and the README reads cleanly top to bottom.
