/**
 * 지도안 생성 입력 검증 (R8, R9).
 *
 * 항목 구성은 elementary-lesson-plan 스킬의 "필수 입력" 표를 따른다
 * (`src/content/lesson-plan/SKILL.md`). 하나라도 비면 생성을 거부하고
 * 누락 항목을 그대로 돌려준다.
 * 네트워크나 DB에 의존하지 않는 순수 함수라 단위 테스트로 검증한다.
 */

export interface LessonPlanInput {
  /** 학년·학기·교과 */
  grade: string;
  semester: string;
  subject: string;
  /** 단원·차시 */
  unit: string;
  period: string;
  achievementStandard: string;
  goal: string;
  task: string;
  evalCriteriaTop: string;
  /** 선택 입력 */
  textbookPages?: string;
  classroom?: string;
  lessonDate?: string;
  competencies?: string;
  digitalTools?: string;
  duration?: string;
}

/**
 * 스킬이 "없으면 작성을 시작하지 말라"고 못박은 항목들.
 * 교과서 쪽수는 창의적 체험활동처럼 교과서가 없는 차시가 있어 선택으로 둔다.
 */
export const REQUIRED_FIELDS = [
  "grade",
  "semester",
  "subject",
  "unit",
  "period",
  "achievementStandard",
  "goal",
  "task",
  "evalCriteriaTop",
] as const;

export type RequiredField = (typeof REQUIRED_FIELDS)[number];

export const OPTIONAL_FIELDS = [
  "textbookPages",
  "classroom",
  "lessonDate",
  "competencies",
  "digitalTools",
  "duration",
] as const;

export type OptionalField = (typeof OPTIONAL_FIELDS)[number];

export const FIELD_LABELS: Record<keyof LessonPlanInput, string> = {
  grade: "학년",
  semester: "학기",
  subject: "교과",
  unit: "단원",
  period: "차시",
  achievementStandard: "성취기준",
  goal: "학습목표",
  task: "수행과제",
  evalCriteriaTop: "평가기준 '상'",
  textbookPages: "교과서 쪽수",
  classroom: "대상학급",
  lessonDate: "일시",
  competencies: "교과역량",
  digitalTools: "디지털 도구",
  duration: "수업시간",
};

/** 선택 입력 기본값 */
export const DEFAULT_DURATION = "40분";

export type ValidatedLessonPlanInput = Required<
  Pick<LessonPlanInput, RequiredField>
> &
  LessonPlanInput;

export type ValidationResult =
  | { ok: true; value: ValidatedLessonPlanInput }
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
      message: `다음 필수 항목이 비어 있습니다: ${labels}. ${REQUIRED_FIELDS.length}가지 필수 항목을 모두 입력해야 지도안을 만들 수 있습니다.`,
    };
  }

  const value = {} as ValidatedLessonPlanInput;
  for (const field of REQUIRED_FIELDS) {
    value[field] = asTrimmedString(body[field]);
  }
  for (const field of OPTIONAL_FIELDS) {
    value[field] = asTrimmedString(body[field]);
  }
  value.duration = value.duration || DEFAULT_DURATION;

  return { ok: true, value };
}
