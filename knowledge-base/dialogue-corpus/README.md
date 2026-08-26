# Dialogue corpus — measured, not remembered

**Built 2026-08-06.** Three works, 18 parts, **4,735 turns**, human-transcribed with named speakers and aligned Japanese/English.

This exists because the register's line-length rules were derived from un-diarized, caption-compressed subtitles, and the numbers in them turned out to be a subtitle box rather than a cadence. This corpus is the replacement: real turn boundaries, real speakers, and both languages side by side so the JP→English conversion is measured instead of assumed.

`corpus.jsonl` — one turn per line: `work`, `part`, `speaker`, `text` (JP and EN as the transcriber aligned them), `jp` (Japanese character count), `en` (English word count).

> **Third-party transcripts, held for analysis.** Transcribed and organised by Kiriban (`transcribedanimescripts.tumblr.com`), from Netflix/kitsunekko Japanese scripts and Gogoanime/animepahe English subtitles. **Not for redistribution.** Kept in full because re-analysis needs the text; if that is the wrong call for this repo, the alternative is to keep the measurements below and drop `corpus.jsonl`.

---

## What it measures

| | Frieren | Violet Evergarden | Ghibli |
|---|---|---|---|
| Parts | 2 eps | 14 eps | 2 films |
| Turns | 327 | 2,439 | 1,969 |
| Named speakers | 30 | 105 | 64 |
| **JP chars per EN word** | **1.94** | **2.00** | **2.11** |
| Median turn (EN words) | 7 | 6 | 5 |
| p75 · p90 · p95 | 15 · 25 · 33 | 13 · 23 · 33 | 8 · 14 · 19 |
| p99 · max | 53 · 91 | 63 · 174 | 34 · 77 |
| Turns > 26 words | 8.3% | 7.6% | 2.0% |
| Turns > 40 words | 3.7% · 6.0/part | 3.4% · 6.0/part | 0.5% · 5.0/part |
| Turns > 60 words | 0.9% | 1.1% | 0.2% |
| Turns > 75 words | 0.6% · 1.0/part | 0.6% · 1.1/part | 0.1% · 0.5/part |
| Scene notes / part | 15 | 16 | 34 |
| **Action notes / part** | 30 | 41 | **376** |
| **Action note : dialogue turn** | 1 : 5.5 | 1 : 4.3 | **1 : 2.6** |

## What converges, and is therefore trustworthy

- **1 English word ≈ 2.0 Japanese characters.** Three works, three transcribers, 1.94 / 2.00 / 2.11. The earlier 2.3 estimate was inferred from five glosses plus an industry norm and ran ~15% short.
- **Median turn is 5–7 English words**, and most turns sit under 15. Stable across all three.
- **Long turns exist and are not rare.** About **6 turns per part run over 40 words**, in all three works, including Ghibli. Roughly **1 per part exceeds 75 words**. The longest genuine turn in the corpus is **174 words** (Violet Evergarden).
- The un-diarized ASR estimate of "~1 turn per episode over 40 words" was **6× too low** — its segment caps and false merges meant it could not represent a long turn, so it did not find them.

## Where the three works disagree, and what that means

**Ghibli is measurably terser — and pays for it in pictures.**

Median 5 words against Violet Evergarden's 6 and Frieren's 7; only 2.0% of turns exceed 26 words against ~8% in both series; the longest turn in two feature films is 77 words, shorter than Violet Evergarden's single longest.

But the action-note density inverts: **one visual beat for every 2.6 lines of dialogue, against 1:4.3 and 1:5.5.** 376 action notes per film. Ghibli does not write shorter scenes — it writes the same scenes with more of the load on the picture.

**This is the finding that matters for us.** Short dialogue and dense visual description are one design position, not two. v01 took the terseness and none of the description: most of its non-player slots are `dialogue`, so it has Ghibli-length lines with nowhere for the silence to live. That is the worst of both, and it is a slot-typing problem rather than a prose problem.

---

## The action notes — `action-notes.jsonl`

**1,706 notes** mined from the same sources: 1,384 `[Action:]` and 322 `[Scene:]`. This is the half of the corpus that describes the picture rather than the speech, and it is the half the pipeline had no evidence for at all.

