# Manus AI Music Generator Upload Boundary

The PARKWAY Manus AI Music Generator lane accepts an audio file selected by an authenticated user and stores it in that user’s project asset library. The lane is an **upload-and-playback workflow**, not a silent music-generation service. A file is never uploaded, generated, replaced, or played without an explicit user action.

Every item created through this lane receives server-controlled provenance tags: `manus-ai-upload`, `user-approved`, and `source-file-supplied`. Those tags mean that a user supplied an audio file through the generator lane; they do **not** assert that Manus rendered the music. A verified rendering provider would need a separate, explicitly approved provenance record before the UI could claim a newly rendered AI track.

The procedure accepts supported audio MIME types only, applies the existing 30 MB limit, derives duration and waveform preview in the browser before upload, stores bytes in project storage, and records only playback metadata in the database. It does not collect creator identity, credentials, payment data, account tokens, device identifiers, or listening telemetry.
