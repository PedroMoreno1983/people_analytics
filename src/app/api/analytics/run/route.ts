import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { runAnalyticsPipeline } from "@/lib/analytics/pipeline";
import { ensureApiUser } from "@/lib/auth/api";

export const runtime = "nodejs";

const analyticsRunRequestSchema = z.object({
  companyId: z.string().uuid().optional(),
});

export async function POST(request: Request) {
  try {
    const auth = await ensureApiUser();

    if (auth.response) {
      return auth.response;
    }

    const body = request.headers.get("content-type")?.includes("application/json")
      ? await request.json()
      : {};
    const payload = analyticsRunRequestSchema.parse(body);
    const results = await runAnalyticsPipeline({
      companyId: payload.companyId,
    });

    return NextResponse.json({
      status: "ok",
      results,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "Analytics payload is invalid.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error ? error.message : "Could not run analytics pipeline.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
