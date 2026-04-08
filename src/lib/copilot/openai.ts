import OpenAI from "openai";

import type {
  CopilotContext,
  CopilotConversationMessage,
} from "@/lib/copilot/types";

const DEFAULT_MODEL = "gpt-5.4-mini";

let cachedClient: OpenAI | null | undefined;
let isOpenAIDisabled = false;

function getOpenAIClient() {
  if (isOpenAIDisabled) {
    return null;
  }

  if (cachedClient !== undefined) {
    return cachedClient;
  }

  if (!process.env.OPENAI_API_KEY?.trim()) {
    cachedClient = null;
    return cachedClient;
  }

  cachedClient = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  return cachedClient;
}

function buildPrompt(
  context: CopilotContext,
  question: string,
  history: CopilotConversationMessage[],
) {
  const recentHistory =
    history.length > 0
      ? history
          .slice(-6)
          .map((message) =>
            `${message.role === "assistant" ? "Copiloto" : "Usuario"}: ${message.content}`,
          )
          .join("\n")
      : "Sin historial previo.";

  return [
    `Vista actual: ${context.viewLabel}.`,
    `Empresa: ${context.companyName}.`,
    `Estado de datos: ${context.dataStatus}.`,
    "Contexto disponible:",
    context.snapshot,
    "Referencias destacadas:",
    context.references
      .map((reference) => `- ${reference.label}: ${reference.detail}`)
      .join("\n"),
    "Historial reciente:",
    recentHistory,
    `Pregunta actual: ${question}`,
  ].join("\n\n");
}

export function isOpenAIConfigured() {
  return !isOpenAIDisabled && Boolean(process.env.OPENAI_API_KEY?.trim());
}

function isInvalidApiKeyError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "invalid_api_key"
  );
}

export async function generateOpenAICopilotAnswer(
  context: CopilotContext,
  question: string,
  history: CopilotConversationMessage[],
) {
  const client = getOpenAIClient();

  if (!client) {
    return null;
  }

  try {
    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL?.trim() || DEFAULT_MODEL,
      instructions: [
        "Eres el Copiloto de RR.HH. de DataWise People Analytics.",
        "Responde en espanol claro, ejecutivo y cercano.",
        "Usa solo el contexto entregado; si falta información, dilo sin inventar.",
        "No tomes decisiones automaticas sobre personas ni recomiendes acciones individuales sensibles.",
        "Prioriza explicacion, evidencia y una siguiente acción concreta.",
        "Mantente en menos de 160 palabras y evita la jerga técnica innecesaria.",
      ].join(" "),
      input: buildPrompt(context, question, history),
      max_output_tokens: 320,
    });

    const answer = response.output_text.trim();

    return answer.length > 0 ? answer : null;
  } catch (error) {
    if (isInvalidApiKeyError(error)) {
      isOpenAIDisabled = true;
      cachedClient = null;
    }

    console.error("Copilot OpenAI error", error);
    return null;
  }
}
