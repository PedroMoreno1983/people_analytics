import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Info,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { DistributionChart } from "@/components/charts/distribution-chart";
import { CompanySwitcher } from "@/components/company-switcher";
import { GlobalFilters } from "@/components/global-filters";
import { LineTrendChart } from "@/components/charts/line-trend-chart";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { getExecutiveSummary } from "@/lib/analytics/summary";
import type { ExecutiveSummary } from "@/lib/analytics/types";
import { getCompanyFilterOptions, listCompanies } from "@/lib/company";

export const dynamic = "force-dynamic";

type DepartmentRow = ExecutiveSummary["departmentHealth"][number];

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function severityScore(tone: DepartmentRow["tone"]) {
  if (tone === "critical") {
    return 2;
  }

  if (tone === "warning") {
    return 1;
  }

  return 0;
}

function statusLabel(tone: DepartmentRow["tone"]) {
  if (tone === "critical") {
    return "Atención";
  }

  if (tone === "warning") {
    return "Seguimiento";
  }

  return "Estable";
}

function bucketLabel(label: ExecutiveSummary["attritionDistribution"][number]["label"]) {
  if (label === "Low") {
    return "Bajo";
  }

  if (label === "Medium") {
    return "Medio";
  }

  return "Alto";
}

function departmentReading(department: DepartmentRow) {
  if (department.tone === "critical") {
    return `${department.name} combina ${formatPercentage(department.turnoverRate)} de salida, ${department.burnoutRiskAvg.toFixed(0)}/100 de desgaste y ${department.engagementScore.toFixed(0)}/100 de engagement.`;
  }

  if (department.tone === "warning") {
    return `${department.name} ya muestra señales que conviene seguir de cerca antes de que escalen.`;
  }

  return `${department.name} se ve estable en este corte y puede servir como referencia para otros equipos.`;
}

function departmentAction(department: DepartmentRow) {
  if (department.turnoverRate > 0.06) {
    return "Conversar con liderazgo del equipo y revisar qué está empujando la salida.";
  }

  if (department.engagementScore < 70) {
    return "Abrir una conversación corta con managers y personas para entender experiencia diaria y apoyo.";
  }

  if (department.burnoutRiskAvg > 40) {
    return "Mirar carga de trabajo, ritmos y coordinación del equipo durante las próximas semanas.";
  }

  return "Capturar prácticas del equipo y evaluar que vale la pena replicar.";
}

function buildStoryCards(summary: ExecutiveSummary) {
  const departments = [...summary.departmentHealth].sort((left, right) => {
    const toneGap = severityScore(right.tone) - severityScore(left.tone);

    if (toneGap !== 0) {
      return toneGap;
    }

    return right.attritionRiskAvg - left.attritionRiskAvg;
  });
  const mostUrgent = departments[0];
  const lowestEngagement = [...summary.departmentHealth].sort(
    (left, right) => left.engagementScore - right.engagementScore,
  )[0];
  const strongestTeam = [...summary.departmentHealth].sort((left, right) => {
    if (left.tone !== right.tone) {
      return severityScore(left.tone) - severityScore(right.tone);
    }

    return right.engagementScore - left.engagementScore;
  })[0];
  const lastBurnout = summary.burnoutTrend.at(-1)?.burnoutRiskAvg ?? 0;
  const previousBurnout = summary.burnoutTrend.at(-2)?.burnoutRiskAvg ?? lastBurnout;
  const lastEngagement = summary.engagementTrend.at(-1)?.engagementScore ?? 0;
  const previousEngagement =
    summary.engagementTrend.at(-2)?.engagementScore ?? lastEngagement;

  return [
    mostUrgent && mostUrgent.tone !== "positive"
      ? {
          label: "Para mirar hoy",
          title: `${mostUrgent.name} necesita una conversación cercana`,
          description: departmentReading(mostUrgent),
          icon: AlertTriangle,
          variant: "critical" as const,
        }
      : {
          label: "Foto general",
          title: "No aparece una alerta roja en este corte",
          description:
            "La organización se ve relativamente estable. Este es un buen momento para mirar tendencias y sostener prácticas sanas.",
          icon: CheckCircle,
          variant: "positive" as const,
        },
    lastBurnout > previousBurnout + 1
      ? {
          label: "Cambio reciente",
          title: "Las señales de desgaste vienen subiendo",
          description:
            "El burnout promedio creció frente al período anterior. Conviene revisar carga, ritmo y apoyo de liderazgo.",
          icon: TrendingUp,
          variant: "warning" as const,
        }
      : lastEngagement + 1 < previousEngagement
        ? {
            label: "Cambio reciente",
            title: "El vínculo con el trabajo se está enfriando",
            description:
              "El engagement cayó frente al período anterior. Vale la pena revisar escucha, claridad y energía de los equipos.",
            icon: TrendingDown,
            variant: "warning" as const,
          }
        : {
            label: "Cambio reciente",
            title: "Las tendencias no muestran un salto brusco",
            description:
              "No hay un cambio repentino en salida, engagement o desgaste. La oportunidad está en sostener y prevenir.",
            icon: Info,
            variant: "neutral" as const,
          },
    lowestEngagement && lowestEngagement.engagementScore < 70
      ? {
          label: "Siguiente conversación",
          title: `Empieza por escuchar a ${lowestEngagement.name}`,
          description:
            "Es el equipo con menor engagement del corte. Una lectura cualitativa rápida puede explicar mejor lo que los números solo sugieren.",
          icon: ShieldCheck,
          variant: "neutral" as const,
        }
      : strongestTeam
        ? {
            label: "Siguiente conversación",
            title: `Replica lo que hoy funciona en ${strongestTeam.name}`,
            description:
              "Es el equipo mejor parado del corte. Puede aportar prácticas concretas para managers de otras áreas.",
            icon: CheckCircle,
            variant: "positive" as const,
          }
        : {
            label: "Siguiente conversación",
            title: "Aun no hay suficiente detalle por equipo",
            description:
              "Carga más información o corre analytics nuevamente para abrir una lectura más acciónable por área.",
            icon: Info,
            variant: "neutral" as const,
          },
  ];
}

