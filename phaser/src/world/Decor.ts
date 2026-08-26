/**
 * Home Hub decoration — placement model and persistence.
 *
 * The GDD gives the hub two spaces sharing one asset set
 * (`gdd/08-levels.md:38-42`):
 *
 *   - the **in-game home**, which you decorate during a life and which "resets
 *     empty at the start of each new life"
 *   - the **meta-hub**, a permanent record whose pieces are "display-only —
 *     never withdrawable into play"
 *
 * The probe models the ACT OF ARRANGING, which is the thing that has to be
 * felt before Unreal builds it. It is deliberately not a spec for either space:
 * it offers both modes side by side so the difference can be judged.
 *
 * Ruling respected: the Home Hub is not a forage point (2026-08-04). Nothing
 * here sources an item.
 */

export type HubMode = "home" | "meta";

/**
 * Authored surfaces, as fractions of the backdrop.
 *
 * Sourced from `<run>/decor-surfaces.json`'s `HOME` entry (read against the
 * real `home-hub-diorama.png` backdrop — GAPS.md G14's finding, closed
 * 2026-08-22) for every surface except `shelf`. `shelf` stays the one
 * hand-placed entry — now sixteen of them (wireframe §8 "Two views of one
 * shelf," decided revision 4): the art has sixteen open cubbies, so the code
 * needed sixteen single-slot surfaces, not one 12%×7% zone standing in for
 * all of them. See `SHELF_CUBBIES` below.
 *
 * `decor-surfaces.json` is its OWN file, not a key inside `regions.json`,
 * even though it shares that file's `{ screens: { [id]: RegionRect } }`
 * shape. `regions.json` is examinable-hotspot geometry — `ScreenScene` and
 * `CollectScene` union its per-screen ids with `graph.json`'s DECLARED
 * `screen.regions` and render every id in that union as a clickable examine
 * box. `HOME` declares zero regions on purpose (hand-authored screen, not
 * ScreenSpec-driven — `tests/WorldView.test.ts`'s "still has only ONE screen
 * with authored geometry" pins `regions.json`'s shaped screens to exactly
 * `["T1"]`), so a decoration surface written into `regions.json`'s `HOME` key
 * would render as a stray, undeclared examine hotspot over the Home Hub
 * backdrop — a real collision, hit and reverted while building this. A
 * surface is "somewhere to place a thing," not "something to examine," and
 * keeping the file separate is what keeps those two concepts from bleeding
 * into each other.
 */
export interface Surface {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  /**
   * Wireframe §8's closing ruling (decided, revision 4): "both slot shapes
   * stay, matched per surface — grid cells where the surface is naturally
   * gridded (the shelf's sixteen cubbies), free-drag zones where it isn't
   * (table, floor, sill)." `gridded` is that per-surface fact. A gridded
   * surface holds exactly one occupant and refuses a drop anywhere outside
   * its own small rect (`place`/`moveTo`, below); every other surface is a
   * free-drag hint with no exclusivity of its own — the sill already holds
   * three pots at once in the art. Replaces the old scene-wide
   * `PlacementMode` toggle, which asked the player to pick free-vs-slots for
   * the whole room when the art already answers that per surface.
   */
  gridded?: boolean;
}

/** What `buildHomeSurfaces` reads a rect out of — `run.decorSurfaces.HOME`'s
 * shape, restated locally rather than imported from `ink/loadRun` (same
 * "define the rect shape where it's used" convention `HotspotPlacement.ts`'s
 * `HotspotRect` already follows, so `world/` stays decoupled from `ink/`). */
