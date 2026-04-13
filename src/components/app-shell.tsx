"use client";

import { Suspense, type PropsWithChildren } from "react";
import {
  Activity,
  ArrowUpRight,
  LockKeyhole,
  LogOut,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { logoutAction } from "@/app/actions/auth";
import { CopilotPanel } from "@/components/copilot-panel";
import { navigationItems } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type AppShellProps = PropsWithChildren<{
  currentUser: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}>;

function CopilotFallback() {
  return null;
}

function getRouteMeta(pathname: string) {
  return (
    navigationItems.find((item) => pathname === item.href) ?? {
      label: "Workspace",
      description: "People analytics operativo para equipos de RR.HH. y liderazgo.",
    }
  );
}

function getRoleLabel(role: string) {
  if (role === "ADMIN") {
    return "Admin";
  }

  if (role === "ANALYST") {
    return "Analyst";
  }

  return "Viewer";
}

export function AppShell({ children, currentUser }: AppShellProps) {
  const pathname = usePathname();
  const routeMeta = getRouteMeta(pathname);

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.10),_transparent_24%),radial-gradient(circle_at_bottom_right,_rgba(129,140,248,0.12),_transparent_30%),linear-gradient(180deg,#edf2ff_0%,#f8fafc_42%,#eef2ff_100%)]">
      <div className="mx-auto grid min-h-screen max-w-[1680px] gap-5 px-4 py-4 lg:grid-cols-[292px_minmax(0,1fr)] lg:px-5">
        <aside className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[linear-gradient(180deg,#0f172a_0%,#111827_45%,#1e1b4b_100%)] px-5 py-7 text-slate-100 shadow-[0_32px_90px_-22px_rgba(79,70,229,0.45)]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(56,189,248,0.18)_0%,transparent_50%),radial-gradient(ellipse_at_bottom_right,rgba(129,140,248,0.14)_0%,transparent_50%)]" />

          <div className="relative space-y-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 shadow-lg shadow-indigo-950/50">
                <Sparkles className="size-4.5 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-cyan-200">
                  DataWise
                </p>
                <p className="text-sm font-semibold text-white">People Analytics</p>
              </div>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/6 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/10 text-cyan-100">
                  <ShieldCheck className="size-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{currentUser.name}</p>
                  <p className="text-xs text-slate-400">
                    {getRoleLabel(currentUser.role)} · {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-2xl border border-cyan-400/15 bg-cyan-400/10 px-3 py-2 text-xs text-cyan-100">
                <LockKeyhole className="size-3.5" />
                Sesión real protegida
              </div>
            </div>

            <nav className="space-y-1.5">
              {navigationItems.map((item) => {
                const active = pathname === item.href;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group flex items-start gap-3 rounded-2xl border px-4 py-3.5 transition-all duration-200",
                      active
                        ? "border-cyan-400/25 bg-gradient-to-r from-cyan-400/16 to-indigo-500/18 !text-white shadow-sm shadow-indigo-950/30"
                        : "border-white/6 bg-white/[0.03] !text-slate-400 hover:border-white/10 hover:bg-white/[0.06] hover:!text-white",
                    )}
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
                        active
                          ? "bg-white/12 text-cyan-100"
                          : "bg-white/6 text-slate-500 group-hover:text-slate-300",
                      )}
                    >
                      <item.icon className="size-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold">{item.label}</div>
                      <div className="mt-0.5 text-xs leading-5 text-slate-500">
                        {item.description}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </nav>

            <div className="rounded-[26px] border border-indigo-400/15 bg-indigo-400/10 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-200">
                <Activity className="size-3.5" />
                Lo que puedes hacer aquí
              </div>
              <ul className="mt-3 space-y-2 text-xs leading-5 text-slate-300">
                {[
                  "Entrar al workspace con sesión real",
                  "Leer prioridades por empresa, equipo y persona",
                  "Cargar archivos con validación antes de guardar",
                  "Usar el copiloto con contexto del workspace",
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-300/80" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        <div className="min-w-0 py-2">
          <div className="mb-5 flex flex-col gap-4 rounded-[30px] border border-white/70 bg-white/70 px-6 py-5 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
                Workspace privado
              </p>
              <h1 className="mt-2 font-serif text-3xl font-semibold tracking-tight text-slate-950">
                {routeMeta.label}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">
                {routeMeta.description}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/upload"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium !text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:!text-indigo-700"
              >
                Cargar datos
                <ArrowUpRight className="size-4" />
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-slate-800"
                >
                  Salir
                  <LogOut className="size-4" />
                </button>
              </form>
            </div>
          </div>

          <main className="min-w-0">{children}</main>
        </div>
      </div>

      <Suspense fallback={<CopilotFallback />}>
        <CopilotPanel />
      </Suspense>
    </div>
  );
}
