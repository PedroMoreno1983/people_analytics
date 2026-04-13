import { NextResponse } from "next/server";

import { ensureApiUser } from "@/lib/auth/api";
import { listCompanies } from "@/lib/company";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await ensureApiUser();

    if (auth.response) {
      return auth.response;
    }

    const companies = await listCompanies();

    return NextResponse.json({ companies });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not load companies from the database.";

    return NextResponse.json({ error: message, companies: [] }, { status: 503 });
  }
}
