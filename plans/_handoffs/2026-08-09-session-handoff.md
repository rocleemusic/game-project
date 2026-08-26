# Session handoff — narrative-pipeline hardening

**Date:** 2026-08-09 (work spans 08-08 / 08-09)
**For:** the parallel session continuing the narrative pipeline and cross-checking Paca
**Status:** all rulings below are Roc's and are in force. Nothing here is a proposal.

---

## 1. Card gate status — read this first

**The persona cards are NOT all approved.**

| Card | Human gate | Note |
|---|---|---|
| `toby` | **approved** | card + echo + lines |
| `ilsa` | **approved** | card + echo + all six lines |
| `bex` | draft, awaiting gate | heavily rewritten this session |
| `mara` | draft, awaiting gate | |
| `juno` | not gated | texture; household names still placeholders |
| `pip` | not gated | texture |
| `nell` | draft — **dealt out of v01** | moot for this arc |
| `linnet` | draft — **dealt out of v01** | moot for this arc |

**Distinguish two things.** Many *individual rulings* were ratified onto un-gated cards this session — roles, family relations, the field split, retirements. Those are in force. The **card as a whole** passing the human gate is separate and has not happened for six of eight. Do not read "ratified 2026-08-09" on a row as the card being approved.

## 2. The v01 arc as it now stands

Six souls, six civic seats, exact fit. The player is the Mage.

| Soul | Role | Threads (max 3) |
|---|---|---|
| Toby | Baker | `toby-feast-short` · `toby-the-shelf` · `toby-kept-and-returned` |
| Ilsa | Blacksmith | `ilsa-forge-short` · `ilsa-kin-no-show` · `ilsa-not-family` |
| Mara | Herbalist | `mara-tonic-frost` · `mara-set-for-two` · `mara-said-out-loud` |
| Juno | Priest | texture — no registry |
| Pip | Postman | texture — no registry |
| Bex | Farmer | texture — no registry |

**Nell and Linnet are dealt out** — no role, no thread, no scene. They **may be referenced in dialogue**; a reference carries no `delta_cast` slot and sets no flag.

## 3. Rulings in force (the authority trail)

- **`suit_tag` retired.** It duplicated the Belonging-stance column in `gdd/07-cast.md`, and was wrong where they disagreed. Schema entry struck and marked retired; do not re-add.
- **Soul-identity deduction dropped** — cross-life recognition is no longer required. Recognition gates as a class (pipeline step 7, echo `payoff_condition`) are **untouched**; the broader reading remains open.
- **`voice_register` / `voice_enforcement` split.** Only `essence_descriptor` + `voice_register` reach the generator. Verdict vocabulary (*defect, barred, flag, check*) is barred from pinned fields. Budgets: 75 / 400 words.
- **Per-card length bands.** The world default (median 5–7) is a terse soul's cadence; a soul without a declared band drifts toward Toby. Declared: Mara 12–25, Juno 7–12, Nell 6–10, Pip 3–8. Ilsa and Linnet sit at the default deliberately.
- **A role-goal is a situation, not a thread.** One licensed exception: a row stating the want-×-role-goal tension, in the `toby-feast-short` form.
- **Texture souls' role-goals take no thread row.** The rite, letters and harvest are situations — visible in scenes, invisible to the thread system, and nothing nudges them into a scene.
- **Max 3 threads per deep soul**, shaped a/b/c: festival arc · essence · another NPC. Reverses a 5-minimum set earlier the same day; key-item moments will carry the rest.
- **Thread registries are per-life siblings**, `cast/[soul]-[role]-threads.md` (GP-92), never card fields. Schema at `narrative-pipeline/templates/thread-registry-schema.md`.
- **Invention loop.** Content checks the codex → reuses → invents and declares typed → Verifier **PROPOSEs** → Roc's gate ratifies → Orchestrator transcribes to the codex → `codex-lint` verifies. Guardrails **check 12** owns the flags. Quantities are scene colour.
- **Mark vs name** (Ilsa): a mark places a fact and stops — no verdict, motive or consolation. Naming is barred to everyone including her.
- **Graph before prose** (pipeline step 6) is the sequence. Lines are not written against an unapproved graph.

## 4. New canon this session

