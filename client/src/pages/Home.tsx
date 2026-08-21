import { useAuth } from "@/_core/hooks/useAuth";
import { startLogin } from "@/const";
import { trpc } from "@/lib/trpc";
import { clampMasterVolume } from "@/lib/audioSafety";
import { clearFallbackForManualSource, decideFallbackRecovery } from "@/lib/fallbackRecovery";
import { DevicesSoundAccessPanel, type HardwareDraft } from "@/components/DevicesSoundAccessPanel";
import { ProductReadinessPanel } from "@/components/ProductReadinessPanel";
import { AIProjectFallbackPanel, type FallbackSelection } from "@/components/AIProjectFallbackPanel";
import { AudioSourceHistoryPanel } from "@/components/AudioSourceHistoryPanel";
import { RadioStationPanel } from "@/components/RadioStationPanel";
import { CompatibilityFeedbackPanel } from "@/components/CompatibilityFeedbackPanel";
import { CompatibilityReviewPanel } from "@/components/CompatibilityReviewPanel";
import { Inf4RadarDisplay } from "@/components/Inf4RadarDisplay";
import { HardwareDevelopmentPanel } from "@/components/HardwareDevelopmentPanel";
import { ManusMusicUploadPanel, type ManusUploadStage } from "@/components/ManusMusicUploadPanel";
import { getAdjacentStationProgramme, getStationProgramme, parkwayRadioStations } from "@shared/radioStationCatalog";
import { isExpectedOperationAbort } from "@/lib/operationAbort";
import { workspaceDataPlan, type ParkwayWorkspace } from "@/lib/workspaceDataPlan";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AlertTriangle,
  AudioWaveform,
  Code2,
  ChevronDown,
  CircleStop,
  Disc3,
  HardDrive,
  FolderOpen,
  Gauge,
  Grid3X3,
  Headphones,
  Layers3,
  Menu,
  Pause,
  Play,
  Plus,
  Power,
  Radio,
  RotateCcw,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Square,
  Trash2,
  Volume2,
  Waves,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

const AUDIO_TRACKS = [
  { id: "geo-render", label: "Night Drive Practice Mix", src: "/manus-storage/parkway-night-drive_83138bc2.wav", tag: "D MAJOR / 156 BPM" },
  { id: "muchie-casket", label: "Pink Signal Practice Mix", src: "/manus-storage/parkway-pink-signal_905c45de.mp3", tag: "F MINOR / 128 BPM" },
  { id: "autonomous-project", label: "After Hours Practice Mix", src: "/manus-storage/parkway-after-hours_fbfee4d1.mp3", tag: "D MAJOR / 156 BPM" },
] as const;

type TrackBase = { id: string; name: string; type: "audio" | "midi"; color: string; preset: string; level: number; pan: number; clipStart: number; clipLength: number };

const tracks: TrackBase[] = [
  { id: "drums", name: "LIVE KIT", type: "audio", color: "orange", preset: "Transient / Tight", level: 82, pan: 0, clipStart: 2, clipLength: 42 },
  { id: "bass", name: "ROOT BASS", type: "midi", color: "amber", preset: "Sub / Root Pulse", level: 72, pan: -2, clipStart: 4, clipLength: 48 },
  { id: "pluck", name: "GRATE PLUCK", type: "midi", color: "cyan", preset: "D Major / 1·7·3·5", level: 78, pan: -6, clipStart: 6, clipLength: 40 },
  { id: "chords", name: "CHORD STABS", type: "midi", color: "pink", preset: "D · A · Bm · G", level: 64, pan: 8, clipStart: 8, clipLength: 44 },
  { id: "pad", name: "ORBITAL PAD", type: "midi", color: "violet", preset: "Triangle / Wide Air", level: 43, pan: -14, clipStart: 10, clipLength: 34 },
  { id: "fx", name: "VDN PULSES", type: "audio", color: "blue", preset: "Noise / Ping / FX", level: 37, pan: 22, clipStart: 12, clipLength: 28 },
] as const;

type TrackState = TrackBase & { muted: boolean; solo: boolean; armed: boolean };
const PERFORMANCE_PADS = ["KICK", "SNARE", "HAT", "CLAP", "SUB", "PLUCK", "CHORD", "PAD", "FX 01", "FX 02", "VOCAL", "RISER", "TOM", "PERC", "NOISE", "STOP"];
const GRID_BEATS = 16;
const parkwayConceptModules = [
  { kind: "PARKWAY CONCEPT", name: "Nano Rack", detail: "Compact studio-host control-surface study", accent: "cyan", note: "NO PUBLIC PRODUCT SPECIFICATION" },
  { kind: "PARKWAY CONCEPT", name: "Pulse Workstation", detail: "Scene-performance workflow study", accent: "amber", note: "NO OFFICIAL LAUNCH DATE" },
  { kind: "PARKWAY CONCEPT", name: "Field I/O", detail: "Portable session-routing workflow study", accent: "violet", note: "CONCEPT / NOT FOR SALE" },
  { kind: "PARKWAY CONCEPT", name: "JIG Surface", detail: "Pad-performance interaction study", accent: "pink", note: "CONCEPT / NO DEVICE CONTROL" },
] as const;
const verifiedProductLedger = [
  { kind: "COMPACT DAW HOST", name: "Mac mini (2024, M4)", launch: "Available 8 Nov 2024", detail: "Apple M4: 10-core CPU, 10-core GPU, 16GB unified memory, 256GB SSD base configuration.", launchUrl: "https://www.apple.com/newsroom/2024/10/apples-new-mac-mini-is-more-mighty-more-mini-and-built-for-apple-intelligence/", specUrl: "https://support.apple.com/en-us/121555" },
  { kind: "STANDALONE MUSIC MAKER", name: "Ableton Move", launch: "Official post: 8 Oct 2024", detail: "1.5GHz quad-core ARM Cortex-A72, 2GB RAM, 64GB storage, 32 polyphonic-aftertouch pads, USB-C/USB-A MIDI, stereo I/O.", launchUrl: "https://www.ableton.com/en/blog/say-hello-to-ableton-move/", specUrl: "https://www.ableton.com/en/move/tech-specs/" },
] as const;
const presets = [
  { name: "Night Drive / Hook A", group: "Arrangement preset", detail: "D major · 156 BPM · 16 bars", color: "cyan" },
  { name: "Octal Pulse / 07", group: "Rhythm preset", detail: "Base-8 step logic · clutch quaver", color: "amber" },
  { name: "RIJG Vocal Chain", group: "Vocal preset", detail: "Recursive phrase journal · sampler-ready", color: "pink" },
  { name: "Serenity Motion Bed", group: "Motion preset", detail: "VGA signal rail · abstract glow", color: "violet" },
] as const;
const makeFallbackWaveform = (bytes: Uint8Array, count = 72) => Array.from({ length: count }, (_, index) => Math.max(0.08, ((bytes[index % Math.max(1, bytes.length)] ?? 64) / 255))).map((value) => Math.round(value * 100));
const readMediaDuration = (file: File) => new Promise<number | null>((resolve) => { if (!file.type.startsWith("audio/") && !file.type.startsWith("video/")) return resolve(null); const media = document.createElement(file.type.startsWith("video/") ? "video" : "audio"); media.preload = "metadata"; media.onloadedmetadata = () => { URL.revokeObjectURL(media.src); resolve(Number.isFinite(media.duration) ? Math.round(media.duration * 1000) : null); }; media.onerror = () => resolve(null); media.src = URL.createObjectURL(file); });
const extractMediaMetadata = async (file: File) => { const buffer = await file.arrayBuffer(); const bytes = new Uint8Array(buffer); let durationMs = await readMediaDuration(file); if (file.type.startsWith("audio/")) { try { const context = new AudioContext(); const decoded = await context.decodeAudioData(buffer.slice(0)); durationMs = Math.round(decoded.duration * 1000); await context.close(); } catch { /* fallback metadata remains valid */ } } return { durationMs, waveformPreview: JSON.stringify(makeFallbackWaveform(bytes)) }; };
const parseWaveform = (value: string | null) => { try { const parsed = value ? JSON.parse(value) : []; return Array.isArray(parsed) ? parsed.filter((item): item is number => typeof item === "number").slice(0, 72) : []; } catch { return []; } };
const formatDuration = (durationMs: number | null | undefined) => durationMs ? `${Math.floor(durationMs / 60000).toString().padStart(2, "0")}:${Math.floor((durationMs % 60000) / 1000).toString().padStart(2, "0")}` : "--:--";
const parseTags = (value: string | null) => { try { const parsed = value ? JSON.parse(value) : []; return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []; } catch { return []; } };
const samplerSeeds = [
  { id: "vocal-riJG", type: "VOCAL", name: "RIJG Clutch Quaver", detail: "Breathy note fragments · G-clef phrasing", duration: "00:08", format: "WAV / 48 kHz", color: "pink" },
  { id: "sfx-octal", type: "SFX", name: "Octal Stairway Impact", detail: "Robotic transient · VGA motion hit", duration: "00:03", format: "WAV / 48 kHz", color: "amber" },
] as const;
const instruments = [
  { name: "JIG Pluck Engine", type: "Virtual instrument", detail: "Bright transient hooks with scale lock", color: "cyan" },
  { name: "Night Air Pad", type: "Virtual instrument", detail: "Wide triangle beds and harmonic haze", color: "violet" },
  { name: "Sub Root Matrix", type: "Sound library", detail: "Controlled sub pulses in D major", color: "amber" },
  { name: "Vocal / SFX Lab", type: "Sampler collection", detail: "Vocal chops, impacts, risers, noise", color: "pink" },
] as const;

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function Meter({ active, accent = "cyan", level = 0 }: { active: boolean; accent?: string; level?: number }) {
  return <div className={`meter meter-${accent} ${active ? "meter-live" : ""}`}>{Array.from({ length: 18 }).map((_, index) => { const threshold = (index + 1) / 18; const lit = active && level >= threshold * 0.86; return <span key={index} className={lit ? "meter-pulse" : ""} style={{ height: `${24 + ((index * 19) % 68)}%`, opacity: lit ? 0.98 : 0.16 }} />; })}</div>;
}

function EqDisplay({ bands, accent = "cyan" }: { bands: number[]; accent?: string }) {
  return <div className={`eq-display eq-${accent}`} aria-label="Live equalizer display">{bands.map((band, index) => <span key={index} style={{ height: `${Math.max(8, Math.min(100, band * 100))}%` }} />)}</div>;
}

function Waveform({ color = "cyan", seed = 1, active = false }: { color?: string; seed?: number; active?: boolean }) {
  return <div className={`waveform waveform-${color} ${active ? "waveform-active" : ""}`}>{Array.from({ length: 64 }).map((_, index) => <span key={index} style={{ height: `${18 + ((index * 17 + seed * 13) % 76)}%` }} />)}</div>;
}

