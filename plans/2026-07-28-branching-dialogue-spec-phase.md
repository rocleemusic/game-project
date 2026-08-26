# Branching Dialogue + Level Generation + Visual Review Tool — Spec Phase

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the design rationale and the rulings behind it, not the current state of the work.

> Approved plan, 2026-07-28. Source of truth for the spec phase (S1–S6) and the gated build roadmap. Roc gates each phase.
>
> **Phase labels are `P1`–`P5` (2026-07-30).** Three documents each numbered their phases
> "Phase 1..N", so "Phase 4" meant this content pass, the Lantern shell, *and* GDD assembly at
> once. The tracks are now prefixed: **`P1`–`P5` here (the narrative pipeline)**, **`L0`–`L8`** in
> `resources/_archive/2026-07-30-lantern-v2-master-plan.md` *(archived — built)* (Lantern, the tool), and **Workstream 4–7** in
> `resources/_archive/game-project-tasks.md` *(retired; Paca `/pm` holds task state)* (historical task groups, not build phases).
>
> **P4 is superseded (Roc, 2026-07-30).** The Lantern master plan's Part 1 — the nine-scene
> festival-week arc — is the same work at wider scope, and it absorbs Line 04 as its spine. Both
> are **deferred until Lantern is finished**, because the tool exists to make the content. When
> content resumes it resumes as Part 1, not as P4. The one piece the tool build itself needs is
> Line 04 ported into `tools/resolver/data/scene-graph.json`, which is transcription of ratified
> prose rather than authoring.

## Context