export interface RegionRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * `shelf` is not part of the decor-surfaces authoring pass (see header) — it
 * stays hardcoded, subdividing the unit's old single 12%×7% room-view zone
 * (`x:0.44, y:0.09, w:0.12, h:0.07`) into a 4×4 grid of cubbies, ids
 * `shelf-r0c0` through `shelf-r3c3` (row, then column, both 0-indexed —
 * `r0c0` is the top-left cubby). Each is its own single-slot `gridded`
 * surface: `Decor.occupant(surfaceId)`'s one-placement-per-surface rule
 * already does the right thing per cubby, unchanged — this just gives it
 * sixteen surfaces to enforce it over instead of one.
 *
 * ROOM-VIEW geometry only. The close-up scene (`HubShelfScene.ts`) is a
 * different projection of the same unit — front-on, not isometric — and
 * owns a completely separate rect table for these same sixteen ids, hand
 * -authored against that view's own backdrop. See that file's header and
 * the wireframe's closing note on why the two tables can't share math.
 */
const SHELF_ROWS = 4;
const SHELF_COLS = 4;
const SHELF_BOUNDS = { x: 0.44, y: 0.09, w: 0.12, h: 0.07 };

function buildShelfCubbies(): Surface[] {
  const cubbyW = SHELF_BOUNDS.w / SHELF_COLS;
  const cubbyH = SHELF_BOUNDS.h / SHELF_ROWS;
  const cubbies: Surface[] = [];
  for (let r = 0; r < SHELF_ROWS; r++) {
    for (let c = 0; c < SHELF_COLS; c++) {
      cubbies.push({
        id: `shelf-r${r}c${c}`,
        label: `high shelf — row ${r + 1}, col ${c + 1}`,
        x: SHELF_BOUNDS.x + c * cubbyW,
        y: SHELF_BOUNDS.y + r * cubbyH,
        w: cubbyW,
        h: cubbyH,
        gridded: true,
      });
    }
  }
  return cubbies;
}

const SHELF_CUBBIES: Surface[] = buildShelfCubbies();

/**
 * Pre-authoring guesses (shipped before G14 closed), kept ONLY as a fallback
 * for a caller that has no `decor-surfaces.json` HOME data to hand (e.g. a
 * test constructing `Decor` directly). `table` has no entry here — it did
 * not exist before this authoring pass, and inventing a guessed rect for it
 * would be exactly the fabricated-data-model trap (ui-builder.md's "never
 * fake a data model"): better to omit the surface than draw a hotspot over
 * nothing real. Once real HOME data is passed in, this map is never
 * consulted.
 */
const LEGACY_FALLBACK: Record<string, RegionRect> = {
  sill: { x: 0.02, y: 0.44, w: 0.12, h: 0.08 },
  chest: { x: 0.70, y: 0.28, w: 0.13, h: 0.07 },
  counter: { x: 0.78, y: 0.60, w: 0.18, h: 0.08 },
  floor: { x: 0.20, y: 0.72, w: 0.20, h: 0.10 },
};

const NON_SHELF_SURFACE_META: readonly { id: string; label: string }[] = [
  { id: "sill", label: "window sill" },
  { id: "table", label: "desk" },
  { id: "chest", label: "chest top" },
  { id: "counter", label: "counter" },
  { id: "floor", label: "by the door" },
];

/**
 * Build the Home Hub's surface list: the five non-shelf surfaces from
 * `homeRegions` (pass `run.decorSurfaces.HOME`) — none of them `gridded`,
 * all free-drag per the §8 ruling — plus the sixteen hardcoded shelf cubbies
 * (`SHELF_CUBBIES`, all `gridded`). A non-shelf surface with neither
 * authored geometry nor a legacy fallback (only possible for `table` today)
 * is omitted rather than given a fabricated rect.
 */
export function buildHomeSurfaces(homeRegions?: Record<string, RegionRect>): Surface[] {
  const rects = homeRegions ?? {};
  const nonShelf: Surface[] = [];
  for (const { id, label } of NON_SHELF_SURFACE_META) {
    const r = rects[id] ?? LEGACY_FALLBACK[id];
    if (!r) continue;
    nonShelf.push({ id, label, x: r.x, y: r.y, w: r.w, h: r.h });
  }
  return [...nonShelf, ...SHELF_CUBBIES];
}

