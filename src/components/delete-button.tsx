"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 삭제 버튼 (R16, R17). 권한 판정은 API 가 한다.
 * 브라우저 confirm() 대신 인라인 2단계 확인을 쓴다.
 */
export function DeleteButton({
  endpoint,
  label = "삭제",
  confirmLabel = "정말 삭제할까요?",
  className = "",
}: {
  endpoint: string;
  label?: string;
  confirmLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const [armed, setArmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "삭제에 실패했습니다.");
        setArmed(false);
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류입니다.");
      setArmed(false);
    } finally {
      setBusy(false);
    }
  }

  if (error) {
    return (
      <span className="text-xs text-red-600">
        {error}{" "}
        <button
          type="button"
          onClick={() => setError(null)}
          className="underline"
        >
          다시
        </button>
      </span>
    );
  }

  if (!armed) {
    return (
      <button
        type="button"
        onClick={() => setArmed(true)}
        className={`rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 transition-colors hover:bg-red-50 ${className}`}
      >
        {label}
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-xs text-ink-700">{confirmLabel}</span>
      <button
        type="button"
        onClick={handleDelete}
        disabled={busy}
        className="rounded-md bg-red-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
      >
        {busy ? "삭제 중…" : "네"}
      </button>
      <button
        type="button"
        onClick={() => setArmed(false)}
        disabled={busy}
        className="rounded-md border border-brand-200 px-2.5 py-1 text-xs text-ink-700 hover:bg-brand-50"
      >
        취소
      </button>
    </span>
  );
}