The narrative pipeline cannot express a player choice — a documented gap ("spec change 7," surfaced when the Giver's receive-beat Line 04 could not be written: `content_lines` is a flat array, the Content agent is single-slot by design, and the Architect owns "branch intent" with no schema field to emit it). Meanwhile QA is already specced to consume a `scene_graph` with choice edges — the consumer exists, the producer doesn't. Roc also needs level-layout generation (screens, puzzles, NPC availability, random item slots), a way to visually review and approve layouts and dialogue trees, ink file output, and an Inky-based playtest loop with a node view.

Scoping decisions already made by Roc:
- **Spec first, gate the build.** This plan executes Phase 1 (specs only); Phases 2–5 are the gated roadmap.
- **Review tool = custom local web tool** taking compiled ink (`.ink.json`) as input, with placeholder background images and clickable regions for item pickup (text-button fallback).
- **GDD already submitted** — gdd/ files update as living docs, no deadline coupling.
- **Layout ownership: plan decides** → decided below: extend the Architect, no new agent.

Exploration findings that shape the design:
- `resources/level-layout_draft.md` exists and its structure is **ratified** ("the structure is final, only the physical place identity is open") — Town + Forest screens, five-field gates, NPC-slot counts, forage lists. Requirement 1 is formalization + permutation, not greenfield generation.
- `gdd/11-ai-agents-and-pipeline.md:115` currently assigns layout to the **human** ("Human authors layout; QA validates traversal"); line 72 says the **Orchestrator** "lays the scene graph" while `pipeline.md` step 6 gives the **Architect** the scene spec and branch intent. The ownership edit must reconcile all three spots.
- "Random screens off a main screen" (req 6a) tensions with the metroidbrainia law — knowledge lives in the player's head, so a phrase learned at F4 this life must have an F4 next life. Stable topology is load-bearing; this becomes the central question of the permutation discussion doc.
- Runtime is zero-LLM: all randomness must be authored pools + constraints resolved by seeded deterministic host code.
- **Budget is track-not-cap** (Roc's call): the 2M model was for class review. We keep logging total spend per run (run-logs already do this) but no hard ceiling constrains the design. Batching branch slots into one Content call stays as good practice (~1.1–1.2× vs ~2× split), not a gate.

Writing standards for every document this plan produces:
- **All doc writes go through the /plain-language skill** (Orwell + STE, slop-stripped).
- Each workflow doc passes `reader-test` before Roc's review (repo rule).
- **Planning docs live in `ProjectOS/game-project/plans/`** — this file is the spec-phase planning doc; later phase-planning docs join it here.
- **The GDD stays current as we go.** Every spec or phase that changes a ruling updates the affected `gdd/` files in the same pass — never batched for later. Each S-doc's definition-of-done includes its gdd edits (S1 → gdd/03, 11, 13 · S2 → gdd/11 · S3 ratifications → gdd/06/08 · S6 → gdd/11), and Phases 2–5 close with a gdd sync step for anything they taught us (e.g., Phase 4's measured branched-scene costs land in gdd/11; Phase 5's prototype learnings land where they belong). PAUSED.md and game-project-tasks.md update alongside.

## Key design decisions

1. **Layout ownership — extend the Narrative Architect; no new Level Designer agent.** Gate/puzzle specs are already Architect remit (pipeline step 7 five-field gates = the layout draft's own template); a new agent would take the same input bundle — a role distinction without an information distinction. The Architect gains one new scoped *call type* (a "layout/graph pass" producing `screen_spec`s + `scene_graph` + `choice_node`s, with its own lean input bundle). The combinatorial half (ID minting, permutation resolution, ink scaffold) is deterministic code, per step 6's "code builds the structure."

2. **Choice-node schema — branch structure lives in the graph, referenced by ID; `content_lines` stays flat.** `choice_node { choice_id, scene_id, options[2–3]{option_id, verb_family, player_verb (witness·ease·sit-with, never fix), player_line (Intercept-style: the actual words the player says — dialogue options ARE dialogue picks), surface_action (for non-spoken options: the diegetic deed; both shapes coexist in one weave), response_slots (1–3, NPC answers the player's specific words), state_actions (closed typed enum: bond_event | knowledge_flag | thread_move | canon_write), rejoin (gather default | divert rare+flagged)}, availability_conditions, equal_weight_note, no_accrual_note }`. The "never a labeled menu of feelings" rule bans abstract emotion labels, not dialogue text — `player_verb` classification stays hidden authoring metadata, never on screen. `player_line` is authored by the Content agent as its own slot (player voice register, short cap ~12 words). Content fills one slot per call (one-slot-per-call survives); `content_lines` items gain optional `choice_id`/`option_id`. Guards: new guardrails check 10 (flag any option that reads as sanctioned; forbid yes/no/maybe shapes) + one sentence on check 2 (any per-option stored counter is flagged). Festival-tier answer (PAUSED item 2): a choice feeds the tier only through its concrete world consequence, never a stored scalar. **Line 04 (Giver receive-beat) is the acceptance case.**

2b. **Player voice register (new, part of S1) — RATIFIED by Roc 2026-07-28:** the player's `player_line`s use **Roc's voice blended with Frieren's** — flat register per `voice-style-guide.md` (shared world dialect), with the player's own signature on top. Ratified decisions:
   - **Primal placement:** Enticing high (*Worth-Exploring / Interesting* — "the world is worth exploring"), Safe shaded *not-Regenerative* (impermanence, not threat), **Alive low as the arc axis** — the reincarnation loop is the evidence that shifts it. Voice stays flat; the belief under it moves.
   - **Alive-as-arc has a concrete engine (Roc's extension):** a cross-life, host-code variable (working name `world_aliveness`) that grows with **runs played / time spent** — never with choice-picking, so it cannot become a niceness meter. It tunes: the Festival of Souls display, and rare world manifestations (e.g., a spirit glimpsed in the forest). Mechanically it's a weight on the existing authored-pools system — S3 specs it as a permutation input; gdd/06 gets the progression note.
   - **Precision profile:** the player gets its own asymmetry — **exact about what-is (things, counts, durations), vague about what-it-means (significance, attachment)**. Fact-vs-meaning; keeps Toby's (self-vs-other) and Ilsa's (long-span-vs-recent) axes distinct. Per voice-style-guide §7A.2 the player carries the most complex palette.
   - **Fix en route:** `gdd/13` cites a persona-card `primal` field that doesn't exist in the schema — the primal seed work lives only in an archived phase-3 draft. S1/S2 carry the primal seed into the live persona-card schema (as a "the world is ___" sentence field, never a numeric profile) and repoint gdd/13. Also check the archived deep-soul assignment that overlaps the player's *not-Regenerative + Worth-Exploring* placement and flag it to Roc at S1 review.
   - Roc's document-prose voice file (`prose-voice-rules.md`) is referenced by narrative-editor but **not found in the repo** — the player voice derives from voice-style-guide + the Frieren primary corpus (`frieren-primary/e01.md`, `e14.md`, and `frieren-dialogue-jp.md` as raw source).

3. **Screen state → dialogue conditions:** an authorable predicate vocabulary (`current_screen · time_of_day · day · npc_present(soul) · item_held / item_in_slot · KnownPhrases ? x · seen(knot) · bond_band (read-only)`), each entry mapped to its ink construct; compiled to guards by code. Variable tracking = declared `state_actions` authoring-side + the existing ink-data-model D1–D3 boundary runtime-side ("narration proposes, code disposes").

4. **Permutations (reqs 2, 6, 7) — authored pools, seeded code resolution.** NPC availability: role-anchored screen pools + home + constraints, day-start seeded draw into existing NPC-slot capacities, with guarantee floors (deep souls reachable ≥1 slot/day; live arc threads surfaced — "biases, never forces"). Screens: recommend **permute contents, not topology**; offer a bounded screen-pool pocket (one slot drawing from fully-authored screens, Hades-style) as the alternative — knowledge-persistence is the deciding criterion, Roc rules in S3 review. Items: Roc's instinct schema'd — `item_slot { slot_id, screen_id, region, bucket:[{item, weight}], respawn_rule, conditions }`, seeded roll at day-start; buckets keyed to confirmed components (sticks·wool·grass·dirt) + placeholders, independent of the deferred item derivation (content-stages 4–6).

5. **ink file split (req 9):** `main.ink` (INCLUDEs + day-loop harness) · `state.ink` (all LIST/VAR declarations, one place) · `world/<screen>.ink` (screen = knot, interactables/time-states = stitches) · `souls/<soul>.ink` (scene-appearances = stitches, rituals = tunnels) · `system/`. Knot/stitch names ARE the code-minted node IDs; tag contract extends with `#screen:`/`#choice:`/`#opt:` — load-bearing for the tool (tags survive compilation).

6. **Review tool:** local web app, Vite + React + React Flow + dagre/elkjs auto-layout + **inkjs** for play. **Graph comes from `graph.json` exported by the resolver — never reconstructed from ink.json** (graphink's limits are the cautionary prior art); ink.json is for play only. Two modes: *graph review* (level map + per-scene dialogue trees + variable inspector showing readers/writers) and *greybox playtest* (placeholder image per screen, clickable item-slot/interactable regions with text-button fallback, NPC presence from a resolved seed, dialogue via inkjs). Node-view toggle: current position highlighted on the graph; click-to-jump via `ChoosePathString` + state snapshots at every choice (jump back = snapshot restore). **Per-node approve + direct edit (Roc's call):** every node carries an approve button (state → `approvals.json`: `artifact_id → approved|flagged|edited + note + timestamp`, in the active `pipeline-runs/<run>/`) AND its text is editable in place — line text, player_line, option labels. Edits write to an `edits.json` patch file; the resolver applies patches back into the canonical pipeline artifacts (`content_lines`, choice_node fields) on its next pass, mirroring the GDD's compile → edit → patch → retire workflow, so a regenerated graph never clobbers Roc's edits. An edited node auto-marks `edited` (accepted-as-changed). Structural changes (add/remove options, rewire edges) stay out of scope for v1 — those go through the specs; the tool edits words, not structure.
   **Visual design:** both the S5 spec's design-direction section and the Phase 3 build load the **frontend-design** and **ui-ux-pro-max** skills first. Visual reference set: `C:\Users\rocle\Desktop\tool-visual-ref` (7 website/game-UI clips — warm palettes, illustration-forward, serif/display typography, generous spacing, cozy-atmospheric). Use for visual rhythm, typography, and spacing **reference only — do not copy**.

7. **Spend tracking (no cap):** keep the existing per-run token logging (run-log footprints) and extend gdd/11's measured-cost section with a running-total line — tracked, not capped. Batch branch slots into the scene's existing Content call as the default working style (~1.1–1.2× per one-choice scene vs ~2× split). Rejoin-by-default stays — now purely a design + QA-complexity guard (keeps permutation enumeration linear), not a budget guard. Still instrument the first branched run to settle PAUSED item 4 (scene-mapping assumption), since that's a design question, not a cost one.

## Phase 1 — deliverables (this plan's executable work; Roc reviews the set)

Order: S1 → S2 → S3 are the review-heavy specs (S3 is a discussion doc Roc rules on); S4–S6 are smaller extensions.

| # | Spec | File(s) | Serves reqs |
|---|------|---------|-------------|
| S1 | Choice-node schema (incl. Intercept-style `player_line`) + ink weave mapping + Line-04 acceptance case + festival-tier answer + **player voice register entry** (Roc+Frieren blend, primal placement, fact-vs-meaning precision axis — all ratified 2b) + primal-seed field carried into persona-card schema (fixes gdd/13's dangling citation) | NEW `narrative-pipeline/templates/choice-node-schema.md`; extend `narrative-pipeline/pipeline.md` step 8, `narrative-pipeline/agents/content-dialogue.md` (2 optional fields), `narrative-pipeline/register.md` (player entry), `narrative-pipeline/templates/persona-card-schema.md` (primal sentence field), `narrative-pipeline/guardrails.md` (check 10 + check 2 sentence), `gdd/03-core-loop.md` + `gdd/11-ai-agents-and-pipeline.md` (PAUSED item 2 ruling), `gdd/13-scope-and-risks.md` (repoint) | 3, 4, 5 |
| S2 | Screen-spec schema (gates via existing five-field template, npc_slots, item_slots, time-states, connects) + predicate vocabulary + ownership change (reconcile gdd/11 lines 72 & 115 with pipeline step 6) | NEW `narrative-pipeline/templates/screen-spec-schema.md`; row edits in `gdd/11`; remit paragraph in `narrative-pipeline/agents/narrative-architect.md`. Instances seed from `resources/level-layout_draft.md` — not regenerated | 1, 3, 5, 7 |
| S3 | Permutation design discussion — 6a topology question (knowledge-persistence tension, both shapes), 6b NPC availability (fixed / pure-random / weighted-with-guarantees → recommend third), item-slot model, **`world_aliveness` as a permutation weight** (runs-played variable tuning festival display + rare manifestations, per 2b) | NEW `resources/permutation-design_draft.md`; ratified rules later land in `gdd/06`/`gdd/08` | 2, 6, 7 |
| S4 | ink file-split convention + tag contract | Extension section in `narrative-pipeline/build-loop.md` | 9 |
| S5 | Review-tool spec — inputs (ink.json + graph.json + manifest + images/regions), two modes + visual states (idle/active/complete per mode), **per-node approve button + in-place text editing with the edits.json → resolver patch-back round trip**, tech, non-goals (edits words, not structure; never writes ink directly; no LLM), **design-direction section built with frontend-design + ui-ux-pro-max skills against the tool-visual-ref set (reference, not copy)** | NEW `resources/review-tool-spec_draft.md` | 4, 8, 10 |
| S6 | Spend-tracking note (track-not-cap) + scene-mapping instrumentation plan (PAUSED item 4) | Extension of `gdd/11` measured-cost section | scope guard |

Also update `PAUSED.md` (item 2 progresses via S1) and `resources/_archive/game-project-tasks.md` *(retired; Paca `/pm` holds task state)* (game-36 gains the Phase 2–5 breakdown) at the end of Phase 1.

## Gated roadmap (planned, not executed until Roc calls each phase)

*(P1 = the Phase 1 spec set above, S1–S6, complete.)*

- **P2 — Resolver + graph export — DONE (2026-07-30).** `tools/resolver/`, 47 tests: screen specs + choice_nodes → minted IDs → `graph.json` → a compiling-and-playing ink scaffold + seeded day resolution with the live-thread floor proven causal, plus the edit round trip (`build --edits`, stale/orphan surfaced, source wins). `data/tuning.json` is the single home for tunable game settings (Roc's rule), hash-pinned by a no-change regression proof.
- **P3 — Review tool (v1) — DONE (2026-07-30).** Built as **Lantern** (`tools/lantern/`, Vite + React 18 + TS). **Its v2 continuation is a track of its own — `L0`–`L8` in `resources/_archive/2026-07-30-lantern-v2-master-plan.md` *(archived — built)*.** All four planned steps shipped: (1) graph mode on graph.json alone → (2) play mode via inkjs + node-jump snapshots → (3) per-node approve + in-place editing (approvals.json + edits.json patch-back) → (4) greybox images/regions. The approved skin (`design/tokens.html`) is applied and the settings drawer ships with it.

  **Two rounds of use-driven rework followed the four steps, neither in the original description:**

  - **Shell rework ("phase 4b", 2026-07-30).** Global tabs replaced by a **per-pane view-tabs** model: a fixed left navigator (scene rail + HEALTH) plus a **centre** and a **right** view-host, each listing all seven views (Dialogue · Level · Stage · Play · Sweep · Variables · Assets) and showing its own independently. Right pane hideable; defaults centre=Dialogue, right=Level. Fixed the invisible-dialogue bug (`.pane` had nothing to grow into and collapsed to 0px); gave splitters a small floor and a **measured** ceiling in place of arbitrary walls; removed the `--rail-h` splitter; split Stage and Play into separate full-pane views and dropped `.stage-pane`'s 55% cap that was hiding the play options. **Mode (review|play) is now derived from whether a play surface is visible**, never from a click. Housekeeping: mock-play toggle removed, recent-folders dropdown, auto-load of the last folder. *No planning doc was written for this round — this entry is its record.*
  - **Level legibility + collapse (2026-07-30).** The level map's 2-column grid carried no information (positions were array order), so relationships were unreadable. Replaced with three per-pane layouts: **Constellation** (default — each location spreads around its **entrance** screen, radius = hops, each branch owning an angular wedge; keeps the ratified no-flow-axis rule), **Tree** (depth from the start screen — deliberately *does* add a flow axis, offered as a second reading), and **List** (every screen by name, including those holding no dialogue). Both the scene rail's screen groups and the Dialogue view's scene-picker strip now fold away, per-pane and remembered.

  **Standing constraints this phase established:** the design-token palette is frozen (existing custom properties + `color-mix` tints only; `test/contrast.test.ts` is never edited to pass) · never wire `onResize → fitView` — a resize must not yank the user's pan · **a reload is not a user action** (re-reading the same run leaves panes, selection, layouts and viewport untouched) · view state (`PaneState`, pane visibility, collapse, splitter sizes) is **not** document state and must be excluded when undo/redo lands. The last two are carried in `PAUSED.md`.

  State: 217 tests across 21 files, `tsc --noEmit` clean, production build clean. Run it with `npm run dev` in `tools/lantern/`.
- ~~**P4 — Content through the pipeline:** Line 04 as the first choice_node through the full crew (schema/guards/budget test), then the start-trio screens; measure against S6.~~ **SUPERSEDED (Roc, 2026-07-30)** by the Lantern master plan's Part 1 (the nine-scene festival-week arc), which is the same work at wider scope and absorbs Line 04 as its spine. Deferred until Lantern is finished. The S6 cost measurement rides along with Part 1's prose pass.
- **P5 — ink prototype + playtest loop (= game-36):** the specced smallest slice (start-screen opening + one `[LOCK]` unlock + Forest↔Town C1 seam) carrying one choice node; Inky web export as canned-mode proof; iterate per build-loop. Still live, still gated, and now follows the content pass rather than P4.
- **Every phase ends with a gdd sync step** (see writing standards above) — the GDD is a living doc and never drifts behind the build.

## Reuse verbatim (no building)

Orchestrator protocol, revision cap, full-constraint briefing · Verifier + guardrails 1–9 (two surgical additions only) · QA contract unchanged (it was waiting for this graph) · persona-card/echo-template schemas as content sources · arc-doc generative tables as the branch-content grammar (witness/ease/sit-with columns) · ink-data-model D1–D3 persistence boundary · `register.md`, `review.md`, `steering-layer.md` · `level-layout_draft.md`'s ratified structure.

## Verification

- Every S-doc is written through the **/plain-language** skill and passes `reader-test` (zero "will break the build" gaps) before Roc's review — repo rule for workflow docs.
- S1: dry-run the schema by hand-authoring Line 04's choice_node and checking it against both guards + the Verifier's check 10 wording.
- S2: hand-instantiate one screen (T1 Town Square) from the layout draft into the schema to prove the legend maps 1:1.
- S4: sketch the file tree for the slice and confirm every knot/stitch name is derivable from a minted node ID.
- S6: confirm the running-total line reproduces the two proof runs' logged footprints (sanity check on the tracking math — no cap to verify).
- Phase-gate check: nothing in Phases 2–5 starts until Roc reviews the Phase 1 set.