export interface Placement {
  /** Unique per placed piece — the same item may be placed more than once. */
  uid: string;
  itemId: string;
  /** Fractions of the backdrop, so placements survive any canvas size. */
  x: number;
  y: number;
  scale: number;
  flipped: boolean;
  /** Which authored surface holds it — set whenever the placement landed on
   * ANY surface (gridded or free), not only a gridded one; only a gridded
   * surface's id is ever exclusive (see `Surface.gridded`, `occupant`). */
  surfaceId?: string;
}

const STORAGE_KEY = "phaser-probe/decor/v1";
/** Placements land on this grid. Loose enough to feel free, tight enough to
 *  keep a shelf looking like a shelf. */
const GRID = 16 / 1080;

export class Decor {
  private placements: Placement[] = [];
  private seq = 0;

  /** This instance's surface list — built once at construction from whatever
   * `homeRegions` the caller had (`run.regions.HOME`), so every consumer
   * (surface drawing, `surfaceAt`, the `__hub.surfaces()` probe handle) reads
   * the same authored geometry instead of a module-level constant. */
  private readonly surfaceList: Surface[];

  /**
   * Banked-at-home stock, id → how many copies are actually banked.
   *
   * `PlayView.banked` is one entry per physical copy — two river stones
   * banked is two entries — so counting it gives a real inventory. Undefined
   * means "no stock model," which is the old infinite-palette sandbox and
   * still what the unit tests and the `__hub` debug handle run on.
   *
   * These are QUERIES ONLY. `place`/`placeOnSurface` stay permissive on
   * purpose: the palette is what draws down (`HubScene.drawPalette`,
   * `HubShelfScene.drawPalette`), and `Decor` stays the placement model
   * rather than becoming a second inventory authority. Both Hub views share
   * ONE `Decor` instance (see `HubScene.openShelfCloseUp`), so hanging the
   * stock here is also what stops the shelf close-up from being a back door
   * around the room view's draw-down.
   */
  private stock?: Map<string, number>;

  /**
   * Fired after every write to the storage key — see `save()`.
   *
   * WHY THIS EXISTS (Roc, 2026-08-23: "it is not saving what is stored in a
   * shelf location between screens"). This class already persisted on its own:
   * `save()` rewrites `phaser-probe/decor/v1` on every change, and a `Decor`
   * rebuilt later reads it straight back — which is why leaving the shelf
   * close-up, or the whole Home Hub, and coming back inside one session always
   * worked. What it could not do was tell the SAVE FILE anything had happened.
   *
   * `DecorSlice` copies this key into the slot at capture time, and capture
   * only runs when the autosave fires — bound to `screen:changed`,
   * `item:acquired` and `gate:cleared` (`mode/modes.ts`). Decorating is none of
   * those. So a shelf filled after the last screen change sat in the slot as
   * `{"raw":null}`, and the next resume ran `DecorSlice.restore(null)`, which
   * REMOVES the key: the placements were not merely unsaved, the load deleted
   * them. Measured against a real run before the fix — `.playtest/t3-repro`.
   *
   * A callback, not a new event type: `world/` owns no bus, and the only
   * listener is the scene that built this instance. `HubScene` hands
   * `CollectScene`'s "capture the save now" down; a caller with no save layer
   * (the standalone scene, the `__hub` debug handle, tests) passes nothing and
   * behaves exactly as before.
   */
  private readonly onChange?: () => void;

  constructor(
    private mode: HubMode = "home",
    homeRegions?: Record<string, RegionRect>,
    banked?: readonly string[],
    onChange?: () => void,
  ) {
    this.onChange = onChange;
    this.surfaceList = buildHomeSurfaces(homeRegions);
    if (banked) {
      this.stock = new Map();
      for (const id of banked) this.stock.set(id, (this.stock.get(id) ?? 0) + 1);
    }
    this.load();
  }

