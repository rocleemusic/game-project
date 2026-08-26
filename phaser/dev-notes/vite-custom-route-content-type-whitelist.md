---
found: 2026-08-22
evidence: vite.config.ts — the /run-images dev route
---

# A whitelist-based `Content-Type` switch silently misclassifies any extension you forget to add

`vite.config.ts`'s custom `/run-images` dev-server route serves backdrop images with an explicit extension → MIME-type switch, defaulting anything not matched to `image/jpeg`. When PNG backdrops were added to the run folder without adding `.png` to the switch, they were served as `image/jpeg` — no error, no 404, just a wrong header that some consumers tolerate and others (or later a stricter renderer) won't.

**Fix (already applied):** `.png` is in the switch now (`vite.config.ts` around line 53). The general caution: any hand-written extension→type switch in a custom dev-server route is a trap for the *next* extension someone adds to the served folder, not just the ones known when the route was written. Default to erroring or logging on an unmatched extension, not silently guessing the most common type.
