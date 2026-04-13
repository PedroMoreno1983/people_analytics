import { NextResponse } from "next/server";

import { getDepartmentDashboard } from "@/lib/analytics/department-summary";
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
    const dashboard = await getDepartmentDashboard(companyId);

    if (!dashboard) {
      return NextResponse.json(
        { error: "No department dashboard is available." },
        { status: 404 },
      );
    }

    return NextResponse.json(dashboard);
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load department dashboard.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
