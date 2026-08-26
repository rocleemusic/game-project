# Handoff — item art pipeline, moving ComfyUI to the RTX 4070 box

One-session note, written for standing up ComfyUI on a second machine (NVIDIA RTX 4070, 12GB VRAM)
to take over the item-art restyle pass. The current pipeline runs on `P:\AAA_Programs\ComfyUI-Zluda`
(AMD RX 5700, 8GB, via ZLUDA) — real CUDA on the 4070 should be both simpler to set up (no ZLUDA
quirks) and meaningfully faster per image. Full design record for the wider art pipeline:
`plans/2026-08-20-ghibli-art-pipeline-notes.md`.

## What this session did

Building item icons to match the game's Ghibli art direction ([`gdd/09-art-direction.md`](../../gdd/09-art-direction.md)),
since the current satchel icons are flat placeholder SVGs. Two-stage pipeline per item:

1. **Reference pull** — Blender MCP searches Sketchfab/PolyHaven for a real-world 3D model matching
   the item, renders it clean and straight-on on a transparent background.
2. **Restyle pass** — that render goes through ComfyUI as an img2img source: SDXL checkpoint +
   Ghibli LoRA + the game's palette-locked prompt preamble, denoise ~0.55–0.65 so the source shape
   survives but the surface repaints Ghibli.

