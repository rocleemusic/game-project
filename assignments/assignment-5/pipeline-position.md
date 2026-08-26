# Where the Choice Designer sits in the pipeline

The agent submitted for Assignment #5 runs **step 5** of the storyline authoring process
([`plans/2026-08-03-storyline-authoring-process.md`](../../plans/2026-08-03-storyline-authoring-process.md)).

```mermaid
flowchart TD
    ROC(["<b>Roc</b> — intent + direction"])

    subgraph BATCH ["Steps 1–3 · run as a batch across every soul, agents fan out one soul each"]
        direction TB
        S1["<b>1 · Soul package</b><br/>card · arc · thread registry · role"]
        S2["<b>2 · Thread shape</b><br/>2–3 reveals per thread, in order"]
        S3["<b>3 · Dependency order</b><br/>what each reveal needs first"]
        S1 --> S2 --> S3
    end

    S4["<b>4 · Cross-soul pass</b><br/>one piece per stance pair, gated on co-presence"]
    S5["<b>5 · Author each conversation</b><br/>entry gate · incoming states · per-state content<br/>fallback · outcomes"]
    G1{{"<b>Human gate</b><br/>Roc approves the graphs<br/><i>before any prose exists</i>"}}
    S6["<b>6 · Lines</b><br/>prose, one slot per call"]
    S7["<b>7 · Seam pass</b><br/>check, not invent"]

    ROC --> BATCH
    S3 --> S4 --> S5 --> G1 --> S6 --> S7

    S7 --> C1[("scene-graph.json")]
    C1 --> C2["resolver"]
    C2 --> C3[("story.json<br/>inkVersion 21")]
    C3 --> C4(["lantern — browser player"])
    C3 --> C5(["Unreal 5.8 — Inkpot runtime"])

    classDef here fill:#E3B26A44,stroke:#CE8F45,stroke-width:4px,color:#000
    classDef gate fill:#E3B26A22,stroke:#CE8F45,stroke-width:2px
    classDef human fill:#90A67C22,stroke:#4E6B4F,stroke-width:2px
    classDef store fill:#6E879422,stroke:#435966
    classDef run fill:#7C6A9422,stroke:#4E4269

    class S5 here
    class G1 gate
    class ROC human
    class C1,C3 store
    class C4,C5 run
```

## The pipeline, one sentence per step

1. **Soul package** — the Architect fills each NPC seed into a persona card with its arc, thread registry and role, so every thread names the card field it reveals.
2. **Thread shape** — each thread gets two or three reveals in order, plus where it leaves off on day 5, checked against the fact budget.
3. **Dependency order** — what each reveal needs before it can land, so no reveal depends on something unreachable and no flag is written without a reader.
4. **Cross-soul pass** — one shared piece per stance pair, gated on both souls being present, with every pair's fact feeding a thread on both sides.
5. **Author each conversation — THE CHOICE DESIGNER.** **Takes a thread document whose conversation sections read *Awaiting Choice designer* and fills them with structure — choice nodes, gates, options, outcomes and fallbacks — as content blocks and mermaid graphs, under the rule that all four incoming states walk without dead-ending.**
6. **Lines** — the Content agent writes the prose afterward, one slot per call, against the pinned card fields.
7. **Seam pass** — a final check that every cross-soul beat has an owner; it checks rather than invents.

## The dividing line

Step 5 exists because "what gets revealed" and "when it can be reached" are two different decisions.
The seat split off the Narrative Architect on 2026-08-04:

| Seat | Step | Owns | The line |
|---|---|---|---|
| Narrative Architect | 1–4 | Cards, arc, threads, thread shape, dependency order, how many conversations a thread gets | **revealed** |
| **Choice Designer** | **5** | **The conversations inside that frame** | **reachable** |
| Lines | 6 | The prose | **spoken** |

Two properties of that position are worth naming:

- **It is gated on both sides.** It never runs before step 3, because dependency order and the flag table are its *inputs*, not its outputs. And Roc approves its graphs before step 6 writes a single word — structure is cheap to redo, prose is not.
- **Its output is executable.** The mermaid graphs are not illustrations of a design held elsewhere; every label is a real schema field, and the design compiles through `scene-graph.json` into ink and runs in the game.

---

*A wider frame exists: [`narrative-pipeline/pipeline.md`](../../narrative-pipeline/pipeline.md) describes the
full 13-step generation procedure, from steering and intake through verification, the tell-purge, QA and the
final gate. The 7 steps above are the authoring process for one thread, which is the loop this agent runs in.*
