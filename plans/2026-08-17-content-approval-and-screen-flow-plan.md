# Content approval + screen flow — separating "is it authored right?" from "is it built right?"

## Why this plan exists

The mode-5 merge plan builds game *mechanics* in Phaser. This plan builds the two
things that sit **beside** that build and don't compete with it for scene time:

1. A way to look at every piece of content that isn't fully authored yet, in one
   place, and rule on it — approve, reject, leave a note — without opening the game.
2. A way to click through the game's *screens* in order and give feedback on the
   flow, in a separate session, before the art exists.

Both exist because the merge plan's own Open Rulings already name the gaps:
"22 of 34 authored scenes cannot be entered," chain gates that are unsatisfiable,
18 pairs that mis-resolve. Those are content-approval calls, not code. Today they
surface only as audit-script output. This plan gives them a face.

**These four tracks run independently of the mode-5 build and of each other.**
None of them touches `CollectScene` or the mode-5 scene. That is the point.

## Split: what I build now vs what waits on your content rulings

The tools are code and need no content decisions. Build them while you rule on
content. The rulings then flow *into* the tools, not the other way round.

**Code I can do solo, now (no content input needed):**
- Track 1 editor shell — tabs, tables, notes field, approve/reject, sidecar
  `review.json`, VFX preview canvas. It reads whatever content exists.
- Track 2 mode-5 debug unlock button.
- Track 3 screenshot capture + ordered click-through artifact, and the placeholder
  card mechanism.
- Track 4 *plumbing* — find and quote the starter-known seed line, wire the
  known-set + NPC learn-path so it's *drivable* from data.

**Waits on your content rulings (I surface them, you rule):**
- Which entries approve/reject (Track 1 is the surface for this).
- The Home Hub decoration look + item placement (Track 3b art direction).
- The reachability / chain-gate / no_effect calls the merge plan lists.
- Final teaching-map sign-off (already matches the index — see Track 4).

---

## Decisions locked (Roc, 2026-08-17)

- **Approve/reject writes to a sidecar `review.json`**, not into the content JSON.
  Notes + status + timestamp live there. Content `status` fields stay untouched
  until a reconcile step. Keeps the auto-commit hook from churning content on
  every click, and keeps a reject from hiding content mid-review.
- **The editor is a Vite mini-app** under `phaser/tools/`, its own `npm run`
  script, reading the same `public/content/*.json` + `cues.json`. It mounts a real
  Phaser canvas for VFX preview — the preview is the shipped cue, not a re-draw.
- **Screen-flow screenshots come from driving the live build** (extend
  `playtest.mjs`), so the flow always reflects what mode 5 actually renders.

---

## What the code already gives us (so we don't rebuild it)

- **"What's missing" is already computed.** `tools/gate-audit.mjs`,
  `content-audit.mjs` (orphans), `presence-audit.mjs` produce the authored-vs-
  referenced deltas. The editor is a UI over their output, not new logic.
- **VFX is a pure data table.** `src/render/vfx/cues.json` is the whole mapping;
  `src/render/vfx/**.ts` contains no spell id. A cue can be fired by id from a
  small canvas with no game scene present.
