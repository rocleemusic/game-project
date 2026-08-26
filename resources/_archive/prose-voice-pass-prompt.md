# Prose-Voice Pass — run in a fresh session

Paste this whole file into a new session. It applies the game-project prose voice rules to the Build GDD using subagents, with a review gate and one retry. This is a voice, register, and punctuation cleanup. It is not a content or design change.

## Files
- **Target (the only file you edit):** `ProjectOS/game-project/resources/build-gdd_draft.md`
- **Rules (authoritative):** `ProjectOS/game-project/prose-voice-rules.md`
- **Out of scope:** `phase-3-decisions_draft.md` (internal source of truth, not presented) and `knowledge-base/synthesis/voice-style-guide.md` (the in-fiction NPC voice, a different axis). Do not touch either.

## Hard constraints (do not violate)
1. Do not change meaning, design decisions, numbers, or section order.
2. Do not rewrite Roc's authored §1 elevator pitch beyond removing em-dashes if any appear. His wording is intentional.
3. Do not merge, move, or re-order sections, and do not change the presentable / `> **Dev-crew note.**` split. Every `> **Dev-crew note.**` stays exactly where it is.
4. Leave code blocks, GameplayTag examples (`NPC.Chef.ShowAsk.React`), the interaction-matrix arrows (`× → →`), table data, section numbers, and file paths untouched.
5. Prose only: fix em-dashes, formatting theatrics, AI-tell words, and label-instead-of-show phrasing per the rules. Nothing else.

## Models
- **Rewrite subagent:** Sonnet. Prefer Sonnet 5 if the environment offers it, otherwise Sonnet 4.6 (use the `sonnet` model override, which resolves to the available Sonnet).
- **Review subagent:** Fable. If Fable is unavailable, use Opus 4.8 (`opus`).

## Pipeline

**Step 1 — Rewrite (Sonnet subagent).**
Give it `prose-voice-rules.md` and `build-gdd_draft.md`. Instruct it to apply the rules across the whole doc in this priority order: (a) em-dashes to comma, colon, or a new sentence; (b) remove AI-tell blocklist words; (c) show-don't-tell and state-the-fact in the presentable layer; (d) no formatting theatrics. It returns the full revised document plus a short list of the kinds of changes it made.

**Step 2 — Review (Fable subagent, fallback Opus 4.8).**
Give it `prose-voice-rules.md` and the revised doc. It returns **PASS** or **FAIL**. PASS requires all of: zero em-dashes in prose, no blocklist words, no label-instead-of-show in the presentable layer, and structural integrity confirmed (all 12 sections present, the presentable / dev-crew split intact, meaning and numbers unchanged). If FAIL, it lists the specific violations with line context.

**Step 3 — Branch.**
- **PASS:** write the revised doc to `build-gdd_draft.md` (git history preserves the prior version). Hand back to the main session and Roc to look over, with the change summary.
- **FAIL:** send the reviewer's violations to a Sonnet subagent for **one** more rewrite pass, same constraints. Then run **one** final Review (Fable, fallback Opus 4.8). Write the result to `build-gdd_draft.md` and report the final verdict either way. Do not loop past this.

## Output
The revised `build-gdd_draft.md`, a short change summary, and the final review verdict. Flag anything the pass was unsure about, or any place where a voice fix risked changing meaning, for Roc to check.
