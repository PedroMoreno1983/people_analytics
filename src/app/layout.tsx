import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";

import { buttonVariants } from "@/components/ui/button";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "DataWise People Analytics",
  description:
    "Explainable people analytics platform for executive and operating teams — attrition risk, burnout signals, engagement and department health."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/80 backdrop-blur">
          <div className="mx-auto flex max-w-[1600px] items-center justify-between px-4 py-4 lg:px-6">
            <Link href="/" className="group">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 transition-colors group-hover:text-slate-700">
                DataWise
              </p>
              <p className="font-serif text-2xl font-semibold text-slate-950">
                People Analytics
              </p>
            </Link>
            <nav className="hidden items-center gap-2 sm:flex">
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Dashboard
              </Link>
              <Link
                href="/departments"
                className={buttonVariants({ variant: "secondary", size: "sm" })}
              >
                Departments
              </Link>
              <Link href="/upload" className={buttonVariants({ size: "sm" })}>
                Upload data
              </Link>
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  );
}
