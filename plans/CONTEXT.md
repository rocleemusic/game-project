# plans — CONTEXT

**Design records.** Why a thing was built the way it was, and what was ruled along the way.

**Not status.** Status is the Paca board — run `/pm`. If a file here reads like a progress report,
it belongs in [`_handoffs/`](_handoffs/CONTEXT.md) instead. That split was made on 2026-08-16
because the two kinds had been sitting in one folder and the "not status" rule kept being false.

## The two kinds

| | `plans/` (here) | [`_handoffs/`](_handoffs/CONTEXT.md) |
|---|---|---|
| Answers | Why is it built this way? | Where did last session stop? |
| Lifespan | Outlives the work | One session, then history |
| Superseded by | A later ruling, marked in place | The next session |
| Safe to cite in a contract | Yes | No |

## What's here

| File | Holds |
|---|---|
| `2026-07-28-branching-dialogue-spec-phase.md` | The P1–P5 narrative-pipeline build phases |
| `2026-07-30-phase23-review.md` | Open review decisions from the resolver/lantern build |
| `2026-07-31-reusable-processes_draft.md` | Processes worth adopting, extracted from the W1–L8 build |
| `2026-08-01-festival-night-transition-plan.md` | The festival-night transition design |
| `2026-08-01-lantern-functionality-pass.md` | Lantern's functionality pass and the rulings behind it |
| `2026-08-01-production-pm-agent.md` | Why the PM seat exists and what authority it holds |
| `2026-08-02-gp18-20-bug-session-plan.md` | The three sanctioned Track-A/B blockers |
| `2026-08-02-gp55-primal-seed-candidates.md` | **Superseded** — Roc authored the seeds directly |
| `2026-08-03-storyline-authoring-process.md` | How a storyline gets authored. The most-cited record here |
| `2026-08-04-assignment-5-plan.md` | The Assignment #5 build plan |
| `2026-08-11-unreal-feature-complete-plan.md` | The Unreal feature-complete plan |
| `2026-08-12-prototype-asset-swap-list.md` | Vendor-asset swap calls for the prototype |
| `2026-08-20-ghibli-art-pipeline-notes.md` | ComfyUI Ghibli tooling, model/LoRA evaluations, and the ControlNet crash workaround |

## Rules

**A record is superseded in place, never deleted.** Put the banner at the top, name the date and
who ruled. `2026-08-02-gp55-primal-seed-candidates.md` is the pattern.

**Carry the design-record banner.** New files here open with the two-line banner used by
`2026-08-01-lantern-functionality-pass.md` — design rationale, status is Paca.

**Name it for the decision, not the session.** `festival-night-transition-plan`, not
`2026-08-01-session-3`. If you can only name it by its date, it is a handoff.
