import { BrainCircuit, CircleAlert, ShieldCheck } from "lucide-react";
import { useState } from "react";
import {
  deriveSignalFlowStages,
  type SignalRouteState,
} from "@shared/signalFlowModel";

export function SignalFlowVisualization({
  isPlaying,
  channel,
  mixBus,
  output,
}: {
  isPlaying: boolean;
  channel: SignalRouteState;
  mixBus: SignalRouteState;
  output: SignalRouteState;
}) {
  const stages = deriveSignalFlowStages({ isPlaying, channel, mixBus, output });
  const [selectedStage, setSelectedStage] = useState("IN");
  const selected =
    stages.find(stage => stage.id === selectedStage) ?? stages[0];

  return (
    <section
      className="signal-flow-visualisation"
      aria-labelledby="signal-flow-title"
    >
      <div className="signal-flow-heading">
        <div>
          <span>
            <BrainCircuit size={12} /> SIGNAL FLOW VISUALISATION
          </span>
          <strong id="signal-flow-title">IN → CH → BUS → OUT</strong>
        </div>
        <small>Browser-local route model</small>
      </div>
      <div
        className="signal-flow-stage-row"
        role="list"
        aria-label="Audio signal route"
      >
        {stages.map((stage, index) => (
          <div className="signal-flow-step" key={stage.id} role="listitem">
            <button
              className={`signal-flow-node node-${stage.state} ${selectedStage === stage.id ? "is-selected" : ""}`}
              aria-pressed={selectedStage === stage.id}
              onClick={() => setSelectedStage(stage.id)}
            >
              <span>{stage.id}</span>
              <strong>{stage.title}</strong>
              <em>{stage.state.toUpperCase()}</em>
            </button>
            {index < stages.length - 1 && (
              <i
                className={`signal-flow-link link-${stage.state}`}
                aria-hidden="true"
              />
            )}
          </div>
        ))}
      </div>
      <div className="signal-flow-detail" aria-live="polite">
        <CircleAlert size={13} />
        <span>
          <strong>
            {selected?.id} / {selected?.title}
          </strong>
          {selected?.detail}
        </span>
      </div>
      <div className="signal-flow-ethics">
        <ShieldCheck size={12} /> This visualisation reads the existing browser
        route state. It does not record input, select physical devices, analyse
        listener data, create an external AI job, or transmit audio.
      </div>
    </section>
  );
}
