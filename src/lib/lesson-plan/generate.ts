import OpenAI from "openai";
import { openAiApiKey, openAiModel } from "@/lib/env";
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
