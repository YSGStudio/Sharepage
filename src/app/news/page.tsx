import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { DeleteButton } from "@/components/delete-button";
import { PdfOpenButton, PdfViewerHost } from "@/components/pdf-viewer";
import { Alert, Badge, Card, Container, PageHeader } from "@/components/ui";
import { getCurrentUser, isAdmin, isApprovedTeacher } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { BridgeNews } from "@/lib/supabase/types";
import { NEWS_BUCKET } from "@/lib/upload";

export const metadata: Metadata = {
  title: "브릿지 뉴스",
  description:
    "연구학교 운영 소식을 담은 브릿지 뉴스입니다. 표지를 눌러 PDF 를 바로 읽거나 내려받을 수 있습니다.",
};

export const dynamic = "force-dynamic";

/** 표지가 없는 소식지 자리에 넣는 그림 */
function CoverFallback() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-brand-50 text-brand-500">
      <svg
        viewBox="0 0 24 24"
        aria-hidden
        className="h-10 w-10 fill-none stroke-current stroke-[1.5]"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
        <path d="M14 3v5h5" />
      </svg>
      <span className="text-xs font-semibold">PDF</span>
    </div>
  );
}

export default async function NewsPage() {
  const user = await getCurrentUser().catch(() => null);
  const admin = isAdmin(user);
  const canUpload = isApprovedTeacher(user);

  const supabase = await createSupabaseServerClient();

  let news: BridgeNews[] = [];
  let loadError: string | null = null;

  try {
    const { data, error } = await supabase
      .from("bridge_news")
      .select("*")
      // 발행일을 적은 소식지가 먼저, 안 적은 소식지는 등록 순으로 뒤에 붙는다.
      .order("published_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });

    if (error) loadError = error.message;
    news = (data as BridgeNews[] | null) ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "알 수 없는 오류";
  }

  // 공개 버킷이므로 공개 URL 로 바로 열람·내려받기가 된다 (R7).
  const publicUrl = (path: string) =>
    supabase.storage.from(NEWS_BUCKET).getPublicUrl(path).data.publicUrl;

  const withUrls = news.map((item) => ({
    ...item,
    url: publicUrl(item.file_path),
    coverUrl: item.thumb_path ? publicUrl(item.thumb_path) : null,
  }));

  return (
    <>
      <PageHeader
        eyebrow="자료 나눔"
        title="브릿지 뉴스"
        description="연구학교의 이야기를 담아 펴내는 소식지입니다. 표지를 누르면 소식지를 바로 읽을 수 있습니다."
      />

      <Container>
        <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-ink-500">총 {withUrls.length}호</p>
          {canUpload ? (
            <Link
              href="/news/upload"
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              소식지 올리기
            </Link>
          ) : (
            <Link
              href={user ? "/teacher" : "/login"}
              className="text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              {user ? "승인 후 소식지를 올릴 수 있습니다" : "교사 로그인 →"}
            </Link>
          )}
        </div>

        {loadError && (
          <div className="mb-6">
            <Alert tone="warning" title="소식지를 불러오지 못했습니다">
              데이터베이스 준비가 끝나지 않았을 수 있습니다. ({loadError})
            </Alert>
          </div>
        )}

        {withUrls.length === 0 && !loadError ? (
          <Alert tone="info">
            아직 등록된 소식지가 없습니다. 첫 호를 올려 주세요.
          </Alert>
        ) : (
          <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {withUrls.map((item) => (
              <li key={item.id}>
                <Card className="flex h-full flex-col overflow-hidden p-0">
                  <PdfOpenButton
                    url={item.url}
                    title={item.title}
                    fileName={item.file_name}
                    ariaLabel={`${item.title} 읽기`}
                    className="group relative block aspect-[3/4] w-full cursor-zoom-in overflow-hidden border-b border-surface-variant bg-white"
                  >
                    {item.coverUrl ? (
                      <Image
                        src={item.coverUrl}
                        alt={`${item.title} 표지`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.02]"
                      />
                    ) : (
                      <CoverFallback />
                    )}
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-left text-sm font-semibold text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
                      눌러서 읽기
                    </span>
                  </PdfOpenButton>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap gap-1.5">
                      {item.issue_label && <Badge>{item.issue_label}</Badge>}
                      {item.published_on && (
                        <Badge tone="muted">
                          {new Date(
                            `${item.published_on}T00:00:00`,
                          ).toLocaleDateString("ko-KR")}
                        </Badge>
                      )}
                    </div>

                    <h2 className="mt-3 text-base font-bold leading-snug text-brand-800">
                      {item.title}
                    </h2>
                    {item.description && (
                      <p className="mt-2 text-sm leading-relaxed text-ink-700">
                        {item.description}
                      </p>
                    )}
                    <p
                      className="mt-3 truncate text-xs text-ink-500"
                      title={item.file_name}
                    >
                      {item.file_name}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-brand-100 pt-4">
                      <PdfOpenButton
                        url={item.url}
                        title={item.title}
                        fileName={item.file_name}
                        className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-brand-700"
                      >
                        읽기
                      </PdfOpenButton>
                      <a
                        href={item.url}
                        download={item.file_name}
                        className="rounded-lg border border-brand-200 px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-brand-50"
                      >
                        내려받기
                      </a>
                      {admin && <DeleteButton endpoint={`/api/news/${item.id}`} />}
                    </div>
                  </div>
                </Card>
              </li>
            ))}
          </ul>
        )}

        <PdfViewerHost />
      </Container>
    </>
  );
}
