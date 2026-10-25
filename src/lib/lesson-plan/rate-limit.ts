import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * 지도안은 사람마다가 아니라 홈페이지 전체에서 하루 이만큼만 만든다 (채팅·폼 공통).
 * 질문·답변이 오간 횟수가 아니라 완성된 지도안 수를 센다.
 */
export const SITE_DAILY_PLAN_LIMIT = 5;

/** 홈페이지 전체 카운터를 api_rate_limits 에 둘 때 쓰는 키. IP 와 겹치지 않는다. */
const SITE_PLAN_KEY = "site:lesson-plan";

/**
 * KST(UTC+9) 기준 오늘 날짜를 YYYY-MM-DD 로 반환한다.
 * 날짜가 바뀌면 api_rate_limits 에 새 행이 생기므로 초기화 배치가 필요 없다.
 */
export function kstDateString(now: Date = new Date()): string {
  const kstMs = now.getTime() + 9 * 60 * 60 * 1000;
  return new Date(kstMs).toISOString().slice(0, 10);
}

/**
 * 요청 헤더에서 클라이언트 IP를 뽑는다.
 * 프록시 뒤에 있으므로 x-forwarded-for 의 첫 항목을 우선한다.
 */
export function clientIpFrom(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "unknown";
}

export interface RateLimitResult {
  allowed: boolean;
  count: number;
  limit: number;
  /** 카운터를 확인하지 못했을 때(예: DB 장애) true */
  degraded?: boolean;
}

/**
 * 호출 횟수를 1 올리고 허용 여부를 판정한다 (R20).
 * increment_rate_limit RPC 가 upsert + 증가를 한 번에 처리하므로
 * 동시 요청에서도 카운트가 밀리지 않는다.
 */
export async function consumeRateLimit(
  ip: string,
  date: string = kstDateString(),
  limit: number,
): Promise<RateLimitResult> {
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase.rpc("increment_rate_limit", {
    p_ip_address: ip,
    p_request_date: date,
    p_limit: limit,
  });

  if (error) {
    // 카운터를 못 읽었다고 서비스를 막지는 않는다. 대신 사실을 알린다.
    console.error("[rate-limit] increment_rate_limit 실패:", error.message);
    return { allowed: true, count: 0, limit, degraded: true };
  }

  const row = Array.isArray(data) ? data[0] : data;
  const count = Number(row?.current_count ?? 0);
  const allowed = Boolean(row?.allowed);

  return { allowed, count, limit };
}

/**
 * 오늘 홈페이지 전체에서 완성된 지도안 수를 읽는다. 카운터를 올리지 않는다.
 */
export async function readSitePlanCount(
  date: string = kstDateString(),
): Promise<RateLimitResult> {
  const limit = SITE_DAILY_PLAN_LIMIT;
  const supabase = createSupabaseAdminClient();

  const { data, error } = await supabase
    .from("api_rate_limits")
    .select("count")
    .eq("ip_address", SITE_PLAN_KEY)
    .eq("request_date", date)
    .maybeSingle();

  if (error) {
    console.error("[rate-limit] 지도안 수 조회 실패:", error.message);
    return { allowed: true, count: 0, limit, degraded: true };
  }

  const count = Number(data?.count ?? 0);
  return { allowed: count < limit, count, limit };
}

/** 지도안 하나가 완성됐을 때 홈페이지 전체 카운터를 1 올린다. */
export function recordSitePlan(
  date: string = kstDateString(),
): Promise<RateLimitResult> {
  return consumeRateLimit(SITE_PLAN_KEY, date, SITE_DAILY_PLAN_LIMIT);
}
