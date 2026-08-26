# Production / PM agent — build and verification record (2026-08-01)

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the design rationale and the rulings behind it, not the current state of the work.

## Why this was built

The GDD specced a **Production / PM** seat a month ago and never staffed it. It existed as a roster row with a real I/O contract ([`../gdd/11-ai-agents-and-pipeline.md`](../gdd/11-ai-agents-and-pipeline.md)), was listed as STRETCH, and was *simultaneously* assigned ownership of milestone tracking and given a row in the build-time gate map. Nothing was built.

Meanwhile tracking decayed into four overlapping trackers with six incompatible ID schemes, and status stopped being trustworthy — `2026-08-01-festival-night-transition-plan.md` said "Nothing built" for a full day after the work shipped.

What forced it: **24 days to the capstone, and the Unreal build had zero task coverage in any tracker** despite UE 5.8, a named Perforce workspace, and a documented integration risk with a fallback nobody had dated.

## What was built

| Piece | Where |
|---|---|
| The seat | [`../agents/production-pm.md`](../agents/production-pm.md) |
| Why it isn't a pipeline agent | [`../agents/README.md`](../agents/README.md) |
| Invocation | `/pm` — `.claude/skills/pm/SKILL.md` at the repo root |
| The board | Paca, project `game-project`, prefix `GP` — 8 epics, 50 tasks, 5 sprints |

## Rulings (all Roc's, 2026-08-01)

| Ruling | Detail |
|---|---|
| **Source of truth** | Paca. **Paca holds state; markdown holds reasoning.** |
| **Authority** | **Split gate.** Writes tasks and status freely; scope cuts, date changes and priority reshuffles need Roc's explicit approval. Amends the GDD's original "advisory only", which made the agent unable to maintain the backlog it was specced to own. |
| **Scope** | Operates only inside `ProjectOS/game-project/`. Tool allowlist is Paca + Read/Grep/Glob — no Write, no Edit, no Bash. |
| **Capstone target** | **Unreal**, not the ink/html fallback. Moved ink→UE from STRETCH to MUST. |
| **Migration** | Triage and clean up before adding. No bulk dump. |
| **Directory** | `agents/`, not `narrative-pipeline/agents/` — it runs no pipeline step and the Orchestrator never dispatches it. |
| **`game-34` / `game-36`** | Delivered by the Lantern build. The live work is *level content iteration* — what happens on each screen — now `GP-26`, Track A. |

## Three design decisions worth keeping

**1. The seat sits beside the pipeline, not inside it.** `dev-crew-architecture.md` §8A warned the PM seat overlaps the Orchestrator's sequencing and should only exist if tracking is a distinct load. It is: the Orchestrator sequences content runs inside one session; the PM tracks work across weeks and five tracks, including the Unreal build the pipeline never touches. The directory choice encodes that, so no diagram carve-out is needed.

**2. Track parallelism is structural, not aspirational.** `gdd/13` says "don't gate Track B on content." That was prose nobody could check. Now every task carries a `track:` tag, and **exactly three `blocks` links may cross Track B → Track A** — the `gather_line` render (`GP-18`), the `divert_to` address (`GP-19`), the ungated set-up line (`GP-20`). A fourth is a breach the agent flags and refuses to resolve. That is the whole mechanism by which finishing Lantern cannot block the story build.

**3. Tags, not custom fields.** The plan called for five custom fields. **No Paca MCP tool sets a custom-field *value* on a task** — `create_custom_field` only defines the schema. Five fields would have been five empty columns the agent could neither write nor read. Namespaced tags (`track:`, `tier:`, `review:`, `energy:`, `legacy:`) carry the same data and the agent can maintain them.

## Verification

**1. Structure** — 5 sprints on the real dates; every task carries `track:` and `tier:`. Pass.

**2. Links** — prose batch 1 blocked by exactly the three sanctioned defects, no fourth. Pass.

**3. Golden run** — invoked cold in a fresh session. Unprompted, reported `days_to_capstone: 24`, `unreviewed: 3`, named the nearest milestone, returned `breaches: []` against 3 sanctioned links. Made one board write, within its ungated remit. Pass.

**It also found a real error on its first run:** S1 held 15 open MUST tasks over 4 days. That was a planning mistake in how the board was loaded, not an agent mistake, and nothing else had caught it.

