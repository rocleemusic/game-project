# `toby-kept-and-returned` — C3 line slots · `SC-T2-21`

**Conversation:** C3, the return. Carries R3 (the limit: it comes back, and the reflex finds nothing to do). Toby **and** Mara on screen.
**Structure source:** `../toby-kept-and-returned.md` § "C3 — `SC-T2-21`", graphs approved by Roc 2026-08-10, action layer included. Nothing structural altered. Nesting runs to depth 2 on node 2, per the graph.
**Souls:** `toby` (`cast/toby.md`) and `mara` (`cast/mara.md`) — each written to their own card and band; a **speaker** column carries who owns each line. Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Dialogue and player_line text in quotation marks; word counts in their own column.
**Incoming states:** four — `shirt_shed` × `collar_name_known`. Node 3 reads `shirt_shed`, node 4 reads `collar_name_known`; each gate false auto-skips (the ungated fallback, no negation). The return itself is situation and reaches every state; no drawn state variants — no slot's text varies by flag, only which nodes open.
**Sets no flag, records no `thread_move`** — the ending is the reflex stalled, not an outcome, and nothing downstream may gate on it. Nothing here fires `toby-unopened-jam`, sets or reads `gave_unowed` or `shelf_named`, or moves the shelf.
**Staging vocabulary:** festival eve at her stall's end — the counter, jars and lids, the last bundles, the drying line, lanterns going up along the row, the well end.

**Sanctioned long run: none placed** — barred by the brief and by both cards: he is receiving and seen throughout, and her licence reaches provenance only, which the shirt is barred from.

**Naming bar:** no line, option or response says what is happening to him. The deep picks mark and stop. Mara does not say she kept it, why she mended it, or anything about the name; the shirt is handed back, not narrated.

---

## Scene opening — before node 1

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `O-SC-T2-21-1` | object | matter_of_fact | — | **[action]** Festival eve at the stall's end. The shirt lies folded on the counter between them, the patch uppermost. | 18 | — |

## `CH-T2-21-1` — festival eve at the stall's end

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-1-s` | dialogue | matter_of_fact | mara | "There's tying still to do if you're stopping, the eve won't slow for it." | 14 | Welcome by enlistment; the eve stated as workload, the counter left to itself. |

### Option `-a` — takes up the work at hand, leaves the counter to them *(deed · Intimacy · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-1-a-act` | action | matter_of_fact | — | **[action]** [Take up the tying and leave the counter to the two of them] | — | — |
| `L-CH-T2-21-1-a-r1` | dialogue | matter_of_fact | toby | "Knots want doubling, wind's up tonight." | 6 | The room's attention pointed at the work, which is where he can stand. |

### Option `-b` — asks her whether the mend is finished *(spoken · Trust · mara)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-1-b-p` | player_line | matter_of_fact | player | "Is the mend finished?" | 4 | — |
| `L-CH-T2-21-1-b-r1` | dialogue | matter_of_fact | mara | "Finished last night. The patch is felled all round and the seam took the strain out." | 16 | Stitches and time, exact about the object; whose it is stays unsaid. |

*Records per graph: `-a` Intimacy · toby; `-b` Trust · mara. Neither moves the shirt.*

---

## `CH-T2-21-2` — the return: patch showing, name intact, nothing said *(the thread's heaviest beat — rule-19 build)*

Fragment → action → shorter fragment. The weight is the turning-back and it lives in the action slot. Ids split `-s1` / `-s2` around the thread's own `A-CH-T2-21-2-s`.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-2-s1` | dialogue | quiet | mara | "Hold your hands out." | 4 | The return made as a job like any other; nothing about having done it. |
| `A-CH-T2-21-2-s` | action | quiet | — | **[action]** She puts the shirt into his hands and turns back to her work. | 13 | — |
| `L-CH-T2-21-2-s2` | dialogue | quiet | toby | "Right." | 1 | The reflex reaches for a footing and finds one word of it. |

### Option `-a` — names that the patch is where the burn was *(spoken · Recognition · toby)*

The response is the nested child's set-up — he does not reply inside this option; the child is the reply.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-2-a-p` | player_line | quiet | player | "The patch is right where the burn was." | 8 | — |

