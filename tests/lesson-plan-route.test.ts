import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 지도안 생성 라우트 통합 테스트 (AC3, AC11).
 * 로그인 세션 없이 통과해야 한다 — 라우트가 인증을 요구하지 않음을 함께 확인한다.
 */

const generateLessonPlan = vi.fn();

// IP + 날짜별 카운터. 실제 increment_rate_limit RPC 의 동작을 그대로 흉내낸다.
const counters = new Map<string, number>();
const DAILY_LIMIT = 5;

const consumeRateLimit = vi.fn(
  async (ip: string, date = "2026-08-16", limit = DAILY_LIMIT) => {
    const key = `${ip}|${date}`;
    const next = (counters.get(key) ?? 0) + 1;
    counters.set(key, next);
    return { allowed: next <= limit, count: next, limit };
  },
);

vi.mock("@/lib/lesson-plan/generate", () => ({ generateLessonPlan }));
vi.mock("@/lib/lesson-plan/rate-limit", () => ({
  consumeRateLimit,
  clientIpFrom: (headers: Headers) =>
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown",
  kstDateString: () => "2026-08-16",
  DAILY_LIMIT,
}));

const { POST } = await import("@/app/api/lesson-plan/generate/route");

const COMPLETE_BODY = {
  grade: "4학년",
  semester: "1학기",
  subject: "과학",
  unit: "2단원 물질의 성질",
  period: "3/6차시",
  achievementStandard: "[4과05-01] 물질의 성질을 설명할 수 있다.",
  goal: "물질의 성질에 따라 물체를 분류할 수 있다.",
  task: "교실 물체를 분류하고 기준 설명하기",
  evalCriteriaTop: "두 가지 이상 근거로 정확히 분류하고 설명할 수 있다.",
};

const SAMPLE_PLAN = `## 1쪽 — 개요면
[4학년 1학기 과학] 물질의 성질로 물체 나누기

## 2쪽 — 전개면
| BRIDGE 단계 | 교수·학습활동 | 자료 및 지도전략 |
| BR 문제 발견·인식 (7') | 동기 유발 | [자료] 실물 물체 |
| ID 해결방법 탐색·문제해결 (25') | 활동1 분류하기 | [평가] 분류 기준을 설명하는가? |
| GE 공유·성찰 (8') | 자기 평가하기 | 주도성 향상④ |

이 지도안은 AI가 만든 초안이며 교사의 검수가 필요합니다.`;

function post(body: unknown, ip = "203.0.113.1") {
  return new Request("http://localhost/api/lesson-plan/generate", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  counters.clear();
  generateLessonPlan.mockReset();
  generateLessonPlan.mockResolvedValue(SAMPLE_PLAN);
  consumeRateLimit.mockClear();
});

describe("POST /api/lesson-plan/generate — 입력 검증 (AC3)", () => {
  it("필수 항목이 하나라도 비면 400을 반환하고 생성 API를 호출하지 않는다", async () => {
    const res = await POST(post({ ...COMPLETE_BODY, goal: "" }));
    const json = await res.json();

    expect(res.status).toBe(400);
    expect(json.missing).toContain("goal");
    expect(json.error).toMatch(/학습목표/);
    expect(generateLessonPlan).not.toHaveBeenCalled();
  });

  it("빈 본문이면 400을 반환한다", async () => {
    const res = await POST(post({}));
    expect(res.status).toBe(400);
    expect(generateLessonPlan).not.toHaveBeenCalled();
  });

  it("JSON 이 아니면 400을 반환한다", async () => {
    const req = new Request("http://localhost/api/lesson-plan/generate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "not json",
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect(generateLessonPlan).not.toHaveBeenCalled();
  });

  it("필수 항목을 모두 채우면 200과 BR·ID·GE 3단계 지도안을 반환한다", async () => {
    const res = await POST(post(COMPLETE_BODY));
    const json = await res.json();

    expect(res.status).toBe(200);
    for (const stage of [
      "문제 발견·인식",
      "해결방법 탐색·문제해결",
      "공유·성찰",
    ]) {
      expect(json.content).toContain(stage);
    }
    expect(json.content).toContain("1쪽");
    expect(json.content).toContain("2쪽");
    expect(generateLessonPlan).toHaveBeenCalledTimes(1);
  });

  it("로그인 세션(쿠키) 없이도 200이 나온다 — 공개 라우트 (R8)", async () => {
    const req = post(COMPLETE_BODY);
    expect(req.headers.get("cookie")).toBeNull();
    const res = await POST(req);
    expect(res.status).toBe(200);
  });

  it("생성 실패 시 502를 반환한다", async () => {
    generateLessonPlan.mockRejectedValueOnce(new Error("OpenAI 오류"));
    const res = await POST(post(COMPLETE_BODY));
    expect(res.status).toBe(502);
  });
});

describe("POST /api/lesson-plan/generate — rate limit (AC11)", () => {
  it("같은 IP로 5회까지 허용하고 6번째부터 429를 반환한다", async () => {
    for (let i = 1; i <= 5; i++) {
      const res = await POST(post(COMPLETE_BODY, "198.51.100.9"));
      expect(res.status, `${i}번째 요청`).toBe(200);
    }

    const res = await POST(post(COMPLETE_BODY, "198.51.100.9"));
    const json = await res.json();
    expect(res.status).toBe(429);
    expect(json.error).toMatch(/하루 5회/);
    expect(json.error).toMatch(/자정/);
  });

  it("한도를 넘으면 생성 API를 호출하지 않는다", async () => {
    for (let i = 0; i < 5; i++) await POST(post(COMPLETE_BODY, "198.51.100.10"));
    generateLessonPlan.mockClear();

    const res = await POST(post(COMPLETE_BODY, "198.51.100.10"));
    expect(res.status).toBe(429);
    expect(generateLessonPlan).not.toHaveBeenCalled();
  });

  it("IP가 다르면 카운터를 따로 센다", async () => {
    for (let i = 0; i < 5; i++) await POST(post(COMPLETE_BODY, "198.51.100.11"));
    expect((await POST(post(COMPLETE_BODY, "198.51.100.11"))).status).toBe(429);
    expect((await POST(post(COMPLETE_BODY, "198.51.100.12"))).status).toBe(200);
  });

  it("날짜가 바뀌면 카운터가 초기화된다", async () => {
    const ip = "198.51.100.13";
    for (let i = 0; i < 5; i++) {
      await consumeRateLimit(ip, "2026-08-16");
    }
    // 같은 날 6번째는 거부
    expect((await consumeRateLimit(ip, "2026-08-16")).allowed).toBe(false);
    // 다음 날은 새 행이므로 다시 허용
    const nextDay = await consumeRateLimit(ip, "2026-08-17");
    expect(nextDay.allowed).toBe(true);
    expect(nextDay.count).toBe(1);
  });

  it("입력 검증이 rate limit보다 먼저다 — 잘못된 요청은 횟수를 소모하지 않는다", async () => {
    await POST(post({ ...COMPLETE_BODY, unit: "" }, "198.51.100.14"));
    expect(consumeRateLimit).not.toHaveBeenCalled();
  });
});
