---
found: 2026-08-18
evidence: 2026-08-18-content-tools-and-spell-unlock-handoff.md, 2026-08-19-ui-migration-handoff.md
---

# The Claude-in-Chrome browser extension can't reach `localhost` or `file://`

Driving the extension against this project's Vite dev server (or a local file) doesn't work — its sandboxed context can't load `localhost` URLs or `file://` paths, so pages that would work fine in a normal tab fail to load through it.

**Fix:** use `tools/playtest.mjs` (real headless Chromium via Playwright, a separate process) for anything that needs to drive the local dev server or a local file. Reach for Claude-in-Chrome only for real, publicly-reachable URLs.

This is specifically about the Claude-in-Chrome extension (drives the user's real, already-logged-in Chrome). The separate in-app "Browser pane" tool (its own sandboxed Chromium, opened via `preview_start`) does reach `localhost` fine — confirmed live, 2026-08-23 — and is the right tool for interactive local-dev-server work that `playtest.mjs`'s scripted scenarios don't fit.
