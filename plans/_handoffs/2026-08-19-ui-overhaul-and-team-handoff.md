# Handoff — UI overhaul finished, a self-correcting UI team built (2026-08-19)

Continues from `2026-08-19-ui-migration-handoff.md`. This is now the current file to
read; that one is history. Long session — the gold repaint, the last three UI-migration
screens, a real VFX bug, the content editor, a two-seat UI team, and its first run.

**Verification baseline, all green:** `tsc --noEmit` clean · `vitest run` 640 passed / 1
skipped · `CollectScene.ts` at 898/900 (gate held — pushed to 908 by the DayPicks slice,
compacted back, never raised). VFX fix lives in a worktree, not on main (see Open).

---

## What shipped this session (done, verified)

### The §14 gold repaint — and the VFX decouple it forced
- `phaser/src/ui/theme.ts` — menu gold repainted to §14 canonical `#c9a15a` (from bright
  `#ffd479`); hover `ember` → brighter gold `#e6c583`. Contrast rechecked, all AA.
- **Seven scene files swept off hardcoded gold** onto `COLOR` tokens — the handoff's claim
  that "everything reads the tokens" was wrong: `ScreenScene`, `HubScene`, `CastScene`,
  `EditModeSystem`, `SatchelStrip`, `NpcTalkSystem`, `PreloadScene` all hardcoded `#ffd479`.
- **VFX decoupled** via new `COLOR.vfxGold`/`vfxEmber` (the pre-repaint values). Six spell
  effect cues + five ember cues in `cues.json` now use these. WHY: the darker menu gold
  broke the no-effect `cueWeight`/`neutralFor` parity ruling (a gold tint's no-effect twin
  fell to 81% weight, past the 95% floor, and `neutralFor` returned null). The decouple
  keeps spell VFX pixel-identical to pre-repaint and the ruling intact. `spellPreview.ts`
  and the ranking test reference the vfx tokens accordingly.

### 2b Save/Load → Phaser, and it took over boot
- `SaveLoadScene.ts` is the boot **Continue gate** (replaces the retired `ResumePromptScene`).
  Reproduces its five load-bearing behaviours: PreloadScene entry, null-save/read-fail
  passthrough → LocationSelectScene, Resume → CollectScene direct, Start-over clears the slot
  eagerly, `runToChoice()` first (the day-1 card-flash fix). Draws `bg:mode-picker` so it
  never sits on black. **No in-game button** — save is automatic. `ResumePromptScene.ts`
  deleted; `main.ts`/`PreloadScene.ts` rewired.

