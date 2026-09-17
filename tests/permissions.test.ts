import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth";
import type { Teacher } from "@/lib/supabase/types";

/**
 * API 권한 경계 테스트 (AC7, AC8, AC12).
 *
 * 비로그인 / 승인대기 / 일반교사 / 운영자 네 주체를 각 쓰기 엔드포인트에 넣어
 * 누가 막히고 누가 통과하는지 확인한다.
 * RLS 는 DB 쪽 마지막 방어선이고, 여기서는 API 층의 판정을 검증한다.
 */

const getCurrentUser = vi.fn<() => Promise<CurrentUser | null>>();

vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, getCurrentUser };
});

// DB 접근은 권한 통과 이후에만 일어난다. 통과 여부만 보면 되므로 얕게 mock 한다.
const dbResult = { data: null as unknown, error: null as { message: string } | null };

function chainable() {
  const chain: Record<string, unknown> = {};
  for (const method of ["select", "eq", "order", "insert", "update", "delete"]) {
    chain[method] = vi.fn(() => chain);
  }
  chain.maybeSingle = vi.fn(async () => dbResult);
  chain.single = vi.fn(async () => dbResult);
  chain.then = undefined;
  return chain;
}

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    from: vi.fn(() => chainable()),
    storage: { from: vi.fn(() => ({ remove: vi.fn(async () => ({ error: null })) })) },
  }),
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
const REJECTED: CurrentUser = {
  userId: "user-1",
  email: "r@example.com",
  teacher: teacher({ status: "rejected" }),
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

const { DELETE: deleteMaterial } = await import(
  "@/app/api/materials/[id]/route"
);
const { DELETE: deletePhoto } = await import("@/app/api/photos/[id]/route");
const { DELETE: deleteNews } = await import("@/app/api/news/[id]/route");
const { PATCH: patchTestimonial } = await import(
  "@/app/api/testimonials/[id]/route"
);
const { PATCH: patchTeacher } = await import("@/app/api/teachers/[id]/route");
const { POST: saveLessonPlan } = await import(
  "@/app/api/lesson-plan/save/route"
);

const params = (id = "target-1") => ({ params: Promise.resolve({ id }) });

function jsonRequest(body: unknown) {
  return new Request("http://localhost/api/x", {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  getCurrentUser.mockReset();
  dbResult.data = null;
  dbResult.error = null;
});

describe("게시물 삭제 — 승인된 교사 누구나 (R16, AC7)", () => {
  const deletes = [
    ["수업자료", deleteMaterial],
    ["사진", deletePhoto],
    ["브릿지 뉴스", deleteNews],
  ] as const;

  describe.each(deletes)("%s", (_label, del) => {
    it("비로그인은 401", async () => {
      getCurrentUser.mockResolvedValue(ANON);
      const res = await del(new Request("http://localhost"), params());
      expect(res.status).toBe(401);
    });

    it("승인 대기 교사는 403", async () => {
      getCurrentUser.mockResolvedValue(PENDING);
      const res = await del(new Request("http://localhost"), params());
      expect(res.status).toBe(403);
      expect((await res.json()).error).toMatch(/승인 대기/);
    });

    it("거부된 계정은 403", async () => {
      getCurrentUser.mockResolvedValue(REJECTED);
      const res = await del(new Request("http://localhost"), params());
      expect(res.status).toBe(403);
    });

    it("승인된 일반 교사는 권한 검사를 통과한다", async () => {
      getCurrentUser.mockResolvedValue(TEACHER);
      const res = await del(new Request("http://localhost"), params());
      // 대상이 없으므로 404. 401/403 이 아니라는 것이 핵심이다.
      expect(res.status).toBe(404);
    });

    it("승인된 교사는 남이 올린 게시물도 삭제한다", async () => {
      getCurrentUser.mockResolvedValue(TEACHER);
      dbResult.data = {
        id: "target-1",
        uploader_id: "someone-else",
        file_path: "a.pdf",
        storage_path: "a.jpg",
        thumb_path: null,
      };
      const res = await del(new Request("http://localhost"), params());
      expect(res.status).toBe(200);
    });

    it("운영자도 통과한다", async () => {
      getCurrentUser.mockResolvedValue(ADMIN);
      const res = await del(new Request("http://localhost"), params());
      expect(res.status).toBe(404);
    });
  });
});

describe("소감 승인·거부 — 운영자만 (R17, AC8)", () => {
  it("비로그인은 401", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    const res = await patchTestimonial(
      jsonRequest({ status: "approved" }),
      params(),
    );
    expect(res.status).toBe(401);
  });

  it("일반 교사는 403", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    const res = await patchTestimonial(
      jsonRequest({ status: "approved" }),
      params(),
    );
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/운영자 권한/);
  });

  it("승인 대기 교사는 403", async () => {
    getCurrentUser.mockResolvedValue(PENDING);
    const res = await patchTestimonial(
      jsonRequest({ status: "approved" }),
      params(),
    );
    expect(res.status).toBe(403);
  });

  it("운영자는 통과하고, 잘못된 status 는 400으로 걸러진다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await patchTestimonial(
      jsonRequest({ status: "공개" }),
      params(),
    );
    expect(res.status).toBe(400);
  });
});

