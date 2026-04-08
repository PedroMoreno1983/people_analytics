"use client";

import { useEffect, useState, useTransition } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Database,
  Download,
  LoaderCircle,
  UploadCloud,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getSortedIngestionDatasets,
  ingestionDatasets,
} from "@/lib/ingestion/datasets";
import type {
  ImportIssue,
  ImportResponse,
  PreviewResponse,
} from "@/lib/ingestion/types";
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
  const orderedDatasets = getSortedIngestionDatasets();
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
  const datasetOrderIndex = orderedDatasets.findIndex((item) => item.key === dataset);
  const nextDataset = orderedDatasets[datasetOrderIndex + 1];
  const requiredFields = currentDataset.fields.filter((field) => field.required);
  const optionalFields = currentDataset.fields.filter((field) => !field.required);
  const missingRequiredFields = currentDataset.fields
    .filter((field) => field.required && !mapping[field.key])
    .map((field) => field.label);
  const autoMappedRequiredCount = requiredFields.filter((field) => mapping[field.key]).length;
  const hasCompanySelection =
    companyId.trim().length > 0 ||
    (dataset === "employees" && companyName.trim().length > 0);

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

          const payload = (await response.json()) as {
            companies?: CompanyOption[];
          };
          setCompanies(payload.companies ?? []);
        } catch {
          setCompanies([]);
        }
      })();
    });
  }, []);

  function getFieldLabel(fieldKey: string) {
    return currentDataset.fields.find((field) => field.key === fieldKey)?.label ?? fieldKey;
  }

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
    if (nextDataset !== "employees") {
      setCompanyName("");
    }

    resetFlow(nextDataset);
  }

  function handleFileChange(nextFile: File | null) {
    setFile(nextFile);
    resetFlow();
  }

  function handlePreviewSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!file) {
      setErrorMessage("Sube un archivo CSV o XLSX antes de revisarlo.");
      return;
    }

    const fileType = getFileTypeFromName(file.name);

    if (!fileType) {
      setErrorMessage("Por ahora solo se aceptan archivos CSV o XLSX.");
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
                : "No pudimos revisar el archivo.",
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
            error instanceof Error ? error.message : "No pudimos revisar el archivo.",
          );
        }
      })();
    });
  }

  function handleImport() {
    if (!file || !preview) {
      setErrorMessage("Revisa el archivo antes de guardarlo.");
      return;
    }

    const fileType = getFileTypeFromName(file.name);

    if (!fileType) {
      setErrorMessage("Por ahora solo se aceptan archivos CSV o XLSX.");
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
                : "No pudimos guardar los datos.",
            );
            return;
          }

          setResult(payload as ImportResponse);
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "No pudimos guardar los datos.",
          );
        }
      })();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-slate-950 p-3 text-white">
                <UploadCloud className="size-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Paso 1: prepara el archivo</h2>
                <p className="text-sm leading-6 text-slate-600">
                  Elige el tipo de carga, descarga una plantilla si hace falta y revisa el archivo antes de guardar.
                </p>
              </div>
            </div>

            <a
              href={`/api/ingestion/template?dataset=${dataset}`}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
            >
              <Download className="size-4" />
              Descargar plantilla
            </a>
          </div>

          <form className="mt-6 space-y-5" onSubmit={handlePreviewSubmit}>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">
                Que tipo de archivo vas a cargar
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

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Orden recomendado
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  Paso {currentDataset.recommendedOrder} de {orderedDatasets.length}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {currentDataset.quickStart}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Campos obligatorios
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {requiredFields.length} de {currentDataset.fields.length}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  {requiredFields.map((field) => field.label).join(", ")}
                </p>
              </div>
              <div className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Formato esperado
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-950">
                  {currentDataset.supportedFileTypes.map((fileType) => fileType.toUpperCase()).join(" / ")}
                </p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Descarga la plantilla si quieres armarlo desde cero.
                </p>
              </div>
            </div>

            {dataset !== "employees" ? (
              <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                Antes de cargar {currentDataset.label.toLowerCase()}, la empresa ya debe existir en la plataforma y tener empleados cargados.
              </div>
            ) : (
              <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
                Si el cliente parte desde cero, basta con subir empleados para crear la empresa y abrir la base de analytics.
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700">Archivo</label>
              <input
                type="file"
                accept=".csv,.xlsx"
                className={inputClassName}
                onChange={(event) =>
                  handleFileChange(event.target.files?.[0] ?? null)
                }
              />
              <p className="text-xs leading-5 text-slate-500">
                Consejo: si todavía no tienes archivo listo, descarga la plantilla y complétatla con una fila de ejemplo.
              </p>
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
              Mi archivo trae nombres de columnas en la primera fila
            </label>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Empresa existente
                </label>
                <select
                  className={selectClassName}
                  value={companyId}
                  onChange={(event) => {
                    setCompanyId(event.target.value);

                    if (event.target.value) {
                      setCompanyName("");
                    }
                  }}
                >
                  <option value="">Elegir empresa existente</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-slate-500">
                  {isCompaniesLoading
                    ? "Estamos buscando empresas ya cargadas."
                    : "Usa esta opcion si quieres sumar datos a una empresa que ya existe."}
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  Nueva empresa o nombre de respaldo
                </label>
                <input
                  type="text"
                  className={inputClassName}
                  value={companyName}
                  onChange={(event) => {
                    setCompanyName(event.target.value);

                    if (event.target.value) {
                      setCompanyId("");
                    }
                  }}
                  placeholder="Por ejemplo, Acme Chile"
                  disabled={dataset !== "employees"}
                />
                <p className="text-xs leading-5 text-slate-500">
                  {dataset === "employees"
                    ? "Si no existe aun, la carga de empleados puede crearla con este nombre."
                    : "Para este archivo debes elegir una empresa ya creada desde la carga de empleados."}
                </p>
              </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-950">Que va a pasar al guardar</p>
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
                  Revisando archivo
                </>
              ) : (
                "Revisar archivo"
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
                  Paso 2: confirma columnas
                </h2>
                <p className="text-sm leading-6 text-slate-600">
                  Aquí relaciónas las columnas del archivo con lo que la plataforma necesita para entenderlo.
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50/80 px-4 py-3">
              <p className="text-sm font-semibold text-slate-950">
                Relación automatica: {autoMappedRequiredCount} de {requiredFields.length} campos obligatorios detectados
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-500">
                Si algo no coincide, puedes corregirlo manualmente antes de guardar.
              </p>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">Campos obligatorios</p>
                  <Badge variant="critical">{requiredFields.length} necesarios</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {requiredFields.map((field) => (
                    <div
                      key={field.key}
                      className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{field.label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {field.description}
                          </p>
                        </div>
                        <Badge variant="critical">Obligatorio</Badge>
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
                          {preview ? "Elegir columna del archivo" : "Primero revisa el archivo"}
                        </option>
                        {preview?.headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Plantilla sugerida: {field.templateHeader}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-slate-950">Campos opcionales</p>
                  <Badge variant="neutral">{optionalFields.length} complementarios</Badge>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {optionalFields.map((field) => (
                    <div
                      key={field.key}
                      className="rounded-[22px] border border-slate-200 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-950">{field.label}</p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {field.description}
                          </p>
                        </div>
                        <Badge variant="neutral">Opcional</Badge>
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
                          {preview ? "Elegir columna del archivo" : "Primero revisa el archivo"}
                        </option>
                        {preview?.headers.map((header) => (
                          <option key={header} value={header}>
                            {header}
                          </option>
                        ))}
                      </select>

                      <p className="mt-2 text-xs leading-5 text-slate-400">
                        Plantilla sugerida: {field.templateHeader}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              {missingRequiredFields.length > 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Aun faltan columnas obligatorias: {missingRequiredFields.join(", ")}.
                </div>
              ) : !hasCompanySelection ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  {dataset === "employees"
                    ? "Antes de guardar, elige una empresa existente o escribe el nombre de una nueva."
                    : "Antes de guardar, elige la empresa existente donde quieres sumar este archivo."}
                </div>
              ) : preview ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                  Las columnas obligatorias ya estan relaciónadas. Si la empresa esta correcta, ya puedes guardar.
                </div>
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  Cuando revises el archivo, aquí veras si falta algo importante antes de guardar.
                </div>
              )}

              <Button
                type="button"
                className="w-full"
                onClick={handleImport}
                disabled={
                  !preview ||
                  isImportPending ||
                  missingRequiredFields.length > 0 ||
                  !hasCompanySelection
                }
              >
                {isImportPending ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Guardando datos
                  </>
                ) : (
                  "Guardar y actualizar analytics"
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
        <div className="space-y-3">
          <div className="rounded-[24px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <div>
                <p className="font-semibold">
                  La carga se guardo correctamente en {result.companyName}.
                </p>
                <p className="mt-1">
                  Filas procesadas: {result.importedCount}. Nuevas: {result.createdCount}. Actualizadas: {result.updatedCount}.
                </p>
              </div>
            </div>
          </div>

          {nextDataset ? (
            <div className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 text-sm text-slate-700">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-950">Siguiente paso recomendado</p>
                  <p className="mt-1 leading-6">
                    Si quieres enriquecer el analisis, ahora te conviene subir {nextDataset.label.toLowerCase()}.
                  </p>
                </div>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                  onClick={() => handleDatasetChange(nextDataset.key)}
                >
                  Ir a {nextDataset.label}
                  <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          ) : null}

          {result.analytics?.status === "warning" ? (
            <div className="rounded-[24px] border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <div>
                  <p className="font-semibold">
                    Los datos se guardaron, pero analytics no se pudo actualizar en este paso.
                  </p>
                  <p className="mt-1">{result.analytics.message}</p>
                </div>
              </div>
            </div>
          ) : result.analytics?.message ? (
            <div className="rounded-[24px] border border-blue-200 bg-blue-50 px-5 py-4 text-sm text-blue-800">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                <div>{result.analytics.message}</div>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      {preview ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-950">Vista previa</h2>
                <p className="text-sm leading-6 text-slate-600">
                  {preview.fileName} | {preview.totalRows} filas detectadas
                </p>
              </div>
              <Badge variant="neutral">{currentDataset.label}</Badge>
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
                        <td
                          key={`${rowIndex}-${header}`}
                          className="px-4 py-3 text-slate-600"
                        >
                          {row[header] || "-"}
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
              <h2 className="text-xl font-semibold text-slate-950">Lo que detectamos</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Aquí te avisamos si falta relaciónar algo antes de guardar.
              </p>

              <div className="mt-6 space-y-3">
                {preview.missingRequiredFields.length > 0 ? (
                  preview.missingRequiredFields.map((fieldKey) => (
                    <div
                      key={fieldKey}
                      className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
                    >
                      Falta relaciónar el campo obligatorio: {getFieldLabel(fieldKey)}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                    La relación automatica cubrió todos los campos obligatorios. Revisa si quieres sumar también los opcionales.
                  </div>
                )}
              </div>
            </div>

            {issues.length > 0 ? (
              <div className="rounded-[28px] border border-rose-200 bg-white/90 p-6">
                <h2 className="text-xl font-semibold text-slate-950">
                  Lo que hay que corregir
                </h2>
                <div className="mt-4 space-y-3">
                  {issues.slice(0, 8).map((issue, index) => (
                    <div
                      key={`${issue.rowNumber}-${issue.field}-${index}`}
                      className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                    >
                      Fila {issue.rowNumber} | {getFieldLabel(issue.field)}: {issue.message}
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
