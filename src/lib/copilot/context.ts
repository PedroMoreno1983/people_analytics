import { getDepartmentDashboard } from "@/lib/analytics/department-summary";
import { getExecutiveSummary } from "@/lib/analytics/summary";
import type { DepartmentDashboard, ExecutiveSummary } from "@/lib/analytics/types";
import type { CopilotContext, CopilotReference, CopilotView } from "@/lib/copilot/types";

function percentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function priorityScore(tone: "positive" | "warning" | "critical") {
  if (tone === "critical") {
    return 2;
  }

  if (tone === "warning") {
    return 1;
  }

  return 0;
}

function describeChange(
  label: string,
  current: number | undefined,
  previous: number | undefined,
  format: (value: number) => string,
) {
  if (current === undefined) {
    return `${label}: sin datos suficientes.`;
  }

  if (previous === undefined || Math.abs(current - previous) < 0.01) {
    return `${label}: estable en ${format(current)}.`;
  }

  if (current > previous) {
    return `${label}: subio de ${format(previous)} a ${format(current)}.`;
  }

  return `${label}: bajo de ${format(previous)} a ${format(current)}.`;
}

function buildDashboardReferences(summary: ExecutiveSummary): CopilotReference[] {
  const priorityTeam = [...summary.departmentHealth].sort((left, right) => {
    const severityGap = priorityScore(right.tone) - priorityScore(left.tone);

    if (severityGap !== 0) {
      return severityGap;
    }

    return right.attritionRiskAvg - left.attritionRiskAvg;
  })[0];
  const highestBurnout = [...summary.departmentHealth].sort(
    (left, right) => right.burnoutRiskAvg - left.burnoutRiskAvg,
  )[0];
  const lowestEngagement = [...summary.departmentHealth].sort(
    (left, right) => left.engagementScore - right.engagementScore,
  )[0];
  const latestTurnover = summary.turnoverTrend.at(-1)?.turnoverRate;
  const previousTurnover = summary.turnoverTrend.at(-2)?.turnoverRate;
  const latestEngagement = summary.engagementTrend.at(-1)?.engagementScore;
  const previousEngagement = summary.engagementTrend.at(-2)?.engagementScore;
  const latestBurnout = summary.burnoutTrend.at(-1)?.burnoutRiskAvg;
  const previousBurnout = summary.burnoutTrend.at(-2)?.burnoutRiskAvg;

  return [
    {
      label: "Foto general",
      detail: `Empresa ${summary.companyName}. Ultimo corte ${summary.latestMonth ?? "sin fecha"}. KPIs clave: ${summary.kpis.map((item) => `${item.label} ${item.value}`).join(", ")}.`,
    },
    priorityTeam
      ? {
          label: `Prioridad: ${priorityTeam.name}`,
          detail: `Salida ${percentage(priorityTeam.turnoverRate)}, engagement ${priorityTeam.engagementScore.toFixed(0)}/100, desgaste ${priorityTeam.burnoutRiskAvg.toFixed(0)}/100 y riesgo de salida ${priorityTeam.attritionRiskAvg.toFixed(0)}/100.`,
        }
      : {
          label: "Prioridad",
          detail: "Todavía no hay un equipo priorizado en el corte actual.",
        },
    lowestEngagement
      ? {
          label: `Engagement: ${lowestEngagement.name}`,
          detail: `Es el equipo con menor engagement del corte con ${lowestEngagement.engagementScore.toFixed(0)}/100.`,
        }
      : {
          label: "Engagement",
          detail: "Todavía no hay suficiente detalle para comparar engagement entre equipos.",
        },
    highestBurnout
      ? {
          label: `Desgaste: ${highestBurnout.name}`,
          detail: `Es el mayor valor de desgaste del corte con ${highestBurnout.burnoutRiskAvg.toFixed(0)}/100.`,
        }
      : {
          label: "Desgaste",
          detail: "Todavía no hay suficiente detalle para comparar desgaste entre equipos.",
        },
    {
      label: "Tendencias recientes",
      detail: [
        describeChange("Salida real", latestTurnover, previousTurnover, percentage),
        describeChange("Engagement", latestEngagement, previousEngagement, (value) =>
          `${value.toFixed(0)}/100`,
        ),
        describeChange("Desgaste", latestBurnout, previousBurnout, (value) =>
          `${value.toFixed(0)}/100`,
        ),
      ].join(" "),
    },
    {
      label: "Insights del sistema",
      detail:
        summary.insights.length > 0
          ? summary.insights.join(" ")
          : "No hay insights calculados todavía para este corte.",
    },
  ];
}

