"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Field, FormMessage, TextArea, TextInput } from "@/components/form";
import { Markdown } from "@/components/markdown";
import { Alert, Card } from "@/components/ui";
import {
  FIELD_LABELS,
  REQUIRED_FIELDS,
  type LessonPlanInput,
  type RequiredField,
} from "@/lib/lesson-plan/schema";

const EMPTY: LessonPlanInput = {
  grade: "",
  semester: "",
  subject: "",
  unit: "",
  period: "",
  achievementStandard: "",
  goal: "",
  task: "",
  evalCriteriaTop: "",
  textbookPages: "",
  classroom: "",
  lessonDate: "",
  competencies: "",
  digitalTools: "",
  duration: "",
};

const EXAMPLE: LessonPlanInput = {
  grade: "4학년",
  semester: "1학기",
  subject: "과학",
  unit: "2단원 물질의 성질",
  period: "3/6차시",
  achievementStandard:
    "[4과05-01] 여러 가지 물체를 관찰하여 물질의 성질을 설명할 수 있다.",
  goal: "물질의 성질에 따라 물체를 분류하고 그 기준을 설명할 수 있다.",
  task: "교실에서 찾은 물체를 성질을 기준으로 분류하고, 왜 그렇게 나누었는지 모둠에서 설명하기",
  evalCriteriaTop:
    "물질의 성질을 두 가지 이상 근거로 들어 물체를 정확히 분류하고, 분류 기준을 친구가 이해하도록 설명할 수 있다.",
  textbookPages: "42-45쪽",
  classroom: "4학년 2반",
  lessonDate: "2026.5.26.(화)",
  competencies: "과학적 탐구능력, 과학적 문제해결력",
  digitalTools: "패들렛",
  duration: "40분",
};

