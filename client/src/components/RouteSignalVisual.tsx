import { Activity, BrainCircuit, Eye, ShieldCheck } from "lucide-react";
import type { StereoMeter } from "@/lib/stereoCalibration";
import { createRouteVisualStages, routeVisualSummary, type RouteVisualStatus } from "@/lib/routeSignalVisual";
import "./RouteSignalVisual.css";

export function RouteSignalVisual({ stereoIn, channel, mixBus, stereoOut, meter }: { stereoIn: RouteVisualStatus; channel: RouteVisualStatus; mixBus: RouteVisualStatus; stereoOut: RouteVisualStatus; meter: StereoMeter }) {
  const stages = createRouteVisualStages({ stereoIn, channel, mixBus, stereoOut });
  const signalActive = meter.peakDb !== null;
  const summary = routeVisualSummary(stages, signalActive);
  const pulseHeight = Math.max(16, Math.round(24 + meter.lowEnergy * 64));

  return <section className={`route-signal-visual ${signalActive ? "has-signal" : ""}`} aria-label={`Signal visualisation: ${summary}`}>
    <div className="route-visual-head"><div><span><BrainCircuit size={12} /> AI-STYLE VISUAL LANGUAGE</span><strong>Route integrity <em>/</em> visual deontology</strong></div><span className="route-visual-badge"><Eye size={12} /> DISPLAY ONLY</span></div>
    <div className="route-visual-track" aria-hidden="true">{stages.map((stage, index) => <div key={stage.id} className={`route-visual-stage route-visual-${stage.status}`}><div className="route-visual-node"><i style={{ height: `${stage.status === "ready" ? pulseHeight : 18}%` }} /></div><span>{stage.label}</span><small>{stage.status.toUpperCase()}</small>{index < stages.length - 1 && <b />}</div>)}</div>
    <div className="route-visual-footer"><Activity size={12} /><span>{summary}</span><ShieldCheck size={12} /><small>Stages reflect actual local route and browser-meter state only; no AI analysis, external discovery, or video is created.</small></div>
  </section>;
}
