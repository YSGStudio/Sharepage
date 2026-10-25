import OpenAI from "openai";
import { openAiApiKey, openAiModel } from "@/lib/env";
import type { ChatMessage } from "./chat-message";
import { buildUserPrompt, LESSON_PLAN_SYSTEM_PROMPT } from "./prompt";
import type { LessonPlanInput } from "./schema";

/**
 * OpenAI로 BRIDGE 지도안 초안을 생성한다 (R8, R10).
 * 라우트 핸들러에서 분리해 두어 테스트에서 mock 하기 쉽게 한다.
 */
export async function generateLessonPlan(
  input: LessonPlanInput,
): Promise<string> {
  const client = new OpenAI({ apiKey: openAiApiKey() });

  const completion = await client.chat.completions.create({
    model: openAiModel(),
    messages: [
      { role: "system", content: LESSON_PLAN_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(input) },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("지도안 생성 결과가 비어 있습니다.");
  }
  return content;
}

/** 채팅 한 턴의 답변을 만든다. 시스템 프롬프트는 chat-prompt.ts 가 조립한다. */
export async function generateChatReply(
  systemPrompt: string,
  messages: ChatMessage[],
): Promise<string> {
  const client = new OpenAI({ apiKey: openAiApiKey() });

  const completion = await client.chat.completions.create({
    model: openAiModel(),
    messages: [{ role: "system", content: systemPrompt }, ...messages],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error("답변이 비어 있습니다.");
  }
  return content;
}
