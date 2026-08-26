#!/usr/bin/env python3
"""
Second pass — 2026-08-25 (evening). Rebuilds ONLY the T15 encounters,
spell-beats and festival-night categories as real 6-8 beat scenes with one
choice point (2-3 options that gather back), per Roc's review of the first
pass's single-line output. T17 (items/key-items/magic) and T15 greetings/intro
are untouched — do not regenerate them here.

Reuses generate_all.py's infrastructure directly (load_cast, the guards,
call_model/generate_with_retry, load_dialogue_inventory_units, role_to_soul_map,
WHAT_IT_DOES, safe_write) by importing it as a module, so cast/content records
are still read live off disk, never hand-copied.

Writes ONLY under:
  pipeline-runs/2026-08-25-full-content-generation/dialogue/encounters/
  pipeline-runs/2026-08-25-full-content-generation/dialogue/spell-beats/
  pipeline-runs/2026-08-25-full-content-generation/dialogue/festival-night/

Usage: python generate_scenes_pass2.py
"""

import os
import re
import sys
import time
import json

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, SCRIPT_DIR)

import generate_all as base  # noqa: E402  (reuse the first run's infrastructure)

RUN_DIR = base.RUN_DIR
OUT_DIALOGUE_ENC = base.OUT_DIALOGUE_ENC
OUT_DIALOGUE_SPB = base.OUT_DIALOGUE_SPB
OUT_DIALOGUE_NGT = base.OUT_DIALOGUE_NGT
RUN_LOG = base.RUN_LOG
RESULTS_FILE = base.RESULTS_FILE
MAGIC_DIR = base.MAGIC_DIR

safe_write = base.safe_write
call_model = base.call_model
generate_with_retry = base.generate_with_retry
load_cast = base.load_cast
load_dialogue_inventory_units = base.load_dialogue_inventory_units
role_to_soul_map = base.role_to_soul_map
load_item_descriptions = base.load_item_descriptions
load_json = base.load_json
WHAT_IT_DOES = base.WHAT_IT_DOES
ANTI_COPY_GUARD = base.ANTI_COPY_GUARD
ANTI_INVENTION_GUARD = base.ANTI_INVENTION_GUARD
BANNED_VOCAB_GUARD = base.BANNED_VOCAB_GUARD

# ---------------------------------------------------------------------------
# Scene output contract — shared across all three categories
# ---------------------------------------------------------------------------

SCENE_INSTRUCTION = (
    "You are the Content / Dialogue Agent for a cozy narrative game. Write ONE full scene: "
    "the total scene must read as 6-8 beats of content, not open-ended. Shape: 2-4 narrator-"
    "beat-plus-dialogue beats building the situation, then ONE choice point (a setup line and "
    "2-3 options, each with 1-3 response lines from the soul — 2 is the floor when the soul is "
    "*receiving*, being thanked, given to, or noticed), then ONE closing gather beat that plays "
    "no matter which option the player picked. Follow this output contract exactly, one entry "
    "per line, in this order:\n\n"
    "BEAT 1: [narrator beat] \"spoken line\"\n"
    "BEAT 2: [narrator beat] \"spoken line\"\n"
    "(2 to 4 beats total, building the situation)\n"
    "CHOICE SETUP: [narrator beat] \"spoken line that opens the choice\"\n"
    "OPTION A (<verb_family> — <detail>): \"player line\" -- or -- [surface action]\n"
    "RESPONSE A: [narrator beat] \"spoken line\"\n"
    "OPTION B (<verb_family> — <detail>): \"player line\" -- or -- [surface action]\n"
    "RESPONSE B: [narrator beat] \"spoken line\"\n"
    "OPTION C (<verb_family> — <detail>): \"player line\" -- or -- [surface action]  (omit "
    "entirely if the scene reads better with only 2 options)\n"
    "RESPONSE C: [narrator beat] \"spoken line\"\n"
    "GATHER: [narrator beat] \"spoken line\" (plays no matter which option was picked)\n\n"
    "Rules: never fewer than 2 options, never more than 3. Each option is EITHER a player_line "
    "(the player's spoken words, in quotes, at most 12 words) OR a surface_action (an unspoken "
    "deed phrased as a verb acting on a named thing, in brackets — e.g. '[Pour the tempered "
    "stone into the mold]', never a feelings label like '[Comfort him]'). Exactly one of the two "
    "per option. Neither option may read as the objectively correct or rewarded choice — both "
    "must be legitimate, and picking one must never read as unlocking something (this is a "
    "single generated scene, not a repeatable pick). The soul's spoken lines obey the world's "
    "ordinary NPC dialogue ceiling: median 20-50 words, 75-word hard ceiling per line, one "
    "thought per turn. No preamble, no explanation, no meta-commentary outside the contract "
    "above — output the beats and nothing else."
)

