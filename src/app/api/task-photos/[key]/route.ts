import { NextResponse } from "next/server";
import { isTaskItemKey } from "@/content/research";
import { requireAdmin } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TaskItemPhoto } from "@/lib/supabase/types";
import {
  ALLOWED_IMAGE_TYPES,
  buildStoragePath,
  checkFile,
  MAX_IMAGE_BYTES,
  PHOTOS_BUCKET,
} from "@/lib/upload";

type Params = { params: Promise<{ key: string }> };

async function findCurrent(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  key: string,
) {
  const { data } = await supabase
    .from("task_item_photos")
    .select("*")
    .eq("item_key", key)
    .maybeSingle<TaskItemPhoto>();
  return data;
}

/** 과제 실행 항목 사진 교체. 운영자만 가능하며 항목마다 1장만 둔다. */
export async function PUT(request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { key } = await params;
  if (!isTaskItemKey(key)) {
    return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const file = form.get("file");
  const fileError = checkFile(file instanceof File ? file : null, {
    maxBytes: MAX_IMAGE_BYTES,
    allowedTypes: ALLOWED_IMAGE_TYPES,
  });
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const upload = file as File;
  const supabase = await createSupabaseServerClient();
  const previous = await findCurrent(supabase, key);
  const storagePath = buildStoragePath("task-items", upload.name);

  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(storagePath, upload, { contentType: upload.type, upsert: false });

  if (uploadError) {
    console.error("[task-photos] 업로드 실패:", uploadError.message);
    return NextResponse.json(
      { error: "사진 업로드에 실패했습니다." },
      { status: 500 },
    );
  }

  const { error } = await supabase.from("task_item_photos").upsert({
    item_key: key,
    storage_path: storagePath,
    updated_by: guard.user.userId,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    console.error("[task-photos] 레코드 저장 실패:", error.message);
    return NextResponse.json(
      { error: "사진 저장에 실패했습니다." },
      { status: 500 },
    );
  }

  // 항목당 1장만 두므로 이전에 올린 파일은 정리한다.
  if (previous) {
    const { error: storageError } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .remove([previous.storage_path]);
    if (storageError) {
      console.error("[task-photos] 이전 파일 정리 실패:", storageError.message);
    }
  }

  return NextResponse.json({ ok: true });
}

/** 운영자가 올린 사진을 지우고 기본 사진(결과보고서)으로 되돌린다. */
export async function DELETE(_request: Request, { params }: Params) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { key } = await params;
  if (!isTaskItemKey(key)) {
    return NextResponse.json({ error: "항목을 찾을 수 없습니다." }, { status: 404 });
  }

  const supabase = await createSupabaseServerClient();
  const current = await findCurrent(supabase, key);
  if (!current) return NextResponse.json({ ok: true });

  const { error } = await supabase
    .from("task_item_photos")
    .delete()
    .eq("item_key", key);
  if (error) {
    console.error("[task-photos] 삭제 실패:", error.message);
    return NextResponse.json({ error: "되돌리기에 실패했습니다." }, { status: 500 });
  }

  const { error: storageError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .remove([current.storage_path]);
  if (storageError) {
    console.error("[task-photos] 파일 정리 실패:", storageError.message);
  }

  return NextResponse.json({ ok: true });
}
