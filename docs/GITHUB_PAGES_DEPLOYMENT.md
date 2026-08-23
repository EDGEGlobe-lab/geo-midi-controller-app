# GitHub Pages — Unsupported for the Current Application

The `geo-midi-controller-app` repository is a server-backed Vite, Express, and tRPC application. It requires its Node server to serve the built client, the `/api/trpc` API, the OAuth callback, and the storage proxy. **GitHub Pages cannot provide those runtime services.**

The repository’s existing Astro, Jekyll, generic static-content, Deno, and Webpack workflows are generated templates rather than a valid production pipeline for this application. They should not be interpreted as deployment evidence, and the expected GitHub Pages endpoint is not currently configured for this repository.

> Do not deploy the repository root or a Vite-only artifact to Pages as a substitute for the application. That would omit the server-backed capabilities and could create a misleading public experience.

For the required Node-compatible hosting, configuration, CI gates, post-deployment verification, and rollback records, follow [the production deployment checklist](./production-deployment-checklist.md). The unrelated GEO Signal Manus domain must not be used as deployment proof or a rollback target for this repository.
