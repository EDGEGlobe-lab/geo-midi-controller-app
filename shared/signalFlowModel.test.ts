import { describe, expect, it } from "vitest";
import { deriveSignalFlowStages } from "./signalFlowModel";

describe("signal flow model", () => {
  it("keeps input idle until user-initiated playback begins", () => {
    const stages = deriveSignalFlowStages({
      isPlaying: false,
      channel: "idle",
      mixBus: "idle",
      output: "locked",
    });
    expect(stages.map(stage => stage.state)).toEqual([
      "idle",
      "idle",
      "idle",
      "locked",
    ]);
  });

  it("reflects the current local route state without inventing an external signal", () => {
    const stages = deriveSignalFlowStages({
      isPlaying: true,
      channel: "ready",
      mixBus: "ready",
      output: "ready",
    });
    expect(stages.map(stage => stage.id)).toEqual(["IN", "CH", "BUS", "OUT"]);
    expect(stages.every(stage => stage.state === "ready")).toBe(true);
  });
});
