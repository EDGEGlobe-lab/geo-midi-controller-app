export type AdjustableMixerTrack = { id: string; level: number; pan: number };

export function updateSettingsMixerTrack<T extends AdjustableMixerTrack>(tracks: T[], id: string, update: Partial<Pick<AdjustableMixerTrack, "level" | "pan">>): T[] {
  return tracks.map((track) => {
    if (track.id !== id) return track;
    return {
      ...track,
      ...(typeof update.level === "number" ? { level: Math.max(0, Math.min(100, Math.round(update.level))) } : {}),
      ...(typeof update.pan === "number" ? { pan: Math.max(-50, Math.min(50, Math.round(update.pan))) } : {}),
    };
  });
}
