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
- [x] Confirm audible output on the user’s selected stereo device by clicking Enable Stereo and then Play; browser autoplay policy requires this final user gesture.

## Channel Rack and Stereo Out Reliability

- [x] Audit the Channel Rack, Mix Bus, and Stereo Out audio-node connections and mute states.
- [x] Make source routing idempotent so track selection cannot disconnect the live media path.
- [x] Add visible Channel Rack, Mix Bus, and Stereo Out recovery status indicators.
- [x] Add a user-gesture recovery action that resets muted media, resumes AudioContext, unmutes the active channel, and reconnects it safely.
- [x] Verify typecheck, 9 Vitest assertions, production build, and desktop/mobile UI for the repaired audio chain.

## Verified Launch Content and Consent-First Device Activation

- [x] Audit the current hardware catalogue and replace only launch claims that can be corroborated by official manufacturer sources.
- [x] Add a dated launch-specification ledger that names the source and clearly distinguishes PARKWAY concepts from third-party hardware facts.
- [x] Define a minimal, owner-scoped hardware-registration record with explicit purpose, consent notice version, activation state, and immediate revocation.
- [x] Add protected registration, consent grant, and revocation procedures that reject serial numbers, passwords, payment data, and hidden device telemetry.
- [x] Build a multifunction Devices & Sound Access view with browser-safe playback unlock, registration, sound-access status, and revoke controls.
- [x] Add automated tests that enforce disabled-by-default activation, owner scope, consent requirement, and revocation behavior.
- [x] Update the reusable PARKWAY cloud music-studio skill with the verified product-content and consent-first activation workflow, then validate it.
- [x] Verify the expanded launch and studio interface on desktop/mobile, run typecheck, 12 Vitest assertions, and a production build.
- [x] Publish the verified launch and consent-first device-access release.
- [x] Add API-level Vitest coverage for protected hardware register, activate, and revoke procedures, including unauthenticated denial, disabled creation, consent rejection, owner scope, and revocation behavior.
- [x] Add procedure-specific unauthenticated tests for hardware register, activate, and revoke, plus an API-level non-owner revoke denial test.

## Playback-First DAW Product Readiness

- [x] Audit why browser sample playback remains muted and expose a clear software-only recovery state.
- [x] Explicitly define the application as a non-recording, non-live-capture DAW product surface with no microphone, vocal, or connected-instrument capture path.
- [x] Make sample playback, playable browser MIDI pads, and software mixer controls the primary ready-to-use product controls.
- [x] Add a firmware/software asset-readiness panel that clearly labels product updates as local/browser assets rather than device firmware delivery.
- [x] Add automated coverage for playback-only boundaries and asset-readiness states, then verify typecheck, 19 tests, production build, and desktop/mobile UI.
- [x] Publish the playback-first DAW product update and request final browser-output confirmation.

## User-Controlled AI Project Audio Fallback

- [x] Add a visible Night Drive genre prompt index for AI project-audio fallback choices.
- [x] Superseded by the user-selected visible continuous error-triggered model, which has an always-on/pause control and does not run as a perpetual background loop.
- [x] Add a durable fallback-source state that can substitute for a muted sample without live capture or hardware control.
- [x] Add tests for prompt-index selection and fallback-source boundaries; the prior approval-gate test is superseded by the visible error-triggered lifecycle.
- [x] Superseded by the separate continuous fallback verification, publication, and user-confirmation task below.

## Continuous Error-Triggered Project Audio Fallback

- [x] Define the Night Drive fallback genre prompt index and a deterministic event-triggered source-selection lifecycle.
- [x] Add a visible always-on/pause control for error-triggered replacement, with no live capture or perpetual hidden generation.
- [x] Persist each authenticated fallback selection as a playable, tagged project asset record with provenance metadata.
- [x] Add fallback route recovery that activates a stored project source after failed media playback and avoids replacement loops.
- [x] Add tests for source selection, pause state, retry limits, owner-scoped asset persistence, and playback recovery, then verify typecheck, 27 tests, production build, and desktop/mobile UI.
- [x] Publish the continuous Night Drive fallback update and request user confirmation of fallback playback.
- [x] Extract and test fallback recovery state decisions for paused mode, retry cap, fallback-source load failure, and manual source exit.

