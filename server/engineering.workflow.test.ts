import { describe, expect, it } from "vitest";
import { ENGINEERING_LANES, nextEngineeringStage, updateEngineeringLane } from "../client/src/lib/engineeringWorkflow";

describe("PARKWAY Engineering Centre workflow", () => {
  it("cycles only through declared local workflow stages", () => {
    expect(nextEngineeringStage("planned")).toBe("prepared");
    expect(nextEngineeringStage("parked")).toBe("planned");
  });

  it("updates only the user-selected local workflow lane", () => {
    const next = updateEngineeringLane(ENGINEERING_LANES, "production");
    expect(next.find((lane) => lane.id === "production")?.stage).toBe("prepared");
    expect(next.find((lane) => lane.id === "systems")?.stage).toBe("prepared");
  });
});
