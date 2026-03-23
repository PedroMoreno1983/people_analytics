import Link from "next/link";
import { ArrowRight, BarChart3, Building2, ShieldCheck, Upload, Zap } from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-4 py-20 lg:px-6 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[400px] w-[400px] rounded-full bg-purple-600/15 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-[1200px]">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-400/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-300">
            <Zap className="size-3" />
            Plataforma de People Analytics
          </div>
          <h1 className="max-w-3xl font-serif text-5xl font-semibold leading-tight tracking-tight text-white lg:text-6xl">
            Inteligencia organizacional que{" "}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              realmente se explica sola.
            </span>
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Riesgo de rotación en tiempo real, señales de burnout, tendencias de engagement e insights por departamento — impulsado por tus datos de RR.HH.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-900/50 transition-colors hover:bg-indigo-500">
              Abrir dashboard <ArrowRight className="size-4" />
            </Link>
            <Link href="/departments" className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/15">
              Ver departamentos
            </Link>
          </div>
          <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { value: "248", label: "Empleados analizados", color: "text-emerald-400" },
              { value: "7", label: "Departamentos con score", color: "text-indigo-400" },
              { value: "4.8%", label: "Rotación promedio", color: "text-amber-400" },
              { value: "71/100", label: "Score de engagement", color: "text-purple-400" },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <p className={`font-serif text-3xl font-semibold ${stat.color}`}>{stat.value}</p>
                <p className="mt-1 text-sm text-slate-400">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6">
        <div className="mb-10 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Qué incluye</p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-900">Todo lo que tu equipo de RR.HH. necesita</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            { icon: BarChart3, title: "Dashboard Ejecutivo", description: "KPIs, distribución de riesgo, burnout y tendencias de engagement para liderazgo.", href: "/dashboard", bg: "bg-indigo-600", lightBg: "bg-indigo-50", border: "border-indigo-100", textColor: "text-indigo-700" },
            { icon: Building2, title: "Inteligencia Departamental", description: "Cada departamento tiene su tarjeta de salud, factores de riesgo e insights para HRBP.", href: "/departments", bg: "bg-emerald-600", lightBg: "bg-emerald-50", border: "border-emerald-100", textColor: "text-emerald-700" },
            { icon: Upload, title: "Ingesta CSV / XLSX", description: "Subí un archivo, mapeá columnas automáticamente y disparará el pipeline de analytics.", href: "/upload", bg: "bg-amber-500", lightBg: "bg-amber-50", border: "border-amber-100", textColor: "text-amber-700" },
            { icon: ShieldCheck, title: "Scores Explicables", description: "Rotación y burnout descompuestos en factores ponderados. RR.HH. entiende el porqué.", href: "/dashboard", bg: "bg-rose-600", lightBg: "bg-rose-50", border: "border-rose-100", textColor: "text-rose-700" },
          ].map((feature) => (
            <Link key={feature.title} href={feature.href} className={`group rounded-3xl border ${feature.border} ${feature.lightBg} p-6 transition-all hover:-translate-y-1 hover:shadow-lg`}>
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${feature.bg} text-white shadow-md`}>
                <feature.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-900">{feature.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{feature.description}</p>
              <div className={`mt-4 flex items-center gap-1 text-sm font-semibold ${feature.textColor}`}>
                Explorar <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-slate-200 bg-white px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="mb-10 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-600">Arquitectura</p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-900">Pipeline de analytics en cinco capas</h2>
            <p className="mt-3 text-slate-500">Los datos HR fluyen por ingesta, normalización, scoring y almacenamiento antes de alimentar los dashboards.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-5">
            {[
              { step: "01", name: "Ingesta", detail: "Parseo CSV/XLSX, preview, mapeo de columnas, validación." },
              { step: "02", name: "Datos Operativos", detail: "Empleados, ausentismo, evaluaciones, encuestas." },
              { step: "03", name: "Servicios Analytics", detail: "Rotación, engagement, riesgo de rotación, burnout." },
              { step: "04", name: "Almacenamiento", detail: "EmployeeRiskScore y TeamMetricsMonthly." },
              { step: "05", name: "Consultas Dashboard", detail: "Resumen ejecutivo, tendencias, distribuciones." },
            ].map((layer, i) => (
              <div key={layer.step} className="relative rounded-2xl border border-slate-200 bg-slate-50 p-5">
                {i < 4 && (
                  <div className="absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <ArrowRight className="size-2.5" />
                    </div>
                  </div>
                )}
                <p className="text-xs font-bold text-indigo-400">{layer.step}</p>
                <h3 className="mt-2 font-semibold text-slate-900">{layer.name}</h3>
                <p className="mt-1 text-xs leading-5 text-slate-500">{layer.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-14 lg:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-white">¿Listo para ver la salud de tu organización?</h2>
            <p className="mt-2 text-indigo-200">Subí tus datos de RR.HH. y obtené insights en minutos.</p>
          </div>
          <div className="flex flex-shrink-0 gap-3">
            <Link href="/dashboard" className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-indigo-700 shadow-md transition-colors hover:bg-indigo-50">
              Abrir dashboard
            </Link>
            <Link href="/upload" className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/20">
              Subir datos
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