## Audio Source History and Version Lifecycle

- [x] Inspect current project asset records and source-selection state for safe version-history integration.
- [x] Add protected owner-scoped source-history, restore, and delete procedures that preserve provenance and reject cross-owner access.
- [x] Prevent deletion of the currently restored source until another source is actively selected.
- [x] Build an Audio Source History view with restore, delete, provenance, active-version, and empty-state controls.
- [x] Add Vitest coverage for owner scope, active-source delete protection, restoration, and lifecycle state changes.
- [x] Update and validate the reusable PARKWAY cloud music-studio skill with source history and version lifecycle guidance.
- [x] Verify desktop/mobile UI, typecheck, 31 Vitest assertions, and production build.
- [x] Publish and deliver the source-history update and its reusable skill package.

## PARKWAY Radio Streaming Workspace

- [x] Define lawful radio-stream source, metadata, licensing, and browser-playback boundaries without representing third-party services or live broadcasts as PARKWAY-controlled.
- [x] Add an original station catalogue with playable project-owned preview sources, genres, current-program metadata, and disclosure labels.
- [x] Add an accessible radio player with play/pause, station switching, volume, now-playing state, and browser user-gesture audio unlock.
- [x] Add owner-scoped saved-station procedures and UI controls, with authorization tests and no client-side credentials.
- [x] Verify desktop/mobile radio discovery, playback controls, typecheck, 34 Vitest assertions, production build, and responsive visual review.
- [ ] Publish the PARKWAY radio workspace and request real-browser audio confirmation.

## Cross-Device and Ethical Radio Compatibility

- [x] Document browser-based support boundaries for iPhone, iPad, macOS, Windows, Android, Linux, and Chromium-family devices without making unsupported hardware guarantees.
- [x] Add responsive touch, keyboard, screen-reader, reduced-motion, and visible-focus safeguards to the radio workspace.
- [x] Add a clear code-of-conduct and privacy boundary: no hidden listener telemetry, discriminatory content targeting, client credentials, or third-party service impersonation.
- [x] Verify radio layouts on desktop and mobile viewports alongside browser-audio user-gesture requirements; tablet reflow uses the responsive 900px layout breakpoint.

## Operation-Aborted Error Recovery

- [x] Trace the reported Home page operation-aborted error to a browser media play request interrupted by source replacement or load lifecycle changes.
- [x] Treat expected media cancellation as a quiet state transition while preserving visible errors for real playback failures.
- [x] Add regression coverage for aborted playback transitions and verify typecheck, 36 tests, production build, and the affected radio interaction.
- [ ] Publish the abort-recovery fix and request user confirmation.

## Review Governance, Compatibility Feedback, and INF4 Display

- [x] Define administrator-only reviewer assignment and approval-history boundaries, with no client-side authority escalation.
- [x] Add public anonymous compatibility submissions with centralized administrator-only reviewer assignment, approval-event records, and audited state transitions; no submitter identity is collected.
- [x] Add a privacy-minimised compatibility feedback form that accepts user-entered device category, browser family, issue type, optional OS version, and narrative, while rejecting credentials and payment data.
- [x] Build protected staff review and approval-history views plus public feedback intake with clear status and empty states.
- [x] Add an original INF4 Radio Radar / Audio Transmitter arranger visualization, labelled as a software signal display with no physical broadcast control.
- [x] Add an explicit user-gesture Recover & Play path with visible Channel Rack, Mix Bus, and Stereo Out diagnostics; audible output remains pending real-device confirmation.
- [x] Repair the stale `canActivateSoundAccess` runtime module graph by restarting the development service, then re-verify review, feedback, recovery, typecheck, 39 tests, production build, and responsive UI.
- [ ] Publish the review, feedback, INF4, and recovery update and request real-device audio confirmation.

