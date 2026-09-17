import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALLOWED_PDF_TYPES,
  ALLOWED_THUMB_TYPES,
  buildStoragePath,
  checkFile,
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

/**
 * 브릿지 뉴스 등록. 승인된 교사만 가능 (R22).
 *
 * 본문은 PDF 하나, 표지는 업로드 화면이 PDF 첫 페이지를 그려 보낸 이미지다.
 * 표지는 없어도 등록된다 — 브라우저가 PDF 를 그리지 못하는 경우가 있다.
 */
export async function POST(request: Request) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json(
      { error: "요청 형식이 올바르지 않습니다." },
      { status: 400 },
    );
  }

  const title = String(form.get("title") ?? "").trim();
  const issueLabel = String(form.get("issue_label") ?? "").trim();
  const publishedOnRaw = String(form.get("published_on") ?? "").trim();
  const description = String(form.get("description") ?? "").trim();
  const file = form.get("file");
  const thumb = form.get("thumb");

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

  const fileError = checkFile(file instanceof File ? file : null, {
    maxBytes: MAX_NEWS_BYTES,
    allowedTypes: ALLOWED_PDF_TYPES,
  });
  if (fileError) {
    return NextResponse.json({ error: fileError }, { status: 400 });
  }

  const pdf = file as File;
  const cover = thumb instanceof File && thumb.size > 0 ? thumb : null;
  if (cover) {
    const thumbError = checkFile(cover, {
      maxBytes: MAX_THUMB_BYTES,
      allowedTypes: ALLOWED_THUMB_TYPES,
    });
    if (thumbError) {
      return NextResponse.json({ error: thumbError }, { status: 400 });
    }
  }

  const supabase = await createSupabaseServerClient();
  const storagePath = buildStoragePath("news", pdf.name);

  const { error: uploadError } = await supabase.storage
    .from(NEWS_BUCKET)
    .upload(storagePath, pdf, {
      contentType: pdf.type || "application/pdf",
      upsert: false,
    });

  if (uploadError) {
    console.error("[news] PDF 업로드 실패:", uploadError.message);
    return NextResponse.json(
      { error: "파일 업로드에 실패했습니다." },
      { status: 500 },
    );
  }

  // 표지 업로드가 실패해도 소식지 등록은 계속한다. 목록은 기본 표지를 보여 준다.
  let thumbPath: string | null = null;
  if (cover) {
    const coverPath = buildStoragePath("news/covers", cover.name || "cover.jpg");
    const { error: coverError } = await supabase.storage
      .from(NEWS_BUCKET)
      .upload(coverPath, cover, {
        contentType: cover.type || "image/jpeg",
        upsert: false,
      });

    if (coverError) console.error("[news] 표지 업로드 실패:", coverError.message);
    else thumbPath = coverPath;
  }

  const { data, error } = await supabase
    .from("bridge_news")
    .insert({
      title,
      issue_label: issueLabel || null,
      published_on: publishedOn,
      description: description || null,
      file_path: storagePath,
      file_name: pdf.name,
      thumb_path: thumbPath,
      uploader_id: guard.user.userId,
    })
    .select("id")
    .single();

  if (error) {
    // DB 기록에 실패하면 올라간 파일은 남기지 않는다.
    const orphans = thumbPath ? [storagePath, thumbPath] : [storagePath];
    await supabase.storage.from(NEWS_BUCKET).remove(orphans);
    console.error("[news] 레코드 생성 실패:", error.message);
    return NextResponse.json(
      { error: "소식지 등록에 실패했습니다." },
      { status: 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
