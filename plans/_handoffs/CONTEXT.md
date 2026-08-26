# plans/_handoffs — CONTEXT

**Session handoffs.** Where the last session stopped, what it left half-done, what the next one
should pick up first. Each is written for one reader: the next session.

**These go stale by design.** A handoff is true for about a day. Read the newest one for pickup
context and treat everything older as history. Do not cite a handoff in a contract, a schema, or
the GDD — cite the design record in [`../`](../CONTEXT.md) or the Paca card instead.

**Status still lives in Paca.** Run `/pm` first. A handoff tells you what the last session was
thinking. The board tells you what is actually open.

## Reading order

Newest first. As of 2026-08-24 the newest is `2026-08-24-forage-reconcile-build-handoff.md`.

Files are named `YYYY-MM-DD-<what-the-session-touched>-handoff.md`. Three exceptions kept their
original names because other files cite them: `2026-08-12-tool-cards-batch-update.md` (a batch
report), `2026-08-12-unreal-kickoff-prompt.md` (a paste-ready opening message), and
`2026-08-12-unreal-step0-session-summary.md`.

## When to promote

If something in a handoff turns out to be durable — a ruling, a rationale, a process — it does not
stay here. Move it into the matching design record in `../`, into the GDD via `gdd-sync`, or into
`../../CONTEXT.md`. The handoff keeps a pointer. That promotion is the same move the Ruling
Promoter seat makes for contracts ([`../../agents/ruling-promoter.md`](../../agents/ruling-promoter.md)).

## Housekeeping

Nothing prunes this folder automatically. At a sprint boundary, handoffs older than the current
milestone can move to `../../resources/_archive/`. Promote anything durable out of them first.
