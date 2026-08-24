/** 업로드 공통 규칙 */

export const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

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
