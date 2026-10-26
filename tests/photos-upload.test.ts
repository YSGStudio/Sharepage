import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth";
import { isOwnStoragePath } from "@/lib/upload";

/**
 * 앨범 사진 직접 업로드 흐름.
 *
 * 사진은 브라우저 → Storage 로 바로 가고(서버 함수 4.5MB 제한 회피), 서버는
 * 업로드 주소 발급과 등록 때의 권한·한도·경로 확인만 맡는다.
 */

const getCurrentUser = vi.fn<() => Promise<CurrentUser | null>>();
vi.mock("@/lib/auth", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/auth")>();
  return { ...actual, getCurrentUser };
});

const storage = {
  createSignedUploadUrl: vi.fn(async (path: string) => ({
    data: { path, token: `token-for-${path}`, signedUrl: "https://x" },
    error: null,
  })),
  info: vi.fn(),
  remove: vi.fn(async () => ({ error: null })),
};
const insert = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    storage: { from: () => storage },
    from: () => ({
      insert: (row: unknown) => {
        insert(row);
        return { select: () => ({ single: async () => ({ data: { id: "photo-1" }, error: null }) }) };
      },
    }),
  }),
}));

const { POST: prepareUpload } = await import("@/app/api/photos/upload-url/route");
const { POST: registerPhoto } = await import("@/app/api/photos/route");

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
const PENDING: CurrentUser = {
  ...TEACHER,
  teacher: { ...TEACHER.teacher!, status: "pending" },
};

const MB = 1024 * 1024;
const PHOTO_PATH = "photos/2026-10-27/3f1c2b9a-1d2e-4f5a-9b8c-7d6e5f4a3b2c.jpg";

function post(body: unknown) {
  return new Request("http://localhost/api/photos", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUser.mockResolvedValue(TEACHER);
});

describe("업로드 주소 발급 POST /api/photos/upload-url", () => {
  const file = { name: "IMG_0001.HEIC.jpg", size: 8 * MB, type: "image/jpeg" };

  it("비로그인 401, 승인 대기 403", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await prepareUpload(post({ file }))).status).toBe(401);
    getCurrentUser.mockResolvedValue(PENDING);
    expect((await prepareUpload(post({ file }))).status).toBe(403);
    expect(storage.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("10MB 초과·이미지 아님은 400", async () => {
    expect((await prepareUpload(post({ file: { ...file, size: 11 * MB } }))).status).toBe(400);
    expect((await prepareUpload(post({ file: { ...file, type: "application/pdf" } }))).status).toBe(400);
  });

  it("4.5MB 를 넘는 8MB 사진에도 photos 폴더 주소를 내준다. 확장자는 형식으로 정한다", async () => {
    const res = await prepareUpload(post({ file: { ...file, type: "image/png" } }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(isOwnStoragePath("photos", json.path, "png")).toBe(true);
    expect(json.token).toBe(`token-for-${json.path}`);
  });
});

describe("등록 POST /api/photos", () => {
  const body = { storage_path: PHOTO_PATH, caption: " 수업 나눔 ", category: "common-1:1" };

  it("승인 대기 계정은 403", async () => {
    getCurrentUser.mockResolvedValue(PENDING);
    expect((await registerPhoto(post(body))).status).toBe(403);
  });

  it("형식이 다른 경로는 400 — 다른 파일을 등록할 수 없다", async () => {
    for (const storage_path of [
      "task-items/2026-10-27/3f1c2b9a-1d2e-4f5a-9b8c-7d6e5f4a3b2c.jpg",
      "photos/../news/x.jpg",
      PHOTO_PATH.replace(".jpg", ".pdf"),
    ]) {
      expect((await registerPhoto(post({ ...body, storage_path }))).status).toBe(400);
    }
    expect(storage.info).not.toHaveBeenCalled();
  });

  it("잘못된 분류는 400", async () => {
    expect((await registerPhoto(post({ ...body, category: "수업 나눔" }))).status).toBe(400);
  });

  it("실제로 올라간 파일이 한도를 넘으면 400 이고 파일을 지운다", async () => {
    storage.info.mockResolvedValueOnce({
      data: { size: 12 * MB, contentType: "image/jpeg" },
      error: null,
    });
    const res = await registerPhoto(post(body));
    expect(res.status).toBe(400);
    expect(storage.remove).toHaveBeenCalledWith([PHOTO_PATH]);
    expect(insert).not.toHaveBeenCalled();
  });

  it("정상 등록은 201", async () => {
    storage.info.mockResolvedValueOnce({
      data: { size: 8 * MB, contentType: "image/jpeg" },
      error: null,
    });
    const res = await registerPhoto(post(body));
    expect(res.status).toBe(201);
    expect(insert).toHaveBeenCalledWith({
      storage_path: PHOTO_PATH,
      caption: "수업 나눔",
      category: "common-1:1",
      uploader_id: "user-1",
    });
  });
});
