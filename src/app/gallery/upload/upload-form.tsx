"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, FormMessage, Select, TextArea } from "@/components/form";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/upload";

const CATEGORIES = [
  "수업 나눔",
  "프로젝트 활동",
  "교내 연수",
  "공개 수업",
  "학생 산출물",
  "기타",
];

export function PhotoUploadForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("사진을 선택해 주세요.");
      return;
    }
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setError("JPG, PNG, WEBP, GIF 형식만 올릴 수 있습니다.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError("사진이 너무 큽니다. 10MB 이하만 올릴 수 있습니다.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/photos", { method: "POST", body: formData });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "업로드에 실패했습니다.");
        return;
      }

      form.reset();
      setPreview(null);
      router.push("/gallery");
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

      <Field label="사진" htmlFor="file" hint="JPG·PNG·WEBP·GIF, 10MB 이하" required>
        <input
          id="file"
          name="file"
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          required
          onChange={handleFileChange}
          className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
        />
      </Field>

      {preview && (
        // 로컬 blob 미리보기라 next/image 최적화 대상이 아니다.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview}
          alt="선택한 사진 미리보기"
          className="max-h-64 w-full rounded-lg border border-brand-100 object-contain"
        />
      )}

      <Field label="분류" htmlFor="category">
        <Select id="category" name="category" defaultValue="">
          <option value="">선택 안 함</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="캡션" htmlFor="caption" hint="어떤 장면인지 짧게 적어 주세요.">
        <TextArea id="caption" name="caption" rows={3} />
      </Field>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "올리는 중…" : "사진 올리기"}
      </button>
    </form>
  );
}
