"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Database, Sparkles } from "lucide-react";
import type { PropsWithChildren } from "react";

import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

export function AppShell({ children }: PropsWithChildren) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fbf8f2_0%,#f1f7f8_45%,#f9fbfc_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] gap-6 px-4 py-4 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-6">
        <aside className="rounded-[32px] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(239,246,248,0.97))] px-6 py-8 text-slate-900 shadow-[0_26px_70px_-42px_rgba(35,58,79,0.26)] backdrop-blur">
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#4f8d96]/18 bg-[#ebf5f4] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#376d77]">
                <Sparkles className="size-3.5 text-[#4f8d96]" />
                Demo DataWise
              </div>
              <div>
                <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-950">
                  Analitica de Personas
                </h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Salud organizacional, alertas individuales, vista por equipo y carga
                  gobernada de datos en un solo espacio de trabajo.
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
                      "block rounded-3xl border px-4 py-4 transition-all",
                      active
                        ? "border-[#4f8d96]/22 bg-[linear-gradient(135deg,#eef7f7_0%,#ffffff_100%)] text-[#18314d] shadow-[0_18px_34px_-28px_rgba(35,58,79,0.28)]"
                        : "border-transparent bg-white/58 text-slate-700 hover:border-white/80 hover:bg-white/84"
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <item.icon className="mt-0.5 size-4 shrink-0" />
                      <div>
                        <div className="text-sm font-semibold">{item.label}</div>
                        <div className="mt-1 text-xs leading-5 text-slate-500">
                          {item.description}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[28px] border border-[#d7e3ea] bg-white/78 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                <Database className="size-3.5 text-[#4f8d96]" />
                Alcance actual
              </div>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Dashboard ejecutivo y cola priorizada de personas sobre Prisma</li>
                <li>Pipeline analitico con scoring explicable de fuga y burnout</li>
                <li>Lectura operativa por manager, area y siguiente accion sugerida</li>
                <li>Carga gobernada de CSV/XLSX a tablas normalizadas de RR.HH.</li>
                <li>Datos demo listos para una historia comercial completa</li>
              </ul>
            </div>
          </div>
        </aside>

        <main className="min-w-0 py-2">{children}</main>
      </div>
    </div>
  );
}
