import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { buildStoragePath, checkFile, MAX_FILE_BYTES } from "@/lib/upload";

export const MATERIALS_BUCKET = "materials";

/**
 * 수업자료 업로드 (R6).
 * 승인된 교사만 가능. 비로그인·승인대기 계정은 requireApprovedTeacher 에서 막힌다 (R22).
 */
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

  const title = String(form.get("title") ?? "").trim();
  const subject = String(form.get("subject") ?? "").trim();
  const grade = String(form.get("grade") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const file = form.get("file");

  if (!title || !subject || !grade) {
    return NextResponse.json(
      { error: "제목, 과목, 학년은 모두 입력해야 합니다." },
      { status: 400 },
    );
  }

  const fileError = checkFile(file instanceof File ? file : null, {
    maxBytes: MAX_FILE_BYTES,
  });
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const upload = file as File;
  const supabase = await createSupabaseServerClient();
  const storagePath = buildStoragePath("materials", upload.name);

  const { error: uploadError } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(storagePath, upload, {
      contentType: upload.type || "application/octet-stream",
      upsert: false,
    });

  if (uploadError) {
    console.error("[materials] 업로드 실패:", uploadError.message);
    return NextResponse.json(
      { error: "파일 업로드에 실패했습니다." },
      { status: 500 },
    );
  }

  const { data, error } = await supabase
    .from("teaching_materials")
    .insert({
      title,
      subject,
      grade,
      description: description || null,
      file_path: storagePath,
      file_name: upload.name,
      uploader_id: guard.user.userId,
    })
    .select("id")
    .single();

  if (error) {
    // DB 기록에 실패하면 올라간 파일은 남기지 않는다.
    await supabase.storage.from(MATERIALS_BUCKET).remove([storagePath]);
    console.error("[materials] 레코드 생성 실패:", error.message);
    return NextResponse.json(
      { error: "자료 등록에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
