/**
 * Items an NPC can just hand over, once, no currency involved.
 *
 * THIS IS PROBE-LOCAL AND PROVISIONAL, same posture as `foragePoolToItem.ts`.
 * There is no gift/trade mechanic anywhere in the real content or in
 * `CollectScene` before this — Roc ruled (2026-08-13) that `item_salt`
 * should come from an NPC directly rather than by foraging or buying, "we
 * won't deal with money."
 *
 * Keyed by role_tag, same granularity as `openNpcSpells()` — every soul
 * holding that role for the life offers the same item. `Baker` was picked
 * because `role-workplace.json` already ties the Baker to Market Row (T2)
 * and to feast/preserving work, which `item_salt` (used by `preserve`) fits
 * without inventing new lore. A GUESS, confirm or redirect — same posture as
 * every other join in this file's family.
 *
 * NOTE: this is a plain item hand-off, not the `gift` key-item category
 * `cast/ilsa.md` rule 14 constrains ("a `gift` key item runs player -> NPC
 * only") — that rule is scoped to key items of category `gift`, not to
 * regular items, so this doesn't collide with it. Flagging the adjacency
 * rather than assuming it's fine to skip mentioning.
 */

export const NPC_GIFT_ITEM: Record<string, string> = {
  Baker: "item_salt",
};

export function npcGiftForRole(role: string): string | null {
  return NPC_GIFT_ITEM[role] ?? null;
}
