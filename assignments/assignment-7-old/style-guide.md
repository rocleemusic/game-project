# The Style Guide

The rules every line of player-facing text in this game obeys, and what happens when a line breaks one.

This is not a mood board. Every number below was measured, and every rule below was written down because a real line broke it first. The date and the ruling are named wherever that happened.

**The game.** A cozy roguelite point-and-click adventure set in a hand-painted village. The player arrives with no memory of the people there, works out who they are from how they behave, and loses those bonds at the end of each life. The souls stay. The player's knowledge of them does not.

**Sources.** These rules are extracted from the project's own production documents, not written for this assignment. `narrative-pipeline/register.md` holds the register and the corpus numbers. `narrative-pipeline/guardrails.md` holds the twelve locked checks. `narrative-pipeline/npc-codex.md` holds the canon. `cast/*.md` holds one card per soul.

**Scope.** Player-facing text only. Dialogue, player choice lines, action beats and object descriptions. How the design documents themselves are written is a separate contract.

---

## Constraint 1 — Length

Lines are short because the source material is short, and the source material was counted.

| Slot type | Ceiling |
|---|---|
| `dialogue` | 40 words |
| `action` | 60 words |
| `object` | 60 words |
| `player_line` | 12 words |
| A sanctioned long run | 75 words, at most one per scene |

**The ceiling is a cap, not a target.** The measured corpus is 4,735 human-transcribed turns across Frieren, Violet Evergarden and two Ghibli films.

| | Value |
|---|---|
| Median turn | 5 to 7 English words |
| Most turns | under 15 words |
| A "long run" begins at | about 26 words |
| Runs over 40 words | about 6 per episode, 3.4% of turns |
| Longest attested genuine turn | 174 words |

So a 38-word dialogue line passes the ceiling and still fails the register. Most lines should run far under.

**Counting convention** (ruled 2026-08-11). The `[action]` render marker does not count. Square brackets do not count, the words inside them do. A contraction is one word.

**One exception, and it is deliberate.** Walk-on characters run 15 to 30 words. A walk-on has no card, no essence and no arc. It exists to carry the business of one scene, so it falls through to the world dialect, which is the tightest register in the game. That is how a cheerful villager ends up sounding like the guarded protagonist. Found 2026-08-06 on a line that read *"Loaf on my step Tuesday morning. I never ordered it."* where it should have read *"I found a loaf on my step Tuesday morning. Was such a pleasant surprise!"*

Toby's terseness only reads as terseness when the people around him are not terse. A village where everyone is clipped has no protagonist. It has a house style.

---

## Constraint 2 — Formatting

Small rules, and every one of them has drifted at least once.

- **No em-dashes.** The tell-purge bans them. Use a full stop.
- **A `dialogue` or `player_line` slot's text sits in quotation marks.** A non-dialogue slot does not, and carries its `[action]` prefix instead. One file of four broke this at the 2026-08-07 gate.
- **`[action]` appears once**, never stacked with a second bracketed label.
- **A word count never goes inside the text cell.** A parenthetical inside `text` ships with the content.

None of these is a judgment call. All of them are cheap to fix and easy to miss, which is exactly why a machine checks them and a human does not.

---

## Constraint 3 — Tone and voice

Two layers. The village shares a dialect. Each soul has a signature inside it.

### The world dialect

- **One thought per turn.** A turn may run two clauses when the second is the payload.
- **Deflect, do not name.** Grief, love and awe arrive as logistics, a joke, or mild curiosity. A line may confirm a fact plainly. It never confirms a feeling.
- **Say the plain word.** No trade knowledge the scene has not shown. Withhold significance, never orientation. The player always knows why they are here, just not yet what it weighs.
- **No soul states its own trait.** Character shows as repeated behavior and third-party notice.
- **Flat is not cold.** A clipped, dismissive or sarcastic line is a defect even at five words.
- **Weight is preloaded, not performed.** A payoff that was planted properly needs almost nothing. Amplification destroys it.

**The offer stands alone** (ruled 2026-08-07 at the line gate). An anticipation names the thing and stops. Do not append the reason.

| Written | Kept |
|---|---|
| "Come on by before noon if you can make it! Your name reads better on the cart list in your own hand." | **"Come on by before noon if you can make it!"** |
| "They do. The cellar's cool and the seals hold." | **"They do."** |
| "Take two. You'll be out past the drum band and there's nothing open after." | **"Take two. You'll be out past the drum band."** |

The second clause is the writer explaining, not the soul speaking. **The test:** cut the clause after the full stop. If the line still lands, it was explanation.

### The soul signatures

This is the rule the whole pipeline exists to protect. Each soul has a declared channel for how warmth arrives. A line where warmth arrives by a different soul's channel is a defect, and it is invisible to every mechanical check.

| Soul | Warmth arrives as | Deflects into | Precision runs |
|---|---|---|---|
| **Toby** | **Anticipation.** He works out what you will need and it is there when you reach for it. He never says he did it, because saying so would make it a thing you owe him. | The unfinished task in the room | Exact about what others need. Ask what he needs and he has not worked it out. |
| **Mara** | **Restoration.** Your torn strap comes back stitched before you knew she had it. She never supplies a new thing. She keeps what you already have whole. | The object at hand and its history | Exact about things, vague about people. She can date a hinge and price a repair. Ask who the corner is set for and the sentences stop arriving. |
| **Ilsa** | **Inclusion.** She assumes you into the group rather than welcoming you into it. The plate is already down before anyone said you were coming, and nobody is told it was set for them. | Placement. A chair pulled out, a spot cleared. | Exact across long spans, loose across recent ones. Three generations are sharp and three days ago blur. |

