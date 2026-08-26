/**
 * Who is standing on this screen, and whether they can actually be talked to.
 *
 * Two facts that are easy to conflate and must not be:
 *
 *   PRESENT — `present_<soul>` says the soul is on this screen. Set by the
 *             resolver's day file via `LanternPlayer.applyPresence`.
 *   SCENED  — a scene is authored for that soul ON that screen, so ink's hub
 *             offers a "Talk to" option.
 *
 * They disagree, badly. 102 of 121 placements across the week put a soul on a
 * screen with nothing authored for them (`npm run presence`). Presence is
 * correct; the content simply is not there. Showing a portrait for a present
 * soul and saying plainly that there is nothing to say is more honest than
 * hiding them — and it is what makes the gap visible in play rather than only
 * in a report. See GAPS.md G15.
 */

import type { Graph } from "@lantern/types";

/**
 * Souls with portrait art. `nell` and `linnet` have none yet — everyone else
 * does, regardless of whether they have an authored scene (a present soul
 * with no scene still gets a portrait; see the file header).
 */
export const CAST_PORTRAIT_SOULS = ["bex", "ilsa", "juno", "mara", "pip", "toby"] as const;
const PORTRAITS = new Set<string>(CAST_PORTRAIT_SOULS);

export interface SoulOnScreen {
  soul: string;
  /** A scene is authored for this soul on this screen. */
  scened: boolean;
  /** Portrait art exists. */
  hasPortrait: boolean;
}

export class Cast {
  /** soul -> screens with an authored scene. */
  private readonly scenes = new Map<string, Set<string>>();
  readonly souls: string[];

  constructor(graph: Graph) {
    for (const sc of graph.scenes ?? []) {
      if (!sc.soul || !sc.screen_id) continue;
      if (!this.scenes.has(sc.soul)) this.scenes.set(sc.soul, new Set());
      this.scenes.get(sc.soul)!.add(sc.screen_id);
    }
    this.souls = (graph.souls ?? []).map((s) =>
      typeof s === "string" ? s : String((s as { soul_id?: string }).soul_id ?? s),
    );
  }

  hasScene(soul: string, screenId: string): boolean {
    return this.scenes.get(soul)?.has(screenId) ?? false;
  }

  screensFor(soul: string): string[] {
    return [...(this.scenes.get(soul) ?? [])].sort();
  }

  /** Full-body crop — the small HUD cast row. */
  portraitKey(soul: string): string | null {
    return PORTRAITS.has(soul) ? `cast:${soul}` : null;
  }

  /** Bust crop — the larger VN conversation sprite. */
  bustPortraitKey(soul: string): string | null {
    return PORTRAITS.has(soul) ? `cast:${soul}:bust` : null;
  }

  /**
   * Who is here, from the `present_<soul>` VARs ink owns.
   *
   * Scened souls come first so a screen with one real conversation does not
   * bury it behind four people who cannot speak.
   */
  presentOn(screenId: string, presence: Record<string, unknown>): SoulOnScreen[] {
    const here: SoulOnScreen[] = [];
    for (const soul of this.souls) {
      const at = presence[`present_${soul}`];
      if (at === null || at === undefined) continue;
      if (String(at) !== screenId) continue;
      here.push({
        soul,
        scened: this.hasScene(soul, screenId),
        hasPortrait: PORTRAITS.has(soul),
      });
    }
    return here.sort(
      (a, b) => Number(b.scened) - Number(a.scened) || a.soul.localeCompare(b.soul),
    );
  }
}
