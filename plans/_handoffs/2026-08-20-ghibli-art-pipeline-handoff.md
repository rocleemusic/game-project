# Handoff — Ghibli art pipeline, character work (2026-08-20)

One-session note. Full design record: `plans/2026-08-20-ghibli-art-pipeline-notes.md` — read that
first for the reasoning, model comparisons, and infrastructure gotchas. This is pickup context only.

**The computer is being restarted after this session** — ComfyUI and any in-progress job die with it.
Next session starts from a cold machine, not a warm one.

## Where this left off

**Backdrop batch (from the prior session, 2026-08-19) — done, in staging, not reviewed.**
24 images + a 6-image redo at stronger stylization, in `Desktop\comfyui-8-19-run\output_ghibli\`.
Each has `source` / `raw` / `upscaled_2x` (+ `colormatched` for the original 24). Nothing promoted
to `phaser/public/art/` yet — that's Roc's call after review.

**Character pipeline (this session) — landed on a working setup, verifying the final config now.**
Tested five models/checkpoints on Ilsa (see the design record's comparison table). Settled on
**nitrosocke `Ghibli-Diffusion`** (SD1.5 full checkpoint) over the SDXL LoRA options — warmer,
more painterly linework. Installed `ComfyUI-Impact-Pack` + `ComfyUI-Impact-Subpack` for the
`FaceDetailer` node, which automates the face-quality fix (small full-body faces render mangled
at these resolutions — see the design record's "Face detail" section for why). Saved as
`ghibli-character-v2.json`.

**Verified before this session ended:** `ghibli-character-v2.json` in its final form — dedicated
face-only prompt fed to `FaceDetailer` separately from the body prompt (nodes 30/31 in the JSON) —
ran clean, no crash, 10 minutes, clean symmetric face, seamless blend. `ghibli-character-v2_verify_00001_.png`
is the reference result. **The saved workflow is trustworthy as-is — no fixes needed before the
next session builds on it.**

## Next session — resume steps

1. **Relaunch ComfyUI.** `cd P:\AAA_Programs\ComfyUI-Zluda && .\comfyui.bat` — note the `.\` prefix,
   a bare `comfyui.bat` fails to resolve on this machine even from the right directory. Confirm
   `To see the GUI go to: http://127.0.0.1:8188` before submitting anything.
2. **`ghibli-character-v2.json` is already verified — no need to re-test it.** Load it in the GUI
   once to confirm it opens clean after the restart, then move straight to step 3.
3. **Build the cast batch script — not written yet.** `_tools/run_ghibli_batch.py` is the model to
   follow (resize-safety, resume-on-crash, chained post-processing), but it targets the landscape
   workflow. A character version needs to: pick each cast member's best reference photo, resize it
   for SD1.5 (512×768 worked well for Ilsa — matches her actual aspect ratio), run it through
   `ghibli-character-v2`'s graph via the HTTP API (base img2img + FaceDetailer in one job), and
   write a per-character prompt the way the landscape batch did per-screen. **The body prompt needs
   to change per character** — Ilsa's prompt (grey hair, apron, elderly) is specific to her; it is
   not a template that works unmodified for bex/juno/mara/pip/toby.
4. **Reference photos, one folder, mixed naming** (`Desktop\8-20-26\`): `bex-bust.jpg` /
   `bex-full.jpg` · `juno-bust.jpg` / `juno-full.jpg` / `juno-full-alt.jpg` / `juno-full-alt2.jpg` /
   `junto-bust-alt.jpg` (this one's typo'd — it's Juno) · `mara-bust.jpg` / `mara-full.jpg` /
   `mara-video.mp4` (a turnaround video, not a single frame — decide whether to pull a frame from
   it or skip) · `pip-full.jpg` (no bust shot) · `toby-bust.jpg` / `toby-full.jpg`. Pick one
   full-body shot per character as the primary pose reference, same pattern as Ilsa.
5. **Write each character's body prompt from their actual reference photo**, the same way Ilsa's
   was built — look at the photo, describe what's actually in it (hair, clothing, pose), don't
   guess from the persona card (the cast cards are voice/personality only, no physical description
   — confirmed while working on Ilsa).
6. **Run overnight.** At nitrosocke + FaceDetailer's pace (~24 min/character all-in, from the Ilsa
   tests), 5–6 characters is 2–2.5 hours — comfortably an overnight run, not a multi-day one.

## Open items, not resolved this session

- **Ilsa's shipped art doesn't match her new reference photos.** Shipped `phaser/public/art/cast/ilsa.jpg`
  is a young woman with a tool belt; the new references show an older woman in a blacksmith's
  apron — which matches her actual written persona (family matriarch, forge work with Pip) far
  better. Flagged for Roc, not decided here. Worth asking whether the other five cast members have
  the same shipped-vs-reference mismatch before generating final art for all of them.
- **KappaNeuro LoRA's license is tagged "other"** with no clear terms found — verify before any
  commercial use if the SDXL path (`ghibli-character-v1`) ends up used for anything that ships.
  nitrosocke's checkpoint (the v2 pick) is confirmed permissive (creativeml-openrail-m).
- **Backdrop batch (24+6 images) needs Roc's review pass** before anything gets promoted to
  `phaser/public/art/`. Nobody has looked at the full set yet, just spot-checks during generation.
