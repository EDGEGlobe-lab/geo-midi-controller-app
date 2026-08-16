/*
 * Signal Laboratory direction: graphite control-room surfaces, Signal Cyan transport,
 * amber timing, magenta harmonic energy, acid-green stable output, Space Grotesk + IBM Plex Mono.
 */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  AudioLines,
  ChevronDown,
  CircleStop,
  Disc3,
  Gauge,
  Headphones,
  Layers3,
  Menu,
  Pause,
  Play,
  Radio,
  RotateCcw,
  Settings2,
  SlidersHorizontal,
  Save,
  Trash2,
  Volume2,
  VolumeX,
  Waves,
  Zap,
} from "lucide-react";

const AUDIO_TRACKS = [
  { id: "geo-render", label: "GEO Controller Render", src: "/manus-storage/geo_midi_controller_deck_audio_pcm_c625e838.wav", tag: "D MAJOR / 156 BPM" },
  { id: "muchie-casket", label: "Muchie Pop Casket", src: "/manus-storage/geo-midi-controller-app_muchie_pop_casket_4e927e6a.wav", tag: "F MINOR / 128 BPM" },
] as const;
const SIGNAL_FIELD = "/manus-storage/geo-signal-field_d3744adf.jpg";
const STUDIO_RACK = "/manus-storage/geo-studio-rack_582309a0.jpg";
const SIGNAL_MARK = "/manus-storage/geo-signal-mark_cc27ee50.png";

const channelBlueprint = [
  { id: "pluck", name: "GRATE PLUCK", code: "CH 01", patch: "D MAJOR / 1·7·3·5", color: "cyan", level: 78, pan: -6, send: 24 },
  { id: "chords", name: "CHORD STABS", code: "CH 02", patch: "D · A · Bm · G", color: "pink", level: 64, pan: 8, send: 18 },
  { id: "bass", name: "ROOT BASS", code: "CH 03", patch: "SUB / ROOT PULSE", color: "amber", level: 72, pan: 0, send: 8 },
  { id: "pad", name: "ORBITAL PAD", code: "CH 04", patch: "TRIANGLE / WIDE AIR", color: "violet", level: 43, pan: -14, send: 38 },
  { id: "drums", name: "LIVE KIT", code: "CH 10", patch: "KICK · SNARE · HAT", color: "orange", level: 82, pan: 0, send: 16 },
  { id: "fx", name: "VDN PULSES", code: "CH 05", patch: "NOISE / PING / FX", color: "blue", level: 37, pan: 22, send: 52 },
  { id: "cross", name: "NOVICE CROSS", code: "CH 06", patch: "E · G · C · E ×20", color: "lime", level: 35, pan: -22, send: 28 },
];

type Channel = (typeof channelBlueprint)[number] & { muted: boolean; solo: boolean };
type MixerPreset = { id: string; name: string; createdAt: string; master: number; tempo: number; channels: Channel[] };

const formatTime = (value: number) => {
  if (!Number.isFinite(value)) return "00:00";
  const minutes = Math.floor(value / 60).toString().padStart(2, "0");
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
};

