#!/usr/bin/env python3
"""
Full content generation run — 2026-08-25.

Generates all T15 (dialogue: greetings/encounters/spell-beats/festival-night),
T16 (intro scene) and T17 (item/key-item/magic descriptions) content units
against a local koboldcpp-served model, per
plans/_handoffs/2026-08-25-mara-exemplar-pipeline-run-handoff.md.

Reads cast cards and content/ records live each run (not hand-copied), so the
generator always uses current canon. Writes ONLY under
pipeline-runs/2026-08-25-full-content-generation/ — never into cast/*-threads.md,
content/*.json, gdd/15-dialogue-inventory.md, or the ink build.

Usage: python generate_all.py
"""

import json
import os
import re
import sys
import time
import urllib.request
import urllib.error

# ---------------------------------------------------------------------------
# Paths
# ---------------------------------------------------------------------------

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
RUN_DIR = os.path.dirname(SCRIPT_DIR)  # .../2026-08-25-full-content-generation
GAME_ROOT = os.path.abspath(os.path.join(RUN_DIR, "..", ".."))  # .../game-project

CAST_DIR = os.path.join(GAME_ROOT, "cast")
CONTENT_DIR = os.path.join(GAME_ROOT, "content")
ITEMS_DIR = os.path.join(CONTENT_DIR, "items")
KEY_ITEMS_DIR = os.path.join(CONTENT_DIR, "key-items")
MAGIC_DIR = os.path.join(CONTENT_DIR, "magic")
REGISTER_FILE = os.path.join(GAME_ROOT, "narrative-pipeline", "register.md")
DIALOGUE_INVENTORY = os.path.join(GAME_ROOT, "gdd", "15-dialogue-inventory.md")

OUT_DIALOGUE_GRT = os.path.join(RUN_DIR, "dialogue", "greetings")
OUT_DIALOGUE_ENC = os.path.join(RUN_DIR, "dialogue", "encounters")
OUT_DIALOGUE_SPB = os.path.join(RUN_DIR, "dialogue", "spell-beats")
OUT_DIALOGUE_NGT = os.path.join(RUN_DIR, "dialogue", "festival-night")
OUT_INTRO = os.path.join(RUN_DIR, "intro")
OUT_ITEMS = os.path.join(RUN_DIR, "items")
OUT_KEY_ITEMS = os.path.join(RUN_DIR, "key-items")
OUT_MAGIC = os.path.join(RUN_DIR, "magic")
RUN_LOG = os.path.join(RUN_DIR, "run-log.md")
RESULTS_FILE = os.path.join(RUN_DIR, "RESULTS.md")

for d in (OUT_DIALOGUE_GRT, OUT_DIALOGUE_ENC, OUT_DIALOGUE_SPB, OUT_DIALOGUE_NGT,
          OUT_INTRO, OUT_ITEMS, OUT_KEY_ITEMS, OUT_MAGIC):
    os.makedirs(d, exist_ok=True)

# Safety guard: this script must never write outside RUN_DIR.
def safe_write(path, content):
    abspath = os.path.abspath(path)
    if not abspath.startswith(os.path.abspath(RUN_DIR) + os.sep):
        raise RuntimeError(f"REFUSING to write outside run dir: {abspath}")
    with open(abspath, "w", encoding="utf-8") as f:
        f.write(content)

# ---------------------------------------------------------------------------
# Model call
# ---------------------------------------------------------------------------

ENDPOINT = "http://localhost:5001/v1/chat/completions"
MAX_ATTEMPTS = 3
TIMEOUT_S = 180

def call_model(system_prompt, user_prompt, max_tokens=300):
    body = {
        "model": "local",
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        "temperature": 1.0,
        "top_p": 1.0,
        "min_p": 0.10,
        "max_tokens": max_tokens,
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(body).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=TIMEOUT_S) as resp:
        data = json.loads(resp.read().decode("utf-8"))
    return data["choices"][0]["message"]["content"].strip()


