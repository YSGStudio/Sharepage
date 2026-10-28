"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { checkPhotoFile, sendJson, uploadPhotoFile } from "@/lib/photo-upload";
import { ALLOWED_IMAGE_TYPES } from "@/lib/upload";

/**
 * 앨범 사진 파일 교체 버튼. 권한 판정은 API 가 한다.
 * 파일을 고르면 Storage 에 바로 올린 뒤 사진의 경로만 바꾼다. 캡션·섹션은 그대로 둔다.
 */
export function PhotoReplaceButton({ photoId }: { photoId: string }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    // 같은 파일을 다시 골라도 change 가 일어나게 비워 둔다.
    event.target.value = "";
    if (!file) return;

    setError(null);
    const fileError = checkPhotoFile(file);
    if (fileError) {
      setError(fileError);
      return;
    }

    setBusy(true);
    try {
      const storagePath = await uploadPhotoFile(file);
      await sendJson(`/api/photos/${photoId}`, { storage_path: storagePath }, "PATCH");
      router.refresh();
    } catch (e) {
      setError(
        e instanceof TypeError
          ? "네트워크 오류입니다."
          : e instanceof Error
            ? e.message
            : "교체에 실패했습니다.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleChange}
        className="hidden"
        aria-hidden
        tabIndex={-1}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={busy}
        className="rounded-md border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
      >
        {busy ? "교체 중…" : "사진 교체"}
      </button>
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </>
  );
}
