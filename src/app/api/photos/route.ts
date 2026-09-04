import { NextResponse } from "next/server";
import { isGallerySectionKey } from "@/content/gallery-sections";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  buildStoragePath,
  checkFile,
  MAX_IMAGE_BYTES,
  PHOTOS_BUCKET,
} from "@/lib/upload";

/** 운영 사진 업로드 (R14). 승인된 교사만 가능. */
export async function POST(request: Request) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const caption = String(form.get("caption") ?? "").trim();
  const category = String(form.get("category") ?? "").trim();
  const file = form.get("file");

  // 분류는 앨범 섹션 키(`과제id:추진내용번호`)만 받는다. 비워 두면 '미분류'.
  if (category && !isGallerySectionKey(category)) {
    return NextResponse.json(
      { error: "분류 값이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const fileError = checkFile(file instanceof File ? file : null, {
    maxBytes: MAX_IMAGE_BYTES,
    allowedTypes: ALLOWED_IMAGE_TYPES,
  });
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const upload = file as File;
  const supabase = await createSupabaseServerClient();
  const storagePath = buildStoragePath("photos", upload.name);

  const { error: uploadError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .upload(storagePath, upload, {
      contentType: upload.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[photos] 업로드 실패:", uploadError.message);
    return NextResponse.json(
      { error: "사진 업로드에 실패했습니다." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("photos")
    .insert({
      storage_path: storagePath,
      caption: caption || null,
      category: category || null,
      uploader_id: guard.user.userId,
    })
    .select("id")
    .single();

  if (error) {
    await supabase.storage.from(PHOTOS_BUCKET).remove([storagePath]);
    console.error("[photos] 레코드 생성 실패:", error.message);
    return NextResponse.json(
      { error: "사진 등록에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
