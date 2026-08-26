# game-project

The real, in-development territory behind **[game-project-cartographer](https://github.com/rocleemusic/game-project-cartographer)** — a game I am making, caught mid-engine-pivot. This repo is here so you can walk the map against the actual files.

## The map

- **Agent door** — [`map/catalog.md`](map/catalog.md). Load it, open one card, then the source. Stop.
- **Human door** — `map/surface.html`. Download it and open it in a browser. The territory as a chart, with the chain a change sets off lit up and the wrong turns marked.
- Naming traps — [`map/collisions.md`](map/collisions.md). Open work — [`map/open-work.md`](map/open-work.md).

## The territory

Two engines (a live Phaser build, a parked Unreal port), an ink narrative pipeline, JSON content records, 17 numbered design docs, and an external task board. The front door for the whole project is [`CONTEXT.md`](CONTEXT.md).

## What this public copy leaves out

- **Build junk** — `node_modules`, `dist`, build caches. Regenerable, and the map scopes them out.
- **Third-party raw material** under `knowledge-base/` — the Frieren, Ghibli, and Myst source analysis, and the extracted dialogue corpus. Only my own synthesis is kept. Every map door still resolves.

Everything else is the real mess. That is the point. The map lets a cold reader change one system without eating the whole tree.
