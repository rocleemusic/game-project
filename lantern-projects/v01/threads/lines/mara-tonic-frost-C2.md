# `mara-tonic-frost` — C2 line slots · `SC-F1-03`

**Conversation:** C2, the forest run at Forager's Clearing. Carries R2 (mid-run, against the weather, her hands leave finishable work for a mend that has no deadline — delivered by situation in node 3's set-up, unmissable). A traverse, not a bench conversation: the scene moves across the clearing with the light going, and the player's position in it is the choice.
**Structure source:** `../mara-tonic-frost.md` § "C2 — `SC-F1-03`", graphs approved by Roc 2026-08-10, action layer included. The one divert (`-3-c` → node 6) and the depth-2 nest are the designer's, sanctioned; nothing structural altered.
**Soul:** `mara` (`cast/mara.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. Her declared band: 12–25 words ordinary dialogue; the present line goes thin only under weight.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts sit in their own column, never in the text cell.
**Speaker for all `dialogue` slots:** `mara`. No other speaker appears in C2; no walk-on, no third party at the clearing.

**Incoming states:** two — deep (`frost_date_known`) and fallback. Only node 5 is gated; every other set-up and response is written placeless enough to serve both states, so **no per-state variants are minted.** If the gate is false, node 5 auto-skips to its gather. Node 6 is reached from the gather and from the divert; its set-up and slots serve both arrivals with one text, so no `-norm`/`-div` variants are minted.

**Staging vocabulary:** the clearing off the trail, the herb stands, the rows, the carry filling, the loose rim binding, waxed thread, the birches at the treeline, the beech at the far edge, the light going.

**Sanctioned long run:** none placed, per the content block. The child's priced, dated mend is deliberately built as short exact pieces divided by the action slots.

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-F1-03-1` | object | matter_of_fact | **[action]** The clearing opens off the trail, the herb stand still standing at its middle, the light already low along the treeline. | 21 | — |

## `CH-F1-03-1` — arrival at the clearing, the light already going

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-1-s` | dialogue | matter_of_fact | "Good, you found it. Take the near stand and cut low, a hand above the root. We're behind the light already." | 21 | Her welcome is an imperative even in a field; a share of the run goes into the player's hands on arrival. |

### Option `-a` — takes a share of the run and works the near stand *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-1-a-act` | action | matter_of_fact | **[action]** [Take a share of the run and work the near stand.] | 11 | — |
| `L-CH-F1-03-1-a-r1` | dialogue | matter_of_fact | "A hand above the root, and leave anything flowered. A flowered stem has given its strength away." | 17 | She explains the cut while her hands make it; the explaining is the warmth. |

### Option `-b` — asks what she is cutting first *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-1-b-p` | player_line | matter_of_fact | "What are you cutting first?" | 5 | — |
| `L-CH-F1-03-1-b-r1` | dialogue | matter_of_fact | "Frost herbs first, they close soonest. Then bitterroot, it doesn't mind the dark coming. The yarrow cuts by feel." | 19 | The exact half of her, freely given: the order of the work, itemized, on the plants and never on her. |
| `L-CH-F1-03-1-b-r2` | dialogue | matter_of_fact | "Take the near stand and keep pace with me." | 9 | An answer turns into a job, which is how she takes an asker in. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-F1-03-2` | action | matter_of_fact | **[action]** They cut down the rows, handful by handful, and the carry fills. The light drops a shade at a time. | 20 | — |

## `CH-F1-03-2` — the run itself, the carry filling

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-2-s` | dialogue | matter_of_fact | "Halfway down and the light's ahead of us. Cut clean and don't sort, sorting is stall work." | 17 | The race stated as pace and order, no alarm; the beat gives node 3's stop something to cost. |

### Option `-a` — works the near stand alongside her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-2-a-act` | action | matter_of_fact | **[action]** [Work the near stand alongside her, matching her cut.] | 9 | — |
| `L-CH-F1-03-2-a-r1` | dialogue | matter_of_fact | "You've got the pace of it. Hold it and we're clear before dark." | 13 | The noticing of kept pace is the warmth; nothing more is made of it. |

### Option `-b` — asks what the frost takes first *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-2-b-p` | player_line | matter_of_fact | "What does the frost take first?" | 6 | — |
| `L-CH-F1-03-2-b-r1` | dialogue | matter_of_fact | "The frost herbs, the first night it lands. Bitterroot keeps under it a week. The yarrow goes black by morning." | 20 | The frost priced plant by plant, exact; a date in the weather, not a disaster. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## `CH-F1-03-3` — she stops mid-run and mends the loose binding *(three options · the thread's centre)*

**Rule-19 build, per the content block:** a short fragment as the work pauses → `A-CH-F1-03-3-s` → a shorter fragment, hers, about the thing in her hands and not about stopping. The set-up is split `-s1` / `-s2` around the action slot; the silence between the fragments is the action slot, and the cost of the minutes is never given a longer line. R2 is delivered here, on every walk, before any pick.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-s1` | dialogue | matter_of_fact | "Set the next lot on the cloth, not in." | 9 | The work pauses on an instruction, not an announcement; she frames nothing. |
| `A-CH-F1-03-3-s` | action | matter_of_fact | **[action]** Mara stops mid-row, turns the carry over on her knee, and takes up a loose binding at its rim. | 19 | — |
| `L-CH-F1-03-3-s2` | dialogue | matter_of_fact | "The rim binding's worked loose." | 5 | The thing in her hands, named; nothing about stopping, nothing about the light. |

### Option `-a` — stays with it and holds the carry steady *(deed · sets `drift_seen`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-a-act` | action | matter_of_fact | **[action]** [Stay with it and hold the carry steady while she works.] | 11 | — |
| `L-CH-F1-03-3-a-r1` | dialogue | matter_of_fact | "Hold it just there. The stitch goes cleaner when the rim can't flex." | 13 | The player taken into the mend the way they were taken into the run; the minutes go unpriced by her. |

### Option `-b` — marks that the errand has stopped *(spoken · sets `drift_seen` · opens the nested child)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-b-p` | player_line | matter_of_fact | "We've stopped. The light hasn't." | 5 | — |

### Option `-c` — keeps gathering along the treeline *(deed · Intimacy · DIVERT → `CH-F1-03-6`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-c-act` | action | matter_of_fact | **[action]** [Keep gathering along the treeline while the mend goes on behind.] | 11 | — |
| `L-CH-F1-03-3-c-r1` | dialogue | matter_of_fact | "Take the far row down to the birches. Anything flowered stays." | 11 | The walking-on taken as work, handed instruction like any other; nothing scolds and nothing calls the player back. |

*Records per graph: `-a` and `-b` set `drift_seen`; `-c` Intimacy, then diverts to node 6. Neither deep pick outranks the other; nothing frames staying as the kind pick.*

### Nested child — `CH-F1-03-3-b-1` · she answers the marking with the work *(node 3 › option b › child 1)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-b-1-s` | dialogue | matter_of_fact | "Two minutes of thread now, or a spilled carry on the trail. The binding went on three summers back, it was due. Take this lot while I work." | 28 | Named as having stopped, she answers with the object: the mend priced, the binding dated from memory, and a handful into the asker's hands — her welcome shape in the answer position. The stopping itself she does not touch. |

#### Option `-a` — asks how long the mend will take against the light *(spoken · Trust · opens the depth-2 grandchild)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-b-1-a-p` | player_line | matter_of_fact | "How long will it take, against the light?" | 8 | — |

#### Option `-b` — takes the handful and works beside her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-b-1-b-act` | action | matter_of_fact | **[action]** [Take the handful and work on beside her.] | 8 | — |
| `L-CH-F1-03-3-b-1-b-r1` | dialogue | matter_of_fact | "Strip as you go, it saves the bench later." | 9 | The pair of them back inside the work, one mending, one cutting; nothing further is said over it. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

#### Nested grandchild, depth 2 — `CH-F1-03-3-b-1-a-1` · she gives the time it takes and does not shorten it *(node 3 › option b › child 1 › option a › child 1)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-b-1-a-1-s` | dialogue | matter_of_fact | "A hundred count, maybe two. A stitch hurried is a stitch done twice, so it gets its two." | 18 | The minutes stated as a number by the person spending them, unshortened and undefended; the answer she gives every question about a thing. |

##### Option `-a` — lets the time stand and holds the light for her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-b-1-a-1-a-act` | action | matter_of_fact | **[action]** [Stand so the last light falls on her hands, and let the time run.] | 14 | — |
| `L-CH-F1-03-3-b-1-a-1-a-r1` | dialogue | matter_of_fact | "That's better. Hold there till the knot's in." | 8 | Help accepted without remark, as instruction; the time keeps its length. |

##### Option `-b` — marks that the carry was holding fine *(spoken · Recognition)*

**Rule-19 build, per the content block:** player line → a short fragment → `A-CH-F1-03-3-b-1-a-1-r` → shortest fragment; the run closes on short pieces, never a longer line.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-3-b-1-a-1-b-p` | player_line | quiet | "The carry was holding fine before you started." | 8 | — |
| `L-CH-F1-03-3-b-1-a-1-b-r1` | dialogue | quiet | "Mm. It was." | 3 | The fact confirmed plainly, and only the fact; the read behind it gets nothing, and the present line goes thin. |
| `A-CH-F1-03-3-b-1-a-1-r` | action | matter_of_fact | **[action]** Mara pulls the binding tight and sets the knot. The mend holds. | 12 | — |
| `L-CH-F1-03-3-b-1-a-1-b-r2` | dialogue | matter_of_fact | "Yarrow next." | 2 | The work resumes as if nothing paused, because for her nothing did. |

*Records per graph: `-a` Intimacy; `-b` Recognition — the deepest read in the conversation, the player's, never hers.*

---

## `CH-F1-03-4` — the mend finished, the carry back on her arm, the run picking up

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-4-s` | dialogue | matter_of_fact | "Right. The far stand, then the ground under the beech. We'll have the whole of it yet." | 17 | The mend over, unremarked by her, and the work resumed without ceremony; deliberately ordinary. |

### Option `-a` — takes the carry and gets the run moving again *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-4-a-act` | action | matter_of_fact | **[action]** [Take the carry from her and get the run moving again.] | 11 | — |
| `L-CH-F1-03-4-a-r1` | dialogue | matter_of_fact | "It rides better full. Keep it against your hip." | 9 | The load handed over with the way of carrying it; the trusting is in the handing. |

### Option `-b` — asks what is still to cut *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-4-b-p` | player_line | matter_of_fact | "What's still to cut?" | 4 | — |
| `L-CH-F1-03-4-b-r1` | dialogue | matter_of_fact | "The yarrow under the beech and the last row of bitterroot. Half an hour's work in good light." | 18 | The remainder itemized, exact; what the light no longer being good means is left uncounted. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

*Gate: `knows(frost_date_known)` — when false, node 5 auto-skips to its gather; the ungated fallback path, not a negated gate.*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-CH-F1-03-5-s` | object | matter_of_fact | **[action]** Past the far stand a last stretch of herbs is still standing, grey against the light going down the treeline. | 20 | — |

## `CH-F1-03-5` — the minutes read against the date the player holds *(gated `knows(frost_date_known)`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-5-s` | dialogue | matter_of_fact | "What's standing there fills the last dozen jars. The grey heads keep the night; the treeline row won't, so that row comes down before dark." | 25 | The count carried by the things and their state — what stands, what it fills, which plants keep the night — exact and without alarm, because the count comes in; nothing in it defends the minutes or mentions them. *(Reworded per Roc's ruling 2026-08-10: shortfall-then-arithmetic is Toby's licensed device; hers is the count through the objects.)* |

### Option `-a` — puts the minutes against the count she gave *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-5-a-p` | player_line | matter_of_fact | "The mend's minutes came out of your count." | 8 | — |
| `L-CH-F1-03-5-a-r1` | dialogue | matter_of_fact | "The grey heads hold their oil till morning; they're not lost. Take the row nearest the dark." | 17 | The minutes answered through the things — what the herbs themselves keep decides the order; the minutes are neither defended nor regretted, and the mend is not made the reason for anything. *(Reworded per Roc's ruling 2026-08-10.)* |

### Option `-b` — works faster beside her, says nothing of it *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-5-b-act` | action | matter_of_fact | **[action]** [Work faster beside her and say nothing of it.] | 9 | — |
| `L-CH-F1-03-5-b-r1` | dialogue | matter_of_fact | "Good hands. Leave the short stems, they're not worth the stoop tonight." | 12 | The shortfall taken as a thing to be done rather than said, and she meets it the same way. |

*Records per graph: `-a` Recognition; `-b` Intimacy. Neither pick is a correction; no response treats the mend as the reason for anything.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-CH-F1-03-6-s` | object | matter_of_fact | **[action]** The carry stands full at the trailhead, the fresh mend plain at its rim, pale thread against the dark weave. | 20 | — |

## `CH-F1-03-6` — the walk out *(divert target)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-6-s` | dialogue | matter_of_fact | "That's the clearing done for today. The trail back is downhill, and the dark doesn't matter to it." | 18 | The day closed as work done; written placeless, serving the gather and the divert arrival with one text. |

### Option `-a` — carries the full basket back down the trail *(deed · sets `herbs_carried`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-6-a-act` | action | matter_of_fact | **[action]** [Take the full basket and carry it back down the trail.] | 11 | — |
| `L-CH-F1-03-6-a-r1` | dialogue | matter_of_fact | "Keep it against your hip, there's roots across the trail past the birches." | 13 | The carry given over whole; being trusted with the load is the record, and she makes nothing of it. |

### Option `-b` — asks what goes in first at the shelf *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-F1-03-6-b-p` | player_line | matter_of_fact | "What goes in first at the shelf?" | 7 | — |
| `L-CH-F1-03-6-b-r1` | dialogue | matter_of_fact | "Frost herbs to the steep pot the same night. The rest hangs till morning." | 14 | The next stage of the work, exact, freely given. |
| `L-CH-F1-03-6-b-r2` | dialogue | matter_of_fact | "Back when the stall brewed for three villages, this clearing filled two carries a day." | 15 | The past tense arrives on an exact quantity of the clearing's history, uninvited and unremarked, never wistful. |

*Records per graph: `-a` sets `herbs_carried`; `-b` Trust. The mend is visible on the carry on both branches; R2's evidence leaves the clearing with the player.*

---

## Notes for the gate

- **Slot totals.** 27 `dialogue` · 8 `player_line` · 12 `action` (3 scene/set-up/response, 9 deed) · 3 `object` — 50 slots. Every text inside its ceiling; longest dialogue line 28 words (`L-CH-F1-03-3-b-1-s`).
- **R2 delivered by situation, unmissable.** Node 3's set-up (fragment 9 w → `A-CH-F1-03-3-s` → fragment 5 w) precedes every pick, including the divert. The stop is never framed by her, never named a mistake, and no option hurries her, finishes the mend, or takes the carry off her; no response frames the minutes as an error (`-5-a-r1` answers the minutes with what the things themselves keep).
- **The dated binding is not a provenance run.** The child's set-up (28 w) prices the mend and dates the binding in one ordinary line, per the content block; zero marked runs anywhere, and the basket gets no history beyond the binding's own date. The grandchild's weight beat is the rule-19 build (3 w → action → 2 w).
- **She never names.** Asked about the stopping (`-3-b`, `-3-b-1-a-1-b`) she answers with the object, its price, its date and a job; "Mm. It was." confirms the fact and nothing behind it. Restoration, never anticipation: the mend keeps a thing that already exists whole, and she never mentions having done it once it is over (`-4-s` resumes without ceremony).
- **The divert is honored, not punished.** `-3-c-r1` hands the walker-on real work and nothing scolds; node 6's set-up and slots serve both arrivals with one text, and the mend rides out visible on `O-CH-F1-03-6-s` for every walk.
- **Band check.** Ordinary Mara lines run 12–28 words. Lines under her floor are the rule-19 fragments (`-3-s1` 9 w, `-3-s2` 5 w, `-3-b-1-a-1-b-r1` 3 w, `-3-b-1-a-1-b-r2` 2 w) and short work beats and hand-offs (`-1-b-r2` 9 w, `-3-b-1-b-r1` 9 w, `-3-b-1-a-1-a-r1` 8 w, `-4-a-r1` 9 w, `-3-a-r1` 13 w, `-3-c-r1` 11 w) — weight beats and handed-off jobs, not clipping.
- **Tense tell placed twice:** the dated binding inside the child's set-up (`-3-b-1-s` — the content block's own placement) and `-6-b-r2`, an exact quantity of the clearing's past, unremarked. Neither is wistful and neither touches a person.
- **Bond categories: Trust, Intimacy, Recognition only.** Recognition appears twice (`-3-b-1-a-1-b`, `-5-a`), both the player's read, per the graph. No `surface_action` appears in any slot_type column — deeds are `action` slots.
- **No variants.** Node 5 gates on `frost_date_known` and auto-skips when false; all other slots serve both incoming states and both node-6 arrivals with one text.
- **Inventions (check 12), declared:** `prop` — the gathering cloth the cut lots rest on (`-3-s1`); `prop` — the steep pot at the stall (`-6-b-r1`); `world_fact` — the clearing's tree landmarks: a stand of birches at the treeline and a beech at the far edge (`-3-c-r1`, `-4-s`, `-4-b-r1`, `-6-a-r1`) — geography, so it rides up as a proposal rather than registering as scene furniture. Reused, not re-declared: `prop:maras-carrying-basket` (the thread doc's declared invention), waxed thread (`mara-set-for-two` C2, codex-adjacent). Quantities ("a hundred count," "two carries a day," "three summers," "the last dozen") are scene colour, undeclared by rule.
- **No fail state.** "Done or short" is carried as fuller-or-thinner margin in her count of the things (`-5-s`, `-5-a-r1`); the count comes in on every walk.
- **Node 5 reworded (ruled by Roc, 2026-08-10).** Shortfall-then-arithmetic — a deficit stated and solved down into steps — is Toby's licensed device, part of his self-versus-other axis; Mara's equivalent is the count carried by the things and their state. `-5-s` and `-5-a-r1` were rewritten to that axis under the amended thread doc — same beat, same records, same tone tag, same gate, same slot ids. Do not restore the arithmetic phrasing.
- **No World Truth stated; no fix granted; nothing competes with the drawer, the stool, the cup or the swept patch** — none of them exists at F1 and none is mentioned. `world:the-flood-year` goes unmentioned; the frost is a date in the weather (`-2-b-r1`).
- **Register lock, flagged not resolved:** two enum values appear across slots (`matter_of_fact` / `quiet`), same pattern the sibling files ship with. Read aloud the cadence never changes. Roc's standing call on per-scene vs per-slot applies here identically.
