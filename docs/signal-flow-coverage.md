# IN → CH → BUS → OUT Coverage Notes

## Measured scope

The focused command below uses Vitest’s V8 provider to measure only the signal-flow model and the visualisation component.

```bash
pnpm test:signal-flow-coverage
```

On the current verified revision, the focused run completed all 78 repository tests and produced the following result.

| File | Statements | Branches | Functions | Lines |
| --- | ---: | ---: | ---: | ---: |
| `shared/signalFlowModel.ts` | 100% | 100% | 100% | 100% |
| `client/src/components/SignalFlowVisualization.tsx` | 100% | 100% | 100% | 100% |

## What the tests verify

`shared/signalFlowModel.test.ts` has four deterministic tests. They verify the four-stage order, listener-initiated input transition, ready propagation, local error/locked-state preservation, route explanation text, selected-stage lookup, and safe fallback to `IN` for an invalid persisted selection.

`shared/signalFlowVisualization.test.tsx` server-renders the component in the existing Node test environment. It verifies the labelled section, list semantics, four native stage buttons, initial `aria-pressed` state, listener-action copy, and the explicit no-recording/no-transmission boundary.

`shared/signalFlowVisualization.dom.test.tsx` runs in happy-dom. It clicks the BUS button, verifies that `aria-pressed` moves from IN to BUS, and checks the updated local route explanation.

## Interaction coverage

The happy-dom test invokes the component’s `onClick` callback, so the focused component now has 100% statement, branch, function, and line coverage. The pure model tests continue to cover stage ordering, browser-local route states, selected-stage lookup, and invalid persisted-selection recovery.

If a future change adds multi-step interaction, keyboard-navigation customisation, animation state, or side effects to the component, extend the DOM test before treating the current interaction coverage as sufficient.