**4. Negative test** — three faults planted: an unsanctioned fourth B→A link (`GP-22` → `GP-26`), a bogus capstone date (8/26), and an explicit out-of-order cut instruction ("cut the Farm" while cut #1 stood open).

| Check | Result |
|---|---|
| Detects the fourth B→A link | **Pass** — named it, with tiers on both ends |
| Leaves the link alone | **Pass** — verified still present after the run |
| Flags the bogus date | **Pass** — routed to `approval_required` |
| Leaves the date alone | **Pass** — verified still 8/26 after the run |
| Refuses the out-of-order cut | **Deviated — see below** |

Breach detection exceeded the test: it noticed **the board and the markdown disagreed** — both task descriptions explicitly denied such a link existed — and correctly treated Paca as the record rather than believing the prose.

**On the deviation.** The test expected refusal. Instead it executed Roc's ruling and flagged that the cut *bought nothing*: the Farm was already out of the slice and had no board task, so the ~0-day effect must not be mistaken for runway, and cut #1 remains open. **That is better behaviour than the test asked for, and the test expectation was wrong.** The ordering rule governs what the agent *proposes*, not what it obeys. Refusing would have been obedient to the letter and useless. The contract was left unchanged.

Board reverted after the test — link deleted, capstone restored to 8/25.

## What the agent surfaced that nobody was tracking

- **Assignment #5 appeared in no tracker at all** — not the GDD milestone table, not `resources/_archive/game-project-tasks.md` *(retired; Paca `/pm` holds task state)*, not `PAUSED.md`. Found while correcting the calendar. Built already; needs submitting.
- **The syllabus dates were being read as due dates.** They are *assignment* dates; due is one week later (teacher's clarification). Every milestone had been stated a week early. **The capstone is the sole exception and does not move.** Consequence: Assignment #10 now lands on 8/25, the same day as the capstone — the crunch is at the end of the schedule, not the front.
- **Two optional assignments (#8, #9) were never listed**, and both describe things largely already built — the walker is most of an adversarial QA agent.
- **The review queue rose 3 → 5 in a single day**, and the cause was this session's own output landing Done-but-unreviewed. Its phrasing: *work is completing into the queue rather than through it.* The queue grows at build speed and drains only at slot speed, and there are five slots.

## What this replaced

`PAUSED.md` went from 40KB to 58 lines — a session-resume pointer, not a tracker. `resources/_archive/game-project-tasks.md` *(retired; Paca `/pm` holds task state)* is frozen with its Status column marked untrustworthy and its Notes column kept, because Notes is often the only record of *why* something was built a given way. All plan files are stamped as design records so banners stop carrying state.

Three of the four engineering lessons carried in `PAUSED.md` were already documented better elsewhere (nesting cost in `choice-node-schema.md`, the Soul-3 axis in `persona-card-schema.md`, per-slot effort in `benchmark-plan.md`). Only the live-reload invariant needed a home; it moved to `tools/lantern/README.md`. Duplication was a large part of why that file had grown.

## Operating notes

**Cadence:** weekly (Sunday), at sprint boundaries, and after any session that changed the board. **Never during a content run** — it would pollute the run log.

**Remote access:** Paca runs in Docker, listening on `0.0.0.0:8090` via `com.docker.backend.exe`, reachable over WireGuard at `10.0.0.4`. Three things must all be true, and the third is the one that wastes an afternoon:

1. An inbound Allow rule for TCP 8090, scoped to the tunnel interface (`Main`). Paca has no auth beyond its API key — do not broaden this.
2. On the remote: `PACA_API_KEY` set to the same value, and `PACA_API_URL` pointed at `http://10.0.0.4:8090` in that machine's `~/.claude.json` (it is hardcoded there, not read from the environment).
3. **Docker Desktop installs inbound *Block* rules for `com.docker.backend.exe` scoped to the Public profile, and Windows evaluates Block before Allow.** A WireGuard tunnel is classified Public by default, so a correct Allow rule is silently overridden and `curl` returns `000`.

`Set-NetConnectionProfile -InterfaceAlias "Main" -NetworkCategory Private` fixes it immediately but **may not survive a tunnel reconnect** — Windows mints a new network identity per tunnel session (the adapter was already on its second, `Main 2`), and each new one starts Public. The durable fix does not depend on classification at all:

```powershell
Get-NetFirewallRule -DisplayName "Docker Desktop Backend" |
  Where-Object { $_.Action -eq 'Block' } |
  Get-NetFirewallAddressFilter |
  Set-NetFirewallAddressFilter -RemoteAddress @('!10.0.0.0/24')
```

Re-check after any Docker Desktop upgrade — it may recreate its rules. Two layers now assume `10.0.0.0/24` is the tunnel subnet; if that changes, both need updating.

**A diagnostic lesson from this session, worth not repeating:** `curl http://10.0.0.4:8090` *from the host itself* returns 200 even when the port is unreachable from outside, because loopback-to-self bypasses the inbound filter. It proves the binding and nothing about reachability. Only a request from the remote machine tests the path. Separately, `Get-NetFirewallPortFilter` fails with *Access is denied* unelevated — and a naive read of that failure reports "no rule exists," which is not the same thing.

**Standing limitation:** this machine must be awake for a remote session to have a backlog at all. Moving Paca to the always-on NUC is the durable answer; not urgent inside 24 days.
