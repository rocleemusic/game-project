# Handoff — Phaser feature probe

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to do next.

**Written 2026-08-13 · capstone Tue 2026-08-25 · content freeze Fri 2026-08-21**

---

## State

The probe is **done and should not grow**. All four commissioned features work,
both comparative passes are built, and the deliverables are written:

| Document | What it is |
|---|---|
| [REPORT.md](REPORT.md) | The report. Read first. |
| [FINDINGS.md](FINDINGS.md) | Recommendations, with every option switchable in the running build |
| [GAPS.md](GAPS.md) | 17 gaps, each with evidence, owner and a pinning test |

65 tests, clean walk, clean sweep. `npm run dev` — `C` cast, `H` hub, `N` notebook.

## The one thing that matters next

**Regenerate `lantern-projects/v01`.** The run folder was built 2026-08-01; the
resolver's placement logic was last fixed 2026-08-11. Everything downstream is
ten days stale, including the reason Ilsa and Mara seem unreachable.

Two things to clear first:

1. `tools/resolver`'s test suite has a **pre-existing failure** —
   `seedThreadsFromContent` returns 10 thread ids where the test expects 3.
   Regeneration runs through that code.
2. Regeneration is a **content operation** eight days from freeze: new seeds,
   changed placements, possibly invalidating reviewed lines. Roc's call, not a
   task to pick up unprompted.

## What I got wrong, so the next session does not repeat it

I reported that the day resolver ignores `role_workplace` and recommended
constraining `slot_fill`. **Both wrong.** The resolver implements the rule twice
over — a `role_anchor` weight and a scene-screen guarantee floor with rotation.

The error was **measuring generated output without checking when it was
generated**. Before drawing a conclusion from anything in `lantern-projects/`,
check its git date against the code that produced it.

A related miss: I called the 84%-silent placement figure a defect. It is not —
the ordinary weighted draw is *meant* to place souls broadly as ambient
population, and a village filled only to its 19 conversational slots would read
as empty.

## Rules this repo enforces that are easy to trip over

- **Never fork `tools/lantern`.** The probe imports `LanternPlayer` through a
  Vite alias. It owns the satchel, day loop and move budget, and it is tested.
- **Ink owns the clock.** Read `movesLeft` / `TimeOfDay` / `day`; never write.
- **`content/magic/` holds 10 rejected spells** beside the 16 approved, same
  shape, no filename marker. Filter on `status`.
- **A cast's outcome must never change how the result looks.** 31 of 89 authored
  outcomes are no-effect; styling those as failure breaks a third of the system.
- **GDD edits are Roc's gate.** Propose, do not write, unless asked.
- Provisional joins in the probe (`spellGates.ts`, `HOME_SURFACES`, forage
  guarantees) are deliberately probe-local so no content record is edited during
  freeze week. Delete them when the real schema lands.

---

## Prompt for the new session

```
Read ProjectOS/game-project/phaser/REPORT.md first, then GAPS.md.

Context: the Phaser feature probe is complete and should not grow. It is a
design probe plus fallback insurance over tools/lantern's ink engine, not a
port and not a third build track. Capstone is Tue 2026-08-25; content freeze
Fri 2026-08-21.

Do not start work. First tell me:
  1. Which of the six blocking gaps you would act on, and why that order.
  2. Anything in REPORT.md or GAPS.md you think is wrong, with the evidence
     you checked — one finding in there was already corrected once after I
     measured stale output without checking its date, so treat the numbers
     as claims to verify rather than facts.

Then wait for my decision.

Two standing constraints:
  - Do not modify tools/resolver or lantern-projects/ without asking. Both
    are Track A and it is freeze week.
  - Do not edit the GDD without asking.

If I ask you to regenerate lantern-projects/v01, clear the pre-existing
resolver test failure first (seedThreadsFromContent returns 10 thread ids,
test expects 3) and tell me what the regeneration changes before writing it.
```
