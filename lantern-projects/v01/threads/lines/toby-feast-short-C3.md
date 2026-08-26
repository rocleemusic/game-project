# `toby-feast-short` — C3 line slots · `SC-T2-17`

**Conversation:** C3. Carries R3 (the arithmetic *is* the deflection: the last twelve will not come off by counting, and instead of saying so he does the sum again).
**Structure source:** `../toby-feast-short.md` § "C3 — `SC-T2-17`", graphs approved by Roc 2026-08-10. Nothing structural altered.
**Soul:** `toby` (`cast/toby.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. **No long run — barred here by the brief and by the card: the re-done sum is the weight beat, and a run would put the weight in the words.**
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Dialogue and player_line text in quotation marks; word counts in their own column (relaxed convention, 2026-08-09).
**Speaker for all `dialogue` slots:** `toby`. No walk-on.
**Incoming states:** four — node 3 opens on `knows(count_is_turnout)`, node 4 on `knows(starter_owed)`; a false gate auto-skips to the gather. All four states receive R3 whole: the re-done sum is scene business, delivered before anyone picks anything.
**Staging vocabulary:** the sheet with the workings not rubbed out, the pencil, the slate and its circled figure, the unassigned list, the ovens at capacity, wood due.

---

## Scene opening — before node 1

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-17-1` | object | matter_of_fact | **[action]** The sheet lies on the counter, the same total worked twice down the page and the workings not rubbed out. | 20 | — |

## `CH-T2-17-1` — he adds the column again in front of the player

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-s` | dialogue | matter_of_fact | "Twelve. Let's see. Once more from the top." | 8 | The greeting is the sum restarting; the number has stopped moving and his answer is to add it again. |

### Option `-a` — asks what changed since he last added it *(spoken · sets `sum_wont_close` · bond: Recognition · moves `toby-feast-short`)*

The answer is the nested child's set-up — he does not reply inside this option; the child is the reply.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-a-p` | player_line | quiet | "What's changed since you last added it?" | 7 | — |

### Option `-b` — holds the sheet steady and lets the sum run *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-b-act` | action | quiet | **[action]** [Hold the sheet steady while the sum runs] | — | — |
| `L-CH-T2-17-1-b-r1` | dialogue | quiet | "Ta." | 1 | Company inside the deflection, accepted in one word. |
| `L-CH-T2-17-1-b-r2` | dialogue | quiet | "Twelve. Same as it was." | 5 | The sum ends where it started and he reports it like weather. |

*Records per graph: `-a` sets `sum_wont_close`, Recognition, moves the thread, then enters the nested child; `-b` Intimacy.*

---

## `CH-T2-17-1-a-1` (node 1 › option a › child 1) — nothing changed, and the second pass begins

**The child's set-up is the action slot — the re-doing is an act he performs and does not mention; no spoken slot can carry it (check 8).**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T2-17-1-a-1-s` | action | quiet | **[action]** Toby pulls the sheet back and starts the same column again from the top. | 14 | — |

### Option `-a` — asks him to say what the number will not do *(spoken · bond: Trust)*

The answer is the nested grandchild's set-up — the child of this option is the reply.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-a-1-a-p` | player_line | quiet | "Say what the number won't do." | 6 | — |

### Option `-b` — lets the second pass run uninterrupted *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-a-1-b-act` | action | quiet | **[action]** [Let the second pass run without interrupting] | — | — |
| `L-CH-T2-17-1-a-1-b-r1` | dialogue | quiet | "Still twelve." | 2 | The second pass delivers the same figure and he sets it down flat. |
| `L-CH-T2-17-1-a-1-b-r2` | dialogue | matter_of_fact | "Right. Wood first, then the trays." | 6 | The day resumed behind the number before the number can be looked at. |

*Records per graph: `-a` Trust, then enters the grandchild; `-b` Intimacy.*

## `CH-T2-17-1-a-1-a-1` (node 1 › option a › child 1 › option a › child 1) — he answers with the next step instead of the answer

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-a-1-a-1-s` | dialogue | matter_of_fact | "Twelve loaves is two pairs of hands and a night of oven time. That's the size of it." | 18 | Pressed for what the number will not do, he hands over what it would take instead. The substitution is the answer, and he does not know he made it. |

### Option `-a` — takes the next step as the answer *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-a-1-a-1-a-act` | action | matter_of_fact | **[action]** [Take the next step as the answer] | — | — |
| `L-CH-T2-17-1-a-1-a-1-a-r1` | dialogue | matter_of_fact | "Right. Hands first, then hours." | 5 | The step accepted, and the machinery runs on at full speed. |
| `L-CH-T2-17-1-a-1-a-1-a-r2` | dialogue | warm | "Gloves by the wood pile, if you're one of the pairs." | 11 | The helper equipped before they have said they are helping. |

### Option `-b` — marks that the step is not the answer *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-1-a-1-a-1-b-p` | player_line | quiet | "That's a step. It isn't an answer." | 7 | — |
| `L-CH-T2-17-1-a-1-a-1-b-r1` | dialogue | quiet | "No." | 1 | The sharpest read in the thread lands and the tempo collapses to one word. |
| `L-CH-T2-17-1-a-1-a-1-b-r2` | dialogue | quiet | "It's the step I've got." | 5 | He concedes the substitution by restating it, which is as far as the concession goes. |
| `L-CH-T2-17-1-a-1-a-1-b-r3` | dialogue | warm | "Stand clear of the oven door, it swings wide." | 9 | The footing he lost comes back as care for the other person's footing. |

*Records per graph: grandchild `-a` Intimacy; `-b` Recognition — the deepest read in the thread, at `MAX_NESTING`.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-17-2` | action | matter_of_fact | **[action]** Toby goes down the list of what still has nobody on it, marking each with the pencil's flat end. | 19 | — |

## `CH-T2-17-2` — what is left with nobody on it

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-2-s` | dialogue | matter_of_fact | "Half this list's got nobody's name against it yet." | 9 | The missing hands and hours surface as an accounting fact, never as trouble. |

### Option `-a` — asks what is still without anybody on it *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-2-a-p` | player_line | matter_of_fact | "What's still got nobody on it?" | 6 | — |
| `L-CH-T2-17-2-a-r1` | dialogue | matter_of_fact | "Wood, the carrying on the night, the long tables. In that order." | 12 | The accounting handed over whole, fluent because none of it is about him. |
| `L-CH-T2-17-2-a-r2` | dialogue | matter_of_fact | "Order's by when they're needed, not by size." | 8 | Even the list's ordering is worked out; only the hands are missing. |
| `L-CH-T2-17-2-a-r3` | dialogue | warm | "None of it's yours, mind. Asking's free." | 7 | The list offered without a hook in it; asking is not signing up. |

### Option `-b` — takes one of the unassigned pieces *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-2-b-act` | action | matter_of_fact | **[action]** [Take one of the unassigned pieces] | — | — |
| `L-CH-T2-17-2-b-r1` | dialogue | matter_of_fact | "Tables, then. They come down from the hall loft." | 9 | An order to fill; the instructions arrive before the offer has finished landing. |
| `L-CH-T2-17-2-b-r2` | dialogue | warm | "Take the short ladder. The tall one's a liar." | 9 | The next hazard on the helper's route already known and already solved. |

*Records per graph: `-a` Trust; `-b` Intimacy. Neither pick is the reason the feast holds; nothing recorded here reads as a contribution total.*

---

## `CH-T2-17-3` — asked to bake for who is confirmed, he does not cut the number *(gated `knows(count_is_turnout)` — auto-skips to the gather when false)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T2-17-3-s` | action | matter_of_fact | **[action]** Toby puts the slate back against the counter with the whole circled figure showing. | 14 | — |
| `L-CH-T2-17-3-s` | dialogue | matter_of_fact | "The circled figure hasn't moved. Twelve short of it, whoever's confirmed." | 11 | The full count restated against the shortfall, the refusal shown before it is spoken. |

### Option `-a` — asks him to bake for who is confirmed *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-3-a-p` | player_line | matter_of_fact | "Bake for who's confirmed. That covers it." | 7 | — |
| `L-CH-T2-17-3-a-r1` | dialogue | quiet | "Can't do that." | 3 | The line he does not cross, met at the door in three words. |
| `L-CH-T2-17-3-a-r2` | dialogue | quiet | "Slate says forty. Forty's who might stand there." | 8 | The count defended by what it counts, never by why he counts that way. |
| `L-CH-T2-17-3-a-r3` | dialogue | matter_of_fact | "Fair thought, mind. It'd be a smaller job." | 8 | The suggestion honoured as sensible; the refusal carries no scold in it. |

### Option `-b` — asks who the extra loaves are for *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-3-b-p` | player_line | matter_of_fact | "Who are the extra loaves for?" | 6 | — |
| `L-CH-T2-17-3-b-r1` | dialogue | matter_of_fact | "Whoever's standing in the square when the tables go up." | 10 | The count taken on its own terms and answered plainly. |
| `L-CH-T2-17-3-b-r2` | dialogue | matter_of_fact | "Nobody orders on festival night. They just come." | 8 | The reason the order column cannot be the number, stated as village fact. |

### Option `-c` — sets the slate where he can see the whole figure *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-3-c-act` | action | matter_of_fact | **[action]** [Set the slate where he can see the whole figure] | — | — |
| `L-CH-T2-17-3-c-r1` | dialogue | quiet | "Yup, there." | 2 | The count left alone, and the leaving-alone received without comment. |
| `L-CH-T2-17-3-c-r2` | dialogue | warm | "Chalk's on the ledge if you want to keep tally too." | 11 | Company at the slate turned into a supplied job before it can be anything else. |

*Records per graph: `-a` Recognition; `-b` Trust; `-c` Intimacy. The cast fact (he will not cut the number, PROPOSED) arrives as a refusal seen from outside, never as a trait he claims.*

---

## `CH-T2-17-4` — the loan comes off the top, before his own gap *(gated `knows(starter_owed)` — auto-skips to the gather when false)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-4-s` | dialogue | matter_of_fact | "Crock's owed first. Their measure comes off the top before my twelve." | 12 | The loan ranked above his own shortfall inside the same arithmetic, stated as the obvious order. |

### Option `-a` — marks that the loan is counted before his own gap *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-4-a-p` | player_line | quiet | "The loan sits ahead of your own gap." | 8 | — |
| `L-CH-T2-17-4-a-r1` | dialogue | quiet | "That's where loans sit." | 4 | Seen ranking himself last, he files it under how loans work. |
| `L-CH-T2-17-4-a-r2` | dialogue | matter_of_fact | "It goes back heavier, and then the twelve." | 8 | The order restated as sequence; the sequence is all he will say about it. |

### Option `-b` — asks what the household gets back over the loan *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-4-b-p` | player_line | matter_of_fact | "What do they get back over the loan?" | 8 | — |
| `L-CH-T2-17-4-b-r1` | dialogue | matter_of_fact | "Flour measure, a warm loaf, and first call on feast bread." | 11 | The over-payment itemised instantly; the figure was ready before the question was. |
| `L-CH-T2-17-4-b-r2` | dialogue | warm | "They'd say it's too much. They can say it to the loaf." | 12 | The objection pre-answered by making the gift undeliverable back. |

*Records per graph: `-a` Recognition; `-b` Trust.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-17-5` | action | matter_of_fact | **[action]** Toby banks the oven and counts the batches off against the door. | 12 | — |

## `CH-T2-17-5` — the ovens' limit, which is not arithmetic

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-5-s` | dialogue | matter_of_fact | "There's the other number, and it's not on the sheet." | 10 | The one constraint counting does not touch, introduced flatly as capacity. |

### Option `-a` — asks how many the ovens take in a day *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-5-a-p` | player_line | matter_of_fact | "How many can the ovens take in a day?" | 9 | — |
| `L-CH-T2-17-5-a-r1` | dialogue | matter_of_fact | "Six batches, flat out, and they're at six." | 8 | Capacity delivered as fact, already maxed, no trouble attached. |
| `L-CH-T2-17-5-a-r2` | dialogue | matter_of_fact | "No counting gets a seventh in." | 6 | The wall named plainly; what it means for the twelve is left unsaid. |

### Option `-b` — banks the oven for the next batch *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-5-b-act` | action | matter_of_fact | **[action]** [Bank the oven for the next batch] | — | — |
| `L-CH-T2-17-5-b-r1` | dialogue | matter_of_fact | "That's it, bank it high at the back." | 8 | Help arriving as work gets instructions, not thanks. |
| `L-CH-T2-17-5-b-r2` | dialogue | warm | "Mind your hands, rake's got a short handle." | 8 | The tool's flaw known in advance and spent on the helper's safety. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

## `CH-T2-17-6` — the third pass, while festival night does not move *(the weight beat — rule-19 build)*

Fragment → action → shorter fragment. The weight is the pencil returning to the top of the column; no line here gets longer.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-6-s1` | dialogue | quiet | "Twelve. Once more, then." | 4 | The sum has nothing left to give and he starts it anyway. |
| `A-CH-T2-17-6-s` | action | quiet | **[action]** The pencil goes back to the top of the column. | 10 | — |
| `L-CH-T2-17-6-s2` | dialogue | quiet | "Twelve." | 1 | R3 at full load: the same figure, the third time, in one word. |

### Option `-a` — stays through the third pass without a word *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-6-a-act` | action | quiet | **[action]** [Stay through the third pass without a word] | — | — |
| `L-CH-T2-17-6-a-r1` | dialogue | quiet | "There it is." | 3 | The figure set down in company, which is the one thing he can accept. |
| `L-CH-T2-17-6-a-r2` | dialogue | warm | "Kettle's not long boiled." | 4 | The staying answered with supply, quietly, before it can be named as staying. |

### Option `-b` — marks that the sum has not changed in three passes *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-6-b-p` | player_line | quiet | "Three passes. The number hasn't moved." | 6 | — |
| `L-CH-T2-17-6-b-r1` | dialogue | quiet | "It hasn't." | 2 | The fact confirmed flat; the cover it takes off him goes unmentioned. |
| `L-CH-T2-17-6-b-r2` | dialogue | quiet | "It adds the same every time. Good pencil." | 8 | The loop deflected into a joke about the tool, because the joke is shorter than the truth. |
| `L-CH-T2-17-6-b-r3` | dialogue | warm | "Wood's due within the hour. There's that." | 7 | The talk steered back to the one piece of the day still moving. |

*Records per graph: `-a` Intimacy; `-b` Recognition.*

---

## `CH-T2-17-7` — leave-taking; the number stands at twelve

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-7-s` | dialogue | matter_of_fact | "That's me till the wood comes. Then the sixth batch." | 10 | The goodbye is a schedule again, held to even where the schedule has stopped helping. |

### Option `-a` — asks what to carry back next visit *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-7-a-p` | player_line | matter_of_fact | "What should I carry back next visit?" | 7 | — |
| `L-CH-T2-17-7-a-r1` | dialogue | matter_of_fact | "Yourself, and any spare pair of hands you pass." | 9 | Assigned again at full speed; hands and hours are the only currency left. |
| `L-CH-T2-17-7-a-r2` | dialogue | warm | "There'll be bread worth the walk." | 6 | The errand paid in advance, as always, so nothing about it can be owed. |

### Option `-b` — leaves the sheet as he had it *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-17-7-b-act` | action | quiet | **[action]** [Leave the sheet as he had it] | — | — |
| `L-CH-T2-17-7-b-r1` | dialogue | quiet | "Ta. It'll keep." | 3 | The sheet and its stuck number left in his keeping, received short. |
| `L-CH-T2-17-7-b-r2` | dialogue | warm | "Take the dry path past the well, cart's churned the lane." | 11 | The road home already scouted for the player, unasked and unremarked. |

*Records per graph: `-a` Trust; `-b` Intimacy. The fallback player exits through real content.*

---

## Notes for the gate

- **Slot count:** 70 rows — 45 `dialogue`, 11 `player_line`, 8 deed `action`, 5 spine/set-up `action` (one of which, `A-CH-T2-17-1-a-1-s`, **is** the child node's set-up per the approved graph), 1 `object`. Any single walk sees fewer: options fork, and nodes 3 and 4 open only on their gates.
- **No long run.** Barred by the brief; longest dialogue line is `L-CH-T2-17-1-a-1-a-1-s` at 18 words, under the 26-word threshold. The weight never moves into a longer line.
- **Rule-19 build** at node 6: `-s1` (4) → `A-CH-T2-17-6-s` → `-s2` (1). The weight beat's longest line is 4 words and the beat collapses to one.
- **Depth-2 nesting** per the approved graph: `-1-a` → child (set-up is the action slot) → `-1-a-1-a` → grandchild. The grandchild's `-b-r1` ("No.", 1 word) is the tempo floor of the thread — the sharpest read gets the shortest answer.
- **Receiving lines run 1–5 words** (`-1-b-r1`, `-1-a-1-b-r1`, grandchild `-b-r1`, `-3-a-r1`, `-3-c-r1`, `-4-a-r1`, `-6-b-r1`, `-7-b-r1`); outward and supplying lines run 6–12 and each names a thing: gloves, ladder, chalk, loaf, rake handle, kettle, dry path.
- **Bond categories:** Trust, Intimacy, Recognition only.
- **Gates as designed:** node 3 reads `count_is_turnout`, node 4 reads `starter_owed` — two facts, at R6's ceiling. Both refusal and loan-ranking land as depth, never as reroute; the fallback walk (nodes 1, 2, 5, 6, 7 plus children) delivers R3 whole.
- **Closed path unchanged:** never asking what changed at node 1 leaves without `sum_wont_close`; C4's node 2 stays shut. `ex-tally-sheet` (PROPOSED) is the pickup; `O-SC-T2-17-1` is its referent, shown at the opening as designed.
- **Equal weight held at node 3:** the cut-the-number suggestion is answered as a fair thought and a smaller job; refusing to take a piece at node 2 is never scolded, and `-2-a-r3` says so in the scene's own voice.
- **Inventions (guardrails check 12), codex checked first:** `prop` — the gloves by the wood pile (grandchild `-a-r2`); `prop` — the two ladders, short and tall (`L-CH-T2-17-2-b-r2`); `prop` — the chalk on the slate ledge (`L-CH-T2-17-3-c-r1` context, `-c-r2`); `prop` — the short-handled rake (`L-CH-T2-17-5-b-r2`); `world_fact` — the feast tables are stored in the hall loft (`L-CH-T2-17-2-b-r1`); `world_fact` — the ovens take six batches a day (`L-CH-T2-17-5-a-r1`; capacity is scene colour by the quantities ruling, the *existence* of a non-arithmetic limit is the fact). The lending household's over-payment items (`-4-b-r1`) extend C2's declared return, nothing new minted.
- **No accrual:** node 2's taken piece records one bond event once; nothing counts pieces or thresholds on them. The single `thread_move` rides `-1-a`.
- **Tone spread:** scene locks `matter_of_fact`; `quiet` and `warm` per slot, as in C1 and C2. The quiet beats cluster at nodes 1 and 6, where the sum is.
