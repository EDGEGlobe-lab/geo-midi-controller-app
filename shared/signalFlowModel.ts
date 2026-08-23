export type SignalRouteState = "idle" | "ready" | "error" | "locked";

export type SignalFlowStageId = "IN" | "CH" | "BUS" | "OUT";

export type SignalFlowStage = {
  id: SignalFlowStageId;
  title: string;
  state: SignalRouteState;
  detail: string;
};

export function deriveSignalFlowStages({
  isPlaying,
  channel,
  mixBus,
  output,
}: {
  isPlaying: boolean;
  channel: SignalRouteState;
  mixBus: SignalRouteState;
  output: SignalRouteState;
}): SignalFlowStage[] {
  return [
    {
      id: "IN",
      title: "Input",
      state: isPlaying ? "ready" : "idle",
      detail: isPlaying
        ? "Original source is moving after a listener action."
        : "Waiting for a listener-initiated play action.",
    },
    {
      id: "CH",
      title: "Channel",
      state: channel,
      detail: "Browser-local channel rack route only.",
    },
    {
      id: "BUS",
      title: "Mix bus",
      state: mixBus,
      detail: "Local gain, pan, and analyser path only.",
    },
    {
      id: "OUT",
      title: "Stereo out",
      state: output,
      detail: "Browser output; no device selection or transmission control.",
    },
  ];
}

export function selectSignalFlowStage(
  stages: SignalFlowStage[],
  requestedId: string
): SignalFlowStage {
  return stages.find(stage => stage.id === requestedId) ?? stages[0];
}
