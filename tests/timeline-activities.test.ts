import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth";
import type { Teacher, TimelineActivity } from "@/lib/supabase/types";
import {
  parseAssignees,
  validateActivityInput,
} from "@/lib/timeline-activity";
import { buildBoardColumns } from "@/lib/timeline-columns";

/**
 * 월별 추진활동 — 입력 검증, 보드 구성, 그리고 API 권한 경계 (R16 기준).
 * 등록·수정·삭제는 운영자만 할 수 있어야 한다.
 */

const getCurrentUser = vi.fn<() => Promise<CurrentUser | null>>();

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, getCurrentUser };
});

const dbResult = { data: null as unknown, error: null as { message: string } | null };

function chainable() {
  const chain: Record<string, unknown> = {};
  for (const method of [
    "select",
    "eq",
    "order",
    "limit",
    "insert",
    "update",
    "delete",
  ]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.maybeSingle = vi.fn(async () => dbResult);
  chain.single = vi.fn(async () => dbResult);
  chain.then = undefined;
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({ from: vi.fn(() => chainable()) }),
}));

function teacher(overrides: Partial<Teacher> = {}): Teacher {
  return {
    id: "user-1",
    name: "김교사",
    division: null,
    role: "teacher",
    status: "approved",
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

const ANON = null;
const PENDING: CurrentUser = {
  userId: "user-1",
  email: "p@example.com",
  teacher: teacher({ status: "pending" }),
};
const TEACHER: CurrentUser = {
  userId: "user-1",
  email: "t@example.com",
  teacher: teacher(),
};
const ADMIN: CurrentUser = {
  userId: "admin-1",
  email: "a@example.com",
  teacher: teacher({ id: "admin-1", role: "admin", name: "운영자" }),
};

const { POST: createActivity } = await import("@/app/api/timeline/route");
const { PATCH: patchActivity, DELETE: deleteActivity } = await import(
  "@/app/api/timeline/[id]/route"
);

const params = (id = "activity-1") => ({ params: Promise.resolve({ id }) });

function jsonRequest(body: unknown, method = "POST") {
  return new Request("http://localhost/api/timeline", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID = {
  year: 2026,
  month: 4,
  title: "[지원팀] 드라이브 구축",
  assignees: "손미현",
  status: "done",
};

beforeEach(() => {
  getCurrentUser.mockReset();
  dbResult.data = null;
  dbResult.error = null;
});

describe("입력 검증", () => {
  it("담당자 문자열을 이름 배열로 정리하고 빈값·중복을 버린다", () => {
    expect(parseAssignees(" 손미현 , 양승근,,손미현 ")).toEqual([
      "손미현",
      "양승근",
    ]);
    expect(parseAssignees(["추미정", " "])).toEqual(["추미정"]);
    expect(parseAssignees(undefined)).toEqual([]);
  });

  it("정상 입력은 통과한다", () => {
    const result = validateActivityInput({ ...VALID, note: " 4월 완료 " });
    expect(result).toEqual({
      value: {
        year: 2026,
        month: 4,
        title: "[지원팀] 드라이브 구축",
        assignees: ["손미현"],
        status: "done",
        note: "4월 완료",
      },
    });
  });

  it("상태를 생략하면 시작 전으로 둔다", () => {
    const result = validateActivityInput({ ...VALID, status: undefined });
    expect(result).toMatchObject({ value: { status: "not_started" } });
  });

  it.each([
    ["월이 범위를 벗어나면", { ...VALID, month: 13 }, /월은 1~12/],
    ["연도가 범위를 벗어나면", { ...VALID, year: 1990 }, /연도는/],
    ["제목이 비면", { ...VALID, title: "   " }, /활동 이름/],
    ["제목이 너무 길면", { ...VALID, title: "가".repeat(121) }, /120자/],
    ["상태가 목록 밖이면", { ...VALID, status: "보류" }, /상태는/],
    [
      "담당자가 너무 많으면",
      { ...VALID, assignees: Array.from({ length: 11 }, (_, i) => `교사${i}`) },
      /최대 10명/,
    ],
  ])("%s 거절한다", (_label, body, pattern) => {
    const result = validateActivityInput(body);
    expect(result).toHaveProperty("error");
    expect((result as { error: string }).error).toMatch(pattern);
  });
});

describe("보드 구성", () => {
  function activity(overrides: Partial<TimelineActivity>): TimelineActivity {
    return {
      id: "a1",
      year: 2026,
      month: 4,
      title: "활동",
      assignees: [],
      status: "not_started",
      note: null,
      sort_order: 1,
      created_by: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  it("연구 일정 12개월을 순서대로 만든다", () => {
    const columns = buildBoardColumns([]);
    expect(columns).toHaveLength(12);
    expect(columns[0]).toMatchObject({ year: 2026, month: 2, phase: "계획" });
    expect(columns.at(-1)).toMatchObject({ year: 2027, month: 1 });
  });

  it("등록된 활동을 해당 달에 넣고, 없는 달에는 기본 계획을 남긴다", () => {
    const columns = buildBoardColumns([activity({ id: "a1", month: 4 })]);
    const april = columns.find((c) => c.month === 4 && c.year === 2026);
    const may = columns.find((c) => c.month === 5 && c.year === 2026);

    expect(april?.activities.map((a) => a.id)).toEqual(["a1"]);
    expect(may?.activities).toEqual([]);
    expect(may?.plannedActivities.length).toBeGreaterThan(0);
  });

  it("연구 일정 밖의 달도 연·월 순서에 맞춰 열이 생긴다", () => {
    const columns = buildBoardColumns([
      activity({ id: "a2", year: 2027, month: 3 }),
      activity({ id: "a3", year: 2026, month: 1 }),
    ]);

    expect(columns).toHaveLength(14);
    expect(columns[0]).toMatchObject({ year: 2026, month: 1, phase: null });
    expect(columns.at(-1)).toMatchObject({ year: 2027, month: 3 });
  });
});

describe("활동 등록 — 운영자만", () => {
  it("비로그인은 401", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    const res = await createActivity(jsonRequest(VALID));
    expect(res.status).toBe(401);
  });

  it("승인 대기 교사는 403", async () => {
    getCurrentUser.mockResolvedValue(PENDING);
    const res = await createActivity(jsonRequest(VALID));
    expect(res.status).toBe(403);
  });

  it("일반 교사는 403 — 운영자 권한 필요", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    const res = await createActivity(jsonRequest(VALID));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/운영자 권한/);
  });

  it("운영자의 잘못된 입력은 400", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await createActivity(jsonRequest({ ...VALID, title: "" }));
    expect(res.status).toBe(400);
  });

  it("운영자는 등록에 성공한다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    dbResult.data = { id: "new-1" };
    const res = await createActivity(jsonRequest(VALID));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "new-1" });
  });
});

