export type ParkwayLyricCue = {
  startMs: number;
  endMs: number;
  text: string;
};

export type ParkwayCatalogueTrack = {
  id: string;
  number: number;
  title: string;
  slug: string;
  genre: string;
  mood: string;
  tempo: number;
  key: string;
  durationMs: number;
  storageKey: string;
  lyricCues: ParkwayLyricCue[];
};

export type ParkwaySyntheticVocalVariant = {
  trackId: string;
  storageKey: string;
  durationMs: number;
};

const FIVE_MINUTES_MS = 300_000;

const cues = (lines: [string, string, string, string]): ParkwayLyricCue[] => [
  { startMs: 20_000, endMs: 47_000, text: lines[0] },
  { startMs: 72_000, endMs: 99_000, text: lines[1] },
  { startMs: 132_000, endMs: 159_000, text: lines[2] },
  { startMs: 204_000, endMs: 235_000, text: lines[3] },
];

/**
 * Original PARKWAY project masters. Lyric cues are original, optional scripts
 * for a future separately-labelled synthetic EDM vocal variant; the registered
 * masters themselves remain instrumental and must not be represented as sung.
 */
export const parkwayCatalogue: ParkwayCatalogueTrack[] = [
  { id: "parkway-01", number: 1, title: "Night Drive Continuum", slug: "night-drive-continuum", genre: "Underground techno", mood: "Neon momentum", tempo: 126, key: "D minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-night-drive-continuum-master_af72128f.wav", lyricCues: cues(["City lights keep growing", "Follow the cyan line", "We move through midnight", "The road becomes our sound"]) },
  { id: "parkway-02", number: 2, title: "Cyan Transit", slug: "cyan-transit", genre: "Electro breaks", mood: "Glassy lift", tempo: 132, key: "A minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-cyan-transit-master_f5ad457d.wav", lyricCues: cues(["Cyan trains are turning", "Windows make a star", "Every beat is moving", "We know where we are"]) },
  { id: "parkway-03", number: 3, title: "Orbital Drift", slug: "orbital-drift", genre: "Progressive electronic", mood: "Weightless", tempo: 122, key: "E minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-orbital-drift-master_59045d25.wav", lyricCues: cues(["Float above the skyline", "Feel the planet sway", "Orbit keeps us dreaming", "Drift into the day"]) },
  { id: "parkway-04", number: 4, title: "Amber Timing", slug: "amber-timing", genre: "Minimal pulse", mood: "Precise", tempo: 124, key: "C minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-amber-timing-master_07613e8f.wav", lyricCues: cues(["Amber clocks are glowing", "Tap the steady beat", "Little gears are turning", "Rhythm finds our feet"]) },
  { id: "parkway-05", number: 5, title: "Magenta Vector", slug: "magenta-vector", genre: "Broken beat", mood: "Elastic", tempo: 130, key: "F minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-magenta-vector-master_b1c8bfcd.wav", lyricCues: cues(["Magenta arrows shimmer", "Bounce across the floor", "Every colour carries", "One more open door"]) },
  { id: "parkway-06", number: 6, title: "Midnight Raster", slug: "midnight-raster", genre: "Dark synthwave", mood: "Nocturnal", tempo: 118, key: "B minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-midnight-raster-master_482b3a5d.wav", lyricCues: cues(["Midnight pictures flicker", "Blue and silver glow", "Pixels make a pathway", "Softly as we go"]) },
  { id: "parkway-07", number: 7, title: "Signal Garden", slug: "signal-garden", genre: "Warm IDM", mood: "Curious", tempo: 120, key: "G minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-signal-garden-master_14bc1ed0.wav", lyricCues: cues(["Tiny signals blossom", "In a garden bright", "Every sound is growing", "Into kinder light"]) },
  { id: "parkway-08", number: 8, title: "Luminous Relay", slug: "luminous-relay", genre: "Progressive electronic", mood: "Uplifting", tempo: 128, key: "A minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-luminous-relay-master_75d1cf72.wav", lyricCues: cues(["Send a glowing message", "Pass it hand to hand", "Lights become a chorus", "Across the open land"]) },
  { id: "parkway-09", number: 9, title: "Static Mercy", slug: "static-mercy", genre: "Dub techno", mood: "Submerged", tempo: 122, key: "D minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-static-mercy-master_ccf09694.wav", lyricCues: cues(["Soft static is singing", "Underneath the tide", "Kindness keeps on echoing", "Close and warm inside"]) },
  { id: "parkway-10", number: 10, title: "Copper Horizon", slug: "copper-horizon", genre: "Cinematic electronica", mood: "Warm ascent", tempo: 110, key: "C major", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-copper-horizon-master_2fdde729.wav", lyricCues: cues(["Copper sunrise waiting", "Toms begin to play", "Piano sparks are lifting", "Toward a hopeful day"]) },
  { id: "parkway-11", number: 11, title: "Velvet Circuit", slug: "velvet-circuit", genre: "Broken-rhythm electronic", mood: "Rain-lit", tempo: 132, key: "F minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-velvet-circuit-master_69ac4835.wav", lyricCues: cues(["Velvet rain is falling", "Softly on the street", "Warm circuits are glowing", "Under every beat"]) },
  { id: "parkway-12", number: 12, title: "Prism Engine", slug: "prism-engine", genre: "Melodic techno", mood: "Focused lift", tempo: 126, key: "E minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-prism-engine-master_63b628d5.wav", lyricCues: cues(["Prisms wake the engine", "Colours start to run", "Every careful pattern", "Turns toward the sun"]) },
  { id: "parkway-13", number: 13, title: "Low Tide Memory", slug: "low-tide-memory", genre: "Ambient breakbeat", mood: "Reflective", tempo: 100, key: "A minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-low-tide-memory-master_b75619b4.wav", lyricCues: cues(["Low tide holds a memory", "Rhodes begin to glow", "Gentle waves are counting", "Where the quiet goes"]) },
  { id: "parkway-14", number: 14, title: "Gravity Bloom", slug: "gravity-bloom", genre: "Leftfield house", mood: "Playful momentum", tempo: 124, key: "G minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-gravity-bloom-master_e7a51d2c.wav", lyricCues: cues(["Gravity is dancing", "Flowers find the beat", "Every little movement", "Makes the room complete"]) },
  { id: "parkway-15", number: 15, title: "Frequency Atlas", slug: "frequency-atlas", genre: "Cinematic bass music", mood: "Exploratory", tempo: 86, key: "D minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-frequency-atlas-master_d9e67046.wav", lyricCues: cues(["Draw a map of echoes", "Mark the bass below", "Every open frequency", "Shows us where to go"]) },
  { id: "parkway-16", number: 16, title: "Soft Machine Dawn", slug: "soft-machine-dawn", genre: "Downtempo electronica", mood: "Gentle sunrise", tempo: 96, key: "C minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-soft-machine-dawn-master_857e1c4f.wav", lyricCues: cues(["Soft machine is waking", "Morning paints the wall", "Small sounds make a sunrise", "Big enough for all"]) },
  { id: "parkway-17", number: 17, title: "Asterion Steps", slug: "asterion-steps", genre: "Driving techno", mood: "Determined", tempo: 128, key: "B minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-asterion-steps-master_61bca04e.wav", lyricCues: cues(["Asterion steps are landing", "Strong and bright and clear", "One more beat together", "Brings the future near"]) },
  { id: "parkway-18", number: 18, title: "Echo Chamber North", slug: "echo-chamber-north", genre: "Atmospheric jungle", mood: "Northern motion", tempo: 168, key: "E minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-echo-chamber-north-master_aedad64c.wav", lyricCues: cues(["Northern echoes travel", "Through the misty blue", "Fast small drums are flying", "Carrying us through"]) },
  { id: "parkway-19", number: 19, title: "Glass Meridian", slug: "glass-meridian", genre: "Minimal electronica", mood: "Luminous detail", tempo: 116, key: "F minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-glass-meridian-master_14a9be1c.wav", lyricCues: cues(["Glass lines catch the daylight", "Small bells start to ring", "Every careful moment", "Makes a brighter thing"]) },
  { id: "parkway-20", number: 20, title: "Parkway Afterglow", slug: "afterglow", genre: "Progressive closing suite", mood: "Hopeful closure", tempo: 124, key: "D minor", durationMs: FIVE_MINUTES_MS, storageKey: "parkway-afterglow-master_07696491.wav", lyricCues: cues(["Afterglow is waiting", "At the end of night", "Parkway keeps us moving", "Home through golden light"]) },
];

export const PARKWAY_CATALOGUE_PROJECT_KEY = "night-drive-07";

export const catalogueAssetTags = (track: ParkwayCatalogueTrack) => [
  "parkway-original-programme",
  "user-approved-generation",
  "instrumental",
  "two-clip-five-minute-master",
  "no-third-party-source-supplied",
  "no-human-voice-source",
  "synthetic-vocal-only-policy",
  `catalogue-track-${track.number.toString().padStart(2, "0")}`,
  `genre-${track.genre.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}`,
];

export const parkwaySyntheticVocalVariants: ParkwaySyntheticVocalVariant[] = [
  { trackId: "parkway-01", storageKey: "parkway-night-drive-continuum-synthetic-vocal-master_7f730812.wav", durationMs: FIVE_MINUTES_MS },
];

export const syntheticVocalVariantAssetTags = (track: ParkwayCatalogueTrack) => [
  "parkway-original-programme",
  "user-approved-generation",
  "synthetic-vocal-variant",
  "synthetic-vocal-only",
  "non-identifiable-voice",
  "no-human-voice-source",
  "alien-creature-edm-voice",
  "robotic-formant-structure",
  "bass-responsive-effects",
  "no-voice-reference-or-cloning",
  "original-lyrics",
  "no-franchise-imitation",
  `catalogue-track-${track.number.toString().padStart(2, "0")}`,
];

export const catalogueWaveformPreview = (track: ParkwayCatalogueTrack) => JSON.stringify(Array.from({ length: 72 }, (_, index) => {
  const seed = (track.number * 37) + (index * 19) + (index % 7) * 13;
  return 18 + (seed % 72);
}));

export const catalogueSourceUrl = (track: ParkwayCatalogueTrack) => `/manus-storage/${track.storageKey}`;
