# Assignment #5 — Findings & Recommendations (2026-08-03)

> **SUPERSEDED 2026-08-11 — the recommendation was not taken.** This document reasons
> toward building a **feature-gap-auditor** against the *written* brief. That brief was
> withdrawn by the teacher in class on 2026-07-30 and replaced with a much smaller ask:
> build a goal-oriented agent, run it on your repo, write a README. Roc scrapped the
> gap-auditor on 2026-08-11.
>
> **The submitted agent is the Choice Designer seat** ([`../agents/choice-designer.md`](../agents/choice-designer.md)),
> with a real before/after run on `toby-the-shelf`. See [`assignment-5/README.md`](assignment-5/README.md).
> The half-built auditor is at `assignment-5/_abandoned/gap-auditor/`.
>
> **Findings 1–3 below remain accurate and are why the pivot happened** — particularly
> finding 1 (the calendar's "built" claim was unsubstantiated) and finding 2 (the UE spike
> left no runnable agent source). What is superseded is the *recommendation*: the project
> already contained a goal-oriented agent doing this work on live content, so building a
> second, rubric-shaped one alongside it would have demonstrated less.

Evaluation of what existing game-project work can be packaged for Assignment #5
(Goal-Oriented Coding Agent, due Thu 2026-08-13), plus the recorded first
feature-gap audit run. No code was built; the planned package build was stopped
by Roc before any files landed.

## Assignment requirements

The agent must: read/parse the GDD into features · scan the codebase · detect
gaps between the two · prioritize which missing feature to build first · generate
code for at least one missing feature. Deliverables: the runnable agent (source +
config) and a README (what it built, why it selected that feature, did it run in
the game).

## Findings

**1. The calendar's "built — awaiting submission only" claim is unsubstantiated.**
`gdd/13-scope-and-risks.md` stamps Assignment #5 as built (2026-08-01), but no doc
names the artifact. The likely referent is the production-pm seat, built the same
day — a weak match: it has perception and a real prioritization algorithm but
never scans source, never generates code, and lacks the syllabus's competing-goal
arbitration and memory decay.

**2. GP-34 (UE spike) cannot be the submission.** The spike left no artifacts in
this repo — no scripts, no probe docs, nothing in `plans/`. It was manual /
AI-assisted engineering, proven in the Perforce workspace. There is no runnable
agent source behind it.

**3. Real reusable pieces exist for each requirement, but no agent connects them:**

| Requirement | Existing asset | Missing |
|---|---|---|
| Read GDD | 13 structured `gdd/*.md` files; `tools/resolver/data/*.json` is a machine-readable GDD projection | the parser |
| Scan codebase | `tools/resolver/src`, `tools/lantern/src`, `lantern-projects/v01/ink` are real targets | the scanner |
| Detect gaps | Consistency Verifier / QA seats (content-level, markdown-only); resolver compile + traversal validators | a doc-vs-code differ |
| Prioritize | `agents/production-pm.md` ruled prioritization + cut order — directly adaptable | applies to board items, not features |
| Generate code | resolver `emitInk` is a working spec→ink generator | not agent-driven |

**4. Doctrine tension worth stating in the README.** The GDD's build-time table
rules engineering "Human, AI-assisted — human owns architecture; AI assists,
never decides." An agent that generates code is a deliberate delta the assignment
introduces; sandbox its output (e.g. `assignments/assignment-5/out/generated/`)
rather than writing into live tools.

**5. The first live gap-audit run (2026-08-03) worked** — see appendix. Its raw #1
pick was the Inkpot spike (only MUST at zero, hard 2026-08-10 GO/NO-GO). The
board then corrected its perception: Roc ruled GP-34 (UE spike) proven in a
separate session the same day, making the corrected live pick **GP-37
(persistence — save/load across reshuffle)** — MUST tier, the week-1 sequencing
gate requires proving it before content depends on it, and everything cross-life
(reciprocity, meta-hub, second reshuffle) sits behind it. This
perception→correction story is the README's "why did the agent select that
feature" answer.

## Recommendations

