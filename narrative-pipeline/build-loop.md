# The Build-Time Authoring Loop (ink)

Ink is the production engine, not a prototype to throw away (see [`../gdd/12-technical-overview.md`](../gdd/12-technical-overview.md)). The tool facts below are grounded in the researched references in `../knowledge-base/narrative/`: `ink-syntax-reference.md` (the language), `ink-unreal-integration.md` (the plugins), and `ink-data-model.md` (how game entities map onto ink). This file states the loop and the pieces that must be built; it does not restate the ink language.

## The tools this loop runs on

- The Inky editor carries the ink compiler built in and plays the story the moment it is written; its `File ▸ Export for web` gives a free playable HTML build. That is the whole hot-reload loop, and it is enough (ink-syntax-reference.md).
- inklecate, the compiler Inky wraps, compiles `.ink` to `.ink.json`, and the compiled file is the one engine contract: Inky's web export runs it on inkjs in the browser POC, and inkcpp or Inkpot runs the same file in Unreal. The split: prototype on web now, ship **Inkpot** (ruled 2026-08-02; inkcpp rejected — its Fab listing stops at UE 5.7, the engine is 5.8; see `../gdd/12-technical-overview.md`). No second format; the JSON handoff is the seam (arrow-narrative-tool.md).
- The graph goes up greybox first: knots and guards carrying placeholder lines and full branch logic. Read counts of visited content compile each payoff_condition into a guard on the payoff knot, so the story queries its own play history instead of a hand-kept flag table (ink-narrative-scripting-language.md; ink-syntax-reference.md; narrative-games-yarn-spinner.md). Gathers reconnect loose choice ends automatically; tunnels hold repeated rituals authored once and reused across souls; tags carry each line's metadata (id, speaker, tone, echo, canon) to the engine untouched (ink-narrative-scripting-language.md; ink-syntax-reference.md).
- Compiling is itself a first verification pass: the compiler warns on loose ends and ran-out-of-content flow, which catches dead ends and unfinished branches before a playtest (ink-syntax-reference.md).
- Weave choices present as diegetic interactions, examine, go, ask, never a labeled menu of feelings; the tools' default button list is the one part not borrowed (arrow-narrative-tool.md; narrative-games-yarn-spinner.md).

## The loop itself (runs between playtest sessions, never mid-session; rewritten plain 2026-07-29)

*Naming note: "Intake" and "Scaffold" here are build-time moves, not the pipeline steps that share the names — `pipeline.md` step 2 (Intake) resolves a batch's inputs and step 6 (Graph) precedes prose; this loop's Intake takes the player background + backstories and its Scaffold lays greybox knots.*

1. **Intake.** Take in the player background and the soul backstory guidelines.
2. **Scaffold.** The Architect lays the next branching sequence as greybox knots.
3. **Play and edit.** Roc plays the slice and edits lines in place — in Lantern (`../tools/lantern/`), whose `edits.json` patches are the durable path (the same output gate as always). A raw inline edit in Inky is a scratch note; the next regeneration clobbers it (the file-split rule above — this step was reconciled with it 2026-07-29).
4. **Propose.** On request, the AI proposes the next beat set.
5. **Watch the beat budget throughout.** One manually decremented VAR tracks how many potential beats remain in the sequence under test, because ink counts what was visited, not what remains (ink-syntax-reference.md, globals). The counter is an authoring aid only. If it ever ships, it becomes a progress meter over emotional content — so it never ships.

## The file split (S4, 2026-07-29; rewritten plain at Roc's direction) — how scenes divide into .ink files

