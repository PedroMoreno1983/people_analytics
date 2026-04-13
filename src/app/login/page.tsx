import { ArrowRight, LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loginAction } from "@/app/actions/auth";
import { getAuthenticatedUser } from "@/lib/auth/server";

type LoginPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const errorMessages: Record<string, string> = {
  invalid_credentials: "El correo o la contraseña no coinciden con un usuario habilitado.",
  missing_credentials: "Ingresa correo y contraseña para abrir el workspace.",
};

export default async function LoginPage(props: LoginPageProps) {
  const [user, searchParams] = await Promise.all([
    getAuthenticatedUser(),
    props.searchParams,
  ]);

  if (user) {
    redirect("/dashboard");
  }

  const errorKey =
    typeof searchParams.error === "string" ? searchParams.error : undefined;
  const nextPath =
    typeof searchParams.next === "string" ? searchParams.next : "/dashboard";

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(56,189,248,0.16),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_45%,#111827_100%)] px-4 py-10 lg:px-6 lg:py-16">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-[1240px] gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)]">
        <section className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/6 p-8 text-white shadow-[0_32px_80px_-24px_rgba(15,23,42,0.55)] backdrop-blur-xl lg:p-12">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.16),transparent_32%)]" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-cyan-100">
              <Sparkles className="size-3.5" />
              Workspace seguro
            </div>

            <h1 className="mt-8 max-w-3xl font-serif text-5xl font-semibold leading-tight tracking-tight text-white lg:text-6xl">
              People Analytics con acceso real, lectura ejecutiva y detalle operativo.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-slate-300">
              Entramos a un workspace privado con sesiones reales, lectura por equipos,
              exploración por persona y carga guiada para que el producto se sienta
              plataforma, no demo.
            </p>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Resumen ejecutivo",
                  description: "Qué está pasando hoy, dónde mirar primero y cómo cambió el pulso.",
                  icon: ShieldCheck,
                },
                {
                  title: "People Explorer",
                  description: "Cobertura analítica, riesgo individual y drivers explicables.",
                  icon: LockKeyhole,
                },
                {
                  title: "Carga guiada",
                  description: "Sube archivos con validación antes de guardar en la base real.",
                  icon: ArrowRight,
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-[28px] border border-white/10 bg-slate-950/35 p-5"
                >
                  <item.icon className="size-5 text-cyan-200" />
                  <h2 className="mt-4 text-lg font-semibold text-white">{item.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex items-center">
          <div className="w-full rounded-[36px] border border-white/10 bg-white p-8 shadow-[0_32px_80px_-24px_rgba(15,23,42,0.45)] lg:p-10">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg shadow-slate-300/40">
              <LockKeyhole className="size-5" />
            </div>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.22em] text-indigo-600">
              Inicio de sesión
            </p>
            <h2 className="mt-3 font-serif text-3xl font-semibold tracking-tight text-slate-950">
              Entra al workspace
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Usa un usuario habilitado para acceder a dashboards, carga de datos y copiloto.
            </p>

            {errorKey ? (
              <div className="mt-6 rounded-[22px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorMessages[errorKey] ?? "No pudimos iniciar sesión con esas credenciales."}
              </div>
            ) : null}

            <form action={loginAction} className="mt-8 space-y-5">
              <input type="hidden" name="next" value={nextPath} />

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Correo</span>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="tu@empresa.com"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-medium text-slate-700">Contraseña</span>
                <input
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Ingresa tu contraseña"
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white"
                />
              </label>

              <button
                type="submit"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Entrar
                <ArrowRight className="size-4" />
              </button>
            </form>

            <div className="mt-6 rounded-[22px] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-600">
              Si vas a mostrar la plataforma a un cliente, aquí ya no entran rutas sensibles sin sesión.
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-500 underline-offset-4 transition-colors hover:text-slate-900 hover:underline"
              >
                Volver al overview público
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