  /**
   * Re-seed the banked stock in place. **Debug seam only** — the real stock
   * arrives through the constructor from `PlayView.banked`, and nothing in
   * the game calls this. It exists because the project's verification
   * standard is a real screenshot (`CONTEXT.md`), and a `banked` palette is
   * empty until a day actually ends at home: a playtest scenario would
   * otherwise have to play most of a week before it could photograph the
   * draw-down. Reached through `HubScene`'s `__hub` handle, same as every
   * other probe read there.
   */
  setBankedForDebug(banked: readonly string[]): void {
    this.stock = new Map();
    for (const id of banked) this.stock.set(id, (this.stock.get(id) ?? 0) + 1);
  }

  /** Whether this instance draws from real banked stock at all. False is the
   * ungated sandbox — every collectible, infinite copies. */
  get stockLimited(): boolean {
    return this.stock !== undefined;
  }

  /** How many copies of `itemId` are banked at home. 0 when unbanked, and 0
   * for everything when there is no stock model — callers gate on
   * `stockLimited` first. */
  bankedTotal(itemId: string): number {
    return this.stock?.get(itemId) ?? 0;
  }

  /** How many placements currently spend `itemId`. */
  placedCount(itemId: string): number {
    return this.placements.filter((p) => p.itemId === itemId).length;
  }

  /**
   * Copies of `itemId` still available to place — `Infinity` with no stock
   * model. Derived, never stored: removing a piece hands its copy straight
   * back, so there is no second number that can drift out of step with
   * `placements`.
   */
  remaining(itemId: string): number {
    if (!this.stock) return Infinity;
    return Math.max(0, this.bankedTotal(itemId) - this.placedCount(itemId));
  }

  /** The authored surfaces this instance was built with. */
  surfaces(): readonly Surface[] {
    return this.surfaceList;
  }

  /** The surface under a point, if any — gridded (shelf cubby) or free. */
  surfaceAt(x: number, y: number): Surface | undefined {
    return this.surfaceList.find(
      (s2) => x >= s2.x && x <= s2.x + s2.w && y >= s2.y && y <= s2.y + s2.h,
    );
  }

  /**
   * The placement occupying a surface, if any. Exclusivity (one occupant,
   * full stop) is only actually enforced for a `gridded` surface — see
   * `place`/`placeOnSurface`/`moveTo` — but the lookup itself is generic:
   * a free surface can legitimately have more than one placement tagged with
   * its id (the sill's three pots), and this returns whichever comes first.
   */
  occupant(surfaceId: string): Placement | undefined {
    return this.placements.find((p) => p.surfaceId === surfaceId);
  }

  getMode(): HubMode {
    return this.mode;
  }

  setMode(mode: HubMode): void {
    this.mode = mode;
  }

  /** Meta-hub pieces are display-only — they cannot be moved or withdrawn. */
  get editable(): boolean {
    return this.mode === "home";
  }

  all(): readonly Placement[] {
    return this.placements;
  }

  static snap(v: number): number {
    return Math.round(v / GRID) * GRID;
  }

  /**
   * Drop `itemId` at a point in THIS view's coordinate space — the room
   * view's drag gesture. Per-surface, not scene-wide (§8, decided revision
   * 4): landing on a `gridded` surface (a shelf cubby) is exclusive and
   * snaps to that cubby's center, refusing if it's already occupied; landing
   * anywhere else — a free surface or open backdrop alike — is an ordinary
   * free-drag drop, snapped to the soft placement grid, never refused for
   * being outside a surface. `placeOnSurface` is the coordinate-free sibling
   * for a view (the shelf close-up) that already knows which surface it
   * means and shouldn't have to fake an x/y to say so.
   */
  place(itemId: string, x: number, y: number): Placement | null {
    if (!this.editable) return null;

    const surface = this.surfaceAt(x, y);
    if (surface?.gridded) return this.placeOnSurface(itemId, surface.id);

    const p: Placement = {
      uid: `p${++this.seq}`,
      itemId,
      x: Decor.snap(x),
      y: Decor.snap(y),
      scale: 1,
      flipped: false,
      surfaceId: surface?.id,
    };
    this.placements.push(p);
    this.save();
    return p;
  }