One project, one compile. `main.ink` INCLUDEs everything; inklecate compiles the lot to one `.ink.json`. The split exists so the files read well in review — the engine does not care. Conventions come from Heaven's Vault's working practice (knowledge-base: `heavens-vault-detective-story.md`; inkle's "rooms and objects" and "threading tunnels" dev posts, in the branching-dialogue resource set).

```
ink/
  main.ink            — INCLUDEs + the day-loop harness (day/time advance, screen dispatch;
                        unbuilt — piece 4 below)
  state.ink           — every LIST and VAR declaration, in one place, nothing else
  world/<screen>.ink  — one file per screen: screen = knot; interactables and time-states = stitches
  souls/<soul>.ink    — one file per soul: the soul's scenes = stitches in the soul's knot;
                        repeated rituals authored once as tunnels, reused across scenes
  system/             — shared helpers; contents defined by the resolver as needs arise (no fixed list yet)
```

- **The resolver writes every file here.** Structure comes from `graph.json`; prose is patched in from approved `content_lines`. No human and no agent hand-writes generated ink — the Architect's own role prompt bars it. To change a line, use the review tool's `edits.json` patch flow. A raw inline edit in Inky is a scratch note; the next regeneration clobbers it, on purpose.
- **The ink-address rule.** Every ink address derives from a minted ID: lowercase it, and replace every character that is not a letter or digit with `_`. So `T1` → `=== t1 ===`, and `CH-T2-04` → `ch_t2_04`. Gather labels take a `g_` prefix: `(g_ch_t2_04)`. A scene is a stitch in its soul's knot, so its full address is `<soul>.<scene>` — `toby.sc_t2_04`. Why two forms exist: ink identifiers cannot contain hyphens, and the minted IDs keep hyphens for readability. The derivation is deterministic, and `graph.json` carries both forms per node, so the review tool never re-derives an address.
- **A scene lives with its soul; a screen owns its solo interactions.** The screen's knot hands off into the soul's scene stitch. A screen file reads as the place. A soul file reads as the person. Roc can review either whole.
- **The tag contract gains three tags** (same lint): `#screen:<screen_id>` on screen entry. `#choice:<choice_id>` on the line just before the options — or on the first option line when the choice has no set-up line. `#opt:<option_id>` on each option. Lines keep their existing per-line `id` tag; that tag is how the review tool addresses one line for approval. `speaker_id: "player"` is a defined value for player_line slots, and the lint's speaker check accepts it. Tags survive compilation into the JSON and the runtime's output — they are how the tool maps a live playthrough onto the graph. The tag lint (piece 2 below) adds the three new tags to its presence checks.
- **`state.ink` is the single declaration site.** A LIST or VAR declared anywhere else is a defect. The resolver writes this file from the schemas: the predicate declarations (named per predicate in `templates/screen-spec-schema.md`), the generated-variable domains (`../knowledge-base/narrative/ink-data-model.md` D2), and the 4-member `TimeOfDay` including `night` (the schema's extension of the data model's original three). Hand edits get clobbered — change the schema instead.

## Four pieces do not exist yet and have to be built

Stated plainly so nobody goes looking for them as shipped ink features.

1. **The AI-in-the-editor beat generator** is a small custom harness wrapping the ink compiler and runtime. It is not a shipped ink feature.
2. **The tag lint** is a custom script over the compiled JSON's tags: it checks that every line carries its required metadata tags (id, speaker, tone, canon), presence only, reading no meaning. Register and essence-vs-role are semantic judgments and belong to the Verifier (`guardrails.md`), not to any script. It flags, never rewrites, same rule as the agents. Ink ships nothing like it.
3. **Cross-life persistence** is host code. Ink's own save serialization is fragile across authoring edits: read counts are saved only when used in logic, and choice addresses renumber when a knot changes. So the project rule is no cross-session state inside ink; the host serializes bond and knowledge state at run end and re-injects it next life (ink-syntax-reference.md). The boundary is a contract borrowed from the running prior art (neverendingquest-ai-dm-architecture.md, narration proposes and code disposes): the narrative layer emits line text and typed state-change actions only, and host code applies every bond delta, canon write, and reshuffle role; ink never sets cross-run state itself. Unlike that live system we apply these actions at authoring time behind the human gate, so there is no runtime validator between line and dispatch. If that save is lost or truncated, every echo condition silently never fires and the whole recognition layer dies without an error, so this seam gets a test before any content depends on it (write the save/load smoke test in week 1, per ink-unreal-integration.md).
4. **The day-loop harness** in `main.ink` — day/time advance, the move budget, screen dispatch — is authored structure the resolver scaffolds and the prototype proves (Phase 5 / game-36). Added to this list 2026-07-29 with the file split; nothing above generates it.
