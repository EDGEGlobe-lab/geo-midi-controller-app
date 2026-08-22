import { describe, expect, it } from "vitest";
import {
  advanceProductionOperation,
  formatOperationDuration,
  initialProductionOperations,
  productionOperationLabel,
} from "./productionOperations";

describe("production operations", () => {
  it("moves user-initiated local checks from ready to in-progress to complete", () => {
    const started = advanceProductionOperation(
      initialProductionOperations,
      "source-readiness"
    );
    expect(started.find(item => item.id === "source-readiness")?.state).toBe(
      "in-progress"
    );
    const completed = advanceProductionOperation(started, "source-readiness");
    expect(completed.find(item => item.id === "source-readiness")?.state).toBe(
      "complete"
    );
  });

  it("does not bypass blocked rights or generation gates", () => {
    const updated = advanceProductionOperation(
      initialProductionOperations,
      "vocal-masters-14-20"
    );
    expect(updated.find(item => item.id === "vocal-masters-14-20")?.state).toBe(
      "blocked"
    );
    expect(productionOperationLabel("in-progress")).toBe("IN PROGRESS");
  });

  it("formats media durations without producing a sixty-second field", () => {
    expect(formatOperationDuration(299.8)).toBe("04:59");
    expect(formatOperationDuration(0)).toBe("00:00");
  });
});
