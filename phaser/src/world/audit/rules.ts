/**
 * Content authored but wired to NOTHING.
 *
 * This is Wave 2 Track G, and it is a SCRIPT rather than a seat for the same
 * reason `content-check.mjs` is: the question "does this authored thing join to
 * anything" has one right answer for a given set of files, so an agent would be
 * re-deriving a decision that a function can just make. `agents/README.md`'s own
 * precedent — "a fourth check is deterministic and is not a seat".
 *
 * WHAT IT IS FOR. `GAPS.md` is a register of things found by *playing*, and
 * five of its entries are the same shape of defect: a record exists, parses
 * fine, is called by the right name in prose, and joins to nothing.
 *
 *   G1  `ignite.unlocks.screen` is "Forest Unlock 1" — no screen carries it
 *   G2  40-odd receivers exist on no screen at all
 *   G5  `G-F4-still` is keyed to `still`, which was REJECTED
 *   G6  8 of 20 screens strand if locks are enforced
 *   G13 forage pool names are not `item_id`s
 *
 * Every one of them is a join that fails silently. None was caught by review,
 * by the type system, or by a test — all five were found by a human walking
 * into them. THIS FILE IS THE ANSWER TO "why did nothing catch that". Each rule
 * below names the GAPS entry it instantiates, so a rule going quiet is a gap
 * closing rather than a rule rotting.
 *
 * PURE. No `fs`, no `fetch`, no Phaser — `src/world/**` may never import the
 * engine, and this folder additionally never touches the disk. The caller reads
 * the files and hands in an `AuditInput`; `tools/content-audit.mjs` is that
 * caller and is the only place a path string appears.
 *
 * NO-EFFECT IS NOT A DEFECT. 31 of 89 authored outcomes resolve as no-effect,
 * and that is the content working. Nothing here counts one, styles one, or
 * reports one. The audit asks whether a record is REACHABLE, never whether its
 * outcome is interesting.
 *
 * WHY THE RECORD SHAPES ARE DECLARED HERE AND NOT IMPORTED FROM
 * `src/magic/types.ts`. That file models what the *app* loads, which is
 * deliberately narrower than what is on disk: the app drops rejected spells
 * (`ItemRecord` has no `status`) and normalises key items onto `item_id`
 * (`loadRun.ts:normalizeKeyItem`), which is exactly the silent-drop the audit
 * has to see through. G5 is a gate keyed to a rejected spell and G10 is the
 * key-item schema divergence — an audit that read the app's normalised view
 * would be structurally unable to find either. So it types the raw files, and
 * only the fields it actually reads.
 */

/* ------------------------------------------------------------------ input */

/** One `receivers[]` entry of a `content/magic/*.json` record. */
export interface AuditReceiver {
  readonly receiver_class: string;
  readonly receiver_id: string;
  /**
   * Where this receiver physically is, IF the content ever gains the field.
   *
   * Zero records carry it today — that absence is G2, and it is what
   * `receiver-unplaced` reports. G2's fix note offers two shapes ("either
   * screens gain a `receivers` array, or receivers gain `locations`"); both are
   * read, so whichever Roc rules the audit goes quiet without an edit here.
   */
  readonly locations?: readonly string[];
}

/** A `content/magic/*.json` record, raw — rejected spells included. */
export interface AuditSpell {
  readonly spell_id: string;
  readonly status: string;
  readonly components?: readonly string[];
  readonly produces?: readonly string[];
  readonly unlocks?: { readonly screen?: string | null };
  readonly receivers?: readonly AuditReceiver[];
}

/** A `content/items/*.json` record, raw. */
export interface AuditItem {
  readonly item_id: string;
  readonly category?: string;
  readonly always_available?: boolean;
  readonly produced_by?: readonly string[];
  readonly used_by?: readonly string[];
  readonly source_locations?: readonly string[];
}

/** A `content/key-items/*.json` record, raw — note `key_item_id` (G10). */
export interface AuditKeyItem {
  readonly key_item_id: string;
  readonly category?: string;
}

/** A `graph.json` screen, only the fields the audit joins on. */
export interface AuditScreen {
  readonly screen_id: string;
  readonly name?: string;
  /** `"start"` · `"hub"` · `"reachable(G-…)"` · `"locked(G-…, G-…)"`. */
  readonly status?: string;
  readonly forage?: readonly string[];
  readonly examinables?: readonly { readonly id?: string }[];
  /** G2's other candidate fix shape. Absent from every screen today. */
  readonly receivers?: readonly string[];
}