def build_scene_system(soul, extra_guard=""):
    essence, voice = load_cast(soul)
    parts = [
        SCENE_INSTRUCTION,
        "",
        f"This soul's essence:\n{essence}",
        "",
        f"This soul's voice:\n{voice}",
        "",
        ANTI_COPY_GUARD,
        "",
        ANTI_INVENTION_GUARD,
        "",
        BANNED_VOCAB_GUARD,
    ]
    if extra_guard:
        parts += ["", extra_guard]
    return "\n".join(parts)

def build_scene_user(scene_context):
    return (
        "=== SLOT ===\n"
        "slot_type: scene\n"
        f"scene_context: {scene_context}\n\n"
        "Write the full scene per the contract."
    )

MAX_TOKENS = 1000

# ---------------------------------------------------------------------------
# Malformed-structure detector (loose — flags for the reviewer, never blocks)
# ---------------------------------------------------------------------------

def detect_malformed(text):
    reasons = []
    n_opt = len(re.findall(r"^\s*OPTION [A-C]", text, re.MULTILINE))
    n_resp = len(re.findall(r"^\s*RESPONSE [A-C]", text, re.MULTILINE))
    has_setup = re.search(r"^\s*CHOICE SETUP", text, re.MULTILINE) is not None
    has_gather = re.search(r"^\s*GATHER", text, re.MULTILINE) is not None
    n_beat = len(re.findall(r"^\s*BEAT \d", text, re.MULTILINE))
    if not has_setup:
        reasons.append("no CHOICE SETUP line found")
    if n_opt < 2:
        reasons.append(f"only {n_opt} OPTION line(s) found (need 2-3)")
    elif n_opt > 3:
        reasons.append(f"{n_opt} OPTION lines found (max 3)")
    if n_resp < n_opt:
        reasons.append(f"only {n_resp} RESPONSE line(s) for {n_opt} option(s)")
    if not has_gather:
        reasons.append("no GATHER line found")
    if n_beat == 0:
        reasons.append("no BEAT-numbered set-up lines found")
    # crude truncation heuristic: last non-empty line doesn't end on sentence/quote/bracket punctuation
    lines = [l for l in text.strip().split("\n") if l.strip()]
    if lines:
        last = lines[-1].rstrip()
        if last and last[-1] not in '."\')]!?':
            reasons.append("possible truncation — last line does not end on closing punctuation")
    return reasons

def write_scene_output(path, unit_id, soul, scene_context, text, wc, ok, err):
    lines = [f"# {unit_id}", "", f"**Soul:** {soul}", "", "**Scene context given:**", "", scene_context, ""]
    if ok:
        malformed = detect_malformed(text)
        if malformed:
            lines += ["**STRUCTURE FLAG — review this one first:**", ""]
            lines += [f"- {r}" for r in malformed]
            lines += [""]
        lines += ["**Generated scene:**", "", text, "", f"**Word count:** {wc}"]
    else:
        lines += ["**GENERATION FAILED / SKIPPED**", "", f"Error: {err}"]
    safe_write(path, "\n".join(lines) + "\n")
    return detect_malformed(text) if ok else ["GENERATION FAILED"]