def generate_with_retry(unit_id, system_prompt, user_prompt, max_tokens, log_fh):
    last_err = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        t0 = time.time()
        try:
            text = call_model(system_prompt, user_prompt, max_tokens=max_tokens)
            elapsed = time.time() - t0
            wc = len(text.split())
            log_line = f"- **{unit_id}** attempt {attempt}/{MAX_ATTEMPTS}: SUCCESS ({elapsed:.1f}s, {wc} words)\n"
            log_fh.write(log_line)
            log_fh.flush()
            return text, wc, True, None
        except Exception as e:
            elapsed = time.time() - t0
            last_err = f"{type(e).__name__}: {e}"
            log_line = f"- **{unit_id}** attempt {attempt}/{MAX_ATTEMPTS}: FAILED ({elapsed:.1f}s) — {last_err}\n"
            log_fh.write(log_line)
            log_fh.flush()
            time.sleep(2)
    log_fh.write(f"- **{unit_id}** SKIPPED after {MAX_ATTEMPTS} failed attempts. Last error: {last_err}\n\n")
    log_fh.flush()
    return None, 0, False, last_err

# ---------------------------------------------------------------------------
# Cast card parsing (read live every run — never hand-copied)
# ---------------------------------------------------------------------------

def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()

def parse_table_field(card_text, field_name):
    """Extract the value cell of a `| `field_name`  | value |` row."""
    pattern = re.compile(r"^\|\s*`" + re.escape(field_name) + r"`\s*\|(.*)\|\s*$", re.MULTILINE)
    m = pattern.search(card_text)
    if not m:
        return None
    return m.group(1).strip()

def extract_section(card_text, heading, next_headings=("### ", "## ")):
    """Extract text between a heading line and the next heading of equal-or-higher level."""
    idx = card_text.find(heading)
    if idx == -1:
        return None
    start = idx + len(heading)
    rest = card_text[start:]
    end = len(rest)
    for line in rest.split("\n"):
        pass
    # find next line starting with any of next_headings, scanning line-by-line after start
    lines = rest.split("\n")
    collected = []
    for i, line in enumerate(lines):
        if i == 0:
            collected.append(line)
            continue
        stripped = line.strip()
        if stripped.startswith("### ") or stripped.startswith("## "):
            break
        collected.append(line)
    section = "\n".join(collected).strip()
    # strip blockquote markers
    cleaned_lines = []
    for line in section.split("\n"):
        cleaned_lines.append(re.sub(r"^>\s?", "", line))
    return "\n".join(cleaned_lines).strip()

_cast_cache = {}

def load_cast(soul):
    """Return (essence_descriptor, voice_register_text) for a soul, read live from cast/<soul>.md."""
    if soul in _cast_cache:
        return _cast_cache[soul]
    path = os.path.join(CAST_DIR, f"{soul}.md")
    text = read_file(path)
    essence = parse_table_field(text, "essence_descriptor")
    voice = extract_section(text, "### `voice_register`")
    if not essence or not voice:
        raise RuntimeError(f"Failed to parse essence_descriptor/voice_register from {path}")
    _cast_cache[soul] = (essence, voice)
    return essence, voice

# ---------------------------------------------------------------------------
# register.md — player voice section (T17 field-notes voice source)
# ---------------------------------------------------------------------------

_player_voice_cache = None

def load_player_voice_section():
    global _player_voice_cache
    if _player_voice_cache is not None:
        return _player_voice_cache
    text = read_file(REGISTER_FILE)
    section = extract_section(text, "## The player voice", next_headings=("## ",))
    if not section:
        raise RuntimeError("Failed to parse 'The player voice' section from register.md")
    _player_voice_cache = section
    _player_voice_cache = re.sub(r"^\|\s*`" , "", _player_voice_cache)  # no-op guard
    return _player_voice_cache

# ---------------------------------------------------------------------------
# Guards (persona-card-schema.md "Sample-line and invention safety",
# guardrails.md check 7, guardrails.md check 9)
# ---------------------------------------------------------------------------

