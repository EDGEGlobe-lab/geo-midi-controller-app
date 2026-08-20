# Contributing to GEO MIDI Controller App

Thank you for contributing. This guide is the working handbook for making a safe, reviewable change in this repository.

> **Start here if this is your first change.** Complete the local setup, select the smallest relevant change surface, and run `pnpm check && pnpm test` before asking for review. The companion [README](README.md) provides the project overview and a map of the key files.

| Contribution checklist     | What “done” looks like                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------ |
| Prepare your environment   | Dependencies are installed with pnpm and required local environment values are available.  |
| Understand the owning area | You can name the page, router, data helper, or schema file responsible for the behavior.   |
| Keep the change focused    | The diff addresses one coherent issue and avoids unrelated refactors.                      |
| Verify the change          | Type-checking, relevant tests, and formatting have run successfully.                       |
| Explain the change         | The pull request describes behavior, validation, and any configuration or database impact. |

## 1. Set up a local workspace

Use a current Node.js LTS release. The repository pins pnpm through the `packageManager` field, so use Corepack rather than substituting another package manager.

```bash
git clone https://github.com/EDGEGlobe-lab/geo-midi-controller-app.git
cd geo-midi-controller-app
corepack enable
pnpm install --frozen-lockfile
```

Create a root `.env` file with the values supplied by a project maintainer. Do **not** commit this file: `.env` and its local variants are ignored deliberately.

| Variable                 | Why it matters                                             |
| ------------------------ | ---------------------------------------------------------- |
| `VITE_APP_ID`            | Client/runtime application identity.                       |
| `JWT_SECRET`             | Session-related secret.                                    |
| `DATABASE_URL`           | MySQL database connection.                                 |
| `OAUTH_SERVER_URL`       | OAuth integration endpoint.                                |
| `OWNER_OPEN_ID`          | Application owner identity.                                |
| `BUILT_IN_FORGE_API_URL` | Forge storage service endpoint.                            |
| `BUILT_IN_FORGE_API_KEY` | Forge storage credential.                                  |
| `PORT`                   | Optional preferred local HTTP port; the default is `3000`. |

Start the application after configuring the environment.

```bash
pnpm dev
```

The development command starts the Express server and connects Vite for the client application. It will report the local URL in the terminal. If port `3000` is unavailable, the server selects an open port beginning from that value.

## 2. Choose the correct change location

Before changing code, locate the layer that owns the behavior. A feature often crosses client, API, and database boundaries, but each responsibility has a clear home.

| If you are changing…                                                  | Start with                                               | Then check                                                                                                                          |
| --------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| A screen, controller interaction, MIDI handling, or local audio flow  | [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx) | Related components in [`client/src/components/`](client/src/components/) and hooks in [`client/src/hooks/`](client/src/hooks/).     |
| Routes, theme providers, error handling, or application-wide UI setup | [`client/src/App.tsx`](client/src/App.tsx)               | [`client/src/main.tsx`](client/src/main.tsx) for app bootstrap and tRPC client configuration.                                       |
| A reusable UI primitive                                               | [`client/src/components/ui/`](client/src/components/ui/) | The product component that consumes it. Avoid changing a primitive for a single page-specific need.                                 |
| A global visual token or common style                                 | [`client/src/index.css`](client/src/index.css)           | The target page or component at desktop and mobile widths.                                                                          |
| A client/server contract                                              | [`server/routers.ts`](server/routers.ts)                 | The matching tRPC call in the client and any shared types in [`shared/`](shared/).                                                  |
| Authenticated API behavior                                            | [`server/routers.ts`](server/routers.ts)                 | [`server/_core/trpc.ts`](server/_core/trpc.ts), [`server/_core/context.ts`](server/_core/context.ts), and the relevant server test. |
| A database-backed feature                                             | [`drizzle/schema.ts`](drizzle/schema.ts)                 | [`server/db.ts`](server/db.ts), [`server/routers.ts`](server/routers.ts), and a migration in [`drizzle/`](drizzle/).                |
| Media uploads or stored studio assets                                 | [`server/storage.ts`](server/storage.ts)                 | Asset procedures in [`server/routers.ts`](server/routers.ts) and the storage environment variables.                                 |
| Server startup, middleware, or local serving                          | [`server/_core/index.ts`](server/_core/index.ts)         | [`vite.config.ts`](vite.config.ts) for client build and alias changes.                                                              |

> **Rule of thumb:** Update the narrowest reusable layer that correctly owns the behavior. Do not add feature-specific logic to a generic UI primitive, and do not bypass a typed server procedure with an ad hoc request.

## 3. Work with the main architecture

