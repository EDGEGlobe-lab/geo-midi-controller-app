# Production Deployment Checklist

## Purpose and current status

This checklist applies only to the `EDGEGlobe-lab/geo-midi-controller-app` repository. It does **not** treat the separate GEO Signal Manus domain as evidence of this app’s release state.

As reviewed on 2026-08-23, this repository is public, its default branch is `Aron-Ranger-Host-PPM-Volt`, its default branch has no configured protection rules, and its GitHub Pages site does not exist. The existing Pages, Astro, Jekyll, Deno, and Webpack template workflows are not a release pipeline for this Vite + Express + tRPC application. In particular, GitHub Pages cannot host the required Node server, tRPC routes, OAuth callback, or storage proxy.

> **Release boundary:** A production deployment must run the built Node server. It must not represent original browser-local audio as third-party radio transmission, provider relay, or hardware control.

## Hosting decision

Use a Node-compatible managed host for the target repository. The release artifact consists of the `dist/public` client build and the bundled `dist/index.js` server. GitHub Pages may be retained only for a deliberately separate, static-only demonstration; it is not an appropriate deployment target for this server-backed app.

| Requirement           | Required production action                                                                                                                         | Release evidence                                                                              |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Server runtime        | Run `pnpm build`, then `NODE_ENV=production pnpm start`; provide the host-assigned `PORT`.                                                         | Server starts and serves the built client.                                                    |
| API and session paths | Preserve `/api/trpc`, `/api/oauth/callback`, and `/manus-storage` behind the same HTTPS origin.                                                    | Authenticated and unauthenticated API smoke tests behave as designed.                         |
| Data and storage      | Supply the production database and approved server-side storage configuration.                                                                     | A non-destructive read and the declared original-preview sources work from the target domain. |
| OAuth                 | Register the exact production callback origin with the OAuth provider before enabling sign-in.                                                     | Sign-in and post-login return URL succeed on the target domain.                               |
| Release safety        | Keep audio user initiated and keep transmission, provider relay, hardware control, and release actions disabled until independent approvals exist. | Radio, Operations, and route-boundary checks show the stated limits.                          |

## Required configuration

Configure secrets only in the chosen hosting platform, never in committed files. The host must set `NODE_ENV=production` and supply `PORT`. The following inventory is derived from the current server and client configuration.

| Variable                      | Runtime scope         | Required use and handling                                                                                                                                                |
| ----------------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `NODE_ENV`                    | Server/build          | Set to `production`; it selects static-file serving and production React resolution.                                                                                     |
| `PORT`                        | Server                | Host-provided listening port; do not hard-code a public port.                                                                                                            |
| `DATABASE_URL`                | Server only           | Production database connection used by the Drizzle data layer. Keep private.                                                                                             |
| `JWT_SECRET`                  | Server only           | Session-cookie signing secret. Generate and retain it securely; changing it invalidates active sessions.                                                                 |
| `OAUTH_SERVER_URL`            | Server only           | OAuth service base URL used for callback handling. Keep its callback registration aligned with the target HTTPS origin.                                                  |
| `OWNER_OPEN_ID`               | Server only           | Owner identity configuration consumed by server context and ownership controls.                                                                                          |
| `BUILT_IN_FORGE_API_URL`      | Server only           | Base URL for approved server-side platform integrations, including storage proxy support.                                                                                |
| `BUILT_IN_FORGE_API_KEY`      | Server only           | Credential for those server-side integrations. Never expose it in a `VITE_*` variable or client bundle.                                                                  |
| `GITHUB_TOKEN`                | Server only, optional | Raises GitHub API quota where configured. Omit it rather than exposing it if unauthenticated public metrics are sufficient.                                              |
| `VITE_APP_ID`                 | Browser build input   | Public application identifier used by both client login initiation and server configuration. It is embedded during Vite build and is not a secret.                       |
| `VITE_OAUTH_PORTAL_URL`       | Browser build input   | Public browser destination used to begin OAuth login. Must match the selected OAuth environment.                                                                         |
| `VITE_FRONTEND_FORGE_API_URL` | Browser build input   | Public frontend integration URL currently referenced by the guarded Maps client path.                                                                                    |
| `VITE_FRONTEND_FORGE_API_KEY` | Browser build input   | Browser-visible key currently referenced by the guarded Maps client path. Use only a deliberately restricted frontend credential; never reuse the server-side Forge key. |

