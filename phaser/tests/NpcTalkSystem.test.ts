/**
 * `NpcTalkSystem`, mounted not shelved — mode5 plan step 2.
 *
 * `"npc-talk"` sits in `COLLECT`/`DISCOVER_HOME`/`MODE5`'s `systems` array
 * already, but until this step nothing backed it: `drawCast`, `openNpcSpells`,
 * `pickNpcSpells`, `shareClueOnFirstTalk` and `roleFor` were five private
 * methods inline on `CollectScene`, not a system anything could point to. A
 * descriptor field with no class behind it is exactly Mode 4's original
 * defect (the plan's own opening example), so this is asserted from the
 * source text, same technique as the VFX/save/dialogue mount tests — a
 * Phaser scene cannot be imported into vitest.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const readText = (p: string) => fs.readFileSync(path.join(here, "..", p), "utf8");

describe("NpcTalkSystem is mounted, not shelved", () => {
  const npcTalk = readText("src/render/NpcTalkSystem.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns the five extracted methods", () => {
    expect(npcTalk).toContain("class NpcTalkSystem");
    for (const method of ["drawCast", "openNpcSpells", "pickNpcSpells", "shareClueOnFirstTalk", "roleFor"]) {
      expect(npcTalk).toContain(`${method}(`);
    }
  });

  it("CollectScene constructs it and delegates, rather than duplicating the methods", () => {
    expect(collectScene).toContain("new NpcTalkSystem(");
    expect(collectScene).toContain("this.npcTalk.drawCast(");
    // `roleFor(` itself is called from `WalkerProbe.ts` now (mode5 plan
    // step 6, the walker probe's own `openNpcSpells:` method) rather than
    // directly in CollectScene.
    const walkerProbe = readText("src/render/WalkerProbe.ts");
    expect(walkerProbe).toContain("npcTalk.roleFor(");
    // THE MIRROR. The methods must actually be GONE from CollectScene, not
    // just duplicated alongside the extracted copy — a class name matching
    // `private drawCast(` etc. immediately after `new NpcTalkSystem(` would
    // read as delegation while quietly running two copies.
    for (const method of ["private drawCast(", "private openNpcSpells(", "private pickNpcSpells(", "private shareClueOnFirstTalk(", "private roleFor("]) {
      expect(collectScene).not.toContain(method);
    }
  });

  it("the spell-clue modal is its own system now (ModalFrame, mode5 plan step 6) — NpcTalkSystem still takes it as an injected ModalHost, not a duplicate", () => {
    // `modalFrame`/`clearModal`/`closeButton`/`componentHint` were
    // responsibility 5, extracted whole into `render/ModalFrame.ts`.
    // NpcTalkSystem never implemented them itself — it declared the
    // `ModalHost` interface and took an injected instance, which is why this
    // file needed no change at all when the concrete implementation moved.
    const modalFrame = readText("src/render/ModalFrame.ts");
    expect(modalFrame).toContain("modalFrame(title");
    expect(modalFrame).toContain("componentHint(spell");
    expect(npcTalk).toContain("interface ModalHost");
    expect(npcTalk).not.toContain("this.add.rectangle(W / 2, H / 2, 900");
    expect(collectScene).toContain("modal: this.modalSys");
    expect(collectScene).not.toContain("modalFrame(title");
  });
});
