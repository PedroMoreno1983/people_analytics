import type { Prisma } from "@prisma/client";

import {
  endOfMonth,
  formatMonthKey,
  isWithinMonth,
  startOfMonth,
} from "@/lib/analytics/date";
import { getDepartmentHealth } from "@/lib/analytics/health";
import {
  normalizeFivePointToPositivePercentage,
  riskBand,
} from "@/lib/analytics/scoring";
import { normalizeSurveyDimension } from "@/lib/analytics/survey";
import type { ExecutiveSummary } from "@/lib/analytics/types";
import { prisma } from "@/lib/prisma";
import { isDemoModeEnabled } from "@/lib/validations/env";

type SummaryFilters = {
  location?: string;
  department?: string;
  age?: string;
};

type EmployeeRecord = Prisma.EmployeeGetPayload<{
  include: {
    department: true;
    absences: true;
    riskScores: true;
    surveyResponses: {
      include: {
        survey: true;
      };
    };
  };
}>;

type MonthlyMetricRecord = Prisma.TeamMetricsMonthlyGetPayload<{
  include: {
    department: true;
  };
}>;

type SnapshotMetric = {
  headcount: number;
  turnoverRate: number;
  absenteeismRate: number;
  engagementScore: number;
  burnoutRiskAvg: number;
  attritionRiskAvg: number;
  scores: Array<{
    attritionRisk: number;
    burnoutRisk: number;
  }>;
};

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundTo(value: number, decimals = 2) {
  return Number(value.toFixed(decimals));
}

function percentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function employeeIsActiveAtMonthEnd(employee: EmployeeRecord, monthEnd: Date) {
  return (
    employee.hireDate <= monthEnd &&
    (!employee.terminationDate || employee.terminationDate > monthEnd)
  );
}

function employeeIsActiveAtMonthStart(
  employee: EmployeeRecord,
  monthStart: Date
) {
  return (
    employee.hireDate < monthStart &&
    (!employee.terminationDate || employee.terminationDate >= monthStart)
  );
}

function employeeExistsDuringMonth(
  employee: EmployeeRecord,
  monthStart: Date,
  monthEnd: Date
) {
  return (
    employee.hireDate <= monthEnd &&
    (!employee.terminationDate || employee.terminationDate >= monthStart)
  );
}

function getLatestSurveyScore(
  employee: EmployeeRecord,
  dimension: string,
  monthEnd: Date
) {
  const normalizedDimension = normalizeSurveyDimension(dimension);

  const latestResponse = employee.surveyResponses
    .filter(
      (response) =>
        normalizeSurveyDimension(response.dimension) === normalizedDimension &&
        response.survey.createdAt <= monthEnd
    )
    .sort(
      (left, right) =>
        right.survey.createdAt.getTime() - left.survey.createdAt.getTime()
    )[0];

  return latestResponse?.score;
}

function matchesFilters(employee: EmployeeRecord, filters?: SummaryFilters) {
  if (filters?.department && employee.department?.name !== filters.department) {
    return false;
  }

  if (filters?.location && employee.location !== filters.location) {
    return false;
  }

  if (filters?.age && employee.ageBand !== filters.age) {
    return false;
  }

  return true;
}

function getMetricMonths(monthlyMetrics: MonthlyMetricRecord[]) {
  return Array.from(
    new Set(
      monthlyMetrics.map((metric) => startOfMonth(metric.month).getTime())
    )
  )
    .sort((left, right) => left - right)
    .map((value) => new Date(value));
}

