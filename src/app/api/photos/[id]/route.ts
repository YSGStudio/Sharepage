import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Photo } from "@/lib/supabase/types";
import { PHOTOS_BUCKET } from "@/lib/upload";

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
