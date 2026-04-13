import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Database,
  ShieldCheck,
  Upload,
  Users,
} from "lucide-react";

const workflowSteps = [
  {
    step: "Paso 1",
    title: "Carga y valida",
    description:
      "Sube empleados, ausentismo, desempeño o encuestas sin guardar a ciegas.",
    color: "bg-blue-600",
    border: "border-blue-100",
    background: "bg-blue-50",
    icon: Upload,
  },
  {
    step: "Paso 2",
    title: "Ordena el modelo",
    description:
      "La plataforma transforma archivos sueltos en personas, equipos, scores y métricas mensuales.",
    color: "bg-emerald-600",
    border: "border-emerald-100",
    background: "bg-emerald-50",
    icon: Database,
  },
  {
    step: "Paso 3",
    title: "Lee y decide",
    description:
      "El dashboard y la vista por equipos te ayudan a priorizar conversaciones concretas.",
    color: "bg-amber-500",
    border: "border-amber-100",
    background: "bg-amber-50",
    icon: BarChart3,
  },
];

const modelCards = [
  {
    title: "Datos operativos",
    detail:
      "Personas, equipos, managers, ausencias, promociones, desempeño y encuestas.",
  },
  {
    title: "Scoring explicable",
    detail:
      "Riesgo de salida y desgaste por persona, con drivers que ayudan a explicar la lectura.",
  },
  {
    title: "Lectura por equipo",
    detail:
      "Headcount, turnover, ausentismo, engagement y burnout mensual por área.",
  },
  {
    title: "Carga guiada",
    detail:
      "Plantillas, validación de columnas y persistencia ordenada para no depender de una demo.",
  },
];

const entryPoints = [
  {
    href: "/upload",
    title: "Carga guiada",
    description:
      "Para empezar con datos reales, revisar columnas y guardar con contexto.",
    icon: Upload,
    accent: "text-blue-700",
    background: "bg-blue-50",
    border: "border-blue-100",
  },
  {
    href: "/dashboard",
    title: "Resumen ejecutivo",
    description:
      "Para leer rápido dónde mirar primero y qué cambió en los últimos cortes.",
    icon: BarChart3,
    accent: "text-emerald-700",
    background: "bg-emerald-50",
    border: "border-emerald-100",
  },
  {
    href: "/people",
    title: "People Explorer",
    description:
      "Para bajar a la persona, mirar cobertura, drivers y focos concretos de seguimiento.",
    icon: Users,
    accent: "text-fuchsia-700",
    background: "bg-fuchsia-50",
    border: "border-fuchsia-100",
  },
  {
    href: "/departments",
    title: "Vista por equipos",
    description:
      "Para bajar a las áreas, comparar riesgos y preparar conversaciones con managers.",
    icon: Building2,
    accent: "text-amber-700",
    background: "bg-amber-50",
    border: "border-amber-100",
  },
];

export default function HomePage() {
  return (
    <main>
      <section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,#050816_0%,#0f172a_45%,#172554_100%)] px-4 py-20 lg:px-6 lg:py-28">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-24 top-8 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />
          <div className="absolute bottom-[-120px] left-[-60px] h-72 w-72 rounded-full bg-fuchsia-500/10 blur-3xl" />
        </div>

        <div className="relative mx-auto grid max-w-[1200px] gap-10 xl:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              People Analytics para RR.HH.
            </div>

            <h1 className="mt-6 max-w-4xl font-serif text-5xl font-semibold leading-tight tracking-tight text-white lg:text-6xl">
              Convierte archivos dispersos en una lectura clara sobre equipos,
              riesgo y prioridades de gestión.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              DataWise no parte de una maqueta. Parte de un modelo real de
              personas, encuestas, desempeño, ausentismo y scores explicables
              para que RR.HH. pueda entender qué está pasando y por dónde
              conviene empezar.
            </p>

            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-full bg-cyan-500 px-6 py-3 text-sm font-semibold !text-slate-950 shadow-lg shadow-cyan-950/30 transition-colors hover:bg-cyan-400 hover:!text-slate-950"
              >
                Entrar al workspace
                <ArrowRight className="size-4" />
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold !text-white backdrop-blur transition-colors hover:bg-white/15 hover:!text-white"
              >
                Ver la lectura ejecutiva
              </Link>
            </div>
          </div>

          <div className="grid gap-4">
            <div className="rounded-[30px] border border-white/10 bg-white/8 p-6 backdrop-blur">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 text-cyan-200">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">
                    Lo que resuelve
                  </p>
                  <p className="mt-1 text-lg font-semibold text-white">
                    De la carga al criterio
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-slate-300">
                No se trata de sumar widgets. Se trata de llegar rápido a una
                conversación útil con liderazgo y managers.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              {[
                "Qué equipos necesitan atención hoy",
                "Dónde se concentra el riesgo de salida",
                "Si el desgaste viene creciendo o fue puntual",
                "Qué conversación conviene abrir primero",
              ].map((question) => (
                <div
                  key={question}
                  className="rounded-[26px] border border-white/10 bg-slate-900/65 p-5"
                >
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white">
                    <CheckCircle2 className="size-4" />
                  </div>
                  <p className="mt-4 text-base font-semibold leading-7 text-white">
                    {question}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Cómo funciona
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-950">
            La experiencia está pensada para que la lectura salga rápido, pero
            con datos de verdad detrás.
          </h2>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {workflowSteps.map((item) => (
            <div
              key={item.title}
              className={`rounded-[28px] border ${item.border} ${item.background} p-6`}
            >
              <div
                className={`inline-flex h-11 w-11 items-center justify-center rounded-2xl ${item.color} text-white shadow-md`}
              >
                <item.icon className="size-5" />
              </div>
              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                {item.step}
              </p>
              <h3 className="mt-2 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-4 py-16 lg:px-6">
        <div className="mx-auto max-w-[1200px]">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
              Modelo de datos
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-950">
              La plataforma ya está armada sobre una base analítica, no sobre
              tarjetas sueltas.
            </h2>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {modelCards.map((item) => (
              <div
                key={item.title}
                className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-[0_14px_40px_-35px_rgba(15,23,42,0.45)]"
              >
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white">
                  <Users className="size-4" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-slate-950">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-4 py-16 lg:px-6">
        <div className="mb-10 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-cyan-700">
            Por dónde entrar
          </p>
          <h2 className="mt-3 font-serif text-3xl font-semibold text-slate-950">
            Cada pantalla tiene un trabajo claro dentro del flujo.
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {entryPoints.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group rounded-[28px] border ${item.border} ${item.background} p-6 transition-all hover:-translate-y-1 hover:shadow-lg`}
            >
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-slate-950 shadow-sm">
                <item.icon className="size-5" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-slate-950">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {item.description}
              </p>
              <div
                className={`mt-5 flex items-center gap-1 text-sm font-semibold ${item.accent}`}
              >
                Abrir
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
