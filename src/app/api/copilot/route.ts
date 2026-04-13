import { NextResponse } from "next/server";
import { ZodError, z } from "zod";

import { ensureApiUser } from "@/lib/auth/api";
import { buildCopilotReply } from "@/lib/copilot/service";

export const runtime = "nodejs";

const copilotMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().trim().min(1).max(2000),
});

const copilotRequestSchema = z.object({
  view: z.enum(["dashboard", "departments", "upload"]),
  companyId: z.string().trim().min(1).optional(),
  question: z.string().trim().min(3).max(500),
  history: z.array(copilotMessageSchema).max(6).default([]),
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
    const payload = copilotRequestSchema.parse(body);
    const reply = await buildCopilotReply(payload);

    return NextResponse.json(reply);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: "El mensaje del copiloto no es valido.",
          details: error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const message =
      error instanceof Error
        ? error.message
        : "No pudimos responder desde el copiloto.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
