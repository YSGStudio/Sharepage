"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/**
 * 클라이언트 컴포넌트용 Supabase 클라이언트 (익명 키).
 * 로그인/로그아웃과 읽기 전용 조회에만 사용한다. 쓰기 작업은 서버 라우트를 거친다.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
