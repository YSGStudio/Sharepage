"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 운영 사진 캡션 표시 + 인라인 수정. canEdit 이 거짓이면 캡션만 보여 준다.
 * 권한 판정은 API 가 한다.
 */
export function CaptionEditor({
  photoId,
  caption,
  canEdit,
}: {
  photoId: string;
  caption: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(caption ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caption: draft }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "수정에 실패했습니다.");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("네트워크 오류입니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!editing) {
    return (
      <>
        {caption && (
          <p className="text-sm leading-relaxed text-ink-700">{caption}</p>
        )}
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setDraft(caption ?? "");
              setError(null);
              setEditing(true);
            }}
            className="mt-1.5 self-start text-xs font-medium text-brand-700 underline-offset-2 hover:underline"
          >
            {caption ? "캡션 수정" : "캡션 추가"}
          </button>
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        rows={3}
        autoFocus
        aria-label="캡션"
        className="w-full rounded-lg border border-brand-200 px-3 py-2 text-sm leading-relaxed text-ink-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-1.5">
        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="rounded-md bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {busy ? "저장 중…" : "저장"}
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          disabled={busy}
          className="rounded-md border border-brand-200 px-2.5 py-1 text-xs text-ink-700 hover:bg-brand-50"
        >
          취소
        </button>
      </div>
    </div>
  );
}
