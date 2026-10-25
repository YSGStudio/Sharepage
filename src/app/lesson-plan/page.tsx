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
  { title: "성취기준 고르기", body: "3~6학년 성취기준을 교과·낱말로 찾아 고릅니다." },
  { title: "수업 한두 줄 적기", body: "학년·차시와 하고 싶은 활동이면 충분합니다." },
  { title: "초안 받고 다듬기", body: "모자란 것만 묻고 1·2쪽 지도안을 써 드립니다." },
];

export default async function LessonPlanPage() {
  // 로그인한 승인 교사에게만 "저장" 버튼을 노출한다 (R11).
  const user = await getCurrentUser().catch(() => null);
  const canSave = isApprovedTeacher(user);

  return (
    <>
      <section className="relative overflow-hidden border-b border-surface-variant bg-surface-container-lowest">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full bg-brand-100/70 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-40 left-1/4 h-72 w-72 rounded-full bg-secondary/10 blur-3xl"
        />

        <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-10">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white/80 px-3 py-1 text-xs font-semibold text-brand-700">
            <span className="h-1.5 w-1.5 rounded-full bg-secondary" aria-hidden />
            AI 지도안 도우미
          </p>
          <h1 className="mt-4 text-3xl font-bold tracking-[-0.02em] text-on-surface sm:text-4xl lg:text-5xl lg:leading-[1.15]">
            <BraidgeWordmark /> 지도안 만들기
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-on-surface-variant sm:text-base">
            성취기준을 고르고 어떤 수업인지 채팅으로 적으면, BR(문제 발견·인식) ·
            ID(해결방법 탐색·문제해결) · GE(공유·성찰) 3단계 교수·학습과정안
            초안을 써 드립니다. 로그인 없이 만들고 내려받을 수 있습니다.
          </p>

          <ol className="mt-8 grid gap-3 sm:grid-cols-3">
            {STEPS.map((step, i) => (
              <li
                key={step.title}
                className="rounded-xl border border-surface-variant bg-white/80 p-4 backdrop-blur"
              >
                <p className="text-xs font-bold tabular-nums text-brand-500">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <p className="mt-1 text-sm font-semibold text-on-surface">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-10">
        <p className="mb-6 flex items-start gap-2 rounded-lg border border-accent-300/60 bg-accent-100/60 px-4 py-3 text-sm leading-relaxed text-accent-700">
          <span aria-hidden className="mt-0.5 font-bold">!</span>
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
