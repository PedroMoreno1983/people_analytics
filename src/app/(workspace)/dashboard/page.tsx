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
  if (lower.includes("risk") || lower.includes("elevated") || lower.includes("above")) {
    return <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />;
  }
  if (lower.includes("no material") || lower.includes("no acute")) {
    return <CheckCircle className="mt-0.5 size-4 shrink-0 text-emerald-500" />;
  }
  if (lower.includes("concentrated") || lower.includes("increased")) {
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
          No analytics summary is available yet. Seed the database and run the analytics pipeline first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {(summary as any).isDemo && (
        <div className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-3 text-sm text-amber-800">
          <AlertTriangle className="size-4 shrink-0 text-amber-500" />
          <span><strong>Demo Mode</strong> — connect a PostgreSQL database and seed it to see live data. <Link href="/upload" className="underline">Upload data →</Link></span>
        </div>
      )}
      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <div className="rounded-[34px] border border-slate-200/80 bg-white/90 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="neutral">Executive dashboard</Badge>
            {summary.latestMonth ? (
              <Badge variant="positive">Latest month {summary.latestMonth}</Badge>
            ) : null}
          </div>
          <h1 className="mt-5 font-serif text-4xl font-semibold tracking-tight text-slate-950">
            {summary.companyName} organizational health overview.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-600">
            Real-time organizational intelligence: operational metrics, attrition risk,
            burnout signals, department health and executive insights — all computed from
            your latest HR data.
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
            How to read this dashboard
          </p>
          <div className="mt-5 space-y-4">
            <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <TrendingDown className="mt-1 size-4 shrink-0 text-rose-300" />
              <div>
                <p className="font-medium text-white">Where risk concentrates</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Department health and attrition distribution show where the people system is under pressure.
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-[24px] border border-white/10 bg-white/5 p-4">
              <TrendingUp className="mt-1 size-4 shrink-0 text-emerald-300" />
              <div>
                <p className="font-medium text-white">What is changing</p>
                <p className="mt-1 text-sm leading-6 text-slate-300">
                  Trend charts expose whether turnover, engagement and burnout are stabilizing or degrading.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-5">
        {summary.kpis.map((item) => (
          <MetricCard key={item.label} {...item} footer="From latest analytics month" />
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
        <SectionCard
          eyebrow="Department health"
          title="Heatmap and operating table"
          description="Each row is scored on attrition risk, burnout risk and engagement against the current thresholds."
        >
          <div className="overflow-hidden rounded-[24px] border border-slate-200">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Department</th>
                  <th className="px-4 py-3 font-medium">Health</th>
                  <th className="px-4 py-3 font-medium">Headcount</th>
                  <th className="px-4 py-3 font-medium">Turnover</th>
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
          eyebrow="Risk distribution"
          title="Attrition risk split"
          description="Risk buckets from EmployeeRiskScore records in the latest scoring month."
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
                  <span className="text-slate-600">Share of scored employees</span>
                </div>
                <span className="font-semibold text-slate-950">{bucket.value}%</span>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          eyebrow="Trend"
          title="Turnover"
          description="Average department turnover by scoring month."
        >
          <LineTrendChart
            data={summary.turnoverTrend}
            xKey="month"
            yKey="turnoverRate"
            stroke="#ef4444"
            formatter={(value) => formatPercentage(value)}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Trend"
          title="Engagement"
          description="Average engagement score across departments."
        >
          <LineTrendChart
            data={summary.engagementTrend}
            xKey="month"
            yKey="engagementScore"
            stroke="#0f172a"
            formatter={(value) => `${value.toFixed(0)}/100`}
          />
        </SectionCard>

        <SectionCard
          eyebrow="Trend"
          title="Burnout risk"
          description="Average burnout risk score across departments."
        >
          <LineTrendChart
            data={summary.burnoutTrend}
            xKey="month"
            yKey="burnoutRiskAvg"
            stroke="#f97316"
            formatter={(value) => `${value.toFixed(0)}/100`}
          />
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Insights"
        title="Key insights"
        description="Rule-based alerts generated from the latest scoring window — short, executive and actionable."
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
        View the department workspace for a team-level operating lens
        <ArrowRight className="size-4" />
      </div>
    </div>
  );
}
