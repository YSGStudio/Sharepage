import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { validateActivityInput } from "@/lib/timeline-activity";

/**
 * 월별 추진활동 등록 (운영자 전용).
 * 새 카드는 그 달의 맨 아래에 붙는다.
 */
export async function POST(request: Request) {
  const guard = await requireAdmin();
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

  const parsed = validateActivityInput(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }
  const input = parsed.value;

  const supabase = await createSupabaseServerClient();

  const { data: last } = await supabase
    .from("timeline_activities")
    .select("sort_order")
    .eq("year", input.year)
    .eq("month", input.month)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const { data, error } = await supabase
    .from("timeline_activities")
    .insert({
      ...input,
      sort_order: (last?.sort_order ?? 0) + 1,
      created_by: guard.user.userId,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[timeline] 등록 실패:", error.message);
    return NextResponse.json(
      { error: "활동 등록에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
