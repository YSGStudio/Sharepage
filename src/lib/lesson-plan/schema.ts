/**
 * 지도안 생성 입력 검증 (R8, R9).
 *
 * 필수 6항목 중 하나라도 비면 생성을 거부하고 누락 항목을 그대로 돌려준다.
 * 네트워크나 DB에 의존하지 않는 순수 함수라 단위 테스트로 검증한다.
 */

export interface LessonPlanInput {
  grade: string;
  subject: string;
  achievementStandard: string;
  goal: string;
  task: string;
  evalCriteriaTop: string;
  /** 선택 입력 */
  period?: string;
  digitalTools?: string;
  duration?: string;
}

export const REQUIRED_FIELDS = [
  "grade",
  "subject",
  "achievementStandard",
  "goal",
  "task",
  "evalCriteriaTop",
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

export const FIELD_LABELS: Record<keyof LessonPlanInput, string> = {
  grade: "학년",
  subject: "과목",
  achievementStandard: "성취기준",
  goal: "도달목표",
  task: "수행과제",
  evalCriteriaTop: "평가기준 '상'",
  period: "차시",
  digitalTools: "디지털 도구",
  duration: "수업시간",
};

/** 선택 입력 기본값 */
export const DEFAULT_DURATION = "40분";
export const DEFAULT_PERIOD = "본시";

export type ValidationResult =
  | { ok: true; value: Required<Pick<LessonPlanInput, RequiredField>> & LessonPlanInput }
  | { ok: false; missing: RequiredField[]; message: string };

function asTrimmedString(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/**
 * 임의의 요청 본문을 검증한다.
 * 실패 시 누락 필드 목록과 사람이 읽을 메시지를 함께 준다.
 */
export function validateLessonPlanInput(raw: unknown): ValidationResult {
  const body = (raw ?? {}) as Record<string, unknown>;

  const missing: RequiredField[] = [];
  for (const field of REQUIRED_FIELDS) {
    if (!asTrimmedString(body[field])) missing.push(field);
  }

  if (missing.length > 0) {
    const labels = missing.map((f) => FIELD_LABELS[f]).join(", ");
    return {
      ok: false,
      missing,
      message: `다음 필수 항목이 비어 있습니다: ${labels}. 6가지 필수 항목을 모두 입력해야 지도안을 만들 수 있습니다.`,
    };
  }

  return {
    ok: true,
    value: {
      grade: asTrimmedString(body.grade),
      subject: asTrimmedString(body.subject),
      achievementStandard: asTrimmedString(body.achievementStandard),
      goal: asTrimmedString(body.goal),
      task: asTrimmedString(body.task),
      evalCriteriaTop: asTrimmedString(body.evalCriteriaTop),
      period: asTrimmedString(body.period) || DEFAULT_PERIOD,
      digitalTools: asTrimmedString(body.digitalTools),
      duration: asTrimmedString(body.duration) || DEFAULT_DURATION,
    },
  };
}