ANTI_COPY_GUARD = (
    "The sample lines in the 'sounds like' list above are shape references only. "
    "Never output any of them verbatim or near-verbatim — write a new line in the same voice, "
    "not a copy or paraphrase of a sample."
)

ANTI_INVENTION_GUARD = (
    "If this card names a figure without explaining them (a name given with no relationship, "
    "history, or backstory stated), that figure exists ONLY as already written on the card. "
    "Do not invent a relationship, history, explanation, or new scene involving them."
)

BANNED_VOCAB_GUARD = (
    "Never use the words 'remember', 'memory', 'remembers', or 'forget' when describing how a "
    "spell, the festival, or any object works. Describe outcomes only — what changes, what "
    "stays — never the mechanism behind it."
)

PLAIN_LANGUAGE_GUARD = (
    "Every word must be understandable to someone who has never seen this trade, craft, or "
    "custom before. No jargon, no invented in-world terminology, no assumed process knowledge."
)

# ---------------------------------------------------------------------------
# content/ record loading (T17)
# ---------------------------------------------------------------------------

def list_json_records(directory, exclude):
    out = []
    for fname in sorted(os.listdir(directory)):
        if not fname.endswith(".json"):
            continue
        if fname in exclude:
            continue
        out.append(os.path.join(directory, fname))
    return out

def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

# What each spell does — sourced from content/magic/_index.md's "What it does" column
# (the JSON records carry no prose "what it does" field; only _index.md's markdown table does).
WHAT_IT_DOES = {
    "glimmer": "Raises small dancing lights in an area; on the Festival Grounds on festival night, many years of past casts show at once.",
    "echo": "Replays a captured sound out of a resonant surface.",
    "fetch": "Tugs a small loose object a short way toward the caster.",
    "ignite": "Sets inert dry material alight.",
    "temper": "Hardens a hot-worked piece evenly as it cools.",
    "bind": "Closes the seam of a broken hard thing whose halves are fitted together.",
    "portion": "Parts a divisible mass into equal measures.",
    "weigh": "Bears a thing up a hand's breadth and holds it at a height set by its heft — tells you how much, changes nothing.",
    "knead": "Works a mass through as if by many hands.",
    "rest": "Pauses a change in progress: a rise holds where it stands, a pot holds at serving-hot, until it is next uncovered.",
    "warm": "Spreads low, even heat through the target.",
    "sift": "Separates fine from coarse in a mixture.",
    "cool": "Draws heat out of the target without collapsing it.",
    "scratch": "Soothes an itch in a place the body cannot reach.",
    "seal": "Closes a letter, parcel, or jar weather-tight.",
    "dry": "Takes the water out of a soaked thing.",
    "steep": "Draws the virtue of what's in a vessel of water into the water, fast.",
    "preserve": "Holds a freshly cut or picked thing at fresh.",
    "mist": "Settles a fine cool mist over the target.",
    "leap": "Sends a flame you spend across to a prepared wick.",
    "waft": "Sends smoke, scent, or dust rising in a straight column.",
    "toll": "Sounds a single true tone from resonant material.",
    "still": "Calms moving air or water around the target for a short while.",
    "breath": "A directed puff of air — winnows, scatters, feeds embers.",
    "furrow": "Parts worked ground in a seed-row along the cast.",
    "ripen": "Pushes near-ripe growth the last step to ripe.",
}

# ---------------------------------------------------------------------------
# Dialogue-inventory parsing (T15/T16) — gdd/15-dialogue-inventory.md
# ---------------------------------------------------------------------------

def parse_pipe_row(line):
    parts = [p.strip() for p in line.strip().strip("|").split("|")]
    return parts

