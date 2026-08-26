---
found: 2026-08-18
evidence: 2026-08-18-content-tools-and-spell-unlock-handoff.md
---

# One shared Playwright browser context across screenshots leaks save state between them

Capturing several screens in one script by reusing a single browser context (same `localStorage`, same autosave) made later captures show a "Resume" gate instead of the intended screen — an earlier capture's mode-5 autosave was still there when the next one loaded.

**Fix:** a fresh browser context per screen capture when the scenario cares about starting from a clean slate. Reusing a context is fine for a single continuous flow (that's the normal `playtest.mjs` case); it's specifically multi-screen screenshot batches, each meant to start fresh, that need isolation.
