/**
 * IDENTITY SHIM. Pool names and item ids were reconciled 2026-08-23 (Roc) —
 * `screen-specs.json` now authors `item_id` strings directly, so this join is
 * a no-op. Kept so every call site (`SatchelLedger`, `DroppedItemHotspots`,
 * the save layer) stays untouched during freeze week. Delete post-capstone,
 * once it is provably dead.
 */
export function itemForPool(pool: string): string {
  return pool;
}
export function poolForItem(itemId: string): string {
  return itemId;
}