def extract_table_rows(text, section_heading):
    """Return list of row-cell-lists for the markdown table under a '## heading'."""
    idx = text.find(section_heading)
    if idx == -1:
        raise RuntimeError(f"Section not found: {section_heading}")
    rest = text[idx + len(section_heading):]
    lines = rest.split("\n")
    rows = []
    in_table = False
    for line in lines:
        if line.strip().startswith("## "):
            break
        if line.strip().startswith("|"):
            cells = parse_pipe_row(line)
            if all(set(c) <= set("-: ") for c in cells):
                continue  # separator row
            if cells and cells[0] == "ID":
                in_table = True
                continue
            if in_table:
                rows.append(cells)
    return rows

def load_dialogue_inventory_units():
    text = read_file(DIALOGUE_INVENTORY)
    units = {
        "intro": extract_table_rows(text, "## Intro (T16)"),
        "greetings_deep": extract_table_rows(text, "## Greetings — deep three (×3 bond levels each)"),
        "greetings_texture": extract_table_rows(text, "## Greetings — texture five (×1 each; runtime LLM varies them)"),
        "encounters": extract_table_rows(text, "## Festival-goal encounters — deep three (×3 each)"),
        "spell_beats": extract_table_rows(text, "## Spell-intro story beats — 13 role spells"),
        "festival_night": extract_table_rows(text, "## Festival-night scenes — deep three"),
    }
    return units

# Role -> soul holding it this life (derived from cast/*.md role_tag fields, read live)
def role_to_soul_map():
    mapping = {}
    for soul in ("toby", "ilsa", "mara", "linnet", "nell", "juno", "pip", "bex"):
        text = read_file(os.path.join(CAST_DIR, f"{soul}.md"))
        m = re.search(r"`role_tag`\s*\|\s*\*{0,2}([A-Za-z ]+?)[\.\—\-–,]", text)
        if m:
            role = m.group(1).strip()
            mapping[role] = soul
    return mapping

ITEM_DESC_CACHE = {}

def load_item_descriptions():
    global ITEM_DESC_CACHE
    if ITEM_DESC_CACHE:
        return ITEM_DESC_CACHE
    for path in list_json_records(ITEMS_DIR, {"_schema-report.json"}):
        rec = load_json(path)
        ITEM_DESC_CACHE[rec["item_id"]] = rec["description"]
    return ITEM_DESC_CACHE

# ---------------------------------------------------------------------------
# System / user prompt builders — T15/T16 dialogue
# ---------------------------------------------------------------------------

DIALOGUE_INSTRUCTION = (
    "You are the Content / Dialogue Agent for a cozy narrative game. You write ONE slot of "
    "game dialogue per call. Return one short third-person narrator beat (what the soul is "
    "physically doing, one sentence, no more) followed by their spoken line in quotes. No "
    "preamble, no explanation beyond the single action beat. The spoken line must obey the "
    "world's ordinary NPC dialogue ceiling: median 20-50 words, 75-word hard ceiling."
)

def build_dialogue_system(soul):
    essence, voice = load_cast(soul)
    return (
        f"{DIALOGUE_INSTRUCTION}\n\n"
        f"This soul's essence:\n{essence}\n\n"
        f"This soul's voice:\n{voice}\n\n"
        f"{ANTI_COPY_GUARD}\n\n{ANTI_INVENTION_GUARD}\n\n{BANNED_VOCAB_GUARD}"
    )

def build_dialogue_user(tone, scene_context):
    return (
        "=== SLOT ===\n"
        "slot_type: dialogue\n"
        f"tone: {tone}\n"
        f"scene_context: {scene_context}\n\n"
        "Write the beat and line."
    )

# ---------------------------------------------------------------------------
# System / user prompt builders — T17 items / key-items / magic
# ---------------------------------------------------------------------------

def build_t17_system():
    player_voice = load_player_voice_section()
    return (
        "You write short field-notes-style descriptions for a traveling mage's personal "
        "notebook, in the voice below (the game's player-voice register: plain, exact about "
        "what-is, curious, economical, never composed or writerly).\n\n"
        f"{player_voice}\n\n"
        f"{PLAIN_LANGUAGE_GUARD}\n\n"
        "Return a single plain paragraph. No narrator beat, no dialogue, no quotation marks, "
        "no heading, no preamble — just the paragraph."
    )

