# §8.5 Narrative Process — v2 run report & review

Run: `wf_325838bd-8f3` (resumed, game-38 v2). 12 agents, 0 errors, ~893k tokens (down from v1's 1.0M: the Stage 0 digest replayed from cache), ~30 min.
Draft: `narrative-process-8.5_v2_draft.md` (this folder). v1 draft kept alongside for comparison. Not yet in `build-gdd-v2_draft.md` — awaiting approval.

## What ran (v2)
- **Digest**: cached from v1 (114 files, unchanged).
- **8 lenses in parallel**: the 6 original + **L8 steering** (read your two D&D arc docs) + L7 adversarial. New KB files routed in and cited. 7/7 technique extracts, 16 guardrails.
- **Fable**: wrote the expanded §8.5 (7 subsections, ~5,000 words), fully cited, plain language.
- **Critic**: found **2 material + 3 minor defects** → **Fable revised once**. This draft is the revised version.

## What's new vs v1
- **§8.5.1 Steering layer (the arc doc)** — World Truths, the Arc Question, Soul Arc Spines, Threads to Not Drop, What This Arc Is NOT. One doc per arc (a span of reshuffle-lives). Feeds Intake. Ported and cited to `CAMPAIGN_ARC.md` / `NARRATIVE_NOTES.md`.
- **Player background-seeding** at Intake; **NPC backstory guidelines + Soul Arc Spine** on the persona cards; **richer delta** (a world fact + a personal fact in one scene, both structural).
- **§8.5.5 build-time ink authoring loop** — grounded in real tooling; names the 3 custom pieces to build.
- **§8.5.6 human review pass** with the **SDT checklist** (autonomy/competence/relatedness), guarded as human-only.
- **A worked example** (Mara across two lives) that runs the whole pipeline end to end. High value for buildability.
- **Inline citations throughout + a grouped sources block.**

## My Stage 3 verdict: PASS. Strong, adoptable. One fix applied; decisions below.

| Criterion | Verdict |
|---|---|
| No feeling-scripting | **Holds.** Critic confirmed it holds on every feeling axis (bond behavioral, SDT human-only, spines/World Truths structural). |
| Procedural-primary dominant | **Holds.** Steering + generation spine lead; craft is guardrails + register. |
| Buildable for the §11 crew | **Holds, stronger than v1** — the worked example makes it concrete. Implies new §11/§12 artifacts (decision A). |
| Consistent with §8.3 / §11 | **§8.3 yes.** §11 needs the new artifacts wired in. |
| Prose voice | **Pass.** 0 em-dashes, plain language, contract terms preserved. |
| **Citations accurate** | **Yes, verified.** See below. |

## The pipeline self-corrected (worth noting)
The critic flagged draft1's ink section as **material**: it attributed the whole ink toolchain (Inky, inklecate, inkjs, inkcpp, Inkpot) to `ink-narrative-scripting-language.md`, which is the 80 Days talk and documents none of it. Fable's single revision **re-cited to the real files** `resources/ink-syntax-reference.md` and `resources/ink-unreal-integration.md`, and **I verified those files exist and genuinely contain every cited claim** (they're your own researched docs from 2026-07-18, with source URLs). Provenance holds. It also **downgraded the tag-lint** to a presence-only check and **listed it among the 3 things that must be built**, closing the second material defect honestly.

## What I fixed in the draft
- **Verb families**: draft said "Collect, Make, Show or Ask, Use." Corrected to **Collect, Make, Use, Converse** (Show/Ask are tag-layer names) per GDD §5. Two places.

## The ink question, answered (from your own resources docs)
Yes, ink has real editing tools: **Inky** (editor with the compiler built in, free `Export for web` HTML build), **inklecate** (compiler), **inkjs** (browser runtime), and for UE5 **inkcpp** (Fab, easiest) or **Inkpot** (UE 5.7+, The Chinese Room, richer). The live edit-while-playing loop is real. Three pieces are **custom to build**: the AI-in-editor beat-generator harness, the tag lint, and cross-life persistence (host code, because ink's own save is fragile across authoring edits — an untested save could silently kill every echo condition). §8.5.5 states all of this.

## Decisions for you before §8.5 goes in

**A. New §11/§12 artifacts the draft introduces** (bigger than v1's list). Adopting §8.5 as-is means:
- A new **arc doc** artifact the crew maintains (one per arc), that the Orchestrator hands each worker (§11/§12).
- **persona_card** gains: NPC backstory guidelines, a Soul Arc Spine, a `payoff_voice`/`reveal_npc_id` on echo_templates, a prerequisite-theme field, and (from v1) `speaker_intent` on content_lines.
- **Intake** gains the player-chosen **background** input.
Decision: approve these §11/§12 edits, or hold the draft to current §11?

**B. Length / altitude.** ~5,000 words is long for a GDD section (Van Buren pressure). Options: keep it all inline; or move §8.5.5 (the ink build-loop) toward §16 Technical where tooling lives, and/or keep the worked example (I recommend keeping it — it's the clearest proof the pipeline is buildable). Your altitude call.

**C. Soul Arc Spine framing** (critic's one surviving minimalism point, defect 5). The critic argues the spine's only mechanical output (biasing which seeds exist) is reachable by tagging seeds to World Truths + essence, and the "X to Y endpoint" framing then needs its own guard against scripting toward it. You explicitly asked for spines, so I kept them. Keep the endpoint framing, or simplify to seed-biasing without a named endpoint?

## Surviving flags (minor, for the record)
- The two ink files cited live in `resources/`, not `knowledge-base/narrative/`, so the sources block spans both folders. Not an error, just a provenance-convention note.
- L6 was under-routed: it only got the KB ink note, not the `resources/` ink files. That caused draft1's misattribution (fixed on revision). If we ever re-run, route the resources ink docs to L6.
- The critic's other minor points (defects 3, 4) were fixed in the revision (resonance judgment moved to the human gate; verb-taxonomy citation corrected).
