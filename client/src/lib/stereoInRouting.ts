export function shouldReconnectStereoIn(currentTrackId: string | null, nextTrackId: string): boolean {
  return currentTrackId !== nextTrackId;
}