function buildSnapshotMetric(
  employees: EmployeeRecord[],
  monthStart: Date
): SnapshotMetric {
  const monthEnd = endOfMonth(monthStart);
  const activeAtEnd = employees.filter((employee) =>
    employeeIsActiveAtMonthEnd(employee, monthEnd)
  );
  const activeAtStart = employees.filter((employee) =>
    employeeIsActiveAtMonthStart(employee, monthStart)
  );
  const terminationsDuringMonth = employees.filter(
    (employee) =>
      employee.terminationDate && isWithinMonth(employee.terminationDate, monthStart)
  ).length;
  const absenceDaysDuringMonth = employees
    .filter((employee) => employeeExistsDuringMonth(employee, monthStart, monthEnd))
    .flatMap((employee) => employee.absences)
    .filter((absence) => isWithinMonth(absence.date, monthStart))
    .reduce((sum, absence) => sum + absence.days, 0);
  const engagementValues = activeAtEnd.map((employee) =>
    normalizeFivePointToPositivePercentage(
      getLatestSurveyScore(employee, "engagement", monthEnd)
    )
  );
  const scores = activeAtEnd
    .map((employee) =>
      employee.riskScores.find(
        (score) => startOfMonth(score.scoringDate).getTime() === monthStart.getTime()
      )
    )
    .filter((score): score is NonNullable<typeof score> => Boolean(score))
    .map((score) => ({
      attritionRisk: score.attritionRisk,
      burnoutRisk: score.burnoutRisk,
    }));

  return {
    headcount: activeAtEnd.length,
    turnoverRate:
      activeAtStart.length > 0
        ? roundTo(terminationsDuringMonth / activeAtStart.length, 4)
        : 0,
    absenteeismRate:
      activeAtEnd.length > 0
        ? roundTo(absenceDaysDuringMonth / (activeAtEnd.length * 22), 4)
        : 0,
    engagementScore: roundTo(average(engagementValues)),
    burnoutRiskAvg: roundTo(average(scores.map((score) => score.burnoutRisk))),
    attritionRiskAvg: roundTo(
      average(scores.map((score) => score.attritionRisk))
    ),
    scores,
  };
}

function buildDepartmentHealth(
  employees: EmployeeRecord[],
  latestMonthStart: Date
): ExecutiveSummary["departmentHealth"] {
  type DepartmentHealthRow = ExecutiveSummary["departmentHealth"][number];
  const grouped = new Map<
    string,
    {
      departmentId: string;
      name: string;
      employees: EmployeeRecord[];
    }
  >();

  for (const employee of employees) {
    const departmentId = employee.department?.id ?? "unassigned";
    const departmentName = employee.department?.name ?? "Sin asignar";
    const current = grouped.get(departmentId);

    if (current) {
      current.employees.push(employee);
      continue;
    }

    grouped.set(departmentId, {
      departmentId,
      name: departmentName,
      employees: [employee],
    });
  }

  return Array.from(grouped.values())
    .map((group) => {
      const snapshot = buildSnapshotMetric(group.employees, latestMonthStart);

      if (snapshot.headcount === 0 && snapshot.scores.length === 0) {
        return null;
      }

      return {
        departmentId: group.departmentId,
        name: group.name,
        ...getDepartmentHealth(snapshot),
        turnoverRate: snapshot.turnoverRate,
        absenteeismRate: snapshot.absenteeismRate,
        engagementScore: snapshot.engagementScore,
        burnoutRiskAvg: snapshot.burnoutRiskAvg,
        attritionRiskAvg: snapshot.attritionRiskAvg,
        headcount: snapshot.headcount,
      };
    })
    .filter((department): department is DepartmentHealthRow => Boolean(department))
    .sort((left, right) => {
      const leftSeverity =
        left.tone === "critical" ? 2 : left.tone === "warning" ? 1 : 0;
      const rightSeverity =
        right.tone === "critical" ? 2 : right.tone === "warning" ? 1 : 0;

      if (leftSeverity !== rightSeverity) {
        return rightSeverity - leftSeverity;
      }

      return right.attritionRiskAvg - left.attritionRiskAvg;
    });
}

