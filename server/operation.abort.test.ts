import { describe, expect, it } from "vitest";
import { isExpectedOperationAbort } from "../client/src/lib/operationAbort";

describe("expected browser operation abort detection", () => {
  it("silences media aborts caused by replacing or stopping a source", () => {
    expect(isExpectedOperationAbort(new DOMException("The operation was aborted.", "AbortError"))).toBe(true);
    expect(isExpectedOperationAbort(new Error("The play() request was interrupted by a new load request."))).toBe(true);
  });

  it("preserves genuine playback failures for visible recovery", () => {
    expect(isExpectedOperationAbort(new Error("NotAllowedError: playback is blocked"))).toBe(false);
    expect(isExpectedOperationAbort(new Error("Network source could not load"))).toBe(false);
  });
});
