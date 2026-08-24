import "server-only";
import { NAV_GROUPS, type NavGroup } from "@/lib/nav";
import { toNavGroups } from "@/lib/nav-item";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { NavItemRow } from "@/lib/supabase/types";

/**
 * 화면에 그릴 내비게이션을 읽는다 (레이아웃에서 요청마다 한 번).
 *
 * nav_items 표가 아직 없거나 조회에 실패해도 사이트는 떠야 하므로,
 * 그럴 때는 src/lib/nav.ts 의 기본 메뉴를 그대로 쓴다.
 */
export async function getNavItems(): Promise<NavItemRow[]> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("nav_items")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) throw new Error(error.message);
  return (data as NavItemRow[] | null) ?? [];
}

export async function getNavGroups(): Promise<NavGroup[]> {
  try {
    const items = await getNavItems();
    if (items.length === 0) return NAV_GROUPS;
    return toNavGroups(items);
  } catch {
    return NAV_GROUPS;
  }
}
