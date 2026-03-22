export const executiveKpis = [
  {
    label: "Headcount",
    value: "128",
    detail: "Active employees in the latest analytics period.",
    tone: "positive" as const
  },
  {
    label: "Turnover",
    value: "4.2%",
    detail: "Average department turnover in the latest scoring month.",
    tone: "warning" as const
  },
  {
    label: "Absenteeism",
    value: "2.1%",
    detail: "Absence days over working-day capacity.",
    tone: "neutral" as const
  },
  {
    label: "Engagement",
    value: "73/100",
    detail: "Derived from employee survey responses.",
    tone: "positive" as const
  },
  {
    label: "Burnout Risk",
    value: "39/100",
    detail: "Average burnout risk from explainable scoring.",
    tone: "critical" as const
  }
];

export const departmentPreview = [
  { name: "Sales", health: "At Risk", turnover: "8.0%", engagement: "62", burnout: "49", tone: "critical" as const },
  { name: "Operations", health: "Watch", turnover: "5.0%", engagement: "67", burnout: "41", tone: "warning" as const },
  { name: "People Operations", health: "Stable", turnover: "2.0%", engagement: "75", burnout: "27", tone: "positive" as const },
  { name: "Product", health: "Healthy", turnover: "1.0%", engagement: "83", burnout: "23", tone: "positive" as const }
];

export const attritionDistribution = [
  { label: "Low", value: 58, tone: "positive" as const },
  { label: "Medium", value: 28, tone: "warning" as const },
  { label: "High", value: 14, tone: "critical" as const }
];

export const insightPreview = [
  "Turnover is materially above company average in Sales.",
  "Burnout risk is elevated in Operations and should be monitored.",
  "People Operations is the benchmark team for engagement."
];

export const uploadDatasets = [
  { dataset: "Employees", format: "CSV / XLSX", status: "Normalized and persisted" },
  { dataset: "Absences", format: "CSV / XLSX", status: "Normalized table in Prisma" },
  { dataset: "Performance reviews", format: "CSV / XLSX", status: "Validated with Zod schemas" },
  { dataset: "Surveys", format: "CSV / XLSX", status: "Supports engagement and burnout scoring" }
];

export const architectureLayers = [
  { name: "Ingestion", detail: "Parse, preview, map columns, validate, persist." },
  { name: "Operational Data", detail: "Company, Department, Employee, Absence, Promotion, PerformanceReview, Survey, SurveyResponse." },
  { name: "Analytics Services", detail: "Turnover, absenteeism, engagement, attrition risk, burnout risk, department monthly metrics." },
  { name: "Analytics Storage", detail: "EmployeeRiskScore and TeamMetricsMonthly." },
  { name: "Dashboard Queries", detail: "Executive summary, department health, trends, distributions and insights." }
];
