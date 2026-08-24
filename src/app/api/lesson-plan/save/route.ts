import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { validateLessonPlanInput } from "@/lib/lesson-plan/schema";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 생성된 지도안 저장 (R11).
 * 승인된 교사만 호출할 수 있다. 비로그인·승인대기 계정은 거부된다 (R22).
 */
export async function POST(request: Request) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const body = (raw ?? {}) as Record<string, unknown>;
  const content =
    typeof body.content === "string" ? body.content.trim() : "";
  if (!content) {
    return NextResponse.json(
      { error: "저장할 지도안 내용이 없습니다." },
      { status: 400 },
    );
  }

  const validated = validateLessonPlanInput(body.input);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validated.message, missing: validated.missing },
      { status: 400 },
    );
  }

  const input = validated.value;
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("lesson_plans")
    .insert({
      teacher_id: guard.user.userId,
      grade: input.grade,
      subject: input.subject,
      achievement_standard: input.achievementStandard,
      goal: input.goal,
      task: input.task,
      eval_criteria_top: input.evalCriteriaTop,
      generated_content: content,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[lesson-plan/save] 실패:", error.message);
    return NextResponse.json(
      { error: "저장에 실패했습니다. 잠시 후 다시 시도해 주세요." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
