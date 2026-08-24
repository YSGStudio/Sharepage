import type { Metadata } from "next";
import Link from "next/link";
import { BridgeIntroduction } from "@/components/bridge-introduction";
import { Card, Container, PageHeader, Section } from "@/components/ui";
import {
  RESEARCH_OVERVIEW,
  RESEARCH_PHASES,
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
    title: "BRIDGE 모델 개발·적용",
    summary: "6단계 수업 모델을 만들고 전 학년 교과 수업에 적용합니다.",
    keywords: ["6단계 표준안", "학년군별 적용", "디지털 도구 지침"],
  },
  "common-2": {
    title: "학생 주도 수업문화",
    summary: "학생이 선택하고 협력하며 배움에 책임지는 수업 문화를 만듭니다.",
    keywords: ["학생 선택권", "자기·상호평가", "학습 나눔"],
  },
  "common-3": {
    title: "교원 성장·성과 확산",
    summary: "교사의 수업 전문성을 높이고 연구 성과를 학교 밖으로 확산합니다.",
    keywords: ["교내 연수", "수업 나눔", "성과 아카이브"],
  },
  "option-1": {
    title: "맞춤형 기초학력 지원",
    summary: "진단 결과에 따라 학생별로 필요한 보충 학습을 제공합니다.",
    keywords: ["학습 진단", "개별 맞춤 과제", "협력 지도"],
  },
  "option-2": {
    title: "생태전환교육 연계",
    summary: "지역의 생태 문제를 탐구하고 학생 주도의 실천으로 연결합니다.",
    keywords: ["생태 프로젝트", "자료 시각화", "실천 캠페인"],
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
