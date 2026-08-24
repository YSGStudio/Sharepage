import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { validateNavItem } from "@/lib/nav-item";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 탭 이름·주소·묶음 수정 (운영자 전용). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
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

  const parsed = validateNavItem(raw);
  if ("error" in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("nav_items")
    .update(parsed.value)
    .eq("id", id)
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[nav] 수정 실패:", error.message);
    const duplicate = error.message.includes("nav_items_href_key");
    return NextResponse.json(
      {
        error: duplicate
          ? "같은 주소를 쓰는 탭이 이미 있습니다."
          : "수정에 실패했습니다.",
      },
      { status: duplicate ? 409 : 500 },
    );
  }
  if (!data) {
    return NextResponse.json({ error: "탭을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}

/** 탭 삭제 (운영자 전용). */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

  const { id } = await params;
  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.from("nav_items").delete().eq("id", id);
  if (error) {
    console.error("[nav] 삭제 실패:", error.message);
    return NextResponse.json({ error: "삭제에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
