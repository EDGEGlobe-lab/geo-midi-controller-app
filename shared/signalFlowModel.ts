export type SignalRouteState = "idle" | "ready" | "error" | "locked";

export type SignalFlowStage = {
  id: "IN" | "CH" | "BUS" | "OUT";
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
