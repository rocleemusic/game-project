# `ilsa-forge-short` — C3 line slots · `SC-T4-09`

**Conversation:** C3. Carries R3 by reference — the ore's non-arrival is `ilsa-kin-no-show` C1's declared situation, **referenced here, never re-declared** (check 3). What is new is the state change: the work stops at the fitting-place and the yard is rearranged around the gap.
**Structure source:** `../ilsa-forge-short.md` § "C3 — `SC-T4-09`", Choice designer 2026-08-09, **graphs approved by Roc 2026-08-10**. Nothing structural altered.
**Soul:** `ilsa` (`cast/ilsa.md`). Written from `essence_descriptor` and `voice_register` only, plus `register.md` and the codex. Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts in their own column.
**Speaker for all `dialogue` slots:** `ilsa`. No walk-on speaks; no other speaker appears.

**Incoming states:** four — both flags, `heat_shortfall_seen` only, `sheet_giving_only` only, fallback. Both gates are node-level (nodes 2 and 5) and auto-skip when their flag is unset. **No per-slot variants required.** All four walks land every ungated beat; no slot below assumes a gated beat was seen.

**Staging vocabulary:** the yard mid-work — bench, files, tongs, the vice, the fitting-place at the collar (`ilsa-kin-no-show` C1's staged socket), the crown, scroll ends, rails and brackets (C1's work queue), the rack by the door (C1), the sheet on its post (`world:arch-raising`), the gate. Reused except the declared inventions below.

**Sanctioned long run:** none placed. Barred throughout this thread (rule 20), and this is the conversation where the temptation is greatest; nothing here reaches for it.

