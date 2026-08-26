---
name: lantern-player
type: code-system
status: live
record: tools/lantern/src/lib/play.ts
---

## What it is
The host layer: `LanternPlayer` loads `story.json` through inkjs, binds all four
`EXTERNAL`s, and owns the satchel, arms-carry, pack-triage, day loop, move budget and
NPC presence — under vitest. It exists as one class because the resolver deliberately
declares host-written state (`tools/resolver/src/graph.ts:195` marks `present_<soul>`
as `DAY_START_WRITER`); the emitted ink only reads it.

## Doors
- `tools/lantern/src/lib/play.ts` — the class itself (`applyPresence` at ~line 358)
- `tools/lantern/README.md` — the review tool around it, and the live-reload invariant
- `CONTEXT.md` §The Unreal side — why the missing host layer sank the Unreal track

## Hits
Phaser imports this class via a Vite alias, so a change here changes the shipping
game. The Unreal port's first job is porting this layer, not more engine work
(`CONTEXT.md`: "The port's first job is that layer"). One-writer rule: it refused to
let `recordKnowledge` write `KnownPhrases` because "a second writer would give one
fact two owners" (`phaser/README.md` §Unlock state) — adding a writer here breaks
that precedent. The presence contract is two-sided: resolver declares
`present_<soul>` as `DAY_START_WRITER` (`tools/resolver/src/graph.ts` ~line 199)
and `applyPresence` (`play.ts:437`) fulfills it — changing either side without
the other breaks silently.

## Does not hit
The ink graph. `present_<soul>` looking unwritten in the ink is not an ink gap — the
2026-08-12 Unreal summary concluded that and was corrected (`CONTEXT.md` §The Unreal
side, "two records this corrects"). Do not reopen resolver-side vs engine-side; the
answer is host-side, here.
