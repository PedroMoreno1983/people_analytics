import { loadCopilotContext } from "@/lib/copilot/context";
import { buildLocalCopilotAnswer, pickRelevantReferences } from "@/lib/copilot/local";
import { generateOpenAICopilotAnswer } from "@/lib/copilot/openai";
import type {
  CopilotConversationMessage,
  CopilotReply,
  CopilotView,
} from "@/lib/copilot/types";

type BuildCopilotReplyInput = {
  view: CopilotView;
  companyId?: string;
  question: string;
  history: CopilotConversationMessage[];
};

export async function buildCopilotReply({
  view,
  companyId,
  question,
  history,
}: BuildCopilotReplyInput): Promise<CopilotReply> {
  const context = await loadCopilotContext(view, companyId);
  const references = pickRelevantReferences(context.references, question);
  const openAIAnswer = await generateOpenAICopilotAnswer(context, question, history);

  if (openAIAnswer) {
    return {
      answer: openAIAnswer,
      mode: "openai",
      references,
      suggestedPrompts: context.suggestedPrompts,
    };
  }

  return {
    answer: buildLocalCopilotAnswer(context, question),
    mode: "local",
    references,
    suggestedPrompts: context.suggestedPrompts,
  };
}
