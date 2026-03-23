import type { LucideIcon } from "lucide-react";
import { BarChart3, Building2, Upload } from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard Ejecutivo",
    description: "Salud organizacional, distribución de riesgo y tendencias clave.",
    icon: BarChart3
  },
  {
    href: "/departments",
    label: "Departamentos",
    description: "Salud, factores de riesgo y métricas operativas por departamento.",
    icon: Building2
  },
  {
    href: "/upload",
    label: "Ingesta de Datos",
    description: "Subí archivos CSV/XLSX para actualizar el pipeline de analytics.",
    icon: Upload
  }
];
