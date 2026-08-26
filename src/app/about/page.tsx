import type { Metadata } from "next";
import Link from "next/link";
import { BridgeIntroduction } from "@/components/bridge-introduction";
import { Card, Container, PageHeader, Section } from "@/components/ui";
import {
  RESEARCH_GOAL,
  RESEARCH_OVERVIEW,
  RESEARCH_PHASES,
  RESEARCH_PURPOSES,
  RESEARCH_TASKS,
  taskLabel,
} from "@/content/research";

export const metadata: Metadata = {
  title: "연구 핵심소개",
  description:
    "서울언남초등학교 연구학교의 연구 영역, 연구 과제, 연구 기간과 절차를 소개합니다.",
};

const TASK_SUMMARIES = {
  "common-1": {
    title: "교수·학습·평가 일체형 수업모델",
    summary:
      "AI·디지털 기술을 활용한 교수·학습·평가 일체형 수업 체제를 구축하고 BRIDGE 모델을 검증합니다.",
    keywords: ["BRIDGE 모델 개발", "과정 중심 평가 혁신", "학년·교과 확장"],
  },
  "common-2": {
    title: "학생 주도 디지털 역량·리터러시",
    summary:
      "학생의 디지털 활용 능력과 책임 있는 디지털 시민성을 함께 기릅니다.",
    keywords: ["디지털 또래 지원단", "AI·디지털 윤리", "디지털 포트폴리오"],
  },
  "common-3": {
    title: "오케스트레이션 역량·연구 생태계",
    summary:
      "교사의 AI·디지털 수업 전문성을 높이고 협력적 연구 문화를 만듭니다.",
    keywords: ["맞춤형 교원 연수", "수업 나눔 확산", "업무 경감 체제"],
  },
  "option-1": {
    title: "기초학력 지원·맞춤형 학습 보장",
    summary:
      "AI 코스웨어로 학생 수준을 진단하고 개별 학습 경로와 보충 학습을 제공합니다.",
    keywords: ["AI 코스웨어 진단", "보충 수업", "학부모 소통"],
  },
  "option-2": {
    title: "생태전환교육 수업 모델 적용",
    summary:
      "BRIDGE 모델을 생태전환교육에 적용해 탐구를 실천으로 잇습니다.",
    keywords: ["생태전환 탐구 수업", "생태 실천 활동", "수업 사례 확산"],
  },
} as const;

const COMMON_TASK_THEMES = [
  {
    card: "border-blue-200 bg-blue-50/60",
    number: "bg-blue-600 text-white shadow-blue-200",
    label: "text-blue-700",
    chip: "bg-white text-blue-800 ring-blue-200",
    link: "text-blue-700 hover:bg-blue-100",
  },
  {
    card: "border-emerald-200 bg-emerald-50/60",
    number: "bg-emerald-600 text-white shadow-emerald-200",
    label: "text-emerald-700",
    chip: "bg-white text-emerald-800 ring-emerald-200",
    link: "text-emerald-700 hover:bg-emerald-100",
  },
  {
    card: "border-violet-200 bg-violet-50/60",
    number: "bg-violet-600 text-white shadow-violet-200",
    label: "text-violet-700",
    chip: "bg-white text-violet-800 ring-violet-200",
    link: "text-violet-700 hover:bg-violet-100",
  },
] as const;

const OPTION_TASK_THEMES = [
  {
    card: "border-amber-200 bg-amber-50/70",
    number: "bg-amber-500 text-white shadow-amber-200",
    label: "text-amber-800",
    chip: "bg-white text-amber-900 ring-amber-200",
    link: "text-amber-900 hover:bg-amber-100",
  },
  {
    card: "border-rose-200 bg-rose-50/70",
    number: "bg-rose-600 text-white shadow-rose-200",
    label: "text-rose-700",
    chip: "bg-white text-rose-800 ring-rose-200",
    link: "text-rose-700 hover:bg-rose-100",
  },
] as const;