describe("활동 수정·삭제 — 운영자만", () => {
  it("비로그인 수정은 401", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    const res = await patchActivity(
      jsonRequest({ status: "done" }, "PATCH"),
      params(),
    );
    expect(res.status).toBe(401);
  });

  it("일반 교사 수정은 403", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    const res = await patchActivity(
      jsonRequest({ status: "done" }, "PATCH"),
      params(),
    );
    expect(res.status).toBe(403);
  });

  it("운영자의 잘못된 상태는 400", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await patchActivity(
      jsonRequest({ status: "보류" }, "PATCH"),
      params(),
    );
    expect(res.status).toBe(400);
  });

  it("없는 활동을 수정하면 404", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await patchActivity(
      jsonRequest({ status: "done" }, "PATCH"),
      params(),
    );
    expect(res.status).toBe(404);
  });

  it("운영자는 상태만 바꿀 수 있다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    dbResult.data = { id: "activity-1" };
    const res = await patchActivity(
      jsonRequest({ status: "in_progress" }, "PATCH"),
      params(),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("카드 전체 수정도 같은 규칙으로 검증한다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await patchActivity(
      jsonRequest({ ...VALID, month: 0 }, "PATCH"),
      params(),
    );
    expect(res.status).toBe(400);
  });

  it("일반 교사 삭제는 403, 운영자는 통과한다", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    const denied = await deleteActivity(new Request("http://localhost"), params());
    expect(denied.status).toBe(403);

    getCurrentUser.mockResolvedValue(ADMIN);
    const allowed = await deleteActivity(new Request("http://localhost"), params());
    expect(allowed.status).toBe(200);
  });
});
