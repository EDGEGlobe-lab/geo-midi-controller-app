# Audio Source History Boundary

The Audio Source History view is an authenticated, project-scoped index of playable `studio_assets` records with audio MIME types. A source record may identify its provenance through tags such as `original`, `ai-project-audio`, or `pre-generated-fallback`; these tags are descriptive metadata, not a licence claim.

Restoration is an owner-only selection operation. It updates the authenticated user’s active source-version state for the named project and returns the asset’s storage URL. It does not overwrite source bytes, modify another user’s record, invoke audio generation, control hardware, or bypass browser autoplay requirements.

Deletion removes only the owner-scoped `studio_assets` metadata row. It does not delete an S3 object, sampler ledger entry, or generation record. The server rejects a request to delete the active source-version. To delete it, the owner must explicitly restore a different source first. All procedures require authentication, constrain project keys and IDs, and write a small lifecycle event record.
