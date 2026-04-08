import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Flame,
  Info,
  Users,
} from "lucide-react";
import Link from "next/link";

import { CompanySwitcher } from "@/components/company-switcher";
import { SparklineChart } from "@/components/charts/sparkline-chart";
import { SectionCard } from "@/components/section-card";
import { Badge } from "@/components/ui/badge";
import { getDepartmentDashboard } from "@/lib/analytics/department-summary";
import type { DepartmentDashboard } from "@/lib/analytics/types";
import { listCompanies } from "@/lib/company";

export const dynamic = "force-dynamic";

type DepartmentEntry = DepartmentDashboard["departments"][number];

function formatPercentage(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function departmentSummary(department: DepartmentEntry) {
  if (department.tone === "critical") {
    return `Hoy ${department.name} aparece como foco rojo: salida real alta, desgaste elevado o engagement bajo.`;
  }

  if (department.tone === "warning") {
    return `${department.name} no está en crisis, pero ya muestra señales que conviene seguir de cerca.`;
  }

  return `${department.name} se ve estable en este corte y puede ofrecer prácticas útiles para otros equipos.`;
}

function departmentAction(department: DepartmentEntry) {
  if (department.turnoverRate > 0.06) {
    return "Hablar con managers y revisar qué está empujando la salida del equipo.";
  }

  if (department.engagementScore < 70) {
    return "Escuchar al equipo y revisar experiencia diaria, apoyo y claridad.";
  }

  if (department.burnoutRiskAvg > 40) {
    return "Mirar carga, ritmos y coordinación antes de que el desgaste siga creciendo.";
  }

  return "Sostener lo que funciona y detectar prácticas para compartir con otras áreas.";
}

function buildPriorityCards(dashboard: DepartmentDashboard) {
  return dashboard.departments.slice(0, 3).map((department, index) => ({
    step: `Prioridad ${index + 1}`,
    title:
      department.tone === "critical"
        ? `${department.name} pide una conversación hoy`
        : department.tone === "warning"
          ? `${department.name} necesita seguimiento cercano`
          : `${department.name} puede ser referencia para otros equipos`,
    description: departmentSummary(department),
    action: departmentAction(department),
    tone: department.tone,
  }));
}

function badgeLabel(tone: DepartmentEntry["tone"]) {
  if (tone === "critical") {
    return "Atención";
  }

  if (tone === "warning") {
    return "Seguimiento";
  }

  return "Estable";
}

function humanizeDriver(driver: string) {
  const normalized = driver.toLowerCase();

  if (normalized.includes("absenteeism") || normalized.includes("ausentismo")) {
    return "Ausentismo";
  }

  if (
    normalized.includes("low engagement") ||
    normalized.includes("engagement bajo") ||
    normalized.includes("bajo engagement")
  ) {
    return "Engagement bajo";
  }

  if (normalized.includes("tenure risk")) {
    return "Tenencia reciente";
  }

  if (
    normalized.includes("performance drop") ||
    normalized.includes("desempeño") ||
    normalized.includes("desempe")
  ) {
    return "Caída de desempeño";
  }

  if (normalized.includes("promotion gap")) {
    return "Desarrollo estancado";
  }

  if (normalized.includes("workload") || normalized.includes("carga de trabajo")) {
    return "Carga de trabajo";
  }

  if (normalized.includes("stress feedback")) {
    return "Apoyo de liderazgo";
  }

  if (normalized.includes("rotaci")) {
    return "Salida real elevada";
  }

  return driver;
}

function buildDepartmentNotes(department: DepartmentEntry) {
  const notes: string[] = [];

  if (department.turnoverRate > 0.06) {
    notes.push("La salida real ya está por encima de un rango saludable para este corte.");
  }

  if (department.burnoutRiskAvg > 40) {
    notes.push("Aparecen señales de desgaste que conviene mirar antes de que escalen.");
  }

  if (department.engagementScore < 70) {
    notes.push("El engagement está por debajo del umbral de referencia para liderazgo.");
  }

  if (notes.length === 0) {
    notes.push("El equipo no muestra una alerta fuerte en el último corte.");
  }

  return notes.slice(0, 2);
}

export default async function DepartmentsPage(props: PageProps<"/departments">) {
  const searchParams = await props.searchParams;
  const selectedCompanyId =
    typeof searchParams.companyId === "string" ? searchParams.companyId : undefined;
  let dashboard: Awaited<ReturnType<typeof getDepartmentDashboard>>;
  let companies: Awaited<ReturnType<typeof listCompanies>>;

  try {
    [dashboard, companies] = await Promise.all([
      getDepartmentDashboard(selectedCompanyId),
      listCompanies(),
    ]);
  } catch {
    return (
      <div className="rounded-[32px] border border-rose-200 bg-white/90 p-8">
        <p className="text-sm text-slate-700">
          No pudimos cargar la vista por equipos en este momento. Revisa la conexión con la base de datos o vuelve a intentar.
        </p>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white/90 p-8">
        <p className="text-sm text-slate-500">
          No hay información por equipos todavía. Corre analytics para abrir esta vista con datos reales.
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
    (sum, department) => sum + department.headcount,
    0,
  );
  const avgEngagement =
    dashboard.departments.length > 0
      ? dashboard.departments.reduce((sum, department) => sum + department.engagementScore, 0) /
        dashboard.departments.length
      : 0;
  const priorityCards = buildPriorityCards(dashboard);

  return (
    <div className="space-y-6">
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
        <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <Badge variant="neutral">Vista por equipos</Badge>
          <div className="mt-5 max-w-sm">
            {companies.length > 0 ? (
              <CompanySwitcher
                companies={companies}
                selectedCompanyId={dashboard.companyId}
              />
            ) : (
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                Cuando haya más de una empresa cargada, aquí podrás cambiar la vista rápidamente.
              </div>
            )}
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Qué equipos necesitan más atención hoy
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Esta pantalla no busca mostrar todo. Busca ayudarte a decidir por donde empezar: que equipos mirar primero,
            qué señales explican el estado actual y cuál es la siguiente conversación util.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Personas activas</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{totalHeadcount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Equipos leídos</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{dashboard.departments.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Engagement promedio</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{avgEngagement.toFixed(0)}/100</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Equipos estables</p>
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
              label: "Atención inmediata",
              value: criticalCount,
              icon: Flame,
              tone: "critical" as const,
              description: "Equipos que hoy merecen una conversación prioritaria.",
            },
            {
              label: "Seguimiento cercano",
              value: warningCount,
              icon: Activity,
              tone: "warning" as const,
              description: "Equipos con señales tempranas que conviene seguir.",
            },
            {
              label: "Estables",
              value: healthyCount,
              icon: Users,
              tone: "positive" as const,
              description: "Equipos dentro de rangos más sanos en este corte.",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col items-center rounded-[28px] border border-slate-200/80 bg-white/90 p-6 text-center"
            >
              <Badge variant={item.tone}>{item.label}</Badge>
              <p className="mt-4 font-serif text-4xl font-semibold text-slate-950">
                {item.value}
              </p>
              <p className="mt-2 text-xs leading-5 text-slate-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        {priorityCards.map((item) => (
          <div
            key={item.step}
            className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-[0_18px_45px_-35px_rgba(15,23,42,0.45)]"
          >
            <Badge variant={item.tone}>{item.step}</Badge>
            <h2 className="mt-4 text-xl font-semibold text-slate-950">{item.title}</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            <div className="mt-4 rounded-[20px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
              {item.action}
            </div>
          </div>
        ))}
      </section>

      <SectionCard
        eyebrow="Lectura por equipo"
        title="Qué significa el estado de cada área"
        description="Cada tarjeta traduce las métricas a una lectura simple y una acción sugerida."
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
                    <h2 className="text-xl font-semibold text-slate-950">{department.name}</h2>
                    <Badge variant={department.tone}>{badgeLabel(department.tone)}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Ultimo corte: {department.latestMonth ?? "N/A"} | Personas activas: {department.headcount}
                  </p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-6 text-slate-700">{departmentSummary(department)}</p>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Salida real</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatPercentage(department.turnoverRate)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Riesgo de salida</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {department.attritionRiskAvg.toFixed(0)}/100
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Señales de desgaste</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {department.burnoutRiskAvg.toFixed(0)}/100
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Engagement</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {department.engagementScore.toFixed(0)}/100
                  </dd>
                </div>
              </dl>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-medium text-slate-700">Salida real en el tiempo</p>
                  <SparklineChart
                    data={department.trends}
                    yKey="turnoverRate"
                    stroke="#ef4444"
                    format="percentage"
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Señales de desgaste</p>
                  <SparklineChart
                    data={department.trends}
                    yKey="burnoutRiskAvg"
                    stroke="#f97316"
                    format="score"
                  />
                </div>
              </div>

              <div className="mt-5">
                  <p className="text-sm font-medium text-slate-700">Factores que más pesan</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {department.topDrivers.length > 0 ? (
                    department.topDrivers.map((driver) => (
                      <Badge key={driver} variant="neutral">
                        {humanizeDriver(driver)}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">Todavía no hay factores dominantes registrados.</span>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-[22px] border border-slate-200 bg-slate-50/80 px-4 py-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Siguiente paso sugerido
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{departmentAction(department)}</p>
              </div>

              <div className="mt-4 space-y-2">
                {buildDepartmentNotes(department).map((note) => (
                  <div
                    key={note}
                    className="flex gap-2.5 rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-700"
                  >
                    {department.tone === "critical" ? (
                      <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                    ) : department.tone === "warning" ? (
                      <Info className="mt-0.5 size-4 shrink-0 text-slate-500" />
                    ) : (
                      <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                    )}
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard
        eyebrow="Comparación"
        title="Tabla simple para liderazgo"
        description="Sirve para comparar equipos sin meterse de lleno en la parte técnica."
      >
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Personas</th>
                <th className="px-4 py-3 font-medium">Salida real</th>
                <th className="px-4 py-3 font-medium">Riesgo de salida</th>
                <th className="px-4 py-3 font-medium">Desgaste</th>
                <th className="px-4 py-3 font-medium">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {dashboard.departments.map((department) => (
                <tr
                  key={department.departmentId}
                  className="transition-colors hover:bg-slate-50/60"
                >
                  <td className="px-4 py-4 font-medium text-slate-950">{department.name}</td>
                  <td className="px-4 py-4">
                    <Badge variant={department.tone}>{badgeLabel(department.tone)}</Badge>
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

      <Link
        href={`/dashboard${dashboard.companyId ? `?companyId=${dashboard.companyId}` : ""}`}
        className="flex items-center gap-2 text-sm font-medium text-slate-600"
      >
        Volver al resumen ejecutivo
        <ArrowRight className="size-4" />
      </Link>
    </div>
  );
}
