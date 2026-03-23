import { formatMonthKey, startOfMonth } from "@/lib/analytics/date";
import { getDepartmentHealth } from "@/lib/analytics/health";
import { riskBand } from "@/lib/analytics/scoring";
import type { DepartmentDashboard } from "@/lib/analytics/types";
import { prisma } from "@/lib/prisma";

export async function getDepartmentDashboard(companyId?: string): Promise<DepartmentDashboard | null> {
  try {
    return await getDepartmentDashboardFromDB(companyId);
  } catch {
    return getDemoDepartmentDashboard();
  }
}

function getDemoDepartmentDashboard(): DepartmentDashboard {
  const months = ["2025-09", "2025-10", "2025-11", "2025-12", "2026-01", "2026-02"];
  const makeTrends = (base: { t: number; e: number; b: number; a: number }) =>
    months.map((month, i) => ({
      month,
      turnoverRate: Number((base.t + i * 0.002).toFixed(4)),
      engagementScore: Number((base.e - i * 0.3).toFixed(2)),
      burnoutRiskAvg: Number((base.b + i * 0.5).toFixed(2)),
      attritionRiskAvg: Number((base.a + i * 0.8).toFixed(2)),
      headcount: 40,
    }));

  return {
    companyId: "demo",
    companyName: "Acme Corp (Demo)",
    departments: [
      {
        departmentId: "d1", name: "Ventas", latestMonth: "2026-02",
        health: "En Riesgo", tone: "critical",
        headcount: 45, turnoverRate: 0.08, absenteeismRate: 0.03,
        engagementScore: 62, burnoutRiskAvg: 49, attritionRiskAvg: 68,
        topDrivers: ["Alta rotación", "Burnout elevado", "Bajo engagement"],
        trends: makeTrends({ t: 0.06, e: 65, b: 42, a: 55 }),
        insights: ["La rotación está materialmente por encima del promedio de la empresa.", "2 empleados están en riesgo alto de rotación en el último mes de scoring."],
      },
      {
        departmentId: "d3", name: "Operaciones", latestMonth: "2026-02",
        health: "En Alerta", tone: "warning",
        headcount: 38, turnoverRate: 0.05, absenteeismRate: 0.025,
        engagementScore: 67, burnoutRiskAvg: 41, attritionRiskAvg: 45,
        topDrivers: ["Ausentismo elevado", "Engagement bajo"],
        trends: makeTrends({ t: 0.04, e: 70, b: 36, a: 38 }),
        insights: ["El engagement de Operaciones está por debajo del umbral ejecutivo."],
      },
      {
        departmentId: "d6", name: "Finanzas", latestMonth: "2026-02",
        health: "En Alerta", tone: "warning",
        headcount: 20, turnoverRate: 0.045, absenteeismRate: 0.02,
        engagementScore: 69, burnoutRiskAvg: 38, attritionRiskAvg: 41,
        topDrivers: ["Carga de trabajo"],
        trends: makeTrends({ t: 0.035, e: 72, b: 33, a: 35 }),
        insights: ["Finanzas no presenta alertas críticas pero merece seguimiento."],
      },
      {
        departmentId: "d7", name: "Marketing", latestMonth: "2026-02",
        health: "Estable", tone: "positive",
        headcount: 20, turnoverRate: 0.035, absenteeismRate: 0.018,
        engagementScore: 73, burnoutRiskAvg: 35, attritionRiskAvg: 33,
        topDrivers: [],
        trends: makeTrends({ t: 0.03, e: 74, b: 32, a: 30 }),
        insights: ["Marketing no presenta alertas agudas en el último mes de scoring."],
      },
      {
        departmentId: "d5", name: "Producto", latestMonth: "2026-02",
        health: "Estable", tone: "positive",
        headcount: 31, turnoverRate: 0.03, absenteeismRate: 0.015,
        engagementScore: 75, burnoutRiskAvg: 32, attritionRiskAvg: 30,
        topDrivers: [],
        trends: makeTrends({ t: 0.025, e: 76, b: 29, a: 27 }),
        insights: ["Producto no presenta alertas agudas en el último mes de scoring."],
      },
      {
        departmentId: "d4", name: "People Ops", latestMonth: "2026-02",
        health: "Saludable", tone: "positive",
        headcount: 22, turnoverRate: 0.02, absenteeismRate: 0.01,
        engagementScore: 79, burnoutRiskAvg: 24, attritionRiskAvg: 18,
        topDrivers: [],
        trends: makeTrends({ t: 0.018, e: 80, b: 22, a: 16 }),
        insights: ["People Ops es el equipo de referencia para engagement y retención."],
      },
      {
        departmentId: "d2", name: "Ingeniería", latestMonth: "2026-02",
        health: "Saludable", tone: "positive",
        headcount: 72, turnoverRate: 0.02, absenteeismRate: 0.01,
        engagementScore: 81, burnoutRiskAvg: 28, attritionRiskAvg: 22,
        topDrivers: [],
        trends: makeTrends({ t: 0.018, e: 82, b: 25, a: 20 }),
        insights: ["Ingeniería no presenta alertas agudas en el último mes de scoring."],
      },
    ],
  };
}

