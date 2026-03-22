export type AnalyticsRunResult = {
  companyId: string;
  companyName: string;
  monthsProcessed: string[];
  employeeScoresUpserted: number;
  teamMetricsUpserted: number;
};

export type ExecutiveSummary = {
  companyId: string;
  companyName: string;
  latestMonth: string | null;
  isDemo?: boolean;
  kpis: Array<{
    label: string;
    value: string;
    tone: "positive" | "warning" | "critical" | "neutral";
    detail: string;
  }>;
  departmentHealth: Array<{
    departmentId: string;
    name: string;
    health: string;
    tone: "positive" | "warning" | "critical";
    turnoverRate: number;
    absenteeismRate: number;
    engagementScore: number;
    burnoutRiskAvg: number;
    attritionRiskAvg: number;
    headcount: number;
  }>;
  attritionDistribution: Array<{
    label: "Low" | "Medium" | "High";
    value: number;
    tone: "positive" | "warning" | "critical";
  }>;
  turnoverTrend: Array<{
    month: string;
    turnoverRate: number;
  }>;
  engagementTrend: Array<{
    month: string;
    engagementScore: number;
  }>;
  burnoutTrend: Array<{
    month: string;
    burnoutRiskAvg: number;
  }>;
  insights: string[];
};

export type DepartmentDashboardEntry = {
  departmentId: string;
  name: string;
  latestMonth: string | null;
  health: string;
  tone: "positive" | "warning" | "critical";
  headcount: number;
  turnoverRate: number;
  absenteeismRate: number;
  engagementScore: number;
  burnoutRiskAvg: number;
  attritionRiskAvg: number;
  topDrivers: string[];
  trends: Array<{
    month: string;
    turnoverRate: number;
    engagementScore: number;
    burnoutRiskAvg: number;
    attritionRiskAvg: number;
    headcount: number;
  }>;
  insights: string[];
};

export type DepartmentDashboard = {
  companyId: string;
  companyName: string;
  departments: DepartmentDashboardEntry[];
};
