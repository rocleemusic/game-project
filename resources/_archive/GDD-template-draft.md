# [Working Title] — Game Design Document

> **Status:** template draft. Built from the one-page GDD, the Concept & Pitch template's tiering, and the Detailed GDD template's process rules, tailored to this project. Compare and merge with the class template after session 02 (Tue 7/14).

**Writing rules** (from the Detailed GDD template)
- Present tense, no waffling — "the game behaves," not "the game might."
- Real numbers or a named open question — never vague quantities.
- Don't document what isn't decided: park it in Unresolved Questions and prototype it.
- Living doc — update as the game teaches us. Git history is the changelog.
- Sections split into their own linked files only when they outgrow this page.

---

## 1. Elevator Pitch
*One sentence: what does the player do, and why is it fun?*

## 2. Design Pillars
*3–5 words/phrases that settle future arguments. Current candidates: non-violent core · strategy over dexterity · discovery is the reward · cozy rhythm · agentic AI wow.*

### Non-Goals
*What this game deliberately is not. Scope-creep insurance.*

## 3. Inspirations
*One line each: the game plus the specific thing we take from it.*

| Game | What we take |
|------|--------------|
| Outer Wilds | knowledge-as-progression; discovery is the reward |
| Final Fantasy Tactics | tactical decision depth; turn-based strategy over dexterity |
| Slay the Spire | run structure; node-map route choice |
| Absolum | world map unlocks with progress; runs can start anywhere |
| Spiritfarer | cozy rhythm and tone |

## 4. Core Loop & Mechanic
*The core verb (the thing done hundreds of times) and the smallest action → reward → new-possibility cycle.*

- **Core verb:**
- **Moment loop (seconds):**
- **Run loop (minutes):**
- **Meta loop (hours):**
- **Run-end pressure (non-violent):** what ends a run?

## 5. Agentic AI Showcase — "one agent, one wow"
*Class requirement: where do agents live, and what is the wow? Expect to merge with the "three new pillars of AI GDD" after session 02.*

- **In-game agents:**
- **Dev-pipeline agents (the dev crew):**

## 6. World & Progression
*Map structure, unlock conditions, and the persistence spectrum: what survives a run — knowledge, items, world state?*

## 7. Art & Audio Direction
*Reference-based look and sound: concept refs, tone words, sonic identity.*

## 8. Audio-First Pipeline
*The process USP: every animation and game event ships with a naming/tag contract so sound attaches automatically. AI-assisted audio workflow pilots get documented here as they run.*

- **Event/tag naming contract:**
- **Auto-linking rule:**
- **AI workflow experiments:**

## 9. Project Conventions
*The tag is the metadata — each gameplay event is a **department-agnostic** hierarchical Unreal GameplayTag; the data-driven tag→asset library resolves it per department (Wwise event / dialogue / art). Replaces path-mirroring; the library is the single source of truth.*

```
<Entity>.<Interaction>[.<Phase>]   →   Wwise event · dialogue · animation   (per department, via the tag→asset library)
```

- **Directory rules:**
- **Naming rules:**

## 10. Platform, Engine & Scope
*Engine decision (Unreal — Session 2), target platform, and the six-week playable slice: what is in the capstone build — and nothing else.*

## 11. Milestones
*Anchor to class assignment dates — see [syllabus.md](syllabus.md). GDD draft 7/14–16, agent crew 7/21, capstone 8/25.*

## 12. Unresolved Questions
*Open questions live here. When answered, move to Resolved with a pointer to the decision — never delete.*

### Open
- Which 1–2 endings ship in the slice (true ending deferred)? Candidates: "not this life" + one solidified-enough warmer variant
- Slice math under the calendar model: locations × days × NPCs × years — re-derive at template merge (rooms-based math from Session 2 is obsolete)
- Content-budget table for canned paths: candidate cap, unit counts, template ratio — needs real numbers

### Resolved
- Six-beat room grammar → **retired** — superseded by the four action families (Collect · Make · Show/Ask · Use); audio-first arrival, deliberate audio capture, and carry-one survive in other systems (Session 8)
- Slice endpoint → **the slice contract**: polish the run, prove the loop — one fun run · full cycle playable · story pipeline for a few runs · NPCs in different roles · 1–2 endings, true ending deferred (Session 9)
- Partner awakening → **the true ending**: the solidified vignette ends on "Promise you'll find me in the next life"; the awakened partner renews the promise; post-credits, continue or player-performed save deletion (Session 9)
- Partner fixation → **once a true partner emerges it is fixed until save wipe** — constitution → recognition phase-change; the wipe returns the world to superposition (Session 9)
- Authored vs. generated → **two modes**: ≥1 fully pre-generated path playable with no agent connected, plus live-ICM mode unique every time; canned paths built by the dev-crew pipeline (Session 9)
- Which concept → **cosmic hide-and-seek** — reincarnation deduction cozy roguelike ([concept-dig-notes.md](concept-dig-notes.md), Session 3)
- What ends a run → **the festival** — run = the same festival week of successive years within one life; pack-triage allows ending early (Sessions 5–7)
- Tactical-encounter verb set → **life-verbs** (forage, gather, gift, talk; magic as the skill expression); FFT-style tactics parked (Sessions 2, 4, 6)
- Persistence spectrum → **knowledge travels free and survives wipes** (magic recipes); items via pack-triage; hub shared across timelines; roles fixed within a life (Sessions 5–7)
- Engine → **Unreal** (Session 2)
