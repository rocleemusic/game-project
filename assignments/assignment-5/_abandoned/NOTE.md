# Abandoned — not part of the submission

`gap-auditor/` was a first attempt at Assignment #5, built against the *written* brief
(read GDD → scan codebase → detect gaps → prioritize → generate code) before the
teacher relaxed the assignment in class on 2026-07-30.

It was never finished and **does not run**: the `index.js` entrypoint was never written, so
`npm start` fails immediately. The `prioritize` and `generate` modules (steps 4 and 5) do not
exist either, and the `--offline` fixture replay referenced in `gap-auditor/src/llm.js` has no
fixtures behind it.

What is here: `llm.js` (Anthropic SDK wrapper, works), `paths.js`, `perceive.js`
(LLM feature-extraction from the GDD), `scan.js` (deterministic file walk), `gaps.js`
(LLM diff of inventory vs. scan). Roughly 190 lines, about 60% of the intended design.

It was abandoned because the project already contained a real goal-oriented agent doing
this work on live content — see `../README.md`. Building a second, rubric-shaped agent
alongside it would have demonstrated less.

`../report/gap-audit-2026-08-03.md` is this agent's one recorded run and is kept for the
record. The design it was built against is `../../../plans/2026-08-04-assignment-5-plan.md`.
