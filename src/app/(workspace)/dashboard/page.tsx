import { AlertTriangle, ArrowRight, CheckCircle, Info, TrendingDown, TrendingUp } from "lucide-react";
import Link from "next/link";

import { DistributionChart } from "@/components/charts/distribution-chart";
import { CompanySwitcher } from "@/components/company-switcher";
import { LineTrendChart } from "@/components/charts/line-trend-chart";
import { MetricCard } from "@/components/metric-card";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { getExecutiveSummary } from "@/lib/analytics/summary";
import { listCompanies } from "@/lib/company";

export const dynamic = "force-dynamic";

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function InsightIcon({ text }: { text: string }) {
  const lower = text.toLowerCase();
  if (lower.includes("riesgo") || lower.includes("elevado") || lower.includes("superior") || lower.includes("risk") || lower.includes("elevated") || lower.includes("above")) {
    return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />;
  }
  if (lower.includes("sin alertas") || lower.includes("no material") || lower.includes("no acute")) {
    return <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />;
  }
  if (lower.includes("concentrado") || lower.includes("aumentó") || lower.includes("concentrated") || lower.includes("increased")) {
    return <TrendingUp className="mt-0.5 size-4 shrink-0 text-rose-500" />;
  }
  return <Info className="mt-0.5 size-4 shrink-0 text-slate-400" />;
}

export default async function DashboardPage(props: PageProps<"/dashboard">) {
  const searchParams = await props.searchParams;
  const selectedCompanyId =
    typeof searchParams.companyId === "string" ? searchParams.companyId : undefined;
  const [summary, companies] = await Promise.all([
    getExecutiveSummary(selectedCompanyId),
    listCompanies(),
  ]);

  if (!summary) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8">
        <p className="text-sm text-slate-500">
          No hay datos disponibles. Conectá la base de datos y ejecutá el pipeline de analytics primero.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(summary as any).isDemo && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span>
            <strong>Modo Demo</strong> — conectá una base de datos PostgreSQL y cargá datos para ver información real.{" "}
            <Link href="/upload" className="underline">Subir datos →</Link>
          </span>
        </div>
      )}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">Dashboard ejecutivo</Badge>
            {summary.latestMonth ? (
              <Badge variant="positive">Último mes: {summary.latestMonth}</Badge>
            ) : null}
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Salud organizacional de {summary.companyName}.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Inteligencia organizacional en tiempo real: métricas operativas, riesgo de rotación,
            señales de burnout, salud por departamento e insights ejecutivos — todo calculado desde
            tus datos de RR.HH. más recientes.
          </p>
        </div>

        <div className="rounded-[34px] border border-slate-200/80 bg-slate-950 p-8 text-slate-100">
          <div className="mb-6">
            <CompanySwitcher
              companies={companies}
              selectedCompanyId={summary.companyId}
            />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
            Cómo leer este dashboard
          </p>
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <TrendingDown className="mt-1 size-4 shrink-0 text-rose-300" />
              <div>
                <p className="font-medium text-white">Dónde se concentra el riesgo</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  La salud por departamento y la distribución de riesgo muestran dónde el sistema de personas está bajo presión.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <TrendingUp className="mt-1 size-4 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">Qué está cambiando</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Los gráficos de tendencia muestran si la rotación, el engagement y el burnout se estabilizan o empeoran.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {summary.kpis.map((item) => (
          <MetricCard key={item.label} {...item} footer="Del último mes de analytics" />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
        <SectionCard
          eyebrow="Salud por departamento"
          title="Mapa de calor y tabla operativa"
          description="Cada fila se evalúa sobre riesgo de rotación, burnout y engagement contra los umbrales actuales."
        >
          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Departamento</th>
                  <th className="px-4 py-3 font-medium">Salud</th>
                  <th className="px-4 py-3 font-medium">Headcount</th>
                  <th className="px-4 py-3 font-medium">Rotación</th>
                  <th className="px-4 py-3 font-medium">Engagement</th>
                  <th className="px-4 py-3 font-medium">Burnout</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {summary.departmentHealth.map((department) => (
                  <tr key={department.departmentId} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-4 font-medium text-slate-950">
                      {department.name}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={department.tone}>{department.health}</Badge>
                    </td>
                    <td className="px-4 py-4 text-slate-600">{department.headcount}</td>
                    <td className="px-4 py-4 text-slate-600">
                      {formatPercentage(department.turnoverRate)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {department.engagementScore.toFixed(0)}/100
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {department.burnoutRiskAvg.toFixed(0)}/100
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Distribución de riesgo"
          title="División por riesgo de rotación"
          description="Segmentos de riesgo calculados desde los últimos registros de EmployeeRiskScore."
        >
          <DistributionChart data={summary.attritionDistribution} />
          <div className="mt-4 grid gap-3">
            {summary.attritionDistribution.map((bucket) => (
              <div
                key={bucket.label}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm"
              >
                <div className="flex items-center gap-3">
                  <Badge variant={bucket.tone}>{bucket.label}</Badge>
                  <span className="text-slate-600">Proporción de empleados</span>
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
          title="Rotación"
          description="Rotación promedio por departamento según el mes de scoring."
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
          title="Engagement"
          description="Puntaje de engagement promedio entre departamentos."
        >
          <LineTrendChart
            data={summary.engagementTrend}
            xKey="month"
            yKey="engagementScore"
            stroke="#4f46e5"
            format="score"
          />
        </SectionCard>

        <SectionCard
          eyebrow="Tendencia"
          title="Riesgo de burnout"
          description="Puntaje promedio de riesgo de burnout entre departamentos."
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
        eyebrow="Insights"
        title="Alertas clave"
        description="Alertas generadas automáticamente desde la última ventana de scoring — breves, ejecutivas y accionables."
      >
        <div className="grid gap-4 lg:grid-cols-3">
          {summary.insights.map((insight) => (
            <div
              key={insight}
              className="flex gap-3 rounded-[24px] border border-slate-200 bg-slate-50/80 p-5 text-sm leading-6 text-slate-700"
            >
              <InsightIcon text={insight} />
              <span>{insight}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
        Ver el workspace de departamentos para un análisis a nivel de equipo
        <ArrowRight className="size-4" />
      </div>
    </div>
  );
}
