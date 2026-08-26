# Plan — Assignment #8: Narrative Engine Prototype (virtual DM)

**Written 2026-08-23. Approved shape (Roc, same day). Builder: a Sonnet session.
Due Tue 2026-08-25, 11:59 PM ET. Standalone — does not touch the Phaser build.**

## What this is

Coursework Assignment #8: a virtual-DM agent that roleplays a game world,
tracks what the player *does* in a JSON facts ledger, and stays consistent
across 5+ turns. Ruled by Roc ([T15 ruling](2026-08-23-npc-dialogue-rework-ruling.md)
§Runtime LLM): built in **TypeScript + Claude API** (not the assignment's
Python framing), roleplaying **Mara's card** as the world, so it doubles as
scaffolding for the game's future repeat-talk system. It ships standalone;
nothing here wires into `phaser/`.

## Read first (in this order)

1. `ProjectOS/game-project/CONTEXT.md`
2. `ProjectOS/game-project/gdd/00-world-bible.md` — in FULL. Note the two
   layers: **[lore]** may be spoken; **[truth]** is never stated by any
   character, ever. This is the hardest constraint in the build.
3. `ProjectOS/game-project/cast/mara.md` — the persona card. Her
   `voice_register` (past-tense slip, provenance deflection, small-imperative
   welcome, 12–25 word median) is the spec for how the DM speaks as her.
4. `ProjectOS/game-project/plans/2026-08-23-npc-dialogue-rework-ruling.md`
   §Runtime LLM — the ruling this implements.
5. The `claude-api` skill — load it before writing any API code.

## Deliverables (rubric: 10 points)

| Rubric item | Points | What satisfies it |
|---|---|---|
| State tracking | 4.0 | JSON facts ledger, updated from player ACTIONS, printed to output every turn |
| Reactive dialogue | 3.0 | Responses change on ledger state, not just the last input |
| Consistency | 2.0 | 5+ turns, no contradictions or forgotten facts |
| README | 1.0 | World description · what the ledger tracks · one surprising test moment |

## Where it lives

`ProjectOS/game-project/assignments/assignment-8/` — self-contained like
assignments 5–7 (own README, own runnable pipeline, derives copies from game
docs, feeds nothing back into the build). Look at `assignment-7/`'s layout
before creating files and match its conventions.

```
assignment-8/
  README.md            rubric item — write it LAST, from real test transcripts
  package.json         type: module; scripts: start, demo
  tsconfig.json
  src/
    dm.ts              main loop: readline chat, orchestrates the two calls
    ledger.ts          ledger type, update-merge logic, pretty-printer
    prompts.ts         the two system prompts (DM + extractor), built from world/
  world/
    mara-brief.md      DERIVED COPY of the card's essence/axes/voice (see below)
    hearthlight-brief.md  DERIVED COPY of the bible's [lore] layer essentials
  transcripts/         saved test runs (the README's evidence)
```

**Derived copies, not links.** Assignments are self-contained by rule
(`CONTEXT.md`: nothing in `assignments/` is a source of truth). Copy what the
prompt needs into `world/`, note the source file at the top of each copy.

## Architecture — two calls per turn

Model: `claude-sonnet-5` for both calls. Key from `ANTHROPIC_API_KEY` env var
only — never written to any file. Use the official `@anthropic-ai/sdk` npm
package.

**Turn flow:**

1. Player types a line — an action ("I pick up the whistle") or speech.
2. **Extractor call** — input: current ledger + the player's line + the last
   DM response. Output: a JSON patch of ledger updates. Use a forced tool call
   (tool_choice) with a JSON schema so the output is validated JSON, not prose.
   Track ACTIONS, not just words — this is the 4-point rubric item.
3. Merge the patch into the ledger (pure function in `ledger.ts`).
4. **DM call** — system prompt: Mara's brief + Hearthlight brief + the hard
   rules (below). User content: the full ledger (JSON) + the last ~10
   transcript turns + the player's line. Output: Mara's response, plus a short
   scene line where needed.
