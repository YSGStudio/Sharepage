import { NextResponse } from "next/server";
import { isGallerySectionKey } from "@/content/gallery-sections";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALLOWED_IMAGE_TYPES,
  IMAGE_EXTENSIONS,
  isOwnStoragePath,
  MAX_IMAGE_BYTES,
  PHOTOS_BUCKET,
} from "@/lib/upload";

/** JSON 값에서 앞뒤 공백을 걷어낸 문자열을 꺼낸다. */
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * 운영 사진 등록 (R14). 승인된 교사만 가능.
 *
 * 파일은 브라우저가 POST /api/photos/upload-url 로 받은 주소에 직접 올리고,
 * 여기에는 올라간 경로와 캡션·분류만 JSON 으로 보낸다(서버 함수 요청 크기 제한 회피).
 * 경로가 우리가 만든 형식인지, 실제 파일의 크기·형식이 한도 안인지 다시 확인한다.
 */
export async function POST(request: Request) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const storagePath = text(body.storage_path);
  const caption = text(body.caption);
  const category = text(body.category);

  // 분류는 앨범 섹션 키(`과제id:추진내용번호`)만 받는다. 비워 두면 '미분류'.
  if (category && !isGallerySectionKey(category)) {
    return NextResponse.json(
      { error: "분류 값이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const validPath = Object.values(IMAGE_EXTENSIONS).some((ext) =>
    isOwnStoragePath("photos", storagePath, ext),
  );
  if (!validPath) {
    return NextResponse.json({ error: "사진을 선택해 주세요." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const bucket = supabase.storage.from(PHOTOS_BUCKET);

  /** 잘못 올라갔거나 등록에 실패한 파일을 지운다. 사진 버킷 삭제는 승인 교사에게 열려 있다(0006). */
  const removeUploaded = async () => {
    const { error } = await bucket.remove([storagePath]);
    if (error) console.error("[photos] 올라간 파일 정리 실패:", error.message);
  };

  // 올라간 파일을 직접 확인한다. 브라우저가 알려 준 크기·형식은 믿지 않는다.
  const { data: info, error: infoError } = await bucket.info(storagePath);
  if (infoError || !info) {
    return NextResponse.json(
      { error: "올라간 사진을 찾지 못했습니다. 다시 시도해 주세요." },
      { status: 400 },
    );
  }
  if (
    (info.size ?? 0) > MAX_IMAGE_BYTES ||
    !ALLOWED_IMAGE_TYPES.includes(info.contentType ?? "")
  ) {
    await removeUploaded();
    return NextResponse.json(
      { error: "JPG·PNG·WEBP·GIF 사진(10MB 이하)만 올릴 수 있습니다." },
      { status: 400 },
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
    await removeUploaded();
    console.error("[photos] 레코드 생성 실패:", error.message);
    return NextResponse.json(
      { error: "사진 등록에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
