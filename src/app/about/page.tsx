import type { Metadata } from "next";
import { Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import {
  RESEARCH_OVERVIEW,
  RESEARCH_PHASES,
  RESEARCH_TASKS,
} from "@/content/research";

export const metadata: Metadata = {
  title: "연구 핵심소개",
  description:
    "서울언남초등학교 연구학교의 연구 영역, 연구 과제, 연구 기간과 절차를 소개합니다.",
};

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
          title="공통과제"
          description="학교 전체가 함께 수행하는 세 가지 과제입니다."
        >
          <div className="grid gap-5 lg:grid-cols-3">
            {commonTasks.map((task, i) => (
              <Card key={task.id} className="flex flex-col">
                <Badge>공통과제 {i + 1}</Badge>
                <h3 className="mt-3 text-lg font-bold text-brand-800">
                  {task.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {task.description}
                </p>
                <ul className="mt-4 space-y-2 border-t border-brand-100 pt-4">
                  {task.strategies.map((s) => (
                    <li
                      key={s}
                      className="flex gap-2 text-sm leading-relaxed text-ink-500"
                    >
                      <span aria-hidden className="text-brand-400">
                        —
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </Section>

        <Section
          title="선택과제"
          description="학교 여건과 학생 실태를 고려해 선택한 두 가지 과제입니다."
        >
          <div className="grid gap-5 lg:grid-cols-2">
            {optionTasks.map((task, i) => (
              <Card key={task.id} className="flex flex-col">
                <Badge tone="accent">선택과제 {i + 1}</Badge>
                <h3 className="mt-3 text-lg font-bold text-brand-800">
                  {task.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-700">
                  {task.description}
                </p>
                <ul className="mt-4 space-y-2 border-t border-brand-100 pt-4">
                  {task.strategies.map((s) => (
                    <li
                      key={s}
                      className="flex gap-2 text-sm leading-relaxed text-ink-500"
                    >
                      <span aria-hidden className="text-accent-500">
                        —
                      </span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
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
