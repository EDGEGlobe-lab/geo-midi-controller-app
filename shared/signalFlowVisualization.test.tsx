import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { SignalFlowVisualization } from "@/components/SignalFlowVisualization";

describe("SignalFlowVisualization", () => {
  it("renders an accessible local-route explanation with four native stage buttons", () => {
    const markup = renderToStaticMarkup(
      createElement(SignalFlowVisualization, {
        isPlaying: false,
        channel: "idle",
        mixBus: "idle",
        output: "locked",
      })
    );

    expect(markup).toContain('aria-labelledby="signal-flow-title"');
    expect(markup).toContain('role="list"');
    expect(markup.match(/<button/g)).toHaveLength(4);
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain("Waiting for a listener-initiated play action.");
    expect(markup).toContain("does not record input");
    expect(markup).toContain("or transmit audio");
  });
});
