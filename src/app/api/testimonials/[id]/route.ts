import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["approved", "rejected", "pending"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * 소감 승인/거부 (R13, R17).
 * 운영자만 가능. 일반 교사·비로그인은 403/401 (AC8).
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

  const status = String((raw as Record<string, unknown>)?.status ?? "");
  if (!ALLOWED_STATUSES.includes(status as AllowedStatus)) {
    return NextResponse.json(
      { error: "status 는 approved, rejected, pending 중 하나여야 합니다." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("testimonials")
    .update({ status, reviewed_by: guard.user.userId })
    .eq("id", id)
    .select("id, status")
    .maybeSingle();

  if (error) {
    console.error("[testimonials] 상태 변경 실패:", error.message);
    return NextResponse.json(
      { error: "처리에 실패했습니다." },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "소감을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, status: data.status });
}

/** 소감 삭제 (운영자 전용). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("testimonials").delete().eq("id", id);
  if (error) {
    console.error("[testimonials] 삭제 실패:", error.message);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
