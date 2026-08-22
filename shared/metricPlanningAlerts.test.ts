import { describe, expect, it } from "vitest";
import {
  getMidpointPlanningAlerts,
  getPlanningRangeState,
  midpointThreshold,
} from "./metricPlanningAlerts";

describe("midpoint planning alerts", () => {
  it("calculates a deterministic midpoint from a planning range", () => {
    expect(
      midpointThreshold({ targetMinimum: 5_000, targetMaximum: 5_000_000 })
    ).toBe(2_502_500);
  });

  it("marks only verified values at or above the midpoint as reached", () => {
    const alerts = getMidpointPlanningAlerts([
      {
        id: "stars",
        label: "Stars",
        verifiedCount: 2_502_500,
        targetMinimum: 5_000,
        targetMaximum: 5_000_000,
      },
      {
        id: "forks",
        label: "Forks",
        verifiedCount: 2,
        targetMinimum: 27_900,
        targetMaximum: 300_000_000,
      },
    ]);
    expect(alerts.map(alert => alert.reached)).toEqual([true, false]);
  });

  it("labels verified counts without presenting planning targets as live counts", () => {
    expect(
      getPlanningRangeState({
        verifiedCount: 4,
        targetMinimum: 5,
        targetMaximum: 10,
      })
    ).toBe("below-range");
    expect(
      getPlanningRangeState({
        verifiedCount: 5,
        targetMinimum: 5,
        targetMaximum: 10,
      })
    ).toBe("within-range");
    expect(
      getPlanningRangeState({
        verifiedCount: 11,
        targetMinimum: 5,
        targetMaximum: 10,
      })
    ).toBe("above-range");
  });
});
