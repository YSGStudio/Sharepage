"use client";

import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl } from "@/lib/env";

/**
 * 클라이언트 컴포넌트용 Supabase 클라이언트 (익명 키).
 * 로그인/로그아웃과 읽기 전용 조회에만 사용한다. 쓰기 작업은 서버 라우트를 거친다.
 * 예외: 큰 파일은 서버 라우트가 발급한 일회용 서명 주소로 Storage 에 직접 올린다(브릿지 뉴스).
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl(), supabaseAnonKey());
}
