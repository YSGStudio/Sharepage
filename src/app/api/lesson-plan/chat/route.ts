import { NextResponse } from "next/server";
import {
  isCompletedPlan,
  validateChatRequest,
} from "@/lib/lesson-plan/chat-message";
import {
  buildChatSystemPrompt,
  collectStandards,
} from "@/lib/lesson-plan/chat-prompt";
import { generateChatReply } from "@/lib/lesson-plan/generate";
import {
  readSitePlanCount,
  recordSitePlan,
} from "@/lib/lesson-plan/rate-limit";

/**
 * 채팅으로 지도안 초안 쓰기.
 * 인증이 필요 없는 공개 라우트다. 대화 내용은 저장하지 않고 브라우저가 매번 통째로 보낸다.
 */
export async function POST(request: Request) {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  // 1. 입력 검증이 먼저다. 잘못된 요청이면 외부 API를 호출하지 않는다.
  const validated = validateChatRequest(raw);
  if (!validated.ok) {
    return NextResponse.json({ error: validated.message }, { status: 400 });
  }

  // 2. 홈페이지 전체에서 하루 지도안 수 제한 (KST 날짜 기준).
  //    이미 완성본이 있는 대화는 그 지도안을 고치는 중이므로 새로 세지도 막지도 않는다.
  const revising = validated.messages.some(
    (m) => m.role === "assistant" && isCompletedPlan(m.content),
  );
  let usage = await readSitePlanCount();
  if (!revising && !usage.allowed) {
    return NextResponse.json(
      {
        error: `오늘 홈페이지에서 만들 수 있는 지도안 ${usage.limit}개가 모두 작성되었습니다. 내일 자정(한국 시간) 이후 다시 시도해 주세요.`,
        limit: usage.limit,
        count: usage.count,
      },
      { status: 429 },
    );
  }

  // 3. 고른 성취기준의 해설·성취수준을 붙여 답변을 만든다.
  const standards = collectStandards(
    validated.messages,
    validated.standardCodes,
  );

  try {
    const content = await generateChatReply(
      buildChatSystemPrompt(standards),
      validated.messages,
    );
    if (!revising && isCompletedPlan(content)) {
      usage = await recordSitePlan();
    }
    return NextResponse.json({
      content,
      usage: { count: usage.count, limit: usage.limit },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류입니다.";
    console.error("[lesson-plan/chat] 실패:", message);
    return NextResponse.json(
      { error: "답변을 만들지 못했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 502 },
    );
  }
}
