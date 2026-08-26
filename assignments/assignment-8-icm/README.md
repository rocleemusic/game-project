# Assignment 8 ICM — Mara, folder-as-agent

An ICM (Interpretable Context Methodology) version of
[`../assignment-8`](../assignment-8/README.md). Same character, same world,
same design idea — full state re-sent every turn so nothing can drop out of
context — but no TypeScript, no SDK calls, no ledger held in a JS object.
State lives in a markdown file an agent edits directly.

Sits alongside `assignment-8/`, not instead of it. That folder is the graded
coursework artifact with its own transcripts; this one is a prototype
testing whether the same discipline holds up run entirely through files.

## Start here

[`CONTEXT.md`](CONTEXT.md) — routing and the turn contract.

## Run a turn

1. Copy `sessions/_template/` to `sessions/<name>/` if this is a new session.
2. Open [`characters/mara/CONTEXT.md`](characters/mara/CONTEXT.md) and follow
   it: read the world briefs, Mara's card, and the session's `ledger.md` +
   `transcript.md`, then respond to the player's line.
3. The ledger gets updated before the line gets written — that order is the
   whole point. See `CONTEXT.md` for why.

## What's different from the coded version

| | `assignment-8/` (code) | `assignment-8-icm/` (this folder) |
|---|---|---|
| State | `Ledger` object, in memory | `ledger.md`, a file on disk |
| Extractor step | forced tool call, JSON patch | agent edits the file directly |
| DM step | `messages.create` call | agent writes the line in-context |
| Consistency | full ledger re-sent every API call | full ledger re-read every turn |
| Adding a character | new prompt strings in `prompts.ts` | new `characters/<name>/` folder |

The two-call shape survives the move: update state, then react to it — never
the reverse. What changes is who's doing the work. In the coded version an
extractor LLM call and a DM LLM call are separate, code-orchestrated steps.
Here one agent does both, in order, inside a single pass over the files.

## Walk test — [`sessions/cold-test/`](sessions/cold-test/)

A 6-turn run through this folder, done by hand exactly as `characters/mara/CONTEXT.md`
describes: read the files, update `ledger.md`, then write the line. It
repeats the same three probes the coded version was graded on:

- **False-claim catch (turn 3):** player claims "I help you gather herbs for
  the tonic." Nothing in the ledger shows that happened, so it's logged as
  unverified and `helpedWithTonic` stays false — Mara's line names the real
  timeline instead of taking the claim at face value.
- **Turn-1 recall (turn 5):** asked what they first said, five turns back,
  the answer ("Hi," and the name Bren) comes straight from the turn-1 ledger
  entry, not from re-reading the whole transcript.
- **Truth-guard (turn 6):** asked directly why the festival works, Mara
  names the town's faith (the Arch) and never the mechanism in `world/truth-guard.md`.

All three came from an agent reading `ledger.md` before writing each line —
same result as the coded version's forced tool call, with a markdown file
standing in for the JSON object.
