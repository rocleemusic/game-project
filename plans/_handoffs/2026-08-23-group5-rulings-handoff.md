# Handoff — Group 5 rulings (T13–T17), all ruled 2026-08-23

Point any session that needs the Group 5 design decisions here. Each ruling has
its own doc — this file is the index, the cross-cutting threads, and the one
live deadline. Paste the block at the bottom into a session that will act on
these.

**Written 2026-08-23 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

## Status

All five Group 5 rulings from
[2026-08-23-roc-notes-triage-plan.md](../2026-08-23-roc-notes-triage-plan.md)
are ruled by Roc, same day. Nothing in Group 5 is awaiting a design call.
Build is post-capstone **except Assignment #8 (due Tue 2026-08-25)** — see
"The one live deadline" below.

## The five rulings

| Task | Ruling doc | Headline |
|---|---|---|
| T13 Year-loop saves | [2026-08-23-year-loop-saves-ruling.md](../2026-08-23-year-loop-saves-ruling.md) | MetaHub/New Life cut. Explicit rollover after festival results with a discovery summary (spells X/N, items X/N, endings = tiers X/N). Everything persists incl. ink state; the *story* resets its own clock via an ink begin-new-year entry point (host never writes ink vars). 3 slots per mode, one game each; empty slot = new game. Player name entered on new game, shown on slot, usable in dialogue. |
| T14 HUD relayout | [2026-08-23-hud-relayout-ruling.md](../2026-08-23-hud-relayout-ruling.md) | One centered bottom bar, three tenants: explore = 5 nav icons · casting = satchel chips + Exit pill · dialogue = VN controls. Tooltips above the bar, no Decorate caption. Clock plaque stays top-left (Option A). Dev pills stay top-right. Instant tenant swaps. Visual spec: `phaser/tools/screen-flow/mockups/hud-relayout-wireframe.html` (all calls stamped in it). |
| T15 NPC dialogue rework | [2026-08-23-npc-dialogue-rework-ruling.md](../2026-08-23-npc-dialogue-rework-ruling.md) | Current dialogue scrapped. Deep three (Toby/Ilsa/Mara): 3 festival-goal encounters each, player helps by hand or spell. Every spell taught via an NPC story beat with casting clues. Greetings per bond level + festival-night lines for all 8. **Mara = hand-written exemplar**; rest generate via pipeline. Register fully loosens (`register.md` rewrite + card re-measure; voice mechanics survive). Authored scenes play once/day; repeat talk → runtime LLM, fenced to color only (never story, gates, bonds, or spells). |
| T16 Intro story | [2026-08-23-intro-story-ruling.md](../2026-08-23-intro-story-ruling.md) | Short VN scene on day 1 of a new game: why the mage came, festival stakes, name entry as a story beat. **The year loop is deliberately unseeded** — discovered at first rollover, never promised. |
| T17 Item descriptions | [2026-08-23-item-descriptions-ruling.md](../2026-08-23-item-descriptions-ruling.md) | Voice = the mage's field notes (player-voice notebook entries). All `content/` records via pipeline + human gate. Future extension recorded: NPC-told info appends to entries — write descriptions that leave that door open. |

## Cross-cutting threads (easy to lose between docs)

- **The player name travels far.** Entered in the T16 intro scene → stored in the
  T13 save schema → shown on the slot list → readable by ink dialogue (T15) →
  carried in the runtime-LLM ledger (T15). One name, five consumers.
- **The clock rule held.** T13's "keep ink, reset time" is done *inside* ink
  (begin-new-year entry point), because `InkStatePort` deliberately has no
  host-side clock writer. Do not solve it with `setVar` — tests forbid it.
- **Register rewrite gates three builds.** T15's `register.md` rewrite must land
  before: the Mara exemplar set (T15), the intro scene (T16), and the item
  descriptions pass (T17). Order: register → cards re-measure → content.
- **The HUD cast tenant and the cast-flow redesign are NOT the same surface — checked 2026-08-24, this no longer needs coordination.**
  T14's casting tenant reads as if it shares a render with the cast-flow
  handoff's Option A satchel picker
  ([2026-08-23-cast-flow-redesign-build-handoff.md](2026-08-23-cast-flow-redesign-build-handoff.md)),
  but that handoff's own "three technical notes" section rules this out:
  `SpellTrialScene` sits three scenes deep on the stack and cannot reach the
  real `SatchelStrip` instance, so "the picker is the satchel" means
  `SpellTrialScene` draws its **own** icon-strip styled to match
  `SatchelStrip`, reading the same `Inventory` data — two renders of the same
  state, not one shared component. File lists confirm zero overlap too: T14
  touches `NavRow.ts` + a new tenant-swap owner; cast-flow touches
  `SpellTrialScene.ts`, `ReceiverHotspots.ts`, `HedgeCastPrompt.ts`,
  `SatchelStrip.ts`, `VfxSystem.ts`. **T14 is buildable independently, in
  either order or in parallel with cast-flow-redesign** — the only shared
  obligation is matching visual style, not a build-order dependency.
- **New Life button removal ships early.** It rides the pre-freeze T7 Hub epic;
  the rest of T13 is post-capstone.
- **Tiers are the "endings".** T13's discovery summary counts festival tiers
  (Quiet/Warm/Grand, from the T9 festival-scoring ruling) as its endings stat,
  cumulative across years.
- **gdd-sync debt.** T13 (year loop = core-loop change) and T15 (dialogue
  system) both need `gdd-sync` when built. Not run yet.

## The one live deadline — Assignment #8, due Tue 2026-08-25

Standalone virtual-DM prototype (coursework, optional, 4–6h): JSON facts ledger
updated by player *actions*, reactive dialogue off ledger state, consistency
across 5+ turns, README. Ruled: **TypeScript + Claude API** (not the
assignment's Python framing — Roc's call), roleplaying **Mara's card**
(`cast/mara.md`) as the world, so it doubles as the T15 runtime-LLM
scaffolding. Ships standalone; the in-game repeat-talk hookup is post-capstone.
Full spec inside the T15 ruling doc.

## What is NOT in scope from these rulings

No build work is authorized by this handoff beyond Assignment #8. Groups 1–4
run per the triage plan in the parallel build session. The review-before-build
gate stands: Roc calls each build target.

---

## Prompt for a session acting on these rulings

```
Read ProjectOS/game-project/CONTEXT.md, then
plans/_handoffs/2026-08-23-group5-rulings-handoff.md in full, then the specific
ruling doc(s) for the task you're picking up (linked in its table).

All five Group 5 rulings (T13–T17) are ruled — do not re-open design questions
they answer. Check the handoff's "cross-cutting threads" before building
anything that touches the player name, the ink clock, the register, or the HUD
cast tenant.

If you are here for Assignment #8 (due Tue 2026-08-25): the spec is in the T15
ruling doc's "Runtime LLM" section — standalone TypeScript + Claude API, facts
ledger, Mara's card (cast/mara.md) as the world. Confirm the output location
with Roc before creating files (assignments live in assignments/, one folder
per assignment).

Everything else builds post-capstone. Roc calls each build target
(review-before-build gate).
```