function buildInsights(
  departmentHealth: ExecutiveSummary["departmentHealth"],
  turnoverTrend: ExecutiveSummary["turnoverTrend"],
  engagementTrend: ExecutiveSummary["engagementTrend"],
  burnoutTrend: ExecutiveSummary["burnoutTrend"]
) {
  if (departmentHealth.length === 0) {
    return [
      "No hay suficientes personas dentro del filtro actual para construir una lectura confiable.",
    ];
  }

  const insights: string[] = [];
  const companyAverageTurnover = average(
    departmentHealth.map((department) => department.turnoverRate)
  );

  departmentHealth
    .filter((department) => department.turnoverRate > companyAverageTurnover * 1.3)
    .forEach((department) => {
      insights.push(
        `La salida está materialmente por encima del promedio del corte en ${department.name}.`
      );
    });

  const recentBurnout = burnoutTrend.slice(-3).map((entry) => entry.burnoutRiskAvg);
  if (
    recentBurnout.length === 3 &&
    recentBurnout[0] < recentBurnout[1] &&
    recentBurnout[1] < recentBurnout[2]
  ) {
    insights.push(
      "Las señales de desgaste vienen subiendo de forma sostenida en los últimos cortes."
    );
  }

  const recentEngagement = engagementTrend
    .slice(-2)
    .map((entry) => entry.engagementScore);
  if (
    recentEngagement.length === 2 &&
    recentEngagement[0] > recentEngagement[1]
  ) {
    insights.push(
      "El engagement viene cayendo frente al corte anterior y conviene revisar escucha y liderazgo."
    );
  }

  const highestRiskDepartment = [...departmentHealth].sort(
    (left, right) => right.attritionRiskAvg - left.attritionRiskAvg
  )[0];

  if (highestRiskDepartment && highestRiskDepartment.attritionRiskAvg >= 55) {
    insights.push(
      `El riesgo de salida se está concentrando en ${highestRiskDepartment.name}.`
    );
  }

  if (insights.length === 0) {
    insights.push(
      "No se activaron alertas materiales en este corte. La oportunidad está en sostener lo que hoy funciona."
    );
  }

  return insights;
}

function buildEmptySummary(
  companyId: string,
  companyName: string,
  latestMonth: Date | null,
  message: string
): ExecutiveSummary {
  return {
    companyId,
    companyName,
    latestMonth: latestMonth ? formatMonthKey(latestMonth) : null,
    kpis: [],
    departmentHealth: [],
    attritionDistribution: [],
    turnoverTrend: [],
    engagementTrend: [],
    burnoutTrend: [],
    insights: [message],
  };
}

