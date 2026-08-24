import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/guards";
import { validateNavItem } from "@/lib/nav-item";
import { createSupabaseServerClient } from "@/lib/supabase/server";

/** 내비게이션 탭 추가 (운영자 전용). 새 탭은 맨 아래에 붙는다. */
export async function POST(request: Request) {
  const guard = await requireAdmin();
  if ("response" in guard) return guard.response;

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

  const { data: last } = await supabase
    .from("nav_items")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const { data, error } = await supabase
    .from("nav_items")
    .insert({ ...parsed.value, sort_order: (last?.sort_order ?? 0) + 10 })
    .select("id")
    .single();

  if (error) {
    console.error("[nav] 추가 실패:", error.message);
    const duplicate = error.message.includes("nav_items_href_key");
    return NextResponse.json(
      {
        error: duplicate
          ? "같은 주소를 쓰는 탭이 이미 있습니다."
          : "탭 추가에 실패했습니다.",
      },
      { status: duplicate ? 409 : 500 },
    );
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