1. **Build a small runnable `feature-gap-auditor` agent** (Node, minimal deps)
   as the submission: parse `gdd/` → scan `tools/` + `lantern-projects/v01/` →
   IMPLEMENTED/PARTIAL/MISSING table → priority pick by the ruled rule (tier
   first, then hard-dated risk, then dependency fan-out) → generate one feature's
   code into a sandboxed `out/generated/` (persistence module is the natural
   target, typed against `tools/resolver/src/types.ts`). Include an `--offline`
   mode replaying the recorded audit so a grader can run it without an API key.
   Roughly a day of work.
2. **README answers:** built = the sandboxed persistence module; why = the
   perception→correction story above; ran in game = honestly partial (repo-side
   story.json seam and review tooling run today; generated module not yet
   integrated; spike proven separately in Perforce).
3. **Correct the board:** Assignment #5 is *not* submit-only. The build task
   should exist on the Paca board with the 8/13 due date in view.
4. Ship the appendix audit as the recorded sample run.

---

## Appendix — Feature-Gap Audit (recorded run, 2026-08-03)

Read-only pass over `gdd/` vs. `tools/resolver/src`, `tools/lantern/src`,
`lantern-projects/v01/`.

### Feature inventory & gap status

| Feature / system | Tier | GDD source | Status | Evidence |
|---|---|---|---|---|
| One week playable to festival night (core loop) | MUST | 13-scope-and-risks.md:11; 12-technical-overview.md:35 | IMPLEMENTED | `tools/resolver/src/day.ts`, `week.ts`, `cli.ts resolve-week`; `lantern-projects/v01/day-1..5.json`, `week.json` |
| Day-5 exception / final sequence (night, vignette, final screen) | MUST (ruled) | 03-core-loop.md:20–24; 08-levels.md:25–32 | IMPLEMENTED | `graph.ts:57–78`, `ink.ts:191–278`, `test/festival-night.test.ts`, `home-hub.test.ts` |
| ink→Unreal (Inkpot) integration | MUST | 13-scope-and-risks.md:11,15,29; 12-technical-overview.md:11 | MISSING (repo seam done) | `story.ts emitStoryJson` + `v01/story.json` (`inkVersion 21`) exist; zero UE/Inkpot code in repo (UE lives in Perforce; whether Inkpot ingests pre-compiled JSON unverified) |
| Persistence save + reshuffle across a new life | MUST | 13:11; 12:28,36–37; 06-world-and-progression.md:5–20 | MISSING | `slot`/`life` exist only as seed inputs (`seed.ts:6`); no save/load, slot management, role re-deal, or cross-life bond carry code |
| Bond engine (one hidden count, 4 categories, per-soul coefficients, bands) | MUST (load-bearing) | 06:34–40 | IMPLEMENTED | `tuning.ts` (BOND_CATEGORIES, bondDelta, bondBandOf), `predicates.ts` bond_band guard, `types.ts:135` bond_event |
| 1 deep soul arc end-to-end, seed→payoff | MUST | 13:11 | IMPLEMENTED | `v01/ink/souls/toby.ink` + `ilsa.ink`; thread state in `week.json` |
| 3 deep souls distinct side-by-side | SHOULD | 13:12 | PARTIAL | 2 souls authored (toby, ilsa); third absent from `ink/souls/` and `personas.json` |
| Forest + Town + Festival screens, fixed map | MUST | 13:11; 08-levels.md | IMPLEMENTED | `data/screen-specs.json`, `scene-graph.json`; ink `world/f1–f8, t1–t8` |
| Permutation: seeded NPC availability + item rolls, determinism | (core, ruled) | 06:42–46 | IMPLEMENTED | `seed.ts` (daySeed, weightedPick), `day.ts` day-start draws; guarantee-floor logic |
| World-aliveness hidden count | (ruled 2026-07-29) | 06:48 | IMPLEMENTED | `types.ts:24 AlivenessBand`, `tuning.ts aliveness_bands`, `min_band` gated pool entries |
| Festival outcome spectrum (quiet/warm/grand + rare top) | Min: 1 scene MUST · tiers SHOULD | 03:30–37; 12:30 | PARTIAL | `roleGoals.ts roleGoalsAdvancedCount` compiles; final-screen results slots are named placeholders (08-levels.md:32); no tier rendering |
| Oblique reciprocity — dialogue warms across lives | SHOULD | 13:12; 06:40 | PARTIAL | bond_band guard exists; no cross-life warmed-variant content, no life-boundary code to feed it |
| Magic system — phrase+components casting, 10 spells, knowledge-gate unlocks | Core (slice count stated) | 04-magic-system.md:7–13 | MISSING | zero hits for spell/ignite/cast in resolver src and all v01 ink; Satchel LIST (`state.ink:10`) holds components only |
| Collectibles: Make/craft, pack-triage, satchel, notebook, home decoration | Core | 05-collectibles.md; 03:14 | PARTIAL | forage pools (`types.ts:98`) + item rolls implemented; home hub an explicit placeholder (`main.ink:232`); no Make system |
| Meta-hub / 3 save slots / role select (mage vs blacksmith) | Min: bond+collection persist MUST · 3 slots target | 12:28; 06:7 | MISSING | no meta-hub, slot-select, or role-select code |
| QA / traversal validation (walker) | MUST (crew) | 11-ai-agents-and-pipeline.md:16 | IMPLEMENTED | `walk.ts` (walkWeek, enumerateRoutes, searchReachable, UnreachableNote) + `conditions.ts` static contradiction pass |
| Lantern review tool (human gate, approvals) | MUST (nothing ships unread) | 11:75 | IMPLEMENTED | `tools/lantern/src` — SceneView, PlayPane, ThreadsPanel, reviewApi, `v01/out/notes.json` |
| Content/Consistency agent pipeline producing one soul's lines | MUST | 13:11 | IMPLEMENTED (process) | pipeline-runs evidence cited in GDD (11:32); personas.json from 2026-07-25 runs |
| Production/PM agent maintains board | MUST | 13:11,15 | IMPLEMENTED | `agents/production-pm.md` + `.claude/skills/pm`; Paca is source of truth |
| Second hand-authored reshuffle instance | SHOULD (first planned cut) | 13:12,37 | MISSING | no reshuffle #1 exists yet; sequencing gate blocks it (13:19) |
| Audio: Wwise tags, leitmotif | Track B | 10-audio.md; 12:7 | MISSING (repo side) | no tag-contract code in scanned dirs |
| Style/Art-Direction agent automated | STRETCH | 13:13 | MISSING | no artifacts |
| Souls-of-the-world display | STRETCH | 03:35 | MISSING | no code/content |

