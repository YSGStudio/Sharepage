import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TeachingMaterial } from "@/lib/supabase/types";
import { MATERIALS_BUCKET } from "../route";

/**
 * 수업자료 삭제 (R16).
 * 운영자만 가능. 일반 교사가 호출하면 403 (AC7).
 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: material } = await supabase
    .from("teaching_materials")
    .select("*")
    .eq("id", id)
    .maybeSingle<TeachingMaterial>();

  if (!material) {
    return NextResponse.json(
      { error: "자료를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { error } = await supabase
    .from("teaching_materials")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("[materials] 삭제 실패:", error.message);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  // 레코드가 지워진 뒤 파일도 정리한다. 파일 정리 실패는 치명적이지 않다.
  const { error: storageError } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .remove([material.file_path]);
  if (storageError) {
    console.error("[materials] 파일 정리 실패:", storageError.message);
  }

  return NextResponse.json({ ok: true });
}