## Manus AI Music Generator Asset Upload

- [x] Define the user-initiated AI music upload boundary, including source provenance labels and no claim that external audio was rendered by Manus unless verified.
- [x] Add an authenticated upload lane that validates audio file type and size, extracts duration/waveform metadata, and persists approved music as a playable project asset.
- [x] Add a clear Project Asset Generator surface with approval status, provenance, upload progress, playable asset selection, and error handling.
- [x] Add API coverage for authentication, MIME and size validation, provenance tags, and stored playable-asset references; verify responsive UI, typecheck, 46 tests, and production build.
- [x] Add real staged upload-progress feedback and explicit per-asset approval/provenance badges in the Generator asset list.
- [ ] Add tests for authentication, MIME/size validation, provenance tags, asset persistence, and playback-source selection; verify responsive UI, typecheck, build, publish, and user playback confirmation.

## Functional PARKWAY Radio Station

- [x] Define a rights-respecting functional station model using only original or explicitly authorised PARKWAY audio, without relaying third-party broadcasters.
- [x] Deliver the user-selected interactive web station, where playback and programme progression occur while a listener keeps the PARKWAY site open.
- [x] Replace the software-display-only Radio workspace with an active programme player, station schedule, episode or track catalogue, and user-gesture playback controls.
- [x] Keep station listening state and saved stations private to the authenticated user, with clear disclosure that browser playback is not a terrestrial broadcast or third-party service.
- [x] Add original-audio programme-catalogue tests and verify desktop/mobile station layouts, type checking, 45 passing tests, and the production build.
- [ ] Add station playback and catalogue tests, validate desktop and mobile operation, publish the release, and request confirmation of real-device listening.

## PARKWAY Hardware Development Workspace

- [x] Define consent-first local-device boundaries for ESP32, microcontroller, motherboard, memory-card-reader, and other code-development equipment; no remote flashing or physical-device control by default.
- [x] Add a Hardware Development workspace with safe device profiles, firmware project templates, programming-code asset references, and clear local-companion requirements.
- [x] Support user-owned project code and build instructions without storing credentials, firmware-signing keys, serial numbers, or raw removable-media contents.
- [x] Add local-first hardware-profile boundary tests and verify desktop/mobile workbench layouts, type checking, 45 passing tests, and the production build.
- [ ] Add boundary tests, responsive verification, publication, and an optional follow-up path for a user-authorised local companion connection.

## Reliability and Performance Repair

- [x] Inspect current browser, network, and development-server evidence for reproducible operational failures affecting PARKWAY playback, radio, asset upload, or workspace responsiveness.
- [x] Address confirmed reliability and performance faults with focused code changes that preserve user-initiated audio, original-audio station boundaries, provenance, and local-only device controls.
- [x] Add deferred-workspace query and post-upload asset-confirmation regression coverage; verify typecheck, 48 tests, production build, and desktop workspace routes.
- [ ] Publish the reliability repair and request real-device confirmation of radio and uploaded-asset playback.

## Audible Practice Environment Repair

- [x] Reproduce the muted stereo and inaudible PARKWAY Radio behaviour in the browser and inspect the media source, Web Audio graph, autoplay state, and programme transport lifecycle.
- [x] Repair the user-gesture stereo unlock and original-audio Radio practice-session playback path so audible in-browser listening is the central outcome, not a display-only concept.
- [x] Keep the no-physical-transmitter and no-unlicensed-RF-reception boundary explicit while removing concept-only language from the experiential browser practice flow.
- [x] Add source URL regression coverage, verify audio media types, run typecheck, 48 tests, production build, and desktop/mobile practice-route review.
- [ ] Publish the audible-practice repair and request a fresh real-device stereo confirmation.

