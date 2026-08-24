import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * 탭 순서 저장 (운영자 전용).
 * 화면이 보이는 순서 그대로 id 배열을 보내면 sort_order 를 다시 매긴다.
 * 부분 갱신이 아니라 전체를 다시 쓰므로 순서가 어긋날 여지가 없다.
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

  const ids = (raw as Record<string, unknown>)?.ids;
  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json(
      { error: "정렬할 탭 목록이 필요합니다." },
      { status: 400 },
    );
  }
  if (ids.some((id) => typeof id !== "string" || !id)) {
    return NextResponse.json({ error: "탭 id 가 올바르지 않습니다." }, { status: 400 });
  }
  if (new Set(ids).size !== ids.length) {
    return NextResponse.json({ error: "탭 id 가 중복되었습니다." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();

  for (const [index, id] of (ids as string[]).entries()) {
    const { error } = await supabase
      .from("nav_items")
      .update({ sort_order: (index + 1) * 10 })
      .eq("id", id);

    if (error) {
      console.error("[nav] 순서 저장 실패:", error.message);
      return NextResponse.json(
        { error: "순서 저장에 실패했습니다." },
        { status: 500 },
      );
    }
  }

  return NextResponse.json({ ok: true, count: ids.length });
}
