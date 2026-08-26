# `mara-tonic-frost` — C1 line slots · `SC-T2-22`

**Conversation:** C1, first contact with Mara this week. Carries R1 (the work has an end and a date — the cleared shelf, the jars counted out and empty, the herbs still out with the frost due; all staged, none remarked).
**Structure source:** `../mara-tonic-frost.md` § "C1 — `SC-T2-22`", graphs approved by Roc 2026-08-10, action layer included. Nothing structural altered.
**Soul:** `mara` (`cast/mara.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. Her declared band: 12–25 words ordinary dialogue; the present line goes thin only under weight.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts sit in their own column, never in the text cell.
**Speaker for all `dialogue` slots:** `mara`. No other speaker appears in C1; no walk-on.

**Incoming states:** one — zero knowledge. C1 reads no prior fact. **No per-state variants required.**

**Staging vocabulary:** the herb stall on Market Row, the cleared shelf, empty tonic jars in counted rows, the cutting bench, the carrying basket, the forest run still to come, the frost due this week. The drawer, the stool, the cup and the swept patch may sit in view and get no attention (`mara-shelf-room` deferred and untouched).

**Sanctioned long run:** none placed, per the content block. Zero marked runs across this thread; this life's licence belongs to `prop:adrens-doll` in `mara-set-for-two`.

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-22-1` | object | matter_of_fact | **[action]** The shelf behind the stall stands cleared. Empty tonic jars are set out along it in counted rows, and the bench below is dressed for cutting work. | 27 | — |

## `CH-T2-22-1` — arrival; the cleared shelf, the jars counted out and empty *(three options)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-1-s` | dialogue | matter_of_fact | "Take that end of the bench and strip these as I cut. The tonic wants every leaf, and the forest still holds the rest." | 24 | Her welcome is an imperative; a share of the week goes into the player's hands before any greeting would. |

### Option `-a` — asks what the count is against *(spoken · sets `frost_date_known` · moves `mara-tonic-frost` · opens the nested child)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-1-a-p` | player_line | matter_of_fact | "How many do you need, and by when?" | 8 | — |

### Option `-b` — takes the share of the work she puts in the player's hands *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-1-b-act` | action | matter_of_fact | **[action]** [Take the near end of the bench and strip leaves as she cuts.] | 13 | — |
| `L-CH-T2-22-1-b-r1` | dialogue | matter_of_fact | "Stems to the pail, leaves to the tray, nothing bruised. A bruised leaf turns the whole jar bitter." | 18 | She explains the thing while her hands do it; the explaining is the warmth. |
| `L-CH-T2-22-1-b-r2` | dialogue | matter_of_fact | "When the frost came early, the tonic went out warm." | 10 | The past tense arrives uninvited on an exact detail of the work, mid-task, and she does not notice it. |

### Option `-c` — asks what goes into the tonic *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-1-c-p` | player_line | matter_of_fact | "What goes into the tonic?" | 5 | — |
| `L-CH-T2-22-1-c-r1` | dialogue | matter_of_fact | "Frost herbs, bitterroot, white yarrow, and honey to carry them. Steeped a day, boiled down an evening, corked warm." | 19 | The exact half of her, freely given: the recipe itemized the way she prices a repair, on the work and never on her. |
| `L-CH-T2-22-1-c-r2` | dialogue | matter_of_fact | "You'll see the whole of it before the week's out. Start on the stripping." | 14 | An answer turns into a job, which is how she takes an asker in. |

*Records per graph: `-a` sets `frost_date_known` and moves the thread; `-b` Intimacy; `-c` Trust. No response scolds an unpicked option.*

### Nested child — `CH-T2-22-1-a-1` · she gives the date and the shortfall, hands going on with the jars *(node 1 › option a › child 1)*

**Rule-19 build, per the content block:** a short fragment carrying the count → `A-CH-T2-22-1-a-1-s` → a shorter fragment carrying the date. The set-up is split `-s1` / `-s2` around the action slot; the deadline's weight is never moved into a longer line, and the beat carries information, not grief.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-1-a-1-s1` | dialogue | matter_of_fact | "The shelf takes fifty jars by festival eve, and a third of what fills them is still standing out in the forest." | 22 | The count carried by the shelf and the standing herbs — things and their state, no alarm; the week priced the way she prices a repair. |
| `A-CH-T2-22-1-a-1-s` | action | matter_of_fact | **[action]** Her hands go on setting jars into the row as she talks, each one squared to the last. | 18 | — |
| `L-CH-T2-22-1-a-1-s2` | dialogue | matter_of_fact | "The frost is due inside the week." | 7 | The date lands in the shortest fragment of the beat, plain, with nothing attached to it. |

#### Option `-a` — asks whether the herbs will come in on time *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-1-a-1-a-p` | player_line | matter_of_fact | "Will the herbs come in on time?" | 7 | — |
| `L-CH-T2-22-1-a-1-a-r1` | dialogue | matter_of_fact | "Two afternoons of cutting and a day at the fire. The weather I can't price, so we start early." | 19 | The practical answer, exact about the work; it is not a promise about herself and does not become one. |
| `L-CH-T2-22-1-a-1-a-r2` | dialogue | matter_of_fact | "Wipe those jars out while we talk, they take dust standing." | 11 | The question spent, a job goes into the asker's hands. |

#### Option `-b` — sets the counted jars straight with her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-1-a-1-b-act` | action | matter_of_fact | **[action]** [Set the counted jars straight along the shelf with her.] | 10 | — |
| `L-CH-T2-22-1-a-1-b-r1` | dialogue | matter_of_fact | "Mouths level, that's it. The corking goes quick when the row starts straight." | 13 | Instruction is her thanks; being joined in the work is the thing she takes. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

## `CH-T2-22-2` — the empty jars, counted out for the count she named

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-2-s` | dialogue | matter_of_fact | "Count them down the shelf as you wipe. If I'm one short I want to know it today, not at the fire." | 22 | The jars are work, not history; nothing remarks on what the shelf held before. |

### Option `-a` — sets the jars out in the count *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-2-a-act` | action | matter_of_fact | **[action]** [Set the jars out along the shelf, counting them down.] | 10 | — |
| `L-CH-T2-22-2-a-r1` | dialogue | matter_of_fact | "Fifty, and none cracked. Set the wide-mouthed ones nearest, they fill first." | 12 | The count confirmed and the work moved along; the noticing of good hands is the warmth. |

### Option `-b` — asks how many the festival takes *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-2-b-p` | player_line | matter_of_fact | "How many does the festival take?" | 6 | — |
| `L-CH-T2-22-2-b-r1` | dialogue | matter_of_fact | "Fifty for the square and the long tables. Sixty, when the whole row still traded." | 15 | The festival's number, exact and freely given; the past tense arrives on the old count, uninvited and unremarked. |
| `L-CH-T2-22-2-b-r2` | dialogue | matter_of_fact | "The number's the festival's. It doesn't change for weather." | 9 | The number belongs to the festival, not to her, and she hands it over that way. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-22-3` | object | matter_of_fact | **[action]** The carrying basket stands ready at the bench end, empty, its straps laid open. | 14 | — |

## `CH-T2-22-3` — the last herbs still standing out in the forest

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-3-s` | dialogue | matter_of_fact | "The frost herbs and the yarrow are still standing at the clearing. The light out there is best the hour before it goes." | 23 | What is still to bring in, named; the beauty of the light stated as plain fact about the thing, never as her feeling about it. |

### Option `-a` — gets the carry ready for the run *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-3-a-act` | action | matter_of_fact | **[action]** [Open the basket and set its cloth and ties in order.] | 11 | — |
| `L-CH-T2-22-3-a-r1` | dialogue | matter_of_fact | "Ties to the left side, they come to hand quicker in the field." | 13 | The kit accepted into the player's hands with instruction on it; the run is now partly theirs. |

### Option `-b` — asks when the light is best for cutting *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-3-b-p` | player_line | matter_of_fact | "When is the light best for cutting?" | 7 | — |
| `L-CH-T2-22-3-b-r1` | dialogue | matter_of_fact | "The hour past midday, this week. After that the frost herbs close and the cutting bruises them." | 17 | A time, given exactly, the way she prices a repair; the practical reason rides with it. |
| `L-CH-T2-22-3-b-r2` | dialogue | matter_of_fact | "The clearing held the light late, the year the big birch came down." | 13 | The past tense arrives on an exact detail of the clearing, uninvited and unremarked, never wistful. |

*Records per graph: `-a` Intimacy; `-b` Trust. This is the forest run put in front of the player without a scene being promised.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-22-4` | action | matter_of_fact | **[action]** Mara puts a bundle of jar cloths and the written count into the player's hands. | 15 | — |

## `CH-T2-22-4` — leave-taking; the shelf ready and nothing on it yet

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-4-s` | dialogue | matter_of_fact | "Scald these and hang them where the wind gets them. Dry by tomorrow, or the corking waits on them." | 19 | The goodbye is a job with instructions on it, same as the welcome was. |

### Option `-a` — takes the job she sends the player off with *(deed · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-4-a-act` | action | matter_of_fact | **[action]** [Take the cloths and the count out to scald and hang.] | 11 | — |
| `L-CH-T2-22-4-a-r1` | dialogue | matter_of_fact | "You've bought us a day of it. We go out for the rest after midday." | 15 | Help is priced in work done, and the invitation back is another load. |

### Option `-b` — says the player will be there for the run *(spoken · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-22-4-b-p` | player_line | matter_of_fact | "I'll be there for the run." | 6 | — |
| `L-CH-T2-22-4-b-r1` | dialogue | warm | "The run wants two pairs of hands and now it has them. After midday, then." | 15 | More tending is the one thing she takes, and she takes it by counting the player into the work. |

*Records per graph: `-a` Trust; `-b` Intimacy. The shelf is ready and empty when the player leaves; nothing on it is remarked.*

---

## Notes for the gate

- **Slot totals.** 21 `dialogue` · 6 `player_line` · 7 `action` (2 scene/set-up, 5 deed) · 2 `object` — 36 slots. Every text inside its ceiling; longest dialogue line 23 words (`L-CH-T2-22-3-s`).
- **R1 arrives by situation.** The cleared shelf, the counted empty jars and the herbs still out are staged in `O-SC-T2-22-1`, node 2 and node 3, present whatever the player picks. The date and shortfall are the nested child's answer only, per the graph; a player who never asks leaves without `frost_date_known` and loses no reveal.
- **Band check.** Ordinary Mara lines run 12–24 words. Lines under her floor are short work beats and handed-off jobs (`-1-a-1-s2` 7 w, `-1-a-1-a-r2` 11 w, `-1-b-r2` 10 w, `-2-b-r2` 9 w) and the rule-19 date fragment — weight and hand-offs, not clipping.
- **Tense tell placed three times** (`-1-b-r2`, `-2-b-r1`, `-3-b-r2`), each on an exact detail of the work, the row or the clearing, none noticed by her, none wistful, none touching the drawer, the corner or any person.
- **Rule-19 build honored:** the child's set-up is fragment (count, 22 w) → `A-CH-T2-22-1-a-1-s` → shorter fragment (date, 7 w). The deadline never gets a longer line.
- **Option `-a` of node 1 carries only its player_line;** the nested child's set-up is the answer, per the graph (the `mara-set-for-two` C2 node-3 `-a` precedent).
- **She never names.** No line touches what her keeping is for; the shelf's prior contents, the drawer, the stool, the cup and the swept patch get no attention (`mara-shelf-room` deferred and untouched). The basket enters as ordinary working kit with no history (`O-SC-T2-22-3`).
- **No fail state, no hurry.** No option hurries her and no response frames anything as an error; the shortfall is stated through the things and the days (`-1-a-1-s1`, `-1-a-1-a-r1`), never as a deficit solved into steps — that device is Toby's.
- **Bond categories: Trust, Intimacy only in this conversation,** per the graph. No `surface_action` appears in any slot_type column — deeds are `action` slots.
- **Inventions (check 12), declared:** `prop` — the stripping pail and tray at the cutting bench (`-1-b-r1`); `prop` — the jar cloths for scalding and drying (`A-SC-T2-22-4`, `-4-s`, `-4-a-act`); `prop` — the written count that travels with the cloths (`A-SC-T2-22-4`). All examinable from the stall; none contradicts the codex. `prop:maras-carrying-basket` is the thread doc's own declared invention, reused not re-declared. Quantities ("fifty," "sixty," "a third") are scene colour, undeclared by rule. The "long tables" at the square (`-2-b-r1`) are festival furniture at a ratified location, declared `prop` for completeness: festival tables at the square (`-2-b-r1`).
- **No World Truth stated; no fix granted; no trait phrased in herbalist terms; the frost is a date, not a disaster** — nothing stages or mourns `world:the-flood-year`, which goes unmentioned.
- **Register lock, flagged not resolved:** two enum values appear across slots (`matter_of_fact` / `warm`), same pattern the sibling files ship with. Read aloud the cadence never changes. Roc's standing call on per-scene vs per-slot applies here identically.
