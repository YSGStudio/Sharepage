import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 지도안 생성 라우트 통합 테스트 (AC3, AC11).
 * 로그인 세션 없이 통과해야 한다 — 라우트가 인증을 요구하지 않음을 함께 확인한다.
 */

const generateLessonPlan = vi.fn();

// 홈페이지 전체 날짜별 카운터. 실제 api_rate_limits 행의 동작을 흉내낸다.
const counters = new Map<string, number>();
const SITE_DAILY_PLAN_LIMIT = 5;
let today = "2026-08-16";

const readSitePlanCount = vi.fn(async () => {
  const count = counters.get(today) ?? 0;
  return { allowed: count < SITE_DAILY_PLAN_LIMIT, count, limit: SITE_DAILY_PLAN_LIMIT };
});
const recordSitePlan = vi.fn(async () => {
  const count = (counters.get(today) ?? 0) + 1;
  counters.set(today, count);
  return { allowed: count <= SITE_DAILY_PLAN_LIMIT, count, limit: SITE_DAILY_PLAN_LIMIT };
});

vi.mock("@/lib/lesson-plan/generate", () => ({ generateLessonPlan }));
vi.mock("@/lib/lesson-plan/rate-limit", () => ({
  readSitePlanCount,
  recordSitePlan,
  SITE_DAILY_PLAN_LIMIT,
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
  today = "2026-08-16";
  generateLessonPlan.mockReset();
  generateLessonPlan.mockResolvedValue(SAMPLE_PLAN);
  readSitePlanCount.mockClear();
  recordSitePlan.mockClear();
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

describe("POST /api/lesson-plan/generate — 홈페이지 전체 하루 5개 (AC11)", () => {
  it("IP가 달라도 홈페이지 전체에서 5개까지만 만들고 6번째부터 429", async () => {
    for (let i = 1; i <= 5; i++) {
      const res = await POST(post(COMPLETE_BODY, `198.51.100.${i}`));
      expect(res.status, `${i}번째 요청`).toBe(200);
    }

    const res = await POST(post(COMPLETE_BODY, "198.51.100.99"));
    const json = await res.json();
    expect(res.status).toBe(429);
    expect(json.error).toMatch(/지도안 5개/);
    expect(json.error).toMatch(/자정/);
  });

  it("한도를 넘으면 생성 API를 호출하지 않는다", async () => {
    for (let i = 0; i < 5; i++) await POST(post(COMPLETE_BODY));
    generateLessonPlan.mockClear();

    const res = await POST(post(COMPLETE_BODY));
    expect(res.status).toBe(429);
    expect(generateLessonPlan).not.toHaveBeenCalled();
  });

  it("생성에 실패하면 개수를 쓰지 않는다", async () => {
    generateLessonPlan.mockRejectedValueOnce(new Error("OpenAI 오류"));
    expect((await POST(post(COMPLETE_BODY))).status).toBe(502);
    expect(recordSitePlan).not.toHaveBeenCalled();
  });

  it("날짜가 바뀌면 다시 5개를 만들 수 있다", async () => {
    for (let i = 0; i < 5; i++) await POST(post(COMPLETE_BODY));
    expect((await POST(post(COMPLETE_BODY))).status).toBe(429);
    today = "2026-08-17";
    expect((await POST(post(COMPLETE_BODY))).status).toBe(200);
  });

  it("입력 검증이 제한보다 먼저다 — 잘못된 요청은 개수를 쓰지 않는다", async () => {
    await POST(post({ ...COMPLETE_BODY, unit: "" }));
    expect(readSitePlanCount).not.toHaveBeenCalled();
    expect(recordSitePlan).not.toHaveBeenCalled();
  });
});
