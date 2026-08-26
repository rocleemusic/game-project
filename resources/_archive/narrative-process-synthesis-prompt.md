# Narrative-Process Synthesis — run in a fresh session

Paste this whole file into a new session. It derives the **§8.5 "Narrative Process"** section of the Build GDD from the narrative knowledge base, using a domain-lens subagent pass that filters into a Fable synthesizer, gets attacked by an adversarial critic, and returns to the main session for review.

**Priority:** procedural techniques are **primary**; narrative cohesion and compelling story are **secondary**. This weighting is enforced by the lens mix (four procedural lenses to two craft lenses), by running the procedural lenses on the stronger model, and by an explicit instruction to the synthesizer.

## What this produces
A drop-in **§8.5 Narrative Process** for `build-gdd-v2_draft.md`: an ordered, buildable authoring process, procedural-first, that the Narrative Architect and Content Agent (§11) can actually run. It replaces the current §8.5 placeholder. Do **not** overwrite `build-gdd-v2_draft.md` until Roc approves the draft; write the draft to scratchpad and hand it back.

## The constraint (load-bearing — every agent gets this verbatim)
> We write stories; we do not script payoff. We author content that invites reaction, and we never claim to produce or measure what a player feels. The mechanical recognition is scripted (the essence-side deduction); the emotional resonance is invited, never scripted or measured. **Procedural techniques are primary; narrative cohesion and compelling story are secondary.**

