---
name: unreal-port
type: external-state
status: dormant
record: CONTEXT.md
---

## What it is
The external UE 5.8 build lives in a Perforce workspace, not this repo —
`rebirth.uproject`, workspace `roclee_CCI-MSiAegis-02_459`; the in-territory pointer
and authority is `CONTEXT.md` §The Unreal side, with `gdd/12-technical-overview.md`
as the engine record. Parked by the 2026-08-17 pivot: post-capstone, not cancelled.
What wakes it: the capstone shipping from Phaser (Tue 2026-09-01).

## Doors
- `CONTEXT.md` §The Unreal side — why it moved, and the two corrected records
- `gdd/12-technical-overview.md` — engine and build-track authority
- `plans/2026-08-11-unreal-feature-complete-plan.md` — the parked plan

## Hits
When it wakes, its first job is the host layer (`tools/lantern/src/lib/play.ts`),
not more engine work — `RebirthCore` reimplemented parts and never ported
`applyPresence` (`CONTEXT.md`). The seam is the same compiled `story.json`
(inkVersion 21) into Inkpot; whether Inkpot ingests pre-compiled JSON directly is
unverified. The ink graph itself is unchanged by the pivot.

## Does not hit
The current capstone. Nothing in `phaser/` waits on Unreal, and reviving Unreal
framing pre-capstone re-litigates a settled ruling. Also do not trust
`knowledge-base/narrative/ink-unreal-integration.md`'s inkcpp pick — superseded
(runtime is Inkpot, ruled 2026-08-02).
