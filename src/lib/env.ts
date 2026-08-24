/**
 * 환경변수 접근 헬퍼.
 * 서버 전용 값(SERVICE_ROLE, OPENAI)은 반드시 이 모듈의 서버 함수로만 읽는다.
 */

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `환경변수 ${name}가 설정되지 않았습니다. .env.local 파일을 확인하세요.`,
    );
  }
  return value;
}

export function supabaseUrl(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}

export function supabaseAnonKey(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

export function supabaseServiceRoleKey(): string {
  return required(
    "SUPABASE_SERVICE_ROLE_KEY",
    process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function openAiApiKey(): string {
  return required("OPENAI_API_KEY", process.env.OPENAI_API_KEY);
}

export function openAiModel(): string {
  return process.env.OPENAI_MODEL || "gpt-4o";
}
