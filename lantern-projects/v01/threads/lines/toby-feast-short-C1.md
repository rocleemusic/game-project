# `toby-feast-short` — C1 line slots · `SC-T2-15`

**Conversation:** C1, first contact this thread. Carries R1 (the conversion: a shortfall becomes a quantity, a return date and an errand).
**Structure source:** `../toby-feast-short.md` § "C1 — `SC-T2-15`", graphs approved by Roc 2026-08-10. Nothing structural altered.
**Soul:** `toby` (`cast/toby.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. One sanctioned long run, 75 words, placed per the brief (below).
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Dialogue and player_line text in quotation marks; word counts in their own column (relaxed convention, 2026-08-09).
**Speaker for all `dialogue` slots:** `toby`. No walk-on. The neighbour whose starter was begged is never named, per the brief.
**Incoming state:** zero knowledge, the only state. Nothing gated; no per-state variants.
**Staging vocabulary:** the day restarted — the borrowed crock, ovens coming back up, trays, the slate at the counter, wood, flour, the well.

**Sanctioned long run: one, on `L-CH-T2-15-2-s` — node 2's set-up, marked below.** Information only: what is short, by how much, by when, who has what. He is not receiving in it, not thanked, not seen; not a payoff.

---

## Scene opening — before node 1

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-15-1` | object | matter_of_fact | **[action]** A starter crock stands on the bench among Toby's own, a different household's mark scored on the lid. The ovens are coming back up behind it. | 26 | — |

## `CH-T2-15-1` — the day restarted, ovens going again

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-1-s` | dialogue | matter_of_fact | "Ovens are back up. Lost the morning, so mind the trays, they're coming out close together." | 16 | Greets by handing over the room's state and a piece of its business, which is how he greets anyone. |

### Option `-a` — asks what the morning cost him *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-1-a-p` | player_line | matter_of_fact | "What did this morning cost you?" | 6 | — |
| `L-CH-T2-15-1-a-r1` | dialogue | quiet | "Nothing I'd count." | 3 | Asked about the cost to him, the answer goes short. The counting man declines to count this one. |
| `L-CH-T2-15-1-a-r2` | dialogue | matter_of_fact | "It got me a live starter. First batch proves by noon." | 11 | Answers with what the morning produced instead of what it cost — the deflection working at low load. |
| `L-CH-T2-15-1-a-r3` | dialogue | warm | "There's a heel of yesterday's loaf by the scales. It's yours." | 11 | The warmth arrives as a thing already set aside, and he never says when he set it there. |

### Option `-b` — takes up the nearest part of the work *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-1-b-act` | action | matter_of_fact | **[action]** [Take up the nearest tray and carry it to the rack] | — | — |
| `L-CH-T2-15-1-b-r1` | dialogue | quiet | "Ah, thanks. Rack's behind you." | 5 | Helped before he asked, he stays inside the work, the shortest place to stand. |
| `L-CH-T2-15-1-b-r2` | dialogue | warm | "Apron's on the peg, that shirt's too good for flour." | 10 | Levels the favour by anticipating the next small trouble before it lands on the helper. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-15-2` | action | matter_of_fact | **[action]** Toby counts along the shelf while his hands keep shaping loaves, the tally running over the top of the work. | 20 | — |

## `CH-T2-15-2` — the number said out loud — quantity, return date, next step

**The thread's one sanctioned long run (marked · `canon_flags` 8: logistics, arithmetic, instruction). Ceiling 75.**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-2-s` | dialogue | matter_of_fact | "Right, the count. Forty short if the whole square turns out. Starter takes ten off by tonight, first batch in at noon, second at four. Flour's in, wood's low, salt I can borrow off the stall. Crock goes back full by market day, that's fixed. So it's thirty by dark, and the wood wants fetching before the second bake or the ovens drop." | 63 | The gap broken into quantities, dates and next steps before it can be trouble. Pure information, delivered fast, no line in it about himself. **MARKED LONG RUN.** |

### Option `-a` — asks where the number comes from *(spoken · sets `count_is_turnout` · bond: Recognition · moves `toby-feast-short`)*

The answer is the nested child's set-up — he does not reply inside this option; the child is the reply.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-2-a-p` | player_line | matter_of_fact | "Where does forty come from?" | 5 | — |

### Option `-b` — asks what comes next instead *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-2-b-p` | player_line | matter_of_fact | "What comes next, then?" | 4 | — |
| `L-CH-T2-15-2-b-r1` | dialogue | matter_of_fact | "Wood, before the second bake." | 5 | The step handed over without its basis, because the step is what he is actually offering. |
| `L-CH-T2-15-2-b-r2` | dialogue | matter_of_fact | "Then salt off the stall, then the crock goes back." | 10 | The day laid out as a sequence, hands and talk both pointed outward. |
| `L-CH-T2-15-2-b-r3` | dialogue | warm | "First batch is out at noon if you're near." | 9 | An open door offered as a schedule fact, so nothing about it can be owed. |

*Records per graph: `-a` sets `count_is_turnout`, Recognition, moves the thread, then enters the nested child; `-b` Trust.*

---

## `CH-T2-15-2-a-1` (node 2 › option a › child 1) — the count is not an estimate; he names who it includes

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-2-a-1-s` | dialogue | matter_of_fact | "Off the square. I count who might turn out: the smith, the Hallow house, everyone down the row. Anyone standing there eats." | 22 | Answers the basis question with the basis, plainly — a fact about the count, stated to someone who asked, with nothing in it about why he counts that way. |

### Option `-a` — lets the count stand unquestioned *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-2-a-1-a-act` | action | matter_of_fact | **[action]** [Let the count stand] | — | — |
| `L-CH-T2-15-2-a-1-a-r1` | dialogue | matter_of_fact | "So forty it is." | 4 | The number closes back over and the day moves on behind it. |
| `L-CH-T2-15-2-a-1-a-r2` | dialogue | warm | "Second batch is yours to taste when it's out." | 9 | The company gets supplied, unasked, before the subject can change to anything owed. |

### Option `-b` — names that the count includes those who ordered nothing *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-2-a-1-b-p` | player_line | quiet | "You're counting people who ordered nothing." | 6 | — |
| `L-CH-T2-15-2-a-1-b-r1` | dialogue | quiet | "Yup." | 1 | Seen from outside, he confirms the fact and builds nothing under it. |
| `L-CH-T2-15-2-a-1-b-r2` | dialogue | quiet | "Order slate's one column. Square's the other." | 7 | Puts the habit back into furniture — two columns on a slate — so it stops being about him. |
| `L-CH-T2-15-2-a-1-b-r3` | dialogue | warm | "Mind your sleeve, the bench edge is floured." | 8 | The attention is still on him, so the warmth goes out sideways, onto the player's sleeve. |

*Records per graph: `-a` Intimacy; `-b` Recognition. The cast fact (`count_is_turnout`, PROPOSED) is delivered as what the count does, never as a trait he claims.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-15-3` | object | matter_of_fact | **[action]** The day's slate leans at the counter. The order tally runs down one side; a larger figure is written beside it and circled. | 23 | — |

## `CH-T2-15-3` — the errand handed over before anything can be said

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-3-s` | dialogue | matter_of_fact | "Wood run wants doing before four. It's cut and paid for, just wants carrying." | 14 | A job is in the air before the asking can be spoken of — the receive-beat converted into an errand for whoever is standing there. |

### Option `-a` — takes the errand *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-3-a-act` | action | matter_of_fact | **[action]** [Take the wood run] | — | — |
| `L-CH-T2-15-3-a-r1` | dialogue | matter_of_fact | "Good. Stack it by the far oven, split ends out." | 10 | An order to fill is the easiest thing anyone can hand him, and the instructions come at full speed. |
| `L-CH-T2-15-3-a-r2` | dialogue | warm | "There's a barrow round the side, save your back." | 9 | The helper's next trouble already solved, and he does not mention working it out. |

### Option `-b` — asks who else is carrying a piece of it *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-3-b-p` | player_line | matter_of_fact | "Who else is carrying a piece of this?" | 8 | — |
| `L-CH-T2-15-3-b-r1` | dialogue | matter_of_fact | "Salt comes off the stall. Hallow house proves two trays, their kitchen holds heat better than mine." | 17 | Other households accounted exactly, needs and reasons included — fluent the moment the subject is anyone else. |
| `L-CH-T2-15-3-b-r2` | dialogue | warm | "Warm end of the counter's yours if you're stopping." | 9 | Makes a place for the asker and makes it ordinary, so no thanks can attach. |

### Option `-c` — asks what happens if nobody takes it *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-3-c-p` | player_line | matter_of_fact | "What happens if nobody takes it?" | 6 | — |
| `L-CH-T2-15-3-c-r1` | dialogue | quiet | "Somebody takes it." | 3 | The question brushes the machinery and the answer flattens to a certainty he has never had to examine. |
| `L-CH-T2-15-3-c-r2` | dialogue | matter_of_fact | "And if they don't, I'll fetch it between bakes." | 9 | The fallback is himself, stated as scheduling, and the day keeps moving. |

*Records per graph: `-a` Intimacy; `-b` Trust; `-c` Recognition. Refusing the errand is not scolded — the fallback is authored into `-c` and the day goes on.*

---

## `CH-T2-15-4` — the return named in advance *(the weight beat — rule-19 build)*

Fragment → action → shorter fragment. The weight is in the silence between them; no line here gets longer.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-4-s1` | dialogue | quiet | "Goes back full. Market day." | 5 | The string attached before anyone can call the starter a gift. Stated as arithmetic, because that is what it is to him. |
| `A-CH-T2-15-4-s` | action | quiet | **[action]** Toby writes the return day on the slate and sets the crock beside it. | 14 | — |
| `L-CH-T2-15-4-s2` | dialogue | quiet | "That's settled, then." | 3 | Closes the loan as a line item so it can never sit anywhere as a favour. |

### Option `-a` — marks that he said the return before thanks *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-4-a-p` | player_line | quiet | "You named the return before you said thanks." | 8 | — |
| `L-CH-T2-15-4-a-r1` | dialogue | quiet | "Suppose I did." | 3 | Seen in the act, he concedes the surface and offers nothing under it. |
| `L-CH-T2-15-4-a-r2` | dialogue | quiet | "Full crock, market day. It's on the slate." | 8 | Repeats the fact in place of the reason. The slate can hold what he cannot. |
| `L-CH-T2-15-4-a-r3` | dialogue | warm | "Mind the step going out, flour makes it slick." | 9 | The footing he lost comes back as care for somebody else's footing. |

### Option `-b` — sets the crock where he will want it next *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-4-b-act` | action | quiet | **[action]** [Set the crock where he will want it next] | — | — |
| `L-CH-T2-15-4-b-r1` | dialogue | quiet | "That's the spot." | 3 | His own move aimed back at him; he takes it, and the taking is three words long. |
| `L-CH-T2-15-4-b-r2` | dialogue | warm | "Batch after this one's the seed. I'll cut you the end." | 11 | The favour is levelled inside the same minute, so the ledger never opens. |

*Records per graph: `-a` Recognition; `-b` Intimacy.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-15-5` | action | matter_of_fact | **[action]** The next tray goes in and the oven door swings shut ahead of the talk. | 15 | — |

## `CH-T2-15-5` — leave-taking, the day's work ahead of him

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-5-s` | dialogue | matter_of_fact | "That's me till dark. Second bake, then the count again." | 10 | The goodbye is a schedule, and the schedule is his. |

### Option `-a` — leaves him to the ovens *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-5-a-act` | action | matter_of_fact | **[action]** [Leave him to the ovens] | — | — |
| `L-CH-T2-15-5-a-r1` | dialogue | matter_of_fact | "Mind how you go. Square's filling up." | 7 | Sends the player out with the state of the world, the same way they were greeted. |
| `L-CH-T2-15-5-a-r2` | dialogue | warm | "Door sticks, give it a shoulder." | 6 | One last small trouble solved in advance, unremarked. |

### Option `-b` — asks what to bring back next visit *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-15-5-b-p` | player_line | matter_of_fact | "What should I bring back next time?" | 7 | — |
| `L-CH-T2-15-5-b-r1` | dialogue | matter_of_fact | "Yup, now you're talking. Salt, if the stall still has coarse." | 11 | Being asked to assign is the easiest gift in the room, and the speed of the answer says so. |
| `L-CH-T2-15-5-b-r2` | dialogue | warm | "And yourself, around a mealtime. Bread's best warm." | 8 | The invitation rides on a fact about bread, so it costs the player nothing to accept. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## Notes for the gate

- **Slot count:** 40 rows — 27 `dialogue`, 4 `player_line` + 4 more (8 total), 5 deed `action`, 3 spine/set-up `action`, 2 `object`. Any single walk sees fewer (options fork).
- **Marked long run:** `L-CH-T2-15-2-s`, 63 words, the thread's only one. Information (quantities, dates, who has what); he is not receiving, thanked or seen in it; not a payoff. Nothing else in the file exceeds 26 words except the child set-up at 22.
- **Rule-19 build** at node 4: `-s1` (5) → `A-CH-T2-15-4-s` → `-s2` (3). The weight beat's longest line is 5 words.
- **Receiving lines run 1–5 words** (`-1-a-r1`, `-1-b-r1`, `-2-a-1-b-r1`, `-4-a-r1`, `-4-b-r1`); outward and supplying lines run 8–17 and each names a thing: heel of loaf, apron, barrow, counter end, slate, step, seed end, door.
- **The supply move is varied:** a heel set aside, an apron, a barrow, a warm counter end, a cut end promised, a sticking door — no two built the same way.
- **Bond categories:** Trust, Intimacy, Recognition only (Respect retired 2026-08-10; the graph already carried only the three).
- **Closed path unchanged:** never picking `-2-a` leaves without `count_is_turnout`; C3's node 3 stays shut. `ex-order-slate` (PROPOSED) is the pickup; `O-SC-T2-15-3` is its referent, shown before node 3 as designed.
- **Inventions (guardrails check 12), codex checked first:** `prop` — the barrow round the side (`L-CH-T2-15-3-a-r2`). `world_fact` — two feast arrangements on existing codex entries: the stall covers the salt, the Hallow house proves two trays (`L-CH-T2-15-3-b-r1`; reused in C2/C4 for continuity). The lending household stays unnamed; "the row" is staging, not geography.
- **No accrual:** no repeatable option, no counter; the single `thread_move` rides `-2-a`.
- **Tone spread:** scene locks `matter_of_fact`; `quiet` and `warm` appear per slot, same as the shelf files — the register-lock question stays flagged there, not resolved here.