# ---------------------------------------------------------------------------
# Encounters — item-help + spell-help (+ optional witness) choice
# ---------------------------------------------------------------------------

# Per-soul item and spell picks for the "help using an item" / "help using a
# spell" options — real records, loosely tied to the soul's role-goal.
ENC_ITEM_BY_SOUL = {
    "toby": "item_spring_water",   # baker — water for the dough, on hand in the kitchen
    "ilsa": "item_river_stone",    # blacksmith — the same stone the centerpiece work uses
    "mara": "item_berry",          # herbalist — a fresh ingredient for the tonic
}
ENC_SPELL_BY_SOUL = {
    "toby": ("weigh", "portion"),   # Baker's two approved spells
    "ilsa": ("temper", "ignite"),   # Blacksmith's two approved spells
    "mara": ("steep", "preserve"),  # Herbalist's two approved spells
}

ENC_BEAT_STAGE = {
    "1": "Early in the week. {soul} first mentions the shortfall or problem standing between "
         "them and the festival goal ({goal}). The player is nearby.",
    "2": "Mid-week. The shortfall is still open and pressing — {soul} is mid-task on the "
         "festival goal ({goal}) when the player arrives.",
    "3": "Late in the week, the goal ({goal}) is nearly within reach but one piece of work is "
         "still unfinished. {soul} is on the last stretch of it when the player arrives.",
}

def build_enc_scene_context(soul_name, goal_clean, enc_num, item_id, item_desc, spell_id, spell_what):
    stage = ENC_BEAT_STAGE.get(enc_num, ENC_BEAT_STAGE["1"]).format(soul=soul_name, goal=goal_clean)
    return (
        f"{stage} Build 2-4 opening beats establishing the shortfall/task and {soul_name}'s "
        f"situation, physically grounded (hands doing things while talking, per the game's "
        f"reference texture) — then a single choice point where the player offers to help. "
        f"The choice point's options: one option MUST be the player offering to help using an "
        f"item — verb_family: Use, referencing the item '{item_id}' ({item_desc}), already at "
        f"hand or nearby. A second option SHOULD be the player offering to help using the spell "
        f"'{spell_id}' — verb_family: Use — which does: {spell_what} (give the player a real "
        f"physical action to offer, do not name the cast phrase outright). If a third option "
        f"reads better than forcing the spell option, use a plain conversational/witness option "
        f"instead — verb_family: Converse, player_verb: witness or sit-with. Aim for 2 or 3 "
        f"options total, whichever serves {soul_name}'s voice and this moment best, but always "
        f"include the item-help option. Close with one gather beat where the work moves on "
        f"regardless of which help was offered — the choice affects flavor and texture, never "
        f"who does or doesn't reach the goal."
    )

LAST_GOAL_BY_SOUL = {}

def run_encounters(stats, detail, log_fh, only_ids=None):
    units = load_dialogue_inventory_units()
    for row in units["encounters"]:
        unit_id, soul_name, goal, enc_num = row[0], row[1], row[2], row[3]
        if only_ids and unit_id not in only_ids:
            continue
        soul = soul_name.lower()
        goal_raw = goal.strip()
        # Table uses a ditto mark (") for "same as the row above" — resolve BEFORE
        # doing the quote-character replace below, or the ditto mark survives as a
        # stray apostrophe instead of being recognized as "repeat the last value".
        if goal_raw in ('"', "", '”', '“'):
            goal_clean = LAST_GOAL_BY_SOUL.get(soul, "the festival goal")
        else:
            goal_clean = goal_raw.replace('"', "'")
            LAST_GOAL_BY_SOUL[soul] = goal_clean
        item_id = ENC_ITEM_BY_SOUL.get(soul, "item_river_stone")
        item_desc = load_item_descriptions().get(item_id, item_id)
        spell_pair = ENC_SPELL_BY_SOUL.get(soul, ("portion", "portion"))
        spell_id = spell_pair[0] if enc_num != "2" else spell_pair[1]
        spell_what = WHAT_IT_DOES.get(spell_id, "")
        scene_context = build_enc_scene_context(soul_name, goal_clean, enc_num, item_id, item_desc, spell_id, spell_what)
        system = build_scene_system(soul)
        user = build_scene_user(scene_context)
        path = os.path.join(OUT_DIALOGUE_ENC, f"{unit_id}.md")
        text, wc, ok, err = generate_with_retry(unit_id, system, user, MAX_TOKENS, log_fh)
        malformed = write_scene_output(path, unit_id, soul_name, scene_context, text, wc, ok, err)
        if ok:
            stats["success"] += 1
        else:
            stats["failed"] += 1
        detail.append((unit_id, ok, err, malformed if ok else []))

