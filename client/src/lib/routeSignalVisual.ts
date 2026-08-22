export type RouteVisualStatus = "locked" | "ready" | "error" | "idle";

export type RouteVisualStage = {
  id: "in" | "channel" | "bus" | "out";
  label: string;
  status: RouteVisualStatus;
};

export function createRouteVisualStages(input: { stereoIn: RouteVisualStatus; channel: RouteVisualStatus; mixBus: RouteVisualStatus; stereoOut: RouteVisualStatus }): RouteVisualStage[] {
  return [
    { id: "in", label: "STEREO IN", status: input.stereoIn },
    { id: "channel", label: "CHANNEL RACK", status: input.channel },
    { id: "bus", label: "MIX BUS", status: input.mixBus },
    { id: "out", label: "STEREO OUT", status: input.stereoOut },
  ];
}

export function routeVisualSummary(stages: RouteVisualStage[], signalActive: boolean): string {
  const readyCount = stages.filter((stage) => stage.status === "ready").length;
  const errors = stages.some((stage) => stage.status === "error");
  if (errors) return "Route needs attention";
  if (readyCount === stages.length && signalActive) return "Live browser signal visualised";
  if (readyCount === stages.length) return "Route ready; waiting for browser signal";
  return "Route is awaiting browser playback";
}
