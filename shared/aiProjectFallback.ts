export const NIGHT_DRIVE_FALLBACK_STORAGE_KEY = "parkway-autonomous-audio_b0d36279.wav";
export const NIGHT_DRIVE_FALLBACK_DURATION_MS = 60_000;
export const NIGHT_DRIVE_FALLBACK_MIME_TYPE = "audio/wav";

export const nightDriveGenreIndex = [
  { id: "underground-techno", label: "Underground techno", prompt: "Underground techno: 156 BPM, D major, restrained warehouse kick, sub pulse, metallic pluck, neon-pink motion bed." },
  { id: "electro-breaks", label: "Electro breaks", prompt: "Electro breaks: 156 BPM, D major, syncopated break pattern, root bass movement, crisp transient plucks, abstract signal haze." },
  { id: "minimal-pulse", label: "Minimal pulse", prompt: "Minimal pulse: 156 BPM, D major, sparse kick architecture, controlled sub, short chord stabs, long night-air pad." },
  { id: "synthwave-drive", label: "Synthwave drive", prompt: "Synthwave drive: 156 BPM, D major, arpeggiated pluck, stable bass, wide pad, concise risers, no vocal capture." },
] as const;

export type NightDriveGenre = (typeof nightDriveGenreIndex)[number];

export function selectNightDriveGenre(random: () => number = Math.random): NightDriveGenre {
  const index = Math.min(nightDriveGenreIndex.length - 1, Math.max(0, Math.floor(random() * nightDriveGenreIndex.length)));
  return nightDriveGenreIndex[index];
}

export function fallbackAssetTags(genre: NightDriveGenre, trigger: "media-error" | "play-rejection") {
  return ["ai-project-audio", "pre-generated-fallback", "night-drive", genre.id, trigger];
}
