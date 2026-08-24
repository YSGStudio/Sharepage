import type { Metadata } from "next";
import { Alert, Badge, Card, Container, PageHeader, Section } from "@/components/ui";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Testimonial } from "@/lib/supabase/types";
import { TestimonialForm } from "./testimonial-form";

export const metadata: Metadata = {
  title: "학부모·학생 소감",
  description:
    "연구학교 수업을 겪은 학생과 학부모의 이야기입니다. 소감을 남겨 주세요.",
};

export const dynamic = "force-dynamic";

export default async function TestimonialsPage() {
  let approved: Testimonial[] = [];
  let loadError: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    // RLS 로 status='approved' 행만 공개된다 (R13, R15).
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("status", "approved")
      .order("created_at", { ascending: false });

    if (error) loadError = error.message;
    approved = (data as Testimonial[] | null) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  return (
    <>
      <PageHeader
        eyebrow="자료 나눔"
        title="학부모·학생 소감"
        description="연구학교 수업을 겪으며 느낀 점을 나눠 주세요. 로그인 없이 남길 수 있습니다."
      />

      <Container>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <Section title={`공개된 소감 (${approved.length}건)`}>
            {loadError && (
              <div className="mb-6">
                <Alert tone="warning" title="소감을 불러오지 못했습니다">
                  데이터베이스 준비가 끝나지 않았을 수 있습니다. ({loadError})
                </Alert>
              </div>
            )}

            {approved.length === 0 && !loadError ? (
              <Alert tone="info">
                아직 공개된 소감이 없습니다. 첫 소감을 남겨 주세요.
              </Alert>
            ) : (
              <ul className="space-y-4">
                {approved.map((t) => (
                  <li key={t.id}>
                    <Card>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge tone={t.author_type === "student" ? "brand" : "accent"}>
                          {t.author_type === "student" ? "학생" : "학부모"}
                        </Badge>
                        <span className="text-sm font-medium text-ink-900">
                          {t.author_name || "익명"}
                        </span>
                        <span className="text-xs text-ink-500">
                          {new Date(t.created_at).toLocaleDateString("ko-KR")}
                        </span>
                      </div>
                      <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-ink-700">
                        {t.content}
                      </p>
                    </Card>
                  </li>
                ))}
              </ul>
            )}
          </Section>

          <Section title="소감 남기기" className="lg:sticky lg:top-24">
            <Card>
              <TestimonialForm />
            </Card>
          </Section>
        </div>
      </Container>
    </>
  );
}
