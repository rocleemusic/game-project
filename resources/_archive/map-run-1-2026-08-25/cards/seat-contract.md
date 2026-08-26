---
name: seat-contract
type: contract
status: live
record: agents/
---

## What it is
One markdown file per agent seat (`production-pm.md`, `qa-adversary.md`,
`ui-builder.md`, `ruling-promoter.md`, ...): what the seat owns, when it is
called, what it may and may not decide. Seats are dispatched by name, so
each contract must be pickable from its "Feature owned" / "When called"
lines alone. A second set of pipeline seats lives in
`narrative-pipeline/agents/`.

## Doors
- `agents/contract-audit.md` — the rubric every contract is audited against
- `agents/production-pm.md` — the PM seat, invoked with `/pm`
- `gdd/11-ai-agents-and-pipeline.md` — the crew's I/O contracts (the GDD side)

## Hits
Editing a contract triggers the audit: `agents/contract-audit.md` says run
it "after any contract is edited," and warns contracts drift fastest right
after a ruling, when the Ruling Promoter has written a new rule into three
files and terminology has not settled. The PM seat's authority split
(status ungated; scope/date/priority need Roc every time) is a CONTEXT.md
rule — a contract edit cannot loosen it.

## Does not hit
`plans/_handoffs/` — CONTEXT.md rules handoffs are "stale by design, never
cite one in a contract." A contract citing a handoff is a defect, not a
shortcut. The `.claude/agents/` definitions at the repo root are the
dispatch layer, not the contract of record.