Not every item has a good 3D reference — items with poor Sketchfab coverage (liquids, abstract
concepts, bespoke narrative objects) skip the 3D step and go straight to a hand-written Grok
text-to-image prompt instead. See [`content/key-items/appearance.md`](../../content/key-items/appearance.md)
for that split, worked out for the 12 key items (9 got 3D references, 3 didn't).

**Base items (`content/items/`) done or in progress:** river_stone (done, restyled, approved by
Roc), feather (done, restyled, clean first try), sticks (done — first pass merged into one clump,
redone with a single isolated stick, clean), beeswax (**not landed** — three restyle attempts all
drifted off "honeycomb hexagons" into food-adjacent shapes: glass/soap bars, a ridged wafer, a
nougat bar with chocolate drizzle; queued for a Grok attempt instead, result unknown). Heated/tempered
stone variants of river_stone were done via Grok directly (heated stone landed well; tempered
stone got a revision note — more warmth/magic, less "just cold").

**Key items (`content/key-items/`):** 9 of 12 reference-rendered and staged (loaf, plate, knotted
cord, ore vein, bell, sealed envelope, sickle, potion vial, jar). 3 have no 3D coverage and are
Grok-prompt-only (arch filing, spare apron, dawn bundle) — prompts written, Roc queuing them
manually.

**Staged output, not yet promoted to shipped art:**
- `phaser/public/art/items/_staging/` — base item reference renders + Ghibli-pass test outputs
- `phaser/public/art/key-items/_staging/` — key item reference renders (restyle pass not run yet)

Same convention the backdrop/character batches used — nothing here ships until Roc reviews it.

## What the 4070 box needs

**No custom nodes required for this pipeline.** The item workflow is plain `img2img`: checkpoint →
LoRA → two CLIPTextEncode (positive/negative) → LoadImage → VAEEncode → KSampler → VAEDecode →
SaveImage. That's different from the character pipeline (`ghibli-character-v2.json`), which needs
`ComfyUI-Impact-Pack` + `ComfyUI-Impact-Subpack` for `FaceDetailer` — skip installing those unless
this box is also going to do character work.

### Checkpoint + LoRA — copy, don't re-download

Both files already exist, tested and working, on the ZLUDA machine:

| File | Path on the ZLUDA box | Size |
|---|---|---|
| `animagine-xl-4.0.safetensors` | `models/checkpoints/` | 6.94 GB |
| `Ghibli_MK2_style_illustV1.safetensors` | `models/loras/` | 228 MB |

**Copy these two files directly to the 4070 box's `ComfyUI/models/checkpoints/` and
`ComfyUI/models/loras/`** rather than re-sourcing them online — that guarantees an exact match to
what every approved result so far was generated with. I don't have a confirmed download URL for
the LoRA specifically (niche filename, no source noted in the design record), so re-finding it
externally risks pulling a different version. If a copy genuinely isn't possible: `animagine-xl-4.0`
is a known public SDXL checkpoint (Cagliostro Research Lab) findable on Hugging Face/Civitai —
verify the exact version before trusting it matches; for the LoRA, search Civitai for "Ghibli MK2
style illust" and confirm the file hash/size (228,483,500 bytes) matches before using it.

### ComfyUI itself

Standard install (`git clone` the ComfyUI repo, `pip install -r requirements.txt`, get a CUDA
build of torch — the 4070 needs no ZLUDA/AMD workarounds, so skip all the `--use-quad-cross-
attention` / `--reserve-vram` / `--disable-async-offload` launch flags the ZLUDA box needs; run
plain `python main.py`). Confirm the API is reachable at `http://127.0.0.1:8188/system_stats`
before running anything.

## The workflow

Saved UI-format workflow: `user/default/workflows/ghibli_landscape_00001_.json` on the ZLUDA box —
copy it over if you want to load it in the ComfyUI GUI directly. Node IDs and wiring (for
rebuilding via the HTTP `/prompt` API instead):

```
4  CheckpointLoaderSimple(ckpt_name="animagine-xl-4.0.safetensors")  → MODEL, CLIP, VAE
14 LoraLoader(model=4.MODEL, clip=4.CLIP,
              lora_name="Ghibli_MK2_style_illustV1.safetensors",
              strength_model=0.9, strength_clip=0.9)                → MODEL, CLIP
6  CLIPTextEncode(clip=14.CLIP, text=<positive prompt>)              → CONDITIONING
7  CLIPTextEncode(clip=14.CLIP, text=<negative prompt>)              → CONDITIONING
10 LoadImage(image=<source render filename, in ComfyUI's input/>)   → IMAGE
15 VAEEncode(pixels=10.IMAGE, vae=4.VAE)                             → LATENT
3  KSampler(model=14.MODEL, positive=6.COND, negative=7.COND,
            latent_image=15.LATENT, steps=28, cfg=5,
            sampler_name="euler_ancestral", scheduler="normal",
            denoise=0.55–0.65, seed=<any>)                          → LATENT
8  VAEDecode(samples=3.LATENT, vae=4.VAE)                            → IMAGE
9  SaveImage(images=8.IMAGE, filename_prefix=<per-item name>)
```

**Denoise:** 0.65 was the default; dropped to 0.55 for beeswax to hold source geometry tighter (didn't
fix the hex-cell problem, but the technique is sound for cases where the model drifts from the source
shape too much).

### Prompt template

**Base preamble, prepend to every prompt** (locked, matches [`gdd/09-art-direction.md`](../../gdd/09-art-direction.md)):

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder.

**Then, per item:** a specific material/identity description (be explicit — "smooth grey pebble" not
just "smooth round," or SDXL will guess wrong; it turned an under-described stone into a fried egg
on the first pass), followed by: *isolated game item icon, plain simple background, no text, no UI,
no buttons, no interface, no menu, masterpiece, best quality, absurdres.*

**Negative, base:**

> photorealistic, realistic, photograph, 3d, watermark, text, signature, logo, username, jpeg artifacts, lowres, worst quality, low quality, blurry, oversaturated, people, person, human, deformed

**Plus per-item exclusions** for whatever wrong object the shape invites — feather needed
`leaf, blade, knife, sword, brush, paintbrush, flower petal`; sticks needed
`arrow, spear, weapon, cigarette, pencil, chopsticks, bone`; the stone needed `egg, food, dessert,
meringue, dumpling, mochi, marshmallow, candy, glossy shiny surface` after the first attempt read as
a fried egg. Always add these — the base negative alone isn't enough.

### Known gotchas from this session

- **Transparent-background source renders composite to solid black when ComfyUI's `LoadImage` drops
  the alpha channel.** Roc accepted this for now (re-key transparency after the restyle pass), but if
  it matters on the new box, composite the Blender renders onto a flat neutral canvas before loading
  them, rather than relying on alpha surviving the round-trip.
- **Generation time varies a lot** on the ZLUDA box — anywhere from ~25 to ~40 minutes per image at
  28 steps, even back-to-back with the same settings. Should be dramatically faster on real CUDA;
  worth timing the first run to recalibrate expectations before queuing a big batch.
- **Honeycomb (beeswax) never worked on the ZLUDA box** — worth retrying there once the 4070 is up,
  in case it's a checkpoint/lora quirk rather than something wrong with the prompt or source.

## Open items, not resolved this session

- Beeswax needs a working restyle — either retry via ComfyUI on the new box, or the Grok attempt
  Roc queued may already have landed.
- 3 key items (arch filing, spare apron, dawn bundle) are Grok-only — prompts are in
  [`content/key-items/appearance.md`](../../content/key-items/appearance.md), Roc running them
  manually.
- 9 staged key-item references (`phaser/public/art/key-items/_staging/`) haven't been through any
  restyle pass yet — that's the first real batch for the new box once it's running.
- Tempered stone's Grok result needs a revision pass (more warmth/magic, per Roc's note) — prompt
  is saved in the chat history, not yet written to a file.
- Nothing here is promoted to `phaser/public/art/` yet — every result to date is staging-only,
  pending Roc's review.
