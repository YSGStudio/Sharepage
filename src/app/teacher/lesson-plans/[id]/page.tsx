import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Markdown } from "@/components/markdown";
import { Alert, Badge, Card, Container, PageHeader } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LessonPlan } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "저장한 지도안" };

export default async function SavedLessonPlanPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");

  // RLS 로 본인 것만 조회된다. 남의 지도안은 여기서 404가 된다.
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from("lesson_plans")
    .select("*")
    .eq("id", id)
    .maybeSingle<LessonPlan>();

  if (!data) notFound();

  return (
    <>
      <PageHeader
        eyebrow="교사 전용"
        title={data.goal}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <Badge>{data.grade}</Badge>
            <Badge tone="muted">{data.subject}</Badge>
            <span className="text-sm text-ink-500">
              {new Date(data.created_at).toLocaleString("ko-KR")}
            </span>
          </span>
        }
      />

      <Container>
        <p className="mb-6">
          <Link
            href="/teacher"
            className="text-sm font-medium text-brand-600 hover:text-brand-700"
          >
            ← 내 교사 화면으로
          </Link>
        </p>

        <div className="mb-6">
          <Alert tone="warning" title="AI 생성 초안입니다">
            수업에 사용하기 전에 반드시 검수·수정해 주세요.
          </Alert>
        </div>

        <Card className="mb-6">
          <h2 className="text-base font-bold text-brand-800">입력한 내용</h2>
          <dl className="mt-3 space-y-3">
            {[
              ["성취기준", data.achievement_standard],
              ["도달목표", data.goal],
              ["수행과제", data.task],
              ["평가기준 '상'", data.eval_criteria_top],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs font-semibold text-brand-600">{label}</dt>
                <dd className="mt-0.5 text-sm leading-relaxed text-ink-700">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card>
          <Markdown content={data.generated_content} />
        </Card>
      </Container>
    </>
  );
}