Vite embeds `VITE_*` values into the browser build. Therefore, treat them as public configuration even if their names contain `KEY`, and restrict any browser-visible credential to the minimum approved capability.

### Runtime defaults and production limits

The server environment module converts unset configuration values to empty strings. `NODE_ENV` is the only exception: production mode is active only when it is exactly `"production"`. The server listens on `PORT` and falls back to `3000` only when the host does not provide a value; a production host should always provide its assigned port.

| Missing value           | Current runtime behaviour                                                                                                                                                            | Production requirement                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`          | Startup remains possible because the database is lazy-initialised, but user persistence degrades and database-dependent features may return empty results or `Database unavailable`. | Provide a reachable production MySQL/TiDB-compatible connection before enabling the full application.          |
| `JWT_SECRET`            | The JWT helper receives an empty HMAC secret; startup does not fail fast.                                                                                                            | Provide a high-entropy non-empty secret and retain it across restarts; rotation invalidates existing sessions. |
| `OAUTH_SERVER_URL`      | SDK startup logs a configuration error; OAuth token exchange cannot use a valid base URL.                                                                                            | Provide the matching OAuth service base URL.                                                                   |
| `VITE_APP_ID`           | Server token exchange and browser sign-in receive an empty application identifier.                                                                                                   | Supply the registered public application identifier at build time.                                             |
| `VITE_OAUTH_PORTAL_URL` | Browser sign-in cannot construct a valid `/app-auth` destination.                                                                                                                    | Supply the matching public OAuth portal URL at build time.                                                     |
| HTTPS forwarding        | Session cookies are always `HttpOnly`, `SameSite=None`, and host-only; `secure` becomes true only when Express sees HTTPS or `X-Forwarded-Proto: https`.                             | Terminate TLS correctly and forward the protocol header through the host proxy.                                |

The OAuth callback verifies a one-time nonce from the `__Host-oauth_state` cookie, exchanges the authorization code, persists the user when the database is available, then issues a one-year session. The production callback must therefore use the same HTTPS origin that began the sign-in request.

Before release, apply any pending database migrations through the host’s controlled migration process. Do not use production data for test fixtures, and do not make destructive schema changes without an approved backup and rollback plan.

## Release gate

Run the following commands in CI against the exact commit intended for release:

```bash
pnpm install --frozen-lockfile
pnpm check
pnpm test
pnpm build
```

The current build intentionally produces separate `vendor-react`, `vendor-data`, and `vendor-ui` chunks, plus lazy workspace chunks. The production entry chunk is below Vite’s 500 KB warning threshold; any future bundle regression should be investigated before approval.

Configure a repository workflow for these gates and require it before merging or deploying. The current default branch lacks that protection, so a maintainer must first add branch protection or equivalent environment approval outside this repository codebase.

## Post-deployment verification

Verify the specific production URL, rather than `localhost` or the unrelated GEO Signal domain. Open `?view=Signals`, `?view=Operations`, `?view=Radio`, and `?view=Arrangement`, then confirm the following.

| Check          | Expected result                                                                                                                                 |
| -------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Signals        | Verified GitHub values remain visibly distinct from planning ranges and targets.                                                                |
| Navigation     | The persistent `START` control returns to `?view=Arrangement`; browser history remains coherent.                                                |
| Signal flow    | `IN → CH → BUS → OUT` is interactive, local-state-only, and explicitly does not claim AI inference, telemetry, device control, or transmission. |
| Original audio | Playback begins only after a user action; the timer and local route indicators change only when the browser graph is active.                    |
| Operations     | Local checks may progress only by user action; rights review and synthetic vocal masters 14–20 remain blocked.                                  |
| Security       | HTTPS is active, secrets are absent from client bundles, and OAuth callback/session behavior uses the target origin.                            |

Record the deployed commit SHA, target URL, timestamp, CI run URL, and the result of each check. If any gate fails, stop the rollout and revert to the last known-good deployment through the chosen host; do not substitute the separate GEO Signal deployment as a rollback target.
