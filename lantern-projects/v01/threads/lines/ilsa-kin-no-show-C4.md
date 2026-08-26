# `ilsa-kin-no-show` — C4 line slots · `SC-T4-06`

**Conversation:** C4. Re-touch and close, no new cast fact — raising eve, the centerpiece finished. The count still holds Bram's pair; the reach toward the second apron starts and does not finish; the close covers the gap by assignment — the player put down for the raising, near end, standing.
**Structure source:** `../ilsa-kin-no-show.md` § "C4 — `SC-T4-06`", Choice designer 2026-08-09, **graphs approved by Roc 2026-08-10**. Nothing structural altered. **No flag is set anywhere in this conversation.**
**Soul:** `ilsa` (`cast/ilsa.md`). Written from `essence_descriptor` and `voice_register` only, plus `register.md` and the codex. Ceilings: dialogue 40 · action 60 · object 60 · player_line 12.
**Render convention:** every non-dialogue slot is prefixed `[action]`, once. Word counts in their own column.
**Speaker for all `dialogue` slots:** `ilsa`. No walk-on; nobody attends the eve.

**Incoming states:** four — reads `absence_witnessed` and `cover_witnessed`. Both gates are node-level (nodes 2 and 3) and auto-skip when unset; the fallback walks 1 → reach → 4, and the reach and the close are situation, delivered to every state. **No per-slot variants required.**

**Staging vocabulary:** the yard on raising eve — the finished centerpiece, bench, tongs, the far and near ends, the second apron, the coal barrow, the raising cart. Reused from `world:ilsas-forge`, the gated Kinbound scene and this thread's earlier files except the declared invention below.

**Sanctioned long run:** none placed. Barred twice over: nothing here is lineage, and both heavy beats are grief-shaped.

