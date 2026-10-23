"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/upload";

/**
 * 과제 실행 항목 사진 교체 버튼 (운영자 전용). 권한 판정은 API 가 한다.
 * 항목마다 사진은 1장이라 새로 올리면 기존 사진을 대신한다.
 */
export function TaskPhotoEditor({
  itemKey,
  customized,
}: {
  itemKey: string;
  /** 운영자가 올린 사진이 있으면 true (기본 사진으로 되돌리기 버튼을 보여 준다) */
  customized: boolean;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(init: RequestInit, fallback: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/task-photos/${itemKey}`, init);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? fallback);
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류입니다.");
    } finally {
      setBusy(false);
    }
  }

  function handleFile(file: File | undefined) {
    if (inputRef.current) inputRef.current.value = "";
    if (!file) return;
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("JPG, PNG, WEBP, GIF 사진만 올릴 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`사진은 ${MAX_IMAGE_BYTES / 1024 / 1024}MB 이하만 올릴 수 있습니다.`);
      return;
    }
    const form = new FormData();
    form.append("file", file);
    void send({ method: "PUT", body: form }, "사진 변경에 실패했습니다.");
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-1.5">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="rounded-md border border-brand-200 bg-white px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50"
      >
        {busy ? "처리 중…" : "사진 변경"}
      </button>
      {customized && (
        <button
          type="button"
          disabled={busy}
          onClick={() =>
            void send({ method: "DELETE" }, "되돌리기에 실패했습니다.")
          }
          className="rounded-md border border-surface-variant bg-white px-2.5 py-1 text-xs font-medium text-ink-500 transition-colors hover:bg-surface-container-low disabled:opacity-50"
        >
          기본 사진으로
        </button>
      )}
      {error && <p className="w-full text-xs text-red-600">{error}</p>}
    </div>
  );
}