export function LessonPlanGenerator({
  canSave,
  dailyLimit,
}: {
  canSave: boolean;
  dailyLimit: number;
}) {
  const [input, setInput] = useState<LessonPlanInput>(EMPTY);
  const [errors, setErrors] = useState<RequiredField[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [result, setResult] = useState<string | null>(null);
  const [resultInput, setResultInput] = useState<LessonPlanInput | null>(null);

  const [saveState, setSaveState] = useState<
    { status: "idle" | "saving" } | { status: "saved"; id: string } | { status: "error"; message: string }
  >({ status: "idle" });

  const resultRef = useRef<HTMLDivElement>(null);

  const set = (key: keyof LessonPlanInput) => (value: string) =>
    setInput((prev) => ({ ...prev, [key]: value }));

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    // 클라이언트에서 먼저 막는다 — 누락 상태로는 생성 API를 호출하지 않는다 (AC3).
    const missing = REQUIRED_FIELDS.filter((f) => !input[f]?.trim());
    setErrors(missing);
    if (missing.length > 0) {
      setMessage(
        `다음 필수 항목을 입력해 주세요: ${missing
          .map((f) => FIELD_LABELS[f])
          .join(", ")}`,
      );
      return;
    }

    setLoading(true);
    setResult(null);
    setSaveState({ status: "idle" });

    try {
      const res = await fetch("/api/lesson-plan/generate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
      });
      const json = await res.json();

      if (!res.ok) {
        setMessage(json.error ?? "지도안 생성에 실패했습니다.");
        return;
      }

      setResult(json.content);
      setResultInput(input);
      // 결과가 화면 밖에 생기지 않도록 스크롤한다.
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    } catch {
      setMessage("네트워크 오류입니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  /** 로그인 여부와 무관하게 즉시 파일로 내려받는다 (R19, AC10). */
  function handleDownload() {
    if (!result || !resultInput) return;
    const header = [
      "# BRIDGE 교수·학습과정안 (AI 생성 초안 — 교사 검수 필요)",
      "",
      `- 학년·학기·교과: ${resultInput.grade} ${resultInput.semester} ${resultInput.subject}`,
      `- 단원·차시: ${resultInput.unit} / ${resultInput.period}`,
      `- 생성일: ${new Date().toLocaleString("ko-KR")}`,
      "",
      "---",
      "",
    ].join("\n");

    const blob = new Blob([header + result], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BRIDGE_지도안_${resultInput.grade}_${resultInput.subject}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function handleSave() {
    if (!result || !resultInput) return;
    setSaveState({ status: "saving" });
    try {
      const res = await fetch("/api/lesson-plan/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content: result, input: resultInput }),
      });
      const json = await res.json();
      if (!res.ok) {
        setSaveState({ status: "error", message: json.error ?? "저장 실패" });
        return;
      }
      setSaveState({ status: "saved", id: json.id });
    } catch {
      setSaveState({ status: "error", message: "네트워크 오류입니다." });
    }
  }

  const invalid = (field: RequiredField) => errors.includes(field);
  const ring = (field: RequiredField) =>
    invalid(field) ? "border-red-400 focus:border-red-500 focus:ring-red-200" : "";

  /** 한 줄짜리 필수 입력 */
  const shortField = (field: RequiredField, placeholder: string) => (
    <Field label={FIELD_LABELS[field]} htmlFor={field} required>
      <TextInput
        id={field}
        value={input[field]}
        onChange={(e) => set(field)(e.target.value)}
        placeholder={placeholder}
        aria-invalid={invalid(field)}
        className={ring(field)}
      />
    </Field>
  );

  /** 선택 입력 (한 줄) */
  const optionalField = (
    field: "textbookPages" | "classroom" | "lessonDate" | "competencies" | "digitalTools" | "duration",
    placeholder: string,
    hint?: string,
  ) => (
    <Field label={FIELD_LABELS[field]} htmlFor={field} hint={hint}>
      <TextInput
        id={field}
        value={input[field]}
        onChange={(e) => set(field)(e.target.value)}
        placeholder={placeholder}
      />
    </Field>
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
      {/* 입력 폼 */}
      <Card className="lg:sticky lg:top-24">
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-bold text-brand-800">필수 입력</h2>
            <button
              type="button"
              onClick={() => {
                setInput(EXAMPLE);
                setErrors([]);
                setMessage(null);
              }}
              className="text-xs font-medium text-brand-600 underline hover:text-brand-700"
            >
              예시 채우기
            </button>
          </div>

          {message && <FormMessage tone="error">{message}</FormMessage>}

          <div className="grid gap-4 sm:grid-cols-2">
            {shortField("grade", "4학년")}
            {shortField("semester", "1학기")}
          </div>

          {shortField("subject", "과학")}

          <div className="grid gap-4 sm:grid-cols-2">
            {shortField("unit", "2단원 물질의 성질")}
            {shortField("period", "3/6차시")}
          </div>

          <Field
            label={FIELD_LABELS.achievementStandard}
            htmlFor="achievementStandard"
            hint="2022 개정 교육과정 성취기준을 코드까지 그대로 붙여넣어 주세요."
            required
          >
            <TextArea
              id="achievementStandard"
              rows={3}
              value={input.achievementStandard}
              onChange={(e) => set("achievementStandard")(e.target.value)}
              placeholder="[4과05-01] 여러 가지 물체를 관찰하여…"
              aria-invalid={invalid("achievementStandard")}
              className={ring("achievementStandard")}
            />
          </Field>

          <Field label={FIELD_LABELS.goal} htmlFor="goal" required>
            <TextArea
              id="goal"
              rows={2}
              value={input.goal}
              onChange={(e) => set("goal")(e.target.value)}
              placeholder="물질의 성질에 따라 물체를 분류할 수 있다."
              aria-invalid={invalid("goal")}
              className={ring("goal")}
            />
          </Field>

          <Field
            label={FIELD_LABELS.task}
            htmlFor="task"
            hint="학생이 실제로 만들거나 해내야 하는 산출물·활동입니다."
            required
          >
            <TextArea
              id="task"
              rows={3}
              value={input.task}
              onChange={(e) => set("task")(e.target.value)}
              placeholder="교실 물체를 분류하고 기준을 설명하기"
              aria-invalid={invalid("task")}
              className={ring("task")}
            />
          </Field>

          <Field
            label={FIELD_LABELS.evalCriteriaTop}
            htmlFor="evalCriteriaTop"
            hint="'상' 수준 서술만 적어 주세요. 평가요소와 중·하는 이 문장에서 역산합니다."
            required
          >
            <TextArea
              id="evalCriteriaTop"
              rows={3}
              value={input.evalCriteriaTop}
              onChange={(e) => set("evalCriteriaTop")(e.target.value)}
              placeholder="두 가지 이상 근거를 들어 정확히 분류하고 설명할 수 있다."
              aria-invalid={invalid("evalCriteriaTop")}
              className={ring("evalCriteriaTop")}
            />
          </Field>

          <details className="rounded-lg border border-brand-100 p-3">
            <summary className="cursor-pointer text-sm font-medium text-brand-700">
              선택 입력 (1쪽 개요면에 그대로 들어갑니다)
            </summary>
            <div className="mt-3 space-y-4">
              {optionalField("textbookPages", "42-45쪽", "교과서가 없는 차시는 비워 두세요.")}
              {optionalField("classroom", "4학년 2반")}
              {optionalField("lessonDate", "2026.5.26.(화)")}
              {optionalField(
                "competencies",
                "과학적 탐구능력, 과학적 문제해결력",
                "교과 교육과정 역량 2개. 비우면 (제안)으로 채웁니다.",
              )}
              {optionalField("duration", "40분", "비우면 40분")}
              {optionalField(
                "digitalTools",
                "패들렛, 캔바",
                "차시당 1~3개면 충분합니다. 비우면 차시에 맞는 도구를 제안합니다.",
              )}
            </div>
          </details>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "지도안을 만드는 중…" : "지도안 만들기"}
          </button>

          <p className="text-xs text-ink-500">
            생성은 같은 인터넷 회선(IP) 기준 하루 {dailyLimit}회까지 가능합니다.
            로그인은 필요하지 않습니다.
          </p>
        </form>
      </Card>

      {/* 결과 */}
      <div ref={resultRef} className="min-w-0">
        {!result && !loading && (
          <Card className="border-dashed">
            <p className="text-sm leading-relaxed text-ink-500">
              왼쪽에 필수 {REQUIRED_FIELDS.length}항목을 입력하고{" "}
              <strong>지도안 만들기</strong>를 누르면 수업 나눔 양식 그대로
              1쪽 개요면과 2쪽 전개면이 만들어집니다. 처음이라면{" "}
              <strong>예시 채우기</strong>로 형식을 먼저 확인해 보세요.
            </p>
          </Card>
        )}

        {loading && (
          <Card>
            <p className="text-sm text-ink-500">
              BR(문제 발견·인식) · ID(해결방법 탐색·문제해결) · GE(공유·성찰)
              3단계로 지도안을 작성하고 있습니다. 30초 정도 걸릴 수 있습니다…
            </p>
          </Card>
        )}

        {result && (
          <div className="space-y-4">
            <Alert tone="warning" title="AI 생성 초안입니다">
              반드시 선생님이 검수하고 수정한 뒤 사용해 주세요.
            </Alert>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
              >
                파일로 내려받기 (.md)
              </button>

              {canSave ? (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saveState.status === "saving"}
                  className="rounded-lg border border-brand-200 px-4 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
                >
                  {saveState.status === "saving" ? "저장 중…" : "내 계정에 저장"}
                </button>
              ) : (
                <span className="self-center text-xs text-ink-500">
                  저장은 승인된 교사 계정에서만 가능합니다.
                </span>
              )}
            </div>

            {saveState.status === "saved" && (
              <FormMessage tone="success">
                저장했습니다.{" "}
                <Link
                  href={`/teacher/lesson-plans/${saveState.id}`}
                  className="font-semibold underline"
                >
                  저장된 지도안 보기
                </Link>
              </FormMessage>
            )}
            {saveState.status === "error" && (
              <FormMessage tone="error">{saveState.message}</FormMessage>
            )}

            <Card>
              <Markdown content={result} />
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