5. Print the DM response, then the ledger state (labeled, so the rubric's
   "visible in output or logs" is unmistakable). Loop.

**Why the ledger rides every call:** consistency comes from state-in-context,
not from the model's memory. Facts can't drop out of a context window if they
are re-sent every turn. Say this in the README — it is the design's one idea.

## The ledger shape

Keep it flat and legible — it prints every turn:

```jsonc
{
  "player": { "name": "…", "held": [], "spellsCast": [], "location": "mara's stall" },
  "actions": [],            // append-only log of concrete deeds, short strings
  "promises": [],           // what the player said they'd do
  "maraObserved": [],       // what Mara has personally seen the player do
  "maraShared": [],         // provenance/stories Mara has already told (no repeats)
  "helpedWithTonic": false, // the goal thread: herb-gathering before first frost
  "touchedTheDrawer": false,
  "turn": 0
}
```

The extractor may append and flip fields. Nothing is ever deleted — the
append-only `actions` log is the consistency backbone.

## The hard rules (verbatim into the DM system prompt)

1. **Never state a [truth].** Mara does not know that remembering is the
   engine, that souls re-form at tended depth, or why the festival works. She
   believes the souls come home. She may show the faith, never the mechanism.
2. **Voice per the card.** Median 12–25 words. Past tense slipping in where it
   doesn't belong, uninvited and unremarked. Deflects personal questions into
   an object's provenance. Welcomes by small imperative (puts a job in your
   hands). Never says what the loss does to her. Warmth is invariant — the
   past tense is never wistful performance or a chill.
3. **Grief beats near the drawer/whistle:** fragments divided by action slots.
   She never explains, nobody corrects her slips.
4. **Magic is folk craft.** Spells produce physical outcomes only, never
   feelings. Mara's spells this life: `steep`, `preserve` (herbalist role).
5. **React to the ledger, not the last line.** If `maraObserved` says the
   player mended something quietly, she treats them differently than someone
   who only talked — even if their current line is identical.
6. **No repeats:** provenance stories already in `maraShared` are not retold.

## Build order

1. Scaffold the folder, `package.json`, tsconfig. `npm i @anthropic-ai/sdk`.
2. Write the two `world/` briefs (derived copies — card + bible [lore] only).
3. `ledger.ts`: type, merge, printer. Unit-testable pure functions.
4. `prompts.ts`: both system prompts, assembled from the briefs + hard rules.
5. `dm.ts`: readline loop wiring the two calls. `npm start` runs it.
6. **Test: play 8+ real turns.** Deliberately try to break consistency
   (contradict yourself, reference turn-1 facts at turn 8, poke at the drawer,
   ask her why the festival works — she must not explain). Save the transcript
   to `transcripts/`.
7. A `demo` script: replays a canned 6-turn session against the live API and
   prints ledger states — the graded evidence path if the grader won't play.
8. README last, from the real transcripts. Include the surprising-moment item
   honestly — something that actually happened in testing.

## Definition of done

- `npm start` runs a live chat; every turn prints Mara's line then the ledger.
- 8-turn test transcript saved, with at least one on-record consistency probe
  passed (a turn-1 fact correctly held at turn 6+).
- The truth-guard probe passed: asked directly why the festival works, Mara
  deflects in character and explains nothing.
- README covers the three required items.
- `npx tsc --noEmit` clean. No API key anywhere in the repo — grep before done.
- Nothing outside `assignments/assignment-8/` was created or modified.

## Out of scope

The Phaser repeat-talk hookup (post-capstone, T15). Any edit to the bible,
cards, register, or pipeline files. Multi-NPC support. The [truth] layer in
any prompt file — the DM prompt gets the *behavioral* steering (she deflects,
she keeps, she never explains) without the cosmology behind it.
