# game-project Resources

Live links, files, and references for game-project. The GDD itself lives in [`gdd/`](gdd/CONTEXT.md) (13 domain files) — the single source of truth. Retired drafts and templates are in [`resources/_archive/`](resources/_archive/), kept for history only.

> **Cleaned up 2026-07-28.** Past the templating stage — the GDD templates, the v1–v10 build-draft lineage, the pitch drafts, one-time process prompts, and the `phase-3-decisions` log were all archived. The three ink build-references moved into [`knowledge-base/narrative/`](knowledge-base/CONTEXT.md) where they belong.

| Title | Description | Path |
|-------|-------------|------|
| Course Syllabus | Multi-Agent AI in Gaming — session dates, assignments, capstone deadline (8/25) | resources/syllabus.md |
| Slice Level-Layout (draft) | First-pass level layout for the vertical slice (game-34) — screens, gates, knowledge-key traversal; feeds the ink prototype (game-36) | resources/level-layout_draft.md |
| Scope Parking Lot | Ideas cut for scope, not dead — each records what it was, why it went, and the trigger to bring it back (player-authored backstory, mana floors, Obra-Dinn recognition, endings taxonomy) | resources/parking-lot.md |
| ink + Inky (inkle narrative scripting) | Open-source (MIT) narrative scripting language inkle built Heaven's Vault / 80 Days / Overboard in — branching + variables + **preconditioned/conditional content** (the deduction-loop model). **Inky** exports a self-contained inkjs HTML page → instant browser prototype. **Prototyping tool — DECIDED (2026-07-19).** The three build-references — `ink-syntax-reference.md` (language), `ink-data-model.md` (entities → ink), `ink-unreal-integration.md` (`inkcpp` / `Inkpot` UE5 runtimes) — now live in [`knowledge-base/narrative/`](knowledge-base/CONTEXT.md). | https://www.inklestudios.com/ink/ · https://github.com/inkle/ink · https://github.com/inkle/inky |
| GitBook — How to Write a GDD | Modern GDD guidance: start broad → specific, living searchable doc, GDD vs pitch vs TDD | https://www.gitbook.com/blog/how-to-write-a-game-design-document |
| Codecks — Writing Modern GDDs | Minimal living GDDs: pillars over detail, "your game is your GDD", docs as project management | https://www.codecks.io/blog/writing-modern-game-design-documents/ |
| Fourteen Forms of Fun | Garneau (2001) taxonomy of fun forms — lens for design pillars; this game's core stack: Discovery, Problem-Solving, Beauty, Immersion + Love and Creation as differentiators | AI_Learning/inbox/clippings/Fourteen Forms of Fun.md |
| KB Intake skill | Reusable ingestion pipeline — sweep inbox → triage → extract → archive → index. Trigger: "kb intake" (or "kb intake [folder]"). Raw stays under `P:\game-project-kb-raw\`. | knowledge-base/_intake/SKILL.md |
| UE Build Home | UE 5.8 implementation of this project. Perforce workspace `roclee_CCI-MSiAegis-02_459` (`rebirth.uproject`). Has its own Agent/ICM workspace driven by the `unreal-mcp` MCP server (`127.0.0.1:9000`). Design flows from here → implemented there. | Perforce depot — local path in the UE project's `.claude/local-paths.md` (not synced) |
| Prose voice rules (game-project) | **Authoritative voice for all document prose** in this project (GDD, pitch, notes, dev-crew notes): show don't tell, specificity, no em-dashes, no formatting theatrics. Separate from the in-fiction voice (`knowledge-base/synthesis/voice-style-guide.md`). | resources/prose-voice-rules.md |
