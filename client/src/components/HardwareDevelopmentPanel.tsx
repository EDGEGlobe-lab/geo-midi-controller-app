import { Code2, Cpu, Download, FolderCode, HardDrive, ShieldCheck, Terminal } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getHardwareDevelopmentProfile, hardwareDevelopmentProfiles } from "@shared/hardwareDevelopmentProfiles";
import { LocalPracticeReceiverPanel } from "./LocalPracticeReceiverPanel";
import "./HardwareDevelopmentPanel.css";

export function HardwareDevelopmentPanel({ onOpenStudio, onRoutePracticeAudio, onPracticePad }: { onOpenStudio: () => void; onRoutePracticeAudio: () => void; onPracticePad: () => void }) {
  const [profileId, setProfileId] = useState("esp32");
  const profile = getHardwareDevelopmentProfile(profileId);
  const [source, setSource] = useState<string>(profile.template);

  useEffect(() => setSource(profile.template), [profile.id, profile.template]);
  const sourceStats = useMemo(() => ({ lines: source.split("\n").length, characters: source.length }), [source]);
  const downloadTemplate = () => {
    const blob = new Blob([source], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = profile.templateFilename;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return <section className="hardware-development-panel panel" aria-labelledby="hardware-development-title"><div className="panel-header"><div><div className="section-kicker"><Cpu size={13} /> Hardware development / local-first</div><h2 id="hardware-development-title">Code workbench <span className="muted-slash">/</span> <span>physical control disabled</span></h2></div><span className="small-pill"><ShieldCheck size={12} /> CONSENT-FIRST</span></div><div className="hardware-dev-boundary"><Terminal size={16} /><div><strong>Browser practice and local project preparation, not a device-control channel.</strong><p>Use this surface to rehearse a source and instrument-cue workflow, download a complete local scaffold, then build and flash only through your own selected local toolchain. PARKWAY cannot detect, read, flash, erase, or control a board, motherboard, card reader, or removable medium from this hosted application.</p></div></div><LocalPracticeReceiverPanel onRoutePracticeAudio={onRoutePracticeAudio} onPracticePad={onPracticePad} /><div className="hardware-dev-layout"><aside className="hardware-profile-list" aria-label="Hardware development profiles">{hardwareDevelopmentProfiles.map((item) => <button key={item.id} className={`hardware-profile ${item.id === profile.id ? "is-active" : ""}`} aria-pressed={item.id === profile.id} onClick={() => setProfileId(item.id)}><span>{item.category}</span><strong>{item.label}</strong><small>{item.id === "esp32" ? "Arduino-style sketch" : item.id === "microchip" ? "C source scaffold" : "Local workflow notes"}</small></button>)}</aside><div className="hardware-code-workbench"><div className="hardware-code-head"><div><span>{profile.category.toUpperCase()}</span><strong>{profile.label}</strong><small>{profile.description}</small></div><div className="hardware-code-actions"><button className="outline-button outline-small" onClick={() => setSource(profile.template)}>Reset template</button><button className="solid-button" onClick={downloadTemplate}><Download size={13} /> Download local file</button></div></div><textarea aria-label={`${profile.label} source code`} value={source} onChange={(event) => setSource(event.target.value)} spellCheck={false} /><div className="hardware-code-foot"><span>{profile.templateFilename}</span><span>{sourceStats.lines} lines · {sourceStats.characters} chars</span><em>Draft remains in this browser until you download it.</em></div></div></div><div className="hardware-local-steps"><div><span>01</span><strong>Draft locally</strong><small>Choose a profile, review the code, and download the file to your own computer.</small></div><div><span>02</span><strong>Build & verify locally</strong><small>{profile.localRequirement}</small></div><div><span>03</span><strong>Manage project assets</strong><small>Use the cloud project library only for intentionally chosen, non-sensitive code references or media assets.</small><button className="text-button" onClick={onOpenStudio}><FolderCode size={13} /> Open project assets</button></div></div><div className="hardware-dev-guardrails"><HardDrive size={15} /><div><strong>Excluded by design</strong><small>No automatic device discovery, serial-number collection, card-content inspection, key storage, credential handling, remote flashing, BIOS/UEFI changes, driver installation, or background telemetry is available in this workspace.</small></div><Code2 size={15} /></div></section>;
}
