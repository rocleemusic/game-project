# `toby-the-shelf` — C2 line slots · `SC-T2-09`

**Conversation:** C2, carries R2 (a gift goes back out as unbilled rolls). Sets `repaid_seen` at node 2 and `shelf_named` at node 3.
**Structure source:** `../toby-the-shelf.md` § "C2 — `SC-T2-09`", shape approved by Roc 2026-08-06, action layer added the same day. Nothing structural altered.
**Soul:** `toby` (`cast/toby.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Register:** `../../../../narrative-pipeline/register.md`, rewritten 2026-08-06. Median turn 5–7 words; weight carried by fragments plus description, never by a longer line.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once.

**Rewritten in full 2026-08-06.** The previous pass was written against the old register, had no action slots, and read cold and choppy at the gate. This is a replacement, not a patch. Staging vocabulary is orders and delivery: the counter, parcels, twine, papers with names on them, the pickup shelf by the door. No ovens, no heat, no empty kitchen.

**The receiving pair.** Wherever Toby is receiving, his flat line and his warm line are one unit: a 1–5 word reply, then a second slot where he anticipates something and supplies it by name. Every receiving option carries at least two response slots.

**Incoming states (two).** `shelf_seen` (deep) and fallback. Node 3 exists only in the deep state and auto-skips otherwise. Node 6 carries divert variants. Every other node is one set of lines for both states — node 2 reads as a baker giving rolls away to a fallback player and as the repay-reflex to a deep one, which is the same prose doing both jobs, per the content block.

**Slot ids:** set-up `L-<CHOICE_ID>-s` · player line `L-<OPTION_ID>-p` · deed `L-<OPTION_ID>-act` · responses `-r1/-r2/-r3`. Action and object slots placed by the graph keep the graph's own `A-` / `O-` ids. Variant suffixes are the thread doc's (`-norm` / `-div`).

**The giver is named Nella** and never appears — a name on a paper, per the content block. Walk-on band does not apply; no walk-on speaks in this conversation.

---

## Scene opening — before `CH-T2-09-1`

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-09-1` | object | matter_of_fact | **[action]** A half-wrapped parcel sits on the counter, Nella's name is written on the paper beside it. |  | — |

---

## `CH-T2-09-1` — arrival, an order half-packed

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-1-s` | dialogue | matter_of_fact | Toby is rushing around like usual. "Nella's order goes out before noon. Hold that corner for me?" |  | Turns an arrival into a job with a place in it, so nothing has to be greeted or received. |

### Option `-a` — helps pack the order *(deed · Collect · records Intimacy)*

Receiving beat: he is being helped. Two slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-1-a-act` | action | matter_of_fact | **[action]** [Take the far corner of the wrapping paper and pack alongside him] |  | — |
| `L-CH-T2-09-1-a-r1` | dialogue | quiet | "Flat breads first." |  | Help taken at the shortest length he has, with nothing sour in it. |
| `L-CH-T2-09-1-a-r2` | dialogue | warm | "Rolls on top so they don't press. Look at that! Your fold is neater than mine." |  | The warm half of the pair: he cannot say thank you, so he says the true thing about the other person's hands. |

### Option `-b` — asks whose order it is *(spoken · Converse · records Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-1-b-p` | player_line | matter_of_fact | "Whose order is this?" (4 w) |  | — |
| `L-CH-T2-09-1-b-r1` | dialogue | matter_of_fact | "Nella's. Six flats, four rolls, one loaf she says is for the dog." |  | Exact to the unit about somebody else's need; the precision only ever points outward. |
| `L-CH-T2-09-1-b-r2` | dialogue | warm | "Her boy likes the soft rolls. The ones on top are for him." |  | Anticipation aimed at a household that is not in the room, arranged already, never claimed. |

---

## Spine — node 1 gather → node 2

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-09-2` | action | matter_of_fact | **[action]** Toby adds two rolls to the package. The order still says four. |  | — |

R2's surface is a deed the player watches. It happens whatever the player picks.

---

## `CH-T2-09-2` — two extra rolls go in, unbilled

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-2-s` | dialogue | matter_of_fact | "That's her lot. Pass me the twine?" |  | Keeps the work moving at the exact moment the count stopped matching the paper. |

### Option `-a` — asks about the extra rolls *(spoken · sets `repaid_seen` · moves `toby-the-shelf`)*

Receiving beat: the count is pointed at him. Three slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-2-a-p` | player_line | matter_of_fact | "Those two weren't on the order." (6 w) |  | — |
| `L-CH-T2-09-2-a-r1` | dialogue | quiet | "Yup, order says four." |  | Flat and short with the attention on him. He confirms the fact and confirms nothing under it. |
| `L-CH-T2-09-2-a-r2` | dialogue | matter_of_fact | "She's feeding four now. The order still says a family of three." |  | Reroutes into arithmetic about someone else's household before the question can settle on him. |
| `L-CH-T2-09-2-a-r3` | dialogue | warm | "You're still holding that corner. Tie's done. Let it go." |  | The warm half: he watched the player's hands while answering and took the load off them without naming it. |

### Option `-b` — keeps packing, lets them pass *(deed · Collect · records Intimacy)*

Receiving beat: shared work. Three slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-2-b-act` | action | quiet | **[action]** [Keep packing, and let the two rolls go under the paper] |  | — |
| `L-CH-T2-09-2-b-r1` | dialogue | quiet | "Good fold." |  | The shortest acknowledgement he owns, warm toward the person and closed as a subject. |
| `L-CH-T2-09-2-b-r2` | dialogue | matter_of_fact | "Cross the ties. Nella opens them one-handed with the baby up." |  | Knows how somebody else's hands will be full tomorrow; the reason is the whole line. |
| `L-CH-T2-09-2-b-r3` | dialogue | warm | "Jug behind you is fresh from the well. Cup's on the hook." |  | The warm half: the jug was filled and set within reach before anyone was thirsty. |

---

### `CH-T2-09-2-a-1` — nested: he labels the rolls routine

Inside option `-a` only.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-2-a-1-s` | dialogue | matter_of_fact | Toby winks at you, "House measure. The tin bakes six anyways." |  | Mislabels the gift as routine so no thanks can ever attach to it. |

#### Option `-a` — lets the label stand *(deed · Converse · records Intimacy)*

Receiving beat: a courtesy he is given. Two slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-2-a-1-a-act` | action | quiet | **[action]** [Fold the paper over the rolls and let the label stand] |  | — |
| `L-CH-T2-09-2-a-1-a-r1` | dialogue | quiet | "That's done." |  | Cover accepted, at the shortest length, without a flicker of cooling toward the one who gave it. |
| `L-CH-T2-09-2-a-1-a-r2` | dialogue | warm | "Next one's for the lane cottages. I'll bring the paper over to you." |  | Repays the courtesy the only way he can: by moving the next piece of work to where the player is standing. |

#### Option `-b` — presses what the giver did to earn them *(spoken · records Trust)*

Receiving beat: he is asked for a ledger entry and has none. Three response slots plus the graph's action beat.

> **`-r1` written 2026-08-11.** The cell held the stage direction `[action] Toby pretends he didn't hear` while the row was typed `dialogue`, so the importer would have spoken the direction aloud. The heading and the row's own `speaker_intent` — "*the words* shut the account" — both call for a line, so this was a placeholder that never got replaced, not an action mistyped. The line answers a different question than the one asked, which is the pretending-not-to-hear beat done in speech; the deflection lands on the work, never on the asker.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-2-a-1-b-p` | player_line | matter_of_fact | "What did she do to earn two rolls?" (8 w) |  | — |
| `L-CH-T2-09-2-a-1-b-r1` | dialogue | quiet | "Parcel's for the Hallam order." |  | Flat and short. The words shut the account rather than open it, and stay warm toward the asker. |
| `A-CH-T2-09-2-a-1-r` | action | quiet | **[action]** Toby's hands keep working the parcel shut. The order paper lies where it is. |  | — |
| `L-CH-T2-09-2-a-1-b-r2` | dialogue | matter_of_fact | "She's got a new baby. Plus, she left a jar on my step in spring. It's on the shelf still." |  | Gives the entry and not what he did with it; the accounting behind it stays unsaid. |
| `L-CH-T2-09-2-a-1-b-r3` | dialogue | warm | "Let the counter take that corner. The tie holds without you now." |  | The warm half: the relief was ready before the question ended, and he offers it instead of an answer. |

---

## `CH-T2-09-3` — the trade connects to the shelf

**Deep state only** — gated `knows(shelf_seen)`. Auto-skips in fallback; no fallback variant, per the content block. Option `-a` diverts to `CH-T2-09-6`.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-3-s` | action | quiet | **[action]** Behind Toby the jars stand in their row. He carries Nella's parcel past them. |  | — |

### Option `-a` — names the pattern to his face *(spoken · sets `shelf_named` · Recognition · divert → `CH-T2-09-6`)*

The thread's central beat, built to the rule-19 shape: player fragment → short response fragment → action → shortest fragment → divert. The action slot is the collapse of the visit. No response here runs long.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-3-a-p` | player_line | quiet | You look at the jars on the shelf. "The jars stay shut. The rolls go out." (8 w) |  | — |
| `L-CH-T2-09-3-a-r1` | dialogue | quiet | "They do." |  | Confirms the fact, defends the shelf a little, and explains none of it. |
| `A-CH-T2-09-3-a-r` | action | quiet | **[action]** Toby goes still with the parcel in both hands, then lifts the empty crate off the counter. |  | — |
| `L-CH-T2-09-3-a-r2` | dialogue | warm | "Stay if you like." |  | Flat in tempo, unchanged in warmth. He leaves the talk and does not leave the person. |

### Option `-b` — holds the connection unspoken *(deed · Converse · records Intimacy)*

Receiving beat: he is handed something. Three slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-3-b-act` | action | quiet | **[action]** [Hand him the twine and leave the jars unmentioned] |  | — |
| `L-CH-T2-09-3-b-r1` | dialogue | quiet | "That's her lot done." |  | Takes the help as ordinary counter work, which keeps it small enough to accept. |
| `L-CH-T2-09-3-b-r2` | dialogue | matter_of_fact | "Door parcels next. You read me the names and I'll pull them." |  | Back into the order of the work, where he can be plainly warm and owe nobody anything. |
| `L-CH-T2-09-3-b-r3` | dialogue | warm | "Your bag's under the counter where the flour won't reach it." Toby's moved your bag without you even realizing. |  | The warm half: he worked out where the player's things would end up and moved them first. |

---

## `CH-T2-09-4` — the counter goes on

**Non-divert path only.** Both incoming states reach it identically.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-4-s` | dialogue | matter_of_fact | "Two more after hers. Names are on the papers if you want to call them out." |  | Hands the player a share of the job rather than a subject, and keeps the room supplied with next steps. |

> **PENDING ROC — node `CH-T2-09-4` is struck, not yet removed (2026-08-07).** Both options are cut, which removes the node (7 nodes to 6). Flags are unaffected — it recorded only Trust and Intimacy and nothing reads them. **But it weakens the divert:** the divert exists to skip nodes 4 and 5, and with node 4 gone it skips one beat. Roc is reviewing in Lantern before this is applied.

~~### Option `-a` — asks whether the giver knows *(spoken · records Trust)*~~ **roc review: cut this**

Receiving beat: the question is about what he did. Three slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-4-a-p` | player_line | matter_of_fact | "Does she know what came back to her?" (8 w) |  | — |
| `L-CH-T2-09-4-a-r1` | dialogue | quiet | "She'll see bread." |  | Flat and short. The thanks is foreclosed before it can be posted, and no chill lands on the asker. |
| `L-CH-T2-09-4-a-r2` | dialogue | matter_of_fact | "The paper says four and the paper's what she keeps." |  | Prices the act down to nothing so there is no figure for anyone to answer. |
| `L-CH-T2-09-4-a-r3` | dialogue | warm | "Call the next name for me. My hands are full of twine." |  | The warm half: he makes a place for the player in the work instead of finishing the subject alone. |

~~### Option `-b` — stacks the finished order for pickup *(deed · Collect · records Intimacy)*~~ **roc review: cut this**

Receiving beat: work done for him. Two slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-4-b-act` | action | matter_of_fact | **[action]** [Stack the finished parcel with the ties facing up] |  | — |
| `L-CH-T2-09-4-b-r1` | dialogue | matter_of_fact | "By the door, not the wall. She comes in from the lane." |  | Knows the route somebody else will walk before they walk it, and says only the route. |
| `L-CH-T2-09-4-b-r2` | dialogue | warm | "That's one job off me. I'll have the papers over before you're out the door." |  | The warm half: help received is turned around inside the minute so nothing is left standing open. |

---

## Spine — node 4 gather → node 5

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-09-5` | object | quiet | **[action]** Four twine-tied parcels wait on the pickup shelf for tomorrow, three of them fatter than their papers say. |  | — |

---

## `CH-T2-09-5` — the order joins tomorrow's by the door

**Non-divert path only.** Reference beat; nothing new is spent.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-5-s` | dialogue | matter_of_fact | "Hers goes on the end. Morning ones come off that side first." |  | Orders the row by whose morning is tightest, and says only the order. |

### Option `-a` — marks how many carry something extra *(spoken · records Trust)*

Receiving beat: the count turns back on him. Three slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-5-a-p` | player_line | quiet | "How many of those carry something extra?" (7 w) |  | — |
| `L-CH-T2-09-5-a-r1` | dialogue | matter_of_fact | "Four. Five, if the Smith boy's cough is still on him tomorrow." |  | Counts other people's shortfalls to the unit, including one that has not happened yet. |
| `L-CH-T2-09-5-a-r2` | dialogue | quiet | "It's not much." |  | Flat and short once the count points at him; the subject is closed, the person is not. |
| `L-CH-T2-09-5-a-r3` | dialogue | warm | "Read me the top one." |  | The warm half: he gives the player the easier half of the reach without saying that is what he did. |

### Option `-b` — sets the last parcel with it *(deed · Use · records Intimacy)*

Receiving beat: shared work. Two slots.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-5-b-act` | action | quiet | **[action]** [Set the last parcel on the pickup shelf beside tomorrow's] |  | — |
| `L-CH-T2-09-5-b-r1` | dialogue | quiet | "Saves me the reach." |  | Help acknowledged at its shortest, as a fact rather than a thanks. |
| `L-CH-T2-09-5-b-r2` | dialogue | warm | "Lane names to the left, that's it. You place them straighter than I do." |  | The warm half: he pays the helper in the one currency he trusts, which is telling them they are good at it. |

---

## `CH-T2-09-6` — leave-taking (gather point and divert target)

### Divert entry only — before the set-up

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T2-09-6-s` | action | quiet | **[action]** Toby stands at the far end with the crate open, sorting papers into two piles. |  | — |

The non-divert entry arrives at node 6 without this slot.

### Set-up — variant by path

| slot id | slot_type | tone | text | W | speaker_intent | path |
|---|---|---|---|---|---|---|
| `L-CH-T2-09-6-s-norm` | dialogue | quiet | "All done. Anything I can get you, while you're stilll here?" |  | Ends the visit by asking what the other person lacks; the question never turns around. | normal (via `CH-T2-09-5`) |
| `L-CH-T2-09-6-s-div` | dialogue | quiet | "Let's see, what's next..." |  | Flat and short, the task doing the talking, and no edge in it toward the person who named him. | divert (from `CH-T2-09-3-a`) |

### Option `-a` — leaves him the task he found *(deed · Use · records Intimacy)*

Giving beat: the player gives him the room. Two slots by design.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-09-6-a-act` | action | quiet | **[action]** [Leave him the papers and take the door] |  | — |
| `L-CH-T2-09-6-a-r1-norm` | dialogue | warm | *(normal path)* "Cart goes Thursday. I'll put your name down for a place on it." |  | Books the next thing the player has not thought of, so the visit ends with him still supplying. |
| `L-CH-T2-09-6-a-r1-div` | dialogue | warm | *(divert path)* "Your pack's by the pickup shelf. I stitched the strap back this morning." |  | Flat in tempo, unchanged in warmth: the mending was done earlier, unasked, and is never claimed. |
| `L-CH-T2-09-6-a-r2` | dialogue | warm | "Come on by before noon if you can make it!" |  | The supply moves ahead of the goodbye, which is the only way he knows to ask someone to return. |

### Option `-b` — marks that the errand appeared with the talk *(spoken · records Recognition)*  **roc-review: this section needs better ending, can be simpler here**

Receiving beat: the deflection is named out loud. **Two slots** — cut from three at the gate (Roc, 2026-08-07: "needs better ending, can be simpler here"). The dropped slot re-offered the room that `-r1` had already given, and the lamp line lost its own justifying clause per the offer-stands-alone rule. The player line keeps its divert variant, because on that path the player named a pattern rather than asked a question.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T2-09-6-b-s` | action | quiet | **[action]** Toby goes back to the papers. (7 w) |  | — |
| `L-CH-T2-09-6-b-p-norm` | player_line | quiet | *(normal path)* "Do you ever slow down?" (5 w) |  | — |
| `L-CH-T2-09-6-b-p-div` | player_line | quiet | *(divert path)* "The work never ends, I guess." (6 w) |  | — |
| `L-CH-T2-09-6-b-r1` | dialogue | quiet | "Somebody's got to." |  | Attention lands on him and the answer goes onto the job instead. Warm, unarguable, and it names nothing about him — the player keeps what they worked out. |
| `L-CH-T2-09-6-b-r2` | dialogue | warm | "Lamp at the lane end is lit." |  | The warm half, and the whole of it: the walk home was provided for hours ago and surfaces only now. |

> **Resolved 2026-08-07 (Roc): "Somebody's got to."** The line was *"Can't help it, gotta make sure people stay fed"*, which had Toby naming his own compulsion — barred by `register.md` §2 and `guardrails.md` check 6, and worst on a Recognition beat, where the player is meant to have worked it out. The replacement keeps the shrug and the warmth and deflects onto necessity, which is his usual move.

---

## Slot count

| slot_type | slots | rows |
|---|---|---|
| `dialogue` | 42 | 43 |
| `action` | 12 | 12 |
| `object` | 2 | 2 |
| `player_line` | 7 | 8 |
| **Total** | **63** | **65** |

`dialogue` = 35 responses + 7 set-ups (`-1-s`, `-2-s`, `-2-a-1-s`, `-4-s`, `-5-s`, `-6-s-norm`, `-6-s-div`); the extra row is `-6-a-r1`'s two path variants. `action` = 5 placed by the graph (`A-SC-T2-09-2`, `A-CH-T2-09-2-a-1-r`, `A-CH-T2-09-3-a-r`, `A-CH-T2-09-6-s`) plus node 3's set-up, plus 7 deed slots. `object` = `O-SC-T2-09-1`, `O-SC-T2-09-5`. `player_line` = 7 spoken options, `-6-b` carrying two path variants.

14 options across seven nodes: 7 spoken, 7 deeds. No option is both, none is neither.

## Notes for the gate

- **Responses per option: 35 / 14 = 2.50.**
- **Description density.** On a single non-divert walk: roughly 21 dialogue slots against 7 description slots (2 object, 1 spine action, ~3 deeds, 1 in-branch action) ≈ **1 : 3**. The diverted walk runs ~13 dialogue against 6 description ≈ **1 : 2.2**, denser, which is what the collapsed visit should feel like. Both sit inside the register's 1:3–1:5 target.
- **Receiving options and their slot counts:** `-1-a` (2), `-1-b` (2), `-2-a` (3), `-2-b` (3), `-2-a-1-a` (2), `-2-a-1-b` (3), `-3-b` (3), `-4-a` (3), `-4-b` (2), `-5-a` (3), `-5-b` (2), `-6-b` (3). Every one is at 2 or more.
- **`-3-a` carries 2 dialogue responses plus the action beat between them**, which is the grief-shape build the thread doc specifies: fragment (11 w) → action (16 w) → shortest fragment (4 w). The weight is in the action slot and the shortness, never in a longer line.
- **`-6-a` is the one pure giving beat** and is two slots by design, not by omission.
- **Tempo asymmetry.** Receiving replies run 2–5 words: "Flats first." · "Good fold." · "Paper says four." · "That's her done." · "They do." · "Stay if you like." · "She'll see bread." · "It's not much." · "Saves me the reach." · "They were there all day." Outward lines run 9–15 and every one names a thing: twine, paper, ties, crate, jug, the cellar, parcels, the pickup shelf, the lamp.
- **No marked long run.** Nothing in the conversation is logistics dense enough to need one, and node 3 and node 6 are the beats where a run would be barred anyway (he is being seen). Longest dialogue slot is 15 words.
- **No em-dashes in any spoken, action or object slot.**
- **Banned constructions checked and absent:** no elbow, no sticking door or latch, no "come round my side" / "far side", no heavy end, no gift written off as spoilage, no long-walk framing. Food or drink as repayment appears once (the jug at `-2-b-r3`), down from four in the previous pass.
- **The supply move varies every time it fires:** the corner taken off the player's hands, the jug, the tie finished for them, the bag moved out of the flour, the papers brought to them, the reach done for them, the pack strap, the cart place and the list to sign, the lamp. No two use the same construction.
- No World Truth stated. No fix granted. No trait phrased in baker terms — orders and delivery are staging only. Nothing here fires the echo or closes the thread; the ending is the held breath.

## Where the structure could not carry prose

1. **Node 6 needs two set-ups, one per path.** The graph gives one plus the divert-entry action. The divert arrives with him already mid-task and flat; the normal path arrives with the counter finished. Authored as `-s-norm` and `-s-div`. Slot multiplicity only — no node, option, gate, record or rejoin moved. If the schema wants strictly one set-up per node, it is a re-spec item.
2. **`CH-T2-09-6-b` needs two player lines.** The normal-path line is false on the divert path, where nothing was asked. Same slot, two path variants, one set of responses.
3. **`A-CH-T2-09-2-a-1-r` sits mid-run, not at the end of it.** The graph draws it after option `-b`'s record and before the gather. Written between `-r1` and `-r2`, because its whole job is to be the non-answer the player watches before he offers the jar instead. If slot ordering inside a response run is fixed by position in the graph rather than authored, this needs a ruling.
4. **Node 2's asking option is one set of lines doing two readings**, deliberately. A state variant would hand the fallback player the deep read; the difference lives in what the player knows, which is where the content block puts it.
