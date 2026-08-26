# `toby-kept-and-returned` — C2 line slots · `SC-T2-20`

**Conversation:** C2, the keeping half of the circuit. Carries R2 (the shirt taken in, read, and worked on). **Mara only on screen — sanctioned by Roc, 2026-08-09.** All bond events record against `mara`; no Toby bond moves here.
**Structure source:** `../toby-kept-and-returned.md` § "C2 — `SC-T2-20`", graphs approved by Roc 2026-08-10, action layer included. Nothing structural altered. The divert on node 3 option `-a` is sanctioned (ruled 2026-08-09).
**Soul:** `mara` (`cast/mara.md`). Ceilings: dialogue 40 · action 60 · object 60 · player_line 12. Her declared band: 12–25 words ordinary dialogue; the present line goes thin only under weight.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Dialogue and player_line text in quotation marks; word counts in their own column.
**Speaker for all `dialogue` slots:** `mara`. No walk-on; nobody passes the stall.
**Incoming states:** two — fallback, and `shirt_shed` (node 4 reads it; gate false auto-skips, the ungated fallback). No drawn state variants; `A-CH-T2-20-5-s` renders on the diverted entry only, per the graph.
**Drawer continuity:** the drawer is Mara's locked canon and is **reference only** here — not re-explained, not inventoried, not emptied, never rendered as lost property. `prop:adrens-doll` does not appear; no provenance run occurs; the shirt is not narrated. Ilsa's apron is in no beat.
**Staging vocabulary:** her stall on Market Row — crates of cut herbs, bundles, tying, tonic jars, the bench, the drawer on its runners, needle and thread, the drying line.

**Sanctioned long run: none placed.** Her licence reaches provenance only, and the shirt is the one object barred from provenance treatment.

---

## Scene opening — before node 1

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T2-20-1` | object | matter_of_fact | **[action]** At the stall's end the drawer stands open on unclaimed things. A scorched shirt lies folded on top, the collar turned up, a thread already through its edge. | 28 | — |
| `A-SC-T2-20-1` | action | matter_of_fact | **[action]** Mara puts a crate of cut herbs into the player's hands without a greeting. | 14 | — |

## `CH-T2-20-1` — arrival, the tending already going

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-1-s` | dialogue | matter_of_fact | "Strip those to the second joint while you're standing there. The frost lot won't keep past today." | 17 | Welcome by enlistment: the job and its deadline given in one breath. |

### Option `-a` — takes the job she hands over *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-1-a-act` | action | matter_of_fact | **[action]** [Take the crate and start stripping the stems] | — | — |
| `L-CH-T2-20-1-a-r1` | dialogue | matter_of_fact | "Second joint, mind, the lower leaves go bitter in the jar. You'd taste it come frost." | 16 | She explains the thing while her hands do it; the explaining is the warmth. |
| `L-CH-T2-20-1-a-r2` | dialogue | matter_of_fact | "There used to be two crates of the frost lot by now. This year the one." | 16 | The past tense arrives on a count she is exact about. She does not notice it. |

### Option `-b` — asks what the job is for *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-1-b-p` | player_line | matter_of_fact | "What are these for?" | 4 | — |
| `L-CH-T2-20-1-b-r1` | dialogue | matter_of_fact | "The tonic. These are the bittering leaves, they go in dry and they're the last thing in." | 17 | Answered with the thing and its condition, fully and warmly; no reason offered. |
| `L-CH-T2-20-1-b-r2` | dialogue | matter_of_fact | "Strip while you ask, we can do both." | 8 | The asker enlisted mid-answer, which is how she lets them stay. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T2-20-2-s` | action | matter_of_fact | **[action]** She works past the open drawer without a look at it. The thread waits in the shirt's collar where the mend is begun. | 23 | — |

## `CH-T2-20-2` — the shirt in the drawer, the mend begun *(three options)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-2-s` | dialogue | matter_of_fact | "Mind the drawer with your elbows. The left runner sticks, it's easier out than half-shut." | 15 | The drawer accounted for as hardware, nothing about what it holds. |

### Option `-a` — turns the collar and reads the stitched name *(deed · sets `collar_name_known` · Recognition · moves `toby-kept-and-returned`)*

The reading is the player's own act. She does not offer it, does not point at it, and does not remark when it happens — the responses carry the tending on, unbroken.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-2-a-act` | action | quiet | **[action]** [Turn the collar and read the name stitched inside] | — | — |
| `L-CH-T2-20-2-a-r1` | action | matter_of_fact | **[action]** Mara ties off a bundle and reaches for the next. Her eyes stay on her hands. | 16 | — |
| `L-CH-T2-20-2-a-r2` | dialogue | matter_of_fact | "The jars want counting next, there's meant to be twenty of the small." | 13 | The tending goes on unbroken; what the player just read is left entirely theirs. |

