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
  if (lower.includes("elevated") || lower.includes("above") || lower.includes("below")) {
    return <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-500" />;
  }
  if (lower.includes("no acute") || lower.includes("no material")) {
    return <CheckCircle className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />;
  }
  if (lower.includes("high attrition") || lower.includes("employees are in high")) {
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
          No department analytics are available yet. Seed the database and run the analytics pipeline first.
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
          <Badge variant="neutral">Department dashboard</Badge>
          <div className="mt-5 max-w-sm">
            <CompanySwitcher
              companies={companies}
              selectedCompanyId={dashboard.companyId}
            />
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            Department health in {dashboard.companyName}.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Latest health state, trend context, recurring risk drivers and signals
            that deserve intervention first — for every team in the organization.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 sm:grid-cols-4">
            <div>
              <p className="text-xs font-medium text-slate-500">Total headcount</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{totalHeadcount}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Departments</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{dashboard.departments.length}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Avg engagement</p>
              <p className="mt-1 font-serif text-2xl font-semibold text-slate-950">{avgEngagement.toFixed(0)}/100</p>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Healthy rate</p>
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
              label: "At Risk",
              value: criticalCount,
              icon: Flame,
              tone: "critical" as const,
              description: "Departments requiring immediate attention.",
            },
            {
              label: "Watch",
              value: warningCount,
              icon: Activity,
              tone: "warning" as const,
              description: "Departments showing early warning signals.",
            },
            {
              label: "Healthy",
              value: healthyCount,
              icon: Users,
              tone: "positive" as const,
              description: "Departments within acceptable thresholds.",
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
        eyebrow="Operating view"
        title="Department cards"
        description="Sorted by severity first, then by attrition risk average."
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
                    Latest month {department.latestMonth ?? "N/A"} · Headcount {department.headcount}
                  </p>
                </div>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Turnover</dt>
                  <dd className="mt-1 font-semibold text-slate-950">
                    {formatPercentage(department.turnoverRate)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-slate-50 p-3">
                  <dt className="text-slate-500">Absenteeism</dt>
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
                  <p className="text-sm font-medium text-slate-700">Attrition trend</p>
                  <SparklineChart
                    data={department.trends}
                    yKey="attritionRiskAvg"
                    stroke="#ef4444"
                    formatter={(value) => `${value.toFixed(0)}/100`}
                  />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Burnout trend</p>
                  <SparklineChart
                    data={department.trends}
                    yKey="burnoutRiskAvg"
                    stroke="#f97316"
                    formatter={(value) => `${value.toFixed(0)}/100`}
                  />
                </div>
              </div>

              <div className="mt-5">
                <p className="text-sm font-medium text-slate-700">Top drivers</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {department.topDrivers.length > 0 ? (
                    department.topDrivers.map((driver) => (
                      <Badge key={driver} variant="neutral">
                        {driver}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500">No dominant drivers captured yet.</span>
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
        eyebrow="Comparison"
        title="Department comparison table"
        description="Quick cross-team read for HR leadership and general management."
      >
        <div className="overflow-hidden rounded-[24px] border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3 font-medium">Department</th>
                <th className="px-4 py-3 font-medium">Health</th>
                <th className="px-4 py-3 font-medium">Headcount</th>
                <th className="px-4 py-3 font-medium">Turnover</th>
                <th className="px-4 py-3 font-medium">Attrition risk</th>
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
