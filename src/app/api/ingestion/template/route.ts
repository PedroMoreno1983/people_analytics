import { NextResponse } from "next/server";
import { ZodError } from "zod";

import {
  getDatasetDefinition,
  getTemplateExampleRow,
  getTemplateHeaders,
} from "@/lib/ingestion/datasets";
import { datasetSchema } from "@/lib/validations/ingestion";

function escapeCsvValue(value: string) {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const dataset = datasetSchema.parse(url.searchParams.get("dataset"));
    const definition = getDatasetDefinition(dataset);
    const headers = getTemplateHeaders(dataset);
    const exampleRow = getTemplateExampleRow(dataset);
    const csvContent = [headers, exampleRow]
      .map((row) => row.map((value) => escapeCsvValue(value)).join(","))
      .join("\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${definition.templateFileName}"`,
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Dataset de plantilla invalido." },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "No pudimos generar la plantilla.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
