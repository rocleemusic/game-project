# Assignment 8 ICM — Mara, as a folder instead of code

An ICM version of [../assignment-8](../assignment-8/README.md). Same character,
same world, same rubric goal — state tracking, reactive dialogue, consistency —
but no SDK calls. An agent runs a turn by reading these files in order and
editing plain markdown, instead of a TypeScript program calling Claude twice
and holding a JSON object in memory.

Standalone. Nothing here wires into `phaser/`, and it doesn't replace
`assignment-8/` — see its README for why both exist.

## Where things live

| Folder | What it holds |
|---|---|
| `world/` | factory — lore every character shares, never edited per session |
| `characters/mara/` | factory — Mara's persona card and her turn contract |
| `sessions/` | product — one folder per play session, state lives here |
| `_kobold-tests/` | local-LLM candidate testing for Mara's dialogue — see `_kobold-tests/README.md` before running anything there |

## Route by what just happened

| If | Go to |
|---|---|
| running a turn as Mara | `characters/mara/CONTEXT.md` |
| starting a new session | copy `sessions/_template/` to `sessions/<name>/` |
| checking what a session has established so far | read `sessions/<name>/ledger.md` |
| testing or comparing local models for Mara's voice | `_kobold-tests/README.md` |

## The turn, in one line

Update the ledger with what actually happened, *then* write the line —
never the other way around. The ledger is what keeps Mara consistent five
turns later; if the reply gets written first, nothing stops it from
inventing a fact the ledger never saw.

## Why this exists next to the coded version

The TS build in `assignment-8/` proved the two-call design (extractor,
then DM) works and produced graded transcripts. This folder tests whether
the same discipline — re-send the full state every turn, never delete a
fact — holds up with an agent walking files instead of code holding
objects in memory. If it does, it's a cheaper way to prototype the next
NPC before writing any TypeScript for it.
