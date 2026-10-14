"use client";

import { useState } from "react";
import { Field, FormMessage, Select, TextArea, TextInput } from "@/components/form";

export function TestimonialForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      authorType: String(formData.get("authorType") ?? ""),
      authorName: String(formData.get("authorName") ?? ""),
      content: String(formData.get("content") ?? ""),
    };

    if (!payload.authorType) {
      setError("학생·학부모·교사 중 하나를 선택해 주세요.");
      return;
    }
    if (!payload.content.trim()) {
      setError("소감 내용을 입력해 주세요.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(json.error ?? "등록에 실패했습니다.");
        return;
      }

      form.reset();
      setDone(json.message ?? "소감을 보내 주셔서 감사합니다.");
    } catch {
      setError("네트워크 오류입니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="space-y-3">
        <FormMessage tone="success">{done}</FormMessage>
        <button
          type="button"
          onClick={() => setDone(null)}
          className="text-sm font-medium text-brand-600 underline hover:text-brand-700"
        >
          소감 하나 더 남기기
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <FormMessage tone="error">{error}</FormMessage>}

      <Field label="어느 분이신가요?" htmlFor="authorType" required>
        <Select id="authorType" name="authorType" required defaultValue="">
          <option value="" disabled>
            선택하세요
          </option>
          <option value="student">학생</option>
          <option value="parent">학부모</option>
          <option value="teacher">교사</option>
        </Select>
      </Field>

      <Field
        label="이름"
        htmlFor="authorName"
        hint="비워 두시면 '익명'으로 표시됩니다."
      >
        <TextInput
          id="authorName"
          name="authorName"
          maxLength={40}
          placeholder="예: 4학년 김○○ / 3학년 담임 / 익명"
        />
      </Field>

      <Field label="소감" htmlFor="content" hint="2000자 이내" required>
        <TextArea
          id="content"
          name="content"
          rows={6}
          maxLength={2000}
          required
          placeholder="수업에서 어떤 점이 좋았는지, 아이가 어떻게 달라졌는지 자유롭게 적어 주세요."
        />
      </Field>

      <p className="text-xs leading-relaxed text-ink-500">
        보내 주신 소감은 바로 공개되지 않습니다. 운영자가 확인한 뒤 공개됩니다.
        개인을 특정할 수 있는 정보는 적지 말아 주세요.
      </p>

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
      >
        {busy ? "보내는 중…" : "소감 보내기"}
      </button>
    </form>
  );
}
