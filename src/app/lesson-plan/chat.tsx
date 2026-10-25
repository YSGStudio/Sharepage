"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { FormMessage } from "@/components/form";
import { LessonPlanExport } from "@/components/lesson-plan-export";
import { Markdown } from "@/components/markdown";
import {
  MAX_STANDARDS,
  splitPlanMetadata,
  type ChatMessage,
} from "@/lib/lesson-plan/chat-message";
import type { StandardSummary } from "@/lib/lesson-plan/standards";

const GRADE_BANDS = ["3~4", "5~6"] as const;

const EXAMPLE_MESSAGE =
  "4학년 1학기 과학 2단원 3/6차시(42-45쪽)예요. 교실에서 찾은 물체를 성질에 따라 분류하고 그 기준을 모둠에서 설명하는 수업을 하고 싶어요.";

const panelClass =
  "rounded-3xl border border-surface-variant/90 bg-surface-container-lowest shadow-[0_1px_2px_rgba(25,28,29,0.04),0_18px_48px_-30px_rgba(0,63,177,0.28)]";

type SaveState =
  | { status: "idle" | "saving" }
  | { status: "saved"; id: string }
  | { status: "error"; message: string };

export function LessonPlanChat({
  standards,
  canSave,
  dailyLimit,
}: {
  standards: StandardSummary[];
  canSave: boolean;
  dailyLimit: number;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [selected, setSelected] = useState<StandardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  /** 오늘 홈페이지 전체에서 완성된 지도안 수. 답변을 받기 전에는 모른다. */
  const [planCount, setPlanCount] = useState<number | null>(null);
  const [save, setSave] = useState<{ index: number; state: SaveState } | null>(
    null,
  );

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToEnd = () =>
    requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }),
    );

  function addToDraft(text: string) {
    setDraft((prev) => (prev.trim() ? `${prev.trimEnd()}\n${text}` : text));
    inputRef.current?.focus();
  }

  function toggleStandard(standard: StandardSummary) {
    setSelected((prev) =>
      prev.some((s) => s.code === standard.code)
        ? prev.filter((s) => s.code !== standard.code)
        : prev.length >= MAX_STANDARDS
          ? prev
          : [...prev, standard],
    );
  }

  async function send() {
    const text = draft.trim();
    if (!text || loading) return;

    // 성취기준을 고른 채 첫 메시지를 보내면 무엇을 골랐는지 대화에도 남긴다.
    const prefix =
      messages.length === 0 && selected.length > 0
        ? `성취기준: ${selected.map((s) => `${s.code} ${s.standard}`).join(" / ")}\n`
        : "";
    const next: ChatMessage[] = [...messages, { role: "user", content: prefix + text }];

    setMessages(next);
    setDraft("");
    setError(null);
    setLoading(true);
    scrollToEnd();

    try {
      const res = await fetch("/api/lesson-plan/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next,
          standardCodes: selected.map((s) => s.code),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        // 보내지 못한 메시지는 입력창으로 돌려놓아 다시 보낼 수 있게 한다.
        setMessages(messages);
        setDraft(text);
        setError(json.error ?? "답변을 받지 못했습니다.");
        return;
      }
      setMessages([...next, { role: "assistant", content: json.content }]);
      if (typeof json.usage?.count === "number") setPlanCount(json.usage.count);
      scrollToEnd();
    } catch {
      setMessages(messages);
      setDraft(text);
      setError("네트워크 오류입니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(index: number, content: string, input: unknown) {
    setSave({ index, state: { status: "saving" } });
    try {
      const res = await fetch("/api/lesson-plan/save", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ content, input }),
      });
      const json = await res.json();
      setSave({
        index,
        state: res.ok
          ? { status: "saved", id: json.id }
          : { status: "error", message: json.error ?? "저장 실패" },
      });
    } catch {
      setSave({ index, state: { status: "error", message: "네트워크 오류입니다." } });
    }
  }

  function reset() {
    setMessages([]);
    setDraft("");
    setError(null);
    setSave(null);
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:items-start">
      <StandardPicker
        standards={standards}
        selected={selected}
        onToggle={toggleStandard}
        onUseLevelHigh={(s) =>
          addToDraft(`평가기준 '상'은 ${s.code}의 성취수준 '상'을 그대로 써 주세요.`)
        }
      />

      <section className={`${panelClass} flex min-w-0 flex-col overflow-hidden ring-1 ring-white`}>
        <header className="flex items-center justify-between gap-3 border-b border-surface-variant bg-white/90 px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <AiAvatar />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-on-surface">AI 지도안 도우미</h2>
                <span className="rounded-full bg-secondary/10 px-2 py-0.5 text-[10px] font-bold text-secondary">
                  온라인
                </span>
              </div>
              <p className="mt-0.5 text-xs text-on-surface-variant">
                BRIDGE 3단계 · 수업 나눔 2쪽 양식
              </p>
            </div>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={reset}
              disabled={loading}
              className="rounded-full border border-surface-variant px-3 py-1.5 text-xs font-medium text-on-surface-variant transition-colors hover:border-brand-200 hover:text-brand-700 disabled:opacity-60"
            >
              새 대화
            </button>
          )}
        </header>

        <div className="min-h-[24rem] space-y-5 overflow-y-auto bg-[linear-gradient(180deg,#f8faff_0%,#f4f5f7_100%)] px-4 py-6 sm:px-6 lg:max-h-[calc(100vh-12rem)] lg:min-h-[28rem]">
          <AssistantRow>
            <div className="max-w-2xl rounded-2xl rounded-tl-md bg-white px-4 py-3.5 text-sm leading-relaxed text-ink-700 shadow-sm ring-1 ring-surface-variant">
              <p>
                성취기준을 고르고, 어떤 수업인지 한두 줄로 적어 주세요. 모자란
                내용은 한 번에 여쭤본 뒤 <strong>1쪽 개요면과 2쪽 전개면</strong>을
                써 드립니다.
              </p>
              {messages.length === 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setDraft(EXAMPLE_MESSAGE);
                    inputRef.current?.focus();
                  }}
                  className="mt-3 inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
                >
                  예시 문장 넣기 <span aria-hidden>→</span>
                </button>
              )}
            </div>
          </AssistantRow>

          {messages.map((message, index) => {
            if (message.role === "user") {
              return (
                <div key={index} className="flex justify-end">
                  <p className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-md bg-brand-600 px-4 py-3 text-sm leading-relaxed text-white shadow-sm">
                    {message.content}
                  </p>
                </div>
              );
            }

            const { body, input } = splitPlanMetadata(message.content);
            const saveState = save?.index === index ? save.state : null;

            if (!input) {
              return (
                <AssistantRow key={index}>
                  <div className="rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-surface-variant">
                    <Markdown content={body} />
                  </div>
                </AssistantRow>
              );
            }

            // 완성된 지도안: 문서처럼 보이게 따로 감싸고 내려받기·저장을 위에 둔다.
            return (
              <AssistantRow key={index}>
                <article className="overflow-hidden rounded-2xl rounded-tl-md bg-white shadow-sm ring-1 ring-brand-100">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-brand-100 bg-brand-50/70 px-4 py-3">
                    <p className="text-xs font-semibold text-brand-800">
                      지도안 초안 · {input.grade} {input.semester} {input.subject}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <LessonPlanExport
                        content={body}
                        baseName={`BRAIDGE_지도안_${input.grade ?? ""}_${input.subject ?? ""}`}
                      />
                      {canSave && (
                        <button
                          type="button"
                          onClick={() => handleSave(index, body, input)}
                          disabled={
                            saveState?.status === "saving" || saveState?.status === "saved"
                          }
                          className="rounded-lg border border-brand-200 bg-white px-3 py-2 text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-60"
                        >
                          {saveState?.status === "saving"
                            ? "저장 중…"
                            : saveState?.status === "saved"
                              ? "저장됨"
                              : "내 계정에 저장"}
                        </button>
                      )}
                    </div>
                  </div>
                  {(saveState?.status === "saved" || saveState?.status === "error") && (
                    <div className="px-4 pt-3">
                      {saveState.status === "saved" ? (
                        <FormMessage tone="success">
                          저장했습니다.{" "}
                          <Link
                            href={`/teacher/lesson-plans/${saveState.id}`}
                            className="font-semibold underline"
                          >
                            저장된 지도안 보기
                          </Link>
                        </FormMessage>
                      ) : (
                        <FormMessage tone="error">{saveState.message}</FormMessage>
                      )}
                    </div>
                  )}
                  <div className="px-4 py-2 sm:px-6">
                    <Markdown content={body} />
                  </div>
                  {!canSave && (
                    <p className="border-t border-surface-variant px-4 py-2.5 text-xs text-on-surface-variant">
                      계정에 저장하려면 승인된 교사 계정으로 로그인해 주세요.
                    </p>
                  )}
                </article>
              </AssistantRow>
            );
          })}

          {loading && (
            <AssistantRow>
              <div className="inline-flex items-center gap-3 rounded-2xl rounded-tl-md bg-white px-4 py-3 shadow-sm ring-1 ring-surface-variant">
                <span className="flex gap-1" aria-hidden>
                  {[0, 150, 300].map((delay) => (
                    <span
                      key={delay}
                      className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-400"
                      style={{ animationDelay: `${delay}ms` }}
                    />
                  ))}
                </span>
                <span className="text-xs text-on-surface-variant">
                  작성 중입니다 · 지도안 전체는 30초 정도 걸려요
                </span>
              </div>
            </AssistantRow>
          )}
          <form
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
          className="rounded-2xl border border-surface-variant bg-white p-3 shadow-[0_10px_30px_-20px_rgba(0,63,177,0.35)] sm:p-4"
        >
          {error && (
            <div className="mb-3">
              <FormMessage tone="error">{error}</FormMessage>
            </div>
          )}

          {selected.length > 0 && messages.length === 0 && (
            <div className="mb-2 flex flex-wrap gap-1.5">
              {selected.map((s) => (
                <span
                  key={s.code}
                  className="inline-flex items-center gap-1 rounded-full bg-brand-50 py-1 pl-2.5 pr-1.5 text-xs font-medium text-brand-700"
                >
                  {s.code}
                  <button
                    type="button"
                    onClick={() => toggleStandard(s)}
                    aria-label={`${s.code} 빼기`}
                    className="rounded-full px-1 text-brand-400 hover:text-brand-800"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-2xl border border-brand-200 bg-white p-2 shadow-sm transition-shadow focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
            <textarea
              ref={inputRef}
              rows={2}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                // 한글 조합 중 Enter 는 글자 확정이므로 보내지 않는다.
                if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="예) 6학년 2학기 사회 1단원 5차시, 모둠별로 인권 캠페인 포스터 만들기"
              aria-label="메시지"
              className="max-h-40 min-h-[2.75rem] flex-1 resize-none bg-transparent px-2 py-1.5 text-sm text-ink-900 placeholder:text-ink-500/60"
              // 전역 :focus-visible 외곽선은 레이어 밖이라 유틸리티로 못 끈다. 포커스는 바깥 상자의 링이 보여 준다.
              style={{ outline: "none" }}
            />
            <button
              type="submit"
              disabled={loading || !draft.trim()}
              aria-label="보내기"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm transition-all hover:-translate-y-0.5 hover:bg-brand-700 disabled:cursor-not-allowed disabled:bg-brand-200 disabled:shadow-none"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden>
                <path d="M3.1 2.3a.75.75 0 0 1 .8-.1l13.5 7.1a.75.75 0 0 1 0 1.4L3.9 17.8a.75.75 0 0 1-1-.9L4.7 11H10a.75.75 0 0 0 0-1.5H4.7L2.9 3.1a.75.75 0 0 1 .2-.8Z" />
              </svg>
            </button>
          </div>
          <p className="mt-2 text-[11px] text-on-surface-variant">
            Enter 보내기 · Shift+Enter 줄바꿈 · 홈페이지 전체 하루 지도안 {dailyLimit}개까지
            {planCount !== null &&
              ` (오늘 ${Math.max(dailyLimit - planCount, 0)}개 남음)`}
          </p>
          </form>
          <div ref={bottomRef} />
        </div>
      </section>
    </div>
  );
}

function AiAvatar({ size = "md" }: { size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-500 to-secondary font-bold text-white shadow-sm ${
        size === "sm" ? "h-7 w-7 text-[10px]" : "h-9 w-9 text-xs"
      }`}
    >
      AI
    </span>
  );
}

function AssistantRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2.5">
      <AiAvatar size="sm" />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function StandardPicker({
  standards,
  selected,
  onToggle,
  onUseLevelHigh,
}: {
  standards: StandardSummary[];
  selected: StandardSummary[];
  onToggle: (standard: StandardSummary) => void;
  onUseLevelHigh: (standard: StandardSummary) => void;
}) {
  const [band, setBand] = useState<(typeof GRADE_BANDS)[number]>("3~4");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");

  const subjects = useMemo(
    () => [...new Set(standards.filter((s) => s.gradeBand === band).map((s) => s.subject))],
    [standards, band],
  );

  const filtered = useMemo(() => {
    const q = query.trim();
    return standards.filter(
      (s) =>
        s.gradeBand === band &&
        (!subject || s.subject === subject) &&
        (!q || s.code.includes(q) || s.standard.includes(q) || s.domain.includes(q)),
    );
  }, [standards, band, subject, query]);

  const isSelected = (code: string) => selected.some((s) => s.code === code);

  const chip = (active: boolean) =>
    `rounded-full px-3 py-1 text-xs font-medium transition-colors ${
      active
        ? "bg-brand-600 text-white"
        : "bg-surface-container-low text-on-surface-variant hover:bg-brand-50 hover:text-brand-700"
    }`;

  return (
    <aside className={`${panelClass} overflow-hidden lg:sticky lg:top-24`}>
      <div className="border-b border-surface-variant bg-gradient-to-br from-brand-700 to-brand-600 px-5 py-5 text-white">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold tracking-[0.16em] text-brand-100">STEP 01</p>
            <h2 className="mt-1 text-base font-bold">성취기준 고르기</h2>
          </div>
          <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold tabular-nums text-white ring-1 ring-white/20">
            {selected.length}/{MAX_STANDARDS} 선택
          </span>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-brand-100">
          수업과 연결할 기준을 최대 {MAX_STANDARDS}개 선택하세요.
        </p>
      </div>

      <div className="space-y-4 p-5">
        <div
          className="grid grid-cols-2 gap-1 rounded-lg bg-surface-container-low p-1"
          role="tablist"
          aria-label="학년군"
        >
        {GRADE_BANDS.map((b) => (
          <button
            key={b}
            type="button"
            role="tab"
            aria-selected={band === b}
            onClick={() => {
              setBand(b);
              setSubject("");
            }}
            className={`rounded-md py-1.5 text-sm font-medium transition-all ${
              band === b
                ? "bg-white text-brand-700 shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {b}학년
          </button>
        ))}
        </div>

        <div className="flex flex-wrap gap-1.5" aria-label="교과">
        <button type="button" onClick={() => setSubject("")} className={chip(!subject)}>
          전체
        </button>
        {subjects.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSubject(s)}
            aria-pressed={subject === s}
            className={chip(subject === s)}
          >
            {s}
          </button>
        ))}
        </div>

        <label className="relative block">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
        >
          <path
            fillRule="evenodd"
            d="M9 3.5a5.5 5.5 0 1 0 3.4 9.8l3.2 3.2a.75.75 0 1 0 1.1-1.1l-3.2-3.2A5.5 5.5 0 0 0 9 3.5ZM5 9a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z"
            clipRule="evenodd"
          />
        </svg>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="코드·낱말 검색 (예: 분수, 4국03)"
          aria-label="성취기준 검색"
          className="w-full rounded-lg border border-surface-variant bg-white py-2 pl-9 pr-3 text-sm text-ink-900 placeholder:text-ink-500/60 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        </label>

        <ul className="-mx-2 max-h-72 space-y-1 overflow-y-auto px-2 lg:max-h-[calc(100vh-32rem)] lg:min-h-48">
        {filtered.map((s) => {
          const active = isSelected(s.code);
          return (
            <li key={s.code}>
              <button
                type="button"
                onClick={() => onToggle(s)}
                aria-pressed={active}
                className={`flex w-full gap-2.5 rounded-xl px-3 py-2.5 text-left text-xs leading-relaxed transition-all ${
                  active ? "bg-brand-50 shadow-sm ring-1 ring-brand-200" : "hover:bg-surface-container-low"
                }`}
              >
                <span
                  aria-hidden
                  className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] ${
                    active
                      ? "border-brand-600 bg-brand-600 text-white"
                      : "border-outline-variant bg-white"
                  }`}
                >
                  {active && "✓"}
                </span>
                <span className="min-w-0">
                  <span className="font-semibold text-brand-700">{s.code}</span>{" "}
                  <span className="text-ink-700">{s.standard}</span>
                </span>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="px-2.5 py-6 text-center text-xs text-on-surface-variant">
            찾는 성취기준이 없습니다.
          </li>
        )}
        </ul>

        {selected.length > 0 && (
        <div className="space-y-2 border-t border-surface-variant pt-4">
          <p className="text-xs font-semibold text-on-surface">
            고른 성취기준{" "}
            <span className="font-normal text-on-surface-variant">
              {selected.length}/{MAX_STANDARDS}
            </span>
          </p>
          {selected.map((s) => (
            <div
              key={s.code}
              className="rounded-xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-3 text-xs leading-relaxed"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="text-ink-700">
                  <span className="font-semibold text-brand-700">{s.code}</span> {s.standard}
                </p>
                <button
                  type="button"
                  onClick={() => onToggle(s)}
                  aria-label={`${s.code} 빼기`}
                  className="shrink-0 rounded-full px-1 text-on-surface-variant hover:text-on-surface"
                >
                  ✕
                </button>
              </div>
              {s.levelHigh && (
                <div className="mt-2 rounded-lg bg-white/80 p-2 ring-1 ring-brand-100">
                  <p className="text-on-surface-variant">
                    <span className="mr-1 rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-bold text-secondary">
                      성취수준 상
                    </span>
                    {s.levelHigh}
                  </p>
                  <button
                    type="button"
                    onClick={() => onUseLevelHigh(s)}
                    className="mt-1.5 font-medium text-brand-600 hover:text-brand-800"
                  >
                    이 문장을 평가기준 &apos;상&apos;으로 쓰기 →
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        )}
      </div>
    </aside>
  );
}
