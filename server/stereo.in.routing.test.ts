import { describe, expect, it } from "vitest";
import { shouldReconnectStereoIn } from "../client/src/lib/stereoInRouting";

describe("Stereo In routing", () => {
  it("connects an initial Stereo In route without requesting a disconnect", () => {
    expect(shouldReconnectStereoIn(null, "pluck")).toBe(true);
  });

  it("does not disconnect and reconnect an already selected Channel Rack strip", () => {
    expect(shouldReconnectStereoIn("pluck", "pluck")).toBe(false);
    expect(shouldReconnectStereoIn("pluck", "drums")).toBe(true);
  });
});