### 2c Options — button now, features later (Roc's call)
- `OptionsScene.ts` — a visual shell (framed board, category rail, help card) with controls
  drawn at half-alpha and an honest "not wired yet" note. Opens from the **VN control bar's
  own "Options" button** (wired via `DialogueSystem`'s `onControl`), not a new HUD button —
  the top row was full. `O` hotkey too. A real settings system (SettingsStore + audio bus +
  the three widgets) was correctly refused as greenfield, deferred.

### 2d Spellbook — the Notebook's Spells tab, now a book with a live VFX preview
- `NotebookScene.ts`'s spells tab rebuilt into a **centered leather book on parchment pages**
  (overlaid on the dimmed game, not full-height), index left + detail right. Known spells with
  role chips, the full locked catalog by teaching role, real "what it does" prose from the
  spell data.
- **Live VFX preview** plays each spell's REAL authored cue, contained to a pane. Filter cues
  (glow/tint) use a dedicated preview camera; particle cues emit on the main camera, geometry-
  contained. `spellPreview.ts` (pure `spellPreviewCue`) + `spellPreview.test.ts`. Reuses the
  authored cue unmodified — never invents a cue/colorKey (the ruling).

### The VFX particle bug — found and fixed (in a worktree)
- `PhaserVfxBackend.emit()` called `explode(quantity, anchor.x, anchor.y)`; Phaser 4.2.1 treats
  those as emitter-LOCAL, so particles landed at **2× the anchor** — every particle spell cast
  rendered in the bottom-right corner in-game, and off-center in the content editor's preview.
  Fix: `explode(quantity)`. Verified: worldPosition 984 (fixed) vs 1943 (buggy); content-editor
  preview centers instead of showing empty. **Lives on branch `worktree-agent-a31c24caebf801c2c`,
  NOT merged.**

### Content Approval Editor — two fixes
- `tools/content-editor/` — added an **Export review (JSON)** button (mirrors the screen
  editor's export) and a **collapsible VFX dock** (it was a fixed panel covering the corner).

### The UI team — two seats, audited, and run
- `agents/ui-builder.md` + `agents/ui-verifier.md` — a build↔verify loop, two entry points
  (build-first for new/redesigned screens, verify-first for existing ones). Builder writes code
  and escape-hatches greenfield data; Verifier grades findings-only against the design system,
  never fixes. Both reference `gdd/14-visual-style-guide.md` + `design-system.html`. Passed
  `contract-audit` (0 Band-1; one S.4 path fix applied). `agents/README.md` roster + UI-pair note.
- **First run: location-select redesign** (below). It exposed that the Verifier rubber-stamped a
  screen with a washed-out subtitle and a busy background — it judged fidelity-to-reference, not
  readability. **The Verifier contract was tightened**: a legibility check, a "reads well, not
  just matches the reference" criterion, a third failure mode, and a trace to that run.
  **The tightening was then validated:** the tightened Verifier re-graded the fixed screen and
  CAUGHT the still-present double-calendar background it had passed the first time — same defect,
  now `needs-fix` with file+line. The grader that missed it now catches it.

### Location-select redesign (the team's first build)
- `LocationSelectScene.ts` reworked to read like `CalendarScene`: THE WEEK, five day cards, the
  two GDD-ruled starts (Town Square, Forager's Clearing) as map-thumbnail buttons in day 1, Day 5
  = Festival Night. Fix pass added a legible title plaque, a heavier backdrop scrim (applied to
  `CalendarScene` too, shared backdrop), and **per-day pick history** — new `world/DayPicks.ts`
  + `save/slices/DayPicksSlice.ts`, so past days show the player's real chosen-location thumbnail.
- **Verifier re-grade → subtitle fixed, background then FIXED with Roc's asset.** The tightened
  Verifier passed the plaque but caught the still-bleeding paper-calendar numbers (`needs-fix`) —
  validating the tightening (the grader that missed it now catches it). Roc then supplied a
  **celestial-book backdrop** (`calendar-blank.jpg`); it replaced `public/art/ui/calendar-bg.jpg`
  (both scenes share that one file) and the scrim dropped 0.75 → 0.3. The double-calendar is gone.
  **Remaining:** the dark day cards read heavy on the light parchment — they need the light
  gold-framed-panel treatment (Roc's Image 3). That is the first next step (Open #1).

### GDD
- `gdd/03-core-loop.md` — "Start-of-day location (RULED 2026-08-19)": the day's start is a choice
  between exactly two screens, Town Square and Forager's Clearing. `08-levels.md` already marked
  both `*(start)*`.

---

## Open — in rough priority order

1. **Location-select card restyle → light gold-framed panels (FIRST next step, Roc 2026-08-19).**
   The celestial-book backdrop is in and reads clean, but the day cards are still DARK panels that
   sit on the light parchment like boxes punched in the page. Restyle them to light, gold-framed
   panels matching the book and Roc's Image 3: parchment-tinted fill + gold filigree frame, and
   flip the day labels / "Festival Night" from light text to dark ink so they read on the light
   fill. Day 1 (today) keeps its emphasis via the brighter frame + the thumbnails. Then run the
   **UI Verifier** to close the loop on Roc's asset. This is a good clean job for the UI team.
2. **Merge the VFX fix.** Branch `worktree-agent-a31c24caebf801c2c` has the `explode(quantity)`
   fix, verified, not on main. Merge it, THEN remove `NotebookScene.ts`'s particle **halving
   workaround** (it compensates for the 2× bug; once fixed, the halving double-corrects).
3. **Screen-flow feedback beyond location-select** — `_handoffs/8-19-26-screen-flow-feedback.json`
   also asks for **calendar** changes (show each day's chosen location, "Festival Night" subheader,
   drop time-of-day) and **collect-forage** changes (status line "day 1 · morning · [Screen Name]",
   buttons match the style guide). Open UI-team work.
4. **Town-square art** — the town start's backdrop (`bg:T1` = `images/town-1.jpg`) is a real-world
   photo placeholder next to Forager's Clearing's painted art. Needs a painted asset.
5. **§14 map-thumbnail button** — the Verifier flagged the map-thumbnail as new button vocabulary
   not in §14's families. Consider a formal §14 entry so future map-pick screens reuse it.
6. **Track 3** — Notebook + Hub filigree/parchment theme adoption. The last original UI-migration
   item; not started.
7. **Options features** — SettingsStore + a music/SFX audio bus + the slider/toggle/segmented
   widgets. The shell is ready to receive them.
8. **Assignment Scout** — the second agent seat, still not run against this session's work.
9. **Save-slots gap (GDD vs code).** `06-world-and-progression.md` specifies **3 save slots** (three
   parallel lives); the mode model has **one autosave slot per mode** (`ModeDescriptor.save` is a
   single string). SaveLoadScene renders 1 real + 2 empty to match the design. Reconcile later —
   either build multi-slot save or narrow the GDD to one slot for the slice.

### New art assets available (`C:\Users\rocle\Desktop\grok`, 2026-08-19)
Roc's parchment/celestial asset set. Wired: `calendar-blank.jpg` → `public/art/ui/calendar-bg.jpg`
(the location-select / calendar backdrop). Not yet used, candidates for other screens:
`calendar.jpg` (open book with pre-framed panels — a schedule/grid or the card-restyle reference),
`book.jpg` / `spellbook.jpg` (book backdrops — could upgrade the drawn leather Spellbook),
`column.jpg` (a single filigree card — a save slot or detail card), plus `home*.jpg` / `shelf*.jpg`
diorama art for the Home Hub.

---

## Process notes worth keeping

- **The UI team works, and self-corrected on its first run.** Build → verify → tighten-the-grader
  → fix → re-verify all happened. The Verifier's lenience was a real finding, not a hypothetical.
- **The no-effect VFX ruling survived the gold repaint** because the decouple was chosen over
  re-tuning — the ruling stayed Roc's, untouched.
- **The SRP line gate keeps earning its place** — it caught the DayPicks slice pushing CollectScene
  to 908; the fix was compaction, never raising the cap. Fourth time this held this session.
- **Every UI change was verified with a real `playtest.mjs` render**, not just `tsc`/`vitest` — the
  session's recurring lesson, now encoded in the UI Verifier contract.
