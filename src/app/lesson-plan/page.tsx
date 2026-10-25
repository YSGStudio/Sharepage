import type { Metadata } from "next";
import { BraidgeWordmark } from "@/components/braidge-wordmark";
import { getCurrentUser, isApprovedTeacher } from "@/lib/auth";
import { SITE_DAILY_PLAN_LIMIT } from "@/lib/lesson-plan/rate-limit";
import { STANDARDS, toSummary } from "@/lib/lesson-plan/standards";
import { LessonPlanChat } from "./chat";

export const metadata: Metadata = {
  title: "BRAIDGE 지도안 만들기",
  description:
    "성취기준을 고르고 채팅으로 수업을 설명하면 수업 나눔 양식 그대로 1쪽 개요면과 2쪽 전개면을 갖춘 BRIDGE 교수·학습과정안 초안을 만들어 드립니다. 로그인 없이 바로 쓰고 내려받을 수 있습니다.",
};

const STEPS = [
  { title: "기준 선택", body: "학년군과 교과에서 성취기준을 찾아 고르세요." },
  { title: "수업 설명", body: "학년·차시·활동을 평소 말하듯 알려 주세요." },
  { title: "초안 완성", body: "BRIDGE 3단계의 2쪽 지도안을 받아보세요." },
];

export default async function LessonPlanPage() {
  // 로그인한 승인 교사에게만 "저장" 버튼을 노출한다 (R11).
  const user = await getCurrentUser().catch(() => null);
  const canSave = isApprovedTeacher(user);

  return (
    <>
      <section className="relative isolate overflow-hidden border-b border-brand-100 bg-[#f7f9ff]">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 -top-40 -z-10 h-[32rem] w-[32rem] rounded-full bg-brand-100/80 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-56 left-1/4 -z-10 h-96 w-96 rounded-full bg-secondary/10 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(26rem,.85fr)] lg:items-center lg:px-10 lg:py-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white/80 px-3 py-1.5 text-xs font-bold tracking-wide text-brand-700 shadow-sm backdrop-blur">
              <span className="relative flex h-2 w-2" aria-hidden>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-secondary opacity-30" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-secondary" />
              </span>
              AI LESSON DESIGNER
            </p>
            <h1 className="mt-5 text-3xl font-bold tracking-[-0.035em] text-on-surface sm:text-4xl lg:text-[3.25rem] lg:leading-[1.12]">
              수업의 생각을,
              <br />
              <span className="text-brand-600">
                <BraidgeWordmark /> 지도안으로
              </span>
            </h1>
            <p className="mt-5 max-w-2xl text-sm leading-7 text-on-surface-variant sm:text-base">
              성취기준과 수업 아이디어만 알려 주세요. BR·ID·GE 3단계에 맞춘
              교수·학습과정안 초안을 만들고, 바로 내려받을 수 있습니다.
            </p>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-on-surface-variant">
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon /> 로그인 없이 이용
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon /> 2쪽 양식 자동 구성
              </span>
              <span className="inline-flex items-center gap-1.5">
                <CheckIcon /> 문서로 바로 내려받기
              </span>
            </div>
          </div>

          <ol className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/75 p-3 shadow-[0_24px_70px_-35px_rgba(0,63,177,0.42)] backdrop-blur-xl sm:p-4">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="group relative flex gap-4 rounded-2xl px-3 py-3.5 transition-colors hover:bg-brand-50/70 sm:px-4"
              >
                {i < STEPS.length - 1 && (
                  <span
                    aria-hidden
                    className="absolute left-[1.65rem] top-11 h-7 w-px bg-brand-100 sm:left-[1.9rem]"
                  />
                )}
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-600 text-[11px] font-bold tabular-nums text-white shadow-sm shadow-brand-200">
                  {i + 1}
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold text-on-surface">
                    {step.title}
                  </span>
                  <span className="mt-0.5 block text-xs leading-relaxed text-on-surface-variant">
                    {step.body}
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10 lg:py-12">
        <p className="mb-5 flex items-start gap-3 rounded-2xl border border-accent-300/40 bg-accent-100/45 px-4 py-3.5 text-sm leading-relaxed text-accent-700">
          <span
            aria-hidden
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent-500 text-[11px] font-bold text-white"
          >
            i
          </span>
          <span>
            만들어지는 지도안은 <strong>AI가 생성한 초안</strong>입니다. 성취기준과
            평가기준이 맞게 들어갔는지 확인하고 다듬은 뒤 수업에 사용해 주세요.
          </span>
        </p>

        <LessonPlanChat
          standards={STANDARDS.map(toSummary)}
          canSave={canSave}
          dailyLimit={SITE_DAILY_PLAN_LIMIT}
        />
      </div>
    </>
  );
}

function CheckIcon() {
  return (
    <span
      aria-hidden
      className="flex h-4 w-4 items-center justify-center rounded-full bg-secondary/10 text-secondary"
    >
      <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3">
        <path
          d="m4 8 2.4 2.4L12 5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
