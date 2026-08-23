# IN → CH → BUS → OUT Coverage Notes

## Measured scope

The focused command below uses Vitest’s V8 provider to measure only the signal-flow model and the visualisation component.

```bash
pnpm test:signal-flow-coverage
```

On the current verified revision, the focused run completed all 77 repository tests and produced the following result.

| File | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| `shared/signalFlowModel.ts` | 100% | 100% | 100% | 100% |
| `client/src/components/SignalFlowVisualization.tsx` | 100% | 100% | 50% | 100% |

## What the tests verify

`shared/signalFlowModel.test.ts` has four deterministic tests. They verify the four-stage order, listener-initiated input transition, ready propagation, local error/locked-state preservation, route explanation text, selected-stage lookup, and safe fallback to `IN` for an invalid persisted selection.

`shared/signalFlowVisualization.test.tsx` server-renders the component in the existing Node test environment. It verifies the labelled section, list semantics, four native stage buttons, initial `aria-pressed` state, listener-action copy, and the explicit no-recording/no-transmission boundary.

## Deliberate coverage limitation

The component’s `onClick` callback is not invoked in the current Node-only test environment, which is why component function coverage is 50% even though its statements, branches, and lines are fully covered. The callback only delegates selection to React state, while the selected-stage logic is covered exhaustively in the pure model tests.

If a future change adds multi-step interaction, keyboard-navigation customisation, animation state, or side effects to the component, add a DOM-based interaction test using a dedicated browser-like test environment before treating the current server-render coverage as sufficient.
