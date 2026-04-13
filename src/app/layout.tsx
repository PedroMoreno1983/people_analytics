import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "DataWise People Analytics",
  description: "Plataforma de people analytics explicable para equipos ejecutivos y operativos."
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="es">
      <body>
        <header className="sticky top-0 z-20 border-b border-white/60 bg-white/70 backdrop-blur-md">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-3 lg:px-6">
            <Link href="/" className="group flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md shadow-indigo-200">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <rect x="2" y="10" width="4" height="6" rx="1" fill="currentColor" opacity="0.6"/>
                  <rect x="7" y="6" width="4" height="10" rx="1" fill="currentColor" opacity="0.8"/>
                  <rect x="12" y="2" width="4" height="14" rx="1" fill="currentColor"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-indigo-500">DataWise</p>
                <p className="text-base font-semibold leading-none text-slate-900">People Analytics</p>
              </div>
            </Link>
            <nav className="hidden items-center gap-2 sm:flex">
              <Link href="/dashboard" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium !text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:!text-indigo-700">
                Dashboard
              </Link>
              <Link href="/people" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium !text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:!text-indigo-700">
                Personas
              </Link>
              <Link href="/departments" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium !text-slate-700 transition-colors hover:border-indigo-200 hover:bg-indigo-50 hover:!text-indigo-700">
                Equipos
              </Link>
              <Link href="/upload" className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium !text-white shadow-md shadow-indigo-200 transition-colors hover:bg-indigo-700 hover:!text-white">
                Subir datos
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
