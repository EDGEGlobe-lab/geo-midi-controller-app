import { describe, expect, it } from "vitest";
import {
  deriveSignalFlowStages,
  selectSignalFlowStage,
} from "./signalFlowModel";

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

  it("preserves error and lock states only for the browser route stages that report them", () => {
    const stages = deriveSignalFlowStages({
      isPlaying: true,
      channel: "error",
      mixBus: "ready",
      output: "locked",
    });

    expect(stages).toEqual([
      expect.objectContaining({
        id: "IN",
        state: "ready",
        detail: "Original source is moving after a listener action.",
      }),
      expect.objectContaining({
        id: "CH",
        state: "error",
        detail: "Browser-local channel rack route only.",
      }),
      expect.objectContaining({
        id: "BUS",
        state: "ready",
        detail: "Local gain, pan, and analyser path only.",
      }),
      expect.objectContaining({
        id: "OUT",
        state: "locked",
        detail: "Browser output; no device selection or transmission control.",
      }),
    ]);
  });

  it("returns the requested local explanation and falls back to input for an invalid persisted selection", () => {
    const stages = deriveSignalFlowStages({
      isPlaying: false,
      channel: "idle",
      mixBus: "idle",
      output: "locked",
    });

    expect(selectSignalFlowStage(stages, "BUS").id).toBe("BUS");
    expect(selectSignalFlowStage(stages, "UNKNOWN").id).toBe("IN");
  });
});