### Option `-b` — asks how far the mend has got *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-2-b-p` | player_line | matter_of_fact | "How far along is that mend?" | 6 | — |
| `L-CH-T2-20-2-b-r1` | dialogue | matter_of_fact | "Collar's tacked and the seam's true again. The scorch wants a patch cut yet, that's the evening's work." | 18 | The mend accounted in stitches and time, exact about the object, silent about any person. |
| `L-CH-T2-20-2-b-r2` | dialogue | matter_of_fact | "Cloth that's worked hot takes the needle better than new. It's held a shape already." | 15 | Plain fact about the thing, close to beauty, said as fact and left there. |

### Option `-c` — sets it back as she had it, leaves the drawer alone *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-2-c-act` | action | matter_of_fact | **[action]** [Set the shirt back as she had it and leave the drawer alone] | — | — |
| `L-CH-T2-20-2-c-r1` | dialogue | matter_of_fact | "Collar up, yes. It sits so the thread doesn't pull when the drawer runs." | 14 | The restraint met with the object's own logic; nothing else is in it. |

*Records per graph: `-a` sets `collar_name_known`, Recognition, moves the thread; `-b` Trust; `-c` Intimacy.*

---

## `CH-T2-20-3` — the mend that does not erase *(the weight beat — rule-19 build)*

Fragment → action → shorter fragment. Her weight goes into the fragments and the action beat; no line carries it. Ids split `-s1` / `-s2` around the thread's own `A-CH-T2-20-3-s`.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-3-s1` | dialogue | matter_of_fact | "The patch goes on whole." | 5 | The mend stated as method, begun where the damage is worst. |
| `A-CH-T2-20-3-s` | action | quiet | **[action]** She lays the patch over the scorch and pins it. The burnt edge stays where it is, under the new cloth's border. | 22 | — |
| `L-CH-T2-20-3-s2` | dialogue | quiet | "Nothing gets trimmed." | 3 | The rule of her mending, given as procedure and nothing more. |

### Option `-a` — takes up the mend beside her and works it *(deed · Intimacy · DIVERT → `CH-T2-20-5`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-3-a-act` | action | matter_of_fact | **[action]** [Take up the needle and work the patch's far side beside her] | — | — |
| `L-CH-T2-20-3-a-r1` | dialogue | matter_of_fact | "Small stitches on the turn, you can go long on the straight. It'll outlast the rest of the shirt." | 19 | Enlistment answered with teaching; the work is the welcome, and the claim is about the cloth. |

### Option `-b` — asks why the burn is left showing *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-3-b-p` | player_line | matter_of_fact | "Why leave the burn showing?" | 5 | — |
| `L-CH-T2-20-3-b-r1` | dialogue | matter_of_fact | "A patch over the top holds. Cut the scorch out and you're sewing edge to edge, and it goes again first wash." | 22 | The answer is all cloth; what the showing means is not hers to say. |

*Records per graph: `-a` Intimacy, then diverts to node 5 — sanctioned; `-b` Recognition.*

---

## `CH-T2-20-4` — this one was set down, not lost *(gated `knows(shirt_shed)`)*

Gate false: the node auto-skips to the gather — the not-knowing case as the ungated fallback, no negation drawn. The diverted path also never reaches it, per the graph.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-4-s` | dialogue | matter_of_fact | "That one's this week's. The rest have been in longer." | 10 | The drawer's contents dated the way she dates a hinge; nothing about where or whose. |

### Option `-a` — marks that it was put down, not dropped *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-4-a-p` | player_line | quiet | "That shirt was set down, not lost." | 7 | — |
| `L-CH-T2-20-4-a-r1` | dialogue | quiet | "It came in unclaimed. It's here now, and it's being kept." | 11 | The fact taken in and answered with the drawer's whole law; no person is asked after. |
| `L-CH-T2-20-4-a-r2` | dialogue | matter_of_fact | "Hold the collar flat while I get the shoulder." | 9 | The knowing folded into the tending; a job goes into the knower's hands. |

### Option `-b` — leaves the knowing where it is, gets on with the tending *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-4-b-act` | action | matter_of_fact | **[action]** [Leave it where it is and get back to the bundles] | — | — |
| `L-CH-T2-20-4-b-r1` | dialogue | matter_of_fact | "Tie the loose ones first, they've been cut longest." | 9 | The work receives them; nothing else is asked. |

