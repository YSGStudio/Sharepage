"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * 승인/거부 버튼 쌍 (R17, R23).
 * PATCH 로 status 를 바꾸고 목록을 새로고침한다.
 */
export function StatusActions({
  endpoint,
  actions,
}: {
  endpoint: string;
  actions: { status: string; label: string; tone: "approve" | "reject" }[];
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function apply(status: string) {
    setBusy(status);
    setError(null);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "처리에 실패했습니다.");
        return;
      }
      router.refresh();
    } catch {
      setError("네트워크 오류입니다.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {actions.map((action) => (
        <button
          key={action.status}
          type="button"
          onClick={() => apply(action.status)}
          disabled={busy !== null}
          className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
            action.tone === "approve"
              ? "bg-brand-600 text-white hover:bg-brand-700"
              : "border border-red-200 text-red-700 hover:bg-red-50"
          }`}
        >
          {busy === action.status ? "처리 중…" : action.label}
        </button>
      ))}
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
