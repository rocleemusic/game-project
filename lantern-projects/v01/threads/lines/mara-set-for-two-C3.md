# `mara-set-for-two` — C3 line slots · `SC-T2-14`

**Conversation:** C3, the ketsu. Carries nothing new — the same stall, the week one state further, the same tending, now legible. The re-seeing is the player's; no slot states it.
**Structure source:** `../mara-set-for-two.md` § "C3 — `SC-T2-14`", graphs approved by Roc 2026-08-10, action layer included. Nothing structural altered.
**Soul:** `mara` (`cast/mara.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. Her declared band: 12–25 words ordinary dialogue; the present line goes thin only under weight. **No sanctioned long run** — the thread's licence was spent in C2 and none is legal here.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts sit in their own column, never in the text cell.
**Speaker for all `dialogue` slots:** `mara`. No other speaker appears in C3; no walk-on.

**Incoming states:** four — nodes 3 and 4 gate on `provenance_heard` and `helped_tend` separately and auto-skip when false; every ungated slot is written placeless enough to serve all four states, so **no per-state variants are minted.** The fallback walk (1 → 2 → 5) exits through real content.

**Staging vocabulary:** the lanterns up the length of Market Row, tonic jars filling on the cleared shelf, the press, the funnel, corking, the crate for the square, the patch, the cup and the stool, the drawer shut under the bench.

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-14-1` | object | matter_of_fact | **[action]** The lanterns are up the length of Market Row. On the stall's cleared shelf the tonic jars are filling, row by row, and the bench is back to herbs. | 29 | — |

## `CH-T2-14-1` — the week further on; her welcome is a job again

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-1-s` | dialogue | matter_of_fact | "There you are. Hold the funnel while I pour, the last press is cooling and it won't wait." | 18 | Her welcome is an imperative, same as it has been every visit; a job goes into the player's hands before anything else does. |

### Option `-a` — takes the job she puts in the player's hands *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-1-a-act` | action | matter_of_fact | **[action]** [Hold the funnel steady while she pours.] | 7 | — |
| `L-CH-T2-14-1-a-r1` | dialogue | matter_of_fact | "Steady now, tip it with me. The press only gives the once, so we take it slow." | 17 | She explains the thing while her hands do it; the explaining is the warmth. |

### Option `-b` — asks what the row still needs before the lanterns are lit *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-1-b-p` | player_line | matter_of_fact | "What does the row still need before the lighting?" | 9 | — |
| `L-CH-T2-14-1-b-r1` | dialogue | matter_of_fact | "Oil for the brackets, a dry night, and the tonic corked by festival eve. The rest is hands." | 18 | The week itemized exactly, the way she prices a repair; nothing attached to any item. |
| `L-CH-T2-14-1-b-r2` | dialogue | matter_of_fact | "Yours can start on the corks." | 6 | The asker enlisted; an answer turns into a job, as it always does. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## `CH-T2-14-2` — the same tending, again, with the week one state further

**Rule-19 build, per the content block:** fragment → `A-CH-T2-14-2-s` → shorter fragment. The set-up is split `-s1` / `-s2` around the action slot; the recognition is the gap between the fragments and belongs to the player. No slot states it.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-2-s1` | dialogue | matter_of_fact | "The row's nearly ready for it." | 6 | The week named as nearly done; a fragment, not a summary. |
| `A-CH-T2-14-2-s` | action | matter_of_fact | **[action]** Mara sweeps the patch of paving, sets the cup straight at the stall's end, and pushes the drawer to with her foot. | 22 | — |
| `L-CH-T2-14-2-s2` | dialogue | matter_of_fact | "Corks next." | 2 | The tending done and not mentioned; the work list is all she says over it. |

### Option `-a` — sweeps the far end of the patch with her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-2-a-act` | action | matter_of_fact | **[action]** [Take the broom and sweep the far end of the patch.] | 11 | — |
| `L-CH-T2-14-2-a-r1` | dialogue | matter_of_fact | "Edges first, same as before. You've kept the way of it." | 11 | She notices a habit held from last time; the noticing is the warmth and nothing more is made of it. |

### Option `-b` — asks what still wants doing before the festival *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-2-b-p` | player_line | matter_of_fact | "What still wants doing before the festival?" | 7 | — |
| `L-CH-T2-14-2-b-r1` | dialogue | matter_of_fact | "Corking, the carting to the square, the brackets oiled, and the trough drained the last night." | 16 | A list of ordinary jobs, exact, with nothing attached; the sweeping she just did is not on it. |

*Records per graph: `-a` Intimacy; `-b` Trust. Nothing in the set-up says the tending means anything.*

---

## `CH-T2-14-3` — the drawer with one thing in it that has a name *(gated `knows(provenance_heard)`; auto-skips to its gather when false)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-CH-T2-14-3-s` | object | quiet | **[action]** The drawer sits shut under the bench, the runners home, the bench above it working herbs again. | 17 | — |
| `L-CH-T2-14-3-s` | dialogue | matter_of_fact | "Leave the drawer be today, it's done till after the week. The bench is all herbs now." | 17 | The drawer is finished business; she gives it the weight of any stored thing, and the doll is not produced again. |

### Option `-a` — says everything in the drawer is somebody's *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-3-a-p` | player_line | quiet | "Everything in that drawer is somebody's." | 6 | — |
| `L-CH-T2-14-3-a-r1` | dialogue | quiet | "Mm. Corks are in the low crate." | 7 | The deepest read in the thread lands and is neither confirmed nor denied; the present line goes thin and holds only the work. |
| `L-CH-T2-14-3-a-r2` | dialogue | matter_of_fact | "Start at the wall end and work toward me." | 9 | A job into the player's hands; the sentences about people never start. |

### Option `-b` — goes on with the work, does nothing with it *(deed · records nothing)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-3-b-act` | action | matter_of_fact | **[action]** [Go on with the corking and leave the drawer shut.] | 10 | — |
| `L-CH-T2-14-3-b-r1` | dialogue | matter_of_fact | "Good hands today. We'll be through the crate by noon." | 10 | The work taken as work; nothing was declined, nothing is owed, and the visit is whole. |

*Records per graph: `-a` Recognition; `-b` records nothing — the thread's one no-record side (rule 17), structural per the content block. Her response to it is full-weight scene content, not a shrug: silence toward the drawer is a legitimate ketsu and is not priced.*

---

## `CH-T2-14-4` — she hands over the deeper job: the corner itself *(gated `knows(helped_tend)`; auto-skips to its gather when false)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-4-s` | dialogue | matter_of_fact | "Come here a minute. That end, the cup and the stool. Set the cup back if it moves, and keep that end clear." | 23 | The deeper job handed over as plainly as the funnel was; being enlisted is the nearest thing to an answer she gives anyone, and the job is the whole of it. |

### Option `-a` — takes the corner and keeps it clear *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-4-a-act` | action | matter_of_fact | **[action]** [Wipe the cup, square the stool, and leave that end clear.] | 11 | — |
| `L-CH-T2-14-4-a-r1` | dialogue | matter_of_fact | "That's it. It'll want doing again by evening, they always do." | 11 | The handing-over complete; the tending's only future is more tending, stated as maintenance fact. |

### Option `-b` — asks how she likes it kept *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-4-b-p` | player_line | matter_of_fact | "How do you like that end kept?" | 7 | — |
| `L-CH-T2-14-4-b-r1` | dialogue | matter_of_fact | "Cup on its ring, stool square to the bench, nothing set down there however full the stall runs." | 18 | The instruction given exactly, the way she prices a repair; the sentence ends before anyone it is kept for. |
| `L-CH-T2-14-4-b-r2` | dialogue | quiet | "The ring's in the wood, you'll find it." | 8 | The wear stands in for whoever made it; she goes no further, and the line thins where a person would begin. |

*Records per graph: `-a` Intimacy; `-b` Trust. Both sit below node 3's Recognition per the depth rule; she says nothing about what the corner is for.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T2-14-5` | action | matter_of_fact | **[action]** Mara puts a crate of corked jars into the player's hands and turns to the next. | 16 | — |

## `CH-T2-14-5` — leave-taking; the week further on, the tending unchanged *(three options)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-5-s` | dialogue | matter_of_fact | "These go up to the square as you go. The week's nearly caught, don't let the crate tip." | 18 | The goodbye is a job with instructions on it, as every visit's has been; the thread ends with the tending going on behind the player. |

### Option `-a` — takes the last job out with her instruction on it *(deed · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-5-a-act` | action | matter_of_fact | **[action]** [Take the crate and carry it up toward the square.] | 10 | — |
| `L-CH-T2-14-5-a-r1` | dialogue | matter_of_fact | "The square used to take two carts of it, festival week. One crate at a time will do it now." | 20 | The past tense arrives on an exact quantity, uninvited and unremarked, never wistful; the present instruction carries on over it. |

### Option `-b` — says the player will be back for the next of it *(spoken · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-5-b-p` | player_line | matter_of_fact | "I'll be back for the next of it." | 8 | — |
| `L-CH-T2-14-5-b-r1` | dialogue | warm | "There's always a next lot. Yours is the one by the press." | 12 | More tending is the one thing she takes; a share of it is assigned by the thing, not promised. |

### Option `-c` — sets the cup and the stool clear one more time before going *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-14-5-c-act` | action | matter_of_fact | **[action]** [Set the cup and the stool clear once more before going.] | 11 | — |
| `L-CH-T2-14-5-c-r1` | dialogue | quiet | "That end's right again." | 4 | Attention has come near the corner one last time; the present line goes thin, and the fact is all it holds. |
| `L-CH-T2-14-5-c-r2` | dialogue | matter_of_fact | "Go on, the square's waiting on the jars." | 8 | The thread closes on a job, not a naming; nothing is confirmed and the tending continues unchanged. |

*Records per graph: `-a` Trust; `-b` Intimacy; `-c` Intimacy. None of the three names anything, none gets a confirmation, and no response scolds an unpicked option.*

---

## Notes for the gate

- **Slot totals.** 21 `dialogue` · 5 `player_line` · 8 `action` (2 scene/set-up, 6 deed) · 2 `object` — 36 slots. Every text inside its ceiling; longest dialogue line 23 words (`L-CH-T2-14-4-s`).
- **Nothing new is delivered.** No `delta_cast`; the corner, the drawer, the doll and the tense habit are acted on reference-free. The `delta_situation` (lanterns up, jars filling, the week nearly caught) is carried by `O-SC-T2-14-1`, node 1's set-up and node 2's build.
- **The ketsu carries no moral.** Node 2's rule-19 build (fragment → `A-CH-T2-14-2-s` → fragment) puts the same tending against the moved week and says nothing over it; the recognition is the gap between the fragments and no slot states it. No World Truth, no trait handed to her, no fix, no release.
- **The no-record option (`-3-b`) is a real choice, not an apology.** Its deed is concrete work, its response is full-weight and warm ("Good hands today…"), and nothing in it marks that a reading was declined. Recording nothing is per the graph and check 10 — pricing silence would make the recognition a paid act.
- **She never names what the keeping is for.** The drawer (`-3-s`, `-3-a-r1/r2`), the corner (`-4-b-r1/r2`, `-5-c-r1`) and the deep read (`-3-a`) each end before a person; no line confirms, denies, qualifies or explains the keeping.
- **Band check.** Ordinary Mara lines run 12–23 words. Lines under her floor are authored thin-present beats near the drawer and the corner (`-3-a-r1` 7 w, `-3-a-r2` 9 w, `-4-b-r2` 8 w, `-5-c-r1` 4 w, `-5-c-r2` 8 w), the two rule-19 fragments (`-2-s1` 6 w, `-2-s2` 2 w) and short work beats (`-1-b-r2` 6 w, `-2-a-r1` 11 w, `-3-b-r1` 10 w, `-4-a-r1` 11 w) — weight beats and handed-off jobs, not clipping.
- **Tense tell placed once** (`-5-a-r1`), on an exact quantity of the square's past, unremarked and not wistful — the thread's last line before the player walks the row it describes. C3 is the shortest conversation in her set and one tell is its share.
- **Bond categories: Trust, Intimacy, Recognition only.** Recognition appears once (`-3-a`). No `surface_action` appears in any slot_type column — deeds are `action` slots.
- **No variants.** Nodes 3 and 4 gate separately and auto-skip when false; all ungated slots serve all four incoming states with one text. The fallback walk (1 → 2 → 5) opens, works and exits through real content.
- **No long run.** Longest line is 23 words; the licence was spent in C2 and nothing here approaches it. Grief-adjacent beats are fragments beside action slots.
- **Inventions (check 12), declared:** `prop` — the tonic press and funnel (`-1-s`, `-1-a-act`, `-1-a-r1`); `prop` — the corks and the low crate (`-1-b-r2`, `-3-a-r1`, `-3-b-act`); `prop` — the crate of corked jars for the square (`A-SC-T2-14-5`, `-5-s`, `-5-a-act`). All examinable from the stall; none contradicts the codex. Quantities ("two carts," "by noon") are scene colour, undeclared by rule.
- **Nothing competes with the drawer, the stool, the cup or the swept patch** (`mara-shelf-room` deferred and untouched); the drawer stays shut and writable for the seam pass.
- **Register lock, flagged not resolved:** three enum values appear across slots (`matter_of_fact` / `quiet` / `warm`), same pattern C1 and C2 ship with. Read aloud the cadence never changes. Roc's standing call on per-scene vs per-slot applies here identically.
