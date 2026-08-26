# `ilsa-kin-no-show` — C2 line slots · `SC-T4-04`

**Conversation:** C2. Carries I1 — the absence: the promised day, and Bram does not come; no message this time. His tools go out at morning and away at dusk, and she closes the gap by arrangement.
**Structure source:** `../ilsa-kin-no-show.md` § "C2 — `SC-T4-04`", Choice designer 2026-08-09, **redesigned for `GP-124` and approved by Roc 2026-08-10**. Written against the current graph: the arrival node is ungated and carries the not-knowing case; the gated sibling reads `knows(bench_end_taken)`. No negation anywhere. Nothing structural altered.
**Soul:** `ilsa` (`cast/ilsa.md`). Written from `essence_descriptor` and `voice_register` only, plus `register.md` and the codex. Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts in their own column.
**Speaker for all `dialogue` slots:** `ilsa`. No walk-on speaks — no messenger arrives, which is the point: this time, no word comes.

**Incoming states:** four — reads `bench_end_taken` and `cover_witnessed` (the latter only populated if C3 played first). Both gates are node-level (nodes 2 and 5) and auto-skip when unset. **No per-slot variants required.**

**Staging vocabulary:** the yard on the promised day — fire, bench, files, tongs, bellows, the crown and collar of the centerpiece, the road, the gate, the far end and near end. All reused from `world:ilsas-forge` and `ilsa-kin-no-show` C1 except the declared inventions below. The ore's non-arrival is **referenced, never re-declared** — C1 declared the ore word.

**Sanctioned long run:** none placed. Barred throughout this thread; the absence is barred from long runs absolutely.

