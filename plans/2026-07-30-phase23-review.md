# Phase 2+3 Build Review — decisions for Roc

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the design rationale and the rulings behind it, not the current state of the work.

One item per line. Answer inline (edit this file) or by number in chat. Items marked **[design]** change the game; items marked **[schema]** change a spec; items marked **[mechanical]** I can rule on if you say "defaults fine."

> **Status: all items closed 2026-07-30.** Every question here is ruled or parked, and the rulings are applied to the schema, the transcription data, and `tuning.json`. D12–15 are parked to content creation by Roc's call. Nothing in this doc gates Phase 4.
>
> **Verified green.** Resolver: 51/51 pass, `tsc --noEmit` clean. Lantern: 219/219 across 21 files, tsc clean. (Lantern's suites initially could not run at all — the machine's commit charge was exhausted, 0.38 GB virtual free against 19 GB physical free — but that was environmental and cleared on its own.) The two-key-lock rendering fix C1 required is now covered by its own tests.

## A. The two proposals (from the layout pass — provisional, not wired)

**A1. Role→workplace table [design]. — RULED (Roc, 2026-07-30): initial approved; must be tweakable → lives in `tools/resolver/data/role-workplace.json`, weights in `tuning.json`.** It feeds the NPC availability draw (S3's role anchor — the top weight when slots fill at day-start). **Amended by the B1 ruling below: for a soul carrying a live story thread this table is a hard filter, not a weight — they appear only where their role reaches.** For everyone else it stays the top weight. Where each role anchors:

| Role | Workplace | Blocks | Note |
|---|---|---|---|
| Baker | T2 Market Row | mornings | |
| Blacksmith | T4 Workshop | midday | |
| Postman | T1 Square + T3 Commons | mornings | uncertain |
| Herbalist | T2 Market + F1 Clearing | morning/midday | uncertain |
| Priest | T1 Square + T8 Shrine | uncertain | uncertain |
| Farmer | T2 Market Row | mornings | **no farm screens exist** — stall at market? |
| Mage | none — personal goal | — | roams by draw |

→ Roc: approve / edit rows.

**A2. Arch promote formula [design]. — RULED (Roc, 2026-07-30): approved.** The Arch's clue turns hard-key when **3 of the 5 live threads have moved at least once AND 2 role-goals have advanced a stage**. Bond excluded. Numbers are tunable → `tuning.json` `arch_promote` block, per the one-tuning-home rule (also Roc, 2026-07-30: **all global game settings tune in one place**).

## B. Floor + snapshot questions

**B1. Guaranteed neighbors and locked doors [design]. — RULED (Roc, 2026-07-30): (a), plus a constraint.** A neighbor whose story is live is placed somewhere the player can reach today; `floor.prefer_unlocked_screens` is now `true`. Locked screens may carry slots once specced, and the draw falls back to unlocked ones.

Roc added the harder half: **the role→workplace table (A1) is a hard filter on story-NPC placement, not just the top weight.** A soul appears only where their role reaches — Toby does not turn up in the forest with a live story, because a baker anchors to Market Row. Story NPCs are guaranteed a slot on the **main screens** (the hub plus the screens open by default: T1 · T2 · T3 · F1 · F2 · F3). T7 Festival Grounds also carries a story-NPC slot, drawn more rarely.

**What this costs, named on purpose.** On a day you pick Forest, a live town-anchored thread does not advance — the guarantee simply does not fire. **Ruled: let it stand** (Roc, 2026-07-30). Choosing an area is the day's commitment. The alternative — letting a soul appear anywhere — is a content build, not a placement flag: scenes and choice nodes are minted per screen (`SC-<screen>-<seq>` / `CH-<screen>-<seq>`), so every beat wanted in both areas is authored twice, up to 6× across the main screens. The cheap version would be dialogue that never references where you are standing, which fights the environment-as-storytelling material and the *world is worth exploring* seed.

*Parked, available later:* a per-soul **roaming allowance**. A1 already has one — the Mage anchors nowhere and "roams by draw." A soul with a diegetic reason to wander can be marked roaming and have scenes authored on the screens they roam to; the cost stays bounded because it is opt-in per soul. Not needed for Toby.

**B2. Snapshot restore transcript [design]. — RULED (Roc, 2026-07-30): keep the rollback** (the transcript is the story so far). **"See both branches side by side" recorded as a v2 tool feature** — a comparison view, not a change to play. Added to the tool spec's backlog.

## C. Schema gaps the transcription hit [schema]

**C1. F7 two-key lock. — RULED (Roc, 2026-07-30): approved, AND not OR.** Source: the ratified layout draft itself — F7 The Cave is `[LOCK: Teledahn cascade + light]`, "unlock via the F5 insight **+ a light-source knowledge-key**." The schema's `status` now takes `locked(gate_id[, gate_id])`, conjunction only. There is no OR form: a door openable two ways is two doors. F7's status is `locked(G-F5-cascade, G-F7-light)`.

**C2. Two new predicates. — RULED (Roc, 2026-07-30): approved.** `threads_moved(N)` and `role_goals_advanced(N)` added to the predicate vocabulary (screen-spec schema updated).

**C3. NPC slot qualifier. — RULED (Roc, 2026-07-30): approved.** T5 = **A Neighbor's Home** (layout draft row T5; transcribed in `tools/resolver/data/screen-specs.json`): trust-locked social interior, "NPC-slot ×1 **(a deep NPC)**." The slot shape is now `{time_block, count, restrict?}`; `restrict: deep` narrows a slot to a deep NPC, and a slot with no `restrict` takes anyone.

**C4. Per-block capacities. — RULED in part (Roc, 2026-07-30): tunable.** Split: per-screen slot counts are **map data** and stay in the screen specs (yes — a map setting); the global knob (scale the whole town's busyness) lives in `tuning.json` (`npc_slot_defaults`). Remaining sub-question — **RULED (Roc, 2026-07-30): defaults with optional override.** The uniform-across-blocks default from the transcription stands; a screen may author per-block counts as an override where its draft implies them.

## D. Transcription notes [mechanical unless flagged]

*(What these are — Roc asked, 2026-07-30: not maps. They're footnotes from converting the layout draft's tables into typed data — spots where the draft's prose was ambiguous, so the transcriber recorded a question instead of deciding. Ten are records, no action. **Six need you: the intro-gate question (2–6, one answer covers all five) and D11–D15.**)*

1. T2 §Opening credits it with Collect too; table lists only Make — minted Make only.
2–6. The five verb-intro gates (T2 Make, T3 Use, F1 Collect, F2 Use, F3 Make) had no archetype in the draft — left null. **RULED (Roc, 2026-07-30): a `Demo` archetype.** Demo is the seventh archetype: the place a verb is first taught. It blocks nothing and holds no key, and it is the one archetype that never appears inside a `status` lock — a Demo that blocks passage is a defect. It stays a gate entry so Lantern and the scene-mapping instrumentation can see where each verb enters the game. T1's Show/Ask intro keeps its `Signpost(preview)` typing, because it previews a real door.
7. T4 "holds deep Make gates" (plural, unenumerated) — not minted; Phase-4+ content.
8. T4 hard-key: shared across tools + recipe-board (parallel to T3's shared ambient) — flagged.
9. T5's Signpost-preview + Show/Ask relationship gate transcribed as one gate (G1 describes both).
10. T6 "preview names time" kept inside G4 rather than a second Signpost gate.
11. **T7 access lock — RULED (Roc, 2026-07-30): the lock is removed.** The Festival Grounds can be visited from the start; the festival itself happens on the last day. That makes it a calendar *event* in the day/progression data, not a screen lock — so the design law needs no exception here. T7's status is now `start`, `G-T7-access` is deleted, and the Proof gate `G-T7-recognition` is untouched. T7 is open but is **not** a main screen: it carries a story-NPC slot at a reduced draw rate (see B1).
12–15. **PARKED (Roc, 2026-07-30): "we can review when we create content."** Not blocking Phase 4 — each is a content question that answers itself once the scene is being written. Held for that pass: **12** T8 — does the moonlight/night restriction cover T8's carvings, or only F6's? · **13** F3 old carvings "ambient→hard-key" with no promote condition anywhere (same treatment as the Arch — Architect proposes at the next pass?) · **14** F5 — is the unlocking observation the same insight that cascades to F6+F7, or a separate prior one? · **15** F6 — seam text says "nothing gates walking up" but F6's own row says `[LOCK: cascade] (traversal)`; the table is transcribed as primary, unconfirmed.
16. F8 Laki combine: which two fragments? Unenumerated — Phase-4+ content, parked.

## E. Already good (no action)

Approve pill · type/readability (your call, 2026-07-30) · edit-as-approval flow · the 16-screen transcription itself (structure matched 1:1).
