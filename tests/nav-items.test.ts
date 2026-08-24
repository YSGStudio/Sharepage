import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth";
import {
  groupNavRows,
  normalizeHref,
  toNavGroups,
  validateNavItem,
} from "@/lib/nav-item";
import type { NavItemRow, Teacher } from "@/lib/supabase/types";

/**
 * 탭 메뉴 편집 — 입력 검증, 묶음 구성, API 권한 경계 (R16 기준).
 * 이름 변경·순서 변경·삭제·추가는 모두 운영자만 할 수 있어야 한다.
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

const { POST: createNavItem } = await import("@/app/api/nav/route");
const { PATCH: patchNavItem, DELETE: deleteNavItem } = await import(
  "@/app/api/nav/[id]/route"
);
const { POST: reorderNavItems } = await import("@/app/api/nav/reorder/route");

const params = (id = "nav-1") => ({ params: Promise.resolve({ id }) });

function jsonRequest(body: unknown, method = "POST") {
  return new Request("http://localhost/api/nav", {
    method,
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID = { group_label: "연구 소개", label: "새 탭", href: "/about" };

beforeEach(() => {
  getCurrentUser.mockReset();
  dbResult.data = null;
  dbResult.error = null;
});

describe("주소 정규화", () => {
  it("내부 경로와 https 링크를 받는다", () => {
    expect(normalizeHref("/about")).toBe("/about");
    expect(normalizeHref("  /tasks/common-1  ")).toBe("/tasks/common-1");
    expect(normalizeHref("/about/")).toBe("/about");
    expect(normalizeHref("/")).toBe("/");
    expect(normalizeHref("https://school.example.com")).toBe(
      "https://school.example.com",
    );
  });

  it("상대 경로·공백·프로토콜 없는 외부 주소는 거절한다", () => {
    expect(normalizeHref("about")).toBeNull();
    expect(normalizeHref("/about page")).toBeNull();
    expect(normalizeHref("")).toBeNull();
    // `//evil.example.com` 은 외부로 나가는 주소다.
    expect(normalizeHref("//evil.example.com")).toBeNull();
  });
});

describe("탭 입력 검증", () => {
  it("정상 입력은 다듬어서 통과시킨다", () => {
    expect(
      validateNavItem({ group_label: " 도구 ", label: " 지도안 ", href: "/x/" }),
    ).toEqual({ value: { group_label: "도구", label: "지도안", href: "/x" } });
  });

  it.each([
    ["이름이 비면", { ...VALID, label: "  " }, /탭 이름/],
    ["이름이 너무 길면", { ...VALID, label: "가".repeat(31) }, /30자/],
    ["묶음이 비면", { ...VALID, group_label: "" }, /묶음 이름/],
    ["주소가 잘못되면", { ...VALID, href: "about" }, /주소는/],
  ])("%s 거절한다", (_label, body, pattern) => {
    const result = validateNavItem(body);
    expect(result).toHaveProperty("error");
    expect((result as { error: string }).error).toMatch(pattern);
  });
});

describe("묶음 구성", () => {
  function row(overrides: Partial<NavItemRow>): NavItemRow {
    return {
      id: "n1",
      group_label: "연구 소개",
      label: "연구 핵심소개",
      href: "/about",
      sort_order: 10,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides,
    };
  }

  it("정렬된 순서대로 묶음을 만든다", () => {
    const groups = toNavGroups([
      row({ id: "n1", group_label: "연구 소개", label: "핵심", href: "/about" }),
      row({ id: "n2", group_label: "연구 소개", label: "역할", href: "/roles" }),
      row({ id: "n3", group_label: "도구", label: "지도안", href: "/lesson-plan" }),
    ]);

    expect(groups.map((g) => g.label)).toEqual(["연구 소개", "도구"]);
    expect(groups[0].items.map((i) => i.label)).toEqual(["핵심", "역할"]);
  });

  it("떨어져 있던 같은 묶음의 탭은 먼저 나온 묶음으로 모인다", () => {
    const groups = groupNavRows([
      row({ id: "n1", group_label: "A", href: "/1" }),
      row({ id: "n2", group_label: "B", href: "/2" }),
      row({ id: "n3", group_label: "A", href: "/3" }),
    ]);

    expect(groups.map((g) => g.label)).toEqual(["A", "B"]);
    expect(groups[0].items.map((i) => i.id)).toEqual(["n1", "n3"]);
  });
});

describe("탭 추가 — 운영자만", () => {
  it("비로그인은 401", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    expect((await createNavItem(jsonRequest(VALID))).status).toBe(401);
  });

  it("일반 교사는 403", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    const res = await createNavItem(jsonRequest(VALID));
    expect(res.status).toBe(403);
    expect((await res.json()).error).toMatch(/운영자 권한/);
  });

  it("운영자의 잘못된 주소는 400", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await createNavItem(jsonRequest({ ...VALID, href: "about" }));
    expect(res.status).toBe(400);
  });

  it("운영자는 추가에 성공한다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    dbResult.data = { id: "nav-9" };
    const res = await createNavItem(jsonRequest(VALID));
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ id: "nav-9" });
  });
});

describe("탭 수정·삭제 — 운영자만", () => {
  it("비로그인 수정은 401, 일반 교사는 403", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    expect(
      (await patchNavItem(jsonRequest(VALID, "PATCH"), params())).status,
    ).toBe(401);

    getCurrentUser.mockResolvedValue(TEACHER);
    expect(
      (await patchNavItem(jsonRequest(VALID, "PATCH"), params())).status,
    ).toBe(403);
  });

  it("없는 탭을 수정하면 404", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await patchNavItem(jsonRequest(VALID, "PATCH"), params());
    expect(res.status).toBe(404);
  });

  it("운영자는 이름을 바꿀 수 있다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    dbResult.data = { id: "nav-1" };
    const res = await patchNavItem(
      jsonRequest({ ...VALID, label: "바뀐 이름" }, "PATCH"),
      params(),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });

  it("일반 교사 삭제는 403, 운영자는 통과한다", async () => {
    getCurrentUser.mockResolvedValue(TEACHER);
    expect(
      (await deleteNavItem(new Request("http://localhost"), params())).status,
    ).toBe(403);

    getCurrentUser.mockResolvedValue(ADMIN);
    expect(
      (await deleteNavItem(new Request("http://localhost"), params())).status,
    ).toBe(200);
  });
});

describe("탭 순서 변경 — 운영자만", () => {
  it("비로그인은 401, 일반 교사는 403", async () => {
    getCurrentUser.mockResolvedValue(ANON);
    expect((await reorderNavItems(jsonRequest({ ids: ["a"] }))).status).toBe(401);

    getCurrentUser.mockResolvedValue(TEACHER);
    expect((await reorderNavItems(jsonRequest({ ids: ["a"] }))).status).toBe(403);
  });

  it.each([
    ["목록이 비면", { ids: [] }],
    ["배열이 아니면", { ids: "a,b" }],
    ["id 가 중복되면", { ids: ["a", "a"] }],
    ["id 가 문자열이 아니면", { ids: [1, 2] }],
  ])("%s 400", async (_label, body) => {
    getCurrentUser.mockResolvedValue(ADMIN);
    expect((await reorderNavItems(jsonRequest(body))).status).toBe(400);
  });

  it("운영자가 보낸 순서대로 저장한다", async () => {
    getCurrentUser.mockResolvedValue(ADMIN);
    const res = await reorderNavItems(jsonRequest({ ids: ["a", "b", "c"] }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, count: 3 });
  });
});