## Downloadable Local-Flashing Practice Scaffolds

- [x] Define ZIP package contents and safety boundaries for user-owned ESP32 and Microchip local flashing; no cloud-side flashing, serial control, secrets, or device telemetry.
- [x] Create and publish downloadable ESP32 and Microchip project scaffold ZIP assets with README build and local-flash guidance.
- [x] Add a hands-on browser practice workspace that simulates receiver, transport, and instrument-control states without claiming physical transmission, RF reception, or connected-device control.
- [x] Create and validate a reusable skill for delivering safe local-flashing scaffold ZIPs and browser-based device practice environments.
- [x] Add scaffold archive, boundary, and local practice catalogue regression coverage; verify ZIP download health, desktop/mobile UI, typecheck, 50 tests, and production build.
- [ ] Publish the integrated scaffold and hands-on practice release, then request real-device audio confirmation.

## iPhone 12 Pro Navigation Repair

- [x] Inspect the active-menu and sidebar layout at the iPhone 12 Pro viewport to identify why navigation intrudes into the studio workspace or becomes unavailable.
- [x] Implement a contained mobile navigation pattern with a clear active-workspace label, tap-safe controls, and no overlap with DAW transport or workspace content.
- [x] Verify Arrangement, Develop, Radio, and Generator views at iPhone 12 Pro dimensions, then run typecheck, 50 tests, and the production build.
- [ ] Publish the iPhone navigation repair and request device confirmation.

## Audio Source History Filters

- [x] Inspect owner-scoped audio source history metadata to identify safe provenance, genre, creation-date, and text-search fields.
- [x] Add provenance, genre, date-range, and text-search controls that filter the local History view without broadening server access or changing restore/delete protections.
- [x] Add filter regression coverage and verify desktop/iPhone History layouts; typecheck, 52 tests, and the production build pass.
- [ ] Publish the Audio Source History filters update and request confirmation using a populated private history.

## Stereo Bass Performance Calibration

- [x] Inspect the browser audio graph, current master/gain-stage readouts, and reference listening constraints; retain the 45% safety floor and user-gesture unlock requirement.
- [x] Add bounded normal-listening and bass-performance controls with transparent gain staging, display-only peak/headroom estimates, and no claim of an exact external-track match.
- [x] Add a clearly labelled abstract signal-modulation display inspired by wave and systems language without external data ingestion, RF operation, quantum computation, or physical-device control.
- [x] Add calibration regression coverage, verify desktop/iPhone operation, typecheck, 54 tests, and production build.
- [ ] Publish the stereo calibration update and request device audio confirmation at the selected listening profile.

## Built-in Speaker Playback Repair

- [x] Reproduce the silent browser/iPhone playback state and inspect source attachment, Channel Rack routing, Mix Bus, post-mix analysis, media element state, and user-gesture recovery.
- [x] Make Channel Rack → Mix Bus → Stereo Out routing idempotent and resilient across source changes, with a post-mix analyser that reflects the signal sent toward the browser output.
- [x] Enforce a 50% minimum listening floor, and provide a distinct built-in-speaker recovery action that does not require headphones or external speaker hardware.
- [x] Add route and meter regression coverage, verify mobile controls, typecheck, 54 tests, and production build.
- [ ] Publish the routing repair and request iPhone built-in-speaker confirmation.

## Truthful Meter and Silent Output Investigation

- [x] Trace the remaining silent playback route, including source readiness, direct media playback, post-mix analyser values, AudioContext state, and built-in-speaker recovery.
- [x] Repair any confirmed source or output route defect without fabricating positive dBFS peaks, contradictory headroom values, or external loudness claims.
- [x] Keep RF acquisition, physical receiver control, and unapproved third-party platform media out of scope while maintaining original/authorised browser playback.
- [x] Add direct post-mix output-test coverage, validate the iPhone listening controls, typecheck, 54 tests, and production build.
- [ ] Publish the output-diagnostic update and request iPhone confirmation of timer movement, meter activity, and audible output.

