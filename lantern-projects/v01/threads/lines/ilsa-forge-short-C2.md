# `ilsa-forge-short` — C2 line slots · `SC-T4-08`

**Conversation:** C2. Carries R2 (her name goes in the giving column of the raising sheet and never in the asking one).
**Structure source:** `../ilsa-forge-short.md` § "C2 — `SC-T4-08`", Choice designer 2026-08-09, **graphs approved by Roc 2026-08-10**. Nothing structural altered.
**Soul:** `ilsa` (`cast/ilsa.md`). Written from `essence_descriptor` and `voice_register` only, plus `register.md` and the codex. Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts in their own column.
**Speaker for all `dialogue` slots:** `ilsa`. No walk-on speaks — the neighbours at the sheet are business inside the object and action slots.

**Incoming states:** two — `knows(heat_shortfall_seen)` (deep) and the fallback. The gate is node-level: node 2 auto-skips when the flag is unset. **No per-slot variants required.**

**Staging vocabulary:** the yard, fire holding — bench, files, tongs, the crown and collar of the centerpiece, her own stock, the gate, the raising sheet on its post (`world:arch-raising`), the peg. Reused except the declared inventions below.

**Sanctioned long run:** none placed. Barred throughout this thread (rule 20).

**Her uptake move** (register's move 3, her version): she acknowledges by *placing* — the answer to a question is where somebody or something goes, stated as already decided. No question mark in any Ilsa line. The child node under the sheet is the weight beat and runs rule 19 (act → fragment → action → nothing); **her sentence goes incomplete there** — the declarative starts the clause about the other column and fails to finish it. Every other Ilsa sentence completes.

**Weight-node set-ups:** node 4 has no spoken set-up — per the content block its set-up is `A-CH-T4-08-4-s`, because what it carries is a thing she does and never mentions (check 8).

---

## Scene opening

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-08-1` | object | matter_of_fact | **[action]** The fire holds at working heat. The centerpiece stands part-shaped on the bench, further along than it was. At the crown seat a stay is wanting, and nothing on the bench is that shape. | 34 | — |

## `CH-T4-08-1` — arrival — a part the centerpiece needs is missing

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-1-s` | dialogue | matter_of_fact | "She's holding. We're one stay short at the crown." | 9 | Names the day's state and the gap in the same breath, both as plain fact; no weight lands on the gap and no plan is asked for. |

### Option `-a` — asks what is missing *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-1-a-p` | player_line | matter_of_fact | "What's the piece still missing?" | 5 | — |
| `L-CH-T4-08-1-a-r1` | dialogue | matter_of_fact | "The crown stay. Iron strap, curved to the seat." | 9 | Names the part as a thing the work needs, plainly and whole; no story about why it is not here. |
| `L-CH-T4-08-1-a-r2` | dialogue | matter_of_fact | "Files till it's sorted. Your bench is set." | 8 | What happens next arrives already arranged, and the player is inside the arrangement before the sentence ends. |

### Option `-b` — takes the place at the bench she states and works *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-1-b-act` | action | matter_of_fact | **[action]** [Take the place at the bench she states and work.] | — | — |
| `L-CH-T4-08-1-b-r1` | dialogue | matter_of_fact | "Draw file first, with the curve." | 6 | The work handed over whole; no induction, because the player was never new here. |
| `L-CH-T4-08-1-b-r2` | dialogue | warm | "You keep the rag on that peg." | 7 | The station's kit handed over as the player's to run; a share of the yard's order is theirs, and nobody calls that new. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

## `CH-T4-08-2` — the second gap, made up out of her own shop again *(gated `knows(heat_shortfall_seen)`; unset, the node auto-skips)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-2-s` | dialogue | matter_of_fact | "There's a blank in my stores will take it. Fetch it down." | 12 | The cover comes out of her own stock again, said only as where the metal is and where it goes next; nothing marks it as the second time. |

### Option `-a` — marks that the fire and this both came out of her own shop *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-2-a-p` | player_line | quiet | "The fire, and now this. All out of your own shop." | 11 | — |
| `L-CH-T4-08-2-a-r1` | dialogue | quiet | "It's what's in reach." | 4 | The fact confirmed flat and closed; no defense, no motive — the sentence is about the metal, not about her. |
| `L-CH-T4-08-2-a-r2` | dialogue | matter_of_fact | "Hold the seat steady while I offer it up." | 9 | Attention that landed on her comes back as the player's hands being needed now. |

### Option `-b` — takes up the covering work beside her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-2-b-act` | action | matter_of_fact | **[action]** [Take up the covering work beside her.] | — | — |
| `L-CH-T4-08-2-b-r1` | dialogue | matter_of_fact | "Your side files, mine bends." | 5 | The second pair of hands folded in without remark; only the split of the work is spoken. |
| `L-CH-T4-08-2-b-r2` | dialogue | warm | "You see this one to the finish." | 7 | The piece assigned whole; being trusted to its end is the inclusion, and nothing marks the trusting as an event. |

*Records per graph: `-a` Recognition; `-b` Intimacy. Reference beat, no new fact; the fallback walks past it on the gather.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-08-3` | object | matter_of_fact | **[action]** The raising sheet stands on its post by the gate, two columns ruled down it. Names run down the one side. A neighbour adds one and walks on. | 28 | — |

## `CH-T4-08-3` — the sheet standing in the yard

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-3-s` | dialogue | matter_of_fact | "Sheet's up for the raising. It fills from the top." | 10 | The sheet acknowledged as standing public furniture; nothing about the columns, and nothing about her name. |

### Option `-a` — reads down the sheet where it stands *(deed · Intimacy · opens the nested child)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-3-a-act` | action | matter_of_fact | **[action]** [Read down the sheet where it stands.] | — | — |

*The close reading continues in the nested child below.*

### Option `-b` — asks who else is down for hands *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-3-b-p` | player_line | matter_of_fact | "Who else is down for hands?" | 6 | — |
| `L-CH-T4-08-3-b-r1` | dialogue | matter_of_fact | "Toby's down, and the mill pair. Lifting's covered." | 8 | The question answered by placing people, which answers it and moves it off her arrangements in the same breath. |
| `L-CH-T4-08-3-b-r2` | dialogue | warm | "You'll stand at my end on the day." | 8 | The player's place at the raising already held; nobody is invited, because to her they were never outside it. |

*Records per graph: `-a` Intimacy, then the nested child; `-b` Trust.*

---

## `CH-T4-08-3-a-1` (node 3 › option a › child 1) — the two columns close up *(nested inside `-3-a`; the deep pick and the conversation's rule-19 beat)*

Her talk continues from the bench while the player reads; the columns' content arrives in the option texts, never printed ungated.

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-3-a-1-s` | dialogue | matter_of_fact | "Ink's on the string if you're putting a name down." | 10 | The reader is provisioned, not watched; what the columns say she leaves to the sheet. |

### Option `-a` — marks which column her name is in *(spoken · sets `sheet_giving_only` · Recognition · moves `ilsa-forge-short`)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-3-a-1-a-p` | player_line | quiet | "Your name's in the giving column. Nowhere else." | 8 | — |
| `L-CH-T4-08-3-a-1-a-r1` | dialogue | quiet | "That's the side that's mine. The other one…" | 8 | The column confirmed flat, and then the sentence that would have to say what the other column is for fails to arrive; she runs out of sentence and does not reach for another. |
| `A-CH-T4-08-3-a-1-a-r` | action | quiet | **[action]** Ilsa comes over, squares the sheet on its post, and goes back to the bench. | 15 | — |

*No closing fragment. The silence after the action slot is the last beat of the option, per the content block.*

### Option `-b` — puts their own name in the giving column beside hers *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-3-a-1-b-act` | action | matter_of_fact | **[action]** [Put your own name in the giving column, beside hers.] | — | — |
| `L-CH-T4-08-3-a-1-b-r1` | dialogue | matter_of_fact | "That's the lifting sorted, then." | 5 | The deed absorbed as arranged; no thanks, because the column was always going to have hands in it. |
| `L-CH-T4-08-3-a-1-b-r2` | dialogue | warm | "Pole end by me, raising day." | 6 | The signature converted straight into a place. |

*Records per graph: `-a` sets `sheet_giving_only`, Recognition, moves the thread; `-b` Intimacy — the run closes on the deed with the columns unremarked.*

---

## `CH-T4-08-4` — her name goes in the giving column *(the weight beat — an act, not a line; no spoken set-up)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-CH-T4-08-4-s` | action | quiet | **[action]** Ilsa writes her name in the giving column, under the others, and holds the sheet out to be passed on. The wanting column goes by untouched. | 26 | — |

### Option `-a` — hands the sheet on to the next pair of hands *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-4-a-act` | action | matter_of_fact | **[action]** [Take the sheet and hand it on to the next pair of hands.] | — | — |
| `L-CH-T4-08-4-a-r1` | dialogue | matter_of_fact | "Bench again. The seat wants truing." | 6 | The sheet leaves and the work resumes in the same breath; the untouched column is nowhere in the sentence. |
| `L-CH-T4-08-4-a-r2` | dialogue | warm | "Your file's where you left it." | 6 | The player's place held between visits, stated as furniture. |

### Option `-b` — asks what the missing part does in the piece *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-4-b-p` | player_line | matter_of_fact | "What does the stay do in the piece?" | 8 | — |
| `L-CH-T4-08-4-b-r1` | dialogue | matter_of_fact | "Ties the crown to the collar. Takes the swing out of it." | 12 | The work explained flat and whole, and only the work; no number arrives anywhere near the answer. |
| `L-CH-T4-08-4-b-r2` | dialogue | matter_of_fact | "She'll sit quiet once it's in." | 6 | The piece's future stated as settled; the how of the stay's arriving is not in the sentence. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T4-08-5` | action | matter_of_fact | **[action]** At the crown seat Ilsa takes another way at the joint, bending a length of her own stock to the shape. Nothing is said about the stay. | 27 | — |

## `CH-T4-08-5` — the substitute worked in

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-5-s` | dialogue | matter_of_fact | "We come at it from the underside. Tongs." | 8 | The new way arrives as today's plan, already decided; nothing marks it as a substitution. |

### Option `-a` — works the substitute with her *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-5-a-act` | action | matter_of_fact | **[action]** [Work the substitute with her.] | — | — |
| `L-CH-T4-08-5-a-r1` | dialogue | matter_of_fact | "Hold the curve against the seat. I'll bring the heat." | 10 | The work split without remark; the player's hands are in the piece now. |
| `L-CH-T4-08-5-a-r2` | dialogue | warm | "Good. She's taking the shape." | 5 | The noticing said plainly and routed through the metal. |

### Option `-b` — asks whether the other way holds *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-5-b-p` | player_line | matter_of_fact | "Will the other way hold?" | 5 | — |
| `L-CH-T4-08-5-b-r1` | dialogue | matter_of_fact | "It holds. I've bent this seam before." | 7 | Decided and warm; she is not refusing anything, because nothing was offered — the answer is simply true. |
| `L-CH-T4-08-5-b-r2` | dialogue | matter_of_fact | "Keep your grip low when she turns." | 7 | Care as instruction, aimed at where the player's hands are. |

*Records per graph: `-a` Intimacy; `-b` Trust.*

---

## `CH-T4-08-6` — close — the sheet still up, the one column unused

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-6-s` | dialogue | matter_of_fact | "That's the day. Sheet stands till raising morning." | 8 | The visit closed by reading the yard's state; the unused column is in the yard, not in the line. |

### Option `-a` — says they will be at the raising *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-6-a-p` | player_line | matter_of_fact | "I'll be at the raising." | 5 | — |
| `L-CH-T4-08-6-a-r1` | dialogue | matter_of_fact | "Midday start. You're on the near pole." | 7 | The return folded into an arrangement already made; nobody is invited. |
| `L-CH-T4-08-6-a-r2` | dialogue | warm | "You'll eat with us before the lift." | 7 | The crew's meal already has the player at it; the with-us is the warmth, said as arrangement and never as invitation. |

### Option `-b` — sets the sheet straight on its post before leaving *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-08-6-b-act` | action | matter_of_fact | **[action]** [Set the sheet straight on its post before leaving.] | — | — |
| `L-CH-T4-08-6-b-r1` | dialogue | warm | "That'll see the week out." | 5 | The deed confirmed small and complete; no event made of it. |
| `L-CH-T4-08-6-b-r2` | dialogue | matter_of_fact | "First heat's early tomorrow. Your end's ready." | 7 | Tomorrow's place stated as already held; the flat end is a pause with the door open, not a chill. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

## Inventions declared *(codex checked first; reuse recorded)*

| invention_type | name | what | content_ids | codex_checked |
|---|---|---|---|---|
| prop | the crown stay | The missing part: an iron strap curved to the crown seat, tying crown to collar | `O-SC-T4-08-1`, `L-CH-T4-08-1-s`, `L-CH-T4-08-1-a-r1`, `L-CH-T4-08-4-b-p`, `L-CH-T4-08-4-b-r1`, `A-SC-T4-08-5` | `world:ilsas-forge` has the centerpiece; no part of it is named — and the missing part itself is the thread's declared `delta_situation`, staged, not invented |
| prop | ink on the string | Ink and pen hung on a string at the raising sheet's post | `L-CH-T4-08-3-a-1-s` | `world:arch-raising` establishes the sheet as a standing public object; nothing carries the writing kit |
| offstage_person | the mill pair | Two from the mill, down on the sheet for the lifting | `L-CH-T4-08-3-b-r1` | codex checked; the mill and its people are unnamed anywhere — mentioned only as names on the sheet |

**Reused, not invented:** the sheet and its two columns (`world:arch-raising`, thread doc), bench, files, tongs, the crown and collar (`world:ilsas-forge`, `ilsa-kin-no-show` C1), the peg (`ilsa-kin-no-show` C1), the gate and the yard, her own stock (C1's reserve motif is the thread's declared cast fact; the stock here is working stock, scene colour), Toby (`cast/toby.md`, name only, no line). The blank fetched at node 2 is a piece of her own stock — scene colour, undeclared. Quantities are scene colour throughout.

## Notes for the gate

- **No question mark in any Ilsa line; no proposal grammar.** Dialogue runs 4–12 words, most 5–9. Longest Ilsa line: 12 words (`L-CH-T4-08-2-s`, `L-CH-T4-08-4-b-r1`).
- **R2 arrives as scene business whatever the player picks:** `O-SC-T4-08-3` stages the instrument, `A-CH-T4-08-4-s` is the act itself, and `A-SC-T4-08-5` is the substitution — all on the spine.
- **She never explains the sheet, declines the other column, or states what she will not do.** Her side of R2 is entirely where the name goes. Nobody counsels her; no option nudges her toward the other column.
- **Rule-19 build at the child:** `A-CH-T4-08-4-s` is the scene's act; the mark (8w) → her fragment that runs out (8w, `-a-1-a-r1`) → `A-CH-T4-08-3-a-1-a-r` → **no closing fragment**. The unfinished sentence is hers — the clause about the other column starts and fails to finish, and neither she nor the prose completes it (failure mode 2 fenced).
- **The child prints nothing ungated.** `O-SC-T4-08-3` shows two columns and names at distance only; her name's placement arrives solely inside the child, through the option texts.
- **Child set-up slot decision, recorded for the gate:** the graph places no description slot inside the child, so its one set-up line is `dialogue` (`L-CH-T4-08-3-a-1-s`) — Ilsa provisioning the reader from the bench, which stages the close reading without her explaining the sheet. If the gate reads the child as needing a described set-up instead, that is a slot-placement re-spec through Roc, not mine to add.
- **No arithmetic anywhere.** The stay's answer is the work ("Ties the crown to the collar"), never a number; the covering is placement and substitution throughout.
- **Not refusing, not asking:** `-5-b-r1` is the failure-mode-1 test case — the answer is decided and warm, and no help is being declined because none was requested.
- **Deflection instances:** `-2-a-r2` (attention on her comes back as the player's hands being placed), `-3-b-r1` (a question about the sheet answered by placing people).
- **Offer-stands-alone test applied**; kept second clauses ("I'll bring the heat", "when she turns") are the visible-care case (register move 6) — same fact as the scene, said plainly.
- **No line Juno could speak unchanged:** her gathering lines run on standing fact and placement ("Pole end by me"), never on chosen belonging.
