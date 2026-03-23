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
    <div className="min-h-screen bg-[#f0f4ff]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[28px] bg-gradient-to-b from-slate-900 to-indigo-950 px-5 py-7 text-slate-100 shadow-[0_24px_80px_-20px_rgba(79,70,229,0.4)]">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500 shadow-md shadow-indigo-900/50">
                <Sparkles className="size-4 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-400">DataWise</p>
                <p className="font-semibold text-white">People Analytics</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-indigo-500/50 via-purple-500/30 to-transparent" />

            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all",
                      active
                        ? "border-indigo-400/40 bg-indigo-500/20 text-white shadow-sm shadow-indigo-900/30"
                        : "border-white/5 bg-white/5 text-slate-300 hover:border-white/10 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg",
                      active ? "bg-indigo-500/40 text-indigo-200" : "bg-white/10 text-slate-400"
                    )}>
                      <item.icon className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-0.5 text-xs leading-5 text-slate-400">{item.description}</div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/10 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-400">
                <Activity className="size-3.5" />
                Cobertura analítica
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                {[
                  "Scoring de riesgo de rotación y burnout",
                  "Mapa de calor de salud departamental",
                  "Tendencias de rotación y engagement",
                  "Ingesta de datos CSV / XLSX",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="h-1 w-1 rounded-full bg-indigo-400" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="min-w-0 py-2">{children}</main>
      </div>
    </div>
  );
}
