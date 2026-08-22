import { describe, expect, it } from "vitest";
import {
  isTransmissionEnabled,
  radioTransmissionReadiness,
} from "./radioTransmissionReadiness";

describe("radio transmission readiness", () => {
  it("keeps transmission disabled until an independently approved launch exists", () => {
    expect(isTransmissionEnabled()).toBe(false);
    expect(radioTransmissionReadiness).toHaveLength(5);
    expect(
      radioTransmissionReadiness.every(gate => gate.status === "required")
    ).toBe(true);
  });
});