*Records per graph: `-a` Recognition; `-b` Intimacy. She does not say she will give it back, does not ask whose it is, and does not work out who he is.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T2-20-5-s` | action | quiet | **[action]** The player's hands are still in the work when she eases the drawer shut. | 14 | Diverted entry only — the gather path arrives at node 5 without this slot. |

## `CH-T2-20-5` — leave-taking, the drawer shut on an unfinished mend *(gather point and divert target)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-5-s` | dialogue | matter_of_fact | "That'll do for today. The mend keeps, and the bundles are wanted at the drying line first thing." | 18 | The day closed as a list; the unfinished mend filed with everything else that keeps. |

### Option `-a` — puts the tools back the way she keeps them *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-5-a-act` | action | matter_of_fact | **[action]** [Wind the thread and set the needle back where she keeps it] | — | — |
| `L-CH-T2-20-5-a-r1` | dialogue | matter_of_fact | "Point-down, so the damp doesn't sit in the eye. You've put tools away before." | 14 | Instruction plus plain notice of the player's hands; her warmth stays on the object. |

### Option `-b` — asks whether there is more mending next time *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T2-20-5-b-p` | player_line | matter_of_fact | "Is there more mending for next time?" | 7 | — |
| `L-CH-T2-20-5-b-r1` | dialogue | matter_of_fact | "There's always more. Come when you're passing and I'll have something for your hands." | 14 | The return enlisted, which is the nearest thing to an answer she gives anyone. |
| `L-CH-T2-20-5-b-r2` | dialogue | quiet | "The drawer shut flush once, years back. It hasn't since." | 10 | The past tense arrives on the drawer's hardware, uninvited; she moves on. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## Notes for the gate

- **Slot count:** 39 rows — 20 `dialogue`, 6 `player_line`, 7 deed `action`, 4 spine/set-up `action` (one diverted-entry only), 1 response `action` (`-2-a-r1`), 1 `object`. Any single walk sees fewer.
- **All bond events record against `mara`.** No Toby bond moves anywhere in this file; no `delta_cast` is spent on either soul, per the Architect's declaration.
- **Band check.** Ordinary Mara lines run 13–19 words; longest 22 (`L-CH-T2-20-3-b-r1`). The lines under her 12-word floor are the rule-19 fragments at node 3 (`-s1` 5 w, `-s2` 3 w), the gated node-4 set-up and its first response near the drawer's weight (10 / 11 w), and the closing tense-tell (10 w) — authored thin-present beats, not clipping.
- **Restoration, not anticipation.** No line says or implies the mend is for him, that she means to give it back, or that she has worked out whose it is. The mend is aimed at the object throughout (`-2-b-r1/r2`, `-3-a-r1`, `-3-b-r1`, `-4-a-r1`); nobody remarks on the symmetry with Toby's channel.
- **The reading is unremarked:** option `-2-a`'s responses are an action (she keeps tying) and a work line; she never acknowledges the collar being turned.
- **Tense tell placed twice** (`-1-a-r2`, `-5-b-r2`), each on an exact detail — a count of crates, the drawer's fit — none noticed by her, none wistful. Tempo, uptake and warmth unchanged through both.
- **Rule-19 build at node 3:** `-s1` (5 w) → `A-CH-T2-20-3-s` (the patch over the scorch, the burn left) → `-s2` (3 w).
- **Drawer continuity held:** referenced as hardware (`-2-s`) and closed at the end; never inventoried, never explained, nothing taken out and given to anyone. The left-runner detail reuses the locked fact from `mara-set-for-two-C1.md` unchanged. `prop:adrens-doll` absent; no provenance run; no apron in any beat.
- **Bond categories:** Trust, Intimacy, Recognition only (Respect retired 2026-08-10).
- **Closed paths unchanged:** never picking `-2-a` leaves without `collar_name_known` (`CH-T2-21-4` stays shut; `ex-drawer-shirt`, PROPOSED, is the pickup while C3 is unplayed). A diverted player holding `shirt_shed` may skip node 4 — depth only, closes nothing.
- **Inventions (guardrails check 12), codex checked first:** none. Crates, bundles, tonic jars, the frost herbs, the trough-side work, the drying line and the drawer's runner are all established at this stall (`mara-set-for-two` lines, ratified canon); needle and thread are the mend the thread doc declares. Quantities ("twenty of the small") are scene colour, undeclared by rule.
- **No accrual:** nothing counts stitches, visits or jobs; the single `thread_move` rides `-2-a`.
- **No World Truth stated; no trait phrased in herbalist terms.** She never names what the keeping is for.
- **Register lock, flagged not resolved:** scene locks `matter_of_fact`; `quiet` appears per slot, same standing question as the other line files.
