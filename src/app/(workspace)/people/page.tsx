import {
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

import { DistributionChart } from "@/components/charts/distribution-chart";
import { CompanySwitcher } from "@/components/company-switcher";
import { GlobalFilters } from "@/components/global-filters";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { getPeopleDashboard } from "@/lib/analytics/people-dashboard";
import type { PeopleDashboard, PeopleDashboardPerson } from "@/lib/analytics/types";
import { getCompanyFilterOptions, listCompanies } from "@/lib/company";

export const dynamic = "force-dynamic";

type PeoplePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toneLabel(tone: PeopleDashboardPerson["tone"]) {
  if (tone === "critical") {
    return "Prioridad alta";
  }

  if (tone === "warning") {
    return "Seguimiento";
  }

  if (tone === "positive") {
    return "Estable";
  }

  return "Sin score";
}

function riskTone(value: number | null): "positive" | "warning" | "critical" | "neutral" {
  if (value == null) {
    return "neutral";
  }

  if (value >= 60) {
    return "critical";
  }

  if (value >= 35) {
    return "warning";
  }

  return "positive";
}

function humanizeDriver(driver: string) {
  const normalized = driver.toLowerCase();

  if (normalized.includes("absenteeism") || normalized.includes("ausentismo")) {
    return "Ausentismo";
  }

  if (normalized.includes("low engagement") || normalized.includes("engagement")) {
    return "Engagement bajo";
  }

  if (normalized.includes("tenure")) {
    return "Tenencia reciente";
  }

  if (normalized.includes("performance")) {
    return "Caída de desempeño";
  }

  if (normalized.includes("promotion")) {
    return "Desarrollo estancado";
  }

  if (normalized.includes("workload")) {
    return "Carga de trabajo";
  }

  if (normalized.includes("stress")) {
    return "Estrés sostenido";
  }

  return driver;
}

function formatScore(value: number | null, suffix = "/100") {
  if (value == null) {
    return "Sin score";
  }

  return `${value.toFixed(0)}${suffix}`;
}

function buildCoverageTone(
  peopleWithScores: number,
  headcount: number,
): "positive" | "warning" | "critical" | "neutral" {
  if (headcount === 0) {
    return "neutral";
  }

  const coverage = peopleWithScores / headcount;

  if (coverage >= 0.8) {
    return "positive";
  }

  if (coverage >= 0.5) {
    return "warning";
  }

  return "critical";
}

function buildRiskCards(summary: PeopleDashboard) {
  return [
    {
      label: "Personas activas",
      value: String(summary.headcount),
      detail: "Personas activas que hoy entran en esta lectura.",
      tone: "neutral" as const,
      footer: `${summary.teamsRepresented} equipos representados`,
    },
    {
      label: "Cobertura analítica",
      value: summary.headcount
        ? `${Math.round((summary.peopleWithScores / summary.headcount) * 100)}%`
        : "0%",
      detail: "Cuántas personas ya tienen score de salida o desgaste reciente.",
      tone: buildCoverageTone(summary.peopleWithScores, summary.headcount),
      footer: `${summary.peopleWithScores} personas con score vigente`,
    },
    {
      label: "Salida alta",
      value: String(summary.highAttritionCount),
      detail: "Personas con riesgo de salida alto en la última lectura.",
      tone: summary.highAttritionCount > 0 ? "critical" : "positive",
      footer: "Conviene alinear con managers y People Ops",
    },
    {
      label: "Desgaste alto",
      value: String(summary.highBurnoutCount),
      detail: "Personas con señales fuertes de desgaste o sobrecarga.",
      tone: summary.highBurnoutCount > 0 ? "warning" : "positive",
      footer: summary.avgEngagementScore
        ? `Engagement promedio ${summary.avgEngagementScore.toFixed(0)}/100`
        : "Engagement todavía sin señal suficiente",
    },
  ] satisfies Array<{
    label: string;
    value: string;
    detail: string;
    tone: "positive" | "warning" | "critical" | "neutral";
    footer: string;
  }>;
}

export default async function PeoplePage(props: PeoplePageProps) {
  const searchParams = await props.searchParams;
  const selectedCompanyId =
    typeof searchParams.companyId === "string" ? searchParams.companyId : undefined;

  const filters = {
    location: typeof searchParams.location === "string" ? searchParams.location : undefined,
    department:
      typeof searchParams.department === "string" ? searchParams.department : undefined,
    age: typeof searchParams.age === "string" ? searchParams.age : undefined,
  };

  let peopleSummary: Awaited<ReturnType<typeof getPeopleDashboard>>;
  let companies: Awaited<ReturnType<typeof listCompanies>>;

  try {
    [peopleSummary, companies] = await Promise.all([
      getPeopleDashboard(selectedCompanyId, filters),
      listCompanies(),
    ]);
  } catch {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-white/90 p-8">
        <p className="text-sm text-slate-700">
          No pudimos cargar la vista de personas en este momento. Revisa la conexión
          con la base de datos o vuelve a intentar.
        </p>
      </div>
    );
  }

  if (!peopleSummary) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8">
        <p className="text-sm text-slate-500">
          Todavía no hay empresas ni personas cargadas para abrir esta vista.
        </p>
      </div>
    );
  }

  const filterOptions = await getCompanyFilterOptions(peopleSummary.companyId);
  const hasAppliedFilters = Boolean(filters.location || filters.department || filters.age);
  const baseHref = peopleSummary.companyId
    ? `/people?companyId=${peopleSummary.companyId}`
    : "/people";

  if (peopleSummary.people.length === 0) {
    return (
      <div className="space-y-6">
        <GlobalFilters
          departments={filterOptions.departments}
          locations={filterOptions.locations}
          ageBands={filterOptions.ageBands}
        />
        <section className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <Badge variant="neutral">
            {hasAppliedFilters ? "Sin resultados" : "Sin personas disponibles"}
          </Badge>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            {hasAppliedFilters
              ? "No encontramos personas para este filtro"
              : `Todavía no hay una lectura por persona lista para ${peopleSummary.companyName}`}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            {peopleSummary.insights[0] ??
              "Sube datos de personas, encuestas o ausentismo para abrir esta vista."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href={hasAppliedFilters ? baseHref : "/upload"}
              className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium !text-white transition-colors hover:bg-slate-800 hover:!text-white"
            >
              {hasAppliedFilters ? "Quitar filtros" : "Subir datos"}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </div>
    );
  }

  const cards = buildRiskCards(peopleSummary);

  return (
    <div className="space-y-6">
      <GlobalFilters
        departments={filterOptions.departments}
        locations={filterOptions.locations}
        ageBands={filterOptions.ageBands}
      />

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(360px,0.95fr)]">
        <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">People Explorer</Badge>
            {peopleSummary.latestMonth ? (
              <Badge variant="positive">Último corte: {peopleSummary.latestMonth}</Badge>
            ) : null}
          </div>

          <div className="mt-5 max-w-sm">
            {companies.length > 0 ? (
              <CompanySwitcher
                companies={companies}
                selectedCompanyId={peopleSummary.companyId}
              />
            ) : null}
          </div>

          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Qué personas merecen más atención hoy
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Esta vista baja del equipo a la persona. Sirve para ver cobertura,
            señales de salida o desgaste, y qué conversaciones conviene abrir antes
            de que el problema escale.
          </p>

          <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-600">
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              {peopleSummary.headcount} personas activas
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              {peopleSummary.teamsRepresented} equipos representados
            </div>
            <div className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2">
              {peopleSummary.peopleWithScores} personas con score vigente
            </div>
          </div>
        </div>

        <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4 text-amber-500" />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Qué te ayuda a decidir esta pantalla
            </p>
          </div>

          <div className="mt-5 space-y-4">
            {peopleSummary.insights.map((insight) => (
              <div
                key={insight}
                className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700"
              >
                {insight}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard
            key={card.label}
            label={card.label}
            value={card.value}
            detail={card.detail}
            tone={card.tone}
            footer={card.footer}
          />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <SectionCard
          eyebrow="Distribución de riesgo"
          title="Cómo se reparte la señal entre las personas que sí tienen score"
          description="La dona te da una lectura rápida de cobertura y concentración del riesgo."
        >
          <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-center">
            <DistributionChart data={peopleSummary.riskDistribution} />
            <div className="grid gap-3">
              {peopleSummary.riskDistribution.map((item) => (
                <div
                  key={item.label}
                  className="rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <Badge variant={item.tone}>{item.label}</Badge>
                    <span className="text-sm font-semibold text-slate-950">
                      {item.value}%
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {item.label === "High"
                      ? "Personas que hoy merecen seguimiento prioritario."
                      : item.label === "Medium"
                        ? "Personas en zona de prevención y conversación temprana."
                        : "Personas con señal más estable en la última lectura."}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Personas a mirar hoy"
          title="Dónde conviene abrir la primera conversación"
          description="La lista prioriza a quienes concentran más señal de salida o desgaste."
        >
          <div className="grid gap-4">
            {peopleSummary.spotlight.map((person) => (
              <div
                key={person.employeeId}
                className="rounded-[24px] border border-slate-200 bg-white p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold text-slate-950">{person.name}</h2>
                      <Badge variant={person.tone === "neutral" ? "neutral" : person.tone}>
                        {toneLabel(person.tone)}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-slate-500">
                      {person.jobTitle ?? "Rol no informado"} · {person.departmentName}
                    </p>
                  </div>

                  <div className="text-right text-sm text-slate-500">
                    <p>{person.location ?? "Ubicación no informada"}</p>
                    <p>{person.tenureLabel} en la empresa</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">Riesgo de salida</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatScore(person.attritionRisk)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">Desgaste</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatScore(person.burnoutRisk)}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-3">
                    <p className="text-xs font-medium text-slate-500">Engagement</p>
                    <p className="mt-1 text-sm font-semibold text-slate-950">
                      {formatScore(person.engagementScore)}
                    </p>
                  </div>
                </div>

                {person.topDrivers.length > 0 ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {person.topDrivers.map((driver) => (
                      <span
                        key={driver}
                        className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600"
                      >
                        {humanizeDriver(driver)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Todavía no hay drivers explicables cargados para esta persona.
                  </p>
                )}
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Lectura por persona"
        title="La capa operativa que demuestra el modelo real detrás"
        description="Aquí ya no hay solo KPIs. Hay personas, score, drivers, cobertura y contexto de gestión."
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead>
              <tr className="text-left text-xs uppercase tracking-[0.16em] text-slate-500">
                <th className="px-4 py-3 font-semibold">Persona</th>
                <th className="px-4 py-3 font-semibold">Equipo</th>
                <th className="px-4 py-3 font-semibold">Riesgo salida</th>
                <th className="px-4 py-3 font-semibold">Desgaste</th>
                <th className="px-4 py-3 font-semibold">Engagement</th>
                <th className="px-4 py-3 font-semibold">Ausentismo 90d</th>
                <th className="px-4 py-3 font-semibold">Drivers</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {peopleSummary.people.map((person) => (
                <tr key={person.employeeId} className="align-top">
                  <td className="px-4 py-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-950">{person.name}</p>
                        <Badge variant={person.tone === "neutral" ? "neutral" : person.tone}>
                          {toneLabel(person.tone)}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500">
                        {person.jobTitle ?? "Rol no informado"}
                      </p>
                      <p className="text-xs text-slate-400">
                        {person.managerName ? `Manager: ${person.managerName}` : "Manager no informado"}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    <div className="space-y-1">
                      <p className="font-medium text-slate-900">{person.departmentName}</p>
                      <p>{person.location ?? "Ubicación no informada"}</p>
                      <p>{person.workMode ?? "Modo de trabajo no informado"}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={riskTone(person.attritionRisk)}>
                      {formatScore(person.attritionRisk)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4">
                    <Badge variant={riskTone(person.burnoutRisk)}>
                      {formatScore(person.burnoutRisk)}
                    </Badge>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-slate-900">
                    {formatScore(person.engagementScore)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-600">
                    {person.absenceDays90} días
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex max-w-sm flex-wrap gap-2">
                      {person.topDrivers.length > 0 ? (
                        person.topDrivers.map((driver) => (
                          <span
                            key={driver}
                            className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-600"
                          >
                            {humanizeDriver(driver)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">Sin drivers disponibles</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>
    </div>
  );
}
