import { describe, expect, it } from "vitest";
import { BASS_PROFILES, browserStereoMeter, isBassProfileId } from "../client/src/lib/stereoCalibration";

describe("PARKWAY stereo bass calibration", () => {
  it("keeps the browser bass presets bounded with a protective preamp and reference volume", () => {
    expect(BASS_PROFILES.reference.referenceVolume).toBe(60);
    expect(Object.values(BASS_PROFILES).every((profile) => profile.bassDb >= 0 && profile.bassDb <= 4 && profile.preamp > 0 && profile.preamp <= 1)).toBe(true);
    expect(isBassProfileId("focused")).toBe(true);
    expect(isBassProfileId("external-weather-model")).toBe(false);
  });

  it("reports browser signal peak and headroom without claiming speaker loudness", () => {
    const meter = browserStereoMeter([0, 0.5, -0.5, 0.25]);
    expect(meter.peakDb).toBeCloseTo(-6.0206, 3);
    expect(meter.headroomDb).toBeCloseTo(6.0206, 3);
    expect(browserStereoMeter([0, 0]).peakDb).toBeNull();
  });
});
