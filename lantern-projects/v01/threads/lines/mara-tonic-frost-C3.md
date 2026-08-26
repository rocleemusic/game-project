# `mara-tonic-frost` — C3 line slots · `SC-T2-23`

**Conversation:** C3, the week's end. Carries R3 (the finished shelf is the one thing at the stall her hands do not go back to — the R2 fact at the other end of the week, delivered as behavior, no new cast fact). The thread ends completed and inert.
**Structure source:** `../mara-tonic-frost.md` § "C3 — `SC-T2-23`", graphs approved by Roc 2026-08-10, action layer included. Nothing structural altered.
**Soul:** `mara` (`cast/mara.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. Her declared band: 12–25 words ordinary dialogue; the present line goes thin only under weight. **No sanctioned long run** — zero marked runs across this thread.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts sit in their own column, never in the text cell.
**Speaker for all `dialogue` slots:** `mara`. No other speaker appears in C3; no walk-on, no third party names anything.

**Incoming states:** four — nodes 3 and 4 gate on `drift_seen` and `herbs_carried` separately and auto-skip when false; every ungated slot is written placeless enough to serve all four states, so **no per-state variants are minted.** The fallback walk (1 → 2 → 5 → 6) exits through real content.

**Staging vocabulary:** the jars full and corked on the cleared shelf, frost on the boards of Market Row, the drying line coming down, the stall's winter canvas and its unfinished hem, the needle roll, the carrying basket back among finished work, strung bitterroot. The drawer, the stool, the cup and the swept patch may sit in view and get no attention (`mara-shelf-room` deferred and untouched).

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-23-1` | object | matter_of_fact | **[action]** The tonic jars stand full and corked on the cleared shelf, fifty in counted rows, labels out. Frost silvers the boards of Market Row, and Mara has the stall's winter canvas across her knees. | 34 | — |

## `CH-T2-23-1` — the week's end; her welcome is a job again, and the job is not the tonic *(three options)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-1-s` | dialogue | matter_of_fact | "There you are. Take the line down for me, bunch by bunch. It's dry now and the frost will damp it by noon." | 23 | Her welcome is an imperative, same as every visit, and the job is not the tonic; the finished shelf gets no mention from her. |

### Option `-a` — takes the job she puts in the player's hands *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-1-a-act` | action | matter_of_fact | **[action]** [Take the dried bunches down from the line, one by one.] | 11 | — |
| `L-CH-T2-23-1-a-r1` | dialogue | matter_of_fact | "Leave the ties on them, they hang again come spring. The line stays up all winter." | 16 | Instruction is her thanks; the beat is spent inside the tending. |

### Option `-b` — asks whether the count came out *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-1-b-p` | player_line | matter_of_fact | "Did the count come out?" | 5 | — |
| `L-CH-T2-23-1-b-r1` | dialogue | matter_of_fact | "Fifty, corked by yesterday's dark, and the frost came overnight. The festival has its tonic." | 15 | Exact, done, and no ceremony attached to it; the role's business answered plainly and left there. |

### Option `-c` — names that the shelf is full *(spoken · moves `mara-tonic-frost`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-1-c-p` | player_line | matter_of_fact | "Your shelf's full." | 3 | — |
| `L-CH-T2-23-1-c-r1` | dialogue | matter_of_fact | "It is. This hem isn't. Hold the near end flat for me." | 12 | The finishing confirmed as fact and left in three words; her answer goes to the thing in her hands now, and a job rides on it. |

*Records per graph: `-a` Intimacy; `-b` Trust; `-c` moves the thread. No response scolds an unpicked option; nothing counts jobs taken.*

---

## `CH-T2-23-2` — the finished shelf, and her hands not on it

**Rule-19 build, per the content block:** a short fragment about the count being out → `A-CH-T2-23-2-s` → a shorter fragment, hers, about the thing she is holding. The set-up is split `-s1` / `-s2` around the action slot; the reveal is the gap between the fragments and is never moved into a longer line.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-2-s1` | dialogue | matter_of_fact | "The count's out and corked, the whole fifty." | 8 | The finished work named as a count, nothing more; a fragment, not a summary. |
| `A-CH-T2-23-2-s` | action | matter_of_fact | **[action]** Mara crosses behind the stall for thread, passing the full shelf close enough to brush it. Her hands stay with the canvas. | 22 | — |
| `L-CH-T2-23-2-s2` | dialogue | matter_of_fact | "This hem wants fifty stitches yet." | 6 | The thing she is holding, priced in the same number the shelf just retired; she connects nothing. |

### Option `-a` — stands with the finished shelf, says nothing of it *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-2-a-act` | action | matter_of_fact | **[action]** [Stand with the finished shelf and say nothing of it.] | 10 | — |
| `L-CH-T2-23-2-a-r1` | dialogue | matter_of_fact | "Bring me the small shears while you're standing." | 8 | The standing is let be; a job crosses the gap instead of a word about the shelf. |

### Option `-b` — asks what the shelf still needs *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-2-b-p` | player_line | matter_of_fact | "What does the shelf still need?" | 6 | — |
| `L-CH-T2-23-2-b-r1` | dialogue | matter_of_fact | "Nothing. It's done. The canvas wants thread, the line wants coiling, and the bitterroot wants stringing for winter." | 18 | The answer routes straight past the finished thing to the unfinished ones; `deflection_target` working exactly as carded, and no reason is offered. |

*Records per graph: `-a` Intimacy; `-b` Trust. Nothing in the set-up narrates why her hands do not go to it.*

---

*Gate: `knows(drift_seen)` — when false, node 3 auto-skips to its gather; the ungated fallback path, not a negated gate.*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-CH-T2-23-3-s` | object | matter_of_fact | **[action]** The carrying basket stands at the bench end among the finished work, the pale thread of the mend plain on its rim. | 22 | — |

## `CH-T2-23-3` — the mended carry back at the stall *(gated `knows(drift_seen)`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-3-s` | dialogue | matter_of_fact | "The basket's done its week. Peg it high for me, the damp comes up the boards in frost." | 18 | The carry closed out like any working kit; the mend on it goes unmentioned by her. |

### Option `-a` — marks that the mend outlasted the run *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-3-a-p` | player_line | quiet | "The mend outlasted the run." | 5 | — |
| `L-CH-T2-23-3-a-r1` | dialogue | quiet | "Waxed thread does. High peg, mind the straps." | 8 | The read lands and gets a material fact and a job; the present line goes thin, and what her hands chose that afternoon is never accounted for. |

### Option `-b` — sets the carry back where it lives *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-3-b-act` | action | matter_of_fact | **[action]** [Hang the carry high on its peg where it lives.] | 10 | — |
| `L-CH-T2-23-3-b-r1` | dialogue | matter_of_fact | "That's it. It hangs dry there till the spring runs." | 10 | The beat spent on keeping the thing whole, which is where she is. |

*Records per graph: `-a` Recognition — the deepest read in the conversation; `-b` Intimacy.*

---

*Gate: `knows(herbs_carried)` — when false, node 4 auto-skips to its gather; the ungated fallback path, not a negated gate.*

## `CH-T2-23-4` — the herbs the player carried down, now in the jars *(gated `knows(herbs_carried)`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-4-s` | dialogue | matter_of_fact | "The wall-end jars hold what you carried down. Frost herbs off the near stand, and the yarrow from under the beech." | 21 | She can say which jars hold that afternoon's load, exactly, the way she can date a hinge; about the work, never about the player or herself. |

### Option `-a` — takes the next job the same way *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-4-a-act` | action | matter_of_fact | **[action]** [Hold out a hand for the next load, the same way.] | 11 | — |
| `L-CH-T2-23-4-a-r1` | dialogue | matter_of_fact | "The bitterroot, then. Strung in fives and hung where the wind is. You know the weight of a fair load now." | 21 | The next job given the way the last one was; the noticing of a carrier's judgment is the warmth. |

### Option `-b` — asks what happens to the shelf after the festival *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-4-b-p` | player_line | matter_of_fact | "What happens to the shelf after the festival?" | 8 | — |
| `L-CH-T2-23-4-b-r1` | dialogue | matter_of_fact | "It empties in a night, jar by jar off the front row. Then it takes the winter stock." | 18 | The frost and the jars, practical; the shelf's future is storage, and the answer does not become a statement about her. |

*Records per graph: `-a` Intimacy; `-b` Trust — both below node 3's Recognition, per the depth rule.*

---

## `CH-T2-23-5` — the unfinished thing already in her hands

**Rule-19 build, per the content block:** fragment → `A-CH-T2-23-5-s` → shorter fragment. The set-up is split `-s1` / `-s2` around the action slot; the other end of the ratchet, same shape as node 2's build.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-5-s1` | dialogue | matter_of_fact | "That's the whole of the tonic work done." | 8 | The finishing stated once, as a work fact, with nothing in her moved by it. |
| `A-CH-T2-23-5-s` | action | matter_of_fact | **[action]** The winter canvas is already across her knees, the unfinished hem gathered in one hand, the needle going. | 18 | — |
| `L-CH-T2-23-5-s2` | dialogue | matter_of_fact | "Thread me the second needle." | 5 | Her hands are already elsewhere, and the player is enlisted into the elsewhere. |

### Option `-a` — takes a part of it and works it with her *(deed · Intimacy · opens the nested child)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-5-a-act` | action | matter_of_fact | **[action]** [Take a part of the hem and work it with her.] | 11 | — |

### Option `-b` — asks whether the tonic was the last of it *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-5-b-p` | player_line | matter_of_fact | "Was the tonic the last of it?" | 7 | — |
| `L-CH-T2-23-5-b-r1` | dialogue | matter_of_fact | "The last of the jars, not of the work. The wet years wore the canvas through at the grommets. There's stringing and coiling after it." | 25 | The answer is the work still standing; the past tense arrives uninvited on the canvas's exact wear and goes unremarked by her. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

### Nested child — `CH-T2-23-5-a-1` · working beside her, the finished shelf behind them, untouched *(node 5 › option a › child 1)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-5-a-1-s` | dialogue | matter_of_fact | "This canvas has been on the stall eleven winters. It wants a new hem every frost and a patch where the pole rubs, and it gets them." | 27 | How long the unfinished thing has been going and what it still wants, exact and present-tense, hands moving; work with no end, stated as maintenance fact. |

#### Option `-a` — marks that she has not gone back to the shelf *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-5-a-1-a-p` | player_line | quiet | "You haven't gone back to the shelf." | 7 | — |
| `L-CH-T2-23-5-a-1-a-r1` | dialogue | quiet | "Mm. This needle's going blunt, there's a fresh one in the roll." | 12 | The read is neither confirmed nor denied; the thing at hand fills the line where an account of herself would go. |
| `L-CH-T2-23-5-a-1-a-r2` | dialogue | matter_of_fact | "Pull the next stitch through while I thread it." | 9 | A job into the player's hands, the plainest non-answer she has. |

#### Option `-b` — works on without marking it *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-5-a-1-b-act` | action | matter_of_fact | **[action]** [Work on down the hem without marking it.] | 8 | — |
| `L-CH-T2-23-5-a-1-b-r1` | dialogue | matter_of_fact | "You keep a fair stitch. This side's done by dark at this rate." | 13 | The shared work taken as work; the noticing of a kept stitch is the warmth. |

*Records per graph: `-a` Recognition — the player's read, never hers; `-b` Intimacy. Nothing asks what the keeping is for and no line explains it.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-23-6` | action | matter_of_fact | **[action]** Mara wraps six corked jars into a carrier and puts it into the player's hands. | 15 | — |

## `CH-T2-23-6` — leave-taking; the frost landing, the finished shelf untouched behind her

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-6-s` | dialogue | matter_of_fact | "These go up to the square as you go, they're asked for tonight. Mouths up, and don't hurry the steps." | 20 | The goodbye is a job with instructions on it, as every visit's has been; the festival is supplied and nothing is made of it. |

### Option `-a` — takes the last job out with her instruction on it *(deed · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-6-a-act` | action | matter_of_fact | **[action]** [Take the jars out with her instruction on them.] | 9 | — |
| `L-CH-T2-23-6-a-r1` | dialogue | matter_of_fact | "Mouths up the whole way. That's the festival's share moving." | 10 | The thread closes on work leaving her hands for the festival's, and nothing in her moves with it. |

### Option `-b` — says the player will come back for the rest of the unfinished thing *(spoken · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-23-6-b-p` | player_line | matter_of_fact | "I'll come back for the rest of the hem." | 9 | — |
| `L-CH-T2-23-6-b-r1` | dialogue | warm | "Hem work suits a cold morning. Come when the frost quiets the row and bring your fair stitch." | 18 | More tending is the one thing she takes, and she takes it by fitting the player's return into the work's own weather. |

*Records per graph: `-a` Trust; `-b` Intimacy. The thread ends completed and inert: the jars full, the shelf finished and untouched, her hands on the hem.*

---

## Notes for the gate

- **Slot totals.** 24 `dialogue` · 8 `player_line` · 10 `action` (3 scene/set-up, 7 deed) · 2 `object` — 44 slots. Every text inside its ceiling; longest dialogue line 27 words (`L-CH-T2-23-5-a-1-s`).
- **R3 delivered as behavior, on every walk.** `O-SC-T2-23-1` stages the full shelf and her hands already elsewhere before anyone speaks; node 2's rule-19 build (8 w → `A-CH-T2-23-2-s` → 6 w) puts her past the shelf without touching it, and node 5's (8 w → `A-CH-T2-23-5-s` → 5 w) lands the other end of the ratchet. The reveal is the gap between fragments; no slot narrates it and no line of hers accounts for it.
- **She never names.** Named the shelf full (`-1-c-r1`) she gives three words of fact and the thing in her hands; asked what the shelf needs (`-2-b-r1`) the answer routes past it; the two Recognition reads (`-3-a-r1`, `-5-a-1-a-r1`) get a material fact, a thin present line and a job, never a confirmation, denial or account.
- **Nothing releases her and nothing corrects her.** Finishing is a work fact (`-5-s1`); no beat frames it as letting go, no option grants a fix, and the conversation ends with the tending going on (`-6-b-r1`).
- **Her warmth stays restoration.** Every job handed out is keeping or moving existing things — the line, the hem, the strung roots, the festival's own jars; she supplies nothing new to the player and anticipates no need.
- **No delta_cast.** The mended carry, the tense habit and the finished shelf are acted on reference-free; the `delta_situation` (jars full, frost landed, festival supplied) is carried by `O-SC-T2-23-1`, node 1's set-up and node 2's build.
- **Band check.** Ordinary Mara lines run 12–27 words. Lines under her floor are the rule-19 fragments (`-2-s1` 8 w, `-2-s2` 6 w, `-5-s1` 8 w, `-5-s2` 5 w), the authored thin-present beats at the two reads (`-3-a-r1` 8 w, `-5-a-1-a-r1` 12 w with its 9 w job tail) and short work beats (`-2-a-r1` 8 w, `-3-b-r1` 10 w, `-5-a-1-a-r2` 9 w, `-6-a-r1` 10 w) — weight beats and handed-off jobs, not clipping.
- **Tense tell placed once** (`-5-b-r1` — the canvas's wear, "the wet years," an exact detail, unremarked and not wistful). One tell is this conversation's share; the week's arithmetic elsewhere is legitimately past ("corked by yesterday's dark") and is history, not the tell.
- **Bond categories: Trust, Intimacy, Recognition only.** Recognition appears twice (`-3-a`, `-5-a-1-a`), both the player's read. No `surface_action` appears in any slot_type column — deeds are `action` slots.
- **No variants.** Nodes 3 and 4 gate separately and auto-skip when false; all ungated slots serve all four incoming states with one text. The fallback walk (1 → 2 → 5 → 6) opens, works and exits through real content.
- **Inventions (check 12), declared:** `prop` — the stall's winter canvas with its unfinished hem (`O-SC-T2-23-1`, `-1-c-r1`, node 2 and node 5 builds, the child) — the unfinished thing the graph requires in her hands, examinable from the stall; `prop` — the needle roll with its needles (`-5-s2`, `-5-a-1-a-r1`); `prop` — the small shears (`-2-a-r1`); `prop` — the basket's high peg (`-3-s`, `-3-b-act`); `prop` — the jar carrier for the square (`A-SC-T2-23-6`). Reused, not re-declared: the drying line (`mara-set-for-two` C1), `prop:maras-carrying-basket` and waxed thread (`-3-a-r1`). Quantities ("fifty stitches," "eleven winters," "six," "strung in fives") are scene colour, undeclared by rule.
- **Nothing competes with the drawer, the stool, the cup or the swept patch** (`mara-shelf-room` deferred and untouched); none is mentioned. No World Truth stated; no trait phrased in herbalist terms; `world:the-flood-year` goes unmentioned — the frost is a date landing, not a disaster.
- **Register lock, flagged not resolved:** three enum values appear across slots (`matter_of_fact` / `quiet` / `warm`), same pattern the sibling files ship with. Read aloud the cadence never changes. Roc's standing call on per-scene vs per-slot applies here identically.
