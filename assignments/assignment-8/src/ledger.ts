// The facts ledger. Consistency comes from state-in-context: this whole
// object rides every DM call, so a fact can't drop out of a context window
// if it's re-sent every turn. Nothing is ever deleted from `actions` — it's
// the append-only backbone the DM reacts against.

export interface Ledger {
  player: {
    name: string;
    held: string[];
    spellsCast: string[];
    location: string;
  };
  actions: string[];
  promises: string[];
  maraObserved: string[];
  maraShared: string[];
  helpedWithTonic: boolean;
  touchedTheDrawer: boolean;
  turn: number;
}

export function initialLedger(playerName: string): Ledger {
  return {
    player: {
      name: playerName,
      held: [],
      spellsCast: [],
      location: "mara's stall",
    },
    actions: [],
    promises: [],
    maraObserved: [],
    maraShared: [],
    helpedWithTonic: false,
    touchedTheDrawer: false,
    turn: 0,
  };
}

// A patch is a partial, additive description of what changed this turn.
// Arrays are appended to (never replaced or truncated); scalars and booleans
// overwrite; `player` fields merge shallowly. The extractor produces this
// shape via a forced tool call, so it's already validated JSON.
export interface LedgerPatch {
  playerHeld?: string[];
  playerSpellsCast?: string[];
  playerLocation?: string;
  actions?: string[];
  promises?: string[];
  maraObserved?: string[];
  maraShared?: string[];
  helpedWithTonic?: boolean;
  touchedTheDrawer?: boolean;
}

function appendUnique(existing: string[], additions: string[] | undefined): string[] {
  if (!additions || additions.length === 0) return existing;
  const next = [...existing];
  for (const item of additions) {
    if (!next.includes(item)) next.push(item);
  }
  return next;
}

export function applyPatch(ledger: Ledger, patch: LedgerPatch): Ledger {
  return {
    player: {
      name: ledger.player.name,
      held: appendUnique(ledger.player.held, patch.playerHeld),
      spellsCast: appendUnique(ledger.player.spellsCast, patch.playerSpellsCast),
      location: patch.playerLocation ?? ledger.player.location,
    },
    actions: appendUnique(ledger.actions, patch.actions),
    promises: appendUnique(ledger.promises, patch.promises),
    maraObserved: appendUnique(ledger.maraObserved, patch.maraObserved),
    maraShared: appendUnique(ledger.maraShared, patch.maraShared),
    helpedWithTonic: patch.helpedWithTonic ?? ledger.helpedWithTonic,
    touchedTheDrawer: patch.touchedTheDrawer ?? ledger.touchedTheDrawer,
    turn: ledger.turn + 1,
  };
}

export function printLedger(ledger: Ledger): string {
  const lines = [
    `--- LEDGER (turn ${ledger.turn}) ---`,
    `player: ${ledger.player.name} @ ${ledger.player.location}`,
    `  held: [${ledger.player.held.join(", ")}]`,
    `  spellsCast: [${ledger.player.spellsCast.join(", ")}]`,
    `actions: ${ledger.actions.length ? ledger.actions.join(" | ") : "(none)"}`,
    `promises: ${ledger.promises.length ? ledger.promises.join(" | ") : "(none)"}`,
    `maraObserved: ${ledger.maraObserved.length ? ledger.maraObserved.join(" | ") : "(none)"}`,
    `maraShared: ${ledger.maraShared.length ? ledger.maraShared.join(" | ") : "(none)"}`,
    `helpedWithTonic: ${ledger.helpedWithTonic}  touchedTheDrawer: ${ledger.touchedTheDrawer}`,
    `-----------------------------`,
  ];
  return lines.join("\n");
}