/** A `graph.json` scene. */
export interface AuditScene {
  readonly scene_id: string;
  readonly soul?: string;
  readonly screen_id?: string;
}

/** One `day-N.json` `slot_fill` row — where a soul actually stands. */
export interface AuditPlacement {
  readonly soul: string;
  readonly screen_id: string;
}

/**
 * A `gateRules.json` entry, structurally. `null` for the whole table means the
 * file is not on disk yet (Track B owns it) — which is REPORTED as unchecked,
 * never quietly treated as "no defects".
 */
export interface AuditGateRule {
  readonly kind: string;
  readonly spellId?: string;
  readonly receiverId?: string;
  readonly steps?: readonly {
    readonly spellId?: string;
    readonly receiverId?: string;
    readonly requiresHeld?: string;
  }[];
}

export interface AuditInput {
  readonly spells: readonly AuditSpell[];
  readonly items: readonly AuditItem[];
  readonly keyItems: readonly AuditKeyItem[];
  readonly screens: readonly AuditScreen[];
  readonly scenes: readonly AuditScene[];
  readonly placements: readonly AuditPlacement[];
  /** `foragePoolToItem.ts` — pool name -> `item_id`. */
  readonly foragePoolToItem: Readonly<Record<string, string>>;
  /** `collectExtraForage.ts` — screen_id -> extra pool names. */
  readonly extraForagePools: Readonly<Record<string, readonly string[]>>;
  /** `npcItems.ts` — item_ids an NPC hands over. */
  readonly npcGiftItems: readonly string[];
  /** `world/data/gateRules.json`, or `null` when it is not on disk. */
  readonly gateRules: Readonly<Record<string, AuditGateRule>> | null;
  /** The `ItemCategory` union, read off `src/magic/types.ts`. */
  readonly decorationCategories: readonly string[];
}

/* ----------------------------------------------------------------- output */

export type AuditRuleId =
  | "spell-unlocks-nothing"
  | "spell-no-placed-receiver"
  | "receiver-unplaced"
  | "gate-rule-unknown-spell"
  | "gate-rule-rejected-spell"
  | "gate-rule-unknown-receiver"
  | "gate-rule-unauthored-pair"
  | "gate-unclearable"
  | "forage-pool-unjoined"
  | "spell-components-unco-located"
  | "item-unobtainable"
  | "item-unused"
  | "item-behind-its-own-lock"
  | "item-source-not-a-screen"
  | "key-item-uncategorised"
  | "scene-never-placed";

export interface Finding {
  readonly rule: AuditRuleId;
  /** The authored thing that is orphaned — an id, always. */
  readonly subject: string;
  /** Why, in one line. Names the other side of the failed join. */
  readonly detail: string;
}

export interface AuditResult {
  readonly findings: readonly Finding[];
  /**
   * Checks that could not run, and why. A rule that never ran is not a rule
   * that passed — banners in this project have been materially wrong before and
   * cost a session, so an unchecked rule says so out loud.
   */
  readonly unchecked: readonly string[];
  /** Every rule that ran, whether or not it found anything. */
  readonly ran: readonly AuditRuleId[];
}

/* ------------------------------------------------------------------ helpers */

/** Gate ids out of a `locked(G-A, G-B)` status. Only `locked` blocks. */
export function lockedGateIds(status: string | undefined): string[] {
  const m = /^locked\((.+)\)$/.exec((status ?? "").trim());
  return m ? m[1].split(",").map((s) => s.trim()).filter(Boolean) : [];
}

/** Every pool a screen offers, including the mode-local additions. */
function poolsOn(screen: AuditScreen, extra: AuditInput["extraForagePools"]): string[] {
  return [...(screen.forage ?? []), ...(extra[screen.screen_id] ?? [])];
}

/** Spell ids referenced anywhere in one gate rule. */
function spellsNamedBy(rule: AuditGateRule): string[] {
  const out: string[] = [];
  if (rule.spellId) out.push(rule.spellId);
  for (const step of rule.steps ?? []) if (step.spellId) out.push(step.spellId);
  return out;
}