describe("교사 가입 승인 — 운영자만 (R23, AC13)", () => {
  it("일반 교사는 403", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    const res = await patchTeacher(jsonRequest({ status: "approved" }), params());
    expect(res.status).toBe(403);
  });

  it("비로그인은 401", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    const res = await patchTeacher(jsonRequest({ status: "approved" }), params());
    expect(res.status).toBe(401);
  });

  it("운영자가 본인 계정을 바꾸려 하면 400", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await patchTeacher(
      jsonRequest({ status: "rejected" }),
      params(ADMIN.userId),
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/본인 계정/);
  });

  it("운영자가 role 을 admin 으로 올리려 해도 status 만 반영된다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    dbResult.data = { id: "target-1", name: "김교사", status: "approved" };
    const res = await patchTeacher(
      jsonRequest({ status: "approved", role: "admin" }),
      params(),
    );
    expect(res.status).toBe(200);
    // 라우트는 role 을 읽지도 않는다 — 응답에 status 만 담긴다.
    expect(await res.json()).toEqual({ ok: true, status: "approved" });
  });
});

describe("지도안 저장 — 승인된 교사만 (R11, R22, AC12)", () => {
  const body = {
    content: "생성된 지도안",
    input: {
      grade: "4학년",
      semester: "1학기",
      subject: "과학",
      unit: "2단원 물질의 성질",
      period: "3/6차시",
      achievementStandard: "[4과05-01] …",
      goal: "분류할 수 있다",
      task: "분류하기",
      evalCriteriaTop: "정확히 분류한다",
    },
  };

  function postRequest(payload: unknown) {
    return new Request("http://localhost/api/lesson-plan/save", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  it("비로그인은 401", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    expect((await saveLessonPlan(postRequest(body))).status).toBe(401);
  });

  it("승인 대기 계정은 403 — 교사 전용 기능 차단 (R22)", async () => {
    getCurrentUser.mockResolvedValue(PENDING);
    const res = await saveLessonPlan(postRequest(body));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/승인 대기/);
  });

  it("거부된 계정은 403", async () => {
    getCurrentUser.mockResolvedValue(REJECTED);
    const res = await saveLessonPlan(postRequest(body));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/거부/);
  });

  it("승인된 일반 교사는 통과한다 — 저장은 운영자 전용이 아니다", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    dbResult.data = { id: "plan-1" };
    const res = await saveLessonPlan(postRequest(body));
    expect(res.status).toBe(201);
  });

  it("승인된 교사여도 필수 항목이 비면 400", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    const res = await saveLessonPlan(
      postRequest({ ...body, input: { ...body.input, goal: "" } }),
    );
    expect(res.status).toBe(400);
  });
});
