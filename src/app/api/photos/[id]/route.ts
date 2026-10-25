import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Photo } from "@/lib/supabase/types";
import { PHOTOS_BUCKET } from "@/lib/upload";

/** 사진 캡션 수정. 승인된 교사(운영자 포함)는 누구의 사진이든 캡션을 고칠 수 있다. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApprovedTeacher();
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
  if (typeof body.caption !== "string" && body.caption !== null) {
    return NextResponse.json(
      { error: "캡션 값이 올바르지 않습니다." },
      { status: 400 },
    );
  }
  const caption = (body.caption ?? "").trim();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("photos")
    .update({ caption: caption || null })
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[photos] 캡션 수정 실패:", error.message);
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json(
      { error: "사진을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}

/** 사진 삭제 (R16). 승인된 교사(운영자 포함)는 누구의 사진이든 삭제할 수 있다. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .maybeSingle<Photo>();

  if (!photo) {
    return NextResponse.json(
      { error: "사진을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) {
    console.error("[photos] 삭제 실패:", error.message);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  const { error: storageError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .remove([photo.storage_path]);
  if (storageError) {
    console.error("[photos] 파일 정리 실패:", storageError.message);
  }

  return NextResponse.json({ ok: true });
}
