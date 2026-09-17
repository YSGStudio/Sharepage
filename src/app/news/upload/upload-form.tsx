"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Field, FormMessage, TextArea, TextInput } from "@/components/form";
import { renderPdfCover, THUMB_EXTENSION, THUMB_MIME } from "@/lib/pdf-thumbnail";
import { ALLOWED_PDF_TYPES, checkFile, MAX_NEWS_BYTES } from "@/lib/upload";

const MAX_NEWS_MB = MAX_NEWS_BYTES / 1024 / 1024;

/** 표지 만들기 진행 상태 */
type CoverState =
  | { step: "idle" }
  | { step: "working" }
  | { step: "done"; file: File; preview: string }
  | { step: "failed" };

export function NewsUploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [cover, setCover] = useState<CoverState>({ step: "idle" });
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** 늦게 끝난 이전 파일의 표지가 나중 선택을 덮어쓰지 않도록 하는 표식 */
  const coverRun = useRef(0);

  // 미리보기 objectURL 은 화면을 떠날 때 정리한다.
  useEffect(() => {
    return () => {
      if (cover.step === "done") URL.revokeObjectURL(cover.preview);
    };
  }, [cover]);

  function resetCover() {
    coverRun.current += 1;
    setCover((prev) => {
      if (prev.step === "done") URL.revokeObjectURL(prev.preview);
      return { step: "idle" };
    });
  }

  /** PDF 첫 페이지를 그려 표지를 만든다. 실패해도 등록은 막지 않는다. */
  async function makeCover(file: File) {
    const run = (coverRun.current += 1);
    setCover({ step: "working" });
    try {
      const blob = await renderPdfCover(file);
      if (run !== coverRun.current) return;
      const coverFile = new File([blob], `cover.${THUMB_EXTENSION}`, {
        type: THUMB_MIME,
      });
      setCover({ step: "done", file: coverFile, preview: URL.createObjectURL(blob) });
    } catch (e) {
      console.error("[news] 표지 생성 실패:", e);
      if (run === coverRun.current) setCover({ step: "failed" });
    }
  }

  function chooseFile(file: File | null) {
    const message = checkFile(file, {
      maxBytes: MAX_NEWS_BYTES,
      allowedTypes: ALLOWED_PDF_TYPES,
    });
    if (message) {
      setSelectedFile(null);
      resetCover();
      setError(file && file.size > 0 ? "PDF 파일만 올릴 수 있습니다." : message);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setError(null);
    void makeCover(file!);
  }

  function clearFile() {
    setSelectedFile(null);
    resetCover();
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);

    const fileError = checkFile(selectedFile, {
      maxBytes: MAX_NEWS_BYTES,
      allowedTypes: ALLOWED_PDF_TYPES,
    });
    if (fileError) {
      setError(fileError);
      return;
    }
    formData.set("file", selectedFile!);

    if (cover.step === "working") {
      setError("표지를 만드는 중입니다. 잠시 후 다시 눌러 주세요.");
      return;
    }
    if (cover.step === "done") formData.set("thumb", cover.file);

    setBusy(true);
    try {
      const res = await fetch("/api/news", { method: "POST", body: formData });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "업로드에 실패했습니다.");
        return;
      }

      form.reset();
      setSelectedFile(null);
      resetCover();
      router.push("/news");
      router.refresh();
    } catch {
      setError("네트워크 오류입니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <Field label="제목" htmlFor="title" required>
        <TextInput
          id="title"
          name="title"
          required
          maxLength={120}
          placeholder="BRIDGE 뉴스 3월호 - 프로젝트의 시작"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="호수" htmlFor="issue_label" hint="예: 제3호">
          <TextInput
            id="issue_label"
            name="issue_label"
            maxLength={30}
            placeholder="제3호"
          />
        </Field>

        <Field label="발행일" htmlFor="published_on" hint="비워 두면 등록일 순으로 정렬됩니다.">
          <TextInput id="published_on" name="published_on" type="date" />
        </Field>
      </div>

      <Field label="설명" htmlFor="description" hint="이번 호에 실린 내용을 짧게 적어 주세요.">
        <TextArea id="description" name="description" rows={4} />
      </Field>

      <Field
        label="PDF 파일"
        htmlFor="file"
        hint={`${MAX_NEWS_MB}MB 이하 PDF. 첫 페이지가 목록 표지로 자동 등록됩니다.`}
        required
      >
        <div
          onDragEnter={(event) => {
            event.preventDefault();
            dragDepth.current += 1;
            setDragging(true);
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={(event) => {
            event.preventDefault();
            dragDepth.current -= 1;
            if (dragDepth.current === 0) setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            chooseFile(event.dataTransfer.files.item(0));
          }}
          className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 ${
            dragging
              ? "border-brand-500 bg-brand-100/70 shadow-[0_0_0_4px_rgba(181,196,255,0.45)]"
              : selectedFile
                ? "border-emerald-300 bg-emerald-50/60"
                : "border-brand-200 bg-brand-50/40 hover:border-brand-400 hover:bg-brand-50"
          }`}
        >
          <input
            ref={fileInputRef}
            id="file"
            name="file"
            type="file"
            accept="application/pdf,.pdf"
            aria-required="true"
            onChange={(event) => chooseFile(event.target.files?.item(0) ?? null)}
            className="sr-only"
          />
          <label
            htmlFor="file"
            className="flex min-h-48 cursor-pointer flex-col items-center justify-center px-5 py-8 text-center"
          >
            <span
              aria-hidden
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
                selectedFile
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-brand-100 text-brand-700"
              }`}
            >
              {selectedFile ? (
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m5 12 4 4L19 6" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" className="h-7 w-7 fill-none stroke-current stroke-2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16V4m0 0L7 9m5-5 5 5M5 14v5h14v-5" />
                </svg>
              )}
            </span>

            {selectedFile ? (
              <>
                <span className="mt-4 max-w-full truncate text-sm font-bold text-emerald-900">
                  {selectedFile.name}
                </span>
                <span className="mt-1 text-xs font-medium text-emerald-700">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)}MB · 클릭하면 파일을 교체할 수 있습니다
                </span>
              </>
            ) : (
              <>
                <span className="mt-4 text-base font-bold text-brand-900">
                  PDF 를 이곳에 끌어다 놓으세요
                </span>
                <span className="mt-1.5 text-sm text-on-surface-variant">
                  또는 클릭하여 내 컴퓨터에서 선택
                </span>
                <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
                  최대 {MAX_NEWS_MB}MB
                </span>
              </>
            )}
          </label>
        </div>

        {selectedFile && (
          <button
            type="button"
            onClick={clearFile}
            className="mt-2 text-xs font-semibold text-red-600 underline-offset-2 hover:underline"
          >
            선택한 파일 삭제
          </button>
        )}
      </Field>

      {selectedFile && cover.step !== "idle" && (
        <div
          aria-live="polite"
          className="flex items-start gap-4 rounded-2xl border border-surface-variant bg-surface-container-low p-4"
        >
          <div className="h-32 w-24 shrink-0 overflow-hidden rounded-lg border border-surface-variant bg-white">
            {cover.step === "done" ? (
              // 브라우저가 방금 만든 objectURL 이라 next/image 대신 img 를 쓴다.
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={cover.preview}
                alt="PDF 첫 페이지 미리보기"
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-ink-500">
                {cover.step === "working" ? "…" : "없음"}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-on-surface">표지 이미지</p>
            <p className="mt-1 text-sm leading-relaxed text-on-surface-variant">
              {cover.step === "working" && "PDF 첫 페이지를 표지로 만드는 중입니다…"}
              {cover.step === "done" &&
                "PDF 첫 페이지를 표지로 씁니다. 목록에 이 그림이 보입니다."}
              {cover.step === "failed" &&
                "첫 페이지를 그리지 못했습니다. 표지 없이 등록되며 목록에는 기본 표지가 보입니다."}
            </p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "올리는 중…" : "소식지 올리기"}
      </button>
    </form>
  );
}
