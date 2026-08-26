# Findings — what the Unreal build should copy, and what it should not

The probe was commissioned to answer *"what should these features feel like"*
before Unreal time is spent on them. These are the answers. Gaps found on the
way are in [GAPS.md](GAPS.md); this file is only recommendations.

Every option below is built and switchable in the running probe, so none of this
has to be taken on trust — press `C` for casting, `H` for the hub, and use the
mode buttons.

---

## 1. Casting — recommend **component-first**, with typed as the fallback

Three ways of naming a spell are built side by side. The resolver is identical
under all three, so the only variable is how it feels to reach for a spell.

| Mode | What it is | Verdict |
|---|---|---|
| `typed` | Type the phrase from memory | Good. Keep as a fallback. |
| `known` | Pick from spells already learned | **Do not ship alone.** |
| `components` | Pick what you hold; the phrase names what it makes | **Recommended.** |

**Why component-first wins.** Three approved spells — `glimmer`, `portion`,
`weigh` — take exactly one river stone and nothing else. In `typed` mode that
collision is invisible. In `components` mode, selecting a river stone offers all
three and says *"3 spells take exactly these components — the phrase is what
tells them apart."* The mechanic explains itself at the moment it matters, and
the GDD's *"a spell is a phrase plus components"* stops being a rule you are
told and becomes one you can see.

It also matches how a player actually arrives at casting: holding something and
wondering what it is for.

**Why `known` must not ship alone.** It is the most demo-friendly — no keyboard,
works on a projector — but it can only offer spells you have already confirmed,
and confirming means casting. With an empty spellbook there is no way in at all.
It also deletes the discovery the GDD asks for: *"seeing a neighbour cast gives
a clue, not the spell; you confirm by trying it yourself."* You cannot try a
phrase you overheard if the UI only lists what you have already cast. Fine as a
convenience layer on top; fatal as the only route.

**Concretely for UMG:** a component tray bound to *casting reach*, a filtered
spell list driven by the selected components, a receiver list, one result panel.

### The rules that are not negotiable

- **A cast's outcome must never change how the result looks.** 31 of the 89
  authored outcomes are no-effect — a third of the content. A red flash or a
  shake on those makes a third of the magic system feel broken. Outcome drives
  bookkeeping only: consumption, production, unlocks.
- **`reaction_kind: null` renders nothing**, not "she does not react". Silence
  is the authored content.
- **Casting reach is not the satchel.** It is
  `satchel ∪ always-available materials ∪ world items on this screen`, and only
  things some spell actually takes. Enforced in one method, which is what makes
  "cast on and cast from, never pocketed" true mechanically rather than by
  convention. Conflating reach with the satchel breaks the flame.
- **Show unauthored receivers.** Casting at one returns a named content gap, not
  invented prose. That is a work-list, not a failure state.
- **No per-spell code, ever.** `ignite → item_flame → leap` works because
  `produces`/`produced_by` agree in the data. An `if (spellId === "ignite")` is
  the design breaking.

---

## 2. Home hub — recommend **free drag**, and do not author surfaces yet

Both are built and switchable.

| Mode | Verdict |
|---|---|
| `free drag` | **Recommended.** Soft 16px grid, depth sorted by y. |
| `snap slots` | Do not build yet — the cost lands before the benefit. |

**Why free drag.** Depth-sorting by y — lower pieces draw in front — does most
of the work of making a flat backdrop feel like a room, for free. The grid stops
placement reading as sloppy without ever refusing a drop.

**Why not slots.** Slots need surface data that does not exist anywhere
(GAPS.md G14) — the probe's five surfaces were hand-placed by eye and are a
prop. Authoring them per room is real content work, and it buys tidiness at the
cost of the one thing decoration has to convey: *this is mine, I arranged it.*
In the probe, slot mode reliably produces a tidy room that feels like a form
being filled in. Free drag produces a messier room that feels inhabited.

If slots are wanted later, put the surfaces in `regions.json` under `HOME` —
same format, same editor, same output the Unreal click layer already needs.

**A blocker either way:** the hub mounts on art that is already densely
furnished, so keepsakes read as labels over someone else's room (GAPS.md G12).
No amount of UI work compensates. The hub needs a deliberately sparse backdrop —
bare shelves, empty surfaces — and that is worth knowing before art time is
spent.

**Two GDD rules the probe holds and Unreal must too:** the in-game home empties
on a new life; meta-hub pieces are display-only and refuse to move or accept a
piece.

---

## 3. Inventory — the model is already right, and already built

`LanternPlayer` owns the carry model and is tested: 6 to the satchel, 2 to arms,
the ninth refused. **Do not reimplement it.**

The one rule worth restating because it is easy to lose: **pack-triage is the
only route that banks arms-carry.** An ordinary "End the day", or ink's own
day_end when the move budget runs out, drops what is in your arms. So pack-triage
should be offered *only* when arms hold something — otherwise it reads as a
second "End the day" with no stake, and the distinction the GDD draws disappears.

**Blocked on G13.** What you forage is a coarse pool name (`herbs`), not an
`item_id`, so a foraged thing joins to no record — no category, no persistence
class, and it cannot be cast with. The forage → cast loop is severed at the
join. This is the highest-value gap on the list.

---

## 4. Screens — static backdrop plus normalized hotspots works

`regions.json` fractions map onto a fixed 1920x1080 `Scale.FIT` canvas with one
multiply, across source art ranging from 447x447 to 2000x1333. `T1`'s authored
rects land exactly on the arch and the notice board.

**Ink owns the clock.** The `= hub` weave decrements `movesLeft` and calls
`advance_time()` itself. The host reads and renders; it must never write.

**Unshaped regions need a fallback.** 15 of 16 screens have no geometry
(GAPS.md G7), so the probe renders those as labelled pills. Without a fallback
those screens would be unplayable rather than merely unstyled.

---

## 5. Unlock state — ink owns it, the host owns the cast

Full reasoning in the README. In short: ink already owns lock status, traversal
and the clock, and `play.ts` already set the precedent by refusing to let
`recordKnowledge` write `KnownPhrases` — *"a second writer would give one fact
two owners."*

It cannot be wired yet: `state.ink` has no gate variable and ink LISTs cannot
gain members at runtime (G4). The emitter change needed is in the README.

**And it may not be worth wiring at all yet.** If locks were enforced today, 8
of 20 screens strand (G6), and `G-F4-still` is keyed to `still` — a spell that
was rejected (G5). *"Magic unlocks screens"* currently has exactly one candidate
instance in the whole run. That is a content decision, and it is upstream of any
engineering.
