# Handoff — Mode 5 UX wireframe (pickup, cast, learn-a-spell, satchel, Home Hub)

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to do next.

**Written 2026-08-22 · capstone Tue 2026-08-25**

---

## State

Pure wireframe work — no Phaser code touched. One file, revised three times this
session:

`phaser/tools/screen-flow/mockups/mode5-ux-flow-wireframe.html`

Nine sections, §0 (the five-beat loop thesis: notice → examine → act → learn →
next) through §9 (a connected walkthrough). Per section:

| § | Topic | Status |
|---|---|---|
| 1 | Pickup — forage hotspot | Approved direction: discovery-gated identity (`???` until first pickup, via `Inventory.discoveredIds()`). Not built. |
| 2 | Cast-on-a-thing picker | Drops the dead "Use" button, known-only flat list. Book-vs-modal visual treatment still open (Q1). |
| 3 | Hint-strength Options setting | Proposed (Off/Subtle/Generous), same shape as `PlayerSettings.ts`'s real settings. Not confirmed or built. |
| 4 | HUD nav row | **Approved as shown — build this.** |
| 5 | Traversal — locked path | **Approved as shown — build this.** |
| 6 | Learning a spell | Clue → taught → confirm arc, fitted into the real `NotebookScene.drawSpellbook()` rather than an invented panel. Satchel/Banked toggle for trial-casting is a real, unbuilt gap (Q2). |
| 7 | Satchel management | Drop action proposed on the existing inspect card. Confirmed as a two-sided fix (`Inventory` + ink's pool ledger), not a UI-only change. Confirm-warning rule undecided (Q3); move-between-tabs out of scope (Q4). |
| 8 | Home Hub decoration | Palette icons, per-piece Remove/Flip, chrome regrouping — approved direction. Shelf close-up uses Roc's reference image (confirmed), cropped to the cubbies — not yet exported as a real backdrop asset. Room zoom/pan proposed, not confirmed (Q8); overlaps with the shelf close-up in an unresolved way (Q5). Surfaces reconciled against the real art: sill/floor hold up, `table` is missing, chest/counter unverified (Q6, Q7). |
| 9 | Walkthrough | Updated to match everything above. |

## The one thing that matters next

This document does not gate Track A or Track B — same framing as `phaser/`
itself ("a design probe, not a build track"). Nothing here should get picked
up as urgent capstone work without Roc saying so explicitly, three days out.

If anything is worth doing before 2026-08-25, §4 and §5 are the candidates —
both are small, both are marked "approved as shown," and both fix a real,
already-diagnosed rough edge in the build that ships. Everything else (the
learn-a-spell arc, satchel drop, Home Hub zoom and shelf) is bigger and reads
better as a post-capstone pass.

## Open questions — Roc's call, not decided here

1. **Cast-on-a-thing picker** — stays a modal (cheap, matches traversal/dialogue
   pills), or becomes a single book page (matches the Notebook, costs new art)? (§2)
2. **Trial-cast source** — the Satchel/Banked toggle switches between two pools.
   Should a trial ever draw from both at once? (§6)
3. **Satchel drop confirmation** — warn only when a known spell needs the item
   (what's mocked), or every time? (§7)
4. **Move between Satchel and Arms** — a real gap, or intentionally out of scope? (§7)
5. **Shelf close-up vs. room zoom** — once the room itself can zoom in, does the
   shelf still need its own dedicated scene and art, or does room zoom absorb
   that job? Both are built in the mockup; the overlap isn't resolved. (§8)
6. **Chest and counter surfaces** — keep, rename, or cut? Needs a real pass
   through Lantern's region editor against the actual backdrop, not another
   hand guess. (§8)
7. **Multi-slot shape per surface** — grid slots like the shelf's cubbies, or
   free-drag zones for table/floor/sill, which aren't naturally a grid? (§8)
8. **Room zoom/pan mechanics** — scroll-to-zoom, drag-to-pan, a Fit reset —
   proposed, not confirmed. Also whether it reuses `PanModel`'s math or gets
   built fresh. (§8)

## What I got wrong mid-session, so it isn't re-trusted

First pass on §2 described the cast-on-a-thing spell grid as "every known
spell, unsorted" as if being unfiltered were the bug. Checked the code —
`HedgeCastPrompt.ts`'s `pickSpell` already calls `knowledge.spellbook()`, so it
was known-only from the start. The real problem was the four-column grid shape
and the dead "Use" button beside it, not missing filtering. Corrected in
revision 2. Flagging so a later pass doesn't read the original framing and
assume the picker shows unlearned spells — it never did.

## Facts worth not re-deriving

Grounded this session by reading the actual source, still true as of
2026-08-22:

- `Knowledge.ts` tracks two real states — `seen` (a clue) and `learned`
  (confirmed by a successful cast). A clue already reveals the full component
  list (`ModalFrame.componentHint`), on purpose — Roc's 2026-08-13 ruling: "a
  clue should say what it needs, not just name the spell." Trial-casting is a
  confirming ritual, not a blind guess.
- `SpellTrialScene.ts` already lets a player pick components from
  `Inventory.availableOn(null)` and try them — most of the "confirm" beat of a
  learn-a-spell flow is already built. It has no concept of "at Home" or
  `view.banked` at all.
- `Inventory.ts` has no method to remove a held item at the player's choice.
  The one "no API to remove" comment in the file is about a separate
  consumed-count ledger, not this.
- The satchel display is not a direct read of `Inventory.held` —
  `SatchelScene`/`SatchelStrip` reconcile it against `view.satchel`, a pool
  array `LanternPlayer` (ink-side) owns, via `effectiveSatchel()`. A drop
  feature has to land on both sides or the dropped pocket reappears on the
  next resync.
- `Decor.ts`'s `HOME_SURFACES` allows exactly one placement per named surface
  (`occupant(surfaceId)`), across five surfaces total: sill, shelf, chest,
  counter, floor. All five rects were hand-eyeballed once against the art —
  `GAPS.md`'s own G14 says so ("regions.json has geometry for T1 only, and
  none for HOME at all"). No `table` surface exists, despite the desk with a
  book being the most obvious flat surface in the backdrop.
- The real Home Hub backdrop is `lantern-projects/v01/images/home-hub-diorama.png`,
  isometric. Roc's shelf close-up reference is a separate, front-on image of
  the same shelving unit — confirmed as the art to use, cropped/zoomed to just
  the sixteen cubbies (the cabinet band below falls out of frame on purpose).
- `world/view/PanModel.ts` already models scale+offset+slack cleanly, but its
  zoom (`PAN_ZOOM = 1.22`) is a fixed constant set at construction, not a live
  player-controlled value — it drives `CollectScene`'s ambient pointer-follow
  pan, not a fit for Home Hub's proposed deliberate scroll-zoom.
- `HubScene.ts` has no pan or zoom today at all — one fixed cover-fit scale,
  set once in `create()`.

---

## Prompt for the new session

```
Read plans/_handoffs/2026-08-22-mode5-ux-wireframe-handoff.md first, then open
phaser/tools/screen-flow/mockups/mode5-ux-flow-wireframe.html in a browser.

Context: this is a UX wireframe for Mode 5's pickup, cast, learn-a-spell,
satchel-management, and Home Hub decoration flows. It is a design document,
not a build track — nothing in it has touched Phaser code yet, and it does
not gate Track A or Track B. Capstone is Tue 2026-08-25.

Do not start building anything. First tell me:
  1. Which of the 8 open questions in the handoff you'd resolve first, and why
     that order.
  2. Whether any part of this is worth building before capstone, or whether
     all of it should wait — HUD nav (§4) and traversal (§5) are the only two
     sections marked "approved as shown," everything else is still open.

Then wait for my decision before writing or editing anything.
```
