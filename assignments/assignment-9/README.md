# Assignment 09 — Adversarial QA Agent

**An agent that plays the capstone game badly on purpose, then tells you exactly where it broke.**

The game is a cozy point-and-click adventure built on ink, shipping from a Phaser 4 build (`phaser/`, mode 5). Every other test tool in the project plays the game *correctly* — a headless walker takes the week end to end, a cast sweep drives all 89 authored spell pairs, 33 scripted scenarios each replay one known-good flow, 743 unit tests cover the pure logic. None of them sends bad input. This agent does nothing else.

## What's in this folder

| Path | What it is |
|---|---|
| `agent/qa-adversary.md` | The agent seat contract — how findings get triaged into real, known, by-design, or self-inflicted |
| `report/findings.json` | The structured report from one real 250-step run, seed `20260824` |
| `report/findings.csv` | The same report, flattened for a spreadsheet |

The live tool is `phaser/tools/adversary/` — not copied here, so this folder never drifts from what actually runs. Its own README explains the six attack strategies and the invariant registry in full. This document answers the two questions the assignment asks.

## How it works, in three sentences

The agent boots the real game in headless Chromium and drives it through Playwright, the same way the project's other playtest tools do. It reaches past the game's own debug handle into the live scene objects — read-only except for three real player actions (choose, advance, pickup) — so it can see satchel capacity, gate state, and receiver state that no other tool exposes. Every step it takes one of two things: honest play (about 45% of steps, so it actually reaches day 3–4 and doesn't just sit on screen one) or a deliberate attack from one of six probes, and after *every* step — whichever kind — it checks a fixed list of invariants that must hold no matter what just happened.

## What it found

One 250-step run (seed `20260824`, mode 5, `phaser/tools/adversary/report/findings.json`) turned up **36 raw findings**, which triage down to:

### Real bugs (blocking)

**Save and restore silently returns a different world.** Save, reload the whole tab, load — and the player is back on a different screen, on a different day segment, with an empty satchel and a cleared gate that isn't cleared anymore. "Save and restore (close, reopen, resume)" is item one of the project's own amended Definition of Done. `SaveCoordinator.ts`.

**Key-mashing can lose the entire scene stack.** Twice, a burst of ordinary keys — the same keys the HUD binds for satchel, notebook, calendar, options, and the Home Hub — left either zero live Phaser scenes or the Hub stuck open with no way back to play, and neither the console nor the page threw an exception. It fails silently. `CollectScene.ts`, `HubScene.ts`.

**One held component paid for two casts.** Casting a spell twice in a row consumed the ingredient on the first cast and let the second cast land anyway, spending nothing. `Inventory.ts`.

**A bond-gated screen was walkable without its bond ever clearing.** The player reached `T5` — gated on `G-T5-trust`, a bond requirement — with the run's own tracking showing that gate was never satisfied this life. Root cause traces to a real architecture gap the code already names: two separate places track "which gates are cleared" — the legacy graph parse (`Gates.ts`, written by `CastPipeline.run`) and the authored `GateEngine` (what actually gates the traversal pills) — and `CastPipeline.ts`'s own comment says the second one is owed and not yet wired: *"it belongs to the GateEngine in Wave 2 Track B."* That drift showed up **110 times** across the run.

### Real, but not a player bug yet (material, `model-only`)

Nine different findings — casting a spell never learned, casting with zero components, casting on a receiver not on the current screen, picking up a slot the graph never offered, picking up an item a slot never offered — all landed cleanly when reached by calling the game's own resolver directly. None of them are reachable through the shipped UI today; the UI is the only thing enforcing them, not the model underneath it. Worth knowing before a second input path (keyboard traversal, a controller, an accessibility mode) gets added, because it would inherit every one of these for free.

### Design questions, not bugs (note)

A gate that opened, then closed again with the player still standing past it — nothing walks them out, nothing tells them the way back is now shut. Not wrong, just unruled: is that intentional?

## Was I surprised?

Two things, yes.

**The save/restore bug, because of what it says about the entry flow, not the save code.** The save layer itself is careful — its own header states outright that a defect must be reported, never coerced, and every corrupted-save attack this run threw at it (truncated JSON, a version bump, a save claiming another mode wrote it, invented item and gate ids) was correctly refused. The actual gap is upstream: reopening the game always routes back through the day's location picker, which starts a fresh day choice in ink *before* the save ever gets a chance to restore over it. The individual pieces are each doing their job; the sequence between them is what's missing.

**The gate-tracking split, because the codebase already knows about it.** I didn't find a hidden bug — I found a comment in `CastPipeline.ts` admitting the exact gap the agent then walked straight through, 110 times in one run. That's the most useful kind of adversarial finding: not a mystery, a confirmation that an acknowledged architectural debt is live and player-reachable right now, not theoretical.

Less surprising, but worth stating: the `model-only` findings (unlearned spells casting, absent-receiver casts) are exactly what you'd expect from a UI-first casting system where the model trusts its caller. They're not shipping bugs. They're a map of where the *next* input path would need its own guardrails.

## Coverage — what this run did and didn't reach

Every probe fired at least 11 times; `explore` (honest play) fired 115 times and visited 14 of the game's screens. Two invariant categories never got exercised this run — a full soak-cycle count of the notebook and satchel panels, and the "does the pill itself stay inert when locked" click test — both listed in the report's own `coverage.notReached`, not silently passed.
