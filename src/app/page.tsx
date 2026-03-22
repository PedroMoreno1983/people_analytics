import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  Database,
  ShieldCheck,
  Upload,
} from "lucide-react";

import { SectionCard } from "@/components/section-card";
import { buttonVariants } from "@/components/ui/button";
import { architectureLayers } from "@/lib/placeholder-data";

export default function HomePage() {
  return (
    <main className="mx-auto max-w-[1600px] px-4 py-8 lg:px-6 lg:py-10">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="rounded-[36px] border border-slate-200/80 bg-white/85 p-8 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.5)] lg:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
            DataWise People Analytics
          </p>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl font-semibold tracking-tight text-slate-950">
            Explainable people analytics for executive and operating teams.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Real-time organizational health intelligence — attrition risk, burnout signals,
            engagement trends and department-level insights, all driven by your HR data.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/dashboard" className={buttonVariants({ size: "lg" })}>
              Open dashboard
            </Link>
            <Link
              href="/departments"
              className={buttonVariants({ variant: "secondary", size: "lg" })}
            >
              View departments
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            {
              icon: Database,
              title: "PostgreSQL + Prisma foundation",
              description:
                "All HR data persisted in a normalized schema: employees, absences, performance reviews, surveys and computed risk scores.",
            },
            {
              icon: Upload,
              title: "CSV / XLSX ingestion",
              description:
                "Upload employee files directly and map columns to normalized fields with automatic header synonym matching.",
            },
            {
              icon: BarChart3,
              title: "Executive dashboard",
              description:
                "KPIs, attrition risk distribution, turnover and engagement trends — all computed from live analytics data.",
            },
            {
              icon: ShieldCheck,
              title: "Explainable risk scoring",
              description:
                "Attrition and burnout scores are decomposed into weighted drivers so HR leaders understand the why behind every signal.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-[28px] border border-slate-200/80 bg-white/80 p-6"
            >
              <item.icon className="size-5 text-slate-700" />
              <h2 className="mt-4 text-xl font-semibold text-slate-950">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          {
            icon: BarChart3,
            label: "Executive visibility",
            title: "Org health at a glance",
            description:
              "Headcount, turnover, engagement and burnout risk rolled up to a single executive dashboard with department drill-down.",
            href: "/dashboard",
            cta: "Open dashboard",
          },
          {
            icon: Building2,
            label: "Operating teams",
            title: "Department-level intelligence",
            description:
              "Each department gets its own health card, trend sparklines, top risk drivers and actionable insights for HR business partners.",
            href: "/departments",
            cta: "View departments",
          },
          {
            icon: Upload,
            label: "Data ingestion",
            title: "Upload and update",
            description:
              "Drop a CSV or XLSX file, preview the data, map columns and trigger the analytics pipeline to refresh all scores and metrics.",
            href: "/upload",
            cta: "Upload data",
          },
        ].map((item) => (
          <div
            key={item.title}
            className="rounded-[30px] border border-slate-200/80 bg-white/85 p-8"
          >
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {item.label}
            </p>
            <h2 className="mt-4 font-serif text-2xl font-semibold text-slate-950">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {item.description}
            </p>
            <Link
              href={item.href}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-900"
            >
              {item.cta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="mt-6">
        <SectionCard
          eyebrow="Architecture"
          title="Five-layer analytics pipeline"
          description="Raw HR data flows through ingestion, normalization, explainable scoring and analytics storage before powering dashboard queries."
          action={
            <Link
              href="/api/health"
              className={buttonVariants({ variant: "secondary", size: "sm" })}
            >
              Runtime check
            </Link>
          }
        >
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {architectureLayers.map((layer, index) => (
              <div
                key={layer.name}
                className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-5"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Layer {index + 1}
                </p>
                <h3 className="mt-3 text-lg font-semibold text-slate-950">
                  {layer.name}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {layer.detail}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </section>
    </main>
  );
}
