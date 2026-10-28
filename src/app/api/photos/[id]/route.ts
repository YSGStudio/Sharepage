import { NextResponse } from "next/server";
import { isGallerySectionKey } from "@/content/gallery-sections";
import { requireApprovedTeacher } from "@/lib/guards";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Photo } from "@/lib/supabase/types";
import {
  IMAGE_EXTENSIONS,
  isAllowedUploadedImage,
  isOwnStoragePath,
  PHOTOS_BUCKET,
} from "@/lib/upload";

/**
 * 사진 캡션 수정·섹션 이동·사진 교체. 승인된 교사(운영자 포함)는 누구의 사진이든 고칠 수 있다.
 * 본문에 caption, category, storage_path 중 보낸 것만 바꾼다. category 는 앨범 섹션 키만 받는다.
 * storage_path 는 새로 올린 파일 경로이며, 교체가 끝나면 예전 파일을 지운다.
 */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  const { id } = await params;

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { error: "요청 본문을 읽을 수 없습니다." },
      { status: 400 },
    );
  }

  const body = (raw ?? {}) as Record<string, unknown>;
  const changes: { caption?: string | null; category?: string } = {};

  if ("caption" in body) {
    if (typeof body.caption !== "string" && body.caption !== null) {
      return NextResponse.json(
        { error: "캡션 값이 올바르지 않습니다." },
        { status: 400 },
      );
    }
    changes.caption = (body.caption ?? "").trim() || null;
  }

  if ("category" in body) {
    if (typeof body.category !== "string" || !isGallerySectionKey(body.category)) {
      return NextResponse.json(
        { error: "이동할 섹션이 올바르지 않습니다." },
        { status: 400 },
      );
    }
    changes.category = body.category;
  }

  // 사진 교체: 새 파일은 브라우저가 /api/photos/upload-url 주소로 미리 올려 두고 경로만 보낸다.
  let newPath: string | null = null;
  if ("storage_path" in body) {
    const path = typeof body.storage_path === "string" ? body.storage_path : "";
    const validPath = Object.values(IMAGE_EXTENSIONS).some((ext) =>
      isOwnStoragePath("photos", path, ext),
    );
    if (!validPath) {
      return NextResponse.json(
        { error: "교체할 사진이 올바르지 않습니다." },
        { status: 400 },
      );
    }
    newPath = path;
  }

  if (Object.keys(changes).length === 0 && !newPath) {
    return NextResponse.json(
      { error: "바꿀 내용이 없습니다." },
      { status: 400 },
    );
  }

  const supabase = await createSupabaseServerClient();
  const bucket = supabase.storage.from(PHOTOS_BUCKET);

  /** 교체에 실패했을 때 새로 올라간 파일을 지운다. 사진 버킷 삭제는 승인 교사에게 열려 있다(0006). */
  const removeNew = async () => {
    if (!newPath) return;
    const { error } = await bucket.remove([newPath]);
    if (error) console.error("[photos] 올라간 파일 정리 실패:", error.message);
  };

  let oldPath: string | null = null;
  if (newPath) {
    const { data: photo } = await supabase
      .from("photos")
      .select("storage_path")
      .eq("id", id)
      .maybeSingle<Pick<Photo, "storage_path">>();
    if (!photo) {
      await removeNew();
      return NextResponse.json(
        { error: "사진을 찾을 수 없습니다." },
        { status: 404 },
      );
    }
    oldPath = photo.storage_path;

    // 올라간 파일을 직접 확인한다. 브라우저가 알려 준 크기·형식은 믿지 않는다.
    const { data: info, error: infoError } = await bucket.info(newPath);
    if (infoError || !info) {
      return NextResponse.json(
        { error: "올라간 사진을 찾지 못했습니다. 다시 시도해 주세요." },
        { status: 400 },
      );
    }
    if (!isAllowedUploadedImage(info)) {
      await removeNew();
      return NextResponse.json(
        { error: "JPG·PNG·WEBP·GIF 사진(10MB 이하)만 올릴 수 있습니다." },
        { status: 400 },
      );
    }
  }

  const { data, error } = await supabase
    .from("photos")
    .update(newPath ? { ...changes, storage_path: newPath } : changes)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    await removeNew();
    console.error("[photos] 수정 실패:", error.message);
    return NextResponse.json({ error: "수정에 실패했습니다." }, { status: 500 });
  }
  if (!data) {
    await removeNew();
    return NextResponse.json(
      { error: "사진을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  // 새 사진으로 바뀐 뒤에만 예전 파일을 지운다. 실패해도 교체 자체는 끝났다.
  if (oldPath && oldPath !== newPath) {
    const { error: storageError } = await bucket.remove([oldPath]);
    if (storageError) {
      console.error("[photos] 예전 파일 정리 실패:", storageError.message);
    }
  }

  return NextResponse.json({ ok: true });
}

/** 사진 삭제 (R16). 승인된 교사(운영자 포함)는 누구의 사진이든 삭제할 수 있다. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireApprovedTeacher();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { data: photo } = await supabase
    .from("photos")
    .select("*")
    .eq("id", id)
    .maybeSingle<Photo>();

  if (!photo) {
    return NextResponse.json(
      { error: "사진을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) {
    console.error("[photos] 삭제 실패:", error.message);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  const { error: storageError } = await supabase.storage
    .from(PHOTOS_BUCKET)
    .remove([photo.storage_path]);
  if (storageError) {
    console.error("[photos] 파일 정리 실패:", storageError.message);
  }

  return NextResponse.json({ ok: true });
}