function buildDashboardContext(summary: ExecutiveSummary | null, companyId?: string): CopilotContext {
  if (!summary || (summary.kpis.length === 0 && summary.departmentHealth.length === 0)) {
    return {
      view: "dashboard",
      viewLabel: "resumen ejecutivo",
      companyId,
      companyName: summary?.companyName ?? "DataWise",
      latestMonth: summary?.latestMonth ?? null,
      dataStatus: "empty",
      snapshot: [
        "Vista actual: resumen ejecutivo.",
        `Empresa: ${summary?.companyName ?? "sin empresa seleccionada"}.`,
        "No hay analytics listos para responder preguntas especificas.",
        "La siguiente acción recomendada es cargar datos y correr analytics para construir el resumen real.",
      ].join("\n"),
      references: [
        {
          label: "Sin datos analiticos",
          detail: "Todavía no hay un resumen ejecutivo cargado para esta empresa.",
        },
        {
          label: "Siguiente paso",
          detail: "Sube empleados, ausencias, performance o encuestas y vuelve a correr analytics.",
        },
      ],
      suggestedPrompts: [
        "Que necesito cargar primero para ver el dashboard?",
        "Como se lo explicarias a un gerente nuevo?",
        "Que debería revisar antes de mostrar esto?",
      ],
      summary,
      departmentDashboard: null,
    };
  }

  const references = buildDashboardReferences(summary);

  return {
    view: "dashboard",
    viewLabel: "resumen ejecutivo",
    companyId: summary.companyId,
    companyName: summary.companyName,
    latestMonth: summary.latestMonth,
    dataStatus: "ready",
    snapshot: [
      "Vista actual: resumen ejecutivo.",
      `Empresa: ${summary.companyName}.`,
      `Ultimo corte: ${summary.latestMonth ?? "sin fecha"}.`,
      `KPIs principales: ${summary.kpis.map((item) => `${item.label} ${item.value}`).join("; ")}.`,
      ...references.map((reference) => `${reference.label}: ${reference.detail}`),
    ].join("\n"),
    references,
    suggestedPrompts: [
      "Explicame que esta pasando aquí",
      "Por donde empezarías esta semana?",
      "Armame una conversación para managers",
    ],
    summary,
    departmentDashboard: null,
  };
}

function buildDepartmentsReferences(dashboard: DepartmentDashboard): CopilotReference[] {
  const strongestTeam = [...dashboard.departments]
    .sort((left, right) => {
      const severityGap = priorityScore(left.tone) - priorityScore(right.tone);

      if (severityGap !== 0) {
        return severityGap;
      }

      return right.engagementScore - left.engagementScore;
    })
    .at(0);

  return [
    {
      label: "Foto general",
      detail: `Empresa ${dashboard.companyName}. Equipos leídos: ${dashboard.departments.length}.`,
    },
    ...dashboard.departments.slice(0, 3).map((department, index) => ({
      label: `Prioridad ${index + 1}: ${department.name}`,
      detail: `Estado ${department.tone}. Personas ${department.headcount}. Salida ${percentage(department.turnoverRate)}, engagement ${department.engagementScore.toFixed(0)}/100, desgaste ${department.burnoutRiskAvg.toFixed(0)}/100. Factores: ${department.topDrivers.length > 0 ? department.topDrivers.join(", ") : "sin drivers dominantes"}.`,
    })),
    strongestTeam
      ? {
          label: `Equipo más estable: ${strongestTeam.name}`,
          detail: `Engagement ${strongestTeam.engagementScore.toFixed(0)}/100 y riesgo de salida ${strongestTeam.attritionRiskAvg.toFixed(0)}/100.`,
        }
      : {
          label: "Equipo estable",
          detail: "Todavía no hay un equipo de referencia claro.",
        },
  ];
}

