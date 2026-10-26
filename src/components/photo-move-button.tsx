"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { GALLERY_SECTIONS } from "@/content/gallery-sections";

/**
 * 앨범 사진 섹션 이동 버튼. 권한 판정은 API 가 한다.
 * 이동을 누르면 연구 과제 5개가 나오고, 과제를 고르면 그 안의 주요 추진 내용을 고른다.
 */
export function PhotoMoveButton({
  photoId,
  category,
}: {
  photoId: string;
  /** 지금 들어 있는 섹션 키. 미분류면 null */
  category: string | null;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const task = GALLERY_SECTIONS.find((s) => s.taskId === taskId) ?? null;

  function close() {
    setOpen(false);
    setTaskId(null);
  }

  async function move(key: string) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: key }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? "이동에 실패했습니다.");
        return;
      }
      close();
      router.refresh();
    } catch {
      setError("네트워크 오류입니다.");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setOpen(true);
          }}
          className="rounded-md border border-brand-200 px-2.5 py-1 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-50"
        >
          이동
        </button>
        {error && <p className="w-full text-xs text-red-600">{error}</p>}
      </>
    );
  }

  const optionClass =
    "w-full rounded-md border px-2.5 py-1.5 text-left text-xs leading-snug transition-colors disabled:opacity-50";

  return (
    <div className="flex w-full flex-col gap-1.5 rounded-lg border border-brand-100 bg-brand-50/40 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold text-ink-700">
          {task ? `${task.label}. ${task.title}` : "어느 과제로 옮길까요?"}
        </p>
        <button
          type="button"
          onClick={close}
          disabled={busy}
          className="shrink-0 text-xs text-ink-500 hover:underline"
        >
          취소
        </button>
      </div>

      {!task ? (
        <ul className="flex flex-col gap-1">
          {GALLERY_SECTIONS.map((section) => (
            <li key={section.taskId}>
              <button
                type="button"
                onClick={() => setTaskId(section.taskId)}
                className={`${optionClass} border-brand-200 bg-white text-ink-700 hover:bg-brand-50`}
              >
                <span className="font-bold text-brand-700">{section.label}</span>{" "}
                {section.title}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <>
          <ul className="flex flex-col gap-1">
            {task.subsections.map((sub, index) => {
              const current = sub.key === category;
              return (
                <li key={sub.key}>
                  <button
                    type="button"
                    onClick={() => void move(sub.key)}
                    disabled={busy || current}
                    className={`${optionClass} border-brand-200 bg-white text-ink-700 hover:bg-brand-50`}
                  >
                    <span className="font-bold tabular-nums text-brand-700">
                      {String(index + 1).padStart(2, "0")}
                    </span>{" "}
                    {sub.title}
                    {current && <span className="text-ink-500"> (현재 위치)</span>}
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            onClick={() => setTaskId(null)}
            disabled={busy}
            className="self-start text-xs text-brand-700 hover:underline"
          >
            ← 과제 다시 고르기
          </button>
        </>
      )}

      {busy && <p className="text-xs text-ink-500">옮기는 중…</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
