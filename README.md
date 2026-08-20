# GEO MIDI Controller App

A full-stack, browser-based controller deck for the GEO electronic-music workflow. The application combines a React client, an Express/tRPC server, MySQL-backed project data, OAuth-aware sessions, and storage-backed media assets.

> **New contributor? Start here.** Install dependencies, add the required local environment values, and run the checks below. Then read **[CONTRIBUTING.md](CONTRIBUTING.md)** before choosing your first change.

| First 10 minutes                     | Command or action                                                    |
| ------------------------------------ | -------------------------------------------------------------------- |
| 1. Install the locked dependency set | `corepack enable && pnpm install --frozen-lockfile`                  |
| 2. Add local configuration           | Create a root `.env` with the values in [Environment](#environment). |
| 3. Run the application               | `pnpm dev`                                                           |
| 4. Verify your workspace             | `pnpm check && pnpm test`                                            |

## Quick start

### Prerequisites

Use a current Node.js LTS release and enable Corepack so that the project uses the version of pnpm declared in `package.json` (`pnpm@10.4.1`). The full application also needs access to a MySQL database, the OAuth service, and the Forge-backed asset-storage service. Request the non-public values from a project maintainer; do not copy them from another developer’s machine or commit them to Git.

```bash
git clone https://github.com/EDGEGlobe-lab/geo-midi-controller-app.git
cd geo-midi-controller-app
corepack enable
pnpm install --frozen-lockfile
```

### Environment

Create `.env` in the repository root. This file is intentionally ignored by Git. The application reads the following values from `server/_core/env.ts`.

| Variable                 | Purpose                                                       | Required for                            |
| ------------------------ | ------------------------------------------------------------- | --------------------------------------- |
| `VITE_APP_ID`            | Identifies the application to the client/runtime integration. | Full runtime                            |
| `JWT_SECRET`             | Signs or protects application session state.                  | Authenticated runtime                   |
| `DATABASE_URL`           | MySQL connection string used by Drizzle.                      | Database-backed features and migrations |
| `OAUTH_SERVER_URL`       | Base URL for the OAuth integration.                           | Sign-in and user-aware features         |
| `OWNER_OPEN_ID`          | Configures the application owner identity.                    | Owner-aware runtime behavior            |
| `BUILT_IN_FORGE_API_URL` | Forge endpoint used for asset storage.                        | Uploading and serving studio assets     |
| `BUILT_IN_FORGE_API_KEY` | Credential for the Forge storage endpoint.                    | Uploading and serving studio assets     |
| `PORT`                   | Preferred local HTTP port; defaults to `3000`.                | Optional                                |

A development server starts at the requested port and will select an available port in the range beginning at `3000` if that port is occupied.

```bash
pnpm dev
```

Open the URL printed in the terminal. The server starts Express, mounts the tRPC API at `/api/trpc`, registers OAuth and storage routes, and serves the Vite client in development.

## Everyday commands

| Goal                                   | Command        | Notes                                                                                 |
| -------------------------------------- | -------------- | ------------------------------------------------------------------------------------- |
| Start local development                | `pnpm dev`     | Starts the Express server with Vite in development mode.                              |
| Type-check                             | `pnpm check`   | Runs TypeScript without emitting files.                                               |
| Run automated tests                    | `pnpm test`    | Runs the Vitest suite once.                                                           |
| Apply formatting                       | `pnpm format`  | Applies Prettier to the repository. Review the resulting diff before committing.      |
| Build production assets                | `pnpm build`   | Builds the Vite client and bundles the server into `dist/`.                           |
| Run the production build               | `pnpm start`   | Starts the built server with `NODE_ENV=production`.                                   |
| Generate and apply database migrations | `pnpm db:push` | Runs Drizzle generation followed by migration; use only with an appropriate database. |

## Project structure

The repository uses a clear client/server/shared layout. Start with the feature page or router that owns the behavior you want to change, then follow the call path to shared types, database helpers, or storage integration as needed.

| Path                                                     | Responsibility                                                                            | Start here when…                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| [`client/src/`](client/src/)                             | React application source.                                                                 | You are changing the interface, browser behavior, or client-side state.                             |
| [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx) | Primary controller-deck experience and the main feature page.                             | You are working on the Studio, Performance, Arrangement, Mixer, MIDI, or local playback experience. |
| [`client/src/App.tsx`](client/src/App.tsx)               | Route selection, theme provider, error boundary, and shared UI providers.                 | You are adding a page or changing application-wide providers.                                       |
| [`client/src/main.tsx`](client/src/main.tsx)             | React bootstrap, React Query, tRPC client setup, and unauthorised-session handling.       | You are changing client application startup or API-client behaviour.                                |
| [`client/src/components/`](client/src/components/)       | Reusable product components.                                                              | A UI pattern is shared across the controller deck.                                                  |
| [`client/src/components/ui/`](client/src/components/ui/) | Reusable UI primitives.                                                                   | You need a composable low-level control rather than a product-specific component.                   |
| [`client/src/index.css`](client/src/index.css)           | Tailwind imports, design tokens, global styles, and shared utility styles.                | You are changing global colour, typography, layout, or theme foundations.                           |
| [`server/_core/index.ts`](server/_core/index.ts)         | Server entry point that composes Express, tRPC, OAuth, storage, and Vite/static serving.  | You are changing server startup or request middleware.                                              |
| [`server/routers.ts`](server/routers.ts)                 | tRPC procedures for authentication, studio assets, generation jobs, and sampler outputs.  | You are adding or modifying API operations.                                                         |
| [`server/db.ts`](server/db.ts)                           | Database access helpers.                                                                  | You are changing how a server procedure reads or writes stored data.                                |
| [`drizzle/schema.ts`](drizzle/schema.ts)                 | Drizzle model definitions for users, studio assets, generation jobs, and sampler outputs. | Your change needs a new field, table, relation, or persisted state.                                 |
| [`drizzle/`](drizzle/)                                   | Generated SQL migrations and Drizzle metadata.                                            | You are reviewing or committing a schema migration.                                                 |
| [`shared/`](shared/)                                     | Types, constants, and errors shared across client and server.                             | A contract must be used on both sides of the application.                                           |
| [`server/*.test.ts`](server/)                            | Server-side Vitest coverage.                                                              | You are changing authenticated behavior, studio assets, or generation-job state.                    |
| [`vite.config.ts`](vite.config.ts)                       | Vite root, aliases, development plugins, and client build output.                         | You are changing build behavior or import aliases.                                                  |

## How the pieces fit together

```text
Browser
  └─ client/src/main.tsx
       └─ App.tsx → pages and components
            └─ tRPC client (/api/trpc)
                 └─ server/routers.ts
                      ├─ server/db.ts → drizzle/schema.ts → MySQL
                      └─ server/storage.ts → Forge-backed object storage
```

The primary import aliases are `@` for `client/src`, `@shared` for `shared`, and `@assets` for `attached_assets`. Prefer these aliases over long relative paths when they make the owning area clearer.

## A good first contribution

Choose a focused, reviewable improvement: correct a controller interaction, improve an empty state, add a test around an existing server procedure, or document a non-obvious behavior. Before opening a pull request, run the type-check, test suite, and formatter.

```bash
pnpm check
pnpm test
pnpm format
git status
```

For the full contribution workflow, including where to place a change and what to include in a pull request, continue to **[CONTRIBUTING.md](CONTRIBUTING.md)**.

## Project anchors

This guide is maintained against the current repository configuration and source entry points: [`package.json`](package.json), [`server/_core/env.ts`](server/_core/env.ts), [`server/_core/index.ts`](server/_core/index.ts), [`server/routers.ts`](server/routers.ts), [`drizzle/schema.ts`](drizzle/schema.ts), and [`vite.config.ts`](vite.config.ts).
