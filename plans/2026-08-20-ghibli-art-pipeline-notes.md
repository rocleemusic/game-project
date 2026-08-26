# Ghibli art pipeline — ComfyUI tooling, model evaluations, and known issues

> **Design record.** Status is tracked in Paca (project `game-project`, prefix `GP`) — run `/pm`.
> This document holds the design rationale and the rulings behind it, not the current state of the work.

## Context

Two overnight sessions (2026-08-19 → 2026-08-20) on `P:\AAA_Programs\ComfyUI-Zluda` (local, AMD RX 5700 8GB via ZLUDA): first a 24-image backdrop batch styled through the Ghibli lora + upscale + colormatch pipeline, then character work testing several Ghibli-style models against the cast reference photos in `Desktop\8-20-26\`. This is the reference record for both — what the tools do, which models are worth using, and the infrastructure quirks that cost real time to find.

## Tools built or fixed

All in `P:\AAA_Programs\ComfyUI-Zluda\_tools\`:

- **`run_ghibli_batch.py`** — overnight batch orchestrator. Resizes each source photo into a safe SDXL range (832–1216px, SDXL's own trained bucket sizes), runs it through the Ghibli lora workflow via the ComfyUI HTTP API, then chains `upscale.py` and `color_match.py`. Resumable — skips any image whose output folder is already complete, so a crash mid-run doesn't cost the finished work.
- **`redo_ghibli_batch.py`** — targeted redo of a named subset with adjustable denoise/lora strength, colormatch step optional. Used to redo 6 of the 24 images at a stronger stylization push.
- **`upscale.py`** — fixed in place. Was doing a single-shot full-image pass through 4x-UltraSharp that OOM'd on the CPU allocator past roughly 1M pixels ("not enough memory: tried to allocate 5637144576 bytes" on an 896×1536 input). Now tiles the image (384px tiles, 32px overlap, trimmed seams) so it scales to any input size. Verified — no visible seams.
- **`color_match.py`** — unchanged. Pulls a result's palette back toward its source photo; used selectively, not blindly, since the target is the game's locked palette, not necessarily the source photo's actual colors.
- **`anime_bg_gan.py`** — new. Standalone CartoonGAN (Miyazaki style, akiyamasho) implementation, CPU-only, single fast forward pass, no prompting. See verdict below.

## Model / LoRA evaluations

| Model | Type | Base | License | Verdict |
|---|---|---|---|---|
| `Ghibli_v6.safetensors`, `ghibli_last.safetensors` | LoRA | SD1.5 | — | Pre-existing. Used with Counterfeit-V3.0. |
| `Ghibli_MK2_style_illustV1.safetensors` | LoRA | SDXL | — | Pre-existing. Used with animagine-xl-4.0. Proven across the full 24-image backdrop batch — the reliable default for landscapes. |
| Lykon "Studio Ghibli Style" (Civitai, via comfy.icu) | LoRA | SD1.5 | Civitai standard | Real, well-known model. Weight ~1.0 (offset ver.) or 0.65 (old ver.), trigger `ghibli style`. On a character test it read softer and less specific than KappaNeuro — usable, not the pick. |
| KappaNeuro `studio-ghibli-style` (HF) | LoRA | SDXL | Tagged "other," exact terms not confirmed — verify before any commercial use | **Best character result of the session.** Trigger `Studio Ghibli Style`. Clean linework, strong likeness elements (see `ghibli-character-v1.json` below). |
| imagepipeline `Studio-Ghibli-Style` (HF) | LoRA | — | Tagged creativeml-openrail-m | **Skip.** Verbatim, unattributed re-upload of the Lykon model above — same description text word for word, random filename, no credit. |
| nitrosocke `Ghibli-Diffusion` (HF) | Full checkpoint, 2.1GB `.ckpt` | SD1.5 | creativeml-openrail-m (permissive) | Trigger `ghibli style`. Warmer, more painterly linework than any LoRA option — reads closer to actual Ghibli watercolor shading. Faces need a refine pass at full-body framing (see Known Issues). Real contender if the extra checkpoint-swap overhead is acceptable. |
| AnimeBackgroundGAN-Miyazaki (akiyamasho, HF) | CartoonGAN, 44MB | — | MIT | Fast (CPU, single pass), no prompting. **Not a fit for this project as-is** — output is too saturated for the locked palette (bright teal/red vs. the required desaturated warm-brown/gold/sage), and it can't remove people from a scene (no content control, unlike prompted diffusion). Keep as a fast reference tool, not a pipeline stage. |
| alvarobartt Ghibli-character LoRAs (SD3.5-large, FLUX.1-dev) | LoRA | SD3.5 / Flux | Non-commercial only | **Not pursued.** Despite the repo name, both are style LoRAs (same category as the others), not character-specific. Both need base checkpoints not installed (16–23GB) and are a full weight class heavier than anything else here — very unlikely to run well on this 8GB ZLUDA setup. |

## Infrastructure gotchas (cost real time to find)

- **`comfy_kitchen` version drift.** The launcher auto-updates ComfyUI's code on every launch but not its own pip dependencies. After an update, a stale `comfy_kitchen` (0.2.22) broke import against newer code expecting 0.2.31+. Fix: `pip install --upgrade comfy-kitchen` in the venv.
- **`comfyui.bat` needs an explicit `.\` prefix** when launched via a scripted `cmd /c` (as opposed to double-clicking) — bare `comfyui.bat` fails to resolve on this machine even from the correct working directory.
- **SDXL img2img has a real resolution floor and ceiling.** Below roughly 700–800px on the short edge, SDXL produces genuinely garbled noise-like output (not just soft/blurry — a hard failure mode). The batch script resizes every source into 832–1216px (SDXL's own trained bucket sizes) before generation. Several of the reference photos were well under this floor before the fix.
- **`upscale.py`'s OOM ceiling** (see above) compounds with the above — a raw generation near the top of the safe range (896×1536) was already enough to blow the CPU allocator on the un-tiled upscale pass.
- **ControlNet + pose detection (OpenposePreprocessor) crashes the ComfyUI process outright** — `Windows fatal exception: access violation`, inside PyTorch's model-loading code, not a normal Python exception. Reproduced 5 of 6 attempts across the character-test session, independent of which LoRA (or none) was loaded alongside it. This is below the ComfyUI/Python layer — looks like a ZLUDA or GPU-driver-level issue on this AMD card, not something fixable from the graph. **Workaround that worked every time: skip ControlNet, run plain img2img directly on the reference photo instead.** Denoise controls how much of the source pose/structure survives, and it produced the best result of the whole session anyway — no reason to keep fighting ControlNet for this use case.
- **Any first-time model/node load, or a checkpoint-architecture switch (SD1.5 ↔ SDXL), carries elevated crash risk** if queued right after a different job in the same process. Practice that held up: restart the ComfyUI process between different setups rather than queuing mixed jobs back to back.
- **Impact-Pack's `requirements.txt` risks a torch upgrade — install narrower.** The documented install pulls `git+facebookresearch/sam2`, which wants a modern PyTorch and could silently upgrade the deliberately-pinned ZLUDA-compatible torch (`2.7.0+cu118`), breaking GPU generation across the whole install. FaceDetailer doesn't need SAM at all — `sam_model_opt` is an optional input, bbox-only YOLO detection is sufficient. Installed narrow instead: skipped `segment-anything`'s heavier sibling `sam2` entirely, but Impact-Pack's `core.py` still does a hard top-level `import segment_anything` (the original, lightweight Meta package, pip name `segment-anything` — unpinned torch requirement, confirmed zero dependencies pulled on install). That one package is required for the node pack to import at all; `sam2` is not. Net installed: `matplotlib piexif scipy scikit-image dill opencv-python-headless transformers "ultralytics>=8.3.162" segment-anything`. Torch untouched, confirmed by re-checking `pip show torch` after.
- **FaceDetailer needs two separate repos, not one.** `ComfyUI-Impact-Pack` (the `FaceDetailer` node) and `ComfyUI-Impact-Subpack` (the `UltralyticsDetectorProvider` node that actually loads a YOLO detector) are split on purpose — licensing, per the Impact-Pack README. Both are needed together. Face model: `face_yolov8m.pt` (the standard community ADetailer model, via `huggingface.co/Bingsu/adetailer`) → `models/ultralytics/bbox/`.

## Saved workflows

**`ghibli-character-v1.json`** — animagine-xl-4.0 + KappaNeuro lora (0.8/0.8), plain img2img (no ControlNet) at denoise 0.5 against a reference photo. Superseded by v2 below for anything with a visible face; still the reference for the base SDXL+KappaNeuro look.

**`ghibli-character-v2.json`** — the current best-known character setup. nitrosocke `Ghibli-Diffusion` (SD1.5 full checkpoint) + plain img2img at denoise 0.5, **plus an automated FaceDetailer pass** (see below). Two independent prompt pairs: one for the body (clothing/pose/setting), one dedicated to the face — FaceDetailer takes its own `positive`/`negative` CONDITIONING inputs, so the face pass can push things that only matter at that scale (`"symmetrical eyes, clear detailed eyes"`) without cluttering the body prompt.

### Face detail — solved, two ways

**Root cause.** Fixed-resolution diffusion models compress the image 8x internally before the network touches it. A full-body render's face might be 60–80px tall on screen — after compression, that's roughly 8–10px of actual working resolution to draw two eyes, a nose, and eyebrows. Not enough room, so the model hallucinates shapes it can't resolve: asymmetric eyes, warped glasses, mushy eyebrow/nose blending. Universal limit, not specific to one checkpoint.

**Manual fix** (proven first, on Ilsa, before installing anything new): crop the face → upscale ~4x → img2img redraw at denoise ~0.4 with a face-focused prompt → downscale → paste back with a *feathered* mask (a hard-edged paste leaves a visible seam at the hairline/collar; a Gaussian-blurred alpha mask over the crop boundary removes it completely). No new custom nodes, reuses the already-proven-stable graph shape.

**Automated fix — installed, verified working, this is the pick going forward.** `FaceDetailer` (bbox from `UltralyticsDetectorProvider`) does the same crop → upscale → redraw → blended-paste in one node, one job, no external scripting. Slower wall-clock than doing the steps separately (~24 min all-in vs. splitting generation and refine into two jobs), but it's a complete pipeline and the blend quality matches the manual feathered version out of the box. Installed clean — no crash, confirmed torch untouched (see Infrastructure gotchas). **Use this for the rest of the cast**, not the manual crop/paste process.

**Expression prompting note:** `"gentle expression"` alone reads as neutral-to-frowning when combined with `"weathered face, wrinkles"` and a non-smiling source photo (img2img at denoise 0.5 retains a lot of the source's actual mouth/brow shape). Use something more explicit — `"gentle expression, soft closed-mouth smile"` — to counter it. Confirmed working in both the nitrosocke and FaceDetailer tests.

## Open item — not resolved here

**Ilsa's shipped art doesn't match her new reference photos.** `phaser/public/art/cast/ilsa.jpg` (shipped) shows a young woman in a cropped white shirt with a tool belt — a JRPG-adventurer look. The new reference set at `Desktop\8-20-26\ilsa-*.jpg` shows an older woman in a blacksmith's apron, grey hair in a bun — which matches her actual written persona (family matriarch, forge work alongside Pip, per `cast/ilsa.md`) far better than the shipped art does. Flagged for Roc's call — not a decision this document makes.

## Where the actual output lives

- **Backdrop batch** (24 images + a 6-image redo at stronger stylization): `Desktop\comfyui-8-19-run\output_ghibli\` — staging, each folder has `source` / `raw` / `upscaled_2x` / (`colormatched` for the original 24). Not yet promoted to `phaser/public/art/`.
- **Character tests**: raw output only, in ComfyUI's own `output\` folder (`ghibli_character_test_*`) — not yet organized into a staging folder the way the backdrop batch was.
