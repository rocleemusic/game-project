---
name: unreal-port
type: external-state
status: leftover
record: CONTEXT.md
---

## What it is
The post-capstone port target. The UE build (`rebirth.uproject`, UE 5.8,
`RebirthCore`) lives in a Perforce workspace
(`roclee_CCI-MSiAegis-02_459`), not this repo — design flows from here,
implementation happens there. Demoted from ship target on 2026-08-17, not
cancelled (CONTEXT.md banner). Leftover in this territory's terms: honest
about what it is, spend no capstone attention on it.

## Doors
- `CONTEXT.md` §The Unreal side — the full boundary, incl. why it moved
- `gdd/12-technical-overview.md` — the technical authority
- `phaser/FINDINGS.md` — the recommendations written for this port

## Hits
The files here hold the port's spec: the seam is compiled `story.json`
(inkVersion 21) into Inkpot (inkcpp is superseded — ruled 2026-08-02;
`knowledge-base/narrative/ink-unreal-integration.md` still ranks it first
and is wrong on that point). The port's first job is the LanternPlayer host
layer, per CONTEXT.md.

## Does not hit
Nothing in this repo builds or tests against UE. The workspace-local path
lives in that project's own `.claude/local-paths.md`, which is not synced —
do not hunt for it here.
