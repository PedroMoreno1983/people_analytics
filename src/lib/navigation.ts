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
    label: "Executive Dashboard",
    description: "Organizational health, risk distribution and key trends.",
    icon: BarChart3
  },
  {
    href: "/departments",
    label: "Departments",
    description: "Department-level health, drivers and operating metrics.",
    icon: Building2
  },
  {
    href: "/upload",
    label: "Data Ingestion",
    description: "Upload CSV/XLSX files to update analytics data.",
    icon: Upload
  }
];
