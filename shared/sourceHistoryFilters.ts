export type SourceHistoryFilterItem = { filename: string; assetType: string; tags: string | null; createdAt: Date | string };
export type SourceHistoryFilters = { query: string; provenance: string; genre: string; from: string; to: string };

const PROVENANCE_TAGS: Record<string, string> = {
  "pre-generated-fallback": "PRE-GENERATED FALLBACK",
  "manus-ai-upload": "MANUS AI UPLOAD",
  "ai-project-audio": "AI PROJECT AUDIO",
  "source-file-supplied": "SUPPLIED SOURCE FILE",
  original: "ORIGINAL SOURCE",
};

const GENRE_PATTERN = /(techno|electro|breaks|synth|ambient|bass|house|drone|pulse|pop)/i;

export function sourceHistoryTags(value: string | null) {
  try { const tags = value ? JSON.parse(value) : []; return Array.isArray(tags) ? tags.filter((tag): tag is string => typeof tag === "string") : []; } catch { return []; }
}

export function sourceHistoryProvenance(tags: string[]) {
  return Object.entries(PROVENANCE_TAGS).find(([tag]) => tags.includes(tag))?.[1] ?? "PROJECT AUDIO";
}

export function sourceHistoryGenre(tags: string[]) {
  return tags.find((tag) => GENRE_PATTERN.test(tag)) ?? "UNLABELLED";
}

export function filterSourceHistory<T extends SourceHistoryFilterItem>(items: T[], filters: SourceHistoryFilters) {
  const query = filters.query.trim().toLowerCase();
  return items.filter((item) => {
    const tags = sourceHistoryTags(item.tags);
    const date = new Date(item.createdAt).toISOString().slice(0, 10);
    const haystack = [item.filename, item.assetType, ...tags].join(" ").toLowerCase();
    return (!query || haystack.includes(query))
      && (!filters.provenance || sourceHistoryProvenance(tags) === filters.provenance)
      && (!filters.genre || sourceHistoryGenre(tags) === filters.genre)
      && (!filters.from || date >= filters.from)
      && (!filters.to || date <= filters.to);
  });
}
