# Review Governance, Compatibility Feedback, and INF4 Display Boundary

## Authorized review workflow

Compatibility reports are the submissions managed by the review workspace. A signed-in `admin` is the only authorized staff role in the current application. An administrator can assign a report to an administrator, record an approval decision, or close the report. The server derives both actor and reviewer identity from authenticated users; clients never supply an owner ID, role, approval timestamp, or audit event.

Each state transition produces an immutable review event. Valid decisions are `approved`, `changes-requested`, `rejected`, and `closed`. The workflow is an internal triage record only; it does not certify a device, grant an external licence, make a product claim, or send a device command.

## Compatibility feedback minimisation

The public intake records only: device category, browser family, issue type, optional operating-system version, and a bounded narrative. It includes a honeypot and rejects payment data, passwords, tokens, serial numbers, bank details, and other secret-like content. The form does not request a user’s name, email, precise model, device identifier, IP address, location, microphone data, or listening telemetry.

## INF4 Radio Radar / Audio Transmitter display

The INF4 visual is an original, abstract arranger graphic used to show software signal activity, track routing, and project-preview station state. It is not a radio transmitter, hardware chipset, spectrum analyzer, emergency service, RF diagnostic, broadcast control, or physical-device interface.

Desktop review confirmed that the feedback form is readable with the minimum-data boundary visible, the staff-only review workspace is conditionally present for an authenticated administrator, the INF4 display is labelled as software-only, and Recover & Play remains adjacent to Stereo Out diagnostics. The mobile layout will reflow these panels into a single column with touch-oriented controls.

After restarting the development service, Feedback, Review, and Radio routes rendered without the prior stale `canActivateSoundAccess` module-import failure. The browser still requires a real user gesture and their selected device output route to establish audible media playback.