**Why the three must not collapse.** All three souls are warm. All three deflect. A generated line can obey every rule above, sit inside the ceiling, contain no em-dash, and still be wrong because Mara offered somebody a thing before they asked. That is Toby's channel. The line reads well and the character is gone.

This is measured, not feared. On 2026-08-08 a Mara test run came back sounding like Toby after borrowing his discourse marker "Let's see." On 2026-08-10 a batch produced an interchangeable pair of lines that no mechanical check could separate.

**Take the move, not the words.** Toby's markers are *yup, look at that, plus, let's see, anyways*. They belong to a fast, outward-pointing man who answers before you finish. Lifting them is how a scene starts sounding like him.

---

## Constraint 4 — Lore and invention

The game has a canon register, `npc-codex.md`. It lists every soul, walk-on, offstage person, world fact and promoted prop, with the locked facts each carries.

### Contradiction

A line contradicting a ratified fact is a defect no rewrite of style can fix.

Some locked facts:

- **Adren** is the sister that Bex and Mara both buried. She was carded as Bex's brother and as Mara's separate unnamed sister until 2026-08-09, when Roc ruled they are one person. The whole seam of the arc runs off this. Same death, two responses. Neither sibling knows the other's response is the same grief.
- **`prop:adrens-doll`** is a cloth doll with a re-stitched arm, kept in Mara's drawer. It is Adren's. It is the one object Mara gives a full provenance run to, and the only time she says the name of the person the drawer is for.
- **`prop:tobys-shirt`** carries Toby's name stitched inside the collar. He scorches the sleeve and puts it in the rag pile rather than ask anyone to mend it. Mara takes it in, reads the name, and mends it with a visible patch. Her mends make a thing last. They do not erase what happened to it.
- **`world:the-flood-year`** is a date, not a disaster. Nothing stages it, mourns it, or names who was lost in it. A line treating it as trauma has taken a fact about how a thing survived and made it about people.

### Invention

Writers may invent physical props to fill a scene. A scene needs a jar, a crate, a cloth over the trays, and putting one there is part of writing the slot. But **every invention must be declared**, and the declaration is checked against the codex.

Four ways a declaration fails:

| Flag | What it catches |
|---|---|
| **Undeclared** | An invented prop, person or world fact reaches the prose with no declaration. Texture that leaks in undeclared is how lore accumulates by accident instead of on purpose. |
| **Duplicate** | An existing codex entry could have carried it. Reuse was available and was not taken. |
| **Contradiction** | The declaration, or the prose behind it, fights a locked fact. |
| **Mistyped** | Declared as a `prop` but the real content is world geography or an offstage person. A prop must be examinable from where the scene happens. The blue door past the well is Architect work, not scene furniture. |

**Quantities are never flagged.** "Eleven jars" binds nothing. A later scene counting differently contradicts nothing. Only the existence-level fact, a shelf of preserve jars, is canon-bearing.

**The third outcome.** A declared invention that is new, duplicates nothing, contradicts nothing and is typed correctly is **not a defect. It is PROPOSE.** It routes to the human gate as a candidate for canon. Calling it a flag would bury wanted texture in the defect queue.

This is not theoretical. Six props from a single batch were ratified into standing canon on 2026-08-09: `counter-cup`, `window-stool`, `cloth-hook`, `water-jug`, `seed-roll-butter`, `sourdough-starter`. The village got furniture because a writer invented it and the system proposed it rather than rejecting it.

`prop:water-jug` carries a live note in the codex: a committed line already says "the jug behind you is fresh from the well," so it is marked a **reuse candidate**. That is the duplicate check with its work half done.

---

## Constraint 5 — Declaration integrity

A declared prop must actually get built, on the right screen, setting the right knowledge flag. Four ways it fails: never built, wrong screen, built with no flag, or built setting a different flag.

This exists because `ex-shelf` was declared load-bearing in `toby-the-shelf.md`, and never built. It survived a design pass, a review, two line-writing passes and three QA walks. A proposal that nothing verifies is indistinguishable from a thing that exists.

Enforced by shipped code, `tools/resolver/src/examinables.ts`, run as `check-examinables`.

---

## What enforces what

The layers are not interchangeable. Each rule sits at the cheapest layer that can actually settle it.

| Constraint | Deterministic code | Model judgment | Human gate |
|---|---|---|---|
| Length ceilings | ✅ | | |
| Formatting conventions | ✅ | | |
| Counting convention | ✅ | | |
| Declaration integrity | ✅ | | |
| Invention declared at all | ✅ | | |
| Duplicate against codex | | ✅ | |
| Mistyped invention | | ✅ | |
| Lore contradiction | | ✅ | |
| Warmth on the soul's own channel | | ✅ | |
| Deflect, do not name | | ✅ | |
| Whether the line is any good | | | ✅ |
| Whether the reshuffle landed | | | ✅ |
| Ratifying a PROPOSE into canon | | | ✅ |

**The bottom rows are not a gap.** They are a written refusal. This pipeline does not rate whether a line lands, because judging resonance is measuring it, and this game does not put numbers on feeling anywhere. The evaluator measures distance from the rules above. It never grades the writing.

---

## Sources

| Rule set | File |
|---|---|
| Register, corpus numbers, the offer-stands-alone rule, the walk-on band | `narrative-pipeline/register.md` |
| The twelve locked checks, invention register, declaration integrity | `narrative-pipeline/guardrails.md` |
| Locked facts, promoted props, world facts, offstage people | `narrative-pipeline/npc-codex.md` |
| Per-soul warmth channel, deflection target, precision profile | `cast/toby.md`, `cast/mara.md`, `cast/ilsa.md` |
| What only a human may call | `narrative-pipeline/review.md` |
| The counting convention | `narrative-pipeline/templates/line-file-schema.md` |