### Option `-b` — stays still and lets the seconds run *(deed · Intimacy · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-2-b-act` | action | quiet | — | **[action]** [Stay still and let the seconds run] | — | — |
| `L-CH-T2-21-2-b-r1` | action | quiet | — | **[action]** He turns the shirt over once in his hands. The stall noise carries on past the counter. | 17 | — |
| `L-CH-T2-21-2-b-r2` | dialogue | quiet | toby | "Anyways. Jars." | 2 | The deflection restarting on the nearest object; two words is all the footing it finds. |

*Records per graph: `-a` Recognition · toby, then enters the nested child; `-b` Intimacy · toby.*

---

## `CH-T2-21-2-a-1` (node 2 › option a › child 1) — the reflex starts: nothing to send back with it

The child's set-up **is** the action slot, per the content block. It carries no dialogue.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `A-CH-T2-21-2-a-1-s` | action | quiet | — | **[action]** His free hand goes to the counter and finds nothing on it. | 12 | — |

### Option `-a` — marks that his hands have found nothing *(spoken · Recognition · toby)*

The response is the nested grandchild's set-up — the grandchild is the reply.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-2-a-1-a-p` | player_line | quiet | player | "The counter's empty." | 3 | — |

### Option `-b` — gives him the seconds, looks elsewhere *(deed · Intimacy · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-2-a-1-b-act` | action | quiet | — | **[action]** [Give him the seconds and look elsewhere] | — | — |
| `L-CH-T2-21-2-a-1-b-r1` | action | quiet | — | **[action]** Toby squares the fold of the shirt and holds it. | 10 | — |

*Records per graph: `-a` Recognition · toby, then enters the grandchild; `-b` Intimacy · toby.*

---

## `CH-T2-21-2-a-1-a-1` (node 2 › option a › child 1 › option a › child 1 — depth 2, the ceiling) — the other route is shut too

The grandchild's set-up **is** the action slot, per the content block — rule-19's last piece.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `A-CH-T2-21-2-a-1-a-1-s` | action | quiet | — | **[action]** The reach stops. He holds the shirt and does not put it down. | 13 | — |

### Option `-a` — lets it stand, says nothing more *(deed · Intimacy · toby)*

Per the content block, this run closes on the set-up action slot with no further line — the structural form of a reflex with nowhere to go. No response slots are authored.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-2-a-1-a-1-a-act` | action | quiet | — | **[action]** [Let it stand. Say nothing more.] | — | — |

### Option `-b` — marks that it was his before it was given *(spoken · Recognition · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-2-a-1-a-1-b-p` | player_line | quiet | player | "It was yours before it was given." | 7 | — |
| `L-CH-T2-21-2-a-1-a-1-b-r1` | dialogue | quiet | toby | "It was." | 2 | The fact confirmed plainly; there is nothing after it, and he builds nothing there. |
| `L-CH-T2-21-2-a-1-a-1-b-r2` | action | quiet | — | **[action]** Toby folds the shirt once more along its crease and holds it. | 12 | — |

*Records per graph: `-a` Intimacy · toby; `-b` Recognition · toby. Neither option resolves anything; no response explains, thanks, or converts.*

---

## `CH-T2-21-3` — it went into the pile and came back out *(gated `knows(shirt_shed)`)*

Gate false: the node auto-skips — the not-knowing case as the ungated fallback, no negation drawn.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-3-s` | dialogue | quiet | toby | "Good patch." | 2 | The object given the smallest true word he has; how it got here stays unopened. |

### Option `-a` — marks that it went into the pile and came back *(spoken · Recognition · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-3-a-p` | player_line | quiet | player | "I watched it go into the rag pile." | 8 | — |
| `L-CH-T2-21-3-a-r1` | dialogue | quiet | toby | "Mm." | 1 | The last cover gone; one sound is what is left of the answer. |
| `L-CH-T2-21-3-a-r2` | action | quiet | — | **[action]** His hands go back to the jars in front of him. | 11 | — |
| `L-CH-T2-21-3-a-r3` | dialogue | warm | toby | "Watch the rims, they chip." | 5 | The warmth holds and goes out sideways, onto the player's hands. |

