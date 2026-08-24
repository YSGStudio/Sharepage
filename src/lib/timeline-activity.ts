import type { ActivityStatus } from "@/lib/supabase/types";

/**
 * 월별 추진활동 카드의 공통 규칙.
 * API 라우트(검증)와 화면(표시) 양쪽에서 같은 값을 쓰기 위해 한곳에 모은다.
 */

export const ACTIVITY_STATUSES = [
  "not_started",
  "in_progress",
  "done",
] as const satisfies readonly ActivityStatus[];

export const ACTIVITY_STATUS_LABELS: Record<ActivityStatus, string> = {
  not_started: "시작 전",
  in_progress: "진행 중",
  done: "완료",
};

export const MAX_TITLE_LENGTH = 120;
export const MAX_NOTE_LENGTH = 500;
export const MAX_ASSIGNEES = 10;
export const MAX_ASSIGNEE_LENGTH = 30;
export const MIN_YEAR = 2000;
export const MAX_YEAR = 2100;

export function isActivityStatus(value: unknown): value is ActivityStatus {
  return (
    typeof value === "string" &&
    (ACTIVITY_STATUSES as readonly string[]).includes(value)
  );
}

/** "손미현, 양승근" 또는 ["손미현","양승근"] 을 정규화한다. 중복·빈값은 버린다. */
export function parseAssignees(input: unknown): string[] {
  const raw = Array.isArray(input)
    ? input.map((v) => String(v))
    : String(input ?? "").split(",");

  const seen = new Set<string>();
  for (const item of raw) {
    const name = item.trim();
    if (name) seen.add(name);
  }
  return [...seen];
}

export interface ActivityInput {
  year: number;
  month: number;
  title: string;
  assignees: string[];
  status: ActivityStatus;
  note: string | null;
}

export type ValidationResult =
  | { value: ActivityInput }
  | { error: string };

/**
 * 등록·수정 요청 본문 검증. 화면에서 막히더라도 API 는 스스로 다시 확인한다.
 * `partial` 이면 넘어온 필드만 검사하고, 나머지는 기존 값을 유지하도록 undefined 로 둔다.
 */
export function validateActivityInput(raw: unknown): ValidationResult {
  const body = (raw ?? {}) as Record<string, unknown>;

  const year = Number(body.year);
  if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
    return { error: `연도는 ${MIN_YEAR}~${MAX_YEAR} 사이의 값이어야 합니다.` };
  }

  const month = Number(body.month);
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    return { error: "월은 1~12 사이의 값이어야 합니다." };
  }

  const title = String(body.title ?? "").trim();
  if (!title) return { error: "활동 이름을 입력해 주세요." };
  if (title.length > MAX_TITLE_LENGTH) {
    return { error: `활동 이름은 ${MAX_TITLE_LENGTH}자를 넘을 수 없습니다.` };
  }

  const assignees = parseAssignees(body.assignees);
  if (assignees.length > MAX_ASSIGNEES) {
    return { error: `담당자는 최대 ${MAX_ASSIGNEES}명까지 등록할 수 있습니다.` };
  }
  if (assignees.some((name) => name.length > MAX_ASSIGNEE_LENGTH)) {
    return { error: `담당자 이름은 ${MAX_ASSIGNEE_LENGTH}자를 넘을 수 없습니다.` };
  }

  const status = body.status ?? "not_started";
  if (!isActivityStatus(status)) {
    return { error: "상태는 시작 전·진행 중·완료 중 하나여야 합니다." };
  }

  const note = String(body.note ?? "").trim();
  if (note.length > MAX_NOTE_LENGTH) {
    return { error: `설명은 ${MAX_NOTE_LENGTH}자를 넘을 수 없습니다.` };
  }

  return {
    value: { year, month, title, assignees, status, note: note || null },
  };
}