function buildMeetingPrompts(summary: ExecutiveSummary) {
  const prompts: Array<{
    title: string;
    description: string;
    tone: "positive" | "warning" | "critical" | "neutral";
  }> = [];
  const highestTurnover = [...summary.departmentHealth].sort(
    (left, right) => right.turnoverRate - left.turnoverRate,
  )[0];
  const highestBurnout = [...summary.departmentHealth].sort(
    (left, right) => right.burnoutRiskAvg - left.burnoutRiskAvg,
  )[0];
  const lowestEngagement = [...summary.departmentHealth].sort(
    (left, right) => left.engagementScore - right.engagementScore,
  )[0];

  if (highestTurnover && highestTurnover.turnoverRate > 0.04) {
    prompts.push({
      title: `Qué está empujando la salida en ${highestTurnover.name}?`,
      description: `Hoy es el equipo con mayor salida real: ${formatPercentage(highestTurnover.turnoverRate)} en el último corte.`,
      tone: "critical",
    });
  }

  if (highestBurnout && highestBurnout.burnoutRiskAvg > 35) {
    prompts.push({
      title: `Dónde se está acumulando desgaste sostenido?`,
      description: `${highestBurnout.name} lidera las señales de desgaste con ${highestBurnout.burnoutRiskAvg.toFixed(0)}/100.`,
      tone: "warning",
    });
  }

  if (lowestEngagement && lowestEngagement.engagementScore < 72) {
    prompts.push({
      title: `Qué está viviendo la gente en ${lowestEngagement.name}?`,
      description: `Es el punto más bajo de engagement del corte con ${lowestEngagement.engagementScore.toFixed(0)}/100.`,
      tone: "neutral",
    });
  }

  if (prompts.length === 0) {
    prompts.push({
      title: "Que prácticas conviene sostener hoy?",
      description:
        "La foto actual no muestra una alerta fuerte. El foco puede estar en mantener buenos hábitos y prevenir.",
      tone: "positive",
    });
  }

  return prompts.slice(0, 3);
}

