import { Activity, AlertTriangle, CheckCircle, Flame, Info, Users } from "lucide-react";

import { CompanySwitcher } from "@/components/company-switcher";
import { SparklineChart } from "@/components/charts/sparkline-chart";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { getDepartmentDashboard } from "@/lib/analytics/department-summary";
import { listCompanies } from "@/lib/company";

export const dynamic = "force-dynamic";

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function InsightIcon({ text }: { text: string }) {
  const lower = text.toLowerCase();
  if (lower.includes("elevado") || lower.includes("superior") || lower.includes("inferior") || lower.includes("elevated") || lower.includes("above") || lower.includes("below")) {
    return <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />;
  }
  if (lower.includes("sin alertas") || lower.includes("no acute") || lower.includes("no material")) {
    return <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />;
  }
  if (lower.includes("alta rotación") || lower.includes("high attrition") || lower.includes("employees are in high")) {
    return <Flame className="mt-0.5 size-3.5 shrink-0 text-rose-500" />;
  }
  return <Info className="mt-0.5 size-3.5 shrink-0 text-slate-400" />;
}

export default async function DepartmentsPage(props: PageProps<"/departments">) {
  const searchParams = await props.searchParams;
  const selectedCompanyId =
    typeof searchParams.companyId === "string" ? searchParams.companyId : undefined;
  const [dashboard, companies] = await Promise.all([
    getDepartmentDashboard(selectedCompanyId),
    listCompanies(),
  ]);

  if (!dashboard) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8">
        <p className="text-sm text-slate-500">
          No hay datos de departamentos disponibles. Conectá la base de datos y ejecutá el pipeline de analytics primero.
        </p>
      </div>
    );
  }

  const criticalCount = dashboard.departments.filter(
    (department) => department.tone === "critical",
  ).length;
  const warningCount = dashboard.departments.filter(
    (department) => department.tone === "warning",
  ).length;
  const healthyCount = dashboard.departments.filter(
    (department) => department.tone === "positive",
  ).length;

  const totalHeadcount = dashboard.departments.reduce(
    (sum, d) => sum + d.headcount,
    0,
  );
  const avgEngagement =
    dashboard.departments.length > 0
      ? dashboard.departments.reduce((sum, d) => sum + d.engagementScore, 0) /
        dashboard.departments.length
      : 0;

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <Badge variant="neutral">Dashboard de departamentos</Badge>
          <div className="mt-5 max-w-sm">
            <CompanySwitcher
              companies={companies}
              selectedCompanyId={dashboard.companyId}
            />
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Salud departamental en {dashboard.companyName}.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Estado actual de salud, contexto de tendencias, factores de riesgo recurrentes y señales
            que requieren intervención prioritaria — para cada equipo de la organización.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Headcount total</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{totalHeadcount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Departamentos</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{dashboard.departments.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Engagement promedio</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{avgEngagement.toFixed(0)}/100</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Tasa saludable</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">
                {dashboard.departments.length > 0
                  ? Math.round((healthyCount / dashboard.departments.length) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              label: "En Riesgo",
              value: criticalCount,
              icon: Flame,
              tone: "critical" as const,
              description: "Departamentos que requieren atención inmediata.",
            },
            {
              label: "En Alerta",
              value: warningCount,
              icon: Activity,
              tone: "warning" as const,
              description: "Departamentos con señales de alerta temprana.",
            },
            {
              label: "Saludables",
              value: healthyCount,
              icon: Users,
              tone: "positive" as const,
              description: "Departamentos dentro de umbrales aceptables.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-[28px] border border-slate-200/80 bg-white/90 p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <Badge variant={item.tone}>{item.label}</Badge>
                <item.icon className="size-4 text-slate-500" />
              </div>
              <p className="mt-4 font-serif text-4xl font-semibold text-slate-950">
                {item.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <SectionCard
        eyebrow="Vista operativa"
        title="Tarjetas por departamento"
        description="Ordenadas por severidad primero, luego por riesgo de rotación promedio."
      >
        <div className="grid gap-5 xl:grid-cols-2">
          {dashboard.departments.map((department) => (
            <div
              key={department.departmentId}
              className="rounded-[28px] border border-slate-200 bg-white p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-950">
                      {department.name}
                    </h2>
                    <Badge variant={department.tone}>{department.health}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Último mes: {department.latestMonth ?? "N/A"} · Headcount: {department.headcount}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Rotación</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatPercentage(department.turnoverRate)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Ausentismo</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatPercentage(department.absenteeismRate)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Engagement</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {department.engagementScore.toFixed(0)}/100
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Burnout</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {department.burnoutRiskAvg.toFixed(0)}/100
                  </dd>
                </div>
              </dl>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Tendencia de rotación</p>
                  <SparklineChart
                    data={department.trends}
                    yKey="attritionRiskAvg"
                    stroke="#ef4444"
                    format="score"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Tendencia de burnout</p>
                  <SparklineChart
                    data={department.trends}
                    yKey="burnoutRiskAvg"
                    stroke="#f97316"
                    format="score"
                  />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-700">Principales factores</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {department.topDrivers.length > 0 ? (
                    department.topDrivers.map((driver) => (
                      <Badge key={driver} variant="neutral">
                        {driver}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Sin factores dominantes registrados aún.</span>
                  )}
                </div>
              </div>

              <div className="mt-5 space-y-2">
                {department.insights.map((insight) => (
                  <div
                    key={insight}
                    className="flex gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-700"
                  >
                    <InsightIcon text={insight} />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Comparación"
        title="Tabla comparativa de departamentos"
        description="Lectura cruzada rápida para líderes de RR.HH. y gerencia general."
      >
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Departamento</th>
                <th className="px-4 py-3 font-medium">Salud</th>
                <th className="px-4 py-3 font-medium">Headcount</th>
                <th className="px-4 py-3 font-medium">Rotación</th>
                <th className="px-4 py-3 font-medium">Riesgo rotación</th>
                <th className="px-4 py-3 font-medium">Burnout</th>
                <th className="px-4 py-3 font-medium">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dashboard.departments.map((department) => (
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
                    {department.attritionRiskAvg.toFixed(0)}/100
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {department.burnoutRiskAvg.toFixed(0)}/100
                  </td>
                  <td className="px-4 py-4 text-slate-600">
                    {department.engagementScore.toFixed(0)}/100
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
