/** 업로드 공통 규칙 */

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB
/**
 * 브릿지 뉴스 PDF 상한. 소식지는 사진이 많아 수업자료보다 크다.
 * Supabase 무료 플랜의 파일당 상한(50MB)에 맞췄다.
 * 요청이 proxy 를 거치므로 next.config.ts 의 proxyClientMaxBodySize 도 이보다 커야 한다.
 */
export const MAX_NEWS_BYTES = 50 * 1024 * 1024; // 50MB
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

/** PDF 첫 페이지로 만든 표지 이미지 상한. 원본 PDF 보다 훨씬 작아야 한다. */
export const MAX_THUMB_BYTES = 3 * 1024 * 1024; // 3MB

/** Supabase Storage 버킷 이름. 라우트 파일에서 내보내면 Next 타입 검사에 걸려 여기에 둔다. */
export const PHOTOS_BUCKET = "photos";
export const NEWS_BUCKET = "news";

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

/** 브릿지 뉴스 본문 */
export const ALLOWED_PDF_TYPES = ["application/pdf"];

/** 업로드 화면이 만들어 보내는 표지 이미지 */
export const ALLOWED_THUMB_TYPES = ["image/jpeg", "image/png"];

/**
 * Storage 경로로 안전한 파일명을 만든다.
 * 한글·공백·특수문자가 섞인 원본 이름을 그대로 경로에 쓰면 접근이 깨질 수 있어
 * 확장자만 남기고 임의 이름을 붙인다. 원본 이름은 DB의 file_name 에 보관한다.
 */
export function buildStoragePath(prefix: string, originalName: string): string {
  const ext = originalName.includes(".")
    ? originalName.split(".").pop()!.toLowerCase().replace(/[^a-z0-9]/g, "")
    : "";
  const stamp = new Date().toISOString().slice(0, 10);
  const rand = crypto.randomUUID();
  return ext ? `${prefix}/${stamp}/${rand}.${ext}` : `${prefix}/${stamp}/${rand}`;
}

export interface FileCheckOptions {
  maxBytes: number;
  allowedTypes?: string[];
}

export function checkFile(
  file: File | null,
  { maxBytes, allowedTypes }: FileCheckOptions,
): string | null {
  if (!file || file.size === 0) return "파일을 선택해 주세요.";
  if (file.size > maxBytes) {
    return `파일이 너무 큽니다. ${Math.floor(maxBytes / 1024 / 1024)}MB 이하만 올릴 수 있습니다.`;
  }
  if (allowedTypes && !allowedTypes.includes(file.type)) {
    return "허용되지 않는 파일 형식입니다.";
  }
  return null;
}
