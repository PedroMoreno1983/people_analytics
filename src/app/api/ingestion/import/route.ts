import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  inferFileTypeFromName,
  parseUploadedFile,
} from "@/lib/ingestion/file-parser";
import { runAnalyticsPipeline } from "@/lib/analytics/pipeline";
import { IngestionValidationError, importFromParsedUpload } from "@/lib/ingestion/service";
import { datasetSchema, fileTypeSchema } from "@/lib/validations/ingestion";

export const runtime = "nodejs";

function toBoolean(value: FormDataEntryValue | null) {
  return value === "true";
}

function parseMapping(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return {};
  }

  try {
    return JSON.parse(value) as Record<string, string>;
  } catch {
    throw new Error("El mapeo de columnas no es un JSON válido.");
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: "Adjunta un archivo CSV o XLSX antes de importar." },
        { status: 400 },
      );
    }

    const inferredFileType = inferFileTypeFromName(fileEntry.name);
    const dataset = datasetSchema.parse(formData.get("dataset"));
    const fileType = fileTypeSchema.parse(formData.get("fileType") ?? inferredFileType);
    const parsedUpload = await parseUploadedFile(fileEntry, {
      fileType,
      hasHeader: toBoolean(formData.get("hasHeader")),
    });
    const result = await importFromParsedUpload({
      dataset,
      parsedUpload,
      mapping: parseMapping(formData.get("mapping")),
      companyId:
        typeof formData.get("companyId") === "string"
          ? String(formData.get("companyId"))
          : undefined,
      companyName:
        typeof formData.get("companyName") === "string"
          ? String(formData.get("companyName"))
          : undefined,
    });
    try {
      await runAnalyticsPipeline({
        companyId: result.companyId,
      });

      return NextResponse.json({
        ...result,
        analytics: {
          status: "ok",
          message: "Analytics se actualizó para esta empresa.",
        },
      });
    } catch (analyticsError) {
      const analyticsMessage =
        analyticsError instanceof Error
          ? analyticsError.message
          : "La actualización de analytics falló después de terminar la importación.";

      return NextResponse.json({
        ...result,
        analytics: {
          status: "warning",
          message: analyticsMessage,
        },
      });
    }
  } catch (error) {
    if (error instanceof IngestionValidationError) {
      return NextResponse.json(
        {
          error: "La validación de la importación falló.",
          details: error.issues,
        },
        { status: 422 },
      );
    }

    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "El payload de importación no es válido.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "No pudimos importar los datos cargados.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