# ---------------------------------------------------------------------------
# Spell-beats — introduce a spell, choice = watch-and-ask vs try-it (or fit)
# ---------------------------------------------------------------------------

def run_spell_beats(stats, detail, log_fh):
    units = load_dialogue_inventory_units()
    role_map = role_to_soul_map()
    item_desc = load_item_descriptions()
    for row in units["spell_beats"]:
        unit_id, spell_id, role_holder = row[0], row[1].strip("`").strip(), row[2]
        m = re.match(r"([A-Za-z ]+)", role_holder)
        role = m.group(1).strip() if m else role_holder
        soul = role_map.get(role)
        if soul is None:
            m2 = re.search(r"\(([A-Za-z]+)\)", role_holder)
            soul = m2.group(1).lower() if m2 else None
        if soul is None:
            log_fh.write(f"- **{unit_id}** SKIPPED — could not resolve role '{role}' to a soul.\n")
            stats["failed"] += 1
            detail.append((unit_id, False, f"unresolved role '{role}'", []))
            continue
        magic_path = os.path.join(MAGIC_DIR, f"{spell_id}.json")
        spell = load_json(magic_path)
        comp_desc = ", ".join(item_desc.get(c, c) for c in spell.get("components", []))
        what = WHAT_IT_DOES.get(spell_id, "")
        scene_context = (
            f"This scene introduces the spell '{spell_id}' (phrase: '{spell['phrase']}') to the "
            f"player for the first time, through {soul.capitalize()} going about their {role} "
            f"work. What the spell does: {what} Component(s) it needs to cast: {comp_desc} — "
            f"work at least one of these components visibly into the opening beats so the "
            f"player can spot it. How it's learned: {spell.get('learn_source', '')}. Build 2-4 "
            f"opening beats showing {soul.capitalize()} working with the spell (or its effect) "
            f"in front of the player, physically grounded. Then design a choice point yourself: "
            f"what shape best gives the player a real clue toward how to cast '{spell_id}', "
            f"without naming the phrase outright as an instruction? A natural default is the "
            f"player watching and asking about it (Converse) versus trying it themselves right "
            f"there if the beat supports it (Use) — but use your own judgement for what serves "
            f"this specific spell and soul; 2 or 3 options. Close with one gather beat that "
            f"plays regardless of the pick, and never states the cast phrase outright."
        )
        system = build_scene_system(soul)
        user = build_scene_user(scene_context)
        path = os.path.join(OUT_DIALOGUE_SPB, f"{unit_id}.md")
        text, wc, ok, err = generate_with_retry(unit_id, system, user, MAX_TOKENS, log_fh)
        malformed = write_scene_output(path, unit_id, soul, scene_context, text, wc, ok, err)
        if ok:
            stats["success"] += 1
        else:
            stats["failed"] += 1
        detail.append((unit_id, ok, err, malformed if ok else []))

# ---------------------------------------------------------------------------
# Festival-night — witness/ease/sit-with, respecting each soul's own limits
# ---------------------------------------------------------------------------

