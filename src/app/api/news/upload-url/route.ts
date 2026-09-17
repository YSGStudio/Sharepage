import { NextResponse } from "next/server";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  ALLOWED_PDF_TYPES,
  ALLOWED_THUMB_TYPES,
  buildStoragePath,
  MAX_NEWS_BYTES,
  MAX_THUMB_BYTES,
  NEWS_BUCKET,
} from "@/lib/upload";

interface FileMeta {
  name?: unknown;
  size?: unknown;
  type?: unknown;
}

/** 브라우저가 알려 준 파일 정보가 한도·형식에 맞는지 본다. 실제 파일은 등록 때 다시 확인한다. */
function checkMeta(
  meta: FileMeta | undefined,
  maxBytes: number,
  allowedTypes: string[],
): string | null {
  const size = typeof meta?.size === "number" ? meta.size : 0;
  const type = typeof meta?.type === "string" ? meta.type : "";
  if (size <= 0) return "파일을 선택해 주세요.";
  if (size > maxBytes) {
    return `파일이 너무 큽니다. ${Math.floor(maxBytes / 1024 / 1024)}MB 이하만 올릴 수 있습니다.`;
  }
  if (!allowedTypes.includes(type)) return "허용되지 않는 파일 형식입니다.";
  return null;
}

/**
 * 브릿지 뉴스 파일을 브라우저가 Supabase Storage 로 직접 올릴 수 있는 일회용 주소를 만든다.
 *
 * 수십 MB PDF 를 서버 함수로 받으면 호스팅의 요청 크기 제한(413)에 걸린다.
 * 서버는 권한과 한도만 확인하고 주소를 내주며, 파일은 브라우저 → Storage 로 바로 간다.
 * 등록(POST /api/news)에서 올라간 파일의 실제 크기·형식을 다시 확인한다.
 */
export async function POST(request: Request) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  let body: { pdf?: FileMeta; thumb?: FileMeta | null };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "요청 형식이 올바르지 않습니다." }, { status: 400 });
  }

  const pdfError = checkMeta(body.pdf, MAX_NEWS_BYTES, ALLOWED_PDF_TYPES);
  if (pdfError) return NextResponse.json({ error: pdfError }, { status: 400 });

  // 표지는 없어도 된다. 형식이 맞지 않으면 표지만 빼고 진행한다.
  const withThumb =
    body.thumb != null && checkMeta(body.thumb, MAX_THUMB_BYTES, ALLOWED_THUMB_TYPES) === null;

  const supabase = await createSupabaseServerClient();
  const bucket = supabase.storage.from(NEWS_BUCKET);

  const pdfPath = buildStoragePath("news", "file.pdf");
  const pdf = await bucket.createSignedUploadUrl(pdfPath);
  if (pdf.error) {
    console.error("[news] 업로드 주소 생성 실패:", pdf.error.message);
    return NextResponse.json({ error: "업로드를 준비하지 못했습니다." }, { status: 500 });
  }

  let thumb: { path: string; token: string } | null = null;
  if (withThumb) {
    const ext = body.thumb!.type === "image/png" ? "png" : "jpg";
    const result = await bucket.createSignedUploadUrl(buildStoragePath("news/covers", `cover.${ext}`));
    if (result.error) console.error("[news] 표지 업로드 주소 생성 실패:", result.error.message);
    else thumb = { path: result.data.path, token: result.data.token };
  }

  return NextResponse.json({
    pdf: { path: pdf.data.path, token: pdf.data.token },
    thumb,
  });
}