### Option `-b` — keeps what the player saw to themselves, leaves him the counter *(deed · Intimacy · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-3-b-act` | action | quiet | — | **[action]** [Keep what you saw to yourself and leave him the counter] | — | — |
| `L-CH-T2-21-3-b-r1` | dialogue | quiet | toby | "Pass the small jars over." | 5 | The counter left to him is spent on work, with the player kept inside it. |

*Records per graph: `-a` Recognition · toby; `-b` Intimacy · toby.*

---

## `CH-T2-21-4` — she mended around the name *(gated `knows(collar_name_known)`)*

Gate false: the node auto-skips. The set-up is the object slot the graph places here; a spoken set-up over the name would breach the naming bar, and none is authored.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `O-CH-T2-21-4-s` | object | quiet | — | **[action]** The collar lies turned back. The stitched name is whole, the patch close beside it. | 15 | — |

### Option `-a` — marks that the stitched name was left alone *(spoken · Recognition · mara)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-4-a-p` | player_line | quiet | player | "You stitched around the name." | 5 | — |
| `L-CH-T2-21-4-a-r1` | dialogue | matter_of_fact | mara | "That stitching's older than the burn. It wasn't any part of what needed the needle." | 15 | The answer stays on the cloth; why she left it is not offered. |

### Option `-b` — folds the collar back down, leaves it unremarked *(deed · Trust · mara)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-4-b-act` | action | quiet | — | **[action]** [Fold the collar back down and leave it unremarked] | — | — |
| `L-CH-T2-21-4-b-r1` | dialogue | matter_of_fact | mara | "The jars want their lids while you're here, they're under the bench." | 12 | The tending done by the player's hands is met with more of it. |

*Records per graph: `-a` Recognition · mara; `-b` Trust · mara.*

---

## `CH-T2-21-5` — nowhere for it to go: worn or not worn, both live *(three options)*

The set-up is the object slot the graph places here — the unsettled ending is a thing, so the slot is `object`; no spoken set-up is authored over it.

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `O-CH-T2-21-5-s` | object | quiet | — | **[action]** The shirt sits in his hands, still folded. It does not go back to the counter and it does not go anywhere else. | 23 | — |

### Option `-a` — leaves him the choice, turns to the stall work *(deed · Intimacy · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-5-a-act` | action | matter_of_fact | — | **[action]** [Turn to the stall work and leave him the choice] | — | — |
| `L-CH-T2-21-5-a-r1` | dialogue | matter_of_fact | toby | "Lanterns are up at the well end already." | 8 | The beat let go outward; the eve supplies the direction his talk needs. |

### Option `-b` — asks Mara for the next piece of the tending *(spoken · Trust · mara)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-5-b-p` | player_line | matter_of_fact | player | "What's next on the tending?" | 5 | — |
| `L-CH-T2-21-5-b-r1` | dialogue | matter_of_fact | mara | "The last bundles want carrying to the line, and the low jars come up after." | 15 | The attention taken and spent on the work, which is the kindness doing its job. |

### Option `-c` — marks that the patch shows either way *(spoken · Recognition · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-5-c-p` | player_line | quiet | player | "That patch will show whether you wear it or not." | 10 | — |
| `L-CH-T2-21-5-c-r1` | dialogue | quiet | toby | "It will." | 2 | The fact taken whole; what to do with it is not in the answer. |
| `L-CH-T2-21-5-c-r2` | action | quiet | — | **[action]** He sets the shirt to one side, near his own things. | 11 | — |

*Records per graph: `-a` Intimacy · toby; `-b` Trust · mara; `-c` Recognition · toby. None of the three settles what he does with it.*

---

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `A-SC-T2-21-6` | action | matter_of_fact | — | **[action]** Lanterns go up along the row past the stall. The eve moves on around the counter. | 16 | — |

