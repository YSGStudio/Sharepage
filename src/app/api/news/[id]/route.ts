import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BridgeNews } from "@/lib/supabase/types";
import { NEWS_BUCKET } from "@/lib/upload";

/** 브릿지 뉴스 삭제 (R16). 승인된 교사(운영자 포함)는 누구의 소식지든 삭제할 수 있다. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: news } = await supabase
    .from("bridge_news")
    .select("*")
    .eq("id", id)
    .maybeSingle<BridgeNews>();

  if (!news) {
    return NextResponse.json(
      { error: "소식지를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("bridge_news").delete().eq("id", id);

  if (error) {
    console.error("[news] 삭제 실패:", error.message);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  // 레코드가 지워진 뒤 PDF 와 표지를 정리한다. 파일 정리 실패는 치명적이지 않다.
  const paths = news.thumb_path
    ? [news.file_path, news.thumb_path]
    : [news.file_path];
  const { error: storageError } = await supabase.storage
    .from(NEWS_BUCKET)
    .remove(paths);
  if (storageError) {
    console.error("[news] 파일 정리 실패:", storageError.message);
  }

  return NextResponse.json({ ok: true });
}
