export const LIVE_CAPTURE_SUPPORTED = false;
export const DEVICE_FIRMWARE_DELIVERY_SUPPORTED = false;

export const productReadinessAssets = [
  { id: "audio-preview", label: "Sample playback engine", state: "READY", detail: "Browser media preview routed through a software Web Audio mix chain after an explicit Enable Stereo gesture." },
  { id: "midi-player", label: "Playable MIDI pad player", state: "READY", detail: "Browser MIDI notes and on-screen pads trigger software performance feedback; no device control or recording is involved." },
  { id: "software-mixer", label: "Software audio mixer", state: "READY", detail: "Per-track software gain, pan, mute, solo, route health, and protected Stereo Out controls are available in the browser." },
  { id: "asset-upgrade", label: "Software asset upgrade catalog", state: "READY", detail: "User-owned audio, MIDI, preset, sampler, and visual assets can be stored, tagged, previewed, and prepared for a project." },
  { id: "firmware-boundary", label: "Connected-device firmware delivery", state: "NOT PROVIDED", detail: "PARKWAY does not flash firmware, collect device identifiers, or update connected hardware from this web application." },
] as const;

export function isPlaybackOnlyProduct() {
  return !LIVE_CAPTURE_SUPPORTED && !DEVICE_FIRMWARE_DELIVERY_SUPPORTED;
}
