import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Alert, Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import { RESEARCH_TASKS, taskLabel } from "@/content/research";
import { RESULTS_NOTICE, TASK_RESULTS } from "@/content/results";

/** 연구 과제 5개(공통 3 + 선택 2)는 정적 콘텐츠이므로 빌드 시점에 경로를 확정한다. */
export function generateStaticParams() {
  return RESEARCH_TASKS.map((task) => ({ id: task.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const task = RESEARCH_TASKS.find((t) => t.id === id);
  if (!task) return { title: "연구 과제" };

  return {
    title: `${taskLabel(task)} · ${task.title}`,
    description: task.description,
  };
}

export default async function TaskPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const index = RESEARCH_TASKS.findIndex((t) => t.id === id);
  if (index < 0) notFound();

  const task = RESEARCH_TASKS[index];
  const result = TASK_RESULTS.find((r) => r.id === task.id);
  const prev = RESEARCH_TASKS[index - 1];
  const next = RESEARCH_TASKS[index + 1];
  const common = task.kind === "공통과제";

  return (
    <>
      <PageHeader
        eyebrow={`연구 과제 · ${task.kind}`}
        title={`${taskLabel(task)}. ${task.title}`}
        description={task.description}
      />

      <Container>
        <Section title="핵심 목표">
          <Card
            className={`border-l-4 ${
              common ? "border-l-brand-600" : "border-l-accent-500"
            }`}
          >
            <p className="text-base font-semibold leading-relaxed text-ink-900">
              {task.goal}
            </p>
          </Card>
        </Section>

        <Section title="주요 추진 내용">
          <ul className="space-y-3">
            {task.strategies.map((strategy, i) => (
              <li key={strategy}>
                <Card className="flex gap-3 py-4">
                  <span
                    aria-hidden
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                      common ? "bg-brand-600" : "bg-accent-500"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-ink-700">
                    {strategy}
                  </span>
                </Card>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="기대 효과">
          <ul className="grid gap-4 sm:grid-cols-3">
            {task.effects.map((effect) => (
              <li key={effect}>
                <Card className="h-full">
                  <Badge tone={common ? "brand" : "accent"}>기대 효과</Badge>
                  <p className="mt-3 text-sm font-semibold leading-relaxed text-ink-800">
                    {effect}
                  </p>
                </Card>
              </li>
            ))}
          </ul>
        </Section>

        {result ? (
          <Section
            title="중간 성과"
            description={RESULTS_NOTICE}
          >
            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <Badge tone={common ? "brand" : "accent"}>주요 성과</Badge>
                <ul className="mt-3 space-y-2">
                  {result.outcomes.map((outcome) => (
                    <li
                      key={outcome}
                      className="flex gap-2 text-sm leading-relaxed text-ink-700"
                    >
                      <span aria-hidden className="text-brand-400">
                        —
                      </span>
                      <span>{outcome}</span>
                    </li>
                  ))}
                </ul>
              </Card>
              <Card>
                <Badge tone="muted">검증 근거</Badge>
                <ul className="mt-3 space-y-2">
                  {result.evidence.map((evidence) => (
                    <li
                      key={evidence}
                      className="flex gap-2 text-sm leading-relaxed text-ink-700"
                    >
                      <span aria-hidden className="text-brand-400">
                        —
                      </span>
                      <span>{evidence}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </div>
            <div className="mt-5">
              <Alert tone="info" title="운영에서 확인한 점">
                {result.implication}
              </Alert>
            </div>
          </Section>
        ) : (
          <Section title="중간 성과">
            <Alert tone="info">
              아직 정리된 성과가 없습니다. 결과분석 단계를 마친 뒤 갱신됩니다.
            </Alert>
          </Section>
        )}

        <nav
          aria-label="과제 이동"
          className="flex flex-wrap items-center justify-between gap-3 border-t border-surface-variant pt-6"
        >
          {prev ? (
            <Link
              href={`/tasks/${prev.id}`}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              ← {taskLabel(prev)}. {prev.title}
            </Link>
          ) : (
            <Link
              href="/about"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              ← 연구 핵심소개
            </Link>
          )}
          {next ? (
            <Link
              href={`/tasks/${next.id}`}
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              {taskLabel(next)}. {next.title} →
            </Link>
          ) : (
            <Link
              href="/results"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              연구 결과 →
            </Link>
          )}
        </nav>
      </Container>
    </>
  );
}
