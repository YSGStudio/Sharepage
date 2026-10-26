import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  buildStoragePath,
  checkFileMeta,
  type FileMeta,
  IMAGE_EXTENSIONS,
  MAX_IMAGE_BYTES,
  PHOTOS_BUCKET,
} from "@/lib/upload";

/**
 * 앨범 사진을 브라우저가 Supabase Storage 로 직접 올릴 수 있는 일회용 주소를 만든다.
 *
 * 휴대폰 사진(수 MB)을 서버 함수로 받으면 호스팅의 요청 크기 제한(4.5MB, 413)에 걸린다.
 * 서버는 권한과 한도만 확인하고 주소를 내주며, 파일은 브라우저 → Storage 로 바로 간다.
 * 등록(POST /api/photos)에서 올라간 파일의 실제 크기·형식을 다시 확인한다.
 */
export async function POST(request: Request) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  let body: { file?: FileMeta };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const fileError = checkFileMeta(body.file, MAX_IMAGE_BYTES, ALLOWED_IMAGE_TYPES);
  if (fileError) return NextResponse.json({ error: fileError }, { status: 400 });

  const ext = IMAGE_EXTENSIONS[body.file!.type as string];
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .createSignedUploadUrl(buildStoragePath("photos", `photo.${ext}`));

  if (error) {
    console.error("[photos] 업로드 주소 생성 실패:", error.message);
    return NextResponse.json({ error: "업로드를 준비하지 못했습니다." }, { status: 500 });
  }

  return NextResponse.json({ path: data.path, token: data.token });
}
