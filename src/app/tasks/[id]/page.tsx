import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TaskExecutionDiagram } from "@/components/task-execution-diagram";
import { Card, Container, PageHeader, Section } from "@/components/ui";
import { RESEARCH_TASKS, taskLabel } from "@/content/research";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TaskItemPhoto } from "@/lib/supabase/types";
import { PHOTOS_BUCKET } from "@/lib/upload";

// 운영자가 바꾼 실행 항목 사진과 로그인 상태를 요청마다 읽는다.
export const dynamic = "force-dynamic";

/**
 * 운영자가 바꾼 실행 항목 사진을 읽는다. 0008 마이그레이션 전이거나 조회에 실패하면
 * 빈 값으로 두어 코드의 기본 사진(결과보고서)만 보이게 한다.
 */
async function loadPhotoOverrides(taskId: string): Promise<Record<string, string>> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("task_item_photos")
      .select("*")
      .like("item_key", `${taskId}-%`);
    if (error || !data) return {};

    return Object.fromEntries(
      (data as TaskItemPhoto[]).map((row) => [
        row.item_key,
        supabase.storage.from(PHOTOS_BUCKET).getPublicUrl(row.storage_path).data
          .publicUrl,
      ]),
    );
  } catch {
    return {};
  }
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
  const prev = RESEARCH_TASKS[index - 1];
  const next = RESEARCH_TASKS[index + 1];
  const common = task.kind === "공통과제";

  const [photoOverrides, user] = task.executions
    ? await Promise.all([
        loadPhotoOverrides(task.id),
        getCurrentUser().catch(() => null),
      ])
    : [{}, null];

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

        {task.figures && (
          <Section title="BRIDGE 수업 모델">
            <div className="space-y-6">
              {task.figures.map((figure) => (
                <figure
                  key={figure.src}
                  className="overflow-hidden rounded-lg border border-surface-variant bg-white p-3 sm:p-5"
                >
                  <Image
                    src={figure.src}
                    width={figure.width}
                    height={figure.height}
                    alt={figure.alt}
                    className="mx-auto h-auto w-full max-w-4xl"
                    sizes="(max-width: 1024px) 100vw, 896px"
                  />
                  <figcaption className="mt-3 text-center text-sm text-ink-500">
                    {figure.caption}
                  </figcaption>
                </figure>
              ))}
            </div>
          </Section>
        )}

        {task.executions ? (
          <Section title="실행 내용">
            <TaskExecutionDiagram
              taskId={task.id}
              root={`${taskLabel(task)} 실행 구조`}
              executions={task.executions}
              photoOverrides={photoOverrides}
              editable={isAdmin(user)}
            />
          </Section>
        ) : (
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
