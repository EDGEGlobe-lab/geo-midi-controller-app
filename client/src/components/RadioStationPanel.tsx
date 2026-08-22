import {
  ExternalLink,
  Heart,
  Pause,
  Play,
  Radio,
  ShieldCheck,
  SkipBack,
  SkipForward,
  Volume2,
} from "lucide-react";
import {
  getStationProgrammes,
  type ParkwayRadioProgramme,
  type ParkwayRadioStation,
} from "@shared/radioStationCatalog";
import { externalRadioProviderHandoff } from "@shared/externalRadioProviderHandoff";

const formatStationTime = (value: number) =>
  `${Math.floor(value / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(value % 60)
    .toString()
    .padStart(2, "0")}`;

export function RadioStationPanel({
  stations,
  selectedStationId,
  selectedProgrammeId,
  savedStationIds,
  authenticated,
  isPlaying,
  volume,
  currentTime,
  duration,
  pending,
  onLogin,
  onSelectStation,
  onSelectProgramme,
  onTogglePlay,
  onPrevious,
  onNext,
  onVolumeChange,
  onSave,
  onRemove,
}: {
  stations: readonly ParkwayRadioStation[];
  selectedStationId: string;
  selectedProgrammeId: string | null;
  savedStationIds: string[];
  authenticated: boolean;
  isPlaying: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  pending: boolean;
  onLogin: () => void;
  onSelectStation: (stationId: string) => void;
  onSelectProgramme: (programmeId: string) => void;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onVolumeChange: (value: number) => void;
  onSave: (stationId: string) => void;
  onRemove: (stationId: string) => void;
}) {
  const selected =
    stations.find(station => station.id === selectedStationId) ?? stations[0];
  const queue = getStationProgrammes(selected.id);
  const activeProgramme =
    queue.find(programme => programme.id === selectedProgrammeId) ?? queue[0];
  const nextProgramme =
    queue[
      (Math.max(
        0,
        queue.findIndex(programme => programme.id === activeProgramme?.id)
      ) +
        1) %
        Math.max(queue.length, 1)
    ];
  const isSaved = savedStationIds.includes(selected.id);
  const progress =
    duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  return (
    <section
      className="radio-station-panel panel"
      aria-labelledby="radio-station-title"
    >
      <div className="panel-header">
        <div>
          <div className="section-kicker">
            <Radio size={13} /> PARKWAY Radio / interactive station
          </div>
          <h2 id="radio-station-title">
            Original audio programme <span className="muted-slash">/</span>{" "}
            <span>listen in browser</span>
          </h2>
        </div>
        <span className="small-pill">
          <ShieldCheck size={12} /> ORIGINAL AUDIO
        </span>
      </div>
      <div className="radio-boundary">
        <strong>Original PARKWAY interactive station.</strong>
        <p>
          The programme advances while you listen on this website. It is not a
          terrestrial broadcast, a third-party relay, or an independent 24/7
          stream. Audio starts only after your play action and every listed
          source is declared as PARKWAY original audio.
        </p>
      </div>
      <div className="radio-provider-handoff">
        <div>
          <strong>Open a licensed radio provider</strong>
          <small>
            This opens the provider’s own website or installed app. PARKWAY does
            not embed, control, relay, or represent that provider’s catalogue or
            stations.
          </small>
        </div>
        <a
          className="outline-button outline-small"
          href={externalRadioProviderHandoff.url}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={13} /> {externalRadioProviderHandoff.label}
        </a>
      </div>
      <div className="radio-now-playing" aria-live="polite">
        <div className={`radio-art radio-${selected.accent}`}>
          <Radio size={24} />
        </div>
        <div className="radio-now-copy">
          <span>{isPlaying ? "ON AIR / NOW PLAYING" : "READY TO PLAY"}</span>
          <strong>{activeProgramme?.title ?? selected.nowPlaying}</strong>
          <small>
            {activeProgramme?.creator ?? "PARKWAY"} · {selected.name} ·{" "}
            {selected.genres.join(" / ")}
          </small>
        </div>
        <div className="radio-actions">
          <button
            className="radio-skip"
            aria-label="Previous programme"
            onClick={onPrevious}
          >
            <SkipBack size={16} fill="currentColor" />
          </button>
          <button
            className="radio-play"
            aria-label={
              isPlaying ? `Pause ${selected.name}` : `Play ${selected.name}`
            }
            onClick={onTogglePlay}
          >
            {isPlaying ? (
              <Pause size={17} fill="currentColor" />
            ) : (
              <Play size={17} fill="currentColor" />
            )}
          </button>
          <button
            className="radio-skip"
            aria-label="Next programme"
            onClick={onNext}
          >
            <SkipForward size={16} fill="currentColor" />
          </button>
          {authenticated ? (
            <button
              className={`radio-save ${isSaved ? "is-saved" : ""}`}
              disabled={pending}
              aria-label={
                isSaved
                  ? `Remove ${selected.name} from saved stations`
                  : `Save ${selected.name}`
              }
              onClick={() =>
                isSaved ? onRemove(selected.id) : onSave(selected.id)
              }
            >
              <Heart size={15} fill={isSaved ? "currentColor" : "none"} />
            </button>
          ) : (
            <button className="outline-button outline-small" onClick={onLogin}>
              Sign in to save
            </button>
          )}
        </div>
        <div
          className="radio-progress"
          aria-label={`${formatStationTime(currentTime)} elapsed of ${formatStationTime(duration)}`}
        >
          <div>
            <span style={{ width: `${progress}%` }} />
          </div>
          <small>
            {formatStationTime(currentTime)} <i /> {formatStationTime(duration)}
          </small>
        </div>
        <label className="radio-volume">
          <Volume2 size={14} />
          <span>Station volume</span>
          <input
            aria-label="Radio station volume"
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={event => onVolumeChange(Number(event.target.value))}
          />
          <strong>{volume}%</strong>
        </label>
      </div>
      <div className="radio-programme-layout">
        <section
          className="radio-programme-queue"
          aria-labelledby="radio-programme-queue"
        >
          <div className="radio-subhead">
            <div>
              <span>PROGRAMME QUEUE</span>
              <strong id="radio-programme-queue">{selected.name}</strong>
            </div>
            <small>
              {queue.length} original tracks · loops while you listen
            </small>
          </div>
          <div className="programme-list">
            {queue.map((programme, index) => (
              <ProgrammeRow
                key={programme.id}
                programme={programme}
                index={index}
                active={programme.id === activeProgramme?.id}
                onSelect={() => onSelectProgramme(programme.id)}
              />
            ))}
          </div>
        </section>
        <aside
          className="radio-schedule"
          aria-label="Current programme schedule"
        >
          <span>STATION WINDOW</span>
          <strong>{selected.tagline}</strong>
          <p>
            <b>NOW</b> {activeProgramme?.title ?? selected.nowPlaying}
          </p>
          <p>
            <b>UP NEXT</b> {nextProgramme?.title ?? "Programme queue repeats"}
          </p>
          <small>Continuous while the listener keeps this page open.</small>
        </aside>
      </div>
      <div
        className="station-card-grid"
        role="list"
        aria-label="PARKWAY original audio stations"
      >
        {stations.map(station => {
          const selectedCard = station.id === selected.id;
          const saved = savedStationIds.includes(station.id);
          return (
            <article
              key={station.id}
              role="listitem"
              className={`station-card station-${station.accent} ${selectedCard ? "is-selected" : ""}`}
            >
              <button
                className="station-select"
                aria-pressed={selectedCard}
                onClick={() => onSelectStation(station.id)}
              >
                <div>
                  <span>{station.name}</span>
                  <strong>{station.tagline}</strong>
                  <small>{station.genres.join(" · ")}</small>
                </div>
                <em>{selectedCard ? "TUNED" : "TUNE"}</em>
              </button>
              <div className="station-card-footer">
                <span>ORIGINAL AUDIO · WEB STATION</span>
                <button
                  className="text-button"
                  onClick={() => onSelectStation(station.id)}
                >
                  <Radio size={12} /> Tune
                </button>
                {authenticated && (
                  <button
                    className={`station-heart ${saved ? "is-saved" : ""}`}
                    aria-label={
                      saved
                        ? `Remove ${station.name} from saved stations`
                        : `Save ${station.name}`
                    }
                    disabled={pending}
                    onClick={() =>
                      saved ? onRemove(station.id) : onSave(station.id)
                    }
                  >
                    <Heart size={13} fill={saved ? "currentColor" : "none"} />
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="radio-ethics">
        <ShieldCheck size={15} />
        <div>
          <strong>Rights, privacy & conduct boundary</strong>
          <small>
            This station uses declared PARKWAY-original sources only. It does
            not profile listeners, collect location data, relay third-party
            stations, use client-side stream credentials, or imply
            terrestrial-broadcast status.
          </small>
        </div>
      </div>
    </section>
  );
}

function ProgrammeRow({
  programme,
  index,
  active,
  onSelect,
}: {
  programme: ParkwayRadioProgramme;
  index: number;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      className={`programme-row ${active ? "is-active" : ""}`}
      aria-current={active ? "true" : undefined}
      onClick={onSelect}
    >
      <span>{String(index + 1).padStart(2, "0")}</span>
      <div>
        <strong>{programme.title}</strong>
        <small>
          {programme.creator} · {programme.rightsLabel}
        </small>
      </div>
      <em>{active ? "ON AIR" : "QUEUE"}</em>
    </button>
  );
}
