"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/form";
import { checkFile, MAX_FILE_BYTES } from "@/lib/upload";

const GRADES = ["1학년", "2학년", "3학년", "4학년", "5학년", "6학년", "전학년"];
const SUBJECTS = [
  "국어",
  "수학",
  "사회",
  "과학",
  "영어",
  "체육",
  "음악",
  "미술",
  "실과",
  "도덕",
  "창의적 체험활동",
  "통합교과",
  "기타",
];

export function MaterialUploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const dragDepth = useRef(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function chooseFile(file: File | null) {
    const message = checkFile(file, { maxBytes: MAX_FILE_BYTES });
    if (message) {
      setSelectedFile(null);
      setError(message);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    setSelectedFile(file);
    setError(null);
  }

  function clearFile() {
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = selectedFile ?? formData.get("file");

    const fileError = checkFile(file instanceof File ? file : null, {
      maxBytes: MAX_FILE_BYTES,
    });
    if (fileError) {
      setError(fileError);
      return;
    }
    formData.set("file", file as File);

    setBusy(true);
    try {
      const res = await fetch("/api/materials", {
        method: "POST",
        body: formData,
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "업로드에 실패했습니다.");
        return;
      }

      form.reset();
      setSelectedFile(null);
      router.push("/materials");
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
          placeholder="물질의 성질 분류하기 - BRIDGE 적용 지도안"
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="학년" htmlFor="grade" required>
          <Select id="grade" name="grade" required defaultValue="">
            <option value="" disabled>
              선택하세요
            </option>
            {GRADES.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="과목" htmlFor="subject" required>
          <Select id="subject" name="subject" required defaultValue="">
            <option value="" disabled>
              선택하세요
            </option>
            {SUBJECTS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="설명" htmlFor="description" hint="자료를 어떻게 쓰면 좋을지 적어 주세요.">
        <TextArea id="description" name="description" rows={4} />
      </Field>

      <Field label="파일" htmlFor="file" hint="20MB 이하" required>
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
                  파일을 이곳에 끌어다 놓으세요
                </span>
                <span className="mt-1.5 text-sm text-on-surface-variant">
                  또는 클릭하여 내 컴퓨터에서 선택
                </span>
                <span className="mt-3 rounded-full bg-white px-3 py-1 text-xs font-semibold text-brand-700 shadow-sm">
                  최대 20MB
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

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "올리는 중…" : "자료 올리기"}
      </button>
    </form>
  );
}
