---
kind: synthesis artifact
artifact: voice-style-guide
sources:
  - narrative/ (voice + subtext + emotion + NPC-agency notes — incl. hide-romance-in-front-of-you, not-all-hopeful-stories-are-happy, strongest-episode-goes-unnoticed, when-the-a-plot-doesnt-matter, in-praise-of-layered-exposition, magic-system-learns-from-science, why-the-three-episode-rule-exists, the-problem-with-backstory, when-great-foreshadowing-goes-unnoticed, when-a-scene-is-more-tragic-than-you-realized, paradox-of-charming-character-flaws, realistic-character-growth, frierens-mimic-gag, side-characters-to-worldbuild, character-shows-up-for-10-minutes, not-all-heroes-pull-swords-from-stone, great-character-least-expect, when-they-dont-make-demons-evil, frieren-as-great-antagonist, normal-person-in-an-anime, if-you-love-a-character-let-them-go, main-character-as-boogeyman, entire-story-in-9-minutes, why-some-hate-the-new-1-anime, frieren-isnt-boring-its-deliberate, in-pursuit-of-a-perfect-montage, couple-seconds-to-end-a-fight, when-an-author-wont-name-things, writing-books-with-ai, the-secret-to-frierens-worldbuilding [pilot])
  - "narrative/ (NEW H9 env-storytelling/subtext/emotion): writing-nothing-unsaid-words, generating-emotions-in-narrative, environmental-narrative-in-spaces, environment-as-visual-storytelling, integrating-narrative-portal, coherent-storytelling-open-world"
  - "narrative/ (NEW NPC-variance): modular-characters-system-driven, npcs-with-agency-80-days, npcs-increase-player-empathy, creating-strong-characters, dialogue-of-hades"
  - "art/ (NEW visual lens): frieren-color-design-eyes, secret-colors-of-studio-ghibli, frieren-backgrounds-analysis, ghibli-animation-secrets, studio-ghibli-process, miyazaki-characters-come-alive, art-direction-of-no-mans-sky"
  - frieren-primary/ (e01, e02, e03, e04, e07, e11 [Kraft], e14)
  - GATE-2-review.md (A1 homogenization worry; D1 going-big)
  - _resynthesis-staging/round-A/gdd-structure-model.md (§6 voice register + §5 NPC-variance floor consumer)
built: "Phase 2.5 resynthesis (2026-07-17)"
serves: [style-guide, H9, H2, H10, H17-VISUAL]
status: "STAGED candidate for GATE 2"
grounds-toward: "cosmic hide-and-seek — reincarnation-deduction roguelike; retrospective-significance engine"
supersedes: "synthesis/voice-style-guide.md (Phase 2, pre-doubling 74 notes) — this is a refresh, not a rewrite: the 11-section spine + DO/DON'T + Watch-outs are kept; §5A NPC-variance and §7A visual lens are ADDED; §3/§4/§8 folded with new H9 notes"
---

# Voice & Style Guide — the game's narration, dialogue, and look

**How to use this.** This is the single source of truth for how our narration and NPC
dialogue *sound* — and, new in this refresh, how they *look* (§7A) and how distinct NPCs
stay distinct without breaking the shared register (§5A). It is written to be executed by
three readers: (a) a human writer drafting scenes, (b) the in-game narrative agent
generating lines at runtime, and (c) the art director / scene-comp agent setting the
visual register those lines land in. Every rule below is prescriptive and traceable to the
KB. Where a rule courts a locked-pillar failure mode, it says so in **Watch-outs** (§10).
When you finish a scene, run the **DO / DON'T** checklist (§9). The Round-A structure model
consumes this file at two points: §6's voice register feeds the Build GDD §6, and §5A is
the "NPC-variance floor" the Build GDD §5/§6a points at [`gdd-structure-model` §8].

> **What changed in this refresh (2026-07-17).** The guide was built from the original 74
> notes and predated ~15 new voice/subtext/emotion notes plus the 29 art-direction notes.
> This pass keeps the 11-section spine and integrates (does not concatenate):
> **(a)** folds the new H9 environmental-storytelling / subtext / emotion craft into
> §3, §4, and §8 (changes flagged inline with **[+refresh]**);
> **(b)** ADDS **§5A — NPC variance within the flat register** — directly answers Roc's
> GATE-2 worry that too many NPCs read alike [`GATE-2-review.md` A1];
> **(c)** ADDS **§7A — Visual lens** (color / restraint / Ghibli, from the art batch).
> The original voice thesis is unchanged — the new notes *converged* on it. Where they push
> somewhere new (context-boxes, sentiment-columns, ma-as-pause, saturation-as-register) it is
> called out honestly, never smuggled in.

**One thing to internalize first.** Our emotional engine is *retrospective significance*:
an ordinary detail becomes meaningful in hindsight. Almost every rule here exists to protect
that engine. The voice is quiet on purpose — because a quiet surface is what lets a small
thing detonate later. If a line performs its own importance, it has already spent the charge
this game runs on.

> **Copyright note.** All exemplar lines in this guide are **original**, written in the target
> voice to demonstrate a *pattern*. They paraphrase craft, never source dialogue. Keep it that
> way: illustrate the technique with your own short lines; reproduce no source passages or imagery.

---

## 1. Voice in one paragraph

We write flat, plain, and short. One thought per line; the emotional weight lands on the
*trailing* beat — the small deflating clause that arrives one step after the sentence looked
finished. Characters speak in the wrong register for what they feel: grief comes out as
logistics, love comes out as irritation or as *effort*, awe comes out as mild curiosity.
Nothing is named that can be implied. Heavy lines are followed by light ones so neither
register settles. The world talks about itself only after it has *shown* itself — proof first,
then a plain definition, never a lecture. Significance is never announced; it is seeded low,
beside plot-inert noise, and revealed later — often from *someone else's* attachment to the
thing you walked past. The overall feel is dry understatement with a melancholic undercoat,
warm without being sentimental, cozy without being toothless: a world that would go on living
whether or not the player pursues it.

---

## 2. Register & cadence

The whole corpus converges here first (all voice notes; `hide-romance-in-front-of-you`,
`not-all-hopeful-stories-are-happy`, `strongest-episode-goes-unnoticed`, `when-the-a-plot-doesnt-matter`).
These are the non-negotiable line-level rules.

### 2.1 One clause per line; deflate the follow-through
Keep lines short — usually under ten words, rarely more than one thought. When a beat is
heavy, exit light. Never let an emotional landing double down on itself; the follow-through
takes air *out*, it does not add weight (`e01`, `e14`).