function getDemoExecutiveSummary(filters?: SummaryFilters): ExecutiveSummary {
  let departments = [
    {
      departmentId: "d1",
      name: "Ventas",
      health: "En riesgo",
      tone: "critical" as const,
      turnoverRate: 0.08,
      absenteeismRate: 0.03,
      engagementScore: 62,
      burnoutRiskAvg: 49,
      attritionRiskAvg: 68,
      headcount: 45,
    },
    {
      departmentId: "d2",
      name: "Ingeniería",
      health: "Saludable",
      tone: "positive" as const,
      turnoverRate: 0.02,
      absenteeismRate: 0.01,
      engagementScore: 81,
      burnoutRiskAvg: 28,
      attritionRiskAvg: 22,
      headcount: 72,
    },
    {
      departmentId: "d3",
      name: "Operaciones",
      health: "Seguimiento",
      tone: "warning" as const,
      turnoverRate: 0.05,
      absenteeismRate: 0.025,
      engagementScore: 67,
      burnoutRiskAvg: 41,
      attritionRiskAvg: 45,
      headcount: 38,
    },
    {
      departmentId: "d4",
      name: "People Ops",
      health: "Saludable",
      tone: "positive" as const,
      turnoverRate: 0.02,
      absenteeismRate: 0.01,
      engagementScore: 79,
      burnoutRiskAvg: 24,
      attritionRiskAvg: 18,
      headcount: 22,
    },
  ];

  if (filters?.department) {
    departments = departments.filter(
      (department) => department.name === filters.department
    );
  }

  return {
    companyId: "demo",
    companyName: "Acme Corp (Demo)",
    latestMonth: "2026-02",
    isDemo: true,
    kpis: [
      {
        label: "Headcount",
        value: "248",
        tone: "positive",
        detail: "Personas activas en el último período analítico.",
      },
      {
        label: "Turnover",
        value: "4.8%",
        tone: "warning",
        detail: "Salida promedio por equipo en el último mes analizado.",
      },
      {
        label: "Absenteeism",
        value: "2.3%",
        tone: "neutral",
        detail: "Días de ausencia sobre la capacidad laboral disponible.",
      },
      {
        label: "Engagement",
        value: "71/100",
        tone: "positive",
        detail: "Calculado a partir de respuestas de encuestas de personas.",
      },
      {
        label: "Burnout Risk",
        value: "42/100",
        tone: "warning",
        detail: "Promedio de riesgo de desgaste según el scoring explicable.",
      },
    ],
    departmentHealth: departments,
    attritionDistribution: [
      { label: "Low", value: 55, tone: "positive" },
      { label: "Medium", value: 31, tone: "warning" },
      { label: "High", value: 14, tone: "critical" },
    ],
    turnoverTrend: [
      { month: "2025-09", turnoverRate: 0.042 },
      { month: "2025-10", turnoverRate: 0.051 },
      { month: "2025-11", turnoverRate: 0.048 },
      { month: "2025-12", turnoverRate: 0.055 },
      { month: "2026-01", turnoverRate: 0.05 },
      { month: "2026-02", turnoverRate: 0.048 },
    ],
    engagementTrend: [
      { month: "2025-09", engagementScore: 74 },
      { month: "2025-10", engagementScore: 72 },
      { month: "2025-11", engagementScore: 71 },
      { month: "2025-12", engagementScore: 69 },
      { month: "2026-01", engagementScore: 70 },
      { month: "2026-02", engagementScore: 71 },
    ],
    burnoutTrend: [
      { month: "2025-09", burnoutRiskAvg: 36 },
      { month: "2025-10", burnoutRiskAvg: 38 },
      { month: "2025-11", burnoutRiskAvg: 40 },
      { month: "2025-12", burnoutRiskAvg: 43 },
      { month: "2026-01", burnoutRiskAvg: 42 },
      { month: "2026-02", burnoutRiskAvg: 42 },
    ],
    insights: [
      "La salida está materialmente por encima del promedio de la empresa en Ventas.",
      "El riesgo de desgaste ha subido durante tres períodos consecutivos.",
      "Ingeniería es el equipo de referencia en engagement y retención.",
    ],
  };
}

