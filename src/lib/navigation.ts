import type { LucideIcon } from "lucide-react";
import { BarChart3, Building2, Upload, Users2 } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Resumen ejecutivo",
    description: "Qué está pasando hoy, qué cambió y dónde mirar primero.",
    icon: BarChart3,
  },
  {
    href: "/people",
    label: "Personas",
    description: "Cobertura, riesgo individual, drivers y foco de seguimiento.",
    icon: Users2,
  },
  {
    href: "/departments",
    label: "Equipos",
    description: "Lectura por área, factores principales y siguientes conversaciones.",
    icon: Building2,
  },
  {
    href: "/upload",
    label: "Carga de datos",
    description: "Sube archivos, revisa columnas y guarda con contexto.",
    icon: Upload,
  },
];
