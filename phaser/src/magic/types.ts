/**
 * Types read directly off the real content records — see
 * `content/magic/ignite.json` and `content/items/item_sticks.json`.
 * Nothing here is invented; if a field is optional it is because the records
 * disagree, not because we guessed.
 */

export type ReceiverClass = "inert" | "stateful" | "creature" | "soul";

export interface Receiver {
  receiver_class: ReceiverClass;
  receiver_id: string;
  /** Authored prose. Rendered verbatim — never templated around. */
  physical_outcome: string;
  /** `null` is authored content meaning "renders nothing", not "unknown". */
  reaction_kind: string | null;
  /**
   * item_ids this receiver mints, OVERRIDING the spell-level `produces` when a
   * cast lands on it (option A, ruled by Roc 2026-08-19). Absent — the common
   * case — means the cast mints the spell's default `produces`. Present means
   * this pairing makes something different: `ignite × river_stone` mints
   * `item_heated_stone`, while `ignite × everything-else` still mints
   * `item_flame`. This is what lets a chain step bind to the RECEIVER'S product
   * rather than the spell's default — see `CastResolver.resolveCast` and
   * `GateEvaluator.bindingOf`.
   */
  produces?: string[];
}

export interface SpellRecord {
  spell_id: string;
  phrase: string;
  role: string;
  status: "approved" | "rejected";
  /** item_ids. ALL are required for the cast to take. */
  components: string[];
  /** item_ids minted into the world on a landed cast. */
  produces: string[];
  learn_source: string;
  confirm_action: string;
  /** Prose about quality. Never gates whether a cast is possible. */
  mana_effect: string;
  unlocks: {
    screen: string | null;
    obstacle: string | null;
    witnessable_cast: string | null;
  };
  receivers: Receiver[];
}

export type ItemCategory =
  | "component"
  | "made"
  | "memento"
  | "gift"
  | "sound"
  | "tool";

/** GDD 05-collectibles.md — the three persistence classes. */
export type Persistence = "pack-triaged" | "free" | "world";

export interface ItemRecord {
  item_id: string;
  description: string;
  category: ItemCategory;
  persistence: Persistence;
  collectible: boolean;
  consumable: boolean;
  source_locations: string[];
  always_available: boolean;
  used_by: string[];
  produced_by: string[];
  use_family: string | null;
}
