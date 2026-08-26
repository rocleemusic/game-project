---
name: lantern-player
type: code-system
status: live
record: tools/lantern/src/lib/play.ts
---

## What it is
The host layer — `LanternPlayer`. Loads `story.json` through inkjs, binds
all four `EXTERNAL`s, and owns the satchel, arms-carry, pack-triage, day
loop, move budget and NPC presence. One class because the resolver
deliberately declares host-written state (`tools/resolver/src/graph.ts`
marks `present_<soul>` as written by `DAY_START_WRITER`) and the ink only
reads it.

## Doors
- `tools/lantern/src/lib/play.ts` — the player itself
- `tools/lantern/README.md` — the live-reload invariant
- `CONTEXT.md` §The Unreal side — why the missing host layer sank the UE track

## Hits
Changing it hits both hosts at once: lantern's review playtest and the
Phaser build, which imports it via a Vite alias rather than forking
(`phaser/README.md` §Why it is small — a copy "would drift from the tested
original"). It is also the port spec: CONTEXT.md rules "the port's first
job is that layer, not more engine work."

## Does not hit
The ink. CONTEXT.md corrects two old records: the 2026-08-12 conclusion
that missing `present_<soul>` was "an ink gap" (it is host-side, at
`play.ts` `applyPresence`), and `phaser/GAPS.md` G15's "just regenerate
v01" (the ink was never meant to write presence). Do not re-derive either.
