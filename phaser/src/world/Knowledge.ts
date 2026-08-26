/**
 * What the player knows.
 *
 * `gdd/04-magic-system.md`: "A spellbook section in the notebook records the
 * spells you have learned. You learn them by successfully casting them once."
 * And: "Seeing a neighbor cast on a target gives a clue, not the spell; you
 * confirm by trying it yourself or talking to them."
 *
 * So there are two states, not one — SEEN (a clue) and LEARNED (confirmed by
 * doing) — and only the second belongs in the spellbook.
 *
 * Host-side, deliberately. Ink's `KnownPhrases` LIST holds narrative facts
 * (`shelf_seen`, `tavern_tab`) and contains no spell phrase at all, so writing
 * spells into it would give one list two meanings. The notebook reads both and
 * shows them apart.
 */

export class Knowledge {
  private readonly learned = new Set<string>();
  private readonly seen = new Set<string>();

  /** A cast that physically did something. This is the confirming act. */
  learn(spellId: string): boolean {
    this.seen.add(spellId);
    if (this.learned.has(spellId)) return false;
    this.learned.add(spellId);
    return true;
  }

  /** A clue — witnessed, or tried without effect. Not the spell itself. */
  see(spellId: string): void {
    this.seen.add(spellId);
  }

  knows(spellId: string): boolean {
    return this.learned.has(spellId);
  }

  hasSeen(spellId: string): boolean {
    return this.seen.has(spellId);
  }

  spellbook(): string[] {
    return [...this.learned].sort();
  }

  clues(): string[] {
    return [...this.seen].filter((s) => !this.learned.has(s)).sort();
  }
}
