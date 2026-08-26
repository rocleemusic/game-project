# ink ↔ Unreal Engine 5 — integration findings

> **⚠ SUPERSEDED (ruling 2026-08-02): the runtime is Inkpot.** inkcpp was rejected — its Fab listing stops at UE 5.7 and the engine is UE 5.8. The inkcpp-first ranking below is history; the comparison table remains useful. Authority: `gdd/12-technical-overview.md`.

> Research pass (2026-07-18) on running inkle's **ink** as the narrative layer in **UE5** for the ~6-week
> vertical slice. Prompted by the Heaven's Vault watch — ink is inkle's own tool, so its
> preconditioned-atomic-content model matches our deduction loop natively. See `game-project-resources.md`
> ("ink + Inky") for the tool links.

## TL;DR verdict

**Viable, and production-proven.** The Chinese Room ships ink-in-Unreal on *Bloodlines 2* and *Still Wakes
the Deep*. Two live, **MIT-licensed**, actively-maintained UE5 plugins exist. **Prototype narrative free in
Inky's web export today; ship the runtime via `inkcpp` (easiest) or `Inkpot` (richest, UE 5.7+).**

## The two roles — keep them distinct

- **(a) Prototyping tool — trivial, do it now.** Author in the **Inky** editor → `File ▸ Export for web…` →
  a self-contained HTML/JS build on **inkjs**, playable/branch-testable in a browser. Zero Unreal, zero cost.
  **This *is* our "simple HTML click-zones" canned-mode proto idea** (pitch P7 / ideas) — realized for free.
- **(b) Shipped runtime narrative layer inside UE5 — the real question.** Use a plugin (below). ink handles
  the **narrative flow** (branching, variables, conditional/preconditioned content, knowledge-state gating);
  our **cross-session state / ICM stays deterministic game-code** — consistent with the locked
  "runtime state = mechanics, not agent" call. ink is the flow layer; our save-state sits beside it.

## Options

| Option | Repo | License | Activity | UE versions | BP/C++ | Ext. functions + state | Maturity | Setup |
|---|---|---|---|---|---|---|---|---|
| **inkcpp** (JBenda) | github.com/JBenda/inkcpp | MIT | rel. **Jun 2026** | On **Fab**; configurable (community reports ~5.2–5.7 — verify on the Fab listing) | Both (+BP helpers) | **Yes** — external fns (w/ fallback), globals, **snapshots** for save, observers, tags; full ink 1.1 (ink-proof tested) | Native C++, no deps, on Fab | **Low** — install from Fab, enable, add InkRuntime actor; often no compile |
| **Inkpot** (The Chinese Room) | github.com/The-Chinese-Room/Inkpot | MIT | rel. **Jul 2026**, very active | **UE 5.7+ only** (older tags e.g. v1.11.21 predate that — unverified for 5.3–5.5) | Both; strong **BP-first** wrapper | **Yes** — external fns, var get/set + **observers**, full List support, JSON state serialization | **Production lineage** (TCR's shipped runtime); includes **"the Blotter"** in-editor variable debugger | **Medium** — clone to `Plugins/`, compile from source (VS2022 + **.NET 5.0** for bundled `inklecate.exe`) |
| inkjs in WebBrowser widget | y-lohse/inkjs + UE `WebBrowserWidget` | MIT | current | through 5.7 (aging CEF/Chromium) | JS↔UE bridge (hand-rolled) | possible but manual; state DIY | **fallback only** | High effort, low payoff — demo/HUD, not a dialogue runtime |
| ~~UnrealInk~~ (DavidColson) | github.com/DavidColson/UnrealInk | unspecified | **Sept 2021** | **UE4.27 only** | Mono/C# | via C# API | **abandoned for UE5** | — do not use |

## Recommendation (ranked)

1. **`inkcpp` — best first choice for the 6-week slice.** Fab plugin (install-and-enable, likely no source
   compile), wider UE-version range (not locked to 5.7), and it covers everything we need: variables,
   preconditioned content, **external functions**, and **snapshots** for save/load. Lowest
   time-to-first-choice-on-screen.
2. **`Inkpot` — if we commit to UE 5.7+ and want the best Blueprint ergonomics.** The **Blotter** runtime
   variable debugger is a real win for a game that gates dialogue on *what the player knows*, plus full List
   support and a shipped-AAA lineage. Cost: UE 5.7+ and a source compile. If we start the project fresh on
   5.7, the version floor is a non-issue.

**Net:** *prototype in Inky/web now; ship via `inkcpp` (or `Inkpot` on UE 5.7+ for the BP wrapper + debugger).*

## Caveats — verify hands-on (build in week 1, not week 5)

- **Engine-version choice is now coupled to plugin choice.** Inkpot needs **UE 5.7+**; inkcpp spans wider.
  Decide the target UE version with this in mind (a reason to consider starting on 5.7 if we want Inkpot).
- **Confirm inkcpp's exact UE version on the current Fab listing** before committing.
- **Inkpot source-compile toolchain:** VS2022 + **.NET 5.0** (the bundled `inklecate.exe` needs it) — common
  first-run failure point.
- **External-function signatures:** prototype the actual `EXTERNAL` calls (ink → game code) early — inkcpp
  uses `FInkVar` types (no template deduction). This is where ink-calls-into-Unreal either flows or fights.
- **Save/state depth:** both support snapshots/serialization, but persistent + mid-story save is the classic
  ink pain point — write a save/load smoke test in week 1.
- **Licensing clean:** ink, inkcpp, Inkpot all **MIT**. (UnrealInk unspecified — another reason to skip.)

## What this means for us (project takeaways)

- **Unblocks the P7 caveat.** The "Unreal needs a plugin/bridge — verify" flag is resolved: yes, two good ones.
- **Prototype path is free and immediate** — start authoring the deduction loop in Inky now; the web export
  doubles as the canned-mode proof.
- **Pipeline fit:** the Content/Dialogue Agent emitting **ink** (→ compiled story file = a canned path) stays
  a clean design — ink is both the human-authorable and agent-authorable format.
- **Decision to surface in Phase 3:** target **UE version** (inkcpp-wide vs. commit-to-5.7-for-Inkpot), and
  which plugin — a `gdd/12-technical-overview.md` + `gdd/11-ai-agents-and-pipeline.md` item.

## Sources
- Inkpot — https://github.com/The-Chinese-Room/Inkpot · tags https://github.com/The-Chinese-Room/Inkpot/tags · demo https://github.com/The-Chinese-Room/InkpotDemo
- inkcpp — https://github.com/JBenda/inkcpp · Unreal wiki https://github.com/JBenda/inkcpp/wiki/Unreal · Fab https://www.unrealengine.com/marketplace/en-US/product/inkcpp
- goldenxp guides — Inkpot https://docs.goldenxp.com/ink/unrealinkpot/ · inkcpp https://docs.goldenxp.com/ink/unrealinkcpp/ · Inky web testing https://docs.goldenxp.com/ink/testinginkweb/
- ink homepage — https://www.inklestudios.com/ink/ · inkjs https://github.com/y-lohse/inkjs
- The Chinese Room / ink + Unreal — https://www.pcgamer.com/inkles-scripting-language-ink-has-unreal-integration-thanks-to-bloodlines-2-developers-the-chinese-room/ · Paradox dev diary https://www.paradoxinteractive.com/games/vampire-the-masquerade-bloodlines-2/news/mission-scripting-and-ink
- UnrealInk (legacy) — https://github.com/DavidColson/UnrealInk