**Her uptake move** (register's move 3, her version): she acknowledges by *placing*. No question mark in any Ilsa line. **The grammar wound lands here and only here:** the spine fragment before `A-SC-T4-06-4` stops partway and nothing finishes it — no slot after the reach comments, explains, or resumes the sentence, and node 4's set-up opens on the close's own business. Every other Ilsa sentence in C4 completes.

**The reach is spine, not a pick** — a `dialogue` fragment, then the action slot, then nothing, placed between node 3's gather and node 4 per the content block ("A short dialogue fragment: her raising arrangement, and the sentence stops partway — Lines writes the stop"). The slot id `L-SC-T4-06-4` follows the spine convention; the graph draws the action slot and the content block places the fragment.

---

## Scene opening

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-06-1` | object | matter_of_fact | **[action]** Raising eve. The centerpiece stands finished on the bench, its whole length wiped down. The yard is squared away around it. | 21 | — |

## `CH-T4-06-1` — the finished piece between them *(ungated)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-1-s` | dialogue | matter_of_fact | "There she is. Done at midday." | 6 | The finished piece presented as a fact of the yard; the week's work closes without ceremony. |

### Option `-a` — marks the piece done *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-1-a-p` | player_line | matter_of_fact | "It's finished. The whole piece." | 5 | — |
| `L-CH-T4-06-1-a-r1` | dialogue | matter_of_fact | "She's done. She goes up tomorrow." | 6 | The fact confirmed plainly and moved into the schedule in the same breath. |
| `L-CH-T4-06-1-a-r2` | dialogue | warm | "Your filing's in the crown. It shows." | 7 | The player's hands placed inside the finished thing; the noticing said plainly and routed through the work. |

### Option `-b` — helps square the yard for morning *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-1-b-act` | action | matter_of_fact | **[action]** [Help square the yard for morning.] | — | — |
| `L-CH-T4-06-1-b-r1` | dialogue | matter_of_fact | "Barrow behind the door. Coal keeps till after." | 8 | The squaring-away shared as a matter of course; the eve is worked, not held. |

*Records per graph: `-a` Trust; `-b` Intimacy.*

---

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `A-SC-T4-06-2` | action | matter_of_fact | **[action]** Ilsa sets out tools for the raising, pair by pair down the bench, one pair more than the hands that will come. | 22 | — |

## `CH-T4-06-2` — the count against the day he didn't come *(gated `knows(absence_witnessed)`; unset, the node auto-skips)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-2-s` | dialogue | matter_of_fact | "Tomorrow's pairs. Each one's spoken for." | 6 | The count read out as arrangement, every pair assigned in her plan; the number itself is never said, per the card. |

### Option `-a` — marks that the count still holds the promised pair *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-2-a-p` | player_line | quiet | "There's a pair set out for him still." | 8 | — |
| `L-CH-T4-06-2-a-r1` | dialogue | quiet | "There is." | 2 | The witness's count confirmed flat; no verdict and no account, and the sentence is complete. |
| `L-CH-T4-06-2-a-r2` | dialogue | matter_of_fact | "Yours is the second from the fire." | 7 | Attention on the far pair comes back as the player's own pair being placed. |

### Option `-b` — leaves the count as she made it *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-2-b-act` | action | quiet | **[action]** [Leave the count as she made it.] | — | — |
| `L-CH-T4-06-2-b-r1` | dialogue | matter_of_fact | "Bellows pair stays home tomorrow. The rest go over." | 9 | The count worked with, not around; what stays and what travels, stated as settled. |

*Records per graph: `-a` Recognition; `-b` Intimacy.*

---

## `CH-T4-06-3` — the count against the covered part *(gated `knows(cover_witnessed)`; unset, the node auto-skips)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-3-s` | dialogue | matter_of_fact | "His part rides over with the piece. It's ready." | 9 | The covered work enters the raising plan under the name it wears; ready is the only judgement the sentence carries. |

### Option `-a` — marks that his part goes to the raising finished *(spoken · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-3-a-p` | player_line | quiet | "His part goes to the raising finished." | 7 | — |
| `L-CH-T4-06-3-a-r1` | dialogue | quiet | "It does." | 2 | The fact confirmed and closed; whose hands finished it is not reopened, by her or by the sentence. |
| `L-CH-T4-06-3-a-r2` | dialogue | matter_of_fact | "Load it up front on the cart." | 7 | The mark converted into the next thing done with hands. |

### Option `-b` — loads it onto the cart with the rest, unremarked *(deed · Intimacy)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-3-b-act` | action | quiet | **[action]** [Load it onto the cart with the rest, unremarked.] | — | — |
| `L-CH-T4-06-3-b-r1` | dialogue | matter_of_fact | "Steady. It rides on top." | 5 | The loading shared without remark; the cover travels as freight, which is how she has carried it all along. |

*Records per graph: `-a` Recognition; `-b` Intimacy. For the both-flags player, nodes 2 and 3 land in sequence — the week's accrual counted out just before the reach.*

---

## The reach *(spine — situation, not a pick; fragment → action → nothing)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-SC-T4-06-4` | dialogue | quiet | "Ropes to the mill pair. The far end…" | 8 | The raising arrangement runs on settled ground until it reaches the far end; the clause that would place that pair starts and never finishes, because she has no sentence for it. |
| `A-SC-T4-06-4` | action | quiet | **[action]** Ilsa reaches toward the second apron at the far end, stops partway, and takes up the next pair of tongs. | 20 | — |

*Nothing follows. No slot comments, explains, or resumes the sentence; node 4 opens on the close's own business.*

## `CH-T4-06-4` — the close — the player put down for the raising *(ungated)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-4-s` | dialogue | matter_of_fact | "You're down for the raising. Near end, standing." | 8 | The gap covered by assignment, stated in the flat declarative present: the player added to the count as standing fact, nobody subtracted, and the telling is warm because the place was already theirs. |

### Option `-a` — stands into the count without a word *(silent deed · Recognition)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-4-a-act` | action | quiet | **[action]** [Stand into the count without a word.] | — | — |

*The scene ends on the closing object slot with no further dialogue, per the content block — the arrangement standing as the thread's last word without a word.*

### Option `-b` — answers the assignment plainly *(spoken · Trust)*

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `L-CH-T4-06-4-b-p` | player_line | matter_of_fact | "I'll be there at midday." | 5 | — |
| `L-CH-T4-06-4-b-r1` | dialogue | matter_of_fact | "Midday. She goes up on my word." | 7 | The answer folded into the plan already made; neither response treats either way of taking the place as the better guest. |

*Records per graph: `-a` Recognition — the deep pick, taking the place the way she gives it; `-b` Trust. No response reads as Bram's place being given away.*

---

## Scene close

| slot id | slot_type | tone | text | W | speaker_intent |
|---|---|---|---|---|---|
| `O-SC-T4-06-5` | object | quiet | **[action]** The second apron lies at the far end, tongs beside it, as it has lain all week. The near end is squared for morning. | 24 | — |

---

## Inventions declared *(codex checked first; reuse recorded)*

| invention_type | name | what | content_ids | codex_checked |
|---|---|---|---|---|
| prop | the raising cart | The cart that carries the finished raising work from the yard to the arch site | `L-CH-T4-06-3-a-r2`, `L-CH-T4-06-3-b-act`, `L-CH-T4-06-3-b-r1` | `world:arch-raising` has the raising; `ilsa-kin-no-show` C3 declared the crate the fine work travels in — the crate cannot carry Bram's stacked part and the piece's freight, and the graph's node 3 names the cart |

**Reused, not invented:** the second apron and tongs at the far end (gated Kinbound scene, canon), the bench and its ends, fire, the crown (`world:ilsas-forge`, C1), the coal barrow (C1), the mill pair (`ilsa-forge-short` C2, offstage), the ropes (raising business, scene colour, undeclared), the pairs-of-tools count (the thread's C1-delivered cast fact, referenced free). Bram appears as a laid pair and a covered part only — name-only in one player mark and one plan line; no relation, reason, or history stated or implied. Quantities are scene colour throughout.

## Notes for the gate

- **No question mark in any Ilsa line; no proposal grammar.** Dialogue runs 2–9 words, most 5–8. Longest Ilsa line: 9 words (`L-CH-T4-06-3-s`, `L-CH-T4-06-2-b-r1`).
- **The grammar wound, checked:** `L-SC-T4-06-4` is the one incomplete Ilsa sentence in the thread — the arrangement-clause starts at the far end and never finishes; `A-SC-T4-06-4` is the reach that stops partway; **nothing follows** — no closing fragment, no explanation, and `L-CH-T4-06-4-s` opens on the close's own business without referring back. Fragment → action → nothing, per the content block and the card (`settled-certainty ↔ wordless-pause`).
- **Not a replacement:** the close adds the player to the count and subtracts nobody — the assignment names the near end, the reach's far end stays laid, and `O-SC-T4-06-5` shows both places standing as the last image. No response beat reads as Bram's place given away.
- **The count is things, never a number:** `A-SC-T4-06-2` delivers it as pairs of tools, one more than the hands that will come; "Each one's spoken for." assigns without counting aloud. No arithmetic anywhere — a shortfall converted to arithmetic is fenced off as another soul's move.
- **Marks mark, never name:** `-2-a-p` and `-3-a-p` place a fact and stop; her confirmations ("There is." · "It does.") confirm fact, never feeling, and console nothing.
- **Rule-19 builds:** the reach (fragment 8w → action 20w → nothing) and the close (assignment 8w → `O-SC-T4-06-5`, with option `-a` ending on the object slot with no further dialogue).
- **The eve is not a set-piece:** every beat is worked — squaring, loading, setting out pairs — and the heaviest two beats are situation, delivered to every incoming state including the fallback.
- **Deflection instance:** `-2-a-r2` — attention on the far pair comes back as the player's pair being placed.
- **Offer-stands-alone test applied**; kept second clauses ("Coal keeps till after", "It rides on top") are plain fact or instruction, not justification.
- **Register lock:** scene locks `matter_of_fact`; `quiet`/`warm` on individual slots per the C1 precedent — same standing flag for Roc, not resolved here.
