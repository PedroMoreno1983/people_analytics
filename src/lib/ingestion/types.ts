import type { DatasetField } from "@/lib/ingestion/datasets";
import type { DatasetKey } from "@/lib/validations/ingestion";

export type ImportAnalyticsStatus = {
  status: "ok" | "warning";
  message: string;
};

export type PreviewResponse = {
  dataset: DatasetKey;
  fileName: string;
  headers: string[];
  totalRows: number;
  previewRows: Array<Record<string, string>>;
  fields: DatasetField[];
  suggestedMapping: Record<string, string>;
  missingRequiredFields: string[];
};

export type ImportIssue = {
  rowNumber: number;
  field: string;
  message: string;
};

export type ImportResponse = {
  dataset: DatasetKey;
  companyId: string;
  companyName: string;
  importedCount: number;
  createdCount: number;
  updatedCount: number;
  message: string;
  analytics?: ImportAnalyticsStatus;
};