export default function AboutPage() {
  const commonTasks = RESEARCH_TASKS.filter((t) => t.kind === "공통과제");
  const optionTasks = RESEARCH_TASKS.filter((t) => t.kind === "선택과제");

  return (
    <>
      <PageHeader
        eyebrow="연구 소개"
        title="연구 핵심소개"
        description={RESEARCH_OVERVIEW.summary}
      />

      <Container>
        <BridgeIntroduction />

        <Section title="연구 개요">
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              ["학교", RESEARCH_OVERVIEW.school],
              ["연구 영역", RESEARCH_OVERVIEW.area],
              ["연구 기간", RESEARCH_OVERVIEW.period],
              ["연구 대상", RESEARCH_OVERVIEW.target],
              ["교수·학습 모델", RESEARCH_OVERVIEW.model],
            ].map(([label, value]) => (
              <Card key={label}>
                <dt className="text-sm font-medium text-brand-600">{label}</dt>
                <dd className="mt-1 text-base font-semibold text-ink-900">
                  {value}
                </dd>
              </Card>
            ))}
            <Card className="sm:col-span-2">
              <dt className="text-sm font-medium text-brand-600">연구 과제</dt>
              <dd className="mt-1 text-base font-semibold leading-relaxed text-ink-900">
                {RESEARCH_OVERVIEW.subject}
              </dd>
            </Card>
          </dl>
        </Section>

        <Section
          title="연구의 목적"
          description="2022 개정 교육과정의 방향성을 반영해 다음 세 가지를 목적으로 연구를 운영합니다."
        >
          <ol className="grid gap-4 lg:grid-cols-3">
            {RESEARCH_PURPOSES.map((purpose, index) => (
              <li key={purpose}>
                <Card className="h-full">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
                    {index + 1}
                  </span>
                  <p className="mt-3 text-sm leading-7 text-ink-700">{purpose}</p>
                </Card>
              </li>
            ))}
          </ol>
          <div className="mt-5 rounded-2xl border border-brand-100 bg-brand-50/60 p-5">
            <p className="text-xs font-black tracking-[0.16em] text-brand-700">
              종합 목표
            </p>
            <p className="mt-2 text-sm leading-7 text-ink-800">{RESEARCH_GOAL}</p>
          </div>
        </Section>

        <Section
          title="연구과제 한눈에 보기"
          description="학교 전체가 함께 추진하는 공통과제 3개와 학교 특성을 반영한 선택과제 2개로 구성됩니다."
        >
          <div className="mb-8 grid overflow-hidden rounded-2xl border border-brand-100 bg-white sm:grid-cols-2">
            <div className="flex items-center gap-4 border-b border-brand-100 p-5 sm:border-b-0 sm:border-r">
              <span className="text-3xl font-black text-brand-600">03</span>
              <div>
                <p className="font-bold text-on-surface">공통과제</p>
                <p className="mt-0.5 text-sm text-on-surface-variant">모든 학년이 함께 실천</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-5">
              <span className="text-3xl font-black text-amber-600">02</span>
              <div>
                <p className="font-bold text-on-surface">선택과제</p>
                <p className="mt-0.5 text-sm text-on-surface-variant">학교와 학생의 필요를 반영</p>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[0.16em] text-brand-600">COMMON TASKS</p>
                <h3 className="mt-1 text-xl font-bold text-on-surface">공통과제</h3>
              </div>
              <p className="hidden text-sm text-on-surface-variant sm:block">BRIDGE 수업을 만들고, 실천하고, 나눕니다.</p>
            </div>

            <ol className="grid gap-5 lg:grid-cols-3">
              {commonTasks.map((task, index) => {
                const summary = TASK_SUMMARIES[task.id as keyof typeof TASK_SUMMARIES];
                const theme = COMMON_TASK_THEMES[index];
                return (
                  <li key={task.id} className={`flex min-w-0 flex-col rounded-2xl border p-5 shadow-sm ${theme.card}`}>
                    <div className="flex items-start justify-between gap-3">
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl text-base font-black shadow-lg ${theme.number}`}>0{index + 1}</span>
                      <span className={`text-xs font-bold ${theme.label}`}>공통과제</span>
                    </div>
                    <h4 className="mt-5 text-xl font-black leading-snug text-on-surface">{summary.title}</h4>
                    <p className="mt-2 text-sm leading-7 text-ink-700">{summary.summary}</p>
                    <ul aria-label="핵심 내용" className="mt-5 flex flex-wrap gap-2">
                      {summary.keywords.map((keyword) => (
                        <li key={keyword} className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${theme.chip}`}>{keyword}</li>
                      ))}
                    </ul>
                    <Link href={`/tasks/${task.id}`} className={`mt-6 inline-flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${theme.link}`}>
                      <span>{taskLabel(task)} 자세히 보기</span><span aria-hidden>→</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="mt-10 border-t border-surface-variant pt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-black tracking-[0.16em] text-amber-700">OPTION TASKS</p>
                <h3 className="mt-1 text-xl font-bold text-on-surface">선택과제</h3>
              </div>
              <p className="hidden text-sm text-on-surface-variant sm:block">학생에게 꼭 필요한 두 영역을 깊이 지원합니다.</p>
            </div>

            <ol className="grid gap-5 lg:grid-cols-2">
              {optionTasks.map((task, index) => {
                const summary = TASK_SUMMARIES[task.id as keyof typeof TASK_SUMMARIES];
                const theme = OPTION_TASK_THEMES[index];
                return (
                  <li key={task.id} className={`grid min-w-0 gap-5 rounded-2xl border p-5 shadow-sm sm:grid-cols-[auto_minmax(0,1fr)] ${theme.card}`}>
                    <span className={`flex h-12 w-12 items-center justify-center rounded-xl text-lg font-black shadow-lg ${theme.number}`}>0{index + 1}</span>
                    <div className="min-w-0">
                      <p className={`text-xs font-bold ${theme.label}`}>선택과제 {index + 1}</p>
                      <h4 className="mt-1 text-xl font-black leading-snug text-on-surface">{summary.title}</h4>
                      <p className="mt-2 text-sm leading-7 text-ink-700">{summary.summary}</p>
                      <ul aria-label="핵심 내용" className="mt-4 flex flex-wrap gap-2">
                        {summary.keywords.map((keyword) => (
                          <li key={keyword} className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${theme.chip}`}>{keyword}</li>
                        ))}
                      </ul>
                      <Link href={`/tasks/${task.id}`} className={`mt-5 inline-flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-bold transition-colors ${theme.link}`}>
                        <span>{taskLabel(task)} 자세히 보기</span><span aria-hidden>→</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </Section>

        <Section
          title="연구 절차"
          description="1년의 연구를 네 단계로 나누어 운영합니다."
        >
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {RESEARCH_PHASES.map((phase) => (
              <li key={phase.order}>
                <Card className="h-full">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                      {phase.order}
                    </span>
                    <span className="text-base font-bold text-brand-800">
                      {phase.name}
                    </span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-brand-500">
                    {phase.period}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-ink-700">
                    {phase.focus}
                  </p>
                </Card>
              </li>
            ))}
          </ol>
        </Section>
      </Container>
    </>
  );
}