## Verified Zero-Signal Stereo In Repair

- [x] Inspect the zero-signal audio graph and identify the missing or broken connection between Channel Rack, Stereo In, Mix Bus, output analyser, and Stereo Out.
- [x] Add an explicit Stereo In stage with idempotent Channel Rack routing and safe source replacement so both media playback and Test Output reach the post-mix analyser.
- [x] Surface Stereo In route health separately from Mix Bus and Stereo Out, preserving the 50% minimum listening floor and built-in-speaker recovery action.
- [x] Add graph and meter regression coverage, validate the mobile listening rail, typecheck, 54 tests, and production build.
- [ ] Publish the Stereo In repair and request iPhone confirmation that Test Output moves the meter and produces sound.

## Initial Stereo In Connection Repair

- [x] Confirm and guard the initial Stereo In disconnect condition that can reject the first Channel Rack connection and set every route-health stage to error.
- [x] Implement a safe first connection followed by idempotent rerouting, so source changes preserve the working Channel Rack → Mix Bus → Stereo Out path.
- [x] Add initial-route regression coverage and validate the iPhone listening rail; typecheck, 56 tests, and production build pass.
- [ ] Publish the initial-route repair and request a fresh iPhone confirmation of meter movement, transport movement, and audible sound.

## User-Approved Original Music Catalogue

- [x] Define 20 original five-minute PARKWAY track briefs, rights/provenance labels, controlled generation sequence, and project-asset metadata without silent background generation.
- [x] Generate the 20 user-approved instrumental tracks in controlled batches and store them as private playable project assets with title, source, and generation-provenance metadata.
- [x] Add a compact song-switching control and an in-app assistant guidance surface that helps users choose, play, and inspect approved catalogue assets.
- [x] Validate asset persistence, provenance, compact switching, browser playback, responsive controls, and publish the catalogue release.

## Child-Friendly Catalogue Visual Player and Vocal Variants

- [x] Define original child-friendly lyric scripts and timestamped lyric cues for vocal-song variants without representing instrumental masters as already containing vocals.
- [x] Create distinct, original child-friendly procedural cartoon artwork for each of the 20 PARKWAY catalogue tracks directly in the visual player; image-generation quota prevented separate bitmap exports in this session.
- [x] Create the first explicitly labelled reviewed original synthetic vocal-song variant, keeping it selectable and provenance-distinct from all 20 instrumental masters; additional vocal variants remain intentionally deferred until separately rendered and verified.
- [x] Add an interactive, accessible waveform visualizer with transport-synchronised playhead and reduced-motion support.
- [x] Add a synchronized lyrics display that highlights the active line only for a future labelled synthetic vocal variant, provides a clear instrumental state otherwise, and remains readable on mobile.
- [x] Extend compact catalogue switching and the audio selector so users can select the original instrumental or the matching separately registered verified synthetic vocal variant.
- [x] Add tests for lyric-cue selection, waveform time mapping, artwork metadata, vocal/instrumental source distinction, responsive controls, and browser playback before publishing.

## Synthetic EDM Vocal Consent Boundary

- [x] Enforce a synthetic-voice-only policy for all PARKWAY vocal variants: reject author, user, artist, identifiable-person, uploaded-recording, and voice-reference sources.
- [x] Restrict vocal-song metadata and UI to newly generated, non-identifiable EDM-style singing with original lyrics and explicit `synthetic-vocal-only` provenance.
- [x] Keep each completed instrumental master as a separate selectable asset; never overwrite or imply vocals within an instrumental asset.
- [x] Add regression coverage for synthetic-vocal provenance, source-type rejection, instrumental/vocal selection clarity, and consent-boundary messaging.
- [x] Define every synthetic vocal as an original alien-creature EDM treatment with robotic formants, bass-responsive processing, and no imitation of franchise characters, game characters, actors, or identifiable people.

