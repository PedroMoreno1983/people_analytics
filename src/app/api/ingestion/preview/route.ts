import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { ensureApiUser } from "@/lib/auth/api";
import {
  inferFileTypeFromName,
  parseUploadedFile,
} from "@/lib/ingestion/file-parser";
import { buildPreview } from "@/lib/ingestion/service";
import { uploadPreviewRequestSchema } from "@/lib/validations/ingestion";

export const runtime = "nodejs";

function toBoolean(value: FormDataEntryValue | null) {
  return value === "true";
}

export async function POST(request: Request) {
  try {
    const auth = await ensureApiUser();

    if (auth.response) {
      return auth.response;
    }

    const formData = await request.formData();
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File)) {
      return NextResponse.json(
        { error: "Adjunta un archivo CSV o XLSX antes de previsualizar." },
        { status: 400 },
      );
    }

    const inferredFileType = inferFileTypeFromName(fileEntry.name);
    const previewRequest = uploadPreviewRequestSchema.parse({
      dataset: formData.get("dataset"),
      fileType: formData.get("fileType") ?? inferredFileType,
      hasHeader: toBoolean(formData.get("hasHeader")),
    });
    const parsedUpload = await parseUploadedFile(fileEntry, {
      fileType: previewRequest.fileType,
      hasHeader: previewRequest.hasHeader,
    });
    const preview = buildPreview(previewRequest.dataset, parsedUpload);

    return NextResponse.json(preview);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "El payload de la vista previa no es válido.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "No pudimos generar la vista previa.";

    return NextResponse.json({ error: message }, { status: 400 });
  }
}
