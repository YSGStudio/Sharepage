"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/form";
import { MAX_FILE_BYTES } from "@/lib/upload";

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

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      setError("파일을 선택해 주세요.");
      return;
    }
    if (file.size > MAX_FILE_BYTES) {
      setError("파일이 너무 큽니다. 20MB 이하만 올릴 수 있습니다.");
      return;
    }

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
        <input
          id="file"
          name="file"
          type="file"
          required
          className="w-full rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm file:mr-3 file:rounded file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700"
        />
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
