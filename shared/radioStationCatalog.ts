export const parkwayRadioStations = [
  {
    id: "night-drive-fm",
    name: "Night Drive FM",
    tagline: "Underground techno after dark",
    genres: ["Underground techno", "Electro"],
    nowPlaying: "Night Drive / Master Comp",
    sourceUrl: "/manus-storage/geo_midi_controller_deck_audio_pcm_c625e838.wav",
    storageKey: "geo_midi_controller_deck_audio_pcm_c625e838.wav",
    accent: "cyan",
  },
  {
    id: "pink-signal-fm",
    name: "Pink Signal FM",
    tagline: "Leftfield hooks and pulse patterns",
    genres: ["Synth pulse", "Leftfield electronic"],
    nowPlaying: "Pink Signal / Pattern Set",
    sourceUrl: "/manus-storage/geo-midi-controller-app_muchie_pop_casket_4e927e6a.wav",
    storageKey: "geo-midi-controller-app_muchie_pop_casket_4e927e6a.wav",
    accent: "pink",
  },
  {
    id: "after-hours-lab",
    name: "After Hours Lab",
    tagline: "Minimal motion and night-air beds",
    genres: ["Minimal", "Ambient motion"],
    nowPlaying: "After Hours / Autonomous Source",
    sourceUrl: "/manus-storage/parkway-autonomous-audio_b0d36279.wav",
    storageKey: "parkway-autonomous-audio_b0d36279.wav",
    accent: "violet",
  },
] as const;

export type ParkwayRadioStation = (typeof parkwayRadioStations)[number];

export function getParkwayRadioStation(stationId: string) {
  return parkwayRadioStations.find((station) => station.id === stationId);
}
