import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { Alert, Badge, Card, Container, PageHeader } from "@/components/ui";
import { getCurrentUser, isAdmin, isApprovedTeacher } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Photo } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "운영 사진",
  description: "수업 나눔, 프로젝트 활동, 교내 연수 현장의 기록입니다.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const user = await getCurrentUser().catch(() => null);
  const admin = isAdmin(user);
  const canUpload = isApprovedTeacher(user);

  let photos: Photo[] = [];
  let loadError: string | null = null;

  const supabase = await createSupabaseServerClient();
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) loadError = error.message;
    photos = (data as Photo[] | null) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  const withUrls = photos.map((p) => ({
    ...p,
    url: supabase.storage.from("photos").getPublicUrl(p.storage_path).data
      .publicUrl,
  }));

  return (
    <>
      <PageHeader
        eyebrow="자료 나눔"
        title="운영 사진"
        description="연구학교 운영 현장을 최신순으로 보여 드립니다."
      />

      <Container>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">총 {withUrls.length}장</p>
          {canUpload && (
            <Link
              href="/gallery/upload"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              사진 올리기
            </Link>
          )}
        </div>

        {loadError && (
          <div className="mb-6">
            <Alert tone="warning" title="사진을 불러오지 못했습니다">
              데이터베이스 준비가 끝나지 않았을 수 있습니다. ({loadError})
            </Alert>
          </div>
        )}

        {withUrls.length === 0 && !loadError ? (
          <Alert tone="info">아직 등록된 사진이 없습니다.</Alert>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {withUrls.map((p) => (
              <li key={p.id}>
                <Card className="flex h-full flex-col overflow-hidden p-0">
                  <div className="relative aspect-[4/3] w-full bg-brand-50">
                    <Image
                      src={p.url}
                      alt={p.caption ?? "연구학교 운영 사진"}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-1 flex-col p-4">
                    {p.category && <Badge>{p.category}</Badge>}
                    {p.caption && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">
                        {p.caption}
                      </p>
                    )}
                    <p className="mt-auto pt-3 text-xs text-ink-500">
                      {new Date(p.created_at).toLocaleDateString("ko-KR")}
                    </p>
                    {admin && (
                      <div className="mt-3 border-t border-brand-100 pt-3">
                        <DeleteButton endpoint={`/api/photos/${p.id}`} />
                      </div>
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
