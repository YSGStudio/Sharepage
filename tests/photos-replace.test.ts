import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth";

/**
 * 앨범 사진 교체 PATCH /api/photos/[id] { storage_path }.
 *
 * 새 파일은 브라우저가 Storage 에 미리 올리고 경로만 보낸다. 서버는 경로 형식과
 * 실제 파일을 확인한 뒤 경로를 바꾸고, 바뀐 뒤에만 예전 파일을 지운다.
 */

const getCurrentUser = vi.fn<() => Promise<CurrentUser | null>>();
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, getCurrentUser };
});

const storage = {
  info: vi.fn(),
  remove: vi.fn(async () => ({ error: null })),
};
const update = vi.fn();
let current: { storage_path: string } | null;
let updated: { id: string } | null;

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    storage: { from: () => storage },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: current, error: null }) }) }),
      update: (row: unknown) => {
        update(row);
        return {
          eq: () => ({ select: () => ({ maybeSingle: async () => ({ data: updated, error: null }) }) }),
        };
      },
    }),
  }),
}));

const { PATCH } = await import("@/app/api/photos/[id]/route");

const TEACHER: CurrentUser = {
  userId: "user-1",
  email: "t@example.com",
  teacher: {
    id: "user-1",
    name: "김교사",
    division: null,
    role: "teacher",
    status: "approved",
    created_at: new Date().toISOString(),
  },
};

const MB = 1024 * 1024;
const OLD_PATH = "photos/2026-10-01/11111111-1111-4111-8111-111111111111.jpg";
const NEW_PATH = "photos/2026-10-28/3f1c2b9a-1d2e-4f5a-9b8c-7d6e5f4a3b2c.png";

function patch(body: unknown) {
  return PATCH(
    new Request("http://localhost/api/photos/photo-1", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    }),
    { params: Promise.resolve({ id: "photo-1" }) },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUser.mockResolvedValue(TEACHER);
  current = { storage_path: OLD_PATH };
  updated = { id: "photo-1" };
});

describe("사진 교체 PATCH /api/photos/[id]", () => {
  it("승인 대기 계정은 403", async () => {
    getCurrentUser.mockResolvedValue({
      ...TEACHER,
      teacher: { ...TEACHER.teacher!, status: "pending" },
    });
    expect((await patch({ storage_path: NEW_PATH })).status).toBe(403);
    expect(update).not.toHaveBeenCalled();
  });

  it("형식이 다른 경로는 400 — 다른 파일로 바꿀 수 없다", async () => {
    for (const storage_path of [
      OLD_PATH.replace("photos/", "task-items/"),
      "photos/../news/x.jpg",
      NEW_PATH.replace(".png", ".pdf"),
    ]) {
      expect((await patch({ storage_path })).status).toBe(400);
    }
    expect(storage.info).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("올라간 파일이 한도를 넘으면 400 이고 새 파일만 지운다", async () => {
    storage.info.mockResolvedValueOnce({
      data: { size: 12 * MB, contentType: "image/png" },
      error: null,
    });
    expect((await patch({ storage_path: NEW_PATH })).status).toBe(400);
    expect(storage.remove).toHaveBeenCalledWith([NEW_PATH]);
    expect(storage.remove).not.toHaveBeenCalledWith([OLD_PATH]);
    expect(update).not.toHaveBeenCalled();
  });

  it("없는 사진이면 404 이고 새 파일을 지운다", async () => {
    current = null;
    expect((await patch({ storage_path: NEW_PATH })).status).toBe(404);
    expect(storage.remove).toHaveBeenCalledWith([NEW_PATH]);
  });

  it("정상 교체는 경로를 바꾸고 예전 파일을 지운다", async () => {
    storage.info.mockResolvedValueOnce({
      data: { size: 8 * MB, contentType: "image/png" },
      error: null,
    });
    expect((await patch({ storage_path: NEW_PATH })).status).toBe(200);
    expect(update).toHaveBeenCalledWith({ storage_path: NEW_PATH });
    expect(storage.remove).toHaveBeenCalledTimes(1);
    expect(storage.remove).toHaveBeenCalledWith([OLD_PATH]);
  });

  it("경로 갱신이 0행이면 404 이고 예전 파일은 남긴다", async () => {
    storage.info.mockResolvedValueOnce({
      data: { size: 1 * MB, contentType: "image/png" },
      error: null,
    });
    updated = null;
    expect((await patch({ storage_path: NEW_PATH })).status).toBe(404);
    expect(storage.remove).toHaveBeenCalledWith([NEW_PATH]);
    expect(storage.remove).not.toHaveBeenCalledWith([OLD_PATH]);
  });
});
