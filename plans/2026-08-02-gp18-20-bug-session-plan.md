# Session plan — GP-18, GP-19, GP-20 (the three sanctioned blockers)

**Written 2026-08-02.** For a session that has not seen this conversation.
This is a design record, not a status tracker — task state lives in Paca,
project `game-project`, prefix `GP`.

---

## Read this before you touch anything

**Two of the three bugs are already fixed.** The task descriptions in Paca were
written from the pre-merge state on 2026-08-01 and were never reconciled against
the branch that fixed them. If you work from the task text alone you will spend
your session rewriting code that is already correct.

| Task | State | Evidence |
|---|---|---|
| **GP-18** — `gather_line` renders no text | **REAL — this is the work** | `tools/lantern/src/components/SceneView.tsx:285` renders `<span class="bp-id">` + `<div class="bp-kind">gather</div>` and nothing else |
| **GP-19** — `divert_to` emits the scene address | **Already fixed** | commit `972283c6`, 2026-08-01 |
| **GP-20** — gated set-up line prints ungated | **Already fixed** | commit `088cbb88`, 2026-08-01 |

Both fixes are on `main` as of merge commit `9b97ce6e`.

### Verify the two claimed fixes yourself — do not take this document's word

Verify against disk, never against a banner. That rule exists because a status
banner in this project was materially wrong and cost a session.

```bash
cd ProjectOS/game-project/lantern-projects/v01/ink
grep -n "ch_t4_02_3" souls/ilsa.ink        # GP-20
grep -n "ch_t4_02_6" souls/ilsa.ink        # GP-19
```

**GP-20 passes** when the set-up line is wrapped in its own guard:

```ink
- (ch_t4_02_3) { KnownPhrases ? second_set: Placeholder set-up: with the second
  set named, she talks about who it was cut for. #choice:CH-T4-02-3 }
```

The failure it fixes: only the *options* carried the guard, so a player who never
named the second set still read a line that presumes they did.

**GP-19 passes** when the divert names the node, not the scene:

```ink
-> ilsa.sc_t4_02.ch_t4_02_6     # correct — the node
-> ilsa.sc_t4_02                # the bug — top of scene, a replay loop
```

Reachability cannot catch that regression, because a loop reaches everything.
It is the only `divert` in the build, which is why it went unnoticed for so long.

If both pass, **close GP-19 and GP-20 with a comment naming commit `9b97ce6e` as
what superseded them.** Never delete a task.

---

## The actual work: GP-18

### What is wrong

`SceneView.tsx:285` — the gather card shows an id and the word "gather". The ink
underneath already carries real text:

```ink
- (g_ch_t4_02_3) Placeholder: the scene continues. #id:GB-CH-T4-02-3-GATHER
```

`gather_line` is a content slot whose text stands at a node's gather. It exists
because gather text used to be a hardcoded `"Placeholder: the scene continues"`
and a branch's closing beat had nowhere to live. The field is declared in both
`tools/resolver/src/types.ts:184` and `tools/lantern/src/types.ts:93`.

### Why it blocks the prose pass, and only then

**Harmless today** — every `gather_line` in the build is placeholder text.

**It stops being harmless the moment the prose pass authors real beats into those
slots**, because Roc would be approving scenes containing prose the review tool
never shows him. The approval surface would be lying by omission. That is the
whole reason this is one of exactly three sanctioned `track:B-tool` →
`track:A-story` blocking links; it gates **GP-28, prose pass batch 1**.

### The fix

Render the line's text on the gather card the way a line card already does.
Small — but read the constraint before you start.

### The constraint that shaped the bug

Roc ruled **"correct edges only, no new visual language"** for the nesting canvas
work. This is a *card* change, not an edge change, which is why it was left
undone rather than slipped in. Match the existing line card's presentation; do
not invent a new treatment for gathers.

Related and worth reading first: the blueprint card head rule from GP-11. A head
is solid-filled **only** in pending status — the fill *is* the "needs review"
signal, and it drops to the quiet wash the moment a card is approved, edited or
flagged. Whatever you render must not fight that.

---

## Verification gate

Run all of it, in both packages. Passing means matching these numbers, not
"tests ran".

```bash
cd ProjectOS/game-project/tools/lantern
npx tsc --noEmit          # must be clean
npx vitest run            # 606/606 across 40 files, plus whatever you add

cd ../resolver
npx tsc --noEmit          # must be clean
npm test                  # 128/147 — see below
```

**The resolver's 19 failures are the documented pre-existing baseline.** They are
not yours and they are not new. Confirm the count is still exactly 19; a 20th is
a regression you caused.

**Use `npm test` in the resolver, never `npx vitest run`.** The resolver suite is
`node --test`. Vitest collects 0 tests there and prints what looks like a wall of
failures.

Then prove the run folder still builds:

```bash
cd ProjectOS/game-project/tools/resolver
node src/cli.ts build --data data --out ../../lantern-projects/v02 --emit-story
node src/cli.ts resolve-week --data data --out ../../lantern-projects/v02
```

Copy `manifest.json` and `images/` from `v01` into `v02` — they are authored, not
generated, and the build does not produce them.

### Then look at it

Load the run folder in Lantern and read a gather card with your eyes.

```bash
cd ProjectOS/game-project/tools/lantern && npm run dev
# then load the absolute path to lantern-projects/v02
```

This step is not optional. GP-11 was verified by computed-style inspection
instead of looking at it, and that gap is written into the task as the reason it
needed a human pass. A test that asserts the text is in the DOM does not tell you
the card is readable.

**Kill the dev server when you are done.** `npm run dev` orphans its vite child
when the terminal closes; eleven of them accumulated over four days before
anyone noticed.

---

## Boundaries

- **Do not resolve a fourth B→A blocking link.** Exactly three are sanctioned.
  A fourth is a parallelism breach: flag it for Roc, never fix it quietly.
- **Do not touch the story content.** This is Track B. The prose pass is Track A
  and it is not gated on you beyond GP-18.
- **Do not edit emitted ink by hand.** It gets clobbered on the next build. Text
  changes go through the review tool's `edits.json` flow.
- Status goes to Paca. This file holds reasoning only.

---

## First move

1. Run the two `grep` commands above and confirm GP-19 and GP-20 are fixed.
2. Close them in Paca, citing `9b97ce6e`.
3. Open `SceneView.tsx:285` and fix the gather card.
4. Run the full gate, then look at it in the browser.
