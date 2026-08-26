# game-project — CONTEXT

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Outer Wilds*, *Spiritfarer*, and *Frieren*, where you **explore, collect, and discover**. (`gdd/01-concept.md`)

Built on ink, with story content produced by an agent pipeline.

**Capstone: Tue 2026-09-01. Content freeze: Fri 2026-08-28.** The one date that does not move. (Moved from 2026-08-25, confirmed by Roc 2026-08-23.)

> **PIVOTED 2026-08-17 (Roc): the capstone ships from the Phaser build**, `phaser/` Mode 4. **Unreal is post-capstone**, not cancelled — `RebirthCore`, the injected story asset and the tag table are the port target. The ink graph is unchanged; both hosts read the same `story.json`.
>
> **Amended Definition of Done — three items:** save and restore (close, reopen, resume) · one week playable to festival night · soul storylines complete. **Reshuffle is out of the DoD**, though the mechanic itself stands.
>
> Authority: [`gdd/12-technical-overview.md`](gdd/12-technical-overview.md) and [`gdd/13-scope-and-risks.md`](gdd/13-scope-and-risks.md). Design record: [`plans/2026-08-17-phaser-pivot-mode4-plan.md`](plans/2026-08-17-phaser-pivot-mode4-plan.md).

---

## ▶ Start here

**Run `/pm`.** It reads the Paca board and reports what is late, blocked, or unreviewed. That is the first move of any session.

Do not reconstruct status from markdown in this folder. **Paca holds state; markdown holds reasoning.** Status banners here went stale repeatedly and cost at least one session — that is why the tracker files were retired on 2026-08-01 and why banners no longer carry state.

Paca project `game-project`, prefix `GP`, id `5db8b37f-8976-49be-9d30-106c53c48303`.

---

## Where things live