type PreviewOption = { value: string; label: string; detail: string };
function MediaPreviewPlayer({ options, value, label, detail, bars, duration, currentTime, isPlaying, zoom, normalized, onSourceChange, onTogglePlay, onScrub, onNudge, onZoom, onNormalize }: { options: PreviewOption[]; value: string; label: string; detail: string; bars: number[]; duration: number; currentTime: number; isPlaying: boolean; zoom: number; normalized: boolean; onSourceChange: (value: string) => void; onTogglePlay: () => void; onScrub: (event: React.PointerEvent<HTMLDivElement>) => void; onNudge: (seconds: number) => void; onZoom: (zoom: number) => void; onNormalize: () => void }) {
  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;
  return <section className="media-preview-panel panel"><div className="panel-header"><div><div className="section-kicker"><Waves size={13} /> Media preview / local Web Audio</div><h2>{label} <span className="muted-slash">/</span> <span>{detail}</span></h2></div><span className="small-pill">{normalized ? "PEAK SAFE" : "RAW PREVIEW"}</span></div><div className="preview-toolbar"><select aria-label="Preview source" value={value} onChange={(event) => onSourceChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><button className="outline-button outline-small" onClick={() => onZoom(Math.max(1, zoom - 1))}>− Zoom</button><span className="zoom-readout">{zoom}× GRID</span><button className="outline-button outline-small" onClick={() => onZoom(Math.min(4, zoom + 1))}>+ Zoom</button><button className={`normalize-button ${normalized ? "is-on" : ""}`} onClick={onNormalize}>Peak normalize {normalized ? "ON" : "OFF"}</button></div><div className="preview-wave-scroll"><div className="preview-waveform" role="slider" tabIndex={0} aria-label={`Scrub ${label}; ${formatTime(currentTime)} of ${formatTime(duration)}`} aria-valuemin={0} aria-valuemax={Math.round(duration)} aria-valuenow={Math.round(currentTime)} onPointerDown={onScrub} onKeyDown={(event) => { if (event.key === "ArrowLeft") { event.preventDefault(); onNudge(-5); } if (event.key === "ArrowRight") { event.preventDefault(); onNudge(5); } if (event.key === "Home") { event.preventDefault(); onNudge(-duration); } if (event.key === "End") { event.preventDefault(); onNudge(duration); } }}>{bars.map((bar, index) => <i key={index} style={{ height: `${Math.max(9, bar)}%` }} />)}<span className="preview-playhead" style={{ left: `${progress}%` }} /></div></div><div className="preview-footer"><button className="transport-play" onClick={onTogglePlay}>{isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><button className="text-button" onClick={() => onNudge(-5)}>−5 s</button><span>{formatTime(currentTime)} / {formatTime(duration)}</span><button className="text-button" onClick={() => onNudge(5)}>+5 s</button><small>Passcode grid / pattern-net visual mode · original UI motif</small></div></section>;
}

type ContactDraft = { name: string; email: string; serviceInterest: "production" | "mix-master" | "studio-system" | "other"; message: string; paymentDetailsRequested: boolean; website: string };
function ContactPanel({ draft, setDraft, pending, onSubmit }: { draft: ContactDraft; setDraft: React.Dispatch<React.SetStateAction<ContactDraft>>; pending: boolean; onSubmit: () => void }) {
  return <section className="contact-panel panel"><div className="panel-header"><div><div className="section-kicker"><Radio size={13} /> Client enquiry / non-transactional</div><h2>Start a service conversation <span className="muted-slash">/</span> <span>secure follow-up</span></h2></div><span className="small-pill">NO PAYMENT DATA</span></div><p className="contact-copy">Describe the production service you need. You may request payment details for a later direct conversation, but never send card numbers, bank-account details, transfer credentials, or identity documents through this form.</p><form className="contact-form" onSubmit={(event) => { event.preventDefault(); onSubmit(); }}><input className="contact-honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" value={draft.website} onChange={(event) => setDraft((value) => ({ ...value, website: event.target.value }))} /><label><span>Name</span><input required minLength={2} maxLength={160} value={draft.name} onChange={(event) => setDraft((value) => ({ ...value, name: event.target.value }))} placeholder="Your name" /></label><label><span>Email</span><input required type="email" maxLength={320} value={draft.email} onChange={(event) => setDraft((value) => ({ ...value, email: event.target.value }))} placeholder="you@example.com" /></label><label><span>Service interest</span><select value={draft.serviceInterest} onChange={(event) => setDraft((value) => ({ ...value, serviceInterest: event.target.value as ContactDraft["serviceInterest"] }))}><option value="production">Music production</option><option value="mix-master">Mixing & mastering</option><option value="studio-system">Studio system design</option><option value="other">Other service</option></select></label><label className="contact-message"><span>Project brief</span><textarea required minLength={12} maxLength={4000} value={draft.message} onChange={(event) => setDraft((value) => ({ ...value, message: event.target.value }))} placeholder="Tell us about the project, timeline, and the help you need." /></label><label className="contact-check"><input type="checkbox" checked={draft.paymentDetailsRequested} onChange={(event) => setDraft((value) => ({ ...value, paymentDetailsRequested: event.target.checked }))} /><span>Request payment details for a later direct follow-up.</span></label><button className="solid-button" disabled={pending} type="submit">{pending ? "Sending enquiry…" : "Send service enquiry"}</button></form></section>;
}

function StereoControl({ master, status, channel, mixBus, compact, onEnable, onRecover, onMasterChange, onCompactToggle }: { master: number; status: "locked" | "ready" | "error"; channel: "idle" | "ready" | "error"; mixBus: "idle" | "ready" | "error"; compact: boolean; onEnable: () => void; onRecover: () => void; onMasterChange: (value: number) => void; onCompactToggle: () => void }) {
  return <aside className={`stereo-control stereo-${status}`} aria-label="Stereo output control"><button className="stereo-enable" onClick={onEnable} aria-pressed={status === "ready"}><Volume2 size={15} /><span>{status === "ready" ? "STEREO READY" : status === "error" ? "RETRY STEREO" : "ENABLE STEREO"}</span></button><button className="stereo-recover" onClick={onRecover}><Play size={13} fill="currentColor" /><span>RECOVER & PLAY</span></button><div className="route-health" aria-label={`Channel Rack ${channel}; Mix Bus ${mixBus}; Stereo Out ${status}`}><span className={`route-${channel}`}>CH</span><i /> <span className={`route-${mixBus}`}>BUS</span><i /> <span className={`route-${status}`}>OUT</span></div><label><span>MASTER {master}%</span><input aria-label="Master volume, minimum 45 percent" type="range" min="45" max="100" value={master} onChange={(event) => onMasterChange(Number(event.target.value))} /></label><button className="stereo-compact" onClick={onCompactToggle} aria-pressed={compact}>{compact ? "EXPAND" : "COMPACT"}</button></aside>;
}

type AssetFocusItem = { id: number; filename: string; assetType: string; durationMs: number | null; tags: string | null };
function AssetFocusPanel({ assets, authenticated, onOpenStudio }: { assets: AssetFocusItem[]; authenticated: boolean; onOpenStudio: () => void }) {
  return <section className="asset-focus-panel panel"><div className="panel-header"><div><div className="section-kicker"><FolderOpen size={13} /> Assets / compact focus</div><h2>Project materials <span className="muted-slash">/</span> <span>{assets.length} indexed</span></h2></div><button className="outline-button outline-small" onClick={onOpenStudio}>Open asset workbench</button></div><p>Use this lightweight view to review project material and move into the Studio workbench only when you need upload, tagging, waveform, or sampler controls.</p>{authenticated ? <div className="asset-focus-list">{assets.length ? assets.slice(0, 8).map((asset) => <article key={asset.id}><span>{asset.assetType.toUpperCase()}</span><strong>{asset.filename}</strong><small>{formatDuration(asset.durationMs)} · {parseTags(asset.tags).map((tag) => `#${tag}`).join(" ") || "untagged"}</small></article>) : <div className="asset-empty">No assets yet. Open the workbench to add an original recording, vocal, SFX, sample, or motion reference.</div>}</div> : <div className="asset-empty">Sign in to see your private project asset index.</div>}</section>;
}

export default function Home() {
  // The useAuth hook provides authentication state.
  // To implement login/logout, call logout(), or start login from an event
  // handler: onClick={() => startLogin()} (imported from "@/const"). Never call
  // startLogin() during render (no href={startLogin()}) — it mints a one-time
  // nonce cookie and must run only at the moment of navigation.
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const assetInputRef = useRef<HTMLInputElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const previewGainRef = useRef<GainNode | null>(null);
  const previewPanRef = useRef<StereoPannerNode | null>(null);
  const normalizerRef = useRef<DynamicsCompressorNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analysisFrameRef = useRef<number | null>(null);
  const trackNodesRef = useRef<Record<string, { gain: GainNode; pan: StereoPannerNode }>>({});
  const fallbackAttemptsRef = useRef(0);
  const [currentTrackId, setCurrentTrackId] = useState<(typeof AUDIO_TRACKS)[number]["id"]>("geo-render");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempo, setTempo] = useState(156);
  const [master, setMaster] = useState(() => clampMasterVolume(Number(window.localStorage.getItem("parkway-master-volume") ?? 82) || 82));
  const [stereoStatus, setStereoStatus] = useState<"locked" | "ready" | "error">("locked");
  const [channelStatus, setChannelStatus] = useState<"idle" | "ready" | "error">("idle");
  const [mixBusStatus, setMixBusStatus] = useState<"idle" | "ready" | "error">("idle");
  const [compactMode, setCompactMode] = useState(() => window.localStorage.getItem("parkway-compact-mode") === "true");
  const [activeBar, setActiveBar] = useState(8);
  const [selectedTrack, setSelectedTrack] = useState("pluck");
  const [activeView, setActiveView] = useState<ParkwayWorkspace>(() => {
    const requestedView = new URLSearchParams(window.location.search).get("view");
    return ["Arrangement", "Mixer", "Piano Roll", "Performance", "Studio", "Generator", "Radio", "Product", "Devices", "Develop", "Assets", "History", "Feedback", "Review", "Contact"].includes(requestedView ?? "") ? requestedView as ParkwayWorkspace : "Arrangement";
  });
  const [showBrowser, setShowBrowser] = useState(() => window.innerWidth >= 760);
  const [tracksState, setTracksState] = useState<TrackState[]>(() => tracks.map((track) => ({ ...track, muted: false, solo: false, armed: track.id === "pluck" })));
  const [loopRegion, setLoopRegion] = useState({ start: 2, end: 14 });
  const [draggingHandle, setDraggingHandle] = useState<"start" | "end" | null>(null);
  const [draggingClip, setDraggingClip] = useState<string | null>(null);
  const [pressedPads, setPressedPads] = useState<number[]>([]);
  const [midiStatus, setMidiStatus] = useState("MIDI unavailable");
  const [midiInputs, setMidiInputs] = useState<string[]>([]);
  const [midiMap, setMidiMap] = useState<Record<number, number>>({});
  const [meterLevels, setMeterLevels] = useState<Record<string, number>>(() => Object.fromEntries(tracks.map((track) => [track.id, 0])));
  const [eqBands, setEqBands] = useState<number[]>([0.06, 0.08, 0.1, 0.08, 0.06, 0.05, 0.04, 0.03]);
  const [trackedVisits, setTrackedVisits] = useState(0);
  const [assetType, setAssetType] = useState<"audio" | "vocal" | "sfx" | "sample" | "motion" | "image" | "other">("audio");
  const [uploadingAsset, setUploadingAsset] = useState(false);
  const [uploadingManusMusic, setUploadingManusMusic] = useState(false);
  const [manusUploadStage, setManusUploadStage] = useState<ManusUploadStage>("idle");
  const [generationState, setGenerationState] = useState<"idle" | "awaiting-approval" | "running" | "completed">("idle");
  const [samplerLaneState, setSamplerLaneState] = useState<Record<string, "ready" | "queued" | "complete">>(() => Object.fromEntries(samplerSeeds.map((item) => [item.id, "ready"])));
  const [assetTags, setAssetTags] = useState("night-drive, neon-pink");
  const [assetFilterTag, setAssetFilterTag] = useState("all");
  const [contactDraft, setContactDraft] = useState<ContactDraft>({ name: "", email: "", serviceInterest: "production", message: "", paymentDetailsRequested: false, website: "" });
  const [previewAssetId, setPreviewAssetId] = useState<number | null>(null);
  const [waveformZoom, setWaveformZoom] = useState(1);
  const [peakNormalize, setPeakNormalize] = useState(false);
  const [hardwareDraft, setHardwareDraft] = useState<HardwareDraft>({ label: "", category: "computer", productReference: "" });
  const [soundAccessConsent, setSoundAccessConsent] = useState(false);
  const [autoFallbackEnabled, setAutoFallbackEnabled] = useState(() => window.localStorage.getItem("parkway-night-drive-auto-fallback") !== "false");
  const [fallbackStatus, setFallbackStatus] = useState<"armed" | "paused" | "recovering" | "ready" | "failed">("armed");
  const [fallbackSelection, setFallbackSelection] = useState<FallbackSelection | null>(null);
  const [fallbackSourceUrl, setFallbackSourceUrl] = useState<string | null>(null);
  const [historySourceUrl, setHistorySourceUrl] = useState<string | null>(null);
  const [historySourceLabel, setHistorySourceLabel] = useState<string | null>(null);
  const [historyPendingId, setHistoryPendingId] = useState<number | null>(null);
  const [radioStationId, setRadioStationId] = useState("night-drive-fm");
  const [radioProgrammeId, setRadioProgrammeId] = useState<string | null>("night-drive-master");
  const [radioVolume, setRadioVolume] = useState(82);
  const [radioActive, setRadioActive] = useState(false);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<number | null>(null);
  const activeTrack = AUDIO_TRACKS.find((track) => track.id === currentTrackId) ?? AUDIO_TRACKS[0];
  const projectKey = "night-drive-07";
  const isAdmin = Boolean(isAuthenticated && user?.role === "admin");
  const dataPlan = workspaceDataPlan(activeView, isAdmin);
  const assetsQuery = trpc.studio.assets.list.useQuery({ projectKey }, { enabled: isAuthenticated && dataPlan.projectAssets });
  const uploadAsset = trpc.studio.assets.upload.useMutation({ onSuccess: () => { void assetsQuery.refetch(); toast.success("Asset stored in the cloud project library"); }, onError: (error) => toast.error(error.message) });
  const uploadManusMusic = trpc.studio.assets.uploadManusMusic.useMutation({ onError: (error) => toast.error(error.message) });
  const updateAssetTags = trpc.studio.assets.updateTags.useMutation({ onSuccess: () => { void assetsQuery.refetch(); toast.success("Asset tags updated"); } });
  const jobsQuery = trpc.studio.jobs.list.useQuery({ projectKey }, { enabled: isAuthenticated && dataPlan.jobs });
  const samplerQuery = trpc.studio.sampler.list.useQuery({ projectKey }, { enabled: isAuthenticated && dataPlan.samplerOutputs });
  const sourceHistoryQuery = trpc.studio.sourceHistory.list.useQuery({ projectKey }, { enabled: isAuthenticated && dataPlan.sourceHistory });
  const savedRadioQuery = trpc.radio.saved.useQuery(undefined, { enabled: isAuthenticated && dataPlan.savedStations });
  const createJob = trpc.studio.jobs.create.useMutation();
  const transitionJob = trpc.studio.jobs.transition.useMutation();
  const createSamplerOutput = trpc.studio.sampler.create.useMutation();
  const activateFallback = trpc.studio.fallback.activate.useMutation();
  const restoreSourceHistory = trpc.studio.sourceHistory.restore.useMutation();
  const deleteSourceHistory = trpc.studio.sourceHistory.delete.useMutation();
  const saveRadioStation = trpc.radio.save.useMutation({ onSuccess: () => { void savedRadioQuery.refetch(); toast.success("Station saved to your private library"); }, onError: (error) => toast.error(error.message) });
  const removeRadioStation = trpc.radio.remove.useMutation({ onSuccess: () => { void savedRadioQuery.refetch(); toast("Station removed from your private library"); }, onError: (error) => toast.error(error.message) });
  const contactSubmit = trpc.contact.submit.useMutation();
  const hardwareQuery = trpc.hardware.list.useQuery(undefined, { enabled: isAuthenticated && dataPlan.hardwareRegistrations });
  const registerHardware = trpc.hardware.register.useMutation({ onSuccess: () => { setHardwareDraft({ label: "", category: "computer", productReference: "" }); void hardwareQuery.refetch(); toast.success("Device label registered in disabled state"); }, onError: (error) => toast.error(error.message) });
  const activateHardware = trpc.hardware.activate.useMutation({ onSuccess: () => { setSoundAccessConsent(false); void hardwareQuery.refetch(); toast.success("PARKWAY browser sound-access profile activated"); }, onError: (error) => toast.error(error.message) });
  const revokeHardware = trpc.hardware.revoke.useMutation({ onSuccess: () => { void hardwareQuery.refetch(); toast("PARKWAY browser sound-access profile revoked"); }, onError: (error) => toast.error(error.message) });
  const submitCompatibilityFeedback = trpc.compatibility.submit.useMutation({ onSuccess: () => toast.success("Compatibility feedback submitted for authorized staff review"), onError: (error) => toast.error(error.message) });
  const reviewEnabled = dataPlan.compatibilityReview;
  const compatibilityReviewQuery = trpc.compatibility.review.list.useQuery(undefined, { enabled: reviewEnabled });
  const compatibilityReviewersQuery = trpc.compatibility.review.reviewers.useQuery(undefined, { enabled: reviewEnabled });
  const compatibilityHistoryQuery = trpc.compatibility.review.history.useQuery({ feedbackId: selectedFeedbackId ?? 0 }, { enabled: reviewEnabled && selectedFeedbackId !== null });
  const assignCompatibilityReview = trpc.compatibility.review.assign.useMutation({ onSuccess: () => { void compatibilityReviewQuery.refetch(); if (selectedFeedbackId !== null) void compatibilityHistoryQuery.refetch(); toast.success("Reviewer assignment recorded"); }, onError: (error) => toast.error(error.message) });
  const decideCompatibilityReview = trpc.compatibility.review.decide.useMutation({ onSuccess: () => { void compatibilityReviewQuery.refetch(); if (selectedFeedbackId !== null) void compatibilityHistoryQuery.refetch(); toast.success("Approval decision recorded"); }, onError: (error) => toast.error(error.message) });
  const requestProjectFallback = async (trigger: "media-error" | "play-rejection") => {
    const decision = decideFallbackRecovery({ enabled: autoFallbackEnabled, attempts: fallbackAttemptsRef.current, hasFallbackSource: Boolean(fallbackSourceUrl) });
    if (decision === "paused") { setFallbackStatus("paused"); return false; }
    if (decision === "fallback-source-failed") { setFallbackStatus("failed"); toast.error("The stored fallback source could not load. Automatic replacement is paused."); return false; }
    if (decision === "retry-limit") { setFallbackStatus("failed"); toast.error("Night Drive fallback paused after two attempts. Select a source manually and retry."); return false; }
    if (!isAuthenticated) { setFallbackStatus("failed"); toast.error("Sign in to store a playable Night Drive fallback in this project."); return false; }
    const attempt = ++fallbackAttemptsRef.current;
    setFallbackStatus("recovering");
    try {
      const result = await activateFallback.mutateAsync({ projectKey, trigger, attempt });
      setFallbackSelection({ genre: result.genre, preGenerated: result.preGenerated, attempt: result.attempt });
      setFallbackSourceUrl(result.sourceUrl);
      setHistorySourceUrl(null);
      setHistorySourceLabel(null);
      setPreviewAssetId(null);
      setCurrentTrackId("autonomous-project");
      setFallbackStatus("ready");
      void assetsQuery.refetch();
      void jobsQuery.refetch();
      void samplerQuery.refetch();
      void sourceHistoryQuery.refetch();
      toast.success(`Night Drive fallback stored: ${result.genre.label}. Press Play to start it.`);
      return true;
    } catch (error) {
      console.error("[Fallback] Could not persist Night Drive source", error);
      setFallbackStatus("failed");
      toast.error("Night Drive fallback could not be stored. Select a project source manually.");
      return false;
    }
  };
  const selected = tracksState.find((track) => track.id === selectedTrack) ?? tracksState[0];
  const activeCount = tracksState.filter((track) => !track.muted).length;
  const soloActive = tracksState.some((track) => track.solo);
  const previewAsset = (assetsQuery.data ?? []).find((asset) => asset.id === previewAssetId && asset.mimeType.startsWith("audio/"));
  const selectedRadioStation = parkwayRadioStations.find((station) => station.id === radioStationId) ?? parkwayRadioStations[0];
  const selectedRadioProgramme = getStationProgramme(selectedRadioStation.id, radioProgrammeId);
  const previewSource = radioActive ? (selectedRadioProgramme?.sourceUrl ?? selectedRadioStation.sourceUrl) : historySourceUrl ?? fallbackSourceUrl ?? (previewAsset ? `/manus-storage/${previewAsset.storageKey}` : activeTrack.src);
  const previewLabel = radioActive ? `${selectedRadioStation.name} · ${selectedRadioProgramme?.title ?? selectedRadioStation.nowPlaying}` : historySourceLabel ?? (fallbackSelection ? `Night Drive fallback · ${fallbackSelection.genre.label}` : previewAsset ? previewAsset.filename : activeTrack.label);
  const previewBars = useMemo(() => {
    const bars = previewAsset ? parseWaveform(previewAsset.waveformPreview) : makeFallbackWaveform(new TextEncoder().encode(activeTrack.label), 64);
    const source = bars.length ? bars : makeFallbackWaveform(new TextEncoder().encode(previewLabel), 64);
    return Array.from({ length: source.length * waveformZoom }, (_, index) => source[Math.floor(index / waveformZoom)] ?? 12);
  }, [previewAsset, activeTrack.label, previewLabel, waveformZoom]);
  const previewOptions = useMemo(() => [
    ...AUDIO_TRACKS.map((track) => ({ value: `track:${track.id}`, label: track.label, detail: track.tag })),
    ...(assetsQuery.data ?? []).filter((asset) => asset.mimeType.startsWith("audio/")).map((asset) => ({ value: `asset:${asset.id}`, label: asset.filename, detail: `${formatDuration(asset.durationMs)} · ${asset.assetType.toUpperCase()}` })),
  ], [assetsQuery.data]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setActiveBar((bar) => (bar >= loopRegion.end ? loopRegion.start : bar + 1)), 1530);
    return () => window.clearInterval(timer);
  }, [isPlaying, loopRegion]);

  useEffect(() => {
    const key = "parkway-tracked-visits";
    const next = Number(window.localStorage.getItem(key) ?? "0") + 1;
    window.localStorage.setItem(key, String(next));
    setTrackedVisits(next);
  }, []);

  useEffect(() => {
    const nav = navigator as Navigator & { requestMIDIAccess?: () => Promise<any> };
    if (!nav.requestMIDIAccess) return;
    nav.requestMIDIAccess().then((access) => {
      const inputs = Array.from(access.inputs.values());
      setMidiInputs(inputs.map((input: any) => input.name || "MIDI input"));
      setMidiStatus(inputs.length ? `${inputs.length} device${inputs.length > 1 ? "s" : ""} connected` : "No devices connected");
      inputs.forEach((input: any) => { input.onmidimessage = (event: any) => { const [status, note, velocity] = event.data ?? []; if ((status & 0xf0) === 0x90 && velocity > 0) { const pad = midiMap[note] ?? note % PERFORMANCE_PADS.length; setPressedPads((items) => Array.from(new Set([...items, pad]))); window.setTimeout(() => setPressedPads((items) => items.filter((item) => item !== pad)), 140); } }; });
    }).catch(() => setMidiStatus("MIDI permission denied"));
  }, [midiMap]);

  const ensureAudioGraph = () => {
    if (!audioRef.current) return null;
    const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return null;
    if (!audioContextRef.current) {
      const context = new AudioContextCtor();
      const source = context.createMediaElementSource(audioRef.current);
      const analyser = context.createAnalyser();
      const normalizer = context.createDynamicsCompressor();
      const previewGain = context.createGain();
      const masterGain = context.createGain();
      audioRef.current.muted = false;
      audioRef.current.volume = 1;
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      masterGain.gain.value = clampMasterVolume(master) / 100;
      normalizer.threshold.value = 0;
      normalizer.knee.value = 0;
      normalizer.ratio.value = 1;
      normalizer.attack.value = 0.003;
      normalizer.release.value = 0.12;
      previewGain.gain.value = 1;
      analyser.connect(normalizer).connect(previewGain).connect(masterGain).connect(context.destination);
      sourceNodeRef.current = source;
      analyserRef.current = analyser;
      normalizerRef.current = normalizer;
      previewGainRef.current = previewGain;
      masterGainRef.current = masterGain;
      audioContextRef.current = context;
      context.onstatechange = () => setStereoStatus(context.state === "running" ? "ready" : "locked");
      tracksState.forEach((track) => {
        const gain = context.createGain();
        const pan = context.createStereoPanner();
        gain.gain.value = track.level / 100;
        pan.pan.value = track.pan / 50;
        gain.connect(pan);
        pan.connect(analyser);
        trackNodesRef.current[track.id] = { gain, pan };
      });
      routeSourceToTrack(selectedTrack);
    }
    return audioContextRef.current;
  };

  function routeSourceToTrack(trackId: string) {
    const source = sourceNodeRef.current;
    const node = trackNodesRef.current[trackId];
    if (!source || !node) { setChannelStatus("error"); return false; }
    try {
      source.disconnect();
      source.connect(node.gain);
      setChannelStatus("ready");
      setMixBusStatus("ready");
      return true;
    } catch (error) {
      console.error("[Audio] Channel Rack route recovery failed", error);
      setChannelStatus("error");
      setMixBusStatus("error");
      return false;
    }
  }

  useEffect(() => {
    if (sourceNodeRef.current) routeSourceToTrack(selectedTrack);
  }, [selectedTrack, currentTrackId]);

  useEffect(() => {
    const masterGain = masterGainRef.current;
    const safeMaster = clampMasterVolume(master);
    if (safeMaster !== master) { setMaster(safeMaster); return; }
    window.localStorage.setItem("parkway-master-volume", String(safeMaster));
    if (masterGain && audioContextRef.current) masterGain.gain.setTargetAtTime(safeMaster / 100, audioContextRef.current.currentTime, 0.025);
  }, [master]);

  useEffect(() => {
    const soloEnabled = tracksState.some((track) => track.solo);
    tracksState.forEach((track) => {
      const node = trackNodesRef.current[track.id];
      if (!node || !audioContextRef.current) return;
      const audible = !track.muted && (!soloEnabled || track.solo);
      node.gain.gain.setTargetAtTime(audible ? Math.max(0.01, track.level / 100) : 0.0001, audioContextRef.current.currentTime, 0.012);
    });
  }, [tracksState]);

  useEffect(() => {
    window.localStorage.setItem("parkway-compact-mode", String(compactMode));
  }, [compactMode]);

  useEffect(() => {
    const normalizer = normalizerRef.current;
    if (!normalizer) return;
    normalizer.threshold.value = peakNormalize ? -3 : 0;
    normalizer.ratio.value = peakNormalize ? 12 : 1;
  }, [peakNormalize]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onAudioError = () => { setChannelStatus("error"); setMixBusStatus("error"); setStereoStatus("error"); if (radioActive) { setIsPlaying(false); toast.error("The current PARKWAY Radio programme could not load. Select another programme or retry playback."); return; } void requestProjectFallback("media-error"); };
    audio.addEventListener("error", onAudioError);
    return () => audio.removeEventListener("error", onAudioError);
  }, [fallbackSourceUrl, autoFallbackEnabled, isAuthenticated, radioActive]);

  useEffect(() => {
    window.localStorage.setItem("parkway-night-drive-auto-fallback", String(autoFallbackEnabled));
    if (!autoFallbackEnabled) setFallbackStatus("paused");
    if (autoFallbackEnabled && fallbackStatus === "paused") setFallbackStatus("armed");
  }, [autoFallbackEnabled]);

  useEffect(() => {
    if (!isPlaying || !analyserRef.current) return;
    const analyser = analyserRef.current;
    const frequencyData = new Uint8Array(analyser.frequencyBinCount);
    const bands = 8;
    const draw = () => {
      analyser.getByteFrequencyData(frequencyData);
      const nextBands = Array.from({ length: bands }, (_, index) => {
        const start = Math.floor((index / bands) * frequencyData.length);
        const end = Math.max(start + 1, Math.floor(((index + 1) / bands) * frequencyData.length));
        const slice = frequencyData.slice(start, end);
        return slice.reduce((sum, value) => sum + value, 0) / (slice.length * 255);
      });
      const energy = nextBands.reduce((sum, value) => sum + value, 0) / bands;
      setEqBands(nextBands);
      setMeterLevels(Object.fromEntries(tracks.map((track) => [track.id, track.id === selectedTrack ? energy : 0])));
      analysisFrameRef.current = window.requestAnimationFrame(draw);
    };
    draw();
    return () => { if (analysisFrameRef.current !== null) window.cancelAnimationFrame(analysisFrameRef.current); analysisFrameRef.current = null; };
  }, [isPlaying, selectedTrack]);

  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    audioRef.current.load();
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
  }, [currentTrackId, previewAssetId, fallbackSourceUrl, historySourceUrl]);

  const enableStereo = async () => {
    const context = ensureAudioGraph();
    if (!context || !audioRef.current) { setStereoStatus("error"); toast.error("Stereo output is not supported in this browser."); return false; }
    try {
      audioRef.current.muted = false;
      audioRef.current.volume = radioActive ? radioVolume / 100 : 1;
      if (context.state !== "running") await context.resume();
      setTracksState((items) => items.map((track) => track.id === selectedTrack ? { ...track, muted: false } : track));
      if (!routeSourceToTrack(selectedTrack)) throw new Error("Active Channel Rack route is unavailable");
      const activeNode = trackNodesRef.current[selectedTrack];
      if (activeNode) activeNode.gain.gain.setTargetAtTime(Math.max(0.01, (tracksState.find((track) => track.id === selectedTrack)?.level ?? 70) / 100), context.currentTime, 0.015);
      setStereoStatus("ready");
      toast.success("Stereo output enabled. Master level is protected at 45% or above.");
      return true;
    } catch (error) {
      console.error(error);
      setStereoStatus("error");
      toast.error("Stereo output is blocked. Use Enable Stereo again after interacting with the page.");
      return false;
    }
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); return; }
    try {
      if (!await enableStereo()) return;
      await audioRef.current.play();
      setIsPlaying(true);
      setStereoStatus("ready");
    } catch (error) {
      if (isExpectedOperationAbort(error)) {
        setIsPlaying(false);
        return;
      }
      console.error(error);
      setStereoStatus("error");
      toast.error("Audio preview could not start. Enable Stereo and check the selected browser output; a fallback is reserved for failed media sources.");
    }
  };

  const recoverAndPlay = async () => {
    const context = ensureAudioGraph();
    const audio = audioRef.current;
    if (!context || !audio) { setStereoStatus("error"); toast.error("Browser audio output is unavailable on this device."); return; }
    try {
      setTracksState((items) => items.map((track) => ({ ...track, muted: false, solo: false })));
      if (context.state !== "running") await context.resume();
      if (!routeSourceToTrack(selectedTrack)) throw new Error("Channel Rack route could not be restored");
      Object.entries(trackNodesRef.current).forEach(([trackId, node]) => {
        const level = tracksState.find((track) => track.id === trackId)?.level ?? 70;
        node.gain.gain.setTargetAtTime(Math.max(0.01, level / 100), context.currentTime, 0.01);
      });
      masterGainRef.current?.gain.setTargetAtTime(clampMasterVolume(master) / 100, context.currentTime, 0.01);
      audio.muted = false;
      audio.volume = radioActive ? radioVolume / 100 : 1;
      await audio.play();
      setChannelStatus("ready"); setMixBusStatus("ready"); setStereoStatus("ready"); setIsPlaying(true);
      toast.success("Stereo recovery running. Channel Rack, Mix Bus, and Stereo Out are active.");
    } catch (error) {
      if (isExpectedOperationAbort(error)) { setIsPlaying(false); toast("Source changed during recovery. Press Recover & Play once more."); return; }
      console.error("[Audio] Recovery failed", error);
      setStereoStatus("error");
      toast.error("Recovery could not start playback. Check the device output route, then press Recover & Play again.");
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0); setIsPlaying(false); setActiveBar(1);
  };

  const scrubPreview = (event: React.PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const nextTime = duration * Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    if (audioRef.current) audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };
  const nudgePreview = (seconds: number) => {
    if (!audioRef.current) return;
    const nextTime = Math.max(0, Math.min(duration, audioRef.current.currentTime + seconds));
    audioRef.current.currentTime = nextTime;
    setCurrentTime(nextTime);
  };

  const selectPreviewSource = (value: string) => {
    const [kind, rawId] = value.split(":");
    const clearedFallback = clearFallbackForManualSource();
    setFallbackSourceUrl(clearedFallback.fallbackSourceUrl);
    setFallbackSelection(clearedFallback.fallbackSelection);
    setHistorySourceUrl(null);
    setHistorySourceLabel(null);
    setRadioActive(false);
    if (kind === "asset") { setPreviewAssetId(Number(rawId)); return; }
    setPreviewAssetId(null);
    setCurrentTrackId(rawId as (typeof AUDIO_TRACKS)[number]["id"]);
  };
  const selectRadioStation = (stationId: string) => {
    const firstProgramme = getStationProgramme(stationId, null);
    setRadioStationId(stationId);
    setRadioProgrammeId(firstProgramme?.id ?? null);
    setRadioActive(true);
    setPreviewAssetId(null);
    setHistorySourceUrl(null);
    setHistorySourceLabel(null);
    setFallbackSourceUrl(null);
    setFallbackSelection(null);
    stop();
    toast("Station tuned. Press Play to start the original-audio programme.");
  };
  const startRadioPractice = async (stationId: string) => {
    const firstProgramme = getStationProgramme(stationId, null);
    const audio = audioRef.current;
    if (!firstProgramme || !audio) { toast.error("The selected practice programme is unavailable."); return; }
    setRadioStationId(stationId);
    setRadioProgrammeId(firstProgramme.id);
    setRadioActive(true);
    setPreviewAssetId(null);
    setHistorySourceUrl(null);
    setHistorySourceLabel(null);
    setFallbackSourceUrl(null);
    setFallbackSelection(null);
    audio.pause();
    audio.src = firstProgramme.sourceUrl;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setIsPlaying(false);
    try {
      if (!await enableStereo()) return;
      await audio.play();
      setIsPlaying(true);
      setStereoStatus("ready");
      toast.success(`Practice session started: ${firstProgramme.title}`);
    } catch (error) {
      if (isExpectedOperationAbort(error)) { setIsPlaying(false); return; }
      setStereoStatus("error");
      toast.error("Practice playback could not start. Use Recover & Play, then choose the station again.");
    }
  };
  const selectRadioProgramme = (programmeId: string) => {
    const programme = getStationProgramme(selectedRadioStation.id, programmeId);
    const audio = audioRef.current;
    setRadioProgrammeId(programmeId);
    setRadioActive(true);
    setPreviewAssetId(null);
    setHistorySourceUrl(null);
    setHistorySourceLabel(null);
    setFallbackSourceUrl(null);
    setFallbackSelection(null);
    if (audio && programme) {
      audio.pause();
      audio.src = programme.sourceUrl;
      audio.load();
      setCurrentTime(0);
      setDuration(0);
      setIsPlaying(false);
    }
  };
  const stepRadioProgramme = (direction: -1 | 1, resume = false) => {
    const next = getAdjacentStationProgramme(selectedRadioStation.id, radioProgrammeId, direction);
    if (!next) return;
    selectRadioProgramme(next.id);
    if (resume) window.setTimeout(() => void togglePlay(), 0);
  };
  const toggleRadioPlayback = () => {
    if (!radioActive) {
      selectRadioStation(radioStationId);
      window.setTimeout(() => void togglePlay(), 0);
      return;
    }
    void togglePlay();
  };
  const changeRadioVolume = (value: number) => {
    setRadioVolume(value);
    if (radioActive && audioRef.current) audioRef.current.volume = value / 100;
  };
  const restoreSourceVersion = async (assetId: number) => {
    setHistoryPendingId(assetId);
    try {
      const restored = await restoreSourceHistory.mutateAsync({ projectKey, assetId });
      const clearedFallback = clearFallbackForManualSource();
      setFallbackSourceUrl(clearedFallback.fallbackSourceUrl);
      setFallbackSelection(clearedFallback.fallbackSelection);
      setPreviewAssetId(null);
      setHistorySourceUrl(restored.sourceUrl);
      setHistorySourceLabel(restored.filename);
      stop();
      void sourceHistoryQuery.refetch();
      toast.success(`Restored source version: ${restored.filename}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not restore this source version");
    } finally { setHistoryPendingId(null); }
  };
  const deleteSourceVersion = async (assetId: number) => {
    if (!window.confirm("Delete this source version from the project history? The stored audio file will not be removed.")) return;
    setHistoryPendingId(assetId);
    try {
      await deleteSourceHistory.mutateAsync({ projectKey, assetId });
      void sourceHistoryQuery.refetch();
      void assetsQuery.refetch();
      toast.success("Source version removed from this project history");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not delete this source version");
    } finally { setHistoryPendingId(null); }
  };
  const submitContactEnquiry = async () => {
    try {
      await contactSubmit.mutateAsync(contactDraft);
      setContactDraft({ name: "", email: "", serviceInterest: "production", message: "", paymentDetailsRequested: false, website: "" });
      toast.success("Enquiry received. We will follow up using the contact details you provided.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The enquiry could not be sent");
    }
  };

  const submitHardwareRegistration = () => {
    if (!isAuthenticated) { startLogin(); return; }
    if (hardwareDraft.label.trim().length < 2) { toast.error("Enter a device label with at least two characters"); return; }
    void registerHardware.mutateAsync({ label: hardwareDraft.label.trim(), category: hardwareDraft.category, productReference: hardwareDraft.productReference.trim() || undefined });
  };
  const activateHardwareSoundAccess = (registrationId: number) => {
    if (!soundAccessConsent) { toast.error("Review and accept the sound-access notice before activation"); return; }
    void activateHardware.mutateAsync({ registrationId, consentGranted: true, noticeVersion: "PARKWAY-SOUND-ACCESS-v1" });
  };
  const updateTrack = (id: string, update: Partial<TrackState>) => {
    setTracksState((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
    const node = trackNodesRef.current[id];
    if (node && typeof update.level === "number") node.gain.gain.value = update.level / 100;
    if (node && typeof update.pan === "number") node.pan.pan.value = update.pan / 50;
  };
  const triggerSamplerLane = (id: string) => { setSamplerLaneState((items) => ({ ...items, [id]: "queued" })); window.setTimeout(() => setSamplerLaneState((items) => ({ ...items, [id]: "complete" })), 900); };
  const startGeneration = async () => {
    if (generationState === "idle" || generationState === "completed") { setGenerationState("awaiting-approval"); return; }
    if (generationState === "awaiting-approval") {
      if (!isAuthenticated) { toast("Sign in to persist generation jobs"); startLogin(); return; }
      setGenerationState("running");
      try {
        const job = await createJob.mutateAsync({ projectKey, jobType: "music", prompt: "Autonomous PARKWAY master-bus composition · HETG constellation motion · neon pink NGT signal" });
        await transitionJob.mutateAsync({ jobId: job.id, status: "running" });
        window.setTimeout(async () => { try { await transitionJob.mutateAsync({ jobId: job.id, status: "completed" }); await createSamplerOutput.mutateAsync({ projectKey, generationJobId: job.id, outputType: "music", name: "Autonomous Manus AI Audio", durationMs: 60000, waveformPreview: JSON.stringify(makeFallbackWaveform(new TextEncoder().encode("autonomous-hetg-ngt-neon-pink"))), tags: ["autonomous", "hetg", "ngt", "neon-pink"] }); void jobsQuery.refetch(); void samplerQuery.refetch(); setGenerationState("completed"); } catch { await transitionJob.mutateAsync({ jobId: job.id, status: "failed", errorMessage: "Sampler output persistence failed" }); setGenerationState("idle"); toast.error("Generation job failed while saving its sampler output"); } }, 900);
      } catch { setGenerationState("idle"); toast.error("Could not create generation job"); }
    }
  };
  const editAssetTags = async (assetId: number, currentTags: string[]) => { const next = window.prompt("Edit asset tags (comma-separated)", currentTags.join(", ")); if (next === null) return; await updateAssetTags.mutateAsync({ assetId, tags: next.split(",").map((tag) => tag.trim()).filter(Boolean) }); };
  const handleAssetPick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (!isAuthenticated) { toast("Sign in to store assets in your cloud project"); startLogin(); return; }
    if (file.size > 30 * 1024 * 1024) { toast.error("Assets must be 30 MB or smaller"); return; }
    setUploadingAsset(true);
    try {
      const metadata = await extractMediaMetadata(file);
      const dataBase64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.onerror = () => reject(new Error("Could not read the file")); reader.readAsDataURL(file); });
      await uploadAsset.mutateAsync({ projectKey, filename: file.name, mimeType: file.type || "application/octet-stream", assetType, dataBase64, durationMs: metadata.durationMs, waveformPreview: metadata.waveformPreview, tags: assetTags.split(",").map((tag) => tag.trim()).filter(Boolean) });
    } finally { setUploadingAsset(false); }
  };
  const handleManusMusicUpload = async (file: File) => {
    if (!isAuthenticated) { toast("Sign in to store music in your private project library"); startLogin(); return; }
    if (!file.type.startsWith("audio/")) { toast.error("Select a supported audio file for the Manus Music Generator lane"); return; }
    if (file.size > 30 * 1024 * 1024) { toast.error("Music uploads must be 30 MB or smaller"); return; }
    setUploadingManusMusic(true);
    setManusUploadStage("reading");
    try {
      setManusUploadStage("analysing");
      const metadata = await extractMediaMetadata(file);
      setManusUploadStage("uploading");
      const dataBase64 = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result).split(",")[1] ?? ""); reader.onerror = () => reject(new Error("Could not read the audio file")); reader.readAsDataURL(file); });
      const stored = await uploadManusMusic.mutateAsync({ projectKey, filename: file.name, mimeType: file.type, dataBase64, durationMs: metadata.durationMs, waveformPreview: metadata.waveformPreview, tags: [] });
      const refreshedAssets = await assetsQuery.refetch();
      if (!refreshedAssets.data?.some((asset) => asset.id === stored.id)) throw new Error("The stored audio asset could not be confirmed for playback");
      selectPreviewSource(`asset:${stored.id}`);
      setManusUploadStage("stored");
      toast.success("Music stored and selected for the stereo preview. Press Play to listen.");
    } catch (error) { setManusUploadStage("error"); toast.error(error instanceof Error ? error.message : "The approved music file could not be stored"); } finally { setUploadingManusMusic(false); }
  };
  const playManusMusicAsset = (assetId: number) => {
    selectPreviewSource(`asset:${assetId}`);
    window.setTimeout(() => void togglePlay(), 0);
  };
  const playPad = async (index: number) => {
    setPressedPads((items) => Array.from(new Set([...items, index])));
    window.setTimeout(() => setPressedPads((items) => items.filter((item) => item !== index)), 140);
    const context = ensureAudioGraph();
    if (!context) return;
    try {
      if (context.state !== "running") await context.resume();
      setStereoStatus("ready");
      const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 110 * Math.pow(2, index / 12); oscillator.type = index % 3 === 0 ? "sine" : "triangle"; gain.gain.setValueAtTime(.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(.14, context.currentTime + .01); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .18); oscillator.connect(gain).connect(masterGainRef.current ?? context.destination); oscillator.start(); oscillator.stop(context.currentTime + .2);
    } catch {
      setStereoStatus("error");
      toast.error("Practice pad audio is blocked. Interact with the page and try the cue again.");
    }
  };
  const positionFromClientX = (clientX: number) => { const rect = timelineRef.current?.getBoundingClientRect(); if (!rect) return 0; return Math.max(0, Math.min(GRID_BEATS, ((clientX - rect.left) / rect.width) * GRID_BEATS)); };
  const handleTimelinePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingHandle) { const value = Math.round(positionFromClientX(event.clientX)); setLoopRegion((region) => draggingHandle === "start" ? { start: Math.min(value, region.end - 1), end: region.end } : { start: region.start, end: Math.max(value, region.start + 1) }); }
    if (draggingClip) { const value = Math.round(positionFromClientX(event.clientX)); updateTrack(draggingClip, { clipStart: Math.max(0, Math.min(100 - tracksState.find((track) => track.id === draggingClip)!.clipLength, value * (100 / GRID_BEATS))) }); }
  };
  const soloedIds = useMemo(() => tracksState.filter((track) => track.solo).map((track) => track.id), [tracksState]);
  const visibleAssets = useMemo(() => (assetsQuery.data ?? []).filter((asset) => assetFilterTag === "all" || parseTags(asset.tags).includes(assetFilterTag)), [assetsQuery.data, assetFilterTag]);

  return (
    <main className={`parkway-app ${compactMode ? "compact-mode" : ""}`}>
      <audio ref={audioRef} src={previewSource} preload="metadata" loop={radioActive ? false : isLooping} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => { setIsPlaying(false); setMeterLevels(Object.fromEntries(tracks.map((track) => [track.id, 0]))); if (radioActive) stepRadioProgramme(1, true); }} onError={() => toast.error(`Audio source failed to load: ${previewLabel}`)} />
      <div className="parkway-grid" />
      <aside className={`sidebar ${showBrowser ? "sidebar-open" : "sidebar-collapsed"}`}>
        <div className="brand-lockup"><div className="brand-mark"><AudioWaveform size={19} /></div>{showBrowser && <div><div className="brand-name">PARKWAY</div><div className="brand-sub">JIG CODE / DAW</div></div>}</div>
        {showBrowser && <>
          <div className="side-label">Workspace</div>
          <nav className="side-nav">
            {[{ label: "Arrangement", icon: Layers3 }, { label: "Mixer", icon: SlidersHorizontal }, { label: "Piano Roll", icon: Grid3X3 }, { label: "Performance", icon: Zap }, { label: "Studio", icon: Sparkles }, { label: "Generator", icon: Waves }, { label: "Radio", icon: Radio }, { label: "Product", icon: Gauge }, { label: "Devices", icon: HardDrive }, { label: "Develop", icon: Code2 }, { label: "Assets", icon: FolderOpen }, { label: "History", icon: RotateCcw }, { label: "Feedback", icon: AlertTriangle }, ...(user?.role === "admin" ? [{ label: "Review", icon: ShieldCheck }] : []), { label: "Contact", icon: Radio }].map(({ label, icon: Icon }) => <button key={label} className={`side-link ${activeView === label ? "is-active" : ""}`} onClick={() => setActiveView(label as ParkwayWorkspace)}><Icon size={15} /><span>{label}</span>{label === "Performance" && <span className="live-dot" />}</button>)}
          </nav>
          <div className="side-label">Project</div>
          <div className="project-card"><div className="project-orbit"><Disc3 size={18} /></div><div className="min-w-0"><div className="project-title">Night Drive / 07</div><div className="project-meta">D major · 156 BPM</div></div><ChevronDown size={14} className="text-muted" /></div>
          <div className="side-label side-label-row"><span>Library</span><button onClick={() => toast("Browser refresh queued")}>+</button></div>
          <div className="library-list"><button onClick={() => toast("Drum kits loaded")}><FolderOpen size={14} /> Drum kits <span>24</span></button><button onClick={() => toast("Synth presets loaded")}><Sparkles size={14} /> Synth presets <span>81</span></button><button onClick={() => toast("Field recordings loaded")}><Waves size={14} /> Field recordings <span>12</span></button></div>
          <div className="sidebar-footer"><div className="status-line"><span className="status-light" /> Engine nominal</div><div className="status-detail">44.1 kHz · 24 bit<br />CPU 12% · RAM 2.4 GB<br />Tracked visits: {trackedVisits}</div><button className={`tracked-toggle ${autoFallbackEnabled ? "is-on" : ""}`} onClick={() => setAutoFallbackEnabled((value) => !value)}><span className="toggle-dot" /> Auto fallback after media error</button></div>
        </>}
        <button className="sidebar-toggle" aria-label="Toggle browser" onClick={() => setShowBrowser((value) => !value)}><Menu size={15} /></button>
      </aside>

      <section className="workspace">
        <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setShowBrowser((value) => !value)}><Menu size={16} /></button><div className="breadcrumb"><span>SESSIONS</span><span className="crumb-separator">/</span><strong>Night Drive</strong><span className="saved-state"><span /> Autosaved</span></div></div><div className="top-actions"><button className="icon-button" onClick={() => toast("Search is ready for instruments, clips, and commands")}><Search size={15} /></button><button className="icon-button" onClick={() => toast("Settings panel coming soon")}><Settings2 size={15} /></button><button className="user-chip" onClick={() => toast("PARKWAY operator profile")}>JM</button></div></header>

        <div className="transport"><div className="transport-group transport-main"><button className="transport-button" onClick={stop}><Square size={13} fill="currentColor" /></button><button className={`transport-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay}>{isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><button className={`transport-button ${isLooping ? "is-on" : ""}`} onClick={() => setIsLooping((value) => !value)}><RotateCcw size={14} /></button><div className="transport-divider" /><div className="tempo-control"><span className="transport-caption">TEMPO</span><input aria-label="Tempo" type="number" value={tempo} min={40} max={240} onChange={(event) => setTempo(Number(event.target.value))} /><span className="unit">BPM</span></div><div className="transport-divider" /><div className="timecode"><span className="timecode-main">{formatTime(currentTime)}</span><span className="timecode-sub">/ {formatTime(duration)}</span></div></div><div className="transport-center"><div className="bar-display"><span className="transport-caption">BAR</span><strong>{String(activeBar).padStart(2, "0")}</strong><span className="bar-total">/ 16</span></div><div className="transport-status"><span className="status-light" /> {isPlaying ? "PLAYING" : stereoStatus === "ready" ? "STEREO READY" : "READY"}</div></div><div className="transport-group transport-end"><div className="track-select"><AudioWaveform size={14} /><select aria-label="Audio preview" value={currentTrackId} onChange={(event) => { const clearedFallback = clearFallbackForManualSource(); setFallbackSourceUrl(clearedFallback.fallbackSourceUrl); setFallbackSelection(clearedFallback.fallbackSelection); setHistorySourceUrl(null); setHistorySourceLabel(null); setRadioActive(false); setCurrentTrackId(event.target.value as (typeof AUDIO_TRACKS)[number]["id"]); stop(); }}><option value="geo-render">GEO Controller Render</option><option value="muchie-casket">Muchie Pop Casket</option><option value="autonomous-project">Autonomous Manus AI Audio</option></select></div><button className="transport-button" onClick={() => toast("Metronome enabled for the next take")}><Activity size={14} /></button><button className="transport-button" onClick={() => toast("Project saved locally")}><Save size={14} /></button></div></div>
        <StereoControl master={master} status={stereoStatus} channel={channelStatus} mixBus={mixBusStatus} compact={compactMode} onEnable={() => void enableStereo()} onRecover={() => void recoverAndPlay()} onMasterChange={setMaster} onCompactToggle={() => setCompactMode((value) => { const next = !value; setShowBrowser(!next); return next; })} />

        <div className="content-scroll"><div className="workspace-heading"><div><div className="section-kicker"><Radio size={13} /> {activeView} / MASTER SESSION</div><h1>Master bus.<br /><em>Ready to move.</em></h1><p className="heading-copy">Transport, timing, and signal routing in one tactile performance surface.</p><div className="master-readout"><div className="readout-scope"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="readout-meta"><span>MASTER / STEREO</span><strong>{master}%</strong><small>-3.2 dB peak · 6.8 dB headroom</small></div><div className="readout-state"><span className="status-light" /> READY</div></div></div><div className="heading-tools"><button className="outline-button" onClick={() => toast("New track added to the session")}><Plus size={14} /> Add track</button><button className="solid-button" onClick={() => toast("Render queue started")}><Zap size={14} /> Render</button></div></div>

          {activeView === "Studio" && <section className="studio-panel panel"><div className="panel-header"><div><div className="section-kicker"><Sparkles size={13} /> Music Studio Production / cloud workspace</div><h2>Studio systems <span className="muted-slash">/</span> <span>Night Drive / 07</span></h2></div><div className="panel-header-actions"><span className="small-pill"><span className="status-light" /> {isAuthenticated ? "PRIVATE WORKSPACE" : "SIGN IN TO STORE"}</span></div></div><div className="studio-intro"><div><strong>Assemble the rig.</strong><span>Mini PCs, standalone grooveboxes, instruments, interfaces, and the assets that make a session move.</span><small className="signal-language">VGA signal rail · OTcl object notes · octal rhythm grid · RIJG vocal recursion</small></div><button className="solid-button" onClick={startGeneration}><Zap size={14} /> {generationState === "idle" ? "Prepare generation" : generationState === "awaiting-approval" ? "Approve & generate" : generationState === "running" ? "Generating…" : "Generated source ready"}</button></div><div className="launch-ledger"><div className="studio-subhead"><div><span className="section-kicker"><ShieldCheck size={13} /> Verified product ledger</span><h3>Official source, stated launch date, and specification</h3></div><span className="small-pill">THIRD-PARTY REFERENCES</span></div><div className="launch-ledger-grid">{verifiedProductLedger.map((product) => <article key={product.name} className="launch-product"><span>{product.kind}</span><strong>{product.name}</strong><em>{product.launch}</em><small>{product.detail}</small><div><a href={product.launchUrl} target="_blank" rel="noreferrer">Official launch ↗</a><a href={product.specUrl} target="_blank" rel="noreferrer">Official specs ↗</a></div></article>)}</div><p>Compatibility references only. PARKWAY does not sell, activate, control, certify, or issue licences for these third-party products.</p></div><div className="metadata-treatment"><div><span className="section-kicker"><Gauge size={13} /> Abstract metadata treatment / not a NASA data feed</span><strong>HETG / CIAO signal grammar</strong><small>Reference language only: high-energy grating geometry, vector-index rulers, constellation angles, Hyperion gothic-techno labels, and neon pink 10×12 motion cells.</small></div><div className="metadata-cells">{["HETG", "CIAO", "NGT", "ANNGT", "12×GFX"].map((label) => <span key={label}>{label}</span>)}</div></div><div className="catalog-grid">{parkwayConceptModules.map((item) => <button key={item.name} className={`catalog-card catalog-${item.accent}`} onClick={() => toast(`${item.name} is a PARKWAY concept module, not a purchasable product`)}><span>{item.kind}</span><strong>{item.name}</strong><small>{item.detail}</small><em>{item.note}</em></button>)}</div><div className="bridge-panel"><div><span className="section-kicker"><Radio size={13} /> Ableton Live bridge / concept boundary</span><strong>Local companion required for external control</strong><small>Browser MIDI mapping is live in this workspace. Direct Ableton transport/control is intentionally read-only here until a user-provided companion or Max for Live endpoint is connected.</small></div><span className="small-pill">CONCEPT / READ-ONLY</span></div>{generationState !== "idle" && <div className={`generation-status generation-${generationState}`}><span className="status-light" /><strong>{generationState === "awaiting-approval" ? "Approval required before autonomous generation" : generationState === "running" ? "Manus AI is assembling a sampler-ready source" : "Autonomous source complete · available in the audio browser"}</strong><small>{generationState === "completed" ? "Autonomous Manus AI Audio · 60 sec · D major · 156 BPM" : "No background generation occurs without this visible user action."}</small></div>}{(jobsQuery.data?.length || samplerQuery.data?.length) ? <div className="job-log"><div className="studio-subhead"><div><span className="section-kicker"><Activity size={13} /> Durable generation ledger</span><h3>Jobs & sampler outputs</h3></div><span className="small-pill">{jobsQuery.data?.length ?? 0} jobs · {samplerQuery.data?.length ?? 0} outputs</span></div><div className="job-log-grid">{(jobsQuery.data ?? []).slice(-4).map((job) => <div key={job.id} className="job-row"><span className={`job-status job-${job.status}`}>{job.status}</span><strong>{job.jobType.toUpperCase()}</strong><small>{job.prompt}</small></div>)}{(samplerQuery.data ?? []).slice(-4).map((output) => <div key={`output-${output.id}`} className="job-row output-row"><span className="job-status job-completed">OUTPUT</span><strong>{output.outputType.toUpperCase()}</strong><small>{output.name} · {formatDuration(output.durationMs)} · {parseTags(output.tags).map((tag) => `#${tag}`).join(" ")}</small><div className="asset-waveform ledger-waveform">{parseWaveform(output.waveformPreview).map((bar, index) => <i key={`${output.id}-${index}`} style={{ height: `${Math.max(12, bar)}%` }} />)}</div></div>)}</div></div> : null}<div className="preset-strip"><div className="studio-subhead"><div><span className="section-kicker"><Settings2 size={13} /> Preset browser</span><h3>Jig chains & motion studies</h3></div></div><div className="preset-grid">{presets.map((preset) => <button key={preset.name} className={`preset-card preset-${preset.color}`} onClick={() => toast(`${preset.name} loaded into the active project`) }><strong>{preset.name}</strong><small>{preset.group}</small><em>{preset.detail}</em></button>)}</div></div><div className="studio-columns"><div><div className="studio-subhead"><div><span className="section-kicker"><AudioWaveform size={13} /> Instruments & sound library</span><h3>Playable source material</h3></div><button className="outline-button outline-small" onClick={() => toast("Instrument browser is ready for expansion")}><Plus size={13} /> Add source</button></div><div className="instrument-list">{instruments.map((item) => <button key={item.name} className={`instrument-card instrument-${item.color}`} onClick={() => toast(`${item.name} loaded into the active source slot`)}><span className="instrument-led" /><div><strong>{item.name}</strong><small>{item.type} · {item.detail}</small></div><ChevronDown size={13} /></button>)}</div></div><div><div className="studio-subhead"><div><span className="section-kicker"><FolderOpen size={13} /> Project assets / S3-backed</span><h3>Vocals, SFX, samples & motion</h3></div><div className="asset-upload-tools"><select aria-label="Asset type" value={assetType} onChange={(event) => setAssetType(event.target.value as typeof assetType)}><option value="audio">Audio</option><option value="vocal">Vocal</option><option value="sfx">SFX</option><option value="sample">Sample</option><option value="motion">Motion</option><option value="image">Image</option></select><input aria-label="Asset tags" className="tag-input" value={assetTags} onChange={(event) => setAssetTags(event.target.value)} placeholder="tags: hetg, neon-pink" /><select aria-label="Filter assets by tag" value={assetFilterTag} onChange={(event) => setAssetFilterTag(event.target.value)}><option value="all">All tags</option>{Array.from(new Set((assetsQuery.data ?? []).flatMap((asset) => parseTags(asset.tags)))).map((tag) => <option key={tag} value={tag}>{tag}</option>)}</select><input ref={assetInputRef} type="file" className="sr-only" onChange={handleAssetPick} accept="audio/*,video/*,image/*,.json" /><button className="outline-button outline-small" onClick={() => assetInputRef.current?.click()} disabled={uploadingAsset}>{uploadingAsset ? "Uploading…" : "Upload asset"}</button></div></div><div className="sampler-lanes">{samplerSeeds.map((item) => <div key={item.id} className={`sampler-card sampler-${item.color}`}><div className="sampler-card-top"><span className="asset-kind">{item.type}</span><span className="sampler-state">{samplerLaneState[item.id] === "queued" ? "GENERATING" : samplerLaneState[item.id] === "complete" ? "READY" : "PREVIEW"}</span></div><strong>{item.name}</strong><small>{item.detail}</small><div className="asset-waveform sampler-waveform">{makeFallbackWaveform(new TextEncoder().encode(item.id), 40).map((bar, index) => <i key={`${item.id}-wave-${index}`} style={{ height: `${Math.max(12, bar)}%` }} />)}</div><div className="sampler-meta"><span>{item.duration}</span><span>{item.format}</span></div><div className="sampler-actions"><button className="outline-button outline-small" onClick={() => triggerSamplerLane(item.id)}>{samplerLaneState[item.id] === "queued" ? "Generating…" : "Generate lane"}</button><button className="text-button" onClick={() => toast(`${item.name} loaded into the sampler lane`)}>Load to project</button></div></div>)}</div><div className="asset-list">{visibleAssets.length ? visibleAssets.map((asset) => <a key={asset.id} className="asset-row" href={`/manus-storage/${asset.storageKey}`} target="_blank" rel="noreferrer"><span className="asset-kind">{asset.assetType}</span><div className="asset-main"><strong>{asset.filename}</strong><div className="asset-waveform">{parseWaveform(asset.waveformPreview).map((bar, index) => <i key={`${asset.id}-${index}`} style={{ height: `${Math.max(12, bar)}%` }} />)}</div><small>{Math.round(asset.sizeBytes / 1024)} KB · {asset.mimeType} · {formatDuration(asset.durationMs)}</small><div className="asset-tags">{parseTags(asset.tags).map((tag) => <span key={tag}>#{tag}</span>)}<button className="tag-edit" onClick={(event) => { event.preventDefault(); event.stopPropagation(); void editAssetTags(asset.id, parseTags(asset.tags)); }}>Edit tags</button></div></div></a>) : <div className="asset-empty"><Volume2 size={16} /><span>{isAuthenticated ? "No project assets yet. Upload a vocal, SFX pass, sample, or motion reference." : "Sign in to create a private cloud asset library."}</span>{!isAuthenticated && <button className="outline-button outline-small" onClick={startLogin}>Sign in</button>}</div>}</div></div></div></section>}

          {activeView === "Performance" && <section className="performance-panel panel"><div className="panel-header"><div><div className="section-kicker"><Zap size={13} /> Performance / hardware pads</div><h2>Jig pad bank <span className="muted-slash">/</span> <span>{midiStatus}</span></h2></div><div className="panel-header-actions"><span className="small-pill"><span className="status-light" /> {midiInputs.length ? midiInputs[0] : "Browser MIDI"}</span></div></div><div className="performance-body"><div className="pad-grid">{PERFORMANCE_PADS.map((pad, index) => <button key={pad} className={`performance-pad pad-${index % 6} ${pressedPads.includes(index) ? "is-pressed" : ""}`} onPointerDown={() => playPad(index)} onClick={() => setMidiMap((mapping) => ({ ...mapping, [36 + index]: index }))}><span>{String(index + 1).padStart(2, "0")}</span><strong>{pad}</strong><small>{midiMap[36 + index] === index ? "MAPPED" : `NOTE ${36 + index}`}</small></button>)}</div><div className="performance-side"><div className="performance-readout"><span className="transport-caption">MIDI ROUTING</span><strong>{midiInputs.length ? "LIVE INPUT" : "CLICK TO PLAY"}</strong><small>Click a pad to map note {36 + (pressedPads[0] ?? 0)}. External MIDI notes light the same pad.</small></div><button className="outline-button" onClick={() => toast(midiInputs.length ? `${midiInputs.length} MIDI input${midiInputs.length > 1 ? "s" : ""} listening` : "Connect a MIDI controller to enable hardware input")}><Headphones size={14} /> Check hardware</button></div></div></section>}

          {activeView !== "Radio" && <Inf4RadarDisplay active={isPlaying} stationLabel={previewLabel} />}
          <section className="arrangement-panel panel"><div className="panel-header"><div><div className="section-kicker"><AudioWaveform size={13} /> Arrangement / 16 bars</div><h2>Night Drive <span className="muted-slash">/</span> <span>Master comp</span></h2></div><div className="panel-header-actions"><span className="small-pill"><span className="status-light" /> {activeCount} active</span><button className="icon-button"><MoreIcon /></button></div></div><div className="timeline-ruler"><span />{Array.from({ length: 16 }).map((_, i) => <div key={i} className={i + 1 === activeBar ? "ruler-active" : ""}>{String(i + 1).padStart(2, "0")}</div>)}</div><div className="loop-editor"><span>LOOP</span><div className="loop-track"><div className="loop-fill" style={{ left: `${(loopRegion.start / GRID_BEATS) * 100}%`, width: `${((loopRegion.end - loopRegion.start) / GRID_BEATS) * 100}%` }} /><button className="loop-handle loop-handle-start" style={{ left: `${(loopRegion.start / GRID_BEATS) * 100}%` }} aria-label="Move loop start" onPointerDown={(event) => { event.stopPropagation(); setDraggingHandle("start"); }} /><button className="loop-handle loop-handle-end" style={{ left: `${(loopRegion.end / GRID_BEATS) * 100}%` }} aria-label="Move loop end" onPointerDown={(event) => { event.stopPropagation(); setDraggingHandle("end"); }} /></div><strong>{String(loopRegion.start).padStart(2, "0")} — {String(loopRegion.end).padStart(2, "0")} bars</strong></div><div ref={timelineRef} className="timeline-grid" onPointerMove={handleTimelinePointerMove} onPointerUp={() => { setDraggingHandle(null); setDraggingClip(null); }} onPointerLeave={() => { setDraggingHandle(null); setDraggingClip(null); }}>{tracksState.map((track, index) => <div key={track.id} className={`timeline-row ${selectedTrack === track.id ? "row-selected" : ""}`} onClick={() => setSelectedTrack(track.id)}><div className={`track-label label-${track.color}`}><div className="track-icon">{track.type === "midi" ? <Grid3X3 size={13} /> : <AudioWaveform size={13} />}</div><div className="track-copy"><strong>{track.name}</strong><span>{track.type.toUpperCase()} · {track.preset}</span></div></div><div className="clip-lane"><div className={`clip clip-${track.color}`} style={{ left: `${track.clipStart}%`, width: `${track.clipLength}%` }} onPointerDown={(event) => { event.stopPropagation(); setSelectedTrack(track.id); setDraggingClip(track.id); }}><span>{index === 0 ? "INTRO / TAKE 03" : index === 1 ? "SUB PULSE" : index === 2 ? "HOOK A" : index === 3 ? "HARMONY" : index === 4 ? "AIR BED" : "TEXTURE"}</span><Waveform color={track.color} seed={index + 2} active={isPlaying && selectedTrack === track.id} /></div>{index < 4 && <div className={`clip clip-${track.color} clip-secondary`} style={{ left: `${62 + index * 2}%`, width: `${20 + (index % 3) * 5}%` }} onPointerDown={(event) => { event.stopPropagation(); setSelectedTrack(track.id); setDraggingClip(track.id); }}><Waveform color={track.color} seed={index + 7} /></div>}</div></div>)}<div className="playhead" style={{ left: `${4 + (activeBar - 1) * 6.12}%` }}><span /></div></div><div className="timeline-footer"><span>01:00</span><span>02:00</span><span>03:00</span><span>04:00</span><span className="footer-hint">Drag clips to arrange · click a lane to inspect</span></div></section>

          <div className="lower-grid"><section className="mixer-panel panel"><div className="panel-header"><div><div className="section-kicker"><SlidersHorizontal size={13} /> Channel rack / software mixer</div><h2>Mix bus <span className="muted-slash">/</span> <span>{soloActive ? `${soloedIds.length} soloed` : "Stereo out"}</span></h2></div><button className="outline-button outline-small" onClick={() => setTracksState(tracks.map((track) => ({ ...track, muted: false, solo: false, armed: false })))}><Power size={13} /> Reset</button></div><div className="mixer-list">{tracksState.map((track) => <div key={track.id} className={`mixer-row ${track.muted ? "is-muted" : ""} ${selectedTrack === track.id ? "mixer-selected" : ""}`} onClick={() => setSelectedTrack(track.id)}><div className={`mixer-name name-${track.color}`}><span className="channel-number">{String(tracksState.indexOf(track) + 1).padStart(2, "0")}</span><div><strong>{track.name}</strong><span>{track.type.toUpperCase()}</span></div></div><div className="mini-meter"><Meter active={isPlaying && !track.muted} accent={track.color} level={meterLevels[track.id] ?? 0} /><EqDisplay bands={selectedTrack === track.id ? eqBands : eqBands.map((band) => band * 0.35)} accent={track.color} /></div><div className="mixer-level"><input aria-label={`${track.name} level`} type="range" min="0" max="100" value={track.level} onChange={(event) => updateTrack(track.id, { level: Number(event.target.value) })} className={`range-${track.color}`} /><span>{track.level}</span></div><div className="mixer-actions"><button className={`mix-button ${track.muted ? "is-on" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }}>M</button><button className={`mix-button ${track.solo ? "is-solo" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }}>S</button><button aria-label={`Toggle software cue for ${track.name}; live recording is not provided`} title="Software cue only — no live recording" className={`mix-button ${track.armed ? "is-armed" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { armed: !track.armed }); }}><Headphones size={12} /></button></div></div>)}</div></section>

            <aside className="inspector panel"><div className="panel-header"><div><div className="section-kicker"><Gauge size={13} /> Inspector / selected track</div><h2>{selected.name}</h2></div><button className="icon-button"><ChevronDown size={14} /></button></div><div className="inspector-hero"><div className={`inspector-badge badge-${selected.color}`}><AudioWaveform size={22} /></div><div><div className="inspector-type">{selected.type.toUpperCase()} CHANNEL</div><div className="inspector-preset">{selected.preset}</div></div></div><div className="parameter"><div><span>Volume</span><strong>{selected.level}%</strong></div><input aria-label="Selected track volume" type="range" min="0" max="100" value={selected.level} onChange={(event) => updateTrack(selected.id, { level: Number(event.target.value) })} className={`range-${selected.color}`} /></div><div className="parameter"><div><span>Pan</span><strong>{selected.pan > 0 ? `R ${selected.pan}` : selected.pan < 0 ? `L ${Math.abs(selected.pan)}` : "CENTER"}</strong></div><input aria-label="Selected track pan" type="range" min="-50" max="50" value={selected.pan} onChange={(event) => updateTrack(selected.id, { pan: Number(event.target.value) })} className={`range-${selected.color}`} /></div><div className="plugin-stack"><div className="plugin-slot"><span>01</span><div><strong>JIG / TRANSIENT</strong><small>Active · 4.2 ms</small></div><ChevronDown size={13} /></div><div className="plugin-slot"><span>02</span><div><strong>PARKWAY SATURATOR</strong><small>Drive 18% · Air +3 dB</small></div><ChevronDown size={13} /></div><button className="add-plugin" onClick={() => toast("Plugin browser opened")}><Plus size={13} /> Add insert</button></div><div className="inspector-footer"><div><span>Peak</span><strong>-3.2 dB</strong></div><div><span>Headroom</span><strong>6.8 dB</strong></div></div></aside></div>
          {activeView === "Studio" && <MediaPreviewPlayer options={previewOptions} value={previewAsset ? `asset:${previewAsset.id}` : `track:${currentTrackId}`} label={previewLabel} detail={previewAsset ? `${previewAsset.assetType.toUpperCase()} · ${formatDuration(previewAsset.durationMs)}` : activeTrack.tag} bars={previewBars} duration={duration} currentTime={currentTime} isPlaying={isPlaying} zoom={waveformZoom} normalized={peakNormalize} onSourceChange={selectPreviewSource} onTogglePlay={() => void togglePlay()} onScrub={scrubPreview} onNudge={nudgePreview} onZoom={setWaveformZoom} onNormalize={() => setPeakNormalize((value) => !value)} />}
          {activeView === "Generator" && <ManusMusicUploadPanel authenticated={isAuthenticated} pending={uploadingManusMusic || uploadManusMusic.isPending} uploadStage={manusUploadStage} assets={assetsQuery.data ?? []} onLogin={startLogin} onUpload={(file) => void handleManusMusicUpload(file)} onPlay={playManusMusicAsset} />}
          {activeView === "Assets" && <AssetFocusPanel assets={assetsQuery.data ?? []} authenticated={isAuthenticated} onOpenStudio={() => setActiveView("Studio")} />}
          {activeView === "History" && <AudioSourceHistoryPanel items={sourceHistoryQuery.data ?? []} authenticated={isAuthenticated} pendingId={historyPendingId} onLogin={startLogin} onRestore={(assetId) => void restoreSourceVersion(assetId)} onDelete={(assetId) => void deleteSourceVersion(assetId)} />}
          {activeView === "Radio" && <RadioStationPanel stations={parkwayRadioStations} selectedStationId={radioStationId} selectedProgrammeId={radioProgrammeId} savedStationIds={(savedRadioQuery.data ?? []).map((item) => item.stationId)} authenticated={isAuthenticated} isPlaying={radioActive && isPlaying} volume={radioVolume} currentTime={currentTime} duration={duration} pending={saveRadioStation.isPending || removeRadioStation.isPending} onLogin={startLogin} onSelectStation={startRadioPractice} onSelectProgramme={selectRadioProgramme} onTogglePlay={toggleRadioPlayback} onPrevious={() => stepRadioProgramme(-1, radioActive && isPlaying)} onNext={() => stepRadioProgramme(1, radioActive && isPlaying)} onVolumeChange={changeRadioVolume} onSave={(stationId) => void saveRadioStation.mutateAsync({ stationId})} onRemove={(stationId) => void removeRadioStation.mutateAsync({ stationId })} />}
          {activeView === "Product" && <><ProductReadinessPanel onOpenPerformance={() => setActiveView("Performance")} onOpenMixer={() => setActiveView("Mixer")} onOpenStudio={() => setActiveView("Studio")} onTestPlayback={() => void togglePlay()} /><AIProjectFallbackPanel enabled={autoFallbackEnabled} status={fallbackStatus} selection={fallbackSelection} authenticated={isAuthenticated} pending={activateFallback.isPending} onToggle={() => setAutoFallbackEnabled((value) => !value)} onCreate={() => void requestProjectFallback("media-error")} /></>}
          {activeView === "Devices" && <DevicesSoundAccessPanel registrations={hardwareQuery.data ?? []} authenticated={isAuthenticated} draft={hardwareDraft} setDraft={setHardwareDraft} consentAcknowledged={soundAccessConsent} setConsentAcknowledged={setSoundAccessConsent} pending={registerHardware.isPending || activateHardware.isPending || revokeHardware.isPending} onLogin={startLogin} onRegister={submitHardwareRegistration} onActivate={activateHardwareSoundAccess} onRevoke={(registrationId) => void revokeHardware.mutateAsync({ registrationId })} />}
          {activeView === "Develop" && <HardwareDevelopmentPanel onOpenStudio={() => setActiveView("Studio")} onRoutePracticeAudio={() => void togglePlay()} onPracticePad={() => playPad(0)} />}
          {activeView === "Feedback" && <CompatibilityFeedbackPanel pending={submitCompatibilityFeedback.isPending} onSubmit={async (draft) => { await submitCompatibilityFeedback.mutateAsync(draft); }} />}
          {activeView === "Review" && user?.role === "admin" && <CompatibilityReviewPanel reports={compatibilityReviewQuery.data ?? []} reviewers={compatibilityReviewersQuery.data ?? []} events={compatibilityHistoryQuery.data ?? []} selectedId={selectedFeedbackId} pending={assignCompatibilityReview.isPending || decideCompatibilityReview.isPending} onSelect={setSelectedFeedbackId} onAssign={(feedbackId, reviewerUserId) => void assignCompatibilityReview.mutateAsync({ feedbackId, reviewerUserId })} onDecide={(feedbackId, event) => void decideCompatibilityReview.mutateAsync({ feedbackId, event })} />}
          {activeView === "Contact" && <ContactPanel draft={contactDraft} setDraft={setContactDraft} pending={contactSubmit.isPending} onSubmit={() => void submitContactEnquiry()} />}
        </div></section>
    </main>
  );
}

function MoreIcon() { return <span className="more-icon"><i /><i /><i /></span>; }
