import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";

const ALLOWED_STATUSES = ["approved", "rejected", "pending"] as const;
type AllowedStatus = (typeof ALLOWED_STATUSES)[number];

/**
 * 교사 가입 승인/거부 (R23).
 * 운영자만 가능. status 만 바꾼다 — role 은 이 API로 바꿀 수 없다.
 * 운영자 승격은 Supabase SQL Editor 에서만 한다 (PRD Non-Goals).
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

  if (id === guard.user.userId) {
    return NextResponse.json(
      { error: "본인 계정의 상태는 바꿀 수 없습니다." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("teachers")
    .update({ status })
    .eq("id", id)
    .select("id, name, status")
    .maybeSingle();

  if (error) {
    console.error("[teachers] 상태 변경 실패:", error.message);
    return NextResponse.json(
      { error: "처리에 실패했습니다." },
      { status: 500 },
    );
  }
  if (!data) {
    return NextResponse.json(
      { error: "교사를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true, status: data.status });
}
