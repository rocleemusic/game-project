# `toby-the-shelf` — C4 line slots · `SC-T2-11`

**Conversation:** C4, carries R3 (someone else has been repaid the same way). Ends open on the held breath.
**Structure source:** `../toby-the-shelf.md` § "C4 — `SC-T2-11`", approved by Roc 2026-08-06. Nothing structural altered.
**Rewritten 2026-08-06** against the measured register (`narrative-pipeline/register.md`, corpus `knowledge-base/dialogue-corpus/`). The previous pass predates the action layer and is not carried over in any part.
**Soul:** `toby` (`cast/toby.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Walk-on:** Marta. Walk-on band — warm, talkative, unguarded. No card, no thread, no facts.
**Staging:** the festival street. Toby's stall at the edge of the square, the crowd going past, stall canvas, the coin box, baskets, bread.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once.
**Slot ids:** set-up `L-<CHOICE_ID>-s` · player line `-p` · deed `-act` · responses `-r1/-r2/-r3`. Action/object slots keep the ids the thread doc gives them.

**ENTRY GATE — `knows(shelf_named)`.** Everyone here has already named the shelf to Toby's face in C2. No line plays the shelf as news.

**Reachable incoming states (two of four):**

- **deep** — `shelf_named` + `gave_unowed`. Walk: scene opening → node 1 → one band node → node 5.
- **fallback** — `shelf_named`, finished C3 without giving. Node 5 auto-skips. Walk ends at the band node, on the same open note.

Nodes 2/3/4 are one beat authored three ways, selected by `bond_band(toby)`. Exactly one plays.

---

## Scene opening — before node 1

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `O-SC-T2-11-1` | object | matter_of_fact | — | **[action]** Marta and Toby are in the bakery. A round loaf sits in Marta's basket, wrapped in brown paper, on top of the eggs she came out for. (20 w) |  | — |
| `A-SC-T2-11-1` | action | matter_of_fact | toby | **[action]** Toby wraps Marta's order while she talks, eyes on the string the whole time. (14 w) |  | Hands busy through the whole remark; the work is where he goes and he never says so. |

---

## `CH-T2-11-1` — Marta says it

Marta is warm and easy and has not thought about any of it. Her remark is the reveal; the player's pick is what gets done with it.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-11-1-s` | dialogue | warm | marta (walk-on) | "I found a loaf on my step Tuesday morning, still warm, such lovely surprise! You're always so thoughtful, what would we do without you?" |  | — |

*Marta is a walk-on: no `speaker_intent` row, no card to check her against. She is talkative on purpose.*

### Option `-a` — names it as a pattern, not a kindness *(spoken · move: `toby-the-shelf`)* — **receiving beat, 3 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-1-a-p` | player_line | matter_of_fact | "I know, Toby really know how to look out for people" |  | — |
| `L-CH-T2-11-1-a-r1` | dialogue | quiet | "I had a few left over." (4 w) |  | Attention comes onto him and the line drops to nothing. He is still facing her, still soft about it; what he is refusing is the size of the thing, not the person naming it. |
| `A-CH-T2-11-1-a-r2` | action | quiet | **[action]** Toby sets Marta's basket straight on the board and does not look up. |  | — |
| `A-CH-T2-11-1-a-r3` | action | quiet | **[action]** Toby turns to the coin box and lifts the lid. (9 w) |  | — |
| `L-CH-T2-11-1-a-r4` | dialogue | warm | "Your change from Tuesday. You were gone before I counted it out." (11 w) |  | Anticipation doing the answering. The one debt he can name is the player's coin, held ready, and he talks about the change instead of the loaf. |

### Option `-b` — lets the remark sit *(deed · bond: Intimacy)* — **receiving beat, 2 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-1-b-act` | action | quiet | **[action]** [Say nothing, and let Marta's words stay in the air] |  | — |
| `L-CH-T2-11-1-b-r1` | dialogue | matter_of_fact | "Marta, your eggs are down the side, I made sure they wouldn't get crushed." (12 w) |  | Fills the quiet by looking after the person in front of him. The care is in the detail he took the trouble over. |
| `A-CH-T2-11-1-b-r2` | action | quiet | **[action]** Toby turns from Marta and holds out a handful of cherries. (11 w) |  | — |
| `L-CH-T2-11-1-b-r3` | dialogue | warm | "First of the week. Off the morning cart." (8 w) |  | Sold as a small pleasure rather than as a gift, so no thanks can fasten to it. |

### Option `-c` — turns the talk to Marta's errand *(spoken · bond: Trust)* — 2 slots

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-1-c-p` | player_line | matter_of_fact | "What did you come out for, Marta?" (7 w) |  | — |
| `L-CH-T2-11-1-c-r1` | dialogue | matter_of_fact | Marta: "Eggs and the barley loaf, and I need to stop by Ilsa's to pickup a repair." (11 w) |  | Takes the offered way out fast and thankfully, and is a step ahead of the order as usual. |
| `L-CH-T2-11-1-c-r2` | dialogue | warm | Toby turns to you. "Walk her basket to the corner for me. It's more than she should carry." (14 w) |  | Hands the player a job and the two of them a way onward. Being useful together is the warmest room he knows how to stand in. |

---
## `CH-T2-11-2` — he handles it as accounts · gate `bond_band(toby) = low`

| slot id | slot_type | tone | text | W | speaker_intent | slot order |
|---|---|---|---|---|---|---|
| `A-CH-T2-11-2-s` | action | matter_of_fact | **[action]** Toby stacks the morning's coppers into a short column at the side of the board while he talks. (18 w) |  | Hands go to a count the moment the talk turns onto him. | before set-up |
| `L-CH-T2-11-2-s` | dialogue | matter_of_fact | "Her basket carried my starter across the square all spring. One loaf a month doesn't touch it." (17 w) |  | Being seen rerouted into arithmetic. He is not defending himself, he genuinely believes he is behind, and that belief is the fondness. | set-up |

### Option `-a` — asks what the player's own account stands at *(spoken · bond: Trust)* — **receiving beat, 3 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-2-a-p` | player_line | matter_of_fact | "And what does mine come to?" (6 w) |  | — |
| `L-CH-T2-11-2-a-r1` | dialogue | quiet | "Not worked out." (3 w) |  | The precision runs one way only. Asked about himself there is nothing counted, and he does not dress the gap up or wave the question off. |
| `L-CH-T2-11-2-a-r2` | dialogue | matter_of_fact | "That tray came out pale on one side. Seconds now, so eat them for me." (15 w) |  | Answers a question about himself by feeding the asker, and turns the gift into a favour done to him so it cannot be owed for. |
| `L-CH-T2-11-2-a-r3` | dialogue | warm | "Take two. You'll be out past the drum band." (9 w) |  | He has already worked out the player's evening. The care arrives as a fact about the festival, which is the only shape he can put it in. |

### Option `-b` — leaves the ledger closed *(deed · bond: Intimacy)* — **receiving beat, 2 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-2-b-act` | action | quiet | **[action]** [Set the coppers back in the tin and close the lid] |  | — |
| `L-CH-T2-11-2-b-r1` | dialogue | matter_of_fact | "Right." (1 w) |  | The count is taken out of his hands and he lets it go. One word, and it is agreement, not a shut door. |
| `L-CH-T2-11-2-b-r2` | dialogue | warm | "Stand in under the canvas if you're stopping." (8 w) |  | Somebody stayed, so he arranges where they stay. Comfort worked out in advance and handed over as a practical note. |

---

## `CH-T2-11-3` — he goes flat, finds a task, stays in the room · gate `bond_band(toby) = mid`

| slot id | slot_type | tone | text | W | speaker_intent | slot order |
|---|---|---|---|---|---|---|
| `A-CH-T2-11-3-s` | action | quiet | **[action]** Toby carries the crate two steps off and sorts tins facing the square. (13 w) |  | The deflection fires on time; the distance it buys is now two steps. | before set-up |
| `L-CH-T2-11-3-s` | dialogue | quiet | "Crowd builds soon. Tins first." (5 w) |  | A job named out loud so the talk can follow it. He stays where the player can reach him, which is the part he does not mention. | set-up |

*Both options at this node are deeds, per the approved graph.*

### Option `-a` — follows him into the task, works alongside *(deed · bond: Intimacy)* — **receiving beat, 3 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-3-a-act` | action | quiet | **[action]** [Carry the second crate down and sort tins beside him] |  | — |
| `L-CH-T2-11-3-a-r1` | dialogue | matter_of_fact | "Dented ones by your hand." (5 w) |  | Being joined is being received, so it goes short. It is a place made for the person, not a rule barked at them. |
| `L-CH-T2-11-3-a-r2` | dialogue | matter_of_fact | "Cheap after dark, that sort." (5 w) |  | Gives the work a shape they can both stand in, and takes the trouble to explain rather than leave the player guessing. |
| `L-CH-T2-11-3-a-r3` | dialogue | warm | "You're quicker at it. Leave me the bottom row." (9 w) |  | Warmth by redistribution. The moment somebody helps him he rebalances until the worse share is his again. |

### Option `-b` — holds position, lets him circle back *(deed · bond: Trust)* — **receiving beat, 3 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-3-b-act` | action | quiet | **[action]** [Stay at the stall and let him sort the tins] |  | — |
| `L-CH-T2-11-3-b-r1` | dialogue | quiet | "One minute." (2 w) |  | Flat and short with the attention still on him, and it is also a promise. He is not leaving the person, only the subject. |
| `L-CH-T2-11-3-b-r2` | dialogue | matter_of_fact | "Tins are done. Go on, you were talking." (8 w) |  | Comes back and hands the floor over instead of holding it. The job did its work and he can face the person again. |
| `L-CH-T2-11-3-b-r3` | dialogue | warm | "Spiced milk's warming two stalls down. I put a coin across for you when the tins started." (17 w) |  | The waiting was noticed and answered ahead of time; the coin is already spent, so refusing is no longer possible. |

---

## `CH-T2-11-4` — the reach starts and does not finish · gate `bond_band(toby) = high`

Rule-19 build: fragment → action → shorter fragment. The unfinished reach is the silence.

| slot id | slot_type | tone | text | W | speaker_intent | slot order |
|---|---|---|---|---|---|---|
| `L-CH-T2-11-4-s` | dialogue | quiet | "Crate's still to shift." (4 w) |  | The habit reaching for its usual exit. | set-up, fragment 1 |
| `A-CH-T2-11-4-s` | action | quiet | **[action]** Toby's hand goes out toward the crate, hangs there, and comes back empty. (13 w) |  | — | mid set-up |
| `L-CH-T2-11-4-s2` | dialogue | quiet | "It'll keep." (2 w) |  | Shorter than the first because the attention did not move off him. Nothing is explained and nothing is resolved. | set-up, fragment 2 |

### Option `-a` — marks the unfinished reach *(spoken · bond: Recognition)* — **receiving beat, 3 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-4-a-p` | player_line | quiet | "You didn't go this time." (5 w) |  | — |
| `L-CH-T2-11-4-a-r1` | dialogue | quiet | "Didn't." (1 w) |  | He answers the act and not the meaning of it, and builds nothing underneath. |
| `L-CH-T2-11-4-a-r2` | dialogue | quiet | "Wanted to hear the rest." (5 w) |  | The nearest he comes to saying why, and it is about the other person, which is the only way he can say it at all. |
| `L-CH-T2-11-4-a-r3` | dialogue | warm | "Your parcels went home with the carrier at noon. You're free for the rest of it." (16 w) |  | Care resumes on the one channel he has: the evening was cleared for the player before they knew they wanted it. |

### Option `-b` — gives him the room, says nothing of it *(deed · bond: Intimacy)* — 2 slots

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-4-b-act` | action | quiet | **[action]** [Turn toward the square and watch the crowd go past] |  | — |
| `L-CH-T2-11-4-b-r1` | dialogue | matter_of_fact | "Band comes down this way at dusk. You'll see it all from here." (13 w) |  | Supplies the person with the evening ahead of time, and gets to stand beside them while doing it. |
| `L-CH-T2-11-4-b-r2` | dialogue | warm | "That paper parcel by you is cheese. For the wait." (10 w) |  | Ends the beat by sending something out. The moment stays survivable so long as it closes with him having given. |

---

## `CH-T2-11-5` — the one gift he has not repaid yet

**Gate:** `knows(gave_unowed)`. Plays in the **deep** state only. Auto-skips in **fallback**, which ends the conversation at the band node on the same open note.

Rule-19 build: fragment → object → shortest fragment.

| slot id | slot_type | tone | text | W | speaker_intent | slot order |
|---|---|---|---|---|---|---|
| `L-CH-T2-11-5-s` | dialogue | quiet | "Brought the shelf out with me. Whole lot of it, for the day." (13 w) |  | Says what he did and not why, and the why is standing on the board between them. | set-up, fragment 1 |
| `O-CH-T2-11-5-s` | object | quiet | **[action]** The jars stand in a row at the back of the stall. The wool bundle sits at the end of the row, still tied. (13 w) |  | — | mid set-up |
| `L-CH-T2-11-5-s2` | dialogue | quiet | "That one's yours." (3 w) |  | Shortest line in the conversation. He names it and stops, because there is nothing after it he has worked out. | set-up, fragment 2 |

### Option `-a` — marks the one still unanswered *(spoken · bond: Recognition)* — **receiving beat, 3 slots**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-5-a-p` | player_line | quiet | "It's still wrapped." (3 w) |  | — |
| `L-CH-T2-11-5-a-r1` | dialogue | quiet | "It is." (2 w) |  | Confirms the fact plainly and confirms nothing else. |
| `L-CH-T2-11-5-a-r2` | dialogue | quiet | "Wool holds. It's not going anywhere." (6 w) |  | The repay reflex reaches, finds nothing ready, and he answers with a fact about the wrapping instead. Nothing closes and nothing is explained. |
| `L-CH-T2-11-5-a-r3` | dialogue | warm | "Your water skin's full. Did it while you were over at Marta's." (13 w) |  | The warmth he does have arrives anyway, and it deliberately happened earlier, so it cannot be read as the answer he has just said he does not have. The gift stays unrepaid. |

### Option `-b` — leaves it unspent *(deed · records nothing, deliberate)* — **receiving beat, 2 slots, closes on the object**

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-11-5-b-act` | action | quiet | **[action]** [Look at the row of jars and turn back to the square] |  | — |
| `L-CH-T2-11-5-b-r1` | dialogue | quiet | "Right." (1 w) |  | Nothing is asked of him and that is harder than being asked. One word, warm, and he lets the thing stand. |
| `O-CH-T2-11-5-b-r2` | object | quiet | **[action]** The bundle stays tied at the end of the row, and the crowd moves past the board. (16 w) |  | — |

**The conversation ends on `O-CH-T2-11-5-b-r2`. No line follows it.** Neither option repays the gift and neither names what the holding means. `-b` records nothing on purpose: a record here would cash the held breath the seam pass needs intact. The echo is not fired and nothing resolves; the payoff lives in the later Ilsa scene.

---

## Notes for the gate

**Marta is in the walk-on band.** Her one line is 29 words, easy and pleased and slightly over-shared, which is the point: she has nothing to hide, no deflection and no conviction, so she is the opposite of Toby on the same board. The previous pass wrote her clipped and that was the defect guardrail check 6 was amended to catch.

**No marked long run.** The thread doc considered and declined one (rule 20), and this pass agrees: the low-band recital is the only information-shaped candidate and it is built instead as two short pieces divided by `A-CH-T2-11-2-s`. Longest Toby dialogue slot here is 17 words. Every receiving beat is barred from a run in any case.

**Receiving pairs.** Every option where Toby is receiving carries at least two response slots, the first 1 to 5 words and flat, the second naming a thing already supplied. No option in the conversation has a single response.

**Slot legality.** Options `-1-b`, `-2-b`, `-3-a`, `-3-b`, `-4-b` and `-5-b` are unquoted in the graph and are authored as deeds: `slot_type: action`, id `-act`, no `player_line` row. `-3-a` is `Use`, the rest are `Converse` with a non-speech gist, per the 2026-08-06 ruling that the verb family names the arena and the quoting decides the modality.

**Ceilings.** player_line max 7. Toby dialogue max 17. Action max 18. Object max 21.

**What the structure could not carry.** Node 5's set-up spans three slots (fragment, object, fragment) and the graph shows only `O-CH-T2-11-5-s`; the two dialogue fragments are ids `-s` and `-s2` under the locked scheme. Same for node 4. If the Architect wants the second fragment to be its own graph node, that is a structure change, not a prose one.
