# PARKWAY DAW Upgrade Tasks

- [x] Add draggable arrangement clips with snap-to-grid positioning.
- [x] Add loop-region editing with visible start/end handles and loop playback state.
- [x] Connect mixer volume sliders to Web Audio GainNode routing.
- [x] Connect mixer pan sliders to Web Audio StereoPannerNode routing.
- [x] Add MIDI device discovery, note mapping, and connection state.
- [x] Add a hardware performance-pad view with playable pads and MIDI feedback state.
- [x] Define tracked-visit behavior so audio generation is opt-in, visible, and does not silently trigger on page visits.
- [x] Add the generated Autonomous Manus AI Audio source and an in-app tracked-visit preference toggle.
- [x] Verify responsive behavior, keyboard access, audio unlock flow, and build output.
- [ ] If silent regeneration on every tracked visit is required, add a user-approved backend event route or scheduled automation layer; the current frontend safely arms the generated source without initiating hidden background generation.
- [ ] Save a checkpoint and deliver the upgraded project.
