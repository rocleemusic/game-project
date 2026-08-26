# Key Item Appearance

Visual production notes and ready-to-paste prompts for the 12 key items in [`_index.md`](_index.md). Added 2026-08-22 (Roc-approved), following the same pattern as [`cast/appearance.md`](../../cast/appearance.md) — the GDD/content records define what an item *is*; nothing here overrides those, it only fills the visual gap.

## Two production routes

Every key item was checked against Sketchfab for a 3D reference model — the same pipeline used for the base `content/items/` set: pull a clean model, render it straight-on on a transparent background in Blender, then push that render through the Ghibli ComfyUI pass (or Grok, image-to-image) to restyle it on-palette. **9 of 12 had usable stock coverage; 3 did not** — those three are hand-described for Grok instead, no 3D step.

| key_item_id | route | reference |
|---|---|---|
| `key_berry_loaf` | 3D → **Grok**, text-only | Sketchfab "Medieval_Bread_Loaf_FBX" — `key_berry_loaf_ref.png`. The round boule shape didn't restyle well through the pipeline; moved to a text-only Grok generation (no reference image), oblong instead of round. First pass showed a cutaway with exposed crumb — revised to explicitly require a whole, uncut loaf. Approved 2026-08-23 |
| `key_handed_plate` | 3D → **Grok** restyle | Sketchfab "Wooden plate" — `key_handed_plate_ref.png`. Grok redesign pushes it hand-carved and beeswax-polished (matching `made_from`) rather than machine-turned. Approved 2026-08-23 |
| `key_knotted_cord` | 3D → **Grok**, text-only | Sketchfab "Rope Knots" — `key_knotted_cord_ref.png`. The reference's rigid, evenly-spaced hemp-rope structure kept overriding text instructions even when attached as an image guide; dropped the reference entirely and generated from description alone (below). Approved 2026-08-23 |
| `key_raw_ore` | 3D → restyle | Sketchfab "Proptober Day 11: Iron Ore Vein" — `key_raw_ore_ref.png` |
| `key_rite_chime` | 3D → **Grok** restyle | Sketchfab "Bell" (brass hand bell) — `key_rite_chime_ref.png`. The plain reference read as a schoolroom bell, not a rite object; Grok redesign (below) pushed it ornate and magical instead of the plain ComfyUI pass |
| `key_sealed_letter` | 3D → **Grok** restyle | Sketchfab "Letter & Envelope Assets" (envelope + wax seal only, loose paper sheet dropped) — `key_sealed_letter_ref.png`. Grok redesign corrects the seal to honey-gold beeswax (matching `made_from`) instead of red sealing wax, and the envelope to cream parchment instead of grey. Approved 2026-08-23 |
| `key_stone_sickle` | 3D → restyle | Sketchfab "Sickle" (ChrisNC) — `key_stone_sickle_ref.png` |
| `key_tonic_drop` | 3D → restyle | Sketchfab "Potion Vial" — `key_tonic_drop_ref.png` |
| `key_unopened_jar` | 3D → **Grok** restyle | Sketchfab "NOMFst Mason Jar 2" — `key_unopened_jar_ref.png`. The reference reads as a glowing magic potion (pale-green liquid, gold screw lid, floating particles), not preserves — Grok redesign grounds it as a plain jar of berry jam sealed with beeswax. Approved 2026-08-23 |
| `key_arch_filing` | **Grok, no 3D** | no stock coverage — tied to a specific fictional object (the Lantern Arch centerpiece), not a generic shape |
| `key_spare_apron` | **Grok, no 3D** | stock aprons read as costume (gingham maid) or as a worn/wrapped garment on a mannequin — neither matched "plain, folded, kept" |
| `key_dawn_bundle` | **Grok, no 3D** | the one literal "bindle" hit on Sketchfab was a mislabeled balloon prop; no real cloth-bundle asset turned up |

All 9 reference renders are staged (not yet pushed through the Ghibli pass) at `phaser/public/art/key-items/_staging/`.

## Style block

Same base preamble as the item pipeline ([`gdd/09-art-direction.md`](../../gdd/09-art-direction.md)) — prepend to every prompt below:

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder.

Every prompt ends with the isolation framing: *isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene.*

**Composition informs the description**, pulled from each record's `made_from` in [`_index.md`](_index.md) — not invented separately.

## Ready-to-paste prompts

Reference-backed Grok redesigns, plus the 3 Grok-only items with no 3D step at all.

### key_berry_loaf — a preserved-berry loaf

*Made from `item_berry` + `item_salt` + `item_spring_water`. The round-boule 3D reference (Sketchfab
"Medieval_Bread_Loaf_FBX") didn't hold up through the pipeline. Moved to text-only Grok, no
reference image, and changed the shape to oblong rather than round. First attempt scored/tore the
crust in a way that read as a cutaway with exposed crumb — revised to explicitly require a whole,
unbroken loaf, both ends closed. Approved 2026-08-23.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. A whole, uncut loaf of preserved-berry bread, oblong and oval, tapered gently at both ends — the loaf is fully intact, no slice removed, no cut end, no exposed crumb or interior anywhere, a continuous unbroken crust all the way around. A few decorative slashes scored into the top of the crust only, shallow, with a hint of deep purple-red berry just visible peeking through the scored lines, a faint jammy sheen where berry juice caramelized into the crust surface. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_handed_plate — a plain carved plate, wax-polished, from the deep end of her stack

