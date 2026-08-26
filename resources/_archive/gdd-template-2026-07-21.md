# GDD Template & Structure Contract — 2026-07-21

*Reusable skeleton for a Build GDD, plus the rule that governs what is public vs internal. Derived from the Golden Hour exemplar (a classmate's GDD) and settled with Roc on 2026-07-21. The live instance built on this template is `build-gdd-v2_draft.md`.*

---

## The presentable-vs-internal rule

Every block is one of two kinds. Decide per block, not per section.

- **Presentable (plain prose).** The concrete spec a builder or reader consumes: what the game is, how you play it, the decisions, the tables, the agent I/O, the location tours. Lean and concrete.
- **Internal (`> **Dev-crew note.**`).** The rationale, framing, pipeline internals, metaphysics that is never surfaced to the player, guardrails, and the open-questions ledger. Notes to the crew about how the doc or the build works, not the design itself.

Keep sub-section **headings as headings** even when the body is a dev-crew note. Never demote a heading to blockquoted plain text: cross-references depend on the anchors.

## Writing rules (carried on every instance)

- Present tense, no waffling: "the game does," not "the game might."
- Real numbers, or a named open question. An un-prototyped number is an open question, not a guess (Van Buren guardrail).
- Experience-forward, value-backed: state the felt experience first, then footnote the parameter.
- Don't document what isn't decided. Park it in the open-questions section and prototype it.
- Prose voice: `../prose-voice-rules.md`. No em-dashes.
- Living doc. Git history is the changelog.

---

## The spine — 4 Parts, 21 sections

### Part I — Concept & Pillars
1. **Concept** — the elevator pitch. Authored voice; do not rewrite beyond punctuation.
2. **The Hook** — three concrete differentiators, one line each.
3. **Inspirations & Target Audience** — the spec-borrow table (the exact structural move taken from each ref) plus who it's for.
4. **Design Pillars (+ Non-Goals)** — each pillar carries a "never do" refusal contract. Non-Goals are hard refusals.

### Part II — Game Mechanics
5. **Core Loop** — the action families, the day → week → run clock, the ending, the new-run reshuffle. Win/Loss lives here as a subsection. Gate archetypes as a dev-crew note.
6. **Magic System** — how spells are learned, cast, and gated.
7. **Receiver-Determined Outcomes** — the target holds the response logic.
8. **World & Progression** — myth (internal), save-state (public), superposition (internal), the clocks (public), the narrative process (public).
9. **Levels** — the location tours; what each is for, does, and gates.
10. **Art & Audio Direction** — tone words, engine/render approach, sonic identity.

### Part III — AI Architecture
11. **Agents** — the dev-crew roster with typed JSON I/O and a human-gate summary.
12. **The Narrative Content Pipeline** — the build-time pipeline that generates the canned library; the crew rules and the session-state bus.
13. **Runtime Persistence** — deterministic save-state and rules; the blunt zero-runtime-cost claim.
14. **Build-Time Agent Plan** — which agent builds each component, by milestone. Component × agent × when × human role.
15. **Token Budget** — model tiers, the content-budget formula, the dev-time estimate, the human-review bottleneck.

### Part IV — Technical Strategy & Scope
16. **Technical Overview** — platform, engine, and scope; the build tracks; the slice contract; the Van Buren guardrail.
17. **Project Conventions** — naming, resolution, folder map, CI.
18. **Audio & Asset Implementation** — the department-agnostic tag → asset library.
19. **Milestones** — course dates, what must be spec'd before each closes, and who verifies.
20. **Risks & Open Questions** — the ledger as a real section, with fallback ladders on the top risks.
21. **Planned Scoping Cuts** — an ordered cut list; the first things to move to the Parking-Lot if time runs short.

---

## Structural borrows from Golden Hour (why the spine looks like this)

1. **Part grouping** — four Parts over the sections, so the reader has a spine.
2. **Slice / Full split + a Scoping Cuts section** — one build target per layer, and a named cut order.
3. **Component × agent × when table** — maps each build component to the agent that makes it (serves an agentic-AI course directly).
4. **Risk register with fallback ladders** — name the riskiest unknowns and their fallback.
5. **Three-point Hook + blunt AI-budget declaratives** — a crisp "why it's different," flat lines for the zero-runtime-cost claim.
