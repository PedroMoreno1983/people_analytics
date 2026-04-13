import { NextResponse } from "next/server";

import { getExecutiveSummary } from "@/lib/analytics/summary";
import { ensureApiUser } from "@/lib/auth/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const auth = await ensureApiUser();

    if (auth.response) {
      return auth.response;
    }

    const url = new URL(request.url);
    const companyId = url.searchParams.get("companyId") ?? undefined;
    const summary = await getExecutiveSummary(companyId);

    if (!summary) {
      return NextResponse.json(
        { error: "No company or analytics summary found." },
        { status: 404 },
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Could not load analytics summary.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
