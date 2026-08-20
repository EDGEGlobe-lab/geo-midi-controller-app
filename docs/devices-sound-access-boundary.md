# Devices & Sound Access Boundary

## Purpose

Allow a signed-in artist to keep a private list of their own music-production devices and explicitly activate a **PARKWAY browser sound-access profile** for a registered label. The profile only exposes PARKWAY’s local Web Audio and Web MIDI controls; it does not control hardware, transmit audio, collect telemetry, or confer a third-party product licence.

## Data minimisation

Store only a user-selected device label, device category, optional public model reference, activation state, consent-notice version, and timestamps. Do not collect serial numbers, passwords, licence keys, payment data, device identifiers, location, audio files, browser history, or background telemetry.

## Consent and lifecycle

New records begin **disabled**. A signed-in owner must review and accept notice version `PARKWAY-SOUND-ACCESS-v1` to activate a PARKWAY profile. Every activation and revocation creates a concise owner-scoped consent event. Revocation immediately changes the profile to `revoked`; it does not affect audio already playing in the browser and does not attempt to revoke third-party licences.

## Product claims

Only cite an official manufacturer source for a third-party product’s name, launch date, and specifications. Describe each as a **compatibility reference**, not a PARKWAY product, endorsement, certified integration, or licence entitlement. PARKWAY concept modules remain clearly marked as conceptual and carry no launch date or verified product specification.