function buildDepartmentsContext(
  dashboard: DepartmentDashboard | null,
  companyId?: string,
): CopilotContext {
  if (!dashboard || dashboard.departments.length === 0) {
    return {
      view: "departments",
      viewLabel: "vista por equipos",
      companyId,
      companyName: dashboard?.companyName ?? "DataWise",
      latestMonth: null,
      dataStatus: "empty",
      snapshot: [
        "Vista actual: equipos.",
        `Empresa: ${dashboard?.companyName ?? "sin empresa seleccionada"}.`,
        "No hay un tablero por equipos disponible todavía.",
        "La siguiente acción recomendada es correr analytics después de cargar datos base.",
      ].join("\n"),
      references: [
        {
          label: "Sin equipos cargados",
          detail: "Todavía no hay lectura por area para esta empresa.",
        },
        {
          label: "Siguiente paso",
          detail: "Carga empleados y alguna fuente complementaria para habilitar la vista por equipos.",
        },
      ],
      suggestedPrompts: [
        "Que datos necesito para comparar equipos?",
        "Cómo debería usar esta vista con liderazgo?",
        "Que acción tomarías antes de mostrarla?",
      ],
      summary: null,
      departmentDashboard: dashboard,
    };
  }

  const references = buildDepartmentsReferences(dashboard);
  const latestMonth = dashboard.departments[0]?.latestMonth ?? null;

  return {
    view: "departments",
    viewLabel: "vista por equipos",
    companyId: dashboard.companyId,
    companyName: dashboard.companyName,
    latestMonth,
    dataStatus: "ready",
    snapshot: [
      "Vista actual: equipos.",
      `Empresa: ${dashboard.companyName}.`,
      `Ultimo corte disponible: ${latestMonth ?? "sin fecha"}.`,
      ...references.map((reference) => `${reference.label}: ${reference.detail}`),
    ].join("\n"),
    references,
    suggestedPrompts: [
      "Explicame que equipo debería mirar primero",
      "Comparame las prioridades de esta vista",
      "Armame una conversación con el manager",
    ],
    summary: null,
    departmentDashboard: dashboard,
  };
}

function buildUploadContext(companyId?: string): CopilotContext {
  return {
    view: "upload",
    viewLabel: "carga de datos",
    companyId,
    companyName: "DataWise",
    latestMonth: null,
    dataStatus: "ready",
    snapshot: [
      "Vista actual: carga de datos.",
      "La pantalla tiene tres ideas clave: revisar archivo, confirmar columnas y guardar.",
      "El mejor orden para una primera carga es empleados primero, luego ausencias, performance y finalmente encuestas.",
      "Antes de guardar conviene verificar empresa, columnas obligatorias y vista previa.",
      "Si analytics falla después de importar, la app deja una advertencia pero conserva los datos guardados.",
    ].join("\n"),
    references: [
      {
        label: "Orden sugerido",
        detail: "Para una primera carga conviene empezar por empleados y después sumar ausencias, performance y encuestas.",
      },
      {
        label: "Paso 1",
        detail: "Primero se revisa el archivo y la plataforma muestra una vista previa.",
      },
      {
        label: "Paso 2",
        detail: "Después se confirman columnas y campos obligatorios antes de guardar.",
      },
      {
        label: "Guardado",
        detail: "Al guardar se importan los datos y luego se intenta actualizar analytics.",
      },
    ],
    suggestedPrompts: [
      "Que archivo conviene subir primero?",
      "Que debería revisar antes de guardar?",
      "Que hago si faltan columnas?",
    ],
    summary: null,
    departmentDashboard: null,
  };
}

export async function loadCopilotContext(
  view: CopilotView,
  companyId?: string,
): Promise<CopilotContext> {
  if (view === "dashboard") {
    return buildDashboardContext(await getExecutiveSummary(companyId), companyId);
  }

  if (view === "departments") {
    return buildDepartmentsContext(await getDepartmentDashboard(companyId), companyId);
  }

  return buildUploadContext(companyId);
}
