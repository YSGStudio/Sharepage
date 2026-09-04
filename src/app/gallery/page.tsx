import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { Alert, Card, Container, PageHeader } from "@/components/ui";
import {
  GALLERY_SECTIONS,
  UNSORTED_KEY,
  isGallerySectionKey,
} from "@/content/gallery-sections";
import { getCurrentUser, isAdmin, isApprovedTeacher } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Photo } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "운영 사진",
  description:
    "연구 과제별·주요 추진 내용별로 정리한 수업 나눔, 프로젝트 활동, 교내 연수 현장의 기록입니다.",
};

export const dynamic = "force-dynamic";

interface PhotoWithUrl extends Photo {
  url: string;
}

const KIND_THEME = {
  공통과제: {
    accent: "text-brand-700",
    badge: "bg-brand-600 text-white",
    rule: "bg-brand-200",
  },
  선택과제: {
    accent: "text-amber-800",
    badge: "bg-amber-500 text-white",
    rule: "bg-amber-200",
  },
} as const;

function PhotoGrid({
  photos,
  admin,
}: {
  photos: PhotoWithUrl[];
  admin: boolean;
}) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {photos.map((p) => (
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
              {p.caption && (
                <p className="text-sm leading-relaxed text-ink-700">
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
  );
}

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

  const withUrls: PhotoWithUrl[] = photos.map((p) => ({
    ...p,
    url: supabase.storage.from("photos").getPublicUrl(p.storage_path).data
      .publicUrl,
  }));

  // 섹션 키로 한 번만 묶어 둔다. 키와 맞지 않는 값은 모두 '미분류'로 간다.
  const byKey = new Map<string, PhotoWithUrl[]>();
  for (const photo of withUrls) {
    const category = photo.category ?? "";
    const key = isGallerySectionKey(category) ? category : UNSORTED_KEY;
    const bucket = byKey.get(key);
    if (bucket) bucket.push(photo);
    else byKey.set(key, [photo]);
  }

  const unsorted = byKey.get(UNSORTED_KEY) ?? [];

  return (
    <>
      <PageHeader
        eyebrow="자료 나눔"
        title="운영 사진"
        description="연구 과제 다섯 갈래와 그 안의 주요 추진 내용별로 현장 기록을 모았습니다."
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

        {withUrls.length > 0 && (
          <nav
            aria-label="과제별 바로가기"
            className="mb-10 flex flex-wrap gap-2 rounded-2xl border border-surface-variant bg-surface-container-low p-4"
          >
            {GALLERY_SECTIONS.map((section) => {
              const count = section.subsections.reduce(
                (sum, sub) => sum + (byKey.get(sub.key)?.length ?? 0),
                0,
              );
              return (
                <a
                  key={section.taskId}
                  href={`#gallery-${section.taskId}`}
                  className="rounded-full border border-brand-200 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50"
                >
                  {section.label}
                  <span className="ml-1.5 font-medium text-ink-500">
                    {count}
                  </span>
                </a>
              );
            })}
            {unsorted.length > 0 && (
              <a
                href="#gallery-unsorted"
                className="rounded-full border border-surface-variant bg-white px-3 py-1.5 text-xs font-bold text-on-surface-variant transition-colors hover:bg-surface-container"
              >
                미분류
                <span className="ml-1.5 font-medium text-ink-500">
                  {unsorted.length}
                </span>
              </a>
            )}
          </nav>
        )}

        <div className="space-y-16">
          {GALLERY_SECTIONS.map((section) => {
            const theme = KIND_THEME[section.kind];
            const sectionCount = section.subsections.reduce(
              (sum, sub) => sum + (byKey.get(sub.key)?.length ?? 0),
              0,
            );

            return (
              <section
                key={section.taskId}
                id={`gallery-${section.taskId}`}
                aria-labelledby={`gallery-${section.taskId}-title`}
                className="scroll-mt-24"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-lg px-2.5 py-1 text-xs font-black ${theme.badge}`}
                  >
                    {section.label}
                  </span>
                  <span
                    className={`text-xs font-bold tracking-wide ${theme.accent}`}
                  >
                    {section.kind}
                  </span>
                  <span className="text-xs font-medium text-ink-500">
                    사진 {sectionCount}장
                  </span>
                </div>
                <h2
                  id={`gallery-${section.taskId}-title`}
                  className="mt-2 text-xl font-black leading-snug text-on-surface sm:text-2xl"
                >
                  {section.title}
                </h2>
                <div aria-hidden className={`mt-4 h-1 w-16 rounded ${theme.rule}`} />

                <div className="mt-7 space-y-10">
                  {section.subsections.map((sub, index) => {
                    const items = byKey.get(sub.key) ?? [];
                    return (
                      <div key={sub.key} id={`gallery-${sub.key.replace(":", "-")}`} className="scroll-mt-24">
                        <div className="flex items-baseline gap-2.5">
                          <span
                            className={`text-sm font-black tabular-nums ${theme.accent}`}
                          >
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3 className="text-base font-bold leading-snug text-on-surface">
                            {sub.title}
                          </h3>
                          <span className="ml-auto shrink-0 text-xs font-medium text-ink-500">
                            {items.length}장
                          </span>
                        </div>
                        {sub.detail && (
                          <p className="mt-1.5 pl-7 text-sm leading-relaxed text-on-surface-variant">
                            {sub.detail}
                          </p>
                        )}

                        <div className="mt-4">
                          {items.length > 0 ? (
                            <PhotoGrid photos={items} admin={admin} />
                          ) : (
                            <p className="rounded-xl border border-dashed border-surface-variant px-4 py-6 text-center text-sm text-ink-500">
                              아직 등록된 사진이 없습니다.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}

          {unsorted.length > 0 && (
            <section
              id="gallery-unsorted"
              aria-labelledby="gallery-unsorted-title"
              className="scroll-mt-24"
            >
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-lg bg-surface-container px-2.5 py-1 text-xs font-black text-on-surface-variant">
                  미분류
                </span>
                <span className="text-xs font-medium text-ink-500">
                  사진 {unsorted.length}장
                </span>
              </div>
              <h2
                id="gallery-unsorted-title"
                className="mt-2 text-xl font-black leading-snug text-on-surface sm:text-2xl"
              >
                과제가 지정되지 않은 사진
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
                섹션 구분을 도입하기 전에 올렸거나 분류를 고르지 않은 사진입니다.
              </p>
              <div aria-hidden className="mt-4 h-1 w-16 rounded bg-surface-variant" />

              <div className="mt-7">
                <PhotoGrid photos={unsorted} admin={admin} />
              </div>
            </section>
          )}
        </div>
      </Container>
    </>
  );
}
