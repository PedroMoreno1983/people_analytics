"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Bot,
  LoaderCircle,
  MessageSquareMore,
  SendHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import type {
  CopilotMode,
  CopilotReference,
  CopilotView,
} from "@/lib/copilot/types";
import { cn } from "@/lib/utils";

type PanelMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
  mode?: CopilotMode;
  references?: CopilotReference[];
};

function getViewFromPathname(pathname: string): CopilotView {
  if (pathname.startsWith("/departments")) {
    return "departments";
  }

  if (pathname.startsWith("/upload")) {
    return "upload";
  }

  return "dashboard";
}

function getIntroMessage(view: CopilotView): PanelMessage {
  const contentByView: Record<CopilotView, string> = {
    dashboard:
      "Estoy aquí para ayudarte a entender rápido que esta pasando en el dashboard y por donde empezaría.",
    departments:
      "Puedo ayudarte a leer equipos, comparar prioridades y bajar estas métricas a una conversación concreta.",
    upload:
      "Puedo acompañar la carga para que sepas qué subir primero, qué revisar y qué esperar después de guardar.",
  };

  return {
    id: crypto.randomUUID(),
    role: "assistant",
    content: contentByView[view],
  };
}

function getDefaultPrompts(view: CopilotView) {
  if (view === "departments") {
    return [
      "Explicame que equipo debería mirar primero",
      "Comparame las prioridades de esta vista",
      "Armame una conversación con el manager",
    ];
  }

  if (view === "upload") {
    return [
      "Que archivo conviene subir primero?",
      "Que debería revisar antes de guardar?",
      "Que hago si faltan columnas?",
    ];
  }

  return [
    "Explicame que esta pasando aquí",
    "Por donde empezarías esta semana?",
    "Armame una conversación para managers",
  ];
}

export function CopilotPanel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const view = getViewFromPathname(pathname);
  const companyId = searchParams.get("companyId") ?? undefined;

  return <CopilotPanelInner key={`${view}-${companyId ?? "default"}`} view={view} companyId={companyId} />;
}

function CopilotPanelInner({
  view,
  companyId,
}: {
  view: CopilotView;
  companyId?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<PanelMessage[]>([getIntroMessage(view)]);
  const [suggestedPrompts, setSuggestedPrompts] = useState(getDefaultPrompts(view));
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const messageListRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const node = messageListRef.current;

    if (!node) {
      return;
    }

    node.scrollTop = node.scrollHeight;
  }, [isOpen, isPending, messages]);

  function submitQuestion(question: string) {
    const trimmedQuestion = question.trim();

    if (trimmedQuestion.length === 0 || isPending) {
      return;
    }

    const history = messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));

    setIsOpen(true);
    setErrorMessage(null);
    setDraft("");
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role: "user",
        content: trimmedQuestion,
      },
    ]);

    startTransition(() => {
      void (async () => {
        try {
          const response = await fetch("/api/copilot", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              view,
              companyId,
              question: trimmedQuestion,
              history,
            }),
          });
          const payload = (await response.json()) as
            | {
                answer?: string;
                error?: string;
                mode?: CopilotMode;
                references?: CopilotReference[];
                suggestedPrompts?: string[];
              }
            | undefined;

          if (!response.ok || !payload?.answer || !payload.mode) {
            setErrorMessage(payload?.error ?? "No pude responder bien esta vez.");
            return;
          }

          const answer = payload.answer;
          const mode = payload.mode;

          setSuggestedPrompts(payload.suggestedPrompts ?? getDefaultPrompts(view));
          setMessages((current) => [
            ...current,
            {
              id: crypto.randomUUID(),
              role: "assistant",
              content: answer,
              mode,
              references: payload.references ?? [],
            },
          ]);
        } catch (error) {
          setErrorMessage(
            error instanceof Error ? error.message : "No pude responder bien esta vez.",
          );
        }
      })();
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(draft);
  }

  return (
    <>
      {!isOpen ? (
        <button
          type="button"
          className="fixed bottom-5 right-5 z-40 flex items-center gap-3 rounded-full bg-slate-950 px-5 py-3 text-sm font-medium text-white shadow-[0_20px_50px_-20px_rgba(15,23,42,0.7)] transition-transform hover:-translate-y-0.5"
          onClick={() => setIsOpen(true)}
        >
          <MessageSquareMore className="size-4" />
          Abrir copiloto
        </button>
      ) : null}

      {isOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-slate-950/20 backdrop-blur-[2px]"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar copiloto"
          />

          <section className="fixed bottom-4 right-4 z-50 flex max-h-[calc(100vh-2rem)] w-[min(420px,calc(100vw-2rem))] flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_32px_90px_-30px_rgba(15,23,42,0.55)]">
            <div className="border-b border-slate-200 px-5 py-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-md shadow-slate-200">
                    <Bot className="size-5" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      Copiloto RR.HH.
                    </p>
                    <h2 className="mt-1 text-lg font-semibold text-slate-950">
                      Conversemos sobre esta vista
                    </h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      Te ayudo a entender que significa esta lectura y por donde
                      empezaría sin tocar tus datos.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-full border border-slate-200 p-2 text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setIsOpen(false)}
                  aria-label="Cerrar panel"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            <div
              ref={messageListRef}
              className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "rounded-[24px] px-4 py-3 text-sm leading-6",
                    message.role === "assistant"
                      ? "border border-slate-200 bg-slate-50 text-slate-700"
                      : "ml-auto max-w-[92%] bg-slate-950 text-white",
                  )}
                >
                  {message.role === "assistant" ? (
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                      <Sparkles className="size-3.5" />
                      Copiloto
                    </div>
                  ) : null}

                  <p className="whitespace-pre-line">{message.content}</p>

                  {message.role === "assistant" &&
                  message.references &&
                  message.references.length > 0 ? (
                    <p className="mt-3 text-[11px] leading-5 text-slate-400">
                      Basado en {message.references.map((reference) => reference.label).join(" · ")}.
                    </p>
                  ) : null}
                </div>
              ))}

              {isPending ? (
                <div className="rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600">
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    <LoaderCircle className="size-3.5 animate-spin" />
                    Pensando
                  </div>
                  <p className="mt-2">
                    Estoy armando una respuesta con el contexto actual.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="border-t border-slate-200 px-5 py-5">
              <div className="mb-4 flex flex-wrap gap-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-left text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-white"
                    onClick={() => submitQuestion(prompt)}
                    disabled={isPending}
                  >
                    {prompt}
                  </button>
                ))}
              </div>

              <form className="space-y-3" onSubmit={handleSubmit}>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  className="min-h-[110px] w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-slate-400"
                  placeholder="Escribe tu pregunta con tus palabras."
                  disabled={isPending}
                />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs leading-5 text-slate-500">
                    Piensa en esto como una ayuda para leer y priorizar, no como
                    otro dashboard.
                  </p>
                  <Button type="submit" disabled={isPending || draft.trim().length === 0}>
                    {isPending ? (
                      <>
                        <LoaderCircle className="mr-2 size-4 animate-spin" />
                        Respondiendo
                      </>
                    ) : (
                      <>
                        Preguntar
                        <SendHorizontal className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </div>
              </form>

              {errorMessage ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {errorMessage}
                </div>
              ) : null}
            </div>
          </section>
        </>
      ) : null}
    </>
  );
}
