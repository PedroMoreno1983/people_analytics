"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Sparkles } from "lucide-react";
import type { PropsWithChildren } from "react";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef4f7_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-slate-200/80 bg-slate-950 px-6 py-8 text-slate-100 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.9)]">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
                <Sparkles className="size-3.5" />
                DataWise
              </div>
              <div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-white">
                  People Analytics
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-300">
                  Explainable HR intelligence for executives and operating teams.
                </p>
              </div>
            </div>

            <nav className="space-y-2">
              {navigationItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "block rounded-3xl border px-4 py-4 transition-colors",
                      active
                        ? "border-white/20 bg-white/12 text-white"
                        : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/8"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <item.icon className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-400">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                <Activity className="size-3.5" />
                Analytics coverage
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                <li>Attrition &amp; burnout risk scoring</li>
                <li>Department health heatmap</li>
                <li>Turnover and engagement trends</li>
                <li>CSV / XLSX data ingestion</li>
              </ul>
            </div>
          </div>
        </aside>

        <main className="min-w-0 py-2">{children}</main>
      </div>
    </div>
  );
}