NGT_SOUL_GUARD = {
    "toby": (
        "Toby's card bars any long run wherever he is receiving, being thanked, or being seen — "
        "and bars it absolutely at a payoff. Festival night is exactly that kind of beat for "
        "him. Keep his lines short and flat wherever the player's attention or care points at "
        "him; never let him hold the floor here. Warmth stays constant even in the short lines "
        "— flat is not cold. He never explains an offer or states his own trait."
    ),
    "mara": (
        "Mara's card bars any long run about the loss itself — a grief beat near her is "
        "fragments divided by action slots (she wipes a clean shelf, closes the drawer, "
        "straightens a thing that was straight), never a run-on. Her uncapped 'holds the floor' "
        "licence is for an object's provenance only, never for the loss. If Ovin comes up at "
        "all, the only line permitted is 'that was Ovin's, before' — no history, no relationship, "
        "ever. Never use remember/memory/forget describing how anything works."
    ),
    "ilsa": (
        "Ilsa's pressure-tell is grammar, not tempo: under weight her settled declarative "
        "sentences fail to finish rather than shorten or relocate — a fragment, then an action "
        "slot (an observable act like a reach that stops partway, never a narrated feeling), "
        "then a shorter fragment or nothing at all. Her 75-word licence is only for lineage or "
        "household history, never for the absence (Bram). She is never fixed, never converted "
        "from blood-first, and never states her own trait."
    ),
}

def build_ngt_scene_context(soul_name):
    return (
        f"Festival night. The Lantern Arch is lit and the village has gathered. {soul_name} is "
        f"present, at whatever bond-gated level of attendance their relationship with the player "
        f"has earned this week — a quiet, arc-landing-aware beat, loosened register, warm, in "
        f"their own voice. Build 2-4 opening beats setting the moment. Then a single choice "
        f"point about how the player spends this moment with {soul_name}: 2-3 options drawn "
        f"from player_verb witness / ease / sit-with (never 'fix' — that verb is barred; these "
        f"souls are never fixed by a quest step). Options may be spoken (player_line) or a "
        f"quiet unspoken deed (surface_action) — whichever reads truer for this soul at this "
        f"moment. Close with one gather beat that plays regardless of the pick."
    )

def run_festival_night(stats, detail, log_fh):
    units = load_dialogue_inventory_units()
    for row in units["festival_night"]:
        unit_id, soul_name = row[0], row[1]
        soul = soul_name.lower()
        scene_context = build_ngt_scene_context(soul_name)
        system = build_scene_system(soul, extra_guard=NGT_SOUL_GUARD.get(soul, ""))
        user = build_scene_user(scene_context)
        path = os.path.join(OUT_DIALOGUE_NGT, f"{unit_id}.md")
        text, wc, ok, err = generate_with_retry(unit_id, system, user, MAX_TOKENS, log_fh)
        malformed = write_scene_output(path, unit_id, soul_name, scene_context, text, wc, ok, err)
        if ok:
            stats["success"] += 1
        else:
            stats["failed"] += 1
        detail.append((unit_id, ok, err, malformed if ok else []))

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    stats = {"success": 0, "failed": 0}
    detail = []
    with open(RUN_LOG, "a", encoding="utf-8") as log_fh:
        log_fh.write(f"\n\n## Pass 2 (scenes) started {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")
        run_encounters(stats, detail, log_fh)
        run_spell_beats(stats, detail, log_fh)
        run_festival_night(stats, detail, log_fh)
        log_fh.write(f"\n## Pass 2 finished {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        log_fh.write(f"Total: {stats['success']} succeeded, {stats['failed']} failed/skipped.\n")

    summary_path = os.path.join(RUN_DIR, "scripts", "_pass2_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump({"stats": stats, "detail": detail}, f, indent=2)

    print(f"\nDone. {stats['success']} succeeded, {stats['failed']} failed/skipped.")
    print(f"Summary written to {summary_path}")


if __name__ == "__main__":
    main()
