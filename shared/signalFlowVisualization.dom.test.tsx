// @vitest-environment happy-dom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SignalFlowVisualization } from "@/components/SignalFlowVisualization";

afterEach(() => {
  cleanup();
});

describe("SignalFlowVisualization interaction", () => {
  it("selects BUS after a click and updates the accessible route explanation", () => {
    render(
      <SignalFlowVisualization
        isPlaying={false}
        channel="idle"
        mixBus="idle"
        output="locked"
      />
    );

    const input = screen.getByRole("button", { name: /IN Input/i });
    const bus = screen.getByRole("button", { name: /BUS Mix Bus/i });

    expect(input.getAttribute("aria-pressed")).toBe("true");
    expect(bus.getAttribute("aria-pressed")).toBe("false");

    fireEvent.click(bus);

    expect(input.getAttribute("aria-pressed")).toBe("false");
    expect(bus.getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByText(/BUS\s*\/\s*Mix bus/)).toBeTruthy();
    expect(
      screen.getByText("Local gain, pan, and analyser path only.")
    ).toBeTruthy();
  });
});
