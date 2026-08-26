# CODENAME: rebirth — Pitch GDD

---

## P1 · Elevator Pitch

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Myst*, *Outer Wilds*, *Frieren*, and *Studio Ghibli*, where you **explore, collect, and discover**.

You arrive as a mage newly moved to a small town the week before its festival of souls. You settle in, learn folk magic, and get to know your neighbors — and when you begin again, the same souls return in shuffled roles, and the town remembers every life you have lived.

---

## P2 · Design Pillars + Non-Goals

**Pillars** (each settles an argument in a phrase):
discovery is the reward · cozy rhythm (never hard-stop the player) · pull, not push (the world offers leads, never commands) · knowledge lives in the player's head, not a flag · non-violent core · strategy over dexterity · agentic AI accelerates, it never decides.

**Non-Goals** (what this deliberately is not):
no multiplayer or co-op · no tactical combat · no live-service or always-online · no hard-lose or game-over · no red-herring / decoy content.

---

## P3 · Player Role + World Hook

**The theme.** *What does it mean to belong — and does connection span lifetimes?*

**Your role.** You are a mage newly arrived in a Ghibli-warm town. Your days are foraging, crafting, learning folk magic, and getting to know your neighbors. You learn most magic *from people* — by watching neighbors cast and piecing it together — so *collecting* quietly becomes *connecting*.

**The world.** A warm, hand-painted countryside — town, forest (and a stretch farm) — with a festival of souls the whole town builds toward each year, and you contribute in the week leading up to it. A **life** spans three festival-weeks: the same week across three successive years, then a retrospective of your time here. Each new life reshuffles the neighbors — personalities fixed, roles re-dealt (the blacksmith becomes the postman; a friend becomes a brother) — and the bond you build with each soul deepens across lives.

---

## P4 · Core Loop

**Four interaction families:**
**Collect** (components, made things, mementos, spell-phrases, and *sounds* — which travel free, like knowledge) · **Make** (components + a learned recipe → a spell, a dish, a craft) · **Use** (apply what you hold to a target; the *receiver* decides the outcome, so the same spell lands differently on a chicken, a door, a person — presenting a thing or a sound to a neighbor is also a Use) · **Converse** (talk to a neighbor; no object changes hands).

**The loop, three tiers:**

- **A day** — one location, three-to-five moves; forage, make, cast, and talk. At day's end carry only what fits the satchel (knowledge and sounds are free), return home to decorate it, and pick tomorrow on the calendar. Route is attention — you cannot be everywhere before the festival.
- **A festival-week run** — the week builds to **festival night**; the outcome turns on your decisions and on who you spend it with (someone, a group, or alone). You **always leave with something**.
- **A life (the meta-loop)** — three festival-years, then an ending vignette and a new life. Neighbors return **recognizable but re-dealt**; recognizing an essence across the shuffle is the real skill, tracked on per-soul notebook cards the way *Obra Dinn* reads its crew. Magic is knowledge, so your recipes survive every reset; the bond you build carries across lives.

**How you progress — knowledge, not force.** New places and possibilities open when you *perform* what you have learned (watch a neighbor burn a dry hedge to clear the trail, then do it yourself). The key is almost always something you *learned*, not an item you carry.

---

## P5 · Agentic AI — the content pipeline

AI is central to **production**, not runtime. The shipped world and its dialogue are **human-authored with a small crew of agents** — every generated line reviewed and approved before it ships; the agents accelerate, they never decide. The crew runs **at build time only**, so **the shipped game makes zero model calls — fully offline, no server, no key, no network.** Its memory of your lives and its reshuffling of the souls is ordinary deterministic game code (the bond is one hidden count accreted across four categories — trust · intimacy · recognition · respect — never shown).

**The dev-crew — five workers + an orchestrator** (one feature each; full JSON I/O in Build GDD §11):

- **Orchestrator** — sequences the crew, holds the shared session state, surfaces the human gate.
- **Narrative Architect** — story structure: persona cards, seed-and-payoff echoes, the NPC codex.
- **Content / Dialogue Agent** — all player-facing text, one slot per call, inside the voice register.
- **Consistency Verifier** — checks each batch against locked canon + voice; flags only, never rewrites.
- **Audio-Tag Agent** — the audio USP: names and verifies the game's audio **GameplayTags → Wwise events**.
- **QA / Playtest Agent** — checks the assembled graph is traversable, with no dead-ends or unreachable wins.

---

## P6 · Art & Audio Direction

**Look:** hand-painted, **Ghibli-warm**, quietly melancholic, lived-in.
**Tone:** Ghibli palette warmth + Frieren desaturation and flat register + Myst static-camera diorama; no imagery reproduced. **Refs:** Studio Ghibli, Frieren, Myst.
**Built in 3D** (Unreal + the Fab point-and-click toolkit): one location reused from many angles yields many static-camera scenes, so the replayed festival week renders cheaply. Warmth is held by a *system* — a hard-constrained palette, a locked silhouette vocabulary, one key-art board and one review eye.
**Sound (the USP):** music in the spirit of Joe Hisaishi; ambience and items from foley and field recordings; built in **Wwise**. Sounds are collectible objects that travel free. Sound is the deepest recognition clue — the deepest bond's leitmotif surfaces from the festival mix as data accrues, so you know a soul by ear before you can name them.
**Going big:** no single global "epic" register; each domain gets the swell that fits it (social payoffs stay Frieren-quiet; world and magic reveals carry Outer Wilds revelation + Ghibli awe), and the words stay plain throughout.

---

## P7 · Milestones + Open Questions

**Milestones:** **7/21** — agent-crew deliverable · **7/23** — dynamic content pipeline · **8/25** — playable vertical-slice capstone.

**Slice contract** (what "done" means): one run is *fun* to the festival (the polish bar) · the short cycle is the wow (one full run then a reshuffle, end to end) · the story pipeline holds for a few runs (year-over-year memory, backstory fill, echo accumulation) · NPCs carry different-role content (the reshuffle is shown on camera) · 1–2 authored endings ship.

**Resolved** (decided; detail in the Build): concept · the 7 pillars · the four families · receiver-determined outcomes · nested clocks (day / festival-week / life) · build-time-only pipeline · **zero runtime LLM** · bond scoring (one hidden count, four categories) · persistence (knowledge/sounds free, items pack-triaged) · superposition / reshuffle rule · **3D** · audio-tag contract (GameplayTags + tag→asset library + Wwise) · slice scope (5 days/run · 2 canned paths · 10 spells · ~3 items/category · 3 years · 2 locations +1 stretch).

**Open** (named questions, no guesses): **which 1–2 endings ship** · **dev-time token budget** (first-pass ~$20–60 build-time, $0 runtime; needs a calibration pass to firm) · the **letting-go ending** (release the bond vs. hold it — parked) · the **going-big lead pole** (which register leads — parked). Full 20-item ledger lives in Build GDD §20.
