# PARKWAY Local-Flashing and Practice Boundary

PARKWAY provides downloadable starter scaffolds and a browser-based practice environment for user-owned ESP32 and Microchip projects. The browser can simulate a practice receiver state, visualise source and transport status, and prepare source files for download. It does not model an actual RF receiver, create a transmission, or prove a physical instrument connection.

Local compilation and flashing occur only on a user-controlled computer through an explicitly selected local toolchain and target device. The hosted application does not enumerate USB devices, inspect removable media, collect serial numbers, store signing keys, handle Wi-Fi credentials, run a programmer, or emit RF traffic.

If a future local companion is requested, it must remain disabled by default, use a named user-owned device and narrow action scope, require explicit confirmation for every flash action, and offer immediate revocation. The companion must never forward raw device content, credentials, telemetry, or personal data to PARKWAY.
