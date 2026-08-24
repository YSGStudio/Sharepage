import type { Metadata } from "next";
import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { Alert, Badge, Card, Container, PageHeader } from "@/components/ui";
import { getCurrentUser, isAdmin, isApprovedTeacher } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TeachingMaterial } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "수업자료",
  description: "연구학교 교사들이 공유한 BRIDGE 수업자료를 내려받을 수 있습니다.",
};

export const dynamic = "force-dynamic";

export default async function MaterialsPage() {
  const user = await getCurrentUser().catch(() => null);
  const admin = isAdmin(user);
  const canUpload = isApprovedTeacher(user);

  let materials: TeachingMaterial[] = [];
  let loadError: string | null = null;

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("teaching_materials")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) loadError = error.message;
    materials = (data as TeachingMaterial[] | null) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  // 공개 버킷이므로 공개 URL로 바로 내려받을 수 있다 (R7).
  const supabase = await createSupabaseServerClient();
  const withUrls = materials.map((m) => ({
    ...m,
    url: supabase.storage.from("materials").getPublicUrl(m.file_path).data
      .publicUrl,
  }));

  return (
    <>
      <PageHeader
        eyebrow="자료 나눔"
        title="수업자료"
        description="선생님들이 올린 BRIDGE 수업자료입니다. 누구나 열람하고 내려받을 수 있습니다."
      />

      <Container>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">총 {withUrls.length}건</p>
          {canUpload ? (
            <Link
              href="/materials/upload"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              자료 올리기
            </Link>
          ) : (
            <Link
              href={user ? "/teacher" : "/login"}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              {user ? "승인 후 자료를 올릴 수 있습니다" : "교사 로그인 →"}
            </Link>
          )}
        </div>

        {loadError && (
          <div className="mb-6">
            <Alert tone="warning" title="자료를 불러오지 못했습니다">
              데이터베이스 준비가 끝나지 않았을 수 있습니다. ({loadError})
            </Alert>
          </div>
        )}

        {withUrls.length === 0 && !loadError ? (
          <Alert tone="info">
            아직 등록된 수업자료가 없습니다. 첫 자료를 올려 주세요.
          </Alert>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withUrls.map((m) => (
              <li key={m.id}>
                <Card className="flex h-full flex-col">
                  <div className="flex flex-wrap gap-1.5">
                    <Badge>{m.grade}</Badge>
                    <Badge tone="muted">{m.subject}</Badge>
                  </div>
                  <h2 className="mt-3 text-base font-bold text-brand-800">
                    {m.title}
                  </h2>
                  {m.description && (
                    <p className="mt-2 text-sm leading-relaxed text-ink-700">
                      {m.description}
                    </p>
                  )}
                  <p className="mt-3 truncate text-xs text-ink-500" title={m.file_name}>
                    {m.file_name}
                  </p>
                  <p className="mt-1 text-xs text-ink-500">
                    {new Date(m.created_at).toLocaleDateString("ko-KR")}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-brand-100 pt-4">
                    <a
                      href={m.url}
                      download={m.file_name}
                      className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
                    >
                      내려받기
                    </a>
                    {admin && (
                      <DeleteButton endpoint={`/api/materials/${m.id}`} />
                    )}
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </>
  );
}