The client is a React application rooted at `client/`. `client/src/main.tsx` establishes React Query and the tRPC client, while `client/src/App.tsx` selects routes and global UI providers. The primary product experience currently lives in `client/src/pages/Home.tsx`.

The server is an Express application. `server/_core/index.ts` mounts OAuth and storage routes and exposes the typed API at `/api/trpc`. Add application procedures to `server/routers.ts`; use the existing `publicProcedure` and `protectedProcedure` patterns so that authentication requirements remain explicit.

The persistent model uses Drizzle with MySQL. Schema definitions live in `drizzle/schema.ts`, database helper functions live in `server/db.ts`, and generated SQL migrations are committed in `drizzle/`. The current domain model covers users, studio assets, generation jobs, and sampler outputs.

The `shared/` directory holds contracts that both client and server can safely import. Vite resolves `@` to `client/src`, `@shared` to `shared`, and `@assets` to `attached_assets`; use these aliases when they make ownership and import paths clearer.

## 4. Make and verify your change

Keep the branch and diff narrowly scoped. When a change alters a tRPC input or output, update the server procedure and every affected client caller together. When it changes persisted data, update the schema, create the associated migration, and exercise the related data path before requesting review.

| Change type                                | Minimum verification                                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Client-only UI or interaction              | Verify the relevant view manually, then run `pnpm check` and `pnpm test`.                                                                           |
| API procedure or authorization behavior    | Add or update a focused server test where practical, then run `pnpm check` and `pnpm test`.                                                         |
| Database model or migration                | Review the generated migration, use an appropriate non-production database, and run the tests after applying the migration.                         |
| Storage, OAuth, or environment integration | Confirm the behavior with approved non-production credentials; never place credentials in the diff, logs, screenshots, or pull-request description. |

Run the standard validation commands from the repository root.

```bash
pnpm check
pnpm test
pnpm format
git diff --check
git status
```

`pnpm format` writes formatting changes, so inspect the diff afterwards. For targeted investigation, Vitest can run a specific file through pnpm, for example:

```bash
pnpm exec vitest run server/studio.assets.test.ts
```

The existing server test files are `server/auth.logout.test.ts`, `server/generation.jobs.test.ts`, and `server/studio.assets.test.ts`. Follow their style when extending coverage around these domains.

## 5. Handle database changes carefully

Database work has a higher blast radius than a presentation-only change. Update `drizzle/schema.ts` first, review the generated SQL migration, and keep the migration under version control with the source change. The repository command generates and applies migrations:

```bash
pnpm db:push
```

Run this only against an appropriate development or explicitly approved non-production database. Do not apply a migration to a shared or production database merely to verify a local change.

## 6. Prepare a reviewable pull request

A pull request should explain the user-visible or API-visible outcome, rather than only naming files. Include enough context for a reviewer to understand the scope and validation without reproducing your entire local environment.

| Include                | Example                                                                                                    |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| Purpose                | “Adds an empty state when a project has no sampler outputs.”                                               |
| Implementation summary | “Updates the Home page rendering path; no API or schema changes.”                                          |
| Validation             | “Ran `pnpm check`, `pnpm test`, and verified the empty state locally.”                                     |
| Risk or follow-up      | “No migration required; upload flow unchanged.”                                                            |
| Visual evidence        | Screenshots or a short recording for a meaningful UI change, with no credentials or personal data visible. |

Before requesting review, confirm that the pull request does not include `.env` files, service credentials, generated build output, unrelated formatting churn, or changes to files that are outside the stated scope.

## 7. Fast reference

| Need                               | Go to                                                               |
| ---------------------------------- | ------------------------------------------------------------------- |
| Project overview and initial setup | [README.md](README.md)                                              |
| App routes and global providers    | [`client/src/App.tsx`](client/src/App.tsx)                          |
| Main controller experience         | [`client/src/pages/Home.tsx`](client/src/pages/Home.tsx)            |
| Client API setup                   | [`client/src/main.tsx`](client/src/main.tsx)                        |
| Typed API procedures               | [`server/routers.ts`](server/routers.ts)                            |
| Database access helpers            | [`server/db.ts`](server/db.ts)                                      |
| Data model and migrations          | [`drizzle/schema.ts`](drizzle/schema.ts) and [`drizzle/`](drizzle/) |
| Local configuration contract       | [`server/_core/env.ts`](server/_core/env.ts)                        |
| Build and import aliases           | [`vite.config.ts`](vite.config.ts)                                  |
| Available scripts                  | [`package.json`](package.json)                                      |

## Source anchors

This guide is grounded in the repository’s current [package scripts](package.json), [environment contract](server/_core/env.ts), [server composition](server/_core/index.ts), [API router](server/routers.ts), [database schema](drizzle/schema.ts), [Vite configuration](vite.config.ts), and [ignored-file policy](.gitignore).