async function getDepartmentDashboardFromDB(companyId?: string) {
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

  const departmentMetrics = await prisma.teamMetricsMonthly.findMany({
    where: {
      department: {
        companyId: company.id,
      },
    },
    include: {
      department: true,
    },
    orderBy: [{ department: { name: "asc" } }, { month: "asc" }],
  });

  const departmentIds = Array.from(
    new Set(departmentMetrics.map((metric) => metric.departmentId)),
  );

  const latestMonthByDepartment = new Map<string, Date>();
  for (const metric of departmentMetrics) {
    const currentLatest = latestMonthByDepartment.get(metric.departmentId);

    if (!currentLatest || metric.month > currentLatest) {
      latestMonthByDepartment.set(metric.departmentId, startOfMonth(metric.month));
    }
  }

  const employeeScores = await prisma.employeeRiskScore.findMany({
    where: {
      employee: {
        companyId: company.id,
        departmentId: {
          in: departmentIds,
        },
      },
    },
    include: {
      employee: {
        include: {
          department: true,
        },
      },
    },
    orderBy: [{ scoringDate: "desc" }],
  });

  const dashboard = {
    companyId: company.id,
    companyName: company.name,
    departments: departmentIds
      .map((departmentId) => {
        const metrics = departmentMetrics.filter(
          (metric) => metric.departmentId === departmentId,
        );
        const latestMonth = latestMonthByDepartment.get(departmentId) ?? null;
        const latestMetric = latestMonth
          ? metrics.find(
              (metric) => metric.month.getTime() === latestMonth.getTime(),
            ) ?? null
          : null;

        if (!latestMetric) {
          return null;
        }

        const latestScores = employeeScores.filter(
          (score) =>
            score.employee.departmentId === departmentId &&
            score.scoringDate.getTime() === latestMetric.month.getTime(),
        );
        const driverCounts = latestScores.reduce((map, score) => {
          [score.driver1, score.driver2, score.driver3]
            .filter((driver): driver is string => Boolean(driver))
            .forEach((driver) => {
              map.set(driver, (map.get(driver) ?? 0) + 1);
            });
          return map;
        }, new Map<string, number>());
        const topDrivers = Array.from(driverCounts.entries())
          .sort((left, right) => right[1] - left[1])
          .slice(0, 3)
          .map(([driver]) => driver);
        const highRiskCount = latestScores.filter(
          (score) => riskBand(score.attritionRisk) === "high",
        ).length;
        const health = getDepartmentHealth(latestMetric);
        const insights = [
          latestMetric.turnoverRate > 0.06
            ? `La rotación está materialmente elevada en ${latestMetric.department.name}.`
            : null,
          latestMetric.engagementScore < 70
            ? `El engagement de ${latestMetric.department.name} está por debajo del umbral ejecutivo.`
            : null,
          highRiskCount > 0
            ? `${highRiskCount} empleados están en riesgo alto de rotación en el último mes de scoring.`
            : null,
        ].filter((value): value is string => Boolean(value));

        if (insights.length === 0) {
          insights.push(
            `${latestMetric.department.name} no presenta alertas agudas en el último mes de scoring.`,
          );
        }

        return {
          departmentId,
          name: latestMetric.department.name,
          latestMonth: formatMonthKey(latestMetric.month),
          ...health,
          headcount: latestMetric.headcount,
          turnoverRate: latestMetric.turnoverRate,
          absenteeismRate: latestMetric.absenteeismRate,
          engagementScore: latestMetric.engagementScore,
          burnoutRiskAvg: latestMetric.burnoutRiskAvg,
          attritionRiskAvg: latestMetric.attritionRiskAvg,
          topDrivers,
          trends: metrics.slice(-6).map((metric) => ({
            month: formatMonthKey(metric.month),
            turnoverRate: Number(metric.turnoverRate.toFixed(4)),
            engagementScore: Number(metric.engagementScore.toFixed(2)),
            burnoutRiskAvg: Number(metric.burnoutRiskAvg.toFixed(2)),
            attritionRiskAvg: Number(metric.attritionRiskAvg.toFixed(2)),
            headcount: metric.headcount,
          })),
          insights,
        };
      })
      .filter((department): department is NonNullable<typeof department> => Boolean(department))
      .sort((left, right) => {
        const leftSeverity = left.tone === "critical" ? 2 : left.tone === "warning" ? 1 : 0;
        const rightSeverity = right.tone === "critical" ? 2 : right.tone === "warning" ? 1 : 0;

        if (leftSeverity !== rightSeverity) {
          return rightSeverity - leftSeverity;
        }

        return right.attritionRiskAvg - left.attritionRiskAvg;
      }),
  } satisfies DepartmentDashboard;

  return dashboard;
}

