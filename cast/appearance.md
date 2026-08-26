# Cast Appearance

Life-one looks for the 8 souls, plus the prompt scaffolding to generate their images. Added 2026-08-20 (Roc-approved). See [`../gdd/07-cast.md`](../gdd/07-cast.md) for essence/role/age and [`../gdd/09-art-direction.md`](../gdd/09-art-direction.md) for the art-prompt preamble this builds on.

## Why this file exists

The GDD defined every soul's behavior but no appearance. The art doc named a "silhouette vocabulary" it never spelled out. So these looks were invented from each soul's essence, life-one role, and dealt age, then approved. Nothing here overrides behavior canon — it only fills the visual gap.

## Two rules that shape the art

- **These are life-one looks only.** Age and role re-deal each life ([`07-cast.md`](../gdd/07-cast.md)), so a soul's role costume and apparent age change across lives. Only name and gender are fixed. This file is the slice's deal, not a permanent face.
- **Recognition is name + gender + behavior, not face.** The Obra-Dinn face-puzzle is parked. Faces can be freely designed and need not persist across lives.

## Style block

Prepend to every character prompt:

> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression.

Every prompt ends with: *Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.* Grok can't output real transparency — knock the green out in Phaser so sprites sit over backgrounds.

**Render note:** the concept ref (Eleanor) is glossy modern anime. The game target is Ghibli-painterly on-palette, not glossy — chosen so NPCs match the painted backdrops. Restrained Frieren expressions, painted rendering.

**Alternate style block (lively).** The pasted prompts below use the standard block above and came out well — keep them. When `09`'s tone lifted 2026-08-22 (livelier, less desaturated), the interiors needed it but the approved character busts did not. So this livelier block is an *alternate*, not a replacement — swap it in for the standard block on any character to try a brighter take, leaving the appearance text unchanged:

> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, warm and lively, gently saturated with rich natural color, luminous soft light. Warm woods, cream, honey and amber, antique gold, fresh sage and leaf green. No neon, no glossy plastic shading, no muddy darkness. Gentle painterly Miyazaki warmth, calm restrained Frieren-like expression.

## Two shots per soul

1. **Full body** — in-world standee. Standing, relaxed natural pose, facing forward, head to feet in frame.
2. **Dialogue bust** — the talk-to-them sprite. Waist-up, centered, facing the viewer, calm neutral VN pose.

**Production order:** generate the full body first, then feed it to Grok as the reference image for that soul's bust. Otherwise face and clothes drift between the two shots.

## Life-one looks

| Soul | Life-one | Appearance |
|---|---|---|
| **Mara** — Keeper | 30s–40s ♀ · Herbalist | Chestnut-brown hair loosely tied back with escaping strands. Many-pocketed herb-gatherer's apron over a soft shawl, plant-stained hands, gentle wistful eyes. |
| **Toby** — Giver | young ♂ · Baker | Flour-dusted apron, sleeves rolled up, warm brown hair, kind watchful eyes. Hands full mid-task, or lifting a small loaf as if to offer it. |
| **Ilsa** — Kinbound | older ♀ · Blacksmith | Broad-shouldered and powerfully built, strong muscular forearms. Iron-grey hair bound up out of the forge, worn leather smith's apron over sturdy work clothes, soot-smudged hands, steady matriarch's gaze. |
| **Nell** — Content Server | middle ♂ · Farmer | Easygoing and relaxed, faint contented smile. Rolled sleeves, a canvas work vest, a wide-brim straw hat pushed back, earth-worn trousers, a bundle of harvest in hand. |
| **Juno** — Found-Family Keeper | older ♀ · Priest | Motherly, open welcoming face, warm eyes. Layered priest's robes with a muted sage-and-cream stole over cozy patchwork layers, a small ritual pendant. |
| **Linnet** — Half of a Pair | middle ♀ · *(past this life)* | Quiet and self-contained, a settled wistfulness. Simple village clothes, one small keepsake held close. |
| **Pip** — Wonder-Seeker | young ♂ · Postman | Bright-eyed and light on his feet. A worn leather letter-satchel slung across the body, a light traveler's cap, a bundle of festival letters in hand, an about-to-dash energy. |
| **Bex** — Rule-Breaker | middle ♂ · *(past this life)* | Grounded and direct, open face, steady eye contact, plain unfussy village clothes. |

Three texture souls were dealt roles 2026-08-20 (Juno → Priest, Nell → Farmer, Pip → Postman), so they now carry role costumes. **Linnet and Bex are "past" this life** — absent, no role — kept here in plain clothes for when a later life deals them in. Cast balance is 4 men (Toby, Nell, Pip, Bex) and 4 women (Mara, Ilsa, Juno, Linnet).

