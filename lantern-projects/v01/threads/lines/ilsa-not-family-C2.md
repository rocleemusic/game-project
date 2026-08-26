# `ilsa-not-family` — C2 line slots · `SC-T4-12`

**Conversation:** C2, the family occasion. Carries R2 (the guest's place is laid at once, and laid last — and the guest is the player, brought by Juno; re-specced by Roc 2026-08-09). The old argument runs and resolves nothing.
**Structure source:** `../ilsa-not-family.md` § "C2 — `SC-T4-12`", Choice designer 2026-08-09, **graphs approved by Roc 2026-08-10**. Nothing structural altered.
**Souls:** `ilsa` (`cast/ilsa.md`) and `juno` (`cast/juno.md`, texture — band 7–12 words, warmth as claim). Written from `essence_descriptor` and `voice_register` only, plus `register.md` and the codex. Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts in their own column.
**Dialogue speakers:** marked per section — the argument's spoken side is Juno's throughout; Ilsa's side is where things go. No walk-on anywhere in C2.

**Incoming states:** two — `pip_place_seen` (deep: all seven nodes) and fallback (node 2 auto-skips at its gather; the path rule 4 requires, no negated gate). **Every slot below is identical on both walks; no per-state variants required.**

**Staging vocabulary:** the yard cleared for the eve — bench, boards, bowls, the pot, bread, the yard gate. Reused from `world:ilsas-forge` and the earlier Ilsa line files except the declared inventions below. Sella, Wick and Haf are `offstage:juno-household` (proposed, reused as drafted); the winter ferry is `world:winter-ferry`.

**Sanctioned long run:** none placed. Barred throughout this thread (rule 20), and this is the conversation where it would tempt most; no household history, no parent, no date on the table anywhere.

**Her uptake move** (register's move 3, her version): she acknowledges by *placing*. No question mark in any Ilsa line. **Node 3 is the thread's weight beat and the one place her grammar fails:** the sentence that would have to explain the order starts and does not finish (`L-CH-T4-12-3-a-r1`), nothing sharpens, nothing speeds up, and nothing fills the gap — a pause, never a chill. Every other Ilsa sentence in C2 completes.

**Weight-node set-up:** node 3 has no spoken set-up — its set-up is `A-CH-T4-12-3-s`, because the laying is a thing she does and never mentions (check 8). The place is laid at once, before the argument, and no slot anywhere gives her a beat of hesitation over the player.

---

## Scene opening

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-12-1` | object | matter_of_fact | **[action]** The yard is cleared for the eve. The bench is laid down its length, the places set in one order, the count of them settled before anyone arrives. | 28 | — |
| `A-CH-T4-12-1-s` | action | matter_of_fact | **[action]** Juno comes through the gate with a basket on one arm and the player on the other, and walks them into the middle of the yard, in front of everyone. | 30 | — |

## `CH-T4-12-1` — brought to the eve as Juno's guest

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-1-s` | dialogue | warm | "Here's mine. I asked them, so they're eating with us." | 10 | Juno — the claim spoken in the kin-word, in public, left standing; asking them was her doing and she puts it on record without explaining it. |

### Option `-a` — greets Ilsa at her own bench *(spoken · Trust · responses spoken by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-1-a-p` | player_line | matter_of_fact | "Evening, Ilsa. Juno wouldn't take no." | 6 | — |
| `L-CH-T4-12-1-a-r1` | dialogue | matter_of_fact | "So I see. Bread's still to come down." | 8 | Acknowledges the arrival and answers it the way she answers everything, with the state of the work. |
| `L-CH-T4-12-1-a-r2` | dialogue | matter_of_fact | "You're on that. Both arms." | 5 | The greeter ends up placed in the eve's work at once; inclusion as assumption, not welcome. |

### Option `-b` — takes up the last of the carrying with Juno *(deed · Intimacy · first response spoken by `juno`, second by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-1-b-act` | action | matter_of_fact | **[action]** [Take up the last of the carrying with Juno.] | — | — |
| `L-CH-T4-12-1-b-r1` | dialogue | warm | "Mind the crock. It only comes out for these." | 9 | Juno — hands over the good thing as a fact of the occasion; being trusted with it is the claim continuing. |
| `L-CH-T4-12-1-b-r2` | dialogue | matter_of_fact | "Middle of the bench. It goes down first." | 8 | The carried thing gets its place in the order, stated as already decided. |

### Option `-c` — lets the kin-word stand without answering it *(deed · Intimacy · response spoken by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-1-c-act` | action | matter_of_fact | **[action]** [Let the word stand, and go on into the yard.] | — | — |
| `L-CH-T4-12-1-c-r1` | dialogue | matter_of_fact | "Boards go down before anyone sits." | 6 | The eve proceeds; the word her sister used is not taken up and not corrected, because the work is where her answers live. |

*Records per graph: `-a` Trust; `-b` Intimacy; `-c` Intimacy. Nobody corrects Juno's kin-word and Juno explains it to nobody.*

---

## `CH-T4-12-2` — the laid bench read with the order known *(gated `knows(pip_place_seen)`; unset, the node auto-skips to its gather)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-2-s` | dialogue | matter_of_fact | "Dishes go down the order. Start that end." | 8 | The eve's serving run as the standing order it always is; the order is worked, never explained. |

### Option `-a` — marks that the boy's place is in the order tonight too *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-2-a-p` | player_line | matter_of_fact | "The boy's place is laid tonight too." | 7 | — |
| `L-CH-T4-12-2-a-r1` | dialogue | matter_of_fact | "It is. He's in after his round." | 7 | The fact confirmed flat and turned into an arrangement; nothing about the place is counted as anything. |
| `L-CH-T4-12-2-a-r2` | dialogue | matter_of_fact | "Set the jug by it." | 5 | The marker ends up tending the very place they marked; attention on the order converts into work inside it. |

### Option `-b` — helps carry the last things down the bench-side *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-2-b-act` | action | matter_of_fact | **[action]** [Help carry the last things down the bench-side.] | — | — |
| `L-CH-T4-12-2-b-r1` | dialogue | matter_of_fact | "Down the line as they come." | 6 | The help absorbed as arranged; the order does the directing. |

*Records per graph: `-a` Recognition; `-b` Intimacy. Reference beat, no new fact; neither option touches the player's own place, which is not yet laid.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T4-12-3-s` | action | quiet | **[action]** Ilsa is already at the house shelf. She comes back with plate and cup, lays the player a place at the end of the row, and goes on with the eve. | 31 | — |

## `CH-T4-12-3` — the place laid last *(the thread's weight beat — rule 19; no spoken set-up)*

### Option `-a` — marks where their own place went *(spoken · sets `guest_place_last` · Recognition · moves `ilsa-not-family` · response spoken by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-3-a-p` | player_line | quiet | "My place went on after the others." | 7 | — |
| `L-CH-T4-12-3-a-r1` | dialogue | quiet | "It went on last. The order's..." | 6 | The fact confirmed flat — and then the clause that would have to explain the order starts and never finishes, because she has no sentence for it. Not sharpened, not sped up, not filled. |
| `A-CH-T4-12-3-a-r` | action | quiet | **[action]** Ilsa straightens the added place a finger's width, and turns back to the eve. | 14 | — |

*No closing fragment. The silence stands as the last beat of the option, per the content block.*

### Option `-b` — takes the place she laid and lets the arrangement stand *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-3-b-act` | action | quiet | **[action]** [Take the place she laid, and let it stand.] | — | — |

*The run closes on the set-up act with the arrangement unremarked — no response slot follows, per the content block. Records per graph: `-a` sets `guest_place_last`, Recognition, moves the thread; `-b` Intimacy.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T4-12-4-s` | action | matter_of_fact | **[action]** The two of them take up their positions somewhere between the pot and the bench, at the pace of a thing done many times. The eve's work does not stop. | 30 | — |

## `CH-T4-12-4` — the old argument, re-run in about ninety seconds

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-4-s` | dialogue | warm | "Sella came off the winter ferry with nobody. Now she's somebody's sister." | 12 | Juno — her side of the forty-year argument, made the only way she makes it: a person claimed, a beginning on record, no thesis stated and no sister diagnosed. |

### Option `-a` — stays where they are and takes it in *(deed · Intimacy · first response spoken by `juno`, second by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-4-a-act` | action | matter_of_fact | **[action]** [Stay where you are and take it in.] | — | — |
| `L-CH-T4-12-4-a-r1` | dialogue | warm | "Wick came for one harvest. That's nineteen years ago." | 9 | Juno — exact about a beginning, as always; the length of the staying is her whole case, and she rests it warmly. |
| `L-CH-T4-12-4-a-r2` | dialogue | matter_of_fact | "Pot's ready. Bowls go down." | 5 | Her side of the argument, entire: where things go. The point is answered by the eve continuing in its order, and the argument ends where it always ends. |

### Option `-b` — asks Juno how she came to ask them *(spoken · Trust · response spoken by `juno` · opens the nested child)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-4-b-p` | player_line | matter_of_fact | "How did you come to ask me?" | 7 | — |
| `L-CH-T4-12-4-b-r1` | dialogue | warm | "I can tell you the day, even." | 7 | Juno — a chosen bond has a date, and offering the date is her proof it is real. |

### Option `-c` — keeps the eve's work moving through it *(deed · Trust · first response spoken by `ilsa`, second by `juno`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-4-c-act` | action | matter_of_fact | **[action]** [Keep the eve's work moving through it.] | — | — |
| `L-CH-T4-12-4-c-r1` | dialogue | matter_of_fact | "Bowls next. Big pot last." | 5 | The work run on through the argument; the helper is inside the order and the order is her answer. |
| `L-CH-T4-12-4-c-r2` | dialogue | warm | "Haf's been my brother thirty years. Ask him where from." | 10 | Juno — the standing joke of her table offered mid-argument: the brother nobody can source, claimed anyway, which is the argument made laughing. |

*Records per graph: `-a` Intimacy; `-b` Trust, then the nested child; `-c` Trust. Neither woman addresses the player during the argument.*

---

## `CH-T4-12-4-b-1` — Juno names the day *(nested inside `-4-b`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-4-b-1-s` | dialogue | warm | "The second morning of the week, at my gate. I knew then." | 12 | Juno — the day named exactly, which is her stance carrying its own weight: a bond with a beginning is a bond that can be dated, and she pays that price on record. |

### Option `-a` — lets the placement stand *(deed · Intimacy · response spoken by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-4-b-1-a-act` | action | matter_of_fact | **[action]** [Let the placement stand.] | — | — |
| `L-CH-T4-12-4-b-1-a-r1` | dialogue | matter_of_fact | "Juno. Your bowl's going cold." | 5 | The point answered by putting somebody somewhere — her sister, seated and fed — and not answered in words. The argument ends where it always ends. |

### Option `-b` — asks Juno to finish what she was saying *(spoken · Trust · first response spoken by `juno`, second by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-4-b-1-b-p` | player_line | matter_of_fact | "Finish what you were saying." | 5 | — |
| `L-CH-T4-12-4-b-1-b-r1` | dialogue | warm | "You waved first. That was the whole of it." | 9 | Juno — finishes it warmly, on record, and the whole of it is small on purpose; nothing about the eve changes. |
| `L-CH-T4-12-4-b-1-b-r2` | dialogue | matter_of_fact | "Bread's going round. Take some past her." | 7 | The eve keeps its order through the finishing; the listener is placed back inside the work. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-12-5` | object | matter_of_fact | **[action]** The bench runs full. The places sit in their order, one more added at the end, and the food goes down the whole length of it without a seam. | 29 | — |

## `CH-T4-12-5` — the eve proceeds; the player is included in everything

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-5-s` | dialogue | matter_of_fact | "Pass the big loaf down when it reaches you." | 9 | The player at the added end is inside the eve's traffic like everyone else; the sentence assumes it and nothing marks it. |

### Option `-a` — passes things back down the bench from the added end *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-5-a-act` | action | matter_of_fact | **[action]** [Pass things back down the bench from the added end.] | — | — |
| `L-CH-T4-12-5-a-r1` | dialogue | matter_of_fact | "That's it. Butter follows the bread." | 6 | The passing folded into the order; the added end is simply an end of the bench now. |
| `L-CH-T4-12-5-a-r2` | dialogue | warm | "Keep it moving. There's plenty." | 5 | The plenty stated as fact; the feeding is the warmth and none of it is named. |

### Option `-b` — asks Ilsa something ordinary about the work *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-5-b-p` | player_line | matter_of_fact | "What goes on the fire tomorrow?" | 6 | — |
| `L-CH-T4-12-5-b-r1` | dialogue | matter_of_fact | "Hinges, and the gate braces. Small work." | 7 | Answered as she would answer anyone at her bench, plainly and whole. |
| `L-CH-T4-12-5-b-r2` | dialogue | matter_of_fact | "You're on files for it." | 5 | The answer ends in a placement, per her grammar; tomorrow already has the player in it. |

*Records per graph: `-a` Intimacy; `-b` Trust. This node is the state the close plays inside; nothing after it takes the inclusion back.*

---

## `CH-T4-12-6` — close — Juno says her thing once more; nothing resolves

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-6-s` | dialogue | warm | "I'll take mine home with me, then. Good eve, Ilsa." | 10 | Juno — the kin-word once more, warmly, converting nobody; the eve ends with both women exactly where they started. |

### Option `-a` — lets it stand without answering *(deed · Intimacy · response spoken by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-6-a-act` | action | matter_of_fact | **[action]** [Let it stand without answering.] | — | — |
| `L-CH-T4-12-6-a-r1` | dialogue | warm | "Lamp's at the gate. Take it with you." | 8 | The word left standing and the leavers provided for; the care is a lamp, stated as where it is. |

### Option `-b` — marks that Juno used the kin-word again *(spoken · Trust · first response spoken by `juno`, second by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-12-6-b-p` | player_line | matter_of_fact | "That's twice tonight you've called me yours." | 7 | — |
| `L-CH-T4-12-6-b-r1` | dialogue | warm | "So I did. I only say it where I mean it." | 11 | Juno — owns the word without defending it; a mark on her grammar answered with her grammar, and no verdict on anyone rides in it. |
| `L-CH-T4-12-6-b-r2` | dialogue | matter_of_fact | "Gate's this way. Mind the step." | 6 | The eve closed the way she closes everything, by seeing people to where they go next. |

*Records per graph: `-a` Intimacy; `-b` Trust. No concession, no repair, no last word; the places stay as laid.*

---

## Inventions declared *(codex checked first; reuse recorded)*

| invention_type | name | what | content_ids | codex_checked |
|---|---|---|---|---|
| prop | the house shelf | The shelf in the house where the plates and cups live | `A-CH-T4-12-3-s` | nothing in `world:ilsas-forge` reaches inside the house; the laying needs a place the plate comes from |
| prop | the good crock | A crock that only comes out for family occasions | `L-CH-T4-12-1-b-r1`, `L-CH-T4-12-1-b-r2` | nothing in `world:ilsas-forge` |
| prop | the gate lamp | A lamp kept at the yard gate for leavers after dark | `L-CH-T4-12-6-a-r1` | nothing in `world:ilsas-forge`; sits beside the road-home care already gated in the earlier Ilsa files |
| world_fact | Juno's asking-day | Juno decided to ask the player on the second morning of the week, at her own gate | `L-CH-T4-12-4-b-r1`, `L-CH-T4-12-4-b-1-s`, `L-CH-T4-12-4-b-1-b-r1` | `soul:juno` locks that she can name the day each of hers became hers; the specific day for the player exists nowhere and is minted here, flagged for ratification |

**Reused, not invented:** the bench, boards, the yard gate (`world:ilsas-forge`); the winter ferry (`world:winter-ferry`); Sella, Wick, Haf by name and relation-word (`offstage:juno-household`, proposed — referenced as drafted, nothing added, Corin untouched); the fixed order of places is the thread's declared `delta_cast` for C2 and the re-run argument its declared `delta_relational` — staged here, never re-declared. Bowls, pot, bread, butter, the big loaf, Juno's basket are scene colour, undeclared.

## Notes for the gate

- **No question mark in any Ilsa line; no proposal grammar.** Ilsa dialogue runs 5–8 words. Longest Ilsa line: 8 words (`L-CH-T4-12-1-a-r1`, `L-CH-T4-12-1-b-r2`, `L-CH-T4-12-6-a-r1`). Juno runs 7–12, her declared band; longest Juno line: 12 (`L-CH-T4-12-4-s`, `L-CH-T4-12-4-b-1-s`).
- **The laying precedes the argument** (`A-CH-T4-12-3-s` sits two nodes before `A-CH-T4-12-4-s`), is immediate ("already at the house shelf"), and carries no beat of hesitation or weighing — the player is never a question.
- **The grammar tell fires once, where the thread specs it:** `L-CH-T4-12-3-a-r1` — "It went on last. The order's..." — the fact confirmed flat, the explaining clause started and never finished, no closing fragment, the straightening act as the pause. Every other Ilsa sentence completes.
- **Ilsa never states her stance.** No Ilsa line objects, explains the order, or says the occasion is for family; her whole side of the argument is placements (`-4-a-r2`, `-4-c-r1`, `-4-b-1-a-r1`).
- **Juno never wins and never diagnoses.** Her lines are claims and dates about her own table (`-4-s`, `-4-a-r1`, `-4-c-r2`, `-6-b-r1`); no line states the thesis as fact, tells Ilsa about herself, or is endorsed by any outcome. Her cost is present in her exactness (`-4-b-1-s`).
- **Interchangeability checked line by line:** every Ilsa line is an arrangement or placement Juno has no engine for; every Juno line is a claim or a dated beginning Ilsa has no reason to speak. None swaps.
- **Nothing judges the player:** the place is laid at once, node 5's inclusion is the running state ("without a seam", the loaf, the files tomorrow), nothing is scored or recorded about the player, no response is a rebuke, and the one incomplete sentence is hers about the order, not about the guest.
- **No option adjudicates:** no pick moves or refuses the place, settles the argument, or extracts a concession; `-6-b-p` marks Juno's grammar and claims nothing.
- **Rule-19 build at node 3:** act (31w) → mark (7w) → flat fragment ending unfinished (6w) → `A-CH-T4-12-3-a-r` (14w) → nothing. On `-b` the run closes on the set-up act, unremarked.
- **No accounting, no dating of the table, no household history, no parent.** Wick's nineteen years and Haf's thirty are Juno's beginnings-exactness about her own table (her card's licensed move), never Ilsa's lineage run, which stays unplaced.
- **Offer-stands-alone test applied**; kept second clauses ("It only comes out for these", "I knew then") are the visible-care / plain-fact case, not justification.
- **Register lock:** scene locks `matter_of_fact`; `quiet`/`warm` appear on individual slots per the Toby C1 precedent — same standing flag for Roc (per-scene vs per-slot lock), not resolved here.
