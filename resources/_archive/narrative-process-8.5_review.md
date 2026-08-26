# §8.5 Narrative Process — synthesis run report & review

Run: `wf_325838bd-8f3` (game-38). 10 agents, 0 errors, ~1.0M subagent tokens, ~24 min.
Draft: `narrative-process-8.5_draft.md` (this folder). Not yet written into `build-gdd-v2_draft.md` — awaiting Roc's approval.

**Draft state (2026-07-21):** fixes 1–3 applied; decision B resolved (speaker_intent kept with guard); full plain-language rewrite done against `prose-voice-rules.md`; a lens-grouped sources block appended below §8.5.4 (provenance, not part of the drop-in section). Still open: **decision A** (the §11 schema edits).

## What ran
- **Stage 0 digest (Sonnet):** read 114 files in full (8 synthesis, 97 narrative, 9 frieren-primary), ~150 techniques, ~7,600 words. Full corpus coverage.
- **Stage 1 lenses (7, parallel):** L1/L2/L5/L6 procedural on Opus, L3/L4 craft on Sonnet, L7 adversarial on Opus → 6 extracts + a 14-item guardrail checklist.
- **Stage 2 Fable synthesis:** wrote §8.5 (12k chars), procedural spine, satisfying all 14 guardrails.
- **Stage 2.5 Opus critic:** attacked the draft. **material_defects = false**, 7 minor defects. **No revision triggered** (draft is v1, unrevised).

## My Stage 3 review verdict: PASS, with named decisions before it goes in

| Criterion | Verdict | Note |
|---|---|---|
| Constraint adherence (no feeling-scripting) | **Holds** | Feeling-firewall (G4/G5/G6/G12) intact. §8.5.4 states it explicitly. One edge to watch: `speaker_intent` (below). |
| Procedural-primary actually dominant | **Holds** | 12-step generation procedure is the spine; craft demoted to guardrails (8.5.2) and register (8.5.3). |
| Buildability (real procedure for §11 agents) | **Holds, with gaps** | Steps tie to §11 I/O concretely, but introduces new schema fields §11 doesn't carry, and one gate has no owner. See decisions. |
| Consistency with §8.3 / §11 | **Holds for §8.3; §11 needs edits** | §8.3 essence-fact/bond-emergent honored throughout. §11 must gain a few fields to express the draft. |
| Prose voice | **Pass** | 0 em-dashes, Frieren-flat, no banned words, present tense. |

The draft is strong and adoptable. Nothing breaches the constraint. The work before it lands is a handful of small reconciliation decisions, not a rewrite.

## Fable's change rationale (what it kept and cut)
- **Spine (kept):** minimal-rule echo templates typed to three shapes (deferred-gap / logistics-first / motif-rhyme); graph-before-prose with stable IDs and precondition-assembled atomic encounters; one-slot-per-call with tone-as-input; the bond as a hidden engine-side action accumulator with replan-only steering; knowledge-flag payoff gating (not visit counts); summarized cross-run engine save; crumple-tiering for scope cuts.
- **L3 folded to guardrails:** essence-vs-role tagging, fact-tier/bias-tier, motif signifier-drift-only checks, authored-exception budget.
- **L4 became the register (8.5.3):** one clause per line, feeling in the wrong register, motif rhyme by exact phrase, silence as a valid state, swell-is-visual-or-sonic.
- **Cut for GDD altitude:** ink syntax specifics (belong in §16), desire-tree scoring internals and decay tuning, Hades line-pool mechanics, all KB citations.

## Adversarial pass: 7 minor defects (none material, so no auto-revision)
These are the surviving nits the critic named. The 3 marked ✅ are now **fixed in the draft** (2026-07-21); the rest are Roc-calls.

1. ✅ **FIXED — Bond-count definition was garbled.** §8.5.1 step 8 said "festival choices met to claimed" — unparseable. This is the load-bearing line separating "counts actions" from "measures feeling." Now reads "festival choices honored."
2. ✅ **FIXED — AI-tell purge (step 10) had no owning agent.** Now attributed to the Content Agent's automated tell/voice-drift pre-pass (§11, Agent 2, which already names this pre-pass), stated as a fixed-pattern tool pass, not a new agent seat.
3. ✅ **FIXED — "Obvious in hindsight" was a craft judgment used as an automated check** (step 4 inevitability test). The automated test now keeps only the two structural checks (in-character, no contradiction of a confirmed descriptor); "obvious in hindsight" is reassigned to Roc's human gate.
4. **Crumple-tier orphan risk (G9).** A "flexible" encounter can host a "must-ship" echo's seed; cutting it orphans the echo. Fix hint: an echo's tier must be no more cuttable than its host scenes (`echo_tier <= min(host tiers)`).
5. **Per-line essence/role tag overreach.** 8.5.2 claims "every line carries an essence or role tag," but the `content_line` schema has no such field and all prose regenerates each run. Either add the field or scope the invariant to card fields + canon facts.
6. **Step 7 "tone drops" reads as agent-side tone assignment**, contradicting tone-as-input. 8.5.3 resolves it (separate calls, separate tones); step 7 wording should match.
7. **Orthogonality check is unbuildable as written** (G1: "check for accidental correlation" — no metric). Needs a concrete rule (e.g. an incompatibility table per axis pair).

## Decisions Roc needs to make (the real gate)
**A. §11 schema edits the draft implies.** Adopting §8.5 as-is means §11 gains fields it doesn't currently have. Flagged by the pass, not assumed:
- **`payoff_voice` / `reveal_npc_id` on `echo_templates`** — the "someone else voices the payoff" shape (e01 horn, e14 ring) needs the payoff soul to differ from the seed soul. §11's single `npc_id` can't express it. **Doubly relevant given the reshuffle.**
- **`speaker_intent` on `content_lines`** — a private speaker-subtext field ("grief spoken as accounting"). This is the one spot on the constraint's edge: it's legal as speaker-only subtext, illegal the moment it becomes an expected-player-feeling field. Worth its own canon flag.
- **A "prerequisite theme already seeded" field on `echo_templates`** — mirror-NPC beats (e11 Kraft) only work if the theme is load-bearing before the NPC appears; there's no telemetry, so it must be an authored precondition.
- Decision: **approve these §11 edits, or ask for a §8.5 that stays inside current §11.**

**B. The `speaker_intent` edge.** ✅ RESOLVED (2026-07-21): keep it, with the guard. §8.5.2 now carries a guardrail bullet: speaker_intent describes the speaker only, never a player feeling, never a target; the Verifier flags any value that names a player feeling or reads as a score.

**C. Two known "the visual layer isn't here yet" truths** (not defects, just expectation-setting):
- The bond stays a hidden action-count, never a meter (hard display boundary — §16 should inherit the "too soft to read as a meter" wording).
- Swell-is-visual-or-sonic assumes a layer the ink/html POC lacks this week. Payoffs will read maximally spare until the Unreal track lands. That's intended; your line review should expect spare, not fatten lines.

**D. Open dials left unspecified (deliberately, at GDD altitude):**
- Seed-to-payoff ratio has no numeric dial (QA covers the orphan case; a density dial would live in the Architect's batch envelope if you want one).
- Cross-run state summary cap size / format (left to §16).
- Retry/escalation after a Verifier/QA flag (still a §11/§20 open item; the draft routes flags back through the orchestrator but invents no retry policy).

## Recommended next step
Fix nits 1–3 (★) in the draft, decide A/B, then I write §8.5 into `build-gdd-v2_draft.md` (replacing the placeholder at its current 8.5) and note the required §11 edits in §20 as open items. Or you read the draft first and redirect.