def build_t17_item_user(item_id, old_desc, category):
    return (
        "=== RECORD ===\n"
        f"id: {item_id}\n"
        f"category: {category}\n"
        f"current bare label: \"{old_desc}\"\n\n"
        "Write a single-paragraph field-notes description of this object for the mage's "
        "notebook — grounded and concrete, expanding the bare label into real prose without "
        "inventing game mechanics or lore that isn't implied by the label and category."
    )

def build_t17_magic_user(spell_id, phrase, role, what_it_does, learn_source, mana_effect):
    return (
        "=== SPELL RECORD ===\n"
        f"spell_id: {spell_id}\n"
        f"phrase: '{phrase}'\n"
        f"role: {role}\n"
        f"what it does: {what_it_does}\n"
        f"learn source: {learn_source}\n"
        f"mana effect: {mana_effect}\n\n"
        "This spell record has no description field yet — you are writing a new one. Write a "
        "single-paragraph field-notes description of the spell itself for the mage's notebook: "
        "what it does, what it feels or looks like to cast, in plain concrete language."
    )

# ---------------------------------------------------------------------------
# Output file writers
# ---------------------------------------------------------------------------

def write_dialogue_output(path, unit_id, soul, scene_context, text, wc, ok, err):
    lines = [f"# {unit_id}", "", f"**Soul:** {soul}", "", "**Scene context given:**", "", scene_context, ""]
    if ok:
        lines += ["**Generated output:**", "", text, "", f"**Word count:** {wc}"]
    else:
        lines += ["**GENERATION FAILED / SKIPPED**", "", f"Error: {err}"]
    safe_write(path, "\n".join(lines) + "\n")

def write_t17_output(path, record_id, category, old_desc, text, ok, err):
    lines = [f"# {record_id}", "", f"**Category:** {category}", "", f"**OLD description:** {old_desc}", ""]
    if ok:
        lines += ["**NEW description (generated):**", "", text]
    else:
        lines += ["**GENERATION FAILED / SKIPPED**", "", f"Error: {err}"]
    safe_write(path, "\n".join(lines) + "\n")

# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    stats = {"success": 0, "failed": 0}
    detail = []

    role_map = role_to_soul_map()
    item_desc = load_item_descriptions()
    units = load_dialogue_inventory_units()

    with open(RUN_LOG, "a", encoding="utf-8") as log_fh:
        log_fh.write(f"\n\n## Run started {time.strftime('%Y-%m-%d %H:%M:%S')}\n\n")

        def run_unit(unit_id, system_prompt, user_prompt, max_tokens, writer):
            text, wc, ok, err = generate_with_retry(unit_id, system_prompt, user_prompt, max_tokens, log_fh)
            if ok:
                stats["success"] += 1
            else:
                stats["failed"] += 1
            detail.append((unit_id, ok, err))
            writer(text, wc, ok, err)

        # --- T16: Intro (2 bounded calls, combined into INT-1.md) ---
        intro_system = (
            "You are the Content / Dialogue Agent for a cozy narrative game. You write ONE "
            "bounded beat of the opening intro scene per call. Return one short third-person "
            "narrator beat plus any spoken line(s) in quotes, in the plain world dialect: "
            "one thought per turn, exact about what-is, vague about what-it-means, curiosity "
            "as the signature. No preamble.\n\n"
            f"{BANNED_VOCAB_GUARD}"
        )
        intro_beat_a_user = (
            "=== SLOT ===\n"
            "slot_type: dialogue\n"
            "tone: curious\n"
            "scene_context: Opening beat. A traveling mage arrives in the village during "
            "festival week. Cover: why the mage has come (drawn by the Festival of Souls and "
            "Hearthlight, collecting magic from around the world), and the stakes of the "
            "festival this year (the village needs the Lantern Arch lit and the souls called "
            "home). Third-person narrator beat plus one or two short spoken/thought lines.\n\n"
            "Write the beat and line(s)."
        )
        intro_beat_b_user = (
            "=== SLOT ===\n"
            "slot_type: dialogue\n"
            "tone: warm\n"
            "scene_context: Second beat, immediately after arrival. A villager greets the mage "
            "and asks their name — this is the player's name-entry moment, framed as a story "
            "beat, not a menu. Third-person narrator beat plus the villager's short spoken "
            "greeting and question.\n\n"
            "Write the beat and line."
        )
        text_a, wc_a, ok_a, err_a = generate_with_retry("INT-1-a", intro_system, intro_beat_a_user, 300, log_fh)
        text_b, wc_b, ok_b, err_b = generate_with_retry("INT-1-b", intro_system, intro_beat_b_user, 300, log_fh)
        stats["success"] += int(ok_a) + int(ok_b)
        stats["failed"] += int(not ok_a) + int(not ok_b)
        detail.append(("INT-1-a (arrival+stakes)", ok_a, err_a))
        detail.append(("INT-1-b (greeting+name)", ok_b, err_b))
        int_lines = ["# INT-1 — Intro VN scene", "", "Split into two bounded calls per "
                     "gdd/15-dialogue-inventory.md's method note (one long call loses at "
                     "least one beat).", "", "## Beat A — arrival + festival stakes", "",
                     "**Scene context given:**", "", intro_beat_a_user, ""]
        if ok_a:
            int_lines += ["**Generated output:**", "", text_a, "", f"**Word count:** {wc_a}", ""]
        else:
            int_lines += ["**GENERATION FAILED / SKIPPED**", "", f"Error: {err_a}", ""]
        int_lines += ["## Beat B — greeting + name entry", "", "**Scene context given:**", "", intro_beat_b_user, ""]
        if ok_b:
            int_lines += ["**Generated output:**", "", text_b, "", f"**Word count:** {wc_b}", ""]
        else:
            int_lines += ["**GENERATION FAILED / SKIPPED**", "", f"Error: {err_b}", ""]
        safe_write(os.path.join(OUT_INTRO, "INT-1.md"), "\n".join(int_lines) + "\n")

        # --- Greetings — deep three (×3 bond levels) ---
        TONE_BY_LEVEL = {"first-meeting": "matter_of_fact", "familiar": "warm", "close": "warm"}
        for row in units["greetings_deep"]:
            unit_id, soul_name, level = row[0], row[1], row[2]
            soul = soul_name.lower()
            tone = TONE_BY_LEVEL.get(level, "matter_of_fact")
            scene_context = (
                f"{soul_name} at their usual place of work, during festival week. Bond level: "
                f"{level} — "
                + {
                    "first-meeting": "the player is a stranger they have never spoken to before.",
                    "familiar": "the player has talked with them a handful of times and is a known, welcome face.",
                    "close": "the player has spent significant time with them across the week and the bond is close.",
                  }.get(level, "")
                + " This is their greeting line on seeing the player approach."
            )
            system = build_dialogue_system(soul)
            user = build_dialogue_user(tone, scene_context)
            path = os.path.join(OUT_DIALOGUE_GRT, f"{unit_id}.md")
            def writer(text, wc, ok, err, _path=path, _uid=unit_id, _soul=soul_name, _ctx=scene_context):
                write_dialogue_output(_path, _uid, _soul, _ctx, text, wc, ok, err)
            run_unit(unit_id, system, user, 300, writer)

        # --- Greetings — texture five (×1 each) ---
        for row in units["greetings_texture"]:
            unit_id, soul_name = row[0], row[1]
            soul = soul_name.lower()
            scene_context = (
                f"{soul_name} going about their ordinary business in the village during "
                "festival week. The player is a stranger approaching for the first time. This "
                "is their greeting line — the runtime will generate variants from this seed."
            )
            system = build_dialogue_system(soul)
            user = build_dialogue_user("matter_of_fact", scene_context)
            path = os.path.join(OUT_DIALOGUE_GRT, f"{unit_id}.md")
            def writer(text, wc, ok, err, _path=path, _uid=unit_id, _soul=soul_name, _ctx=scene_context):
                write_dialogue_output(_path, _uid, _soul, _ctx, text, wc, ok, err)
            run_unit(unit_id, system, user, 300, writer)

        # --- Festival-goal encounters — deep three (×3 each) ---
        ENC_BEAT = {
            "1": "Early in the week. {soul} first mentions the shortfall or problem standing "
                 "between them and the festival goal ({goal}). The player is nearby and offers "
                 "to help.",
            "2": "Mid-week. The player is actively lending a hand toward the goal ({goal}) — "
                 "real, physical help, mid-task. {soul} directs or works alongside them.",
            "3": "Late in the week, the goal ({goal}) is nearly within reach. {soul} and the "
                 "player are finishing the last piece of work together.",
        }
        for row in units["encounters"]:
            unit_id, soul_name, goal, enc_num = row[0], row[1], row[2], row[3]
            soul = soul_name.lower()
            goal_clean = goal.replace('"', "'")
            if goal_clean.strip() == '"' or goal_clean.strip() == "":
                goal_clean = "the festival goal"
            scene_context = ENC_BEAT.get(enc_num, ENC_BEAT["1"]).format(soul=soul_name, goal=goal_clean)
            system = build_dialogue_system(soul)
            user = build_dialogue_user("matter_of_fact", scene_context)
            path = os.path.join(OUT_DIALOGUE_ENC, f"{unit_id}.md")
            def writer(text, wc, ok, err, _path=path, _uid=unit_id, _soul=soul_name, _ctx=scene_context):
                write_dialogue_output(_path, _uid, _soul, _ctx, text, wc, ok, err)
            run_unit(unit_id, system, user, 300, writer)

        # --- Spell-intro story beats — 13 role spells ---
        for row in units["spell_beats"]:
            unit_id, spell_id, role_holder = row[0], row[1].strip("`").strip(), row[2]
            m = re.match(r"([A-Za-z ]+)", role_holder)
            role = m.group(1).strip() if m else role_holder
            soul = role_map.get(role)
            if soul is None:
                # fall back to whatever the table parenthesizes, e.g. "Blacksmith (Ilsa)"
                m2 = re.search(r"\(([A-Za-z]+)\)", role_holder)
                soul = m2.group(1).lower() if m2 else None
            if soul is None:
                with open(RUN_LOG, "a", encoding="utf-8") as f2:
                    f2.write(f"- **{unit_id}** SKIPPED — could not resolve role '{role}' to a soul.\n")
                stats["failed"] += 1
                detail.append((unit_id, False, f"unresolved role '{role}'"))
                continue
            magic_path = os.path.join(MAGIC_DIR, f"{spell_id}.json")
            spell = load_json(magic_path)
            comp_desc = ", ".join(item_desc.get(c, c) for c in spell.get("components", []))
            what = WHAT_IT_DOES.get(spell_id, "")
            scene_context = (
                f"This scene introduces the spell '{spell_id}' (phrase: '{spell['phrase']}') to "
                f"the player for the first time, through {soul.capitalize()} going about their "
                f"{role} work. What the spell does: {what} Component(s) needed to cast it: "
                f"{comp_desc}. How it's learned: {spell.get('learn_source', '')}. The scene "
                f"should give the player a real clue toward how to cast it, without naming the "
                f"phrase outright as an instruction — show the working, not a manual."
            )
            system = build_dialogue_system(soul)
            user = build_dialogue_user("matter_of_fact", scene_context)
            path = os.path.join(OUT_DIALOGUE_SPB, f"{unit_id}.md")
            def writer(text, wc, ok, err, _path=path, _uid=unit_id, _soul=soul, _ctx=scene_context):
                write_dialogue_output(_path, _uid, _soul, _ctx, text, wc, ok, err)
            run_unit(unit_id, system, user, 350, writer)

        # --- Festival-night scenes — deep three ---
        for row in units["festival_night"]:
            unit_id, soul_name = row[0], row[1]
            soul = soul_name.lower()
            scene_context = (
                f"Festival night. The Lantern Arch is lit and the village has gathered. "
                f"{soul_name} is present, at whatever bond-gated level of attendance their "
                f"relationship with the player has earned this week. This is a quiet, "
                f"arc-landing-aware beat for {soul_name} on festival night — loosened "
                f"register, warm, in their own voice."
            )
            system = build_dialogue_system(soul)
            user = build_dialogue_user("quiet", scene_context)
            path = os.path.join(OUT_DIALOGUE_NGT, f"{unit_id}.md")
            def writer(text, wc, ok, err, _path=path, _uid=unit_id, _soul=soul_name, _ctx=scene_context):
                write_dialogue_output(_path, _uid, _soul, _ctx, text, wc, ok, err)
            run_unit(unit_id, system, user, 350, writer)

        # --- T17: items ---
        t17_system = build_t17_system()
        for path_json in list_json_records(ITEMS_DIR, {"_schema-report.json"}):
            rec = load_json(path_json)
            item_id = rec["item_id"]
            old_desc = rec["description"]
            category = rec.get("category", "")
            user = build_t17_item_user(item_id, old_desc, category)
            out_path = os.path.join(OUT_ITEMS, f"{item_id}.md")
            def writer(text, wc, ok, err, _path=out_path, _rid=item_id, _cat=category, _old=old_desc):
                write_t17_output(_path, _rid, _cat, _old, text, ok, err)
            run_unit(item_id, t17_system, user, 350, writer)

        # --- T17: key-items ---
        for path_json in list_json_records(KEY_ITEMS_DIR, set()):
            rec = load_json(path_json)
            key_id = rec["key_item_id"]
            old_desc = rec["description"]
            category = rec.get("category", "")
            user = build_t17_item_user(key_id, old_desc, category)
            out_path = os.path.join(OUT_KEY_ITEMS, f"{key_id}.md")
            def writer(text, wc, ok, err, _path=out_path, _rid=key_id, _cat=category, _old=old_desc):
                write_t17_output(_path, _rid, _cat, _old, text, ok, err)
            run_unit(key_id, t17_system, user, 350, writer)

        # --- T17: magic (NEW description field — not a rewrite; see RESULTS.md deviation note) ---
        for path_json in list_json_records(MAGIC_DIR, {"_component-requirements.json"}):
            spell = load_json(path_json)
            spell_id = spell["spell_id"]
            what = WHAT_IT_DOES.get(spell_id, "")
            user = build_t17_magic_user(
                spell_id, spell.get("phrase", spell_id), spell.get("role", ""),
                what, spell.get("learn_source", ""), spell.get("mana_effect", ""),
            )
            out_path = os.path.join(OUT_MAGIC, f"{spell_id}.md")
            def writer(text, wc, ok, err, _path=out_path, _rid=spell_id):
                write_t17_output(_path, _rid, "spell", "none — new field", text, ok, err)
            run_unit(spell_id, t17_system, user, 350, writer)

        log_fh.write(f"\n## Run finished {time.strftime('%Y-%m-%d %H:%M:%S')}\n")
        log_fh.write(f"Total: {stats['success']} succeeded, {stats['failed']} failed/skipped.\n")

    # Write a machine-readable summary for RESULTS.md authoring
    summary_path = os.path.join(RUN_DIR, "scripts", "_last_run_summary.json")
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump({"stats": stats, "detail": detail}, f, indent=2)

    print(f"\nDone. {stats['success']} succeeded, {stats['failed']} failed/skipped.")
    print(f"Summary written to {summary_path}")


if __name__ == "__main__":
    main()
