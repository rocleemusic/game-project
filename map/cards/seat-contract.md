---
name: seat-contract
type: contract
status: live
record: agents/
---

## What it is
An agent's job description — one markdown file per seat in `agents/` (production-pm,
qa-adversary, ui-builder, ui-verifier, ruling-promoter, ...) plus the narrative crew's
seats in `narrative-pipeline/agents/`. Each defines feature owned, trigger, I/O and an
escape hatch, because seats are dispatched by name and a seat without a hatch guesses.

## Doors
- `agents/contract-audit.md` — the rubric every contract is audited against
- `agents/production-pm.md` — the PM seat, invoked with `/pm`
- `gdd/11-ai-agents-and-pipeline.md` — the crew roster and I/O source of truth

## Hits
Editing a contract triggers the audit (`agents/contract-audit.md`: run "after any
contract is edited, and at a gate or sprint boundary"). Contracts drift fastest right
after a ruling, when the Ruling Promoter has written a new rule into three files and
terminology has not settled. Reference depth must stay ≤ 1 — a rule two hops out may
not arrive. Handoffs are never cited in a contract (`CONTEXT.md` §Where things live).

## Does not hit
`gdd/11-ai-agents-and-pipeline.md` itself — contracts reference it, they do not
redefine agent I/O there. And not the repo-level `.claude/agents/` runners: the seat
contract is the agreement about the job; how a session launches the agent is harness
plumbing outside this territory.