## Ready-to-paste prompts

Full prompts, no assembly. If the looks table above changes, update these to match.

### Mara — Herbalist

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Mara, a woman in her thirties, the village herbalist. Chestnut-brown hair loosely tied back with escaping strands, a many-pocketed herb-gatherer's apron over a soft shawl, plant-stained hands, gentle wistful eyes. Standing, relaxed natural pose, facing forward, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Mara, a woman in her thirties, the village herbalist, shown from the waist up, centered, facing the viewer in a calm neutral visual-novel pose. Chestnut-brown hair loosely tied with escaping strands, herb-gatherer's apron and soft shawl, plant-stained hands, gentle wistful eyes. Soft expression. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

### Toby — Baker

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Toby, a young man, the village baker. Flour-dusted apron, sleeves rolled up, warm brown hair, kind watchful eyes, hands full mid-task. Standing, relaxed slightly forward-leaning pose, facing forward, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Toby, a young man, the village baker, shown from the waist up, centered, facing the viewer in a calm neutral visual-novel pose. Flour-dusted apron, rolled sleeves, warm brown hair, kind watchful eyes, lifting a small loaf as if to offer it. Soft expression. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

### Ilsa — Blacksmith

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Ilsa, an older woman, the village blacksmith. Broad-shouldered and powerfully built with strong muscular forearms, iron-grey hair bound up out of the forge, a worn leather smith's apron over sturdy work clothes, soot-smudged hands, steady matriarch's gaze. Standing, grounded stance, facing forward, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Ilsa, an older woman, the village blacksmith, shown from the waist up, centered, facing the viewer in a calm neutral visual-novel pose. Broad-shouldered, powerful build, muscular forearms, iron-grey hair bound up, worn leather smith's apron, soot-smudged hands, steady gaze. Soft expression. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

### Nell — Content Server / Farmer

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Nell, a middle-aged man, the village farmer. Easygoing and relaxed, faint contented smile, rolled sleeves, a canvas work vest, a wide-brim straw hat pushed back, earth-worn trousers, a bundle of harvest in hand, an unhurried air. Standing, loose comfortable pose, facing forward, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Nell, a middle-aged man, the village farmer, shown from the waist up, centered, facing the viewer in a calm neutral visual-novel pose. Easygoing, faint contented smile, rolled sleeves and a canvas work vest, a wide-brim straw hat pushed back. Soft expression. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

### Juno — Found-Family Keeper / Priest

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Juno, an older woman, the village priest. Motherly, open welcoming face, warm eyes, layered priest's robes with a muted sage-and-cream stole over cozy patchwork layers, a small ritual pendant. Standing, warm open pose, facing forward, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Juno, an older woman, the village priest, shown from the waist up, centered, facing the viewer in a calm warm visual-novel pose. Motherly, open welcoming face, warm eyes, priest's robes with a muted sage-and-cream stole over patchwork layers, a small ritual pendant. Soft expression. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

### Linnet — Half of a Pair *(past this life)*

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Linnet, a middle-aged village woman. Quiet and self-contained, a settled wistfulness, simple village clothes, holding one small keepsake. Standing, still composed pose, facing forward, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Linnet, a middle-aged village woman, shown from the waist up, centered, facing the viewer in a calm quiet visual-novel pose. Self-contained, settled wistful expression, simple clothes, one small keepsake held close. Soft expression. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

### Pip — Wonder-Seeker / Postman

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Pip, a young man, the village postman. Bright-eyed and light on his feet, a worn leather letter-satchel slung across the body, a light traveler's cap, a bundle of festival letters in hand, looking off to one side as if he's spotted something. Standing, eager mid-step pose, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Pip, a young man, the village postman, shown from the waist up, centered, facing the viewer in a bright curious visual-novel pose. Bright eyes, a worn leather letter-satchel across the body, a light traveler's cap, an eager just-about-to-speak look. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

### Bex — Rule-Breaker *(past this life)*

**Full body**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Full-body character reference of Bex, a middle-aged village man. Grounded and direct, open face, steady eye contact, plain unfussy village clothes. Standing, squared calm pose, facing forward, whole figure head to feet in frame. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.

**Dialogue bust**
> Studio Ghibli style character, hand-painted watercolor with clean hand-inked outlines, soft warm lighting, desaturated cozy palette — warm browns, cream, antique muted gold accents, sage green, dark brown ink. No neon, no glossy plastic shading, no pure white. Gentle painterly Miyazaki look, calm restrained Frieren-like expression. Bex, a middle-aged village man, shown from the waist up, centered, facing the viewer in a calm direct visual-novel pose. Open face, steady eye contact, plain clothes. Soft expression. Isolated on a solid flat chroma-green background for clean cutout, no text, no UI.
