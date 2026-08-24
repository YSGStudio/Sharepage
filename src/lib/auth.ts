import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Teacher } from "@/lib/supabase/types";

export interface CurrentUser {
  userId: string;
  email: string | null;
  teacher: Teacher | null;
}

/**
 * 현재 로그인한 사용자와 teachers 프로필(role/status)을 함께 읽는다.
 * 비로그인이면 null. 스키마가 아직 없거나 조회에 실패하면 teacher = null 로 둔다.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: teacher } = await supabase
    .from("teachers")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Teacher>();

  return { userId: user.id, email: user.email ?? null, teacher: teacher ?? null };
}

export function isAdmin(user: CurrentUser | null): boolean {
  return user?.teacher?.role === "admin" && user.teacher.status === "approved";
}

export function isApprovedTeacher(user: CurrentUser | null): boolean {
  return user?.teacher?.status === "approved";
}

/** 승인 대기 중(가입은 했으나 아직 교사 전용 기능을 쓸 수 없는 상태) */
export function isPendingTeacher(user: CurrentUser | null): boolean {
  return user?.teacher?.status === "pending";
}