### Priority ranking

Rule: tier first (MUST > SHOULD > STRETCH); within a tier, hard-dated risk beats
dependency fan-out beats polish.

1. **ink→UE Inkpot spike** — MUST, hard GO/NO-GO Mon 2026-08-10, only MUST at
   zero; NO-GO fires by default on silence (13:29).
2. **Persistence save + reshuffle engine** — MUST; week-1 sequencing gate says
   prove save/load carries state across a reshuffle before content depends on it
   (13:23); everything cross-life sits behind it.
3. **One on-camera reshuffle instance end-to-end** — MUST (DoD + minimum
   acceptance, 12:27); unblocks the SHOULD-tier second instance.
4. **Festival tier compile → final-screen results** — closes the
   `role_goals_advanced` placeholder (08:32); cheapest MUST-adjacent finish with
   SHOULD payoff.
5. **Magic/casting loop (starter 3 spells + one knowledge-gate unlock)** — core
   loop verb coverage; Forest's two unlocks are knowledge-gated (08:14) and no
   cast path exists in any ink.

**Raw #1 pick — ink→UE Inkpot spike.** Only MUST-tier feature starting from
zero, the project's only hard-dated go/no-go, repo-side seam already emitted.

**Board correction (2026-08-03, post-run):** GP-34 (UE spike) ruled proven by Roc
in a separate session; corrected live #1 is #2 above — **GP-37 (persistence —
save/load across reshuffle)**.

### Limits of this run

- UE side unverifiable — `rebirth.uproject` lives in Perforce; "MISSING" for
  ink→UE means repo-measurable only.
- Paca board not queried during the run — a MISSING feature may already carry
  in-flight tasks.
- Structure-level scan (exports, schemas, tests, keyword greps), not execution;
  PARTIAL judgments rest on placeholder markers and keyword absence.
- Uncommitted working-tree changes to `main.ink`, `story.json`, `graph.json`
  were scanned as-is.
