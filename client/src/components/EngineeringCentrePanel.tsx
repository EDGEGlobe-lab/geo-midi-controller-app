import { useState } from "react";
import { Archive, AudioLines, Boxes, CheckCircle2, CircleDotDashed, ExternalLink, Layers3, ShieldCheck } from "lucide-react";
import { ENGINEERING_LANES, updateEngineeringLane } from "@/lib/engineeringWorkflow";
import "./EngineeringCentrePanel.css";

const stageLabel = { planned: "PLAN", prepared: "PREPARED", review: "REVIEW", parked: "PARKED" } as const;

export function EngineeringCentrePanel({ completedVocalTracks, totalCatalogueTracks, onOpenCatalogue }: { completedVocalTracks: number; totalCatalogueTracks: number; onOpenCatalogue: () => void }) {
  const [lanes, setLanes] = useState(ENGINEERING_LANES);
  const missingVocalTracks = Math.max(0, totalCatalogueTracks - completedVocalTracks);

  return <section className="engineering-centre panel" aria-label="PARKWAY Engineering Centre">
    <div className="panel-header"><div><div className="section-kicker"><Boxes size={13} /> ENGINEERING CENTRE / LOCAL WORKFLOW</div><h2>Build the system <span className="muted-slash">/</span> <span>keep control local</span></h2></div><span className="small-pill">SESSION-ONLY STATES</span></div>
    <p className="engineering-intro">A PARKWAY-owned planning surface for production, software-systems review, release review, and provenance. It is an independent browser workflow—not Unreal Engine, Kestra, WWE, YouTube Music, their brands, or their services.</p>
    <div className="engineering-boundary"><ShieldCheck size={18} /><div><strong>Explicit operating boundary</strong><span>Changing a lane only updates the on-screen session state. It does not start playback, render music, upload media, call an external service, control hardware, or create a background job.</span></div></div>
    <div className="engineering-lanes" role="list" aria-label="Local engineering workflow lanes">{lanes.map((lane, index) => <article key={lane.id} className={`engineering-lane engineering-${lane.stage}`} role="listitem"><div className="engineering-lane-number">0{index + 1}</div><div><span>{lane.label}</span><strong>{stageLabel[lane.stage]}</strong><p>{lane.detail}</p></div><button onClick={() => setLanes((items) => updateEngineeringLane(items, lane.id))} aria-label={`Advance ${lane.label} from ${stageLabel[lane.stage]}`}><CircleDotDashed size={15} /> Advance</button></article>)}</div>
    <div className="engineering-capacity">
      <div className="capacity-graphic" aria-hidden="true">{Array.from({ length: totalCatalogueTracks }, (_, index) => <span key={index} className={index < completedVocalTracks ? "is-available" : "is-unavailable"} />)}</div>
      <div><div className="section-kicker"><AudioLines size={13} /> SYNTHETIC VOCAL CAPACITY / VERIFIED STATE</div><strong>{completedVocalTracks} available masters <em>/</em> {missingVocalTracks} still unrendered</strong><p>Tracks 14–20 remain unavailable until separately rendered and verified. PARKWAY does not invent generation capacity, purchase capacity, trigger automatic renders, or replace missing arrangements with loops.</p></div>
      <button className="outline-button engineering-catalogue-link" onClick={onOpenCatalogue}>Review catalogue <ExternalLink size={14} /></button>
    </div>
    <div className="engineering-footer"><Layers3 size={14} /><span>Use this centre to sequence human-approved engineering work. It is a planning display, not an autonomous engine or a third-party platform connector.</span><Archive size={14} /><CheckCircle2 size={14} /></div>
  </section>;
}
