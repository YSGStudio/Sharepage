import type { LessonPlanInput } from "./schema";
import { FORMAT_SPEC_DOC, PHRASEBANK_DOC, SKILL_DOC } from "./skill";

/**
 * BRIDGE 지도안 생성 시스템 프롬프트 (R10).
 *
 * 사양은 elementary-lesson-plan 스킬 문서 세 개가 그대로 원본이다
 * (`src/content/lesson-plan/`). 여기서는 문서를 붙이고, 채팅이 아니라
 * 웹 폼에서 쓰이기 때문에 달라지는 부분만 앞에 덧붙인다.
 */

/** 스킬 문서를 웹 생성기에 맞게 조정하는 부분 */
const WEB_ADAPTATION = `당신은 언남초등학교 BRIDGE 프로젝트 모형 기반 초등 교수·학습과정안을 쓰는 교육과정 전문가입니다.
아래 세 문서(SKILL / FORMAT-SPEC / PHRASEBANK)가 작성 사양이며, 그 규칙을 그대로 따릅니다.

## 이 화면에서만 다른 점

- 필수 입력은 이미 웹 폼에서 모두 받았습니다. **되묻지 말고 곧바로 작성합니다.**
  입력이 비어 있으면 폼에서 막히므로, 사용자에게 질문하는 문장을 쓰지 않습니다.
- 파일(.hwp/.docx/.pdf)을 만들지 않습니다. **마크다운 텍스트만** 출력합니다.
- 1쪽 개요면과 2쪽 전개면을 **항상 함께** 출력합니다. 1쪽만 쓰고 끝내지 않습니다.
- 표는 교사가 한글 표에 옮겨 붙일 수 있도록 마크다운 표로 그립니다.
  2쪽 전개면은 \`| BRIDGE 단계 | 교수·학습활동 | 자료 및 지도전략 |\` 3열 표로 만들고,
  칸 안의 줄바꿈은 \`<br>\` 로 표시합니다.
- 교사가 주지 않은 선택 입력을 채울 때는 스킬 규칙대로 "(제안)" 을 붙입니다.
- 마지막 줄에 이 지도안이 AI가 만든 초안이며 교사의 검수·수정이 필요하다는 안내를 한 문장 넣습니다.
- 한국어로 작성합니다.`;

/** 스킬 문서 세 개. 폼 생성기와 채팅이 함께 쓴다. */
export const SKILL_DOCS_SECTION = `===== SKILL =====

${SKILL_DOC}

===== FORMAT-SPEC (칸별 작성 규칙·분량) =====

${FORMAT_SPEC_DOC}

===== PHRASEBANK (도구·문형) =====

${PHRASEBANK_DOC}`;

export const LESSON_PLAN_SYSTEM_PROMPT = `${WEB_ADAPTATION}

${SKILL_DOCS_SECTION}`;

/** 값이 있는 항목만 `이름: 값` 줄로 만든다. */
function line(label: string, value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? `${label}: ${trimmed}` : null;
}

/** 교사 입력을 사용자 메시지로 조립한다. */
export function buildUserPrompt(input: LessonPlanInput): string {
  const required = [
    `학년·학기·교과: ${input.grade} ${input.semester} ${input.subject}`,
    `단원: ${input.unit}`,
    `차시: ${input.period}`,
    `성취기준(2022 개정): ${input.achievementStandard}`,
    `학습목표: ${input.goal}`,
    `수행과제: ${input.task}`,
    `평가기준 '상': ${input.evalCriteriaTop}`,
  ];

  const optional = [
    line("교과서 쪽수", input.textbookPages),
    line("대상학급", input.classroom),
    line("일시", input.lessonDate),
    line("교과역량", input.competencies),
    line("수업시간", input.duration),
  ].filter((l): l is string => l !== null);

  optional.push(
    input.digitalTools?.trim()
      ? `활용할 디지털 도구: ${input.digitalTools.trim()}`
      : "활용할 디지털 도구: 지정 없음 (PHRASEBANK 의 도구 목록에서 차시에 맞는 1~3개를 골라 '(제안)' 표시와 함께 제안할 것)",
  );

  return [
    "아래 조건으로 BRIDGE 교수·학습과정안 1쪽(개요면)과 2쪽(전개면)을 작성해 주세요.",
    "",
    "## 교사가 제시한 필수 입력 (그대로 반영할 것)",
    ...required,
    "",
    "## 선택 입력",
    ...optional,
  ].join("\n");
}
