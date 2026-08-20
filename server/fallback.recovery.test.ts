import { describe, expect, it } from "vitest";
import { clearFallbackForManualSource, decideFallbackRecovery, MAX_FALLBACK_ATTEMPTS } from "../client/src/lib/fallbackRecovery";

describe("Night Drive fallback recovery decisions", () => {
  it("does not activate while the visible fallback control is paused", () => {
    expect(decideFallbackRecovery({ enabled: false, attempts: 0, hasFallbackSource: false })).toBe("paused");
  });

  it("stops automatic replacement at the configured retry cap", () => {
    expect(decideFallbackRecovery({ enabled: true, attempts: MAX_FALLBACK_ATTEMPTS, hasFallbackSource: false })).toBe("retry-limit");
  });

  it("does not recursively replace a failing stored fallback source", () => {
    expect(decideFallbackRecovery({ enabled: true, attempts: 0, hasFallbackSource: true })).toBe("fallback-source-failed");
  });

  it("clears fallback state when a user selects a source manually", () => {
    expect(clearFallbackForManualSource()).toEqual({ fallbackSourceUrl: null, fallbackSelection: null });
  });
});