async function getExecutiveSummaryFromDb(
  companyId?: string,
  filters?: SummaryFilters
): Promise<ExecutiveSummary | null> {
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

  const [monthlyMetrics, employees] = await Promise.all([
    prisma.teamMetricsMonthly.findMany({
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
    }),
    prisma.employee.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        department: true,
        absences: true,
        riskScores: true,
        surveyResponses: {
          include: {
            survey: true,
          },
        },
      },
    }),
  ]);

  const metricMonths = getMetricMonths(monthlyMetrics);
  const latestMonth = metricMonths.at(-1) ?? null;

  if (metricMonths.length === 0) {
    return buildEmptySummary(
      company.id,
      company.name,
      latestMonth,
      "Todavía no hay analytics calculados para esta empresa."
    );
  }

  const filteredEmployees = employees.filter((employee) =>
    matchesFilters(employee, filters)
  );

  if (filteredEmployees.length === 0) {
    return buildEmptySummary(
      company.id,
      company.name,
      latestMonth,
      "No hay personas que coincidan con los filtros actuales."
    );
  }

  const trendMetrics = metricMonths.slice(-6).map((month) => ({
    month,
    snapshot: buildSnapshotMetric(filteredEmployees, month),
  }));
  const latestMonthStart = trendMetrics.at(-1)?.month ?? latestMonth;

  if (!latestMonthStart) {
    return buildEmptySummary(
      company.id,
      company.name,
      latestMonth,
      "No encontramos un corte válido para construir el resumen."
    );
  }

  const latestSnapshot = trendMetrics.at(-1)?.snapshot;

  if (!latestSnapshot) {
    return buildEmptySummary(
      company.id,
      company.name,
      latestMonthStart,
      "No encontramos métricas suficientes para el último corte."
    );
  }

  const departmentHealth = buildDepartmentHealth(filteredEmployees, latestMonthStart);
  const totalScores = Math.max(latestSnapshot.scores.length, 1);
  const attritionCounts = latestSnapshot.scores.reduce(
    (counts, score) => {
      const band = riskBand(score.attritionRisk);
      counts[band] += 1;
      return counts;
    },
    { low: 0, medium: 0, high: 0 }
  );
  const turnoverTrend = trendMetrics.map(({ month, snapshot }) => ({
    month: formatMonthKey(month),
    turnoverRate: snapshot.turnoverRate,
  }));
  const engagementTrend = trendMetrics.map(({ month, snapshot }) => ({
    month: formatMonthKey(month),
    engagementScore: snapshot.engagementScore,
  }));
  const burnoutTrend = trendMetrics.map(({ month, snapshot }) => ({
    month: formatMonthKey(month),
    burnoutRiskAvg: snapshot.burnoutRiskAvg,
  }));
  const insights = buildInsights(
    departmentHealth,
    turnoverTrend,
    engagementTrend,
    burnoutTrend
  );

  return {
    companyId: company.id,
    companyName: company.name,
    latestMonth: formatMonthKey(latestMonthStart),
    kpis: [
      {
        label: "Headcount",
        value: String(latestSnapshot.headcount),
        tone: "positive",
        detail: "Personas activas dentro del filtro seleccionado.",
      },
      {
        label: "Turnover",
        value: percentage(latestSnapshot.turnoverRate),
        tone:
          latestSnapshot.turnoverRate > 0.06
            ? "critical"
            : latestSnapshot.turnoverRate > 0.03
              ? "warning"
              : "positive",
        detail: "Salida real observada en el último corte filtrado.",
      },
      {
        label: "Absenteeism",
        value: percentage(latestSnapshot.absenteeismRate),
        tone: "neutral",
        detail: "Días de ausencia sobre la capacidad laboral del corte.",
      },
      {
        label: "Engagement",
        value: `${latestSnapshot.engagementScore.toFixed(0)}/100`,
        tone: latestSnapshot.engagementScore < 70 ? "warning" : "positive",
        detail: "Lectura de engagement para las personas dentro del filtro.",
      },
      {
        label: "Burnout Risk",
        value: `${latestSnapshot.burnoutRiskAvg.toFixed(0)}/100`,
        tone:
          latestSnapshot.burnoutRiskAvg > 55
            ? "critical"
            : latestSnapshot.burnoutRiskAvg > 35
              ? "warning"
              : "positive",
        detail: "Promedio de señales de desgaste para este recorte.",
      },
    ],
    departmentHealth,
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
    turnoverTrend,
    engagementTrend,
    burnoutTrend,
    insights,
  };
}

export async function getExecutiveSummary(
  companyId?: string,
  filters?: SummaryFilters
) {
  try {
    const summary = await getExecutiveSummaryFromDb(companyId, filters);

    if (!summary && isDemoModeEnabled()) {
      return getDemoExecutiveSummary(filters);
    }

    return summary;
  } catch (error) {
    if (isDemoModeEnabled()) {
      return getDemoExecutiveSummary(filters);
    }

    throw error;
  }
}