  /**
   * Place `itemId` directly onto a known surface id — no x/y at all. This is
   * what a view with its own rect table (the shelf close-up, or a future
   * one) calls: it already knows the player clicked cubby `shelf-r1c2`, and
   * translating that back into a fake point in ANOTHER view's coordinate
   * space is exactly the shared-math trap the two-views note warns against.
   * Exclusive — refuses if the surface doesn't exist or already has an
   * occupant, gridded or not (a free surface's own caller is expected to
   * enforce whatever policy it wants; this method's contract is "one
   * surface, one placement," full stop).
   */
  placeOnSurface(itemId: string, surfaceId: string): Placement | null {
    if (!this.editable) return null;
    const surface = this.surfaceList.find((s2) => s2.id === surfaceId);
    if (!surface || this.occupant(surface.id)) return null;

    const p: Placement = {
      uid: `p${++this.seq}`,
      itemId,
      x: surface.x + surface.w / 2,
      y: surface.y + surface.h / 2,
      scale: 1,
      flipped: false,
      surfaceId: surface.id,
    };
    this.placements.push(p);
    this.save();
    return p;
  }

  /** Move an existing placement to a point in THIS view's coordinate space —
   * same per-surface resolution as `place`: onto a `gridded` surface snaps
   * exclusively (refusing, i.e. snapping back, if another placement already
   * holds it), anywhere else is a free-drag move, snapped to the grid. */
  moveTo(uid: string, x: number, y: number): void {
    if (!this.editable) return;
    const p = this.placements.find((q) => q.uid === uid);
    if (!p) return;

    const surface = this.surfaceAt(x, y);
    if (surface?.gridded) {
      const taken = this.occupant(surface.id);
      // Snap back rather than drop loose — a gridded surface that sometimes
      // takes a free drop isn't gridded.
      if (taken && taken.uid !== uid) return;
      p.surfaceId = surface.id;
      p.x = surface.x + surface.w / 2;
      p.y = surface.y + surface.h / 2;
      this.save();
      return;
    }

    p.surfaceId = surface?.id;
    p.x = Decor.snap(x);
    p.y = Decor.snap(y);
    this.save();
  }

  remove(uid: string): void {
    if (!this.editable) return;
    this.placements = this.placements.filter((p) => p.uid !== uid);
    this.save();
  }

  flip(uid: string): void {
    if (!this.editable) return;
    const p = this.placements.find((q) => q.uid === uid);
    if (!p) return;
    p.flipped = !p.flipped;
    this.save();
  }

  resize(uid: string, delta: number): void {
    if (!this.editable) return;
    const p = this.placements.find((q) => q.uid === uid);
    if (!p) return;
    p.scale = Math.min(2.5, Math.max(0.4, p.scale + delta));
    this.save();
  }

  /**
   * What a new life does to the in-game home: empties it.
   * `gdd/08-levels.md` — "It resets empty at the start of each new life."
   * The meta-hub record is untouched, which is the distinction being probed.
   */
  resetForNewLife(): void {
    this.placements = [];
    this.save();
  }

  clear(): void {
    this.placements = [];
    this.save();
  }

  private save(): void {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ placements: this.placements, seq: this.seq }),
      );
    } catch {
      /* private-mode or quota — the probe is not worth failing over */
    }
    // OUTSIDE the try: a listener throwing is the listener's bug, not a
    // storage failure, and swallowing it here would hide it. Fired after the
    // write, never before, so whatever the listener reads back off the key is
    // the state it is being told about.
    this.onChange?.();
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as { placements?: Placement[]; seq?: number };
      this.placements = data.placements ?? [];
      this.seq = data.seq ?? this.placements.length;
    } catch {
      this.placements = [];
    }
  }
}
