import { describe, expect, it } from "vitest";
import { catalogueAssetTags, catalogueSourceUrl, catalogueWaveformPreview, parkwayCatalogue } from "../shared/parkwayCatalogue";

describe("PARKWAY catalogue visual and voice metadata", () => {
  it("defines twenty distinct five-minute instrumental sources with individual visual identities", () => {
    expect(parkwayCatalogue).toHaveLength(20);
    expect(new Set(parkwayCatalogue.map((track) => track.storageKey)).size).toBe(20);
    expect(new Set(parkwayCatalogue.map((track) => track.number)).size).toBe(20);
    for (const track of parkwayCatalogue) {
      expect(track.durationMs).toBe(300_000);
      expect(catalogueSourceUrl(track)).toBe(`/manus-storage/${track.storageKey}`);
      expect(JSON.parse(catalogueWaveformPreview(track))).toHaveLength(72);
    }
  });

  it("keeps lyric timing as an optional original synthetic-vocal guide and does not alter instrumental provenance", () => {
    for (const track of parkwayCatalogue) {
      expect(track.lyricCues).toHaveLength(4);
      expect(track.lyricCues.every((cue, index, cues) => cue.text.length > 0 && cue.endMs > cue.startMs && (index === 0 || cue.startMs > cues[index - 1].endMs))).toBe(true);
      expect(catalogueAssetTags(track)).toEqual(expect.arrayContaining(["instrumental", "no-human-voice-source", "synthetic-vocal-only-policy"]));
      expect(catalogueAssetTags(track)).not.toContain("synthetic-vocal-variant");
    }
  });
});
