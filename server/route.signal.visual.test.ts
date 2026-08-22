import { describe, expect, it } from "vitest";
import { createRouteVisualStages, routeVisualSummary } from "../client/src/lib/routeSignalVisual";

describe("PARKWAY route signal visualisation", () => {
  it("maps only the actual shared audio-route stages in order", () => {
    expect(createRouteVisualStages({ stereoIn: "ready", channel: "ready", mixBus: "ready", stereoOut: "ready" })).toEqual([
      { id: "in", label: "STEREO IN", status: "ready" },
      { id: "channel", label: "CHANNEL RACK", status: "ready" },
      { id: "bus", label: "MIX BUS", status: "ready" },
      { id: "out", label: "STEREO OUT", status: "ready" },
    ]);
  });

  it("does not report a live signal when a route stage has an error or no browser meter signal", () => {
    const readyStages = createRouteVisualStages({ stereoIn: "ready", channel: "ready", mixBus: "ready", stereoOut: "ready" });
    expect(routeVisualSummary(readyStages, false)).toBe("Route ready; waiting for browser signal");
    expect(routeVisualSummary(createRouteVisualStages({ stereoIn: "ready", channel: "error", mixBus: "idle", stereoOut: "locked" }), true)).toBe("Route needs attention");
  });
});
