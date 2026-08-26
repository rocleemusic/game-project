# GDD — Background Template & Typography

Art-direction assets for presenting the GDD (canonical v4 and the scoped v5). Grounded in the §10 art direction: Ghibli warmth · Frieren restraint · Myst stillness · the festival of souls + Lantern Arch.

---

## Fonts

**Recommended pairing (canonical v4):**

| Role | Font | Why |
|------|------|-----|
| Headings | **Fraunces** | Old-style soft serif with optical sizing — storybook warmth, still literary. Sits well on parchment. |
| Body | **Spectral** | Humanist reading serif, built for screen; warm and legible in prose + tables. (Swap **Literata** for a cozier book feel.) |
| Code / JSON schemas | **IBM Plex Mono** | Clean, slightly warm, legible for the agent schema blocks. (Or JetBrains Mono.) |

All free on Google Fonts; embed cleanly in PDF/HTML export.

**Alternates:**
- *Cleaner for table-heavy pages:* Fraunces headings + a warm humanist **sans** body (Work Sans or Alegreya Sans).
- *More classic / Myst-leaning (print-first):* Cormorant Garamond headings + EB Garamond body.

**Zero-fuss cohesion (good for the v5 review copy):** one superfamily — **IBM Plex** (Serif + Sans + Mono) or **Source** (Serif 4 + Sans 3 + Code Pro).

**Game title/logo** is a separate job — wants more hand-drawn character than any doc face (a heavier Fraunces optical cut, or eventual custom lettering). Keep it out of the doc's body type.

---

## Background-template prompt (with typography)

Ready to paste into an image/design AI (or run via Canva / open-design MCP).

```
Create a subtle, on-brand page-background TEMPLATE for a game design document (GDD).
It sits behind body text, so legibility is the top priority: keep the central ~75% of
the page light, soft, and nearly empty so dark text stays crisp. Concentrate all visual
interest in a slim top header band, the outer margins/corners, and a small footer motif.

GAME & MOOD — a cozy, painterly fantasy about belonging across lifetimes, in a
hand-painted world. Blend three references: the warm palette and gentle environmental
wonder of Studio Ghibli; the desaturated restraint and quiet melancholy of *Frieren:
Beyond Journey's End*; and the still, hand-painted living-diorama quality of *Myst*.
The story centers on a "festival of souls" and a Lantern Arch said to light the way for
souls to return one night each year.

COMPOSITION
- Portrait, US-Letter / A4 proportions (8.5:11).
- Warm cream / parchment base with a soft painterly texture — lightly aged, not grungy.
- A slim decorative HEADER band across the top for the title — a muted painted ribbon or
  hand-drawn rule, with small lantern or leaf motifs at its ends.
- Delicate corner flourishes (vines, a few leaves) that stay clear of the text area.
- A small, centered FOOTER motif: the silhouette of a stone Lantern Arch with a soft warm
  glow and a few faint light-motes (souls) drifting upward — very low opacity.
- Generous margins and a clearly empty, legible central column.

PALETTE — band-constrained and muted, no bright saturated color:
  warm cream/parchment (base) · soft amber/lantern gold (glow) · dusk blue-grey (cool
  shadow) · muted sage/forest green (foliage) · deep warm ink/charcoal (fine linework).
Keep contrast gentle everywhere except the fine linework; nothing competes with black text.

TYPOGRAPHY — show the template with these typefaces in place (all free on Google Fonts):
- Titles & headings: Fraunces (an old-style soft serif) — a heavier optical cut for the
  cover title, a lighter weight for section headers.
- Body text: Spectral (humanist reading serif) — use placeholder/greeked lines to show the
  clear central text column.
- Code / schema blocks: IBM Plex Mono — include one small monospace block to prove it fits.
Set headings in the deep warm ink and body in near-black for maximum legibility on the
cream. Keep the type quiet and classic — the warmth comes from the paint, not from
decorative lettering.

STYLE — flat, hand-painted watercolor-and-gouache feel; soft edges. No photorealism, no
3D-render look, no heavy drop shadows, no neon. Think storybook endpaper, not a poster.

DELIVERABLE — one clean interior page background at print resolution (300 DPI), center kept
clear for Spectral body text, PLUS a richer "cover" variant: same palette and motifs, the
Lantern Arch larger and centered with a warmer glow, and the title set in Fraunces to show
the finished title page.
```

**Tunable knobs:** swap to 16:9 for slides · "even sparser" if too busy · "near-monochrome: cream + one ink tone, lantern gold as the only accent" for the cleanest read.