**Her uptake move** (register's move 3, her version): she acknowledges by *placing*. No question mark in any Ilsa line. **Every Ilsa sentence in C2 completes** — her response to being marked is not the unfinished sentence, which is C4's beat alone; it is her engine: the gap converted to an arrangement, tomorrow's placement stated in the flat declarative present. The day is a day like other days on which one thing does not happen — no line lands it as an event.

**Weight-node set-ups:** node 5 has no spoken set-up — per the graph its set-up is `O-CH-T4-04-5-s`, gated entry only.

---

## Scene opening

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-04-1` | object | matter_of_fact | **[action]** Morning. The bench is laid out down its length. Bram's tools go out at the far end with the rest, set and not yet touched. | 25 | — |

## `CH-T4-04-1` — arrival on the promised day, from the yard side *(ungated — the base arrival, walked by every state)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-1-s` | dialogue | matter_of_fact | "Fire's up. File work first, while she's cold." | 8 | Opens the promised day as a working order like any other day's; nothing in the sentence marks what the day is waiting on. |

### Option `-a` — asks how the day is going *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-1-a-p` | player_line | matter_of_fact | "How's the day going?" | 4 | — |
| `L-CH-T4-04-1-a-r1` | dialogue | matter_of_fact | "Filing till midday. The ore comes when it comes." | 9 | The day stated as arrangement; the recent particular of when comes back rounded off, because the near past does not hold its edges for her. |
| `L-CH-T4-04-1-a-r2` | dialogue | warm | "Stool inside the door is yours." | 6 | The asker's place stated as already theirs, flat declarative, no condition on it; inclusion as standing fact, not a comfort offered against tiring. |

### Option `-b` — stays at the yard edge through a heat *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-1-b-act` | action | matter_of_fact | **[action]** [Stand at the yard edge through a heat.] | — | — |
| `L-CH-T4-04-1-b-r1` | dialogue | matter_of_fact | "Sparks reach where you're stood." | 5 | Care as a fact about the fire, aimed at where the player is standing; the fact carries the caution without an imperative on it. |
| `L-CH-T4-04-1-b-r2` | dialogue | warm | "You can see her best from there." | 7 | The watcher's spot confirmed as a good one; standing by is a position in the yard, not outside it. |

*Records per graph: `-a` Trust; `-b` Intimacy. This is the fallback's arrival, authored as content, not as an apology.*

---

## `CH-T4-04-2` — the day worked from inside the standing place *(gated `knows(bench_end_taken)`; unset, the node auto-skips)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-2-s` | dialogue | matter_of_fact | "You're filing the crown side. I've the collar." | 8 | The day's plan already has the player's hands in it; the split arrives decided, which is what a standing place means. |

### Option `-a` — takes up their end and the day's first heat *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-2-a-act` | action | matter_of_fact | **[action]** [Take up the near end and the day's first heat.] | — | — |
| `L-CH-T4-04-2-a-r1` | dialogue | matter_of_fact | "That's it. Long strokes, with the curve." | 7 | The work confirmed and handed over whole; nothing marks the taking-up, because the place was already theirs. |
| `L-CH-T4-04-2-a-r2` | dialogue | warm | "Water's where it always is." | 5 | Provision as standing fact; always is the warm word, and none of it is named. |

### Option `-b` — asks what the day was to be *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-2-b-p` | player_line | matter_of_fact | "What's the plan for today?" | 5 | — |
| `L-CH-T4-04-2-b-r1` | dialogue | matter_of_fact | "Filing this side. Bram sets the ore in at the collar." | 11 | The plan named flat and complete, Bram's part sitting in it unremarked; to her the arrangement is furniture and the sentence treats it that way. |
| `L-CH-T4-04-2-b-r2` | dialogue | matter_of_fact | "Plenty in it for every pair of hands." | 8 | The day sized as enough for everyone the plan counts; the count itself is never a number said aloud. |

*Records per graph: `-a` Intimacy; `-b` Trust. The not-knowing case is the ungated node above, never a negated gate.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T4-04-2` | action | matter_of_fact | **[action]** The morning goes to filing, the afternoon to fitting. Carts pass on the road. Nothing turns in at the gate. | 20 | — |

## `CH-T4-04-3` — the day passes; no word comes *(ungated)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-3-s` | dialogue | matter_of_fact | "Light's for one more heat. We take it." | 8 | The remaining day read out as work; nothing in the sentence counts what has not arrived in it. |

### Option `-a` — asks whether any word came *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-3-a-p` | player_line | matter_of_fact | "Any word come today?" | 4 | — |
| `L-CH-T4-04-3-a-r1` | dialogue | quiet | "None came." | 2 | The fact confirmed flat and closed; the sentence is complete and carries nothing else. |
| `L-CH-T4-04-3-a-r2` | dialogue | matter_of_fact | "You're on the bellows for the last heat." | 8 | The question's weight comes back as a placement; somebody really did get a spot, and the day stays a working day. |

### Option `-b` — keeps the work moving through the afternoon *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-3-b-act` | action | matter_of_fact | **[action]** [Keep the work moving through the afternoon.] | — | — |
| `L-CH-T4-04-3-b-r1` | dialogue | matter_of_fact | "Collar side next. Bring the small file." | 7 | The afternoon handed over piece by piece; the work absorbs the day, which is what she uses it for. |

*Records per graph: `-a` Trust; `-b` Intimacy. Neither remark treats the day as an event.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T4-04-4` | action | quiet | **[action]** Dusk. Ilsa gathers Bram's tools from the far end and carries them to the rack, the same motion as every dusk. | 21 | — |

## `CH-T4-04-4` — the tools going away in front of the player *(the deep pick)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-4-s` | dialogue | matter_of_fact | "That's the light gone. Tools away." | 6 | The dusk routine read out plainly; whose tools is not in the sentence, because for her the motion is the same every dusk. |

### Option `-a` — marks the day for what it was *(spoken · sets `absence_witnessed` · Recognition · moves `ilsa-kin-no-show` · enters the nested child)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-4-a-p` | player_line | quiet | "Today was his day. He didn't come." | 7 | — |
| `L-CH-T4-04-4-a-r1` | dialogue | quiet | "He didn't." | 2 | The fact confirmed flat, nothing more; no verdict, no account, and the sentence is complete. |

*The response run continues into the nested child below; the pause between mark and answer is the action slot.*

### Option `-b` — helps put the tools away, lets the day stand *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-4-b-act` | action | matter_of_fact | **[action]** [Help carry the tools to the rack and let the day stand.] | — | — |
| `L-CH-T4-04-4-b-r1` | dialogue | matter_of_fact | "His set hangs on the end pegs." | 7 | Where things go, stated as furniture; the helping is folded in without remark and the arrangement stands. |
| `L-CH-T4-04-4-b-r2` | dialogue | matter_of_fact | "Yours stay out for tomorrow." | 5 | The near end held overnight as standing fact; the belonging is in the tense. |

*Records per graph: `-a` sets `absence_witnessed`, Recognition, moves the thread; `-b` Intimacy.*

---

## `CH-T4-04-4-a-1` — the gap closed by arrangement *(nested inside `-4-a`; the rule-19 beat)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T4-04-4-a-r` | action | quiet | **[action]** Ilsa finishes racking the tools before anything else is said. His set goes in beside hers. | 16 | — |
| `L-CH-T4-04-4-a-1-s` | dialogue | matter_of_fact | "You're filing the collar side tomorrow. Midday heat." | 8 | The gap converted to an arrangement: tomorrow's placement stated in the flat declarative present, complete, with nothing about the day it closes. |

### Option `-a` — stands into the arrangement without another word *(silent deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-4-a-1-a-act` | action | quiet | **[action]** [Stand into the arrangement without another word.] | — | — |
| `L-CH-T4-04-4-a-1-a-r1` | dialogue | warm | "Good. Midday, then." | 3 | The silence taken as the answer it is; the arrangement holds and nothing further is asked of the moment. |

### Option `-b` — answers the placement plainly *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-4-a-1-b-p` | player_line | matter_of_fact | "I'll be at the collar side by midday." | 8 | — |
| `L-CH-T4-04-4-a-1-b-r1` | dialogue | matter_of_fact | "Then that's tomorrow settled." | 4 | The confirmation folded into the schedule; the day ends arranged, which is how she ends things. |

*Records per graph: `-a` Intimacy; `-b` Trust. Nothing in the child explains, consoles, or fills.*

---

## `CH-T4-04-5` — the same move at a different size *(gated `knows(cover_witnessed)`; unset, the node auto-skips; set-up is the object slot — no spoken set-up)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-CH-T4-04-5-s` | object | quiet | **[action]** The rack at dusk. His tools hang stowed among the rest, oiled and squared, nothing to pick them out. | 19 | — |

### Option `-a` — marks that this gap, too, is already covered *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-5-a-p` | player_line | quiet | "This one's covered already, too." | 5 | — |
| `L-CH-T4-04-5-a-r1` | dialogue | quiet | "It's put away." | 3 | The reading allowed as the plain fact it names; no defense and no motive, because to her a stowed rack is only a stowed rack. |
| `L-CH-T4-04-5-a-r2` | dialogue | matter_of_fact | "You're first at the fire tomorrow." | 6 | Attention on her arrangements comes back as the player's next place. |

### Option `-b` — stands with her at the racked tools, saying nothing *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-5-b-act` | action | quiet | **[action]** [Stand with her at the racked tools, saying nothing.] | — | — |
| `L-CH-T4-04-5-b-r1` | dialogue | matter_of_fact | "We start early tomorrow." | 4 | The pause held, then the schedule; the we carries the warmth and nothing else is opened. |

*Records per graph: `-a` Recognition; `-b` Intimacy. Missing this node shallows, never reroutes.*

---

## `CH-T4-04-6` — close — the second place stays laid for tomorrow *(ungated)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-6-s` | dialogue | matter_of_fact | "That's the day. Same again tomorrow." | 6 | The day closed as a day like other days; tomorrow arrives already arranged and nothing in the line counts what this one lacked. |

### Option `-a` — sets the near-end tools away alongside hers *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-6-a-act` | action | matter_of_fact | **[action]** [Set the near-end tools away alongside hers.] | — | — |
| `L-CH-T4-04-6-a-r1` | dialogue | warm | "They'll be out again by the time you're here." | 9 | The place held between visits, stated in the future tense; the laying-out is hers and never mentioned as a doing. |
| `L-CH-T4-04-6-a-r2` | dialogue | matter_of_fact | "Gate latch sticks. Lift it as you go." | 8 | The way home provided as fact; the looking-after is real and none of it is named. |

### Option `-b` — says they'll come by tomorrow *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-04-6-b-p` | player_line | matter_of_fact | "I'll come by tomorrow." | 4 | — |
| `L-CH-T4-04-6-b-r1` | dialogue | matter_of_fact | "Midday heat. Your end will be out." | 7 | The return folded into the standing schedule; the place is already laid in the sentence's future, and nobody is invited. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## Inventions declared *(codex checked first; reuse recorded)*

| invention_type | name | what | content_ids | codex_checked |
|---|---|---|---|---|
| prop | the tool rack | A rack inside the forge where the bench tools stow at dusk | `A-SC-T4-04-4`, `L-CH-T4-04-4-b-act`, `L-CH-T4-04-4-b-r1`, `A-CH-T4-04-4-a-r`, `O-CH-T4-04-5-s`, `L-CH-T4-04-5-b-act` | `world:ilsas-forge` has the bench and its laid-out sets; nothing carries where tools go at night, and the graph's dusk beat needs the stowing to be a place |

**Reused, not invented:** the bench, its far and near ends, bellows, files, tongs, fire, the crown and collar, the ore word and the collar's waiting fitting (`ilsa-kin-no-show` C1, referenced free, never re-declared), the stool inside the door (C1 invention), the road and the gate (C1, `ilsa-forge-short`), the small file and the end pegs and the gate latch (scene colour on established things, undeclared). Bram appears as tools and one flat plan-line only — name-only, an event, no relation or reason stated or implied. Quantities are scene colour throughout.

## Notes for the gate

- **No question mark in any Ilsa line; no proposal grammar.** Dialogue runs 2–11 words, most 5–8. Longest Ilsa line: 11 words (`L-CH-T4-04-2-b-r1`).
- **Every Ilsa sentence completes.** The unfinished sentence is C4's alone; her answer to being marked is the arrangement (`L-CH-T4-04-4-a-1-s`), declarative and complete.
- **The mark is marked, never named:** `-4-a-p` places two facts and stops — no verdict, no motive, no consolation. Her confirmations ("He didn't." · "None came.") confirm fact, never feeling.
- **No set-piece:** the day's shape is carried by `A-SC-T4-04-2` (nothing turns in at the gate) and `A-SC-T4-04-4` (the same motion as every dusk); no line lands the no-show as an event, and no slot consoles.
- **Rule-19 build at node 4 option `-a`:** mark (7w) → flat fragment (2w) → `A-CH-T4-04-4-a-r` → the arrangement, complete (8w). Fragment, action, shorter completion — her carded heavy shape with the sentence finishing, per the content block.
- **Order-free guard:** nothing outside node 5 references C3's events; node 5's mark reads the stowed rack in this room, not the found work.
- **No arithmetic anywhere; no shortfall converted to a count.** The gap closes by placement only.
- **Deflection instances:** `-3-a-r2`, `-5-a-r2` — attention on the absence or on her arrangements comes back as the player being placed.
- **Bram stays name-only:** his tools and one plan-line; word's not-coming is a fact confirmed, never explained.
- **Offer-stands-alone test applied**; kept second clauses ("with the curve", "Lift it as you go") are instruction or visible care, not justification.
- **Register lock:** scene locks `matter_of_fact`; `quiet`/`warm` on individual slots per the C1 precedent — same standing flag for Roc (per-scene vs per-slot lock), not resolved here.
