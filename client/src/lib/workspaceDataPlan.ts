export type ParkwayWorkspace = "Arrangement" | "Mixer" | "Piano Roll" | "Performance" | "Studio" | "Catalogue" | "Generator" | "Radio" | "Product" | "Devices" | "Develop" | "Assets" | "History" | "Feedback" | "Review" | "Contact";

export function workspaceDataPlan(activeView: ParkwayWorkspace, isAdmin: boolean) {
  const usesProjectAssets = activeView === "Studio" || activeView === "Catalogue" || activeView === "Generator" || activeView === "Assets";
  return {
    projectAssets: usesProjectAssets,
    jobs: activeView === "Studio",
    samplerOutputs: activeView === "Studio",
    sourceHistory: activeView === "History",
    savedStations: activeView === "Radio",
    hardwareRegistrations: activeView === "Devices",
    compatibilityReview: activeView === "Review" && isAdmin,
  };
}
