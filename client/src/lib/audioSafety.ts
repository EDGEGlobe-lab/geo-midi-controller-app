export const MASTER_VOLUME_FLOOR = 50;

export function clampMasterVolume(value: number): number {
  if (!Number.isFinite(value)) return MASTER_VOLUME_FLOOR;
  return Math.max(MASTER_VOLUME_FLOOR, Math.min(100, value));
}
