import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Alert, Container, PageHeader, Section } from "@/components/ui";
import { getCurrentUser, isAdmin } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TimelineActivity } from "@/lib/supabase/types";
import { buildBoardColumns } from "@/lib/timeline-columns";
import { ActivityBoardAdmin } from "./activity-board";

export const metadata: Metadata = { title: "월별 추진활동 관리" };

export const dynamic = "force-dynamic";

export default async function AdminTimelinePage() {
  const user = await getCurrentUser().catch(() => null);
  if (!user) redirect("/login");
  if (!isAdmin(user)) redirect("/teacher");

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("timeline_activities")
    .select("*")
    .order("year", { ascending: true })
    .order("month", { ascending: true })
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  const activities = (data as TimelineActivity[] | null) ?? [];
  const columns = buildBoardColumns(activities);

  return (
    <>
      <PageHeader
        eyebrow="운영자 전용"
        title="월별 추진활동 관리"
        description="달마다 활동을 추가하고 담당자와 진행 상태를 관리합니다. 저장하면 월별 추진현황 페이지에 바로 반영됩니다."
      />

      <Container>
        {error && (
          <div className="mb-8">
            <Alert tone="warning" title="추진활동을 불러오지 못했습니다">
              {error.message} · supabase/migrations/0003_timeline_activities.sql
              을 적용했는지 확인해 주세요.
            </Alert>
          </div>
        )}

        <Section
          title={`등록된 활동 ${activities.length}건`}
          description="열 오른쪽 위 + 버튼으로 그 달에 활동을 추가합니다."
        >
          <ActivityBoardAdmin columns={columns} />
        </Section>

        <div className="flex flex-wrap gap-3 text-sm">
          <Link href="/timeline" className="font-medium text-brand-700 underline">
            공개 페이지에서 보기
          </Link>
          <Link href="/admin" className="font-medium text-brand-700 underline">
            운영자 화면으로
          </Link>
        </div>
      </Container>
    </>
  );
}
