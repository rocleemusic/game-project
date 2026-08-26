// system/externals.ink — state_actions emit as EXTERNAL calls (choice-node-schema.md).
// The host binds these for real; these fallbacks make the canned web build run.

EXTERNAL recordBond(soul, category)
=== function recordBond(soul, category)
    // no-op fallback stub
    ~ return 0

EXTERNAL recordKnowledge(phrase)
=== function recordKnowledge(phrase)
    // no-op fallback stub
    ~ return 0

EXTERNAL recordThreadMove(thread_id)
=== function recordThreadMove(thread_id)
    // no-op fallback stub
    ~ return 0

EXTERNAL recordCanonWrite(fact)
=== function recordCanonWrite(fact)
    // no-op fallback stub
    ~ return 0

EXTERNAL gateCleared(gate_id)
=== function gateCleared(gate_id)
    // no-op fallback stub
    ~ return 0