function mapKpis(summary: ExecutiveSummary) {
  const labels: Record<string, { label: string; detail: string }> = {
    Headcount: {
      label: "Personas activas",
      detail: "Cantidad de personas activas en el último corte.",
    },
    Turnover: {
      label: "Salida mensual",
      detail: "Salida real promedio entre equipos en el último corte.",
    },
    Absenteeism: {
      label: "Ausentismo",
      detail: "Días ausentes sobre la capacidad laboral del mes.",
    },
    Engagement: {
      label: "Vínculo con el trabajo",
      detail: "Pulso general de energía, experiencia y compromiso.",
    },
    "Burnout Risk": {
      label: "Señales de desgaste",
      detail: "Lectura preventiva sobre carga, energía y desgaste sostenido.",
    },
  };

  return summary.kpis.map((item) => ({
    ...item,
    label: labels[item.label]?.label ?? item.label,
    detail: labels[item.label]?.detail ?? item.detail,
  }));
}

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const selectedCompanyId =
    typeof searchParams.companyId === "string" ? searchParams.companyId : undefined;

  const filters = {
    location: typeof searchParams.location === "string" ? searchParams.location : undefined,
    department: typeof searchParams.department === "string" ? searchParams.department : undefined,
    age: typeof searchParams.age === "string" ? searchParams.age : undefined,
  };

  let summary: Awaited<ReturnType<typeof getExecutiveSummary>>;
  let companies: Awaited<ReturnType<typeof listCompanies>>;

  try {
    [summary, companies] = await Promise.all([
      getExecutiveSummary(selectedCompanyId, filters),
      listCompanies(),
    ]);
  } catch {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-white/90 p-8">
        <p className="text-sm text-slate-700">
          No pudimos cargar el resumen ejecutivo en este momento. Revisa la conexión con la base de datos o vuelve a intentar en unos minutos.
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8">
        <p className="text-sm text-slate-500">
          No hay datos disponibles todavía. Conecta la base de datos y corre analytics para ver una lectura real.
        </p>
      </div>
    );
  }

  const filterOptions = await getCompanyFilterOptions(summary.companyId);
  const hasAppliedFilters = Boolean(
    filters.location || filters.department || filters.age
  );
  const hasSummaryData =
    summary.kpis.length > 0 && summary.departmentHealth.length > 0;
  const dashboardBaseHref = summary.companyId
    ? `/dashboard?companyId=${summary.companyId}`
    : "/dashboard";

  if (!hasSummaryData) {
    return (
      <div className="space-y-6">
        <GlobalFilters
          departments={filterOptions.departments}
          locations={filterOptions.locations}
          ageBands={filterOptions.ageBands}
        />
        <section className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <Badge variant="neutral">
            {hasAppliedFilters ? "Sin resultados" : "Sin lectura disponible"}
          </Badge>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            {hasAppliedFilters
              ? "No encontramos personas para este filtro"
              : `Todavía no hay una lectura lista para ${summary.companyName}`}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            {summary.insights[0] ??
              "Todavía no hay datos suficientes para construir el resumen ejecutivo."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={hasAppliedFilters ? dashboardBaseHref : "/upload"}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium !text-white transition-colors hover:bg-slate-800 hover:!text-white"
            >
              {hasAppliedFilters ? "Quitar filtros" : "Cargar datos"}
              <ArrowRight className="size-4" />
            </Link>
            {!hasAppliedFilters && (
              <Link
                href="/departments"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-medium !text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 hover:!text-slate-700"
              >
                Revisar equipos
              </Link>
            )}
          </div>
        </section>
      </div>
    );
  }

  const storyCards = buildStoryCards(summary);
  const meetingPrompts = buildMeetingPrompts(summary);
  const kpis = mapKpis(summary);

  return (
    <div className="space-y-6">
      {summary.isDemo && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span>
            <strong>Modo demo</strong>. Esta vista sirve para mostrar la idea del producto, pero todavía no esta leyendo datos reales.{" "}
            <Link href="/upload" className="text-amber-800 underline">
              Subir datos
            </Link>
          </span>
        </div>
      )}

      {/* Area de Botones Superiores: Filtros Globales */}
      <GlobalFilters
        departments={filterOptions.departments}
        locations={filterOptions.locations}
        ageBands={filterOptions.ageBands}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="rounded-[34px] border border-white/70 bg-white/80 p-8 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.18)] backdrop-blur-md">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">Resumen ejecutivo</Badge>
            {summary.latestMonth ? (
              <Badge variant="positive">Ultimo corte: {summary.latestMonth}</Badge>
            ) : null}
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Qué está pasando con {summary.companyName} hoy
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500">
            Esta vista esta pensada para leer rápido. Primero te muestra donde mirar, después que cambio en los últimos meses
            y por último que conversaciones conviene abrir con liderazgo y RR.HH.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-[34px] border border-indigo-900/30 bg-gradient-to-br from-indigo-950 via-violet-950 to-slate-950 p-8 text-slate-100">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.2)_0%,transparent_60%)]" />
          <div className="relative mb-6">
            {companies.length > 0 && !summary.isDemo ? (
              <CompanySwitcher
                companies={companies}
                selectedCompanyId={summary.companyId}
              />
            ) : (
              <div className="rounded-[24px] border border-white/10 bg-white/6 p-4 text-sm leading-6 text-slate-300">
                Cuando cargues más de una empresa, aquí vas a poder cambiar rápidamente la vista.
              </div>
            )}
          </div>
          <p className="relative text-xs font-semibold uppercase tracking-[0.24em] text-indigo-300">
            Cómo leer este resumen
          </p>
          <div className="relative mt-5 space-y-3">
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="font-medium text-white">1. Mira la alerta principal</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Empieza por el equipo o la señal que necesita una conversación hoy, no por todos los números al mismo tiempo.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="font-medium text-white">2. Revisa si es algo puntual o sostenido</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                Las tendencias te dicen si estas frente a un episodio aislado o a un problema que viene creciendo.
              </p>
            </div>
            <div className="rounded-[20px] border border-white/10 bg-white/6 p-4">
              <p className="font-medium text-white">3. Cierra con una acción simple</p>
              <p className="mt-2 text-sm leading-6 text-slate-400">
                La mejor lectura no es la más técnica, sino la que ayuda a decidir donde hablar, escuchar o intervenir primero.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {storyCards.map((item) => (
          <div
            key={item.title}
            className="rounded-[28px] border border-white/70 bg-white/80 p-6 shadow-[0_8px_32px_-12px_rgba(15,23,42,0.15)] backdrop-blur-md transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_40px_-12px_rgba(15,23,42,0.2)]"
          >
            <div className="flex items-center justify-between gap-3">
              <Badge variant={item.variant}>{item.label}</Badge>
              <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-slate-100">
                <item.icon className="size-3.5 text-slate-500" />
              </div>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {kpis.map((item) => (
          <MetricCard key={item.label} {...item} footer="Lectura del último corte" />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
        <SectionCard
          eyebrow="Equipos"
          title="Donde conviene mirar primero"
          description="Cada fila resume el estado del equipo en palabras simples y sugiere por donde empezar la conversación."
        >
          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Equipo</th>
                  <th className="px-4 py-3 font-medium">Estado</th>
                  <th className="px-4 py-3 font-medium">Lo que se ve</th>
                  <th className="px-4 py-3 font-medium">Por donde empezar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {summary.departmentHealth.map((department) => (
                  <tr
                    key={department.departmentId}
                    className="align-top transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-4 font-medium text-slate-950">{department.name}</td>
                    <td className="px-4 py-4">
                      <Badge variant={department.tone}>{statusLabel(department.tone)}</Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{departmentReading(department)}</td>
                    <td className="px-4 py-4 text-slate-600">{departmentAction(department)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Personas"
          title="Cuantas muestran señales de salida"
          description="No es una sentencia final. Es una forma rápida de ver cuanta atención preventiva podria necesitar la organización."
        >
          <DistributionChart data={summary.attritionDistribution} />
          <div className="mt-4 grid gap-3">
            {summary.attritionDistribution.map((bucket) => (
              <div
                key={bucket.label}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={bucket.tone}>{bucketLabel(bucket.label)}</Badge>
                  <span className="text-slate-600">Personas dentro de este tramo</span>
                </div>
                <span className="font-semibold text-slate-950">{bucket.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          eyebrow="Tendencia"
          title="Salida real"
          description="Movimiento promedio de personas entre equipos en los últimos cortes."
        >
          <LineTrendChart
            data={summary.turnoverTrend}
            xKey="month"
            yKey="turnoverRate"
            stroke="#ef4444"
            format="percentage"
          />
        </SectionCard>

        <SectionCard
          eyebrow="Tendencia"
          title="Vínculo con el trabajo"
          description="Pulso general de engagement. Si baja de forma sostenida, conviene escuchar antes de que aparezca más salida."
        >
          <LineTrendChart
            data={summary.engagementTrend}
            xKey="month"
            yKey="engagementScore"
            stroke="#2563eb"
            format="score"
          />
        </SectionCard>

        <SectionCard
          eyebrow="Tendencia"
          title="Señales de desgaste"
          description="Lectura preventiva sobre cansancio, sobrecarga o desgaste sostenido."
        >
          <LineTrendChart
            data={summary.burnoutTrend}
            xKey="month"
            yKey="burnoutRiskAvg"
            stroke="#f97316"
            format="score"
          />
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Reunión"
        title="Preguntas para abrir la conversación"
        description="Sirven para pasar del número a la acción sin perder tiempo en jerga técnica."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {meetingPrompts.map((item) => (
            <div
              key={item.title}
              className="rounded-[24px] border border-slate-100 bg-slate-50/70 p-5 transition-all hover:-translate-y-0.5 hover:bg-white/80 hover:shadow-sm"
            >
              <Badge variant={item.tone}>{item.tone === "critical" ? "Prioridad" : item.tone === "warning" ? "Seguimiento" : item.tone === "positive" ? "Sostener" : "Conversar"}</Badge>
              <h2 className="mt-4 text-lg font-semibold text-slate-950">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </SectionCard>

      <Link
        href={
          summary.isDemo
            ? "/upload"
            : `/departments${summary.companyId ? `?companyId=${summary.companyId}` : ""}`
        }
        className="flex items-center gap-2 text-sm font-medium text-indigo-600 transition-colors hover:text-indigo-800"
      >
        {summary.isDemo ? "Abrir carga de datos para salir del demo" : "Abrir la vista por equipos"}
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
