export const BASS_PROFILES = {
  reference: { label: "Reference 60", bassDb: 0, frequencyHz: 90, preamp: 1, referenceVolume: 60 },
  warm: { label: "Warm bass", bassDb: 2.5, frequencyHz: 95, preamp: 0.9, referenceVolume: 65 },
  focused: { label: "Focused low-end", bassDb: 4, frequencyHz: 78, preamp: 0.82, referenceVolume: 60 },
} as const;

export type BassProfileId = keyof typeof BASS_PROFILES;
export type StereoMeter = { peakDb: number | null; headroomDb: number | null; lowEnergy: number };

export function isBassProfileId(value: string | null): value is BassProfileId {
  return value === "reference" || value === "warm" || value === "focused";
}

export function browserStereoMeter(samples: ArrayLike<number>): StereoMeter {
  if (!samples.length) return { peakDb: null, headroomDb: null, lowEnergy: 0 };
  let peak = 0;
  let energy = 0;
  for (const sample of Array.from(samples)) { const magnitude = Math.abs(sample); peak = Math.max(peak, magnitude); energy += magnitude * magnitude; }
  if (peak <= 0.000001) return { peakDb: null, headroomDb: null, lowEnergy: 0 };
  const peakDb = 20 * Math.log10(Math.min(1, peak));
  return { peakDb, headroomDb: Math.max(0, -peakDb), lowEnergy: Math.min(1, Math.sqrt(energy / samples.length)) };
}

export function formatMeterDb(value: number | null) { return value === null || !Number.isFinite(value) ? "--" : `${value.toFixed(1)} dB`; }
