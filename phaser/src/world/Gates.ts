/**
 * Screen locks, and what clears them.
 *
 * WHO OWNS THIS. Ink does, and this file does not change that. `graph.json`
 * carries `status: "locked(G-F5-cascade, G-F7-light)"`, the gate archetypes are
 * authored, and the `= hub` weave in `world/*.ink` is what offers each
 * `[Go to X]`. The host resolves the CAST; ink owns TRAVERSAL. Two writers to
 * one fact is the thing `play.ts:bindExternals` already refuses to do with
 * `KnownPhrases`.
 *
 * WHAT IS ACTUALLY ENFORCED TODAY: nothing. The emitted move is
 *
 *     + {movesLeft > 0 && TimeOfDay != night} [Go to The Cave] #lock:locked(...)
 *
 * The condition never mentions a gate — `#lock:` is advisory metadata that
 * Lantern renders as a badge and lets the player walk straight through. So
 * every locked screen is reachable right now.
 *
 * WHY THE MIRROR CANNOT BE BUILT YET: mirroring gate state into ink needs a
 * variable in `state.ink`, which is the single declaration site and is
 * generated ("A LIST or VAR declared anywhere else is a defect"). No such
 * variable exists, and ink LISTs cannot gain members at runtime. So this file
 * models the gate state host-side and enforces it in the presentation layer —
 * which proves the mechanic and produces the exact emitter change needed, but
 * is explicitly NOT the shipping ownership. See the README for that diff.
 */

import type { Graph } from "@lantern/types";

export interface GateRequirement {
  screenId: string;
  screenName: string;
  gateIds: string[];
}

/** `locked(G-F5-cascade, G-F7-light)` -> ["G-F5-cascade", "G-F7-light"] */
export function parseLock(status: string | undefined): string[] {
  const m = /^locked\((.+)\)$/.exec((status ?? "").trim());
  if (!m) return [];
  return m[1]
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export class Gates {
  /** screen_id -> gate ids that must be cleared to enter. */
  readonly requirements = new Map<string, GateRequirement>();
  /** Screen display name -> screen id, for matching `[Go to <name>]`. */
  private readonly byName = new Map<string, string>();
  /** Screen id -> display name, the reverse of `byName` — for the HUD header,
   * which holds an id (`F1`) and wants the authored name ("Forager's Clearing"). */
  readonly nameById = new Map<string, string>();
  private readonly cleared = new Set<string>();
  /** Gate id -> the human reason it exists, straight from the graph. */
  readonly reasons = new Map<string, string>();

  constructor(graph: Graph) {
    for (const s of graph.screens ?? []) {
      const gateIds = parseLock(s.status);
      this.byName.set(s.name, s.screen_id);
      this.nameById.set(s.screen_id, s.name);
      if (gateIds.length) {
        this.requirements.set(s.screen_id, {
          screenId: s.screen_id,
          screenName: s.name,
          gateIds,
        });
      }
      for (const g of s.gates ?? []) {
        if (g.gate_id) this.reasons.set(g.gate_id, String(g.five_field_ref ?? ""));
      }
    }
  }

  screenIdForName(name: string): string | undefined {
    return this.byName.get(name);
  }

  /** The authored display name for a screen id — the HUD header's use. Falls
   * back to the id when unknown, or "—" when there is no screen yet. */
  nameOf(id: string | null | undefined): string {
    if (!id) return "—";
    return this.nameById.get(id) ?? id;
  }

  isCleared(gateId: string): boolean {
    return this.cleared.has(gateId);
  }

  clear(gateId: string): void {
    this.cleared.add(gateId);
  }

  clearedGates(): string[] {
    return [...this.cleared].sort();
  }

  /** Gates still standing between the player and this screen. */
  blocking(screenId: string): string[] {
    const req = this.requirements.get(screenId);
    if (!req) return [];
    return req.gateIds.filter((g) => !this.cleared.has(g));
  }

  /** Resolve a `[Go to <name>]` choice to the gates still blocking it. */
  blockingForMoveText(display: string): { screenId: string; gates: string[] } | null {
    const m = /(?:Go to|Begin at)\s+(.+?)\]?$/.exec(display.replace(/^\[|\]$/g, ""));
    if (!m) return null;
    const id = this.byName.get(m[1].trim());
    if (!id) return null;
    const gates = this.blocking(id);
    return gates.length ? { screenId: id, gates } : null;
  }
}
