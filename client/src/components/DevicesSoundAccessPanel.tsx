import { HardDrive, ShieldCheck } from "lucide-react";

export type HardwareRegistrationItem = {
  id: number;
  label: string;
  category: "computer" | "standalone" | "audio-interface" | "midi-controller" | "other";
  productReference: string | null;
  activationState: "disabled" | "active" | "revoked";
  consentNoticeVersion: string | null;
  consentedAt: Date | null;
  revokedAt: Date | null;
};

export type HardwareDraft = {
  label: string;
  category: HardwareRegistrationItem["category"];
  productReference: string;
};

type Props = {
  registrations: HardwareRegistrationItem[];
  authenticated: boolean;
  draft: HardwareDraft;
  setDraft: React.Dispatch<React.SetStateAction<HardwareDraft>>;
  consentAcknowledged: boolean;
  setConsentAcknowledged: (value: boolean) => void;
  pending: boolean;
  onLogin: () => void;
  onRegister: () => void;
  onActivate: (id: number) => void;
  onRevoke: (id: number) => void;
};

export function DevicesSoundAccessPanel({ registrations, authenticated, draft, setDraft, consentAcknowledged, setConsentAcknowledged, pending, onLogin, onRegister, onActivate, onRevoke }: Props) {
  return <section className="devices-panel panel"><div className="panel-header"><div><div className="section-kicker"><HardDrive size={13} /> Devices & sound access / consent-first</div><h2>Hardware registration <span className="muted-slash">/</span> <span>browser audio profile</span></h2></div><span className="small-pill">NO SERIALS · NO TELEMETRY</span></div><div className="devices-intro"><div><strong>Keep your own rig list private.</strong><p>A registration only lets PARKWAY display browser sound and MIDI controls for an owner-selected label. It cannot control hardware, transmit audio, unlock a third-party product, or grant an Apple, Ableton, or other manufacturer licence.</p></div><ShieldCheck size={24} /></div>{authenticated ? <><div className="device-registration-form"><label><span>Device label</span><input value={draft.label} maxLength={120} onChange={(event) => setDraft((value) => ({ ...value, label: event.target.value }))} placeholder="e.g. Studio desk Mac" /></label><label><span>Category</span><select value={draft.category} onChange={(event) => setDraft((value) => ({ ...value, category: event.target.value as HardwareDraft["category"] }))}><option value="computer">Computer</option><option value="standalone">Standalone device</option><option value="audio-interface">Audio interface</option><option value="midi-controller">MIDI controller</option><option value="other">Other</option></select></label><label><span>Public model reference <em>optional</em></span><input value={draft.productReference} maxLength={160} onChange={(event) => setDraft((value) => ({ ...value, productReference: event.target.value }))} placeholder="Never add a serial, key, or identifier" /></label></div><button className="solid-button device-create" onClick={onRegister} disabled={pending}><HardDrive size={14} /> {pending ? "SAVING…" : "Create disabled registration"}</button><label className="sound-access-consent"><input type="checkbox" checked={consentAcknowledged} onChange={(event) => setConsentAcknowledged(event.target.checked)} /><span>I understand that activation enables only a PARKWAY browser sound-access profile for my selected label. PARKWAY stores no serial number, audio, telemetry, payment data, or third-party licence.</span></label><div className="device-list">{registrations.length ? registrations.map((registration) => <article key={registration.id} className={`device-row device-${registration.activationState}`}><div className="device-status"><span className="status-light" /><span>{registration.activationState.toUpperCase()}</span></div><div className="device-main"><strong>{registration.label}</strong><small>{registration.category.replace("-", " ")} · {registration.productReference || "private label only"}</small>{registration.activationState === "active" && <em>Sound access acknowledged {registration.consentedAt ? new Date(registration.consentedAt).toLocaleDateString() : "now"}</em>}{registration.activationState === "revoked" && <em>Revoked {registration.revokedAt ? new Date(registration.revokedAt).toLocaleDateString() : ""}</em>}</div>{registration.activationState === "disabled" && <button className="outline-button outline-small" disabled={!consentAcknowledged || pending} onClick={() => onActivate(registration.id)}>Activate sound access</button>}{registration.activationState === "active" && <button className="text-button device-revoke" disabled={pending} onClick={() => onRevoke(registration.id)}>Revoke now</button>}{registration.activationState === "revoked" && <span className="small-pill">RE-REGISTER TO ACTIVATE</span>}</article>) : <div className="asset-empty"><HardDrive size={16} /><span>Register a private device label to create a disabled PARKWAY sound-access profile. Nothing is enabled automatically.</span></div>}</div></> : <div className="asset-empty"><ShieldCheck size={16} /><span>Sign in to create and manage private device registrations.</span><button className="outline-button outline-small" onClick={onLogin}>Sign in</button></div>}<div className="device-boundary"><span>NOTICE VERSION</span><strong>PARKWAY-SOUND-ACCESS-v1</strong><small>Revocation immediately disables the PARKWAY profile record. Browser playback still requires the explicit <em>Enable Stereo</em> gesture above.</small></div></section>;
}
