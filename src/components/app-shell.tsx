"use client";

import { Suspense, type PropsWithChildren } from "react";
import { Activity, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { CopilotPanel } from "@/components/copilot-panel";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

function CopilotFallback() {
  return null;
}

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#eef1fb]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-5 px-4 py-4 lg:grid-cols-[272px_minmax(0,1fr)] lg:px-5">
        {/* Sidebar */}
        <aside className="relative overflow-hidden rounded-[28px] bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-950 px-5 py-7 text-slate-100 shadow-[0_32px_80px_-20px_rgba(79,70,229,0.4)]">
          {/* Subtle noise/glow overlay */}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.18)_0%,transparent_60%)]" />
          <div className="pointer-events-none absolute bottom-0 right-0 h-48 w-48 rounded-full bg-violet-600/10 blur-3xl" />

          <div className="relative space-y-6">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-500 shadow-lg shadow-indigo-900/50">
                <Sparkles className="size-4 text-white" />
              </div>
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-indigo-300">
                  DataWise
                </p>
                <p className="text-sm font-semibold text-white">People Analytics</p>
              </div>
            </div>

            <div className="h-px bg-gradient-to-r from-indigo-500/50 via-violet-400/20 to-transparent" />

            {/* Nav */}
            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200",
                      active
                        ? "border-indigo-400/40 bg-gradient-to-r from-indigo-500/25 to-violet-500/15 !text-white shadow-sm shadow-indigo-900/30"
                        : "border-white/5 bg-white/4 !text-slate-400 hover:border-white/10 hover:bg-white/8 hover:!text-white",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl transition-colors",
                        active
                          ? "bg-gradient-to-br from-indigo-400/60 to-violet-400/40 text-indigo-100"
                          : "bg-white/8 text-slate-500",
                      )}
                    >
                      <item.icon className="size-3.5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-0.5 text-xs leading-5 text-slate-500">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            {/* Info box */}
            <div className="rounded-2xl border border-indigo-500/20 bg-indigo-500/8 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.15em] text-indigo-300">
                <Activity className="size-3.5" />
                Lo que puedes leer aquí
              </div>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-400">
                {[
                  "Qué equipos necesitan atención hoy",
                  "Dónde aparecen señales de salida o desgaste",
                  "Cómo vienen cambiando las tendencias",
                  "Cómo cargar datos sin hacerlo a ciegas",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-indigo-400/70" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <main className="min-w-0 py-2">{children}</main>
      </div>

      <Suspense fallback={<CopilotFallback />}>
        <CopilotPanel />
      </Suspense>
    </div>
  );
}
