# `ilsa-not-family` — C3 line slots · `SC-T4-13`

**Conversation:** C3, after the occasion. Carries R3 (the two seatings side by side, and neither woman moves — a re-touch of R1 and R2, no new cast fact). The yard is back at work and both seatings are still on the bench.
**Structure source:** `../ilsa-not-family.md` § "C3 — `SC-T4-13`", Choice designer 2026-08-09, **graphs approved by Roc 2026-08-10**. Nothing structural altered.
**Souls:** `ilsa` (`cast/ilsa.md`) and `pip` (`cast/pip.md`, texture — band 3–8 words, deflecting to the found thing). Written from `essence_descriptor` and `voice_register` only, plus `register.md` and the codex. Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts in their own column.
**Dialogue speakers:** `ilsa` unless a section note says otherwise. **Pip speaks** node 5's set-up and option `-b` responses. No walk-on anywhere in C3. Juno does not appear.

**Incoming states:** four — both flags (deep: all six nodes), `pip_place_seen` only (node 3 auto-skips at its gather), `guest_place_last` only (node 2 auto-skips at its gather), and fallback (both skip; the path rule 4 requires, no negated gate). **Every slot below is identical on every walk; no per-state variants required.**

**Staging vocabulary:** the yard back at work with the eve's layout still on the bench — bench, rack, hooks, files, blanks, the blank box, boards, bowls, bread, the house shelf, the good crock, the gate lamp, the yard gate. Reused from `world:ilsas-forge` and the earlier Ilsa line files except the declared invention below. Pip's bag is his round's furniture (`cast/pip.md`, postman this life — carded, not invented).

**Sanctioned long run:** none placed. Barred throughout this thread (rule 20); the thread ships with zero marked runs.

