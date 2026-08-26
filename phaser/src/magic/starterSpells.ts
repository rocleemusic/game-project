/**
 * The spells the Mage starts KNOWN — their own three (Roc, 2026-08-18).
 * Known at start, not castable at start: casting still needs the components
 * foraged. Every OTHER approved spell is learned from the NPC dealt its role
 * (`NpcTalkSystem` filters `s.role === role`). `ignite` (Blacksmith) and
 * `breath` (Farmer) used to start known and are now NPC-taught like the rest.
 *
 * Kept in this Phaser-free module so a test can assert against it without
 * importing a scene (which pulls in Phaser and has no `window` under vitest).
 */
export const STARTER_SPELLS: string[] = ["glimmer", "echo", "fetch"];
