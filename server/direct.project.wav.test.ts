import { describe, expect, it } from "vitest";
import { catalogueSourceUrl, parkwayCatalogue, parkwaySyntheticVocalVariants, projectAssetPlaybackUrl } from "../shared/parkwayCatalogue";

describe("direct PARKWAY WAV playback URLs", () => {
  it("uses a same-origin project-storage route for every instrumental master and never embeds an external host", () => {
    expect(parkwayCatalogue).toHaveLength(20);
    for (const track of parkwayCatalogue) {
      const url = catalogueSourceUrl(track);
      expect(url).toMatch(/^\/manus-storage\/[A-Za-z0-9_./-]+\.wav$/);
      expect(url).not.toMatch(/cloudfront|^https?:\/\//i);
    }
  });

  it("uses the same direct route for the separately registered synthetic vocal asset", () => {
    for (const variant of parkwaySyntheticVocalVariants) {
      expect(projectAssetPlaybackUrl(variant.storageKey)).toMatch(/^\/manus-storage\/[A-Za-z0-9_./-]+\.wav$/);
    }
    expect(() => projectAssetPlaybackUrl("https://example.test/audio.wav")).toThrow("relative project storage key");
  });
});