## Direct PARKWAY WAV Playback Without External CDN Transfer

- [x] Audit every registered PARKWAY WAV asset for a direct `/manus-storage/` project-owned URL, browser-playable audio MIME type, and absence of CloudFront or other external-host dependency.
- [x] Repair the catalogue selector and media-element source resolver so direct WAV project-storage keys are normalized to same-origin `/manus-storage/` browser paths before entering Stereo In routing.
- [x] Add regression coverage for direct project-owned WAV source resolution and no-external-host playback URLs.
- [x] Validate direct catalogue playback through Stereo In → Channel Rack → Mix Bus → Stereo Out on desktop and iPhone-sized layouts, then publish the repair; the user confirmed timer movement, active route lamps, and audible Catalogue playback.

## Through-Composed Synthetic Vocal Catalogue

- [x] Replace the existing looping synthetic-vocal mix with a through-composed five-minute Night Drive Continuum vocal arrangement, retaining only original lyrics and non-identifiable alien-cyborg voice synthesis.
- [x] Define distinct continuous five-minute vocal arrangement maps and original lyric scripts for each of the remaining 19 PARKWAY tracks, with changing sections rather than repeated loops.
- [ ] Render, assemble, upload, and register all 20 through-composed five-minute vocal masters as distinct project assets with `synthetic-vocal-only`, no-human-source, and no-franchise-imitation provenance.
- [ ] Apply continuous cyborg-robotic alien vocal processing and child-friendly cartoon-filtered effects throughout every vocal master without copying any known voice or fictional character.
- [ ] Replace the one-variant catalogue mapping with all 20 vocal-master mappings, direct player selection, lyric cues, and instrument/vocal provenance states.
- [ ] Add regression coverage for full-catalogue vocal mappings, direct in-app WAV sources, no-loop arrangement metadata, and synthetic-voice safeguards.
- [ ] Validate the 20 vocal selections through Stereo In → Channel Rack → Mix Bus → Stereo Out on desktop and iPhone-sized layouts, then publish.

## Built-In and System Speaker Playback Quality

- [x] Audit the browser DAW output graph for safe built-in phone and laptop speaker operation alongside system-selected compatible outputs, without claiming control of external device hardware or volume.
- [x] Preserve bounded bass and loudness-preserving gain staging with truthful browser-derived metering, user-gesture audio unlock, the 50% listening floor, and an explicit device-selected-output boundary.
- [x] Add regression coverage for built-in-speaker recovery, direct project-WAV routing, Stereo In routing, and bass-profile limits.
- [x] Validate the listening controls on iPhone-sized and desktop layouts, document system-output boundaries, and publish the playback-quality repair.

## Top Transport and Radio No-Sound Repair

- [x] Reproduce and trace the reported no-sound state affecting the top transport, radio player, and other non-catalogue audio controls with browser logs and source-health checks.
- [x] Repair the user-gesture playback sequence so top transport and radio media start before asynchronous audio-graph work, retaining the shared Stereo In → Channel Rack → Mix Bus → Stereo Out route.
- [x] Add regression coverage for gesture-preserving top transport/radio playback, direct source health, and routing recovery without external-host dependency.
- [x] Validate audible transport and radio playback through Stereo In → Channel Rack → Mix Bus → Stereo Out on desktop and iPhone-sized layouts, then publish the repair; the user confirmed timer movement, active route lamps, and audible Radio playback.

## Independent Engineering Centre and Generation Capacity Status

