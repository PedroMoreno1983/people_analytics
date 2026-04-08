import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Upload,
} from "lucide-react";

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 px-4 py-20 lg:px-6 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 right-[-120px] h-[420px] w-[420px] rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute bottom-[-160px] left-[-80px] h-[360px] w-[360px] rounded-full bg-emerald-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-[1200px]">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-blue-200">
            People Analytics para RR.HH.
          </div>

          <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-tight tracking-tight text-white lg:text-6xl">
            Entiende que esta pasando con tus equipos sin perderte en el dashboard.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            Carga tus datos de RR.HH. y la plataforma te devuelve una lectura simple:
            dónde mirar primero, qué equipos necesitan atención y que conversación conviene abrir.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold !text-white shadow-lg shadow-blue-950/40 transition-colors hover:bg-blue-500 hover:!text-white"
            >
              Empezar por la carga
              <ArrowRight className="size-4" />
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold !text-white backdrop-blur transition-colors hover:bg-white/15 hover:!text-white"
            >
              Ver la lectura ejecutiva
            </Link>
          </div>

          <div className="mt-12 grid gap-4 lg:grid-cols-3">
            {[
              {
                title: "Si estas empezando",
                description: "Sube un archivo de empleados o encuestas y revisa que la plataforma lo entienda bien antes de guardar.",
              },
              {
                title: "Si ya cargaste datos",
                description: "Abre el dashboard para ver un resumen claro: que esta pasando hoy y dónde mirar primero.",
              },
              {
                title: "Si quieres bajar al detalle",
                description: "Entra a equipos para ver que areas necesitan seguimiento y que acción conviene tomar.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-5 backdrop-blur"
              >
                <h2 className="text-lg font-semibold text-white">{item.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-300">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            Como funciona
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-950">
            La herramienta esta pensada para que la lectura salga rápido
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            No hace falta ser analista para usarla. El flujo esta armado para ir de un archivo crudo
            a una lectura acciónable en tres pasos simples.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Upload,
              step: "Paso 1",
              title: "Carga tus archivos",
              description: "Sube empleados, ausentismo, performance o encuestas en CSV o XLSX.",
              color: "bg-blue-600",
              lightBg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              icon: CheckCircle2,
              step: "Paso 2",
              title: "Revisa que todo se entienda",
              description: "La plataforma te muestra una vista previa y te ayuda a relacionar columnas antes de guardar.",
              color: "bg-emerald-600",
              lightBg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              icon: BarChart3,
              step: "Paso 3",
              title: "Lee una historia clara",
              description: "Los dashboards priorizan donde mirar, qué cambió y que conversación conviene abrir.",
              color: "bg-amber-500",
              lightBg: "bg-amber-50",
              border: "border-amber-100",
            },
          ].map((item) => (
            <div
              key={item.title}
              className={`rounded-[28px] border ${item.border} ${item.lightBg} p-6`}
            >
              <div className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.color} text-white shadow-md`}>
                <item.icon className="size-5" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.step}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
              Lo que responde
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-950">
              Preguntas que un lider de RR.HH. puede contestar rápido
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              "Qué equipo necesita atención hoy?",
              "Donde aparecen señales de salida o desgaste?",
              "El problema viene creciendo o fue puntual?",
              "Que conversaciones conviene abrir primero?",
            ].map((question) => (
              <div
                key={question}
                className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.45)]"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">
                  <ArrowRight className="size-4" />
                </div>
                <p className="mt-4 text-base font-semibold leading-7 text-slate-950">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">
            Por donde entrar
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-950">
            Cada pantalla tiene un trabajo claro
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Upload,
              title: "Carga guiada",
              description: "Para subir archivos, revisar columnas y guardar sin adivinar que va a pasar.",
              href: "/upload",
              accent: "text-blue-700",
              bg: "bg-blue-50",
              border: "border-blue-100",
            },
            {
              icon: BarChart3,
              title: "Resumen ejecutivo",
              description: "Para entender rápido la foto general, qué cambió y donde conviene mirar primero.",
              href: "/dashboard",
              accent: "text-emerald-700",
              bg: "bg-emerald-50",
              border: "border-emerald-100",
            },
            {
              icon: Building2,
              title: "Vista por equipos",
              description: "Para bajar al detalle, comparar areas y preparar conversaciones con managers.",
              href: "/departments",
              accent: "text-amber-700",
              bg: "bg-amber-50",
              border: "border-amber-100",
            },
          ].map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group rounded-[28px] border ${item.border} ${item.bg} p-6 transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                <item.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p>
              <div className={`mt-5 flex items-center gap-1 text-sm font-semibold ${item.accent}`}>
                Abrir
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-blue-700 to-slate-900 px-4 py-14 lg:px-6">
        <div className="mx-auto flex max-w-[1200px] flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-white">
              Empieza por un archivo y termina con una lectura acciónable
            </h2>
            <p className="mt-2 text-blue-100">
              La forma más clara de probarlo es cargar datos y abrir después el resumen ejecutivo.
            </p>
          </div>

          <div className="flex flex-shrink-0 gap-3">
            <Link
              href="/upload"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold !text-blue-700 shadow-md transition-colors hover:bg-blue-50 hover:!text-blue-700"
            >
              Subir datos
            </Link>
            <Link
              href="/dashboard"
              className="rounded-full border border-white/30 bg-white/10 px-6 py-3 text-sm font-semibold !text-white backdrop-blur transition-colors hover:bg-white/20 hover:!text-white"
            >
              Ver dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