## `CH-T2-21-6` — leave-taking, nothing settled

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-6-s` | dialogue | matter_of_fact | toby | "Square'll want bread before the lamps are all lit. I'd best get on." | 13 | Leave-taking as schedule, pointed at the festival and away from the counter. |

### Option `-a` — leaves the two of them to the stall's end *(deed · Intimacy · mara)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-6-a-act` | action | matter_of_fact | — | **[action]** [Leave the two of them to the stall's end] | — | — |
| `L-CH-T2-21-6-a-r1` | dialogue | matter_of_fact | mara | "Take the near lantern down the row as you go, it's wanted at the well end." | 16 | The goodbye is a job in the leaver's hands, the same as any welcome. |

### Option `-b` — asks what the eve still needs of them *(spoken · Trust · toby)*

| slot id | slot_type | tone | speaker | text | W | speaker_intent |
|---|---|---|---|---|---|---|
| `L-CH-T2-21-6-b-p` | player_line | matter_of_fact | player | "What does the eve still need doing?" | 7 | — |
| `L-CH-T2-21-6-b-r1` | dialogue | matter_of_fact | toby | "Bread to the square, and the stalls want their fronts down by dark." | 13 | The answer runs outward at full speed; the counter behind him is not in it. |
| `L-CH-T2-21-6-b-r2` | dialogue | warm | toby | "Come by the square when the lamps go round. There'll be plenty." | 12 | The invitation rides on the feast's surplus so nothing owes on it. |

*Records per graph: `-a` Intimacy · mara; `-b` Trust · toby. The fallback player exits through real content.*

---

## Notes for the gate

- **Slot count:** 49 rows — 19 `dialogue`, 8 `player_line`, 9 deed `action`, 5 spine/set-up `action`, 5 response/interleave `action`, 3 `object`. Any single walk sees fewer.
- **No flag set, no `thread_move` recorded** — verified against every row. Both live options at the close (worn, not worn) stay open; no response on any path states which way it went; nobody names what is happening to him.
- **Whose card governs what:** Mara speaks in `-1-s`, `-1-b-r1`, `-2-s1`, `-4-a-r1`, `-4-b-r1`, `-5-b-r1`, `-6-a-r1` — 12–16 words each except the `-2-s1` weight fragment (4 w, thin-present, authored). Toby speaks everywhere else — his receiving lines run 1–2 words, his outward lines 5–13. No beat lends either the other's register.
- **The instrument fires as designed:** under the thread's heaviest beats his sentence collapses — "Right." (1) · "Anyways. Jars." (2) · "It was." (2) · "Mm." (1) · "Good patch." (2) · "It will." (2) — while warmth stays intact and outward (`-3-a-r3`, `-6-b-r2`).
- **Rule-19 builds:** node 2 — `-s1` (4 w) → `A-CH-T2-21-2-s` (she turns back to her work) → `-s2` (1 w). The grandchild — set-up action → and on the sit-with option the run **ends on the action slot with no further line**, per the content block; no response slots are authored for `-2-a-1-a-1-a`, which is the sanctioned exception to the response-slot pattern.
- **Options `-2-a` and `-2-a-1-a` carry no response slots** — each child's set-up is the reply, per the content block; same pattern as `toby-feast-short-C1.md` node 2.
- **Nodes 4 and 5 take their set-up from the object slot the graph places there;** no spoken set-up line is authored for either — over the name it would breach the naming bar, and over the shirt-in-hands it would settle what the design leaves unsettled. If the gate wants a spoken set-up on either node, that is a re-spec question to Roc, not a quiet add.
- **Every route stays shut:** no order, no shortfall, no errand, no third party, no key item, no `gift`, no inventory transaction. The shirt is handed back, not narrated; Mara gives it no provenance and does not remark on the name (`-4-a-r1` is about the stitching's age, not the name).
- **Bond categories:** Trust, Intimacy, Recognition only (Respect retired 2026-08-10). Deep picks record Recognition, sit-with picks Intimacy, never inverted.
- **Closed paths unchanged:** missed `shirt_shed` skips node 3, missed `collar_name_known` skips node 4 — depth only; the fallback walk still gets node 1, node 2 with both nested levels, the three-option node and the close.
- **Inventions (guardrails check 12), codex checked first:** none. The counter, jars and lids, bundles, the drying line, the lanterns rising from the well end and the row's geography are all established at this stall or in ratified canon (`mara-set-for-two` lines; the thread doc's own staging). Quantities are scene colour.
- **No accrual:** nothing reads how much the player did in C1 or C2; the return happens identically whatever was picked.
- **No World Truth stated; no fix granted.** The shirt coming back is a mechanism finding its edge, and the last line of the thread points at the festival, not at him.
- **Register lock, flagged not resolved:** scene locks `matter_of_fact`; `quiet` and `warm` appear per slot, same standing question as the other line files.
