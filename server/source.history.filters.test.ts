import { describe, expect, it } from "vitest";
import { filterSourceHistory, sourceHistoryGenre, sourceHistoryProvenance, sourceHistoryTags } from "../shared/sourceHistoryFilters";

const items = [
  { filename: "Night Drive fallback.wav", assetType: "audio", tags: '["pre-generated-fallback","underground-techno"]', createdAt: new Date("2026-08-10T10:00:00.000Z") },
  { filename: "Manus upload.mp3", assetType: "audio", tags: '["manus-ai-upload","user-approved","synthwave-drive"]', createdAt: new Date("2026-08-15T10:00:00.000Z") },
  { filename: "Original take.wav", assetType: "audio", tags: '["original","electro-breaks"]', createdAt: new Date("2026-08-20T10:00:00.000Z") },
];

describe("PARKWAY audio source history filters", () => {
  it("derives safe display-only provenance and genre labels from stored owner-scoped tags", () => {
    expect(sourceHistoryProvenance(sourceHistoryTags(items[0].tags))).toBe("PRE-GENERATED FALLBACK");
    expect(sourceHistoryGenre(sourceHistoryTags(items[1].tags))).toBe("synthwave-drive");
  });

  it("combines text, provenance, genre, and date filters without requesting broader history data", () => {
    expect(filterSourceHistory(items, { query: "", provenance: "MANUS AI UPLOAD", genre: "synthwave-drive", from: "2026-08-14", to: "2026-08-16" }).map((item) => item.filename)).toEqual(["Manus upload.mp3"]);
    expect(filterSourceHistory(items, { query: "original", provenance: "", genre: "", from: "", to: "" }).map((item) => item.filename)).toEqual(["Original take.wav"]);
  });
});
