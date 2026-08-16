import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AudioWaveform,
  ChevronDown,
  CircleStop,
  Disc3,
  FolderOpen,
  Gauge,
  Grid3X3,
  Headphones,
  Layers3,
  Menu,
  Mic2,
  Pause,
  Play,
  Plus,
  Power,
  Radio,
  RotateCcw,
  Save,
  Search,
  Settings2,
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
  { id: "geo-render", label: "GEO Controller Render", src: "/manus-storage/geo_midi_controller_deck_audio_pcm_c625e838.wav", tag: "D MAJOR / 156 BPM" },
  { id: "muchie-casket", label: "Muchie Pop Casket", src: "/manus-storage/geo-midi-controller-app_muchie_pop_casket_4e927e6a.wav", tag: "F MINOR / 128 BPM" },
  { id: "autonomous-project", label: "Autonomous Manus AI Audio", src: "/manus-storage/parkway-autonomous-audio_b0d36279.wav", tag: "D MAJOR / 156 BPM" },
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

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const previewGainRef = useRef<GainNode | null>(null);
  const previewPanRef = useRef<StereoPannerNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const analysisFrameRef = useRef<number | null>(null);
  const trackNodesRef = useRef<Record<string, { gain: GainNode; pan: StereoPannerNode }>>({});
  const [currentTrackId, setCurrentTrackId] = useState<(typeof AUDIO_TRACKS)[number]["id"]>("geo-render");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempo, setTempo] = useState(156);
  const [master, setMaster] = useState(82);
  const [activeBar, setActiveBar] = useState(8);
  const [selectedTrack, setSelectedTrack] = useState("pluck");
  const [activeView, setActiveView] = useState("Arrangement");
  const [showBrowser, setShowBrowser] = useState(true);
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
  const [generateOnTrackedVisit, setGenerateOnTrackedVisit] = useState(() => window.localStorage.getItem("parkway-generate-on-tracked-visit") === "true");
  const activeTrack = AUDIO_TRACKS.find((track) => track.id === currentTrackId) ?? AUDIO_TRACKS[0];
  const selected = tracksState.find((track) => track.id === selectedTrack) ?? tracksState[0];
  const activeCount = tracksState.filter((track) => !track.muted).length;
  const soloActive = tracksState.some((track) => track.solo);

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
    if (generateOnTrackedVisit) toast("Tracked visit detected · autonomous audio source is ready");
  }, []);

  useEffect(() => {
    if (generateOnTrackedVisit && trackedVisits > 0) toast("Autonomous audio generation is armed for tracked visits");
  }, [generateOnTrackedVisit, trackedVisits]);

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
      const masterGain = context.createGain();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.78;
      masterGain.gain.value = master / 100;
      analyser.connect(masterGain).connect(context.destination);
      sourceNodeRef.current = source;
      analyserRef.current = analyser;
      masterGainRef.current = masterGain;
      audioContextRef.current = context;
      tracksState.forEach((track) => {
        const gain = context.createGain();
        const pan = context.createStereoPanner();
        gain.gain.value = track.level / 100;
        pan.pan.value = track.pan / 50;
        gain.connect(pan);
        pan.connect(analyser);
        trackNodesRef.current[track.id] = { gain, pan };
      });
      const activeNode = trackNodesRef.current[selectedTrack];
      if (activeNode) source.connect(activeNode.gain);
    }
    if (audioContextRef.current.state === "suspended") void audioContextRef.current.resume();
    return audioContextRef.current;
  };

  useEffect(() => {
    const node = trackNodesRef.current[selectedTrack];
    const source = sourceNodeRef.current;
    if (!node || !source) return;
    try { source.disconnect(); } catch {}
    source.connect(node.gain);
  }, [selectedTrack]);

  useEffect(() => {
    const node = trackNodesRef.current[selectedTrack];
    const source = sourceNodeRef.current;
    if (!node || !source) return;
    try { source.disconnect(); } catch {}
    source.connect(node.gain);
  }, [currentTrackId]);

  useEffect(() => {
    const masterGain = masterGainRef.current;
    if (masterGain) masterGain.gain.value = master / 100;
  }, [master]);

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
  }, [currentTrackId]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); return; }
    try {
      const context = ensureAudioGraph();
      if (context?.state === "suspended") await context.resume();
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (error) {
      console.error(error);
      toast.error("Audio preview could not start. Check the selected source and browser output.");
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0); setIsPlaying(false); setActiveBar(1);
  };

  const updateTrack = (id: string, update: Partial<TrackState>) => {
    setTracksState((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
    const node = trackNodesRef.current[id];
    if (node && typeof update.level === "number") node.gain.gain.value = update.level / 100;
    if (node && typeof update.pan === "number") node.pan.pan.value = update.pan / 50;
  };
  const setTrackedVisitPreference = (value: boolean) => { setGenerateOnTrackedVisit(value); window.localStorage.setItem("parkway-generate-on-tracked-visit", String(value)); toast(value ? "Autonomous audio generation armed for tracked visits" : "Tracked-visit generation paused"); };
  const playPad = (index: number) => {
    setPressedPads((items) => Array.from(new Set([...items, index])));
    window.setTimeout(() => setPressedPads((items) => items.filter((item) => item !== index)), 140);
    const context = ensureAudioGraph();
    if (context) { const oscillator = context.createOscillator(); const gain = context.createGain(); oscillator.frequency.value = 110 * Math.pow(2, index / 12); oscillator.type = index % 3 === 0 ? "sine" : "triangle"; gain.gain.setValueAtTime(.0001, context.currentTime); gain.gain.exponentialRampToValueAtTime(.14, context.currentTime + .01); gain.gain.exponentialRampToValueAtTime(.0001, context.currentTime + .18); oscillator.connect(gain).connect(masterGainRef.current ?? context.destination); oscillator.start(); oscillator.stop(context.currentTime + .2); }
  };
  const positionFromClientX = (clientX: number) => { const rect = timelineRef.current?.getBoundingClientRect(); if (!rect) return 0; return Math.max(0, Math.min(GRID_BEATS, ((clientX - rect.left) / rect.width) * GRID_BEATS)); };
  const handleTimelinePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (draggingHandle) { const value = Math.round(positionFromClientX(event.clientX)); setLoopRegion((region) => draggingHandle === "start" ? { start: Math.min(value, region.end - 1), end: region.end } : { start: region.start, end: Math.max(value, region.start + 1) }); }
    if (draggingClip) { const value = Math.round(positionFromClientX(event.clientX)); updateTrack(draggingClip, { clipStart: Math.max(0, Math.min(100 - tracksState.find((track) => track.id === draggingClip)!.clipLength, value * (100 / GRID_BEATS))) }); }
  };
  const soloedIds = useMemo(() => tracksState.filter((track) => track.solo).map((track) => track.id), [tracksState]);

  return (
    <main className="parkway-app">
      <audio ref={audioRef} src={activeTrack.src} preload="metadata" loop={isLooping} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => { setIsPlaying(false); setMeterLevels(Object.fromEntries(tracks.map((track) => [track.id, 0]))); }} onError={() => toast.error(`Audio source failed to load: ${activeTrack.label}`)} />
      <div className="parkway-grid" />
      <aside className={`sidebar ${showBrowser ? "sidebar-open" : "sidebar-collapsed"}`}>
        <div className="brand-lockup"><div className="brand-mark"><AudioWaveform size={19} /></div>{showBrowser && <div><div className="brand-name">PARKWAY</div><div className="brand-sub">JIG CODE / DAW</div></div>}</div>
        {showBrowser && <>
          <div className="side-label">Workspace</div>
          <nav className="side-nav">
            {[{ label: "Arrangement", icon: Layers3 }, { label: "Mixer", icon: SlidersHorizontal }, { label: "Piano Roll", icon: Grid3X3 }, { label: "Performance", icon: Zap }].map(({ label, icon: Icon }) => <button key={label} className={`side-link ${activeView === label ? "is-active" : ""}`} onClick={() => setActiveView(label)}><Icon size={15} /><span>{label}</span>{label === "Performance" && <span className="live-dot" />}</button>)}
          </nav>
          <div className="side-label">Project</div>
          <div className="project-card"><div className="project-orbit"><Disc3 size={18} /></div><div className="min-w-0"><div className="project-title">Night Drive / 07</div><div className="project-meta">D major · 156 BPM</div></div><ChevronDown size={14} className="text-muted" /></div>
          <div className="side-label side-label-row"><span>Library</span><button onClick={() => toast("Browser refresh queued")}>+</button></div>
          <div className="library-list"><button onClick={() => toast("Drum kits loaded")}><FolderOpen size={14} /> Drum kits <span>24</span></button><button onClick={() => toast("Synth presets loaded")}><Sparkles size={14} /> Synth presets <span>81</span></button><button onClick={() => toast("Field recordings loaded")}><Waves size={14} /> Field recordings <span>12</span></button></div>
          <div className="sidebar-footer"><div className="status-line"><span className="status-light" /> Engine nominal</div><div className="status-detail">44.1 kHz · 24 bit<br />CPU 12% · RAM 2.4 GB<br />Tracked visits: {trackedVisits}</div><button className={`tracked-toggle ${generateOnTrackedVisit ? "is-on" : ""}`} onClick={() => setTrackedVisitPreference(!generateOnTrackedVisit)}><span className="toggle-dot" /> Auto-generate on tracked visit</button></div>
        </>}
        <button className="sidebar-toggle" aria-label="Toggle browser" onClick={() => setShowBrowser((value) => !value)}><Menu size={15} /></button>
      </aside>

      <section className="workspace">
        <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setShowBrowser((value) => !value)}><Menu size={16} /></button><div className="breadcrumb"><span>SESSIONS</span><span className="crumb-separator">/</span><strong>Night Drive</strong><span className="saved-state"><span /> Autosaved</span></div></div><div className="top-actions"><button className="icon-button" onClick={() => toast("Search is ready for instruments, clips, and commands")}><Search size={15} /></button><button className="icon-button" onClick={() => toast("Settings panel coming soon")}><Settings2 size={15} /></button><button className="user-chip" onClick={() => toast("PARKWAY operator profile")}>JM</button></div></header>

        <div className="transport"><div className="transport-group transport-main"><button className="transport-button" onClick={stop}><Square size={13} fill="currentColor" /></button><button className={`transport-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay}>{isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><button className={`transport-button ${isLooping ? "is-on" : ""}`} onClick={() => setIsLooping((value) => !value)}><RotateCcw size={14} /></button><div className="transport-divider" /><div className="tempo-control"><span className="transport-caption">TEMPO</span><input aria-label="Tempo" type="number" value={tempo} min={40} max={240} onChange={(event) => setTempo(Number(event.target.value))} /><span className="unit">BPM</span></div><div className="transport-divider" /><div className="timecode"><span className="timecode-main">{formatTime(currentTime)}</span><span className="timecode-sub">/ {formatTime(duration)}</span></div></div><div className="transport-center"><div className="bar-display"><span className="transport-caption">BAR</span><strong>{String(activeBar).padStart(2, "0")}</strong><span className="bar-total">/ 16</span></div><div className="transport-status"><span className="status-light" /> {isPlaying ? "PLAYING" : "READY"}</div></div><div className="transport-group transport-end"><div className="track-select"><AudioWaveform size={14} /><select aria-label="Audio preview" value={currentTrackId} onChange={(event) => { setCurrentTrackId(event.target.value as (typeof AUDIO_TRACKS)[number]["id"]); stop(); }}><option value="geo-render">GEO Controller Render</option><option value="muchie-casket">Muchie Pop Casket</option><option value="autonomous-project">Autonomous Manus AI Audio</option></select></div><button className="transport-button" onClick={() => toast("Metronome enabled for the next take")}><Activity size={14} /></button><button className="transport-button" onClick={() => toast("Project saved locally")}><Save size={14} /></button></div></div>

        <div className="content-scroll"><div className="workspace-heading"><div><div className="section-kicker"><Radio size={13} /> {activeView} / MASTER SESSION</div><h1>Master bus.<br /><em>Ready to move.</em></h1><p className="heading-copy">Transport, timing, and signal routing in one tactile performance surface.</p><div className="master-readout"><div className="readout-scope"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="readout-meta"><span>MASTER / STEREO</span><strong>{master}%</strong><small>-3.2 dB peak · 6.8 dB headroom</small></div><div className="readout-state"><span className="status-light" /> READY</div></div></div><div className="heading-tools"><button className="outline-button" onClick={() => toast("New track added to the session")}><Plus size={14} /> Add track</button><button className="solid-button" onClick={() => toast("Render queue started")}><Zap size={14} /> Render</button></div></div>

          {activeView === "Performance" && <section className="performance-panel panel"><div className="panel-header"><div><div className="section-kicker"><Zap size={13} /> Performance / hardware pads</div><h2>Jig pad bank <span className="muted-slash">/</span> <span>{midiStatus}</span></h2></div><div className="panel-header-actions"><span className="small-pill"><span className="status-light" /> {midiInputs.length ? midiInputs[0] : "Browser MIDI"}</span></div></div><div className="performance-body"><div className="pad-grid">{PERFORMANCE_PADS.map((pad, index) => <button key={pad} className={`performance-pad pad-${index % 6} ${pressedPads.includes(index) ? "is-pressed" : ""}`} onPointerDown={() => playPad(index)} onClick={() => setMidiMap((mapping) => ({ ...mapping, [36 + index]: index }))}><span>{String(index + 1).padStart(2, "0")}</span><strong>{pad}</strong><small>{midiMap[36 + index] === index ? "MAPPED" : `NOTE ${36 + index}`}</small></button>)}</div><div className="performance-side"><div className="performance-readout"><span className="transport-caption">MIDI ROUTING</span><strong>{midiInputs.length ? "LIVE INPUT" : "CLICK TO PLAY"}</strong><small>Click a pad to map note {36 + (pressedPads[0] ?? 0)}. External MIDI notes light the same pad.</small></div><button className="outline-button" onClick={() => toast(midiInputs.length ? `${midiInputs.length} MIDI input${midiInputs.length > 1 ? "s" : ""} listening` : "Connect a MIDI controller to enable hardware input")}><Headphones size={14} /> Check hardware</button></div></div></section>}

          <section className="arrangement-panel panel"><div className="panel-header"><div><div className="section-kicker"><AudioWaveform size={13} /> Arrangement / 16 bars</div><h2>Night Drive <span className="muted-slash">/</span> <span>Master comp</span></h2></div><div className="panel-header-actions"><span className="small-pill"><span className="status-light" /> {activeCount} active</span><button className="icon-button"><MoreIcon /></button></div></div><div className="timeline-ruler"><span />{Array.from({ length: 16 }).map((_, i) => <div key={i} className={i + 1 === activeBar ? "ruler-active" : ""}>{String(i + 1).padStart(2, "0")}</div>)}</div><div className="loop-editor"><span>LOOP</span><div className="loop-track"><div className="loop-fill" style={{ left: `${(loopRegion.start / GRID_BEATS) * 100}%`, width: `${((loopRegion.end - loopRegion.start) / GRID_BEATS) * 100}%` }} /><button className="loop-handle loop-handle-start" style={{ left: `${(loopRegion.start / GRID_BEATS) * 100}%` }} aria-label="Move loop start" onPointerDown={(event) => { event.stopPropagation(); setDraggingHandle("start"); }} /><button className="loop-handle loop-handle-end" style={{ left: `${(loopRegion.end / GRID_BEATS) * 100}%` }} aria-label="Move loop end" onPointerDown={(event) => { event.stopPropagation(); setDraggingHandle("end"); }} /></div><strong>{String(loopRegion.start).padStart(2, "0")} — {String(loopRegion.end).padStart(2, "0")} bars</strong></div><div ref={timelineRef} className="timeline-grid" onPointerMove={handleTimelinePointerMove} onPointerUp={() => { setDraggingHandle(null); setDraggingClip(null); }} onPointerLeave={() => { setDraggingHandle(null); setDraggingClip(null); }}>{tracksState.map((track, index) => <div key={track.id} className={`timeline-row ${selectedTrack === track.id ? "row-selected" : ""}`} onClick={() => setSelectedTrack(track.id)}><div className={`track-label label-${track.color}`}><div className="track-icon">{track.type === "midi" ? <Grid3X3 size={13} /> : <AudioWaveform size={13} />}</div><div className="track-copy"><strong>{track.name}</strong><span>{track.type.toUpperCase()} · {track.preset}</span></div></div><div className="clip-lane"><div className={`clip clip-${track.color}`} style={{ left: `${track.clipStart}%`, width: `${track.clipLength}%` }} onPointerDown={(event) => { event.stopPropagation(); setSelectedTrack(track.id); setDraggingClip(track.id); }}><span>{index === 0 ? "INTRO / TAKE 03" : index === 1 ? "SUB PULSE" : index === 2 ? "HOOK A" : index === 3 ? "HARMONY" : index === 4 ? "AIR BED" : "TEXTURE"}</span><Waveform color={track.color} seed={index + 2} active={isPlaying && selectedTrack === track.id} /></div>{index < 4 && <div className={`clip clip-${track.color} clip-secondary`} style={{ left: `${62 + index * 2}%`, width: `${20 + (index % 3) * 5}%` }} onPointerDown={(event) => { event.stopPropagation(); setSelectedTrack(track.id); setDraggingClip(track.id); }}><Waveform color={track.color} seed={index + 7} /></div>}</div></div>)}<div className="playhead" style={{ left: `${4 + (activeBar - 1) * 6.12}%` }}><span /></div></div><div className="timeline-footer"><span>01:00</span><span>02:00</span><span>03:00</span><span>04:00</span><span className="footer-hint">Drag clips to arrange · click a lane to inspect</span></div></section>

          <div className="lower-grid"><section className="mixer-panel panel"><div className="panel-header"><div><div className="section-kicker"><SlidersHorizontal size={13} /> Channel rack</div><h2>Mix bus <span className="muted-slash">/</span> <span>{soloActive ? `${soloedIds.length} soloed` : "Stereo out"}</span></h2></div><button className="outline-button outline-small" onClick={() => setTracksState(tracks.map((track) => ({ ...track, muted: false, solo: false, armed: false })))}><Power size={13} /> Reset</button></div><div className="mixer-list">{tracksState.map((track) => <div key={track.id} className={`mixer-row ${track.muted ? "is-muted" : ""} ${selectedTrack === track.id ? "mixer-selected" : ""}`} onClick={() => setSelectedTrack(track.id)}><div className={`mixer-name name-${track.color}`}><span className="channel-number">{String(tracksState.indexOf(track) + 1).padStart(2, "0")}</span><div><strong>{track.name}</strong><span>{track.type.toUpperCase()}</span></div></div><div className="mini-meter"><Meter active={isPlaying && !track.muted} accent={track.color} level={meterLevels[track.id] ?? 0} /><EqDisplay bands={selectedTrack === track.id ? eqBands : eqBands.map((band) => band * 0.35)} accent={track.color} /></div><div className="mixer-level"><input aria-label={`${track.name} level`} type="range" min="0" max="100" value={track.level} onChange={(event) => updateTrack(track.id, { level: Number(event.target.value) })} className={`range-${track.color}`} /><span>{track.level}</span></div><div className="mixer-actions"><button className={`mix-button ${track.muted ? "is-on" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }}>M</button><button className={`mix-button ${track.solo ? "is-solo" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }}>S</button><button className={`mix-button ${track.armed ? "is-armed" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { armed: !track.armed }); }}><Mic2 size={12} /></button></div></div>)}</div></section>

            <aside className="inspector panel"><div className="panel-header"><div><div className="section-kicker"><Gauge size={13} /> Inspector / selected track</div><h2>{selected.name}</h2></div><button className="icon-button"><ChevronDown size={14} /></button></div><div className="inspector-hero"><div className={`inspector-badge badge-${selected.color}`}><AudioWaveform size={22} /></div><div><div className="inspector-type">{selected.type.toUpperCase()} CHANNEL</div><div className="inspector-preset">{selected.preset}</div></div></div><div className="parameter"><div><span>Volume</span><strong>{selected.level}%</strong></div><input aria-label="Selected track volume" type="range" min="0" max="100" value={selected.level} onChange={(event) => updateTrack(selected.id, { level: Number(event.target.value) })} className={`range-${selected.color}`} /></div><div className="parameter"><div><span>Pan</span><strong>{selected.pan > 0 ? `R ${selected.pan}` : selected.pan < 0 ? `L ${Math.abs(selected.pan)}` : "CENTER"}</strong></div><input aria-label="Selected track pan" type="range" min="-50" max="50" value={selected.pan} onChange={(event) => updateTrack(selected.id, { pan: Number(event.target.value) })} className={`range-${selected.color}`} /></div><div className="plugin-stack"><div className="plugin-slot"><span>01</span><div><strong>JIG / TRANSIENT</strong><small>Active · 4.2 ms</small></div><ChevronDown size={13} /></div><div className="plugin-slot"><span>02</span><div><strong>PARKWAY SATURATOR</strong><small>Drive 18% · Air +3 dB</small></div><ChevronDown size={13} /></div><button className="add-plugin" onClick={() => toast("Plugin browser opened")}><Plus size={13} /> Add insert</button></div><div className="inspector-footer"><div><span>Peak</span><strong>-3.2 dB</strong></div><div><span>Headroom</span><strong>6.8 dB</strong></div></div></aside></div>
        </div></section>
    </main>
  );
}

function MoreIcon() { return <span className="more-icon"><i /><i /><i /></span>; }