> — "The lantern's still lit."
> — "Somebody used to keep it that way."
> — "Anyway. We should move."

The feeling lives in the gap between line two and line three, not in any single line.

### 2.2 Redirect, don't name — speak the wrong register
A character feeling grief, love, or fear speaks in category-language, logistics, or a joke —
not the feeling (`e02`, `e03`, `e14`). "It'd be a waste to lose it now" is care wearing the
mask of accounting. Let the reader bridge it.

> — "You kept the seat by the window free."
> — "It's the drafty one. Nobody wants it."   ← that *is* the tenderness; do not translate it

### 2.3 Deflection is characterization
A character who routinely steers away from their own feeling reveals more by what they won't
say (`e14`, `e04`). The narrator never supplies what the character withholds.

> — "If I don't find it by dark, I'll let it go. I lose things."

### 2.4 Contradiction / correction as the exchange unit
Build dialogue where each line reverses or corrects the prior one instead of extending it
(`e02`). The surface argument runs; the real subject stays unspoken and needs no summary.

> — "You must have loved this place."
> — "A little."
> — "You came back every year."
> — "Habit."

### 2.5 Number the admission; use the diminutive
When a character must confess something vulnerable, let them itemize it or shrink it. The
tidiness is emotional armor, and it makes the soft thing land harder (`e01`).

> — "Two reasons. One, I wanted to look calm. Two, I mind it more than I used to."
> — "I just wanted one more season. That's all."   ← "that's all" performs the scale

### 2.6 Silence as structure — leave the confession incomplete
Cut a sentence mid-thought and trust the reader to finish it. Don't return to close the loop
in-scene; the gap *is* the meaning (`e01`, `e07`). A line can receive no answer at all — the
next scene simply begins, and the non-answer is the answer. **[+refresh]** This is the
"unsaid words" technique made mechanical: omission raises emotional density, and *hesitation
compressed into fewer words* ("I'll try") lands harder than the full explanation
(`writing-nothing-unsaid-words`). An implication ("I know," when the felt line is "I love
you") carries all the weight of the stated version and none of the cost.

> — "Next year, maybe we could—"
> — "…What?"
> — "Nothing. Forget it."

### 2.7 Economy signals register
This is the load-bearing mechanic a runtime agent can act on directly (`e14`): **the *mode*
of the dialogue tells the player what kind of scene they're in.** Comedy and conflict are
verbose, overlapping, interruptive. Emotional weight is short, flat, and refuses to escalate.
Two lines can share the same short structure and carry opposite charges — the marker of grief
is the *absence of complaint or escalation*. Train the agent to switch to economy when the
register turns quiet, and to loosen into overlap when it turns light.

### 2.8 Register-lock by scene, not mid-line
Warm banter and quiet reflection do not mix inside one exchange. Hold one register per scene;
change only at the cut (`e04`). A scene that tries to be funny and devastating in the same
breath dilutes both. **[+refresh]** `e11` (Kraft) is the clean proof: broad comedy in the
front half, a quiet commendation talk in the back, and the tonal shift lands *only* at the
scene break — while the heaviest line uses the identical short cadence as the jokes around
it, so the *gap*, not a raised voice, carries the weight (`e11`).

### 2.9 Tonal break as buried subtext **[+refresh — new sub-rule]**
A sudden, small swerve of subject — from the thing that matters to something trivially
domestic — exposes the feeling the character is avoiding without naming it. The disjunction
*is* the subtext; the mismatch between expected tone and actual tone does the work
(`writing-nothing-unsaid-words`). Use sparingly and always readable: it should land as "oh,
they can't say it," never as a non-sequitur the player can't parse.

> — "They're not coming back, are they."
> — "…You left the window open. It'll rain in."

### 2.10 Certainty vs. fuzziness reveals what a character values **[+refresh — new sub-rule]**
What a character is *precise* about and what they're *vague* about is characterization on its
own (`writing-nothing-unsaid-words`). Let them remember the exact detail that mattered to them
and wave off the ones that didn't; the player reads priority from the contrast, no statement
of feeling required. (This becomes a per-NPC dial in §5A.3.)

> — "It was a Tuesday. Cold. She wore the green coat."
> — "Where were you sitting?"
> — "Somewhere near the back. Doesn't matter."

---

## 3. Exposition method — proof before definition

The strongest convergence outside register (`e07`, `in-praise-of-layered-exposition`,
`magic-system-learns-from-science`, `why-the-three-episode-rule-exists`, `the-problem-with-backstory`;
**[+refresh]** `environmental-narrative-in-spaces`, `environment-as-visual-storytelling`,
`integrating-narrative-portal`).

- **Show the effect first, define second.** The player encounters a behavior in the world
  before any NPC or text explains the rule. Definition arrives only after proof, delivered by
  a character with standing to explain it, in plain language (`e07`: "definition follows
  proof"). For a knowledge-is-the-key metroidbrainia, this is doubly load-bearing: the player
  *learning* the rule should be the same act as the world *demonstrating* it.
- **Hide exposition inside a scene that has another job.** Let conflict, a chore, a joke, or a
  relationship reveal carry the information as a side effect (`layered-exposition`). Exposition
  that is a scene's *only* purpose is the failure mode.
- **[+refresh] Carry story through space and affordance, not signage.** One evocative image
  outperforms a wall of text; a room's object arrangement, wear, and layout answer "who lived
  here, what did they do, what did they value" without a placard (`environmental-narrative-in-spaces`,
  `environment-as-visual-storytelling`). Behavioral traces — a worn path, a chair under the one
  good lamp, the one shutter always left unlatched — embed a person into a space with no
  dialogue. This is where the *partner echoes* should live first: in the environment, before
  any NPC speaks them. Keep text to the essential two-line note; let the scene carry the weight.
- **[+refresh] Minimize the story-gameplay gap.** Every story beat should also be the beat the
  player is *doing* — the emotion the environment or line amplifies must match the emotion the
  player's action already describes, never contradict it (`integrating-narrative-portal`, the
  low-Delta principle). When a beat isn't landing, the fix is almost always to *cut more*, not
  explain more; attachment to a line is the enemy.
- **Exposition must produce a reaction that adds new information.** A good info-delivery line
  earns its place when the receiver's ignorance is plausible *and* their response tells us
  something back (`e07`: "Did we do something like that?"). One-way delivery is a dump.