**Her uptake move** (register's move 3, her version): she acknowledges by *placing*. No question mark in any Ilsa line. Node 3 is the thread's weight beat and runs rule 19 (action → fragment → action → nothing); **her sentence goes incomplete there** — the declarative about how the ore comes stops partway and nothing arrives to finish it. Every other Ilsa sentence completes.

**Weight-node set-ups:** node 3 has no spoken set-up — its set-up is `A-CH-T4-09-3-s`, because the stop is a thing that happens and is never mentioned (check 8). Node 5's set-up is the placed object slot `O-CH-T4-09-5-s`, gated entry only; no spoken set-up there either.

---

## Scene opening

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-09-1` | object | matter_of_fact | **[action]** The yard is mid-work, fire running steady. The centerpiece stands at the fitting-place at the end of the bench, brought up to it and no further. The work around it goes on. | 32 | — |

## `CH-T4-09-1` — arrival — the work up against the fitting-place

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-1-s` | dialogue | matter_of_fact | "Files this morning. She sits at the fitting till further on." | 11 | The day handed over as arranged; the stop is present in the sentence only as where the piece sits, and no reading of it is offered. |

### Option `-a` — asks what is left to do *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-1-a-p` | player_line | matter_of_fact | "What's left to do?" | 4 | — |
| `L-CH-T4-09-1-a-r1` | dialogue | matter_of_fact | "The fitting, then polish. The rest's done or near it." | 10 | The recent span comes back rounded off; the answer is an arrangement, never an account. |
| `L-CH-T4-09-1-a-r2` | dialogue | matter_of_fact | "Your files are out already." | 5 | The asker ends up placed; the place was set before the question arrived. |

### Option `-b` — takes up the work at the place she states *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-1-b-act` | action | matter_of_fact | **[action]** [Take up the work at the place she states.] | — | — |
| `L-CH-T4-09-1-b-r1` | dialogue | matter_of_fact | "Left of the vice. Long strokes." | 6 | The place stated, not offered; the work arrives with its manner and nothing else. |
| `L-CH-T4-09-1-b-r2` | dialogue | warm | "You've got the feel of it now." | 7 | Improvement noticed and said plainly, routed through the work rather than the person. |

### Option `-c` — stands with the piece where it stops *(deed · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-1-c-act` | action | matter_of_fact | **[action]** [Stand with the piece where it stops.] | — | — |
| `L-CH-T4-09-1-c-r1` | dialogue | matter_of_fact | "Room on that side. You're not in the way." | 9 | Standing witness is given a place like any other work; nothing about the stop is read, because node 3 is where the stop gets read. |

*Records per graph: `-a` Trust; `-b` Intimacy; `-c` Trust.*

---

## `CH-T4-09-2` — the rebuilt fire running for work that has stopped *(gated `knows(heat_shortfall_seen)`; unset, the node auto-skips)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-2-s` | dialogue | matter_of_fact | "Fire gets fed on the half hour. She holds her heat." | 11 | The fire's keeping stated as standing routine; what the heat is now for is not in the line. |

### Option `-a` — marks that the fire she made up is running for a piece that cannot go on *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-2-a-p` | player_line | quiet | "Your winter store, burning for work that's stopped." | 8 | — |
| `L-CH-T4-09-2-a-r1` | dialogue | quiet | "It burns the same either way." | 6 | The fact confirmed flat; no defense and no reckoning of the spend — the sentence is about the burning. |
| `L-CH-T4-09-2-a-r2` | dialogue | matter_of_fact | "Bellows, while you're standing there." | 5 | Attention on her comes back as the player's next place. |

### Option `-b` — keeps the fire fed anyway *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-2-b-act` | action | matter_of_fact | **[action]** [Keep the fire fed anyway.] | — | — |
| `L-CH-T4-09-2-b-r1` | dialogue | matter_of_fact | "Good. Hold her just there." | 5 | The tending absorbed into the routine without remark. |

*Records per graph: `-a` Recognition; `-b` Intimacy. Reference beat, no new fact.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T4-09-3-s` | action | quiet | **[action]** Ilsa brings the piece up to the fitting-place and offers it in. It does not pass. She sets it down where it stopped. | 23 | — |

## `CH-T4-09-3` — the work stops at the fitting-place *(the thread's weight beat — rule 19; no spoken set-up)*

### Option `-a` — marks that the work has stopped for a thing not in town *(spoken · sets `ore_short_named` · Recognition · moves `ilsa-forge-short`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-3-a-p` | player_line | quiet | "It's stopped for something that isn't in town." | 8 | — |
| `L-CH-T4-09-3-a-r1` | dialogue | quiet | "The fitting holds for it. It comes when…" | 8 | The declarative that carries her starts the sentence about how the ore arrives and cannot finish it; there is no settled sentence for the way it would have to come, and she does not reach for another. |
| `A-CH-T4-09-3-a-r` | action | quiet | **[action]** Ilsa lifts the stopped piece off the bench and sets it aside, clear of the day's work. | 17 | — |

*No closing fragment. Nothing fills the gap, per the content block; the run ends on the action slot.*

### Option `-b` — sets the piece down and leaves it where it stopped *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-3-b-act` | action | quiet | **[action]** [Leave the piece where it stopped.] | — | — |

*Records per graph: `-a` sets `ore_short_named`, Recognition, moves the thread; `-b` Intimacy. On `-b` the run closes on the deed with the stop unremarked — no response slot follows, per the content block.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T4-09-4` | action | matter_of_fact | **[action]** By midday the yard is turned around the gap. Rail work comes forward onto the cleared bench and the day runs on it. Nothing is said. | 26 | — |

## `CH-T4-09-4` — the yard rearranged around the gap

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-4-s` | dialogue | matter_of_fact | "Rails today. You're on the straightening." | 6 | The new order read out as decided, the player placed inside it; the gap it was made around goes unmentioned. |

### Option `-a` — carries the stopped piece to where she points *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-4-a-act` | action | matter_of_fact | **[action]** [Carry the stopped piece to where she points.] | — | — |
| `L-CH-T4-09-4-a-r1` | dialogue | matter_of_fact | "Top rail of the rack. Easy on the collar end." | 10 | Where things go was decided already; the player is simply told the order. |
| `L-CH-T4-09-4-a-r2` | dialogue | warm | "Two hands under the crown. She's heavier than she looks." | 10 | Care delivered as a fact about the piece, aimed at the carrying hands. |

### Option `-b` — asks what comes forward instead *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-4-b-p` | player_line | matter_of_fact | "What comes forward instead?" | 4 | — |
| `L-CH-T4-09-4-b-r1` | dialogue | matter_of_fact | "Rails today, brackets after. All of it lands in time." | 10 | The new order stated flat, already decided; no count of what the gap has cost. |
| `L-CH-T4-09-4-b-r2` | dialogue | matter_of_fact | "The fitting stays where I can see it." | 8 | The rearranging keeps the gap a place in the yard; nothing further is said of it. |

*Records per graph: `-a` Intimacy; `-b` Trust. The essence working — the gap covered by placement so nobody has to remark on it.*

---

## `CH-T4-09-5` — the sheet still up while the work waits *(gated `knows(sheet_giving_only)`; unset, the node auto-skips; set-up is the placed object slot — no spoken set-up)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-CH-T4-09-5-s` | object | quiet | **[action]** The raising sheet stands on its post past the gate, filling. Names run down the giving column. The other column is empty the length of the page. | 27 | — |

### Option `-a` — marks that the sheet is still up and her name still in the one column *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-5-a-p` | player_line | quiet | "Sheet's still up. Your name's still one side only." | 9 | — |
| `L-CH-T4-09-5-a-r1` | dialogue | matter_of_fact | "Vice end wants you. Rail's ready for truing." | 8 | The deflection doing its job — attention on her comes back as the asker being put somewhere, and the question stands unanswered without ever being refused. |
| `L-CH-T4-09-5-a-r2` | dialogue | matter_of_fact | "Straight edge is at your left hand." | 7 | The placing continues; the sheet is behind them now. |

### Option `-b` — squares the sheet on its post and leaves it *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-5-b-act` | action | quiet | **[action]** [Square the sheet on its post and leave it.] | — | — |
| `L-CH-T4-09-5-b-r1` | dialogue | matter_of_fact | "It'll stand till it's wanted." | 5 | The sheet's standing confirmed as furniture; which column is nobody's sentence. |

*Records per graph: `-a` Recognition; `-b` Intimacy. The mark states where the sheet is and where the name is, and stops — no counsel anywhere near the option.*

---

## `CH-T4-09-6` — the parts that can still go on

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-6-s` | dialogue | matter_of_fact | "Scroll ends can go on. They hang clear of the fitting." | 11 | What can move moves; the gap is a shape the work goes around, stated as sequence and nothing else. |

### Option `-a` — works the parts that can go on *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-6-a-act` | action | matter_of_fact | **[action]** [Work the parts that can go on.] | — | — |
| `L-CH-T4-09-6-a-r1` | dialogue | matter_of_fact | "Take the outer curl. Match mine." | 6 | The work split as standing arrangement. |
| `L-CH-T4-09-6-a-r2` | dialogue | warm | "That's a fair match. Keep it." | 6 | The noticing said plainly, routed through the iron. |

### Option `-b` — asks what the ore does in the piece *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-6-b-p` | player_line | matter_of_fact | "What does the ore do in the piece?" | 8 | — |
| `L-CH-T4-09-6-b-r1` | dialogue | matter_of_fact | "Any iron takes the shape. The weight wants the ore." | 10 | The substance and the shape split as a plain fact of the work — what makes C4's two endings legible — with nothing about how the ore might come. |
| `L-CH-T4-09-6-b-r2` | dialogue | matter_of_fact | "It goes in at the collar, last." | 7 | The sequence held open as arrangement, the same as ever. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## `CH-T4-09-7` — the day's end — tomorrow's order stated, the player placed in it

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-7-s` | dialogue | matter_of_fact | "Day's done. Tomorrow runs rails, then the scrolls." | 8 | Tomorrow read out as decided, the player assumed inside it; the stopped piece is not in the reading. |

### Option `-a` — takes the place she states *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-7-a-act` | action | matter_of_fact | **[action]** [Set your tools at the place she states for tomorrow.] | — | — |
| `L-CH-T4-09-7-a-r1` | dialogue | matter_of_fact | "They'll be waiting where you leave them." | 7 | The overnight holding of the place, carried in the tense. |

### Option `-b` — says they will come back *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-7-b-p` | player_line | matter_of_fact | "I'll come back tomorrow." | 4 | — |
| `L-CH-T4-09-7-b-r1` | dialogue | matter_of_fact | "First heat's yours. Vice end." | 5 | The return folded into the schedule as a standing place. |
| `L-CH-T4-09-7-b-r2` | dialogue | warm | "You wake her tomorrow. She's laid ready." | 7 | The fire's waking handed to the player as already theirs; being trusted with her forge's morning is the inclusion, unremarked. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## `CH-T4-09-8` — close — the fire banked, the fitting-place left as it is

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-8-s` | dialogue | matter_of_fact | "Fire's banked. The fitting stays as she sits." | 8 | The yard closed down for the night with the gap left standing in it, unremarked; nothing resolves. |

### Option `-a` — sets the tools by the stopped piece straight *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-8-a-act` | action | matter_of_fact | **[action]** [Set the tools by the stopped piece straight.] | — | — |
| `L-CH-T4-09-8-a-r1` | dialogue | warm | "They'll keep till they're wanted." | 5 | The deed folded in; the tools by the stopped piece stay ready, and nothing more is said of why. |
| `L-CH-T4-09-8-a-r2` | dialogue | matter_of_fact | "Gate's on the latch till you're through." | 7 | The way out held open for them, as furniture. |

### Option `-b` — asks what time the raising is *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-09-8-b-p` | player_line | matter_of_fact | "What time is the raising?" | 5 | — |
| `L-CH-T4-09-8-b-r1` | dialogue | matter_of_fact | "Midday. The piece goes over first." | 6 | The arrangement answered exactly; nothing in it about what state the piece will be in when it goes. |
| `L-CH-T4-09-8-b-r2` | dialogue | matter_of_fact | "You're at my end of the carry." | 7 | The player's part in raising day already held. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## Inventions declared *(codex checked first; reuse recorded)*

| invention_type | name | what | content_ids | codex_checked |
|---|---|---|---|---|
| prop | the bench vice | A vice at the working end of the bench, a fixed station in the yard | `L-CH-T4-09-1-b-r1`, `L-CH-T4-09-5-a-r1`, `L-CH-T4-09-7-b-r1` | nothing in `world:ilsas-forge` names a vice |
| prop | the straight edge | A straight edge kept at the rail-truing station | `L-CH-T4-09-5-a-r2` | nothing in `world:ilsas-forge` |
| prop | the yard gate latch | The yard gate kept on the latch for whoever is leaving | `L-CH-T4-09-8-a-r2` | the yard is `world:ilsas-forge`; no gate furniture named |

**Reused, not invented:** the fitting-place at the collar (staged in `ilsa-kin-no-show` C1 as the collar socket, referenced free), the ore and its not-being-in-town (`ilsa-kin-no-show` C1's declared situation — referenced, never re-declared), the winter store (`ilsa-forge-short` C1's declared cast fact, referenced in `-2-a-p` only), the rack by the door (C1's declared prop), rails and brackets and files (C1, scene colour), the sheet and its columns (`world:arch-raising`, C2), the crown, scroll ends as parts of the centerpiece (scene colour on an existing object), the raising (`world:arch-raising`). Bram appears nowhere. Quantities are scene colour throughout.

## Notes for the gate

- **No question mark in any Ilsa line; no proposal grammar.** Dialogue runs 5–11 words, most 5–9. Longest Ilsa lines: 11 words (`L-CH-T4-09-1-s`, `L-CH-T4-09-2-s`, `L-CH-T4-09-6-s`).
- **R3 arrives as scene business in all four states:** `O-SC-T4-09-1` (the piece stopped), `A-CH-T4-09-3-s` (the stop performed), `A-SC-T4-09-4` (the yard turned around it) are all on the spine.
- **The ore's non-arrival is referenced, never re-declared:** it appears only inside the player's mark ("something that isn't in town") and her `-6-b` answer about what the ore does — no slot delivers it as news.
- **Rule-19 build at node 3:** `A-CH-T4-09-3-s` (23w) → the mark (8w) → her fragment that stops partway (8w, `-3-a-r1` — "It comes when…", the declarative failing to finish because the true completion is a sentence she does not have) → `A-CH-T4-09-3-a-r` → **no closing fragment**. Her pressure-tell, not Toby's shorter sentence and not Mara's relocated one.
- **Node 5 is a mark, never counsel:** the option states where the sheet is and where the name is and stops; her response is pure deflection into placement, the question left standing, never refused. Nothing advises, nudges, or diagnoses.
- **No accounting anywhere.** `-1-a-r1` and `-4-b-r1` return the span rounded off ("done or near it", "lands in time"); nothing is counted out loud (failure mode 4 fenced).
- **Nothing corrects her, and no third party appears.** The player may do and may mark; no option reaches toward asking on her behalf.
- **`-6-b-r1` is the substance/shape distinction** delivered as a fact about the work, which is what makes C4's two endings legible without either being announced.
- **Option response counts:** `-1-c`, `-2-b`, `-5-b`, `-7-a` carry one response each; `-3-b` carries none — the content block closes that run on the deed itself, with the stop unremarked.
- **Offer-stands-alone test applied**; kept second clauses ("She's heavier than she looks", "She's laid ready") are the visible-care case (register move 6).
- **The flat end is a pause, not a chill:** `-8` closes on arrangements and a held-open gate, with the gap left standing in the yard and no line about it.
