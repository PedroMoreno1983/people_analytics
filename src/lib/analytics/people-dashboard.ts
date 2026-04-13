import type { Prisma } from "@prisma/client";

import { addDays, endOfMonth, formatMonthKey, monthsDiff, startOfMonth } from "@/lib/analytics/date";
import { normalizeFivePointToPositivePercentage, riskBand } from "@/lib/analytics/scoring";
import { normalizeSurveyDimension } from "@/lib/analytics/survey";
import type { PeopleDashboard, PeopleDashboardPerson } from "@/lib/analytics/types";
import { prisma } from "@/lib/prisma";

type PeopleFilters = {
  location?: string;
  department?: string;
  age?: string;
};

type EmployeeRecord = Prisma.EmployeeGetPayload<{
  include: {
    department: true;
    manager: true;
    absences: true;
    performance: true;
    surveyResponses: {
      include: {
        survey: true;
      };
    };
    riskScores: true;
  };
}>;

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function roundTo(value: number, decimals = 1) {
  return Number(value.toFixed(decimals));
}

function fullName(employee: {
  firstName?: string | null;
  lastName?: string | null;
  externalCode?: string | null;
}) {
  const name = [employee.firstName, employee.lastName].filter(Boolean).join(" ").trim();

  if (name) {
    return name;
  }

  return employee.externalCode ?? "Persona sin nombre";
}

function employeeIsActiveOnDate(employee: EmployeeRecord, referenceDate: Date) {
  return (
    employee.hireDate <= referenceDate &&
    (!employee.terminationDate || employee.terminationDate > referenceDate)
  );
}

