import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isActivityStatus, validateActivityInput } from "@/lib/timeline-activity";

/**
 * 월별 추진활동 수정 (운영자 전용).
 * 상태만 바꾸는 요청({ status })과 카드 전체 수정을 모두 받는다.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;

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
  const statusOnly = Object.keys(body).length === 1 && "status" in body;

  let patch: Record<string, unknown>;
  if (statusOnly) {
    if (!isActivityStatus(body.status)) {
      return NextResponse.json(
        { error: "상태는 시작 전·진행 중·완료 중 하나여야 합니다." },
        { status: 400 },
      );
    }
    patch = { status: body.status };
  } else {
    const parsed = validateActivityInput(body);
    if ("error" in parsed) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    patch = { ...parsed.value };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("timeline_activities")
    .update(patch)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[timeline] 수정 실패:", error.message);
    return NextResponse.json(
      { error: "수정에 실패했습니다." },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "활동을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

/** 월별 추진활동 삭제 (운영자 전용). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase
    .from("timeline_activities")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[timeline] 삭제 실패:", error.message);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
