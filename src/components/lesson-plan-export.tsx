"use client";

import { useState } from "react";
import { FormMessage } from "@/components/form";
import { lessonPlanToPrintHtml } from "@/lib/lesson-plan/export-html";

/** 파일 이름에 쓸 수 없는 문자를 걷어낸다. */
function safeFileName(name: string): string {
  return name.replace(/[\\/:*?"<>|]+/g, "").replace(/\s+/g, "_");
}

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 지도안 내보내기 버튼 묶음: 한글(.hwp) · PDF · 마크다운(.md).
 *
 * 모두 브라우저에서 만든다. 로그인 여부와 무관하다 (R19, AC10).
 * - 한글: rhwp WASM 으로 한글 5.0 바이너리를 만든다(처음 한 번 WASM 을 받는다).
 * - PDF: 인쇄용 문서를 새 창에 열고 인쇄 대화상자에서 "PDF로 저장" 한다.
 */
export function LessonPlanExport({
  content,
  baseName,
  markdownHeader = "",
}: {
  content: string;
  /** 확장자를 뺀 파일 이름. 예: BRIDGE_지도안_4학년_과학 */
  baseName: string;
  /** .md 파일 맨 앞에 붙일 머리말 */
  markdownHeader?: string;
}) {
  const [hwpState, setHwpState] = useState<"idle" | "working">("idle");
  const [error, setError] = useState<string | null>(null);
  const fileName = safeFileName(baseName);

  async function handleHwp() {
    setError(null);
    setHwpState("working");
    try {
      const { lessonPlanToHwpBlob } = await import("@/lib/lesson-plan/export-hwp");
      downloadBlob(await lessonPlanToHwpBlob(content), `${fileName}.hwp`);
    } catch (e) {
      console.error(e);
      setError("한글 파일을 만들지 못했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setHwpState("idle");
    }
  }

  function handlePdf() {
    setError(null);
    // 인쇄 창 제목이 PDF 기본 파일 이름이 된다.
    const html = lessonPlanToPrintHtml(content, fileName);
    const url = URL.createObjectURL(new Blob([html], { type: "text/html;charset=utf-8" }));
    const win = window.open(url, "_blank");
    if (!win) {
      URL.revokeObjectURL(url);
      setError("팝업이 차단되었습니다. 이 사이트의 팝업을 허용한 뒤 다시 눌러 주세요.");
      return;
    }
    // 새 창이 문서를 읽어 갈 시간을 준 뒤 해제한다.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  function handleMarkdown() {
    setError(null);
    downloadBlob(
      new Blob([markdownHeader + content], { type: "text/markdown;charset=utf-8" }),
      `${fileName}.md`,
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={handleHwp}
          disabled={hwpState === "working"}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-wait disabled:opacity-60"
        >
          {hwpState === "working" ? "한글 파일 만드는 중…" : "한글로 내려받기 (.hwp)"}
        </button>
        <button
          type="button"
          onClick={handlePdf}
          className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          PDF로 내보내기
        </button>
        <button
          type="button"
          onClick={handleMarkdown}
          className="px-2 py-2 text-xs font-medium text-brand-600 underline hover:text-brand-700"
        >
          마크다운(.md)
        </button>
      </div>
      <p className="text-xs text-ink-500">
        PDF는 인쇄 창이 열리면 대상(프린터)을 <strong>PDF로 저장</strong>으로 골라 주세요.
      </p>
      {error && <FormMessage tone="error">{error}</FormMessage>}
    </div>
  );
}
