import { formatMonthKey, startOfMonth } from "@/lib/analytics/date";
import { getDepartmentHealth } from "@/lib/analytics/health";
import { riskBand } from "@/lib/analytics/scoring";
import type { ExecutiveSummary } from "@/lib/analytics/types";
import { prisma } from "@/lib/prisma";

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function percentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

export async function getExecutiveSummary(companyId?: string) {
  const company = companyId
    ? await prisma.company.findUnique({
        where: { id: companyId },
      })
    : await prisma.company.findFirst({
        orderBy: { createdAt: "asc" },
      });

  if (!company) {
    return null;
  }

  const monthlyMetrics = await prisma.teamMetricsMonthly.findMany({
    where: {
      department: {
        companyId: company.id,
      },
    },
    include: {
      department: true,
    },
    orderBy: {
      month: "asc",
    },
  });

  if (monthlyMetrics.length === 0) {
    return {
      companyId: company.id,
      companyName: company.name,
      latestMonth: null,
      kpis: [],
      departmentHealth: [],
      attritionDistribution: [],
      turnoverTrend: [],
      engagementTrend: [],
      burnoutTrend: [],
      insights: [],
    } satisfies ExecutiveSummary;
  }

  const latestMonth = monthlyMetrics[monthlyMetrics.length - 1]!.month;
  const latestMonthStart = startOfMonth(latestMonth);
  const latestEntries = monthlyMetrics.filter(
    (metric) => metric.month.getTime() === latestMonthStart.getTime(),
  );
  const latestScores = await prisma.employeeRiskScore.findMany({
    where: {
      employee: {
        companyId: company.id,
      },
      scoringDate: latestMonthStart,
    },
    include: {
      employee: {
        include: {
          department: true,
        },
      },
    },
  });

  const latestDepartmentHealth = latestEntries.map((entry) => ({
    departmentId: entry.departmentId,
    name: entry.department.name,
    ...getDepartmentHealth(entry),
    turnoverRate: entry.turnoverRate,
    absenteeismRate: entry.absenteeismRate,
    engagementScore: entry.engagementScore,
    burnoutRiskAvg: entry.burnoutRiskAvg,
    attritionRiskAvg: entry.attritionRiskAvg,
    headcount: entry.headcount,
  }));

  const attritionCounts = latestScores.reduce(
    (counts, score) => {
      const band = riskBand(score.attritionRisk);
      counts[band] += 1;
      return counts;
    },
    { low: 0, medium: 0, high: 0 },
  );
  const totalScores = Math.max(latestScores.length, 1);

  const companyMetricsByMonth = Array.from(
    monthlyMetrics.reduce((map, metric) => {
      const key = formatMonthKey(metric.month);
      const current = map.get(key) ?? [];
      current.push(metric);
      map.set(key, current);
      return map;
    }, new Map<string, typeof monthlyMetrics>()),
  ).map(([month, metrics]) => ({
    month,
    turnoverRate: average(metrics.map((metric) => metric.turnoverRate)),
    engagementScore: average(metrics.map((metric) => metric.engagementScore)),
    burnoutRiskAvg: average(metrics.map((metric) => metric.burnoutRiskAvg)),
  }));

  const companyAverageTurnover = average(
    latestEntries.map((entry) => entry.turnoverRate),
  );
  const highRiskByDepartment = latestScores.reduce((map, score) => {
    if (riskBand(score.attritionRisk) !== "high") {
      return map;
    }

    const departmentName = score.employee.department?.name ?? "Unassigned";
    map.set(departmentName, (map.get(departmentName) ?? 0) + 1);
    return map;
  }, new Map<string, number>());
  const highestConcentration = Array.from(highRiskByDepartment.entries()).sort(
    (left, right) => right[1] - left[1],
  )[0];
  const totalHighRisk = Array.from(highRiskByDepartment.values()).reduce(
    (sum, value) => sum + value,
    0,
  );

  const insights = latestDepartmentHealth
    .filter((department) => department.turnoverRate > companyAverageTurnover * 1.3)
    .map(
      (department) =>
        `Turnover is materially above company average in ${department.name}.`,
    );

  const burnoutTrend = companyMetricsByMonth.slice(-3).map((entry) => entry.burnoutRiskAvg);
  if (
    burnoutTrend.length === 3 &&
    burnoutTrend[0] < burnoutTrend[1] &&
    burnoutTrend[1] < burnoutTrend[2]
  ) {
    insights.push("Burnout risk has increased for three consecutive periods.");
  }

  const engagementTrend = companyMetricsByMonth.slice(-2).map((entry) => entry.engagementScore);
  if (engagementTrend.length === 2 && engagementTrend[0] > engagementTrend[1]) {
    insights.push("Engagement is declining in this department.");
  }

  if (
    highestConcentration &&
    totalHighRisk > 0 &&
    highestConcentration[1] / totalHighRisk > 0.4
  ) {
    insights.push(
      `Attrition risk is concentrated in ${highestConcentration[0]}.`,
    );
  }

  if (insights.length === 0) {
    insights.push("No material people-risk alerts were triggered in the latest scoring window.");
  }

  return {
    companyId: company.id,
    companyName: company.name,
    latestMonth: formatMonthKey(latestMonthStart),
    kpis: [
      {
        label: "Headcount",
        value: String(latestEntries.reduce((sum, entry) => sum + entry.headcount, 0)),
        tone: "positive",
        detail: "Active headcount at the latest scoring month.",
      },
      {
        label: "Turnover",
        value: percentage(average(latestEntries.map((entry) => entry.turnoverRate))),
        tone: companyAverageTurnover > 0.06 ? "critical" : companyAverageTurnover > 0.03 ? "warning" : "positive",
        detail: "Average department turnover in the latest scoring month.",
      },
      {
        label: "Absenteeism",
        value: percentage(average(latestEntries.map((entry) => entry.absenteeismRate))),
        tone: "neutral",
        detail: "Absence days over working-day capacity in the latest month.",
      },
      {
        label: "Engagement",
        value: `${average(latestEntries.map((entry) => entry.engagementScore)).toFixed(0)}/100`,
        tone: average(latestEntries.map((entry) => entry.engagementScore)) < 70 ? "warning" : "positive",
        detail: "Latest engagement score based on survey responses.",
      },
      {
        label: "Burnout Risk",
        value: `${average(latestEntries.map((entry) => entry.burnoutRiskAvg)).toFixed(0)}/100`,
        tone: average(latestEntries.map((entry) => entry.burnoutRiskAvg)) > 55 ? "critical" : average(latestEntries.map((entry) => entry.burnoutRiskAvg)) > 35 ? "warning" : "positive",
        detail: "Average burnout risk from the explainable Phase 3 model.",
      },
    ],
    departmentHealth: latestDepartmentHealth,
    attritionDistribution: [
      {
        label: "Low",
        value: Math.round((attritionCounts.low / totalScores) * 100),
        tone: "positive",
      },
      {
        label: "Medium",
        value: Math.round((attritionCounts.medium / totalScores) * 100),
        tone: "warning",
      },
      {
        label: "High",
        value: Math.round((attritionCounts.high / totalScores) * 100),
        tone: "critical",
      },
    ],
    turnoverTrend: companyMetricsByMonth.slice(-6).map((entry) => ({
      month: entry.month,
      turnoverRate: Number(entry.turnoverRate.toFixed(4)),
    })),
    engagementTrend: companyMetricsByMonth.slice(-6).map((entry) => ({
      month: entry.month,
      engagementScore: Number(entry.engagementScore.toFixed(2)),
    })),
    burnoutTrend: companyMetricsByMonth.slice(-6).map((entry) => ({
      month: entry.month,
      burnoutRiskAvg: Number(entry.burnoutRiskAvg.toFixed(2)),
    })),
    insights,
  } satisfies ExecutiveSummary;
}