| What | Where |
|---|---|
| Open tasks, status, sprints, dependencies | **Paca** — project `game-project` |
| `cast/` | **Canonical persona cards, one file per soul** (`cast/toby.md`, `cast/ilsa.md`). This is the card of record — the pipeline-runs copies are frozen run artifacts and diverge. Edit here |
| `gdd/` | The design doc. Scope tiers, milestone calendar, risks, cut list, the agent crew. Index: `gdd/CONTEXT.md` |
| `narrative-pipeline/` | How story content gets made — pipeline stages, schemas, templates. Own silo: `narrative-pipeline/CONTEXT.md` |
| `tools/` | `resolver` (builds run folders from data) and `lantern` (plays them in a browser) |
| `lantern-projects/` | **The home for actual game content** — versioned run folders; `v01/` is the current playable week. `tools/resolver/out-calib/` is a disposable build artifact, not where content lives |
| `content/` | The generated record library — items, key items, magic. One JSON per record, each folder's `_index.md` carries its schema rulings. Verified by `node tools/content-check.mjs` |
| `pipeline-runs/` | Output and logs from content runs |
| `plans/` | Design records — why a thing was built this way. **Not status.** Index: `plans/CONTEXT.md` |
| `plans/_handoffs/` | Session handoffs — where the last session stopped. Stale by design, never cite one in a contract. Split out 2026-08-16 |
| `knowledge-base/` | Research — narrative craft, point-and-click, Myst ages, UI juice, art. Index: `knowledge-base/CONTEXT.md`. Read `synthesis/` before any track |
| `agents/` | Agent seat contracts. `production-pm.md` is the PM seat, invoked with `/pm`; `qa-adversary.md` is the seat that runs the adversarial QA agent below |
| `assignments/` | Coursework deliverables, one folder per assignment (#5, #6, #7). Each is self-contained with its own README and runnable pipeline. They read *from* the game's documents and derive copies (`assignment-7/style-guide.md` restates `narrative-pipeline/register.md`) — **nothing here is a source of truth, and nothing here feeds the game build** |
| `phaser/` | **The ship target — this is the build track.** Since the 2026-08-17 pivot, the capstone ships from `phaser/` (Mode 4/5), not Unreal. The old "design probe, may not gate Track A" framing is retired (Roc, 2026-08-23) — phaser work is now first-class alongside Track A/B, not subordinate to them. Contract: `phaser/README.md` |
| `resources/` | Syllabus, parking lot, archive |

Key files worth knowing by name:

| Topic | File |
|---|---|
| Milestones, scope tiers, risks, ordered cut list | `gdd/13-scope-and-risks.md` |
| The crew roster and I/O contracts | `gdd/11-ai-agents-and-pipeline.md` |
| The rubric every seat contract is audited against | `agents/contract-audit.md` |
| Engine and technical choices | `gdd/12-technical-overview.md` |
| Nesting cost + `MAX_NESTING` policy | `narrative-pipeline/templates/choice-node-schema.md` |
| Soul-3 asymmetry-axis watch | `narrative-pipeline/templates/persona-card-schema.md` |
| Per-slot model effort | `pipeline-runs/benchmark-plan.md` |
| Live-reload invariant | `tools/lantern/README.md` |
| Headless Phaser runtime check — real Chromium, screenshots, scripted play | `phaser/tools/playtest.mjs` (scenarios: `phaser/playtest/*.mjs`) |
| **Adversarial QA — 250 headless steps of deliberately invalid input, structured report** | `phaser/tools/adversary/` (`npm run adversary`). Everything else in `phaser/tools/` plays CORRECTLY; this is the only thing that sends bad input. Seat: `agents/qa-adversary.md`. Run at a build-phase boundary, before content freeze, before the capstone, and after any change to save, gates, inventory, cast or the day loop — never during a narrative content run |
| Cut a flat-color backdrop out of portrait art (cast reference images) | `tools/remove-background.py` — Blender Python, run via blender-mcp or Blender's Scripting tab |
| UI design system — palette, type, buttons, panels, every reusable component | `gdd/14-visual-style-guide.md` · live reference: `phaser/tools/screen-flow/mockups/design-system.html` |
| Historical `game-NN` backlog (frozen) | `resources/_archive/game-project-tasks.md` *(retired; Paca `/pm` holds task state)* |
| Idea inbox (pre-Paca; not state) | `game-project-ideas.md` |
| Tool and reading links | `game-project-resources.md` |

---

## Rules that outlive any one task

**Verify a phase against disk, never against a banner.** `npm test` and `npx tsc --noEmit` in **both** `tools/resolver` and `tools/lantern`, plus `resolver build` regenerating `out-calib` without throwing. The resolver suite is `node --test` — use `npm test`. `npx vitest run` collects 0 tests there and looks like a wall of failures.

**Tracks A and B run in parallel.** Story work is never gated on tool work, except for exactly three sanctioned blockers: `GP-18` (gather_line render), `GP-19` (divert_to address), `GP-20` (ungated set-up line). A fourth is a breach — the PM agent flags it, Roc rules on it, nobody resolves it silently.

**The PM seat has split authority.** Creating tasks, updating status and writing readiness docs are ungated. Scope cuts, date changes and priority reshuffles need Roc's explicit word every time. Ruled 2026-08-01, amending `gdd/11-ai-agents-and-pipeline.md:26` (the *Gate:* row).

**Never report a bare task ID.** Every `GP-N` carries a short name: `GP-37 (persistence — save/load across reshuffle)`, not `GP-37`.

**Phaser UI work: use the engine skills, and verify with a real playtest, not just `tsc`/`vitest`.** Claude Code's Phaser skills (`graphics-and-shapes`, `groups-and-containers`, `loading-assets`, `sprites-and-images`, etc.) cover engine mechanics — load them before hand-rolling something the engine already has a documented way to do (e.g. Phaser 4 dropped classic `setMask` in WebGL; a skill would have caught that before it shipped broken). For visual/design decisions — layout, palette, matching a mockup — use the `frontend-design` and `ui-ux-pro-max` skills. Then drive `phaser/tools/playtest.mjs` (real headless Chromium via Playwright) and look at the actual screenshot before calling a UI change done — `tsc`/`vitest` prove the code runs, not that it looks right or matches the approved mockup.

---

## Running the current build

    cd tools/lantern && npm run dev      # then load the run folder under lantern-projects/
                                         # (out-calib is a disposable calibration build, not game content)

Rebuild the run folder first if anything changed:

    cd tools/resolver
    node src/cli.ts build --data data --out out-calib --emit-story
    node src/cli.ts resolve-week --data data --out out-calib

---

## The Unreal side — post-capstone since 2026-08-17

**Not the ship target for 2026-08-25.** The capstone ships from `phaser/`. Everything below stays true and describes the port target — authority is [`gdd/12-technical-overview.md`](gdd/12-technical-overview.md).

**Why it moved.** The snags were a **missing host layer**, not an ink problem. `tools/lantern/src/lib/play.ts`'s `LanternPlayer` owns the satchel, day loop, move budget, pack-triage and NPC presence, and the resolver declares that deliberately — `tools/resolver/src/graph.ts:195` marks `present_<soul>` as written by `DAY_START_WRITER`, a **host** writer, and the emitted ink only reads it. Phaser works because it imports `LanternPlayer`. `RebirthCore` reimplemented parts of that layer and never ported `applyPresence`. **The port's first job is that layer, not more engine work.**

Two records this corrects, so they are not re-derived: the 2026-08-12 Unreal summary concluded "nothing anywhere writes `present_<soul>`, so this is an ink gap" and opened Task #157 asking resolver-side vs UE-side — **the answer already exists, host-side, at `play.ts:358`**. And `phaser/GAPS.md` G15's "just regenerate v01" is incomplete for presence, because the ink was never meant to write it.

The UE build lives in a Perforce workspace, not this repo — `rebirth.uproject`, **UE 5.8**, workspace `roclee_CCI-MSiAegis-02_459`. Design flows from here, implementation happens there. Local path is in that project's `.claude/local-paths.md`, which is not synced.

**The ink runtime is Inkpot** (The Chinese Room), ruled 2026-08-02. inkcpp was rejected because its Fab listing stops at UE 5.7 and the engine is 5.8. `knowledge-base/narrative/ink-unreal-integration.md` still ranks inkcpp first — **that recommendation is superseded**; its comparison table remains useful.

The seam is compiled ink JSON. The resolver emits `story.json` (`inkVersion 21`), which is inklecate output and the same format an `InkpotStoryAsset` wraps. Inkpot's importer takes `.ink` source and compiles it with its bundled inklecate; whether it also ingests pre-compiled JSON directly is unverified.

---

## Parked, do not resolve

The "going big" lead pole · the screen-pool pocket (reserved expansion slot) · Obra-Dinn recognition and mana-floor gating (confirmed still cut, Roc 2026-07-29, stamped in `resources/parking-lot.md`) · item generation, deferred by design to stages 4–6 of `narrative-pipeline/content-stages.md`.

---

## Session resume

This file replaced `PAUSED.md` on 2026-08-02. Resume state is the board — run `/pm`. If `/pause` is run in this folder it will write a fresh `PAUSED.md` as usual; treat that as a one-session handoff note, not a tracker, and fold anything durable back into this file or into Paca.
