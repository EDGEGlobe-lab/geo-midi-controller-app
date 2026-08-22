export type EngineeringStage = "planned" | "prepared" | "review" | "parked";

export type EngineeringLane = {
  id: "production" | "systems" | "release" | "archive";
  label: string;
  detail: string;
  stage: EngineeringStage;
};

export const ENGINEERING_LANES: EngineeringLane[] = [
  { id: "production", label: "Production", detail: "Arrange approved original assets and review the session plan.", stage: "planned" },
  { id: "systems", label: "Systems", detail: "Check browser-local routing, UI state, and responsive controls.", stage: "prepared" },
  { id: "release", label: "Release review", detail: "Prepare a human review checklist before any published update.", stage: "review" },
  { id: "archive", label: "Archive", detail: "Retain source provenance and project notes for later inspection.", stage: "parked" },
];

const STAGE_ORDER: EngineeringStage[] = ["planned", "prepared", "review", "parked"];

export function nextEngineeringStage(stage: EngineeringStage): EngineeringStage {
  return STAGE_ORDER[(STAGE_ORDER.indexOf(stage) + 1) % STAGE_ORDER.length];
}

export function updateEngineeringLane(lanes: EngineeringLane[], id: EngineeringLane["id"]): EngineeringLane[] {
  return lanes.map((lane) => lane.id === id ? { ...lane, stage: nextEngineeringStage(lane.stage) } : lane);
}
