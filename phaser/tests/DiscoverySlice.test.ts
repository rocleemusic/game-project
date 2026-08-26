/**
 * `DiscoverySlice` — endings reached, cumulative across a life's years (T13
 * Phase 5).
 *
 * The slice contract, exercised the way `SaveLoad.test.ts` exercises the
 * others: capture is a pure read, `check` refuses a payload it cannot use
 * rather than coercing it, and restore REPLACES rather than merges. Plus the
 * two rules specific to this counter — the one-per-tier cap that makes the
 * numerator honest when `record` fires on every render of the final screen, and
 * the refusal of a tier the vocabulary does not know, which would otherwise
 * inflate "X of 3 endings" permanently.
 */
import { describe, expect, it } from "vitest";
import { DiscoverySlice } from "../src/world/save/slices/DiscoverySlice";
import { FESTIVAL_TIERS } from "../src/world/FestivalScore";

describe("DiscoverySlice", () => {
  it("records each tier once, however many times the final screen re-renders", () => {
    const slice = new DiscoverySlice();
    expect(slice.record("warm")).toBe(true);
    expect(slice.record("warm")).toBe(false);
    expect(slice.record("warm")).toBe(false);
    expect(slice.tiersReached()).toEqual(["warm"]);
  });

  it("accumulates across years and captures them sorted", () => {
    const slice = new DiscoverySlice();
    slice.record("warm");
    slice.record("quiet");
    expect(slice.capture()).toEqual({ tiersReached: ["quiet", "warm"] });
  });

  it("refuses a tier the ruled vocabulary does not name", () => {
    const slice = new DiscoverySlice();
    expect(slice.record("radiant")).toBe(false);
    expect(slice.tiersReached()).toEqual([]);
    // The vocabulary it checks against is the one `tierFor` produces.
    for (const tier of FESTIVAL_TIERS) expect(new DiscoverySlice().record(tier)).toBe(true);
  });

  it("rejects a malformed payload instead of coercing it", () => {
    const slice = new DiscoverySlice();
    expect(slice.check(42)?.reason).toBe("malformed");
    expect(slice.check({ tiersReached: "warm" })?.reason).toBe("malformed");
    expect(slice.check({ tiersReached: [1, 2] })?.reason).toBe("malformed");
    expect(slice.check({ tiersReached: ["warm"] })).toBeNull();
  });

  it("accepts a payload holding a tier it does not know, and drops just that tier", () => {
    // A save written by a build with a fourth tier is still a readable save —
    // refusing the whole payload would lose the tiers this build does grasp.
    const slice = new DiscoverySlice();
    expect(slice.check({ tiersReached: ["warm", "radiant"] })).toBeNull();
    slice.restore({ tiersReached: ["warm", "radiant"] });
    expect(slice.tiersReached()).toEqual(["warm"]);
  });

  it("restores by REPLACING, so one life's endings cannot leak into the next", () => {
    const slice = new DiscoverySlice();
    slice.record("grand");
    slice.restore({ tiersReached: ["quiet"] });
    expect(slice.tiersReached()).toEqual(["quiet"]);
  });

  it("captures under the id the schema names", () => {
    expect(new DiscoverySlice().id).toBe("discovery");
  });
});
