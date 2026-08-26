/**
 * The spellbook and the clues, saved apart because they mean different things.
 *
 * `Knowledge` models two states, not one (`gdd/04-magic-system.md`): SEEN is a
 * clue — you watched a neighbour, or you tried the phrase and it landed with no
 * effect — and LEARNED is confirmation by doing. Only the second is in the
 * spellbook, and collapsing them on save would hand the player spells they were
 * only ever shown. Under the 2026-08-17 ruling that collect-mode casting teaches
 * nothing, that distinction is the mode's whole progression.
 *
 * `learned` is a subset of `seen`, so `seen` is written whole and the restore
 * replays `see()` for the clues and `learn()` for the spellbook. `learn()` also
 * marks a spell seen, so order does not matter — but the file keeps both lists
 * in full rather than storing a difference, because a difference is a thing a
 * later reader can misinterpret.
 */

import { isRecord, isStringArray, type CheckedSaveSlice } from "../CheckedSaveSlice";
import type { JsonValue, SliceRestoreDefect } from "../SaveSlice";

/** The slice of `Knowledge` this needs. `Knowledge` satisfies it structurally. */
export interface KnowledgePort {
  /** Confirmed spells, sorted. */
  spellbook(): string[];
  /** Seen but not confirmed, sorted. */
  clues(): string[];
  learn(spellId: string): boolean;
  see(spellId: string): void;
}

/**
 * A type alias, not an interface, on purpose: TypeScript gives implicit index
 * signatures to aliases and not to interfaces, so only this form satisfies
 * `JsonValue`. Every slice payload in this folder is written the same way.
 */
export type KnowledgeSaveData = {
  readonly learned: readonly string[];
  readonly seen: readonly string[];
};

export class KnowledgeSlice implements CheckedSaveSlice<KnowledgeSaveData> {
  readonly id = "knowledge" as const;

  constructor(private readonly knowledge: KnowledgePort) {}

  capture(): KnowledgeSaveData {
    const learned = this.knowledge.spellbook();
    return { learned, seen: [...learned, ...this.knowledge.clues()].sort() };
  }

  check(data: JsonValue): SliceRestoreDefect | null {
    if (!isRecord(data)) {
      return { sliceId: this.id, reason: "malformed", detail: "payload is not an object" };
    }
    if (!isStringArray(data.learned) || !isStringArray(data.seen)) {
      return {
        sliceId: this.id,
        reason: "malformed",
        detail: "learned and seen must both be arrays of spell ids",
      };
    }
    return null;
  }

  restore(data: KnowledgeSaveData): void {
    for (const spellId of data.seen) this.knowledge.see(spellId);
    for (const spellId of data.learned) this.knowledge.learn(spellId);
  }
}
