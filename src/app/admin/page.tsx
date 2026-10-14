import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteButton } from "@/components/delete-button";
import { StatusActions } from "@/components/status-action";
import { Alert, Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  AUTHOR_BADGE_TONES,
  AUTHOR_TYPE_LABELS,
  type Teacher,
  type Testimonial,
} from "@/lib/supabase/types";

export const metadata: Metadata = { title: "운영자 화면" };

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/teacher");

  const supabase = await createSupabaseServerClient();

  const [teachersRes, testimonialsRes] = await Promise.all([
    supabase.from("teachers").select("*").order("created_at", { ascending: false }),
    supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false }),
  ]);

  const teachers = (teachersRes.data as Teacher[] | null) ?? [];
  const testimonials = (testimonialsRes.data as Testimonial[] | null) ?? [];

  const pendingTeachers = teachers.filter((t) => t.status === "pending");
  const otherTeachers = teachers.filter((t) => t.status !== "pending");
  const pendingTestimonials = testimonials.filter((t) => t.status === "pending");
  const reviewedTestimonials = testimonials.filter((t) => t.status !== "pending");

  const loadError = teachersRes.error?.message ?? testimonialsRes.error?.message;

  return (
    <>
      <PageHeader
        eyebrow="운영자 전용"
        title="운영자 화면"
        description="교사 가입 승인과 소감 공개 여부를 여기서 처리합니다."
      />

      <Container>
        {loadError && (
          <div className="mb-8">
            <Alert tone="warning" title="데이터를 불러오지 못했습니다">
              {loadError}
            </Alert>
          </div>
        )}

        {/* 콘텐츠 관리 바로가기 */}
        <Section
          title="콘텐츠 관리"
          description="공개 페이지에 실리는 내용을 직접 등록·수정합니다."
        >
          <ul className="space-y-3">
            <li>
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">월별 추진활동</p>
                  <p className="text-sm text-ink-500">
                    달마다 활동 카드를 추가하고 담당자·진행 상태를 관리합니다.
                  </p>
                </div>
                <Link
                  href="/admin/timeline"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  관리하기
                </Link>
              </Card>
            </li>
            <li>
              <Card className="flex flex-wrap items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-medium text-ink-900">탭 메뉴</p>
                  <p className="text-sm text-ink-500">
                    왼쪽 세로 메뉴의 탭 이름·순서를 바꾸고, 탭을 추가하거나 지웁니다.
                  </p>
                </div>
                <Link
                  href="/admin/nav"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
                >
                  관리하기
                </Link>
              </Card>
            </li>
          </ul>
        </Section>

        {/* 가입 승인 (R23) */}
        <Section
          title={`가입 승인 대기 (${pendingTeachers.length}명)`}
          description="승인하면 그 즉시 수업자료·사진 업로드와 지도안 저장을 쓸 수 있습니다."
        >
          {pendingTeachers.length === 0 ? (
            <Alert tone="info">대기 중인 가입 신청이 없습니다.</Alert>
          ) : (
            <ul className="space-y-3">
              {pendingTeachers.map((t) => (
                <li key={t.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-medium text-ink-900">{t.name}</p>
                      <p className="text-sm text-ink-500">
                        {t.division ?? "분과 미지정"} ·{" "}
                        {new Date(t.created_at).toLocaleDateString("ko-KR")} 신청
                      </p>
                    </div>
                    <StatusActions
                      endpoint={`/api/teachers/${t.id}`}
                      actions={[
                        { status: "approved", label: "승인", tone: "approve" },
                        { status: "rejected", label: "거부", tone: "reject" },
                      ]}
                    />
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* 소감 승인 (R13, R17) */}
        <Section
          title={`소감 승인 대기 (${pendingTestimonials.length}건)`}
          description="승인한 소감만 공개 목록에 노출됩니다."
        >
          {pendingTestimonials.length === 0 ? (
            <Alert tone="info">대기 중인 소감이 없습니다.</Alert>
          ) : (
            <ul className="space-y-3">
              {pendingTestimonials.map((t) => (
                <li key={t.id}>
                  <Card>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={AUTHOR_BADGE_TONES[t.author_type]}>
                        {AUTHOR_TYPE_LABELS[t.author_type]}
                      </Badge>
                      <span className="text-sm font-medium text-ink-900">
                        {t.author_name || "익명"}
                      </span>
                      <span className="text-xs text-ink-500">
                        {new Date(t.created_at).toLocaleString("ko-KR")}
                      </span>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                      {t.content}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-100 pt-4">
                      <StatusActions
                        endpoint={`/api/testimonials/${t.id}`}
                        actions={[
                          { status: "approved", label: "공개 승인", tone: "approve" },
                          { status: "rejected", label: "거부", tone: "reject" },
                        ]}
                      />
                      <DeleteButton endpoint={`/api/testimonials/${t.id}`} />
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Section>

        {/* 처리 이력 */}
        <Section title={`교사 명단 (${otherTeachers.length}명)`}>
          {otherTeachers.length === 0 ? (
            <Alert tone="info">아직 승인·거부 처리된 계정이 없습니다.</Alert>
          ) : (
            <ul className="space-y-2">
              {otherTeachers.map((t) => (
                <li key={t.id}>
                  <Card className="flex flex-wrap items-center justify-between gap-3 py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink-900">{t.name}</span>
                      <Badge tone={t.role === "admin" ? "brand" : "muted"}>
                        {t.role === "admin" ? "운영자" : "일반 교사"}
                      </Badge>
                      <Badge
                        tone={t.status === "approved" ? "brand" : "muted"}
                      >
                        {t.status === "approved" ? "승인됨" : "거부됨"}
                      </Badge>
                      <span className="text-sm text-ink-500">
                        {t.division ?? "분과 미지정"}
                      </span>
                    </div>
                    {t.id !== user.userId && (
                      <StatusActions
                        endpoint={`/api/teachers/${t.id}`}
                        actions={
                          t.status === "approved"
                            ? [{ status: "rejected", label: "권한 해제", tone: "reject" }]
                            : [{ status: "approved", label: "승인", tone: "approve" }]
                        }
                      />
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section title={`처리한 소감 (${reviewedTestimonials.length}건)`}>
          {reviewedTestimonials.length === 0 ? (
            <Alert tone="info">아직 처리한 소감이 없습니다.</Alert>
          ) : (
            <ul className="space-y-2">
              {reviewedTestimonials.map((t) => (
                <li key={t.id}>
                  <Card className="py-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={t.status === "approved" ? "brand" : "muted"}>
                        {t.status === "approved" ? "공개 중" : "거부됨"}
                      </Badge>
                      <span className="text-sm font-medium text-ink-900">
                        {t.author_name || "익명"}
                      </span>
                      <span className="text-xs text-ink-500">
                        {new Date(t.created_at).toLocaleDateString("ko-KR")}
                      </span>
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink-700">
                      {t.content}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <StatusActions
                        endpoint={`/api/testimonials/${t.id}`}
                        actions={
                          t.status === "approved"
                            ? [{ status: "rejected", label: "공개 내리기", tone: "reject" }]
                            : [{ status: "approved", label: "공개하기", tone: "approve" }]
                        }
                      />
                      <DeleteButton endpoint={`/api/testimonials/${t.id}`} />
                    </div>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </Container>
    </>
  );
}