function Meter({ color, active, seed }: { color: string; active: boolean; seed: number }) {
  return (
    <div className="flex h-24 items-end gap-1 rounded-md border border-white/8 bg-black/20 px-2 py-2">
      {Array.from({ length: 12 }).map((_, index) => {
        const height = 18 + ((index * 17 + seed * 13) % 70);
        const opacity = active ? 0.5 + ((index + seed) % 3) * 0.18 : 0.2;
        return (
          <span
            key={index}
            className={`meter-bar ${active ? "meter-live" : ""}`}
            style={{ height: `${height}%`, opacity, background: `var(--signal-${color})` }}
          />
        );
      })}
    </div>
  );
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [channels, setChannels] = useState<Channel[]>(() => channelBlueprint.map((channel) => ({ ...channel, muted: false, solo: false })));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLooping, setIsLooping] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [master, setMaster] = useState(82);
  const [tempo, setTempo] = useState(156);
  const [activeBar, setActiveBar] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<(typeof AUDIO_TRACKS)[number]["id"]>("geo-render");
  const [presetName, setPresetName] = useState("Night Drive");
  const [presets, setPresets] = useState<MixerPreset[]>(() => {
    try {
      const saved = window.localStorage.getItem("geo-signal-mixer-presets");
      return saved ? (JSON.parse(saved) as MixerPreset[]) : [];
    } catch {
      return [];
    }
  });
  const [activePresetId, setActivePresetId] = useState<string | null>(null);

  const soloActive = channels.some((channel) => channel.solo);
  const activeChannels = useMemo(
    () => channels.filter((channel) => !channel.muted && (!soloActive || channel.solo)),
    [channels, soloActive],
  );

  useEffect(() => {
    if (!isPlaying) return;
    const tick = window.setInterval(() => setActiveBar((bar) => (bar % 16) + 1), 1530);
    return () => window.clearInterval(tick);
  }, [isPlaying]);

  const togglePlay = async () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const stop = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    setActiveBar(1);
  };

  const updateChannel = (id: string, update: Partial<Channel>) => {
    setChannels((items) => items.map((item) => (item.id === id ? { ...item, ...update } : item)));
  };

  const masterAccent = isPlaying ? "LIVE" : "READY";
  const activeTrack = AUDIO_TRACKS.find((track) => track.id === currentTrackId) ?? AUDIO_TRACKS[0];

  const selectTrack = (trackId: (typeof AUDIO_TRACKS)[number]["id"]) => {
    const track = AUDIO_TRACKS.find((item) => item.id === trackId);
    if (!track || !audioRef.current) return;
    audioRef.current.pause();
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    setCurrentTrackId(track.id);
  };

  const persistPresets = (next: MixerPreset[]) => {
    setPresets(next);
    window.localStorage.setItem("geo-signal-mixer-presets", JSON.stringify(next));
  };

  const savePreset = () => {
    const cleanName = presetName.trim() || `Snapshot ${presets.length + 1}`;
    const id = activePresetId ?? `${Date.now()}`;
    const nextPreset: MixerPreset = { id, name: cleanName, createdAt: new Date().toISOString(), master, tempo, channels };
    const next = activePresetId ? presets.map((preset) => (preset.id === id ? nextPreset : preset)) : [...presets, nextPreset];
    persistPresets(next);
    setActivePresetId(id);
    setPresetName(cleanName);
  };

  const loadPreset = (preset: MixerPreset) => {
    setChannels(preset.channels.map((channel) => ({ ...channel })));
    setMaster(preset.master);
    setTempo(preset.tempo);
    setActivePresetId(preset.id);
    setPresetName(preset.name);
  };

  const deletePreset = (id: string) => {
    persistPresets(presets.filter((preset) => preset.id !== id));
    if (activePresetId === id) setActivePresetId(null);
  };

  const resetMixer = () => {
    setChannels(channelBlueprint.map((channel) => ({ ...channel, muted: false, solo: false })));
    setMaster(82);
    setTempo(156);
    setActivePresetId(null);
    setPresetName("Night Drive");
  };

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#090d12] text-[#edf7ff]">
      <audio
        ref={audioRef}
        src={activeTrack.src}
        preload="metadata"
        loop={isLooping}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onEnded={() => setIsPlaying(false)}
      />

      <div className="pointer-events-none fixed inset-0 opacity-35" style={{ backgroundImage: `url(${SIGNAL_FIELD})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_75%_0%,rgba(55,227,255,0.11),transparent_32%),linear-gradient(180deg,rgba(7,11,17,0.52),#090d12_80%)]" />

      <div className="relative mx-auto max-w-[1480px] px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-5 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative grid size-12 place-items-center overflow-hidden rounded-2xl border border-cyan-300/30 bg-cyan-300/8 shadow-[0_0_35px_rgba(85,230,255,0.14)]">
              <img src={SIGNAL_MARK} alt="GEO signal mark" className="size-9 object-contain" />
            </div>
            <div>
              <div className="font-display text-xs font-bold uppercase tracking-[0.28em] text-[#55e6ff]">GEO / Signal Laboratory</div>
              <div className="mt-1 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400"><span className="inline-block size-1.5 rounded-full bg-[#a7f36b] shadow-[0_0_10px_#a7f36b]" />Browser-native control room · stereo output</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-slate-400">
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">Session 07</span>
            <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2">44.1kHz / 24-bit</span>
            <button onClick={() => setShowSettings((value) => !value)} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 transition hover:border-cyan-300/45 hover:text-white"><Settings2 className="size-3.5" /> Rig settings</button>
          </div>
        </header>

        {showSettings && (
          <section className="mt-4 grid gap-3 rounded-2xl border border-cyan-300/20 bg-cyan-300/[0.04] p-4 text-xs text-slate-300 sm:grid-cols-3">
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Audio source</span><p className="mt-1">PCM render / local storage</p></div>
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">Output bus</span><p className="mt-1">Master stereo / safe monitor</p></div>
            <div><span className="font-mono text-[10px] uppercase tracking-[0.18em] text-cyan-200/70">MIDI map</span><p className="mt-1">7 channels / 480 PPQN</p></div>
          </section>
        )}

        <section className="grid gap-4 py-6 lg:grid-cols-[1.18fr_0.82fr]">
          <div className="glass-panel relative overflow-hidden rounded-[26px] p-5 sm:p-7">
            <div className="absolute right-0 top-0 h-full w-1/2 opacity-40" style={{ backgroundImage: `url(${STUDIO_RACK})`, backgroundSize: "cover", backgroundPosition: "center" }} />
            <div className="relative z-10 min-w-0 max-w-2xl">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.22em] text-slate-400"><span className="flex items-center gap-2"><Radio className="size-3.5 text-[#55e6ff]" /> Master bus / controller playback</span><label className="flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-2 py-1.5 text-[9px] tracking-[0.12em] text-slate-500"><AudioLines className="size-3.5 text-[#55e6ff]" /><select aria-label="Audio source" value={currentTrackId} onChange={(event) => selectTrack(event.target.value as (typeof AUDIO_TRACKS)[number]["id"])} className="max-w-44 bg-transparent text-[9px] uppercase tracking-[0.1em] text-slate-300 outline-none"><option value="geo-render" className="bg-[#0e141c]">GEO Controller Render</option><option value="muchie-casket" className="bg-[#0e141c]">Muchie Pop Casket</option></select></label></div>
              <div className="flex flex-wrap items-end gap-x-4 gap-y-2"><span className="font-display text-6xl font-semibold tracking-[-0.07em] text-white sm:text-8xl">{tempo}</span><span className="pb-2 font-mono text-xs uppercase tracking-[0.18em] text-[#ffc861]">BPM<br /><span className="text-slate-500">D major</span></span></div>
              <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.13em] text-slate-400"><span className="rounded-full bg-white/[0.07] px-3 py-1.5 text-[#a7f36b]">{masterAccent}</span><span>Bar {String(activeBar).padStart(2, "0")} / 16</span><span className="max-w-full truncate">{activeTrack.label} · {activeTrack.tag}</span></div>
              <div className="mt-7 flex flex-wrap items-center gap-2">
                <button onClick={togglePlay} className="control-button-primary"><span className="grid size-7 place-items-center rounded-full bg-black/25">{isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}</span>{isPlaying ? "Pause audio" : "Play audio"}</button>
                <button onClick={stop} className="control-button"><CircleStop className="size-4" /> Stop</button>
                <button onClick={() => setIsLooping((value) => !value)} className={`control-button ${isLooping ? "border-[#a7f36b]/60 text-[#a7f36b]" : ""}`}><RotateCcw className="size-4" /> {isLooping ? "Looping" : "Loop"}</button>
              </div>
              <div className="mt-6 flex items-center gap-3"><span className="font-mono text-[11px] text-slate-400">{formatTime(currentTime)}</span><input aria-label="Audio position" type="range" min="0" max={duration || 1} step="0.01" value={currentTime} onChange={(event) => { const value = Number(event.target.value); setCurrentTime(value); if (audioRef.current) audioRef.current.currentTime = value; }} className="range-signal flex-1" /><span className="font-mono text-[11px] text-slate-400">{formatTime(duration)}</span></div>
            </div>
          </div>

          <div className="glass-panel rounded-[26px] p-5 sm:p-7">
            <div className="flex items-start justify-between"><div><div className="eyebrow"><Activity className="size-3.5" /> Live signal field</div><h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em]">Control the air.</h2></div><div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-right font-mono text-[10px] uppercase tracking-[0.16em] text-slate-400"><div className="text-[#55e6ff]">{activeChannels.length} / 7</div><div>active buses</div></div></div>
            <div className="signal-scope mt-7">{Array.from({ length: 56 }).map((_, index) => <span key={index} style={{ height: `${20 + ((index * 19 + activeBar * 11) % 76)}%`, animationDelay: `${(index % 8) * 0.08}s` }} />)}</div>
            <div className="mt-5 flex items-center justify-between border-t border-white/8 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-500"><span>VDN FX / stereo scope</span><span className="text-[#55e6ff]">online</span></div>
          </div>
        </section>

        <section className="mb-4 flex flex-col gap-4 rounded-2xl border border-white/8 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#ffc861]/10 text-[#ffc861]"><Gauge className="size-5" /></div><div><div className="eyebrow">Master control</div><div className="mt-1 font-display text-base">Output level / tempo authority</div></div></div>
          <div className="flex flex-1 flex-wrap items-center gap-5 sm:justify-end"><label className="flex min-w-[180px] items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Master <input aria-label="Master level" type="range" min="0" max="100" value={master} onChange={(event) => setMaster(Number(event.target.value))} className="range-amber flex-1" /><span className="w-8 text-right text-[#ffc861]">{master}</span></label><label className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-500">Tempo <input aria-label="Tempo" type="number" min="60" max="220" value={tempo} onChange={(event) => setTempo(Math.max(60, Math.min(220, Number(event.target.value) || 156)))} className="w-16 rounded-md border border-white/10 bg-black/20 px-2 py-1.5 text-center text-[#ffc861] outline-none" /></label></div>
        </section>

        <section className="mb-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/[0.035] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="flex items-center gap-3"><div className="grid size-10 place-items-center rounded-xl bg-[#55e6ff]/10 text-[#55e6ff]"><Save className="size-5" /></div><div><div className="eyebrow">Mixer snapshots</div><div className="mt-1 font-display text-base">Save the room. Recall the mood.</div></div></div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center"><input aria-label="Preset name" value={presetName} onChange={(event) => setPresetName(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") savePreset(); }} placeholder="Preset name" className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.1em] text-white outline-none placeholder:text-slate-600 focus:border-cyan-300/50 sm:w-44" /><button onClick={savePreset} className="control-button-primary"><Save className="size-3.5" /> {activePresetId ? "Update preset" : "Save preset"}</button><button onClick={resetMixer} className="control-button"><RotateCcw className="size-3.5" /> Reset mix</button></div>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">{presets.length === 0 ? <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-slate-600">No snapshots yet · save your current mix</span> : presets.map((preset) => <div key={preset.id} className={`flex shrink-0 items-center gap-1 rounded-lg border px-2 py-1.5 ${activePresetId === preset.id ? "border-[#a7f36b]/55 bg-[#a7f36b]/[0.08]" : "border-white/10 bg-black/15"}`}><button onClick={() => loadPreset(preset)} className="max-w-36 truncate px-1 font-mono text-[10px] uppercase tracking-[0.1em] text-slate-300 hover:text-white">{preset.name}</button><button aria-label={`Delete ${preset.name}`} onClick={() => deletePreset(preset.id)} className="rounded p-1 text-slate-600 transition hover:bg-[#ff5ca8]/10 hover:text-[#ff5ca8]"><Trash2 className="size-3" /></button></div>)}</div>
        </section>

        <section className="rounded-[26px] border border-white/8 bg-[#0e141c]/90 p-4 shadow-[0_26px_90px_rgba(0,0,0,0.28)] sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><div className="eyebrow"><SlidersHorizontal className="size-3.5" /> Multi-track mixer</div><h2 className="mt-2 font-display text-2xl font-semibold tracking-[-0.04em]">Seven lanes. One signal.</h2></div><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.15em] text-slate-500"><span className="size-2 rounded-full bg-[#a7f36b]" /> safe output <span className="ml-2">/</span> <span>480 PPQN</span></div></div>
          <div className="mixer-scroll"><div className="grid min-w-[980px] grid-cols-7 gap-2">{channels.map((channel, index) => { const enabled = !channel.muted && (!soloActive || channel.solo); return <article key={channel.id} className={`channel-strip channel-${channel.color} ${!enabled ? "is-muted" : ""}`}><div className="flex items-start justify-between gap-2"><div><div className="font-display text-[11px] font-bold tracking-[0.11em] text-white">{channel.name}</div><div className="mt-1 font-mono text-[9px] uppercase tracking-[0.1em] text-slate-500">{channel.code}</div></div><button aria-label={`Open settings for ${channel.name}`} className="icon-button"><ChevronDown className="size-3.5" /></button></div><div className="mt-3 rounded-md border border-white/7 bg-black/20 px-2 py-1.5 font-mono text-[9px] uppercase tracking-[0.08em] text-slate-500">{channel.patch}</div><div className="mt-3"><Meter color={channel.color} active={isPlaying && enabled} seed={index + 1} /></div><div className="mt-4 space-y-3"><label className="block font-mono text-[9px] uppercase tracking-[0.13em] text-slate-500">Level <input aria-label={`${channel.name} level`} type="range" min="0" max="100" value={channel.level} onChange={(event) => updateChannel(channel.id, { level: Number(event.target.value) })} className={`range-${channel.color} mt-1.5 w-full`} /></label><label className="block font-mono text-[9px] uppercase tracking-[0.13em] text-slate-500">Pan <input aria-label={`${channel.name} pan`} type="range" min="-100" max="100" value={channel.pan} onChange={(event) => updateChannel(channel.id, { pan: Number(event.target.value) })} className="range-neutral mt-1.5 w-full" /></label><label className="block font-mono text-[9px] uppercase tracking-[0.13em] text-slate-500">Send <input aria-label={`${channel.name} send`} type="range" min="0" max="100" value={channel.send} onChange={(event) => updateChannel(channel.id, { send: Number(event.target.value) })} className={`range-${channel.color} mt-1.5 w-full`} /></label></div><div className="mt-4 flex gap-1.5"><button onClick={() => updateChannel(channel.id, { muted: !channel.muted })} className={`mix-button flex-1 ${channel.muted ? "is-on" : ""}`}>{channel.muted ? <VolumeX className="size-3" /> : <Volume2 className="size-3" />} M</button><button onClick={() => updateChannel(channel.id, { solo: !channel.solo })} className={`mix-button flex-1 ${channel.solo ? "is-solo" : ""}`}><Headphones className="size-3" /> S</button></div></article>})}</div></div>
        </section>

        <footer className="flex flex-col gap-3 py-7 font-mono text-[10px] uppercase tracking-[0.16em] text-slate-600 sm:flex-row sm:items-center sm:justify-between"><span>GEO Signal Laboratory / browser-native control room</span><span className="flex items-center gap-2"><Layers3 className="size-3.5" /> Audio engine online <Zap className="ml-2 size-3.5 text-[#55e6ff]" /></span></footer>
      </div>
    </main>
  );
}
