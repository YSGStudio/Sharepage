import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import { getCurrentUser, isAdmin, isApprovedTeacher } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { LessonPlan } from "@/lib/supabase/types";

export const metadata: Metadata = { title: "내 교사 화면" };

export default async function TeacherPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");

  const approved = isApprovedTeacher(user);
  const admin = isAdmin(user);
  const status = user.teacher?.status ?? "pending";

  // 저장한 지도안 (R11). RLS 로 본인 것만 조회된다.
  let plans: LessonPlan[] = [];
  if (approved) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from("lesson_plans")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    plans = (data as LessonPlan[] | null) ?? [];
  }

  return (
    <>
      <PageHeader
        eyebrow="교사 전용"
        title={`${user.teacher?.name ?? "선생님"} 님`}
        description={
          <span className="flex flex-wrap items-center gap-2">
            <span>{user.email}</span>
            {admin && <Badge tone="brand">운영자</Badge>}
            {!admin && approved && <Badge tone="brand">일반 교사</Badge>}
            {status === "pending" && <Badge tone="accent">승인 대기</Badge>}
            {status === "rejected" && <Badge tone="muted">가입 거부됨</Badge>}
          </span>
        }
      />

      <Container>
        {status === "pending" && (
          <div className="mb-10">
            <Alert tone="warning" title="아직 승인 대기 중입니다">
              운영자가 가입을 승인하면 수업자료·사진 업로드와 지도안 저장 기능을
              쓸 수 있습니다. 그때까지 열람과 지도안 생성·다운로드는 자유롭게
              가능합니다.
            </Alert>
          </div>
        )}

        {status === "rejected" && (
          <div className="mb-10">
            <Alert tone="warning" title="가입이 거부된 계정입니다">
              교사 전용 기능을 쓸 수 없습니다. 운영자에게 문의해 주세요.
            </Alert>
          </div>
        )}

        <Section title="바로가기">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                href: "/materials/upload",
                title: "수업자료 올리기",
                body: "파일과 학년·과목·설명을 함께 등록합니다.",
                needsApproval: true,
              },
              {
                href: "/gallery/upload",
                title: "사진 올리기",
                body: "운영 사진에 캡션과 분류를 붙여 등록합니다.",
                needsApproval: true,
              },
              {
                href: "/lesson-plan",
                title: "지도안 만들기",
                body: "BRIDGE 6단계 지도안 초안을 만들고 저장합니다.",
                needsApproval: false,
              },
              {
                href: "/admin",
                title: "운영자 화면",
                body: "가입 승인, 소감 승인, 자료 삭제를 처리합니다.",
                needsApproval: true,
                adminOnly: true,
              },
            ]
              .filter((item) => !item.adminOnly || admin)
              .map((item) => {
                const disabled = item.needsApproval && !approved;
                return disabled ? (
                  <Card key={item.href} className="opacity-60">
                    <h3 className="text-base font-bold text-ink-500">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-500">
                      {item.body}
                    </p>
                    <p className="mt-3 text-xs font-medium text-accent-700">
                      승인 후 사용 가능
                    </p>
                  </Card>
                ) : (
                  <Link key={item.href} href={item.href} className="group">
                    <Card className="h-full transition-colors group-hover:border-brand-300">
                      <h3 className="text-base font-bold text-brand-800">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">
                        {item.body}
                      </p>
                      <span className="mt-3 inline-block text-sm font-medium text-brand-600">
                        바로가기 →
                      </span>
                    </Card>
                  </Link>
                );
              })}
          </div>
        </Section>

        <Section
          title="내가 저장한 지도안"
          description="저장한 지도안은 본인만 볼 수 있습니다."
        >
          {!approved ? (
            <Alert tone="info">승인 후 지도안을 저장할 수 있습니다.</Alert>
          ) : plans.length === 0 ? (
            <Alert tone="info">
              아직 저장한 지도안이 없습니다.{" "}
              <Link
                href="/lesson-plan"
                className="font-medium text-brand-600 underline"
              >
                지도안 만들기
              </Link>
              에서 만들어 저장해 보세요.
            </Alert>
          ) : (
            <ul className="space-y-3">
              {plans.map((plan) => (
                <li key={plan.id}>
                  <Link href={`/teacher/lesson-plans/${plan.id}`} className="group block">
                    <Card className="transition-colors group-hover:border-brand-300">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge>{plan.grade}</Badge>
                        <Badge tone="muted">{plan.subject}</Badge>
                        <span className="text-xs text-ink-500">
                          {new Date(plan.created_at).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p className="mt-2 font-medium text-ink-900">{plan.goal}</p>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Container>
    </>
  );
}
