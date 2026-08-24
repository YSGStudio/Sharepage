import "server-only";

import { createClient } from "@supabase/supabase-js";
import { supabaseServiceRoleKey, supabaseUrl } from "@/lib/env";

/**
 * Service Role 클라이언트. RLS를 우회하므로 서버에서만, 꼭 필요한 곳에서만 쓴다.
 * 현재 용도: api_rate_limits 카운터(공개 정책 없음), 가입 시 teachers 행 생성.
 */
export function createSupabaseAdminClient() {
  return createClient(supabaseUrl(), supabaseServiceRoleKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
