import { describe, expect, it } from "vitest";
import { fallbackAssetTags, nightDriveGenreIndex, selectNightDriveGenre } from "../shared/aiProjectFallback";

describe("Night Drive AI project-audio fallback index", () => {
  it("selects only a declared genre prompt from the project index", () => {
    expect(selectNightDriveGenre(() => 0).id).toBe("underground-techno");
    expect(selectNightDriveGenre(() => 0.999).id).toBe("synthwave-drive");
    expect(nightDriveGenreIndex.every((genre) => genre.prompt.includes("156 BPM"))).toBe(true);
  });

  it("marks the stored source as a pre-generated fallback with its trigger", () => {
    expect(fallbackAssetTags(nightDriveGenreIndex[1], "media-error")).toEqual(expect.arrayContaining(["ai-project-audio", "pre-generated-fallback", "electro-breaks", "media-error"]));
  });
});