*Made from `item_sticks` + `item_beeswax` (Ilsa, gift) — hand-carved and wax-polished, not a
machine-turned bowl-shop plate. "From the deep end of her stack" reads as humble and quietly kept
rather than decorative. Approved 2026-08-23.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. Using the attached wooden plate as the exact reference for its shape, redesign it as a plain hand-carved wooden plate, simple and a little uneven the way something whittled by hand is, polished to a warm low sheen with beeswax rather than lacquered — humble, well-used, quietly kept rather than shown off. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_sealed_letter — a wax-sealed festival letter

*Made from `item_beeswax` (Postman, gift) — the seal should be beeswax gold, not classic red
sealing wax, and the envelope should read as parchment, not grey card. Approved 2026-08-23.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. Using the attached envelope as the exact reference for its shape and the seal's placement, redesign it as a warm cream parchment-paper envelope sealed with a blob of honey-gold beeswax instead of red sealing wax, a simple pressed festival mark in the wax, a little uneven and hand-done. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_knotted_cord — a twisted wool cord, one knot per person of hers, never explained

*Made from `item_wool` only. The 3D reference (Sketchfab "Rope Knots") is coarse hemp rope with
identical, evenly-spaced knots — wrong material and wrong rhythm for an item description that's
really about years of separate, unrepeatable moments. Two attempts using the reference image as an
img2img anchor both reverted to the source's rigid rope structure regardless of text changes.
**Generated from text alone, no reference image** — approved 2026-08-23.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. A length of soft twisted wool cord, undyed warm cream-grey, a fuzzy plied-fiber texture, not rope. Knots tied along it one at a time over many years, so no two look alike and none of them evenly spaced — a plain loop close to a tight double knot, then a long bare stretch of cord, then two knots crowded near each other, one knot noticeably bigger than the rest. The older knots are worn soft and slightly darkened; the newest one still looks crisp and pale. An irregular, hand-kept, diary-like object — not a decorative or repeating pattern. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_unopened_jar — a wax-sealed jar of preserves, never opened

*Made from `item_berry` + `item_beeswax`. The 3D reference (Sketchfab "NOMFst Mason Jar 2") reads as
a glowing magic-potion jar — pale-green contents, gold screw lid, floating light particles — not
preserves. First Grok pass fixed the jam (rich purple-red, glossy, correct) but the beeswax seal
came out as a messy overflowing blob. Revised to describe a thin, controlled, hand-pressed seal.
Approved 2026-08-23.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. A plain glass jar filled with deep purple-red berry preserves, thick and jammy, glossy, filled almost to the top. The jar's mouth is sealed with a thin, even layer of golden-brown beeswax pressed flat and smooth across the opening, level with the rim — not a thick dripping mound, just a couple of small controlled drips at most, a simple pressed thumbprint mark in the center of the wax where it was sealed by hand. A cozy pantry keepsake. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_rite_chime — a small rite chime

*3D reference exists (a plain brass hand bell) but read too mundane — schoolroom bell, not a rite
object. Redesigned via Grok, image-referenced against the Blender render for shape/proportions
only. Approved 2026-08-22.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. Using the attached hand bell as the exact reference for its shape and proportions — a bell-shaped head on a turned handle — redesign it as an ornate ceremonial rite chime, cast entirely from aged gold-brass metal, handle and bell both, with a soft warm patina rather than plain dull brass. Fine etched engravings spiraling around the bell's flare, a small worn sigil or rune stamped near the rim, delicate filigree banding where the handle meets the bell. A faint, gentle magical glow traced along the engraved lines, as if the chime hums with a quiet enchantment. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_arch_filing — a filing from the Lantern Arch centerpiece

*Found, not made (Blacksmith, memento) — a shaving pared off a specific in-world landmark, the Town Square's Lantern Arch centerpiece.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. A single small curled metal filing, pared from an ornate wrought-iron lantern arch, dark iron with a trace of gilding still catching the light along one curled edge, delicate and thin like a wood shaving but metal. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_spare_apron — a second work apron, folded and kept for hands that have not come

*Made from `item_wool` only (Ilsa, memento) — plain wool, not leather.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. A plain work apron made of woven undyed wool, neatly folded into a small square and set aside, a little faded and soft with waiting rather than wear, quietly kept rather than used. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.

### key_dawn_bundle — a small wool-wrapped bundle of provisions, tied the night before

*Made from `item_berry` + `item_grass` + `item_wool` (Toby, gift) — berries and grass wrapped in wool cloth, not a generic sack.*

> Studio Ghibli style, hand-painted watercolor, warm and lively, gently saturated with rich natural color, cozy and whimsical, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green, soft sky tones. Painterly Miyazaki warmth and wonder. A small bundle of provisions wrapped in a square of plain wool cloth and tied at the top with cord, forest berries and a few blades of fresh grass tucked just inside the fold, packed carefully the night before for an early start. Isolated game item icon, centered, plain simple background, no text, no UI, no buttons, no interface, no menu, no other objects, no scene, masterpiece, best quality, absurdres.
