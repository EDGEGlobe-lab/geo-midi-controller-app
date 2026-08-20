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
- [x] If silent regeneration on every tracked visit is required, add a user-approved backend event route or scheduled automation layer; the current frontend safely arms the generated source without initiating hidden background generation.
- [x] Save a checkpoint and deliver the upgraded project.

## Music Studio Production Platform Expansion

- [x] Assess whether the current static project should be upgraded to full-stack cloud asset storage and user-owned workspace support.
- [x] Add compact DAW mini-PC, groovebox, workstation, portable interface, and pad-controller catalog sections.
- [x] Add virtual instrument, preset, and sound-library browsing structures.
- [x] Add local DAW project asset ingestion for vocals, sound effects, samples, and motion-graphics files.
- [x] Add project asset metadata, file type validation, and storage status UI.
- [x] Add autonomous generative audio workflow with explicit approval and visible generation state.
- [x] Add vocal and sound-effects generation lanes plus sampler-ready asset cards.
- [x] Add concept-level Ableton Live controller integration and clearly label external-runtime requirements.
- [x] Translate the user’s VGA / OTcl / octal / RIJG / cryptographic-math / G-clef / quaver / cybernetic brief into a coherent visual and audio design system without presenting malformed strings as factual technical standards.
- [x] Validate the cloud studio experience and save a delivery checkpoint.

## Media Metadata and Generation Jobs

- [x] Add durable media metadata fields for duration, waveform preview data, and user-owned tags.
- [x] Add generation job and sampler output tables with owner/project scoping and lifecycle states.
- [x] Add protected procedures to create, update, list, and complete generation jobs and sampler outputs.
- [x] Extract duration and waveform preview data from uploaded audio/video files in the browser.
- [x] Add tag editing and tag filtering for uploaded media assets.
- [x] Render waveform previews and duration metadata on asset and sampler cards.
- [x] Apply HETG/CIAO and neon NGT/ANNGT constellation styling as a clearly labeled abstract metadata treatment.
- [x] Add Vitest coverage for generation-job authorization and state transitions.
- [x] Verify typecheck, tests, build, responsive UI, and save a final checkpoint.

## Reusable Skill and Preview Player

- [x] Create and validate a reusable PARKWAY cloud music-studio workflow skill.
- [x] Add a dedicated media preview player with waveform zoom controls.
- [x] Add pointer and keyboard waveform scrubbing with accessible time readout.
- [x] Add Web Audio peak normalization controls for preview playback.
- [x] Apply the original underground-techno pink passcode and pattern-network visual treatment.
- [x] Verify new preview controls on mobile, save a fresh checkpoint, and deliver the skill package.

## Stripe Purchases and Subscriptions

- [x] Enable the Stripe integration and review its generated checkout contracts.
- [x] Add one-time product purchase and recurring subscription entry points.
- [x] Add frontend checkout success/cancel feedback and verify return states.
- [x] Verify payment UI at desktop/mobile sizes and document required sandbox test steps.
- [x] Save a checkpoint and deliver the payment-ready project.

## Payment Authority Removal

- [x] Audit all Stripe payment code, checkout UI, webhook routes, dependencies, and product definitions.
- [x] Remove Stripe Checkout, webhook processing, payment catalog, and payment-related UI controls.
- [x] Remove the Stripe SDK dependency and confirm no website code can initiate payment collection.
- [x] Preserve all music-studio functions and add no Revolut, Wise, card, Windcave, or banking integration.
- [x] Verify the disabled payment state, checkpoint, and deliver the non-payment website.

## Non-Transactional Client Enquiries

- [x] Create and validate a reusable safe payment-removal and client-enquiry workflow skill.
- [x] Add a minimal contact enquiry data model with service interest and payment-detail follow-up preference.
- [x] Scope contact enquiries to the single project owner and restrict inbox listing to that owner.
- [x] Add a secure non-transactional contact form with clear payment-boundary copy.
- [x] Add tests for non-admin denial and strict rejection of payment-related fields.
- [x] Save a fresh checkpoint and deliver the contact workflow after owner-scope verification.

## Stereo Reliability and Compact Studio Performance

- [x] Inspect the current Web Audio graph and locate the mute or stereo-output failure path.
- [x] Add a browser-safe audio-enable control and a persistent 45% minimum master-volume floor.
- [x] Preserve user volume choices above the floor without forcing automatic sound playback.
- [x] Research rights-respecting instruments, audio engineering, and creator-protection patterns for the studio roadmap.
- [x] Compact the workspace into clearer multi-function views for production, performance, Studio, Assets, and Contact.
- [x] Test source code, typecheck, tests, production build, and desktop/mobile compact layouts.
- [ ] Confirm audible output on the user’s selected stereo device by clicking Enable Stereo and then Play; browser autoplay policy requires this final user gesture.
