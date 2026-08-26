# Narrative Process — Feasibility Read (capstone)

*A build-feasibility case for the §8.5 narrative process: what must be built, what is already handled, where the real risk is, and how it scopes down. For the class judgment of possible vs. needs-scoping. The construction spec is in [`../narrative-pipeline/`](../narrative-pipeline/); this doc is the feasibility altitude.*

## Verdict

**Possible, and scopes cleanly.** The shipped runtime is off-the-shelf proven tooling, and the build-time architecture has running production prior art, so neither the engine nor the agent pattern is unproven ground. The real work is a build-time agent crew plus three custom seams. One seam (cross-life persistence) carries genuine risk and already has a first-week test gate. The whole thing reduces to a defensible vertical slice: one soul across two lives, three agents, on the ink web build.

## Already handled — off-the-shelf, low risk

This is the anchor that makes the rest judgeable.

- **The runtime is proven tooling.** ink with the Inky editor (hot-reload authoring), inklecate (the compiler), and inkcpp or Inkpot (the Unreal runtime). The shipped game replays compiled ink JSON with **zero model calls**: no runtime AI cost, no runtime unpredictability, every line human-approved before it compiles in. Compiled JSON is the single engine seam. (`../narrative-pipeline/build-loop.md`)
- **Player-visible state gating is native ink.** Read-counts compile each recognition condition into a guard on its own payoff, so the story queries its own play history; there is no hand-kept flag table to build.
- **The architecture has running prior art.** NeverEndingQuest ships the exact pattern this pipeline uses (one orchestrator plus single-purpose specialists, all flowing through code-validated JSON schemas), open source and in production. The hard part is demonstrably buildable, and several of our components have a concrete template to read. (`../narrative-pipeline/prior-art-neq.md`)

## Must be built — the actual work

Each component ties to a step in the process and carries a difficulty read.

| Component | Serves | Difficulty | Note |
|---|---|---|---|
| Agent crew: Architect, Content, Verifier, QA, Orchestrator | steps 1-8 | Medium | The capstone's core deliverable. Prompt plus orchestration; NEQ is a working template. |
| AI-in-editor beat generator (a harness wrapping the ink compiler and runtime) | the build loop | Medium | Custom, not a shipped ink feature. |
| Cross-life persistence (host serializes bond and knowledge state, re-injects next life) | step 9 | **Highest risk, see below** | Host code. The fragile seam. |
| NPC codex generator plus Verifier enforcement (canonical soul registry, built once, checked every batch) | steps 2, 8 | Low to medium | NEQ has `npc_codex_generator` as a template. |
| Bond-scoring host (one hidden count, weighted by four action-categories and fixed card-trait coefficients) | step 9 | Low | A scalar accumulator with a weighting function. No ML. |
| Recognition and deduction gates (diegetic proof, wrong guesses teach) | steps 6-7 | Design-heavy, not tech-heavy | The proof is an in-fiction action, never an "I figured it out" button. |
| Tag lint (a script over the compiled JSON tags, presence only) | the check pass | Low | Checks metadata presence, reads no meaning. |
| Reshuffle and role-dealing (new role plus a subset of facets, essence fixed) | step 9 | Low to medium | Host code. |

## The one real risk

**Cross-life persistence.** Ink's own save serialization is fragile across authoring edits: read-counts are saved only when used in logic, and choice addresses renumber when a knot changes. So the project rule is no cross-session state inside ink; the host serializes bond and knowledge state at run end and re-injects it the next life. The failure mode is quiet: if that save is lost or truncated, every recognition condition silently never fires and the whole payoff layer dies with no error.

**Mitigation, already in the spec:** write the save/load smoke test in week one, before any content depends on the seam. (`../narrative-pipeline/build-loop.md`, piece 3.) This is the item most likely to earn a "scope carefully" note, and it already has the gate.

## Scope levers

What a reviewer wants to see so the project reads as possible, not overscoped.

- **Vertical slice = one soul across two lives.** [`../narrative-pipeline/examples/worked-example-mara.md`](../narrative-pipeline/examples/worked-example-mara.md) already is exactly this, a ready-made scoped proof.
- **Three agents, not five.** Architect plus Content plus Verifier meets the crew requirement; QA runs manual for the slice.
- **A few deep souls, the rest lighter.** The spec already scopes this way (step 3); scope depth, not breadth.
- **Ship the ink web build first.** Inky's `Export for web` is a valid playable capstone; the Unreal integration is stretch, not slice.

## Maps to the class

The process is not a detour from the coursework; it is the coursework.

- **Agent crew (3+ agents, shared output):** the Architect, Content, Verifier crew.
- **Dynamic content pipeline with consistency checks:** the generation steps plus the Consistency Verifier and NPC codex.
- **Adversarial QA:** the QA agent's reachability, soft-lock, and wrong-action-teaches checks.
- **Complete AI dev pipeline:** the end-to-end chain, prompt to compiled ink, documented in `../narrative-pipeline/`.
- **Capstone playable:** the ink web build of the slice.

## Sources

The build-risk and tooling facts are from `../narrative-pipeline/build-loop.md`. The crew and the step-by-step are from `../narrative-pipeline/pipeline.md` and `CONTEXT.md`. The prior-art template claims are from `../narrative-pipeline/prior-art-neq.md`. The scoped worked example is `../narrative-pipeline/examples/worked-example-mara.md`.
