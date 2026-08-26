---
found: 2026-08-19
evidence: 2026-08-19-ui-migration-handoff.md
---

# Inside a `Container`, children draw in ADD ORDER — `.setDepth()` on a child is ignored

`.setDepth()` only controls draw order among a *scene's* top-level children. A child added to a `Container` renders in whatever order it was `.add()`-ed to that container, regardless of any depth value set on it. This caused a text label to render underneath its own background rectangle, because the background was added second.

**Fix:** inside a `Container`, get draw order right by controlling `.add()` order — back-to-front — not by calling `.setDepth()` on the children. If a container's contents need to interleave depth with something outside it, that's a sign the layering doesn't belong in one container.
