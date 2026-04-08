export const executiveKpis = [
  {
    label: "Headcount",
    value: "128",
    detail: "Personas activas en el último período analítico.",
    tone: "positive" as const
  },
  {
    label: "Turnover",
    value: "4.2%",
    detail: "Salida promedio por equipo en el último mes analizado.",
    tone: "warning" as const
  },
  {
    label: "Absenteeism",
    value: "2.1%",
    detail: "Días de ausencia sobre la capacidad laboral disponible.",
    tone: "neutral" as const
  },
  {
    label: "Engagement",
    value: "73/100",
    detail: "Calculado a partir de respuestas de encuestas de personas.",
    tone: "positive" as const
  },
  {
    label: "Burnout Risk",
    value: "39/100",
    detail: "Promedio de riesgo de desgaste según el scoring explicable.",
    tone: "critical" as const
  }
];

export const departmentPreview = [
  { name: "Sales", health: "En riesgo", turnover: "8.0%", engagement: "62", burnout: "49", tone: "critical" as const },
  { name: "Operations", health: "Seguimiento", turnover: "5.0%", engagement: "67", burnout: "41", tone: "warning" as const },
  { name: "People Operations", health: "Stable", turnover: "2.0%", engagement: "75", burnout: "27", tone: "positive" as const },
  { name: "Product", health: "Saludable", turnover: "1.0%", engagement: "83", burnout: "23", tone: "positive" as const }
];

export const attritionDistribution = [
  { label: "Low", value: 58, tone: "positive" as const },
  { label: "Medium", value: 28, tone: "warning" as const },
  { label: "High", value: 14, tone: "critical" as const }
];

export const insightPreview = [
  "La salida está materialmente por encima del promedio de la empresa en Sales.",
  "El riesgo de desgaste está elevado en Operations y conviene hacer seguimiento.",
  "People Operations es el equipo de referencia en engagement."
];

export const uploadDatasets = [
  { dataset: "Employees", format: "CSV / XLSX", status: "Normalizado y persistido" },
  { dataset: "Absences", format: "CSV / XLSX", status: "Tabla normalizada en Prisma" },
  { dataset: "Performance reviews", format: "CSV / XLSX", status: "Validado con esquemas de Zod" },
  { dataset: "Surveys", format: "CSV / XLSX", status: "Soporta scoring de engagement y desgaste" }
];

export const architectureLayers = [
  { name: "Ingestion", detail: "Parsea, previsualiza, mapea columnas, valida y persiste." },
  { name: "Operational Data", detail: "Company, Department, Employee, Absence, Promotion, PerformanceReview, Survey, SurveyResponse." },
  { name: "Analytics Services", detail: "Salida, ausentismo, engagement, riesgo de salida, desgaste y métricas mensuales por equipo." },
  { name: "Analytics Storage", detail: "EmployeeRiskScore y TeamMetricsMonthly." },
  { name: "Dashboard Queries", detail: "Resumen ejecutivo, salud por equipo, tendencias, distribuciones e insights." }
];
