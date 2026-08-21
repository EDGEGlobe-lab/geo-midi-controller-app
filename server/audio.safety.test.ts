import { describe, expect, it } from "vitest";
import { clampMasterVolume, MASTER_VOLUME_FLOOR } from "../client/src/lib/audioSafety";

describe("Stereo Out master-volume floor", () => {
  it("never returns a level below the requested 50 percent listening minimum", () => {
    expect(clampMasterVolume(0)).toBe(MASTER_VOLUME_FLOOR);
    expect(clampMasterVolume(49)).toBe(MASTER_VOLUME_FLOOR);
  });

  it("preserves valid choices above the floor and caps unsafe maxima", () => {
    expect(clampMasterVolume(82)).toBe(82);
    expect(clampMasterVolume(120)).toBe(100);
  });
});
