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

Configure secrets only in the chosen hosting platform, never in committed files. The current server environment contract requires `DATABASE_URL`, `JWT_SECRET`, `VITE_APP_ID`, `OAUTH_SERVER_URL`, `OWNER_OPEN_ID`, `BUILT_IN_FORGE_API_URL`, and `BUILT_IN_FORGE_API_KEY`. The host must also set `NODE_ENV=production` and supply `PORT`. `GITHUB_TOKEN` is optional for authenticated GitHub API quota; no token may be exposed to the browser.

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
