import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CurrentUser } from "@/lib/auth";
import { isOwnStoragePath } from "@/lib/upload";

/**
 * 브릿지 뉴스 직접 업로드 흐름.
 *
 * 파일은 브라우저 → Storage 로 바로 가고(서버 함수 413 회피), 서버는
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
const adminRemove = vi.fn<(paths: string[]) => Promise<{ error: null }>>(async () => ({ error: null }));
const insert = vi.fn();

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: async () => ({
    storage: { from: () => storage },
    from: () => ({
      insert: (row: unknown) => {
        insert(row);
        return { select: () => ({ single: async () => ({ data: { id: "news-1" }, error: null }) }) };
      },
    }),
  }),
}));
vi.mock("@/lib/supabase/admin", () => ({
  createSupabaseAdminClient: () => ({ storage: { from: () => ({ remove: adminRemove }) } }),
}));

const { POST: prepareUpload } = await import("@/app/api/news/upload-url/route");
const { POST: registerNews } = await import("@/app/api/news/route");

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
const PDF_PATH = "news/2026-09-17/3f1c2b9a-1d2e-4f5a-9b8c-7d6e5f4a3b2c.pdf";
const THUMB_PATH = "news/covers/2026-09-17/aa1c2b9a-1d2e-4f5a-9b8c-7d6e5f4a3b2c.jpg";

function post(body: unknown) {
  return new Request("http://localhost/api/news", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  getCurrentUser.mockResolvedValue(TEACHER);
});

describe("isOwnStoragePath", () => {
  it("buildStoragePath 형식만 통과시킨다", () => {
    expect(isOwnStoragePath("news", PDF_PATH, "pdf")).toBe(true);
    expect(isOwnStoragePath("news/covers", THUMB_PATH, "jpg")).toBe(true);
    expect(isOwnStoragePath("news", "news/../photos/x.pdf", "pdf")).toBe(false);
    expect(isOwnStoragePath("news", "materials/2026-09-17/a.pdf", "pdf")).toBe(false);
    expect(isOwnStoragePath("news", PDF_PATH.replace(".pdf", ".exe"), "pdf")).toBe(false);
    // 표지 폴더 경로를 본문 PDF 자리에 넣을 수 없다.
    expect(isOwnStoragePath("news", THUMB_PATH.replace(".jpg", ".pdf"), "pdf")).toBe(false);
  });
});

describe("업로드 주소 발급 POST /api/news/upload-url", () => {
  const pdf = { name: "소식지.pdf", size: 30 * MB, type: "application/pdf" };

  it("비로그인 401, 승인 대기 403", async () => {
    getCurrentUser.mockResolvedValue(null);
    expect((await prepareUpload(post({ pdf }))).status).toBe(401);
    getCurrentUser.mockResolvedValue(PENDING);
    expect((await prepareUpload(post({ pdf }))).status).toBe(403);
    expect(storage.createSignedUploadUrl).not.toHaveBeenCalled();
  });

  it("50MB 초과·PDF 아님은 400", async () => {
    expect((await prepareUpload(post({ pdf: { ...pdf, size: 51 * MB } }))).status).toBe(400);
    expect((await prepareUpload(post({ pdf: { ...pdf, type: "image/png" } }))).status).toBe(400);
  });

  it("30MB PDF 와 표지에 news 폴더 경로의 주소를 내준다", async () => {
    const res = await prepareUpload(post({ pdf, thumb: { size: 200_000, type: "image/jpeg" } }));
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(isOwnStoragePath("news", json.pdf.path, "pdf")).toBe(true);
    expect(isOwnStoragePath("news/covers", json.thumb.path, "jpg")).toBe(true);
    expect(json.pdf.token).toBe(`token-for-${json.pdf.path}`);
  });
});

describe("등록 POST /api/news", () => {
  const body = {
    title: "BRIDGE 뉴스 3월호",
    file_path: PDF_PATH,
    file_name: "소식지.pdf",
    thumb_path: THUMB_PATH,
  };

  it("승인 대기 계정은 403", async () => {
    getCurrentUser.mockResolvedValue(PENDING);
    expect((await registerNews(post(body))).status).toBe(403);
  });

  it("형식이 다른 경로는 400 — 다른 파일을 등록할 수 없다", async () => {
    const res = await registerNews(post({ ...body, file_path: "photos/x.pdf" }));
    expect(res.status).toBe(400);
    expect(storage.info).not.toHaveBeenCalled();
  });

  it("실제로 올라간 파일이 한도를 넘으면 400 이고 파일을 지운다", async () => {
    storage.info.mockResolvedValueOnce({
      data: { size: 60 * MB, contentType: "application/pdf" },
      error: null,
    });
    const res = await registerNews(post(body));
    expect(res.status).toBe(400);
    expect(adminRemove).toHaveBeenCalledWith([PDF_PATH]);
    expect(insert).not.toHaveBeenCalled();
  });

  it("정상 등록은 201, 너무 큰 표지는 버리고 표지 없이 등록한다", async () => {
    storage.info
      .mockResolvedValueOnce({ data: { size: 30 * MB, contentType: "application/pdf" }, error: null })
      .mockResolvedValueOnce({ data: { size: 5 * MB, contentType: "image/jpeg" }, error: null });
    const res = await registerNews(post(body));
    expect(res.status).toBe(201);
    expect(adminRemove).toHaveBeenCalledWith([THUMB_PATH]);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({ file_path: PDF_PATH, thumb_path: null, uploader_id: "user-1" }),
    );
  });
});