/** Receiver ids referenced anywhere in one gate rule. */
function receiversNamedBy(rule: AuditGateRule): string[] {
  const out: string[] = [];
  if (rule.receiverId) out.push(rule.receiverId);
  for (const step of rule.steps ?? []) if (step.receiverId) out.push(step.receiverId);
  return out;
}

const bySubject = (a: Finding, b: Finding) => a.subject.localeCompare(b.subject);

/* -------------------------------------------------------------------- audit */

/**
 * Run every rule. Deterministic: same input, same findings, same order.
 *
 * Rejected spells are read but never audited FOR reachability — a rejected
 * record is supposed to join to nothing. They matter only as the thing a gate
 * rule must not be keyed to (G5).
 */
export function audit(input: AuditInput): AuditResult {
  const findings: Finding[] = [];
  const unchecked: string[] = [];
  const ran: AuditRuleId[] = [];
  const push = (rule: AuditRuleId, rows: Finding[]) => {
    ran.push(rule);
    findings.push(...rows.sort(bySubject));
  };

  const approved = input.spells.filter((s) => s.status === "approved");
  const spellIds = new Set(input.spells.map((s) => s.spell_id));
  const rejectedIds = new Set(
    input.spells.filter((s) => s.status !== "approved").map((s) => s.spell_id),
  );
  const screenIds = new Set(input.screens.map((s) => s.screen_id));
  const screenNames = new Set(input.screens.map((s) => s.name).filter(Boolean) as string[]);
  const itemIds = new Set(input.items.map((i) => i.item_id));
  const keyItemIds = new Set(input.keyItems.map((k) => k.key_item_id));

  /* --- gates ------------------------------------------------------------- */

  const lockedBy = new Map<string, string[]>(); // gate_id -> screens it locks
  for (const screen of input.screens) {
    for (const gate of lockedGateIds(screen.status)) {
      lockedBy.set(gate, [...(lockedBy.get(gate) ?? []), screen.screen_id]);
    }
  }

  if (input.gateRules === null) {
    unchecked.push(
      "world/data/gateRules.json is not on disk (Wave 2 Track B owns it) — " +
        "every gate below is reported unclearable, and the three gate-rule " +
        "reference checks could not run at all.",
    );
  }
  const rules = input.gateRules ?? {};

  push(
    "gate-unclearable",
    [...lockedBy.entries()]
      .filter(([gate]) => !(gate in rules))
      .map(([gate, screens]) => ({
        rule: "gate-unclearable" as const,
        subject: gate,
        detail: `locks ${screens.join(", ")} and no rule in gateRules.json clears it`,
      })),
  );

  push(
    "gate-rule-unknown-spell",
    Object.entries(rules).flatMap(([gate, rule]) =>
      spellsNamedBy(rule)
        .filter((id) => !spellIds.has(id))
        .map((id) => ({
          rule: "gate-rule-unknown-spell" as const,
          subject: gate,
          detail: `names spell "${id}", which has no record in content/magic/`,
        })),
    ),
  );

  push(
    "gate-rule-rejected-spell",
    Object.entries(rules).flatMap(([gate, rule]) =>
      spellsNamedBy(rule)
        .filter((id) => rejectedIds.has(id))
        .map((id) => ({
          rule: "gate-rule-rejected-spell" as const,
          subject: gate,
          detail: `names spell "${id}", which was rejected — the gate is unsatisfiable by construction`,
        })),
    ),
  );

  // Every receiver_id any spell record authors, approved or not. A gate keyed
  // to a receiver that exists only on a rejected spell is still a defect, but
  // it is `gate-rule-rejected-spell`'s to report, not this one's.
  const authoredReceivers = new Set<string>();
  for (const spell of input.spells) {
    for (const r of spell.receivers ?? []) authoredReceivers.add(r.receiver_id);
  }

  push(
    "gate-rule-unknown-receiver",
    Object.entries(rules).flatMap(([gate, rule]) =>
      receiversNamedBy(rule)
        .filter((id) => !authoredReceivers.has(id))
        .map((id) => ({
          rule: "gate-rule-unknown-receiver" as const,
          subject: gate,
          detail: `names receiver "${id}", which no spell record authors`,
        })),
    ),
  );

  /**
   * THE PAIR CHECK — added 2026-08-17 after the three rules above all reported
   * "ok" for two gates that are in fact unsatisfiable.
   *
   * Each rule above asks a question that is too weak on its own:
   *   gate-rule-unknown-spell     — does this spell exist ANYWHERE?
   *   gate-rule-rejected-spell    — is a spell the RULE NAMES rejected?
   *   gate-rule-unknown-receiver  — does ANY spell author this receiver?
   *
   * A step saying "cast ignite on river_stone" passes all three while being
   * impossible: ignite is approved, river_stone is authored — but only by waft,
   * and `ignite x river_stone` is not an authored pair. Worse, a receiver whose
   * ONLY author is a rejected spell (stone_wall, authored solely by the rejected
   * `warm`) slips through gate-rule-unknown-receiver, because that check
   * deliberately pools rejected spells, and through gate-rule-rejected-spell,
   * because that only inspects spells the rule itself names.
   *
   * A cast resolves on the PAIR. So the audit must check the pair.
   */
  const approvedPairs = new Set<string>();
  for (const spell of input.spells) {
    if (rejectedIds.has(spell.spell_id)) continue;
    for (const r of spell.receivers ?? []) approvedPairs.add(`${spell.spell_id} ${r.receiver_id}`);
  }
  push(
    "gate-rule-unauthored-pair",
    Object.entries(rules).flatMap(([gate, rule]) => {
      const steps: { spellId?: string; receiverId?: string }[] = rule.steps
        ? [...rule.steps]
        : [{ spellId: rule.spellId, receiverId: rule.receiverId }];
      return steps
        .filter((s) => s.spellId && s.receiverId)
        .filter((s) => !approvedPairs.has(`${s.spellId} ${s.receiverId}`))
        .map((s) => ({
          rule: "gate-rule-unauthored-pair" as const,
          subject: gate,
          detail:
            `needs "${s.spellId} x ${s.receiverId}", which is not an authored pair on any ` +
            `APPROVED spell — the cast can never land, so the gate can never clear`,
        }));
    }),
  );

  /* --- the forage join --------------------------------------------------- */

  const poolScreens = new Map<string, string[]>(); // pool -> screens offering it
  for (const screen of input.screens) {
    for (const pool of poolsOn(screen, input.extraForagePools)) {
      poolScreens.set(pool, [...(poolScreens.get(pool) ?? []), screen.screen_id]);
    }
  }

  push(
    "forage-pool-unjoined",
    [...poolScreens.entries()]
      .filter(([pool]) => {
        const target = input.foragePoolToItem[pool];
        return !target || !(itemIds.has(target) || keyItemIds.has(target));
      })
      .map(([pool, screens]) => ({
        rule: "forage-pool-unjoined" as const,
        subject: pool,
        detail: input.foragePoolToItem[pool]
          ? `maps to "${input.foragePoolToItem[pool]}", which is no item record (offered on ${screens.join(", ")})`
          : `offered on ${screens.join(", ")} and maps to no item_id`,
      })),
  );

  /* --- items ------------------------------------------------------------- */

  // Where an item can come from. Four sources, all of them real mechanics:
  // a forage pool, a spell's `produces`, `always_available`, an NPC hand-off.
  const forageScreensFor = new Map<string, string[]>(); // item_id -> screens
  for (const [pool, screens] of poolScreens) {
    const item = input.foragePoolToItem[pool];
    if (!item) continue;
    forageScreensFor.set(item, [...(forageScreensFor.get(item) ?? []), ...screens]);
  }
  const producedBySpell = new Set(approved.flatMap((s) => s.produces ?? []));
  const gifted = new Set(input.npcGiftItems);
  const consumed = new Set(approved.flatMap((s) => s.components ?? []));
  // An item can also be USED without being a spell component: a receiver may
  // target it (temper × heated_stone), or a chain may consume a produced item
  // via fetch (the tempered stone). Per-receiver `produces` (Roc, 2026-08-19)
  // made this real, so "used" unions component use, receiver-target use, and
  // the item's own `used_by` naming an approved spell.
  const approvedIds = new Set(approved.map((s) => s.spell_id));
  const receiverTargets = new Set(approved.flatMap((s) => (s.receivers ?? []).map((r) => r.receiver_id)));
  const itemUsed = (i: AuditItem) =>
    consumed.has(i.item_id) ||
    receiverTargets.has(i.item_id) ||
    (i.used_by ?? []).some((sp) => approvedIds.has(sp));

  const obtainable = (item: AuditItem) =>
    forageScreensFor.has(item.item_id) ||
    producedBySpell.has(item.item_id) ||
    (item.produced_by ?? []).length > 0 ||
    item.always_available === true ||
    gifted.has(item.item_id);

  push(
    "item-unobtainable",
    input.items.filter((i) => !obtainable(i)).map((i) => ({
      rule: "item-unobtainable" as const,
      subject: i.item_id,
      detail:
        "no forage pool produces it, no approved spell produces it, " +
        "it is not always_available, and no NPC hands it over" +
        (consumed.has(i.item_id) ? " — yet an approved spell requires it as a component" : ""),
    })),
  );

  // Key items are deliberately out of the obtainability rules: they come from
  // story beats, which this audit does not model. Miscategorisation is the one
  // key-item question it can answer honestly.

  const lockedScreens = new Set(
    input.screens.filter((s) => lockedGateIds(s.status).length > 0).map((s) => s.screen_id),
  );

  push(
    "item-behind-its-own-lock",
    input.items
      .filter((i) => {
        if (producedBySpell.has(i.item_id) || i.always_available === true) return false;
        if (gifted.has(i.item_id) || (i.produced_by ?? []).length > 0) return false;
        const screens = forageScreensFor.get(i.item_id);
        return Boolean(screens?.length) && screens!.every((s) => lockedScreens.has(s));
      })
      .map((i) => {
        const screens = [...new Set(forageScreensFor.get(i.item_id) ?? [])];
        return {
          rule: "item-behind-its-own-lock" as const,
          subject: i.item_id,
          detail: `forages only from ${screens.join(", ")}, all locked — so a gate needing it cannot be opened by it`,
        };
      }),
  );

  push(
    "item-unused",
    input.items.filter((i) => !itemUsed(i)).map((i) => ({
      rule: "item-unused" as const,
      subject: i.item_id,
      detail: "no approved spell lists it in components, targets it as a receiver, or is named in its used_by",
    })),
  );

  push(
    "item-source-not-a-screen",
    (() => {
      const owners = new Map<string, string[]>(); // label -> item_ids
      for (const item of input.items) {
        for (const label of item.source_locations ?? []) {
          if (screenIds.has(label) || screenNames.has(label)) continue;
          owners.set(label, [...(owners.get(label) ?? []), item.item_id]);
        }
      }
      return [...owners.entries()].map(([label, items]) => ({
        rule: "item-source-not-a-screen" as const,
        subject: label,
        detail: `claimed by ${items.join(", ")} — matches no screen_id and no screen name`,
      }));
    })(),
  );

  /**
   * THE 16/16 REGRESSION (added 2026-08-24, T19). The original defect: forage
   * pools were sized by content-authoring accident, not by recipe, so four
   * spells (`fetch`, `steep`, `temper`, `waft`) had no single screen carrying
   * every component they needed — a player could hold half a recipe forever.
   * `screen.forage` is now `item_id`s directly (Task 1's reconciliation), so
   * this can compare components against a screen's pool with no join at all.
   *
   * A component is FREE — it needs no screen, so it never blocks co-location —
   * when the world hands it over without foraging: `always_available` (host-
   * seeded, e.g. `item_captured_sound` at `CollectScene.ts:347`), produced by
   * an approved spell (`item_flame` from `ignite`), or an NPC gift
   * (`item_salt` from the Baker, `npcItems.ts`). A spell whose components are
   * ALL free passes trivially — that is `leap` (flame only) and `preserve`
   * (salt only), and it is correct.
   */
  const isFreeComponent = (itemId: string): boolean => {
    const item = input.items.find((i) => i.item_id === itemId);
    return item?.always_available === true || producedBySpell.has(itemId) || gifted.has(itemId);
  };

  // Item ids one screen actually offers — pool names joined through
  // `foragePoolToItem`, same join `forage-pool-unjoined` uses. An unjoined
  // pool contributes nothing here; that is `forage-pool-unjoined`'s finding
  // to report, not a false co-location.
  const itemsOn = (screen: AuditScreen): Set<string> =>
    new Set(
      poolsOn(screen, input.extraForagePools)
        .map((pool) => input.foragePoolToItem[pool])
        .filter((item): item is string => Boolean(item)),
    );

  push(
    "spell-components-unco-located",
    approved
      .filter((s) => (s.components ?? []).length > 0)
      .filter((s) => {
        const screenBound = (s.components ?? []).filter((c) => !isFreeComponent(c));
        if (screenBound.length === 0) return false; // every component is free — trivial pass
        return !input.screens.some((screen) => {
          const items = itemsOn(screen);
          return screenBound.every((c) => items.has(c));
        });
      })
      .map((s) => ({
        rule: "spell-components-unco-located" as const,
        subject: s.spell_id,
        detail: `needs ${(s.components ?? []).join(" + ")} — no single screen's forage carries every screen-bound component at once`,
      })),
  );

  /* --- receivers on screens ---------------------------------------------- */

  // Souls are placed by the day files; that IS a placement, and it is why
  // `ignite` is not orphaned despite none of its objects existing anywhere.
  const placedSouls = new Set(input.placements.map((p) => p.soul));
  const examinableIds = new Set(
    input.screens.flatMap((s) => (s.examinables ?? []).map((e) => e.id).filter(Boolean) as string[]),
  );
  const screenReceivers = new Set(input.screens.flatMap((s) => s.receivers ?? []));

  const placementOf = (r: AuditReceiver): string | null => {
    if (r.receiver_class === "soul") return placedSouls.has(r.receiver_id) ? "day files" : null;
    if ((r.locations ?? []).length > 0) return "receiver.locations";
    if (screenReceivers.has(r.receiver_id)) return "screen.receivers";
    if (examinableIds.has(r.receiver_id)) return "screen.examinables";
    return null;
  };

  push(
    "spell-no-placed-receiver",
    approved
      .filter((s) => !(s.receivers ?? []).some((r) => placementOf(r) !== null))
      .map((s) => ({
        rule: "spell-no-placed-receiver" as const,
        subject: s.spell_id,
        detail: `all ${(s.receivers ?? []).length} authored receivers exist on no screen — the spell can be known and never cast on anything`,
      })),
  );

  push(
    "receiver-unplaced",
    (() => {
      const seen = new Map<string, { klass: string; spells: string[] }>();
      for (const spell of approved) {
        for (const r of spell.receivers ?? []) {
          if (placementOf(r) !== null) continue;
          const row = seen.get(r.receiver_id) ?? { klass: r.receiver_class, spells: [] };
          row.spells.push(spell.spell_id);
          seen.set(r.receiver_id, row);
        }
      }
      return [...seen.entries()].map(([id, row]) => ({
        rule: "receiver-unplaced" as const,
        subject: id,
        detail: `${row.klass}, target of ${row.spells.sort().join("/")} — on no screen`,
      }));
    })(),
  );

  /* --- spells and key items ---------------------------------------------- */

  push(
    "spell-unlocks-nothing",
    approved
      .filter((s) => {
        const target = s.unlocks?.screen;
        return Boolean(target) && !screenIds.has(target!) && !screenNames.has(target!);
      })
      .map((s) => ({
        rule: "spell-unlocks-nothing" as const,
        subject: s.spell_id,
        detail: `unlocks.screen is "${s.unlocks!.screen}" — no screen carries that id or that name`,
      })),
  );

  const known = new Set(input.decorationCategories);
  push(
    "key-item-uncategorised",
    input.keyItems.filter((k) => !known.has(k.category ?? "")).map((k) => ({
      rule: "key-item-uncategorised" as const,
      subject: k.key_item_id,
      detail: `category "${k.category ?? "(none)"}" is not one of ${[...known].sort().join(" / ")}`,
    })),
  );

  /* --- scenes ------------------------------------------------------------ */

  if (input.placements.length === 0) {
    unchecked.push(
      "no day-N.json placements were loaded — scene reachability could not be checked.",
    );
    ran.push("scene-never-placed");
  } else {
    const standsOn = new Set(input.placements.map((p) => `${p.soul}@${p.screen_id}`));
    push(
      "scene-never-placed",
      input.scenes
        .filter((sc) => sc.soul && sc.screen_id && !standsOn.has(`${sc.soul}@${sc.screen_id}`))
        .map((sc) => ({
          rule: "scene-never-placed" as const,
          subject: sc.scene_id,
          detail: `authored for ${sc.soul} on ${sc.screen_id}, where no day file ever places ${sc.soul}`,
        })),
    );
  }

  return { findings, unchecked, ran };
}
