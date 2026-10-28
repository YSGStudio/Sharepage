import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, PHOTOS_BUCKET } from "@/lib/upload";

/** JSON 을 보내고, 실패하면 서버가 준 문구로 예외를 던진다. */
export async function sendJson<T = unknown>(
  url: string,
  body: unknown,
  method: "POST" | "PATCH" = "POST",
): Promise<T> {
  const res = await fetch(url, {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error ?? "업로드에 실패했습니다.");
  return json as T;
}

/** 고른 앨범 사진이 형식·크기에 맞는지 본다. 맞으면 null. */
export function checkPhotoFile(file: File | null | undefined): string | null {
  if (!file || file.size === 0) return "사진을 선택해 주세요.";
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "JPG, PNG, WEBP, GIF 형식만 올릴 수 있습니다.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "사진이 너무 큽니다. 10MB 이하만 올릴 수 있습니다.";
  }
  return null;
}

/**
 * 앨범 사진을 브라우저에서 Storage 로 바로 올리고 경로를 돌려준다(서버 요청 크기 제한 회피).
 * 등록·교체는 이 경로를 API 에 보내고, 서버가 올라간 파일을 다시 확인한다.
 */
export async function uploadPhotoFile(file: File): Promise<string> {
  // 업로드 주소 받기 — 서버는 권한·한도만 확인한다.
  const prepared = await sendJson<{ path: string; token: string }>(
    "/api/photos/upload-url",
    { file: { name: file.name, size: file.size, type: file.type } },
  );

  const uploaded = await createSupabaseBrowserClient()
    .storage.from(PHOTOS_BUCKET)
    .uploadToSignedUrl(prepared.path, prepared.token, file, {
      contentType: file.type,
    });
  if (uploaded.error) {
    console.error("[photos] 사진 업로드 실패:", uploaded.error);
    throw new Error("사진 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.");
  }

  return prepared.path;
}
