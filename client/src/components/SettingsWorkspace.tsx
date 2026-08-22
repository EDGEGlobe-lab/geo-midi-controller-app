import { useState } from "react";
import { ChevronDown, Compass, Headphones, Move, SlidersHorizontal, Volume2 } from "lucide-react";
import { BASS_PROFILES, isBassProfileId, type BassProfileId } from "@/lib/stereoCalibration";
import { constrainCityPosition, moveCityPosition, type CityPosition } from "@/lib/settingsCityscape";
import "./SettingsWorkspace.css";

type MixerTrack = { id: string; name: string; color: string; level: number; pan: number };
type RouteStatus = "locked" | "ready" | "error" | "idle";

export function SettingsWorkspace({ master, bassProfile, selectedTrackId, tracks, compactMode, stereoStatus, stereoInStatus, channelStatus, mixBusStatus, onMasterChange, onBassProfileChange, onSelectedTrackChange, onTrackChange, onCompactChange }: {
  master: number;
  bassProfile: BassProfileId;
  selectedTrackId: string;
  tracks: MixerTrack[];
  compactMode: boolean;
  stereoStatus: RouteStatus;
  stereoInStatus: RouteStatus;
  channelStatus: RouteStatus;
  mixBusStatus: RouteStatus;
  onMasterChange: (value: number) => void;
  onBassProfileChange: (value: BassProfileId) => void;
  onSelectedTrackChange: (id: string) => void;
  onTrackChange: (id: string, update: Partial<Pick<MixerTrack, "level" | "pan">>) => void;
  onCompactChange: (value: boolean) => void;
}) {
  const [cityPosition, setCityPosition] = useState<CityPosition>({ x: 0, y: 0 });
  const selected = tracks.find((track) => track.id === selectedTrackId) ?? tracks[0];
  const move = (x: number, y: number) => setCityPosition((position) => moveCityPosition(position, { x, y }));
  const cityTransform = `translate(${cityPosition.x * -2.8}px, ${cityPosition.y * -2.2}px)`;

  return <section className="settings-workspace panel" aria-label="PARKWAY Settings workspace">
    <div className="panel-header"><div><div className="section-kicker"><SlidersHorizontal size={13} /> SETTINGS / LOCAL CONTROLS</div><h2>Mix, monitor, explore <span className="muted-slash">/</span> <span>browser-local</span></h2></div><span className="small-pill">NO DEVICE CONTROL</span></div>
    <p className="settings-intro">Adjust the live browser mixer and explore an original on-screen cityscape. The display is a local visual study, not virtual reality, physical “8000D” hardware, or a real-world navigation system.</p>
    <div className="settings-grid">
      <div className="settings-mixer-card">
        <div className="settings-card-head"><div><Volume2 size={15} /><strong>Sound mixing</strong></div><span>LIVE BROWSER MIX</span></div>
        <label className="settings-control"><span>Master <b>{master}%</b></span><input aria-label="Settings master volume" type="range" min="50" max="100" value={master} onChange={(event) => onMasterChange(Number(event.target.value))} /></label>
        <label className="settings-control"><span>Bass profile</span><select aria-label="Settings bass profile" value={bassProfile} onChange={(event) => { if (isBassProfileId(event.target.value)) onBassProfileChange(event.target.value); }}>{Object.entries(BASS_PROFILES).map(([id, item]) => <option key={id} value={id}>{item.label}</option>)}</select></label>
        <label className="settings-control"><span>Mix channel</span><select aria-label="Settings selected mixer channel" value={selected.id} onChange={(event) => onSelectedTrackChange(event.target.value)}>{tracks.map((track) => <option key={track.id} value={track.id}>{track.name}</option>)}</select></label>
        <label className="settings-control"><span>Channel level <b>{selected.level}%</b></span><input aria-label="Settings selected channel level" type="range" min="0" max="100" value={selected.level} onChange={(event) => onTrackChange(selected.id, { level: Number(event.target.value) })} /></label>
        <label className="settings-control"><span>Channel pan <b>{selected.pan > 0 ? `R ${selected.pan}` : selected.pan < 0 ? `L ${Math.abs(selected.pan)}` : "C"}</b></span><input aria-label="Settings selected channel pan" type="range" min="-50" max="50" value={selected.pan} onChange={(event) => onTrackChange(selected.id, { pan: Number(event.target.value) })} /></label>
        <label className="settings-switch"><input type="checkbox" checked={compactMode} onChange={(event) => onCompactChange(event.target.checked)} /><span>Compact control layout</span></label>
        <div className="settings-route-status" aria-label={`Audio route status: In ${stereoInStatus}, Channel ${channelStatus}, Bus ${mixBusStatus}, Out ${stereoStatus}`}><span className={`route-${stereoInStatus}`}>IN</span><i /><span className={`route-${channelStatus}`}>CH</span><i /><span className={`route-${mixBusStatus}`}>BUS</span><i /><span className={`route-${stereoStatus}`}>OUT</span></div>
        <small><Headphones size={12} /> Output follows the device-selected speaker, headphones, or compatible system output.</small>
      </div>
      <div className="settings-city-card">
        <div className="settings-card-head"><div><Compass size={15} /><strong>Cityscape exploration</strong></div><span>LOCAL VISUAL STUDY</span></div>
        <div className="cityscape-viewport" tabIndex={0} role="application" aria-label="Original cityscape explorer; use arrow keys to move within the display" onKeyDown={(event) => { const directions: Record<string, CityPosition> = { ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 }, ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 } }; const delta = directions[event.key]; if (delta) { event.preventDefault(); move(delta.x, delta.y); } if (event.key.toLowerCase() === "r") setCityPosition({ x: 0, y: 0 }); }}>
          <div className="cityscape-sky" /><div className="cityscape-moon" /><div className="cityscape-grid" style={{ transform: cityTransform }} />
          <div className="cityscape-buildings" style={{ transform: cityTransform }}>{[22, 38, 56, 34, 72, 48, 64, 30, 52, 42, 68, 36].map((height, index) => <span key={index} style={{ height: `${height}%` }} />)}</div>
          <div className="cityscape-marker" style={{ transform: `translate(${cityPosition.x * 4}px, ${cityPosition.y * 3}px)` }}><Move size={14} /></div>
          <div className="cityscape-hud"><span>SECTOR {String(cityPosition.x + 9).padStart(2, "0")}/{String(cityPosition.y + 9).padStart(2, "0")}</span><b>CYAN DISTRICT</b></div>
        </div>
        <div className="cityscape-controls"><button onClick={() => move(-1, 0)} aria-label="Move cityscape left">←</button><button onClick={() => move(0, -1)} aria-label="Move cityscape forward">↑</button><button onClick={() => move(0, 1)} aria-label="Move cityscape backward">↓</button><button onClick={() => move(1, 0)} aria-label="Move cityscape right">→</button><button className="city-reset" onClick={() => setCityPosition(constrainCityPosition({ x: 0, y: 0 }))}>Reset view <ChevronDown size={13} /></button></div>
        <small>Pointer, arrows, or R reset. Visual motion respects the browser’s reduced-motion preference.</small>
      </div>
    </div>
  </section>;
}
