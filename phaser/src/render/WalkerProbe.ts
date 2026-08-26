/**
 * Responsibility 8 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 6): `exposeForWalker`.
 *
 * Same purpose as `ScreenScene`'s own `window.__probe`: a live handle for
 * headless driving. Deliberately named `__collect`, not `__probe` — modes
 * 1-3 must still run after every Wave 1/2 extraction, and the walker drives
 * mode 1 only (`tests/characterization/ProbeContract.test.ts`, "names the
 * mode-2 probe separately, so the two never collide").
 *
 * `ScreenScene`'s and `CastScene`'s own probes (`__probe`, `__cast`) are OUT
 * OF SCOPE here — modes 1-3 are untouched by this whole plan. This class
 * exists only to carry `CollectScene`'s `__collect`, whose shape is unrelated
 * to those two.
 *
 * This is a facade over nearly every other system in the scene, which is
 * expected — a probe's whole job is to publish what a headless driver needs,
 * and that driver exercises the scene end to end.
 */

import type { InkBridge } from "../ink/InkBridge";
import type { Knowledge } from "../world/Knowledge";
import type { Cast } from "../world/Cast";
import type { Inventory } from "../world/Inventory";
import type { NpcTalkSystem } from "./NpcTalkSystem";
import type { HotspotSystem } from "./HotspotSystem";

export interface WalkerProbeDeps {
  readonly ink: InkBridge;
  readonly knowledge: Knowledge;
  readonly cast: Cast;
  readonly inventory: Inventory;
  readonly npcTalk: NpcTalkSystem;
  readonly hotspotSys: HotspotSystem;
  /** The scene's own last-drawn screen — see `CollectScene`'s
   * `pendingRestoredScreen` header for why this differs from ink's own
   * report right after a save load. */
  readonly currentScreenId: () => string | null;
  /** Legacy-hedge's local flag (modes 2-3 only) — read live, since it
   * mutates over the life of the scene. */
  readonly hedgeCleared: () => boolean;
  readonly hubEnabled: boolean;
  readonly openHedgePrompt: () => void;
  readonly openNotebook: () => void;
  readonly openCalendar: () => void;
  readonly openHub: () => void;
  /**
   * Festival scoring's one read (T9), published for headless verification.
   *
   * THIS IS THE ONLY PLACE THE RAW COUNTS ARE READABLE, and it is a probe, not
   * UI. "Never a score shown" (`gdd/03-core-loop.md`) governs what a PLAYER
   * sees; a verifier still has to be able to check that two goals really did
   * produce Warm and that talking to Toby six times on one day counted once.
   * `render/FestivalResults.ts` is what the player gets, and it prints no
   * number at all.
   */
  readonly festival: () => unknown;
}

export class WalkerProbe {
  constructor(private readonly deps: WalkerProbeDeps) {}

  /** Installs `window.__collect`. */
  expose(): void {
    const { ink, knowledge, cast, inventory, npcTalk, hotspotSys } = this.deps;
    (window as unknown as Record<string, unknown>).__collect = {
      snapshot: () => {
        const v = ink.view();
        return {
          day: v.day,
          timeBlock: v.timeBlock,
          movesLeft: v.movesLeft,
          screen: v.pos.currentScreen,
          // The backdrop actually drawn, not ink's own report — see this
          // class's `currentScreenId` dep header.
          drawnScreen: this.deps.currentScreenId(),
          choices: v.choices.map((c) => ({ index: c.index, kind: c.kind, display: c.display })),
          canContinue: v.canContinue,
          ended: v.ended,
          satchel: [...v.satchel],
          spellbook: knowledge.spellbook(),
          clues: knowledge.clues(),
          hedgeCleared: this.deps.hedgeCleared(),
        };
      },
      choose: (i: number) => {
        ink.choose(i);
        ink.runToChoice();
      },
      advance: () => ink.advance(),
      forage: () => {
        const v = ink.view();
        const screen = v.pos.currentScreen;
        if (!screen) return [];
        return hotspotSys.offeredSlots(screen, v.day, v.timeBlock, v.pickedSlots);
      },
      pickup: (slotId: string, item: string) => {
        const ok = ink.player.pickup(slotId, item);
        ink.refresh();
        return ok;
      },
      cast: () => {
        const v = ink.view();
        const screen = v.pos.currentScreen;
        if (!screen) return [];
        return cast.presentOn(screen, ink.player.peekVars(cast.souls.map((s) => `present_${s}`)));
      },
      openNpcSpells: (soul: string) => {
        const role = npcTalk.roleFor(soul);
        if (role) npcTalk.openNpcSpells(soul, role);
      },
      openHedgePrompt: () => this.deps.openHedgePrompt(),
      openNotebook: () => this.deps.openNotebook(),
      openCalendar: () => this.deps.openCalendar(),
      openHub: this.deps.hubEnabled ? () => this.deps.openHub() : undefined,
      festival: () => this.deps.festival(),
      seeSpell: (id: string) => knowledge.see(id),
      inventoryHeld: () => inventory.availableOn(null),
      discoveredIds: () => inventory.discoveredIds(),
    };
  }
}
