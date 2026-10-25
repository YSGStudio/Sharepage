import rawStandards from "@/content/lesson-plan/standards.json";

/**
 * 2022 개정 초등 3~6학년 성취기준 (성취기준 문장·해설·성취수준 상/중/하).
 *
 * 원본은 ClassDeck(class-deck-rho.vercel.app)에 실린 자료다.
 * 3~4학년 과학 3개(4과03-01~03)는 원본의 학년군이 3~5·3~6·3~7로
 * 잘못 들어가 있어 3~4로 바로잡았다.
 */

export interface AchievementStandard {
  /** "3~4" | "5~6" */
  gradeBand: string;
  subject: string;
  domain: string;
  /** "[4국01-01]" 처럼 대괄호까지 포함한다 */
  code: string;
  standard: string;
  levelHigh: string;
  levelMid: string;
  levelLow: string;
  explanation: string;
}

/** 채팅 화면의 성취기준 고르기에 쓰는 가벼운 형태. 해설·성취수준은 서버에서만 쓴다. */
export type StandardSummary = Pick<
  AchievementStandard,
  "gradeBand" | "subject" | "domain" | "code" | "standard" | "levelHigh"
>;

export const STANDARDS: AchievementStandard[] = rawStandards;

const BY_CODE = new Map(STANDARDS.map((s) => [s.code, s]));

export function findStandard(code: string): AchievementStandard | undefined {
  return BY_CODE.get(code.startsWith("[") ? code : `[${code}]`);
}

/** 글 속의 성취기준 코드를 등장 순서대로 중복 없이 뽑는다. 예: "[4과05-01]", "6수01-02" */
export function extractStandardCodes(text: string): string[] {
  const codes = new Set<string>();
  for (const match of text.matchAll(/\[?([46][가-힣]{1,2}\d{2}-\d{2})\]?/g)) {
    codes.add(`[${match[1]}]`);
  }
  return [...codes];
}

export function toSummary(s: AchievementStandard): StandardSummary {
  return {
    gradeBand: s.gradeBand,
    subject: s.subject,
    domain: s.domain,
    code: s.code,
    standard: s.standard,
    levelHigh: s.levelHigh,
  };
}

/** 시스템 프롬프트에 붙일 성취기준 자료 한 건 */
export function formatStandardForPrompt(s: AchievementStandard): string {
  const or = (v: string) => v.trim() || "(자료 없음)";
  return [
    `### ${s.code} ${s.standard}`,
    `- 학년군·교과·영역: ${s.gradeBand}학년 ${s.subject} / ${s.domain}`,
    `- 성취기준 해설: ${or(s.explanation)}`,
    `- 성취수준 상: ${or(s.levelHigh)}`,
    `- 성취수준 중: ${or(s.levelMid)}`,
    `- 성취수준 하: ${or(s.levelLow)}`,
  ].join("\n");
}
