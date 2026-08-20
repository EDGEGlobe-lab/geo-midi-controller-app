import { describe, expect, it } from "vitest";
import { DEVICE_FIRMWARE_DELIVERY_SUPPORTED, isPlaybackOnlyProduct, LIVE_CAPTURE_SUPPORTED, productReadinessAssets } from "../client/src/lib/playbackProduct";

describe("playback-first product boundary", () => {
  it("does not enable live microphone, vocal, instrument, or hardware capture", () => {
    expect(LIVE_CAPTURE_SUPPORTED).toBe(false);
    expect(isPlaybackOnlyProduct()).toBe(true);
  });

  it("exposes software assets while refusing connected-device firmware delivery", () => {
    expect(productReadinessAssets.some((asset) => asset.id === "asset-upgrade" && asset.state === "READY")).toBe(true);
    expect(DEVICE_FIRMWARE_DELIVERY_SUPPORTED).toBe(false);
    expect(productReadinessAssets.find((asset) => asset.id === "firmware-boundary")?.state).toBe("NOT PROVIDED");
  });
});
