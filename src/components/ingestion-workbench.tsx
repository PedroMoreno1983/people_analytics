"use client";

import { useEffect, useState, useTransition } from "react";
import { AlertCircle, CheckCircle2, Database, LoaderCircle, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ImportIssue, ImportResponse, PreviewResponse } from "@/lib/ingestion/types";
import { ingestionDatasets } from "@/lib/ingestion/datasets";
import type { DatasetKey } from "@/lib/validations/ingestion";

type CompanyOption = {
  id: string;
  name: string;
  industry: string | null;
  employeeCount: number | null;
};

function getFileTypeFromName(fileName: string) {
  const lowerCaseName = fileName.toLowerCase();

  if (lowerCaseName.endsWith(".csv")) {
    return "csv";
  }

  if (lowerCaseName.endsWith(".xlsx")) {
    return "xlsx";
  }

  return null;
}

const inputClassName =
  "w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400";
const selectClassName = inputClassName;

export function IngestionWorkbench() {
  const [dataset, setDataset] = useState<DatasetKey>("employees");
  const [file, setFile] = useState<File | null>(null);
  const [hasHeader, setHasHeader] = useState(true);
  const [companyId, setCompanyId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [issues, setIssues] = useState<ImportIssue[]>([]);
  const [result, setResult] = useState<ImportResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [isCompaniesLoading, startCompaniesTransition] = useTransition();
  const [isPreviewPending, startPreviewTransition] = useTransition();
  const [isImportPending, startImportTransition] = useTransition();

  const currentDataset = ingestionDatasets.find((item) => item.key === dataset)!;
  const missingRequiredFields = currentDataset.fields
    .filter((field) => field.required && !mapping[field.key])
    .map((field) => field.label);

  useEffect(() => {
    startCompaniesTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/ingestion/companies", {
            cache: "no-store",
          });

          if (!response.ok) {
            return;
          }

          const payload = (await response.json()) as { companies?: CompanyOption[] };
          setCompanies(payload.companies ?? []);
        } catch {
          setCompanies([]);
        }
      })();
    });
  }, []);

  function resetFlow(nextDataset?: DatasetKey) {
    if (nextDataset) {
      setDataset(nextDataset);
    }
    setPreview(null);
    setMapping({});
    setIssues([]);
    setResult(null);
    setErrorMessage(null);
  }

  function handleDatasetChange(nextDataset: DatasetKey) {
    resetFlow(nextDataset);
  }

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    resetFlow();
  }

  function handlePreviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Choose a CSV or XLSX file before generating a preview.");
      return;
    }

    const fileType = getFileTypeFromName(file.name);

    if (!fileType) {
      setErrorMessage("Only CSV and XLSX files are supported in the MVP.");
      return;
    }

    setErrorMessage(null);
    setIssues([]);
    setResult(null);

    startPreviewTransition(() => {
      void (async () => {
        try {
          const formData = new FormData();
          formData.set("dataset", dataset);
          formData.set("fileType", fileType);
          formData.set("hasHeader", String(hasHeader));
          formData.set("file", file);

          const response = await fetch("/api/ingestion/preview", {
            method: "POST",
            body: formData,
          });
          const payload = (await response.json()) as
            | PreviewResponse
            | { error?: string; details?: unknown };

          if (!response.ok) {
            setPreview(null);
            setMapping({});
            setErrorMessage(
              "error" in payload && payload.error
                ? payload.error
                : "Could not generate preview.",
            );
            return;
          }

          const typedPreview = payload as PreviewResponse;
          setPreview(typedPreview);
          setMapping(typedPreview.suggestedMapping);
        } catch (error) {
          setPreview(null);
          setMapping({});
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not generate preview.",
          );
        }
      })();
    });
  }

  function handleImport() {
    if (!file || !preview) {
      setErrorMessage("Generate a preview before importing.");
      return;
    }

    const fileType = getFileTypeFromName(file.name);

    if (!fileType) {
      setErrorMessage("Only CSV and XLSX files are supported in the MVP.");
      return;
    }

    setErrorMessage(null);
    setIssues([]);
    setResult(null);

    startImportTransition(() => {
      void (async () => {
        try {
          const formData = new FormData();
          formData.set("dataset", dataset);
          formData.set("fileType", fileType);
          formData.set("hasHeader", String(hasHeader));
          formData.set("file", file);
          formData.set("mapping", JSON.stringify(mapping));

          if (companyId.trim().length > 0) {
            formData.set("companyId", companyId);
          }

          if (companyName.trim().length > 0) {
            formData.set("companyName", companyName);
          }

          const response = await fetch("/api/ingestion/import", {
            method: "POST",
            body: formData,
          });
          const payload = (await response.json()) as
            | ImportResponse
            | { error?: string; details?: ImportIssue[] };

          if (!response.ok) {
            setIssues(
              "details" in payload && Array.isArray(payload.details)
                ? payload.details
                : [],
            );
            setErrorMessage(
              "error" in payload && payload.error
                ? payload.error
                : "Could not import uploaded data.",
            );
            return;
          }

          setResult(payload as ImportResponse);
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Could not import uploaded data.",
          );
        }
      })();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <UploadCloud className="size-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                Upload workbench
              </h2>
              <p className="text-sm leading-6 text-slate-600">
                Preview, map and persist operational HR data through a controlled flow.
              </p>
            </div>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handlePreviewSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Dataset
              </label>
              <select
                className={selectClassName}
                value={dataset}
                onChange={(event) =>
                  handleDatasetChange(event.target.value as DatasetKey)
                }
              >
                {ingestionDatasets.map((item) => (
                  <option key={item.key} value={item.key}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="text-xs leading-5 text-slate-500">
                {currentDataset.description}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                File
              </label>
              <input
                type="file"
                accept=".csv,.xlsx"
                className={inputClassName}
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
              />
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={hasHeader}
                onChange={(event) => {
                  setHasHeader(event.target.checked);
                  resetFlow();
                }}
              />
              File includes a header row
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Existing company
                </label>
                <select
                  className={selectClassName}
                  value={companyId}
                  onChange={(event) => setCompanyId(event.target.value)}
                >
                  <option value="">Select an existing company</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-slate-500">
                  {isCompaniesLoading
                    ? "Loading companies from Prisma."
                    : "Use this when importing into a company that already exists."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  New or fallback company name
                </label>
                <input
                  type="text"
                  className={inputClassName}
                  value={companyName}
                  onChange={(event) => setCompanyName(event.target.value)}
                  placeholder="e.g. Acme Chile"
                />
                <p className="text-xs leading-5 text-slate-500">
                  Employees import can create the company if it does not exist yet.
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">
                    Persistence behavior
                  </p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {currentDataset.persistenceNote}
                  </p>
                </div>
                <Badge variant="neutral">{currentDataset.label}</Badge>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isPreviewPending}>
              {isPreviewPending ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Building preview
                </>
              ) : (
                "Generate preview"
              )}
            </Button>
          </form>
        </div>

        <div className="space-y-6">
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 p-3 text-emerald-700">
                <Database className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Mapping contract
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Required fields come from the dataset schema and are enforced again on the server.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {currentDataset.fields.map((field) => (
                <div
                  key={field.key}
                  className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-950">
                        {field.label}
                      </p>
                      <p className="mt-1 text-xs leading-5 text-slate-500">
                        {field.description}
                      </p>
                    </div>
                    <Badge variant={field.required ? "critical" : "neutral"}>
                      {field.required ? "Required" : "Optional"}
                    </Badge>
                  </div>

                  <select
                    className={`${selectClassName} mt-4`}
                    value={mapping[field.key] ?? ""}
                    onChange={(event) =>
                      setMapping((current) => ({
                        ...current,
                        [field.key]: event.target.value,
                      }))
                    }
                    disabled={!preview}
                  >
                    <option value="">
                      {preview ? "Select a source column" : "Generate preview first"}
                    </option>
                    {preview?.headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Examples: {field.sampleHeaders.join(", ")}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-3">
              {missingRequiredFields.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Missing required mappings: {missingRequiredFields.join(", ")}.
                </div>
              ) : preview ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Required mappings are complete. The import can run once you confirm the company.
                </div>
              ) : null}

              <Button
                type="button"
                className="w-full"
                onClick={handleImport}
                disabled={
                  !preview ||
                  isImportPending ||
                  missingRequiredFields.length > 0
                }
              >
                {isImportPending ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Importing data
                  </>
                ) : (
                  "Import into Prisma"
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {errorMessage ? (
        <div className="rounded-[24px] border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <div>{errorMessage}</div>
          </div>
        </div>
      ) : null}

      {result ? (
        <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <div>
              <p className="font-semibold">{result.message}</p>
              <p className="mt-1">
                Rows imported: {result.importedCount}. Created: {result.createdCount}. Updated: {result.updatedCount}.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {preview ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">
                  Preview rows
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  {preview.fileName} · {preview.totalRows} parsed rows
                </p>
              </div>
              <Badge variant="neutral">{preview.dataset}</Badge>
            </div>

            <div className="mt-6 overflow-auto rounded-[24px] border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-slate-500">
                  <tr>
                    {preview.headers.map((header) => (
                      <th key={header} className="px-4 py-3 font-medium">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {preview.previewRows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {preview.headers.map((header) => (
                        <td key={`${rowIndex}-${header}`} className="px-4 py-3 text-slate-600">
                          {row[header] || "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
              <h2 className="text-xl font-semibold text-slate-950">
                Server feedback
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Preview already exposes likely mapping gaps before persistence.
              </p>

              <div className="mt-6 space-y-3">
                {preview.missingRequiredFields.length > 0 ? (
                  preview.missingRequiredFields.map((field) => (
                    <div
                      key={field}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                    >
                      Suggested mapping could not resolve required field: {field}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    Automatic mapping covered all required fields. Review optional fields before importing.
                  </div>
                )}
              </div>
            </div>

            {issues.length > 0 ? (
              <div className="rounded-[28px] border border-rose-200 bg-white/90 p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Import issues
                </h2>
                <div className="mt-4 space-y-3">
                  {issues.slice(0, 8).map((issue, index) => (
                    <div
                      key={`${issue.rowNumber}-${issue.field}-${index}`}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    >
                      Row {issue.rowNumber} · {issue.field}: {issue.message}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