- [x] Define a PARKWAY-owned Engineering Centre that uses generic local workflow concepts only and does not integrate with, impersonate, or reuse branding from Unreal Engine, Kestra, WWE, or YouTube Music.
- [x] Add a browser-local Engineering Centre workspace with explicit production, systems, release-review, and archive-planning lanes that do not control third-party services or external hardware.
- [x] Provide user-initiated local stage controls with transparent states; do not start audio generation, playback, uploads, background jobs, or external actions automatically.
- [x] Add a clear generation-capacity status surface that preserves the verified 13 available synthetic vocal masters, identifies tracks 14–20 as unavailable until independently rendered, and never fabricates capacity or substitutes loops.
- [x] Add data-isolation and workflow-state regression coverage, then validate desktop and iPhone layouts, typecheck, tests, and production build.
- [x] Publish the Engineering Centre update and document the current browser-local and generation-capacity boundaries.

## User-Confirmed Inactive Audio Route Repair

- [x] Trace why real media starts leave every `IN → CH → BUS → OUT` indicator inactive, including source-node creation, Stereo In routing, channel selection, and status-state sequencing.
- [x] Repair the shared Web Audio graph so source playback prepares exactly one route through Stereo In, selected Channel Rack strip, Mix Bus, post-master analyser, and destination before media play, without unsafe initial disconnects.
- [x] Update health lamps only from successful real node connections and post-route activation; do not simulate route or meter movement.
- [x] Add regression coverage for successful first route, selected-track reroute, transport/radio start activation ordering, failure transition, and recovery.
- [x] Validate live route health and audible media on the user’s device after publishing the repair; the user confirmed the three requested live checks were working accordingly.

## Truthful Live GitHub Repository Metrics Engine

- [x] Inspect `EDGEGlobe-lab/geo-midi-controller-app` and its current project state using the authenticated GitHub connection; do not overwrite concurrent repository changes.
- [x] Implement a server-side GitHub metrics adapter for actual stars, forks, subscribers/watchers, branches, and tags, with explicit pagination and count-source semantics.
- [x] Never render requested target totals as live values unless the GitHub API actually returns them; show real values, last refreshed time, loading/error state, and source boundaries instead.
- [x] Add a PARKWAY Repository Metrics workspace with accessible live refresh, concise numeric formatting, and a link to the public repository.
- [x] Add tests for GitHub API response normalization, pagination/count semantics, no-fabrication safeguards, and UI loading/error states.
- [x] Validate live API data and the published temporary-403 fallback view, complete type checks/tests/build, save a checkpoint, and synchronize the changes to the connected GitHub repository.

## Repository Metrics Temporary 403 Handling

- [x] Trace the GitHub repository metrics 403 response, including rate-limit headers, polling behavior, and the current tRPC error propagation path.
- [x] Cache the most recent verified metric snapshot server-side with an explicit timestamp and source status; never invent a live count when GitHub is unavailable.
- [x] Return a successful, clearly stale/degraded response for temporary GitHub 403/rate-limit states when a verified snapshot exists, keeping other application queries unaffected.
- [x] Add retry-after-aware client controls and visible stale-data/source-status messaging without repeated background retry storms.
- [x] Add regression coverage for 403, rate-limit metadata, cached snapshot fallback, no-snapshot degraded state, and normal live refresh.
- [x] Validate the Repository workspace during an observed 403 and normal response, run type checks/tests/build, and publish the repair.

## Settings and Local Cityscape Exploration Workspace

- [x] Add a dedicated PARKWAY Settings workspace to the contained navigation drawer and desktop navigation, with mobile-safe focus and dismissal behavior.
- [x] Add practical, browser-local sound-mixing controls for master volume, bass profile, selected channel level/pan, compact mode, and truthful output-state guidance.
- [x] Add an original local cityscape exploration display with keyboard/pointer navigation, reduced-motion behavior, and clear non-VR/non-hardware-rendering disclosure.
- [x] Do not represent the display as “8000D,” a physical artificial-reality device, or a real-world navigation system; keep it an original on-screen visual exploration.
- [x] Add tests for Settings workspace data isolation, user-control state updates, and cityscape navigation constraints.
- [x] Validate desktop and iPhone-sized Settings layouts, run type checks/tests/build, and publish the workspace.