function matchesFilters(employee: EmployeeRecord, filters?: PeopleFilters) {
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

function getLatestSurveyScore(
  employee: EmployeeRecord,
  dimension: string,
  referenceDate: Date,
) {
  const normalizedDimension = normalizeSurveyDimension(dimension);

  const latestResponse = employee.surveyResponses
    .filter(
      (response) =>
        normalizeSurveyDimension(response.dimension) === normalizedDimension &&
        response.survey.createdAt <= referenceDate,
    )
    .sort(
      (left, right) => right.survey.createdAt.getTime() - left.survey.createdAt.getTime(),
    )[0];

  return latestResponse?.score;
}

function toneFromRisk(attritionRisk: number | null, burnoutRisk: number | null) {
  const score = Math.max(attritionRisk ?? 0, burnoutRisk ?? 0);

  if (score >= 60) {
    return "critical" as const;
  }

  if (score >= 35) {
    return "warning" as const;
  }

  if (score > 0) {
    return "positive" as const;
  }

  return "neutral" as const;
}

function formatTenureLabel(hireDate: Date, referenceDate: Date) {
  const totalMonths = Math.max(monthsDiff(hireDate, referenceDate), 0);

  if (totalMonths < 12) {
    return `${totalMonths} meses`;
  }

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  if (months === 0) {
    return `${years} ${years === 1 ? "año" : "años"}`;
  }

  return `${years} ${years === 1 ? "año" : "años"} ${months}m`;
}

function buildInsights(people: PeopleDashboardPerson[], companyName: string) {
  if (people.length === 0) {
    return [
      `No hay personas activas para leer en ${companyName} con el filtro actual.`,
    ];
  }

  const insights: string[] = [];
  const criticalCount = people.filter((person) => person.tone === "critical").length;
  const warningCount = people.filter((person) => person.tone === "warning").length;
  const lowEngagementPeople = people.filter(
    (person) => typeof person.engagementScore === "number" && person.engagementScore < 65,
  );
  const noScoreCount = people.filter((person) => person.latestScoreMonth == null).length;

  if (criticalCount > 0) {
    insights.push(
      `${criticalCount} personas aparecen con señales altas de salida o desgaste y conviene priorizar seguimiento con liderazgo.`,
    );
  }

  if (warningCount > 0) {
    insights.push(
      `${warningCount} personas están en zona de seguimiento. Aquí suele haber espacio para prevenir antes de que el riesgo escale.`,
    );
  }

  if (lowEngagementPeople.length > 0) {
    insights.push(
      `${lowEngagementPeople.length} personas muestran engagement bajo en la última lectura disponible.`,
    );
  }

  if (noScoreCount > 0) {
    insights.push(
      `${noScoreCount} personas activas todavía no tienen score reciente. La cobertura analítica aún puede crecer.`,
    );
  }

  if (insights.length === 0) {
    insights.push(
      "La foto actual no muestra alertas personales fuertes. Este es un buen momento para sostener cobertura y mirar tendencias por equipo.",
    );
  }

  return insights.slice(0, 4);
}

export async function getPeopleDashboard(
  companyId?: string,
  filters?: PeopleFilters,
): Promise<PeopleDashboard | null> {
  const company = companyId
    ? await prisma.company.findUnique({
        where: { id: companyId },
        select: {
          id: true,
          name: true,
        },
      })
    : await prisma.company.findFirst({
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          name: true,
        },
      });

  if (!company) {
    return null;
  }

  const [latestRiskScore, employees] = await Promise.all([
    prisma.employeeRiskScore.findFirst({
      where: {
        employee: {
          companyId: company.id,
        },
      },
      orderBy: {
        scoringDate: "desc",
      },
      select: {
        scoringDate: true,
      },
    }),
    prisma.employee.findMany({
      where: {
        companyId: company.id,
      },
      include: {
        department: true,
        manager: true,
        absences: true,
        performance: true,
        surveyResponses: {
          include: {
            survey: true,
          },
        },
        riskScores: true,
      },
      orderBy: [{ lastName: "asc" }, { firstName: "asc" }],
    }),
  ]);

  const latestMonthStart = latestRiskScore ? startOfMonth(latestRiskScore.scoringDate) : null;
  const referenceDate = latestMonthStart ? endOfMonth(latestMonthStart) : new Date();
  const windowStart = addDays(referenceDate, -90);

  const activeEmployees = employees.filter((employee) =>
    employeeIsActiveOnDate(employee, referenceDate),
  );
  const filteredEmployees = activeEmployees.filter((employee) =>
    matchesFilters(employee, filters),
  );

  const people = filteredEmployees
    .map<PeopleDashboardPerson>((employee) => {
      const latestEmployeeScore = [...employee.riskScores].sort(
        (left, right) => right.scoringDate.getTime() - left.scoringDate.getTime(),
      )[0];
      const latestPerformance = [...employee.performance].sort(
        (left, right) => right.reviewDate.getTime() - left.reviewDate.getTime(),
      )[0];
      const latestEngagementScore = getLatestSurveyScore(employee, "engagement", referenceDate);
      const absenceDays90 = employee.absences
        .filter((absence) => absence.date >= windowStart && absence.date <= referenceDate)
        .reduce((sum, absence) => sum + absence.days, 0);
      const attritionRisk = latestEmployeeScore ? roundTo(latestEmployeeScore.attritionRisk) : null;
      const burnoutRisk = latestEmployeeScore ? roundTo(latestEmployeeScore.burnoutRisk) : null;

      return {
        employeeId: employee.id,
        name: fullName(employee),
        departmentName: employee.department?.name ?? "Sin equipo",
        managerName: employee.manager ? fullName(employee.manager) : null,
        jobTitle: employee.jobTitle,
        location: employee.location,
        workMode: employee.workMode,
        ageBand: employee.ageBand,
        attritionRisk,
        burnoutRisk,
        engagementScore:
          latestEngagementScore == null
            ? null
            : roundTo(normalizeFivePointToPositivePercentage(latestEngagementScore)),
        performanceScore: latestPerformance ? roundTo(latestPerformance.score, 2) : null,
        absenceDays90,
        topDrivers: [
          latestEmployeeScore?.driver1,
          latestEmployeeScore?.driver2,
          latestEmployeeScore?.driver3,
        ].filter((value): value is string => Boolean(value)),
        tenureLabel: formatTenureLabel(employee.hireDate, referenceDate),
        latestScoreMonth: latestEmployeeScore
          ? formatMonthKey(startOfMonth(latestEmployeeScore.scoringDate))
          : null,
        tone: toneFromRisk(attritionRisk, burnoutRisk),
      };
    })
    .sort((left, right) => {
      const leftScore = Math.max(left.attritionRisk ?? 0, left.burnoutRisk ?? 0);
      const rightScore = Math.max(right.attritionRisk ?? 0, right.burnoutRisk ?? 0);

      if (leftScore !== rightScore) {
        return rightScore - leftScore;
      }

      return left.name.localeCompare(right.name);
    });

  const peopleWithScores = people.filter((person) => person.latestScoreMonth != null);
  const highAttritionCount = people.filter((person) => (person.attritionRisk ?? 0) >= 60).length;
  const highBurnoutCount = people.filter((person) => (person.burnoutRisk ?? 0) >= 60).length;
  const teamsRepresented = new Set(people.map((person) => person.departmentName)).size;
  const avgEngagementScore = roundTo(
    average(
      people
        .map((person) => person.engagementScore)
        .filter((value): value is number => typeof value === "number"),
    ),
  );

  const bandCounts = {
    Low: 0,
    Medium: 0,
    High: 0,
  };

  for (const person of peopleWithScores) {
    const dominantRisk = Math.max(person.attritionRisk ?? 0, person.burnoutRisk ?? 0);
    const band = riskBand(dominantRisk);

    if (band === "low") {
      bandCounts.Low += 1;
    } else if (band === "medium") {
      bandCounts.Medium += 1;
    } else {
      bandCounts.High += 1;
    }
  }

  const scoredCount = peopleWithScores.length || 1;

  return {
    companyId: company.id,
    companyName: company.name,
    latestMonth: latestMonthStart ? formatMonthKey(latestMonthStart) : null,
    headcount: people.length,
    peopleWithScores: peopleWithScores.length,
    teamsRepresented,
    highAttritionCount,
    highBurnoutCount,
    avgEngagementScore,
    riskDistribution: [
      {
        label: "Low",
        value: roundTo((bandCounts.Low / scoredCount) * 100, 0),
        tone: "positive",
      },
      {
        label: "Medium",
        value: roundTo((bandCounts.Medium / scoredCount) * 100, 0),
        tone: "warning",
      },
      {
        label: "High",
        value: roundTo((bandCounts.High / scoredCount) * 100, 0),
        tone: "critical",
      },
    ],
    insights: buildInsights(people, company.name),
    spotlight: people.slice(0, 6),
    people,
  };
}
