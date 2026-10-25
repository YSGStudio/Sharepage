import { NextResponse } from "next/server";
import { generateLessonPlan } from "@/lib/lesson-plan/generate";
import {
  readSitePlanCount,
  recordSitePlan,
  SITE_DAILY_PLAN_LIMIT,
} from "@/lib/lesson-plan/rate-limit";
import { validateLessonPlanInput } from "@/lib/lesson-plan/schema";

/**
 * 지도안 생성 (R8, R9, R10, R20).
 * 인증이 필요 없는 공개 라우트다. 비로그인 방문자도 호출할 수 있다.
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

  // 1. 입력 검증이 먼저다. 누락이면 외부 API를 호출하지 않는다 (R9, AC3).
  const validated = validateLessonPlanInput(raw);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.message, missing: validated.missing },
      { status: 400 },
    );
  }

  // 2. 홈페이지 전체에서 하루 지도안 수 제한 (KST 날짜 기준, 채팅과 같은 카운터).
  const usage = await readSitePlanCount();
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error: `오늘 홈페이지에서 만들 수 있는 지도안 ${usage.limit}개가 모두 작성되었습니다. 내일 자정(한국 시간) 이후 다시 시도해 주세요.`,
        limit: usage.limit,
        count: usage.count,
      },
      { status: 429 },
    );
  }

  // 3. 생성.
  try {
    const content = await generateLessonPlan(validated.value);
    // 실패한 생성은 세지 않는다.
    const recorded = await recordSitePlan();
    return NextResponse.json({
      content,
      input: validated.value,
      usage: { count: recorded.count, limit: recorded.limit },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류입니다.";
    console.error("[lesson-plan/generate] 실패:", message);
    return NextResponse.json(
      { error: `지도안 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.` },
      { status: 502 },
    );
  }
}

/** 남은 횟수 안내용. 카운터를 올리지 않는다. */
export async function GET() {
  return NextResponse.json({ limit: SITE_DAILY_PLAN_LIMIT });
}
