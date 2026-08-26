/**
 * Load one resolver run folder into the shapes Lantern's ink engine expects.
 *
 * `story.json` is fetched as TEXT on purpose: `new Story()` takes the raw
 * string, so parsing it here would only mean re-stringifying it there.
 */

import { buildGraphIndex, type GraphIndex } from "@lantern/lib/playMap";
import type { Day, Graph } from "@lantern/types";
import type { ItemRecord, SpellRecord } from "../magic/types";

/** A normalized hotspot rect: fractions of the backdrop, not pixels. */
export interface RegionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type RegionMap = Record<string, Record<string, RegionRect>>;

export interface Run {
  /** Raw text — `new Story()` wants the string. */
  storyJson: string;
  graph: Graph;
  index: GraphIndex;
  days: Day[];
  /** screen_id -> image path, relative to the run folder. */
  manifest: Record<string, string>;
  regions: RegionMap;
  /**
   * MOVE regions — T14 §1's click-to-walk boxes, `regions.json`'s `moves` key,
   * keyed `{ from_screen_id: { to_screen_id: RegionRect } }`.
   *
   * A SECOND MAP, NOT MORE ENTRIES IN `regions` ABOVE. An examine region and a
   * move region are different verbs on the same painting (look at the barn
   * door vs. walk through it), drawn in different colours and read by
   * different systems (`HotspotSystem` vs. `render/MoveRegions.ts`). Sharing
   * one id space would make a box's meaning depend on which system happened to
   * claim it. They are also keyed differently: an examinable's id is authored
   * on the screen spec, a move's id IS the destination screen.
   *
   * EMPTY TODAY — no screen has authored move geometry. `MoveRegionPlacement`'s
   * fallback is what keeps the game walkable meanwhile; read its header before
   * touching either.
   */
  moveRegions: RegionMap;
  /**
   * Home Hub decoration surfaces — `decor-surfaces.json`, NOT a key inside
   * `regions.json`. Kept separate on purpose: `regions.json` entries are
   * examinable-hotspot geometry, unioned against `graph.json`'s declared
   * `screen.regions` by `ScreenScene`/`CollectScene`, and `HOME` deliberately
   * declares none (see `Decor.ts`'s header, GAPS.md G14). Same
   * `{ screen_id: { surface_id: RegionRect } }` shape as `regions` so
   * `Decor.buildHomeSurfaces()` can read it the same way.
   */
  decorSurfaces: RegionMap;
  spells: SpellRecord[];
  items: ItemRecord[];
  keyItems: ItemRecord[];
}

async function json<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

export async function loadRun(storyBase = "story", contentBase = "content"): Promise<Run> {
  const [storyRes, graph, manifest, regionsFile, decorSurfacesFile, spells, items, keyItems] = await Promise.all([
    fetch(`${storyBase}/story.json`),
    json<Graph>(`${storyBase}/graph.json`),
    json<Record<string, string>>(`${storyBase}/manifest.json`),
    json<{ screens?: RegionMap; moves?: RegionMap }>(`${storyBase}/regions.json`),
    json<{ screens?: RegionMap }>(`${storyBase}/decor-surfaces.json`),
    json<SpellRecord[]>(`${contentBase}/magic.json`),
    json<ItemRecord[]>(`${contentBase}/items.json`),
    json<Record<string, unknown>[]>(`${contentBase}/key-items.json`),
  ]);
  if (!storyRes.ok) throw new Error(`story.json -> ${storyRes.status}`);
  const storyJson = await storyRes.text();

  // Days the resolver has not emitted are absent, not an error.
  const days: Day[] = [];
  for (let d = 1; d <= 5; d++) {
    try {
      days.push(await json<Day>(`${storyBase}/day-${d}.json`));
    } catch {
      break;
    }
  }

  return {
    storyJson,
    graph,
    index: buildGraphIndex(graph),
    days,
    manifest,
    regions: regionsFile.screens ?? {},
    moveRegions: regionsFile.moves ?? {},
    decorSurfaces: decorSurfacesFile.screens ?? {},
    spells,
    items,
    keyItems: keyItems.map(normalizeKeyItem),
  };
}

/**
 * Key items are the same kind of thing as items but do not share their schema:
 * they key on `key_item_id` rather than `item_id`, and carry no `collectible`,
 * `always_available`, `used_by` or `produced_by` field.
 *
 * That difference is easy to miss and fails silently — a consumer filtering on
 * `collectible` drops all 11 of them, which is exactly how the decoration
 * palette came up empty of mementos, gifts and tools. See GAPS.md G10.
 *
 * Key items are `found` or `made` and are never consumed, so `collectible` is
 * true by construction here.
 */
function normalizeKeyItem(raw: Record<string, unknown>): ItemRecord {
  return {
    item_id: String(raw.key_item_id ?? raw.item_id ?? ""),
    description: String(raw.description ?? ""),
    category: raw.category as ItemRecord["category"],
    persistence: (raw.persistence as ItemRecord["persistence"]) ?? "pack-triaged",
    collectible: true,
    consumable: Boolean(raw.consumable),
    source_locations: (raw.source_locations as string[]) ?? [],
    always_available: false,
    used_by: [],
    produced_by: [],
    use_family: (raw.use_family as string | null) ?? null,
  };
}
