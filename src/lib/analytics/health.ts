export type HealthTone = "positive" | "warning" | "critical";

export type HealthResult = {
  health: string;
  tone: HealthTone;
};

export function getDepartmentHealth(entry: {
  attritionRiskAvg: number;
  burnoutRiskAvg: number;
  engagementScore: number;
}): HealthResult {
  if (
    entry.attritionRiskAvg >= 60 ||
    entry.burnoutRiskAvg >= 60 ||
    entry.engagementScore < 60
  ) {
    return { health: "At Risk", tone: "critical" };
  }

  if (
    entry.attritionRiskAvg >= 40 ||
    entry.burnoutRiskAvg >= 40 ||
    entry.engagementScore < 72
  ) {
    return { health: "Watch", tone: "warning" };
  }

  return { health: "Healthy", tone: "positive" };
}
