# Production Hardening & Test Coverage Improvements

## Cover

Production Hardening & Test Coverage Improvements

GEO MIDI Controller App — validated engineering update

## Slide 1

### Hardening is now measurable

- 78 automated tests across 29 test files pass on the current branch.
- Production bundle, TypeScript validation, focused coverage, and whitespace checks pass.
- CI now runs the same repeatable gates before a release is trusted.

## Slide 2

### Production now rejects unsafe configuration

- Startup validates database, session, OAuth, application, and server-storage configuration.
- Blank required values stop the process before Express routes are registered.
- Session secrets require at least 32 bytes in production.

## Slide 3

### Session tokens have stronger identity binding

- Tokens use HS256 with a configured application issuer and audience.
- Subject must match the OpenID retained in the token payload.
- Verification rejects missing, invalid, expired, wrong-issuer, wrong-audience, and subject-mismatched tokens.

## Slide 4

### CI proves the executable release gates

- Locked dependency installation prevents unreviewed lockfile drift.
- TypeScript, complete unit tests, focused signal-flow coverage, and production build run in sequence.
- The quality-gate workflow uses read-only repository permission and cancels superseded runs.

## Slide 5

### Signal flow now has a real click test

- The visualisation remains a browser-local route explanation: IN → CH → BUS → OUT.
- A happy-dom test clicks BUS and verifies selected `aria-pressed` state moves from IN to BUS.
- The live detail panel changes to the local BUS explanation.

## Slide 6

### Focused signal-flow coverage is complete

- Model: 100% statements, branches, functions, and lines.
- Component: 100% statements, branches, functions, and lines.
- Server-render accessibility checks and DOM interaction checks now complement one another.

## Slide 7

### Deployment paths are now unambiguous

- The active Node release bundles `server/_core/index.ts`.
- Static GitHub Pages templates and the legacy server entrypoint are not valid production release paths.
- Browser-only configuration remains a release-build and real-domain smoke-test responsibility.

## Slide 8

### Operator controls remain essential

- Select a Node-compatible host and register the exact HTTPS OAuth callback origin.
- Supply secrets through host configuration; do not commit them.
- Verify the target domain’s login, Signals, Operations, browser-local playback, and no-transmission boundaries.
