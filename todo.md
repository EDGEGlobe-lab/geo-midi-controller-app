# PARKWAY DAW — Audio Feedback Work Items

- [x] Inspect the synced audio element, source selection, and Web Audio routing.
- [x] Fix the silent playback path and confirm a loaded source reaches the destination.
- [x] Add real-time analyser data for master and mixer channels.
- [x] Render live volume meters and dynamic EQ displays from analyser data.
- [x] Validate playback, visual response, and responsive mixer behavior.
- [x] Save a delivery checkpoint.
- [x] Inspect current GitHub repository metric data and define verified versus target-range labels.
- [x] Add a server-backed GitHub metrics reader for stars, forks, watchers, branches, and tags with rate-limit/error handling.
- [x] Add a responsive dashboard panel that displays verified current counts separately from the requested target ranges.
- [x] Test metric parsing, error states, and dashboard rendering; then commit the update with clear data-source guidance.
- [ ] Verify deployed Signals workspace rendering and confirm live GitHub repository counts are displayed with a readable data-source boundary.
- [x] Add a deterministic midpoint planning-alert policy based on verified current values, without treating planning targets as live counts or forecasting engagement.
- [x] Add active-session refresh status and visible in-app alerts for reached midpoint thresholds; do not introduce an always-on poller or external notification channel without separate configuration.
- [x] Test midpoint alert computation, non-alert states, refresh/error behavior, and responsive Signals rendering; commit the update.
- [x] Repair the Signals workspace click-to-content handoff so selection always shows the correct panel, live data state, and usable controls.
- [x] Add a clearly separated, user-initiated external radio-provider handoff that opens a provider destination without embedding, relaying, transmitting, cataloguing, or claiming third-party station access.
- [x] Test that the radio handoff has no autoplay, no third-party stream URL in the audio player, and no incorrect “live station” representation.
- [x] Repair disappearing workspace navigation and add an always-available return-to-start control across desktop and mobile layouts.
