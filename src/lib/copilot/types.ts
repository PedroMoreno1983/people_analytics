import type { DepartmentDashboard, ExecutiveSummary } from "@/lib/analytics/types";

export type CopilotView = "dashboard" | "departments" | "upload";

export type CopilotMode = "openai" | "local";

export type CopilotConversationMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CopilotReference = {
  label: string;
  detail: string;
};

export type CopilotContext = {
  view: CopilotView;
  viewLabel: string;
  companyId?: string;
  companyName: string;
  latestMonth: string | null;
  dataStatus: "ready" | "empty";
  snapshot: string;
  references: CopilotReference[];
  suggestedPrompts: string[];
  summary: ExecutiveSummary | null;
  departmentDashboard: DepartmentDashboard | null;
};

export type CopilotReply = {
  answer: string;
  mode: CopilotMode;
  references: CopilotReference[];
  suggestedPrompts: string[];
  statusNote?: string;
};
