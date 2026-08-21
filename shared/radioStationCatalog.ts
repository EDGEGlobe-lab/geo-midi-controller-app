export const parkwayRadioStations = [
  {
    id: "night-drive-fm",
    name: "Night Drive FM",
    tagline: "Underground techno after dark",
    genres: ["Underground techno", "Electro"],
    nowPlaying: "Night Drive / Master Comp",
    sourceUrl: "/manus-storage/parkway-night-drive_83138bc2.wav",
    storageKey: "parkway-night-drive_83138bc2.wav",
    accent: "cyan",
  },
  {
    id: "pink-signal-fm",
    name: "Pink Signal FM",
    tagline: "Leftfield hooks and pulse patterns",
    genres: ["Synth pulse", "Leftfield electronic"],
    nowPlaying: "Pink Signal / Pattern Set",
    sourceUrl: "/manus-storage/parkway-pink-signal_905c45de.mp3",
    storageKey: "parkway-pink-signal_905c45de.mp3",
    accent: "pink",
  },
  {
    id: "after-hours-lab",
    name: "After Hours Lab",
    tagline: "Minimal motion and night-air beds",
    genres: ["Minimal", "Ambient motion"],
    nowPlaying: "After Hours / Autonomous Source",
    sourceUrl: "/manus-storage/parkway-after-hours_fbfee4d1.mp3",
    storageKey: "parkway-after-hours_fbfee4d1.mp3",
    accent: "violet",
  },
] as const;

export type ParkwayRadioStation = (typeof parkwayRadioStations)[number];

/**
 * Declared original-audio programmes for the interactive web station. The queue
 * advances in the listener's browser only; it is not a third-party relay or a
 * server-originated broadcast feed.
 */
export const parkwayRadioProgrammes = [
  { id: "night-drive-master", stationId: "night-drive-fm", title: "Night Drive / Master Comp", creator: "PARKWAY", sourceUrl: "/manus-storage/parkway-night-drive_83138bc2.wav", storageKey: "parkway-night-drive_83138bc2.wav", rightsLabel: "PARKWAY ORIGINAL" },
  { id: "night-drive-sequence", stationId: "night-drive-fm", title: "Autonomous Sequence / 07", creator: "PARKWAY", sourceUrl: "/manus-storage/parkway-after-hours_fbfee4d1.mp3", storageKey: "parkway-after-hours_fbfee4d1.mp3", rightsLabel: "PARKWAY ORIGINAL" },
  { id: "pink-signal-pattern", stationId: "pink-signal-fm", title: "Pink Signal / Pattern Set", creator: "PARKWAY", sourceUrl: "/manus-storage/parkway-pink-signal_905c45de.mp3", storageKey: "parkway-pink-signal_905c45de.mp3", rightsLabel: "PARKWAY ORIGINAL" },
  { id: "pink-signal-interlude", stationId: "pink-signal-fm", title: "Night Drive / Pattern Interlude", creator: "PARKWAY", sourceUrl: "/manus-storage/parkway-night-drive_83138bc2.wav", storageKey: "parkway-night-drive_83138bc2.wav", rightsLabel: "PARKWAY ORIGINAL" },
  { id: "after-hours-source", stationId: "after-hours-lab", title: "After Hours / Autonomous Source", creator: "PARKWAY", sourceUrl: "/manus-storage/parkway-after-hours_fbfee4d1.mp3", storageKey: "parkway-after-hours_fbfee4d1.mp3", rightsLabel: "PARKWAY ORIGINAL" },
  { id: "after-hours-drift", stationId: "after-hours-lab", title: "Pink Signal / Night-Air Drift", creator: "PARKWAY", sourceUrl: "/manus-storage/parkway-pink-signal_905c45de.mp3", storageKey: "parkway-pink-signal_905c45de.mp3", rightsLabel: "PARKWAY ORIGINAL" },
] as const;

export type ParkwayRadioProgramme = (typeof parkwayRadioProgrammes)[number];

export function getParkwayRadioStation(stationId: string) {
  return parkwayRadioStations.find((station) => station.id === stationId);
}

export function getStationProgrammes(stationId: string) {
  return parkwayRadioProgrammes.filter((programme) => programme.stationId === stationId);
}

export function getStationProgramme(stationId: string, programmeId: string | null) {
  return getStationProgrammes(stationId).find((programme) => programme.id === programmeId) ?? getStationProgrammes(stationId)[0];
}

export function getAdjacentStationProgramme(stationId: string, programmeId: string | null, direction: -1 | 1) {
  const queue = getStationProgrammes(stationId);
  if (!queue.length) return undefined;
  const index = Math.max(0, queue.findIndex((programme) => programme.id === programmeId));
  return queue[(index + direction + queue.length) % queue.length];
}