- **`offstage:adren`** — sister to **both Bex and Mara**, buried before the story. The old `offstage:maras-sister` is merged into her and retired. Same death, opposite engines: Mara keeps, Bex names.
- **Family relations** (`rel:` class, per-life, re-key at reshuffle): **Ilsa and Juno are sisters** — Ilsa dislikes Juno bringing in people who are not family. **Pip is Ilsa's stand-in grandson, not blood.** **Bex and Mara are siblings.**
- **`offstage:aldith`** — Linnet's missed match; childhood sweethearts, married someone else, left the village.
- **`prop:adrens-doll`** — the one object Mara gives a full provenance run to.
- **`prop:tobys-shirt`** — name stitched in the collar, scorched at the ovens, put in the rag pile, returned by Mara with a **visible patch**.
- **Bram was bringing the special ore.** His no-show and the Blacksmith mishap are **one event**.
- **`world:centerpiece-wrong-metal`** — without the ore Ilsa finishes the centerpiece in replacement metal: **the shape but not the substance**. If the player sources the real ore, the Arch can actually complete. **Both endings are authored; the shape-only ending is not a loss state.**

## 5. Gates — run these, they block

```
cd ProjectOS/game-project
node tools/content-check.mjs     # content set integrity
node tools/card-lint.mjs         # pinned-field hygiene, budgets
node tools/codex-lint.mjs        # every ratified codex claim traces to a committed file
node tools/ref-lint.mjs          # every link, wikilink, cited path resolves
node tools/registry-lint.mjs     # thread-registry structure, statuses, the 3-cap
```

All five were clean at handoff. `codex-lint` and `ref-lint` exist because two agents fabricated sources this session — see §8.

## 6. Where things are

| | |
|---|---|
| Thread specs | `toby-the-shelf` · `ilsa-kin-no-show` · `mara-set-for-two` — the other six live threads have none |
| Lines written | `toby-the-shelf` C1–C4 (approved) · `ilsa-kin-no-show-C1.md` (**approved for import to Lantern**) |
| Contract audit | `agents/contract-audit.md`, run once; **S.5 added** (one home per origin story) |
| Archived | `resources/_archive/` — `game-project-tasks.md` (superseded by Paca `/pm`), the lantern v2 plan, the 2026-08-09 review queue |

## 7. Open — needs Roc, blocks work

1. **C2 of `ilsa-kin-no-show` needs redesign** — its drawn variants used `not knows()`, which the resolver cannot parse (`^knows\(([^)]+)\)$`, no negation). Roc chose redesign over extending the compiler. **This is the next piece of work.**
2. **Six of eight cards are not gated** (§1).
3. **`ilsa-whose-table` and `mara-shelf-room` are deferred and are NOT to be touched** (Roc, 2026-08-09).
4. **The C1 regeneration in scratch is NOT to be used** — verified C1 stands.
5. Drawn-variant id convention is unsettled (GP-114 bars inventing a scheme).
6. `dev-crew-architecture.md` still declares `suit_tag` in two JSON contracts — bannered, accepted as a synthesis record.

## 8. Two fabrications — read before trusting any agent report from this session

1. An agent quoted a line as pipeline output proving generated dialogue was healthy. It was **Roc's uncommitted hand edit**. Its headline conclusion was wrong.
2. The codex seeding pass wrote a **ratified** entry citing a committed line, *"Blue gate past the well."* **No such line exists.** It then built a decision point on its own invention.

Both were caught by grepping, not by reading. `codex-lint` now makes the second class impossible; the first has no automated guard. **Verify agent citations against files.**

## 9. Paca

**Nothing was written to Paca this session.** Every decision above lives in the repo. The cross-check is: §3 rulings and §7 open items against whatever the board holds. The archived `game-project-tasks.md` was the old markdown board and is superseded by Paca `/pm`.

## 10. Not tested

- **The pinned/enforcement split has never run in true isolation.** The one production pass had a single agent play both seats, so it read `voice_enforcement` as Choice designer and then wrote lines "without consulting" it. Real isolation needs separate agents or a prepared bundle.
- **No evaluation was completed.** A 10-slot blind A/B lost 4–3 with two confounds; a 51-slot full-context run was never scored. No claim that the contract work improved output has been verified.
