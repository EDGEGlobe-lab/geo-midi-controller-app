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
] as const;

type TrackBase = { id: string; name: string; type: "audio" | "midi"; color: string; preset: string; level: number; pan: number };

const tracks: TrackBase[] = [
  { id: "drums", name: "LIVE KIT", type: "audio", color: "orange", preset: "Transient / Tight", level: 82, pan: 0 },
  { id: "bass", name: "ROOT BASS", type: "midi", color: "amber", preset: "Sub / Root Pulse", level: 72, pan: -2 },
  { id: "pluck", name: "GRATE PLUCK", type: "midi", color: "cyan", preset: "D Major / 1·7·3·5", level: 78, pan: -6 },
  { id: "chords", name: "CHORD STABS", type: "midi", color: "pink", preset: "D · A · Bm · G", level: 64, pan: 8 },
  { id: "pad", name: "ORBITAL PAD", type: "midi", color: "violet", preset: "Triangle / Wide Air", level: 43, pan: -14 },
  { id: "fx", name: "VDN PULSES", type: "audio", color: "blue", preset: "Noise / Ping / FX", level: 37, pan: 22 },
] as const;

type TrackState = TrackBase & { muted: boolean; solo: boolean; armed: boolean };

const formatTime = (value: number) => {
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function Meter({ active, accent = "cyan" }: { active: boolean; accent?: string }) {
  return <div className={`meter meter-${accent}`}>{Array.from({ length: 18 }).map((_, index) => <span key={index} className={active ? "meter-pulse" : ""} style={{ height: `${24 + ((index * 19) % 68)}%` }} />)}</div>;
}

function Waveform({ color = "cyan", seed = 1, active = false }: { color?: string; seed?: number; active?: boolean }) {
  return <div className={`waveform waveform-${color} ${active ? "waveform-active" : ""}`}>{Array.from({ length: 64 }).map((_, index) => <span key={index} style={{ height: `${18 + ((index * 17 + seed * 13) % 76)}%` }} />)}</div>;
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
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
  const activeTrack = AUDIO_TRACKS.find((track) => track.id === currentTrackId) ?? AUDIO_TRACKS[0];
  const selected = tracksState.find((track) => track.id === selectedTrack) ?? tracksState[0];
  const activeCount = tracksState.filter((track) => !track.muted).length;
  const soloActive = tracksState.some((track) => track.solo);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setInterval(() => setActiveBar((bar) => (bar % 16) + 1), 1530);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) { audioRef.current.pause(); setIsPlaying(false); return; }
    try { await audioRef.current.play(); setIsPlaying(true); } catch { toast.error("Audio preview is unavailable in this browser session."); }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0); setIsPlaying(false); setActiveBar(1);
  };

  const updateTrack = (id: string, update: Partial<TrackState>) => setTracksState((items) => items.map((item) => item.id === id ? { ...item, ...update } : item));
  const soloedIds = useMemo(() => tracksState.filter((track) => track.solo).map((track) => track.id), [tracksState]);

  return (
    <main className="parkway-app">
      <audio ref={audioRef} src={activeTrack.src} preload="metadata" loop={isLooping} onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)} onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)} onEnded={() => setIsPlaying(false)} />
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
          <div className="sidebar-footer"><div className="status-line"><span className="status-light" /> Engine nominal</div><div className="status-detail">44.1 kHz · 24 bit<br />CPU 12% · RAM 2.4 GB</div></div>
        </>}
        <button className="sidebar-toggle" aria-label="Toggle browser" onClick={() => setShowBrowser((value) => !value)}><Menu size={15} /></button>
      </aside>

      <section className="workspace">
        <header className="topbar"><div className="topbar-left"><button className="mobile-menu" onClick={() => setShowBrowser((value) => !value)}><Menu size={16} /></button><div className="breadcrumb"><span>SESSIONS</span><span className="crumb-separator">/</span><strong>Night Drive</strong><span className="saved-state"><span /> Autosaved</span></div></div><div className="top-actions"><button className="icon-button" onClick={() => toast("Search is ready for instruments, clips, and commands")}><Search size={15} /></button><button className="icon-button" onClick={() => toast("Settings panel coming soon")}><Settings2 size={15} /></button><button className="user-chip" onClick={() => toast("PARKWAY operator profile")}>JM</button></div></header>

        <div className="transport"><div className="transport-group transport-main"><button className="transport-button" onClick={stop}><Square size={13} fill="currentColor" /></button><button className={`transport-play ${isPlaying ? "is-playing" : ""}`} onClick={togglePlay}>{isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</button><button className={`transport-button ${isLooping ? "is-on" : ""}`} onClick={() => setIsLooping((value) => !value)}><RotateCcw size={14} /></button><div className="transport-divider" /><div className="tempo-control"><span className="transport-caption">TEMPO</span><input aria-label="Tempo" type="number" value={tempo} min={40} max={240} onChange={(event) => setTempo(Number(event.target.value))} /><span className="unit">BPM</span></div><div className="transport-divider" /><div className="timecode"><span className="timecode-main">{formatTime(currentTime)}</span><span className="timecode-sub">/ {formatTime(duration)}</span></div></div><div className="transport-center"><div className="bar-display"><span className="transport-caption">BAR</span><strong>{String(activeBar).padStart(2, "0")}</strong><span className="bar-total">/ 16</span></div><div className="transport-status"><span className="status-light" /> {isPlaying ? "PLAYING" : "READY"}</div></div><div className="transport-group transport-end"><div className="track-select"><AudioWaveform size={14} /><select aria-label="Audio preview" value={currentTrackId} onChange={(event) => { setCurrentTrackId(event.target.value as (typeof AUDIO_TRACKS)[number]["id"]); stop(); }}><option value="geo-render">GEO Controller Render</option><option value="muchie-casket">Muchie Pop Casket</option></select></div><button className="transport-button" onClick={() => toast("Metronome enabled for the next take")}><Activity size={14} /></button><button className="transport-button" onClick={() => toast("Project saved locally")}><Save size={14} /></button></div></div>

        <div className="content-scroll"><div className="workspace-heading"><div><div className="section-kicker"><Radio size={13} /> {activeView} / MASTER SESSION</div><h1>Master bus.<br /><em>Ready to move.</em></h1><p className="heading-copy">Transport, timing, and signal routing in one tactile performance surface.</p><div className="master-readout"><div className="readout-scope"><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /><span /></div><div className="readout-meta"><span>MASTER / STEREO</span><strong>{master}%</strong><small>-3.2 dB peak · 6.8 dB headroom</small></div><div className="readout-state"><span className="status-light" /> READY</div></div></div><div className="heading-tools"><button className="outline-button" onClick={() => toast("New track added to the session")}><Plus size={14} /> Add track</button><button className="solid-button" onClick={() => toast("Render queue started")}><Zap size={14} /> Render</button></div></div>

          <section className="arrangement-panel panel"><div className="panel-header"><div><div className="section-kicker"><AudioWaveform size={13} /> Arrangement / 16 bars</div><h2>Night Drive <span className="muted-slash">/</span> <span>Master comp</span></h2></div><div className="panel-header-actions"><span className="small-pill"><span className="status-light" /> {activeCount} active</span><button className="icon-button"><MoreIcon /></button></div></div><div className="timeline-ruler"><span />{Array.from({ length: 16 }).map((_, i) => <div key={i} className={i + 1 === activeBar ? "ruler-active" : ""}>{String(i + 1).padStart(2, "0")}</div>)}</div><div className="timeline-grid">{tracksState.map((track, index) => <div key={track.id} className={`timeline-row ${selectedTrack === track.id ? "row-selected" : ""}`} onClick={() => setSelectedTrack(track.id)}><div className={`track-label label-${track.color}`}><div className="track-icon">{track.type === "midi" ? <Grid3X3 size={13} /> : <AudioWaveform size={13} />}</div><div className="track-copy"><strong>{track.name}</strong><span>{track.type.toUpperCase()} · {track.preset}</span></div></div><div className="clip-lane"><div className={`clip clip-${track.color}`} style={{ left: `${index * 1.8 + 2}%`, width: `${38 + ((index * 11) % 22)}%` }}><span>{index === 0 ? "INTRO / TAKE 03" : index === 1 ? "SUB PULSE" : index === 2 ? "HOOK A" : index === 3 ? "HARMONY" : index === 4 ? "AIR BED" : "TEXTURE"}</span><Waveform color={track.color} seed={index + 2} active={isPlaying && selectedTrack === track.id} /></div>{index < 4 && <div className={`clip clip-${track.color} clip-secondary`} style={{ left: `${62 + index * 2}%`, width: `${20 + (index % 3) * 5}%` }}><Waveform color={track.color} seed={index + 7} /></div>}</div></div>)}<div className="playhead" style={{ left: `${4 + (activeBar - 1) * 6.12}%` }}><span /></div></div><div className="timeline-footer"><span>01:00</span><span>02:00</span><span>03:00</span><span>04:00</span><span className="footer-hint">Drag clips to arrange · click a lane to inspect</span></div></section>

          <div className="lower-grid"><section className="mixer-panel panel"><div className="panel-header"><div><div className="section-kicker"><SlidersHorizontal size={13} /> Channel rack</div><h2>Mix bus <span className="muted-slash">/</span> <span>{soloActive ? `${soloedIds.length} soloed` : "Stereo out"}</span></h2></div><button className="outline-button outline-small" onClick={() => setTracksState(tracks.map((track) => ({ ...track, muted: false, solo: false, armed: false })))}><Power size={13} /> Reset</button></div><div className="mixer-list">{tracksState.map((track) => <div key={track.id} className={`mixer-row ${track.muted ? "is-muted" : ""} ${selectedTrack === track.id ? "mixer-selected" : ""}`} onClick={() => setSelectedTrack(track.id)}><div className={`mixer-name name-${track.color}`}><span className="channel-number">{String(tracksState.indexOf(track) + 1).padStart(2, "0")}</span><div><strong>{track.name}</strong><span>{track.type.toUpperCase()}</span></div></div><div className="mini-meter"><Meter active={isPlaying && !track.muted} accent={track.color} /></div><div className="mixer-level"><input aria-label={`${track.name} level`} type="range" min="0" max="100" value={track.level} onChange={() => {}} className={`range-${track.color}`} /><span>{track.level}</span></div><div className="mixer-actions"><button className={`mix-button ${track.muted ? "is-on" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { muted: !track.muted }); }}>M</button><button className={`mix-button ${track.solo ? "is-solo" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { solo: !track.solo }); }}>S</button><button className={`mix-button ${track.armed ? "is-armed" : ""}`} onClick={(event) => { event.stopPropagation(); updateTrack(track.id, { armed: !track.armed }); }}><Mic2 size={12} /></button></div></div>)}</div></section>

            <aside className="inspector panel"><div className="panel-header"><div><div className="section-kicker"><Gauge size={13} /> Inspector / selected track</div><h2>{selected.name}</h2></div><button className="icon-button"><ChevronDown size={14} /></button></div><div className="inspector-hero"><div className={`inspector-badge badge-${selected.color}`}><AudioWaveform size={22} /></div><div><div className="inspector-type">{selected.type.toUpperCase()} CHANNEL</div><div className="inspector-preset">{selected.preset}</div></div></div><div className="parameter"><div><span>Volume</span><strong>{selected.level}%</strong></div><input aria-label="Selected track volume" type="range" min="0" max="100" value={selected.level} onChange={(event) => updateTrack(selected.id, { level: Number(event.target.value) })} className={`range-${selected.color}`} /></div><div className="parameter"><div><span>Pan</span><strong>{selected.pan > 0 ? `R ${selected.pan}` : selected.pan < 0 ? `L ${Math.abs(selected.pan)}` : "CENTER"}</strong></div><input aria-label="Selected track pan" type="range" min="-50" max="50" value={selected.pan} onChange={(event) => updateTrack(selected.id, { pan: Number(event.target.value) })} className={`range-${selected.color}`} /></div><div className="plugin-stack"><div className="plugin-slot"><span>01</span><div><strong>JIG / TRANSIENT</strong><small>Active · 4.2 ms</small></div><ChevronDown size={13} /></div><div className="plugin-slot"><span>02</span><div><strong>PARKWAY SATURATOR</strong><small>Drive 18% · Air +3 dB</small></div><ChevronDown size={13} /></div><button className="add-plugin" onClick={() => toast("Plugin browser opened")}><Plus size={13} /> Add insert</button></div><div className="inspector-footer"><div><span>Peak</span><strong>-3.2 dB</strong></div><div><span>Headroom</span><strong>6.8 dB</strong></div></div></aside></div>
        </div></section>
    </main>
  );
}

function MoreIcon() { return <span className="more-icon"><i /><i /><i /></span>; }
