import { NextResponse } from "next/server";

import { requireApiUser } from "@/lib/auth/server";

export async function ensureApiUser() {
  const user = await requireApiUser();

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  return {
    user,
    response: null,
  };
}
