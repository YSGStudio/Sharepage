import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALLOWED_PDF_TYPES,
  ALLOWED_THUMB_TYPES,
  isOwnStoragePath,
  MAX_NEWS_BYTES,
  MAX_THUMB_BYTES,
  NEWS_BUCKET,
} from "@/lib/upload";

const MAX_TITLE_LENGTH = 120;
const MAX_ISSUE_LENGTH = 30;

/** YYYY-MM-DD 이면서 실제로 존재하는 날짜인지 본다. */
function normalizePublishedOn(raw: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const date = new Date(`${raw}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10) === raw ? raw : null;
}

/** JSON 값에서 앞뒤 공백을 걷어낸 문자열을 꺼낸다. */
const text = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/**
 * 브릿지 뉴스 등록. 승인된 교사만 가능 (R22).
 *
 * 파일은 브라우저가 POST /api/news/upload-url 로 받은 주소에 직접 올리고,
 * 여기에는 올라간 경로와 글 정보만 JSON 으로 보낸다(서버 함수 요청 크기 제한 회피).
 * 경로가 우리가 만든 형식인지, 실제 파일의 크기·형식이 한도 안인지 다시 확인한다.
 * 표지는 없어도 등록된다 — 브라우저가 PDF 를 그리지 못하는 경우가 있다.
 */
export async function POST(request: Request) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const title = text(body.title);
  const issueLabel = text(body.issue_label);
  const publishedOnRaw = text(body.published_on);
  const description = text(body.description);
  const filePath = text(body.file_path);
  const fileName = text(body.file_name).slice(0, 255);
  const thumbPathRaw = text(body.thumb_path);

  if (!title) {
    return NextResponse.json({ error: "제목을 입력해 주세요." }, { status: 400 });
  }
  if (title.length > MAX_TITLE_LENGTH) {
    return NextResponse.json(
      { error: `제목은 ${MAX_TITLE_LENGTH}자를 넘을 수 없습니다.` },
      { status: 400 },
    );
  }
  if (issueLabel.length > MAX_ISSUE_LENGTH) {
    return NextResponse.json(
      { error: `호수는 ${MAX_ISSUE_LENGTH}자를 넘을 수 없습니다.` },
      { status: 400 },
    );
  }

  const publishedOn = publishedOnRaw ? normalizePublishedOn(publishedOnRaw) : null;
  if (publishedOnRaw && !publishedOn) {
    return NextResponse.json(
      { error: "발행일이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  if (!isOwnStoragePath("news", filePath, "pdf") || !fileName) {
    return NextResponse.json({ error: "파일을 선택해 주세요." }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const bucket = supabase.storage.from(NEWS_BUCKET);

  /**
   * 잘못 올라갔거나 등록에 실패한 파일을 지운다.
   * Storage 삭제 정책은 운영자 전용이라 교사 세션으로는 지워지지 않아 service role 을 쓴다.
   * 경로는 위에서 isOwnStoragePath 로 형식을 확인한 것만 넘긴다.
   */
  const removeUploaded = async (paths: string[]) => {
    const { error } = await createSupabaseAdminClient().storage.from(NEWS_BUCKET).remove(paths);
    if (error) console.error("[news] 올라간 파일 정리 실패:", error.message);
  };

  // 올라간 파일을 직접 확인한다. 브라우저가 알려 준 크기·형식은 믿지 않는다.
  const { data: pdfInfo, error: pdfInfoError } = await bucket.info(filePath);
  if (pdfInfoError || !pdfInfo) {
    return NextResponse.json(
      { error: "올라간 파일을 찾지 못했습니다. 다시 시도해 주세요." },
      { status: 400 },
    );
  }
  if (
    (pdfInfo.size ?? 0) > MAX_NEWS_BYTES ||
    !ALLOWED_PDF_TYPES.includes(pdfInfo.contentType ?? "")
  ) {
    await removeUploaded([filePath]);
    return NextResponse.json(
      { error: "PDF 파일(50MB 이하)만 올릴 수 있습니다." },
      { status: 400 },
    );
  }

  // 표지는 확인에 실패하면 버리고 표지 없이 등록한다. 목록은 기본 표지를 보여 준다.
  let thumbPath: string | null = null;
  if (thumbPathRaw) {
    const validPath =
      isOwnStoragePath("news/covers", thumbPathRaw, "jpg") ||
      isOwnStoragePath("news/covers", thumbPathRaw, "png");
    const { data: thumbInfo } = validPath
      ? await bucket.info(thumbPathRaw)
      : { data: null };
    if (
      thumbInfo &&
      (thumbInfo.size ?? 0) <= MAX_THUMB_BYTES &&
      ALLOWED_THUMB_TYPES.includes(thumbInfo.contentType ?? "")
    ) {
      thumbPath = thumbPathRaw;
    } else if (validPath) {
      await removeUploaded([thumbPathRaw]);
    }
  }

  const { data, error } = await supabase
    .from("bridge_news")
    .insert({
      title,
      issue_label: issueLabel || null,
      published_on: publishedOn,
      description: description || null,
      file_path: filePath,
      file_name: fileName,
      thumb_path: thumbPath,
      uploader_id: guard.user.userId,
    })
    .select("id")
    .single();

  if (error) {
    // DB 기록에 실패하면 올라간 파일은 남기지 않는다.
    const orphans = thumbPath ? [filePath, thumbPath] : [filePath];
    await removeUploaded(orphans);
    console.error("[news] 레코드 생성 실패:", error.message);
    return NextResponse.json(
      { error: "소식지 등록에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
