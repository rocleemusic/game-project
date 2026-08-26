# Before / after — `toby-the-shelf` C1 lines

Three states of the same file, pulled from git. This is the defect the GER pipeline was built to
catch, shown on real content.

**Staged for review. Not copied to the course repo yet.**

| file | state | commit | date |
|---|---|---|---|
| `01-original_toby-the-shelf-C1.md` | first generated pass | `eb11a9d5` | 2026-08-06 |
| `02-rewrite-2026-08-06_toby-the-shelf-C1.md` | after the structural rewrite | `ba1a63d4` | 2026-08-06 |
| `03-current_toby-the-shelf-C1.md` | current, committed content | `HEAD` | 2026-08-10 |
| `04-diff_original-to-current.patch` | full diff, 01 → 03 | | |

The current file records the pivot itself, at line 16:

> **Rewritten 2026-08-06**, complete replacement of the previous pass. That pass was written against
> the superseded register, carried no action slots, and was returned **"cold and choppy."**

---

## The shape of it

| | 01 original | 03 current |
|---|---|---|
| file length | 109 lines | 216 lines |
| dialogue slots | 21 | 38 |
| player_line slots | 7 | 7 |
| action slots | 4 (+6 `surface_action`) | 9 |
| object slots | 0 | 2 |
| standalone action beats between conversations | 0 | 1 |

Same seven player questions. Nearly double the dialogue. Every question went from one or two flat
replies to a three-beat run with a tone arc.

---

## Slot by slot — conversation `CH-T2-08-1`

### The player asks about the jars

| | text | tone |
|---|---|---|
| **01** `-a-r1` | `Thank-yous. Jam, mostly. (4)` | matter_of_fact |
| **01** `-a-r2` | `Pass me the small board while you're stood there. (9)` | matter_of_fact |
| **02** `-a-r1` | `"Thank-yous."` | quiet |
| **02** `-a-r2` | `"Kettle's been on the side a while. Pour yourself one, it's the good leaf."` | warm |
| **02** `-a-r3` | `"Pass me the peel and I'll have the first trays out."` | matter_of_fact |
| **03** `-a-r1` | `Toby answers quickly as he rushes by: "Thank-yous."` | quiet |
| **03** `-a-r2` | `"Kettle's been on the side a while. Pour yourself some tea, it's the good stuff."` | warm |
| **03** `-a-r3` | `"Pass me the peel and I'll have the first trays out."` | matter_of_fact |

**01 has no warm beat at all.** Two replies, both matter_of_fact, and the second is a bare
instruction. Toby's whole essence is anticipation — supplying what you need before you ask — and
option `-a` never lets him do it once.

**02 adds the beat and the arc.** quiet → warm → matter_of_fact. He deflects, then the care arrives
as a thing already waiting, then the tempo returns to work.

**03 stages it.** The line stops being floating text and gets a body doing something: *Toby answers
quickly as he rushes by.* `the good leaf` becomes `some tea, it's the good stuff` — a person
talking, not a register exercise.

### The player helps with the flour

| | text | tone |
|---|---|---|
| **01** `-b-r1` | `Two more and it's done. Take the short handle, the other one bites. (13)` | warm |
| **02** `-b-r1` | `"Two more like that."` | quiet |
| **02** `-b-r2` | `"Your sleeves will be white by the second sack. Roll them and I'll wait for you."` | warm |
| **03** `-b-r1` | `Toby comes over and says quietly, "Ah thank you, can you hold it steady?"` | quiet |
| **03** `-b-r2` | `Toby levels the flour and measures some out, "Your sleeves will be white. Roll them up and I'll wait for you."` | warm |

**01 jumps straight to warm.** He is being helped, which puts him on the receiving side, and his card
says that is the one place he goes short. 01 skips that entirely and hands out a tip instead.

**02 splits it in two** so he receives first, flatly, then levels the favour.

**03 gives him a physical action inside the line** and lets him say thank you out loud. The staged
action beat also changed — holding a sack he is emptying became picking up a bag he dropped, so the
player acts first and Toby is genuinely caught receiving.

### Plain talk about the order

| | text | tone |
|---|---|---|
| **01** `-c-r1` | `Twelve for the Hallow house, out by noon. It'll hold. (11)` | matter_of_fact |
| **02** `-c-r1` | `"Twelve for the Hallow house, out by noon. It holds."` | matter_of_fact |
| **02** `-c-r2` | `"Window end's out of the flour dust. Whoever's up this early stands there."` | warm |
| **03** `-c-r1` | `"Twelve for the Hallow house, it'll be out by noon."` | matter_of_fact |
| **03** `-c-r2` | `"There's some space on the window sill, feel free to sit there."` | warm |

Same three-part story. 01 answers and stops. 02 adds the warm beat. 03 says it the way someone would
actually say it.

---

## Two separate passes, not one

**01 → 02, structural, 2026-08-06.** Warm beats added where there were none. Tone arcs built. Lines
quoted. A greeting slot and an `object` slot introduced. `surface_action` still in use.

**02 → 03, wording, 2026-08-07.** No structure moved. Lines got bodies and gestures around them, and
the vocabulary came down to plain speech.

The 2026-08-09 and 2026-08-10 commits touched this file too, but **both are formatting only** —
column widths, and adding the empty `W` word-count column. No prose moved on either date.

---

## What this is evidence of, and what it is not

**It is** the failure named in the Pre-Build Declaration, on real committed content, with dates and
commit hashes. Choppy disconnected lines that satisfy every mechanical rule and still do not sound
like the person on the card.

**It is not** output from the harness in `pipeline/`. That loop has never run live. These passes were
done by agents and by hand in August, before the harness existed.

Do not present this as the harness catching something. Present it as the defect the harness was built
to catch, which is what the declaration already says.
