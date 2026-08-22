import {
  CheckCircle2,
  CircleAlert,
  Gauge,
  PlayCircle,
  Route,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import {
  advanceProductionOperation,
  formatOperationDuration,
  initialProductionOperations,
  productionOperationLabel,
  type ProductionOperation,
} from "@shared/productionOperations";

type RouteState = "idle" | "ready" | "error" | "locked";

const laneIcons = {
  media: PlayCircle,
  routing: Route,
  review: ShieldCheck,
  generation: CircleAlert,
} as const;

export function ProductionOperationsPanel({
  duration,
  isPlaying,
  channel,
  mixBus,
  output,
}: {
  duration: number;
  isPlaying: boolean;
  channel: RouteState;
  mixBus: RouteState;
  output: RouteState;
}) {
  const [operations, setOperations] = useState<ProductionOperation[]>(() => [
    ...initialProductionOperations,
  ]);
  const mediaStatus = duration > 0 ? "metadata ready" : "awaiting media";
  const routeStatus = [channel, mixBus, output].every(
    state => state === "ready"
  )
    ? "route ready"
    : "route needs a user audio check";

  return (
    <section
      className="production-operations-panel panel"
      aria-labelledby="production-operations-title"
    >
      <div className="panel-header">
        <div>
          <div className="section-kicker">
            <Gauge size={13} /> Production operations / local workflow
          </div>
          <h2 id="production-operations-title">
            Control centre <span className="muted-slash">/</span>{" "}
            <span>reviewable project flow</span>
          </h2>
        </div>
        <span className="small-pill">USER INITIATED</span>
      </div>
      <p className="production-operations-copy">
        An original in-app workflow board for project preparation. It does not
        automate publishing, create external jobs, control hardware, increase
        generation capacity, or connect to third-party media platforms.
      </p>
      <div
        className="operations-health-grid"
        aria-label="Current media and route health"
      >
        <article>
          <span>MEDIA</span>
          <strong>{mediaStatus}</strong>
          <small>
            {duration > 0
              ? `${formatOperationDuration(duration)} loaded locally`
              : "Select an original source to inspect metadata"}
          </small>
        </article>
        <article>
          <span>ROUTE</span>
          <strong>{routeStatus}</strong>
          <small>
            CH {channel} · BUS {mixBus} · OUT {output}
          </small>
        </article>
        <article>
          <span>PLAYBACK</span>
          <strong>{isPlaying ? "listener initiated" : "standing by"}</strong>
          <small>No autoplay or external relay</small>
        </article>
      </div>
      <div className="operations-board" aria-live="polite">
        {operations.map(operation => {
          const Icon = laneIcons[operation.lane];
          const actionable =
            operation.state === "ready" || operation.state === "in-progress";
          return (
            <article
              key={operation.id}
              className={`operation-card operation-${operation.state}`}
            >
              <div className="operation-icon">
                <Icon size={16} />
              </div>
              <div className="operation-copy">
                <span>{operation.lane.toUpperCase()}</span>
                <strong>{operation.title}</strong>
                <small>{operation.detail}</small>
              </div>
              <div className="operation-action">
                <em>{productionOperationLabel(operation.state)}</em>
                {actionable ? (
                  <button
                    className="outline-button outline-small"
                    onClick={() =>
                      setOperations(items =>
                        advanceProductionOperation(items, operation.id)
                      )
                    }
                  >
                    {operation.state === "ready"
                      ? "Start local check"
                      : "Mark checked"}
                  </button>
                ) : (
                  <CheckCircle2
                    size={17}
                    aria-label="Blocked pending independent approval"
                  />
                )}
              </div>
            </article>
          );
        })}
      </div>
      <div className="operations-boundary">
        <ShieldCheck size={14} />
        <span>
          Blocked items require independent generation availability or human
          rights approval. This control centre cannot bypass either gate.
        </span>
      </div>
    </section>
  );
}
