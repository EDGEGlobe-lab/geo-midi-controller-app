export type PlanningMetric = {
  id: string;
  label: string;
  verifiedCount: number;
  targetMinimum: number;
  targetMaximum: number;
};

export type PlanningAlert = PlanningMetric & {
  midpointThreshold: number;
  reached: boolean;
};

export function midpointThreshold(
  metric: Pick<PlanningMetric, "targetMinimum" | "targetMaximum">
) {
  return Math.ceil(
    metric.targetMinimum + (metric.targetMaximum - metric.targetMinimum) / 2
  );
}

export function getMidpointPlanningAlerts(
  metrics: PlanningMetric[]
): PlanningAlert[] {
  return metrics.map(metric => {
    const midpoint = midpointThreshold(metric);
    return {
      ...metric,
      midpointThreshold: midpoint,
      reached: metric.verifiedCount >= midpoint,
    };
  });
}
