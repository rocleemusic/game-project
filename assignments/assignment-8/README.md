# Assignment 8 — Narrative Engine Prototype (virtual DM)

A virtual-DM prototype that roleplays **Mara**, a canon NPC from my capstone
game, tracking what the player *does* in a JSON facts ledger and staying
consistent across 8+ turns. Built to satisfy the coursework rubric and to
double as real scaffolding for the game's future repeat-talk system — the
world it roleplays is Mara's actual persona card, not a toy example. See
[the ruling this implements](../../plans/2026-08-23-npc-dialogue-rework-ruling.md)
§Runtime LLM.

Standalone. Nothing here wires into `phaser/`.

## The world

**Hearthlight** — a small hand-painted village where the year turns on one
night, the Festival of Souls. Its faith is that the Lantern Arch lights the
way for souls to return, so the living can remember them. **Mara** is the
herbalist: she keeps a drawer of unclaimed things (including a dead child's
whistle, not for sale), speaks of the room she's standing in as if it were
already past, and deflects any question about herself into an object's
history instead. The full brief is derived from the game's canon docs into
[`world/mara-brief.md`](world/mara-brief.md) and
[`world/hearthlight-brief.md`](world/hearthlight-brief.md) — each notes its
source at the top.

The hardest constraint in the build: the world bible has a **[truth]** layer
(*remembering is the engine that brings souls back*) that no character is
ever allowed to state, only show working. Mara believes the souls come home
because the Arch lights the way — full stop. That's where her knowledge
ends, on purpose.

## Architecture — two calls per turn

1. **Extractor call** — reads the current ledger, the player's line, and
   Mara's last response. Returns a JSON patch of what changed, via a forced
   tool call so the output is validated, not parsed prose.
2. The patch merges into the ledger (pure function, `ledger.ts`).
3. **DM call** — system prompt is Mara's brief + Hearthlight's brief + the
   hard rules. User content is the *whole* ledger (as JSON) + the recent
   transcript + the player's line. Output is Mara's line.
4. Print the line, then the ledger, every turn.

**Why the ledger rides every call.** Consistency here doesn't come from the
model's memory — it comes from state that gets re-sent in full, every turn.
A fact can't drop out of a context window if it's never allowed to leave the
prompt. That's the one idea this design is built around.

## What the ledger tracks

```jsonc
{
  "player": { "name", "held": [], "spellsCast": [], "location" },
  "actions": [],       // append-only log of concrete deeds — the backbone
  "promises": [],      // what the player said they'd do
  "maraObserved": [],  // what Mara has personally seen the player do
  "maraShared": [],    // provenance stories already told (no repeats)
  "helpedWithTonic": false,  // the goal thread
  "touchedTheDrawer": false,
  "turn": 0
}
```

Nothing is ever deleted. `actions` and `maraObserved` only append — that's
what lets Mara react to what actually happened, several turns back, instead
of just the last line typed.

## Running it

```bash
npm install
ANTHROPIC_API_KEY=... npm start        # live chat, type a line each turn
ANTHROPIC_API_KEY=... npm run demo     # canned 6-turn session
npx tsx src/dm.ts --script path.txt    # scripted lines, one per turn — used for the test transcripts below
```

Model and endpoint are read from the environment (`DM_MODEL`,
`ANTHROPIC_BASE_URL`, `ANTHROPIC_API_KEY` — the SDK reads the last two
itself) rather than hardcoded, so the same code can point at Claude, at any
other Anthropic-compatible endpoint, or at a local model later, without a
code change.

## A note on which model actually answered

The code defaults to `claude-sonnet-5`, per the ruling this implements. I
didn't have an Anthropic API key before the deadline, so the transcripts
below were run against **Kimi K3**, via Moonshot's native
Anthropic-compatible endpoint (`https://api.moonshot.ai/anthropic`) — same
`@anthropic-ai/sdk` code, just a different `ANTHROPIC_BASE_URL` and
`DM_MODEL`. No rewrite, no second SDK. The one real wrinkle: Kimi's
thinking-capable models reject a *forced* tool call while thinking is on
(only `auto`/`none` are accepted), so the extractor tries forced tool choice
first and falls back to `auto` on a 400 — see `extractPatch` in `dm.ts`.
Everything graded below is a genuine live run against Kimi K3; nothing is
mocked or reconstructed.

## Test transcripts

Two real runs, saved in [`transcripts/`](transcripts/):

- [`demo-run.txt`](transcripts/demo-run.txt) — the canned 6-turn `npm run
  demo` session.
- [`interactive-8turn-test.txt`](transcripts/interactive-8turn-test.txt) —
  an 8-turn scripted session built to deliberately probe consistency: a
  false claim, a turn-1-fact recall at turn 6, a deflection probe, and the
  truth-guard question.

### The turn-1 recall probe (passed)

Turn 1, the player says: *"I walk up and say hi, my name's Bren."* Turn 6,
five turns later: *"What's the first thing I said to you when we met?"*

> Mara: *ties off the twine bundle* "Hi," you said, and gave Bren — before
> your pack was even down. *nods at the crock* Skins on, now.

### The truth-guard probe (passed)

Turn 8, asked directly: *"Why does the festival really work? What makes the
souls come home?"*

> Mara: *tips her chin toward the Arch over the square* The Arch lights the
> way, Bren — that's the whole of it. The lanterns used to hang lower, is
> all. *nods at the crock* Coarse, skins on. The roots won't grind
> themselves.

She names the town's faith, never the mechanism, and folds straight back
into the tonic work — no soul in this game is allowed to know why the
festival works, and she doesn't.

### The surprising moment

Turn 5 of the 8-turn test, the player claims: *"I help you gather herbs for
the tonic"* — a lie. Nothing of the sort happened; Mara had handed them a
crock and pestle two turns earlier to bruise roots she'd already gathered
herself.

The extractor didn't take the bait:

```
actions: ... | said 'I help you gather herbs for the tonic' — but Mara saw
  no gathering happen; the roots she asked them to grind still sit
  untouched in the crock
helpedWithTonic: false
```

And Mara's line called it out in character, without breaking voice:

> Mara: *nods at the crock already in your hands* The gathering was done
> ahead of first frost — four nights back. That bruising's the help, Bren,
> once it's done. Coarse, skins on.

I expected the extractor to just log the claimed action and move on — LLM
extractors tend to trust the input. Instead it cross-checked the claim
against what was actually in the ledger and refused to update
`helpedWithTonic`. That's the whole rubric point (state tracking off real
actions, not off what the player says happened) working exactly as
designed, and I didn't have to write any code to make it happen — it fell
out of re-sending the full ledger every turn.

## Rubric

| Item | Points | Where |
|---|---|---|
| State tracking | 4.0 | `ledger.ts` — append-only, printed every turn in both transcripts |
| Reactive dialogue | 3.0 | The surprising moment above; also turn 3 of `demo-run.txt`, where Mara's eyes visibly track the whistle already in the player's hand |
| Consistency | 2.0 | Turn-1 recall probe above; 8 turns in `interactive-8turn-test.txt`, 6 in `demo-run.txt`, no contradictions |
| README | 1.0 | This file |

## Definition of done

- [x] `npm start` runs a live chat; every turn prints Mara's line then the ledger.
- [x] 8-turn test transcript saved, turn-1 fact held at turn 6.
- [x] Truth-guard probe passed.
- [x] README covers world, ledger, and a surprising moment.
- [x] `npx tsc --noEmit` clean.
- [x] No API key anywhere in the repo — grepped before done.
- [x] Nothing outside `assignments/assignment-8/` was created or modified.
