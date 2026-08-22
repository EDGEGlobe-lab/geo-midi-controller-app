import { describe, expect, it } from "vitest";
import { workspaceDataPlan } from "../client/src/lib/workspaceDataPlan";

describe("PARKWAY workspace data plan", () => {
  it("avoids authenticated feature-data requests while the arrangement workspace is loading", () => {
    expect(workspaceDataPlan("Arrangement", true)).toEqual({ projectAssets: false, jobs: false, samplerOutputs: false, sourceHistory: false, savedStations: false, repositoryMetrics: false, hardwareRegistrations: false, compatibilityReview: false });
  });

  it("loads only the private records required by the active workspace and protects review data", () => {
    expect(workspaceDataPlan("Generator", false).projectAssets).toBe(true);
    expect(workspaceDataPlan("Radio", false).savedStations).toBe(true);
    expect(workspaceDataPlan("Repository", false).repositoryMetrics).toBe(true);
    expect(workspaceDataPlan("Settings", false)).toEqual({ projectAssets: false, jobs: false, samplerOutputs: false, sourceHistory: false, savedStations: false, repositoryMetrics: false, hardwareRegistrations: false, compatibilityReview: false });
    expect(workspaceDataPlan("Engineering", false)).toEqual({ projectAssets: false, jobs: false, samplerOutputs: false, sourceHistory: false, savedStations: false, repositoryMetrics: false, hardwareRegistrations: false, compatibilityReview: false });
    expect(workspaceDataPlan("Devices", false).hardwareRegistrations).toBe(true);
    expect(workspaceDataPlan("Review", false).compatibilityReview).toBe(false);
    expect(workspaceDataPlan("Review", true).compatibilityReview).toBe(true);
  });
});
