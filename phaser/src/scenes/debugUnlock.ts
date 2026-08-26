import type Phaser from "phaser";
import type { MagicDB } from "../magic/CastResolver";
import type { Knowledge } from "../world/Knowledge";
import type { Inventory } from "../world/Inventory";
import type { Gates } from "../world/Gates";
import type { GateEngine } from "../world/gates/GateEngine";

/**
 * The DEV-only mode-5 unlock affordance, kept OUT of `CollectScene` so the
 * scene's SRP line-count gate is not spent on a debug tool (mode5 plan step 7).
 *
 * One button + `U` key that unlocks three things independently:
 *   - spells:  learn every approved spell (the spellbook then offers all)
 *   - casting: grantAllMaterials gives reach, so any spell is castable
 *   - screens: debugForceCleared opens every gate INCLUDING unsatisfiable ones
 *              (e.g. `G-F5-cascade`, which the Cave/F7 needs alongside
 *              `G-F7-light` — the reason glimmer alone never opens it).
 *
 * The caller guards on `import.meta.env.DEV` and `mode.id === "mode5"`, so this
 * is stripped from a production build and only shows in mode 5.
 */
export interface DebugUnlockDeps {
  scene: Phaser.Scene;
  magic: MagicDB;
  knowledge: Knowledge;
  inventory: Inventory;
  gates: Gates;
  gateEngine: () => GateEngine | null;
  rerender: () => void;
}

/**
 * Wire the `U` unlock key and hand back the HUD button spec, so the caller can
 * place it inside the shared nav `buttonRow` rather than at a hand-tuned x —
 * the dev button then packs into the same tidy row as the real ones.
 */
export function mode5DebugUnlockButton(d: DebugUnlockDeps): { label: string; onClick: () => void } {
  const unlockAll = () => {
    for (const s of d.magic.spells) d.knowledge.learn(s.spell_id);
    d.inventory.grantAllMaterials();
    const engine = d.gateEngine();
    if (engine) {
      const allGateIds = new Set<string>();
      for (const req of d.gates.requirements.values())
        for (const g of req.gateIds) allGateIds.add(g);
      engine.debugForceCleared(allGateIds);
    }
    d.rerender();
  };
  d.scene.input.keyboard?.on("keydown-U", unlockAll);
  return { label: "[ Dev Unlock — U ]", onClick: unlockAll };
}
