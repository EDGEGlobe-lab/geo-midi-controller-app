export type ProductionOperationState =
  | "ready"
  | "in-progress"
  | "complete"
  | "blocked";

export type ProductionOperation = {
  id: string;
  lane: "media" | "routing" | "review" | "generation";
  title: string;
  detail: string;
  state: ProductionOperationState;
};

export const initialProductionOperations: readonly ProductionOperation[] = [
  {
    id: "source-readiness",
    lane: "media",
    title: "Original source readiness",
    detail:
      "Confirm selected original project audio is available before playback.",
    state: "ready",
  },
  {
    id: "route-check",
    lane: "routing",
    title: "Browser route check",
    detail: "Review channel, mix-bus, and output states after a user gesture.",
    state: "ready",
  },
  {
    id: "rights-review",
    lane: "review",
    title: "Private rights review",
    detail:
      "Human review remains required before release, relay, or distribution.",
    state: "blocked",
  },
  {
    id: "vocal-masters-14-20",
    lane: "generation",
    title: "Synthetic vocal masters 14–20",
    detail:
      "Unavailable pending a future, independently available generation run and rights review.",
    state: "blocked",
  },
] as const;

export function advanceProductionOperation(
  operations: readonly ProductionOperation[],
  id: string
): ProductionOperation[] {
  return operations.map(operation => {
    if (operation.id !== id || operation.state === "blocked") return operation;
    if (operation.state === "ready") {
      return { ...operation, state: "in-progress" };
    }
    if (operation.state === "in-progress") {
      return { ...operation, state: "complete" };
    }
    return operation;
  });
}

export function productionOperationLabel(state: ProductionOperationState) {
  return state.replace("-", " ").toUpperCase();
}

export function formatOperationDuration(value: number) {
  const totalSeconds = Math.max(0, Math.floor(value));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(
    totalSeconds % 60
  ).padStart(2, "0")}`;
}