| | Frieren | Violet Evergarden | Ghibli |
|---|---|---|---|
| Action notes | 60 (30/part) | 572 (41/part) | **752 (376/part)** |
| Median length | 9 words | 10 | 11 |
| p90 · max | 17 · 47 | 21 · 79 | 24 · 77 |
| Note : dialogue turn | 1 : 5.5 | 1 : 4.3 | **1 : 2.6** |

**An action note is about the same length as a line of dialogue.** Median 9–11 words against a dialogue median of 5–7. It is not a stage direction squeezed into a margin; it is a beat with the same weight as a spoken one.

**Every one names an actor and a thing.** *"Frieren touches the chest." · "Hodgins places a box in Violet's hands." · "Kamaji holds out a roasted newt for Lin." · "Sophie turns the door handle."* Concrete, physical, camera-visible.

**None of them contain interiority.** The closest they come is *"Violet perks up at the mention of the word 'love'"* — an observable change, not a stated feeling. This is the same rule the register already applies to dialogue (no soul states its own trait; effect before definition), and it turns out to govern the description layer identically.

**The verb sets differ, and the difference is the medium:**

- **Ghibli is motion** — `runs` (47), `walks` (29), `turns`, `flies`. Bodies moving through space.
- **Violet Evergarden is hands** — `takes` (26), `holds`, `opens`, `puts`, `places`. Objects being handled.

**For this game, Violet Evergarden's verb set is the closer model.** A point-and-click screen has no camera to follow a runner, and its verb families are `Collect`, `Make`, `Use`, `Converse` — object handling, not locomotion. Ghibli's density is the target; Violet Evergarden's vocabulary is the fit.

### The funeral beat, verified

The register cited EP.1's funeral as "a single unbroken run," on the strength of a 78-character ASR segment. The human transcript settles it:

> **Frieren:** It's not like I knew anything about him. We only travelled together for a mere ten years.
> ***[Action: Frieren cries.]***
> **Frieren:** I knew human lives were short, but… why didn't I try to get to know him better?
> ***[Action: Heiter pats Frieren's head. Eisen pats her back.]***
> **Frieren:** Don't pat my head…

**Three turns of 19 / 15 / 4 words, divided by action notes.** Not a run — and the 24.5-second silence the ASR recorded between the first two turns is precisely *"Frieren cries."*

**The gap is the action note.** That is the whole finding, in one scene: the heaviest beat in the show is short fragments, and what fills the space between them is description. A pipeline that emits only `dialogue` slots cannot write this scene at all.

## What it cannot tell you

- **Per-character length bands.** Speaker counts are heavily skewed — Violet alone holds 660 of 2,439 turns — and a character's band is confounded with how much screen time and what kind of scenes they get. Worth a proper pass (GP-118), not answerable by reading this table.
- **Pause and overlap.** Transcripts carry no timing. The gap figures in `register.md` come from the diarized ASR (`P:\_game-project-refs\EP.*\diarization.rttm`), which remains the only source for those.
- **Whether Violet Evergarden or Ghibli is the right target at all.** Both are adjacent in tone, neither is the game. Frieren remains the stated reference; these are corroborating evidence, and they corroborate.

## Rebuilding it

Sources: `P:\_DOWNLOADS\Violet Evergarden - ヴァイオレット・エヴァーガーデン\*\*(JPN _ ENG).docx` (14), plus `C:\Users\rocle\Downloads\` for the two Frieren episodes and the two Ghibli films (`.md`).

Two parsing traps, both of which produced wrong numbers on the first attempt:
- In the `.docx` XML, `<w:t[^>]*>` also matches `<w:tcBorders>`. Match `<w:t(?:\s[^>]*)?>` instead, or the word counts include markup.
- Rows whose first cell is a `[Scene:` or `[Action:` note are not dialogue and must be counted separately, not as turns.

---
**Public copy note:** the raw corpus files (`corpus.jsonl`, `action-notes.jsonl`) are omitted here — they hold extracted third-party dialogue. The synthesis that draws on them lives in `knowledge-base/synthesis/voice-style-guide.md`.
