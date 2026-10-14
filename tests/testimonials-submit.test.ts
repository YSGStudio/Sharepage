import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * 소감 제출 테스트 (R12, R13, AC5 전반부).
 * 로그인 없이 제출되지만 항상 status='pending' 으로 저장되어야 한다.
 */

const insert = vi.fn(async () => ({ error: null }));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    from: vi.fn(() => ({ insert })),
  }),
}));

const { POST } = await import("@/app/api/testimonials/route");

function submit(body: unknown) {
  return new Request("http://localhost/api/testimonials", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID = {
  authorType: "parent",
  authorName: "4학년 학부모",
  content: "아이가 수업에서 스스로 발표하는 모습을 처음 봤습니다.",
};

beforeEach(() => insert.mockClear());

describe("POST /api/testimonials", () => {
  it("로그인 없이 제출할 수 있다 (R12)", async () => {
    const req = submit(VALID);
    expect(req.headers.get("cookie")).toBeNull();
    const res = await POST(req);
    expect(res.status).toBe(201);
  });

  it("항상 status='pending' 으로 저장한다 — 즉시 공개되지 않는다 (R13)", async () => {
    await POST(submit(VALID));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending", reviewed_by: null }),
    );
  });

  it("클라이언트가 status='approved' 를 보내도 무시한다", async () => {
    await POST(submit({ ...VALID, status: "approved" }));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: "pending" }),
    );
  });

  it("이름을 비우면 익명(null)으로 저장한다", async () => {
    await POST(submit({ ...VALID, authorName: "  " }));
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ author_name: null }),
    );
  });

  it("내용이 비면 400", async () => {
    const res = await POST(submit({ ...VALID, content: "   " }));
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("교사도 소감을 남길 수 있다", async () => {
    const res = await POST(submit({ ...VALID, authorType: "teacher" }));
    expect(res.status).toBe(201);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ author_type: "teacher" }),
    );
  });

  it("작성자 구분이 잘못되면 400", async () => {
    const res = await POST(submit({ ...VALID, authorType: "principal" }));
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });

  it("2000자를 넘으면 400", async () => {
    const res = await POST(submit({ ...VALID, content: "가".repeat(2001) }));
    expect(res.status).toBe(400);
    expect(insert).not.toHaveBeenCalled();
  });
});