- **Spells are gated two ways:** you must *hold the components*
  (`CastResolver.castableWith`) **and** the spell must be *known*
  (`modes.ts:84` ruling — "a spell not already known is not offered; learning
  happens in `CastScene`, or as a clue from an NPC").
- **Spells attach to roles, not souls** (`content/magic/_index.md`). So the
  "correct NPC" for a spell is whoever is dealt that role.

---

## Track 1 — Content Approval Editor (standalone)

A Vite mini-app. One tab per game section that isn't fully authored. Each tab is a
table of entries; each row has a notes field, an approve/reject control, and — for
spells — a VFX column with a play button.

**Tabs (first cut):**
- **Spells** — every approved spell, its components, its learn-source, and a
  **VFX preview** (fires the `cues.json` effect + no-effect pair). Flags spells
  with no working NPC learn-path (Track 4's checklist).
- **Screen unlocks** — every authored scene and the gate that reaches it; rows the
  `orphans`/gate audit marks unreachable are flagged red. This is the "missing
  unlocks for screens" view.
- **Items / Key items** — authored records vs records something references.
- **Receiver interactions** — the 18 stateful pairs, and the `no_effect` vs
  `no effect` mis-resolves the merge plan names.

**Persistence:** `phaser/tools/content-editor/review.json` — `{ entryId, status,
note, ts }`. A separate `reconcile` step (manual, later) folds approvals back into
content `status` fields. The editor never writes content JSON.

**Run:** `npm run editor` (new script). No game build required.

**Acceptance:** open it with the game stopped; every approved spell previews its
real VFX; the unlock tab's red rows match `npm run orphans`; a note + verdict
survives a reload.

**Open — confirm before build:** the exact tab list. The four above are my read of
"sections without fully authored content." Add/remove before I scaffold.

---

## Track 2 — Mode 5 debug unlock button

A scene-level debug affordance in mode 5 only. One button that (a) marks every
approved spell **known**, bypassing the known-spell gate, and (b) seeds the satchel
with unlimited consumables, so you can test unlocks without foraging first.

This is deliberately a debug flag, not a content change — it flips the two gates
named above, it does not rewrite the starter set (that's Track 4).

**Folds into** merge-plan steps 3–4 (gate + receiver testing), because unlimited
unlock is exactly what makes those testable by hand.

**Acceptance:** press it, cast any approved spell on any receiver immediately,
watch a locked screen's gate clear. Off by default, DEV-only.

---

## Track 3 — Screen-flow review artifact

Extend `tools/playtest.mjs` to walk mode 5 screen by screen and screenshot each at
1920×1080. Lay the shots out in order in a self-contained HTML page: prev/next, a
feedback box per screen, screen name + the gate that reaches it.

Screens that have no art yet get a **placeholder card carrying the image-gen
prompt** (Track 3b), so the flow is complete even where the build isn't.

**3b — image-gen prompts.** For screens without assets, write ChatGPT / image-tool
prompts seeded from the refs folder
(`C:\Users\rocle\Desktop\8-16-refs\savescreen-inventory`). Each prompt names the
screen, the reference image it's built from, and the world's art direction
(hand-painted, cozy — *Spiritfarer* / *Frieren* register per CONTEXT).

**Reference-image map (confirmed, Roc 2026-08-18):**

| Screen | Refs |
|---|---|
| Spellbook (spells left, VFX+desc right) | `spell-book-bg`, `spellbook-layout-inspo…` |
| Satchel / inventory | `inventory-bag/alt/inspect` |
| Save / load | `save-load-screen` |
| Options | `options` |
| Calendar | `calendar-has-where-you-visited` |
| Notebook (NPC details) | `npc details in notebook` |
| **Home Hub decoration** | `cozy-corners`, `make-room`, `mage-workspace`, `workspace-inspiration`, `worspace-arrangement`, `shelf-in-mage-workspace`, `table-look` |

The **Home Hub** is a real screen, not just mood. Those refs show how the hub
should look, how a decoration item looks, and how items get placed. So the flow
carries a Home Hub screen, and its image-gen prompt covers both the room backdrop
and a placeable-item look. Item *placement* is a mechanic to spec later — the
merge plan parks "hub decoration" already, so this track only supplies the look,
not the place-and-save system.

---

## Track 4 — Spell-unlock rewire

**Start known = glimmer, echo, fetch** (the Mage's own approved spells). Today the
starting known set + `guaranteedPools: ["sticks"]` exist to make *ignite* castable
at start; that's the wrong seed. First job is to pin the exact seed line and change
it to the three Mage spells (and drop the sticks guarantee if nothing else needs
it at start).

**Every other approved spell learnable from its role's NPC.** The map, already
implied by role attachment:

| Spell(s) | Learn from |
|---|---|
| glimmer, echo, fetch | start known (Mage) |
| ignite, temper | Blacksmith |
| portion, weigh | Baker |
| scratch, seal, dry | Postman |
| steep, preserve | Herbalist |
| leap, waft | Priest |
| breath, furrow | Farmer |

The work is not the map — it's verifying each approved spell has a *wired* NPC
learn-path (`shareClueOnFirstTalk` / `pickNpcSpells`), and flagging the ones that
don't. That flag is Track 1's spell-tab "missing" column, so Tracks 1 and 4 share
one checklist.

**Confirmed (Roc 2026-08-18):** the map matches `content/magic/_index.md` role
groupings exactly, approved spells only. No spell moves teacher. `breath` was a
starter before and is now Farmer-taught; `ignite` was a starter before and is now
Blacksmith-taught. Both consistent with the new start-known set.

**Acceptance:** new game → spellbook offers glimmer/echo/fetch and nothing else.
Talk to the Blacksmith → ignite becomes learnable. Every approved spell has exactly
one authored teacher, or is start-known.

---

## Order

Track 2 (debug button) is the smallest and unblocks hand-testing everything else —
do it first, alongside merge-plan step 3. Track 4 (unlock rewire) is the only track
that changes game rules, so it wants the most care and a wiring test. Tracks 1 and
3 are tools and can be built in the other session in parallel; they never touch a
scene.

## Open rulings this plan inherits (from the merge plan, unresolved)

Reachability (22 of 34 scenes), the two unsatisfiable chain gates, `no_effect`
string mismatch. These are content-approval calls — they are precisely what the
Track 1 editor is built to let Roc rule on. This plan does not resolve them; it
gives them a surface.

---

## Paca

Paca is unreachable from this session. Task state is **not** written live. At the
end of the work session, write the four-track task breakdown into an update doc
under `plans/_handoffs/`, so it can be loaded into Paca when a connected session
runs. Do not treat this plan as the tracker.

---

*Companion to `2026-08-17-mode5-srp-merge-plan.md`. That plan builds mechanics in
the scene; this one builds approval + screen-flow tooling beside it.*