**Her uptake move** (register's move 3, her version): she acknowledges by *placing*. No question mark in any Ilsa line. **Every Ilsa sentence in C3 completes** — the grammar tell fired once, in C2, where the thread specs it, and nothing here re-runs it: the close of this conversation is settled ground, and her answers to both marks are placements, whole.

**Weight-node set-up:** node 3 has no spoken set-up — its set-up is `O-CH-T4-13-3-s`, because the added place still standing is a thing she has done and never mentions (check 8). The pairing R3 delivers is built from **adjacency**: node 2 lands and node 3 lands directly after it, with nothing spoken between them and no line in either node referring to the other seating.

---

## Scene opening

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-13-1` | object | matter_of_fact | **[action]** The yard is back at work, the fire up. Down the bench the places sit as she laid them for the eve, the order whole, and the added one still at the end. | 33 | — |

## `CH-T4-13-1` — the yard back at work

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-1-s` | dialogue | matter_of_fact | "Yard's back to work. Hooks, your end." | 7 | The day resumed and the player placed in it in one breath; nothing about the bench behind her is in the sentence, because to her nothing there needs saying. |

### Option `-a` — asks how the eve went *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-1-a-p` | player_line | matter_of_fact | "How was the rest of the eve?" | 7 | — |
| `L-CH-T4-13-1-a-r1` | dialogue | matter_of_fact | "Late enough. Everyone went home fed." | 6 | The recent span comes back rounded off, not accounted; the eve is answered as an arrangement that held, never as a story. |
| `L-CH-T4-13-1-a-r2` | dialogue | warm | "The crock went home full." | 5 | The good thing sent back filled, stated as a fact of the eve; the providing is the warmth and none of it is named. |

### Option `-b` — takes up work at their own end *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-1-b-act` | action | matter_of_fact | **[action]** [Take up work at your own end.] | — | — |
| `L-CH-T4-13-1-b-r1` | dialogue | matter_of_fact | "Blanks are in the box still." | 6 | The work handed over as standing fact; the taking-up goes unremarked because the end was already theirs. |

### Option `-c` — stays with the bench as it was left, saying nothing *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-1-c-act` | action | quiet | **[action]** [Stay with the bench as it was left, saying nothing.] | — | — |
| `L-CH-T4-13-1-c-r1` | dialogue | quiet | "Bench keeps. Come to the fire." | 6 | The looking absorbed without being read; the bench is left standing and the looker is placed at the work, which is her whole answer to a silence. |

*Records per graph: `-a` Trust; `-b` Intimacy; `-c` Intimacy.*

---

## `CH-T4-13-2` — the boy's place, back in the standing order *(gated `knows(pip_place_seen)`; unset, the node auto-skips to its gather)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-2-s` | dialogue | matter_of_fact | "Dishes to the shelf. Midday places next." | 7 | The eve cleared and the ordinary order begun in the same breath; the laying is work, never a subject. |

### Option `-a` — marks that his place has not moved *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-2-a-p` | player_line | quiet | "His place hasn't moved." | 4 | — |
| `L-CH-T4-13-2-a-r1` | dialogue | quiet | "It hasn't." | 2 | The fact confirmed flat, nothing added — no account of the order, no notice of anything to notice. |
| `L-CH-T4-13-2-a-r2` | dialogue | matter_of_fact | "Set yours down next to it." | 6 | Attention on her arrangement converts into the marker laying a place inside it — their own, by the boy's, as it went on an ordinary day before. |

### Option `-b` — works at the place next to it *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-2-b-act` | action | matter_of_fact | **[action]** [Work at the place next to it.] | — | — |
| `L-CH-T4-13-2-b-r1` | dialogue | matter_of_fact | "That's the spot. Dishes come to you." | 7 | The help folded into the order without remark; the order does the directing. |

*Records per graph: `-a` Recognition; `-b` Intimacy. Reference beat, no new fact; neither option touches the added place, which is the next node's.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-CH-T4-13-3-s` | object | quiet | **[action]** At the far end the added place is still set, plate and cup as she laid them. The eve's other things are gone from around it. | 26 | — |

## `CH-T4-13-3` — the added place has not been cleared *(the conversation's weight beat — rule 19; no spoken set-up; gated `knows(guest_place_last)`; unset, the node auto-skips to its gather)*

### Option `-a` — marks that the added place is still there *(spoken · Recognition · response spoken by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-3-a-p` | player_line | quiet | "The added place is still there." | 6 | — |
| `L-CH-T4-13-3-a-r1` | dialogue | quiet | "That's your place." | 3 | A placement rather than an answer, whole and complete: the place is handed over as already the player's, and where it sits — added, at the end — is not in the sentence and does not change. |

*No closing fragment. The run closes on the arrangement, with nothing following, per the content block.*

### Option `-b` — works around it and leaves it where it is *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-3-b-act` | action | quiet | **[action]** [Work around it and leave it where it is.] | — | — |

*The beat closes on the object slot with no dialogue at all, per the content block. Records per graph: `-a` Recognition; `-b` Intimacy.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T4-13-4` | action | matter_of_fact | **[action]** The last of the eve's things go back to the house shelf. The standing order sits down the bench for midday, place for place, nothing in it moved. | 28 | — |

## `CH-T4-13-4` — the everyday resumes

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-4-s` | dialogue | matter_of_fact | "Bread's to cut. Bowls after." | 5 | Midday run as it is always run; the day after the occasion is a day. |

### Option `-a` — asks whether tomorrow changes *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-4-a-p` | player_line | matter_of_fact | "Does tomorrow change any of it?" | 6 | — |
| `L-CH-T4-13-4-a-r1` | dialogue | matter_of_fact | "Hooks in the morning. Files after." | 6 | Tomorrow's arrangement stated flat and already decided; nothing in it has moved, and the answer is the plan, not a position. |
| `L-CH-T4-13-4-a-r2` | dialogue | matter_of_fact | "Pip's in after his round." | 5 | The boy's part of tomorrow given in the same grammar as the work; nothing distinguishes it from the hooks and the files. |

### Option `-b` — sets the eve's things away with her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-4-b-act` | action | matter_of_fact | **[action]** [Set the eve's things away with her.] | — | — |
| `L-CH-T4-13-4-b-r1` | dialogue | matter_of_fact | "Boards up on their ends first." | 6 | The help directed, not thanked; the putting-away is work like any other. |
| `L-CH-T4-13-4-b-r2` | dialogue | warm | "That's the eve put away." | 5 | The occasion closed small and complete, a job finished; what stays on the bench is not in the sentence. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T4-13-5-s` | action | matter_of_fact | **[action]** The boy comes through the gate off his round, bag still on his shoulder, takes his place at the bench without asking, and holds a stone out on his palm. | 30 | — |

## `CH-T4-13-5` — the boy back through, his place taken without asking *(set-up and option `-b` responses spoken by `pip`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-5-s` | dialogue | matter_of_fact | "Look. The hole goes clean through." | 6 | Pip — the witness recruited, the found thing held out; exact about the thing itself, and nothing about the sitting-down, because to him there is nothing in it. |

### Option `-a` — leaves the moment unremarked *(deed · Intimacy · response spoken by `ilsa`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-5-a-act` | action | matter_of_fact | **[action]** [Leave the moment unremarked.] | — | — |
| `L-CH-T4-13-5-a-r1` | dialogue | warm | "Bowls are still warm. Sit in." | 6 | The boy's arriving absorbed as the ordinary thing it is; everyone at the bench gets fed in the same sentence, and nobody is told anything about a place. |

### Option `-b` — asks the boy about the round *(spoken · Trust · responses spoken by `pip`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-5-b-p` | player_line | matter_of_fact | "How was the round?" | 4 | — |
| `L-CH-T4-13-5-b-r1` | dialogue | matter_of_fact | "It was lying in the wheel rut." | 7 | Pip — a question about the round answered with the found thing, exact about where it lay; the round itself does not come back. |
| `L-CH-T4-13-5-b-r2` | dialogue | matter_of_fact | "Fog had the rest of the lane." | 7 | Pip — the occasion of the finding is fog, said as weather; what he was out doing dissolves into it, per his grain. |

*Records per graph: `-a` Intimacy; `-b` Trust. Nobody remarks on him having a place — not Ilsa, not the player, not Pip.*

---

## `CH-T4-13-6` — close — both seatings on the bench, nothing settled

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-6-s` | dialogue | matter_of_fact | "Light's going. That's the hooks done." | 6 | The day closed by reading the work's state; the bench behind her keeps what it keeps, unspoken. |

### Option `-a` — says they will come to the next one *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-6-a-p` | player_line | matter_of_fact | "I'll come to the next one." | 6 | — |
| `L-CH-T4-13-6-a-r1` | dialogue | matter_of_fact | "You'll sit where you sat." | 5 | The return answered with a placement already decided: the player's seat exists and is theirs, and it is the seat it was — nothing has moved in either direction, and the telling is warm because the place is kept. |
| `L-CH-T4-13-6-a-r2` | dialogue | warm | "You know where the lamp lives." | 6 | The leaver trusted with the household's furniture; knowing where the lamp lives is what being inside the yard is, and nothing marks it. |

### Option `-b` — leaves the bench as she laid it *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-13-6-b-act` | action | matter_of_fact | **[action]** [Leave the bench as she laid it.] | — | — |
| `L-CH-T4-13-6-b-r1` | dialogue | warm | "Midday tomorrow. Your end's yours." | 5 | Tomorrow's place stated as already held; the flat end is a pause with the door open, and the thread ends where the arrangements are. |

*Records per graph: `-a` Trust; `-b` Intimacy. No concession, no repair, no last word; the seatings stay as laid.*

---

## Inventions declared *(codex checked first; reuse recorded)*

| invention_type | name | what | content_ids | codex_checked |
|---|---|---|---|---|
| prop | the holed stone | A stone with a hole worn clean through, Pip's find of the day, off the round | `A-CH-T4-13-5-s`, `L-CH-T4-13-5-s`, `L-CH-T4-13-5-b-r1` | nothing in `world:ilsas-forge` carries a found thing; Pip's card gives the shape, not the object |

**Reused, not invented:** bench, rack, hooks, files, blanks, the blank box (`ilsa-not-family` C1), boards, bowls, bread, the yard gate (`world:ilsas-forge`, C2), the house shelf, the good crock, the gate lamp (`ilsa-not-family` C2 inventions, referenced as declared there, nothing added). Fog, the wheel rut, and the boards' resting spot are scene colour, undeclared. Pip's bag rides his postman role (`cast/pip.md`). The two seatings themselves are R1 and R2 re-touched — C3 declares no `delta_cast` and no `delta_relational`, per the thread doc's delta table.

## Notes for the gate

- **No question mark in any Ilsa line; no proposal grammar.** Ilsa dialogue runs 2–7 words. Longest Ilsa line: 7 words (`L-CH-T4-13-1-s`, `L-CH-T4-13-2-s`, `L-CH-T4-13-2-b-r1`). Pip runs 4–7, inside his 3–8 band. Longest dialogue line in the file: 7 words.
- **R3 arrives as scene business whatever the player picks:** `O-SC-T4-13-1` (both seatings, before anyone speaks), `A-SC-T4-13-4` (the order out unchanged) and `A-CH-T4-13-5-s` (the boy's place taken without asking) are all on the spine, so every incoming state receives the whole surface.
- **The pairing lands by adjacency, never by statement.** On the both-flags walk node 2 lands and node 3 lands directly after it — two marks, two placements, nothing spoken between them. No line in either node refers to the other seating, no option puts the two side by side in words, and neither of her answers ("It hasn't." / "That's your place.") reaches past its own place. The holding-together happens only in the player.
- **All four incoming states walk:** both flags 1 → 2 → 3 → 4 → 5 → 6; `pip_place_seen` only 1 → 2 → 4 → 5 → 6; `guest_place_last` only 1 → 3 → 4 → 5 → 6; fallback 1 → 4 → 5 → 6. Every slot is identical on every walk; the gated nodes skip silently at their gathers, and no state dead-ends.
- **Neither woman wins.** Juno does not appear and no line revisits the argument. Ilsa's endpoint lines are placements: the added place stays the added place ("That's your place", "You'll sit where you sat") — the inclusion whole and the order unmoved in the same breath, which is *blood is tended*, never *blood is chosen*. Nothing records more for either side; the two Recognition marks record where places are, not who was right.
- **Nothing judges the player.** The warmth is unbroken (fed at node 5, provisioned at node 6, placed in the work at every turn); nothing is scored or recorded about them; the added place persisting is provision, handed to them as theirs, and no beat revisits their seat as a verdict.
- **Every Ilsa sentence completes.** The grammar tell fired in C2 and is not re-run here; her nearest approaches to the weight ("It hasn't.", "That's your place.") are flat, whole, and followed by nothing, per the content block's rule-19 builds.
- **Rule-19 build at node 3:** object (26w) → mark (6w) → placement fragment (3w) → nothing. On `-b` the beat closes on the object slot with no dialogue at all. No longer line carries any of it.
- **Pip in band and unaware:** 4–7 words, deflecting to the found thing, exact about the thing ("lying in the wheel rut") and fog about the occasion; his weight rides `A-CH-T4-13-5-s`, and nobody — Ilsa, player, or Pip — remarks on him having a place.
- **No accounting, no dating, no household history, no parent.** No number is said aloud; the order is places laid. No object is dated into the past.
- **Deflection instances:** `-1-c-r1`, `-2-a-r2`, `-5-a-r1` — attention on her, her arrangements, or a silence converts into somebody being placed or fed.
- **Offer-stands-alone test applied**; kept second clauses ("Sit in", "Files after") are instruction or plain fact, not justification.
- **Register lock:** scene locks `matter_of_fact`; `quiet`/`warm` appear on individual slots per the Toby C1 precedent — same standing flag for Roc (per-scene vs per-slot lock), not resolved here.
