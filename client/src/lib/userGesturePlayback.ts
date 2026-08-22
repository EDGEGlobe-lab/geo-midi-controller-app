export type GestureMedia = { play: () => Promise<void>; pause: () => void };

/**
 * Starts HTML media before asynchronous audio-graph work. This keeps the user
 * activation token alive on browsers that block a later `play()` as autoplay.
 */
export async function startWithinUserGesture(media: GestureMedia, enableGraph: () => Promise<boolean>, prepareRoute: () => boolean = () => true) {
  if (!prepareRoute()) return false;
  const playback = media.play();
  const graphReady = await enableGraph();
  if (!graphReady) {
    media.pause();
    await playback.catch(() => undefined);
    return false;
  }
  await playback;
  return true;
}
