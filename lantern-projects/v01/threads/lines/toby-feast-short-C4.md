# `toby-feast-short` — C4 line slots · `SC-T2-18`

**Conversation:** C4, the close. Carries nothing new — re-touch of R1 at rest. Festival eve: the number holds, because a scatter of other people did things, in pieces, at different times.
**Structure source:** `../toby-feast-short.md` § "C4 — `SC-T2-18`", graphs approved by Roc 2026-08-10 (divert sanctioned 2026-08-09). Nothing structural altered.
**Soul:** `toby` (`cast/toby.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. **No long run — barred by the brief: how it held is a beat he gets shorter at.**
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Dialogue and player_line text in quotation marks; word counts in their own column (relaxed convention, 2026-08-09).
**Speaker for all `dialogue` slots:** `toby`. No walk-on; the people whose pieces closed the number stay offstage and unnamed.
**Incoming states:** four — node 2 opens on `knows(sum_wont_close)`, node 3 on `knows(starter_owed)`; a false gate auto-skips. C4 sets no flag and records no `thread_move`.
**The constraint the whole file holds:** no line credits the player with the feast holding, whatever they carried across the week. The close is other people's pieces, and he is already past the count and onto tomorrow.
**Staging vocabulary:** the stacks by the door, the wrappings, tomorrow's first batch, the crock tied for the walk, the broom, the lantern.

---

## Scene opening — before node 1

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-18-1` | object | matter_of_fact | **[action]** The feast count stands met by the door: stacked and covered, tied in half a dozen different knots, no two wrappings alike. | 22 | — |
| `A-SC-T2-18-1` | action | matter_of_fact | **[action]** Toby is already shaping tomorrow's first batch, his back to the finished stacks. | 13 | — |

## `CH-T2-18-1` — festival eve: the number holds and he is past it

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-1-s` | dialogue | matter_of_fact | "Count's met. Mind the stacks. It's tomorrow's bread wants doing now." | 11 | The week's question answered in two words and left behind in the same breath. |

### Option `-a` — asks how it closed *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-1-a-p` | player_line | matter_of_fact | "How did it close?" | 4 | — |
| `L-CH-T2-18-1-a-r1` | dialogue | matter_of_fact | "Stall covered the salt. Hallow house proved two trays. The last few came a loaf at a time, all different doors." | 21 | The whole ledger of other people's pieces, fluent and exact, with no line in it for the player's own, whatever they did. |
| `L-CH-T2-18-1-a-r2` | dialogue | matter_of_fact | "Nobody did the lot. Everybody did a bit." | 8 | The shape of the close stated as plain fact; the one arithmetic he will not do out loud is anyone's total, including the player's. |
| `L-CH-T2-18-1-a-r3` | dialogue | matter_of_fact | "Anyways. Tomorrow's bread starts tonight." | 5 | Past the count before the count can be looked at, and onto the next number. |

### Option `-b` — takes up the loading of the trays *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-1-b-act` | action | matter_of_fact | **[action]** [Take up the loading of the trays] | — | — |
| `L-CH-T2-18-1-b-r1` | dialogue | matter_of_fact | "Heavy trays ride bottom shelf." | 5 | The eve's work shared gets instructions, same as any other night. |
| `L-CH-T2-18-1-b-r2` | dialogue | warm | "Supper's on the shelf under the counter. Eat first." | 9 | The helper fed before the helping; the plate was there before they arrived. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

## `CH-T2-18-2` — counting never closed it *(gated `knows(sum_wont_close)` — auto-skips when false)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-2-s` | dialogue | matter_of_fact | "Sheet's done with. It can go for kindling now." | 9 | The tool that stopped working retired without ceremony, its stopping never mentioned. |

### Option `-a` — marks that counting never closed it *(spoken · bond: Recognition · **diverts to `CH-T2-18-5`** — the closing weight beat, rule-19 build)*

Player line → short flat fragment → action → shortest fragment, then the divert. The collapse of the visit lives in the action slot.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-2-a-p` | player_line | quiet | "The counting never closed it, did it?" | 7 | — |
| `L-CH-T2-18-2-a-r1` | dialogue | quiet | "No. It didn't." | 3 | The truest thing anyone says to him all week, conceded flat and whole. |
| `A-CH-T2-18-2-a-r` | action | quiet | **[action]** Toby goes still. Then he takes the broom from the corner and starts on the far floor. | 17 | — |
| `L-CH-T2-18-2-a-r2` | dialogue | quiet | "Floor, then." | 2 | On the one night with no unfinished task standing ready, his deflection has to go and find one. |

> **DIVERT — per the approved graph (sanctioned 2026-08-09 — Roc).** `-a` rejoins at `CH-T2-18-5`; nodes 3 and 4 do not play on this path. The diverted player still reaches the close and carries the conversation's deepest record.

### Option `-b` — lets the arithmetic have been the answer *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-2-b-act` | action | quiet | **[action]** [Let the arithmetic have been the answer] | — | — |
| `L-CH-T2-18-2-b-r1` | dialogue | matter_of_fact | "Kindling it is, then." | 4 | The sheet closed with the player's leave, and the moment passes inside the room. |
| `L-CH-T2-18-2-b-r2` | dialogue | warm | "It was good paper. Wrote both sides." | 7 | A small joke laid on the week's stuck sum, which is as near as he comes to naming it. |

*Records per graph: `-a` Recognition, then the divert; `-b` Intimacy.*

---

## `CH-T2-18-3` — the return is bigger than the loan *(gated `knows(starter_owed)`, non-divert path — auto-skips when false)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-18-3` | object | matter_of_fact | **[action]** The crock waits by the door, filled past its own mark, the lid tied down for the walk. | 18 | — |
| `L-CH-T2-18-3-s` | dialogue | matter_of_fact | "Crock goes home first thing. Before the feast, not after." | 10 | The loan's closing ranked ahead of his own festival, stated as scheduling. |

### Option `-a` — marks that the return is bigger than the loan *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-3-a-p` | player_line | quiet | "It's fuller than when it came." | 6 | — |
| `L-CH-T2-18-3-a-r1` | dialogue | quiet | "Bit over, maybe." | 3 | The over-payment conceded as a rounding error. |
| `L-CH-T2-18-3-a-r2` | dialogue | quiet | "Full's a matter of opinion." | 5 | The measurable fact fogged on purpose, so the string stays paid and unremarked. |
| `L-CH-T2-18-3-a-r3` | dialogue | warm | "Loaf's going with it. That's just manners." | 7 | The extra gift mislabelled as custom in the same breath it is admitted, so no thanks can attach at either end. |

### Option `-b` — sets the crock ready by the door *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-3-b-act` | action | matter_of_fact | **[action]** [Set the crock ready by the door] | — | — |
| `L-CH-T2-18-3-b-r1` | dialogue | quiet | "Ta. Mind the lid." | 4 | Help with the loan's last step received short, eyes on the crock. |
| `L-CH-T2-18-3-b-r2` | dialogue | warm | "Come first thing if you like. It carries better with two." | 11 | The walk offered as a fact about carrying, so accepting it costs nothing. |

*Records per graph: `-a` Recognition; `-b` Intimacy.*

---

## `CH-T2-18-4` — the eve's own work: the ovens start before light *(non-divert path)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-4-s` | dialogue | matter_of_fact | "Ovens light before the sun does. Tonight's for setting up tomorrow." | 11 | Festival eve treated as the night before a working morning, which is what it is to him. |

### Option `-a` — asks what still needs doing tonight *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-4-a-p` | player_line | matter_of_fact | "What still needs doing tonight?" | 5 | — |
| `L-CH-T2-18-4-a-r1` | dialogue | matter_of_fact | "Bench cleared, wood in, dough set to rise. Then sleep, they tell me." | 13 | The night listed as jobs, with sleep filed as somebody else's advice. |
| `L-CH-T2-18-4-a-r2` | dialogue | warm | "Take the wood in with me and we're done sooner." | 10 | The asking answered with a place in the work, offered, never owed. |

### Option `-b` — clears the bench for the morning *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-4-b-act` | action | matter_of_fact | **[action]** [Clear the bench for the morning] | — | — |
| `L-CH-T2-18-4-b-r1` | dialogue | matter_of_fact | "Scraper hangs on the left nail." | 6 | The work joined gets its tools pointed out and nothing else. |
| `L-CH-T2-18-4-b-r2` | dialogue | warm | "That's the morning half-made already." | 5 | The evening's help valued in the only currency he trusts: what it does for tomorrow. |

### Option `-c` — marks that he is already counting tomorrow *(spoken · bond: Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-4-c-p` | player_line | quiet | "You're already counting tomorrow." | 4 | — |
| `L-CH-T2-18-4-c-r1` | dialogue | quiet | "Yup." | 1 | Seen mid-habit, he confirms the fact and builds nothing under it. |
| `L-CH-T2-18-4-c-r2` | dialogue | matter_of_fact | "Morning bread doesn't care what night it is." | 8 | The habit handed to the bread to explain, so it stops being about him. |

*Records per graph: `-a` Trust; `-b` Intimacy; `-c` Recognition. This node is the fallback state's deep beat — three full options, no apology.*

---

## `CH-T2-18-5` — leave-taking on the eve *(gather point and divert target)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T2-18-5-s` | action | quiet | **[action]** Toby is mid-job when the player reaches him, the broom working the far corner. | 14 | Diverted entry only — the non-divert path arrives without it. |
| `L-CH-T2-18-5-s` | dialogue | matter_of_fact | "That's the eve, then. Off you go while there's light." | 10 | The goodbye sends the player toward their own evening; his stays a work night. On the diverted entry the line comes flat, warmth intact. |

### Option `-a` — leaves him the job *(deed · bond: Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-5-a-act` | action | quiet | **[action]** [Leave him the job] | — | — |
| `L-CH-T2-18-5-a-r1` | dialogue | quiet | "Night." | 1 | The job left in his hands, the parting one word; on the diverted path this is the flat state carried gently. |
| `L-CH-T2-18-5-a-r2` | dialogue | warm | "Lantern by the door's lit. Lane's black past the well." | 10 | The last supply of the thread: the road home lit before the player thought to ask. |

### Option `-b` — asks him to keep a place at the table *(spoken · bond: Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-18-5-b-p` | player_line | warm | "Keep me a place at the table tomorrow." | 8 | — |
| `L-CH-T2-18-5-b-r1` | dialogue | warm | "Done. End seat, near the bread." | 6 | Asked to give, he gives instantly and in specifics — the thread closes on him supplying somebody, not on him being thanked. |
| `L-CH-T2-18-5-b-r2` | dialogue | warm | "Come hungry." | 2 | The invitation's whole weight in two words; the feast will say the rest. |

*Records per graph: `-a` Intimacy; `-b` Trust. Nothing here closes the arc question, fires `toby-unopened-jam`, or moves the shelf.*

---

## Notes for the gate

- **Slot count:** 45 rows — 29 `dialogue`, 6 `player_line`, 5 deed `action`, 3 spine/set-up `action`, 2 `object`. Any single walk sees fewer: options fork, nodes 2 and 3 gate, and the divert skips nodes 3 and 4.
- **No long run.** Longest dialogue line is `L-CH-T2-18-1-a-r1` at 21 words, under the 26-word threshold. The thread ships exactly one marked run, in C1.
- **Rule-19 build** at node 2 option `-a`: player line (7) → `-r1` (3) → `A-CH-T2-18-2-a-r` → `-r2` (2), then the divert. The visit's collapse is in the action slot; the longest spoken piece of the beat is 3 words.
- **No player credit — the file's governing constraint, held in three places:** `-1-a-r1` lists the close as the stall, the Hallow house and unnamed doors, with no player line item authored for any incoming state; `-1-a-r2` states the shape ("nobody did the lot") without ranking anyone; `O-SC-T2-18-1` carries the several-hands fact in the picture (six knots, no two wrappings alike) so no line has to announce it. Nothing reads bond, flags or prior picks to warm the close.
- **He is past the count throughout:** `A-SC-T2-18-1` (back to the stacks, hands in tomorrow's batch) before the first line; `-1-a-r3` ("Anyways. Tomorrow's bread starts tonight."); node 4's set-up; `-4-c` confirms it when named.
- **Receiving lines run 1–5 words** (`-2-a-r1`, `-3-a-r1`, `-3-b-r1`, `-4-c-r1`, `-5-a-r1`); supplying lines run 6–11 and each names a thing: supper under the counter, the wood, the scraper, the crock walk, the end seat, the lantern.
- **Bond categories:** Trust, Intimacy, Recognition only.
- **Gates as designed:** node 2 reads `sum_wont_close`, node 3 reads `starter_owed` — two facts, at R6's ceiling. Both are depth, never reveal; the fallback walk (1 → 4 → 5) gets three full beats including the three-option node.
- **Divert as drawn:** `-2-a` rejoins at node 5 only; `A-CH-T2-18-5-s` plays on the diverted entry only, and node 5's set-up and both options are written to carry both entries (flat on the diverted one, warmth intact).
- **Inventions (guardrails check 12), codex checked first:** `prop` — the broom in the corner (`A-CH-T2-18-2-a-r`, `A-CH-T2-18-5-s`); `prop` — the lantern by the door (`L-CH-T2-18-5-a-r2`); `prop` — the bench scraper on the left nail (`L-CH-T2-18-4-b-r1`). The stall salt and Hallow trays reuse C1's declared arrangements; the loaf riding with the crock extends C2's declared return. The people behind the other doors stay unnamed and uncounted, per the brief.
- **No accrual, the thread's hardest instance:** C4 sets no flag, records no `thread_move`, and no response varies by how much the player did across C1–C3. Bond events only.
- **Tone spread:** scene locks `matter_of_fact`; `quiet` and `warm` per slot. The warm cluster sits at node 5 option `-b` by design — the close lands on him giving.