- **Deliver world-rules from inside a character's own logic**, not from an outside authority
  (`e07`: the manipulator explaining its own method; **[+refresh]** `e11`: Kraft's faith
  delivered as self-aware confession — "More like, I really need her to be real" — the
  *vulnerability*, not the doctrine, is the content). Use for NPC confessions, echoes, and
  found journal fragments — the reincarnation echoes should sound like *someone's reasoning*,
  never like narration.
- **Inference over pronouncement.** Give the player puzzle pieces and let them assemble the
  meaning; reserve flashback for rare, high-stakes, *active* recontextualization — a flashback
  must offer more than it costs in pacing, or cut it (`the-problem-with-backstory`).
- **Multitask the tutorial.** The player learning the interaction grammar should double as a
  character moment, the way a learner's confusion mirrors the audience's learning curve
  (`three-episode-rule`).

> Proof, then plain definition:
> — *(the player watches a merchant refuse a coin stamped with last year's festival mark)*
> — Later, an elder: "Old marks don't spend here. The year they were struck, we lost the harvest. People remember."

---

## 4. Retrospective significance & seeding — the emotional engine

This is the reason the voice is quiet (pilot `the-secret-to-frierens-worldbuilding`; `e01`,
`e02`, `e11`, `e14`; `when-great-foreshadowing-goes-unnoticed`; `strongest-episode-goes-unnoticed`;
`when-the-a-plot-doesnt-matter`). It is also H9's core mechanic. **[+refresh]** The new env/emotion
notes deepen the *how* without changing the thesis.

- **Deliberately break Chekhov's gun.** Introduce detail that *isn't* plot-pertinent but feels
  true to the world, and hide the plot-relevant seed amongst that barrage. Pure Chekhov reads
  as a machine; ambient noise reads as reality (pilot). The player must not be able to tell the
  seed from the noise at time of planting (`e02`).
- **Plant low, beside plot-inert material.** Seed the partner-echo detail in a moment of
  logistical, non-emotional business — next to a cleaning task, a pest, a price, a chore — not
  in a highlighted scene (`e02`, `e04`).
- **[+refresh] The environment is the first place a seed lives.** Behavioral traces and object
  arrangement plant significance before any line does — a space "tells the story without saying
  anything aloud" (`environmental-narrative-in-spaces`, `environment-as-visual-storytelling`).
  Model ambient clue distribution so *any* interactable can push the player's knowledge one step
  forward, so no single object is the sole bearer of a critical thread
  (`coherent-storytelling-open-world`, the knowledge state-tree principle). This is what lets a
  seed survive the player exploring in the "wrong" order.
- **Resolve through a *different* strand than the one the player tracked.** The connection was
  always logical; its logic only becomes visible at resolution (`e02`). Reward the player who
  connects it themselves; never recap.
- **Assign the weight from someone else's attachment.** Plant a small object without flagging
  it; reveal its weight later through an NPC or found note who cared about it — the player
  realizes the significance the same moment the protagonist does, from the far side of the gap
  (`e01`: the horn; `e14`: the ring). **[+refresh]** `e11` gives the cleanest diegetic *engine*
  for this: Kraft's single want is *to be remembered* — "having nobody to remember the
  testaments to your existence is just too cruel" — and the payoff is another character agreeing
  to remember him. A want-to-be-remembered planted early makes the *player* the eventual payoff.
  *This is the exact template for our reincarnation echoes: a life's meaning depends on being
  witnessed and remembered, and the player is the one who finally does.*
- **The stated goal can be a decoy for the real find.** Searching for one thing can yield the
  proof of something more meaningful — an *absence* can prove what a character *didn't* do
  (`e02`). Use stated objectives to misdirect toward the better payoff.
- **Motif migration.** Seed an image or phrase in a comedy beat first, then let it drift,
  unannounced, into the emotional register later. The *rhyme* is the climax — no event, no
  swell (`e14`).
- **Weight is preloaded, not performed.** A quiet climax needs almost nothing at the moment of
  payoff — a single word ("Thanks.") carries everything *if* the setup trusted the player to
  remember. Amplification at the payoff destroys it (`e14`). **[+refresh]** The one sanctioned
  exception — a permitted swell at a narrative/reward payoff, or a sprinkled wonder-beat
  [`GATE-2-review.md` D1a] — is a *visual/scale* move (see §7A), not a rewritten line. The words
  stay preloaded and plain even when the frame goes big.
- **[+refresh] Give each emotional beat a context box.** Every payoff needs a mini-structure:
  intro (set the context), middle (deliver via tell / show / do), payoff (a state change)
  (`generating-emotions-in-narrative`). Skip the intro and the player interprets wrong or feels
  nothing. Prefer **representation over simulation** — put a character *between* the player and
  the raw feeling so the player *cares for them* rather than being told to feel it directly. This
  is the structural insurance against "press Y to cry": interpretation is the emotion, and
  interpretation needs context to land.
- **Seed the anchor in the opening without requiring the player to feel it yet.** Place the
  emotional weight early; let meaning be constructed by the hours of discovery that follow
  (`when-a-scene-is-more-tragic-than-you-realized`). For our roguelike this is a *feature*: the
  same festival week replayed across years and runs is the built-in reexperience the technique
  needs. Design so the first pass still means something and the later pass means more.

> Seed (logistical, unflagged), then later payoff (from another's attachment):
> — Year 1, in passing: "Careful, the baker leaves the back shutter unlatched — cats get in."
> — Year 4, a stranger, unprompted: "She always left it open. Said someone might come back cold."

---

## 5. Characterization & motif

Convergent across `paradox-of-charming-character-flaws`, `e04`, `realistic-character-growth`,
`frierens-mimic-gag`, `side-characters-to-worldbuild`, `character-shows-up-for-10-minutes`,
`hide-romance-in-front-of-you`, `not-all-heroes-pull-swords-from-stone`.

- **Characterize by repeated small behavior, never stated traits.** Define a *behavior cluster*
  and let the player infer the trait. Any single instance is disposable; together they are the
  character (`realistic-character-growth`, `e04`). Encode a value through repeated action —
  even a repeated *failure* toward a consistent value reads as character, not stupidity
  (`frierens-mimic-gag`).
- **Third-party observation over self-description.** Let another character notice something odd
  and fail to explain it; the writer doesn't explain it either. The gap is the characterization
  (`e04`: "Even though she always seems uninterested in me."). "You've changed," said by someone
  who knew them before, is the template for NPC reaction-based characterization.
- **One or two *specific*, minor, consistent flaws** (sleeps in, hates the cold, over-cautious)
  make an NPC likable; broad incompetence (lazy, weak) reads as writer-laziness. And never
  *punish* the charming flaw in-world — the moment the world treats it as shameful, the charm
  dies (`paradox-of-charming-character-flaws`).
- **Recurring soft motifs accrete meaning without explanation, and stay interpretable.** A small
  repeated image or gesture is left open, never resolved (pilot). Do not add a line that "closes"
  a soft motif; the openness is the point.
- **Small acts are as weight-bearing as large ones.** A helper who clears one road for the
  merchants behind them carries as much narrative gravity as a grand deed — the network of small
  impact is the theme (`not-all-heroes-pull-swords-from-stone`). Keep such acts *responsive* to
  the world, not the character pushing their own legend.
- **A brief NPC lands through resonance, not screen time.** Give a one-scene NPC a single clear
  contrast to a question the game has already made the player feel; don't hand them new lore
  (`character-shows-up-for-10-minutes`). Undersold visual design + nuanced charm (ambitious *and*
  checked; competent *and* human) beats a striking design that announces importance
  (`great-character-least-expect`). **[+refresh]** This is the **Kraft template** made concrete
  (`e11`): a memorable brief NPC is (1) a *mirror* of a question the player already owns, (2)
  given one legible want with one payoff scene, (3) introduced through behavior before backstory,
  (4) voiced from inside their own logic, and (5) sent off into an implied ongoing life. See §5A
  for how the roster keeps these distinct from one another.
- **Romance and bonds live in the periphery.** Affection is shown through effort and comfort,
  never declaration; a held look outweighs a confession; conflict comes from real character
  incompatibility, not miscommunication (`hide-romance-in-front-of-you`). Archive "saying the
  feeling aloud" until late or never.
- **Antagonists are ecological, not evil.** Write opposition as survival-driven force and
  incompatible needs, not malice (`when-they-dont-make-demons-evil`). Voice the antagonist in the
  **observation register, not the threat register**: they *notice and categorize* rather than warn
  or boast; menace is precise perception applied to a wound, delivered in flat affect (`e07`). The
  most unsettling opponent is one *incapable* of understanding the player's values, not one who
  chooses harm (`frieren-as-great-antagonist`). (Reconcile with the **non-violent core**: keep
  resolution a knowledge/observation gate, never a kill — see Watch-outs.)

> Third-party observation, unexplained:
> — "He counts the chairs every night before he locks up."
> — "Why?"
> — "Never asked. He just does."

---

## 5A. NPC variance within the flat register **[NEW — added this refresh]**

*Why this section exists.* Roc's GATE-2 worry is real and specific: "current synthesis gives
good tone overall for Frieren, but I worry having too many NPCs that are similar, so want to
leave room for different personalities to emerge as we write" [`GATE-2-review.md` A1]. The old
guide flagged this as a Phase-3 gap and stopped. This section closes it with a *method*: the
flat register is a **shared grammar, not a shared voice.** Every NPC obeys §2 (short,
wrong-register, deflecting) — that is the *world's dialect*, what makes the cast feel like one
place — but *what* each one deflects toward, is precise or vague about, and refuses to cross is
theirs alone. Homogenization is not a property of the register; it is a failure to dial the
axes below. **This section is a floor for emergence, never a ceiling — Roc fills the actual
values during Phase-3 writing.** Sourced from `modular-characters-system-driven`,
`npcs-with-agency-80-days`, `npcs-increase-player-empathy`, `creating-strong-characters`,
`dialogue-of-hades`, and the frieren-primary voice notes (`e04`, `e11`).

### 5A.1 The register is the world; the variance is the person
The flat, understated cadence is a *dialect the whole world speaks* — it is what makes the cast
feel like one place, one tone. Distinctiveness comes from what varies *inside* that dialect, not
from letting one NPC talk loud while the rest stay quiet. An NPC who breaks the register to be
"different" reads as a tonal error, not a personality. The correct move is to keep the grammar
and vary the *content, priorities, and limits* — the axes below.

### 5A.2 Define orthogonal trait axes; never correlate them by default
Build each NPC on a few *independent* axes — a value on one must not predict a value on another
(`modular-characters-system-driven`). Correlated traits ("imaginative implies romantic")
collapse the possibility space and are exactly what makes a cast read as "cookie-cutters with
different flavors." Resist the logical-seeming link; that correlation is where the sameness comes
from. Candidate axes for our cast (Roc sets the actual values in Phase 3):

- **Deflection target** — where does this person's feeling *go* when they won't name it? (Into
  logistics? Into a joke? Into a chore? Into precision about an irrelevant detail? Into silence?)
  This is the single most differentiating axis in the flat register: two NPCs can use identical
  cadence and read as opposite people purely by *what they redirect toward*.
- **Precision profile** (§2.10) — what is this person exact about, and what do they wave off? A
  person precise about weather and vague about names is a different soul from one precise about
  debts and vague about dates.
- **Warmth channel** — how does affection surface? As effort? As accommodation? As irritation
  ("as always, she's so obnoxious")? As feeding or tending? (`e04`.)
- **Talkativeness under weight** — some go terser under emotion, some over-explain the logistics
  to avoid the feeling. Both stay short; the *shape* of the shortness differs.

### 5A.3 One salient signal beats sixty invisible permutations
Players don't need mathematical uniqueness; they need *one memorable differentiating signal* per
NPC — the "oatmeal problem" (`modular-characters-system-driven`). Give each NPC a single
**essence signature**: one want + one behavior cluster + one thematic contrast to the player's own
arc (the `e11` / `character-shows-up-for-10-minutes` card). Surface that signal early and often;
bury the fine detail. Budget your writing variety toward what the player sees most, not toward
permutations they can't perceive.

### 5A.4 Give each key NPC one line they will not cross
The mechanical expression of personality is not a stat card — it is *a conviction the player
cannot talk them out of* (`npcs-with-agency-80-days`). At least one goal, refusal, or value per
key NPC that holds regardless of the player's relationship state. This is what makes an NPC feel
like they exist beyond the player's gaze rather than waiting as a rock for activation. Some
threads simply *aren't the player's to resolve* — leaving one inaccessible is what makes the world
feel inhabited. (Reconcile with the informational-feedback law: a closed door must teach *why*
it's closed, or it reads as arbitrary friction — see §10.)

### 5A.5 Character is want-plus-action, not surface traits
An NPC is defined by what they *want* and what they *do* to get it, never by job, class, or
appearance (`creating-strong-characters`). Ground every essence descriptor in *repeated action* —
the behavior cluster of §5 — not in an adjective. Competing wants between NPCs are the raw
material of conflict and quest logic; two NPCs who want incompatible things generate a scene with
no villain in it.

### 5A.6 Micro-personality + one specific possession makes repeat-heavy lines cohere
For a game the player replays across years and runs, dialogue *will* repeat. A tight micro-profile
— 3–4 traits plus one concrete specific detail (a family tie, a carried object, a small habit) —
keeps an NPC coherent even under heavy repetition, and keeps generated lines from drifting generic
(`npcs-increase-player-empathy`; `dialogue-of-hades`: rotate contextual barks until depleted, then
reload — players don't notice loops over hours). A possession says more than exposition; treat the
objects an NPC keeps as characterization, not set-dressing.

### 5A.7 World-truth from biased opinion, not one authority
Let different NPCs hold *contradictory, personally-inflected* views of the same event or place
(`npcs-with-agency-80-days`). The world reads as alive precisely because no single NPC is the
canonical source; the player synthesizes truth from partial, biased accounts. This is also the
anti-homogenization insurance at the *world* level: if every NPC agrees, they blur; if each is
wrong in their own direction, they individuate for free. No single NPC should bear the weight of
representing a whole group — density distributes it.

### 5A.8 Preserve the sentiment, not just the words (agent-actionable)
When a line is written or generated, carry its *intent/subtext* alongside it — a "sentiment
column" that states what the line *means*, not just what it says (`dialogue-of-hades`). For the
runtime agent, this is the field that lets a generated line hit the wrong-register move (§2.2)
correctly instead of stating the feeling flat. For a human writer, it is the note that keeps the
reader's inner ear reading the subtext the omission encodes. **Each NPC's essence signature
(§5A.3) is the default sentiment lens through which their lines are generated** — the same event
produces different subtext per NPC, which is variance made mechanical and is the concrete hook the
Build GDD §5 content-agent I/O should carry [`gdd-structure-model` §4].

> Same register, different souls (deflection-target axis, §5A.2):
> — A (logistics): "The stall's yours next year. I already told the clerk."   ← grief as paperwork
> — B (a joke): "Save me the corner table. I'll haunt it otherwise."   ← grief as a bit
> — C (silence): "…" *(re-stacks the crates that were already stacked)*   ← grief as a chore

> Authored exception (mandatory, ~5–10% of the roster): one NPC whose line breaks all the patterns
> above precisely because everything around it is predictable
> (`modular-characters-system-driven`). Budget these in from the start; they are the most memorable
> characters in any generated cast — and, per §5A.1, the exception is in the *content*, not a break
> of the register itself.

---

## 6. Pacing — density-but-airy, and the guidance dial

From the pilot; `frieren-isnt-boring-its-deliberate`; `in-pursuit-of-a-perfect-montage`;
`couple-seconds-to-end-a-fight`; `why-some-hate-the-new-1-anime`.

- **Density-but-airy.** Pack scenes with character/world/theme *and* let moments breathe. Too
  tight and information overwhelms; too sparse and sentiment rings hollow (`perfect-montage`).
  Ask of every quiet beat: *"Have we earned this pause?"* — space must be intentional, never
  directionless (`frieren-isnt-boring`).
- **Contrast between pacing states, not absolute speed.** A brief, decisive moment lands hard
  *because* it follows quiet; the decision carries the weight, not the duration
  (`couple-seconds-to-end-a-fight`). Rare, swift beats feel real precisely because the
  surrounding world is mundane.
- **[+refresh] Pace emotional complexity like mechanical complexity.** Introduce a new emotion or
  a new thematic context at the same rate as new mechanics — too fast frustrates and ejects, too
  slow bores and ejects (`generating-emotions-in-narrative`). The player's emotional learning
  curve is a difficulty curve; tune it like one.
- **The guidance-vs-confusion dial is explicit — turn it deliberately.** This is the single most-
  flagged tension in the corpus. Our **retrospective-significance** engine and **trust-the-player**
  pillar both push toward withholding; the **informational-feedback law** and **world-as-quest-giver**
  pillars pull toward legibility. The resolution the KB converges on: **subtext must be *readable*,
  not hidden.** The signposting lives in the *pattern* of small moments and in clear *diegetic*
  direction — the player always knows why they're exploring — even while the *meaning* is withheld
  (pilot; `hide-romance`; `why-some-hate`). Withhold significance; never withhold orientation.
- **A wrong action still teaches.** Because a wrong Use/Make/Show/Ask must teach *why* (locked
  **informational-feedback law**, validated by the P&C pilot), even our quietest failure lines
  carry information in the flat register — the teaching is in the content, not in a raised voice.
  A failure line is short, plain, and points softly toward the real answer; it never scolds and
  never dead-ends.
- **Manage expectation.** Deliberately-paced work filters its audience; a frustrated player in a
  slow game is not cozy, they're trapped (`why-some-hate`). Early moments must *earn* the player's
  patience — deliver clear small payoffs early so the player extends trust for the larger ones.

---

## 7. Naming conventions

From the pilot and `when-an-author-wont-name-things`.

- **Romantic-realistic two-word balance** for items, spells, and places — one word grounded, one
  word lit ("blue moon weed" is the reference: botanical + lunar). Apply across our four
  interaction families' nouns: a *Collect* item, a *Make* recipe, a *Show/Ask* token, a *Use*
  tool should each read as half-plain, half-evocative.
- **The name is never deep; the *use* of the name is.** A transparent name earns weight only if the
  story returns to it symbolically — framing, callback, environmental echo. If the name won't do
  repeated story work, leave it arbitrary; a clever name that never pays off is trivia the player
  resents (`when-an-author-wont-name`).
- **Name + design + story-use form a reinforcing triad.** The name is the final note of a chord the
  design and behavior already sound — not the whole chord, and never a substitute for behavior.
  **[+refresh]** In our art system the "design" note is a *color / silhouette* decision (§7A) — so
  the triad reads name + palette-and-shape + story-use.
- **Legible either way.** A player who catches the etymology gets a bonus; a player who doesn't
  still reads the meaning through design and use. Never gate meaning on wordplay alone.

---

## 7A. Visual lens — how the voice looks **[NEW — added this refresh]**

*Why this section exists.* The style guide was voice-only; the art batch (29 notes) makes H17 deep
enough that the same understatement-in-service-of-retrospective-significance thesis now has a
*visual* expression the scene-comp agent and art director can execute [`_index.md` §3.11]. This is
the visual counterpart to §2 — the same register, rendered. It is deliberately thin on production
method (that lives in the going-big brief and gdd §7); it states the *rules the pictures obey* so
the look matches the words. Sourced from `frieren-color-design-eyes`, `secret-colors-of-studio-ghibli`,
`frieren-backgrounds-analysis`, `ghibli-animation-secrets`, `studio-ghibli-process`,
`miyazaki-characters-come-alive`, `art-direction-of-no-mans-sky`.

### 7A.1 Desaturation is the discipline (the visual equivalent of the flat register)
Restraint in color is exactly what flatness is in dialogue: it keeps everything quiet so one thing
can detonate. Push key colors toward low saturation; the design reads subtle in motion and striking
only in the close-up moment you intend (`frieren-color-design-eyes`). **Save saturation for story
beats, not decoration** — a saturated color is a raised voice, and §2/§4 forbid raised voices except
at a sanctioned payoff. Value micro-shifts add roundness and depth *without* adding saturation; use
them for form, save saturation for meaning.

### 7A.2 Hue count signals story weight (the visual "economy signals register")
More hues → more plot weight (`frieren-color-design-eyes`). Give the player-facing protagonist the
most complex palette; a puzzle-central NPC may earn a richer palette than a background figure, but
**never more than the player character.** Two characters in one scene must read their hierarchy at a
glance — protagonist = multi-hue gradient, secondary = single-dominant-hue. This is §2.7 (economy
signals register) rendered in color: the *amount* of visual complexity tells the player what kind of
character they're looking at.

### 7A.3 Warm = near/safe, complement = friction, analogous = bond
A two-rule palette grammar for relationships and orientation (`secret-colors-of-studio-ghibli`): warm
hues read protagonist / ally / near; a complementary hue on another character reads friction;
analogous (neighboring) hues read closeness — all before a line is spoken. Saturation also encodes
life-quality (high = wonder/safety, low = loss/wrongness), set consistently so it can be *subverted*
at a payoff. **Test every character/key-object color against the scene's dominant palette for
complementary clash before locking it** — a saturated green eye in a red-warm scene is the "Christmas
effect" and breaks the register (`frieren-color-design-eyes`). This is diegetic signposting that
honors §6: it orients without narrating.

### 7A.4 Backgrounds do the temporal and emotional work (retrospective significance, visually)
The background is where the world's history and time-passage live without a caption
(`frieren-backgrounds-analysis`): give each location one *signature* (distinctive architecture or a
landmark) so "we moved / we returned" reads instantly; render the same place in a *past vs. present*
state (ruin, overgrowth, weathering) so its history is legible in its physical condition alone; and
plant one recurring landmark that carries the place's backstory across screens and years — the visual
analogue of §4's seed-and-payoff. For our replayed festival week across years, seasonal /
background-state shift is the cheapest, clearest way to render "time moved" — no intertitle.

### 7A.5 Ma — the held still is the cozy pillar (the visual "have we earned this pause?")
Budget at least one *ma* beat per scene: a composition that works as a held still, empty of action,
designed to be rested in (`frieren-backgrounds-analysis`, `ghibli-animation-secrets`,
`studio-ghibli-process`). Stillness is not dead time — it is the emotional landing zone, the visual
form of §2.6's silence and §6's earned pause. The cozy-rhythm pillar lives or dies here; backgrounds
that demand constant attention kill cozy. In a static-scene P&C this is a *compositional* move
(framing and object arrangement carry the pause), not frame-by-frame animation.

### 7A.6 Ground awe in ambient micro-behavior, not spectacle
The "alive" feel comes from ambient proof-of-life — dust in a shaft of light, cloth drape, water
surface, a character adjusting their grip on an object — not from scale (`ghibli-animation-secrets`,
`miyazaki-characters-come-alive`). One or two carefully chosen micro-behaviors per scene signal the
world runs on real rules and earn the player's belief. Treat the mundane with the same care as the
spectacular — the equality of attention is what makes the fantasy credible. This is the visual
guarantee behind §4's "weight is preloaded": awe is grounded in the ordinary so a sanctioned swell
(§4; `GATE-2-review.md` D1a) has something real to lift.

### 7A.7 Legibility by depth-of-detail (the visual failure-teaches law)
Foreground fully rendered, midground simplified, background impressionistic
(`frieren-backgrounds-analysis`). The player reads *what is interactable* from the detail level, not
from UI markers alone — a diegetic signposting channel that keeps orientation clear (§6) without a
HUD. Catchlights on the lower iris, rounded facial softness, and a strong locked silhouette give
characters warmth and readability at low resolution (`miyazaki-characters-come-alive`) — the three
lowest-cost "alive" signals to hold the line on.

### 7A.8 Cohesion is held by a system + one eye, not per-asset polish
Under AI-assisted generation, coherence comes from *rules*, not from hand-finishing every asset:
define a small number of hard-constrained palette bands and a locked silhouette vocabulary per
location, and build one high-quality key-art board as the ceiling every generated variant must read
as a variant *of* (`art-direction-of-no-mans-sky`). Then hold one review pass per scene as the
coherence gate — the single-approver principle, implemented as a sign-off, not as redrawing
(`studio-ghibli-process`). Two scenes in the same location should feel *related but not identical* —
a much tighter constraint envelope than any procedural game, by design.

> **Watch-out (scope):** every rule here is a *compositional / rule-design* borrow, never a
> production-method one. Full Ghibli/Frieren rendering (hand-drawn frame counts, per-character
> designed iris palettes) is a category error for a ~6-week AI-assisted slice
> (`ghibli-animation-secrets`, `frieren-color-design-eyes`, `art-direction-of-no-mans-sky`). Apply
> the *logic* to the two or three characters and the handful of scenes in the playable slice only;
> never design a full palette for a character who appears once.

---

## 8. Off-frame life / world implication

From the pilot; `side-characters-to-worldbuild`; `normal-person-in-an-anime`;
`great-character-least-expect`; `e04`, `e07`; **[+refresh]** `npcs-with-agency-80-days`, `e11`.

- **Imply stuff going on beyond the frame.** The world must not vanish the moment the player looks
  away. NPCs have ongoing lives, correspondences, duties, regrets the player never needs to act on
  (pilot; `e04`: "Because we wrote to each other" implies an entire unseen history in one line).
- **[+refresh] Some stories are not the player's to resolve.** Leave at least one NPC thread
  inaccessible — a decision that belongs to the NPC alone (`npcs-with-agency-80-days`). An NPC who
  exits into an implied ongoing future ("See you in a few hundred years." — `e11`) reads as a slice
  of a longer life, not a self-contained cameo; the *farewell* often characterizes more than the
  introduction. This is off-frame life made structural: the world is larger than the player's reach,
  on purpose.
- **Encode world-facts inside single-character details.** Let one NPC's backstory, profession, or
  offhand mention of where they're from leak geography, institutions, and history — the player
  *infers* scale rather than reading a bestiary (`side-characters-to-worldbuild`). Pair two minor
  NPCs and let their dynamic teach more than a map would.
- **Off-frame density makes brief appearances resonate and departures land.** A "normal" NPC with
  ordinary regrets can be the emotional anchor of a fantastical cast; when they leave, make the
  choice legible through hesitation and clear agency, never a secret twist (`normal-person`).
- **Keep it responsive.** Off-frame life should be *discovered* by the pulling player, not pushed as
  exposition — it implies the world, it does not lecture about it (`great-character-least-expect`).
  This directly serves our **world-as-quest-giver (pull, not push)** pillar.

---

## 9. DO / DON'T quick-reference (per-scene checklist)

A runtime agent or writer should be able to pass every line of a scene through this.

**DO**
- Keep lines short — one thought per line; land the weight on the trailing beat.
- Speak the wrong register for the feeling (grief as logistics, love as irritation/effort).
- Let deflection and correction do the emotional work; leave the confession incomplete.
- Use omission and tonal-break as subtext; signal priority through what a character is precise vs. vague about. **[+refresh]**
- Show the effect before defining the rule; carry story through space/affordance; hide exposition inside a scene with another job. **[+refresh: space/affordance]**
- Seed significance low, beside plot-inert noise; let the environment plant it first; reveal it later, ideally via another's attachment. **[+refresh: environment-first]**
- Give each emotional beat a context box (intro / show-tell-do / state-change); prefer representation over direct feeling. **[+refresh]**
- Characterize by repeated small behavior + third-party observation; keep flaws specific and unpunished.
- Vary NPCs by deflection-target, precision-profile, warmth-channel, and an uncrossable line — inside the shared register, never by breaking it. **[+§5A]**
- Give each NPC one salient essence signal (want + behavior cluster + thematic contrast); carry a sentiment/intent note per line. **[+§5A]**
- Keep saturation low by default; spend hue-count on story weight; use warm/complement/analogous to orient; budget one *ma* beat per scene; ground awe in micro-behavior. **[+§7A]**
- Switch to economy (short/flat/non-escalating) when the register turns quiet; loosen for comedy.
- Hold one register per scene; change only at the cut.
- Keep the player oriented (why am I here?) even while withholding meaning.
- Make even a wrong-action line teach — softly, in flat register, pointing toward the real answer.
- Name items/spells/places romantic-realistic, two words, and only "deep" if the story reuses them.
- Imply off-frame life; leave one thread the player can't reach; let departures characterize.

**DON'T**
- Don't let an emotional line double down on itself or announce its own importance.
- Don't name the feeling the subtext already carries; don't have the narrator supply what a character withholds.
- Don't lecture: no info-dump monologue, no definition before proof, no one-way exposition.
- Don't flag a seed as important, and don't recap the connection at payoff — trust the player to remember.
- Don't "close" a soft motif with an explanatory line; leave it interpretable.
- Don't amplify a quiet climax's *words*; a single plain word beats a swell (any swell is visual/scale, not verbal). **[+refresh]**
- Don't homogenize the cast: never correlate trait axes by default, and never make an NPC "distinct" by breaking the shared register. **[+§5A]**
- Don't over-saturate: no character eye or key color reads too hot against its scene palette; no complementary clash locked untested. **[+§7A]**
- Don't fill *ma* with clutter or make backgrounds demand constant attention — that kills cozy. **[+§7A]**
- Don't punish a charming flaw in-world, or resolve a character's duality into one "true self."
- Don't write an antagonist who boasts, sneers, or chooses harm for its own sake; use the observation register.
- Don't mistake cryptic for deep — if the subtext isn't readable through the pattern, it's just noise.
- Don't withhold orientation; withhold meaning only.
- Don't reproduce or lightly reskin source dialogue or imagery; write original lines and design in this register.

---

## 10. Watch-outs — where a rule courts a locked-pillar failure

Named honestly; each carries the reconciliation the KB already reached.

- **Understatement vs. trust-the-player.** Flat, withholding voice is one keystroke from
  *illegible*. The corpus is unanimous that the danger is real (`hide-romance`,
  `realistic-character-growth`, `entire-story-in-9-minutes`, `why-some-hate`; **[+refresh]**
  `writing-nothing-unsaid-words`, `generating-emotions-in-narrative` both self-flag the same trap —
  omission and interpretation only work if you *clue generously* so the player feels *smarter*, not
  gaslit). **Rule:** subtext must be readable through the *pattern* of small moments and through clear
  diegetic orientation. Withhold significance, never orientation. Turn the guidance dial deliberately
  (§6) rather than defaulting to "more ambiguity = more depth."

- **Retrospective significance vs. informational-feedback law.** If every ordinary detail *might* be
  load-bearing, players over-hunt and every scene reads as a puzzle (`strongest-episode`,
  `when-the-a-plot-doesnt-matter`). **Rule:** tie the reward for "noticing" to the discovery mechanic,
  not to re-reading; ensure every seeded detail still functions as honest world-texture even if its
  echo is never caught; and keep failure feedback teaching in-register so the player is never punished
  for missing a seed. **[+refresh]** Let *any* interactable advance the knowledge state (the state-tree
  model, `coherent-storytelling-open-world`) so no single seed is a hard gate the player can miss and
  stall on.

- **NPC variance vs. homogenized register (Roc's A1 worry).** **[NEW]** The flat register is the
  world's dialect; if it also flattens *personality*, the cast blurs — exactly Roc's fear
  [`GATE-2-review.md` A1]. **Rule:** the register is shared, the *content* is not. Enforce orthogonal,
  uncorrelated trait axes (`modular-characters-system-driven`), one uncrossable line per key NPC
  (`npcs-with-agency-80-days`), one salient essence signal each, and biased/contradictory
  world-opinions across the cast — and budget ~5–10% authored rule-breaking exceptions. Sameness is a
  dialing failure, not a property of the voice. **§5A is a floor for emergence, not a spec that
  homogenizes — Roc fills the axes during Phase-3 writing.**

- **Visual restraint vs. "going big" (D1).** **[NEW]** §7A's desaturation discipline and §4's
  "amplification destroys it" both push quiet, but D1 permits a real swell at narrative/reward payoffs
  plus sprinkled wonder-beats [`GATE-2-review.md` D1a]. **Rule:** the swell is a *visual / scale /
  composition* move (saturation released, frame opened, a landmark revealed) — the *words* stay
  preloaded and plain (§4). Saturation is pre-trained low precisely so its release *reads* as the
  payoff. The going-big brief owns which pole leads; this guide only guarantees the swell never becomes
  a verbal one. (Pole choice is left open to experiment per `GATE-2-review.md` D1b.)

- **Antagonist-as-ecology vs. non-violent core.** "Survival-driven, not evil" collapses into a
  rhetorical shield for violence if the only resolution is a kill (`when-they-dont-make-demons-evil`).
  **Rule:** resolution is a knowledge/observation gate (see the game's metroidbrainia core), never a
  kill; if loss occurs, frame it as tragic necessity, not moral victory. The observation-register
  villain (§5) stays coherent only under a non-lethal resolution path.

- **Quiet/low-conflict pacing vs. world-as-quest-giver (pull, not push).** Deprioritizing plot can
  slide from "open-ended" into "directionless" (`when-the-a-plot-doesnt-matter`, `frieren-isnt-boring`).
  **Rule:** the world must *pull* — clear soft goals, several at once so a stuck player pivots (P&C pilot)
  — while never forcing progress. Intentional space is not the same as vague space.

- **Seed-early-payoff-late vs. single-run legibility.** The temporal-inversion technique
  (`when-a-scene-is-more-tragic`) only pays off on reexperience. **Rule:** our roguelike's replayed
  festival week is the built-in reexperience, but design so the *first* pass is already meaningful; the
  later pass deepens it. Never rely on a replay the player might not take.

- **Charming-flaw / duality whiplash.** A flaw or a two-sided character reads as dishonest if the sides
  don't feel like one person, or if the flaw is broad rather than specific
  (`paradox-of-charming-character-flaws`, `main-character-as-boogeyman`). **Rule:** keep flaws precise
  and consistent; never resolve a duality into a "true nature" — the contrast *is* the character.

- **Departures / absence vs. player expectation.** A beloved NPC leaving can read as designer punishment
  rather than character choice (`if-you-love-a-character-let-them-go`, `normal-person-in-an-anime`;
  **[+refresh]** the "NPC refuses the protagonist" pattern, `npcs-with-agency-80-days`, tips from
  thoughtful to frustrating if repeated in a cozy game). **Rule:** anchor any departure or refusal in
  explicit diegetic motivation and legible agency (the path literally diverges; visible hesitation; the
  block *teaches why*) so it never reads as railroading.

---

## 11. Thin spots / KB gaps (honest)

- **Interactive sequencing is better-covered than before, still not closed.** Every voice source is
  *linear* media, but the refresh added order-independence craft — encounter-over-quest scenes that
  resolve defensively against any arrival state, and a shared knowledge state-tree so any interactable
  seeds the next clue (`coherent-storytelling-open-world`). That gives our seed/proof rules a real
  order-independent model. **Still open for Phase 3 (pnc-grammar / narrative pipeline):** verify the
  high-watermark state model against any *mutually exclusive* plot branches (it assumes additive
  causality), and wire each partner-echo so it lands whichever year/room the player hits first.
- **The `generating-emotions-in-narrative` context-box and `writing-nothing-unsaid-words` techniques
  are from linear / authored media** — they give craft (representation over simulation; omission raises
  density), not an interactive, player-ordered pipeline. §4's context-box rule is my synthesis into an
  order-independent form; validate against real generated beats in Phase 3.
- **Runtime-agent voice enforcement is inferred, not sourced.** `writing-books-with-ai` gives the
  outline→draft→human-gate *workflow*; `dialogue-of-hades` adds the sentiment-column and bark-rotation
  patterns (§5A.8, §5A.6) — the first real *agent-actionable* craft for a live line generator, but from
  a fully-authored VO pipeline, not an LLM one. The §9 checklist + §5A.8 sentiment lens want validation
  against real generated lines in Phase 3 (H10 pipeline design).
- **NPC variance (§5A) is a method, not a filled roster.** The axes, the essence-signature card, and the
  Kraft template are the *floor* that answers Roc's A1 worry; the actual trait values, wants, and
  uncrossable lines are Roc's to supply during Phase-3 writing (H1/H2). Do not read §5A as a spec that
  produces characters — it is the frame that keeps the characters Roc writes from blurring. **Thin-source
  flag:** `e11` (Kraft) is a single, un-diarized primary source for the brief-mirror-NPC template; the
  *craft* is corroborated by `character-shows-up-for-10-minutes` and `great-character-least-expect`, but
  the exemplar rests on one episode.
- **The visual lens (§7A) is rule-design, not an art bible.** The color / ma / detail-gradient rules
  transfer cleanly, but **thin-source flag on the *process* claims specifically**: `studio-ghibli-process`
  and `miyazaki-characters-come-alive` self-report as admiration-level essays (principles named, not
  operationalized). The load-bearing, craft-solid color/background rules come from `frieren-color-design-eyes`,
  `secret-colors-of-studio-ghibli`, `frieren-backgrounds-analysis`, and the system-cohesion model from
  `art-direction-of-no-mans-sky`. **Out of scope here:** the 2D-vs-3D call and which going-big pole leads
  — those live in the going-big brief and gdd §7 [`GATE-2-review.md` D1, H17].
- **Naming has the thinnest source base** — two notes (pilot + `when-an-author-wont-name`). The two-word
  romantic-realistic rule is solid but under-exemplified; expect to build the actual item/spell/place lexicon
  in Phase 3 (H3/H5/H6), not here.
- **No per-character line attribution exists in the primary sources, by design.** The frieren-primary notes
  are un-diarized (Rule #5), so this guide extracts *voice / cadence / structure* only. §5A now prescribes
  *how* distinct NPC voices differ (variation within the register, via orthogonal axes) — but the concrete
  differentiation is a Phase-3 roster task (H1/H2), built as variation *within* this register, never a
  departure from it.
