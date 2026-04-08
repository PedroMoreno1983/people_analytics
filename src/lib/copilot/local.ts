import type { CopilotContext, CopilotReference } from "@/lib/copilot/types";

type TeamSnapshot = {
  name: string;
  tone: "positive" | "warning" | "critical";
  headcount: number;
  turnoverRate: number;
  engagementScore: number;
  burnoutRiskAvg: number;
  attritionRiskAvg: number;
  topDrivers: string[];
  insights: string[];
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function percentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function priorityScore(tone: TeamSnapshot["tone"]) {
  if (tone === "critical") {
    return 2;
  }

  if (tone === "warning") {
    return 1;
  }

  return 0;
}

function includesAny(question: string, candidates: string[]) {
  return candidates.some((candidate) => question.includes(candidate));
}

function getTeams(context: CopilotContext): TeamSnapshot[] {
  if (context.departmentDashboard) {
    return context.departmentDashboard.departments.map((department) => ({
      name: department.name,
      tone: department.tone,
      headcount: department.headcount,
      turnoverRate: department.turnoverRate,
      engagementScore: department.engagementScore,
      burnoutRiskAvg: department.burnoutRiskAvg,
      attritionRiskAvg: department.attritionRiskAvg,
      topDrivers: department.topDrivers,
      insights: department.insights,
    }));
  }

  if (context.summary) {
    return context.summary.departmentHealth.map((department) => ({
      name: department.name,
      tone: department.tone,
      headcount: department.headcount,
      turnoverRate: department.turnoverRate,
      engagementScore: department.engagementScore,
      burnoutRiskAvg: department.burnoutRiskAvg,
      attritionRiskAvg: department.attritionRiskAvg,
      topDrivers: [],
      insights: [department.health],
    }));
  }

  return [];
}

function getPriorityTeam(teams: TeamSnapshot[]) {
  return [...teams].sort((left, right) => {
    const severityGap = priorityScore(right.tone) - priorityScore(left.tone);

    if (severityGap !== 0) {
      return severityGap;
    }

    return right.attritionRiskAvg - left.attritionRiskAvg;
  })[0];
}

function getLowestEngagementTeam(teams: TeamSnapshot[]) {
  return [...teams].sort((left, right) => left.engagementScore - right.engagementScore)[0];
}

function getHighestBurnoutTeam(teams: TeamSnapshot[]) {
  return [...teams].sort((left, right) => right.burnoutRiskAvg - left.burnoutRiskAvg)[0];
}

function getMostStableTeam(teams: TeamSnapshot[]) {
  return [...teams].sort((left, right) => {
    const severityGap = priorityScore(left.tone) - priorityScore(right.tone);

    if (severityGap !== 0) {
      return severityGap;
    }

    return right.engagementScore - left.engagementScore;
  })[0];
}

function findTeamByQuestion(question: string, teams: TeamSnapshot[]) {
  const normalizedQuestion = normalizeText(question);

  return teams.find((team) => {
    const normalizedName = normalizeText(team.name);

    if (normalizedQuestion.includes(normalizedName)) {
      return true;
    }

    return normalizedName
      .split(/\s+/)
      .filter((token) => token.length >= 4)
      .some((token) => normalizedQuestion.includes(token));
  });
}

function answerUploadQuestion(question: string) {
  if (includesAny(question, ["columna", "columnas", "map", "mapeo"])) {
    return "Primero revisaria el archivo para ver la vista previa y asegurarme de que las columnas vienen limpias. Después relacionaria todas las obligatorias y, si algo importante no queda claro, corregiria el archivo de origen antes de guardar para no arrastrar errores.";
  }

  if (includesAny(question, ["guardar", "analytics", "después", "importar"])) {
    return "Al guardar, la app primero importa los datos y después intenta recalcular analytics. Si ese recalculo falla, la carga igual queda guardada y la plataforma te avisa, asi que no deberías pensar que perdiste todo. Para una primera carga, yo validaria empleados primero y recien después sumaria el resto.";
  }

  return "Si es tu primera carga, yo empezaría por empleados, porque eso crea la base de personas, equipos y managers. Después sumaria ausencias, performance y encuestas para enriquecer la lectura. Antes de guardar, haria una pausa para revisar empresa, columnas obligatorias y vista previa.";
}

function answerDepartmentFocus(team: TeamSnapshot) {
  const action =
    team.turnoverRate > 0.06
      ? "Yo abriría una conversación directa con el manager para entender qué está empujando la salida."
      : team.engagementScore < 70
        ? "Yo abriría una escucha corta con el equipo y su liderazgo para entender que esta pasando en la experiencia diaria."
        : team.burnoutRiskAvg > 40
          ? "Yo revisaria carga, ritmo y coordinación antes de que el desgaste siga creciendo."
          : "Yo capturaría las prácticas sanas del equipo para sostenerlas y compartirlas.";
  const drivers =
    team.topDrivers.length > 0
      ? `Hoy lo que más pesa parece ser ${team.topDrivers.join(", ")}.`
      : "Todavía no aparecen factores dominantes demasiado claros en este corte.";

  return `${team.name} hoy combina salida de ${percentage(team.turnoverRate)}, engagement de ${team.engagementScore.toFixed(0)}/100 y desgaste de ${team.burnoutRiskAvg.toFixed(0)}/100, asi que vale la pena leerlo con atención. ${drivers} ${action}`;
}

function answerMeetingPrompts(team: TeamSnapshot) {
  return [
    `1. Que esta viviendo hoy ${team.name} que podria explicar esta foto del equipo?`,
    "2. Que parte del problema parece venir de carga, liderazgo, coordinación o experiencia diaria?",
    "3. Que indicador simple vamos a mirar en 30 dias para saber si hubo mejora?",
  ].join("\n");
}

function answerTurnoverFocus(context: CopilotContext, teams: TeamSnapshot[]) {
  const priorityTeam = getPriorityTeam(teams);
  const highRiskBucket = context.summary?.attritionDistribution.find(
    (bucket) => bucket.label === "High",
  );

  return `${priorityTeam ? `Hoy yo pondria el foco en ${priorityTeam.name}, porque ya combina salida real de ${percentage(priorityTeam.turnoverRate)} con un riesgo promedio de salida de ${priorityTeam.attritionRiskAvg.toFixed(0)}/100.` : "Todavía no aparece un equipo claramente priorizado por salida."} ${highRiskBucket ? `Ademas, ${highRiskBucket.value}% de las personas cae en el tramo alto de riesgo de salida.` : "Aun no hay una distribucion consolidada de riesgo alto para este corte."} Lo más util aca es bajar del número al equipo concreto y validar si el riesgo ya se esta traduciendo en salida real.`;
}

function answerBurnoutFocus(teams: TeamSnapshot[]) {
  const highestBurnout = getHighestBurnoutTeam(teams);

  return `${highestBurnout ? `El mayor desgaste hoy aparece en ${highestBurnout.name}, con ${highestBurnout.burnoutRiskAvg.toFixed(0)}/100.` : "Todavía no hay suficiente data para comparar desgaste entre equipos."} Yo usaria esta lectura como una alerta preventiva: miraría carga, ritmo y apoyo antes de que el problema se convierta en más salida o caida de engagement. Si quieres, te preparo la bajada para hablarlo con el manager.`;
}

function answerEngagementFocus(context: CopilotContext, teams: TeamSnapshot[]) {
  const lowestEngagement = getLowestEngagementTeam(teams);
  const latestCompanyEngagement = context.summary?.engagementTrend.at(-1)?.engagementScore;

  return `${lowestEngagement ? `Hoy el equipo con engagement más bajo es ${lowestEngagement.name}, con ${lowestEngagement.engagementScore.toFixed(0)}/100.` : "Todavía no hay suficiente data para comparar engagement entre equipos."} ${latestCompanyEngagement !== undefined ? `A nivel general, la empresa viene con ${latestCompanyEngagement.toFixed(0)}/100 en el último corte.` : "A nivel general todavía no hay una tendencia consolidada de engagement."} Cuando esto baja, yo iria rápido a escuchar que esta pasando en la experiencia diaria antes de que el problema se transforme en salida o desgaste.`;
}

function answerPrioritySummary(teams: TeamSnapshot[]) {
  const priorityTeam = getPriorityTeam(teams);
  const lowestEngagement = getLowestEngagementTeam(teams);
  const mostStable = getMostStableTeam(teams);

  return `${priorityTeam ? `Hoy yo empezaría por ${priorityTeam.name}, porque es donde más se junta la señal de riesgo con la necesidad de conversación.` : "Hoy no aparece una prioridad demasiado clara en el corte actual."} ${lowestEngagement ? `Si quisiera entender rápido el clima, también miraría ${lowestEngagement.name}, que es el equipo con engagement más bajo.` : "Todavía no hay una lectura clara de engagement por equipo."} ${mostStable ? `Y para no mirar solo problemas, también tomaría como referencia a ${mostStable.name}, que hoy parece el equipo más estable.` : "Todavía no aparece un equipo claro para tomar como referencia positiva."}`;
}

function answerNoData(context: CopilotContext) {
  if (context.view === "upload") {
    return answerUploadQuestion("");
  }

  return "Todavía no hay analytics suficientes para responder con datos reales. El siguiente paso es cargar datos base y correr analytics para construir la lectura por empresa y equipos. Mientras tanto, igual puedo ayudarte a ordenar la carga o preparar como explicarselo a un stakeholder.";
}

export function buildLocalCopilotAnswer(context: CopilotContext, question: string) {
  const normalizedQuestion = normalizeText(question);

  if (context.view === "upload") {
    return answerUploadQuestion(normalizedQuestion);
  }

  if (context.dataStatus === "empty") {
    return answerNoData(context);
  }

  const teams = getTeams(context);
  const matchingTeam = findTeamByQuestion(normalizedQuestion, teams);

  if (matchingTeam) {
    if (includesAny(normalizedQuestion, ["pregunta", "reunion", "manager", "lider"])) {
      return answerMeetingPrompts(matchingTeam);
    }

    return answerDepartmentFocus(matchingTeam);
  }

  if (includesAny(normalizedQuestion, ["pregunta", "reunion", "manager", "lider"])) {
    const priorityTeam = getPriorityTeam(teams) ?? teams[0];

    return priorityTeam
      ? answerMeetingPrompts(priorityTeam)
      : answerNoData(context);
  }

  if (includesAny(normalizedQuestion, ["rotacion", "salida", "attrition", "renuncia"])) {
    return answerTurnoverFocus(context, teams);
  }

  if (includesAny(normalizedQuestion, ["desgaste", "burnout", "carga", "estres"])) {
    return answerBurnoutFocus(teams);
  }

  if (includesAny(normalizedQuestion, ["engagement", "compromiso", "clima", "vínculo"])) {
    return answerEngagementFocus(context, teams);
  }

  return answerPrioritySummary(teams);
}

export function pickRelevantReferences(references: CopilotReference[], question: string) {
  if (references.length <= 3) {
    return references;
  }

  const keywords = normalizeText(question)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length >= 4);

  const ranked = references
    .map((reference) => {
      const haystack = normalizeText(`${reference.label} ${reference.detail}`);
      const score = keywords.reduce(
        (sum, token) => sum + (haystack.includes(token) ? 1 : 0),
        0,
      );

      return {
        reference,
        score,
      };
    })
    .sort((left, right) => right.score - left.score);

  const matching = ranked.filter((item) => item.score > 0).map((item) => item.reference);

  if (matching.length > 0) {
    return matching.slice(0, 3);
  }

  return references.slice(0, 3);
}