## Base path
All input files live under: `P:\GitHub\RL_MAP\RL_MAP\ProjectOS\game-project\`

## The corpus (digested once in Stage 0) and the always-passed context

**KB corpus — read in full only by the Stage 0 digest pass:**
- **Synthesis:** everything in `knowledge-base/synthesis/` (`voice-style-guide.md`, `pnc-grammar.md`, `myst-techniques.md`, `going-big-brief.md`, and any others present).
- **Narrative notes:** everything in `knowledge-base/narrative/` (~50 notes).
- **Voice / craft:** the `knowledge-base/frieren-primary/` notes, including **`frieren-dialogue-jp.md`** (source-language dialogue craft from the diarized JP transcripts: 12 turn-templates B1–B12, several native seed-and-payoff shapes, and the A-layer register devices; high-value for both the craft and procedural lenses).

**Always-passed context — handed directly to every agent (small, not digested):**
- **The constraint block** (above), verbatim.
- **GDD context:** `resources/build-gdd-v2_draft.md` §1 (retrospective significance, reframed), §8.3 (superposition: essence-fact vs bond-emergent), §8.5 (the placeholder), §11 (Narrative Architect + Content Agent: `echo_templates`, delta rule, persona cards), §16 (ink is the production narrative engine).
- **Prose voice:** `prose-voice-rules.md` (no em-dashes).

---

## Pipeline

### Stage 0 — KB digest pre-pass (1 agent, Sonnet)
One agent reads the full KB corpus once and writes a condensed **narrative-technique digest** (~8–10k tokens) to scratchpad: the techniques, structural moves, and voice rules found across the KB, each with its source note, tagged `procedural` or `craft`. Keep concrete technique detail, not vague summaries, since every downstream lens builds on this. This is the shared read, so the corpus is read in full only once.

### Stage 1 — Lens extraction (7 subagents, in parallel)
Each agent reads **the Stage 0 digest in full, plus its own specialty subset in full** (named below), not the whole corpus. Pull 1–2 more notes only if a citation demands it. Each returns a structured extract:
`{ techniques: [{ name, kb_source, how_it_applies_to_our_process, kind: "procedural|craft" }], process_steps: [ ordered candidate steps ], flags: [ risks / tensions with the constraint ] }`

**Specialty subsets (digest + these):**
- **L1:** `synthesis/pnc-grammar.md`, `synthesis/myst-techniques.md`; `narrative/{procedural-narrative-generation, efficiently-branching-narrative, harvesting-interactive-fiction, narrative-games-yarn-spinner, arrow-narrative-tool}.md`; `frieren-primary/frieren-dialogue-jp.md` (B7–B12 turn-templates as generation scaffolds)
- **L2:** `synthesis/going-big-brief.md`; `narrative/{emergent-storytelling-the-sims, when-great-foreshadowing-goes-unnoticed, surprising-without-a-twist, in-praise-of-layered-exposition}.md`; GDD §8.3; `frieren-primary/frieren-dialogue-jp.md` (B3/B7/B12 native seed-and-payoff shapes)
- **L5:** `narrative/{dialogue-of-hades, npcs-with-agency-80-days, non-linear-narratives-horizon, quest-design-lessons-witcher-cyberpunk, storytelling-lessons-bioware, mechanics-elevate-narrative-oxenfree}.md`; plus your own knowledge of Wildermyth, Hades, Fallen London / StoryNexus, RimWorld / Dwarf Fortress
- **L6:** `narrative/{narrative-games-yarn-spinner, harvesting-interactive-fiction, efficiently-branching-narrative, arrow-narrative-tool}.md`; GDD §16; plus your own knowledge of the ink language
- **L3:** `synthesis/voice-style-guide.md`; `narrative/{creating-strong-characters, the-problem-with-backstory, side-characters-to-worldbuild}.md`; GDD §11
- **L4:** `synthesis/voice-style-guide.md`; `frieren-primary/*`; `narrative/{how-to-write-absurdly-well-tchaikovsky, in-pursuit-of-a-perfect-montage, environment-as-visual-storytelling}.md`
- **L7:** `narrative/{procedural-narrative-generation, emergent-storytelling-the-sims, writing-books-with-ai}.md`; plus your own knowledge of procedural-narrative failure modes

**Procedural lenses (PRIMARY — run on Opus):**

- **L1 — Procedural generation & templates.** How narrative content is *generated by systems*, not hand-written: parameterized beat templates, generative grammars, the five-field puzzle template, persona cards + `echo_templates`, world-state-driven encounters, constraint-based generation (tone enum, word ceilings, invariant sets), recombination across reshuffles. Core question: *what is the repeatable procedure the crew runs to produce narrative?*
- **L2 — Emergent & retrospective-significance systems.** How meaning *emerges* from persistence (bond level, reshuffle) plus player action, procedurally, without scripting feeling: seed → deduced-condition → recognition as a combinatorial structure; the delta rule as a generation constraint; encounter-over-quest; how the essence-fact / bond-emergent split (§8.3) sets what is scripted vs invited.
- **L5 — Procedural-narrative prior art in games.** Reads the KB **and** draws on known systems beyond it: Wildermyth (combinatorial character stories), Hades (stateful/contextual dialogue — see `dialogue-of-hades.md`), Fallen London / StoryNexus (quality-based narrative), RimWorld & Dwarf Fortress (storyteller / emergent — see `emergent-storytelling-the-sims.md`), 80 Days and other ink games (`npcs-with-agency-80-days.md`, `harvesting-interactive-fiction.md`). Extract concrete, portable techniques and name which port to ours.
- **L6 — Ink / tooling affordances.** Ink is both the this-week POC and the production narrative engine (§16). Ground the process in ink's actual constructs (knots/stitches, diverts, weave, variables, lists, threads, tunnels). What does ink make cheap, what does it make hard, and how should the procedure be shaped so §8.5 is *implementable in ink*, not abstract?

**Craft lenses (SECONDARY — run on Sonnet):**

- **L3 — Cohesion & canon.** Keeping generated content consistent: canon invariants, essence-vs-role discipline, voice-register consistency, anti-homogenization, the Consistency Verifier's role (§11).
- **L4 — Story craft & voice.** What makes a beat land: Frieren flat-register restraint, show-don't-tell, specificity, character distinctness, "the swell is visual/sonic, never verbal."

**Adversarial lens (run on Opus):**

- **L7 — Adversarial failure-mode critic.** Enumerate how procedural narrative *fails*: homogenized NPCs, mechanical hollowness, incoherence across runs, filler, the "AI-generated slop" feel, payoffs that read as scripted feeling. Return a **guardrail checklist** the §8.5 process must satisfy to avoid each failure mode.

### Stage 2 — Fable synthesis (Fable)
Give Fable the seven extracts + the GDD context + the constraint + L7's guardrail checklist. Fable writes the **§8.5 Narrative Process**, weighting L1/L2/L5/L6 as the spine, folding L3 in as guardrails and L4 as the register it's written in, and satisfying every item on L7's checklist. Fable also returns a short rationale (what it kept and cut, and why) and any flags. Prose-voice rules apply.

### Stage 2.5 — Adversarial critic attack (Opus, the L7 role re-invoked)
The critic attacks Fable's §8.5 draft: for each guardrail-checklist item, does the draft actually hold, or can it be broken? Return a defect list. If it finds material defects, Fable revises **once** against them; then continue.

### Stage 3 — Main-session review
The main session checks the result against: constraint adherence (no feeling-scripting), procedural-primary actually dominant, buildability (gives §11's agents a real procedure), consistency with §8.3 and §11, and prose-voice. Then hand the §8.5 draft, the change rationale, and any surviving flags to Roc. Do not write it into `build-gdd-v2_draft.md` until Roc approves.

---

## Output spec for §8.5
An ordered, GDD-altitude authoring process (not over-specified — Van Buren). It should contain:
1. **The generation procedure** — the repeatable steps the crew runs to produce narrative content (procedural-first), tied to the §11 agents and their I/O.
2. **Cohesion guardrails** — the invariants and checks that keep generated content consistent across runs and reshuffles.
3. **The register** — the craft voice the output is written in (Frieren-flat; show, don't tell).
4. **The constraint, stated** — script the mechanical recognition and the narrative text; invite the resonance, never script or measure it.

## Models
Stage 0 digest → Sonnet. L1 · L2 · L5 · L6 · L7 → Opus. L3 · L4 → Sonnet. Synthesis → Fable. Review → main session.

## Output
The §8.5 draft (in scratchpad), Fable's change rationale, the adversarial defect list and what was revised, and the main session's review verdict. Flag anything that risked violating the constraint or that the pass was unsure about, for Roc.
